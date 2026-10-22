// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/base/node/processes.ts
import { cwd, env } from "./module-0016.mjs";
import { isWindows } from "./module-0014.mjs";
import { Promises2 } from "./module-0038.mjs";
import { delimiter, dirname, isAbsolute, join } from "./module-0023.mjs";
import { getCaseInsensitive } from "./module-0074.mjs";
import { isString } from "./module-0006.mjs";


// src/vs/base/node/processes.ts
import * as cp from "child_process";

import { promises as promises7 } from "fs";


// src/vs/base/node/processes.ts
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
      statValue = await promises7.stat(path);
    } catch (e) {
      if (e.message.startsWith("EACCES")) {
        statValue = await promises7.lstat(path);
      }
    }
    return statValue ? !statValue.isDirectory() : false;
  }
  return false;
}

async function findExecutable(command, cwd3, paths, env2 = env, fileExists = fileExistsDefault) {
  if (isAbsolute(command)) {
    return await fileExists(command) ? command : void 0;
  }
  if (cwd3 === void 0) {
    cwd3 = cwd();
  }
  const dir = dirname(command);
  if (dir !== ".") {
    const fullPath2 = join(cwd3, command);
    return await fileExists(fullPath2) ? fullPath2 : void 0;
  }
  const envPath = getCaseInsensitive(env2, "PATH");
  if (paths === void 0 && isString(envPath)) {
    paths = envPath.split(delimiter);
  }
  if (paths === void 0 || paths.length === 0) {
    const fullPath2 = join(cwd3, command);
    return await fileExists(fullPath2) ? fullPath2 : void 0;
  }
  for (const pathEntry of paths) {
    let fullPath2;
    if (isAbsolute(pathEntry)) {
      fullPath2 = join(pathEntry, command);
    } else {
      fullPath2 = join(cwd3, pathEntry, command);
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
  const fullPath = join(cwd3, command);
  return await fileExists(fullPath) ? fullPath : void 0;
}
export { getWindowsShell, createQueuedSender, fileExistsDefault, findExecutable, cp, promises7 };
