// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/components/diffEditorEditors.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { Position } from "./module-0079.mjs";
import { autorunHandleChanges } from "./module-0052.mjs";
import { OverviewRulerFeature } from "./module-0494.mjs";
import { EditorOptions } from "./module-0105.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/editor/browser/widget/diffEditor/components/diffEditorEditors.ts
var DiffEditorEditors = class extends Disposable {
  constructor(originalEditorElement, modifiedEditorElement, _options, _argCodeEditorWidgetOptions, _createInnerEditor, _contextKeyService, _instantiationService, _keybindingService) {
    super();
    this.originalEditorElement = originalEditorElement;
    this.modifiedEditorElement = modifiedEditorElement;
    this._options = _options;
    this._argCodeEditorWidgetOptions = _argCodeEditorWidgetOptions;
    this._createInnerEditor = _createInnerEditor;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._keybindingService = _keybindingService;
    this.original = this._register(this._createLeftHandSideEditor(this._options.editorOptions.get(), this._argCodeEditorWidgetOptions.originalEditor || {}));
    this.modified = this._register(this._createRightHandSideEditor(this._options.editorOptions.get(), this._argCodeEditorWidgetOptions.modifiedEditor || {}));
    this._onDidContentSizeChange = this._register(new Emitter());
    this.modifiedScrollTop = observableFromEvent(this, this.modified.onDidScrollChange, () => (
      /** @description modified.getScrollTop */
      this.modified.getScrollTop()
    ));
    this.modifiedScrollHeight = observableFromEvent(this, this.modified.onDidScrollChange, () => (
      /** @description modified.getScrollHeight */
      this.modified.getScrollHeight()
    ));
    this.modifiedObs = observableCodeEditor(this.modified);
    this.originalObs = observableCodeEditor(this.original);
    this.modifiedModel = this.modifiedObs.model;
    this.modifiedSelections = observableFromEvent(this, this.modified.onDidChangeCursorSelection, () => this.modified.getSelections() ?? []);
    this.modifiedCursor = derivedOpts({ owner: this, equalsFn: Position.equals }, (reader) => this.modifiedSelections.read(reader)[0]?.getPosition() ?? new Position(1, 1));
    this.originalCursor = observableFromEvent(this, this.original.onDidChangeCursorPosition, () => this.original.getPosition() ?? new Position(1, 1));
    this.isOriginalFocused = observableCodeEditor(this.original).isFocused;
    this.isModifiedFocused = observableCodeEditor(this.modified).isFocused;
    this.isFocused = derived(this, (reader) => this.isOriginalFocused.read(reader) || this.isModifiedFocused.read(reader));
    this._argCodeEditorWidgetOptions = null;
    this._register(autorunHandleChanges({
      changeTracker: {
        createChangeSummary: () => ({}),
        handleChange: (ctx, changeSummary) => {
          if (ctx.didChange(_options.editorOptions)) {
            Object.assign(changeSummary, ctx.change.changedOptions);
          }
          return true;
        }
      }
    }, (reader, changeSummary) => {
      _options.editorOptions.read(reader);
      this._options.renderSideBySide.read(reader);
      this.modified.updateOptions(this._adjustOptionsForRightHandSide(reader, changeSummary));
      this.original.updateOptions(this._adjustOptionsForLeftHandSide(reader, changeSummary));
    }));
  }
  get onDidContentSizeChange() {
    return this._onDidContentSizeChange.event;
  }
  getContentHeight() {
    return Math.max(this.modified.getContentHeight(), this.original.getContentHeight());
  }
  _createLeftHandSideEditor(options3, codeEditorWidgetOptions) {
    const leftHandSideOptions = this._adjustOptionsForLeftHandSide(void 0, options3);
    const editor = this._constructInnerEditor(this._instantiationService, this.originalEditorElement, leftHandSideOptions, codeEditorWidgetOptions);
    const isInDiffLeftEditorKey = this._contextKeyService.createKey("isInDiffLeftEditor", editor.hasWidgetFocus());
    this._register(editor.onDidFocusEditorWidget(() => isInDiffLeftEditorKey.set(true)));
    this._register(editor.onDidBlurEditorWidget(() => isInDiffLeftEditorKey.set(false)));
    return editor;
  }
  _createRightHandSideEditor(options3, codeEditorWidgetOptions) {
    const rightHandSideOptions = this._adjustOptionsForRightHandSide(void 0, options3);
    const editor = this._constructInnerEditor(this._instantiationService, this.modifiedEditorElement, rightHandSideOptions, codeEditorWidgetOptions);
    const isInDiffRightEditorKey = this._contextKeyService.createKey("isInDiffRightEditor", editor.hasWidgetFocus());
    this._register(editor.onDidFocusEditorWidget(() => isInDiffRightEditorKey.set(true)));
    this._register(editor.onDidBlurEditorWidget(() => isInDiffRightEditorKey.set(false)));
    return editor;
  }
  _constructInnerEditor(instantiationService, container2, options3, editorWidgetOptions) {
    const editor = this._createInnerEditor(instantiationService, container2, options3, editorWidgetOptions);
    this._register(editor.onDidContentSizeChange((e4) => {
      const width2 = this.original.getContentWidth() + this.modified.getContentWidth() + OverviewRulerFeature.ENTIRE_DIFF_OVERVIEW_WIDTH;
      this._onDidContentSizeChange.fire({
        contentHeight: this.getContentHeight(),
        contentWidth: width2,
        contentHeightChanged: e4.contentHeightChanged,
        contentWidthChanged: e4.contentWidthChanged
      });
    }));
    return editor;
  }
  _adjustOptionsForLeftHandSide(_reader, changedOptions) {
    const result = this._adjustOptionsForSubEditor(changedOptions);
    if (!this._options.renderSideBySide.get()) {
      result.wordWrapOverride1 = "off";
      result.wordWrapOverride2 = "off";
      result.stickyScroll = { enabled: false };
      result.unicodeHighlight = { nonBasicASCII: false, ambiguousCharacters: false, invisibleCharacters: false };
    } else {
      result.unicodeHighlight = this._options.editorOptions.get().unicodeHighlight || {};
      result.wordWrapOverride1 = this._options.diffWordWrap.get();
    }
    result.glyphMargin = this._options.renderSideBySide.get();
    if (changedOptions.originalAriaLabel) {
      result.ariaLabel = changedOptions.originalAriaLabel;
    }
    result.ariaLabel = this._updateAriaLabel(result.ariaLabel);
    result.readOnly = !this._options.originalEditable.get();
    result.dropIntoEditor = { enabled: !result.readOnly };
    result.extraEditorClassName = "original-in-monaco-diff-editor";
    return result;
  }
  _adjustOptionsForRightHandSide(reader, changedOptions) {
    const result = this._adjustOptionsForSubEditor(changedOptions);
    if (changedOptions.modifiedAriaLabel) {
      result.ariaLabel = changedOptions.modifiedAriaLabel;
    }
    result.ariaLabel = this._updateAriaLabel(result.ariaLabel);
    result.wordWrapOverride1 = this._options.diffWordWrap.get();
    result.revealHorizontalRightPadding = EditorOptions.revealHorizontalRightPadding.defaultValue + OverviewRulerFeature.ENTIRE_DIFF_OVERVIEW_WIDTH;
    result.scrollbar.verticalHasArrows = false;
    result.extraEditorClassName = "modified-in-monaco-diff-editor";
    return result;
  }
  _adjustOptionsForSubEditor(options3) {
    const clonedOptions = {
      ...options3,
      dimension: {
        height: 0,
        width: 0
      }
    };
    clonedOptions.inDiffEditor = true;
    clonedOptions.automaticLayout = false;
    clonedOptions.allowVariableLineHeights = false;
    clonedOptions.allowVariableFonts = false;
    clonedOptions.allowVariableFontsInAccessibilityMode = false;
    clonedOptions.scrollbar = { ...clonedOptions.scrollbar || {} };
    clonedOptions.folding = false;
    clonedOptions.codeLens = this._options.diffCodeLens.get();
    clonedOptions.fixedOverflowWidgets = true;
    clonedOptions.minimap = { ...clonedOptions.minimap || {} };
    clonedOptions.minimap.enabled = false;
    if (this._options.hideUnchangedRegions.get()) {
      clonedOptions.stickyScroll = { enabled: false };
    } else {
      clonedOptions.stickyScroll = this._options.editorOptions.get().stickyScroll;
    }
    return clonedOptions;
  }
  _updateAriaLabel(ariaLabel) {
    if (!ariaLabel) {
      ariaLabel = "";
    }
    const ariaNavigationTip = localize(234, null, this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp")?.getAriaLabel());
    if (this._options.accessibilityVerbose.get()) {
      return ariaLabel + ariaNavigationTip;
    } else if (ariaLabel) {
      return ariaLabel.replaceAll(ariaNavigationTip, "");
    }
    return "";
  }
};

DiffEditorEditors = __decorateClass([
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IKeybindingService)
], DiffEditorEditors);
export { DiffEditorEditors };
