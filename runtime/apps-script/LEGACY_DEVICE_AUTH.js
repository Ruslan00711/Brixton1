// Isolated BRIXTON TV capability boundary. Never log request bodies or credentials.
var LEGACY_TV_TENANT_ = '6a778c5d-e8be-49b5-a273-130691b3116f';
var LEGACY_TV_BRANCHES_ = ['694866', '1076318'];
var LEGACY_TV_BRANCH_IDS_ = {'694866':'1bb7d94c-2fd4-4867-adc0-3cf62e7ae822','1076318':'1e86f90b-db21-4f8b-a44b-a20bfc5a83f1'};
var LEGACY_TV_PREFIX_ = 'BRIXTON_TV_DEVICE_V1_';
var LEGACY_FREE_SLOTS_PREFIX_ = 'BRIXTON_FREE_SLOTS_DEVICE_V1_';
var LEGACY_AUTH_REVISION_ = 'tv-network-ranking-restored-20261003-v1';
var LEGACY_TV_TTL_MS_ = 365 * 24 * 60 * 60 * 1000;
var LEGACY_FREE_SLOTS_TTL_MS_ = 180 * 24 * 60 * 60 * 1000;

function legacyAuthFailure_(code) {
  return jsonResponse_({success:false, error:code});
}
function legacyTvDigest_(token) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token, Utilities.Charset.UTF_8)
    .map(function(b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
}
function legacyTvScope_(body) {
  if (body.organization_id !== LEGACY_TV_TENANT_ ||
      LEGACY_TV_BRANCHES_.indexOf(String(body.company_id)) === -1) throw new Error('DEVICE_SCOPE_DENIED');
  if (body.branch_id && body.branch_id !== LEGACY_TV_BRANCH_IDS_[String(body.company_id)]) throw new Error('DEVICE_SCOPE_DENIED');
  return String(body.company_id);
}
function legacyTvRecords_() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return Object.keys(props).filter(function(k) { return k.indexOf(LEGACY_TV_PREFIX_) === 0; })
    .map(function(k) { return {key:k, value:JSON.parse(props[k])}; });
}
function legacyTvPublicRecord_(r) {
  return {id:r.id, name:r.name, organization_id:r.organization_id, company_id:r.company_id, branch_id:r.branch_id,
    scopes:r.scopes, created_at:r.created_at, expires_at:r.expires_at || null, revoked_at:r.revoked_at || null};
}
function legacyDeviceExpired_(record, ttl) {
  var expires = record.expires_at ? Date.parse(record.expires_at) : Date.parse(record.created_at) + ttl;
  return !isFinite(expires) || expires <= Date.now();
}
function legacyTvRequireAdmin_(body) {
  // The established legacy secret remains authoritative; OWNER tokens are never accepted.
  requireAdminToken_(body.adminToken);
}
function legacyTvRead_(body) {
  var companyId = legacyTvScope_(body);
  if (typeof body.deviceToken !== 'string' || !/^btv1_[a-f0-9]{64}$/.test(body.deviceToken))
    throw new Error('DEVICE_UNAUTHORIZED');
  var encoded = PropertiesService.getScriptProperties().getProperty(LEGACY_TV_PREFIX_ + legacyTvDigest_(body.deviceToken));
  if (!encoded) throw new Error('DEVICE_UNAUTHORIZED');
  var record = JSON.parse(encoded);
  if (legacyDeviceExpired_(record, LEGACY_TV_TTL_MS_)) throw new Error('DEVICE_EXPIRED');
  if (record.revoked_at || record.organization_id !== LEGACY_TV_TENANT_ || record.company_id !== companyId || record.branch_id !== LEGACY_TV_BRANCH_IDS_[companyId])
    throw new Error('DEVICE_SCOPE_DENIED');
  var boardAction = body.action === 'getTvBoard' || body.action === 'getNetworkTvBoard';
  var scope = boardAction ? 'tv.board.read' : 'tv.schedule.read';
  if (!Array.isArray(record.scopes) || record.scopes.indexOf(scope) === -1) throw new Error('DEVICE_SCOPE_DENIED');
  // No date/history/tenant selector is forwarded to the business reader.
  if (body.date || body.month || body.from || body.to) throw new Error('DEVICE_SCOPE_DENIED');
  if (body.action === 'getNetworkTvBoard') {
    var branches = LEGACY_TV_BRANCHES_.map(function(branchCompanyId) {
      var board = doGetTvBoard(branchCompanyId);
      if (!board || String(board.branchId) !== branchCompanyId) throw new Error('DEVICE_SOURCE_SCOPE_MISMATCH');
      return board;
    });
    return jsonResponse_({success:true, data:{branches:branches}});
  }
  var data = body.action === 'getTvBoard' ? doGetTvBoard(companyId) : doGetTablo(companyId, '');
  if (body.action === 'getTvBoard' && (!data || String(data.branchId) !== companyId)) throw new Error('DEVICE_SOURCE_SCOPE_MISMATCH');
  return jsonResponse_({success:true, data:data});
}
function legacyTvManage_(body) {
  legacyTvRequireAdmin_(body);
  var companyId = legacyTvScope_(body);
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('DEVICE_BUSY');
  try {
    var records = legacyTvRecords_();
    if (body.action === 'listTvDevices') return jsonResponse_({success:true,data:{devices:records
      .filter(function(r) { return r.value.organization_id === LEGACY_TV_TENANT_ && r.value.company_id === companyId; })
      .map(function(r) { return legacyTvPublicRecord_(r.value); })}});
    if (body.confirm !== true) throw new Error('CONFIRMATION_REQUIRED');
    if (body.action === 'revokeTvDevice') {
      var existing = records.filter(function(r) { return r.value.id === body.device_id &&
        r.value.organization_id === LEGACY_TV_TENANT_ && r.value.company_id === companyId; })[0];
      if (!existing) throw new Error('DEVICE_NOT_FOUND');
      existing.value.revoked_at = existing.value.revoked_at || new Date().toISOString();
      PropertiesService.getScriptProperties().setProperty(existing.key, JSON.stringify(existing.value));
      return jsonResponse_({success:true,data:legacyTvPublicRecord_(existing.value)});
    }
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 80) throw new Error('DEVICE_NAME_REQUIRED');
    if (records.filter(function(r) { return !r.value.revoked_at; }).length >= 100) throw new Error('DEVICE_LIMIT');
    var token = 'btv1_' + (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').toLowerCase();
    var record = {id:Utilities.getUuid(), name:body.name.trim(), organization_id:LEGACY_TV_TENANT_, company_id:companyId, branch_id:LEGACY_TV_BRANCH_IDS_[companyId],
      scopes:['tv.board.read','tv.schedule.read'], created_at:new Date().toISOString(), expires_at:new Date(Date.now()+LEGACY_TV_TTL_MS_).toISOString(), revoked_at:null};
    PropertiesService.getScriptProperties().setProperty(LEGACY_TV_PREFIX_ + legacyTvDigest_(token), JSON.stringify(record));
    return jsonResponse_({success:true,data:{device:legacyTvPublicRecord_(record), deviceToken:token}});
  } finally { lock.releaseLock(); }
}
function legacyFreeSlotsRecords_() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return Object.keys(props).filter(function(k) { return k.indexOf(LEGACY_FREE_SLOTS_PREFIX_) === 0; })
    .map(function(k) { return {key:k, value:JSON.parse(props[k])}; });
}
function legacyFreeSlotsPublicRecord_(r) {
  return {id:r.id,name:r.name,organization_id:r.organization_id,scopes:r.scopes,created_at:r.created_at,
    expires_at:r.expires_at,revoked_at:r.revoked_at || null};
}
function legacyFreeSlotsRequireDevice_(body) {
  if (body.organization_id !== LEGACY_TV_TENANT_ || typeof body.adminDeviceToken !== 'string' ||
      !/^bfs1_[a-f0-9]{64}$/.test(body.adminDeviceToken)) throw new Error('DEVICE_UNAUTHORIZED');
  var encoded=PropertiesService.getScriptProperties().getProperty(LEGACY_FREE_SLOTS_PREFIX_+legacyTvDigest_(body.adminDeviceToken));
  if (!encoded) throw new Error('DEVICE_UNAUTHORIZED');
  var record=JSON.parse(encoded);
  if (legacyDeviceExpired_(record, LEGACY_FREE_SLOTS_TTL_MS_)) throw new Error('DEVICE_EXPIRED');
  if (record.revoked_at || record.organization_id !== LEGACY_TV_TENANT_ || !Array.isArray(record.scopes) ||
      record.scopes.indexOf('free_slots.refresh') === -1) throw new Error('DEVICE_SCOPE_DENIED');
  return record;
}
function legacyFreeSlotsManage_(body) {
  legacyTvRequireAdmin_(body);
  if (body.organization_id !== LEGACY_TV_TENANT_) throw new Error('DEVICE_SCOPE_DENIED');
  var lock=LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error('DEVICE_BUSY');
  try {
    var records=legacyFreeSlotsRecords_();
    if (body.action === 'listFreeSlotsDevices') return jsonResponse_({success:true,data:{devices:records.map(function(r){return legacyFreeSlotsPublicRecord_(r.value);})}});
    if (body.confirm !== true) throw new Error('CONFIRMATION_REQUIRED');
    if (body.action === 'revokeFreeSlotsDevice') {
      var existing=records.filter(function(r){return r.value.id===body.device_id && r.value.organization_id===LEGACY_TV_TENANT_;})[0];
      if (!existing) throw new Error('DEVICE_NOT_FOUND');
      existing.value.revoked_at=existing.value.revoked_at || new Date().toISOString();
      PropertiesService.getScriptProperties().setProperty(existing.key,JSON.stringify(existing.value));
      return jsonResponse_({success:true,data:legacyFreeSlotsPublicRecord_(existing.value)});
    }
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 80) throw new Error('DEVICE_NAME_REQUIRED');
    if (records.filter(function(r){return !r.value.revoked_at && !legacyDeviceExpired_(r.value,LEGACY_FREE_SLOTS_TTL_MS_);}).length >= 30) throw new Error('DEVICE_LIMIT');
    var token='bfs1_'+(Utilities.getUuid()+Utilities.getUuid()).replace(/-/g,'').toLowerCase();
    var record={id:Utilities.getUuid(),name:body.name.trim(),organization_id:LEGACY_TV_TENANT_,scopes:['free_slots.refresh'],
      created_at:new Date().toISOString(),expires_at:new Date(Date.now()+LEGACY_FREE_SLOTS_TTL_MS_).toISOString(),revoked_at:null};
    PropertiesService.getScriptProperties().setProperty(LEGACY_FREE_SLOTS_PREFIX_+legacyTvDigest_(token),JSON.stringify(record));
    return jsonResponse_({success:true,data:{device:legacyFreeSlotsPublicRecord_(record),deviceToken:token}});
  } finally { lock.releaseLock(); }
}
function legacyAuthGetGate_(e) {
  var p = (e && e.parameter) || {};
  // Tokens in URLs are never consumed. Gate runs before old request logging/readers.
  if (p.deviceToken || p.adminDeviceToken || p.adminToken || p.token) return legacyAuthFailure_('CREDENTIAL_IN_URL_FORBIDDEN');
  if (['getTvBoard','getNetworkTvBoard','getTodaySchedule','refreshSlots','registerTvDevice','listTvDevices','revokeTvDevice',
      'registerFreeSlotsDevice','listFreeSlotsDevices','revokeFreeSlotsDevice'].indexOf(p.action) !== -1)
    return legacyAuthFailure_('AUTHENTICATED_POST_REQUIRED');
  if (p.action === 'legacyAuthStatus') return jsonResponse_({success:true,data:{revision:LEGACY_AUTH_REVISION_,device_auth:true,public_tv:false,public_refresh:false}});
  return null;
}
function legacyAuthPostGate_(e) {
  var text = e && e.postData && e.postData.contents;
  if (typeof text !== 'string') return null;
  var body;
  try { body = JSON.parse(text); } catch (_) { return legacyAuthFailure_('INVALID_JSON'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return legacyAuthFailure_('INVALID_REQUEST');
  var actions = ['getTvBoard','getNetworkTvBoard','getTodaySchedule','registerTvDevice','listTvDevices','revokeTvDevice','refreshSlots',
    'registerFreeSlotsDevice','listFreeSlotsDevices','revokeFreeSlotsDevice'];
  var selected = actions.indexOf(body.action) !== -1;
  // A device credential is not an admin credential, even when supplied with extra fields.
  if (body.deviceToken && ['getTvBoard','getNetworkTvBoard','getTodaySchedule'].indexOf(body.action) === -1)
    return legacyAuthFailure_('DEVICE_SCOPE_DENIED');
  if (body.adminDeviceToken && body.action !== 'refreshSlots') return legacyAuthFailure_('DEVICE_SCOPE_DENIED');
  if (!selected) return null;
  if (text.length > 4096) return legacyAuthFailure_('REQUEST_TOO_LARGE');
  try {
    if (['getTvBoard','getNetworkTvBoard','getTodaySchedule'].indexOf(body.action) !== -1) return legacyTvRead_(body);
    if (['registerFreeSlotsDevice','listFreeSlotsDevices','revokeFreeSlotsDevice'].indexOf(body.action) !== -1)
      return legacyFreeSlotsManage_(body);
    if (body.action !== 'refreshSlots') return legacyTvManage_(body);
    if (body.adminDeviceToken) legacyFreeSlotsRequireDevice_(body);
    else if (body.adminToken) legacyTvRequireAdmin_(body);
    else throw new Error('DEVICE_UNAUTHORIZED');
    if (body.confirm !== true) throw new Error('CONFIRMATION_REQUIRED');
    buildFreeSlots();
    return jsonResponse_({success:true});
  } catch (err) {
    // Exception messages from upstreams may contain credentials or PII; only fixed codes leave this boundary.
    var known = ['DEVICE_SCOPE_DENIED','DEVICE_UNAUTHORIZED','DEVICE_EXPIRED','DEVICE_SOURCE_SCOPE_MISMATCH','DEVICE_BUSY',
      'CONFIRMATION_REQUIRED','DEVICE_NOT_FOUND','DEVICE_NAME_REQUIRED','DEVICE_LIMIT'];
    return legacyAuthFailure_(known.indexOf(err.message) !== -1 ? err.message : 'LEGACY_AUTH_OR_SOURCE_FAILED');
  }
}
