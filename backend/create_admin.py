#!/usr/bin/env python3
"""
Quick script to create an admin user in Supabase
Run this script to set up your first admin account
"""

import hashlib
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY or SUPABASE_KEY)

def create_admin(name, email, password):
    """Create an admin user in the database"""
    
    # Hash the password
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        # Check if admin already exists
        existing = supabase.table("admins").select("id").eq("email", email).execute()
        if existing.data:
            print(f"❌ Admin with email '{email}' already exists!")
            return False
        
        # Insert new admin
        result = supabase.table("admins").insert({
            "name": name,
            "email": email,
            "password_hash": password_hash
        }).execute()
        
        if result.data:
            print(f"✅ Admin created successfully!")
            print(f"   Name: {name}")
            print(f"   Email: {email}")
            print(f"\n🔐 You can now login with these credentials")
            print(f"   Use the 'Admin' tab on the login page")
            return True
        else:
            print("❌ Failed to create admin")
            print(f"   Error: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_admins_table():
    """Check if admins table exists"""
    try:
        result = supabase.table("admins").select("count").execute()
        print("✅ Admins table exists and is accessible")
        return True
    except Exception as e:
        print(f"❌ Admins table doesn't exist or isn't accessible")
        print(f"   Error: {e}")
        print("\n📋 Please run the SQL from SETUP_INSTRUCTIONS.md first:")
        print("   CREATE TABLE admins (...);")
        return False

if __name__ == "__main__":
    print("🔧 RailSupply Admin Setup Tool")
    print("=" * 40)
    
    # Check if table exists
    if not check_admins_table():
        exit(1)
    
    # Get admin details
    print("\n📝 Enter admin details:")
    name = input("   Name: ").strip()
    email = input("   Email: ").strip()
    password = input("   Password: ").strip()
    
    if not name or not email or not password:
        print("❌ All fields are required!")
        exit(1)
    
    # Create admin
    if create_admin(name, email, password):
        print("\n🎉 Setup complete! You can now login as admin.")
    else:
        print("\n❌ Setup failed. Please check the error messages.")
        exit(1)