// ════════════════════════════════════════════════════════
// BRIXTON — выгрузка данных из Yclients + запись в Supabase, версия 11
// Даты вводятся в ячейки U1 (начало) и U2 (конец)
// ════════════════════════════════════════════════════════

const SERVICE_PERIODS = {
  'Стрижка мужская + Стрижка бороды+Воск': 33,
  'Стрижка мужская + Моделирование бороды+Воск': 33,
  'Стрижка Счастливые часы': 33,
  "Уход за лицом от Morgan’s": -1,
  'Спа процедура (Комплекс)': -1,
  'Стрижка ножницами': 33,
  'Стрижка машинкой (2 насадки)': 33,
  'Стрижка бороды (до 6мм)': 14,
  'Лист ожидания': -1,
  'Королевское бритье (лицо)': -1,
  'Королевское бритье (голова)': -1,
  'Бритье традиционное (лицо)': 14,
  'Бритье традиционное (голова)': 14,
  'Стрижка мужская + Стрижка бороды': 33,
  'Стрижка мужская + Камуфляж седины (голова)': 33,
  'Папа+Сын (от 3 до 9 лет)': 14,
  'Моделирование бороды + Камуфляж': 14,
  'Друг+Друг': 33,
  'Оформление бровей': -1,
  'Окантовка': -1,
  'Мытье и укладка': -1,
  'Коррекция воском (одна зона)': -1,
  'Камуфляж седины (голова)': 30,
  'Камуфляж седины (борода)': 30,
  'Биохимическая завивка волос 3 категории': 33,
  'Биохимическая завивка волос 2 категории': -1,
  'Биохимическая завивка волос 1 категории': -1,
  'Hair tattoo (рисунок на голове)': -1,
  'Скрабирование (Распаривание, мягкое очищение кожи)': -1,
  'Патчи': -1,
  'Будильник (NEW)': -1,
  'Black Mask (Черная маска)': -1,
  'Мужская стрижка+традиционное бритье(ТОП-Барбер)': 30,
  'ТОП мужская стрижка+традиционное бритье (Младший барбер)': 33,
  'Мужская стрижка+традиционное бритье (Акция-знаком)': 30,
  'Моделирование бороды': 14,
  'Стрижка мужская + Моделирование бороды': 33,
  'Стрижка детская (от 3 до 9 лет)': 33,
  'Стрижка мужская': 33,
  'Мужская стрижка+традиционное бритье': 33,
  'Услуга': 33
};

const DOP_SERVICES = new Set([
  'Оформление бровей',
  'Коррекция воском (одна зона)',
  'Скрабирование (Распаривание, мягкое очищение кожи)',
  'Патчи',
  'Будильник (NEW)',
  'Black Mask (Черная маска)',
  "Уход за лицом от Morgan’s",
  'Спа процедура (Комплекс)'
]);

const SERVICE_CATEGORY_MAP = {
  'Стрижка Счастливые часы': 'АКЦИИ',

  'Моделирование бороды': 'Борода',
  'Стрижка бороды (до 6мм)': 'Борода',
  'Бритье традиционное (лицо)': 'Борода',
  'Королевское бритье (лицо)': 'Борода',

  'Коррекция воском (одна зона)': 'Воск',

  'Биохимическая завивка волос 1 категории': 'Завивка',
  'Биохимическая завивка волос 1 категории. Топ зона (длина 6-15см)': 'Завивка',
  'Биохимическая завивка волос 2 категории': 'Завивка',
  'Биохимическая завивка волос 2 категории. Полная (длина 6-10см)': 'Завивка',
  'Биохимическая завивка волос 3 категории': 'Завивка',
  'Биохимическая завивка волос 3 категории. Полная (длина 10-20см)': 'Завивка',

  'Камуфляж седины (борода)': 'Камуфляж',
  'Камуфляж седины (голова)': 'Камуфляж',

  'Стрижка мужская + Моделирование бороды': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Стрижка мужская + Стрижка бороды': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Стрижка мужская + Стрижка бороды+Воск': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Стрижка мужская + Моделирование бороды+Воск': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Стрижка мужская + Камуфляж седины (голова)': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Друг+Друг': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Папа+Сын (от 3 до 9 лет)': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Моделирование бороды + Камуфляж': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Мужская стрижка+традиционное бритье(ТОП-Барбер)': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'ТОП мужская стрижка+традиционное бритье (Младший барбер)': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Мужская стрижка+традиционное бритье (Акция-знаком)': 'КОМПЛЕКСНЫЕ УСЛУГИ',
  'Мужская стрижка+традиционное бритье': 'КОМПЛЕКСНЫЕ УСЛУГИ',

  'Мытье и укладка': 'Мытье',

  'Стрижка мужская': 'Стрижка',
  'Стрижка детская (от 3 до 9 лет)': 'Стрижка',
  'Стрижка машинкой (2 насадки)': 'Стрижка',
  'Стрижка ножницами': 'Стрижка',
  'Окантовка': 'Стрижка',
  'Бритье традиционное (голова)': 'Стрижка',
  'Королевское бритье (голова)': 'Стрижка',
  'Hair tattoo (рисунок на голове)': 'Стрижка',

  'Оформление бровей': 'Уход',
  'Скрабирование (Распаривание, мягкое очищение кожи)': 'Уход',
  'Скрабирование (Распаривание, мягкое очищение кожи лица)': 'Уход',
  'Патчи': 'Уход',
  'Будильник (NEW)': 'Уход',
  'Black Mask (Черная маска)': 'Уход',
  "Уход за лицом от Morgan’s": 'Уход',
  'Спа процедура (Комплекс)': 'Уход'
};

const DOUBLE_PERSON_SERVICES = new Set([
  'Друг+Друг',
  'Папа+Сын (от 3 до 9 лет)'
]);
const WAITLIST_STAFF_IDS = {
  694866: 3552371,
  1076318: 3525900
};

const SERVICE_CATEGORIES_ORDER = ['Стрижка','Борода','КОМПЛЕКСНЫЕ УСЛУГИ','АКЦИИ','Уход','Воск','Камуфляж','Завивка','Мытье'];

const SUPABASE_URL = 'https://ojzjwnxerbxnogahpfuz.supabase.co';
function getSupabaseServiceRole_() {
  var key = PropertiesService
    .getScriptProperties()
    .getProperty('SUPABASE_SERVICE_ROLE');

  if (!key) {
    throw new Error('Не задан SUPABASE_SERVICE_ROLE');
  }

  return key;
}

Object.defineProperty(globalThis, 'SUPABASE_KEY', {
  configurable: true,
  get: getSupabaseServiceRole_
});

function getYclientsPartnerToken_() {
  var token = PropertiesService
    .getScriptProperties()
    .getProperty('YCLIENTS_PARTNER_TOKEN');

  if (!token) {
    throw new Error('Не задан YCLIENTS_PARTNER_TOKEN');
  }

  return token;
}

function getYclientsUserToken_() {
  var token = PropertiesService
    .getScriptProperties()
    .getProperty('YCLIENTS_USER_TOKEN');

  if (!token) {
    throw new Error('Не задан YCLIENTS_USER_TOKEN');
  }

  return token;
}

function getTelegramBotToken_() {
  var token = PropertiesService
    .getScriptProperties()
    .getProperty('TELEGRAM_BOT_TOKEN');

  if (!token) {
    throw new Error('Не задан TELEGRAM_BOT_TOKEN');
  }

  return token;
}

const MASTER_INFO = {
  'Виталий':    {id:1,  cur:'МАСТЕР',  loc:'Менделеева', base:2500, role:'Мастер-барбер', since:'2022-05-01', rookie:false},
  'Валентина':  {id:2,  cur:'МАСТЕР',  loc:'Энтузиастов', base:2500, role:'Мастер-барбер', since:'2022-12-01', rookie:false},
  'Наиль':      {id:3,  cur:'ТОП',     loc:'Менделеева', base:2300, role:'ТОП-барбер',    since:'2025-07-28', rookie:false},
  'Дмитрий М.': {id:4,  cur:'ТОП',     loc:'Энтузиастов', base:2300, role:'ТОП-барбер',    since:'2023-12-01', rookie:false},
  'Арсений':    {id:5,  cur:'БАРБЕР',  loc:'Менделеева', base:2100, role:'Барбер',         since:'2024-12-05', rookie:false},
  'Никита':     {id:6,  cur:'БАРБЕР',  loc:'Энтузиастов', base:2100, role:'Барбер',         since:'2024-08-14', rookie:false},
  'Тагир':      {id:7,  cur:'ТОП',     loc:'Энтузиастов', base:2300, role:'ТОП-барбер',    since:'2025-08-01', rookie:false},
  'Айгиза':     {id:8,  cur:'БАРБЕР',  loc:'Энтузиастов', base:1900, role:'Барбер',         since:'2025-03-23', rookie:false},
  'Яна':        {id:9,  cur:'БАРБЕР',  loc:'Энтузиастов', base:1900, role:'Барбер',         since:'2026-03-31', rookie:false},
  'Сергей':     {id:10, cur:'БАРБЕР',  loc:'Менделеева', base:1900, role:'Барбер',         since:'2026-03-30', rookie:false},
  'Марина':     {id:11, cur:'МЛАДШИЙ', loc:'Менделеева', base:1000, role:'Младший барбер', since:'2026-06-01', rookie:true},
'Дмитрий':   {id:12, cur:'ТОП',     loc:'Менделеева', base:2300, role:'ТОП-барбер',    since:'2023-06-01', rookie:false, fired_after:'2025-12'},
'Ренат':     {id:13, cur:'МЛАДШИЙ', loc:'Менделеева', base:1000, role:'Младший барбер', since:'2025-06-01', rookie:false, fired_after:'2026-04'},
'Лист ожидания Менделеева': {id:14, cur:'', loc:'Менделеева', base:0, role:'Лист ожидания', since:'2022-01-01', rookie:false},
'Лист ожидания Энтузиастов': {id:15, cur:'', loc:'Энтузиастов', base:0, role:'Лист ожидания', since:'2022-01-01', rookie:false}
};
const MASTER_YCLIENTS = {
  'Виталий':    {yclients_id: 2026841,  company_id: 694866},
  'Валентина':  {yclients_id: 3309560,  company_id: 1076318},
  'Наиль':      {yclients_id: 4186140,  company_id: 694866},
  'Дмитрий М.': {yclients_id: 3309561,  company_id: 1076318},
  'Арсений':    {yclients_id: 3543745,  company_id: 694866},
  'Никита':     {yclients_id: 3417387,  company_id: 1076318},
  'Тагир':      {yclients_id: 4113222,  company_id: 1076318},
  'Айгиза':     {yclients_id: 3780578,  company_id: 1076318},
  'Яна':        {yclients_id: 3542180,  company_id: 1076318},
  'Сергей':     {yclients_id: 5143587,  company_id: 694866},
  'Марина':     {yclients_id: 5316255,  company_id: 694866},
};

const MONTH_KEYS_EN = ['january','february','march','april','may','june','july','august','september','october','november','december'];
const MONTH_NAMES_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

function fmt(d){
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function parseRecordDate(dateStr){
  const parts = dateStr.slice(0,10).split('-').map(Number);
  return new Date(parts[0], parts[1]-1, parts[2]);
}

function getDateFromCell(value){
  if(Object.prototype.toString.call(value) === '[object Date]'){
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const str = String(value).trim();
  let parts;
  if(str.includes('.')) {
    parts = str.split('.').reverse().map(Number);
  } else {
    parts = str.split('-').map(Number);
  }
  return new Date(parts[0], parts[1]-1, parts[2]);
}

function addDays(date, days){
  const d = new Date(date);
  d.setDate(d.getDate()+days);
  return d;
}

function fetchChunk(companyId, staffId, start, end, headers){
  let all = [];
  let page = 1;
  while(true){
    const url = 'https://api.yclients.com/api/v1/records/' + companyId
      + '?staff_id=' + staffId + '&start_date=' + fmt(start) + '&end_date=' + fmt(end) + '&count=200&page=' + page;
    let r, ok=false, attempt=0;
    while(!ok && attempt<4){
      try {
        r = UrlFetchApp.fetch(url, {method:'get', headers: headers, muteHttpExceptions:true});
        if(r.getResponseCode()===200){ ok=true; } else { attempt++; Utilities.sleep(1500); }
      } catch(err){ attempt++; Utilities.sleep(1500); }
    }
    if(!ok) break;
    const data = JSON.parse(r.getContentText());
    const records = data.data || [];
    all = all.concat(records);
    if(records.length < 200) break;
    page++;
    Utilities.sleep(120);
  }
  return all;
}

function fetchAllRecords(companyId, staffId, start, end, headers){
  // Если период больше 200 дней — грузим частями по 180 дней
  const totalDays = (end - start) / (1000*60*60*24);
  if(totalDays <= 200){
    return fetchChunk(companyId, staffId, start, end, headers);
  }
  let all = [];
  let chunkStart = new Date(start);
  while(chunkStart < end){
    let chunkEnd = addDays(chunkStart, 180);
    if(chunkEnd > end) chunkEnd = new Date(end);
    const part = fetchChunk(companyId, staffId, chunkStart, chunkEnd, headers);
    all = all.concat(part);
    chunkStart = addDays(chunkEnd, 1);
    Utilities.sleep(120);
  }
  return all;
}

function computeMetrics(currentStart, currentEnd){
  const partnerToken = getYclientsPartnerToken_();
  const userToken = getYclientsUserToken_();
  const headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };
  const companies = [
    {id: 694866, name: 'Менделеева'},
    {id: 1076318, name: 'Энтузиастов'}
  ];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lookbackEnd = addDays(currentStart, -1);
  const lookbackStart = new Date(2022, 4, 1); // май 2022 — начало работы барбершопа
  const fetchEnd = addDays(today, 45);
  const mastersData = [];
  const globalPreClients = new Set();
  const waitlistRecords = {};
  companies.forEach(c=>{
    const wlId = WAITLIST_STAFF_IDS[c.id];
    if(wlId){
      const wlRecs = fetchAllRecords(c.id, wlId, currentStart, fetchEnd, headers);
      waitlistRecords[c.id] = wlRecs.filter(r=>r.client&&r.client.id);
      Utilities.sleep(200);
    }
    const staffResp = UrlFetchApp.fetch('https://api.yclients.com/api/v1/company/' + c.id + '/staff/?fired=1', {
      method:'get', headers: headers, muteHttpExceptions:true
    });
    const staffData = JSON.parse(staffResp.getContentText());
    const masters = staffData.data.filter(s=>{
      const spec = (s.specialization||'').toLowerCase();
      return !spec.includes('менеджер') && !spec.includes('админ');
    });
    masters.forEach(m=>{
      const recordsPast = fetchAllRecords(c.id, m.id, lookbackStart, lookbackEnd, headers);
      if(m.id===2026841) Logger.log('Виталий recordsPast: '+recordsPast.length+' записей, период '+fmt(lookbackStart)+' — '+fmt(lookbackEnd));
      Utilities.sleep(150);
      const recordsCurr = fetchAllRecords(c.id, m.id, currentStart, fetchEnd, headers);
      Utilities.sleep(150);
      const attendedPast = recordsPast.filter(r=>r.attendance===1 && r.client && r.client.id);
      const attendedCurr = recordsCurr.filter(r=>r.attendance===1 && r.client && r.client.id);
      mastersData.push({company:c, master:m, recordsCurr, attendedPast, attendedCurr});
      attendedPast.forEach(r=> globalPreClients.add(r.client.id));
    });
  });
  const rows = [];
  const barbers = [];

  mastersData.forEach(md=>{
    const {company:c, master:m, recordsCurr, attendedPast, attendedCurr} = md;
    const periodVisits = attendedCurr.filter(r=>{
      const d = parseRecordDate(r.date);
      return d>=currentStart && d<=currentEnd;
    });
    const masterPreClients = new Set();
    attendedPast.forEach(r=> masterPreClients.add(r.client.id));
    let revServices=0, revServicesList=0, revGoods=0, dopRev=0, absNew=0, newForMaster=0, regular=0, extraPeople=0;
    const goodsMap={};
    const clientsSet = new Set();
    const categories = {};
    periodVisits.forEach(rec=>{
      (rec.services||[]).forEach(s=>{
        revServices += (s.cost||0);
        revServicesList += (s.first_cost||0);
        if(DOP_SERVICES.has(s.title)) dopRev += (s.cost||0);
        if(DOUBLE_PERSON_SERVICES.has(s.title)) extraPeople++;
        const catName = SERVICE_CATEGORY_MAP[s.title];
        if(catName){
          if(!categories[catName]) categories[catName] = {sum:0, count:0};
          categories[catName].sum += (s.cost||0);
          categories[catName].count += 1;
        }
      });
      (rec.goods_transactions||[]).forEach(g=>{
        revGoods += (g.cost||0);
        const gTitle = g.title||g.good_title||'Без названия';
        if(!goodsMap[gTitle]) goodsMap[gTitle]={qty:0,sum:0};
        goodsMap[gTitle].qty += (g.amount||1);
        goodsMap[gTitle].sum += (g.cost||0);
      });
      if(!clientsSet.has(rec.client.id)){
        clientsSet.add(rec.client.id);
        const cid = rec.client.id;
        const isNewForMaster = !masterPreClients.has(cid);
        const isAbsNew = !globalPreClients.has(cid);
        if(isAbsNew) absNew++;
        if(isNewForMaster) newForMaster++; else regular++;
      }
    });
    const recordCount = periodVisits.length;
    const visits = recordCount + extraPeople;
    const totalClients = clientsSet.size + extraPeople;
    const totalRev = revServices+revGoods;
    const chek = visits>0 ? Math.round(totalRev/visits) : 0;
    const chekForScore = recordCount>0 ? Math.round(totalRev/recordCount) : 0;
    const chekServicesList = visits>0 ? Math.round(revServicesList/visits) : 0;
    const chekServicesPaid = visits>0 ? Math.round(revServices/visits) : 0;
    const retPct = clientsSet.size>0 ? Math.round(regular/clientsSet.size*1000)/10 : 0;
    // Возвратность: окно 240 дней до начала текущего месяца
    const vzvWindowStart = addDays(currentStart, -240);
    const pastClients = new Set();
    attendedPast.forEach(r=>{
      const d = parseRecordDate(r.date);
      if(d >= vzvWindowStart && d < currentStart) pastClients.add(r.client.id);
    });
    const currClients = new Set();
    periodVisits.forEach(r=> currClients.add(r.client.id));
    let returnedCount=0;
    pastClients.forEach(id=>{ if(currClients.has(id)) returnedCount++; });
    const vzvPct = pastClients.size>0 ? Math.round(returnedCount/pastClients.size*1000)/10 : 0;
    const wlRecs = (waitlistRecords[c.id]||[]);
    let opzCount=0, opzCame=0, opzMissed=0, opzPending=0;
    periodVisits.forEach(visit=>{
      const visitDay = visit.date.slice(0,10);
      const clientId = visit.client.id;
      const futureToMaster = recordsCurr.filter(r2=>
        r2.client && r2.client.id===clientId &&
        r2.create_date && r2.create_date.slice(0,10)===visitDay &&
        r2.date.slice(0,10) > visitDay
      );
      const futureToWaitlist = wlRecs.filter(r2=>
        r2.client && r2.client.id===clientId &&
        r2.create_date && r2.create_date.slice(0,10)===visitDay
      );
      const allFuture = [...futureToMaster, ...futureToWaitlist];
      if(allFuture.length>0){
        opzCount++;
        if(futureToMaster.length>0){
          const fr = futureToMaster.sort((a,b2)=>a.date.localeCompare(b2.date))[0];
          const frDate = parseRecordDate(fr.date);
          const windowEnd = addDays(frDate, 10);
          const cameInWindow = attendedCurr.some(r2=>
            r2.client && r2.client.id===clientId &&
            parseRecordDate(r2.date) >= frDate &&
            parseRecordDate(r2.date) <= windowEnd
          );
          if(cameInWindow){ opzCame++; }
          else if(windowEnd < today){ opzMissed++; }
          else { opzPending++; }
        } else {
          const wlRec = futureToWaitlist[0];
          const wlDate = wlRec.create_date ? parseRecordDate(wlRec.create_date) : currentStart;
          const windowEnd = addDays(wlDate, 10);
          const cameInWindow = attendedCurr.some(r2=>
            r2.client && r2.client.id===clientId &&
            parseRecordDate(r2.date) > wlDate &&
            parseRecordDate(r2.date) <= windowEnd
          );
          if(cameInWindow){ opzCame++; }
          else if(windowEnd < today){ opzMissed++; }
          else { opzPending++; }
        }
      }
    });
    const opzPct = recordCount>0 ? Math.round(opzCount/recordCount*1000)/10 : 0;
    let filledSeconds=0;
    periodVisits.forEach(r=>{ filledSeconds += (r.seance_length||0); });
    const filledHours = filledSeconds/3600;
    const schedUrl = 'https://api.yclients.com/api/v1/schedule/' + c.id + '/' + m.id + '/' + fmt(currentStart) + '/' + fmt(currentEnd);
    const schedResp = UrlFetchApp.fetch(schedUrl, {method:'get', headers: headers, muteHttpExceptions:true});
    const schedData = JSON.parse(schedResp.getContentText());
    let scheduledHours=0, workDays=0;
    (schedData.data||[]).forEach(day=>{
      if(day.is_working===1){
        workDays++;
        (day.slots||[]).forEach(s=>{
          const [fh,fm]=s.from.split(':').map(Number);
          const [th,tm]=s.to.split(':').map(Number);
          scheduledHours += (th*60+tm-(fh*60+fm))/60;
        });
      }
    });
    const fillPct = scheduledHours>0 ? Math.round(filledHours/scheduledHours*1000)/10 : 0;
    let lost=0;
    periodVisits.forEach(visit=>{
      const period = Math.max(-1, ...(visit.services||[]).map(s=>SERVICE_PERIODS[s.title]!==undefined?SERVICE_PERIODS[s.title]:-1));
      if(period<0) return;
      const visitDate = parseRecordDate(visit.date);
      const deadline = addDays(visitDate, period);
      if(deadline>=today) return;
      const clientId=visit.client.id;
      const returned = attendedCurr.some(r2=>{
        const d2=parseRecordDate(r2.date);
        return r2.client.id===clientId && d2>visitDate && d2<=today;
      });
      if(!returned) lost++;
    });
    const churnPct = recordCount>0 ? Math.round(lost/recordCount*1000)/10 : 0;
    rows.push([c.name, m.name, revServices, revServicesList, dopRev, revGoods, chekServicesList, chekServicesPaid, chek, visits, totalClients, absNew, newForMaster, retPct, vzvPct, opzPct, fillPct, churnPct, lost]);
    let masterKey = (m.name==='Лист ожидания') ? 'Лист ожидания ' + c.name : m.name;
    const info = MASTER_INFO[masterKey];

    // Спец-логика для Валентины (сменила филиал 14.08.2024)
    if(masterKey.indexOf('Валентина') !== -1){
      const switchDate = new Date(2024, 7, 1);
      const midNum = Number(m.id);
      if(midNum === 2289096 && currentStart >= switchDate) return;
      if(midNum === 3309560 && currentStart < switchDate) return;
    }

    if(info){
      if(info.fired_after){
        const [fy,fm]=info.fired_after.split('-').map(Number);
        if(currentStart >= new Date(fy,fm,1)) return;
      }
      barbers.push({
        id: info.id, cur: info.cur, loc: info.loc, opz: opzPct, ret: retPct,
        rev: revServices, rev_list: revServicesList, vzv: vzvPct, base: info.base,
        chek: chek, chek_for_score: chekForScore, chek_list: chekServicesList,
        chek_paid: chekServicesPaid, fill: fillPct, work_days: workDays,
        sched_hours: Math.round(scheduledHours*10)/10, fact_hours: Math.round(filledHours*10)/10,
        visits: visits, clients: totalClients, abs_new: absNew,
        active_clients: (()=>{
  const cutoff60=addDays(currentEnd,-60);
  const allV=[...attendedPast,...attendedCurr.filter(r=>{const d=parseRecordDate(r.date);return d<=currentEnd;})];
  const byC={};
  allV.forEach(r=>{
    const cid=r.client.id;
    if(!byC[cid])byC[cid]={n:0,last:null,first:null,name:r.client.name||'',surname:r.client.surname||'',phone:r.client.phone||'',id:cid,rev:0};
    byC[cid].n++;
    const d=parseRecordDate(r.date);
    if(!byC[cid].last||d>byC[cid].last)byC[cid].last=d;
    if(!byC[cid].first||d<byC[cid].first)byC[cid].first=d;
    (r.services||[]).forEach(s=>{ byC[cid].rev += (s.cost||0); });
  });
  const active=Object.values(byC).filter(c=>c.last>=cutoff60);
  const makeList=n=>active.filter(c=>c.n>=n).map(c=>({id:c.id,name:(c.name+' '+c.surname).trim(),phone:c.phone,visits:c.n,last:c.last?fmt(c.last):'',first:c.first?fmt(c.first):'',rev:Math.round(c.rev||0)}));
  return {
    b3: active.filter(c=>c.n>=3).length,
    b5: active.filter(c=>c.n>=5).length,
    b7: active.filter(c=>c.n>=7).length,
    b10:active.filter(c=>c.n>=10).length,
    b15:active.filter(c=>c.n>=15).length,
    b20:active.filter(c=>c.n>=20).length,
    b30:active.filter(c=>c.n>=30).length,
    b40:active.filter(c=>c.n>=40).length,
    b50:active.filter(c=>c.n>=50).length,
    b10_list:makeList(10),
    b15_list:makeList(15),
    b20_list:makeList(20),
    b30_list:makeList(30),
    b40_list:makeList(40),
    b50_list:makeList(50),
  };
})(),
        name: masterKey,
        role: info.role, since: info.since, rookie: info.rookie, 'otток': churnPct,
        opz_count: opzCount, opz_came: opzCame, opz_missed: opzMissed, opz_pending: opzPending,
        goods_rev: revGoods,
        goods_list: Object.entries(goodsMap).map(([title,d])=>({title,qty:d.qty,sum:d.sum})),
        new_clients: newForMaster, dop_services: dopRev, left_clients: lost, categories: categories
      });
    }
    Utilities.sleep(300);
  });
  
  barbers.sort((a,b)=>a.id-b.id);
  const sources = computeSources(mastersData, globalPreClients, currentStart, currentEnd);
  return {rows, barbers, sources};
}

// ── ЗАПИСЬ В ЛИСТ ───────────────────────────────────────
function getFullReport(){
  const sheet = SpreadsheetApp.getActiveSheet();
  const currentStart = getDateFromCell(sheet.getRange('U1').getValue());
  const currentEnd = getDateFromCell(sheet.getRange('U2').getValue());

  const {rows} = computeMetrics(currentStart, currentEnd);

  const result = [
    ['Период отчёта:', fmt(currentStart) + ' — ' + fmt(currentEnd)],
    [],
    ['Филиал','Мастер','Выручка услуг','Выручка по прайсу','Доп.услуги','Выручка товаров','Ср.чек(прайс)','Ср.чек(оплата)','Ср.чек общий','Визитов','Клиентов','Абс.новые','Новых у мастера','Постоянных%','Возвратность%','ОПЗ%','Загрузка%','Отток%','Ушли']
  ];
  rows.forEach(r=>result.push(r));

  const numCols = result[2].length;
  const paddedResult = result.map(row=>{
    const padded = row.slice();
    while(padded.length < numCols) padded.push('');
    return padded;
  });

  const maxRows = sheet.getMaxRows();
  const maxCols = sheet.getMaxColumns();
  if(maxRows>3) sheet.getRange(4,1,maxRows-3,maxCols).clearContent();
  sheet.getRange(1,1,paddedResult.length, numCols).setValues(paddedResult);
}

// ── ЗАПИСЬ В SUPABASE ───────────────────────────────────
function pushReportToSupabase(testMode){
  const sheet = SpreadsheetApp.getActiveSheet();
  const currentStart = getDateFromCell(sheet.getRange('U1').getValue());
  const currentEnd = getDateFromCell(sheet.getRange('U2').getValue());

  const {barbers, sources} = computeMetrics(currentStart, currentEnd);

  let monthKey, label;
  if(testMode){
    monthKey = 'test_brixton';
    label = 'ТЕСТ ' + fmt(currentStart) + ' — ' + fmt(currentEnd);
  } else {
    monthKey = MONTH_KEYS_EN[currentStart.getMonth()] + '_' + currentStart.getFullYear();
    label = MONTH_NAMES_RU[currentStart.getMonth()] + ' ' + currentStart.getFullYear();
    const lastDay = new Date(currentStart.getFullYear(), currentStart.getMonth()+1, 0).getDate();
    if(currentEnd.getDate() < lastDay){
      label += ' (на ' + String(currentEnd.getDate()).padStart(2,'0') + '.' + String(currentEnd.getMonth()+1).padStart(2,'0') + ')';
    }
  }

  const getResp = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=data', {
    method: 'get',
    headers: { 'apikey': getSupabaseServiceRole_(), 'Authorization': 'Bearer ' + getSupabaseServiceRole_() },
    muteHttpExceptions: true
  });
  Logger.log('GET код ответа: ' + getResp.getResponseCode());
  Logger.log('GET тело ответа: ' + getResp.getContentText());
  const current = JSON.parse(getResp.getContentText());
  const fullData = current[0].data;

  if(!fullData.months) fullData.months = {};
  fullData.months[monthKey] = { label: label, barbers: barbers, sources: sources };
  fullData.current = monthKey;

  const patchResp = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main', {
    method: 'patch',
    headers: { 'apikey': getSupabaseServiceRole_(), 'Authorization': 'Bearer ' + getSupabaseServiceRole_(), 'Content-Type': 'application/json' },
    payload: JSON.stringify({ data: fullData }),
    muteHttpExceptions: true
  });

  Logger.log('Записано в раздел: ' + monthKey);
  Logger.log('Ответ Supabase: ' + patchResp.getResponseCode());
}

function TEST_pushToSupabase(){
  pushReportToSupabase(true);
}

// ── ОБНОВЛЕНИЕ ЛЮБОГО МЕСЯЦА (используется и автообновлением, и кнопкой на сайте) ──
function updateMonth(currentStart, currentEnd){
  const {barbers, sources} = computeMetrics(currentStart, currentEnd);

  const monthKey = MONTH_KEYS_EN[currentStart.getMonth()] + '_' + currentStart.getFullYear();
  let label = MONTH_NAMES_RU[currentStart.getMonth()] + ' ' + currentStart.getFullYear();
  const lastDay = new Date(currentStart.getFullYear(), currentStart.getMonth()+1, 0).getDate();
  if(currentEnd.getDate() < lastDay || currentEnd.getMonth()!==currentStart.getMonth() || currentEnd.getFullYear()!==currentStart.getFullYear()){
    label += ' (на ' + String(currentEnd.getDate()).padStart(2,'0') + '.' + String(currentEnd.getMonth()+1).padStart(2,'0') + ')';
  }

  const getResp = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=data', {
    method: 'get',
    headers: { 'apikey': getSupabaseServiceRole_(), 'Authorization': 'Bearer ' + getSupabaseServiceRole_() },
    muteHttpExceptions: true
  });
  const current = JSON.parse(getResp.getContentText());
  const fullData = current[0].data;

  if(!fullData.months) fullData.months = {};
  fullData.months[monthKey] = { label: label, barbers: barbers, sources: sources };

  const now = new Date();
  const isCurrentMonth = currentStart.getFullYear()===now.getFullYear() && currentStart.getMonth()===now.getMonth();
  if(isCurrentMonth) fullData.current = monthKey;

  UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main', {
    method: 'patch',
    headers: { 'apikey': getSupabaseServiceRole_(), 'Authorization': 'Bearer ' + getSupabaseServiceRole_(), 'Content-Type': 'application/json' },
    payload: JSON.stringify({ data: fullData }),
    muteHttpExceptions: true
  });

  return label;
}

function updateCurrentMonth(){
  const now = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return updateMonth(currentStart, currentEnd);
}

function dailyUpdate(){
  updateCurrentMonth();
}

function jsonResponse_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function requireAdminToken_(providedToken) {
  var expectedToken = PropertiesService
    .getScriptProperties()
    .getProperty('BRIXTON_ADMIN_TOKEN');
  if (!expectedToken || String(providedToken || '') !== expectedToken) {
    throw new Error('Доступ запрещён');
  }
}

function requireOwnerToken_(providedToken) {
  var expectedToken = PropertiesService
    .getScriptProperties()
    .getProperty('BRIXTON_OWNER_TOKEN');
  if (!expectedToken || String(providedToken || '') !== expectedToken) {
    throw new Error('Доступ запрещён');
  }
}

var OWNER_SECTION_NAMES_ = [
  'months',
  'current',
  'trn',
  'salaries',
  'notes',
  'goods_manual',
  'cohorts',
  'adSpend',
  'sourceMasterShare'
];

function isPlainObject_(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getOwnerData_() {
  var row = fetchStoreProjection_([
    'months:data->months',
    'current:data->current',
    'trn:data->trn',
    'salaries:data->salaries',
    'notes:data->notes',
    'goods_manual:data->goods_manual',
    'cohorts:data->cohorts',
    'adSpend:data->adSpend',
    'sourceMasterShare:data->sourceMasterShare'
  ].join(','));
  return {
    months: row.months || {},
    current: String(row.current || ''),
    trn: row.trn || {},
    salaries: row.salaries || {},
    notes: row.notes || {},
    goods_manual: row.goods_manual || {},
    cohorts: row.cohorts || {},
    adSpend: row.adSpend || {},
    sourceMasterShare: row.sourceMasterShare === undefined || row.sourceMasterShare === null
      ? 40
      : Number(row.sourceMasterShare)
  };
}

function validateOwnerSections_(sections, requireComplete) {
  if (!isPlainObject_(sections)) throw new Error('Неверные разделы владельца');
  var keys = Object.keys(sections);
  if (!keys.length) throw new Error('Нет данных для сохранения');
  keys.forEach(function(key) {
    if (OWNER_SECTION_NAMES_.indexOf(key) === -1) {
      throw new Error('Запрещённый раздел: ' + key);
    }
  });
  if (requireComplete) {
    OWNER_SECTION_NAMES_.forEach(function(key) {
      if (!Object.prototype.hasOwnProperty.call(sections, key)) {
        throw new Error('Отсутствует раздел: ' + key);
      }
    });
  }
  if (Object.prototype.hasOwnProperty.call(sections, 'months')) {
    if (!isPlainObject_(sections.months) || Object.keys(sections.months).length > 240) {
      throw new Error('Неверный months');
    }
    Object.keys(sections.months).forEach(function(monthKey) {
      var month = sections.months[monthKey];
      if (!isPlainObject_(month) || !Array.isArray(month.barbers) || month.barbers.length > 500) {
        throw new Error('Неверный месяц: ' + monthKey);
      }
    });
  }
  if (Object.prototype.hasOwnProperty.call(sections, 'current')) {
    if (typeof sections.current !== 'string' || !sections.current || sections.current.length > 100) {
      throw new Error('Неверный current');
    }
  }
  ['trn','salaries','notes','goods_manual','cohorts','adSpend'].forEach(function(key) {
    if (Object.prototype.hasOwnProperty.call(sections, key) && !isPlainObject_(sections[key])) {
      throw new Error('Неверный ' + key);
    }
  });
  if (Object.prototype.hasOwnProperty.call(sections, 'sourceMasterShare')) {
    var share = Number(sections.sourceMasterShare);
    if (!isFinite(share) || share < 0 || share > 100) throw new Error('Неверный sourceMasterShare');
    sections.sourceMasterShare = share;
  }
  if (JSON.stringify(sections).length > 5000000) throw new Error('Слишком большой запрос');
  return sections;
}

function saveOwnerSections_(sections, requireComplete) {
  sections = validateOwnerSections_(sections, requireComplete);
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var store = getBrixtonStoreData_();
    Object.keys(sections).forEach(function(key) {
      store[key] = sections[key];
    });
    if (!isPlainObject_(store.months) || !store.months[store.current]) {
      throw new Error('Текущий месяц отсутствует в months');
    }
    var response = UrlFetchApp.fetch(
      SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main',
      {
        method: 'patch',
        headers: {
          apikey: getSupabaseServiceRole_(),
          Authorization: 'Bearer ' + getSupabaseServiceRole_(),
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        payload: JSON.stringify({
          data: store,
          updated_at: new Date().toISOString()
        }),
        muteHttpExceptions: true
      }
    );
    var code = response.getResponseCode();
    if (code < 200 || code >= 300) throw new Error('Supabase PATCH: HTTP ' + code);
  } finally {
    lock.releaseLock();
  }
}

function adminErrorMessage_(err) {
  return err && err.message ? String(err.message) : String(err);
}

function fetchStoreProjection_(select) {
  var response = UrlFetchApp.fetch(
    SUPABASE_URL +
      '/rest/v1/brixton_store?id=eq.main&select=' +
      encodeURIComponent(select),
    {
      method: 'get',
      headers: {
        apikey: getSupabaseServiceRole_(),
        Authorization: 'Bearer ' + getSupabaseServiceRole_()
      },
      muteHttpExceptions: true
    }
  );
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Supabase GET: HTTP ' + code);
  }
  var rows = JSON.parse(response.getContentText());
  return rows && rows[0] ? rows[0] : {};
}

function getFreeSlotsData_() {
  var row = fetchStoreProjection_('freeSlots:data->freeSlots');
  return row.freeSlots || null;
}

function getAdminData_() {
  var row = fetchStoreProjection_([
    'tasks:data->tasks',
    'admins:data->admins',
    'announcements:data->announcements',
    'goals:data->goals',
    'salesGoals:data->salesGoals',
    'masterGoals:data->masterGoals',
    'current:data->current',
    'months:data->months'
  ].join(','));
  var months = row.months || {};
  var current = String(row.current || '');
  var currentMonth = months[current] || {};
  var goalMasters = {'694866': [], '1076318': []};
  var branchIds = {'Менделеева': '694866', 'Энтузиастов': '1076318'};

  (Array.isArray(currentMonth.barbers) ? currentMonth.barbers : []).forEach(function(b) {
    var branchId = b && branchIds[b.loc];
    if (!branchId || !b.name) return;
    if (!goalMasters[branchId].some(function(x) { return x.name === b.name; })) {
      goalMasters[branchId].push({
        name: String(b.name),
        goods: Number(b.goods_rev) || 0,
        services: Number(b.rev) || 0
      });
    }
  });
  Object.keys(goalMasters).forEach(function(branchId) {
    goalMasters[branchId].sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
  });

  var monthNames = [
    'january','february','march','april','may','june',
    'july','august','september','october','november','december'
  ];
  var now = new Date();
  var currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  var pastMonths = Object.keys(months).map(function(key) {
    var match = key.match(/^([a-z]+)_(\d{4})$/);
    var monthIndex = match ? monthNames.indexOf(match[1]) : -1;
    if (!match || monthIndex < 0) return null;
    return {
      date: new Date(Number(match[2]), monthIndex, 1),
      data: months[key]
    };
  }).filter(function(item) {
    return item && item.date < currentMonthStart &&
      item.data && Array.isArray(item.data.barbers);
  }).sort(function(a, b) {
    return b.date - a.date;
  });

  var goalHistory = {'694866': {}, '1076318': {}};
  Object.keys(goalMasters).forEach(function(branchId) {
    var branchName = branchId === '694866' ? 'Менделеева' : 'Энтузиастов';
    goalMasters[branchId].forEach(function(master) {
      var history = {goods: [], services: []};
      pastMonths.forEach(function(month) {
        var barber = month.data.barbers.find(function(b) {
          return b && b.name === master.name && b.loc === branchName;
        });
        if (!barber) return;
        var goods = Number(barber.goods_rev) || 0;
        var services = Number(barber.rev) || 0;
        if (goods > 0 && history.goods.length < 3) history.goods.push(goods);
        if (services > 0 && history.services.length < 3) history.services.push(services);
      });
      goalHistory[branchId][master.name] = history;
    });
  });

  return {
    tasks: Array.isArray(row.tasks) ? row.tasks : [],
    admins: row.admins || {},
    announcements: Array.isArray(row.announcements) ? row.announcements : [],
    goals: row.goals || {},
    salesGoals: row.salesGoals || {},
    masterGoals: row.masterGoals || {},
    goalMasters: goalMasters,
    goalHistory: goalHistory
  };
}

function cleanString_(value, maxLength) {
  return String(value == null ? '' : value).trim().substring(0, maxLength);
}

function validateAdminPayload_(action, payload) {
  var branches = {'694866': true, '1076318': true};
  var result = {};

  if (action === 'saveTasks') {
    if (!Array.isArray(payload.tasks) || payload.tasks.length > 500) throw new Error('Неверный tasks');
    result.tasks = payload.tasks.map(function(t) {
      if (!t || !['694866','1076318','both'].includes(String(t.branch))) throw new Error('Неверная задача');
      var sched = t.sched === 'month' ? 'month' : 'week';
      return {
        id: cleanString_(t.id, 80),
        branch: String(t.branch),
        time: /^([01]\d|2[0-3]):[0-5]\d$/.test(String(t.time || '')) ? String(t.time) : '',
        text: cleanString_(t.text, 1000),
        active: t.active !== false,
        sched: sched,
        days: sched === 'week' && Array.isArray(t.days) ? t.days.map(function(v) { return cleanString_(v, 3); }).slice(0, 7) : [],
        dates: sched === 'month' && Array.isArray(t.dates) ? t.dates.filter(function(v) { return v === 'last' || (Number(v) >= 1 && Number(v) <= 31); }).slice(0, 32) : []
      };
    });
    return result;
  }

  if (action === 'saveAdmins') {
    if (!payload.admins || typeof payload.admins !== 'object' || Array.isArray(payload.admins)) throw new Error('Неверный admins');
    result.admins = {};
    Object.keys(branches).forEach(function(branchId) {
      var list = payload.admins[branchId];
      if (!Array.isArray(list) || list.length > 100) throw new Error('Неверный список админов');
      result.admins[branchId] = list.map(function(v) { return cleanString_(v, 100); }).filter(Boolean);
    });
    return result;
  }

  if (action === 'saveAnnouncements') {
    if (!Array.isArray(payload.announcements) || payload.announcements.length > 200) throw new Error('Неверный announcements');
    result.announcements = payload.announcements.map(function(item) {
      if (!item || !['694866','1076318','both'].includes(String(item.branch))) throw new Error('Неверное объявление');
      return {
        id: cleanString_(item.id, 80),
        branch: String(item.branch),
        title: cleanString_(item.title, 200),
        text: cleanString_(item.text, 2000),
        active: item.active !== false
      };
    });
    return result;
  }

  if (action === 'saveGoals') {
    ['goals','salesGoals','masterGoals'].forEach(function(key) {
      if (!payload[key] || typeof payload[key] !== 'object' || Array.isArray(payload[key])) throw new Error('Неверный ' + key);
    });
    result.goals = {};
    result.salesGoals = {};
    result.masterGoals = {};
    Object.keys(branches).forEach(function(branchId) {
      result.goals[branchId] = Math.max(0, Math.round(Number(payload.goals[branchId]) || 0));
      result.salesGoals[branchId] = Math.max(0, Math.round(Number(payload.salesGoals[branchId]) || 0));
      result.masterGoals[branchId] = {};
      var masters = payload.masterGoals[branchId] || {};
      if (typeof masters !== 'object' || Array.isArray(masters) || Object.keys(masters).length > 100) throw new Error('Неверный masterGoals');
      Object.keys(masters).forEach(function(name) {
        var cleanName = cleanString_(name, 100);
        var goal = masters[name] || {};
        if (cleanName) {
          result.masterGoals[branchId][cleanName] = {
            goods: Math.max(0, Math.round(Number(goal.goods) || 0)),
            services: Math.max(0, Math.round(Number(goal.services) || 0))
          };
        }
      });
    });
    return result;
  }

  throw new Error('Неизвестное action');
}

function saveAdminSections_(sections) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var store = getBrixtonStoreData_();
    Object.keys(sections).forEach(function(key) {
      if (!['tasks','admins','announcements','goals','salesGoals','masterGoals'].includes(key)) {
        throw new Error('Запрещённый раздел: ' + key);
      }
      store[key] = sections[key];
    });
    var response = UrlFetchApp.fetch(
      SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main',
      {
        method: 'patch',
        headers: {
          apikey: getSupabaseServiceRole_(),
          Authorization: 'Bearer ' + getSupabaseServiceRole_(),
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        payload: JSON.stringify({data: store}),
        muteHttpExceptions: true
      }
    );
    var code = response.getResponseCode();
    if (code < 200 || code >= 300) throw new Error('Supabase PATCH: HTTP ' + code);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e){
  if(e.parameter.action === 'getFreeSlots'){
    try {
      return jsonResponse_({success:true, data:getFreeSlotsData_()});
    } catch(err) {
      return jsonResponse_({success:false, error:String(err)});
    }
  }
  if(e.parameter.action === 'getAdminData'){
    return jsonResponse_({success:false, error:'Доступ запрещён'});
  }
  if(e.parameter.action === 'refreshSlots'){
    try {
      buildFreeSlots();
      return ContentService.createTextOutput(JSON.stringify({success:true}))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err){
      return ContentService.createTextOutput(JSON.stringify({success:false, error:String(err)}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  if(e.parameter.action === 'getTodaySchedule'){
    const companyId = e.parameter.company_id;
    const date = e.parameter.date || '';
    const data = doGetTablo(companyId, date);
    return ContentService.createTextOutput(
      JSON.stringify({success:true, data:data})
    ).setMimeType(ContentService.MimeType.JSON);
  }
  if(e.parameter.action === 'getTvBoard'){
  try {
    const data = doGetTvBoard(e.parameter.company_id);
    return ContentService.createTextOutput(
      JSON.stringify({success:true, data:data})
    ).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(
      JSON.stringify({success:false, error:String(err)})
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
  if(e.parameter.action === 'getStaff'){
    const partnerToken = getYclientsPartnerToken_();
    const userToken = getYclientsUserToken_();
    const headers = {'Accept':'application/vnd.yclients.v2+json','Authorization':'Bearer '+partnerToken+', User '+userToken};
    const result = {};
    [694866, 1076318].forEach(cid=>{
      const resp = UrlFetchApp.fetch('https://api.yclients.com/api/v1/company/'+cid+'/staff/?fired=1',{method:'get',headers:headers,muteHttpExceptions:true});
      const data = JSON.parse(resp.getContentText());
      (data.data||[]).forEach(s=>{
        const spec=(s.specialization||'').toLowerCase();
        if(!spec.includes('менеджер')&&!spec.includes('админ')){
          result[s.name]={yclients_id:s.id, company_id:cid};
        }
      });
    });
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  if(e.parameter.action === 'getClientList'){
    const companyId = parseInt(e.parameter.company_id);
    const staffId = parseInt(e.parameter.staff_id);
    const threshold = parseInt(e.parameter.threshold) || 10;
    const monthParam = e.parameter.month;

    const parts = monthParam.split('-').map(Number);
    const y = parts[0], mo = parts[1];
    const mStart = new Date(y, mo-1, 1);
    const now = new Date();
    const todayNorm = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthEnd = new Date(y, mo-1, new Date(y,mo,0).getDate());
    const mEnd = monthEnd < todayNorm ? monthEnd : todayNorm;
    const prevEnd = new Date(y, mo-1, 0);
    const lookbackStart = addDays(mStart, -730);

    const partnerToken = getYclientsPartnerToken_();
    const userToken = getYclientsUserToken_();
    const headers = {
      'Accept': 'application/vnd.yclients.v2+json',
      'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
    };

    const recordsAll = fetchAllRecords(companyId, staffId, lookbackStart, mEnd, headers);
    const attended = recordsAll.filter(r => r.attendance===1 && r.client && r.client.id);

    function getActiveSet(endDate, cutoff60){
      const byC = {};
      attended.forEach(r=>{
        const d = parseRecordDate(r.date);
        if(d > endDate) return;
        const cid = r.client.id;
        if(!byC[cid]) byC[cid] = {n:0, last:null, first:null, name:r.client.name||'', surname:r.client.surname||'', phone:r.client.phone||'', id:cid, rev:0};
        byC[cid].n++;
        if(!byC[cid].last || d > byC[cid].last) byC[cid].last = d;
        if(!byC[cid].first || d < byC[cid].first) byC[cid].first = d;
        (r.services||[]).forEach(s=>{ byC[cid].rev += (s.cost||0); });
      });
      return Object.values(byC).filter(c => c.last >= cutoff60 && c.n >= threshold);
    }

    const currActive = getActiveSet(mEnd, addDays(mEnd, -60));
    const prevActive = getActiveSet(prevEnd, addDays(prevEnd, -60));
    const prevIds = new Set(prevActive.map(c => c.id));
    const currIds = new Set(currActive.map(c => c.id));

    const toClient = c => ({
      id: c.id,
      name: (c.name + ' ' + c.surname).trim(),
      phone: c.phone,
      visits: c.n,
      last: c.last ? fmt(c.last) : '',
      first: c.first ? fmt(c.first) : '',
      rev: Math.round(c.rev)
    });

    const newClients  = currActive.filter(c => !prevIds.has(c.id)).map(toClient).sort((a,b)=>b.visits-a.visits);
    const stayClients = currActive.filter(c =>  prevIds.has(c.id)).map(toClient).sort((a,b)=>b.visits-a.visits);
    const leftClients = prevActive.filter(c => !currIds.has(c.id)).map(toClient).sort((a,b)=>b.visits-a.visits);

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      list: [...newClients, ...stayClients, ...leftClients],
      new_ids: newClients.map(c=>c.id),
      left_ids: leftClients.map(c=>c.id)
    })).setMimeType(ContentService.MimeType.JSON);
  }
// ════════════════════════════════════════════════════════
// ГРАФИК АДМИНИСТРАТОРОВ — ПОЛУЧЕНИЕ
// ════════════════════════════════════════════════════════
if (e.parameter.action === 'getAdminSchedule') {
  try {
    const companyId = String(e.parameter.company_id || '');
    const month = String(e.parameter.month || '');

    const schedule = getAdminSchedule_(companyId, month);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: schedule
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: String(err)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
  const monthParam = e.parameter && e.parameter.month;
  const fromParam = e.parameter && e.parameter.from;
  const toParam = e.parameter && e.parameter.to;

  let currentStart, currentEnd;
  if(fromParam && toParam){
    currentStart = getDateFromCell(fromParam);
    currentEnd = getDateFromCell(toParam);
  } else if(monthParam){
    const parts = monthParam.split('-').map(Number);
    const y = parts[0], mo = parts[1];
    currentStart = new Date(y, mo-1, 1);
    const lastDay = new Date(y, mo, 0).getDate();
    const now = new Date();
    const todayNorm = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthEnd = new Date(y, mo-1, lastDay);
    currentEnd = monthEnd < todayNorm ? monthEnd : todayNorm;
  } else {
    const now = new Date();
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  let label;
  if(fromParam && toParam){
    const {barbers, sources} = computeMetrics(currentStart, currentEnd);
    label = 'Период ' + fmt(currentStart) + ' — ' + fmt(currentEnd);

    const getResp = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=data', {
      method: 'get',
      headers: { 'apikey': getSupabaseServiceRole_(), 'Authorization': 'Bearer ' + getSupabaseServiceRole_() },
      muteHttpExceptions: true
    });
    const current = JSON.parse(getResp.getContentText());
    const fullData = current[0].data;
    if(!fullData.months) fullData.months = {};
    fullData.months['custom_period'] = { label: label, barbers: barbers };
    fullData.current = 'custom_period';

    UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main', {
      method: 'patch',
      headers: { 'apikey': getSupabaseServiceRole_(), 'Authorization': 'Bearer ' + getSupabaseServiceRole_(), 'Content-Type': 'application/json' },
      payload: JSON.stringify({ data: fullData }),
      muteHttpExceptions: true
    });
  } else {
    label = updateMonth(currentStart, currentEnd);
  }

  return HtmlService.createHtmlOutput(
    '<html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0C181A;color:#F0ECE6">'
    + '<h1>✅ Готово!</h1>'
    + '<p>Данные за <b>' + label + '</b> обновлены.</p>'
    + (e.parameter.autoclose ? '<script>setTimeout(()=>window.close(),1500)</script>' : '<p>Можешь закрыть эту вкладку и вернуться на сайт.</p>')
    + '</body></html>'
  );
}
// ════════════════════════════════════════════════════════
// ГРАФИК АДМИНИСТРАТОРОВ — СОХРАНЕНИЕ
// ════════════════════════════════════════════════════════

// Получает сохранённый график филиала за месяц
function getAdminSchedule_(companyId, month) {
  validateAdminScheduleRequest_(companyId, month);

  const select =
    'schedule:data->adminSchedules->' +
    companyId +
    '->' +
    month;

  const response = UrlFetchApp.fetch(
    SUPABASE_URL +
      '/rest/v1/brixton_store?id=eq.main&select=' +
      encodeURIComponent(select),
    {
      method: 'get',
      headers: {
        apikey: getSupabaseServiceRole_(),
        Authorization: 'Bearer ' + getSupabaseServiceRole_()
      },
      muteHttpExceptions: true
    }
  );

  const responseCode = response.getResponseCode();

  if (responseCode < 200 || responseCode >= 300) {
    throw new Error(
      'Ошибка загрузки из Supabase: ' +
      responseCode +
      ' — ' +
      response.getContentText()
    );
  }

  const rows = JSON.parse(response.getContentText());

  return rows.length && rows[0].schedule
    ? rows[0].schedule
    : {};
}


// Сохраняет график филиала за месяц
function saveAdminSchedule_(companyId, month, schedule) {
  const lock = LockService.getScriptLock();

  lock.waitLock(15000);

  try {
    const fullData = getBrixtonStoreData_();

    if (!fullData.adminSchedules) {
      fullData.adminSchedules = {};
    }

    if (!fullData.adminSchedules[companyId]) {
      fullData.adminSchedules[companyId] = {};
    }

    fullData.adminSchedules[companyId][month] = schedule;

    const response = UrlFetchApp.fetch(
      SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main',
      {
        method: 'patch',
        headers: {
          apikey: getSupabaseServiceRole_(),
          Authorization: 'Bearer ' + getSupabaseServiceRole_(),
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({
          data: fullData
        }),
        muteHttpExceptions: true
      }
    );

    const responseCode = response.getResponseCode();

    if (responseCode < 200 || responseCode >= 300) {
      throw new Error(
        'Ошибка сохранения в Supabase: ' +
        responseCode +
        ' — ' +
        response.getContentText()
      );
    }

  } finally {
    lock.releaseLock();
  }
}


// Загружает общие данные brixton_store
function getBrixtonStoreData_() {
  const response = UrlFetchApp.fetch(
    SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=data',
    {
      method: 'get',
      headers: {
        apikey: getSupabaseServiceRole_(),
        Authorization: 'Bearer ' + getSupabaseServiceRole_()
      },
      muteHttpExceptions: true
    }
  );

  const responseCode = response.getResponseCode();

  if (responseCode < 200 || responseCode >= 300) {
    throw new Error(
      'Ошибка загрузки из Supabase: ' +
      responseCode +
      ' — ' +
      response.getContentText()
    );
  }

  const rows = JSON.parse(response.getContentText());

  if (!rows.length || !rows[0].data) {
    throw new Error('Запись brixton_store с id=main не найдена');
  }

  return rows[0].data;
}


// Проверяет филиал и формат месяца
function validateAdminScheduleRequest_(companyId, month) {
  const allowedCompanies = ['694866', '1076318'];

  if (allowedCompanies.indexOf(companyId) === -1) {
    throw new Error('Неизвестный филиал');
  }

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error('Месяц должен быть в формате YYYY-MM');
  }
}
// ── СЛУЖЕБНЫЕ (диагностика, можно не трогать) ───────────
function GET_SERVICE_CATEGORIES(){
  const companyId = 694866; // Менделеева
  const url = `https://api.yclients.com/api/v1/service_categories/${companyId}`;
  const resp = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': `Bearer ${getYclientsPartnerToken_()}, User ${getYclientsUserToken_()}`,
      'Accept': 'application/vnd.api.v2+json'
    },
    muteHttpExceptions: true
  });
  Logger.log(resp.getContentText());
}

function GET_ALL_SERVICES(){
  const companyId = 694866;
  const url = `https://api.yclients.com/api/v1/services/${companyId}`;
  const resp = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': `Bearer ${getYclientsPartnerToken_()}, User ${getYclientsUserToken_()}`,
      'Accept': 'application/vnd.api.v2+json'
    },
    muteHttpExceptions: true
  });
  const data = JSON.parse(resp.getContentText()).data;
  const simplified = data.map(s => ({title: s.title, cat: s.category_id, price: s.price_min}));
  Logger.log(JSON.stringify(simplified));
}
// ── НОЧНОЙ ПЕРЕСЧЁТ ИСТОРИИ ──────────────────────────
function recalcHistoryStep(){
  const hour = new Date().getHours();
  if(hour < 0 || hour >= 7){
    Logger.log('Сейчас не ночь (час='+hour+'), пропускаем');
    return;
  }
  const props = PropertiesService.getScriptProperties();
  // Список месяцев для пересчёта: с мая 2022 по декабрь 2024
  const months = [];
  const nowD = new Date();
  for(let y=2022; y<=nowD.getFullYear(); y++){
    const startM = (y===2022) ? 4 : 0; // 2022 с мая
    const endM = (y===nowD.getFullYear()) ? (nowD.getMonth()+1) : 12; // до текущего месяца
    for(let m=startM; m<endM; m++){
      months.push({y:y, m:m});
    }
  }

  let idx = parseInt(props.getProperty('recalc_idx') || '0');
  if(idx >= months.length){
    Logger.log('Пересчёт истории завершён полностью! Удаляю триггер.');
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(t=>{
      if(t.getHandlerFunction()==='recalcHistoryStep'){
        ScriptApp.deleteTrigger(t);
      }
    });
    return;
  }

  const {y, m} = months[idx];
  const currentStart = new Date(y, m, 1);
  const lastDay = new Date(y, m+1, 0).getDate();
  const currentEnd = new Date(y, m, lastDay);

  try {
    const label = updateMonth(currentStart, currentEnd);
    Logger.log('Пересчитан месяц ' + (idx+1) + '/' + months.length + ': ' + label);
    props.setProperty('recalc_idx', String(idx+1));
  } catch(err){
    Logger.log('Ошибка на месяце ' + (idx+1) + ': ' + err.message + ' — повтор в следующий раз');
  }
}

// Запусти один раз вручную чтобы сбросить счётчик перед стартом
function resetRecalcCounter(){
  PropertiesService.getScriptProperties().setProperty('recalc_idx', '0');
  Logger.log('Счётчик сброшен. Можно ставить триггер.');
}
function doGetTablo(companyId) {
  const partnerToken = getYclientsPartnerToken_();
  const userToken = getYclientsUserToken_();
  const headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };
  const now = new Date();
  function doGetTablo(companyId, date) {
  const partnerToken = getYclientsPartnerToken_();
  const userToken = getYclientsUserToken_();
  const headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };
  var target;
  if (date) {
    target = new Date(date);
  } else {
    target = new Date();
  }
  var start = Utilities.formatDate(target, 'Asia/Yekaterinburg', 'yyyy-MM-dd') + ' 00:00:00';
  var end   = Utilities.formatDate(target, 'Asia/Yekaterinburg', 'yyyy-MM-dd') + ' 23:59:59';
  const records = fetchAllRecords(companyId, 0, start, end, headers);
  const byStaff = {};
  (records||[]).forEach(function(r) {
    var sid   = r.staff && r.staff.id   ? r.staff.id   : 0;
    var sname = r.staff && r.staff.name ? r.staff.name : '—';
    if (!byStaff[sid]) byStaff[sid] = {id:sid, name:sname, appointments:[]};
    var services = (r.services||[]).map(function(s){return s.title||s.name||'';});
    byStaff[sid].appointments.push({
      id:         r.id,
      time:       r.datetime ? r.datetime.substring(11,16) : '',
      clientName: r.client && r.client.name ? r.client.name : 'Клиент',
      services:   services,
      visit:      r.attendance !== undefined ? r.attendance : 0
    });
  });
  Object.values(byStaff).forEach(function(s){
    s.appointments.sort(function(a,b){return a.time<b.time?-1:1;});
  });
  return Object.values(byStaff);
}
  const end   = Utilities.formatDate(now, 'Asia/Yekaterinburg', 'yyyy-MM-dd') + ' 23:59:59';
  const records = fetchAllRecords(companyId, 0, start, end, headers);
  const byStaff = {};
  (records||[]).forEach(r=>{
    const sid   = r.staff && r.staff.id   ? r.staff.id   : 0;
    const sname = r.staff && r.staff.name ? r.staff.name : '—';
    if(!byStaff[sid]) byStaff[sid] = {id:sid, name:sname, appointments:[]};
    const services = (r.services||[]).map(s=>s.title||s.name||'');
    byStaff[sid].appointments.push({
      id:         r.id,
      time:       r.datetime ? r.datetime.substring(11,16) : '',
      clientName: r.client && r.client.name ? r.client.name : 'Клиент',
      services:   services,
      visit:      r.attendance !== undefined ? r.attendance : 0
    });
  });
  Object.values(byStaff).forEach(s=>{
    s.appointments.sort((a,b)=> a.time < b.time ? -1 : 1);
  });
  return Object.values(byStaff);
}
function TEST_SALARY(){
  const partnerToken = getYclientsPartnerToken_();
  const userToken = getYclientsUserToken_();
  const headers = {'Accept':'application/vnd.yclients.v2+json','Authorization':'Bearer '+partnerToken+', User '+userToken};
  const url = 'https://api.yclients.com/api/v1/company/1076318/salary/calculation/?date_from=2026-06-01&date_to=2026-06-30';
  const r = UrlFetchApp.fetch(url, {method:'get', headers:headers, muteHttpExceptions:true});
  Logger.log('Код: ' + r.getResponseCode());
  Logger.log('Ответ: ' + r.getContentText().slice(0, 2000));
}
function DIAG_SOURCE(){
  const headers = {
    'Accept':'application/vnd.yclients.v2+json',
    'Authorization':'Bearer '+getYclientsPartnerToken_()+', User '+getYclientsUserToken_()
  };
  const cid = 694866; // Менделеева
  // 1) последние записи, берём id клиента
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const recs = fetchAllRecords(cid, 0, start, now, headers);
  const rec = recs.find(r => r.client && r.client.id);
  Logger.log('=== ОДНА ЗАПИСЬ (все поля) ===');
  Logger.log(JSON.stringify(rec, null, 2).slice(0, 2500));

  // 2) полный клиент — ищем поле источника
  if(rec){
    const url = 'https://api.yclients.com/api/v1/client/' + cid + '/' + rec.client.id;
    const r = UrlFetchApp.fetch(url, {method:'get', headers:headers, muteHttpExceptions:true});
    Logger.log('=== ПОЛНЫЙ КЛИЕНТ (код '+r.getResponseCode()+') ===');
    Logger.log(r.getContentText().slice(0, 3000));
  }
}
function DIAG_NEW_CLIENT_COMMENT() {
  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();

  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization':
      'Bearer ' + partnerToken + ', User ' + userToken
  };

  var companies = [
    {
      id: 694866,
      name: 'Менделеева'
    },
    {
      id: 1076318,
      name: 'Энтузиастов'
    }
  ];

  var now = new Date();

  var startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 30);

  companies.forEach(function(company) {
    var records = fetchAllRecords(
      company.id,
      0,
      startDate,
      now,
      headers
    );

    var newRecords = records.filter(function(record) {
      var client = record.client || {};

      return record.attendance === 1 &&
        client.id &&
        (
          client.is_new === true ||
          client.is_new === 1
        );
    });

    newRecords.sort(function(a, b) {
      return String(b.date || '')
        .localeCompare(String(a.date || ''));
    });

    var record = newRecords[0];

    if (!record) {
      Logger.log(
        '=== ' + company.name +
        ': за последние 30 дней новый клиент не найден ==='
      );

      return;
    }

    Logger.log(
      '=== НОВЫЙ КЛИЕНТ: ' +
      company.name + ' | ' +
      (
        record.staff && record.staff.name
          ? record.staff.name
          : 'Барбер не определён'
      ) +
      ' | ' +
      (
        record.client.display_name ||
        record.client.name ||
        'Без имени'
      ) +
      ' ==='
    );

    var clientResponse = UrlFetchApp.fetch(
      'https://api.yclients.com/api/v1/client/' +
        company.id + '/' +
        record.client.id,
      {
        method: 'get',
        headers: headers,
        muteHttpExceptions: true
      }
    );

    var clientBody = JSON.parse(
      clientResponse.getContentText()
    );

    var fullClient =
      clientBody && clientBody.data
        ? clientBody.data
        : {};

    /*
     * Одна итоговая переменная.
     * Проверяем оба места:
     * комментарий к записи и примечание клиента.
     */
    var barberCommentFound =
      isBarberComment(record.comment) ||
      isBarberComment(fullClient.comment);

    Logger.log(
      'Комментарий к записи: ' +
      JSON.stringify(record.comment || '')
    );

    Logger.log(
      'Примечание клиента: ' +
      JSON.stringify(fullClient.comment || '')
    );

    Logger.log(
      'Описание работы барбера найдено: ' +
      (barberCommentFound ? 'ДА' : 'НЕТ')
    );
  });
}
// ════════════════════════════════════════════════════════
// ПРОВЕРКА КАРТОЧЕК НОВЫХ КЛИЕНТОВ
// ════════════════════════════════════════════════════════


// ЕЖЕДНЕВНЫЙ ОТЧЁТ — только за сегодня
function sendNewClientNotesReport() {
  var now = new Date();

  var startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  sendNewClientNotesForPeriod(
    startDate,
    now,
    'ЗА СЕГОДНЯ',
    false, // не показывать дату возле клиента
    false  // не показывать статистику заполнения
  );
}


// ЕЖЕНЕДЕЛЬНЫЙ ОТЧЁТ — сегодня и предыдущие 6 дней
function sendNewClientNotesWeeklyReport() {
  var now = new Date();

  var startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  sendNewClientNotesForPeriod(
    startDate,
    now,
    'ЗА ПОСЛЕДНИЕ 7 ДНЕЙ',
    true, // показывать дату возле клиента
    true  // показывать процент заполнения
  );
}


// МЕСЯЧНЫЙ ОТЧЁТ — с первого числа текущего месяца
function sendNewClientNotesMonthlyReport() {
  var now = new Date();

  var startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  sendNewClientNotesForPeriod(
    startDate,
    now,
    'ЗА ТЕКУЩИЙ МЕСЯЦ',
    true, // показывать дату возле клиента
    true  // показывать процент заполнения
  );
}


// ОБЩАЯ ФУНКЦИЯ ПРОВЕРКИ
function sendNewClientNotesForPeriod(
  startDate,
  endDate,
  periodTitle,
  showDate,
  showStatistics,
  sendToTelegram
) {
  var telegramToken = getTelegramBotToken_();

  var barbersChatId = '-1003542259158';

  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();

  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization':
      'Bearer ' + partnerToken +
      ', User ' + userToken
  };

  var companies = [
    {
      id: 694866,
      name: 'Менделеева'
    },
    {
      id: 1076318,
      name: 'Энтузиастов'
    }
  ];

  var tz = Session.getScriptTimeZone();

  var startStr = Utilities.formatDate(
    startDate,
    tz,
    'yyyy-MM-dd'
  );

  var endStr = Utilities.formatDate(
    endDate,
    tz,
    'yyyy-MM-dd'
  );

  var missingByBarber = {};
  var statsByBarber = {};
  var seenRecords = {};

  // Статистика
  var totalNewClients = 0;
  var filledClients = 0;
  var missingClients = 0;
  var checkErrors = 0;

  companies.forEach(function(company) {
    var records = fetchAllRecords(
      company.id,
      0,
      startDate,
      endDate,
      headers
    ) || [];

    records.forEach(function(record) {
      var client = record.client || {};

      var rawDate = String(
        record.date ||
        record.datetime ||
        ''
      );

      var recordDate = rawDate.slice(0, 10);

      // Проверяем, что запись входит в нужный период
      if (
        recordDate < startStr ||
        recordDate > endStr
      ) {
        return;
      }

      // Только реально обслуженные клиенты
      if (record.attendance !== 1) {
        return;
      }

      if (!client.id) {
        return;
      }

      // Только новые клиенты
      var isNewClient =
        client.is_new === true ||
        client.is_new === 1 ||
        client.is_new === '1';

      if (!isNewClient) {
        return;
      }

      // Защита от повторного подсчёта одной записи
      var recordKey =
        company.id + '_' +
        String(record.id || '');

      if (
        record.id &&
        seenRecords[recordKey]
      ) {
        return;
      }

      if (record.id) {
        seenRecords[recordKey] = true;
      }

      var barberName =
  record.staff && record.staff.name
    ? String(record.staff.name).trim()
    : 'Барбер не определён';

if (!statsByBarber[barberName]) {
  statsByBarber[barberName] = {
    total: 0,
    filled: 0,
    missing: 0,
    errors: 0
  };
}

statsByBarber[barberName].total++;
totalNewClients++;

      var clientResponse;

      try {
        clientResponse = UrlFetchApp.fetch(
          'https://api.yclients.com/api/v1/client/' +
            company.id + '/' +
            client.id,
          {
            method: 'get',
            headers: headers,
            muteHttpExceptions: true
          }
        );
      } catch (error) {
        checkErrors++;
statsByBarber[barberName].errors++;
        Logger.log(
          'Ошибка получения карточки клиента. ' +
          company.name +
          ', клиент ID ' +
          client.id +
          ': ' +
          error
        );

        return;
      }

      var responseCode =
        clientResponse.getResponseCode();

      if (responseCode !== 200) {
        checkErrors++;
statsByBarber[barberName].errors++;
        Logger.log(
          'Не удалось получить карточку клиента. ' +
          'Филиал: ' + company.name +
          ', клиент ID: ' + client.id +
          ', код: ' + responseCode
        );

        return;
      }

      var clientBody;

      try {
        clientBody = JSON.parse(
          clientResponse.getContentText()
        );
      } catch (error) {
        checkErrors++;
statsByBarber[barberName].errors++;
        Logger.log(
          'Ошибка разбора карточки клиента ID ' +
          client.id +
          ': ' +
          error
        );

        return;
      }

      var fullClient =
        clientBody && clientBody.data
          ? clientBody.data
          : {};

      var barberCommentFound =
        isBarberComment(record.comment) ||
        isBarberComment(fullClient.comment);

      if (barberCommentFound) {
  filledClients++;
  statsByBarber[barberName].filled++;
  return;
}

      missingClients++;
statsByBarber[barberName].missing++;
      

      /*
       * Номер телефона намеренно не используется.
       * Если номер случайно записали в имени клиента,
       * он будет удалён.
       */
      var clientName =
        client.display_name ||
        client.name ||
        'Клиент без имени';

      clientName = String(clientName)
        .replace(
          /\+?\d[\d\s\-()]{8,}\d/g,
          ''
        )
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (!clientName) {
        clientName = 'Клиент без имени';
      }

      var timeText =
        rawDate.length >= 16
          ? rawDate.substring(11, 16)
          : 'время не указано';

      var dateText =
        recordDate.length === 10
          ? recordDate.substring(8, 10) +
            '.' +
            recordDate.substring(5, 7)
          : 'дата не указана';

      if (!missingByBarber[barberName]) {
        missingByBarber[barberName] = [];
      }

      missingByBarber[barberName].push({
        clientName: clientName,
        date: dateText,
        sortDate: recordDate,
        time: timeText,
        branch: company.name
      });
    });
  });

  var missingBarberNames =
  Object.keys(missingByBarber);

var reportBarberNames = showStatistics
  ? Object.keys(statsByBarber)
  : missingBarberNames;

/*
 * Ежедневный отчёт:
 * если незаполненных карточек нет — Telegram молчит.
 */
if (
  !showStatistics &&
  !missingBarberNames.length
) {
  Logger.log(
    periodTitle +
    ': новых принятых клиентов без описания нет'
  );

  return;
}

var successfullyChecked =
  totalNewClients - checkErrors;

var fillingPercent =
  successfullyChecked > 0
    ? Math.round(
        filledClients /
        successfullyChecked *
        100
      )
    : 0;

var text =
  '⚠️ КАРТОЧКИ НОВЫХ КЛИЕНТОВ\n' +
  '📅 ' + periodTitle + '\n\n';

if (showStatistics) {
  text +=
    '📊 Общий результат: заполнено ' +
    filledClients +
    ' из ' +
    successfullyChecked +
    ' (' +
    fillingPercent +
    '%)\n';

  text +=
    '❌ Не заполнено: ' +
    missingClients +
    '\n';

  if (checkErrors > 0) {
    text +=
      '⚠️ Не удалось проверить: ' +
      checkErrors +
      '\n';
  }

  text += '\n';
}

if (!reportBarberNames.length) {
  text +=
    'За выбранный период новых клиентов не было.';
} else {
  reportBarberNames.sort();

  reportBarberNames.forEach(function(barberName) {
    var barberStats =
      statsByBarber[barberName] || {
        total: 0,
        filled: 0,
        missing: 0,
        errors: 0
      };

    var barberChecked =
      barberStats.total - barberStats.errors;

    var barberPercent =
      barberChecked > 0
        ? Math.round(
            barberStats.filled /
            barberChecked *
            100
          )
        : 0;

    if (showStatistics) {
      text +=
        '👤 ' +
        barberName +
        ' — заполнено ' +
        barberStats.filled +
        ' из ' +
        barberChecked +
        ' (' +
        barberPercent +
        '%)\n';
    } else {
      text +=
        '👤 ' +
        barberName +
        '\n';
    }

    var missingItems =
      missingByBarber[barberName] || [];

    missingItems.sort(function(a, b) {
      var first =
        a.sortDate + ' ' + a.time;

      var second =
        b.sortDate + ' ' + b.time;

      return first.localeCompare(second);
    });

    if (!missingItems.length) {
      if (showStatistics) {
        text +=
          '✅ Все карточки заполнены\n';
      }
    } else {
      missingItems.forEach(function(item) {
        text +=
          '• ' +
          item.clientName +
          ' — ';

        if (showDate) {
          text +=
            item.date +
            ', ';
        }

        text +=
          item.time +
          ' (' +
          item.branch +
          ')\n';
      });
    }

    if (
      showStatistics &&
      barberStats.errors > 0
    ) {
      text +=
        '⚠️ Не удалось проверить карточек: ' +
        barberStats.errors +
        '\n';
    }

    text += '\n';
  });

  if (missingBarberNames.length) {
    text +=
      'Просьба заполнить описание стрижки ' +
      'в карточке клиента.';
  }
}
  if (sendToTelegram === false) {
  Logger.log(text);
  return;
}

sendNewClientNotesTelegram(
  telegramToken,
  barbersChatId,
  text
);
}
// ТЕСТ — проверка карточек за вчера без отправки в Telegram
function testYesterdayNewClientNotes() {
  var now = new Date();

  var startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 1);
  startDate.setHours(0, 0, 0, 0);

  var endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  sendNewClientNotesForPeriod(
    startDate,
    endDate,
    'ТЕСТ ЗА ВЧЕРА',
    true,
    true,
    false // не отправлять в Telegram
  );
}
// ОТПРАВКА В TELEGRAM
// Длинный отчёт автоматически делится на части
function sendNewClientNotesTelegram(
  telegramToken,
  chatId,
  text
) {
  var telegramUrl =
    'https://api.telegram.org/bot' +
    String(telegramToken).trim() +
    '/sendMessage';

  var maxLength = 3800;
  var lines = String(text).split('\n');

  var messages = [];
  var current = '';

  lines.forEach(function(line) {
    var nextLine = line + '\n';

    if (
      current.length +
      nextLine.length >
      maxLength
    ) {
      if (current.trim()) {
        messages.push(current.trim());
      }

      current = nextLine;
    } else {
      current += nextLine;
    }
  });

  if (current.trim()) {
    messages.push(current.trim());
  }

  messages.forEach(function(message, index) {
    if (messages.length > 1) {
      message =
        'Часть ' +
        (index + 1) +
        ' из ' +
        messages.length +
        '\n\n' +
        message;
    }

    var response = UrlFetchApp.fetch(
      telegramUrl,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: chatId,
          text: message
        }),
        muteHttpExceptions: true
      }
    );

    Logger.log(
      'Отчёт по карточкам, часть ' +
      (index + 1) +
      ': HTTP ' +
      response.getResponseCode() +
      ' ' +
      response.getContentText()
    );
  });
}
function isBarberComment(text) {
  if (!text) {
    return false;
  }

  var normalized = String(text)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return false;
  }

  /*
   * Слова и части слов, характерные для описания
   * стрижки, бороды, укладки и будущих пожеланий.
   *
   * Используются основы слов, чтобы распознавались:
   * "отращиваем", "отращивать", "завивке",
   * "уложил", "укладывать" и т. д.
   */
  var barberWords = [
    'стриж',
    'бород',
    'усов',
    'усы',
    'камуфляж',
    'цезар',
    'кроп',
    'фейд',
    'fade',
    'андеркат',
    'полубокс',
    'бокс',
    'канадк',
    'теннис',
    'классик',
    'маллет',
    'помпадур',
    'квифф',

    'висок',
    'виски',
    'затыл',
    'челк',
    'макуш',
    'бок',
    'верх',
    'контур',
    'окантов',
    'пробор',

    'насадк',
    'машинк',
    'ножниц',
    'шавет',
    'бритв',
    'шейвер',

    'длин',
    'корот',
    'удлин',
    'отращ',
    'волос',

    'завив',
    'уклад',
    'улож',
    'крем',
    'паст',
    'помад',
    'глин',
    'пудр',
    'воск',
    'спрей',

    'текстур',
    'градуиров',
    'филиров',
    'переход',
    'сведение',
    'свел',
    'сводил',

    'сделать в след',
    'в следующий раз',
    'следующий раз'
  ];

  var foundWords = barberWords.filter(function(word) {
    return normalized.indexOf(word) !== -1;
  });

  /*
   * Распознаёт обозначения длины и переходов:
   *
   * 6 мм
   * 4,5 мм
   * 4.5 мм
   * 4,5-0
   * 4.5–0
   * 5+6
   * 5 / 6
   * 50/50
   * насадка 3
   */
  var hasLength =
    /\b\d+(?:[.,]\d+)?\s*(?:мм|см)\b/i.test(normalized) ||

    /\b\d+(?:[.,]\d+)?\s*[-–—+\/]\s*\d+(?:[.,]\d+)?\b/i.test(
      normalized
    ) ||

    /\b(?:насадк\w*|нож)\s*№?\s*\d+(?:[.,]\d+)?\b/i.test(
      normalized
    );

  return foundWords.length >= 1 || hasLength;
}
    
// ════════════════════════════════════════════════════════
// BRIXTON — ИСТОЧНИКИ ПРИВЛЕЧЕНИЯ (Взгляд 1: Привлечение)
// Аддитивный блок. Читает данные, которые computeMetrics уже загрузил.
// Ничего в основном расчёте не меняет.
// ════════════════════════════════════════════════════════

// Достаём канал привлечения из карточки клиента (текст из твоего списка в Yclients)
function normSource(client){
  var cf = client && client.custom_fields;
  var v = null;
  if(cf){
    v = (cf.AcquisitionChannel != null) ? cf.AcquisitionChannel
      : (cf.acquisitionChannel != null) ? cf.acquisitionChannel
      : null;
  }
  v = (v == null ? '' : String(v)).trim();
  return v || 'Не указан';
}

function computeSources(mastersData, globalPreClients, currentStart, currentEnd){
  var byBranch = {};

  mastersData.forEach(function(md){
    var branch = md.company.name;
    var masterName = (md.master && md.master.name) ? md.master.name : '—';
    if(!byBranch[branch]) byBranch[branch] = {};
    var acc = byBranch[branch];

    (md.recordsCurr || []).forEach(function(r){
      if(!r.client || !r.client.id) return;
      var cd = r.create_date ? parseRecordDate(r.create_date) : null;
      if(!cd || cd < currentStart || cd > currentEnd) return;
      var id = r.client.id;
      if(!acc[id]){
        acc[id] = {source: normSource(r.client), firstCreate: cd, attended:false,
                   fvDate:null, fvRev:0, monthRev:0, leadMaster: masterName, fvMaster:null,
                   name:(r.client.name||''), phone:(r.client.phone||''),
                   visitDate:(r.date?String(r.date).substring(0,10):'')};
      } else if(cd < acc[id].firstCreate){
        acc[id].firstCreate = cd;
        acc[id].source = normSource(r.client);
        acc[id].leadMaster = masterName;
      }
    });

    (md.attendedCurr || []).forEach(function(r){
      if(!r.client || !r.client.id) return;
      var d = parseRecordDate(r.date);
      if(d < currentStart || d > currentEnd) return;
      var id = r.client.id;
      if(!acc[id]) return;
      var rev = 0;
      (r.services || []).forEach(function(s){ rev += (s.cost || 0); });
      acc[id].attended = true;
      acc[id].monthRev += rev;
      if(!acc[id].fvDate || d < acc[id].fvDate){
        acc[id].fvDate = d; acc[id].fvRev = rev; acc[id].fvMaster = masterName;
      }
    });
  });

  var out = { _byMaster:{}, _noSource:[], _masters:{} };

  Object.keys(byBranch).forEach(function(branch){
    var acc = byBranch[branch];
    var agg = {};
    var aggM = {};
    var mastersSet = {};

    Object.keys(acc).forEach(function(id){
      var c = acc[id];
      var nid = Number(id);
      var isNew = !(globalPreClients.has(nid) || globalPreClients.has(id));
      if(!isNew) return;

      var s = c.source;
      var master = c.fvMaster || c.leadMaster || '—';

      if(s === 'Не указан'){
        out._noSource.push({name:c.name||'', phone:c.phone||'', date:c.visitDate||'', branch:branch, master:master});
      }

      if(!agg[s]) agg[s] = {name:s, leads:0, clients:0, revenue:0, fcSum:0, fcN:0};
      agg[s].leads++;
      if(c.attended){ agg[s].clients++; agg[s].revenue += c.monthRev; agg[s].fcSum += c.fvRev; agg[s].fcN++; }

      mastersSet[master] = true;
      if(!aggM[master]) aggM[master] = {};
      if(!aggM[master][s]) aggM[master][s] = {name:s, leads:0, clients:0, revenue:0, fcSum:0, fcN:0};
      aggM[master][s].leads++;
      if(c.attended){ aggM[master][s].clients++; aggM[master][s].revenue += c.monthRev; aggM[master][s].fcSum += c.fvRev; aggM[master][s].fcN++; }
    });

    function toRows(aggObj){
      return Object.keys(aggObj).map(function(s){
        var a = aggObj[s];
        return {name:a.name, leads:a.leads, clients:a.clients,
                revenue:Math.round(a.revenue), first_check:a.fcN?Math.round(a.fcSum/a.fcN):0};
      }).sort(function(x,y){ return y.leads - x.leads; });
    }

    out[branch] = toRows(agg);
    out._byMaster[branch] = {};
    Object.keys(aggM).forEach(function(m){ out._byMaster[branch][m] = toRows(aggM[m]); });
    out._masters[branch] = Object.keys(mastersSet).sort();
  });

  return out;
}
function DIAG_NO_SOURCE(){
  const partnerToken = getYclientsPartnerToken_();
  const userToken = getYclientsUserToken_();
  const headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };
  const companies = [{id:694866,name:'Менделеева'},{id:1076318,name:'Энтузиастов'}];
  const currentStart = new Date(2026, 6, 1);          // июль 2026
  const currentEnd   = new Date(2026, 6, 31, 23,59);
  const lookbackStart= new Date(2022, 4, 1);
  const lookbackEnd  = addDays(currentStart, -1);
  const fetchEnd     = addDays(new Date(), 45);

  // кто уже был в сети раньше июля
  const pre = new Set();
  const staffAll = {};
  companies.forEach(c=>{
    const sr = UrlFetchApp.fetch('https://api.yclients.com/api/v1/company/'+c.id+'/staff/?fired=1',{method:'get',headers,muteHttpExceptions:true});
    const masters = JSON.parse(sr.getContentText()).data;
    staffAll[c.id]=masters;
    masters.forEach(m=>{
      fetchAllRecords(c.id,m.id,lookbackStart,lookbackEnd,headers)
        .filter(r=>r.attendance===1 && r.client && r.client.id)
        .forEach(r=>pre.add(r.client.id));
      Utilities.sleep(120);
    });
  });

  // новые клиенты июля без источника
  const seen = new Set();
  let n=0;
  companies.forEach(c=>{
    staffAll[c.id].forEach(m=>{
      fetchAllRecords(c.id,m.id,currentStart,fetchEnd,headers).forEach(r=>{
        if(!r.client||!r.client.id) return;
        const cd = r.create_date ? parseRecordDate(r.create_date) : null;
        if(!cd || cd<currentStart || cd>currentEnd) return;   // первая запись не в июле
        const id=r.client.id;
        if(seen.has(id)) return; seen.add(id);
        if(pre.has(id)) return;                                // не новый
        const cf=r.client.custom_fields;
        const src=(cf&&(cf.AcquisitionChannel||cf.acquisitionChannel)||'').toString().trim();
        if(src) return;                                        // источник есть — пропускаем
        n++;
        Logger.log(n+') '+c.name+' | '+ (r.date? r.date.substring(0,10):'—') +' | '+ (r.client.name||'—') +' | '+ (r.client.phone||'—') +' | id:'+id);
      });
      Utilities.sleep(120);
    });
  });
  Logger.log('=== ВСЕГО без источника (новых, июль): '+n+' ===');
}
// ════════════════════════════════════════════════════════
// BRIXTON — ВЗГЛЯД 2: КОГОРТЫ (LTV, возврат, статусы)
// Отдельная функция. Основной расчёт не трогает.
// Тяжёлая (проходит всю историю) — запускать отдельно, как «Все месяцы».
// Пишет результат в store.cohorts (Supabase).
// ════════════════════════════════════════════════════════

function acqSource_(client){
  var cf = client && client.custom_fields;
  var v = cf ? (cf.AcquisitionChannel != null ? cf.AcquisitionChannel
             : cf.acquisitionChannel != null ? cf.acquisitionChannel : null) : null;
  v = (v == null ? '' : String(v)).trim();
  return v || 'Не указан';
}

function recalcCohorts(){
  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();
  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };
  var companies = [{id:694866, name:'Менделеева'}, {id:1076318, name:'Энтузиастов'}];
  var histStart = new Date(2022, 4, 1);              // май 2022
  var fetchEnd  = addDays(new Date(), 45);
  var today     = new Date();
  var DAY = 86400000;

  // 1) Собираем сетевую историю по каждому клиенту (по обоим филиалам)
  var byClient = {}; // clientId -> {visits:[{d,rev,branch,master}], source}
  companies.forEach(function(c){
    var recs = fetchAllRecords(c.id, 0, histStart, fetchEnd, headers); // staff_id=0 = все мастера
    recs.forEach(function(r){
      if(r.attendance !== 1) return;                 // только состоявшиеся визиты
      if(!r.client || !r.client.id) return;
      var d = parseRecordDate(r.date);
      if(d > today) return;                          // будущие визиты не считаем
      var id = r.client.id;
      var rev = 0; (r.services||[]).forEach(function(s){ rev += (s.cost||0); });
      var master = (r.staff && r.staff.name) ? r.staff.name : '—';
      if(!byClient[id]) byClient[id] = {visits:[], source: acqSource_(r.client)};
      byClient[id].visits.push({d:d, rev:rev, branch:c.name, master:master});
    });
    Utilities.sleep(200);
  });

  // 2) Когорты: attractionMonth = месяц первого визита; филиал/мастер/источник — по первому визиту
  //    cohorts[branch][monthKey][source][masterOrAll] = аккумулятор
  var cohorts = {};
  function bucket(branch, mk, source, master){
    if(!cohorts[branch]) cohorts[branch] = {};
    if(!cohorts[branch][mk]) cohorts[branch][mk] = {};
    if(!cohorts[branch][mk][source]) cohorts[branch][mk][source] = {};
    if(!cohorts[branch][mk][source][master])
      cohorts[branch][mk][source][master] = {clients:0, ret2:0, ret3:0, ret4:0, ret5:0, visitsSum:0, ltvSum:0, green:0, yellow:0, red:0};
    return cohorts[branch][mk][source][master];
  }

  Object.keys(byClient).forEach(function(id){
    var c = byClient[id];
    c.visits.sort(function(a,b){ return a.d - b.d; });
    var first = c.visits[0];
    var n = c.visits.length;
    var totalRev = 0; c.visits.forEach(function(v){ totalRev += v.rev; });
    var last = c.visits[n-1].d;
    var branch = first.branch, master = first.master, source = c.source;
    var mk = MONTH_KEYS_EN[first.d.getMonth()] + '_' + first.d.getFullYear();

    // личный интервал (среднее между визитами), минимум 14 дней
    var interval = 45;
    if(n >= 2){
      var gaps = 0;
      for(var i=1;i<n;i++){ gaps += (c.visits[i].d - c.visits[i-1].d)/DAY; }
      interval = gaps/(n-1);
    }
    if(interval < 14) interval = 14;
    var daysSinceLast = (today - last)/DAY;
    var status = daysSinceLast <= 1.5*interval ? 'green'
               : daysSinceLast <= 3*interval   ? 'yellow' : 'red';

    // кладём в общий (__all__) и в мастера
    [ '__all__', master ].forEach(function(mm){
      var a = bucket(branch, mk, source, mm);
      a.clients++;
      if(n >= 2) a.ret2++;
      if(n >= 3) a.ret3++;
      if(n >= 4) a.ret4++;
      if(n >= 5) a.ret5++;
      a.visitsSum += n;
      a.ltvSum += totalRev;
      a[status]++;
    });
  });

  // 3) Финализируем в проценты/средние
  var out = { updated: fmt(today), byBranch: {} };
  Object.keys(cohorts).forEach(function(branch){
    out.byBranch[branch] = {};
    Object.keys(cohorts[branch]).forEach(function(mk){
      out.byBranch[branch][mk] = {};
      Object.keys(cohorts[branch][mk]).forEach(function(source){
        out.byBranch[branch][mk][source] = {};
        Object.keys(cohorts[branch][mk][source]).forEach(function(mm){
          var a = cohorts[branch][mk][source][mm];
          out.byBranch[branch][mk][source][mm] = {
            clients: a.clients,
            ret2n: a.ret2, ret3n: a.ret3, ret4n: a.ret4, ret5n: a.ret5,
            visitsSum: a.visitsSum,
            ltvSum: Math.round(a.ltvSum),
            green: a.green, yellow: a.yellow, red: a.red
          };
        });
      });
    });
  });

  // 4) Пишем в Supabase (тем же способом, что и месяцы)
  var getResp = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=data', {
    method:'get', headers:{'apikey':getSupabaseServiceRole_(),'Authorization':'Bearer '+getSupabaseServiceRole_()}, muteHttpExceptions:true
  });
  var fullData = JSON.parse(getResp.getContentText())[0].data;
  fullData.cohorts = out;
  UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main', {
    method:'patch',
    headers:{'apikey':getSupabaseServiceRole_(),'Authorization':'Bearer '+getSupabaseServiceRole_(),'Content-Type':'application/json'},
    payload: JSON.stringify({ data: fullData }), muteHttpExceptions:true
  });
  Logger.log('Когорты записаны. Клиентов обработано: ' + Object.keys(byClient).length);
}
function DIAG_2GIS_MARCH(){
  var partnerToken=getYclientsPartnerToken_(), userToken=getYclientsUserToken_();
  var headers={'Accept':'application/vnd.yclients.v2+json','Authorization':'Bearer '+partnerToken+', User '+userToken};
  var companies=[{id:694866,name:'Менделеева'},{id:1076318,name:'Энтузиастов'}];
  var mStart=new Date(2026,2,1), mEnd=new Date(2026,2,31,23,59);
  var histStart=new Date(2022,4,1), fetchEnd=addDays(new Date(),45);

  // все, кто был в сети ДО марта
  var pre=new Set();
  companies.forEach(function(c){
    fetchAllRecords(c.id,0,histStart,addDays(mStart,-1),headers).forEach(function(r){
      if(r.attendance===1 && r.client && r.client.id) pre.add(r.client.id);
    });
  });

  // записи марта с источником 2GIS
  var seen={}, n=0, newCnt=0, oldCnt=0;
  companies.forEach(function(c){
    fetchAllRecords(c.id,0,mStart,fetchEnd,headers).forEach(function(r){
      if(!r.client||!r.client.id) return;
      var cf=r.client.custom_fields, src=(cf&&(cf.AcquisitionChannel||cf.acquisitionChannel)||'').toString();
      if(src.indexOf('2GIS')<0 && src.indexOf('2ГИС')<0) return;
      var cd=r.create_date?parseRecordDate(r.create_date):null;
      if(!cd||cd<mStart||cd>mEnd) return;
      var id=r.client.id; if(seen[id]) return; seen[id]=1;
      n++;
      var isNew=!pre.has(id);
      if(isNew) newCnt++; else oldCnt++;
      Logger.log(n+') '+(r.client.name||'—')+' | '+(r.client.phone||'—')+' | '+(isNew?'НОВЫЙ':'был раньше')+' | запись создана '+String(r.create_date).substring(0,10));
    });
  });
  Logger.log('=== ВСЕГО с 2GIS в марте: '+n+' | НОВЫХ: '+newCnt+' | уже были раньше: '+oldCnt+' ===');
}
function diagFreeSlots() {
  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();
  var headers = {
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken,
    'Accept': 'application/vnd.yclients.v2+json',
    'Content-Type': 'application/json'
  };
  var companyId = 694866; // Менделеева

  function getJson(url) {
    var res = UrlFetchApp.fetch(url, { method: 'get', headers: headers, muteHttpExceptions: true });
    var code = res.getResponseCode();
    var body = res.getContentText();
    Logger.log('GET ' + url + ' -> HTTP ' + code);
    try {
      return JSON.parse(body);
    } catch (e) {
      Logger.log('  parse error, body: ' + body.slice(0, 500));
      return null;
    }
  }

  // 1) Мастера, доступные для онлайн-записи
  var staffResp = getJson('https://api.yclients.com/api/v1/book_staff/' + companyId);
  var staff = (staffResp && staffResp.data) ? staffResp.data : [];
  Logger.log('=== Мастеров (book_staff): ' + staff.length);
  staff.slice(0, 6).forEach(function (s) {
    Logger.log('  id=' + s.id + ' | ' + s.name +
      ' | avatar=' + (s.avatar_big || s.avatar || 'нет') +
      ' | services=' + JSON.stringify(s.service_ids));
  });

  if (!staff.length) { Logger.log('Нет мастеров — стоп'); return; }
  var first = staff[0];

  // 2) Услуги первого мастера
  var servResp = getJson('https://api.yclients.com/api/v1/book_services/' + companyId + '?staff_id=' + first.id);
  var services = (servResp && servResp.data && servResp.data.services) ? servResp.data.services : [];
  Logger.log('=== Услуг у "' + first.name + '": ' + services.length);
  services.slice(0, 8).forEach(function (sv) {
    Logger.log('  serviceId=' + sv.id + ' | ' + sv.title +
      ' | ' + Math.round((sv.seance_length || 0) / 60) + ' мин' +
      ' | цена ' + sv.price_min + '-' + sv.price_max);
  });

  // 3) Свободные слоты первого мастера на сегодня
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var svcId = services.length ? services[0].id : '';
  var timesUrl = 'https://api.yclients.com/api/v1/book_times/' + companyId + '/' + first.id + '/' + today +
    (svcId ? ('?service_ids[]=' + svcId) : '');
  var timesResp = getJson(timesUrl);
  var times = (timesResp && timesResp.data) ? timesResp.data : [];
  Logger.log('=== Свободных слотов у "' + first.name + '" на ' + today + ': ' + times.length);
  Logger.log('  ' + JSON.stringify(times.slice(0, 12)));
}
function buildFreeSlots() {
  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();
  var yHeaders = {
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken,
    'Accept': 'application/vnd.yclients.v2+json',
    'Content-Type': 'application/json'
  };

  var BRANCHES = [
    { id: 694866, name: 'Менделеева' },
    { id: 1076318, name: 'Энтузиастов' }
  ];

  var tz = Session.getScriptTimeZone();
  var d0 = new Date();
  var d1 = new Date(d0.getTime() + 24 * 3600 * 1000);
  var dates = [
    Utilities.formatDate(d0, tz, 'yyyy-MM-dd'),
    Utilities.formatDate(d1, tz, 'yyyy-MM-dd')
  ];

  function yGet(url) {
    var res = UrlFetchApp.fetch(url, { method: 'get', headers: yHeaders, muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) {
      Logger.log('  ! HTTP ' + res.getResponseCode() + ' ' + url);
      return null;
    }
    try { return JSON.parse(res.getContentText()); } catch (e) { return null; }
  }

  function pickHaircut(services) {
    if (!services || !services.length) return null;
    function norm(t) { return (t || '').toLowerCase().trim(); }
    var exact = services.filter(function (s) { return norm(s.title) === 'стрижка мужская'; });
    if (exact.length) return exact[0];
    var starts = services.filter(function (s) { return norm(s.title).indexOf('стрижка мужская') === 0; });
    if (starts.length) return starts[0];
    var manly = services.filter(function (s) {
      var n = norm(s.title);
      return n.indexOf('стрижк') !== -1 && n.indexOf('мужск') !== -1;
    });
    if (manly.length) return manly[0];
    var anyCut = services.filter(function (s) {
      var n = norm(s.title);
      return n.indexOf('стрижк') === 0 && n.indexOf('детск') === -1 && n.indexOf('борода') === -1 && n.indexOf('машинк') === -1;
    });
    if (anyCut.length) return anyCut[0];
    return null;
  }

  var out = { generatedAt: new Date().toISOString(), dates: dates, branches: {} };

  BRANCHES.forEach(function (br) {
    Logger.log('=== Филиал ' + br.name + ' (' + br.id + ')');
    var staffResp = yGet('https://api.yclients.com/api/v1/book_staff/' + br.id);
    var staff = (staffResp && staffResp.data) ? staffResp.data : [];
    var masters = [];

    staff.forEach(function (s) {
      var nm = (s.name || '').toLowerCase();
      if (nm.indexOf('лист ожидания') !== -1 || nm.indexOf('ожидан') !== -1 || nm.indexOf('админ') !== -1) {
        Logger.log('  - ' + s.name + ': системный, пропуск');
        return;
      }
      var servResp = yGet('https://api.yclients.com/api/v1/book_services/' + br.id + '?staff_id=' + s.id);
      var services = (servResp && servResp.data && servResp.data.services) ? servResp.data.services : [];
      var svc = pickHaircut(services);
      if (!svc) { Logger.log('  - ' + s.name + ': нет мужской стрижки, пропуск'); return; }

      var slots = {};
      dates.forEach(function (dt) {
        var tResp = yGet('https://api.yclients.com/api/v1/book_times/' + br.id + '/' + s.id + '/' + dt + '?service_ids[]=' + svc.id);
        var times = (tResp && tResp.data) ? tResp.data : [];
        slots[dt] = times.map(function (t) { return t.time; });
      });

      var avatar = s.avatar_big || s.avatar || '';
      if (avatar.indexOf('no-master') !== -1) avatar = '';

      masters.push({
        id: s.id,
        name: s.name,
        avatar: avatar,
        serviceTitle: svc.title,
        serviceMin: Math.round((svc.seance_length || 0) / 60),
        slots: slots
      });

      Logger.log('  - ' + s.name + ' | ' + svc.title + ' ' + Math.round((svc.seance_length || 0) / 60) + 'м | ' +
        dates[0] + ':' + slots[dates[0]].length + ' | ' + dates[1] + ':' + slots[dates[1]].length);
    });

    out.branches[br.id] = { name: br.name, masters: masters };
  });

  var base = SUPABASE_URL + '/rest/v1/brixton_store';
  var sHeadersGet = {
    'apikey': getSupabaseServiceRole_(),
    'Authorization': 'Bearer ' + getSupabaseServiceRole_(),
    'Content-Type': 'application/json'
  };
  var sHeadersPatch = {
    'apikey': getSupabaseServiceRole_(),
    'Authorization': 'Bearer ' + getSupabaseServiceRole_(),
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  var getRes = UrlFetchApp.fetch(base + '?id=eq.main&select=data', { method: 'get', headers: sHeadersGet, muteHttpExceptions: true });
  var rows = JSON.parse(getRes.getContentText());
  var store = (rows && rows[0] && rows[0].data) ? rows[0].data : {};
  store.freeSlots = out;

  var patchRes = UrlFetchApp.fetch(base + '?id=eq.main', {
    method: 'patch',
    headers: sHeadersPatch,
    payload: JSON.stringify({ data: store }),
    muteHttpExceptions: true
  });
  Logger.log('=== Supabase PATCH -> HTTP ' + patchRes.getResponseCode());
  Logger.log('=== Готово. Филиалов записано: ' + Object.keys(out.branches).length + ', даты: ' + dates.join(', '));
}
function tgReminder(day) {
  var token   = getTelegramBotToken_();
  var site    = 'https://ruslan00711.github.io/Brixton1/stories.html';
  var chatId  = '-1003583832196';                 // чат «BRIXTON | Админы»

  // филиал -> тема (topic)
  var BR = [
    { id: '694866',  name: 'Менделеева',  thread: 2 },
    { id: '1076318', name: 'Энтузиастов', thread: 4 }
  ];

  try { buildFreeSlots(); } catch (e) { Logger.log('buildFreeSlots error: ' + e); }

  var isTom = (day === 'tomorrow');
  var when  = isTom ? 'на ЗАВТРА' : 'на СЕГОДНЯ';
  var dayQ  = isTom ? 'tomorrow' : 'today';

  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
  BR.forEach(function (b) {
    var link = site + '?branch=' + b.id + '&day=' + dayQ;
    var text =
      '✂️ ' + b.name + ' — выложите статус со свободными окнами ' + when + '.\n\n' +
      '1. Откройте страницу (филиал и день уже выбраны)\n' +
      '2. Скачайте картинку\n' +
      '3. Выложите в статус\n\n' + link;

    var res = UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: chatId,
        message_thread_id: b.thread,
        text: text,
        disable_web_page_preview: true
      }),
      muteHttpExceptions: true
    });
    Logger.log(b.name + ' -> HTTP ' + res.getResponseCode() + ' ' + res.getContentText());
  });
}

function tgReminderToday()    { tgReminder('today'); }
function tgReminderTomorrow() { tgReminder('tomorrow'); }
function checkTimezone() {
  Logger.log('Часовой пояс проекта: ' + Session.getScriptTimeZone());
  Logger.log('Текущее время в проекте: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'));
}
function tgScheduler() {
  var tz = Session.getScriptTimeZone();
  var d = new Date();
  var mins = parseInt(Utilities.formatDate(d, tz, 'HH'),10)*60 + parseInt(Utilities.formatDate(d, tz, 'mm'),10);
  var today = Utilities.formatDate(d, tz, 'yyyy-MM-dd');

  var MORNING = 9*60 + 45;   // 09:45 -> сегодня
  var EVENING = 18*60 + 0;   // 18:00 -> завтра
  var WINDOW  = 5;           // ловим разброс триггера ±5 минут

  var props = PropertiesService.getScriptProperties();
  function fireOnce(tag, day){
    var key = 'sent_' + tag + '_' + today;
    if (props.getProperty(key)) return;   // сегодня уже слали — стоп
    tgReminder(day);
    props.setProperty(key, '1');
  }

  if (Math.abs(mins - MORNING) < WINDOW) fireOnce('morning', 'today');
  if (Math.abs(mins - EVENING) < WINDOW) fireOnce('evening', 'tomorrow');
  // отчёт по мастерам для доски один раз в 21:00
  var REPORT = 21 * 60;

  if (Math.abs(mins - REPORT) < WINDOW) {
    var props2 = PropertiesService.getScriptProperties();
    var todayR = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    var reportKey = 'master_report_' + todayR;

    if (!props2.getProperty(reportKey)) {
      sendMasterReport();
      props2.setProperty(reportKey, '1');
    }
  }
// вечерняя сводка в 21:30
var SUMMARY = 21 * 60 + 30;

if (mins >= SUMMARY) {
  var props3 = PropertiesService.getScriptProperties();
  var todayS = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var sumKey = 'summary_' + todayS;

  if (!props3.getProperty(sumKey)) {
    sendDailySummary();
    props3.setProperty(sumKey, '1');
  }
}
  // опрос "кто на смене" в 9:30
  var SHIFT = 9*60 + 30;
  if (Math.abs(mins - SHIFT) < WINDOW) {
    var props2 = PropertiesService.getScriptProperties();
    var today2 = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    var shKey = 'shift_asked_' + today2;
    if (!props2.getProperty(shKey)) {
      askShift();
      props2.setProperty(shKey, '1');
    }
  }
  // Проверка незаполненных карточек новых клиентов в 21:15
  var NOTES_REPORT = 21 * 60 + 15;

  if (mins >= NOTES_REPORT) {
    var notesKey = 'new_client_notes_' + today;

    if (!props.getProperty(notesKey)) {
      // Если функция завершится с ошибкой,
      // отметка не поставится и scheduler попробует снова
      sendNewClientNotesReport();

      props.setProperty(notesKey, '1');
    }
  }
    // Недельный отчёт по карточкам — по воскресеньям после 22:00
  var WEEKLY_REPORT = 22 * 60;
  var dayOfWeek = parseInt(
    Utilities.formatDate(d, tz, 'u'),
    10
  ); // 1 = понедельник, 7 = воскресенье

  if (
    dayOfWeek === 7 &&
    mins >= WEEKLY_REPORT
  ) {
    var weeklyKey =
      'new_client_notes_weekly_' + today;

    if (!props.getProperty(weeklyKey)) {
      sendNewClientNotesWeeklyReport();
      props.setProperty(weeklyKey, '1');
    }
  }

  // Месячный отчёт — в последний день месяца после 21:45
  var MONTHLY_REPORT = 21 * 60 + 45;

  var tomorrow = new Date(d);
  tomorrow.setDate(tomorrow.getDate() + 1);

  var isLastDayOfMonth =
    tomorrow.getMonth() !== d.getMonth();

  if (
    isLastDayOfMonth &&
    mins >= MONTHLY_REPORT
  ) {
    var monthlyKey =
      'new_client_notes_monthly_' + today;

    if (!props.getProperty(monthlyKey)) {
      sendNewClientNotesMonthlyReport();
      props.setProperty(monthlyKey, '1');
    }
  }
  if (mins >= 23 * 60 || mins < 9 * 60) {
    return;
  }
  sendDueTasks();
analyzeSchedule();
}
// ════════════════════════════════════════════════════════
// НОВЫЕ ОНЛАЙН-ЗАПИСИ В ЛИСТ ОЖИДАНИЯ
// Проверяется каждые 5 минут через tgScheduler()
// ════════════════════════════════════════════════════════

function checkNewWaitlistRecords() {
  var token  = getTelegramBotToken_();
  var chatId = '-1003583832196';

  // Рабочие админские ветки, НЕ ветки обычных задач
  var BRANCHES = {
    '694866': {
      name: 'Менделеева',
      waitlistStaffId: 3552371,
      thread: 2
    },
    '1076318': {
      name: 'Энтузиастов',
      waitlistStaffId: 3525900,
      thread: 4
    }
  };

  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();

  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };

  var tz = Session.getScriptTimeZone();
  var now = new Date();

  // Берём записи, созданные сегодня и вчера.
  // Запись клиента может быть назначена на любую будущую дату.
  var start = addDays(new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ), -1);

  var end = addDays(new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ), 60);

  var today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  var props = PropertiesService.getScriptProperties();

  Object.keys(BRANCHES).forEach(function(companyId) {
    var branch = BRANCHES[companyId];

    try {
      var records = fetchAllRecords(
        parseInt(companyId, 10),
        branch.waitlistStaffId,
        start,
        end,
        headers
      ) || [];

      // Оставляем только записи с клиентом
      records = records.filter(function(r) {
        return r && r.id && r.client;
      });

      var propKey = 'waitlist_seen_' + companyId;
      var stored = props.getProperty(propKey);
      var seen = stored ? JSON.parse(stored) : {};

      // При первом запуске только запоминаем существующие записи.
      // Ничего старого в Telegram не отправляем.
      if (!stored) {
        records.forEach(function(r) {
          seen[String(r.id)] = 1;
        });

        props.setProperty(propKey, JSON.stringify(seen));

        Logger.log(
          branch.name +
          ': первичная инициализация листа ожидания, запомнено записей: ' +
          records.length
        );

        return;
      }

      records
        .sort(function(a, b) {
          return String(a.create_date || '').localeCompare(
            String(b.create_date || '')
          );
        })
        .forEach(function(r) {
          var recordId = String(r.id);

          if (seen[recordId]) return;

          // Только онлайн-записи клиента.
          // Запись, созданная сотрудником вручную, не отправляется.
          var isOnline = (
            r.online === true ||
            r.online === 1 ||
            r.online === '1'
          );

          if (!isOnline) {
            seen[recordId] = 1;
            return;
          }

          var client = r.client || {};
          var clientName = (
            (client.name || '') + ' ' + (client.surname || '')
          ).trim() || 'Имя не указано';

          var phone = client.phone || 'Телефон не указан';

          var recordDate = String(
            r.datetime || r.date || ''
          );

          var dateText = recordDate
            ? recordDate.substring(8, 10) + '.' +
              recordDate.substring(5, 7) + '.' +
              recordDate.substring(0, 4)
            : 'не указана';

          var timeText = recordDate.length >= 16
            ? recordDate.substring(11, 16)
            : '';

          var services = (r.services || [])
            .map(function(s) {
              return s.title || s.name || '';
            })
            .filter(Boolean)
            .join(', ');

          if (!services) services = 'Услуга не указана';

          var taskId = 'waitlist_' + recordId;

          var text =
            '🚨 ВНИМАНИЕ! КЛИЕНТ ЗАПИСАЛСЯ В ЛИСТ ОЖИДАНИЯ\n\n' +
            '📍 Филиал: ' + branch.name + '\n' +
            '👤 Клиент: ' + clientName + '\n' +
            '📞 Телефон: ' + phone + '\n' +
            '🗓 Желаемое время: ' + dateText +
              (timeText ? ' в ' + timeText : '') + '\n' +
            '✂️ Услуга: ' + services + '\n\n' +
            'Срочно позвонить клиенту и предложить свободные окна.';

          var response = UrlFetchApp.fetch(
            'https://api.telegram.org/bot' + token + '/sendMessage',
            {
              method: 'post',
              contentType: 'application/json',
              payload: JSON.stringify({
                chat_id: chatId,
                message_thread_id: branch.thread,
                text: text,
                reply_markup: {
                  inline_keyboard: [[
                    {
                      text: '◻️ Выполнить',
                      callback_data:
                        'done:' + taskId + ':' + companyId
                    }
                  ]]
                }
              }),
              muteHttpExceptions: true
            }
          );

          Logger.log(
            branch.name +
            ' | лист ожидания ' + recordId +
            ' -> HTTP ' + response.getResponseCode() +
            ' ' + response.getContentText()
          );

          if (response.getResponseCode() === 200) {
            seen[recordId] = 1;

            saveWaitlistTaskForSummary(
              today,
              companyId,
              taskId,
              text
            );
          }
        });

      // Ограничиваем размер истории:
      // оставляем последние 500 обработанных ID
      var seenIds = Object.keys(seen);

      if (seenIds.length > 500) {
        var shortened = {};

        seenIds
          .slice(seenIds.length - 500)
          .forEach(function(id) {
            shortened[id] = 1;
          });

        seen = shortened;
      }

      props.setProperty(propKey, JSON.stringify(seen));

    } catch (err) {
      Logger.log(
        'Ошибка проверки листа ожидания ' +
        branch.name + ': ' + err
      );
    }
  });
}


// Сохраняет событийную задачу,
// чтобы она попала в вечернюю статистику
function saveWaitlistTaskForSummary(
  today,
  companyId,
  taskId,
  fullText
) {
  var getRes = UrlFetchApp.fetch(
    SUPABASE_URL +
    '/rest/v1/brixton_store?id=eq.main&select=data',
    {
      method: 'get',
      headers: {
        apikey: getSupabaseServiceRole_(),
        Authorization: 'Bearer ' + getSupabaseServiceRole_()
      },
      muteHttpExceptions: true
    }
  );

  var rows = JSON.parse(getRes.getContentText());
  var store = (
    rows &&
    rows[0] &&
    rows[0].data
  ) ? rows[0].data : {};

  if (!store.taskSent) store.taskSent = {};
  if (!store.taskSent[today]) store.taskSent[today] = {};

  if (!store.eventTasks) store.eventTasks = {};
  if (!store.eventTasks[today]) store.eventTasks[today] = {};

  var sentKey = taskId + '_' + companyId;

  store.taskSent[today][sentKey] = 1;

  store.eventTasks[today][taskId] = {
    text: 'Обработать клиента из листа ожидания',
    time: Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'HH:mm'
    ),
    details: fullText
  };

  UrlFetchApp.fetch(
    SUPABASE_URL +
    '/rest/v1/brixton_store?id=eq.main',
    {
      method: 'patch',
      headers: {
        apikey: getSupabaseServiceRole_(),
        Authorization: 'Bearer ' + getSupabaseServiceRole_(),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      payload: JSON.stringify({ data: store }),
      muteHttpExceptions: true
    }
  );
}
function sendDueTasks() {
  var token  = getTelegramBotToken_();
  var chatId = '-1003583832196';
  var THREAD = { '694866': 8067, '1076318': 8066 };   // темы задач
  var BRNAME = { '694866': 'Менделеева', '1076318': 'Энтузиастов' };
  var WINDOW = 5; // минут: ловим время задачи в пределах запуска

  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var nowMin = now.getHours() * 60 + now.getMinutes();
  var today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  var wd = ['вс','пн','вт','ср','чт','пт','сб'][now.getDay()];
  var dayNum = now.getDate();
  var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  var isLast = (dayNum === lastDay);

  // читаем задачи из Supabase
  var getRes = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=tasks:data->tasks,taskSent:data->taskSent', {
    method: 'get',
    headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_() },
    muteHttpExceptions: true
  });
  var rows = JSON.parse(getRes.getContentText());
  var data = (rows && rows[0]) ? rows[0] : {};
  var tasks = Array.isArray(data.tasks) ? data.tasks : [];
  var sent = data.taskSent || {};        // { 'YYYY-MM-DD': ['taskId', ...] }
  if (!sent[today]) sent[today] = {};

  function dueToday(t) {
    if (t.sched === 'month') {
      var arr = t.dates || [];
      return arr.indexOf(dayNum) !== -1 || (isLast && arr.indexOf('last') !== -1);
    }
    return (t.days || []).indexOf(wd) !== -1;   // week
  }

  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
  var fired = 0;

  Logger.log('Сейчас: ' + Utilities.formatDate(now, tz, 'HH:mm') + ' (' + nowMin + ' мин), день=' + wd + ', число=' + dayNum + (isLast ? ' (последний)' : ''));
  Logger.log('Всего задач в облаке: ' + tasks.length);

  tasks.forEach(function (t) {
    Logger.log('— Задача: "' + t.text + '" | время=' + t.time + ' | active=' + t.active + ' | sched=' + t.sched + ' | days=' + JSON.stringify(t.days) + ' | dates=' + JSON.stringify(t.dates) + ' | branch=' + t.branch);
    if (!t.active) { Logger.log('   пропуск: выключена'); return; }
    if (!dueToday(t)) { Logger.log('   пропуск: сегодня не по расписанию'); return; }

    var parts = (t.time || '').split(':');
    var taskMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    Logger.log('   разница по времени: ' + Math.abs(nowMin - taskMin) + ' мин (окно ' + WINDOW + ')');
    if (Math.abs(nowMin - taskMin) >= WINDOW) { Logger.log('   пропуск: не попадает в окно'); return; }

    var branches = (t.branch === 'both') ? ['694866', '1076318'] : [t.branch];
    branches.forEach(function (bid) {
      var key = t.id + '_' + bid;
      if (sent[today][key]) return;          // уже слали сегодня
      var text = '📋 ЗАДАЧА · ' + t.time + '\n' + t.text;
      var res = UrlFetchApp.fetch(url, {
        method: 'post', contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: chatId,
          message_thread_id: THREAD[bid],
          text: text,
          reply_markup: {
            inline_keyboard: [[
              { text: '◻️ Выполнить', callback_data: 'done:' + t.id + ':' + bid }
            ]]
          }
        }),
        muteHttpExceptions: true
      });
      Logger.log(BRNAME[bid] + ' | ' + t.time + ' | ' + t.text + ' -> HTTP ' + res.getResponseCode());
      if (res.getResponseCode() === 200) { sent[today][key] = 1; fired++; }
    });
  });

  // сохраняем ТОЛЬКО taskSent — перечитав свежие данные, чтобы не затереть смену/отметки
  if (fired > 0) {
    var fresh = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=data', {
      method: 'get',
      headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_() },
      muteHttpExceptions: true
    });
    var freshRows = JSON.parse(fresh.getContentText());
    var freshData = (freshRows && freshRows[0] && freshRows[0].data) ? freshRows[0].data : {};
    freshData.taskSent = sent;   // обновляем только свой кусок

    UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main', {
      method: 'patch',
      headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      payload: JSON.stringify({ data: freshData }),
      muteHttpExceptions: true
    });
  }

  Logger.log('Отправлено задач: ' + fired);
}
function tgTestProd() {
  var token = getTelegramBotToken_();
  var chatId = '-1003583832196';
  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';

  [2, 4].forEach(function (thread) {
    var res = UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: chatId,
        message_thread_id: thread,
        text: '✅ Боевой бот BRIXTON на связи. Тема ' + thread
      }),
      muteHttpExceptions: true
    });
    Logger.log('thread ' + thread + ' -> HTTP ' + res.getResponseCode() + ' ' + res.getContentText());
  });
}
function doPost(e) {
  try {
    var update = JSON.parse(e.postData.contents);
if (['getOwnerData','saveOwnerSections','restoreOwnerData'].indexOf(update.action) !== -1) {
  requireOwnerToken_(update.ownerToken);
  if (e.postData.contents.length > 5500000) throw new Error('Слишком большой запрос');
  if (update.action === 'getOwnerData') {
    return jsonResponse_({success:true, data:getOwnerData_()});
  }
  if (update.action === 'saveOwnerSections') {
    saveOwnerSections_(update.sections, false);
    return jsonResponse_({success:true});
  }
  saveOwnerSections_(update.ownerData, true);
  return jsonResponse_({success:true});
}
if (['getAdminData','saveTasks','saveAdmins','saveAnnouncements','saveGoals'].indexOf(update.action) !== -1) {
  Logger.log('doPost административный action: ' + update.action);
  requireAdminToken_(update.adminToken);
  if (e.postData.contents.length > 500000) throw new Error('Слишком большой запрос');
  if (update.action === 'getAdminData') {
    return jsonResponse_({success:true, data:getAdminData_()});
  }
  var sections = validateAdminPayload_(update.action, update);
  saveAdminSections_(sections);
  return jsonResponse_({success:true, data:sections});
}
    Logger.log('doPost вызван: ' + (e.postData ? e.postData.contents.slice(0, 200) : 'нет данных'));
// ГРАФИК АДМИНИСТРАТОРОВ
if (update.action === 'saveAdminSchedule') {
  try {
    requireAdminToken_(update.adminToken);
  } catch (authError) {
    return jsonResponse_({success:false, error:'Доступ запрещён'});
  }
  var companyId = String(update.company_id || '');
  var month = String(update.month || '');
  var schedule = update.schedule || {};

  validateAdminScheduleRequest_(companyId, month);

  var cleanSchedule = {};

  Object.keys(schedule).forEach(function(day) {
    var dayNumber = Number(day);

    if (dayNumber < 1 || dayNumber > 31) return;

    var value = String(schedule[day] || '')
      .trim()
      .toUpperCase()
      .substring(0, 12);

    if (value) {
      cleanSchedule[String(dayNumber)] = value;
    }
  });

  saveAdminSchedule_(companyId, month, cleanSchedule);

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      data: cleanSchedule
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
    // нас интересуют только нажатия на кнопки (callback_query)
    if (update.callback_query) {
      var cq = update.callback_query;
      var token = getTelegramBotToken_();
      var data = cq.data || '';                 // напр. 'done:t1699...:694866'
      var user = cq.from || {};
      var userName = (user.first_name || '') + (user.last_name ? ' ' + user.last_name : '');
      var msg = cq.message || {};
      var chatId = msg.chat.id;
      var msgId = msg.message_id;
      if (data.indexOf('shiftreset:') === 0) {
        UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/answerCallbackQuery', {
          method: 'post', contentType: 'application/json',
          payload: JSON.stringify({ callback_query_id: cq.id, text: 'Смена сброшена' }), muteHttpExceptions: true
        });

        var rBranch = data.split(':')[1];
        var tzR = Session.getScriptTimeZone();
        var todayR = Utilities.formatDate(new Date(), tzR, 'yyyy-MM-dd');

        var grR = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.shifts&select=data', {
          method: 'get', headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_() }, muteHttpExceptions: true
        });
        var rrR = JSON.parse(grR.getContentText());
        var shiftsR = (rrR && rrR[0] && rrR[0].data) ? rrR[0].data : {};
        if (!shiftsR[todayR]) shiftsR[todayR] = {};
        shiftsR[todayR][rBranch] = [];

        UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.shifts', {
          method: 'patch',
          headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          payload: JSON.stringify({ data: shiftsR }), muteHttpExceptions: true
        });

        var namesR = getAdmins(rBranch);
        var kbR = namesR.map(function (nm, i) {
          return [{ text: nm, callback_data: 'shift:' + rBranch + ':' + i }];
        });
        kbR.push([{ text: '🔄 Сбросить смену', callback_data: 'shiftreset:' + rBranch }]);
        UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/editMessageText', {
          method: 'post', contentType: 'application/json',
          payload: JSON.stringify({
            chat_id: cq.message.chat.id, message_id: cq.message.message_id,
            text: '🌤 Кто сегодня на смене?\nНа смене: —', reply_markup: { inline_keyboard: kbR }
          }), muteHttpExceptions: true
        });

        return ContentService.createTextOutput('ok');
      }
if (data.indexOf('shift:') === 0) {
        // гасим "часики" (не критично к скорости)
        UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/answerCallbackQuery', {
          method: 'post', contentType: 'application/json',
          payload: JSON.stringify({ callback_query_id: cq.id }), muteHttpExceptions: true
        });

        try {
          var sp = data.split(':');
          var sBranch = sp[1];
          var sIndex = parseInt(sp[2], 10);

          var tz2 = Session.getScriptTimeZone();
          var today2 = Utilities.formatDate(new Date(), tz2, 'yyyy-MM-dd');

          // Дедуп по конкретному нажатию (пользователь+сообщение+кнопка) в пределах 8 сек.
          // Повтор того же нажатия внутри окна — игнор, чтобы toggle не сработал дважды.
          var cache = CacheService.getScriptCache();
          var pressKey = 'press_' + (cq.from ? cq.from.id : '0') + '_' + msgId + '_' + data;
          if (cache.get(pressKey)) {
            return ContentService.createTextOutput('dup');
          }
          cache.put(pressKey, '1', 8);

          var grS = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.shifts&select=data', {
            method: 'get', headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_() }, muteHttpExceptions: true
          });
          var rrS = JSON.parse(grS.getContentText());
          var shiftsData = (rrS && rrS[0] && rrS[0].data) ? rrS[0].data : {};

          var adminNames = getAdmins(sBranch);
          var pickedName = adminNames[sIndex] || ('#' + sIndex);
          Logger.log('SHIFT bid=' + sBranch + ' idx=' + sIndex + ' name="' + pickedName + '" admins=' + JSON.stringify(adminNames) + ' listBefore=' + JSON.stringify((shiftsData[today2] && shiftsData[today2][sBranch]) ? shiftsData[today2][sBranch] : []));

          if (!shiftsData[today2]) shiftsData[today2] = {};
          if (!shiftsData[today2][sBranch]) shiftsData[today2][sBranch] = [];
          var list = shiftsData[today2][sBranch];

          // только ДОБАВЛЯЕМ (снять нельзя) — это убивает баг с повторными webhook
          if (list.indexOf(pickedName) === -1) { list.push(pickedName); }

          UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.shifts', {
            method: 'patch',
            headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
            payload: JSON.stringify({ data: shiftsData }), muteHttpExceptions: true
          });

          var kb = adminNames.map(function (nm, i) {
            var mark = (list.indexOf(nm) !== -1) ? '✅ ' : '';
            return [{ text: mark + nm, callback_data: 'shift:' + sBranch + ':' + i }];
          });
          var newTxt = '🌤 Кто сегодня на смене?\nНа смене: ' + (list.length ? list.join(', ') : '—');
          UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/editMessageText', {
            method: 'post', contentType: 'application/json',
            payload: JSON.stringify({
              chat_id: cq.message.chat.id, message_id: cq.message.message_id,
              text: newTxt, reply_markup: { inline_keyboard: kb }
            }), muteHttpExceptions: true
          });
        } finally {
          // замок убран — операция "только добавить" безопасна к повторам
        }

        return ContentService.createTextOutput('ok');
      }
      if (data.indexOf('done:') === 0) {
        var parts = data.split(':');            // ['done', taskId, branch]
        var taskId = parts[1];
        var branch = parts[2];

        // записываем отметку в облако
        var tz = Session.getScriptTimeZone();
        var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
        var timeNow = Utilities.formatDate(new Date(), tz, 'HH:mm');

        var getRes = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=data', {
          method: 'get',
          headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_() },
          muteHttpExceptions: true
        });
        var rows = JSON.parse(getRes.getContentText());
        var store = (rows && rows[0] && rows[0].data) ? rows[0].data : {};
        if (!store.taskLog) store.taskLog = {};
        if (!store.taskLog[today]) store.taskLog[today] = {};
        var logKey = taskId + '_' + branch;

        var already = store.taskLog[today][logKey];

        if (!already) {
          store.taskLog[today][logKey] = { done: true, by: userName, at: timeNow };
          UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main', {
            method: 'patch',
            headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
            payload: JSON.stringify({ data: store }),
            muteHttpExceptions: true
          });

          // меняем текст сообщения: добавляем "✅ Выполнил ..."
          // убираем кнопку и дописываем кто выполнил
          var newText = (msg.text || '') + '\n\n✅ Выполнил: ' + userName + ' в ' + timeNow;
          UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/editMessageText', {
            method: 'post', contentType: 'application/json',
            payload: JSON.stringify({ chat_id: chatId, message_id: msgId, text: newText, reply_markup: { inline_keyboard: [] } }),
            muteHttpExceptions: true
          });
        }

        // отвечаем на нажатие (обязательно, иначе у кнопки крутится «часики»)
        var answer = already
          ? ('Уже отмечено: ' + (already.by || ''))
          : ('Готово! Отметил ' + userName);
        UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/answerCallbackQuery', {
          method: 'post', contentType: 'application/json',
          payload: JSON.stringify({ callback_query_id: cq.id, text: answer }),
          muteHttpExceptions: true
        });
      }
    }
    } catch (err) {
    Logger.log('doPost error: ' + err);

    if (
      typeof update !== 'undefined' &&
      (
        update.action === 'saveAdminSchedule' ||
        ['getOwnerData','saveOwnerSections','restoreOwnerData'].indexOf(update.action) !== -1 ||
        ['getAdminData','saveTasks','saveAdmins','saveAnnouncements','saveGoals'].indexOf(update.action) !== -1
      )
    ) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: update.action === 'saveAdminSchedule' ? String(err) : adminErrorMessage_(err)
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput('ok');
}
function askShift() {
  var token  = getTelegramBotToken_();
  var chatId = '-1003583832196';
  var THREAD = { '694866': 2, '1076318': 4 };
  var BRNAME = { '694866': 'Менделеева', '1076318': 'Энтузиастов' };

  var tz = Session.getScriptTimeZone();
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  // читаем админов из облака
  var getRes = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=admins:data->admins', {
    method: 'get', headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_() }, muteHttpExceptions: true
  });
  var rows = JSON.parse(getRes.getContentText());
  var admins = (rows && rows[0] && rows[0].admins) ? rows[0].admins : {};

  Object.keys(THREAD).forEach(function (bid) {
    var names = admins[bid] || [];
    if (!names.length) { Logger.log(BRNAME[bid] + ': нет админов в панели — пропуск'); return; }

    // кнопки: по одной на имя, callback = shift:branch:index
    var keyboard = names.map(function (name, i) {
      return [{ text: name, callback_data: 'shift:' + bid + ':' + i }];
    });
    keyboard.push([{ text: '🔄 Сбросить смену', callback_data: 'shiftreset:' + bid }]);

    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: chatId,
        message_thread_id: THREAD[bid],
        text: '🌤 Доброе утро! Кто сегодня на смене?\n\n👉 Нажми своё имя ОДИН раз и иди работать.\nГалочка может появиться не сразу (до пары минут) — это нормально, ждать и повторно нажимать не нужно.',
        reply_markup: { inline_keyboard: keyboard }
      }),
      muteHttpExceptions: true
    });
    Logger.log(BRNAME[bid] + ' -> HTTP ' + res.getResponseCode());
  });
}
function initShiftsRow() {
  var res = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store', {
    method: 'post',
    headers: {
      apikey: getSupabaseServiceRole_(),
      Authorization: 'Bearer ' + getSupabaseServiceRole_(),
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    payload: JSON.stringify({ id: 'shifts', data: {} }),
    muteHttpExceptions: true
  });
  Logger.log('initShiftsRow -> HTTP ' + res.getResponseCode() + ' ' + res.getContentText());
}
function getAdmins(branchId) {
  var select = 'admins:data->admins->' + branchId;
  var response = UrlFetchApp.fetch(
    SUPABASE_URL +
      '/rest/v1/brixton_store?id=eq.main&select=' +
      encodeURIComponent(select),
    {
      method: 'get',
      headers: {
        apikey: getSupabaseServiceRole_(),
        Authorization: 'Bearer ' + getSupabaseServiceRole_()
      },
      muteHttpExceptions: true
    }
  );
  var responseCode = response.getResponseCode();
  if (responseCode < 200 || responseCode >= 300) {
    throw new Error(
      'Ошибка загрузки из Supabase: ' +
      responseCode +
      ' — ' +
      response.getContentText()
    );
  }
  var rows = JSON.parse(response.getContentText());
  return rows.length && Array.isArray(rows[0].admins)
    ? rows[0].admins
    : [];
}
function sendDailySummary() {
  var token  = getTelegramBotToken_();
  var chatId = '-1003583832196';
  var THREAD = { '694866': 2, '1076318': 4 };
  var BRNAME = { '694866': 'Менделеева', '1076318': 'Энтузиастов' };

  var tz = Session.getScriptTimeZone();
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var dstr = Utilities.formatDate(new Date(), tz, 'dd.MM');

  // основная строка: задачи + логи выполнения + отправленные
  var mainSelect = [
    'tasks:data->tasks',
    'taskSentToday:data->taskSent->' + today,
    'taskLogToday:data->taskLog->' + today
  ].join(',');
  var g = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=' + encodeURIComponent(mainSelect), {
    method: 'get', headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_() }, muteHttpExceptions: true
  });
  var rows = JSON.parse(g.getContentText());
  var mainData = (rows && rows[0]) ? rows[0] : {};
  var tasks = Array.isArray(mainData.tasks) ? mainData.tasks : [];
  var sentToday = mainData.taskSentToday || {};
  var logToday  = mainData.taskLogToday || {};

  // строка shifts (кто на смене)
  var shiftsSelect = 'shiftsToday:data->' + today;
  var gs = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.shifts&select=' + encodeURIComponent(shiftsSelect), {
    method: 'get', headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_() }, muteHttpExceptions: true
  });
  var rowsS = JSON.parse(gs.getContentText());
  var shiftsToday = (rowsS && rowsS[0] && rowsS[0].shiftsToday) ? rowsS[0].shiftsToday : {};

  // быстрый доступ к тексту/времени задачи по id
  var taskById = {};
tasks.forEach(function (t) {
  taskById[t.id] = t;
});



  Object.keys(THREAD).forEach(function (bid) {
    // отправленные сегодня по этому филиалу: ключи sentToday вида taskId_bid
    var sentIds = [];
    Object.keys(sentToday).forEach(function (key) {
      var parts = key.split('_');
      var b = parts[parts.length - 1];
      var tid = parts.slice(0, parts.length - 1).join('_');
      // В сводку берём только существующие задачи.
// Старые удалённые задачи и события листа ожидания пропускаем.
if (b === bid && taskById[tid]) {
  sentIds.push(tid);
}
    });

    var total = sentIds.length;
    var doneList = [], notList = [];

    sentIds.forEach(function (tid) {
      var t = taskById[tid] || { text: '(задача удалена)', time: '' };
      var logKey = tid + '_' + bid;
      var rec = logToday[logKey];
      if (rec && rec.done) {
        doneList.push('  ✔ ' + t.text + (t.time ? ' (' + t.time + ')' : '') + ' — ' + (rec.by || '') + (rec.at ? ', ' + rec.at : ''));
      } else {
        notList.push('  ✖ ' + t.text + (t.time ? ' (' + t.time + ')' : ''));
      }
    });

    var done = doneList.length;
    var pct = total ? Math.round(done / total * 100) : 0;
    var onShift = (shiftsToday[bid] && shiftsToday[bid].length) ? shiftsToday[bid].join(', ') : '—';

    // финансы за сегодня из Yclients
    var fin = getDayFinance(bid, today);

    var text =
  '══════════════════════\n' +
  '🌙 📊 ИТОГИ ДНЯ\n' +
  '══════════════════════\n\n' +
  '📍 Филиал: ' + BRNAME[bid] + '\n' +
  '📅 Дата: ' + dstr + '\n\n';
    text += '💰 Выручка (услуги): ' + fin.revenue.toLocaleString('ru-RU') + ' ₽\n';
    text += '👤 Клиентов пришло: ' + fin.clients + ' (новых: ' + fin.dayNew + ')\n\n';
    text += '📅 С начала месяца:\n';
    text += '   Клиентов: ' + fin.monClients + ' (новых: ' + fin.monNew + ')\n';
    text += '   В среднем в день: ' + fin.avgPerDay + '\n\n';
    if (fin.noSource > 0) {
      text += '📍 Источник заполнен: ' + (fin.total - fin.noSource) + ' из ' + fin.total + '\n';
      text += '⚠️ Админы! Не заполнен источник у ' + fin.noSource + ' клиент(ов). Проставьте сегодня или завтра!\n\n';
    } else {
      text += '📍 Источник заполнен у всех ✅\n\n';
    }
    text += '👥 На смене: ' + onShift + '\n\n';
    if (total === 0) {
  text += 'Сегодня задач не было.';
} else {
  text += '✅ Выполнено задач: ' + done + ' из ' + total + ' (' + pct + '%)\n';

  if (notList.length) {
    text += '\n❌ Не выполнено:\n' + notList.join('\n') + '\n';
  } else {
    text += '\nВсе задачи выполнены ✅';
  }
}

    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, message_thread_id: THREAD[bid], text: text }),
      muteHttpExceptions: true
    });
    Logger.log(
  BRNAME[bid] +
  ' сводка -> HTTP ' +
  res.getResponseCode() +
  ' | ' +
  res.getContentText()
);
  });
}
function getDayFinance(companyId, dateStr) {
  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();
  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };

  var tz = Session.getScriptTimeZone();
  var parts = dateStr.split('-').map(Number);
  var monthStart = new Date(parts[0], parts[1] - 1, 1);
  var dToday = new Date(parts[0], parts[1] - 1, parts[2]);
  var dayOfMonth = parts[2];
  var monthStartStr = Utilities.formatDate(monthStart, tz, 'yyyy-MM-dd');

  var records = fetchAllRecords(companyId, 0, monthStart, dToday, headers);

  function isPair(title){ var t=(title||'').toLowerCase().replace(/\s/g,''); return t.indexOf('друг+друг')!==-1 || t.indexOf('папа+сын')!==-1; }
  function isNew(c){ return c && (c.is_new === true || c.is_new === 1); }

  var revenue = 0, clients = 0, dayNew = 0, noSource = 0, totalToday = 0;
  var monClients = 0, monNew = 0;

  records.forEach(function (r) {
    var rd = (r.date || '').slice(0, 10);
    if (rd < monthStartStr) return;
    if (rd > dateStr) return;
    if (r.attendance !== 1) return;

    var c = r.client || {};
    var people = 1;
    (r.services || []).forEach(function (s) { if (isPair(s.title)) people += 1; });

    monClients += people;
    if (isNew(c)) monNew += 1;

    if (rd === dateStr) {
      totalToday++;
      clients += people;
      if (isNew(c)) dayNew += 1;
      (r.services || []).forEach(function (s) { revenue += (s.cost || 0); });
      var src = '';
      try { src = (c.custom_fields && c.custom_fields.AcquisitionChannel) || ''; } catch (e) {}
      if (!src) noSource++;
    }
  });

  var avgPerDay = dayOfMonth > 0 ? (monClients / dayOfMonth).toFixed(2) : '0';

  return {
    revenue: revenue, clients: clients, dayNew: dayNew,
    noSource: noSource, total: totalToday,
    monClients: monClients, monNew: monNew, avgPerDay: avgPerDay
  };
}
function diagClientVisits() {
  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();
  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };
  var dateStr = '2026-07-21'; // ← поставь дату, где были клиенты
  var d = new Date(dateStr + 'T12:00:00');
  var records = fetchAllRecords(694866, 0, d, d, headers);

  var shown = 0;
  records.forEach(function (r) {
    if ((r.date || '').slice(0,10) !== dateStr) return;
    if (r.attendance !== 1) return;
    if (shown >= 5) return;
    shown++;
    var c = r.client || {};
    Logger.log('Клиент: ' + (c.name || '?') +
      ' | visits=' + c.visits +
      ' | visit_count=' + c.visit_count +
      ' | first_visit_date=' + c.first_visit_date +
      ' | keys=' + JSON.stringify(Object.keys(c)));
  });
  Logger.log('Показано клиентов: ' + shown);
}
function diagIsNew() {
  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();
  var headers = { 'Accept': 'application/vnd.yclients.v2+json', 'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken };
  var dateStr = '2026-07-21';
  var d = new Date(dateStr + 'T12:00:00');
  var records = fetchAllRecords(694866, 0, d, d, headers);
  var neww = 0, old = 0, total = 0;
  records.forEach(function (r) {
    if ((r.date || '').slice(0,10) !== dateStr) return;
    if (r.attendance !== 1) return;
    total++;
    var c = r.client || {};
    if (c.is_new === true || c.is_new === 1) neww++; else old++;
    if (total <= 8) Logger.log(c.name + ' | is_new=' + c.is_new + ' | success_visits=' + c.success_visits_count);
  });
  Logger.log('ИТОГО пришло=' + total + ' | новых=' + neww + ' | старых=' + old);
}
function sendMasterReport() {
  var token  = getTelegramBotToken_();
  var chatId = '-1003583832196';
  var THREAD = { '694866': 2, '1076318': 4 };   // рабочие чаты филиалов
  var BRNAME = { '694866': 'Менделеева', '1076318': 'Энтузиастов' };

  var partnerToken = getYclientsPartnerToken_();
  var userToken    = getYclientsUserToken_();
  var yHeaders = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };

  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var dateStr   = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  var dstr      = Utilities.formatDate(now, tz, 'dd.MM');
  var timeStr   = Utilities.formatDate(now, tz, 'HH:mm');
  var parts     = dateStr.split('-').map(Number);
  var monthStart = new Date(parts[0], parts[1]-1, 1);
  var dayOfMonth = parts[2];
  var monthStartStr = Utilities.formatDate(monthStart, tz, 'yyyy-MM-dd');
  var daysLeft = new Date(parts[0], parts[1], 0).getDate() - dayOfMonth; // дней до конца месяца

  // читаем цели из облака
  var gr = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/brixton_store?id=eq.main&select=data', {
    method: 'get', headers: { apikey: getSupabaseServiceRole_(), Authorization: 'Bearer ' + getSupabaseServiceRole_() }, muteHttpExceptions: true
  });
  var gdata = JSON.parse(gr.getContentText());
  var store = (gdata && gdata[0] && gdata[0].data) ? gdata[0].data : {};
  var goals = store.goals || { '694866': 450, '1076318': 450 };

  function isPair(title){ var t=(title||'').toLowerCase().replace(/\s/g,''); return t.indexOf('друг+друг')!==-1||t.indexOf('папа+сын')!==-1; }
  function isNew(c){ return c&&(c.is_new===true||c.is_new===1); }

  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';

  ['694866','1076318'].forEach(function(bid) {
    var records = fetchAllRecords(parseInt(bid), 0, monthStart, now, yHeaders);

    // группируем по мастерам
    var masters = {}; // { staffId: {name, dayC, dayNew, monC, monNew} }

    records.forEach(function(r) {
      var rd = (r.date||'').slice(0,10);
      if (rd < monthStartStr || rd > dateStr) return;
      if (r.attendance !== 1) return;

      var sid  = (r.staff && r.staff.id)   ? String(r.staff.id)   : '0';
      var name = (r.staff && r.staff.name) ? r.staff.name         : '—';
      if (!masters[sid]) masters[sid] = { name:name, dayC:0, dayNew:0, monC:0, monNew:0 };

      var c = r.client || {};
      var people = 1;
      (r.services||[]).forEach(function(s){ if(isPair(s.title)) people+=1; });

      masters[sid].monC += people;
      if (isNew(c)) masters[sid].monNew += 1;

      if (rd === dateStr) {
        masters[sid].dayC += people;
        if (isNew(c)) masters[sid].dayNew += 1;
      }
    });

    // только те, кто работал сегодня
    var todayMasters = Object.values(masters).filter(function(m){ return m.dayC > 0; });
    todayMasters.sort(function(a,b){ return b.dayC - a.dayC; });

    if (!todayMasters.length) { Logger.log(BRNAME[bid] + ': сегодня никто не работал'); return; }

    // итоги по филиалу
    var totalDayC  = todayMasters.reduce(function(s,m){ return s+m.dayC; }, 0);
    var totalDayNew= todayMasters.reduce(function(s,m){ return s+m.dayNew; }, 0);
    var totalMonC  = Object.values(masters).reduce(function(s,m){ return s+m.monC; }, 0); // все мастера за месяц

    var goal     = parseInt(goals[bid]) || 450;
    var left     = goal - totalMonC;
    var avgNow   = dayOfMonth > 0 ? (totalMonC / dayOfMonth).toFixed(2).replace('.',',') : '0';
    var avgNeed  = (left > 0 && daysLeft > 0) ? (left / daysLeft).toFixed(2).replace('.',',') : '✓';

    // строим текст
    var text =
  '━━━━━━━━━━━━━━━━━━━━━━\n' +
  '📋 ДАННЫЕ ДЛЯ ДОСКИ\n' +
  '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
  '📍 ' + BRNAME[bid] + '\n';
    text += Utilities.formatDate(now, tz, 'dd.MM.yyyy') + ', актуально на ' + timeStr + '\n';
    text += '─────────────────\n';

    todayMasters.forEach(function(m) {
      var old = m.dayC - m.dayNew;
      text += m.name + ': ' + m.dayC + ' кл. (' + old + '/' + m.dayNew + ')\n';
    });

    text += '─────────────────\n';
    text += '📅 Сегодня: ' + totalDayC + ' кл. (пост: ' + (totalDayC-totalDayNew) + ' / нов: ' + totalDayNew + ')\n\n';

    text += '📆 С начала месяца:\n';
    todayMasters.forEach(function(m) {
      var monOld = m.monC - m.monNew;
      text += '  ' + m.name + ': ' + m.monC + ' (' + monOld + '/' + m.monNew + ')\n';
    });

    text += '\n🎯 Цель: ' + goal + ' кл.\n';
    text += '✅ Есть: ' + totalMonC + '   ⬜ Осталось: ' + (left > 0 ? left : 0) + '\n';
    text += '📈 Ср. сейчас: ' + avgNow + '/день\n';
    text += '⚡ Нужно: ' + (left > 0 ? avgNeed : '✓ выполнено') + '/день (' + daysLeft + ' дней)\n';

    var res = UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, message_thread_id: THREAD[bid], text: text }),
      muteHttpExceptions: true
    });
    Logger.log(BRNAME[bid] + ' -> HTTP ' + res.getResponseCode());
  });
}
function analyzeSchedule() {
  // Лист ожидания продолжает работать как раньше
  checkNewWaitlistRecords();

  // Проверяем расписание
  checkScheduleChanges();
}


function checkScheduleChanges() {
  var token  = getTelegramBotToken_();
  var chatId = '-1003583832196';

  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();

  var headers = {
    'Authorization':
      'Bearer ' + partnerToken + ', User ' + userToken,
    'Accept': 'application/vnd.yclients.v2+json',
    'Content-Type': 'application/json'
  };

  var BRANCHES = [
    {
      id: 694866,
      name: 'Менделеева',
      thread: 2,
      waitlistStaffId: 3552371
    },
    {
      id: 1076318,
      name: 'Энтузиастов',
      thread: 4,
      waitlistStaffId: 3525900
    }
  ];

  var tz = Session.getScriptTimeZone();
  var now = new Date();

  var todayDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  var tomorrowDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  var dates = [
    Utilities.formatDate(todayDate, tz, 'yyyy-MM-dd'),
    Utilities.formatDate(tomorrowDate, tz, 'yyyy-MM-dd')
  ];

  var props = PropertiesService.getScriptProperties();

var initKey = 'schedule_initialized_v1';
var isFirstRun = !props.getProperty(initKey);

// Обычные свободные окна не отслеживаем.

  function getJson(url) {
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      Logger.log(
        'Ошибка Yclients HTTP ' +
        response.getResponseCode() +
        ': ' +
        url
      );

      Logger.log(response.getContentText());
      return null;
    }

    try {
      return JSON.parse(response.getContentText());
    } catch (error) {
      Logger.log(
        'Ошибка разбора JSON: ' +
        error +
        ' | ' +
        url
      );

      return null;
    }
  }

  function normalizeTitle(title) {
    return String(title || '')
      .toLowerCase()
      .trim();
  }

  function pickHaircut(services) {
    if (!services || !services.length) return null;

    var exact = services.filter(function(service) {
      return normalizeTitle(service.title) ===
        'стрижка мужская';
    });

    if (exact.length) return exact[0];

    var starts = services.filter(function(service) {
      return normalizeTitle(service.title)
        .indexOf('стрижка мужская') === 0;
    });

    if (starts.length) return starts[0];

    var manly = services.filter(function(service) {
      var title = normalizeTitle(service.title);

      return (
        title.indexOf('стрижк') !== -1 &&
        title.indexOf('мужск') !== -1 &&
        title.indexOf('детск') === -1 &&
        title.indexOf('машинк') === -1
      );
    });

    return manly.length ? manly[0] : null;
  }

  function parseSlotDate(dateStr, timeStr) {
    var dateParts = dateStr.split('-').map(Number);
    var timeParts = timeStr.split(':').map(Number);

    return new Date(
      dateParts[0],
      dateParts[1] - 1,
      dateParts[2],
      timeParts[0],
      timeParts[1],
      0
    );
  }

  function formatDateRu(dateStr) {
    var parts = dateStr.split('-');

    return parts[2] + '.' +
      parts[1] + '.' +
      parts[0];
  }

  function sendTelegramTask(
    branch,
    companyId,
    taskId,
    text
  ) {
    var response = UrlFetchApp.fetch(
      'https://api.telegram.org/bot' +
      token +
      '/sendMessage',
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: chatId,
          message_thread_id: branch.thread,
          text: text,
          reply_markup: {
            inline_keyboard: [[
              {
                text: '◻️ Выполнить',
                callback_data:
                  'done:' +
                  taskId +
                  ':' +
                  companyId
              }
            ]]
          }
        }),
        muteHttpExceptions: true
      }
    );

    Logger.log(
      branch.name +
      ' | ' +
      taskId +
      ' -> HTTP ' +
      response.getResponseCode() +
      ' ' +
      response.getContentText()
    );

    return response.getResponseCode() === 200;
  }

  BRANCHES.forEach(function(branch) {
    try {
      var staffResponse = getJson(
        'https://api.yclients.com/api/v1/book_staff/' +
        branch.id
      );

      var staff = (
        staffResponse &&
        staffResponse.data
      ) ? staffResponse.data : [];

      staff.forEach(function(master) {
        var masterName = String(master.name || '');

        var lowerName = masterName.toLowerCase();

        if (
  Number(master.id) === Number(branch.waitlistStaffId) ||
  lowerName.indexOf('лист ожидания') !== -1 ||
  lowerName.indexOf('ожидан') !== -1 ||
  lowerName.indexOf('админ') !== -1
) {
  return;
}

        var servicesResponse = getJson(
          'https://api.yclients.com/api/v1/book_services/' +
          branch.id +
          '?staff_id=' +
          master.id
        );

        var services = (
          servicesResponse &&
          servicesResponse.data &&
          servicesResponse.data.services
        )
          ? servicesResponse.data.services
          : [];

        var haircut = pickHaircut(services);

        if (!haircut) {
          Logger.log(
            branch.name +
            ' | ' +
            masterName +
            ': мужская стрижка не найдена'
          );

          return;
        }

        var haircutMinutes = Math.round(
          Number(haircut.seance_length || 0) / 60
        );

        if (!haircutMinutes) return;

        dates.forEach(function(dateStr) {
          var timesResponse = getJson(
            'https://api.yclients.com/api/v1/book_times/' +
            branch.id +
            '/' +
            master.id +
            '/' +
            dateStr
          );

          var slots = (
            timesResponse &&
            timesResponse.data
          ) ? timesResponse.data : [];

          slots.forEach(function(slot) {
            if (!slot || !slot.time) return;

            var slotMinutes = Math.round(
              Number(
                slot.sum_length ||
                slot.seance_length ||
                0
              ) / 60
            );

            if (!slotMinutes) return;

            var slotDate = parseSlotDate(
              dateStr,
              slot.time
            );

            // Сегодня не сообщаем про окно,
            // если до него осталось меньше 20 минут
            if (
              dateStr === dates[0] &&
              slotDate.getTime() -
                now.getTime() <
                20 * 60 * 1000
            ) {
              return;
            }

            var baseId =
              branch.id + '_' +
              master.id + '_' +
              dateStr + '_' +
              slot.time.replace(':', '');

            /*
             * КОРОТКОЕ ОКНО
             */
            var missingMinutes = haircutMinutes - slotMinutes;

if (
  missingMinutes > 0 &&
  missingMinutes <= 20
) {
              var deadTaskId =
                'deadgap_' + baseId;

              var deadPropKey =
                'schedule_sent_' + deadTaskId;

              if (props.getProperty(deadPropKey)) {
                return;
              }
              if (isFirstRun) {
  props.setProperty(
    deadPropKey,
    new Date().toISOString()
  );
  return;
}

              var deadText =
                '⚠️ МЁРТВОЕ ОКНО В РАСПИСАНИИ\n\n' +
                '📍 Филиал: ' +
                branch.name + '\n' +
                '✂️ Мастер: ' +
                masterName + '\n' +
                '🗓 Дата: ' +
                formatDateRu(dateStr) + '\n' +
                '🕒 Начало: ' +
                slot.time + '\n' +
                '⏳ Свободно: ' +
                slotMinutes +
                ' минут\n' +
                '💈 Мужская стрижка: ' +
                haircutMinutes +
                ' минут\n\n' +
                'Окно слишком короткое для мужской стрижки. ' +
                'Предложите клиентам дополнительные услуги, ' +
                'перенос записи или свяжитесь с листом ожидания.';

              if (
                sendTelegramTask(
                  branch,
                  String(branch.id),
                  deadTaskId,
                  deadText
                )
              ) {
                props.setProperty(
                  deadPropKey,
                  new Date().toISOString()
                );

                saveWaitlistTaskForSummary(
                  dates[0],
                  String(branch.id),
                  deadTaskId,
                  deadText
                );
              }

              return;
            }

            /*
 * Обычное свободное окно.
 * Здесь ничего не отправляем.
 */
return;
          });
        });
      });

    } catch (error) {
      Logger.log(
        'Ошибка анализа расписания ' +
        branch.name +
        ': ' +
        error
      );
    }
  });

  // Старый блок обычных свободных окон удалён.
if (isFirstRun) {
  props.setProperty(
    initKey,
    new Date().toISOString()
  );

  Logger.log(
    'Первичная инициализация завершена. Сообщения не отправлялись.'
  );
}
  cleanupScheduleProperties();
}


function cleanupScheduleProperties() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();

  var limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 7);

  Object.keys(all).forEach(function(key) {
    if (key.indexOf('schedule_sent_') !== 0) return;

    var storedDate = new Date(all[key]);

    if (
      isNaN(storedDate.getTime()) ||
      storedDate < limitDate
    ) {
      props.deleteProperty(key);
    }
  });
}
// ════════════════════════════════════════════════════════
// НЕПОДТВЕРЖДЁННЫЕ ЗАПИСИ
// attendance = 0 — ожидание
// attendance = 2 — подтвердил
// ════════════════════════════════════════════════════════


// В 19:30 проверяет записи на завтра с 10:00 до 15:00
function checkUnconfirmedTomorrow() {
  var tz = Session.getScriptTimeZone();

  var targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 1);

  var dateStr = Utilities.formatDate(
    targetDate,
    tz,
    'yyyy-MM-dd'
  );

  checkUnconfirmedRecords_(
    dateStr,
    '10:00',
    '15:00',
    'tomorrow'
  );
}


// В 11:00 проверяет записи на сегодня,
// начиная с текущего времени
function checkUnconfirmedToday() {
  var tz = Session.getScriptTimeZone();
  var now = new Date();

  var dateStr = Utilities.formatDate(
    now,
    tz,
    'yyyy-MM-dd'
  );

  var currentTime = Utilities.formatDate(
    now,
    tz,
    'HH:mm'
  );

  checkUnconfirmedRecords_(
    dateStr,
    currentTime,
    '23:59',
    'today'
  );
}


// Общая проверка неподтверждённых записей
function checkUnconfirmedRecords_(
  dateStr,
  timeFrom,
  timeTo,
  checkType
) {
  var token = getTelegramBotToken_();

  var chatId = '-1003583832196';

  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();

  // Рабочие темы филиалов
  var branches = [
  {
    id: '694866',
    name: 'Менделеева',
    thread: 2,
    waitlistStaffId: 3552371
  },
  {
    id: '1076318',
    name: 'Энтузиастов',
    thread: 4,
    waitlistStaffId: 3525900
  }
];

  var headers = {
    'Authorization':
      'Bearer ' +
      partnerToken +
      ', User ' +
      userToken,

    'Accept':
      'application/vnd.yclients.v2+json'
  };

  branches.forEach(function(branch) {
    try {
      var url =
        'https://api.yclients.com/api/v1/records/' +
        branch.id +
        '?start_date=' +
        dateStr +
        '&end_date=' +
        dateStr;

      var response = UrlFetchApp.fetch(url, {
        method: 'get',
        headers: headers,
        muteHttpExceptions: true
      });

      if (response.getResponseCode() !== 200) {
        Logger.log(
          branch.name +
          ': ошибка Yclients HTTP ' +
          response.getResponseCode()
        );

        Logger.log(response.getContentText());
        return;
      }

      var json = JSON.parse(
        response.getContentText()
      );

      var records = json.data || [];

      var unconfirmed = records.filter(
        function(record) {
          if (record.deleted === true) {
  return false;
}

// Не учитываем записи в «Листе ожидания»
var recordStaffId =
  record.staff && record.staff.id
    ? Number(record.staff.id)
    : Number(record.staff_id || 0);

var recordStaffName =
  record.staff && record.staff.name
    ? String(record.staff.name).toLowerCase()
    : '';

if (
  recordStaffId === Number(branch.waitlistStaffId) ||
  recordStaffName.indexOf('лист ожидания') !== -1 ||
  recordStaffName.indexOf('ожидан') !== -1
) {
  return false;
}

// Только статус «Ожидание»
if (Number(record.attendance) !== 0) {
  return false;
}

          var recordTime = '';

          if (record.datetime) {
            recordTime =
              record.datetime.substring(11, 16);
          } else if (record.date) {
            recordTime =
              record.date.substring(11, 16);
          }

          if (!recordTime) {
            return false;
          }

          return (
            recordTime >= timeFrom &&
            recordTime <= timeTo
          );
        }
      );

      unconfirmed.sort(function(a, b) {
        var timeA = a.datetime
          ? a.datetime.substring(11, 16)
          : a.date.substring(11, 16);

        var timeB = b.datetime
          ? b.datetime.substring(11, 16)
          : b.date.substring(11, 16);

        return timeA.localeCompare(timeB);
      });

      Logger.log(
        branch.name +
        ': неподтверждённых записей — ' +
        unconfirmed.length
      );

      // Если записей нет — сообщение не отправляем
      if (!unconfirmed.length) {
        return;
      }

      var propKey =
        'unconfirmed_sent_' +
        checkType +
        '_' +
        dateStr.replace(/-/g, '') +
        '_' +
        branch.id;

      var props =
        PropertiesService.getScriptProperties();

      // Не отправляем одно сообщение повторно
      if (props.getProperty(propKey)) {
        Logger.log(
          branch.name +
          ': сообщение уже отправлялось'
        );

        return;
      }

      var dateParts = dateStr.split('-');

      var dateRu =
        dateParts[2] +
        '.' +
        dateParts[1] +
        '.' +
        dateParts[0];

      var periodText =
        checkType === 'tomorrow'
          ? 'завтра с 10:00 до 15:00'
          : 'сегодня';

      var lines = unconfirmed.map(
        function(record) {
          var time = record.datetime
            ? record.datetime.substring(11, 16)
            : record.date.substring(11, 16);

          var clientName =
            record.client &&
            record.client.display_name
              ? record.client.display_name
              : record.client &&
                record.client.name
                ? record.client.name
                : 'Имя не указано';

          var masterName =
            record.staff &&
            record.staff.name
              ? record.staff.name
              : 'Мастер не указан';

          var phone =
            record.client &&
            record.client.phone
              ? record.client.phone
              : 'телефон не указан';

          return (
            '• ' +
            time +
            ' — ' +
            clientName +
            '\n' +
            'Мастер: ' +
            masterName +
            '\n' +
            'Телефон: +' +
            phone
          );
        }
      );

      var text =
        '⚠️ НЕПОДТВЕРЖДЁННЫЕ ЗАПИСИ\n\n' +
        '📍 ' +
        branch.name +
        '\n' +
        '🗓 ' +
        dateRu +
        ' — ' +
        periodText +
        '\n\n' +
        lines.join('\n\n') +
        '\n\n' +
        'Позвонили им?';

      var telegramResponse =
        UrlFetchApp.fetch(
          'https://api.telegram.org/bot' +
            token +
            '/sendMessage',
          {
            method: 'post',
            contentType: 'application/json',

            payload: JSON.stringify({
              chat_id: chatId,
              message_thread_id:
                branch.thread,
              text: text
            }),

            muteHttpExceptions: true
          }
        );

      Logger.log(
        branch.name +
        ' Telegram HTTP: ' +
        telegramResponse.getResponseCode() +
        ' ' +
        telegramResponse.getContentText()
      );

      if (
        telegramResponse.getResponseCode() ===
        200
      ) {
        props.setProperty(
          propKey,
          new Date().toISOString()
        );
      }

    } catch (error) {
      Logger.log(
        'Ошибка проверки ' +
        branch.name +
        ': ' +
        error
      );
    }
  });
}


// Запустить один раз вручную.
// Создаёт ежедневные проверки в 19:30 и 11:00.
function installUnconfirmedTriggers() {
  var functionNames = [
    'checkUnconfirmedTomorrow',
    'checkUnconfirmedToday'
  ];

  ScriptApp.getProjectTriggers().forEach(
    function(trigger) {
      if (
        functionNames.indexOf(
          trigger.getHandlerFunction()
        ) !== -1
      ) {
        ScriptApp.deleteTrigger(trigger);
      }
    }
  );

  ScriptApp.newTrigger(
    'checkUnconfirmedTomorrow'
  )
    .timeBased()
    .everyDays(1)
    .atHour(19)
    .nearMinute(30)
    .create();

  ScriptApp.newTrigger(
    'checkUnconfirmedToday'
  )
    .timeBased()
    .everyDays(1)
    .atHour(11)
    .nearMinute(0)
    .create();

  Logger.log(
    'Триггеры проверки записей созданы'
  );
}
function DIAG_FIND_COMMENT_FIELDS(value, path) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach(function(item, index) {
      DIAG_FIND_COMMENT_FIELDS(
        item,
        path + '[' + index + ']'
      );
    });

    return;
  }

  if (typeof value !== 'object') return;

  Object.keys(value).forEach(function(key) {
    var currentPath = path + '.' + key;
    var currentValue = value[key];

    var keyLower = String(key).toLowerCase();

    var looksRelevant =
      keyLower.indexOf('comment') !== -1 ||
      keyLower.indexOf('note') !== -1 ||
      keyLower.indexOf('remark') !== -1 ||
      keyLower.indexOf('visit') !== -1 ||
      keyLower.indexOf('record') !== -1;

    if (looksRelevant) {
      Logger.log(
        currentPath +
        ' = ' +
        JSON.stringify(currentValue)
      );
    }

    if (
      currentValue !== null &&
      typeof currentValue === 'object'
    ) {
      DIAG_FIND_COMMENT_FIELDS(
        currentValue,
        currentPath
      );
    }
  });
}
function tgTestGeneral() {
  var token = getTelegramBotToken_();
  var chatId = '-1003583832196';

  var url =
    'https://api.telegram.org/bot' +
    token +
    '/sendMessage';

  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: chatId,
      text: '✅ Тест: сообщение в общую ветку'
    }),
    muteHttpExceptions: true
  });

  Logger.log(
    'HTTP ' +
    res.getResponseCode() +
    ' ' +
    res.getContentText()
  );
}
function tgTestBarbers() {
  var token = getTelegramBotToken_();
  var chatId = '-1003542259158';

  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';

  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: chatId,
      text: '✅ Проверка отправки в тему барберов'
    }),
    muteHttpExceptions: true
  });

  Logger.log(res.getContentText());
}
