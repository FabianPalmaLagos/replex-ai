import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

/**
 * Middleware de validación genérico para schemas de Joi
 */
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[source];
      
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Mostrar todos los errores
        stripUnknown: true, // Remover campos no definidos en el schema
        convert: true // Convertir tipos automáticamente
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.warn('Error de validación:', {
          endpoint: req.path,
          method: req.method,
          errors: validationErrors,
          ip: req.ip
        });

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: validationErrors
          }
        });
        return;
      }

      // Reemplazar los datos originales con los validados y sanitizados
      req[source] = value;
      next();

    } catch (error) {
      logger.error('Error en middleware de validación:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_MIDDLEWARE_ERROR',
          message: 'Error interno en validación'
        }
      });
    }
  };
};

/**
 * Middleware específico para validar body
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return validate(schema, 'body');
};

/**
 * Middleware específico para validar query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validate(schema, 'query');
};

/**
 * Middleware específico para validar route parameters
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return validate(schema, 'params');
};

/**
 * Schema para validar UUID en parámetros
 */
export const uuidParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'ID debe ser un UUID válido',
      'any.required': 'ID es requerido'
    })
});

/**
 * Schema para validar token en parámetros
 */
export const tokenParamSchema = Joi.object({
  token: Joi.string()
    .min(32)
    .max(128)
    .required()
    .messages({
      'string.min': 'Token debe tener al menos 32 caracteres',
      'string.max': 'Token no puede exceder 128 caracteres',
      'any.required': 'Token es requerido'
    })
});

/**
 * Middleware para sanitizar entrada de texto
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, ''); // Remover event handlers
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitizar body, query y params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}; 