// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/readBrowserTool.ts
import { BrowserChatToolReferenceName } from "./module-2606.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0991.mjs";
import { createBrowserPageLink, errorResult2, getSessionId } from "./module-4176.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { OpenPageToolId } from "./module-4177.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPlaywrightService } from "./module-4035.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/readBrowserTool.ts
var ReadBrowserToolData = {
  id: "read_page",
  toolReferenceName: BrowserChatToolReferenceName.ReadPage,
  displayName: localize(8282, null),
  userDescription: localize(8283, null),
  modelDescription: "Get a snapshot of the current browser page state. This is better than screenshot.",
  icon: Codicon.fileText,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID to read, acquired from context or the open tool.`
      }
    },
    required: ["pageId"]
  }
};

var ReadBrowserTool = class {
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    const link2 = createBrowserPageLink(_context.parameters.pageId);
    return {
      invocationMessage: new MarkdownString(localize(8280, null, link2)),
      pastTenseMessage: new MarkdownString(localize(8281, null, link2))
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    const sessionId = getSessionId(invocation);
    if (!params.pageId) {
      return errorResult2(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    const summary = await this.playwrightService.getSummary(sessionId, params.pageId);
    if (!summary) {
      return errorResult2("No page summary available.");
    }
    return {
      content: [{
        kind: "text",
        value: summary
      }]
    };
  }
};

ReadBrowserTool = __decorateClass([
  __decorateParam(0, IPlaywrightService)
], ReadBrowserTool);
export { ReadBrowserToolData, ReadBrowserTool };
