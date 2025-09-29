// Simple API test script for local dev
// Usage: BASE_URL=http://127.0.0.1:8787 node test.js

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8787';

async function postJson(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body || {})
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

async function main() {
  console.log(`Testing base URL: ${BASE}`);
  const email = `user_${Math.random().toString(36).slice(2)}@example.com`;
  const password = 'StrongPass123!';

  // Signup
  let token = null;
  let userId = null;
  console.log('-> Signing up');
  let r = await postJson('/auth/signup', { email, password });
  if (r.status === 200 && r.json && r.json.token) {
    token = r.json.token;
    userId = r.json.user_id;
    console.log('Signup ok');
  } else {
    console.log('Signup failed, attempting login');
    r = await postJson('/auth/login', { email, password });
    if (r.status === 200 && r.json && r.json.token) {
      token = r.json.token;
      userId = r.json.user_id;
      console.log('Login ok');
    } else {
      console.error('Auth failed:', r);
      process.exit(1);
    }
  }

  // Update preferences
  console.log('-> Updating preferences');
  r = await postJson('/prefs/update', {
    language: 'English',
    madhhab: 'Hanafi',
    interests: ['Fiqh', 'Tafsir']
  }, token);
  if (r.status !== 200) {
    console.error('Prefs update failed:', r);
    process.exit(1);
  }

  // Chat (non-stream)
  console.log('-> Chatting');
  r = await postJson('/api/chat?session_id=s1', {
    message: 'Namaz chhutt jaye to kya karna chahiye?',
    streaming_options: { enableStreaming: false },
    mode: 'terse'
  }, token);
  if (r.status !== 200) {
    console.error('Chat failed:', r);
    process.exit(1);
  }

  console.log('Chat response snippet:', (r.json && r.json.reply) ? r.json.reply.slice(0, 200) : r.json);
  console.log('All tests completed successfully.');
}

main().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});


