/* Persistent, revocable TV capability. ES2017 syntax is intentionally avoided for Smart TV browsers. */
(function () {
  'use strict';
  var TENANT='6a778c5d-e8be-49b5-a273-130691b3116f';
  var BRANCHES={mendeleeva:'694866',entuziastov:'1076318'};
  var key='BRIXTON_TV_DEVICE_V1';
  var query=String(location.search||'').replace(/^\?/,'').split('&');
  var branchName='mendeleeva';
  var i, pair;
  for(i=0;i<query.length;i++){
    pair=query[i].split('=');
    if(decodeURIComponent(pair[0]||'')==='branch')branchName=decodeURIComponent(pair.slice(1).join('=')||'').toLowerCase();
  }
  var branch=BRANCHES[branchName]||(/^\d+$/.test(branchName)&&['694866','1076318'].indexOf(branchName)!==-1?branchName:BRANCHES.mendeleeva);
  var stored=null, panel=null;
  try {stored=JSON.parse(localStorage.getItem(key)||'null');} catch (_) {stored=null;}

  function storedToken() {
    var device=stored&&stored.device;
    return device&&device.organization_id===TENANT&&device.company_id===branch&&
      /^btv1_[a-f0-9]{64}$/.test(stored.deviceToken||'') ? stored.deviceToken : '';
  }
  function clearStored() {
    try {localStorage.removeItem(key);} catch (_) {}
    stored=null;
  }
  function post(body,options) {
    var request={method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',
      body:JSON.stringify(body)};
    if(options&&options.signal)request.signal=options.signal;
    return fetch('/legacy-api',request);
  }
  function show(message) {
    if(!panel)return;
    panel.style.display='flex';
    panel.querySelector('[data-status]').textContent=message||'';
  }
  function actionFromUrl(url) {
    var match=String(url||'').match(/[?&]action=([^&]+)/);
    return match?decodeURIComponent(match[1]):'';
  }

  window.brixtonTvFetch=function(url,options) {
    var body={action:actionFromUrl(url),organization_id:TENANT,company_id:branch};
    var token=storedToken();
    if(token)body.deviceToken=token;
    return post(body,options).then(function(response){
      if((response.status===401||response.status===403)&&token){
        clearStored();
        return post({action:body.action,organization_id:TENANT,company_id:branch},options);
      }
      return response;
    }).then(function(response){
      if(response.status===401||response.status===403){
        clearStored();
        show('Доступ устройства истёк, отозван или филиал не совпадает. Подключите ТВ заново.');
      }
      return response;
    });
  };

  document.addEventListener('DOMContentLoaded',function(){
    panel=document.createElement('div');panel.id='tvDeviceSetup';
    panel.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#091719;display:none;align-items:center;justify-content:center;color:#eee;font:18px sans-serif;overflow:auto';
    panel.innerHTML='<form style="width:min(520px,90vw);padding:32px;border:1px solid #bb9c63;border-radius:14px">'+
      '<h2>Подключение ТВ</h2><p>Филиал: '+(branch==='694866'?'Менделеева':'Энтузиастов')+'</p>'+
      '<p>Код нужен один раз. После подключения защищённая сессия устройства сохраняется в браузере ТВ.</p>'+
      '<label>Название устройства<input data-name maxlength="80" value="Телевизор" style="display:block;width:100%;padding:10px;margin:8px 0"></label>'+
      '<label>Административный код<input data-code type="password" autocomplete="off" required style="display:block;width:100%;padding:10px;margin:8px 0"></label>'+
      '<button type="submit">Подключить ТВ</button> <button type="button" data-list>Список устройств</button> <button type="button" data-close>Закрыть</button>'+
      '<p data-status role="status"></p><div data-devices></div></form>';
    document.body.appendChild(panel);
    var form=panel.querySelector('form'),status=panel.querySelector('[data-status]');
    function command(action,extra) {
      var input=panel.querySelector('[data-code]'),adminToken=input.value.replace(/^\s+|\s+$/g,'');
      var body={action:action,organization_id:TENANT,company_id:branch,adminToken:adminToken};
      var name;
      if(!adminToken)return Promise.reject(Error('Введите административный код'));
      for(name in extra)if(Object.prototype.hasOwnProperty.call(extra,name))body[name]=extra[name];
      return post(body).then(function(response){
        return response.json().then(function(json){
          if(!response.ok||!json.success)throw Error('Действие не выполнено. Проверьте код и доступность сервера.');
          return json.data;
        });
      });
    }
    form.addEventListener('submit',function(e){
      e.preventDefault();var button=form.querySelector('[type=submit]');button.disabled=true;
      if(!confirm('Подключить это устройство к выбранному филиалу?')){button.disabled=false;return;}
      command('registerTvDevice',{name:panel.querySelector('[data-name]').value,confirm:true}).then(function(data){
        try {localStorage.setItem(key,JSON.stringify(data));} catch (_) {}
        stored=data;panel.querySelector('[data-code]').value='';location.reload();
      },function(err){status.textContent=err.message;button.disabled=false;});
    });
    panel.querySelector('[data-list]').addEventListener('click',function(){
      command('listTvDevices',{}).then(function(data){
        var list=panel.querySelector('[data-devices]');list.innerHTML='';
        for(var n=0;n<data.devices.length;n++)(function(device){
          var row=document.createElement('p'),label=document.createElement('span');
          label.textContent=device.name+' — '+(device.revoked_at?'отозван':'активен')+' ';row.appendChild(label);
          if(!device.revoked_at){
            var revoke=document.createElement('button');revoke.type='button';revoke.textContent='Отозвать';
            revoke.onclick=function(){
              if(!confirm('Отозвать доступ устройства «'+device.name+'»?'))return;
              revoke.disabled=true;
              command('revokeTvDevice',{device_id:device.id,confirm:true}).then(function(){
                if(stored&&stored.device&&stored.device.id===device.id)clearStored();
                label.textContent=device.name+' — отозван. Для замены подключите ТВ заново.';row.removeChild(revoke);
              },function(err){status.textContent=err.message;revoke.disabled=false;});
            };row.appendChild(revoke);
          }list.appendChild(row);
        })(data.devices[n]);
      },function(err){status.textContent=err.message;});
    });
    panel.querySelector('[data-close]').onclick=function(){panel.querySelector('[data-code]').value='';panel.style.display='none';};
    var manage=document.createElement('button');manage.textContent='Подключение ТВ';manage.type='button';
    manage.style.cssText='position:fixed;right:8px;bottom:8px;z-index:2147483645;font:12px sans-serif;opacity:.55';
    manage.onclick=function(){show('');};document.body.appendChild(manage);
  });
})();
