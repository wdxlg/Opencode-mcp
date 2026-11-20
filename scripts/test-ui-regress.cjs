// OpenCode p34: Playwright UI 回归测试——侧栏拖拽开始/结束不留拖拽状态、窗内浮窗打开/关闭、隐式文件附件点 X 能移除
// 启动恢复版 opencode/OpenCode.exe（独立 user-data / extensions / TEMP / 共享自动化目录，参照 Start-Isolated.cmd 与 test-gui-live-bridge.cjs），
// 通过 --remote-debugging-port + Playwright connectOverCDP 驱动界面；只结束自己启动的进程树，不碰正在运行的 E:\opencode。
// 用法：node scripts/test-ui-regress.cjs   （npm run test:ui-regress）
// 可选环境变量：OPENCODE_UI_APP=<OpenCode.exe 路径>  PLAYWRIGHT_CORE=<playwright-core 包目录>  OC_FLOAT_COMMAND=<浮窗命令 id>  OC_UI_KEEP=1（结束后不关窗口）
const __runId=process.env.OPENCODE_VALIDATION_RUN||String(Date.now());
if(!/^[A-Za-z0-9_-]+$/.test(__runId))throw Error('Invalid validation run ID');
(()=>{const fs=require('fs'),path=require('path');const root=process.env.OPENCODE_RECOVERY_ROOT||path.resolve(__dirname,'..');if(!fs.existsSync(root+'/reports/bundle-manifest.json'))throw Error('Not a recovery workspace');fs.mkdirSync(root+'/reports/validation/'+__runId,{recursive:true});})();
const fs=require('fs'),path=require('path'),cp=require('child_process'),net=require('net'),os=require('os');
const root=(process.env.OPENCODE_RECOVERY_ROOT||path.resolve(__dirname,'..'));
const appExe=process.env.OPENCODE_UI_APP||path.join(root,'opencode','OpenCode.exe');
const area=root+'/generated/validation/'+__runId+'/ui-regress',profile=area+'/profile',workspace=area+'/workspace',extension=area+'/validation-extension',channel=area+'/channel';
const delay=ms=>new Promise(r=>setTimeout(r,ms));

// ---------- Playwright：优先 npm 包，其次 PLAYWRIGHT_CORE，最后用 Python 版 playwright 自带的 node driver 包 ----------
function loadPlaywright(){
  const tried=[];
  const tryReq=p=>{try{const m=require(p);if(m&&m.chromium)return m;}catch(e){tried.push(p+': '+String(e.message).split('\n')[0]);}return null;};
  if(process.env.PLAYWRIGHT_CORE){const m=tryReq(process.env.PLAYWRIGHT_CORE);if(m)return m;}
  for(const n of ['playwright-core','playwright']){const m=tryReq(n);if(m)return m;}
  const cands=[];
  const addVenvs=base=>{try{for(const d of fs.readdirSync(base)){for(const v of ['.venv','venv']){cands.push(path.join(base,d,v,'Lib','site-packages','playwright','driver','package'));}}}catch{}};
  addVenvs('E:/ai工作区');
  const la=process.env.LOCALAPPDATA||path.join(os.homedir(),'AppData','Local');
  try{for(const d of fs.readdirSync(path.join(la,'Programs','Python')))cands.push(path.join(la,'Programs','Python',d,'Lib','site-packages','playwright','driver','package'));}catch{}
  for(const c of cands){if(fs.existsSync(path.join(c,'package.json'))){const m=tryReq(c);if(m)return m;}}
  throw Error('找不到 Playwright（node 包）。设 PLAYWRIGHT_CORE=<playwright-core 目录> 或 npm i -D playwright-core。尝试过：\n'+tried.join('\n'));
}

// ---------- 验证扩展：文件通道，测试端写 req-*.json，扩展执行命令后写 res-*.json ----------
function extMain(exports,require,CHANNEL){
  const vscode=require('vscode'),fs=require('fs'),path=require('path');
  const safe=v=>{try{return JSON.parse(JSON.stringify(v===undefined?null:v));}catch{return String(v);}};
  exports.activate=async()=>{
    let busy=false;
    const tick=async()=>{if(busy)return;busy=true;try{
      for(const f of fs.readdirSync(CHANNEL).filter(x=>/^req-\d+\.json$/.test(x)).sort()){
        const p=path.join(CHANNEL,f);let req;try{req=JSON.parse(fs.readFileSync(p,'utf8'));}catch{continue;}try{fs.unlinkSync(p);}catch{}
        let out;
        try{
          let res;
          if(req.op==='commands')res=await vscode.commands.getCommands(true);
          else if(req.op==='open'){const d=await vscode.workspace.openTextDocument(vscode.Uri.file(req.file));await vscode.window.showTextDocument(d,{preview:false});res=true;}
          else res=await vscode.commands.executeCommand(req.command,...(req.args||[]));
          out={ok:true,result:safe(res)};
        }catch(e){out={ok:false,error:String(e&&e.stack||e)};}
        const tmp=path.join(CHANNEL,'res-'+req.id+'.tmp');fs.writeFileSync(tmp,JSON.stringify(out));fs.renameSync(tmp,path.join(CHANNEL,'res-'+req.id+'.json'));
      }
    }catch{}finally{busy=false;}};
    const timer=setInterval(tick,150);
    fs.writeFileSync(path.join(CHANNEL,'ready.json'),JSON.stringify({at:Date.now()}));
    return {dispose(){clearInterval(timer);}};
  };
  exports.deactivate=()=>{};
}
let reqId=0;
async function ext(op,extra={},timeoutMs=20000){
  const id=++reqId,tmp=channel+'/req-'+id+'.tmp';fs.writeFileSync(tmp,JSON.stringify({id,op,...extra}));fs.renameSync(tmp,channel+'/req-'+id+'.json');
  const resPath=channel+'/res-'+id+'.json',t0=Date.now();
  while(Date.now()-t0<timeoutMs){if(fs.existsSync(resPath)){const r=JSON.parse(fs.readFileSync(resPath,'utf8'));fs.unlinkSync(resPath);if(!r.ok)throw Error(op+' '+(extra.command||'')+' failed: '+r.error);return r.result;}await delay(100);}
  throw Error('extension channel timeout: '+op+' '+(extra.command||''));
}
const runCommand=(command,...args)=>ext('exec',{command,args});

// ---------- 页面内的检查函数（在渲染进程里执行） ----------
// 拖拽残留：带 drag/drop/dnd 字样且可见的元素类名、workbench/body 上的拖拽类、各 part 的 pointer-events，以及各 part 中心点是否被遮挡
const snapshotDragState=()=>{
  const vis=el=>{const r=el.getBoundingClientRect();if(r.width<=0||r.height<=0)return false;const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&cs.opacity!=='0';};
  const re=/(^|[\s_-])(drag|dragging|dragged|dragover|drag-over|dragged-over|drop-target|drop-overlay|dnd|drop-block-overlay)([\s_-]|$)/i;
  const marks=new Set();
  for(const el of document.querySelectorAll('[class]')){const c=typeof el.className==='string'?el.className:el.getAttribute('class')||'';if(!re.test(c))continue;if(!vis(el))continue;marks.add(el.tagName.toLowerCase()+'.'+c.trim().split(/\s+/).sort().join('.'));}
  const wb=document.querySelector('.monaco-workbench');
  const rootClasses=[...document.body.classList,...(wb?[...wb.classList]:[])].filter(c=>/drag|dnd|drop/i.test(c));
  const parts={};
  for(const name of ['sidebar','editor','auxiliarybar','panel','activitybar']){
    const el=document.querySelector('.monaco-workbench .part.'+name);if(!el||!vis(el)){parts[name]=null;continue;}
    const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+Math.min(r.height/2,r.height-4);const hit=document.elementFromPoint(x,y);
    parts[name]={pointerEvents:getComputedStyle(el).pointerEvents,centerHitInside:!!hit&&el.contains(hit),hit:hit?(hit.tagName.toLowerCase()+'.'+String(hit.className||'').slice(0,80)):null};
  }
  return {marks:[...marks].sort(),rootClasses,parts};
};
function diffDragState(before,after){
  const problems=[];
  const newMarks=after.marks.filter(m=>!before.marks.includes(m));if(newMarks.length)problems.push('拖拽后残留的拖拽类元素：'+newMarks.join(' | '));
  const newRoot=after.rootClasses.filter(c=>!before.rootClasses.includes(c));if(newRoot.length)problems.push('workbench/body 上残留类：'+newRoot.join(','));
  for(const [k,v] of Object.entries(after.parts)){const b=before.parts[k];if(!v||!b)continue;
    if(v.pointerEvents==='none'&&b.pointerEvents!=='none')problems.push(k+' pointer-events 变成 none');
    if(b.centerHitInside&&!v.centerHitInside)problems.push(k+' 中心点被遮挡：'+v.hit);}
  return problems;
}
async function center(loc){const b=await loc.boundingBox();if(!b)throw Error('元素不可见');return {x:b.x+b.width/2,y:b.y+b.height/2};}
async function mouseDrag(page,from,to,{cancel=false}={}){
  await page.mouse.move(from.x,from.y);await page.mouse.down();
  for(let i=1;i<=12;i++){await page.mouse.move(from.x+(to.x-from.x)*i/12,from.y+(to.y-from.y)*i/12);await delay(25);}
  if(cancel){await page.keyboard.press('Escape');await delay(100);}
  await page.mouse.up();await delay(600);
}

// ---------- 用例 ----------
async function testSidebarDrag(page){
  const steps=[];
  const before=await page.evaluate(snapshotDragState);
  const items=page.locator('.monaco-workbench .part.activitybar .action-item:visible, .monaco-workbench .composite-bar .action-item[draggable="true"]:visible');
  const n=await items.count();
  const editor=page.locator('.monaco-workbench .part.editor').first();
  if(n>=2){
    // 1) 活动栏图标拖到相邻图标再拖回（真实鼠标拖拽，开始→结束）
    const a=await center(items.nth(0)),b=await center(items.nth(1));
    await mouseDrag(page,a,b);await mouseDrag(page,await center(items.nth(1)),await center(items.nth(0)));steps.push('activitybar reorder drag');
    // 2) 拖到编辑区中途按 Esc 取消
    await mouseDrag(page,await center(items.nth(0)),await center(editor),{cancel:true});steps.push('activitybar drag cancelled with Esc');
  }else steps.push('activitybar items not found ('+n+')');
  // 3) 侧栏视图标题拖出再放回原处
  const header=page.locator('.monaco-workbench .part.sidebar .pane-header[draggable="true"]:visible').first();
  if(await header.count()){const h=await center(header);await mouseDrag(page,h,await center(editor),{cancel:true});await mouseDrag(page,h,{x:h.x,y:h.y+4});steps.push('pane header drag/cancel');}
  else steps.push('sidebar pane header not found');
  // 4) 合成事件：只有 dragstart/dragenter/dragleave/dragend，没有 drop（拖出窗口外松手的情形）
  const synth=await page.evaluate(()=>{
    const src=document.querySelector('.monaco-workbench .part.activitybar .action-item[draggable="true"], .monaco-workbench .part.sidebar .pane-header[draggable="true"], .monaco-workbench [draggable="true"]');
    const tgt=document.querySelector('.monaco-workbench .part.editor')||document.body;if(!src)return 'no draggable source';
    const dt=new DataTransfer();const fire=(el,type)=>el.dispatchEvent(new DragEvent(type,{bubbles:true,cancelable:true,composed:true,dataTransfer:dt,clientX:10,clientY:10}));
    fire(src,'dragstart');fire(tgt,'dragenter');fire(tgt,'dragover');fire(tgt,'dragleave');fire(src,'dragend');return 'ok';
  });
  steps.push('synthetic dragstart/dragend without drop: '+synth);
  await delay(800);
  const after=await page.evaluate(snapshotDragState);
  const problems=diffDragState(before,after);
  // 拖完以后侧栏还能正常点
  const sidebar=page.locator('.monaco-workbench .part.sidebar').first();
  if(await sidebar.isVisible().catch(()=>false)){try{await sidebar.click({position:{x:20,y:60},timeout:3000});}catch(e){problems.push('拖拽后侧栏无法点击：'+e.message.split('\n')[0]);}}
  return {name:'sidebar drag start/end leaves no drag state',passed:problems.length===0,steps,problems,before,after};
}

async function testFloatWindow(page){
  const steps=[],problems=[];
  const count=()=>page.evaluate(()=>({frames:document.querySelectorAll('.oc-ae-float').length,map:globalThis.__ocAeFloats?globalThis.__ocAeFloats.size:0}));
  const c0=await count();
  await runCommand('workbench.view.explorer').catch(()=>{});await delay(500);
  let opened=false;
  // 1) 指定命令；2) 名字带 float 的命令；3) 活动栏右键菜单里的“浮动/浮窗/Float”
  const cmds=[];if(process.env.OC_FLOAT_COMMAND)cmds.push(process.env.OC_FLOAT_COMMAND);
  try{const all=await ext('commands');for(const c of all)if(/float/i.test(c)&&/(view|container|part|sidebar|panel|opencode)/i.test(c)&&!/(dock|close|unfloat|toggle.*editor)/i.test(c))cmds.push(c);}catch(e){steps.push('getCommands failed: '+e.message);}
  for(const c of [...new Set(cmds)]){
    for(const args of [[],['workbench.view.explorer'],['workbench.view.explorer','container'],['workbench.explorer.fileView','view']]){
      try{await runCommand(c,...args);}catch{continue;}
      await delay(800);const c1=await count();if(c1.frames>c0.frames){opened=true;steps.push('opened via command '+c+' '+JSON.stringify(args));break;}
    }
    if(opened)break;
  }
  if(!opened){
    const item=page.locator('.monaco-workbench .part.activitybar .action-item:visible').first();
    if(await item.count()){
      await item.click({button:'right'});await delay(500);
      const entry=page.locator('.context-view .action-item .action-label, .monaco-menu .action-label').filter({hasText:/浮动|浮窗|悬浮|Float/i}).first();
      if(await entry.count()){await entry.click();await delay(1000);if((await count()).frames>c0.frames){opened=true;steps.push('opened via activitybar context menu');}}
      else{await page.keyboard.press('Escape');steps.push('no float entry in activitybar context menu');}
    }
  }
  if(!opened)return {name:'float window open/close',passed:false,skipped:true,steps,problems:['没找到打开窗内浮窗的入口（可设 OC_FLOAT_COMMAND=<命令 id>）']};
  const frame=page.locator('.oc-ae-float').last();
  if(!await frame.isVisible())problems.push('浮窗没有显示');
  const body=await frame.locator('.oc-ae-float-body').evaluate(el=>({children:el.childElementCount,w:el.clientWidth,h:el.clientHeight})).catch(()=>null);
  if(!body||!body.children)problems.push('浮窗内容为空：'+JSON.stringify(body));
  steps.push('float body '+JSON.stringify(body));
  // 拖动标头移动浮窗（按住 Ctrl 不触发停靠），确认移动后依然打开
  const head=frame.locator('.oc-ae-float-head');const h=await center(head);
  await page.keyboard.down('Control');await mouseDrag(page,{x:h.x-40,y:h.y},{x:h.x+20,y:h.y+30});await page.keyboard.up('Control');
  if((await count()).frames<=c0.frames)problems.push('拖动浮窗标头后浮窗消失');
  // 关闭：点 X，回到原处
  await frame.locator('.oc-ae-float-btn.codicon-close').click();await delay(1000);
  const c2=await count();
  if(c2.frames!==c0.frames)problems.push('关闭后浮窗仍在：frames='+c2.frames);
  if(c2.map!==c0.map)problems.push('关闭后 __ocAeFloats 未清理：size='+c2.map);
  const dockHints=await page.evaluate(()=>[...document.querySelectorAll('.oc-ae-float-dock')].filter(e=>getComputedStyle(e).display!=='none').length);
  if(dockHints)problems.push('停靠提示残留 '+dockHints+' 个');
  const restored=await page.evaluate(()=>{const p=document.querySelector('.monaco-workbench .part.sidebar');return !!p&&p.getBoundingClientRect().width>0&&!!p.querySelector('.pane-body, .monaco-pane-view, .split-view-view');});
  if(!restored)problems.push('关闭浮窗后侧栏没有恢复内容');
  return {name:'float window open/close',passed:problems.length===0,steps,problems};
}

async function testImplicitAttachment(page,file){
  const steps=[],problems=[];
  await ext('open',{file});steps.push('opened '+path.basename(file));
  for(const c of ['workbench.action.chat.open','workbench.panel.chat.view.copilot.focus']){try{await runCommand(c);steps.push('chat via '+c);break;}catch{}}
  await delay(1500);
  const sel='.interactive-input-part .chat-attached-context-attachment.implicit, .interactive-input-part .chat-implicit-context, .interactive-input-part [class*="implicit"][class*="attach"]';
  let pills=page.locator(sel).filter({hasText:/recovery-readme/});
  for(let i=0;i<20&&!(await pills.count());i++){
    if(i===5){await page.locator('.monaco-workbench .part.editor .monaco-editor').first().click().catch(()=>{});await runCommand('workbench.action.chat.open').catch(()=>{});}
    await delay(500);
  }
  if(!(await pills.count())){
    const dump=await page.evaluate(()=>[...document.querySelectorAll('.interactive-input-part .chat-attached-context, .interactive-input-part [class*="attach"]')].map(e=>e.className+' :: '+e.textContent.slice(0,120)).slice(0,10));
    return {name:'implicit file attachment X removes it',passed:false,steps,problems:['没有出现当前文件的隐式附件'],dump};
  }
  const pill=pills.first();await pill.hover();await delay(200);
  const btn=pill.locator('.chat-attached-context-pill-remove, [class*="remove"], .codicon-close, .codicon-x, .monaco-button[aria-label], a[aria-label], [role="button"][aria-label]').filter({hasNot:page.locator('.codicon-eye, .codicon-eye-closed')}).first();
  if(!(await btn.count()))return {name:'implicit file attachment X removes it',passed:false,steps,problems:['隐式附件上没有找到 X 按钮'],html:(await pill.evaluate(e=>e.outerHTML.slice(0,800)))};
  steps.push('X: '+((await btn.getAttribute('aria-label'))||(await btn.getAttribute('class'))));
  await btn.click();await delay(800);
  if(await pills.count()&&await pills.first().isVisible().catch(()=>false))problems.push('点 X 后隐式附件还在');
  // 焦点回到输入框、等一会，确认不会自己又冒出来
  await page.locator('.interactive-input-part .monaco-editor').first().click().catch(()=>{});await delay(1500);
  if(await pills.count()&&await pills.first().isVisible().catch(()=>false))problems.push('隐式附件被移除后又自己出现');
  const editorStillOpen=await page.locator('.monaco-workbench .part.editor .tab').filter({hasText:/recovery-readme/}).count();
  if(!editorStillOpen)problems.push('点 X 把编辑器里的文件也关掉了');
  return {name:'implicit file attachment X removes it',passed:problems.length===0,steps,problems};
}

// ---------- 启动 ----------
(async()=>{
  if(!fs.existsSync(appExe))throw Error('找不到恢复版程序：'+appExe);
  if(fs.existsSync(area))throw Error('UI isolation directory already exists');
  const pw=loadPlaywright();
  for(const d of [profile+'/User',workspace,extension,channel,area+'/extensions',area+'/tmp',area+'/home',area+'/roaming',area+'/local',area+'/shared-local'])fs.mkdirSync(d,{recursive:true});
  fs.writeFileSync(profile+'/User/settings.json',JSON.stringify({'telemetry.telemetryLevel':'off','update.mode':'none','extensions.autoCheckUpdates':false,'extensions.autoUpdate':false,'workbench.startupEditor':'none','workbench.enableExperiments':false,'security.workspace.trust.enabled':false,'opencode.bridge.persistentMode':false,'opencode.bridge.startupPinPage':false,'window.restoreWindows':'none','http.proxy':'http://127.0.0.1:9','http.proxySupport':'override'},null,2));
  const readme=path.join(workspace,'recovery-readme.txt');fs.writeFileSync(readme,'Isolated UI regression validation. No production data.\n');
  fs.writeFileSync(extension+'/package.json',JSON.stringify({name:'recovery-ui-regress',publisher:'recovery',version:'1.0.0',engines:{vscode:'^1.90.0'},activationEvents:['*'],main:'./extension.cjs'}));
  fs.writeFileSync(extension+'/extension.cjs','('+extMain.toString()+')(exports,require,'+JSON.stringify(channel)+');\n');
  cp.execFileSync(process.execPath,['--check',extension+'/extension.cjs']);
  const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
  // 与 Start-Isolated.cmd 一致：独立 HOME/APPDATA/LOCALAPPDATA；共享自动化目录也指到隔离区，不碰用户真实数据
  const env={...process.env,ELECTRON_RUN_AS_NODE:'',VSCODE_IPC_HOOK_CLI:'',OPENCODE_BRIDGE_SMOKE_LOCAL:'1',TEMP:area+'/tmp',TMP:area+'/tmp',USERPROFILE:area+'/home',HOME:area+'/home',APPDATA:area+'/roaming',LOCALAPPDATA:area+'/local',OPENCODE_SHARED_LOCALAPPDATA:area+'/shared-local',OPENCODE_AUTOMATION_HOME:area+'/shared-local/OpenCode/shared-automation',VSCODE_PORTABLE:path.join(path.dirname(appExe),'.recovery-profile'),HTTP_PROXY:'http://127.0.0.1:9',HTTPS_PROXY:'http://127.0.0.1:9',NO_PROXY:'127.0.0.1,localhost'};
  delete env.ELECTRON_RUN_AS_NODE;delete env.VSCODE_IPC_HOOK_CLI;delete env.OPENCODE_ORIG_TEMP_ENV;delete env.OPENCODE_PORTABLE_TEMP;
  const args=['--new-window','--user-data-dir',profile,'--extensions-dir',area+'/extensions','--extensionDevelopmentPath',extension,'--skip-welcome','--skip-release-notes','--disable-workspace-trust','--disable-updates','--disable-telemetry','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+port,'--proxy-server=127.0.0.1:9','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost',workspace];
  const child=cp.spawn(appExe,args,{cwd:workspace,env,stdio:['ignore','pipe','pipe'],windowsHide:false});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b.toString());child.stderr.on('data',b=>stderr+=b.toString());
  fs.writeFileSync(area+'/launch.json',JSON.stringify({pid:child.pid,executable:appExe,args,port,started:new Date().toISOString()},null,2));
  console.log('UI_STARTED '+JSON.stringify({pid:child.pid,port}));
  const report={passed:false,scope:'isolated recovery GUI: sidebar drag state, in-window float open/close, implicit chat attachment removal',app:appExe,tests:[],usedRealProfile:false,sentModelMessages:false};
  let browser;
  try{
    for(let i=0;i<120&&!fs.existsSync(channel+'/ready.json');i++){if(child.exitCode!==null)throw Error('OpenCode exited early: '+child.exitCode);await delay(1000);}
    if(!fs.existsSync(channel+'/ready.json'))throw Error('validation extension did not activate');
    browser=await pw.chromium.connectOverCDP('http://127.0.0.1:'+port,{timeout:30000});
    let page;for(let i=0;i<60&&!page;i++){for(const c of browser.contexts())for(const p of c.pages())if(/workbench/.test(p.url())&&!page)page=p;if(!page)await delay(500);}
    if(!page)throw Error('workbench page not found over CDP');
    await page.waitForSelector('.monaco-workbench .part.editor',{timeout:60000});await delay(1500);
    for(const [fn,...a] of [[testSidebarDrag],[testFloatWindow],[testImplicitAttachment,readme]]){
      let r;try{r=await fn(page,...a);}catch(e){r={name:fn.name,passed:false,problems:['异常：'+(e.stack||e)]};}
      try{r.screenshot=area+'/'+fn.name+'.png';await page.screenshot({path:r.screenshot});}catch{}
      report.tests.push(r);console.log((r.passed?'PASS ':r.skipped?'SKIP ':'FAIL ')+r.name+(r.problems?.length?' :: '+r.problems.join(' ; '):''));
      await page.keyboard.press('Escape').catch(()=>{});
    }
    report.passed=report.tests.every(t=>t.passed);
  }catch(e){report.error=e.stack||String(e);report.passed=false;}
  finally{
    try{await browser?.close();}catch{}
    report.exitCodeBeforeCleanup=child.exitCode;
    if(child.exitCode===null&&process.env.OC_UI_KEEP!=='1'){const stop=cp.spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{encoding:'utf8',timeout:10000,windowsHide:true});report.cleanup={ownedPid:child.pid,status:stop.status};}
    report.stdout=stdout.slice(-1500);report.stderr=stderr.slice(-3000);
    fs.writeFileSync(root+'/reports/validation/'+__runId+'/ui-regress-test.json',JSON.stringify(report,null,2),{flag:'wx'});
    console.log('UI_REGRESS_RESULT '+JSON.stringify({passed:report.passed,error:report.error,tests:report.tests.map(t=>({name:t.name,passed:t.passed,skipped:!!t.skipped,problems:t.problems}))}));
    if(!report.passed)process.exitCode=1;
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
