import Joi from 'joi';

// Schema para registro de usuario
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email debe tener un formato válido',
      'any.required': 'Email es requerido'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'Contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.required': 'Contraseña es requerida'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Nombre debe tener al menos 2 caracteres',
      'string.max': 'Nombre no puede exceder 50 caracteres',
      'any.required': 'Nombre es requerido'
    })
});

// Schema para login
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email debe tener un formato válido',
      'any.required': 'Email es requerido'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Contraseña es requerida'
    })
});

// Schema para refresh token
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token es requerido'
    })
});

// Schema para solicitar reset de contraseña
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email debe tener un formato válido',
      'any.required': 'Email es requerido'
    })
});

// Schema para reset de contraseña
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token es requerido'
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Nueva contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'Nueva contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.required': 'Nueva contraseña es requerida'
    })
});

// Schema para verificación de email
export const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token de verificación es requerido'
    })
}); 