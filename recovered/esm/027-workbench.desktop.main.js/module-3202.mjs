// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markersTable.ts
import { $, append, findParentWithClass } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { QuickFixAction2, QuickFixActionViewItem2 } from "./module-3201.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { isUndefinedOrNull } from "./module-0010.mjs";
import { MarkerSeverity2 } from "./module-0560.mjs";
import { severity_default } from "./module-0266.mjs";
import { SeverityIcon } from "./module-0699.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { Link } from "./module-0550.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { Messages } from "./module-3200.mjs";
import { ILabelService } from "./module-0641.mjs";
import { WorkbenchTable } from "./module-0636.mjs";
import { localize } from "./module-0001.mjs";
import { Event2 } from "./module-0017.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { unsupportedSchemas } from "./module-1813.mjs";
import { Marker3, MarkerTableItem, compareMarkersByUri } from "./module-3198.mjs";
import { FilterOptions2 } from "./module-3199.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/markers/browser/markersTable.ts
var $104 = $;

var MarkerSeverityColumnRenderer = class {
  constructor(markersViewModel, instantiationService) {
    this.markersViewModel = markersViewModel;
    this.instantiationService = instantiationService;
    this.templateId = MarkerSeverityColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "severity";
  }
  renderTemplate(container3) {
    const severityColumn = append(container3, $104(".severity"));
    const icon2 = append(severityColumn, $104(""));
    const actionBarColumn = append(container3, $104(".actions"));
    const actionBar3 = new ActionBar(actionBarColumn, {
      actionViewItemProvider: (action, options3) => action.id === QuickFixAction2.ID ? this.instantiationService.createInstance(QuickFixActionViewItem2, action, options3) : void 0
    });
    return { actionBar: actionBar3, icon: icon2, elementDisposables: new DisposableStore() };
  }
  renderElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
    const toggleQuickFix = (enabled) => {
      if (!isUndefinedOrNull(enabled)) {
        const container3 = findParentWithClass(templateData.icon, "monaco-table-td");
        container3.classList.toggle("quickFix", enabled);
      }
    };
    templateData.icon.title = MarkerSeverity2.toString(element.marker.severity);
    templateData.icon.className = `marker-icon ${severity_default.toString(MarkerSeverity2.toSeverity(element.marker.severity))} codicon ${SeverityIcon.className(MarkerSeverity2.toSeverity(element.marker.severity))}`;
    templateData.actionBar.clear();
    const viewModel = this.markersViewModel.getViewModel(element);
    if (viewModel) {
      const quickFixAction = viewModel.quickFixAction;
      templateData.actionBar.push([quickFixAction], { icon: true, label: false });
      toggleQuickFix(viewModel.quickFixAction.enabled);
      templateData.elementDisposables.add(quickFixAction.onDidChange(({ enabled }) => toggleQuickFix(enabled)));
      templateData.elementDisposables.add(quickFixAction.onShowQuickFixes(() => {
        const quickFixActionViewItem = templateData.actionBar.viewItems[0];
        if (quickFixActionViewItem) {
          quickFixActionViewItem.showQuickFixes();
        }
      }));
    }
  }
  disposeElement(element, index2, templateData, details) {
    templateData.elementDisposables.clear();
    templateData.actionBar.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.actionBar.dispose();
  }
};

MarkerSeverityColumnRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService)
], MarkerSeverityColumnRenderer);

var MarkerCodeColumnRenderer = class {
  constructor(hoverService, openerService) {
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.templateId = MarkerCodeColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "code";
  }
  renderTemplate(container3) {
    const templateDisposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    templateDisposables.add(elementDisposables);
    const codeColumn = append(container3, $104(".code"));
    const sourceLabel = templateDisposables.add(new HighlightedLabel(codeColumn));
    sourceLabel.element.classList.add("source-label");
    const codeLabel = templateDisposables.add(new HighlightedLabel(codeColumn));
    codeLabel.element.classList.add("code-label");
    const codeLink = templateDisposables.add(new Link(codeColumn, { href: "", label: "" }, {}, this.hoverService, this.openerService));
    return { codeColumn, sourceLabel, codeLabel, codeLink, templateDisposables, elementDisposables };
  }
  renderElement(element, index2, templateData) {
    templateData.codeColumn.classList.remove("code-label");
    templateData.codeColumn.classList.remove("code-link");
    if (element.marker.source && element.marker.code) {
      if (typeof element.marker.code === "string") {
        templateData.codeColumn.classList.add("code-label");
        templateData.codeColumn.title = `${element.marker.source} (${element.marker.code})`;
        templateData.sourceLabel.set(element.marker.source, element.sourceMatches);
        templateData.codeLabel.set(element.marker.code, element.codeMatches);
      } else {
        templateData.codeColumn.classList.add("code-link");
        templateData.codeColumn.title = `${element.marker.source} (${element.marker.code.value})`;
        templateData.sourceLabel.set(element.marker.source, element.sourceMatches);
        const codeLinkLabel = templateData.elementDisposables.add(new HighlightedLabel($104(".code-link-label")));
        codeLinkLabel.set(element.marker.code.value, element.codeMatches);
        templateData.codeLink.link = {
          href: element.marker.code.target.toString(true),
          title: element.marker.code.target.toString(true),
          label: codeLinkLabel.element
        };
      }
    } else {
      templateData.codeColumn.title = "";
      templateData.sourceLabel.set("-");
    }
  }
  disposeElement(element, index2, templateData, details) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

MarkerCodeColumnRenderer = __decorateClass([
  __decorateParam(0, IHoverService),
  __decorateParam(1, IOpenerService)
], MarkerCodeColumnRenderer);

var MarkerMessageColumnRenderer = class _MarkerMessageColumnRenderer {
  constructor() {
    this.templateId = _MarkerMessageColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "message";
  }
  renderTemplate(container3) {
    const columnElement = append(container3, $104(".message"));
    const highlightedLabel = new HighlightedLabel(columnElement);
    return { columnElement, highlightedLabel };
  }
  renderElement(element, index2, templateData) {
    templateData.columnElement.title = element.marker.message;
    templateData.highlightedLabel.set(element.marker.message, element.messageMatches);
  }
  disposeTemplate(templateData) {
    templateData.highlightedLabel.dispose();
  }
};

var MarkerFileColumnRenderer = class {
  constructor(labelService) {
    this.labelService = labelService;
    this.templateId = MarkerFileColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "file";
  }
  renderTemplate(container3) {
    const columnElement = append(container3, $104(".file"));
    const fileLabel = new HighlightedLabel(columnElement);
    fileLabel.element.classList.add("file-label");
    const positionLabel = new HighlightedLabel(columnElement);
    positionLabel.element.classList.add("file-position");
    return { columnElement, fileLabel, positionLabel };
  }
  renderElement(element, index2, templateData) {
    const positionLabel = Messages.MARKERS_PANEL_AT_LINE_COL_NUMBER(element.marker.startLineNumber, element.marker.startColumn);
    templateData.columnElement.title = `${this.labelService.getUriLabel(element.marker.resource, { relative: false })} ${positionLabel}`;
    templateData.fileLabel.set(this.labelService.getUriLabel(element.marker.resource, { relative: true }), element.fileMatches);
    templateData.positionLabel.set(positionLabel, void 0);
  }
  disposeTemplate(templateData) {
    templateData.fileLabel.dispose();
    templateData.positionLabel.dispose();
  }
};

MarkerFileColumnRenderer = __decorateClass([
  __decorateParam(0, ILabelService)
], MarkerFileColumnRenderer);

var MarkerSourceColumnRenderer = class _MarkerSourceColumnRenderer {
  constructor() {
    this.templateId = _MarkerSourceColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "source";
  }
  renderTemplate(container3) {
    const columnElement = append(container3, $104(".source"));
    const highlightedLabel = new HighlightedLabel(columnElement);
    return { columnElement, highlightedLabel };
  }
  renderElement(element, index2, templateData) {
    templateData.columnElement.title = element.marker.source ?? "";
    templateData.highlightedLabel.set(element.marker.source ?? "", element.sourceMatches);
  }
  disposeTemplate(templateData) {
    templateData.highlightedLabel.dispose();
  }
};

var MarkersTableVirtualDelegate = class _MarkersTableVirtualDelegate {
  constructor() {
    this.headerRowHeight = _MarkersTableVirtualDelegate.HEADER_ROW_HEIGHT;
  }
  static {
    this.HEADER_ROW_HEIGHT = 24;
  }
  static {
    this.ROW_HEIGHT = 24;
  }
  getHeight(item) {
    return _MarkersTableVirtualDelegate.ROW_HEIGHT;
  }
};

var MarkersTable = class extends Disposable {
  constructor(container3, markersViewModel, resourceMarkers, filterOptions, options3, instantiationService, labelService) {
    super();
    this.container = container3;
    this.markersViewModel = markersViewModel;
    this.resourceMarkers = resourceMarkers;
    this.filterOptions = filterOptions;
    this.instantiationService = instantiationService;
    this.labelService = labelService;
    this._itemCount = 0;
    this.table = this.instantiationService.createInstance(
      WorkbenchTable,
      "Markers",
      this.container,
      new MarkersTableVirtualDelegate(),
      [
        {
          label: "",
          tooltip: "",
          weight: 0,
          minimumWidth: 36,
          maximumWidth: 36,
          templateId: MarkerSeverityColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(16704, null),
          tooltip: "",
          weight: 1,
          minimumWidth: 100,
          maximumWidth: 300,
          templateId: MarkerCodeColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(16706, null),
          tooltip: "",
          weight: 4,
          templateId: MarkerMessageColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(16705, null),
          tooltip: "",
          weight: 2,
          templateId: MarkerFileColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(16707, null),
          tooltip: "",
          weight: 1,
          minimumWidth: 100,
          maximumWidth: 300,
          templateId: MarkerSourceColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        }
      ],
      [
        this.instantiationService.createInstance(MarkerSeverityColumnRenderer, this.markersViewModel),
        this.instantiationService.createInstance(MarkerCodeColumnRenderer),
        this.instantiationService.createInstance(MarkerMessageColumnRenderer),
        this.instantiationService.createInstance(MarkerFileColumnRenderer),
        this.instantiationService.createInstance(MarkerSourceColumnRenderer)
      ],
      options3
    );
    const list2 = this.table.domNode.querySelector(".monaco-list-rows");
    const onRowHover = Event2.chain(
      this._register(new DomEmitter(list2, "mouseover")).event,
      ($110) => $110.map((e) => findParentWithClass(e.target, "monaco-list-row", "monaco-list-rows")).filter((e) => !!e).map((e) => parseInt(e.getAttribute("data-index")))
    );
    const onListLeave = Event2.map(this._register(new DomEmitter(list2, "mouseleave")).event, () => -1);
    const onRowHoverOrLeave = Event2.latch(Event2.any(onRowHover, onListLeave));
    const onRowPermanentHover = Event2.debounce(onRowHoverOrLeave, (_, e) => e, 500);
    this._register(onRowPermanentHover((e) => {
      if (e !== -1 && this.table.row(e)) {
        this.markersViewModel.onMarkerMouseHover(this.table.row(e));
      }
    }));
  }
  get contextKeyService() {
    return this.table.contextKeyService;
  }
  get onContextMenu() {
    return this.table.onContextMenu;
  }
  get onDidOpen() {
    return this.table.onDidOpen;
  }
  get onDidChangeFocus() {
    return this.table.onDidChangeFocus;
  }
  get onDidChangeSelection() {
    return this.table.onDidChangeSelection;
  }
  collapseMarkers() {
  }
  domFocus() {
    this.table.domFocus();
  }
  filterMarkers(resourceMarkers, filterOptions) {
    this.filterOptions = filterOptions;
    this.reset(resourceMarkers);
  }
  getFocus() {
    const focus = this.table.getFocus();
    return focus.length > 0 ? [...focus.map((f) => this.table.row(f))] : [];
  }
  getHTMLElement() {
    return this.table.getHTMLElement();
  }
  getRelativeTop(marker) {
    return marker ? this.table.getRelativeTop(this.table.indexOf(marker)) : null;
  }
  getSelection() {
    const selection = this.table.getSelection();
    return selection.length > 0 ? [...selection.map((i2) => this.table.row(i2))] : [];
  }
  getVisibleItemCount() {
    return this._itemCount;
  }
  isVisible() {
    return !this.container.classList.contains("hidden");
  }
  layout(height, width2) {
    this.container.style.height = `${height}px`;
    this.table.layout(height, width2);
  }
  reset(resourceMarkers) {
    this.resourceMarkers = resourceMarkers;
    const items = [];
    for (const resourceMarker of this.resourceMarkers) {
      for (const marker of resourceMarker.markers) {
        if (unsupportedSchemas.has(marker.resource.scheme)) {
          continue;
        }
        if (this.filterOptions.excludesMatcher.matches(marker.resource)) {
          continue;
        }
        if (this.filterOptions.includesMatcher.matches(marker.resource)) {
          items.push(new MarkerTableItem(marker));
          continue;
        }
        const matchesSeverity = this.filterOptions.showErrors && 8 /* Error */ === marker.marker.severity || this.filterOptions.showWarnings && 4 /* Warning */ === marker.marker.severity || this.filterOptions.showInfos && 2 /* Info */ === marker.marker.severity;
        if (!matchesSeverity) {
          continue;
        }
        if (!this.filterOptions.matchesSourceFilters(marker.marker.source)) {
          continue;
        }
        if (this.filterOptions.textFilter.text) {
          const sourceMatches = marker.marker.source ? FilterOptions2._filter(this.filterOptions.textFilter.text, marker.marker.source) ?? void 0 : void 0;
          const codeMatches = marker.marker.code ? FilterOptions2._filter(this.filterOptions.textFilter.text, typeof marker.marker.code === "string" ? marker.marker.code : marker.marker.code.value) ?? void 0 : void 0;
          const messageMatches = FilterOptions2._messageFilter(this.filterOptions.textFilter.text, marker.marker.message) ?? void 0;
          const fileMatches = FilterOptions2._messageFilter(this.filterOptions.textFilter.text, this.labelService.getUriLabel(marker.resource, { relative: true })) ?? void 0;
          const matched = sourceMatches || codeMatches || messageMatches || fileMatches;
          if (matched && !this.filterOptions.textFilter.negate || !matched && this.filterOptions.textFilter.negate) {
            items.push(new MarkerTableItem(marker, sourceMatches, codeMatches, messageMatches, fileMatches));
          }
          continue;
        }
        items.push(new MarkerTableItem(marker));
      }
    }
    this._itemCount = items.length;
    this.table.splice(0, Number.POSITIVE_INFINITY, items.sort((a, b) => {
      let result = MarkerSeverity2.compare(a.marker.severity, b.marker.severity);
      if (result === 0) {
        result = compareMarkersByUri(a.marker, b.marker);
      }
      if (result === 0) {
        result = Range2.compareRangesUsingStarts(a.marker, b.marker);
      }
      return result;
    }));
  }
  revealMarkers(activeResource, focus, lastSelectedRelativeTop) {
    if (activeResource) {
      const activeResourceIndex = this.resourceMarkers.indexOf(activeResource);
      if (activeResourceIndex !== -1) {
        if (this.hasSelectedMarkerFor(activeResource)) {
          const tableSelection = this.table.getSelection();
          this.table.reveal(tableSelection[0], lastSelectedRelativeTop);
          if (focus) {
            this.table.setFocus(tableSelection);
          }
        } else {
          this.table.reveal(activeResourceIndex, 0);
          if (focus) {
            this.table.setFocus([activeResourceIndex]);
            this.table.setSelection([activeResourceIndex]);
          }
        }
      }
    } else if (focus) {
      this.table.setSelection([]);
      this.table.focusFirst();
    }
  }
  setAriaLabel(label3) {
    this.table.domNode.ariaLabel = label3;
  }
  setMarkerSelection(selection, focus) {
    if (this.isVisible()) {
      if (selection && selection.length > 0) {
        this.table.setSelection(selection.map((m) => this.findMarkerIndex(m)));
        if (focus && focus.length > 0) {
          this.table.setFocus(focus.map((f) => this.findMarkerIndex(f)));
        } else {
          this.table.setFocus([this.findMarkerIndex(selection[0])]);
        }
        this.table.reveal(this.findMarkerIndex(selection[0]));
      } else if (this.getSelection().length === 0 && this.getVisibleItemCount() > 0) {
        this.table.setSelection([0]);
        this.table.setFocus([0]);
        this.table.reveal(0);
      }
    }
  }
  toggleVisibility(hide4) {
    this.container.classList.toggle("hidden", hide4);
  }
  update(resourceMarkers) {
    for (const resourceMarker of resourceMarkers) {
      const index2 = this.resourceMarkers.indexOf(resourceMarker);
      this.resourceMarkers.splice(index2, 1, resourceMarker);
    }
    this.reset(this.resourceMarkers);
  }
  updateMarker(marker) {
    this.table.rerender();
  }
  findMarkerIndex(marker) {
    for (let index2 = 0; index2 < this.table.length; index2++) {
      if (this.table.row(index2).marker === marker.marker) {
        return index2;
      }
    }
    return -1;
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
};

MarkersTable = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILabelService)
], MarkersTable);
export { $104, MarkerSeverityColumnRenderer, MarkerCodeColumnRenderer, MarkerMessageColumnRenderer, MarkerFileColumnRenderer, MarkerSourceColumnRenderer, MarkersTableVirtualDelegate, MarkersTable };
