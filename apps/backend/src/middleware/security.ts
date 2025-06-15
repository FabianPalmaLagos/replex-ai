import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Configuración de CORS
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:5173', // Frontend en desarrollo
      'http://localhost:3000', // Frontend en producción local
      'https://replex-ai.vercel.app', // Frontend en producción
      process.env.FRONTEND_URL, // URL del frontend desde env
    ].filter(Boolean);

    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS: Origen no permitido: ${origin}`);
      callback(new Error('No permitido por CORS'), false);
    }
  },
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 horas
};

// Configuración de Helmet para seguridad
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Deshabilitado para compatibilidad
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting general
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana por IP
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true, // Incluir headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit excedido para IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Intenta de nuevo en 15 minutos.',
      retryAfter: 15 * 60
    });
  }
});

// Rate limiting estricto para autenticación
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por ventana por IP
  message: {
    error: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit de autenticación excedido para IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Demasiados intentos de autenticación',
      message: 'Has excedido el límite de intentos de login. Intenta de nuevo en 15 minutos.',
      retryAfter: 15 * 60
    });
  }
});

// Middleware para logging de requests
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length') || '0'
    };
    
    if (res.statusCode >= 400) {
      logger.warn(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
    } else {
      logger.http(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
    }
  });
  
  next();
};

// Middleware para validar API Key (opcional)
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');
  const validApiKey = process.env.API_KEY;
  
  // Si no hay API key configurada, continuar
  if (!validApiKey) {
    return next();
  }
  
  // Si se requiere API key pero no se proporciona
  if (!apiKey) {
    logger.warn('Request sin API Key', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    return res.status(401).json({
      error: 'API Key requerida',
      message: 'Debes proporcionar una API Key válida en el header X-API-Key'
    });
  }
  
  // Validar API key
  if (apiKey !== validApiKey) {
    logger.warn('API Key inválida', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      providedKey: apiKey.substring(0, 8) + '...' // Log solo los primeros caracteres
    });
    
    return res.status(401).json({
      error: 'API Key inválida',
      message: 'La API Key proporcionada no es válida'
    });
  }
  
  next();
}; 