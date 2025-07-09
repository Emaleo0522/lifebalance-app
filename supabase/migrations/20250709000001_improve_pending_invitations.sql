-- Mejoras a la tabla pending_invitations para soporte completo de invitaciones por email

-- Agregar campos necesarios para el sistema de invitaciones
ALTER TABLE pending_invitations
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS family_group_name TEXT,
ADD COLUMN IF NOT EXISTS inviter_name TEXT;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON pending_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email_status ON pending_invitations(email, status);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_expires_at ON pending_invitations(expires_at);

-- Actualizar el enum de status para incluir 'sent'
ALTER TYPE invitation_status ADD VALUE IF NOT EXISTS 'sent';

-- Función para limpiar invitaciones expiradas (mejorada)
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  -- Marcar invitaciones expiradas como 'expired'
  UPDATE pending_invitations 
  SET status = 'expired'
  WHERE expires_at < NOW() 
    AND status IN ('pending', 'sent');
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener invitación por token
CREATE OR REPLACE FUNCTION get_invitation_by_token(token UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  group_id UUID,
  role TEXT,
  family_group_name TEXT,
  inviter_name TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status invitation_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.email,
    pi.group_id,
    pi.role,
    pi.family_group_name,
    pi.inviter_name,
    pi.created_at,
    pi.expires_at,
    pi.status
  FROM pending_invitations pi
  WHERE pi.invitation_token = token
    AND pi.status IN ('pending', 'sent')
    AND pi.expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para marcar invitación como clickeada
CREATE OR REPLACE FUNCTION mark_invitation_clicked(token UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE pending_invitations 
  SET clicked_at = NOW()
  WHERE invitation_token = token
    AND clicked_at IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-generar tokens únicos
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo generar token si no existe
  IF NEW.invitation_token IS NULL THEN
    NEW.invitation_token := gen_random_uuid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para generar tokens automáticamente
DROP TRIGGER IF EXISTS trigger_generate_invitation_token ON pending_invitations;
CREATE TRIGGER trigger_generate_invitation_token
  BEFORE INSERT ON pending_invitations
  FOR EACH ROW
  EXECUTE FUNCTION generate_invitation_token();

-- Política de seguridad para tokens de invitación
CREATE POLICY "Users can view invitations by valid token"
  ON pending_invitations
  FOR SELECT
  TO authenticated
  USING (
    invitation_token = (current_setting('app.invitation_token', true))::UUID
    AND expires_at > NOW()
  );

-- Función para configurar contexto de token (para RLS)
CREATE OR REPLACE FUNCTION set_invitation_token_context(token UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.invitation_token', token::TEXT, true);
END;
$$ LANGUAGE plpgsql;

-- Crear vista para invitaciones activas
CREATE OR REPLACE VIEW active_invitations AS
SELECT 
  pi.id,
  pi.email,
  pi.group_id,
  pi.role,
  pi.family_group_name,
  pi.inviter_name,
  pi.created_at,
  pi.expires_at,
  pi.status,
  pi.invitation_token,
  pi.sent_at,
  pi.clicked_at,
  fg.name as group_name,
  u.name as inviter_full_name
FROM pending_invitations pi
LEFT JOIN family_groups fg ON pi.group_id = fg.id
LEFT JOIN users u ON pi.invited_by = u.id
WHERE pi.status IN ('pending', 'sent')
  AND pi.expires_at > NOW();

-- Conceder permisos a usuarios autenticados
GRANT SELECT ON active_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION get_invitation_by_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_invitation_clicked(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION set_invitation_token_context(UUID) TO authenticated;

-- Comentarios para documentación
COMMENT ON COLUMN pending_invitations.invitation_token IS 'Token único para acceder a la invitación desde el enlace de email';
COMMENT ON COLUMN pending_invitations.sent_at IS 'Timestamp cuando se envió el email de invitación';
COMMENT ON COLUMN pending_invitations.clicked_at IS 'Timestamp cuando el usuario hizo clic en el enlace del email';
COMMENT ON COLUMN pending_invitations.family_group_name IS 'Nombre del grupo familiar para mostrar en el email';
COMMENT ON COLUMN pending_invitations.inviter_name IS 'Nombre del usuario que envió la invitación';
COMMENT ON FUNCTION cleanup_expired_invitations() IS 'Limpia invitaciones expiradas marcándolas como expired';
COMMENT ON FUNCTION get_invitation_by_token(UUID) IS 'Obtiene información de invitación por token válido';
COMMENT ON FUNCTION mark_invitation_clicked(UUID) IS 'Marca cuando un usuario hizo clic en el enlace de invitación';