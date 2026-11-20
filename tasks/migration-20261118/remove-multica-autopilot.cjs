const fs=require('fs');
const edit=(f,fn)=>{const s=fs.readFileSync(f,'utf8');const t=fn(s);if(t===s)throw Error('no change '+f);fs.writeFileSync(f,t);console.log('edited',f);};
for(const d of ['recovered/shared/multica','recovered/esm/000-extension.js/multica']){
  edit(d+'/hooks.mjs',s=>s.replace(/import \{ autopilotFeature \} from "\.\/autopilot\.mjs";\r?\n/,'').replace('permissionsFeature, autopilotFeature, ','permissionsFeature, '));
  edit(d+'/core.mjs',s=>s.replace(/  autopilot: \{ enabled: false, tickMs: 30000, jobs: \[\] \},\r?\n/,''));
  fs.unlinkSync(d+'/autopilot.mjs');console.log('deleted',d+'/autopilot.mjs');
}
edit('scripts/test-multica-borrow.mjs',s=>{const a=s.indexOf('test("m09 autopilot');const b=s.indexOf('test("m10 skills-lock');if(a<0||b<a)throw Error('anchors');return s.slice(0,a)+'// m09 multica autopilot removed (2026-11-19): superseded by autopilot-store.mjs (Automations), see test-work-automation.mjs\n'+s.slice(b);});
