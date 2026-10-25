'use strict';

const http = require('node:http');
const { URL } = require('node:url');
const { readConfig, verifyRequest } = require('./lib.cjs');
const { captureTvScreen } = require('./capture.cjs');

function createServer(config, capture) {
  const render = capture || captureTvScreen;
  let busy = false;
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (request.method === 'GET' && url.pathname === '/health') {
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end('{"ok":true}');
      return;
    }
    if (request.method !== 'GET' || url.pathname !== '/snapshot') {
      response.writeHead(404, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end('{"ok":false,"error":"NOT_FOUND"}');
      return;
    }
    const target = String(url.searchParams.get('target') || '');
    const timestamp = String(request.headers['x-brixton-timestamp'] || '');
    const signature = String(request.headers['x-brixton-signature'] || '').toLowerCase();
    if (!verifyRequest(config.renderSecret, timestamp, target, signature)) {
      response.writeHead(401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end('{"ok":false,"error":"UNAUTHORIZED"}');
      return;
    }
    if (busy) {
      response.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': '10' });
      response.end('{"ok":false,"error":"BUSY"}');
      return;
    }
    busy = true;
    try {
      const png = await render(target, config);
      response.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': png.length,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(png);
    } catch (error) {
      console.error('TV_REPORT_RENDER_FAILED target=' + target + ' code=' + String(error && error.message || 'UNKNOWN').slice(0, 100));
      response.writeHead(502, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end('{"ok":false,"error":"RENDER_FAILED"}');
    } finally {
      busy = false;
    }
  });
}

if (require.main === module) {
  const config = readConfig(process.env);
  createServer(config).listen(config.port, '127.0.0.1', () => {
    console.log('TV_REPORT_RENDERER_READY port=' + config.port);
  });
}

module.exports = { createServer };
