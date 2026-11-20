// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/windows/electron-main/windowImpl.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { DeferredPromise, Delayer, RunOnceScheduler, init_async, timeout } from "./module-0034.mjs";
import { CancellationToken, init_cancellation } from "./module-0022.mjs";
import { init_errorMessage, toErrorMessage } from "./module-0047.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, DisposableStore, MutableDisposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { FileAccess, Schemas, init_network } from "./module-0031.mjs";
import { getMarks, init_performance, mark } from "./module-0001.mjs";
import { init_platform, isLinux, isMacintosh, isTahoeOrNewer, isWindows2 } from "./module-0006.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { IBackupMainService, init_backup } from "./module-0111.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IDialogMainService, init_dialogMainService } from "./module-0123.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { init_argvHelper, isLaunchedFromCli } from "./module-0163.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IProtocolMainService, init_protocol } from "./module-0238.mjs";
import { init_marketplace, resolveMarketplaceHeaders } from "./module-0240.mjs";
import { IApplicationStorageMainService, IStorageMainService, init_storageMainService } from "./module-0109.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { ThemeIcon, init_themables } from "./module-0241.mjs";
import { IThemeMainService, init_themeMainService } from "./module-0100.mjs";
import { DEFAULT_CUSTOM_TITLEBAR_HEIGHT, getMenuBarVisibility, hasNativeTitlebar, init_window, useNativeFullScreen, useWindowControlsOverlay } from "./module-0096.mjs";
import { IWindowsMainService, WindowStateValidator, defaultBrowserWindowOptions, getAllWindowsExcludingOffscreen, init_windows } from "./module-0101.mjs";
import { init_workspace, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0076.mjs";
import { IWorkspacesManagementMainService, init_workspacesManagementMainService } from "./module-0129.mjs";
import { defaultWindowState, init_window2 } from "./module-0097.mjs";
import { IPolicyService, init_policy2 } from "./module-0210.mjs";
import { IStateService, init_state } from "./module-0095.mjs";
import { IUserDataProfilesMainService, init_userDataProfile3 } from "./module-0108.mjs";
import { ILoggerMainService, init_loggerService2 } from "./module-0213.mjs";
import { IInstantiationService, init_instantiation } from "./module-0039.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { errorHandler, init_errors } from "./module-0010.mjs";
import { init_native } from "./module-0150.mjs";
import { Color, init_color } from "./module-0098.mjs";


// src/vs/platform/windows/electron-main/windowImpl.ts
import electron8, { screen as screen3 } from "electron";
import * as ocOverlayCp from "child_process";
// OpenCode: native taskbar overlay, same path as 模型助手 TaskbarStatusBadgeIcon. Electron's
// BrowserWindow.setOverlayIcon always shrinks the bitmap to 16x16 (taskbar_host.cc kOverlayIconSize),
// which Windows then stretches on scaled displays (blurry). A small PowerShell host compiles the
// C# below once and calls ITaskbarList3::SetOverlayIcon with an ICO built from the renderer's PNG
// frames at SM_CXSMICON for the window's monitor DPI. Falls back to Electron if the host fails.
var OC_OVERLAY_CS = "using System;\nusing System.IO;\nusing System.Drawing;\nusing System.Collections.Generic;\nusing System.Runtime.InteropServices;\n\n// OpenCode taskbar overlay helper: same native path as 模型助手 TaskbarStatusBadgeIcon\n// (PNG frames -> ICO stream -> System.Drawing.Icon at SM_CXSMICON for the window DPI ->\n// ITaskbarList3::SetOverlayIcon). Electron's BrowserWindow.setOverlayIcon always shrinks the\n// bitmap to 16x16, which Windows then stretches on scaled displays, so it is bypassed.\npublic static class OcTaskbarOverlay\n{\n    const int SmCxSmIcon = 49;\n    static readonly int[] StandardOverlaySizes = { 16, 20, 24, 32 };\n    static ITaskbarList3 taskbarList;\n    static readonly Dictionary<long, Icon> liveIcons = new Dictionary<long, Icon>();\n\n    public static int PixelSize(long hwnd)\n    {\n        try\n        {\n            uint dpi = 0;\n            // Per-monitor aware thread, so the real monitor DPI is read even from a helper process.\n            try { SetThreadDpiAwarenessContext(new IntPtr(-4)); } catch { }\n            try\n            {\n                IntPtr monitor = MonitorFromWindow(new IntPtr(hwnd), 2);\n                uint dx, dy;\n                if (monitor != IntPtr.Zero && GetDpiForMonitor(monitor, 0, out dx, out dy) == 0) dpi = dx;\n            }\n            catch { dpi = 0; }\n            if (dpi == 0) { try { dpi = GetDpiForWindow(new IntPtr(hwnd)); } catch { dpi = 0; } }\n            if (dpi == 0) { try { dpi = GetDpiForSystem(); } catch { dpi = 0; } }\n            if (dpi > 0)\n            {\n                try { int scaled = GetSystemMetricsForDpi(SmCxSmIcon, dpi); if (scaled > 0) return Clamp(scaled); } catch { }\n            }\n            int sys = GetSystemMetrics(SmCxSmIcon);\n            if (sys > 0) return Clamp(sys);\n        }\n        catch { }\n        return 16;\n    }\n\n    public static string Set(long hwnd, string description, string framesSpec)\n    {\n        var frames = new Dictionary<int, byte[]>();\n        foreach (string part in framesSpec.Split(';'))\n        {\n            int eq = part.IndexOf('=');\n            if (eq <= 0) continue;\n            frames[int.Parse(part.Substring(0, eq))] = Convert.FromBase64String(part.Substring(eq + 1));\n        }\n        if (frames.Count == 0) return \"err no-frames\";\n        int target = PixelSize(hwnd);\n        int pick = -1;\n        if (frames.ContainsKey(target)) pick = target;\n        else\n        {\n            int above = int.MaxValue, largest = -1;\n            foreach (int k in frames.Keys) { if (k >= target && k < above) above = k; if (k > largest) largest = k; }\n            pick = above != int.MaxValue ? above : largest;\n        }\n        var order = new List<int> { pick };\n        foreach (int s in StandardOverlaySizes) if (!order.Contains(s) && frames.ContainsKey(s)) order.Add(s);\n\n        Icon icon;\n        using (var ico = BuildIconStream(order, frames)) icon = new Icon(ico, pick, pick);\n        int hr = Call(hwnd, icon.Handle, description ?? string.Empty);\n        Icon previous;\n        if (liveIcons.TryGetValue(hwnd, out previous) && previous != null) previous.Dispose();\n        liveIcons[hwnd] = icon;\n        return \"ok target=\" + target + \" frame=\" + pick + \" hr=\" + hr;\n    }\n\n    public static string Clear(long hwnd)\n    {\n        int hr = Call(hwnd, IntPtr.Zero, string.Empty);\n        Icon previous;\n        if (liveIcons.TryGetValue(hwnd, out previous) && previous != null) previous.Dispose();\n        liveIcons.Remove(hwnd);\n        return \"ok clear hr=\" + hr;\n    }\n\n    static int Call(long hwnd, IntPtr hIcon, string text)\n    {\n        for (int attempt = 0; attempt < 2; attempt++)\n        {\n            try\n            {\n                if (taskbarList == null)\n                {\n                    var instance = (ITaskbarList3)new TaskbarListComObject();\n                    if (instance.HrInit() < 0) return -1;\n                    taskbarList = instance;\n                }\n                int hr = taskbarList.SetOverlayIcon(new IntPtr(hwnd), hIcon, text);\n                if (hr == 0) return 0;\n                if (attempt == 1) return hr;\n            }\n            catch { if (attempt == 1) return -2; }\n            try { if (taskbarList != null) Marshal.FinalReleaseComObject(taskbarList); } catch { }\n            taskbarList = null;\n        }\n        return -3;\n    }\n\n    static MemoryStream BuildIconStream(List<int> order, Dictionary<int, byte[]> frames)\n    {\n        var ms = new MemoryStream();\n        var writer = new BinaryWriter(ms);\n        writer.Write((ushort)0);\n        writer.Write((ushort)1);\n        writer.Write((ushort)order.Count);\n        int dataOffset = 6 + order.Count * 16;\n        foreach (int size in order)\n        {\n            byte[] png = frames[size];\n            byte dim = size >= 256 ? (byte)0 : (byte)size;\n            writer.Write(dim);\n            writer.Write(dim);\n            writer.Write((byte)0);\n            writer.Write((byte)0);\n            writer.Write((ushort)1);\n            writer.Write((ushort)32);\n            writer.Write((uint)png.Length);\n            writer.Write((uint)dataOffset);\n            dataOffset += png.Length;\n        }\n        foreach (int size in order) writer.Write(frames[size]);\n        writer.Flush();\n        ms.Position = 0;\n        return ms;\n    }\n\n    static int Clamp(int size) { return size < 16 ? 16 : (size > 64 ? 64 : size); }\n\n    [DllImport(\"user32.dll\")] static extern int GetSystemMetrics(int nIndex);\n    [DllImport(\"user32.dll\")] static extern int GetSystemMetricsForDpi(int nIndex, uint dpi);\n    [DllImport(\"user32.dll\")] static extern uint GetDpiForWindow(IntPtr hwnd);\n    [DllImport(\"user32.dll\")] static extern uint GetDpiForSystem();\n    [DllImport(\"user32.dll\")] static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);\n    [DllImport(\"user32.dll\")] static extern IntPtr MonitorFromWindow(IntPtr hwnd, uint flags);\n    [DllImport(\"shcore.dll\")] static extern int GetDpiForMonitor(IntPtr monitor, int dpiType, out uint dpiX, out uint dpiY);\n\n    [ComImport]\n    [Guid(\"56FDF344-FD6D-11d0-958A-006097C9A090\")]\n    [ClassInterface(ClassInterfaceType.None)]\n    class TaskbarListComObject { }\n\n    [ComImport]\n    [Guid(\"EA1AFB91-9E28-4B86-90E9-9E9F8A5EEFAF\")]\n    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]\n    interface ITaskbarList3\n    {\n        [PreserveSig] int HrInit();\n        [PreserveSig] int AddTab(IntPtr hwnd);\n        [PreserveSig] int DeleteTab(IntPtr hwnd);\n        [PreserveSig] int ActivateTab(IntPtr hwnd);\n        [PreserveSig] int SetActiveAlt(IntPtr hwnd);\n        [PreserveSig] int MarkFullscreenWindow(IntPtr hwnd, [MarshalAs(UnmanagedType.Bool)] bool fFullscreen);\n        [PreserveSig] int SetProgressValue(IntPtr hwnd, ulong ullCompleted, ulong ullTotal);\n        [PreserveSig] int SetProgressState(IntPtr hwnd, int tbpFlags);\n        [PreserveSig] int RegisterTab(IntPtr hwndTab, IntPtr hwndMDI);\n        [PreserveSig] int UnregisterTab(IntPtr hwndTab);\n        [PreserveSig] int SetTabOrder(IntPtr hwndTab, IntPtr hwndInsertBefore);\n        [PreserveSig] int SetTabActive(IntPtr hwndTab, IntPtr hwndMDI, uint dwReserved);\n        [PreserveSig] int ThumbBarAddButtons(IntPtr hwnd, uint cButtons, IntPtr pButton);\n        [PreserveSig] int ThumbBarUpdateButtons(IntPtr hwnd, uint cButtons, IntPtr pButton);\n        [PreserveSig] int ThumbBarSetImageList(IntPtr hwnd, IntPtr himl);\n        [PreserveSig] int SetOverlayIcon(IntPtr hwnd, IntPtr hIcon, [MarshalAs(UnmanagedType.LPWStr)] string pszDescription);\n        [PreserveSig] int SetThumbnailTooltip(IntPtr hwnd, [MarshalAs(UnmanagedType.LPWStr)] string pszTip);\n        [PreserveSig] int SetThumbnailClip(IntPtr hwnd, IntPtr prcClip);\n    }\n}\n";
var OC_OVERLAY_PS = "$ErrorActionPreference = 'Stop'\nAdd-Type -TypeDefinition $env:OC_OVERLAY_CS -ReferencedAssemblies System.Drawing\n[Console]::Out.WriteLine('ready')\n[Console]::Out.Flush()\nwhile ($true) {\n  $line = [Console]::In.ReadLine()\n  if ($line -eq $null) { break }\n  try {\n    $p = $line.Split(\"`t\")\n    if ($p[0] -eq 'S') { $r = [OcTaskbarOverlay]::Set([long]$p[1], [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p[2])), $p[3]) }\n    elseif ($p[0] -eq 'C') { $r = [OcTaskbarOverlay]::Clear([long]$p[1]) }\n    else { $r = 'err unknown' }\n  } catch { $r = 'err ' + $_.Exception.Message }\n  [Console]::Out.WriteLine($r)\n  [Console]::Out.Flush()\n}\n";
var ocOverlayHost = { proc: void 0, failed: false, restarts: 0, windows: new Set(), displayHooked: false };
var OC_REAPER_PS = "$ErrorActionPreference = 'SilentlyContinue'\n$mainPid = [int]$env:OC_REAPER_PID\n$root = $env:OC_REAPER_ROOT.TrimEnd('\\') + '\\'\n$self = [string]$PID\n$mainInfo = Get-CimInstance Win32_Process -Filter \"ProcessId=$mainPid\"\nif (-not $mainInfo) { exit }\n$mainStart = $mainInfo.CreationDate\ntry { $mainProc = [System.Diagnostics.Process]::GetProcessById($mainPid); $mainProc.WaitForExit() } catch { }\n$exitAt = Get-Date\nStart-Sleep -Seconds 4\nfunction UnderRoot($x) { $x.ExecutablePath -and $x.ExecutablePath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) }\nfunction IsMainLike($x) { (UnderRoot $x) -and $x.Name -eq 'OpenCode.exe' -and $x.CommandLine -notlike '*--type=*' -and $x.CommandLine -notlike '*--node-ipc*' -and $x.CommandLine -notlike '*resources\\app*' -and $x.CommandLine -notlike '*resources/app*' }\nfor ($round = 0; $round -lt 4; $round++) {\n  $all = @(Get-CimInstance Win32_Process)\n  $kids = @{}\n  foreach ($x in $all) { $k = [string]$x.ParentProcessId; if (-not $kids.ContainsKey($k)) { $kids[$k] = New-Object System.Collections.ArrayList }; [void]$kids[$k].Add($x) }\n  # A newer OpenCode window (relaunch, or the user opened it again) and everything under it is left alone.\n  $protect = @{}\n  $pq = New-Object System.Collections.Queue\n  foreach ($x in $all) { if ($x.ProcessId -ne $mainPid -and (IsMainLike $x)) { $protect[[string]$x.ProcessId] = 1; $pq.Enqueue([string]$x.ProcessId) } }\n  while ($pq.Count -gt 0) { $cur = $pq.Dequeue(); if ($kids.ContainsKey($cur)) { foreach ($c in $kids[$cur]) { $id = [string]$c.ProcessId; if (-not $protect.ContainsKey($id)) { $protect[$id] = 1; $pq.Enqueue($id) } } } }\n  $hit = @{}\n  $q = New-Object System.Collections.Queue\n  $q.Enqueue([string]$mainPid)\n  while ($q.Count -gt 0) {\n    $cur = $q.Dequeue()\n    if ($kids.ContainsKey($cur)) { foreach ($c in $kids[$cur]) { $id = [string]$c.ProcessId; if ($c.CreationDate -ge $mainStart -and $c.CreationDate -le $exitAt -and -not $hit.ContainsKey($id) -and -not $protect.ContainsKey($id)) { $hit[$id] = $c; $q.Enqueue($id) } } }\n  }\n  foreach ($x in $all) { $id = [string]$x.ProcessId; if ((UnderRoot $x) -and $x.CreationDate -le $exitAt -and -not $protect.ContainsKey($id)) { $hit[$id] = $x } }\n  $hit.Remove($self)\n  if ($hit.Count -eq 0) { break }\n  foreach ($id in @($hit.Keys)) { Stop-Process -Id ([int]$id) -Force }\n  Start-Sleep -Seconds 1\n}\n";
var ocReaperStarted = false;
// OpenCode: 关闭程序即彻底关闭。主进程启动一个独立的隐藏 PowerShell，等主进程退出（正常关闭或崩溃）后
// 4 秒，结束本次启动留下的所有子孙进程（终端里的 shell、OpenConsole、语言服务、tailscaled、cloudflared 等）
// 以及仍在安装目录下运行的进程；之后再打开的 OpenCode 及其子进程不受影响。
function ocExitReaperStart() {
  if (ocReaperStarted || process.platform !== "win32") return;
  ocReaperStarted = true;
  try {
    const encoded = Buffer.from(OC_REAPER_PS, "utf16le").toString("base64");
    const root = process.execPath.slice(0, Math.max(process.execPath.lastIndexOf("\\"), process.execPath.lastIndexOf("/")));
    const proc = ocOverlayCp.spawn("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-EncodedCommand", encoded], {
      windowsHide: true,
      detached: true,
      stdio: "ignore",
      cwd: process.env.SystemRoot || "C:\\Windows",
      env: { ...process.env, OC_REAPER_PID: String(process.pid), OC_REAPER_ROOT: root }
    });
    proc.on("error", () => void 0);
    proc.unref();
  } catch {
  }
}
function ocOverlayEnsure() {
  if (ocOverlayHost.failed) return void 0;
  if (ocOverlayHost.proc) return ocOverlayHost.proc;
  try {
    const encoded = Buffer.from(OC_OVERLAY_PS, "utf16le").toString("base64");
    const proc = ocOverlayCp.spawn("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encoded], {
      windowsHide: true,
      stdio: ["pipe", "pipe", "ignore"],
      env: { ...process.env, OC_OVERLAY_CS }
    });
    const onDead = () => ocOverlayDead(proc);
    proc.on("error", onDead);
    proc.on("exit", onDead);
    proc.stdin.on("error", onDead);
    proc.stdout.setEncoding("utf8");
    let pending = "";
    proc.stdout.on("data", (chunk) => {
      pending += chunk;
      let index;
      while ((index = pending.indexOf("\n")) >= 0) {
        const line = pending.slice(0, index).trim();
        pending = pending.slice(index + 1);
        if (line.startsWith("err")) ocOverlayHost.lastError = line;
      }
    });
    ocOverlayHost.proc = proc;
    return proc;
  } catch {
    ocOverlayHost.failed = true;
    return void 0;
  }
}
function ocOverlayDead(proc) {
  if (ocOverlayHost.proc !== proc) return;
  ocOverlayHost.proc = void 0;
  ocOverlayHost.restarts++;
  if (ocOverlayHost.restarts > 2) ocOverlayHost.failed = true;
  for (const window2 of [...ocOverlayHost.windows]) {
    try {
      window2._ocReapplyOverlay();
    } catch {
    }
  }
}
function ocOverlayFrameSpec(badge) {
  const parts = [];
  const frames = badge.iconDataURLs && typeof badge.iconDataURLs === "object" ? badge.iconDataURLs : {};
  for (const key of Object.keys(frames)) {
    const size = Number(key);
    const url = frames[key];
    if (!(size > 0) || typeof url !== "string") continue;
    const comma = url.indexOf("base64,");
    if (comma < 0) continue;
    parts.push(size + "=" + url.slice(comma + 7));
  }
  return parts.join(";");
}

import { release as release6 } from "os";

var DockBadgeManager, BaseWindow2, CodeWindow, UnresponsiveError;

var init_windowImpl = __esm({
  "src/vs/platform/windows/electron-main/windowImpl.ts"() {
    init_async();
    init_cancellation();
    init_errorMessage();
    init_event();
    init_lifecycle();
    init_network();
    init_performance();
    init_platform();
    init_uri();
    init_nls();
    init_backup();
    init_configuration();
    init_dialogMainService();
    init_environmentMainService();
    init_argvHelper();
    init_files();
    init_lifecycleMainService();
    init_log();
    init_productService();
    init_protocol();
    init_marketplace();
    init_storageMainService();
    init_telemetry();
    init_themables();
    init_themeMainService();
    init_window();
    init_windows();
    init_workspace();
    init_workspacesManagementMainService();
    init_window2();
    init_policy2();
    init_state();
    init_userDataProfile3();
    init_loggerService2();
    init_instantiation();
    init_buffer();
    init_errors();
    init_native();
    init_color();
    DockBadgeManager = class _DockBadgeManager {
      constructor() {
        this.attention = /* @__PURE__ */ new Set();
        this.counts = /* @__PURE__ */ new Map();
      }
      static {
        this.INSTANCE = new _DockBadgeManager();
      }
      acquireBadge(window2) {
        this.attention.add(window2.id);
        this.update();
        return {
          dispose: () => {
            this.attention.delete(window2.id);
            this.update();
          }
        };
      }
      setCount(window2, count) {
        if (count > 0) {
          this.counts.set(window2.id, count);
        } else if (!this.counts.delete(window2.id)) {
          return;
        }
        this.update();
      }
      update() {
        let total = 0;
        for (const count of this.counts.values()) {
          total += count;
        }
        if (total > 0) {
          electron8.app.setBadgeCount(total);
        } else if (this.attention.size > 0) {
          electron8.app.setBadgeCount(
            isLinux ? 1 : void 0
            /* generic dot */
          );
        } else {
          electron8.app.setBadgeCount(0);
        }
      }
    };
    BaseWindow2 = class _BaseWindow extends Disposable {
      constructor(configurationService, stateService, environmentMainService, logService) {
        super();
        this.configurationService = configurationService;
        this.stateService = stateService;
        this.environmentMainService = environmentMainService;
        this.logService = logService;
        //#region Events
        this._onDidClose = this._register(new Emitter());
        this.onDidClose = this._onDidClose.event;
        this._onDidMaximize = this._register(new Emitter());
        this.onDidMaximize = this._onDidMaximize.event;
        this._onDidUnmaximize = this._register(new Emitter());
        this.onDidUnmaximize = this._onDidUnmaximize.event;
        this._onDidTriggerSystemContextMenu = this._register(new Emitter());
        this.onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
        this._onDidEnterFullScreen = this._register(new Emitter());
        this.onDidEnterFullScreen = this._onDidEnterFullScreen.event;
        this._onDidLeaveFullScreen = this._register(new Emitter());
        this.onDidLeaveFullScreen = this._onDidLeaveFullScreen.event;
        this._onDidChangeAlwaysOnTop = this._register(new Emitter());
        this.onDidChangeAlwaysOnTop = this._onDidChangeAlwaysOnTop.event;
        this._lastFocusTime = Date.now();
        this._win = null;
        this.notifyFocusDisposable = this._register(new MutableDisposable());
        this.windowControlsDimmed = false;
        //#endregion
        //#region Fullscreen
        this.transientIsNativeFullScreen = void 0;
        this.joinNativeFullScreenTransition = void 0;
        this._register(toDisposable(() => DockBadgeManager.INSTANCE.setCount(this, 0)));
      }
      // window is shown on creation so take current time
      get lastFocusTime() {
        return this._lastFocusTime;
      }
      get win() {
        return this._win;
      }
      setWin(win, options) {
        this._win = win;
        this._register(Event.fromNodeEventEmitter(win, "maximize")(() => {
          if (isWindows2 && this.environmentMainService.enableRDPDisplayTracking && this._win) {
            const [x, y] = this._win.getPosition();
            const [width, height] = this._win.getSize();
            this.maximizedWindowState = { mode: 0 /* Maximized */, width, height, x, y };
            this.logService.debug(`Saved maximized window ${this.id} display state:`, this.maximizedWindowState);
          }
          this._onDidMaximize.fire();
        }));
        this._register(Event.fromNodeEventEmitter(win, "unmaximize")(() => {
          if (isWindows2 && this.environmentMainService.enableRDPDisplayTracking && this.maximizedWindowState) {
            this.maximizedWindowState = void 0;
            this.logService.debug(`Cleared maximized window ${this.id} state`);
          }
          this._onDidUnmaximize.fire();
        }));
        this._register(Event.fromNodeEventEmitter(win, "closed")(() => {
          this._onDidClose.fire();
          this.dispose();
        }));
        this._register(Event.fromNodeEventEmitter(win, "focus")(() => {
          this.clearNotifyFocus();
          this._lastFocusTime = Date.now();
        }));
        this._register(Event.fromNodeEventEmitter(this._win, "enter-full-screen")(() => this._onDidEnterFullScreen.fire()));
        this._register(Event.fromNodeEventEmitter(this._win, "leave-full-screen")(() => this._onDidLeaveFullScreen.fire()));
        this._register(Event.fromNodeEventEmitter(this._win, "always-on-top-changed", (_, alwaysOnTop) => alwaysOnTop)((alwaysOnTop) => this._onDidChangeAlwaysOnTop.fire(alwaysOnTop)));
        const useCustomTitleStyle = !hasNativeTitlebar(
          this.configurationService,
          options?.titleBarStyle === "hidden" ? "custom" /* CUSTOM */ : void 0
          /* unknown */
        );
        if (isMacintosh && useCustomTitleStyle) {
          win.setSheetOffset(isTahoeOrNewer(release6()) ? 32 : 28);
        }
        if (useCustomTitleStyle && useWindowControlsOverlay(this.configurationService)) {
          const cachedWindowControlHeight = this.stateService.getItem(_BaseWindow.windowControlHeightStateStorageKey);
          if (cachedWindowControlHeight) {
            this.updateWindowControls({ height: cachedWindowControlHeight });
          } else {
            this.updateWindowControls({ height: DEFAULT_CUSTOM_TITLEBAR_HEIGHT });
          }
        }
        if ((isWindows2 || isLinux) && useCustomTitleStyle) {
          this._register(Event.fromNodeEventEmitter(win, "system-context-menu", (event, point) => ({ event, point }))((e) => {
            const [x, y] = win.getPosition();
            const cursorPos = electron8.screen.screenToDipPoint(e.point);
            const cx = Math.floor(cursorPos.x) - x;
            const cy = Math.floor(cursorPos.y) - y;
            if (isLinux) {
              if (cx > 35) {
                e.event.preventDefault();
                this._onDidTriggerSystemContextMenu.fire({ x: cx, y: cy });
              }
            }
          }));
        }
        if (this.environmentMainService.args["open-devtools"] === true) {
          win.webContents.openDevTools();
        }
        if (isMacintosh) {
          this._register(this.onDidEnterFullScreen(() => {
            this.joinNativeFullScreenTransition?.complete(true);
          }));
          this._register(this.onDidLeaveFullScreen(() => {
            this.joinNativeFullScreenTransition?.complete(true);
          }));
        }
        if (isWindows2 && this.environmentMainService.enableRDPDisplayTracking) {
          this._register(Event.fromNodeEventEmitter(screen3, "display-added", (event, display) => ({ event, display }))((e) => {
            this.onDisplayAdded(e.display);
          }));
        }
      }
      onDisplayAdded(display) {
        const state = this.maximizedWindowState;
        if (state && this._win && WindowStateValidator.validateWindowStateOnDisplay(state, display)) {
          this.logService.debug(`Setting maximized window ${this.id} bounds to match newly added display`, state);
          this._win.setBounds(state);
        }
      }
      applyState(state, hasMultipleDisplays = electron8.screen.getAllDisplays().length > 0) {
        const windowSettings2 = this.configurationService.getValue("window");
        const useNativeTabs = isMacintosh && windowSettings2?.nativeTabs === true;
        if ((isMacintosh || isWindows2) && hasMultipleDisplays && (!useNativeTabs || getAllWindowsExcludingOffscreen().length === 1)) {
          if ([state.width, state.height, state.x, state.y].every((value) => typeof value === "number")) {
            this._win?.setBounds({
              width: state.width,
              height: state.height,
              x: state.x,
              y: state.y
            });
          }
        }
        if (state.mode === 0 /* Maximized */ || state.mode === 3 /* Fullscreen */) {
          this._win?.maximize();
          if (state.mode === 3 /* Fullscreen */) {
            this.setFullScreen(true, true);
          }
          this._win?.show();
        }
      }
      setRepresentedFilename(filename) {
        if (isMacintosh) {
          this.win?.setRepresentedFilename(filename);
        } else {
          this.representedFilename = filename;
        }
      }
      getRepresentedFilename() {
        if (isMacintosh) {
          return this.win?.getRepresentedFilename();
        }
        return this.representedFilename;
      }
      setDocumentEdited(edited) {
        if (isMacintosh) {
          this.win?.setDocumentEdited(edited);
        }
        this.documentEdited = edited;
      }
      isDocumentEdited() {
        if (isMacintosh) {
          return Boolean(this.win?.isDocumentEdited());
        }
        return !!this.documentEdited;
      }
      setApplicationBadge(badge) {
        const count = badge && badge.count > 0 ? badge.count : 0;
        if (isWindows2) {
          this._ocLastBadge = count === 0 || !badge?.iconDataURL ? void 0 : badge;
          this._ocReapplyOverlay();
        } else {
          DockBadgeManager.INSTANCE.setCount(this, count);
        }
      }
      _ocReapplyOverlay() {
        if (!this.win || this.win.isDestroyed()) {
          ocOverlayHost.windows.delete(this);
          return;
        }
        if (!this._ocNativeOverlay(this._ocLastBadge)) this._ocElectronOverlay(this._ocLastBadge);
      }
      _ocNativeOverlay(badge) {
        const proc = ocOverlayEnsure();
        if (!proc) return false;
        let hwnd;
        try {
          const handle = this.win.getNativeWindowHandle();
          hwnd = handle.length >= 8 ? handle.readBigUInt64LE(0).toString() : String(handle.readUInt32LE(0));
        } catch {
          return false;
        }
        let line;
        if (!badge) {
          line = `C\t${hwnd}\n`;
        } else {
          const spec = ocOverlayFrameSpec(badge);
          if (!spec) return false;
          line = `S\t${hwnd}\t${Buffer.from(badge.description || "", "utf8").toString("base64")}\t${spec}\n`;
        }
        ocOverlayHost.windows.add(this);
        if (!ocOverlayHost.displayHooked) {
          ocOverlayHost.displayHooked = true;
          try {
            // A monitor/DPI change alters SM_CXSMICON; re-send so the host picks the matching frame.
            screen3.on("display-metrics-changed", () => {
              for (const window2 of [...ocOverlayHost.windows]) {
                try {
                  if (window2._ocLastBadge) window2._ocReapplyOverlay();
                } catch {
                }
              }
            });
          } catch {
          }
        }
        try {
          proc.stdin.write(line);
          return true;
        } catch {
          return false;
        }
      }
      _ocElectronOverlay(badge) {
        {
          if (!badge) {
            this.win?.setOverlayIcon(null, "");
          } else {
            // OpenCode: pick the frame rendered at this window's real small-icon size
            // (GetSystemMetricsForDpi(SM_CXSMICON) == round(16 * monitor scale)), like 模型助手; the
            // renderer's devicePixelRatio includes the zoom level, so it cannot choose the size itself.
            let iconDataURL = badge.iconDataURL;
            const frames = badge.iconDataURLs && typeof badge.iconDataURLs === "object" ? badge.iconDataURLs : void 0;
            if (frames) {
              let scale = 1;
              try {
                const bounds = this.win?.getBounds();
                scale = (bounds ? electron8.screen.getDisplayMatching(bounds) : electron8.screen.getPrimaryDisplay()).scaleFactor || 1;
              } catch {
              }
              const want = Math.min(64, Math.max(16, Math.round(16 * scale)));
              const sizes = Object.keys(frames).map(Number).filter((n) => n > 0 && typeof frames[n] === "string");
              if (sizes.length) {
                const exact = sizes.find((n) => n === want);
                const pick = exact ?? sizes.filter((n) => n >= want).sort((a, b) => a - b)[0] ?? Math.max(...sizes);
                iconDataURL = frames[pick];
              }
            }
            this.win?.setOverlayIcon(electron8.nativeImage.createFromDataURL(iconDataURL), badge.description);
          }
        }
      }
      focus(options) {
        switch (options?.mode ?? 0 /* Transfer */) {
          case 0 /* Transfer */:
            this.doFocusWindow();
            break;
          case 1 /* Notify */:
            this.showNotifyFocus();
            break;
          case 2 /* Force */:
            if (isMacintosh) {
              electron8.app.focus({ steal: true });
            }
            this.doFocusWindow();
            break;
        }
      }
      showNotifyFocus() {
        const disposables = new DisposableStore();
        this.notifyFocusDisposable.value = disposables;
        disposables.add(DockBadgeManager.INSTANCE.acquireBadge(this));
        if (isWindows2 || isLinux) {
          this.win?.flashFrame(true);
          disposables.add(toDisposable(() => this.win?.flashFrame(false)));
        } else if (isMacintosh) {
          electron8.app.dock?.bounce("informational");
        }
      }
      clearNotifyFocus() {
        this.notifyFocusDisposable.clear();
      }
      doFocusWindow() {
        const win = this.win;
        if (!win) {
          return;
        }
        if (win.isMinimized()) {
          win.restore();
        }
        win.focus();
        win.webContents.focus();
      }
      static {
        //#region Window Control Overlays
        this.windowControlHeightStateStorageKey = "windowControlHeight";
      }
      updateWindowControls(options) {
        const win = this.win;
        if (!win) {
          return;
        }
        if (options.height) {
          this.stateService.setItem(CodeWindow.windowControlHeightStateStorageKey, options.height);
        }
        if (!isMacintosh && useWindowControlsOverlay(this.configurationService)) {
          if (options.dimmed !== void 0) {
            this.windowControlsDimmed = options.dimmed;
          }
          const backgroundColor = options.backgroundColor ?? this.lastWindowControlColors?.backgroundColor;
          const foregroundColor = options.foregroundColor ?? this.lastWindowControlColors?.foregroundColor;
          if (options.backgroundColor !== void 0 || options.foregroundColor !== void 0) {
            this.lastWindowControlColors = { backgroundColor, foregroundColor };
          }
          const effectiveBackgroundColor = this.windowControlsDimmed && backgroundColor ? this.dimColor(backgroundColor) : backgroundColor;
          const effectiveForegroundColor = this.windowControlsDimmed && foregroundColor ? this.dimColor(foregroundColor) : foregroundColor;
          win.setTitleBarOverlay({
            color: effectiveBackgroundColor?.trim() === "" ? void 0 : effectiveBackgroundColor,
            symbolColor: effectiveForegroundColor?.trim() === "" ? void 0 : effectiveForegroundColor,
            height: options.height ? options.height - 1 : void 0
            // account for window border
          });
        } else if (isMacintosh && options.height !== void 0) {
          const buttonHeight = isTahoeOrNewer(release6()) ? 14 : 16;
          const offset = Math.floor((options.height - buttonHeight) / 2);
          if (!offset) {
            win.setWindowButtonPosition(null);
          } else {
            win.setWindowButtonPosition({ x: offset + 1, y: offset });
          }
        }
      }
      dimColor(color2) {
        const parsed = Color.Format.CSS.parse(color2);
        if (!parsed) {
          return color2;
        }
        const dimFactor = 0.5;
        const r = Math.round(parsed.rgba.r * dimFactor);
        const g = Math.round(parsed.rgba.g * dimFactor);
        const b = Math.round(parsed.rgba.b * dimFactor);
        return `rgb(${r}, ${g}, ${b})`;
      }
      toggleFullScreen() {
        this.setFullScreen(!this.isFullScreen, false);
      }
      setFullScreen(fullscreen, fromRestore) {
        if (useNativeFullScreen(this.configurationService)) {
          this.setNativeFullScreen(fullscreen, fromRestore);
        } else {
          this.setSimpleFullScreen(fullscreen);
        }
      }
      get isFullScreen() {
        if (isMacintosh && typeof this.transientIsNativeFullScreen === "boolean") {
          return this.transientIsNativeFullScreen;
        }
        const win = this.win;
        const isFullScreen = win?.isFullScreen();
        const isSimpleFullScreen = win?.isSimpleFullScreen();
        return Boolean(isFullScreen || isSimpleFullScreen);
      }
      setNativeFullScreen(fullscreen, fromRestore) {
        const win = this.win;
        if (win?.isSimpleFullScreen()) {
          win?.setSimpleFullScreen(false);
        }
        this.doSetNativeFullScreen(fullscreen, fromRestore);
      }
      doSetNativeFullScreen(fullscreen, fromRestore) {
        if (isMacintosh) {
          this.transientIsNativeFullScreen = fullscreen;
          const joinNativeFullScreenTransition = this.joinNativeFullScreenTransition = new DeferredPromise();
          (async () => {
            const transitioned = await Promise.race([
              joinNativeFullScreenTransition.p,
              timeout(1e4).then(() => false)
            ]);
            if (this.joinNativeFullScreenTransition !== joinNativeFullScreenTransition) {
              return;
            }
            this.transientIsNativeFullScreen = void 0;
            this.joinNativeFullScreenTransition = void 0;
            if (!transitioned && fullscreen && fromRestore && this.win && !this.win.isFullScreen()) {
              this.logService.warn("window: native macOS fullscreen transition did not happen within 10s from restoring");
              this._onDidLeaveFullScreen.fire();
            }
          })();
        }
        const win = this.win;
        win?.setFullScreen(fullscreen);
      }
      setSimpleFullScreen(fullscreen) {
        const win = this.win;
        if (win?.isFullScreen()) {
          this.doSetNativeFullScreen(false, false);
        }
        win?.setSimpleFullScreen(fullscreen);
        win?.webContents.focus();
      }
      dispose() {
        super.dispose();
        this._win = null;
      }
    };
    CodeWindow = class extends BaseWindow2 {
      constructor(config, logService, loggerMainService, environmentMainService, policyService, userDataProfilesService, fileService, applicationStorageMainService, storageMainService, configurationService, themeMainService, workspacesManagementMainService, backupMainService, telemetryService, dialogMainService, lifecycleMainService, productService, protocolMainService, windowsMainService, stateService, instantiationService) {
        super(configurationService, stateService, environmentMainService, logService);
        ocExitReaperStart();
        this.loggerMainService = loggerMainService;
        this.policyService = policyService;
        this.userDataProfilesService = userDataProfilesService;
        this.fileService = fileService;
        this.applicationStorageMainService = applicationStorageMainService;
        this.storageMainService = storageMainService;
        this.themeMainService = themeMainService;
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.backupMainService = backupMainService;
        this.telemetryService = telemetryService;
        this.dialogMainService = dialogMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.productService = productService;
        this.windowsMainService = windowsMainService;
        //#region Events
        this._onWillLoad = this._register(new Emitter());
        this.onWillLoad = this._onWillLoad.event;
        this._onDidSignalReady = this._register(new Emitter());
        this.onDidSignalReady = this._onDidSignalReady.event;
        this._onDidDestroy = this._register(new Emitter());
        this.onDidDestroy = this._onDidDestroy.event;
        this.whenReadyCallbacks = [];
        this.touchBarGroups = [];
        this.currentHttpProxy = void 0;
        this.currentNoProxy = void 0;
        this.customZoomLevel = void 0;
        this.wasLoaded = false;
        this.readyState = 0 /* NONE */;
        this.swipeListenerDisposable = this._register(new MutableDisposable());
        {
          this.configObjectUrl = this._register(protocolMainService.createIPCObjectUrl());
          const [state, hasMultipleDisplays] = this.restoreWindowState(config.state);
          this.windowState = state;
          this.logService.trace("window#ctor: using window state", state);
          const webPreferences = {
            preload: FileAccess.asFileUri("vs/base/parts/sandbox/electron-browser/preload.js").fsPath,
            additionalArguments: [`--vscode-window-config=${this.configObjectUrl.resource.toString()}`],
            v8CacheOptions: this.environmentMainService.useCodeCache ? "bypassHeatCheck" : "none"
          };
          if (config.isSessionsWindow) {
            webPreferences.backgroundThrottling = false;
          }
          const options = instantiationService.invokeFunction(defaultBrowserWindowOptions, this.windowState, void 0, webPreferences);
          mark("code/willCreateCodeBrowserWindow");
          this._win = new electron8.BrowserWindow(options);
          mark("code/didCreateCodeBrowserWindow");
          this._id = this._win.id;
          this.setWin(this._win, options);
          this.applyState(this.windowState, hasMultipleDisplays);
          this._lastFocusTime = Date.now();
        }
        let sampleInterval = parseInt(this.environmentMainService.args["unresponsive-sample-interval"] || "1000");
        let samplePeriod = parseInt(this.environmentMainService.args["unresponsive-sample-period"] || "15000");
        if (sampleInterval <= 0 || samplePeriod <= 0 || sampleInterval > samplePeriod) {
          this.logService.warn(`Invalid unresponsive sample interval (${sampleInterval}ms) or period (${samplePeriod}ms), using defaults.`);
          sampleInterval = 1e3;
          samplePeriod = 15e3;
        }
        this.jsCallStackMap = /* @__PURE__ */ new Map();
        this.jsCallStackEffectiveSampleCount = Math.round(samplePeriod / sampleInterval);
        this.jsCallStackCollector = this._register(new Delayer(sampleInterval));
        this.jsCallStackCollectorStopScheduler = this._register(new RunOnceScheduler(() => {
          this.stopCollectingJScallStacks();
        }, samplePeriod));
        this.onConfigurationUpdated();
        this.createTouchBar();
        this.registerListeners();
      }
      get id() {
        return this._id;
      }
      get backupPath() {
        return this._config?.backupPath;
      }
      get openedWorkspace() {
        return this._config?.workspace;
      }
      get profile() {
        if (!this.config) {
          return void 0;
        }
        const profile = this.userDataProfilesService.profiles.find((profile2) => profile2.id === this.config?.profiles.profile.id);
        if (this.isExtensionDevelopmentHost && profile) {
          return profile;
        }
        return this.userDataProfilesService.getProfileForWorkspace(this.config.workspace ?? toWorkspaceIdentifier(this.backupPath, this.isExtensionDevelopmentHost)) ?? this.userDataProfilesService.defaultProfile;
      }
      get remoteAuthority() {
        return this._config?.remoteAuthority;
      }
      get config() {
        return this._config;
      }
      get isExtensionDevelopmentHost() {
        return !!this._config?.extensionDevelopmentPath;
      }
      get isExtensionTestHost() {
        return !!this._config?.extensionTestsPath;
      }
      get isExtensionDevelopmentTestFromCli() {
        return this.isExtensionDevelopmentHost && this.isExtensionTestHost && !this._config?.debugId;
      }
      setReady() {
        this.logService.trace(`window#load: window reported ready (id: ${this._id})`);
        this.readyState = 2 /* READY */;
        while (this.whenReadyCallbacks.length) {
          this.whenReadyCallbacks.pop()(this);
        }
        this._onDidSignalReady.fire();
      }
      ready() {
        return new Promise((resolve3) => {
          if (this.isReady) {
            return resolve3(this);
          }
          this.whenReadyCallbacks.push(resolve3);
        });
      }
      get isReady() {
        return this.readyState === 2 /* READY */;
      }
      get whenClosedOrLoaded() {
        return new Promise((resolve3) => {
          function handle() {
            closeListener.dispose();
            loadListener.dispose();
            resolve3();
          }
          const closeListener = this.onDidClose(() => handle());
          const loadListener = this.onWillLoad(() => handle());
        });
      }
      registerListeners() {
        this._register(Event.fromNodeEventEmitter(this._win, "unresponsive")(() => this.onWindowError(1 /* UNRESPONSIVE */)));
        this._register(Event.fromNodeEventEmitter(this._win, "responsive")(() => this.onWindowError(4 /* RESPONSIVE */)));
        this._register(Event.fromNodeEventEmitter(this._win.webContents, "render-process-gone", (event, details) => details)((details) => this.onWindowError(2 /* PROCESS_GONE */, { ...details })));
        this._register(Event.fromNodeEventEmitter(this._win.webContents, "did-fail-load", (event, exitCode, reason) => ({ exitCode, reason }))(({ exitCode, reason }) => this.onWindowError(3 /* LOAD */, { reason, exitCode })));
        this._register(Event.fromNodeEventEmitter(this._win.webContents, "will-prevent-unload")((event) => event.preventDefault()));
        this._register(Event.fromNodeEventEmitter(this._win.webContents, "did-finish-load")(() => {
          if (this.pendingLoadConfig) {
            this._config = this.pendingLoadConfig;
            this.pendingLoadConfig = void 0;
          }
        }));
        this._register(this.onDidMaximize(() => {
          if (this._config) {
            this._config.maximized = true;
          }
        }));
        this._register(this.onDidUnmaximize(() => {
          if (this._config) {
            this._config.maximized = false;
          }
        }));
        this._register(this.onDidEnterFullScreen(() => {
          this.sendWhenReady("vscode:enterFullScreen", CancellationToken.None);
        }));
        this._register(this.onDidLeaveFullScreen(() => {
          this.sendWhenReady("vscode:leaveFullScreen", CancellationToken.None);
        }));
        this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationUpdated(e)));
        this._register(this.workspacesManagementMainService.onDidDeleteUntitledWorkspace((e) => this.onDidDeleteUntitledWorkspace(e)));
        const urls = ["https://*.vsassets.io/*"];
        if (this.productService.extensionsGallery?.serviceUrl) {
          const serviceUrl = URI.parse(this.productService.extensionsGallery.serviceUrl);
          urls.push(`${serviceUrl.scheme}://${serviceUrl.authority}/*`);
        }
        this._win.webContents.session.webRequest.onBeforeSendHeaders({ urls }, async (details, cb) => {
          const headers = await this.getMarketplaceHeaders();
          cb({ cancel: false, requestHeaders: Object.assign(details.requestHeaders, headers) });
        });
      }
      getMarketplaceHeaders() {
        if (!this.marketplaceHeadersPromise) {
          this.marketplaceHeadersPromise = resolveMarketplaceHeaders(
            this.productService.version,
            this.productService,
            this.environmentMainService,
            this.configurationService,
            this.fileService,
            this.applicationStorageMainService,
            this.telemetryService
          );
        }
        return this.marketplaceHeadersPromise;
      }
      async onWindowError(type3, details) {
        switch (type3) {
          case 2 /* PROCESS_GONE */:
            this.logService.error(`CodeWindow: renderer process gone (reason: ${details?.reason || "<unknown>"}, code: ${details?.exitCode || "<unknown>"})`);
            break;
          case 1 /* UNRESPONSIVE */:
            this.logService.error("CodeWindow: detected unresponsive");
            break;
          case 4 /* RESPONSIVE */:
            this.logService.error("CodeWindow: recovered from unresponsive");
            break;
          case 3 /* LOAD */:
            this.logService.error(`CodeWindow: failed to load (reason: ${details?.reason || "<unknown>"}, code: ${details?.exitCode || "<unknown>"})`);
            break;
        }
        this.telemetryService.publicLog2("windowerror", {
          type: type3,
          reason: details?.reason,
          code: details?.exitCode
        });
        switch (type3) {
          case 1 /* UNRESPONSIVE */:
          case 2 /* PROCESS_GONE */:
            if (this.isExtensionDevelopmentTestFromCli) {
              this.lifecycleMainService.kill(1);
              return;
            }
            if (this.environmentMainService.args["enable-smoke-test-driver"]) {
              await this.destroyWindow(false, false);
              this.lifecycleMainService.quit();
              return;
            }
            if (type3 === 1 /* UNRESPONSIVE */) {
              if (this.isExtensionDevelopmentHost || this.isExtensionTestHost || this._win?.webContents?.isDevToolsOpened()) {
                return;
              }
              this.jsCallStackCollector.trigger(() => this.startCollectingJScallStacks());
              this.jsCallStackCollectorStopScheduler.schedule();
              const { response, checkboxChecked } = await this.dialogMainService.showMessageBox({
                type: "warning",
                buttons: [
                  localize(3708, null),
                  localize(3704, null),
                  localize(3709, null)
                ],
                message: localize(3702, null),
                detail: localize(3703, null),
                checkboxLabel: this._config?.workspace ? localize(3705, null) : void 0
              }, this._win);
              if (response !== 2) {
                const reopen = response === 0;
                this.stopCollectingJScallStacks();
                await this.destroyWindow(reopen, checkboxChecked);
              }
            } else if (type3 === 2 /* PROCESS_GONE */) {
              let message;
              if (!details) {
                message = localize(3698, null);
              } else {
                message = localize(3700, null, details.reason, details.exitCode ?? "<unknown>");
              }
              const { response, checkboxChecked } = await this.dialogMainService.showMessageBox({
                type: "warning",
                buttons: [
                  this._config?.workspace ? localize(3708, null) : localize(3707, null),
                  localize(3704, null)
                ],
                message,
                detail: this._config?.workspace ? localize(3701, null) : localize(3699, null),
                checkboxLabel: this._config?.workspace ? localize(3705, null) : void 0
              }, this._win);
              const reopen = response === 0;
              await this.destroyWindow(reopen, checkboxChecked);
            }
            break;
          case 4 /* RESPONSIVE */:
            this.stopCollectingJScallStacks();
            break;
        }
      }
      async destroyWindow(reopen, skipRestoreEditors) {
        const workspace = this._config?.workspace;
        if (skipRestoreEditors && workspace) {
          try {
            const workspaceStorage = this.storageMainService.workspaceStorage(workspace);
            await workspaceStorage.init();
            workspaceStorage.delete("memento/workbench.parts.editor");
            await workspaceStorage.close();
          } catch (error) {
            this.logService.error(error);
          }
        }
        this._onDidDestroy.fire();
        try {
          if (reopen && this._config) {
            let uriToOpen = void 0;
            let forceEmpty = void 0;
            if (isSingleFolderWorkspaceIdentifier(workspace)) {
              uriToOpen = { folderUri: workspace.uri };
            } else if (isWorkspaceIdentifier(workspace)) {
              uriToOpen = { workspaceUri: workspace.configPath };
            } else {
              forceEmpty = true;
            }
            const window2 = (await this.windowsMainService.open({
              context: 5 /* API */,
              userEnv: this._config.userEnv,
              cli: {
                ...this.environmentMainService.args,
                _: []
                // we pass in the workspace to open explicitly via `urisToOpen`
              },
              urisToOpen: uriToOpen ? [uriToOpen] : void 0,
              forceEmpty,
              forceNewWindow: true,
              remoteAuthority: this.remoteAuthority
            })).at(0);
            window2?.focus();
          }
        } finally {
          this._win?.destroy();
        }
      }
      onDidDeleteUntitledWorkspace(workspace) {
        if (this._config?.workspace?.id === workspace.id) {
          this._config.workspace = void 0;
        }
      }
      onConfigurationUpdated(e) {
        if (isMacintosh && (!e || e.affectsConfiguration("workbench.editor.swipeToNavigate"))) {
          const swipeToNavigate = this.configurationService.getValue("workbench.editor.swipeToNavigate");
          if (swipeToNavigate) {
            this.registerSwipeListener();
          } else {
            this.swipeListenerDisposable.clear();
          }
        }
        if (!e || e.affectsConfiguration("window.menuBarVisibility" /* MenuBarVisibility */)) {
          const newMenuBarVisibility = this.getMenuBarVisibility();
          if (newMenuBarVisibility !== this.currentMenuBarVisibility) {
            this.currentMenuBarVisibility = newMenuBarVisibility;
            this.setMenuBarVisibility(newMenuBarVisibility);
          }
        }
        if (!e || e.affectsConfiguration("http.proxy") || e.affectsConfiguration("http.noProxy")) {
          const inspect = this.configurationService.inspect("http.proxy");
          let newHttpProxy = (inspect.userLocalValue || "").trim() || (process.env["https_proxy"] || process.env["HTTPS_PROXY"] || process.env["http_proxy"] || process.env["HTTP_PROXY"] || "").trim() || void 0;
          if (newHttpProxy?.indexOf("@") !== -1) {
            const uri = URI.parse(newHttpProxy);
            const i = uri.authority.indexOf("@");
            if (i !== -1) {
              newHttpProxy = uri.with({ authority: uri.authority.substring(i + 1) }).toString();
            }
          }
          if (newHttpProxy?.endsWith("/")) {
            newHttpProxy = newHttpProxy.substr(0, newHttpProxy.length - 1);
          }
          const newNoProxy = (this.configurationService.getValue("http.noProxy") || []).map((item) => item.trim()).join(",") || (process.env["no_proxy"] || process.env["NO_PROXY"] || "").trim() || void 0;
          if ((newHttpProxy || "").indexOf("@") === -1 && (newHttpProxy !== this.currentHttpProxy || newNoProxy !== this.currentNoProxy)) {
            this.currentHttpProxy = newHttpProxy;
            this.currentNoProxy = newNoProxy;
            const proxyRules = newHttpProxy || "";
            const proxyBypassRules = newNoProxy ? `${newNoProxy},<local>` : "<local>";
            this.logService.trace(`Setting proxy to '${proxyRules}', bypassing '${proxyBypassRules}'`);
            this._win.webContents.session.setProxy({ proxyRules, proxyBypassRules, pacScript: "" });
            electron8.app.setProxy({ proxyRules, proxyBypassRules, pacScript: "" });
          }
        }
      }
      registerSwipeListener() {
        this.swipeListenerDisposable.value = Event.fromNodeEventEmitter(this._win, "swipe", (event, cmd) => cmd)((cmd) => {
          if (!this.isReady) {
            return;
          }
          if (cmd === "left") {
            this.send("vscode:runAction", { id: "workbench.action.openPreviousRecentlyUsedEditor", from: "mouse" });
          } else if (cmd === "right") {
            this.send("vscode:runAction", { id: "workbench.action.openNextRecentlyUsedEditor", from: "mouse" });
          }
        });
      }
      addTabbedWindow(window2) {
        if (isMacintosh && window2.win) {
          this._win.addTabbedWindow(window2.win);
        }
      }
      load(configuration, options = /* @__PURE__ */ Object.create(null)) {
        this.logService.trace(`window#load: attempt to load window (id: ${this._id})`);
        if (this.isDocumentEdited()) {
          if (!options.isReload || !this.backupMainService.isHotExitEnabled()) {
            this.setDocumentEdited(false);
          }
        }
        if (!options.isReload) {
          if (this.getRepresentedFilename()) {
            this.setRepresentedFilename("");
          }
          this._win.setTitle(this.productService.nameLong);
        }
        this.updateConfiguration(configuration, options);
        if (this.readyState === 0 /* NONE */) {
          this._config = configuration;
        } else {
          this.pendingLoadConfig = configuration;
        }
        this.readyState = 1 /* NAVIGATING */;
        let windowUrl;
        if (process.env.VSCODE_DEV && process.env.VSCODE_DEV_SERVER_URL) {
          windowUrl = process.env.VSCODE_DEV_SERVER_URL;
        } else if (configuration.isSessionsWindow) {
          windowUrl = FileAccess.asBrowserUri(`vs/sessions/electron-browser/sessions${this.environmentMainService.isBuilt ? "" : "-dev"}.html`).toString(true);
        } else {
          windowUrl = FileAccess.asBrowserUri(`vs/code/electron-browser/workbench/workbench${this.environmentMainService.isBuilt ? "" : "-dev"}.html`).toString(true);
        }
        this._win.loadURL(windowUrl);
        const wasLoaded = this.wasLoaded;
        this.wasLoaded = true;
        if (!this.environmentMainService.isBuilt && !this.environmentMainService.extensionTestsLocationURI) {
          this._register(new RunOnceScheduler(() => {
            if (this._win && !this._win.isVisible() && !this._win.isMinimized()) {
              this._win.show();
              this.focus({ mode: 2 /* Force */ });
              this._win.webContents.openDevTools();
            }
          }, 1e4)).schedule();
        }
        this._onWillLoad.fire({ workspace: configuration.workspace, reason: options.isReload ? 3 /* RELOAD */ : wasLoaded ? 2 /* LOAD */ : 1 /* INITIAL */ });
      }
      updateConfiguration(configuration, options) {
        const currentUserEnv = (this._config ?? this.pendingLoadConfig)?.userEnv;
        if (currentUserEnv) {
          const shouldPreserveLaunchCliEnvironment = isLaunchedFromCli(currentUserEnv) && !isLaunchedFromCli(configuration.userEnv);
          const shouldPreserveDebugEnvironmnet = this.isExtensionDevelopmentHost;
          if (shouldPreserveLaunchCliEnvironment || shouldPreserveDebugEnvironmnet) {
            configuration.userEnv = { ...currentUserEnv, ...configuration.userEnv };
          }
        }
        if (process.env["CHROME_CRASHPAD_PIPE_NAME"]) {
          Object.assign(configuration.userEnv, {
            CHROME_CRASHPAD_PIPE_NAME: process.env["CHROME_CRASHPAD_PIPE_NAME"]
          });
        }
        if (options.disableExtensions !== void 0) {
          configuration["disable-extensions"] = options.disableExtensions;
        }
        try {
          configuration.handle = VSBuffer.wrap(this._win.getNativeWindowHandle());
        } catch (error) {
          this.logService.error(`Error getting native window handle: ${error}`);
        }
        configuration.fullscreen = this.isFullScreen;
        configuration.maximized = this._win.isMaximized();
        configuration.partsSplash = this.themeMainService.getWindowSplash(configuration.workspace);
        configuration.zoomLevel = this.getZoomLevel();
        configuration.isCustomZoomLevel = typeof this.customZoomLevel === "number";
        if (configuration.isCustomZoomLevel && configuration.partsSplash) {
          configuration.partsSplash.zoomLevel = configuration.zoomLevel;
        }
        mark("code/willOpenNewWindow");
        configuration.perfMarks = getMarks();
        this.configObjectUrl.update(configuration);
      }
      async reload(cli) {
        const configuration = Object.assign({}, this._config);
        configuration.workspace = await this.validateWorkspaceBeforeReload(configuration);
        delete configuration.filesToOpenOrCreate;
        delete configuration.filesToDiff;
        delete configuration.filesToMerge;
        delete configuration.filesToWait;
        if (this.isExtensionDevelopmentHost && cli) {
          configuration.verbose = cli.verbose;
          configuration.debugId = cli.debugId;
          configuration.extensionEnvironment = cli.extensionEnvironment;
          configuration["inspect-extensions"] = cli["inspect-extensions"];
          configuration["inspect-brk-extensions"] = cli["inspect-brk-extensions"];
          configuration["extensions-dir"] = cli["extensions-dir"];
        }
        configuration.accessibilitySupport = electron8.app.isAccessibilitySupportEnabled();
        configuration.isInitialStartup = false;
        configuration.policiesData = this.policyService.serialize();
        configuration.continueOn = this.environmentMainService.continueOn;
        configuration.profiles = {
          all: this.userDataProfilesService.profiles,
          profile: this.profile || this.userDataProfilesService.defaultProfile,
          home: this.userDataProfilesService.profilesHome
        };
        configuration.logLevel = this.loggerMainService.getLogLevel();
        configuration.loggers = this.loggerMainService.getGlobalLoggers();
        this.load(configuration, { isReload: true, disableExtensions: cli?.["disable-extensions"] });
      }
      async validateWorkspaceBeforeReload(configuration) {
        if (isWorkspaceIdentifier(configuration.workspace)) {
          const configPath = configuration.workspace.configPath;
          if (configPath.scheme === Schemas.file) {
            const workspaceExists = await this.fileService.exists(configPath);
            if (!workspaceExists) {
              return void 0;
            }
          }
        } else if (isSingleFolderWorkspaceIdentifier(configuration.workspace)) {
          const uri = configuration.workspace.uri;
          if (uri.scheme === Schemas.file) {
            const folderExists = await this.fileService.exists(uri);
            if (!folderExists) {
              return void 0;
            }
          }
        }
        return configuration.workspace;
      }
      serializeWindowState() {
        if (!this._win) {
          return defaultWindowState();
        }
        if (this.isFullScreen) {
          let display;
          try {
            display = electron8.screen.getDisplayMatching(this.getBounds());
          } catch (error) {
          }
          const defaultState = defaultWindowState();
          return {
            mode: 3 /* Fullscreen */,
            display: display ? display.id : void 0,
            // Still carry over window dimensions from previous sessions
            // if we can compute it in fullscreen state.
            // does not seem possible in all cases on Linux for example
            // (https://github.com/microsoft/vscode/issues/58218) so we
            // fallback to the defaults in that case.
            width: this.windowState.width || defaultState.width,
            height: this.windowState.height || defaultState.height,
            x: this.windowState.x || 0,
            y: this.windowState.y || 0,
            zoomLevel: this.customZoomLevel
          };
        }
        const state = /* @__PURE__ */ Object.create(null);
        let mode;
        if (!isMacintosh && this._win.isMaximized()) {
          mode = 0 /* Maximized */;
        } else {
          mode = 1 /* Normal */;
        }
        if (mode === 0 /* Maximized */) {
          state.mode = 0 /* Maximized */;
        } else {
          state.mode = 1 /* Normal */;
        }
        if (mode === 1 /* Normal */ || mode === 0 /* Maximized */) {
          let bounds;
          if (mode === 1 /* Normal */) {
            bounds = this.getBounds();
          } else {
            bounds = this._win.getNormalBounds();
          }
          state.x = bounds.x;
          state.y = bounds.y;
          state.width = bounds.width;
          state.height = bounds.height;
        }
        state.zoomLevel = this.customZoomLevel;
        return state;
      }
      restoreWindowState(state) {
        mark("code/willRestoreCodeWindowState");
        let hasMultipleDisplays = false;
        if (state) {
          this.customZoomLevel = state.zoomLevel;
          try {
            const displays = electron8.screen.getAllDisplays();
            hasMultipleDisplays = displays.length > 1;
            state = WindowStateValidator.validateWindowState(this.logService, state, displays);
          } catch (err) {
            this.logService.warn(`Unexpected error validating window state: ${err}
${err.stack}`);
          }
        }
        mark("code/didRestoreCodeWindowState");
        return [state || defaultWindowState(), hasMultipleDisplays];
      }
      getBounds() {
        const [x, y] = this._win.getPosition();
        const [width, height] = this._win.getSize();
        return { x, y, width, height };
      }
      setFullScreen(fullscreen, fromRestore) {
        super.setFullScreen(fullscreen, fromRestore);
        this.sendWhenReady(fullscreen ? "vscode:enterFullScreen" : "vscode:leaveFullScreen", CancellationToken.None);
        if (this.currentMenuBarVisibility) {
          this.setMenuBarVisibility(this.currentMenuBarVisibility, false);
        }
      }
      getMenuBarVisibility() {
        let menuBarVisibility = getMenuBarVisibility(this.configurationService);
        if (["visible", "toggle", "hidden"].indexOf(menuBarVisibility) < 0) {
          menuBarVisibility = "classic";
        }
        return menuBarVisibility;
      }
      setMenuBarVisibility(visibility, notify = true) {
        if (isMacintosh) {
          return;
        }
        if (visibility === "toggle") {
          if (notify) {
            this.send("vscode:showInfoMessage", localize(3706, null));
          }
        }
        if (visibility === "hidden") {
          setTimeout(() => {
            this.doSetMenuBarVisibility(visibility);
          });
        } else {
          this.doSetMenuBarVisibility(visibility);
        }
      }
      doSetMenuBarVisibility(visibility) {
        const isFullscreen = this.isFullScreen;
        switch (visibility) {
          case "classic":
            this._win.setMenuBarVisibility(!isFullscreen);
            this._win.autoHideMenuBar = isFullscreen;
            break;
          case "visible":
            this._win.setMenuBarVisibility(true);
            this._win.autoHideMenuBar = false;
            break;
          case "toggle":
            this._win.setMenuBarVisibility(false);
            this._win.autoHideMenuBar = true;
            break;
          case "hidden":
            this._win.setMenuBarVisibility(false);
            this._win.autoHideMenuBar = false;
            break;
        }
      }
      notifyZoomLevel(zoomLevel) {
        this.customZoomLevel = zoomLevel;
      }
      getZoomLevel() {
        if (typeof this.customZoomLevel === "number") {
          return this.customZoomLevel;
        }
        const windowSettings2 = this.configurationService.getValue("window");
        return windowSettings2?.zoomLevel;
      }
      close() {
        this._win?.close();
      }
      sendWhenReady(channel, token, ...args2) {
        if (this.isReady) {
          this.send(channel, ...args2);
        } else {
          this.ready().then(() => {
            if (!token.isCancellationRequested) {
              this.send(channel, ...args2);
            }
          });
        }
      }
      send(channel, ...args2) {
        if (this._win) {
          if (this._win.isDestroyed() || this._win.webContents.isDestroyed()) {
            this.logService.warn(`Sending IPC message to channel '${channel}' for window that is destroyed`);
            return;
          }
          try {
            this._win.webContents.send(channel, ...args2);
          } catch (error) {
            this.logService.warn(`Error sending IPC message to channel '${channel}' of window ${this._id}: ${toErrorMessage(error)}`);
          }
        }
      }
      updateTouchBar(groups) {
        if (!isMacintosh) {
          return;
        }
        this.touchBarGroups.forEach((touchBarGroup, index) => {
          const commands = groups[index];
          touchBarGroup.segments = this.createTouchBarGroupSegments(commands);
        });
      }
      createTouchBar() {
        if (!isMacintosh) {
          return;
        }
        for (let i = 0; i < 10; i++) {
          const groupTouchBar = this.createTouchBarGroup();
          this.touchBarGroups.push(groupTouchBar);
        }
        this._win.setTouchBar(new electron8.TouchBar({ items: this.touchBarGroups }));
      }
      createTouchBarGroup(items = []) {
        const segments = this.createTouchBarGroupSegments(items);
        const control = new electron8.TouchBar.TouchBarSegmentedControl({
          segments,
          mode: "buttons",
          segmentStyle: "automatic",
          change: (selectedIndex) => {
            this.sendWhenReady("vscode:runAction", CancellationToken.None, { id: control.segments[selectedIndex].id, from: "touchbar" });
          }
        });
        return control;
      }
      createTouchBarGroupSegments(items = []) {
        const segments = items.map((item) => {
          let icon;
          if (item.icon && !ThemeIcon.isThemeIcon(item.icon) && item.icon?.dark?.scheme === Schemas.file) {
            icon = electron8.nativeImage.createFromPath(URI.revive(item.icon.dark).fsPath);
            if (icon.isEmpty()) {
              icon = void 0;
            }
          }
          let title;
          if (typeof item.title === "string") {
            title = item.title;
          } else {
            title = item.title.value;
          }
          return {
            id: item.id,
            label: !icon ? title : void 0,
            icon
          };
        });
        return segments;
      }
      async startCollectingJScallStacks() {
        if (!this.jsCallStackCollector.isTriggered()) {
          const stack = await this._win?.webContents.mainFrame.collectJavaScriptCallStack();
          if (stack) {
            const count = this.jsCallStackMap.get(stack) || 0;
            this.jsCallStackMap.set(stack, count + 1);
          }
          this.jsCallStackCollector.trigger(() => this.startCollectingJScallStacks());
        }
      }
      stopCollectingJScallStacks() {
        this.jsCallStackCollectorStopScheduler.cancel();
        this.jsCallStackCollector.cancel();
        if (this.jsCallStackMap.size) {
          let logMessage = `CodeWindow unresponsive samples:
`;
          let samples = 0;
          const sortedEntries = Array.from(this.jsCallStackMap.entries()).sort((a, b) => b[1] - a[1]);
          for (const [stack, count] of sortedEntries) {
            samples += count;
            if (Math.round(count * 100 / this.jsCallStackEffectiveSampleCount) > 20) {
              const fakeError = new UnresponsiveError(stack, this.id, this._win?.webContents.getOSProcessId());
              errorHandler.onUnexpectedError(fakeError);
            }
            logMessage += `<${count}> ${stack}
`;
          }
          logMessage += `Total Samples: ${samples}
`;
          logMessage += "For full overview of the unresponsive period, capture cpu profile via https://aka.ms/vscode-tracing-cpu-profile";
          this.logService.error(logMessage);
        }
        this.jsCallStackMap.clear();
      }
      matches(webContents4) {
        return this._win?.webContents.id === webContents4.id;
      }
      dispose() {
        super.dispose();
        this.loggerMainService.deregisterLoggers(this.id);
      }
    };
    CodeWindow = __decorateClass([
      __decorateParam(1, ILogService),
      __decorateParam(2, ILoggerMainService),
      __decorateParam(3, IEnvironmentMainService),
      __decorateParam(4, IPolicyService),
      __decorateParam(5, IUserDataProfilesMainService),
      __decorateParam(6, IFileService),
      __decorateParam(7, IApplicationStorageMainService),
      __decorateParam(8, IStorageMainService),
      __decorateParam(9, IConfigurationService),
      __decorateParam(10, IThemeMainService),
      __decorateParam(11, IWorkspacesManagementMainService),
      __decorateParam(12, IBackupMainService),
      __decorateParam(13, ITelemetryService),
      __decorateParam(14, IDialogMainService),
      __decorateParam(15, ILifecycleMainService),
      __decorateParam(16, IProductService),
      __decorateParam(17, IProtocolMainService),
      __decorateParam(18, IWindowsMainService),
      __decorateParam(19, IStateService),
      __decorateParam(20, IInstantiationService)
    ], CodeWindow);
    UnresponsiveError = class extends Error {
      constructor(sample, windowId, pid = 0) {
        const stackTraceLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        super(`UnresponsiveSampleError: from window with ID ${windowId} belonging to process with pid ${pid}`);
        Error.stackTraceLimit = stackTraceLimit;
        this.name = "UnresponsiveSampleError";
        this.stack = sample;
      }
    };
  }
});
export { electron8, screen3, release6, DockBadgeManager, BaseWindow2, CodeWindow, UnresponsiveError, init_windowImpl };
