// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markersTreeViewer.ts
import { localize } from "./module-0001.mjs";
import { Marker3, MarkerTableItem, RelatedInformation, ResourceMarkers } from "./module-3198.mjs";
import { Messages } from "./module-3200.mjs";
import { basename, dirname } from "./module-0026.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { CountBadge } from "./module-0638.mjs";
import { defaultCountBadgeStyles } from "./module-0513.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ActionBar } from "./module-0477.mjs";
import { QuickFixAction2, QuickFixActionViewItem2 } from "./module-3201.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { severity_default } from "./module-0266.mjs";
import { MarkerSeverity2 } from "./module-0560.mjs";
import { SeverityIcon } from "./module-0699.mjs";
import { isUndefinedOrNull } from "./module-0010.mjs";
import { Action, toAction } from "./module-0082.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { Link } from "./module-0550.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { unsupportedSchemas } from "./module-1813.mjs";
import { FilterOptions2 } from "./module-3199.mjs";
import { Emitter } from "./module-0017.mjs";
import { Delayer, createCancelablePromise } from "./module-0036.mjs";
import { applyCodeAction, getCodeActions } from "./module-0559.mjs";
import { Range2 } from "./module-0106.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { Progress } from "./module-0446.mjs";
import { ACTIVE_GROUP, IEditorService } from "./module-0934.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { MarkersContextKeys } from "./module-3192.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/markers/browser/markersTreeViewer.ts
var MarkersWidgetAccessibilityProvider = class {
  constructor(labelService) {
    this.labelService = labelService;
  }
  getWidgetAriaLabel() {
    return localize(16711, null);
  }
  getAriaLabel(element) {
    if (element instanceof ResourceMarkers) {
      const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
      return Messages.MARKERS_TREE_ARIA_LABEL_RESOURCE(element.markers.length, element.name, dirname(path));
    }
    if (element instanceof Marker3 || element instanceof MarkerTableItem) {
      return Messages.MARKERS_TREE_ARIA_LABEL_MARKER(element);
    }
    if (element instanceof RelatedInformation) {
      return Messages.MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION(element.raw);
    }
    return null;
  }
};

MarkersWidgetAccessibilityProvider = __decorateClass([
  __decorateParam(0, ILabelService)
], MarkersWidgetAccessibilityProvider);

var VirtualDelegate = class _VirtualDelegate {
  constructor(markersViewState) {
    this.markersViewState = markersViewState;
  }
  static {
    this.LINE_HEIGHT = 22;
  }
  getHeight(element) {
    if (element instanceof Marker3) {
      const viewModel = this.markersViewState.getViewModel(element);
      const noOfLines = !viewModel || viewModel.multiline ? element.lines.length : 1;
      return noOfLines * _VirtualDelegate.LINE_HEIGHT;
    }
    return _VirtualDelegate.LINE_HEIGHT;
  }
  getTemplateId(element) {
    if (element instanceof ResourceMarkers) {
      return "rm" /* ResourceMarkers */;
    } else if (element instanceof Marker3) {
      return "m" /* Marker */;
    } else {
      return "ri" /* RelatedInformation */;
    }
  }
};

var ResourceMarkersRenderer = class {
  constructor(labels2, onDidChangeRenderNodeCount) {
    this.labels = labels2;
    this.renderedNodes = /* @__PURE__ */ new Map();
    this.disposables = new DisposableStore();
    this.templateId = "rm" /* ResourceMarkers */;
    onDidChangeRenderNodeCount(this.onDidChangeRenderNodeCount, this, this.disposables);
  }
  renderTemplate(container3) {
    const resourceLabelContainer = append(container3, $(".resource-label-container"));
    const resourceLabel = this.labels.create(resourceLabelContainer, { supportHighlights: true });
    const badgeWrapper = append(container3, $(".count-badge-wrapper"));
    const count2 = new CountBadge(badgeWrapper, {}, defaultCountBadgeStyles);
    return { count: count2, resourceLabel };
  }
  renderElement(node, _, templateData) {
    const resourceMarkers = node.element;
    const uriMatches = node.filterData && node.filterData.uriMatches || [];
    templateData.resourceLabel.setFile(resourceMarkers.resource, { matches: uriMatches });
    this.updateCount(node, templateData);
    const nodeRenders = this.renderedNodes.get(resourceMarkers) ?? [];
    this.renderedNodes.set(resourceMarkers, [...nodeRenders, templateData]);
  }
  disposeElement(node, index2, templateData) {
    const nodeRenders = this.renderedNodes.get(node.element) ?? [];
    const nodeRenderIndex = nodeRenders.findIndex((nodeRender) => templateData === nodeRender);
    if (nodeRenderIndex < 0) {
      throw new Error("Disposing unknown resource marker");
    }
    if (nodeRenders.length === 1) {
      this.renderedNodes.delete(node.element);
    } else {
      nodeRenders.splice(nodeRenderIndex, 1);
    }
  }
  disposeTemplate(templateData) {
    templateData.resourceLabel.dispose();
    templateData.count.dispose();
  }
  onDidChangeRenderNodeCount(node) {
    const nodeRenders = this.renderedNodes.get(node.element);
    if (!nodeRenders) {
      return;
    }
    nodeRenders.forEach((nodeRender) => this.updateCount(node, nodeRender));
  }
  updateCount(node, templateData) {
    templateData.count.setCount(node.children.reduce((r2, n2) => r2 + (n2.visible ? 1 : 0), 0));
  }
  dispose() {
    this.disposables.dispose();
  }
};

var MarkerRenderer = class {
  constructor(markersViewState, hoverService, instantiationService, openerService) {
    this.markersViewState = markersViewState;
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.templateId = "m" /* Marker */;
  }
  renderTemplate(container3) {
    const data = /* @__PURE__ */ Object.create(null);
    data.markerWidget = new MarkerWidget(container3, this.markersViewState, this.hoverService, this.openerService, this.instantiationService);
    return data;
  }
  renderElement(node, _, templateData) {
    templateData.markerWidget.render(node.element, node.filterData);
  }
  disposeTemplate(templateData) {
    templateData.markerWidget.dispose();
  }
};

MarkerRenderer = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IOpenerService)
], MarkerRenderer);

var expandedIcon2 = registerIcon("markers-view-multi-line-expanded", Codicon.chevronUp, localize(16709, null));

var collapsedIcon2 = registerIcon("markers-view-multi-line-collapsed", Codicon.chevronDown, localize(16708, null));

var toggleMultilineAction = "problems.action.toggleMultiline";

var ToggleMultilineActionViewItem = class extends ActionViewItem {
  render(container3) {
    super.render(container3);
    this.updateExpandedAttribute();
  }
  updateClass() {
    super.updateClass();
    this.updateExpandedAttribute();
  }
  updateExpandedAttribute() {
    this.element?.setAttribute("aria-expanded", `${this._action.class === ThemeIcon.asClassName(expandedIcon2)}`);
  }
};

var MarkerWidget = class extends Disposable {
  constructor(parent, markersViewModel, _hoverService, _openerService, _instantiationService) {
    super();
    this.parent = parent;
    this.markersViewModel = markersViewModel;
    this._hoverService = _hoverService;
    this._openerService = _openerService;
    this.disposables = this._register(new DisposableStore());
    this.actionBar = this._register(new ActionBar(append(parent, $(".actions")), {
      actionViewItemProvider: (action, options3) => action.id === QuickFixAction2.ID ? _instantiationService.createInstance(QuickFixActionViewItem2, action, options3) : void 0
    }));
    this.iconContainer = append(parent, $(""));
    this.icon = append(this.iconContainer, $(""));
    this.messageAndDetailsContainer = append(parent, $(".marker-message-details-container"));
    this.messageAndDetailsContainerHover = this._register(this._hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.messageAndDetailsContainer, ""));
  }
  render(element, filterData) {
    this.actionBar.clear();
    this.disposables.clear();
    clearNode(this.messageAndDetailsContainer);
    this.iconContainer.className = `marker-icon ${severity_default.toString(MarkerSeverity2.toSeverity(element.marker.severity))}`;
    this.icon.className = `codicon ${SeverityIcon.className(MarkerSeverity2.toSeverity(element.marker.severity))}`;
    this.renderQuickfixActionbar(element);
    this.renderMessageAndDetails(element, filterData);
    this.disposables.add(addDisposableListener(this.parent, EventType.MOUSE_OVER, () => this.markersViewModel.onMarkerMouseHover(element)));
    this.disposables.add(addDisposableListener(this.parent, EventType.MOUSE_LEAVE, () => this.markersViewModel.onMarkerMouseLeave(element)));
  }
  renderQuickfixActionbar(marker) {
    const viewModel = this.markersViewModel.getViewModel(marker);
    if (viewModel) {
      const quickFixAction = viewModel.quickFixAction;
      this.actionBar.push([quickFixAction], { icon: true, label: false });
      this.iconContainer.classList.toggle("quickFix", quickFixAction.enabled);
      quickFixAction.onDidChange(({ enabled }) => {
        if (!isUndefinedOrNull(enabled)) {
          this.iconContainer.classList.toggle("quickFix", enabled);
        }
      }, this, this.disposables);
      quickFixAction.onShowQuickFixes(() => {
        const quickFixActionViewItem = this.actionBar.viewItems[0];
        if (quickFixActionViewItem) {
          quickFixActionViewItem.showQuickFixes();
        }
      }, this, this.disposables);
    }
  }
  renderMultilineActionbar(marker, parent) {
    const multilineActionbar = this.disposables.add(new ActionBar(append(parent, $(".multiline-actions")), {
      actionViewItemProvider: (action2, options3) => {
        if (action2.id === toggleMultilineAction) {
          return new ToggleMultilineActionViewItem(void 0, action2, { ...options3, icon: true });
        }
        return void 0;
      }
    }));
    this.disposables.add(multilineActionbar);
    const viewModel = this.markersViewModel.getViewModel(marker);
    const multiline = viewModel && viewModel.multiline;
    const action = this.disposables.add(new Action(toggleMultilineAction));
    action.enabled = !!viewModel && marker.lines.length > 1;
    action.tooltip = multiline ? localize(16712, null) : localize(16710, null);
    action.class = ThemeIcon.asClassName(multiline ? expandedIcon2 : collapsedIcon2);
    action.run = () => {
      if (viewModel) {
        viewModel.multiline = !viewModel.multiline;
      }
      return Promise.resolve();
    };
    multilineActionbar.push([action], { icon: true, label: false });
  }
  renderMessageAndDetails(element, filterData) {
    const { marker, lines } = element;
    const viewState = this.markersViewModel.getViewModel(element);
    const multiline = !viewState || viewState.multiline;
    const lineMatches = filterData && filterData.lineMatches || [];
    this.messageAndDetailsContainerHover.update(element.marker.message);
    const lineElements = [];
    for (let index2 = 0; index2 < (multiline ? lines.length : 1); index2++) {
      const lineElement = append(this.messageAndDetailsContainer, $(".marker-message-line"));
      const messageElement = append(lineElement, $(".marker-message"));
      const highlightedLabel = this.disposables.add(new HighlightedLabel(messageElement));
      highlightedLabel.set(lines[index2].length > 1e3 ? `${lines[index2].substring(0, 1e3)}...` : lines[index2], lineMatches[index2]);
      if (lines[index2] === "") {
        lineElement.style.height = `${VirtualDelegate.LINE_HEIGHT}px`;
      }
      lineElements.push(lineElement);
    }
    this.renderDetails(marker, filterData, lineElements[0]);
    this.renderMultilineActionbar(element, lineElements[0]);
  }
  renderDetails(marker, filterData, parent) {
    parent.classList.add("details-container");
    if (marker.source || marker.code) {
      const source = this.disposables.add(new HighlightedLabel(append(parent, $(".marker-source"))));
      const sourceMatches = filterData && filterData.sourceMatches || [];
      source.set(marker.source, sourceMatches);
      if (marker.code) {
        if (typeof marker.code === "string") {
          const code = this.disposables.add(new HighlightedLabel(append(parent, $(".marker-code"))));
          const codeMatches = filterData && filterData.codeMatches || [];
          code.set(marker.code, codeMatches);
        } else {
          const container3 = $(".marker-code");
          const code = this.disposables.add(new HighlightedLabel(container3));
          const link2 = marker.code.target.toString(true);
          this.disposables.add(new Link(parent, { href: link2, label: container3, title: link2 }, void 0, this._hoverService, this._openerService));
          const codeMatches = filterData && filterData.codeMatches || [];
          code.set(marker.code.value, codeMatches);
        }
      }
    }
    const lnCol = append(parent, $("span.marker-line"));
    lnCol.textContent = Messages.MARKERS_PANEL_AT_LINE_COL_NUMBER(marker.startLineNumber, marker.startColumn);
  }
};

var RelatedInformationRenderer = class {
  constructor(labelService) {
    this.labelService = labelService;
    this.templateId = "ri" /* RelatedInformation */;
  }
  renderTemplate(container3) {
    const data = /* @__PURE__ */ Object.create(null);
    append(container3, $(".actions"));
    append(container3, $(".icon"));
    data.resourceLabel = new HighlightedLabel(append(container3, $(".related-info-resource")));
    data.lnCol = append(container3, $("span.marker-line"));
    const separator2 = append(container3, $("span.related-info-resource-separator"));
    separator2.textContent = ":";
    separator2.style.paddingRight = "4px";
    data.description = new HighlightedLabel(append(container3, $(".marker-description")));
    return data;
  }
  renderElement(node, _, templateData) {
    const relatedInformation = node.element.raw;
    const uriMatches = node.filterData && node.filterData.uriMatches || [];
    const messageMatches = node.filterData && node.filterData.messageMatches || [];
    const resourceLabelTitle = this.labelService.getUriLabel(relatedInformation.resource, { relative: true });
    templateData.resourceLabel.set(basename2(relatedInformation.resource), uriMatches, resourceLabelTitle);
    templateData.lnCol.textContent = Messages.MARKERS_PANEL_AT_LINE_COL_NUMBER(relatedInformation.startLineNumber, relatedInformation.startColumn);
    templateData.description.set(relatedInformation.message, messageMatches, relatedInformation.message);
  }
  disposeTemplate(templateData) {
    templateData.resourceLabel.dispose();
    templateData.description.dispose();
  }
};

RelatedInformationRenderer = __decorateClass([
  __decorateParam(0, ILabelService)
], RelatedInformationRenderer);

var Filter2 = class {
  constructor(options3) {
    this.options = options3;
  }
  filter(element, parentVisibility) {
    if (element instanceof ResourceMarkers) {
      return this.filterResourceMarkers(element);
    } else if (element instanceof Marker3) {
      return this.filterMarker(element, parentVisibility);
    } else {
      return this.filterRelatedInformation(element, parentVisibility);
    }
  }
  filterResourceMarkers(resourceMarkers) {
    if (unsupportedSchemas.has(resourceMarkers.resource.scheme)) {
      return false;
    }
    if (this.options.excludesMatcher.matches(resourceMarkers.resource)) {
      return false;
    }
    if (this.options.includesMatcher.matches(resourceMarkers.resource)) {
      return true;
    }
    if (this.options.textFilter.text && !this.options.textFilter.negate) {
      const uriMatches = FilterOptions2._filter(this.options.textFilter.text, basename2(resourceMarkers.resource));
      if (uriMatches) {
        return { visibility: true, data: { type: 0 /* ResourceMarkers */, uriMatches: uriMatches || [] } };
      }
    }
    return 2 /* Recurse */;
  }
  filterMarker(marker, parentVisibility) {
    const matchesSeverity = this.options.showErrors && 8 /* Error */ === marker.marker.severity || this.options.showWarnings && 4 /* Warning */ === marker.marker.severity || this.options.showInfos && 2 /* Info */ === marker.marker.severity;
    if (!matchesSeverity) {
      return false;
    }
    if (!this.options.matchesSourceFilters(marker.marker.source)) {
      return false;
    }
    if (!this.options.textFilter.text) {
      return true;
    }
    const lineMatches = [];
    for (const line of marker.lines) {
      const lineMatch = FilterOptions2._messageFilter(this.options.textFilter.text, line);
      lineMatches.push(lineMatch || []);
    }
    const sourceMatches = marker.marker.source ? FilterOptions2._filter(this.options.textFilter.text, marker.marker.source) : void 0;
    const codeMatches = marker.marker.code ? FilterOptions2._filter(this.options.textFilter.text, typeof marker.marker.code === "string" ? marker.marker.code : marker.marker.code.value) : void 0;
    const matched = sourceMatches || codeMatches || lineMatches.some((lineMatch) => lineMatch.length > 0);
    if (matched && !this.options.textFilter.negate) {
      return { visibility: true, data: { type: 1 /* Marker */, lineMatches, sourceMatches: sourceMatches || [], codeMatches: codeMatches || [] } };
    }
    if (matched && this.options.textFilter.negate && parentVisibility === 2 /* Recurse */) {
      return false;
    }
    if (!matched && this.options.textFilter.negate && parentVisibility === 2 /* Recurse */) {
      return true;
    }
    return parentVisibility;
  }
  filterRelatedInformation(relatedInformation, parentVisibility) {
    if (!this.options.textFilter.text) {
      return true;
    }
    const uriMatches = FilterOptions2._filter(this.options.textFilter.text, basename2(relatedInformation.raw.resource));
    const messageMatches = FilterOptions2._messageFilter(this.options.textFilter.text, basename(relatedInformation.raw.message));
    const matched = uriMatches || messageMatches;
    if (matched && !this.options.textFilter.negate) {
      return { visibility: true, data: { type: 2 /* RelatedInformation */, uriMatches: uriMatches || [], messageMatches: messageMatches || [] } };
    }
    if (matched && this.options.textFilter.negate && parentVisibility === 2 /* Recurse */) {
      return false;
    }
    if (!matched && this.options.textFilter.negate && parentVisibility === 2 /* Recurse */) {
      return true;
    }
    return parentVisibility;
  }
};

var MarkerViewModel = class extends Disposable {
  constructor(marker, modelService, instantiationService, editorService, languageFeaturesService) {
    super();
    this.marker = marker;
    this.modelService = modelService;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.languageFeaturesService = languageFeaturesService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.modelPromise = null;
    this.codeActionsPromise = null;
    this._multiline = true;
    this._quickFixAction = null;
    this._register(toDisposable(() => {
      if (this.modelPromise) {
        this.modelPromise.cancel();
      }
      if (this.codeActionsPromise) {
        this.codeActionsPromise.cancel();
      }
    }));
  }
  get multiline() {
    return this._multiline;
  }
  set multiline(value2) {
    if (this._multiline !== value2) {
      this._multiline = value2;
      this._onDidChange.fire();
    }
  }
  get quickFixAction() {
    if (!this._quickFixAction) {
      this._quickFixAction = this._register(this.instantiationService.createInstance(QuickFixAction2, this.marker));
    }
    return this._quickFixAction;
  }
  showLightBulb() {
    this.setQuickFixes(true);
  }
  async setQuickFixes(waitForModel) {
    const codeActions = await this.getCodeActions(waitForModel);
    this.quickFixAction.quickFixes = codeActions ? this.toActions(codeActions) : [];
    this.quickFixAction.autoFixable(!!codeActions && codeActions.hasAutoFix);
  }
  getCodeActions(waitForModel) {
    if (this.codeActionsPromise !== null) {
      return this.codeActionsPromise;
    }
    return this.getModel(waitForModel).then((model) => {
      if (model) {
        if (!this.codeActionsPromise) {
          this.codeActionsPromise = createCancelablePromise((cancellationToken) => {
            return getCodeActions(this.languageFeaturesService.codeActionProvider, model, new Range2(this.marker.range.startLineNumber, this.marker.range.startColumn, this.marker.range.endLineNumber, this.marker.range.endColumn), {
              type: 1 /* Invoke */,
              triggerAction: "problems view" /* ProblemsView */,
              filter: { include: CodeActionKind.QuickFix }
            }, Progress.None, cancellationToken).then((actions) => {
              return this._register(actions);
            });
          });
        }
        return this.codeActionsPromise;
      }
      return null;
    });
  }
  toActions(codeActions) {
    return codeActions.validActions.map((item) => toAction({
      id: item.action.command ? item.action.command.id : item.action.title,
      label: item.action.title,
      run: async () => {
        await this.openFileAtMarker(this.marker);
        return await this.instantiationService.invokeFunction(applyCodeAction, item, "fromProblemsView" /* FromProblemsView */);
      }
    }));
  }
  openFileAtMarker(element) {
    const { resource, selection } = { resource: element.resource, selection: element.range };
    return this.editorService.openEditor({
      resource,
      options: {
        selection,
        preserveFocus: true,
        pinned: false,
        revealIfVisible: true
      }
    }, ACTIVE_GROUP).then(() => void 0);
  }
  getModel(waitForModel) {
    const model = this.modelService.getModel(this.marker.resource);
    if (model) {
      return Promise.resolve(model);
    }
    if (waitForModel) {
      if (!this.modelPromise) {
        this.modelPromise = createCancelablePromise((cancellationToken) => {
          return new Promise((c) => {
            this._register(this.modelService.onModelAdded((model2) => {
              if (isEqual2(model2.uri, this.marker.resource)) {
                c(model2);
              }
            }));
          });
        });
      }
      return this.modelPromise;
    }
    return Promise.resolve(null);
  }
};

MarkerViewModel = __decorateClass([
  __decorateParam(1, IModelService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, ILanguageFeaturesService)
], MarkerViewModel);

var MarkersViewModel = class extends Disposable {
  constructor(multiline = true, viewMode = "tree" /* Tree */, contextKeyService, instantiationService) {
    super();
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidChangeViewMode = this._register(new Emitter());
    this.onDidChangeViewMode = this._onDidChangeViewMode.event;
    this.markersViewStates = /* @__PURE__ */ new Map();
    this.markersPerResource = /* @__PURE__ */ new Map();
    this.bulkUpdate = false;
    this.hoveredMarker = null;
    this.hoverDelayer = this._register(new Delayer(300));
    this._multiline = true;
    this._viewMode = "tree" /* Tree */;
    this._multiline = multiline;
    this._viewMode = viewMode;
    this.viewModeContextKey = MarkersContextKeys.MarkersViewModeContextKey.bindTo(this.contextKeyService);
    this.viewModeContextKey.set(viewMode);
  }
  add(marker) {
    if (!this.markersViewStates.has(marker.id)) {
      const viewModel = this.instantiationService.createInstance(MarkerViewModel, marker);
      const disposables = [viewModel];
      viewModel.multiline = this.multiline;
      viewModel.onDidChange(() => {
        if (!this.bulkUpdate) {
          this._onDidChange.fire(marker);
        }
      }, this, disposables);
      this.markersViewStates.set(marker.id, { viewModel, disposables });
      const markers = this.markersPerResource.get(marker.resource.toString()) || [];
      markers.push(marker);
      this.markersPerResource.set(marker.resource.toString(), markers);
    }
  }
  remove(resource) {
    const markers = this.markersPerResource.get(resource.toString()) || [];
    for (const marker of markers) {
      const value2 = this.markersViewStates.get(marker.id);
      if (value2) {
        dispose(value2.disposables);
      }
      this.markersViewStates.delete(marker.id);
      if (this.hoveredMarker === marker) {
        this.hoveredMarker = null;
      }
    }
    this.markersPerResource.delete(resource.toString());
  }
  getViewModel(marker) {
    const value2 = this.markersViewStates.get(marker.id);
    return value2 ? value2.viewModel : null;
  }
  onMarkerMouseHover(marker) {
    this.hoveredMarker = marker;
    this.hoverDelayer.trigger(() => {
      if (this.hoveredMarker) {
        const model = this.getViewModel(this.hoveredMarker);
        if (model) {
          model.showLightBulb();
        }
      }
    });
  }
  onMarkerMouseLeave(marker) {
    if (this.hoveredMarker === marker) {
      this.hoveredMarker = null;
    }
  }
  get multiline() {
    return this._multiline;
  }
  set multiline(value2) {
    let changed = false;
    if (this._multiline !== value2) {
      this._multiline = value2;
      changed = true;
    }
    this.bulkUpdate = true;
    this.markersViewStates.forEach(({ viewModel }) => {
      if (viewModel.multiline !== value2) {
        viewModel.multiline = value2;
        changed = true;
      }
    });
    this.bulkUpdate = false;
    if (changed) {
      this._onDidChange.fire(void 0);
    }
  }
  get viewMode() {
    return this._viewMode;
  }
  set viewMode(value2) {
    if (this._viewMode === value2) {
      return;
    }
    this._viewMode = value2;
    this._onDidChangeViewMode.fire(value2);
    this.viewModeContextKey.set(value2);
  }
  dispose() {
    this.markersViewStates.forEach(({ disposables }) => dispose(disposables));
    this.markersViewStates.clear();
    this.markersPerResource.clear();
    super.dispose();
  }
};

MarkersViewModel = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IInstantiationService)
], MarkersViewModel);
export { MarkersWidgetAccessibilityProvider, VirtualDelegate, ResourceMarkersRenderer, MarkerRenderer, expandedIcon2, collapsedIcon2, toggleMultilineAction, ToggleMultilineActionViewItem, MarkerWidget, RelatedInformationRenderer, Filter2, MarkerViewModel, MarkersViewModel };
