import dotenv from 'dotenv';
import path from 'path';

// Configurar dotenv para buscar el archivo .env en la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Importar utilidades y configuración
import { logger } from './utils/logger';
import { pool, testConnection } from './config/database';
import { createAuthRoutes } from './routes/auth';
import { apiLimiter } from './middleware/rateLimiter';
import seriesRoutes from './routes/series';

// Crear aplicación Express
const app = express();

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Trust proxy para obtener IP real detrás de proxies
app.set('trust proxy', 1);

// Middleware de seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compresión
app.use(compression());

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting general
app.use('/api/', apiLimiter);

// Parseo de JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Replex AI Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    api: '/api/v1',
    health: '/api/v1/health',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check básico
app.get('/api/v1/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
    },
  };

  logger.info('Health check solicitado', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json(healthCheck);
});

// Rutas de autenticación
app.use('/api/v1/auth', createAuthRoutes(pool));

// Rutas de series
app.use('/api/v1/series', seriesRoutes);

// API info
app.get('/api/v1', (req, res) => {
  res.json({
    message: '🚀 Replex AI API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      series: '/api/v1/series',
      users: '/api/v1/users', // Para futuro
    },
    authEndpoints: {
      register: 'POST /api/v1/auth/register',
      login: 'POST /api/v1/auth/login',
      refresh: 'POST /api/v1/auth/refresh',
      logout: 'POST /api/v1/auth/logout',
      verifyEmail: 'POST /api/v1/auth/verify-email/:token',
      forgotPassword: 'POST /api/v1/auth/forgot-password',
      resetPassword: 'POST /api/v1/auth/reset-password',
      me: 'GET /api/v1/auth/me',
      status: 'GET /api/v1/auth/status'
    },
    seriesEndpoints: {
      list: 'GET /api/v1/series',
      create: 'POST /api/v1/series',
      get: 'GET /api/v1/series/:id',
      update: 'PUT /api/v1/series/:id',
      updateStatus: 'PATCH /api/v1/series/:id/status',
      delete: 'DELETE /api/v1/series/:id',
      duplicate: 'POST /api/v1/series/:id/duplicate',
      stats: 'GET /api/v1/series/:id/stats',
      search: 'GET /api/v1/series/search',
      metrics: 'GET /api/v1/series/metrics'
    }
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Función para iniciar el servidor
async function startServer(): Promise<void> {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('❌ No se pudo conectar a la base de datos. Abortando inicio del servidor.');
      process.exit(1);
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        pid: process.pid
      });
      
      logger.info(`📍 API disponible en: http://localhost:${PORT}/api/v1`);
      logger.info(`🏥 Health check en: http://localhost:${PORT}/api/v1/health`);
      logger.info(`🔐 Auth endpoints en: http://localhost:${PORT}/api/v1/auth`);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📡 Señal ${signal} recibida. Iniciando cierre graceful...`);
      
      server.close(async () => {
        logger.info('🔒 Servidor HTTP cerrado');
        
        // Cerrar pool de base de datos
        try {
          await pool.end();
          logger.info('🔒 Pool de base de datos cerrado');
        } catch (error) {
          logger.error('Error cerrando pool de base de datos:', error);
        }
        
        logger.info('👋 Proceso terminado correctamente');
        process.exit(0);
      });

      // Forzar cierre después de 30 segundos
      setTimeout(() => {
        logger.error('⏰ Timeout en cierre graceful. Forzando salida...');
        process.exit(1);
      }, 30000);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Iniciar la aplicación
startServer();

export default app; 