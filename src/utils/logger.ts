
/**
 * Logger utility for consistent logging throughout the application
 * Supports multiple log levels and provides structured logging
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Log context interface
interface LogContext {
  component?: string;
  user?: string | null;
  action?: string;
  [key: string]: any;
}

// Configuration options
const config = {
  enableConsoleLogs: true,
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
};

/**
 * Main logger function
 * 
 * @param level - The log level
 * @param message - The log message
 * @param context - Additional context data
 */
const log = (level: LogLevel, message: string, context: LogContext = {}) => {
  // Skip logs below minimum level
  if (!shouldLog(level)) return;
  
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...context,
  };
  
  // Console logging
  if (config.enableConsoleLogs) {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[${timestamp}] [${level}] ${message}`, context);
        break;
      case LogLevel.INFO:
        console.info(`[${timestamp}] [${level}] ${message}`, context);
        break;
      case LogLevel.WARN:
        console.warn(`[${timestamp}] [${level}] ${message}`, context);
        break;
      case LogLevel.ERROR:
        console.error(`[${timestamp}] [${level}] ${message}`, context);
        break;
    }
  }
  
  // Here you could add additional logging destinations
  // e.g., send to a monitoring service, store in IndexedDB, etc.
  
  return logData;
};

/**
 * Determines if a log should be processed based on minimum level
 */
const shouldLog = (level: LogLevel): boolean => {
  const levels = Object.values(LogLevel);
  const minLevelIndex = levels.indexOf(config.minLevel);
  const currentLevelIndex = levels.indexOf(level);
  
  return currentLevelIndex >= minLevelIndex;
};

/**
 * Convenience methods for different log levels
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log(LogLevel.DEBUG, message, context),
  info: (message: string, context?: LogContext) => log(LogLevel.INFO, message, context),
  warn: (message: string, context?: LogContext) => log(LogLevel.WARN, message, context),
  error: (message: string, context?: LogContext) => log(LogLevel.ERROR, message, context),
  
  // Create a logger instance with predefined context (e.g., component name)
  createLogger: (defaultContext: LogContext) => ({
    debug: (message: string, context?: LogContext) => 
      log(LogLevel.DEBUG, message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) => 
      log(LogLevel.INFO, message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) => 
      log(LogLevel.WARN, message, { ...defaultContext, ...context }),
    error: (message: string, context?: LogContext) => 
      log(LogLevel.ERROR, message, { ...defaultContext, ...context }),
  })
};

export default logger;
