// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/shell/node/shellEnv.ts
import { OS, isWindows } from "./module-0014.mjs";
import { isLaunchedFromCli } from "./module-0482.mjs";
import { Promises } from "./module-0029.mjs";
import { CancellationTokenSource } from "./module-0018.mjs";
import { clamp } from "./module-0072.mjs";
import { localize } from "./module-0013.mjs";
import { CancellationError, isCancellationError } from "./module-0003.mjs";
import { toErrorMessage } from "./module-0060.mjs";
import { generateUuid } from "./module-0040.mjs";
import { getSystemShell } from "./module-0480.mjs";
import { basename } from "./module-0019.mjs";


// src/vs/platform/shell/node/shellEnv.ts
import { spawn as spawn8 } from "child_process";


// src/vs/platform/shell/node/shellEnv.ts
var unixShellEnvPromise = void 0;

async function getResolvedShellEnv(configurationService, logService, args2, env2) {
  if (args2["force-disable-user-env"]) {
    logService.trace("resolveShellEnv(): skipped (--force-disable-user-env)");
    return {};
  } else if (isWindows) {
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
      unixShellEnvPromise = Promises.withAsyncBody(async (resolve2, reject) => {
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
          resolve2(await doResolveUnixShellEnv(logService, cts.token));
        } catch (error) {
          if (!isCancellationError(error) && !cts.token.isCancellationRequested) {
            reject(new Error(localize(3240, null, toErrorMessage(error))));
          } else {
            resolve2({});
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
  return new Promise((resolve2, reject) => {
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
    const child = spawn8(systemShellUnix, [...shellArgs, command], {
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
    child.on("close", (code, signal) => {
      const raw = Buffer.concat(buffers).toString("utf8");
      logService.trace("getUnixShellEnvironment#raw", raw);
      const stderrStr = Buffer.concat(stderr).toString("utf8");
      if (stderrStr.trim()) {
        logService.trace("getUnixShellEnvironment#stderr", stderrStr);
      }
      if (code || signal) {
        return reject(new Error(localize(3241, null, code, signal)));
      }
      const match2 = regex.exec(raw);
      const rawStripped = match2 ? match2[1] : "{}";
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
        resolve2(env3);
      } catch (err) {
        logService.error("getUnixShellEnvironment#errorCaught", toErrorMessage(err));
        reject(err);
      }
    });
  });
}
export { getResolvedShellEnv, doResolveUnixShellEnv, spawn8, unixShellEnvPromise };
