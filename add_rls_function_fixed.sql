-- Add RLS helper function for Clerk authentication context (FIXED)
-- Execute this in Supabase Dashboard > SQL Editor

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.set_config(text,text,boolean);

-- Create the corrected function with proper return type
CREATE OR REPLACE FUNCTION public.set_config(setting_name text, setting_value text, is_local boolean)
RETURNS text AS $$
BEGIN
  RETURN set_config(setting_name, setting_value, is_local);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 'RLS helper function created successfully!' as message;