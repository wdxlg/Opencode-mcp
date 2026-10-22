// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/openBrowserTool.ts
import { BrowserChatToolReferenceName } from "./module-2631.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { URI } from "./module-0032.mjs";
import { createBrowserPageLink, findExistingPagesByHost, getExistingPagesResult, getSessionId, remoteUrlRewriteNotice, rewriteRemoteLocalhostUrl } from "./module-4065.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { CancellationError } from "./module-0004.mjs";
import { ChatQuestionCarouselData } from "./module-1192.mjs";
import { hasKey } from "./module-0010.mjs";
import { getAgentBrowserViewCreationDefaults } from "./module-1237.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPlaywrightService } from "./module-3939.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { IRemoteExplorerService } from "./module-1414.mjs";
import { IAgentNetworkFilterService } from "./module-1241.mjs";
import { IChatService } from "./module-0972.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/openBrowserTool.ts
var OpenPageToolId = "open_browser_page";

var OPEN_PAGE_READY_TIMEOUT_MS = 5e3;

var OpenBrowserToolData = {
  id: OpenPageToolId,
  toolReferenceName: BrowserChatToolReferenceName.OpenBrowserPage,
  displayName: localize(8273, null),
  userDescription: localize(8274, null),
  modelDescription: `Open a new browser page in the integrated browser at the given URL.
May prompt the user to share a page if there is a similar one already open, unless "forceNew" is true.
Returns a page ID that must be used with other browser tools to interact with the page, as well as an accessibility snapshot of the page.

Important: Prefer to reuse existing pages whenever possible and only call this tool if you do not already have access to a tab you can reuse.`,
  icon: Codicon.openInProduct,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL to open in the browser. Must be an absolute URI with a scheme such as file:, http:, or https:. For local files, use the canonical absolute form, for example file:///path/to/file."
      },
      forceNew: {
        type: "boolean",
        description: "Whether to force opening a new page even if a page with the same host already exists. Default is false."
      }
    },
    $comment: 'If you omit "url", the user will be prompted to share an existing page instead. Use this if there are unshared pages that the user may be interested in sharing with you.'
  }
};

var DECLINE_OPTION_ID = "__decline__";

var OpenBrowserTool = class {
  constructor(playwrightService, editorService, browserViewService, remoteExplorerService, agentNetworkFilterService, chatService, configService, logService) {
    this.playwrightService = playwrightService;
    this.editorService = editorService;
    this.browserViewService = browserViewService;
    this.remoteExplorerService = remoteExplorerService;
    this.agentNetworkFilterService = agentNetworkFilterService;
    this.chatService = chatService;
    this.configService = configService;
    this.logService = logService;
  }
  async prepareToolInvocation(context2, _token) {
    const params = context2.parameters;
    if (!params.url) {
      return {
        invocationMessage: localize(8266, null),
        pastTenseMessage: localize(8267, null)
      };
    }
    const parsed = URL.parse(params.url);
    if (!parsed) {
      throw new Error("You must provide a complete, valid URL.");
    }
    params.url = parsed.href;
    const uri5 = URI.parse(params.url);
    if (!this.agentNetworkFilterService.isUriAllowed(uri5)) {
      throw new Error(this.agentNetworkFilterService.formatError(uri5));
    }
    return {
      invocationMessage: localize(8262, null, parsed.href),
      pastTenseMessage: localize(8265, null, parsed.href),
      confirmationMessages: {
        title: localize(8261, null),
        message: localize(8260, null, parsed.href),
        allowAutoConfirm: true
      }
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const params = invocation.parameters;
    const sessionId = getSessionId(invocation);
    const activeSessionId = invocation.context?.sessionResource.toString();
    if (!params.url) {
      const allPages = [...this.browserViewService.getContextualBrowserViews({ activeSessionId }).values()];
      if (allPages.length === 0) {
        return { content: [{ kind: "text", value: "No browser pages are currently open." }] };
      }
      const shareResult = await this._promptForUnsharedPages(invocation, allPages, params, token);
      if (shareResult) {
        return shareResult;
      } else {
        return { content: [{ kind: "text", value: "The user opted not to share an existing page." }] };
      }
    }
    const rewrite = rewriteRemoteLocalhostUrl(params.url, this.browserViewService, this.remoteExplorerService);
    const rewriteNotice = rewrite.rewritten ? remoteUrlRewriteNotice(params.url, rewrite.url) : void 0;
    params.url = rewrite.url;
    const withNotice = (result) => rewriteNotice ? { ...result, content: [rewriteNotice, ...result.content] } : result;
    if (!params.forceNew) {
      const shared = findExistingPagesByHost(this.browserViewService, params.url, { includeBlank: true, sharingState: "shared" /* Shared */, activeSessionId });
      const alreadyShared = await getExistingPagesResult(this.editorService, shared, { agentNetworkFilterService: this.agentNetworkFilterService });
      if (alreadyShared) {
        return withNotice(alreadyShared);
      }
      const unshared = findExistingPagesByHost(this.browserViewService, params.url, { includeBlank: false, sharingState: "notShared" /* NotShared */, activeSessionId });
      if (unshared.length > 0) {
        const shareResult = await this._promptForUnsharedPages(invocation, unshared, params, token);
        if (shareResult) {
          return withNotice(shareResult);
        }
      }
    }
    return withNotice(await this._openNewPage(sessionId, params.url));
  }
  /**
   * Shows a carousel prompting the user to share one of the given unshared
   * browser pages instead of opening a new page. Returns `undefined` if the
   * prompt should be skipped or the user chose to open a new page.
   */
  async _promptForUnsharedPages(invocation, candidateEditors, params, token) {
    const chatSessionResource = invocation.context?.sessionResource;
    const chatRequestId = invocation.chatRequestId;
    const request2 = this._getRequest(chatSessionResource, chatRequestId);
    if (!request2) {
      return void 0;
    }
    if (request2.modeInfo?.permissionLevel === "autopilot" /* Autopilot */ || this.configService.getValue("chat.autoReply" /* AutoReply */)) {
      return void 0;
    }
    const carousel = this._buildShareCarousel(candidateEditors, params.url, invocation.chatStreamToolCallId ?? invocation.callId);
    this.chatService.appendProgress(request2, carousel);
    const externalAnswerListener = this.chatService.onDidReceiveQuestionCarouselAnswer((event) => {
      if (event.resolveId !== carousel.resolveId || carousel.isUsed) {
        return;
      }
      carousel.dismiss(event.answers);
    });
    let answerResult;
    try {
      answerResult = await raceCancellation(carousel.completion.p, token);
    } catch (error) {
      if (error instanceof CancellationError) {
        carousel.dismiss(void 0);
      }
      throw error;
    } finally {
      externalAnswerListener.dispose();
    }
    if (!answerResult || token.isCancellationRequested) {
      carousel.dismiss(void 0);
      throw new CancellationError();
    }
    const selectedOptionId = this._extractSelectedOption(answerResult.answers);
    if (!selectedOptionId || selectedOptionId === DECLINE_OPTION_ID) {
      return void 0;
    }
    const editor = candidateEditors.find((e) => e.id === selectedOptionId);
    if (!editor) {
      this.logService.warn(`[OpenBrowserTool] Selected option '${selectedOptionId}' not found.`);
      return void 0;
    }
    return this._shareExistingPage(getSessionId(invocation), editor);
  }
  _buildShareCarousel(editors, url, resolveId) {
    const options3 = [];
    for (const editor of editors) {
      const editorTitle = (editor.title || editor.getName()).replaceAll(" - ", "\xA0-\xA0");
      const editorUrl = editor.url || "about:blank";
      const truncatedUrl = editorUrl.length > 40 ? editorUrl.substring(0, 40) + "\u2026" : editorUrl;
      options3.push({
        id: editor.id,
        label: localize(
          8270,
          null,
          editorTitle,
          truncatedUrl
        ),
        value: editor.id
      });
    }
    options3.push({
      id: DECLINE_OPTION_ID,
      label: url ? localize(8263, null, url) : localize(8264, null),
      value: DECLINE_OPTION_ID
    });
    const question = {
      id: `${resolveId}:0`,
      type: "singleSelect",
      title: localize(8272, null),
      message: localize(8271, null),
      options: options3,
      defaultValue: DECLINE_OPTION_ID,
      allowFreeformInput: false
    };
    return new ChatQuestionCarouselData([question], true, resolveId);
  }
  _extractSelectedOption(answers) {
    if (!answers) {
      return void 0;
    }
    for (const answer of Object.values(answers)) {
      if (typeof answer === "string") {
        return answer;
      }
      if (typeof answer === "object" && answer !== null && hasKey(answer, { selectedValue: true })) {
        return answer.selectedValue;
      }
    }
    return void 0;
  }
  async _openNewPage(sessionId, url) {
    const input = await this.browserViewService.createBrowserView({
      ...getAgentBrowserViewCreationDefaults(sessionId),
      initialUrl: url,
      openSource: "cdpCreated"
    }, { preserveFocus: true });
    const summary = await this.playwrightService.waitForPageAndGetSummary(sessionId, input.id, url, OPEN_PAGE_READY_TIMEOUT_MS);
    return this._pageResult(input.id, summary, localize(8268, null, createBrowserPageLink(input.id)));
  }
  async _shareExistingPage(sessionId, editor) {
    const model = await editor.resolve();
    if (model.sharingState !== "shared" /* Shared */) {
      if (!await model.setSharedWithAgent(true)) {
        return { content: [{ kind: "text", value: "The user declined to share the page." }] };
      }
    }
    const summary = await this.playwrightService.getSummary(sessionId, editor.id);
    return this._pageResult(editor.id, summary, localize(8269, null, createBrowserPageLink(editor.id)));
  }
  _pageResult(pageId, summary, resultMessage) {
    return {
      content: [
        { kind: "text", value: `Page ID: ${pageId}

Summary:
` },
        { kind: "text", value: summary }
      ],
      toolResultMessage: new MarkdownString(resultMessage)
    };
  }
  _getRequest(chatSessionResource, chatRequestId) {
    if (!chatSessionResource) {
      return void 0;
    }
    const model = this.chatService.getSession(chatSessionResource);
    if (!model) {
      return void 0;
    }
    if (chatRequestId) {
      const request2 = model.getRequests().find((r2) => r2.id === chatRequestId);
      if (request2) {
        return request2;
      }
    }
    return model.getRequests().at(-1);
  }
};

OpenBrowserTool = __decorateClass([
  __decorateParam(0, IPlaywrightService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IBrowserViewWorkbenchService),
  __decorateParam(3, IRemoteExplorerService),
  __decorateParam(4, IAgentNetworkFilterService),
  __decorateParam(5, IChatService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ILogService)
], OpenBrowserTool);
export { OpenPageToolId, OPEN_PAGE_READY_TIMEOUT_MS, OpenBrowserToolData, DECLINE_OPTION_ID, OpenBrowserTool };
