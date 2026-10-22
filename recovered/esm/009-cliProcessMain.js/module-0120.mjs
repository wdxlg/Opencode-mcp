// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/base/node/processes.ts
import { env } from "./module-0015.mjs";
import { isWindows } from "./module-0014.mjs";


// src/vs/base/node/processes.ts
import * as cp from "child_process";

import { promises as promises4 } from "fs";


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
export { getWindowsShell, createQueuedSender, cp, promises4 };
