// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/dragElementTool.ts
import { BrowserChatToolReferenceName } from "./module-2631.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { DEFAULT_ELEMENT_LABEL, createBrowserPageLink, errorResult2, getSessionId, playwrightInvoke } from "./module-4065.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { OpenPageToolId } from "./module-4066.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPlaywrightService } from "./module-3939.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/dragElementTool.ts
var DragElementToolData = {
  id: "drag_element",
  toolReferenceName: BrowserChatToolReferenceName.DragElement,
  displayName: localize(8236, null),
  userDescription: localize(8237, null),
  modelDescription: "Drag an element over another element in a browser page.",
  icon: Codicon.move,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      fromRef: {
        type: "string",
        description: "Element reference of the element to drag."
      },
      fromSelector: {
        type: "string",
        description: 'Playwright selector of the element to drag when "fromRef" is not available.'
      },
      fromElement: {
        type: "string",
        description: 'Human-readable description of the element to drag (e.g., "file item", "draggable card").'
      },
      toRef: {
        type: "string",
        description: "Element reference of the element to drop onto."
      },
      toSelector: {
        type: "string",
        description: 'Playwright selector of the element to drop onto when "toRef" is not available.'
      },
      toElement: {
        type: "string",
        description: 'Human-readable description of the element to drop onto (e.g., "drop zone", "target folder").'
      }
    },
    required: ["pageId", "fromElement", "toElement"],
    $comment: 'One of "fromRef" or "fromSelector" is required, and one of "toRef" or "toSelector" is required.'
  }
};

var DragElementTool = class {
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    const params = _context.parameters;
    const link2 = createBrowserPageLink(params.pageId);
    const fromElement = escapeMarkdownSyntaxTokens(params.fromElement ?? DEFAULT_ELEMENT_LABEL);
    const toElement = escapeMarkdownSyntaxTokens(params.toElement ?? DEFAULT_ELEMENT_LABEL);
    return {
      invocationMessage: new MarkdownString(localize(8234, null, fromElement, toElement, link2)),
      pastTenseMessage: new MarkdownString(localize(8235, null, fromElement, toElement, link2))
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    const sessionId = getSessionId(invocation);
    if (!params.pageId) {
      return errorResult2(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    let fromSelector = params.fromSelector;
    if (params.fromRef) {
      fromSelector = `aria-ref=${params.fromRef}`;
    }
    if (!fromSelector) {
      return errorResult2('Either a "fromRef" or "fromSelector" parameter is required for the source element.');
    }
    let toSelector = params.toSelector;
    if (params.toRef) {
      toSelector = `aria-ref=${params.toRef}`;
    }
    if (!toSelector) {
      return errorResult2('Either a "toRef" or "toSelector" parameter is required for the target element.');
    }
    return playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page, from, to) => page.dragAndDrop(from, to), fromSelector, toSelector);
  }
};

DragElementTool = __decorateClass([
  __decorateParam(0, IPlaywrightService)
], DragElementTool);
export { DragElementToolData, DragElementTool };
