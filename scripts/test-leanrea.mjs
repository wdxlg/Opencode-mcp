import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { appendBundledLeanrea, bundledLeanreaDirectory, bundledLeanreaReadRoot } from '../recovered/shared/bundled-leanrea.mjs';
import { retireBundledRea } from '../recovered/shared/default-bootstrap.mjs';
import { AutomationService } from '../recovered/shared/automation-store.mjs';
import { LIST_SKILLS_TOOL, formatSkillListing } from '../recovered/esm/000-extension.js/module-0142.mjs';
const require = createRequire(import.meta.url);
const { copyDefaults } = require('./copy-defaults.cjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const temp = t => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-leanrea-test-')); t.after(() => fs.rmSync(d, { recursive: true, force: true })); return d; };
const put = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); };
const fixtureSkill = t => { const d = temp(t), skill = path.join(d, 'defaults', 'skills', 'leanrea', 'SKILL.md'); put(skill, '---\nname: leanrea\n---\nFixture instructions\n'); return { d, skill, folder: path.dirname(skill) }; };

test('packaged Skill, license and manifest are internally consistent', () => {
  const dir = path.join(root, 'defaults'), manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json')));
  assert(manifest.skills.includes('leanrea')); assert(!manifest.skills.includes('reverse-engineer-anything'));
  assert(!manifest.files.some(x => x.path.startsWith('rea/') || x.path === 'rea-bridge.mjs' || x.path.startsWith('skills/reverse-engineer-anything/')));
  for (const item of manifest.files) { const data = fs.readFileSync(path.join(dir, item.path)); assert.equal(sha(data), item.sha256, item.path); if (item.bytes !== undefined) assert.equal(data.length, item.bytes, item.path); }
  const skill = fs.readFileSync(path.join(dir, 'skills/leanrea/SKILL.md'), 'utf8');
  assert.match(skill, /^---\n/); assert.match(skill, /OpenCode 本地适配与授权边界/);
  assert.match(fs.readFileSync(path.join(dir, 'skills/leanrea/LICENSE'), 'utf8'), /MIT License/);
  assert(!fs.existsSync(path.join(dir, 'rea'))); assert(!fs.existsSync(path.join(dir, 'rea-bridge.mjs')));
});

test('bundled discovery exposes a valid listing and respects master switch', t => {
  const f = fixtureSkill(t), base = { directory: '', enabled: true, skills: [] };
  assert.equal(bundledLeanreaDirectory(f.d), f.folder);
  const listing = appendBundledLeanrea(base, f.d), item = listing.skills[0];
  assert.equal(item.skillFile, f.skill); assert.equal(item.scope, 'bundled'); assert(item.enabled && item.loaded);
  const schema = LIST_SKILLS_TOOL.outputSchema.properties.skills.items;
  assert.deepEqual(Object.keys(item).sort(), schema.required.slice().sort());
  assert(schema.properties.scope.enum.includes(item.scope)); assert.match(formatSkillListing(listing), /leanrea \[内置/);
  assert.equal(appendBundledLeanrea({ ...base, enabled: false }, f.d).skills[0].enabled, false);
});

test('existing same-name user Skill wins, even when disabled', t => {
  const f = fixtureSkill(t), user = { name: 'LEANREA', scope: 'global', enabled: false }, base = { directory: 'user', enabled: true, skills: [user] };
  const result = appendBundledLeanrea(base, f.d); assert.strictEqual(result, base); assert.strictEqual(result.skills[0], user);
});

test('missing instruction is not advertised', t => {
  const f = fixtureSkill(t); fs.unlinkSync(f.skill); assert.equal(bundledLeanreaDirectory(f.d), undefined);
});

test('directory links are not advertised', t => {
  const f = fixtureSkill(t), outside = path.join(f.d, 'outside');
  put(path.join(outside, 'SKILL.md'), 'outside'); fs.rmSync(f.folder, { recursive: true });
  try { fs.symlinkSync(outside, f.folder, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (e) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) { t.skip('OS did not permit creation of a directory link'); return; } throw e; }
  assert.equal(bundledLeanreaDirectory(f.d), undefined);
});

test('actual file registry can read bundled instructions but cannot patch outside workspace', async t => {
  const f = fixtureSkill(t), workspace = temp(t);
  globalThis.require = require; globalThis.__dirname = path.dirname(fileURLToPath(import.meta.url));
  const { invokeFileTool } = await import('../recovered/esm/000-extension.js/module-0030.mjs');
  const readRoot = bundledLeanreaReadRoot(f.d, 'read_files');
  for (const name of ['read_files', 'read_image', 'find_files', 'search_files', 'list_directory']) assert.equal(bundledLeanreaReadRoot(f.d, name), f.folder);
  for (const name of ['apply_patch', 'run_command', 'unknown']) assert.equal(bundledLeanreaReadRoot(f.d, name), undefined);
  const read = await invokeFileTool('read_files', { files: [{ path: f.skill }] }, { workspaceRoots: [workspace, readRoot] });
  assert.equal(read.structuredContent.summary.succeeded, 1); assert.match(read.text, /Fixture instructions/);
  const patch = `*** Begin Patch\n*** Update File: ${f.skill}\n@@\n-Fixture instructions\n+Changed\n*** End Patch\n`;
  const denied = await invokeFileTool('apply_patch', { patch }, { workspaceRoots: [workspace] });
  assert(denied.isError || denied.structuredContent.status === 'error'); assert.match(fs.readFileSync(f.skill, 'utf8'), /Fixture instructions/);
});

function fakeCatalog() {
  const base = path.join(os.tmpdir(), 'old-opencode-profile');
  const marker = { argsRef: 'args', args: JSON.stringify([path.join(base, 'defaults', 'rea-bridge.mjs')]), command: process.execPath, stateRoot: path.join(base, 'rea-sessions') };
  const server = { id: 'rea', label: 'REA 6.4.0 (bundled)', transport: 'stdio', enabled: true, editorEnabled: false, bridgeEnabled: true, timeout: 360, command: marker.command, argsRef: 'args', envRefs: { ELECTRON_RUN_AS_NODE: 'node', OPENCODE_REA_STATE_ROOT: 'state' } };
  const other = { id: 'windows-mcp', enabled: true }, global = new Map([['bundledReaOwner', marker]]), secrets = new Map([['args', marker.args], ['node', '1'], ['state', marker.stateRoot]]);
  let servers = [server, other], saves = 0;
  const context = { globalState: { get: key => global.get(key), update: async (key, value) => global.set(key, value) }, secrets: { get: async key => secrets.get(key) } };
  const catalog = { exclusive: async fn => fn(), snapshot: () => ({ servers }), save: value => { servers = value; saves++; } };
  return { marker, server, other, global, secrets, context, catalog, get servers() { return servers; }, get saves() { return saves; } };
}

test('verified old default is retired only after backup, retaining Windows MCP and secrets', async () => {
  const f = fakeCatalog(), before = new Map(f.secrets);
  await retireBundledRea(f.context, f.catalog);
  assert.deepEqual(f.servers, [f.other]); assert.equal(f.saves, 1); assert.deepEqual(f.secrets, before);
  assert.deepEqual(f.global.get('retiredBundledRea'), { version: 1, server: f.server, marker: f.marker });
  await retireBundledRea(f.context, f.catalog); assert.equal(f.saves, 1);
});

for (const [name, mutate] of [
  ['disabled server', f => f.server.enabled = false], ['editor target', f => f.server.editorEnabled = true],
  ['bridge target', f => f.server.bridgeEnabled = false], ['timeout', f => f.server.timeout = 20],
  ['additional server field', f => f.server.cwd = 'custom'], ['extra environment', f => f.server.envRefs.EXTRA = 'extra'],
  ['changed env secret', f => f.secrets.set('node', '0')], ['changed args secret', f => f.secrets.set('args', 'custom')],
  ['missing owner marker', f => f.global.delete('bundledReaOwner')],
  ['different existing backup', f => f.global.set('retiredBundledRea', { version: 1, server: { id: 'other' }, marker: f.marker })],
]) test('retirement preserves ' + name, async () => { const f = fakeCatalog(); mutate(f); await retireBundledRea(f.context, f.catalog); assert.equal(f.saves, 0); assert(f.servers.includes(f.server)); });

test('unavailable credential storage preserves the server', async () => {
  const f = fakeCatalog(); f.context.secrets.get = async () => { throw Error('secret unavailable'); };
  await retireBundledRea(f.context, f.catalog); assert.equal(f.saves, 0); assert(f.servers.includes(f.server));
});

test('retirement does not remove a server if backup creation fails', async () => {
  const f = fakeCatalog(); f.context.globalState.update = async () => { throw Error('fixture backup failure'); };
  await assert.rejects(retireBundledRea(f.context, f.catalog), /fixture backup failure/); assert.equal(f.saves, 0); assert(f.servers.includes(f.server));
});

function defaultFixture(t) {
  const d = temp(t), src = path.join(d, 'defaults'), dest = path.join(d, 'generated/source-build/resources/app/extensions/opencode/defaults');
  const oldContent = Buffer.from('old managed'), keepOld = Buffer.from('prior prompt'), keepNew = Buffer.from('new prompt');
  const entry = (p, b) => ({ path: p, sha256: sha(b), bytes: b.length });
  const previous = { skills: [], files: [entry('retired/old.txt', oldContent), entry('prompt.txt', keepOld)] };
  const next = { skills: ['leanrea'], files: [entry('prompt.txt', keepNew), entry('skills/leanrea/SKILL.md', Buffer.from('lean'))] };
  const oldBytes = Buffer.from(JSON.stringify(previous));
  put(path.join(dest, 'manifest.json'), oldBytes); put(path.join(dest, 'retired/old.txt'), oldContent); put(path.join(dest, 'prompt.txt'), keepOld); put(path.join(dest, 'unmanaged.txt'), 'user');
  put(path.join(src, 'manifest.json'), JSON.stringify(next)); put(path.join(src, 'prompt.txt'), keepNew); put(path.join(src, 'skills/leanrea/SKILL.md'), 'lean');
  return { d, src, dest, previous, next, oldBytes, trusted: new Set([sha(oldBytes)]) };
}

test('default copy removes only trusted unchanged obsolete files and preserves unmanaged files', t => {
  const f = defaultFixture(t), result = copyDefaults(f.d, f.trusted);
  assert.equal(result.removed, 1); assert.equal(fs.readFileSync(path.join(f.dest, 'unmanaged.txt'), 'utf8'), 'user');
  assert(!fs.existsSync(path.join(f.dest, 'retired/old.txt'))); assert.equal(fs.readFileSync(path.join(f.dest, 'prompt.txt'), 'utf8'), 'new prompt');
  assert.equal(copyDefaults(f.d, f.trusted).changed, 0);
});

test('untrusted old manifest aborts before changes', t => {
  const f = defaultFixture(t); assert.throws(() => copyDefaults(f.d, new Set()), /not trusted/);
  assert.equal(fs.readFileSync(path.join(f.dest, 'retired/old.txt'), 'utf8'), 'old managed'); assert.deepEqual(fs.readFileSync(path.join(f.dest, 'manifest.json')), f.oldBytes);
});

for (const [name, change, pattern] of [
  ['customized obsolete file', f => put(path.join(f.dest, 'retired/old.txt'), 'custom'), /customized; refusing removal/],
  ['customized retained file', f => put(path.join(f.dest, 'prompt.txt'), 'custom'), /customized; refusing overwrite/],
  ['unmanaged new collision', f => put(path.join(f.dest, 'skills/leanrea/SKILL.md'), 'user'), /unmanaged file/],
]) test('default copy rejects ' + name + ' before any removal', t => {
  const f = defaultFixture(t); change(f); assert.throws(() => copyDefaults(f.d, f.trusted), pattern);
  assert(fs.existsSync(path.join(f.dest, 'retired/old.txt'))); assert.deepEqual(fs.readFileSync(path.join(f.dest, 'manifest.json')), f.oldBytes);
});

test('default copy refuses linked destination ancestors', t => {
  const f = defaultFixture(t), outside = path.join(f.d, 'outside'), link = path.join(f.dest, 'skills');
  fs.mkdirSync(outside, { recursive: true });
  try { fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (e) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) { t.skip('OS did not permit creation of a directory link'); return; } throw e; }
  assert.throws(() => copyDefaults(f.d, f.trusted), /Linked default path refused/); assert(fs.existsSync(path.join(f.dest, 'retired/old.txt')));
});

test('default copy refuses path traversal', t => {
  const f = defaultFixture(t); f.next.files[0].path = '../escape.txt'; put(path.join(f.src, 'manifest.json'), JSON.stringify(f.next));
  assert.throws(() => copyDefaults(f.d, f.trusted), /Unsafe default manifest path/); assert(fs.existsSync(path.join(f.dest, 'retired/old.txt')));
});

// REA 规则已按用户明确要求从规则库和所有规则组中移除（b3ddbac8，leanrea 技能保留）；旧测试断言的 lib_rea 渲染已不存在。
test('REA rule stays removed from library and rule groups; effective() does not rewrite shared state', async t => {
  const d = temp(t), prev = process.env.OPENCODE_AUTOMATION_HOME; process.env.OPENCODE_AUTOMATION_HOME = d;
  t.after(() => { if (prev === undefined) delete process.env.OPENCODE_AUTOMATION_HOME; else process.env.OPENCODE_AUTOMATION_HOME = prev; });
  const svc = new AutomationService({ directory: d, workspaces: () => [] }); await svc.initialize();
  const persisted = fs.readFileSync(svc.file), state = svc.read();
  assert(!state.ruleLibrary.some(x => x.id === 'lib_rea'));
  assert(!state.presets.some(g => (g.rules || []).some(r => r.libraryRuleId === 'lib_rea' || r.name === 'LeanREA 轻量逆向' || r.name === 'REA 结构化调用')));
  const effective = svc.effective('global', null, state);
  assert(!effective.text.includes('LeanREA 轻量逆向')); assert(!effective.text.includes('ext__rea__call_rea_tool'));
  assert.deepEqual(fs.readFileSync(svc.file), persisted);
});
