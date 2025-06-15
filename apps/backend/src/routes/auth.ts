import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { AuthService } from '../services/authService';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  verifyEmailSchema 
} from '../schemas/authSchemas';
import { 
  validateBody, 
  validateParams, 
  sanitizeInput,
  tokenParamSchema 
} from '../middleware/validation';
import { 
  authLimiter, 
  registerLimiter, 
  passwordResetLimiter,
  emailVerificationLimiter 
} from '../middleware/rateLimiter';
import { AuthMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export function createAuthRoutes(db: Pool): Router {
  const router = Router();
  const authService = new AuthService(db);
  const authMiddleware = new AuthMiddleware(db);

  // Aplicar sanitización a todas las rutas
  router.use(sanitizeInput);

  /**
   * POST /api/v1/auth/register
   * Registra un nuevo usuario
   */
  router.post('/register', 
    registerLimiter,
    validateBody(registerSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, password, name } = req.body;

        const result = await authService.register({
          email,
          password,
          name
        });

        logger.info(`Registro exitoso: ${email}`, { userId: result.user.id });

        res.status(201).json({
          success: true,
          message: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
          data: result
        });

      } catch (error) {
        logger.error('Error en registro:', error);

        if (error instanceof Error) {
          if (error.message === 'El email ya está registrado') {
            res.status(409).json({
              success: false,
              error: {
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'El email ya está registrado'
              }
            });
            return;
          }
        }

        res.status(500).json({
          success: false,
          error: {
            code: 'REGISTRATION_ERROR',
            message: 'Error interno del servidor'
          }
        });
      }
    }
  );

  /**
   * POST /api/v1/auth/login
   * Inicia sesión de usuario
   */
  router.post('/login',
    authLimiter,
    validateBody(loginSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, password } = req.body;

        const result = await authService.login({ email, password });

        logger.info(`Login exitoso: ${email}`, { userId: result.user.id });

        res.json({
          success: true,
          message: 'Login exitoso',
          data: result
        });

      } catch (error) {
        logger.error('Error en login:', error);

        if (error instanceof Error) {
          if (error.message === 'Credenciales inválidas') {
            res.status(401).json({
              success: false,
              error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Email o contraseña incorrectos'
              }
            });
            return;
          }
        }

        res.status(500).json({
          success: false,
          error: {
            code: 'LOGIN_ERROR',
            message: 'Error interno del servidor'
          }
        });
      }
    }
  );

  /**
   * POST /api/v1/auth/refresh
   * Refresca el access token
   */
  router.post('/refresh',
    validateBody(refreshTokenSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { refreshToken } = req.body;

        const result = await authService.refreshToken(refreshToken);

        res.json({
          success: true,
          message: 'Token refrescado exitosamente',
          data: result
        });

      } catch (error) {
        logger.error('Error refrescando token:', error);

        if (error instanceof Error) {
          if (error.message === 'Refresh token inválido o expirado') {
            res.status(401).json({
              success: false,
              error: {
                code: 'INVALID_REFRESH_TOKEN',
                message: 'Token de actualización inválido o expirado'
              }
            });
            return;
          }
        }

        res.status(500).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_ERROR',
            message: 'Error interno del servidor'
          }
        });
      }
    }
  );

  /**
   * POST /api/v1/auth/logout
   * Cierra sesión del usuario
   */
  router.post('/logout',
    validateBody(refreshTokenSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { refreshToken } = req.body;

        await authService.logout(refreshToken);

        res.json({
          success: true,
          message: 'Logout exitoso'
        });

      } catch (error) {
        logger.error('Error en logout:', error);
        
        res.status(500).json({
          success: false,
          error: {
            code: 'LOGOUT_ERROR',
            message: 'Error interno del servidor'
          }
        });
      }
    }
  );

  /**
   * POST /api/v1/auth/verify-email/:token
   * Verifica el email del usuario
   */
  router.post('/verify-email/:token',
    emailVerificationLimiter,
    validateParams(tokenParamSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { token } = req.params;

        const user = await authService.verifyEmail(token);

        res.json({
          success: true,
          message: 'Email verificado exitosamente',
          data: { user }
        });

      } catch (error) {
        logger.error('Error verificando email:', error);

        if (error instanceof Error) {
          if (error.message === 'Token de verificación inválido') {
            res.status(400).json({
              success: false,
              error: {
                code: 'INVALID_VERIFICATION_TOKEN',
                message: 'Token de verificación inválido'
              }
            });
            return;
          }

          if (error.message === 'Email ya verificado') {
            res.status(409).json({
              success: false,
              error: {
                code: 'EMAIL_ALREADY_VERIFIED',
                message: 'El email ya está verificado'
              }
            });
            return;
          }
        }

        res.status(500).json({
          success: false,
          error: {
            code: 'EMAIL_VERIFICATION_ERROR',
            message: 'Error interno del servidor'
          }
        });
      }
    }
  );

  /**
   * POST /api/v1/auth/forgot-password
   * Solicita reset de contraseña
   */
  router.post('/forgot-password',
    passwordResetLimiter,
    validateBody(forgotPasswordSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { email } = req.body;

        await authService.forgotPassword(email);

        // Siempre responder con éxito por seguridad
        res.json({
          success: true,
          message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
        });

      } catch (error) {
        logger.error('Error en forgot password:', error);
        
        // Siempre responder con éxito por seguridad
        res.json({
          success: true,
          message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
        });
      }
    }
  );

  /**
   * POST /api/v1/auth/reset-password
   * Restablece la contraseña usando token
   */
  router.post('/reset-password',
    validateBody(resetPasswordSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { token, newPassword } = req.body;

        await authService.resetPassword({ token, newPassword });

        res.json({
          success: true,
          message: 'Contraseña restablecida exitosamente'
        });

      } catch (error) {
        logger.error('Error restableciendo contraseña:', error);

        if (error instanceof Error) {
          if (error.message === 'Token de reset inválido') {
            res.status(400).json({
              success: false,
              error: {
                code: 'INVALID_RESET_TOKEN',
                message: 'Token de reset inválido'
              }
            });
            return;
          }

          if (error.message === 'Token de reset expirado') {
            res.status(400).json({
              success: false,
              error: {
                code: 'EXPIRED_RESET_TOKEN',
                message: 'Token de reset expirado'
              }
            });
            return;
          }
        }

        res.status(500).json({
          success: false,
          error: {
            code: 'PASSWORD_RESET_ERROR',
            message: 'Error interno del servidor'
          }
        });
      }
    }
  );

  /**
   * GET /api/v1/auth/me
   * Obtiene información del usuario autenticado
   */
  router.get('/me',
    authMiddleware.authenticate,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const user = await authService.getUserById(req.user.id);

        if (!user) {
          res.status(404).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'Usuario no encontrado'
            }
          });
          return;
        }

        res.json({
          success: true,
          data: { user }
        });

      } catch (error) {
        logger.error('Error obteniendo información del usuario:', error);
        
        res.status(500).json({
          success: false,
          error: {
            code: 'USER_INFO_ERROR',
            message: 'Error interno del servidor'
          }
        });
      }
    }
  );

  /**
   * GET /api/v1/auth/status
   * Verifica el estado de autenticación
   */
  router.get('/status',
    authMiddleware.optionalAuth,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const isAuthenticated = !!req.user;
        
        res.json({
          success: true,
          data: {
            authenticated: isAuthenticated,
            user: req.user ? await authService.getUserById(req.user.id) : null
          }
        });

      } catch (error) {
        logger.error('Error verificando estado de autenticación:', error);
        
        res.json({
          success: true,
          data: {
            authenticated: false,
            user: null
          }
        });
      }
    }
  );

  return router;
} 