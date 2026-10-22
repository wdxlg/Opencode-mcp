// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/typeBrowserTool.ts
import { BrowserChatToolReferenceName } from "./module-2631.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { createBrowserPageLink, errorResult2, getSessionId, playwrightInvoke } from "./module-4065.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { OpenPageToolId } from "./module-4066.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPlaywrightService } from "./module-3939.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/typeBrowserTool.ts
var TypeBrowserToolData = {
  id: "type_in_page",
  toolReferenceName: BrowserChatToolReferenceName.TypeInPage,
  displayName: localize(8310, null),
  userDescription: localize(8311, null),
  modelDescription: "Type text or press keys in a browser page.",
  icon: Codicon.symbolText,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      text: {
        type: "string",
        description: 'The text to type. One of "text" or "key" must be provided.'
      },
      submit: {
        type: "boolean",
        description: 'Whether to press Enter after typing text. Ignored when "key" is provided. Default is false.'
      },
      key: {
        type: "string",
        description: 'A key or key combination to press (e.g., "Enter", "Tab", "Control+c"). One of "text" or "key" must be provided.'
      },
      ref: {
        type: "string",
        description: "Element reference to focus and type into. If omitted, types into the focused element."
      },
      selector: {
        type: "string",
        description: 'Playwright selector of element to focus and type into. Use if "ref" is not available. If omitted, types into the focused element.'
      },
      element: {
        type: "string",
        description: 'Human-readable description of the element to type into (e.g., "search box", "comment field"). Required when "ref" or "selector" is specified.'
      }
    },
    required: ["pageId"]
  }
};

var TypeBrowserTool = class {
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(context2, _token) {
    const params = context2.parameters;
    const link2 = createBrowserPageLink(params.pageId);
    const hasTarget = params.ref || params.selector;
    if (params.key) {
      const key3 = escapeMarkdownSyntaxTokens(params.key);
      if (hasTarget && params.element) {
        const element = escapeMarkdownSyntaxTokens(params.element);
        return {
          invocationMessage: new MarkdownString(localize(8299, null, key3, element, link2)),
          pastTenseMessage: new MarkdownString(localize(8301, null, key3, element, link2))
        };
      }
      return {
        invocationMessage: new MarkdownString(localize(8298, null, key3, link2)),
        pastTenseMessage: new MarkdownString(localize(8300, null, key3, link2))
      };
    }
    if (hasTarget && params.element) {
      const element = escapeMarkdownSyntaxTokens(params.element);
      return {
        invocationMessage: params.submit ? new MarkdownString(localize(8307, null, element, link2)) : new MarkdownString(localize(8303, null, element, link2)),
        pastTenseMessage: params.submit ? new MarkdownString(localize(8309, null, element, link2)) : new MarkdownString(localize(8305, null, element, link2))
      };
    }
    return {
      invocationMessage: params.submit ? new MarkdownString(localize(8306, null, link2)) : new MarkdownString(localize(8302, null, link2)),
      pastTenseMessage: params.submit ? new MarkdownString(localize(8308, null, link2)) : new MarkdownString(localize(8304, null, link2))
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
    if (!params.text && !params.key) {
      return errorResult2('Either a "text" or "key" parameter is required.');
    }
    if (params.key) {
      if (selector) {
        return playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page, sel, key3) => page.locator(sel).press(key3), selector, params.key);
      }
      return playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page, key3) => page.keyboard.press(key3), params.key);
    }
    if (selector) {
      return playwrightInvoke(this.playwrightService, sessionId, params.pageId, async (page, sel, text2, submit) => {
        const locator = page.locator(sel);
        await locator.fill(text2);
        if (submit) {
          await locator.press("Enter");
        }
      }, selector, params.text, params.submit ?? false);
    }
    return playwrightInvoke(this.playwrightService, sessionId, params.pageId, async (page, text2, submit) => {
      await page.keyboard.type(text2);
      if (submit) {
        await page.keyboard.press("Enter");
      }
    }, params.text, params.submit ?? false);
  }
};

TypeBrowserTool = __decorateClass([
  __decorateParam(0, IPlaywrightService)
], TypeBrowserTool);
export { TypeBrowserToolData, TypeBrowserTool };
