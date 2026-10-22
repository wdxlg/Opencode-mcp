// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorStatus.ts
import { Promises, timeout } from "./module-0036.mjs";
import { UntitledTextEditorInput } from "./module-1549.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { areFunctions, assertReturnsDefined } from "./module-0010.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { TabFocus } from "./module-0219.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { InputMode } from "./module-0112.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { ChangeTabDisplaySize, DetectIndentation, IndentUsingSpaces, IndentUsingTabs, IndentationToSpacesAction, IndentationToTabsAction } from "./module-0813.mjs";
import { TrimTrailingWhitespaceAction } from "./module-0707.mjs";
import { Language } from "./module-0014.mjs";
import { Schemas } from "./module-0033.mjs";
import { getWindowById, runAtThisOrScheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { compare, format2, splitLines } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { BaseBinaryResourceEditor } from "./module-1555.mjs";
import { BinaryResourceDiffEditor } from "./module-1556.mjs";
import { Selection } from "./module-0107.mjs";
import { SUPPORTED_ENCODINGS } from "./module-1123.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { basename2, extname2, isEqual2 } from "./module-0034.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IMarkerData, IMarkerService, MarkerSeverity2 } from "./module-0560.mjs";
import { Action2 } from "./module-0092.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { AutomaticLanguageDetectionLikelyWrongId, ILanguageDetectionService } from "./module-1097.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IExtensionGalleryService } from "./module-0872.mjs";
import { getIconClassesForLanguageId } from "./module-0755.mjs";
import { toAction } from "./module-0082.mjs";
import { URI } from "./module-0032.mjs";
import { FILES_ASSOCIATIONS_CONFIG, IFileService } from "./module-0269.mjs";
import { deepClone } from "./module-0098.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/browser/parts/editor/editorStatus.ts
var SideBySideEditorEncodingSupport = class {
  constructor(primary, secondary) {
    this.primary = primary;
    this.secondary = secondary;
  }
  getEncoding() {
    return this.primary.getEncoding();
  }
  async setEncoding(encoding, mode) {
    await Promises.settled([this.primary, this.secondary].map((editor) => editor.setEncoding(encoding, mode)));
  }
};

var SideBySideEditorLanguageSupport = class {
  constructor(primary, secondary) {
    this.primary = primary;
    this.secondary = secondary;
  }
  setLanguageId(languageId, source) {
    [this.primary, this.secondary].forEach((editor) => editor.setLanguageId(languageId, source));
  }
};

function toEditorWithEncodingSupport(input) {
  if (input instanceof UntitledTextEditorInput) {
    return input;
  }
  if (input instanceof SideBySideEditorInput) {
    const primaryEncodingSupport = toEditorWithEncodingSupport(input.primary);
    const secondaryEncodingSupport = toEditorWithEncodingSupport(input.secondary);
    if (primaryEncodingSupport && secondaryEncodingSupport) {
      return new SideBySideEditorEncodingSupport(primaryEncodingSupport, secondaryEncodingSupport);
    }
    return primaryEncodingSupport;
  }
  const encodingSupport = input;
  if (areFunctions(encodingSupport.setEncoding, encodingSupport.getEncoding)) {
    return encodingSupport;
  }
  return null;
}

function toEditorWithLanguageSupport(input) {
  if (input instanceof UntitledTextEditorInput) {
    return input;
  }
  if (input instanceof SideBySideEditorInput) {
    const primaryLanguageSupport = toEditorWithLanguageSupport(input.primary);
    const secondaryLanguageSupport = toEditorWithLanguageSupport(input.secondary);
    if (primaryLanguageSupport && secondaryLanguageSupport) {
      return new SideBySideEditorLanguageSupport(primaryLanguageSupport, secondaryLanguageSupport);
    }
    return primaryLanguageSupport;
  }
  const languageSupport = input;
  if (typeof languageSupport.setLanguageId === "function") {
    return languageSupport;
  }
  return null;
}

var StateChange = class {
  constructor() {
    this.indentation = false;
    this.selectionStatus = false;
    this.languageId = false;
    this.languageStatus = false;
    this.encoding = false;
    this.EOL = false;
    this.tabFocusMode = false;
    this.inputMode = false;
    this.columnSelectionMode = false;
    this.metadata = false;
  }
  combine(other) {
    this.indentation = this.indentation || other.indentation;
    this.selectionStatus = this.selectionStatus || other.selectionStatus;
    this.languageId = this.languageId || other.languageId;
    this.languageStatus = this.languageStatus || other.languageStatus;
    this.encoding = this.encoding || other.encoding;
    this.EOL = this.EOL || other.EOL;
    this.tabFocusMode = this.tabFocusMode || other.tabFocusMode;
    this.inputMode = this.inputMode || other.inputMode;
    this.columnSelectionMode = this.columnSelectionMode || other.columnSelectionMode;
    this.metadata = this.metadata || other.metadata;
  }
  hasChanges() {
    return this.indentation || this.selectionStatus || this.languageId || this.languageStatus || this.encoding || this.EOL || this.tabFocusMode || this.inputMode || this.columnSelectionMode || this.metadata;
  }
};

var State4 = class {
  get selectionStatus() {
    return this._selectionStatus;
  }
  get languageId() {
    return this._languageId;
  }
  get encoding() {
    return this._encoding;
  }
  get EOL() {
    return this._EOL;
  }
  get indentation() {
    return this._indentation;
  }
  get tabFocusMode() {
    return this._tabFocusMode;
  }
  get inputMode() {
    return this._inputMode;
  }
  get columnSelectionMode() {
    return this._columnSelectionMode;
  }
  get metadata() {
    return this._metadata;
  }
  update(update) {
    const change = new StateChange();
    switch (update.type) {
      case "selectionStatus":
        if (this._selectionStatus !== update.selectionStatus) {
          this._selectionStatus = update.selectionStatus;
          change.selectionStatus = true;
        }
        break;
      case "indentation":
        if (this._indentation !== update.indentation) {
          this._indentation = update.indentation;
          change.indentation = true;
        }
        break;
      case "languageId":
        if (this._languageId !== update.languageId) {
          this._languageId = update.languageId;
          change.languageId = true;
        }
        break;
      case "encoding":
        if (this._encoding !== update.encoding) {
          this._encoding = update.encoding;
          change.encoding = true;
        }
        break;
      case "EOL":
        if (this._EOL !== update.EOL) {
          this._EOL = update.EOL;
          change.EOL = true;
        }
        break;
      case "tabFocusMode":
        if (this._tabFocusMode !== update.tabFocusMode) {
          this._tabFocusMode = update.tabFocusMode;
          change.tabFocusMode = true;
        }
        break;
      case "inputMode":
        if (this._inputMode !== update.inputMode) {
          this._inputMode = update.inputMode;
          change.inputMode = true;
        }
        break;
      case "columnSelectionMode":
        if (this._columnSelectionMode !== update.columnSelectionMode) {
          this._columnSelectionMode = update.columnSelectionMode;
          change.columnSelectionMode = true;
        }
        break;
      case "metadata":
        if (this._metadata !== update.metadata) {
          this._metadata = update.metadata;
          change.metadata = true;
        }
        break;
    }
    return change;
  }
};

var TabFocusMode = class extends Disposable {
  constructor(configurationService) {
    super();
    this.configurationService = configurationService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.registerListeners();
    const tabFocusModeConfig = configurationService.getValue("editor.tabFocusMode") === true;
    TabFocus.setTabFocusMode(tabFocusModeConfig);
  }
  registerListeners() {
    this._register(TabFocus.onDidChangeTabFocus((tabFocusMode) => this._onDidChange.fire(tabFocusMode)));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor.tabFocusMode")) {
        const tabFocusModeConfig = this.configurationService.getValue("editor.tabFocusMode") === true;
        TabFocus.setTabFocusMode(tabFocusModeConfig);
        this._onDidChange.fire(tabFocusModeConfig);
      }
    }));
  }
};

TabFocusMode = __decorateClass([
  __decorateParam(0, IConfigurationService)
], TabFocusMode);

var StatusInputMode = class extends Disposable {
  constructor() {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    InputMode.setInputMode("insert");
    this._register(InputMode.onDidChangeInputMode((inputMode) => this._onDidChange.fire(inputMode)));
  }
};

var nlsSingleSelectionRange = localize(6734, null);

var nlsSingleSelection = localize(6733, null);

var nlsMultiSelectionRange = localize(6713, null);

var nlsMultiSelection = localize(6712, null);

var nlsEOLLF = localize(6702, null);

var nlsEOLCRLF = localize(6701, null);

var EditorStatus = class extends Disposable {
  constructor(targetWindowId, editorService, quickInputService, languageService, textFileService, statusbarService, instantiationService, configurationService) {
    super();
    this.targetWindowId = targetWindowId;
    this.editorService = editorService;
    this.quickInputService = quickInputService;
    this.languageService = languageService;
    this.textFileService = textFileService;
    this.statusbarService = statusbarService;
    this.configurationService = configurationService;
    this.tabFocusModeElement = this._register(new MutableDisposable());
    this.inputModeElement = this._register(new MutableDisposable());
    this.columnSelectionModeElement = this._register(new MutableDisposable());
    this.indentationElement = this._register(new MutableDisposable());
    this.selectionElement = this._register(new MutableDisposable());
    this.encodingElement = this._register(new MutableDisposable());
    this.eolElement = this._register(new MutableDisposable());
    this.languageElement = this._register(new MutableDisposable());
    this.metadataElement = this._register(new MutableDisposable());
    this.state = new State4();
    this.toRender = void 0;
    this.activeEditorListeners = this._register(new DisposableStore());
    this.delayedRender = this._register(new MutableDisposable());
    this.currentMarkerStatus = this._register(instantiationService.createInstance(ShowCurrentMarkerInStatusbarContribution));
    this.tabFocusMode = this._register(instantiationService.createInstance(TabFocusMode));
    this.inputMode = this._register(instantiationService.createInstance(StatusInputMode));
    this.registerCommands();
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.editorService.onDidActiveEditorChange(() => this.updateStatusBar()));
    this._register(this.textFileService.untitled.onDidChangeEncoding((model) => this.onResourceEncodingChange(model.resource)));
    this._register(this.textFileService.files.onDidChangeEncoding((model) => this.onResourceEncodingChange(model.resource)));
    this._register(Event2.runAndSubscribe(this.tabFocusMode.onDidChange, (tabFocusMode) => {
      if (tabFocusMode !== void 0) {
        this.onTabFocusModeChange(tabFocusMode);
      } else {
        this.onTabFocusModeChange(this.configurationService.getValue("editor.tabFocusMode"));
      }
    }));
    this._register(Event2.runAndSubscribe(this.inputMode.onDidChange, (inputMode) => this.onInputModeChange(inputMode ?? "insert")));
  }
  registerCommands() {
    this._register(CommandsRegistry.registerCommand({ id: `changeEditorIndentation${this.targetWindowId}`, handler: () => this.showIndentationPicker() }));
  }
  async showIndentationPicker() {
    const activeTextEditorControl = getCodeEditor(this.editorService.activeTextEditorControl);
    if (!activeTextEditorControl) {
      return this.quickInputService.pick([{ label: localize(6714, null) }]);
    }
    if (this.editorService.activeEditor?.isReadonly()) {
      return this.quickInputService.pick([{ label: localize(6716, null) }]);
    }
    const picks = [
      assertReturnsDefined(activeTextEditorControl.getAction(IndentUsingSpaces.ID)),
      assertReturnsDefined(activeTextEditorControl.getAction(IndentUsingTabs.ID)),
      assertReturnsDefined(activeTextEditorControl.getAction(ChangeTabDisplaySize.ID)),
      assertReturnsDefined(activeTextEditorControl.getAction(DetectIndentation.ID)),
      assertReturnsDefined(activeTextEditorControl.getAction(IndentationToSpacesAction.ID)),
      assertReturnsDefined(activeTextEditorControl.getAction(IndentationToTabsAction.ID)),
      assertReturnsDefined(activeTextEditorControl.getAction(TrimTrailingWhitespaceAction.ID))
    ].map((a) => {
      return {
        id: a.id,
        label: a.label,
        detail: Language.isDefaultVariant() || a.label === a.alias ? void 0 : a.alias,
        run: () => {
          activeTextEditorControl.focus();
          a.run();
        }
      };
    });
    picks.splice(3, 0, { type: "separator", label: localize(6706, null) });
    picks.unshift({ type: "separator", label: localize(6707, null) });
    const action = await this.quickInputService.pick(picks, { placeHolder: localize(6717, null), matchOnDetail: true });
    return action?.run();
  }
  updateTabFocusModeElement(visible) {
    if (visible) {
      if (!this.tabFocusModeElement.value) {
        const text2 = localize(6746, null);
        this.tabFocusModeElement.value = this.statusbarService.addEntry({
          name: localize(6745, null),
          text: text2,
          ariaLabel: text2,
          tooltip: localize(6700, null),
          command: "editor.action.toggleTabFocusMode",
          kind: "prominent"
        }, "status.editor.tabFocusMode", 1 /* RIGHT */, 100.7);
      }
    } else {
      this.tabFocusModeElement.clear();
    }
  }
  updateInputModeElement(inputMode) {
    if (inputMode === "overtype") {
      if (!this.inputModeElement.value) {
        const text2 = localize(6708, null);
        const name = localize(6738, null);
        this.inputModeElement.value = this.statusbarService.addEntry({
          name,
          text: text2,
          ariaLabel: text2,
          tooltip: name,
          command: "editor.action.toggleOvertypeInsertMode",
          kind: "prominent"
        }, "status.editor.inputMode", 1 /* RIGHT */, 100.6);
      }
    } else {
      this.inputModeElement.clear();
    }
  }
  updateColumnSelectionModeElement(visible) {
    if (visible) {
      if (!this.columnSelectionModeElement.value) {
        const text2 = localize(6694, null);
        this.columnSelectionModeElement.value = this.statusbarService.addEntry({
          name: localize(6737, null),
          text: text2,
          ariaLabel: text2,
          tooltip: localize(6699, null),
          command: "editor.action.toggleColumnSelection",
          kind: "prominent"
        }, "status.editor.columnSelectionMode", 1 /* RIGHT */, 100.8);
      }
    } else {
      this.columnSelectionModeElement.clear();
    }
  }
  updateSelectionElement(text2) {
    if (!text2) {
      this.selectionElement.clear();
      return;
    }
    const editorURI = getCodeEditor(this.editorService.activeTextEditorControl)?.getModel()?.uri;
    if (editorURI?.scheme === Schemas.vscodeNotebookCell) {
      this.selectionElement.clear();
      return;
    }
    const props = {
      name: localize(6744, null),
      text: text2,
      ariaLabel: text2,
      tooltip: localize(6704, null),
      command: "workbench.action.gotoLine"
    };
    this.updateElement(this.selectionElement, props, "status.editor.selection", 1 /* RIGHT */, 100.5);
  }
  updateIndentationElement(text2) {
    if (!text2) {
      this.indentationElement.clear();
      return;
    }
    const editorURI = getCodeEditor(this.editorService.activeTextEditorControl)?.getModel()?.uri;
    if (editorURI?.scheme === Schemas.vscodeNotebookCell) {
      this.indentationElement.clear();
      return;
    }
    const props = {
      name: localize(6741, null),
      text: text2,
      ariaLabel: text2,
      tooltip: localize(6730, null),
      command: `changeEditorIndentation${this.targetWindowId}`
    };
    this.updateElement(this.indentationElement, props, "status.editor.indentation", 1 /* RIGHT */, 100.4);
  }
  updateEncodingElement(text2) {
    if (!text2) {
      this.encodingElement.clear();
      return;
    }
    const props = {
      name: localize(6739, null),
      text: text2,
      ariaLabel: text2,
      tooltip: localize(6728, null),
      command: "workbench.action.editor.changeEncoding"
    };
    this.updateElement(this.encodingElement, props, "status.editor.encoding", 1 /* RIGHT */, 100.3);
  }
  updateEOLElement(text2) {
    if (!text2) {
      this.eolElement.clear();
      return;
    }
    const props = {
      name: localize(6740, null),
      text: text2,
      ariaLabel: text2,
      tooltip: localize(6729, null),
      command: "workbench.action.editor.changeEOL"
    };
    this.updateElement(this.eolElement, props, "status.editor.eol", 1 /* RIGHT */, 100.2);
  }
  updateLanguageIdElement(text2) {
    if (!text2) {
      this.languageElement.clear();
      return;
    }
    const props = {
      name: localize(6743, null),
      text: text2,
      ariaLabel: text2,
      tooltip: localize(6731, null),
      command: "workbench.action.editor.changeLanguageMode"
    };
    this.updateElement(this.languageElement, props, "status.editor.mode", 1 /* RIGHT */, 100.1);
  }
  updateMetadataElement(text2) {
    if (!text2) {
      this.metadataElement.clear();
      return;
    }
    const props = {
      name: localize(6742, null),
      text: text2,
      ariaLabel: text2,
      tooltip: localize(6703, null)
    };
    this.updateElement(this.metadataElement, props, "status.editor.info", 1 /* RIGHT */, 100);
  }
  updateElement(element, props, id2, alignment, priority) {
    if (!element.value) {
      element.value = this.statusbarService.addEntry(props, id2, alignment, priority);
    } else {
      element.value.update(props);
    }
  }
  updateState(update) {
    const changed = this.state.update(update);
    if (!changed.hasChanges()) {
      return;
    }
    if (!this.toRender) {
      this.toRender = changed;
      this.delayedRender.value = runAtThisOrScheduleAtNextAnimationFrame(getWindowById(this.targetWindowId, true).window, () => {
        this.delayedRender.clear();
        const toRender = this.toRender;
        this.toRender = void 0;
        if (toRender) {
          this.doRenderNow();
        }
      });
    } else {
      this.toRender.combine(changed);
    }
  }
  doRenderNow() {
    this.updateTabFocusModeElement(!!this.state.tabFocusMode);
    this.updateInputModeElement(this.state.inputMode);
    this.updateColumnSelectionModeElement(!!this.state.columnSelectionMode);
    this.updateIndentationElement(this.state.indentation);
    this.updateSelectionElement(this.state.selectionStatus);
    this.updateEncodingElement(this.state.encoding);
    this.updateEOLElement(this.state.EOL ? this.state.EOL === "\r\n" ? nlsEOLCRLF : nlsEOLLF : void 0);
    this.updateLanguageIdElement(this.state.languageId);
    this.updateMetadataElement(this.state.metadata);
  }
  getSelectionLabel(info) {
    if (!info?.selections) {
      return void 0;
    }
    if (info.selections.length === 1) {
      if (info.charactersSelected) {
        return format2(nlsSingleSelectionRange, info.selections[0].positionLineNumber, info.selections[0].positionColumn, info.charactersSelected);
      }
      return format2(nlsSingleSelection, info.selections[0].positionLineNumber, info.selections[0].positionColumn);
    }
    if (info.charactersSelected) {
      return format2(nlsMultiSelectionRange, info.selections.length, info.charactersSelected);
    }
    if (info.selections.length > 0) {
      return format2(nlsMultiSelection, info.selections.length);
    }
    return void 0;
  }
  updateStatusBar() {
    const activeInput = this.editorService.activeEditor;
    const activeEditorPane = this.editorService.activeEditorPane;
    const activeCodeEditor = activeEditorPane ? getCodeEditor(activeEditorPane.getControl()) ?? void 0 : void 0;
    this.onColumnSelectionModeChange(activeCodeEditor);
    this.onSelectionChange(activeCodeEditor);
    this.onLanguageChange(activeCodeEditor, activeInput);
    this.onEOLChange(activeCodeEditor);
    this.onEncodingChange(activeEditorPane, activeCodeEditor);
    this.onIndentationChange(activeCodeEditor);
    this.onMetadataChange(activeEditorPane);
    this.currentMarkerStatus.update(activeCodeEditor);
    this.activeEditorListeners.clear();
    if (activeEditorPane) {
      this.activeEditorListeners.add(activeEditorPane.onDidChangeControl(() => {
        this.updateStatusBar();
      }));
    }
    if (activeCodeEditor) {
      this.activeEditorListeners.add(activeCodeEditor.onDidChangeConfiguration((event) => {
        if (event.hasChanged(28 /* columnSelection */)) {
          this.onColumnSelectionModeChange(activeCodeEditor);
        }
      }));
      this.activeEditorListeners.add(Event2.defer(activeCodeEditor.onDidChangeCursorPosition)(() => {
        this.onSelectionChange(activeCodeEditor);
        this.currentMarkerStatus.update(activeCodeEditor);
      }));
      this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelLanguage(() => {
        this.onLanguageChange(activeCodeEditor, activeInput);
      }));
      this.activeEditorListeners.add(Event2.accumulate(activeCodeEditor.onDidChangeModelContent)((e) => {
        this.onEOLChange(activeCodeEditor);
        this.currentMarkerStatus.update(activeCodeEditor);
        const selections = activeCodeEditor.getSelections();
        if (selections) {
          for (const inner of e) {
            for (const change of inner.changes) {
              if (selections.some((selection) => Range2.areIntersecting(selection, change.range))) {
                this.onSelectionChange(activeCodeEditor);
                break;
              }
            }
          }
        }
      }));
      this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelOptions(() => {
        this.onIndentationChange(activeCodeEditor);
      }));
    } else if (activeEditorPane instanceof BaseBinaryResourceEditor || activeEditorPane instanceof BinaryResourceDiffEditor) {
      const binaryEditors = [];
      if (activeEditorPane instanceof BinaryResourceDiffEditor) {
        const primary = activeEditorPane.getPrimaryEditorPane();
        if (primary instanceof BaseBinaryResourceEditor) {
          binaryEditors.push(primary);
        }
        const secondary = activeEditorPane.getSecondaryEditorPane();
        if (secondary instanceof BaseBinaryResourceEditor) {
          binaryEditors.push(secondary);
        }
      } else {
        binaryEditors.push(activeEditorPane);
      }
      for (const editor of binaryEditors) {
        this.activeEditorListeners.add(editor.onDidChangeMetadata(() => {
          this.onMetadataChange(activeEditorPane);
        }));
        this.activeEditorListeners.add(editor.onDidOpenInPlace(() => {
          this.updateStatusBar();
        }));
      }
    }
  }
  onLanguageChange(editorWidget, editorInput) {
    const info = { type: "languageId", languageId: void 0 };
    if (editorWidget && editorInput && toEditorWithLanguageSupport(editorInput)) {
      const textModel = editorWidget.getModel();
      if (textModel) {
        const languageId = textModel.getLanguageId();
        info.languageId = this.languageService.getLanguageName(languageId) ?? void 0;
      }
    }
    this.updateState(info);
  }
  onIndentationChange(editorWidget) {
    const update = { type: "indentation", indentation: void 0 };
    if (editorWidget) {
      const model = editorWidget.getModel();
      if (model) {
        const modelOpts = model.getOptions();
        update.indentation = modelOpts.insertSpaces ? modelOpts.tabSize === modelOpts.indentSize ? localize(6736, null, modelOpts.indentSize) : localize(6735, null, modelOpts.indentSize, modelOpts.tabSize) : localize(6747, null, modelOpts.tabSize);
      }
    }
    this.updateState(update);
  }
  onMetadataChange(editor) {
    const update = { type: "metadata", metadata: void 0 };
    if (editor instanceof BaseBinaryResourceEditor || editor instanceof BinaryResourceDiffEditor) {
      update.metadata = editor.getMetadata();
    }
    this.updateState(update);
  }
  onColumnSelectionModeChange(editorWidget) {
    const info = { type: "columnSelectionMode", columnSelectionMode: false };
    if (editorWidget?.getOption(28 /* columnSelection */)) {
      info.columnSelectionMode = true;
    }
    this.updateState(info);
  }
  onSelectionChange(editorWidget) {
    const info = /* @__PURE__ */ Object.create(null);
    if (editorWidget) {
      info.selections = editorWidget.getSelections() || [];
      info.charactersSelected = 0;
      const textModel = editorWidget.getModel();
      if (textModel) {
        for (const selection of info.selections) {
          if (typeof info.charactersSelected !== "number") {
            info.charactersSelected = 0;
          }
          info.charactersSelected += textModel.getCharacterCountInRange(selection);
        }
      }
      if (info.selections.length === 1) {
        const editorPosition = editorWidget.getPosition();
        const selectionClone = new Selection(
          info.selections[0].selectionStartLineNumber,
          info.selections[0].selectionStartColumn,
          info.selections[0].positionLineNumber,
          editorPosition ? editorWidget.getStatusbarColumn(editorPosition) : info.selections[0].positionColumn
        );
        info.selections[0] = selectionClone;
      }
    }
    this.updateState({ type: "selectionStatus", selectionStatus: this.getSelectionLabel(info) });
  }
  onEOLChange(editorWidget) {
    const info = { type: "EOL", EOL: void 0 };
    if (editorWidget && !editorWidget.getOption(104 /* readOnly */)) {
      const codeEditorModel = editorWidget.getModel();
      if (codeEditorModel) {
        info.EOL = codeEditorModel.getEOL();
      }
    }
    this.updateState(info);
  }
  onEncodingChange(editor, editorWidget) {
    if (editor && !this.isActiveEditor(editor)) {
      return;
    }
    const info = { type: "encoding", encoding: void 0 };
    if (editor && editorWidget?.hasModel()) {
      const encodingSupport = editor.input ? toEditorWithEncodingSupport(editor.input) : null;
      if (encodingSupport) {
        const rawEncoding = encodingSupport.getEncoding();
        const encodingInfo = typeof rawEncoding === "string" ? SUPPORTED_ENCODINGS[rawEncoding] : void 0;
        if (encodingInfo) {
          info.encoding = encodingInfo.labelShort;
        } else {
          info.encoding = rawEncoding;
        }
      }
    }
    this.updateState(info);
  }
  onResourceEncodingChange(resource) {
    const activeEditorPane = this.editorService.activeEditorPane;
    if (activeEditorPane) {
      const activeResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input, { supportSideBySide: 1 /* PRIMARY */ });
      if (activeResource && isEqual2(activeResource, resource)) {
        const activeCodeEditor = getCodeEditor(activeEditorPane.getControl()) ?? void 0;
        return this.onEncodingChange(activeEditorPane, activeCodeEditor);
      }
    }
  }
  onTabFocusModeChange(tabFocusMode) {
    const info = { type: "tabFocusMode", tabFocusMode };
    this.updateState(info);
  }
  onInputModeChange(inputMode) {
    const info = { type: "inputMode", inputMode };
    this.updateState(info);
  }
  isActiveEditor(control) {
    const activeEditorPane = this.editorService.activeEditorPane;
    return !!activeEditorPane && activeEditorPane === control;
  }
};

EditorStatus = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, ITextFileService),
  __decorateParam(5, IStatusbarService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IConfigurationService)
], EditorStatus);

var EditorStatusContribution = class extends Disposable {
  constructor(editorGroupService) {
    super();
    this.editorGroupService = editorGroupService;
    for (const part of editorGroupService.parts) {
      this.createEditorStatus(part);
    }
    this._register(editorGroupService.onDidCreateAuxiliaryEditorPart((part) => this.createEditorStatus(part)));
  }
  static {
    this.ID = "workbench.contrib.editorStatus";
  }
  createEditorStatus(part) {
    const disposables = new DisposableStore();
    Event2.once(part.onWillDispose)(() => disposables.dispose());
    const scopedInstantiationService = this.editorGroupService.getScopedInstantiationService(part);
    disposables.add(scopedInstantiationService.createInstance(EditorStatus, part.windowId));
  }
};

EditorStatusContribution = __decorateClass([
  __decorateParam(0, IEditorGroupsService)
], EditorStatusContribution);

var ShowCurrentMarkerInStatusbarContribution = class extends Disposable {
  constructor(statusbarService, markerService, configurationService) {
    super();
    this.statusbarService = statusbarService;
    this.markerService = markerService;
    this.configurationService = configurationService;
    this.editor = void 0;
    this.markers = [];
    this.currentMarker = null;
    this.statusBarEntryAccessor = this._register(new MutableDisposable());
    this._register(markerService.onMarkerChanged((changedResources) => this.onMarkerChanged(changedResources)));
    this._register(Event2.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("problems.showCurrentInStatus"))(() => this.updateStatus()));
  }
  update(editor) {
    this.editor = editor;
    this.updateMarkers();
    this.updateStatus();
  }
  updateStatus() {
    const previousMarker = this.currentMarker;
    this.currentMarker = this.getMarker();
    if (this.hasToUpdateStatus(previousMarker, this.currentMarker)) {
      if (this.currentMarker) {
        const line = splitLines(this.currentMarker.message)[0];
        const text2 = `${this.getType(this.currentMarker)} ${line}`;
        if (!this.statusBarEntryAccessor.value) {
          this.statusBarEntryAccessor.value = this.statusbarService.addEntry({ name: localize(6698, null), text: text2, ariaLabel: text2 }, "statusbar.currentProblem", 0 /* LEFT */);
        } else {
          this.statusBarEntryAccessor.value.update({ name: localize(6698, null), text: text2, ariaLabel: text2 });
        }
      } else {
        this.statusBarEntryAccessor.clear();
      }
    }
  }
  hasToUpdateStatus(previousMarker, currentMarker) {
    if (!currentMarker) {
      return true;
    }
    if (!previousMarker) {
      return true;
    }
    return IMarkerData.makeKey(previousMarker) !== IMarkerData.makeKey(currentMarker);
  }
  getType(marker) {
    switch (marker.severity) {
      case 8 /* Error */:
        return "$(error)";
      case 4 /* Warning */:
        return "$(warning)";
      case 2 /* Info */:
        return "$(info)";
    }
    return "";
  }
  getMarker() {
    if (!this.configurationService.getValue("problems.showCurrentInStatus")) {
      return null;
    }
    if (!this.editor) {
      return null;
    }
    const model = this.editor.getModel();
    if (!model) {
      return null;
    }
    const position2 = this.editor.getPosition();
    if (!position2) {
      return null;
    }
    return this.markers.find((marker) => Range2.containsPosition(marker, position2)) || null;
  }
  onMarkerChanged(changedResources) {
    if (!this.editor) {
      return;
    }
    const model = this.editor.getModel();
    if (!model) {
      return;
    }
    if (model && !changedResources.some((r2) => isEqual2(model.uri, r2))) {
      return;
    }
    this.updateMarkers();
  }
  updateMarkers() {
    if (!this.editor) {
      return;
    }
    const model = this.editor.getModel();
    if (!model) {
      return;
    }
    if (model) {
      this.markers = this.markerService.read({
        resource: model.uri,
        severities: 8 /* Error */ | 4 /* Warning */ | 2 /* Info */
      });
      this.markers.sort(this.compareMarker);
    } else {
      this.markers = [];
    }
    this.updateStatus();
  }
  compareMarker(a, b) {
    let res = compare(a.resource.toString(), b.resource.toString());
    if (res === 0) {
      res = MarkerSeverity2.compare(a.severity, b.severity);
    }
    if (res === 0) {
      res = Range2.compareRangesUsingStarts(a, b);
    }
    return res;
  }
};

ShowCurrentMarkerInStatusbarContribution = __decorateClass([
  __decorateParam(0, IStatusbarService),
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IConfigurationService)
], ShowCurrentMarkerInStatusbarContribution);

var ChangeLanguageAction = class _ChangeLanguageAction extends Action2 {
  static {
    this.ID = "workbench.action.editor.changeLanguageMode";
  }
  constructor() {
    super({
      id: _ChangeLanguageAction.ID,
      title: localize2(6693, "Change Language Mode"),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 43 /* KeyM */)
      },
      precondition: ContextKeyExpr.not("notebookEditorFocused"),
      metadata: {
        description: localize(6692, null),
        args: [
          {
            name: localize(6691, null),
            constraint: (value2) => typeof value2 === "string"
          }
        ]
      }
    });
  }
  async run(accessor, languageMode) {
    const quickInputService = accessor.get(IQuickInputService);
    const editorService = accessor.get(IEditorService);
    const languageService = accessor.get(ILanguageService);
    const languageDetectionService = accessor.get(ILanguageDetectionService);
    const textFileService = accessor.get(ITextFileService);
    const preferencesService = accessor.get(IPreferencesService);
    const configurationService = accessor.get(IConfigurationService);
    const telemetryService = accessor.get(ITelemetryService);
    const commandService = accessor.get(ICommandService);
    const galleryService = accessor.get(IExtensionGalleryService);
    const activeTextEditorControl = getCodeEditor(editorService.activeTextEditorControl);
    if (!activeTextEditorControl) {
      await quickInputService.pick([{ label: localize(6714, null) }]);
      return;
    }
    const textModel = activeTextEditorControl.getModel();
    const resource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    let currentLanguageName;
    let currentLanguageId;
    if (textModel) {
      currentLanguageId = textModel.getLanguageId();
      currentLanguageName = languageService.getLanguageName(currentLanguageId) ?? void 0;
    }
    let hasLanguageSupport = !!resource;
    if (resource?.scheme === Schemas.untitled && !textFileService.untitled.get(resource)?.hasAssociatedFilePath) {
      hasLanguageSupport = false;
    }
    const languages = languageService.getSortedRegisteredLanguageNames();
    const picks = languages.map(({ languageName, languageId }) => {
      const extensions = languageService.getExtensions(languageId).join(" ");
      let description;
      if (currentLanguageName === languageName) {
        description = localize(6709, null, languageId);
      } else {
        description = localize(6710, null, languageId);
      }
      return {
        id: languageId,
        label: languageName,
        meta: extensions,
        iconClasses: getIconClassesForLanguageId(languageId),
        description
      };
    });
    picks.unshift({ type: "separator", label: localize(6711, null) });
    let configureLanguageAssociations;
    let configureLanguageSettings;
    let galleryAction;
    if (hasLanguageSupport && resource) {
      const ext = extname2(resource) || basename2(resource);
      if (galleryService.isEnabled()) {
        galleryAction = toAction({
          id: "workbench.action.showLanguageExtensions",
          label: localize(6732, null, ext),
          run: () => commandService.executeCommand("workbench.extensions.action.showExtensionsForLanguage", ext)
        });
        picks.unshift(galleryAction);
      }
      configureLanguageSettings = { label: localize(6696, null, currentLanguageName) };
      picks.unshift(configureLanguageSettings);
      configureLanguageAssociations = { label: localize(6695, null, ext) };
      picks.unshift(configureLanguageAssociations);
    }
    const autoDetectLanguage = { label: localize(6688, null) };
    if (textModel && textModel.getValueLength() > 0) {
      picks.unshift(autoDetectLanguage);
    }
    const pick = typeof languageMode === "string" ? { label: languageMode } : await quickInputService.pick(picks, { placeHolder: localize(6721, null), matchOnDescription: true });
    if (!pick) {
      return;
    }
    if (pick === galleryAction) {
      galleryAction.run();
      return;
    }
    if (pick === configureLanguageAssociations) {
      if (resource) {
        this.configureFileAssociation(resource, languageService, quickInputService, configurationService);
      }
      return;
    }
    if (pick === configureLanguageSettings) {
      preferencesService.openUserSettings({ jsonEditor: true, revealSetting: { key: `[${currentLanguageId ?? null}]`, edit: true } });
      return;
    }
    const activeEditor = editorService.activeEditor;
    if (activeEditor) {
      const languageSupport = toEditorWithLanguageSupport(activeEditor);
      if (languageSupport) {
        let languageSelection;
        let detectedLanguage;
        if (pick === autoDetectLanguage) {
          if (textModel) {
            const resource2 = EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
            if (resource2) {
              let languageId = languageService.guessLanguageIdByFilepathOrFirstLine(resource2, textModel.getLineContent(1)) ?? void 0;
              if (!languageId || languageId === "unknown") {
                detectedLanguage = await languageDetectionService.detectLanguage(resource2);
                languageId = detectedLanguage;
              }
              if (languageId) {
                languageSelection = languageService.createById(languageId);
              }
            }
          }
        } else {
          languageSelection = languageService.createById(pick.id);
          if (resource) {
            languageDetectionService.detectLanguage(resource).then((detectedLanguageId) => {
              const chosenLanguageId = languageService.getLanguageIdByLanguageName(pick.label) || "unknown";
              if (detectedLanguageId === currentLanguageId && currentLanguageId !== chosenLanguageId) {
                const modelPreference = configurationService.getValue("workbench.editor.preferHistoryBasedLanguageDetection") ? "history" : "classic";
                telemetryService.publicLog2(AutomaticLanguageDetectionLikelyWrongId, {
                  currentLanguageId: currentLanguageName ?? "unknown",
                  nextLanguageId: pick.label,
                  lineCount: textModel?.getLineCount() ?? -1,
                  modelPreference
                });
              }
            });
          }
        }
        if (typeof languageSelection !== "undefined") {
          languageSupport.setLanguageId(languageSelection.languageId, _ChangeLanguageAction.ID);
          if (resource?.scheme === Schemas.untitled) {
            const modelPreference = configurationService.getValue("workbench.editor.preferHistoryBasedLanguageDetection") ? "history" : "classic";
            telemetryService.publicLog2("setUntitledDocumentLanguage", {
              to: languageSelection.languageId,
              from: currentLanguageId ?? "none",
              modelPreference
            });
          }
        }
      }
      activeTextEditorControl.focus();
    }
  }
  configureFileAssociation(resource, languageService, quickInputService, configurationService) {
    const extension = extname2(resource);
    const base = basename2(resource);
    const currentAssociation = languageService.guessLanguageIdByFilepathOrFirstLine(URI.file(base));
    const languages = languageService.getSortedRegisteredLanguageNames();
    const picks = languages.map(({ languageName, languageId }) => {
      return {
        id: languageId,
        label: languageName,
        iconClasses: getIconClassesForLanguageId(languageId),
        description: languageId === currentAssociation ? localize(6697, null) : void 0
      };
    });
    setTimeout(
      async () => {
        const language2 = await quickInputService.pick(picks, { placeHolder: localize(6722, null, extension || base) });
        if (language2) {
          const fileAssociationsConfig = configurationService.inspect(FILES_ASSOCIATIONS_CONFIG);
          let associationKey;
          if (extension && base[0] !== ".") {
            associationKey = `*${extension}`;
          } else {
            associationKey = base;
          }
          let target = 2 /* USER */;
          if (fileAssociationsConfig.workspaceValue?.[associationKey]) {
            target = 5 /* WORKSPACE */;
          }
          const currentAssociations = deepClone(target === 5 /* WORKSPACE */ ? fileAssociationsConfig.workspaceValue : fileAssociationsConfig.userValue) || /* @__PURE__ */ Object.create(null);
          currentAssociations[associationKey] = language2.id;
          configurationService.updateValue(FILES_ASSOCIATIONS_CONFIG, currentAssociations, target);
        }
      },
      50
      /* quick input is sensitive to being opened so soon after another */
    );
  }
};

var ChangeEOLAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.editor.changeEOL",
      title: localize2(6690, "Change End of Line Sequence"),
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const quickInputService = accessor.get(IQuickInputService);
    const activeTextEditorControl = getCodeEditor(editorService.activeTextEditorControl);
    if (!activeTextEditorControl) {
      await quickInputService.pick([{ label: localize(6714, null) }]);
      return;
    }
    if (editorService.activeEditor?.isReadonly()) {
      await quickInputService.pick([{ label: localize(6716, null) }]);
      return;
    }
    let textModel = activeTextEditorControl.getModel();
    const EOLOptions = [
      { label: nlsEOLLF, eol: 0 /* LF */ },
      { label: nlsEOLCRLF, eol: 1 /* CRLF */ }
    ];
    const selectedIndex = textModel?.getEOL() === "\n" ? 0 : 1;
    const eol = await quickInputService.pick(EOLOptions, { placeHolder: localize(6720, null), activeItem: EOLOptions[selectedIndex] });
    if (eol) {
      const activeCodeEditor = getCodeEditor(editorService.activeTextEditorControl);
      if (activeCodeEditor?.hasModel() && !editorService.activeEditor?.isReadonly()) {
        textModel = activeCodeEditor.getModel();
        textModel.pushStackElement();
        textModel.pushEOL(eol.eol);
        textModel.pushStackElement();
      }
    }
    activeTextEditorControl.focus();
  }
};

var ChangeEncodingAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.editor.changeEncoding",
      title: localize2(6689, "Change File Encoding"),
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const quickInputService = accessor.get(IQuickInputService);
    const fileService = accessor.get(IFileService);
    const textFileService = accessor.get(ITextFileService);
    const textResourceConfigurationService = accessor.get(ITextResourceConfigurationService);
    const dialogService = accessor.get(IDialogService);
    const activeTextEditorControl = getCodeEditor(editorService.activeTextEditorControl);
    if (!activeTextEditorControl) {
      await quickInputService.pick([{ label: localize(6714, null) }]);
      return;
    }
    const activeEditorPane = editorService.activeEditorPane;
    if (!activeEditorPane) {
      await quickInputService.pick([{ label: localize(6714, null) }]);
      return;
    }
    const encodingSupport = toEditorWithEncodingSupport(activeEditorPane.input);
    if (!encodingSupport) {
      await quickInputService.pick([{ label: localize(6715, null) }]);
      return;
    }
    const saveWithEncodingPick = { label: localize(6727, null) };
    const reopenWithEncodingPick = { label: localize(6724, null) };
    if (!Language.isDefaultVariant()) {
      const saveWithEncodingAlias = "Save with Encoding";
      if (saveWithEncodingAlias !== saveWithEncodingPick.label) {
        saveWithEncodingPick.detail = saveWithEncodingAlias;
      }
      const reopenWithEncodingAlias = "Reopen with Encoding";
      if (reopenWithEncodingAlias !== reopenWithEncodingPick.label) {
        reopenWithEncodingPick.detail = reopenWithEncodingAlias;
      }
    }
    let action;
    if (encodingSupport instanceof UntitledTextEditorInput) {
      action = saveWithEncodingPick;
    } else if (activeEditorPane.input.isReadonly()) {
      action = reopenWithEncodingPick;
    } else {
      action = await quickInputService.pick([reopenWithEncodingPick, saveWithEncodingPick], { placeHolder: localize(6717, null), matchOnDetail: true });
    }
    if (!action) {
      return;
    }
    await timeout(50);
    const resource = EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: 1 /* PRIMARY */ });
    if (!resource || !fileService.hasProvider(resource) && resource.scheme !== Schemas.untitled) {
      return;
    }
    let guessedEncoding = void 0;
    if (fileService.hasProvider(resource)) {
      const content2 = await textFileService.readStream(resource, {
        autoGuessEncoding: true,
        candidateGuessEncodings: textResourceConfigurationService.getValue(resource, "files.candidateGuessEncodings")
      });
      guessedEncoding = content2.encoding;
    }
    const isReopenWithEncoding = action === reopenWithEncodingPick;
    const configuredEncoding = textResourceConfigurationService.getValue(resource, "files.encoding");
    let directMatchIndex;
    let aliasMatchIndex;
    const picks = Object.keys(SUPPORTED_ENCODINGS).sort((k1, k2) => {
      if (k1 === configuredEncoding) {
        return -1;
      } else if (k2 === configuredEncoding) {
        return 1;
      }
      return SUPPORTED_ENCODINGS[k1].order - SUPPORTED_ENCODINGS[k2].order;
    }).filter((k) => {
      if (k === guessedEncoding && guessedEncoding !== configuredEncoding) {
        return false;
      }
      return !isReopenWithEncoding || !SUPPORTED_ENCODINGS[k].encodeOnly;
    }).map((key3, index2) => {
      if (key3 === encodingSupport.getEncoding()) {
        directMatchIndex = index2;
      } else if (SUPPORTED_ENCODINGS[key3].alias === encodingSupport.getEncoding()) {
        aliasMatchIndex = index2;
      }
      return { id: key3, label: SUPPORTED_ENCODINGS[key3].labelLong, description: key3 };
    });
    const items = picks.slice();
    if (guessedEncoding && configuredEncoding !== guessedEncoding && SUPPORTED_ENCODINGS[guessedEncoding]) {
      picks.unshift({ type: "separator" });
      picks.unshift({ id: guessedEncoding, label: SUPPORTED_ENCODINGS[guessedEncoding].labelLong, description: localize(6705, null) });
    }
    const encoding = await quickInputService.pick(picks, {
      placeHolder: isReopenWithEncoding ? localize(6718, null) : localize(6719, null),
      activeItem: items[typeof directMatchIndex === "number" ? directMatchIndex : typeof aliasMatchIndex === "number" ? aliasMatchIndex : -1]
    });
    if (!encoding) {
      return;
    }
    if (!editorService.activeEditorPane) {
      return;
    }
    const activeEncodingSupport = toEditorWithEncodingSupport(editorService.activeEditorPane.input);
    if (typeof encoding.id !== "undefined" && activeEncodingSupport) {
      if (isReopenWithEncoding && editorService.activeEditorPane.input.isDirty()) {
        const { confirmed } = await dialogService.confirm({
          message: localize(6726, null),
          detail: localize(6725, null),
          primaryButton: localize(6723, null)
        });
        if (!confirmed) {
          return;
        }
        await editorService.activeEditorPane.input.revert(editorService.activeEditorPane.group.id);
      }
      await activeEncodingSupport.setEncoding(encoding.id, isReopenWithEncoding ? 1 /* Decode */ : 0 /* Encode */);
    }
    activeTextEditorControl.focus();
  }
};
export { toEditorWithEncodingSupport, toEditorWithLanguageSupport, SideBySideEditorEncodingSupport, SideBySideEditorLanguageSupport, StateChange, State4, TabFocusMode, StatusInputMode, nlsSingleSelectionRange, nlsSingleSelection, nlsMultiSelectionRange, nlsMultiSelection, nlsEOLLF, nlsEOLCRLF, EditorStatus, EditorStatusContribution, ShowCurrentMarkerInStatusbarContribution, ChangeLanguageAction, ChangeEOLAction, ChangeEncodingAction };
