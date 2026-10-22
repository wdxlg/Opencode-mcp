// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostGitStateService.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/agentHost/common/agentHostGitStateService.ts
var META_GIT_STATE = "agentHost.git";

var META_GITHUB_STATE = "agentHost.github";

var META_SOURCE_CONTROL_STATE = "agentHost.sourceControl";

var GIT_DB_METADATA_KEYS = {
  [META_GIT_STATE]: true,
  [META_GITHUB_STATE]: true,
  [META_SOURCE_CONTROL_STATE]: true
};

var IAgentHostGitStateService = createDecorator("agentHostGitStateService");
export { META_GIT_STATE, META_GITHUB_STATE, META_SOURCE_CONTROL_STATE, GIT_DB_METADATA_KEYS, IAgentHostGitStateService };
