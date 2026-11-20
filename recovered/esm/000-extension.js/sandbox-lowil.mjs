// sandbox-lowil.mjs — optional OS-level write sandbox for the managed Bash terminal on Windows,
// modelled on DeepSeek Harness dsh-sandbox-windows-acl (self-implemented, different mechanism).
//
// Mechanism: the persistent Bash is started through a tiny launcher that duplicates the current
// user token, lowers it to Low Mandatory Level (S-1-16-4096) and starts Bash with it inside a
// kill-on-close Job object. Windows' no-write-up rule then blocks writes everywhere except
// objects labelled Low (the user's AppData\LocalLow and folders the user labels themselves).
// Reads are unaffected. This is opt-in: mode "off" (default) changes nothing.
//
// Enable: the 「隔离沙箱」 toggle in the chat 「权限」 menu (setting chat.agent.sandbox.enabledWindows = "on").
// That toggle is the single switch; the old opencode.sandbox.mode setting is no longer read. The env var
// OPENCODE_SANDBOX_MODE (off | workspace-write) still overrides it for diagnostics. Managed terminals are
// restarted when the toggle changes. Each writable folder must carry the Low label once:
//   icacls "<folder>" /setintegritylevel (OI)(CI)low
// The extension only runs that command after the local user clicks 「为工作区启用沙箱写入」 (labelFolderForLowWrites).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const SANDBOX_MODES = ['off', 'workspace-write'];

const LAUNCHER_SOURCE = String.raw`using System;
using System.Runtime.InteropServices;
using System.Text;
static class OcLowIl {
  [DllImport("advapi32.dll", SetLastError=true)] static extern bool OpenProcessToken(IntPtr h, uint access, out IntPtr token);
  [DllImport("advapi32.dll", SetLastError=true)] static extern bool DuplicateTokenEx(IntPtr t, uint access, IntPtr sa, int level, int type, out IntPtr nt);
  [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)] static extern bool ConvertStringSidToSid(string s, out IntPtr sid);
  [DllImport("advapi32.dll")] static extern int GetLengthSid(IntPtr sid);
  [DllImport("advapi32.dll", SetLastError=true)] static extern bool SetTokenInformation(IntPtr t, int cls, ref TML info, int len);
  [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)] static extern bool CreateProcessAsUser(IntPtr t, string app, StringBuilder cmd, IntPtr pa, IntPtr ta, bool inherit, uint flags, IntPtr env, string cwd, ref SI si, out PI pi);
  [DllImport("kernel32.dll")] static extern IntPtr GetCurrentProcess();
  [DllImport("kernel32.dll")] static extern uint WaitForSingleObject(IntPtr h, uint ms);
  [DllImport("kernel32.dll")] static extern bool GetExitCodeProcess(IntPtr h, out uint code);
  [DllImport("kernel32.dll")] static extern bool SetConsoleCtrlHandler(IntPtr h, bool add);
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] static extern IntPtr CreateJobObject(IntPtr sa, string name);
  [DllImport("kernel32.dll")] static extern bool SetInformationJobObject(IntPtr job, int cls, ref JELI info, int len);
  [DllImport("kernel32.dll")] static extern bool AssignProcessToJobObject(IntPtr job, IntPtr proc);
  [DllImport("kernel32.dll")] static extern uint ResumeThread(IntPtr t);
  [StructLayout(LayoutKind.Sequential)] struct SAA { public IntPtr Sid; public uint Attributes; }
  [StructLayout(LayoutKind.Sequential)] struct TML { public SAA Label; }
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] struct SI { public int cb; public string lpReserved, lpDesktop, lpTitle; public int dwX, dwY, dwXSize, dwYSize, dwXCountChars, dwYCountChars, dwFillAttribute, dwFlags; public short wShowWindow, cbReserved2; public IntPtr lpReserved2, hStdInput, hStdOutput, hStdError; }
  [StructLayout(LayoutKind.Sequential)] struct PI { public IntPtr hProcess, hThread; public int dwProcessId, dwThreadId; }
  [StructLayout(LayoutKind.Sequential)] struct JBLI { public long PerProcessUserTimeLimit, PerJobUserTimeLimit; public uint LimitFlags; public UIntPtr MinimumWorkingSetSize, MaximumWorkingSetSize; public uint ActiveProcessLimit; public UIntPtr Affinity; public uint PriorityClass, SchedulingClass; }
  [StructLayout(LayoutKind.Sequential)] struct IOC { public ulong a, b, c, d, e, f; }
  [StructLayout(LayoutKind.Sequential)] struct JELI { public JBLI Basic; public IOC Io; public UIntPtr ProcessMemoryLimit, JobMemoryLimit, PeakProcessMemoryUsed, PeakJobMemoryUsed; }
  static string Quote(string a) {
    if (a.Length > 0 && a.IndexOfAny(new char[] { ' ', '\t', '"' }) < 0) return a;
    var sb = new StringBuilder("\""); int bs = 0;
    foreach (char c in a) { if (c == '\\') { bs++; continue; } if (c == '"') { sb.Append('\\', bs * 2 + 1); } else { sb.Append('\\', bs); } bs = 0; sb.Append(c); }
    sb.Append('\\', bs * 2); sb.Append('"'); return sb.ToString();
  }
  static int Fail(string what) { Console.Error.WriteLine("opencode-sandbox: " + what + " failed (win32 error " + Marshal.GetLastWin32Error() + ")"); return 125; }
  static int Main(string[] args) {
    if (args.Length == 1 && args[0] == "--version") { Console.WriteLine("opencode-lowil 1"); return 0; }
    if (args.Length < 1) { Console.Error.WriteLine("usage: opencode-lowil <program> [args...]"); return 2; }
    IntPtr token, low, sid;
    if (!OpenProcessToken(GetCurrentProcess(), 0x0001 | 0x0002 | 0x0008 | 0x0080 | 0x0100, out token)) return Fail("OpenProcessToken");
    if (!DuplicateTokenEx(token, 0x02000000, IntPtr.Zero, 2, 1, out low)) return Fail("DuplicateTokenEx");
    if (!ConvertStringSidToSid("S-1-16-4096", out sid)) return Fail("ConvertStringSidToSid");
    var tml = new TML(); tml.Label.Sid = sid; tml.Label.Attributes = 0x20;
    if (!SetTokenInformation(low, 25, ref tml, Marshal.SizeOf(typeof(TML)) + GetLengthSid(sid))) return Fail("SetTokenInformation(Low)");
    var cmd = new StringBuilder();
    for (int i = 0; i < args.Length; i++) { if (i > 0) cmd.Append(' '); cmd.Append(Quote(args[i])); }
    IntPtr job = CreateJobObject(IntPtr.Zero, null);
    if (job != IntPtr.Zero) { var info = new JELI(); info.Basic.LimitFlags = 0x2000; SetInformationJobObject(job, 9, ref info, Marshal.SizeOf(typeof(JELI))); }
    var si = new SI(); si.cb = Marshal.SizeOf(typeof(SI)); PI pi;
    SetConsoleCtrlHandler(IntPtr.Zero, true);
    if (!CreateProcessAsUser(low, null, cmd, IntPtr.Zero, IntPtr.Zero, false, 0x00000004 | 0x00000400, IntPtr.Zero, null, ref si, out pi)) return Fail("CreateProcessAsUser");
    if (job != IntPtr.Zero) AssignProcessToJobObject(job, pi.hProcess);
    ResumeThread(pi.hThread);
    WaitForSingleObject(pi.hProcess, 0xFFFFFFFF);
    uint code; GetExitCodeProcess(pi.hProcess, out code);
    return (int)code;
  }
}
`;

export function sandboxMode(configured, env = process.env) {
  const raw = String(env.OPENCODE_SANDBOX_MODE || configured || 'off').trim().toLowerCase();
  return SANDBOX_MODES.includes(raw) ? raw : 'off';
}

/** Same rule as the workbench's isAgentSandboxEnabledValue: unset / false / "off" = off, anything else = on. */
export function isSandboxToggleOn(value) {
  if (value === void 0 || value === null || value === false || value === '') return false;
  if (value === true) return true;
  return String(value).trim().toLowerCase() !== 'off';
}

/** Mode for the managed terminals: the 「隔离沙箱」 toggle (chat.agent.sandbox.enabledWindows); OPENCODE_SANDBOX_MODE overrides. */
export function sandboxModeFromToggle(toggleValue, env = process.env) {
  if (env.OPENCODE_SANDBOX_MODE) return sandboxMode(void 0, env);
  return isSandboxToggleOn(toggleValue) ? 'workspace-write' : 'off';
}

function localAppData(env) {
  return env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
}

/** Writable scratch inside LocalLow so tools that need TMP keep working at Low integrity. */
export function lowTempDir(env = process.env) {
  const dir = path.join(path.dirname(localAppData(env)), 'LocalLow', 'OpenCode', 'tmp');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function findCsc(env) {
  const win = env.WINDIR || env.SystemRoot || 'C:\\Windows';
  for (const p of [path.join(win, 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe'), path.join(win, 'Microsoft.NET', 'Framework', 'v4.0.30319', 'csc.exe')]) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

let cachedLauncher = null;
/** Compiles the launcher once per source hash into %LOCALAPPDATA%\OpenCode\sandbox and returns its path. */
export function ensureLowIlLauncher(env = process.env) {
  if (process.platform !== 'win32') throw new Error('SANDBOX_UNSUPPORTED: 低完整性沙箱只支持 Windows。');
  if (cachedLauncher && fs.existsSync(cachedLauncher)) return cachedLauncher;
  const hash = crypto.createHash('sha256').update(LAUNCHER_SOURCE).digest('hex').slice(0, 12);
  const dir = path.join(localAppData(env), 'OpenCode', 'sandbox');
  const exe = path.join(dir, `opencode-lowil-${hash}.exe`);
  if (!fs.existsSync(exe)) {
    const csc = findCsc(env);
    if (!csc) throw new Error('SANDBOX_UNAVAILABLE: 找不到 .NET Framework 4 的 csc.exe，无法生成沙箱启动器。请关闭 opencode.sandbox.mode 或安装 .NET Framework 4.x。');
    fs.mkdirSync(dir, { recursive: true });
    const src = path.join(dir, `opencode-lowil-${hash}.cs`);
    fs.writeFileSync(src, LAUNCHER_SOURCE, 'utf8');
    const tmp = exe + '.' + process.pid + '.tmp.exe';
    try {
      execFileSync(csc, ['/nologo', '/optimize+', '/target:exe', '/platform:anycpu', `/out:${tmp}`, src], { windowsHide: true, timeout: 60000, stdio: 'pipe' });
      fs.renameSync(tmp, exe);
    } catch (error) {
      try { fs.unlinkSync(tmp); } catch {}
      const detail = String(error?.stdout || error?.message || error).slice(0, 600);
      throw new Error('SANDBOX_UNAVAILABLE: 编译沙箱启动器失败：' + detail);
    }
  }
  cachedLauncher = exe;
  return exe;
}

/**
 * MSYS2 (Git Bash) keeps a per-installation object namespace \\BaseNamedObjects\\msys-2.0S<n>-<key>, keyed on the
 * msys-2.0.dll file. Medium-integrity Git Bash processes of the same installation create it with a Medium label,
 * so a Low-integrity bash from that installation dies at startup (NtCreateDirectoryObject 0xC0000022). The
 * sandboxed shell therefore runs from a private copy of usr\\bin (other folders are junctions to the original),
 * which gets its own namespace. The copy lives under %LOCALAPPDATA% (Medium), so the sandboxed shell cannot alter it.
 */
function removeTree(dir) {
  let st;
  try { st = fs.lstatSync(dir); } catch { return; }
  if (st.isSymbolicLink()) { try { fs.unlinkSync(dir); } catch { fs.rmdirSync(dir); } return; }
  if (!st.isDirectory()) { fs.unlinkSync(dir); return; }
  for (const name of fs.readdirSync(dir)) removeTree(path.join(dir, name));
  fs.rmdirSync(dir);
}

export function gitRootOfBash(executable) {
  if (!executable || !/bash\.exe$/i.test(executable)) return null;
  const dir = path.dirname(executable);
  const parent = path.dirname(dir);
  if (path.basename(dir).toLowerCase() === 'bin' && path.basename(parent).toLowerCase() === 'usr') return path.dirname(parent);
  if (path.basename(dir).toLowerCase() === 'bin') return parent;
  return null;
}

const msysRuntimeCache = new Map();
/** Returns the private MSYS2 root for the sandbox (creating it once, ~100 MB copy of usr\\bin), or null if gitRoot is not MSYS2. */
export function ensureLowIlMsysRuntime(gitRoot, env = process.env) {
  const dll = path.join(gitRoot, 'usr', 'bin', 'msys-2.0.dll');
  if (!fs.existsSync(dll)) return null;
  const st = fs.statSync(dll);
  const key = crypto.createHash('sha256').update(`${path.resolve(gitRoot).toLowerCase()}|${st.size}|${Math.round(st.mtimeMs)}`).digest('hex').slice(0, 12);
  const root = path.join(localAppData(env), 'OpenCode', 'sandbox', `msys-${key}`);
  if (msysRuntimeCache.get(key) === root || fs.existsSync(path.join(root, '.complete'))) { msysRuntimeCache.set(key, root); return root; }
  const tmpRoot = `${root}.${process.pid}.tmp`;
  removeTree(tmpRoot);
  try {
    const srcBin = path.join(gitRoot, 'usr', 'bin');
    const binDir = path.join(tmpRoot, 'usr', 'bin');
    fs.mkdirSync(binDir, { recursive: true });
    for (const entry of fs.readdirSync(srcBin, { withFileTypes: true })) {
      const from = path.join(srcBin, entry.name), to = path.join(binDir, entry.name);
      if (entry.isDirectory()) fs.symlinkSync(from, to, 'junction');
      else if (entry.isFile()) fs.copyFileSync(from, to);
    }
    for (const entry of fs.readdirSync(path.join(gitRoot, 'usr'), { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.toLowerCase() !== 'bin') fs.symlinkSync(path.join(gitRoot, 'usr', entry.name), path.join(tmpRoot, 'usr', entry.name), 'junction');
    }
    for (const entry of fs.readdirSync(gitRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && !['usr', 'tmp'].includes(entry.name.toLowerCase())) fs.symlinkSync(path.join(gitRoot, entry.name), path.join(tmpRoot, entry.name), 'junction');
    }
    fs.symlinkSync(lowTempDir(env), path.join(tmpRoot, 'tmp'), 'junction');
    fs.writeFileSync(path.join(tmpRoot, '.complete'), `${gitRoot}\n`);
    try {
      fs.renameSync(tmpRoot, root);
    } catch (error) {
      if (!fs.existsSync(path.join(root, '.complete'))) throw error;
      removeTree(tmpRoot);
    }
  } catch (error) {
    try { removeTree(tmpRoot); } catch {}
    throw new Error('SANDBOX_UNAVAILABLE: 准备沙箱用的 Git Bash 运行时副本失败：' + String(error?.message || error).slice(0, 400));
  }
  msysRuntimeCache.set(key, root);
  return root;
}

function replacePathPrefix(value, from, to) {
  if (typeof value !== 'string' || !value) return value;
  const norm = (p) => path.resolve(p).toLowerCase();
  const base = norm(from);
  return value.split(';').map((part) => {
    if (!part) return part;
    let full;
    try { full = norm(part); } catch { return part; }
    if (full === base || full.startsWith(base + path.sep)) return path.join(to, path.resolve(part).slice(path.resolve(from).length));
    return part;
  }).join(';');
}

/** True when the folder's ACL carries the Low mandatory label (so Low-integrity processes may write there). */
export function folderAllowsLowWrites(folder) {
  try {
    const out = execFileSync('icacls', [folder], { windowsHide: true, timeout: 15000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return /Mandatory Label\\Low Mandatory Level|S-1-16-4096/i.test(out) || /强制标签\\低强制级别/.test(out);
  } catch {
    return false;
  }
}

export function labelCommandFor(folder) {
  return `icacls "${folder}" /setintegritylevel (OI)(CI)low`;
}

/** Writable roots that still lack the Low label (empty when the sandbox is off or not on Windows). */
export function foldersMissingLowLabel(writableRoots = []) {
  if (process.platform !== 'win32') return [];
  return writableRoots.filter((r) => r && !folderAllowsLowWrites(r));
}

/**
 * Applies the Low label to one folder (inherited by new files/subfolders). Only call after an explicit user click.
 * Changing a mandatory label needs WRITE_OWNER on the folder; folders that only inherit "Modify" (typical on
 * non-system drives) lack it, so on access denied the current user (owner, who may edit the DACL) is granted
 * WRITE_OWNER on that folder and the label is applied again.
 */
export function labelFolderForLowWrites(folder, env = process.env) {
  if (process.platform !== 'win32') throw new Error('SANDBOX_UNSUPPORTED: 低完整性沙箱只支持 Windows。');
  const run = (args) => execFileSync('icacls', args, { windowsHide: true, timeout: 60000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    run([folder, '/setintegritylevel', '(OI)(CI)low']);
  } catch (first) {
    const user = env.USERDOMAIN && env.USERNAME ? `${env.USERDOMAIN}\\${env.USERNAME}` : env.USERNAME;
    if (!user) throw first;
    run([folder, '/grant', `${user}:(WO)`]);
    run([folder, '/setintegritylevel', '(OI)(CI)low']);
  }
  if (!folderAllowsLowWrites(folder)) throw new Error('icacls 已执行，但目录仍没有低完整性标签：' + folder);
}

/**
 * Wraps a managed-shell spec. Mode off returns the spec unchanged. In workspace-write mode the shell
 * runs through the Low-integrity launcher; if a writable root lacks the Low label the terminal refuses
 * to start and the error carries the one-line icacls command for the local user.
 */
export function applyLowIlSandbox(spec, { mode, writableRoots = [], env = process.env } = {}) {
  if (mode !== 'workspace-write' || process.platform !== 'win32') return spec;
  const missing = foldersMissingLowLabel(writableRoots);
  if (missing.length) {
    const error = new Error('SANDBOX_LABEL_REQUIRED: 「隔离沙箱」已开启，但工作区目录还没有低完整性写入标签，沙箱终端不会启动（不会退回到无沙箱运行）：' +
      missing.join('；') + '。已在 OpenCode 通知里提供「为工作区启用沙箱写入」按钮，由用户点击后执行；AI 不要自行运行 icacls，也不要重试命令，请告诉用户点击该按钮，或在「权限」菜单关闭「隔离沙箱」。');
    error.code = 'SANDBOX_LABEL_REQUIRED';
    error.missing = missing;
    throw error;
  }
  const launcher = ensureLowIlLauncher(env);
  const tmp = lowTempDir(env);
  let shellExecutable = spec.executable;
  const shellEnv = { ...(spec.env || {}) };
  const gitRoot = gitRootOfBash(spec.executable);
  const msysRoot = gitRoot ? ensureLowIlMsysRuntime(gitRoot, env) : null;
  if (msysRoot) {
    // Run the private copy's bash directly (git\\bin\\bash.exe would re-launch the shared installation).
    shellExecutable = path.join(msysRoot, 'usr', 'bin', 'bash.exe');
    shellEnv.PATH = replacePathPrefix(shellEnv.PATH ?? env.PATH ?? env.Path ?? '', gitRoot, msysRoot);
    if (shellEnv.SHELL) shellEnv.SHELL = shellExecutable;
    if (!shellEnv.MSYSTEM && !env.MSYSTEM) shellEnv.MSYSTEM = 'MINGW64';
    if (!shellEnv.HOME && !env.HOME && env.USERPROFILE) shellEnv.HOME = env.USERPROFILE;
  }
  return {
    ...spec,
    executable: launcher,
    args: [shellExecutable, ...(spec.args || [])],
    env: { ...shellEnv, TMP: tmp, TEMP: tmp, TMPDIR: tmp, OPENCODE_SANDBOX: 'low-integrity' },
    sandbox: { mode, launcher, writableRoots, msysRoot }
  };
}
