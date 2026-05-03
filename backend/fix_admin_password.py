#!/usr/bin/env python3
"""
Fix admin password - convert plain text to SHA256 hash
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
    """Update admin password with proper SHA256 hash"""
    
    # Hash the password
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    print(f"🔧 Fixing password for admin: {email}")
    print(f"🔐 New password hash: {password_hash}")
    
    try:
        # Update the admin's password
        result = supabase.table("admins").update({
            "password_hash": password_hash
        }).eq("email", email).execute()
        
        if result.data:
            print("✅ Password updated successfully!")
            print(f"   You can now login with password: {new_password}")
            return True
        else:
            print("❌ Failed to update password")
            print("   Admin might not exist")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_current_password_format(email):
    """Check if password is stored as plain text or hash"""
    try:
        result = supabase.table("admins").select("password_hash").eq("email", email).execute()
        
        if not result.data:
            print(f"❌ No admin found with email: {email}")
            return None
        
        stored_hash = result.data[0]['password_hash']
        
        # Check if it looks like a SHA256 hash (64 hex characters)
        if len(stored_hash) == 64 and all(c in '0123456789abcdef' for c in stored_hash):
            print(f"✅ Password is properly hashed")
            return "hashed"
        else:
            print(f"⚠️  Password appears to be stored as plain text: {stored_hash[:10]}...")
            print(f"   This is a security risk and won't work with the login system!")
            return "plain"
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    print("🔧 Admin Password Fixer")
    print("=" * 50)
    print()
    
    # Check current format
    email = input("Enter admin email to fix: ").strip()
    
    if not email:
        print("❌ Email is required!")
        exit(1)
    
    format_type = check_current_password_format(email)
    
    if format_type == "hashed":
        print("\n✅ Password is already properly hashed!")
        print("   If you're still having login issues, you might be using the wrong password.")
        exit(0)
    elif format_type == "plain":
        print("\n⚠️  Password needs to be fixed!")
        new_password = input("Enter new password: ").strip()
        
        if not new_password:
            print("❌ Password is required!")
            exit(1)
        
        if fix_admin_password(email, new_password):
            print("\n🎉 Password fixed successfully!")
            print(f"   You can now login with: {email} / {new_password}")
        else:
            exit(1)
    else:
        print("\n❌ Could not check password format")
        exit(1)