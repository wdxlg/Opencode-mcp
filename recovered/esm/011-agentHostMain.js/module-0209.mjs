// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/mcpServerWorkingDirectory.ts
import { untildify } from "./module-0210.mjs";
import { isAbsolute, join, normalize } from "./module-0018.mjs";


// src/vs/platform/agentHost/node/shared/mcpServerWorkingDirectory.ts
import { homedir as homedir3 } from "os";


// src/vs/platform/agentHost/node/shared/mcpServerWorkingDirectory.ts
function resolveMcpServerWorkingDirectory(cwd3, defaultCwd) {
  const expandedCwd = cwd3 ? untildify(cwd3, homedir3()) : void 0;
  if (!expandedCwd) {
    return defaultCwd?.fsPath;
  }
  if (defaultCwd && !isAbsolute(expandedCwd)) {
    return normalize(join(defaultCwd.fsPath, expandedCwd));
  }
  return cwd3?.startsWith("~") ? normalize(expandedCwd) : expandedCwd;
}
export { resolveMcpServerWorkingDirectory, homedir3 };
