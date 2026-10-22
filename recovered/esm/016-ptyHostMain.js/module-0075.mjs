// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/node/windowsShellHelper.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0021.mjs";
import { isWindows, platform } from "./module-0014.mjs";
import { timeout } from "./module-0028.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { debounce } from "./module-0029.mjs";


// src/vs/platform/terminal/node/windowsShellHelper.ts
var SHELL_EXECUTABLES = [
  "cmd.exe",
  "powershell.exe",
  "pwsh.exe",
  "bash.exe",
  "git-cmd.exe",
  "wsl.exe",
  "ubuntu.exe",
  "ubuntu1804.exe",
  "kali.exe",
  "debian.exe",
  "opensuse-42.exe",
  "sles-12.exe",
  "julia.exe",
  "nu.exe",
  "node.exe",
  "xonsh.exe"
];

var SHELL_EXECUTABLE_REGEXES = [
  /^python(\d(\.\d{0,2})?)?\.exe$/
];

var NODE_AGENT_CLI_PATTERNS = [
  { regex: /[\\/]claude-code[\\/]/i, executable: "claude.exe" },
  { regex: /[\\/]codex[\\/]/i, executable: "codex.exe" },
  { regex: /[\\/]command-code[\\/]/i, executable: "commandcode.exe" },
  { regex: /[\\/]copilot[\\/]/i, executable: "copilot.exe" },
  { regex: /[\\/]gemini-cli[\\/]/i, executable: "gemini.exe" }
];

var windowsProcessTree;

var WindowsShellHelper = class extends Disposable {
  constructor(_rootProcessId) {
    super();
    this._rootProcessId = _rootProcessId;
    this._shellTitle = "";
    this._onShellNameChanged = this._register(new Emitter());
    this._onShellTypeChanged = this._register(new Emitter());
    if (!isWindows) {
      throw new Error(`WindowsShellHelper cannot be instantiated on ${platform}`);
    }
    this._startMonitoringShell();
  }
  get shellType() {
    return this._shellType;
  }
  get shellTitle() {
    return this._shellTitle;
  }
  get onShellNameChanged() {
    return this._onShellNameChanged.event;
  }
  get onShellTypeChanged() {
    return this._onShellTypeChanged.event;
  }
  async _startMonitoringShell() {
    if (this._store.isDisposed) {
      return;
    }
    this.checkShell();
  }
  async checkShell() {
    if (isWindows) {
      await timeout(300);
      this.getShellName().then((title) => {
        const type = this.getShellType(title);
        if (type !== this._shellType) {
          this._onShellTypeChanged.fire(type);
          this._onShellNameChanged.fire(title);
          this._shellType = type;
          this._shellTitle = title;
        }
      });
    }
  }
  traverseTree(tree) {
    if (!tree) {
      return "";
    }
    if (tree.name === "node.exe" && tree.commandLine) {
      for (const { regex, executable } of NODE_AGENT_CLI_PATTERNS) {
        if (regex.test(tree.commandLine)) {
          return executable;
        }
      }
    }
    if (SHELL_EXECUTABLES.indexOf(tree.name) === -1) {
      return tree.name;
    }
    for (const regex of SHELL_EXECUTABLE_REGEXES) {
      if (tree.name.match(regex)) {
        return tree.name;
      }
    }
    if (!tree.children || tree.children.length === 0) {
      return tree.name;
    }
    let favouriteChild = 0;
    for (; favouriteChild < tree.children.length; favouriteChild++) {
      const child = tree.children[favouriteChild];
      if (!child.children || child.children.length === 0) {
        break;
      }
      if (child.children[0].name !== "conhost.exe") {
        break;
      }
    }
    if (favouriteChild >= tree.children.length) {
      return tree.name;
    }
    return this.traverseTree(tree.children[favouriteChild]);
  }
  /**
   * Returns the innermost shell executable running in the terminal
   */
  async getShellName() {
    if (this._store.isDisposed) {
      return Promise.resolve("");
    }
    if (this._currentRequest) {
      return this._currentRequest;
    }
    if (!windowsProcessTree) {
      windowsProcessTree = await import("@vscode/windows-process-tree");
    }
    this._currentRequest = new Promise((resolve3) => {
      windowsProcessTree.getProcessTree(this._rootProcessId, (tree) => {
        const name = this.traverseTree(tree);
        this._currentRequest = void 0;
        resolve3(name);
      }, windowsProcessTree.ProcessDataFlag.CommandLine);
    });
    return this._currentRequest;
  }
  getShellType(executable) {
    switch (executable.toLowerCase()) {
      case "cmd.exe":
        return "cmd" /* CommandPrompt */;
      case "powershell.exe":
      case "pwsh.exe":
        return "pwsh" /* PowerShell */;
      case "bash.exe":
      case "git-cmd.exe":
        return "gitbash" /* GitBash */;
      case "julia.exe":
        return "julia" /* Julia */;
      case "node.exe":
        return "node" /* Node */;
      case "nu.exe":
        return "nu" /* NuShell */;
      case "xonsh.exe":
        return "xonsh" /* Xonsh */;
      case "claude.exe":
        return "claude" /* Claude */;
      case "codex.exe":
        return "codex" /* Codex */;
      case "commandcode.exe":
        return "commandcode" /* CommandCode */;
      case "copilot.exe":
        return "copilot" /* Copilot */;
      case "gemini.exe":
        return "gemini" /* Gemini */;
      case "wsl.exe":
      case "ubuntu.exe":
      case "ubuntu1804.exe":
      case "kali.exe":
      case "debian.exe":
      case "opensuse-42.exe":
      case "sles-12.exe":
        return "wsl" /* Wsl */;
      default:
        if (executable.match(/python(\d(\.\d{0,2})?)?\.exe/)) {
          return "python" /* Python */;
        }
        return void 0;
    }
  }
};

__decorateClass([
  debounce(500)
], WindowsShellHelper.prototype, "checkShell", 1);
export { SHELL_EXECUTABLES, SHELL_EXECUTABLE_REGEXES, NODE_AGENT_CLI_PATTERNS, windowsProcessTree, WindowsShellHelper };
