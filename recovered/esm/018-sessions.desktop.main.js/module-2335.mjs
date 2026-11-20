// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolConfirmationSubPart.ts
import { AbstractToolConfirmationSubPart } from "./module-2320.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { AcceptToolConfirmationActionId, SkipToolConfirmationActionId } from "./module-2178.mjs";
import { localize } from "./module-0001.mjs";
import { Separator } from "./module-0082.mjs";
import { addDisposableGenericMouseDownListener, addDisposableListener, h } from "./module-0075.mjs";
import { isEmptyObject } from "./module-0010.mjs";
import { count } from "./module-0030.mjs";
import { CodeBlockPart } from "./module-2253.mjs";
import { generateUuid } from "./module-0190.mjs";
import { ILanguageModelToolsService, createToolSchemaUri } from "./module-0991.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { toDisposable } from "./module-0012.mjs";
import { ElementSizeObserver } from "./module-0214.mjs";
import { ChatMarkdownContentPart } from "./module-2273.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderFileWidgets } from "./module-2115.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IChatMarkdownAnchorService } from "./module-2113.mjs";
import { ILanguageModelToolsConfirmationService } from "./module-1473.mjs";
import { IChatToolRiskAssessmentService } from "./module-2279.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolConfirmationSubPart.ts
var SHOW_MORE_MESSAGE_HEIGHT_TRIGGER = 100;

var ToolConfirmationSubPart = class extends AbstractToolConfirmationSubPart {
  constructor(toolInvocation, context2, renderer, editorPool, currentWidthDelegate, codeBlockStartIndex, instantiationService, keybindingService, languageService, contextKeyService, chatWidgetService, commandService, markerService, languageModelToolsService, chatMarkdownAnchorService, confirmationService, riskAssessmentService, configurationService) {
    const state = toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation || !state.confirmationMessages?.title) {
      throw new Error("Confirmation messages are missing");
    }
    super(toolInvocation, context2, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, riskAssessmentService);
    this.renderer = renderer;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockStartIndex = codeBlockStartIndex;
    this.languageService = languageService;
    this.commandService = commandService;
    this.markerService = markerService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.confirmationService = confirmationService;
    this.configurationService = configurationService;
    this.markdownParts = [];
    this.render({
      allowActionId: AcceptToolConfirmationActionId,
      skipActionId: SkipToolConfirmationActionId,
      allowLabel: state.confirmationMessages.confirmResults ? localize(12299, null) : localize(12298, null),
      skipLabel: localize(12304, null),
      partType: "chatToolConfirmation",
      subtitle: typeof toolInvocation.originMessage === "string" ? toolInvocation.originMessage : toolInvocation.originMessage?.value
    });
  }
  get codeblocks() {
    return this.markdownParts.flatMap((part) => part.codeblocks);
  }
  additionalPrimaryActions() {
    const actions = super.additionalPrimaryActions();
    const state = this.toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation) {
      return actions;
    }
    if (state.confirmationMessages?.allowAutoConfirm !== false) {
      const approveCombination = state.confirmationMessages?.approveCombination;
      const combination = approveCombination ? {
        label: typeof approveCombination.label === "string" ? approveCombination.label : approveCombination.label.value,
        key: approveCombination.key,
        arguments: approveCombination.arguments
      } : void 0;
      const confirmActions = this.confirmationService.getPreConfirmActions({
        toolId: this.toolInvocation.toolId,
        source: this.toolInvocation.source,
        parameters: state.parameters,
        chatSessionResource: this.context.element.sessionResource,
        combination
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
    }
    if (state.confirmationMessages?.confirmResults) {
      actions.unshift(
        {
          label: localize(12300, null),
          data: () => {
            state.confirmationMessages.confirmResults = void 0;
            this.confirmWith(this.toolInvocation, { type: 4 /* UserAction */ });
          }
        },
        new Separator()
      );
    }
    return actions;
  }
  useAllowOnceAsPrimary() {
    const state = this.toolInvocation.state.get();
    if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation) {
      return !!state.confirmationMessages?.approveCombination;
    }
    return false;
  }
  createContentElement() {
    const state = this.toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation) {
      return "";
    }
    const { message, disclaimer } = state.confirmationMessages;
    const toolInvocation = this.toolInvocation;
    if (typeof message === "string" && !disclaimer) {
      return message;
    } else {
      const codeBlockRenderOptions = {
        hideToolbar: true,
        reserveWidth: 19,
        verticalPadding: 5,
        editorOptions: {
          tabFocusMode: true,
          ariaLabel: this.getTitle()
        }
      };
      const elements = h("div", [
        h(".message@messageContainer", [
          h(".message-wrapper@message"),
          h(".see-more@showMore", [
            h("a", [localize(12303, null)])
          ])
        ]),
        h(".editor@editor"),
        h(".disclaimer@disclaimer")
      ]);
      if (toolInvocation.toolSpecificData?.kind === "input" && toolInvocation.toolSpecificData.rawInput && !isEmptyObject(toolInvocation.toolSpecificData.rawInput)) {
        const titleEl = document.createElement("h3");
        titleEl.textContent = localize(12301, null);
        elements.editor.appendChild(titleEl);
        const inputData = toolInvocation.toolSpecificData;
        const codeBlockRenderOptions2 = {
          hideToolbar: true,
          reserveWidth: 19,
          maxHeightInLines: 13,
          verticalPadding: 5,
          editorOptions: {
            wordWrap: "off",
            readOnly: false,
            ariaLabel: this.getTitle()
          }
        };
        const langId = this.languageService.getLanguageIdByLanguageName("json");
        const rawJsonInput = JSON.stringify(inputData.rawInput ?? {}, null, 1);
        const canSeeMore = count(rawJsonInput, "\n") > 2;
        const initialText = rawJsonInput.replace(/\n */g, " ");
        const key3 = CodeBlockPart.poolKey(this.context.element.id, this.codeBlockStartIndex);
        const editor = this._register(this.editorPool.get(key3));
        editor.object.render({
          codeBlockIndex: this.codeBlockStartIndex,
          element: this.context.element,
          languageId: langId ?? "json",
          text: initialText,
          renderOptions: codeBlockRenderOptions2,
          chatSessionResource: this.context.element.sessionResource
        }, this.currentWidthDelegate());
        const model = editor.object.editor.getModel();
        const markerOwner = generateUuid();
        const schemaUri = createToolSchemaUri(toolInvocation.toolId);
        const validator = new RunOnceScheduler(async () => {
          const newMarker = [];
          const result = await this.commandService.executeCommand("json.validate", schemaUri, model.getValue());
          for (const item of result ?? []) {
            if (item.range && item.message) {
              newMarker.push({
                severity: item.severity === "Error" ? 8 /* Error */ : 4 /* Warning */,
                message: item.message,
                startLineNumber: item.range[0].line + 1,
                startColumn: item.range[0].character + 1,
                endLineNumber: item.range[1].line + 1,
                endColumn: item.range[1].character + 1,
                code: item.code ? String(item.code) : void 0
              });
            }
          }
          this.markerService.changeOne(markerOwner, model.uri, newMarker);
        }, 500);
        validator.schedule();
        this._register(model.onDidChangeContent(() => validator.schedule()));
        this._register(toDisposable(() => this.markerService.remove(markerOwner, [model.uri])));
        this._register(validator);
        this.codeblocks.push({
          codeBlockIndex: this.codeBlockStartIndex,
          codemapperUri: void 0,
          elementId: this.context.element.id,
          focus: () => editor.object.focus(),
          ownerMarkdownPartId: this.codeblocksPartId,
          uri: model.uri,
          chatSessionResource: this.context.element.sessionResource
        });
        this._register(model.onDidChangeContent((e4) => {
          try {
            inputData.rawInput = JSON.parse(model.getValue());
          } catch {
          }
        }));
        elements.editor.append(editor.object.element);
        if (canSeeMore) {
          const seeMore = h("div.see-more", [h("a@link")]);
          seeMore.link.textContent = localize(12302, null);
          this._register(addDisposableGenericMouseDownListener(seeMore.link, () => {
            try {
              const parsed = JSON.parse(model.getValue());
              model.setValue(JSON.stringify(parsed, null, 2));
              editor.object.editor.updateOptions({ tabFocusMode: false });
              editor.object.editor.updateOptions({ wordWrap: "on" });
            } catch {
            }
            seeMore.root.remove();
          }));
          elements.editor.append(seeMore.root);
        }
      }
      const mdPart = this._makeMarkdownPart(elements.message, message, codeBlockRenderOptions);
      const messageSeeMoreObserver = this._register(new ElementSizeObserver(mdPart.domNode, void 0));
      const updateSeeMoreDisplayed = () => {
        const show3 = messageSeeMoreObserver.getHeight() > SHOW_MORE_MESSAGE_HEIGHT_TRIGGER;
        if (elements.messageContainer.classList.contains("can-see-more") !== show3) {
          elements.messageContainer.classList.toggle("can-see-more", show3);
        }
      };
      this._register(addDisposableListener(elements.showMore, "click", () => {
        elements.messageContainer.classList.toggle("can-see-more", false);
        messageSeeMoreObserver.dispose();
      }));
      this._register(messageSeeMoreObserver.onDidChange(updateSeeMoreDisplayed));
      messageSeeMoreObserver.startObserving();
      if (disclaimer) {
        this._makeMarkdownPart(elements.disclaimer, disclaimer, codeBlockRenderOptions);
      } else {
        elements.disclaimer.remove();
      }
      return elements.root;
    }
  }
  getTitle() {
    const state = this.toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation) {
      return "";
    }
    const title = state.confirmationMessages?.title;
    if (!title) {
      return "";
    }
    return typeof title === "string" ? title : title.value;
  }
  _makeMarkdownPart(container2, message, codeBlockRenderOptions) {
    const part = this._register(this.instantiationService.createInstance(
      ChatMarkdownContentPart,
      {
        kind: "markdownContent",
        content: typeof message === "string" ? new MarkdownString().appendMarkdown(message) : message
      },
      this.context,
      this.editorPool,
      false,
      this.codeBlockStartIndex,
      this.renderer,
      void 0,
      this.currentWidthDelegate(),
      { codeBlockRenderOptions }
    ));
    renderFileWidgets(part.domNode, this.instantiationService, this.chatMarkdownAnchorService, this._store, this.openedEditors.fileWidgetOptions);
    container2.append(part.domNode);
    return part;
  }
};

ToolConfirmationSubPart = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IChatWidgetService),
  __decorateParam(11, ICommandService),
  __decorateParam(12, IMarkerService),
  __decorateParam(13, ILanguageModelToolsService),
  __decorateParam(14, IChatMarkdownAnchorService),
  __decorateParam(15, ILanguageModelToolsConfirmationService),
  __decorateParam(16, IChatToolRiskAssessmentService),
  __decorateParam(17, IConfigurationService)
], ToolConfirmationSubPart);
export { SHOW_MORE_MESSAGE_HEIGHT_TRIGGER, ToolConfirmationSubPart };
