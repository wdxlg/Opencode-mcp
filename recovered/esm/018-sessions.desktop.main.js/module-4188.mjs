// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/screenshotBrowserTool.ts
import { BrowserChatToolReferenceName } from "./module-2606.mjs";
import { localize } from "./module-0001.mjs";
import { ReadBrowserToolData } from "./module-4185.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0991.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { errorResult2, getSessionId, playwrightInvokeRaw } from "./module-4176.mjs";
import { OpenPageToolId } from "./module-4177.mjs";
import { readImageDimensions } from "./module-4187.mjs";
import { getZoomFactor } from "./module-0018.mjs";
import { isAuxiliaryWindow } from "./module-0002.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";
import { getWindowById } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { IPlaywrightService } from "./module-4035.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/screenshotBrowserTool.ts
var ScreenshotBrowserToolData = {
  id: "screenshot_page",
  toolReferenceName: BrowserChatToolReferenceName.ScreenshotPage,
  displayName: localize(8296, null),
  userDescription: localize(8297, null),
  modelDescription: `Capture a screenshot of the current browser page. You can't perform actions based on the screenshot; use ${ReadBrowserToolData.id} for actions.`,
  icon: Codicon.deviceCamera,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID to capture, acquired from context or the open tool.`
      },
      ref: {
        type: "string",
        description: "Element reference to capture. If omitted, captures the whole viewport."
      },
      selector: {
        type: "string",
        description: 'Playwright selector of an element to capture when "ref" is not available. If omitted, captures the whole viewport.'
      },
      element: {
        type: "string",
        description: 'Human-readable description of the element to capture (e.g., "chart diagram", "product image").'
      },
      scrollIntoViewIfNeeded: {
        type: "boolean",
        description: "Whether to scroll the element into view before capturing. Defaults to false."
      }
    },
    required: ["pageId"]
  }
};

var ScreenshotBrowserTool = class {
  constructor(browserViewWorkbenchService, playwrightService, telemetryService, editorGroupsService) {
    this.browserViewWorkbenchService = browserViewWorkbenchService;
    this.playwrightService = playwrightService;
    this.telemetryService = telemetryService;
    this.editorGroupsService = editorGroupsService;
  }
  async prepareToolInvocation(_context, _token) {
    const params = _context.parameters;
    if (params.element) {
      const element = escapeMarkdownSyntaxTokens(params.element);
      return {
        invocationMessage: new MarkdownString(localize(8293, null, element)),
        pastTenseMessage: new MarkdownString(localize(8295, null, element))
      };
    }
    return {
      invocationMessage: localize(8292, null),
      pastTenseMessage: localize(8294, null)
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
    const browserViewModel = await this.browserViewWorkbenchService.getKnownBrowserViews().get(params.pageId)?.resolve();
    if (!browserViewModel) {
      return errorResult2(`No browser page found with ID ${params.pageId}`);
    }
    const bounds = selector && await playwrightInvokeRaw(this.playwrightService, sessionId, params.pageId, async (page, selector2, scrollIntoViewIfNeeded) => {
      const locator = page.locator(selector2);
      if (scrollIntoViewIfNeeded) {
        await locator.scrollIntoViewIfNeeded();
      }
      return locator.boundingBox();
    }, selector, params.scrollIntoViewIfNeeded) || void 0;
    const screenshot = await browserViewModel.captureScreenshot({ pageRect: bounds });
    const dimensions = readImageDimensions(screenshot);
    const hostWindow = this.findBrowserViewHostWindow(browserViewModel);
    this.telemetryService.publicLog2("integratedBrowser.tools.screenshot.captured", {
      // Screenshot tool options
      screenshotType: bounds ? "element" : "viewport",
      selectorSource: params.ref ? "ref" : params.selector ? "selector" : "none",
      scrollIntoViewIfNeeded: !!params.scrollIntoViewIfNeeded,
      // Image metadata
      imageWidth: dimensions?.width,
      imageHeight: dimensions?.height,
      byteLength: screenshot.byteLength,
      // Conversion factors
      windowZoomFactor: hostWindow && getZoomFactor(hostWindow),
      windowDevicePixelRatio: hostWindow?.devicePixelRatio,
      browserZoomFactor: browserViewModel.zoomFactor,
      // Window metadata
      windowInnerWidth: hostWindow?.innerWidth,
      windowInnerHeight: hostWindow?.innerHeight,
      isInAuxiliaryWindow: hostWindow && isAuxiliaryWindow(hostWindow),
      isBrowserViewVisible: browserViewModel.visible,
      // Screen metadata
      screenWidth: hostWindow?.screen.width,
      screenHeight: hostWindow?.screen.height,
      screenAvailWidth: hostWindow?.screen.availWidth,
      screenAvailHeight: hostWindow?.screen.availHeight
    });
    return {
      content: [
        {
          kind: "data",
          value: {
            mimeType: "image/jpeg",
            data: screenshot
          }
        }
      ]
    };
  }
  findBrowserViewHostWindow(model) {
    for (const group2 of this.editorGroupsService.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
      for (const editor of group2.editors) {
        if (editor instanceof BrowserEditorInput && editor.id === model.id) {
          return getWindowById(group2.windowId, true).window;
        }
      }
    }
    return void 0;
  }
};

ScreenshotBrowserTool = __decorateClass([
  __decorateParam(0, IBrowserViewWorkbenchService),
  __decorateParam(1, IPlaywrightService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IEditorGroupsService)
], ScreenshotBrowserTool);
export { ScreenshotBrowserToolData, ScreenshotBrowserTool };
