// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/agentHostFilter/browser/agentHostFilterService.ts
import { isAgentHostProvider } from "./module-1764.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { Codicon } from "./module-0085.mjs";
import { isWeb } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IRemoteAgentHostService } from "./module-1736.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAgentHostFilterService } from "./module-3520.mjs";


// src/vs/sessions/services/agentHostFilter/browser/agentHostFilterService.ts
var STORAGE_KEY5 = "sessions.agentHostFilter.selectedProviderId";

function mapStatus(s) {
  switch (s.kind) {
    case "connected":
      return "connected" /* Connected */;
    case "connecting":
      return "connecting" /* Connecting */;
    case "reconnecting":
      return "connecting" /* Connecting */;
    case "disconnected":
    case "incompatible":
    default:
      return "disconnected" /* Disconnected */;
  }
}

function rollupStatus(statuses) {
  if (statuses.includes("connected" /* Connected */)) {
    return "connected" /* Connected */;
  }
  if (statuses.includes("connecting" /* Connecting */)) {
    return "connecting" /* Connecting */;
  }
  return "disconnected" /* Disconnected */;
}

function isRemoteAgentHostProvider(provider) {
  if (!provider || typeof provider !== "object" || !("id" in provider)) {
    return false;
  }
  const p = provider;
  return isAgentHostProvider(p) && p.connectionStatus !== void 0 && typeof p.remoteAddress === "string";
}

var AgentHostFilterService = class extends Disposable {
  constructor(_sessionsProvidersService, _remoteAgentHostService, _storageService) {
    super();
    this._sessionsProvidersService = _sessionsProvidersService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this._storageService = _storageService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidChangeDiscovering = this._register(new Emitter());
    this.onDidChangeDiscovering = this._onDidChangeDiscovering.event;
    /**
     * `true` while {@link _selectedHostId} comes from the fallback rather than
     * from the user. An automatic choice is provisional and can be replaced.
     */
    this._selectionIsAutomatic = false;
    this._hosts = [];
    /**
     * Discovery handlers contributed by host providers (e.g. dev tunnels).
     * {@link rediscover} fans out to every handler and waits for them to
     * settle.
     */
    this._discoveryHandlers = /* @__PURE__ */ new Set();
    /**
     * Number of in-flight {@link rediscover} calls. {@link isDiscovering}
     * is `true` while this is non-zero. Tracked as a counter so concurrent
     * calls don't race a flag back to `false`.
     */
    this._discoveringCount = 0;
    /**
     * Groups declared via {@link registerHostGroup}. Each always yields an
     * entry, whether or not any member provider exists yet.
     */
    this._declaredGroups = /* @__PURE__ */ new Map();
    /**
     * Subscriptions to the `connectionStatus` observable of every currently
     * registered remote provider. Rebuilt whenever the set of providers
     * changes so we always observe the live set.
     */
    this._providerWatchers = this._register(new DisposableStore());
    this._selectedHostId = this._storageService.get(STORAGE_KEY5, 0 /* PROFILE */, void 0);
    this._rewatchProviders();
    this._register(this._sessionsProvidersService.onDidChangeProviders(() => this._rewatchProviders()));
  }
  get selectedHostId() {
    return this._selectedHostId;
  }
  get selectedHost() {
    if (this._selectedHostId === void 0) {
      return void 0;
    }
    return this._hosts.find((h3) => h3.id === this._selectedHostId);
  }
  get hosts() {
    return this._hosts;
  }
  get isDiscovering() {
    return this._discoveringCount > 0;
  }
  async rediscover() {
    if (this._discoveryHandlers.size === 0) {
      return;
    }
    this._discoveringCount++;
    if (this._discoveringCount === 1) {
      this._onDidChangeDiscovering.fire();
    }
    try {
      await Promise.allSettled(
        [...this._discoveryHandlers].map((h3) => h3().catch(() => {
        }))
      );
    } finally {
      this._discoveringCount--;
      if (this._discoveringCount === 0) {
        this._onDidChangeDiscovering.fire();
      }
    }
  }
  registerDiscoveryHandler(handler) {
    this._discoveryHandlers.add(handler);
    return toDisposable(() => this._discoveryHandlers.delete(handler));
  }
  registerHostGroup(group2) {
    this._declaredGroups.set(group2.id, group2);
    this._rewatchProviders();
    return toDisposable(() => {
      if (this._declaredGroups.delete(group2.id) && !this._providerWatchers.isDisposed) {
        this._rewatchProviders();
      }
    });
  }
  setSelectedHostId(hostId) {
    if (!this._hosts.some((h3) => h3.id === hostId)) {
      return;
    }
    const changed = hostId !== this._selectedHostId;
    this._selectedHostId = hostId;
    this._selectionIsAutomatic = false;
    this._persist(hostId);
    if (changed) {
      this._onDidChange.fire();
    }
  }
  reconnect(hostId) {
    const host = this._hosts.find((h3) => h3.id === hostId);
    if (!host) {
      return;
    }
    for (const providerId of host.providerIds) {
      const provider = this._sessionsProvidersService.getProvider(providerId);
      if (provider && isAgentHostProvider(provider) && provider.connect) {
        provider.connect().catch(() => {
        });
        continue;
      }
      const address = provider && isAgentHostProvider(provider) ? provider.remoteAddress : host.address;
      if (address) {
        this._remoteAgentHostService.reconnect(address);
      }
    }
  }
  disconnect(hostId) {
    const host = this._hosts.find((h3) => h3.id === hostId);
    if (!host) {
      return;
    }
    for (const providerId of host.providerIds) {
      const provider = this._sessionsProvidersService.getProvider(providerId);
      if (provider && isAgentHostProvider(provider) && provider.disconnect) {
        provider.disconnect().catch(() => {
        });
      }
    }
  }
  /**
   * Resolve a selection against the live entry list. A selection made by the
   * fallback is provisional and is replaced once a connectable entry shows
   * up; an explicit user choice is always kept.
   */
  _validate(hostId) {
    if (this._hosts.length === 0) {
      return { id: void 0, automatic: false };
    }
    const current = hostId === void 0 ? void 0 : this._hosts.find((h3) => h3.id === hostId);
    if (current && (!this._selectionIsAutomatic || current.connectable)) {
      return { id: current.id, automatic: this._selectionIsAutomatic };
    }
    const connectable = this._hosts.find((h3) => h3.connectable);
    return { id: (connectable ?? current ?? this._hosts[0]).id, automatic: true };
  }
  /**
   * Subscribe to the current set of remote providers so that host list
   * updates (registration/unregistration and status changes) are surfaced
   * via {@link onDidChange}. One `autorun` reads every provider's
   * `connectionStatus` observable and recomputes the entry list, folding
   * providers that declare an {@link IAgentHostGroup} into a single entry.
   */
  _rewatchProviders() {
    this._providerWatchers.clear();
    const providers2 = this._sessionsProvidersService.getProviders().filter(isRemoteAgentHostProvider);
    this._providerWatchers.add(autorun((reader) => {
      const grouped = /* @__PURE__ */ new Map();
      const entries2 = [];
      const groupEntry = (group2) => {
        let entry = grouped.get(group2.id);
        if (!entry) {
          entry = {
            id: group2.id,
            providerIds: [],
            label: group2.label,
            grouped: true,
            address: void 0,
            icon: group2.icon ?? Codicon.remote,
            status: "disconnected" /* Disconnected */,
            connectable: group2.connectable !== false,
            order: group2.order ?? 0
          };
          grouped.set(group2.id, entry);
          entries2.push(entry);
        }
        return entry;
      };
      for (const group2 of this._declaredGroups.values()) {
        groupEntry(group2);
      }
      for (const provider of providers2) {
        const status2 = mapStatus(provider.connectionStatus.read(reader));
        const group2 = provider.hostGroup;
        if (!group2) {
          entries2.push({
            id: provider.id,
            providerIds: [provider.id],
            label: provider.label,
            grouped: false,
            address: provider.remoteAddress,
            icon: provider.icon,
            status: status2,
            connectable: true,
            order: 0
          });
          continue;
        }
        const entry = groupEntry(group2);
        entry.providerIds.push(provider.id);
        entry.status = rollupStatus([entry.status, status2]);
      }
      entries2.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
      this._applyHosts(entries2.map(({ order, ...entry }) => entry));
    }));
  }
  _applyHosts(hosts) {
    const changed = hosts.length !== this._hosts.length || hosts.some((h3, i2) => h3.id !== this._hosts[i2].id || h3.label !== this._hosts[i2].label || h3.address !== this._hosts[i2].address || h3.status !== this._hosts[i2].status || h3.providerIds.length !== this._hosts[i2].providerIds.length || h3.providerIds.some((p, j) => p !== this._hosts[i2].providerIds[j]));
    this._hosts = hosts;
    const validated = isWeb ? this._validate(this._selectedHostId) : { id: void 0, automatic: false };
    const selectionChanged = validated.id !== this._selectedHostId;
    if (selectionChanged) {
      this._selectedHostId = validated.id;
    }
    this._selectionIsAutomatic = validated.automatic;
    if (changed || selectionChanged) {
      this._onDidChange.fire();
    }
  }
  /**
   * Store an explicit user choice. Automatic selections are deliberately not
   * stored, so a restart re-runs the fallback against the hosts of the day.
   */
  _persist(hostId) {
    this._storageService.store(STORAGE_KEY5, hostId, 0 /* PROFILE */, 0 /* USER */);
  }
};

AgentHostFilterService = __decorateClass([
  __decorateParam(0, ISessionsProvidersService),
  __decorateParam(1, IRemoteAgentHostService),
  __decorateParam(2, IStorageService)
], AgentHostFilterService);

registerSingleton(IAgentHostFilterService, AgentHostFilterService, 1 /* Delayed */);
export { mapStatus, rollupStatus, isRemoteAgentHostProvider, STORAGE_KEY5, AgentHostFilterService };
