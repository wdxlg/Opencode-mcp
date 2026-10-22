// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostFileSystemService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { AgentHostFileSystemProvider } from "./module-0303.mjs";
import { AGENT_HOST_LABEL_FORMATTER, AGENT_HOST_SCHEME, LOCAL_AGENT_HOST_AUTHORITY, agentHostLabelFormatter } from "./module-0302.mjs";
import { OS } from "./module-0013.mjs";
import { InMemoryFileSystemProvider } from "./module-0283.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0128.mjs";
import { ILabelService } from "./module-0301.mjs";
import { registerSingleton } from "./module-0300.mjs";


// src/vs/platform/agentHost/common/agentHostFileSystemService.ts
var SYNCED_CUSTOMIZATION_SCHEME = "vscode-synced-customization";

var IAgentHostFileSystemService = createDecorator("agentHostFileSystemService");

var AgentHostFileSystemService = class extends Disposable {
  constructor(_fileService, labelService) {
    super();
    this._fileService = _fileService;
    this._syncedCustomizationProviderRegistered = false;
    this._fsProvider = this._register(new AgentHostFileSystemProvider());
    this._register(_fileService.registerProvider(AGENT_HOST_SCHEME, this._fsProvider));
    this._register(labelService.registerFormatter(AGENT_HOST_LABEL_FORMATTER));
    this._register(labelService.registerFormatter(agentHostLabelFormatter(LOCAL_AGENT_HOST_AUTHORITY, OS)));
  }
  registerAuthority(authority, connection) {
    return this._fsProvider.registerAuthority(authority, connection);
  }
  ensureSyncedCustomizationProvider() {
    if (!this._syncedCustomizationProviderRegistered) {
      this._syncedCustomizationProviderRegistered = true;
      const provider = this._register(new InMemoryFileSystemProvider());
      this._register(this._fileService.registerProvider(SYNCED_CUSTOMIZATION_SCHEME, provider));
    }
  }
};

AgentHostFileSystemService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILabelService)
], AgentHostFileSystemService);

registerSingleton(IAgentHostFileSystemService, AgentHostFileSystemService, 1 /* Delayed */);
export { SYNCED_CUSTOMIZATION_SCHEME, IAgentHostFileSystemService, AgentHostFileSystemService };
