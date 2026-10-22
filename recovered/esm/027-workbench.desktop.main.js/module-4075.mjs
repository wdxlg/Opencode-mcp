// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/runPlaywrightCodeTool.ts
import { BrowserChatToolReferenceName } from "./module-2631.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { errorResult2, getSessionId, invokeFunctionResultToToolResult } from "./module-4065.mjs";
import { OpenPageToolId } from "./module-4066.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPlaywrightService } from "./module-3939.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/runPlaywrightCodeTool.ts
var RunPlaywrightCodeToolData = {
  id: "run_playwright_code",
  toolReferenceName: BrowserChatToolReferenceName.RunPlaywrightCode,
  displayName: localize(8290, null),
  userDescription: localize(8291, null),
  modelDescription: `Run a Playwright code snippet to control a browser page. Only use this if other browser tools are insufficient.`,
  icon: Codicon.terminal,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      code: {
        type: "string",
        description: `The Playwright code to execute. The code must be concise, serve one clear purpose, and be self-contained. You **must not** directly access \`document\` or \`window\` using this tool. You must access it via the provided \`page\` object, e.g. "return page.evaluate(() => document.title)". Omit this when resuming a deferred execution via deferredResultId.`
      },
      deferredResultId: {
        type: "string",
        description: `If a previous call returned a deferredResultId, pass it here to continue waiting for that execution to complete.`
      },
      timeoutMs: {
        type: "number",
        description: `Maximum time in milliseconds to wait for the code to complete. Defaults to 5000 (5 seconds).`
      }
    },
    required: ["pageId"],
    $comment: 'Either "code" or "deferredResultId" must be provided.'
  }
};

var RunPlaywrightCodeTool = class {
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(context2, _token) {
    const params = context2.parameters;
    if (params.deferredResultId) {
      return {
        invocationMessage: new MarkdownString(localize(8288, null)),
        pastTenseMessage: new MarkdownString(localize(8289, null))
      };
    }
    const code = params.code ?? "";
    return {
      invocationMessage: new MarkdownString(localize(8286, null)),
      pastTenseMessage: new MarkdownString(localize(8287, null)),
      confirmationMessages: {
        title: localize(8285, null),
        message: new MarkdownString(`\`\`\`javascript
${code.trim()}
\`\`\``),
        disclaimer: localize(8284, null),
        allowAutoConfirm: true
      }
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    const sessionId = getSessionId(invocation);
    if (!params.pageId) {
      return errorResult2(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    if (params.deferredResultId) {
      try {
        const result2 = await this.playwrightService.waitForDeferredResult(sessionId, params.deferredResultId, params.timeoutMs ?? 5e3);
        return invokeFunctionResultToToolResult(result2);
      } catch (e) {
        return errorResult2(e instanceof Error ? e.message : String(e));
      }
    }
    if (!params.code) {
      return errorResult2('Either "code" or "deferredResultId" must be provided.');
    }
    let result;
    try {
      result = await this.playwrightService.invokeFunction(sessionId, params.pageId, `async (page) => { ${params.code} }`, void 0, params.timeoutMs ?? 5e3);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return errorResult2(`Code execution failed: ${message}`);
    }
    return invokeFunctionResultToToolResult(result, params.code.trim());
  }
};

RunPlaywrightCodeTool = __decorateClass([
  __decorateParam(0, IPlaywrightService)
], RunPlaywrightCodeTool);
export { RunPlaywrightCodeToolData, RunPlaywrightCodeTool };
