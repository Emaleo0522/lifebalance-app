-- Crear tabla para notificaciones de invitaciones
CREATE TABLE IF NOT EXISTS public.invitation_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitation_id UUID NOT NULL REFERENCES public.pending_invitations(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    inviter_name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'))
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_invitation_notifications_user_id ON public.invitation_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_invitation_notifications_status ON public.invitation_notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invitation_notifications_created_at ON public.invitation_notifications(created_at);

-- Habilitar RLS
ALTER TABLE public.invitation_notifications ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications" ON public.invitation_notifications
    FOR SELECT USING (user_id = auth.uid());

-- Política: Solo el sistema puede insertar notificaciones
CREATE POLICY "System can insert notifications" ON public.invitation_notifications
    FOR INSERT WITH CHECK (true);

-- Política: Los usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "Users can update own notifications" ON public.invitation_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Función para crear notificación automáticamente
CREATE OR REPLACE FUNCTION create_invitation_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo crear notificación si es para usuario registrado
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = NEW.email) THEN
        INSERT INTO public.invitation_notifications (
            user_id,
            invitation_id,
            group_id,
            inviter_name,
            group_name,
            role
        )
        SELECT 
            u.id,
            NEW.id,
            NEW.group_id,
            NEW.inviter_name,
            NEW.family_group_name,
            NEW.role
        FROM auth.users u
        WHERE u.email = NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear notificación automáticamente
DROP TRIGGER IF EXISTS trigger_create_invitation_notification ON pending_invitations;
CREATE TRIGGER trigger_create_invitation_notification
    AFTER INSERT ON pending_invitations
    FOR EACH ROW
    EXECUTE FUNCTION create_invitation_notification();

-- Función para aceptar invitación desde notificación
CREATE OR REPLACE FUNCTION accept_invitation_notification(notification_id UUID)
RETURNS JSON AS $$
DECLARE
    notification_record RECORD;
    result JSON;
BEGIN
    -- Obtener información de la notificación
    SELECT * INTO notification_record
    FROM invitation_notifications
    WHERE id = notification_id
    AND user_id = auth.uid()
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Notification not found or already processed');
    END IF;
    
    -- Verificar si ya es miembro del grupo
    IF EXISTS (
        SELECT 1 FROM family_members 
        WHERE group_id = notification_record.group_id 
        AND user_id = notification_record.user_id
    ) THEN
        RETURN json_build_object('success', false, 'error', 'User is already a member of this group');
    END IF;
    
    -- Agregar usuario al grupo
    INSERT INTO family_members (group_id, user_id, role)
    VALUES (notification_record.group_id, notification_record.user_id, notification_record.role);
    
    -- Actualizar estado de la notificación
    UPDATE invitation_notifications
    SET status = 'accepted', read_at = NOW()
    WHERE id = notification_id;
    
    -- Actualizar estado de la invitación
    UPDATE pending_invitations
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = notification_record.invitation_id;
    
    RETURN json_build_object('success', true, 'message', 'Invitation accepted successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para rechazar invitación desde notificación
CREATE OR REPLACE FUNCTION reject_invitation_notification(notification_id UUID)
RETURNS JSON AS $$
DECLARE
    notification_record RECORD;
BEGIN
    -- Obtener información de la notificación
    SELECT * INTO notification_record
    FROM invitation_notifications
    WHERE id = notification_id
    AND user_id = auth.uid()
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Notification not found or already processed');
    END IF;
    
    -- Actualizar estado de la notificación
    UPDATE invitation_notifications
    SET status = 'rejected', read_at = NOW()
    WHERE id = notification_id;
    
    -- Actualizar estado de la invitación
    UPDATE pending_invitations
    SET status = 'cancelled'
    WHERE id = notification_record.invitation_id;
    
    RETURN json_build_object('success', true, 'message', 'Invitation rejected successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permisos
GRANT EXECUTE ON FUNCTION accept_invitation_notification(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_invitation_notification(UUID) TO authenticated;

-- Comentarios para documentación
COMMENT ON TABLE invitation_notifications IS 'Notificaciones de invitaciones para usuarios registrados';
COMMENT ON FUNCTION create_invitation_notification() IS 'Crea notificación automáticamente cuando se invita a usuario registrado';
COMMENT ON FUNCTION accept_invitation_notification(UUID) IS 'Acepta invitación desde notificación';
COMMENT ON FUNCTION reject_invitation_notification(UUID) IS 'Rechaza invitación desde notificación';