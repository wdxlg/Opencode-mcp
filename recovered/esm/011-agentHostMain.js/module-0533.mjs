// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/artifactTools/artifactToolsContribution.ts
import { Disposable } from "./module-0010.mjs";
import { AgentHostArtifactToolsConfigKey, platformRootSchema } from "./module-0057.mjs";
import { ARTIFACT_TOOLS_INSTRUCTION } from "./module-0235.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";


// src/vs/platform/agentHost/node/chatContributions/artifactTools/artifactToolsContribution.ts
var ArtifactToolsContribution = class extends Disposable {
  constructor(_context, _agentConfigService) {
    super();
    this._context = _context;
    this._agentConfigService = _agentConfigService;
    this.order = 200;
  }
  static {
    this.id = "artifactTools";
  }
  onOutgoingTurn() {
    return this._agentConfigService.getRootValue(platformRootSchema, AgentHostArtifactToolsConfigKey) ? { instructions: [ARTIFACT_TOOLS_INSTRUCTION] } : void 0;
  }
};

ArtifactToolsContribution = __decorateClass([
  __decorateParam(1, IAgentConfigurationService)
], ArtifactToolsContribution);
export { ArtifactToolsContribution };
