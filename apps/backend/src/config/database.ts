import { Pool } from 'pg';
import { logger } from '../utils/logger';

// Configuración de la base de datos usando las variables del docker-compose.yml
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'replex_ai',
  user: process.env.DB_USER || 'replex_user',
  password: process.env.DB_PASSWORD || 'replex_password',
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Pool de conexiones a PostgreSQL
export const pool = new Pool(dbConfig);

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    logger.info('🔍 Intentando conectar a PostgreSQL...', {
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password ? '***' : 'NO_PASSWORD'
      }
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info('✅ Conexión a PostgreSQL establecida correctamente', {
      timestamp: result.rows[0]?.now,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    });
    
    return true;
  } catch (error) {
    logger.error('❌ Error conectando a PostgreSQL:', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      errno: (error as any)?.errno,
      syscall: (error as any)?.syscall,
      address: (error as any)?.address,
      port: (error as any)?.port,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password ? '***' : 'NO_PASSWORD'
      },
      envVars: {
        DB_HOST: process.env.DB_HOST || 'NOT_SET',
        DB_PORT: process.env.DB_PORT || 'NOT_SET',
        DB_NAME: process.env.DB_NAME || 'NOT_SET',
        DB_USER: process.env.DB_USER || 'NOT_SET',
        DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'NOT_SET'
      }
    });
    return false;
  }
};

// Función para cerrar el pool de conexiones
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    logger.info('🔒 Pool de conexiones PostgreSQL cerrado');
  } catch (error) {
    logger.error('Error cerrando pool de PostgreSQL:', error);
  }
};

// Manejo de eventos del pool
pool.on('connect', () => {
  logger.debug('Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
  logger.error('Error inesperado en el pool de PostgreSQL:', err);
}); 