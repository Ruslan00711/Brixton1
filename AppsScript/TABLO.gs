function doGetTablo(companyId, date) {
  const partnerToken = getYclientsPartnerToken_();
  const userToken = getYclientsUserToken_();
  const headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };
  var target = date ? new Date(date) : new Date();
  var dateStr = Utilities.formatDate(target, 'Asia/Yekaterinburg', 'yyyy-MM-dd');
  var start = new Date(dateStr + 'T00:00:00');
  var end   = new Date(dateStr + 'T23:59:59');
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
      visit:      r.attendance !== undefined ? r.attendance : 0,
      duration:   r.length ? Math.round(r.length/60) : 60,
      paid:       r.paid_full === 1 ? true : false,
      isNew:      r.client ? r.client.is_new : false,
      visits:     r.client ? r.client.success_visits_count : 0
    });
  });
  Object.values(byStaff).forEach(function(s){
    s.appointments.sort(function(a,b){return a.time<b.time?-1:1;});
  });
  var staff = Object.values(byStaff);
  staff.sort(function(a, b) {
    var aWait = a.name.toLowerCase().includes('ожидани') ? 1 : 0;
    var bWait = b.name.toLowerCase().includes('ожидани') ? 1 : 0;
    return aWait - bWait;
  });
  return staff;
}
function testFetch() {
  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + getYclientsPartnerToken_() + ', User ' + getYclientsUserToken_()
  };
  var url = 'https://api.yclients.com/api/v1/records/1076318?staff_id=0&start_date=2026-06-29&end_date=2026-06-29&count=1&page=1';
  var resp = UrlFetchApp.fetch(url, {method:'get', headers:headers, muteHttpExceptions:true});
  var data = JSON.parse(resp.getContentText());
  if(data.data && data.data[0]) {
    Logger.log(JSON.stringify(data.data[0].client));
  }
}
function doGetTvBoard(companyId) {
  companyId = parseInt(companyId, 10);

  var BRNAME = {
    694866: 'Менделеева',
    1076318: 'Энтузиастов'
  };

  if (!BRNAME[companyId]) {
    throw new Error('Неизвестный филиал: ' + companyId);
  }

  var cache = CacheService.getScriptCache();
  var cacheKey = 'tv_board_' + companyId;
  var cached = cache.get(cacheKey);
  var properties = PropertiesService.getScriptProperties();
var backupKey = 'tv_board_backup_' + companyId;
var backupText = properties.getProperty(backupKey);
var backup = null;

if (backupText) {
  try {
    backup = JSON.parse(backupText);
  } catch (backupError) {
    backup = null;
  }
}

  if (cached) {
    return JSON.parse(cached);
  }

  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();

  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };

  var tz = 'Asia/Yekaterinburg';
  var now = new Date();
  var dateStr = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  var parts = dateStr.split('-').map(Number);

  var monthStart = new Date(parts[0], parts[1] - 1, 1);
  var monthStartStr = Utilities.formatDate(
    monthStart,
    tz,
    'yyyy-MM-dd'
  );

  var dayOfMonth = parts[2];
  var daysInMonth = new Date(
    parts[0],
    parts[1],
    0
  ).getDate();

  var daysLeft = daysInMonth - dayOfMonth;

  var monthKeysEn = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ];

  var actualMonthKey =
    monthKeysEn[parts[1] - 1] +
    '_' +
    parts[0];

  var tvBoardSelect = [
    'goals:data->goals',
    'salesGoals:data->salesGoals',
    'announcements:data->announcements',
    'masterGoals:data->masterGoals',
    'adminSchedules:data->adminSchedules',
    'siteBarbers:data->months->' + actualMonthKey + '->barbers'
  ].join(',');

  var store = {};
var supabaseLoaded = false;

  try {
    var gr = UrlFetchApp.fetch(
      SUPABASE_URL +
        '/rest/v1/brixton_store?id=eq.main&select=' +
        encodeURIComponent(tvBoardSelect),
      {
        method: 'get',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + SUPABASE_KEY
        },
        muteHttpExceptions: true
      }
    );

    var gdata = JSON.parse(gr.getContentText());

    store = (
      gdata &&
      gdata[0]
    ) ? gdata[0] : {};
 supabaseLoaded = Boolean(
   gdata &&
   gdata[0]
 );
  } catch (err) {
    Logger.log(
      'getTvBoard: Supabase недоступен: ' + err
    );
  }
  var goals =
    store.goals ||
    {
      '694866': 450,
      '1076318': 450
    };

  var salesGoals =
    store.salesGoals ||
    {
      '694866': 60000,
      '1076318': 60000
    };

  var announcements = (
    Array.isArray(store.announcements)
      ? store.announcements
      : []
  ).filter(function(item) {
    if (!item || item.active === false) return false;

    var branch = String(item.branch || 'both');

    return (
      branch === 'both' ||
      branch === String(companyId)
    );
  }).map(function(item) {
    return {
      id: String(item.id || ''),
      title: String(item.title || 'Объявление'),
      text: String(item.text || '')
    };
  });

  /*
   * Личные цели мастеров:
   *
   * masterGoals = {
   *   "694866": {
   *     "Виталий": {
   *       goods: 15000,
   *       services: 180000
   *     }
   *   }
   * }
   */
  var allMasterGoals = store.masterGoals || {};
  var branchMasterGoals =
    allMasterGoals[String(companyId)] || {};
// График администраторов
var adminSchedules = store.adminSchedules || {};

var currentMonthKey =
  Utilities.formatDate(now, tz, 'yyyy-MM');

var adminSchedule =
  (
    adminSchedules[String(companyId)] &&
    adminSchedules[String(companyId)][currentMonthKey]
  )
    ? adminSchedules[String(companyId)][currentMonthKey]
    : {};
  var goal =
    parseInt(
      goals[String(companyId)],
      10
    ) || 450;

  var salesGoal =
    parseInt(
      salesGoals[String(companyId)],
      10
    ) || 60000;

  var siteBarbers =
    Array.isArray(store.siteBarbers)
      ? store.siteBarbers
      : [];

  function normName_(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^a-zа-я0-9]+/g, '')
      .trim();
  }

  var siteStatsByName = {};

  siteBarbers.forEach(function(b) {
    if (
      !b ||
      b.loc !== BRNAME[companyId]
    ) {
      return;
    }

    siteStatsByName[
      normName_(b.name)
    ] = {
      monthNewForMaster:
        Number(b.new_clients) || 0,

      monthAbsNew:
        Number(b.abs_new) || 0,

      servicesTotal:
        Number(b.rev) || 0,

      goodsTotal:
        Number(b.goods_rev) || 0
    };
  });

  function isPair(title) {
    var t = String(title || '')
      .toLowerCase()
      .replace(/\s/g, '');

    return (
      t.indexOf('друг+друг') !== -1 ||
      t.indexOf('папа+сын') !== -1
    );
  }

  function isNew(client) {
    return client && (
      client.is_new === true ||
      client.is_new === 1
    );
  }

  var records =
    fetchAllRecords(
      companyId,
      0,
      monthStart,
      now,
      headers
    ) || [];
/*
 * Если внешние источники временно не ответили,
 * не заменяем рабочую доску нулями.
 */
var recordsLoaded =
  Array.isArray(records) &&
  records.length > 0;

if (
  backup &&
  (
    !supabaseLoaded ||
    !recordsLoaded
  )
) {
  Logger.log(
    'getTvBoard: внешние данные не загрузились, возвращаем последнюю рабочую копию'
  );

  return backup;
}
  /*
   * Живой статус мастеров на сегодня.
   * Используем уже загруженные records,
   * второй запрос к Yclients не делаем.
   */
  var nowMinutes =
    parseInt(
      Utilities.formatDate(now, tz, 'HH'),
      10
    ) * 60 +
    parseInt(
      Utilities.formatDate(now, tz, 'mm'),
      10
    );

  var todayScheduleByStaff = {};

  records.forEach(function(r) {
    var rd = String(
      r.datetime ||
      r.date ||
      ''
    ).slice(0, 10);

    if (rd !== dateStr) return;
    if (!r.staff || !r.staff.id) return;
    if (r.deleted === true) return;
    if (Number(r.attendance) === -1) return;

    var sid = String(r.staff.id);
    var rawDate = String(
      r.datetime ||
      r.date ||
      ''
    );

    var timeText =
      rawDate.length >= 16
        ? rawDate.substring(11, 16)
        : '';

    if (!timeText) return;

    var timeParts =
      timeText.split(':').map(Number);

    var startMinutes =
      timeParts[0] * 60 +
      timeParts[1];

    var durationMinutes =
      Number(r.length)
        ? Math.round(Number(r.length) / 60)
        : Number(r.seance_length)
          ? Math.round(
              Number(r.seance_length) / 60
            )
          : 60;

    if (durationMinutes <= 0) {
      durationMinutes = 60;
    }

    if (!todayScheduleByStaff[sid]) {
      todayScheduleByStaff[sid] = [];
    }

    todayScheduleByStaff[sid].push({
      start: startMinutes,
      end:
        startMinutes +
        durationMinutes,
      startText: timeText
    });
  });

  Object.keys(
    todayScheduleByStaff
  ).forEach(function(sid) {
    todayScheduleByStaff[sid].sort(
      function(a, b) {
        return a.start - b.start;
      }
    );
  });

  function minutesToTime_(minutes) {
    var normalized =
      ((minutes % 1440) + 1440) %
      1440;

    var hours =
      Math.floor(normalized / 60);

    var mins =
      normalized % 60;

    return (
      String(hours).padStart(2, '0') +
      ':' +
      String(mins).padStart(2, '0')
    );
  }

  function getLiveStatus_(staffId) {
    var appointments =
      todayScheduleByStaff[
        String(staffId)
      ] || [];

    if (!appointments.length) {
      return {
        status: 'none',
        text: 'Сегодня без записей'
      };
    }

    var current =
      appointments.find(
        function(a) {
          return (
            nowMinutes >= a.start &&
            nowMinutes < a.end
          );
        }
      );

    if (current) {
      return {
        status: 'busy',
        text:
          'Сейчас клиент до ' +
          minutesToTime_(current.end)
      };
    }

    var next =
      appointments.find(
        function(a) {
          return a.start > nowMinutes;
        }
      );

    if (next) {
      var gap =
        next.start -
        nowMinutes;

      if (
        nowMinutes <
        appointments[0].start
      ) {
        return {
          status: 'upcoming',
          text:
            'Начало в ' +
            next.startText
        };
      }

      return {
        status: 'free',
        text:
          gap <= 120
            ? 'Свободен ' +
              gap +
              ' мин'
            : 'Следующий клиент в ' +
              next.startText
      };
    }

    return {
      status: 'done',
      text: 'Записей больше нет'
    };
} 
  var masters = {};
  var daysMap = {};

  for (
    var dayNum = 1;
    dayNum <= daysInMonth;
    dayNum++
  ) {
    daysMap[dayNum] = {
      day: dayNum,
      total: null,
      masters: {}
    };
  }

  records.forEach(function(r) {
  var rd = String(r.date || '').slice(0, 10);

  if (
    rd < monthStartStr ||
    rd > dateStr ||
    Number(r.attendance) !== 1
  ) {
    return;
  }

  /*
   * Записи с итоговой стоимостью 0 ₽
   * считаем моделями и не включаем
   * в клиентскую статистику.
   */
  var recordServicesTotal = (
    r.services || []
  ).reduce(function(sum, service) {
    return (
      sum +
      (
        Number(service.cost_to_pay) ||
        0
      )
    );
  }, 0);

  if (recordServicesTotal <= 0) {
    return;
  }

    var sid =
      (
        r.staff &&
        r.staff.id
      )
        ? String(r.staff.id)
        : '0';

    var name =
      (
        r.staff &&
        r.staff.name
      )
        ? r.staff.name
        : '—';

    if (!masters[sid]) {
      masters[sid] = {
        id: sid,
        name: name,
        todayTotal: 0,
        todayNew: 0,
        todayRegular: 0,
        monthTotal: 0,
        monthNew: 0,
        monthRegular: 0,
        sales: 0,
        servicesTotal: 0,
        goodsGoal: 0,
        servicesGoal: 0
      };
    }

    var people = 1;

    (r.services || []).forEach(function(s) {
      if (isPair(s.title)) {
        people++;
      }

      masters[sid].servicesTotal +=
        Number(s.cost) || 0;
    });

    var newClient = isNew(r.client);

    masters[sid].monthTotal += people;

    var recordDay =
      parseInt(
        rd.slice(8, 10),
        10
      );

    if (
      daysMap[recordDay].total === null
    ) {
      daysMap[recordDay].total = 0;
    }

    daysMap[recordDay].total += people;

    daysMap[recordDay].masters[sid] =
      (
        daysMap[recordDay].masters[sid] ||
        0
      ) + people;

    if (newClient) {
      masters[sid].monthNew += 1;
    } else {
      masters[sid].monthRegular += people;
    }

    if (rd === dateStr) {
      masters[sid].todayTotal += people;

      if (newClient) {
        masters[sid].todayNew += 1;
      } else {
        masters[sid].todayRegular += people;
      }
    }

    (r.goods_transactions || []).forEach(
      function(g) {
        masters[sid].sales +=
          Number(g.cost) || 0;
      }
    );
  });

  /*
   * Добавляем действующих мастеров,
   * даже если в текущем месяце
   * у них пока нет проведённых записей.
   */
  siteBarbers.forEach(function(b) {
    if (
      !b ||
      b.loc !== BRNAME[companyId] ||
      !b.name
    ) {
      return;
    }

    var normalizedSiteName =
      normName_(b.name);

    var exists =
      Object.values(masters).some(
        function(m) {
          return (
            normName_(m.name) ===
            normalizedSiteName
          );
        }
      );

    if (exists) {
      return;
    }

    var sid =
      'site_' +
      String(
        b.id ||
        normalizedSiteName
      );

    masters[sid] = {
      id: sid,
      name: b.name,
      todayTotal: 0,
      todayNew: 0,
      todayRegular: 0,
      monthTotal: 0,
      monthNew: 0,
      monthRegular: 0,
      sales: Number(b.goods_rev) || 0,
      servicesTotal: Number(b.rev) || 0,
      goodsGoal: 0,
      servicesGoal: 0
    };
  });

  var list = Object.values(masters);

  list.forEach(function(m) {
    var normalizedName =
      normName_(m.name);

    var siteStat =
      siteStatsByName[normalizedName] ||
      {};

    /*
     * Для новых клиентов берём готовую
     * месячную аналитику основного сайта.
     */
    m.monthNewForMaster =
      Number(
        siteStat.monthNewForMaster
      ) || 0;

    m.monthAbsNew =
      Number(
        siteStat.monthAbsNew
      ) || 0;

    /*
     * Для услуг используем свежую сумму из записей.
     * Значение сайта уже использовано как fallback для
     * мастеров, которых нет в свежей выборке.
     */

    /*
     * Для товаров используем значение из записей.
     * Если мастер добавлен с нулём,
     * берём готовое значение сайта.
     */
    if (
      Number(m.sales) === 0 &&
      Number(siteStat.goodsTotal) > 0
    ) {
      m.sales =
        Number(siteStat.goodsTotal);
    }

    var personalGoal =
      branchMasterGoals[m.name] || {};

    m.goodsGoal =
      Number(personalGoal.goods) || 0;

    m.servicesGoal =
      Number(personalGoal.services) || 0;
  });

  list.sort(function(a, b) {
    return (
      (b.todayTotal - a.todayTotal) ||
      (b.monthTotal - a.monthTotal) ||
      a.name.localeCompare(b.name, 'ru')
    );
  });

  var totalMonth =
    list.reduce(function(sum, m) {
      return sum + m.monthTotal;
    }, 0);

  var totalToday =
    list.reduce(function(sum, m) {
      return sum + m.todayTotal;
    }, 0);

  var totalTodayNew =
    list.reduce(function(sum, m) {
      return sum + m.todayNew;
    }, 0);

  var left =
    Math.max(
      0,
      goal - totalMonth
    );

  var avgNow =
    dayOfMonth > 0
      ? Math.round(
          totalMonth /
          dayOfMonth *
          100
        ) / 100
      : 0;

  var avgNeed =
    (
      left > 0 &&
      daysLeft > 0
    )
      ? Math.round(
          left /
          daysLeft *
          100
        ) / 100
      : 0;

  var totalSales =
    list.reduce(function(sum, m) {
      return sum + m.sales;
    }, 0);

  var totalServices =
    list.reduce(function(sum, m) {
      return sum + m.servicesTotal;
    }, 0);

  var result = {
    branchId: companyId,
    branchName: BRNAME[companyId],

    announcements: announcements,

    updatedAt:
      Utilities.formatDate(
        now,
        tz,
        'dd.MM.yyyy HH:mm'
      ),

    clients: {
      goal: goal,
      monthTotal: totalMonth,
      left: left,
      todayTotal: totalToday,
      todayNew: totalTodayNew,
      todayRegular:
        totalToday - totalTodayNew,
      avgNow: avgNow,
      avgNeed: avgNeed,
      daysLeft: daysLeft
    },

    masters: list.map(function(m) {
      return {
        id: m.id,
        name: m.name,

        todayTotal: m.todayTotal,
        todayNew: m.todayNew,
        todayRegular:
          m.todayTotal -
          m.todayNew,

        monthTotal: m.monthTotal,
        monthNew: m.monthNew,
        monthRegular:
          m.monthTotal -
          m.monthNew,

        monthNewForMaster:
          m.monthNewForMaster,

        monthAbsNew:
          m.monthAbsNew,

        servicesTotal:
          Math.round(
            Number(m.servicesTotal) || 0
          ),

        servicesGoal:
          Math.round(
            Number(m.servicesGoal) || 0
          ),

        goodsTotal:
          Math.round(
            Number(m.sales) || 0
          ),

        goodsGoal:
          Math.round(
            Number(m.goodsGoal) || 0
          ),

        liveStatus:
          getLiveStatus_(m.id)
      };
    }),

    days:
      Object.keys(daysMap).map(
        function(k) {
          var day = daysMap[k];

          if (
            day.day > dayOfMonth
          ) {
            return {
              day: day.day,
              total: null,
              masters: {}
            };
          }

          return day;
        }
      ),

    sales: {
      goal: salesGoal,
      total: Math.round(totalSales),
      remaining:
        Math.max(
          0,
          Math.round(
            salesGoal -
            totalSales
          )
        ),

      masters:
        list
          .slice()
          .sort(function(a, b) {
            return b.sales - a.sales;
          })
          .map(function(m) {
            return {
              name: m.name,
              total:
                Math.round(m.sales),
              goal:
                Math.round(m.goodsGoal)
            };
          })
    },

    services: {
      total:
        Math.round(totalServices)
    },
adminSchedule: adminSchedule,
    kpiMasters:
      list.map(function(m) {
        return {
          name: m.name,

          servicesTotal:
            Math.round(m.servicesTotal),

          servicesGoal:
            Math.round(m.servicesGoal),

          goodsTotal:
            Math.round(m.sales),

          goodsGoal:
            Math.round(m.goodsGoal)
        };
      })
  };

  var resultJson = JSON.stringify(result);

cache.put(
  cacheKey,
  resultJson,
  300
);

/*
 * Постоянная резервная копия последнего
 * успешно сформированного экрана.
 */
if (supabaseLoaded && recordsLoaded) {
  properties.setProperty(
    backupKey,
    resultJson
  );
}

return result;
}




// 2) В doGet(e) сразу ПОСЛЕ блока getTodaySchedule добавь этот блок:
/*
  if(e.parameter.action === 'getTvBoard'){
    try {
      const data = doGetTvBoard(e.parameter.company_id);
      return ContentService.createTextOutput(JSON.stringify({success:true,data:data}))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({success:false,error:String(err)}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
*/
function testDoGetTvBoard() {
  var result = doGetTvBoard(694866);
  Logger.log(JSON.stringify(result, null, 2));
}
function clearTvBoardCache() {
  CacheService.getScriptCache().remove('tv_board_694866');
  CacheService.getScriptCache().remove('tv_board_1076318');
  Logger.log('Кэш ТВ-доски очищен');
}
function testEntuziastovBoard() {
  var result = doGetTvBoard(1076318);
  Logger.log(JSON.stringify(result, null, 2));
}
function testEntuziastovRecords() {
  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();

  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization':
      'Bearer ' + partnerToken +
      ', User ' + userToken
  };

  var tz = 'Asia/Yekaterinburg';
  var now = new Date();

  var dateStr =
    Utilities.formatDate(
      now,
      tz,
      'yyyy-MM-dd'
    );

  var parts =
    dateStr.split('-').map(Number);

  var monthStart =
    new Date(
      parts[0],
      parts[1] - 1,
      1
    );

  var records =
    fetchAllRecords(
      1076318,
      0,
      monthStart,
      now,
      headers
    ) || [];

  Logger.log(
    'ЭНТУЗИАСТОВ: записей найдено ' +
    records.length
  );

  if (records.length) {
    Logger.log(
      JSON.stringify(
        records[0],
        null,
        2
      )
    );
  }
}
function testEntuziastovRawApi() {
  var partnerToken = getYclientsPartnerToken_();
  var userToken = getYclientsUserToken_();

  var headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization':
      'Bearer ' + partnerToken +
      ', User ' + userToken
  };

  var url =
    'https://api.yclients.com/api/v1/records/1076318' +
    '?staff_id=0' +
    '&start_date=2026-08-01' +
    '&end_date=2026-08-03' +
    '&count=10' +
    '&page=1';

  var response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true
  });

  Logger.log(
    'HTTP STATUS: ' +
    response.getResponseCode()
  );

  Logger.log(
    'RAW RESPONSE: ' +
    response.getContentText()
  );
}
function testUrlFetchQuota() {
  var response = UrlFetchApp.fetch(
    'https://www.google.com',
    {
      muteHttpExceptions: true
    }
  );

  Logger.log(response.getResponseCode());
}
