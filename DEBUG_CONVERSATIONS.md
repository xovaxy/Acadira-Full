# Debug: Can't See Conversations Tab

## Quick Checks

### 1. Check Browser Console for Errors
1. Open your app in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for any red errors
5. Copy and share the errors

### 2. Check Network Tab
1. With DevTools open (F12)
2. Go to **Network** tab
3. Reload the Admin Dashboard
4. Look for requests to Supabase
5. Check if any are failing (red status)

### 3. Verify Database Tables Exist
1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Click **Table Editor**
3. Check if these tables exist:
   - `chat_sessions` ✅
   - `chat_messages` ✅
   - `profiles` ✅

### 4. Check RLS Policies
1. Supabase Dashboard → **Database** → **Policies**
2. Find `chat_sessions` table
3. Should have policy: "Admins can view all chat sessions"
4. Should have policy: "Users can view their own chat sessions"

---

## Test Database Query Manually

Go to Supabase Dashboard → **SQL Editor** and run:

```sql
-- Check if chat_sessions table exists
SELECT * FROM chat_sessions LIMIT 5;

-- Check if you have any sessions
SELECT COUNT(*) FROM chat_sessions;

-- Check sessions with student info
SELECT 
  cs.*,
  p.full_name,
  p.email
FROM chat_sessions cs
LEFT JOIN profiles p ON p.user_id = cs.student_id
LIMIT 10;
```

---

## Common Issues & Solutions

### Issue 1: Database Migration Not Applied
**Symptom:** Tables don't exist  
**Solution:** Run migrations

### Issue 2: No Data Yet
**Symptom:** Tables exist but empty  
**Solution:** Send test messages as student first

### Issue 3: RLS Policy Blocking
**Symptom:** Queries return 0 results for admin  
**Solution:** Check and fix RLS policies

---

## Step-by-Step Test

### Step 1: Create Test Data
1. Logout from admin
2. Login as **student**
3. Send message: "Test message 1"
4. Wait for AI response
5. Send message: "Test message 2"
6. Logout

### Step 2: View as Admin
1. Login as **admin**
2. Open browser console (F12)
3. Go to Admin Dashboard
4. Click "Conversations" tab
5. Check console for errors

### Step 3: Manual Database Check
Run this in Supabase SQL Editor:

```sql
-- Get the admin's institution
SELECT institution_id FROM profiles WHERE email = 'YOUR_ADMIN_EMAIL';

-- Check sessions for that institution
SELECT * FROM chat_sessions WHERE institution_id = 'YOUR_INSTITUTION_ID';
```

---

## Next: Tell Me What You See

Please check these and tell me:

1. **Do the tables exist?** (Supabase → Table Editor)
2. **Any console errors?** (Browser F12 → Console)
3. **How many sessions?** (Run: `SELECT COUNT(*) FROM chat_sessions;`)
4. **Are you logged in as admin?** (Check role in profile)
5. **Did you apply the migration?** (Check migrations folder)

This will help me identify the exact issue! 🔍
