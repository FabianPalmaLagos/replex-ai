// Schemas de validación para Series usando Joi
import Joi from 'joi';

// Schema para crear una nueva serie
export const createSeriesSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.max': 'El nombre no puede exceder 255 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
  
  frequency: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'custom')
    .optional()
    .messages({
      'any.only': 'La frecuencia debe ser: daily, weekly, monthly o custom'
    }),
  
  platforms: Joi.array()
    .items(Joi.string().valid('tiktok', 'instagram', 'youtube'))
    .default([])
    .messages({
      'array.includes': 'Las plataformas deben ser: tiktok, instagram o youtube'
    }),
  
  target_audience: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'La audiencia objetivo no puede exceder 100 caracteres'
    }),
  
  content_style: Joi.string()
    .valid('educational', 'entertainment', 'promotional')
    .optional()
    .messages({
      'any.only': 'El estilo debe ser: educational, entertainment o promotional'
    }),
  
  voice_settings: Joi.object({
    voice_id: Joi.string().optional(),
    speed: Joi.number().min(0.5).max(2).optional(),
    pitch: Joi.number().min(-20).max(20).optional(),
    stability: Joi.number().min(0).max(1).optional(),
    similarity_boost: Joi.number().min(0).max(1).optional()
  }).optional().default({}),
  
  auto_publish: Joi.boolean()
    .default(false),
  
  publish_schedule: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object({
        days: Joi.array().items(Joi.string()).required(),
        times: Joi.array().items(Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)).required(),
        timezone: Joi.string().required()
      })
    )
    .optional()
    .default({}),
  
  hashtags: Joi.array()
    .items(Joi.string().max(50))
    .max(30)
    .default([])
    .messages({
      'array.max': 'No puedes tener más de 30 hashtags',
      'string.max': 'Cada hashtag no puede exceder 50 caracteres'
    })
});

// Schema para actualizar una serie
export const updateSeriesSchema = createSeriesSchema.fork(
  ['name'], 
  (schema) => schema.optional()
).keys({
  status: Joi.string()
    .valid('active', 'paused', 'draft')
    .optional()
    .messages({
      'any.only': 'El estado debe ser: active, paused o draft'
    })
});

// Schema para filtros de búsqueda
export const getSeriesFiltersSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'La página debe ser mayor a 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'El límite debe ser mayor a 0',
      'number.max': 'El límite no puede exceder 100'
    }),
  
  status: Joi.string()
    .valid('active', 'paused', 'draft')
    .optional()
    .messages({
      'any.only': 'El estado debe ser: active, paused o draft'
    }),
  
  search: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'La búsqueda no puede exceder 255 caracteres'
    }),
  
  sortBy: Joi.string()
    .valid('name', 'created_at', 'updated_at', 'video_count')
    .default('updated_at')
    .messages({
      'any.only': 'Ordenar por: name, created_at, updated_at o video_count'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'El orden debe ser: asc o desc'
    }),
  
  platforms: Joi.array()
    .items(Joi.string().valid('tiktok', 'instagram', 'youtube'))
    .optional()
    .messages({
      'array.includes': 'Las plataformas deben ser: tiktok, instagram o youtube'
    }),
  
  content_style: Joi.string()
    .valid('educational', 'entertainment', 'promotional')
    .optional()
    .messages({
      'any.only': 'El estilo debe ser: educational, entertainment o promotional'
    })
});

// Schema para cambiar estado de serie
export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('active', 'paused', 'draft')
    .required()
    .messages({
      'any.only': 'El estado debe ser: active, paused o draft',
      'any.required': 'El estado es requerido'
    })
});

// Schema para duplicar serie
export const duplicateSeriesSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'El nombre para la serie duplicada es requerido',
      'string.max': 'El nombre no puede exceder 255 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  
  copy_settings: Joi.boolean()
    .default(true),
  
  copy_schedule: Joi.boolean()
    .default(false)
});

// Schema para parámetros de URL
export const seriesParamsSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'El ID debe ser un UUID válido',
      'any.required': 'El ID de la serie es requerido'
    })
});

// Schema para crear plantilla de serie
export const createTemplateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'El nombre de la plantilla es requerido',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow(''),
  
  category: Joi.string()
    .valid('education', 'business', 'entertainment')
    .required()
    .messages({
      'any.only': 'La categoría debe ser: education, business o entertainment',
      'any.required': 'La categoría es requerida'
    }),
  
  default_settings: createSeriesSchema.required(),
  
  is_public: Joi.boolean()
    .default(true)
});

// Schema para búsqueda avanzada
export const advancedSearchSchema = Joi.object({
  query: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'La consulta de búsqueda es requerida',
      'string.max': 'La consulta no puede exceder 255 caracteres'
    }),
  
  filters: getSeriesFiltersSchema.optional(),
  
  include_deleted: Joi.boolean()
    .default(false),
  
  date_range: Joi.object({
    start: Joi.date().optional(),
    end: Joi.date().optional()
  }).optional()
});

// Función helper para validar datos
export const validateSeriesData = (data: any, schema: Joi.ObjectSchema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });
  
  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    throw {
      code: 'VALIDATION_ERROR',
      message: 'Datos de entrada inválidos',
      details
    };
  }
  
  return value;
}; 