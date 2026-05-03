#!/usr/bin/env python3
"""
Test script to verify admin login works
Run this to check if your admin credentials are correct
"""

import hashlib
import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY or SUPABASE_KEY)

def test_admin_login(email, password):
    """Test if admin credentials are correct"""
    
    # Hash the password
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    print(f"🔍 Testing login for: {email}")
    print(f"🔐 Password hash: {password_hash}")
    print()
    
    try:
        # Query the database
        result = supabase.table("admins").select("*").eq("email", email).execute()
        
        if not result.data:
            print("❌ Admin not found in database!")
            print("   Please create an admin first using: python create_admin.py")
            return False
        
        admin = result.data[0]
        print(f"✅ Admin found in database:")
        print(f"   ID: {admin['id']}")
        print(f"   Name: {admin['name']}")
        print(f"   Email: {admin['email']}")
        print(f"   Stored hash: {admin['password_hash']}")
        print()
        
        # Compare passwords
        if admin['password_hash'] == password_hash:
            print("✅ Password matches! Login should work.")
            return True
        else:
            print("❌ Password does NOT match!")
            print("   The password you entered doesn't match the stored hash.")
            print("   Please create a new admin with the correct password.")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def list_all_admins():
    """List all admins in the database"""
    try:
        result = supabase.table("admins").select("id, name, email").execute()
        
        if not result.data:
            print("❌ No admins found in database!")
            return []
        
        print(f"📋 Found {len(result.data)} admin(s):")
        for admin in result.data:
            print(f"   - {admin['name']} ({admin['email']})")
        return result.data
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

if __name__ == "__main__":
    print("🔧 RailSupply Admin Login Tester")
    print("=" * 50)
    print()
    
    # First, check if admins table exists and list admins
    print("Step 1: Checking database...")
    admins = list_all_admins()
    
    if not admins:
        print("\n📋 No admins found. Please create one first:")
        print("   python create_admin.py")
        exit(1)
    
    print()
    print("Step 2: Test login")
    print("-" * 30)
    
    # Ask for credentials
    email = input("Enter admin email to test: ").strip()
    password = input("Enter admin password: ").strip()
    
    if not email or not password:
        print("❌ Email and password are required!")
        exit(1)
    
    # Test login
    print()
    if test_admin_login(email, password):
        print("\n🎉 Login test PASSED!")
        print("   Your credentials are correct.")
        print("   If you're still getting 'invalid credentials',")
        print("   check that your frontend is connecting to the correct backend.")
    else:
        print("\n❌ Login test FAILED!")
        print("   Please create a new admin with the correct credentials.")
        exit(1)