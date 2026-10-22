// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatImplicitContext.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Schemas } from "./module-0033.mjs";
import { autorun } from "./module-0052.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { WebviewInput } from "./module-1117.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { isStringImplicitContextValue } from "./module-0980.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatEditingService } from "./module-1082.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageModelIgnoredFilesService } from "./module-0946.mjs";
import { IChatContextService } from "./module-1453.mjs";
import { isLocation } from "./module-0164.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatImplicitContext.ts
var ChatImplicitContextContribution = class extends Disposable {
  constructor(codeEditorService, editorService, chatWidgetService, chatService, chatEditingService, configurationService, ignoredFilesService, chatContextService) {
    super();
    this.codeEditorService = codeEditorService;
    this.editorService = editorService;
    this.chatWidgetService = chatWidgetService;
    this.chatService = chatService;
    this.chatEditingService = chatEditingService;
    this.configurationService = configurationService;
    this.ignoredFilesService = ignoredFilesService;
    this.chatContextService = chatContextService;
    this._currentCancelTokenSource = this._register(new MutableDisposable());
    this._implicitContextEnablement = this.configurationService.getValue("chat.implicitContext.enabled");
    const activeEditorDisposables = this._register(new DisposableStore());
    this._register(Event2.runAndSubscribe(
      editorService.onDidActiveEditorChange,
      (() => {
        activeEditorDisposables.clear();
        const codeEditor = this.findActiveCodeEditor();
        if (codeEditor) {
          activeEditorDisposables.add(Event2.debounce(
            Event2.any(
              codeEditor.onDidChangeModel,
              codeEditor.onDidChangeModelLanguage,
              codeEditor.onDidChangeCursorSelection,
              codeEditor.onDidScrollChange
            ),
            () => void 0,
            500
          )(() => this.updateImplicitContext()));
        }
        const notebookEditor = this.findActiveNotebookEditor();
        if (notebookEditor) {
          const activeCellDisposables = activeEditorDisposables.add(new DisposableStore());
          activeEditorDisposables.add(notebookEditor.onDidChangeActiveCell(() => {
            activeCellDisposables.clear();
            const codeEditor2 = this.codeEditorService.getActiveCodeEditor();
            if (codeEditor2 && codeEditor2.getModel()?.uri.scheme === Schemas.vscodeNotebookCell) {
              activeCellDisposables.add(Event2.debounce(
                Event2.any(
                  codeEditor2.onDidChangeModel,
                  codeEditor2.onDidChangeCursorSelection,
                  codeEditor2.onDidScrollChange
                ),
                () => void 0,
                500
              )(() => this.updateImplicitContext()));
            }
          }));
          activeEditorDisposables.add(Event2.debounce(
            Event2.any(
              notebookEditor.onDidChangeModel,
              notebookEditor.onDidChangeActiveCell
            ),
            () => void 0,
            500
          )(() => this.updateImplicitContext()));
        }
        const webviewEditor = this.findActiveWebviewEditor();
        if (webviewEditor) {
          activeEditorDisposables.add(Event2.debounce(webviewEditor.input.webview.onMessage, () => void 0, 500)(() => {
            this.updateImplicitContext();
          }));
        }
        this.updateImplicitContext();
      })
    ));
    this._register(autorun((reader) => {
      this.chatEditingService.editingSessionsObs.read(reader);
      this.updateImplicitContext();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.implicitContext.enabled")) {
        this._implicitContextEnablement = this.configurationService.getValue("chat.implicitContext.enabled");
        this.updateImplicitContext();
      }
    }));
    this._register(this.chatService.onDidSubmitRequest(({ chatSessionResource }) => {
      const widget = this.chatWidgetService.getWidgetBySessionResource(chatSessionResource);
      if (!widget?.input.implicitContext) {
        return;
      }
      if (this._implicitContextEnablement[widget.location] === "first" && widget.viewModel?.getItems().length !== 0) {
        widget.input.implicitContext.setValues([]);
      }
    }));
    this._register(this.chatWidgetService.onDidAddWidget(async (widget) => {
      await this.updateImplicitContext(widget);
    }));
  }
  static {
    this.ID = "chat.implicitContext";
  }
  findActiveCodeEditor() {
    const codeEditor = this.codeEditorService.getActiveCodeEditor();
    if (codeEditor) {
      const model = codeEditor.getModel();
      if (model?.uri.scheme === Schemas.vscodeNotebookCell) {
        return void 0;
      }
      if (model && model.uri.scheme !== Schemas.vscodeChatResponseResource) {
        return codeEditor;
      }
    }
    for (const codeOrDiffEditor of this.editorService.getVisibleTextEditorControls(0 /* MOST_RECENTLY_ACTIVE */)) {
      const codeEditor2 = getCodeEditor(codeOrDiffEditor);
      if (!codeEditor2) {
        continue;
      }
      const model = codeEditor2.getModel();
      if (model && model.uri.scheme !== Schemas.vscodeChatResponseResource) {
        return codeEditor2;
      }
    }
    return void 0;
  }
  findActiveWebviewEditor() {
    const activeEditorPane = this.editorService.activeEditorPane;
    if (activeEditorPane?.input instanceof WebviewInput) {
      return activeEditorPane;
    }
    return void 0;
  }
  findActiveBrowserEditor() {
    const activeEditorPane = this.editorService.activeEditorPane;
    if (activeEditorPane?.input instanceof BrowserEditorInput) {
      return activeEditorPane.input;
    }
    return void 0;
  }
  findActiveNotebookEditor() {
    return getNotebookEditorFromEditorPane(this.editorService.activeEditorPane);
  }
  async updateImplicitContext(updateWidget) {
    const cancelTokenSource = this._currentCancelTokenSource.value = new CancellationTokenSource();
    const codeEditor = this.findActiveCodeEditor();
    const model = codeEditor?.getModel();
    const selection = codeEditor?.getSelection();
    const useSuggestedContext = this.configurationService.getValue("chat.implicitContext.suggestedContext");
    let newValue;
    let isSelection = false;
    let languageId;
    let providerContext;
    if (model) {
      languageId = model.getLanguageId();
      if (selection && !selection.isEmpty()) {
        newValue = { uri: model.uri, range: selection };
        isSelection = true;
      } else {
        if (useSuggestedContext) {
          newValue = model.uri;
        } else {
          const visibleRanges = codeEditor?.getVisibleRanges();
          if (visibleRanges && visibleRanges.length > 0) {
            let range2 = visibleRanges[0];
            visibleRanges.slice(1).forEach((r2) => {
              range2 = range2.plusRange(r2);
            });
            newValue = { uri: model.uri, range: range2 };
          } else {
            newValue = model.uri;
          }
        }
      }
      providerContext = await this.chatContextService.contextForResource(model.uri, languageId);
    }
    const notebookEditor = this.findActiveNotebookEditor();
    if (notebookEditor?.isReplHistory) {
      newValue = void 0;
    } else if (notebookEditor) {
      const activeCell = notebookEditor.getActiveCell();
      if (activeCell) {
        const codeEditor2 = this.codeEditorService.getActiveCodeEditor();
        const selection2 = codeEditor2?.getSelection();
        const visibleRanges = codeEditor2?.getVisibleRanges() || [];
        newValue = activeCell.uri;
        const cellModel = codeEditor2?.getModel();
        if (cellModel && isEqual2(cellModel.uri, activeCell.uri)) {
          if (selection2 && !selection2.isEmpty()) {
            newValue = { uri: activeCell.uri, range: selection2 };
            isSelection = true;
          } else if (visibleRanges.length > 0) {
            if (!isEntireCellVisible(cellModel, visibleRanges)) {
              let range2 = visibleRanges[0];
              visibleRanges.slice(1).forEach((r2) => {
                range2 = range2.plusRange(r2);
              });
              newValue = { uri: activeCell.uri, range: range2 };
            }
          }
        }
      } else {
        newValue = notebookEditor.textModel?.uri;
      }
    }
    const webviewEditor = this.findActiveWebviewEditor();
    if (webviewEditor?.input instanceof WebviewInput && webviewEditor.input.resource) {
      const webviewContext = await this.chatContextService.contextForResource(webviewEditor.input.resource, void 0, webviewEditor.input.viewType);
      if (webviewContext) {
        newValue = webviewContext;
      }
    }
    const browser = this.findActiveBrowserEditor();
    if (browser?.isSharingAvailable && useSuggestedContext) {
      newValue = browser.resource;
    }
    const uri4 = newValue instanceof URI ? newValue : isStringImplicitContextValue(newValue) ? void 0 : newValue?.uri;
    if (uri4 && (await this.ignoredFilesService.fileIsIgnored(uri4, cancelTokenSource.token) || uri4.path.endsWith(".copilotmd"))) {
      newValue = void 0;
    }
    if (cancelTokenSource.token.isCancellationRequested) {
      return;
    }
    const widgets2 = updateWidget ? [updateWidget] : [...this.chatWidgetService.getWidgetsByLocations("panel" /* Chat */), ...this.chatWidgetService.getWidgetsByLocations("editor" /* EditorInline */)];
    for (const widget of widgets2) {
      if (!widget.input.implicitContext) {
        continue;
      }
      const setting = this._implicitContextEnablement[widget.location];
      const isFirstInteraction = widget.viewModel?.getItems().length === 0;
      if (setting === "always" || setting === "first" && isFirstInteraction) {
        const hasActiveEditor = !!this.editorService.activeEditor;
        if (newValue !== void 0 || !widget.input.implicitContext.hasValue || !hasActiveEditor) {
          widget.input.implicitContext.setValues([{ value: newValue, isSelection }, { value: providerContext, isSelection: false }]);
        }
      } else {
        widget.input.implicitContext.setValues([]);
      }
    }
  }
};

ChatImplicitContextContribution = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IChatWidgetService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IChatEditingService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ILanguageModelIgnoredFilesService),
  __decorateParam(7, IChatContextService)
], ChatImplicitContextContribution);

function isEntireCellVisible(cellModel, visibleRanges) {
  if (visibleRanges.length === 1 && visibleRanges[0].startLineNumber === 1 && visibleRanges[0].startColumn === 1 && visibleRanges[0].endLineNumber === cellModel.getLineCount() && visibleRanges[0].endColumn === cellModel.getLineMaxColumn(visibleRanges[0].endLineNumber)) {
    return true;
  }
  return false;
}

var ChatImplicitContexts = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeValue = this._register(new Emitter());
    this.onDidChangeValue = this._onDidChangeValue.event;
    this._values = this._register(new DisposableMap());
    this._valuesDisposables = this._register(new DisposableStore());
    this._enabled = false;
  }
  setValues(values) {
    this._valuesDisposables.clear();
    this._values.clearAndDisposeAll();
    if (!values || values.length === 0) {
      this._onDidChangeValue.fire();
      return;
    }
    const definedValues = values.filter((value2) => value2.value !== void 0);
    for (const value2 of definedValues) {
      const implicitContext = new ChatImplicitContext();
      implicitContext.setValue(value2.value, value2.isSelection);
      implicitContext.enabled = this._enabled;
      const disposableStore = new DisposableStore();
      disposableStore.add(implicitContext.onDidChangeValue(() => {
        this._onDidChangeValue.fire();
      }));
      disposableStore.add(implicitContext);
      this._values.set(implicitContext, disposableStore);
    }
    this._onDidChangeValue.fire();
  }
  get values() {
    return Array.from(this._values.keys());
  }
  get hasEnabled() {
    return Array.from(this._values.keys()).some((v2) => v2.enabled);
  }
  setEnabled(enabled) {
    this._enabled = enabled;
    this.values.forEach((v2) => v2.enabled = enabled);
  }
  get hasValue() {
    return this.values.some((v2) => v2.value !== void 0);
  }
  get hasNonUri() {
    return this.values.some((v2) => v2.value !== void 0 && !URI.isUri(v2.value));
  }
  getLocations() {
    return this.values.filter((v2) => isLocation(v2.value)).map((v2) => v2.value);
  }
  getUris() {
    return this.values.filter((v2) => URI.isUri(v2.value)).map((v2) => v2.value);
  }
  get hasNonStringContext() {
    return this.values.some((v2) => v2.value !== void 0 && !isStringImplicitContextValue(v2.value));
  }
  enabledBaseEntries(includeAllLocations) {
    return this.values.flatMap((v2) => {
      if (v2.enabled) {
        return v2.toBaseEntries();
      } else if (includeAllLocations && isLocation(v2.value)) {
        return v2.toBaseEntries();
      }
      return [];
    });
  }
};

var ChatImplicitContext = class extends Disposable {
  constructor() {
    super(...arguments);
    this.kind = "implicit";
    this.isFile = true;
    this._isSelection = false;
    this._onDidChangeValue = this._register(new Emitter());
    this.onDidChangeValue = this._onDidChangeValue.event;
    this._enabled = false;
  }
  get id() {
    if (URI.isUri(this.value)) {
      return "vscode.implicit.file";
    } else if (isStringImplicitContextValue(this.value)) {
      return "vscode.implicit.string";
    } else if (this.value) {
      if (this._isSelection) {
        return "vscode.implicit.selection";
      } else {
        return "vscode.implicit.viewport";
      }
    } else {
      return "vscode.implicit";
    }
  }
  get name() {
    if (URI.isUri(this.value)) {
      if (this.value.scheme === Schemas.vscodeBrowser) {
        return `browser`;
      }
      return `file:${basename2(this.value)}`;
    }
    if (isLocation(this.value)) {
      return `file:${basename2(this.value.uri)}`;
    }
    if (isStringImplicitContextValue(this.value)) {
      if (this.value.name === void 0 && this.value.resourceUri === void 0) {
        throw new Error("ChatContextItem must have either a label or a resourceUri");
      }
      return this.value.name ?? basename2(this.value.resourceUri);
    }
    return "implicit";
  }
  get modelDescription() {
    if (URI.isUri(this.value)) {
      return `User's active file`;
    } else if (isStringImplicitContextValue(this.value)) {
      if (this.value.name === void 0 && this.value.resourceUri === void 0) {
        throw new Error("ChatContextItem must have either a label or a resourceUri");
      }
      const contextName = this.value.name ?? basename2(this.value.resourceUri);
      return this.value.modelDescription ?? `User's active context from ${contextName}`;
    } else if (this._isSelection) {
      return `User's active selection`;
    } else {
      return `User's current visible code`;
    }
  }
  get isSelection() {
    return this._isSelection;
  }
  get value() {
    return this._value;
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(value2) {
    this._enabled = value2;
    this._onDidChangeValue.fire();
  }
  get uri() {
    if (isStringImplicitContextValue(this.value)) {
      return this.value.uri;
    }
    return this._uri;
  }
  get iconPath() {
    if (isStringImplicitContextValue(this.value)) {
      return this.value.iconPath;
    }
    return void 0;
  }
  setValue(value2, isSelection) {
    if (isStringImplicitContextValue(value2)) {
      this._value = value2;
    } else {
      this._value = value2;
      this._uri = URI.isUri(value2) ? value2 : value2?.uri;
    }
    this._isSelection = isSelection;
    this._onDidChangeValue.fire();
  }
  toBaseEntries() {
    if (!this.value) {
      return [];
    }
    if (URI.isUri(this.value) && this.value.scheme === Schemas.vscodeBrowser) {
      return [];
    }
    if (isStringImplicitContextValue(this.value)) {
      return [
        {
          kind: "string",
          id: this.id,
          name: this.name,
          value: this.value.value ?? this.name,
          modelDescription: this.modelDescription,
          iconPath: this.value.iconPath,
          uri: this.value.uri,
          resourceUri: this.value.resourceUri,
          handle: this.value.handle,
          commandId: this.value.commandId
        }
      ];
    }
    return [{
      kind: "file",
      id: this.id,
      name: this.name,
      value: this.value,
      modelDescription: this.modelDescription
    }];
  }
};
export { isEntireCellVisible, ChatImplicitContextContribution, ChatImplicitContexts, ChatImplicitContext };
