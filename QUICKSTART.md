# Quick Start Guide - Local Development

Follow these steps to get your application running on localhost:

## Step 1: Set Up Database (One-time setup)

### A. Create Admins Table in Supabase

1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
```

### B. Create Your First Admin User

**Option 1: Use the Python Script (Easiest)**

```bash
cd backend
python create_admin.py
```

Follow the prompts to enter:
- Admin name
- Admin email
- Admin password

**Option 2: Manual SQL**

```sql
-- First generate password hash using Python:
-- import hashlib; print(hashlib.sha256("your_password".encode()).hexdigest())

INSERT INTO admins (name, email, password_hash) 
VALUES (
  'Your Name',
  'your@email.com',
  'paste_hash_here'
);
```

## Step 2: Start Backend Server

Open a terminal:

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Test**: Open browser to `http://127.0.0.1:8000`
- Should show: `{"message": "RailSupply API is running!"}`

## Step 3: Start Frontend Server

Open a **second terminal**:

```bash
cd frontend
npm run dev
```

You should see something like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  Network: use --host to expose
```

## Step 4: Test Login

1. Open browser to `http://127.0.0.1:5173`
2. Click "Login" button
3. Select "Admin" tab
4. Enter your admin credentials
5. Click "Login"

✅ **Success**: You should see the Admin Dashboard!

## Troubleshooting

### ❌ "Server error. Is backend running?"
**Solution**: Make sure backend is running on `http://127.0.0.1:8000`

### ❌ "Invalid admin credentials"
**Solution**: 
1. Verify admin exists in Supabase (check admins table)
2. Make sure you're using the correct password
3. Check that password was hashed correctly

### ❌ Frontend won't start
**Solution**: 
```bash
cd frontend
npm install
npm run dev
```

### ❌ Can't access Supabase
**Solution**: Check your `.env` file has correct Supabase credentials

## Quick Verification Commands

**Test Backend**:
```bash
curl http://127.0.0.1:8000
```
Should return: `{"message": "RailSupply API is running!"}`

**Test Admin Login**:
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your_admin_email","password":"your_password","role":"admin"}'
```
Should return a JWT token.

## Important Notes

- **Frontend auto-detects** local vs production backend
- On `localhost` → uses `http://127.0.0.1:8000`
- On production → uses `https://railsupply-backend.onrender.com`

## Need More Help?

Check `backend/TROUBLESHOOTING.md` for detailed troubleshooting.