// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/chatExternalPathConfirmation.ts
import { observableMemento } from "./module-1017.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { dirname2, extUriBiasedIgnorePathCase } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/chatExternalPathConfirmation.ts
var workspaceAllowlistMemento = observableMemento({
  key: "chat.externalPath.workspaceAllowlist",
  defaultValue: [],
  toStorage: (value2) => JSON.stringify(value2),
  fromStorage: (value2) => {
    const parsed = JSON.parse(value2);
    return Array.isArray(parsed) ? parsed : [];
  }
});

var ChatExternalPathConfirmationContribution = class {
  constructor(_getPathInfo, _labelService, _findGitRoot, storageService, _pickFolder) {
    this._getPathInfo = _getPathInfo;
    this._labelService = _labelService;
    this._findGitRoot = _findGitRoot;
    this._pickFolder = _pickFolder;
    this.canUseDefaultApprovals = false;
    this._sessionFolderAllowlist = new ResourceMap();
    /** Cache of path URI -> resolved git root URI (or null if not in a repo) */
    this._gitRootCache = new ResourceMap();
    if (storageService) {
      this._workspaceAllowlist = workspaceAllowlistMemento(1 /* WORKSPACE */, 1 /* MACHINE */, storageService);
    }
  }
  dispose() {
    this._workspaceAllowlist?.dispose();
  }
  _getWorkspaceFolders() {
    if (!this._workspaceAllowlist) {
      return new ResourceSet();
    }
    const set = new ResourceSet();
    for (const s of this._workspaceAllowlist.get()) {
      try {
        set.add(URI.parse(s));
      } catch {
      }
    }
    return set;
  }
  _setWorkspaceFolders(folders) {
    if (!this._workspaceAllowlist) {
      return;
    }
    const uriStrings = [];
    for (const uri5 of folders) {
      uriStrings.push(uri5.toString());
    }
    this._workspaceAllowlist.set(uriStrings, void 0);
  }
  getPreConfirmAction(ref) {
    const pathInfo = this._getPathInfo(ref);
    if (!pathInfo) {
      return void 0;
    }
    let pathUri;
    try {
      pathUri = URI.file(pathInfo.path);
    } catch {
      return void 0;
    }
    if (ref.workingDirectory) {
      if (extUriBiasedIgnorePathCase.isEqualOrParent(pathUri, ref.workingDirectory)) {
        return { type: 4 /* UserAction */ };
      }
    } else {
      const workspaceFolders = this._getWorkspaceFolders();
      for (const folderUri of workspaceFolders) {
        if (extUriBiasedIgnorePathCase.isEqualOrParent(pathUri, folderUri)) {
          return { type: 4 /* UserAction */ };
        }
      }
    }
    if (ref.chatSessionResource) {
      const sessionFolders = this._sessionFolderAllowlist.get(ref.chatSessionResource);
      if (sessionFolders) {
        for (const folderUri of sessionFolders) {
          if (extUriBiasedIgnorePathCase.isEqualOrParent(pathUri, folderUri)) {
            return { type: 4 /* UserAction */ };
          }
        }
      }
    }
    return void 0;
  }
  getPreConfirmActions(ref) {
    const pathInfo = this._getPathInfo(ref);
    if (!pathInfo || !ref.chatSessionResource) {
      return [];
    }
    let pathUri;
    try {
      pathUri = URI.file(pathInfo.path);
    } catch {
      return [];
    }
    const folderUri = pathInfo.isDirectory ? pathUri : dirname2(pathUri);
    const sessionResource = ref.chatSessionResource;
    const actions = [
      {
        label: localize(13402, null),
        detail: localize(13403, null),
        select: async () => {
          let folders = this._sessionFolderAllowlist.get(sessionResource);
          if (!folders) {
            folders = new ResourceSet();
            this._sessionFolderAllowlist.set(sessionResource, folders);
          }
          folders.add(folderUri);
          return true;
        }
      }
    ];
    if (this._findGitRoot) {
      const findGitRoot = this._findGitRoot;
      const gitRootCache = this._gitRootCache;
      const allowlist = this._sessionFolderAllowlist;
      const cached = gitRootCache.get(pathUri);
      if (cached === null) {
      } else if (cached) {
        actions.push({
          label: localize(13404, null),
          detail: localize(13405, null, cached.fsPath),
          select: async () => {
            let folders = allowlist.get(sessionResource);
            if (!folders) {
              folders = new ResourceSet();
              allowlist.set(sessionResource, folders);
            }
            folders.add(cached);
            return true;
          }
        });
      } else {
        actions.push({
          label: localize(13404, null),
          detail: localize(13406, null),
          select: async () => {
            const gitRootUri = await findGitRoot(pathUri);
            gitRootCache.set(pathUri, gitRootUri ?? null);
            let folders = allowlist.get(sessionResource);
            if (!folders) {
              folders = new ResourceSet();
              allowlist.set(sessionResource, folders);
            }
            folders.add(gitRootUri ?? folderUri);
            return true;
          }
        });
      }
    }
    return actions;
  }
  getManageActions() {
    const items = [];
    const workspaceFolders = this._getWorkspaceFolders();
    for (const folderUri of workspaceFolders) {
      items.push({
        label: this._labelService.getUriLabel(folderUri),
        description: localize(13408, null),
        checked: true,
        onDidChangeChecked: (checked) => {
          if (!checked) {
            workspaceFolders.delete(folderUri);
            this._setWorkspaceFolders(workspaceFolders);
          } else {
            workspaceFolders.add(folderUri);
            this._setWorkspaceFolders(workspaceFolders);
          }
        }
      });
    }
    const allSessionFolders = new ResourceSet();
    for (const [, folders] of this._sessionFolderAllowlist) {
      for (const folder of folders) {
        allSessionFolders.add(folder);
      }
    }
    for (const folderUri of allSessionFolders) {
      const wasInSessions = [...this._sessionFolderAllowlist].filter(([, folders]) => folders.has(folderUri));
      items.push({
        label: this._labelService.getUriLabel(folderUri),
        description: localize(13407, null),
        checked: true,
        onDidChangeChecked: (checked) => {
          if (!checked) {
            for (const [, folders] of wasInSessions) {
              folders.delete(folderUri);
            }
          } else {
            for (const [, folders] of wasInSessions) {
              folders.add(folderUri);
            }
          }
        }
      });
    }
    if (this._pickFolder) {
      const pickFolder = this._pickFolder;
      items.push({
        pickable: false,
        label: localize(13400, null),
        description: localize(13401, null),
        onDidOpen: async () => {
          const uri5 = await pickFolder();
          if (uri5) {
            const folders = this._getWorkspaceFolders();
            folders.add(uri5);
            this._setWorkspaceFolders(folders);
          }
        }
      });
    }
    return items;
  }
  reset() {
    this._sessionFolderAllowlist.clear();
    this._gitRootCache.clear();
    if (this._workspaceAllowlist) {
      this._workspaceAllowlist.set([], void 0);
    }
  }
};
export { workspaceAllowlistMemento, ChatExternalPathConfirmationContribution };
