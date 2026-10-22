// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/workspace/common/workspace.ts
import { createDecorator } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";
import { basename, extname } from "./module-0026.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { basenameOrAuthority, extUriBiasedIgnorePathCase, extname2, joinPath } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/platform/workspace/common/workspace.ts
var IWorkspaceContextService = createDecorator("contextService");

function isSingleFolderWorkspaceIdentifier(obj) {
  const singleFolderIdentifier = obj;
  return typeof singleFolderIdentifier?.id === "string" && URI.isUri(singleFolderIdentifier.uri);
}

function isEmptyWorkspaceIdentifier(obj) {
  const emptyWorkspaceIdentifier = obj;
  return typeof emptyWorkspaceIdentifier?.id === "string" && !isSingleFolderWorkspaceIdentifier(obj) && !isWorkspaceIdentifier(obj);
}

var EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE = { id: "ext-dev" };

var UNKNOWN_EMPTY_WINDOW_WORKSPACE = { id: "empty-window" };

function toWorkspaceIdentifier(arg0, isExtensionDevelopment) {
  if (typeof arg0 === "string" || typeof arg0 === "undefined") {
    if (typeof arg0 === "string") {
      return {
        id: basename(arg0)
      };
    }
    if (isExtensionDevelopment) {
      return EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE;
    }
    return UNKNOWN_EMPTY_WINDOW_WORKSPACE;
  }
  const workspace = arg0;
  if (workspace.configuration) {
    return {
      id: workspace.id,
      configPath: workspace.configuration
    };
  }
  if (workspace.folders.length === 1) {
    return {
      id: workspace.id,
      uri: workspace.folders[0].uri
    };
  }
  return {
    id: workspace.id
  };
}

function isWorkspaceIdentifier(obj) {
  const workspaceIdentifier = obj;
  return typeof workspaceIdentifier?.id === "string" && URI.isUri(workspaceIdentifier.configPath);
}

function reviveIdentifier(identifier2) {
  const singleFolderIdentifierCandidate = identifier2;
  if (singleFolderIdentifierCandidate?.uri) {
    return { id: singleFolderIdentifierCandidate.id, uri: URI.revive(singleFolderIdentifierCandidate.uri) };
  }
  const workspaceIdentifierCandidate = identifier2;
  if (workspaceIdentifierCandidate?.configPath) {
    return { id: workspaceIdentifierCandidate.id, configPath: URI.revive(workspaceIdentifierCandidate.configPath) };
  }
  if (identifier2?.id) {
    return { id: identifier2.id };
  }
  return void 0;
}

function isWorkspace(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && typeof candidate.id === "string" && Array.isArray(candidate.folders));
}

function isWorkspaceFolder(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && URI.isUri(candidate.uri) && typeof candidate.name === "string" && typeof candidate.toResource === "function");
}

var Workspace = class {
  constructor(_id, folders, _transient, _configuration, ignorePathCasing, _workspaceName) {
    this._id = _id;
    this._transient = _transient;
    this._configuration = _configuration;
    this.ignorePathCasing = ignorePathCasing;
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
  set configuration(configuration2) {
    this._configuration = configuration2;
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

var UNTITLED_WORKSPACE_NAME = "workspace.json";

function isUntitledWorkspace(path, environmentService) {
  return extUriBiasedIgnorePathCase.isEqualOrParent(path, environmentService.untitledWorkspacesHome);
}

function isTemporaryWorkspace(arg1) {
  let path;
  if (URI.isUri(arg1)) {
    path = arg1;
  } else {
    path = arg1.configuration;
  }
  return path?.scheme === Schemas.tmp;
}

var STANDALONE_EDITOR_WORKSPACE_ID = "4064f6ec-cb38-4ad0-af64-ee6467e63c82";

function isStandaloneEditorWorkspace(workspace) {
  return workspace.id === STANDALONE_EDITOR_WORKSPACE_ID;
}

function isSavedWorkspace(path, environmentService) {
  return !isUntitledWorkspace(path, environmentService) && !isTemporaryWorkspace(path);
}

function hasWorkspaceFileExtension(path) {
  const ext = typeof path === "string" ? extname(path) : extname2(path);
  return ext === WORKSPACE_SUFFIX;
}
export { isSingleFolderWorkspaceIdentifier, isEmptyWorkspaceIdentifier, toWorkspaceIdentifier, isWorkspaceIdentifier, reviveIdentifier, isWorkspace, isWorkspaceFolder, toWorkspaceFolder, isUntitledWorkspace, isTemporaryWorkspace, isStandaloneEditorWorkspace, isSavedWorkspace, hasWorkspaceFileExtension, IWorkspaceContextService, EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE, UNKNOWN_EMPTY_WINDOW_WORKSPACE, Workspace, WorkspaceFolder, WORKSPACE_EXTENSION, WORKSPACE_SUFFIX, WORKSPACE_FILTER, UNTITLED_WORKSPACE_NAME, STANDALONE_EDITOR_WORKSPACE_ID };
