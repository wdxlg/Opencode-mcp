// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/workspace/browser/workspaceContextService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Queue } from "./module-0036.mjs";
import { Workspace, WorkspaceFolder } from "./module-0509.mjs";
import { localize } from "./module-0001.mjs";
import { removeTrailingPathSeparator2 } from "./module-0034.mjs";
import { getWorkspaceIdentifier } from "./module-3880.mjs";


// src/vs/sessions/services/workspace/browser/workspaceContextService.ts
var SessionsWorkspaceContextService = class extends Disposable {
  constructor(workspaceIdentifier, uriIdentityService) {
    super();
    this.uriIdentityService = uriIdentityService;
    this.onDidChangeWorkbenchState = Event2.None;
    this.onDidChangeWorkspaceName = Event2.None;
    this.onDidEnterWorkspace = Event2.None;
    this._onWillChangeWorkspaceFolders = new Emitter();
    this.onWillChangeWorkspaceFolders = this._onWillChangeWorkspaceFolders.event;
    this._onDidChangeWorkspaceFolders = this._register(new Emitter());
    this.onDidChangeWorkspaceFolders = this._onDidChangeWorkspaceFolders.event;
    this._updateFoldersQueue = this._register(new Queue());
    this.workspace = new Workspace(workspaceIdentifier.id, [], false, workspaceIdentifier.configPath, (uri4) => uriIdentityService.extUri.ignorePathCasing(uri4), localize(5641, null));
  }
  getCompleteWorkspace() {
    return Promise.resolve(this.workspace);
  }
  getWorkspace() {
    return this.workspace;
  }
  getWorkbenchState() {
    return 3 /* WORKSPACE */;
  }
  hasWorkspaceData() {
    return true;
  }
  getWorkspaceFolder(resource) {
    return this.workspace.getFolder(resource);
  }
  isInsideWorkspace(resource) {
    return !!this.getWorkspaceFolder(resource);
  }
  isCurrentWorkspace(workspaceIdOrFolder) {
    return false;
  }
  addFolders(foldersToAdd) {
    return this.doUpdateFolders(foldersToAdd, []);
  }
  removeFolders(foldersToRemove) {
    return this.doUpdateFolders([], foldersToRemove);
  }
  async updateFolders(index2, deleteCount, foldersToAddCandidates) {
    const folders = this.workspace.folders;
    let foldersToDelete = [];
    if (typeof deleteCount === "number") {
      foldersToDelete = folders.slice(index2, index2 + deleteCount).map((folder) => folder.uri);
    }
    let foldersToAdd = [];
    if (Array.isArray(foldersToAddCandidates)) {
      foldersToAdd = foldersToAddCandidates.map((folderToAdd) => ({ uri: removeTrailingPathSeparator2(folderToAdd.uri), name: folderToAdd.name }));
    }
    return this.doUpdateFolders(foldersToAdd, foldersToDelete, index2);
  }
  async enterWorkspace(_path) {
  }
  async createAndEnterWorkspace(_folders, _path) {
  }
  async saveAndEnterWorkspace(_path) {
  }
  async copyWorkspaceSettings(_toWorkspace) {
  }
  async pickNewWorkspacePath() {
    return void 0;
  }
  doUpdateFolders(foldersToAdd, foldersToRemove, index2) {
    return this._updateFoldersQueue.queue(() => this._doUpdateFolders(foldersToAdd, foldersToRemove, index2));
  }
  async _doUpdateFolders(foldersToAdd, foldersToRemove, index2) {
    if (foldersToAdd.length === 0 && foldersToRemove.length === 0) {
      return;
    }
    const currentFolders = this.workspace.folders;
    let newFolders = currentFolders.filter(
      (folder) => !foldersToRemove.some((toRemove) => this.uriIdentityService.extUri.isEqual(folder.uri, toRemove))
    );
    const foldersToAddWorkspaceFolders = foldersToAdd.filter((folderToAdd) => !newFolders.some((existing) => this.uriIdentityService.extUri.isEqual(existing.uri, folderToAdd.uri))).map((folderToAdd) => new WorkspaceFolder(
      { uri: folderToAdd.uri, name: folderToAdd.name || this.uriIdentityService.extUri.basenameOrAuthority(folderToAdd.uri), index: 0 },
      { uri: folderToAdd.uri.toString() }
    ));
    if (foldersToAddWorkspaceFolders.length > 0) {
      if (typeof index2 === "number" && index2 >= 0 && index2 < newFolders.length) {
        newFolders = [...newFolders.slice(0, index2), ...foldersToAddWorkspaceFolders, ...newFolders.slice(index2)];
      } else {
        newFolders = [...newFolders, ...foldersToAddWorkspaceFolders];
      }
    }
    newFolders = newFolders.map((f, i2) => new WorkspaceFolder({ uri: f.uri, name: f.name, index: i2 }, f.raw));
    const added = newFolders.filter((folder) => !currentFolders.some((existing) => this.uriIdentityService.extUri.isEqual(existing.uri, folder.uri)));
    const removed = currentFolders.filter((folder) => !newFolders.some((existing) => this.uriIdentityService.extUri.isEqual(existing.uri, folder.uri)));
    const changed = [];
    const changes = { added, removed, changed };
    if (added.length === 0 && removed.length === 0) {
      return;
    }
    const joinPromises = [];
    this._onWillChangeWorkspaceFolders.fire({
      changes,
      fromCache: false,
      join(promise) {
        joinPromises.push(promise);
      }
    });
    await Promise.allSettled(joinPromises);
    const workspaceIdentifier = getWorkspaceIdentifier(this.workspace.configuration);
    const workspace = new Workspace(workspaceIdentifier.id, newFolders, false, workspaceIdentifier.configPath, (uri4) => this.uriIdentityService.extUri.ignorePathCasing(uri4), this.workspace.name);
    this.workspace.update(workspace);
    this._onDidChangeWorkspaceFolders.fire(changes);
  }
};
export { SessionsWorkspaceContextService };
