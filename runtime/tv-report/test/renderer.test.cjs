'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('node:http');
const { signRequest, verifyRequest, readConfig, TARGETS } = require('../lib.cjs');
const { createServer } = require('../server.cjs');

const secret = 's'.repeat(64);

function config() {
  return readConfig({
    TV_REPORT_PORT: '3012',
    TV_REPORT_BASE_URL: 'https://shtabix.ru',
    TV_REPORT_CHROMIUM_PATH: '/usr/bin/chromium',
    TV_SCREENSHOT_RENDER_SECRET: secret,
    TV_REPORT_MENDELEEVA_TOKEN: 'btv1_' + 'a'.repeat(64),
    TV_REPORT_ENTUZIASTOV_TOKEN: 'btv1_' + 'b'.repeat(64),
  });
}

function request(port, path, headers) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host:'127.0.0.1', port, path, headers:headers || {} }, (res) => {
      const chunks=[]; res.on('data', chunk=>chunks.push(chunk)); res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));
    });
    req.on('error', reject);
  });
}

test('HMAC accepts only a fresh known target', () => {
  const now = 1792942800;
  const signature = signRequest(secret, now, 'network');
  assert.equal(verifyRequest(secret, String(now), 'network', signature, now), true);
  assert.equal(verifyRequest(secret, String(now), 'mendeleeva', signature, now), false);
  assert.equal(verifyRequest(secret, String(now - 181), 'network', signRequest(secret, now - 181, 'network'), now), false);
  assert.equal(verifyRequest(secret, String(now), 'unknown', signRequest(secret, now, 'unknown'), now), false);
});

test('targets keep branch dashboards separate and network authenticated', () => {
  assert.deepEqual(TARGETS.mendeleeva, {branchId:'694866',screen:'dashboardScreen'});
  assert.deepEqual(TARGETS.entuziastov, {branchId:'1076318',screen:'dashboardScreen'});
  assert.deepEqual(TARGETS.network, {branchId:'694866',screen:'networkScreen'});
});

test('snapshot endpoint rejects unsigned requests and returns PNG for signed request', async (t) => {
  const png = Buffer.from('89504e470d0a1a0a', 'hex');
  const server = createServer(config(), async (target) => { assert.equal(target, 'mendeleeva'); return png; });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const port=server.address().port;
  assert.equal((await request(port,'/snapshot?target=mendeleeva')).status,401);
  const timestamp=String(Math.floor(Date.now()/1000));
  const signed=await request(port,'/snapshot?target=mendeleeva',{'X-Brixton-Timestamp':timestamp,'X-Brixton-Signature':signRequest(secret,timestamp,'mendeleeva')});
  assert.equal(signed.status,200);
  assert.equal(signed.headers['content-type'],'image/png');
  assert.deepEqual(signed.body,png);
});

test('Apps Script overlay reuses existing bot and isolated destinations', () => {
  const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../../apps-script/TV_DAILY_SCREENSHOTS.js'),'utf8');
  assert.match(source,/getTelegramBotToken_\(\)/);
  assert.match(source,/message_thread_id/);
  assert.match(source,/sendPhoto/);
  assert.match(source,/tv_screenshot_' \+ item\.key \+ '_' \+ dateKey/);
  assert.doesNotMatch(source,/console\.log|deviceToken|TELEGRAM_BOT_TOKEN\s*=/);
});
