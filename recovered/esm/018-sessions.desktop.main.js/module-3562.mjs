// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionWorkspaceFallback.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isWorktreeWorkspaceUri } from "./module-3545.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/sessions/contrib/chat/browser/sessionWorkspaceFallback.ts
var MAX_RECENT_SESSIONS = 15;

var SessionWorkspaceFallback = class extends Disposable {
  constructor(options3, sessionsProvidersService, fileService, uriIdentityService) {
    super();
    this.options = options3;
    this.sessionsProvidersService = sessionsProvidersService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._providerListeners = this._register(new DisposableStore());
    this.refreshProviders();
  }
  refreshProviders() {
    this._providerListeners.clear();
    for (const provider of this.sessionsProvidersService.getProviders()) {
      if (this.options.canUseProvider(provider.id)) {
        this._providerListeners.add(provider.onDidChangeSessions(() => this._onDidChange.fire()));
      }
    }
  }
  /** Returns the highest-ranked existing workspace among recent sessions. */
  async findWorkspace() {
    const sessions = this.sessionsProvidersService.getProviders().filter((provider) => this.options.canUseProvider(provider.id)).flatMap((provider) => provider.getSessions()).sort((a, b) => b.updatedAt.get().getTime() - a.updatedAt.get().getTime()).slice(0, MAX_RECENT_SESSIONS);
    const candidates = this._rankCandidates(sessions);
    for (const candidate of candidates) {
      const resolved = this.options.resolveWorkspace(candidate.folderUri, candidate.providerId);
      if (!resolved || !this.options.canUseProvider(resolved.providerId) || this.options.isProviderUnavailable(resolved.providerId) || !this.fileService.hasProvider(candidate.folderUri)) {
        continue;
      }
      if (await this.fileService.exists(candidate.folderUri)) {
        return resolved;
      }
    }
    return void 0;
  }
  _rankCandidates(sessions) {
    const candidates = /* @__PURE__ */ new Map();
    for (let index2 = 0; index2 < sessions.length; index2++) {
      const session = sessions[index2];
      const folderUri = this._getWorkspaceFolder(session);
      if (!folderUri) {
        continue;
      }
      const key3 = this.uriIdentityService.extUri.getComparisonKey(folderUri);
      const candidate = candidates.get(key3);
      candidates.set(key3, candidate ? { ...candidate, count: candidate.count + 1 } : { folderUri, providerId: session.providerId, count: 1, firstIndex: index2 });
    }
    return [...candidates.values()].sort((a, b) => b.count - a.count || a.firstIndex - b.firstIndex);
  }
  _getWorkspaceFolder(session) {
    if (session.isQuickChat?.get() || session.worktreePending?.get()) {
      return void 0;
    }
    const folder = session.workspace.get()?.folders[0];
    if (folder?.gitRepository?.workTreeUri) {
      return void 0;
    }
    const folderUri = folder?.root;
    return folderUri && !isWorktreeWorkspaceUri(folderUri) ? folderUri : void 0;
  }
};

SessionWorkspaceFallback = __decorateClass([
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IUriIdentityService)
], SessionWorkspaceFallback);
export { MAX_RECENT_SESSIONS, SessionWorkspaceFallback };
