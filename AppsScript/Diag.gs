function CHECK_JUNE_GOODS(){
  const partnerToken = getYclientsPartnerToken_();
  const userToken = getYclientsUserToken_();
  const headers = {
    'Accept': 'application/vnd.yclients.v2+json',
    'Authorization': 'Bearer ' + partnerToken + ', User ' + userToken
  };
  // Все мастера Менделеева включая лист ожидания — смотрим goods_transactions за июнь
  const staffIds = [2026841, 4186140, 3543745, 5143587, 5316255, 3552371]; // Виталий, Наиль, Арсений, Сергей, Марина, Лист ожидания
  let total = 0;
  staffIds.forEach(sid=>{
    const url = 'https://api.yclients.com/api/v1/records/694866?staff_id='+sid+'&start_date=2026-06-01&end_date=2026-06-22&count=200&page=1';
    const resp = UrlFetchApp.fetch(url, {method:'get', headers:headers, muteHttpExceptions:true});
    const records = JSON.parse(resp.getContentText()).data||[];
    let staffTotal = 0;
    records.forEach(r=>{
      (r.goods_transactions||[]).forEach(g=> staffTotal += Math.abs(g.cost||0));
    });
    Logger.log('staff_id='+sid+' goods='+staffTotal);
    total += staffTotal;
  });
  Logger.log('ИТОГО: ' + total);
}
