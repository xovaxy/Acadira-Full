# Fix AI Tutor Edge Function

## Problem
"Failed to send request from edge function" error when using AI tutor.

## Cause
The edge function requires `LOVABLE_API_KEY` environment variable which is not configured in Supabase.

---

## Solution 1: Configure LOVABLE_API_KEY (Current Setup)

If you have a Lovable API key:

1. Go to **Supabase Dashboard** → Your Project
2. Click **"Edge Functions"** in the left sidebar
3. Click **"Manage secrets"** or **"Settings"**
4. Add a new secret:
   - Name: `LOVABLE_API_KEY`
   - Value: Your Lovable API key
5. Redeploy the edge function

---

## Solution 2: Switch to OpenAI (Recommended)

OpenAI is more widely available and easier to set up. Here's how:

### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create an account if needed
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-`)

### Step 2: Add API Key to Supabase
1. Go to **Supabase Dashboard** → Your Project
2. Click **"Edge Functions"** → **"Manage secrets"**
3. Add secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (paste the `sk-...` key)

### Step 3: Update Edge Function
The updated code is in: `supabase/functions/chat-tutor/index.ts`

---

## Solution 3: Use Free Alternative (Groq)

Groq offers free fast AI inference. Here's how:

### Step 1: Get Groq API Key
1. Go to https://console.groq.com/keys
2. Sign up (free)
3. Create an API key
4. Copy the key

### Step 2: Add to Supabase
1. Supabase Dashboard → Edge Functions → Manage secrets
2. Add:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key

---

## Quick Fix: Test Locally First

To test if the issue is with the API key:

1. Check Supabase logs:
   - Dashboard → Edge Functions → chat-tutor → Logs
   - Look for errors

2. Check if the function is deployed:
   - Dashboard → Edge Functions
   - Should see `chat-tutor` listed

---

## Recommended: Use OpenAI

OpenAI is the most reliable option. After getting your API key, I'll update the edge function code to use it.
