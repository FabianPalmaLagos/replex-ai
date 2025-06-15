import { Router, Request, Response } from 'express';
import { testConnection } from '../config/database';
import { redisClient } from '../config/redis';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Health check básico
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100,
    },
    cpu: process.cpuUsage(),
  };

  logger.info('Health check solicitado', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json(healthCheck);
}));

// Health check detallado con conexiones
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Verificar conexión a PostgreSQL
  const dbStatus = await testConnection();
  
  // Verificar conexión a Redis
  let redisStatus = false;
  try {
    const pong = await redisClient.ping();
    redisStatus = pong === 'PONG';
  } catch (error) {
    logger.error('Error en health check de Redis:', error);
    redisStatus = false;
  }

  const responseTime = Date.now() - startTime;
  
  const detailedHealth = {
    status: dbStatus && redisStatus ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: {
        status: dbStatus ? 'UP' : 'DOWN',
        type: 'PostgreSQL',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
      },
      cache: {
        status: redisStatus ? 'UP' : 'DOWN',
        type: 'Redis',
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || '6379',
      }
    },
    system: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100,
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    }
  };

  logger.info('Health check detallado solicitado', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    responseTime,
    dbStatus,
    redisStatus
  });

  const statusCode = detailedHealth.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(detailedHealth);
}));

// Endpoint para verificar solo la base de datos
router.get('/database', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  const dbStatus = await testConnection();
  const responseTime = Date.now() - startTime;

  const dbHealth = {
    status: dbStatus ? 'UP' : 'DOWN',
    type: 'PostgreSQL',
    responseTime: `${responseTime}ms`,
    timestamp: new Date().toISOString(),
    config: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_NAME || 'replex_ai',
    }
  };

  const statusCode = dbStatus ? 200 : 503;
  res.status(statusCode).json(dbHealth);
}));

// Endpoint para verificar solo Redis
router.get('/cache', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  let redisStatus = false;
  let errorMessage = '';

  try {
    const pong = await redisClient.ping();
    redisStatus = pong === 'PONG';
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error en health check de Redis:', error);
  }

  const responseTime = Date.now() - startTime;

  const redisHealth = {
    status: redisStatus ? 'UP' : 'DOWN',
    type: 'Redis',
    responseTime: `${responseTime}ms`,
    timestamp: new Date().toISOString(),
    config: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || '6379',
      database: process.env.REDIS_DB || '0',
    },
    ...(errorMessage && { error: errorMessage })
  };

  const statusCode = redisStatus ? 200 : 503;
  res.status(statusCode).json(redisHealth);
}));

// Endpoint para métricas básicas
router.get('/metrics', asyncHandler(async (req: Request, res: Response) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    platform: {
      type: process.platform,
      arch: process.arch,
      version: process.version,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(200).json(metrics);
}));

export default router; 