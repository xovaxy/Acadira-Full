# Verify Edge Function Deployment

## Check What's Actually Deployed

### Step 1: View Deployed Code
1. Go to Supabase Dashboard
2. Edge Functions → chat-tutor
3. Click "Edit" or "Code" tab
4. Search for "gemini" in the code (Ctrl+F)
5. You should see: `gemini-pro` 
6. NOT: `gemini-1.5-flash`

### Step 2: Check Recent Logs
1. Go to "Logs" tab
2. Look at the most recent error
3. What model name does it show?

### Step 3: Force Refresh and Test
Run this test with cache disabled:

```javascript
// Clear any cached responses first
fetch('https://ktwkxynciynecvhlaqqs.supabase.co/functions/v1/chat-tutor', {
  method: 'POST',
  cache: 'no-cache',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0d2t4eW5jaXluZWN2aGxhcXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0OTkxNjYsImV4cCI6MjA3NTA3NTE2Nn0.ilQB3P5ERFPrPefedMcEJZj6_SwTML4Y1fCQlgptZ4U',
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'What is 2+2?' }]
  })
})
.then(async r => {
  const text = await r.text();
  console.log('Status:', r.status);
  console.log('Raw response:', text);
  try {
    const data = JSON.parse(text);
    console.log('Parsed:', data);
  } catch(e) {
    console.log('Not JSON:', text);
  }
});
```
