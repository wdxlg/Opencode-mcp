// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/output/browser/outputView.ts
import { FilterViewPane } from "./module-1335.mjs";
import { Memento } from "./module-1041.mjs";
import { Markers } from "./module-3192.mjs";
import { localize } from "./module-0001.mjs";
import { CONTEXT_IN_OUTPUT, CONTEXT_OUTPUT_SCROLL_LOCK, HIDE_CATEGORY_FILTER_CONTEXT, IOutputService, OUTPUT_FILTER_FOCUS_CONTEXT, OUTPUT_VIEW_ID } from "./module-1245.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { Dimension } from "./module-0075.mjs";
import { createCancelablePromise } from "./module-0036.mjs";
import { TextResourceEditorInput } from "./module-1104.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IStorageService } from "./module-0512.mjs";
import { AbstractTextResourceEditor } from "./module-1551.mjs";
import { ResourceContextKey } from "./module-0949.mjs";
import { computeEditorAriaLabel } from "./module-1084.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IFileService } from "./module-0269.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { viewFilterSubmenu } from "./module-1333.mjs";
import { FindDecorations } from "./module-0591.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/output/browser/outputView.ts
var OutputViewPane = class extends FilterViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, outputService, storageService) {
    const memento = new Memento(Markers.MARKERS_VIEW_STORAGE_ID, storageService);
    const viewState = memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    super({
      ...options3,
      filterOptions: {
        placeholder: localize(18042, null),
        focusContextKey: OUTPUT_FILTER_FOCUS_CONTEXT.key,
        text: viewState.filter || "",
        history: []
      }
    }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.outputService = outputService;
    this.editorPromise = null;
    this.memento = memento;
    this.panelState = viewState;
    const filters2 = outputService.filters;
    filters2.text = this.panelState.filter || "";
    filters2.trace = this.panelState.showTrace ?? true;
    filters2.debug = this.panelState.showDebug ?? true;
    filters2.info = this.panelState.showInfo ?? true;
    filters2.warning = this.panelState.showWarning ?? true;
    filters2.error = this.panelState.showError ?? true;
    filters2.categories = this.panelState.categories ?? "";
    this.scrollLockContextKey = CONTEXT_OUTPUT_SCROLL_LOCK.bindTo(this.contextKeyService);
    const editorInstantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this.editor = this._register(editorInstantiationService.createInstance(OutputEditor));
    this._register(this.editor.onTitleAreaUpdate(() => {
      this.updateTitle(this.editor.getTitle());
      this.updateActions();
    }));
    this._register(this.onDidChangeBodyVisibility(() => this.onDidChangeVisibility(this.isBodyVisible())));
    this._register(this.filterWidget.onDidChangeFilterText((text2) => outputService.filters.text = text2));
    this.checkMoreFilters();
    this._register(outputService.filters.onDidChange(() => this.checkMoreFilters()));
  }
  get scrollLock() {
    return !!this.scrollLockContextKey.get();
  }
  set scrollLock(scrollLock) {
    this.scrollLockContextKey.set(scrollLock);
  }
  showChannel(channel, preserveFocus) {
    if (this.channelId !== channel.id) {
      this.setInput(channel);
    }
    if (!preserveFocus) {
      this.focus();
    }
  }
  focus() {
    super.focus();
    this.editorPromise?.then(() => this.editor.focus());
  }
  clearFilterText() {
    this.filterWidget.setFilterText("");
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.editor.create(container3);
    container3.classList.add("output-view");
    const codeEditor = this.editor.getControl();
    codeEditor.setAriaOptions({ role: "document", activeDescendant: void 0 });
    this._register(codeEditor.onDidChangeModelContent(() => {
      if (!this.scrollLock) {
        this.editor.revealLastLine();
      }
    }));
    this._register(codeEditor.onDidChangeCursorPosition((e) => {
      if (e.reason !== 3 /* Explicit */) {
        return;
      }
      if (!this.configurationService.getValue("output.smartScroll.enabled")) {
        return;
      }
      const model = codeEditor.getModel();
      if (model) {
        const newPositionLine = e.position.lineNumber;
        const lastLine = model.getLineCount();
        this.scrollLock = lastLine !== newPositionLine;
      }
    }));
  }
  layoutBodyContent(height, width2) {
    this.editor.layout(new Dimension(width2, height));
  }
  onDidChangeVisibility(visible) {
    this.editor.setVisible(visible);
    if (!visible) {
      this.clearInput();
    }
  }
  setInput(channel) {
    this.channelId = channel.id;
    this.checkMoreFilters();
    const input = this.createInput(channel);
    if (!this.editor.input || !input.matches(this.editor.input)) {
      this.editorPromise?.cancel();
      this.editorPromise = createCancelablePromise((token) => this.editor.setInput(input, { preserveFocus: true }, /* @__PURE__ */ Object.create(null), token));
    }
  }
  checkMoreFilters() {
    const filters2 = this.outputService.filters;
    this.filterWidget.checkMoreFilters(!filters2.trace || !filters2.debug || !filters2.info || !filters2.warning || !filters2.error || !!this.channelId && filters2.categories.includes(`,${this.channelId}:`));
  }
  clearInput() {
    this.channelId = void 0;
    this.editor.clearInput();
    this.editorPromise = null;
  }
  createInput(channel) {
    return this.instantiationService.createInstance(TextResourceEditorInput, channel.uri, localize(18041, null, channel.label), localize(18039, null, channel.label), void 0, void 0);
  }
  saveState() {
    const filters2 = this.outputService.filters;
    this.panelState.filter = filters2.text;
    this.panelState.showTrace = filters2.trace;
    this.panelState.showDebug = filters2.debug;
    this.panelState.showInfo = filters2.info;
    this.panelState.showWarning = filters2.warning;
    this.panelState.showError = filters2.error;
    this.panelState.categories = filters2.categories;
    this.memento.saveMemento();
    super.saveState();
  }
};

OutputViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IOutputService),
  __decorateParam(11, IStorageService)
], OutputViewPane);

var OutputEditor = class extends AbstractTextResourceEditor {
  constructor(telemetryService, instantiationService, storageService, configurationService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService) {
    super(OUTPUT_VIEW_ID, editorGroupService.activeGroup, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
    this.configurationService = configurationService;
    this.resourceContext = this._register(instantiationService.createInstance(ResourceContextKey));
  }
  getId() {
    return OUTPUT_VIEW_ID;
  }
  getTitle() {
    return localize(18040, null);
  }
  getConfigurationOverrides(configuration2) {
    const options3 = super.getConfigurationOverrides(configuration2);
    options3.wordWrap = "on";
    options3.lineNumbers = "off";
    options3.glyphMargin = false;
    options3.lineDecorationsWidth = 20;
    options3.rulers = [];
    options3.folding = false;
    options3.scrollBeyondLastLine = false;
    options3.renderLineHighlight = "none";
    options3.minimap = { enabled: false };
    options3.renderValidationDecorations = "editable";
    options3.colorDecorators = false;
    options3.padding = void 0;
    options3.readOnly = true;
    options3.domReadOnly = true;
    options3.roundedSelection = false;
    options3.unicodeHighlight = {
      nonBasicASCII: false,
      invisibleCharacters: false,
      ambiguousCharacters: false
    };
    const outputConfig = this.configurationService.getValue("[Log]");
    if (outputConfig) {
      if (outputConfig["editor.minimap.enabled"]) {
        options3.minimap = { enabled: true };
      }
      if (outputConfig["editor.wordWrap"]) {
        options3.wordWrap = outputConfig["editor.wordWrap"];
      }
    }
    return options3;
  }
  getAriaLabel() {
    return this.input ? this.input.getAriaLabel() : localize(18043, null);
  }
  computeAriaLabel() {
    return this.input ? computeEditorAriaLabel(this.input, void 0, void 0, this.editorGroupService.count) : this.getAriaLabel();
  }
  async setInput(input, options3, context2, token) {
    const focus = !(options3 && options3.preserveFocus);
    if (this.input && input.matches(this.input)) {
      return;
    }
    if (this.input) {
      this.input.dispose();
    }
    await super.setInput(input, options3, context2, token);
    this.resourceContext.set(input.resource);
    if (focus) {
      this.focus();
    }
    this.revealLastLine();
  }
  clearInput() {
    if (this.input) {
      this.input.dispose();
    }
    super.clearInput();
    this.resourceContext.reset();
  }
  createEditor(parent) {
    parent.setAttribute("role", "document");
    super.createEditor(parent);
    const scopedContextKeyService = this.scopedContextKeyService;
    if (scopedContextKeyService) {
      CONTEXT_IN_OUTPUT.bindTo(scopedContextKeyService).set(true);
    }
  }
  _getContributions() {
    return [
      ...EditorExtensionsRegistry.getEditorContributions(),
      {
        id: FilterController.ID,
        ctor: FilterController,
        instantiation: 0 /* Eager */
      }
    ];
  }
  getCodeEditorWidgetOptions() {
    return { contributions: this._getContributions() };
  }
};

OutputEditor = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ITextResourceConfigurationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IFileService)
], OutputEditor);

var FilterController = class extends Disposable {
  constructor(editor, outputService) {
    super();
    this.editor = editor;
    this.outputService = outputService;
    this.modelDisposables = this._register(new DisposableStore());
    this.hiddenAreas = [];
    this.categories = /* @__PURE__ */ new Map();
    this.decorationsCollection = editor.createDecorationsCollection();
    this._register(editor.onDidChangeModel(() => this.onDidChangeModel()));
    this._register(this.outputService.filters.onDidChange(() => editor.hasModel() && this.filter(editor.getModel())));
  }
  static {
    this.ID = "output.editor.contrib.filterController";
  }
  onDidChangeModel() {
    this.modelDisposables.clear();
    this.hiddenAreas = [];
    this.categories.clear();
    if (!this.editor.hasModel()) {
      return;
    }
    const model = this.editor.getModel();
    this.filter(model);
    const computeEndLineNumber = () => {
      const endLineNumber2 = model.getLineCount();
      return endLineNumber2 > 1 && model.getLineMaxColumn(endLineNumber2) === 1 ? endLineNumber2 - 1 : endLineNumber2;
    };
    let endLineNumber = computeEndLineNumber();
    this.modelDisposables.add(model.onDidChangeContent((e) => {
      if (e.changes.every((e2) => e2.range.startLineNumber > endLineNumber)) {
        this.filterIncremental(model, endLineNumber + 1);
      } else {
        this.filter(model);
      }
      endLineNumber = computeEndLineNumber();
    }));
  }
  filter(model) {
    this.hiddenAreas = [];
    this.decorationsCollection.clear();
    this.filterIncremental(model, 1);
  }
  filterIncremental(model, fromLineNumber) {
    const { findMatches, hiddenAreas, categories: sources } = this.compute(model, fromLineNumber);
    this.hiddenAreas.push(...hiddenAreas);
    this.editor.setHiddenAreas(this.hiddenAreas, this);
    if (findMatches.length) {
      this.decorationsCollection.append(findMatches);
    }
    if (sources.size) {
      const that = this;
      for (const [categoryFilter, categoryName] of sources) {
        if (this.categories.has(categoryFilter)) {
          continue;
        }
        this.categories.set(categoryFilter, categoryName);
        this.modelDisposables.add(registerAction2(class extends Action2 {
          constructor() {
            super({
              id: `workbench.actions.${OUTPUT_VIEW_ID}.toggle.${categoryFilter}`,
              title: categoryName,
              toggled: ContextKeyExpr.regex(HIDE_CATEGORY_FILTER_CONTEXT.key, new RegExp(`.*,${escapeRegExpCharacters(categoryFilter)},.*`)).negate(),
              menu: {
                id: viewFilterSubmenu,
                group: "1_category_filter",
                when: ContextKeyExpr.and(ContextKeyExpr.equals("view", OUTPUT_VIEW_ID))
              }
            });
          }
          async run() {
            that.outputService.filters.toggleCategory(categoryFilter);
          }
        }));
      }
    }
  }
  shouldShowLine(model, range2, positive, negative) {
    const matches2 = [];
    if (negative.length > 0) {
      for (const pattern of negative) {
        const negativeMatches = model.findMatches(pattern, range2, false, false, null, false);
        if (negativeMatches.length > 0) {
          return { show: false, matches: [] };
        }
      }
    }
    if (positive.length > 0) {
      let hasPositiveMatch = false;
      for (const pattern of positive) {
        const positiveMatches = model.findMatches(pattern, range2, false, false, null, false);
        if (positiveMatches.length > 0) {
          hasPositiveMatch = true;
          for (const match2 of positiveMatches) {
            matches2.push({ range: match2.range, options: FindDecorations._FIND_MATCH_DECORATION });
          }
        }
      }
      return { show: hasPositiveMatch, matches: matches2 };
    }
    return { show: true, matches: matches2 };
  }
  compute(model, fromLineNumber) {
    const filters2 = this.outputService.filters;
    const activeChannel = this.outputService.getActiveChannel();
    const findMatches = [];
    const hiddenAreas = [];
    const categories = /* @__PURE__ */ new Map();
    const logEntries = activeChannel?.getLogEntries();
    if (activeChannel && logEntries?.length) {
      const hasLogLevelFilter = !filters2.trace || !filters2.debug || !filters2.info || !filters2.warning || !filters2.error;
      const fromLogLevelEntryIndex = logEntries.findIndex((entry) => fromLineNumber >= entry.range.startLineNumber && fromLineNumber <= entry.range.endLineNumber);
      if (fromLogLevelEntryIndex === -1) {
        return { findMatches, hiddenAreas, categories };
      }
      for (let i2 = fromLogLevelEntryIndex; i2 < logEntries.length; i2++) {
        const entry = logEntries[i2];
        if (entry.category) {
          categories.set(`${activeChannel.id}:${entry.category}`, entry.category);
        }
        if (hasLogLevelFilter && !this.shouldShowLogLevel(entry, filters2)) {
          hiddenAreas.push(entry.range);
          continue;
        }
        if (!this.shouldShowCategory(activeChannel.id, entry, filters2)) {
          hiddenAreas.push(entry.range);
          continue;
        }
        if (filters2.includePatterns.length > 0 || filters2.excludePatterns.length > 0) {
          const result = this.shouldShowLine(model, entry.range, filters2.includePatterns, filters2.excludePatterns);
          if (result.show) {
            findMatches.push(...result.matches);
          } else {
            hiddenAreas.push(entry.range);
          }
        }
      }
      return { findMatches, hiddenAreas, categories };
    }
    if (filters2.includePatterns.length === 0 && filters2.excludePatterns.length === 0) {
      return { findMatches, hiddenAreas, categories };
    }
    const lineCount = model.getLineCount();
    for (let lineNumber = fromLineNumber; lineNumber <= lineCount; lineNumber++) {
      const lineRange = new Range2(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber));
      const result = this.shouldShowLine(model, lineRange, filters2.includePatterns, filters2.excludePatterns);
      if (result.show) {
        findMatches.push(...result.matches);
      } else {
        hiddenAreas.push(lineRange);
      }
    }
    return { findMatches, hiddenAreas, categories };
  }
  shouldShowLogLevel(entry, filters2) {
    switch (entry.logLevel) {
      case 1 /* Trace */:
        return filters2.trace;
      case 2 /* Debug */:
        return filters2.debug;
      case 3 /* Info */:
        return filters2.info;
      case 4 /* Warning */:
        return filters2.warning;
      case 5 /* Error */:
        return filters2.error;
    }
    return true;
  }
  shouldShowCategory(activeChannelId, entry, filters2) {
    if (!entry.category) {
      return true;
    }
    return !filters2.hasCategory(`${activeChannelId}:${entry.category}`);
  }
};

FilterController = __decorateClass([
  __decorateParam(1, IOutputService)
], FilterController);
export { OutputViewPane, OutputEditor, FilterController };
