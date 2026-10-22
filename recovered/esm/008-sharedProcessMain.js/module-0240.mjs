// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/remoteTunnel/node/codeTunnelCliProcess.ts
import { dirname, join } from "./module-0023.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { createCancelablePromise } from "./module-0029.mjs";
import { StreamSplitter } from "./module-0239.mjs";


// src/vs/platform/remoteTunnel/node/codeTunnelCliProcess.ts
import { spawn as spawn6 } from "child_process";

import { homedir as homedir3 } from "os";

var STOP_GRACE_PERIOD_MS = 5e3;

function resolveTunnelCommandLocation(appRoot, platform3, tunnelApplicationName, win32VersionedUpdate) {
  let binParentLocation;
  if (platform3 === "darwin") {
    binParentLocation = appRoot;
  } else if (platform3 === "win32") {
    binParentLocation = win32VersionedUpdate ? dirname(dirname(dirname(appRoot))) : dirname(dirname(appRoot));
  } else {
    binParentLocation = dirname(dirname(appRoot));
  }
  return join(binParentLocation, "bin", `${tunnelApplicationName}${platform3 === "win32" ? ".exe" : ""}`);
}

var CodeTunnelCli = class {
  constructor(_options) {
    this._options = _options;
    this._spawn = _options.spawn ?? spawn6;
    this._onLog = _options.onLog ?? (() => {
    });
  }
  /** Absolute path of the `code-tunnel` binary for this installation. */
  get commandLocation() {
    if (!this._commandLocation) {
      this._commandLocation = resolveTunnelCommandLocation(
        this._options.appRoot,
        isWindows ? "win32" : isMacintosh ? "darwin" : "linux",
        this._options.tunnelApplicationName,
        this._options.win32VersionedUpdate
      );
    }
    return this._commandLocation;
  }
  /** Runs the code CLI with the specified complete command arguments. */
  run(logLabel, args, onOutput, env2) {
    let tunnelProcess;
    let didStop = false;
    let resolveExit;
    const exited = new Promise((resolve3) => resolveExit = resolve3);
    const stop = () => {
      if (tunnelProcess && !didStop) {
        didStop = true;
        const child = tunnelProcess;
        this._onLog(`${logLabel} terminating(${child.pid})`);
        child.kill();
        const forceKill = setTimeout(() => {
          this._onLog(`${logLabel} did not exit within ${STOP_GRACE_PERIOD_MS}ms, force killing(${child.pid})`);
          child.kill("SIGKILL");
        }, STOP_GRACE_PERIOD_MS);
        void exited.finally(() => clearTimeout(forceKill));
      }
      return exited;
    };
    const result = createCancelablePromise((token) => {
      return new Promise((resolve3, reject) => {
        if (token.isCancellationRequested) {
          resolve3(-1);
        }
        const stdio = ["ignore", "pipe", "pipe"];
        const cancellationListener = token.onCancellationRequested(() => {
          void stop();
        });
        try {
          if (!this._options.isBuilt) {
            onOutput("Building tunnel CLI from sources and run\n", false);
            onOutput(`${logLabel} Spawning: cargo run -- ${args.join(" ")}
`, false);
            tunnelProcess = this._spawn("cargo", ["run", "--", ...args], { cwd: join(this._options.appRoot, "cli"), stdio, env: { ...process.env, RUST_BACKTRACE: "1", ...env2 } });
          } else {
            onOutput("Running tunnel CLI\n", false);
            const tunnelCommand = this.commandLocation;
            onOutput(`${logLabel} Spawning: ${tunnelCommand} ${args.join(" ")}
`, false);
            tunnelProcess = this._spawn(tunnelCommand, args, { cwd: homedir3(), stdio, env: { ...process.env, ...env2 } });
          }
        } catch (error) {
          cancellationListener.dispose();
          resolveExit?.();
          reject(error);
          return;
        }
        tunnelProcess.stdout.pipe(new StreamSplitter("\n")).on("data", (data) => {
          if (tunnelProcess) {
            onOutput(data.toString(), false);
          }
        });
        tunnelProcess.stderr.pipe(new StreamSplitter("\n")).on("data", (data) => {
          if (tunnelProcess) {
            onOutput(data.toString(), true);
          }
        });
        tunnelProcess.on("exit", (e) => {
          if (tunnelProcess) {
            cancellationListener.dispose();
            onOutput(`${logLabel} exit(${tunnelProcess.pid}): + ${e} `, false);
            tunnelProcess = void 0;
            resolveExit?.();
            resolve3(e || 0);
          }
        });
        tunnelProcess.on("error", (e) => {
          if (tunnelProcess) {
            cancellationListener.dispose();
            onOutput(`${logLabel} error(${tunnelProcess.pid}): + ${e} `, true);
            tunnelProcess = void 0;
            resolveExit?.();
            reject(e);
          }
        });
      });
    });
    return { result, stop };
  }
};
export { resolveTunnelCommandLocation, spawn6, homedir3, STOP_GRACE_PERIOD_MS, CodeTunnelCli };
