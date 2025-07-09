-- PASO 3 CORREGIDO: Primero eliminar el constraint existente, luego cambiar el tipo

-- Eliminar el constraint existente
ALTER TABLE pending_invitations DROP CONSTRAINT IF EXISTS pending_invitations_status_check;

-- Cambiar el tipo de columna de TEXT a invitation_status
ALTER TABLE pending_invitations 
ALTER COLUMN status TYPE invitation_status USING status::invitation_status;

-- Agregar el constraint nuevamente (opcional, ya que el enum ya valida)
ALTER TABLE pending_invitations 
ADD CONSTRAINT pending_invitations_status_check 
CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled'));