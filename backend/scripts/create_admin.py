#!/usr/bin/env python3
"""
CLI utility to seed, create, or update the Admin account in the 'staff' table.
Works interactively or with CLI arguments.
"""
import sys
import os
import argparse

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import supabase
from app.core.security import hash_password

def add_admin(name: str, email: str, password: str):
    email = email.strip().lower()
    name = name.strip()

    if not name:
        print("[ERROR] Name cannot be empty.")
        return False
    if not email:
        print("[ERROR] Email cannot be empty.")
        return False
    if len(password) < 6:
        print("[ERROR] Password must be at least 6 characters.")
        return False

    pwd_hash = hash_password(password)

    # Check if admin already exists
    existing = supabase.table("staff").select("id, name, role").ilike("email", email).execute()

    if existing.data:
        # Update existing record
        staff_id = existing.data[0]["id"]
        res = supabase.table("staff").update({
            "name": name,
            "password_hash": pwd_hash,
            "role": "admin",
        }).eq("id", staff_id).execute()

        if res.data:
            print(f"\n[OK] Admin account '{email}' updated with new name and password!")
            print("You can now log in through the portal with role: 'admin'.")
            return True
        else:
            print("\n[ERROR] Failed to update admin account.")
            return False
    else:
        # Insert new admin
        res = supabase.table("staff").insert({
            "name": name,
            "email": email,
            "password_hash": pwd_hash,
            "role": "admin",
        }).execute()

        if res.data:
            print(f"\n[OK] Admin '{name}' ({email}) created successfully in DB!")
            print("You can now log in through the portal with role: 'admin'.")
            return True
        else:
            print("\n[ERROR] Failed to insert admin into 'staff' table.")
            return False

def main():
    parser = argparse.ArgumentParser(description="Add or update an Admin account in Supabase")
    parser.add_argument("--name", type=str, help="Admin full name")
    parser.add_argument("--email", type=str, help="Admin email address")
    parser.add_argument("--password", type=str, help="Admin password")
    args = parser.parse_args()

    print("=" * 55)
    print("       RAILSUPPLY -- CREATE / UPDATE ADMIN")
    print("=" * 55)

    name = args.name or input("Enter Admin Name: ").strip()
    email = args.email or input("Enter Admin Email: ").strip()
    password = args.password or input("Enter Admin Password: ").strip()

    add_admin(name, email, password)

if __name__ == "__main__":
    main()
