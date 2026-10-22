// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTerminalService.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, combinedDisposable } from "./module-0012.mjs";
import { OS } from "./module-0014.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { deserializeEnvironmentDescriptionMap, deserializeEnvironmentVariableCollection, serializeEnvironmentVariableCollection } from "./module-1273.mjs";
import { URI } from "./module-0032.mjs";
import { TerminalProcessExtHostProxy } from "./module-1271.mjs";
import { remoteResolverTerminal } from "./module-1154.mjs";
import { Promises } from "./module-0036.mjs";
import { hasKey } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from "./module-1149.mjs";
import { ITerminalLinkProviderService } from "./module-1274.mjs";
import { ITerminalQuickFixService } from "./module-1275.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEnvironmentVariableService } from "./module-1272.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITerminalProfileResolverService, ITerminalProfileService } from "./module-1173.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { ITerminalCompletionService } from "./module-1279.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { TerminalDataBufferer } from "./module-1270.mjs";


// src/vs/workbench/api/browser/mainThreadTerminalService.ts
var MainThreadTerminalService = class extends Disposable {
  constructor(_extHostContext, _terminalService, _terminalLinkProviderService, _terminalQuickFixService, _instantiationService, _environmentVariableService, _logService, _terminalProfileResolverService, remoteAgentService, _terminalGroupService, _terminalEditorService, _terminalProfileService, _terminalCompletionService, _environmentService) {
    super();
    this._terminalService = _terminalService;
    this._terminalLinkProviderService = _terminalLinkProviderService;
    this._terminalQuickFixService = _terminalQuickFixService;
    this._instantiationService = _instantiationService;
    this._environmentVariableService = _environmentVariableService;
    this._logService = _logService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._terminalGroupService = _terminalGroupService;
    this._terminalEditorService = _terminalEditorService;
    this._terminalProfileService = _terminalProfileService;
    this._terminalCompletionService = _terminalCompletionService;
    this._environmentService = _environmentService;
    /**
     * Stores a map from a temporary terminal id (a UUID generated on the extension host side)
     * to a numeric terminal id (an id generated on the renderer side)
     * This comes in play only when dealing with terminals created on the extension host side
     */
    this._extHostTerminals = /* @__PURE__ */ new Map();
    this._terminalProcessProxies = this._register(new DisposableMap());
    this._profileProviders = this._register(new DisposableMap());
    this._completionProviders = this._register(new DisposableMap());
    this._quickFixProviders = this._register(new DisposableMap());
    this._dataEventTracker = this._register(new MutableDisposable());
    this._sendCommandEventListener = this._register(new MutableDisposable());
    /**
     * A single shared terminal link provider for the exthost. When an ext registers a link
     * provider, this is registered with the terminal on the renderer side and all links are
     * provided through this, even from multiple ext link providers. Xterm should remove lower
     * priority intersecting links itself.
     */
    this._linkProvider = this._register(new MutableDisposable());
    this._os = OS;
    this._proxy = _extHostContext.getProxy(ExtHostContext.ExtHostTerminalService);
    this._register(_terminalService.onDidCreateInstance((instance2) => {
      this._onTerminalOpened(instance2);
      this._onInstanceDimensionsChanged(instance2);
    }));
    this._register(_terminalService.onDidDisposeInstance((instance2) => this._onTerminalDisposed(instance2)));
    this._register(_terminalService.onAnyInstanceProcessIdReady((instance2) => this._onTerminalProcessIdReady(instance2)));
    this._register(_terminalService.onDidChangeInstanceDimensions((instance2) => this._onInstanceDimensionsChanged(instance2)));
    this._register(_terminalService.onAnyInstanceMaximumDimensionsChange((instance2) => this._onInstanceMaximumDimensionsChanged(instance2)));
    this._register(_terminalService.onDidRequestStartExtensionTerminal((e) => this._onRequestStartExtensionTerminal(e)));
    this._register(_terminalService.onDidChangeActiveInstance((instance2) => this._onActiveTerminalChanged(instance2 ? instance2.instanceId : null)));
    this._register(_terminalService.onAnyInstanceTitleChange((instance2) => instance2 && this._onTitleChanged(instance2.instanceId, instance2.title)));
    this._register(_terminalService.onAnyInstanceDataInput((instance2) => this._proxy.$acceptTerminalInteraction(instance2.instanceId)));
    this._register(_terminalService.onAnyInstanceSelectionChange((instance2) => this._proxy.$acceptTerminalSelection(instance2.instanceId, instance2.selection)));
    this._register(_terminalService.onAnyInstanceShellTypeChanged((instance2) => this._onShellTypeChanged(instance2.instanceId)));
    for (const instance2 of this._terminalService.instances) {
      this._onTerminalOpened(instance2);
      instance2.processReady.then(() => this._onTerminalProcessIdReady(instance2));
      if (instance2.shellType) {
        this._proxy.$acceptTerminalShellType(instance2.instanceId, instance2.shellType);
      }
    }
    const activeInstance = this._terminalService.activeInstance;
    if (activeInstance) {
      this._proxy.$acceptActiveTerminalChanged(activeInstance.instanceId);
    }
    if (this._environmentVariableService.collections.size > 0) {
      const collectionAsArray = [...this._environmentVariableService.collections.entries()];
      const serializedCollections = collectionAsArray.map((e) => {
        return [e[0], serializeEnvironmentVariableCollection(e[1].map)];
      });
      this._proxy.$initEnvironmentVariableCollections(serializedCollections);
    }
    remoteAgentService.getEnvironment().then(async (env2) => {
      this._os = env2?.os || OS;
      this._updateDefaultProfile();
    });
    this._register(this._terminalProfileService.onDidChangeAvailableProfiles(() => this._updateDefaultProfile()));
  }
  async _updateDefaultProfile() {
    const remoteAuthority = this._environmentService.remoteAuthority;
    const defaultProfile = this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority, os: this._os });
    const defaultAutomationProfile = this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority, os: this._os, allowAutomationShell: true });
    this._proxy.$acceptDefaultProfile(...await Promise.all([defaultProfile, defaultAutomationProfile]));
  }
  async _getTerminalInstance(id2) {
    if (typeof id2 === "string") {
      return this._extHostTerminals.get(id2);
    }
    return this._terminalService.getInstanceFromId(id2);
  }
  async $createTerminal(extHostTerminalId, launchConfig) {
    const shellLaunchConfig = {
      name: launchConfig.name,
      executable: launchConfig.shellPath,
      args: launchConfig.shellArgs,
      cwd: typeof launchConfig.cwd === "string" ? launchConfig.cwd : URI.revive(launchConfig.cwd),
      icon: launchConfig.icon,
      color: launchConfig.color,
      initialText: launchConfig.initialText,
      waitOnExit: launchConfig.waitOnExit,
      ignoreConfigurationCwd: true,
      env: launchConfig.env,
      strictEnv: launchConfig.strictEnv,
      hideFromUser: launchConfig.hideFromUser,
      customPtyImplementation: launchConfig.isExtensionCustomPtyTerminal ? (id2, cols, rows) => new TerminalProcessExtHostProxy(id2, cols, rows, this._terminalService) : void 0,
      extHostTerminalId,
      forceShellIntegration: launchConfig.forceShellIntegration,
      isFeatureTerminal: launchConfig.isFeatureTerminal,
      [remoteResolverTerminal]: launchConfig.isRemoteResolverTerminal || void 0,
      isExtensionOwnedTerminal: launchConfig.isExtensionOwnedTerminal,
      useShellEnvironment: launchConfig.useShellEnvironment,
      isTransient: launchConfig.isTransient,
      shellIntegrationNonce: launchConfig.shellIntegrationNonce,
      titleTemplate: launchConfig.titleTemplate
    };
    const terminal2 = Promises.withAsyncBody(async (r2) => {
      const terminal3 = await this._terminalService.createTerminal({
        config: shellLaunchConfig,
        cwd: launchConfig.isRemoteResolverTerminal ? shellLaunchConfig.cwd : void 0,
        location: await this._deserializeParentTerminal(launchConfig.location)
      });
      r2(terminal3);
    });
    this._extHostTerminals.set(extHostTerminalId, terminal2);
    const terminalInstance = await terminal2;
    this._register(terminalInstance.onDisposed(() => {
      this._extHostTerminals.delete(extHostTerminalId);
    }));
  }
  async _deserializeParentTerminal(location2) {
    if (typeof location2 === "object" && hasKey(location2, { parentTerminal: true })) {
      const parentTerminal = await this._extHostTerminals.get(location2.parentTerminal.toString());
      return parentTerminal ? { parentTerminal } : void 0;
    }
    return location2;
  }
  async $show(id2, preserveFocus) {
    const terminalInstance = await this._getTerminalInstance(id2);
    if (terminalInstance) {
      this._terminalService.setActiveInstance(terminalInstance);
      if (terminalInstance.target === 2 /* Editor */) {
        await this._terminalEditorService.revealActiveEditor(preserveFocus);
      } else {
        await this._terminalGroupService.showPanel(!preserveFocus);
      }
    }
  }
  async $hide(id2) {
    const instanceToHide = await this._getTerminalInstance(id2);
    const activeInstance = this._terminalService.activeInstance;
    if (activeInstance && activeInstance.instanceId === instanceToHide?.instanceId && activeInstance.target !== 2 /* Editor */) {
      this._terminalGroupService.hidePanel();
    }
  }
  async $dispose(id2) {
    (await this._getTerminalInstance(id2))?.dispose(4 /* Extension */);
  }
  async $sendText(id2, text2, shouldExecute) {
    const instance2 = await this._getTerminalInstance(id2);
    await instance2?.sendText(text2, shouldExecute);
  }
  $sendProcessExit(terminalId, exitCode) {
    this._terminalProcessProxies.get(terminalId)?.proxy.emitExit(exitCode);
  }
  $startSendingDataEvents() {
    if (!this._dataEventTracker.value) {
      this._dataEventTracker.value = this._instantiationService.createInstance(TerminalDataEventTracker, (id2, data) => {
        this._onTerminalData(id2, data);
      });
      for (const instance2 of this._terminalService.instances) {
        for (const data of instance2.initialDataEvents || []) {
          this._onTerminalData(instance2.instanceId, data);
        }
      }
    }
  }
  $stopSendingDataEvents() {
    this._dataEventTracker.clear();
  }
  $startSendingCommandEvents() {
    if (this._sendCommandEventListener.value) {
      return;
    }
    const multiplexer = this._terminalService.createOnInstanceCapabilityEvent(2 /* CommandDetection */, (capability) => capability.onCommandFinished);
    const sub = multiplexer.event((e) => {
      this._onDidExecuteCommand(e.instance.instanceId, {
        commandLine: e.data.command,
        // TODO: Convert to URI if possible
        cwd: e.data.cwd,
        exitCode: e.data.exitCode,
        output: e.data.getOutput()
      });
    });
    this._sendCommandEventListener.value = combinedDisposable(multiplexer, sub);
  }
  $stopSendingCommandEvents() {
    this._sendCommandEventListener.clear();
  }
  $startLinkProvider() {
    this._linkProvider.value = this._terminalLinkProviderService.registerLinkProvider(new ExtensionTerminalLinkProvider(this._proxy));
  }
  $stopLinkProvider() {
    this._linkProvider.clear();
  }
  $registerProcessSupport(isSupported) {
    this._terminalService.registerProcessSupport(isSupported);
  }
  $registerCompletionProvider(id2, extensionIdentifier, ...triggerCharacters) {
    this._completionProviders.set(id2, this._terminalCompletionService.registerTerminalCompletionProvider(extensionIdentifier, id2, {
      id: id2,
      provideCompletions: async (commandLine, cursorIndex, token) => {
        const completions = await this._proxy.$provideTerminalCompletions(id2, { commandLine, cursorIndex }, token);
        if (!completions) {
          return void 0;
        }
        if (completions.resourceOptions) {
          const { cwd: cwd2, globPattern, ...rest } = completions.resourceOptions;
          return {
            items: completions.items?.map((c) => ({
              provider: `ext:${id2}`,
              ...c
            })),
            resourceOptions: {
              ...rest,
              cwd: cwd2,
              globPattern
            }
          };
        }
        return completions.items?.map((c) => ({
          provider: `ext:${id2}`,
          ...c
        }));
      }
    }, ...triggerCharacters));
  }
  $unregisterCompletionProvider(id2) {
    this._completionProviders.deleteAndDispose(id2);
  }
  $registerProfileProvider(id2, extensionIdentifier) {
    this._profileProviders.set(id2, this._terminalProfileService.registerTerminalProfileProvider(extensionIdentifier, id2, {
      createContributedTerminalProfile: async (options3) => {
        return this._proxy.$createContributedProfileTerminal(id2, options3);
      }
    }));
  }
  $unregisterProfileProvider(id2) {
    this._profileProviders.deleteAndDispose(id2);
  }
  async $registerQuickFixProvider(id2, extensionId) {
    this._quickFixProviders.set(id2, this._terminalQuickFixService.registerQuickFixProvider(id2, {
      provideTerminalQuickFixes: async (terminalCommand, lines, options3, token) => {
        if (token.isCancellationRequested) {
          return;
        }
        if (options3.outputMatcher?.length && options3.outputMatcher.length > 40) {
          options3.outputMatcher.length = 40;
          this._logService.warn("Cannot exceed output matcher length of 40");
        }
        const commandLineMatch = terminalCommand.command.match(options3.commandLineMatcher);
        if (!commandLineMatch || !lines) {
          return;
        }
        const outputMatcher = options3.outputMatcher;
        let outputMatch;
        if (outputMatcher) {
          outputMatch = getOutputMatchForLines(lines, outputMatcher);
        }
        if (!outputMatch) {
          return;
        }
        const matchResult = { commandLineMatch, outputMatch, commandLine: terminalCommand.command };
        if (matchResult) {
          const result = await this._proxy.$provideTerminalQuickFixes(id2, matchResult, token);
          if (result && Array.isArray(result)) {
            return result.map((r2) => parseQuickFix(id2, extensionId, r2));
          } else if (result) {
            return parseQuickFix(id2, extensionId, result);
          }
        }
        return;
      }
    }));
  }
  $unregisterQuickFixProvider(id2) {
    this._quickFixProviders.deleteAndDispose(id2);
  }
  _onActiveTerminalChanged(terminalId) {
    this._proxy.$acceptActiveTerminalChanged(terminalId);
  }
  _onTerminalData(terminalId, data) {
    this._proxy.$acceptTerminalProcessData(terminalId, data);
  }
  _onDidExecuteCommand(terminalId, command4) {
    this._proxy.$acceptDidExecuteCommand(terminalId, command4);
  }
  _onTitleChanged(terminalId, name) {
    this._proxy.$acceptTerminalTitleChange(terminalId, name);
  }
  _onShellTypeChanged(terminalId) {
    const terminalInstance = this._terminalService.getInstanceFromId(terminalId);
    if (terminalInstance) {
      this._proxy.$acceptTerminalShellType(terminalId, terminalInstance.shellType);
    }
  }
  _onTerminalDisposed(terminalInstance) {
    this._proxy.$acceptTerminalClosed(terminalInstance.instanceId, terminalInstance.exitCode, terminalInstance.exitReason ?? 0 /* Unknown */);
    this._terminalProcessProxies.deleteAndDispose(terminalInstance.instanceId);
  }
  _onTerminalOpened(terminalInstance) {
    const extHostTerminalId = terminalInstance.shellLaunchConfig.extHostTerminalId;
    const shellLaunchConfigDto = {
      name: terminalInstance.shellLaunchConfig.name,
      executable: terminalInstance.shellLaunchConfig.executable,
      args: terminalInstance.shellLaunchConfig.args,
      cwd: terminalInstance.shellLaunchConfig.cwd,
      env: terminalInstance.shellLaunchConfig.env,
      hideFromUser: terminalInstance.shellLaunchConfig.hideFromUser,
      tabActions: terminalInstance.shellLaunchConfig.tabActions,
      titleTemplate: terminalInstance.shellLaunchConfig.titleTemplate
    };
    this._proxy.$acceptTerminalOpened(terminalInstance.instanceId, extHostTerminalId, terminalInstance.title, shellLaunchConfigDto);
  }
  _onTerminalProcessIdReady(terminalInstance) {
    if (terminalInstance.processId === void 0) {
      return;
    }
    this._proxy.$acceptTerminalProcessId(terminalInstance.instanceId, terminalInstance.processId);
  }
  _onInstanceDimensionsChanged(instance2) {
    this._proxy.$acceptTerminalDimensions(instance2.instanceId, instance2.cols, instance2.rows);
  }
  _onInstanceMaximumDimensionsChanged(instance2) {
    this._proxy.$acceptTerminalMaximumDimensions(instance2.instanceId, instance2.maxCols, instance2.maxRows);
  }
  _onRequestStartExtensionTerminal(request2) {
    const proxy = request2.proxy;
    const store = new DisposableStore();
    store.add(proxy);
    this._terminalProcessProxies.set(proxy.instanceId, { proxy, dispose: () => store.dispose() });
    const initialDimensions = request2.cols && request2.rows ? {
      columns: request2.cols,
      rows: request2.rows
    } : void 0;
    this._proxy.$startExtensionTerminal(
      proxy.instanceId,
      initialDimensions
    ).then(request2.callback);
    store.add(proxy.onInput((data) => this._proxy.$acceptProcessInput(proxy.instanceId, data)));
    store.add(proxy.onShutdown((immediate) => this._proxy.$acceptProcessShutdown(proxy.instanceId, immediate)));
    store.add(proxy.onRequestCwd(() => this._proxy.$acceptProcessRequestCwd(proxy.instanceId)));
    store.add(proxy.onRequestInitialCwd(() => this._proxy.$acceptProcessRequestInitialCwd(proxy.instanceId)));
  }
  $sendProcessData(terminalId, data) {
    this._terminalProcessProxies.get(terminalId)?.proxy.emitData(data);
  }
  $sendProcessReady(terminalId, pid, cwd2, windowsPty) {
    this._terminalProcessProxies.get(terminalId)?.proxy.emitReady(pid, cwd2, windowsPty);
  }
  $sendProcessProperty(terminalId, property) {
    if (property.type === "title" /* Title */) {
      const instance2 = this._terminalService.getInstanceFromId(terminalId);
      instance2?.rename(property.value);
    }
    this._terminalProcessProxies.get(terminalId)?.proxy.emitProcessProperty(property);
  }
  $setEnvironmentVariableCollection(extensionIdentifier, persistent, collection, descriptionMap) {
    if (collection) {
      const translatedCollection = {
        persistent,
        map: deserializeEnvironmentVariableCollection(collection),
        descriptionMap: deserializeEnvironmentDescriptionMap(descriptionMap)
      };
      this._environmentVariableService.set(extensionIdentifier, translatedCollection);
    } else {
      this._environmentVariableService.delete(extensionIdentifier);
    }
  }
};

MainThreadTerminalService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTerminalService),
  __decorateParam(1, ITerminalService),
  __decorateParam(2, ITerminalLinkProviderService),
  __decorateParam(3, ITerminalQuickFixService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IEnvironmentVariableService),
  __decorateParam(6, ILogService),
  __decorateParam(7, ITerminalProfileResolverService),
  __decorateParam(8, IRemoteAgentService),
  __decorateParam(9, ITerminalGroupService),
  __decorateParam(10, ITerminalEditorService),
  __decorateParam(11, ITerminalProfileService),
  __decorateParam(12, ITerminalCompletionService),
  __decorateParam(13, IWorkbenchEnvironmentService)
], MainThreadTerminalService);

var TerminalDataEventTracker = class extends Disposable {
  constructor(_callback, _terminalService) {
    super();
    this._callback = _callback;
    this._terminalService = _terminalService;
    this._instanceListeners = this._register(new DisposableMap());
    this._register(this._bufferer = new TerminalDataBufferer(this._callback));
    for (const instance2 of this._terminalService.instances) {
      this._registerInstance(instance2);
    }
    this._register(this._terminalService.onDidCreateInstance((instance2) => this._registerInstance(instance2)));
    this._register(this._terminalService.onDidDisposeInstance((instance2) => {
      this._bufferer.stopBuffering(instance2.instanceId);
      this._instanceListeners.deleteAndDispose(instance2.instanceId);
    }));
  }
  _registerInstance(instance2) {
    this._instanceListeners.set(instance2.instanceId, this._bufferer.startBuffering(instance2.instanceId, instance2.onData));
  }
};

TerminalDataEventTracker = __decorateClass([
  __decorateParam(1, ITerminalService)
], TerminalDataEventTracker);

var ExtensionTerminalLinkProvider = class {
  constructor(_proxy) {
    this._proxy = _proxy;
  }
  async provideLinks(instance2, line) {
    const proxy = this._proxy;
    const extHostLinks = await proxy.$provideLinks(instance2.instanceId, line);
    return extHostLinks.map((dto) => ({
      id: dto.id,
      startIndex: dto.startIndex,
      length: dto.length,
      label: dto.label,
      activate: () => proxy.$activateLink(instance2.instanceId, dto.id)
    }));
  }
};

function getOutputMatchForLines(lines, outputMatcher) {
  const match2 = lines.join("\n").match(outputMatcher.lineMatcher);
  return match2 ? { regexMatch: match2, outputLines: lines } : void 0;
}

function parseQuickFix(id2, source, fix) {
  let type = 0 /* TerminalCommand */;
  if (hasKey(fix, { uri: true })) {
    fix.uri = URI.revive(fix.uri);
    type = 1 /* Opener */;
  } else if (hasKey(fix, { id: true })) {
    type = 3 /* VscodeCommand */;
  }
  return { id: id2, type, source, ...fix };
}
export { getOutputMatchForLines, parseQuickFix, MainThreadTerminalService, TerminalDataEventTracker, ExtensionTerminalLinkProvider };
