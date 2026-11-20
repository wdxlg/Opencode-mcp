// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/toolHelpers.ts
import { URI } from "./module-0032.mjs";
import { WorkingDirectory } from "./module-2608.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { createToolSimpleTextResult } from "./module-2488.mjs";
import { MarkdownString } from "./module-0462.mjs";


// src/vs/workbench/contrib/chat/browser/tools/toolHelpers.ts
function isSymbolToolResourceInScope(resource, workspaceContextService, uriIdentityService, workingDirectory) {
  const normalizedResource = uriIdentityService.extUri.normalizePath(resource);
  const scopeRoots = workingDirectory ? [workingDirectory] : workspaceContextService.getWorkspace().folders.map((folder) => folder.uri);
  return scopeRoots.some((root) => uriIdentityService.extUri.isEqualOrParent(normalizedResource, uriIdentityService.extUri.normalizePath(root)));
}

function resolveSymbolToolFileUri(input, workspaceContextService, uriIdentityService, workingDirectory) {
  if (input.uri) {
    const uri4 = uriIdentityService.extUri.normalizePath(URI.parse(input.uri));
    return isSymbolToolResourceInScope(uri4, workspaceContextService, uriIdentityService, workingDirectory) ? uri4 : void 0;
  }
  if (input.filePath) {
    const workingDir = new WorkingDirectory(workspaceContextService, workingDirectory);
    const uri4 = workingDir.resolveRelativePath(input.filePath);
    return uri4 && isSymbolToolResourceInScope(uri4, workspaceContextService, uriIdentityService, workingDirectory) ? uri4 : void 0;
  }
  return void 0;
}

function findLineNumber(model, lineContent) {
  const parts = lineContent.trim().split(/\s+/);
  const pattern = parts.map(escapeRegExpCharacters).join("\\s+");
  const matches2 = model.findMatches(pattern, false, true, false, null, false, 1);
  if (matches2.length === 0) {
    return void 0;
  }
  return matches2[0].range.startLineNumber;
}

function findSymbolColumn(lineText, symbol) {
  const pattern = new RegExp(`\\b${escapeRegExpCharacters(symbol)}\\b`);
  const match2 = pattern.exec(lineText);
  if (match2) {
    return match2.index + 1;
  }
  return void 0;
}

function errorResult(message) {
  const result = createToolSimpleTextResult(message);
  result.toolResultMessage = new MarkdownString(message);
  return result;
}
export { isSymbolToolResourceInScope, resolveSymbolToolFileUri, findLineNumber, findSymbolColumn, errorResult };
