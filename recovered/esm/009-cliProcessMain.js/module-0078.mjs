// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/workspace/common/workspace.ts
import { createDecorator } from "./module-0030.mjs";
import { URI } from "./module-0024.mjs";
import { localize } from "./module-0013.mjs";


// src/vs/platform/workspace/common/workspace.ts
var IWorkspaceContextService = createDecorator("contextService");

function isSingleFolderWorkspaceIdentifier(obj) {
  const singleFolderIdentifier = obj;
  return typeof singleFolderIdentifier?.id === "string" && URI.isUri(singleFolderIdentifier.uri);
}

function isWorkspaceIdentifier(obj) {
  const workspaceIdentifier = obj;
  return typeof workspaceIdentifier?.id === "string" && URI.isUri(workspaceIdentifier.configPath);
}

var WORKSPACE_EXTENSION = "code-workspace";

var WORKSPACE_SUFFIX = `.${WORKSPACE_EXTENSION}`;

var WORKSPACE_FILTER = [{ name: localize(3721, null), extensions: [WORKSPACE_EXTENSION] }];
export { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, IWorkspaceContextService, WORKSPACE_EXTENSION, WORKSPACE_SUFFIX, WORKSPACE_FILTER };
