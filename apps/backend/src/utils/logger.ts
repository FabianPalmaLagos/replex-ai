import winston from 'winston';

// Configuración de niveles de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colores para cada nivel
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Agregar colores a winston
winston.addColors(logColors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${
      info.splat !== undefined ? `${info.splat}` : ' '
    }`
  )
);

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuración de transports
const transports = [
  // Console transport para desarrollo
  new winston.transports.Console({
    format: logFormat,
    level: process.env.LOG_LEVEL || 'debug',
  }),
  
  // File transport para errores
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
  }),
  
  // File transport para todos los logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: fileFormat,
  }),
];

// Crear el logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels: logLevels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Stream para Morgan (logging de HTTP requests)
export const morganStream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  },
};

// Función para logging de errores con contexto
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Función para logging de información con contexto
export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, {
    context,
    timestamp: new Date().toISOString(),
  });
};

// En producción, solo mostrar errores y warnings en consola
if (process.env.NODE_ENV === 'production') {
  logger.clear();
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'warn',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
    })
  );
} 