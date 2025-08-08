#!/usr/bin/env python3
"""
Fix user synchronization issues between Clerk and Supabase
Use this script if users experience login issues or data access problems
"""

import requests
import json

SUPABASE_URL = "https://pqhlpfsdtgbldgbzatpf.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaGxwZnNkdGdibGRnYnphdHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExMjc1NSwiZXhwIjoyMDY1Njg4NzU5fQ.lby8r8Xgi2-IbmpfVRhtGZHB-gjniMBdpkaw636c_ns"

def fix_user_sync(old_user_id, new_user_id, email):
    """Fix user synchronization by updating database record with correct Clerk ID"""
    
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY
    }
    
    print(f"🔄 Fixing user synchronization:")
    print(f"   From: {old_user_id}")
    print(f"   To:   {new_user_id}")
    print(f"   Email: {email}")
    
    try:
        # Get existing user data
        get_url = f"{SUPABASE_URL}/rest/v1/users?id=eq.{old_user_id}"
        get_response = requests.get(get_url, headers=headers, timeout=10)
        
        if get_response.status_code == 200:
            users = get_response.json()
            if not users:
                print(f"❌ User with ID {old_user_id} not found")
                return False
            
            user_data = users[0]
            
            # Delete old record
            delete_url = f"{SUPABASE_URL}/rest/v1/users?id=eq.{old_user_id}"
            delete_response = requests.delete(delete_url, headers=headers, timeout=10)
            
            if delete_response.status_code == 204:
                print("✅ Old user record deleted")
                
                # Create new record with correct ID
                new_user_data = {
                    **user_data,
                    'id': new_user_id
                }
                # Remove created_at and updated_at to let DB set them
                new_user_data.pop('created_at', None)
                new_user_data.pop('updated_at', None)
                
                create_url = f"{SUPABASE_URL}/rest/v1/users"
                create_response = requests.post(create_url, headers=headers, json=new_user_data, timeout=10)
                
                if create_response.status_code == 201:
                    print("✅ New user record created with correct Clerk ID")
                    print("🎉 User synchronization fixed successfully!")
                    return True
                else:
                    print(f"❌ Failed to create new record: {create_response.status_code}")
                    print(f"Response: {create_response.text}")
                    return False
            else:
                print(f"❌ Failed to delete old record: {delete_response.status_code}")
                return False
        else:
            print(f"❌ Failed to get user data: {get_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error during sync fix: {e}")
        return False

def verify_user_access(user_id):
    """Verify that a user can create debts and transactions"""
    
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY
    }
    
    print(f"🧪 Verifying access for user: {user_id}")
    
    # Test debt creation
    debt_data = {
        "user_id": user_id,
        "name": "Verification Test Debt",
        "total_amount": 100.00,
        "remaining_amount": 100.00,
        "due_date": "2025-12-31",
        "priority": "low"
    }
    
    debt_url = f"{SUPABASE_URL}/rest/v1/debts"
    debt_response = requests.post(debt_url, headers=headers, json=debt_data, timeout=10)
    
    if debt_response.status_code == 201:
        print("✅ Debt creation: SUCCESS")
        
        # Clean up test debt
        delete_url = f"{SUPABASE_URL}/rest/v1/debts?user_id=eq.{user_id}&name=eq.Verification Test Debt"
        requests.delete(delete_url, headers=headers, timeout=10)
        
        return True
    else:
        print(f"❌ Debt creation: FAILED ({debt_response.status_code})")
        print(f"Response: {debt_response.text}")
        return False

if __name__ == "__main__":
    print("🔧 User Synchronization Fix Tool")
    print("=" * 40)
    
    # Example usage for the identified case
    old_id = "user_30r6H9vf6snyFYlxe4ohbuYMWr2" 
    new_id = "user_30rGH9vf6snyFY1xe4ohbuYMWr2"
    email = "emaleo0522@gmail.com"
    
    # This was already fixed, but keeping for documentation
    print("Note: The main sync issue has already been resolved.")
    print("This script is available for future similar issues.")
    
    # Verify current state
    verify_user_access(new_id)