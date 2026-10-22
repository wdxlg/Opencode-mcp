// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/workspacelessScratchDir.ts
import { workspacelessScratchDir } from "./module-0130.mjs";


// src/vs/platform/agentHost/node/workspacelessScratchDir.ts
import * as fs8 from "fs/promises";

async function ensureWorkspacelessScratchDir(userHome, sessionId) {
  const dir = workspacelessScratchDir(userHome, sessionId);
  await fs8.mkdir(dir.fsPath, { recursive: true });
  return dir;
}
export { ensureWorkspacelessScratchDir, fs8 };
