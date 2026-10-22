// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/tree/quickInputTreeController.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { QuickInputCheckboxStateHandler, QuickInputTreeRenderer } from "./module-1676.mjs";
import { QuickInputTreeFilter } from "./module-1680.mjs";
import { QuickInputTreeSorter } from "./module-1681.mjs";
import { WorkbenchObjectTree } from "./module-0636.mjs";
import { QuickInputTreeDelegate } from "./module-1677.mjs";
import { QuickTreeAccessibilityProvider } from "./module-1679.mjs";
import { getParentNodeState } from "./module-1678.mjs";
import { Checkbox } from "./module-0549.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/platform/quickinput/browser/tree/quickInputTreeController.ts
var $20 = $;

var flatHierarchyClass = "quick-input-tree-flat";

var QuickInputTreeIdentityProvider = class {
  constructor() {
    this._elementIds = /* @__PURE__ */ new WeakMap();
    this._counter = 0;
  }
  getId(element) {
    let id2 = element.id;
    if (id2 !== void 0) {
      return id2;
    }
    id2 = this._elementIds.get(element);
    if (id2 !== void 0) {
      return id2;
    }
    id2 = `__generated_${this._counter++}`;
    this._elementIds.set(element, id2);
    return id2;
  }
};

var QuickInputTreeController = class extends Disposable {
  constructor(container2, hoverDelegate, styles, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this._onDidTriggerButton = this._register(new Emitter());
    this.onDidTriggerButton = this._onDidTriggerButton.event;
    this._onDidChangeCheckboxState = this._register(new Emitter());
    this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
    this._onDidCheckedLeafItemsChange = this._register(new Emitter());
    this.onDidChangeCheckedLeafItems = this._onDidCheckedLeafItemsChange.event;
    this._onLeave = this._register(new Emitter());
    /**
     * Event that is fired when the tree would no longer have focus.
    */
    this.onLeave = this._onLeave.event;
    this._onDidAccept = this._register(new Emitter());
    /**
     * Event that is fired when a non-pickable item is clicked, indicating acceptance.
     */
    this.onDidAccept = this._onDidAccept.event;
    this._container = append(container2, $20(".quick-input-tree"));
    this._checkboxStateHandler = this._register(new QuickInputCheckboxStateHandler());
    this._renderer = this._register(this.instantiationService.createInstance(
      QuickInputTreeRenderer,
      hoverDelegate,
      this._onDidTriggerButton,
      this.onDidChangeCheckboxState,
      this._checkboxStateHandler,
      styles.toggle
    ));
    this._filter = this.instantiationService.createInstance(QuickInputTreeFilter);
    this._sorter = this._register(new QuickInputTreeSorter());
    this._tree = this._register(this.instantiationService.createInstance(
      WorkbenchObjectTree,
      "QuickInputTree",
      this._container,
      new QuickInputTreeDelegate(),
      [this._renderer],
      {
        accessibilityProvider: new QuickTreeAccessibilityProvider(this.onDidChangeCheckboxState),
        horizontalScrolling: false,
        multipleSelectionSupport: false,
        findWidgetEnabled: false,
        alwaysConsumeMouseWheel: true,
        hideTwistiesOfChildlessElements: true,
        renderIndentGuides: "none" /* None */,
        expandOnDoubleClick: true,
        expandOnlyOnTwistieClick: true,
        disableExpandOnSpacebar: true,
        sorter: this._sorter,
        filter: this._filter,
        identityProvider: new QuickInputTreeIdentityProvider()
      }
    ));
    this._register(this._renderer.onDidDisposeFocusedElement(() => {
      this._tree.domFocus();
    }));
    this.registerCheckboxStateListeners();
    this.registerOnDidChangeFocus();
  }
  get tree() {
    return this._tree;
  }
  get renderer() {
    return this._renderer;
  }
  get displayed() {
    return this._container.style.display !== "none";
  }
  set displayed(value2) {
    this._container.style.display = value2 ? "" : "none";
  }
  get sortByLabel() {
    return this._sorter.sortByLabel;
  }
  set sortByLabel(value2) {
    this._sorter.sortByLabel = value2;
    this._tree.resort(null, true);
  }
  getActiveDescendant() {
    return this._tree.getHTMLElement().getAttribute("aria-activedescendant");
  }
  filter(input) {
    this._filter.filterValue = input;
    this._tree.refilter();
  }
  updateFilterOptions(options3) {
    if (options3.matchOnLabel !== void 0) {
      this._filter.matchOnLabel = options3.matchOnLabel;
    }
    if (options3.matchOnDescription !== void 0) {
      this._filter.matchOnDescription = options3.matchOnDescription;
    }
    this._tree.refilter();
  }
  setTreeData(treeData) {
    let hasNestedItems = false;
    const createTreeElement = (item) => {
      let children;
      if (item.children && item.children.length > 0) {
        hasNestedItems = true;
        children = item.children.map((child) => createTreeElement(child));
        item.checked = getParentNodeState(children);
      }
      return {
        element: item,
        children,
        collapsible: !!children,
        collapsed: item.collapsed ? 3 /* PreserveOrCollapsed */ : 2 /* PreserveOrExpanded */
      };
    };
    const treeElements = treeData.map((item) => createTreeElement(item));
    this._tree.setChildren(null, treeElements);
    this._container.classList.toggle(flatHierarchyClass, !hasNestedItems);
  }
  layout(maxHeight) {
    this._tree.getHTMLElement().style.maxHeight = maxHeight ? `${// Make sure height aligns with list item heights
    Math.floor(maxHeight / 44) * 44 + 6}px` : "";
    this._tree.layout();
  }
  focus(what) {
    switch (what) {
      case 1 /* First */:
        this._tree.scrollTop = 0;
        this._tree.focusFirst();
        break;
      case 2 /* Second */: {
        this._tree.scrollTop = 0;
        let isSecondItem = false;
        this._tree.focusFirst(void 0, (e4) => {
          if (isSecondItem) {
            return true;
          }
          isSecondItem = !isSecondItem;
          return false;
        });
        break;
      }
      case 3 /* Last */:
        this._tree.scrollTop = this._tree.scrollHeight;
        this._tree.focusLast();
        break;
      case 4 /* Next */: {
        const prevFocus = this._tree.getFocus();
        this._tree.focusNext(void 0, false, void 0, (e4) => {
          this._tree.reveal(e4.element);
          return true;
        });
        const currentFocus = this._tree.getFocus();
        if (prevFocus.length && prevFocus[0] === currentFocus[0]) {
          this._onLeave.fire();
        }
        break;
      }
      case 5 /* Previous */: {
        const prevFocus = this._tree.getFocus();
        this._tree.focusPrevious(void 0, false, void 0, (e4) => {
          this._tree.reveal(e4.element);
          return true;
        });
        const currentFocus = this._tree.getFocus();
        if (prevFocus.length && prevFocus[0] === currentFocus[0]) {
          this._onLeave.fire();
        }
        break;
      }
      case 6 /* NextPage */:
        this._tree.focusNextPage(void 0, (e4) => {
          this._tree.reveal(e4.element);
          return true;
        });
        break;
      case 7 /* PreviousPage */:
        this._tree.focusPreviousPage(void 0, (e4) => {
          this._tree.reveal(e4.element);
          return true;
        });
        break;
      case 8 /* NextSeparator */:
      case 9 /* PreviousSeparator */:
        return;
    }
  }
  registerCheckboxStateListeners() {
    this._register(this._tree.onDidOpen((e4) => {
      const item = e4.element;
      if (!item) {
        return;
      }
      if (item.disabled) {
        return;
      }
      if (item.pickable === false) {
        this._tree.setFocus([item]);
        this._onDidAccept.fire();
        return;
      }
      const target = e4.browserEvent?.target;
      if (target && target.classList.contains(Checkbox.CLASS_NAME)) {
        return;
      }
      this.updateCheckboxState(item, item.checked === true);
    }));
    this._register(this._checkboxStateHandler.onDidChangeCheckboxState((e4) => {
      this.updateCheckboxState(e4.item, e4.checked === true, true);
      this._tree.setFocus([e4.item]);
      this._tree.setSelection([e4.item]);
    }));
  }
  updateCheckboxState(item, newState, skipItemRerender = false) {
    if ((item.checked ?? false) === newState) {
      return;
    }
    item.checked = newState;
    if (!skipItemRerender) {
      this._tree.rerender(item);
    }
    const updateSet = /* @__PURE__ */ new Set();
    const toUpdate = [...this._tree.getNode(item).children];
    while (toUpdate.length) {
      const pop = toUpdate.shift();
      if (pop?.element && !updateSet.has(pop.element)) {
        updateSet.add(pop.element);
        if ((pop.element.checked ?? false) !== item.checked) {
          pop.element.checked = item.checked;
          this._tree.rerender(pop.element);
        }
        toUpdate.push(...pop.children);
      }
    }
    let parent = this._tree.getParentElement(item);
    while (parent) {
      const parentChildren = [...this._tree.getNode(parent).children];
      const newState2 = getParentNodeState(parentChildren);
      if ((parent.checked ?? false) !== newState2) {
        parent.checked = newState2;
        this._tree.rerender(parent);
      }
      parent = this._tree.getParentElement(parent);
    }
    this._onDidChangeCheckboxState.fire({
      item,
      checked: item.checked ?? false
    });
    this._onDidCheckedLeafItemsChange.fire(this.getCheckedLeafItems());
  }
  registerOnDidChangeFocus() {
    this._register(this._tree.onDidChangeFocus((e4) => {
      const item = this._tree.getFocus().findLast((item2) => item2 !== null);
      this._tree.setSelection(item ? [item] : [], e4.browserEvent);
    }));
  }
  getCheckedLeafItems() {
    const lookedAt = /* @__PURE__ */ new Set();
    const toLookAt = [...this._tree.getNode().children];
    const checkedItems = new Array();
    while (toLookAt.length) {
      const lookAt = toLookAt.shift();
      if (!lookAt?.element || lookedAt.has(lookAt.element)) {
        continue;
      }
      if (lookAt.element.checked) {
        lookedAt.add(lookAt.element);
        toLookAt.push(...lookAt.children);
        if (!lookAt.element.children) {
          checkedItems.push(lookAt.element);
        }
      }
    }
    return checkedItems;
  }
  getActiveItems() {
    return this._tree.getFocus().filter((item) => item !== null);
  }
  toggleCheckbox() {
    for (const element of this.getActiveItems()) {
      if (element.pickable !== false && !element.disabled) {
        this.updateCheckboxState(element, !(element.checked === true));
      }
    }
  }
  checkAll(checked) {
    const updated = /* @__PURE__ */ new Set();
    const toUpdate = [...this._tree.getNode().children];
    let fireCheckedChangeEvent = false;
    while (toUpdate.length) {
      const update = toUpdate.shift();
      if (!update?.element || updated.has(update.element)) {
        continue;
      }
      if (update.element.checked !== checked) {
        fireCheckedChangeEvent = true;
        update.element.checked = checked;
        toUpdate.push(...update.children);
        updated.add(update.element);
        this._tree.rerender(update.element);
        this._onDidChangeCheckboxState.fire({
          item: update.element,
          checked: update.element.checked
        });
      }
    }
    if (fireCheckedChangeEvent) {
      this._onDidCheckedLeafItemsChange.fire(this.getCheckedLeafItems());
    }
  }
};

QuickInputTreeController = __decorateClass([
  __decorateParam(3, IInstantiationService)
], QuickInputTreeController);
export { $20, flatHierarchyClass, QuickInputTreeIdentityProvider, QuickInputTreeController };
