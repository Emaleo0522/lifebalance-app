-- Migración simplificada para invitaciones familiares
-- Ejecutar esto paso a paso en el SQL Editor de Supabase

-- PASO 1: Crear enum para status de invitaciones
CREATE TYPE invitation_status AS ENUM ('pending', 'sent', 'accepted', 'expired', 'cancelled');

-- PASO 2: Agregar campos necesarios para el sistema de invitaciones
ALTER TABLE pending_invitations
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS family_group_name TEXT,
ADD COLUMN IF NOT EXISTS inviter_name TEXT;

-- PASO 3: Modificar la columna status para usar el enum
ALTER TABLE pending_invitations 
ALTER COLUMN status TYPE invitation_status USING status::invitation_status;

-- PASO 4: Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON pending_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email_status ON pending_invitations(email, status);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_expires_at ON pending_invitations(expires_at);

-- PASO 5: Función para limpiar invitaciones expiradas
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

-- PASO 6: Función para obtener invitación por token
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

-- PASO 7: Función para marcar invitación como clickeada
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

-- PASO 8: Trigger para auto-generar tokens únicos
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

-- PASO 9: Crear trigger para generar tokens automáticamente
DROP TRIGGER IF EXISTS trigger_generate_invitation_token ON pending_invitations;
CREATE TRIGGER trigger_generate_invitation_token
  BEFORE INSERT ON pending_invitations
  FOR EACH ROW
  EXECUTE FUNCTION generate_invitation_token();

-- PASO 10: Conceder permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_invitation_by_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_invitation_clicked(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO authenticated;