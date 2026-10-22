// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/hoverElementTool.ts
import { BrowserChatToolReferenceName } from "./module-2631.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { DEFAULT_ELEMENT_LABEL, createBrowserPageLink, errorResult2, getSessionId, playwrightInvoke } from "./module-4065.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { OpenPageToolId } from "./module-4066.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPlaywrightService } from "./module-3939.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/hoverElementTool.ts
var HoverElementToolData = {
  id: "hover_element",
  toolReferenceName: BrowserChatToolReferenceName.HoverElement,
  displayName: localize(8244, null),
  userDescription: localize(8245, null),
  modelDescription: "Hover over an element in a browser page. Provide either a Playwright selector or an element reference.",
  icon: Codicon.cursor,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      ref: {
        type: "string",
        description: "Element reference to hover over."
      },
      selector: {
        type: "string",
        description: 'Playwright selector of the element to hover over when "ref" is not available.'
      },
      element: {
        type: "string",
        description: 'Human-readable description of the element to hover over (e.g., "navigation menu", "tooltip trigger").'
      }
    },
    required: ["pageId", "element"],
    $comment: 'One of "ref" or "selector" is required.'
  }
};

var HoverElementTool = class {
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    const params = _context.parameters;
    const link2 = createBrowserPageLink(params.pageId);
    const element = escapeMarkdownSyntaxTokens(params.element ?? DEFAULT_ELEMENT_LABEL);
    return {
      invocationMessage: new MarkdownString(localize(8242, null, element, link2)),
      pastTenseMessage: new MarkdownString(localize(8243, null, element, link2))
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    const sessionId = getSessionId(invocation);
    if (!params.pageId) {
      return errorResult2(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    let selector = params.selector;
    if (params.ref) {
      selector = `aria-ref=${params.ref}`;
    }
    if (!selector) {
      return errorResult2('Either a "ref" or "selector" parameter is required.');
    }
    return playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page, sel) => page.locator(sel).hover(), selector);
  }
};

HoverElementTool = __decorateClass([
  __decorateParam(0, IPlaywrightService)
], HoverElementTool);
export { HoverElementToolData, HoverElementTool };
