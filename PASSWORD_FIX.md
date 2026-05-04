# Password Fix Guide

## 🔍 Problem Identified

From your debug logs:
```
[DEBUG] Admin found: a.ekansh@yahoo.com, stored_hash=kubera@123...
[DEBUG] Provided password hash: ffc9195187a47d25...
[DEBUG] Password mismatch for admin
```

**The Issue**: Your admin password is stored as **plain text** (`kubera@123`) in the database instead of a SHA256 hash. The login system expects a hashed password, so it will never match!

## ✅ Solution

Run this command to fix your admin password:

```bash
cd backend
python fix_admin_password.py
```

Follow the prompts:
1. Enter admin email: `a.ekansh@yahoo.com`
2. Enter new password: (choose a new password, e.g., `kubera@123` or something else)

The script will:
- Check if the password is stored as plain text (it is)
- Hash the new password using SHA256
- Update the database with the proper hash

## 🎯 After Fixing

1. **Restart your backend** (if it's still running):
   ```bash
   # Press CTRL+C to stop, then restart
   uvicorn main:app --reload
   ```

2. **Try logging in again** with:
   - Email: `a.ekansh@yahoo.com`
   - Password: (the new password you set)

## 📊 What Changed

**Before**:
```
password_hash: "kubera@123"  ← Plain text (wrong!)
```

**After**:
```
password_hash: "ffc9195187a47d25..."  ← SHA256 hash (correct!)
```

## 🔒 Why This Matters

1. **Security**: Storing passwords as plain text is a major security risk
2. **Functionality**: The login system compares hashes, so plain text passwords will never work
3. **Best Practice**: All passwords should be hashed before storage

## 🛠️ Alternative: Manual Fix via Supabase

If you prefer to fix it manually in Supabase:

1. Go to Supabase Dashboard → Table Editor → `admins` table
2. Find your admin row
3. Generate SHA256 hash of your password:
   ```python
   python -c "import hashlib; print(hashlib.sha256('your_password'.encode()).hexdigest())"
   ```
4. Update the `password_hash` field with the hash value

## ✨ Prevention

When creating new admins in the future, always use the proper script:

```bash
python create_admin.py
```

This script automatically hashes the password before storing it.

## 🎉 Success Indicators

After fixing, when you try to login, you should see in the backend logs:
```
[DEBUG] Login attempt: email=a.ekansh@yahoo.com, role=admin
[DEBUG] Admin found: a.ekansh@yahoo.com, stored_hash=ffc9195187a47d25...
[DEBUG] Provided password hash: ffc9195187a47d25...
[DEBUG] Login successful for admin: a.ekansh@yahoo.com
```

And in your browser, you'll be redirected to the admin dashboard!