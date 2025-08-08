#!/bin/bash

# Supabase Migration Execution Script
# This script attempts multiple methods to execute the migration

set -e  # Exit on error

echo "🚀 Starting Supabase Database Migration"
echo "=================================="

# Load environment variables
source .env

if [[ -z "$VITE_SUPABASE_URL" ]] || [[ -z "$VITE_SUPABASE_SERVICE_ROLE_KEY" ]]; then
    echo "❌ Missing Supabase environment variables"
    echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:+present}"
    echo "VITE_SUPABASE_SERVICE_ROLE_KEY: ${VITE_SUPABASE_SERVICE_ROLE_KEY:+present}"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📄 Migration file: complete_migration.sql"

# Method 1: Try using psql with connection string (if available)
echo ""
echo "🔄 Method 1: Attempting psql connection..."

PROJECT_REF="pqhlpfsdtgbldgbzatpf"
DB_PASSWORD="$VITE_SUPABASE_SERVICE_ROLE_KEY"

# Try different connection methods
CONNECTION_STRINGS=(
    "postgresql://postgres:$DB_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
    "postgresql://postgres.$PROJECT_REF:$DB_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require"
    "postgresql://postgres.$PROJECT_REF:$DB_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
)

for conn_str in "${CONNECTION_STRINGS[@]}"; do
    echo "🔌 Trying: ${conn_str:0:50}..."
    if command -v psql >/dev/null 2>&1; then
        if timeout 30 psql "$conn_str" -c "SELECT version();" >/dev/null 2>&1; then
            echo "✅ Connection successful! Executing migration..."
            psql "$conn_str" -f complete_migration.sql
            echo "🎉 Migration completed successfully!"
            exit 0
        else
            echo "❌ Connection failed"
        fi
    else
        echo "⚠️  psql not available"
        break
    fi
done

# Method 2: Try using curl with REST API
echo ""
echo "🔄 Method 2: Attempting REST API approach..."

# Read the SQL file and prepare for API call
SQL_CONTENT=$(cat complete_migration.sql)

# Split into smaller chunks and execute via SQL Editor API
SUPABASE_URL="${VITE_SUPABASE_URL}"
SERVICE_ROLE_KEY="${VITE_SUPABASE_SERVICE_ROLE_KEY}"

# Try to execute via Supabase REST API
echo "🌐 Attempting REST API execution..."

# Create a simple SQL statement to test connection
TEST_SQL="SELECT 1 as test;"

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/sql" \
     -H "apikey: ${SERVICE_ROLE_KEY}" \
     -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
     -H "Content-Type: application/json" \
     -d "{\"sql\": \"${TEST_SQL}\"}" \
     --fail --silent --show-error

if [ $? -eq 0 ]; then
    echo "✅ REST API connection successful!"
    echo "⚠️  Note: Full migration via REST API requires manual execution"
    echo "📝 Please use the Supabase Dashboard SQL Editor to run complete_migration.sql"
else
    echo "❌ REST API connection failed"
fi

# Method 3: Instructions for manual execution
echo ""
echo "🔄 Method 3: Manual execution instructions"
echo "=========================================="
echo ""
echo "Since automated execution failed, please follow these steps:"
echo ""
echo "1. 🌐 Open your Supabase Dashboard: https://app.supabase.com/projects/$PROJECT_REF"
echo "2. 📝 Go to SQL Editor"
echo "3. 📋 Copy the contents of 'complete_migration.sql' and paste it"
echo "4. ▶️  Click 'Run' to execute the migration"
echo "5. ✅ Verify that all tables were created successfully"
echo ""
echo "Alternative: Use Supabase CLI"
echo "📦 Install: npm install -g supabase"
echo "🔐 Login: supabase login"
echo "🔗 Link: supabase link --project-ref $PROJECT_REF"
echo "📜 Run: supabase db reset --db-url 'postgresql://postgres:[PASSWORD]@db.$PROJECT_REF.supabase.co:5432/postgres'"
echo ""

echo "📁 Files created:"
echo "  - complete_migration.sql (Full migration SQL)"
echo "  - migrate_database.py (Python migration script)"
echo "  - migrate_supabase.js (Node.js migration script)"
echo ""
echo "🎯 Next steps: Execute the migration using one of the above methods"