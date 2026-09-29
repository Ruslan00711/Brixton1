'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createGateway}=require('../runtime/gateway.cjs');

const authSource=fs.readFileSync(path.join(__dirname,'..','runtime','apps-script','LEGACY_DEVICE_AUTH.js'),'utf8');
const tvAuthSource=fs.readFileSync(path.join(__dirname,'..','runtime','public','legacy-assets','tv-auth.js'),'utf8');
const token='btv1_'+'a'.repeat(64);

function authRuntime(){
  const records={};
  const digest='digest';
  records['BRIXTON_TV_DEVICE_V1_'+digest]=JSON.stringify({
    id:'existing-device',name:'Existing TV',organization_id:'6a778c5d-e8be-49b5-a273-130691b3116f',
    company_id:'694866',branch_id:'1bb7d94c-2fd4-4867-adc0-3cf62e7ae822',
    scopes:['tv.board.read','tv.schedule.read'],created_at:'2026-09-01T00:00:00.000Z',expires_at:'2027-09-01T00:00:00.000Z',revoked_at:null
  });
  const calls=[];
  const context=vm.createContext({
    Date,JSON,Object,Array,isFinite,
    Utilities:{DigestAlgorithm:{SHA_256:'sha'},Charset:{UTF_8:'utf8'},computeDigest(){return [0];}},
    PropertiesService:{getScriptProperties(){return{
      getProperty(key){return records[key.replace(/[0-9a-f]{64}$/,'digest')]||null;},
      getProperties(){return records;},setProperty(key,value){records[key]=value;}
    }}},
    LockService:{getScriptLock(){return{tryLock(){return true;},releaseLock(){}};}},
    jsonResponse_(value){return value;},
    doGetTvBoard(companyId){calls.push(String(companyId));return{branchId:String(companyId),branchName:String(companyId),masters:[],kpiMasters:[],clients:{},sales:{}};},
    doGetTablo(){return[];},requireAdminToken_(){},buildFreeSlots(){}
  });
  vm.runInContext(authSource,context);
  context.legacyTvDigest_=()=>digest;
  return{context,calls};
}

test('an existing branch-scoped TV token can read only the fixed two-branch network aggregate',()=>{
  const {context,calls}=authRuntime();
  const result=context.legacyTvRead_({
    action:'getNetworkTvBoard',organization_id:'6a778c5d-e8be-49b5-a273-130691b3116f',company_id:'694866',deviceToken:token
  });
  assert.equal(result.success,true);
  assert.deepEqual(Array.from(calls),['694866','1076318']);
  assert.deepEqual(Array.from(result.data.branches,branch=>String(branch.branchId)),['694866','1076318']);
});

test('network read reuses tv.board.read and does not mutate or replace device sessions',()=>{
  assert.match(authSource,/var boardAction = body\.action === 'getTvBoard' \|\| body\.action === 'getNetworkTvBoard'/);
  assert.match(authSource,/var scope = boardAction \? 'tv\.board\.read' : 'tv\.schedule\.read'/);
  assert.doesNotMatch(authSource,/scopes:\['tv\.network\.read'/);
  assert.match(authSource,/LEGACY_TV_BRANCHES_\.map/);
});

test('gateway accepts network reads only as authenticated POST device actions',async()=>{
  const seen=[];
  const transport=async(_url,options)=>{
    const body=JSON.parse(options.body);seen.push(body);
    return new Response(JSON.stringify({success:true,data:{branches:[]}}),{status:200});
  };
  const server=createGateway({transport,publicRoot:path.join(__dirname,'..','runtime','public')});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  try{
    let response=await fetch(base+'/legacy-api?action=getNetworkTvBoard');
    assert.equal(response.status,405);
    response=await fetch(base+'/legacy-api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      action:'getNetworkTvBoard',organization_id:'6a778c5d-e8be-49b5-a273-130691b3116f',company_id:'694866',deviceToken:token
    })});
    assert.equal(response.status,200);
    assert.equal(seen[0].action,'getNetworkTvBoard');
    assert.equal(seen[0].deviceToken,token);
  }finally{
    await new Promise(resolve=>server.close(resolve));
  }
});

test('Smart TV auth keeps persistent tokens and accepts numeric branch URLs',()=>{
  assert.match(tvAuthSource,/localStorage\.getItem\(key\)/);
  assert.match(tvAuthSource,/localStorage\.setItem\(key,JSON\.stringify\(data\)\)/);
  assert.match(tvAuthSource,/\['694866','1076318'\]\.indexOf\(branchName\)/);
  assert.match(tvAuthSource,/body=\{action:actionFromUrl\(url\),organization_id:TENANT,company_id:branch\}/);
});
