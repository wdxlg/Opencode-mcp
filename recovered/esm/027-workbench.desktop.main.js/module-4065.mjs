// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/browserToolHelpers.ts
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { isBrowserViewAssociatedResourceNavigation } from "./module-1237.mjs";
import { BrowserViewUri } from "./module-1488.mjs";
import { BrowserEditorInput } from "./module-1490.mjs";
import { extractLocalHostUriMetaDataForPortMapping } from "./module-1409.mjs";
import { mapHasAddressLocalhostOrAllInterfaces } from "./module-1413.mjs";
import { browserViewUrlMatches } from "./module-1243.mjs";
import { MarkdownString } from "./module-0462.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/browserToolHelpers.ts
var DEFAULT_ELEMENT_LABEL = localize(8220, null);

function getSessionId(invocation) {
  return invocation.context?.sessionResource?.toString() ?? "<default>";
}

function formatBrowserEditorList(editorService, editors, options3) {
  const activeEditor = editorService.activeEditor;
  const visibleEditors = new Set(editorService.visibleEditors);
  const indent = options3?.indent ?? "";
  const filterService = options3?.agentNetworkFilterService;
  return editors.map((editor, index2) => {
    const url = editor.url || "about:blank";
    let blocked = false;
    if (filterService && url !== "about:blank") {
      try {
        blocked = !filterService.isUriAllowed(URI.parse(url));
      } catch {
      }
    }
    const title = blocked ? localize(8219, null) : editor.title || "Untitled";
    const displayUrl = blocked ? "" : ` (${url})`;
    const resourceNavigationHint = editor.associatedResource ? " (resource-backed; navigation is limited to this resource)" : "";
    const hint = editor === activeEditor ? " (active)" : visibleEditors.has(editor) ? " (visible)" : " (not visible)";
    const id2 = options3?.excludeIds ? "" : `[${editor.id}] `;
    const bullet2 = options3?.numbered ?? options3?.excludeIds ? `${index2 + 1}. ` : "- ";
    return `${indent}${bullet2}${id2}${title}${displayUrl}${resourceNavigationHint}${hint}`;
  }).join("\n");
}

function getBrowserPageResourceNavigationError(editor, target) {
  if (!editor?.associatedResource || isBrowserViewAssociatedResourceNavigation(editor.associatedResource, target)) {
    return void 0;
  }
  return "This browser page is associated with a resource and cannot be navigated to a different resource. Only query and fragment changes are allowed. Use a different page or open a new one with the open_browser_page tool.";
}

function getBrowserPagesContext(editorService, browserViewService, agentNetworkFilterService, options3) {
  const views = [...browserViewService.getContextualBrowserViews({ activeSessionId: options3?.activeSessionId }).values()];
  const sharedViews = views.filter((view) => view.model?.sharingState === "shared" /* Shared */);
  const unsharedCount = views.length - sharedViews.length;
  if (sharedViews.length === 0 && unsharedCount === 0) {
    return void 0;
  }
  let value2;
  if (sharedViews.length > 0) {
    value2 = "The following browser pages are currently shared with you and can be interacted with using the browser tools:";
    value2 += "\n" + formatBrowserEditorList(editorService, sharedViews, { agentNetworkFilterService });
  } else {
    value2 = "No browser pages are currently shared with you.";
  }
  if (unsharedCount > 0) {
    value2 += "\n\n";
    value2 += `${unsharedCount} ${unsharedCount === 1 ? "page is" : "pages are"} open but not shared.`;
    value2 += options3?.canPromptUser ? `
Use the 'open_browser_page' tool to open a new page or to help the user share an existing page.` : `
Use the 'open_browser_page' tool to open a new page.`;
  }
  return value2;
}

function createBrowserPageLink(pageId) {
  if (typeof pageId === "string") {
    pageId = BrowserViewUri.forId(pageId);
  }
  return `[${BrowserEditorInput.DEFAULT_LABEL}](${pageId.toString()}?vscodeLinkType=browser)`;
}

async function playwrightInvokeRaw(playwrightService, sessionId, pageId, fn, ...args2) {
  return playwrightService.invokeFunctionRaw(sessionId, pageId, fn.toString(), ...args2);
}

async function playwrightInvoke(playwrightService, sessionId, pageId, fn, ...args2) {
  try {
    const result = await playwrightService.invokeFunction(sessionId, pageId, fn.toString(), args2);
    return invokeFunctionResultToToolResult(result);
  } catch (e) {
    return errorResult2(e instanceof Error ? e.message : String(e));
  }
}

var failedMessage = localize(8218, null);

function invokeFunctionResultToToolResult(result, code) {
  const content2 = [];
  if (result.result !== void 0) {
    content2.push({ kind: "text", value: `Result: ${JSON.stringify(result.result)}` });
  }
  if (result.error) {
    content2.push({ kind: "text", value: result.error });
  }
  if (result.deferredResultId) {
    content2.push({ kind: "text", value: `[deferredResultId=${result.deferredResultId}] The code has not finished executing yet. Call run_playwright_code again with this deferredResultId and the same pageId (no code) to continue waiting.` });
  }
  content2.push({ kind: "text", value: result.summary });
  return {
    content: content2,
    ...result.error !== void 0 ? { toolResultError: result.error || failedMessage, toolResultMessage: failedMessage } : {},
    ...code ? {
      toolResultDetails: {
        input: code,
        inputLanguage: "javascript",
        output: result.result || result.error ? [{ type: "embed", isText: true, value: JSON.stringify(result.result ?? result.error, null, 2) }] : [],
        isError: result.error !== void 0
      }
    } : {}
  };
}

function errorResult2(message) {
  return {
    content: [{ kind: "text", value: message }],
    toolResultError: message,
    toolResultMessage: failedMessage
  };
}

function rewriteRemoteLocalhostUrl(url, browserViewService, remoteExplorerService) {
  if (browserViewService.willUseRemoteProxy()) {
    return { url, rewritten: false };
  }
  let uri5 = URI.parse(url);
  if (uri5.authority) {
    uri5 = uri5.with({ authority: uri5.authority.toLowerCase() });
  }
  const portMapping = extractLocalHostUriMetaDataForPortMapping(uri5);
  if (!portMapping) {
    return { url, rewritten: false };
  }
  const tunnelModel = remoteExplorerService.tunnelModel;
  const forwarded = mapHasAddressLocalhostOrAllInterfaces(tunnelModel.forwarded, portMapping.address, portMapping.port) ?? mapHasAddressLocalhostOrAllInterfaces(tunnelModel.detected, portMapping.address, portMapping.port);
  if (!forwarded?.localUri) {
    return { url, rewritten: false };
  }
  const rewritten = forwarded.localUri.with({ path: uri5.path, query: uri5.query, fragment: uri5.fragment });
  return { url: rewritten.toString(), rewritten: true };
}

function remoteUrlRewriteNotice(originalUrl, rewrittenUrl) {
  return {
    kind: "text",
    value: `Note: \`${originalUrl}\` was rewritten to \`${rewrittenUrl}\` because this is a remote workspace and the remote port is forwarded to a local address.`
  };
}

function findExistingPagesByHost(browserViewService, url, options3) {
  const results = [];
  for (const editor of browserViewService.getContextualBrowserViews({ activeSessionId: options3?.activeSessionId }).values()) {
    if (!(editor instanceof BrowserEditorInput)) {
      continue;
    }
    if (options3?.sharingState && editor.model?.sharingState !== options3.sharingState) {
      continue;
    }
    if (browserViewUrlMatches(editor.url, url, options3?.includeBlank)) {
      results.push(editor);
    }
  }
  return results;
}

async function getExistingPagesResult(editorService, existing, formatOptions) {
  if (existing.length === 0) {
    return void 0;
  }
  const list2 = formatBrowserEditorList(editorService, existing, { indent: "  ", ...formatOptions });
  const links = existing.map((e) => createBrowserPageLink(e.id));
  return {
    content: [{
      kind: "text",
      value: `At least one similar page is already open:
${list2}

Use an existing page or pass \`forceNew: true\` to open a new one.`
    }],
    toolResultMessage: new MarkdownString(localize(8221, null, links.join(", ")))
  };
}
export { getSessionId, formatBrowserEditorList, getBrowserPageResourceNavigationError, getBrowserPagesContext, createBrowserPageLink, playwrightInvokeRaw, playwrightInvoke, invokeFunctionResultToToolResult, errorResult2, rewriteRemoteLocalhostUrl, remoteUrlRewriteNotice, findExistingPagesByHost, getExistingPagesResult, DEFAULT_ELEMENT_LABEL, failedMessage };
