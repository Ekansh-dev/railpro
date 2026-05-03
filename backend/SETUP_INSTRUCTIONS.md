# Database Setup Instructions

## Overview
This document provides instructions for setting up the required database tables in Supabase for the RailSupply application.

## Required Tables

### 1. Admins Table
Create a new table called `admins` in your Supabase database with the following schema:

```sql
-- Create admins table
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_admins_email ON admins(email);
```

### 2. Insert Initial Admin
After creating the table, insert an initial admin user. **Important:** The password must be hashed using SHA256 before inserting.

```sql
-- Example: Insert admin with password "your_secure_password"
-- Replace the email, name, and password_hash with your actual values
-- Password hash is SHA256("your_secure_password")

INSERT INTO admins (name, email, password_hash) 
VALUES (
  'Admin User',
  'admin@example.com',
  'sha256_hash_of_your_password_here'
);
```

### 3. Generate Password Hash
You can generate a SHA256 hash using Python:

```python
import hashlib
password = "your_secure_password"
hashed = hashlib.sha256(password.encode()).hexdigest()
print(hashed)
```

Or using an online SHA256 generator.

## Security Considerations

1. **Never commit admin credentials to version control** - The `.env` file should never contain hardcoded admin credentials.

2. **Use strong passwords** - Admin passwords should be at least 12 characters with a mix of uppercase, lowercase, numbers, and special characters.

3. **Row Level Security (RLS)** - Consider enabling RLS on the `admins` table to prevent unauthorized access:

```sql
-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read their own data (if needed)
CREATE POLICY "Admins can view own data" ON admins
  FOR SELECT USING (auth.uid()::text = id::text);
```

4. **Environment Variables** - Keep sensitive configuration in environment variables, not in code.

## API Endpoints

### Unified Login Endpoint
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "dealer"  // or "admin"
}
```

### Admin-Specific Endpoints
- `GET /admin/products` - View all products (admin only)
- `DELETE /admin/products/{product_id}` - Delete any product (admin only)

### Dealer Endpoints
- `POST /dealer/register` - Register as a dealer
- `POST /products` - Upload products (dealer only)
- `GET /products/mine` - View own products

## Testing the Setup

1. Start the backend server
2. Try logging in with admin credentials using the role selector
3. Verify admin dashboard access
4. Test dealer login and product management

## Troubleshooting

### Common Issues

1. **"Invalid admin credentials"**
   - Check that the admin exists in the database
   - Verify the password hash matches the one in the database
   - Ensure the email matches exactly (case-sensitive)

2. **"Admin access only"**
   - Verify the token contains `role: "admin"`
   - Check that you're using the unified `/auth/login` endpoint with `role: "admin"`

3. **Database connection errors**
   - Verify `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env`
   - Check that the Supabase project is active