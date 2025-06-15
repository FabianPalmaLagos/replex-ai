import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter para endpoints de autenticación (login, register)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Función personalizada para generar la clave del rate limit
  keyGenerator: (req: Request): string => {
    // Usar IP + email si está disponible para mayor precisión
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  },
  // Función para manejar cuando se excede el límite
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_AUTH_ATTEMPTS',
        message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
        retryAfter: Math.round(15 * 60) // 15 minutos en segundos
      }
    });
  }
});

/**
 * Rate limiter para registro de usuarios (más restrictivo)
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REGISTRATIONS',
      message: 'Demasiados registros desde esta IP. Intenta de nuevo en 1 hora.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REGISTRATIONS',
        message: 'Demasiados registros desde esta IP. Intenta de nuevo en 1 hora.',
        retryAfter: Math.round(60 * 60) // 1 hora en segundos
      }
    });
  }
});

/**
 * Rate limiter para reset de contraseña
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 intentos de reset por IP por hora
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_PASSWORD_RESETS',
      message: 'Demasiados intentos de reset de contraseña. Intenta de nuevo en 1 hora.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const email = req.body?.email || '';
    return `reset-${req.ip}-${email}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_PASSWORD_RESETS',
        message: 'Demasiados intentos de reset de contraseña. Intenta de nuevo en 1 hora.',
        retryAfter: Math.round(60 * 60)
      }
    });
  }
});

/**
 * Rate limiter para verificación de email
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // máximo 5 intentos por IP
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_VERIFICATION_ATTEMPTS',
      message: 'Demasiados intentos de verificación. Intenta de nuevo en 10 minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_VERIFICATION_ATTEMPTS',
        message: 'Demasiados intentos de verificación. Intenta de nuevo en 10 minutos.',
        retryAfter: Math.round(10 * 60)
      }
    });
  }
});

/**
 * Rate limiter general para API
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.round(15 * 60)
      }
    });
  }
});

/**
 * Función helper para crear rate limiters personalizados
 */
export const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message: any;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator,
    handler: (req: Request, res: Response) => {
      res.status(429).json(options.message);
    }
  });
}; 