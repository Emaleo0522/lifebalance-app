// Enhanced logging utility with proper error handling and context
const isDev = import.meta.env.DEV;

// Log levels for filtering
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Error types for categorization
export enum ErrorCategory {
  AUTH = 'AUTH',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  UI = 'UI',
  UNKNOWN = 'UNKNOWN'
}

// Structured error interface
export interface AppError {
  message: string;
  category: ErrorCategory;
  code?: string;
  details?: Record<string, unknown>;
  stack?: string;
  timestamp: string;
  userId?: string;
}

// Logger configuration
const loggerConfig = {
  level: isDev ? LogLevel.DEBUG : LogLevel.ERROR,
  enableConsole: true,
  enableStorage: false, // Could be enabled for error reporting
};

class Logger {
  private formatMessage(level: string, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= loggerConfig.level;
  }

  private logToConsole(level: string, message: string, args: unknown[]): void {
    if (!loggerConfig.enableConsole) return;

    const formattedMessage = this.formatMessage(level, message, args.length > 0 ? { args } : undefined);
    
    switch (level) {
      case 'ERROR':
        console.error(formattedMessage);
        break;
      case 'WARN':
        console.warn(formattedMessage);
        break;
      case 'INFO':
        console.info(formattedMessage);
        break;
      case 'DEBUG':
        console.log(formattedMessage);
        break;
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.logToConsole('DEBUG', message, args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.logToConsole('INFO', message, args);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.logToConsole('WARN', message, context ? [context] : []);
    }
  }

  error(message: string, error?: Error | AppError, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorInfo = error ? {
        stack: error.stack,
        name: error instanceof Error ? error.name : 'AppError',
        message: error.message,
        ...context
      } : context;
      
      this.logToConsole('ERROR', message, errorInfo ? [errorInfo] : []);
    }
  }

  // Structured error creation
  createError(
    message: string, 
    category: ErrorCategory = ErrorCategory.UNKNOWN, 
    code?: string,
    details?: Record<string, unknown>
  ): AppError {
    return {
      message,
      category,
      code,
      details,
      timestamp: new Date().toISOString(),
      stack: new Error().stack,
    };
  }

  // Legacy methods for backward compatibility
  log = this.debug;
}

export const logger = new Logger();