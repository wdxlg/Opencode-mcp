// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/folding/browser/folding.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { FoldingDecorationProvider } from "./module-0682.mjs";
import { FoldingModel, getNextFoldLine, getParentFoldLine, getPreviousFoldLine, setCollapseStateAtLevel, setCollapseStateForMatchingLines, setCollapseStateForRest, setCollapseStateForType, setCollapseStateLevelsDown, setCollapseStateLevelsUp, setCollapseStateUp, toggleCollapseState } from "./module-0679.mjs";
import { HiddenRangeModel } from "./module-0680.mjs";
import { Delayer, RunOnceScheduler, createCancelablePromise } from "./module-0036.mjs";
import { IndentRangeProvider } from "./module-0681.mjs";
import { SyntaxRangeProvider } from "./module-0683.mjs";
import { StopWatch } from "./module-0016.mjs";
import { FoldingRangeKind } from "./module-0164.mjs";
import { StableEditorScrollState } from "./module-0447.mjs";
import { illegalArgument, onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { Emitter } from "./module-0017.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution, registerInstantiatedEditorAction } from "./module-0097.mjs";
import { isNumber, isObject, isString, isUndefined } from "./module-0010.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { KeyChord } from "./module-0019.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { FoldingRegions } from "./module-0678.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { URI } from "./module-0032.mjs";
import { IModelService } from "./module-0080.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/editor/contrib/folding/browser/folding.ts
var CONTEXT_FOLDING_ENABLED = new RawContextKey("foldingEnabled", false);

var FoldingController = class extends Disposable {
  constructor(editor, contextKeyService, languageConfigurationService, notificationService, languageFeatureDebounceService, languageFeaturesService) {
    super();
    this.contextKeyService = contextKeyService;
    this.languageConfigurationService = languageConfigurationService;
    this.languageFeaturesService = languageFeaturesService;
    this.localToDispose = this._register(new DisposableStore());
    this.editor = editor;
    this._foldingLimitReporter = this._register(new RangesLimitReporter(editor));
    const options3 = this.editor.getOptions();
    this._isEnabled = options3.get(52 /* folding */);
    this._useFoldingProviders = options3.get(53 /* foldingStrategy */) !== "indentation";
    this._unfoldOnClickAfterEndOfLine = options3.get(57 /* unfoldOnClickAfterEndOfLine */);
    this._restoringViewState = false;
    this._currentModelHasFoldedImports = false;
    this._foldingImportsByDefault = options3.get(55 /* foldingImportsByDefault */);
    this.updateDebounceInfo = languageFeatureDebounceService.for(languageFeaturesService.foldingRangeProvider, "Folding", { min: 200 });
    this.foldingModel = null;
    this.hiddenRangeModel = null;
    this.rangeProvider = null;
    this.foldingRegionPromise = null;
    this.foldingModelPromise = null;
    this.updateScheduler = null;
    this.cursorChangedScheduler = null;
    this.mouseDownInfo = null;
    this.foldingDecorationProvider = new FoldingDecorationProvider(editor);
    this.foldingDecorationProvider.showFoldingControls = options3.get(126 /* showFoldingControls */);
    this.foldingDecorationProvider.showFoldingHighlights = options3.get(54 /* foldingHighlight */);
    this.foldingEnabled = CONTEXT_FOLDING_ENABLED.bindTo(this.contextKeyService);
    this.foldingEnabled.set(this._isEnabled);
    this._register(this.editor.onDidChangeModel(() => this.onModelChanged()));
    this._register(this.editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(52 /* folding */)) {
        this._isEnabled = this.editor.getOptions().get(52 /* folding */);
        this.foldingEnabled.set(this._isEnabled);
        this.onModelChanged();
      }
      if (e4.hasChanged(56 /* foldingMaximumRegions */)) {
        this.onModelChanged();
      }
      if (e4.hasChanged(126 /* showFoldingControls */) || e4.hasChanged(54 /* foldingHighlight */)) {
        const options4 = this.editor.getOptions();
        this.foldingDecorationProvider.showFoldingControls = options4.get(126 /* showFoldingControls */);
        this.foldingDecorationProvider.showFoldingHighlights = options4.get(54 /* foldingHighlight */);
        this.triggerFoldingModelChanged();
      }
      if (e4.hasChanged(53 /* foldingStrategy */)) {
        this._useFoldingProviders = this.editor.getOptions().get(53 /* foldingStrategy */) !== "indentation";
        this.onFoldingStrategyChanged();
      }
      if (e4.hasChanged(57 /* unfoldOnClickAfterEndOfLine */)) {
        this._unfoldOnClickAfterEndOfLine = this.editor.getOptions().get(57 /* unfoldOnClickAfterEndOfLine */);
      }
      if (e4.hasChanged(55 /* foldingImportsByDefault */)) {
        this._foldingImportsByDefault = this.editor.getOptions().get(55 /* foldingImportsByDefault */);
      }
    }));
    this.onModelChanged();
  }
  static {
    this.ID = "editor.contrib.folding";
  }
  static get(editor) {
    return editor.getContribution(FoldingController.ID);
  }
  static getFoldingRangeProviders(languageFeaturesService, model) {
    const foldingRangeProviders = languageFeaturesService.foldingRangeProvider.ordered(model);
    return FoldingController._foldingRangeSelector?.(foldingRangeProviders, model) ?? foldingRangeProviders;
  }
  static setFoldingRangeProviderSelector(foldingRangeSelector) {
    FoldingController._foldingRangeSelector = foldingRangeSelector;
    return { dispose: () => {
      FoldingController._foldingRangeSelector = void 0;
    } };
  }
  get limitReporter() {
    return this._foldingLimitReporter;
  }
  /**
   * Store view state.
   */
  saveViewState() {
    const model = this.editor.getModel();
    if (!model || !this._isEnabled || model.isTooLargeForTokenization()) {
      return {};
    }
    if (this.foldingModel) {
      const collapsedRegions = this.foldingModel.getMemento();
      const provider = this.rangeProvider ? this.rangeProvider.id : void 0;
      return { collapsedRegions, lineCount: model.getLineCount(), provider, foldedImports: this._currentModelHasFoldedImports };
    }
    return void 0;
  }
  /**
   * Restore view state.
   */
  restoreViewState(state) {
    const model = this.editor.getModel();
    if (!model || !this._isEnabled || model.isTooLargeForTokenization() || !this.hiddenRangeModel) {
      return;
    }
    if (!state) {
      return;
    }
    this._currentModelHasFoldedImports = !!state.foldedImports;
    if (state.collapsedRegions && state.collapsedRegions.length > 0 && this.foldingModel) {
      this._restoringViewState = true;
      try {
        this.foldingModel.applyMemento(state.collapsedRegions);
      } finally {
        this._restoringViewState = false;
      }
    }
  }
  onModelChanged() {
    this.localToDispose.clear();
    const model = this.editor.getModel();
    if (!this._isEnabled || !model || model.isTooLargeForTokenization()) {
      return;
    }
    this._currentModelHasFoldedImports = false;
    this.foldingModel = new FoldingModel(model, this.foldingDecorationProvider);
    this.localToDispose.add(this.foldingModel);
    this.hiddenRangeModel = new HiddenRangeModel(this.foldingModel);
    this.localToDispose.add(this.hiddenRangeModel);
    this.localToDispose.add(this.hiddenRangeModel.onDidChange((hr2) => this.onHiddenRangesChanges(hr2)));
    this.updateScheduler = new Delayer(this.updateDebounceInfo.get(model));
    this.localToDispose.add(this.updateScheduler);
    this.cursorChangedScheduler = new RunOnceScheduler(() => this.revealCursor(), 200);
    this.localToDispose.add(this.cursorChangedScheduler);
    this.localToDispose.add(this.languageFeaturesService.foldingRangeProvider.onDidChange(() => this.onFoldingStrategyChanged()));
    this.localToDispose.add(this.editor.onDidChangeModelLanguageConfiguration(() => this.onFoldingStrategyChanged()));
    this.localToDispose.add(this.editor.onDidChangeModelContent((e4) => this.onDidChangeModelContent(e4)));
    this.localToDispose.add(this.editor.onDidChangeCursorPosition(() => this.onCursorPositionChanged()));
    this.localToDispose.add(this.editor.onMouseDown((e4) => this.onEditorMouseDown(e4)));
    this.localToDispose.add(this.editor.onMouseUp((e4) => this.onEditorMouseUp(e4)));
    this.localToDispose.add({
      dispose: () => {
        if (this.foldingRegionPromise) {
          this.foldingRegionPromise.cancel();
          this.foldingRegionPromise = null;
        }
        this.updateScheduler?.cancel();
        this.updateScheduler = null;
        this.foldingModel = null;
        this.foldingModelPromise = null;
        this.hiddenRangeModel = null;
        this.cursorChangedScheduler = null;
        this.rangeProvider?.dispose();
        this.rangeProvider = null;
      }
    });
    this.triggerFoldingModelChanged();
  }
  onFoldingStrategyChanged() {
    this.rangeProvider?.dispose();
    this.rangeProvider = null;
    this.triggerFoldingModelChanged();
  }
  getRangeProvider(editorModel) {
    if (this.rangeProvider) {
      return this.rangeProvider;
    }
    const indentRangeProvider = new IndentRangeProvider(editorModel, this.languageConfigurationService, this._foldingLimitReporter);
    this.rangeProvider = indentRangeProvider;
    if (this._useFoldingProviders && this.foldingModel) {
      const selectedProviders = FoldingController.getFoldingRangeProviders(this.languageFeaturesService, editorModel);
      if (selectedProviders.length > 0) {
        this.rangeProvider = new SyntaxRangeProvider(editorModel, selectedProviders, () => this.triggerFoldingModelChanged(), this._foldingLimitReporter, indentRangeProvider);
      }
    }
    return this.rangeProvider;
  }
  getFoldingModel() {
    return this.foldingModelPromise;
  }
  onDidChangeModelContent(e4) {
    this.hiddenRangeModel?.notifyChangeModelContent(e4);
    this.triggerFoldingModelChanged();
  }
  triggerFoldingModelChanged() {
    if (this.updateScheduler) {
      if (this.foldingRegionPromise) {
        this.foldingRegionPromise.cancel();
        this.foldingRegionPromise = null;
      }
      this.foldingModelPromise = this.updateScheduler.trigger(() => {
        const foldingModel = this.foldingModel;
        if (!foldingModel) {
          return null;
        }
        const sw = new StopWatch();
        const provider = this.getRangeProvider(foldingModel.textModel);
        const foldingRegionPromise = this.foldingRegionPromise = createCancelablePromise((token) => provider.compute(token));
        return foldingRegionPromise.then((foldingRanges) => {
          if (foldingRanges && foldingRegionPromise === this.foldingRegionPromise) {
            let scrollState;
            if (this._foldingImportsByDefault && !this._currentModelHasFoldedImports) {
              const hasChanges = foldingRanges.setCollapsedAllOfType(FoldingRangeKind.Imports.value, true);
              if (hasChanges) {
                scrollState = StableEditorScrollState.capture(this.editor);
                this._currentModelHasFoldedImports = hasChanges;
              }
            }
            const selections = this.editor.getSelections();
            foldingModel.update(foldingRanges, toSelectedLines(selections));
            scrollState?.restore(this.editor);
            const newValue = this.updateDebounceInfo.update(foldingModel.textModel, sw.elapsed());
            if (this.updateScheduler) {
              this.updateScheduler.defaultDelay = newValue;
            }
          }
          return foldingModel;
        });
      }).then(void 0, (err) => {
        onUnexpectedError(err);
        return null;
      });
    }
  }
  onHiddenRangesChanges(hiddenRanges) {
    if (this.hiddenRangeModel && hiddenRanges.length && !this._restoringViewState) {
      const selections = this.editor.getSelections();
      if (selections) {
        if (this.hiddenRangeModel.adjustSelections(selections)) {
          this.editor.setSelections(selections);
        }
      }
    }
    this.editor.setHiddenAreas(hiddenRanges, this);
  }
  onCursorPositionChanged() {
    if (this.hiddenRangeModel && this.hiddenRangeModel.hasRanges()) {
      this.cursorChangedScheduler.schedule();
    }
  }
  revealCursor() {
    const foldingModel = this.getFoldingModel();
    if (!foldingModel) {
      return;
    }
    foldingModel.then((foldingModel2) => {
      if (foldingModel2) {
        const selections = this.editor.getSelections();
        if (selections && selections.length > 0) {
          const toToggle = [];
          for (const selection of selections) {
            const lineNumber = selection.selectionStartLineNumber;
            if (this.hiddenRangeModel && this.hiddenRangeModel.isHidden(lineNumber)) {
              toToggle.push(...foldingModel2.getAllRegionsAtLine(lineNumber, (r2) => r2.isCollapsed && lineNumber > r2.startLineNumber));
            }
          }
          if (toToggle.length) {
            foldingModel2.toggleCollapseState(toToggle);
            this.reveal(selections[0].getPosition());
          }
        }
      }
    }).then(void 0, onUnexpectedError);
  }
  onEditorMouseDown(e4) {
    this.mouseDownInfo = null;
    if (!this.hiddenRangeModel || !e4.target || !e4.target.range) {
      return;
    }
    if (!e4.event.leftButton && !e4.event.middleButton) {
      return;
    }
    const range2 = e4.target.range;
    let iconClicked = false;
    switch (e4.target.type) {
      case 4 /* GUTTER_LINE_DECORATIONS */: {
        const data = e4.target.detail;
        const offsetLeftInGutter = e4.target.element.offsetLeft;
        const gutterOffsetX = data.offsetX - offsetLeftInGutter;
        if (gutterOffsetX < 4) {
          return;
        }
        iconClicked = true;
        break;
      }
      case 7 /* CONTENT_EMPTY */: {
        if (this._unfoldOnClickAfterEndOfLine && this.hiddenRangeModel.hasRanges()) {
          const data = e4.target.detail;
          if (!data.isAfterLines) {
            break;
          }
        }
        return;
      }
      case 6 /* CONTENT_TEXT */: {
        if (this.hiddenRangeModel.hasRanges()) {
          const model = this.editor.getModel();
          if (model && range2.startColumn === model.getLineMaxColumn(range2.startLineNumber)) {
            break;
          }
        }
        return;
      }
      default:
        return;
    }
    this.mouseDownInfo = { lineNumber: range2.startLineNumber, iconClicked };
  }
  onEditorMouseUp(e4) {
    const foldingModel = this.foldingModel;
    if (!foldingModel || !this.mouseDownInfo || !e4.target) {
      return;
    }
    const lineNumber = this.mouseDownInfo.lineNumber;
    const iconClicked = this.mouseDownInfo.iconClicked;
    const range2 = e4.target.range;
    if (!range2 || range2.startLineNumber !== lineNumber) {
      return;
    }
    if (iconClicked) {
      if (e4.target.type !== 4 /* GUTTER_LINE_DECORATIONS */) {
        return;
      }
    } else {
      const model = this.editor.getModel();
      if (!model || range2.startColumn !== model.getLineMaxColumn(lineNumber)) {
        return;
      }
    }
    const region = foldingModel.getRegionAtLine(lineNumber);
    if (region && region.startLineNumber === lineNumber) {
      const isCollapsed = region.isCollapsed;
      if (iconClicked || isCollapsed) {
        const surrounding = e4.event.altKey;
        let toToggle = [];
        if (surrounding) {
          const filter2 = (otherRegion) => !otherRegion.containedBy(region) && !region.containedBy(otherRegion);
          const toMaybeToggle = foldingModel.getRegionsInside(null, filter2);
          for (const r2 of toMaybeToggle) {
            if (r2.isCollapsed) {
              toToggle.push(r2);
            }
          }
          if (toToggle.length === 0) {
            toToggle = toMaybeToggle;
          }
        } else {
          const recursive = e4.event.middleButton || e4.event.shiftKey;
          if (recursive) {
            for (const r2 of foldingModel.getRegionsInside(region)) {
              if (r2.isCollapsed === isCollapsed) {
                toToggle.push(r2);
              }
            }
          }
          if (isCollapsed || !recursive || toToggle.length === 0) {
            toToggle.push(region);
          }
        }
        foldingModel.toggleCollapseState(toToggle);
        this.reveal({ lineNumber, column: 1 });
      }
    }
  }
  reveal(position2) {
    this.editor.revealPositionInCenterIfOutsideViewport(position2, 0 /* Smooth */);
  }
};

FoldingController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ILanguageConfigurationService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, ILanguageFeatureDebounceService),
  __decorateParam(5, ILanguageFeaturesService)
], FoldingController);

var RangesLimitReporter = class extends Disposable {
  constructor(editor) {
    super();
    this.editor = editor;
    this._onDidChange = this._register(new Emitter());
    this._computed = 0;
    this._limited = false;
  }
  get limit() {
    return this.editor.getOptions().get(56 /* foldingMaximumRegions */);
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get computed() {
    return this._computed;
  }
  get limited() {
    return this._limited;
  }
  update(computed, limited) {
    if (computed !== this._computed || limited !== this._limited) {
      this._computed = computed;
      this._limited = limited;
      this._onDidChange.fire();
    }
  }
};

var FoldingAction = class extends EditorAction {
  runEditorCommand(accessor, editor, args2) {
    const languageConfigurationService = accessor.get(ILanguageConfigurationService);
    const foldingController = FoldingController.get(editor);
    if (!foldingController) {
      return;
    }
    const foldingModelPromise = foldingController.getFoldingModel();
    if (foldingModelPromise) {
      this.reportTelemetry(accessor, editor);
      return foldingModelPromise.then((foldingModel) => {
        if (foldingModel) {
          this.invoke(foldingController, foldingModel, editor, args2, languageConfigurationService);
          const selection = editor.getSelection();
          if (selection) {
            foldingController.reveal(selection.getStartPosition());
          }
        }
      });
    }
  }
  getSelectedLines(editor) {
    const selections = editor.getSelections();
    return selections ? selections.map((s) => s.startLineNumber) : [];
  }
  getLineNumbers(args2, editor) {
    if (args2 && args2.selectionLines) {
      return args2.selectionLines.map((l) => l + 1);
    }
    return this.getSelectedLines(editor);
  }
  run(_accessor, _editor) {
  }
};

function toSelectedLines(selections) {
  if (!selections || selections.length === 0) {
    return {
      startsInside: () => false
    };
  }
  return {
    startsInside(startLine, endLine) {
      for (const s of selections) {
        const line = s.startLineNumber;
        if (line >= startLine && line <= endLine) {
          return true;
        }
      }
      return false;
    }
  };
}

function foldingArgumentsConstraint(args2) {
  if (!isUndefined(args2)) {
    if (!isObject(args2)) {
      return false;
    }
    const foldingArgs = args2;
    if (!isUndefined(foldingArgs.levels) && !isNumber(foldingArgs.levels)) {
      return false;
    }
    if (!isUndefined(foldingArgs.direction) && !isString(foldingArgs.direction)) {
      return false;
    }
    if (!isUndefined(foldingArgs.selectionLines) && (!Array.isArray(foldingArgs.selectionLines) || !foldingArgs.selectionLines.every(isNumber))) {
      return false;
    }
  }
  return true;
}

var UnfoldAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.unfold",
      label: localize2(1176, "Unfold"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 94 /* BracketRight */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 94 /* BracketRight */
        },
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: "Unfold the content in the editor",
        args: [
          {
            name: "Unfold editor argument",
            description: `Property-value pairs that can be passed through this argument:
						* 'levels': Number of levels to unfold. If not set, defaults to 1.
						* 'direction': If 'up', unfold given number of levels up otherwise unfolds down.
						* 'selectionLines': Array of the start lines (0-based) of the editor selections to apply the unfold action to. If not set, the active selection(s) will be used.
						`,
            constraint: foldingArgumentsConstraint,
            schema: {
              "type": "object",
              "properties": {
                "levels": {
                  "type": "number",
                  "default": 1
                },
                "direction": {
                  "type": "string",
                  "enum": ["up", "down"],
                  "default": "down"
                },
                "selectionLines": {
                  "type": "array",
                  "items": {
                    "type": "number"
                  }
                }
              }
            }
          }
        ]
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args2) {
    const levels = args2 && args2.levels || 1;
    const lineNumbers = this.getLineNumbers(args2, editor);
    if (args2 && args2.direction === "up") {
      setCollapseStateLevelsUp(foldingModel, false, levels, lineNumbers);
    } else {
      setCollapseStateLevelsDown(foldingModel, false, levels, lineNumbers);
    }
  }
};

var UnFoldRecursivelyAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.unfoldRecursively",
      label: localize2(1180, "Unfold Recursively"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 94 /* BracketRight */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, _args) {
    setCollapseStateLevelsDown(foldingModel, false, Number.MAX_VALUE, this.getSelectedLines(editor));
  }
};

var FoldAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.fold",
      label: localize2(1162, "Fold"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 92 /* BracketLeft */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 92 /* BracketLeft */
        },
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: "Fold the content in the editor",
        args: [
          {
            name: "Fold editor argument",
            description: `Property-value pairs that can be passed through this argument:
							* 'levels': Number of levels to fold.
							* 'direction': If 'up', folds given number of levels up otherwise folds down.
							* 'selectionLines': Array of the start lines (0-based) of the editor selections to apply the fold action to. If not set, the active selection(s) will be used.
							If no levels or direction is set, folds the region at the locations or if already collapsed, the first uncollapsed parent instead.
						`,
            constraint: foldingArgumentsConstraint,
            schema: {
              "type": "object",
              "properties": {
                "levels": {
                  "type": "number"
                },
                "direction": {
                  "type": "string",
                  "enum": ["up", "down"]
                },
                "selectionLines": {
                  "type": "array",
                  "items": {
                    "type": "number"
                  }
                }
              }
            }
          }
        ]
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args2) {
    const lineNumbers = this.getLineNumbers(args2, editor);
    const levels = args2 && args2.levels;
    const direction = args2 && args2.direction;
    if (typeof levels !== "number" && typeof direction !== "string") {
      setCollapseStateUp(foldingModel, true, lineNumbers);
    } else {
      if (direction === "up") {
        setCollapseStateLevelsUp(foldingModel, true, levels || 1, lineNumbers);
      } else {
        setCollapseStateLevelsDown(foldingModel, true, levels || 1, lineNumbers);
      }
    }
  }
};

var ToggleFoldAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.toggleFold",
      label: localize2(1173, "Toggle Fold"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 42 /* KeyL */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    toggleCollapseState(foldingModel, 1, selectedLines);
  }
};

var FoldRecursivelyAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.foldRecursively",
      label: localize2(1168, "Fold Recursively"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 92 /* BracketLeft */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    setCollapseStateLevelsDown(foldingModel, true, Number.MAX_VALUE, selectedLines);
  }
};

var ToggleFoldRecursivelyAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.toggleFoldRecursively",
      label: localize2(1174, "Toggle Fold Recursively"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 42 /* KeyL */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    toggleCollapseState(foldingModel, Number.MAX_VALUE, selectedLines);
  }
};

var FoldAllBlockCommentsAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.foldAllBlockComments",
      label: localize2(1164, "Fold All Block Comments"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 90 /* Slash */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args2, languageConfigurationService) {
    if (foldingModel.regions.hasTypes()) {
      setCollapseStateForType(foldingModel, FoldingRangeKind.Comment.value, true);
    } else {
      const editorModel = editor.getModel();
      if (!editorModel) {
        return;
      }
      const comments = languageConfigurationService.getLanguageConfiguration(editorModel.getLanguageId()).comments;
      if (comments && comments.blockCommentStartToken) {
        const regExp = new RegExp("^\\s*" + escapeRegExpCharacters(comments.blockCommentStartToken));
        setCollapseStateForMatchingLines(foldingModel, regExp, true);
      }
    }
  }
};

var FoldAllRegionsAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.foldAllMarkerRegions",
      label: localize2(1166, "Fold All Regions"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 29 /* Digit8 */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args2, languageConfigurationService) {
    if (foldingModel.regions.hasTypes()) {
      setCollapseStateForType(foldingModel, FoldingRangeKind.Region.value, true);
    } else {
      const editorModel = editor.getModel();
      if (!editorModel) {
        return;
      }
      const foldingRules = languageConfigurationService.getLanguageConfiguration(editorModel.getLanguageId()).foldingRules;
      if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
        const regExp = new RegExp(foldingRules.markers.start);
        setCollapseStateForMatchingLines(foldingModel, regExp, true);
      }
    }
  }
};

var UnfoldAllRegionsAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.unfoldAllMarkerRegions",
      label: localize2(1179, "Unfold All Regions"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 30 /* Digit9 */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args2, languageConfigurationService) {
    if (foldingModel.regions.hasTypes()) {
      setCollapseStateForType(foldingModel, FoldingRangeKind.Region.value, false);
    } else {
      const editorModel = editor.getModel();
      if (!editorModel) {
        return;
      }
      const foldingRules = languageConfigurationService.getLanguageConfiguration(editorModel.getLanguageId()).foldingRules;
      if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
        const regExp = new RegExp(foldingRules.markers.start);
        setCollapseStateForMatchingLines(foldingModel, regExp, false);
      }
    }
  }
};

var FoldAllExceptAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.foldAllExcept",
      label: localize2(1165, "Fold All Except Selected"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 88 /* Minus */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    setCollapseStateForRest(foldingModel, true, selectedLines);
  }
};

var UnfoldAllExceptAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.unfoldAllExcept",
      label: localize2(1178, "Unfold All Except Selected"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 86 /* Equal */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    setCollapseStateForRest(foldingModel, false, selectedLines);
  }
};

var FoldAllAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.foldAll",
      label: localize2(1163, "Fold All"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 21 /* Digit0 */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, _editor) {
    setCollapseStateLevelsDown(foldingModel, true);
  }
};

var UnfoldAllAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.unfoldAll",
      label: localize2(1177, "Unfold All"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 40 /* KeyJ */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, _editor) {
    setCollapseStateLevelsDown(foldingModel, false);
  }
};

var FoldLevelAction = class _FoldLevelAction extends FoldingAction {
  static {
    this.ID_PREFIX = "editor.foldLevel";
  }
  static {
    this.ID = (level) => _FoldLevelAction.ID_PREFIX + level;
  }
  getFoldingLevel() {
    return parseInt(this.id.substr(_FoldLevelAction.ID_PREFIX.length));
  }
  invoke(_foldingController, foldingModel, editor) {
    setCollapseStateAtLevel(foldingModel, this.getFoldingLevel(), true, this.getSelectedLines(editor));
  }
};

var GotoParentFoldAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.gotoParentFold",
      label: localize2(1170, "Go to Parent Fold"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    if (selectedLines.length > 0) {
      const startLineNumber = getParentFoldLine(selectedLines[0], foldingModel);
      if (startLineNumber !== null) {
        editor.setSelection({
          startLineNumber,
          startColumn: 1,
          endLineNumber: startLineNumber,
          endColumn: 1
        });
      }
    }
  }
};

var GotoPreviousFoldAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.gotoPreviousFold",
      label: localize2(1171, "Go to Previous Folding Range"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    if (selectedLines.length > 0) {
      const startLineNumber = getPreviousFoldLine(selectedLines[0], foldingModel);
      if (startLineNumber !== null) {
        editor.setSelection({
          startLineNumber,
          startColumn: 1,
          endLineNumber: startLineNumber,
          endColumn: 1
        });
      }
    }
  }
};

var GotoNextFoldAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.gotoNextFold",
      label: localize2(1169, "Go to Next Folding Range"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    if (selectedLines.length > 0) {
      const startLineNumber = getNextFoldLine(selectedLines[0], foldingModel);
      if (startLineNumber !== null) {
        editor.setSelection({
          startLineNumber,
          startColumn: 1,
          endLineNumber: startLineNumber,
          endColumn: 1
        });
      }
    }
  }
};

var FoldRangeFromSelectionAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.createFoldingRangeFromSelection",
      label: localize2(1161, "Create Folding Range from Selection"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 87 /* Comma */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const collapseRanges = [];
    const selections = editor.getSelections();
    if (selections) {
      for (const selection of selections) {
        let endLineNumber = selection.endLineNumber;
        if (selection.endColumn === 1) {
          --endLineNumber;
        }
        if (endLineNumber > selection.startLineNumber) {
          collapseRanges.push({
            startLineNumber: selection.startLineNumber,
            endLineNumber,
            type: void 0,
            isCollapsed: true,
            source: 1 /* userDefined */
          });
          editor.setSelection({
            startLineNumber: selection.startLineNumber,
            startColumn: 1,
            endLineNumber: selection.startLineNumber,
            endColumn: 1
          });
        }
      }
      if (collapseRanges.length > 0) {
        collapseRanges.sort((a, b) => {
          return a.startLineNumber - b.startLineNumber;
        });
        const newRanges = FoldingRegions.sanitizeAndMerge(foldingModel.regions, collapseRanges, editor.getModel()?.getLineCount());
        foldingModel.updatePost(FoldingRegions.fromFoldRanges(newRanges));
      }
    }
  }
};

var RemoveFoldRangeFromSelectionAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.removeManualFoldingRanges",
      label: localize2(1172, "Remove Manual Folding Ranges"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 89 /* Period */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  invoke(foldingController, foldingModel, editor) {
    const selections = editor.getSelections();
    if (selections) {
      foldingModel.removeManualRanges(selections);
      foldingController.triggerFoldingModelChanged();
    }
  }
};

var ToggleImportFoldAction = class extends FoldingAction {
  constructor() {
    super({
      id: "editor.toggleImportFold",
      label: localize2(1175, "Toggle Import Fold"),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        weight: 100 /* EditorContrib */
      }
    });
  }
  async invoke(foldingController, foldingModel) {
    const regionsToToggle = [];
    const regions = foldingModel.regions;
    for (let i2 = regions.length - 1; i2 >= 0; i2--) {
      if (regions.getType(i2) === FoldingRangeKind.Imports.value) {
        regionsToToggle.push(regions.toRegion(i2));
      }
    }
    foldingModel.toggleCollapseState(regionsToToggle);
    foldingController.triggerFoldingModelChanged();
  }
};

registerEditorContribution(FoldingController.ID, FoldingController, 0 /* Eager */);

registerEditorAction(UnfoldAction);

registerEditorAction(UnFoldRecursivelyAction);

registerEditorAction(FoldAction);

registerEditorAction(FoldRecursivelyAction);

registerEditorAction(ToggleFoldRecursivelyAction);

registerEditorAction(FoldAllAction);

registerEditorAction(UnfoldAllAction);

registerEditorAction(FoldAllBlockCommentsAction);

registerEditorAction(FoldAllRegionsAction);

registerEditorAction(UnfoldAllRegionsAction);

registerEditorAction(FoldAllExceptAction);

registerEditorAction(UnfoldAllExceptAction);

registerEditorAction(ToggleFoldAction);

registerEditorAction(GotoParentFoldAction);

registerEditorAction(GotoPreviousFoldAction);

registerEditorAction(GotoNextFoldAction);

registerEditorAction(FoldRangeFromSelectionAction);

registerEditorAction(RemoveFoldRangeFromSelectionAction);

registerEditorAction(ToggleImportFoldAction);

for (let i2 = 1; i2 <= 7; i2++) {
  registerInstantiatedEditorAction(
    new FoldLevelAction({
      id: FoldLevelAction.ID(i2),
      label: localize2(1167, "Fold Level {0}", i2),
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 21 /* Digit0 */ + i2),
        weight: 100 /* EditorContrib */
      }
    })
  );
}

CommandsRegistry.registerCommand("_executeFoldingRangeProvider", async function(accessor, ...args2) {
  const [resource] = args2;
  if (!(resource instanceof URI)) {
    throw illegalArgument();
  }
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const model = accessor.get(IModelService).getModel(resource);
  if (!model) {
    throw illegalArgument();
  }
  const configurationService = accessor.get(IConfigurationService);
  if (!configurationService.getValue("editor.folding", { resource })) {
    return [];
  }
  const languageConfigurationService = accessor.get(ILanguageConfigurationService);
  const strategy = configurationService.getValue("editor.foldingStrategy", { resource });
  const foldingLimitReporter = {
    get limit() {
      return configurationService.getValue("editor.foldingMaximumRegions", { resource });
    },
    update: (computed, limited) => {
    }
  };
  const indentRangeProvider = new IndentRangeProvider(model, languageConfigurationService, foldingLimitReporter);
  let rangeProvider = indentRangeProvider;
  if (strategy !== "indentation") {
    const providers2 = FoldingController.getFoldingRangeProviders(languageFeaturesService, model);
    if (providers2.length) {
      rangeProvider = new SyntaxRangeProvider(model, providers2, () => {
      }, foldingLimitReporter, indentRangeProvider);
    }
  }
  const ranges = await rangeProvider.compute(CancellationToken.None);
  const result = [];
  try {
    if (ranges) {
      for (let i2 = 0; i2 < ranges.length; i2++) {
        const type = ranges.getType(i2);
        result.push({ start: ranges.getStartLineNumber(i2), end: ranges.getEndLineNumber(i2), kind: type ? FoldingRangeKind.fromValue(type) : void 0 });
      }
    }
    return result;
  } finally {
    rangeProvider.dispose();
  }
});
export { toSelectedLines, foldingArgumentsConstraint, CONTEXT_FOLDING_ENABLED, FoldingController, RangesLimitReporter, FoldingAction, UnfoldAction, UnFoldRecursivelyAction, FoldAction, ToggleFoldAction, FoldRecursivelyAction, ToggleFoldRecursivelyAction, FoldAllBlockCommentsAction, FoldAllRegionsAction, UnfoldAllRegionsAction, FoldAllExceptAction, UnfoldAllExceptAction, FoldAllAction, UnfoldAllAction, FoldLevelAction, GotoParentFoldAction, GotoPreviousFoldAction, GotoNextFoldAction, FoldRangeFromSelectionAction, RemoveFoldRangeFromSelectionAction, ToggleImportFoldAction };
