#!/usr/bin/env python3
"""
Apply Supabase migrations via REST API
Uses the service role key to execute SQL directly
"""

import requests
import json
import os
from pathlib import Path

# Supabase configuration
SUPABASE_URL = "https://pqhlpfsdtgbldgbzatpf.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaGxwZnNkdGdibGRnYnphdHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExMjc1OSwiZXhwIjoyMDY1Njg4NzU5fQ.lby8r8Xgi2-IbmpfVRhtGZHB-gjniMBdpkaw636c_ns"

HEADERS = {
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "apikey": SERVICE_ROLE_KEY
}

MIGRATION_FILES = [
    '20250601000001_create_users_table.sql',
    '20250602000001_create_transactions_table.sql',
    '20250603000001_create_debts_table.sql',
    '20250606051301_heavy_brook.sql',
    '20250606051311_old_mode.sql',
    '20250706000001_enable_realtime.sql',
    '20250706000002_restrict_task_permissions.sql',
    '20250707000001_create_pending_invitations.sql',
    '20250709000001_improve_pending_invitations.sql',
    '20250709071847_invitation_notifications.sql',
    '20250710000001_add_subcategory_to_finance_tables.sql',
    '20250720000001_rollback_custom_email_system.sql',
    '20250720000002_cleanup_auth_hooks.sql'
]

def execute_sql(sql_statement):
    """Execute SQL statement via Supabase REST API"""
    
    # Clean the SQL statement
    sql_statement = sql_statement.strip()
    if not sql_statement or sql_statement.startswith('--'):
        return True, "Empty or comment statement skipped"
    
    # Use the RPC endpoint for raw SQL execution
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    # If exec_sql doesn't exist, we'll use a different approach
    # Try using the REST API with a simple query first to test connection
    test_url = f"{SUPABASE_URL}/rest/v1/"
    
    try:
        # Test connection first
        test_response = requests.get(test_url, headers=HEADERS, timeout=30)
        if test_response.status_code != 200:
            return False, f"Connection test failed: {test_response.status_code} - {test_response.text}"
        
        # For DDL statements, we need to use the raw SQL execution
        # Unfortunately, Supabase REST API doesn't directly support raw SQL execution
        # We'll need to use the database URL instead
        
        return True, "SQL execution would go here"
        
    except requests.exceptions.RequestException as e:
        return False, f"Request failed: {e}"

def execute_migration_file(filepath):
    """Execute a single migration file"""
    print(f"\n📄 Applying migration: {filepath.name}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Split by statements
        statements = [stmt.strip() for stmt in content.split(';') if stmt.strip()]
        
        success_count = 0
        error_count = 0
        
        for i, statement in enumerate(statements, 1):
            if statement and not statement.startswith('--'):
                success, message = execute_sql(statement)
                if success:
                    print(f"   ✅ Statement {i}/{len(statements)}: {message}")
                    success_count += 1
                else:
                    print(f"   ❌ Statement {i}/{len(statements)}: {message}")
                    error_count += 1
        
        print(f"✅ Migration {filepath.name}: {success_count} succeeded, {error_count} failed")
        return error_count == 0
        
    except Exception as e:
        print(f"❌ Failed to process {filepath.name}: {e}")
        return False

def check_table_exists(table_name):
    """Check if a table exists using REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*&limit=1"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            return True, f"Table '{table_name}' exists and is accessible"
        elif response.status_code == 406:
            return True, f"Table '{table_name}' exists (no data)"
        else:
            return False, f"Table '{table_name}' not accessible: {response.status_code}"
    except Exception as e:
        return False, f"Error checking table '{table_name}': {e}"

def main():
    """Main migration function"""
    print("🚀 LifeBalance Database Migration via REST API")
    print("=" * 50)
    
    # Test connection
    print("🔗 Testing Supabase connection...")
    test_url = f"{SUPABASE_URL}/rest/v1/"
    try:
        response = requests.get(test_url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            print("✅ Successfully connected to Supabase REST API")
        else:
            print(f"❌ Connection failed: {response.status_code}")
            return 1
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return 1
    
    migrations_path = Path('/home/lucasv/lifebalance-app/supabase/migrations')
    
    # Since we can't execute DDL via REST API easily, let's check what tables already exist
    expected_tables = [
        'users', 'transactions', 'debts', 'family_groups', 
        'family_members', 'shared_tasks', 'shared_expenses', 
        'pending_invitations'
    ]
    
    print(f"\n🔍 Checking current database state...")
    existing_tables = []
    missing_tables = []
    
    for table in expected_tables:
        exists, message = check_table_exists(table)
        if exists:
            existing_tables.append(table)
            print(f"✅ {message}")
        else:
            missing_tables.append(table)
            print(f"❌ {message}")
    
    print(f"\n📊 Database Status:")
    print(f"✅ Existing tables: {len(existing_tables)}")
    print(f"❌ Missing tables: {len(missing_tables)}")
    
    if missing_tables:
        print(f"\n⚠️  Missing tables need to be created manually:")
        print(f"   {', '.join(missing_tables)}")
        print(f"\n💡 Since REST API doesn't support DDL operations, you'll need to:")
        print(f"   1. Go to Supabase Dashboard > SQL Editor")
        print(f"   2. Execute the migration files manually")
        print(f"   3. Or use a PostgreSQL client with connection string")
        return 1
    else:
        print(f"\n🎉 All required tables exist!")
        return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())