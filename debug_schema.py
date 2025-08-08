#!/usr/bin/env python3
"""
Debug database schema to identify UUID issues
"""

import requests
import json

SUPABASE_URL = "https://pqhlpfsdtgbldgbzatpf.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaGxwZnNkdGdibGRnYnphdHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExMjc1OSwiZXhwIjoyMDY1Njg4NzU5fQ.lby8r8Xgi2-IbmpfVRhtGZHB-gjniMBdpkaw636c_ns"

def test_table_insertions():
    """Test insertion into different tables to identify which ones have UUID issues"""
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY
    }
    
    test_user_id = "user_30rGH9vf6snyFY1xe4ohbuYMWr2"  # Existing user from check
    
    tables_to_test = [
        {
            "name": "debts",
            "data": {
                "user_id": test_user_id,
                "name": "Test Debt",
                "total_amount": 1000.00,
                "remaining_amount": 500.00,
                "due_date": "2025-12-31",
                "priority": "medium"
            }
        },
        {
            "name": "transactions", 
            "data": {
                "user_id": test_user_id,
                "amount": 100.50,
                "description": "Test transaction",
                "category": "income",
                "date": "2025-08-08"
            }
        },
        {
            "name": "invitation_notifications",
            "data": {
                "user_id": test_user_id,
                "message": "Test notification",
                "type": "info"
            }
        }
    ]
    
    results = {}
    
    for table_info in tables_to_test:
        table_name = table_info["name"]
        data = table_info["data"]
        
        print(f"\n🧪 Testing {table_name} table...")
        
        try:
            url = f"{SUPABASE_URL}/rest/v1/{table_name}"
            response = requests.post(url, headers=headers, json=data, timeout=10)
            
            if response.status_code == 201:
                print(f"   ✅ {table_name}: SUCCESS - Accepts TEXT user_id")
                results[table_name] = "SUCCESS"
                
                # Clean up test record
                delete_url = f"{SUPABASE_URL}/rest/v1/{table_name}?user_id=eq.{test_user_id}"
                requests.delete(delete_url, headers=headers, timeout=5)
                
            else:
                print(f"   ❌ {table_name}: FAILED - {response.status_code}")
                print(f"   📄 Response: {response.text}")
                
                # Check for UUID error specifically
                if "22P02" in response.text or "invalid input syntax for type uuid" in response.text:
                    print(f"   🚨 {table_name}: CONFIRMED UUID ISSUE!")
                    results[table_name] = "UUID_ERROR"
                else:
                    results[table_name] = f"OTHER_ERROR_{response.status_code}"
                    
        except Exception as e:
            print(f"   ❌ {table_name}: Exception - {e}")
            results[table_name] = f"EXCEPTION_{e}"
    
    print(f"\n📊 Summary of table compatibility:")
    for table, result in results.items():
        status = "✅" if result == "SUCCESS" else "❌"
        print(f"   {status} {table}: {result}")
    
    return results

def check_table_exists(table_name):
    """Check if table exists and get sample data"""
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY
    }
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/{table_name}?limit=1"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return True, len(data), data
        else:
            return False, 0, response.text
            
    except Exception as e:
        return False, 0, str(e)

if __name__ == "__main__":
    print("🔍 Debugging Database Schema Issues")
    print("=" * 50)
    
    # Check which tables exist
    tables = ["users", "debts", "transactions", "invitation_notifications", "family_groups"]
    
    print("\n📋 Checking table existence:")
    for table in tables:
        exists, count, info = check_table_exists(table)
        if exists:
            print(f"   ✅ {table}: EXISTS ({count} records)")
        else:
            print(f"   ❌ {table}: NOT FOUND - {info}")
    
    # Test insertions to identify UUID issues
    print("\n🧪 Testing table insertions...")
    results = test_table_insertions()
    
    # Summary
    uuid_issues = [table for table, result in results.items() if "UUID" in result]
    if uuid_issues:
        print(f"\n🚨 CRITICAL: These tables still have UUID issues:")
        for table in uuid_issues:
            print(f"   - {table}")
        print(f"\n💡 These tables need to be recreated with TEXT user_id fields")
    else:
        print(f"\n✅ All tested tables accept TEXT user_id correctly!")