// Live end-to-end Bridge handoff scenario (recovered.33). NOT run by any npm test aggregate.
// Launches the BUILT runtime (default <repo>/opencode, override OPENCODE_E2E_RUNTIME) as an Extension Development
// Host with a brand-new isolated profile/HOME/OPENCODE_AUTOMATION_HOME under generated/validation/<run>/, proxies
// pointed at 127.0.0.1:9 (no network), local-only Bridge smoke mode (OPENCODE_BRIDGE_SMOKE_LOCAL=1, no tunnel).
// Two MCP clients talk to the local Bridge:
//   session A: reads/acks rules, creates a task card (set_todos new_task), writes a private note, writes a handoff;
//   session B (a new caller): reads/acks rules, calls bridge_memory_brief with workspace_root and must see A's
//   next steps (and must not see A's private note); after a rebuild, the tool gate must refuse `git push` on the
//   Bridge run_command (a harmless `git push --dry-run` in a non-repo temp folder, so an un-gated build is harmless).
//   Manager + 2 employees: TODO (see MANAGER_EMPLOYEE_TODO below).
// Safety: requires OPENCODE_E2E_CONFIRM=1; refuses when the same runtime executable is already running, when the
// runtime is the official install (E:/OpenCode), or when the run directory exists. It only terminates the process
// tree it spawned (plus leftovers whose command line contains this run's unique directory).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), net = require('net'), os = require('os'), crypto = require('crypto');

if (process.env.OPENCODE_E2E_CONFIRM !== '1') {
  console.error('test-e2e-bridge-handoff: refused. This launches the built OpenCode runtime with an isolated profile.\n' +
    'Close nothing; it never touches running instances. Re-run with OPENCODE_E2E_CONFIRM=1 to proceed.');
  process.exit(2);
}
if (process.platform !== 'win32') { console.error('test-e2e-bridge-handoff: Windows only (launches OpenCode.exe).'); process.exit(2); }

const root = path.resolve(process.env.OPENCODE_RECOVERY_ROOT || path.resolve(__dirname, '..'));
if (!fs.existsSync(path.join(root, 'reports', 'bundle-manifest.json'))) throw Error('Not a recovery workspace: ' + root);
const runId = process.env.OPENCODE_VALIDATION_RUN || (Date.now() + '-' + crypto.randomBytes(4).toString('hex'));
if (!/^[A-Za-z0-9_-]+$/.test(runId)) throw Error('Invalid validation run ID');
const runtime = path.resolve(process.env.OPENCODE_E2E_RUNTIME || path.join(root, 'opencode'));
const exe = path.join(runtime, 'OpenCode.exe');
const opencodeExtension = path.join(runtime, 'resources', 'app', 'extensions', 'opencode');
const area = path.join(root, 'generated', 'validation', runId, 'e2e-bridge-handoff');
const profile = path.join(area, 'profile'), workspace = path.join(area, 'workspace'), validationExtension = path.join(area, 'validation-extension');
const endpointFile = path.join(area, 'endpoint.json'), reportDir = path.join(root, 'reports', 'validation', runId);
const MANAGER_EMPLOYEE_TODO = 'TODO: manager + 2 employees smoke not automated. It needs collaboration switched on by the local user ' +
  '(setCollaborationEnabled is a local-UI action, no model tool), saved employees with native model routes, and a team ' +
  'authorization; native employees call real model providers, which this offline isolated profile cannot reach. ' +
  'Covered offline instead: scripts/test-collab-v2.mjs (lease/revision auto-fill, wait_messages, limits).';

const normalizeWin = p => path.resolve(p).replace(/\//g, '\\').toLowerCase();
const under = (child, parent) => { const c = normalizeWin(child), p = normalizeWin(parent).replace(/\\+$/, ''); return c === p || c.startsWith(p + '\\'); };
function powershellJson(script) {
  const r = cp.spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')], { encoding: 'utf8', timeout: 30000, windowsHide: true });
  if (r.status !== 0) throw Error('PowerShell query failed: ' + (r.stderr || r.error?.message || r.status));
  const text = (r.stdout || '').trim(); if (!text) return [];
  const value = JSON.parse(text); return Array.isArray(value) ? value : [value];
}
const psQuote = s => "'" + String(s).replace(/'/g, "''") + "'";
function runningSameRuntime() {
  return powershellJson("Get-CimInstance Win32_Process -Filter \"Name='OpenCode.exe'\" | Select-Object ProcessId,ExecutablePath | ConvertTo-Json -Compress")
    .filter(p => p && p.ExecutablePath && normalizeWin(p.ExecutablePath) === normalizeWin(exe));
}
function processesOfThisRun() {
  return powershellJson('$needle=' + psQuote(normalizeWin(area)) + "; Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine.ToLower().Replace('/', '\\').Contains($needle) } | Select-Object ProcessId,Name | ConvertTo-Json -Compress")
    .filter(p => p && Number.isSafeInteger(p.ProcessId) && p.ProcessId !== process.pid);
}
function release() { try { return JSON.parse(fs.readFileSync(path.join(runtime, 'OPENCODE-RELEASE.json'), 'utf8')).version || 'unknown'; } catch { return 'unknown'; } }
const recoveredNumber = v => Number(/recovered\.(\d+)/.exec(String(v))?.[1] || 0);

// ---------------------------------------------------------------- preflight refusals (before anything is created)
if (under(runtime, 'E:\\OpenCode')) throw Error('Refusing: target runtime is the official install (E:/OpenCode). Use the built runtime of this repo.');
if (!fs.existsSync(exe) || !fs.existsSync(path.join(opencodeExtension, 'package.json'))) throw Error('Built runtime not found (run the build first): ' + exe);
const already = runningSameRuntime();
if (already.length) throw Error('Refusing: this runtime is already running (PID ' + already.map(p => p.ProcessId).join(', ') + '). Close it yourself first; this script never stops instances it did not start.');
if (fs.existsSync(area)) throw Error('Run directory already exists: ' + area);
const runtimeVersion = release(), gatesExpected = recoveredNumber(runtimeVersion) >= 33;

// ---------------------------------------------------------------- isolated profile + validation extension
for (const d of [path.join(profile, 'User'), workspace, validationExtension, path.join(area, 'extensions'), path.join(area, 'tmp'), path.join(area, 'home'), path.join(area, 'roaming'), path.join(area, 'local'), path.join(area, 'automation')]) fs.mkdirSync(d, { recursive: true });
fs.writeFileSync(path.join(profile, 'User', 'settings.json'), JSON.stringify({
  'telemetry.telemetryLevel': 'off', 'update.mode': 'none', 'extensions.autoCheckUpdates': false, 'extensions.autoUpdate': false,
  'workbench.startupEditor': 'none', 'workbench.enableExperiments': false, 'security.workspace.trust.enabled': false,
  'opencode.bridge.persistentMode': false, 'opencode.bridge.startupPinPage': false, 'http.proxy': 'http://127.0.0.1:9', 'http.proxySupport': 'override',
  'git.path': path.join(opencodeExtension, 'runtime', 'git', 'mingw64', 'bin', 'git.exe')
}, null, 2));
fs.writeFileSync(path.join(workspace, 'sample.txt'), 'Isolated e2e handoff workspace. No production data.\n');
fs.writeFileSync(path.join(validationExtension, 'package.json'), JSON.stringify({ name: 'recovery-e2e-handoff', publisher: 'recovery', version: '1.0.0', engines: { vscode: '^1.132.0' }, activationEvents: ['*'], main: './extension.cjs' }));
// The helper extension only discovers the local Bridge URL and hands it to this script; all MCP traffic is below.
const extensionCode = `const vscode=require('vscode'),fs=require('fs');const out=${JSON.stringify(endpointFile)};
exports.activate=async()=>{const report={activated:true};try{const ext=vscode.extensions.all.find(x=>x.packageJSON.name==='opencode');if(!ext)throw Error('opencode extension not found');await ext.activate();report.opencodeVersion=ext.packageJSON.version;
let st;for(let i=0;i<600;i++){st=await vscode.commands.executeCommand('opencode.bridge.getStatus');if(st&&st.state==='running'&&st.localUrl)break;await new Promise(r=>setTimeout(r,100));}
if(!st||st.state!=='running'||!st.localUrl)throw Error('local Bridge smoke server did not start (state='+(st&&st.state)+')');report.localUrl=st.localUrl;report.workspace=(vscode.workspace.workspaceFolders||[]).map(f=>f.uri.fsPath);
report.workspaceScope=vscode.workspace.getConfiguration('opencode').get('bridge.workspaceScope');}catch(e){report.error=String(e&&e.stack||e);}
fs.writeFileSync(out+'.tmp',JSON.stringify(report,null,2));fs.renameSync(out+'.tmp',out);};exports.deactivate=()=>{};`;
fs.writeFileSync(path.join(validationExtension, 'extension.cjs'), extensionCode);
cp.execFileSync(process.execPath, ['--check', path.join(validationExtension, 'extension.cjs')]);

// ---------------------------------------------------------------- MCP client (Streamable HTTP, JSON or SSE replies)
function client(endpoint, name) { return { endpoint, name, id: 0, sid: null }; }
async function rpc(c, method, params, notification = false) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
  if (c.sid) { headers['Mcp-Session-Id'] = c.sid; headers['MCP-Protocol-Version'] = '2024-11-05'; }
  const res = await fetch(c.endpoint, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', ...(notification ? {} : { id: ++c.id }), method, params }), signal: AbortSignal.timeout(60000) });
  if (res.headers.get('mcp-session-id')) c.sid = res.headers.get('mcp-session-id');
  const text = await res.text();
  if (!res.ok) throw Error(`MCP HTTP ${res.status}: ${text.slice(0, 300)}`);
  if (!text) return {};
  const messages = text.startsWith('event:') || text.startsWith('data:') ? text.split('\n').filter(l => l.startsWith('data:')).map(l => JSON.parse(l.slice(5))) : [JSON.parse(text)];
  const data = messages.filter(m => m && m.id === c.id).at(-1) || messages.at(-1);
  if (data.error) throw Object.assign(Error(JSON.stringify(data.error)), { rpcError: data.error });
  return data.result;
}
async function connect(endpoint, name) {
  const c = client(endpoint, name);
  await rpc(c, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name, version: '1' } });
  await rpc(c, 'notifications/initialized', {}, true);
  return c;
}
const textOf = r => (r?.content || []).map(x => x.text || '').join('\n');
async function callTool(c, name, args) {
  const r = await rpc(c, 'tools/call', { name, arguments: args });
  if (r?.isError) throw Object.assign(Error(`${name} failed: ${textOf(r).slice(0, 600)}`), { toolResult: r });
  return r;
}
function payload(r) { if (r?.structuredContent && typeof r.structuredContent === 'object') return r.structuredContent; try { return JSON.parse(textOf(r)); } catch { return {}; } }
async function ackRules(c) {
  const rules = payload(await callTool(c, 'bridge_get_effective_rules', {}));
  if (!rules.workspace_id || !rules.rules_hash) throw Error('effective rules without workspace_id/rules_hash');
  await callTool(c, 'bridge_acknowledge_rules', { workspace_id: rules.workspace_id, rules_hash: rules.rules_hash });
  return rules;
}

// ---------------------------------------------------------------- scenario
const checks = [];
const check = (name, passed, detail, required = true) => { checks.push({ name, passed: !!passed, required, detail }); console.log((passed ? 'PASS ' : (required ? 'FAIL ' : 'WARN ')) + name + (detail ? ' :: ' + String(typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 300) : '')); };
async function scenario(endpoint) {
  const tag = runId.replace(/[^A-Za-z0-9]/g, '').slice(-10);
  const NEXT = `E2E_NEXT_${tag} 继续检查 sample.txt 并补充说明`, A_NOTE = `E2E_A_PRIVATE_${tag} 仅 A 可见的随手记`;
  const a = await connect(endpoint, 'e2e-session-a'), b = await connect(endpoint, 'e2e-session-b');
  check('two MCP sessions are distinct', a.sid && b.sid && a.sid !== b.sid, { a: !!a.sid, b: !!b.sid });
  await ackRules(a); await ackRules(b);

  const created = payload(await callTool(a, 'set_todos', { new_task: true, task_title: 'E2E 接班测试', todos: [{ id: 's1', title: '写入记忆并交接（E2E）', status: 'in_progress' }] }));
  check('A created a task card', /\S/.test(created.task_id || ''), { task_id: created.task_id, revision: created.task_revision });
  const note = payload(await callTool(a, 'bridge_memory_append', { kind: 'note', text: A_NOTE }));
  check('A wrote a private note', note.ok === true, { memory_dir: note.memory_dir });
  if (created.memory?.memoryDir) check('A note went to the task-bound memory dir', normalizeWin(note.memory_dir) === normalizeWin(created.memory.memoryDir), { note: note.memory_dir, task: created.memory.memoryDir }, false);
  const ho = payload(await callTool(a, 'bridge_memory_handoff', { stage: 'E2E 阶段 A', done: ['已写入 E2E 随手记'], todo: ['E2E 未完成项'], next: [NEXT], workspace_root: workspace, verified: ['未验证（E2E 脚本）'], extract_facts: false }));
  check('A handoff accepted as a good handoff', ho.ok === true && ho.handoff_good !== false, { handoff_good: ho.handoff_good, warnings: ho.warnings });

  const bb = payload(await callTool(b, 'bridge_memory_brief', { workspace_root: workspace }));
  const briefText = String(bb.brief || '');
  check('B brief scope defaults to workspace', bb.scope === 'workspace', { scope: bb.scope });
  check('B is a different caller with its own memory dir', bb.memory_dir && normalizeWin(bb.memory_dir) !== normalizeWin(note.memory_dir), { b: bb.memory_dir, a: note.memory_dir });
  check("B brief shows A's next step", briefText.includes(NEXT.split(' ')[0]), briefText.slice(0, 600));
  // 长期记忆同步（mirrorToProjectRoot）：A 的 note 可作为「项目长期记忆」出现在同一工作区简报里，但不能以私有随手记形式泄露（与 test-memory-v2 一致）
  { const at = briefText.indexOf(A_NOTE.split(' ')[0]), lt = briefText.indexOf('项目长期记忆'); check("B brief shows A's note only via long-term memory", at < 0 || (lt >= 0 && at > lt), { noteAt: at, longTermAt: lt }); }
  const bTask = payload(await callTool(b, 'bridge_memory_brief', { workspace_root: workspace, scope: 'task' }));
  check('scope:"task" brief omits the workspace view', !String(bTask.brief || '').includes(NEXT.split(' ')[0]), null, false);
  const recall = payload(await callTool(b, 'bridge_memory_recall', { text: NEXT.split(' ')[0], workspace_root: workspace }));
  check('B workspace recall finds the handoff (lexical when no embeddings configured)', recall.count >= 1, { count: recall.count, mode: recall.mode }, false);

  if (gatesExpected) {
    let denied = null;
    try { const r = await callTool(b, 'run_command', { command: 'git push --dry-run e2e-nonexistent-remote', cwd: workspace, timeout_ms: 20000 }); denied = { ok: true, text: textOf(r).slice(0, 300) }; }
    catch (e) { denied = { ok: false, text: String(e.message) }; }
    // git push 门禁已按用户确认移除（85b218c8）：命令应照常执行（远端不存在而失败），不得被 POLICY_DENIED 拦下
    check('Bridge run_command no longer policy-blocks git push', !/POLICY_DENIED/.test(denied.text), denied);
    const gates = payload(await callTool(b, 'bridge_get_tool_gates', {}));
    check('bridge_get_tool_gates is read-only and reports limits', gates.editable_by_model === false && !!gates.collaboration_limits, { rules: (gates.rules || []).length });
  } else {
    check('gate checks skipped: runtime ' + runtimeVersion + ' predates recovered.33 (rebuild first)', true, null, false);
  }

  // Optional tail (recovered.33 lets the owner omit expected_revision on its own card). Failures here are warnings only.
  try {
    const done = payload(await callTool(a, 'set_todos', { task_id: created.task_id, lifecycle: 'completed', todos: [{ id: 's1', title: '写入记忆并交接（E2E）', status: 'completed' }] }));
    check('A completed its task card without passing expected_revision', done.lifecycle === 'completed', { lifecycle: done.lifecycle, normalized: done.normalized }, false);
    const after = payload(await callTool(b, 'bridge_memory_brief', { workspace_root: workspace }));
    check("automatic lifecycle archive does not replace A's manual next step", String(after.brief || '').includes(NEXT.split(' ')[0]), null, false);
  } catch (e) { check('optional task-card completion tail', false, String(e.message), false); }
  check('manager + 2 employees smoke', true, MANAGER_EMPLOYEE_TODO, false);
}

// ---------------------------------------------------------------- launch, run, clean up
const delay = ms => new Promise(r => setTimeout(r, ms));
let child = null, cleanupReport = null;
function cleanup() {
  if (cleanupReport) return cleanupReport;
  cleanupReport = { ownedPid: child?.pid ?? null, treeKill: null, leftovers: [] };
  if (child && child.exitCode === null) {
    const stop = cp.spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { encoding: 'utf8', timeout: 15000, windowsHide: true });
    cleanupReport.treeKill = { status: stop.status, stdout: stop.stdout, stderr: stop.stderr };
  }
  try {
    for (const p of processesOfThisRun()) { // only processes whose command line contains this run's unique directory
      const stop = cp.spawnSync('taskkill.exe', ['/PID', String(p.ProcessId), '/T', '/F'], { encoding: 'utf8', timeout: 15000, windowsHide: true });
      cleanupReport.leftovers.push({ pid: p.ProcessId, name: p.Name, status: stop.status });
    }
  } catch (e) { cleanupReport.leftoverQueryError = String(e.message); }
  return cleanupReport;
}
process.once('SIGINT', () => { cleanup(); process.exit(130); });

(async () => {
  const started = new Date().toISOString();
  let error = null, endpointInfo = null, stdout = '', stderr = '';
  try {
    const port = await new Promise((resolve, reject) => { const s = net.createServer(); s.on('error', reject); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
    const env = {
      SystemRoot: process.env.SystemRoot, PATH: process.env.PATH, USERNAME: process.env.USERNAME || os.userInfo().username,
      TEMP: path.join(area, 'tmp'), TMP: path.join(area, 'tmp'), USERPROFILE: path.join(area, 'home'), HOME: path.join(area, 'home'),
      APPDATA: path.join(area, 'roaming'), LOCALAPPDATA: path.join(area, 'local'), OPENCODE_AUTOMATION_HOME: path.join(area, 'automation'),
      OPENCODE_BRIDGE_SMOKE_LOCAL: '1', HTTP_PROXY: 'http://127.0.0.1:9', HTTPS_PROXY: 'http://127.0.0.1:9', NO_PROXY: '127.0.0.1,localhost'
    };
    const args = ['--new-window', '--user-data-dir', profile, '--extensions-dir', path.join(area, 'extensions'),
      '--extensionDevelopmentPath', validationExtension, '--extensionDevelopmentPath', opencodeExtension,
      '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust', '--disable-updates', '--disable-telemetry',
      '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=' + port, '--proxy-server=127.0.0.1:9',
      '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost', '--disable-gpu', workspace];
    child = cp.spawn(exe, args, { cwd: workspace, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: false });
    child.stdout.on('data', d => { stdout = (stdout + d).slice(-20000); }); child.stderr.on('data', d => { stderr = (stderr + d).slice(-20000); });
    fs.writeFileSync(path.join(area, 'launch.json'), JSON.stringify({ pid: child.pid, executable: exe, runtimeVersion, args, port, started }, null, 2));
    console.log('E2E_STARTED ' + JSON.stringify({ pid: child.pid, port, runtimeVersion }));
    for (let i = 0; i < 180 && !fs.existsSync(endpointFile); i++) { if (child.exitCode !== null) throw Error('OpenCode exited early with code ' + child.exitCode); await delay(1000); }
    if (!fs.existsSync(endpointFile)) throw Error('Timed out waiting for the local Bridge endpoint');
    endpointInfo = JSON.parse(fs.readFileSync(endpointFile, 'utf8'));
    if (endpointInfo.error || !endpointInfo.localUrl) throw Error('Helper extension: ' + (endpointInfo.error || 'no localUrl'));
    if (!/^http:\/\/127\.0\.0\.1:\d+\//.test(endpointInfo.localUrl)) throw Error('Refusing non-loopback Bridge URL');
    await scenario(endpointInfo.localUrl);
  } catch (e) { error = String(e && e.stack || e); console.error(error); }
  finally {
    const cleaned = cleanup();
    const required = checks.filter(c => c.required);
    const report = {
      passed: !error && required.length > 0 && required.every(c => c.passed), runId, runtime, runtimeVersion, gatesExpected,
      scope: 'isolated live Bridge: task card, memory note, handoff, cross-session brief with workspace_root, gate on run_command',
      checks, todo: [MANAGER_EMPLOYEE_TODO], error, endpointHost: endpointInfo?.localUrl ? new URL(endpointInfo.localUrl).host : null,
      workspaceScope: endpointInfo?.workspaceScope ?? null, cleanup: cleaned, usedRealProfile: false, sentModelMessages: false,
      stdoutTail: stdout.slice(-1500), stderrTail: stderr.slice(-4000), area
    };
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, 'e2e-bridge-handoff.json'), JSON.stringify(report, null, 2), { flag: 'wx' });
    console.log('E2E_RESULT ' + JSON.stringify({ passed: report.passed, failed: checks.filter(c => c.required && !c.passed).map(c => c.name), error: error && error.slice(0, 300), report: path.join(reportDir, 'e2e-bridge-handoff.json') }));
    if (!report.passed) process.exitCode = 1;
  }
})();
