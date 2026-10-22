// Same-Windows-user native provenance. Not a model identity or a permission grant.
// No workbench pairing, chat command, public source-registration API, or UI launch.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import http from 'node:http';
import { execFile } from 'node:child_process';

const hash = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const discoveryRoot = () => path.join(process.env.OPENCODE_SHARED_LOCALAPPDATA || process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'OpenCodeAssistantSources', 'v1');
const clean = (value, max) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\x00-\x1f\x7f]/.test(value)) throw Error('Invalid native source metadata');
  return value.trim();
};
function protectForCurrentUser(secret) {
  const script = 'Add-Type -AssemblyName System.Security; $b=[Convert]::FromBase64String([Console]::In.ReadToEnd()); $p=[Security.Cryptography.ProtectedData]::Protect($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($p))';
  return new Promise((resolve, reject) => {
    const child = execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { windowsHide: true, timeout: 10000, maxBuffer: 16384 }, (error, stdout) => {
      if (error || !/^[A-Za-z0-9+/=]+$/.test(stdout.trim())) reject(Error('Native source protection unavailable'));
      else resolve(stdout.trim());
    });
    child.stdin.on('error', () => {});
    child.stdin.end(Buffer.from(secret, 'utf8').toString('base64'));
  });
}
function authorized(request, secret) {
  if (request.headers.origin || !['127.0.0.1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress)) return false;
  const got = Buffer.from(String(request.headers.authorization || '')), expected = Buffer.from('Bearer ' + secret);
  return got.length === expected.length && crypto.timingSafeEqual(got, expected);
}
async function readBody(request) {
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > 16384) throw Error('Native source request too large'); chunks.push(chunk); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
function reply(response, status, value) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}
export function createLocalAssistantSourceLink(context, { bridge, workspaceHub, trusted = () => true, log = () => {} }) {
  if (process.platform !== 'win32') return { dispose() {} };
  const workspaceMcp = createLocalWorkspaceMcpLink({ bridge, workspaceHub, trusted, log });
  let disposed = false, busy = false, live = null, timer = null, warned = false;
  const state = () => {
    const status = bridge?.getStatus?.(), workspace = workspaceHub?.store?.workspace, windowId = workspaceHub?.store?.windowId;
    if (!trusted() || status?.state !== 'running' || !status.publicUrl || !workspace?.id || workspace.id === 'empty' || !workspace.folders?.length || !windowId) return null;
    const address = String(status.publicUrl), target = new URL(address);
    if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password || target.hash) return null;
    bridge.setAssistantPublisherContext?.({workspaceId:String(workspace.id),windowId:String(windowId)});
    return { address, workspace, windowId: String(windowId), generation: hash(address) };
  };
  async function removeDescriptor(active) {
    try {
      const saved = JSON.parse(await fsp.readFile(active.file, 'utf8'));
      if (saved.pid === process.pid && saved.windowId === active.windowId) await fsp.rm(active.file, { force: true });
    } catch (error) { if (error.code !== 'ENOENT') { /* Never remove another publisher's file. */ } }
  }
  async function close() {
    const active = live; live = null;
    if (!active) return;
    await removeDescriptor(active);
    active.server.closeAllConnections?.();
    await new Promise(resolve => active.server.close(() => resolve()));
  }
  async function handle(request, response, active) {
    try {
      if (disposed || live !== active || !authorized(request, active.secret)) { reply(response, 403, { error: 'NATIVE_SOURCE_AUTH_REQUIRED' }); return; }
      if (request.method !== 'POST' || !['/v1/source','/v1/reconnect-status'].includes(request.url)) { reply(response, 404, { error: 'NATIVE_SOURCE_ROUTE_UNKNOWN' }); return; }
      const current = state();
      if (!current || current.windowId !== active.windowId) { reply(response, 409, { error: 'NATIVE_SOURCE_DISABLED' }); return; }
      const value = await readBody(request);
      if (value?.program !== 'arena-model-assistant' || value.sourceProtocol !== 1) throw Error('Invalid native source protocol');
      const instanceId = clean(value.instanceId, 64).toLowerCase(), conversationId = clean(value.conversationId, 36).toLowerCase();
      if (!/^[a-f0-9]{64}$/.test(instanceId) || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(conversationId)) throw Error('Invalid native source identifiers');
      const instanceName = clean(value.instanceName, 200), conversationName = value.conversationName ? clean(value.conversationName, 500) : '';
      const registrationId = hash(instanceId + '\0' + conversationId);
      const history=bridge.assistantConnectionHistory?.({workspaceId:String(current.workspace.id),instanceId,conversationId})||[];
      const connectedCurrent=history.some(item=>item.generation===current.generation);
      const previous=history.filter(item=>item.generation!==current.generation).sort((a,b)=>b.confirmedAt-a.confirmedAt)[0];
      // A status query cannot create the first binding or fabricate connection history.
      if(request.url==='/v1/reconnect-status'&&(!previous||connectedCurrent)) {
       reply(response,200,{protocol:2,workspaceId:String(current.workspace.id),windowId:current.windowId,instanceId,conversationId,generation:current.generation,hasHistory:history.length>0,remind:false});return;
      }
      const issued = await bridge.publishAssistantSources({ authorityId: 'native-local-assistant-v1', provenance: 'local-assistant-binding', workspaceId: String(current.workspace.id), windowId: current.windowId, address: current.address, sources: [{ registrationId, instanceId, conversationId, instanceName, conversationName, unavailable: false }], revoked: [] });
      const after = state(), binding = issued.bindings.find(item => item.registrationId === registrationId);
      if (!after || after.address !== current.address || after.windowId !== current.windowId || !binding) { reply(response, 409, { error: 'NATIVE_SOURCE_NOT_READY' }); return; }
      if(request.url==='/v1/reconnect-status') {
       const freshHistory=bridge.assistantConnectionHistory({workspaceId:String(current.workspace.id),instanceId,conversationId});
       reply(response,200,{protocol:2,workspaceId:String(current.workspace.id),workspaceName:String(current.workspace.name||'OpenCode'),windowId:current.windowId,instanceId,conversationId,generation:current.generation,previousGeneration:previous.generation,confirmedAt:previous.confirmedAt,evidence:'authenticated-mcp-transport-v1',hasHistory:true,remind:!freshHistory.some(item=>item.generation===current.generation),address:binding.address,baseAddress:current.address});return;
      }
      reply(response, 200, { protocol: 1, kind: 'arena-model-assistant', workspaceId: String(current.workspace.id), workspaceName: String(current.workspace.name || 'OpenCode'), windowId: current.windowId, instanceId, conversationId, instanceName, conversationName, bindingId: binding.bindingId, baseAddress: current.address, address: binding.address, aiIdentityVerified: false });
    } catch { reply(response, 503, { error: 'NATIVE_SOURCE_UNAVAILABLE' }); }
  }
  async function tick() {
    if (disposed || busy) return; busy = true;
    try {
      const current = state();
      if (!current) { await close(); return; }
      if (live && live.windowId !== current.windowId) await close();
      if (!live) {
        const secret = crypto.randomBytes(32).toString('hex'), protectedKey = await protectForCurrentUser(secret);
        if (disposed || !state()) return;
        const folder = discoveryRoot();
        await fsp.mkdir(folder, { recursive: true, mode: 0o700 });
        if ((await fsp.lstat(folder)).isSymbolicLink()) throw Error('Native source discovery directory cannot be a link');
        const active = { secret, protectedKey, windowId: current.windowId, file: path.join(folder, hash(current.windowId) + '.json'), server: null, origin: '' };
        active.server = http.createServer((request, response) => { void handle(request, response, active); });
        active.server.requestTimeout = 5000; active.server.headersTimeout = 5000;
        active.server.maxConnections = 128;
        await new Promise((resolve, reject) => { active.server.once('error', reject); active.server.listen(0, '127.0.0.1', resolve); });
        active.origin = 'http://127.0.0.1:' + active.server.address().port;
        live = active;
        if (disposed) { await close(); return; }
      }
      const fresh = state();
      if (!fresh || fresh.windowId !== live.windowId) { await close(); return; }
      const value = { schema: 1, pid: process.pid, windowId: fresh.windowId, workspaceId: String(fresh.workspace.id), workspaceName: String(fresh.workspace.name || 'OpenCode'), origin: live.origin, protectedKey: live.protectedKey, generation: fresh.generation, updated: Date.now(), expires: Date.now() + 30000 };
      const temporary = live.file + '.' + crypto.randomUUID() + '.tmp';
      try {
        if (fs.existsSync(live.file) && fs.lstatSync(live.file).isSymbolicLink()) throw Error('Native source descriptor cannot be a link');
        await fsp.writeFile(temporary, JSON.stringify(value) + '\n', { encoding: 'utf8', flag: 'wx', mode: 0o600 });
        await fsp.rename(temporary, live.file);
      } finally { await fsp.rm(temporary, { force: true }).catch(() => {}); }
      warned = false;
    } catch { if (!warned) { warned = true; log('[assistant-source] 本机自动来源暂不可用；未启停用户实例或暴露来源登记工具'); } }
    finally { busy = false; }
  }
  const unsubscribe = bridge?.automation?.onDidChange?.(kind => { if (kind === 'collaboration-switch') void tick(); });
  timer = setInterval(() => { void tick(); }, 5000); timer.unref?.();
  void tick();
  return { dispose() { workspaceMcp.dispose(); disposed = true; clearInterval(timer); unsubscribe?.(); void close(); } };
}

// Separate, read-only workspace address handoff. It does not register a model
// source, enable collaboration, start a bridge, or grant business-tool access.
function createLocalWorkspaceMcpLink({ bridge, workspaceHub, trusted, log }) {
  const folder = path.join(process.env.OPENCODE_SHARED_LOCALAPPDATA || process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'OpenCodeWorkspaceMcp', 'v1');
  let disposed = false, busy = false, live = null, warned = false;
  const state = () => {
    const status = bridge?.getStatus?.(), workspace = workspaceHub?.store?.workspace, windowId = workspaceHub?.store?.windowId;
    if (!trusted() || status?.state !== 'running' || !status.publicUrl || !/^[a-f0-9]{64}$/i.test(workspace?.id || '') || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(windowId || '') || !workspace.folders?.length) return null;
    const address = String(status.publicUrl), target = new URL(address);
    if (!(target.protocol === 'https:' || target.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)) || target.username || target.password || target.hash || address.length > 8192 || /[\x00-\x20]/.test(address)) return null;
    return { address, workspaceId: String(workspace.id), windowId: String(windowId), generation: hash(address) };
  };
  async function remove(active) {
    try {
      const stat = await fsp.lstat(active.file); if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 8192) return;
      const saved = JSON.parse(await fsp.readFile(active.file, 'utf8'));
      if (saved.pid === process.pid && saved.windowId === active.windowId && saved.origin === active.origin) await fsp.rm(active.file);
    } catch { /* Never remove another owner's descriptor. */ }
  }
  async function close() {
    const active = live; live = null; if (!active) return;
    await remove(active); active.server.closeAllConnections?.();
    await new Promise(resolve => active.server.close(resolve));
  }
  async function handle(request, response, active) {
    try {
      if (disposed || live !== active || !authorized(request, active.secret)) return reply(response, 403, { error: 'WORKSPACE_MCP_AUTH_REQUIRED' });
      if (request.method !== 'POST' || request.url !== '/v1/workspace-mcp') return reply(response, 404, { error: 'WORKSPACE_MCP_ROUTE_UNKNOWN' });
      const value = await readBody(request), current = state();
      if (disposed || live !== active || !current || current.generation !== active.generation || current.workspaceId !== active.workspaceId || current.windowId !== active.windowId || active.expires <= Date.now()) return reply(response, 409, { error: 'WORKSPACE_MCP_CHANGED' });
      if (value?.program !== 'arena-task-workbench' || value.workspaceMcpProtocol !== 1 || value.workspaceId !== current.workspaceId || value.windowId !== current.windowId || value.generation !== current.generation || !/^[a-f0-9]{64}$/.test(value.nonce || '')) return reply(response, 409, { error: 'WORKSPACE_MCP_SCOPE_MISMATCH' });
      // Exact owner state, never a domain/port-derived address or source alias.
      reply(response, 200, { protocol: 1, workspaceId: current.workspaceId, windowId: current.windowId, generation: current.generation, address: current.address, expires: Math.min(active.expires, Date.now() + 20000), nonce: value.nonce });
    } catch { reply(response, 503, { error: 'WORKSPACE_MCP_UNAVAILABLE' }); }
  }
  async function tick() {
    if (disposed || busy) return; busy = true;
    try {
      const current = state();
      if (!current) { await close(); return; }
      if (live && (live.windowId !== current.windowId || live.workspaceId !== current.workspaceId || live.generation !== current.generation)) await close();
      if (!live) {
        const secret = crypto.randomBytes(32).toString('hex'), protectedKey = await protectForCurrentUser(secret), after = state();
        if (disposed || !after || after.generation !== current.generation || after.windowId !== current.windowId || after.workspaceId !== current.workspaceId) return;
        await fsp.mkdir(folder, { recursive: true, mode: 0o700 });
        if ((await fsp.lstat(folder)).isSymbolicLink()) throw Error('Workspace MCP directory cannot be a link');
        const active = { ...current, secret, protectedKey, file: path.join(folder, hash(current.windowId) + '.json'), origin: '', expires: 0 };
        // Do not retain the plaintext MCP address in the descriptor state.
        delete active.address;
        active.server = http.createServer((req, res) => { void handle(req, res, active); });
        active.server.requestTimeout = 3000; active.server.headersTimeout = 3000; active.server.maxConnections = 32;
        await new Promise((resolve, reject) => { active.server.once('error', reject); active.server.listen(0, '127.0.0.1', resolve); });
        active.origin = 'http://127.0.0.1:' + active.server.address().port; live = active;
      }
      const fresh = state();
      if (disposed || !fresh || fresh.windowId !== live.windowId || fresh.workspaceId !== live.workspaceId || fresh.generation !== live.generation) { await close(); return; }
      live.expires = Date.now() + 30000;
      const value = { schema: 1, workspaceMcpProtocol: 1, pid: process.pid, windowId: fresh.windowId, workspaceId: fresh.workspaceId, generation: fresh.generation, origin: live.origin, protectedKey: live.protectedKey, updated: Date.now(), expires: live.expires };
      const temporary = live.file + '.' + crypto.randomUUID() + '.tmp';
      try {
        if (fs.existsSync(live.file) && fs.lstatSync(live.file).isSymbolicLink()) throw Error('Workspace MCP descriptor cannot be a link');
        await fsp.writeFile(temporary, JSON.stringify(value) + '\n', { encoding: 'utf8', flag: 'wx', mode: 0o600 });
        await fsp.rename(temporary, live.file);
      } finally { await fsp.rm(temporary, { force: true }).catch(() => {}); }
      warned = false;
    } catch { if (!warned) { warned = true; log('[workspace-mcp] 本机工作区地址交付暂不可用；未启动MCP、创建隧道或改变协作权限'); } }
    finally { busy = false; }
  }
  const timer = setInterval(() => { void tick(); }, 5000); timer.unref?.(); void tick();
  return { dispose() { if (disposed) return; disposed = true; clearInterval(timer); void close(); } };
}
