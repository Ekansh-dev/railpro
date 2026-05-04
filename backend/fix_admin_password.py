#!/usr/bin/env python3
"""
Script to fix admin password by updating the stored hash directly
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

def fix_admin_password(email, new_password):
    """Update admin password in the database"""
    
    # Hash the new password correctly
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    try:
        # Check if admin exists
        existing = supabase.table("admins").select("id").eq("email", email).execute()
        if not existing.data:
            print(f"❌ Admin with email '{email}' not found!")
            return False
        
        # Update the password hash
        result = supabase.table("admins").update({
            "password_hash": password_hash
        }).eq("email", email).execute()
        
        if result.data:
            print(f"✅ Password updated successfully for: {email}")
            print(f"   New password hash: {password_hash}")
            print(f"\n🔐 You can now login with:")
            print(f"   Email: {email}")
            print(f"   Password: {new_password}")
            return True
        else:
            print("❌ Failed to update password")
            print(f"   Error: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 RailSupply Admin Password Fix Tool")
    print("=" * 40)
    
    # Get admin details
    print("\n📝 Enter admin details:")
    email = input("   Email: ").strip()
    new_password = input("   New Password: ").strip()
    
    if not email or not new_password:
        print("❌ Email and password are required!")
        exit(1)
    
    # Fix password
    if fix_admin_password(email, new_password):
        print("\n🎉 Password fixed! You can now login.")
    else:
        print("\n❌ Failed to fix password.")
        exit(1)