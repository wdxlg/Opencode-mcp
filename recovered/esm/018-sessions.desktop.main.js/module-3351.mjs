// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/mcpProfileResource.ts
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { localize } from "./module-0001.mjs";
import { API_OPEN_EDITOR_COMMAND_ID } from "./module-1530.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/services/userDataProfile/browser/mcpProfileResource.ts
var McpResourceInitializer = class {
  constructor(userDataProfileService, fileService, logService) {
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.logService = logService;
  }
  async initialize(content) {
    const mcpContent = JSON.parse(content);
    if (!mcpContent.mcp) {
      this.logService.info(`Initializing Profile: No MCP servers to apply...`);
      return;
    }
    await this.fileService.writeFile(this.userDataProfileService.currentProfile.mcpResource, VSBuffer.fromString(mcpContent.mcp));
  }
};

McpResourceInitializer = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService)
], McpResourceInitializer);

var McpProfileResource = class {
  constructor(fileService, logService) {
    this.fileService = fileService;
    this.logService = logService;
  }
  async getContent(profile) {
    const mcpContent = await this.getMcpResourceContent(profile);
    return JSON.stringify(mcpContent);
  }
  async getMcpResourceContent(profile) {
    const mcpContent = await this.getMcpContent(profile);
    return { mcp: mcpContent };
  }
  async apply(content, profile) {
    const mcpContent = JSON.parse(content);
    if (!mcpContent.mcp) {
      this.logService.info(`Importing Profile (${profile.name}): No MCP servers to apply...`);
      return;
    }
    await this.fileService.writeFile(profile.mcpResource, VSBuffer.fromString(mcpContent.mcp));
  }
  async getMcpContent(profile) {
    try {
      const content = await this.fileService.readFile(profile.mcpResource);
      return content.value.toString();
    } catch (error) {
      if (error instanceof FileOperationError && error.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
        return null;
      } else {
        throw error;
      }
    }
  }
};

McpProfileResource = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILogService)
], McpProfileResource);

var McpResourceTreeItem = class {
  constructor(profile, uriIdentityService, instantiationService) {
    this.profile = profile;
    this.uriIdentityService = uriIdentityService;
    this.instantiationService = instantiationService;
    this.type = "mcp" /* Mcp */;
    this.handle = "mcp" /* Mcp */;
    this.label = { label: localize(23622, null) };
    this.collapsibleState = 2 /* Expanded */;
  }
  async getChildren() {
    return [{
      handle: this.profile.mcpResource.toString(),
      resourceUri: this.profile.mcpResource,
      collapsibleState: 0 /* None */,
      parent: this,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(this.profile.mcpResource)
      },
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [this.profile.mcpResource, void 0, void 0]
      }
    }];
  }
  async hasContent() {
    const mcpContent = await this.instantiationService.createInstance(McpProfileResource).getMcpResourceContent(this.profile);
    return mcpContent.mcp !== null;
  }
  async getContent() {
    return this.instantiationService.createInstance(McpProfileResource).getContent(this.profile);
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.mcp;
  }
};

McpResourceTreeItem = __decorateClass([
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IInstantiationService)
], McpResourceTreeItem);
export { McpResourceInitializer, McpProfileResource, McpResourceTreeItem };
