// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostShellUtils.ts
import { OS } from "./module-0013.mjs";
import { posix, win32 } from "./module-0018.mjs";


// src/vs/platform/agentHost/node/agentHostShellUtils.ts
function isZsh(shell) {
  if (OS === 1 /* Windows */) {
    return /^zsh(?:\.exe)?$/i.test(win32.basename(shell));
  }
  return /^zsh$/.test(posix.basename(shell));
}
export { isZsh };
