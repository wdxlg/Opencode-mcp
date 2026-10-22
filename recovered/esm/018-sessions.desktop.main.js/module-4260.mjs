// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SessionsCategories } from "./module-3532.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus, RemoteAgentHostsEnabledSettingId, addWebSocketRemoteAgentHostEntry, parseRemoteAgentHostInput } from "./module-1736.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISSHRemoteAgentHostService, isSSHHostKeyDeniedError } from "./module-1779.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { StopWatch } from "./module-0016.mjs";
import { categorizeSSHConnectError, logSSHConnectAttempt } from "./module-1781.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { Codicon } from "./module-0085.mjs";
import { Menus } from "./module-3437.mjs";
import { SessionWorkspacePickerGroupContext } from "./module-1770.mjs";
import { SESSION_WORKSPACE_GROUP_REMOTE } from "./module-1767.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IFileService } from "./module-0269.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { Range2 } from "./module-0106.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { ITunnelAgentHostService, TUNNEL_ADDRESS_PREFIX, isTunnelHosted } from "./module-1734.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IProductService } from "./module-0875.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ITunnelHostService } from "./module-4259.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { IWSLRemoteAgentHostService, WSL_INSTALL_DOCS_URL } from "./module-4242.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILogService } from "./module-0095.mjs";
import { Action } from "./module-0082.mjs";
import { URI } from "./module-0032.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { runServerUpgrade } from "./module-3560.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostActions.ts
var RemoteAgentHostCommandIds = {
  addRemoteAgentHost: "sessions.remoteAgentHost.add",
  connectViaSSH: "workbench.action.sessions.connectViaSSH",
  addNewSSHHost: "workbench.action.sessions.addNewSSHHost",
  configureSSHHosts: "workbench.action.sessions.configureSSHHosts",
  connectViaTunnel: "workbench.action.sessions.connectViaTunnel",
  connectViaWSL: "workbench.action.sessions.connectViaWSL",
  manageRemoteAgentHosts: "workbench.action.sessions.manageRemoteAgentHosts",
  updateRemoteAgentHost: "workbench.action.sessions.updateRemoteAgentHost"
};

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RemoteAgentHostCommandIds.addRemoteAgentHost,
      title: localize2(5115, "Add Remote Agent Host..."),
      category: SessionsCategories.Sessions,
      f1: true,
      precondition: ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true)
    });
  }
  async run(accessor) {
    const remoteAgentHostService = accessor.get(IRemoteAgentHostService);
    const quickInputService = accessor.get(IQuickInputService);
    const notificationService = accessor.get(INotificationService);
    const configurationService = accessor.get(IConfigurationService);
    const address = await quickInputService.input({
      title: localize(5118, null),
      prompt: localize(5117, null, "ws://127.0.0.1:8089"),
      placeHolder: "ws://127.0.0.1:8080?tkn=abc-123",
      ignoreFocusLost: true,
      validateInput: async (value2) => {
        const result = parseRemoteAgentHostInput(value2);
        if (result.error === "empty" /* Empty */) {
          return localize(5119, null);
        }
        if (result.error === "invalid" /* Invalid */) {
          return localize(5120, null);
        }
        return void 0;
      }
    });
    if (!address) {
      return;
    }
    const parsed = parseRemoteAgentHostInput(address);
    if (!parsed.parsed) {
      return;
    }
    const defaultName = parsed.parsed.suggestedName;
    const name = await quickInputService.input({
      title: localize(5130, null),
      prompt: localize(5129, null),
      placeHolder: localize(5128, null),
      value: defaultName,
      valueSelection: [0, defaultName.length],
      ignoreFocusLost: true,
      validateInput: async (value2) => value2.trim() ? void 0 : localize(5131, null)
    });
    if (!name?.trim()) {
      return;
    }
    try {
      await addWebSocketRemoteAgentHostEntry(configurationService, {
        name: name.trim(),
        connectionToken: parsed.parsed.connectionToken,
        connection: {
          type: "websocket" /* WebSocket */,
          address: parsed.parsed.address
        }
      });
      await remoteAgentHostService.waitForConnection(parsed.parsed.address);
    } catch {
      notificationService.error(localize(5116, null, parsed.parsed.address));
    }
  }
});

function parseSSHHostInput(value2) {
  const trimmed = value2.trim();
  if (!trimmed) {
    return void 0;
  }
  const atIdx = trimmed.indexOf("@");
  if (atIdx === 0 || atIdx === trimmed.length - 1) {
    return void 0;
  }
  let username;
  let hostPart;
  if (atIdx !== -1) {
    username = trimmed.substring(0, atIdx);
    hostPart = trimmed.substring(atIdx + 1);
  } else {
    hostPart = trimmed;
  }
  if (!hostPart) {
    return void 0;
  }
  let host;
  let port;
  const colonIdx = hostPart.lastIndexOf(":");
  if (colonIdx !== -1) {
    host = hostPart.substring(0, colonIdx);
    const portStr = hostPart.substring(colonIdx + 1);
    if (!host) {
      return void 0;
    }
    if (portStr) {
      const portNum = Number(portStr);
      if (!Number.isInteger(portNum) || portNum <= 0 || portNum > 65535) {
        return void 0;
      }
      port = portNum;
    }
  } else {
    host = hostPart;
  }
  if (!host) {
    return void 0;
  }
  return { host, username, port };
}

function validateSSHHostInput(value2) {
  const v2 = value2.trim();
  if (!v2) {
    return localize(5149, null);
  }
  const atIdx = v2.indexOf("@");
  if (atIdx === 0) {
    return localize(5167, null);
  }
  if (atIdx === v2.length - 1) {
    return localize(5152, null);
  }
  const hostPart = atIdx !== -1 ? v2.substring(atIdx + 1) : v2;
  if (!hostPart) {
    return localize(5152, null);
  }
  const colonIdx = hostPart.lastIndexOf(":");
  if (colonIdx !== -1) {
    const hostName = hostPart.substring(0, colonIdx);
    const portStr = hostPart.substring(colonIdx + 1);
    if (!hostName) {
      return localize(5152, null);
    }
    if (portStr) {
      const portNum = Number(portStr);
      if (!Number.isInteger(portNum) || portNum <= 0 || portNum > 65535) {
        return localize(5151, null);
      }
    }
  }
  return void 0;
}

async function promptToConnectViaSSH(accessor, options3 = {}) {
  const sshService = accessor.get(ISSHRemoteAgentHostService);
  const quickInputService = accessor.get(IQuickInputService);
  const notificationService = accessor.get(INotificationService);
  const instantiationService = accessor.get(IInstantiationService);
  const commandService = accessor.get(ICommandService);
  const configHosts = await sshService.listSSHConfigHosts().catch(() => []);
  const aliasItems = configHosts.map((h3) => ({
    kind: "alias",
    hostAlias: h3,
    label: h3
  }));
  const addHostItem = {
    kind: "add-config",
    label: "$(plus) " + localize(5132, null),
    alwaysShow: true
  };
  const configureHostsItem = {
    kind: "configure",
    label: localize(5146, null),
    alwaysShow: true
  };
  const newHostItem = {
    kind: "new-host",
    hostInput: "",
    label: "",
    alwaysShow: true
  };
  const result = await new Promise((resolve3) => {
    const store = new DisposableStore();
    const picker = store.add(quickInputService.createQuickPick());
    picker.title = localize(5154, null);
    picker.placeholder = localize(5153, null);
    picker.ignoreFocusOut = true;
    picker.matchOnDescription = true;
    if (options3.showBackButton) {
      picker.buttons = [quickInputService.backButton];
    }
    let newHostVisible = false;
    const updateItems = () => {
      const items = [...aliasItems];
      if (newHostVisible) {
        items.push(newHostItem);
      }
      items.push(addHostItem);
      items.push(configureHostsItem);
      picker.items = items;
    };
    updateItems();
    store.add(picker.onDidChangeValue((value2) => {
      const parsed2 = parseSSHHostInput(value2);
      if (parsed2) {
        newHostItem.hostInput = value2.trim();
        newHostItem.label = `\u27A4 ${value2.trim()}`;
        if (!newHostVisible) {
          newHostVisible = true;
          updateItems();
        } else {
          picker.items = picker.items;
        }
      } else if (newHostVisible) {
        newHostVisible = false;
        updateItems();
      }
    }));
    store.add(picker.onDidTriggerButton((button) => {
      if (button === quickInputService.backButton) {
        resolve3("back");
        picker.hide();
      }
    }));
    store.add(picker.onDidAccept(() => {
      const selected = picker.selectedItems[0];
      resolve3(selected);
      picker.hide();
    }));
    store.add(picker.onDidHide(() => {
      resolve3(void 0);
      store.dispose();
    }));
    picker.show();
  });
  if (result === "back") {
    return "back";
  }
  if (!result) {
    return;
  }
  if (result.kind === "add-config" || result.kind === "configure") {
    const cmdId = result.kind === "add-config" ? RemoteAgentHostCommandIds.addNewSSHHost : RemoteAgentHostCommandIds.configureSSHHosts;
    const onBackToSSH = () => instantiationService.invokeFunction((a) => promptToConnectViaSSH(a, options3));
    await commandService.executeCommand(cmdId, onBackToSSH);
    return;
  }
  if (result.kind === "alias") {
    await instantiationService.invokeFunction(
      (accessor2) => connectToConfiguredSSHHost(accessor2, result.hostAlias)
    );
    return;
  }
  const newHost = result;
  const parsed = parseSSHHostInput(newHost.hostInput);
  if (!parsed) {
    notificationService.error(validateSSHHostInput(newHost.hostInput) ?? localize(5150, null));
    return;
  }
  await instantiationService.invokeFunction(
    (accessor2) => promptForCredentialsAndConnect(accessor2, parsed.host, parsed.username, parsed.port)
  );
}

async function connectToConfiguredSSHHost(accessor, hostAlias) {
  const sshService = accessor.get(ISSHRemoteAgentHostService);
  const notificationService = accessor.get(INotificationService);
  const instantiationService = accessor.get(IInstantiationService);
  let resolvedConfig;
  try {
    resolvedConfig = await sshService.resolveSSHConfig(hostAlias);
  } catch (err) {
    notificationService.error(localize(5165, null, hostAlias, String(err)));
    return;
  }
  const host = resolvedConfig.hostname;
  const username = resolvedConfig.user;
  const port = resolvedConfig.port !== 22 ? resolvedConfig.port : void 0;
  const suggestedName = hostAlias;
  const defaultKeyPath = resolvedConfig.identityFile[0];
  if (username) {
    const config = {
      host,
      port,
      username,
      authMethod: "agent" /* Agent */,
      privateKeyPath: defaultKeyPath,
      identityAgent: resolvedConfig.identityAgent,
      agentForward: resolvedConfig.forwardAgent || void 0,
      name: suggestedName,
      sshConfigHost: hostAlias
    };
    const connection = await instantiationService.invokeFunction(
      (accessor2) => connectWithProgress(accessor2, config, suggestedName)
    );
    if (connection) {
      await instantiationService.invokeFunction((accessor2) => promptForRemoteFolder(accessor2, connection));
    }
    return;
  }
  await instantiationService.invokeFunction(
    (accessor2) => promptForCredentialsAndConnect(accessor2, host, void 0, port, suggestedName, defaultKeyPath, resolvedConfig.identityAgent)
  );
}

async function promptForCredentialsAndConnect(accessor, host, username, port, suggestedName, defaultKeyPath, identityAgent) {
  const quickInputService = accessor.get(IQuickInputService);
  const instantiationService = accessor.get(IInstantiationService);
  if (!username) {
    const usernameInput = await quickInputService.input({
      title: localize(5169, null),
      prompt: localize(5168, null, host),
      placeHolder: "root",
      ignoreFocusLost: true,
      validateInput: async (value2) => value2.trim() ? void 0 : localize(5166, null)
    });
    if (!usernameInput) {
      return;
    }
    username = usernameInput.trim();
  }
  const authPicks = [
    {
      method: "agent" /* Agent */,
      label: localize(5133, null),
      description: localize(5134, null)
    },
    {
      method: "keyFile" /* KeyFile */,
      label: localize(5135, null),
      description: localize(5136, null)
    },
    {
      method: "password" /* Password */,
      label: localize(5137, null),
      description: localize(5138, null)
    }
  ];
  const authPicked = await quickInputService.pick(authPicks, {
    title: localize(5140, null),
    placeHolder: localize(5139, null, host)
  });
  if (!authPicked) {
    return;
  }
  const authMethod = authPicked.method;
  let privateKeyPath;
  let password;
  if (authMethod === "keyFile" /* KeyFile */) {
    const keyPath = await quickInputService.input({
      title: localize(5157, null),
      prompt: localize(5156, null),
      placeHolder: "~/.ssh/id_rsa",
      value: defaultKeyPath ?? "~/.ssh/id_rsa",
      ignoreFocusLost: true,
      validateInput: async (value2) => value2.trim() ? void 0 : localize(5155, null)
    });
    if (!keyPath) {
      return;
    }
    privateKeyPath = keyPath.trim();
  } else if (authMethod === "password" /* Password */) {
    const pw = await quickInputService.input({
      title: localize(5164, null),
      prompt: localize(5163, null, username, host),
      password: true,
      ignoreFocusLost: true,
      validateInput: async (value2) => value2 ? void 0 : localize(5162, null)
    });
    if (!pw) {
      return;
    }
    password = pw;
  }
  const defaultName = suggestedName ?? `${username}@${host}`;
  const name = await quickInputService.input({
    title: localize(5161, null),
    prompt: localize(5160, null),
    placeHolder: localize(5159, null),
    value: defaultName,
    valueSelection: [0, defaultName.length],
    ignoreFocusLost: true,
    validateInput: async (value2) => value2.trim() ? void 0 : localize(5158, null)
  });
  if (!name) {
    return;
  }
  const config = {
    host,
    port,
    username,
    authMethod,
    privateKeyPath,
    identityAgent,
    password,
    name: name.trim()
  };
  const connection = await instantiationService.invokeFunction(
    (accessor2) => connectWithProgress(accessor2, config, host)
  );
  if (connection) {
    await instantiationService.invokeFunction((accessor2) => promptForRemoteFolder(accessor2, connection));
  }
}

async function connectWithProgress(accessor, config, displayHost) {
  const sshService = accessor.get(ISSHRemoteAgentHostService);
  const notificationService = accessor.get(INotificationService);
  const telemetryService = accessor.get(ITelemetryService);
  const stopwatch = StopWatch.create(false);
  const handle2 = notificationService.notify({
    severity: Severity2.Info,
    message: localize(5148, null, displayHost),
    progress: { infinite: true }
  });
  const expectedKey = config.sshConfigHost ? `ssh:${config.sshConfigHost}` : `${config.username}@${config.host}:${config.port ?? 22}`;
  const progressListener = sshService.onDidReportConnectProgress?.((progress) => {
    if (progress.connectionKey === expectedKey) {
      handle2.updateMessage(progress.message);
    }
  });
  try {
    const connection = await sshService.connect(config);
    logSSHConnectAttempt(telemetryService, {
      operation: "connect",
      userInitiated: config.userInitiated ?? true,
      attempt: 1,
      durationMs: stopwatch.elapsed(),
      success: true,
      willRetry: false
    });
    handle2.close();
    return connection;
  } catch (err) {
    logSSHConnectAttempt(telemetryService, {
      operation: "connect",
      userInitiated: config.userInitiated ?? true,
      attempt: 1,
      durationMs: stopwatch.elapsed(),
      success: false,
      willRetry: false,
      errorCategory: categorizeSSHConnectError(err)
    });
    handle2.close();
    if (isCancellationError(err) || isSSHHostKeyDeniedError(err)) {
      return void 0;
    }
    notificationService.error(localize(5147, null, displayHost, String(err)));
    return void 0;
  } finally {
    progressListener?.dispose();
  }
}

async function promptForRemoteFolder(accessor, connection) {
  const sessionsProvidersService = accessor.get(ISessionsProvidersService);
  const sessionsService = accessor.get(ISessionsService);
  const sessionsPartService = accessor.get(ISessionsPartService);
  const provider = sessionsProvidersService.getProviders().find((p) => isAgentHostProvider(p) && p.remoteAddress === connection.localAddress);
  if (!provider) {
    return;
  }
  const browseAction = provider.browseActions[0];
  if (!browseAction) {
    return;
  }
  const workspace = await browseAction.run();
  if (!workspace) {
    return;
  }
  const folderUri = workspace.folders[0]?.root;
  if (!folderUri) {
    return;
  }
  sessionsService.openNewSession();
  sessionsPartService.getSessionView(sessionsService.activeSession.get()?.sessionId)?.selectWorkspace(folderUri);
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RemoteAgentHostCommandIds.connectViaSSH,
      title: localize2(5122, "Connect to Remote Agent Host via SSH"),
      shortTitle: localize2(5123, "SSH..."),
      category: SessionsCategories.Sessions,
      f1: true,
      icon: Codicon.remote,
      precondition: ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true),
      menu: {
        id: Menus.SessionWorkspaceManage,
        order: 20,
        when: SessionWorkspacePickerGroupContext.isEqualTo(SESSION_WORKSPACE_GROUP_REMOTE)
      }
    });
  }
  async run(accessor, onBack) {
    const result = await promptToConnectViaSSH(accessor, { showBackButton: !!onBack });
    if (result === "back") {
      onBack?.();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RemoteAgentHostCommandIds.addNewSSHHost,
      title: localize2(5114, "Add New SSH Host..."),
      category: SessionsCategories.Sessions,
      f1: true,
      precondition: ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true)
    });
  }
  async run(accessor) {
    const sshService = accessor.get(ISSHRemoteAgentHostService);
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const notificationService = accessor.get(INotificationService);
    let configUri;
    try {
      configUri = await sshService.ensureUserSSHConfig();
    } catch (err) {
      notificationService.error(localize(5141, null, String(err)));
      return;
    }
    const editorPane = await editorService.openEditor({ resource: configUri, options: { pinned: true } });
    if (!editorPane) {
      return;
    }
    const control = editorPane.getControl();
    if (!isCodeEditor(control) || !control.hasModel()) {
      return;
    }
    const editor = control;
    const model = editor.getModel();
    if (!model) {
      return;
    }
    let appendNewline = false;
    try {
      const stat = await fileService.stat(configUri);
      if (stat.size > 0) {
        const content = model.getValueInRange(model.getFullModelRange(), 1 /* LF */);
        appendNewline = content.length > 0 && !content.endsWith("\n");
      }
    } catch {
    }
    const lastLine = model.getLineCount();
    const lastCol = model.getLineMaxColumn(lastLine);
    editor.setSelection(new Range2(lastLine, lastCol, lastLine, lastCol));
    const snippet = (appendNewline ? "\n" : "") + "Host ${1:alias}\n    HostName ${2:hostname}\n    User ${3:user}\n";
    SnippetController2.get(editor)?.insert(snippet);
    editor.focus();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RemoteAgentHostCommandIds.configureSSHHosts,
      title: localize2(5121, "Configure SSH Hosts..."),
      category: SessionsCategories.Sessions,
      f1: true,
      precondition: ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true)
    });
  }
  async run(accessor, onBack) {
    const sshService = accessor.get(ISSHRemoteAgentHostService);
    const editorService = accessor.get(IEditorService);
    const quickInputService = accessor.get(IQuickInputService);
    const notificationService = accessor.get(INotificationService);
    let configFiles;
    try {
      configFiles = await sshService.listSSHConfigFiles();
    } catch (err) {
      notificationService.error(localize(5142, null, String(err)));
      return;
    }
    if (configFiles.length === 0) {
      try {
        const uri4 = await sshService.ensureUserSSHConfig();
        await editorService.openEditor({ resource: uri4, options: { pinned: true } });
      } catch (err) {
        notificationService.error(localize(5143, null, String(err)));
      }
      return;
    }
    const userConfigUri = configFiles[0];
    const items = configFiles.map((uri4, index2) => ({
      label: uri4.fsPath,
      uri: uri4,
      isUserConfig: index2 === 0
    }));
    if (items.length === 1 && !onBack) {
      const picked2 = items[0];
      try {
        const uri4 = picked2.isUserConfig ? await sshService.ensureUserSSHConfig().catch(() => userConfigUri) : picked2.uri;
        await editorService.openEditor({ resource: uri4, options: { pinned: true } });
      } catch (err) {
        notificationService.error(localize(5143, null, String(err)));
      }
      return;
    }
    const picked = await new Promise((resolve3) => {
      const store = new DisposableStore();
      const picker = store.add(quickInputService.createQuickPick());
      picker.title = localize(5145, null);
      picker.placeholder = localize(5144, null);
      picker.items = items;
      if (onBack) {
        picker.buttons = [quickInputService.backButton];
      }
      store.add(picker.onDidTriggerButton((button) => {
        if (button === quickInputService.backButton) {
          resolve3("back");
          picker.hide();
        }
      }));
      store.add(picker.onDidAccept(() => {
        resolve3(picker.selectedItems[0]);
        picker.hide();
      }));
      store.add(picker.onDidHide(() => {
        resolve3(void 0);
        store.dispose();
      }));
      picker.show();
    });
    if (picked === "back") {
      onBack?.();
      return;
    }
    if (!picked) {
      return;
    }
    try {
      const uri4 = picked.isUserConfig ? await sshService.ensureUserSSHConfig().catch(() => userConfigUri) : picked.uri;
      await editorService.openEditor({ resource: uri4, options: { pinned: true } });
    } catch (err) {
      notificationService.error(localize(5143, null, String(err)));
    }
  }
});

async function promptToConnectViaTunnel(accessor, options3 = {}) {
  const tunnelService = accessor.get(ITunnelAgentHostService);
  const quickInputService = accessor.get(IQuickInputService);
  const notificationService = accessor.get(INotificationService);
  const authenticationService = accessor.get(IAuthenticationService);
  const instantiationService = accessor.get(IInstantiationService);
  const productService = accessor.get(IProductService);
  const dialogService = accessor.get(IDialogService);
  const tunnelHostService = accessor.get(ITunnelHostService);
  const authProvider = "github";
  const scopes = productService.tunnelApplicationConfig?.authenticationProviders?.[authProvider]?.scopes ?? [];
  try {
    if (!(await authenticationService.getSessions(authProvider, scopes)).length) {
      await authenticationService.createSession(authProvider, scopes, { activateImmediate: true });
    }
  } catch {
    notificationService.error(localize(5170, null));
    return;
  }
  const store = new DisposableStore();
  const tunnelPicker = store.add(quickInputService.createQuickPick());
  tunnelPicker.title = localize(5185, null);
  tunnelPicker.placeholder = localize(5184, null);
  tunnelPicker.busy = true;
  if (options3.showBackButton) {
    tunnelPicker.buttons = [quickInputService.backButton];
  }
  tunnelPicker.show();
  let tunnels;
  try {
    tunnels = await tunnelService.listTunnels();
  } catch (err) {
    store.dispose();
    notificationService.error(localize(5178, null, err instanceof Error ? err.message : String(err)));
    return;
  }
  if (tunnels.length === 0) {
    store.dispose();
    notificationService.info(localize(5179, null));
    return;
  }
  const deleteTunnelButton = {
    iconClass: ThemeIcon.asClassName(Codicon.trash),
    tooltip: localize(5177, null)
  };
  const isHostedTunnel = (tunnel) => isTunnelHosted(tunnelHostService.sharingInfo, tunnel);
  const toTunnelPickItems = (tunnelInfos) => tunnelInfos.filter((tunnel) => !isHostedTunnel(tunnel)).map((tunnel) => ({
    label: tunnel.name,
    description: tunnel.hostConnectionCount > 0 ? localize(5183, null, tunnel.tunnelId) : localize(5182, null, tunnel.tunnelId),
    buttons: tunnelService.canDeleteTunnels ? [deleteTunnelButton] : void 0,
    tunnel
  }));
  const updateTunnelPickerItems = () => {
    tunnelPicker.items = toTunnelPickItems(tunnels);
  };
  if (toTunnelPickItems(tunnels).length === 0) {
    store.dispose();
    notificationService.info(localize(5181, null));
    return;
  }
  updateTunnelPickerItems();
  store.add(tunnelHostService.onDidChangeStatus(updateTunnelPickerItems));
  tunnelPicker.busy = false;
  const picked = await new Promise((resolve3) => {
    let isDeleting = false;
    store.add(tunnelPicker.onDidTriggerButton((button) => {
      if (button === quickInputService.backButton) {
        resolve3("back");
        tunnelPicker.hide();
      }
    }));
    store.add(tunnelPicker.onDidAccept(() => {
      if (isDeleting) {
        return;
      }
      const picked2 = tunnelPicker.selectedItems[0];
      if (picked2 && isHostedTunnel(picked2.tunnel)) {
        updateTunnelPickerItems();
        return;
      }
      resolve3(picked2);
      tunnelPicker.hide();
    }));
    store.add(tunnelPicker.onDidTriggerItemButton(async (event) => {
      if (event.button !== deleteTunnelButton || isDeleting) {
        return;
      }
      const previousIgnoreFocusOut = tunnelPicker.ignoreFocusOut;
      isDeleting = true;
      tunnelPicker.ignoreFocusOut = true;
      let keepOpen = true;
      try {
        const confirmation = await dialogService.confirm({
          type: "warning",
          message: localize(5174, null, event.item.tunnel.name),
          detail: localize(5175, null),
          primaryButton: localize(5173, null)
        });
        if (!confirmation.confirmed) {
          return;
        }
        tunnelPicker.busy = true;
        await tunnelService.deleteTunnel(event.item.tunnel);
        tunnels = await tunnelService.listTunnels();
        if (toTunnelPickItems(tunnels).length === 0) {
          keepOpen = false;
          notificationService.info(localize(5180, null));
          return;
        }
        updateTunnelPickerItems();
      } catch (err) {
        notificationService.error(localize(5176, null, event.item.tunnel.name, err instanceof Error ? err.message : String(err)));
      } finally {
        tunnelPicker.busy = false;
        tunnelPicker.ignoreFocusOut = previousIgnoreFocusOut;
        isDeleting = false;
        if (keepOpen) {
          tunnelPicker.show();
        } else {
          resolve3(void 0);
          tunnelPicker.hide();
          store.dispose();
        }
      }
    }));
    store.add(tunnelPicker.onDidHide(() => {
      if (isDeleting) {
        return;
      }
      resolve3(void 0);
      store.dispose();
    }));
  });
  if (picked === "back") {
    return "back";
  }
  if (!picked) {
    return;
  }
  const handle2 = notificationService.notify({
    severity: Severity2.Info,
    message: localize(5172, null, picked.tunnel.name),
    progress: { infinite: true }
  });
  try {
    await tunnelService.connect(picked.tunnel, authProvider);
    handle2.close();
  } catch (err) {
    handle2.close();
    notificationService.error(localize(5171, null, picked.tunnel.name, err instanceof Error ? err.message : String(err)));
    return;
  }
  await instantiationService.invokeFunction((accessor2) => promptForTunnelFolder(accessor2, picked.tunnel));
}

async function promptForTunnelFolder(accessor, tunnel) {
  const sessionsProvidersService = accessor.get(ISessionsProvidersService);
  const sessionsService = accessor.get(ISessionsService);
  const sessionsPartService = accessor.get(ISessionsPartService);
  const tunnelAddress = `${TUNNEL_ADDRESS_PREFIX}${tunnel.tunnelId}`;
  const provider = sessionsProvidersService.getProviders().find((p) => isAgentHostProvider(p) && p.remoteAddress === tunnelAddress);
  if (!provider) {
    return;
  }
  const browseAction = provider.browseActions[0];
  if (!browseAction) {
    return;
  }
  const workspace = await browseAction.run();
  if (!workspace) {
    return;
  }
  const folderUri = workspace.folders[0]?.root;
  if (!folderUri) {
    return;
  }
  sessionsService.openNewSession();
  sessionsPartService.getSessionView(sessionsService.activeSession.get()?.sessionId)?.selectWorkspace(folderUri, provider.id);
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RemoteAgentHostCommandIds.connectViaTunnel,
      title: localize2(5124, "Connect to Remote Agent Host via Dev Tunnel"),
      shortTitle: localize2(5125, "Tunnels..."),
      category: SessionsCategories.Sessions,
      f1: true,
      icon: Codicon.cloud,
      precondition: ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true),
      menu: {
        id: Menus.SessionWorkspaceManage,
        order: 10,
        when: SessionWorkspacePickerGroupContext.isEqualTo(SESSION_WORKSPACE_GROUP_REMOTE)
      }
    });
  }
  async run(accessor, onBack) {
    const result = await promptToConnectViaTunnel(accessor, { showBackButton: !!onBack });
    if (result === "back") {
      onBack?.();
    }
  }
});

async function promptToConnectViaWSL(accessor, options3 = {}) {
  const wslService = accessor.get(IWSLRemoteAgentHostService);
  const notificationService = accessor.get(INotificationService);
  const quickInputService = accessor.get(IQuickInputService);
  const openerService = accessor.get(IOpenerService);
  const instantiationService = accessor.get(IInstantiationService);
  const logService = accessor.get(ILogService);
  const installAction = new Action(
    "wsl.openDocs",
    localize(5195, null),
    void 0,
    true,
    () => openerService.open(URI.parse(WSL_INSTALL_DOCS_URL))
  );
  if (!await wslService.isWSLAvailable()) {
    notificationService.notify({
      severity: Severity2.Info,
      message: localize(5198, null),
      actions: { primary: [installAction] }
    });
    return;
  }
  let distros;
  try {
    distros = await wslService.listDistros();
  } catch (err) {
    logService.error("[WSL] listDistros failed", err);
    notificationService.error(localize(5196, null, toErrorMessage(err)));
    return;
  }
  if (distros.length === 0) {
    notificationService.notify({
      severity: Severity2.Info,
      message: localize(5197, null),
      actions: { primary: [installAction] }
    });
    return;
  }
  const items = distros.map((d) => ({
    label: d.name,
    description: d.isRunning ? localize(5193, null) : localize(5194, null),
    detail: d.isDefault ? localize(5192, null) : void 0,
    distro: d
  }));
  let picked;
  if (items.length === 1 && !options3.showBackButton) {
    picked = items[0];
  } else {
    const result = await new Promise((resolve3) => {
      const store = new DisposableStore();
      const picker = store.add(quickInputService.createQuickPick());
      picker.title = localize(5200, null);
      picker.placeholder = localize(5199, null);
      picker.items = items;
      if (options3.showBackButton) {
        picker.buttons = [quickInputService.backButton];
      }
      store.add(picker.onDidTriggerButton((button) => {
        if (button === quickInputService.backButton) {
          resolve3("back");
          picker.hide();
        }
      }));
      store.add(picker.onDidAccept(() => {
        resolve3(picker.selectedItems[0]);
        picker.hide();
      }));
      store.add(picker.onDidHide(() => {
        resolve3(void 0);
        store.dispose();
      }));
      picker.show();
    });
    if (result === "back") {
      return "back";
    }
    if (!result) {
      return;
    }
    picked = result;
  }
  const handle2 = notificationService.notify({
    severity: Severity2.Info,
    message: localize(5191, null, picked.distro.name),
    progress: { infinite: true }
  });
  const expectedKey = `wsl:${picked.distro.name}`;
  const progressListener = wslService.onDidReportConnectProgress?.((progress) => {
    if (progress.connectionKey === expectedKey) {
      handle2.updateMessage(progress.message);
    }
  });
  try {
    await wslService.connect({ distro: picked.distro.name, name: picked.distro.name });
    handle2.close();
  } catch (err) {
    handle2.close();
    if (isCancellationError(err)) {
      return;
    }
    logService.error(`[WSL] Connect to '${picked.distro.name}' failed`, err);
    notificationService.error(localize(5190, null, picked.distro.name, toErrorMessage(err)));
    return;
  } finally {
    progressListener?.dispose();
  }
  await instantiationService.invokeFunction((accessor2) => promptForWSLFolder(accessor2, picked.distro.name));
}

async function promptForWSLFolder(accessor, distro) {
  const sessionsProvidersService = accessor.get(ISessionsProvidersService);
  const sessionsService = accessor.get(ISessionsService);
  const sessionsPartService = accessor.get(ISessionsPartService);
  const wslAddress = `wsl:${distro}`;
  const provider = sessionsProvidersService.getProviders().find((p) => isAgentHostProvider(p) && p.remoteAddress === wslAddress);
  if (!provider) {
    return;
  }
  const browseAction = provider.browseActions[0];
  if (!browseAction) {
    return;
  }
  const workspace = await browseAction.run();
  if (!workspace) {
    return;
  }
  const folderUri = workspace.folders[0]?.root;
  if (!folderUri) {
    return;
  }
  sessionsService.openNewSession();
  sessionsPartService.getSessionView(sessionsService.activeSession.get()?.sessionId)?.selectWorkspace(folderUri, provider.id);
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RemoteAgentHostCommandIds.connectViaWSL,
      title: localize2(5126, "Connect to Remote Agent Host via WSL"),
      shortTitle: localize2(5127, "WSL..."),
      category: SessionsCategories.Sessions,
      f1: true,
      icon: Codicon.terminalLinux,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals("isWindows", true),
        ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true)
      ),
      menu: {
        id: Menus.SessionWorkspaceManage,
        order: 15,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("isWindows", true),
          SessionWorkspacePickerGroupContext.isEqualTo(SESSION_WORKSPACE_GROUP_REMOTE)
        )
      }
    });
  }
  async run(accessor, onBack) {
    const result = await promptToConnectViaWSL(accessor, { showBackButton: !!onBack });
    if (result === "back") {
      onBack?.();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RemoteAgentHostCommandIds.updateRemoteAgentHost,
      title: localize2(5186, "Update Remote Agent Host Server..."),
      category: SessionsCategories.Sessions,
      f1: true,
      precondition: ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true)
    });
  }
  async run(accessor) {
    const sessionsProvidersService = accessor.get(ISessionsProvidersService);
    const quickInputService = accessor.get(IQuickInputService);
    const notificationService = accessor.get(INotificationService);
    const instantiationService = accessor.get(IInstantiationService);
    const remoteHosts = sessionsProvidersService.getProviders().filter(isAgentHostProvider).filter((provider) => !!provider.remoteAddress);
    let incompatibleCount = 0;
    const upgradable = remoteHosts.map((provider) => {
      const status2 = provider.connectionStatus?.get();
      if (!RemoteAgentHostConnectionStatus.isIncompatible(status2)) {
        return void 0;
      }
      incompatibleCount++;
      return status2.vscodeUpgradeMethod ? { provider, method: status2.vscodeUpgradeMethod } : void 0;
    }).filter((entry) => !!entry);
    if (upgradable.length === 0) {
      notificationService.info(incompatibleCount > 0 ? localize(5188, null) : localize(5187, null));
      return;
    }
    let target = upgradable[0];
    if (upgradable.length > 1) {
      const picked = await quickInputService.pick(
        upgradable.map((entry) => ({
          label: entry.provider.label,
          description: entry.provider.remoteAddress,
          entry
        })),
        { placeHolder: localize(5189, null) }
      );
      if (!picked) {
        return;
      }
      target = picked.entry;
    }
    await instantiationService.invokeFunction(runServerUpgrade, target.provider, target.method);
  }
});
export { parseSSHHostInput, validateSSHHostInput, promptToConnectViaSSH, connectToConfiguredSSHHost, promptForCredentialsAndConnect, connectWithProgress, promptForRemoteFolder, promptToConnectViaTunnel, promptForTunnelFolder, promptToConnectViaWSL, promptForWSLFolder, RemoteAgentHostCommandIds };
