// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/workspace/common/workspace.ts
import { createDecorator } from "./module-0042.mjs";
import { URI } from "./module-0024.mjs";
import { localize } from "./module-0007.mjs";


// src/vs/platform/workspace/common/workspace.ts
var IWorkspaceContextService = createDecorator("contextService");

function isSingleFolderWorkspaceIdentifier(obj) {
  const singleFolderIdentifier = obj;
  return typeof singleFolderIdentifier?.id === "string" && URI.isUri(singleFolderIdentifier.uri);
}

var EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE = { id: "ext-dev" };

function isWorkspaceIdentifier(obj) {
  const workspaceIdentifier = obj;
  return typeof workspaceIdentifier?.id === "string" && URI.isUri(workspaceIdentifier.configPath);
}

var WORKSPACE_EXTENSION = "code-workspace";

var WORKSPACE_SUFFIX = `.${WORKSPACE_EXTENSION}`;

var WORKSPACE_FILTER = [{ name: localize(3721, null), extensions: [WORKSPACE_EXTENSION] }];
export { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, IWorkspaceContextService, EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE, WORKSPACE_EXTENSION, WORKSPACE_SUFFIX, WORKSPACE_FILTER };
