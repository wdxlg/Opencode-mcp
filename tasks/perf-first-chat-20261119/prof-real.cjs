// 用用户真实数据的副本（opencode/data/user-data → .recovery-profile）和真实 HOME 启动发布版，
// 对扩展宿主做 CPU 剖析：打开对话，发一句「你好」，记录到首个回复的时间。不改动 opencode/data。
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root='E:/OpenCode-Source-Recovery-20261013',app=root+'/opencode',exe=app+'/OpenCode.exe';
const out=root+'/generated/validation/prof-real-'+Date.now();fs.mkdirSync(out,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const src=fs.readFileSync(root+'/scripts/test-ui-e2e-chat.cjs','utf8');const lp=src.slice(src.indexOf('function loadPlaywright'),src.indexOf('// ---------- 验证扩展'));
const os=require('os');eval(lp+';globalThis.__lp=loadPlaywright;');
const portable=app+'/.recovery-profile';
if(fs.existsSync(portable))fs.renameSync(portable,out+'/prev-recovery-profile');
fs.mkdirSync(portable,{recursive:true});fs.cpSync(app+'/data/user-data',portable+'/user-data',{recursive:true,filter:s=>!/[\\/](Cache|Code Cache|GPUCache|CachedData|logs|Crashpad|DawnGraphiteCache|DawnWebGPUCache|Service Worker)$/.test(s)});
for(const d of ['shared-data','extensions'])if(fs.existsSync(app+'/data/'+d))fs.cpSync(app+'/data/'+d,portable+'/'+d,{recursive:true});
let ws,mid=0;const pend={};
async function cdp(port,method,params={}){if(!ws){const l=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();ws=new WebSocket(l[0].webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend[m.id]){pend[m.id](m);delete pend[m.id];}};}const id=++mid;return new Promise(r=>{pend[id]=r;ws.send(JSON.stringify({id,method,params}));});}
(async()=>{
  const port=51700+Math.floor(Math.random()*200),iport=port+7;
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.VSCODE_IPC_HOOK_CLI;
  const child=cp.spawn(exe,['--new-window','--skip-welcome','--skip-release-notes','--remote-debugging-port='+port,'--inspect-extensions='+iport],{cwd:app,env,stdio:'ignore'});
  setTimeout(()=>{cp.spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F']);process.exit(3);},240000).unref();
  const res={};
  try{
    const pw=globalThis.__lp();let browser;
    for(let i=0;i<60&&!browser;i++){try{browser=await pw.chromium.connectOverCDP('http://127.0.0.1:'+port,{timeout:5000});}catch{await delay(1000);}}
    let page;for(let i=0;i<60&&!page;i++){for(const c of browser.contexts())for(const p of c.pages())if(/workbench/.test(p.url()))page=p;if(!page)await delay(500);}
    await page.waitForSelector('.monaco-workbench',{timeout:60000});
    for(let i=0;i<60;i++){try{await (await fetch('http://127.0.0.1:'+iport+'/json/list')).json();break;}catch{await delay(1000);}}
    await delay(8000);
    if(!(await page.locator('.interactive-input-part .monaco-editor').first().isVisible().catch(()=>false))){await page.keyboard.press('Control+Alt+I');await delay(2000);}
    const input=page.locator('.interactive-input-part .monaco-editor').first();await input.click({timeout:15000});
    await cdp(iport,'Profiler.enable');await cdp(iport,'Profiler.setSamplingInterval',{interval:1000});await cdp(iport,'Profiler.start');
    const n0=await page.locator('.interactive-response').count();
    await page.keyboard.type('你好');const t0=Date.now();await page.keyboard.press('Enter');
    let tFirst=null;for(let i=0;i<900;i++){await delay(100);const t=await page.evaluate(()=>{const r=[...document.querySelectorAll('.interactive-response .rendered-markdown')];return r.length?r[r.length-1].innerText.trim():'';});if(t&&(await page.locator('.interactive-response').count())>n0){tFirst=Date.now()-t0;res.reply=t.slice(0,80);break;}}
    res.firstTextMs=tFirst;await delay(3000);
    const r=await cdp(iport,'Profiler.stop');fs.writeFileSync(out+'/real.cpuprofile',JSON.stringify(r.result.profile));res.profile=out+'/real.cpuprofile';
  }catch(e){res.error=String(e.stack||e).slice(0,600);}
  finally{cp.spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F']);await delay(1500);
    try{fs.rmSync(portable,{recursive:true,force:true});if(fs.existsSync(out+'/prev-recovery-profile'))fs.renameSync(out+'/prev-recovery-profile',portable);}catch(e){res.restoreError=String(e);}
    console.log('PROF_REAL '+JSON.stringify(res));process.exit(0);}
})();
