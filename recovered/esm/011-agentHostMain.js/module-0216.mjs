// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/sandbox/common/terminalSandboxMxcRuntime.ts
import { createDecorator } from "./module-0044.mjs";
import { win32 } from "./module-0018.mjs";


// src/vs/platform/sandbox/common/terminalSandboxMxcRuntime.ts
var IWindowsMxcTerminalSandboxRuntime = createDecorator("windowsMxcTerminalSandboxRuntime");

var WindowsMxcTerminalSandboxRuntime = class {
  constructor() {
    this._configVersion = "0.6.0-alpha";
  }
  getExecutablePath(appRoot, nativeModulesDir, arch2) {
    const binArch = arch2 === "arm64" ? "arm64" : "x64";
    return win32.join(appRoot, nativeModulesDir, "@microsoft", "mxc-sdk", "bin", binArch, "wxc-exec.exe");
  }
  getRuntimeReadPaths(appRoot, executablePath) {
    const paths = [];
    if (appRoot) {
      paths.push(appRoot);
    }
    if (executablePath) {
      paths.push(executablePath, win32.dirname(executablePath));
    }
    return [...new Set(paths)];
  }
  async createConfig(options, buildSandboxPayload) {
    const tempDirPath = this.toWindowsPath(options.tempDir);
    const shell = options.shell ? this._quoteWindowsCommandLineArgument(options.shell) : "pwsh.exe";
    const commandLine = `${shell} -NoProfile -Command ${this._quoteWindowsCommandLineArgument(options.command)}`;
    const cwd3 = options.cwd ? this.toWindowsPath(options.cwd) : tempDirPath;
    const policy = {
      version: options.schemaVersion ?? this._configVersion,
      timeoutMs: 0,
      filesystem: {
        readwritePaths: options.allowWritePaths.map((path) => this._normalizeWindowsPath(path)),
        readonlyPaths: [tempDirPath, ...options.shell && win32.isAbsolute(options.shell) ? [win32.dirname(options.shell)] : [], ...options.allowReadPaths].map((path) => this._normalizeWindowsPath(path)),
        deniedPaths: options.denyReadPaths.map((path) => this._normalizeWindowsPath(path))
      },
      network: this._createNetworkPolicy(options.allowNetwork),
      ui: {
        allowWindows: true,
        clipboard: "none",
        allowInputInjection: false
      }
    };
    const config = await buildSandboxPayload(commandLine, policy, cwd3);
    if (!config?.process) {
      throw new Error("Unable to build Windows MXC sandbox payload");
    }
    config.process.env = [...options.env];
    return config;
  }
  wrapCommand(executablePath, configPath) {
    return `& ${this._quotePowerShellArgument(executablePath)} ${this._quotePowerShellArgument(configPath)}`;
  }
  wrapUnsandboxedCommand(command) {
    return command;
  }
  toWindowsPath(uri) {
    let value;
    if (uri.authority && uri.path.length > 1 && uri.scheme === "file") {
      value = `\\\\${uri.authority}${uri.path}`;
    } else if (/^\/[a-zA-Z]:/.test(uri.path)) {
      value = uri.path.slice(1);
    } else {
      value = uri.fsPath;
    }
    return this._normalizeWindowsPath(value);
  }
  _normalizeWindowsPath(path) {
    return path.replace(/\//g, "\\");
  }
  _createNetworkPolicy(allowNetwork) {
    return { allowOutbound: allowNetwork };
  }
  _quotePowerShellArgument(value) {
    return `'${value.replace(/'/g, `''`)}'`;
  }
  _quoteWindowsCommandLineArgument(value) {
    return `"${value.replace(/(\\*)"/g, '$1$1\\"').replace(/\\+$/g, "$&$&")}"`;
  }
};
export { IWindowsMxcTerminalSandboxRuntime, WindowsMxcTerminalSandboxRuntime };
