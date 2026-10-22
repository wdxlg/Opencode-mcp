// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/shell/node/shellEnv.ts
import { OS, init_platform, isWindows2 } from "./module-0006.mjs";
import { init_argvHelper, isLaunchedFromCli } from "./module-0163.mjs";
import { Promises, init_async } from "./module-0034.mjs";
import { CancellationTokenSource, init_cancellation } from "./module-0022.mjs";
import { clamp, init_numbers } from "./module-0167.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { CancellationError, init_errors, isCancellationError } from "./module-0010.mjs";
import { init_errorMessage, toErrorMessage } from "./module-0047.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { getSystemShell, init_shell } from "./module-0166.mjs";
import { basename, init_path } from "./module-0008.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/shell/node/shellEnv.ts
import { spawn as spawn2 } from "child_process";

async function getResolvedShellEnv(configurationService, logService, args2, env2) {
  if (args2["force-disable-user-env"]) {
    logService.trace("resolveShellEnv(): skipped (--force-disable-user-env)");
    return {};
  } else if (isWindows2) {
    logService.trace("resolveShellEnv(): skipped (Windows)");
    return {};
  } else if (isLaunchedFromCli(env2) && !args2["force-user-env"]) {
    logService.trace("resolveShellEnv(): skipped (VSCODE_CLI is set)");
    return {};
  } else {
    if (isLaunchedFromCli(env2)) {
      logService.trace("resolveShellEnv(): running (--force-user-env)");
    } else {
      logService.trace("resolveShellEnv(): running (macOS/Linux)");
    }
    if (!unixShellEnvPromise) {
      unixShellEnvPromise = Promises.withAsyncBody(async (resolve3, reject) => {
        const cts = new CancellationTokenSource();
        let timeoutValue = 1e4;
        const configuredTimeoutValue = configurationService.getValue("application.shellEnvironmentResolutionTimeout");
        if (typeof configuredTimeoutValue === "number") {
          timeoutValue = clamp(configuredTimeoutValue, 1, 120) * 1e3;
        }
        const timeout2 = setTimeout(() => {
          cts.dispose(true);
          reject(new Error(localize(3242, null)));
        }, timeoutValue);
        try {
          resolve3(await doResolveUnixShellEnv(logService, cts.token));
        } catch (error) {
          if (!isCancellationError(error) && !cts.token.isCancellationRequested) {
            reject(new Error(localize(3240, null, toErrorMessage(error))));
          } else {
            resolve3({});
          }
        } finally {
          clearTimeout(timeout2);
          cts.dispose();
        }
      });
    }
    return unixShellEnvPromise;
  }
}

async function doResolveUnixShellEnv(logService, token) {
  const runAsNode = process.env["ELECTRON_RUN_AS_NODE"];
  logService.trace("getUnixShellEnvironment#runAsNode", runAsNode);
  const noAttach = process.env["ELECTRON_NO_ATTACH_CONSOLE"];
  logService.trace("getUnixShellEnvironment#noAttach", noAttach);
  const mark2 = generateUuid().replace(/-/g, "").substr(0, 12);
  const regex = new RegExp(mark2 + "({.*})" + mark2);
  const env2 = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    ELECTRON_NO_ATTACH_CONSOLE: "1",
    VSCODE_RESOLVING_ENVIRONMENT: "1"
  };
  logService.trace("getUnixShellEnvironment#env", env2);
  const systemShellUnix = await getSystemShell(OS, env2);
  logService.trace("getUnixShellEnvironment#shell", systemShellUnix);
  return new Promise((resolve3, reject) => {
    if (token.isCancellationRequested) {
      return reject(new CancellationError());
    }
    const name = basename(systemShellUnix);
    let command, shellArgs;
    const extraArgs = "";
    if (/^(?:pwsh|powershell)(?:-preview)?$/.test(name)) {
      command = `& '${process.execPath}' ${extraArgs} -p '''${mark2}'' + JSON.stringify(process.env) + ''${mark2}'''`;
      shellArgs = ["-Login", "-Command"];
    } else if (name === "nu") {
      command = `^'${process.execPath}' ${extraArgs} -p '"${mark2}" + JSON.stringify(process.env) + "${mark2}"'`;
      shellArgs = ["-i", "-l", "-c"];
    } else if (name === "xonsh") {
      command = `import os, json; print("${mark2}", json.dumps(dict(os.environ)), "${mark2}")`;
      shellArgs = ["-i", "-l", "-c"];
    } else {
      command = `'${process.execPath}' ${extraArgs} -p '"${mark2}" + JSON.stringify(process.env) + "${mark2}"'`;
      if (name === "tcsh" || name === "csh") {
        shellArgs = ["-ic"];
      } else {
        shellArgs = ["-i", "-l", "-c"];
      }
    }
    logService.trace("getUnixShellEnvironment#spawn", JSON.stringify(shellArgs), command);
    const child = spawn2(systemShellUnix, [...shellArgs, command], {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: env2
    });
    token.onCancellationRequested(() => {
      child.kill();
      return reject(new CancellationError());
    });
    child.on("error", (err) => {
      logService.error("getUnixShellEnvironment#errorChildProcess", toErrorMessage(err));
      reject(err);
    });
    const buffers = [];
    child.stdout.on("data", (b) => buffers.push(b));
    const stderr = [];
    child.stderr.on("data", (b) => stderr.push(b));
    child.on("close", (code2, signal) => {
      const raw = Buffer.concat(buffers).toString("utf8");
      logService.trace("getUnixShellEnvironment#raw", raw);
      const stderrStr = Buffer.concat(stderr).toString("utf8");
      if (stderrStr.trim()) {
        logService.trace("getUnixShellEnvironment#stderr", stderrStr);
      }
      if (code2 || signal) {
        return reject(new Error(localize(3241, null, code2, signal)));
      }
      const match = regex.exec(raw);
      const rawStripped = match ? match[1] : "{}";
      try {
        const env3 = JSON.parse(rawStripped);
        if (runAsNode) {
          env3["ELECTRON_RUN_AS_NODE"] = runAsNode;
        } else {
          delete env3["ELECTRON_RUN_AS_NODE"];
        }
        if (noAttach) {
          env3["ELECTRON_NO_ATTACH_CONSOLE"] = noAttach;
        } else {
          delete env3["ELECTRON_NO_ATTACH_CONSOLE"];
        }
        delete env3["VSCODE_RESOLVING_ENVIRONMENT"];
        delete env3["XDG_RUNTIME_DIR"];
        logService.trace("getUnixShellEnvironment#result", env3);
        resolve3(env3);
      } catch (err) {
        logService.error("getUnixShellEnvironment#errorCaught", toErrorMessage(err));
        reject(err);
      }
    });
  });
}

var unixShellEnvPromise;

var init_shellEnv = __esm({
  "src/vs/platform/shell/node/shellEnv.ts"() {
    init_path();
    init_nls();
    init_cancellation();
    init_errorMessage();
    init_errors();
    init_platform();
    init_uuid();
    init_shell();
    init_argvHelper();
    init_async();
    init_numbers();
    unixShellEnvPromise = void 0;
  }
});
export { getResolvedShellEnv, doResolveUnixShellEnv, spawn2, unixShellEnvPromise, init_shellEnv };
