// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/toolHelpers.ts
import { URI } from "./module-0032.mjs";
import { WorkingDirectory } from "./module-2633.mjs";
import { isAutoApproveLevel } from "./module-0964.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { createToolSimpleTextResult } from "./module-2514.mjs";
import { MarkdownString } from "./module-0462.mjs";


// src/vs/workbench/contrib/chat/browser/tools/toolHelpers.ts
function isSymbolToolResourceInScope(resource, workspaceContextService, uriIdentityService, workingDirectory) {
  const normalizedResource = uriIdentityService.extUri.normalizePath(resource);
  const scopeRoots = workingDirectory ? [workingDirectory] : workspaceContextService.getWorkspace().folders.map((folder) => folder.uri);
  return scopeRoots.some((root) => uriIdentityService.extUri.isEqualOrParent(normalizedResource, uriIdentityService.extUri.normalizePath(root)));
}

function resolveSymbolToolFileUri(input, workspaceContextService, uriIdentityService, workingDirectory) {
  if (input.uri) {
    const uri5 = uriIdentityService.extUri.normalizePath(URI.parse(input.uri));
    return isSymbolToolResourceInScope(uri5, workspaceContextService, uriIdentityService, workingDirectory) ? uri5 : void 0;
  }
  if (input.filePath) {
    const workingDir = new WorkingDirectory(workspaceContextService, workingDirectory);
    const uri5 = workingDir.resolveRelativePath(input.filePath);
    return uri5 && isSymbolToolResourceInScope(uri5, workspaceContextService, uriIdentityService, workingDirectory) ? uri5 : void 0;
  }
  return void 0;
}

function getChatPermissionLevelForToolInvocation(chatSessionResource, chatRequestId, chatWidgetService, chatService) {
  if (!chatSessionResource) {
    return void 0;
  }
  const model = chatService.getSession(chatSessionResource);
  const request2 = chatRequestId ? model?.getRequests().find((request3) => request3.id === chatRequestId) : void 0;
  if (request2) {
    return request2.modeInfo?.permissionLevel ?? "default" /* Default */;
  }
  const widget = chatWidgetService.getWidgetBySessionResource(chatSessionResource);
  if (widget) {
    return widget.input.currentModeInfo.permissionLevel ?? "default" /* Default */;
  }
  return model?.getRequests().at(-1)?.modeInfo?.permissionLevel ?? "default" /* Default */;
}

function getSandboxPrecheckInputsForToolInvocation(chatSessionResource, chatRequestId, chatWidgetService, chatService) {
  const chatPermissionLevel = getChatPermissionLevelForToolInvocation(chatSessionResource, chatRequestId, chatWidgetService, chatService);
  return chatPermissionLevel === void 0 ? void 0 : { isDefaultApprovalPermissionEnabled: !isAutoApproveLevel(chatPermissionLevel) };
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
export { isSymbolToolResourceInScope, resolveSymbolToolFileUri, getChatPermissionLevelForToolInvocation, getSandboxPrecheckInputsForToolInvocation, findLineNumber, findSymbolColumn, errorResult };
