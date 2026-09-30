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

function sorter(){
  const context=vm.createContext({Intl});
  vm.runInContext(readFunction('sortKpiMastersByServicesRevenue'),context);
  return context.sortKpiMastersByServicesRevenue;
}

function planPercent(){
  const context=vm.createContext({Math,Number});
  vm.runInContext(readFunction('servicesPlanPercent'),context);
  return context.servicesPlanPercent;
}

test('right-side master KPI cards sort by services revenue descending',()=>{
  const input=[
    {name:'Айгиза',servicesTotal:112000},
    {name:'Валентина',servicesTotal:'246000'},
    {name:'Дмитрий',servicesTotal:227000},
    {name:'Без выручки',servicesTotal:null}
  ];
  const result=sorter()(input);
  assert.deepEqual(Array.from(result,item=>item.name),['Валентина','Дмитрий','Айгиза','Без выручки']);
  assert.deepEqual(Array.from(input,item=>item.name),['Айгиза','Валентина','Дмитрий','Без выручки']);
});

test('equal services revenue uses a deterministic Russian-name tie-break',()=>{
  const result=sorter()([
    {name:'Яна',servicesTotal:100000},
    {name:'Анна',servicesTotal:100000}
  ]);
  assert.deepEqual(Array.from(result,item=>item.name),['Анна','Яна']);
});

test('only the right-side KPI list switches to revenue sorting',()=>{
  assert.match(html,/d\.masters=sortMasters\(d\.masters\)/);
  assert.match(html,/d\.kpiMasters=sortKpiMastersByServicesRevenue\(d\.kpiMasters\)/);
});

test('trophy score uses only the personal services-plan percentage',()=>{
  const percent=planPercent();
  assert.equal(percent({servicesTotal:180000,servicesGoal:200000,goodsTotal:300000,goodsGoal:100000}),90);
  assert.equal(percent({servicesTotal:0,servicesGoal:0}),0);
  assert.match(html,/const servicesPlanScores=kpiMasters\.map\(servicesPlanPercent\)/);
  assert.match(html,/const leader=bestServicesPlan>0&&servicesPlanScores\[idx\]===bestServicesPlan/);
  assert.doesNotMatch(html,/return Math\.max\(sp,gp\)/);
  assert.match(html,/content:'лидер по плану'/);
});
