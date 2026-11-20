// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/node/terminalProcess.ts
import { Disposable, toDisposable } from "./module-0011.mjs";
import { Emitter } from "./module-0021.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { basename, delimiter, dirname } from "./module-0016.mjs";
import { getWindowsBuildNumberSync } from "./module-0070.mjs";
import { WindowsShellHelper } from "./module-0075.mjs";
import { getShellIntegrationInjection, sanitizeEnvForLogging } from "./module-0067.mjs";
import { localize } from "./module-0013.mjs";
import { URI } from "./module-0017.mjs";
import { findExecutable } from "./module-0034.mjs";
import { ChildProcessMonitor } from "./module-0074.mjs";
import { timeout } from "./module-0028.mjs";
import { isNumber } from "./module-0009.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0049.mjs";
import { IProductService } from "./module-0072.mjs";


// src/vs/platform/terminal/node/terminalProcess.ts
import * as fs2 from "fs";

import { exec as exec2 } from "child_process";


// src/vs/platform/terminal/node/terminalProcess.ts
import { spawn as spawn2 } from "node-pty";

var posixShellTypeMap = /* @__PURE__ */ new Map([
  ["bash", "bash" /* Bash */],
  ["csh", "csh" /* Csh */],
  ["fish", "fish" /* Fish */],
  ["ksh", "ksh" /* Ksh */],
  ["sh", "sh" /* Sh */],
  ["zsh", "zsh" /* Zsh */]
]);

var generalShellTypeMap = /* @__PURE__ */ new Map([
  ["claude", "claude" /* Claude */],
  ["codex", "codex" /* Codex */],
  ["commandcode", "commandcode" /* CommandCode */],
  ["copilot", "copilot" /* Copilot */],
  ["gemini", "gemini" /* Gemini */],
  ["pwsh", "pwsh" /* PowerShell */],
  ["powershell", "pwsh" /* PowerShell */],
  ["python", "python" /* Python */],
  ["julia", "julia" /* Julia */],
  ["nu", "nu" /* NuShell */],
  ["node", "node" /* Node */],
  ["xonsh", "xonsh" /* Xonsh */]
]);

var TerminalProcess = class extends Disposable {
  constructor(shellLaunchConfig, cwd3, cols, rows, env2, _executableEnv, _options, _logService, _productService) {
    super();
    this.shellLaunchConfig = shellLaunchConfig;
    this._executableEnv = _executableEnv;
    this._options = _options;
    this._logService = _logService;
    this._productService = _productService;
    this.id = 0;
    this.shouldPersist = false;
    this._properties = {
      cwd: "",
      initialCwd: "",
      fixedDimensions: { cols: void 0, rows: void 0 },
      title: "",
      shellType: void 0,
      hasChildProcesses: true,
      resolvedShellLaunchConfig: {},
      overrideDimensions: void 0,
      failedShellIntegrationActivation: false,
      usedShellIntegrationInjection: void 0,
      shellIntegrationInjectionFailureReason: void 0
    };
    this._currentTitle = "";
    this._isPtyPaused = false;
    this._unacknowledgedCharCount = 0;
    this._onProcessData = this._register(new Emitter());
    this.onProcessData = this._onProcessData.event;
    this._onProcessReady = this._register(new Emitter());
    this.onProcessReady = this._onProcessReady.event;
    this._onDidChangeProperty = this._register(new Emitter());
    this.onDidChangeProperty = this._onDidChangeProperty.event;
    this._onProcessExit = this._register(new Emitter());
    this.onProcessExit = this._onProcessExit.event;
    let name;
    if (isWindows) {
      name = basename(this.shellLaunchConfig.executable || "");
    } else {
      name = "xterm-256color";
    }
    this._initialCwd = cwd3;
    this._properties["initialCwd" /* InitialCwd */] = this._initialCwd;
    this._properties["cwd" /* Cwd */] = this._initialCwd;
    const useConpty = process.platform === "win32" && getWindowsBuildNumberSync() >= 18309;
    const useConptyDll = useConpty && this._options.windowsUseConptyDll;
    // OpenCode p35: 集成终端（含 tasks）不继承 OpenCode 自己的 data\tmp：TEMP/TMP/TMPDIR 等于 OpenCode 的便携临时目录时还原成用户原来的值（原来没有就删掉）；用户在 terminal.integrated.env 里显式设的其它值保留；内部标记变量不带进终端
    try {
      const ocRaw = env2["OPENCODE_ORIG_TEMP_ENV"] ?? process.env["OPENCODE_ORIG_TEMP_ENV"];
      const ocPortable = env2["OPENCODE_PORTABLE_TEMP"] ?? process.env["OPENCODE_PORTABLE_TEMP"];
      if (ocRaw && ocPortable) {
        const ocOrig = JSON.parse(ocRaw) || {};
        const ocNorm = (p) => { let v = String(p).trim().replace(/[\\/]+$/, ""); return isWindows ? v.replace(/\//g, "\\").toLowerCase() : v; };
        const ocTarget = ocNorm(ocPortable);
        for (const key of Object.keys(env2)) {
          const up = isWindows ? key.toUpperCase() : key;
          if (up !== "TEMP" && up !== "TMP" && up !== "TMPDIR") continue;
          if (env2[key] === void 0 || env2[key] === null || ocNorm(env2[key]) !== ocTarget) continue;
          if (ocOrig[up] === void 0 || ocOrig[up] === null) delete env2[key]; else env2[key] = ocOrig[up];
        }
      }
      for (const key of Object.keys(env2)) if (/^OPENCODE_(ORIG_TEMP_ENV|PORTABLE_TEMP)$/i.test(key)) delete env2[key];
    } catch {}
    this._ptyOptions = {
      name,
      cwd: cwd3,
      // TODO: When node-pty is updated this cast can be removed
      env: env2,
      cols,
      rows,
      useConpty,
      useConptyDll,
      // This option will force conpty to not redraw the whole viewport on launch
      conptyInheritCursor: useConpty && !!shellLaunchConfig.initialText
    };
    if (isWindows) {
      if (useConpty && cols === 0 && rows === 0 && this.shellLaunchConfig.executable?.endsWith("Git\\bin\\bash.exe")) {
        this._delayedResizer = this._register(new DelayedResizer());
        this._register(this._delayedResizer.onTrigger((dimensions) => {
          this._delayedResizer?.dispose();
          this._delayedResizer = void 0;
          if (dimensions.cols && dimensions.rows) {
            this.resize(dimensions.cols, dimensions.rows);
          }
        }));
      }
      this._register(this.onProcessReady((e) => {
        this._windowsShellHelper = this._register(new WindowsShellHelper(e.pid));
        this._register(this._windowsShellHelper.onShellTypeChanged((e2) => this._onDidChangeProperty.fire({ type: "shellType" /* ShellType */, value: e2 })));
        this._register(this._windowsShellHelper.onShellNameChanged((e2) => this._onDidChangeProperty.fire({ type: "title" /* Title */, value: e2 })));
      }));
    }
    this._register(toDisposable(() => {
      if (this._titleInterval) {
        clearInterval(this._titleInterval);
        this._titleInterval = void 0;
      }
    }));
    this._register(toDisposable(() => {
      this._ptyProcess = void 0;
      this._processStartupComplete = void 0;
    }));
  }
  static {
    this._lastKillOrStart = 0;
  }
  get exitMessage() {
    return this._exitMessage;
  }
  get currentTitle() {
    return this._windowsShellHelper?.shellTitle || this._currentTitle;
  }
  get shellType() {
    return isWindows ? this._windowsShellHelper?.shellType : posixShellTypeMap.get(this._currentTitle) || generalShellTypeMap.get(this._currentTitle);
  }
  get hasChildProcesses() {
    return this._childProcessMonitor?.hasChildProcesses || false;
  }
  async start() {
    const results = await Promise.all([this._validateCwd(), this._validateExecutable()]);
    const firstError = results.find((r) => r !== void 0);
    if (firstError) {
      return firstError;
    }
    const injection = await getShellIntegrationInjection(this.shellLaunchConfig, this._options, this._ptyOptions.env, this._logService, this._productService);
    if (injection.type === "injection") {
      this._onDidChangeProperty.fire({ type: "usedShellIntegrationInjection" /* UsedShellIntegrationInjection */, value: true });
      if (injection.envMixin) {
        for (const [key, value] of Object.entries(injection.envMixin)) {
          this._ptyOptions.env ||= {};
          this._ptyOptions.env[key] = value;
        }
      }
      if (injection.filesToCopy) {
        for (const f of injection.filesToCopy) {
          try {
            await fs2.promises.mkdir(dirname(f.dest), { recursive: true });
            await fs2.promises.copyFile(f.source, f.dest);
          } catch {
          }
        }
      }
    } else {
      this._onDidChangeProperty.fire({ type: "failedShellIntegrationActivation" /* FailedShellIntegrationActivation */, value: true });
      this._onDidChangeProperty.fire({ type: "shellIntegrationInjectionFailureReason" /* ShellIntegrationInjectionFailureReason */, value: injection.reason });
      if (this._options.shellIntegration.nonce) {
        this._ptyOptions.env ||= {};
        this._ptyOptions.env["VSCODE_NONCE"] = this._options.shellIntegration.nonce;
      }
    }
    try {
      const injectionConfig = injection.type === "injection" ? injection : void 0;
      await this.setupPtyProcess(this.shellLaunchConfig, this._ptyOptions, injectionConfig);
      if (injectionConfig?.newArgs) {
        return { injectedArgs: injectionConfig.newArgs };
      }
      return void 0;
    } catch (err) {
      this._logService.trace("node-pty.node-pty.IPty#spawn native exception", err);
      const errorMessage = err.message;
      if (errorMessage?.includes("Cannot launch conpty")) {
        return { message: localize(3301, null, "https://code.visualstudio.com/updates/v1_109#_removal-of-winpty-support", "terminal.integrated.windowsUseConptyDll") };
      }
      return { message: `A native exception occurred during launch (${errorMessage})` };
    }
  }
  async _validateCwd() {
    try {
      const result = await fs2.promises.stat(this._initialCwd);
      if (!result.isDirectory()) {
        return { message: localize(3303, null, this._initialCwd.toString()) };
      }
    } catch (err) {
      if (err?.code === "ENOENT") {
        return { message: localize(3302, null, this._initialCwd.toString()) };
      }
    }
    this._onDidChangeProperty.fire({ type: "initialCwd" /* InitialCwd */, value: this._initialCwd });
    return void 0;
  }
  async _validateExecutable() {
    const slc = this.shellLaunchConfig;
    if (!slc.executable) {
      throw new Error("IShellLaunchConfig.executable not set");
    }
    const cwd3 = slc.cwd instanceof URI ? slc.cwd.path : slc.cwd;
    const envPaths = slc.env && slc.env.PATH ? slc.env.PATH.split(delimiter) : void 0;
    const executable = await findExecutable(slc.executable, cwd3, envPaths, this._executableEnv);
    if (!executable) {
      return { message: localize(3304, null, slc.executable) };
    }
    try {
      const result = await fs2.promises.stat(executable);
      if (!result.isFile() && !result.isSymbolicLink()) {
        return { message: localize(3305, null, slc.executable) };
      }
      slc.executable = executable;
    } catch (err) {
      if (err?.code === "EACCES") {
      } else {
        throw err;
      }
    }
    return void 0;
  }
  async setupPtyProcess(shellLaunchConfig, options, shellIntegrationInjection) {
    const args = shellIntegrationInjection?.newArgs || shellLaunchConfig.args || [];
    await this._throttleKillSpawn();
    const sanitizedOptions = { ...options, env: sanitizeEnvForLogging(options.env) };
    this._logService.trace("node-pty.IPty#spawn", shellLaunchConfig.executable, args, sanitizedOptions);
    const ptyProcess = spawn2(shellLaunchConfig.executable, args, options);
    this._ptyProcess = ptyProcess;
    this._childProcessMonitor = this._register(new ChildProcessMonitor(ptyProcess.pid, this._logService));
    this._register(this._childProcessMonitor.onDidChangeHasChildProcesses((value) => this._onDidChangeProperty.fire({ type: "hasChildProcesses" /* HasChildProcesses */, value })));
    this._processStartupComplete = new Promise((c) => {
      this._register(this.onProcessReady(() => c()));
    });
    this._register(ptyProcess.onData((data) => {
      this._unacknowledgedCharCount += data.length;
      if (!this._isPtyPaused && this._unacknowledgedCharCount > 1e5 /* HighWatermarkChars */) {
        this._logService.trace(`Flow control: Pause (${this._unacknowledgedCharCount} > ${1e5 /* HighWatermarkChars */})`);
        this._isPtyPaused = true;
        ptyProcess.pause();
      }
      this._logService.trace("node-pty.IPty#onData", data);
      this._onProcessData.fire(data);
      if (this._closeTimeout) {
        this._queueProcessExit();
      }
      this._windowsShellHelper?.checkShell();
      this._childProcessMonitor?.handleOutput();
    }));
    this._register(ptyProcess.onExit((e) => {
      this._exitCode = e.exitCode;
      this._queueProcessExit();
    }));
    if (ptyProcess.pid > 0) {
      this._sendProcessId(ptyProcess.pid);
    } else {
      const dataListener = ptyProcess.onData(() => {
        dataListener.dispose();
        this._childProcessMonitor?.setPid(ptyProcess.pid);
        this._sendProcessId(ptyProcess.pid);
      });
      this._register(dataListener);
    }
    this._setupTitlePolling(ptyProcess);
  }
  _setupTitlePolling(ptyProcess) {
    setTimeout(() => this._sendProcessTitle(ptyProcess));
    if (!isWindows) {
      this._titleInterval = setInterval(() => {
        if (this._currentTitle !== ptyProcess.process) {
          this._sendProcessTitle(ptyProcess);
        }
      }, 200);
    }
  }
  // Allow any trailing data events to be sent before the exit event is sent.
  // See https://github.com/microsoft/node-pty/issues/72
  _queueProcessExit() {
    if (this._logService.getLevel() === 1 /* Trace */) {
      this._logService.trace("TerminalProcess#_queueProcessExit", new Error().stack?.replace(/^Error/, ""));
    }
    if (this._closeTimeout) {
      clearTimeout(this._closeTimeout);
    }
    this._closeTimeout = setTimeout(() => {
      this._closeTimeout = void 0;
      this._kill();
    }, 250 /* DataFlushTimeout */);
  }
  async _kill() {
    await this._processStartupComplete;
    if (this._store.isDisposed) {
      return;
    }
    try {
      if (this._ptyProcess) {
        await this._throttleKillSpawn();
        this._logService.trace("node-pty.IPty#kill");
        this._ptyProcess.kill();
      }
    } catch (ex) {
    }
    this._onProcessExit.fire(this._exitCode || 0);
    this.dispose();
  }
  async _throttleKillSpawn() {
    if (!isWindows || !hasConptyOption(this._ptyOptions) || !this._ptyOptions.useConpty) {
      return;
    }
    if (this._ptyOptions.useConptyDll) {
      return;
    }
    while (Date.now() - TerminalProcess._lastKillOrStart < 250 /* KillSpawnThrottleInterval */) {
      this._logService.trace("Throttling kill/spawn call");
      await timeout(250 /* KillSpawnThrottleInterval */ - (Date.now() - TerminalProcess._lastKillOrStart) + 50 /* KillSpawnSpacingDuration */);
    }
    TerminalProcess._lastKillOrStart = Date.now();
  }
  _sendProcessId(pid) {
    this._onProcessReady.fire({
      pid,
      cwd: this._initialCwd,
      windowsPty: this.getWindowsPty()
    });
  }
  _sendProcessTitle(ptyProcess) {
    if (this._store.isDisposed) {
      return;
    }
    this._currentTitle = ptyProcess.process ?? "";
    this._onDidChangeProperty.fire({ type: "title" /* Title */, value: this._currentTitle });
    let sanitizedTitle = this.currentTitle.replace(/ \(figterm\)$/g, "");
    if (!isWindows) {
      sanitizedTitle = basename(sanitizedTitle);
    }
    if (sanitizedTitle.toLowerCase().startsWith("python")) {
      this._onDidChangeProperty.fire({ type: "shellType" /* ShellType */, value: "python" /* Python */ });
    } else if (sanitizedTitle.toLowerCase().startsWith("julia")) {
      this._onDidChangeProperty.fire({ type: "shellType" /* ShellType */, value: "julia" /* Julia */ });
    } else {
      const shellTypeValue = posixShellTypeMap.get(sanitizedTitle) || generalShellTypeMap.get(sanitizedTitle);
      this._onDidChangeProperty.fire({ type: "shellType" /* ShellType */, value: shellTypeValue });
    }
  }
  shutdown(immediate) {
    if (this._logService.getLevel() === 1 /* Trace */) {
      this._logService.trace("TerminalProcess#shutdown", new Error().stack?.replace(/^Error/, ""));
    }
    if (immediate && !isWindows) {
      this._kill();
    } else {
      if (!this._closeTimeout && !this._store.isDisposed) {
        this._queueProcessExit();
        setTimeout(() => {
          if (this._closeTimeout && !this._store.isDisposed) {
            this._closeTimeout = void 0;
            this._kill();
          }
        }, 5e3 /* MaximumShutdownTime */);
      }
    }
  }
  input(data, isBinary = false) {
    this._logService.trace("node-pty.IPty#write", data, isBinary);
    if (isBinary) {
      this._ptyProcess.write(Buffer.from(data, "binary"));
    } else {
      this._ptyProcess.write(data);
    }
    this._childProcessMonitor?.handleInput();
  }
  sendSignal(signal) {
    if (this._store.isDisposed || !this._ptyProcess) {
      return;
    }
    this._ptyProcess.kill(signal);
  }
  async processBinary(data) {
    this.input(data, true);
  }
  async refreshProperty(type) {
    switch (type) {
      case "cwd" /* Cwd */: {
        const newCwd = await this.getCwd();
        if (newCwd !== this._properties.cwd) {
          this._properties.cwd = newCwd;
          this._onDidChangeProperty.fire({ type: "cwd" /* Cwd */, value: this._properties.cwd });
        }
        return newCwd;
      }
      case "initialCwd" /* InitialCwd */: {
        const initialCwd = await this.getInitialCwd();
        if (initialCwd !== this._properties.initialCwd) {
          this._properties.initialCwd = initialCwd;
          this._onDidChangeProperty.fire({ type: "initialCwd" /* InitialCwd */, value: this._properties.initialCwd });
        }
        return initialCwd;
      }
      case "title" /* Title */:
        return this.currentTitle;
      default:
        return this.shellType;
    }
  }
  async updateProperty(type, value) {
    if (type === "fixedDimensions" /* FixedDimensions */) {
      this._properties.fixedDimensions = value;
    }
  }
  resize(cols, rows, pixelWidth, pixelHeight) {
    if (this._store.isDisposed) {
      return;
    }
    if (!isNumber(cols) || !isNumber(rows)) {
      return;
    }
    if (this._ptyProcess) {
      cols = Math.max(cols, 1);
      rows = Math.max(rows, 1);
      if (this._delayedResizer) {
        this._delayedResizer.cols = cols;
        this._delayedResizer.rows = rows;
        return;
      }
      this._logService.trace("node-pty.IPty#resize", cols, rows);
      try {
        const pixelSize = pixelWidth !== void 0 && pixelHeight !== void 0 ? { width: pixelWidth, height: pixelHeight } : void 0;
        this._ptyProcess.resize(cols, rows, pixelSize);
      } catch (e) {
        this._logService.trace("node-pty.IPty#resize exception " + e.message);
        if (this._exitCode !== void 0 && e.message !== "ioctl(2) failed, EBADF" && e.message !== "Cannot resize a pty that has already exited") {
          throw e;
        }
      }
    }
  }
  clearBuffer() {
    this._ptyProcess?.clear();
  }
  acknowledgeDataEvent(charCount) {
    this._unacknowledgedCharCount = Math.max(this._unacknowledgedCharCount - charCount, 0);
    this._logService.trace(`Flow control: Ack ${charCount} chars (unacknowledged: ${this._unacknowledgedCharCount})`);
    if (this._isPtyPaused && this._unacknowledgedCharCount < 5e3 /* LowWatermarkChars */) {
      this._logService.trace(`Flow control: Resume (${this._unacknowledgedCharCount} < ${5e3 /* LowWatermarkChars */})`);
      this._ptyProcess?.resume();
      this._isPtyPaused = false;
    }
  }
  clearUnacknowledgedChars() {
    this._unacknowledgedCharCount = 0;
    this._logService.trace(`Flow control: Cleared all unacknowledged chars, forcing resume`);
    if (this._isPtyPaused) {
      this._ptyProcess?.resume();
      this._isPtyPaused = false;
    }
  }
  async setUnicodeVersion(version) {
  }
  getInitialCwd() {
    return Promise.resolve(this._initialCwd);
  }
  async getCwd() {
    if (isMacintosh) {
      return new Promise((resolve3) => {
        if (!this._ptyProcess) {
          resolve3(this._initialCwd);
          return;
        }
        this._logService.trace("node-pty.IPty#pid");
        exec2("lsof -OPln -p " + this._ptyProcess.pid + " | grep cwd", { env: { ...process.env, LANG: "en_US.UTF-8" } }, (error, stdout, stderr) => {
          if (!error && stdout !== "") {
            resolve3(stdout.substring(stdout.indexOf("/"), stdout.length - 1));
          } else {
            this._logService.error("lsof did not run successfully, it may not be on the $PATH?", error, stdout, stderr);
            resolve3(this._initialCwd);
          }
        });
      });
    }
    if (isLinux) {
      if (!this._ptyProcess) {
        return this._initialCwd;
      }
      this._logService.trace("node-pty.IPty#pid");
      try {
        return await fs2.promises.readlink(`/proc/${this._ptyProcess.pid}/cwd`);
      } catch (error) {
        return this._initialCwd;
      }
    }
    return this._initialCwd;
  }
  getWindowsPty() {
    return isWindows ? {
      backend: "conpty",
      buildNumber: getWindowsBuildNumberSync()
    } : void 0;
  }
};

TerminalProcess = __decorateClass([
  __decorateParam(7, ILogService),
  __decorateParam(8, IProductService)
], TerminalProcess);

var DelayedResizer = class extends Disposable {
  constructor() {
    super();
    this._onTrigger = this._register(new Emitter());
    this._timeout = setTimeout(() => {
      this._onTrigger.fire({ rows: this.rows, cols: this.cols });
    }, 1e3);
    this._register(toDisposable(() => clearTimeout(this._timeout)));
  }
  get onTrigger() {
    return this._onTrigger.event;
  }
};

function hasConptyOption(obj) {
  return "useConpty" in obj;
}
export { hasConptyOption, fs2, exec2, spawn2, posixShellTypeMap, generalShellTypeMap, TerminalProcess, DelayedResizer };
