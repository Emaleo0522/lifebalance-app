-- Create pending_invitations table for managing email invitations
CREATE TABLE IF NOT EXISTS public.pending_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON public.pending_invitations(email);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_group_id ON public.pending_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_status ON public.pending_invitations(status);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_expires_at ON public.pending_invitations(expires_at);

-- RLS policies
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see invitations for groups they own or are members of
CREATE POLICY "Users can view group invitations" ON public.pending_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_groups fg
            WHERE fg.id = pending_invitations.group_id
            AND (fg.owner_id = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM public.family_members fm
                     WHERE fm.group_id = fg.id AND fm.user_id = auth.uid()
                 ))
        )
    );

-- Policy: Users can create invitations for groups they own
CREATE POLICY "Group owners can create invitations" ON public.pending_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.family_groups
            WHERE id = group_id AND owner_id = auth.uid()
        )
    );

-- Policy: Users can update invitations they created or for their email
CREATE POLICY "Users can update own invitations" ON public.pending_invitations
    FOR UPDATE USING (
        invited_by = auth.uid() OR 
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Policy: Users can delete invitations for groups they own
CREATE POLICY "Group owners can delete invitations" ON public.pending_invitations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.family_groups
            WHERE id = group_id AND owner_id = auth.uid()
        )
    );

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE public.pending_invitations 
    SET status = 'expired'
    WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to table
COMMENT ON TABLE public.pending_invitations IS 'Stores pending email invitations for family groups';
COMMENT ON COLUMN public.pending_invitations.email IS 'Email address of the invited person';
COMMENT ON COLUMN public.pending_invitations.group_id IS 'ID of the family group they are invited to';
COMMENT ON COLUMN public.pending_invitations.invited_by IS 'ID of the user who sent the invitation';
COMMENT ON COLUMN public.pending_invitations.role IS 'Role the invited person will have in the group';
COMMENT ON COLUMN public.pending_invitations.expires_at IS 'When the invitation expires';
COMMENT ON COLUMN public.pending_invitations.accepted_at IS 'When the invitation was accepted';
COMMENT ON COLUMN public.pending_invitations.status IS 'Current status of the invitation';