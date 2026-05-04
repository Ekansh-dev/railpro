# Fix for Deployed Backend Login Issue

## Problem
Your deployed backend at `https://railsupply-backend.onrender.com` is returning "Invalid admin credentials" even though we've fixed the admin password in the database.

## Root Cause
The deployed backend on Render is likely using different environment variables or connecting to a different Supabase database than your local `.env` file.

## Solution Steps

### Step 1: Verify Supabase Database Connection

First, confirm which Supabase database your deployed backend is using:

1. **Go to your Render dashboard**: https://dashboard.render.com
2. **Find your backend service** (likely named "railsupply-backend" or similar)
3. **Check the Environment Variables**:
   - Click on your service → Environment → Environment Variables
   - Verify these variables match your local `.env` file (the values should be the same):
     ```
     SUPABASE_URL=your-supabase-project-url
     SUPABASE_KEY=your-supabase-anon-key
     SECRET_KEY=your-secret-key
     SUPABASE_SECRET_KEY=your-supabase-service-role-key
     ```

### Step 2: Update Environment Variables on Render (if needed)

If the environment variables on Render are different or missing:

1. **In your Render dashboard**, go to your backend service
2. **Click "Environment" → "Edit Environment Variables"**
3. **Add/Update these variables** (use the values from your local `backend/.env` file):
   ```
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_KEY=your-supabase-anon-key
   SECRET_KEY=your-secret-key
   SUPABASE_SECRET_KEY=your-supabase-service-role-key
   ```
4. **Save the changes**
5. **Render will automatically redeploy** your service with the new environment variables

### Step 3: Verify Admin Account in Supabase

Make sure the admin account exists in the **same Supabase database** that your deployed backend is using:

1. **Go to your Supabase dashboard**: https://app.supabase.com
2. **Select your project** (kdblxikycbdrhpscmbwe)
3. **Go to Table Editor → admins table**
4. **Verify you see the admin account**:
   - Email: `a.ekansh@yahoo.com`
   - Name: `Ekansh AS`

### Step 4: Test the API Again

After updating the environment variables (if needed), test the deployed backend API:

```bash
curl -X POST https://railsupply-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "a.ekansh@yahoo.com",
    "password": "kubera@123",
    "role": "admin"
  }'
```

**Expected response** (if successful):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "admin",
  "user": {
    "name": "Ekansh AS",
    "email": "a.ekansh@yahoo.com"
  }
}
```

### Step 5: Redeploy if Necessary

If the environment variables are correct but login still fails:

1. **Go to your Render dashboard**
2. **Find your backend service**
3. **Click "Manual Deploy" → "Deploy latest commit"**
4. **Wait for the deployment to complete**

### Step 6: Test on Your Website

Once the API test returns a token, try logging in on your deployed website:

1. Go to your website URL
2. Click "Login"
3. Select "Admin" tab
4. Enter:
   - Email: `a.ekansh@yahoo.com`
   - Password: `kubera@123`
5. Click "Login"

You should be redirected to the admin dashboard.

## Troubleshooting

### If you still get "Invalid admin credentials":

1. **Check Render logs**:
   - Go to Render dashboard → Your backend service → Logs
   - Look for any errors during startup or login attempts
   - The backend has debug logging that will show login attempts

2. **Verify the admins table schema**:
   ```sql
   -- Run this in Supabase SQL Editor to check the table structure
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'admins'
   ORDER BY ordinal_position;
   ```

3. **Check if the admin password hash is correct**:
   ```sql
   -- Run this in Supabase SQL Editor
   SELECT email, password_hash, length(password_hash) as hash_length
   FROM admins
   WHERE email = 'a.ekansh@yahoo.com';
   ```
   The hash should be exactly 64 characters long (SHA-256 hex digest)

### If the backend is down or unreachable:

1. **Check Render service status** in your dashboard
2. **Verify the backend URL** is correct: `https://railsupply-backend.onrender.com`
3. **Check if Render has put the service to sleep** (free tier limitation)
   - Visit the backend URL directly: https://railsupply-backend.onrender.com
   - You should see: `{"message": "RailSupply API is running!"}`

## Quick Checklist

- [ ] Environment variables on Render match local `.env` file
- [ ] Admin account exists in Supabase database
- [ ] Password hash is exactly 64 characters (no extra characters)
- [ ] Backend service is running on Render
- [ ] API test returns a valid token
- [ ] Website login works with admin credentials

## Need More Help?

If you're still stuck, please provide:
1. A screenshot of your Render environment variables (blur out sensitive keys)
2. The output from the curl command above
3. Any error messages from the Render logs