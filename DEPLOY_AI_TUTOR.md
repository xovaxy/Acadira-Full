# Deploy AI Tutor Fix

## What Changed
Updated the edge function to support **3 AI providers**:
1. **OpenAI** (Recommended - most reliable)
2. **Groq** (Free alternative - fast)
3. **Lovable** (Original - if you have access)

---

## Quick Fix Steps

### Option 1: Use OpenAI (Recommended)

#### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign up / Log in
3. Click **"Create new secret key"**
4. Name it: `acadira-tutor`
5. **Copy the key** (starts with `sk-...`)

#### Step 2: Add to Supabase
1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `ktwkxynciynecvhlaqqs`
3. Click **"Edge Functions"** in left sidebar
4. Click **"chat-tutor"** function
5. Click **"Secrets"** tab (or "Manage secrets")
6. Click **"New secret"**
7. Enter:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Paste your `sk-...` key
8. Click **"Save"**

#### Step 3: Deploy Updated Function
```bash
# Navigate to project
cd "c:/Users/Admin/Desktop/acadira prototype"

# Deploy edge function (if you have Supabase CLI)
npx supabase functions deploy chat-tutor

# OR manually: Copy the file content from
# supabase/functions/chat-tutor/index.ts
# and paste it in Supabase Dashboard → Edge Functions → chat-tutor → Edit
```

---

### Option 2: Use Groq (Free Alternative)

#### Step 1: Get Groq API Key
1. Go to https://console.groq.com/keys
2. Sign up (free account)
3. Click **"Create API Key"**
4. **Copy the key**

#### Step 2: Add to Supabase
1. Supabase Dashboard → Edge Functions → chat-tutor → Secrets
2. Add:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your Groq key
3. Save

#### Step 3: Deploy (same as above)

---

## Manual Deployment (No CLI)

If you don't have Supabase CLI:

1. Go to **Supabase Dashboard**
2. Click **"Edge Functions"** → **"chat-tutor"**
3. Click **"Edit function"** (or create if doesn't exist)
4. Copy **ALL** the code from:
   `c:/Users/Admin/Desktop/acadira prototype/supabase/functions/chat-tutor/index.ts`
5. **Paste** it into the editor
6. Click **"Deploy"** or **"Save"**

---

## Testing

After deploying:

1. **Logout** from your student account
2. **Login again** as a student
3. Go to **AI Tutor** tab
4. **Type a question**: "What is photosynthesis?"
5. **Click Send**
6. ✅ Should get a response!

---

## Troubleshooting

### Still getting error?

#### Check Logs:
1. Supabase Dashboard → Edge Functions → chat-tutor
2. Click **"Logs"** tab
3. Look for errors

#### Common Issues:

**"No AI API key configured"**
- Solution: Add OPENAI_API_KEY or GROQ_API_KEY to Supabase secrets

**"Rate limit exceeded"**
- Solution: Wait a minute, or upgrade OpenAI plan

**"Unauthorized"**
- Solution: Check your API key is correct

**"Failed to send request"**
- Solution: Function not deployed - redeploy it

---

## Cost Estimate

### OpenAI (gpt-3.5-turbo):
- ~$0.002 per 1000 tokens
- Average question: ~500 tokens = $0.001
- **1000 questions = ~$1**

### Groq:
- **FREE** (with limits)
- Very fast responses

---

## Recommended Setup

For production:
1. ✅ Use **OpenAI** with `gpt-3.5-turbo`
2. ✅ Set up usage limits in OpenAI dashboard
3. ✅ Monitor costs weekly

For testing/development:
1. ✅ Use **Groq** (free)
2. ✅ Switch to OpenAI when live

---

## Next Steps

1. **Get an API key** (OpenAI or Groq)
2. **Add it to Supabase** secrets
3. **Deploy the updated function**
4. **Test it** with a student account

Need help? Check the logs in Supabase Dashboard!
