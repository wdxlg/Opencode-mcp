// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/listBrowserPagesTool.ts
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { getBrowserPagesContext } from "./module-4065.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { IAgentNetworkFilterService } from "./module-1241.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/listBrowserPagesTool.ts
var ListBrowserPagesToolData = {
  id: "list_browser_pages",
  displayName: localize(8246, null),
  userDescription: localize(8247, null),
  modelDescription: "Lists the browser pages that are currently shared with the agent.",
  source: ToolDataSource.Internal,
  // Note: this tool has no toolReferenceName and cannot be referenced in prompts.
  // It is not intended to be used by models directly since browser pages are supplied as context.
  canBeReferencedInPrompt: false,
  inputSchema: {
    type: "object",
    properties: {}
  }
};

var ListBrowserPagesTool = class {
  constructor(editorService, browserViewService, agentNetworkFilterService) {
    this.editorService = editorService;
    this.browserViewService = browserViewService;
    this.agentNetworkFilterService = agentNetworkFilterService;
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const activeSessionId = invocation.context?.sessionResource.toString();
    const value2 = getBrowserPagesContext(
      this.editorService,
      this.browserViewService,
      this.agentNetworkFilterService,
      {
        activeSessionId,
        canPromptUser: activeSessionId !== void 0
      }
    );
    return {
      content: [{
        kind: "text",
        value: value2 ?? "No browser pages are currently open."
      }]
    };
  }
};

ListBrowserPagesTool = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IBrowserViewWorkbenchService),
  __decorateParam(2, IAgentNetworkFilterService)
], ListBrowserPagesTool);
export { ListBrowserPagesToolData, ListBrowserPagesTool };
