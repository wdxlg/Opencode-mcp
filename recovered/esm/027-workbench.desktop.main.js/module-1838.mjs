// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput.ts
import { Widget } from "./module-0252.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, append } from "./module-0075.mjs";
import { mixin } from "./module-0098.mjs";
import { getSimpleEditorOptions, setupSimpleEditorSelectionStyling } from "./module-1837.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { SuggestController } from "./module-0758.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { ContextMenuController } from "./module-0664.mjs";
import { MenuPreventer } from "./module-1340.mjs";
import { SelectionClipboardContributionID } from "./module-1361.mjs";
import { URI } from "./module-0032.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { ensureValidWordDefinition, getWordAtText } from "./module-0103.mjs";
import { Range2 } from "./module-0106.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Position } from "./module-0079.mjs";
import { asCssVariable, asCssVariableWithDefault } from "./module-0226.mjs";
import { inputBackground, inputBorder, inputForeground, inputPlaceholderForeground } from "./module-0233.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { HistoryNavigator } from "./module-0599.mjs";
import { registerAndCreateHistoryNavigationContext } from "./module-0603.mjs";
import { DEFAULT_FONT_FAMILY } from "./module-0312.mjs";


// src/vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput.ts
var SuggestEnabledInput = class extends Widget {
  constructor(id2, parent, suggestionProvider, ariaLabel, resourceHandle, options3, defaultInstantiationService, modelService, contextKeyService, languageFeaturesService, configurationService) {
    super();
    this._onShouldFocusResults = this._register(new Emitter());
    this.onShouldFocusResults = this._onShouldFocusResults.event;
    this._onInputDidChange = this._register(new Emitter());
    this.onInputDidChange = this._onInputDidChange.event;
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = this._register(new Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this.stylingContainer = append(parent, $(".suggest-input-container"));
    this.element = parent;
    this.placeholderText = append(this.stylingContainer, $(".suggest-input-placeholder", void 0, options3.placeholderText || ""));
    const editorOptions2 = mixin(
      getSimpleEditorOptions(configurationService),
      getSuggestEnabledInputOptions(ariaLabel)
    );
    editorOptions2.overflowWidgetsDomNode = options3.overflowWidgetsDomNode;
    const scopedContextKeyService = this.getScopedContextKeyService(contextKeyService);
    const instantiationService = scopedContextKeyService ? this._register(defaultInstantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService]))) : defaultInstantiationService;
    this.inputWidget = this._register(instantiationService.createInstance(
      CodeEditorWidget,
      this.stylingContainer,
      editorOptions2,
      {
        contributions: EditorExtensionsRegistry.getSomeEditorContributions([
          SuggestController.ID,
          SnippetController2.ID,
          ContextMenuController.ID,
          MenuPreventer.ID,
          SelectionClipboardContributionID
        ]),
        isSimpleWidget: true
      }
    ));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor.accessibilitySupport") || e.affectsConfiguration("editor.cursorBlinking")) {
        const accessibilitySupport = configurationService.getValue("editor.accessibilitySupport");
        const cursorBlinking = configurationService.getValue("editor.cursorBlinking");
        this.inputWidget.updateOptions({
          accessibilitySupport,
          cursorBlinking
        });
      }
    }));
    this._register(this.inputWidget.onDidFocusEditorText(() => this._onDidFocus.fire()));
    this._register(this.inputWidget.onDidBlurEditorText(() => this._onDidBlur.fire()));
    const scopeHandle = URI.parse(resourceHandle);
    this.inputModel = modelService.createModel("", null, scopeHandle, true);
    this._register(this.inputModel);
    this.inputWidget.setModel(this.inputModel);
    this._register(this.inputWidget.onDidPaste(() => this.setValue(this.getValue())));
    this._register(this.inputWidget.onDidFocusEditorText(() => {
      if (options3.focusContextKey) {
        options3.focusContextKey.set(true);
      }
      this.stylingContainer.classList.add("synthetic-focus");
    }));
    this._register(this.inputWidget.onDidBlurEditorText(() => {
      if (options3.focusContextKey) {
        options3.focusContextKey.set(false);
      }
      this.stylingContainer.classList.remove("synthetic-focus");
    }));
    this._register(Event2.chain(this.inputWidget.onKeyDown, ($110) => $110.filter((e) => e.keyCode === 3 /* Enter */))((e) => {
      e.preventDefault();
    }, this));
    this._register(Event2.chain(this.inputWidget.onKeyDown, ($110) => $110.filter((e) => e.keyCode === 18 /* DownArrow */ && (isMacintosh ? e.metaKey : e.ctrlKey)))(() => this._onShouldFocusResults.fire(), this));
    let preexistingContent = this.getValue();
    const inputWidgetModel = this.inputWidget.getModel();
    if (inputWidgetModel) {
      this._register(inputWidgetModel.onDidChangeContent(() => {
        const content2 = this.getValue();
        this.placeholderText.style.visibility = content2 ? "hidden" : "visible";
        if (preexistingContent.trim() === content2.trim()) {
          return;
        }
        this._onInputDidChange.fire(void 0);
        preexistingContent = content2;
      }));
    }
    const validatedSuggestProvider = {
      provideResults: suggestionProvider.provideResults,
      sortKey: suggestionProvider.sortKey || ((a) => a),
      triggerCharacters: suggestionProvider.triggerCharacters || [],
      wordDefinition: suggestionProvider.wordDefinition ? ensureValidWordDefinition(suggestionProvider.wordDefinition) : void 0,
      alwaysShowSuggestions: !!suggestionProvider.alwaysShowSuggestions
    };
    this.setValue(options3.value || "");
    this._register(languageFeaturesService.completionProvider.register({ scheme: scopeHandle.scheme, pattern: "**/" + scopeHandle.path, hasAccessToAllModels: true }, {
      _debugDisplayName: `suggestEnabledInput/${id2}`,
      triggerCharacters: validatedSuggestProvider.triggerCharacters,
      provideCompletionItems: (model, position2, _context) => {
        const query = model.getValue();
        const zeroIndexedColumn = position2.column - 1;
        let alreadyTypedCount = 0, zeroIndexedWordStart = 0;
        if (validatedSuggestProvider.wordDefinition) {
          const wordAtText = getWordAtText(position2.column, validatedSuggestProvider.wordDefinition, query, 0);
          alreadyTypedCount = wordAtText?.word.length ?? 0;
          zeroIndexedWordStart = wordAtText ? wordAtText.startColumn - 1 : 0;
        } else {
          zeroIndexedWordStart = query.lastIndexOf(" ", zeroIndexedColumn - 1) + 1;
          alreadyTypedCount = zeroIndexedColumn - zeroIndexedWordStart;
        }
        if (!validatedSuggestProvider.alwaysShowSuggestions && alreadyTypedCount > 0 && validatedSuggestProvider.triggerCharacters?.indexOf(query[zeroIndexedWordStart]) === -1) {
          return { suggestions: [] };
        }
        return {
          suggestions: suggestionProvider.provideResults(query).map((result) => {
            let label3;
            let rest;
            if (typeof result === "string") {
              label3 = result;
            } else {
              label3 = result.label;
              rest = result;
            }
            return {
              label: label3,
              insertText: label3,
              range: Range2.fromPositions(position2.delta(0, -alreadyTypedCount), position2),
              sortText: validatedSuggestProvider.sortKey(label3),
              kind: 17 /* Keyword */,
              ...rest
            };
          })
        };
      }
    }));
    this.style(options3.styleOverrides || {});
  }
  getScopedContextKeyService(_contextKeyService) {
    return void 0;
  }
  updateAriaLabel(label3) {
    this.inputWidget.updateOptions({ ariaLabel: label3 });
  }
  setPlaceHolder(placeholder) {
    this.placeholderText.textContent = placeholder;
  }
  setValue(val) {
    val = val.replace(/\s/g, " ");
    const fullRange = this.inputModel.getFullModelRange();
    this.inputWidget.executeEdits("suggestEnabledInput.setValue", [EditOperation.replace(fullRange, val)]);
    this.inputWidget.setScrollTop(0);
    this.inputWidget.setPosition(new Position(1, val.length + 1));
  }
  getValue() {
    return this.inputWidget.getValue();
  }
  style(styleOverrides) {
    this.stylingContainer.style.backgroundColor = asCssVariable(styleOverrides.inputBackground ?? inputBackground);
    this.stylingContainer.style.color = asCssVariable(styleOverrides.inputForeground ?? inputForeground);
    this.placeholderText.style.color = asCssVariable(styleOverrides.inputPlaceholderForeground ?? inputPlaceholderForeground);
    this.stylingContainer.style.borderWidth = "1px";
    this.stylingContainer.style.borderStyle = "solid";
    this.stylingContainer.style.borderColor = asCssVariableWithDefault(styleOverrides.inputBorder ?? inputBorder, "transparent");
    const cursor = this.stylingContainer.getElementsByClassName("cursor")[0];
    if (cursor) {
      cursor.style.backgroundColor = asCssVariable(styleOverrides.inputForeground ?? inputForeground);
    }
  }
  focus(selectAll) {
    this.inputWidget.focus();
    if (selectAll && this.inputWidget.getValue()) {
      this.selectAll();
    }
  }
  onHide() {
    this.inputWidget.onHide();
  }
  layout(dimension) {
    this.inputWidget.layout(dimension);
    this.placeholderText.style.width = `${dimension.width - 2}px`;
  }
  selectAll() {
    this.inputWidget.setSelection(new Range2(1, 1, 1, this.getValue().length + 1));
  }
};

SuggestEnabledInput = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IModelService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, ILanguageFeaturesService),
  __decorateParam(10, IConfigurationService)
], SuggestEnabledInput);

var SuggestEnabledInputWithHistory = class extends SuggestEnabledInput {
  constructor({ id: id2, parent, ariaLabel, suggestionProvider, resourceHandle, suggestOptions, history }, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService) {
    super(id2, parent, suggestionProvider, ariaLabel, resourceHandle, suggestOptions, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService);
    this.history = this._register(new HistoryNavigator(new Set(history), 100));
  }
  addToHistory() {
    const value2 = this.getValue();
    if (value2 && value2 !== this.getCurrentValue()) {
      this.history.add(value2);
    }
  }
  getHistory() {
    return this.history.getHistory();
  }
  /**
   * Whether the input is currently showing a value from the history (as opposed to a freshly
   * typed query). While navigating, {@link showNextValue} advances toward more recent entries and,
   * once past the most recent one, clears the input back to an empty value.
   */
  isNavigatingHistory() {
    return !this.history.isNowhere();
  }
  showNextValue() {
    if (!this.history.has(this.getValue())) {
      this.addToHistory();
    }
    let next = this.getNextValue();
    if (next) {
      next = next === this.getValue() ? this.getNextValue() : next;
    }
    this.setValue(next ?? "");
  }
  showPreviousValue() {
    if (!this.history.has(this.getValue())) {
      this.addToHistory();
    }
    let previous = this.getPreviousValue();
    if (previous) {
      previous = previous === this.getValue() ? this.getPreviousValue() : previous;
    }
    if (previous) {
      this.setValue(previous);
      this.inputWidget.setPosition({ lineNumber: 0, column: 0 });
    }
  }
  clearHistory() {
    this.history.clear();
  }
  getCurrentValue() {
    let currentValue = this.history.current();
    if (!currentValue) {
      currentValue = this.history.last();
      this.history.next();
    }
    return currentValue;
  }
  getPreviousValue() {
    return this.history.previous() || this.history.first();
  }
  getNextValue() {
    return this.history.next();
  }
};

SuggestEnabledInputWithHistory = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IModelService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IConfigurationService)
], SuggestEnabledInputWithHistory);

var ContextScopedSuggestEnabledInputWithHistory = class extends SuggestEnabledInputWithHistory {
  constructor(options3, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService) {
    super(options3, instantiationService, modelService, contextKeyService, languageFeaturesService, configurationService);
    const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this.historyContext;
    this._register(this.inputWidget.onDidChangeCursorPosition(({ position: position2 }) => {
      const viewModel = this.inputWidget._getViewModel();
      const lastLineNumber = viewModel.getLineCount();
      const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
      const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position2);
      historyNavigationBackwardsEnablement.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
      historyNavigationForwardsEnablement.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
    }));
  }
  getScopedContextKeyService(contextKeyService) {
    const scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
    this.historyContext = this._register(registerAndCreateHistoryNavigationContext(
      scopedContextKeyService,
      this
    ));
    return scopedContextKeyService;
  }
};

ContextScopedSuggestEnabledInputWithHistory = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IModelService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IConfigurationService)
], ContextScopedSuggestEnabledInputWithHistory);

setupSimpleEditorSelectionStyling(".suggest-input-container");

function getSuggestEnabledInputOptions(ariaLabel) {
  return {
    fontSize: 13,
    lineHeight: 20,
    wordWrap: "off",
    scrollbar: { vertical: "hidden" },
    roundedSelection: false,
    guides: {
      indentation: false
    },
    cursorWidth: 1,
    fontFamily: DEFAULT_FONT_FAMILY,
    ariaLabel: ariaLabel || "",
    snippetSuggestions: "none",
    suggest: { filterGraceful: false, showIcons: false },
    autoClosingBrackets: "never"
  };
}
export { getSuggestEnabledInputOptions, SuggestEnabledInput, SuggestEnabledInputWithHistory, ContextScopedSuggestEnabledInputWithHistory };
