#!/usr/bin/env python3
"""
Check user data migration status
"""

import requests
import json

SUPABASE_URL = "https://pqhlpfsdtgbldgbzatpf.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaGxwZnNkdGdibGRnYnphdHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExMjc1OSwiZXhwIjoyMDY1Njg4NzU5fQ.lby8r8Xgi2-IbmpfVRhtGZHB-gjniMBdpkaw636c_ns"

def check_user_data():
    """Check existing user data in the database"""
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY
    }
    
    print("🔍 Checking user data in database...")
    
    # Check users table
    try:
        url = f"{SUPABASE_URL}/rest/v1/users?select=*"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            users = response.json()
            print(f"\n👥 Users in database: {len(users)}")
            for user in users:
                print(f"   - ID: {user['id']}")
                print(f"     Email: {user['email']}")
                print(f"     Name: {user.get('name', 'N/A')}")
                print(f"     Created: {user['created_at']}")
                print()
        else:
            print(f"❌ Error getting users: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error checking users: {e}")
    
    # Check transactions
    try:
        url = f"{SUPABASE_URL}/rest/v1/transactions?select=*"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            transactions = response.json()
            print(f"💰 Transactions in database: {len(transactions)}")
            if transactions:
                print("   Sample transactions:")
                for i, trans in enumerate(transactions[:3]):
                    print(f"   - User: {trans['user_id']}, Amount: {trans['amount']}, Date: {trans['date']}")
        else:
            print(f"❌ Error getting transactions: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error checking transactions: {e}")
    
    # Check debts
    try:
        url = f"{SUPABASE_URL}/rest/v1/debts?select=*"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            debts = response.json()
            print(f"💳 Debts in database: {len(debts)}")
            if debts:
                print("   Sample debts:")
                for i, debt in enumerate(debts[:3]):
                    print(f"   - User: {debt['user_id']}, Name: {debt['name']}, Amount: {debt['total_amount']}")
        else:
            print(f"❌ Error getting debts: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error checking debts: {e}")

if __name__ == "__main__":
    check_user_data()