# Fix 500 Error - Edge Function Debugging

## What the Error Means

```
Failed to load resource: the server responded with a status of 500
```

✅ **Good news:** Function is deployed!  
❌ **Issue:** Function is crashing when it runs

---

## Most Common Causes

### 1. Missing GEMINI_API_KEY (Most Likely)

**Check:** Supabase Dashboard → Edge Functions → chat-tutor → **Secrets**

Is `GEMINI_API_KEY` listed?
- ❌ **No** → Add it! (see below)
- ✅ **Yes** → Check if it's correct

**How to Add:**
1. Go to https://aistudio.google.com/app/apikey
2. Create API key (free)
3. Copy the key (starts with `AIza...`)
4. Supabase Dashboard → Edge Functions → chat-tutor → Secrets → New secret
5. Name: `GEMINI_API_KEY`
6. Value: Paste your key
7. Save

### 2. Invalid API Key

**Check:** Is the key correct?
- Try generating a new key from Google AI Studio
- Make sure you copied the entire key
- Check for extra spaces

### 3. Gemini API Error

**Check logs:** Dashboard → Edge Functions → chat-tutor → **Logs**

Look for error messages like:
- "GEMINI_API_KEY is not configured"
- "Invalid API key"
- "Gemini API error: 403"

---

## How to Debug - Check Logs

### Step 1: Open Logs
1. Supabase Dashboard
2. Edge Functions → chat-tutor
3. Click **"Logs"** tab

### Step 2: Look for Errors
You should see recent requests. Look for:

**If missing API key:**
```
ERROR GEMINI_API_KEY is not configured
```

**If invalid API key:**
```
ERROR Gemini API error: 403 - Invalid API key
```

**If Gemini quota exceeded:**
```
ERROR Gemini API error: 429 - Rate limit exceeded
```

---

## Quick Test with Better Error Logging

Try this in browser console to see the exact error:

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
.then(async r => {
  const data = await r.json();
  console.log('Status:', r.status);
  console.log('Response:', data);
  if (data.error) {
    console.error('❌ Error details:', data.error);
  }
  return data;
})
.catch(err => console.error('❌ Network error:', err));
```

This will show you the exact error message!

---

## Solutions by Error Type

### Error: "GEMINI_API_KEY is not configured"
**Solution:**
1. Get API key: https://aistudio.google.com/app/apikey
2. Add to Supabase secrets
3. Try again

### Error: "Invalid API key" or 403
**Solution:**
1. Verify the API key is correct
2. Make sure it's a Gemini API key (not another service)
3. Try generating a new key
4. Check you have the right Google account

### Error: "Rate limit exceeded" or 429
**Solution:**
- Wait a minute and try again
- Free tier: 15 requests per minute
- Quota resets every minute

### Error: "Unexpected response format"
**Solution:**
- Check Gemini API is working
- Try a simpler question
- Check logs for details

---

## Step-by-Step Fix

### Option 1: Add/Update API Key

1. **Get Gemini API Key:**
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with Google
   - Click "Get API Key" or "Create API Key"
   - Copy the key (starts with `AIza...`)

2. **Add to Supabase:**
   - Dashboard → Edge Functions → chat-tutor
   - Click "Secrets" tab
   - If GEMINI_API_KEY exists: Delete it and re-add
   - If not: Click "New secret"
   - Name: `GEMINI_API_KEY`
   - Value: Paste your key
   - Click "Add secret"

3. **Test Again:**
   - Run the test code above in console
   - Should work now! ✅

### Option 2: Redeploy with Updated Code

If you made code changes:
1. Copy ALL code from local `index.ts`
2. Dashboard → Edge Functions → chat-tutor → Edit
3. Paste code
4. Click "Deploy"

---

## Verify Setup Checklist

- [ ] Function is deployed (you can see it in Dashboard)
- [ ] `GEMINI_API_KEY` secret exists
- [ ] API key is valid (from Google AI Studio)
- [ ] No typos in secret name (must be exact: `GEMINI_API_KEY`)
- [ ] Checked logs for specific error
- [ ] Tested with browser console

---

## Example of Working Response

When everything is correct, you should see:

```javascript
Status: 200
Response: {
  response: "2 + 2 equals 4. This is a basic arithmetic operation..."
}
```

---

## Still Not Working?

### Check These:

1. **Logs show errors?**
   - Read the error message
   - Follow the solution for that error

2. **No logs at all?**
   - Function might not be receiving requests
   - Check if URL is correct
   - Verify ANON_KEY is correct

3. **"Network error"?**
   - Check internet connection
   - Verify Supabase URL is correct

---

## Common Mistakes

❌ Secret name is wrong (must be exactly `GEMINI_API_KEY`)  
❌ API key has spaces or incomplete  
❌ Using wrong type of API key (not Gemini)  
❌ Didn't click "Save" after adding secret  
❌ Old deployment still active (redeploy)  

---

## Quick Fix Summary

**Most likely issue: Missing or invalid GEMINI_API_KEY**

Fix in 1 minute:
1. Get key: https://aistudio.google.com/app/apikey
2. Add to Supabase: Dashboard → Edge Functions → chat-tutor → Secrets
3. Test: Run code in browser console
4. ✅ Done!

---

## After Fixing

Once the API key is added correctly:
- ✅ 500 error will be gone
- ✅ Function will return responses
- ✅ AI tutor will work in your app
- ✅ Students can ask questions

The function code is correct - just needs the API key! 🚀
