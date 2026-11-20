import { ChunkRing, acquireResources, canonicalResource } from './concurrency-runtime.mjs';
import { applyLowIlSandbox, labelFolderForLowWrites, sandboxModeFromToggle } from './sandbox-lowil.mjs';
// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/ide-tool-broker.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { parseManagedPrompt, windowsManagedBashProtocol } from "./module-0169.mjs";
import { ManagedCommandCanceller, NATIVE_MANAGED_COMMAND_OWNER_ID, forceCancellationRequiresConfirmation, managedCommandNotAccessibleError } from "./module-0138.mjs";
import { isManagedTerminalIdleExpired, managedTerminalIdleDelay } from "./module-0168.mjs";
function normalizeManagedTerminalCwd(value, platform) {
  if (platform !== "win32") return value;
  const drive = /^\/(?:cygdrive\/)?([a-z])(?:\/(.*))?$/i.exec(value);
  return drive ? `${drive[1].toUpperCase()}:/${drive[2] ?? ""}` : value;
}
import { managedCommandStateIdsToPrune } from "./module-0167.mjs";
import { createManagedCommandId, normalizeManagedCommandId } from "./module-0166.mjs";
import { ideDirectoryStructuredContent } from "./module-0146.mjs";
import { invokeLspTool } from "./module-0170.mjs";
import { IDE_TOOL_DEFINITIONS, getIdeToolDefinition } from "./module-0042.mjs";
import { validateToolInput } from "./module-0041.mjs";
import { resolveSafePath } from "./module-0038.mjs";


// extensions/opencode/src/ide-tool-broker.ts
init_define_OPENCODE_BUILD_INFO();

var child_process = __toESM(require("node:child_process"));

var import_node_fs23 = __toESM(require("node:fs"));

var import_node_os9 = __toESM(require("node:os"));

var import_node_path30 = __toESM(require("node:path"));

var import_node_string_decoder = require("node:string_decoder");

var vscode15 = __toESM(require("vscode"));


// extensions/opencode/src/ide-tool-broker.ts
var COMMON_EXCLUDES = /* @__PURE__ */ new Set([".git", "node_modules", "dist", "build", "coverage", ".next", "target", "vendor"]);

var MAX_CAPTURED_OUTPUT_BYTES = 2 * 1024 * 1024;

var DEFAULT_OUTPUT_BYTES = 32 * 1024;

var MAX_OUTPUT_BYTES2 = 128 * 1024;


var PTY_EXIT_DATA_FLUSH_MS = 100;

var PTY_OUTPUT_DRAIN_QUIET_MS = 40;

var PTY_OUTPUT_DRAIN_MAX_MS = 500;

var COMMAND_ECHO_TIMEOUT_MS = 3e3;

var MAX_ECHO_HUNT_BYTES = 1024 * 1024;

var MAX_GATE_HELD_CHARS = 512 * 1024;

var MANAGED_TERMINAL_NAME = /^OpenCode · \d+$/;

var CHAT_CAPTURE_COLUMNS = 1e3;

var CHAT_CAPTURE_INPUT_KEY = "__opencodeChatCapture";

var nodePtyModule;

function getNodePty() {
  if (nodePtyModule) return nodePtyModule;
  const candidates = [
    import_node_path30.default.join(vscode15.env.appRoot, "node_modules.asar", "node-pty"),
    import_node_path30.default.join(vscode15.env.appRoot, "node_modules", "node-pty")
  ];
  let lastError;
  for (const modulePath of candidates) {
    try {
      if (!import_node_fs23.default.existsSync(modulePath)) continue;
      const loaded = require(modulePath);
      if (typeof loaded.spawn !== "function") throw new Error("module does not export spawn()");
      nodePtyModule = loaded;
      return nodePtyModule;
    } catch (error2) {
      lastError = error2;
    }
  }
  const detail = lastError instanceof Error ? ` ${lastError.message}` : "";
  throw new Error(`OpenCode could not load the bundled node-pty runtime from ${vscode15.env.appRoot}.${detail}`);
}

function managedShellSpec(protocolToken) {
  if (process.platform === "win32") {
    const bundledBash = bundledGitBashExecutable();
    if (!bundledBash) {
      throw new Error("OpenCode managed terminal requires the product-bundled Git Bash runtime. Reinstall or rebuild OpenCode; PowerShell fallback is intentionally disabled.");
    }
    const gitRoot = import_node_path30.default.resolve(bundledBash, "..", "..");
    const protocol = windowsManagedBashProtocol(protocolToken);
    return {
      kind: "bash",
      executable: bundledBash,
      args: protocol.args,
      env: {
        ...protocol.env,
        SHELL: bundledBash,
        PATH: withBundledGitPath(gitRoot, process.env.PATH ?? process.env.Path ?? "")
      }
    };
  }
  const bash = "/bin/bash";
  if (import_node_fs23.default.existsSync(bash)) {
    const promptCommand = bashPromptCommand(protocolToken);
    return {
      kind: "bash",
      executable: bash,
      args: ["--noprofile", "--norc", "+H", "-i"],
      env: {
        PROMPT_COMMAND: promptCommand,
        PS1: "$ "
      }
    };
  }
  const sh = "/bin/sh";
  if (import_node_fs23.default.existsSync(sh)) {
    const promptExpression = [
      "__opencode_ec=$?",
      "__opencode_seq=$((${__opencode_seq:-0}+1))",
      `__opencode_cwd=$(printf '%s' "$PWD" | base64 | tr -d '\\r\\n')`,
      `printf '\\033]633;OpenCode;${protocolToken};%s;%s;%s\\007' "$__opencode_seq" "$__opencode_ec" "$__opencode_cwd"`
    ].join("; ");
    return {
      kind: "sh",
      executable: sh,
      args: ["-i"],
      env: { PS1: `$(${promptExpression})$ ` }
    };
  }
  throw new Error("OpenCode managed terminal cannot find /bin/bash or /bin/sh.");
}

function managedProcessEnvironment() {
  const env10 = Object.fromEntries(
    Object.entries(process.env).filter((entry) => typeof entry[1] === "string")
  );
  delete env10.VSCODE_INJECTION;
  delete env10.VSCODE_NONCE;
  delete env10.VSCODE_SHELL_INTEGRATION;
  delete env10.PROMPT_COMMAND;
  delete env10.PS1;
  delete env10.ENV;
  delete env10.BASH_ENV;
  env10.TERM = "xterm-256color";
  env10.COLORTERM = "truecolor";
  env10.OPENCODE_AGENT_TERMINAL = "1";
  // dsh-gap-fixes: an agent terminal has nobody to page output or answer prompts; without these git log/diff/commit can block until the call times out.
  if (!env10.GIT_PAGER) env10.GIT_PAGER = "cat";
  if (!env10.PAGER) env10.PAGER = "cat";
  if (!env10.GIT_TERMINAL_PROMPT) env10.GIT_TERMINAL_PROMPT = "0";
  if (!env10.GCM_INTERACTIVE) env10.GCM_INTERACTIVE = "never";
  if (!env10.GIT_EDITOR) env10.GIT_EDITOR = "true";
  if (process.platform === "win32") {
    const vendorModules = bundledModulesDir();
    if (vendorModules) env10.PSModulePath = `${vendorModules};${env10.PSModulePath ?? ""}`;
  }
  return env10;
}

var cachedBundledModulesDir;

function bundledModulesDir() {
  if (cachedBundledModulesDir === null) return void 0;
  if (cachedBundledModulesDir) return cachedBundledModulesDir;
  const candidates = [
    import_node_path30.default.join(__dirname, "..", "vendor"),
    import_node_path30.default.join(vscode15.env.appRoot, "extensions", "opencode", "vendor")
  ];
  for (const dir of candidates) {
    if (import_node_fs23.default.existsSync(import_node_path30.default.join(dir, "PSReadLine", "PSReadLine.psd1"))) {
      cachedBundledModulesDir = dir;
      return dir;
    }
  }
  cachedBundledModulesDir = null;
  return void 0;
}

var cachedBundledGitBash;

function bundledGitBashExecutable() {
  if (cachedBundledGitBash === null) return void 0;
  if (cachedBundledGitBash) return cachedBundledGitBash;
  const candidates = [
    import_node_path30.default.join(__dirname, "..", "runtime", "git", "bin", "bash.exe"),
    import_node_path30.default.join(vscode15.env.appRoot, "extensions", "opencode", "runtime", "git", "bin", "bash.exe")
  ];
  for (const candidate of candidates) {
    if (import_node_fs23.default.existsSync(candidate)) {
      cachedBundledGitBash = candidate;
      return candidate;
    }
  }
  cachedBundledGitBash = null;
  return void 0;
}

function withBundledGitPath(gitRoot, existingPath) {
  const additions = [
    import_node_path30.default.join(gitRoot, "usr", "bin"),
    import_node_path30.default.join(gitRoot, "mingw64", "bin"),
    import_node_path30.default.join(gitRoot, "bin")
  ];
  return [...additions, existingPath].filter(Boolean).join(";");
}

function bashPromptCommand(protocolToken) {
  return [
    '__opencode_ec=$? __opencode_pipe=("${PIPESTATUS[@]}")',
    "__opencode_seq=$((${__opencode_seq:-0}+1))",
    `__opencode_cwd=$(printf '%s' "$PWD" | base64 | tr -d '\\r\\n')`,
    `__opencode_pipeline=$(IFS=,; printf '%s' "\${__opencode_pipe[*]}")`,
    `printf '\\033]633;OpenCode;${protocolToken};%s;%s;%s;%s\\007' "$__opencode_seq" "$__opencode_ec" "$__opencode_cwd" "$__opencode_pipeline"`
  ].join("; ");
}

// OpenCode: 「权限」菜单的「隔离沙箱」开关（chat.agent.sandbox.enabledWindows）决定托管 Bash 是否以低完整性令牌 + Job 启动。
var MANAGED_SANDBOX_SECTION = "chat.agent.sandbox";
var MANAGED_SANDBOX_KEY = "enabledWindows";
function currentManagedSandboxMode() {
  if (process.platform !== "win32") return "off";
  return sandboxModeFromToggle(vscode15.workspace.getConfiguration(MANAGED_SANDBOX_SECTION).get(MANAGED_SANDBOX_KEY));
}
function managedSandboxWritableRoots() {
  return (vscode15.workspace.workspaceFolders ?? []).map((folder) => folder.uri.fsPath);
}
var sandboxLabelPromptOpen = false;
/** 工作区没有低完整性标签时提示用户；只有用户点击「为工作区启用沙箱写入」才执行 icacls。 */
function promptSandboxWorkspaceLabel(missing) {
  if (sandboxLabelPromptOpen || !missing?.length) return;
  sandboxLabelPromptOpen = true;
  const enable = "\u4e3a\u5de5\u4f5c\u533a\u542f\u7528\u6c99\u7bb1\u5199\u5165";
  const turnOff = "\u5173\u95ed\u9694\u79bb\u6c99\u7bb1";
  void vscode15.window.showWarningMessage(
    `\u300c\u9694\u79bb\u6c99\u7bb1\u300d\u5df2\u5f00\u542f\uff0c\u4f46\u5de5\u4f5c\u533a\u8fd8\u4e0d\u80fd\u88ab\u6c99\u7bb1\u5199\u5165\uff0cAI \u7684\u7ec8\u7aef\u547d\u4ee4\u6682\u4e0d\u8fd0\u884c\uff1a${missing.join("\uff1b")}\u3002\u70b9\u51fb\u300c${enable}\u300d\u4f1a\u5bf9\u4e0a\u8ff0\u76ee\u5f55\u6267\u884c icacls /setintegritylevel (OI)(CI)low\uff08\u53ea\u653e\u5f00\u6c99\u7bb1\u5bf9\u8fd9\u4e9b\u76ee\u5f55\u7684\u5199\u5165\uff1b\u5982\u7f3a\u5c11\u6743\u9650\uff0c\u4f1a\u5148\u7ed9\u5f53\u524d\u7528\u6237\u6388\u4e88\u8be5\u76ee\u5f55\u7684\u300c\u66f4\u6539\u6240\u6709\u8005\u300d\u6743\u9650\uff09\u3002`,
    enable,
    turnOff
  ).then(async (choice) => {
    try {
      if (choice === enable) {
        const failed = [];
        for (const folder of missing) {
          try {
            labelFolderForLowWrites(folder);
          } catch (error2) {
            failed.push(`${folder}\uff1a${error2 instanceof Error ? error2.message : String(error2)}`);
          }
        }
        if (failed.length) void vscode15.window.showErrorMessage(`\u4e3a\u5de5\u4f5c\u533a\u542f\u7528\u6c99\u7bb1\u5199\u5165\u5931\u8d25\uff1a${failed.join("\uff1b")}`);
        else void vscode15.window.showInformationMessage("\u5df2\u4e3a\u5de5\u4f5c\u533a\u542f\u7528\u6c99\u7bb1\u5199\u5165\uff0cAI \u7684\u7ec8\u7aef\u547d\u4ee4\u53ef\u4ee5\u5728\u6c99\u7bb1\u4e2d\u8fd0\u884c\u4e86\u3002");
      } else if (choice === turnOff) {
        await vscode15.workspace.getConfiguration(MANAGED_SANDBOX_SECTION).update(MANAGED_SANDBOX_KEY, "off", vscode15.ConfigurationTarget.Global);
      }
    } finally {
      sandboxLabelPromptOpen = false;
    }
  }, () => {
    sandboxLabelPromptOpen = false;
  });
}
var ManagedCommandPseudoterminal = class {
  constructor(initialCwd) {
    this.initialCwd = initialCwd;
    this.currentCwdValue = initialCwd;
    this.openPromise = new Promise((resolve) => {
      this.resolveOpen = resolve;
    });
  }
  initialCwd;
  writeEmitter = new vscode15.EventEmitter();
  onDidWrite = this.writeEmitter.event;
  closeEmitter = new vscode15.EventEmitter();
  onDidClose = this.closeEmitter.event;
  protocolToken = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  protocolPrefix = `\x1B]633;OpenCode;${this.protocolToken};`;
  shellKind = "powershell";
  /** Shell the persistent PTY actually launched; surfaced in the run_command result header. */
  get shellName() {
    return this.shellKind;
  }
  openPromise;
  resolveOpen;
  startPromise;
  ready = false;
  readyResolver;
  readyRejecter;
  protocolBuffer = "";
  // Echo gate state. The shell renders the typed command (and agent-sent input) back into the
  // PTY output stream (PSReadLine/Readline/tty echo), and ConPTY can deliver that rendering
  // late, interleaved with stale prompts, full-screen redraws (chat capture resizes the PTY
  // before each command) and cooked-echo/PSReadLine redraw races. The gate consumes the echo
  // so none of it leaks into the terminal display or the captured tool result.
  echoExpectation = "";
  echoMatchIndex = 0;
  echoGateActive = false;
  echoHuntBytesRemaining = 0;
  echoHuntDiscardAll = false;
  echoHuntingPromptLine = false;
  echoTimeoutTimer;
  // Bytes that arrived while the echo gate was closed. They are HELD, not discarded: when the
  // gate closes because the typed command's echo was recognised they were echo/redraw noise
  // and are dropped; in every other case (start marker seen, timeout, command finished, input
  // sent) they may contain the command's real output and are released into the capture.
  gateHeld = [];
  gateHeldBytes = 0;
  echoMatched = false;
  markerPromised = false;
  markerOnlyGate = false;
  lastGateOutcomeValue = "pending";
  lastGateReleasedBytesValue = 0;
  appliedCols = 0;
  appliedRows = 0;
  activePty;
  activePtyDataSubscription;
  activePtyExitSubscription;
  activeCommand;
  nextCommandSequence = 1;
  lastPromptSequence = 0;
  continuationPromptSeen = false;
  currentCwdValue;
  cols = 80;
  rows = 24;
  disposed = false;
  get currentCwd() {
    return this.currentCwdValue;
  }
  open(initialDimensions) {
    if (initialDimensions) {
      this.cols = Math.max(1, initialDimensions.columns);
      this.rows = Math.max(1, initialDimensions.rows);
    }
    this.resolveOpen();
  }
  close() {
    this.dispose();
  }
  setDimensions(dimensions) {
    this.cols = Math.max(1, dimensions.columns);
    this.rows = Math.max(1, dimensions.rows);
    const pty = this.activePty;
    if (!pty) return;
    if (this.activeCommand) return;
    this.applyResize(this.cols, this.rows);
  }
  /**
   * Resize the PTY only when the size really changes. A same-size ConPTY resize still makes
   * conhost repaint the entire viewport (previous commands, prompt) and that repaint is
   * delivered asynchronously, i.e. into the NEXT command's capture window. Every finished
   * command used to trigger one, which is a difference that exists only for a reused
   * terminal, never for a fresh one.
   */
  applyResize(cols, rows) {
    const pty = this.activePty;
    if (!pty) return;
    if (cols === this.appliedCols && rows === this.appliedRows) return;
    try {
      pty.resize(cols, rows);
      this.appliedCols = cols;
      this.appliedRows = rows;
    } catch {
    }
  }
  handleInput(data) {
    if (!this.activePty) return;
    this.activePty.write(data);
  }
  writeDisplay(text2) {
    if (!this.disposed) this.writeEmitter.fire(text2);
  }
  sendInput(text2, appendNewline) {
    if (!this.activePty) {
      throw new Error("The OpenCode managed PTY is not accepting input.");
    }
    if (!this.activeCommand || this.activeCommand.finishing || this.activeCommand.recoveryInitiated || this.protocolBuffer.startsWith(this.protocolPrefix)) {
      throw new Error("COMMAND_NOT_RUNNING: command input is closed at the prompt/cancellation boundary.");
    }
    this.settleGateHeld("released-input");
    this.resetEchoGate();
    if (this.echoTimeoutTimer) {
      clearTimeout(this.echoTimeoutTimer);
      this.echoTimeoutTimer = void 0;
    }
    this.activePty.write(appendNewline ? `${text2}\r` : text2);
  }
  /** Interrupt only the foreground command, preserving the Bash PTY for reuse. */
  interruptActiveCommand() {
    if (this.disposed || !this.activePty || !this.activeCommand || this.activeCommand.finishing) return false;
    this.settleGateHeld("released-input");
    this.resetEchoGate();
    if (this.echoTimeoutTimer) {
      clearTimeout(this.echoTimeoutTimer);
      this.echoTimeoutTimer = void 0;
    }
    try {
      this.activePty.write("");
      return true;
    } catch {
      return false;
    }
  }
  async ensureStarted() {
    if (!this.startPromise) this.startPromise = this.startPersistentShell();
    return this.startPromise;
  }
  async run(command, handlers, captureColumns) {
    await this.ensureStarted();
    if (this.disposed) throw new Error("The OpenCode managed terminal is closed.");
    if (!this.activePty) throw new Error("The OpenCode managed PTY shell is not running.");
    if (this.activeCommand) throw new Error("The OpenCode managed terminal is already running a command.");
    const sequence = this.nextCommandSequence++;
    this.activeCommand = { sequence, started: false, seqAtStart: this.lastPromptSequence, captureColumns, ...handlers };
    if (captureColumns) this.applyResize(captureColumns, this.rows);
    this.writeDisplay(`${command.replace(/\r?\n/g, "\r\n")}\r
`);
    const normalizedCommand = command.replace(/[\r\n]+/g, "");
    this.echoExpectation = normalizedCommand;
    this.echoMatchIndex = 0;
    this.echoHuntBytesRemaining = MAX_ECHO_HUNT_BYTES;
    this.echoHuntDiscardAll = true;
    this.echoHuntingPromptLine = false;
    this.echoGateActive = true;
    this.echoMatched = false;
    this.markerOnlyGate = this.markerPromised;
    this.markerPromised = false;
    this.gateHeld = [];
    this.gateHeldBytes = 0;
    this.lastGateOutcomeValue = "pending";
    this.lastGateReleasedBytesValue = 0;
    this.continuationPromptSeen = false;
    this.armEchoTimeout();
    try {
      this.activePty.write(`${command}\r`);
    } catch (error2) {
      this.activeCommand = void 0;
      this.resetEchoGate();
      this.restoreDisplayDimensions();
      throw error2;
    }
  }
  restoreDisplayDimensions() {
    this.applyResize(this.cols, this.rows);
  }
  /**
   * Cancel whatever the shell currently has buffered (PSReadLine continuation input, an
   * unclosed quote or here-string) with Esc + Ctrl+C, like a user clearing the line. The
   * interrupted command is marked recovered so it can never be reported as a success.
   */
  abortCurrentInput() {
    const active = this.activeCommand;
    if (active) active.recoveryInitiated = true;
    this.settleGateHeld("released-input");
    this.resetEchoGate();
    if (this.echoTimeoutTimer) {
      clearTimeout(this.echoTimeoutTimer);
      this.echoTimeoutTimer = void 0;
    }
    if (!this.activePty) return;
    try {
      this.activePty.write("\x1B");
    } catch {
    }
    setTimeout(() => {
      try {
        this.activePty?.write("");
      } catch {
      }
    }, 150);
  }
  get hasContinuationHint() {
    return this.continuationPromptSeen;
  }
  get lastSeenPromptSequence() {
    return this.lastPromptSequence;
  }
  async startPersistentShell() {
    await this.openPromise;
    if (this.disposed) throw new Error("The OpenCode managed terminal is closed.");
    // OpenCode: Low-integrity write sandbox, switched by the 「隔离沙箱」 toggle (chat.agent.sandbox.enabledWindows; OPENCODE_SANDBOX_MODE overrides).
    let shell;
    try {
      shell = applyLowIlSandbox(managedShellSpec(this.protocolToken), {
        mode: this.sandboxMode ?? currentManagedSandboxMode(),
        writableRoots: managedSandboxWritableRoots()
      });
    } catch (error2) {
      if (error2?.code === "SANDBOX_LABEL_REQUIRED") promptSandboxWorkspaceLabel(error2.missing);
      throw error2;
    }
    this.shellKind = shell.kind;
    const env10 = { ...managedProcessEnvironment(), ...shell.env };
    const ptyProcess = getNodePty().spawn(shell.executable, shell.args, {
      name: process.platform === "win32" ? "cmd" : "xterm-256color",
      cwd: this.initialCwd,
      env: env10,
      cols: this.cols,
      rows: this.rows
    });
    this.activePty = ptyProcess;
    this.appliedCols = this.cols;
    this.appliedRows = this.rows;
    this.activePtyDataSubscription = ptyProcess.onData((data) => {
      this.handlePtyData(data);
    });
    this.activePtyExitSubscription = ptyProcess.onExit((event) => {
      setTimeout(() => {
        if (this.activePty === ptyProcess) this.activePty = void 0;
        const activeCommand = this.activeCommand;
        this.activeCommand = void 0;
        if (activeCommand?.finishTimer) {
          clearTimeout(activeCommand.finishTimer);
          activeCommand.finishTimer = void 0;
        }
        if (!this.ready) {
          this.readyRejecter?.(new Error(`OpenCode managed PTY shell exited before its first prompt (exit_code=${event.exitCode}).`));
        }
        activeCommand?.onExit(event.exitCode, void 0, { recovered: activeCommand.recoveryInitiated === true, signal: event.signal });
        this.disposeActivePtySubscriptions();
        if (!this.disposed) this.closeEmitter.fire(event.exitCode >= 0 ? event.exitCode : 1);
      }, PTY_EXIT_DATA_FLUSH_MS);
    });
    if (!this.ready) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          if (this.ready) return;
          reject(new Error("OpenCode managed PTY shell did not reach its first prompt within 8 seconds."));
        }, 8e3);
        const finish = (fn) => () => {
          clearTimeout(timer);
          fn();
        };
        this.readyResolver = finish(resolve);
        this.readyRejecter = (error2) => finish(() => reject(error2))();
      });
    }
  }
  handlePtyData(data) {
    this.protocolBuffer += data;
    while (this.protocolBuffer) {
      const markerStart = this.protocolBuffer.indexOf(this.protocolPrefix);
      if (markerStart < 0) {
        const keep = this.protocolPrefixOverlap(this.protocolBuffer);
        const visible = this.protocolBuffer.slice(0, this.protocolBuffer.length - keep);
        if (visible) this.emitPtyData(visible);
        this.protocolBuffer = keep ? this.protocolBuffer.slice(-keep) : "";
        return;
      }
      if (markerStart > 0) this.emitPtyData(this.protocolBuffer.slice(0, markerStart));
      const markerEnd = this.protocolBuffer.indexOf("\x07", markerStart + this.protocolPrefix.length);
      if (markerEnd < 0) {
        this.protocolBuffer = this.protocolBuffer.slice(markerStart);
        return;
      }
      const payload = this.protocolBuffer.slice(markerStart + this.protocolPrefix.length, markerEnd);
      this.protocolBuffer = this.protocolBuffer.slice(markerEnd + 1);
      this.handleProtocolMarker(payload);
    }
  }
  protocolPrefixOverlap(value) {
    const max = Math.min(value.length, this.protocolPrefix.length - 1);
    for (let length = max; length > 0; length--) {
      if (this.protocolPrefix.startsWith(value.slice(-length))) return length;
    }
    return 0;
  }
  emitPtyData(data) {
    if (this.activeCommand && this.echoGateActive && this.markerOnlyGate) {
      this.holdGated(data);
      return;
    }
    if (this.activeCommand && this.echoGateActive) {
      const rest = this.consumeCommandEcho(data);
      if (rest === null) {
        this.holdGated(data);
        return;
      }
      this.echoGateActive = false;
      if (this.echoTimeoutTimer) {
        clearTimeout(this.echoTimeoutTimer);
        this.echoTimeoutTimer = void 0;
      }
      if (this.echoMatched) this.settleGateHeld("echo-matched");
      else this.settleGateHeld("hunt-exhausted");
      data = rest;
    }
    this.writeDisplay(data);
    if (!this.activeCommand) return;
    if (this.activeCommand.finishing) {
      this.activeCommand.onOutput(this.stripPromptText(data));
      return;
    }
    this.activeCommand.onOutput(data);
  }
  /**
   * Consume the shell's rendering of the typed command or agent-sent input. PSReadLine,
   * Readline and tty drivers echo the text back into the PTY output, and ConPTY can deliver
   * that rendering late, preceded by stale prompt text, full-screen redraws (chat capture
   * resizes the PTY to CHAT_CAPTURE_COLUMNS before each command) and cooked-echo fragments
   * (the classic "p<BS>python" race between the console echo and PSReadLine's redraw).
   *
   * The gate therefore does not require the echo to start at the first byte: it hunts for the
   * echo text while discarding known noise (prompt lines, blank lines, ANSI sequences,
   * backspaces; in chat mode everything up to the echo anchor because a resize redraw can
   * re-render arbitrary previous output), matches the text tolerantly (skipping the same
   * control noise, undoing backspace erasures, restarting after carriage-return redraws), and
   * after the full echo swallows only the line-accept newline plus redraw noise — any ordinary
   * byte opens the gate so real program output is never consumed. Hunting is bounded by
   * MAX_ECHO_HUNT_BYTES and by COMMAND_ECHO_TIMEOUT_MS.
   */
  consumeCommandEcho(data) {
    const expectation = this.echoExpectation;
    let index = 0;
    while (index < data.length) {
      const ch = data[index];
      if (ch === "\r" || ch === "\n") {
        index++;
        continue;
      }
      const ansi = ansiEscapeLength(data, index);
      if (ansi > 0) {
        index += ansi;
        continue;
      }
      if (ch === "\b") {
        index++;
        if (this.echoMatchIndex > 0) this.echoMatchIndex--;
        continue;
      }
      if (this.echoMatchIndex === 0) {
        if (this.echoHuntDiscardAll) {
          if (this.echoHuntBytesRemaining <= 0) {
            this.resetEchoGate();
            return data.slice(index);
          }
          this.echoHuntBytesRemaining--;
          if (data.startsWith(">>", index)) this.continuationPromptSeen = true;
          if (ch === expectation[0]) {
            this.echoMatchIndex++;
            index++;
            continue;
          }
          index++;
          continue;
        }
        if (this.echoHuntBytesRemaining <= 0) {
          this.resetEchoGate();
          return data.slice(index);
        }
        this.echoHuntBytesRemaining--;
        if (ch === " " || ch === "	" || ch === "\x07") {
          index++;
          continue;
        }
        if (this.echoHuntingPromptLine) {
          let cursor = index;
          while (cursor < data.length && data[cursor] !== "\r" && data[cursor] !== "\n") cursor++;
          if (cursor < data.length) this.echoHuntingPromptLine = false;
          index = cursor;
          continue;
        }
        if (data.startsWith(">>", index)) this.continuationPromptSeen = true;
        const promptLength = promptTextLength(data, index);
        if (promptLength === -1) {
          this.echoHuntingPromptLine = true;
          return null;
        }
        if (promptLength > 0) {
          index += promptLength;
          continue;
        }
        if (ch !== expectation[0]) {
          this.resetEchoGate();
          return data.slice(index);
        }
        this.echoMatchIndex++;
        index++;
        continue;
      }
      if (ch === "\r") {
        this.echoMatchIndex = 0;
        index++;
        continue;
      }
      if (this.echoMatchIndex >= expectation.length) break;
      if (ch !== expectation[this.echoMatchIndex]) {
        this.echoMatchIndex = 0;
        continue;
      }
      this.echoMatchIndex++;
      index++;
    }
    if (this.echoMatchIndex >= expectation.length) {
      while (index < data.length) {
        const ch = data[index];
        if (ch === "\r" || ch === "\n") {
          index++;
          continue;
        }
        const ansi = ansiEscapeLength(data, index);
        if (ansi > 0) {
          index += ansi;
          continue;
        }
        if (ch === "\b") {
          index++;
          continue;
        }
        break;
      }
      this.echoMatched = true;
      this.resetEchoGate();
      return data.slice(index);
    }
    return null;
  }
  /** Hold bytes that the closed echo gate would otherwise have thrown away (bounded). */
  holdGated(data) {
    this.gateHeld.push(data);
    this.gateHeldBytes += data.length;
    while (this.gateHeldBytes > MAX_GATE_HELD_CHARS && this.gateHeld.length > 1) {
      this.gateHeldBytes -= this.gateHeld.shift().length;
    }
  }
  /**
   * Settle the bytes held by the echo gate. "echo-matched" and "start-marker" mean they were
   * the typed command's echo or a repaint, so they are dropped; every other outcome releases
   * them into the command's capture (and the terminal view) so a mismatching echo can never
   * turn a successful command into an empty result.
   */
  settleGateHeld(outcome) {
    const held = this.gateHeld.join("");
    this.gateHeld = [];
    this.gateHeldBytes = 0;
    if (this.lastGateOutcomeValue === "pending") this.lastGateOutcomeValue = outcome;
    if (outcome === "echo-matched" || outcome === "start-marker" || !held) return;
    const active = this.activeCommand;
    if (!active) return;
    const text2 = active.finishing ? this.stripPromptText(held) : held;
    this.lastGateReleasedBytesValue += text2.length;
    this.writeDisplay(text2);
    active.onOutput(text2);
  }
  /** How the echo gate of the most recent command was settled (diagnostic, shown in run_command). */
  get lastGateOutcome() {
    return this.lastGateOutcomeValue;
  }
  get lastGateReleasedBytes() {
    return this.lastGateReleasedBytesValue;
  }
  /** Sequence number the next run() will use; lets a bridged script announce its own start. */
  get upcomingSequence() {
    return this.nextCommandSequence;
  }
  /**
   * One-line shell statement a bridged script prints first. The resulting OSC marker is an
   * unambiguous "the command body has started" boundary: everything before it is typed-line
   * echo or repaint noise, everything after it is real output. It removes the dependency on
   * recognising how this particular ConPTY/readline rendered the echo.
   */
  scriptStartMarkerStatement() {
    this.markerPromised = true;
    return `printf '\\033]633;OpenCode;${this.protocolToken};S;${this.nextCommandSequence}\\007'`;
  }
  resetEchoGate() {
    this.echoExpectation = "";
    this.echoMatchIndex = 0;
    this.echoGateActive = false;
    this.echoHuntBytesRemaining = 0;
    this.echoHuntDiscardAll = false;
    this.echoHuntingPromptLine = false;
  }
  armEchoTimeout() {
    if (this.echoTimeoutTimer) clearTimeout(this.echoTimeoutTimer);
    this.echoTimeoutTimer = setTimeout(() => {
      this.echoTimeoutTimer = void 0;
      this.echoGateActive = false;
      this.settleGateHeld("released-timeout");
      const active = this.activeCommand;
      if (active && !active.started) active.started = true;
      if (active && !active.finishing && this.continuationPromptSeen) this.abortCurrentInput();
    }, COMMAND_ECHO_TIMEOUT_MS);
  }
  handleProtocolMarker(payload) {
    if (payload.startsWith("S;")) {
      const sequence2 = Number.parseInt(payload.slice(2), 10);
      if (this.activeCommand?.sequence === sequence2) {
        this.activeCommand.started = true;
        if (this.echoGateActive) {
          this.echoGateActive = false;
          if (this.echoTimeoutTimer) {
            clearTimeout(this.echoTimeoutTimer);
            this.echoTimeoutTimer = void 0;
          }
          this.settleGateHeld("start-marker");
          this.resetEchoGate();
        }
      }
      return;
    }
    const snapshot = parseManagedPrompt(payload);
    if (!snapshot) return;
    const { sequence, exitCode, cwdBase64 } = snapshot;
    if (sequence > this.lastPromptSequence) this.lastPromptSequence = sequence;
    if (cwdBase64) {
      try {
        const cwd = Buffer.from(cwdBase64, "base64").toString("utf8");
        if (cwd) this.currentCwdValue = normalizeManagedTerminalCwd(cwd, process.platform);
      } catch {
      }
    }
    if (!this.ready) {
      this.ready = true;
      this.readyResolver?.();
      this.readyResolver = void 0;
      this.readyRejecter = void 0;
      return;
    }
    const activeCommand = this.activeCommand;
    if (!activeCommand) return;
    if (activeCommand.finishing) return;
    if (sequence <= activeCommand.seqAtStart) return;
    activeCommand.finishing = true;
    activeCommand.finishExitCode = exitCode;
    activeCommand.finishPipelineExitCodes = snapshot.pipelineExitCodes;
    activeCommand.finishTimer = setTimeout(() => {
      this.finishCommand(activeCommand);
    }, PTY_EXIT_DATA_FLUSH_MS);
  }
  finishCommand(command) {
    if (this.activeCommand === command && this.echoGateActive) this.settleGateHeld("released-finish");
    this.resetEchoGate();
    if (command.finishTimer) {
      clearTimeout(command.finishTimer);
      command.finishTimer = void 0;
    }
    if (this.echoTimeoutTimer) {
      clearTimeout(this.echoTimeoutTimer);
      this.echoTimeoutTimer = void 0;
    }
    if (this.activeCommand !== command) return;
    this.activeCommand = void 0;
    this.restoreDisplayDimensions();
    this.continuationPromptSeen = false;
    command.onExit(command.finishExitCode ?? null, command.finishPipelineExitCodes, { recovered: command.recoveryInitiated === true });
  }
  stripPromptText(text2) {
    return text2.replace(/(^|[\r\n])PS [^\r\n]*?>/g, "$1").replace(/(^|[\r\n])\$ /g, "$1");
  }
  terminateActiveProcess() {
    const activePty = this.activePty;
    if (!activePty) return;
    try {
      activePty.kill();
    } catch {
    }
  }
  disposeActivePtySubscriptions() {
    this.activePtyDataSubscription?.dispose();
    this.activePtyExitSubscription?.dispose();
    this.activePtyDataSubscription = void 0;
    this.activePtyExitSubscription = void 0;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.terminateActiveProcess();
    this.activePty = void 0;
    if (this.activeCommand?.finishTimer) {
      clearTimeout(this.activeCommand.finishTimer);
      this.activeCommand.finishTimer = void 0;
    }
    if (this.echoTimeoutTimer) {
      clearTimeout(this.echoTimeoutTimer);
      this.echoTimeoutTimer = void 0;
    }
    this.gateHeld = [];
    this.gateHeldBytes = 0;
    this.resetEchoGate();
    this.continuationPromptSeen = false;
    this.activeCommand = void 0;
    this.disposeActivePtySubscriptions();
    this.writeEmitter.dispose();
    this.closeEmitter.dispose();
  }
};

function asRecord4(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asString2(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBoolean2(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function asInteger2(value, fallback, min, max) {
  if (!Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, Number(value)));
}

function stripAnsi(text2) {
  return text2.replace(/[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~X]))/g, "");
}

var PARTIAL_ANSI_SUFFIX_RE = /[\u001B\u009B](?:[\[()#;?]*[0-9;:]*)?$/;

function ansiEscapeLength(text2, index) {
  if (text2[index] === "\x9B") {
    let cursor = index + 1;
    while (cursor < text2.length && /[0-9;:?<>]/.test(text2[cursor])) cursor++;
    if (cursor < text2.length && text2[cursor] >= "@" && text2[cursor] <= "~") return cursor - index + 1;
    return text2.length - index;
  }
  if (text2[index] !== "\x1B") return 0;
  if (index + 1 >= text2.length) return 1;
  const second = text2[index + 1];
  if (second === "[") {
    let cursor = index + 2;
    while (cursor < text2.length && /[0-9;:?<>]/.test(text2[cursor])) cursor++;
    if (cursor < text2.length && text2[cursor] >= "@" && text2[cursor] <= "~") return cursor - index + 1;
    return text2.length - index;
  }
  if (second === "]") {
    let cursor = index + 2;
    while (cursor < text2.length) {
      if (text2[cursor] === "\x07") return cursor - index + 1;
      if (text2[cursor] === "\x1B" && text2[cursor + 1] === "\\") return cursor - index + 2;
      cursor++;
    }
    return text2.length - index;
  }
  if (second === "(" || second === ")" || second === "#") {
    return index + 2 < text2.length ? 3 : text2.length - index;
  }
  if ("78=>DEHMcZ".includes(second)) return 2;
  return 0;
}

function promptTextLength(text2, index) {
  if (text2.startsWith("PS ", index)) {
    let cursor = index + 3;
    while (cursor < text2.length && text2[cursor] !== "\r" && text2[cursor] !== "\n" && text2[cursor] !== ">") cursor++;
    if (cursor < text2.length && text2[cursor] === ">") {
      cursor++;
      while (cursor < text2.length && (text2[cursor] === " " || text2[cursor] === "	")) cursor++;
      return cursor - index;
    }
    return -1;
  }
  if (text2.startsWith("$ ", index)) return 2;
  if (text2.startsWith(">>> ", index)) return 4;
  if (text2.startsWith("... ", index)) return 4;
  if (text2.startsWith("> ", index)) return 2;
  return 0;
}

function normalizeRelativePath(value) {
  const normalized = value.trim().replace(/\\/g, "/").replace(/^\.\//, "");
  return normalized || ".";
}

function isInside3(root, candidate) {
  const rootResolved = import_node_path30.default.resolve(root);
  const candidateResolved = import_node_path30.default.resolve(candidate);
  const rootCmp = process.platform === "win32" ? rootResolved.toLowerCase() : rootResolved;
  const candidateCmp = process.platform === "win32" ? candidateResolved.toLowerCase() : candidateResolved;
  const relative = import_node_path30.default.relative(rootCmp, candidateCmp);
  return relative === "" || relative !== ".." && !relative.startsWith(`..${import_node_path30.default.sep}`) && !import_node_path30.default.isAbsolute(relative);
}

function workspaceRoot2() {
  const folder = vscode15.workspace.workspaceFolders?.[0];
  if (!folder) throw new Error("No workspace folder is open.");
  return folder.uri.fsPath;
}

function resolveWorkspacePath(relative = ".") {
  const primaryRoot = workspaceRoot2();
  const raw = relative.trim();
  const rel = normalizeRelativePath(raw);
  const explicitAbsolute = import_node_path30.default.isAbsolute(raw) || import_node_path30.default.isAbsolute(rel);
  const absolute = explicitAbsolute ? import_node_path30.default.resolve(raw) : import_node_path30.default.resolve(primaryRoot, rel);
  const roots2 = explicitAbsolute ? vscode15.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [] : [primaryRoot];
  const root = roots2.find((folder) => isInside3(folder, absolute));
  if (!root) throw new Error(`PATH_OUTSIDE_WORKSPACE: Path is outside the workspace: ${relative}`);
  const normalizedRelative = import_node_path30.default.relative(root, absolute).replace(/\\/g, "/") || ".";
  return { root, absolute, relative: normalizedRelative, uri: vscode15.Uri.file(absolute) };
}

function resolveCommandCwd(requested) {
  const raw = requested.trim();
  // OpenCode: an absolute cwd works without an opened folder (native chat in an empty window passes
  // the dialogue's selected directory, e.g. the user home); relative paths still need a workspace.
  if (!import_node_path30.default.isAbsolute(raw) || (vscode15.workspace.workspaceFolders ?? []).some((folder) => isInside3(folder.uri.fsPath, raw))) {
    return resolveWorkspacePath(raw);
  }
  const absolute = import_node_fs23.default.realpathSync(raw);
  if (!import_node_fs23.default.statSync(absolute).isDirectory()) throw new Error(`NOT_A_DIRECTORY: ${requested}`);
  return { root: absolute, absolute, relative: absolute, uri: vscode15.Uri.file(absolute) };
}

function toolResult(text2) {
  return new vscode15.LanguageModelToolResult([new vscode15.LanguageModelTextPart(text2)]);
}

function summarizeCommand(command, maxLength = 48) {
  const firstLine = command.split(/\r?\n/, 1)[0]?.trim() ?? "";
  if (!firstLine) return "command";
  if (firstLine.length <= maxLength) return firstLine;
  return `${firstLine.slice(0, maxLength - 1)}\u2026`;
}

function writeTempScript(commandId, command, shellKind, startMarker) {
  if (shellKind === "powershell") {
    const scriptPath2 = import_node_path30.default.join(import_node_os9.default.tmpdir(), `opencode-run-${commandId}.ps1`);
    const prelude = "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)\r\n";
    let content;
    const insertAt = encodingPreludeInsertIndex(command);
    if (insertAt >= 0) {
      content = `\uFEFF${command.slice(0, insertAt)}\r
${prelude}${command.slice(insertAt)}\r
`;
    } else if (/^\s*param\s*\(/.test(command)) {
      content = `\uFEFF${command}\r
`;
    } else {
      content = `\uFEFF${prelude}${command}\r
`;
    }
    const nativeExitGuard = "\r\nif (-not $?) { if ($LASTEXITCODE -is [int]) { exit $LASTEXITCODE } else { exit 1 } }\r\n";
    import_node_fs23.default.writeFileSync(scriptPath2, `${content}${nativeExitGuard}`, "utf8");
    return scriptPath2;
  }
  const scriptPath = import_node_path30.default.join(import_node_os9.default.tmpdir(), `opencode-run-${commandId}.sh`);
  const prefix = startMarker ? `${startMarker}; ` : "";
  import_node_fs23.default.writeFileSync(scriptPath, `${prefix}${command.replace(/\r\n?/g, "\n")}
`, { mode: 448 });
  return scriptPath;
}

function encodingPreludeInsertIndex(command) {
  if (!/^\s*param\s*\(/.test(command)) return -1;
  const open6 = command.indexOf("(", command.indexOf("param"));
  if (open6 < 0) return -1;
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = open6; i < command.length; i++) {
    const ch = command[i];
    if (inSingle) {
      if (ch === "'") {
        if (command[i + 1] === "'") i++;
        else inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (ch === '"') {
        if (command[i + 1] === '"') i++;
        else inDouble = false;
      }
      continue;
    }
    if (ch === "'") inSingle = true;
    else if (ch === '"') inDouble = true;
    else if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

function tempScriptCommand(scriptPath, shellKind) {
  if (shellKind === "powershell") {
    const windowsRoot = process.env.SystemRoot || process.env.WINDIR || "C:\\Windows";
    const powershell = import_node_path30.default.join(windowsRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
    return `& "${powershell}" -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`;
  }
  if (process.platform === "win32") {
    return `bash "${scriptPath.replace(/\\/g, "/")}"`;
  }
  const shell = import_node_fs23.default.existsSync("/bin/bash") ? "/bin/bash" : "/bin/sh";
  return `${shell} "${scriptPath}"`;
}

function parseExitCode(text2) {
  const match = text2.match(/^exit_code: (-?\d+|null)$/m);
  if (!match) return void 0;
  return match[1] === "null" ? null : Number.parseInt(match[1], 10);
}

function resultText(result) {
  return result.content.map((part) => {
    if (typeof part?.value === "string") return part.value;
    if (part?.value && typeof part.value.value === "string") return part.value.value;
    return JSON.stringify(part);
  }).filter(Boolean).join("\n");
}

// recovered.33: light same-directory safety without WORKSPACE_BUSY. Mutating git/npm/pnpm/yarn subcommands of
// different sessions in one cwd are serialized for at most 30 s through the cross-process port registry; after
// that the command proceeds and its result carries concurrency_warning. apply_patch file locks are unchanged.
var SOFT_MUTATION_WAIT_MS = 30000;
var SOFT_MUTATION_RE = /(?:^|[\s;&|(])(?:git(?:\.exe)?(?:\s+-[cC]\s+\S+)*\s+(?:add|commit|checkout|switch|reset|merge|rebase|clean|pull|fetch|stash|cherry-pick|revert|restore|rm|mv|apply|am|tag|branch\s+-[dDmM])|(?:npm|pnpm|yarn)(?:\.cmd|\.exe)?\s+(?:install|i|ci|add|remove|rm|uninstall|un|update|up|upgrade|dedupe|prune|link|build|run\s+build))\b/i;
var SOFT_MUTATION_HOLDERS = /* @__PURE__ */ new Map();
var TerminalCommandManager = class {
  states = /* @__PURE__ */ new Map();
  slots = /* @__PURE__ */ new Map();
  commandCanceller = new ManagedCommandCanceller();
  nextTerminalId = 1;
  disposables = [];
  constructor() {
    for (const terminal of vscode15.window.terminals) {
      if (MANAGED_TERMINAL_NAME.test(terminal.name)) terminal.dispose();
    }
    // OpenCode: 「隔离沙箱」开关切换后重启托管终端——空闲的立即关闭，正在运行命令的在命令结束后不再复用并关闭
    this.disposables.push(vscode15.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration(`${MANAGED_SANDBOX_SECTION}.${MANAGED_SANDBOX_KEY}`)) return;
      this.closeSlotsWithStaleSandbox();
    }));
    this.disposables.push(
      vscode15.window.onDidCloseTerminal((terminal) => {
        for (const [slotId, slot] of this.slots) {
          if (slot.terminal !== terminal) continue;
          this.clearIdleTimer(slot);
          slot.closed = true;
          slot.pty.terminateActiveProcess();
          slot.busyCommandId = void 0;
          this.slots.delete(slotId);
        }
        for (const state of this.states.values()) {
          if (state.terminal !== terminal || state.status !== "running") continue;
          state.status = state.cancelRequestedAt === void 0 ? "killed" : "cancelled";
          state.exitCode = null;
          state.endedAt = Date.now();
          state.resolveDone();
        }
      })
    );
  }
  dispose() {
    for (const disposable of this.disposables) disposable.dispose();
    for (const state of this.states.values()) {
      if (state.kind !== "direct" || state.status !== "running") continue;
      try {
        state.child?.kill();
      } catch {
      }
      state.status = "killed";
      state.exitCode = null;
      state.endedAt = Date.now();
      state.resolveDone();
    }
    for (const slot of this.slots.values()) {
      this.clearIdleTimer(slot);
      if (!slot.closed) slot.terminal.dispose();
    }
    this.slots.clear();
    this.states.clear();
  }
  sameFileSystemPath(a, b) {
    return this.fileSystemPathKey(a) === this.fileSystemPathKey(b);
  }
  fileSystemPathKey(value) {
    const resolved = import_node_path30.default.resolve(normalizeManagedTerminalCwd(value, process.platform));
    return process.platform === "win32" ? resolved.toLowerCase() : resolved;
  }
  currentSlotCwd(slot) {
    return normalizeManagedTerminalCwd(slot.pty.currentCwd || slot.initialCwd, process.platform);
  }
  clearIdleTimer(slot) {
    if (!slot.idleTimer) return;
    clearTimeout(slot.idleTimer);
    slot.idleTimer = void 0;
  }
  scheduleIdleClose(slot) {
    this.clearIdleTimer(slot);
    if (slot.closed || slot.busyCommandId) return;
    slot.idleTimer = setTimeout(() => {
      slot.idleTimer = void 0;
      if (slot.closed || slot.busyCommandId) return;
      if (!isManagedTerminalIdleExpired(slot.lastUsedAt)) {
        this.scheduleIdleClose(slot);
        return;
      }
      this.disposeIdleSlot(slot);
    }, managedTerminalIdleDelay(slot.lastUsedAt));
    slot.idleTimer.unref?.();
  }
  disposeIdleSlot(slot) {
    if (slot.closed || slot.busyCommandId) return;
    this.clearIdleTimer(slot);
    slot.closed = true;
    this.slots.delete(slot.id);
    slot.terminal.dispose();
  }
  closeSlotsWithStaleSandbox() {
    const mode = currentManagedSandboxMode();
    for (const slot of [...this.slots.values()]) {
      if (slot.closed || slot.sandboxMode === mode) continue;
      if (slot.busyCommandId) slot.sandboxStale = true;
      else this.disposeIdleSlot(slot);
    }
  }
  forceCloseSlot(slot) {
    if (slot.closed) return;
    this.clearIdleTimer(slot);
    slot.closed = true;
    slot.busyCommandId = void 0;
    this.slots.delete(slot.id);
    slot.pty.terminateActiveProcess();
    slot.terminal.dispose();
  }
  async acquireTerminal(ownerId, commandId, cwdInfo) {
    const sandboxMode2 = currentManagedSandboxMode();
    for (const stale of [...this.slots.values()]) {
      if (!stale.closed && !stale.busyCommandId && stale.sandboxMode !== sandboxMode2) this.disposeIdleSlot(stale);
    }
    const candidates = [...this.slots.values()].filter((slot2) => slot2.ownerId === ownerId && !slot2.closed && !slot2.busyCommandId && slot2.sandboxMode === sandboxMode2).sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    for (const slot2 of candidates) {
      if (slot2.closed || slot2.busyCommandId) continue;
      if (cwdInfo && !this.sameFileSystemPath(this.currentSlotCwd(slot2), cwdInfo.absolute)) continue;
      this.clearIdleTimer(slot2);
      slot2.busyCommandId = commandId;
      slot2.lastUsedAt = Date.now();
      try {
        slot2.terminal.show(true);
        return { slot: slot2, reused: true, effectiveCwd: this.currentSlotCwd(slot2) };
      } catch (error2) {
        this.forceCloseSlot(slot2);
        throw error2;
      }
    }
    const initialCwd = cwdInfo?.absolute ?? resolveWorkspacePath(".").absolute;
    const terminalNumber = this.nextTerminalId++;
    const pty = new ManagedCommandPseudoterminal(initialCwd);
    pty.sandboxMode = sandboxMode2;
    const terminal = vscode15.window.createTerminal({
      name: `OpenCode \xB7 ${terminalNumber}`,
      pty,
      location: vscode15.TerminalLocation.Panel,
      iconPath: new vscode15.ThemeIcon(sandboxMode2 === "off" ? "shield" : "lock"),
      color: new vscode15.ThemeColor("terminal.ansiBlue"),
      // Agent terminals are implementation detail of the current Extension Host session.
      // Persisting/restoring them creates orphan duplicates because command state is in memory.
      isTransient: true
    });
    const slot = {
      id: `terminal_${terminalNumber}`,
      ownerId,
      terminal,
      pty,
      initialCwd,
      busyCommandId: commandId,
      closed: false,
      sandboxMode: sandboxMode2,
      lastUsedAt: Date.now()
    };
    this.slots.set(slot.id, slot);
    try {
      terminal.show(true);
      await pty.ensureStarted();
      return { slot, reused: false, effectiveCwd: this.currentSlotCwd(slot) };
    } catch (error2) {
      slot.closed = true;
      slot.busyCommandId = void 0;
      this.slots.delete(slot.id);
      pty.dispose();
      terminal.dispose();
      throw error2;
    }
  }
  displayCwd(absolute) {
    const root = workspaceRoot2();
    if (!isInside3(root, absolute)) return absolute;
    return import_node_path30.default.relative(root, absolute).replace(/\\/g, "/") || ".";
  }
  appendOutput(state, text2) {
    const previousPending = state.ansiPending;
    let clean = stripAnsi(previousPending + text2);
    const pending = clean.match(PARTIAL_ANSI_SUFFIX_RE);
    if (pending) {
      state.ansiPending = pending[0];
      clean = clean.slice(0, clean.length - pending[0].length);
    } else {
      state.ansiPending = "";
      if (previousPending && clean.startsWith(previousPending)) {
        clean = clean.slice(previousPending.length);
      }
    }
    clean = clean.replace(/.?\u0008/g, "");
    if (state.output.length === 0) {
      clean = clean.replace(/^(?:\r?\n|[ \t])*/, "").replace(/^PS [^\r\n]*> ?/, "").replace(/^\$ /, "").replace(/^(?:\r?\n|[ \t])*/, "");
    }
    if (!clean) return;
    const bytes = Buffer.from(clean, "utf8");
    state.totalOutputBytes += bytes.length;
    state.output.append(bytes);
    state.outputStartOffset = state.totalOutputBytes - state.output.length;
  }
  finishState(state, exitCode, status, meta2) {
    if (state.status !== "running") return;
    let finalStatus = state.cancelRequestedAt !== void 0 ? "cancelled" : status ?? (exitCode === 0 ? "completed" : "failed");
    // Interactive history expansion can reject input without setting a nonzero status.
    const parserEvidence = /\+\s*CategoryInfo\s*:[^\r\n]*ParserError|(?:^|[\r\n])(?:[^\r\n]*[\\/])?-?bash(?:\.exe)?:[^\r\n]*:\s*event not found(?:[\r\n]|$)/i.test(state.output.toString("utf8"));
    state.suspectedParserError = finalStatus === "completed" && exitCode === 0 && parserEvidence;
    if (state.suspectedParserError) {
      finalStatus = "failed";
      exitCode = null;
    }
    state.recoveredByAbort = meta2?.recovered === true;
    state.exitCode = exitCode;
    state.status = finalStatus;
    state.endedAt = Date.now();
    if (state.slot) {
      state.slot.lastUsedAt = state.endedAt;
      if (state.slot.busyCommandId === state.id) state.slot.busyCommandId = void 0;
      if (!state.slot.closed && state.slot.sandboxStale && !state.slot.busyCommandId) this.disposeIdleSlot(state.slot);
      else if (!state.slot.closed) this.scheduleIdleClose(state.slot);
    }
    const tempScript = state.tempScriptPath;
    if (tempScript) {
      state.tempScriptPath = void 0;
      import_node_fs23.default.unlink(tempScript, () => {
      });
    }
    state.resolveDone();
    this.pruneCommandStates();
  }
  pruneCommandStates() {
    const pruneIds = managedCommandStateIdsToPrune([...this.states.values()].map((state) => ({
      id: state.id,
      ownerId: state.ownerId,
      status: state.status,
      endedAt: state.endedAt
    })));
    for (const id of pruneIds) this.states.delete(id);
  }
  readOutput(state, requestedOffset = 0, maxBytes = DEFAULT_OUTPUT_BYTES) {
    const limit = Math.min(MAX_OUTPUT_BYTES2, Math.max(1, maxBytes));
    const outputLost = requestedOffset < state.outputStartOffset;
    const actualOffset = Math.max(state.outputStartOffset, Math.min(requestedOffset, state.totalOutputBytes));
    const localStart = actualOffset - state.outputStartOffset;
    const available = state.output.subarray(localStart);
    const slice = available.subarray(0, limit);
    const nextOffset = actualOffset + slice.length;
    return {
      command_id: state.id,
      terminal_id: state.terminalId,
      execution: state.kind,
      terminal_name: state.terminalName,
      terminal_reused: state.terminalReused,
      status: state.status,
      exit_code: state.exitCode,
      pipeline_exit_codes: vscode15.workspace.getConfiguration("opencode.terminal").get("pipelineExitCodes", true) ? state.pipelineExitCodes ?? null : null,
      cwd: state.cwd,
      background: state.background,
      duration_ms: (state.endedAt ?? Date.now()) - state.startedAt,
      output: slice.toString("utf8"),
      output_start_offset: actualOffset,
      next_offset: nextOffset,
      total_output_bytes: state.totalOutputBytes,
      output_lost: outputLost,
      has_more: nextOffset < state.totalOutputBytes
    };
  }
  /**
   * Wait for a finished command's PTY output to settle before it is snapshotted.
   *
   * The exit marker (and the fixed PTY_EXIT_DATA_FLUSH_MS window) can fire before
   * the shell's last data burst is delivered on a slow host, which left the first
   * run_command response empty or truncated even though the bytes landed moments
   * later. Polling totalOutputBytes until it stops growing closes that gap while a
   * hard ceiling keeps a chatty tail from delaying the reply.
   */
  async drainPendingOutput(state, quietMs = PTY_OUTPUT_DRAIN_QUIET_MS, maxMs = PTY_OUTPUT_DRAIN_MAX_MS) {
    const deadline2 = Date.now() + maxMs;
    for (; ; ) {
      const before = state.totalOutputBytes;
      await new Promise((resolve) => setTimeout(resolve, quietMs));
      if (state.totalOutputBytes === before || Date.now() >= deadline2) {
        return;
      }
    }
  }
  async run(input, ownerId = NATIVE_MANAGED_COMMAND_OWNER_ID, signal) {
    // No global process-slot quota and no WORKSPACE_BUSY rejection. Keep terminal ownership.
    signal?.throwIfAborted();
    const soft = await this.softMutationAdmission(input, ownerId, signal);
    let capWarning = null;
    try {
      capWarning = await this.softRunningCap(input, signal);
    } catch (error) {
      soft.release?.();
      throw error;
    }
    const warning = [soft.warning, capWarning].filter(Boolean).join("；") || null;
    let attached = false;
    try {
      signal?.throwIfAborted();
      const text = await this.runLeased(input, ownerId, soft.release, () => { attached = true; });
      return warning && typeof text === "string" ? text.replace("=== RUN_COMMAND BEGIN ===\n", `=== RUN_COMMAND BEGIN ===\nconcurrency_warning: ${JSON.stringify(warning)}\n`) : text;
    } finally {
      if (!attached) soft.release?.();
    }
  }
  /**
   * running-cap: soft limit on foreground commands running at once across all sessions in this window,
   * so parallel models cannot saturate the machine. Never rejects (no busy/quota error):
   * waits up to 60 s for a running command to finish, then starts anyway with a warning.
   * Limit: setting opencode.commands.maxConcurrent or env OPENCODE_MAX_RUNNING_COMMANDS;
   * default max(4, logical CPUs); 0 = unlimited. Background commands are not counted or delayed.
   */
  runningCapLimit() {
    const env = globalThis.process?.env ?? {};
    let configured;
    try { configured = vscode15.workspace.getConfiguration("opencode").get("commands.maxConcurrent"); } catch { configured = void 0; }
    const pick = [env.OPENCODE_MAX_RUNNING_COMMANDS, configured].find((value) => value !== void 0 && value !== null && String(value).trim() !== "");
    const raw = pick === void 0 ? NaN : Number(pick);
    if (Number.isFinite(raw) && raw >= 0) return Math.floor(raw);
    const cpus = Number(env.NUMBER_OF_PROCESSORS) || 4;
    return Math.max(4, cpus);
  }
  async softRunningCap(input, signal) {
    if (input?.background === true) return null;
    const limit = this.runningCapLimit();
    if (!limit) return null;
    const running = () => [...this.states.values()].filter((state) => state.status === "running" && state.background !== true).length;
    if (running() < limit) return null;
    const started = Date.now();
    while (running() >= limit) {
      signal?.throwIfAborted();
      if (Date.now() - started >= 60e3) return `已有 ${running()} 条前台命令在运行（上限 ${limit}），等待 60 秒后仍直接启动`;
      await new Promise((resolve) => { const timer = setTimeout(resolve, 250); timer.unref?.(); });
    }
    const waited = Date.now() - started;
    return waited >= 1e3 ? `前台命令已达上限 ${limit}，排队 ${Math.round(waited / 1e3)} 秒后启动` : null;
  }
  /** Never rejects for contention: waits up to 30 s for another session's in-flight mutating command in the same cwd. */
  async softMutationAdmission(input, ownerId, signal) {
    const none = { release: void 0, warning: null };
    if (!SOFT_MUTATION_RE.test(String(input?.command ?? ""))) return none;
    let key, cwd;
    try {
      cwd = typeof input.cwd === "string" && input.cwd.trim() ? resolveCommandCwd(input.cwd).absolute : resolveWorkspacePath(".").absolute;
      key = "workspace-mutation-soft:" + await canonicalResource(cwd);
    } catch {
      return none;
    }
    // The same session's own commands are ordered by that session; only other sessions are waited for.
    if (SOFT_MUTATION_HOLDERS.get(key)?.owner === ownerId) return none;
    const started = Date.now();
    let releasePort;
    try {
      releasePort = await acquireResources([key], { signal, timeoutMs: SOFT_MUTATION_WAIT_MS });
    } catch (error) {
      if (signal?.aborted) throw error;
      if (error?.code !== "RESOURCE_BUSY") return none;
      const holder = SOFT_MUTATION_HOLDERS.get(key);
      return { release: void 0, warning: `同一目录 ${cwd} 中另一会话的 git/npm/pnpm/yarn 修改命令在 ${SOFT_MUTATION_WAIT_MS / 1e3} 秒内仍未结束${holder ? "（本窗口内的其他会话）" : "（可能在其他 OpenCode 窗口）"}；本命令已照常执行，未加锁。请留意 .git/index.lock、lockfile 或 node_modules 并发冲突。` };
    }
    const waited = Date.now() - started;
    SOFT_MUTATION_HOLDERS.set(key, { owner: ownerId, at: Date.now() });
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      if (SOFT_MUTATION_HOLDERS.get(key)?.owner === ownerId) SOFT_MUTATION_HOLDERS.delete(key);
      releasePort?.();
    };
    return { release, warning: waited >= 500 ? `已等待同目录其他会话的修改命令结束约 ${Math.round(waited / 1e3)} 秒后执行。` : null };
  }
  async runLeased(input, ownerId = NATIVE_MANAGED_COMMAND_OWNER_ID, processRelease, attachLease) {
    const command = asString2(input.command).trim();
    if (!command) throw new Error("command must be a non-empty string");
    const background = asBoolean2(input.background, false);
    // dsh-gap-fixes: return status=running before common MCP client deadlines (~60 s) instead of after 120 s; OPENCODE_RUN_COMMAND_DEFAULT_TIMEOUT_MS overrides.
    const timeoutMs = asInteger2(input.timeout_ms, asInteger2(Number(process.env.OPENCODE_RUN_COMMAND_DEFAULT_TIMEOUT_MS), 5e4, 1e3, 12e4), 1e3, 12e4);
    const cwdInfo = typeof input.cwd === "string" && input.cwd.trim() ? resolveCommandCwd(input.cwd) : void 0;
    if (input.execution !== void 0 && input.execution !== "pty") {
      throw new Error("The managed terminal uses the persistent Bash PTY only; direct execution is no longer part of the public terminal contract.");
    }
    const id = createManagedCommandId();
    let execCommand = command;
    let tempScriptPath;
    const { slot, reused, effectiveCwd } = await this.acquireTerminal(ownerId, id, cwdInfo);
    if (slot.closed || slot.busyCommandId !== id) {
      throw new Error("COMMAND_OWNER_RELEASED: command owner session ended before execution started.");
    }
    const displayCwd = cwdInfo?.relative ?? this.displayCwd(effectiveCwd);
    const terminal = slot.terminal;
    let resolveDone;
    const done = new Promise((resolve) => {
      resolveDone = () => { processRelease?.(); resolve(); };
    });
    const state = {
      id,
      ownerId,
      kind: "pty",
      terminal,
      terminalName: terminal.name,
      terminalId: slot.id,
      terminalReused: reused,
      slot,
      command,
      cwd: displayCwd,
      startedAt: Date.now(),
      background,
      status: "running",
      exitCode: null,
      output: new ChunkRing(MAX_CAPTURED_OUTPUT_BYTES),
      outputStartOffset: 0,
      totalOutputBytes: 0,
      ansiPending: "",
      tempScriptPath,
      done,
      resolveDone
    };
    this.states.set(id, state);
    attachLease?.();
    try {
      if (/\r|\n/.test(command) || /[^\x00-\x7F]/.test(command) || command.length > 1024) {
        const shellKind = slot.pty.shellName;
        tempScriptPath = writeTempScript(id, command, shellKind, shellKind === "powershell" ? void 0 : slot.pty.scriptStartMarkerStatement());
        state.tempScriptPath = tempScriptPath;
        execCommand = tempScriptCommand(tempScriptPath, shellKind);
      }
      const captureColumns = asBoolean2(input[CHAT_CAPTURE_INPUT_KEY], false) && !background ? CHAT_CAPTURE_COLUMNS : void 0;
      await slot.pty.run(execCommand, {
        onOutput: (text2) => this.appendOutput(state, text2),
        onExit: (code, pipelineExitCodes, meta2) => {
          state.pipelineExitCodes = pipelineExitCodes;
          this.finishState(state, meta2?.recovered ? null : code, meta2?.recovered ? "failed" : void 0, meta2);
        }
      }, captureColumns);
    } catch (error2) {
      this.finishState(state, null, "failed");
      this.forceCloseSlot(slot);
      throw error2;
    }
    if (!background) {
      const finishedInTime = await Promise.race([
        done.then(() => true),
        new Promise((resolve) => setTimeout(() => resolve(false), timeoutMs))
      ]);
      if (!finishedInTime && state.status === "running") {
        const stuckEvidence = slot.pty.hasContinuationHint || /(^|[\r\n])>> ?/.test(state.output.toString("utf8"));
        if (stuckEvidence) {
          for (let attempt = 0; attempt < 2 && state.status === "running"; attempt++) {
            slot.pty.abortCurrentInput();
            await Promise.race([
              done.then(() => true),
              new Promise((resolve) => setTimeout(() => resolve(false), 2500))
            ]);
          }
          if (state.status === "running") {
            slot.closed = true;
            this.slots.delete(slot.id);
            slot.terminal.dispose();
            await Promise.race([
              done.then(() => true),
              new Promise((resolve) => setTimeout(() => resolve(false), 1500))
            ]);
          }
        }
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!background && state.status !== "running") {
      await this.drainPendingOutput(state);
    }
    const snapshot = this.readOutput(state, 0, 64 * 1024);
    return [
      "=== RUN_COMMAND BEGIN ===",
      `command_id: ${id}`,
      `terminal_id: ${state.terminalId}`,
      `terminal_name: ${JSON.stringify(state.terminalName)}`,
      `execution: ${state.kind}`,
      `shell: ${slot.pty.shellName}`,
      `terminal_reused: ${reused}`,
      `command: ${JSON.stringify(command)}`,
      `status: ${snapshot.status}`,
      `exit_code: ${snapshot.exit_code ?? "null"}`,
      `pipeline_exit_codes: ${snapshot.pipeline_exit_codes === null ? "null" : JSON.stringify(snapshot.pipeline_exit_codes)}`,
      `cwd: ${JSON.stringify(displayCwd)}`,
      `background: ${background}`,
      `script_bridge: ${tempScriptPath ? JSON.stringify(tempScriptPath) : "null"}`,
      `echo_gate: ${slot.pty.lastGateOutcome}`,
      `echo_gate_released_bytes: ${slot.pty.lastGateReleasedBytes}`,
      `shell_prompt_seq: ${slot.pty.lastSeenPromptSequence}`,
      `recovered_by_abort: ${state.recoveredByAbort === true}`,
      `suspected_parser_error: ${state.suspectedParserError === true}`,
      `hint: ${snapshot.status === "running" ? "still running; poll with get_command_output using next_offset" : "none"}`,
      `duration_ms: ${snapshot.duration_ms}`,
      `next_offset: ${snapshot.next_offset}`,
      `total_output_bytes: ${snapshot.total_output_bytes}`,
      `output_lost: ${snapshot.output_lost}`,
      "--- OUTPUT BEGIN ---",
      String(snapshot.output ?? ""),
      "--- OUTPUT END ---",
      "=== RUN_COMMAND END ==="
    ].join("\n");
  }
  /**
   * Execution mode "direct": run the command through a one-shot child process with piped
   * stdio instead of the persistent PTY. The exit code comes straight from the child
   * process, so it is trustworthy by construction: no prompt protocol, no echo gate, no
   * continuation state, no terminal slot consumed, and nothing appears in a terminal view.
   * stdin is closed, so interactive programs cannot be served here. On timeout the child
   * keeps running and the command stays pollable via get_command_output, mirroring PTY
   * semantics.
   */
  async runDirect(command, cwdInfo, timeoutMs) {
    const id = createManagedCommandId();
    let file;
    let args;
    let tempScriptPath;
    let directShell;
    const directEnv = managedProcessEnvironment();
    if (process.platform === "win32") {
      const bundledBash = bundledGitBashExecutable();
      if (!bundledBash) throw new Error("OpenCode direct compatibility path also requires the product-bundled Git Bash runtime.");
      directShell = "bash";
      file = bundledBash;
      args = ["--noprofile", "--norc", "-c", command];
      const gitRoot = import_node_path30.default.resolve(bundledBash, "..", "..");
      directEnv.PATH = withBundledGitPath(gitRoot, directEnv.PATH ?? directEnv.Path ?? "");
    } else {
      file = import_node_fs23.default.existsSync("/bin/bash") ? "/bin/bash" : "/bin/sh";
      args = ["-c", command];
      directShell = file === "/bin/bash" ? "bash" : "sh";
    }
    const cwd = cwdInfo?.absolute ?? resolveWorkspacePath(".").absolute;
    let resolveDone;
    const done = new Promise((resolve) => {
      resolveDone = resolve;
    });
    const state = {
      id,
      ownerId: NATIVE_MANAGED_COMMAND_OWNER_ID,
      kind: "direct",
      terminal: null,
      terminalId: "direct",
      terminalName: "direct",
      terminalReused: false,
      command,
      cwd: cwdInfo?.relative ?? this.displayCwd(cwd),
      startedAt: Date.now(),
      background: false,
      status: "running",
      exitCode: null,
      output: new ChunkRing(MAX_CAPTURED_OUTPUT_BYTES),
      outputStartOffset: 0,
      totalOutputBytes: 0,
      ansiPending: "",
      tempScriptPath,
      done,
      resolveDone
    };
    this.states.set(id, state);
    try {
      const child = child_process.spawn(file, args, {
        cwd,
        env: directEnv,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true
      });
      state.child = child;
      const outDecoder = new import_node_string_decoder.StringDecoder("utf8");
      const errDecoder = new import_node_string_decoder.StringDecoder("utf8");
      child.stdout?.on("data", (chunk) => this.appendOutput(state, outDecoder.write(chunk)));
      child.stderr?.on("data", (chunk) => this.appendOutput(state, errDecoder.write(chunk)));
      child.on("error", (error2) => {
        this.appendOutput(state, `[opencode] failed to start the direct command: ${error2.message}
`);
      });
      child.on("close", (rawCode) => {
        let code = typeof rawCode === "number" ? rawCode : null;
        if (code !== null && code > 2147483647) code -= 4294967296;
        const outRest = outDecoder.end();
        if (outRest) this.appendOutput(state, outRest);
        const errRest = errDecoder.end();
        if (errRest) this.appendOutput(state, errRest);
        this.finishState(state, typeof code === "number" ? code : null);
      });
    } catch (error2) {
      this.finishState(state, null, "failed");
      throw error2;
    }
    await Promise.race([done, new Promise((resolve) => setTimeout(resolve, timeoutMs))]);
    const snapshot = this.readOutput(state, 0, 64 * 1024);
    return [
      "=== RUN_COMMAND BEGIN ===",
      `command_id: ${id}`,
      `terminal_id: ${state.terminalId}`,
      `terminal_name: ${JSON.stringify(state.terminalName)}`,
      `terminal_reused: false`,
      `command: ${JSON.stringify(command)}`,
      `execution: direct`,
      `shell: ${directShell}`,
      `status: ${snapshot.status}`,
      `exit_code: ${snapshot.exit_code ?? "null"}`,
      `cwd: ${JSON.stringify(state.cwd)}`,
      `background: false`,
      `script_bridge: ${tempScriptPath ? JSON.stringify(tempScriptPath) : "null"}`,
      `shell_prompt_seq: null`,
      `recovered_by_abort: ${state.recoveredByAbort === true}`,
      `suspected_parser_error: ${state.suspectedParserError === true}`,
      `hint: ${snapshot.status === "running" ? "still running; poll with get_command_output using next_offset" : "none"}`,
      `duration_ms: ${snapshot.duration_ms}`,
      `next_offset: ${snapshot.next_offset}`,
      `total_output_bytes: ${snapshot.total_output_bytes}`,
      `output_lost: ${snapshot.output_lost}`,
      "--- OUTPUT BEGIN ---",
      String(snapshot.output ?? ""),
      "--- OUTPUT END ---",
      "=== RUN_COMMAND END ==="
    ].join("\n");
  }
  stateForOwner(commandId, ownerId) {
    const id = normalizeManagedCommandId(commandId);
    const state = this.states.get(id);
    // orphan-adopt: a background command whose MCP session ended is kept alive for a grace period
    // (see releaseOwner). Its opaque command_id was only ever returned to the original caller, so
    // presenting it is the capability: the next connection adopts the command and its terminal.
    if (state && state.ownerId !== ownerId && state.orphanedAt && ownerId) {
      state.ownerId = ownerId;
      delete state.orphanedAt;
      if (state.slot && state.slot.busyCommandId === state.id) state.slot.ownerId = ownerId;
    }
    if (!state || state.ownerId !== ownerId) throw managedCommandNotAccessibleError();
    return state;
  }
  cancellationTarget(state) {
    const manager = this;
    return {
      id: state.id,
      ownerId: state.ownerId,
      command: state.command,
      cwd: state.cwd,
      startedAt: state.startedAt,
      get status() {
        return state.status;
      },
      get exitCode() {
        return state.exitCode;
      },
      get cancelRequestedAt() {
        return state.cancelRequestedAt;
      },
      get cancelForced() {
        return state.cancelForced;
      },
      get terminalReusable() {
        return Boolean(state.slot && !state.slot.closed);
      },
      done: state.done,
      requestInterrupt(at) {
        if (state.status !== "running") return false;
        state.cancelRequestedAt = at;
        if (state.slot) return state.slot.pty.interruptActiveCommand();
        try {
          return state.child?.kill("SIGINT") === true;
        } catch {
          return false;
        }
      },
      forceClose() {
        if (state.status !== "running") return;
        state.cancelForced = true;
        if (state.slot) manager.forceCloseSlot(state.slot);
        else {
          try {
            state.child?.kill("SIGKILL");
          } catch {
          }
        }
      }
    };
  }
  async cancel(input, ownerId = NATIVE_MANAGED_COMMAND_OWNER_ID) {
    const state = this.stateForOwner(asString2(input.command_id), ownerId);
    const target = this.cancellationTarget(state);
    const graceMs = asInteger2(input.grace_ms, 1500, 100, 1e4);
    const force = asBoolean2(input.force, false);
    let forceConfirmed = false;
    const preview = this.commandCanceller.preview(target, ownerId);
    if (force && forceCancellationRequiresConfirmation(preview)) {
      this.commandCanceller.reserveForcePrompt(target, ownerId);
      const consequence = preview.riskConsequence ? `

${preview.riskConsequence}` : "";
      const choice = await vscode15.window.showWarningMessage(
        `Force-stop this OpenCode managed terminal?

${preview.command}${consequence}`,
        { modal: true, detail: `High-risk command: ${preview.riskReason ?? "destructive operation"}. Only this owner-scoped terminal will be closed.` },
        "Force Stop"
      );
      if (choice !== "Force Stop") throw new Error("FORCE_CANCEL_DECLINED: local user did not approve force-closing the managed terminal.");
      forceConfirmed = true;
    }
    const result = await this.commandCanceller.cancel(target, { ownerId, graceMs, force, forceConfirmed });
    return [
      "=== CANCEL_COMMAND BEGIN ===",
      `command_id: ${state.id}`,
      `status_before: ${result.statusBefore}`,
      `status: ${result.status}`,
      `exit_code: ${result.exitCode ?? "null"}`,
      `cancel_requested: ${result.cancelRequested}`,
      `already_requested: ${result.alreadyRequested}`,
      `already_finished: ${result.alreadyFinished}`,
      `interrupt_sent: ${result.interruptSent}`,
      `force_required: ${result.forceRequired}`,
      `forced: ${result.forced}`,
      `risk: ${result.riskLevel}`,
      `terminal_reusable: ${result.terminalReusable}`,
      "=== CANCEL_COMMAND END ==="
    ].join("\n");
  }
  releaseOwner(ownerId, preserveCommands = false) {
    if (preserveCommands) {
      this.pruneCommandStates();
      const runningSlots = new Set([...this.states.values()].filter(state => state.ownerId === ownerId && state.status === "running").map(state => state.slot));
      for (const slot of [...this.slots.values()]) if (slot.ownerId === ownerId && !slot.busyCommandId && !runningSlots.has(slot)) this.disposeIdleSlot(slot);
      return;
    }
    this.commandCanceller.releaseOwner(ownerId);
    const orphanTtlEnv = globalThis.process?.env?.OPENCODE_ORPHAN_COMMAND_TTL_MS;
    const orphanTtlRaw = orphanTtlEnv === void 0 || String(orphanTtlEnv).trim() === "" ? NaN : Number(orphanTtlEnv);
    const orphanTtl = Number.isFinite(orphanTtlRaw) && orphanTtlRaw >= 0 ? orphanTtlRaw : 30 * 6e4;
    for (const state of [...this.states.values()]) {
      if (state.ownerId !== ownerId) continue;
      if (orphanTtl > 0 && state.background === true && state.status === "running" && state.slot && ownerId !== NATIVE_MANAGED_COMMAND_OWNER_ID) {
        // Keep long-running background work alive across a reconnect instead of killing it with the session.
        const orphanedAt = Date.now();
        state.orphanedAt = orphanedAt;
        const timer = setTimeout(() => {
          if (state.orphanedAt !== orphanedAt) return;
          if (state.status === "running" && state.slot) this.forceCloseSlot(state.slot);
          this.states.delete(state.id);
        }, orphanTtl);
        timer.unref?.();
        continue;
      }
      if (state.status === "running" && state.slot) this.forceCloseSlot(state.slot);
      this.states.delete(state.id);
    }
    for (const slot of [...this.slots.values()]) if (slot.ownerId === ownerId && !slot.busyCommandId) this.disposeIdleSlot(slot);
  }
  /** dsh-gap-fixes: background-job view — this owner's managed commands, newest first. */
  listCommands(input, ownerId = NATIVE_MANAGED_COMMAND_OWNER_ID) {
    this.pruneCommandStates();
    const only = asString2(input.status, "any");
    const now = Date.now();
    const rows = [...this.states.values()].filter((state) => state.ownerId === ownerId && (only === "any" || state.status === only)).sort((a, b) => b.startedAt - a.startedAt).slice(0, 50);
    const lines = [];
    for (const state of rows) {
      const end = state.endedAt ?? now;
      lines.push(`${state.id} | ${state.status} | exit=${state.exitCode ?? "null"} | background=${state.background === true} | started=${new Date(state.startedAt).toISOString()} | duration_ms=${end - state.startedAt} | bytes=${state.totalOutputBytes ?? 0} | cwd=${JSON.stringify(state.cwd ?? "")} | ${JSON.stringify(summarizeCommand(state.command ?? ""))}`);
    }
    if (!rows.length) lines.push("(no retained commands for this owner; finished commands are pruned by the retention policy)");
    // Same COMMAND_OUTPUT envelope as a normal read so structured parsing keeps working; the list is the output body.
    return ["=== COMMAND_OUTPUT BEGIN ===", "command_id: list", "status: completed", `hint: ${rows.length} commands; columns: command_id | status | exit | background | started | duration_ms | bytes | cwd | command`, "--- OUTPUT BEGIN ---", lines.join("\n"), "--- OUTPUT END ---", "=== COMMAND_OUTPUT END ==="].join("\n");
  }
  getOutput(input, ownerId = NATIVE_MANAGED_COMMAND_OWNER_ID) {
    if (input.list === true || (input.command_id === void 0 || input.command_id === "")) return this.listCommands(input, ownerId);
    const state = this.stateForOwner(asString2(input.command_id), ownerId);
    const id = state.id;
    const offset = asInteger2(input.offset, 0, 0, Number.MAX_SAFE_INTEGER);
    const maxBytes = asInteger2(input.max_bytes, DEFAULT_OUTPUT_BYTES, 1, MAX_OUTPUT_BYTES2);
    const snapshot = this.readOutput(state, offset, maxBytes);
    return [
      "=== COMMAND_OUTPUT BEGIN ===",
      `command_id: ${id}`,
      `execution: ${String(snapshot.execution)}`,
      `terminal_id: ${snapshot.terminal_id}`,
      `terminal_name: ${JSON.stringify(snapshot.terminal_name)}`,
      `status: ${snapshot.status}`,
      `exit_code: ${snapshot.exit_code ?? "null"}`,
      `pipeline_exit_codes: ${snapshot.pipeline_exit_codes === null ? "null" : JSON.stringify(snapshot.pipeline_exit_codes)}`,
      `recovered_by_abort: ${state.recoveredByAbort === true}`,
      `suspected_parser_error: ${state.suspectedParserError === true}`,
      `duration_ms: ${snapshot.duration_ms}`,
      `output_start_offset: ${snapshot.output_start_offset}`,
      `next_offset: ${snapshot.next_offset}`,
      `total_output_bytes: ${snapshot.total_output_bytes}`,
      `output_lost: ${snapshot.output_lost}`,
      `has_more: ${snapshot.has_more}`,
      "--- OUTPUT BEGIN ---",
      String(snapshot.output ?? ""),
      "--- OUTPUT END ---",
      "=== COMMAND_OUTPUT END ==="
    ].join("\n");
  }
  sendInput(input, ownerId = NATIVE_MANAGED_COMMAND_OWNER_ID) {
    const state = this.stateForOwner(asString2(input.command_id), ownerId);
    const id = state.id;
    if (state.status !== "running") throw new Error(`Command ${id} is not running (status=${state.status}).`);
    if (state.kind === "direct") {
      throw new Error(`Command ${id} runs in direct mode without a terminal; interactive input requires the default PTY execution mode.`);
    }
    const text2 = asString2(input.input);
    const appendNewline = asBoolean2(input.append_newline, true);
    if (!state.slot || state.slot.closed || state.slot.busyCommandId !== id) {
      throw new Error(`COMMAND_NOT_RUNNING: command ${id} no longer owns an open terminal.`);
    }
    state.slot.pty.sendInput(text2, appendNewline);
    return [
      "=== SEND_COMMAND_INPUT BEGIN ===",
      `command_id: ${id}`,
      `terminal_id: ${state.terminalId}`,
      `status: ${state.status}`,
      `bytes_sent: ${Buffer.byteLength(text2, "utf8")}`,
      `append_newline: ${appendNewline}`,
      "=== SEND_COMMAND_INPUT END ==="
    ].join("\n");
  }
  revealTerminal(terminalId) {
    const slot = this.slots.get(terminalId);
    if (!slot || slot.closed) return false;
    slot.terminal.show(false);
    return true;
  }
};

async function listDirectory(input, capture, allowedRoots) {
  // Bridge injects exactly the file-tool boundary AFTER role/rules/task guards.
  // Native IDE callers retain workspace scope. Never accept roots from tool arguments.
  const roots = allowedRoots ?? (vscode15.workspace.workspaceFolders ?? []).map(folder => folder.uri.fsPath);
  const requested = asString2(input.path, ".");
  const safe = await resolveSafePath(requested, roots);
  const openedRoot = (vscode15.workspace.workspaceFolders ?? []).map(folder => folder.uri.fsPath).find(root => isInside3(root, safe.realPath));
  // External device/worktree paths must stay absolute, not ambiguous drive-relative names.
  const displayPath = (openedRoot ? import_node_path30.default.relative(openedRoot, safe.realPath) || "." : safe.realPath).replace(/\\/g, "/");
  const scope = { absolute: safe.realPath, relative: displayPath, uri: vscode15.Uri.file(safe.realPath) };
  const depth = asInteger2(input.depth, 1, 1, 2);
  const includeHidden = asBoolean2(input.include_hidden, false);
  const noIgnore = asBoolean2(input.no_ignore, false);
  const maxEntries = asInteger2(input.max_entries, 200, 1, 500);
  const entries = [];
  let truncated = false;
  const visit = async (uri, relative, level) => {
    if (truncated) return;
    // Revalidate every traversed directory; do not follow symlink/junction entries.
    const checked = await resolveSafePath(uri.fsPath, roots);
    const children = await vscode15.workspace.fs.readDirectory(vscode15.Uri.file(checked.realPath));
    children.sort((a, b) => {
      const ad = a[1] === vscode15.FileType.Directory ? 0 : 1;
      const bd = b[1] === vscode15.FileType.Directory ? 0 : 1;
      return ad - bd || a[0].localeCompare(b[0]);
    });
    for (const [name, type] of children) {
      if (!includeHidden && name.startsWith(".")) continue;
      if (!noIgnore && COMMON_EXCLUDES.has(name)) continue;
      const childRelative = relative === "." ? name : `${relative.replace(/\/$/, "")}/${name}`;
      entries.push({
        type: type & vscode15.FileType.SymbolicLink ? "symlink" : type === vscode15.FileType.Directory ? "dir" : type === vscode15.FileType.File ? "file" : "unknown",
        path: childRelative
      });
      if (entries.length >= maxEntries) {
        truncated = true;
        break;
      }
      if (level < depth && type === vscode15.FileType.Directory) {
        await visit(vscode15.Uri.joinPath(uri, name), childRelative, level + 1);
        if (truncated) break;
      }
    }
  };
  await visit(scope.uri, scope.relative, 1);
  capture?.(ideDirectoryStructuredContent(scope.relative, entries, truncated));
  return [
    "=== LIST_DIRECTORY BEGIN ===",
    `path: ${JSON.stringify(scope.relative)}`,
    `depth: ${depth}`,
    `include_hidden: ${includeHidden}`,
    `no_ignore: ${noIgnore}`,
    `returned_entries: ${entries.length}`,
    `truncated: ${truncated}`,
    "--- ENTRIES ---",
    ...entries.map((entry) => `${entry.type === "dir" ? "[DIR]" : entry.type === "file" ? "[FILE]" : entry.type === "symlink" ? "[LINK]" : "[OTHER]"} ${entry.path}`),
    "=== LIST_DIRECTORY END ==="
  ].join("\n");
}

function severityName(severity) {
  switch (severity) {
    case vscode15.DiagnosticSeverity.Error:
      return "error";
    case vscode15.DiagnosticSeverity.Warning:
      return "warning";
    case vscode15.DiagnosticSeverity.Information:
      return "information";
    default:
      return "hint";
  }
}

function diagnosticCode(code) {
  if (code === void 0) return void 0;
  if (typeof code === "string" || typeof code === "number") return code;
  return code.value;
}

function getDiagnostics(input) {
  const root = workspaceRoot2();
  const scope = input.path === void 0 ? void 0 : resolveWorkspacePath(asString2(input.path));
  const severities = Array.isArray(input.severity) ? new Set(input.severity.filter((value) => typeof value === "string")) : void 0;
  const maxResults = asInteger2(input.max_results, 100, 1, 500);
  const rows = [];
  let totalMatching = 0;
  for (const [uri, diagnostics] of vscode15.languages.getDiagnostics()) {
    if (uri.scheme !== "file" || !isInside3(root, uri.fsPath)) continue;
    if (scope) {
      const scopePath = import_node_path30.default.resolve(scope.absolute);
      const candidate = import_node_path30.default.resolve(uri.fsPath);
      if (!(candidate === scopePath || candidate.startsWith(`${scopePath}${import_node_path30.default.sep}`))) continue;
    }
    for (const diagnostic of diagnostics) {
      const severity = severityName(diagnostic.severity);
      if (severities && !severities.has(severity)) continue;
      totalMatching += 1;
      if (rows.length >= maxResults) continue;
      rows.push({
        path: import_node_path30.default.relative(root, uri.fsPath).replace(/\\/g, "/"),
        line: diagnostic.range.start.line + 1,
        column: diagnostic.range.start.character + 1,
        end_line: diagnostic.range.end.line + 1,
        end_column: diagnostic.range.end.character + 1,
        severity,
        source: diagnostic.source ?? null,
        code: diagnosticCode(diagnostic.code) ?? null,
        message: diagnostic.message
      });
    }
  }
  rows.sort((a, b) => {
    const order = { error: 0, warning: 1, information: 2, hint: 3 };
    return (order[String(a.severity)] ?? 9) - (order[String(b.severity)] ?? 9) || String(a.path).localeCompare(String(b.path)) || Number(a.line) - Number(b.line) || Number(a.column) - Number(b.column);
  });
  const returned = rows.slice(0, maxResults);
  return [
    "=== GET_DIAGNOSTICS BEGIN ===",
    `scope: ${JSON.stringify(scope?.relative ?? ".")}`,
    `returned: ${returned.length}`,
    `total_matching: ${totalMatching}`,
    `truncated: ${totalMatching > returned.length}`,
    "--- DIAGNOSTICS ---",
    ...returned.map((row, index) => [
      `--- DIAGNOSTIC ${index + 1} ---`,
      `${row.path}:${row.line}:${row.column}`,
      `severity: ${row.severity}`,
      `source: ${JSON.stringify(row.source)}`,
      `code: ${JSON.stringify(row.code)}`,
      String(row.message)
    ].join("\n")),
    "=== GET_DIAGNOSTICS END ==="
  ].join("\n");
}

var IdeToolBroker = class {
  terminalManager = new TerminalCommandManager();
  registrations = [];
  async runTerminalSmokeTest() {
    const firstCommand = `export OPENCODE_PERSISTENT_SMOKE=yes; printf 'opencode-terminal-smoke-1\\n'; printf 'bash=%s\\n' "$BASH_VERSION"; printf 'git=%s\\n' "$(command -v git || true)"`;
    const secondCommand = `printf 'opencode-terminal-smoke-2:%s\\n' "$OPENCODE_PERSISTENT_SMOKE"`;
    const first = await this.terminalManager.run({
      command: firstCommand,
      cwd: ".",
      background: false,
      timeout_ms: 15e3
    });
    const second = await this.terminalManager.run({
      command: secondCommand,
      background: false,
      timeout_ms: 15e3
    });
    return `${first}
--- SECOND COMMAND ---
${second}`;
  }
  async runLspSmokeTest() {
    return invokeLspTool({ operation: "workspace_symbols", query: "RuntimeClient", max_results: 20 });
  }
  revealTerminal(terminalId) {
    return this.terminalManager.revealTerminal(terminalId);
  }
  releaseCommandOwner(ownerId) {
    this.terminalManager.releaseOwner(ownerId, true);
  }
  async executeTool(name, input, commandOwnerId = NATIVE_MANAGED_COMMAND_OWNER_ID, cancellationToken) {
    switch (name) {
      case "list_directory":
        return toolResult(await listDirectory(input));
      case "run_command": {
        const controller=new AbortController();if(cancellationToken?.isCancellationRequested)controller.abort();
        const subscription=cancellationToken?.onCancellationRequested(()=>controller.abort());
        try{return this.terminalResult(name,input,await this.terminalManager.run(input,commandOwnerId,controller.signal));}finally{subscription?.dispose();}
      }
      case "get_command_output":
        return this.terminalResult(name, input, this.terminalManager.getOutput(input, commandOwnerId));
      case "cancel_command":
        return this.terminalResult(name, input, await this.terminalManager.cancel(input, commandOwnerId));
      case "send_command_input":
        return this.terminalResult(name, input, this.terminalManager.sendInput(input, commandOwnerId));
      case "wait":
        return toolResult(await this.waitImpl(input));
      case "get_diagnostics":
        return toolResult(getDiagnostics(input));
      case "lsp":
        return toolResult(await invokeLspTool(input));
      default:
        throw new Error(`Unsupported IDE tool: ${name}`);
    }
  }
  /**
   * Blocks for the requested duration. Lets the model wait out a background
   * command or watcher before polling with get_command_output, instead of
   * hammering the terminal in a tight loop.
   */
  async waitImpl(input) {
    const ms = asInteger2(input.ms, 1e4, 100, 12e4);
    await new Promise((resolve) => setTimeout(resolve, ms));
    return `Waited ${ms} ms.`;
  }
  /**
   * Wraps a terminal tool result in the structured result type so the Chat UI shows a compact
   * step summary with success/failure and exit code instead of dumping the raw terminal
   * transcript into the response stream. The full transcript still reaches the model as the
   * text content and stays available in the step's expandable details.
   */
  terminalResult(name, input, text2) {
    const result = new vscode15.ExtendedLanguageModelToolResult([new vscode15.LanguageModelTextPart(text2)]);
    const exitCode = parseExitCode(text2);
    const command = typeof input.command === "string" ? input.command.trim() : "";
    const summary = summarizeCommand(command || (typeof input.input === "string" ? input.input : ""));
    switch (name) {
      case "run_command":
        result.toolResultMessage = exitCode === void 0 || exitCode === null ? `Ran ${summary}` : exitCode === 0 ? `Ran ${summary} \xB7 exit 0` : `Command failed: ${summary} \xB7 exit ${exitCode}`;
        break;
      case "get_command_output":
        result.toolResultMessage = exitCode === void 0 || exitCode === null || exitCode === 0 ? "Read command output" : `Command output \xB7 exit ${exitCode}`;
        break;
      case "send_command_input":
        result.toolResultMessage = typeof input.command_id === "string" && input.command_id ? `Sent command input \xB7 ${input.command_id}` : "Sent command input";
        break;
      case "cancel_command":
        result.toolResultMessage = /^status: cancelled$/m.test(text2) ? "Command cancelled" : /^force_required: true$/m.test(text2) ? "Command still running \xB7 force stop available" : "Cancellation requested";
        break;
    }
    return result;
  }
  constructor() {
    for (const definition of IDE_TOOL_DEFINITIONS) {
      this.registrations.push(vscode15.lm.registerTool(definition.vscodeToolName, {
        prepareInvocation: async (options) => {
          if (definition.name !== "run_command") {
            const title = definition.name === "get_command_output" ? "Read command output" : definition.name === "send_command_input" ? "Send command input" : definition.name === "wait" ? "Wait" : definition.name;
            return { invocationMessage: title };
          }
          const input = asRecord4(options.input);
          const command = asString2(input.command).trim();
          const cwd = normalizeRelativePath(asString2(input.cwd, "."));
          const background = asBoolean2(input.background, false);
          const markdown = new vscode15.MarkdownString();
          markdown.appendMarkdown(`Run this command in the integrated terminal?

`);
          markdown.appendCodeblock(command || "(empty command)", "shell");
          markdown.appendMarkdown(`
Working directory: \`${cwd}\`

Background: \`${background}\``);
          return {
            // Bounded title keeps the collapsed step compact; the full command lives in the
            // confirmation message and the expandable step details.
            invocationMessage: `Run ${summarizeCommand(command)}`,
            confirmationMessages: { title: "Run terminal command", message: markdown }
          };
        },
        invoke: async (options, token) => this.executeTool(definition.name, asRecord4(options.input), undefined, token)
      }));
    }
  }
  async invoke(name, args, context, allowRegisteredTool = false) {
    const definition = getIdeToolDefinition(name);
    if (!definition && !allowRegisteredTool) return { text: `Unknown IDE tool: ${name}`, isError: true };
    try {
      const result = await vscode15.lm.invokeTool(definition?.vscodeToolName ?? name, {
        input: definition?.name === "run_command" ? { ...args, [CHAT_CAPTURE_INPUT_KEY]: true } : args,
        toolInvocationToken: context.toolInvocationToken
      }, context.cancellationToken);
      return { text: resultText(result), isError: false };
    } catch (error2) {
      const message2 = error2 instanceof Error ? error2.message : String(error2);
      const mcpHint = !definition && (name.startsWith("mcp__") || /could not be started|MCP server/i.test(message2)) ? " The MCP server may be disconnected; restart it from the MCP servers view and send a new message." : "";
      return { text: `${definition ? "IDE" : "Registered"} tool ${name} failed: ${message2}${mcpHint}`, isError: true };
    }
  }
  /**
   * Executes the same implementation registered with vscode.lm, but without a native Chat
   * invocation token. The HTTP Bridge uses this path because the remote MCP client owns its
   * confirmation UX; tool semantics, terminal state, diagnostics and LSP behavior remain shared.
   */
  async invokeDirect(name, args, cancellationToken, commandOwnerId = NATIVE_MANAGED_COMMAND_OWNER_ID, fileToolRoots) {
    if (!getIdeToolDefinition(name)) return { text: `Unknown IDE tool: ${name}`, isError: true };
    if (cancellationToken?.isCancellationRequested) return { text: `IDE tool ${name} canceled.`, isError: true };
    try {
      if (name === "list_directory") {
        const definition = getIdeToolDefinition(name);
        validateToolInput(definition.name, definition.inputSchema, args);
        let structuredContent;
        const text2 = await listDirectory(args, (value) => {
          structuredContent = value;
        }, fileToolRoots);
        if (cancellationToken?.isCancellationRequested) return { text: `IDE tool ${name} canceled.`, isError: true };
        return { text: text2, isError: false, structuredContent };
      }
      const result = await this.executeTool(name, args, commandOwnerId, cancellationToken);
      if (cancellationToken?.isCancellationRequested) return { text: `IDE tool ${name} canceled.`, isError: true };
      return { text: resultText(result), isError: false };
    } catch (error2) {
      const message2 = error2 instanceof Error ? error2.message : String(error2);
      const admissionError = error2?.code === 'PROCESS_BUDGET_BUSY';
      return { text: `IDE tool ${name} failed: ${message2}`, isError: true,
        ...(admissionError ? { structuredContent: { error: { code: error2.code, message: message2 },
          phase: error2.phase, command_started: false, ...(error2.wait_ms === undefined ? {} : { wait_ms: error2.wait_ms }) } } : {}) };
    }
  }
  dispose() {
    this.terminalManager.dispose();
    for (const registration of this.registrations) registration.dispose();
  }
};
export { getNodePty, managedShellSpec, managedProcessEnvironment, bundledModulesDir, bundledGitBashExecutable, withBundledGitPath, bashPromptCommand, asRecord4, asString2, asBoolean2, asInteger2, stripAnsi, ansiEscapeLength, promptTextLength, normalizeRelativePath, isInside3, workspaceRoot2, resolveWorkspacePath, resolveCommandCwd, toolResult, summarizeCommand, writeTempScript, encodingPreludeInsertIndex, tempScriptCommand, parseExitCode, resultText, listDirectory, severityName, diagnosticCode, getDiagnostics, child_process, import_node_fs23, import_node_os9, import_node_path30, import_node_string_decoder, vscode15, COMMON_EXCLUDES, MAX_CAPTURED_OUTPUT_BYTES, DEFAULT_OUTPUT_BYTES, MAX_OUTPUT_BYTES2, PTY_EXIT_DATA_FLUSH_MS, PTY_OUTPUT_DRAIN_QUIET_MS, PTY_OUTPUT_DRAIN_MAX_MS, COMMAND_ECHO_TIMEOUT_MS, MAX_ECHO_HUNT_BYTES, MAX_GATE_HELD_CHARS, MANAGED_TERMINAL_NAME, CHAT_CAPTURE_COLUMNS, CHAT_CAPTURE_INPUT_KEY, nodePtyModule, cachedBundledModulesDir, cachedBundledGitBash, ManagedCommandPseudoterminal, PARTIAL_ANSI_SUFFIX_RE, TerminalCommandManager, IdeToolBroker };
