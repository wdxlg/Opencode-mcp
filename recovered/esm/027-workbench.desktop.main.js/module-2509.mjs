// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/customizationMigrationServiceImpl.ts
import { isAgentHostSessionResource } from "./module-0960.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { getCustomizationMigrationTargetType, isPromptFileMigrationCandidate, isUserDataMigrationCandidate } from "./module-2508.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { ICustomizationHarnessService } from "./module-1031.mjs";
import { IAgentHostActiveClientService } from "./module-2123.mjs";
import { IAgentHostCustomizationService } from "./module-2131.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/customizationMigrationServiceImpl.ts
var CustomizationMigrationService = class {
  constructor(promptsService, customizationHarnessService, activeClientService, agentHostCustomizationService) {
    this.promptsService = promptsService;
    this.customizationHarnessService = customizationHarnessService;
    this.activeClientService = activeClientService;
    this.agentHostCustomizationService = agentHostCustomizationService;
  }
  async computeMigration(sessionResource, type) {
    if (!isAgentHostSessionResource(sessionResource)) {
      return type === "mcpServers" /* McpServers */ ? this.emptyMcpServerMigration() : { type, files: [], candidates: [] };
    }
    switch (type) {
      case "userData" /* UserData */: {
        const customizations = (await Promise.all([
          this.promptsService.listPromptFiles("agent" /* agent */, CancellationToken.None),
          this.promptsService.listPromptFiles("instructions" /* instructions */, CancellationToken.None)
        ])).flat();
        return this.createFileMigration(sessionResource, type, customizations.filter(isUserDataMigrationCandidate));
      }
      case "promptFiles" /* PromptFiles */: {
        const customizations = await this.promptsService.listPromptFiles("prompt" /* prompt */, CancellationToken.None);
        return this.createFileMigration(sessionResource, type, customizations.filter(isPromptFileMigrationCandidate));
      }
      case "mcpServers" /* McpServers */:
        return this.computeMcpServerMigration(sessionResource);
    }
  }
  async computeMigrations(sessionResource) {
    return Promise.all([
      this.computeMigration(sessionResource, "userData" /* UserData */),
      this.computeMigration(sessionResource, "promptFiles" /* PromptFiles */),
      this.computeMigration(sessionResource, "mcpServers" /* McpServers */)
    ]);
  }
  async computeMigrationHint(sessionResource) {
    const harness = this.customizationHarnessService.findHarnessById(getChatSessionType(sessionResource));
    if (!harness) {
      return void 0;
    }
    const [userDataMigration, promptFilesMigration, mcpServerMigration] = await Promise.all([
      this.computeMigration(sessionResource, "userData" /* UserData */),
      this.computeMigration(sessionResource, "promptFiles" /* PromptFiles */),
      this.computeMigration(sessionResource, "mcpServers" /* McpServers */)
    ]);
    const fileCount = userDataMigration.files.length + promptFilesMigration.files.length;
    const unsupportedMcpServerCount = mcpServerMigration.servers.filter((server) => !server.supported).length;
    const fileHint = fileCount === 0 ? void 0 : fileCount === 1 ? localize(9637, null, harness.label) : localize(9636, null, fileCount, harness.label);
    const mcpHint = unsupportedMcpServerCount === 0 ? void 0 : unsupportedMcpServerCount === 1 ? localize(9635, null, harness.label) : localize(9634, null, unsupportedMcpServerCount, harness.label);
    if (fileHint && mcpHint) {
      return localize(9633, null, fileHint, mcpHint);
    }
    return fileHint ?? mcpHint;
  }
  async createFileMigration(sessionResource, type, candidates) {
    const provider = this.customizationHarnessService.findHarnessById(getChatSessionType(sessionResource))?.itemProvider;
    if (!provider?.provideSourceFolders) {
      return { type, files: [], candidates: [] };
    }
    const targetTypes = new Set(candidates.map(getCustomizationMigrationTargetType));
    const sourceFolders = /* @__PURE__ */ new Map();
    for (const targetType of targetTypes) {
      const folders = await provider.provideSourceFolders(sessionResource, targetType, CancellationToken.None);
      sourceFolders.set(targetType, folders ?? []);
    }
    const filteredCandidates = candidates.filter((customization) => {
      const targetType = getCustomizationMigrationTargetType(customization);
      return sourceFolders.get(targetType)?.some((folder) => folder.source === customization.storage) === true;
    });
    return { type, files: filteredCandidates.map((customization) => customization.uri), candidates: filteredCandidates };
  }
  async computeMcpServerMigration(sessionResource) {
    const roots = this.agentHostCustomizationService.getWorkingDirectories(sessionResource).map((path) => URI.file(path));
    const scope = this.activeClientService.acquireMcpServerSupportScope(getChatSessionType(sessionResource), roots);
    if (!scope) {
      return this.emptyMcpServerMigration();
    }
    try {
      await scope.whenResolved();
      const snapshot = scope.support.get();
      return {
        type: "mcpServers" /* McpServers */,
        servers: snapshot.servers.filter((server) => server.applicability !== "outsideCurrentScope" /* OutsideCurrentScope */).map((server) => ({
          id: server.id,
          name: server.name,
          supported: server.compatibility.kind === "supported"
        })),
        discoveryComplete: snapshot.discoveryComplete,
        coverage: snapshot.coverage
      };
    } finally {
      scope.dispose();
    }
  }
  emptyMcpServerMigration() {
    return {
      type: "mcpServers" /* McpServers */,
      servers: [],
      discoveryComplete: true,
      coverage: {
        restrictedByMcpAccess: false,
        restrictedByCustomizationPolicy: false
      }
    };
  }
};

CustomizationMigrationService = __decorateClass([
  __decorateParam(0, IPromptsService),
  __decorateParam(1, ICustomizationHarnessService),
  __decorateParam(2, IAgentHostActiveClientService),
  __decorateParam(3, IAgentHostCustomizationService)
], CustomizationMigrationService);
export { CustomizationMigrationService };
