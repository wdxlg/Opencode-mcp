// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/openBrowserToolNonAgentic.ts
import { OpenBrowserToolData } from "./module-4177.mjs";
import { localize } from "./module-0001.mjs";
import { createBrowserPageLink, findExistingPagesByHost, getExistingPagesResult } from "./module-4176.mjs";
import { logBrowserOpen } from "./module-1488.mjs";
import { BrowserViewUri } from "./module-1487.mjs";
import { generateUuid } from "./module-0190.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/openBrowserToolNonAgentic.ts
var OpenBrowserToolNonAgenticData = {
  ...OpenBrowserToolData,
  modelDescription: "Open a new browser page in the integrated browser at the given URL.",
  inputSchema: {
    ...OpenBrowserToolData.inputSchema,
    required: ["url"],
    $comment: void 0
  }
};

var OpenBrowserToolNonAgentic = class {
  constructor(telemetryService, editorService, browserViewService) {
    this.telemetryService = telemetryService;
    this.editorService = editorService;
    this.browserViewService = browserViewService;
  }
  async prepareToolInvocation(context2, _token) {
    const params = context2.parameters;
    if (!params.url) {
      throw new Error('The "url" parameter is required.');
    }
    const parsed = URL.parse(params.url);
    if (!parsed) {
      throw new Error("You must provide a complete, valid URL.");
    }
    return {
      invocationMessage: localize(8277, null, parsed.href),
      pastTenseMessage: localize(8278, null, parsed.href),
      confirmationMessages: {
        title: localize(8276, null),
        message: localize(8275, null, parsed.href),
        allowAutoConfirm: true
      }
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    if (!params.forceNew) {
      const existingPages = findExistingPagesByHost(this.browserViewService, params.url, { activeSessionId: invocation.context?.sessionResource.toString() });
      const existingResult = await getExistingPagesResult(this.editorService, existingPages, { excludeIds: true });
      if (existingResult) {
        return existingResult;
      }
    }
    logBrowserOpen(this.telemetryService, "chatTool");
    const browserUri = BrowserViewUri.forId(generateUuid());
    await this.editorService.openEditor({ resource: browserUri, options: { pinned: true, preserveFocus: true, viewState: { url: params.url } } });
    return {
      content: [{
        kind: "text",
        value: `Page opened successfully. Note that you do not have access to the page contents unless the user enables agentic tools via the \`workbench.browser.enableChatTools\` setting.`
      }],
      toolResultMessage: new MarkdownString(localize(8279, null, createBrowserPageLink(browserUri)))
    };
  }
};

OpenBrowserToolNonAgentic = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IBrowserViewWorkbenchService)
], OpenBrowserToolNonAgentic);
export { OpenBrowserToolNonAgenticData, OpenBrowserToolNonAgentic };
