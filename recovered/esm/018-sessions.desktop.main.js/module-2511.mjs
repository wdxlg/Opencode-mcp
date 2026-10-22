// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatCodeblockActions.ts
import { isRequestVM, isResponseVM } from "./module-0979.mjs";
import { Action2, MenuId, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { Disposable, markAsSingleton } from "./module-0012.mjs";
import { ChatCopyActionViewItem } from "./module-2509.mjs";
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { Codicon } from "./module-0085.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IAiEditTelemetryService } from "./module-1218.mjs";
import { IChatService } from "./module-0973.mjs";
import { EditDeltaInfo } from "./module-0377.mjs";
import { isAgentHostSessionResource } from "./module-0961.mjs";
import { CopyAction } from "./module-0556.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { accessibleViewInCodeBlock } from "./module-1369.mjs";
import { ApplyCodeBlockOperation, InsertCodeBlockOperation } from "./module-2510.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from "./module-1150.mjs";
import { IChatCodeBlockContextProviderService, IChatWidgetService } from "./module-0982.mjs";
import { AsyncIterableProducer } from "./module-0036.mjs";
import { reviewEdits } from "./module-2508.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { DefaultChatTextEditor } from "./module-2253.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatCodeblockActions.ts
var shellLangIds = [
  "fish",
  "ps1",
  "pwsh",
  "powershell",
  "sh",
  "shellscript",
  "zsh"
];

function isCodeBlockActionContext(thing) {
  return typeof thing === "object" && thing !== null && "code" in thing && "element" in thing;
}

function isCodeCompareBlockActionContext(thing) {
  return typeof thing === "object" && thing !== null && "element" in thing && "diffEditor" in thing && "toggleDiffViewMode" in thing;
}

function isResponseFiltered(context2) {
  return isResponseVM(context2.element) && context2.element.errorDetails?.responseIsFiltered;
}

var ChatCodeBlockAction = class extends Action2 {
  run(accessor, ...args2) {
    let context2 = args2[0];
    if (!isCodeBlockActionContext(context2)) {
      const codeEditorService = accessor.get(ICodeEditorService);
      const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
      if (!editor) {
        return;
      }
      context2 = getContextFromEditor(editor, accessor);
      if (!isCodeBlockActionContext(context2)) {
        return;
      }
    }
    return this.runWithContext(accessor, context2);
  }
};

var APPLY_IN_EDITOR_ID = "workbench.action.chat.applyInEditor";

var CodeBlockActionRendering = class extends Disposable {
  static {
    this.ID = "chat.codeBlockActionRendering";
  }
  constructor(actionViewItemService, instantiationService, labelService) {
    super();
    const copyCodeBlockActionRendering = this._register(actionViewItemService.register(MenuId.ChatCodeBlock, "workbench.action.chat.copyCodeBlock", (action, options3) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(ChatCopyActionViewItem, action, options3);
    }));
    const disposable = actionViewItemService.register(MenuId.ChatCodeBlock, APPLY_IN_EDITOR_ID, (action, options3) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(class extends MenuEntryActionViewItem {
        getTooltip() {
          const context2 = this._context;
          if (isCodeBlockActionContext(context2) && context2.codemapperUri) {
            const label3 = labelService.getUriLabel(context2.codemapperUri, { relative: true });
            return localize(8585, null, label3);
          }
          return super.getTooltip();
        }
        setActionContext(newContext) {
          super.setActionContext(newContext);
          this.updateTooltip();
        }
      }, action, void 0);
    });
    markAsSingleton(copyCodeBlockActionRendering);
    markAsSingleton(disposable);
  }
};

CodeBlockActionRendering = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILabelService)
], CodeBlockActionRendering);

function registerChatCodeBlockActions() {
  registerAction2(class CopyCodeBlockAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.copyCodeBlock",
        title: localize2(8590, "Copy"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.copy,
        menu: {
          id: MenuId.ChatCodeBlock,
          group: "navigation",
          order: 30
        }
      });
    }
    run(accessor, ...args2) {
      const context2 = args2[0];
      if (!isCodeBlockActionContext(context2) || isResponseFiltered(context2)) {
        return;
      }
      const clipboardService = accessor.get(IClipboardService);
      const aiEditTelemetryService = accessor.get(IAiEditTelemetryService);
      clipboardService.writeText(context2.code);
      if (isResponseVM(context2.element)) {
        const chatService = accessor.get(IChatService);
        const requestId = context2.element.requestId;
        const request2 = context2.element.session.getItems().find((item) => item.id === requestId && isRequestVM(item));
        chatService.notifyUserAction({
          agentId: context2.element.agent?.id,
          command: context2.element.slashCommand?.name,
          sessionResource: context2.element.sessionResource,
          requestId: context2.element.requestId,
          result: context2.element.result,
          action: {
            kind: "copy",
            codeBlockIndex: context2.codeBlockIndex,
            copyKind: 2 /* Toolbar */,
            copiedCharacters: context2.code.length,
            totalCharacters: context2.code.length,
            copiedText: context2.code,
            copiedLines: context2.code.split("\n").length,
            languageId: context2.languageId,
            totalLines: context2.code.split("\n").length,
            modelId: request2?.modelId ?? ""
          }
        });
        const codeBlockInfo = context2.element.model.codeBlockInfos?.at(context2.codeBlockIndex);
        aiEditTelemetryService.handleCodeAccepted({
          acceptanceMethod: "copyButton",
          suggestionId: codeBlockInfo?.suggestionId,
          editDeltaInfo: EditDeltaInfo.fromText(context2.code),
          feature: "sideBarChat",
          languageId: context2.languageId,
          modeId: context2.element.model.request?.modeInfo?.telemetryModeId,
          modelId: request2?.modelId,
          presentation: "codeBlock",
          applyCodeBlockSuggestionId: void 0,
          source: void 0,
          sourceRequestId: void 0,
          isAgentHostSession: isAgentHostSessionResource(context2.element.sessionResource)
        });
      }
    }
  });
  CopyAction?.addImplementation(5e4, "chat-codeblock", (accessor) => {
    const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (!editor) {
      return false;
    }
    const editorModel = editor.getModel();
    if (!editorModel) {
      return false;
    }
    const context2 = getContextFromEditor(editor, accessor);
    if (!context2) {
      return false;
    }
    const noSelection = editor.getSelections()?.length === 1 && editor.getSelection()?.isEmpty();
    const copiedText = noSelection ? editorModel.getValue() : editor.getSelections()?.reduce((acc, selection) => acc + editorModel.getValueInRange(selection), "") ?? "";
    const totalCharacters = editorModel.getValueLength();
    const chatService = accessor.get(IChatService);
    const aiEditTelemetryService = accessor.get(IAiEditTelemetryService);
    const element = context2.element;
    if (isResponseVM(element)) {
      const requestId = element.requestId;
      const request2 = element.session.getItems().find((item) => item.id === requestId && isRequestVM(item));
      chatService.notifyUserAction({
        agentId: element.agent?.id,
        command: element.slashCommand?.name,
        sessionResource: element.sessionResource,
        requestId: element.requestId,
        result: element.result,
        action: {
          kind: "copy",
          codeBlockIndex: context2.codeBlockIndex,
          copyKind: 1 /* Action */,
          copiedText,
          copiedCharacters: copiedText.length,
          totalCharacters,
          languageId: context2.languageId,
          totalLines: context2.code.split("\n").length,
          copiedLines: copiedText.split("\n").length,
          modelId: request2?.modelId ?? ""
        }
      });
      const codeBlockInfo = element.model.codeBlockInfos?.at(context2.codeBlockIndex);
      aiEditTelemetryService.handleCodeAccepted({
        acceptanceMethod: "copyManual",
        suggestionId: codeBlockInfo?.suggestionId,
        editDeltaInfo: EditDeltaInfo.fromText(copiedText),
        feature: "sideBarChat",
        languageId: context2.languageId,
        modeId: element.model.request?.modeInfo?.telemetryModeId,
        modelId: request2?.modelId,
        presentation: "codeBlock",
        applyCodeBlockSuggestionId: void 0,
        source: void 0,
        sourceRequestId: void 0,
        isAgentHostSession: isAgentHostSessionResource(element.sessionResource)
      });
    }
    if (noSelection) {
      accessor.get(IClipboardService).writeText(context2.code);
      return true;
    }
    return false;
  });
  registerAction2(class SmartApplyInEditorAction extends ChatCodeBlockAction {
    constructor() {
      super({
        id: APPLY_IN_EDITOR_ID,
        title: localize2(8584, "Apply in Editor"),
        precondition: ChatContextKeys.enabled,
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.gitPullRequestGoToChanges,
        menu: [
          {
            id: MenuId.ChatCodeBlock,
            group: "navigation",
            when: ContextKeyExpr.and(
              ...shellLangIds.map((e4) => ContextKeyExpr.notEquals(EditorContextKeys.languageId.key, e4))
            ),
            order: 10
          },
          {
            id: MenuId.ChatCodeBlock,
            when: ContextKeyExpr.or(
              ...shellLangIds.map((e4) => ContextKeyExpr.equals(EditorContextKeys.languageId.key, e4))
            )
          }
        ],
        keybinding: {
          when: ContextKeyExpr.or(ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatInput.negate()), accessibleViewInCodeBlock),
          primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
          mac: { primary: 256 /* WinCtrl */ | 3 /* Enter */ },
          weight: 400 /* ExternalExtension */ + 1
        }
      });
    }
    runWithContext(accessor, context2) {
      if (!this.operation) {
        this.operation = accessor.get(IInstantiationService).createInstance(ApplyCodeBlockOperation);
      }
      return this.operation.run(context2);
    }
  });
  registerAction2(class InsertAtCursorAction extends ChatCodeBlockAction {
    constructor() {
      super({
        id: "workbench.action.chat.insertCodeBlock",
        title: localize2(8591, "Insert At Cursor"),
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY,
        icon: Codicon.insert,
        menu: [{
          id: MenuId.ChatCodeBlock,
          group: "navigation",
          when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.location.notEqualsTo("terminal" /* Terminal */)),
          order: 20
        }, {
          id: MenuId.ChatCodeBlock,
          group: "navigation",
          when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.location.isEqualTo("terminal" /* Terminal */)),
          isHiddenByDefault: true,
          order: 20
        }],
        keybinding: {
          when: ContextKeyExpr.or(ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatInput.negate()), accessibleViewInCodeBlock),
          primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
          mac: { primary: 256 /* WinCtrl */ | 3 /* Enter */ },
          weight: 400 /* ExternalExtension */ + 1
        }
      });
    }
    runWithContext(accessor, context2) {
      const operation = accessor.get(IInstantiationService).createInstance(InsertCodeBlockOperation);
      return operation.run(context2);
    }
  });
  registerAction2(class InsertIntoNewFileAction extends ChatCodeBlockAction {
    constructor() {
      super({
        id: "workbench.action.chat.insertIntoNewFile",
        title: localize2(8592, "Insert into New File"),
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY,
        icon: Codicon.newFile,
        menu: {
          id: MenuId.ChatCodeBlock,
          group: "navigation",
          isHiddenByDefault: true,
          order: 40
        }
      });
    }
    async runWithContext(accessor, context2) {
      if (isResponseFiltered(context2)) {
        return;
      }
      const editorService = accessor.get(IEditorService);
      const chatService = accessor.get(IChatService);
      const aiEditTelemetryService = accessor.get(IAiEditTelemetryService);
      editorService.openEditor({ contents: context2.code, languageId: context2.languageId, resource: void 0 });
      if (isResponseVM(context2.element)) {
        const requestId = context2.element.requestId;
        const request2 = context2.element.session.getItems().find((item) => item.id === requestId && isRequestVM(item));
        chatService.notifyUserAction({
          agentId: context2.element.agent?.id,
          command: context2.element.slashCommand?.name,
          sessionResource: context2.element.sessionResource,
          requestId: context2.element.requestId,
          result: context2.element.result,
          action: {
            kind: "insert",
            codeBlockIndex: context2.codeBlockIndex,
            totalCharacters: context2.code.length,
            newFile: true,
            totalLines: context2.code.split("\n").length,
            languageId: context2.languageId,
            modelId: request2?.modelId ?? ""
          }
        });
        const codeBlockInfo = context2.element.model.codeBlockInfos?.at(context2.codeBlockIndex);
        aiEditTelemetryService.handleCodeAccepted({
          acceptanceMethod: "insertInNewFile",
          suggestionId: codeBlockInfo?.suggestionId,
          editDeltaInfo: EditDeltaInfo.fromText(context2.code),
          feature: "sideBarChat",
          languageId: context2.languageId,
          modeId: context2.element.model.request?.modeInfo?.telemetryModeId,
          modelId: request2?.modelId,
          presentation: "codeBlock",
          applyCodeBlockSuggestionId: void 0,
          source: void 0,
          sourceRequestId: void 0,
          isAgentHostSession: isAgentHostSessionResource(context2.element.sessionResource)
        });
      }
    }
  });
  registerAction2(class RunInTerminalAction extends ChatCodeBlockAction {
    constructor() {
      super({
        id: "workbench.action.chat.runInTerminal",
        title: localize2(8595, "Insert into Terminal"),
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY,
        icon: Codicon.terminal,
        menu: [
          {
            id: MenuId.ChatCodeBlock,
            group: "navigation",
            when: ContextKeyExpr.and(
              ChatContextKeys.inChatSession,
              ContextKeyExpr.or(...shellLangIds.map((e4) => ContextKeyExpr.equals(EditorContextKeys.languageId.key, e4)))
            )
          },
          {
            id: MenuId.ChatCodeBlock,
            group: "navigation",
            isHiddenByDefault: true,
            when: ContextKeyExpr.and(
              ChatContextKeys.inChatSession,
              ...shellLangIds.map((e4) => ContextKeyExpr.notEquals(EditorContextKeys.languageId.key, e4))
            )
          }
        ],
        keybinding: [{
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 3 /* Enter */,
          mac: {
            primary: 256 /* WinCtrl */ | 512 /* Alt */ | 3 /* Enter */
          },
          weight: 100 /* EditorContrib */,
          when: ContextKeyExpr.or(ChatContextKeys.inChatSession, accessibleViewInCodeBlock)
        }]
      });
    }
    async runWithContext(accessor, context2) {
      if (isResponseFiltered(context2)) {
        return;
      }
      const chatService = accessor.get(IChatService);
      const terminalService = accessor.get(ITerminalService);
      const editorService = accessor.get(IEditorService);
      const terminalEditorService = accessor.get(ITerminalEditorService);
      const terminalGroupService = accessor.get(ITerminalGroupService);
      let terminal2 = await terminalService.getActiveOrCreateInstance({ acceptsInput: true });
      if (terminal2.xterm?.isStdinDisabled || terminal2.shellLaunchConfig.isFeatureTerminal) {
        terminal2 = await terminalService.createAndFocusTerminal({ location: 1 /* Panel */ });
      } else {
        await terminalService.focusInstance(terminal2);
      }
      if (terminal2.target === 2 /* Editor */) {
        const existingEditors = editorService.findEditors(terminal2.resource);
        terminalEditorService.openEditor(terminal2, { viewColumn: existingEditors?.[0].groupId });
      } else {
        await terminalGroupService.showPanel(true);
      }
      terminal2.runCommand(context2.code, false);
      if (isResponseVM(context2.element)) {
        chatService.notifyUserAction({
          agentId: context2.element.agent?.id,
          command: context2.element.slashCommand?.name,
          sessionResource: context2.element.sessionResource,
          requestId: context2.element.requestId,
          result: context2.element.result,
          action: {
            kind: "runInTerminal",
            codeBlockIndex: context2.codeBlockIndex,
            languageId: context2.languageId
          }
        });
      }
    }
  });
  function navigateCodeBlocks(accessor, reverse) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const editor = codeEditorService.getFocusedCodeEditor();
    const editorUri = editor?.getModel()?.uri;
    const curCodeBlockInfo = editorUri ? widget.getCodeBlockInfoForEditor(editorUri) : void 0;
    const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
    const focusedResponse = isResponseVM(focused) ? focused : void 0;
    const elementId = curCodeBlockInfo?.elementId;
    const element = elementId ? widget.viewModel?.getItems().find((item) => item.id === elementId) : void 0;
    const currentResponse = element ?? (focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => isResponseVM(item)));
    if (!currentResponse || !isResponseVM(currentResponse)) {
      return;
    }
    widget.reveal(currentResponse);
    const responseCodeblocks = widget.getCodeBlockInfosForResponse(currentResponse);
    const focusIdx = curCodeBlockInfo ? (curCodeBlockInfo.codeBlockIndex + (reverse ? -1 : 1) + responseCodeblocks.length) % responseCodeblocks.length : reverse ? responseCodeblocks.length - 1 : 0;
    responseCodeblocks[focusIdx]?.focus();
  }
  registerAction2(class NextCodeBlockAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.nextCodeBlock",
        title: localize2(8593, "Next Code Block"),
        keybinding: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 12 /* PageDown */,
          mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 12 /* PageDown */ },
          weight: 200 /* WorkbenchContrib */,
          when: ChatContextKeys.inChatSession
        },
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args2) {
      navigateCodeBlocks(accessor);
    }
  });
  registerAction2(class PreviousCodeBlockAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.previousCodeBlock",
        title: localize2(8594, "Previous Code Block"),
        keybinding: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 11 /* PageUp */,
          mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 11 /* PageUp */ },
          weight: 200 /* WorkbenchContrib */,
          when: ChatContextKeys.inChatSession
        },
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args2) {
      navigateCodeBlocks(accessor, true);
    }
  });
}

function getContextFromEditor(editor, accessor) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const chatCodeBlockContextProviderService = accessor.get(IChatCodeBlockContextProviderService);
  const model = editor.getModel();
  if (!model) {
    return;
  }
  const widget = chatWidgetService.lastFocusedWidget;
  const codeBlockInfo = widget?.getCodeBlockInfoForEditor(model.uri);
  if (!codeBlockInfo) {
    for (const provider of chatCodeBlockContextProviderService.providers) {
      const context2 = provider.getCodeBlockContext(editor);
      if (context2) {
        return context2;
      }
    }
    return;
  }
  const element = widget?.viewModel?.getItems().find((item) => item.id === codeBlockInfo.elementId);
  return {
    element,
    codeBlockIndex: codeBlockInfo.codeBlockIndex,
    code: editor.getValue(),
    languageId: editor.getModel().getLanguageId(),
    codemapperUri: codeBlockInfo.codemapperUri,
    chatSessionResource: codeBlockInfo.chatSessionResource
  };
}

function registerChatCodeCompareBlockActions() {
  class ChatCompareCodeBlockAction extends Action2 {
    run(accessor, ...args2) {
      const context2 = args2[0];
      if (!isCodeCompareBlockActionContext(context2)) {
        return;
      }
      return this.runWithContext(accessor, context2);
    }
  }
  registerAction2(class ApplyEditsCompareBlockAction extends ChatCompareCodeBlockAction {
    constructor() {
      super({
        id: "workbench.action.chat.applyCompareEdits",
        title: localize2(8586, "Apply Edits"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.gitPullRequestGoToChanges,
        precondition: ContextKeyExpr.and(EditorContextKeys.hasChanges, ChatContextKeys.editApplied.negate(), EditorContextKeys.readOnly.negate()),
        menu: {
          id: MenuId.ChatCompareBlock,
          group: "navigation",
          order: 10,
          when: EditorContextKeys.readOnly.negate()
        }
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async runWithContext(accessor, context2) {
      const instaService = accessor.get(IInstantiationService);
      const editorService = accessor.get(ICodeEditorService);
      const item = context2.edit;
      const response = context2.element;
      if (item.state?.applied) {
        return false;
      }
      if (!response.response.value.includes(item)) {
        return false;
      }
      const firstEdit = item.edits[0]?.[0];
      if (!firstEdit) {
        return false;
      }
      const textEdits = AsyncIterableProducer.fromArray(item.edits);
      const editorToApply = await editorService.openCodeEditor({ resource: item.uri }, null);
      if (editorToApply) {
        editorToApply.revealLineInCenterIfOutsideViewport(firstEdit.range.startLineNumber);
        instaService.invokeFunction(reviewEdits, editorToApply, textEdits, CancellationToken.None, void 0);
        response.setEditApplied(item, 1);
        return true;
      }
      return false;
    }
  });
  registerAction2(class DiscardEditsCompareBlockAction extends ChatCompareCodeBlockAction {
    constructor() {
      super({
        id: "workbench.action.chat.discardCompareEdits",
        title: localize2(8587, "Discard Edits"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.trash,
        precondition: ContextKeyExpr.and(EditorContextKeys.hasChanges, ChatContextKeys.editApplied.negate(), EditorContextKeys.readOnly.negate()),
        menu: {
          id: MenuId.ChatCompareBlock,
          group: "navigation",
          order: 11,
          when: EditorContextKeys.readOnly.negate()
        }
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async runWithContext(accessor, context2) {
      const instaService = accessor.get(IInstantiationService);
      const editor = instaService.createInstance(DefaultChatTextEditor);
      editor.discard(context2.element, context2.edit);
    }
  });
  registerAction2(class ToggleDiffViewModeAction extends ChatCompareCodeBlockAction {
    constructor() {
      super({
        id: "workbench.action.chat.toggleCompareBlockDiffViewMode",
        title: localize2(8589, "Toggle Inline/Side-by-Side Diff"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.diffSingle,
        toggled: {
          condition: EditorContextKeys.diffEditorInlineMode,
          icon: Codicon.diff
        },
        menu: {
          id: MenuId.ChatCompareBlock,
          group: "navigation",
          order: 1
        }
      });
    }
    runWithContext(_accessor, context2) {
      context2.toggleDiffViewMode();
    }
  });
  registerAction2(class OpenCompareBlockInDiffEditor extends ChatCompareCodeBlockAction {
    constructor() {
      super({
        id: "workbench.action.chat.openCompareBlockInDiffEditor",
        title: localize2(8588, "Open in Diff Editor"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.goToFile,
        menu: {
          id: MenuId.ChatCompareBlock,
          group: "navigation",
          order: 2
        }
      });
    }
    async runWithContext(accessor, context2) {
      const editorService = accessor.get(IEditorService);
      const model = context2.diffEditor.getModel();
      if (!model) {
        return;
      }
      await editorService.openEditor({
        original: { resource: model.original.uri },
        modified: { resource: model.modified.uri }
      });
    }
  });
}
export { isCodeBlockActionContext, isCodeCompareBlockActionContext, isResponseFiltered, registerChatCodeBlockActions, getContextFromEditor, registerChatCodeCompareBlockActions, shellLangIds, ChatCodeBlockAction, APPLY_IN_EDITOR_ID, CodeBlockActionRendering };
