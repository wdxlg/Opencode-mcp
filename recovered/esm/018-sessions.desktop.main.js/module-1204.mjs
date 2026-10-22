// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/mcp/common/mcpWorkbenchManagementService.ts
import { IInstantiationService, refineServiceDecorator } from "./module-0077.mjs";
import { IAllowedMcpServersService, IMcpGalleryService, IMcpManagementService } from "./module-1196.mjs";
import { AbstractMcpManagementService, AbstractMcpResourceManagementService } from "./module-1200.mjs";
import { Emitter } from "./module-0017.mjs";
import { McpManagementChannelClient } from "./module-1201.mjs";
import { MCP_CONFIGURATION_KEY, WORKSPACE_STANDALONE_CONFIGURATIONS } from "./module-1198.mjs";
import { IWorkspaceContextService, isWorkspaceFolder } from "./module-0509.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IRemoteUserDataProfilesService } from "./module-1203.mjs";
import { IFileService } from "./module-0269.mjs";
import { IMcpResourceScannerService } from "./module-1197.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { DisposableStore } from "./module-0012.mjs";


// src/vs/workbench/services/mcp/common/mcpWorkbenchManagementService.ts
var USER_CONFIG_ID = "usrlocal";

var REMOTE_USER_CONFIG_ID = "usrremote";

var WORKSPACE_CONFIG_ID = "workspace";

var WORKSPACE_FOLDER_CONFIG_ID_PREFIX = "ws";

var IWorkbenchMcpManagementService = refineServiceDecorator(IMcpManagementService);

var WorkbenchMcpManagementService = class extends AbstractMcpManagementService {
  constructor(mcpManagementService, allowedMcpServersService, logService, userDataProfileService, uriIdentityService, workspaceContextService, remoteAgentService, userDataProfilesService, remoteUserDataProfilesService, instantiationService) {
    super(allowedMcpServersService, logService);
    this.mcpManagementService = mcpManagementService;
    this.userDataProfileService = userDataProfileService;
    this.uriIdentityService = uriIdentityService;
    this.workspaceContextService = workspaceContextService;
    this.userDataProfilesService = userDataProfilesService;
    this.remoteUserDataProfilesService = remoteUserDataProfilesService;
    this._onInstallMcpServer = this._register(new Emitter());
    this.onInstallMcpServer = this._onInstallMcpServer.event;
    this._onDidInstallMcpServers = this._register(new Emitter());
    this.onDidInstallMcpServers = this._onDidInstallMcpServers.event;
    this._onDidUpdateMcpServers = this._register(new Emitter());
    this.onDidUpdateMcpServers = this._onDidUpdateMcpServers.event;
    this._onUninstallMcpServer = this._register(new Emitter());
    this.onUninstallMcpServer = this._onUninstallMcpServer.event;
    this._onDidUninstallMcpServer = this._register(new Emitter());
    this.onDidUninstallMcpServer = this._onDidUninstallMcpServer.event;
    this._onInstallMcpServerInCurrentProfile = this._register(new Emitter());
    this.onInstallMcpServerInCurrentProfile = this._onInstallMcpServerInCurrentProfile.event;
    this._onDidInstallMcpServersInCurrentProfile = this._register(new Emitter());
    this.onDidInstallMcpServersInCurrentProfile = this._onDidInstallMcpServersInCurrentProfile.event;
    this._onDidUpdateMcpServersInCurrentProfile = this._register(new Emitter());
    this.onDidUpdateMcpServersInCurrentProfile = this._onDidUpdateMcpServersInCurrentProfile.event;
    this._onUninstallMcpServerInCurrentProfile = this._register(new Emitter());
    this.onUninstallMcpServerInCurrentProfile = this._onUninstallMcpServerInCurrentProfile.event;
    this._onDidUninstallMcpServerInCurrentProfile = this._register(new Emitter());
    this.onDidUninstallMcpServerInCurrentProfile = this._onDidUninstallMcpServerInCurrentProfile.event;
    this._onDidChangeProfile = this._register(new Emitter());
    this.onDidChangeProfile = this._onDidChangeProfile.event;
    this.workspaceMcpManagementService = this._register(instantiationService.createInstance(WorkspaceMcpManagementService));
    const remoteAgentConnection = remoteAgentService.getConnection();
    if (remoteAgentConnection) {
      this.remoteMcpManagementService = this._register(instantiationService.createInstance(McpManagementChannelClient, remoteAgentConnection.getChannel("mcpManagement")));
    }
    this._register(this.mcpManagementService.onInstallMcpServer((e4) => {
      this._onInstallMcpServer.fire(e4);
      if (uriIdentityService.extUri.isEqual(e4.mcpResource, this.userDataProfileService.currentProfile.mcpResource)) {
        this._onInstallMcpServerInCurrentProfile.fire({ ...e4, scope: "user" /* User */ });
      }
    }));
    this._register(this.mcpManagementService.onDidInstallMcpServers((e4) => {
      const { mcpServerInstallResult, mcpServerInstallResultInCurrentProfile } = this.createInstallMcpServerResultsFromEvent(e4, "user" /* User */);
      this._onDidInstallMcpServers.fire(mcpServerInstallResult);
      if (mcpServerInstallResultInCurrentProfile.length) {
        this._onDidInstallMcpServersInCurrentProfile.fire(mcpServerInstallResultInCurrentProfile);
      }
    }));
    this._register(this.mcpManagementService.onDidUpdateMcpServers((e4) => {
      const { mcpServerInstallResult, mcpServerInstallResultInCurrentProfile } = this.createInstallMcpServerResultsFromEvent(e4, "user" /* User */);
      this._onDidUpdateMcpServers.fire(mcpServerInstallResult);
      if (mcpServerInstallResultInCurrentProfile.length) {
        this._onDidUpdateMcpServersInCurrentProfile.fire(mcpServerInstallResultInCurrentProfile);
      }
    }));
    this._register(this.mcpManagementService.onUninstallMcpServer((e4) => {
      this._onUninstallMcpServer.fire(e4);
      if (uriIdentityService.extUri.isEqual(e4.mcpResource, this.userDataProfileService.currentProfile.mcpResource)) {
        this._onUninstallMcpServerInCurrentProfile.fire({ ...e4, scope: "user" /* User */ });
      }
    }));
    this._register(this.mcpManagementService.onDidUninstallMcpServer((e4) => {
      this._onDidUninstallMcpServer.fire(e4);
      if (uriIdentityService.extUri.isEqual(e4.mcpResource, this.userDataProfileService.currentProfile.mcpResource)) {
        this._onDidUninstallMcpServerInCurrentProfile.fire({ ...e4, scope: "user" /* User */ });
      }
    }));
    this._register(this.workspaceMcpManagementService.onInstallMcpServer(async (e4) => {
      this._onInstallMcpServer.fire(e4);
      this._onInstallMcpServerInCurrentProfile.fire({ ...e4, scope: "workspace" /* Workspace */ });
    }));
    this._register(this.workspaceMcpManagementService.onDidInstallMcpServers(async (e4) => {
      const { mcpServerInstallResult } = this.createInstallMcpServerResultsFromEvent(e4, "workspace" /* Workspace */);
      this._onDidInstallMcpServers.fire(mcpServerInstallResult);
      this._onDidInstallMcpServersInCurrentProfile.fire(mcpServerInstallResult);
    }));
    this._register(this.workspaceMcpManagementService.onUninstallMcpServer(async (e4) => {
      this._onUninstallMcpServer.fire(e4);
      this._onUninstallMcpServerInCurrentProfile.fire({ ...e4, scope: "workspace" /* Workspace */ });
    }));
    this._register(this.workspaceMcpManagementService.onDidUninstallMcpServer(async (e4) => {
      this._onDidUninstallMcpServer.fire(e4);
      this._onDidUninstallMcpServerInCurrentProfile.fire({ ...e4, scope: "workspace" /* Workspace */ });
    }));
    this._register(this.workspaceMcpManagementService.onDidUpdateMcpServers((e4) => {
      const { mcpServerInstallResult } = this.createInstallMcpServerResultsFromEvent(e4, "workspace" /* Workspace */);
      this._onDidUpdateMcpServers.fire(mcpServerInstallResult);
      this._onDidUpdateMcpServersInCurrentProfile.fire(mcpServerInstallResult);
    }));
    if (this.remoteMcpManagementService) {
      this._register(this.remoteMcpManagementService.onInstallMcpServer(async (e4) => {
        this._onInstallMcpServer.fire(e4);
        const remoteMcpResource = await this.getRemoteMcpResource(this.userDataProfileService.currentProfile.mcpResource);
        if (remoteMcpResource ? uriIdentityService.extUri.isEqual(e4.mcpResource, remoteMcpResource) : this.userDataProfileService.currentProfile.isDefault) {
          this._onInstallMcpServerInCurrentProfile.fire({ ...e4, scope: "remoteUser" /* RemoteUser */ });
        }
      }));
      this._register(this.remoteMcpManagementService.onDidInstallMcpServers((e4) => this.handleRemoteInstallMcpServerResultsFromEvent(e4, this._onDidInstallMcpServers, this._onDidInstallMcpServersInCurrentProfile)));
      this._register(this.remoteMcpManagementService.onDidUpdateMcpServers((e4) => this.handleRemoteInstallMcpServerResultsFromEvent(e4, this._onDidInstallMcpServers, this._onDidInstallMcpServersInCurrentProfile)));
      this._register(this.remoteMcpManagementService.onUninstallMcpServer(async (e4) => {
        this._onUninstallMcpServer.fire(e4);
        const remoteMcpResource = await this.getRemoteMcpResource(this.userDataProfileService.currentProfile.mcpResource);
        if (remoteMcpResource ? uriIdentityService.extUri.isEqual(e4.mcpResource, remoteMcpResource) : this.userDataProfileService.currentProfile.isDefault) {
          this._onUninstallMcpServerInCurrentProfile.fire({ ...e4, scope: "remoteUser" /* RemoteUser */ });
        }
      }));
      this._register(this.remoteMcpManagementService.onDidUninstallMcpServer(async (e4) => {
        this._onDidUninstallMcpServer.fire(e4);
        const remoteMcpResource = await this.getRemoteMcpResource(this.userDataProfileService.currentProfile.mcpResource);
        if (remoteMcpResource ? uriIdentityService.extUri.isEqual(e4.mcpResource, remoteMcpResource) : this.userDataProfileService.currentProfile.isDefault) {
          this._onDidUninstallMcpServerInCurrentProfile.fire({ ...e4, scope: "remoteUser" /* RemoteUser */ });
        }
      }));
    }
    this._register(userDataProfileService.onDidChangeCurrentProfile((e4) => {
      if (!this.uriIdentityService.extUri.isEqual(e4.previous.mcpResource, e4.profile.mcpResource)) {
        this._onDidChangeProfile.fire();
      }
    }));
  }
  createInstallMcpServerResultsFromEvent(e4, scope) {
    const mcpServerInstallResult = [];
    const mcpServerInstallResultInCurrentProfile = [];
    for (const result of e4) {
      const workbenchResult = {
        ...result,
        local: result.local ? this.toWorkspaceMcpServer(result.local, scope) : void 0
      };
      mcpServerInstallResult.push(workbenchResult);
      if (this.uriIdentityService.extUri.isEqual(result.mcpResource, this.userDataProfileService.currentProfile.mcpResource)) {
        mcpServerInstallResultInCurrentProfile.push(workbenchResult);
      }
    }
    return { mcpServerInstallResult, mcpServerInstallResultInCurrentProfile };
  }
  async handleRemoteInstallMcpServerResultsFromEvent(e4, emitter, currentProfileEmitter) {
    const mcpServerInstallResult = [];
    const mcpServerInstallResultInCurrentProfile = [];
    const remoteMcpResource = await this.getRemoteMcpResource(this.userDataProfileService.currentProfile.mcpResource);
    for (const result of e4) {
      const workbenchResult = {
        ...result,
        local: result.local ? this.toWorkspaceMcpServer(result.local, "remoteUser" /* RemoteUser */) : void 0
      };
      mcpServerInstallResult.push(workbenchResult);
      if (remoteMcpResource ? this.uriIdentityService.extUri.isEqual(result.mcpResource, remoteMcpResource) : this.userDataProfileService.currentProfile.isDefault) {
        mcpServerInstallResultInCurrentProfile.push(workbenchResult);
      }
    }
    emitter.fire(mcpServerInstallResult);
    if (mcpServerInstallResultInCurrentProfile.length) {
      currentProfileEmitter.fire(mcpServerInstallResultInCurrentProfile);
    }
  }
  async getInstalled() {
    const installed = [];
    const [userServers, remoteServers, workspaceServers] = await Promise.all([
      this.mcpManagementService.getInstalled(this.userDataProfileService.currentProfile.mcpResource),
      this.remoteMcpManagementService?.getInstalled(await this.getRemoteMcpResource()) ?? Promise.resolve([]),
      this.workspaceMcpManagementService?.getInstalled() ?? Promise.resolve([])
    ]);
    for (const server of userServers) {
      installed.push(this.toWorkspaceMcpServer(server, "user" /* User */));
    }
    for (const server of remoteServers) {
      installed.push(this.toWorkspaceMcpServer(server, "remoteUser" /* RemoteUser */));
    }
    for (const server of workspaceServers) {
      installed.push(this.toWorkspaceMcpServer(server, "workspace" /* Workspace */));
    }
    return installed;
  }
  toWorkspaceMcpServer(server, scope) {
    return { ...server, id: `mcp.config.${this.getConfigId(server, scope)}.${server.name}`, scope };
  }
  getConfigId(server, scope) {
    if (scope === "user" /* User */) {
      return USER_CONFIG_ID;
    }
    if (scope === "remoteUser" /* RemoteUser */) {
      return REMOTE_USER_CONFIG_ID;
    }
    if (scope === "workspace" /* Workspace */) {
      const workspace = this.workspaceContextService.getWorkspace();
      if (workspace.configuration && this.uriIdentityService.extUri.isEqual(workspace.configuration, server.mcpResource)) {
        return WORKSPACE_CONFIG_ID;
      }
      const workspaceFolders = workspace.folders;
      for (let index2 = 0; index2 < workspaceFolders.length; index2++) {
        const workspaceFolder = workspaceFolders[index2];
        if (this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.joinPath(workspaceFolder.uri, WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY]), server.mcpResource)) {
          return `${WORKSPACE_FOLDER_CONFIG_ID_PREFIX}${index2}`;
        }
      }
    }
    return "unknown";
  }
  async install(server, options3) {
    options3 = options3 ?? {};
    if (options3.target === 5 /* WORKSPACE */ || isWorkspaceFolder(options3.target)) {
      const mcpResource = options3.target === 5 /* WORKSPACE */ ? this.workspaceContextService.getWorkspace().configuration : options3.target.toResource(WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY]);
      if (!mcpResource) {
        throw new Error(`Illegal target: ${options3.target}`);
      }
      options3.mcpResource = mcpResource;
      const result2 = await this.workspaceMcpManagementService.install(server, options3);
      return this.toWorkspaceMcpServer(result2, "workspace" /* Workspace */);
    }
    if (options3.target === 4 /* USER_REMOTE */) {
      if (!this.remoteMcpManagementService) {
        throw new Error(`Illegal target: ${options3.target}`);
      }
      options3.mcpResource = await this.getRemoteMcpResource(options3.mcpResource);
      const result2 = await this.remoteMcpManagementService.install(server, options3);
      return this.toWorkspaceMcpServer(result2, "remoteUser" /* RemoteUser */);
    }
    if (options3.target && options3.target !== 2 /* USER */ && options3.target !== 3 /* USER_LOCAL */) {
      throw new Error(`Illegal target: ${options3.target}`);
    }
    options3.mcpResource = this.userDataProfileService.currentProfile.mcpResource;
    const result = await this.mcpManagementService.install(server, options3);
    return this.toWorkspaceMcpServer(result, "user" /* User */);
  }
  async installFromGallery(server, options3) {
    options3 = options3 ?? {};
    if (options3.target === 5 /* WORKSPACE */ || isWorkspaceFolder(options3.target)) {
      const mcpResource = options3.target === 5 /* WORKSPACE */ ? this.workspaceContextService.getWorkspace().configuration : options3.target.toResource(WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY]);
      if (!mcpResource) {
        throw new Error(`Illegal target: ${options3.target}`);
      }
      options3.mcpResource = mcpResource;
      const result2 = await this.workspaceMcpManagementService.installFromGallery(server, options3);
      return this.toWorkspaceMcpServer(result2, "workspace" /* Workspace */);
    }
    if (options3.target === 4 /* USER_REMOTE */) {
      if (!this.remoteMcpManagementService) {
        throw new Error(`Illegal target: ${options3.target}`);
      }
      options3.mcpResource = await this.getRemoteMcpResource(options3.mcpResource);
      const result2 = await this.remoteMcpManagementService.installFromGallery(server, options3);
      return this.toWorkspaceMcpServer(result2, "remoteUser" /* RemoteUser */);
    }
    if (options3.target && options3.target !== 2 /* USER */ && options3.target !== 3 /* USER_LOCAL */) {
      throw new Error(`Illegal target: ${options3.target}`);
    }
    if (!options3.mcpResource) {
      options3.mcpResource = this.userDataProfileService.currentProfile.mcpResource;
    }
    const result = await this.mcpManagementService.installFromGallery(server, options3);
    return this.toWorkspaceMcpServer(result, "user" /* User */);
  }
  async updateMetadata(local, server, profileLocation) {
    if (local.scope === "workspace" /* Workspace */) {
      const result2 = await this.workspaceMcpManagementService.updateMetadata(local, server, profileLocation);
      return this.toWorkspaceMcpServer(result2, "workspace" /* Workspace */);
    }
    if (local.scope === "remoteUser" /* RemoteUser */) {
      if (!this.remoteMcpManagementService) {
        throw new Error(`Illegal target: ${local.scope}`);
      }
      const result2 = await this.remoteMcpManagementService.updateMetadata(local, server, profileLocation);
      return this.toWorkspaceMcpServer(result2, "remoteUser" /* RemoteUser */);
    }
    const result = await this.mcpManagementService.updateMetadata(local, server, profileLocation);
    return this.toWorkspaceMcpServer(result, "user" /* User */);
  }
  async uninstall(server) {
    if (server.scope === "workspace" /* Workspace */) {
      return this.workspaceMcpManagementService.uninstall(server);
    }
    if (server.scope === "remoteUser" /* RemoteUser */) {
      if (!this.remoteMcpManagementService) {
        throw new Error(`Illegal target: ${server.scope}`);
      }
      return this.remoteMcpManagementService.uninstall(server);
    }
    return this.mcpManagementService.uninstall(server, { mcpResource: this.userDataProfileService.currentProfile.mcpResource });
  }
  async getRemoteMcpResource(mcpResource) {
    if (!mcpResource && this.userDataProfileService.currentProfile.isDefault) {
      return void 0;
    }
    mcpResource = mcpResource ?? this.userDataProfileService.currentProfile.mcpResource;
    let profile = this.userDataProfilesService.profiles.find((p) => this.uriIdentityService.extUri.isEqual(p.mcpResource, mcpResource));
    if (profile) {
      profile = await this.remoteUserDataProfilesService.getRemoteProfile(profile);
    } else {
      profile = (await this.remoteUserDataProfilesService.getRemoteProfiles()).find((p) => this.uriIdentityService.extUri.isEqual(p.mcpResource, mcpResource));
    }
    return profile?.mcpResource;
  }
};

WorkbenchMcpManagementService = __decorateClass([
  __decorateParam(1, IAllowedMcpServersService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IRemoteAgentService),
  __decorateParam(7, IUserDataProfilesService),
  __decorateParam(8, IRemoteUserDataProfilesService),
  __decorateParam(9, IInstantiationService)
], WorkbenchMcpManagementService);

var WorkspaceMcpResourceManagementService = class extends AbstractMcpResourceManagementService {
  constructor(mcpResource, target, mcpGalleryService, fileService, uriIdentityService, logService, mcpResourceScannerService, allowedMcpServersService) {
    super(mcpResource, target, mcpGalleryService, fileService, uriIdentityService, logService, mcpResourceScannerService, allowedMcpServersService);
  }
  async installFromGallery(server, options3) {
    this.logService.trace("MCP Management Service: installGallery", server.name, server.galleryUrl);
    this._onInstallMcpServer.fire({ name: server.name, mcpResource: this.mcpResource });
    try {
      const packageType = options3?.packageType ?? server.configuration.packages?.[0]?.registryType ?? "remote" /* REMOTE */;
      const { mcpServerConfiguration, notices } = this.getMcpServerConfigurationFromManifest(server.configuration, packageType);
      if (notices.length > 0) {
        this.logService.warn(`MCP Management Service: Warnings while installing ${server.name}`, notices);
      }
      const installable = {
        name: server.name,
        config: {
          ...mcpServerConfiguration.config,
          gallery: server.galleryUrl ?? true,
          version: server.version
        },
        inputs: mcpServerConfiguration.inputs
      };
      this.ensureServerAllowed(installable);
      await this.mcpResourceScannerService.addMcpServers([installable], this.mcpResource, this.target);
      await this.updateLocal(server);
      const local = (await this.getInstalled()).find((s) => s.name === server.name);
      if (!local) {
        throw new Error(`Failed to install MCP server: ${server.name}`);
      }
      return local;
    } catch (e4) {
      this._onDidInstallMcpServers.fire([{ name: server.name, source: server, error: e4, mcpResource: this.mcpResource }]);
      throw e4;
    }
  }
  updateMetadata() {
    throw new Error("Not supported");
  }
  installFromUri() {
    throw new Error("Not supported");
  }
  async getLocalServerInfo(name, mcpServerConfig) {
    if (!mcpServerConfig.gallery) {
      return void 0;
    }
    const [mcpServer] = await this.mcpGalleryService.getMcpServersFromGallery([{ name }]);
    if (!mcpServer) {
      return void 0;
    }
    return {
      name: mcpServer.name,
      version: mcpServerConfig.version,
      displayName: mcpServer.displayName,
      description: mcpServer.description,
      galleryUrl: mcpServer.galleryUrl,
      manifest: mcpServer.configuration,
      publisher: mcpServer.publisher,
      publisherDisplayName: mcpServer.publisherDisplayName,
      repositoryUrl: mcpServer.repositoryUrl,
      icon: mcpServer.icon
    };
  }
  canInstall(server) {
    throw new Error("Not supported");
  }
};

WorkspaceMcpResourceManagementService = __decorateClass([
  __decorateParam(2, IMcpGalleryService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IMcpResourceScannerService),
  __decorateParam(7, IAllowedMcpServersService)
], WorkspaceMcpResourceManagementService);

var WorkspaceMcpManagementService = class extends AbstractMcpManagementService {
  constructor(allowedMcpServersService, uriIdentityService, logService, workspaceContextService, instantiationService) {
    super(allowedMcpServersService, logService);
    this.uriIdentityService = uriIdentityService;
    this.workspaceContextService = workspaceContextService;
    this.instantiationService = instantiationService;
    this._onInstallMcpServer = this._register(new Emitter());
    this.onInstallMcpServer = this._onInstallMcpServer.event;
    this._onDidInstallMcpServers = this._register(new Emitter());
    this.onDidInstallMcpServers = this._onDidInstallMcpServers.event;
    this._onDidUpdateMcpServers = this._register(new Emitter());
    this.onDidUpdateMcpServers = this._onDidUpdateMcpServers.event;
    this._onUninstallMcpServer = this._register(new Emitter());
    this.onUninstallMcpServer = this._onUninstallMcpServer.event;
    this._onDidUninstallMcpServer = this._register(new Emitter());
    this.onDidUninstallMcpServer = this._onDidUninstallMcpServer.event;
    this.allMcpServers = [];
    this.workspaceMcpManagementServices = new ResourceMap();
    this.initialize();
  }
  async initialize() {
    try {
      await this.onDidChangeWorkbenchState();
      await this.onDidChangeWorkspaceFolders({ added: this.workspaceContextService.getWorkspace().folders, removed: [], changed: [] });
      this._register(this.workspaceContextService.onDidChangeWorkspaceFolders((e4) => this.onDidChangeWorkspaceFolders(e4)));
      this._register(this.workspaceContextService.onDidChangeWorkbenchState((e4) => this.onDidChangeWorkbenchState()));
    } catch (error) {
      this.logService.error("Failed to initialize workspace folders", error);
    }
  }
  async onDidChangeWorkbenchState() {
    if (this.workspaceConfiguration) {
      await this.removeWorkspaceService(this.workspaceConfiguration);
    }
    this.workspaceConfiguration = this.workspaceContextService.getWorkspace().configuration;
    if (this.workspaceConfiguration) {
      await this.addWorkspaceService(this.workspaceConfiguration, 5 /* WORKSPACE */);
    }
  }
  async onDidChangeWorkspaceFolders(e4) {
    try {
      await Promise.allSettled(e4.removed.map((folder) => this.removeWorkspaceService(folder.toResource(WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY]))));
    } catch (error) {
      this.logService.error(error);
    }
    try {
      await Promise.allSettled(e4.added.map((folder) => this.addWorkspaceService(folder.toResource(WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY]), 6 /* WORKSPACE_FOLDER */)));
    } catch (error) {
      this.logService.error(error);
    }
  }
  async addWorkspaceService(mcpResource, target) {
    if (this.workspaceMcpManagementServices.has(mcpResource)) {
      return;
    }
    const disposables = new DisposableStore();
    const service = disposables.add(this.instantiationService.createInstance(WorkspaceMcpResourceManagementService, mcpResource, target));
    try {
      const installedServers = await service.getInstalled();
      this.allMcpServers.push(...installedServers);
      if (installedServers.length > 0) {
        const installResults = installedServers.map((server) => ({
          name: server.name,
          local: server,
          mcpResource: server.mcpResource
        }));
        this._onDidInstallMcpServers.fire(installResults);
      }
    } catch (error) {
      this.logService.warn("Failed to get installed servers from", mcpResource.toString(), error);
    }
    disposables.add(service.onInstallMcpServer((e4) => this._onInstallMcpServer.fire(e4)));
    disposables.add(service.onDidInstallMcpServers((e4) => {
      for (const { local } of e4) {
        if (local) {
          this.allMcpServers.push(local);
        }
      }
      this._onDidInstallMcpServers.fire(e4);
    }));
    disposables.add(service.onDidUpdateMcpServers((e4) => {
      for (const { local, mcpResource: mcpResource2 } of e4) {
        if (local) {
          const index2 = this.allMcpServers.findIndex((server) => this.uriIdentityService.extUri.isEqual(server.mcpResource, mcpResource2) && server.name === local.name);
          if (index2 !== -1) {
            this.allMcpServers.splice(index2, 1, local);
          }
        }
      }
      this._onDidUpdateMcpServers.fire(e4);
    }));
    disposables.add(service.onUninstallMcpServer((e4) => this._onUninstallMcpServer.fire(e4)));
    disposables.add(service.onDidUninstallMcpServer((e4) => {
      const index2 = this.allMcpServers.findIndex((server) => this.uriIdentityService.extUri.isEqual(server.mcpResource, e4.mcpResource) && server.name === e4.name);
      if (index2 !== -1) {
        this.allMcpServers.splice(index2, 1);
        this._onDidUninstallMcpServer.fire(e4);
      }
    }));
    this.workspaceMcpManagementServices.set(mcpResource, { service, dispose: () => disposables.dispose() });
  }
  async removeWorkspaceService(mcpResource) {
    const serviceItem = this.workspaceMcpManagementServices.get(mcpResource);
    if (serviceItem) {
      try {
        const installedServers = await serviceItem.service.getInstalled();
        this.allMcpServers = this.allMcpServers.filter((server) => !installedServers.some((uninstalled) => this.uriIdentityService.extUri.isEqual(uninstalled.mcpResource, server.mcpResource)));
        for (const server of installedServers) {
          this._onDidUninstallMcpServer.fire({
            name: server.name,
            mcpResource: server.mcpResource
          });
        }
      } catch (error) {
        this.logService.warn("Failed to get installed servers from", mcpResource.toString(), error);
      }
      this.workspaceMcpManagementServices.delete(mcpResource);
      serviceItem.dispose();
    }
  }
  async getInstalled() {
    return this.allMcpServers;
  }
  async install(server, options3) {
    if (!options3?.mcpResource) {
      throw new Error("MCP resource is required");
    }
    const mcpManagementServiceItem = this.workspaceMcpManagementServices.get(options3?.mcpResource);
    if (!mcpManagementServiceItem) {
      throw new Error(`No MCP management service found for resource: ${options3?.mcpResource.toString()}`);
    }
    return mcpManagementServiceItem.service.install(server, options3);
  }
  async uninstall(server, options3) {
    const mcpResource = server.mcpResource;
    const mcpManagementServiceItem = this.workspaceMcpManagementServices.get(mcpResource);
    if (!mcpManagementServiceItem) {
      throw new Error(`No MCP management service found for resource: ${mcpResource.toString()}`);
    }
    return mcpManagementServiceItem.service.uninstall(server, options3);
  }
  installFromGallery(gallery, options3) {
    if (!options3?.mcpResource) {
      throw new Error("MCP resource is required");
    }
    const mcpManagementServiceItem = this.workspaceMcpManagementServices.get(options3?.mcpResource);
    if (!mcpManagementServiceItem) {
      throw new Error(`No MCP management service found for resource: ${options3?.mcpResource.toString()}`);
    }
    return mcpManagementServiceItem.service.installFromGallery(gallery, options3);
  }
  updateMetadata() {
    throw new Error("Not supported");
  }
  dispose() {
    this.workspaceMcpManagementServices.forEach((service) => service.dispose());
    this.workspaceMcpManagementServices.clear();
    super.dispose();
  }
};

WorkspaceMcpManagementService = __decorateClass([
  __decorateParam(0, IAllowedMcpServersService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IInstantiationService)
], WorkspaceMcpManagementService);
export { USER_CONFIG_ID, REMOTE_USER_CONFIG_ID, WORKSPACE_CONFIG_ID, WORKSPACE_FOLDER_CONFIG_ID_PREFIX, IWorkbenchMcpManagementService, WorkbenchMcpManagementService, WorkspaceMcpResourceManagementService, WorkspaceMcpManagementService };
