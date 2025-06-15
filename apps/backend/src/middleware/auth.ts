import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/tokenService';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';
import { Pool } from 'pg';

// Extender Request para incluir información del usuario
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export class AuthMiddleware {
  private tokenService: TokenService;
  private authService: AuthService;

  constructor(db: Pool) {
    this.tokenService = new TokenService();
    this.authService = new AuthService(db);
  }

  /**
   * Middleware para verificar autenticación
   */
  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = this.tokenService.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Token de acceso requerido'
          }
        });
        return;
      }

      // Verificar token
      const payload = this.tokenService.verifyAccessToken(token);

      // Verificar que el usuario existe y está activo
      const user = await this.authService.getUserById(payload.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuario no encontrado'
          }
        });
        return;
      }

      // Agregar información del usuario al request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      next();

    } catch (error) {
      logger.error('Error en autenticación:', error);

      if (error instanceof Error) {
        if (error.message === 'Token expirado') {
          res.status(401).json({
            success: false,
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'Token expirado'
            }
          });
          return;
        }

        if (error.message === 'Token inválido') {
          res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Token inválido'
            }
          });
          return;
        }
      }

      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Error de autenticación'
        }
      });
    }
  };

  /**
   * Middleware para verificar roles específicos
   */
  requireRole = (requiredRole: 'user' | 'admin') => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Usuario no autenticado'
          }
        });
        return;
      }

      if (req.user.role !== requiredRole && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Permisos insuficientes'
          }
        });
        return;
      }

      next();
    };
  };

  /**
   * Middleware para verificar que el email está verificado
   */
  requireEmailVerified = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getUserById(req.user.id);
      
      if (!user || !user.email_verified) {
        res.status(403).json({
          success: false,
          error: {
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Email no verificado. Revisa tu bandeja de entrada.'
          }
        });
        return;
      }

      next();

    } catch (error) {
      logger.error('Error verificando email:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VERIFICATION_ERROR',
          message: 'Error verificando estado del email'
        }
      });
    }
  };

  /**
   * Middleware opcional de autenticación (no falla si no hay token)
   */
  optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = this.tokenService.extractTokenFromHeader(authHeader);

      if (token) {
        const payload = this.tokenService.verifyAccessToken(token);
        const user = await this.authService.getUserById(payload.userId);
        
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role
          };
        }
      }

      next();

    } catch (error) {
      // En autenticación opcional, continuamos sin usuario
      next();
    }
  };
} 