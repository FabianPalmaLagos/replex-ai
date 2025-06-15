import jwt from 'jsonwebtoken';
import { User, UserResponse } from '../models/User';
import { RefreshToken, CreateRefreshTokenData } from '../models/RefreshToken';
import { generateSecureToken, getTokenExpiration } from '../utils/crypto';
import { logger } from '../utils/logger';

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class TokenService {
  /**
   * Genera un access token JWT
   */
  generateAccessToken(user: User | UserResponse): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'replex-ai',
      audience: 'replex-ai-users'
    });
  }

  /**
   * Genera un refresh token
   */
  generateRefreshToken(): string {
    return generateSecureToken(64);
  }

  /**
   * Verifica y decodifica un access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'replex-ai',
        audience: 'replex-ai-users'
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      } else {
        throw new Error('Error verificando token');
      }
    }
  }

  /**
   * Decodifica un token sin verificar (para debugging)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      logger.error('Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Calcula la fecha de expiración para refresh tokens
   */
  getRefreshTokenExpiration(): Date {
    // Convertir JWT_REFRESH_EXPIRES_IN a horas
    const expiresIn = JWT_REFRESH_EXPIRES_IN;
    let hours = 24 * 7; // Default: 7 días

    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.slice(0, -1));
      hours = days * 24;
    } else if (expiresIn.endsWith('h')) {
      hours = parseInt(expiresIn.slice(0, -1));
    } else if (expiresIn.endsWith('m')) {
      const minutes = parseInt(expiresIn.slice(0, -1));
      hours = minutes / 60;
    }

    return getTokenExpiration(hours);
  }

  /**
   * Crea los datos para un refresh token
   */
  createRefreshTokenData(userId: string): CreateRefreshTokenData {
    return {
      user_id: userId,
      token: this.generateRefreshToken(),
      expires_at: this.getRefreshTokenExpiration()
    };
  }

  /**
   * Extrae el token del header Authorization
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Verifica si un token está próximo a expirar (dentro de 5 minutos)
   */
  isTokenNearExpiry(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      
      // Si expira en menos de 5 minutos (300 segundos)
      return timeUntilExpiry < 300;
    } catch (error) {
      return true;
    }
  }
} 