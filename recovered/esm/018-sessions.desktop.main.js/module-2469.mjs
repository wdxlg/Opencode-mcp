// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpCommandsAddConfiguration.ts
import { localize } from "./module-0001.mjs";
import { allDiscoverySources, mcpDiscoverySection, mcpStdioServerSchema } from "./module-1420.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Schemas } from "./module-0033.mjs";
import { isAgentHostTarget } from "./module-0961.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { assertNever } from "./module-0009.mjs";
import { autorun } from "./module-0052.mjs";
import { mapFindFirst } from "./module-0006.mjs";
import { IMcpService, McpConnectionState } from "./module-1206.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { IWorkspaceContextService, isWorkspaceFolder } from "./module-0509.mjs";
import { basename2 } from "./module-0034.mjs";
import { parse12 } from "./module-2175.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IWorkbenchMcpManagementService } from "./module-1204.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAgentHostCustomizationService } from "./module-1763.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { mnemonicButtonLabel } from "./module-0711.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpCommandsAddConfiguration.ts
var AssistedTypes = {
  [2 /* NpmPackage */]: {
    title: localize(16886, null),
    placeholder: localize(16885, null),
    pickLabel: localize(16903, null),
    pickDescription: localize(16904, null),
    enabledConfigKey: null
    // always enabled
  },
  [3 /* PipPackage */]: {
    title: localize(16890, null),
    placeholder: localize(16889, null),
    pickLabel: localize(16907, null),
    pickDescription: localize(16908, null),
    enabledConfigKey: null
    // always enabled
  },
  [4 /* NuGetPackage */]: {
    title: localize(16888, null),
    placeholder: localize(16887, null),
    pickLabel: localize(16905, null),
    pickDescription: localize(16906, null),
    enabledConfigKey: "chat.mcp.assisted.nuget.enabled"
  },
  [5 /* DockerImage */]: {
    title: localize(16870, null),
    placeholder: localize(16869, null),
    pickLabel: localize(16898, null),
    pickDescription: localize(16899, null),
    enabledConfigKey: null
    // always enabled
  }
};

var McpAddConfigurationCommand = class {
  constructor(workspaceFolder, _quickInputService, _mcpManagementService, _workspaceService, _environmentService, _commandService, _mcpRegistry, _openerService, _editorService, _fileService, _notificationService, _telemetryService, _mcpService, _label, _configurationService, _agentHostCustomizations, _chatWidgetService) {
    this.workspaceFolder = workspaceFolder;
    this._quickInputService = _quickInputService;
    this._mcpManagementService = _mcpManagementService;
    this._workspaceService = _workspaceService;
    this._environmentService = _environmentService;
    this._commandService = _commandService;
    this._mcpRegistry = _mcpRegistry;
    this._openerService = _openerService;
    this._editorService = _editorService;
    this._fileService = _fileService;
    this._notificationService = _notificationService;
    this._telemetryService = _telemetryService;
    this._mcpService = _mcpService;
    this._label = _label;
    this._configurationService = _configurationService;
    this._agentHostCustomizations = _agentHostCustomizations;
    this._chatWidgetService = _chatWidgetService;
  }
  async getServerType() {
    const items = [
      { kind: 0 /* Stdio */, label: localize(16895, null), description: localize(16896, null) },
      { kind: 1 /* HTTP */, label: localize(16900, null), description: localize(16901, null) }
    ];
    let aiSupported;
    try {
      aiSupported = await this._commandService.executeCommand("github.copilot.chat.mcp.setup.check" /* IsSupported */);
    } catch {
    }
    if (aiSupported) {
      items.unshift({ type: "separator", label: localize(16902, null) });
      const elligableTypes = Object.entries(AssistedTypes).map(([type, { pickLabel, pickDescription, enabledConfigKey }]) => {
        if (enabledConfigKey) {
          const enabled = this._configurationService.getValue(enabledConfigKey) ?? false;
          if (!enabled) {
            return;
          }
        }
        return {
          kind: Number(type),
          label: pickLabel,
          description: pickDescription
        };
      }).filter((x) => !!x);
      items.push(
        { type: "separator", label: localize(16897, null) },
        ...elligableTypes
      );
    }
    items.push({ type: "separator" });
    const discovery = this._configurationService.getValue(mcpDiscoverySection);
    if (discovery && typeof discovery === "object" && allDiscoverySources.some((d) => !discovery[d])) {
      items.push({
        kind: "discovery",
        label: localize(16894, null)
      });
    }
    items.push({
      kind: "browse",
      label: localize(16893, null)
    });
    const result = await this._quickInputService.pick(items, {
      placeHolder: localize(16909, null)
    });
    if (result?.kind === "browse") {
      this._commandService.executeCommand("workbench.mcp.browseServers" /* Browse */);
      return void 0;
    }
    if (result?.kind === "discovery") {
      this._commandService.executeCommand("workbench.action.openSettings", mcpDiscoverySection);
      return void 0;
    }
    return result?.kind;
  }
  async getStdioConfig() {
    const command4 = await this._quickInputService.input({
      title: localize(16867, null),
      placeHolder: localize(16866, null),
      ignoreFocusLost: true
    });
    if (!command4) {
      return void 0;
    }
    this._telemetryService.publicLog2("mcp.addserver", {
      packageType: "stdio"
    });
    const parts = command4.match(/(?:[^\s"]+|"[^"]*")+/g);
    return {
      type: "stdio" /* LOCAL */,
      command: parts[0].replace(/"/g, ""),
      args: parts.slice(1).map((arg) => arg.replace(/"/g, ""))
    };
  }
  async getSSEConfig() {
    const url = await this._quickInputService.input({
      title: localize(16922, null),
      placeHolder: localize(16921, null),
      ignoreFocusLost: true
    });
    if (!url) {
      return void 0;
    }
    this._telemetryService.publicLog2("mcp.addserver", {
      packageType: "sse"
    });
    return { url, type: "http" /* REMOTE */ };
  }
  async getServerId(suggestion = `my-mcp-server-${generateUuid().split("-")[0]}`) {
    const id2 = await this._quickInputService.input({
      title: localize(16892, null),
      placeHolder: localize(16891, null),
      value: suggestion,
      ignoreFocusLost: true
    });
    return id2;
  }
  async getConfigurationTarget() {
    const options3 = [
      { target: 3 /* USER_LOCAL */, label: localize(16916, null), description: localize(16917, null) }
    ];
    const raLabel = this._environmentService.remoteAuthority && this._label.getHostLabel(Schemas.vscodeRemote, this._environmentService.remoteAuthority);
    if (raLabel) {
      options3.push({ target: 4 /* USER_REMOTE */, label: localize(16914, null), description: localize(16910, null, raLabel) });
    }
    const workbenchState = this._workspaceService.getWorkbenchState();
    if (workbenchState !== 1 /* EMPTY */) {
      const target = workbenchState === 2 /* FOLDER */ ? this._workspaceService.getWorkspace().folders[0] : 5 /* WORKSPACE */;
      if (this._environmentService.remoteAuthority) {
        options3.push({ target, label: localize(16918, null), description: localize(16920, null, raLabel) });
      } else {
        options3.push({ target, label: localize(16918, null), description: localize(16919, null) });
      }
    }
    if (options3.length === 1) {
      return options3[0].target;
    }
    const targetPick = await this._quickInputService.pick(options3, {
      title: localize(16915, null),
      placeHolder: localize(16913, null)
    });
    return targetPick?.target;
  }
  async getInstallTarget() {
    const session = this._chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource;
    const hasAgentHostSession = !!session && isAgentHostTarget(getChatSessionType(session));
    if (this.workspaceFolder) {
      return { kind: "local", target: this.workspaceFolder };
    }
    if (session && hasAgentHostSession) {
      const AGENT_HOST_ID = "$agentHost";
      const LOCAL_ID = "$local";
      const items = [
        {
          id: AGENT_HOST_ID,
          label: localize(16911, null),
          alwaysShow: true
        },
        { type: "separator" },
        {
          id: LOCAL_ID,
          label: localize(16912, null),
          iconClass: ThemeIcon.asClassName(Codicon.arrowLeft),
          alwaysShow: true
        }
      ];
      const targetPick = await this._quickInputService.pick(items, {
        title: localize(16915, null),
        placeHolder: localize(16913, null)
      });
      if (!targetPick) {
        return void 0;
      }
      if (targetPick.id === AGENT_HOST_ID) {
        return { kind: "agentHost", session };
      }
      const target2 = await this.getConfigurationTarget();
      return target2 ? { kind: "local", target: target2 } : void 0;
    }
    const target = await this.getConfigurationTarget();
    return target ? { kind: "local", target } : void 0;
  }
  async getAssistedConfig(type) {
    const packageName = await this._quickInputService.input({
      ignoreFocusLost: true,
      title: AssistedTypes[type].title,
      placeHolder: AssistedTypes[type].placeholder
    });
    if (!packageName) {
      return void 0;
    }
    let LoadAction;
    ((LoadAction2) => {
      LoadAction2["Retry"] = "retry";
      LoadAction2["Cancel"] = "cancel";
      LoadAction2["Allow"] = "allow";
      LoadAction2["OpenUri"] = "openUri";
    })(LoadAction || (LoadAction = {}));
    const loadingQuickPickStore = new DisposableStore();
    const loadingQuickPick = loadingQuickPickStore.add(this._quickInputService.createQuickPick());
    loadingQuickPick.title = localize(16884, null);
    loadingQuickPick.busy = true;
    loadingQuickPick.ignoreFocusOut = true;
    const packageType = this.getPackageType(type);
    this._telemetryService.publicLog2("mcp.addserver", {
      packageType
    });
    this._commandService.executeCommand(
      "github.copilot.chat.mcp.setup.validatePackage" /* ValidatePackage */,
      {
        type: packageType,
        name: packageName,
        targetConfig: {
          ...mcpStdioServerSchema,
          properties: {
            ...mcpStdioServerSchema.properties,
            name: {
              type: "string",
              description: "Suggested name of the server, alphanumeric and hyphen only"
            }
          },
          required: [...mcpStdioServerSchema.required || [], "name"]
        }
      }
    ).then((result) => {
      if (!result || result.state === "error") {
        loadingQuickPick.title = result?.error || "Unknown error loading package";
        const items = [];
        if (result?.helpUri) {
          items.push({
            id: "openUri" /* OpenUri */,
            label: result.helpUriLabel ?? localize(16871, null),
            helpUri: URI.parse(result.helpUri)
          });
        }
        items.push(
          { id: "retry" /* Retry */, label: localize(16872, null) },
          { id: "cancel" /* Cancel */, label: localize(16859, null) }
        );
        loadingQuickPick.items = items;
      } else {
        loadingQuickPick.title = localize(
          16868,
          null,
          result.name ?? packageName,
          result.version ? `@${result.version}` : "",
          result.publisher
        );
        loadingQuickPick.items = [
          { id: "allow" /* Allow */, label: localize(16858, null) },
          { id: "cancel" /* Cancel */, label: localize(16859, null) }
        ];
      }
      loadingQuickPick.busy = false;
    });
    const loadingAction = await new Promise((resolve3) => {
      loadingQuickPickStore.add(loadingQuickPick.onDidAccept(() => resolve3(loadingQuickPick.selectedItems[0])));
      loadingQuickPickStore.add(loadingQuickPick.onDidHide(() => resolve3(void 0)));
      loadingQuickPick.show();
    }).finally(() => loadingQuickPickStore.dispose());
    switch (loadingAction?.id) {
      case "retry" /* Retry */:
        return this.getAssistedConfig(type);
      case "openUri" /* OpenUri */:
        if (loadingAction.helpUri) {
          this._openerService.open(loadingAction.helpUri);
        }
        return void 0;
      case "allow" /* Allow */:
        break;
      case "cancel" /* Cancel */:
      default:
        return void 0;
    }
    const config = await this._commandService.executeCommand(
      "github.copilot.chat.mcp.setup.flow" /* StartFlow */,
      {
        name: packageName,
        type: packageType
      }
    );
    if (config?.type === "mapped") {
      return {
        name: config.name,
        server: config.server,
        inputs: config.inputs
      };
    } else if (config?.type === "assisted" || !config?.type) {
      return config;
    } else {
      assertNever(config?.type);
    }
  }
  /** Shows the location of a server config once it's discovered. */
  showOnceDiscovered(name) {
    const store = new DisposableStore();
    store.add(autorun((reader) => {
      const colls = this._mcpRegistry.collections.read(reader);
      const servers = this._mcpService.servers.read(reader);
      const match2 = mapFindFirst(colls, (collection) => mapFindFirst(
        collection.serverDefinitions.read(reader),
        (server2) => server2.label === name ? { server: server2, collection } : void 0
      ));
      const server = match2 && servers.find((s) => s.definition.id === match2.server.id);
      if (match2 && server) {
        if (match2.collection.presentation?.origin) {
          this._editorService.openEditor({
            resource: match2.collection.presentation.origin,
            options: {
              selection: match2.server.presentation?.origin?.range,
              preserveFocus: true
            }
          });
        } else {
          this._commandService.executeCommand("workbench.mcp.serverOptions" /* ServerOptions */, name);
        }
        server.start({ promptType: "all-untrusted" }).then((state) => {
          if (state.state === McpConnectionState.Kind.Error) {
            server.showOutput();
          }
        });
        store.dispose();
      }
    }));
    store.add(disposableTimeout(() => store.dispose(), 5e3));
  }
  async run() {
    const serverType = await this.getServerType();
    if (serverType === void 0) {
      return;
    }
    let config;
    let suggestedName;
    let inputs;
    let inputValues;
    switch (serverType) {
      case 0 /* Stdio */:
        config = await this.getStdioConfig();
        break;
      case 1 /* HTTP */:
        config = await this.getSSEConfig();
        break;
      case 2 /* NpmPackage */:
      case 3 /* PipPackage */:
      case 4 /* NuGetPackage */:
      case 5 /* DockerImage */: {
        const r2 = await this.getAssistedConfig(serverType);
        config = r2?.server ? { ...r2.server, type: "stdio" /* LOCAL */ } : void 0;
        suggestedName = r2?.name;
        inputs = r2?.inputs;
        inputValues = r2?.inputValues;
        break;
      }
      default:
        assertNever(serverType);
    }
    if (!config) {
      return;
    }
    const name = await this.getServerId(suggestedName);
    if (!name) {
      return;
    }
    const installTarget = await this.getInstallTarget();
    if (!installTarget) {
      return;
    }
    if (installTarget.kind === "agentHost") {
      this._agentHostCustomizations.addMcpServer(installTarget.session, name, config);
      return;
    }
    const { target } = installTarget;
    await this._mcpManagementService.install({ name, config, inputs }, { target });
    if (inputValues) {
      for (const [key3, value2] of Object.entries(inputValues)) {
        await this._mcpRegistry.setSavedInput(key3, (isWorkspaceFolder(target) ? 6 /* WORKSPACE_FOLDER */ : target) ?? 5 /* WORKSPACE */, value2);
      }
    }
    const packageType = this.getPackageType(serverType);
    if (packageType) {
      this._telemetryService.publicLog2("mcp.addserver.completed", {
        packageType,
        serverType: config.type,
        target: target === 5 /* WORKSPACE */ ? "workspace" : "user"
      });
    }
    this.showOnceDiscovered(name);
  }
  async pickForUrlHandler(resource, showIsPrimary = false) {
    const name = decodeURIComponent(basename2(resource)).replace(/\.json$/, "");
    const placeHolder = localize(16865, null, name);
    const items = [
      { id: "install", label: localize(16864, null) },
      { id: "show", label: localize(16863, null, name) },
      { id: "rename", label: localize(16862, null, name) },
      { id: "cancel", label: localize(16859, null) }
    ];
    if (showIsPrimary) {
      [items[0], items[1]] = [items[1], items[0]];
    }
    const pick = await this._quickInputService.pick(items, { placeHolder, ignoreFocusLost: true });
    const getEditors = () => this._editorService.findEditors(resource);
    switch (pick?.id) {
      case "show":
        await this._editorService.openEditor({ resource });
        break;
      case "install":
        await this._editorService.save(getEditors());
        try {
          const contents = await this._fileService.readFile(resource);
          const { inputs, ...config } = parse12(contents.value.toString());
          await this._mcpManagementService.install({ name, config, inputs });
          this._editorService.closeEditors(getEditors());
          this.showOnceDiscovered(name);
        } catch (e4) {
          this._notificationService.error(localize(16860, null, name, e4.message));
          await this._editorService.openEditor({ resource });
        }
        break;
      case "rename": {
        const newName = await this._quickInputService.input({ placeHolder: localize(16861, null), value: name });
        if (newName) {
          const newURI = resource.with({ path: `/${encodeURIComponent(newName)}.json` });
          await this._editorService.save(getEditors());
          await this._fileService.move(resource, newURI);
          return this.pickForUrlHandler(newURI, showIsPrimary);
        }
        break;
      }
    }
  }
  getPackageType(serverType) {
    switch (serverType) {
      case 2 /* NpmPackage */:
        return "npm";
      case 3 /* PipPackage */:
        return "pip";
      case 4 /* NuGetPackage */:
        return "nuget";
      case 5 /* DockerImage */:
        return "docker";
      case 0 /* Stdio */:
        return "stdio";
      case 1 /* HTTP */:
        return "sse";
      default:
        return void 0;
    }
  }
};

McpAddConfigurationCommand = __decorateClass([
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, IWorkbenchMcpManagementService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IMcpRegistry),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IFileService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, IMcpService),
  __decorateParam(13, ILabelService),
  __decorateParam(14, IConfigurationService),
  __decorateParam(15, IAgentHostCustomizationService),
  __decorateParam(16, IChatWidgetService)
], McpAddConfigurationCommand);

var McpInstallFromManifestCommand = class {
  constructor(_fileDialogService, _fileService, _quickInputService, _notificationService, _mcpManagementService, _logService) {
    this._fileDialogService = _fileDialogService;
    this._fileService = _fileService;
    this._quickInputService = _quickInputService;
    this._notificationService = _notificationService;
    this._mcpManagementService = _mcpManagementService;
    this._logService = _logService;
  }
  async run() {
    const result = await this._fileDialogService.showOpenDialog({
      title: localize(16883, null),
      filters: [{ name: localize(16873, null), extensions: ["json"] }],
      canSelectFiles: true,
      canSelectMany: false,
      openLabel: mnemonicButtonLabel(localize(16877, null))
    });
    if (!result?.[0]) {
      return;
    }
    const manifestUri = result[0];
    let manifest;
    try {
      const contents = await this._fileService.readFile(manifestUri);
      manifest = parse12(contents.value.toString());
    } catch (e4) {
      this._notificationService.error(localize(16879, null, e4.message));
      return;
    }
    if (!manifest || typeof manifest !== "object") {
      this._notificationService.error(localize(16875, null));
      return;
    }
    const galleryManifest = manifest;
    let packageType;
    if (Array.isArray(galleryManifest.packages) && galleryManifest.packages.length > 0) {
      packageType = galleryManifest.packages[0].registryType;
    } else if (Array.isArray(galleryManifest.remotes) && galleryManifest.remotes.length > 0) {
      packageType = "remote" /* REMOTE */;
    } else {
      this._notificationService.error(localize(16876, null));
      return;
    }
    let config;
    let inputs;
    try {
      const { mcpServerConfiguration, notices } = this._mcpManagementService.getMcpServerConfigurationFromManifest(galleryManifest, packageType);
      config = mcpServerConfiguration.config;
      inputs = mcpServerConfiguration.inputs;
      if (notices.length > 0) {
        this._logService.warn(`MCP Management Service: Warnings while installing the MCP server from ${manifestUri.path}`, notices);
      }
    } catch (e4) {
      this._notificationService.error(localize(16878, null, e4.message));
      return;
    }
    let name = galleryManifest.name;
    if (!name) {
      name = await this._quickInputService.input({
        title: localize(16881, null),
        placeHolder: localize(16880, null),
        value: basename2(manifestUri).replace(/\.json$/i, ""),
        ignoreFocusLost: true
      });
      if (!name) {
        return;
      }
    }
    try {
      await this._mcpManagementService.install({ name, config, inputs });
      this._notificationService.info(localize(16882, null, name));
    } catch (e4) {
      this._notificationService.error(localize(16874, null, e4.message));
    }
  }
};

McpInstallFromManifestCommand = __decorateClass([
  __decorateParam(0, IFileDialogService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IWorkbenchMcpManagementService),
  __decorateParam(5, ILogService)
], McpInstallFromManifestCommand);
export { AssistedTypes, McpAddConfigurationCommand, McpInstallFromManifestCommand };
