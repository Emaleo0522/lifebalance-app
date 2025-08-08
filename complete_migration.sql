-- Complete Supabase Database Migration
-- Execute this script to set up all tables for the LifeBalance app

-- =============================================================================
-- Migration: 20250601000001_create_users_table.sql
-- =============================================================================

-- Create users table for Clerk integration
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,  -- Clerk user ID (string format)
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    username TEXT,
    display_name TEXT,
    family_role TEXT DEFAULT 'member',
    avatar_icon TEXT DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (auth.uid()::text = id);

-- =============================================================================
-- Migration: 20250602000001_create_transactions_table.sql
-- =============================================================================

-- Create transactions table for finance tracking
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for transactions
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own transactions" ON public.transactions
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.transactions
FOR DELETE USING (auth.uid()::text = user_id);

-- =============================================================================
-- Migration: 20250603000001_create_debts_table.sql
-- =============================================================================

-- Create debts table for debt tracking
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    creditor_name TEXT NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    remaining_amount DECIMAL(10,2) NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 0,
    due_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for debts
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON public.debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON public.debts(due_date);

-- Enable RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own debts
CREATE POLICY "Users can view their own debts" ON public.debts
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own debts" ON public.debts
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own debts" ON public.debts
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own debts" ON public.debts
FOR DELETE USING (auth.uid()::text = user_id);

-- =============================================================================
-- Migration: 20250606051301_heavy_brook.sql
-- =============================================================================

-- Create family groups table
CREATE TABLE IF NOT EXISTS public.family_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family members table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shared tasks table
CREATE TABLE IF NOT EXISTS public.shared_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT[], -- Array of user IDs
    due_date DATE,
    due_time TIME,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create shared expenses table
CREATE TABLE IF NOT EXISTS public.shared_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    paid_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    split_between TEXT[], -- Array of user IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_family_groups_owner_id ON public.family_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_family_members_group_id ON public.family_members(group_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_tasks_group_id ON public.shared_tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_group_id ON public.shared_expenses(group_id);

-- Unique constraint for family member per group
CREATE UNIQUE INDEX IF NOT EXISTS unique_family_member_per_group 
ON public.family_members(group_id, user_id);

-- =============================================================================
-- Migration: 20250606051311_old_mode.sql
-- =============================================================================

-- Enable RLS on family tables
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expenses ENABLE ROW LEVEL SECURITY;

-- Family groups policies
CREATE POLICY "Users can view groups they belong to" ON public.family_groups
FOR SELECT USING (
    owner_id = auth.uid()::text OR 
    id IN (SELECT group_id FROM public.family_members WHERE user_id = auth.uid()::text)
);

CREATE POLICY "Users can create family groups" ON public.family_groups
FOR INSERT WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Group owners can update their groups" ON public.family_groups
FOR UPDATE USING (owner_id = auth.uid()::text);

CREATE POLICY "Group owners can delete their groups" ON public.family_groups
FOR DELETE USING (owner_id = auth.uid()::text);

-- Family members policies
CREATE POLICY "Users can view members of their groups" ON public.family_members
FOR SELECT USING (
    group_id IN (
        SELECT id FROM public.family_groups 
        WHERE owner_id = auth.uid()::text OR 
        id IN (SELECT group_id FROM public.family_members WHERE user_id = auth.uid()::text)
    )
);

CREATE POLICY "Group owners can manage members" ON public.family_members
FOR ALL USING (
    group_id IN (SELECT id FROM public.family_groups WHERE owner_id = auth.uid()::text)
);

-- Shared tasks policies
CREATE POLICY "Users can view tasks in their groups" ON public.shared_tasks
FOR SELECT USING (
    group_id IN (
        SELECT id FROM public.family_groups 
        WHERE owner_id = auth.uid()::text OR 
        id IN (SELECT group_id FROM public.family_members WHERE user_id = auth.uid()::text)
    )
);

CREATE POLICY "Group members can create tasks" ON public.shared_tasks
FOR INSERT WITH CHECK (
    group_id IN (
        SELECT id FROM public.family_groups 
        WHERE owner_id = auth.uid()::text OR 
        id IN (SELECT group_id FROM public.family_members WHERE user_id = auth.uid()::text)
    ) AND created_by = auth.uid()::text
);

CREATE POLICY "Group members can update tasks" ON public.shared_tasks
FOR UPDATE USING (
    group_id IN (
        SELECT id FROM public.family_groups 
        WHERE owner_id = auth.uid()::text OR 
        id IN (SELECT group_id FROM public.family_members WHERE user_id = auth.uid()::text)
    )
);

-- Shared expenses policies
CREATE POLICY "Users can view expenses in their groups" ON public.shared_expenses
FOR SELECT USING (
    group_id IN (
        SELECT id FROM public.family_groups 
        WHERE owner_id = auth.uid()::text OR 
        id IN (SELECT group_id FROM public.family_members WHERE user_id = auth.uid()::text)
    )
);

CREATE POLICY "Group members can create expenses" ON public.shared_expenses
FOR INSERT WITH CHECK (
    group_id IN (
        SELECT id FROM public.family_groups 
        WHERE owner_id = auth.uid()::text OR 
        id IN (SELECT group_id FROM public.family_members WHERE user_id = auth.uid()::text)
    )
);

-- =============================================================================
-- Migration: 20250706000001_enable_realtime.sql
-- =============================================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_expenses;

-- =============================================================================
-- Migration: 20250706000002_restrict_task_permissions.sql
-- =============================================================================

-- More restrictive policies for shared tasks
DROP POLICY IF EXISTS "Group members can update tasks" ON public.shared_tasks;

CREATE POLICY "Task creators and assigned users can update" ON public.shared_tasks
FOR UPDATE USING (
    created_by = auth.uid()::text OR 
    auth.uid()::text = ANY(assigned_to) OR
    group_id IN (SELECT id FROM public.family_groups WHERE owner_id = auth.uid()::text)
);

CREATE POLICY "Task creators and group owners can delete" ON public.shared_tasks
FOR DELETE USING (
    created_by = auth.uid()::text OR
    group_id IN (SELECT id FROM public.family_groups WHERE owner_id = auth.uid()::text)
);

-- =============================================================================
-- Migration: 20250707000001_create_pending_invitations.sql
-- =============================================================================

-- Create pending invitations table
CREATE TABLE IF NOT EXISTS public.pending_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    invited_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pending_invitations_group_id ON public.pending_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON public.pending_invitations(email);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON public.pending_invitations(token);

-- Unique constraint for email per group (prevent duplicate invitations)
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_invitation_per_group 
ON public.pending_invitations(group_id, email) WHERE NOT accepted;

-- Enable RLS
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- Only group owners can manage invitations
CREATE POLICY "Group owners can view their invitations" ON public.pending_invitations
FOR SELECT USING (
    group_id IN (SELECT id FROM public.family_groups WHERE owner_id = auth.uid()::text)
);

CREATE POLICY "Group owners can create invitations" ON public.pending_invitations
FOR INSERT WITH CHECK (
    group_id IN (SELECT id FROM public.family_groups WHERE owner_id = auth.uid()::text) AND
    invited_by = auth.uid()::text
);

CREATE POLICY "Group owners can update their invitations" ON public.pending_invitations
FOR UPDATE USING (
    group_id IN (SELECT id FROM public.family_groups WHERE owner_id = auth.uid()::text)
);

-- =============================================================================
-- Migration: 20250709000001_improve_pending_invitations.sql
-- =============================================================================

-- Add status column to pending invitations
ALTER TABLE public.pending_invitations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'));

-- Update existing records
UPDATE public.pending_invitations 
SET status = CASE 
    WHEN accepted = true THEN 'accepted'
    WHEN expires_at < NOW() THEN 'expired'
    ELSE 'pending'
END
WHERE status IS NULL OR status = 'pending';

-- Add accepted_at column
ALTER TABLE public.pending_invitations 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- Update existing accepted invitations
UPDATE public.pending_invitations 
SET accepted_at = created_at 
WHERE accepted = true AND accepted_at IS NULL;

-- =============================================================================
-- Migration: 20250710000001_add_subcategory_to_finance_tables.sql
-- =============================================================================

-- Add subcategory to shared_expenses if not exists
ALTER TABLE public.shared_expenses 
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Create index for subcategory on transactions (already exists in earlier migration)
CREATE INDEX IF NOT EXISTS idx_shared_expenses_category ON public.shared_expenses(category);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_subcategory ON public.shared_expenses(subcategory);

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Final verification queries
SELECT 'Migration completed successfully!' as status;

-- Show created tables
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;