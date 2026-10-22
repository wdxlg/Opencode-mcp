// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/sandbox/common/terminalSandboxMxcRuntime.ts
import { createDecorator } from "./module-0077.mjs";
import { win32 } from "./module-0026.mjs";


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
  async createConfig(options3, buildSandboxPayload) {
    const tempDirPath = this.toWindowsPath(options3.tempDir);
    const shell = options3.shell ? this._quoteWindowsCommandLineArgument(options3.shell) : "pwsh.exe";
    const commandLine = `${shell} -NoProfile -Command ${this._quoteWindowsCommandLineArgument(options3.command)}`;
    const cwd2 = options3.cwd ? this.toWindowsPath(options3.cwd) : tempDirPath;
    const policy = {
      version: options3.schemaVersion ?? this._configVersion,
      timeoutMs: 0,
      filesystem: {
        readwritePaths: options3.allowWritePaths.map((path) => this._normalizeWindowsPath(path)),
        readonlyPaths: [tempDirPath, ...options3.shell && win32.isAbsolute(options3.shell) ? [win32.dirname(options3.shell)] : [], ...options3.allowReadPaths].map((path) => this._normalizeWindowsPath(path)),
        deniedPaths: options3.denyReadPaths.map((path) => this._normalizeWindowsPath(path))
      },
      network: this._createNetworkPolicy(options3.allowNetwork),
      ui: {
        allowWindows: true,
        clipboard: "none",
        allowInputInjection: false
      }
    };
    const config = await buildSandboxPayload(commandLine, policy, cwd2);
    if (!config?.process) {
      throw new Error("Unable to build Windows MXC sandbox payload");
    }
    config.process.env = [...options3.env];
    return config;
  }
  wrapCommand(executablePath, configPath) {
    return `& ${this._quotePowerShellArgument(executablePath)} ${this._quotePowerShellArgument(configPath)}`;
  }
  wrapUnsandboxedCommand(command4) {
    return command4;
  }
  toWindowsPath(uri4) {
    let value2;
    if (uri4.authority && uri4.path.length > 1 && uri4.scheme === "file") {
      value2 = `\\\\${uri4.authority}${uri4.path}`;
    } else if (/^\/[a-zA-Z]:/.test(uri4.path)) {
      value2 = uri4.path.slice(1);
    } else {
      value2 = uri4.fsPath;
    }
    return this._normalizeWindowsPath(value2);
  }
  _normalizeWindowsPath(path) {
    return path.replace(/\//g, "\\");
  }
  _createNetworkPolicy(allowNetwork) {
    return { allowOutbound: allowNetwork };
  }
  _quotePowerShellArgument(value2) {
    return `'${value2.replace(/'/g, `''`)}'`;
  }
  _quoteWindowsCommandLineArgument(value2) {
    return `"${value2.replace(/(\\*)"/g, '$1$1\\"').replace(/\\+$/g, "$&$&")}"`;
  }
};
export { IWindowsMxcTerminalSandboxRuntime, WindowsMxcTerminalSandboxRuntime };
