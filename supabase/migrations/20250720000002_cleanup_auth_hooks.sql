-- Limpiar hooks de autenticación personalizados y configuraciones de correo
-- Esta migración elimina cualquier configuración residual del sistema de correos personalizado

-- 1. Eliminar cualquier hook personalizado si existe
-- (Los hooks de auth normalmente se configuran desde el dashboard, pero por seguridad)

-- 2. Eliminar cualquier función de trigger residual
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS send_custom_confirmation_email() CASCADE;
DROP FUNCTION IF EXISTS handle_password_reset() CASCADE;

-- 3. Limpiar triggers en auth.users si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_password_reset ON auth.users;

-- 4. Verificar que la tabla users tenga la estructura correcta para sistema nativo
-- (Sin campos específicos del sistema personalizado)
ALTER TABLE IF EXISTS public.users 
  DROP COLUMN IF EXISTS email_verification_token,
  DROP COLUMN IF EXISTS email_verification_sent_at,
  DROP COLUMN IF EXISTS password_reset_token,
  DROP COLUMN IF EXISTS password_reset_sent_at;

-- 5. Limpiar cualquier configuración de secrets/variables de entorno del sistema personalizado
-- (Esto se debe hacer manualmente desde el dashboard)

-- Comentario de la migración
COMMENT ON SCHEMA public IS 'Limpieza: Hooks y configuraciones de correo personalizado eliminados';