// wait-for-event-step01: wait_for_event 工具——对话停在这一步、不耗 token，等外部事件（快捷键、文件变化、
// 进程退出、定时）发生后把记录作为工具结果返回，模型接着往下做。
import { __toESM } from "./module-0000.mjs";
var vscodeWait = __toESM(require("vscode"));
var fsWait = __toESM(require("node:fs"));
var pathWait = __toESM(require("node:path"));
var childWait = __toESM(require("node:child_process"));

export const WAIT_FOR_EVENT_TOOL_NAME = "wait_for_event";
export const WAIT_FOR_EVENT_FIRE_COMMAND = "opencode.waitForEvent.fire";
const DEFAULT_TIMEOUT_S = 1800;
const MAX_TIMEOUT_S = 4 * 3600;
const MAX_COUNT = 50;
const CLIP = 2000;

const waiters = new Set();

export const WAIT_FOR_EVENT_DEFINITION = {
  name: WAIT_FOR_EVENT_TOOL_NAME,
  description: "Pause this turn without using tokens until an external event happens, then return what was recorded so you can continue. " +
    "Use it when the user wants to set up a monitor and act later, e.g. 'when I press the hotkey, record X and continue'. " +
    "Triggers: hotkey = the user presses Ctrl+Alt+M inside OpenCode (asks for an optional note); " +
    "global_hotkey = a system-wide hotkey that works while another app is focused (Windows only, default ctrl+alt+m, no note prompt); " +
    "file = a file is created or modified (any outside script can signal by writing it; its text is recorded); " +
    "process_exit = a process id exits; timer = after `seconds`. " +
    "capture selects what each event records besides the time: note (hotkey only), clipboard, selection (active editor selection). " +
    "count collects that many events before returning (default 1). Tell the user what to do before calling it. The user can stop it with the chat stop button.",
  inputSchema: {
    type: "object",
    properties: {
      trigger: { type: "string", enum: ["hotkey", "global_hotkey", "file", "process_exit", "timer"] },
      prompt: { type: "string", description: "Short instruction shown to the user while waiting, e.g. '在游戏里遇到 bug 时按 Ctrl+Alt+M'." },
      hotkey: { type: "string", description: "global_hotkey only, e.g. ctrl+alt+m, ctrl+shift+f9." },
      path: { type: "string", description: "file trigger: absolute path, or relative to the workspace." },
      pid: { type: "integer", description: "process_exit trigger: process id." },
      seconds: { type: "number", description: "timer trigger: seconds to wait." },
      capture: { type: "array", items: { type: "string", enum: ["note", "clipboard", "selection"] } },
      count: { type: "integer", minimum: 1, maximum: MAX_COUNT },
      timeout_seconds: { type: "integer", minimum: 5, maximum: MAX_TIMEOUT_S }
    },
    required: ["trigger"]
  }
};

const clip = (text) => {
  const value = String(text ?? "");
  return value.length > CLIP ? `${value.slice(0, CLIP)}…（已截断，共 ${value.length} 字）` : value;
};

async function captureSnapshot(capture, extra = {}) {
  const record = { time: new Date().toISOString(), ...extra };
  if (capture.has("clipboard")) {
    try { record.clipboard = clip(await vscodeWait.env.clipboard.readText()); } catch { }
  }
  if (capture.has("selection")) {
    const editor = vscodeWait.window.activeTextEditor;
    if (editor) {
      record.file = editor.document.uri.fsPath;
      record.line = editor.selection.active.line + 1;
      const selected = editor.document.getText(editor.selection);
      if (selected) record.selection = clip(selected);
    }
  }
  return record;
}

/** Ctrl+Alt+M（窗口内）：交给最早开始等待的那个 hotkey 等待者；没有等待者时提示。 */
export function registerWaitForEventCommand() {
  return vscodeWait.commands.registerCommand(WAIT_FOR_EVENT_FIRE_COMMAND, async () => {
    const waiter = [...waiters].find((w) => w.trigger === "hotkey");
    if (!waiter) {
      void vscodeWait.window.showInformationMessage("当前没有对话在等待快捷键事件。");
      return;
    }
    let note;
    if (waiter.capture.has("note")) {
      note = await vscodeWait.window.showInputBox({ title: "记录这次事件", prompt: waiter.prompt || "写一句备注（可留空），回车提交", ignoreFocusOut: true });
      if (note === void 0) return; // Esc：这次不算
    }
    waiter.push(await captureSnapshot(waiter.capture, note ? { note: clip(note) } : {}));
  });
}

const MODS = { ctrl: 2, control: 2, alt: 1, shift: 4, win: 8, meta: 8 };
function parseHotkey(text) {
  const parts = String(text || "ctrl+alt+m").toLowerCase().split("+").map((p) => p.trim()).filter(Boolean);
  let mods = 0; let vk = 0;
  for (const part of parts) {
    if (MODS[part]) { mods |= MODS[part]; continue; }
    if (/^[a-z0-9]$/.test(part)) vk = part.toUpperCase().charCodeAt(0);
    else if (/^f([1-9]|1[0-9]|2[0-4])$/.test(part)) vk = 0x6f + Number(part.slice(1));
    else throw new Error(`不认识的按键：${part}`);
  }
  if (!vk) throw new Error("快捷键缺少主键，例如 ctrl+alt+m。");
  if (!mods) throw new Error("全局快捷键至少要带一个修饰键（ctrl / alt / shift / win）。");
  return { mods, vk };
}

/** Windows：PowerShell 内嵌 C# 调 RegisterHotKey，按一次输出一行 HOTKEY。 */
function startGlobalHotkey(hotkey, onPress, onFail) {
  if (process.platform !== "win32") throw new Error("global_hotkey 目前只支持 Windows。");
  const { mods, vk } = parseHotkey(hotkey);
  const script = `
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices;
public static class OcHotkey {
  [StructLayout(LayoutKind.Sequential)] public struct MSG { public IntPtr h; public uint m; public IntPtr w; public IntPtr l; public uint t; public int x; public int y; }
  [DllImport("user32.dll")] public static extern bool RegisterHotKey(IntPtr h, int id, uint mods, uint vk);
  [DllImport("user32.dll")] public static extern int GetMessage(out MSG msg, IntPtr h, uint a, uint b);
  public static void Run(uint mods, uint vk) {
    if (!RegisterHotKey(IntPtr.Zero, 1, mods | 0x4000, vk)) { Console.WriteLine("FAIL"); return; }
    Console.WriteLine("READY");
    MSG msg;
    while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0) { if (msg.m == 0x0312) Console.WriteLine("HOTKEY"); }
  }
}
"@
[OcHotkey]::Run(${mods}, ${vk})
`;
  const encoded = Buffer.from(script, "utf16le").toString("base64");
  const child = childWait.spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let buffer = "";
  child.stdout.on("data", (chunk) => {
    buffer += String(chunk);
    let index;
    while ((index = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      if (line === "HOTKEY") onPress();
      else if (line === "FAIL") onFail(`全局快捷键 ${hotkey} 注册失败，可能已被其他程序占用，换一个组合再试。`);
    }
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += String(chunk); });
  child.on("exit", (code) => { if (code) onFail(`全局快捷键进程退出（${code}）：${stderr.slice(0, 300)}`); });
  return () => { try { child.kill(); } catch { } };
}

/** 工具执行器：(args, cancellationToken, { workspaceRoot, stream, log }) → { text, isError } */
export async function runWaitForEvent(args, cancellationToken, options = {}) {
  const trigger = String(args?.trigger ?? "");
  const capture = new Set(Array.isArray(args?.capture) ? args.capture : (trigger === "hotkey" ? ["note"] : []));
  const count = Math.min(MAX_COUNT, Math.max(1, Math.floor(Number(args?.count) || 1)));
  const timeoutS = Math.min(MAX_TIMEOUT_S, Math.max(5, Math.floor(Number(args?.timeout_seconds) || DEFAULT_TIMEOUT_S)));
  const prompt = typeof args?.prompt === "string" ? args.prompt.trim() : "";
  const events = [];
  const cleanups = [];
  const startedAt = Date.now();
  let finish;
  const done = new Promise((resolve) => { finish = resolve; });
  const waiter = { trigger, capture, prompt, push(record) { events.push(record); options.log?.(`[wait-for-event] ${trigger} event ${events.length}/${count}`); if (events.length >= count) finish("events"); } };
  const fail = (message) => finish({ error: message });
  try {
    if (trigger === "hotkey") {
      waiters.add(waiter);
      cleanups.push(() => waiters.delete(waiter));
    } else if (trigger === "global_hotkey") {
      const hotkey = args?.hotkey || "ctrl+alt+m";
      cleanups.push(startGlobalHotkey(hotkey, () => { void captureSnapshot(capture, { hotkey }).then((r) => waiter.push(r)); }, fail));
    } else if (trigger === "file") {
      if (!args?.path) return { text: "file 触发需要 path。", isError: true };
      const target = pathWait.isAbsolute(args.path) ? args.path : pathWait.join(options.workspaceRoot ?? process.cwd(), args.path);
      const stamp = () => { try { const s = fsWait.statSync(target); return `${s.mtimeMs}:${s.size}`; } catch { return ""; } };
      let last = stamp();
      const timer = setInterval(() => {
        const now = stamp();
        if (now && now !== last) {
          let content;
          try { content = clip(fsWait.readFileSync(target, "utf8")); } catch { }
          void captureSnapshot(capture, { path: target, ...content !== void 0 ? { content } : {} }).then((r) => waiter.push(r));
        }
        last = now;
      }, 500);
      cleanups.push(() => clearInterval(timer));
    } else if (trigger === "process_exit") {
      const pid = Math.floor(Number(args?.pid));
      if (!pid) return { text: "process_exit 触发需要 pid。", isError: true };
      const alive = () => { try { process.kill(pid, 0); return true; } catch (e) { return e?.code === "EPERM"; } };
      if (!alive()) return { text: `进程 ${pid} 已经不存在。`, isError: false };
      const timer = setInterval(() => { if (!alive()) { clearInterval(timer); void captureSnapshot(capture, { pid }).then((r) => { waiter.push(r); finish("events"); }); } }, 1000);
      cleanups.push(() => clearInterval(timer));
    } else if (trigger === "timer") {
      const seconds = Math.max(1, Math.min(MAX_TIMEOUT_S, Number(args?.seconds) || 0));
      if (!seconds) return { text: "timer 触发需要 seconds。", isError: true };
      const timer = setTimeout(() => { void captureSnapshot(capture).then((r) => { waiter.push(r); finish("events"); }); }, seconds * 1000);
      cleanups.push(() => clearTimeout(timer));
    } else {
      return { text: `未知的 trigger：${trigger}。可用 hotkey、global_hotkey、file、process_exit、timer。`, isError: true };
    }
    const label = trigger === "hotkey" ? "在 OpenCode 里按 Ctrl+Alt+M" : trigger === "global_hotkey" ? `在任意程序里按 ${args?.hotkey || "Ctrl+Alt+M"}` : trigger === "file" ? `等文件变化：${args?.path}` : trigger === "process_exit" ? `等进程 ${args?.pid} 退出` : `等 ${args?.seconds} 秒`;
    try { options.stream?.progress?.(`⏸ 等待事件：${label}${prompt ? `（${prompt}）` : ""}${count > 1 ? `，共 ${count} 次` : ""}。点停止可结束等待。`); } catch { }
    const timeout = setTimeout(() => finish("timeout"), timeoutS * 1000);
    cleanups.push(() => clearTimeout(timeout));
    const cancel = cancellationToken?.onCancellationRequested?.(() => finish("cancelled"));
    if (cancel) cleanups.push(() => cancel.dispose());
    const outcome = await done;
    const waited = Math.round((Date.now() - startedAt) / 1000);
    if (outcome && typeof outcome === "object") return { text: `wait_for_event 失败：${outcome.error}${events.length ? `\n已记录：${JSON.stringify(events, null, 2)}` : ""}`, isError: true };
    const head = outcome === "events" ? `收到 ${events.length} 个事件（等了 ${waited} 秒）。` : outcome === "timeout" ? `等到超时（${timeoutS} 秒），收到 ${events.length}/${count} 个事件。` : `用户停止了等待，已收到 ${events.length} 个事件。`;
    return { text: `${head}\n${JSON.stringify(events, null, 2)}`, isError: false };
  } finally {
    for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch { } }
  }
}
