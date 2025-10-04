# Fix for Admin Login and User Creation Issues

## Problem Summary
After adding RLS policies, you encountered:
1. ❌ "Not registered as admin" error when logging in
2. ❌ "New row violates row level security policy" when creating users
3. ❌ "User already exists" on retry attempts

## Root Causes
1. RLS policies only allowed users to insert their own profiles
2. Login check only looked for "admin" role, not "super_admin"
3. Type definitions didn't include "super_admin" role

---

## Solution Applied ✅

### 1. Updated Database Migration
**File:** `supabase/migrations/20251004000002_fix_admin_create_users.sql`

The migration now:
- ✅ Allows admins AND super_admins to create user profiles
- ✅ Allows admins AND super_admins to view all profiles in their institution
- ✅ Allows admins AND super_admins to update profiles
- ✅ Allows admins AND super_admins to delete profiles

### 2. Updated Login Logic
**Files:** `src/pages/AdminLogin.tsx` and `src/pages/Admin.tsx`

Changes:
- ✅ Now accepts both "admin" and "super_admin" roles for login
- ✅ Better error handling with descriptive messages
- ✅ Graceful handling of profile fetch failures

### 3. Updated Type Definitions
**File:** `src/integrations/supabase/types.ts`

Changes:
- ✅ Added "super_admin" to user_role enum type
- ✅ Fixed TypeScript compilation errors

### 4. Enhanced User Creation
**File:** `src/pages/Admin.tsx`

Improvements:
- ✅ Pre-checks if email already exists
- ✅ Handles duplicate user creation gracefully
- ✅ Detailed error messages for debugging
- ✅ Added "Super Admin" option to role selector
- ✅ Color-coded role badges (Purple for Super Admin)

---

### Step 1: Apply Database Migration

Go to your Supabase Dashboard and run this SQL:

```sql
-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can insert profiles for their institution" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in their institution" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their institution" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles in their institution" ON profiles;

-- Allow admins and super_admins to create profiles for users in their institution
CREATE POLICY "Admins can insert profiles for their institution"
  ON profiles FOR INSERT
  WITH CHECK (
    institution_id IN (
      SELECT institution_id 
      FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow admins and super_admins to view all profiles in their institution
CREATE POLICY "Admins can view all profiles in their institution"
  ON profiles FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow admins and super_admins to update profiles in their institution
CREATE POLICY "Admins can update profiles in their institution"
  ON profiles FOR UPDATE
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow admins and super_admins to delete profiles in their institution
CREATE POLICY "Admins can delete profiles in their institution"
  ON profiles FOR DELETE
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
\`\`\`

**How to run:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in sidebar
4. Click "New Query"
5. Paste the SQL above
6. Click "Run"

### Step 2: Restart Your Dev Server

\`\`\`bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
\`\`\`

---

## Testing the Fix

### Test 1: Admin Login
1. Navigate to `/admin-login`
2. Login with admin OR super_admin credentials
3. ✅ Should login successfully

### Test 2: Create User
1. Login as admin
2. Go to "Students" tab (now called "Users")
3. Click "Add User"
4. Fill in details and select a role
5. Click "Add User"
6. ✅ User should be created successfully

### Test 3: Role Management
1. View the users table
2. ✅ Should see color-coded role badges:
   - Purple = Super Admin
   - Blue = Admin
   - Gray = Student
3. Edit a user
4. ✅ Should be able to change their role

---

## What's New

### Role Selector
All user forms now have a **Role** dropdown with three options:
- **Student** (default)
- **Admin**
- **Super Admin**

### Visual Role Indicators
User table displays color-coded badges:
- 🟣 **Super Admin** - Purple badge
- 🔵 **Admin** - Primary blue badge
- ⚫ **Student** - Secondary gray badge

### Better Error Messages
The system now provides clear feedback:
- "A user with this email already exists"
- "Unable to fetch profile. Please try again."
- "Failed to create user profile: [specific error]"

---

## Database Schema

Your user_role enum now includes:
\`\`\`sql
CREATE TYPE user_role AS ENUM ('admin', 'student', 'super_admin');
\`\`\`

All three roles can:
- ✅ View their own profile
- ✅ Login to appropriate dashboards

Admins and Super Admins can additionally:
- ✅ Create users in their institution
- ✅ View all users in their institution
- ✅ Edit user profiles and roles
- ✅ Delete users from their institution

---

## Troubleshooting

### Still getting "not registered as admin"?
1. Make sure you applied the database migration
2. Check your user's role in the database:
   \`\`\`sql
   SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
   \`\`\`
3. Ensure the role is either 'admin' or 'super_admin'

### Still can't create users?
1. Verify the RLS policies exist:
   \`\`\`sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   \`\`\`
2. Check browser console for detailed error messages
3. Verify you're logged in as admin or super_admin

### TypeScript errors?
1. Restart your TypeScript server in VS Code
2. Run: `npm run build` to verify compilation

---

## Summary

All fixes have been applied to your codebase. You just need to:

1. ✅ Apply the SQL migration (copy-paste to Supabase Dashboard)
2. ✅ Restart your dev server
3. ✅ Test login and user creation

Everything else is already fixed in the code! 🎉
