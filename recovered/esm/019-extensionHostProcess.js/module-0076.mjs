// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/workspace/common/workspace.ts
import { createDecorator2 } from "./module-0048.mjs";
import { URI } from "./module-0025.mjs";
import { TernarySearchTree } from "./module-0071.mjs";
import { basenameOrAuthority, extname2, joinPath } from "./module-0027.mjs";
import { localize } from "./module-0013.mjs";
import { extname } from "./module-0019.mjs";


// src/vs/platform/workspace/common/workspace.ts
var IWorkspaceContextService = createDecorator2("contextService");

function isSingleFolderWorkspaceIdentifier(obj) {
  const singleFolderIdentifier = obj;
  return typeof singleFolderIdentifier?.id === "string" && URI.isUri(singleFolderIdentifier.uri);
}

function isWorkspaceIdentifier(obj) {
  const workspaceIdentifier = obj;
  return typeof workspaceIdentifier?.id === "string" && URI.isUri(workspaceIdentifier.configPath);
}

function isWorkspaceFolder(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && URI.isUri(candidate.uri) && typeof candidate.name === "string" && typeof candidate.toResource === "function");
}

var Workspace = class {
  constructor(_id, folders, _transient, _configuration, ignorePathCasing2, _workspaceName) {
    this._id = _id;
    this._transient = _transient;
    this._configuration = _configuration;
    this.ignorePathCasing = ignorePathCasing2;
    this._workspaceName = _workspaceName;
    this.foldersMap = TernarySearchTree.forUris(this.ignorePathCasing, () => true);
    this.folders = folders;
  }
  get folders() {
    return this._folders;
  }
  set folders(folders) {
    this._folders = folders;
    this.updateFoldersMap();
  }
  update(workspace) {
    this._id = workspace.id;
    this._configuration = workspace.configuration;
    this._transient = workspace.transient;
    this._workspaceName = workspace.name;
    this.ignorePathCasing = workspace.ignorePathCasing;
    this.folders = workspace.folders;
  }
  get id() {
    return this._id;
  }
  get transient() {
    return this._transient;
  }
  get configuration() {
    return this._configuration;
  }
  set configuration(configuration) {
    this._configuration = configuration;
  }
  get name() {
    return this._workspaceName;
  }
  getFolder(resource) {
    if (!resource) {
      return null;
    }
    return this.foldersMap.findSubstr(resource) || null;
  }
  updateFoldersMap() {
    this.foldersMap = TernarySearchTree.forUris(this.ignorePathCasing, () => true);
    for (const folder of this.folders) {
      this.foldersMap.set(folder.uri, folder);
    }
  }
  toJSON() {
    return { id: this.id, folders: this.folders, transient: this.transient, configuration: this.configuration, name: this.name };
  }
};

var WorkspaceFolder = class {
  constructor(data, raw) {
    this.raw = raw;
    this.uri = data.uri;
    this.index = data.index;
    this.name = data.name;
  }
  toResource(relativePath2) {
    return joinPath(this.uri, relativePath2);
  }
  toJSON() {
    return { uri: this.uri, name: this.name, index: this.index };
  }
};

function toWorkspaceFolder(resource) {
  return new WorkspaceFolder({ uri: resource, index: 0, name: basenameOrAuthority(resource) }, { uri: resource.toString() });
}

var WORKSPACE_EXTENSION = "code-workspace";

var WORKSPACE_SUFFIX = `.${WORKSPACE_EXTENSION}`;

var WORKSPACE_FILTER = [{ name: localize(3721, null), extensions: [WORKSPACE_EXTENSION] }];

function hasWorkspaceFileExtension(path) {
  const ext = typeof path === "string" ? extname(path) : extname2(path);
  return ext === WORKSPACE_SUFFIX;
}
export { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, isWorkspaceFolder, toWorkspaceFolder, hasWorkspaceFileExtension, IWorkspaceContextService, Workspace, WorkspaceFolder, WORKSPACE_EXTENSION, WORKSPACE_SUFFIX, WORKSPACE_FILTER };
