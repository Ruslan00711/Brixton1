'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const html=fs.readFileSync(path.join(__dirname,'..','admin.html'),'utf8');

test('admin exposes branch-scoped TV visibility controls for masters',()=>{
  assert.match(html,/const WEBAPP_URL='\/legacy-api'/);
  assert.match(html,/tvHiddenMasters=\{'694866':\[\],'1076318':\[\]\}/);
  assert.match(html,/checkbox\.className='tv-visibility-input'/);
  assert.match(html,/Показывать на TV/);
  assert.match(html,/Показывать/);
  assert.match(html,/Скрыт/);
});

test('saving goals sends TV exclusions through the existing authenticated admin request',()=>{
  assert.match(html,/tvHiddenMasters\[bid\]=\[\]/);
  assert.match(html,/apiPost\('saveGoals',\{goals:goals,salesGoals:salesGoals,masterGoals:masterGoals,tvHiddenMasters:tvHiddenMasters\}\)/);
});

test('visibility matching is stable by staff id with a name fallback',()=>{
  assert.match(html,/Number\(item\.staffId\)>0&&Number\(item\.staffId\)===Number\(master\.staffId\)/);
  assert.match(html,/String\(item\.name\|\|''\)\.trim\(\)\.toLowerCase\(\)===String\(master\.name\|\|''\)\.trim\(\)\.toLowerCase\(\)/);
});
