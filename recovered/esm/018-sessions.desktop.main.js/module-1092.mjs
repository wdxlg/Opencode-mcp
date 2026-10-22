// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/textEditor.ts
import { AbstractEditorWithViewState } from "./module-1091.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { assertReturnsDefined, isObject } from "./module-0010.mjs";
import { deepClone, distinct2 } from "./module-0098.mjs";
import { computeEditorAriaLabel } from "./module-1085.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/browser/parts/editor/textEditor.ts
var AbstractTextEditor = class extends AbstractEditorWithViewState {
  constructor(id2, group2, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService) {
    super(id2, group2, AbstractTextEditor.VIEW_STATE_PREFERENCE_KEY, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
    this.fileService = fileService;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this._onDidChangeScroll = this._register(new Emitter());
    this.onDidChangeScroll = this._onDidChangeScroll.event;
    this.inputListener = this._register(new MutableDisposable());
    this._register(this.textResourceConfigurationService.onDidChangeConfiguration((e4) => this.handleConfigurationChangeEvent(e4)));
    this._register(Event2.any(this.editorGroupService.onDidAddGroup, this.editorGroupService.onDidRemoveGroup)(() => {
      const ariaLabel = this.computeAriaLabel();
      this.editorContainer?.setAttribute("aria-label", ariaLabel);
      this.updateEditorControlOptions({ ariaLabel });
    }));
    this._register(this.fileService.onDidChangeFileSystemProviderCapabilities((e4) => this.onDidChangeFileSystemProvider(e4.scheme)));
    this._register(this.fileService.onDidChangeFileSystemProviderRegistrations((e4) => this.onDidChangeFileSystemProvider(e4.scheme)));
  }
  static {
    this.VIEW_STATE_PREFERENCE_KEY = "textEditorViewState";
  }
  handleConfigurationChangeEvent(e4) {
    const resource = this.getActiveResource();
    if (!this.shouldHandleConfigurationChangeEvent(e4, resource)) {
      return;
    }
    if (this.isVisible()) {
      this.updateEditorConfiguration(resource);
    } else {
      this.hasPendingConfigurationChange = true;
    }
  }
  shouldHandleConfigurationChangeEvent(e4, resource) {
    return e4.affectsConfiguration(resource, "editor") || e4.affectsConfiguration(resource, "problems.visibility");
  }
  consumePendingConfigurationChangeEvent() {
    if (this.hasPendingConfigurationChange) {
      this.updateEditorConfiguration();
      this.hasPendingConfigurationChange = false;
    }
  }
  computeConfiguration(configuration2) {
    const editorConfiguration4 = isObject(configuration2.editor) ? deepClone(configuration2.editor) : /* @__PURE__ */ Object.create(null);
    Object.assign(editorConfiguration4, this.getConfigurationOverrides(configuration2));
    editorConfiguration4.ariaLabel = this.computeAriaLabel();
    return editorConfiguration4;
  }
  computeAriaLabel() {
    return this.input ? computeEditorAriaLabel(this.input, void 0, this.group, this.editorGroupService.count) : localize(6773, null);
  }
  onDidChangeFileSystemProvider(scheme) {
    if (!this.input) {
      return;
    }
    if (this.getActiveResource()?.scheme === scheme) {
      this.updateReadonly(this.input);
    }
  }
  onDidChangeInputCapabilities(input) {
    if (this.input === input) {
      this.updateReadonly(input);
    }
  }
  updateReadonly(input) {
    this.updateEditorControlOptions({ ...this.getReadonlyConfiguration(input.isReadonly()) });
  }
  getReadonlyConfiguration(isReadonly) {
    return {
      readOnly: !!isReadonly,
      readOnlyMessage: typeof isReadonly !== "boolean" ? isReadonly : void 0
    };
  }
  getConfigurationOverrides(configuration2) {
    return {
      overviewRulerLanes: 3,
      lineNumbersMinChars: 3,
      fixedOverflowWidgets: true,
      ...this.getReadonlyConfiguration(this.input?.isReadonly()),
      renderValidationDecorations: configuration2.problems?.visibility !== false ? "on" : "off"
    };
  }
  createEditor(parent) {
    this.editorContainer = parent;
    this.createEditorControl(parent, this.computeConfiguration(this.textResourceConfigurationService.getValue(this.getActiveResource())));
    this.registerCodeEditorListeners();
  }
  registerCodeEditorListeners() {
    const mainControl = this.getMainControl();
    if (mainControl) {
      this._register(mainControl.onDidChangeModelLanguage(() => this.updateEditorConfiguration()));
      this._register(mainControl.onDidChangeModel(() => this.updateEditorConfiguration()));
      this._register(mainControl.onDidChangeCursorPosition((e4) => this._onDidChangeSelection.fire({ reason: this.toEditorPaneSelectionChangeReason(e4) })));
      this._register(mainControl.onDidChangeModelContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EDIT */ })));
      this._register(mainControl.onDidScrollChange(() => this._onDidChangeScroll.fire()));
    }
  }
  toEditorPaneSelectionChangeReason(e4) {
    switch (e4.source) {
      case "api" /* PROGRAMMATIC */:
        return 1 /* PROGRAMMATIC */;
      case "code.navigation" /* NAVIGATION */:
        return 4 /* NAVIGATION */;
      case "code.jump" /* JUMP */:
        return 5 /* JUMP */;
      default:
        return 2 /* USER */;
    }
  }
  getSelection() {
    const mainControl = this.getMainControl();
    if (mainControl) {
      const selection = mainControl.getSelection();
      if (selection) {
        return new TextEditorPaneSelection(selection);
      }
    }
    return void 0;
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    this.inputListener.value = input.onDidChangeCapabilities(() => this.onDidChangeInputCapabilities(input));
    this.updateEditorConfiguration();
    const editorContainer = assertReturnsDefined(this.editorContainer);
    editorContainer.setAttribute("aria-label", this.computeAriaLabel());
  }
  clearInput() {
    this.inputListener.clear();
    super.clearInput();
  }
  getScrollPosition() {
    const editor = this.getMainControl();
    if (!editor) {
      throw new Error("Control has not yet been initialized");
    }
    return {
      // The top position can vary depending on the view zones (find widget for example)
      scrollTop: editor.getScrollTop() - editor.getTopForLineNumber(1),
      scrollLeft: editor.getScrollLeft()
    };
  }
  setScrollPosition(scrollPosition) {
    const editor = this.getMainControl();
    if (!editor) {
      throw new Error("Control has not yet been initialized");
    }
    editor.setScrollTop(scrollPosition.scrollTop);
    if (scrollPosition.scrollLeft) {
      editor.setScrollLeft(scrollPosition.scrollLeft);
    }
  }
  setEditorVisible(visible) {
    if (visible) {
      this.consumePendingConfigurationChangeEvent();
    }
    super.setEditorVisible(visible);
  }
  toEditorViewStateResource(input) {
    return input.resource;
  }
  updateEditorConfiguration(resource = this.getActiveResource()) {
    let configuration2 = void 0;
    if (resource) {
      configuration2 = this.textResourceConfigurationService.getValue(resource);
    }
    if (!configuration2) {
      return;
    }
    const editorConfiguration4 = this.computeConfiguration(configuration2);
    let editorSettingsToApply = editorConfiguration4;
    if (this.lastAppliedEditorOptions) {
      editorSettingsToApply = distinct2(this.lastAppliedEditorOptions, editorSettingsToApply);
    }
    if (Object.keys(editorSettingsToApply).length > 0) {
      this.lastAppliedEditorOptions = editorConfiguration4;
      this.updateEditorControlOptions(editorSettingsToApply);
    }
  }
  getActiveResource() {
    const mainControl = this.getMainControl();
    if (mainControl) {
      const model = mainControl.getModel();
      if (model) {
        return model.uri;
      }
    }
    if (this.input) {
      return this.input.resource;
    }
    return void 0;
  }
  dispose() {
    this.lastAppliedEditorOptions = void 0;
    super.dispose();
  }
};

AbstractTextEditor = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, ITextResourceConfigurationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IEditorGroupsService),
  __decorateParam(9, IFileService)
], AbstractTextEditor);

var TextEditorPaneSelection = class _TextEditorPaneSelection {
  // number of lines to move in editor to justify for significant change
  constructor(textSelection) {
    this.textSelection = textSelection;
  }
  static {
    this.TEXT_EDITOR_SELECTION_THRESHOLD = 10;
  }
  compare(other) {
    if (!(other instanceof _TextEditorPaneSelection)) {
      return 3 /* DIFFERENT */;
    }
    const thisLineNumber = Math.min(this.textSelection.selectionStartLineNumber, this.textSelection.positionLineNumber);
    const otherLineNumber = Math.min(other.textSelection.selectionStartLineNumber, other.textSelection.positionLineNumber);
    if (thisLineNumber === otherLineNumber) {
      return 1 /* IDENTICAL */;
    }
    if (Math.abs(thisLineNumber - otherLineNumber) < _TextEditorPaneSelection.TEXT_EDITOR_SELECTION_THRESHOLD) {
      return 2 /* SIMILAR */;
    }
    return 3 /* DIFFERENT */;
  }
  restore(options3) {
    const textEditorOptions = {
      ...options3,
      selection: this.textSelection,
      selectionRevealType: 1 /* CenterIfOutsideViewport */
    };
    return textEditorOptions;
  }
  log() {
    return `line: ${this.textSelection.startLineNumber}-${this.textSelection.endLineNumber}, col:  ${this.textSelection.startColumn}-${this.textSelection.endColumn}`;
  }
};
export { AbstractTextEditor, TextEditorPaneSelection };
