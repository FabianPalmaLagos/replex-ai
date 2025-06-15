import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

// Configuración de Redis usando las variables del docker-compose.yml
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
};

// Cliente Redis
export const redisClient: RedisClientType = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  password: redisConfig.password,
  database: redisConfig.db,
});

// Función para conectar a Redis
export const connectRedis = async (): Promise<boolean> => {
  try {
    await redisClient.connect();
    
    // Probar la conexión
    const pong = await redisClient.ping();
    
    logger.info('✅ Conexión a Redis establecida correctamente', {
      response: pong,
      host: redisConfig.host,
      port: redisConfig.port,
      database: redisConfig.db
    });
    
    return true;
  } catch (error) {
    logger.error('❌ Error conectando a Redis:', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      config: {
        host: redisConfig.host,
        port: redisConfig.port,
        database: redisConfig.db
      }
    });
    return false;
  }
};

// Función para desconectar Redis
export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('🔒 Conexión a Redis cerrada');
  } catch (error) {
    logger.error('Error cerrando conexión a Redis:', error);
  }
};

// Manejo de eventos de Redis
redisClient.on('connect', () => {
  logger.debug('Conectando a Redis...');
});

redisClient.on('ready', () => {
  logger.debug('Redis listo para recibir comandos');
});

redisClient.on('error', (err) => {
  logger.error('Error en Redis:', err);
});

redisClient.on('end', () => {
  logger.debug('Conexión a Redis terminada');
});

// Funciones de utilidad para cache
export const cacheService = {
  // Obtener valor del cache
  get: async (key: string): Promise<string | null> => {
    try {
      return await redisClient.get(key);
    } catch (error) {
      logger.error(`Error obteniendo cache para key ${key}:`, error);
      return null;
    }
  },

  // Establecer valor en cache con TTL opcional
  set: async (key: string, value: string, ttlSeconds?: number): Promise<boolean> => {
    try {
      if (ttlSeconds) {
        await redisClient.setEx(key, ttlSeconds, value);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error(`Error estableciendo cache para key ${key}:`, error);
      return false;
    }
  },

  // Eliminar valor del cache
  del: async (key: string): Promise<boolean> => {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error(`Error eliminando cache para key ${key}:`, error);
      return false;
    }
  },

  // Verificar si existe una key
  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error verificando existencia de key ${key}:`, error);
      return false;
    }
  }
}; 