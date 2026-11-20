// Smoke test for dsh-gap-fixes on the Windows host. Touches only temp dirs and %LOCALAPPDATA%\OpenCode\sandbox.
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const repo = process.argv[2];
const g = await import(pathToFileURL(path.join(repo, 'recovered/shared/tool-guards.mjs')).href);
const sb = await import(pathToFileURL(path.join(repo, 'recovered/shared/sandbox-lowil.mjs')).href);
let pass = 0, fail = 0;
const t = (n, c, extra = '') => { if (c) { pass++; console.log('PASS', n, extra); } else { fail++; console.log('FAIL', n, extra); } };
// guards (same checks as the sandbox unit run, on the host copy)
const env = { ...process.env, OPENCODE_SPILL_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'oc-spill-smoke-')) };
const r = await g.runWithToolTimeout('find_files', 50, undefined, () => new Promise((res) => setTimeout(() => res({ content: [] }), 400)));
t('tool timeout', r.structuredContent?.error?.code === 'TOOL_TIMEOUT');
const big = ('x'.repeat(99) + '\n').repeat(800);
const s = g.spillLargeResult('search_files', { content: [{ type: 'text', text: big }] }, 'smoke', { env });
const m = /保存到 (\S+?)，/.exec(s.content[0].text);
t('spill to disk', !!m && fs.readFileSync(m[1], 'utf8') === big, m ? m[1] : '');
const rg = new g.RepeatCallGuard({ env: {} });
let x; for (let i = 0; i < 3; i++) x = rg.annotate('o', 'find_files', { pattern: '*' }, { content: [] });
t('repeat reminder', x.content.length === 1);
// sandbox
t('mode default off', sb.sandboxMode(undefined, {}) === 'off');
const spec = { kind: 'bash', executable: 'C:\\x\\bash.exe', args: ['-i'], env: {} };
t('off leaves spec', sb.applyLowIlSandbox(spec, { mode: 'off' }) === spec);
let launcher;
try { launcher = sb.ensureLowIlLauncher(); t('launcher compiled', fs.existsSync(launcher), launcher); } catch (e) { t('launcher compiled', false, e.message); }
if (launcher) {
  const v = spawnSync(launcher, ['--version'], { encoding: 'utf8' });
  t('launcher runs', v.status === 0 && /opencode-lowil/.test(v.stdout), (v.stdout || v.stderr).trim());
  const who = spawnSync(launcher, ['whoami', '/groups'], { encoding: 'utf8' });
  t('child is Low integrity', /S-1-16-4096/.test(who.stdout), `exit=${who.status}`);
  const writeLow = (file) => spawnSync(launcher, [process.execPath, '-e', 'require("fs").writeFileSync(process.argv[1], "hi")', file], { encoding: 'utf8' });
  const medium = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-sbx-medium-'));
  const target = path.join(medium, 'denied.txt');
  const w0 = writeLow(target);
  t('write to unlabeled dir blocked', !fs.existsSync(target) && w0.status !== 0, `exit=${w0.status} ${(w0.stderr||'').split('\n')[0]}`);
  const low = sb.lowTempDir();
  const okFile = path.join(low, `smoke-${process.pid}.txt`);
  const w1 = writeLow(okFile);
  t('write to LocalLow allowed', fs.existsSync(okFile), `exit=${w1.status} ${(w1.stderr||'').split('\n')[0]}`);
  try { fs.unlinkSync(okFile); } catch {}
  const labeled = fs.mkdtempSync(path.join(process.env.USERPROFILE || os.homedir(), 'oc-sbx-labeled-'));
  try { execFileSync('icacls', [labeled, '/setintegritylevel', '(OI)(CI)low'], { stdio: 'pipe' }); t('icacls label', true); } catch (e) { t('icacls label', false, String(e.status) + ' (icacls 被拒绝；用户自己的终端可能也需要管理员或所有者权限)'); }
  t('label detected', sb.folderAllowsLowWrites(labeled) && !sb.folderAllowsLowWrites(medium));
  const okLabeled = path.join(labeled, 'ok.txt');
  const w2 = writeLow(okLabeled);
  t('write to labeled dir allowed', fs.existsSync(okLabeled), `exit=${w2.status} ${(w2.stderr||'').split('\n')[0]}`);
  let refused = '';
  try { sb.applyLowIlSandbox(spec, { mode: 'workspace-write', writableRoots: [medium] }); } catch (e) { refused = e.message; }
  t('unlabeled root refuses to start', /SANDBOX_LABEL_REQUIRED/.test(refused));
  const wrapped = sb.applyLowIlSandbox(spec, { mode: 'workspace-write', writableRoots: [labeled] });
  t('wrapped spec', wrapped.executable === launcher && wrapped.args[0] === spec.executable && wrapped.env.OPENCODE_SANDBOX === 'low-integrity');
  for (const d of [medium, labeled]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch {} }
}
console.log(`RESULT pass=${pass} fail=${fail}`);
