// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/externalTerminal/node/externalTerminalService.ts
import { localize } from "./module-0013.mjs";
import { DEFAULT_TERMINAL_OSX } from "./module-0338.mjs";
import { findExecutable, getWindowsShell } from "./module-0334.mjs";
import { basename } from "./module-0019.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0035.mjs";
import { FileAccess } from "./module-0026.mjs";
import { isLinux } from "./module-0014.mjs";
import { Promises2 } from "./module-0033.mjs";
import { sanitizeProcessEnvironment } from "./module-0335.mjs";


// src/vs/platform/externalTerminal/node/externalTerminalService.ts
import * as cp2 from "child_process";


// src/vs/platform/externalTerminal/node/externalTerminalService.ts
var TERMINAL_TITLE = localize(3005, null);

var ExternalTerminalService = class {
  async getDefaultTerminalForPlatforms() {
    return {
      windows: WindowsExternalTerminalService.getDefaultTerminalWindows(),
      linux: await LinuxExternalTerminalService.getDefaultTerminalLinuxReady(),
      osx: DEFAULT_TERMINAL_OSX
    };
  }
};

var _WindowsExternalTerminalService = class _WindowsExternalTerminalService extends ExternalTerminalService {
  static {
    this.CMD = "cmd.exe";
  }
  openTerminal(configuration, cwd2) {
    return this.spawnTerminal(cp2, configuration, getWindowsShell(), cwd2);
  }
  spawnTerminal(spawner, configuration, command, cwd2) {
    const exec2 = configuration.windowsExec || _WindowsExternalTerminalService.getDefaultTerminalWindows();
    if (cwd2 && cwd2[1] === ":") {
      cwd2 = cwd2[0].toUpperCase() + cwd2.substr(1);
    }
    const basename3 = basename(exec2, ".exe").toLowerCase();
    if (basename3 === "cmder") {
      spawner.spawn(exec2, cwd2 ? [cwd2] : void 0);
      return Promise.resolve(void 0);
    }
    const cmdArgs = ["/c", "start", "/wait"];
    if (exec2.indexOf(" ") >= 0) {
      cmdArgs.push(exec2);
    }
    cmdArgs.push(exec2);
    if (basename3 === "wt") {
      cmdArgs.push("-d .");
    }
    return new Promise((c, e) => {
      const env2 = getSanitizedEnvironment(process);
      const child = spawner.spawn(command, cmdArgs, { cwd: cwd2, env: env2, detached: true });
      child.on("error", e);
      child.on("exit", () => c());
    });
  }
  async runInTerminal(title, dir, args2, envVars, settings) {
    const exec2 = settings.windowsExec || _WindowsExternalTerminalService.getDefaultTerminalWindows();
    const wt = await _WindowsExternalTerminalService.getWtExePath();
    return new Promise((resolve2, reject) => {
      const title2 = `"${dir} - ${TERMINAL_TITLE}"`;
      const command = `"${args2.join('" "')}" & pause`;
      const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
      Object.keys(env2).filter((v) => env2[v] === null).forEach((key) => delete env2[key]);
      const options2 = {
        cwd: dir,
        env: env2,
        windowsVerbatimArguments: true
      };
      let spawnExec;
      let cmdArgs;
      if (basename(exec2, ".exe") === "wt") {
        spawnExec = exec2;
        cmdArgs = ["-d", ".", _WindowsExternalTerminalService.CMD, "/c", command];
      } else if (wt) {
        spawnExec = wt;
        cmdArgs = ["-d", ".", exec2, "/c", command];
      } else {
        spawnExec = _WindowsExternalTerminalService.CMD;
        cmdArgs = ["/c", "start", title2, "/wait", exec2, "/c", `"${command}"`];
      }
      const cmd = cp2.spawn(spawnExec, cmdArgs, options2);
      cmd.on("error", (err) => {
        reject(improveError(err));
      });
      resolve2(void 0);
    });
  }
  static getDefaultTerminalWindows() {
    if (!_WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS) {
      const isWoW64 = !!process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432");
      _WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS = `${process.env.windir ? process.env.windir : "C:\\Windows"}\\${isWoW64 ? "Sysnative" : "System32"}\\cmd.exe`;
    }
    return _WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS;
  }
  static async getWtExePath() {
    try {
      return await findExecutable("wt");
    } catch {
      return void 0;
    }
  }
};

__decorateClass([
  memoize
], _WindowsExternalTerminalService, "getWtExePath", 1);

var WindowsExternalTerminalService = _WindowsExternalTerminalService;

var MacExternalTerminalService = class _MacExternalTerminalService extends ExternalTerminalService {
  static {
    this.OSASCRIPT = "/usr/bin/osascript";
  }
  // osascript is the AppleScript interpreter on OS X
  openTerminal(configuration, cwd2) {
    return this.spawnTerminal(cp2, configuration, cwd2);
  }
  runInTerminal(title, dir, args2, envVars, settings) {
    const terminalApp = settings.osxExec || DEFAULT_TERMINAL_OSX;
    return new Promise((resolve2, reject) => {
      if (terminalApp === DEFAULT_TERMINAL_OSX || terminalApp === "iTerm.app") {
        const script = terminalApp === DEFAULT_TERMINAL_OSX ? "TerminalHelper" : "iTermHelper";
        const scriptpath = FileAccess.asFileUri(`vs/workbench/contrib/externalTerminal/node/${script}.scpt`).fsPath;
        const osaArgs = [
          scriptpath,
          "-t",
          title || TERMINAL_TITLE,
          "-w",
          dir
        ];
        for (const a of args2) {
          osaArgs.push("-a");
          osaArgs.push(a);
        }
        if (envVars) {
          const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
          for (const key in env2) {
            const value = env2[key];
            if (value === null) {
              osaArgs.push("-u");
              osaArgs.push(key);
            } else {
              osaArgs.push("-e");
              osaArgs.push(`${key}=${value}`);
            }
          }
        }
        const osa = cp2.spawn(_MacExternalTerminalService.OSASCRIPT, osaArgs);
        setupSpawnErrorHandling(osa, resolve2, reject, terminalApp);
      } else if (terminalApp === "Ghostty.app") {
        const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
        const openArgs = ["-na", "Ghostty.app", "--args"];
        openArgs.push("--working-directory=" + dir);
        openArgs.push("--wait-after-command=true");
        openArgs.push("-e", ...args2);
        const cmd = cp2.spawn("/usr/bin/open", openArgs, { env: env2 });
        setupSpawnErrorHandling(cmd, resolve2, reject, terminalApp);
      } else {
        reject(new Error(localize(3007, null, terminalApp)));
      }
    });
  }
  spawnTerminal(spawner, configuration, cwd2) {
    const terminalApp = configuration.osxExec || DEFAULT_TERMINAL_OSX;
    return new Promise((c, e) => {
      const args2 = ["-a", terminalApp];
      if (cwd2) {
        args2.push(cwd2);
      }
      const env2 = getSanitizedEnvironment(process);
      const child = spawner.spawn("/usr/bin/open", args2, { cwd: cwd2, env: env2 });
      child.on("error", e);
      child.on("exit", () => c());
    });
  }
};

var LinuxExternalTerminalService = class _LinuxExternalTerminalService extends ExternalTerminalService {
  static {
    this.WAIT_MESSAGE = localize(3008, null);
  }
  openTerminal(configuration, cwd2) {
    return this.spawnTerminal(cp2, configuration, cwd2);
  }
  runInTerminal(title, dir, args2, envVars, settings) {
    const execPromise = settings.linuxExec ? Promise.resolve(settings.linuxExec) : _LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
    return new Promise((resolve2, reject) => {
      execPromise.then((exec2) => {
        const basename3 = basename(exec2).toLowerCase();
        if (basename3 === "ghostty") {
          const ghosttyArgs = [];
          if (dir) {
            ghosttyArgs.push(`--working-directory=${dir}`);
          }
          ghosttyArgs.push("--wait-after-command=true");
          if (args2.length) {
            ghosttyArgs.push("-e", ...args2);
          }
          _LinuxExternalTerminalService.spawnTerminalWithEnv(exec2, ghosttyArgs, dir, envVars, resolve2, reject);
          return;
        }
        const termArgs = [];
        if (exec2.indexOf("gnome-terminal") >= 0) {
          termArgs.push("-x");
        } else {
          termArgs.push("-e");
        }
        termArgs.push("bash");
        termArgs.push("-c");
        const bashCommand = `${quote(args2)}; echo; read -p "${_LinuxExternalTerminalService.WAIT_MESSAGE}" -n1;`;
        termArgs.push(`''${bashCommand}''`);
        _LinuxExternalTerminalService.spawnTerminalWithEnv(exec2, termArgs, dir, envVars, resolve2, reject);
      });
    });
  }
  static spawnTerminalWithEnv(exec2, args2, dir, envVars, resolve2, reject) {
    const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
    Object.keys(env2).filter((v) => env2[v] === null).forEach((key) => delete env2[key]);
    const cmd = cp2.spawn(exec2, args2, { cwd: dir, env: env2 });
    setupSpawnErrorHandling(cmd, resolve2, reject, exec2);
  }
  static async getDefaultTerminalLinuxReady() {
    if (!_LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY) {
      if (!isLinux) {
        _LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = Promise.resolve("xterm");
      } else {
        const isDebian = await Promises2.exists("/etc/debian_version");
        _LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = new Promise((r2) => {
          if (isDebian) {
            r2("x-terminal-emulator");
          } else if (process.env.DESKTOP_SESSION === "gnome" || process.env.DESKTOP_SESSION === "gnome-classic") {
            r2("gnome-terminal");
          } else if (process.env.DESKTOP_SESSION === "kde-plasma") {
            r2("konsole");
          } else if (process.env.COLORTERM) {
            r2(process.env.COLORTERM);
          } else if (process.env.TERM) {
            r2(process.env.TERM);
          } else {
            r2("xterm");
          }
        });
      }
    }
    return _LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY;
  }
  spawnTerminal(spawner, configuration, cwd2) {
    const execPromise = configuration.linuxExec ? Promise.resolve(configuration.linuxExec) : _LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
    return new Promise((c, e) => {
      execPromise.then((exec2) => {
        const env2 = getSanitizedEnvironment(process);
        const basename3 = basename(exec2).toLowerCase();
        const args2 = basename3 === "ghostty" && cwd2 ? [`--working-directory=${cwd2}`] : [];
        const child = spawner.spawn(exec2, args2, { cwd: cwd2, env: env2 });
        child.on("error", e);
        child.on("exit", () => c());
      });
    });
  }
};

function getSanitizedEnvironment(process2) {
  const env2 = { ...process2.env };
  sanitizeProcessEnvironment(env2);
  return env2;
}

function improveError(err) {
  if (err.errno === "ENOENT" && err.path) {
    return new Error(localize(3006, null, err.path));
  }
  return err;
}

function setupSpawnErrorHandling(cmd, resolve2, reject, terminalApp) {
  let stderr = "";
  cmd.on("error", (err) => {
    reject(improveError(err));
  });
  cmd.stderr?.on("data", (data) => {
    stderr += data.toString();
  });
  cmd.on("exit", (code) => {
    if (code === 0) {
      resolve2(void 0);
    } else {
      if (stderr) {
        const lines = stderr.split("\n", 1);
        reject(new Error(lines[0]));
      } else {
        reject(new Error(localize(3009, null, terminalApp, code)));
      }
    }
  });
}

function quote(args2) {
  let r2 = "";
  for (const a of args2) {
    if (a.indexOf(" ") >= 0) {
      r2 += '"' + a + '"';
    } else {
      r2 += a;
    }
    r2 += " ";
  }
  return r2;
}
export { getSanitizedEnvironment, improveError, setupSpawnErrorHandling, quote, cp2, TERMINAL_TITLE, ExternalTerminalService, _WindowsExternalTerminalService, WindowsExternalTerminalService, MacExternalTerminalService, LinuxExternalTerminalService };
