// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDebugService.ts
import { DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { Event2 } from "./module-0017.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { IDebugService, IDebugVisualization } from "./module-1057.mjs";
import { URI } from "./module-0032.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { convertToDAPaths, convertToVSCPaths, isSessionAttach } from "./module-1059.mjs";
import { severity_default } from "./module-0266.mjs";
import { isDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IDebugVisualizerService } from "./module-1065.mjs";
import { AbstractDebugAdapter } from "./module-1058.mjs";


// src/vs/workbench/api/browser/mainThreadDebugService.ts
var MainThreadDebugService = class {
  constructor(extHostContext, debugService, visualizerService) {
    this.debugService = debugService;
    this.visualizerService = visualizerService;
    this._toDispose = new DisposableStore();
    this._debugAdaptersHandleCounter = 1;
    this._visualizerHandles = /* @__PURE__ */ new Map();
    this._visualizerTreeHandles = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDebugService);
    const sessionListeners = new DisposableMap();
    this._toDispose.add(sessionListeners);
    this._toDispose.add(debugService.onDidNewSession((session) => {
      this._proxy.$acceptDebugSessionStarted(this.getSessionDto(session));
      const store = sessionListeners.get(session);
      store?.add(session.onDidChangeName((name) => {
        this._proxy.$acceptDebugSessionNameChanged(this.getSessionDto(session), name);
      }));
    }));
    this._toDispose.add(debugService.onWillNewSession((session) => {
      let store = sessionListeners.get(session);
      if (!store) {
        store = new DisposableStore();
        sessionListeners.set(session, store);
      }
      store.add(session.onDidCustomEvent((event) => this._proxy.$acceptDebugSessionCustomEvent(this.getSessionDto(session), event)));
    }));
    this._toDispose.add(debugService.onDidEndSession(({ session, restart }) => {
      this._proxy.$acceptDebugSessionTerminated(this.getSessionDto(session));
      this._extHostKnownSessions.delete(session.getId());
      if (!restart) {
        sessionListeners.deleteAndDispose(session);
      }
      for (const [handle2, value2] of this._debugAdapters) {
        if (value2.session === session) {
          this._debugAdapters.delete(handle2);
        }
      }
    }));
    this._toDispose.add(debugService.getViewModel().onDidFocusSession((session) => {
      this._proxy.$acceptDebugSessionActiveChanged(this.getSessionDto(session));
    }));
    this._toDispose.add(toDisposable(() => {
      for (const [handle2, da] of this._debugAdapters) {
        da.fireError(handle2, new Error("Extension host shut down"));
      }
    }));
    this._debugAdapters = /* @__PURE__ */ new Map();
    this._debugConfigurationProviders = /* @__PURE__ */ new Map();
    this._debugAdapterDescriptorFactories = /* @__PURE__ */ new Map();
    this._extHostKnownSessions = /* @__PURE__ */ new Set();
    const viewModel = this.debugService.getViewModel();
    this._toDispose.add(Event2.any(viewModel.onDidFocusStackFrame, viewModel.onDidFocusThread)(() => {
      const stackFrame = viewModel.focusedStackFrame;
      const thread = viewModel.focusedThread;
      if (stackFrame) {
        this._proxy.$acceptStackFrameFocus({
          kind: "stackFrame",
          threadId: stackFrame.thread.threadId,
          frameId: stackFrame.frameId,
          sessionId: stackFrame.thread.session.getId()
        });
      } else if (thread) {
        this._proxy.$acceptStackFrameFocus({
          kind: "thread",
          threadId: thread.threadId,
          sessionId: thread.session.getId()
        });
      } else {
        this._proxy.$acceptStackFrameFocus(void 0);
      }
    }));
    this.sendBreakpointsAndListen();
  }
  $registerDebugVisualizerTree(treeId, canEdit) {
    this._visualizerTreeHandles.set(treeId, this.visualizerService.registerTree(treeId, {
      disposeItem: (id2) => this._proxy.$disposeVisualizedTree(id2),
      getChildren: (e) => this._proxy.$getVisualizerTreeItemChildren(treeId, e),
      getTreeItem: (e) => this._proxy.$getVisualizerTreeItem(treeId, e),
      editItem: canEdit ? ((e, v2) => this._proxy.$editVisualizerTreeItem(e, v2)) : void 0
    }));
  }
  $unregisterDebugVisualizerTree(treeId) {
    this._visualizerTreeHandles.get(treeId)?.dispose();
    this._visualizerTreeHandles.delete(treeId);
  }
  $registerDebugVisualizer(extensionId, id2) {
    const handle2 = this.visualizerService.register({
      extensionId: new ExtensionIdentifier(extensionId),
      id: id2,
      disposeDebugVisualizers: (ids) => this._proxy.$disposeDebugVisualizers(ids),
      executeDebugVisualizerCommand: (id3) => this._proxy.$executeDebugVisualizerCommand(id3),
      provideDebugVisualizers: (context2, token) => this._proxy.$provideDebugVisualizers(extensionId, id2, context2, token).then((r2) => r2.map(IDebugVisualization.deserialize)),
      resolveDebugVisualizer: (viz, token) => this._proxy.$resolveDebugVisualizer(viz.id, token)
    });
    this._visualizerHandles.set(`${extensionId}/${id2}`, handle2);
  }
  $unregisterDebugVisualizer(extensionId, id2) {
    const key3 = `${extensionId}/${id2}`;
    this._visualizerHandles.get(key3)?.dispose();
    this._visualizerHandles.delete(key3);
  }
  sendBreakpointsAndListen() {
    this._toDispose.add(this.debugService.getModel().onDidChangeBreakpoints((e) => {
      if (e && !e.sessionOnly) {
        const delta2 = {};
        if (e.added) {
          delta2.added = this.convertToDto(e.added);
        }
        if (e.removed) {
          delta2.removed = e.removed.map((x) => x.getId());
        }
        if (e.changed) {
          delta2.changed = this.convertToDto(e.changed);
        }
        if (delta2.added || delta2.removed || delta2.changed) {
          this._proxy.$acceptBreakpointsDelta(delta2);
        }
      }
    }));
    const bps = this.debugService.getModel().getBreakpoints();
    const fbps = this.debugService.getModel().getFunctionBreakpoints();
    const dbps = this.debugService.getModel().getDataBreakpoints();
    if (bps.length > 0 || fbps.length > 0) {
      this._proxy.$acceptBreakpointsDelta({
        added: this.convertToDto(bps).concat(this.convertToDto(fbps)).concat(this.convertToDto(dbps))
      });
    }
  }
  dispose() {
    this._toDispose.dispose();
  }
  // interface IDebugAdapterProvider
  createDebugAdapter(session) {
    const handle2 = this._debugAdaptersHandleCounter++;
    const da = new ExtensionHostDebugAdapter(this, handle2, this._proxy, session);
    this._debugAdapters.set(handle2, da);
    return da;
  }
  substituteVariables(folder, config) {
    return Promise.resolve(this._proxy.$substituteVariables(folder ? folder.uri : void 0, config));
  }
  runInTerminal(args2, sessionId) {
    return this._proxy.$runInTerminal(args2, sessionId);
  }
  // RPC methods (MainThreadDebugServiceShape)
  $registerDebugTypes(debugTypes) {
    this._toDispose.add(this.debugService.getAdapterManager().registerDebugAdapterFactory(debugTypes, this));
  }
  $registerBreakpoints(DTOs) {
    for (const dto of DTOs) {
      if (dto.type === "sourceMulti") {
        const rawbps = dto.lines.map((l) => ({
          id: l.id,
          enabled: l.enabled,
          lineNumber: l.line + 1,
          column: l.character > 0 ? l.character + 1 : void 0,
          // a column value of 0 results in an omitted column attribute; see #46784
          condition: l.condition,
          hitCondition: l.hitCondition,
          logMessage: l.logMessage,
          mode: l.mode
        }));
        this.debugService.addBreakpoints(URI.revive(dto.uri), rawbps);
      } else if (dto.type === "function") {
        this.debugService.addFunctionBreakpoint({
          name: dto.functionName,
          mode: dto.mode,
          condition: dto.condition,
          hitCondition: dto.hitCondition,
          enabled: dto.enabled,
          logMessage: dto.logMessage
        }, dto.id);
      } else if (dto.type === "data") {
        this.debugService.addDataBreakpoint({
          description: dto.label,
          src: { type: 0 /* Variable */, dataId: dto.dataId },
          canPersist: dto.canPersist,
          accessTypes: dto.accessTypes,
          accessType: dto.accessType,
          mode: dto.mode
        });
      }
    }
    return Promise.resolve();
  }
  $unregisterBreakpoints(breakpointIds2, functionBreakpointIds, dataBreakpointIds) {
    breakpointIds2.forEach((id2) => this.debugService.removeBreakpoints(id2));
    functionBreakpointIds.forEach((id2) => this.debugService.removeFunctionBreakpoints(id2));
    dataBreakpointIds.forEach((id2) => this.debugService.removeDataBreakpoints(id2));
    return Promise.resolve();
  }
  $registerDebugConfigurationProvider(debugType, providerTriggerKind, hasProvide, hasResolve, hasResolve2, handle2) {
    const provider = {
      type: debugType,
      triggerKind: providerTriggerKind
    };
    if (hasProvide) {
      provider.provideDebugConfigurations = (folder, token) => {
        return this._proxy.$provideDebugConfigurations(handle2, folder, token);
      };
    }
    if (hasResolve) {
      provider.resolveDebugConfiguration = (folder, config, token) => {
        return this._proxy.$resolveDebugConfiguration(handle2, folder, config, token);
      };
    }
    if (hasResolve2) {
      provider.resolveDebugConfigurationWithSubstitutedVariables = (folder, config, token) => {
        return this._proxy.$resolveDebugConfigurationWithSubstitutedVariables(handle2, folder, config, token);
      };
    }
    this._debugConfigurationProviders.set(handle2, provider);
    this._toDispose.add(this.debugService.getConfigurationManager().registerDebugConfigurationProvider(provider));
    return Promise.resolve(void 0);
  }
  $unregisterDebugConfigurationProvider(handle2) {
    const provider = this._debugConfigurationProviders.get(handle2);
    if (provider) {
      this._debugConfigurationProviders.delete(handle2);
      this.debugService.getConfigurationManager().unregisterDebugConfigurationProvider(provider);
    }
  }
  $registerDebugAdapterDescriptorFactory(debugType, handle2) {
    const provider = {
      type: debugType,
      createDebugAdapterDescriptor: (session) => {
        return Promise.resolve(this._proxy.$provideDebugAdapter(handle2, this.getSessionDto(session)));
      }
    };
    this._debugAdapterDescriptorFactories.set(handle2, provider);
    this._toDispose.add(this.debugService.getAdapterManager().registerDebugAdapterDescriptorFactory(provider));
    return Promise.resolve(void 0);
  }
  $unregisterDebugAdapterDescriptorFactory(handle2) {
    const provider = this._debugAdapterDescriptorFactories.get(handle2);
    if (provider) {
      this._debugAdapterDescriptorFactories.delete(handle2);
      this.debugService.getAdapterManager().unregisterDebugAdapterDescriptorFactory(provider);
    }
  }
  getSession(sessionId) {
    if (sessionId) {
      return this.debugService.getModel().getSession(sessionId, true);
    }
    return void 0;
  }
  async $startDebugging(folder, nameOrConfig, options3) {
    const folderUri = folder ? URI.revive(folder) : void 0;
    const launch = this.debugService.getConfigurationManager().getLaunch(folderUri);
    const parentSession = this.getSession(options3.parentSessionID);
    const saveBeforeStart = typeof options3.suppressSaveBeforeStart === "boolean" ? !options3.suppressSaveBeforeStart : void 0;
    const debugOptions = {
      noDebug: options3.noDebug,
      parentSession,
      lifecycleManagedByParent: options3.lifecycleManagedByParent,
      repl: options3.repl,
      compact: options3.compact,
      compoundRoot: parentSession?.compoundRoot,
      saveBeforeRestart: saveBeforeStart,
      testRun: options3.testRun,
      suppressDebugStatusbar: options3.suppressDebugStatusbar,
      suppressDebugToolbar: options3.suppressDebugToolbar,
      suppressDebugView: options3.suppressDebugView
    };
    try {
      return this.debugService.startDebugging(launch, nameOrConfig, debugOptions, saveBeforeStart);
    } catch (err) {
      throw new ErrorNoTelemetry(err && err.message ? err.message : "cannot start debugging");
    }
  }
  $setDebugSessionName(sessionId, name) {
    const session = this.debugService.getModel().getSession(sessionId);
    session?.setName(name);
  }
  $customDebugAdapterRequest(sessionId, request2, args2) {
    const session = this.debugService.getModel().getSession(sessionId, true);
    if (session) {
      return session.customRequest(request2, args2).then((response) => {
        if (response && response.success) {
          return response.body;
        } else {
          return Promise.reject(new ErrorNoTelemetry(response ? response.message : "custom request failed"));
        }
      });
    }
    return Promise.reject(new ErrorNoTelemetry("debug session not found"));
  }
  $getDebugProtocolBreakpoint(sessionId, breakpoinId) {
    const session = this.debugService.getModel().getSession(sessionId, true);
    if (session) {
      return Promise.resolve(session.getDebugProtocolBreakpoint(breakpoinId));
    }
    return Promise.reject(new ErrorNoTelemetry("debug session not found"));
  }
  $stopDebugging(sessionId) {
    if (sessionId) {
      const session = this.debugService.getModel().getSession(sessionId, true);
      if (session) {
        return this.debugService.stopSession(session, isSessionAttach(session));
      }
    } else {
      return this.debugService.stopSession(void 0);
    }
    return Promise.reject(new ErrorNoTelemetry("debug session not found"));
  }
  $appendDebugConsole(value2) {
    const session = this.debugService.getViewModel().focusedSession;
    session?.appendToRepl({ output: value2, sev: severity_default.Warning });
  }
  $acceptDAMessage(handle2, message) {
    this.getDebugAdapter(handle2).acceptMessage(convertToVSCPaths(message, false));
  }
  $acceptDAError(handle2, name, message, stack) {
    this._debugAdapters.get(handle2)?.fireError(handle2, new Error(`${name}: ${message}
${stack}`));
  }
  $acceptDAExit(handle2, code, signal) {
    this._debugAdapters.get(handle2)?.fireExit(handle2, code, signal);
  }
  getDebugAdapter(handle2) {
    const adapter = this._debugAdapters.get(handle2);
    if (!adapter) {
      throw new Error("Invalid debug adapter");
    }
    return adapter;
  }
  // dto helpers
  $sessionCached(sessionID) {
    this._extHostKnownSessions.add(sessionID);
  }
  getSessionDto(session) {
    if (session) {
      const sessionID = session.getId();
      if (this._extHostKnownSessions.has(sessionID)) {
        return sessionID;
      } else {
        return {
          id: sessionID,
          type: session.configuration.type,
          name: session.name,
          folderUri: session.root ? session.root.uri : void 0,
          configuration: session.configuration,
          parent: session.parentSession?.getId()
        };
      }
    }
    return void 0;
  }
  convertToDto(bps) {
    return bps.map((bp) => {
      if ("name" in bp) {
        const fbp = bp;
        return {
          type: "function",
          id: fbp.getId(),
          enabled: fbp.enabled,
          condition: fbp.condition,
          hitCondition: fbp.hitCondition,
          logMessage: fbp.logMessage,
          functionName: fbp.name
        };
      } else if ("src" in bp) {
        const dbp = bp;
        return {
          type: "data",
          id: dbp.getId(),
          dataId: dbp.src.type === 0 /* Variable */ ? dbp.src.dataId : dbp.src.address,
          enabled: dbp.enabled,
          condition: dbp.condition,
          hitCondition: dbp.hitCondition,
          logMessage: dbp.logMessage,
          accessType: dbp.accessType,
          label: dbp.description,
          canPersist: dbp.canPersist
        };
      } else if ("uri" in bp) {
        const sbp = bp;
        return {
          type: "source",
          id: sbp.getId(),
          enabled: sbp.enabled,
          condition: sbp.condition,
          hitCondition: sbp.hitCondition,
          logMessage: sbp.logMessage,
          uri: sbp.uri,
          line: sbp.lineNumber > 0 ? sbp.lineNumber - 1 : 0,
          character: typeof sbp.column === "number" && sbp.column > 0 ? sbp.column - 1 : 0
        };
      } else {
        return void 0;
      }
    }).filter(isDefined);
  }
};

MainThreadDebugService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDebugService),
  __decorateParam(1, IDebugService),
  __decorateParam(2, IDebugVisualizerService)
], MainThreadDebugService);

var ExtensionHostDebugAdapter = class extends AbstractDebugAdapter {
  constructor(_ds, _handle, _proxy, session) {
    super();
    this._ds = _ds;
    this._handle = _handle;
    this._proxy = _proxy;
    this.session = session;
  }
  fireError(handle2, err) {
    this._onError.fire(err);
  }
  fireExit(handle2, code, signal) {
    this._onExit.fire(code);
  }
  startSession() {
    return Promise.resolve(this._proxy.$startDASession(this._handle, this._ds.getSessionDto(this.session)));
  }
  sendMessage(message) {
    this._proxy.$sendDAMessage(this._handle, convertToDAPaths(message, true));
  }
  async stopSession() {
    await this.cancelPendingRequests();
    return Promise.resolve(this._proxy.$stopDASession(this._handle));
  }
};
export { MainThreadDebugService, ExtensionHostDebugAdapter };
