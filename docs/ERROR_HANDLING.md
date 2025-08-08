# Error Handling System - LifeBalance

## Overview

LifeBalance uses a standardized error handling system that provides consistent logging, user feedback, and error categorization across the entire application.

## Core Components

### 1. Enhanced Logger (`src/lib/logger.ts`)

**Features:**
- Environment-based logging levels
- Structured error formatting
- Categorized error types
- Timestamp and context tracking

**Usage:**
```typescript
import { logger, ErrorCategory } from '../lib/logger';

// Debug logging (development only)
logger.debug('User action performed', { userId: '123', action: 'login' });

// Info logging
logger.info('Operation completed successfully');

// Warning with context
logger.warn('Performance threshold exceeded', { loadTime: 5000 });

// Error logging
logger.error('Database connection failed', error, { query: 'SELECT * FROM users' });

// Create structured errors
const appError = logger.createError(
  'Invalid user input',
  ErrorCategory.VALIDATION,
  'INVALID_EMAIL',
  { email: 'invalid@' }
);
```

### 2. Error Handler (`src/lib/error-handler.ts`)

**Features:**
- Automatic error categorization
- User-friendly toast messages
- API result standardization
- Try/catch wrapper utilities

**Usage:**
```typescript
import { 
  handleError, 
  handleApiError, 
  withErrorHandling, 
  success,
  ErrorCategory 
} from '../lib/error-handler';

// Handle any error with automatic categorization
try {
  await riskyOperation();
} catch (error) {
  handleError(error, 'User registration');
}

// Handle API/database errors specifically
const result = handleApiError(error, 'fetch user data', ErrorCategory.DATABASE);

// Async wrapper for automatic error handling
const result = await withErrorHandling(
  async () => await supabase.from('users').select('*'),
  'fetch users',
  ErrorCategory.DATABASE
);

if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}

// Create success responses
return success(userData, 'User created successfully');
```

## Error Categories

The system uses standardized error categories for consistent handling:

- **AUTH**: Authentication and authorization errors
- **DATABASE**: Database and API errors
- **NETWORK**: Network connectivity issues
- **VALIDATION**: Input validation errors
- **UI**: User interface and React errors
- **UNKNOWN**: Uncategorized errors

## Standard Messages

### Error Messages
- `NETWORK`: "Error de conexión. Verifica tu internet."
- `DATABASE`: "Error al acceder a los datos."
- `AUTH`: "Error de autenticación. Inicia sesión nuevamente."
- `VALIDATION`: "Los datos ingresados no son válidos."
- `PERMISSION`: "No tienes permisos para realizar esta acción."
- `NOT_FOUND`: "El recurso solicitado no fue encontrado."
- `GENERIC`: "Ha ocurrido un error inesperado."

### Success Messages
- `SAVED`: "Guardado exitosamente"
- `DELETED`: "Eliminado exitosamente"
- `UPDATED`: "Actualizado exitosamente"
- `CREATED`: "Creado exitosamente"

## Migration from Old System

### Before (Old Pattern)
```typescript
try {
  const result = await apiCall();
  toast.success('Success!');
} catch (error) {
  console.error('Something went wrong:', error);
  toast.error('Error occurred');
}
```

### After (New Pattern)
```typescript
const result = await withErrorHandling(
  async () => await apiCall(),
  'api operation',
  ErrorCategory.DATABASE
);

if (result.success) {
  toast.success('Success!');
  return result.data;
}
// Error is automatically handled and logged
```

## Best Practices

### 1. Always Use the Logger
Replace all `console.log`, `console.error`, `console.warn` with the structured logger:

```typescript
// ❌ Old way
console.log('User logged in');
console.error('Failed to save');

// ✅ New way
logger.info('User logged in', { userId });
logger.error('Failed to save user data', error, { userId });
```

### 2. Use Error Categories
Always specify the appropriate error category:

```typescript
// ❌ Generic
handleError(error, 'something failed');

// ✅ Specific
handleError(error, 'user authentication', ErrorCategory.AUTH);
```

### 3. Provide Context
Include relevant information for debugging:

```typescript
logger.error('Database query failed', error, {
  query: 'SELECT * FROM users',
  userId: currentUser.id,
  timestamp: new Date().toISOString()
});
```

### 4. Use Async Wrappers
For operations that might fail, use the error handling wrapper:

```typescript
// ❌ Manual try/catch everywhere
try {
  const users = await supabase.from('users').select('*');
  const groups = await supabase.from('groups').select('*');
} catch (error) {
  // Handle error manually
}

// ✅ Use wrapper
const usersResult = await withErrorHandling(
  () => supabase.from('users').select('*'),
  'fetch users',
  ErrorCategory.DATABASE
);

const groupsResult = await withErrorHandling(
  () => supabase.from('groups').select('*'),
  'fetch groups',
  ErrorCategory.DATABASE
);
```

## Configuration

### Log Levels
- **Development**: DEBUG (all messages)
- **Production**: ERROR (errors only)

### Environment Variables
No additional environment variables needed. The system automatically detects the environment using `import.meta.env.DEV`.

## Future Enhancements

1. **Error Reporting Integration**: Add Sentry or similar service
2. **User Error Feedback**: Allow users to report errors
3. **Performance Monitoring**: Track error rates and patterns
4. **Offline Error Queue**: Store errors when offline
5. **Error Analytics**: Dashboard for error tracking

## Examples in Codebase

See these files for implementation examples:
- `src/components/ErrorBoundary.tsx` - React error boundary
- `src/main.tsx` - App initialization errors
- `src/lib/supabase.ts` - Configuration errors
- `src/pages/Settings.tsx` - User action errors
- `src/hooks/useFinanceTracking.ts` - API error handling