// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatElicitationContentPart.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { AcceptElicitationRequestActionId } from "./module-2303.mjs";
import { autorun } from "./module-0052.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ChatConfirmationWidget } from "./module-2299.mjs";
import { MarkdownString, isMarkdownString } from "./module-0462.mjs";
import { createToolRiskBadge } from "./module-2306.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatAccessibilityService } from "./module-0981.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IChatToolRiskAssessmentService } from "./module-2304.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatElicitationContentPart.ts
var ChatElicitationContentPart = class extends Disposable {
  constructor(elicitation, context2, instantiationService, chatAccessibilityService, contextKeyService, keybindingService, languageModelToolsService, riskAssessmentService) {
    super();
    this.elicitation = elicitation;
    this.instantiationService = instantiationService;
    this.chatAccessibilityService = chatAccessibilityService;
    this.contextKeyService = contextKeyService;
    this.keybindingService = keybindingService;
    this.languageModelToolsService = languageModelToolsService;
    this.riskAssessmentService = riskAssessmentService;
    const buttons = [];
    if (elicitation.kind === "elicitation2") {
      const acceptTooltip = this.keybindingService.appendKeybinding(elicitation.acceptButtonLabel, AcceptElicitationRequestActionId);
      buttons.push({
        label: elicitation.acceptButtonLabel,
        tooltip: acceptTooltip,
        data: true,
        moreActions: elicitation.moreActions?.map((action) => ({
          label: action.label,
          data: action,
          run: action.run
        }))
      });
      if (elicitation.rejectButtonLabel && elicitation.reject) {
        buttons.push({ label: elicitation.rejectButtonLabel, data: false, isSecondary: true });
      }
      this._register(autorun((reader) => {
        if (elicitation.isHidden?.read(reader)) {
          this.domNode.remove();
        }
      }));
      const hasElicitationKey = ChatContextKeys.Editing.hasElicitationRequest.bindTo(this.contextKeyService);
      this._register(autorun((reader) => {
        hasElicitationKey.set(elicitation.state.read(reader) === "pending" /* Pending */);
      }));
      this._register(toDisposable(() => hasElicitationKey.reset()));
      this.chatAccessibilityService.acceptElicitation(elicitation);
    }
    const confirmationWidget = this._register(this.instantiationService.createInstance(ChatConfirmationWidget, context2, {
      title: elicitation.title,
      subtitle: elicitation.subtitle,
      buttons,
      message: this.getMessageToRender(elicitation),
      footerBanner: this._createRiskBadge(elicitation),
      toolbarData: { partType: "elicitation", partSource: elicitation.source?.type, arg: elicitation }
    }));
    this._confirmWidget = confirmationWidget;
    confirmationWidget.setShowButtons(elicitation.kind === "elicitation2" && elicitation.state.get() === "pending" /* Pending */);
    this._register(confirmationWidget.onDidClick(async ({ button: e }) => {
      if (elicitation.kind !== "elicitation2") {
        return;
      }
      let result;
      if (typeof e.data === "boolean" && e.data === true) {
        result = e.data;
      } else if (e.data && typeof e.data === "object" && "run" in e.data && "label" in e.data) {
        result = e.data;
      } else {
        result = void 0;
      }
      if (result !== void 0) {
        await elicitation.accept(result);
      } else if (elicitation.reject) {
        await elicitation.reject();
      }
      confirmationWidget.setShowButtons(false);
      confirmationWidget.updateMessage(this.getMessageToRender(elicitation));
    }));
    this.domNode = confirmationWidget.domNode;
    this.domNode.tabIndex = 0;
    const messageToRender = this.getMessageToRender(elicitation);
    this.domNode.ariaLabel = elicitation.title + " " + (typeof messageToRender === "string" ? messageToRender : messageToRender.value || "");
  }
  get codeblocks() {
    return this._confirmWidget.codeblocks;
  }
  get codeblocksPartId() {
    return this._confirmWidget.codeblocksPartId;
  }
  getMessageToRender(elicitation) {
    if (!elicitation.acceptedResult) {
      return elicitation.message;
    }
    const messageMd = isMarkdownString(elicitation.message) ? MarkdownString.lift(elicitation.message) : new MarkdownString(elicitation.message);
    messageMd.appendCodeblock("json", JSON.stringify(elicitation.acceptedResult, null, 2));
    return messageMd;
  }
  _createRiskBadge(elicitation) {
    if (elicitation.kind !== "elicitation2" || !elicitation.riskAssessment) {
      return void 0;
    }
    const { toolId, parameters } = elicitation.riskAssessment;
    return createToolRiskBadge(this._store, this.instantiationService, this.riskAssessmentService, this.languageModelToolsService, toolId, parameters)?.domNode;
  }
  hasSameContent(other) {
    return other === this.elicitation;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatElicitationContentPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IChatAccessibilityService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, ILanguageModelToolsService),
  __decorateParam(7, IChatToolRiskAssessmentService)
], ChatElicitationContentPart);
export { ChatElicitationContentPart };
