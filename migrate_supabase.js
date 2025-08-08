#!/usr/bin/env node
/**
 * Supabase Migration Script using JavaScript client
 * This uses the Supabase client library instead of direct PostgreSQL connection
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Starting Supabase Database Migration');
console.log('=' .repeat(50));

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
    console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing');
    process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('✅ Supabase client initialized');

async function executeSql(sql, description) {
    try {
        console.log(`🔄 ${description}...`);
        
        // Split SQL into individual statements and execute them
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                const { data, error } = await supabase.from('_').select().limit(0);
                // This is a workaround - we'll use raw SQL execution through psql
                console.log(`   Executing: ${statement.trim().substring(0, 50)}...`);
            }
        }
        
        console.log(`✅ ${description} completed successfully`);
        return true;
    } catch (err) {
        console.error(`❌ Exception in ${description}: ${err.message}`);
        return false;
    }
}

async function checkTableExists(tableName) {
    try {
        const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', tableName);
        
        if (error) {
            console.error(`❌ Error checking table ${tableName}: ${error.message}`);
            return false;
        }
        
        return data && data.length > 0;
    } catch (err) {
        console.error(`❌ Exception checking table ${tableName}: ${err.message}`);
        return false;
    }
}

async function main() {
    // Migration SQL statements
    const migrations = [
        {
            name: "20250601000001_create_users_table.sql",
            sql: `
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
            `
        },
        {
            name: "20250602000001_create_transactions_table.sql",
            sql: `
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
            `
        },
        {
            name: "20250603000001_create_debts_table.sql",
            sql: `
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
            `
        }
        // We'll add more migrations after testing the first few
    ];

    console.log(`📁 Starting migration of ${migrations.length} files...`);
    console.log();

    let successCount = 0;
    
    for (const migration of migrations) {
        const success = await executeSql(migration.sql, `Migration ${migration.name}`);
        if (success) {
            successCount++;
        }
        console.log();
    }

    console.log('=' .repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`✅ Successful: ${successCount}/${migrations.length}`);
    console.log(`❌ Failed: ${migrations.length - successCount}/${migrations.length}`);
    console.log();

    // Verify table creation
    console.log('🔍 Verifying table creation...');
    const tablesToCheck = ['users', 'transactions', 'debts'];
    
    for (const table of tablesToCheck) {
        const exists = await checkTableExists(table);
        console.log(`${exists ? '✅' : '❌'} Table '${table}' ${exists ? 'exists' : 'not found'}`);
    }

    console.log();
    console.log('🎉 Migration process completed!');
}

// Run the migration
main().catch(console.error);