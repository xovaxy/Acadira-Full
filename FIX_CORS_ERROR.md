# Fix CORS Error - Edge Function Not Deployed

## Understanding the Error

```
Access to fetch at 'https://ktwkxynciynecvhlaqqs.supabase.co/functions/v1/chat-tutor' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

### What This Means

❌ **The edge function is NOT deployed to Supabase yet!**

The error happens because:
1. Your code tries to call the edge function
2. Supabase returns a 404 (function doesn't exist)
3. The 404 response doesn't have CORS headers
4. Browser blocks it as a CORS error

---

## Solution: Deploy the Edge Function

The function code exists locally but needs to be deployed to Supabase!

---

## Method 1: Deploy via Supabase Dashboard (EASIEST - 2 minutes)

### Step 1: Login to Supabase
Go to: https://supabase.com/dashboard/project/ktwkxynciynecvhlaqqs

### Step 2: Create Edge Function
1. Click **"Edge Functions"** in the left sidebar
2. Click **"Create a new function"** button
3. Enter name: **`chat-tutor`**
4. Click **"Create function"**

### Step 3: Add the Code
1. The editor will open
2. **Delete** any example code
3. Open your local file:
   ```
   c:/Users/Admin/Desktop/acadira prototype/supabase/functions/chat-tutor/index.ts
   ```
4. **Copy ALL the code** (Ctrl+A, Ctrl+C)
5. **Paste** into Supabase editor (Ctrl+V)
6. Click **"Deploy"** button (top right)
7. Wait for "Successfully deployed" ✅

### Step 4: Add API Key Secret
1. Still in the chat-tutor page
2. Click **"Secrets"** tab
3. Click **"New secret"**
4. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Get from https://aistudio.google.com/app/apikey
5. Click **"Add secret"**

### Step 5: Test Again
1. Go back to your app at http://localhost:8080
2. Open browser console (F12)
3. Try the test again
4. ✅ Should work now!

---

## Method 2: Deploy via CLI (If you have Supabase CLI)

```bash
# Navigate to project
cd "c:/Users/Admin/Desktop/acadira prototype"

# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref ktwkxynciynecvhlaqqs

# Deploy the function
npx supabase functions deploy chat-tutor

# Add the secret (in Dashboard → Edge Functions → Secrets)
```

---

## Verify Deployment

### Check 1: Function Exists
1. Go to Supabase Dashboard → Edge Functions
2. Should see **"chat-tutor"** listed
3. Status should show **"Deployed"**

### Check 2: Test URL
Open a new browser tab and go to:
```
https://ktwkxynciynecvhlaqqs.supabase.co/functions/v1/chat-tutor
```

You should see an error (that's OK!), but NOT a 404. If you see:
- ❌ "Function not found" or 404 → Not deployed
- ✅ "Missing authorization" or "Invalid request" → Deployed! ✅

### Check 3: Test with cURL
```bash
curl -i https://ktwkxynciynecvhlaqqs.supabase.co/functions/v1/chat-tutor
```

Should return:
- Status: 500 or 400 (OK - function exists!)
- NOT 404 (that means not deployed)

---

## After Deployment - Test Again

Once deployed, try this in browser console:

```javascript
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0d2t4eW5jaXluZWN2aGxhcXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0OTkxNjYsImV4cCI6MjA3NTA3NTE2Nn0.ilQB3P5ERFPrPefedMcEJZj6_SwTML4Y1fCQlgptZ4U";

fetch('https://ktwkxynciynecvhlaqqs.supabase.co/functions/v1/chat-tutor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`,
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'What is 2+2?' }]
  })
})
.then(r => r.json())
.then(data => {
  if (data.error) {
    console.error('❌ Error:', data.error);
  } else {
    console.log('✅ Success! Response:', data.response);
  }
});
```

---

## Understanding CORS

### What is CORS?
**Cross-Origin Resource Sharing** - Browser security that blocks requests from different origins.

### Why the Error?
1. Your app runs on: `http://localhost:8080`
2. Edge function is on: `https://ktwkxynciynecvhlaqqs.supabase.co`
3. Different origins → Browser checks CORS headers
4. If function doesn't exist (404) → No CORS headers → Error!

### CORS Flow
```
Browser → OPTIONS request (preflight)
         ↓
Server → Must return 200 with CORS headers
         ↓
Browser → Allows POST request
         ↓
Server → Returns data with CORS headers
```

### Fixed in Code
I updated the edge function with proper CORS headers:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
```

---

## Common Mistakes

### ❌ Function code exists locally but NOT deployed
→ **Solution:** Deploy it to Supabase!

### ❌ Function deployed but wrong name
→ **Check:** Must be exactly `chat-tutor`

### ❌ API key not added
→ **Add:** GEMINI_API_KEY in Secrets tab

### ❌ Wrong Supabase URL
→ **Verify:** Should be `ktwkxynciynecvhlaqqs.supabase.co`

---

## Quick Deployment Checklist

Use **Method 1** above (Dashboard) - it's the easiest!

- [ ] Go to Supabase Dashboard
- [ ] Click Edge Functions → New Function
- [ ] Name: `chat-tutor`
- [ ] Copy local code from index.ts
- [ ] Paste into Supabase editor
- [ ] Click Deploy
- [ ] Add GEMINI_API_KEY secret
- [ ] Test in browser console
- [ ] Try in your app

---

## After Deployment

Once deployed successfully:
1. ✅ CORS error will be gone
2. ✅ Edge function will respond
3. ✅ AI tutor will work in your app
4. ✅ Students can ask questions

---

## Need Help?

### Check Deployment Status
Dashboard → Edge Functions → chat-tutor
- Look for "Deployed" badge
- Check "Last deployed" timestamp

### Check Logs
Dashboard → Edge Functions → chat-tutor → Logs
- Look for errors
- Verify function is being called

### Still Stuck?
Most common issue: **Function not deployed**
→ Use Method 1 above to deploy it!

---

## Summary

**The CORS error = Function not deployed yet!**

✅ **Fix:** Deploy via Supabase Dashboard (2 minutes)  
✅ **Then:** Test again - error will be gone!

The code is perfect, it just needs to be deployed! 🚀
