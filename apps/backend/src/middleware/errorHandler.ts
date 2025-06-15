import { Request, Response, NextFunction } from 'express';
import { logger, logError } from '../utils/logger';

// Tipos de errores personalizados
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number, isOperational = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores específicos
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, true, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Error de base de datos') {
    super(message, 500, true, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

// Función para determinar si un error es operacional
const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Función para formatear errores de validación de Joi
const handleJoiError = (error: any): AppError => {
  const message = error.details.map((detail: any) => detail.message).join(', ');
  return new ValidationError(`Error de validación: ${message}`);
};

// Función para formatear errores de PostgreSQL
const handleDatabaseError = (error: any): AppError => {
  switch (error.code) {
    case '23505': // unique_violation
      return new ConflictError('El recurso ya existe');
    case '23503': // foreign_key_violation
      return new ValidationError('Referencia inválida');
    case '23502': // not_null_violation
      return new ValidationError('Campo requerido faltante');
    case '22P02': // invalid_text_representation
      return new ValidationError('Formato de datos inválido');
    case '28P01': // invalid_password
      return new AuthenticationError('Credenciales inválidas');
    case '3D000': // invalid_catalog_name
      return new DatabaseError('Base de datos no encontrada');
    default:
      return new DatabaseError('Error de base de datos');
  }
};

// Función para formatear errores de JWT
const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Token inválido');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expirado');
  }
  return new AuthenticationError('Error de autenticación');
};

// Middleware para manejo de errores 404
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  next(error);
};

// Middleware principal de manejo de errores
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let err = error;

  // Log del error
  logError(error, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Convertir errores conocidos a AppError
  if (error.name === 'ValidationError' && 'details' in error) {
    err = handleJoiError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    err = handleJWTError(error);
  } else if ('code' in error && typeof error.code === 'string') {
    // Errores de PostgreSQL
    err = handleDatabaseError(error);
  } else if (error.name === 'CastError') {
    err = new ValidationError('ID inválido');
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    err = new ValidationError('JSON inválido en el cuerpo de la petición');
  }

  // Si no es un error operacional, convertirlo
  if (!isOperationalError(err)) {
    err = new AppError('Error interno del servidor', 500, false);
  }

  const appError = err as AppError;

  // Respuesta de error
  const errorResponse: any = {
    error: true,
    message: appError.message,
    code: appError.code,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // En desarrollo, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = appError.stack;
    errorResponse.details = {
      name: appError.name,
      isOperational: appError.isOperational,
    };
  }

  // Enviar respuesta
  res.status(appError.statusCode).json(errorResponse);
};

// Middleware para capturar errores asíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Función para manejo de errores no capturados
export const handleUncaughtExceptions = () => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}; 