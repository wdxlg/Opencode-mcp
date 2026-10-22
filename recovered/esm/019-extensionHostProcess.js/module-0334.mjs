// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/node/processes.ts
import { cwd, env } from "./module-0015.mjs";
import { isWindows } from "./module-0014.mjs";
import { Promises2 } from "./module-0033.mjs";
import { delimiter, dirname, isAbsolute, join } from "./module-0019.mjs";
import { getCaseInsensitive } from "./module-0042.mjs";
import { isString } from "./module-0009.mjs";
import { FileAccess } from "./module-0026.mjs";


// src/vs/base/node/processes.ts
import * as cp from "child_process";

import { promises as promises2 } from "fs";


// src/vs/base/node/processes.ts
function getWindowsShell(env2 = env) {
  return env2["comspec"] || "cmd.exe";
}

function createQueuedSender(childProcess2) {
  let msgQueue = [];
  let useQueue = false;
  const send = function(msg) {
    if (useQueue) {
      msgQueue.push(msg);
      return;
    }
    const result = childProcess2.send(msg, (error) => {
      if (error) {
        console.error(error);
      }
      useQueue = false;
      if (msgQueue.length > 0) {
        const msgQueueCopy = msgQueue.slice(0);
        msgQueue = [];
        msgQueueCopy.forEach((entry) => send(entry));
      }
    });
    if (!result || isWindows) {
      useQueue = true;
    }
  };
  return { send };
}

async function fileExistsDefault(path) {
  if (await Promises2.exists(path)) {
    let statValue;
    try {
      statValue = await promises2.stat(path);
    } catch (e) {
      if (e.message.startsWith("EACCES")) {
        statValue = await promises2.lstat(path);
      }
    }
    return statValue ? !statValue.isDirectory() : false;
  }
  return false;
}

async function findExecutable(command, cwd2, paths, env2 = env, fileExists = fileExistsDefault) {
  if (isAbsolute(command)) {
    return await fileExists(command) ? command : void 0;
  }
  if (cwd2 === void 0) {
    cwd2 = cwd();
  }
  const dir = dirname(command);
  if (dir !== ".") {
    const fullPath2 = join(cwd2, command);
    return await fileExists(fullPath2) ? fullPath2 : void 0;
  }
  const envPath = getCaseInsensitive(env2, "PATH");
  if (paths === void 0 && isString(envPath)) {
    paths = envPath.split(delimiter);
  }
  if (paths === void 0 || paths.length === 0) {
    const fullPath2 = join(cwd2, command);
    return await fileExists(fullPath2) ? fullPath2 : void 0;
  }
  for (const pathEntry of paths) {
    let fullPath2;
    if (isAbsolute(pathEntry)) {
      fullPath2 = join(pathEntry, command);
    } else {
      fullPath2 = join(cwd2, pathEntry, command);
    }
    if (isWindows) {
      const pathExt = getCaseInsensitive(env2, "PATHEXT") || ".COM;.EXE;.BAT;.CMD";
      const pathExtsFound = pathExt.split(";").map(async (ext) => {
        const withExtension = fullPath2 + ext;
        return await fileExists(withExtension) ? withExtension : void 0;
      });
      for (const foundPromise of pathExtsFound) {
        const found = await foundPromise;
        if (found) {
          return found;
        }
      }
    }
    if (await fileExists(fullPath2)) {
      return fullPath2;
    }
  }
  const fullPath = join(cwd2, command);
  return await fileExists(fullPath) ? fullPath : void 0;
}

async function killTree(pid, forceful = false) {
  let child;
  if (isWindows) {
    const windir = process.env["WINDIR"] || "C:\\Windows";
    const taskKill = join(windir, "System32", "taskkill.exe");
    const args2 = ["/T"];
    if (forceful) {
      args2.push("/F");
    }
    args2.push("/PID", String(pid));
    child = cp.spawn(taskKill, args2, { stdio: ["ignore", "pipe", "pipe"] });
  } else {
    const killScript = FileAccess.asFileUri("vs/base/node/terminateProcess.sh").fsPath;
    child = cp.spawn("/bin/sh", [killScript, String(pid), forceful ? "9" : "15"], { stdio: ["ignore", "pipe", "pipe"] });
  }
  return new Promise((resolve2, reject) => {
    const stdout = [];
    child.stdout.on("data", (data) => stdout.push(data));
    child.stderr.on("data", (data) => stdout.push(data));
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve2();
      } else {
        reject(new Error(`taskkill exited with code ${code}: ${Buffer.concat(stdout).toString()}`));
      }
    });
  });
}
export { getWindowsShell, createQueuedSender, fileExistsDefault, findExecutable, killTree, cp, promises2 };
