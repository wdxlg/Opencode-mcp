// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/handleDialogBrowserTool.ts
import { BrowserChatToolReferenceName } from "./module-2631.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { createBrowserPageLink, errorResult2, getSessionId } from "./module-4065.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { OpenPageToolId } from "./module-4066.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPlaywrightService } from "./module-3939.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/handleDialogBrowserTool.ts
var HandleDialogBrowserToolData = {
  id: "handle_dialog",
  toolReferenceName: BrowserChatToolReferenceName.HandleDialog,
  displayName: localize(8240, null),
  userDescription: localize(8241, null),
  modelDescription: "Respond to a pending modal (alert, confirm, prompt) or file chooser dialog on a browser page.",
  icon: Codicon.comment,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      acceptModal: {
        type: "boolean",
        description: "Whether to accept (true) or dismiss (false) a modal dialog."
      },
      promptText: {
        type: "string",
        description: "Text to enter into a prompt dialog."
      },
      selectFiles: {
        type: "array",
        items: { type: "string" },
        description: "Absolute paths of files to select, or empty to dismiss. Required for file chooser dialogs."
      }
    },
    required: ["pageId"]
  }
};

var HandleDialogBrowserTool = class {
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    const link2 = createBrowserPageLink(_context.parameters.pageId);
    return {
      invocationMessage: new MarkdownString(localize(8238, null, link2)),
      pastTenseMessage: new MarkdownString(localize(8239, null, link2))
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    const sessionId = getSessionId(invocation);
    if (!params.pageId) {
      return errorResult2(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    if (params.selectFiles !== void 0 && (params.acceptModal !== void 0 || params.promptText !== void 0)) {
      return errorResult2(`Invalid parameters. 'selectFiles' cannot be used with 'acceptModal' or 'promptText'.`);
    }
    if (!Array.isArray(params.selectFiles) && (params.acceptModal === void 0 || params.acceptModal === null)) {
      return errorResult2(`Invalid parameters. Either 'selectFiles' or 'acceptModal' must be provided.`);
    }
    try {
      let result;
      if (params.selectFiles !== void 0) {
        result = await this.playwrightService.replyToFileChooser(sessionId, params.pageId, params.selectFiles);
      } else {
        result = await this.playwrightService.replyToDialog(sessionId, params.pageId, params.acceptModal, params.promptText);
      }
      return { content: [{ kind: "text", value: result.summary }] };
    } catch (e) {
      return errorResult2(e instanceof Error ? e.message : String(e));
    }
  }
};

HandleDialogBrowserTool = __decorateClass([
  __decorateParam(0, IPlaywrightService)
], HandleDialogBrowserTool);
export { HandleDialogBrowserToolData, HandleDialogBrowserTool };
