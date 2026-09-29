'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const html=fs.readFileSync(path.join(__dirname,'..','board.html'),'utf8');

function readFunction(name){
  const start=html.indexOf('function '+name+'(');
  assert.notEqual(start,-1,name+' must exist');
  const open=html.indexOf('{',start);
  let depth=0;
  for(let index=open;index<html.length;index++){
    if(html[index]==='{')depth++;
    if(html[index]==='}'&&--depth===0)return html.slice(start,index+1);
  }
  throw new Error('Unclosed function '+name);
}

function canLoad(manualBrowserMode,workingHours){
  const context=vm.createContext({manualBrowserMode,isBrixtonWorkingHours:()=>workingHours});
  vm.runInContext(readFunction('canLoadTvData'),context);
  return context.canLoadTvData();
}

function workingAt(hour,minute){
  const context=vm.createContext({
    Date,
    BRIXTON_TIME_ZONE:'Asia/Yekaterinburg',
    Intl:{
      DateTimeFormat:function(){return{
        formatToParts:()=>[
          {type:'hour',value:String(hour).padStart(2,'0')},
          {type:'minute',value:String(minute).padStart(2,'0')}
        ]
      };}
    }
  });
  vm.runInContext(readFunction('isBrixtonWorkingHours'),context);
  return context.isBrixtonWorkingHours();
}

test('manual browser mode explicitly bypasses the TV working-hours gate',()=>{
  assert.match(html,/const manualBrowserMode=p\.get\('manual'\)==='1'/);
  assert.equal(canLoad(true,false),true);
});

test('normal TV URLs keep the existing working-hours restriction',()=>{
  assert.equal(canLoad(false,true),true);
  assert.equal(canLoad(false,false),false);
  assert.equal(workingAt(9,29),false);
  assert.equal(workingAt(9,30),true);
  assert.equal(workingAt(21,59),true);
  assert.equal(workingAt(22,0),false);
  assert.equal(workingAt(23,15),false);
  assert.match(html,/return total>=570&&total<1320/);
});

test('dashboard, schedule, retries and refresh cycle use the shared manual-aware gate',()=>{
  assert.match(html,/if\(!canLoadTvData\(\)\|\|loadInFlight/);
  assert.match(html,/if\(!canLoadTvData\(\)\|\|scheduleInFlight/);
  assert.match(html,/if\(!canLoadTvData\(\)\)return;\s*loadRetryTimer=setTimeout/);
  assert.match(html,/async function refreshCycle\(\)\{\s*const working=canLoadTvData\(\)/);
});
