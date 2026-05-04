# RailSupply - Admin Authentication Refactoring

## Overview
This document summarizes the changes made to remove hardcoded admin credentials from the `.env` file and implement a secure, database-driven admin authentication system with role selection during login.

## Changes Made

### 1. Security Improvements

#### ❌ Removed from `.env`
```diff
- ADMIN_EMAIL=a.ekansh@yahoo.com
- ADMIN_PASSWORD=kubera@123
```

#### ✅ Why This Matters
- **Security**: Hardcoded credentials in environment files can be accidentally committed to version control
- **Scalability**: Multiple admins can now be managed through the database
- **Flexibility**: Admin credentials can be updated without redeploying the application

### 2. Backend Changes (`backend/main.py`)

#### New Database Table
- Added support for `admins` table in Supabase
- Schema: `id`, `name`, `email`, `password_hash`, `created_at`, `updated_at`

#### New Authentication Model
```python
class LoginRequest(BaseModel):
    email: str
    password: str
    role: str  # "dealer" or "admin"
```

#### Unified Login Endpoint
```python
@app.post("/auth/login")
def login(data: LoginRequest):
    # Handles both dealer and admin login based on role parameter
```

#### Key Changes
- Changed from `is_admin` boolean to `role` string in JWT tokens
- Added `admin_register` endpoint for creating new admins
- Maintained backward compatibility with legacy `/dealer/login` and `/admin/login` endpoints
- Admin authentication now checks the `admins` table instead of environment variables

### 3. Frontend Changes (`frontend/src/main.js`)

#### Role Selection UI
- Replaced separate "Dealer Login" and "Admin Login" pages with a unified login page
- Added role selection tabs (Dealer/Admin) with visual feedback
- Single login form that adapts based on selected role

#### Updated Functions
```javascript
// New unified login function
async function loginUser() {
  // Sends role to /auth/login endpoint
}

// Role selection
function selectRole(role, element) {
  // Updates selectedRole and UI
}
```

#### Local Storage Updates
```javascript
// Now stores role instead of isAdmin boolean
localStorage.setItem('role', data.role);  // "dealer" or "admin"
```

### 4. Styling Enhancements (`frontend/src/style.css`)

#### New Role Tab Styles
```css
.role-tabs { /* Container for role selection */ }
.role-tab { /* Individual role button */ }
.role-tab.active { /* Selected state */ }
.role-icon { /* Icon styling */ }
```

#### Visual Features
- Smooth transitions and hover effects
- Active state with red border and glow effect
- Icon scaling animation on selection
- Responsive design for mobile devices

## Migration Guide

### For Developers

1. **Set up the `admins` table in Supabase**
   ```sql
   -- Run the SQL from SETUP_INSTRUCTIONS.md
   ```

2. **Create initial admin user**
   ```python
   # Generate password hash
   import hashlib
   password = "your_secure_password"
   hashed = hashlib.sha256(password.encode()).hexdigest()
   
   # Insert into database via Supabase dashboard or API
   ```

3. **Update `.env` file**
   - Remove `ADMIN_EMAIL` and `ADMIN_PASSWORD` lines
   - Keep other configuration intact

4. **Test the application**
   - Start backend: `uvicorn main:app --reload`
   - Start frontend: `npm run dev`
   - Test both dealer and admin login flows

### For Existing Users

- **Dealers**: No changes - login works the same way
- **Admins**: 
  - Use the unified login page
  - Select "Admin" tab
  - Enter your admin credentials
  - If you don't have credentials, contact the system administrator

## API Changes

### New Endpoint
```
POST /auth/login
{
  "email": "user@example.com",
  "password": "password",
  "role": "dealer"  // or "admin"
}
```

### Response Format
```json
{
  "token": "jwt_token_here",
  "role": "dealer",
  "user": {
    "name": "User Name",
    "email": "user@example.com",
    "shop_name": "Shop Name"  // Only for dealers
  }
}
```

### Deprecated Endpoints
- `/dealer/login` - Still works for backward compatibility
- `/admin/login` - Still works for backward compatibility

## Security Best Practices Implemented

1. ✅ **No hardcoded credentials** - Admin credentials stored in database
2. ✅ **Password hashing** - All passwords stored as SHA256 hashes
3. ✅ **JWT tokens** - Secure token-based authentication
4. ✅ **Role-based access control** - Clear separation between dealer and admin roles
5. ✅ **Environment variable security** - Sensitive config in `.env` (not committed)

## Testing Checklist

- [ ] Admin table created in Supabase
- [ ] Initial admin user inserted
- [ ] Admin can log in with role selection
- [ ] Dealer can log in with role selection
- [ ] Admin dashboard shows correctly
- [ ] Dealer dashboard shows correctly
- [ ] Admin can delete products
- [ ] Dealer can only manage own products
- [ ] Logout works correctly
- [ ] Token validation works
- [ ] Role-based access control enforced

## Future Improvements

1. **Password Reset**: Implement forgot password functionality
2. **Multi-Admin Support**: Allow multiple admins with different permissions
3. **Audit Logging**: Track admin actions
4. **Two-Factor Authentication**: Add 2FA for admin accounts
5. **Session Management**: Implement session timeout and refresh tokens

## Support

For issues or questions:
1. Check `backend/SETUP_INSTRUCTIONS.md` for database setup
2. Review the API documentation in the code
3. Test with the provided testing checklist

---

**Last Updated**: 2026-02-05  
**Version**: 2.0.0