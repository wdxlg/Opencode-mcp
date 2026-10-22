// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/externalTerminal/node/externalTerminalService.ts
import { init_processes, sanitizeProcessEnvironment } from "./module-0131.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { __decorateClass, __esm } from "./module-0000.mjs";
import { init_decorators, memoize } from "./module-0052.mjs";
import { FileAccess, init_network } from "./module-0031.mjs";
import { basename, init_path } from "./module-0008.mjs";
import { init_platform, isLinux } from "./module-0006.mjs";
import { Promises2, init_pfs } from "./module-0036.mjs";
import { findExecutable, getWindowsShell, init_processes2 } from "./module-0165.mjs";
import { DEFAULT_TERMINAL_OSX, init_externalTerminal2 } from "./module-0172.mjs";


// src/vs/platform/externalTerminal/node/externalTerminalService.ts
import * as cp3 from "child_process";

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

function setupSpawnErrorHandling(cmd, resolve3, reject, terminalApp) {
  let stderr = "";
  cmd.on("error", (err) => {
    reject(improveError(err));
  });
  cmd.stderr?.on("data", (data) => {
    stderr += data.toString();
  });
  cmd.on("exit", (code2) => {
    if (code2 === 0) {
      resolve3(void 0);
    } else {
      if (stderr) {
        const lines = stderr.split("\n", 1);
        reject(new Error(lines[0]));
      } else {
        reject(new Error(localize(3009, null, terminalApp, code2)));
      }
    }
  });
}

function quote(args2) {
  let r = "";
  for (const a of args2) {
    if (a.indexOf(" ") >= 0) {
      r += '"' + a + '"';
    } else {
      r += a;
    }
    r += " ";
  }
  return r;
}

var TERMINAL_TITLE, ExternalTerminalService, _WindowsExternalTerminalService, WindowsExternalTerminalService, MacExternalTerminalService, LinuxExternalTerminalService;

var init_externalTerminalService = __esm({
  "src/vs/platform/externalTerminal/node/externalTerminalService.ts"() {
    init_decorators();
    init_network();
    init_path();
    init_platform();
    init_processes();
    init_pfs();
    init_processes2();
    init_nls();
    init_externalTerminal2();
    TERMINAL_TITLE = localize(3005, null);
    ExternalTerminalService = class {
      async getDefaultTerminalForPlatforms() {
        return {
          windows: WindowsExternalTerminalService.getDefaultTerminalWindows(),
          linux: await LinuxExternalTerminalService.getDefaultTerminalLinuxReady(),
          osx: DEFAULT_TERMINAL_OSX
        };
      }
    };
    _WindowsExternalTerminalService = class _WindowsExternalTerminalService extends ExternalTerminalService {
      static {
        this.CMD = "cmd.exe";
      }
      openTerminal(configuration, cwd3) {
        return this.spawnTerminal(cp3, configuration, getWindowsShell(), cwd3);
      }
      spawnTerminal(spawner, configuration, command, cwd3) {
        const exec4 = configuration.windowsExec || _WindowsExternalTerminalService.getDefaultTerminalWindows();
        if (cwd3 && cwd3[1] === ":") {
          cwd3 = cwd3[0].toUpperCase() + cwd3.substr(1);
        }
        const basename3 = basename(exec4, ".exe").toLowerCase();
        if (basename3 === "cmder") {
          spawner.spawn(exec4, cwd3 ? [cwd3] : void 0);
          return Promise.resolve(void 0);
        }
        const cmdArgs = ["/c", "start", "/wait"];
        if (exec4.indexOf(" ") >= 0) {
          cmdArgs.push(exec4);
        }
        cmdArgs.push(exec4);
        if (basename3 === "wt") {
          cmdArgs.push("-d .");
        }
        return new Promise((c, e) => {
          const env2 = getSanitizedEnvironment(process);
          const child = spawner.spawn(command, cmdArgs, { cwd: cwd3, env: env2, detached: true });
          child.on("error", e);
          child.on("exit", () => c());
        });
      }
      async runInTerminal(title, dir, args2, envVars, settings) {
        const exec4 = settings.windowsExec || _WindowsExternalTerminalService.getDefaultTerminalWindows();
        const wt = await _WindowsExternalTerminalService.getWtExePath();
        return new Promise((resolve3, reject) => {
          const title2 = `"${dir} - ${TERMINAL_TITLE}"`;
          const command = `"${args2.join('" "')}" & pause`;
          const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
          Object.keys(env2).filter((v) => env2[v] === null).forEach((key) => delete env2[key]);
          const options = {
            cwd: dir,
            env: env2,
            windowsVerbatimArguments: true
          };
          let spawnExec;
          let cmdArgs;
          if (basename(exec4, ".exe") === "wt") {
            spawnExec = exec4;
            cmdArgs = ["-d", ".", _WindowsExternalTerminalService.CMD, "/c", command];
          } else if (wt) {
            spawnExec = wt;
            cmdArgs = ["-d", ".", exec4, "/c", command];
          } else {
            spawnExec = _WindowsExternalTerminalService.CMD;
            cmdArgs = ["/c", "start", title2, "/wait", exec4, "/c", `"${command}"`];
          }
          const cmd = cp3.spawn(spawnExec, cmdArgs, options);
          cmd.on("error", (err) => {
            reject(improveError(err));
          });
          resolve3(void 0);
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
    WindowsExternalTerminalService = _WindowsExternalTerminalService;
    MacExternalTerminalService = class _MacExternalTerminalService extends ExternalTerminalService {
      static {
        this.OSASCRIPT = "/usr/bin/osascript";
      }
      // osascript is the AppleScript interpreter on OS X
      openTerminal(configuration, cwd3) {
        return this.spawnTerminal(cp3, configuration, cwd3);
      }
      runInTerminal(title, dir, args2, envVars, settings) {
        const terminalApp = settings.osxExec || DEFAULT_TERMINAL_OSX;
        return new Promise((resolve3, reject) => {
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
            const osa = cp3.spawn(_MacExternalTerminalService.OSASCRIPT, osaArgs);
            setupSpawnErrorHandling(osa, resolve3, reject, terminalApp);
          } else if (terminalApp === "Ghostty.app") {
            const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
            const openArgs = ["-na", "Ghostty.app", "--args"];
            openArgs.push("--working-directory=" + dir);
            openArgs.push("--wait-after-command=true");
            openArgs.push("-e", ...args2);
            const cmd = cp3.spawn("/usr/bin/open", openArgs, { env: env2 });
            setupSpawnErrorHandling(cmd, resolve3, reject, terminalApp);
          } else {
            reject(new Error(localize(3007, null, terminalApp)));
          }
        });
      }
      spawnTerminal(spawner, configuration, cwd3) {
        const terminalApp = configuration.osxExec || DEFAULT_TERMINAL_OSX;
        return new Promise((c, e) => {
          const args2 = ["-a", terminalApp];
          if (cwd3) {
            args2.push(cwd3);
          }
          const env2 = getSanitizedEnvironment(process);
          const child = spawner.spawn("/usr/bin/open", args2, { cwd: cwd3, env: env2 });
          child.on("error", e);
          child.on("exit", () => c());
        });
      }
    };
    LinuxExternalTerminalService = class _LinuxExternalTerminalService extends ExternalTerminalService {
      static {
        this.WAIT_MESSAGE = localize(3008, null);
      }
      openTerminal(configuration, cwd3) {
        return this.spawnTerminal(cp3, configuration, cwd3);
      }
      runInTerminal(title, dir, args2, envVars, settings) {
        const execPromise = settings.linuxExec ? Promise.resolve(settings.linuxExec) : _LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
        return new Promise((resolve3, reject) => {
          execPromise.then((exec4) => {
            const basename3 = basename(exec4).toLowerCase();
            if (basename3 === "ghostty") {
              const ghosttyArgs = [];
              if (dir) {
                ghosttyArgs.push(`--working-directory=${dir}`);
              }
              ghosttyArgs.push("--wait-after-command=true");
              if (args2.length) {
                ghosttyArgs.push("-e", ...args2);
              }
              _LinuxExternalTerminalService.spawnTerminalWithEnv(exec4, ghosttyArgs, dir, envVars, resolve3, reject);
              return;
            }
            const termArgs = [];
            if (exec4.indexOf("gnome-terminal") >= 0) {
              termArgs.push("-x");
            } else {
              termArgs.push("-e");
            }
            termArgs.push("bash");
            termArgs.push("-c");
            const bashCommand = `${quote(args2)}; echo; read -p "${_LinuxExternalTerminalService.WAIT_MESSAGE}" -n1;`;
            termArgs.push(`''${bashCommand}''`);
            _LinuxExternalTerminalService.spawnTerminalWithEnv(exec4, termArgs, dir, envVars, resolve3, reject);
          });
        });
      }
      static spawnTerminalWithEnv(exec4, args2, dir, envVars, resolve3, reject) {
        const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
        Object.keys(env2).filter((v) => env2[v] === null).forEach((key) => delete env2[key]);
        const cmd = cp3.spawn(exec4, args2, { cwd: dir, env: env2 });
        setupSpawnErrorHandling(cmd, resolve3, reject, exec4);
      }
      static async getDefaultTerminalLinuxReady() {
        if (!_LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY) {
          if (!isLinux) {
            _LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = Promise.resolve("xterm");
          } else {
            const isDebian = await Promises2.exists("/etc/debian_version");
            _LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = new Promise((r) => {
              if (isDebian) {
                r("x-terminal-emulator");
              } else if (process.env.DESKTOP_SESSION === "gnome" || process.env.DESKTOP_SESSION === "gnome-classic") {
                r("gnome-terminal");
              } else if (process.env.DESKTOP_SESSION === "kde-plasma") {
                r("konsole");
              } else if (process.env.COLORTERM) {
                r(process.env.COLORTERM);
              } else if (process.env.TERM) {
                r(process.env.TERM);
              } else {
                r("xterm");
              }
            });
          }
        }
        return _LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY;
      }
      spawnTerminal(spawner, configuration, cwd3) {
        const execPromise = configuration.linuxExec ? Promise.resolve(configuration.linuxExec) : _LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
        return new Promise((c, e) => {
          execPromise.then((exec4) => {
            const env2 = getSanitizedEnvironment(process);
            const basename3 = basename(exec4).toLowerCase();
            const args2 = basename3 === "ghostty" && cwd3 ? [`--working-directory=${cwd3}`] : [];
            const child = spawner.spawn(exec4, args2, { cwd: cwd3, env: env2 });
            child.on("error", e);
            child.on("exit", () => c());
          });
        });
      }
    };
  }
});
export { getSanitizedEnvironment, improveError, setupSpawnErrorHandling, quote, cp3, TERMINAL_TITLE, ExternalTerminalService, _WindowsExternalTerminalService, WindowsExternalTerminalService, MacExternalTerminalService, LinuxExternalTerminalService, init_externalTerminalService };
