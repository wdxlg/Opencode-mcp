// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatSandboxPrerequisiteConfirmationSubPart.ts
import { AbstractToolConfirmationSubPart } from "./module-2320.mjs";
import { AcceptToolConfirmationActionId, SkipToolConfirmationActionId } from "./module-2178.mjs";
import { localize } from "./module-0001.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { $ } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { IChatToolRiskAssessmentService } from "./module-2279.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatSandboxPrerequisiteConfirmationSubPart.ts
var ChatSandboxPrerequisiteConfirmationSubPart = class extends AbstractToolConfirmationSubPart {
  constructor(toolInvocation, terminalData, context2, renderer, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, riskAssessmentService) {
    super(toolInvocation, context2, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, riskAssessmentService);
    this.renderer = renderer;
    this.codeblocks = [];
    const hasSandboxRemediations = !!terminalData.sandboxRemediations?.length;
    this.render({
      allowActionId: AcceptToolConfirmationActionId,
      skipActionId: SkipToolConfirmationActionId,
      allowLabel: hasSandboxRemediations ? localize(12231, null) : localize(12230, null),
      skipLabel: localize(12232, null),
      partType: hasSandboxRemediations ? "chatSandboxRemediationConfirmation" : "chatMissingSandboxDepsConfirmation"
    });
  }
  createContentElement() {
    const state = this.toolInvocation.state.get();
    const message = state.type === IChatToolInvocation.StateKind.WaitingForConfirmation ? state.confirmationMessages?.message : void 0;
    const container2 = $(".chat-sandbox-prerequisite-confirmation");
    if (message) {
      const mdMessage = typeof message === "string" ? new MarkdownString(message) : message;
      const rendered = this.renderer.render(mdMessage);
      this._register(rendered);
      container2.appendChild(rendered.element);
    }
    return container2;
  }
  getTitle() {
    const state = this.toolInvocation.state.get();
    if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation && state.confirmationMessages?.title) {
      return typeof state.confirmationMessages.title === "string" ? state.confirmationMessages.title : state.confirmationMessages.title.value;
    }
    return "";
  }
};

ChatSandboxPrerequisiteConfirmationSubPart = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IChatWidgetService),
  __decorateParam(8, ILanguageModelToolsService),
  __decorateParam(9, IChatToolRiskAssessmentService)
], ChatSandboxPrerequisiteConfirmationSubPart);
export { ChatSandboxPrerequisiteConfirmationSubPart };
