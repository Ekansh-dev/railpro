#!/usr/bin/env python3
"""
Diagnostic script to identify why dealer logins fail after registration
This script will:
1. Check which Supabase database is being connected to
2. List recent dealer registrations
3. Test login with known credentials
4. Provide recommendations
"""

import hashlib
import os
import json
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

print("=" * 70)
print("   DEALER LOGIN DIAGNOSTIC TOOL")
print("=" * 70)

# Step 1: Show current configuration
print("\n📋 CURRENT CONFIGURATION:")
print(f"   SUPABASE_URL: {SUPABASE_URL}")
print(f"   SUPABASE_KEY: {SUPABASE_KEY[:30]}...")
if SUPABASE_SECRET_KEY:
    print(f"   SUPABASE_SECRET_KEY: {SUPABASE_SECRET_KEY[:30]}...")

# Create Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY or SUPABASE_KEY)
    print("\n✅ Successfully connected to Supabase")
except Exception as e:
    print(f"\n❌ Failed to connect to Supabase: {e}")
    exit(1)

# Step 2: Check dealers table
print("\n" + "=" * 70)
print("📊 DEALERS TABLE ANALYSIS:")
print("=" * 70)

try:
    # Get all dealers
    result = supabase.table("dealers").select("*").execute()
    
    if not result.data:
        print("\n❌ No dealers found in database!")
        print("   This means either:")
        print("   1. The dealers table is empty")
        print("   2. You're connected to the wrong Supabase project")
        print("   3. The dealers table doesn't exist")
    else:
        print(f"\n✅ Found {len(result.data)} dealer(s) in database")
        
        # Analyze password hashes
        print("\n🔐 PASSWORD HASH ANALYSIS:")
        all_valid = True
        for dealer in result.data:
            hash_val = dealer.get('password_hash', '')
            is_valid = len(hash_val) == 64 and all(c in '0123456789abcdef' for c in hash_val)
            status = "✅ VALID" if is_valid else "❌ INVALID"
            if not is_valid:
                all_valid = False
            print(f"   {dealer['email']}: {status} (length: {len(hash_val)})")
        
        if all_valid:
            print("\n✅ All password hashes are valid SHA-256 hashes")
        else:
            print("\n⚠️  Some password hashes are invalid!")
            print("   This could cause login failures.")
        
        # Show recent registrations (last 7 days)
        print("\n📅 RECENT REGISTRATIONS (Last 7 days):")
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        recent = [d for d in result.data if d.get('created_at', '') > seven_days_ago]
        
        if recent:
            print(f"   Found {len(recent)} recent registration(s):")
            for dealer in recent:
                print(f"   - {dealer['email']} ({dealer['name']})")
                print(f"     Registered: {dealer.get('created_at', 'Unknown')}")
        else:
            print("   No registrations in the last 7 days")
        
        # Show all dealers
        print("\n📋 ALL DEALERS:")
        for i, dealer in enumerate(result.data, 1):
            print(f"   {i}. {dealer['name']} ({dealer['email']})")
            print(f"      Shop: {dealer.get('shop_name', 'N/A')}")
            print(f"      City: {dealer.get('city', 'N/A')}")
            created = dealer.get('created_at', 'Unknown')
            print(f"      Registered: {created}")

except Exception as e:
    print(f"\n❌ Error querying dealers: {e}")
    print("   The dealers table may not exist or you may not have permission.")

# Step 3: Test login for each dealer
print("\n" + "=" * 70)
print("🔍 LOGIN TESTING:")
print("=" * 70)

if result.data:
    print("\n⚠️  IMPORTANT: To test login, you need to know the passwords.")
    print("   If dealers are registering but can't login the next day,")
    print("   this suggests the database connection might be different.")
    
    print("\n💡 RECOMMENDATION:")
    print("   1. Ask a dealer to register right now")
    print("   2. Note their email and password")
    print("   3. Try to login immediately (should work)")
    print("   4. Wait until tomorrow and try again (if it fails, see below)")
    
    print("\n🔧 POTENTIAL CAUSES & SOLUTIONS:")
    print("   " + "-" * 60)
    print("   1. DIFFERENT DATABASES:")
    print("      - Your deployed backend (Render) might be using different")
    print("        environment variables than your local .env file")
    print("      - Solution: Check Render dashboard → Environment Variables")
    print("      - Ensure SUPABASE_URL matches your local .env")
    print()
    print("   2. ENVIRONMENT VARIABLES NOT SET ON RENDER:")
    print("      - If Render doesn't have the env vars set, the backend")
    print("        might be using default or empty values")
    print("      - Solution: Add all required env vars to Render")
    print()
    print("   3. SUPABASE AUTH INTERFERENCE:")
    print("      - If Supabase Auth is enabled, it might be creating")
    print("        duplicate accounts or resetting passwords")
    print("      - Solution: Check Supabase Authentication settings")
    print()
    print("   4. DATABASE TRIGGERS OR POLICIES:")
    print("      - A database trigger might be modifying passwords")
    print("      - Solution: Check Supabase SQL for any triggers on dealers table")

# Step 4: Provide actionable steps
print("\n" + "=" * 70)
print("🎯 ACTION PLAN:")
print("=" * 70)

print("""
STEP 1: Verify Deployed Backend Configuration
   - Go to Render Dashboard: https://dashboard.render.com
   - Find your backend service (railsupply-backend)
   - Click on "Environment" tab
   - Compare these values with your local backend/.env file:
     * SUPABASE_URL
     * SUPABASE_KEY  
     * SUPABASE_SECRET_KEY
     * SECRET_KEY
   - They MUST match exactly!

STEP 2: Test with a Fresh Registration
   - Have a dealer register on your website right now
   - Note their email and password
   - Try to login immediately (should work)
   - Try to login again tomorrow
   - If it fails tomorrow, the backend is querying a different database

STEP 3: Check Supabase Project
   - Go to Supabase Dashboard: https://app.supabase.com
   - Select your project (kdblxikycbdrhpscmbwe)
   - Go to Table Editor → dealers
   - Verify the newly registered dealer appears here
   - If not, your backend is connected to a different project

STEP 4: Update Render Environment Variables (if needed)
   - In Render Dashboard, click "Edit Environment Variables"
   - Copy the values from your local backend/.env file
   - Save and let Render redeploy automatically

STEP 5: Verify Fix
   - After updating Render env vars, test again
   - Register a new dealer and verify login works the next day
""")

print("\n" + "=" * 70)
print("📞 NEED MORE HELP?")
print("=" * 70)
print("""
If you're still having issues, please provide:
1. Screenshot of your Render environment variables (blur sensitive keys)
2. Output from this diagnostic script
3. The exact error message dealers see when trying to login
4. Whether newly registered dealers can login immediately after registration
""")