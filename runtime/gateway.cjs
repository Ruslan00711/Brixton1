'use strict';
// No DB connection, OWNER middleware, cookies, request logging or credentials on disk.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const UPSTREAM = 'https://script.google.com/macros/s/AKfycbyqfD8xsp2rkX0eEASg2FoYXbtYpzXlC4TeXoS09RRDjvLDAG6UCNQqcLodVWG5oebzdA/exec';
const GET_ACTIONS = new Set(['getFreeSlots','getAdminSchedule','legacyAuthStatus']);
const POST_ACTIONS = new Set(['getTvBoard','getNetworkTvBoard','getTodaySchedule','registerTvDevice','listTvDevices','revokeTvDevice','refreshSlots',
  'registerFreeSlotsDevice','listFreeSlotsDevices','revokeFreeSlotsDevice',
  'getAdminData','saveAdmins','saveTasks','saveGoals','saveAnnouncements','saveAdminSchedule']);
const DEVICE_ACTIONS = new Set(['getTvBoard','getNetworkTvBoard','getTodaySchedule']);
const FREE_SLOTS_DEVICE_ACTIONS = new Set(['refreshSlots']);
const TV_COOKIE = 'BrixtonTvDeviceV1';
const FREE_SLOTS_COOKIE = 'BrixtonFreeSlotsDeviceV1';
const STATIC_FILES = new Map(['/board.html','/admin.html','/stories.html','/legacy-assets/tv-auth.js'].map(p=>[p,p.slice(1)]));
const deny = (status, message) => Object.assign(new Error(message), {status});
function cookie(req,name) {
  const found=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));
  return found ? decodeURIComponent(found.slice(name.length+1)) : '';
}
function durableCookie(name,value,maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Strict`;
}
function createGateway({transport = fetch, publicRoot = path.join(__dirname,'public'), now = Date.now} = {}) {
  const buckets = new Map();
  function checkRate(req, action) {
    // Forwarded header is set by the exact nginx location; listener is loopback-only.
    const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
    const key = ip + ':' + (GET_ACTIONS.has(action) || DEVICE_ACTIONS.has(action) ? 'read' : 'write');
    const time = now();
    if (buckets.size > 10000) for (const [k,b] of buckets) if (time-b.start>=60000) buckets.delete(k);
    const bucket = buckets.get(key);
    if (!bucket || time-bucket.start>=60000) {buckets.set(key,{start:time,count:1});return;}
    if (++bucket.count > (key.endsWith(':read') ? 120 : 20)) throw deny(429,'RATE_LIMITED');
  }
  return http.createServer(async (req,res)=>{
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('X-Frame-Options','DENY');
    try {
      const url = new URL(req.url,'http://localhost');
      if (STATIC_FILES.has(url.pathname) && req.method==='GET') {
        // Fail before rendering or running assets when a caller puts credentials in a URL.
        if ([...url.searchParams.keys()].some(k=>/token|secret|password|code/i.test(k))) throw deny(400,'CREDENTIAL_IN_URL_FORBIDDEN');
        res.setHeader('Content-Type',url.pathname.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
        res.end(fs.readFileSync(path.join(publicRoot,STATIC_FILES.get(url.pathname)))); return;
      }
      if (url.pathname!== '/legacy-api') throw deny(404,'NOT_FOUND');
      if (req.headers.origin && !['https://shtabix.ru','https://www.shtabix.ru'].includes(req.headers.origin)) throw deny(403,'ORIGIN_DENIED');
      if (req.headers['sec-fetch-site']==='cross-site') throw deny(403,'ORIGIN_DENIED');
      if (req.headers.authorization || req.headers['x-api-key']) throw deny(403,'AUTH_SCHEME_DENIED');
      let action, requestBody=null, upstreamUrl=UPSTREAM, opts={redirect:'follow',signal:AbortSignal.timeout(90000)};
      if (req.method==='GET') {
        const params=url.searchParams;
        if ([...params.keys()].some(k=>!['action','company_id','month','t','_'].includes(k))) throw deny(400,'QUERY_DENIED');
        action=params.get('action');
        if (!GET_ACTIONS.has(action)) throw deny(405,'AUTHENTICATED_POST_REQUIRED');
        const allowed=new URLSearchParams({action});
        if (action==='getAdminSchedule') {
          if (!['694866','1076318'].includes(params.get('company_id')) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(params.get('month')||'')) throw deny(400,'SCOPE_DENIED');
          allowed.set('company_id',params.get('company_id')); allowed.set('month',params.get('month'));
        }
        upstreamUrl+='?'+allowed;
      } else if (req.method==='POST') {
        if (url.search) throw deny(400,'QUERY_DENIED');
        if (!/^(application\/json|text\/plain)(;|$)/i.test(req.headers['content-type']||'')) throw deny(415,'CONTENT_TYPE_DENIED');
        let size=0, chunks=[];
        for await (const chunk of req) {size+=chunk.length;if(size>500000) throw deny(413,'REQUEST_TOO_LARGE');chunks.push(chunk);}
        let body; try {body=JSON.parse(Buffer.concat(chunks).toString('utf8'));} catch (_) {throw deny(400,'INVALID_JSON');}
        if (!body || Array.isArray(body) || typeof body!=='object' || !POST_ACTIONS.has(body.action)) throw deny(403,'ACTION_DENIED');
        action=body.action;
        if (body.ownerToken || body.apiKey || (body.deviceToken && !DEVICE_ACTIONS.has(action)) ||
            (body.adminDeviceToken && !FREE_SLOTS_DEVICE_ACTIONS.has(action))) throw deny(403,'DEVICE_SCOPE_DENIED');
        if (DEVICE_ACTIONS.has(action) && !body.deviceToken) body.deviceToken=cookie(req,TV_COOKIE);
        if (FREE_SLOTS_DEVICE_ACTIONS.has(action) && !body.adminToken && !body.adminDeviceToken)
          body.adminDeviceToken=cookie(req,FREE_SLOTS_COOKIE);
        requestBody=body;
        opts={...opts,method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)};
      } else throw deny(405,'METHOD_DENIED');
      checkRate(req, action);
      const result=await transport(upstreamUrl,opts);
      if (!result.ok) throw deny(502,'LEGACY_SOURCE_UNAVAILABLE');
      const raw=await result.text();
      if(raw.length>6000000) throw deny(502,'LEGACY_RESPONSE_TOO_LARGE');
      let data;try{data=JSON.parse(raw);}catch(_){throw deny(502,'LEGACY_RESPONSE_INVALID');}
      if (typeof data?.success!=='boolean') throw deny(502,'LEGACY_RESPONSE_INVALID');
      if (data.success && action==='registerTvDevice' && /^btv1_[a-f0-9]{64}$/.test(data.data?.deviceToken||''))
        res.setHeader('Set-Cookie',durableCookie(TV_COOKIE,data.data.deviceToken,31536000));
      if (data.success && DEVICE_ACTIONS.has(action) && /^btv1_[a-f0-9]{64}$/.test(requestBody?.deviceToken||''))
        res.setHeader('Set-Cookie',durableCookie(TV_COOKIE,requestBody.deviceToken,31536000));
      if (data.success && action==='registerFreeSlotsDevice' && /^bfs1_[a-f0-9]{64}$/.test(data.data?.deviceToken||''))
        res.setHeader('Set-Cookie',durableCookie(FREE_SLOTS_COOKIE,data.data.deviceToken,15552000));
      if (data.success && action==='refreshSlots' && /^bfs1_[a-f0-9]{64}$/.test(requestBody?.adminDeviceToken||''))
        res.setHeader('Set-Cookie',durableCookie(FREE_SLOTS_COOKIE,requestBody.adminDeviceToken,15552000));
      // The original API already sanitizes admin errors; never forward an arbitrary upstream exception here.
      if (!data.success) {
        const errors=new Set(['DEVICE_SCOPE_DENIED','DEVICE_UNAUTHORIZED','DEVICE_EXPIRED','DEVICE_SOURCE_SCOPE_MISMATCH','DEVICE_BUSY',
          'CONFIRMATION_REQUIRED','DEVICE_NOT_FOUND','DEVICE_NAME_REQUIRED','DEVICE_LIMIT','AUTHENTICATED_POST_REQUIRED',
          'Доступ запрещён','LEGACY_AUTH_OR_SOURCE_FAILED']);
        data={success:false,error:errors.has(data.error)?data.error:'LEGACY_REQUEST_FAILED'};
        res.statusCode=/DEVICE_(UNAUTHORIZED|SCOPE_DENIED|EXPIRED)/.test(data.error)?401:400;
        if(res.statusCode===401 && DEVICE_ACTIONS.has(action))res.setHeader('Set-Cookie',durableCookie(TV_COOKIE,'',0));
        if(res.statusCode===401 && FREE_SLOTS_DEVICE_ACTIONS.has(action))res.setHeader('Set-Cookie',durableCookie(FREE_SLOTS_COOKIE,'',0));
      }
      res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));
    } catch(error) {
      res.statusCode=error.status||502;res.setHeader('Content-Type','application/json; charset=utf-8');
      res.end(JSON.stringify({success:false,error:error.status?error.message:'LEGACY_SOURCE_UNAVAILABLE'}));
    }
  });
}
if(require.main===module) createGateway().listen(Number(process.env.LEGACY_PORT||3011),'127.0.0.1',()=>console.log('Legacy gateway ready on loopback'));
module.exports={createGateway,UPSTREAM,TV_COOKIE,FREE_SLOTS_COOKIE};
