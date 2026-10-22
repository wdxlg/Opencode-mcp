// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/breakpointWidget.ts
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Range2 } from "./module-0106.mjs";
import { editorForeground } from "./module-0229.mjs";
import { ZoneWidget } from "./module-0622.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { SelectBox } from "./module-0475.mjs";
import { defaultButtonStyles, defaultSelectBoxStyles } from "./module-0513.mjs";
import { hasNativeContextMenu } from "./module-0515.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { Button } from "./module-0546.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { getSimpleCodeEditorWidgetOptions, getSimpleEditorOptions } from "./module-1813.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { BREAKPOINT_EDITOR_CONTRIBUTION_ID, CONTEXT_BREAKPOINT_WIDGET_VISIBLE, CONTEXT_IN_BREAKPOINT_WIDGET, DEBUG_SCHEME, IDebugService } from "./module-1058.mjs";
import { URI } from "./module-0032.mjs";
import { CompletionOptions, provideSuggestionItems } from "./module-0696.mjs";
import { Position } from "./module-0079.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IModelService } from "./module-0080.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IHoverService } from "./module-0520.mjs";
import { EditorCommand, registerEditorCommand } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/workbench/contrib/debug/browser/breakpointWidget.ts
var $63 = $;

var IPrivateBreakpointWidgetService = createDecorator("privateBreakpointWidgetService");

var DECORATION_KEY = "breakpointwidgetdecoration";

function isPositionInCurlyBracketBlock(input) {
  const model = input.getModel();
  const bracketPairs = model.bracketPairs.getBracketPairsInRange(Range2.fromPositions(input.getPosition()));
  return bracketPairs.some((p) => p.openingBracketInfo.bracketText === "{");
}

function createDecorations(theme, placeHolder) {
  const transparentForeground = theme.getColor(editorForeground)?.transparent(0.4);
  return [{
    range: {
      startLineNumber: 0,
      endLineNumber: 0,
      startColumn: 0,
      endColumn: 1
    },
    renderOptions: {
      after: {
        contentText: placeHolder,
        color: transparentForeground ? transparentForeground.toString() : void 0
      }
    }
  }];
}

var BreakpointWidget = class extends ZoneWidget {
  constructor(editor, lineNumber, column, context2, contextViewService, debugService, themeService, instantiationService, modelService, codeEditorService, _configurationService, languageFeaturesService, keybindingService, labelService, textModelService, hoverService) {
    super(editor, { showFrame: true, showArrow: false, frameWidth: 1, isAccessible: true });
    this.lineNumber = lineNumber;
    this.column = column;
    this.contextViewService = contextViewService;
    this.debugService = debugService;
    this.themeService = themeService;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.codeEditorService = codeEditorService;
    this._configurationService = _configurationService;
    this.languageFeaturesService = languageFeaturesService;
    this.keybindingService = keybindingService;
    this.labelService = labelService;
    this.textModelService = textModelService;
    this.hoverService = hoverService;
    this.conditionInput = "";
    this.hitCountInput = "";
    this.logMessageInput = "";
    this.availableBreakpoints = [];
    this.store = new DisposableStore();
    const model = this.editor.getModel();
    if (model) {
      const uri4 = model.uri;
      const breakpoints = this.debugService.getModel().getBreakpoints({ lineNumber: this.lineNumber, column: this.column, uri: uri4 });
      this.breakpoint = breakpoints.length ? breakpoints[0] : void 0;
    }
    if (context2 === void 0) {
      if (this.breakpoint && !this.breakpoint.condition && !this.breakpoint.hitCondition && this.breakpoint.logMessage) {
        this.context = 2 /* LOG_MESSAGE */;
      } else if (this.breakpoint && !this.breakpoint.condition && this.breakpoint.hitCondition) {
        this.context = 1 /* HIT_COUNT */;
      } else if (this.breakpoint && this.breakpoint.triggeredBy) {
        this.context = 3 /* TRIGGER_POINT */;
      } else {
        this.context = 0 /* CONDITION */;
      }
    } else {
      this.context = context2;
    }
    this.store.add(this.debugService.getModel().onDidChangeBreakpoints((e4) => {
      if (this.breakpoint && e4 && e4.removed && e4.removed.indexOf(this.breakpoint) >= 0) {
        this.dispose();
      }
      if (this.context === 3 /* TRIGGER_POINT */ && this.selectBreakpointBox) {
        this.updateTriggerBreakpointList();
      }
    }));
    this.store.add(this.codeEditorService.registerDecorationType("breakpoint-widget", DECORATION_KEY, {}));
    this.create();
  }
  get placeholder() {
    const acceptString = this.keybindingService.lookupKeybinding(AcceptBreakpointWidgetInputAction.ID)?.getLabel() || "Enter";
    const closeString = this.keybindingService.lookupKeybinding(CloseBreakpointWidgetCommand.ID)?.getLabel() || "Escape";
    switch (this.context) {
      case 2 /* LOG_MESSAGE */:
        return localize(14214, null, acceptString, closeString);
      case 1 /* HIT_COUNT */:
        return localize(14213, null, acceptString, closeString);
      default:
        return localize(14212, null, acceptString, closeString);
    }
  }
  getInputValue(breakpoint2) {
    switch (this.context) {
      case 2 /* LOG_MESSAGE */:
        return breakpoint2 && breakpoint2.logMessage ? breakpoint2.logMessage : this.logMessageInput;
      case 1 /* HIT_COUNT */:
        return breakpoint2 && breakpoint2.hitCondition ? breakpoint2.hitCondition : this.hitCountInput;
      default:
        return breakpoint2 && breakpoint2.condition ? breakpoint2.condition : this.conditionInput;
    }
  }
  rememberInput() {
    if (this.context !== 3 /* TRIGGER_POINT */) {
      const value2 = this.input.getModel().getValue();
      switch (this.context) {
        case 2 /* LOG_MESSAGE */:
          this.logMessageInput = value2;
          break;
        case 1 /* HIT_COUNT */:
          this.hitCountInput = value2;
          break;
        default:
          this.conditionInput = value2;
      }
    }
  }
  setInputMode() {
    if (this.editor.hasModel()) {
      const languageId = this.context === 2 /* LOG_MESSAGE */ ? PLAINTEXT_LANGUAGE_ID : this.editor.getModel().getLanguageId();
      this.input.getModel().setLanguage(languageId);
    }
  }
  show(rangeOrPos) {
    const lineNum = this.input.getModel().getLineCount();
    super.show(rangeOrPos, lineNum + 1);
  }
  fitHeightToContent() {
    const lineNum = this.input.getModel().getLineCount();
    this._relayout(lineNum + 1);
  }
  _fillContainer(container2) {
    this.setCssClass("breakpoint-widget");
    const selectBox = this.store.add(new SelectBox([
      { text: localize(14215, null) },
      { text: localize(14216, null) },
      { text: localize(14217, null) },
      { text: localize(14223, null) }
    ], this.context, this.contextViewService, defaultSelectBoxStyles, { ariaLabel: localize(14211, null), useCustomDrawn: !hasNativeContextMenu(this._configurationService) }));
    this.selectContainer = $63(".breakpoint-select-container");
    selectBox.render(append(container2, this.selectContainer));
    this.store.add(selectBox.onDidSelect((e4) => {
      this.rememberInput();
      this.context = e4.index;
      this.updateContextInput();
    }));
    this.createModesInput(container2);
    this.inputContainer = $63(".inputContainer");
    this.store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.inputContainer, this.placeholder));
    this.createBreakpointInput(append(container2, this.inputContainer));
    this.input.getModel().setValue(this.getInputValue(this.breakpoint));
    this.store.add(this.input.getModel().onDidChangeContent(() => {
      this.fitHeightToContent();
    }));
    this.input.setPosition({ lineNumber: 1, column: this.input.getModel().getLineMaxColumn(1) });
    this.createTriggerBreakpointInput(container2);
    this.updateContextInput();
    setTimeout(() => this.focusInput(), 150);
  }
  createModesInput(container2) {
    const modes = this.debugService.getModel().getBreakpointModes("source");
    if (modes.length <= 1) {
      return;
    }
    const sb = this.selectModeBox = new SelectBox(
      [
        { text: localize(14210, null), isDisabled: true },
        ...modes.map((mode) => ({ text: mode.label, description: mode.description }))
      ],
      modes.findIndex((m) => m.mode === this.breakpoint?.mode) + 1,
      this.contextViewService,
      defaultSelectBoxStyles,
      { useCustomDrawn: !hasNativeContextMenu(this._configurationService) }
    );
    this.store.add(sb);
    this.store.add(sb.onDidSelect((e4) => {
      this.modeInput = modes[e4.index - 1];
    }));
    const modeWrapper = $63(".select-mode-container");
    const selectionWrapper = $63(".select-box-container");
    append(modeWrapper, selectionWrapper);
    sb.render(selectionWrapper);
    append(container2, modeWrapper);
  }
  createTriggerBreakpointInput(container2) {
    this.availableBreakpoints = this.debugService.getModel().getBreakpoints().filter((bp) => bp !== this.breakpoint && !bp.logMessage);
    const breakpointOptions = this.buildBreakpointOptions();
    const index2 = this.availableBreakpoints.findIndex((bp) => this.breakpoint?.triggeredBy === bp.getId());
    let selectedIndex = 0;
    if (index2 !== -1) {
      this.triggeredByBreakpointInput = this.availableBreakpoints[index2];
      selectedIndex = index2 + 1;
    } else if (!this.breakpoint?.triggeredBy && this.availableBreakpoints.length > 0) {
      this.triggeredByBreakpointInput = this.availableBreakpoints[0];
      selectedIndex = 1;
    } else {
      this.triggeredByBreakpointInput = void 0;
    }
    const selectBreakpointBox = this.selectBreakpointBox = this.store.add(new SelectBox(breakpointOptions, selectedIndex, this.contextViewService, defaultSelectBoxStyles, { ariaLabel: localize(14221, null), useCustomDrawn: !hasNativeContextMenu(this._configurationService) }));
    this.store.add(selectBreakpointBox.onDidSelect((e4) => {
      if (e4.index === 0) {
        this.triggeredByBreakpointInput = void 0;
      } else {
        this.triggeredByBreakpointInput = this.availableBreakpoints[e4.index - 1];
      }
    }));
    this.selectBreakpointContainer = $63(".select-breakpoint-container");
    this.store.add(addDisposableListener(this.selectBreakpointContainer, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(9 /* Escape */)) {
        this.close(false);
      }
    }));
    const selectionWrapper = $63(".select-box-container");
    append(this.selectBreakpointContainer, selectionWrapper);
    selectBreakpointBox.render(selectionWrapper);
    append(container2, this.selectBreakpointContainer);
    const closeButton = new Button(this.selectBreakpointContainer, defaultButtonStyles);
    closeButton.label = localize(14220, null);
    this.store.add(closeButton.onDidClick(() => this.close(true)));
    this.store.add(closeButton);
  }
  buildBreakpointOptions() {
    const breakpointOptions = [
      { text: localize(14219, null), isDisabled: true },
      ...this.availableBreakpoints.map((bp) => ({
        text: `${this.labelService.getUriLabel(bp.uri, { relative: true })}: ${bp.lineNumber}`,
        description: localize(14222, null)
      }))
    ];
    for (const [i2, bp] of this.availableBreakpoints.entries()) {
      this.textModelService.createModelReference(bp.uri).then((ref) => {
        try {
          breakpointOptions[i2 + 1].description = ref.object.textEditorModel.getLineContent(bp.lineNumber).trim();
        } finally {
          ref.dispose();
        }
      }).catch(() => {
        breakpointOptions[i2 + 1].description = localize(14218, null);
      });
    }
    return breakpointOptions;
  }
  updateTriggerBreakpointList() {
    this.availableBreakpoints = this.debugService.getModel().getBreakpoints().filter((bp) => bp !== this.breakpoint && !bp.logMessage);
    let selectedIndex = 0;
    if (this.triggeredByBreakpointInput) {
      const newIndex = this.availableBreakpoints.findIndex((bp) => bp.getId() === this.triggeredByBreakpointInput?.getId());
      if (newIndex !== -1) {
        selectedIndex = newIndex + 1;
      } else {
        this.triggeredByBreakpointInput = void 0;
      }
    }
    const breakpointOptions = this.buildBreakpointOptions();
    this.selectBreakpointBox.setOptions(breakpointOptions, selectedIndex);
  }
  updateContextInput() {
    if (this.context === 3 /* TRIGGER_POINT */) {
      this.inputContainer.hidden = true;
      this.selectBreakpointContainer.hidden = false;
      if (this.selectBreakpointBox) {
        this.updateTriggerBreakpointList();
      }
    } else {
      this.inputContainer.hidden = false;
      this.selectBreakpointContainer.hidden = true;
      this.setInputMode();
      const value2 = this.getInputValue(this.breakpoint);
      this.input.getModel().setValue(value2);
      this.focusInput();
    }
  }
  _doLayout(heightInPixel, widthInPixel) {
    this.heightInPx = heightInPixel;
    this.input.layout({ height: heightInPixel, width: widthInPixel - 113 });
    this.centerInputVertically();
  }
  _onWidth(widthInPixel) {
    if (typeof this.heightInPx === "number") {
      this._doLayout(this.heightInPx, widthInPixel);
    }
  }
  createBreakpointInput(container2) {
    const scopedInstatiationService = this.instantiationService.createChild(new ServiceCollection(
      [IPrivateBreakpointWidgetService, this]
    ));
    this.store.add(scopedInstatiationService);
    const options3 = this.createEditorOptions();
    const codeEditorWidgetOptions = getSimpleCodeEditorWidgetOptions();
    this.input = scopedInstatiationService.createInstance(CodeEditorWidget, container2, options3, codeEditorWidgetOptions);
    CONTEXT_IN_BREAKPOINT_WIDGET.bindTo(this.input.contextKeyService).set(true);
    const model = this.modelService.createModel("", null, URI.parse(`${DEBUG_SCHEME}:${this.editor.getId()}:breakpointinput`), true);
    if (this.editor.hasModel()) {
      model.setLanguage(this.editor.getModel().getLanguageId());
    }
    this.input.setModel(model);
    this.setInputMode();
    this.store.add(model);
    const setDecorations = () => {
      const value2 = this.input.getModel().getValue();
      const decorations = !!value2 ? [] : createDecorations(this.themeService.getColorTheme(), this.placeholder);
      this.input.setDecorationsByType("breakpoint-widget", DECORATION_KEY, decorations);
    };
    this.store.add(this.input.getModel().onDidChangeContent(() => setDecorations()));
    this.store.add(this.themeService.onDidColorThemeChange(() => setDecorations()));
    this.store.add(this.languageFeaturesService.completionProvider.register({ scheme: DEBUG_SCHEME, hasAccessToAllModels: true }, {
      _debugDisplayName: "breakpointWidget",
      provideCompletionItems: (model2, position2, _context, token) => {
        let suggestionsPromise;
        const underlyingModel = this.editor.getModel();
        if (underlyingModel && (this.context === 0 /* CONDITION */ || this.context === 2 /* LOG_MESSAGE */ && isPositionInCurlyBracketBlock(this.input))) {
          suggestionsPromise = provideSuggestionItems(this.languageFeaturesService.completionProvider, underlyingModel, new Position(this.lineNumber, 1), new CompletionOptions(void 0, (/* @__PURE__ */ new Set()).add(28 /* Snippet */)), _context, token).then((suggestions) => {
            let overwriteBefore = 0;
            if (this.context === 0 /* CONDITION */) {
              overwriteBefore = position2.column - 1;
            } else {
              const value2 = this.input.getModel().getValue();
              while (position2.column - 2 - overwriteBefore >= 0 && value2[position2.column - 2 - overwriteBefore] !== "{" && value2[position2.column - 2 - overwriteBefore] !== " ") {
                overwriteBefore++;
              }
            }
            return {
              suggestions: suggestions.items.map((s) => {
                s.completion.range = Range2.fromPositions(position2.delta(0, -overwriteBefore), position2);
                return s.completion;
              })
            };
          });
        } else {
          suggestionsPromise = Promise.resolve({ suggestions: [] });
        }
        return suggestionsPromise;
      }
    }));
    this.store.add(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("editor.fontSize") || e4.affectsConfiguration("editor.lineHeight")) {
        this.input.updateOptions(this.createEditorOptions());
        this.centerInputVertically();
      }
    }));
  }
  createEditorOptions() {
    const editorConfig = this._configurationService.getValue("editor");
    const options3 = getSimpleEditorOptions(this._configurationService);
    options3.fontSize = editorConfig.fontSize;
    options3.fontFamily = editorConfig.fontFamily;
    options3.lineHeight = editorConfig.lineHeight;
    options3.fontLigatures = editorConfig.fontLigatures;
    options3.ariaLabel = this.placeholder;
    return options3;
  }
  centerInputVertically() {
    if (this.container && typeof this.heightInPx === "number") {
      const lineHeight = this.input.getOption(75 /* lineHeight */);
      const lineNum = this.input.getModel().getLineCount();
      const newTopMargin = (this.heightInPx - lineNum * lineHeight) / 2;
      this.inputContainer.style.marginTop = newTopMargin + "px";
    }
  }
  close(success) {
    if (success) {
      let condition = void 0;
      let hitCondition = void 0;
      let logMessage = void 0;
      let triggeredBy = void 0;
      let mode = void 0;
      let modeLabel = void 0;
      this.rememberInput();
      if (this.conditionInput || this.context === 0 /* CONDITION */) {
        condition = this.conditionInput;
      }
      if (this.hitCountInput || this.context === 1 /* HIT_COUNT */) {
        hitCondition = this.hitCountInput;
      }
      if (this.logMessageInput || this.context === 2 /* LOG_MESSAGE */) {
        logMessage = this.logMessageInput;
      }
      if (this.selectModeBox) {
        mode = this.modeInput?.mode;
        modeLabel = this.modeInput?.label;
      }
      if (this.context === 3 /* TRIGGER_POINT */) {
        condition = void 0;
        hitCondition = void 0;
        logMessage = void 0;
        triggeredBy = this.triggeredByBreakpointInput?.getId();
      }
      if (this.breakpoint) {
        const data = /* @__PURE__ */ new Map();
        data.set(this.breakpoint.getId(), {
          condition,
          hitCondition,
          logMessage,
          triggeredBy,
          mode,
          modeLabel
        });
        this.debugService.updateBreakpoints(this.breakpoint.originalUri, data, false).then(void 0, onUnexpectedError);
      } else {
        const model = this.editor.getModel();
        if (model) {
          this.debugService.addBreakpoints(model.uri, [{
            lineNumber: this.lineNumber,
            column: this.column,
            enabled: true,
            condition,
            hitCondition,
            logMessage,
            triggeredBy,
            mode,
            modeLabel
          }]);
        }
      }
    }
    this.dispose();
  }
  focusInput() {
    if (this.context === 3 /* TRIGGER_POINT */) {
      this.selectBreakpointBox.focus();
    } else {
      this.input.focus();
    }
  }
  dispose() {
    super.dispose();
    this.input.dispose();
    dispose(this.store);
    setTimeout(() => this.editor.focus(), 0);
  }
};

BreakpointWidget = __decorateClass([
  __decorateParam(4, IContextViewService),
  __decorateParam(5, IDebugService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IModelService),
  __decorateParam(9, ICodeEditorService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, ILanguageFeaturesService),
  __decorateParam(12, IKeybindingService),
  __decorateParam(13, ILabelService),
  __decorateParam(14, ITextModelService),
  __decorateParam(15, IHoverService)
], BreakpointWidget);

var AcceptBreakpointWidgetInputAction = class _AcceptBreakpointWidgetInputAction extends EditorCommand {
  static {
    this.ID = "breakpointWidget.action.acceptInput";
  }
  constructor() {
    super({
      id: _AcceptBreakpointWidgetInputAction.ID,
      precondition: CONTEXT_BREAKPOINT_WIDGET_VISIBLE,
      kbOpts: {
        kbExpr: CONTEXT_IN_BREAKPOINT_WIDGET,
        primary: 3 /* Enter */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  runEditorCommand(accessor, editor) {
    accessor.get(IPrivateBreakpointWidgetService).close(true);
  }
};

var CloseBreakpointWidgetCommand = class _CloseBreakpointWidgetCommand extends EditorCommand {
  static {
    this.ID = "closeBreakpointWidget";
  }
  constructor() {
    super({
      id: _CloseBreakpointWidgetCommand.ID,
      precondition: CONTEXT_BREAKPOINT_WIDGET_VISIBLE,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 9 /* Escape */,
        secondary: [1024 /* Shift */ | 9 /* Escape */],
        weight: 100 /* EditorContrib */
      }
    });
  }
  runEditorCommand(accessor, editor, args2) {
    const debugContribution = editor.getContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID);
    if (debugContribution) {
      return debugContribution.closeBreakpointWidget();
    }
    accessor.get(IPrivateBreakpointWidgetService).close(false);
  }
};

registerEditorCommand(new AcceptBreakpointWidgetInputAction());

registerEditorCommand(new CloseBreakpointWidgetCommand());
export { isPositionInCurlyBracketBlock, createDecorations, $63, IPrivateBreakpointWidgetService, DECORATION_KEY, BreakpointWidget, AcceptBreakpointWidgetInputAction, CloseBreakpointWidgetCommand };
