# How to Test the AI Tutor Edge Function

## Prerequisites

✅ Edge function deployed to Supabase  
✅ GEMINI_API_KEY added to secrets  

---

## Method 1: Test in Your App (Easiest)

### Step 1: Login as Student
1. Start your dev server: `npm run dev`
2. Go to http://localhost:5173
3. Click **"Student Login"**
4. Login with a student account

### Step 2: Use AI Tutor
1. Once logged in, you'll see the AI Tutor interface
2. Type a question: **"What is photosynthesis?"**
3. Click **Send**
4. ✅ Should get a response in 2-3 seconds!

### Step 3: Check Console
Open browser DevTools (F12) and check:
- **Console tab** - Should show no errors
- **Network tab** - Look for `chat-tutor` request, status should be 200

---

## Method 2: Test with Browser Console

### Quick Test (Before Full Deployment)

Open browser console (F12) and run:

```javascript
// Test the edge function directly
const testAITutor = async () => {
  const response = await fetch(
    'https://ktwkxynciynecvhlaqqs.supabase.co/functions/v1/chat-tutor',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ANON_KEY', // From .env VITE_SUPABASE_PUBLISHABLE_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'What is 2+2?' }
        ]
      })
    }
  );
  
  const data = await response.json();
  console.log('Response:', data);
  return data;
};

// Run the test
testAITutor();
```

Replace `YOUR_ANON_KEY` with the key from your `.env` file.

---

## Method 3: Test with cURL (Terminal)

### Simple Test

```bash
curl -X POST \
  'https://ktwkxynciynecvhlaqqs.supabase.co/functions/v1/chat-tutor' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

### Expected Response

```json
{
  "response": "The capital of France is Paris. Paris is not only the capital but also the largest city in France..."
}
```

---

## Method 4: Test with Postman

### Setup
1. Open Postman
2. Create new **POST** request
3. URL: `https://ktwkxynciynecvhlaqqs.supabase.co/functions/v1/chat-tutor`

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_ANON_KEY
```

### Body (JSON)
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain Newton's first law of motion"
    }
  ]
}
```

### Send
Click **Send** and you should get a detailed response!

---

## Method 5: Check Supabase Logs

### View Logs
1. Go to **Supabase Dashboard**
2. Click **Edge Functions** → **chat-tutor**
3. Click **Logs** tab
4. You'll see:
   - ✅ All function invocations
   - ✅ Console.log outputs
   - ✅ Errors (if any)

### What to Look For

**Success:**
```
INFO Using Google Gemini API
INFO Function executed successfully
```

**Errors:**
```
ERROR GEMINI_API_KEY is not configured
ERROR Gemini API error: 403
```

---

## Testing Checklist

### Basic Tests
- [ ] Function responds to requests
- [ ] Returns valid JSON
- [ ] Response contains AI-generated text
- [ ] No errors in logs

### Advanced Tests
- [ ] Multiple messages in conversation
- [ ] Long questions
- [ ] Special characters in questions
- [ ] Multiple rapid requests
- [ ] Offensive language filtered

### Error Handling Tests
- [ ] Missing API key (should return error)
- [ ] Invalid request format (should return error)
- [ ] Rate limit (should return 429)

---

## Common Issues & Solutions

### Issue: "Failed to send request"
**Cause:** Function not deployed  
**Solution:** Deploy the function (see DEPLOY_EDGE_FUNCTION.md)

### Issue: "GEMINI_API_KEY is not configured"
**Cause:** API key not added to secrets  
**Solution:** Add GEMINI_API_KEY in Supabase Dashboard → Edge Functions → Secrets

### Issue: "Invalid API key"
**Cause:** Wrong or expired API key  
**Solution:** Get new key from https://aistudio.google.com/app/apikey

### Issue: "CORS error"
**Cause:** Missing CORS headers  
**Solution:** Already fixed in the code (corsHeaders)

### Issue: No response after 30 seconds
**Cause:** Function timeout or API issue  
**Solution:** Check Supabase logs for errors

---

## Test Questions to Try

### Simple Questions
- "What is 2+2?"
- "What is the capital of France?"
- "Define photosynthesis"

### Educational Questions
- "Explain the Pythagorean theorem"
- "What causes seasons?"
- "How does photosynthesis work?"

### Complex Questions
- "Explain the difference between mitosis and meiosis"
- "What is the theory of relativity?"
- "How do vaccines work?"

---

## Performance Metrics

### Expected Response Times
- Simple questions: **1-2 seconds**
- Complex questions: **2-4 seconds**
- Very long answers: **3-5 seconds**

### Rate Limits (Gemini Free Tier)
- **15 requests per minute**
- **1,500 requests per day**

If you hit the limit, you'll get:
```json
{
  "error": "Rate limit exceeded. Please try again in a moment."
}
```

---

## Quick Test Script

Save as `test-ai-tutor.js`:

```javascript
const SUPABASE_URL = "https://ktwkxynciynecvhlaqqs.supabase.co";
const ANON_KEY = "YOUR_ANON_KEY"; // From .env

async function testAITutor(question) {
  console.log(`\n🧪 Testing: "${question}"\n`);
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/chat-tutor`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: question }]
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Error:', data.error);
    } else {
      console.log('✅ Response:', data.response.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run tests
(async () => {
  await testAITutor("What is 2+2?");
  await testAITutor("Explain photosynthesis");
  console.log("\n✅ Tests complete!");
})();
```

Run it:
```bash
node test-ai-tutor.js
```

---

## Monitoring in Production

### Dashboard Metrics
Go to Supabase Dashboard → Edge Functions → chat-tutor:
- **Invocations** - Total requests
- **Errors** - Failed requests
- **Duration** - Response times

### Set Up Alerts
1. Dashboard → Settings → Alerts
2. Add alert for:
   - High error rate
   - Slow response times
   - High usage

---

## Final Checklist

Before going live:
- [ ] Test with simple question
- [ ] Test with complex question
- [ ] Test with multiple messages
- [ ] Check logs show no errors
- [ ] Verify response times are good
- [ ] Test from actual student account
- [ ] Test offensive language filter

---

## Need Help?

If tests fail:
1. Check Supabase logs first
2. Verify GEMINI_API_KEY is set
3. Confirm function is deployed
4. Try a simple question first
5. Check network tab in browser

**Most common issue:** GEMINI_API_KEY not added to secrets!

---

## ✅ Success Looks Like

When working correctly:
```
Student types: "What is photosynthesis?"
↓ (2 seconds)
AI responds: "Photosynthesis is the process by which plants..."
✅ Conversation continues smoothly
✅ No errors in console
✅ Fast response times
```

You're ready to test! 🚀
