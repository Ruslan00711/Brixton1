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

function rankingRuntime(){
  const context=vm.createContext({Intl,Map,Set});
  vm.runInContext(`
    const NETWORK_BRANCHES=[
      {id:'694866',name:'Менделеева',className:'mendeleeva'},
      {id:'1076318',name:'Энтузиастов',className:'entuziastov'}
    ];
    ${readFunction('normalizeNetworkMasterName')}
    ${readFunction('buildNetworkRanking')}
  `,context);
  return context;
}

function branch(id,name,masters,kpiMasters,overrides={}){
  return{
    branchId:id,branchName:name,
    clients:{monthTotal:overrides.clients??20,goal:overrides.goal??40},
    masters,kpiMasters,
    services:{total:overrides.services??0},
    sales:{total:overrides.goods??0},
    updatedAt:'29.09.2026 12:00'
  };
}

test('network ranking uses both existing branch payloads and sorts strictly by services revenue',()=>{
  const runtime=rankingRuntime();
  const result=runtime.buildNetworkRanking([
    branch('694866','Менделеева',[
      {id:1,name:'Антон',monthTotal:18},
      {id:2,name:'Борис',monthTotal:22}
    ],[
      {name:'Антон',servicesTotal:120000,goodsTotal:9000,servicesGoal:150000},
      {name:'Борис',servicesTotal:180000,goodsTotal:7000,servicesGoal:200000}
    ],{services:300000,goods:16000,clients:40,goal:50}),
    branch('1076318','Энтузиастов',[
      {id:3,name:'Сергей',monthTotal:20}
    ],[
      {name:'Сергей',servicesTotal:240000,goodsTotal:11000,servicesGoal:200000}
    ],{services:240000,goods:11000,clients:20,goal:40})
  ]);
  assert.deepEqual(Array.from(result.masters,master=>master.name),['Сергей','Борис','Антон']);
  assert.deepEqual(Array.from(result.masters,master=>master.servicesRevenue),[240000,180000,120000]);
  assert.deepEqual(Array.from(result.masters,master=>master.planPercent),[120,90,80]);
  assert.deepEqual(Array.from(result.branches,branch=>branch.planPercent),[80,50]);
});

test('duplicate active master rows are removed within a branch',()=>{
  const runtime=rankingRuntime();
  const result=runtime.buildNetworkRanking([
    branch('694866','Менделеева',[
      {id:1,name:'Иван',monthTotal:10},
      {id:999,name:'  ИВАН  ',monthTotal:10}
    ],[{name:'Иван',servicesTotal:100000,goodsTotal:5000,servicesGoal:120000}]),
    branch('1076318','Энтузиастов',[],[])
  ]);
  assert.equal(result.masters.filter(master=>master.branchId==='694866').length,1);
});

test('fresh payload values replace prior monthly figures on every rebuild',()=>{
  const runtime=rankingRuntime();
  const initial=runtime.buildNetworkRanking([
    branch('694866','Менделеева',[{id:1,name:'Иван',monthTotal:10}],[{name:'Иван',servicesTotal:100000,goodsTotal:5000,servicesGoal:200000}],{services:100000,goods:5000,clients:10,goal:40}),
    branch('1076318','Энтузиастов',[],[])
  ]);
  const refreshed=runtime.buildNetworkRanking([
    branch('694866','Менделеева',[{id:1,name:'Иван',monthTotal:14}],[{name:'Иван',servicesTotal:145000,goodsTotal:8000,servicesGoal:200000}],{services:145000,goods:8000,clients:14,goal:40}),
    branch('1076318','Энтузиастов',[],[])
  ]);
  assert.equal(initial.masters[0].servicesRevenue,100000);
  assert.equal(refreshed.masters[0].servicesRevenue,145000);
  assert.equal(refreshed.masters[0].clients,14);
  assert.equal(refreshed.branches[0].goods,8000);
});

test('rotation order and timing include network and optional announcements',()=>{
  assert.match(html,/const networkScreen=\{id:'networkScreen',duration:30000/);
  assert.match(html,/const screens=\[dashboardScreen,networkScreen,scheduleScreen,announcementScreen\]/);
  assert.match(html,/const announcementScreen=\{id:'rotationAnnouncementScreen',duration:15000/);
  assert.match(html,/if\(screen\.id==='rotationAnnouncementScreen'\)return announcementItems\.length>0/);
});

test('both numeric branch links are accepted without changing branch calculations',()=>{
  assert.match(html,/const cid=BR\[key\]\|\|\(\/\^\\d\+\$\/\.test\(key\)\?key:BR\.mendeleeva\)/);
  assert.equal((html.match(/function render\(d\)/g)||[]).length,1);
  assert.match(html,/Object\.assign\(\{\},json\.data,\{branchId:String\(companyId\)\}\)/);
});
