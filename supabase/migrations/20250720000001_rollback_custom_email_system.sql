-- Rollback completo del sistema de correos personalizado
-- Esta migración elimina todas las tablas, funciones y triggers relacionados con el sistema de correos personalizado
-- para volver al sistema nativo de Supabase

-- 1. Eliminar triggers primero
DROP TRIGGER IF EXISTS trigger_create_invitation_notification ON pending_invitations;
DROP TRIGGER IF EXISTS trigger_generate_invitation_token ON pending_invitations;

-- 2. Eliminar políticas RLS específicas del sistema personalizado
DROP POLICY IF EXISTS "Users can view invitations by valid token" ON pending_invitations;
DROP POLICY IF EXISTS "Users can view own notifications" ON invitation_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON invitation_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON invitation_notifications;

-- 3. Eliminar funciones relacionadas con el sistema personalizado
DROP FUNCTION IF EXISTS create_invitation_notification();
DROP FUNCTION IF EXISTS accept_invitation_notification(UUID);
DROP FUNCTION IF EXISTS reject_invitation_notification(UUID);
DROP FUNCTION IF EXISTS get_invitation_by_token(UUID);
DROP FUNCTION IF EXISTS mark_invitation_clicked(UUID);
DROP FUNCTION IF EXISTS set_invitation_token_context(UUID);
DROP FUNCTION IF EXISTS generate_invitation_token();
DROP FUNCTION IF EXISTS cleanup_expired_invitations();

-- 4. Eliminar vistas
DROP VIEW IF EXISTS active_invitations;

-- 5. Eliminar tablas (en orden correcto por dependencias)
DROP TABLE IF EXISTS public.invitation_notifications CASCADE;
DROP TABLE IF EXISTS public.pending_invitations CASCADE;

-- 6. Eliminar tipos custom si existen
DROP TYPE IF EXISTS invitation_status;

-- 7. Limpiar comentarios residuales
-- (No es necesario, se eliminan automáticamente con las tablas)

-- Comentario de la migración
COMMENT ON SCHEMA public IS 'Rollback: Sistema de correos personalizado eliminado - usando solo sistema nativo de Supabase';