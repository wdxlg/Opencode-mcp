// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostManagementService.ts
import { Promises, raceTimeout } from "./module-0027.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostManagementService.ts
var SHUTDOWN_DRAIN_TIMEOUT_MS = 1e3;

var PROVIDER_SHUTDOWN_TIMEOUT_MS = 1500;

var SHUTDOWN_FLUSH_TIMEOUT_MS = 2500;

var AgentHostManagementService = class {
  constructor(_agentService, _connectionTrackerService, _shutdownProtocolIngress, _sessionDataService, _logService) {
    this._agentService = _agentService;
    this._connectionTrackerService = _connectionTrackerService;
    this._shutdownProtocolIngress = _shutdownProtocolIngress;
    this._sessionDataService = _sessionDataService;
    this._logService = _logService;
    this._shuttingDown = false;
    this._inflightMutations = /* @__PURE__ */ new Set();
  }
  createSessionWithExtensions(config) {
    return this._runMutation(() => this._agentService.createSession(config));
  }
  createChatWithExtensions(session, chat, options) {
    return this._runMutation(() => this._agentService.createChat(session, chat, options));
  }
  shutdown() {
    if (!this._shutdownPromise) {
      this._shuttingDown = true;
      this._shutdownPromise = this._doShutdown();
    }
    return this._shutdownPromise;
  }
  async _doShutdown() {
    const protocolDrain = raceTimeout(this._shutdownProtocolIngress(), SHUTDOWN_DRAIN_TIMEOUT_MS, () => {
      this._logService.warn(`Agent Host protocol requests did not finish within ${SHUTDOWN_DRAIN_TIMEOUT_MS}ms during shutdown.`);
    }).catch((error) => this._logService.error("Agent Host protocol shutdown failed.", error));
    const managementDrain = raceTimeout(Promises.settled([...this._inflightMutations]), SHUTDOWN_DRAIN_TIMEOUT_MS, () => {
      this._logService.warn(`Agent Host management operations did not finish within ${SHUTDOWN_DRAIN_TIMEOUT_MS}ms during shutdown.`);
    }).catch((error) => this._logService.error("An in-flight Agent Host management operation failed during shutdown.", error));
    await Promise.all([protocolDrain, managementDrain]);
    try {
      await raceTimeout(this._agentService.shutdown(), PROVIDER_SHUTDOWN_TIMEOUT_MS, () => {
        this._logService.warn(`Agent Host providers did not finish shutting down within ${PROVIDER_SHUTDOWN_TIMEOUT_MS}ms.`);
      });
    } catch (error) {
      this._logService.error("Agent Host provider shutdown failed.", error);
    }
    await raceTimeout(this._sessionDataService.whenIdle(), SHUTDOWN_FLUSH_TIMEOUT_MS, () => {
      this._logService.warn(`Agent Host session data did not finish flushing within ${SHUTDOWN_FLUSH_TIMEOUT_MS}ms during shutdown.`);
    });
  }
  _runMutation(operation) {
    if (this._shuttingDown) {
      return Promise.reject(new Error("Agent Host is shutting down."));
    }
    const promise = operation();
    this._inflightMutations.add(promise);
    const remove2 = () => this._inflightMutations.delete(promise);
    void promise.then(remove2, remove2);
    return promise;
  }
  getNetworkDiagnosticsInfo() {
    return this._agentService.getNetworkDiagnosticsInfo();
  }
  getManagedSettingsDiagnostics() {
    return this._agentService.getManagedSettingsDiagnostics();
  }
  diagnosticsFetch(url2) {
    return this._agentService.diagnosticsFetch(url2);
  }
  getSessionStateFile(session, chat) {
    if (!this._agentService.getSessionStateFile) {
      throw new Error("Agent Host session state files are unavailable");
    }
    return this._agentService.getSessionStateFile(session, chat);
  }
  collectDebugLogs(session, kind, chat) {
    if (!this._agentService.collectDebugLogs) {
      throw new Error("Agent Host debug log collection is unavailable");
    }
    return this._agentService.collectDebugLogs(session, kind, chat);
  }
  readDebugLogsChunk(resource, position) {
    if (!this._agentService.readDebugLogsChunk) {
      throw new Error("Agent Host debug log collection is unavailable");
    }
    return this._agentService.readDebugLogsChunk(resource, position);
  }
  startWebSocketServer() {
    return this._connectionTrackerService.startWebSocketServer();
  }
  getInspectInfo(tryEnable) {
    return this._connectionTrackerService.getInspectInfo(tryEnable);
  }
};

AgentHostManagementService = __decorateClass([
  __decorateParam(3, ISessionDataService),
  __decorateParam(4, ILogService)
], AgentHostManagementService);
export { SHUTDOWN_DRAIN_TIMEOUT_MS, PROVIDER_SHUTDOWN_TIMEOUT_MS, SHUTDOWN_FLUSH_TIMEOUT_MS, AgentHostManagementService };
