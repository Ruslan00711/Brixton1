'use strict';

const { TARGETS } = require('./lib.cjs');

const TENANT = '6a778c5d-e8be-49b5-a273-130691b3116f';
const STORAGE_KEY = 'BRIXTON_TV_DEVICE_V1';

async function captureTvScreen(target, config, runtime) {
  const targetConfig = TARGETS[target];
  if (!targetConfig) throw new Error('TV_REPORT_TARGET_INVALID');
  const playwright = runtime && runtime.playwright ? runtime.playwright : require('playwright-core');
  const token = targetConfig.branchId === '1076318' ? config.entuziastovToken : config.mendeleevaToken;
  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: config.chromiumPath,
    args: ['--disable-dev-shm-usage', '--no-first-run', '--no-default-browser-check'],
  });
  try {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await context.addInitScript(({ key, tenant, branchId, deviceToken }) => {
      localStorage.setItem(key, JSON.stringify({
        device: { organization_id: tenant, company_id: branchId },
        deviceToken: deviceToken,
      }));
    }, { key: STORAGE_KEY, tenant: TENANT, branchId: targetConfig.branchId, deviceToken: token });
    const page = await context.newPage();
    const url = config.baseUrl + '/board.html?branch=' + encodeURIComponent(targetConfig.branchId) + '&manual=1&tvReport=1&_=' + Date.now();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading');
      const panel = document.getElementById('tvDeviceSetup');
      const branch = document.querySelector('.branch');
      return loading && getComputedStyle(loading).display === 'none' &&
        (!panel || getComputedStyle(panel).display === 'none') && branch && branch.textContent.trim() !== '—';
    }, null, { timeout: 60000 });
    if (targetConfig.screen === 'networkScreen') {
      await page.waitForFunction(() => document.querySelectorAll('#networkRankingBody tr').length >= 1, null, { timeout: 60000 });
      await page.evaluate(() => showScreen(1));
      await page.waitForFunction(() => document.getElementById('networkScreen').classList.contains('active') && document.querySelectorAll('#networkRankingBody tr').length === 11, null, { timeout: 15000 });
    } else {
      await page.evaluate(() => showScreen(0));
      await page.waitForFunction(() => document.getElementById('dashboardScreen').classList.contains('active'), null, { timeout: 15000 });
    }
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.evaluate((screen) => showScreen(screen === 'networkScreen' ? 1 : 0), targetConfig.screen);
    await page.waitForFunction((screen) => document.getElementById(screen).classList.contains('active'), targetConfig.screen, { timeout: 15000 });
    const active = await page.evaluate(() => document.querySelector('.tv-screen.active') && document.querySelector('.tv-screen.active').id);
    if (active !== targetConfig.screen) throw new Error('TV_REPORT_SCREEN_NOT_READY');
    return await page.screenshot({ type: 'png', fullPage: false });
  } finally {
    await browser.close();
  }
}

module.exports = { captureTvScreen, TENANT, STORAGE_KEY };
