// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpWorkbenchService.ts
import { isBoolean, isNumber, isObject, isString, isStringArray } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAllowedMcpServersService, IMcpGalleryService, mcpAccessConfig } from "./module-1196.mjs";
import { IFileService } from "./module-0269.mjs";
import { Disposable } from "./module-0012.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { runOnChange } from "./module-0064.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString, createCommandUri } from "./module-0462.mjs";
import { IWorkbenchMcpManagementService, REMOTE_USER_CONFIG_ID, USER_CONFIG_ID, WORKSPACE_CONFIG_ID, WORKSPACE_FOLDER_CONFIG_ID_PREFIX } from "./module-1204.mjs";
import { Schemas } from "./module-0033.mjs";
import { basename2 } from "./module-0034.mjs";
import { mcpConfigurationSection } from "./module-1420.mjs";
import { MCP_CONFIGURATION_KEY, WORKSPACE_STANDALONE_CONFIGURATIONS } from "./module-1198.mjs";
import { McpServerEditorInput } from "./module-2882.mjs";
import { ACTIVE_GROUP, IEditorService, MODAL_GROUP } from "./module-0935.mjs";
import { severity_default } from "./module-0266.mjs";
import { IMcpGalleryManifestService } from "./module-1195.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IProductService } from "./module-0875.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { HasInstalledMcpServersContext, IMcpService, IMcpWorkbenchService, McpServersGalleryStatusContext } from "./module-1206.mjs";
import { IURLService } from "./module-1285.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpWorkbenchService.ts
function parseMcpInstallUriPayload(query) {
  let parsed;
  try {
    parsed = JSON.parse(decodeURIComponent(query));
  } catch {
    return void 0;
  }
  if (!isObject(parsed)) {
    return void 0;
  }
  const payload = parsed;
  if (!isString(payload.name) || !payload.name) {
    return void 0;
  }
  const config = sanitizeMcpServerConfiguration(payload);
  if (!config) {
    return void 0;
  }
  return {
    name: payload.name,
    config,
    inputs: Array.isArray(payload.inputs) ? payload.inputs : void 0
  };
}

function sanitizeMcpServerConfiguration(payload) {
  const type = payload.type === "stdio" /* LOCAL */ || payload.type === "http" /* REMOTE */ ? payload.type : isString(payload.command) ? "stdio" /* LOCAL */ : "http" /* REMOTE */;
  const dev = sanitizeMcpDevModeConfig(payload.dev);
  const common = {
    ...isString(payload.version) ? { version: payload.version } : {},
    ...isBoolean(payload.gallery) || isString(payload.gallery) ? { gallery: payload.gallery } : {},
    ...dev ? { dev } : {}
  };
  if (type === "stdio" /* LOCAL */) {
    if (!isString(payload.command)) {
      return void 0;
    }
    const env2 = sanitizeMcpEnvironment(payload.env);
    return {
      type,
      command: payload.command,
      ...common,
      ...isStringArray(payload.args) ? { args: payload.args } : {},
      ...env2 ? { env: env2 } : {},
      ...isString(payload.envFile) ? { envFile: payload.envFile } : {},
      ...isString(payload.cwd) ? { cwd: payload.cwd } : {},
      ...isBoolean(payload.sandboxEnabled) ? { sandboxEnabled: payload.sandboxEnabled } : {}
    };
  }
  if (!isString(payload.url)) {
    return void 0;
  }
  const headers = sanitizeStringRecord(payload.headers);
  const oauth = sanitizeMcpOAuthConfiguration(payload.oauth);
  return {
    type,
    url: payload.url,
    ...common,
    ...payload.transport === "http" || payload.transport === "sse" ? { transport: payload.transport } : {},
    ...headers ? { headers } : {},
    ...oauth ? { oauth } : {}
  };
}

function sanitizeMcpDevModeConfig(value2) {
  if (!isObject(value2)) {
    return void 0;
  }
  const payload = value2;
  const debug = sanitizeMcpDevModeDebugConfiguration(payload.debug);
  if (!isString(payload.watch) && !isStringArray(payload.watch) && !debug) {
    return void 0;
  }
  return {
    ...isString(payload.watch) || isStringArray(payload.watch) ? { watch: payload.watch } : {},
    ...debug ? { debug } : {}
  };
}

function sanitizeMcpDevModeDebugConfiguration(value2) {
  if (!isObject(value2)) {
    return void 0;
  }
  const payload = value2;
  if (payload.type === "node") {
    return { type: "node" };
  }
  if (payload.type === "debugpy") {
    return {
      type: "debugpy",
      ...isString(payload.debugpyPath) ? { debugpyPath: payload.debugpyPath } : {}
    };
  }
  return void 0;
}

function sanitizeMcpEnvironment(value2) {
  return sanitizeRecord(value2, (entry) => entry === null || isString(entry) || isNumber(entry));
}

function sanitizeStringRecord(value2) {
  return sanitizeRecord(value2, isString);
}

function sanitizeRecord(value2, isValidValue) {
  if (!isObject(value2)) {
    return void 0;
  }
  return Object.fromEntries(Object.entries(value2).filter((entry) => isValidValue(entry[1])));
}

function sanitizeMcpOAuthConfiguration(value2) {
  if (!isObject(value2)) {
    return void 0;
  }
  const payload = value2;
  return isString(payload.clientId) ? { clientId: payload.clientId } : void 0;
}

var McpWorkbenchServer = class {
  constructor(installStateProvider, runtimeStateProvider, local, gallery, installable, mcpGalleryService, fileService) {
    this.installStateProvider = installStateProvider;
    this.runtimeStateProvider = runtimeStateProvider;
    this.local = local;
    this.gallery = gallery;
    this.installable = installable;
    this.mcpGalleryService = mcpGalleryService;
    this.fileService = fileService;
    this.local = local;
  }
  get id() {
    return this.local?.id ?? this.gallery?.name ?? this.installable?.name ?? this.name;
  }
  get name() {
    return this.gallery?.name ?? this.local?.name ?? this.installable?.name ?? "";
  }
  get label() {
    return this.gallery?.displayName ?? this.local?.displayName ?? this.local?.name ?? this.installable?.name ?? "";
  }
  get icon() {
    return this.gallery?.icon ?? this.local?.icon;
  }
  get installState() {
    return this.installStateProvider(this);
  }
  get codicon() {
    return this.gallery?.codicon ?? this.local?.codicon;
  }
  get publisherDisplayName() {
    return this.gallery?.publisherDisplayName ?? this.local?.publisherDisplayName ?? this.gallery?.publisher ?? this.local?.publisher;
  }
  get publisherUrl() {
    return this.gallery?.publisherDomain?.link;
  }
  get description() {
    return this.gallery?.description ?? this.local?.description ?? "";
  }
  get starsCount() {
    return this.gallery?.starsCount ?? 0;
  }
  get license() {
    return this.gallery?.license;
  }
  get repository() {
    return this.gallery?.repositoryUrl;
  }
  get config() {
    return this.local?.config ?? this.installable?.config;
  }
  get runtimeStatus() {
    return this.runtimeStateProvider(this);
  }
  get readmeUrl() {
    return this.local?.readmeUrl ?? (this.gallery?.readmeUrl ? URI.parse(this.gallery.readmeUrl) : void 0);
  }
  async getReadme(token) {
    if (this.local?.readmeUrl) {
      const content = await this.fileService.readFile(this.local.readmeUrl);
      return content.value.toString();
    }
    if (this.gallery?.readme) {
      return this.gallery.readme;
    }
    if (this.gallery?.readmeUrl) {
      return this.mcpGalleryService.getReadme(this.gallery, token);
    }
    return Promise.reject(new Error("not available"));
  }
  async getManifest(token) {
    if (this.local?.manifest) {
      return this.local.manifest;
    }
    if (this.gallery) {
      return this.gallery.configuration;
    }
    throw new Error("No manifest available");
  }
};

McpWorkbenchServer = __decorateClass([
  __decorateParam(5, IMcpGalleryService),
  __decorateParam(6, IFileService)
], McpWorkbenchServer);

var McpWorkbenchService = class extends Disposable {
  constructor(mcpGalleryManifestService, mcpGalleryService, mcpManagementService, editorService, userDataProfilesService, uriIdentityService, workspaceService, environmentService, labelService, productService, remoteAgentService, configurationService, instantiationService, telemetryService, logService, extensionsWorkbenchService, allowedMcpServersService, mcpService, urlService) {
    super();
    this.mcpGalleryService = mcpGalleryService;
    this.mcpManagementService = mcpManagementService;
    this.editorService = editorService;
    this.userDataProfilesService = userDataProfilesService;
    this.uriIdentityService = uriIdentityService;
    this.workspaceService = workspaceService;
    this.environmentService = environmentService;
    this.labelService = labelService;
    this.productService = productService;
    this.remoteAgentService = remoteAgentService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.allowedMcpServersService = allowedMcpServersService;
    this.mcpService = mcpService;
    this.installing = [];
    this.uninstalling = [];
    this._local = [];
    this.registrySyncGeneration = 0;
    this.registryGeneration = 0;
    this.localQueryGeneration = 0;
    this.profileChangeGeneration = 0;
    // Source identity is intentionally trusted only in-process; IPC copies are re-verified.
    this.gallerySourceGenerations = /* @__PURE__ */ new WeakMap();
    this.registrySyncDelayer = this._register(new ThrottledDelayer(0));
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this._onReset = this._register(new Emitter());
    this.onReset = this._onReset.event;
    this._register(this.mcpManagementService.onDidInstallMcpServersInCurrentProfile((e4) => this.onDidInstallMcpServers(e4)));
    this._register(this.mcpManagementService.onDidUpdateMcpServersInCurrentProfile((e4) => this.onDidUpdateMcpServers(e4)));
    this._register(this.mcpManagementService.onDidUninstallMcpServerInCurrentProfile((e4) => this.onDidUninstallMcpServer(e4)));
    this._register(this.mcpManagementService.onDidChangeProfile((e4) => this.onDidChangeProfile()));
    this.whenInitialLocalMcpServersLoaded = this.queryLocal().then(() => {
      if (this._store.isDisposed) {
        return;
      }
      this._register(mcpGalleryManifestService.onDidChangeMcpGalleryManifest(() => {
        this.invalidateRegistryVerification();
        this.scheduleRegistrySync();
      }));
      this.scheduleRegistrySync();
    }, (error) => this.logService.error(error));
    urlService.registerHandler(this);
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(mcpAccessConfig)) {
        this._onChange.fire(void 0);
      }
    }));
    this._register(this.allowedMcpServersService.onDidChangeAllowedMcpServers(() => {
      this._local = this.sort(this._local);
      this._onChange.fire(void 0);
    }));
    this._register(runOnChange(mcpService.servers, () => {
      this._local = this.sort(this._local);
      this._onChange.fire(void 0);
    }));
    this._register(autorun((reader) => {
      for (const server of mcpService.servers.read(reader)) {
        server.enablement.read(reader);
      }
      this._onChange.fire(void 0);
    }));
  }
  get local() {
    return [...this._local];
  }
  async onDidChangeProfile() {
    const profileChangeGeneration = ++this.profileChangeGeneration;
    const generation = ++this.localQueryGeneration;
    this.invalidateRegistryVerification();
    await this.queryLocalForGeneration(generation);
    if (profileChangeGeneration !== this.profileChangeGeneration) {
      return;
    }
    this._onReset.fire();
    this.scheduleRegistrySync();
  }
  invalidateRegistryVerification() {
    this.registryGeneration++;
    this.registrySyncGeneration++;
    for (const server of this._local) {
      server.gallery = void 0;
    }
    this._onChange.fire(void 0);
  }
  areSameMcpServers(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.name === b.name && a.scope === b.scope;
  }
  onDidUninstallMcpServer(e4) {
    if (e4.error) {
      return;
    }
    const uninstalled = this._local.find((server) => this.areSameMcpServers(server.local, e4));
    if (uninstalled) {
      this._local = this._local.filter((server) => server !== uninstalled);
      this._onChange.fire(uninstalled);
    }
  }
  onDidInstallMcpServers(e4) {
    let needsRegistrySync = false;
    for (const { local, name, source } of e4) {
      let server = this.installing.find((server2) => server2.local && local ? this.areSameMcpServers(server2.local, local) : server2.name === name);
      this.installing = server ? this.installing.filter((e5) => e5 !== server) : this.installing;
      if (local) {
        const trustedGallery = this.getTrustedGallerySource(source) ?? this.getTrustedGallerySource(server?.gallery);
        if (server) {
          server.local = local;
        } else {
          server = this.instantiationService.createInstance(McpWorkbenchServer, (e5) => this.getInstallState(e5), (e5) => this.getRuntimeStatus(e5), local, void 0, void 0);
        }
        server.gallery = trustedGallery?.name === local.name ? trustedGallery : void 0;
        needsRegistrySync = true;
        this._local = this._local.filter((server2) => !this.areSameMcpServers(server2.local, local));
        this.addServer(server);
      }
      this._onChange.fire(server);
    }
    if (needsRegistrySync) {
      this.scheduleRegistrySync();
    }
  }
  onDidUpdateMcpServers(e4) {
    let needsRegistrySync = false;
    for (const result of e4) {
      if (!result.local) {
        continue;
      }
      const serverIndex = this._local.findIndex((server2) => this.areSameMcpServers(server2.local, result.local));
      let server;
      if (serverIndex !== -1) {
        this._local[serverIndex].local = result.local;
        server = this._local[serverIndex];
      } else {
        server = this.instantiationService.createInstance(McpWorkbenchServer, (e5) => this.getInstallState(e5), (e5) => this.getRuntimeStatus(e5), result.local, void 0, void 0);
        this.addServer(server);
      }
      const trustedGallery = this.getTrustedGallerySource(result.source) ?? this.getTrustedGallerySource(server.gallery);
      server.gallery = trustedGallery?.name === result.local.name ? trustedGallery : void 0;
      needsRegistrySync = true;
      this._onChange.fire(server);
    }
    if (needsRegistrySync) {
      this.scheduleRegistrySync();
    }
  }
  fromGallery(gallery, registryGeneration) {
    this.rememberGallerySource(gallery, registryGeneration);
    for (const local of this._local) {
      if (local.name === gallery.name) {
        return local;
      }
    }
    return void 0;
  }
  scheduleRegistrySync() {
    const generation = ++this.registrySyncGeneration;
    void this.registrySyncDelayer.trigger(() => this.syncInstalledMcpServers(generation)).catch((error) => this.logService.error(error));
  }
  async syncInstalledMcpServers(generation) {
    if (!this.mcpGalleryService.isEnabled()) {
      return;
    }
    const servers = this.local.flatMap((server) => server.local ? [{ server, local: server.local }] : []);
    const infosByName = /* @__PURE__ */ new Map();
    for (const { local } of servers) {
      const existing = infosByName.get(local.name);
      if (!existing || !existing.id && local.galleryId) {
        infosByName.set(local.name, { name: local.name, id: local.galleryId });
      }
    }
    const infos = [...infosByName.values()];
    if (!infos.length) {
      return;
    }
    const resolved = await this.mcpGalleryService.resolveMcpServersFromGallery(infos);
    if (generation !== this.registrySyncGeneration) {
      return;
    }
    this.syncInstalledMcpServersWithGallery(resolved, servers, generation);
  }
  syncInstalledMcpServersWithGallery(resolved, servers, generation) {
    for (const { server: mcpServer, local } of servers) {
      if (generation !== this.registrySyncGeneration || !this._local.includes(mcpServer) || mcpServer.local !== local) {
        continue;
      }
      const result = resolved.get(local.name);
      if (!result || result.status === 2 /* Failed */) {
        continue;
      }
      if (result.status === 1 /* NotFound */) {
        if (mcpServer.gallery) {
          mcpServer.gallery = void 0;
          this._onChange.fire(mcpServer);
        }
        continue;
      }
      const gallery = result.server;
      const changed = mcpServer.gallery !== gallery;
      this.rememberGallerySource(gallery);
      mcpServer.gallery = gallery;
      if (changed) {
        this._onChange.fire(mcpServer);
      }
    }
  }
  async queryGallery(options3, token) {
    if (!this.mcpGalleryService.isEnabled()) {
      return {
        firstPage: { items: [], hasMore: false },
        getNextPage: async () => ({ items: [], hasMore: false })
      };
    }
    const registryGeneration = this.registryGeneration;
    const pager = await this.mcpGalleryService.query(options3, token);
    const mapPage = (page) => ({
      items: page.items.map((gallery) => this.fromGallery(gallery, registryGeneration) ?? this.instantiationService.createInstance(McpWorkbenchServer, (e4) => this.getInstallState(e4), (e4) => this.getRuntimeStatus(e4), void 0, gallery, void 0)),
      hasMore: page.hasMore
    });
    return {
      firstPage: mapPage(pager.firstPage),
      getNextPage: async (ct) => {
        const nextPage = await pager.getNextPage(ct);
        return mapPage(nextPage);
      }
    };
  }
  async queryLocal() {
    await this.queryLocalForGeneration(++this.localQueryGeneration);
    return [...this.local];
  }
  async queryLocalForGeneration(generation) {
    const installed = await this.mcpManagementService.getInstalled();
    if (generation !== this.localQueryGeneration) {
      return false;
    }
    this._local = this.sort(installed.map((i2) => {
      const existing = this._local.find((local2) => local2.id === i2.id);
      const local = existing ?? this.instantiationService.createInstance(McpWorkbenchServer, (e4) => this.getInstallState(e4), (e4) => this.getRuntimeStatus(e4), void 0, void 0, void 0);
      local.local = i2;
      return local;
    }));
    this._onChange.fire(void 0);
    return true;
  }
  rememberGallerySource(gallery, registryGeneration = this.registryGeneration) {
    if (registryGeneration === this.registryGeneration) {
      this.gallerySourceGenerations.set(gallery, registryGeneration);
    }
  }
  getTrustedGallerySource(gallery) {
    return gallery && this.gallerySourceGenerations.get(gallery) === this.registryGeneration ? gallery : void 0;
  }
  addServer(server) {
    this._local.push(server);
    this._local = this.sort(this._local);
  }
  sort(local) {
    return local.sort((a, b) => {
      if (a.name === b.name) {
        const aEnabled = !a.runtimeStatus || a.runtimeStatus.state === 4 /* Enabled */;
        const bEnabled = !b.runtimeStatus || b.runtimeStatus.state === 4 /* Enabled */;
        if (aEnabled !== bEnabled) {
          return aEnabled ? -1 : 1;
        }
        return a.id.localeCompare(b.id);
      }
      return a.name.localeCompare(b.name);
    });
  }
  getEnabledLocalMcpServers() {
    const result = /* @__PURE__ */ new Map();
    const userRemote = [];
    const workspace = [];
    for (const server of this.local) {
      const enablementStatus = this.getEnablementStatus(server);
      if (enablementStatus && enablementStatus.state !== 4 /* Enabled */) {
        continue;
      }
      if (server.local?.scope === "user" /* User */) {
        result.set(server.name, server.local);
      } else if (server.local?.scope === "remoteUser" /* RemoteUser */) {
        userRemote.push(server.local);
      } else if (server.local?.scope === "workspace" /* Workspace */) {
        workspace.push(server.local);
      }
    }
    for (const server of userRemote) {
      const existing = result.get(server.name);
      if (existing) {
        this.logService.warn(localize(17099, null, server.name, server.mcpResource.path, existing.mcpResource.path));
      }
      result.set(server.name, server);
    }
    for (const server of workspace) {
      const existing = result.get(server.name);
      if (existing) {
        this.logService.warn(localize(17099, null, server.name, server.mcpResource.path, existing.mcpResource.path));
      }
      result.set(server.name, server);
    }
    return [...result.values()];
  }
  canInstall(mcpServer) {
    if (!(mcpServer instanceof McpWorkbenchServer)) {
      return new MarkdownString().appendText(localize(17098, null));
    }
    if (mcpServer.gallery) {
      const result = this.mcpManagementService.canInstall(mcpServer.gallery);
      if (result === true) {
        return true;
      }
      return result;
    }
    if (mcpServer.installable) {
      const result = this.mcpManagementService.canInstall(mcpServer.installable);
      if (result === true) {
        return true;
      }
      return result;
    }
    return new MarkdownString().appendText(localize(17092, null, mcpServer.label));
  }
  async install(server, installOptions) {
    if (!(server instanceof McpWorkbenchServer)) {
      throw new Error("Invalid server instance");
    }
    if (server.installable) {
      const installable = server.installable;
      return this.doInstall(server, () => this.mcpManagementService.install(installable, installOptions));
    }
    if (server.gallery) {
      const gallery = server.gallery;
      return this.doInstall(server, () => this.mcpManagementService.installFromGallery(gallery, installOptions));
    }
    throw new Error("No installable server found");
  }
  async uninstall(server) {
    if (!server.local) {
      throw new Error("Local server is missing");
    }
    await this.mcpManagementService.uninstall(server.local);
  }
  async doInstall(server, installTask) {
    const source = server.gallery ? "gallery" : "local";
    const serverName = server.name;
    const hasInputs = !!(server.installable?.inputs && server.installable.inputs.length > 0);
    this.installing.push(server);
    this._onChange.fire(server);
    try {
      await installTask();
      const result = await this.waitAndGetInstalledMcpServer(server);
      this.telemetryService.publicLog2("mcp/serverInstall", {
        serverName,
        source,
        scope: result.local?.scope ?? "unknown",
        success: true,
        hasInputs
      });
      return result;
    } catch (error) {
      this.telemetryService.publicLog2("mcp/serverInstall", {
        serverName,
        source,
        scope: "unknown",
        success: false,
        error: error instanceof Error ? error.message : String(error),
        hasInputs
      });
      throw error;
    } finally {
      if (this.installing.includes(server)) {
        this.installing.splice(this.installing.indexOf(server), 1);
        this._onChange.fire(server);
      }
    }
  }
  async waitAndGetInstalledMcpServer(server) {
    let installed = this.local.find((local) => local.name === server.name);
    if (!installed) {
      await Event2.toPromise(Event2.filter(this.onChange, (e4) => !!e4 && this.local.some((local) => local.name === server.name)));
    }
    installed = this.local.find((local) => local.name === server.name);
    if (!installed) {
      throw new Error("Extension should have been installed");
    }
    return installed;
  }
  getMcpConfigPath(arg) {
    if (arg instanceof URI) {
      const mcpResource = arg;
      for (const profile of this.userDataProfilesService.profiles) {
        if (this.uriIdentityService.extUri.isEqual(profile.mcpResource, mcpResource)) {
          return this.getUserMcpConfigPath(mcpResource);
        }
      }
      return this.remoteAgentService.getEnvironment().then((remoteEnvironment) => {
        if (remoteEnvironment && this.uriIdentityService.extUri.isEqual(remoteEnvironment.mcpResource, mcpResource)) {
          return this.getRemoteMcpConfigPath(mcpResource);
        }
        return this.getWorkspaceMcpConfigPath(mcpResource);
      });
    }
    if (arg.scope === "user" /* User */) {
      return this.getUserMcpConfigPath(arg.mcpResource);
    }
    if (arg.scope === "workspace" /* Workspace */) {
      return this.getWorkspaceMcpConfigPath(arg.mcpResource);
    }
    if (arg.scope === "remoteUser" /* RemoteUser */) {
      return this.getRemoteMcpConfigPath(arg.mcpResource);
    }
    return void 0;
  }
  getUserMcpConfigPath(mcpResource) {
    return {
      id: USER_CONFIG_ID,
      key: "userLocalValue",
      target: 3 /* USER_LOCAL */,
      label: localize(17097, null, this.productService.nameShort),
      scope: 0 /* PROFILE */,
      order: 200 /* User */,
      uri: mcpResource,
      section: []
    };
  }
  getRemoteMcpConfigPath(mcpResource) {
    return {
      id: REMOTE_USER_CONFIG_ID,
      key: "userRemoteValue",
      target: 4 /* USER_REMOTE */,
      label: this.environmentService.remoteAuthority ? this.labelService.getHostLabel(Schemas.vscodeRemote, this.environmentService.remoteAuthority) : "Remote",
      scope: 0 /* PROFILE */,
      order: 200 /* User */ + -50 /* RemoteBoost */,
      remoteAuthority: this.environmentService.remoteAuthority,
      uri: mcpResource,
      section: []
    };
  }
  getWorkspaceMcpConfigPath(mcpResource) {
    const workspace = this.workspaceService.getWorkspace();
    if (workspace.configuration && this.uriIdentityService.extUri.isEqual(workspace.configuration, mcpResource)) {
      return {
        id: WORKSPACE_CONFIG_ID,
        key: "workspaceValue",
        target: 5 /* WORKSPACE */,
        label: basename2(mcpResource),
        scope: 1 /* WORKSPACE */,
        order: 100 /* Workspace */,
        remoteAuthority: this.environmentService.remoteAuthority,
        uri: mcpResource,
        section: ["settings", mcpConfigurationSection]
      };
    }
    const workspaceFolders = workspace.folders;
    for (let index2 = 0; index2 < workspaceFolders.length; index2++) {
      const workspaceFolder = workspaceFolders[index2];
      if (this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.joinPath(workspaceFolder.uri, WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY]), mcpResource)) {
        return {
          id: `${WORKSPACE_FOLDER_CONFIG_ID_PREFIX}${index2}`,
          key: "workspaceFolderValue",
          target: 6 /* WORKSPACE_FOLDER */,
          label: `${workspaceFolder.name}/.vscode/mcp.json`,
          scope: 1 /* WORKSPACE */,
          remoteAuthority: this.environmentService.remoteAuthority,
          order: 0 /* WorkspaceFolder */,
          uri: mcpResource,
          workspaceFolder
        };
      }
    }
    return void 0;
  }
  async handleURL(uri4) {
    if (uri4.path === "mcp/install") {
      return this.handleMcpInstallUri(uri4);
    }
    if (uri4.path.startsWith("mcp/by-name/")) {
      const mcpServerName = uri4.path.substring("mcp/by-name/".length);
      if (mcpServerName) {
        return this.handleMcpServerByName(mcpServerName);
      }
    }
    if (uri4.path.startsWith("mcp/")) {
      const mcpServerUrl = uri4.path.substring(4);
      if (mcpServerUrl) {
        return this.handleMcpServerUrl(`${Schemas.https}://${mcpServerUrl}`);
      }
    }
    return false;
  }
  async handleMcpInstallUri(uri4) {
    const parsed = parseMcpInstallUriPayload(uri4.query);
    if (!parsed) {
      return false;
    }
    try {
      const { name, inputs, config } = parsed;
      if (config.gallery && this.mcpGalleryService.isEnabled()) {
        try {
          const registryGeneration = this.registryGeneration;
          const [galleryServer] = await this.mcpGalleryService.getMcpServersFromGallery([{ name }]);
          if (galleryServer) {
            this.rememberGallerySource(galleryServer, registryGeneration);
            const local = this.local.find((e4) => e4.name === galleryServer.name) ?? this.instantiationService.createInstance(McpWorkbenchServer, (e4) => this.getInstallState(e4), (e4) => this.getRuntimeStatus(e4), void 0, galleryServer, void 0);
            this.open(local);
            return true;
          }
          this.logService.info(`MCP server '${name}' not found in gallery, installing as local`);
        } catch (e4) {
          this.logService.info(`Gallery verification failed for MCP server '${name}', installing as local`);
        }
      }
      this.open(this.instantiationService.createInstance(McpWorkbenchServer, (e4) => this.getInstallState(e4), (e4) => this.getRuntimeStatus(e4), void 0, void 0, { name, config, inputs }));
    } catch (e4) {
    }
    return true;
  }
  async handleMcpServerUrl(url) {
    try {
      const gallery = await this.mcpGalleryService.getMcpServer(url);
      if (!gallery) {
        this.logService.info(`MCP server '${url}' not found`);
        return true;
      }
      const local = this.local.find((e4) => e4.name === gallery.name) ?? this.instantiationService.createInstance(McpWorkbenchServer, (e4) => this.getInstallState(e4), (e4) => this.getRuntimeStatus(e4), void 0, gallery, void 0);
      this.open(local);
    } catch (e4) {
      this.logService.error(e4);
    }
    return true;
  }
  async handleMcpServerByName(name) {
    try {
      const registryGeneration = this.registryGeneration;
      const [gallery] = await this.mcpGalleryService.getMcpServersFromGallery([{ name }]);
      if (!gallery) {
        this.logService.info(`MCP server '${name}' not found`);
        return true;
      }
      this.rememberGallerySource(gallery, registryGeneration);
      const local = this.local.find((e4) => e4.name === gallery.name) ?? this.instantiationService.createInstance(McpWorkbenchServer, (e4) => this.getInstallState(e4), (e4) => this.getRuntimeStatus(e4), void 0, gallery, void 0);
      this.open(local);
    } catch (e4) {
      this.logService.error(e4);
    }
    return true;
  }
  async openSearch(searchValue, preserveFocus) {
    await this.extensionsWorkbenchService.openSearch(`@mcp ${searchValue}`, preserveFocus);
  }
  async open(extension, options3) {
    const useModal = this.configurationService.getValue("extensions.allowOpenInModalEditor");
    await this.editorService.openEditor(this.instantiationService.createInstance(McpServerEditorInput, extension), options3, useModal ? MODAL_GROUP : ACTIVE_GROUP);
  }
  getInstallState(extension) {
    if (this.installing.some((i2) => i2.name === extension.name)) {
      return 0 /* Installing */;
    }
    if (this.uninstalling.some((e4) => e4.name === extension.name)) {
      return 2 /* Uninstalling */;
    }
    const local = this.local.find((e4) => e4 === extension);
    return local ? 1 /* Installed */ : 3 /* Uninstalled */;
  }
  getRuntimeStatus(mcpServer) {
    const enablementStatus = this.getEnablementStatus(mcpServer);
    if (enablementStatus) {
      return enablementStatus;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.id === mcpServer.id);
    if (!server) {
      return { state: 0 /* Disabled */ };
    }
    const enablement = server.enablement.get();
    if (enablement === 0 /* DisabledProfile */) {
      return {
        state: 2 /* DisabledProfile */,
        message: {
          severity: severity_default.Info,
          text: new MarkdownString(localize(17095, null))
        }
      };
    }
    if (enablement === 1 /* DisabledWorkspace */) {
      return {
        state: 3 /* DisabledWorkspace */,
        message: {
          severity: severity_default.Info,
          text: new MarkdownString(localize(17096, null))
        }
      };
    }
    return void 0;
  }
  getEnablementStatus(mcpServer) {
    if (!mcpServer.local) {
      return void 0;
    }
    const settingsCommandLink = createCommandUri("workbench.action.openSettings", { query: `@id:${mcpAccessConfig}` }).toString();
    const accessValue = this.configurationService.getValue(mcpAccessConfig);
    if (accessValue === "none" /* None */) {
      return {
        state: 1 /* DisabledByAccess */,
        message: {
          severity: severity_default.Warning,
          text: new MarkdownString(localize(17093, null, settingsCommandLink))
        }
      };
    }
    if (accessValue === "registry" /* Registry */) {
      if (!mcpServer.gallery) {
        return {
          state: 1 /* DisabledByAccess */,
          message: {
            severity: severity_default.Warning,
            text: new MarkdownString(localize(17094, null, settingsCommandLink))
          }
        };
      }
      const remoteUrl = mcpServer.local.config.type === "http" /* REMOTE */ && mcpServer.local.config.url;
      if (remoteUrl && !mcpServer.gallery.configuration.remotes?.some((remote) => remote.url === remoteUrl)) {
        return {
          state: 1 /* DisabledByAccess */,
          message: {
            severity: severity_default.Warning,
            text: new MarkdownString(localize(17094, null, settingsCommandLink))
          }
        };
      }
    }
    return void 0;
  }
};

McpWorkbenchService = __decorateClass([
  __decorateParam(0, IMcpGalleryManifestService),
  __decorateParam(1, IMcpGalleryService),
  __decorateParam(2, IWorkbenchMcpManagementService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IUserDataProfilesService),
  __decorateParam(5, IUriIdentityService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IWorkbenchEnvironmentService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IRemoteAgentService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IInstantiationService),
  __decorateParam(13, ITelemetryService),
  __decorateParam(14, ILogService),
  __decorateParam(15, IExtensionsWorkbenchService),
  __decorateParam(16, IAllowedMcpServersService),
  __decorateParam(17, IMcpService),
  __decorateParam(18, IURLService)
], McpWorkbenchService);

var MCPContextsInitialisation = class extends Disposable {
  static {
    this.ID = "workbench.mcp.contexts.initialisation";
  }
  constructor(mcpWorkbenchService, mcpGalleryManifestService, contextKeyService) {
    super();
    const mcpServersGalleryStatus = McpServersGalleryStatusContext.bindTo(contextKeyService);
    mcpServersGalleryStatus.set(mcpGalleryManifestService.mcpGalleryManifestStatus);
    this._register(mcpGalleryManifestService.onDidChangeMcpGalleryManifestStatus((status2) => mcpServersGalleryStatus.set(status2)));
    const hasInstalledMcpServersContextKey = HasInstalledMcpServersContext.bindTo(contextKeyService);
    mcpWorkbenchService.queryLocal().finally(() => {
      hasInstalledMcpServersContextKey.set(mcpWorkbenchService.local.length > 0);
      this._register(mcpWorkbenchService.onChange(() => hasInstalledMcpServersContextKey.set(mcpWorkbenchService.local.length > 0)));
    });
  }
};

MCPContextsInitialisation = __decorateClass([
  __decorateParam(0, IMcpWorkbenchService),
  __decorateParam(1, IMcpGalleryManifestService),
  __decorateParam(2, IContextKeyService)
], MCPContextsInitialisation);
export { parseMcpInstallUriPayload, sanitizeMcpServerConfiguration, sanitizeMcpDevModeConfig, sanitizeMcpDevModeDebugConfiguration, sanitizeMcpEnvironment, sanitizeStringRecord, sanitizeRecord, sanitizeMcpOAuthConfiguration, McpWorkbenchServer, McpWorkbenchService, MCPContextsInitialisation };
