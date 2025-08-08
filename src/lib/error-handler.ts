import { logger, ErrorCategory, AppError } from './logger';
import toast from 'react-hot-toast';

// Standard error messages for user display
export const ERROR_MESSAGES = {
  NETWORK: 'Error de conexión. Verifica tu internet.',
  DATABASE: 'Error al acceder a los datos.',
  AUTH: 'Error de autenticación. Inicia sesión nuevamente.',
  VALIDATION: 'Los datos ingresados no son válidos.',
  PERMISSION: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  GENERIC: 'Ha ocurrido un error inesperado.',
} as const;

// Standard success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Guardado exitosamente',
  DELETED: 'Eliminado exitosamente',
  UPDATED: 'Actualizado exitosamente',
  CREATED: 'Creado exitosamente',
} as const;

export interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: AppError;
}

export class ErrorHandler {
  /**
   * Handle and display errors consistently across the app
   */
  static handle(error: Error | AppError | unknown, context?: string): AppError {
    let appError: AppError;

    if (this.isAppError(error)) {
      appError = error;
    } else if (error instanceof Error) {
      appError = logger.createError(
        error.message,
        this.categorizeError(error),
        undefined,
        { originalError: error.name, context }
      );
    } else {
      appError = logger.createError(
        'Unknown error occurred',
        ErrorCategory.UNKNOWN,
        undefined,
        { error, context }
      );
    }

    // Log the error
    logger.error(`Error in ${context || 'unknown context'}`, appError);

    // Show user-friendly message
    this.showUserError(appError);

    return appError;
  }

  /**
   * Handle API/database errors specifically
   */
  static handleApiError(
    error: unknown, 
    operation: string,
    category: ErrorCategory = ErrorCategory.DATABASE
  ): ApiResult<never> {
    const appError = logger.createError(
      `Failed to ${operation}`,
      category,
      undefined,
      { originalError: error }
    );

    logger.error(`API Error during ${operation}`, error as Error);
    this.showUserError(appError);

    return { success: false, error: appError };
  }

  /**
   * Create success result
   */
  static success<T>(data?: T, message?: string): ApiResult<T> {
    if (message) {
      toast.success(message);
    }
    return { success: true, data };
  }

  /**
   * Create error result without showing toast
   */
  static silentError(
    message: string, 
    category: ErrorCategory = ErrorCategory.UNKNOWN
  ): ApiResult<never> {
    const appError = logger.createError(message, category);
    logger.error(message, appError);
    return { success: false, error: appError };
  }

  /**
   * Async wrapper that handles try/catch consistently
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN
  ): Promise<ApiResult<T>> {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      return this.handleApiError(error, context, category);
    }
  }

  /**
   * Show appropriate user message based on error
   */
  private static showUserError(error: AppError): void {
    const message = this.getUserMessage(error);
    toast.error(message, {
      duration: 4000,
      position: 'top-center',
    });
  }

  /**
   * Get user-friendly message from error
   */
  private static getUserMessage(error: AppError): string {
    switch (error.category) {
      case ErrorCategory.AUTH:
        return ERROR_MESSAGES.AUTH;
      case ErrorCategory.DATABASE:
        return ERROR_MESSAGES.DATABASE;
      case ErrorCategory.NETWORK:
        return ERROR_MESSAGES.NETWORK;
      case ErrorCategory.VALIDATION:
        return ERROR_MESSAGES.VALIDATION;
      default:
        return error.message || ERROR_MESSAGES.GENERIC;
    }
  }

  /**
   * Categorize error based on its characteristics
   */
  private static categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
      return ErrorCategory.AUTH;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('database') || message.includes('supabase')) {
      return ErrorCategory.DATABASE;
    }
    
    return ErrorCategory.UNKNOWN;
  }

  /**
   * Type guard for AppError
   */
  private static isAppError(error: unknown): error is AppError {
    return typeof error === 'object' && 
           error !== null && 
           'category' in error && 
           'message' in error && 
           'timestamp' in error;
  }
}

// Convenience exports
export const handleError = ErrorHandler.handle.bind(ErrorHandler);
export const handleApiError = ErrorHandler.handleApiError.bind(ErrorHandler);
export const withErrorHandling = ErrorHandler.withErrorHandling.bind(ErrorHandler);
export const success = ErrorHandler.success.bind(ErrorHandler);