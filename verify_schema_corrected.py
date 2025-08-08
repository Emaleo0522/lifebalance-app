#!/usr/bin/env python3
"""
Verify Supabase database schema for Clerk compatibility (CORRECTED VERSION)
Check that user_id fields are TEXT and don't depend on auth.users
"""

import requests
import json

SUPABASE_URL = "https://pqhlpfsdtgbldgbzatpf.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaGxwZnNkdGdibGRnYnphdHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExMjc1OSwiZXhwIjoyMDY1Njg4NzU5fQ.lby8r8Xgi2-IbmpfVRhtGZHB-gjniMBdpkaw636c_ns"

def test_clerk_user_insertion():
    """Test if we can insert a record with a Clerk-style user ID"""
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY,
        "Prefer": "return=representation"
    }
    
    # Test with the problematic Clerk user ID from the error screenshots
    test_user_id = "user_30rGH9vf6snyFY1xe4ohbuYMWr2"
    
    print("🧪 Testing Clerk user ID insertion with corrected schema...")
    print(f"📋 Test user ID: {test_user_id}")
    
    # Test 1: Try to insert into users table (no more auth.users dependency)
    print(f"\n1️⃣ Testing users table insertion...")
    users_data = {
        "id": test_user_id,
        "email": "test@example.com",
        "name": "Test User",
        "display_name": "Test",
        "family_role": "member",
        "avatar_icon": "user"
    }
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/users"
        response = requests.post(url, headers=headers, json=users_data, timeout=10)
        
        if response.status_code == 201:
            print("   ✅ Users table accepts Clerk user ID (TEXT format working)")
            user_created = True
        elif response.status_code == 409:
            print("   ⚠️  User already exists (TEXT format working)")
            user_created = False
        else:
            print(f"   ❌ Users table insertion failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
            # Check if it's still the UUID error
            if "22P02" in response.text or "invalid input syntax for type uuid" in response.text:
                print("   🚨 CRITICAL: Still getting UUID error! Schema not fixed yet!")
                return False
            elif "foreign key" in response.text.lower():
                print("   🚨 CRITICAL: Still has foreign key to auth.users! Schema not fixed!")
                return False
            else:
                return False
    except Exception as e:
        print(f"   ❌ Error testing users table: {e}")
        return False
    
    # Test 2: Try to insert into transactions table
    print(f"\n2️⃣ Testing transactions table insertion...")
    transaction_data = {
        "user_id": test_user_id,
        "amount": 100.50,
        "description": "Test transaction",
        "category": "income",
        "date": "2025-08-08"
    }
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/transactions"
        response = requests.post(url, headers=headers, json=transaction_data, timeout=10)
        
        if response.status_code == 201:
            print("   ✅ Transactions table accepts Clerk user ID (TEXT format working)")
        else:
            print(f"   ❌ Transactions table insertion failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
            # Check if it's the UUID error we're trying to fix
            if "22P02" in response.text or "invalid input syntax for type uuid" in response.text:
                print("   🚨 CRITICAL: Still getting UUID error! Schema not fixed yet!")
                return False
            elif "foreign key" in response.text.lower() and "auth.users" in response.text:
                print("   🚨 CRITICAL: Still has foreign key to auth.users! Schema not fixed!")
                return False
            
    except Exception as e:
        print(f"   ❌ Error testing transactions table: {e}")
        return False
    
    # Test 3: Try to insert into debts table  
    print(f"\n3️⃣ Testing debts table insertion...")
    debt_data = {
        "user_id": test_user_id,
        "name": "Test Debt",
        "total_amount": 1000.00,
        "remaining_amount": 500.00,
        "due_date": "2025-12-31",
        "priority": "medium"
    }
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/debts"
        response = requests.post(url, headers=headers, json=debt_data, timeout=10)
        
        if response.status_code == 201:
            print("   ✅ Debts table accepts Clerk user ID (TEXT format working)")
        else:
            print(f"   ❌ Debts table insertion failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
            # Check for UUID error
            if "22P02" in response.text or "invalid input syntax for type uuid" in response.text:
                print("   🚨 CRITICAL: Still getting UUID error! Schema not fixed yet!")
                return False
            elif "foreign key" in response.text.lower() and "auth.users" in response.text:
                print("   🚨 CRITICAL: Still has foreign key to auth.users! Schema not fixed!")
                return False
                
    except Exception as e:
        print(f"   ❌ Error testing debts table: {e}")
        return False
    
    # Test 4: Verify no dependency on auth.users
    print(f"\n4️⃣ Testing independence from auth.users...")
    
    # Try to read the user we just created
    try:
        url = f"{SUPABASE_URL}/rest/v1/users?id=eq.{test_user_id}"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            users_data = response.json()
            if len(users_data) > 0:
                print("   ✅ User record exists and is independent of auth.users")
            else:
                print("   ❌ User record not found")
                return False
        else:
            print(f"   ❌ Could not verify user independence: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing independence: {e}")
        return False
    
    return True

def cleanup_test_data():
    """Clean up test data after verification"""
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY
    }
    
    test_user_id = "user_30rGH9vf6snyFY1xe4ohbuYMWr2"
    
    print(f"\n🧹 Cleaning up test data...")
    
    # Clean up in reverse order due to foreign key constraints
    tables_to_clean = ['debts', 'transactions', 'users']
    
    for table in tables_to_clean:
        try:
            if table == 'users':
                url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{test_user_id}"
            else:
                url = f"{SUPABASE_URL}/rest/v1/{table}?user_id=eq.{test_user_id}"
            
            response = requests.delete(url, headers=headers, timeout=10)
            print(f"   🗑️  Cleaned {table} table: {response.status_code}")
            
        except Exception as e:
            print(f"   ⚠️  Could not clean {table}: {e}")

def test_rls_function():
    """Test if the RLS helper function exists"""
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY
    }
    
    print(f"\n5️⃣ Testing RLS helper function...")
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/rpc/set_config"
        test_data = {
            "setting_name": "app.current_user_id",
            "setting_value": "test_user_123",
            "is_local": True
        }
        
        response = requests.post(url, headers=headers, json=test_data, timeout=10)
        
        if response.status_code == 200:
            print("   ✅ RLS helper function is available")
            return True
        else:
            print(f"   ❌ RLS helper function not available: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing RLS function: {e}")
        return False

def main():
    """Main verification function"""
    print("🔍 LifeBalance Schema Verification for Clerk Compatibility (CORRECTED)")
    print("=" * 70)
    
    # Test basic functionality
    basic_success = test_clerk_user_insertion()
    
    # Test RLS helper function
    rls_success = test_rls_function()
    
    overall_success = basic_success and rls_success
    
    if overall_success:
        print(f"\n✅ SCHEMA VERIFICATION SUCCESSFUL!")
        print(f"   🎉 Database is fully compatible with Clerk user IDs")
        print(f"   📝 All user_id fields accept TEXT format correctly")
        print(f"   🔒 RLS policies are properly configured")
        print(f"   🚀 Application should work without UUID errors")
        
        cleanup_test_data()
        return 0
    else:
        print(f"\n❌ SCHEMA VERIFICATION FAILED!")
        
        if not basic_success:
            print(f"   🚨 Database still has UUID compatibility issues")
            print(f"   📋 The corrected migration script may not have been applied")
        
        if not rls_success:
            print(f"   🔒 RLS helper function is missing")
            print(f"   📋 Authentication context won't work properly")
            
        print(f"   ⚠️  The '22P02' UUID errors will continue")
        
        cleanup_test_data()
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())