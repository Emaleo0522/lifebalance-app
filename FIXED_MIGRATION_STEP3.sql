-- PASO 3: Conversión de TEXT a ENUM para invitation_status
-- Solución al error: "default for column 'status' cannot be cast automatically to type invitation_status"

-- 1. Primero eliminamos el DEFAULT VALUE existente
ALTER TABLE pending_invitations 
ALTER COLUMN status DROP DEFAULT;

-- 2. Eliminamos el CHECK constraint existente (si existe)
ALTER TABLE pending_invitations 
DROP CONSTRAINT IF EXISTS pending_invitations_status_check;

-- 3. Ahora podemos convertir la columna a enum
ALTER TABLE pending_invitations
ALTER COLUMN status TYPE invitation_status USING status::invitation_status;

-- 4. Establecemos el nuevo default como enum
ALTER TABLE pending_invitations 
ALTER COLUMN status SET DEFAULT 'pending'::invitation_status;

-- 5. Verificar que la conversión funcionó correctamente
DO $$
BEGIN
    -- Verificar que no hay valores inválidos
    IF EXISTS (
        SELECT 1 FROM pending_invitations 
        WHERE status NOT IN ('pending', 'accepted', 'expired', 'cancelled', 'sent')
    ) THEN
        RAISE EXCEPTION 'Existen valores de status inválidos en la tabla';
    END IF;
    
    RAISE NOTICE 'Migración completada exitosamente. Columna status convertida a invitation_status enum.';
END $$;

-- 6. Mostrar estadísticas de la tabla después de la migración
SELECT 
    status,
    COUNT(*) as count
FROM pending_invitations 
GROUP BY status 
ORDER BY status;