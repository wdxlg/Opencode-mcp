// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { IconLabel } from "./module-0640.mjs";
import { createMatches } from "./module-0453.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getIconClassesForLanguageId } from "./module-0755.mjs";
import { listErrorForeground, listWarningForeground } from "./module-0232.mjs";
import { ToolBar } from "./module-0503.mjs";
import { Action2, IMenuService, MenuId, MenuItemAction, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { MenuEntryActionViewItem, getActionBarActions } from "./module-0516.mjs";
import { clearNode } from "./module-0075.mjs";
import { Delayer, disposableTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { NotebookSetting } from "./module-0909.mjs";
import { safeIntl } from "./module-0120.mjs";
import { Emitter } from "./module-0017.mjs";
import { INotebookCellOutlineDataSourceFactory } from "./module-1956.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { Range2 } from "./module-0106.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { NotebookEditor } from "./module-1878.mjs";
import { IOutlineService } from "./module-0971.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { IOutlinePane } from "./module-2003.mjs";
import { NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1868.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline.ts
var NotebookOutlineTemplate = class {
  constructor(container3, iconClass, iconLabel, decoration3, actionMenu, elementDisposables) {
    this.container = container3;
    this.iconClass = iconClass;
    this.iconLabel = iconLabel;
    this.decoration = decoration3;
    this.actionMenu = actionMenu;
    this.elementDisposables = elementDisposables;
  }
  static {
    this.templateId = "NotebookOutlineRenderer";
  }
};

var NotebookOutlineRenderer = class {
  constructor(_editor, _target, _themeService, _configurationService, _contextMenuService, _contextKeyService, _menuService, _instantiationService) {
    this._editor = _editor;
    this._target = _target;
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._contextMenuService = _contextMenuService;
    this._contextKeyService = _contextKeyService;
    this._menuService = _menuService;
    this._instantiationService = _instantiationService;
    this.templateId = NotebookOutlineTemplate.templateId;
  }
  renderTemplate(container3) {
    const elementDisposables = new DisposableStore();
    container3.classList.add("notebook-outline-element", "show-file-icons");
    const iconClass = document.createElement("div");
    container3.append(iconClass);
    const iconLabel = new IconLabel(container3, { supportHighlights: true });
    const decoration3 = document.createElement("div");
    decoration3.className = "element-decoration";
    container3.append(decoration3);
    const actionMenu = document.createElement("div");
    actionMenu.className = "action-menu";
    container3.append(actionMenu);
    return new NotebookOutlineTemplate(container3, iconClass, iconLabel, decoration3, actionMenu, elementDisposables);
  }
  renderElement(node, _index, template2) {
    const extraClasses = [];
    const options3 = {
      matches: createMatches(node.filterData),
      labelEscapeNewLines: true,
      extraClasses
    };
    const isCodeCell = node.element.cell.cellKind === 2 /* Code */;
    if (node.element.level >= 8) {
      template2.iconClass.className = "element-icon " + ThemeIcon.asClassNameArray(node.element.icon).join(" ");
    } else if (isCodeCell && this._themeService.getFileIconTheme().hasFileIcons && !node.element.isExecuting) {
      template2.iconClass.className = "";
      extraClasses.push(...getIconClassesForLanguageId(node.element.cell.language ?? ""));
    } else {
      template2.iconClass.className = "element-icon " + ThemeIcon.asClassNameArray(node.element.icon).join(" ");
    }
    template2.iconLabel.setLabel(" " + node.element.label, void 0, options3);
    const { markerInfo } = node.element;
    template2.container.style.removeProperty("--outline-element-color");
    template2.decoration.innerText = "";
    if (markerInfo) {
      const problem = this._configurationService.getValue("problems.visibility");
      const useBadges = this._configurationService.getValue("outline.problems.badges" /* problemsBadges */);
      if (!useBadges || !problem) {
        template2.decoration.classList.remove("bubble");
        template2.decoration.innerText = "";
      } else if (markerInfo.count === 0) {
        template2.decoration.classList.add("bubble");
        template2.decoration.innerText = "\uEA71";
      } else {
        template2.decoration.classList.remove("bubble");
        template2.decoration.innerText = markerInfo.count > 9 ? "9+" : String(markerInfo.count);
      }
      const color2 = this._themeService.getColorTheme().getColor(markerInfo.topSev === 8 /* Error */ ? listErrorForeground : listWarningForeground);
      if (problem === void 0) {
        return;
      }
      const useColors = this._configurationService.getValue("outline.problems.colors" /* problemsColors */);
      if (!useColors || !problem) {
        template2.container.style.removeProperty("--outline-element-color");
        template2.decoration.style.setProperty("--outline-element-color", color2?.toString() ?? "inherit");
      } else {
        template2.container.style.setProperty("--outline-element-color", color2?.toString() ?? "inherit");
      }
    }
    if (this._target === 1 /* OutlinePane */) {
      if (!this._editor) {
        return;
      }
      const nbCell = node.element.cell;
      const nbViewModel = this._editor.getViewModel();
      if (!nbViewModel) {
        return;
      }
      const idx = nbViewModel.getCellIndex(nbCell);
      const length = isCodeCell ? 0 : nbViewModel.getFoldedLength(idx);
      const scopedContextKeyService = template2.elementDisposables.add(this._contextKeyService.createScoped(template2.container));
      NotebookOutlineContext.CellKind.bindTo(scopedContextKeyService).set(isCodeCell ? 2 /* Code */ : 1 /* Markup */);
      NotebookOutlineContext.CellHasChildren.bindTo(scopedContextKeyService).set(length > 0);
      NotebookOutlineContext.CellHasHeader.bindTo(scopedContextKeyService).set(node.element.level !== 7 /* NonHeaderOutlineLevel */);
      NotebookOutlineContext.OutlineElementTarget.bindTo(scopedContextKeyService).set(this._target);
      this.setupFolding(isCodeCell, nbViewModel, scopedContextKeyService, template2, nbCell);
      const outlineEntryToolbar = template2.elementDisposables.add(new ToolBar(template2.actionMenu, this._contextMenuService, {
        actionViewItemProvider: (action) => {
          if (action instanceof MenuItemAction) {
            return this._instantiationService.createInstance(MenuEntryActionViewItem, action, void 0);
          }
          return void 0;
        }
      }));
      const menu = template2.elementDisposables.add(this._menuService.createMenu(MenuId.NotebookOutlineActionMenu, scopedContextKeyService));
      const actions = getOutlineToolbarActions(menu, { notebookEditor: this._editor, outlineEntry: node.element });
      outlineEntryToolbar.setActions(actions.primary, actions.secondary);
      this.setupToolbarListeners(this._editor, outlineEntryToolbar, menu, actions, node.element, template2);
      template2.actionMenu.style.padding = "0 0.8em 0 0.4em";
    }
  }
  disposeTemplate(templateData) {
    templateData.iconLabel.dispose();
    templateData.elementDisposables.dispose();
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
    clearNode(templateData.actionMenu);
  }
  setupFolding(isCodeCell, nbViewModel, scopedContextKeyService, template2, nbCell) {
    const foldingState = isCodeCell ? 0 /* None */ : nbCell.foldingState;
    const foldingStateCtx = NotebookOutlineContext.CellFoldingState.bindTo(scopedContextKeyService);
    foldingStateCtx.set(foldingState);
    if (!isCodeCell) {
      template2.elementDisposables.add(nbViewModel.onDidFoldingStateChanged(() => {
        const foldingState2 = nbCell.foldingState;
        NotebookOutlineContext.CellFoldingState.bindTo(scopedContextKeyService).set(foldingState2);
        foldingStateCtx.set(foldingState2);
      }));
    }
  }
  setupToolbarListeners(editor, toolbar, menu, initActions, entry, templateData) {
    let dropdownIsVisible = false;
    let deferredUpdate;
    toolbar.setActions(initActions.primary, initActions.secondary);
    templateData.elementDisposables.add(menu.onDidChange(() => {
      if (dropdownIsVisible) {
        const actions2 = getOutlineToolbarActions(menu, { notebookEditor: editor, outlineEntry: entry });
        deferredUpdate = () => toolbar.setActions(actions2.primary, actions2.secondary);
        return;
      }
      const actions = getOutlineToolbarActions(menu, { notebookEditor: editor, outlineEntry: entry });
      toolbar.setActions(actions.primary, actions.secondary);
    }));
    templateData.container.classList.remove("notebook-outline-toolbar-dropdown-active");
    templateData.elementDisposables.add(toolbar.onDidChangeDropdownVisibility((visible) => {
      dropdownIsVisible = visible;
      if (visible) {
        templateData.container.classList.add("notebook-outline-toolbar-dropdown-active");
      } else {
        templateData.container.classList.remove("notebook-outline-toolbar-dropdown-active");
      }
      if (deferredUpdate && !visible) {
        disposableTimeout(() => {
          deferredUpdate?.();
        }, 0, templateData.elementDisposables);
        deferredUpdate = void 0;
      }
    }));
  }
};

NotebookOutlineRenderer = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IInstantiationService)
], NotebookOutlineRenderer);

function getOutlineToolbarActions(menu, args2) {
  return getActionBarActions(menu.getActions({ shouldForwardArgs: true, arg: args2 }), (g) => /^inline/.test(g));
}

var NotebookOutlineAccessibility = class {
  getAriaLabel(element) {
    return element.label;
  }
  getWidgetAriaLabel() {
    return "";
  }
};

var NotebookNavigationLabelProvider = class {
  getKeyboardNavigationLabel(element) {
    return element.label;
  }
};

var NotebookOutlineVirtualDelegate = class {
  getHeight(_element) {
    return 22;
  }
  getTemplateId(_element) {
    return NotebookOutlineTemplate.templateId;
  }
};

var NotebookQuickPickProvider = class {
  constructor(notebookCellOutlineDataSourceRef, _configurationService, _themeService) {
    this.notebookCellOutlineDataSourceRef = notebookCellOutlineDataSourceRef;
    this._configurationService = _configurationService;
    this._themeService = _themeService;
    this._disposables = new DisposableStore();
    this.gotoShowCodeCellSymbols = this._configurationService.getValue(NotebookSetting.gotoSymbolsAllSymbols);
    this._disposables.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(NotebookSetting.gotoSymbolsAllSymbols)) {
        this.gotoShowCodeCellSymbols = this._configurationService.getValue(NotebookSetting.gotoSymbolsAllSymbols);
      }
    }));
  }
  getQuickPickElements() {
    const bucket = [];
    for (const entry of this.notebookCellOutlineDataSourceRef?.object?.entries ?? []) {
      entry.asFlatList(bucket);
    }
    const result = [];
    const { hasFileIcons } = this._themeService.getFileIconTheme();
    const isSymbol = (element) => !!element.symbolKind;
    const isCodeCell = (element) => element.cell.cellKind === 2 /* Code */ && element.level === 7 /* NonHeaderOutlineLevel */;
    for (let i2 = 0; i2 < bucket.length; i2++) {
      const element = bucket[i2];
      const nextElement = bucket[i2 + 1];
      if (!this.gotoShowCodeCellSymbols && isSymbol(element)) {
        continue;
      }
      if (this.gotoShowCodeCellSymbols && isCodeCell(element) && nextElement && isSymbol(nextElement)) {
        continue;
      }
      const useFileIcon = hasFileIcons && !element.symbolKind;
      result.push({
        element,
        label: useFileIcon ? element.label : `$(${element.icon.id}) ${element.label}`,
        ariaLabel: element.label,
        iconClasses: useFileIcon ? getIconClassesForLanguageId(element.cell.language ?? "") : void 0
      });
    }
    return result;
  }
  dispose() {
    this._disposables.dispose();
  }
};

NotebookQuickPickProvider = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IThemeService)
], NotebookQuickPickProvider);

function filterEntry(entry, showMarkdownHeadersOnly, showCodeCells, showCodeCellSymbols) {
  if (showMarkdownHeadersOnly && entry.cell.cellKind === 1 /* Markup */ && entry.level === 7 /* NonHeaderOutlineLevel */ || // show headers only   + cell is mkdn + is level 7 (not header)
  !showCodeCells && entry.cell.cellKind === 2 /* Code */ || // show code cells off + cell is code
  !showCodeCellSymbols && entry.cell.cellKind === 2 /* Code */ && entry.level > 7 /* NonHeaderOutlineLevel */) {
    return true;
  }
  return false;
}

var NotebookOutlinePaneProvider = class {
  constructor(outlineDataSourceRef, _configurationService) {
    this.outlineDataSourceRef = outlineDataSourceRef;
    this._configurationService = _configurationService;
    this._disposables = new DisposableStore();
    this.showCodeCells = this._configurationService.getValue(NotebookSetting.outlineShowCodeCells);
    this.showCodeCellSymbols = this._configurationService.getValue(NotebookSetting.outlineShowCodeCellSymbols);
    this.showMarkdownHeadersOnly = this._configurationService.getValue(NotebookSetting.outlineShowMarkdownHeadersOnly);
    this._disposables.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(NotebookSetting.outlineShowCodeCells)) {
        this.showCodeCells = this._configurationService.getValue(NotebookSetting.outlineShowCodeCells);
      }
      if (e.affectsConfiguration(NotebookSetting.outlineShowCodeCellSymbols)) {
        this.showCodeCellSymbols = this._configurationService.getValue(NotebookSetting.outlineShowCodeCellSymbols);
      }
      if (e.affectsConfiguration(NotebookSetting.outlineShowMarkdownHeadersOnly)) {
        this.showMarkdownHeadersOnly = this._configurationService.getValue(NotebookSetting.outlineShowMarkdownHeadersOnly);
      }
    }));
  }
  getActiveEntry() {
    const newActive = this.outlineDataSourceRef?.object?.activeElement;
    if (!newActive) {
      return void 0;
    }
    if (!filterEntry(newActive, this.showMarkdownHeadersOnly, this.showCodeCells, this.showCodeCellSymbols)) {
      return newActive;
    }
    let parent = newActive.parent;
    while (parent) {
      if (filterEntry(parent, this.showMarkdownHeadersOnly, this.showCodeCells, this.showCodeCellSymbols)) {
        parent = parent.parent;
      } else {
        return parent;
      }
    }
    return void 0;
  }
  *getChildren(element) {
    const isOutline = element instanceof NotebookCellOutline;
    const entries2 = isOutline ? this.outlineDataSourceRef?.object?.entries ?? [] : element.children;
    for (const entry of entries2) {
      if (entry.cell.cellKind === 1 /* Markup */) {
        if (!this.showMarkdownHeadersOnly) {
          yield entry;
        } else if (entry.level < 7 /* NonHeaderOutlineLevel */) {
          yield entry;
        }
      } else if (this.showCodeCells && entry.cell.cellKind === 2 /* Code */) {
        if (this.showCodeCellSymbols) {
          yield entry;
        } else if (entry.level === 7 /* NonHeaderOutlineLevel */) {
          yield entry;
        }
      }
    }
  }
  dispose() {
    this._disposables.dispose();
  }
};

NotebookOutlinePaneProvider = __decorateClass([
  __decorateParam(1, IConfigurationService)
], NotebookOutlinePaneProvider);

var NotebookBreadcrumbsProvider = class {
  constructor(outlineDataSourceRef, _configurationService) {
    this.outlineDataSourceRef = outlineDataSourceRef;
    this._configurationService = _configurationService;
    this._disposables = new DisposableStore();
    this.showCodeCells = this._configurationService.getValue(NotebookSetting.breadcrumbsShowCodeCells);
    this._disposables.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(NotebookSetting.breadcrumbsShowCodeCells)) {
        this.showCodeCells = this._configurationService.getValue(NotebookSetting.breadcrumbsShowCodeCells);
      }
    }));
  }
  getBreadcrumbElements() {
    const result = [];
    let candidate = this.outlineDataSourceRef?.object?.activeElement;
    while (candidate) {
      if (this.showCodeCells || candidate.cell.cellKind !== 2 /* Code */) {
        result.unshift({ element: candidate, label: candidate.label });
      }
      candidate = candidate.parent;
    }
    return result;
  }
  dispose() {
    this._disposables.dispose();
  }
};

NotebookBreadcrumbsProvider = __decorateClass([
  __decorateParam(1, IConfigurationService)
], NotebookBreadcrumbsProvider);

var NotebookComparator = class {
  constructor() {
    this._collator = safeIntl.Collator(void 0, { numeric: true });
  }
  compareByPosition(a, b) {
    return a.index - b.index;
  }
  compareByType(a, b) {
    return a.cell.cellKind - b.cell.cellKind || this._collator.value.compare(a.label, b.label);
  }
  compareByName(a, b) {
    return this._collator.value.compare(a.label, b.label);
  }
};

var NotebookCellOutline = class {
  constructor(_editor, _target, _themeService, _editorService, _instantiationService, _configurationService, _languageFeaturesService, _notebookExecutionStateService) {
    this._editor = _editor;
    this._target = _target;
    this._themeService = _themeService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._languageFeaturesService = _languageFeaturesService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this.outlineKind = "notebookCells";
    this._disposables = new DisposableStore();
    this._modelDisposables = new DisposableStore();
    this._dataSourceDisposables = new DisposableStore();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this.delayerRecomputeState = this._disposables.add(new Delayer(300));
    this.delayerRecomputeActive = this._disposables.add(new Delayer(200));
    // this can be long, because it will force a recompute at the end, so ideally we only do this once all nb language features are registered
    this.delayerRecomputeSymbols = this._disposables.add(new Delayer(2e3));
    this.outlineShowCodeCells = this._configurationService.getValue(NotebookSetting.outlineShowCodeCells);
    this.outlineShowCodeCellSymbols = this._configurationService.getValue(NotebookSetting.outlineShowCodeCellSymbols);
    this.outlineShowMarkdownHeadersOnly = this._configurationService.getValue(NotebookSetting.outlineShowMarkdownHeadersOnly);
    this.initializeOutline();
    const delegate = new NotebookOutlineVirtualDelegate();
    const renderers = [this._instantiationService.createInstance(NotebookOutlineRenderer, this._editor.getControl(), this._target)];
    const comparator = new NotebookComparator();
    const options3 = {
      collapseByDefault: this._target === 2 /* Breadcrumbs */ || this._target === 1 /* OutlinePane */ && this._configurationService.getValue("outline.collapseItems" /* collapseItems */) === "alwaysCollapse" /* Collapsed */,
      expandOnlyOnTwistieClick: true,
      multipleSelectionSupport: false,
      accessibilityProvider: new NotebookOutlineAccessibility(),
      identityProvider: { getId: (element) => element.cell.uri.toString() },
      keyboardNavigationLabelProvider: new NotebookNavigationLabelProvider()
    };
    this.config = {
      treeDataSource: this._treeDataSource,
      quickPickDataSource: this._quickPickDataSource,
      breadcrumbsDataSource: this._breadcrumbsDataSource,
      delegate,
      renderers,
      comparator,
      options: options3
    };
  }
  // getters
  get activeElement() {
    this.checkDelayer();
    if (this._target === 1 /* OutlinePane */) {
      return this.config.treeDataSource.getActiveEntry();
    } else {
      console.error("activeElement should not be called outside of the OutlinePane");
      return void 0;
    }
  }
  get entries() {
    this.checkDelayer();
    return this._outlineDataSourceReference?.object?.entries ?? [];
  }
  get uri() {
    return this._outlineDataSourceReference?.object?.uri;
  }
  get isEmpty() {
    if (!this._outlineDataSourceReference?.object?.entries) {
      return true;
    }
    return !this._outlineDataSourceReference.object.entries.some((entry) => {
      return !filterEntry(entry, this.outlineShowMarkdownHeadersOnly, this.outlineShowCodeCells, this.outlineShowCodeCellSymbols);
    });
  }
  checkDelayer() {
    if (this.delayerRecomputeState.isTriggered()) {
      this.delayerRecomputeState.cancel();
      this.recomputeState();
    }
  }
  initializeOutline() {
    this.setDataSources();
    this.setModelListeners();
    this._disposables.add(this._editor.onDidChangeModel(() => {
      this.setDataSources();
      this.setModelListeners();
      this.computeSymbols();
    }));
    this._disposables.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(() => {
      this.delayedComputeSymbols();
    }));
    this._disposables.add(this._editor.onDidChangeSelection(() => {
      this.delayedRecomputeActive();
    }));
    this._disposables.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(NotebookSetting.outlineShowMarkdownHeadersOnly) || e.affectsConfiguration(NotebookSetting.outlineShowCodeCells) || e.affectsConfiguration(NotebookSetting.outlineShowCodeCellSymbols) || e.affectsConfiguration(NotebookSetting.breadcrumbsShowCodeCells)) {
        this.outlineShowCodeCells = this._configurationService.getValue(NotebookSetting.outlineShowCodeCells);
        this.outlineShowCodeCellSymbols = this._configurationService.getValue(NotebookSetting.outlineShowCodeCellSymbols);
        this.outlineShowMarkdownHeadersOnly = this._configurationService.getValue(NotebookSetting.outlineShowMarkdownHeadersOnly);
        this.delayedRecomputeState();
      }
    }));
    this._disposables.add(this._notebookExecutionStateService.onDidChangeExecution((e) => {
      if (e.type === 0 /* cell */ && !!this._editor.textModel && e.affectsNotebook(this._editor.textModel?.uri)) {
        this.delayedRecomputeState();
      }
    }));
    this._disposables.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(NotebookSetting.outlineShowCodeCellSymbols)) {
        this.outlineShowCodeCellSymbols = this._configurationService.getValue(NotebookSetting.outlineShowCodeCellSymbols);
        this.computeSymbols();
      }
    }));
    this._disposables.add(this._themeService.onDidFileIconThemeChange(() => {
      this._onDidChange.fire({});
    }));
    this.recomputeState();
  }
  /**
   * set up the primary data source + three viewing sources for the various outline views
   */
  setDataSources() {
    const notebookEditor = this._editor.getControl();
    this._outlineDataSourceReference?.dispose();
    this._dataSourceDisposables.clear();
    if (!notebookEditor?.hasModel()) {
      this._outlineDataSourceReference = void 0;
    } else {
      this._outlineDataSourceReference = this._dataSourceDisposables.add(this._instantiationService.invokeFunction((accessor) => accessor.get(INotebookCellOutlineDataSourceFactory).getOrCreate(notebookEditor)));
      this._dataSourceDisposables.add(this._outlineDataSourceReference.object.onDidChange(() => {
        this._onDidChange.fire({});
      }));
    }
    this._treeDataSource = this._dataSourceDisposables.add(this._instantiationService.createInstance(NotebookOutlinePaneProvider, this._outlineDataSourceReference));
    this._quickPickDataSource = this._dataSourceDisposables.add(this._instantiationService.createInstance(NotebookQuickPickProvider, this._outlineDataSourceReference));
    this._breadcrumbsDataSource = this._dataSourceDisposables.add(this._instantiationService.createInstance(NotebookBreadcrumbsProvider, this._outlineDataSourceReference));
  }
  /**
   * set up the listeners for the outline content, these respond to model changes in the notebook
   */
  setModelListeners() {
    this._modelDisposables.clear();
    if (!this._editor.textModel) {
      return;
    }
    if (!this.entries.length) {
      this.computeSymbols();
    }
    this._modelDisposables.add(this._editor.textModel.onDidChangeContent((contentChanges) => {
      if (contentChanges.rawEvents.some((c) => c.kind === 10 /* ChangeCellContent */ || c.kind === 12 /* ChangeCellInternalMetadata */ || c.kind === 2 /* Move */ || c.kind === 1 /* ModelChange */)) {
        this.delayedRecomputeState();
      }
    }));
  }
  async computeSymbols(cancelToken = CancellationToken.None) {
    if (this._target === 1 /* OutlinePane */ && this.outlineShowCodeCellSymbols) {
      void this.doComputeSymbols(cancelToken);
    }
  }
  async doComputeSymbols(cancelToken) {
    await this._outlineDataSourceReference?.object?.computeFullSymbols(cancelToken);
  }
  async delayedComputeSymbols() {
    this.delayerRecomputeState.cancel();
    this.delayerRecomputeActive.cancel();
    this.delayerRecomputeSymbols.trigger(() => {
      this.computeSymbols();
    });
  }
  recomputeState() {
    this._outlineDataSourceReference?.object?.recomputeState();
  }
  delayedRecomputeState() {
    this.delayerRecomputeActive.cancel();
    this.delayerRecomputeState.trigger(() => {
      this.recomputeState();
    });
  }
  recomputeActive() {
    this._outlineDataSourceReference?.object?.recomputeActive();
  }
  delayedRecomputeActive() {
    this.delayerRecomputeActive.trigger(() => {
      this.recomputeActive();
    });
  }
  async reveal(entry, options3, sideBySide) {
    const notebookEditorOptions = {
      ...options3,
      override: this._editor.input?.editorId,
      cellRevealType: 2 /* Top */,
      selection: entry.position,
      viewState: void 0
    };
    await this._editorService.openEditor({
      resource: entry.cell.uri,
      options: notebookEditorOptions
    }, sideBySide ? SIDE_GROUP : void 0);
  }
  preview(entry) {
    const widget = this._editor.getControl();
    if (!widget) {
      return Disposable.None;
    }
    if (entry.range) {
      const range2 = Range2.lift(entry.range);
      widget.revealRangeInCenterIfOutsideViewportAsync(entry.cell, range2);
    } else {
      widget.revealInCenterIfOutsideViewport(entry.cell);
    }
    const ids = widget.deltaCellDecorations([], [{
      handle: entry.cell.handle,
      options: { className: "nb-symbolHighlight", outputClassName: "nb-symbolHighlight" }
    }]);
    let editorDecorations;
    widget.changeModelDecorations((accessor) => {
      if (entry.range) {
        const decorations = [
          {
            range: entry.range,
            options: {
              description: "document-symbols-outline-range-highlight",
              className: "rangeHighlight",
              isWholeLine: true
            }
          }
        ];
        const deltaDecoration = {
          ownerId: entry.cell.handle,
          decorations
        };
        editorDecorations = accessor.deltaDecorations([], [deltaDecoration]);
      }
    });
    return toDisposable(() => {
      widget.deltaCellDecorations(ids, []);
      if (editorDecorations?.length) {
        widget.changeModelDecorations((accessor) => {
          accessor.deltaDecorations(editorDecorations, []);
        });
      }
    });
  }
  captureViewState() {
    const widget = this._editor.getControl();
    const viewState = widget?.getEditorViewState();
    return toDisposable(() => {
      if (viewState) {
        widget?.restoreListViewState(viewState);
      }
    });
  }
  dispose() {
    this._onDidChange.dispose();
    this._disposables.dispose();
    this._modelDisposables.dispose();
    this._dataSourceDisposables.dispose();
    this._outlineDataSourceReference?.dispose();
  }
};

NotebookCellOutline = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ILanguageFeaturesService),
  __decorateParam(7, INotebookExecutionStateService)
], NotebookCellOutline);

var NotebookOutlineCreator = class {
  constructor(outlineService, _instantiationService) {
    this._instantiationService = _instantiationService;
    const reg3 = outlineService.registerOutlineCreator(this);
    this.dispose = () => reg3.dispose();
  }
  matches(candidate) {
    return candidate.getId() === NotebookEditor.ID;
  }
  async createOutline(editor, target, cancelToken) {
    const outline = this._instantiationService.createInstance(NotebookCellOutline, editor, target);
    if (target === 4 /* QuickPick */) {
      await outline.doComputeSymbols(cancelToken);
    }
    return outline;
  }
};

NotebookOutlineCreator = __decorateClass([
  __decorateParam(0, IOutlineService),
  __decorateParam(1, IInstantiationService)
], NotebookOutlineCreator);

var NotebookOutlineContext = {
  CellKind: new RawContextKey("notebookCellKind", void 0),
  CellHasChildren: new RawContextKey("notebookCellHasChildren", false),
  CellHasHeader: new RawContextKey("notebookCellHasHeader", false),
  CellFoldingState: new RawContextKey("notebookCellFoldingState", 0 /* None */),
  OutlineElementTarget: new RawContextKey("notebookOutlineElementTarget", void 0)
};

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(NotebookOutlineCreator, 4 /* Eventually */);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "notebook",
  order: 100,
  type: "object",
  "properties": {
    [NotebookSetting.outlineShowMarkdownHeadersOnly]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(17495, null)
    },
    [NotebookSetting.outlineShowCodeCells]: {
      type: "boolean",
      default: false,
      markdownDescription: localize(17493, null)
    },
    [NotebookSetting.outlineShowCodeCellSymbols]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(17494, null)
    },
    [NotebookSetting.breadcrumbsShowCodeCells]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(17490, null)
    },
    [NotebookSetting.gotoSymbolsAllSymbols]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(17492, null)
    }
  }
});

MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
  submenu: MenuId.NotebookOutlineFilter,
  title: localize(17491, null),
  icon: Codicon.filter,
  group: "navigation",
  order: -1,
  when: ContextKeyExpr.and(ContextKeyExpr.equals("view", IOutlinePane.Id), NOTEBOOK_IS_ACTIVE_EDITOR)
});

registerAction2(class ToggleShowMarkdownHeadersOnly extends Action2 {
  constructor() {
    super({
      id: "notebook.outline.toggleShowMarkdownHeadersOnly",
      title: localize(17498, null),
      f1: false,
      toggled: {
        condition: ContextKeyExpr.equals("config.notebook.outline.showMarkdownHeadersOnly", true)
      },
      menu: {
        id: MenuId.NotebookOutlineFilter,
        group: "0_markdown_cells"
      }
    });
  }
  run(accessor, ...args2) {
    const configurationService = accessor.get(IConfigurationService);
    const showMarkdownHeadersOnly = configurationService.getValue(NotebookSetting.outlineShowMarkdownHeadersOnly);
    configurationService.updateValue(NotebookSetting.outlineShowMarkdownHeadersOnly, !showMarkdownHeadersOnly);
  }
});

registerAction2(class ToggleCodeCellEntries extends Action2 {
  constructor() {
    super({
      id: "notebook.outline.toggleCodeCells",
      title: localize(17496, null),
      f1: false,
      toggled: {
        condition: ContextKeyExpr.equals("config.notebook.outline.showCodeCells", true)
      },
      menu: {
        id: MenuId.NotebookOutlineFilter,
        order: 1,
        group: "1_code_cells"
      }
    });
  }
  run(accessor, ...args2) {
    const configurationService = accessor.get(IConfigurationService);
    const showCodeCells = configurationService.getValue(NotebookSetting.outlineShowCodeCells);
    configurationService.updateValue(NotebookSetting.outlineShowCodeCells, !showCodeCells);
  }
});

registerAction2(class ToggleCodeCellSymbolEntries extends Action2 {
  constructor() {
    super({
      id: "notebook.outline.toggleCodeCellSymbols",
      title: localize(17497, null),
      f1: false,
      toggled: {
        condition: ContextKeyExpr.equals("config.notebook.outline.showCodeCellSymbols", true)
      },
      menu: {
        id: MenuId.NotebookOutlineFilter,
        order: 2,
        group: "1_code_cells"
      }
    });
  }
  run(accessor, ...args2) {
    const configurationService = accessor.get(IConfigurationService);
    const showCodeCellSymbols = configurationService.getValue(NotebookSetting.outlineShowCodeCellSymbols);
    configurationService.updateValue(NotebookSetting.outlineShowCodeCellSymbols, !showCodeCellSymbols);
  }
});
export { getOutlineToolbarActions, filterEntry, NotebookOutlineTemplate, NotebookOutlineRenderer, NotebookOutlineAccessibility, NotebookNavigationLabelProvider, NotebookOutlineVirtualDelegate, NotebookQuickPickProvider, NotebookOutlinePaneProvider, NotebookBreadcrumbsProvider, NotebookComparator, NotebookCellOutline, NotebookOutlineCreator, NotebookOutlineContext };
