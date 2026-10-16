#!/usr/bin/env python3
"""
CLI utility to seed/create the initial Admin account in the 'staff' table.
"""
import sys
import os

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import supabase
from app.core.security import hash_password

def create_admin():
    print("=" * 55)
    print("       RAILSUPPLY — CREATE ADMIN ACCOUNT")
    print("=" * 55)
    
    name = input("Enter Admin Name: ").strip()
    if not name:
        print("Name cannot be empty.")
        return
        
    email = input("Enter Admin Email: ").strip().lower()
    if not email:
        print("Email cannot be empty.")
        return
        
    password = input("Enter Admin Password: ").strip()
    if len(password) < 6:
        print("Password must be at least 6 characters.")
        return

    # Check if already exists
    existing = supabase.table("staff").select("id").ilike("email", email).execute()
    if existing.data:
        print(f"\n❌ A staff member with email '{email}' already exists!")
        return

    pwd_hash = hash_password(password)
    res = supabase.table("staff").insert({
        "name": name,
        "email": email,
        "password_hash": pwd_hash,
        "role": "admin",
    }).execute()

    if res.data:
        print(f"\n✅ Admin '{name}' ({email}) created successfully!")
        print("You can now log in through the portal with role: 'admin'.")
    else:
        print("\n❌ Failed to insert admin into 'staff' table.")

if __name__ == "__main__":
    create_admin()
