/**
 * Traduce errores de Supabase Auth al español
 */
export const translateAuthError = (error: string): string => {
  const translations: Record<string, string> = {
    // Errores de contraseña
    'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
    'Email not confirmed': 'Email no confirmado',
    'Invalid email or password': 'Email o contraseña inválidos',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
    'Password too weak': 'La contraseña es muy débil',
    'New password should be different from the old password': 'La nueva contraseña debe ser diferente a la anterior',
    'Password should be at least 8 characters': 'La contraseña debe tener al menos 8 caracteres',
    'Password must contain at least one uppercase letter': 'La contraseña debe contener al menos una letra mayúscula',
    'Password must contain at least one lowercase letter': 'La contraseña debe contener al menos una letra minúscula',
    'Password must contain at least one number': 'La contraseña debe contener al menos un número',
    
    // Errores de email
    'Email address is invalid': 'La dirección de email es inválida',
    'Email already registered': 'El email ya está registrado',
    'Email not found': 'Email no encontrado',
    'Email rate limit exceeded': 'Límite de emails excedido. Intenta más tarde',
    'Email link is invalid or has expired': 'El enlace de email es inválido o ha expirado',
    'Email already taken': 'El email ya está en uso',
    'Invalid email format': 'Formato de email inválido',
    
    // Errores de sesión
    'User not found': 'Usuario no encontrado',
    'Session not found': 'Sesión no encontrada',
    'Auth session missing': 'Sesión de autenticación faltante',
    'Invalid session': 'Sesión inválida',
    'Session expired': 'Sesión expirada',
    'Unauthorized': 'No autorizado',
    'Access denied': 'Acceso denegado',
    'Authentication failed': 'Autenticación fallida',
    
    // Errores de token
    'Token has expired': 'El token ha expirado',
    'Invalid token': 'Token inválido',
    'Token not found': 'Token no encontrado',
    'Invalid refresh token': 'Token de actualización inválido',
    'Refresh token expired': 'Token de actualización expirado',
    'Invalid access token': 'Token de acceso inválido',
    'Access token expired': 'Token de acceso expirado',
    'Invalid or expired token': 'Token inválido o expirado',
    
    // Errores de red
    'Network error': 'Error de red',
    'Request failed': 'Solicitud fallida',
    'Connection timeout': 'Tiempo de conexión agotado',
    'Server error': 'Error del servidor',
    'Service unavailable': 'Servicio no disponible',
    'Database error': 'Error de base de datos',
    'Internal server error': 'Error interno del servidor',
    
    // Errores de validación
    'Invalid credentials': 'Credenciales inválidas',
    'Missing credentials': 'Credenciales faltantes',
    'Invalid request': 'Solicitud inválida',
    'Bad request': 'Solicitud incorrecta',
    'Validation failed': 'Validación fallida',
    'Invalid input': 'Entrada inválida',
    'Required field missing': 'Campo requerido faltante',
    
    // Errores de confirmación
    'Signup requires email confirmation': 'El registro requiere confirmación por email',
    'Email confirmation required': 'Se requiere confirmación de email',
    'Confirmation token expired': 'Token de confirmación expirado',
    'Invalid confirmation token': 'Token de confirmación inválido',
    'Account already confirmed': 'Cuenta ya confirmada',
    
    // Errores de recuperación
    'Password recovery requires email': 'La recuperación de contraseña requiere email',
    'Recovery token expired': 'Token de recuperación expirado',
    'Invalid recovery token': 'Token de recuperación inválido',
    'Recovery not found': 'Recuperación no encontrada',
    'Password reset failed': 'Falló el restablecimiento de contraseña',
    
    // Errores de límites
    'Too many requests': 'Demasiadas solicitudes',
    'Rate limit exceeded': 'Límite de velocidad excedido',
    'Too many attempts': 'Demasiados intentos',
    'Account temporarily locked': 'Cuenta temporalmente bloqueada',
    'Please try again later': 'Por favor intenta más tarde',
    
    // Errores específicos de autenticación
    'Only an email address is required for signup': 'Solo se requiere una dirección de email para el registro',
    'Password is required': 'La contraseña es requerida',
    'Email is required': 'El email es requerido',
    'Username is required': 'El nombre de usuario es requerido',
    'Name is required': 'El nombre es requerido',
    
    // Errores de permisos
    'Permission denied': 'Permiso denegado',
    'Insufficient permissions': 'Permisos insuficientes',
    'Access forbidden': 'Acceso prohibido',
    'Admin access required': 'Se requiere acceso de administrador',
    
    // Errores de cuenta
    'Account not found': 'Cuenta no encontrada',
    'Account disabled': 'Cuenta deshabilitada',
    'Account suspended': 'Cuenta suspendida',
    'Account expired': 'Cuenta expirada',
    'Account locked': 'Cuenta bloqueada',
    
    // Errores generales
    'Something went wrong': 'Algo salió mal',
    'Unknown error': 'Error desconocido',
    'Unexpected error': 'Error inesperado',
    'Operation failed': 'Operación fallida',
    'Action not allowed': 'Acción no permitida',
    'Feature not available': 'Función no disponible',
    'Service temporarily unavailable': 'Servicio temporalmente no disponible',
    'Maintenance mode': 'Modo de mantenimiento',
    
    // Errores de código de estado HTTP
    '400': 'Solicitud incorrecta',
    '401': 'No autorizado',
    '403': 'Prohibido',
    '404': 'No encontrado',
    '422': 'Entidad no procesable',
    '429': 'Demasiadas solicitudes',
    '500': 'Error interno del servidor',
    '502': 'Gateway incorrecto',
    '503': 'Servicio no disponible',
    '504': 'Tiempo de espera del gateway agotado',
  };

  // Buscar traducción exacta
  if (translations[error]) {
    return translations[error];
  }

  // Buscar traducción parcial (contiene la clave)
  for (const [key, value] of Object.entries(translations)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Si no hay traducción, devolver el error original
  return error;
};

/**
 * Traduce errores de Supabase Database al español
 */
export const translateDatabaseError = (error: string): string => {
  const translations: Record<string, string> = {
    'Foreign key constraint failed': 'Error de restricción de clave foránea',
    'Unique constraint failed': 'Error de restricción única',
    'Not null constraint failed': 'Error de restricción no nulo',
    'Check constraint failed': 'Error de restricción de verificación',
    'Permission denied': 'Permiso denegado',
    'Row not found': 'Fila no encontrada',
    'Table does not exist': 'La tabla no existe',
    'Column does not exist': 'La columna no existe',
    'Function does not exist': 'La función no existe',
    'Connection failed': 'Falló la conexión',
    'Query timeout': 'Tiempo de consulta agotado',
    'Transaction failed': 'Falló la transacción',
    'Database connection lost': 'Conexión a la base de datos perdida',
    'SQL syntax error': 'Error de sintaxis SQL',
    'Invalid query': 'Consulta inválida',
    'Database unavailable': 'Base de datos no disponible',
    'Connection pool exhausted': 'Pool de conexiones agotado',
    'Lock timeout': 'Tiempo de bloqueo agotado',
    'Deadlock detected': 'Deadlock detectado',
    'Insufficient storage': 'Almacenamiento insuficiente',
  };

  // Buscar traducción exacta
  if (translations[error]) {
    return translations[error];
  }

  // Buscar traducción parcial
  for (const [key, value] of Object.entries(translations)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return error;
};

/**
 * Función principal para traducir cualquier error
 */
export const translateError = (error: string | Error): string => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Intentar traducir como error de auth primero
  const authTranslation = translateAuthError(errorMessage);
  if (authTranslation !== errorMessage) {
    return authTranslation;
  }
  
  // Si no es error de auth, intentar como error de database
  const dbTranslation = translateDatabaseError(errorMessage);
  if (dbTranslation !== errorMessage) {
    return dbTranslation;
  }
  
  // Si no hay traducción específica, devolver mensaje genérico amigable
  return 'Ha ocurrido un error. Por favor intenta nuevamente.';
};