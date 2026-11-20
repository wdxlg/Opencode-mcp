import fs from 'node:fs'; import vm from 'node:vm'; import assert from 'node:assert/strict';
const src=fs.readFileSync('E:/OpenCode-Source-Recovery-20261013/recovered/esm/002-agent-host.js/module-0029.mjs','utf8');
const a=src.indexOf('function isContextImagePart'), b=src.indexOf('// subagent-step01 / hooks-step01');
const ctx={CONTEXT_IMAGE_TOKENS:1600, contextTextOf:c=>Array.isArray(c)?c.filter(p=>p.type==='text').map(p=>p.text).join('\n'):String(c), globalThis:{process:{env:{}}}};
const f=vm.runInNewContext(src.slice(a,b)+';({offloadOldContextImages,contextMaxImages})',ctx);
const img={type:'image_url',image_url:{url:'data:x'}};
const msgs=[{role:'system',content:'s'}];
for(let i=0;i<5;i++){msgs.push({role:'user',content:[{type:'text',text:'Visual content returned by tool see_now'},img]});}
msgs.push({role:'user',content:[{type:'text',text:'q'},img,img,img]});
assert.equal(f.contextMaxImages({}),6); assert.equal(f.contextMaxImages({contextMaxImages:0}),0);
const r=f.offloadOldContextImages(msgs,2);
const left=msgs.flatMap(m=>Array.isArray(m.content)?m.content:[]).filter(p=>p.type==='image_url').length;
assert.equal(left,3); assert.equal(r.count,5);
assert.equal(f.offloadOldContextImages(msgs,0).count,0);
console.log('PASS image offload: newest user msg keeps all, older tool images replaced', JSON.stringify(r));
