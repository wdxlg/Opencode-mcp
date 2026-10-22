// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/tree/abstractTree.ts
import { ElementsDragAndDropData } from "./module-0459.mjs";
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { Delayer, disposableTimeout, timeout } from "./module-0036.mjs";
import { distinct, equals, insertInto, range } from "./module-0007.mjs";
import { Emitter, Event2, EventBufferer, Relay } from "./module-0017.mjs";
import { clamp } from "./module-0040.mjs";
import { $, addDisposableListener, append, clearNode, h, hasParentWithClass, isActiveElement, isEditableElement, isKeyboardEvent } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { getVisibleState, isFilterResult } from "./module-0628.mjs";
import { FuzzyScore, fuzzyScore } from "./module-0453.mjs";
import { Toggle, unthemedToggleStyles } from "./module-0549.mjs";
import { unthemedInboxStyles } from "./module-0600.mjs";
import { FindInput } from "./module-0601.mjs";
import { localize } from "./module-0001.mjs";
import { ActionBar } from "./module-0477.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { Action } from "./module-0082.mjs";
import { alert } from "./module-0076.mjs";
import { constObservable } from "./module-0061.mjs";
import { autorun } from "./module-0052.mjs";
import { List, MouseController, isActionItem, isButton, isMonacoCustomToggle, isMonacoEditor, isStickyScrollContainer, isStickyScrollElement } from "./module-0460.mjs";
import { SetMap } from "./module-0008.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { asCssValueWithDefault } from "./module-0449.mjs";
import { TreeError } from "./module-0627.mjs";
import { isMacintosh } from "./module-0014.mjs";


// src/vs/base/browser/ui/tree/abstractTree.ts
var TreeElementsDragAndDropData = class extends ElementsDragAndDropData {
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

function asTreeDragAndDropData(data) {
  if (data instanceof ElementsDragAndDropData) {
    return new TreeElementsDragAndDropData(data);
  }
  return data;
}

var TreeNodeListDragAndDrop = class {
  constructor(modelProvider, dnd) {
    this.modelProvider = modelProvider;
    this.dnd = dnd;
    this.autoExpandDisposable = Disposable.None;
    this.disposables = new DisposableStore();
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
    this.dnd.onDragStart?.(asTreeDragAndDropData(data), originalEvent);
  }
  onDragOver(data, targetNode, targetIndex, targetSector, originalEvent, raw = true) {
    const result = this.dnd.onDragOver(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
    const didChangeAutoExpandNode = this.autoExpandNode !== targetNode;
    if (didChangeAutoExpandNode) {
      this.autoExpandDisposable.dispose();
      this.autoExpandNode = targetNode;
    }
    if (typeof targetNode === "undefined") {
      return result;
    }
    if (didChangeAutoExpandNode && typeof result !== "boolean" && result.autoExpand) {
      this.autoExpandDisposable = disposableTimeout(() => {
        const model2 = this.modelProvider();
        const ref2 = model2.getNodeLocation(targetNode);
        if (model2.isCollapsed(ref2)) {
          model2.setCollapsed(ref2, false);
        }
        this.autoExpandNode = void 0;
      }, 500, this.disposables);
    }
    if (typeof result === "boolean" || !result.accept || typeof result.bubble === "undefined" || result.feedback) {
      if (!raw) {
        const accept = typeof result === "boolean" ? result : result.accept;
        const effect = typeof result === "boolean" ? void 0 : result.effect;
        return { accept, effect, feedback: [targetIndex] };
      }
      return result;
    }
    if (result.bubble === 1 /* Up */) {
      const model2 = this.modelProvider();
      const ref2 = model2.getNodeLocation(targetNode);
      const parentRef = model2.getParentNodeLocation(ref2);
      const parentNode = model2.getNode(parentRef);
      const parentIndex = parentRef && model2.getListIndex(parentRef);
      return this.onDragOver(data, parentNode, parentIndex, targetSector, originalEvent, false);
    }
    const model = this.modelProvider();
    const ref = model.getNodeLocation(targetNode);
    const start = model.getListIndex(ref);
    const length = model.getListRenderCount(ref);
    return { ...result, feedback: range(start, start + length) };
  }
  drop(data, targetNode, targetIndex, targetSector, originalEvent) {
    this.autoExpandDisposable.dispose();
    this.autoExpandNode = void 0;
    this.dnd.drop(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
  }
  onDragEnd(originalEvent) {
    this.dnd.onDragEnd?.(originalEvent);
  }
  dispose() {
    this.disposables.dispose();
    this.dnd.dispose();
  }
};

function asListOptions(modelProvider, disposableStore, options3) {
  return options3 && {
    ...options3,
    identityProvider: options3.identityProvider && {
      getId(el) {
        return options3.identityProvider.getId(el.element);
      },
      getGroupId: options3.identityProvider.getGroupId ? (el) => {
        return options3.identityProvider.getGroupId(el.element);
      } : void 0
    },
    dnd: options3.dnd && disposableStore.add(new TreeNodeListDragAndDrop(modelProvider, options3.dnd)),
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
      getSetSize(node) {
        const model = modelProvider();
        const ref = model.getNodeLocation(node);
        const parentRef = model.getParentNodeLocation(ref);
        const parentNode = model.getNode(parentRef);
        return parentNode.visibleChildrenCount;
      },
      getPosInSet(node) {
        return node.visibleChildIndex + 1;
      },
      isChecked: options3.accessibilityProvider && options3.accessibilityProvider.isChecked ? (node) => {
        return options3.accessibilityProvider.isChecked(node.element);
      } : void 0,
      getRole: options3.accessibilityProvider && options3.accessibilityProvider.getRole ? (node) => {
        return options3.accessibilityProvider.getRole(node.element);
      } : () => "treeitem",
      getAriaLabel(e4) {
        return options3.accessibilityProvider.getAriaLabel(e4.element);
      },
      getWidgetAriaLabel() {
        return options3.accessibilityProvider.getWidgetAriaLabel();
      },
      getWidgetRole: options3.accessibilityProvider && options3.accessibilityProvider.getWidgetRole ? () => options3.accessibilityProvider.getWidgetRole() : () => "tree",
      getAriaLevel: options3.accessibilityProvider && options3.accessibilityProvider.getAriaLevel ? (node) => options3.accessibilityProvider.getAriaLevel(node.element) : (node) => {
        return node.depth;
      },
      getActiveDescendantId: options3.accessibilityProvider.getActiveDescendantId && ((node) => {
        return options3.accessibilityProvider.getActiveDescendantId(node.element);
      })
    },
    keyboardNavigationLabelProvider: options3.keyboardNavigationLabelProvider && {
      ...options3.keyboardNavigationLabelProvider,
      getKeyboardNavigationLabel(node) {
        return options3.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(node.element);
      }
    }
  };
}

var ComposedTreeDelegate = class {
  constructor(delegate) {
    this.delegate = delegate;
  }
  getHeight(element) {
    return this.delegate.getHeight(element.element);
  }
  getTemplateId(element) {
    return this.delegate.getTemplateId(element.element);
  }
  hasDynamicHeight(element) {
    return !!this.delegate.hasDynamicHeight && this.delegate.hasDynamicHeight(element.element);
  }
  setDynamicHeight(element, height) {
    this.delegate.setDynamicHeight?.(element.element, height);
  }
};

var AbstractTreeViewState = class _AbstractTreeViewState {
  static lift(state) {
    return state instanceof _AbstractTreeViewState ? state : new _AbstractTreeViewState(state);
  }
  static empty(scrollTop = 0) {
    return new _AbstractTreeViewState({
      focus: [],
      selection: [],
      expanded: /* @__PURE__ */ Object.create(null),
      scrollTop
    });
  }
  constructor(state) {
    this.focus = new Set(state.focus);
    this.selection = new Set(state.selection);
    if (state.expanded instanceof Array) {
      this.expanded = /* @__PURE__ */ Object.create(null);
      for (const id2 of state.expanded) {
        this.expanded[id2] = 1;
      }
    } else {
      this.expanded = state.expanded;
    }
    this.expanded = state.expanded;
    this.scrollTop = state.scrollTop;
  }
  toJSON() {
    return {
      focus: Array.from(this.focus),
      selection: Array.from(this.selection),
      expanded: this.expanded,
      scrollTop: this.scrollTop
    };
  }
};

var EventCollection = class {
  constructor(onDidChange, _elements = []) {
    this._elements = _elements;
    this.disposables = new DisposableStore();
    this.onDidChange = Event2.forEach(onDidChange, (elements) => this._elements = elements, this.disposables);
  }
  get elements() {
    return this._elements;
  }
  dispose() {
    this.disposables.dispose();
  }
};

var TreeRenderer = class _TreeRenderer {
  constructor(renderer, model, onDidChangeCollapseState, activeNodes, renderedIndentGuides, options3 = {}) {
    this.renderer = renderer;
    this.model = model;
    this.activeNodes = activeNodes;
    this.renderedIndentGuides = renderedIndentGuides;
    this.renderedElements = /* @__PURE__ */ new Map();
    this.renderedNodes = /* @__PURE__ */ new Map();
    this.indent = _TreeRenderer.DefaultIndent;
    this.defaultIndent = _TreeRenderer.DefaultIndent;
    this.hideTwistiesOfChildlessElements = false;
    this.shouldRenderIndentGuides = false;
    this.activeIndentNodes = /* @__PURE__ */ new Set();
    this.indentGuidesDisposable = Disposable.None;
    this.disposables = new DisposableStore();
    this.templateId = renderer.templateId;
    this.updateOptions(options3);
    Event2.map(onDidChangeCollapseState, (e4) => e4.node)(this.onDidChangeNodeTwistieState, this, this.disposables);
    renderer.onDidChangeTwistieState?.(this.onDidChangeTwistieState, this, this.disposables);
  }
  static {
    this.DefaultIndent = 8;
  }
  updateOptions(options3 = {}) {
    if (typeof options3.defaultIndent !== "undefined") {
      this.defaultIndent = options3.defaultIndent;
    }
    if (typeof options3.indent !== "undefined" || typeof options3.defaultIndent !== "undefined") {
      const indent = typeof options3.indent !== "undefined" ? clamp(options3.indent, 0, 40) : this.indent;
      const needsRerender = indent !== this.indent || typeof options3.defaultIndent !== "undefined";
      if (needsRerender) {
        this.indent = indent;
        for (const [node, templateData] of this.renderedNodes) {
          templateData.indentSize = this.defaultIndent + (node.depth - 1) * this.indent;
          this.renderTreeElement(node, templateData);
        }
      }
    }
    if (typeof options3.renderIndentGuides !== "undefined") {
      const shouldRenderIndentGuides = options3.renderIndentGuides !== "none" /* None */;
      if (shouldRenderIndentGuides !== this.shouldRenderIndentGuides) {
        this.shouldRenderIndentGuides = shouldRenderIndentGuides;
        for (const [node, templateData] of this.renderedNodes) {
          this._renderIndentGuides(node, templateData);
        }
        this.indentGuidesDisposable.dispose();
        if (shouldRenderIndentGuides) {
          const disposables = new DisposableStore();
          this.activeNodes.onDidChange(this._onDidChangeActiveNodes, this, disposables);
          this.indentGuidesDisposable = disposables;
          this._onDidChangeActiveNodes(this.activeNodes.elements);
        }
      }
    }
    if (typeof options3.hideTwistiesOfChildlessElements !== "undefined") {
      this.hideTwistiesOfChildlessElements = options3.hideTwistiesOfChildlessElements;
    }
    if (typeof options3.twistieAdditionalCssClass !== "undefined") {
      this.twistieAdditionalCssClass = options3.twistieAdditionalCssClass;
    }
  }
  renderTemplate(container2) {
    if (this.renderer.rowClassName) {
      container2.classList.add(this.renderer.rowClassName);
    }
    const el = append(container2, $(".monaco-tl-row"));
    const indent = append(el, $(".monaco-tl-indent"));
    const twistie = append(el, $(".monaco-tl-twistie"));
    const contents = append(el, $(".monaco-tl-contents"));
    const templateData = this.renderer.renderTemplate(contents);
    return { container: container2, indent, twistie, indentGuidesDisposable: Disposable.None, indentSize: 0, templateData };
  }
  renderElement(node, index2, templateData, details) {
    templateData.indentSize = this.defaultIndent + (node.depth - 1) * this.indent;
    this.renderedNodes.set(node, templateData);
    this.renderedElements.set(node.element, node);
    this.renderTreeElement(node, templateData);
    this.renderer.renderElement(node, index2, templateData.templateData, { ...details, indent: templateData.indentSize });
  }
  disposeElement(node, index2, templateData, details) {
    templateData.indentGuidesDisposable.dispose();
    this.renderer.disposeElement?.(node, index2, templateData.templateData, { ...details, indent: templateData.indentSize });
    if (typeof details?.height === "number" && this.renderedNodes.get(node) === templateData) {
      this.renderedNodes.delete(node);
      if (this.renderedElements.get(node.element) === node) {
        this.renderedElements.delete(node.element);
      }
    }
  }
  disposeTemplate(templateData) {
    this.renderer.disposeTemplate(templateData.templateData);
  }
  onDidChangeTwistieState(element) {
    const node = this.renderedElements.get(element);
    if (!node) {
      return;
    }
    this.onDidChangeNodeTwistieState(node);
  }
  onDidChangeNodeTwistieState(node) {
    const templateData = this.renderedNodes.get(node);
    if (!templateData) {
      return;
    }
    this._onDidChangeActiveNodes(this.activeNodes.elements);
    this.renderTreeElement(node, templateData);
  }
  renderTreeElement(node, templateData) {
    templateData.twistie.className = templateData.twistie.classList.item(0);
    templateData.twistie.style.paddingLeft = `${templateData.indentSize}px`;
    templateData.indent.style.width = `${templateData.indentSize + this.indent - 16}px`;
    if (node.collapsible) {
      templateData.container.setAttribute("aria-expanded", String(!node.collapsed));
    } else {
      templateData.container.removeAttribute("aria-expanded");
    }
    templateData.twistie.classList.remove(...ThemeIcon.asClassNameArray(Codicon.treeItemExpanded));
    let twistieRendered = false;
    if (this.renderer.renderTwistie) {
      twistieRendered = this.renderer.renderTwistie(node.element, templateData.twistie);
    }
    if (node.collapsible && (!this.hideTwistiesOfChildlessElements || node.visibleChildrenCount > 0)) {
      if (!twistieRendered) {
        templateData.twistie.classList.add(...ThemeIcon.asClassNameArray(Codicon.treeItemExpanded));
      }
      templateData.twistie.classList.add("collapsible");
      templateData.twistie.classList.toggle("collapsed", node.collapsed);
    } else {
      templateData.twistie.classList.remove("collapsible", "collapsed");
    }
    if (this.twistieAdditionalCssClass) {
      const additionalClass = this.twistieAdditionalCssClass(node.element);
      if (additionalClass) {
        templateData.twistie.classList.add(additionalClass);
      }
    }
    this._renderIndentGuides(node, templateData);
  }
  _renderIndentGuides(node, templateData) {
    clearNode(templateData.indent);
    templateData.indentGuidesDisposable.dispose();
    if (!this.shouldRenderIndentGuides) {
      return;
    }
    const disposableStore = new DisposableStore();
    while (true) {
      const ref = this.model.getNodeLocation(node);
      const parentRef = this.model.getParentNodeLocation(ref);
      if (!parentRef) {
        break;
      }
      const parent = this.model.getNode(parentRef);
      const guide = $(".indent-guide", { style: `width: ${this.indent}px` });
      if (this.activeIndentNodes.has(parent)) {
        guide.classList.add("active");
      }
      if (templateData.indent.childElementCount === 0) {
        templateData.indent.appendChild(guide);
      } else {
        templateData.indent.insertBefore(guide, templateData.indent.firstElementChild);
      }
      this.renderedIndentGuides.add(parent, guide);
      disposableStore.add(toDisposable(() => this.renderedIndentGuides.delete(parent, guide)));
      node = parent;
    }
    templateData.indentGuidesDisposable = disposableStore;
  }
  _onDidChangeActiveNodes(nodes) {
    if (!this.shouldRenderIndentGuides) {
      return;
    }
    const set = /* @__PURE__ */ new Set();
    nodes.forEach((node) => {
      const ref = this.model.getNodeLocation(node);
      try {
        const parentRef = this.model.getParentNodeLocation(ref);
        if (node.collapsible && node.children.length > 0 && !node.collapsed) {
          set.add(node);
        } else if (parentRef) {
          set.add(this.model.getNode(parentRef));
        }
      } catch {
      }
    });
    this.activeIndentNodes.forEach((node) => {
      if (!set.has(node)) {
        this.renderedIndentGuides.forEach(node, (line) => line.classList.remove("active"));
      }
    });
    set.forEach((node) => {
      if (!this.activeIndentNodes.has(node)) {
        this.renderedIndentGuides.forEach(node, (line) => line.classList.add("active"));
      }
    });
    this.activeIndentNodes = set;
  }
  dispose() {
    this.renderedNodes.clear();
    this.renderedElements.clear();
    this.indentGuidesDisposable.dispose();
    dispose(this.disposables);
  }
};

function contiguousFuzzyScore(patternLower, wordLower) {
  const index2 = wordLower.toLowerCase().indexOf(patternLower);
  let score3;
  if (index2 > -1) {
    score3 = [Number.MAX_SAFE_INTEGER, 0];
    for (let i2 = patternLower.length; i2 > 0; i2--) {
      score3.push(index2 + i2 - 1);
    }
  }
  return score3;
}

var FindFilter = class {
  constructor(_keyboardNavigationLabelProvider, _filter, _defaultFindVisibility) {
    this._keyboardNavigationLabelProvider = _keyboardNavigationLabelProvider;
    this._filter = _filter;
    this._defaultFindVisibility = _defaultFindVisibility;
    this._totalCount = 0;
    this._matchCount = 0;
    this._findMatchType = 0 /* Fuzzy */;
    this._findMode = 0 /* Highlight */;
    this._pattern = "";
    this._lowercasePattern = "";
    this.disposables = new DisposableStore();
  }
  get totalCount() {
    return this._totalCount;
  }
  get matchCount() {
    return this._matchCount;
  }
  set findMatchType(type) {
    this._findMatchType = type;
  }
  get findMatchType() {
    return this._findMatchType;
  }
  set findMode(mode) {
    this._findMode = mode;
  }
  get findMode() {
    return this._findMode;
  }
  set pattern(pattern) {
    this._pattern = pattern;
    this._lowercasePattern = pattern.toLowerCase();
  }
  filter(element, parentVisibility) {
    let visibility = 1 /* Visible */;
    if (this._filter) {
      const result = this._filter.filter(element, parentVisibility);
      if (typeof result === "boolean") {
        visibility = result ? 1 /* Visible */ : 0 /* Hidden */;
      } else if (isFilterResult(result)) {
        visibility = getVisibleState(result.visibility);
      } else {
        visibility = result;
      }
      if (visibility === 0 /* Hidden */) {
        return false;
      }
    }
    this._totalCount++;
    if (!this._pattern) {
      this._matchCount++;
      return { data: FuzzyScore.Default, visibility };
    }
    const label3 = this._keyboardNavigationLabelProvider.getKeyboardNavigationLabel(element);
    const labels = Array.isArray(label3) ? label3 : [label3];
    for (const l of labels) {
      const labelStr = l && l.toString();
      if (typeof labelStr === "undefined") {
        return { data: FuzzyScore.Default, visibility };
      }
      let score3;
      if (this._findMatchType === 1 /* Contiguous */) {
        score3 = contiguousFuzzyScore(this._lowercasePattern, labelStr.toLowerCase());
      } else {
        score3 = fuzzyScore(this._pattern, this._lowercasePattern, 0, labelStr, labelStr.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
      }
      if (score3) {
        this._matchCount++;
        return labels.length === 1 ? { data: score3, visibility } : { data: { label: labelStr, score: score3 }, visibility };
      }
    }
    if (this._findMode === 1 /* Filter */) {
      if (typeof this._defaultFindVisibility === "number") {
        return this._defaultFindVisibility;
      } else if (this._defaultFindVisibility) {
        return this._defaultFindVisibility(element);
      } else {
        return 2 /* Recurse */;
      }
    } else {
      return { data: FuzzyScore.Default, visibility };
    }
  }
  reset() {
    this._totalCount = 0;
    this._matchCount = 0;
  }
  dispose() {
    dispose(this.disposables);
  }
};

var TreeFindToggle = class extends Toggle {
  constructor(contribution, opts, hoverLifecycleOptions2) {
    super({
      icon: contribution.icon,
      title: contribution.title,
      isChecked: contribution.isChecked,
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground,
      hoverLifecycleOptions: hoverLifecycleOptions2
    });
    this.id = contribution.id;
  }
};

var FindToggles = class {
  constructor(startStates) {
    this.stateMap = new Map(startStates.map((state) => [state.id, { ...state }]));
  }
  states() {
    return Array.from(this.stateMap.values());
  }
  get(id2) {
    const state = this.stateMap.get(id2);
    if (state === void 0) {
      throw new Error(`No state found for toggle id ${id2}`);
    }
    return state.isChecked;
  }
  set(id2, value2) {
    const state = this.stateMap.get(id2);
    if (state === void 0) {
      throw new Error(`No state found for toggle id ${id2}`);
    }
    if (state.isChecked === value2) {
      return false;
    }
    state.isChecked = value2;
    return true;
  }
};

var unthemedFindWidgetStyles = {
  inputBoxStyles: unthemedInboxStyles,
  toggleStyles: unthemedToggleStyles,
  listFilterWidgetBackground: void 0,
  listFilterWidgetNoMatchesOutline: void 0,
  listFilterWidgetOutline: void 0,
  listFilterWidgetShadow: void 0
};

var FindWidget2 = class extends Disposable {
  constructor(container2, tree, contextViewProvider, placeholder, toggleContributions = [], options3) {
    super();
    this.tree = tree;
    this.elements = h(".monaco-tree-type-filter", [
      h(".monaco-tree-type-filter-input@findInput"),
      h(".monaco-tree-type-filter-actionbar@actionbar")
    ]);
    this.toggles = [];
    this._onDidDisable = this._register(new Emitter());
    this.onDidDisable = this._onDidDisable.event;
    container2.appendChild(this.elements.root);
    this._register(toDisposable(() => this.elements.root.remove()));
    const styles = options3?.styles ?? unthemedFindWidgetStyles;
    if (styles.listFilterWidgetBackground) {
      this.elements.root.style.backgroundColor = styles.listFilterWidgetBackground;
    }
    if (styles.listFilterWidgetShadow) {
      this.elements.root.style.boxShadow = `0 0 8px 2px ${styles.listFilterWidgetShadow}`;
    }
    const hoverLifecycleOptions2 = { groupId: "abstract-tree" };
    this.toggles = toggleContributions.map((contribution) => this._register(new TreeFindToggle(contribution, styles.toggleStyles, hoverLifecycleOptions2)));
    this.onDidToggleChange = Event2.any(...this.toggles.map((toggle) => Event2.map(toggle.onChange, () => ({ id: toggle.id, isChecked: toggle.checked }))));
    const history = options3?.history || [];
    this.findInput = this._register(new FindInput(this.elements.findInput, contextViewProvider, {
      label: localize(42, null),
      placeholder,
      additionalToggles: this.toggles,
      showCommonFindToggles: false,
      inputBoxStyles: styles.inputBoxStyles,
      toggleStyles: styles.toggleStyles,
      history: new Set(history),
      hoverLifecycleOptions: hoverLifecycleOptions2
    }));
    this.actionbar = this._register(new ActionBar(this.elements.actionbar));
    const emitter = this._register(new DomEmitter(this.findInput.inputBox.inputElement, "keydown"));
    const onKeyDown = Event2.chain(emitter.event, ($129) => $129.map((e4) => new StandardKeyboardEvent(e4)));
    this._register(onKeyDown((e4) => {
      if (e4.equals(3 /* Enter */)) {
        e4.preventDefault();
        e4.stopPropagation();
        this.findInput.inputBox.addToHistory();
        this.tree.domFocus();
        return;
      }
      if (e4.equals(18 /* DownArrow */)) {
        e4.preventDefault();
        e4.stopPropagation();
        if (this.findInput.inputBox.isAtLastInHistory() || this.findInput.inputBox.isNowhereInHistory()) {
          this.findInput.inputBox.addToHistory();
          this.tree.domFocus();
        } else {
          this.findInput.inputBox.showNextValue();
        }
        return;
      }
      if (e4.equals(16 /* UpArrow */)) {
        e4.preventDefault();
        e4.stopPropagation();
        this.findInput.inputBox.showPreviousValue();
        return;
      }
    }));
    const closeAction = this._register(new Action("close", localize(33, null), "codicon codicon-close", true, () => this.dispose()));
    this.actionbar.push(closeAction, { icon: true, label: false });
    this.onDidChangeValue = this.findInput.onDidChange;
  }
  get value() {
    return this.findInput.inputBox.value;
  }
  set value(value2) {
    this.findInput.inputBox.value = value2;
  }
  setToggleState(id2, checked) {
    const toggle = this.toggles.find((toggle2) => toggle2.id === id2);
    if (toggle) {
      toggle.checked = checked;
    }
  }
  setPlaceHolder(placeHolder) {
    this.findInput.inputBox.setPlaceHolder(placeHolder);
  }
  getHistory() {
    return this.findInput.inputBox.getHistory();
  }
  focus() {
    this.findInput.focus();
  }
  select() {
    this.findInput.select();
    this.findInput.inputBox.addToHistory(true);
  }
  showMessage(message) {
    this.findInput.showMessage(message);
  }
  clearMessage() {
    this.findInput.clearMessage();
  }
  async dispose() {
    this._onDidDisable.fire();
    this.elements.root.classList.add("disabled");
    await timeout(300);
    super.dispose();
  }
};

var AbstractFindController = class {
  constructor(tree, filter2, contextViewProvider, options3 = {}) {
    this.tree = tree;
    this.filter = filter2;
    this.contextViewProvider = contextViewProvider;
    this.options = options3;
    this._pattern = "";
    this.previousPattern = "";
    this._onDidChangePattern = new Emitter();
    this.onDidChangePattern = this._onDidChangePattern.event;
    this._onDidChangeOpenState = new Emitter();
    this.onDidChangeOpenState = this._onDidChangeOpenState.event;
    this.enabledDisposables = new DisposableStore();
    this.disposables = new DisposableStore();
    this.toggles = new FindToggles(options3.toggles ?? []);
    this._placeholder = options3.placeholder ?? localize(42, null);
  }
  get pattern() {
    return this._pattern;
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(value2) {
    this._placeholder = value2;
    this.widget?.setPlaceHolder(value2);
  }
  isOpened() {
    return !!this.widget;
  }
  open() {
    if (this.widget) {
      this.widget.focus();
      this.widget.select();
      return;
    }
    const widgetContainer = this.options.findWidgetContainer ?? this.tree.getHTMLElement();
    if (!this.options.findWidgetContainer) {
      this.tree.updateOptions({ paddingTop: 30 });
    }
    this.widget = new FindWidget2(widgetContainer, this.tree, this.contextViewProvider, this.placeholder, this.toggles.states(), { ...this.options, history: this._history });
    this.enabledDisposables.add(this.widget);
    this.widget.onDidChangeValue(this.onDidChangeValue, this, this.enabledDisposables);
    this.widget.onDidDisable(this.close, this, this.enabledDisposables);
    this.widget.onDidToggleChange(this.onDidToggleChange, this, this.enabledDisposables);
    this.widget.focus();
    this.widget.value = this.previousPattern;
    this.widget.select();
    this._onDidChangeOpenState.fire(true);
  }
  close() {
    if (!this.widget) {
      return;
    }
    if (!this.options.findWidgetContainer) {
      this.tree.updateOptions({ paddingTop: 0 });
    }
    this._history = this.widget.getHistory();
    this.widget = void 0;
    this.enabledDisposables.clear();
    this.previousPattern = this.pattern;
    this.onDidChangeValue("");
    this.tree.domFocus();
    this._onDidChangeOpenState.fire(false);
  }
  onDidChangeValue(pattern) {
    this._pattern = pattern;
    this._onDidChangePattern.fire(pattern);
    this.filter.pattern = pattern;
    this.applyPattern(pattern);
  }
  onDidToggleChange(e4) {
    this.toggles.set(e4.id, e4.isChecked);
  }
  updateToggleState(id2, checked) {
    this.toggles.set(id2, checked);
    this.widget?.setToggleState(id2, checked);
  }
  renderMessage(showNotFound, warningMessage) {
    if (showNotFound) {
      if (this.tree.options.showNotFoundMessage ?? true) {
        this.widget?.showMessage({ type: 2 /* WARNING */, content: warningMessage ?? localize(37, null) });
      } else {
        this.widget?.showMessage({ type: 2 /* WARNING */ });
      }
    } else {
      this.widget?.clearMessage();
    }
  }
  alertResults(results) {
    if (!results) {
      alert(localize(38, null));
    } else {
      alert(localize(35, null, results));
    }
  }
  dispose() {
    this._history = void 0;
    this._onDidChangePattern.dispose();
    this.enabledDisposables.dispose();
    this.disposables.dispose();
  }
};

var FindController = class extends AbstractFindController {
  constructor(tree, filter2, contextViewProvider, options3 = {}) {
    const defaultFindMode = options3.defaultFindMode ?? 0 /* Highlight */;
    const defaultFindMatchType = options3.defaultFindMatchType ?? 0 /* Fuzzy */;
    const toggleContributions = [{
      id: "mode" /* Mode */,
      icon: Codicon.listFilter,
      title: localize(34, null),
      isChecked: defaultFindMode === 1 /* Filter */
    }, {
      id: "matchType" /* MatchType */,
      icon: Codicon.searchFuzzy,
      title: localize(36, null),
      isChecked: defaultFindMatchType === 0 /* Fuzzy */
    }];
    filter2.findMatchType = defaultFindMatchType;
    filter2.findMode = defaultFindMode;
    super(tree, filter2, contextViewProvider, { ...options3, toggles: toggleContributions });
    this.filter = filter2;
    this._onDidChangeMode = new Emitter();
    this.onDidChangeMode = this._onDidChangeMode.event;
    this._onDidChangeMatchType = new Emitter();
    this.onDidChangeMatchType = this._onDidChangeMatchType.event;
    this.disposables.add(this.tree.onDidChangeModel(() => {
      if (!this.isOpened()) {
        return;
      }
      if (this.pattern.length !== 0) {
        this.tree.refilter();
      }
      this.render();
    }));
    this.disposables.add(this.tree.onWillRefilter(() => this.filter.reset()));
  }
  get mode() {
    return this.toggles.get("mode" /* Mode */) ? 1 /* Filter */ : 0 /* Highlight */;
  }
  set mode(mode) {
    if (mode === this.mode) {
      return;
    }
    const isFilterMode = mode === 1 /* Filter */;
    this.updateToggleState("mode" /* Mode */, isFilterMode);
    this.placeholder = isFilterMode ? localize(41, null) : localize(42, null);
    this.filter.findMode = mode;
    this.tree.refilter();
    this.render();
    this._onDidChangeMode.fire(mode);
  }
  get matchType() {
    return this.toggles.get("matchType" /* MatchType */) ? 0 /* Fuzzy */ : 1 /* Contiguous */;
  }
  set matchType(matchType) {
    if (matchType === this.matchType) {
      return;
    }
    this.updateToggleState("matchType" /* MatchType */, matchType === 0 /* Fuzzy */);
    this.filter.findMatchType = matchType;
    this.tree.refilter();
    this.render();
    this._onDidChangeMatchType.fire(matchType);
  }
  updateOptions(optionsUpdate = {}) {
    if (optionsUpdate.defaultFindMode !== void 0) {
      this.mode = optionsUpdate.defaultFindMode;
    }
    if (optionsUpdate.defaultFindMatchType !== void 0) {
      this.matchType = optionsUpdate.defaultFindMatchType;
    }
  }
  applyPattern(pattern) {
    this.tree.refilter();
    if (pattern) {
      this.tree.focusNext(0, true, void 0, (node) => !FuzzyScore.isDefault(node.filterData));
    }
    const focus = this.tree.getFocus();
    if (focus.length > 0) {
      const element = focus[0];
      if (this.tree.getRelativeTop(element) === null) {
        this.tree.reveal(element, 0.5);
      }
    }
    this.render();
  }
  shouldAllowFocus(node) {
    if (!this.isOpened() || !this.pattern) {
      return true;
    }
    if (this.filter.totalCount > 0 && this.filter.matchCount <= 1) {
      return true;
    }
    return !FuzzyScore.isDefault(node.filterData);
  }
  onDidToggleChange(e4) {
    if (e4.id === "mode" /* Mode */) {
      this.mode = e4.isChecked ? 1 /* Filter */ : 0 /* Highlight */;
    } else if (e4.id === "matchType" /* MatchType */) {
      this.matchType = e4.isChecked ? 0 /* Fuzzy */ : 1 /* Contiguous */;
    }
  }
  render() {
    const noMatches = this.filter.matchCount === 0 && this.filter.totalCount > 0;
    const showNotFound = noMatches && this.pattern.length > 0;
    this.renderMessage(showNotFound);
    if (this.pattern.length) {
      this.alertResults(this.filter.matchCount);
    }
  }
};

function stickyScrollNodeStateEquals(node1, node2) {
  return node1.position === node2.position && stickyScrollNodeEquals(node1, node2);
}

function stickyScrollNodeEquals(node1, node2) {
  return node1.node.element === node2.node.element && node1.startIndex === node2.startIndex && node1.height === node2.height && node1.endIndex === node2.endIndex && node1.sourceNodeEnd === node2.sourceNodeEnd && node1.sourceNodePartiallyVisible === node2.sourceNodePartiallyVisible && node1.hasExplicitHeight === node2.hasExplicitHeight;
}

var StickyScrollState = class {
  constructor(stickyNodes = []) {
    this.stickyNodes = stickyNodes;
  }
  get count() {
    return this.stickyNodes.length;
  }
  equal(state) {
    return equals(this.stickyNodes, state.stickyNodes, stickyScrollNodeStateEquals);
  }
  contains(element) {
    return this.stickyNodes.some((node) => node.node.element === element.element);
  }
  lastNodePartiallyVisible() {
    if (this.count === 0) {
      return false;
    }
    const lastStickyNode = this.stickyNodes[this.count - 1];
    if (this.count === 1) {
      return lastStickyNode.position !== 0;
    }
    const secondLastStickyNode = this.stickyNodes[this.count - 2];
    return secondLastStickyNode.position + secondLastStickyNode.height !== lastStickyNode.position;
  }
  animationStateChanged(previousState) {
    if (!equals(this.stickyNodes, previousState.stickyNodes, stickyScrollNodeEquals)) {
      return false;
    }
    if (this.count === 0) {
      return false;
    }
    const lastStickyNode = this.stickyNodes[this.count - 1];
    const previousLastStickyNode = previousState.stickyNodes[previousState.count - 1];
    return lastStickyNode.position !== previousLastStickyNode.position;
  }
};

var DefaultStickyScrollDelegate = class {
  constrainStickyScrollNodes(stickyNodes, stickyScrollMaxItemCount, maxWidgetHeight) {
    for (let i2 = 0; i2 < stickyNodes.length; i2++) {
      const stickyNode = stickyNodes[i2];
      const stickyNodeBottom = stickyNode.position + stickyNode.height;
      if (stickyNodeBottom > maxWidgetHeight || i2 >= stickyScrollMaxItemCount) {
        return stickyNodes.slice(0, i2);
      }
    }
    return stickyNodes;
  }
};

var StickyScrollController = class extends Disposable {
  constructor(tree, model, view, renderers, treeDelegate, options3 = {}) {
    super();
    this.tree = tree;
    this.model = model;
    this.view = view;
    this.treeDelegate = treeDelegate;
    this.maxWidgetViewRatio = 0.4;
    const stickyScrollOptions = this.validateStickySettings(options3);
    this.stickyScrollMaxItemCount = stickyScrollOptions.stickyScrollMaxItemCount;
    this.stickyScrollDelegate = options3.stickyScrollDelegate ?? new DefaultStickyScrollDelegate();
    this.paddingTop = options3.paddingTop ?? 0;
    this._widget = this._register(new StickyScrollWidget(view.getScrollableElement(), view, tree, renderers, treeDelegate, options3.accessibilityProvider));
    this.onDidChangeHasFocus = this._widget.onDidChangeHasFocus;
    this.onContextMenu = this._widget.onContextMenu;
    this._register(view.onDidScroll(() => this.update()));
    this._register(view.onDidChangeContentHeight(() => this.update()));
    this._register(tree.onDidChangeCollapseState(() => this.update()));
    this._register(this._widget.onDidChangeHeight((heightChanges) => {
      for (const { index: index2, height } of heightChanges) {
        this.view.updateElementHeight(index2, height);
      }
    }));
    this._register(model.onDidSpliceRenderedNodes((e4) => {
      const state = this._widget.state;
      if (!state) {
        return;
      }
      const hasRemovedStickyNode = e4.deleteCount > 0 && state.stickyNodes.some((stickyNode) => !this.model.has(this.model.getNodeLocation(stickyNode.node)));
      if (hasRemovedStickyNode) {
        this.update();
        return;
      }
      const shouldRerenderStickyNodes = state.stickyNodes.some((stickyNode) => {
        const listIndex = this.model.getListIndex(this.model.getNodeLocation(stickyNode.node));
        return listIndex >= e4.start && listIndex < e4.start + e4.deleteCount && state.contains(stickyNode.node);
      });
      if (shouldRerenderStickyNodes) {
        this._widget.rerender();
      }
    }));
    this.update();
  }
  get height() {
    return this._widget.height;
  }
  get count() {
    return this._widget.count;
  }
  getNode(node) {
    return this._widget.getNode(node);
  }
  getNodeAtHeight(height) {
    let index2;
    if (height === 0) {
      index2 = this.view.firstVisibleIndex;
    } else {
      index2 = this.view.indexAt(height + this.view.scrollTop);
    }
    if (index2 < 0 || index2 >= this.view.length) {
      return void 0;
    }
    return this.view.element(index2);
  }
  update() {
    const firstVisibleNode = this.getNodeAtHeight(this.paddingTop);
    if (!firstVisibleNode || this.tree.scrollTop <= this.paddingTop || this.view.renderHeight === 0) {
      this._widget.setState(void 0);
      return;
    }
    const stickyState = this.findStickyState(firstVisibleNode);
    this._widget.setState(stickyState);
  }
  findStickyState(firstVisibleNode) {
    const stickyNodes = [];
    let firstVisibleNodeUnderWidget = firstVisibleNode;
    let stickyNodesHeight = 0;
    let nextStickyNode = this.getNextStickyNode(firstVisibleNodeUnderWidget, void 0, stickyNodesHeight);
    while (nextStickyNode) {
      stickyNodes.push(nextStickyNode);
      stickyNodesHeight += nextStickyNode.height;
      if (stickyNodes.length <= this.stickyScrollMaxItemCount) {
        firstVisibleNodeUnderWidget = this.getNextVisibleNode(nextStickyNode);
        if (!firstVisibleNodeUnderWidget) {
          break;
        }
      }
      nextStickyNode = this.getNextStickyNode(firstVisibleNodeUnderWidget, nextStickyNode.node, stickyNodesHeight);
    }
    const contrainedStickyNodes = this.constrainStickyNodes(stickyNodes);
    return contrainedStickyNodes.length ? new StickyScrollState(contrainedStickyNodes) : void 0;
  }
  getNextVisibleNode(previousStickyNode) {
    return this.getNodeAtHeight(previousStickyNode.position + previousStickyNode.height);
  }
  getNextStickyNode(firstVisibleNodeUnderWidget, previousStickyNode, stickyNodesHeight) {
    const nextStickyNode = this.getAncestorUnderPrevious(firstVisibleNodeUnderWidget, previousStickyNode);
    if (!nextStickyNode) {
      return void 0;
    }
    if (nextStickyNode === firstVisibleNodeUnderWidget && !this.nodeIsUncollapsedParent(firstVisibleNodeUnderWidget)) {
      return void 0;
    }
    const sourceRange = this.getStickyScrollNodeSourceRange(nextStickyNode);
    if (!sourceRange || !Number.isFinite(sourceRange.start) || !Number.isFinite(sourceRange.end) || sourceRange.end <= sourceRange.start) {
      return void 0;
    }
    const sourceNodeTop = this.view.getElementTop(this.getNodeIndex(nextStickyNode));
    const stickyViewportBottom = this.view.scrollTop + stickyNodesHeight;
    if (stickyViewportBottom <= sourceNodeTop + sourceRange.start) {
      return void 0;
    }
    const height = this.getStickyScrollNodeHeight(sourceRange, stickyNodesHeight);
    const sourceNodePartiallyVisible = stickyViewportBottom + height < sourceNodeTop + sourceRange.end;
    return this.createStickyScrollNode(nextStickyNode, stickyNodesHeight, height, sourceRange.end, sourceNodePartiallyVisible, sourceRange.stickyNodeHeight !== void 0);
  }
  getStickyScrollNodeSourceRange(node) {
    const defaultRange = { start: 0, end: this.getNodeHeight(node) };
    const sourceRangeProvider = this.tree.options.stickyScrollNodeSourceRangeProvider;
    if (sourceRangeProvider) {
      return sourceRangeProvider(node.element, defaultRange);
    }
    return defaultRange;
  }
  getStickyScrollNodeHeight(sourceRange, currentStickyNodesHeight) {
    const height = this.clampNodeHeight(sourceRange.stickyNodeHeight ?? sourceRange.end - sourceRange.start);
    if (!sourceRange.estimated) {
      return height;
    }
    const availableHeight = Math.max(1, this.view.renderHeight * this.maxWidgetViewRatio - currentStickyNodesHeight);
    return Math.min(height, availableHeight);
  }
  getNodeHeight(node) {
    const nodeLocation = this.model.getNodeLocation(node);
    const index2 = this.model.getListIndex(nodeLocation);
    if (index2 >= 0) {
      return this.view.getElementHeight(index2);
    }
    return this.treeDelegate.getHeight(node);
  }
  clampNodeHeight(height) {
    const max = this.tree.options.stickyScrollMaxNodeHeight;
    return max !== void 0 ? Math.min(height, max) : height;
  }
  createStickyScrollNode(node, currentStickyNodesHeight, height, sourceNodeEnd, sourceNodePartiallyVisible, hasExplicitHeight) {
    const { startIndex, endIndex } = this.getNodeRange(node);
    const position2 = this.calculateStickyNodePosition(endIndex, currentStickyNodesHeight, height);
    return { node, position: position2, height, startIndex, endIndex, sourceNodeEnd, sourceNodePartiallyVisible, hasExplicitHeight };
  }
  getAncestorUnderPrevious(node, previousAncestor = void 0) {
    let currentAncestor = node;
    let parentOfcurrentAncestor = this.getParentNode(currentAncestor);
    while (parentOfcurrentAncestor) {
      if (parentOfcurrentAncestor === previousAncestor) {
        return currentAncestor;
      }
      currentAncestor = parentOfcurrentAncestor;
      parentOfcurrentAncestor = this.getParentNode(currentAncestor);
    }
    if (previousAncestor === void 0) {
      return currentAncestor;
    }
    return void 0;
  }
  calculateStickyNodePosition(lastDescendantIndex, stickyRowPositionTop, stickyNodeHeight) {
    const lastChildHeight = this.view.getElementHeight(lastDescendantIndex);
    const bottomOfLastChild = this.view.getElementTop(lastDescendantIndex) + lastChildHeight - this.view.scrollTop;
    if (stickyRowPositionTop + stickyNodeHeight > bottomOfLastChild && stickyRowPositionTop <= bottomOfLastChild) {
      return bottomOfLastChild - stickyNodeHeight;
    }
    return stickyRowPositionTop;
  }
  constrainStickyNodes(stickyNodes) {
    if (stickyNodes.length === 0) {
      return [];
    }
    const maximumStickyWidgetHeight = this.view.renderHeight * this.maxWidgetViewRatio;
    const lastStickyNode = stickyNodes[stickyNodes.length - 1];
    if (stickyNodes.length <= this.stickyScrollMaxItemCount && lastStickyNode.position + lastStickyNode.height <= maximumStickyWidgetHeight) {
      return stickyNodes;
    }
    const constrainedStickyNodes = this.stickyScrollDelegate.constrainStickyScrollNodes(stickyNodes, this.stickyScrollMaxItemCount, maximumStickyWidgetHeight);
    if (!constrainedStickyNodes.length) {
      return [];
    }
    const lastConstrainedStickyNode = constrainedStickyNodes[constrainedStickyNodes.length - 1];
    if (constrainedStickyNodes.length > this.stickyScrollMaxItemCount || lastConstrainedStickyNode.position + lastConstrainedStickyNode.height > maximumStickyWidgetHeight) {
      throw new Error("stickyScrollDelegate violates constraints");
    }
    return constrainedStickyNodes;
  }
  getParentNode(node) {
    const nodeLocation = this.model.getNodeLocation(node);
    const parentLocation = this.model.getParentNodeLocation(nodeLocation);
    return parentLocation ? this.model.getNode(parentLocation) : void 0;
  }
  nodeIsUncollapsedParent(node) {
    const nodeLocation = this.model.getNodeLocation(node);
    return this.model.getListRenderCount(nodeLocation) > 1;
  }
  getNodeIndex(node) {
    const nodeLocation = this.model.getNodeLocation(node);
    const nodeIndex = this.model.getListIndex(nodeLocation);
    return nodeIndex;
  }
  getNodeRange(node) {
    const nodeLocation = this.model.getNodeLocation(node);
    const startIndex = this.model.getListIndex(nodeLocation);
    if (startIndex < 0) {
      throw new Error("Node not found in tree");
    }
    const renderCount = this.model.getListRenderCount(nodeLocation);
    const endIndex = startIndex + renderCount - 1;
    return { startIndex, endIndex };
  }
  nodePositionTopBelowWidget(node) {
    const ancestors = [];
    let currentAncestor = this.getParentNode(node);
    while (currentAncestor) {
      ancestors.push(currentAncestor);
      currentAncestor = this.getParentNode(currentAncestor);
    }
    let widgetHeight = 0;
    for (let i2 = 0; i2 < ancestors.length && i2 < this.stickyScrollMaxItemCount; i2++) {
      const sourceRange = this.getStickyScrollNodeSourceRange(ancestors[i2]);
      if (sourceRange) {
        widgetHeight += this.getStickyScrollNodeHeight(sourceRange, widgetHeight);
      }
    }
    return widgetHeight;
  }
  getFocus() {
    return this._widget.getFocus();
  }
  domFocus() {
    this._widget.domFocus();
  }
  // Whether sticky scroll was the last focused part in the tree or not
  focusedLast() {
    return this._widget.focusedLast();
  }
  updateOptions(optionsUpdate = {}) {
    if (optionsUpdate.paddingTop !== void 0) {
      this.paddingTop = optionsUpdate.paddingTop;
    }
    if (optionsUpdate.stickyScrollMaxItemCount !== void 0) {
      const validatedOptions = this.validateStickySettings(optionsUpdate);
      if (this.stickyScrollMaxItemCount !== validatedOptions.stickyScrollMaxItemCount) {
        this.stickyScrollMaxItemCount = validatedOptions.stickyScrollMaxItemCount;
        this.update();
      }
    }
  }
  refresh() {
    this.update();
  }
  rerender() {
    this._widget.rerender();
    this.update();
  }
  validateStickySettings(options3) {
    let stickyScrollMaxItemCount = 7;
    if (typeof options3.stickyScrollMaxItemCount === "number") {
      stickyScrollMaxItemCount = Math.max(options3.stickyScrollMaxItemCount, 1);
    }
    return { stickyScrollMaxItemCount };
  }
};

var StickyScrollWidget = class {
  constructor(container2, view, tree, treeRenderers, treeDelegate, accessibilityProvider) {
    this.view = view;
    this.tree = tree;
    this.treeRenderers = treeRenderers;
    this.treeDelegate = treeDelegate;
    this.accessibilityProvider = accessibilityProvider;
    this._previousElements = [];
    this._previousElementHeights = [];
    this._previousStateDisposables = new DisposableStore();
    this._onDidChangeHeight = new Emitter();
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._rootDomNode = $(".monaco-tree-sticky-container.empty");
    container2.appendChild(this._rootDomNode);
    const shadow = $(".monaco-tree-sticky-container-shadow");
    this._rootDomNode.appendChild(shadow);
    this.stickyScrollFocus = new StickyScrollFocus(this._rootDomNode, view);
    this.onDidChangeHasFocus = this.stickyScrollFocus.onDidChangeHasFocus;
    this.onContextMenu = this.stickyScrollFocus.onContextMenu;
  }
  get state() {
    return this._previousState;
  }
  get height() {
    if (!this._previousState) {
      return 0;
    }
    return this.getRootHeight(this._previousState);
  }
  get count() {
    return this._previousState?.count ?? 0;
  }
  getNode(node) {
    return this._previousState?.stickyNodes.find((stickyNode) => stickyNode.node === node);
  }
  setState(state) {
    const wasVisible = !!this._previousState && this._previousState.count > 0;
    const isVisible = !!state && state.count > 0;
    if (!wasVisible && !isVisible || wasVisible && isVisible && this._previousState.equal(state)) {
      this.updateSourceNodeVisibility(state);
      return;
    }
    if (wasVisible !== isVisible) {
      this.setVisible(isVisible);
    }
    if (!isVisible) {
      this.updateSourceNodeVisibility(void 0);
      this._previousState = void 0;
      this._previousElements = [];
      this._previousElementHeights = [];
      this._previousStateDisposables.clear();
      return;
    }
    const lastStickyNode = state.stickyNodes[state.count - 1];
    if (this._previousState && state.animationStateChanged(this._previousState)) {
      this._previousElements[this._previousState.count - 1].style.top = `${lastStickyNode.position}px`;
    } else {
      this.renderState(state);
    }
    this._previousState = state;
    this.updateSourceNodeVisibility(state);
    this.updateRootHeight(state);
  }
  updateSourceNodeVisibility(state) {
    let sourceNodePartiallyVisible = false;
    for (let i2 = 0; state && i2 < state.count; i2++) {
      const stickyNode = state.stickyNodes[i2];
      const stickyElement = this._previousElements[i2];
      let nodePartiallyVisible = stickyNode.sourceNodePartiallyVisible;
      if (stickyElement) {
        const sourceNodeBottom = this.view.getElementTop(stickyNode.startIndex) + stickyNode.sourceNodeEnd;
        const stickyElementHeight = this.getRenderedNodeHeight(stickyNode, i2);
        const stickyNodeBottom = this.view.scrollTop + stickyNode.position + stickyElementHeight;
        nodePartiallyVisible = stickyNodeBottom < sourceNodeBottom;
      }
      stickyElement?.classList.toggle("source-node-partially-visible", nodePartiallyVisible);
      sourceNodePartiallyVisible ||= nodePartiallyVisible;
    }
    this._rootDomNode.classList.toggle("source-node-partially-visible", sourceNodePartiallyVisible);
  }
  renderState(state) {
    this._previousStateDisposables.clear();
    const elements = Array(state.count);
    for (let stickyIndex = state.count - 1; stickyIndex >= 0; stickyIndex--) {
      const stickyNode = state.stickyNodes[stickyIndex];
      const { element, disposable } = this.createElement(stickyNode, stickyIndex, state.count);
      elements[stickyIndex] = element;
      this._rootDomNode.appendChild(element);
      this._previousStateDisposables.add(disposable);
    }
    this.stickyScrollFocus.updateElements(elements, state);
    this._previousElements = elements;
    this._previousElementHeights = this.probeDynamicHeights(state, elements);
  }
  rerender() {
    if (this._previousState) {
      this.renderState(this._previousState);
      this.updateSourceNodeVisibility(this._previousState);
      this.updateRootHeight(this._previousState);
    }
  }
  updateRootHeight(state) {
    this._rootDomNode.style.height = `${this.getRootHeight(state)}px`;
  }
  getRootHeight(state) {
    const lastStickyNode = state.stickyNodes[state.count - 1];
    const lastStickyElementHeight = this.getRenderedNodeHeight(lastStickyNode, state.count - 1);
    return Math.max(0, lastStickyNode.position + lastStickyElementHeight);
  }
  getRenderedNodeHeight(stickyNode, index2) {
    return Math.min(this._previousElementHeights[index2] ?? stickyNode.height, stickyNode.height);
  }
  probeDynamicHeights(state, elements) {
    const heightChanges = [];
    const elementHeights = state.stickyNodes.map((node) => node.height);
    for (let i2 = 0; i2 < state.count; i2++) {
      const stickyNode = state.stickyNodes[i2];
      if (!this.treeDelegate.hasDynamicHeight || !this.treeDelegate.hasDynamicHeight(stickyNode.node)) {
        const measuredHeight2 = elements[i2].offsetHeight;
        if (measuredHeight2 > 0) {
          elementHeights[i2] = measuredHeight2;
        }
        continue;
      }
      const element = elements[i2];
      const previousHeight = element.style.height;
      element.style.height = "";
      const measuredHeight = element.offsetHeight;
      if (measuredHeight <= 0) {
        element.style.height = previousHeight;
        continue;
      }
      const maxNodeHeight = this.tree.options.stickyScrollMaxNodeHeight;
      const clampedMeasuredHeight = maxNodeHeight !== void 0 ? Math.min(measuredHeight, maxNodeHeight) : measuredHeight;
      const renderedHeight = stickyNode.hasExplicitHeight ? stickyNode.height : clampedMeasuredHeight;
      elementHeights[i2] = renderedHeight;
      if (this.tree.options.setRowHeight !== false) {
        element.style.height = `${renderedHeight}px`;
      }
      if (this.tree.options.setRowLineHeight !== false) {
        element.style.lineHeight = `${renderedHeight}px`;
      }
      if (!stickyNode.hasExplicitHeight && clampedMeasuredHeight > this.view.getElementHeight(stickyNode.startIndex)) {
        heightChanges.push({ index: stickyNode.startIndex, height: clampedMeasuredHeight });
      }
    }
    if (heightChanges.length > 0) {
      this._onDidChangeHeight.fire(heightChanges);
    }
    return elementHeights;
  }
  createElement(stickyNode, stickyIndex, stickyNodesTotal) {
    const nodeIndex = stickyNode.startIndex;
    const stickyElement = document.createElement("div");
    stickyElement.style.top = `${stickyNode.position}px`;
    const maxNodeHeight = this.tree.options.stickyScrollMaxNodeHeight;
    const clampedHeight = maxNodeHeight !== void 0 ? Math.min(stickyNode.height, maxNodeHeight) : stickyNode.height;
    if (this.tree.options.setRowHeight !== false) {
      stickyElement.style.height = `${clampedHeight}px`;
    }
    if (this.tree.options.setRowLineHeight !== false) {
      stickyElement.style.lineHeight = `${clampedHeight}px`;
    }
    stickyElement.style.overflow = "hidden";
    stickyElement.classList.add("monaco-tree-sticky-row");
    stickyElement.classList.add("monaco-list-row");
    stickyElement.classList.toggle("source-node-partially-visible", stickyNode.sourceNodePartiallyVisible);
    stickyElement.setAttribute("data-index", `${nodeIndex}`);
    stickyElement.setAttribute("data-parity", nodeIndex % 2 === 0 ? "even" : "odd");
    stickyElement.setAttribute("id", this.view.getElementID(nodeIndex));
    const accessibilityDisposable = this.setAccessibilityAttributes(stickyElement, stickyNode.node.element, stickyIndex, stickyNodesTotal);
    const nodeTemplateId = this.treeDelegate.getTemplateId(stickyNode.node);
    const renderer = this.treeRenderers.find((renderer2) => renderer2.templateId === nodeTemplateId);
    if (!renderer) {
      throw new Error(`No renderer found for template id ${nodeTemplateId}`);
    }
    let nodeCopy = stickyNode.node;
    if (nodeCopy === this.tree.getNode(this.tree.getNodeLocation(stickyNode.node))) {
      nodeCopy = new Proxy(stickyNode.node, {});
    }
    const templateData = renderer.renderTemplate(stickyElement);
    renderer.renderElement(nodeCopy, stickyNode.startIndex, templateData, { height: stickyNode.height });
    const disposable = toDisposable(() => {
      accessibilityDisposable.dispose();
      renderer.disposeElement(nodeCopy, stickyNode.startIndex, templateData, { height: stickyNode.height });
      renderer.disposeTemplate(templateData);
      stickyElement.remove();
    });
    return { element: stickyElement, disposable };
  }
  setAccessibilityAttributes(container2, element, stickyIndex, stickyNodesTotal) {
    if (!this.accessibilityProvider) {
      return Disposable.None;
    }
    if (this.accessibilityProvider.getSetSize) {
      container2.setAttribute("aria-setsize", String(this.accessibilityProvider.getSetSize(element, stickyIndex, stickyNodesTotal)));
    }
    if (this.accessibilityProvider.getPosInSet) {
      container2.setAttribute("aria-posinset", String(this.accessibilityProvider.getPosInSet(element, stickyIndex)));
    }
    if (this.accessibilityProvider.getRole) {
      container2.setAttribute("role", this.accessibilityProvider.getRole(element) ?? "treeitem");
    }
    const ariaLabel = this.accessibilityProvider.getAriaLabel(element);
    const observable = ariaLabel && typeof ariaLabel !== "string" ? ariaLabel : constObservable(ariaLabel);
    const result = autorun((reader) => {
      const value2 = reader.readObservable(observable);
      if (value2) {
        container2.setAttribute("aria-label", value2);
      } else {
        container2.removeAttribute("aria-label");
      }
    });
    if (typeof ariaLabel === "string") {
    } else if (ariaLabel) {
      container2.setAttribute("aria-label", ariaLabel.get());
    }
    const ariaLevel = this.accessibilityProvider.getAriaLevel && this.accessibilityProvider.getAriaLevel(element);
    if (typeof ariaLevel === "number") {
      container2.setAttribute("aria-level", `${ariaLevel}`);
    }
    return result;
  }
  setVisible(visible) {
    this._rootDomNode.classList.toggle("empty", !visible);
    if (!visible) {
      this.stickyScrollFocus.updateElements([], void 0);
    }
  }
  getFocus() {
    return this.stickyScrollFocus.getFocus();
  }
  domFocus() {
    this.stickyScrollFocus.domFocus();
  }
  focusedLast() {
    return this.stickyScrollFocus.focusedLast();
  }
  dispose() {
    this._onDidChangeHeight.dispose();
    this.stickyScrollFocus.dispose();
    this._previousStateDisposables.dispose();
    this._rootDomNode.remove();
  }
};

var StickyScrollFocus = class extends Disposable {
  constructor(container2, view) {
    super();
    this.container = container2;
    this.view = view;
    this.focusedIndex = -1;
    this.elements = [];
    this._onDidChangeHasFocus = this._register(new Emitter());
    this.onDidChangeHasFocus = this._onDidChangeHasFocus.event;
    this._onContextMenu = this._register(new Emitter());
    this.onContextMenu = this._onContextMenu.event;
    this._domHasFocus = false;
    this._register(addDisposableListener(this.container, "focus", () => this.onFocus()));
    this._register(addDisposableListener(this.container, "blur", () => this.onBlur()));
    this._register(this.view.onDidFocus(() => this.toggleStickyScrollFocused(false)));
    this._register(this.view.onKeyDown((e4) => this.onKeyDown(e4)));
    this._register(this.view.onMouseDown((e4) => this.onMouseDown(e4)));
    this._register(this.view.onContextMenu((e4) => this.handleContextMenu(e4)));
  }
  get domHasFocus() {
    return this._domHasFocus;
  }
  set domHasFocus(hasFocus) {
    if (hasFocus !== this._domHasFocus) {
      this._onDidChangeHasFocus.fire(hasFocus);
      this._domHasFocus = hasFocus;
    }
  }
  handleContextMenu(e4) {
    const target = e4.browserEvent.target;
    if (!isStickyScrollContainer(target) && !isStickyScrollElement(target)) {
      if (this.focusedLast()) {
        this.view.domFocus();
      }
      return;
    }
    if (!isKeyboardEvent(e4.browserEvent)) {
      if (!this.state) {
        throw new Error("Context menu should not be triggered when state is undefined");
      }
      const stickyIndex = this.state.stickyNodes.findIndex((stickyNode2) => stickyNode2.node.element === e4.element?.element);
      if (stickyIndex === -1) {
        throw new Error("Context menu should not be triggered when element is not in sticky scroll widget");
      }
      this.container.focus();
      this.setFocus(stickyIndex);
      return;
    }
    if (!this.state || this.focusedIndex < 0) {
      throw new Error("Context menu key should not be triggered when focus is not in sticky scroll widget");
    }
    const stickyNode = this.state.stickyNodes[this.focusedIndex];
    const element = stickyNode.node.element;
    const anchor = this.elements[this.focusedIndex];
    this._onContextMenu.fire({ element, anchor, browserEvent: e4.browserEvent, isStickyScroll: true });
  }
  onKeyDown(e4) {
    if (this.domHasFocus && this.state) {
      if (e4.key === "ArrowUp") {
        this.setFocusedElement(Math.max(0, this.focusedIndex - 1));
        e4.preventDefault();
        e4.stopPropagation();
      } else if (e4.key === "ArrowDown" || e4.key === "ArrowRight") {
        if (this.focusedIndex >= this.state.count - 1) {
          const nodeIndexToFocus = this.state.stickyNodes[this.state.count - 1].startIndex + 1;
          this.view.domFocus();
          this.view.setFocus([nodeIndexToFocus]);
          this.scrollNodeUnderWidget(nodeIndexToFocus, this.state);
        } else {
          this.setFocusedElement(this.focusedIndex + 1);
        }
        e4.preventDefault();
        e4.stopPropagation();
      }
    }
  }
  onMouseDown(e4) {
    const target = e4.browserEvent.target;
    if (!isStickyScrollContainer(target) && !isStickyScrollElement(target)) {
      return;
    }
    e4.browserEvent.preventDefault();
    e4.browserEvent.stopPropagation();
  }
  updateElements(elements, state) {
    if (state && state.count === 0) {
      throw new Error("Sticky scroll state must be undefined when there are no sticky nodes");
    }
    if (state && state.count !== elements.length) {
      throw new Error("Sticky scroll focus received illigel state");
    }
    const previousIndex = this.focusedIndex;
    this.removeFocus();
    this.elements = elements;
    this.state = state;
    if (state) {
      const newFocusedIndex = clamp(previousIndex, 0, state.count - 1);
      this.setFocus(newFocusedIndex);
    } else {
      if (this.domHasFocus) {
        this.view.domFocus();
      }
    }
    this.container.tabIndex = state ? 0 : -1;
  }
  setFocusedElement(stickyIndex) {
    const state = this.state;
    if (!state) {
      throw new Error("Cannot set focus when state is undefined");
    }
    this.setFocus(stickyIndex);
    if (stickyIndex < state.count - 1) {
      return;
    }
    if (state.lastNodePartiallyVisible()) {
      const lastStickyNode = state.stickyNodes[stickyIndex];
      this.scrollNodeUnderWidget(lastStickyNode.endIndex + 1, state);
    }
  }
  scrollNodeUnderWidget(nodeIndex, state) {
    const lastStickyNode = state.stickyNodes[state.count - 1];
    const secondLastStickyNode = state.count > 1 ? state.stickyNodes[state.count - 2] : void 0;
    const elementScrollTop = this.view.getElementTop(nodeIndex);
    const elementTargetViewTop = secondLastStickyNode ? secondLastStickyNode.position + secondLastStickyNode.height + lastStickyNode.height : lastStickyNode.height;
    this.view.scrollTop = elementScrollTop - elementTargetViewTop;
  }
  getFocus() {
    if (!this.state || this.focusedIndex === -1) {
      return void 0;
    }
    return this.state.stickyNodes[this.focusedIndex].node.element;
  }
  domFocus() {
    if (!this.state) {
      throw new Error("Cannot focus when state is undefined");
    }
    this.container.focus();
  }
  focusedLast() {
    if (!this.state) {
      return false;
    }
    return this.view.getHTMLElement().classList.contains("sticky-scroll-focused");
  }
  removeFocus() {
    if (this.focusedIndex === -1) {
      return;
    }
    this.toggleElementFocus(this.elements[this.focusedIndex], false);
    this.focusedIndex = -1;
  }
  setFocus(newFocusIndex) {
    if (0 > newFocusIndex) {
      throw new Error("addFocus() can not remove focus");
    }
    if (!this.state && newFocusIndex >= 0) {
      throw new Error("Cannot set focus index when state is undefined");
    }
    if (this.state && newFocusIndex >= this.state.count) {
      throw new Error("Cannot set focus index to an index that does not exist");
    }
    const oldIndex = this.focusedIndex;
    if (oldIndex >= 0) {
      this.toggleElementFocus(this.elements[oldIndex], false);
    }
    if (newFocusIndex >= 0) {
      this.toggleElementFocus(this.elements[newFocusIndex], true);
    }
    this.focusedIndex = newFocusIndex;
  }
  toggleElementFocus(element, focused) {
    this.toggleElementActiveFocus(element, focused && this.domHasFocus);
    this.toggleElementPassiveFocus(element, focused);
  }
  toggleCurrentElementActiveFocus(focused) {
    if (this.focusedIndex === -1) {
      return;
    }
    this.toggleElementActiveFocus(this.elements[this.focusedIndex], focused);
  }
  toggleElementActiveFocus(element, focused) {
    element.classList.toggle("focused", focused);
  }
  toggleElementPassiveFocus(element, focused) {
    element.classList.toggle("passive-focused", focused);
  }
  toggleStickyScrollFocused(focused) {
    this.view.getHTMLElement().classList.toggle("sticky-scroll-focused", focused);
  }
  onFocus() {
    if (!this.state || this.elements.length === 0) {
      throw new Error("Cannot focus when state is undefined or elements are empty");
    }
    this.domHasFocus = true;
    this.toggleStickyScrollFocused(true);
    this.toggleCurrentElementActiveFocus(true);
    if (this.focusedIndex === -1) {
      this.setFocus(0);
    }
  }
  onBlur() {
    this.domHasFocus = false;
    this.toggleCurrentElementActiveFocus(false);
  }
  dispose() {
    this.toggleStickyScrollFocused(false);
    this._onDidChangeHasFocus.fire(false);
    super.dispose();
  }
};

function asTreeMouseEvent(event) {
  let target = 0 /* Unknown */;
  if (hasParentWithClass(event.browserEvent.target, "monaco-tl-twistie", "monaco-tl-row")) {
    target = 1 /* Twistie */;
  } else if (hasParentWithClass(event.browserEvent.target, "monaco-tl-contents", "monaco-tl-row")) {
    target = 2 /* Element */;
  } else if (hasParentWithClass(event.browserEvent.target, "monaco-tree-type-filter", "monaco-list")) {
    target = 3 /* Filter */;
  }
  return {
    browserEvent: event.browserEvent,
    element: event.element ? event.element.element : null,
    target
  };
}

function asTreeContextMenuEvent(event) {
  const isStickyScroll = isStickyScrollContainer(event.browserEvent.target);
  return {
    element: event.element ? event.element.element : null,
    browserEvent: event.browserEvent,
    anchor: event.anchor,
    isStickyScroll
  };
}

function dfs(node, fn) {
  fn(node);
  node.children.forEach((child) => dfs(child, fn));
}

var Trait2 = class {
  constructor(getFirstViewElementWithTrait, identityProvider3) {
    this.getFirstViewElementWithTrait = getFirstViewElementWithTrait;
    this.identityProvider = identityProvider3;
    this.nodes = [];
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  get nodeSet() {
    if (!this._nodeSet) {
      this._nodeSet = this.createNodeSet();
    }
    return this._nodeSet;
  }
  set(nodes, browserEvent) {
    const event = browserEvent;
    if (!event?.__forceEvent && equals(this.nodes, nodes)) {
      return;
    }
    this._set(nodes, false, browserEvent);
  }
  _set(nodes, silent, browserEvent) {
    this.nodes = [...nodes];
    this.elements = void 0;
    this._nodeSet = void 0;
    if (!silent) {
      const that = this;
      this._onDidChange.fire({ get elements() {
        return that.get();
      }, browserEvent });
    }
  }
  get() {
    if (!this.elements) {
      this.elements = this.nodes.map((node) => node.element);
    }
    return [...this.elements];
  }
  getNodes() {
    return this.nodes;
  }
  has(node) {
    return this.nodeSet.has(node);
  }
  onDidModelSplice({ insertedNodes, deletedNodes }) {
    if (!this.identityProvider) {
      const set = this.createNodeSet();
      const visit2 = (node) => set.delete(node);
      deletedNodes.forEach((node) => dfs(node, visit2));
      this.set([...set.values()]);
      return;
    }
    const deletedNodesIdSet = /* @__PURE__ */ new Set();
    const deletedNodesVisitor = (node) => deletedNodesIdSet.add(this.identityProvider.getId(node.element).toString());
    deletedNodes.forEach((node) => dfs(node, deletedNodesVisitor));
    const insertedNodesMap = /* @__PURE__ */ new Map();
    const insertedNodesVisitor = (node) => insertedNodesMap.set(this.identityProvider.getId(node.element).toString(), node);
    insertedNodes.forEach((node) => dfs(node, insertedNodesVisitor));
    const nodes = [];
    for (const node of this.nodes) {
      const id2 = this.identityProvider.getId(node.element).toString();
      const wasDeleted = deletedNodesIdSet.has(id2);
      if (!wasDeleted) {
        nodes.push(node);
      } else {
        const insertedNode = insertedNodesMap.get(id2);
        if (insertedNode && insertedNode.visible) {
          nodes.push(insertedNode);
        }
      }
    }
    if (this.nodes.length > 0 && nodes.length === 0) {
      const node = this.getFirstViewElementWithTrait();
      if (node) {
        nodes.push(node);
      }
    }
    this._set(nodes, true);
  }
  createNodeSet() {
    const set = /* @__PURE__ */ new Set();
    for (const node of this.nodes) {
      set.add(node);
    }
    return set;
  }
};

var TreeNodeListMouseController = class extends MouseController {
  constructor(list2, tree, stickyScrollProvider) {
    super(list2);
    this.tree = tree;
    this.stickyScrollProvider = stickyScrollProvider;
  }
  onViewPointer(e4) {
    if (isButton(e4.browserEvent.target) || isEditableElement(e4.browserEvent.target) || isMonacoEditor(e4.browserEvent.target)) {
      return;
    }
    if (e4.browserEvent.isHandledByList) {
      return;
    }
    const node = e4.element;
    if (!node) {
      return super.onViewPointer(e4);
    }
    if (this.isSelectionRangeChangeEvent(e4) || this.isSelectionSingleChangeEvent(e4)) {
      return super.onViewPointer(e4);
    }
    const target = e4.browserEvent.target;
    const onTwistie = target.classList.contains("monaco-tl-twistie") || target.classList.contains("monaco-icon-label") && target.classList.contains("folder-icon") && e4.browserEvent.offsetX < 16;
    const isStickyElement = isStickyScrollElement(e4.browserEvent.target);
    let expandOnlyOnTwistieClick = false;
    if (isStickyElement) {
      expandOnlyOnTwistieClick = true;
    } else if (typeof this.tree.expandOnlyOnTwistieClick === "function") {
      expandOnlyOnTwistieClick = this.tree.expandOnlyOnTwistieClick(node.element);
    } else {
      expandOnlyOnTwistieClick = !!this.tree.expandOnlyOnTwistieClick;
    }
    if (!isStickyElement) {
      if (expandOnlyOnTwistieClick && !onTwistie && e4.browserEvent.detail !== 2) {
        return super.onViewPointer(e4);
      }
      if (!this.tree.expandOnDoubleClick && e4.browserEvent.detail === 2) {
        return super.onViewPointer(e4);
      }
    } else {
      this.handleStickyScrollMouseEvent(e4, node);
    }
    if (node.collapsible && (!isStickyElement || onTwistie)) {
      const location2 = this.tree.getNodeLocation(node);
      const recursive = e4.browserEvent.altKey;
      this.tree.setFocus([location2]);
      this.tree.toggleCollapsed(location2, recursive);
      if (onTwistie) {
        e4.browserEvent.isHandledByList = true;
        return;
      }
    }
    if (!isStickyElement) {
      super.onViewPointer(e4);
    }
  }
  handleStickyScrollMouseEvent(e4, node) {
    if (isMonacoCustomToggle(e4.browserEvent.target) || isActionItem(e4.browserEvent.target)) {
      return;
    }
    const stickyScrollController = this.stickyScrollProvider();
    if (!stickyScrollController) {
      throw new Error("Sticky scroll controller not found");
    }
    const nodeIndex = this.list.indexOf(node);
    const elementScrollTop = this.list.getElementTop(nodeIndex);
    const elementTargetViewTop = stickyScrollController.nodePositionTopBelowWidget(node);
    this.tree.scrollTop = elementScrollTop - elementTargetViewTop;
    this.list.domFocus();
    this.list.setFocus([nodeIndex]);
    this.list.setSelection([nodeIndex]);
  }
  onDoubleClick(e4) {
    const onTwistie = e4.browserEvent.target.classList.contains("monaco-tl-twistie");
    if (onTwistie || !this.tree.expandOnDoubleClick) {
      return;
    }
    if (e4.browserEvent.isHandledByList) {
      return;
    }
    super.onDoubleClick(e4);
  }
  // to make sure dom focus is not stolen (for example with context menu)
  onMouseDown(e4) {
    const target = e4.browserEvent.target;
    if (!isStickyScrollContainer(target) && !isStickyScrollElement(target)) {
      super.onMouseDown(e4);
      return;
    }
  }
  onContextMenu(e4) {
    const target = e4.browserEvent.target;
    if (!isStickyScrollContainer(target) && !isStickyScrollElement(target)) {
      super.onContextMenu(e4);
      return;
    }
  }
};

var TreeNodeList = class extends List {
  constructor(user, container2, virtualDelegate, renderers, focusTrait, selectionTrait, anchorTrait, options3) {
    super(user, container2, virtualDelegate, renderers, options3);
    this.focusTrait = focusTrait;
    this.selectionTrait = selectionTrait;
    this.anchorTrait = anchorTrait;
  }
  createMouseController(options3) {
    return new TreeNodeListMouseController(this, options3.tree, options3.stickyScrollProvider);
  }
  splice(start, deleteCount, elements = []) {
    super.splice(start, deleteCount, elements);
    if (elements.length === 0) {
      return;
    }
    const additionalFocus = [];
    const additionalSelection = [];
    let anchor;
    elements.forEach((node, index2) => {
      if (this.focusTrait.has(node)) {
        additionalFocus.push(start + index2);
      }
      if (this.selectionTrait.has(node)) {
        additionalSelection.push(start + index2);
      }
      if (this.anchorTrait.has(node)) {
        anchor = start + index2;
      }
    });
    if (additionalFocus.length > 0) {
      super.setFocus(distinct([...super.getFocus(), ...additionalFocus]));
    }
    if (additionalSelection.length > 0) {
      super.setSelection(distinct([...super.getSelection(), ...additionalSelection]));
    }
    if (typeof anchor === "number") {
      super.setAnchor(anchor);
    }
  }
  setFocus(indexes, browserEvent, fromAPI = false) {
    super.setFocus(indexes, browserEvent);
    if (!fromAPI) {
      this.focusTrait.set(indexes.map((i2) => this.element(i2)), browserEvent);
    }
  }
  setSelection(indexes, browserEvent, fromAPI = false) {
    super.setSelection(indexes, browserEvent);
    if (!fromAPI) {
      this.selectionTrait.set(indexes.map((i2) => this.element(i2)), browserEvent);
    }
  }
  setAnchor(index2, fromAPI = false) {
    super.setAnchor(index2);
    if (!fromAPI) {
      if (typeof index2 === "undefined") {
        this.anchorTrait.set([]);
      } else {
        this.anchorTrait.set([this.element(index2)]);
      }
    }
  }
};

var AbstractTree = class {
  constructor(_user, container2, delegate, renderers, _options = {}) {
    this._user = _user;
    this._options = _options;
    this.eventBufferer = new EventBufferer();
    this.onDidChangeFindOpenState = Event2.None;
    this.onDidChangeStickyScrollFocused = Event2.None;
    this.disposables = new DisposableStore();
    this.onDidSwapModel = this.disposables.add(new Emitter());
    this.onDidChangeModelRelay = this.disposables.add(new Relay());
    this.onDidSpliceModelRelay = this.disposables.add(new Relay());
    this.onDidChangeCollapseStateRelay = this.disposables.add(new Relay());
    this.onDidChangeRenderNodeCountRelay = this.disposables.add(new Relay());
    this.onDidChangeActiveNodesRelay = this.disposables.add(new Relay());
    this._onWillRefilter = new Emitter();
    this.onWillRefilter = this._onWillRefilter.event;
    this._onDidUpdateOptions = new Emitter();
    this.onDidUpdateOptions = this._onDidUpdateOptions.event;
    this.modelDisposables = new DisposableStore();
    if (_options.keyboardNavigationLabelProvider && (_options.findWidgetEnabled ?? true)) {
      this.findFilter = new FindFilter(_options.keyboardNavigationLabelProvider, _options.filter, _options.defaultFindVisibility);
      _options = { ..._options, filter: this.findFilter };
      this.disposables.add(this.findFilter);
    }
    this.model = this.createModel(_user, _options);
    this.treeDelegate = new ComposedTreeDelegate(delegate);
    const activeNodes = this.disposables.add(new EventCollection(this.onDidChangeActiveNodesRelay.event));
    const renderedIndentGuides = new SetMap();
    this.renderers = renderers.map((r2) => new TreeRenderer(r2, this.model, this.onDidChangeCollapseStateRelay.event, activeNodes, renderedIndentGuides, _options));
    for (const r2 of this.renderers) {
      this.disposables.add(r2);
    }
    this.focus = new Trait2(() => this.view.getFocusedElements()[0], _options.identityProvider);
    this.selection = new Trait2(() => this.view.getSelectedElements()[0], _options.identityProvider);
    this.anchor = new Trait2(() => this.view.getAnchorElement(), _options.identityProvider);
    this.view = new TreeNodeList(_user, container2, this.treeDelegate, this.renderers, this.focus, this.selection, this.anchor, { ...asListOptions(() => this.model, this.disposables, _options), tree: this, stickyScrollProvider: () => this.stickyScrollController });
    this.setupModel(this.model);
    if (_options.keyboardSupport !== false) {
      const onKeyDown = Event2.chain(
        this.view.onKeyDown,
        ($129) => $129.filter((e4) => !isEditableElement(e4.target)).map((e4) => new StandardKeyboardEvent(e4))
      );
      Event2.chain(onKeyDown, ($129) => $129.filter((e4) => e4.keyCode === 15 /* LeftArrow */))(this.onLeftArrow, this, this.disposables);
      Event2.chain(onKeyDown, ($129) => $129.filter((e4) => e4.keyCode === 17 /* RightArrow */))(this.onRightArrow, this, this.disposables);
      Event2.chain(onKeyDown, ($129) => $129.filter((e4) => e4.keyCode === 10 /* Space */))(this.onSpace, this, this.disposables);
    }
    if ((_options.findWidgetEnabled ?? true) && _options.keyboardNavigationLabelProvider && _options.contextViewProvider) {
      const findOptions = {
        styles: _options.findWidgetStyles,
        defaultFindMode: _options.defaultFindMode,
        defaultFindMatchType: _options.defaultFindMatchType,
        showNotFoundMessage: _options.showNotFoundMessage,
        findWidgetContainer: _options.findWidgetContainer
      };
      this.findController = this.disposables.add(new FindController(this, this.findFilter, _options.contextViewProvider, findOptions));
      this.focusNavigationFilter = (node) => this.findController.shouldAllowFocus(node);
      this.onDidChangeFindOpenState = this.findController.onDidChangeOpenState;
      this.onDidChangeFindMode = this.findController.onDidChangeMode;
      this.onDidChangeFindMatchType = this.findController.onDidChangeMatchType;
    } else {
      this.onDidChangeFindMode = Event2.None;
      this.onDidChangeFindMatchType = Event2.None;
    }
    if (_options.enableStickyScroll) {
      this.stickyScrollController = new StickyScrollController(this, this.model, this.view, this.renderers, this.treeDelegate, _options);
      this.onDidChangeStickyScrollFocused = this.stickyScrollController.onDidChangeHasFocus;
    }
    this.styleElement = createStyleSheet(this.view.getHTMLElement());
    this.getHTMLElement().classList.toggle("always", this._options.renderIndentGuides === "always" /* Always */);
  }
  get onDidScroll() {
    return this.view.onDidScroll;
  }
  get onDidChangeFocus() {
    return this.eventBufferer.wrapEvent(this.focus.onDidChange);
  }
  get onDidChangeSelection() {
    return this.eventBufferer.wrapEvent(this.selection.onDidChange);
  }
  get onMouseClick() {
    return Event2.map(this.view.onMouseClick, asTreeMouseEvent);
  }
  get onMouseDblClick() {
    return Event2.filter(Event2.map(this.view.onMouseDblClick, asTreeMouseEvent), (e4) => e4.target !== 3 /* Filter */);
  }
  get onMouseMiddleClick() {
    return Event2.filter(Event2.map(this.view.onMouseMiddleClick, asTreeMouseEvent), (e4) => e4.target !== 3 /* Filter */);
  }
  get onMouseOver() {
    return Event2.map(this.view.onMouseOver, asTreeMouseEvent);
  }
  get onMouseOut() {
    return Event2.map(this.view.onMouseOut, asTreeMouseEvent);
  }
  get onContextMenu() {
    return Event2.any(Event2.filter(Event2.map(this.view.onContextMenu, asTreeContextMenuEvent), (e4) => !e4.isStickyScroll), this.stickyScrollController?.onContextMenu ?? Event2.None);
  }
  get onTap() {
    return Event2.map(this.view.onTap, asTreeMouseEvent);
  }
  get onPointer() {
    return Event2.map(this.view.onPointer, asTreeMouseEvent);
  }
  get onKeyDown() {
    return this.view.onKeyDown;
  }
  get onKeyUp() {
    return this.view.onKeyUp;
  }
  get onKeyPress() {
    return this.view.onKeyPress;
  }
  get onDidFocus() {
    return this.view.onDidFocus;
  }
  get onDidBlur() {
    return this.view.onDidBlur;
  }
  get onDidChangeModel() {
    return Event2.any(this.onDidChangeModelRelay.event, this.onDidSwapModel.event);
  }
  get onDidChangeCollapseState() {
    return this.onDidChangeCollapseStateRelay.event;
  }
  get onDidChangeRenderNodeCount() {
    return this.onDidChangeRenderNodeCountRelay.event;
  }
  get findMode() {
    return this.findController?.mode ?? 0 /* Highlight */;
  }
  set findMode(findMode) {
    if (this.findController) {
      this.findController.mode = findMode;
    }
  }
  get findMatchType() {
    return this.findController?.matchType ?? 0 /* Fuzzy */;
  }
  set findMatchType(findFuzzy) {
    if (this.findController) {
      this.findController.matchType = findFuzzy;
    }
  }
  get onDidChangeFindPattern() {
    return this.findController ? this.findController.onDidChangePattern : Event2.None;
  }
  get expandOnDoubleClick() {
    return typeof this._options.expandOnDoubleClick === "undefined" ? true : this._options.expandOnDoubleClick;
  }
  get expandOnlyOnTwistieClick() {
    return typeof this._options.expandOnlyOnTwistieClick === "undefined" ? true : this._options.expandOnlyOnTwistieClick;
  }
  get onDidDispose() {
    return this.view.onDidDispose;
  }
  updateOptions(optionsUpdate = {}) {
    this._options = { ...this._options, ...optionsUpdate };
    for (const renderer of this.renderers) {
      renderer.updateOptions(optionsUpdate);
    }
    this.view.updateOptions(optionsUpdate);
    this.findController?.updateOptions(optionsUpdate);
    this.updateStickyScroll(optionsUpdate);
    this._onDidUpdateOptions.fire(this._options);
    this.getHTMLElement().classList.toggle("always", this._options.renderIndentGuides === "always" /* Always */);
  }
  get options() {
    return this._options;
  }
  updateStickyScroll(optionsUpdate) {
    if (!this.stickyScrollController && this._options.enableStickyScroll) {
      this.stickyScrollController = new StickyScrollController(this, this.model, this.view, this.renderers, this.treeDelegate, this._options);
      this.onDidChangeStickyScrollFocused = this.stickyScrollController.onDidChangeHasFocus;
    } else if (this.stickyScrollController && !this._options.enableStickyScroll) {
      this.onDidChangeStickyScrollFocused = Event2.None;
      this.stickyScrollController.dispose();
      this.stickyScrollController = void 0;
    }
    this.stickyScrollController?.updateOptions(optionsUpdate);
  }
  updateWidth(element) {
    const index2 = this.model.getListIndex(element);
    if (index2 === -1) {
      return;
    }
    this.view.updateWidth(index2);
  }
  // Widget
  getHTMLElement() {
    return this.view.getHTMLElement();
  }
  get contentHeight() {
    return this.view.contentHeight;
  }
  get contentWidth() {
    return this.view.contentWidth;
  }
  get onDidChangeContentHeight() {
    return this.view.onDidChangeContentHeight;
  }
  get onDidChangeContentWidth() {
    return this.view.onDidChangeContentWidth;
  }
  get scrollTop() {
    return this.view.scrollTop;
  }
  set scrollTop(scrollTop) {
    this.view.scrollTop = scrollTop;
  }
  get scrollLeft() {
    return this.view.scrollLeft;
  }
  set scrollLeft(scrollLeft) {
    this.view.scrollLeft = scrollLeft;
  }
  get scrollHeight() {
    return this.view.scrollHeight;
  }
  get renderHeight() {
    return this.view.renderHeight;
  }
  refreshStickyScroll() {
    this.stickyScrollController?.refresh();
  }
  rerenderStickyScroll() {
    this.stickyScrollController?.rerender();
  }
  get firstVisibleElement() {
    let index2 = this.view.firstVisibleIndex;
    if (this.stickyScrollController) {
      index2 += this.stickyScrollController.count;
    }
    if (index2 < 0 || index2 >= this.view.length) {
      return void 0;
    }
    const node = this.view.element(index2);
    return node.element;
  }
  get lastVisibleElement() {
    const index2 = this.view.lastVisibleIndex;
    const node = this.view.element(index2);
    return node.element;
  }
  get ariaLabel() {
    return this.view.ariaLabel;
  }
  set ariaLabel(value2) {
    this.view.ariaLabel = value2;
  }
  get selectionSize() {
    return this.selection.getNodes().length;
  }
  domFocus() {
    if (this.stickyScrollController?.focusedLast()) {
      this.stickyScrollController.domFocus();
    } else {
      this.view.domFocus();
    }
  }
  isDOMFocused() {
    return isActiveElement(this.getHTMLElement());
  }
  layout(height, width2) {
    this.view.layout(height, width2);
  }
  style(styles) {
    const suffix = `.${this.view.domId}`;
    const content = [];
    if (styles.treeIndentGuidesStroke) {
      content.push(`.monaco-list${suffix}:hover .monaco-tl-indent > .indent-guide, .monaco-list${suffix}.always .monaco-tl-indent > .indent-guide  { opacity: 1; border-color: ${styles.treeInactiveIndentGuidesStroke}; }`);
      content.push(`.monaco-list${suffix} .monaco-tl-indent > .indent-guide.active { opacity: 1; border-color: ${styles.treeIndentGuidesStroke}; }`);
    }
    const stickyScrollBackground = styles.treeStickyScrollBackground ?? styles.listBackground;
    if (stickyScrollBackground) {
      content.push(`.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container { background-color: ${stickyScrollBackground}; }`);
      content.push(`.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container .monaco-tree-sticky-row { background-color: ${stickyScrollBackground}; }`);
    }
    if (styles.treeStickyScrollBorder) {
      content.push(`.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container { border-bottom: 1px solid ${styles.treeStickyScrollBorder}; }`);
    }
    if (styles.treeStickyScrollShadow) {
      content.push(`.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container .monaco-tree-sticky-container-shadow { box-shadow: ${styles.treeStickyScrollShadow} 0 6px 6px -6px inset; height: 3px; }`);
    }
    if (styles.listFocusForeground) {
      content.push(`.monaco-list${suffix}.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
      content.push(`.monaco-list${suffix}:not(.sticky-scroll-focused) .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.focused { color: inherit; }`);
    }
    const focusAndSelectionOutline = asCssValueWithDefault(styles.listFocusAndSelectionOutline, asCssValueWithDefault(styles.listSelectionOutline, styles.listFocusOutline ?? ""));
    if (focusAndSelectionOutline) {
      content.push(`.monaco-list${suffix}.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container:focus .monaco-list-row.focused.selected { outline: 1px solid ${focusAndSelectionOutline}; outline-offset: -1px;}`);
      content.push(`.monaco-list${suffix}:not(.sticky-scroll-focused) .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.focused.selected { outline: inherit;}`);
    }
    if (styles.listFocusOutline) {
      content.push(`.monaco-list${suffix}.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`);
      content.push(`.monaco-list${suffix}:not(.sticky-scroll-focused) .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.focused { outline: inherit; }`);
      content.push(`.context-menu-visible .monaco-list${suffix}.last-focused.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.passive-focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`);
      content.push(`.context-menu-visible .monaco-list${suffix}.last-focused.sticky-scroll-focused .monaco-list-rows .monaco-list-row.focused { outline: inherit; }`);
      content.push(`.context-menu-visible .monaco-list${suffix}.last-focused:not(.sticky-scroll-focused) .monaco-tree-sticky-container .monaco-list-rows .monaco-list-row.focused { outline: inherit; }`);
    }
    this.styleElement.textContent = content.join("\n");
    this.view.style(styles);
  }
  // Tree navigation
  getParentElement(location2) {
    const parentRef = this.model.getParentNodeLocation(location2);
    const parentNode = this.model.getNode(parentRef);
    return parentNode.element;
  }
  getFirstElementChild(location2) {
    return this.model.getFirstElementChild(location2);
  }
  // Tree
  getNode(location2) {
    return this.model.getNode(location2);
  }
  getNodeLocation(node) {
    return this.model.getNodeLocation(node);
  }
  collapse(location2, recursive = false) {
    return this.model.setCollapsed(location2, true, recursive);
  }
  expand(location2, recursive = false) {
    return this.model.setCollapsed(location2, false, recursive);
  }
  toggleCollapsed(location2, recursive = false) {
    return this.model.setCollapsed(location2, void 0, recursive);
  }
  expandAll() {
    this.model.setCollapsed(this.model.rootRef, false, true);
  }
  collapseAll() {
    this.model.setCollapsed(this.model.rootRef, true, true);
  }
  isCollapsible(location2) {
    return this.model.isCollapsible(location2);
  }
  setCollapsible(location2, collapsible) {
    return this.model.setCollapsible(location2, collapsible);
  }
  isCollapsed(location2) {
    return this.model.isCollapsed(location2);
  }
  expandTo(location2) {
    this.model.expandTo(location2);
  }
  triggerTypeNavigation() {
    this.view.triggerTypeNavigation();
  }
  openFind() {
    this.findController?.open();
  }
  closeFind() {
    this.findController?.close();
  }
  refilter() {
    this._onWillRefilter.fire(void 0);
    this.model.refilter();
  }
  setAnchor(element) {
    if (typeof element === "undefined") {
      return this.view.setAnchor(void 0);
    }
    this.eventBufferer.bufferEvents(() => {
      const node = this.model.getNode(element);
      this.anchor.set([node]);
      const index2 = this.model.getListIndex(element);
      if (index2 > -1) {
        this.view.setAnchor(index2, true);
      }
    });
  }
  getAnchor() {
    return this.anchor.get().at(0);
  }
  setSelection(elements, browserEvent) {
    this.eventBufferer.bufferEvents(() => {
      const nodes = elements.map((e4) => this.model.getNode(e4));
      this.selection.set(nodes, browserEvent);
      const indexes = elements.map((e4) => this.model.getListIndex(e4)).filter((i2) => i2 > -1);
      this.view.setSelection(indexes, browserEvent, true);
    });
  }
  getSelection() {
    return this.selection.get();
  }
  setFocus(elements, browserEvent) {
    this.eventBufferer.bufferEvents(() => {
      const nodes = elements.map((e4) => this.model.getNode(e4));
      this.focus.set(nodes, browserEvent);
      const indexes = elements.map((e4) => this.model.getListIndex(e4)).filter((i2) => i2 > -1);
      this.view.setFocus(indexes, browserEvent, true);
    });
  }
  focusNext(n2 = 1, loop = false, browserEvent, filter2 = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    this.view.focusNext(n2, loop, browserEvent, filter2);
  }
  focusPrevious(n2 = 1, loop = false, browserEvent, filter2 = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    this.view.focusPrevious(n2, loop, browserEvent, filter2);
  }
  focusNextPage(browserEvent, filter2 = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    return this.view.focusNextPage(browserEvent, filter2);
  }
  focusPreviousPage(browserEvent, filter2 = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    return this.view.focusPreviousPage(browserEvent, filter2, () => this.stickyScrollController?.height ?? 0);
  }
  focusLast(browserEvent, filter2 = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    this.view.focusLast(browserEvent, filter2);
  }
  focusFirst(browserEvent, filter2 = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    this.view.focusFirst(browserEvent, filter2);
  }
  getFocus() {
    return this.focus.get();
  }
  getStickyScrollFocus() {
    const focus = this.stickyScrollController?.getFocus();
    return focus !== void 0 ? [focus] : [];
  }
  getFocusedPart() {
    return this.stickyScrollController?.focusedLast() ? 1 /* StickyScroll */ : 0 /* Tree */;
  }
  reveal(location2, relativeTop) {
    this.model.expandTo(location2);
    const index2 = this.model.getListIndex(location2);
    if (index2 === -1) {
      return;
    }
    if (!this.stickyScrollController) {
      this.view.reveal(index2, relativeTop);
    } else {
      const paddingTop = this.stickyScrollController.nodePositionTopBelowWidget(this.getNode(location2));
      this.view.reveal(index2, relativeTop, paddingTop);
    }
  }
  /**
   * Returns the relative position of an element rendered in the list.
   * Returns `null` if the element isn't *entirely* in the visible viewport.
   */
  getRelativeTop(location2) {
    const index2 = this.model.getListIndex(location2);
    if (index2 === -1) {
      return null;
    }
    const stickyScrollNode = this.stickyScrollController?.getNode(this.getNode(location2));
    return this.view.getRelativeTop(index2, stickyScrollNode?.position ?? this.stickyScrollController?.height);
  }
  /**
   * Returns the absolute top offset of an element in the tree's scroll/content
   * space, or `undefined` when the element is not in the tree. Unlike
   * {@link getRelativeTop}, this reads the layout height model, so it also
   * resolves elements outside the rendered viewport.
   */
  getElementTop(location2) {
    const index2 = this.model.getListIndex(location2);
    if (index2 === -1) {
      return void 0;
    }
    return this.view.getElementTop(index2);
  }
  getViewState(identityProvider3 = this.options.identityProvider) {
    if (!identityProvider3) {
      throw new TreeError(this._user, "Can't get tree view state without an identity provider");
    }
    const getId = (element) => identityProvider3.getId(element).toString();
    const state = AbstractTreeViewState.empty(this.scrollTop);
    for (const focus of this.getFocus()) {
      state.focus.add(getId(focus));
    }
    for (const selection of this.getSelection()) {
      state.selection.add(getId(selection));
    }
    const root = this.model.getNode();
    const stack = [root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node !== root && node.collapsible) {
        state.expanded[getId(node.element)] = node.collapsed ? 0 : 1;
      }
      insertInto(stack, stack.length, node.children);
    }
    return state;
  }
  // List
  onLeftArrow(e4) {
    e4.preventDefault();
    e4.stopPropagation();
    const nodes = this.view.getFocusedElements();
    if (nodes.length === 0) {
      return;
    }
    const node = nodes[0];
    const location2 = this.model.getNodeLocation(node);
    const didChange = this.model.setCollapsed(location2, true);
    if (!didChange) {
      const parentLocation = this.model.getParentNodeLocation(location2);
      if (!parentLocation) {
        return;
      }
      const parentListIndex = this.model.getListIndex(parentLocation);
      this.view.reveal(parentListIndex);
      this.view.setFocus([parentListIndex]);
    }
  }
  onRightArrow(e4) {
    e4.preventDefault();
    e4.stopPropagation();
    const nodes = this.view.getFocusedElements();
    if (nodes.length === 0) {
      return;
    }
    const node = nodes[0];
    const location2 = this.model.getNodeLocation(node);
    const didChange = this.model.setCollapsed(location2, false);
    if (!didChange) {
      if (!node.children.some((child) => child.visible)) {
        return;
      }
      const [focusedIndex] = this.view.getFocus();
      const firstChildIndex = focusedIndex + 1;
      this.view.reveal(firstChildIndex);
      this.view.setFocus([firstChildIndex]);
    }
  }
  onSpace(e4) {
    e4.preventDefault();
    e4.stopPropagation();
    const nodes = this.view.getFocusedElements();
    if (nodes.length === 0) {
      return;
    }
    const node = nodes[0];
    const location2 = this.model.getNodeLocation(node);
    const recursive = e4.browserEvent.altKey;
    this.model.setCollapsed(location2, void 0, recursive);
  }
  setupModel(model) {
    this.modelDisposables.clear();
    this.modelDisposables.add(model.onDidSpliceRenderedNodes(({ start, deleteCount, elements }) => this.view.splice(start, deleteCount, elements)));
    const onDidModelSplice = Event2.forEach(model.onDidSpliceModel, (e4) => {
      this.eventBufferer.bufferEvents(() => {
        this.focus.onDidModelSplice(e4);
        this.selection.onDidModelSplice(e4);
      });
    }, this.modelDisposables);
    onDidModelSplice(() => null, null, this.modelDisposables);
    const activeNodesEmitter = this.modelDisposables.add(new Emitter());
    const activeNodesDebounce = this.modelDisposables.add(new Delayer(0));
    this.modelDisposables.add(Event2.any(onDidModelSplice, this.focus.onDidChange, this.selection.onDidChange)(() => {
      activeNodesDebounce.trigger(() => {
        const set = /* @__PURE__ */ new Set();
        for (const node of this.focus.getNodes()) {
          set.add(node);
        }
        for (const node of this.selection.getNodes()) {
          set.add(node);
        }
        activeNodesEmitter.fire([...set.values()]);
      });
    }));
    this.onDidChangeActiveNodesRelay.input = activeNodesEmitter.event;
    this.onDidChangeModelRelay.input = Event2.signal(model.onDidSpliceModel);
    this.onDidChangeCollapseStateRelay.input = model.onDidChangeCollapseState;
    this.onDidChangeRenderNodeCountRelay.input = model.onDidChangeRenderNodeCount;
    this.onDidSpliceModelRelay.input = model.onDidSpliceModel;
    if (isMacintosh) {
      this.modelDisposables.add(model.onDidChangeCollapseState((e4) => {
        const { node, deep } = e4;
        if (node.collapsible && !deep && this.isDOMFocused()) {
          alert(node.collapsed ? localize(39, null) : localize(40, null));
        }
      }));
    }
  }
  navigate(start) {
    return new TreeNavigator(this.view, this.model, start);
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this.view.delegateScrollFromMouseWheelEvent(browserEvent);
  }
  dispose() {
    dispose(this.disposables);
    this.stickyScrollController?.dispose();
    this.view.dispose();
    this.modelDisposables.dispose();
  }
};

var TreeNavigator = class {
  constructor(view, model, start) {
    this.view = view;
    this.model = model;
    if (start) {
      this.index = this.model.getListIndex(start);
    } else {
      this.index = -1;
    }
  }
  current() {
    if (this.index < 0 || this.index >= this.view.length) {
      return null;
    }
    return this.view.element(this.index).element;
  }
  previous() {
    this.index--;
    return this.current();
  }
  next() {
    this.index++;
    return this.current();
  }
  first() {
    this.index = 0;
    return this.current();
  }
  last() {
    this.index = this.view.length - 1;
    return this.current();
  }
};
export { asTreeDragAndDropData, asListOptions, contiguousFuzzyScore, stickyScrollNodeStateEquals, stickyScrollNodeEquals, asTreeMouseEvent, asTreeContextMenuEvent, dfs, TreeElementsDragAndDropData, TreeNodeListDragAndDrop, ComposedTreeDelegate, AbstractTreeViewState, EventCollection, TreeRenderer, FindFilter, TreeFindToggle, FindToggles, unthemedFindWidgetStyles, FindWidget2, AbstractFindController, FindController, StickyScrollState, DefaultStickyScrollDelegate, StickyScrollController, StickyScrollWidget, StickyScrollFocus, Trait2, TreeNodeListMouseController, TreeNodeList, AbstractTree, TreeNavigator };
