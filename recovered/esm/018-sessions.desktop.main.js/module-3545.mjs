// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionsRecentWorkspacesService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { IWorkspacesService, isRecentFolder } from "./module-1378.mjs";
import { basename2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/sessions/browser/sessionsRecentWorkspacesService.ts
var STORAGE_KEY_RECENT_WORKSPACES = "sessions.recentlyPickedWorkspaces";

var MAX_RECENT_WORKSPACES = 10;

var MAX_VSCODE_RECENT_WORKSPACES = 10;

function isWorktreeWorkspaceUri(uri4) {
  return uri4.path.split("/").some((segment) => {
    const normalizedSegment = segment.toLowerCase();
    return normalizedSegment.endsWith(".worktrees") || normalizedSegment === "copilot-worktrees";
  });
}

var ISessionsRecentWorkspacesService = createDecorator("sessionsRecentWorkspacesService");

var SessionsRecentWorkspacesService = class extends Disposable {
  constructor(storageService, uriIdentityService, workspacesService, sessionsProvidersService) {
    super();
    this.storageService = storageService;
    this.uriIdentityService = uriIdentityService;
    this.workspacesService = workspacesService;
    this.sessionsProvidersService = sessionsProvidersService;
    this._onDidChangeRecentWorkspaces = this._register(new Emitter());
    this.onDidChangeRecentWorkspaces = this._onDidChangeRecentWorkspaces.event;
    this._vsCodeRecentFolderUris = [];
    this._refreshVSCodeRecentWorkspaces();
    this._register(this.workspacesService.onDidChangeRecentlyOpened(() => this._refreshVSCodeRecentWorkspaces()));
  }
  getRecentWorkspaces(includeVSCodeRecents = true) {
    const own = this._getStoredRecentWorkspaces();
    if (!includeVSCodeRecents) {
      return this._resolveStored(own);
    }
    const ownUris = new Set(own.map((o) => this.uriIdentityService.extUri.getComparisonKey(URI.revive(o.uri))));
    const vsCode = this._vsCodeRecentFolderUris.filter((uri4) => !ownUris.has(this.uriIdentityService.extUri.getComparisonKey(uri4))).map((uri4) => ({ uri: uri4.toJSON(), providerId: void 0, checked: false }));
    return this._resolveStored([...own, ...vsCode]);
  }
  _resolveStored(stored) {
    const recents = [];
    for (const entry of stored) {
      const folderUri = URI.revive(entry.uri);
      const resolved = this._resolveWorkspace(folderUri, entry.providerId);
      if (resolved) {
        recents.push({ workspace: resolved.workspace, providerId: resolved.providerId, checked: entry.checked });
      }
    }
    return recents;
  }
  addRecentWorkspace(folderUri, providerId, checked) {
    const recents = this._getStoredRecentWorkspaces();
    const filtered = recents.map((p) => {
      if (this.uriIdentityService.extUri.isEqual(URI.revive(p.uri), folderUri)) {
        return void 0;
      }
      if (checked && p.checked) {
        return { ...p, checked: false };
      }
      return p;
    }).filter((p) => p !== void 0);
    const entry = { uri: folderUri.toJSON(), providerId, checked };
    const updated = [entry, ...filtered].slice(0, MAX_RECENT_WORKSPACES);
    this._persistRecentWorkspaces(updated);
  }
  removeRecentWorkspace(folderUri) {
    const recents = this._getStoredRecentWorkspaces();
    const updated = recents.filter((p) => !this.uriIdentityService.extUri.isEqual(URI.revive(p.uri), folderUri));
    if (updated.length !== recents.length) {
      this._persistRecentWorkspaces(updated);
    }
    this.workspacesService.removeRecentlyOpened([folderUri]);
  }
  clearCheckedWorkspace() {
    const recents = this._getStoredRecentWorkspaces();
    const updated = recents.map((p) => ({ ...p, checked: false }));
    this._persistRecentWorkspaces(updated);
  }
  /** Resolves `folderUri` to its workspace, trying `preferredProviderId` first if given. */
  _resolveWorkspace(folderUri, preferredProviderId) {
    if (preferredProviderId) {
      const preferred = this.sessionsProvidersService.getProvider(preferredProviderId);
      const workspace = preferred?.resolveWorkspace(folderUri);
      if (workspace) {
        return { providerId: preferredProviderId, workspace };
      }
    }
    for (const provider of this.sessionsProvidersService.getProviders()) {
      const workspace = provider.resolveWorkspace(folderUri);
      if (workspace) {
        return { providerId: provider.id, workspace };
      }
    }
    return void 0;
  }
  async _refreshVSCodeRecentWorkspaces() {
    const recentlyOpened = await this.workspacesService.getRecentlyOpened();
    this._vsCodeRecentFolderUris = recentlyOpened.workspaces.filter(isRecentFolder).map((f) => f.folderUri).filter((uri4) => !basename2(uri4).startsWith("copilot-")).filter((uri4) => !isWorktreeWorkspaceUri(uri4)).slice(0, MAX_VSCODE_RECENT_WORKSPACES);
    this._onDidChangeRecentWorkspaces.fire();
  }
  _getStoredRecentWorkspaces() {
    const raw = this.storageService.get(STORAGE_KEY_RECENT_WORKSPACES, 0 /* PROFILE */);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  _persistRecentWorkspaces(entries2) {
    this.storageService.store(STORAGE_KEY_RECENT_WORKSPACES, JSON.stringify(entries2), 0 /* PROFILE */, 1 /* MACHINE */);
    this._onDidChangeRecentWorkspaces.fire();
  }
};

SessionsRecentWorkspacesService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IWorkspacesService),
  __decorateParam(3, ISessionsProvidersService)
], SessionsRecentWorkspacesService);

registerSingleton(ISessionsRecentWorkspacesService, SessionsRecentWorkspacesService, 1 /* Delayed */);
export { isWorktreeWorkspaceUri, STORAGE_KEY_RECENT_WORKSPACES, MAX_RECENT_WORKSPACES, MAX_VSCODE_RECENT_WORKSPACES, ISessionsRecentWorkspacesService, SessionsRecentWorkspacesService };
