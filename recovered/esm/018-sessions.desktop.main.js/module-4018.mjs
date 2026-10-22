// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionHostManager.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { extensionHostKindToString } from "./module-1180.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { StopWatch } from "./module-0016.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { RPCProtocol } from "./module-4017.mjs";
import { ExtHostCustomersRegistry } from "./module-0920.mjs";
import { getRemoteAuthorityPrefix } from "./module-0896.mjs";
import { IntervalTimer } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/workbench/services/extensions/common/extensionHostManager.ts
var LOG_EXTENSION_HOST_COMMUNICATION = false;

var LOG_USE_COLORS = true;

var ExtensionHostManager = class extends Disposable {
  constructor(extensionHost, initialActivationEvents, _internalExtensionService, _instantiationService, _environmentService, _telemetryService, _logService) {
    super();
    this._internalExtensionService = _internalExtensionService;
    this._instantiationService = _instantiationService;
    this._environmentService = _environmentService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._onDidChangeResponsiveState = this._register(new Emitter());
    this.onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
    this._hasStarted = false;
    this._cachedActivationEvents = /* @__PURE__ */ new Map();
    this._resolvedActivationEvents = /* @__PURE__ */ new Set();
    this._rpcProtocol = null;
    this._customers = [];
    this._extensionHost = extensionHost;
    this.onDidExit = this._extensionHost.onExit;
    const startingTelemetryEvent = {
      time: Date.now(),
      action: "starting",
      kind: extensionHostKindToString(this.kind)
    };
    this._telemetryService.publicLog2("extensionHostStartup", startingTelemetryEvent);
    this._proxy = this._extensionHost.start().then(
      (protocol) => {
        const successTelemetryEvent = {
          time: Date.now(),
          action: "success",
          kind: extensionHostKindToString(this.kind)
        };
        this._telemetryService.publicLog2("extensionHostStartup", successTelemetryEvent);
        return this._createExtensionHostCustomers(this.kind, protocol);
      },
      (err) => {
        this._logService.error(`Error received from starting extension host (kind: ${extensionHostKindToString(this.kind)})`);
        this._logService.error(err);
        const failureTelemetryEvent = {
          time: Date.now(),
          action: "error",
          kind: extensionHostKindToString(this.kind)
        };
        if (err && err.name) {
          failureTelemetryEvent.errorName = err.name;
        }
        if (err && err.message) {
          failureTelemetryEvent.errorMessage = err.message;
        }
        if (err && err.stack) {
          failureTelemetryEvent.errorStack = err.stack;
        }
        this._telemetryService.publicLog2("extensionHostStartup", failureTelemetryEvent);
        return null;
      }
    );
    this._proxy.then(() => {
      this._hasStarted = true;
      initialActivationEvents.forEach((activationEvent) => this.activateByEvent(activationEvent, 0 /* Normal */));
      this._register(registerLatencyTestProvider({
        measure: () => this.measure()
      }));
    });
  }
  get pid() {
    return this._extensionHost.pid;
  }
  get kind() {
    return this._extensionHost.runningLocation.kind;
  }
  get startup() {
    return this._extensionHost.startup;
  }
  get friendyName() {
    return friendlyExtHostName(this.kind, this.pid);
  }
  async disconnect() {
    await this._extensionHost?.disconnect?.();
  }
  dispose() {
    this._extensionHost?.dispose();
    this._rpcProtocol?.dispose();
    for (let i2 = 0, len = this._customers.length; i2 < len; i2++) {
      const customer = this._customers[i2];
      try {
        customer.dispose();
      } catch (err) {
        onUnexpectedError(err);
      }
    }
    this._proxy = null;
    super.dispose();
  }
  async measure() {
    const proxy = await this._proxy;
    if (!proxy) {
      return null;
    }
    const latency = await this._measureLatency(proxy);
    const down = await this._measureDown(proxy);
    const up = await this._measureUp(proxy);
    return {
      remoteAuthority: this._extensionHost.remoteAuthority,
      latency,
      down,
      up
    };
  }
  get isReady() {
    return this._hasStarted;
  }
  async ready() {
    await this._proxy;
  }
  async _measureLatency(proxy) {
    const COUNT = 10;
    let sum2 = 0;
    for (let i2 = 0; i2 < COUNT; i2++) {
      const sw = StopWatch.create();
      await proxy.test_latency(i2);
      sw.stop();
      sum2 += sw.elapsed();
    }
    return sum2 / COUNT;
  }
  static _convert(byteCount, elapsedMillis) {
    return byteCount * 1e3 * 8 / elapsedMillis;
  }
  async _measureUp(proxy) {
    const SIZE = 10 * 1024 * 1024;
    const buff = VSBuffer.alloc(SIZE);
    const value2 = Math.ceil(Math.random() * 256);
    for (let i2 = 0; i2 < buff.byteLength; i2++) {
      buff.writeUInt8(i2, value2);
    }
    const sw = StopWatch.create();
    await proxy.test_up(buff);
    sw.stop();
    return ExtensionHostManager._convert(SIZE, sw.elapsed());
  }
  async _measureDown(proxy) {
    const SIZE = 10 * 1024 * 1024;
    const sw = StopWatch.create();
    await proxy.test_down(SIZE);
    sw.stop();
    return ExtensionHostManager._convert(SIZE, sw.elapsed());
  }
  _createExtensionHostCustomers(kind, protocol) {
    let logger = null;
    if (LOG_EXTENSION_HOST_COMMUNICATION || this._environmentService.logExtensionHostCommunication) {
      logger = new RPCLogger(kind);
    } else if (TelemetryRPCLogger.isEnabled()) {
      logger = new TelemetryRPCLogger(this._telemetryService);
    }
    this._rpcProtocol = new RPCProtocol(protocol, logger);
    this._register(this._rpcProtocol.onDidChangeResponsiveState((responsiveState) => this._onDidChangeResponsiveState.fire(responsiveState)));
    let extensionHostProxy = null;
    let mainProxyIdentifiers = [];
    const extHostContext = {
      remoteAuthority: this._extensionHost.remoteAuthority,
      extensionHostKind: this.kind,
      getProxy: (identifier2) => this._rpcProtocol.getProxy(identifier2),
      set: (identifier2, instance2) => this._rpcProtocol.set(identifier2, instance2),
      dispose: () => this._rpcProtocol.dispose(),
      assertRegistered: (identifiers2) => this._rpcProtocol.assertRegistered(identifiers2),
      drain: () => this._rpcProtocol.drain(),
      //#region internal
      internalExtensionService: this._internalExtensionService,
      _setExtensionHostProxy: (value2) => {
        extensionHostProxy = value2;
      },
      _setAllMainProxyIdentifiers: (value2) => {
        mainProxyIdentifiers = value2;
      }
      //#endregion
    };
    const namedCustomers = ExtHostCustomersRegistry.getNamedCustomers();
    for (let i2 = 0, len = namedCustomers.length; i2 < len; i2++) {
      const [id2, ctor] = namedCustomers[i2];
      try {
        const instance2 = this._instantiationService.createInstance(ctor, extHostContext);
        this._customers.push(instance2);
        this._rpcProtocol.set(id2, instance2);
      } catch (err) {
        this._logService.error(`Cannot instantiate named customer: '${id2.sid}'`);
        this._logService.error(err);
        onUnexpectedError(err);
      }
    }
    const customers = ExtHostCustomersRegistry.getCustomers();
    for (const ctor of customers) {
      try {
        const instance2 = this._instantiationService.createInstance(ctor, extHostContext);
        this._customers.push(instance2);
      } catch (err) {
        this._logService.error(err);
        onUnexpectedError(err);
      }
    }
    if (!extensionHostProxy) {
      throw new Error(`Missing IExtensionHostProxy!`);
    }
    this._rpcProtocol.assertRegistered(mainProxyIdentifiers);
    return extensionHostProxy;
  }
  async activate(extension, reason) {
    const proxy = await this._proxy;
    if (!proxy) {
      return false;
    }
    return proxy.activate(extension, reason);
  }
  activateByEvent(activationEvent, activationKind) {
    if (!this._cachedActivationEvents.has(activationEvent)) {
      this._cachedActivationEvents.set(activationEvent, this._activateByEvent(activationEvent, activationKind));
    }
    return this._cachedActivationEvents.get(activationEvent);
  }
  activationEventIsDone(activationEvent) {
    return this._resolvedActivationEvents.has(activationEvent);
  }
  async _activateByEvent(activationEvent, activationKind) {
    if (!this._proxy) {
      return;
    }
    const proxy = await this._proxy;
    if (!proxy) {
      return;
    }
    if (!this._extensionHost.extensions.containsActivationEvent(activationEvent)) {
      this._resolvedActivationEvents.add(activationEvent);
      return;
    }
    await proxy.activateByEvent(activationEvent, activationKind);
    this._resolvedActivationEvents.add(activationEvent);
  }
  async getInspectPort(tryEnableInspector) {
    if (this._extensionHost) {
      if (tryEnableInspector) {
        await this._extensionHost.enableInspectPort();
      }
      const port = this._extensionHost.getInspectPort();
      if (port) {
        return port;
      }
    }
    return void 0;
  }
  async resolveAuthority(remoteAuthority, resolveAttempt) {
    const sw = StopWatch.create(false);
    const prefix = () => `[${extensionHostKindToString(this._extensionHost.runningLocation.kind)}${this._extensionHost.runningLocation.affinity}][resolveAuthority(${getRemoteAuthorityPrefix(remoteAuthority)},${resolveAttempt})][${sw.elapsed()}ms] `;
    const logInfo = (msg) => this._logService.info(`${prefix()}${msg}`);
    const logError = (msg, err = void 0) => this._logService.error(`${prefix()}${msg}`, err);
    logInfo(`obtaining proxy...`);
    const proxy = await this._proxy;
    if (!proxy) {
      logError(`no proxy`);
      return {
        type: "error",
        error: {
          message: `Cannot resolve authority`,
          code: "Unknown" /* Unknown */,
          detail: void 0
        }
      };
    }
    logInfo(`invoking...`);
    const intervalLogger = new IntervalTimer();
    try {
      intervalLogger.cancelAndSet(() => logInfo("waiting..."), 1e3);
      const resolverResult = await proxy.resolveAuthority(remoteAuthority, resolveAttempt);
      intervalLogger.dispose();
      if (resolverResult.type === "ok") {
        logInfo(`returned ${resolverResult.value.authority.connectTo}`);
      } else {
        logError(`returned an error`, resolverResult.error);
      }
      return resolverResult;
    } catch (err) {
      intervalLogger.dispose();
      logError(`returned an error`, err);
      return {
        type: "error",
        error: {
          message: err.message,
          code: "Unknown" /* Unknown */,
          detail: err
        }
      };
    }
  }
  async getCanonicalURI(remoteAuthority, uri4) {
    const proxy = await this._proxy;
    if (!proxy) {
      throw new Error(`Cannot resolve canonical URI`);
    }
    return proxy.getCanonicalURI(remoteAuthority, uri4);
  }
  async start(extensionRegistryVersionId, allExtensions, myExtensions) {
    const proxy = await this._proxy;
    if (!proxy) {
      return;
    }
    const deltaExtensions = this._extensionHost.extensions.set(extensionRegistryVersionId, allExtensions, myExtensions);
    return proxy.startExtensionHost(deltaExtensions);
  }
  async extensionTestsExecute() {
    const proxy = await this._proxy;
    if (!proxy) {
      throw new Error("Could not obtain Extension Host Proxy");
    }
    return proxy.extensionTestsExecute();
  }
  representsRunningLocation(runningLocation) {
    return this._extensionHost.runningLocation.equals(runningLocation);
  }
  async deltaExtensions(incomingExtensionsDelta) {
    const proxy = await this._proxy;
    if (!proxy) {
      return;
    }
    const outgoingExtensionsDelta = this._extensionHost.extensions.delta(incomingExtensionsDelta);
    if (!outgoingExtensionsDelta) {
      return;
    }
    return proxy.deltaExtensions(outgoingExtensionsDelta);
  }
  containsExtension(extensionId) {
    return this._extensionHost.extensions?.containsExtension(extensionId) ?? false;
  }
  async setRemoteEnvironment(env2) {
    const proxy = await this._proxy;
    if (!proxy) {
      return;
    }
    return proxy.setRemoteEnvironment(env2);
  }
};

ExtensionHostManager = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ILogService)
], ExtensionHostManager);

function friendlyExtHostName(kind, pid) {
  if (pid) {
    return `${extensionHostKindToString(kind)} pid: ${pid}`;
  }
  return `${extensionHostKindToString(kind)}`;
}

var colorTables = [
  ["#2977B1", "#FC802D", "#34A13A", "#D3282F", "#9366BA"],
  ["#8B564C", "#E177C0", "#7F7F7F", "#BBBE3D", "#2EBECD"]
];

function prettyWithoutArrays(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && typeof data.toString === "function") {
    const result = data.toString();
    if (result !== "[object Object]") {
      return result;
    }
  }
  return data;
}

function pretty(data) {
  if (Array.isArray(data)) {
    return data.map(prettyWithoutArrays);
  }
  return prettyWithoutArrays(data);
}

var RPCLogger = class {
  constructor(_kind) {
    this._kind = _kind;
    this._totalIncoming = 0;
    this._totalOutgoing = 0;
  }
  _log(direction, totalLength, msgLength, req, initiator, str, data) {
    data = pretty(data);
    const colorTable = colorTables[initiator];
    const color2 = LOG_USE_COLORS ? colorTable[req % colorTable.length] : "#000000";
    let args2 = [`%c[${extensionHostKindToString(this._kind)}][${direction}]%c[${String(totalLength).padStart(7)}]%c[len: ${String(msgLength).padStart(5)}]%c${String(req).padStart(5)} - ${str}`, "color: darkgreen", "color: grey", "color: grey", `color: ${color2}`];
    if (/\($/.test(str)) {
      args2 = args2.concat(data);
      args2.push(")");
    } else {
      args2.push(data);
    }
    console.log.apply(console, args2);
  }
  logIncoming(msgLength, req, initiator, str, data) {
    this._totalIncoming += msgLength;
    this._log("Ext \u2192 Win", this._totalIncoming, msgLength, req, initiator, str, data);
  }
  logOutgoing(msgLength, req, initiator, str, data) {
    this._totalOutgoing += msgLength;
    this._log("Win \u2192 Ext", this._totalOutgoing, msgLength, req, initiator, str, data);
  }
};

var TelemetryRPCLogger = class {
  constructor(_telemetryService) {
    this._telemetryService = _telemetryService;
    this._pendingRequests = /* @__PURE__ */ new Map();
  }
  static isEnabled() {
    return Math.random() < 1e-4;
  }
  logIncoming(msgLength, req, initiator, str) {
    if (initiator === 0 /* LocalSide */ && /^receiveReply(Err)?:/.test(str)) {
      const requestStr = this._pendingRequests.get(req) ?? "unknown_reply";
      this._pendingRequests.delete(req);
      this._telemetryService.publicLog2("extensionhost.incoming", {
        type: `${str} ${requestStr}`,
        length: msgLength
      });
    }
    if (initiator === 1 /* OtherSide */ && /^receiveRequest /.test(str)) {
      this._telemetryService.publicLog2("extensionhost.incoming", {
        type: `${str}`,
        length: msgLength
      });
    }
  }
  logOutgoing(msgLength, req, initiator, str) {
    if (initiator === 0 /* LocalSide */ && str.startsWith("request: ")) {
      this._pendingRequests.set(req, str);
      this._telemetryService.publicLog2("extensionhost.outgoing", {
        type: str,
        length: msgLength
      });
    }
  }
};

TelemetryRPCLogger = __decorateClass([
  __decorateParam(0, ITelemetryService)
], TelemetryRPCLogger);

var providers = [];

function registerLatencyTestProvider(provider) {
  providers.push(provider);
  return {
    dispose: () => {
      for (let i2 = 0; i2 < providers.length; i2++) {
        if (providers[i2] === provider) {
          providers.splice(i2, 1);
          return;
        }
      }
    }
  };
}

function getLatencyTestProviders() {
  return providers.slice(0);
}

registerAction2(class MeasureExtHostLatencyAction extends Action2 {
  constructor() {
    super({
      id: "editor.action.measureExtHostLatency",
      title: localize2(23034, "Measure Extension Host Latency"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const measurements = await Promise.all(getLatencyTestProviders().map((provider) => provider.measure()));
    editorService.openEditor({ resource: void 0, contents: measurements.map(MeasureExtHostLatencyAction._print).join("\n\n"), options: { pinned: true } });
  }
  static _print(m) {
    if (!m) {
      return "";
    }
    return `${m.remoteAuthority ? `Authority: ${m.remoteAuthority}
` : ``}Roundtrip latency: ${m.latency.toFixed(3)}ms
Up: ${MeasureExtHostLatencyAction._printSpeed(m.up)}
Down: ${MeasureExtHostLatencyAction._printSpeed(m.down)}
`;
  }
  static _printSpeed(n2) {
    if (n2 <= 1024) {
      return `${n2} bps`;
    }
    if (n2 < 1024 * 1024) {
      return `${(n2 / 1024).toFixed(1)} kbps`;
    }
    return `${(n2 / 1024 / 1024).toFixed(1)} Mbps`;
  }
});
export { friendlyExtHostName, prettyWithoutArrays, pretty, registerLatencyTestProvider, getLatencyTestProviders, LOG_EXTENSION_HOST_COMMUNICATION, LOG_USE_COLORS, ExtensionHostManager, colorTables, RPCLogger, TelemetryRPCLogger, providers };
