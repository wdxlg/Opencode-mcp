// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolPostExecuteConfirmationPart.ts
import { AbstractToolConfirmationSubPart } from "./module-2320.mjs";
import { AcceptToolPostConfirmationActionId, SkipToolPostConfirmationActionId } from "./module-2178.mjs";
import { localize } from "./module-0001.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { Separator } from "./module-0082.mjs";
import { $ } from "./module-0075.mjs";
import { ILanguageModelToolsService, stringifyPromptTsxPart } from "./module-0991.mjs";
import { getExtensionForMimeType } from "./module-0136.mjs";
import { ChatResponseResource } from "./module-1193.mjs";
import { ChatToolOutputContentSubPart } from "./module-2300.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILanguageModelToolsConfirmationService } from "./module-1473.mjs";
import { IChatToolRiskAssessmentService } from "./module-2279.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolPostExecuteConfirmationPart.ts
var ChatToolPostExecuteConfirmationPart = class extends AbstractToolConfirmationSubPart {
  constructor(toolInvocation, context2, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, confirmationService, riskAssessmentService) {
    super(toolInvocation, context2, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, riskAssessmentService);
    this.confirmationService = confirmationService;
    this._codeblocks = [];
    const subtitle = toolInvocation.pastTenseMessage || toolInvocation.invocationMessage;
    this.render({
      allowActionId: AcceptToolPostConfirmationActionId,
      skipActionId: SkipToolPostConfirmationActionId,
      allowLabel: localize(12314, null),
      skipLabel: localize(12318, null),
      partType: "chatToolPostConfirmation",
      subtitle: typeof subtitle === "string" ? subtitle : subtitle?.value
    });
  }
  get codeblocks() {
    return this._codeblocks;
  }
  createContentElement() {
    if (this.toolInvocation.kind !== "toolInvocation") {
      throw new Error("post-approval not supported for serialized data");
    }
    const state = this.toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForPostApproval) {
      throw new Error("Tool invocation is not waiting for post-approval");
    }
    return this.createResultsDisplay(this.toolInvocation, state.contentForModel);
  }
  getTitle() {
    return localize(12315, null);
  }
  additionalPrimaryActions() {
    const actions = super.additionalPrimaryActions();
    const state = this.toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForPostApproval) {
      return actions;
    }
    const confirmActions = this.confirmationService.getPostConfirmActions({
      toolId: this.toolInvocation.toolId,
      source: this.toolInvocation.source,
      parameters: state.parameters
    });
    for (const action of confirmActions) {
      if (action.divider) {
        actions.push(new Separator());
      }
      actions.push({
        label: action.label,
        tooltip: action.detail,
        scope: action.scope,
        data: async () => {
          const shouldConfirm = await action.select();
          if (shouldConfirm) {
            this.confirmWith(this.toolInvocation, { type: 4 /* UserAction */ });
          }
        }
      });
    }
    return actions;
  }
  createResultsDisplay(toolInvocation, contentForModel) {
    const container2 = $(".tool-postconfirm-display");
    if (!contentForModel || contentForModel.length === 0) {
      container2.textContent = localize(12317, null);
      return container2;
    }
    const parts = [];
    for (const [i2, part] of contentForModel.entries()) {
      if (part.kind === "text") {
        parts.push({
          kind: "code",
          title: part.title,
          data: part.value,
          languageId: "plaintext",
          codeBlockIndex: i2,
          ownerMarkdownPartId: this.codeblocksPartId,
          options: {
            hideToolbar: true,
            reserveWidth: 19,
            maxHeightInLines: 13,
            verticalPadding: 5,
            editorOptions: { wordWrap: "on", readOnly: true }
          }
        });
      } else if (part.kind === "promptTsx") {
        const stringified = stringifyPromptTsxPart(part);
        parts.push({
          kind: "code",
          data: stringified,
          languageId: "json",
          codeBlockIndex: i2,
          ownerMarkdownPartId: this.codeblocksPartId,
          options: {
            hideToolbar: true,
            reserveWidth: 19,
            maxHeightInLines: 13,
            verticalPadding: 5,
            editorOptions: { wordWrap: "on", readOnly: true }
          }
        });
      } else if (part.kind === "data") {
        const mimeType = part.value.mimeType;
        const data = part.value.data;
        if (mimeType?.startsWith("image/")) {
          const permalinkBasename = getExtensionForMimeType(mimeType) ? `image${getExtensionForMimeType(mimeType)}` : "image.bin";
          const permalinkUri = ChatResponseResource.createUri(this.context.element.sessionResource, toolInvocation.toolCallId, i2, permalinkBasename);
          parts.push({ kind: "data", value: data.buffer, mimeType, uri: permalinkUri, audience: part.audience });
        } else {
          const decoder2 = new TextDecoder("utf-8", { fatal: true });
          try {
            const text2 = decoder2.decode(data.buffer);
            parts.push({
              kind: "code",
              data: text2,
              languageId: "plaintext",
              codeBlockIndex: i2,
              ownerMarkdownPartId: this.codeblocksPartId,
              options: {
                hideToolbar: true,
                reserveWidth: 19,
                maxHeightInLines: 13,
                verticalPadding: 5,
                editorOptions: { wordWrap: "on", readOnly: true }
              }
            });
          } catch {
            const base64 = data.toString();
            parts.push({
              kind: "code",
              data: base64,
              languageId: "plaintext",
              codeBlockIndex: i2,
              ownerMarkdownPartId: this.codeblocksPartId,
              options: {
                hideToolbar: true,
                reserveWidth: 19,
                maxHeightInLines: 13,
                verticalPadding: 5,
                editorOptions: { wordWrap: "on", readOnly: true }
              }
            });
          }
        }
      }
    }
    if (parts.length > 0) {
      const outputSubPart = this._register(this.instantiationService.createInstance(
        ChatToolOutputContentSubPart,
        this.context,
        parts
      ));
      this._codeblocks.push(...outputSubPart.codeblocks);
      outputSubPart.domNode.classList.add("tool-postconfirm-display");
      return outputSubPart.domNode;
    }
    container2.textContent = localize(12316, null);
    return container2;
  }
};

ChatToolPostExecuteConfirmationPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, ILanguageModelToolsService),
  __decorateParam(7, ILanguageModelToolsConfirmationService),
  __decorateParam(8, IChatToolRiskAssessmentService)
], ChatToolPostExecuteConfirmationPart);
export { ChatToolPostExecuteConfirmationPart };
