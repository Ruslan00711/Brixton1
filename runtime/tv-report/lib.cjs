'use strict';

const crypto = require('node:crypto');

const TARGETS = Object.freeze({
  mendeleeva: Object.freeze({ branchId: '694866', screen: 'dashboardScreen' }),
  entuziastov: Object.freeze({ branchId: '1076318', screen: 'dashboardScreen' }),
  network: Object.freeze({ branchId: '694866', screen: 'networkScreen' }),
});

function canonicalRequest(timestamp, target) {
  return String(timestamp) + '\n' + String(target);
}

function signRequest(secret, timestamp, target) {
  return crypto.createHmac('sha256', secret).update(canonicalRequest(timestamp, target), 'utf8').digest('hex');
}

function verifyRequest(secret, timestamp, target, supplied, nowSeconds) {
  if (!TARGETS[target] || !/^\d{10}$/.test(String(timestamp || '')) || !/^[a-f0-9]{64}$/.test(String(supplied || ''))) return false;
  const now = Number.isFinite(nowSeconds) ? nowSeconds : Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 180) return false;
  const expected = Buffer.from(signRequest(secret, timestamp, target), 'hex');
  const actual = Buffer.from(supplied, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function readConfig(env) {
  const config = {
    port: Number(env.TV_REPORT_PORT || 3012),
    baseUrl: String(env.TV_REPORT_BASE_URL || 'https://shtabix.ru').replace(/\/$/, ''),
    chromiumPath: String(env.TV_REPORT_CHROMIUM_PATH || ''),
    renderSecret: String(env.TV_SCREENSHOT_RENDER_SECRET || ''),
    mendeleevaToken: String(env.TV_REPORT_MENDELEEVA_TOKEN || ''),
    entuziastovToken: String(env.TV_REPORT_ENTUZIASTOV_TOKEN || ''),
  };
  if (!Number.isInteger(config.port) || config.port < 1024 || config.port > 65535) throw new Error('TV_REPORT_PORT_INVALID');
  if (!/^https:\/\//.test(config.baseUrl)) throw new Error('TV_REPORT_BASE_URL_INVALID');
  if (!config.chromiumPath) throw new Error('TV_REPORT_CHROMIUM_PATH_REQUIRED');
  if (config.renderSecret.length < 32) throw new Error('TV_SCREENSHOT_RENDER_SECRET_REQUIRED');
  if (!/^btv1_[a-f0-9]{64}$/.test(config.mendeleevaToken)) throw new Error('TV_REPORT_MENDELEEVA_TOKEN_INVALID');
  if (!/^btv1_[a-f0-9]{64}$/.test(config.entuziastovToken)) throw new Error('TV_REPORT_ENTUZIASTOV_TOKEN_INVALID');
  return config;
}

module.exports = { TARGETS, canonicalRequest, signRequest, verifyRequest, readConfig };
