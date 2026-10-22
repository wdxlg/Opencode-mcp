// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolAuthenticationSubPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { ChatCustomConfirmationWidget } from "./module-2274.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentHostCustomizationService } from "./module-1763.mjs";
import { IChatWidgetService } from "./module-0982.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolAuthenticationSubPart.ts
var ChatToolAuthenticationSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, context2, instantiationService, customizationService, chatWidgetService) {
    super(toolInvocation);
    this.codeblocks = [];
    const state = toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForAuthentication) {
      throw new Error("Tool authentication state is missing");
    }
    const widget = this._register(instantiationService.createInstance(
      ChatCustomConfirmationWidget,
      context2,
      {
        title: localize(12287, null),
        icon: Codicon.mcp,
        subtitle: state.server.name,
        buttons: [
          {
            label: localize(12284, null),
            data: async () => {
              await customizationService.authenticateMcpServer(context2.element.sessionResource, state.server.id);
            }
          },
          {
            label: localize(12285, null),
            data: async () => {
              state.cancel();
            },
            isSecondary: true
          }
        ],
        message: localize(12286, null, state.server.name),
        toolbarData: {
          arg: toolInvocation,
          partType: "chatToolAuthentication",
          partSource: toolInvocation.source.type
        }
      }
    ));
    this._register(widget.onDidClick(async ({ button, isTouchClick }) => {
      await button.data();
      if (!isTouchClick) {
        chatWidgetService.getWidgetBySessionResource(context2.element.sessionResource)?.focusInput();
      }
    }));
    this.domNode = widget.domNode;
  }
};

ChatToolAuthenticationSubPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IAgentHostCustomizationService),
  __decorateParam(4, IChatWidgetService)
], ChatToolAuthenticationSubPart);
export { ChatToolAuthenticationSubPart };
