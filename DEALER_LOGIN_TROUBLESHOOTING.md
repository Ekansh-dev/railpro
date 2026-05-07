# Dealer Login Issue - Troubleshooting Guide

## Problem Statement
Dealers report that they can register successfully and login immediately after registration, but when they try to login the next day, they get "Invalid credentials" error.

## Investigation Results

### ✅ What We Verified
1. **Backend is running**: API responds correctly
2. **Authentication works**: Both admin and dealer logins work via API
3. **Database is consistent**: Deployed backend uses same Supabase database as local
4. **Passwords are hashed**: All dealer passwords are properly stored as SHA-256 hashes
5. **No database mismatch**: New registrations appear in the same database

### 🔧 Fixes Applied

#### 1. Email Case Normalization
**Issue**: Email addresses were stored with mixed case (e.g., `Test@Example.com`), but login queries might use different casing.

**Fix**: Both registration and login now normalize emails to lowercase:
- Registration: `email = data.email.strip().lower()`
- Login: `email = data.email.strip().lower()`

This ensures `Test@Example.com` and `test@example.com` are treated the same.

#### 2. Enhanced Error Logging
Added detailed logging to help diagnose issues:
- Backend logs show login attempts, hash comparisons, and success/failure
- Frontend logs show login attempts and responses
- Clear error messages for users

#### 3. Input Validation
Added validation to ensure email and password are not empty before attempting login.

## 🔍 How to Diagnose Login Issues

### For Developers/Admins

#### Step 1: Check Backend Logs
If you have access to Render logs, look for:
```
[LOGIN] Attempt: email=user@example.com, role=dealer
[LOGIN] Dealer query returned 1 result(s)
[LOGIN] Stored hash: abc123... (len=64)
[LOGIN] Provided hash: abc123... (len=64)
[LOGIN] SUCCESS: Dealer login for user@example.com
```

If you see `FAILED`, it will tell you why:
- `FAILED: No dealer found with email=...` → Email not in database
- `FAILED: Password mismatch for dealer=...` → Wrong password

#### Step 2: Use the Diagnostic Script
Run the diagnostic tool to check your database:
```bash
cd backend
python3 diagnose_login_issue.py
```

This will:
- Show which Supabase database you're connected to
- List all dealers and their password hash status
- Show recent registrations
- Provide recommendations

#### Step 3: Test Login Manually
```bash
# Test with curl
curl -X POST https://railsupply-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dealer@example.com",
    "password": "their_password",
    "role": "dealer"
  }'
```

#### Step 4: Check Browser Console
Open browser developer tools (F12) and look at the Console tab for:
```
[LOGIN] Attempting login for user@example.com as dealer
[LOGIN] Response status: 200
[LOGIN] Login successful for user@example.com
```

Or if it fails:
```
[LOGIN] Login failed: Invalid email or password
```

### For Dealers Having Login Issues

#### Solution 1: Reset Password
If you can't login, use the password reset tool:
```bash
cd backend
python3 fix_dealer_password.py
```
(Admin only - you'll need to contact support)

#### Solution 2: Clear Browser Cache
1. Open browser settings
2. Clear browsing data (cookies, cache)
3. Try logging in again

#### Solution 3: Check Email Case
Make sure you're entering your email exactly as you registered it. The system is now case-insensitive, but it's best to be consistent.

#### Solution 4: Verify Registration
Contact admin to verify your account exists in the database.

## 🚨 Common Causes & Solutions

### Cause 1: Email Case Mismatch (FIXED)
**Before**: Registering as `Test@Example.com` then logging in as `test@example.com` would fail.

**After**: Both are treated the same (normalized to lowercase).

### Cause 2: Browser Cache Issues
**Symptom**: Can login on different browser or incognito mode.

**Solution**: Clear browser cache and cookies, or use incognito mode.

### Cause 3: Wrong Password
**Symptom**: "Invalid credentials" error.

**Solution**: Use password reset tool or contact admin.

### Cause 4: Account Not in Database
**Symptom**: "Invalid email or password" even with correct password.

**Solution**: Register again or contact admin to verify account.

### Cause 5: Render Backend Sleep (Free Tier)
**Symptom**: First login attempt times out, but works on second try.

**Solution**: This is normal for free tier. Wait a few seconds and try again, or upgrade to paid Render plan.

## 📋 Testing Checklist

To verify the fix works:

1. **Register a new dealer**:
   - Use email: `TestUser@Example.com` (mixed case)
   - Note the password

2. **Login immediately**:
   - Should work ✅

3. **Wait a few hours or until next day**

4. **Login again**:
   - Use email: `testuser@example.com` (lowercase)
   - Should still work ✅

5. **Check backend logs**:
   - Should show successful login
   - Should show email normalized to lowercase

## 🔧 Maintenance Commands

### List all dealers:
```bash
cd backend
python3 -c "
import os
from supabase import create_client
from dotenv import load_dotenv
load_dotenv()
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SECRET_KEY') or os.getenv('SUPABASE_KEY'))
result = supabase.table('dealers').select('email, name').execute()
for d in result.data:
    print(f'{d[\"email\"]} - {d[\"name\"]}')
"
```

### Fix a dealer's password:
```bash
cd backend
python3 fix_dealer_password.py
```

### Run full diagnostic:
```bash
cd backend
python3 diagnose_login_issue.py
```

## 📞 Need More Help?

If you're still experiencing issues:

1. **Collect information**:
   - Email address having issues
   - Exact error message
   - Browser and version
   - Screenshot of error

2. **Check logs**:
   - Render dashboard → Logs
   - Browser console (F12)

3. **Contact support** with:
   - Output from `diagnose_login_issue.py`
   - Screenshots of errors
   - Steps to reproduce

## 🎯 Summary

The login issue has been addressed by:
1. ✅ Normalizing email addresses to lowercase in both registration and login
2. ✅ Adding detailed logging for debugging
3. ✅ Improving error messages
4. ✅ Adding input validation

Dealers should now be able to login successfully even days after registration, regardless of email case.

---

**Last Updated**: 2026-05-06  
**Version**: 1.0.0