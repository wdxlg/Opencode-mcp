// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpServerIcons.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpServerIcons.ts
var mcpServerIcon2 = registerIcon("mcp-server", Codicon.mcp, localize(17071, null));

var mcpServerRemoteIcon = registerIcon("mcp-server-remote", Codicon.remote, localize(17072, null));

var mcpServerWorkspaceIcon = registerIcon("mcp-server-workspace", Codicon.rootFolder, localize(17073, null));

var mcpStarredIcon = registerIcon("mcp-server-starred", Codicon.starFull, localize(17074, null));

var mcpLicenseIcon = registerIcon("mcp-server-license", Codicon.law, localize(17070, null));
export { mcpServerIcon2, mcpServerRemoteIcon, mcpServerWorkspaceIcon, mcpStarredIcon, mcpLicenseIcon };
