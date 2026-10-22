// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/node/processes.ts
import { cwd2, env, init_process } from "./module-0007.mjs";
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { Promises2, init_pfs } from "./module-0036.mjs";
import { delimiter, dirname3, init_path, isAbsolute2, join4 } from "./module-0008.mjs";
import { getCaseInsensitive, init_objects } from "./module-0121.mjs";
import { init_types, isString } from "./module-0016.mjs";
import { FileAccess, init_network } from "./module-0031.mjs";
import { __esm } from "./module-0000.mjs";
import { init_processes } from "./module-0131.mjs";


// src/vs/base/node/processes.ts
import * as cp2 from "child_process";

import { promises as promises10 } from "fs";

function getWindowsShell(env2 = env) {
  return env2["comspec"] || "cmd.exe";
}

function createQueuedSender(childProcess) {
  let msgQueue = [];
  let useQueue = false;
  const send = function(msg) {
    if (useQueue) {
      msgQueue.push(msg);
      return;
    }
    const result = childProcess.send(msg, (error) => {
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
    if (!result || isWindows2) {
      useQueue = true;
    }
  };
  return { send };
}

async function fileExistsDefault(path4) {
  if (await Promises2.exists(path4)) {
    let statValue;
    try {
      statValue = await promises10.stat(path4);
    } catch (e) {
      if (e.message.startsWith("EACCES")) {
        statValue = await promises10.lstat(path4);
      }
    }
    return statValue ? !statValue.isDirectory() : false;
  }
  return false;
}

async function findExecutable(command, cwd3, paths, env2 = env, fileExists2 = fileExistsDefault) {
  if (isAbsolute2(command)) {
    return await fileExists2(command) ? command : void 0;
  }
  if (cwd3 === void 0) {
    cwd3 = cwd2();
  }
  const dir = dirname3(command);
  if (dir !== ".") {
    const fullPath2 = join4(cwd3, command);
    return await fileExists2(fullPath2) ? fullPath2 : void 0;
  }
  const envPath = getCaseInsensitive(env2, "PATH");
  if (paths === void 0 && isString(envPath)) {
    paths = envPath.split(delimiter);
  }
  if (paths === void 0 || paths.length === 0) {
    const fullPath2 = join4(cwd3, command);
    return await fileExists2(fullPath2) ? fullPath2 : void 0;
  }
  for (const pathEntry of paths) {
    let fullPath2;
    if (isAbsolute2(pathEntry)) {
      fullPath2 = join4(pathEntry, command);
    } else {
      fullPath2 = join4(cwd3, pathEntry, command);
    }
    if (isWindows2) {
      const pathExt = getCaseInsensitive(env2, "PATHEXT") || ".COM;.EXE;.BAT;.CMD";
      const pathExtsFound = pathExt.split(";").map(async (ext) => {
        const withExtension = fullPath2 + ext;
        return await fileExists2(withExtension) ? withExtension : void 0;
      });
      for (const foundPromise of pathExtsFound) {
        const found = await foundPromise;
        if (found) {
          return found;
        }
      }
    }
    if (await fileExists2(fullPath2)) {
      return fullPath2;
    }
  }
  const fullPath = join4(cwd3, command);
  return await fileExists2(fullPath) ? fullPath : void 0;
}

async function killTree(pid, forceful = false) {
  let child;
  if (isWindows2) {
    const windir = process.env["WINDIR"] || "C:\\Windows";
    const taskKill = join4(windir, "System32", "taskkill.exe");
    const args2 = ["/T"];
    if (forceful) {
      args2.push("/F");
    }
    args2.push("/PID", String(pid));
    child = cp2.spawn(taskKill, args2, { stdio: ["ignore", "pipe", "pipe"] });
  } else {
    const killScript = FileAccess.asFileUri("vs/base/node/terminateProcess.sh").fsPath;
    child = cp2.spawn("/bin/sh", [killScript, String(pid), forceful ? "9" : "15"], { stdio: ["ignore", "pipe", "pipe"] });
  }
  return new Promise((resolve3, reject) => {
    const stdout = [];
    child.stdout.on("data", (data) => stdout.push(data));
    child.stderr.on("data", (data) => stdout.push(data));
    child.on("error", reject);
    child.on("exit", (code2) => {
      if (code2 === 0) {
        resolve3();
      } else {
        reject(new Error(`taskkill exited with code ${code2}: ${Buffer.concat(stdout).toString()}`));
      }
    });
  });
}

var init_processes2 = __esm({
  "src/vs/base/node/processes.ts"() {
    init_objects();
    init_path();
    init_platform();
    init_process();
    init_processes();
    init_types();
    init_pfs();
    init_network();
  }
});
export { getWindowsShell, createQueuedSender, fileExistsDefault, findExecutable, killTree, cp2, promises10, init_processes2 };
