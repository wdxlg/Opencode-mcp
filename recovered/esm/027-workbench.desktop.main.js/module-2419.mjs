// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/chat/notebook.chat.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { CTX_NOTEBOOK_CHAT_HAS_AGENT } from "./module-2417.mjs";
import { Schemas } from "./module-0033.mjs";
import { chatVariableLeader } from "./module-0987.mjs";
import { computeCompletionRanges2 } from "./module-2416.mjs";
import { Range2 } from "./module-0106.mjs";
import { localize } from "./module-0001.mjs";
import { NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_OUTPUT_MIMETYPE, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT } from "./module-1868.mjs";
import { NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST, createNotebookOutputVariableEntry } from "./module-2089.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0941.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { INotebookKernelService } from "./module-1388.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IChatContextPickService } from "./module-1453.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ChatDynamicVariableModel } from "./module-0984.mjs";
import { codiconsLibrary } from "./module-0084.mjs";
import { Codicon } from "./module-0085.mjs";
import { NOTEBOOK_ACTIONS_CATEGORY } from "./module-1869.mjs";
import { copyIcon } from "./module-1870.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { getOutputViewModelFromId } from "./module-1928.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/chat/notebook.chat.contribution.ts
var NotebookKernelVariableKey = "kernelVariable";

var NotebookChatContribution = class extends Disposable {
  constructor(contextKeyService, chatAgentService, editorService, chatWidgetService, notebookKernelService, languageFeaturesService, chatContextPickService) {
    super();
    this.editorService = editorService;
    this.chatWidgetService = chatWidgetService;
    this.notebookKernelService = notebookKernelService;
    this.languageFeaturesService = languageFeaturesService;
    this._register(chatContextPickService.registerChatContextItem(new KernelVariableContextPicker(this.editorService, this.notebookKernelService)));
    this._ctxHasProvider = CTX_NOTEBOOK_CHAT_HAS_AGENT.bindTo(contextKeyService);
    const updateNotebookAgentStatus = () => {
      const hasNotebookAgent = Boolean(chatAgentService.getDefaultAgent("notebook" /* Notebook */));
      this._ctxHasProvider.set(hasNotebookAgent);
    };
    updateNotebookAgentStatus();
    this._register(chatAgentService.onDidChangeAgents(updateNotebookAgentStatus));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatKernelDynamicCompletions",
      triggerCharacters: [chatVariableLeader],
      provideCompletionItems: async (model, position2, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.supportsFileReferences) {
          return null;
        }
        if (widget.location !== "notebook" /* Notebook */) {
          return null;
        }
        const variableNameDef = new RegExp(`${chatVariableLeader}\\w*`, "g");
        const range2 = computeCompletionRanges2(model, position2, variableNameDef, true);
        if (!range2) {
          return null;
        }
        const result = { suggestions: [] };
        const afterRange = new Range2(position2.lineNumber, range2.replace.startColumn, position2.lineNumber, range2.replace.startColumn + `${chatVariableLeader}${NotebookKernelVariableKey}:`.length);
        result.suggestions.push({
          label: `${chatVariableLeader}${NotebookKernelVariableKey}`,
          insertText: `${chatVariableLeader}${NotebookKernelVariableKey}:`,
          detail: localize(17532, null),
          range: range2,
          kind: 18 /* Text */,
          command: { id: SelectAndInsertKernelVariableAction.ID, title: SelectAndInsertKernelVariableAction.ID, arguments: [{ widget, range: afterRange }] },
          sortText: "z"
        });
        await this.addKernelVariableCompletion(widget, result, range2, token);
        return result;
      }
    }));
    NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT.bindTo(contextKeyService).set(NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST);
  }
  static {
    this.ID = "workbench.contrib.notebookChatContribution";
  }
  async addKernelVariableCompletion(widget, result, info, token) {
    let pattern;
    if (info.varWord?.word && info.varWord.word.startsWith(chatVariableLeader)) {
      pattern = info.varWord.word.toLowerCase().slice(1);
    }
    const notebook = getNotebookEditorFromEditorPane(this.editorService.activeEditorPane)?.getViewModel()?.notebookDocument;
    if (!notebook) {
      return;
    }
    const selectedKernel = this.notebookKernelService.getMatchingKernel(notebook).selected;
    const hasVariableProvider = selectedKernel?.hasVariableProvider;
    if (!hasVariableProvider) {
      return;
    }
    const variables = selectedKernel.provideVariables(notebook.uri, void 0, "named", 0, CancellationToken.None);
    for await (const variable of variables) {
      if (pattern && !variable.name.toLowerCase().includes(pattern)) {
        continue;
      }
      result.suggestions.push({
        label: { label: variable.name, description: variable.type },
        insertText: `${chatVariableLeader}${NotebookKernelVariableKey}:${variable.name} `,
        filterText: `${chatVariableLeader}${variable.name}`,
        range: info,
        kind: 4 /* Variable */,
        sortText: "z",
        command: { id: SelectAndInsertKernelVariableAction.ID, title: SelectAndInsertKernelVariableAction.ID, arguments: [{ widget, range: info.insert, variable: variable.name }] },
        detail: variable.type,
        documentation: variable.value
      });
    }
  }
};

NotebookChatContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IChatWidgetService),
  __decorateParam(4, INotebookKernelService),
  __decorateParam(5, ILanguageFeaturesService),
  __decorateParam(6, IChatContextPickService)
], NotebookChatContribution);

var SelectAndInsertKernelVariableAction = class _SelectAndInsertKernelVariableAction extends Action2 {
  constructor() {
    super({
      id: _SelectAndInsertKernelVariableAction.ID,
      title: ""
      // not displayed
    });
  }
  static {
    this.ID = "notebook.chat.selectAndInsertKernelVariable";
  }
  async run(accessor, ...args2) {
    const editorService = accessor.get(IEditorService);
    const notebookKernelService = accessor.get(INotebookKernelService);
    const quickInputService = accessor.get(IQuickInputService);
    const notebook = getNotebookEditorFromEditorPane(editorService.activeEditorPane)?.getViewModel()?.notebookDocument;
    if (!notebook) {
      return;
    }
    const context2 = args2[0];
    if (!context2 || !("widget" in context2) || !("range" in context2)) {
      return;
    }
    const widget = context2.widget;
    const range2 = context2.range;
    const variable = context2.variable;
    if (variable !== void 0) {
      this.addVariableReference(widget, variable, range2, false);
      return;
    }
    const selectedKernel = notebookKernelService.getMatchingKernel(notebook).selected;
    const hasVariableProvider = selectedKernel?.hasVariableProvider;
    if (!hasVariableProvider) {
      return;
    }
    const variables = selectedKernel.provideVariables(notebook.uri, void 0, "named", 0, CancellationToken.None);
    const quickPickItems = [];
    for await (const variable2 of variables) {
      quickPickItems.push({
        label: variable2.name,
        description: variable2.value,
        detail: variable2.type
      });
    }
    const placeHolder = quickPickItems.length > 0 ? localize(17533, null) : localize(17530, null);
    const pickedVariable = await quickInputService.pick(quickPickItems, { placeHolder });
    if (!pickedVariable) {
      return;
    }
    this.addVariableReference(widget, pickedVariable.label, range2, true);
  }
  addVariableReference(widget, variableName, range2, updateText) {
    if (range2) {
      const text2 = `#kernelVariable:${variableName}`;
      if (updateText) {
        const editor = widget.inputEditor;
        const success = editor.executeEdits("chatInsertFile", [{ range: range2, text: text2 + " " }]);
        if (!success) {
          return;
        }
      }
      widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
        id: "vscode.notebook.variable",
        range: { startLineNumber: range2.startLineNumber, startColumn: range2.startColumn, endLineNumber: range2.endLineNumber, endColumn: range2.startColumn + text2.length },
        data: variableName,
        fullName: variableName,
        icon: codiconsLibrary.variable
      });
    } else {
      widget.attachmentModel.addContext({
        id: "vscode.notebook.variable",
        name: variableName,
        value: variableName,
        icon: codiconsLibrary.variable,
        kind: "generic"
      });
    }
  }
};

var KernelVariableContextPicker = class {
  constructor(editorService, notebookKernelService) {
    this.editorService = editorService;
    this.notebookKernelService = notebookKernelService;
    this.type = "pickerPick";
    this.label = localize(17528, null);
    this.icon = Codicon.serverEnvironment;
  }
  isEnabled(widget) {
    return widget.location === "notebook" /* Notebook */ && Boolean(getNotebookEditorFromEditorPane(this.editorService.activeEditorPane)?.getViewModel()?.notebookDocument);
  }
  asPicker() {
    const picks = (async () => {
      const notebook = getNotebookEditorFromEditorPane(this.editorService.activeEditorPane)?.getViewModel()?.notebookDocument;
      if (!notebook) {
        return [];
      }
      const selectedKernel = this.notebookKernelService.getMatchingKernel(notebook).selected;
      const hasVariableProvider = selectedKernel?.hasVariableProvider;
      if (!hasVariableProvider) {
        return [];
      }
      const variables = selectedKernel.provideVariables(notebook.uri, void 0, "named", 0, CancellationToken.None);
      const result = [];
      for await (const variable of variables) {
        result.push({
          label: variable.name,
          description: variable.value,
          asAttachment: () => {
            return {
              kind: "generic",
              id: "vscode.notebook.variable",
              name: variable.name,
              value: variable.value,
              icon: codiconsLibrary.variable
            };
          }
        });
      }
      return result;
    })();
    return {
      placeholder: localize(17529, null),
      picks
    };
  }
};

KernelVariableContextPicker = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, INotebookKernelService)
], KernelVariableContextPicker);

registerAction2(class AddCellOutputToChatAction extends Action2 {
  constructor() {
    super({
      id: "notebook.cellOutput.addToChat",
      title: localize(17531, null),
      menu: {
        id: MenuId.NotebookOutputToolbar,
        when: ContextKeyExpr.and(NOTEBOOK_CELL_HAS_OUTPUTS, ContextKeyExpr.in(NOTEBOOK_CELL_OUTPUT_MIMETYPE.key, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT.key)),
        order: 10,
        group: "notebook_chat_actions"
      },
      category: NOTEBOOK_ACTIONS_CATEGORY,
      icon: copyIcon,
      precondition: ChatContextKeys.enabled
    });
  }
  getNoteboookEditor(editorService, outputContext) {
    if (outputContext && "notebookEditor" in outputContext) {
      return outputContext.notebookEditor;
    }
    return getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  }
  async run(accessor, outputContext) {
    const notebookEditor = this.getNoteboookEditor(accessor.get(IEditorService), outputContext);
    if (!notebookEditor) {
      return;
    }
    let outputViewModel;
    if (outputContext && "outputId" in outputContext && typeof outputContext.outputId === "string") {
      outputViewModel = getOutputViewModelFromId(outputContext.outputId, notebookEditor);
    } else if (outputContext && "outputViewModel" in outputContext) {
      outputViewModel = outputContext.outputViewModel;
    }
    if (!outputViewModel) {
      const activeCell = notebookEditor.getActiveCell();
      if (!activeCell) {
        return;
      }
      if (activeCell.focusedOutputId !== void 0) {
        outputViewModel = activeCell.outputsViewModels.find((output) => {
          return output.model.outputId === activeCell.focusedOutputId;
        });
      } else {
        outputViewModel = activeCell.outputsViewModels.find((output) => output.pickedMimeType?.isTrusted);
      }
    }
    if (!outputViewModel) {
      return;
    }
    const mimeType = outputViewModel.pickedMimeType?.mimeType;
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = await chatWidgetService.revealWidget();
    if (widget && mimeType && NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST.includes(mimeType)) {
      const entry = createNotebookOutputVariableEntry(outputViewModel, mimeType, notebookEditor);
      if (!entry) {
        return;
      }
      widget.attachmentModel.addContext(entry);
      (await chatWidgetService.revealWidget())?.focusInput();
    }
  }
});

registerAction2(SelectAndInsertKernelVariableAction);

registerWorkbenchContribution2(NotebookChatContribution.ID, NotebookChatContribution, WorkbenchPhase.BlockRestore);
export { NotebookKernelVariableKey, NotebookChatContribution, SelectAndInsertKernelVariableAction, KernelVariableContextPicker };
