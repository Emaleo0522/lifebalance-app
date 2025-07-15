-- SOLUCIÓN ALTERNATIVA: Migración completa sin conversión de tipo
-- Esta opción evita el error de conversión recreando la columna

-- PASO 1: Crear enum si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
        CREATE TYPE invitation_status AS ENUM ('pending', 'sent', 'accepted', 'expired', 'cancelled');
    END IF;
END $$;

-- PASO 2: Agregar campos necesarios (si no existen)
ALTER TABLE pending_invitations
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS family_group_name TEXT,
ADD COLUMN IF NOT EXISTS inviter_name TEXT;

-- PASO 3: Renombrar la columna actual para preservar datos
ALTER TABLE pending_invitations 
RENAME COLUMN status TO status_old;

-- PASO 4: Crear nueva columna con enum type
ALTER TABLE pending_invitations 
ADD COLUMN status invitation_status DEFAULT 'pending'::invitation_status;

-- PASO 5: Migrar datos de la columna vieja a la nueva
UPDATE pending_invitations 
SET status = CASE 
    WHEN status_old = 'pending' THEN 'pending'::invitation_status
    WHEN status_old = 'sent' THEN 'sent'::invitation_status
    WHEN status_old = 'accepted' THEN 'accepted'::invitation_status
    WHEN status_old = 'expired' THEN 'expired'::invitation_status
    WHEN status_old = 'cancelled' THEN 'cancelled'::invitation_status
    ELSE 'pending'::invitation_status
END;

-- PASO 6: Hacer la columna NOT NULL
ALTER TABLE pending_invitations 
ALTER COLUMN status SET NOT NULL;

-- PASO 7: Eliminar la columna vieja
ALTER TABLE pending_invitations 
DROP COLUMN status_old;

-- PASO 8: Eliminar el CHECK constraint viejo si existe
ALTER TABLE pending_invitations 
DROP CONSTRAINT IF EXISTS pending_invitations_status_check;

-- PASO 9: Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON pending_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email_status ON pending_invitations(email, status);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_expires_at ON pending_invitations(expires_at);

-- PASO 10: Función para limpiar invitaciones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  -- Marcar invitaciones expiradas como 'expired'
  UPDATE pending_invitations 
  SET status = 'expired'::invitation_status
  WHERE expires_at < NOW() 
    AND status IN ('pending'::invitation_status, 'sent'::invitation_status);
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- PASO 11: Función para obtener invitación por token
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
    AND pi.status IN ('pending'::invitation_status, 'sent'::invitation_status)
    AND pi.expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- PASO 12: Función para marcar invitación como clickeada
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

-- PASO 13: Trigger para auto-generar tokens únicos
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

-- PASO 14: Crear trigger para generar tokens automáticamente
DROP TRIGGER IF EXISTS trigger_generate_invitation_token ON pending_invitations;
CREATE TRIGGER trigger_generate_invitation_token
  BEFORE INSERT ON pending_invitations
  FOR EACH ROW
  EXECUTE FUNCTION generate_invitation_token();

-- PASO 15: Conceder permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_invitation_by_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_invitation_clicked(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO authenticated;

-- PASO 16: Verificación final
DO $$
BEGIN
    RAISE NOTICE 'Migración completada exitosamente. Columna status convertida a invitation_status enum usando método alternativo.';
    RAISE NOTICE 'Total de invitaciones en la tabla: %', (SELECT COUNT(*) FROM pending_invitations);
END $$;

-- PASO 17: Mostrar estadísticas de la tabla después de la migración
SELECT 
    status,
    COUNT(*) as count
FROM pending_invitations 
GROUP BY status 
ORDER BY status;