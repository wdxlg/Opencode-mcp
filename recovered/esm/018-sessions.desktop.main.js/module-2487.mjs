// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/reviewPlanTool.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0991.mjs";
import { Disposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { ChatPlanReviewData } from "./module-1191.mjs";
import { generateUuid } from "./module-0190.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { CancellationError } from "./module-0004.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/reviewPlanTool.ts
var ReviewPlanToolId = "vscode_reviewPlan";

function createReviewPlanToolData() {
  const approvalActionSchema = {
    type: "object",
    properties: {
      label: {
        type: "string",
        description: "Short action label shown in the dropdown button."
      },
      description: {
        type: "string",
        description: "Optional detail shown below the label in the dropdown list."
      },
      default: {
        type: "boolean",
        description: "Whether this action should be selected by default."
      },
      permissionLevel: {
        type: "string",
        enum: ["autopilot"],
        description: 'When set to "autopilot", a confirmation dialog is shown before proceeding.'
      }
    },
    required: ["label"]
  };
  const inputSchema3 = {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: 'Title displayed in the widget header. Defaults to "Plan summary" if omitted.'
      },
      plan: {
        type: "string",
        description: "Optional URI of an editable plan file. An Edit button in the widget header opens it in the editor."
      },
      content: {
        type: "string",
        description: "Markdown content rendered in the body of the widget. May be the plan summary or full plan text."
      },
      actions: {
        type: "array",
        description: "List of approval actions offered in the primary dropdown button. Order is preserved.",
        items: approvalActionSchema,
        minItems: 1
      },
      canProvideFeedback: {
        type: "boolean",
        description: "When true, an additional feedback textarea is shown below the plan content."
      }
    },
    required: ["content", "actions", "canProvideFeedback"]
  };
  return {
    id: ReviewPlanToolId,
    toolReferenceName: "reviewPlan",
    canBeReferencedInPrompt: false,
    icon: ThemeIcon.fromId(Codicon.checklist.id),
    displayName: localize(13441, null),
    userDescription: localize(13442, null),
    modelDescription: "Use this tool to present a plan to the user for review. Provide the plan content as markdown, a list of approval actions (with optional default), and whether the user can provide freeform feedback. Optionally provide a URI to the backing plan file so the user can edit it. The tool returns the chosen action, whether the plan was rejected, and any feedback.",
    source: ToolDataSource.Internal,
    inputSchema: inputSchema3
  };
}

var ReviewPlanToolData = createReviewPlanToolData();

var ReviewPlanTool = class extends Disposable {
  constructor(chatService, logService) {
    super();
    this.chatService = chatService;
    this.logService = logService;
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const parameters = invocation.parameters;
    const { title, plan, content, actions, canProvideFeedback } = parameters;
    if (!actions || actions.length === 0) {
      throw new Error(localize(13440, null));
    }
    const { request: request2 } = this.getRequest(invocation.context?.sessionResource, invocation.chatRequestId);
    if (!request2) {
      this.logService.warn("[ReviewPlanTool] Missing chat context; returning rejected result.");
      return this.toResult({ rejected: true });
    }
    let planUri;
    if (plan) {
      try {
        planUri = URI.parse(plan);
      } catch {
        try {
          planUri = URI.file(plan);
        } catch {
          planUri = void 0;
        }
      }
    }
    const reviewData = new ChatPlanReviewData(
      title ?? localize(13437, null),
      content,
      actions,
      canProvideFeedback,
      planUri?.toJSON(),
      generateUuid()
    );
    this.chatService.appendProgress(request2, reviewData);
    const result = await raceCancellation(reviewData.completion.p, token);
    if (token.isCancellationRequested) {
      reviewData.dismiss();
      throw new CancellationError();
    }
    return this.toResult(result ?? { rejected: true });
  }
  async prepareToolInvocation(context2, _token) {
    const parameters = context2.parameters;
    if (!parameters.actions || parameters.actions.length === 0) {
      throw new Error(localize(13440, null));
    }
    return {
      invocationMessage: new MarkdownString(localize(13438, null)),
      pastTenseMessage: new MarkdownString(localize(13439, null))
    };
  }
  toResult(result) {
    return {
      content: [{ kind: "text", value: JSON.stringify(result) }]
    };
  }
  getRequest(chatSessionResource, chatRequestId) {
    if (!chatSessionResource) {
      return { request: void 0 };
    }
    const model = this.chatService.getSession(chatSessionResource);
    if (!model) {
      return { request: void 0 };
    }
    let request2;
    if (chatRequestId) {
      request2 = model.getRequests().find((r2) => r2.id === chatRequestId);
    }
    if (!request2) {
      request2 = model.getRequests().at(-1);
    }
    return { request: request2 };
  }
};

ReviewPlanTool = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, ILogService)
], ReviewPlanTool);
export { createReviewPlanToolData, ReviewPlanToolId, ReviewPlanToolData, ReviewPlanTool };
