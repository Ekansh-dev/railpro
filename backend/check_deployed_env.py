#!/usr/bin/env python3
"""
Script to check the current Supabase connection and admin status
This helps diagnose if the deployed backend is using the correct database
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

print("🔍 Checking Supabase Connection Configuration")
print("=" * 50)
print(f"\nSUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_KEY: {SUPABASE_KEY[:20]}...")
if SUPABASE_SECRET_KEY:
    print(f"SUPABASE_SECRET_KEY: {SUPABASE_SECRET_KEY[:20]}...")

# Create Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY or SUPABASE_KEY)
    print("\n✅ Successfully connected to Supabase")
except Exception as e:
    print(f"\n❌ Failed to connect to Supabase: {e}")
    exit(1)

# Check admins table
print("\n📋 Checking Admins Table...")
try:
    result = supabase.table("admins").select("id, name, email, password_hash").execute()
    
    if not result.data:
        print("❌ No admins found in database!")
        print("   The admins table is empty or doesn't exist.")
    else:
        print(f"✅ Found {len(result.data)} admin(s):")
        for admin in result.data:
            print(f"\n   Admin #{result.data.index(admin) + 1}:")
            print(f"   - ID: {admin['id']}")
            print(f"   - Name: {admin['name']}")
            print(f"   - Email: {admin['email']}")
            print(f"   - Password hash: {admin['password_hash']}")
            print(f"   - Hash length: {len(admin['password_hash'])} characters")
            
            # Check if hash is valid (should be exactly 64 chars for SHA-256)
            if len(admin['password_hash']) != 64:
                print(f"   ⚠️  WARNING: Hash length is {len(admin['password_hash'])}, expected 64!")
                print(f"   This indicates a corrupted hash.")
            
except Exception as e:
    print(f"❌ Error checking admins: {e}")
    print("   The admins table may not exist or you may not have permission to access it.")

print("\n" + "=" * 50)
print("💡 Next Steps:")
print("   1. Verify the SUPABASE_URL matches your expected project")
print("   2. Check if the admin account exists in this database")
print("   3. If using Render, check the environment variables in your dashboard")
print("   4. The deployed backend must use the same Supabase project as your local .env")