-- SOLUCIÓN FINAL: Migración completa con eliminación de funciones existentes
-- Esta versión resuelve el conflicto de tipos de retorno de funciones

-- PASO 1: Eliminar funciones existentes que puedan tener conflictos
DROP FUNCTION IF EXISTS get_invitation_by_token(uuid);
DROP FUNCTION IF EXISTS mark_invitation_clicked(uuid);
DROP FUNCTION IF EXISTS cleanup_expired_invitations();
DROP FUNCTION IF EXISTS generate_invitation_token();

-- PASO 2: Crear enum si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
        CREATE TYPE invitation_status AS ENUM ('pending', 'sent', 'accepted', 'expired', 'cancelled');
    END IF;
END $$;

-- PASO 3: Agregar campos necesarios (si no existen)
ALTER TABLE pending_invitations
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS family_group_name TEXT,
ADD COLUMN IF NOT EXISTS inviter_name TEXT;

-- PASO 4: Renombrar la columna actual para preservar datos
ALTER TABLE pending_invitations 
RENAME COLUMN status TO status_old;

-- PASO 5: Crear nueva columna con enum type
ALTER TABLE pending_invitations 
ADD COLUMN status invitation_status DEFAULT 'pending'::invitation_status;

-- PASO 6: Migrar datos de la columna vieja a la nueva
UPDATE pending_invitations 
SET status = CASE 
    WHEN status_old = 'pending' THEN 'pending'::invitation_status
    WHEN status_old = 'sent' THEN 'sent'::invitation_status
    WHEN status_old = 'accepted' THEN 'accepted'::invitation_status
    WHEN status_old = 'expired' THEN 'expired'::invitation_status
    WHEN status_old = 'cancelled' THEN 'cancelled'::invitation_status
    ELSE 'pending'::invitation_status
END;

-- PASO 7: Hacer la columna NOT NULL
ALTER TABLE pending_invitations 
ALTER COLUMN status SET NOT NULL;

-- PASO 8: Eliminar la columna vieja
ALTER TABLE pending_invitations 
DROP COLUMN status_old;

-- PASO 9: Eliminar el CHECK constraint viejo si existe
ALTER TABLE pending_invitations 
DROP CONSTRAINT IF EXISTS pending_invitations_status_check;

-- PASO 10: Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON pending_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email_status ON pending_invitations(email, status);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_expires_at ON pending_invitations(expires_at);

-- PASO 11: Función para limpiar invitaciones expiradas (nueva versión)
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

-- PASO 12: Función para obtener invitación por token (nueva versión)
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

-- PASO 13: Función para marcar invitación como clickeada (nueva versión)
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

-- PASO 14: Trigger para auto-generar tokens únicos (nueva versión)
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

-- PASO 15: Eliminar trigger existente y crear nuevo
DROP TRIGGER IF EXISTS trigger_generate_invitation_token ON pending_invitations;
CREATE TRIGGER trigger_generate_invitation_token
  BEFORE INSERT ON pending_invitations
  FOR EACH ROW
  EXECUTE FUNCTION generate_invitation_token();

-- PASO 16: Conceder permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_invitation_by_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_invitation_clicked(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO authenticated;

-- PASO 17: Verificación final
DO $$
BEGIN
    RAISE NOTICE 'Migración completada exitosamente. Columna status convertida a invitation_status enum.';
    RAISE NOTICE 'Total de invitaciones en la tabla: %', (SELECT COUNT(*) FROM pending_invitations);
    RAISE NOTICE 'Funciones recreadas sin conflictos de tipo.';
END $$;

-- PASO 18: Mostrar estadísticas de la tabla después de la migración
SELECT 
    'Migration completed successfully' as message,
    status,
    COUNT(*) as count
FROM pending_invitations 
GROUP BY status 
ORDER BY status;