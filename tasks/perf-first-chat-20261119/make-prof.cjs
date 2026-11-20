// 由 scripts/test-ui-e2e-chat.cjs 生成「首条对话 CPU 剖析」脚本：只跑配置模拟模型 + 一次带工具的对话，对扩展宿主做 CPU profile。
const fs=require('fs');let s=fs.readFileSync(__dirname+'/../../scripts/test-ui-e2e-chat.cjs','utf8');
const rep=(a,b)=>{if(typeof a==='string'?!s.includes(a):!a.test(s))throw Error('anchor missing: '+a);s=s.replace(a,b);};
rep("'--remote-debugging-port='+port,","'--remote-debugging-port='+port,'--inspect-extensions='+(globalThis.__iport=port+7),");
rep("[[MANUAL?testManualModel:testConfigureModel],[testChatTool],[testTab,sample],[testBridgePanel],...(MANUAL?[[testProviderUi]]:[])]","[[testConfigureModel],[testChatTool]]");
rep(/await page\.keyboard\.press\('Enter'\);(\s*const before=mockLog\.length;let ok=false,last='';)/,"await profStart();globalThis.__tSend=Date.now();await page.keyboard.press('Enter');$1");
rep("{ok=true;break;}","{ok=true;globalThis.__tOk=Date.now();break;}");
rep("const reqs=mockLog.slice(before).filter(r=>/chat\\/completions/.test(r.url));","const reqs=mockLog.slice(before).filter(r=>/chat\\/completions/.test(r.url));await profStop(steps,reqs);");
s=s.replace("// ---------- 启动 ----------",`
let __ws,__mid=0;const __pend={};
async function cdp(method,params={}){if(!__ws){const l=await (await fetch('http://127.0.0.1:'+globalThis.__iport+'/json/list')).json();__ws=new WebSocket(l[0].webSocketDebuggerUrl);await new Promise((r,j)=>{__ws.onopen=r;__ws.onerror=j;});__ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&__pend[m.id]){__pend[m.id](m);delete __pend[m.id];}};}
  const id=++__mid;return new Promise(r=>{__pend[id]=r;__ws.send(JSON.stringify({id,method,params}));});}
async function profStart(){try{await cdp('Profiler.enable');await cdp('Profiler.setSamplingInterval',{interval:1000});await cdp('Profiler.start');console.log('PROF_STARTED');}catch(e){console.log('PROF_START_FAIL '+e);}}
async function profStop(steps,reqs){try{const r=await cdp('Profiler.stop');fs.writeFileSync(area+'/chat1.cpuprofile',JSON.stringify(r.result.profile));console.log('PROFILE '+area+'/chat1.cpuprofile');}catch(e){steps.push('PROF_STOP_FAIL '+e);}
  steps.push('timing: firstModelRequest='+(reqs[0]?reqs[0].at-globalThis.__tSend:'none')+'ms answerSeen='+(globalThis.__tOk?globalThis.__tOk-globalThis.__tSend:'none')+'ms requests='+reqs.length);}
// ---------- 启动 ----------`);
fs.writeFileSync(__dirname+'/prof-first-chat.cjs',s);console.log('ok');
