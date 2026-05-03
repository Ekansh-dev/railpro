# Troubleshooting Guide - Login Issues

## Issue: "Not able to login on localhost"

### Step 1: Check if Backend is Running

First, make sure your backend server is running:

```bash
cd backend
python main.py
# or
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Test**: Open browser and go to `http://127.0.0.1:8000`
- You should see: `{"message": "RailSupply API is running!"}`

### Step 2: Set Up Admins Table in Supabase

The most common issue is that the `admins` table doesn't exist in your Supabase database.

**Solution**: Run this SQL in your Supabase SQL Editor:

```sql
-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
```

### Step 3: Create an Admin User

You have two options:

#### Option A: Use the Python Script (Recommended)

```bash
cd backend
python create_admin.py
```

Follow the prompts to create an admin account.

#### Option B: Manual SQL Insert

1. Generate a password hash:
```python
import hashlib
password = "your_password_here"
hashed = hashlib.sha256(password.encode()).hexdigest()
print(hashed)
```

2. Insert into Supabase SQL Editor:
```sql
INSERT INTO admins (name, email, password_hash) 
VALUES (
  'Your Name',
  'your_email@example.com',
  'paste_the_hash_here'
);
```

### Step 4: Test the Login

1. **Start your frontend** (in a separate terminal):
```bash
cd frontend
npm run dev
```

2. **Open your browser** to the frontend URL (usually `http://127.0.0.1:5173`)

3. **Click "Login"** button

4. **Select "Admin" tab**

5. **Enter your admin credentials**:
   - Email: The email you used when creating the admin
   - Password: The password you set

6. **Click "Login"**

### Step 5: Check Browser Console for Errors

If login still fails:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try logging in again
4. Look for error messages

Common errors and solutions:

#### Error: "Network Error" or "Failed to fetch"
- **Cause**: Backend not running or wrong API URL
- **Solution**: Make sure backend is running on `http://127.0.0.1:8000`

#### Error: "Invalid admin credentials"
- **Cause**: Admin doesn't exist or wrong password
- **Solution**: Verify admin exists in Supabase and password is correct

#### Error: "CORS error"
- **Cause**: CORS configuration issue
- **Solution**: Backend already has CORS enabled, check if backend is running

### Step 6: Verify API Endpoints

Test the login endpoint directly:

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_admin_email@example.com",
    "password": "your_password",
    "role": "admin"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "admin",
  "user": {
    "name": "Your Name",
    "email": "your_admin_email@example.com"
  }
}
```

### Step 7: Check .env File

Make sure your `backend/.env` file has the correct values:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SECRET_KEY=your-secret-key
SUPABASE_SECRET_KEY=your-service-role-key
```

**Important**: 
- `SUPABASE_KEY` should be the **anon/public** key
- `SUPABASE_SECRET_KEY` should be the **service_role** key (for admin operations)

### Step 8: Dealer Login Still Works?

If dealer login works but admin doesn't:
- ✅ Backend is running
- ✅ Frontend is running
- ❌ Admins table issue or admin credentials issue

### Quick Checklist

- [ ] Backend server running on `http://127.0.0.1:8000`
- [ ] Frontend server running on `http://127.0.0.1:5173` (or similar)
- [ ] `admins` table exists in Supabase
- [ ] At least one admin user exists in the table
- [ ] `.env` file has correct Supabase credentials
- [ ] Browser console shows no errors
- [ ] Can access `http://127.0.0.1:8000` directly

### Still Having Issues?

1. **Restart both servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python main.py
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Clear browser cache and localStorage**:
   - Open DevTools → Application → Local Storage → Clear

3. **Check Supabase dashboard**:
   - Go to your project → Table Editor → Check if `admins` table exists
   - Try querying: `SELECT * FROM admins;`

4. **Verify API URL in frontend**:
   - Check `frontend/src/main.js` line 2:
   ```javascript
   const API = 'https://railsupply-backend.onrender.com';
   ```
   - For localhost, change to:
   ```javascript
   const API = 'http://127.0.0.1:8000';
   ```

### Important Note

The frontend is currently configured to use the production backend:
```javascript
const API = 'https://railsupply-backend.onrender.com';
```

For local development, you should change this to:
```javascript
const API = 'http://127.0.0.1:8000';
```

This is likely why you can't login on localhost - the frontend is trying to connect to the production backend instead of your local one!