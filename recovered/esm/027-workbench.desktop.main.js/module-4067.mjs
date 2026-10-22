// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/clickBrowserTool.ts
import { BrowserChatToolReferenceName } from "./module-2631.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { DEFAULT_ELEMENT_LABEL, createBrowserPageLink, errorResult2, getSessionId, playwrightInvoke } from "./module-4065.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { OpenPageToolId } from "./module-4066.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPlaywrightService } from "./module-3939.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/clickBrowserTool.ts
var ClickBrowserToolData = {
  id: "click_element",
  toolReferenceName: BrowserChatToolReferenceName.ClickElement,
  displayName: localize(8232, null),
  userDescription: localize(8233, null),
  modelDescription: "Click on an element in a browser page.",
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
        description: "Element reference to click."
      },
      selector: {
        type: "string",
        description: 'Playwright selector of the element to click when "ref" is not available.'
      },
      element: {
        type: "string",
        description: 'Human-readable description of the element to click (e.g., "submit button", "search icon").'
      },
      dblClick: {
        type: "boolean",
        description: "Set to true for double clicks. Default is false."
      },
      button: {
        type: "string",
        enum: ["left", "right", "middle"],
        description: 'Mouse button to click with. Default is "left".'
      }
    },
    required: ["pageId", "element"],
    $comment: 'One of "ref" or "selector" is required.'
  }
};

var ClickBrowserTool = class {
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    const params = _context.parameters;
    const link2 = createBrowserPageLink(params.pageId);
    const element = escapeMarkdownSyntaxTokens(params.element ?? DEFAULT_ELEMENT_LABEL);
    return {
      invocationMessage: params.button === "right" ? new MarkdownString(localize(8226, null, element, link2)) : params.button === "middle" ? new MarkdownString(localize(8225, null, element, link2)) : params.dblClick ? new MarkdownString(localize(8230, null, element, link2)) : new MarkdownString(localize(8224, null, element, link2)),
      pastTenseMessage: params.button === "right" ? new MarkdownString(localize(8229, null, element, link2)) : params.button === "middle" ? new MarkdownString(localize(8228, null, element, link2)) : params.dblClick ? new MarkdownString(localize(8231, null, element, link2)) : new MarkdownString(localize(8227, null, element, link2))
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
    const button = params.button ?? "left";
    if (params.dblClick) {
      return playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page, sel, btn) => page.locator(sel).dblclick({ button: btn }), selector, button);
    }
    return playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page, sel, btn) => page.locator(sel).click({ button: btn }), selector, button);
  }
};

ClickBrowserTool = __decorateClass([
  __decorateParam(0, IPlaywrightService)
], ClickBrowserTool);
export { ClickBrowserToolData, ClickBrowserTool };
