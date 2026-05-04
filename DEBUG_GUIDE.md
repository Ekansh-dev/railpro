# Debug Guide - "Invalid Credentials" Issue

## Problem
You're getting "Invalid credentials" error even though you're sure the credentials are correct.

## Root Causes & Solutions

### Cause 1: Frontend Connecting to Wrong Backend
**Most Common Issue**: The frontend is connecting to the production backend (`https://railsupply-backend.onrender.com`) instead of your local backend (`http://127.0.0.1:8000`).

**How to Check**:
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to login
4. Look for the login request
5. Check the URL - it should be `http://127.0.0.1:8000/auth/login`

**Solution**:
Make sure you're accessing the frontend via `http://127.0.0.1:5173` or `http://localhost:5173`, NOT via a deployed URL.

### Cause 2: Admin Not Created in Database
You haven't created an admin user in your Supabase database yet.

**How to Check**:
```bash
cd backend
python test_login.py
```

**Solution**:
Create an admin using:
```bash
cd backend
python create_admin.py
```

### Cause 3: Password Hash Mismatch
The password you're entering doesn't match the hashed password stored in the database.

**How to Check**:
Run the test script:
```bash
cd backend
python test_login.py
```

It will show you:
- The stored password hash
- The hash of the password you entered
- Whether they match

**Solution**:
If they don't match, create a new admin with the correct password.

### Cause 4: Backend Not Running
Your backend server isn't running, so the frontend can't connect.

**How to Check**:
```bash
curl http://127.0.0.1:8000
```

Should return: `{"message": "RailSupply API is running!"}`

**Solution**:
Start the backend:
```bash
cd backend
python main.py
```

### Cause 5: Wrong Supabase Credentials
Your `.env` file has incorrect Supabase credentials.

**How to Check**:
1. Verify `.env` file exists in `backend/` folder
2. Check that `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are correct
3. Test database connection:
```bash
cd backend
python -c "from supabase import create_client; import os; from dotenv import load_dotenv; load_dotenv(); s = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SECRET_KEY')); print('Connected!' if s else 'Failed')"
```

**Solution**:
Update your `.env` file with correct credentials from Supabase dashboard.

## Step-by-Step Debugging Process

### Step 1: Verify Backend is Running
```bash
cd backend
python main.py
```

Look for:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Test Backend Directly
```bash
curl http://127.0.0.1:8000
```

Should return: `{"message": "RailSupply API is running!"}`

### Step 3: Check Database Connection
```bash
cd backend
python test_login.py
```

This will:
- Check if admins table exists
- List all admins
- Test if your credentials work

### Step 4: Check Frontend Connection
1. Start frontend: `cd frontend && npm run dev`
2. Open browser to `http://127.0.0.1:5173`
3. Open Developer Tools (F12) → Network tab
4. Try to login
5. Check the request URL and response

### Step 5: View Backend Logs
When you try to login, watch the backend terminal for debug messages like:
```
[DEBUG] Login attempt: email=test@example.com, role=admin
[DEBUG] Admin query result: [{'id': '...', 'email': 'test@example.com', ...}]
[DEBUG] Admin found: test@example.com, stored_hash=abc123...
[DEBUG] Provided password hash: abc123...
[DEBUG] Login successful for admin: test@example.com
```

If you see:
- `[DEBUG] No admin found with email: ...` → Admin doesn't exist in database
- `[DEBUG] Password mismatch for admin` → Password is wrong
- No debug output → Frontend isn't reaching backend

## Quick Fix Checklist

Run these commands in order:

```bash
# 1. Check backend is running
curl http://127.0.0.1:8000

# 2. Check if admin exists
cd backend
python test_login.py

# 3. If admin doesn't exist, create one
python create_admin.py

# 4. Start backend (in terminal 1)
python main.py

# 5. Start frontend (in terminal 2)
cd ../frontend
npm run dev

# 6. Open browser to http://127.0.0.1:5173
# 7. Try to login with admin credentials
```

## Common Mistakes

### ❌ Mistake 1: Using Production URL
Accessing `https://your-domain.com` instead of `http://127.0.0.1:5173`

**Fix**: Always use `http://127.0.0.1:5173` for local development

### ❌ Mistake 2: Not Creating Admin in Database
Trying to login without creating an admin first

**Fix**: Run `python create_admin.py` before logging in

### ❌ Mistake 3: Wrong Password
Entering a different password than what was used to create the admin

**Fix**: Use `python test_login.py` to verify credentials

### ❌ Mistake 4: Backend Not Running
Frontend can't connect because backend isn't started

**Fix**: Always start backend first: `python main.py`

### ❌ Mistake 5: Wrong .env File
Using production credentials in local development

**Fix**: Make sure `.env` has correct local development credentials

## Still Not Working?

### Enable Verbose Logging

Add this to the top of `backend/main.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
```

Then replace all `print(f"[DEBUG] ...")` with `logger.debug(...)`

### Test with curl

Bypass the frontend and test the API directly:

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_admin_email@example.com",
    "password": "your_password",
    "role": "admin"
  }'
```

If this works but frontend doesn't, the issue is with the frontend configuration.

If this fails, the issue is with the backend or database.

## Expected Debug Output

When login is successful, you should see in backend terminal:
```
[DEBUG] Login attempt: email=admin@example.com, role=admin
[DEBUG] Admin query result: [{'id': 'uuid-here', 'name': 'Admin', 'email': 'admin@example.com', 'password_hash': 'hash-here', ...}]
[DEBUG] Admin found: admin@example.com, stored_hash=abc123def456...
[DEBUG] Provided password hash: abc123def456...
[DEBUG] Login successful for admin: admin@example.com
```

And in browser Network tab:
- Status: 200 OK
- Response: `{"token": "...", "role": "admin", "user": {...}}`

## Need More Help?

1. Check `backend/TROUBLESHOOTING.md` for detailed troubleshooting
2. Check `backend/SETUP_INSTRUCTIONS.md` for database setup
3. Review the debug output in backend terminal
4. Test with `python test_login.py` to isolate the issue