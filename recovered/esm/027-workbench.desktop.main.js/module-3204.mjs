// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markersView.ts
import { Iterable } from "./module-0011.mjs";
import { FilterViewPane } from "./module-1335.mjs";
import { Memento } from "./module-1041.mjs";
import { Markers, MarkersContextKeys } from "./module-3192.mjs";
import { Messages } from "./module-3200.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { Marker3, MarkerTableItem, MarkersModel, RelatedInformation, ResourceMarkers, compareMarkersByUri } from "./module-3198.mjs";
import { Filter2, MarkerRenderer, MarkersViewModel, MarkersWidgetAccessibilityProvider, RelatedInformationRenderer, ResourceMarkersRenderer, VirtualDelegate } from "./module-3203.mjs";
import { FilterOptions2 } from "./module-3199.mjs";
import { RangeHighlightDecorations } from "./module-1845.mjs";
import { MarkersFilters } from "./module-3201.mjs";
import { registerNavigableContainer } from "./module-1369.mjs";
import { $, EventType, addDisposableListener, addStandardDisposableListener, append, clearNode, isActiveElement } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { localize } from "./module-0001.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { deepClone } from "./module-0098.mjs";
import { Event2, Relay } from "./module-0017.mjs";
import { MarkersTable } from "./module-3202.mjs";
import { ResourceListDnDHandler } from "./module-1381.mjs";
import { IOpenerService, withSelection } from "./module-0272.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { groupBy2 } from "./module-0007.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { MenuId } from "./module-0092.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { Separator } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IListService, WorkbenchObjectTree } from "./module-0636.mjs";
import { isDefined } from "./module-0010.mjs";
import { fillInMarkersDragData } from "./module-0273.mjs";


// src/vs/workbench/contrib/markers/browser/markersView.ts
function createResourceMarkersIterator(resourceMarkers) {
  return Iterable.map(resourceMarkers.markers, (m) => {
    const relatedInformationIt = Iterable.from(m.relatedInformation);
    const children = Iterable.map(relatedInformationIt, (r2) => ({ element: r2 }));
    return { element: m, children };
  });
}

var MarkersView = class extends FilterViewPane {
  constructor(options3, instantiationService, viewDescriptorService, editorService, configurationService, markerService, contextKeyService, workspaceContextService, contextMenuService, uriIdentityService, keybindingService, storageService, openerService, themeService, hoverService) {
    const memento = new Memento(Markers.MARKERS_VIEW_STORAGE_ID, storageService);
    const panelState = memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    super({
      ...options3,
      filterOptions: {
        ariaLabel: Messages.MARKERS_PANEL_FILTER_ARIA_LABEL,
        placeholder: Messages.MARKERS_PANEL_FILTER_PLACEHOLDER,
        focusContextKey: MarkersContextKeys.MarkerViewFilterFocusContextKey.key,
        text: panelState.filter || "",
        history: panelState.filterHistory || []
      }
    }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.editorService = editorService;
    this.markerService = markerService;
    this.workspaceContextService = workspaceContextService;
    this.uriIdentityService = uriIdentityService;
    this.lastSelectedRelativeTop = 0;
    this.currentActiveResource = null;
    this.onVisibleDisposables = this._register(new DisposableStore());
    this.widgetDisposables = this._register(new DisposableStore());
    this.currentHeight = 0;
    this.currentWidth = 0;
    this.cachedFilterStats = void 0;
    this.currentResourceGotAddedToMarkersData = false;
    this.onDidChangeVisibility = this.onDidChangeBodyVisibility;
    this.memento = memento;
    this.panelState = panelState;
    this.markersModel = this._register(instantiationService.createInstance(MarkersModel));
    this.markersViewModel = this._register(instantiationService.createInstance(MarkersViewModel, this.panelState.multiline, this.panelState.viewMode ?? this.getDefaultViewMode()));
    this._register(this.onDidChangeVisibility((visible) => this.onDidChangeMarkersViewVisibility(visible)));
    this._register(this.markersViewModel.onDidChangeViewMode((_) => this.onDidChangeViewMode()));
    this.widgetAccessibilityProvider = instantiationService.createInstance(MarkersWidgetAccessibilityProvider);
    this.widgetIdentityProvider = { getId(element) {
      return element.id;
    } };
    this.setCurrentActiveEditor();
    this.filter = new Filter2(FilterOptions2.EMPTY(uriIdentityService));
    this.rangeHighlightDecorations = this._register(this.instantiationService.createInstance(RangeHighlightDecorations));
    this.filters = this._register(new MarkersFilters({
      filterHistory: this.panelState.filterHistory || [],
      showErrors: this.panelState.showErrors !== false,
      showWarnings: this.panelState.showWarnings !== false,
      showInfos: this.panelState.showInfos !== false,
      excludedFiles: !!this.panelState.useFilesExclude,
      activeFile: !!this.panelState.activeFile
    }, this.contextKeyService));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (this.filters.excludedFiles && e.affectsConfiguration("files.exclude")) {
        this.updateFilter();
      }
    }));
  }
  render() {
    super.render();
    this._register(registerNavigableContainer({
      name: "markersView",
      focusNotifiers: [this, this.filterWidget],
      focusNextWidget: () => {
        if (this.filterWidget.hasFocus()) {
          this.focus();
        }
      },
      focusPreviousWidget: () => {
        if (!this.filterWidget.hasFocus()) {
          this.focusFilter();
        }
      }
    }));
  }
  renderBody(parent) {
    super.renderBody(parent);
    parent.classList.add("markers-panel");
    this._register(addDisposableListener(parent, "keydown", (e) => {
      const event = new StandardKeyboardEvent(e);
      if (!this.keybindingService.mightProducePrintableCharacter(event)) {
        return;
      }
      const result = this.keybindingService.softDispatch(event, event.target);
      if (result.kind === 1 /* MoreChordsNeeded */ || result.kind === 2 /* KbFound */) {
        return;
      }
      this.focusFilter();
    }));
    const panelContainer = append(parent, $(".markers-panel-container"));
    this.createArialLabelElement(panelContainer);
    this.createMessageBox(panelContainer);
    this.widgetContainer = append(panelContainer, $(".widget-container"));
    this.createWidget(this.widgetContainer);
    this.updateFilter();
    this.renderContent();
  }
  getTitle() {
    return Messages.MARKERS_PANEL_TITLE_PROBLEMS.value;
  }
  layoutBodyContent(height = this.currentHeight, width2 = this.currentWidth) {
    if (this.messageBoxContainer) {
      this.messageBoxContainer.style.height = `${height}px`;
    }
    this.widget.layout(height, width2);
    this.currentHeight = height;
    this.currentWidth = width2;
  }
  focus() {
    super.focus();
    if (isActiveElement(this.widget.getHTMLElement())) {
      return;
    }
    if (this.hasNoProblems()) {
      this.messageBoxContainer.focus();
    } else {
      this.widget.domFocus();
      this.widget.setMarkerSelection();
    }
  }
  focusFilter() {
    this.filterWidget.focus();
  }
  updateBadge(total, filtered) {
    this.filterWidget.updateBadge(total === filtered || total === 0 ? void 0 : localize(16716, null, filtered, total));
  }
  checkMoreFilters() {
    this.filterWidget.checkMoreFilters(!this.filters.showErrors || !this.filters.showWarnings || !this.filters.showInfos || this.filters.excludedFiles || this.filters.activeFile);
  }
  clearFilterText() {
    this.filterWidget.setFilterText("");
  }
  showQuickFixes(marker) {
    const viewModel = this.markersViewModel.getViewModel(marker);
    if (viewModel) {
      viewModel.quickFixAction.run();
    }
  }
  openFileAtElement(element, preserveFocus, sideByside, pinned) {
    const { resource, selection } = element instanceof Marker3 ? { resource: element.resource, selection: element.range } : element instanceof RelatedInformation ? { resource: element.raw.resource, selection: element.raw } : "marker" in element ? { resource: element.marker.resource, selection: element.marker.range } : { resource: null, selection: null };
    if (resource && selection) {
      this.editorService.openEditor({
        resource,
        options: {
          selection,
          preserveFocus,
          pinned,
          revealIfVisible: true
        }
      }, sideByside ? SIDE_GROUP : ACTIVE_GROUP).then((editor) => {
        if (editor && preserveFocus) {
          this.rangeHighlightDecorations.highlightRange({ resource, range: selection }, editor.getControl());
        } else {
          this.rangeHighlightDecorations.removeHighlightRange();
        }
      });
      return true;
    } else {
      this.rangeHighlightDecorations.removeHighlightRange();
    }
    return false;
  }
  refreshPanel(markerOrChange) {
    if (this.isVisible()) {
      const hasSelection = this.widget.getSelection().length > 0;
      if (markerOrChange) {
        if (markerOrChange instanceof Marker3) {
          this.widget.updateMarker(markerOrChange);
        } else {
          if (markerOrChange.added.size || markerOrChange.removed.size || this.filters.activeFile) {
            this.resetWidget();
          } else {
            this.widget.update([...markerOrChange.updated]);
          }
        }
      } else {
        this.resetWidget();
      }
      if (hasSelection) {
        this.widget.setMarkerSelection();
      }
      this.cachedFilterStats = void 0;
      const { total, filtered } = this.getFilterStats();
      this.toggleVisibility(total === 0 || filtered === 0);
      this.renderMessage();
      this.updateBadge(total, filtered);
      this.checkMoreFilters();
    }
  }
  onDidChangeViewState(marker) {
    this.refreshPanel(marker);
  }
  resetWidget() {
    this.widget.reset(this.getResourceMarkers());
  }
  updateFilter() {
    this.filter.options = new FilterOptions2(this.filterWidget.getFilterText(), this.getFilesExcludeExpressions(), this.filters.showWarnings, this.filters.showErrors, this.filters.showInfos, this.uriIdentityService);
    this.widget.filterMarkers(this.getResourceMarkers(), this.filter.options);
    this.cachedFilterStats = void 0;
    const { total, filtered } = this.getFilterStats();
    this.toggleVisibility(total === 0 || filtered === 0);
    this.renderMessage();
    this.updateBadge(total, filtered);
    this.checkMoreFilters();
  }
  getDefaultViewMode() {
    switch (this.configurationService.getValue("problems.defaultViewMode")) {
      case "table":
        return "table" /* Table */;
      case "tree":
        return "tree" /* Tree */;
      default:
        return "tree" /* Tree */;
    }
  }
  getFilesExcludeExpressions() {
    if (!this.filters.excludedFiles) {
      return [];
    }
    const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
    return workspaceFolders.length ? workspaceFolders.map((workspaceFolder) => ({ root: workspaceFolder.uri, expression: this.getFilesExclude(workspaceFolder.uri) })) : this.getFilesExclude();
  }
  getFilesExclude(resource) {
    return deepClone(this.configurationService.getValue("files.exclude", { resource })) || {};
  }
  getResourceMarkers() {
    if (!this.filters.activeFile) {
      return this.markersModel.resourceMarkers;
    }
    let resourceMarkers = [];
    if (this.currentActiveResource) {
      const activeResourceMarkers = this.markersModel.getResourceMarkers(this.currentActiveResource);
      if (activeResourceMarkers) {
        resourceMarkers = [activeResourceMarkers];
      }
    }
    return resourceMarkers;
  }
  createMessageBox(parent) {
    this.messageBoxContainer = append(parent, $(".message-box-container"));
    this.messageBoxContainer.setAttribute("aria-labelledby", "markers-panel-arialabel");
  }
  createArialLabelElement(parent) {
    this.ariaLabelElement = append(parent, $(""));
    this.ariaLabelElement.setAttribute("id", "markers-panel-arialabel");
  }
  createWidget(parent) {
    this.widget = this.markersViewModel.viewMode === "table" /* Table */ ? this.createTable(parent) : this.createTree(parent);
    this.widgetDisposables.add(this.widget);
    const markerFocusContextKey = MarkersContextKeys.MarkerFocusContextKey.bindTo(this.widget.contextKeyService);
    const relatedInformationFocusContextKey = MarkersContextKeys.RelatedInformationFocusContextKey.bindTo(this.widget.contextKeyService);
    this.widgetDisposables.add(this.widget.onDidChangeFocus((focus) => {
      markerFocusContextKey.set(focus.elements.some((e) => e instanceof Marker3));
      relatedInformationFocusContextKey.set(focus.elements.some((e) => e instanceof RelatedInformation));
    }));
    this.widgetDisposables.add(Event2.debounce(this.widget.onDidOpen, (last, event) => event, 75, true)((options3) => {
      this.openFileAtElement(options3.element, !!options3.editorOptions.preserveFocus, options3.sideBySide, !!options3.editorOptions.pinned);
    }));
    this.widgetDisposables.add(Event2.any(this.widget.onDidChangeSelection, this.widget.onDidChangeFocus)(() => {
      const elements = [...this.widget.getSelection(), ...this.widget.getFocus()];
      for (const element of elements) {
        if (element instanceof Marker3) {
          const viewModel = this.markersViewModel.getViewModel(element);
          viewModel?.showLightBulb();
        }
      }
    }));
    this.widgetDisposables.add(this.widget.onContextMenu(this.onContextMenu, this));
    this.widgetDisposables.add(this.widget.onDidChangeSelection(this.onSelected, this));
  }
  createTable(parent) {
    const table = this.instantiationService.createInstance(
      MarkersTable,
      append(parent, $(".markers-table-container")),
      this.markersViewModel,
      this.getResourceMarkers(),
      this.filter.options,
      {
        accessibilityProvider: this.widgetAccessibilityProvider,
        dnd: this.instantiationService.createInstance(ResourceListDnDHandler, (element) => {
          if (element instanceof MarkerTableItem) {
            return withSelection(element.resource, element.range);
          }
          return null;
        }),
        horizontalScrolling: false,
        identityProvider: this.widgetIdentityProvider,
        multipleSelectionSupport: true,
        selectionNavigation: true
      }
    );
    return table;
  }
  createTree(parent) {
    const onDidChangeRenderNodeCount = new Relay();
    const treeLabels = this.instantiationService.createInstance(ResourceLabels, this);
    const virtualDelegate = new VirtualDelegate(this.markersViewModel);
    const renderers = [
      this.instantiationService.createInstance(ResourceMarkersRenderer, treeLabels, onDidChangeRenderNodeCount.event),
      this.instantiationService.createInstance(MarkerRenderer, this.markersViewModel),
      this.instantiationService.createInstance(RelatedInformationRenderer)
    ];
    const tree = this.instantiationService.createInstance(
      MarkersTree,
      "MarkersView",
      append(parent, $(".tree-container.show-file-icons")),
      virtualDelegate,
      renderers,
      {
        filter: this.filter,
        accessibilityProvider: this.widgetAccessibilityProvider,
        identityProvider: this.widgetIdentityProvider,
        dnd: this.instantiationService.createInstance(MarkersListDnDHandler),
        expandOnlyOnTwistieClick: (e) => e instanceof Marker3 && e.relatedInformation.length > 0,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles,
        selectionNavigation: true,
        multipleSelectionSupport: true
      }
    );
    onDidChangeRenderNodeCount.input = tree.onDidChangeRenderNodeCount;
    return tree;
  }
  collapseAll() {
    this.widget.collapseMarkers();
  }
  setMultiline(multiline) {
    this.markersViewModel.multiline = multiline;
  }
  setViewMode(viewMode) {
    this.markersViewModel.viewMode = viewMode;
  }
  onDidChangeMarkersViewVisibility(visible) {
    this.onVisibleDisposables.clear();
    if (visible) {
      for (const disposable of this.reInitialize()) {
        this.onVisibleDisposables.add(disposable);
      }
      this.refreshPanel();
    }
  }
  reInitialize() {
    const disposables = [];
    const readMarkers = (resource) => this.markerService.read({ resource, severities: 8 /* Error */ | 4 /* Warning */ | 2 /* Info */ });
    this.markersModel.setResourceMarkers(groupBy2(readMarkers(), compareMarkersByUri).map((group2) => [group2[0].resource, group2]));
    disposables.push(Event2.debounce(this.markerService.onMarkerChanged, (resourcesMap, resources) => {
      resourcesMap = resourcesMap || new ResourceMap();
      resources.forEach((resource) => resourcesMap.set(resource, resource));
      return resourcesMap;
    }, 64)((resourcesMap) => {
      this.markersModel.setResourceMarkers([...resourcesMap.values()].map((resource) => [resource, readMarkers(resource)]));
    }));
    disposables.push(Event2.any(this.markersModel.onDidChange, this.editorService.onDidActiveEditorChange)((changes) => {
      if (changes) {
        this.onDidChangeModel(changes);
      } else {
        this.onActiveEditorChanged();
      }
    }));
    disposables.push(toDisposable(() => this.markersModel.reset()));
    this.markersModel.resourceMarkers.forEach((resourceMarker) => resourceMarker.markers.forEach((marker) => this.markersViewModel.add(marker)));
    disposables.push(this.markersViewModel.onDidChange((marker) => this.onDidChangeViewState(marker)));
    disposables.push(toDisposable(() => this.markersModel.resourceMarkers.forEach((resourceMarker) => this.markersViewModel.remove(resourceMarker.resource))));
    disposables.push(this.filters.onDidChange((event) => {
      if (event.activeFile) {
        this.refreshPanel();
      } else if (event.excludedFiles || event.showWarnings || event.showErrors || event.showInfos) {
        this.updateFilter();
      }
    }));
    disposables.push(this.filterWidget.onDidChangeFilterText((e) => this.updateFilter()));
    disposables.push(toDisposable(() => {
      this.cachedFilterStats = void 0;
    }));
    disposables.push(toDisposable(() => this.rangeHighlightDecorations.removeHighlightRange()));
    return disposables;
  }
  onDidChangeModel(change) {
    const resourceMarkers = [...change.added, ...change.removed, ...change.updated];
    const resources = [];
    for (const { resource } of resourceMarkers) {
      this.markersViewModel.remove(resource);
      const resourceMarkers2 = this.markersModel.getResourceMarkers(resource);
      if (resourceMarkers2) {
        for (const marker of resourceMarkers2.markers) {
          this.markersViewModel.add(marker);
        }
      }
      resources.push(resource);
    }
    this.currentResourceGotAddedToMarkersData = this.currentResourceGotAddedToMarkersData || this.isCurrentResourceGotAddedToMarkersData(resources);
    this.refreshPanel(change);
    this.updateRangeHighlights();
    if (this.currentResourceGotAddedToMarkersData) {
      this.autoReveal();
      this.currentResourceGotAddedToMarkersData = false;
    }
  }
  onDidChangeViewMode() {
    if (this.widgetContainer && this.widget) {
      this.widgetContainer.textContent = "";
      this.widgetDisposables.clear();
    }
    const selection = /* @__PURE__ */ new Set();
    for (const marker of this.widget.getSelection()) {
      if (marker instanceof ResourceMarkers) {
        marker.markers.forEach((m) => selection.add(m));
      } else if (marker instanceof Marker3 || marker instanceof MarkerTableItem) {
        selection.add(marker);
      }
    }
    const focus = /* @__PURE__ */ new Set();
    for (const marker of this.widget.getFocus()) {
      if (marker instanceof Marker3 || marker instanceof MarkerTableItem) {
        focus.add(marker);
      }
    }
    this.createWidget(this.widgetContainer);
    this.refreshPanel();
    if (selection.size > 0) {
      this.widget.setMarkerSelection(Array.from(selection), Array.from(focus));
      this.widget.domFocus();
    }
  }
  isCurrentResourceGotAddedToMarkersData(changedResources) {
    const currentlyActiveResource = this.currentActiveResource;
    if (!currentlyActiveResource) {
      return false;
    }
    const resourceForCurrentActiveResource = this.getResourceForCurrentActiveResource();
    if (resourceForCurrentActiveResource) {
      return false;
    }
    return changedResources.some((r2) => r2.toString() === currentlyActiveResource.toString());
  }
  onActiveEditorChanged() {
    this.setCurrentActiveEditor();
    if (this.filters.activeFile) {
      this.refreshPanel();
    }
    this.autoReveal();
  }
  setCurrentActiveEditor() {
    const activeEditor = this.editorService.activeEditor;
    this.currentActiveResource = activeEditor ? EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: 1 /* PRIMARY */ }) ?? null : null;
  }
  onSelected() {
    const selection = this.widget.getSelection();
    if (selection && selection.length > 0) {
      this.lastSelectedRelativeTop = this.widget.getRelativeTop(selection[0]) || 0;
    }
  }
  hasNoProblems() {
    const { total, filtered } = this.getFilterStats();
    return total === 0 || filtered === 0;
  }
  renderContent() {
    this.cachedFilterStats = void 0;
    this.resetWidget();
    this.toggleVisibility(this.hasNoProblems());
    this.renderMessage();
  }
  renderMessage() {
    if (!this.messageBoxContainer || !this.ariaLabelElement) {
      return;
    }
    clearNode(this.messageBoxContainer);
    const { total, filtered } = this.getFilterStats();
    if (filtered === 0) {
      this.messageBoxContainer.style.display = "block";
      this.messageBoxContainer.setAttribute("tabIndex", "0");
      if (this.filters.activeFile) {
        this.renderFilterMessageForActiveFile(this.messageBoxContainer);
      } else {
        if (total > 0) {
          this.renderFilteredByFilterMessage(this.messageBoxContainer);
        } else {
          this.renderNoProblemsMessage(this.messageBoxContainer);
        }
      }
    } else {
      this.messageBoxContainer.style.display = "none";
      if (filtered === total) {
        this.setAriaLabel(localize(16714, null, total));
      } else {
        this.setAriaLabel(localize(16715, null, filtered, total));
      }
      this.messageBoxContainer.removeAttribute("tabIndex");
    }
  }
  renderFilterMessageForActiveFile(container3) {
    if (this.currentActiveResource && this.markersModel.getResourceMarkers(this.currentActiveResource)) {
      this.renderFilteredByFilterMessage(container3);
    } else {
      this.renderNoProblemsMessageForActiveFile(container3);
    }
  }
  renderFilteredByFilterMessage(container3) {
    const span1 = append(container3, $("span"));
    span1.textContent = Messages.MARKERS_PANEL_NO_PROBLEMS_FILTERS;
    const link2 = append(container3, $("a.messageAction"));
    link2.textContent = localize(16713, null);
    link2.setAttribute("tabIndex", "0");
    const span2 = append(container3, $("span"));
    span2.textContent = ".";
    addStandardDisposableListener(link2, EventType.CLICK, () => this.clearFilters());
    addStandardDisposableListener(link2, EventType.KEY_DOWN, (e) => {
      if (e.equals(3 /* Enter */) || e.equals(10 /* Space */)) {
        this.clearFilters();
        e.stopPropagation();
      }
    });
    this.setAriaLabel(Messages.MARKERS_PANEL_NO_PROBLEMS_FILTERS);
  }
  renderNoProblemsMessageForActiveFile(container3) {
    const span = append(container3, $("span"));
    span.textContent = Messages.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT;
    this.setAriaLabel(Messages.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT);
  }
  renderNoProblemsMessage(container3) {
    const span = append(container3, $("span"));
    span.textContent = Messages.MARKERS_PANEL_NO_PROBLEMS_BUILT;
    this.setAriaLabel(Messages.MARKERS_PANEL_NO_PROBLEMS_BUILT);
  }
  setAriaLabel(label3) {
    this.widget.setAriaLabel(label3);
    this.ariaLabelElement.setAttribute("aria-label", label3);
  }
  clearFilters() {
    this.filterWidget.setFilterText("");
    this.filters.excludedFiles = false;
    this.filters.showErrors = true;
    this.filters.showWarnings = true;
    this.filters.showInfos = true;
  }
  autoReveal(focus = false) {
    if (this.filters.activeFile) {
      return;
    }
    const autoReveal = this.configurationService.getValue("problems.autoReveal");
    if (typeof autoReveal === "boolean" && autoReveal) {
      const currentActiveResource = this.getResourceForCurrentActiveResource();
      this.widget.revealMarkers(currentActiveResource, focus, this.lastSelectedRelativeTop);
    }
  }
  getResourceForCurrentActiveResource() {
    return this.currentActiveResource ? this.markersModel.getResourceMarkers(this.currentActiveResource) : null;
  }
  updateRangeHighlights() {
    this.rangeHighlightDecorations.removeHighlightRange();
    if (isActiveElement(this.widget.getHTMLElement())) {
      this.highlightCurrentSelectedMarkerRange();
    }
  }
  highlightCurrentSelectedMarkerRange() {
    const selections = this.widget.getSelection() ?? [];
    if (selections.length !== 1) {
      return;
    }
    const selection = selections[0];
    if (!(selection instanceof Marker3)) {
      return;
    }
    this.rangeHighlightDecorations.highlightRange(selection);
  }
  onContextMenu(e) {
    const element = e.element;
    if (!element) {
      return;
    }
    e.browserEvent.preventDefault();
    e.browserEvent.stopPropagation();
    this.contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      menuId: MenuId.ProblemsPanelContext,
      contextKeyService: this.widget.contextKeyService,
      getActions: () => this.getMenuActions(element),
      getActionViewItem: (action) => {
        const keybinding = this.keybindingService.lookupKeybinding(action.id);
        if (keybinding) {
          return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
        }
        return void 0;
      },
      onHide: (wasCancelled) => {
        if (wasCancelled) {
          this.widget.domFocus();
        }
      }
    });
  }
  getMenuActions(element) {
    const result = [];
    if (element instanceof Marker3) {
      const viewModel = this.markersViewModel.getViewModel(element);
      if (viewModel) {
        const quickFixActions = viewModel.quickFixAction.quickFixes;
        if (quickFixActions.length) {
          result.push(...quickFixActions);
          result.push(new Separator());
        }
      }
    }
    return result;
  }
  getFocusElement() {
    return this.widget.getFocus()[0] ?? void 0;
  }
  getFocusedSelectedElements() {
    const focus = this.getFocusElement();
    if (!focus) {
      return null;
    }
    const selection = this.widget.getSelection();
    if (selection.includes(focus)) {
      const result = [];
      for (const selected of selection) {
        if (selected) {
          result.push(selected);
        }
      }
      return result;
    } else {
      return [focus];
    }
  }
  getAllResourceMarkers() {
    return this.markersModel.resourceMarkers;
  }
  getFilterStats() {
    if (!this.cachedFilterStats) {
      this.cachedFilterStats = {
        total: this.markersModel.total,
        filtered: this.widget?.getVisibleItemCount() ?? 0
      };
    }
    return this.cachedFilterStats;
  }
  toggleVisibility(hide4) {
    this.widget.toggleVisibility(hide4);
    this.layoutBodyContent();
  }
  saveState() {
    this.panelState.filter = this.filterWidget.getFilterText();
    this.panelState.filterHistory = this.filters.filterHistory;
    this.panelState.showErrors = this.filters.showErrors;
    this.panelState.showWarnings = this.filters.showWarnings;
    this.panelState.showInfos = this.filters.showInfos;
    this.panelState.useFilesExclude = this.filters.excludedFiles;
    this.panelState.activeFile = this.filters.activeFile;
    this.panelState.multiline = this.markersViewModel.multiline;
    this.panelState.viewMode = this.markersViewModel.viewMode;
    this.memento.saveMemento();
    super.saveState();
  }
  dispose() {
    super.dispose();
  }
};

MarkersView = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IMarkerService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IWorkspaceContextService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IUriIdentityService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IOpenerService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, IHoverService)
], MarkersView);

var MarkersTree = class extends WorkbenchObjectTree {
  constructor(user, container3, delegate, renderers, options3, instantiationService, contextKeyService, listService, themeService, configurationService) {
    super(user, container3, delegate, renderers, options3, instantiationService, contextKeyService, listService, configurationService);
    this.container = container3;
    this.visibilityContextKey = MarkersContextKeys.MarkersTreeVisibilityContextKey.bindTo(contextKeyService);
  }
  collapseMarkers() {
    this.collapseAll();
    this.setSelection([]);
    this.setFocus([]);
    this.getHTMLElement().focus();
    this.focusFirst();
  }
  filterMarkers() {
    this.refilter();
  }
  getVisibleItemCount() {
    let filtered = 0;
    const root = this.getNode();
    for (const resourceMarkerNode of root.children) {
      for (const markerNode of resourceMarkerNode.children) {
        if (resourceMarkerNode.visible && markerNode.visible) {
          filtered++;
        }
      }
    }
    return filtered;
  }
  isVisible() {
    return !this.container.classList.contains("hidden");
  }
  toggleVisibility(hide4) {
    this.visibilityContextKey.set(!hide4);
    this.container.classList.toggle("hidden", hide4);
  }
  reset(resourceMarkers) {
    this.setChildren(null, Iterable.map(resourceMarkers, (m) => ({ element: m, children: createResourceMarkersIterator(m) })));
  }
  revealMarkers(activeResource, focus, lastSelectedRelativeTop) {
    if (activeResource) {
      if (this.hasElement(activeResource)) {
        if (!this.isCollapsed(activeResource) && this.hasSelectedMarkerFor(activeResource)) {
          this.reveal(this.getSelection()[0], lastSelectedRelativeTop);
          if (focus) {
            this.setFocus(this.getSelection());
          }
        } else {
          this.expand(activeResource);
          this.reveal(activeResource, 0);
          if (focus) {
            this.setFocus([activeResource]);
            this.setSelection([activeResource]);
          }
        }
      }
    } else if (focus) {
      this.setSelection([]);
      this.focusFirst();
    }
  }
  setAriaLabel(label3) {
    this.ariaLabel = label3;
  }
  setMarkerSelection(selection, focus) {
    if (this.isVisible()) {
      if (selection && selection.length > 0) {
        this.setSelection(selection.map((m) => this.findMarkerNode(m)));
        if (focus && focus.length > 0) {
          this.setFocus(focus.map((f) => this.findMarkerNode(f)));
        } else {
          this.setFocus([this.findMarkerNode(selection[0])]);
        }
        this.reveal(this.findMarkerNode(selection[0]));
      } else if (this.getSelection().length === 0) {
        const firstVisibleElement = this.firstVisibleElement;
        const marker = firstVisibleElement ? firstVisibleElement instanceof ResourceMarkers ? firstVisibleElement.markers[0] : firstVisibleElement instanceof Marker3 ? firstVisibleElement : void 0 : void 0;
        if (marker) {
          this.setSelection([marker]);
          this.setFocus([marker]);
          this.reveal(marker);
        }
      }
    }
  }
  update(resourceMarkers) {
    for (const resourceMarker of resourceMarkers) {
      if (this.hasElement(resourceMarker)) {
        this.setChildren(resourceMarker, createResourceMarkersIterator(resourceMarker));
        this.rerender(resourceMarker);
      }
    }
  }
  updateMarker(marker) {
    this.rerender(marker);
  }
  findMarkerNode(marker) {
    for (const resourceNode of this.getNode().children) {
      for (const markerNode of resourceNode.children) {
        if (markerNode.element instanceof Marker3 && markerNode.element.marker === marker.marker) {
          return markerNode.element;
        }
      }
    }
    return null;
  }
  hasSelectedMarkerFor(resource) {
    const selectedElement = this.getSelection();
    if (selectedElement && selectedElement.length > 0) {
      if (selectedElement[0] instanceof Marker3) {
        if (resource.has(selectedElement[0].marker.resource)) {
          return true;
        }
      }
    }
    return false;
  }
  dispose() {
    super.dispose();
  }
  layout(height, width2) {
    this.container.style.height = `${height}px`;
    super.layout(height, width2);
  }
};

MarkersTree = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IListService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IConfigurationService)
], MarkersTree);

var MarkersListDnDHandler = class extends ResourceListDnDHandler {
  constructor(instantiationService) {
    super((element) => {
      if (element instanceof MarkerTableItem) {
        return withSelection(element.resource, element.range);
      } else if (element instanceof ResourceMarkers) {
        return element.resource;
      } else if (element instanceof Marker3) {
        return withSelection(element.resource, element.range);
      } else if (element instanceof RelatedInformation) {
        return withSelection(element.raw.resource, element.raw);
      }
      return null;
    }, instantiationService);
  }
  onWillDragElements(elements, originalEvent) {
    const data = elements.map((e) => {
      if (e instanceof RelatedInformation || e instanceof Marker3) {
        return e.marker;
      }
      if (e instanceof ResourceMarkers) {
        return { uri: e.resource };
      }
      return void 0;
    }).filter(isDefined);
    if (!data.length) {
      return;
    }
    fillInMarkersDragData(data, originalEvent);
  }
};

MarkersListDnDHandler = __decorateClass([
  __decorateParam(0, IInstantiationService)
], MarkersListDnDHandler);
export { createResourceMarkersIterator, MarkersView, MarkersTree, MarkersListDnDHandler };
