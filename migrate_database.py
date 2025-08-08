#!/usr/bin/env python3
"""
Database migration script for LifeBalance app
Applies all corrected migrations with Clerk-compatible TEXT user IDs
"""

import psycopg2
import os
import sys
from pathlib import Path

# Database connection details
DB_CONFIG = {
    'host': 'aws-0-us-west-1.pooler.supabase.com',
    'port': 6543,
    'database': 'postgres',
    'user': 'postgres.pqhlpfsdtgbldgbzatpf',
    'password': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaGxwZnNkdGdibGRnYnphdHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExMjc1OSwiZXhwIjoyMDY1Njg4NzU5fQ.lby8r8Xgi2-IbmpfVRhtGZHB-gjniMBdpkaw636c_ns'
}

# Migration files in chronological order
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

def connect_to_database():
    """Establish connection to Supabase PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        print("✅ Successfully connected to Supabase database")
        return conn
    except psycopg2.Error as e:
        print(f"❌ Failed to connect to database: {e}")
        return None

def read_migration_file(filepath):
    """Read migration SQL file content"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        print(f"❌ Migration file not found: {filepath}")
        return None
    except Exception as e:
        print(f"❌ Error reading file {filepath}: {e}")
        return None

def execute_migration(cursor, filename, sql_content):
    """Execute a single migration file"""
    print(f"\n📄 Applying migration: {filename}")
    
    try:
        # Split SQL content by statements (basic split on semicolon + newline)
        statements = [stmt.strip() for stmt in sql_content.split(';\n') if stmt.strip()]
        
        for i, statement in enumerate(statements, 1):
            if statement and not statement.startswith('--'):
                try:
                    cursor.execute(statement + ';')
                    print(f"   ✅ Statement {i}/{len(statements)} executed")
                except psycopg2.Error as e:
                    # Check if it's a harmless "already exists" error
                    if "already exists" in str(e).lower():
                        print(f"   ⚠️  Statement {i}/{len(statements)} - Already exists (skipped)")
                    else:
                        print(f"   ❌ Statement {i}/{len(statements)} failed: {e}")
                        raise
        
        print(f"✅ Migration {filename} completed successfully")
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Migration {filename} failed: {e}")
        return False

def verify_tables(cursor):
    """Verify that all expected tables exist with correct schema"""
    expected_tables = [
        'users', 'transactions', 'debts', 'family_groups', 
        'family_members', 'shared_tasks', 'shared_expenses', 
        'pending_invitations'
    ]
    
    print(f"\n🔍 Verifying table creation...")
    
    for table in expected_tables:
        try:
            cursor.execute(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{table}' 
                AND table_schema = 'public'
                ORDER BY ordinal_position;
            """)
            
            columns = cursor.fetchall()
            if columns:
                print(f"✅ Table '{table}' exists with {len(columns)} columns")
                # Check for user_id columns and verify they are TEXT
                for col_name, col_type in columns:
                    if 'user_id' in col_name.lower() or col_name in ['id', 'owner_id', 'invited_by', 'created_by', 'paid_by']:
                        if col_type in ['text', 'character varying']:
                            print(f"   ✅ Column '{col_name}': {col_type} (Clerk compatible)")
                        elif col_type == 'uuid' and 'user' in col_name.lower():
                            print(f"   ⚠️  Column '{col_name}': {col_type} (May cause Clerk issues)")
            else:
                print(f"❌ Table '{table}' does not exist")
                
        except psycopg2.Error as e:
            print(f"❌ Error checking table '{table}': {e}")

def main():
    """Main migration execution function"""
    print("🚀 Starting LifeBalance Database Migration")
    print("=" * 50)
    
    # Connect to database
    conn = connect_to_database()
    if not conn:
        sys.exit(1)
    
    cursor = conn.cursor()
    migrations_path = Path('/home/lucasv/lifebalance-app/supabase/migrations')
    
    successful_migrations = 0
    failed_migrations = 0
    
    # Apply migrations in order
    for filename in MIGRATION_FILES:
        filepath = migrations_path / filename
        
        if not filepath.exists():
            print(f"⚠️  Migration file not found: {filename} (skipping)")
            continue
            
        sql_content = read_migration_file(filepath)
        if sql_content:
            if execute_migration(cursor, filename, sql_content):
                successful_migrations += 1
            else:
                failed_migrations += 1
        else:
            failed_migrations += 1
    
    # Verify tables
    verify_tables(cursor)
    
    # Summary
    print(f"\n📊 Migration Summary:")
    print(f"✅ Successful migrations: {successful_migrations}")
    print(f"❌ Failed migrations: {failed_migrations}")
    print(f"📁 Total migration files: {len(MIGRATION_FILES)}")
    
    cursor.close()
    conn.close()
    
    if failed_migrations == 0:
        print("\n🎉 All migrations completed successfully!")
        print("   Database is ready for LifeBalance application with Clerk authentication")
        return 0
    else:
        print(f"\n⚠️  {failed_migrations} migrations failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())