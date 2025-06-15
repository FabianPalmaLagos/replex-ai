import { Pool } from 'pg';
import { 
  User, 
  UserResponse, 
  CreateUserData, 
  UpdateUserData, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  ResetPasswordData 
} from '../models/User';
import { RefreshToken, CreateRefreshTokenData } from '../models/RefreshToken';
import { TokenService } from './tokenService';
import { EmailService } from './emailService';
import { hashPassword, verifyPassword, generateEmailVerificationToken, generatePasswordResetToken, getTokenExpiration, isTokenExpired } from '../utils/crypto';
import { logger } from '../utils/logger';

export class AuthService {
  private db: Pool;
  private tokenService: TokenService;
  private emailService: EmailService;

  constructor(db: Pool) {
    this.db = db;
    this.tokenService = new TokenService();
    this.emailService = new EmailService();
  }

  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Verificar si el email ya existe
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('El email ya está registrado');
      }

      // Hashear contraseña
      const passwordHash = await hashPassword(data.password);
      
      // Generar token de verificación
      const emailVerificationToken = generateEmailVerificationToken();

      // Crear usuario
      const userResult = await client.query(`
        INSERT INTO users (email, password_hash, name, email_verification_token)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, role, email_verified, created_at, updated_at
      `, [
        data.email.toLowerCase(),
        passwordHash,
        data.name,
        emailVerificationToken
      ]);

      const user = userResult.rows[0];

      // Generar tokens
      const accessToken = this.tokenService.generateAccessToken(user);
      const refreshTokenData = this.tokenService.createRefreshTokenData(user.id);

      // Guardar refresh token
      await client.query(`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [refreshTokenData.user_id, refreshTokenData.token, refreshTokenData.expires_at]);

      await client.query('COMMIT');

      // Enviar email de verificación (no bloquear el registro)
      this.emailService.sendEmailVerification(user.email, user.name, emailVerificationToken)
        .catch(error => {
          logger.error('Error enviando email de verificación:', error);
        });

      logger.info(`Usuario registrado: ${user.email}`, { userId: user.id });

      return {
        user: this.formatUserResponse(user),
        accessToken,
        refreshToken: refreshTokenData.token
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Inicia sesión de usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const client = await this.db.connect();

    try {
      // Buscar usuario por email
      const userResult = await client.query(
        'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
        [credentials.email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Credenciales inválidas');
      }

      const user = userResult.rows[0];

      // Verificar contraseña
      const isValidPassword = await verifyPassword(credentials.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      // Actualizar último login
      await client.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Revocar tokens existentes (opcional, para mayor seguridad)
      await client.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
        [user.id]
      );

      // Generar nuevos tokens
      const accessToken = this.tokenService.generateAccessToken(user);
      const refreshTokenData = this.tokenService.createRefreshTokenData(user.id);

      // Guardar nuevo refresh token
      await client.query(`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [refreshTokenData.user_id, refreshTokenData.token, refreshTokenData.expires_at]);

      logger.info(`Usuario logueado: ${user.email}`, { userId: user.id });

      return {
        user: this.formatUserResponse(user),
        accessToken,
        refreshToken: refreshTokenData.token
      };

    } finally {
      client.release();
    }
  }

  /**
   * Refresca el access token usando un refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const client = await this.db.connect();

    try {
      // Buscar refresh token
      const tokenResult = await client.query(`
        SELECT rt.*, u.id, u.email, u.name, u.role 
        FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.id
        WHERE rt.token = $1 AND rt.is_revoked = false AND rt.expires_at > NOW()
      `, [refreshToken]);

      if (tokenResult.rows.length === 0) {
        throw new Error('Refresh token inválido o expirado');
      }

      const tokenData = tokenResult.rows[0];
      const user = {
        id: tokenData.id,
        email: tokenData.email,
        name: tokenData.name,
        role: tokenData.role
      };

      // Revocar el token actual
      await client.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
        [refreshToken]
      );

      // Generar nuevos tokens
      const newAccessToken = this.tokenService.generateAccessToken(user);
      const newRefreshTokenData = this.tokenService.createRefreshTokenData(user.id);

      // Guardar nuevo refresh token
      await client.query(`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [newRefreshTokenData.user_id, newRefreshTokenData.token, newRefreshTokenData.expires_at]);

      logger.info(`Token refrescado para usuario: ${user.email}`, { userId: user.id });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenData.token
      };

    } finally {
      client.release();
    }
  }

  /**
   * Cierra sesión revocando el refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
        [refreshToken]
      );

      logger.info('Usuario deslogueado');
    } finally {
      client.release();
    }
  }

  /**
   * Verifica email de usuario
   */
  async verifyEmail(token: string): Promise<UserResponse> {
    const client = await this.db.connect();

    try {
      const userResult = await client.query(
        'SELECT * FROM users WHERE email_verification_token = $1',
        [token]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Token de verificación inválido');
      }

      const user = userResult.rows[0];

      if (user.email_verified) {
        throw new Error('Email ya verificado');
      }

      // Marcar email como verificado
      const updatedUserResult = await client.query(`
        UPDATE users 
        SET email_verified = true, email_verification_token = NULL, updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, name, role, email_verified, last_login, created_at, updated_at
      `, [user.id]);

      const updatedUser = updatedUserResult.rows[0];

      // Enviar email de bienvenida
      this.emailService.sendWelcomeEmail(updatedUser.email, updatedUser.name)
        .catch(error => {
          logger.error('Error enviando email de bienvenida:', error);
        });

      logger.info(`Email verificado para usuario: ${updatedUser.email}`, { userId: updatedUser.id });

      return this.formatUserResponse(updatedUser);

    } finally {
      client.release();
    }
  }

  /**
   * Solicita reset de contraseña
   */
  async forgotPassword(email: string): Promise<void> {
    const client = await this.db.connect();

    try {
      const userResult = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        // No revelar si el email existe o no por seguridad
        logger.info(`Intento de reset para email no existente: ${email}`);
        return;
      }

      const user = userResult.rows[0];
      const resetToken = generatePasswordResetToken();
      const expiresAt = getTokenExpiration(1); // 1 hora

      // Guardar token de reset
      await client.query(`
        UPDATE users 
        SET password_reset_token = $1, password_reset_expires = $2, updated_at = NOW()
        WHERE id = $3
      `, [resetToken, expiresAt, user.id]);

      // Enviar email de reset
      await this.emailService.sendPasswordReset(user.email, user.name, resetToken);

      logger.info(`Reset de contraseña solicitado para: ${user.email}`, { userId: user.id });

    } finally {
      client.release();
    }
  }

  /**
   * Restablece contraseña usando token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    const client = await this.db.connect();

    try {
      const userResult = await client.query(
        'SELECT * FROM users WHERE password_reset_token = $1',
        [data.token]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Token de reset inválido');
      }

      const user = userResult.rows[0];

      if (!user.password_reset_expires || isTokenExpired(user.password_reset_expires)) {
        throw new Error('Token de reset expirado');
      }

      // Hashear nueva contraseña
      const newPasswordHash = await hashPassword(data.newPassword);

      // Actualizar contraseña y limpiar tokens de reset
      await client.query(`
        UPDATE users 
        SET password_hash = $1, 
            password_reset_token = NULL, 
            password_reset_expires = NULL,
            updated_at = NOW()
        WHERE id = $2
      `, [newPasswordHash, user.id]);

      // Revocar todos los refresh tokens por seguridad
      await client.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
        [user.id]
      );

      logger.info(`Contraseña restablecida para usuario: ${user.email}`, { userId: user.id });

    } finally {
      client.release();
    }
  }

  /**
   * Obtiene información del usuario por ID
   */
  async getUserById(userId: string): Promise<UserResponse | null> {
    const client = await this.db.connect();

    try {
      const userResult = await client.query(
        'SELECT id, email, name, role, email_verified, last_login, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return null;
      }

      return this.formatUserResponse(userResult.rows[0]);

    } finally {
      client.release();
    }
  }

  /**
   * Formatea la respuesta del usuario removiendo datos sensibles
   */
  private formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      email_verified: user.email_verified,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
} 