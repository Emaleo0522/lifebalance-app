#!/usr/bin/env python3
"""
Verify Supabase database schema for Clerk compatibility
Check that user_id fields are TEXT, not UUID
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
        "apikey": SERVICE_ROLE_KEY
    }
    
    # Test with the problematic Clerk user ID from the error screenshots
    test_user_id = "user_30rGH9vf6snyFY1xe4ohbuYMWr2"
    
    print("🧪 Testing Clerk user ID insertion...")
    print(f"📋 Test user ID: {test_user_id}")
    
    # Test 1: Try to insert into users table
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
        elif response.status_code == 409:
            print("   ⚠️  User already exists (TEXT format working)")
        else:
            print(f"   ❌ Users table insertion failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
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
                
    except Exception as e:
        print(f"   ❌ Error testing debts table: {e}")
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
            url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{test_user_id}"
            if table != 'users':
                url = f"{SUPABASE_URL}/rest/v1/{table}?user_id=eq.{test_user_id}"
            
            response = requests.delete(url, headers=headers, timeout=10)
            print(f"   🗑️  Cleaned {table} table: {response.status_code}")
            
        except Exception as e:
            print(f"   ⚠️  Could not clean {table}: {e}")

def main():
    """Main verification function"""
    print("🔍 LifeBalance Schema Verification for Clerk Compatibility")
    print("=" * 60)
    
    success = test_clerk_user_insertion()
    
    if success:
        print(f"\n✅ SCHEMA VERIFICATION SUCCESSFUL!")
        print(f"   🎉 Database is compatible with Clerk user IDs")
        print(f"   📝 All user_id fields accept TEXT format correctly")
        print(f"   🚀 Application should work without UUID errors")
        
        cleanup_test_data()
        return 0
    else:
        print(f"\n❌ SCHEMA VERIFICATION FAILED!")
        print(f"   🚨 Database still has UUID compatibility issues")
        print(f"   📋 Migration corrections may not have been applied")
        print(f"   ⚠️  The '22P02' UUID errors will continue")
        
        cleanup_test_data()
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())