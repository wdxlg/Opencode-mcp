// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/devContainerAgentHostService.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { getComparisonKey } from "./module-0034.mjs";
import { raceCancellationError, raceTimeout } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { CancellationError } from "./module-0004.mjs";
import { AGENT_HOST_SCHEME, agentHostAuthority } from "./module-1001.mjs";
import { RemoteAgentHostSessionsProvider } from "./module-3684.mjs";
import { Event2 } from "./module-0017.mjs";
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus } from "./module-1736.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IDevContainerAgentHostService } from "./module-4271.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/devContainerAgentHostService.ts
var DevContainerAgentHostService = class extends Disposable {
  constructor(_instantiationService, _remoteAgentHostService, _sessionsProvidersService) {
    super();
    this._instantiationService = _instantiationService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._providerStores = this._register(new DisposableMap());
    this._activeConnections = /* @__PURE__ */ new Map();
    this._pendingConnections = /* @__PURE__ */ new Map();
    this._register(this._remoteAgentHostService.onDidChangeConnections(() => this._reconcileConnections()));
  }
  registerConnector(connector) {
    if (this._connector) {
      throw new Error(localize(5089, null));
    }
    this._connector = connector;
    return toDisposable(() => {
      if (this._connector === connector) {
        this._connector = void 0;
      }
    });
  }
  isAvailable(workspaceUri) {
    return this._connector?.isAvailable(workspaceUri) ?? Promise.resolve(false);
  }
  connect(workspaceUri, token) {
    const key3 = getComparisonKey(workspaceUri);
    const active = this._activeConnections.get(key3);
    if (active && this._isConnectedOrReconnecting(active.address)) {
      return Promise.resolve(this._acquireConnection(key3, active));
    }
    const pending = this._pendingConnections.get(key3);
    if (pending) {
      return raceCancellationError(pending.promise, token).then((active2) => this._acquireConnection(key3, active2));
    }
    if (!this._connector) {
      return Promise.reject(new Error(localize(5090, null)));
    }
    const tokenSource = new CancellationTokenSource(token);
    const promise = this._replaceConnectionAndConnect(this._connector, workspaceUri, key3, active, tokenSource.token);
    const pendingConnection = { promise, tokenSource };
    this._pendingConnections.set(key3, pendingConnection);
    void promise.then(
      () => this._completePendingConnection(key3, pendingConnection),
      () => this._completePendingConnection(key3, pendingConnection)
    );
    return promise.then((active2) => this._acquireConnection(key3, active2));
  }
  _completePendingConnection(key3, pending) {
    if (this._pendingConnections.get(key3) === pending) {
      this._pendingConnections.delete(key3);
    }
    pending.tokenSource.dispose();
  }
  async _replaceConnectionAndConnect(connector, workspaceUri, key3, active, token) {
    if (active) {
      await this._removeActiveConnection(key3, active);
    }
    return this._connect(connector, workspaceUri, key3, token);
  }
  async _connect(connector, workspaceUri, key3, token) {
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    const connected = await connector.connect(workspaceUri, token);
    if (token.isCancellationRequested) {
      connected.transportDisposable?.dispose();
      connected.connection.dispose();
      throw new CancellationError();
    }
    const authority = agentHostAuthority(connected.address);
    if (connected.workspaceUri.scheme !== AGENT_HOST_SCHEME || connected.workspaceUri.authority !== authority) {
      connected.transportDisposable?.dispose();
      connected.connection.dispose();
      throw new Error(localize(5091, null, AGENT_HOST_SCHEME, authority));
    }
    const providerStore = new DisposableStore();
    let connectionOwnedByRemoteService = false;
    try {
      const provider = providerStore.add(this._createProvider({
        address: connected.address,
        name: connected.name,
        omitHostFromWorkspaceLabel: true
      }));
      providerStore.add(this._sessionsProvidersService.registerProvider(provider));
      const entry = {
        name: connected.name,
        connection: {
          type: "devContainer" /* DevContainer */,
          address: connected.address,
          hostPath: workspaceUri.fsPath
        }
      };
      const connectionInfo = await this._remoteAgentHostService.addManagedConnection(entry, connected.connection, connected.transportDisposable);
      connectionOwnedByRemoteService = true;
      provider.setConnection(connected.connection, connected.defaultDirectory ?? connectionInfo.defaultDirectory);
      provider.setConnectionStatus(connectionInfo.status);
      await this._waitForSessionTypes(provider, token);
      const target = { providerId: provider.id, workspaceUri: connected.workspaceUri };
      const active = { address: connectionInfo.address, provider, target, references: 0 };
      providerStore.add(toDisposable(() => this._activeConnections.delete(key3)));
      this._providerStores.set(key3, providerStore);
      this._activeConnections.set(key3, active);
      return active;
    } catch (error) {
      providerStore.dispose();
      if (connectionOwnedByRemoteService) {
        await this._remoteAgentHostService.removeRemoteAgentHost(connected.address);
      } else {
        connected.transportDisposable?.dispose();
        connected.connection.dispose();
      }
      throw error;
    }
  }
  _acquireConnection(key3, active) {
    active.references++;
    let released = false;
    return {
      ...active.target,
      release: async () => {
        if (released) {
          return;
        }
        released = true;
        active.references--;
        if (active.references === 0 && this._activeConnections.get(key3) === active) {
          await this._removeActiveConnection(key3, active);
        }
      }
    };
  }
  _createProvider(config) {
    return this._instantiationService.createInstance(RemoteAgentHostSessionsProvider, config);
  }
  async _waitForSessionTypes(provider, token) {
    const deadline = Date.now() + 3e4;
    while (provider.sessionTypes.length === 0) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new Error(localize(5088, null));
      }
      let timedOut = false;
      await raceCancellationError(
        raceTimeout(Event2.toPromise(provider.onDidChangeSessionTypes), remaining, () => timedOut = true),
        token
      );
      if (timedOut) {
        throw new Error(localize(5088, null));
      }
    }
  }
  async disconnect(workspaceUri) {
    const key3 = getComparisonKey(workspaceUri);
    const pending = this._pendingConnections.get(key3);
    if (pending) {
      pending.tokenSource.cancel();
      await pending.promise.then(
        () => void 0,
        () => void 0
      );
    }
    const active = this._activeConnections.get(key3);
    if (!active) {
      return;
    }
    await this._removeActiveConnection(key3, active);
  }
  async _removeActiveConnection(key3, active) {
    await this._remoteAgentHostService.removeRemoteAgentHost(active.address);
    this._providerStores.deleteAndDispose(key3);
  }
  _isConnectedOrReconnecting(address) {
    return this._remoteAgentHostService.connections.some(
      (connection) => connection.address === address && (RemoteAgentHostConnectionStatus.isConnected(connection.status) || RemoteAgentHostConnectionStatus.isReconnecting(connection.status))
    );
  }
  _reconcileConnections() {
    for (const [key3, active] of this._activeConnections) {
      const connectionInfo = this._remoteAgentHostService.connections.find((connection) => connection.address === active.address);
      if (!connectionInfo) {
        this._providerStores.deleteAndDispose(key3);
        continue;
      }
      active.provider.setConnectionStatus(connectionInfo.status);
      if (RemoteAgentHostConnectionStatus.isConnected(connectionInfo.status)) {
        const connection = this._remoteAgentHostService.getConnection(active.address);
        if (connection) {
          active.provider.setConnection(connection, connectionInfo.defaultDirectory);
        }
      }
    }
  }
  dispose() {
    for (const pending of this._pendingConnections.values()) {
      pending.tokenSource.cancel();
      pending.tokenSource.dispose();
    }
    this._pendingConnections.clear();
    super.dispose();
  }
};

DevContainerAgentHostService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IRemoteAgentHostService),
  __decorateParam(2, ISessionsProvidersService)
], DevContainerAgentHostService);

registerSingleton(IDevContainerAgentHostService, DevContainerAgentHostService, 1 /* Delayed */);
export { DevContainerAgentHostService };
