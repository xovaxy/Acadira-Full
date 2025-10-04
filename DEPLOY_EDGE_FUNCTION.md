# Deploy Edge Function to Supabase

## The edge function exists locally but needs to be deployed to Supabase!

---

## Method 1: Deploy Using Supabase CLI (Recommended)

### Step 1: Install Supabase CLI (if not installed)

```bash
# Windows (PowerShell as Admin)
npm install -g supabase

# Or using scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase

```bash
npx supabase login
```

This will open a browser for authentication.

### Step 3: Link Your Project

```bash
cd "c:/Users/Admin/Desktop/acadira prototype"
npx supabase link --project-ref ktwkxynciynecvhlaqqs
```

It will ask for your database password.

### Step 4: Deploy the Function

```bash
npx supabase functions deploy chat-tutor
```

Done! ✅

---

## Method 2: Create Manually in Supabase Dashboard (Easier)

### Step 1: Create the Function

1. Go to **https://supabase.com/dashboard/project/ktwkxynciynecvhlaqqs**
2. Click **"Edge Functions"** in the left sidebar
3. Click **"Create a new function"** button
4. Enter:
   - **Name**: `chat-tutor`
   - Click **"Create function"**

### Step 2: Add the Code

1. The editor will open
2. **Delete** any example code
3. Open your local file: `c:/Users/Admin/Desktop/acadira prototype/supabase/functions/chat-tutor/index.ts`
4. **Select ALL** the code (Ctrl+A)
5. **Copy** it (Ctrl+C)
6. Go back to Supabase Dashboard
7. **Paste** the code into the editor (Ctrl+V)
8. Click **"Deploy"** button at the top right

### Step 3: Add the API Key Secret

1. Still in the chat-tutor function page
2. Click **"Secrets"** tab
3. Click **"Add a new secret"** or **"New secret"**
4. Enter:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key from https://aistudio.google.com/app/apikey
5. Click **"Add secret"**

---

## Method 3: Quick Deploy Script

Save this as `deploy.ps1` and run it:

```powershell
# Navigate to project
cd "c:\Users\Admin\Desktop\acadira prototype"

# Deploy function
npx supabase functions deploy chat-tutor --project-ref ktwkxynciynecvhlaqqs

Write-Host "Edge function deployed successfully!" -ForegroundColor Green
Write-Host "Don't forget to add GEMINI_API_KEY secret in Supabase Dashboard!" -ForegroundColor Yellow
```

Run it:
```bash
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

---

## Verify Deployment

After deploying, check:

1. Go to **Supabase Dashboard** → **Edge Functions**
2. You should see **"chat-tutor"** listed
3. Click on it
4. Should show:
   - ✅ Status: Deployed
   - ✅ Last deployed: [recent timestamp]
   - ✅ Invocations: 0 (will increase when used)

---

## Testing

Once deployed:

### Test 1: Check Function URL
In Supabase Dashboard → Edge Functions → chat-tutor, you'll see:
```
https://ktwkxynciynecvhlaqqs.supabase.co/functions/v1/chat-tutor
```

### Test 2: Test in Your App
1. Login as student
2. Go to AI Tutor
3. Ask a question
4. Should work! ✅

---

## Troubleshooting

### "supabase: command not found"
- Install Supabase CLI first (see Method 1, Step 1)

### "Project not found"
- Make sure you're logged in: `npx supabase login`
- Check project ref is correct: `ktwkxynciynecvhlaqqs`

### "Deployment failed"
- Check the code has no syntax errors
- Make sure you're in the right directory
- Try Method 2 (manual) instead

### "Function exists but not working"
- Make sure you added `GEMINI_API_KEY` secret
- Check logs: Dashboard → Edge Functions → chat-tutor → Logs
- Verify the code was deployed correctly

---

## Recommended: Use Method 2 (Manual)

For first-time setup, **Method 2 is easiest**:
1. ✅ No CLI installation needed
2. ✅ Visual editor
3. ✅ Easy to verify
4. ✅ Add secrets in same interface

Takes only 2 minutes!

---

## After Deployment Checklist

- [ ] Edge function created and deployed
- [ ] Code is visible in Supabase editor
- [ ] `GEMINI_API_KEY` secret added
- [ ] Function status shows "Deployed"
- [ ] Tested with student account
- [ ] AI tutor responds to questions

Once all checked, you're done! 🎉
