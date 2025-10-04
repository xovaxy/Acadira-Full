# Google Gemini AI Tutor Setup

## Overview
Your AI tutor now uses **Google Gemini 1.5 Flash** - completely free for educational use!

### Why Gemini?
- ✅ **FREE** - 15 requests per minute, 1 million requests per day
- ✅ **Fast** - Quick responses
- ✅ **Reliable** - Google's infrastructure
- ✅ **Smart** - Latest Gemini 1.5 Flash model
- ✅ **Safe** - Built-in content filtering

---

## Setup Steps (5 minutes)

### Step 1: Get Gemini API Key (FREE)

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Select **"Create API key in new project"** (or use existing)
5. **Copy the API key** (starts with `AIza...`)

### Step 2: Add to Supabase

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `ktwkxynciynecvhlaqqs`
3. Click **"Edge Functions"** in the left sidebar
4. Find **"chat-tutor"** and click on it
5. Click **"Secrets"** tab
6. Click **"New secret"**
7. Enter:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Paste your API key (the `AIza...` string)
8. Click **"Add secret"** or **"Save"**

### Step 3: Deploy Updated Function

#### Option A: Manual Deploy (Easiest)
1. In Supabase Dashboard, go to **Edge Functions** → **chat-tutor**
2. Click **"Edit"** or **"Code"** tab
3. **Delete all existing code**
4. Open your local file: `c:/Users/Admin/Desktop/acadira prototype/supabase/functions/chat-tutor/index.ts`
5. **Copy ALL the code** from that file
6. **Paste** it into the Supabase editor
7. Click **"Deploy"** or **"Save & Deploy"**
8. Wait for "Deployment successful" message

#### Option B: Using Supabase CLI (if installed)
```bash
cd "c:/Users/Admin/Desktop/acadira prototype"
npx supabase functions deploy chat-tutor
```

---

## Testing

### Test 1: Check Deployment
1. Go to Supabase Dashboard → Edge Functions → chat-tutor
2. Click **"Logs"** tab
3. Should see no errors

### Test 2: Test in Your App
1. **Logout** and **login** as a student
2. Go to **AI Tutor** section
3. Type: **"What is the Pythagorean theorem?"**
4. Click **Send**
5. ✅ Should get a detailed explanation!

---

## Troubleshooting

### "GEMINI_API_KEY is not configured"
- **Solution**: Make sure you added the secret in Step 2
- Go to Edge Functions → chat-tutor → Secrets
- Verify `GEMINI_API_KEY` is listed

### "Invalid API key"
- **Solution**: Check your API key is correct
- Go to https://aistudio.google.com/app/apikey
- Copy the key again
- Update the secret in Supabase

### "Failed to send request"
- **Solution**: Function not deployed
- Redeploy using Method A above
- Check logs for errors

### Still not working?
1. Check Supabase logs: Edge Functions → chat-tutor → Logs
2. Look for red error messages
3. Common issues:
   - API key missing → Add it
   - Function not deployed → Deploy it
   - Network error → Check Supabase status

---

## Usage Limits (FREE Tier)

Google Gemini Free Tier:
- ✅ **15 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **1 million requests per month**

This is **more than enough** for educational use!

Example:
- 100 students × 10 questions/day = 1,000 requests/day ✅
- Way under the limit!

---

## Cost

**$0.00** - Completely FREE! 🎉

Google provides Gemini API for free for educational and development use.

---

## API Key Security

Your API key is **secure**:
- ✅ Stored as a Supabase secret (encrypted)
- ✅ Never exposed to the frontend
- ✅ Only accessible by the edge function
- ✅ Not visible in browser/network requests

---

## Model Details

**Gemini 1.5 Flash** features:
- Fast responses (~1-2 seconds)
- Smart and accurate
- Good at educational content
- Built-in safety filters
- Supports long context (conversation history)

---

## Next Steps

1. ✅ Get your API key from Google AI Studio
2. ✅ Add it to Supabase secrets
3. ✅ Deploy the updated function
4. ✅ Test with a student account

**That's it!** Your AI tutor is ready to help students 24/7! 🚀

---

## Support

If you need help:
1. Check the **Logs** in Supabase Dashboard
2. Verify the API key is added correctly
3. Make sure the function is deployed
4. Test with a simple question first

Your AI tutor is now powered by Google Gemini - fast, free, and reliable! 🎓
