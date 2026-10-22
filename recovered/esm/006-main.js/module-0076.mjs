// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/workspace/common/workspace.ts
import { URI, init_uri } from "./module-0030.mjs";
import { basename, extname, init_path } from "./module-0008.mjs";
import { extUriBiasedIgnorePathCase, extname2, init_resources, joinPath } from "./module-0032.mjs";
import { __esm } from "./module-0000.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { init_ternarySearchTree } from "./module-0068.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { init_network } from "./module-0031.mjs";


// src/vs/platform/workspace/common/workspace.ts
function isSingleFolderWorkspaceIdentifier(obj) {
  const singleFolderIdentifier = obj;
  return typeof singleFolderIdentifier?.id === "string" && URI.isUri(singleFolderIdentifier.uri);
}

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

function reviveIdentifier(identifier) {
  const singleFolderIdentifierCandidate = identifier;
  if (singleFolderIdentifierCandidate?.uri) {
    return { id: singleFolderIdentifierCandidate.id, uri: URI.revive(singleFolderIdentifierCandidate.uri) };
  }
  const workspaceIdentifierCandidate = identifier;
  if (workspaceIdentifierCandidate?.configPath) {
    return { id: workspaceIdentifierCandidate.id, configPath: URI.revive(workspaceIdentifierCandidate.configPath) };
  }
  if (identifier?.id) {
    return { id: identifier.id };
  }
  return void 0;
}

function isUntitledWorkspace(path4, environmentService) {
  return extUriBiasedIgnorePathCase.isEqualOrParent(path4, environmentService.untitledWorkspacesHome);
}

function hasWorkspaceFileExtension(path4) {
  const ext = typeof path4 === "string" ? extname(path4) : extname2(path4);
  return ext === WORKSPACE_SUFFIX;
}

var IWorkspaceContextService, EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE, UNKNOWN_EMPTY_WINDOW_WORKSPACE, WorkspaceFolder, WORKSPACE_EXTENSION, WORKSPACE_SUFFIX, WORKSPACE_FILTER, UNTITLED_WORKSPACE_NAME;

var init_workspace = __esm({
  "src/vs/platform/workspace/common/workspace.ts"() {
    init_nls();
    init_path();
    init_ternarySearchTree();
    init_resources();
    init_uri();
    init_instantiation();
    init_network();
    IWorkspaceContextService = createDecorator("contextService");
    EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE = { id: "ext-dev" };
    UNKNOWN_EMPTY_WINDOW_WORKSPACE = { id: "empty-window" };
    WorkspaceFolder = class {
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
    WORKSPACE_EXTENSION = "code-workspace";
    WORKSPACE_SUFFIX = `.${WORKSPACE_EXTENSION}`;
    WORKSPACE_FILTER = [{ name: localize(3721, null), extensions: [WORKSPACE_EXTENSION] }];
    UNTITLED_WORKSPACE_NAME = "workspace.json";
  }
});
export { isSingleFolderWorkspaceIdentifier, toWorkspaceIdentifier, isWorkspaceIdentifier, reviveIdentifier, isUntitledWorkspace, hasWorkspaceFileExtension, IWorkspaceContextService, EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE, UNKNOWN_EMPTY_WINDOW_WORKSPACE, WorkspaceFolder, WORKSPACE_EXTENSION, WORKSPACE_SUFFIX, WORKSPACE_FILTER, UNTITLED_WORKSPACE_NAME, init_workspace };
