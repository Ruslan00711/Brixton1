// Daily TV screenshots through the existing BRIXTON Telegram bot.
// Secrets stay in Script Properties; never log request headers, tokens or response bodies.
var TV_SCREENSHOT_ADMIN_CHAT_ = '-1003583832196';
var TV_SCREENSHOT_PERSONNEL_CHAT_ = '-1003542259158';
var TV_SCREENSHOT_TARGETS_ = [
  {key:'mendeleeva', title:'Менделеева', chatId:TV_SCREENSHOT_ADMIN_CHAT_, threadId:2},
  {key:'entuziastov', title:'Энтузиастов', chatId:TV_SCREENSHOT_ADMIN_CHAT_, threadId:4},
  {key:'network', title:'Рейтинг сети BRIXTON', chatId:TV_SCREENSHOT_PERSONNEL_CHAT_, threadId:null}
];

function tvScreenshotHex_(bytes) {
  return bytes.map(function(value) { var normalized = value < 0 ? value + 256 : value; return ('0' + normalized.toString(16)).slice(-2); }).join('');
}

function tvScreenshotRenderBlob_(target) {
  var props = PropertiesService.getScriptProperties();
  var endpoint = props.getProperty('TV_SCREENSHOT_RENDER_URL') || 'https://shtabix.ru/internal/tv-screenshot';
  var secret = props.getProperty('TV_SCREENSHOT_RENDER_SECRET');
  if (!secret || secret.length < 32) throw new Error('TV_SCREENSHOT_RENDER_SECRET_REQUIRED');
  var timestamp = String(Math.floor(Date.now() / 1000));
  var canonical = timestamp + '\n' + target;
  var signature = tvScreenshotHex_(Utilities.computeHmacSha256Signature(canonical, secret, Utilities.Charset.UTF_8));
  var response = UrlFetchApp.fetch(endpoint + '?target=' + encodeURIComponent(target), {
    method:'get',
    headers:{'X-Brixton-Timestamp':timestamp,'X-Brixton-Signature':signature},
    muteHttpExceptions:true
  });
  if (response.getResponseCode() !== 200 || String(response.getHeaders()['Content-Type'] || '').toLowerCase().indexOf('image/png') !== 0) {
    throw new Error('TV_SCREENSHOT_RENDER_HTTP_' + response.getResponseCode());
  }
  return response.getBlob().setName('brixton-tv-' + target + '.png').setContentType('image/png');
}

function tvScreenshotSendPhoto_(item, dateLabel) {
  var payload = {
    chat_id:item.chatId,
    caption:'BRIXTON · ' + item.title + ' · итоги на ' + dateLabel,
    photo:tvScreenshotRenderBlob_(item.key)
  };
  if (item.threadId) payload.message_thread_id = item.threadId;
  var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + getTelegramBotToken_() + '/sendPhoto', {
    method:'post', payload:payload, muteHttpExceptions:true
  });
  var ok = false;
  try { ok = response.getResponseCode() === 200 && JSON.parse(response.getContentText()).ok === true; } catch (_) { ok = false; }
  if (!ok) throw new Error('TV_SCREENSHOT_TELEGRAM_HTTP_' + response.getResponseCode());
}

function sendTvDailyScreenshots() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return false;
  try {
    var tz = Session.getScriptTimeZone();
    var now = new Date();
    var dateKey = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
    var dateLabel = Utilities.formatDate(now, tz, 'dd.MM.yyyy HH:mm');
    var props = PropertiesService.getScriptProperties();
    TV_SCREENSHOT_TARGETS_.forEach(function(item) {
      var sentKey = 'tv_screenshot_' + item.key + '_' + dateKey;
      if (props.getProperty(sentKey)) return;
      try {
        tvScreenshotSendPhoto_(item, dateLabel);
        props.setProperty(sentKey, new Date().toISOString());
      } catch (error) {
        Logger.log('TV screenshot failed target=' + item.key + ' code=' + String(error && error.message || 'UNKNOWN').substring(0, 100));
      }
    });
    return true;
  } finally {
    lock.releaseLock();
  }
}

function tvScreenshotScheduler() {
  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var minutes = parseInt(Utilities.formatDate(now, tz, 'HH'), 10) * 60 + parseInt(Utilities.formatDate(now, tz, 'mm'), 10);
  if (minutes < 21 * 60 || minutes >= 21 * 60 + 15) return false;
  return sendTvDailyScreenshots();
}

function installTvScreenshotScheduler() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'tvScreenshotScheduler') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('tvScreenshotScheduler').timeBased().everyMinutes(5).create();
  return true;
}
