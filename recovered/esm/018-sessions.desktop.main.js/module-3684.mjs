// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostSessionsProvider.ts
import { Schemas } from "./module-0033.mjs";
import { AGENT_HOST_SCHEME, agentHostAuthority, fromAgentHostUri, toAgentHostContentUri, toAgentHostUri } from "./module-1001.mjs";
import { BaseAgentHostSessionsProvider } from "./module-3672.mjs";
import { Codicon } from "./module-0085.mjs";
import { observableValue } from "./module-0048.mjs";
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus, removeWebSocketRemoteAgentHostEntry } from "./module-1736.mjs";
import { Emitter } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ResourceLabelHomeStore } from "./module-3674.mjs";
import { AutomationStore } from "./module-3683.mjs";
import { providerAutomationStorageKey } from "./module-3680.mjs";
import { ReconnectableAgentHostAutomationStore } from "./module-3682.mjs";
import { remoteAgentHostSessionTypeAuthorityPrefix, remoteAgentHostSessionTypeId } from "./module-0959.mjs";
import { localize } from "./module-0001.mjs";
import { SESSION_WORKSPACE_GROUP_REMOTE } from "./module-1767.mjs";
import { isWeb } from "./module-0014.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { buildAgentHostSessionWorkspace, readBranchProtectionPatterns } from "./module-3661.mjs";
import { AgentSession } from "./module-1107.mjs";
import { constObservable } from "./module-0061.mjs";
import { agentHostUri } from "./module-1755.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IAgentHostActiveClientService } from "./module-1759.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostSessionsProvider.ts
var CACHED_SESSIONS_STORAGE_PREFIX = "remoteAgentHost.cachedSessions.v2.";

var CACHED_SESSIONS_STORAGE_PREFIX_LEGACY = "remoteAgentHost.cachedSessions.";

function toLocalProjectUri(uri4, connectionAuthority) {
  return uri4.scheme === Schemas.file ? toAgentHostUri(uri4, connectionAuthority) : uri4;
}

var RemoteAgentHostSessionsProvider = class extends BaseAgentHostSessionsProvider {
  constructor(config, _fileDialogService, _notificationService, storageService, chatSessionsService, chatService, chatWidgetService, languageModelsService, _remoteAgentHostService, _labelService, _configurationService, logService, gitHubService, instantiationService, sessionsService, activeClientService, dialogService, workspaceTrustManagementService) {
    super(chatSessionsService, chatService, chatWidgetService, languageModelsService, _configurationService, logService, gitHubService, instantiationService, sessionsService, activeClientService, storageService, dialogService, workspaceTrustManagementService);
    this._fileDialogService = _fileDialogService;
    this._notificationService = _notificationService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this._labelService = _labelService;
    this._configurationService = _configurationService;
    this.icon = Codicon.remote;
    this._connectionStatus = observableValue("connectionStatus", RemoteAgentHostConnectionStatus.disconnected);
    /**
     * Forces this host's sessions read-only. Distinct from `disconnected`: a disconnected host may
     * come back, so its sessions stay writable and queue on reconnect, whereas this marks a host
     * that is gone and whose sessions exist only as replayed history.
     */
    this._readOnly = observableValue("providerReadOnly", false);
    this.connectionStatus = this._connectionStatus;
    /**
     * `true` while we are still resolving and pushing tokens for the host's
     * `protectedResources`. Defaults to `true` so that sessions surface as
     * loading until the first authentication pass settles.
     */
    this._authenticationPending = observableValue("authenticationPending", true);
    this._authenticationSettled = false;
    this._onDidDisconnect = this._register(new Emitter());
    this._connectionListeners = this._register(new DisposableStore());
    /**
     * When `true`, the provider has been marked unreachable and sessions are
     * hidden from {@link getSessions}, even though {@link _sessionCache} and
     * persistent storage are retained. Cleared when a new connection is wired
     * up in {@link setConnection}, at which point the cached entries are
     * re-announced so the UI can repopulate.
     */
    this._unpublished = false;
    this._resourceLabelHomes = this._register(instantiationService.createInstance(ResourceLabelHomeStore));
    this._connectionAuthority = agentHostAuthority(config.address);
    this._connectOnDemand = config.connectOnDemand;
    this._disconnectOnDemand = config.disconnectOnDemand;
    this._sessionSchemeAlias = config.sessionSchemeAlias;
    this._omitHostFromWorkspaceLabel = config.omitHostFromWorkspaceLabel === true;
    this._workspaceTypeIcon = config.workspaceTypeIcon;
    this._defaultChangesetKind = config.defaultChangesetKind;
    this.onDidReportConnectProgress = config.onDidReportConnectProgress;
    this.canConnectOnDemand = !!config.connectOnDemand;
    this._register(this._onDidChangeSessionsImmediately(() => this.updateResourceLabelHomes()));
    this._register(this._onDidChangeDraftSessions.event(() => this.updateResourceLabelHomes()));
    this.updateResourceLabelHomes();
    const displayName = config.name || config.address;
    this.id = `agenthost-${this._connectionAuthority}`;
    this.label = displayName;
    this.remoteAddress = config.address;
    this.remoteLocationPreferenceKey = config.preferenceKey ?? config.address;
    this.hostGroup = config.hostGroup;
    this._storageKey = `${CACHED_SESSIONS_STORAGE_PREFIX}${this._connectionAuthority}`;
    const legacyAutomations = this._register(instantiationService.createInstance(AutomationStore, providerAutomationStorageKey(this.id)));
    this._automationStore = this._register(instantiationService.createInstance(ReconnectableAgentHostAutomationStore, this.id, legacyAutomations, {
      toHost: (resource) => fromAgentHostUri(resource),
      fromHost: (resource) => toAgentHostUri(resource, this._connectionAuthority),
      resourceSchemeForProvider: (provider) => this.resourceSchemeForProvider(provider),
      providerForSessionScheme: (scheme) => this._sessionSchemeAlias?.backend === scheme ? this._sessionSchemeAlias.ui : scheme,
      providerForResourceScheme: (scheme) => {
        const prefix = remoteAgentHostSessionTypeAuthorityPrefix(this._connectionAuthority);
        return scheme.startsWith(prefix) ? scheme.slice(prefix.length) : void 0;
      }
    }));
    this.automations = this._automationStore;
    this.browseActions = [{
      label: localize(5206, null),
      description: displayName,
      group: SESSION_WORKSPACE_GROUP_REMOTE,
      icon: Codicon.remote,
      providerId: this.id,
      run: () => this._browseForFolder(),
      listFolders: (query, token) => this._listRemoteFolders(query, token)
    }];
    this._enableSessionCachePersistence(this._storageKey, `${CACHED_SESSIONS_STORAGE_PREFIX_LEGACY}${this._connectionAuthority}`);
    this.updateResourceLabelHomes();
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("git.branchProtection")) {
        this._refreshSessionWorkspaces();
      }
    }));
  }
  get onConnectionLost() {
    return this._onDidDisconnect.event;
  }
  /**
   * Overridable seam so tests can exercise both the web and non-web
   * branches of the label/description gating without depending on the
   * ambient {@link isWeb} constant (the browser test runner always
   * reports `isWeb === true`).
   */
  get isWebPlatform() {
    return isWeb;
  }
  // -- BaseAgentHostSessionsProvider hooks ---------------------------------
  get connection() {
    return this._connection;
  }
  get authenticationPending() {
    return this._authenticationPending;
  }
  /**
   * Suspend cache-change tracking while sessions are unpublished (offline) so
   * the on-disk snapshot survives an unreachable host. See
   * {@link unpublishCachedSessions}.
   */
  _shouldTrackSessionCacheChanges() {
    return !this._unpublished;
  }
  _adapterOptions() {
    const hostLabel = this._workspaceHostLabel;
    const typeIcon = this._workspaceTypeIcon;
    return {
      readOnly: this._readOnly,
      defaultChangesetKind: this._defaultChangesetKind,
      buildWorkspace: (project, workingDirectories, gitHubInfo, gitState) => {
        const primary = workingDirectories?.[0];
        const uriForDescription = project?.uri ?? primary;
        const description = uriForDescription ? this._labelService.getUriLabel(dirname2(uriForDescription), { relative: false }) : void 0;
        const branchProtectionPatterns = readBranchProtectionPatterns(this._configurationService, primary ?? project?.uri);
        return RemoteAgentHostSessionsProvider.buildWorkspace(project, workingDirectories, hostLabel, gitHubInfo, gitState, description, branchProtectionPatterns, typeIcon);
      }
    };
  }
  resourceSchemeForProvider(provider) {
    return remoteAgentHostSessionTypeId(this._connectionAuthority, provider);
  }
  getSessions() {
    return this._unpublished ? [] : super.getSessions();
  }
  mapWorkingDirectoryUri(uri4) {
    return toAgentHostUri(uri4, this._connectionAuthority);
  }
  mapProjectUri(uri4) {
    return toLocalProjectUri(uri4, this._connectionAuthority);
  }
  _diffUriMapper() {
    return (uri4, options3) => options3?.contentRef ? toAgentHostContentUri(uri4, this._connectionAuthority) : toAgentHostUri(uri4, this._connectionAuthority);
  }
  _validateBeforeCreate(_sessionType) {
    if (!this._connection) {
      throw new Error(localize(5210, null, this.label));
    }
  }
  _noAgentsErrorMessage() {
    return localize(5207, null, this.label);
  }
  _notConnectedSendErrorMessage() {
    return localize(5209, null, this.label);
  }
  // -- Connection lifecycle ------------------------------------------------
  /**
   * Establish (or re-establish) the connection for this host on demand.
   * Tunnel-backed providers use their relay hook; other providers fall
   * back to the generic remote agent host reconnect path.
   */
  async connect() {
    if (this._connectOnDemand) {
      await this._connectOnDemand();
      return;
    }
    this._remoteAgentHostService.reconnect(this.remoteAddress);
  }
  /**
   * Tear down the active connection for this host. Tunnel-backed providers
   * use their relay hook; other providers fall back to the generic remote
   * agent host disconnect path. Cached sessions are hidden from the UI so
   * the sessions list reflects the disconnected state; the persisted cache
   * is retained so sessions can be restored on reconnect.
   */
  async disconnect() {
    this.unpublishCachedSessions();
    if (this._disconnectOnDemand) {
      await this._disconnectOnDemand();
      return;
    }
    await removeWebSocketRemoteAgentHostEntry(this._configurationService, this.remoteAddress);
    await this._remoteAgentHostService.removeRemoteAgentHost(this.remoteAddress);
  }
  /** Update the connection status for this provider. */
  setConnectionStatus(status2) {
    this._connectionStatus.set(status2, void 0);
  }
  /**
   * Forces every session on this host to be read-only.
   *
   * Set when the host is permanently unreachable and its sessions are being served from
   * persisted history: the conversation is genuine, but there is no host left to send to, so the
   * composer must be hidden rather than accept input that can never be delivered.
   */
  setReadOnly(readOnly) {
    this._readOnly.set(readOnly, void 0);
  }
  /**
   * Seed discovered session summaries into the cache so they surface in the sessions list
   * **before** a connection is established (lazy discovery).
   *
   * An entry that already exists keeps everything the host has told us, except for a missing
   * project: the repository name is resolved over the network and that lookup can fail, so
   * filling it in on a later pass is what makes retrying worth anything. Opening a seeded session
   * triggers `connectOnDemand`, after which `_refreshSessions` reconciles against the host.
   */
  seedSessions(metas) {
    const added = [];
    const changed = [];
    for (const rawMeta of metas) {
      const meta = this._adoptSessionMeta(rawMeta);
      const rawId = AgentSession.id(meta.session);
      const existing = this._sessionCache.get(rawId);
      if (existing) {
        if (meta.project && !existing.project && existing.backfillProject(meta.project)) {
          changed.push(existing);
        }
        continue;
      }
      const adapter = this.createAdapter(meta);
      this._sessionCache.set(rawId, adapter);
      added.push(adapter);
    }
    if (added.length > 0 || changed.length > 0) {
      this._onDidChangeSessions.fire({ added, removed: [], changed });
    }
  }
  /**
   * Map a host-reported session URI onto the UI scheme, so the session routes to the agent's
   * content provider. The raw id is preserved, so cache keys are unaffected.
   */
  _adoptSessionMeta(meta) {
    const alias = this._sessionSchemeAlias;
    if (!alias || meta.session.scheme !== alias.backend) {
      return meta;
    }
    return { ...meta, session: meta.session.with({ scheme: alias.ui }) };
  }
  /**
   * Inverse of {@link _adoptSessionMeta}: map the UI scheme back to the one the host's session
   * registry is keyed by, so backend calls address the URI the host knows.
   */
  _backendSessionScheme(agentProvider) {
    const alias = this._sessionSchemeAlias;
    return alias && agentProvider === alias.ui ? alias.backend : agentProvider;
  }
  _logicalSessionTypeForBackendScheme(backendScheme) {
    const alias = this._sessionSchemeAlias;
    return alias && backendScheme === alias.backend ? alias.ui : backendScheme;
  }
  setAuthenticationPending(pending) {
    if (this._authenticationSettled) {
      return;
    }
    if (!pending) {
      this._authenticationSettled = true;
    }
    this._authenticationPending.set(pending, void 0);
    if (!pending) {
      this._resumeNewSessionAfterAuthenticationSettles();
    }
  }
  /**
   * Wire a live connection to this provider, enabling session operations and folder browsing.
   */
  setConnection(connection, defaultDirectory) {
    if (this._connection === connection && this._defaultDirectory === defaultDirectory) {
      return;
    }
    const wasUnpublished = this._unpublished;
    this._connectionListeners.clear();
    this._sessionStateSubscriptions.clearAndDisposeAll();
    this._connection = connection;
    this._automationStore.setConnection(connection);
    this._defaultDirectory = defaultDirectory;
    this._unpublished = false;
    this.updateResourceLabelHomes();
    this._syncRootState(connection.rootState.value);
    this._connectionListeners.add(connection.rootState.onDidChange(() => {
      this._syncRootState(connection.rootState.value);
    }));
    if (connection.rootState.onDidError) {
      this._connectionListeners.add(connection.rootState.onDidError((error) => {
        this._syncRootState(error);
      }));
    }
    this._attachConnectionListeners(connection, this._connectionListeners);
    this._refreshSessions(wasUnpublished);
  }
  /**
   * Clear the connection, e.g. when the remote host disconnects.
   * Retains the provider registration so it remains visible in the UI,
   * and **preserves** the cached session list so previously loaded
   * sessions stay visible while we're offline. Callers that know the
   * host is unreachable should follow up with {@link unpublishCachedSessions}.
   */
  clearConnection() {
    this._connectionListeners.clear();
    this._sessionStateSubscriptions.clearAndDisposeAll();
    this._onDidDisconnect.fire();
    this._connection = void 0;
    this._automationStore.clearConnection();
    this._defaultDirectory = void 0;
    this.updateResourceLabelHomes();
    this._disposeAllNewSessions();
    this._syncRootState(void 0);
    if (this._pendingSession) {
      const pending = this._pendingSession;
      this._pendingSession = void 0;
      this._onDidChangeSessions.fire({ added: [], removed: [pending], changed: [] });
    }
    this._cacheInitialized = false;
    this._cancelSessionRefreshRetry();
  }
  updateResourceLabelHomes() {
    const homes = this.getResourceLabelHomes();
    for (const session of this.getKnownSessions()) {
      if (session.sessionType !== "copilotcli") {
        continue;
      }
      const label3 = this.getResourceLabelHomeLabel(session);
      for (const artifact of session.artifacts?.get() ?? []) {
        if (!artifact.uri) {
          continue;
        }
        const artifactUri = artifact.uri.scheme === AGENT_HOST_SCHEME ? fromAgentHostUri(artifact.uri) : artifact.uri;
        const match2 = /^(?<home>.*\/session-state\/[^/]+)(?:\/|$)/.exec(artifactUri.path);
        if (match2?.groups?.home) {
          homes.push({ uri: toAgentHostUri(artifactUri.with({ path: match2.groups.home, query: null, fragment: null }), this._connectionAuthority), label: label3 });
        }
      }
    }
    this._resourceLabelHomes.set(homes);
  }
  /**
   * Hide cached sessions from the UI without discarding them. Called by the
   * host-tracking contributions when they determine the remote host is
   * unreachable (tunnel offline or SSH reconnect failed). The in-memory
   * cache and persisted storage are left intact so the sessions can be
   * restored if the host comes back online in this session, or on the next
   * launch. The next {@link setConnection} call re-announces the cached
   * entries.
   */
  unpublishCachedSessions() {
    if (this._unpublished) {
      return;
    }
    this._unpublished = true;
    if (this._sessionCache.size > 0) {
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: [] });
    }
  }
  // -- Session-type sync ---------------------------------------------------
  _formatSessionTypeLabel(agentLabel) {
    if (this.isWebPlatform) {
      return agentLabel;
    }
    return `${agentLabel} [${this.label}]`;
  }
  // -- Workspaces ----------------------------------------------------------
  /**
   * The host name appended to this host's workspace labels, or `undefined` when it would add
   * nothing — in web the workbench is already scoped to a single host by the host picker.
   */
  get _workspaceHostLabel() {
    return this.isWebPlatform || this._omitHostFromWorkspaceLabel ? void 0 : this.label;
  }
  static buildWorkspace(project, workingDirectories, providerLabel, gitHubInfo, gitState, description, branchProtectionPatterns, typeIcon) {
    return buildAgentHostSessionWorkspace(project, workingDirectories, { providerLabel, fallbackIcon: Codicon.remote, requiresWorkspaceTrust: true, description, branchProtectionPatterns, group: SESSION_WORKSPACE_GROUP_REMOTE, typeIcon }, gitHubInfo, gitState);
  }
  _buildWorkspaceFromUri(uri4) {
    const folderName = basename2(uri4) || uri4.path;
    const hostLabel = this._workspaceHostLabel;
    return {
      uri: uri4,
      label: hostLabel ? `${folderName} [${hostLabel}]` : folderName,
      description: this._labelService.getUriLabel(dirname2(uri4), { relative: false }),
      group: SESSION_WORKSPACE_GROUP_REMOTE,
      icon: Codicon.remote,
      folders: [{
        root: uri4,
        workingDirectory: uri4,
        name: folderName,
        description: void 0,
        gitRepository: { uri: uri4, workTreeUri: void 0, baseBranchName: void 0, gitHubInfo: constObservable(void 0) }
      }],
      requiresWorkspaceTrust: true,
      isVirtualWorkspace: false
    };
  }
  resolveWorkspace(repositoryUri) {
    if (repositoryUri.scheme !== AGENT_HOST_SCHEME) {
      return void 0;
    }
    if (repositoryUri.authority !== this._connectionAuthority) {
      return void 0;
    }
    return this._buildWorkspaceFromUri(repositoryUri);
  }
  // -- Browse --------------------------------------------------------------
  async _browseForFolder() {
    if (!this._connection && this._connectOnDemand) {
      try {
        await this._connectOnDemand();
      } catch (err) {
        this._notificationService.error(localize(5205, null, this.label, err instanceof Error ? err.message : String(err)));
        return void 0;
      }
    }
    if (!this._connection) {
      this._notificationService.error(localize(5208, null, this.label));
      return void 0;
    }
    const defaultUri = agentHostUri(this._connectionAuthority, this._defaultDirectory ?? "/");
    try {
      const selected = await this._fileDialogService.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: localize(5211, null, this.label),
        availableFileSystems: [AGENT_HOST_SCHEME],
        defaultUri
      });
      if (selected?.[0]) {
        return this._buildWorkspaceFromUri(selected[0]);
      }
    } catch {
    }
    return void 0;
  }
  /**
   * Enumerate subdirectories below {@link _defaultDirectory}, filtered
   * by a case-insensitive substring query. Backs the inline folder
   * list rendered by the mobile workspace picker sheet so users can
   * pick a folder without opening a separate file-dialog.
   *
   * The query supports light path navigation: a `/` in the query is
   * treated as a path delimiter, listing children of `<default>/<prefix>`
   * and matching the part after the last slash. So typing `projects/`
   * drills into the `projects` directory, and `projects/foo` lists
   * children of `projects` whose name contains `foo`.
   *
   * Hidden directories (those starting with `.`) are omitted, results
   * are sorted by name, and the cancellation token is honored before
   * and after the network round-trip so stale queries don't surface
   * after the user has typed more characters.
   */
  async _listRemoteFolders(query, token) {
    if (!this._connection && this._connectOnDemand) {
      try {
        await this._connectOnDemand();
      } catch {
        return [];
      }
    }
    if (!this._connection || token.isCancellationRequested) {
      return [];
    }
    const rootAgentHostUri = agentHostUri(this._connectionAuthority, this._defaultDirectory ?? "/");
    const trimmed = query.trim();
    const lastSlash = trimmed.lastIndexOf("/");
    let listingAgentHostUri = rootAgentHostUri;
    let filter2 = trimmed;
    if (lastSlash >= 0) {
      const subPath = trimmed.slice(0, lastSlash).replace(/^\/+|\/+$/g, "");
      filter2 = trimmed.slice(lastSlash + 1);
      if (subPath) {
        listingAgentHostUri = URI.joinPath(rootAgentHostUri, subPath);
      }
    }
    const listingOriginalUri = fromAgentHostUri(listingAgentHostUri);
    let entries2;
    try {
      const result = await this._connection.resourceList(listingOriginalUri);
      entries2 = result.entries;
    } catch {
      return [];
    }
    if (token.isCancellationRequested) {
      return [];
    }
    const lowerFilter = filter2.toLocaleLowerCase();
    const folders = [];
    for (const entry of entries2) {
      if (entry.type !== "directory") {
        continue;
      }
      if (entry.name.startsWith(".")) {
        continue;
      }
      if (lowerFilter && !entry.name.toLocaleLowerCase().includes(lowerFilter)) {
        continue;
      }
      const childUri = URI.joinPath(listingAgentHostUri, entry.name);
      folders.push({ ...this._buildWorkspaceFromUri(childUri), icon: Codicon.folder });
    }
    folders.sort((a, b) => a.label.localeCompare(b.label));
    return folders;
  }
};

RemoteAgentHostSessionsProvider = __decorateClass([
  __decorateParam(1, IFileDialogService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IChatSessionsService),
  __decorateParam(5, IChatService),
  __decorateParam(6, IChatWidgetService),
  __decorateParam(7, ILanguageModelsService),
  __decorateParam(8, IRemoteAgentHostService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, ILogService),
  __decorateParam(12, IGitHubService),
  __decorateParam(13, IInstantiationService),
  __decorateParam(14, ISessionsService),
  __decorateParam(15, IAgentHostActiveClientService),
  __decorateParam(16, IDialogService),
  __decorateParam(17, IWorkspaceTrustManagementService)
], RemoteAgentHostSessionsProvider);
export { toLocalProjectUri, CACHED_SESSIONS_STORAGE_PREFIX, CACHED_SESSIONS_STORAGE_PREFIX_LEGACY, RemoteAgentHostSessionsProvider };
