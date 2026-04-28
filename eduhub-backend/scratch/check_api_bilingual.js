// Check actual API response for textEn vs textHi
const https = require('https');
const http = require('http');

async function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const lib = urlObj.protocol === 'https:' ? https : http;
        const req = lib.request({
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function main() {
    const BASE = 'http://localhost:4000';
    
    // Step 1: Login
    console.log('Logging in...');
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rahulsriwastaw7643@gmail.com', password: '8863999370' })
    });
    
    const loginData = JSON.parse(loginRes.body);
    const token = loginData?.data?.accessToken || loginData?.data?.token || loginData?.token || loginData?.accessToken;
    if (!token) {
        console.log('Login failed:', loginRes.body.slice(0, 300));
        return;
    }
    console.log('Logged in! Role:', loginData?.data && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role);

    // Step 2: Get test attempts - try student endpoint
    const testId = '730254712620cec16b456f6c';
    const attemptsRes = await fetch(`${BASE}/api/mockbook/tests/${testId}/my-attempts`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const attemptsData = JSON.parse(attemptsRes.body);
    const attempts = attemptsData.data || [];
    console.log(`\nAttempts found: ${attempts.length}`);
    if (!attempts.length) { console.log('No attempts'); return; }

    const attemptId = attempts[attempts.length - 1].id;
    console.log('Using attempt:', attemptId);

    // Step 3: Fetch review data
    const reviewRes = await fetch(`${BASE}/api/mockbook/attempts/${attemptId}/review`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const reviewData = JSON.parse(reviewRes.body);
    const questions = reviewData.data?.questions || [];
    console.log(`\nTotal questions: ${questions.length}`);

    // Show first 3 questions' bilingual data
    for (let i = 0; i < Math.min(3, questions.length); i++) {
        const q = questions[i];
        console.log(`\n=== Question ${i+1} ===`);
        console.log('textEn:', q.textEn ? q.textEn.slice(0, 100) : '(null/empty)');
        console.log('textHi:', q.textHi ? q.textHi.slice(0, 100) : '(null/empty)');
        console.log('SAME?', q.textEn === q.textHi);
        if (q.options && q.options[0]) {
            const opt = q.options[0];
            console.log('  Opt A textEn:', opt.textEn || '(null)');
            console.log('  Opt A textHi:', opt.textHi || '(null)');
            console.log('  Opt A SAME?', opt.textEn === opt.textHi);
        }
    }
}

main().catch(console.error);
