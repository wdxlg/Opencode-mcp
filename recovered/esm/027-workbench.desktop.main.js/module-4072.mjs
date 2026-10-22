// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/navigateBrowserTool.ts
import { BrowserChatToolReferenceName } from "./module-2631.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { createBrowserPageLink, errorResult2, getBrowserPageResourceNavigationError, getSessionId, playwrightInvoke, remoteUrlRewriteNotice, rewriteRemoteLocalhostUrl } from "./module-4065.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { URI } from "./module-0032.mjs";
import { OpenPageToolId } from "./module-4066.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPlaywrightService } from "./module-3939.mjs";
import { IAgentNetworkFilterService } from "./module-1241.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { IRemoteExplorerService } from "./module-1414.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/navigateBrowserTool.ts
var NavigateBrowserToolData = {
  id: "navigate_page",
  toolReferenceName: BrowserChatToolReferenceName.NavigatePage,
  displayName: localize(8258, null),
  userDescription: localize(8259, null),
  modelDescription: "Navigate a browser page by URL, history, or reload.",
  icon: Codicon.arrowRight,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID to navigate, acquired from context or the open tool.`
      },
      type: {
        type: "string",
        enum: ["url", "back", "forward", "reload"],
        description: 'Navigation type: "url" to navigate to a URL (default, requires "url" param), "back" or "forward" for history, "reload" to refresh.'
      },
      url: {
        type: "string",
        description: 'The URL to navigate to. Required when type is "url".'
      }
    },
    required: ["pageId"]
  }
};

var NavigateBrowserTool = class {
  constructor(playwrightService, agentNetworkFilterService, browserViewService, remoteExplorerService) {
    this.playwrightService = playwrightService;
    this.agentNetworkFilterService = agentNetworkFilterService;
    this.browserViewService = browserViewService;
    this.remoteExplorerService = remoteExplorerService;
  }
  async prepareToolInvocation(context2, _token) {
    const params = context2.parameters;
    const link2 = createBrowserPageLink(params.pageId);
    switch (params.type) {
      case "reload":
        return {
          invocationMessage: new MarkdownString(localize(8256, null, link2)),
          pastTenseMessage: new MarkdownString(localize(8257, null, link2)),
          icon: Codicon.refresh
        };
      case "back":
        return {
          invocationMessage: new MarkdownString(localize(8248, null, link2)),
          pastTenseMessage: new MarkdownString(localize(8249, null, link2)),
          icon: Codicon.arrowLeft
        };
      case "forward":
        return {
          invocationMessage: new MarkdownString(localize(8250, null, link2)),
          pastTenseMessage: new MarkdownString(localize(8251, null, link2)),
          icon: Codicon.arrowRight
        };
      default: {
        if (!params.url) {
          throw new Error('The "url" parameter is required when type is "url".');
        }
        const parsed = URL.parse(params.url);
        if (!parsed) {
          throw new Error("You must provide a complete, valid URL.");
        }
        const resourceNavigationError = this.getResourceNavigationError(params.pageId, params.url);
        if (resourceNavigationError) {
          throw new Error(resourceNavigationError);
        }
        const uri5 = URI.parse(params.url);
        if (!this.agentNetworkFilterService.isUriAllowed(uri5)) {
          throw new Error(this.agentNetworkFilterService.formatError(uri5));
        }
        return {
          invocationMessage: new MarkdownString(localize(8254, null, parsed.href, link2)),
          pastTenseMessage: new MarkdownString(localize(8255, null, parsed.href, link2)),
          confirmationMessages: {
            title: localize(8253, null),
            message: localize(8252, null, parsed.href),
            allowAutoConfirm: true
          }
        };
      }
    }
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    const sessionId = getSessionId(invocation);
    if (!params.pageId) {
      return errorResult2(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    switch (params.type) {
      case "reload":
        return playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page) => page.reload({ waitUntil: "domcontentloaded" }));
      case "back":
        return playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page) => page.goBack({ waitUntil: "domcontentloaded" }));
      case "forward":
        return playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page) => page.goForward({ waitUntil: "domcontentloaded" }));
      default: {
        const resourceNavigationError = this.getResourceNavigationError(params.pageId, params.url);
        if (resourceNavigationError) {
          return errorResult2(resourceNavigationError);
        }
        const rewrite = rewriteRemoteLocalhostUrl(params.url, this.browserViewService, this.remoteExplorerService);
        const result = await playwrightInvoke(this.playwrightService, sessionId, params.pageId, (page, target) => {
          return page.goto(target, { waitUntil: "domcontentloaded" });
        }, rewrite.url);
        return rewrite.rewritten ? { ...result, content: [remoteUrlRewriteNotice(params.url, rewrite.url), ...result.content] } : result;
      }
    }
  }
  getResourceNavigationError(pageId, target) {
    const editor = this.browserViewService.getKnownBrowserViews().get(pageId);
    return getBrowserPageResourceNavigationError(editor, target);
  }
};

NavigateBrowserTool = __decorateClass([
  __decorateParam(0, IPlaywrightService),
  __decorateParam(1, IAgentNetworkFilterService),
  __decorateParam(2, IBrowserViewWorkbenchService),
  __decorateParam(3, IRemoteExplorerService)
], NavigateBrowserTool);
export { NavigateBrowserToolData, NavigateBrowserTool };
