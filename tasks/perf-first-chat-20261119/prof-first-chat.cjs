// OpenCode 实测：恢复版 GUI + 模拟 OpenAI 兼容服务——配置模型、原生对话工具调用、Tab 补全、任务面板。不联网、不用真实数据，只结束自己启动的进程树。
// OpenCode p34: Playwright UI 回归测试——侧栏拖拽开始/结束不留拖拽状态、窗内浮窗打开/关闭、隐式文件附件点 X 能移除
// 启动恢复版 opencode/OpenCode.exe（独立 user-data / extensions / TEMP / 共享自动化目录，参照 Start-Isolated.cmd 与 test-gui-live-bridge.cjs），
// 通过 --remote-debugging-port + Playwright connectOverCDP 驱动界面；只结束自己启动的进程树，不碰正在运行的 E:\opencode。
// 用法：node scripts/test-ui-regress.cjs   （npm run test:ui-regress）
// 可选环境变量：OPENCODE_UI_APP=<OpenCode.exe 路径>  PLAYWRIGHT_CORE=<playwright-core 包目录>  OC_FLOAT_COMMAND=<浮窗命令 id>  OC_UI_KEEP=1（结束后不关窗口）
const MANUAL=process.env.OC_E2E_MANUAL==='1';const SEED_REL='/generated/validation/e2e-model-seed';let TARGET=/mock-chat/;
const __runId=process.env.OPENCODE_VALIDATION_RUN||String(Date.now());
if(!/^[A-Za-z0-9_-]+$/.test(__runId))throw Error('Invalid validation run ID');
(()=>{const fs=require('fs'),path=require('path');const root=process.env.OPENCODE_RECOVERY_ROOT||path.resolve(__dirname,'..');if(!fs.existsSync(root+'/reports/bundle-manifest.json'))throw Error('Not a recovery workspace');fs.mkdirSync(root+'/reports/validation/'+__runId,{recursive:true});})();
const fs=require('fs'),path=require('path'),cp=require('child_process'),net=require('net'),os=require('os');
const root=(process.env.OPENCODE_RECOVERY_ROOT||path.resolve(__dirname,'..'));
const appExe=process.env.OPENCODE_UI_APP||path.join(root,'opencode','OpenCode.exe');
const area=root+'/generated/validation/'+__runId+'/ui-e2e-chat',profile=area+'/profile',workspace=area+'/workspace',extension=area+'/validation-extension',channel=area+'/channel';
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
          else if(req.op==='fire'){vscode.commands.executeCommand(req.command,...(req.args||[])).then(()=>{},()=>{});res=true;}
          else if(req.op==='lm'){const ms=await vscode.lm.selectChatModels({});res=ms.map(m=>({id:m.id,vendor:m.vendor,name:m.name,family:m.family}));}
          else if(req.op==='text'){const d=vscode.window.activeTextEditor?.document;res=d?d.getText():null;}
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


// ---------- 模拟 OpenAI 兼容服务（只听 127.0.0.1，不联网） ----------
const http=require('http');const mockLog=[];
function startMock(){return new Promise(resolve=>{const srv=http.createServer((req,res)=>{let b='';req.on('data',c=>b+=c);req.on('end',()=>{
  let body={};try{body=JSON.parse(b||'{}');}catch{}
  const entry={at:Date.now(),url:req.url,method:req.method,model:body.model,stream:body.stream,nmsg:(body.messages||[]).length,tools:(body.tools||[]).map(t=>t.function?.name||t.name),max_tokens:body.max_tokens??body.max_completion_tokens,chars:JSON.stringify(body.messages||[]).length};mockLog.push(entry);
  if(/\/models$/.test(req.url)){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({object:'list',data:[{id:'mock-chat',object:'model',context_length:128000}]}));return;}
  const msgs=body.messages||[];const text=m=>typeof m?.content==='string'?m.content:Array.isArray(m?.content)?m.content.map(p=>p.text||'').join('\n'):'';
  const all=msgs.map(text).join('\n');const hasToolResult=msgs.some(m=>m.role==='tool');const lastUser=[...msgs].reverse().find(m=>m.role==='user');
  let reply=null,call=null;
  if(/function add\(a, b\)/.test(text(lastUser))&&!(body.tools||[]).length)reply='  return a + b;';
  else if(/E2E_TOOL/.test(all)&&!hasToolResult){const names=entry.tools;const ok=n=>!/^(bridge|mcp|github)_/i.test(n);const rn=names.find(n=>/^(opencode_|copilot_)?read_?file$/i.test(n))||names.find(n=>ok(n)&&/read_?file/i.test(n))||names.find(n=>ok(n)&&/read/i.test(n));entry.toolPicked=rn;if(rn)call={name:rn,args:{path:'recovery-readme.txt',file_path:'recovery-readme.txt',filePath:'recovery-readme.txt'}};else reply='E2E_NO_READ_TOOL';}
  else if(/E2E_TOOL/.test(all)&&hasToolResult){const tr=msgs.filter(m=>m.role==='tool').map(text).join('\n');entry.toolResult=tr.slice(0,300);reply=/Isolated/.test(tr)?'E2E_ANSWER_OK 读到了文件。':'E2E_TOOL_RESULT_MISSING '+tr.slice(0,80);}
  else reply='E2E_DEFAULT_REPLY';
  entry.reply=reply||('call '+call.name);
  const usage={prompt_tokens:Math.ceil(entry.chars/4),completion_tokens:10,total_tokens:Math.ceil(entry.chars/4)+10};
  const chunks=call?[{choices:[{index:0,delta:{role:'assistant',tool_calls:[{index:0,id:'call_e2e_1',type:'function',function:{name:call.name,arguments:JSON.stringify(call.args)}}]}}]},{choices:[{index:0,delta:{},finish_reason:'tool_calls'}],usage}]
    :[{choices:[{index:0,delta:{role:'assistant',content:reply}}]},{choices:[{index:0,delta:{},finish_reason:'stop'}],usage}];
  if(body.stream===false){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({id:'x',object:'chat.completion',choices:[{index:0,message:call?{role:'assistant',content:null,tool_calls:[{id:'call_e2e_1',type:'function',function:{name:call.name,arguments:JSON.stringify(call.args)}}]}:{role:'assistant',content:reply},finish_reason:call?'tool_calls':'stop'}],usage}));return;}
  res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache'});
  for(const c of chunks)res.write('data: '+JSON.stringify({id:'x',object:'chat.completion.chunk',model:body.model,...c})+'\n\n');res.end('data: [DONE]\n\n');
});});srv.listen(0,'127.0.0.1',()=>resolve({srv,port:srv.address().port}));});}

async function quickInputType(page,text){const box=page.locator('.quick-input-widget input').first();await box.waitFor({state:'visible',timeout:10000});await box.fill(text);await page.keyboard.press('Enter');await delay(500);}

async function providerFrame(page,steps){let seen=[];for(let i=0;i<40;i++){seen=[];for(const f of page.frames()){if(f===page.mainFrame())continue;try{const t=(await f.locator('body').innerText({timeout:1000})).replace(/\s+/g,' ');seen.push(f.url().slice(0,60)+' => '+t.slice(0,80));if(await f.locator('button').count()&&/提供商|供应商|扫描|导入|Base ?URL|API/i.test(t))return f;}catch{}}await delay(500);}steps.push('frames: '+seen.join(' || ').slice(0,800));return null;}
async function clickText(f,re){const b=f.locator('button, [role="button"], a').filter({hasText:re}).first();if(await b.count()){await b.click();return true;}return false;}
async function testConfigureModel(page){
  const steps=[],problems=[];
  await ext('fire',{command:'opencode.manageProviders'});
  const f=await providerFrame(page,steps);
  if(!f){problems.push('没打开「模型提供商」页面');return {name:'configure mock model',passed:false,steps,problems};}
  steps.push('buttons: '+(await f.locator('button').allInnerTexts()).map(t=>t.trim()).filter(Boolean).slice(0,30).join('|'));
  if(!(await clickText(f,/扫描|检测|从其他应用导入|导入/)))problems.push('没找到扫描/导入按钮');
  await delay(2500);
  steps.push('after scan: '+(await f.locator('body').innerText()).replace(/\s+/g,' ').slice(0,500));
  const imp=await clickText(f,/全部导入|导入全部|一键导入/)||await clickText(f,/^\s*导入\s*$/);
  steps.push('import clicked: '+imp);await delay(2500);
  let models=[];for(let i=0;i<20;i++){models=await ext('lm').catch(()=>[]);if(models.some(m=>/mock-chat/.test(m.id+m.name)))break;await delay(1000);}
  steps.push('lm models: '+JSON.stringify(models.slice(0,6)));steps.push('mock so far: '+JSON.stringify(mockLog.map(r=>r.url+' '+(r.reply||''))).slice(0,400));
  if(!models.some(m=>/mock-chat/.test(m.id+m.name)))problems.push('模型列表里没有 mock-chat');
  await page.keyboard.press('Escape').catch(()=>{});
  return {name:'configure mock model',passed:problems.length===0,steps,problems};
}
async function testManualModel(page){
  const steps=[],problems=[];
  let models0=(await ext('lm').catch(()=>[])).filter(m=>m.vendor==='opencode');for(let i=0;i<15&&globalThis.__ocSeeded&&!models0.length;i++){await delay(1000);models0=(await ext('lm').catch(()=>[])).filter(m=>m.vendor==='opencode');}
  if(!models0.length){await ext('fire',{command:'opencode.manageProviders'});globalThis.__ocNeedSave=true;}
  console.log(models0.length?'MODEL_FROM_SEED':'MANUAL_WAIT 请在弹出的隔离 OpenCode 窗口「模型提供商」页添加一个模型（最多等 15 分钟）');
  let models=[];for(let i=0;i<900;i++){models=(await ext('lm').catch(()=>[])).filter(m=>m.vendor==='opencode');if(models.length)break;await delay(1000);}
  steps.push('lm models: '+JSON.stringify(models.map(m=>m.name).slice(0,6)));
  if(!models.length){problems.push('15 分钟内没有检测到手动添加的模型');return {name:'manual model configured',passed:false,steps,problems};}
  await delay(3000);models=(await ext('lm').catch(()=>[])).filter(m=>m.vendor==='opencode');
  const name=models[0].name;TARGET=new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));steps.push('target: '+name);console.log('MANUAL_MODEL '+name);
  return {name:'manual model configured',passed:true,steps,problems};
}
async function testProviderUi(page){
  const steps=[],problems=[];
  await ext('fire',{command:'opencode.manageProviders'});
  const f=await providerFrame(page,steps);if(!f)return {name:'provider editor ui',passed:false,steps,problems:['没打开模型提供商页']};
  await delay(800);
  const ed=f.locator('[data-edit]').first();steps.push('edit buttons: '+await f.locator('[data-edit]').count());
  if(await ed.count())await ed.click();
  await delay(800);
  const tog=f.locator('#fModelList button').filter({hasText:/^$/});steps.push('row buttons: '+await tog.count());
  for(let i=0;i<await f.locator('#fModelList .mrow, #fModelList > div').count()&&i<2;i++){}
  const exp=f.locator('#fModelList [data-mexp]');steps.push('expanders: '+await exp.count());if(await exp.count())await exp.first().click().catch(()=>{});
  await delay(500);
  const info=await f.evaluate(()=>({text:(document.getElementById('fModelList')||document.body).innerText.replace(/\s+/g,' ').slice(0,500),ph:[...document.querySelectorAll('input[data-mf]')].map(i=>i.getAttribute('data-mf')+'='+i.placeholder)}));
  steps.push('models: '+info.text);steps.push('placeholders: '+info.ph.join(' | '));
  if(/未填写或未从接口发现|计算）|按 .* 计算/.test(info.text+info.ph.join(' ')))problems.push('还有啰嗦的说明文字');
  try{await page.screenshot({path:area+'/provider-ui.png'});}catch{}
  return {name:'provider editor ui',passed:problems.length===0,steps,problems};
}
async function pickChatModel(page,steps,problems){
  const btn=page.locator('.interactive-input-part .chat-model-picker-item, .interactive-input-part [class*="model-picker"] .action-label, .interactive-input-part .action-item .action-label').filter({hasText:MANUAL?/./:/mock|模型|Auto|auto|gpt|Model/i}).first();
  if(!(await btn.count()))return 'no picker';
  steps.push('picker label: '+(await btn.innerText().catch(()=>'')));
  await btn.click().catch(()=>{});await delay(900);
  const mp=await page.evaluate(()=>{const e=document.querySelector('.oc-mp');return e?e.innerText.replace(/\s+/g,' ').slice(0,600):null;});
  steps.push('picker popup: '+mp);
  const item=page.locator('.oc-mp [role="option"], .oc-mp .oc-mp-item, .oc-mp li, .monaco-list-row, .action-widget .monaco-list-row').filter({hasText:TARGET}).first();
  let r='target not in picker';
  if(await item.count()){await item.click();await delay(600);r='picked';}
  if(await page.locator('.oc-mp').count()&&await page.locator('.oc-mp').first().isVisible().catch(()=>false)){await page.keyboard.press('Escape');await delay(400);}
  if(await page.locator('.oc-mp').count()&&await page.locator('.oc-mp').first().isVisible().catch(()=>false)){problems.push('模型选择弹窗按 Esc 关不掉');await page.mouse.click(5,5);await delay(400);}
  if(await page.locator('.oc-mp').count()&&await page.locator('.oc-mp').first().isVisible().catch(()=>false))problems.push('模型选择弹窗点外面也关不掉');
  return r;
}
async function testChatTool(page){
  const steps=[],problems=[];
  for(const c of ['workbench.action.chat.open','workbench.panel.chat.view.copilot.focus']){try{await runCommand(c);steps.push('chat via '+c);break;}catch{}}
  await delay(1500);
  steps.push('model picker: '+await pickChatModel(page,steps,problems));
  const input=page.locator('.interactive-input-part .monaco-editor').first();await input.click({timeout:8000}).catch(e=>problems.push('输入框点不到：'+e.message.split('\n').find(l=>/intercepts/.test(l))));await delay(300);
  await page.keyboard.type(MANUAL?'请调用读取文件的工具读取工作区里的 recovery-readme.txt，然后把文件第一行原样回复给我，不要做别的。':'E2E_TOOL 请读取 recovery-readme.txt 然后告诉我内容');await profStart();globalThis.__tSend=Date.now();await page.keyboard.press('Enter');
  const before=mockLog.length;let ok=false,last='';
  for(let i=0;i<(MANUAL?240:90);i++){await delay(1000);last=await page.evaluate(()=>[...document.querySelectorAll('.interactive-item-container')].map(e=>e.innerText).join('\n---\n').slice(-1500));if(MANUAL?/不要做别的。[\s\S]*Isolated UI regression validation/.test(last):/E2E_ANSWER_OK/.test(last)){ok=true;globalThis.__tOk=Date.now();break;}if(MANUAL&&/failed|失败|Error/i.test(last.slice(-300))&&i>20)break;if(/E2E_TOOL_RESULT_MISSING|E2E_NO_READ_TOOL/.test(last))break;}
  const reqs=mockLog.slice(before).filter(r=>/chat\/completions/.test(r.url));await profStop(steps,reqs);
  steps.push('requests: '+JSON.stringify(reqs.map(r=>({n:r.nmsg,tools:r.tools.length,picked:r.toolPicked,reply:r.reply,max_tokens:r.max_tokens}))));if(reqs[0])steps.push('tool names: '+reqs[0].tools.filter(n=>/read|file/i.test(n)).join(','));
  if(!MANUAL&&!reqs.length)problems.push('聊天没有发出模型请求');
  if(!ok)problems.push((MANUAL?'模型回复里没看到文件内容；':'没有看到 E2E_ANSWER_OK；')+'界面末尾：'+last.slice(-400).replace(/\s+/g,' '));
  if(reqs.length&&!reqs[0].tools.length)problems.push('请求里没有工具定义');
  const ring=await page.evaluate(()=>{const e=document.querySelector('[class*="context-usage"], [class*="contextUsage"], .oc-context-ring');return e?(e.getAttribute('aria-label')||e.title||e.textContent||'').slice(0,120):null;});
  steps.push('context ring: '+ring);
  return {name:'native chat with tool call ('+(MANUAL?'real':'mock')+' model)',passed:problems.length===0,steps,problems};
}
async function testTab(page,file){
  const steps=[],problems=[];
  await ext('open',{file});await delay(800);
  const ed=page.locator('.monaco-workbench .part.editor .monaco-editor .view-lines').first();await ed.click();
  await page.keyboard.press('Control+End');await page.keyboard.type('\nfunction add(a, b) {\n');
  const before=mockLog.length;let ghost=false;
  for(let i=0;i<(MANUAL?50:25);i++){await delay(600);ghost=await page.evaluate(()=>!!document.querySelector('.ghost-text-decoration, .ghost-text, .ghost-text-decoration-preview'));if(ghost)break;}
  if(MANUAL){steps.push('ghost: '+ghost);if(!ghost)problems.push('真实模型下停止输入后没有出现幽灵文本');else{const t0=String(await ext('text'));await page.keyboard.press('Tab');await delay(600);const t=String(await ext('text'));steps.push('doc tail: '+t.slice(-120));if(t.length<=t0.length)problems.push('按 Tab 后没有插入补全');}return {name:'Tab completion (real model)',passed:problems.length===0,steps,problems};}
  const reqs=mockLog.slice(before);steps.push('tab requests: '+JSON.stringify(reqs.map(r=>({tools:r.tools.length,reply:r.reply}))));
  if(!reqs.length)problems.push('停止输入后没有发出补全请求');
  if(!ghost)problems.push('没有出现幽灵文本');
  else{await page.keyboard.press('Tab');await delay(600);const t=await ext('text');steps.push('doc tail: '+String(t).slice(-80));if(!/return a \+ b;/.test(String(t)))problems.push('按 Tab 后没有插入补全');}
  return {name:'Tab completion (mock model)',passed:problems.length===0,steps,problems};
}
async function testBridgePanel(page){
  const steps=[],problems=[];
  let st=null;for(let i=0;i<30;i++){st=await runCommand('opencode.bridge.getStatus').catch(e=>({err:e.message}));if(st?.state==='running')break;await delay(1000);}
  steps.push('bridge: '+JSON.stringify(st).slice(0,200));
  const cmds=(await ext('commands')).filter(c=>/opencode\.(bridge|task)/i.test(c)&&/(open|show|focus|view|panel)/i.test(c));steps.push('cmds: '+cmds.slice(0,15).join(','));
  for(const c of cmds.filter(c=>/task|session/i.test(c)).slice(0,3)){try{await runCommand(c);steps.push('ran '+c);await delay(1200);break;}catch{}}
  const view=await page.evaluate(()=>{const v=document.querySelector('.opencode-bridge-session-view');if(!v)return null;const r=v.getBoundingClientRect();return {w:r.width,h:r.height,text:v.innerText.slice(0,300)};});
  steps.push('panel: '+JSON.stringify(view));
  return {name:'bridge task panel renders',passed:!!view,steps,problems:view?[]:['没有找到任务面板']};
}

let __ws,__mid=0;const __pend={};
async function cdp(method,params={}){if(!__ws){const l=await (await fetch('http://127.0.0.1:'+globalThis.__iport+'/json/list')).json();__ws=new WebSocket(l[0].webSocketDebuggerUrl);await new Promise((r,j)=>{__ws.onopen=r;__ws.onerror=j;});__ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&__pend[m.id]){__pend[m.id](m);delete __pend[m.id];}};}
  const id=++__mid;return new Promise(r=>{__pend[id]=r;__ws.send(JSON.stringify({id,method,params}));});}
async function profStart(){try{await cdp('Profiler.enable');await cdp('Profiler.setSamplingInterval',{interval:1000});await cdp('Profiler.start');console.log('PROF_STARTED');}catch(e){console.log('PROF_START_FAIL '+e);}}
async function profStop(steps,reqs){try{const r=await cdp('Profiler.stop');fs.writeFileSync(area+'/chat1.cpuprofile',JSON.stringify(r.result.profile));console.log('PROFILE '+area+'/chat1.cpuprofile');}catch(e){steps.push('PROF_STOP_FAIL '+e);}
  steps.push('timing: firstModelRequest='+(reqs[0]?reqs[0].at-globalThis.__tSend:'none')+'ms answerSeen='+(globalThis.__tOk?globalThis.__tOk-globalThis.__tSend:'none')+'ms requests='+reqs.length);}
// ---------- 启动 ----------
(async()=>{
  if(!fs.existsSync(appExe))throw Error('找不到恢复版程序：'+appExe);
  if(fs.existsSync(area))throw Error('UI isolation directory already exists');
  const pw=loadPlaywright();
  setTimeout(()=>{try{console.log('WATCHDOG');require('child_process').spawnSync('taskkill.exe',['/PID',String(globalThis.__ocChildPid),'/T','/F']);}catch{}process.exit(3);},MANUAL?1500000:330000).unref();
  const mock=await startMock();console.log('MOCK '+mock.port);
  // 恢复版只接受两个 portable 位置：opencode/data（用户自己的数据）或 opencode/.recovery-profile（Start-Isolated 用的隔离档）。
  // --user-data-dir 会被忽略，所以测试一律用 .recovery-profile，每次先把旧的挪进本次隔离区，再放入种子。
  const portable=path.join(path.dirname(appExe),'.recovery-profile'),pud=portable+'/user-data';
  fs.mkdirSync(area,{recursive:true});if(fs.existsSync(portable))fs.renameSync(portable,area+'/prev-recovery-profile');globalThis.__ocPortable=portable;fs.mkdirSync(pud+'/User/globalStorage',{recursive:true});
  const seed=root+SEED_REL;let seeded=false;
  if(MANUAL&&fs.existsSync(seed+'/state.vscdb')&&fs.existsSync(seed+'/Local State')){fs.copyFileSync(seed+'/Local State',pud+'/Local State');fs.copyFileSync(seed+'/state.vscdb',pud+'/User/globalStorage/state.vscdb');seeded=true;console.log('SEEDED model profile');}
  globalThis.__ocSeeded=seeded;globalThis.__ocPud=pud;
  for(const d of [profile+'/User',workspace,extension,channel,area+'/extensions',area+'/tmp',area+'/home',area+'/roaming',area+'/local',area+'/shared-local'])fs.mkdirSync(d,{recursive:true});
  fs.writeFileSync(profile+'/User/settings.json',JSON.stringify({'telemetry.telemetryLevel':'off','update.mode':'none','extensions.autoCheckUpdates':false,'extensions.autoUpdate':false,'workbench.startupEditor':'none','workbench.enableExperiments':false,'security.workspace.trust.enabled':false,'opencode.bridge.persistentMode':false,'opencode.bridge.startupPinPage':false,'window.restoreWindows':'none',...(MANUAL?{}:{'http.proxy':'http://127.0.0.1:9','http.proxySupport':'override','opencode.model.baseUrl':'http://127.0.0.1:'+mock.port+'/v1','opencode.model.name':'mock-chat'})},null,2));
  const readme=path.join(workspace,'recovery-readme.txt');fs.writeFileSync(readme,'Isolated UI regression validation. No production data.\n');const sample=path.join(workspace,'sample.js');if(!MANUAL){fs.mkdirSync(area+'/home/.config/opencode',{recursive:true});fs.writeFileSync(area+'/home/.config/opencode/opencode.json',JSON.stringify({provider:{mock:{name:'E2E Mock',options:{baseURL:'http://127.0.0.1:'+mock.port+'/v1',apiKey:'sk-e2e-mock'},models:{'mock-chat':{}}}}}));}fs.writeFileSync(sample,'// sample\n');
  fs.writeFileSync(extension+'/package.json',JSON.stringify({name:'recovery-ui-regress',publisher:'recovery',version:'1.0.0',engines:{vscode:'^1.90.0'},activationEvents:['*'],main:'./extension.cjs'}));
  fs.writeFileSync(extension+'/extension.cjs','('+extMain.toString()+')(exports,require,'+JSON.stringify(channel)+');\n');
  cp.execFileSync(process.execPath,['--check',extension+'/extension.cjs']);
  const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
  // 与 Start-Isolated.cmd 一致：独立 HOME/APPDATA/LOCALAPPDATA；共享自动化目录也指到隔离区，不碰用户真实数据
  const env={...process.env,ELECTRON_RUN_AS_NODE:'',VSCODE_IPC_HOOK_CLI:'',OPENCODE_BRIDGE_SMOKE_LOCAL:'1',TEMP:area+'/tmp',TMP:area+'/tmp',USERPROFILE:area+'/home',HOME:area+'/home',APPDATA:area+'/roaming',LOCALAPPDATA:area+'/local',OPENCODE_SHARED_LOCALAPPDATA:area+'/shared-local',OPENCODE_AUTOMATION_HOME:area+'/shared-local/OpenCode/shared-automation',VSCODE_PORTABLE:globalThis.__ocPortable,...(MANUAL?{}:{HTTP_PROXY:'http://127.0.0.1:9',HTTPS_PROXY:'http://127.0.0.1:9',NO_PROXY:'127.0.0.1,localhost'})};
  delete env.ELECTRON_RUN_AS_NODE;delete env.VSCODE_IPC_HOOK_CLI;delete env.OPENCODE_ORIG_TEMP_ENV;delete env.OPENCODE_PORTABLE_TEMP;
  const args=['--new-window','--user-data-dir',profile,'--extensions-dir',area+'/extensions','--extensionDevelopmentPath',extension,'--skip-welcome','--skip-release-notes','--disable-workspace-trust','--disable-updates','--disable-telemetry','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+port,'--inspect-extensions='+(globalThis.__iport=port+7),...(MANUAL?[]:['--proxy-server=127.0.0.1:9','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost']),workspace];
  const child=cp.spawn(appExe,args,{cwd:workspace,env,stdio:['ignore','pipe','pipe'],windowsHide:false});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b.toString());child.stderr.on('data',b=>stderr+=b.toString());
  fs.writeFileSync(area+'/launch.json',JSON.stringify({pid:child.pid,executable:appExe,args,port,started:new Date().toISOString()},null,2));
  globalThis.__ocChildPid=child.pid;console.log('UI_STARTED '+JSON.stringify({pid:child.pid,port}));
  const report={passed:false,scope:'isolated recovery GUI: sidebar drag state, in-window float open/close, implicit chat attachment removal',app:appExe,tests:[],usedRealProfile:false,sentModelMessages:false};
  let browser;
  try{
    for(let i=0;i<120&&!fs.existsSync(channel+'/ready.json');i++){if(child.exitCode!==null)throw Error('OpenCode exited early: '+child.exitCode);await delay(1000);}
    if(!fs.existsSync(channel+'/ready.json'))throw Error('validation extension did not activate');
    browser=await pw.chromium.connectOverCDP('http://127.0.0.1:'+port,{timeout:30000});
    let page;for(let i=0;i<60&&!page;i++){for(const c of browser.contexts())for(const p of c.pages())if(/workbench/.test(p.url())&&!page)page=p;if(!page)await delay(500);}
    if(!page)throw Error('workbench page not found over CDP');
    await page.waitForSelector('.monaco-workbench .part.editor',{timeout:60000});await delay(1500);
    for(const [fn,...a] of [[testConfigureModel],[testChatTool]]){
      let r;try{r=await fn(page,...a);}catch(e){r={name:fn.name,passed:false,problems:['异常：'+(e.stack||e)]};}
      try{r.screenshot=area+'/'+fn.name+'.png';await page.screenshot({path:r.screenshot});}catch{}
      report.tests.push(r);console.log((r.passed?'PASS ':r.skipped?'SKIP ':'FAIL ')+r.name+(r.problems?.length?' :: '+r.problems.join(' ; '):''));
      await page.keyboard.press('Escape').catch(()=>{});
    }
    report.passed=report.tests.every(t=>t.passed);report.mockLog=mockLog;
  }catch(e){report.error=e.stack||String(e);report.passed=false;}
  finally{
    // 手动填过模型：正常退出让存储落盘，再把模型配置存成种子，下次自动带上，不用再填
    if(globalThis.__ocNeedSave&&child.exitCode===null){try{await ext('fire',{command:'workbench.action.quit'},5000);}catch{}for(let i=0;i<30&&child.exitCode===null;i++)await delay(1000);
      try{const pud=globalThis.__ocPud,seed=root+SEED_REL;if(fs.existsSync(pud+'/User/globalStorage/state.vscdb')){fs.mkdirSync(seed,{recursive:true});fs.copyFileSync(pud+'/Local State',seed+'/Local State');fs.copyFileSync(pud+'/User/globalStorage/state.vscdb',seed+'/state.vscdb');console.log('SEED_SAVED');}}catch(e){console.log('SEED_SAVE_FAILED '+e.message);}}
    try{await browser?.close();}catch{}
    report.exitCodeBeforeCleanup=child.exitCode;
    if(child.exitCode===null&&process.env.OC_UI_KEEP!=='1'){const stop=cp.spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{encoding:'utf8',timeout:10000,windowsHide:true});report.cleanup={ownedPid:child.pid,status:stop.status};}
    report.stdout=stdout.slice(-1500);report.stderr=stderr.slice(-3000);
    fs.writeFileSync(root+'/reports/validation/'+__runId+'/ui-e2e-chat-test.json',JSON.stringify(report,null,2),{flag:'wx'});
    console.log('UI_E2E_RESULT '+JSON.stringify({passed:report.passed,error:report.error,tests:report.tests.map(t=>({name:t.name,passed:t.passed,problems:t.problems,steps:t.steps}))}));
    try{mock.srv.close();}catch{}if(!report.passed)process.exitCode=1;process.exit(process.exitCode||0);
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
