// Simple local API tester for IslamicAI
// Usage: node test-local-api.js

const BASE_URL = 'http://127.0.0.1:8787/';

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  try {
    return { status: res.status, json: JSON.parse(text) };
  } catch {
    return { status: res.status, text };
  }
}

function printSection(title) {
  console.log(`\n==== ${title} ====`);
}

async function run() {
  try {
    printSection('Health Check');
    const health = await fetch(BASE_URL + 'health').then(r => r.json());
    console.log(health);

    const sessionId = `sess-${Date.now()}`;
    const userId = 'user-abc';

    // 1) Greeting (no search expected)
    printSection('Greeting (no search)');
    const greetBody = {
      session_id: sessionId,
      user_id: userId,
      message: 'hello kasa hai',
      streaming_options: { enableStreaming: false }
    };
    const greetRes = await postJSON(BASE_URL, greetBody);
    console.log(greetRes);

    // 2) Gaza news (NEWS MODE expected)
    printSection('Gaza news (NEWS MODE expected)');
    const newsBody = {
      session_id: sessionId,
      user_id: userId,
      message: 'today gaza kaa news bataa',
      streaming_options: { enableStreaming: false }
    };
    const newsRes = await postJSON(BASE_URL, newsBody);
    console.log(newsRes);

    // 3) Forget control demo (optional)
    printSection('Forget last memory');
    const forgetBody = {
      session_id: sessionId,
      user_id: userId,
      message: '/forget',
      streaming_options: { enableStreaming: false }
    };
    const forgetRes = await postJSON(BASE_URL, forgetBody);
    console.log(forgetRes);

    // 4) Multi-turn memory test in same session
    printSection('Multi-turn memory test (preferences + fact + recall + news)');
    const seq = [
      { message: 'My preferred language is Hindi' },
      { message: 'Islam me Zakat ka basic rule kya hai?' },
      { message: 'Mera birthday 5 May hai' },
      { message: 'Kya tumhe mera birthday yaad hai?' },
      { message: 'today gaza kaa news bataa' }
    ];
    for (const step of seq) {
      const body = {
        session_id: sessionId,
        user_id: userId,
        message: step.message,
        streaming_options: { enableStreaming: false }
      };
      const res = await postJSON(BASE_URL, body);
      const preview = res.json && res.json.reply ? res.json.reply.slice(0, 200) : JSON.stringify(res).slice(0, 200);
      console.log(`> ${step.message}`);
      console.log(preview + (preview.length === 200 ? '...' : ''));
    }

  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

run();


