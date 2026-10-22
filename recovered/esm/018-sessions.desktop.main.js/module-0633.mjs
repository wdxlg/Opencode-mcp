// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/tree/asyncDataTree.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ElementsDragAndDropData } from "./module-0459.mjs";
import { ComposedTreeDelegate, FindController, FindFilter } from "./module-0629.mjs";
import { getVisibleState, isFilterResult } from "./module-0628.mjs";
import { Promises, ThrottledDelayer, createCancelablePromise, timeout } from "./module-0036.mjs";
import { DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { localize } from "./module-0001.mjs";
import { FuzzyScore } from "./module-0453.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { TreeError, WeakMapper } from "./module-0627.mjs";
import { CompressibleObjectTree, ObjectTree } from "./module-0632.mjs";
import { Iterable } from "./module-0011.mjs";
import { isIterable } from "./module-0010.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { insertInto, splice } from "./module-0007.mjs";


// src/vs/base/browser/ui/tree/asyncDataTree.ts
function createAsyncDataTreeNode(props) {
  return {
    ...props,
    children: [],
    refreshPromise: void 0,
    stale: true,
    slow: false,
    forceExpanded: false
  };
}

function isAncestor2(ancestor, descendant) {
  if (!descendant.parent) {
    return false;
  } else if (descendant.parent === ancestor) {
    return true;
  } else {
    return isAncestor2(ancestor, descendant.parent);
  }
}

function intersects(node, other) {
  return node === other || isAncestor2(node, other) || isAncestor2(other, node);
}

var AsyncDataTreeNodeWrapper = class _AsyncDataTreeNodeWrapper {
  constructor(node) {
    this.node = node;
  }
  get element() {
    return this.node.element.element;
  }
  get children() {
    return this.node.children.map((node) => new _AsyncDataTreeNodeWrapper(node));
  }
  get depth() {
    return this.node.depth;
  }
  get visibleChildrenCount() {
    return this.node.visibleChildrenCount;
  }
  get visibleChildIndex() {
    return this.node.visibleChildIndex;
  }
  get collapsible() {
    return this.node.collapsible;
  }
  get collapsed() {
    return this.node.collapsed;
  }
  get visible() {
    return this.node.visible;
  }
  get filterData() {
    return this.node.filterData;
  }
};

var AsyncDataTreeRenderer = class {
  constructor(renderer, nodeMapper, onDidChangeTwistieState) {
    this.renderer = renderer;
    this.nodeMapper = nodeMapper;
    this.onDidChangeTwistieState = onDidChangeTwistieState;
    this.renderedNodes = /* @__PURE__ */ new Map();
    this.templateId = renderer.templateId;
  }
  renderTemplate(container2) {
    const templateData = this.renderer.renderTemplate(container2);
    return { templateData };
  }
  renderElement(node, index2, templateData, details) {
    this.renderer.renderElement(this.nodeMapper.map(node), index2, templateData.templateData, details);
  }
  renderTwistie(element, twistieElement) {
    if (element.slow) {
      twistieElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.treeItemLoading));
      return true;
    } else {
      twistieElement.classList.remove(...ThemeIcon.asClassNameArray(Codicon.treeItemLoading));
      return false;
    }
  }
  disposeElement(node, index2, templateData, details) {
    this.renderer.disposeElement?.(this.nodeMapper.map(node), index2, templateData.templateData, details);
  }
  disposeTemplate(templateData) {
    this.renderer.disposeTemplate(templateData.templateData);
  }
  dispose() {
    this.renderedNodes.clear();
  }
};

function asTreeEvent(e4) {
  return {
    browserEvent: e4.browserEvent,
    elements: e4.elements.map((e5) => e5.element)
  };
}

function asTreeMouseEvent2(e4) {
  return {
    browserEvent: e4.browserEvent,
    element: e4.element && e4.element.element,
    target: e4.target
  };
}

function asTreeContextMenuEvent2(e4) {
  return {
    browserEvent: e4.browserEvent,
    element: e4.element && e4.element.element,
    anchor: e4.anchor,
    isStickyScroll: e4.isStickyScroll
  };
}

var AsyncDataTreeElementsDragAndDropData = class extends ElementsDragAndDropData {
  constructor(data) {
    super(data.elements.map((node) => node.element));
    this.data = data;
  }
  set context(context2) {
    this.data.context = context2;
  }
  get context() {
    return this.data.context;
  }
};

function asAsyncDataTreeDragAndDropData(data) {
  if (data instanceof ElementsDragAndDropData) {
    return new AsyncDataTreeElementsDragAndDropData(data);
  }
  return data;
}

var AsyncDataTreeNodeListDragAndDrop = class {
  constructor(dnd) {
    this.dnd = dnd;
  }
  getDragURI(node) {
    return this.dnd.getDragURI(node.element);
  }
  getDragLabel(nodes, originalEvent) {
    if (this.dnd.getDragLabel) {
      return this.dnd.getDragLabel(nodes.map((node) => node.element), originalEvent);
    }
    return void 0;
  }
  onDragStart(data, originalEvent) {
    this.dnd.onDragStart?.(asAsyncDataTreeDragAndDropData(data), originalEvent);
  }
  onDragOver(data, targetNode, targetIndex, targetSector, originalEvent, raw = true) {
    return this.dnd.onDragOver(asAsyncDataTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
  }
  drop(data, targetNode, targetIndex, targetSector, originalEvent) {
    this.dnd.drop(asAsyncDataTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
  }
  onDragEnd(originalEvent) {
    this.dnd.onDragEnd?.(originalEvent);
  }
  dispose() {
    this.dnd.dispose();
  }
};

var AsyncFindFilter = class extends FindFilter {
  constructor(findProvider, keyboardNavigationLabelProvider, filter2) {
    super(keyboardNavigationLabelProvider, filter2);
    this.findProvider = findProvider;
    this.isFindSessionActive = false;
  }
  filter(element, parentVisibility) {
    const filterResult = super.filter(element, parentVisibility);
    if (!this.isFindSessionActive || this.findMode === 0 /* Highlight */ || !this.findProvider.isVisible) {
      return filterResult;
    }
    const visibility = isFilterResult(filterResult) ? filterResult.visibility : filterResult;
    if (getVisibleState(visibility) === 0 /* Hidden */) {
      return 0 /* Hidden */;
    }
    return this.findProvider.isVisible(element) ? filterResult : 0 /* Hidden */;
  }
};

var AsyncFindController = class extends FindController {
  constructor(tree, findProvider, filter2, contextViewProvider, options3) {
    super(tree, filter2, contextViewProvider, options3);
    this.findProvider = findProvider;
    this.filter = filter2;
    this.activeSession = false;
    this.asyncWorkInProgress = false;
    this.taskQueue = new ThrottledDelayer(250);
    this.disposables.add(toDisposable(async () => {
      if (this.activeSession) {
        await this.findProvider.endSession?.();
      }
    }));
  }
  applyPattern(_pattern) {
    this.renderMessage(false);
    this.activeTokenSource?.cancel();
    this.activeTokenSource = new CancellationTokenSource();
    this.taskQueue.trigger(() => this.applyPatternAsync());
  }
  async applyPatternAsync() {
    const token = this.activeTokenSource?.token;
    if (!token || token.isCancellationRequested) {
      return;
    }
    const pattern = this.pattern;
    if (pattern === "") {
      if (this.activeSession) {
        this.asyncWorkInProgress = true;
        await this.deactivateFindSession();
        this.asyncWorkInProgress = false;
        if (!token.isCancellationRequested) {
          this.filter.reset();
          super.applyPattern("");
        }
      }
      return;
    }
    if (!this.activeSession) {
      this.activateFindSession();
    }
    this.asyncWorkInProgress = true;
    this.activeFindMetadata = void 0;
    const findMetadata2 = await this.findProvider.find(pattern, { matchType: this.matchType, findMode: this.mode }, token);
    if (token.isCancellationRequested || findMetadata2 === void 0) {
      return;
    }
    this.asyncWorkInProgress = false;
    this.activeFindMetadata = findMetadata2;
    this.filter.reset();
    super.applyPattern(pattern);
    if (findMetadata2.warningMessage) {
      this.renderMessage(true, findMetadata2.warningMessage);
    }
  }
  activateFindSession() {
    this.activeSession = true;
    this.filter.isFindSessionActive = true;
    this.findProvider.startSession?.();
  }
  async deactivateFindSession() {
    this.activeSession = false;
    this.filter.isFindSessionActive = false;
    await this.findProvider.endSession?.();
  }
  render() {
    if (this.asyncWorkInProgress || !this.activeFindMetadata) {
      return;
    }
    const showNotFound = this.activeFindMetadata.matchCount === 0 && this.pattern.length > 0;
    this.renderMessage(showNotFound);
    if (this.pattern.length) {
      this.alertResults(this.activeFindMetadata.matchCount);
    }
  }
  onDidToggleChange(e4) {
    this.toggles.set(e4.id, e4.isChecked);
    this.filter.findMode = this.mode;
    this.filter.findMatchType = this.matchType;
    this.placeholder = this.mode === 1 /* Filter */ ? localize(43, null) : localize(44, null);
    this.applyPattern(this.pattern);
  }
  shouldAllowFocus(node) {
    return this.shouldFocusWhenNavigating(node);
  }
  shouldFocusWhenNavigating(node) {
    if (!this.activeSession || !this.activeFindMetadata) {
      return true;
    }
    const element = node.element?.element;
    if (element && this.activeFindMetadata.isMatch(element)) {
      return true;
    }
    return !FuzzyScore.isDefault(node.filterData);
  }
};

function asObjectTreeOptions2(options3) {
  return options3 && {
    ...options3,
    collapseByDefault: true,
    identityProvider: options3.identityProvider && {
      getId(el) {
        return options3.identityProvider.getId(el.element);
      },
      getGroupId: options3.identityProvider.getGroupId ? (el) => {
        return options3.identityProvider.getGroupId(el.element);
      } : void 0
    },
    dnd: options3.dnd && new AsyncDataTreeNodeListDragAndDrop(options3.dnd),
    multipleSelectionController: options3.multipleSelectionController && {
      isSelectionSingleChangeEvent(e4) {
        return options3.multipleSelectionController.isSelectionSingleChangeEvent({ ...e4, element: e4.element });
      },
      isSelectionRangeChangeEvent(e4) {
        return options3.multipleSelectionController.isSelectionRangeChangeEvent({ ...e4, element: e4.element });
      }
    },
    accessibilityProvider: options3.accessibilityProvider && {
      ...options3.accessibilityProvider,
      getPosInSet: void 0,
      getSetSize: void 0,
      getRole: options3.accessibilityProvider.getRole ? (el) => {
        return options3.accessibilityProvider.getRole(el.element);
      } : () => "treeitem",
      isChecked: options3.accessibilityProvider.isChecked ? (e4) => {
        return !!options3.accessibilityProvider?.isChecked(e4.element);
      } : void 0,
      getAriaLabel(e4) {
        return options3.accessibilityProvider.getAriaLabel(e4.element);
      },
      getWidgetAriaLabel() {
        return options3.accessibilityProvider.getWidgetAriaLabel();
      },
      getWidgetRole: options3.accessibilityProvider.getWidgetRole ? () => options3.accessibilityProvider.getWidgetRole() : () => "tree",
      getAriaLevel: options3.accessibilityProvider.getAriaLevel && ((node) => {
        return options3.accessibilityProvider.getAriaLevel(node.element);
      }),
      getActiveDescendantId: options3.accessibilityProvider.getActiveDescendantId && ((node) => {
        return options3.accessibilityProvider.getActiveDescendantId(node.element);
      })
    },
    filter: options3.filter && {
      filter(e4, parentVisibility) {
        return options3.filter.filter(e4.element, parentVisibility);
      }
    },
    keyboardNavigationLabelProvider: options3.keyboardNavigationLabelProvider && {
      ...options3.keyboardNavigationLabelProvider,
      getKeyboardNavigationLabel(e4) {
        return options3.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e4.element);
      }
    },
    stickyScrollNodeSourceRangeProvider: options3.stickyScrollNodeSourceRangeProvider && ((e4, defaultRange) => options3.stickyScrollNodeSourceRangeProvider(e4.element, defaultRange)),
    sorter: void 0,
    expandOnlyOnTwistieClick: typeof options3.expandOnlyOnTwistieClick === "undefined" ? void 0 : typeof options3.expandOnlyOnTwistieClick !== "function" ? options3.expandOnlyOnTwistieClick : ((e4) => options3.expandOnlyOnTwistieClick(e4.element)),
    twistieAdditionalCssClass: typeof options3.twistieAdditionalCssClass === "undefined" ? void 0 : ((e4) => options3.twistieAdditionalCssClass(e4.element)),
    defaultFindVisibility: (e4) => {
      if (e4.hasChildren && e4.stale) {
        return 1 /* Visible */;
      } else if (typeof options3.defaultFindVisibility === "number") {
        return options3.defaultFindVisibility;
      } else if (typeof options3.defaultFindVisibility === "undefined") {
        return 2 /* Recurse */;
      } else {
        return options3.defaultFindVisibility(e4.element);
      }
    },
    stickyScrollDelegate: options3.stickyScrollDelegate
  };
}

function dfs2(node, fn) {
  fn(node);
  node.children.forEach((child) => dfs2(child, fn));
}

var AsyncDataTree = class {
  constructor(user, container2, delegate, renderers, dataSource, options3 = {}) {
    this.user = user;
    this.dataSource = dataSource;
    this.nodes = /* @__PURE__ */ new Map();
    this.subTreeRefreshPromises = /* @__PURE__ */ new Map();
    this.refreshPromises = /* @__PURE__ */ new Map();
    this._onDidRender = new Emitter();
    this._onDidChangeNodeSlowState = new Emitter();
    this.nodeMapper = new WeakMapper((node) => new AsyncDataTreeNodeWrapper(node));
    this.disposables = new DisposableStore();
    this.identityProvider = options3.identityProvider;
    this.autoExpandSingleChildren = typeof options3.autoExpandSingleChildren === "undefined" ? false : options3.autoExpandSingleChildren;
    this.sorter = options3.sorter;
    this.getDefaultCollapseState = (e4) => options3.collapseByDefault ? options3.collapseByDefault(e4) ? 3 /* PreserveOrCollapsed */ : 2 /* PreserveOrExpanded */ : void 0;
    let asyncFindEnabled = false;
    let findFilter2;
    if (options3.findProvider && (options3.findWidgetEnabled ?? true) && options3.keyboardNavigationLabelProvider && options3.contextViewProvider) {
      asyncFindEnabled = true;
      findFilter2 = new AsyncFindFilter(options3.findProvider, options3.keyboardNavigationLabelProvider, options3.filter);
    }
    this.tree = this.createTree(user, container2, delegate, renderers, { ...options3, findWidgetEnabled: !asyncFindEnabled, filter: findFilter2 ?? options3.filter });
    this.root = createAsyncDataTreeNode({
      element: void 0,
      parent: null,
      hasChildren: true,
      defaultCollapseState: void 0
    });
    if (this.identityProvider) {
      this.root = {
        ...this.root,
        id: null
      };
    }
    this.nodes.set(null, this.root);
    this.tree.onDidChangeCollapseState(this._onDidChangeCollapseState, this, this.disposables);
    if (asyncFindEnabled) {
      const findOptions = {
        styles: options3.findWidgetStyles,
        showNotFoundMessage: options3.showNotFoundMessage,
        defaultFindMatchType: options3.defaultFindMatchType,
        defaultFindMode: options3.defaultFindMode
      };
      this.findController = this.disposables.add(new AsyncFindController(this.tree, options3.findProvider, findFilter2, this.tree.options.contextViewProvider, findOptions));
      this.focusNavigationFilter = (node) => this.findController.shouldFocusWhenNavigating(node);
      this.onDidChangeFindOpenState = this.findController.onDidChangeOpenState;
      this.onDidChangeFindMode = this.findController.onDidChangeMode;
      this.onDidChangeFindMatchType = this.findController.onDidChangeMatchType;
    } else {
      this.onDidChangeFindOpenState = this.tree.onDidChangeFindOpenState;
      this.onDidChangeFindMode = this.tree.onDidChangeFindMode;
      this.onDidChangeFindMatchType = this.tree.onDidChangeFindMatchType;
    }
  }
  get onDidScroll() {
    return this.tree.onDidScroll;
  }
  get onDidChangeFocus() {
    return Event2.map(this.tree.onDidChangeFocus, asTreeEvent);
  }
  get onDidChangeSelection() {
    return Event2.map(this.tree.onDidChangeSelection, asTreeEvent);
  }
  get onKeyDown() {
    return this.tree.onKeyDown;
  }
  get onMouseClick() {
    return Event2.map(this.tree.onMouseClick, asTreeMouseEvent2);
  }
  get onMouseDblClick() {
    return Event2.map(this.tree.onMouseDblClick, asTreeMouseEvent2);
  }
  get onContextMenu() {
    return Event2.map(this.tree.onContextMenu, asTreeContextMenuEvent2);
  }
  get onTap() {
    return Event2.map(this.tree.onTap, asTreeMouseEvent2);
  }
  get onPointer() {
    return Event2.map(this.tree.onPointer, asTreeMouseEvent2);
  }
  get onDidFocus() {
    return this.tree.onDidFocus;
  }
  get onDidBlur() {
    return this.tree.onDidBlur;
  }
  /**
   * To be used internally only!
   * @deprecated
   */
  get onDidChangeModel() {
    return this.tree.onDidChangeModel;
  }
  get onDidChangeCollapseState() {
    return this.tree.onDidChangeCollapseState;
  }
  get onDidUpdateOptions() {
    return this.tree.onDidUpdateOptions;
  }
  get onDidChangeStickyScrollFocused() {
    return this.tree.onDidChangeStickyScrollFocused;
  }
  get findMode() {
    return this.findController ? this.findController.mode : this.tree.findMode;
  }
  set findMode(mode) {
    this.findController ? this.findController.mode = mode : this.tree.findMode = mode;
  }
  get findMatchType() {
    return this.findController ? this.findController.matchType : this.tree.findMatchType;
  }
  set findMatchType(matchType) {
    this.findController ? this.findController.matchType = matchType : this.tree.findMatchType = matchType;
  }
  get expandOnlyOnTwistieClick() {
    if (typeof this.tree.expandOnlyOnTwistieClick === "boolean") {
      return this.tree.expandOnlyOnTwistieClick;
    }
    const fn = this.tree.expandOnlyOnTwistieClick;
    return (element) => fn(this.nodes.get(element === this.root.element ? null : element) || null);
  }
  get onDidDispose() {
    return this.tree.onDidDispose;
  }
  createTree(user, container2, delegate, renderers, options3) {
    const objectTreeDelegate = new ComposedTreeDelegate(delegate);
    const objectTreeRenderers = renderers.map((r2) => new AsyncDataTreeRenderer(r2, this.nodeMapper, this._onDidChangeNodeSlowState.event));
    const objectTreeOptions = asObjectTreeOptions2(options3) || {};
    return new ObjectTree(user, container2, objectTreeDelegate, objectTreeRenderers, objectTreeOptions);
  }
  updateOptions(optionsUpdate = {}) {
    if (this.findController) {
      if (optionsUpdate.defaultFindMode !== void 0) {
        this.findController.mode = optionsUpdate.defaultFindMode;
      }
      if (optionsUpdate.defaultFindMatchType !== void 0) {
        this.findController.matchType = optionsUpdate.defaultFindMatchType;
      }
    }
    this.tree.updateOptions(optionsUpdate);
  }
  get options() {
    return this.tree.options;
  }
  // Widget
  getHTMLElement() {
    return this.tree.getHTMLElement();
  }
  get contentHeight() {
    return this.tree.contentHeight;
  }
  get contentWidth() {
    return this.tree.contentWidth;
  }
  get onDidChangeContentHeight() {
    return this.tree.onDidChangeContentHeight;
  }
  get onDidChangeContentWidth() {
    return this.tree.onDidChangeContentWidth;
  }
  get scrollTop() {
    return this.tree.scrollTop;
  }
  set scrollTop(scrollTop) {
    this.tree.scrollTop = scrollTop;
  }
  get scrollLeft() {
    return this.tree.scrollLeft;
  }
  set scrollLeft(scrollLeft) {
    this.tree.scrollLeft = scrollLeft;
  }
  get scrollHeight() {
    return this.tree.scrollHeight;
  }
  get renderHeight() {
    return this.tree.renderHeight;
  }
  get lastVisibleElement() {
    return this.tree.lastVisibleElement.element;
  }
  get ariaLabel() {
    return this.tree.ariaLabel;
  }
  set ariaLabel(value2) {
    this.tree.ariaLabel = value2;
  }
  domFocus() {
    this.tree.domFocus();
  }
  isDOMFocused() {
    return this.tree.isDOMFocused();
  }
  navigate(start) {
    let startNode;
    if (start) {
      startNode = this.getDataNode(start);
    }
    return new AsyncDataTreeNavigator(this.tree.navigate(startNode));
  }
  layout(height, width2) {
    this.tree.layout(height, width2);
  }
  style(styles) {
    this.tree.style(styles);
  }
  // Model
  getInput() {
    return this.root.element;
  }
  async setInput(input, viewState) {
    this.cancelAllRefreshPromises();
    this.root.element = input;
    const viewStateContext = viewState && { viewState, focus: [], selection: [] };
    await this._updateChildren(input, true, false, viewStateContext);
    if (viewStateContext) {
      this.tree.setFocus(viewStateContext.focus);
      this.tree.setSelection(viewStateContext.selection);
    }
    if (viewState && typeof viewState.scrollTop === "number") {
      this.scrollTop = viewState.scrollTop;
    }
  }
  async updateChildren(element = this.root.element, recursive = true, rerender = false, options3) {
    await this._updateChildren(element, recursive, rerender, void 0, options3);
  }
  cancelAllRefreshPromises(includeSubTrees = false) {
    this.refreshPromises.forEach((promise) => promise.cancel());
    this.refreshPromises.clear();
    if (includeSubTrees) {
      this.subTreeRefreshPromises.forEach((promise) => promise.cancel());
      this.subTreeRefreshPromises.clear();
    }
  }
  async _updateChildren(element = this.root.element, recursive = true, rerender = false, viewStateContext, options3) {
    if (typeof this.root.element === "undefined") {
      throw new TreeError(this.user, "Tree input not set");
    }
    if (this.root.refreshPromise) {
      await this.root.refreshPromise;
      await Event2.toPromise(this._onDidRender.event);
    }
    const node = this.getDataNode(element);
    await this.refreshAndRenderNode(node, recursive, viewStateContext, options3);
    if (rerender) {
      try {
        this.tree.rerender(node);
      } catch {
      }
    }
  }
  resort(element = this.root.element, recursive = true) {
    this.tree.resort(this.getDataNode(element), recursive);
  }
  hasNode(element) {
    if (element === this.root.element) {
      return true;
    }
    const node = this.nodes.get(element);
    if (!node) {
      return false;
    }
    return this.tree.hasElement(node);
  }
  // View
  rerender(element) {
    if (element === void 0 || element === this.root.element) {
      this.tree.rerender();
      return;
    }
    const node = this.getDataNode(element);
    this.tree.rerender(node);
  }
  updateElementHeight(element, height) {
    const node = this.getDataNode(element);
    this.tree.updateElementHeight(node, height);
  }
  updateWidth(element) {
    const node = this.getDataNode(element);
    this.tree.updateWidth(node);
  }
  // Tree
  getNode(element = this.root.element) {
    const dataNode = this.getDataNode(element);
    const node = this.tree.getNode(dataNode === this.root ? null : dataNode);
    return this.nodeMapper.map(node);
  }
  collapse(element, recursive = false) {
    const node = this.getDataNode(element);
    return this.tree.collapse(node === this.root ? null : node, recursive);
  }
  async expand(element, recursive = false) {
    if (typeof this.root.element === "undefined") {
      throw new TreeError(this.user, "Tree input not set");
    }
    if (this.root.refreshPromise) {
      await this.root.refreshPromise;
      await Event2.toPromise(this._onDidRender.event);
    }
    const node = this.getDataNode(element);
    if (this.tree.hasElement(node) && !this.tree.isCollapsible(node)) {
      return false;
    }
    if (node.refreshPromise) {
      await node.refreshPromise;
      await Event2.toPromise(this._onDidRender.event);
    }
    if (node !== this.root && !node.refreshPromise && !this.tree.isCollapsed(node)) {
      return false;
    }
    const result = this.tree.expand(node === this.root ? null : node, recursive);
    if (node.refreshPromise) {
      await node.refreshPromise;
      await Event2.toPromise(this._onDidRender.event);
    }
    return result;
  }
  toggleCollapsed(element, recursive = false) {
    return this.tree.toggleCollapsed(this.getDataNode(element), recursive);
  }
  expandAll() {
    this.tree.expandAll();
  }
  async expandTo(element) {
    if (!this.dataSource.getParent) {
      throw new Error("Can't expand to element without getParent method");
    }
    const elements = [];
    while (!this.hasNode(element)) {
      element = this.dataSource.getParent(element);
      if (element !== this.root.element) {
        elements.push(element);
      }
    }
    for (const element2 of Iterable.reverse(elements)) {
      await this.expand(element2);
    }
    this.tree.expandTo(this.getDataNode(element));
  }
  collapseAll() {
    this.tree.collapseAll();
  }
  isCollapsible(element) {
    return this.tree.isCollapsible(this.getDataNode(element));
  }
  isCollapsed(element) {
    return this.tree.isCollapsed(this.getDataNode(element));
  }
  triggerTypeNavigation() {
    this.tree.triggerTypeNavigation();
  }
  openFind() {
    if (this.findController) {
      this.findController.open();
    } else {
      this.tree.openFind();
    }
  }
  closeFind() {
    if (this.findController) {
      this.findController.close();
    } else {
      this.tree.closeFind();
    }
  }
  refilter() {
    this.tree.refilter();
  }
  setAnchor(element) {
    this.tree.setAnchor(typeof element === "undefined" ? void 0 : this.getDataNode(element));
  }
  getAnchor() {
    const node = this.tree.getAnchor();
    return node?.element;
  }
  setSelection(elements, browserEvent) {
    const nodes = elements.map((e4) => this.getDataNode(e4));
    this.tree.setSelection(nodes, browserEvent);
  }
  getSelection() {
    const nodes = this.tree.getSelection();
    return nodes.map((n2) => n2.element);
  }
  setFocus(elements, browserEvent) {
    const nodes = elements.map((e4) => this.getDataNode(e4));
    this.tree.setFocus(nodes, browserEvent);
  }
  focusNext(n2 = 1, loop = false, browserEvent) {
    this.tree.focusNext(n2, loop, browserEvent, this.focusNavigationFilter);
  }
  focusPrevious(n2 = 1, loop = false, browserEvent) {
    this.tree.focusPrevious(n2, loop, browserEvent, this.focusNavigationFilter);
  }
  focusNextPage(browserEvent) {
    return this.tree.focusNextPage(browserEvent, this.focusNavigationFilter);
  }
  focusPreviousPage(browserEvent) {
    return this.tree.focusPreviousPage(browserEvent, this.focusNavigationFilter);
  }
  focusLast(browserEvent) {
    this.tree.focusLast(browserEvent, this.focusNavigationFilter);
  }
  focusFirst(browserEvent) {
    this.tree.focusFirst(browserEvent, this.focusNavigationFilter);
  }
  getFocus() {
    const nodes = this.tree.getFocus();
    return nodes.map((n2) => n2.element);
  }
  getStickyScrollFocus() {
    const nodes = this.tree.getStickyScrollFocus();
    return nodes.map((n2) => n2.element);
  }
  getFocusedPart() {
    return this.tree.getFocusedPart();
  }
  reveal(element, relativeTop) {
    this.tree.reveal(this.getDataNode(element), relativeTop);
  }
  getRelativeTop(element) {
    return this.tree.getRelativeTop(this.getDataNode(element));
  }
  // Tree navigation
  getParentElement(element) {
    const node = this.tree.getParentElement(this.getDataNode(element));
    return node && node.element;
  }
  getFirstElementChild(element = this.root.element) {
    const dataNode = this.getDataNode(element);
    const node = this.tree.getFirstElementChild(dataNode === this.root ? null : dataNode);
    return node && node.element;
  }
  // Implementation
  getDataNode(element) {
    const node = this.nodes.get(element === this.root.element ? null : element);
    if (!node) {
      const nodeIdentity = this.identityProvider?.getId(element).toString();
      throw new TreeError(this.user, `Data tree node not found${nodeIdentity ? `: ${nodeIdentity}` : ""}`);
    }
    return node;
  }
  async refreshAndRenderNode(node, recursive, viewStateContext, options3) {
    if (this.disposables.isDisposed) {
      return;
    }
    await this.refreshNode(node, recursive, viewStateContext);
    if (this.disposables.isDisposed) {
      return;
    }
    this.render(node, viewStateContext, options3);
  }
  async refreshNode(node, recursive, viewStateContext) {
    let result;
    this.subTreeRefreshPromises.forEach((refreshPromise, refreshNode) => {
      if (!result && intersects(refreshNode, node)) {
        result = refreshPromise.then(() => this.refreshNode(node, recursive, viewStateContext));
      }
    });
    if (result) {
      return result;
    }
    if (node !== this.root) {
      const treeNode = this.tree.getNode(node);
      if (treeNode.collapsed) {
        node.hasChildren = !!this.dataSource.hasChildren(node.element);
        node.stale = true;
        this.setChildren(node, [], recursive, viewStateContext);
        return;
      }
    }
    return this.doRefreshSubTree(node, recursive, viewStateContext);
  }
  async doRefreshSubTree(node, recursive, viewStateContext) {
    const cancelablePromise = createCancelablePromise(async () => {
      const childrenToRefresh = await this.doRefreshNode(node, recursive, viewStateContext);
      node.stale = false;
      await Promises.settled(childrenToRefresh.map((child) => this.doRefreshSubTree(child, recursive, viewStateContext)));
    });
    node.refreshPromise = cancelablePromise;
    this.subTreeRefreshPromises.set(node, cancelablePromise);
    cancelablePromise.finally(() => {
      node.refreshPromise = void 0;
      this.subTreeRefreshPromises.delete(node);
    });
    return cancelablePromise;
  }
  async doRefreshNode(node, recursive, viewStateContext) {
    node.hasChildren = !!this.dataSource.hasChildren(node.element);
    let childrenPromise;
    if (!node.hasChildren) {
      childrenPromise = Promise.resolve(Iterable.empty());
    } else {
      const children = this.doGetChildren(node);
      if (isIterable(children)) {
        childrenPromise = Promise.resolve(children);
      } else {
        const slowTimeout = timeout(800);
        slowTimeout.then(() => {
          node.slow = true;
          this._onDidChangeNodeSlowState.fire(node);
        }, (_) => null);
        childrenPromise = children.finally(() => slowTimeout.cancel());
      }
    }
    try {
      const children = await childrenPromise;
      return this.setChildren(node, children, recursive, viewStateContext);
    } catch (err) {
      if (node !== this.root && this.tree.hasElement(node)) {
        this.tree.collapse(node);
      }
      if (isCancellationError(err)) {
        return [];
      }
      throw err;
    } finally {
      if (node.slow) {
        node.slow = false;
        this._onDidChangeNodeSlowState.fire(node);
      }
    }
  }
  doGetChildren(node) {
    let result = this.refreshPromises.get(node);
    if (result) {
      return result;
    }
    const children = this.dataSource.getChildren(node.element);
    if (isIterable(children)) {
      return this.processChildren(children);
    } else {
      result = createCancelablePromise(async () => this.processChildren(await children));
      this.refreshPromises.set(node, result);
      return result.finally(() => {
        this.refreshPromises.delete(node);
      });
    }
  }
  _onDidChangeCollapseState({ node, deep }) {
    if (node.element === null) {
      return;
    }
    if (!node.collapsed && node.element.stale) {
      if (deep) {
        this.collapse(node.element.element);
      } else {
        this.refreshAndRenderNode(node.element, false).catch(onUnexpectedError);
      }
    }
  }
  setChildren(node, childrenElementsIterable, recursive, viewStateContext) {
    const childrenElements = [...childrenElementsIterable];
    if (node.children.length === 0 && childrenElements.length === 0) {
      return [];
    }
    const nodesToForget = /* @__PURE__ */ new Map();
    const childrenTreeNodesById = /* @__PURE__ */ new Map();
    for (const child of node.children) {
      nodesToForget.set(child.element, child);
      if (this.identityProvider) {
        childrenTreeNodesById.set(child.id, { node: child, collapsed: this.tree.hasElement(child) && this.tree.isCollapsed(child) });
      }
    }
    const childrenToRefresh = [];
    const children = childrenElements.map((element) => {
      const hasChildren = !!this.dataSource.hasChildren(element);
      if (!this.identityProvider) {
        const asyncDataTreeNode = createAsyncDataTreeNode({ element, parent: node, hasChildren, defaultCollapseState: this.getDefaultCollapseState(element) });
        if (hasChildren && asyncDataTreeNode.defaultCollapseState === 2 /* PreserveOrExpanded */) {
          childrenToRefresh.push(asyncDataTreeNode);
        }
        return asyncDataTreeNode;
      }
      const id2 = this.identityProvider.getId(element).toString();
      const result = childrenTreeNodesById.get(id2);
      if (result) {
        const asyncDataTreeNode = result.node;
        nodesToForget.delete(asyncDataTreeNode.element);
        this.nodes.delete(asyncDataTreeNode.element);
        this.nodes.set(element, asyncDataTreeNode);
        asyncDataTreeNode.element = element;
        asyncDataTreeNode.hasChildren = hasChildren;
        if (recursive) {
          if (result.collapsed) {
            asyncDataTreeNode.children.forEach((node2) => dfs2(node2, (node3) => this.nodes.delete(node3.element)));
            asyncDataTreeNode.children.splice(0, asyncDataTreeNode.children.length);
            asyncDataTreeNode.stale = true;
          } else {
            childrenToRefresh.push(asyncDataTreeNode);
          }
        } else if (hasChildren && !result.collapsed) {
          childrenToRefresh.push(asyncDataTreeNode);
        }
        return asyncDataTreeNode;
      }
      const childAsyncDataTreeNode = createAsyncDataTreeNode({ element, parent: node, id: id2, hasChildren, defaultCollapseState: this.getDefaultCollapseState(element) });
      if (viewStateContext && viewStateContext.viewState.focus && viewStateContext.viewState.focus.indexOf(id2) > -1) {
        viewStateContext.focus.push(childAsyncDataTreeNode);
      }
      if (viewStateContext && viewStateContext.viewState.selection && viewStateContext.viewState.selection.indexOf(id2) > -1) {
        viewStateContext.selection.push(childAsyncDataTreeNode);
      }
      if (viewStateContext && viewStateContext.viewState.expanded && viewStateContext.viewState.expanded.indexOf(id2) > -1) {
        childrenToRefresh.push(childAsyncDataTreeNode);
      } else if (hasChildren && childAsyncDataTreeNode.defaultCollapseState === 2 /* PreserveOrExpanded */) {
        childrenToRefresh.push(childAsyncDataTreeNode);
      }
      return childAsyncDataTreeNode;
    });
    for (const node2 of nodesToForget.values()) {
      dfs2(node2, (node3) => this.nodes.delete(node3.element));
    }
    for (const child of children) {
      this.nodes.set(child.element, child);
    }
    splice(node.children, 0, node.children.length, children);
    if (node !== this.root && this.autoExpandSingleChildren && children.length === 1 && childrenToRefresh.length === 0) {
      children[0].forceExpanded = true;
      childrenToRefresh.push(children[0]);
    }
    return childrenToRefresh;
  }
  render(node, viewStateContext, options3) {
    const children = node.children.map((node2) => this.asTreeElement(node2, viewStateContext));
    const objectTreeOptions = options3 && {
      ...options3,
      diffIdentityProvider: options3.diffIdentityProvider && {
        getId(node2) {
          return options3.diffIdentityProvider.getId(node2.element);
        },
        getGroupId: options3.diffIdentityProvider.getGroupId ? (node2) => {
          return options3.diffIdentityProvider.getGroupId(node2.element);
        } : void 0
      }
    };
    this.tree.setChildren(node === this.root ? null : node, children, objectTreeOptions);
    if (node !== this.root) {
      this.tree.setCollapsible(node, node.hasChildren);
    }
    this._onDidRender.fire();
  }
  asTreeElement(node, viewStateContext) {
    if (node.stale) {
      return {
        element: node,
        collapsible: node.hasChildren,
        collapsed: true
      };
    }
    let collapsed2;
    if (viewStateContext && viewStateContext.viewState.expanded && node.id && viewStateContext.viewState.expanded.indexOf(node.id) > -1) {
      collapsed2 = false;
    } else if (node.forceExpanded) {
      collapsed2 = false;
      node.forceExpanded = false;
    } else {
      collapsed2 = node.defaultCollapseState;
    }
    return {
      element: node,
      children: node.hasChildren ? Iterable.map(node.children, (child) => this.asTreeElement(child, viewStateContext)) : [],
      collapsible: node.hasChildren,
      collapsed: collapsed2
    };
  }
  processChildren(children) {
    if (this.sorter) {
      children = [...children].sort(this.sorter.compare.bind(this.sorter));
    }
    return children;
  }
  // view state
  getViewState() {
    if (!this.identityProvider) {
      throw new TreeError(this.user, "Can't get tree view state without an identity provider");
    }
    const getId = (element) => this.identityProvider.getId(element).toString();
    const focus = this.getFocus().map(getId);
    const selection = this.getSelection().map(getId);
    const expanded2 = [];
    const root = this.tree.getNode();
    const stack = [root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node !== root && node.collapsible && !node.collapsed) {
        expanded2.push(getId(node.element.element));
      }
      insertInto(stack, stack.length, node.children);
    }
    return { focus, selection, expanded: expanded2, scrollTop: this.scrollTop };
  }
  dispose() {
    this._onDidRender.dispose();
    this._onDidChangeNodeSlowState.dispose();
    this.disposables.dispose();
    this.tree.dispose();
  }
};

var CompressibleAsyncDataTreeNodeWrapper = class _CompressibleAsyncDataTreeNodeWrapper {
  constructor(node) {
    this.node = node;
  }
  get element() {
    return {
      elements: this.node.element.elements.map((e4) => e4.element),
      incompressible: this.node.element.incompressible
    };
  }
  get children() {
    return this.node.children.map((node) => new _CompressibleAsyncDataTreeNodeWrapper(node));
  }
  get depth() {
    return this.node.depth;
  }
  get visibleChildrenCount() {
    return this.node.visibleChildrenCount;
  }
  get visibleChildIndex() {
    return this.node.visibleChildIndex;
  }
  get collapsible() {
    return this.node.collapsible;
  }
  get collapsed() {
    return this.node.collapsed;
  }
  get visible() {
    return this.node.visible;
  }
  get filterData() {
    return this.node.filterData;
  }
};

var CompressibleAsyncDataTreeRenderer = class {
  constructor(renderer, nodeMapper, compressibleNodeMapperProvider, onDidChangeTwistieState) {
    this.renderer = renderer;
    this.nodeMapper = nodeMapper;
    this.compressibleNodeMapperProvider = compressibleNodeMapperProvider;
    this.onDidChangeTwistieState = onDidChangeTwistieState;
    this.renderedNodes = /* @__PURE__ */ new Map();
    this.disposables = [];
    this.templateId = renderer.templateId;
  }
  renderTemplate(container2) {
    const templateData = this.renderer.renderTemplate(container2);
    return { templateData };
  }
  renderElement(node, index2, templateData, details) {
    this.renderer.renderElement(this.nodeMapper.map(node), index2, templateData.templateData, details);
  }
  renderCompressedElements(node, index2, templateData, details) {
    this.renderer.renderCompressedElements(this.compressibleNodeMapperProvider().map(node), index2, templateData.templateData, details);
  }
  renderTwistie(element, twistieElement) {
    if (element.slow) {
      twistieElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.treeItemLoading));
      return true;
    } else {
      twistieElement.classList.remove(...ThemeIcon.asClassNameArray(Codicon.treeItemLoading));
      return false;
    }
  }
  disposeElement(node, index2, templateData, details) {
    this.renderer.disposeElement?.(this.nodeMapper.map(node), index2, templateData.templateData, details);
  }
  disposeCompressedElements(node, index2, templateData, details) {
    this.renderer.disposeCompressedElements?.(this.compressibleNodeMapperProvider().map(node), index2, templateData.templateData, details);
  }
  disposeTemplate(templateData) {
    this.renderer.disposeTemplate(templateData.templateData);
  }
  dispose() {
    this.renderedNodes.clear();
    this.disposables = dispose(this.disposables);
  }
};

function asCompressibleObjectTreeOptions(options3) {
  const objectTreeOptions = options3 && asObjectTreeOptions2(options3);
  return objectTreeOptions && {
    ...objectTreeOptions,
    keyboardNavigationLabelProvider: objectTreeOptions.keyboardNavigationLabelProvider && {
      ...objectTreeOptions.keyboardNavigationLabelProvider,
      getCompressedNodeKeyboardNavigationLabel(els) {
        return options3.keyboardNavigationLabelProvider.getCompressedNodeKeyboardNavigationLabel(els.map((e4) => e4.element));
      }
    },
    stickyScrollDelegate: objectTreeOptions.stickyScrollDelegate
  };
}

var CompressibleAsyncDataTree = class extends AsyncDataTree {
  constructor(user, container2, virtualDelegate, compressionDelegate, renderers, dataSource, options3 = {}) {
    super(user, container2, virtualDelegate, renderers, dataSource, options3);
    this.compressionDelegate = compressionDelegate;
    this.compressibleNodeMapper = new WeakMapper((node) => new CompressibleAsyncDataTreeNodeWrapper(node));
    this.filter = options3.filter;
  }
  getCompressedTreeNode(e4) {
    const node = this.getDataNode(e4);
    return this.tree.getCompressedTreeNode(node).element;
  }
  createTree(user, container2, delegate, renderers, options3) {
    const objectTreeDelegate = new ComposedTreeDelegate(delegate);
    const objectTreeRenderers = renderers.map((r2) => new CompressibleAsyncDataTreeRenderer(r2, this.nodeMapper, () => this.compressibleNodeMapper, this._onDidChangeNodeSlowState.event));
    const objectTreeOptions = asCompressibleObjectTreeOptions(options3) || {};
    return new CompressibleObjectTree(user, container2, objectTreeDelegate, objectTreeRenderers, objectTreeOptions);
  }
  asTreeElement(node, viewStateContext) {
    return {
      incompressible: this.compressionDelegate.isIncompressible(node.element),
      ...super.asTreeElement(node, viewStateContext)
    };
  }
  getViewState() {
    if (!this.identityProvider) {
      throw new TreeError(this.user, "Can't get tree view state without an identity provider");
    }
    const getId = (element) => this.identityProvider.getId(element).toString();
    const focus = this.getFocus().map(getId);
    const selection = this.getSelection().map(getId);
    const expanded2 = [];
    const root = this.tree.getCompressedTreeNode();
    const stack = [root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node !== root && node.collapsible && !node.collapsed) {
        for (const asyncNode of node.element.elements) {
          expanded2.push(getId(asyncNode.element));
        }
      }
      stack.push(...node.children);
    }
    return { focus, selection, expanded: expanded2, scrollTop: this.scrollTop };
  }
  render(node, viewStateContext, options3) {
    if (!this.identityProvider) {
      return super.render(node, viewStateContext);
    }
    const getId = (element) => this.identityProvider.getId(element).toString();
    const getUncompressedIds = (nodes) => {
      const result = /* @__PURE__ */ new Set();
      for (const node2 of nodes) {
        const compressedNode = this.tree.getCompressedTreeNode(node2 === this.root ? null : node2);
        if (!compressedNode.element) {
          continue;
        }
        for (const node3 of compressedNode.element.elements) {
          result.add(getId(node3.element));
        }
      }
      return result;
    };
    const oldSelection = getUncompressedIds(this.tree.getSelection());
    const oldFocus = getUncompressedIds(this.tree.getFocus());
    super.render(node, viewStateContext, options3);
    const selection = this.getSelection();
    let didChangeSelection = false;
    const focus = this.getFocus();
    let didChangeFocus = false;
    const visit2 = (node2) => {
      const compressedNode = node2.element;
      if (compressedNode) {
        for (let i2 = 0; i2 < compressedNode.elements.length; i2++) {
          const id2 = getId(compressedNode.elements[i2].element);
          const element = compressedNode.elements[compressedNode.elements.length - 1].element;
          if (oldSelection.has(id2) && selection.indexOf(element) === -1) {
            selection.push(element);
            didChangeSelection = true;
          }
          if (oldFocus.has(id2) && focus.indexOf(element) === -1) {
            focus.push(element);
            didChangeFocus = true;
          }
        }
      }
      node2.children.forEach(visit2);
    };
    visit2(this.tree.getCompressedTreeNode(node === this.root ? null : node));
    if (didChangeSelection) {
      this.setSelection(selection);
    }
    if (didChangeFocus) {
      this.setFocus(focus);
    }
  }
  // For compressed async data trees, `TreeVisibility.Recurse` doesn't currently work
  // and we have to filter everything beforehand
  // Related to #85193 and #85835
  processChildren(children) {
    if (this.filter) {
      children = Iterable.filter(children, (e4) => {
        const result = this.filter.filter(e4, 1 /* Visible */);
        const visibility = getVisibility(result);
        if (visibility === 2 /* Recurse */) {
          throw new Error("Recursive tree visibility not supported in async data compressed trees");
        }
        return visibility === 1 /* Visible */;
      });
    }
    return super.processChildren(children);
  }
  navigate(start) {
    return super.navigate(start);
  }
};

function getVisibility(filterResult) {
  if (typeof filterResult === "boolean") {
    return filterResult ? 1 /* Visible */ : 0 /* Hidden */;
  } else if (isFilterResult(filterResult)) {
    return getVisibleState(filterResult.visibility);
  } else {
    return getVisibleState(filterResult);
  }
}

var AsyncDataTreeNavigator = class {
  constructor(navigator2) {
    this.navigator = navigator2;
  }
  current() {
    const current = this.navigator.current();
    if (current === null) {
      return null;
    }
    return current.element;
  }
  previous() {
    this.navigator.previous();
    return this.current();
  }
  first() {
    this.navigator.first();
    return this.current();
  }
  last() {
    this.navigator.last();
    return this.current();
  }
  next() {
    this.navigator.next();
    return this.current();
  }
};
export { createAsyncDataTreeNode, isAncestor2, intersects, asTreeEvent, asTreeMouseEvent2, asTreeContextMenuEvent2, asAsyncDataTreeDragAndDropData, asObjectTreeOptions2, dfs2, asCompressibleObjectTreeOptions, getVisibility, AsyncDataTreeNodeWrapper, AsyncDataTreeRenderer, AsyncDataTreeElementsDragAndDropData, AsyncDataTreeNodeListDragAndDrop, AsyncFindFilter, AsyncFindController, AsyncDataTree, CompressibleAsyncDataTreeNodeWrapper, CompressibleAsyncDataTreeRenderer, CompressibleAsyncDataTree, AsyncDataTreeNavigator };
