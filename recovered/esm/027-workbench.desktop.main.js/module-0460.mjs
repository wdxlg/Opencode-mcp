// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/list/listWidget.ts
import { Emitter, Event2, EventBufferer } from "./module-0017.mjs";
import { binarySearch, range } from "./module-0007.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { EventHelper, getActiveElement, getWindow, isActiveElement, isEditableElement, isHTMLElement, isMouseEvent } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { alert } from "./module-0076.mjs";
import { matchesFuzzy2, matchesPrefix } from "./module-0453.mjs";
import { Gesture } from "./module-0251.mjs";
import { ListError, NotSelectableGroupId } from "./module-0454.mjs";
import { asCssValueWithDefault } from "./module-0449.mjs";
import { Color } from "./module-0197.mjs";
import { constObservable } from "./module-0061.mjs";
import { autorun } from "./module-0052.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { CombinedSpliceable } from "./module-0450.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { ListView } from "./module-0459.mjs";
import { timeout } from "./module-0036.mjs";
import { isNumber } from "./module-0010.mjs";
import { clamp } from "./module-0040.mjs";


// src/vs/base/browser/ui/list/listWidget.ts
var TraitRenderer = class {
  constructor(trait) {
    this.trait = trait;
    this.renderedElements = [];
  }
  get templateId() {
    return `template:${this.trait.name}`;
  }
  renderTemplate(container3) {
    return container3;
  }
  renderElement(element, index2, templateData) {
    const renderedElementIndex = this.renderedElements.findIndex((el) => el.templateData === templateData);
    if (renderedElementIndex >= 0) {
      const rendered = this.renderedElements[renderedElementIndex];
      this.trait.unrender(templateData);
      rendered.index = index2;
    } else {
      const rendered = { index: index2, templateData };
      this.renderedElements.push(rendered);
    }
    this.trait.renderIndex(index2, templateData);
  }
  splice(start, deleteCount, insertCount) {
    const rendered = [];
    for (const renderedElement of this.renderedElements) {
      if (renderedElement.index < start) {
        rendered.push(renderedElement);
      } else if (renderedElement.index >= start + deleteCount) {
        rendered.push({
          index: renderedElement.index + insertCount - deleteCount,
          templateData: renderedElement.templateData
        });
      }
    }
    this.renderedElements = rendered;
  }
  renderIndexes(indexes) {
    for (const { index: index2, templateData } of this.renderedElements) {
      if (indexes.indexOf(index2) > -1) {
        this.trait.renderIndex(index2, templateData);
      }
    }
  }
  disposeTemplate(templateData) {
    const index2 = this.renderedElements.findIndex((el) => el.templateData === templateData);
    if (index2 < 0) {
      return;
    }
    this.renderedElements.splice(index2, 1);
  }
};

var Trait = class {
  constructor(_trait) {
    this._trait = _trait;
    this.indexes = [];
    this.sortedIndexes = [];
    this._onChange = new Emitter();
  }
  get onChange() {
    return this._onChange.event;
  }
  get name() {
    return this._trait;
  }
  get renderer() {
    return new TraitRenderer(this);
  }
  splice(start, deleteCount, elements) {
    const diff4 = elements.length - deleteCount;
    const end = start + deleteCount;
    const sortedIndexes = [];
    let i2 = 0;
    while (i2 < this.sortedIndexes.length && this.sortedIndexes[i2] < start) {
      sortedIndexes.push(this.sortedIndexes[i2++]);
    }
    for (let j = 0; j < elements.length; j++) {
      if (elements[j]) {
        sortedIndexes.push(j + start);
      }
    }
    while (i2 < this.sortedIndexes.length && this.sortedIndexes[i2] >= end) {
      sortedIndexes.push(this.sortedIndexes[i2++] + diff4);
    }
    this.renderer.splice(start, deleteCount, elements.length);
    this._set(sortedIndexes, sortedIndexes);
  }
  renderIndex(index2, container3) {
    container3.classList.toggle(this._trait, this.contains(index2));
  }
  unrender(container3) {
    container3.classList.remove(this._trait);
  }
  /**
   * Sets the indexes which should have this trait.
   *
   * @param indexes Indexes which should have this trait.
   * @return The old indexes which had this trait.
   */
  set(indexes, browserEvent) {
    return this._set(indexes, [...indexes].sort(numericSort), browserEvent);
  }
  _set(indexes, sortedIndexes, browserEvent) {
    const result = this.indexes;
    const sortedResult = this.sortedIndexes;
    this.indexes = indexes;
    this.sortedIndexes = sortedIndexes;
    const toRender = disjunction(sortedResult, indexes);
    this.renderer.renderIndexes(toRender);
    this._onChange.fire({ indexes, browserEvent });
    return result;
  }
  get() {
    return this.indexes;
  }
  contains(index2) {
    return binarySearch(this.sortedIndexes, index2, numericSort) >= 0;
  }
  dispose() {
    dispose(this._onChange);
  }
};

__decorateClass([
  memoize
], Trait.prototype, "renderer", 1);

var SelectionTrait = class extends Trait {
  constructor(setAriaSelected) {
    super("selected");
    this.setAriaSelected = setAriaSelected;
  }
  renderIndex(index2, container3) {
    super.renderIndex(index2, container3);
    if (this.setAriaSelected) {
      if (this.contains(index2)) {
        container3.setAttribute("aria-selected", "true");
      } else {
        container3.setAttribute("aria-selected", "false");
      }
    }
  }
};

var TraitSpliceable = class {
  constructor(trait, view, identityProvider3) {
    this.trait = trait;
    this.view = view;
    this.identityProvider = identityProvider3;
  }
  splice(start, deleteCount, elements) {
    if (!this.identityProvider) {
      return this.trait.splice(start, deleteCount, new Array(elements.length).fill(false));
    }
    const pastElementsWithTrait = this.trait.get().map((i2) => this.identityProvider.getId(this.view.element(i2)).toString());
    if (pastElementsWithTrait.length === 0) {
      return this.trait.splice(start, deleteCount, new Array(elements.length).fill(false));
    }
    const pastElementsWithTraitSet = new Set(pastElementsWithTrait);
    const elementsWithTrait = elements.map((e) => pastElementsWithTraitSet.has(this.identityProvider.getId(e).toString()));
    this.trait.splice(start, deleteCount, elementsWithTrait);
  }
};

function isListElementDescendantOfClass(e, className2) {
  if (e.classList.contains(className2)) {
    return true;
  }
  if (e.classList.contains("monaco-list")) {
    return false;
  }
  if (!e.parentElement) {
    return false;
  }
  return isListElementDescendantOfClass(e.parentElement, className2);
}

function isMonacoEditor(e) {
  return isListElementDescendantOfClass(e, "monaco-editor");
}

function isMonacoCustomToggle(e) {
  return isListElementDescendantOfClass(e, "monaco-custom-toggle");
}

function isActionItem(e) {
  return isListElementDescendantOfClass(e, "action-item");
}

function isStickyScrollElement(e) {
  return isListElementDescendantOfClass(e, "monaco-tree-sticky-row");
}

function isStickyScrollContainer(e) {
  return e.classList.contains("monaco-tree-sticky-container");
}

function isButton(e) {
  if (e.tagName === "A" && e.classList.contains("monaco-button") || e.tagName === "DIV" && e.classList.contains("monaco-button-dropdown")) {
    return true;
  }
  if (e.classList.contains("monaco-list")) {
    return false;
  }
  if (!e.parentElement) {
    return false;
  }
  return isButton(e.parentElement);
}

var KeyboardController = class {
  constructor(list2, view, options3) {
    this.list = list2;
    this.view = view;
    this.disposables = new DisposableStore();
    this.multipleSelectionDisposables = new DisposableStore();
    this.multipleSelectionSupport = options3.multipleSelectionSupport;
    this.disposables.add(this.onKeyDown((e) => {
      switch (e.keyCode) {
        case 3 /* Enter */:
          return this.onEnter(e);
        case 16 /* UpArrow */:
          return this.onUpArrow(e);
        case 18 /* DownArrow */:
          return this.onDownArrow(e);
        case 11 /* PageUp */:
          return this.onPageUpArrow(e);
        case 12 /* PageDown */:
          return this.onPageDownArrow(e);
        case 9 /* Escape */:
          return this.onEscape(e);
        case 31 /* KeyA */:
          if (this.multipleSelectionSupport && (isMacintosh ? e.metaKey : e.ctrlKey)) {
            this.onCtrlA(e);
          }
      }
    }));
  }
  get onKeyDown() {
    return Event2.chain(
      this.disposables.add(new DomEmitter(this.view.domNode, "keydown")).event,
      ($110) => $110.filter((e) => !isEditableElement(e.target)).map((e) => new StandardKeyboardEvent(e))
    );
  }
  updateOptions(optionsUpdate) {
    if (optionsUpdate.multipleSelectionSupport !== void 0) {
      this.multipleSelectionSupport = optionsUpdate.multipleSelectionSupport;
    }
  }
  onEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.setSelection(this.list.getFocus(), e.browserEvent);
  }
  onUpArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.focusPrevious(1, false, e.browserEvent);
    const el = this.list.getFocus()[0];
    this.list.setAnchor(el);
    this.list.reveal(el);
    this.view.domNode.focus();
  }
  onDownArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.focusNext(1, false, e.browserEvent);
    const el = this.list.getFocus()[0];
    this.list.setAnchor(el);
    this.list.reveal(el);
    this.view.domNode.focus();
  }
  onPageUpArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.focusPreviousPage(e.browserEvent);
    const el = this.list.getFocus()[0];
    this.list.setAnchor(el);
    this.list.reveal(el);
    this.view.domNode.focus();
  }
  onPageDownArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.focusNextPage(e.browserEvent);
    const el = this.list.getFocus()[0];
    this.list.setAnchor(el);
    this.list.reveal(el);
    this.view.domNode.focus();
  }
  onCtrlA(e) {
    e.preventDefault();
    e.stopPropagation();
    let selection = range(this.list.length);
    const focusedElements = this.list.getFocus();
    const referenceGroupId = focusedElements.length > 0 ? this.list.getElementGroupId(focusedElements[0]) : void 0;
    if (referenceGroupId !== void 0) {
      selection = this.list.filterIndicesByGroup(selection, referenceGroupId);
    }
    this.list.setSelection(selection, e.browserEvent);
    this.list.setAnchor(void 0);
    this.view.domNode.focus();
  }
  onEscape(e) {
    if (this.list.getSelection().length) {
      e.preventDefault();
      e.stopPropagation();
      this.list.setSelection([], e.browserEvent);
      this.list.setAnchor(void 0);
      this.view.domNode.focus();
    }
  }
  dispose() {
    this.disposables.dispose();
    this.multipleSelectionDisposables.dispose();
  }
};

__decorateClass([
  memoize
], KeyboardController.prototype, "onKeyDown", 1);

var DefaultKeyboardNavigationDelegate = new class {
  mightProducePrintableCharacter(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }
    return event.keyCode >= 31 /* KeyA */ && event.keyCode <= 56 /* KeyZ */ || event.keyCode >= 21 /* Digit0 */ && event.keyCode <= 30 /* Digit9 */ || event.keyCode >= 98 /* Numpad0 */ && event.keyCode <= 107 /* Numpad9 */ || event.keyCode >= 85 /* Semicolon */ && event.keyCode <= 95 /* Quote */;
  }
}();

var TypeNavigationController = class {
  constructor(list2, view, keyboardNavigationLabelProvider, keyboardNavigationEventFilter, delegate) {
    this.list = list2;
    this.view = view;
    this.keyboardNavigationLabelProvider = keyboardNavigationLabelProvider;
    this.keyboardNavigationEventFilter = keyboardNavigationEventFilter;
    this.delegate = delegate;
    this.enabled = false;
    this.state = 0 /* Idle */;
    this.mode = 0 /* Automatic */;
    this.triggered = false;
    this.previouslyFocused = -1;
    this.enabledDisposables = new DisposableStore();
    this.disposables = new DisposableStore();
    this.updateOptions(list2.options);
  }
  updateOptions(options3) {
    if (options3.typeNavigationEnabled ?? true) {
      this.enable();
    } else {
      this.disable();
    }
    this.mode = options3.typeNavigationMode ?? 0 /* Automatic */;
  }
  trigger() {
    this.triggered = !this.triggered;
  }
  enable() {
    if (this.enabled) {
      return;
    }
    let typing = false;
    const onChar = Event2.chain(
      this.enabledDisposables.add(new DomEmitter(this.view.domNode, "keydown")).event,
      ($110) => $110.filter((e) => !isEditableElement(e.target)).filter(() => this.mode === 0 /* Automatic */ || this.triggered).map((event) => new StandardKeyboardEvent(event)).filter((e) => typing || this.keyboardNavigationEventFilter(e)).filter((e) => this.delegate.mightProducePrintableCharacter(e)).forEach((e) => EventHelper.stop(e, true)).map((event) => event.browserEvent.key)
    );
    const onClear = Event2.debounce(onChar, () => null, 800, void 0, void 0, void 0, this.enabledDisposables);
    const onInput = Event2.reduce(Event2.any(onChar, onClear), (r2, i2) => i2 === null ? null : (r2 || "") + i2, void 0, this.enabledDisposables);
    onInput(this.onInput, this, this.enabledDisposables);
    onClear(this.onClear, this, this.enabledDisposables);
    onChar(() => typing = true, void 0, this.enabledDisposables);
    onClear(() => typing = false, void 0, this.enabledDisposables);
    this.enabled = true;
    this.triggered = false;
  }
  disable() {
    if (!this.enabled) {
      return;
    }
    this.enabledDisposables.clear();
    this.enabled = false;
    this.triggered = false;
  }
  onClear() {
    const focus = this.list.getFocus();
    if (focus.length > 0 && focus[0] === this.previouslyFocused) {
      const ariaLabel = this.list.options.accessibilityProvider?.getAriaLabel(this.list.element(focus[0]));
      if (typeof ariaLabel === "string") {
        alert(ariaLabel);
      } else if (ariaLabel) {
        alert(ariaLabel.get());
      }
    }
    this.previouslyFocused = -1;
  }
  onInput(word) {
    if (!word) {
      this.state = 0 /* Idle */;
      this.triggered = false;
      return;
    }
    const focus = this.list.getFocus();
    const start = focus.length > 0 ? focus[0] : 0;
    const delta2 = this.state === 0 /* Idle */ ? 1 : 0;
    this.state = 1 /* Typing */;
    for (let i2 = 0; i2 < this.list.length; i2++) {
      const index2 = (start + i2 + delta2) % this.list.length;
      const label3 = this.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(this.view.element(index2));
      const labelStr = label3 && label3.toString();
      if (this.list.options.typeNavigationEnabled) {
        if (typeof labelStr !== "undefined") {
          if (matchesPrefix(word, labelStr)) {
            this.previouslyFocused = start;
            this.list.setFocus([index2]);
            this.list.reveal(index2);
            return;
          }
          const fuzzy = matchesFuzzy2(word, labelStr);
          if (fuzzy) {
            const fuzzyScore2 = fuzzy[0].end - fuzzy[0].start;
            if (fuzzyScore2 > 1 && fuzzy.length === 1) {
              this.previouslyFocused = start;
              this.list.setFocus([index2]);
              this.list.reveal(index2);
              return;
            }
          }
        }
      } else if (typeof labelStr === "undefined" || matchesPrefix(word, labelStr)) {
        this.previouslyFocused = start;
        this.list.setFocus([index2]);
        this.list.reveal(index2);
        return;
      }
    }
  }
  dispose() {
    this.disable();
    this.enabledDisposables.dispose();
    this.disposables.dispose();
  }
};

var DOMFocusController = class {
  constructor(list2, view) {
    this.list = list2;
    this.view = view;
    this.disposables = new DisposableStore();
    const onKeyDown = Event2.chain(
      this.disposables.add(new DomEmitter(view.domNode, "keydown")).event,
      ($110) => $110.filter((e) => !isEditableElement(e.target)).map((e) => new StandardKeyboardEvent(e))
    );
    const onTab = Event2.chain(onKeyDown, ($110) => $110.filter((e) => e.keyCode === 2 /* Tab */ && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey));
    onTab(this.onTab, this, this.disposables);
  }
  onTab(e) {
    if (e.target !== this.view.domNode) {
      return;
    }
    const focus = this.list.getFocus();
    if (focus.length === 0) {
      return;
    }
    const focusedDomElement = this.view.domElement(focus[0]);
    if (!focusedDomElement) {
      return;
    }
    const tabIndexElement = focusedDomElement.querySelector("[tabIndex]");
    if (!tabIndexElement || !isHTMLElement(tabIndexElement) || tabIndexElement.tabIndex === -1) {
      return;
    }
    const style = getWindow(tabIndexElement).getComputedStyle(tabIndexElement);
    if (style.visibility === "hidden" || style.display === "none") {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    tabIndexElement.focus();
  }
  dispose() {
    this.disposables.dispose();
  }
};

function isSelectionSingleChangeEvent(event) {
  return isMacintosh ? event.browserEvent.metaKey : event.browserEvent.ctrlKey;
}

function isSelectionRangeChangeEvent(event) {
  return event.browserEvent.shiftKey;
}

function isMouseRightClick(event) {
  return isMouseEvent(event) && event.button === 2;
}

var DefaultMultipleSelectionController = {
  isSelectionSingleChangeEvent,
  isSelectionRangeChangeEvent
};

var MouseController = class {
  constructor(list2) {
    this.list = list2;
    this.disposables = new DisposableStore();
    this._onPointer = this.disposables.add(new Emitter());
    if (list2.options.multipleSelectionSupport !== false) {
      this.multipleSelectionController = this.list.options.multipleSelectionController || DefaultMultipleSelectionController;
    }
    this.mouseSupport = typeof list2.options.mouseSupport === "undefined" || !!list2.options.mouseSupport;
    if (this.mouseSupport) {
      list2.onMouseDown(this.onMouseDown, this, this.disposables);
      list2.onContextMenu(this.onContextMenu, this, this.disposables);
      list2.onMouseDblClick(this.onDoubleClick, this, this.disposables);
      list2.onTouchStart(this.onMouseDown, this, this.disposables);
      this.disposables.add(Gesture.addTarget(list2.getHTMLElement()));
    }
    Event2.any(list2.onMouseClick, list2.onMouseMiddleClick, list2.onTap)(this.onViewPointer, this, this.disposables);
  }
  get onPointer() {
    return this._onPointer.event;
  }
  updateOptions(optionsUpdate) {
    if (optionsUpdate.multipleSelectionSupport !== void 0) {
      this.multipleSelectionController = void 0;
      if (optionsUpdate.multipleSelectionSupport) {
        this.multipleSelectionController = this.list.options.multipleSelectionController || DefaultMultipleSelectionController;
      }
    }
  }
  isSelectionSingleChangeEvent(event) {
    if (!this.multipleSelectionController) {
      return false;
    }
    return this.multipleSelectionController.isSelectionSingleChangeEvent(event);
  }
  isSelectionRangeChangeEvent(event) {
    if (!this.multipleSelectionController) {
      return false;
    }
    return this.multipleSelectionController.isSelectionRangeChangeEvent(event);
  }
  isSelectionChangeEvent(event) {
    return this.isSelectionSingleChangeEvent(event) || this.isSelectionRangeChangeEvent(event);
  }
  onMouseDown(e) {
    if (isMonacoEditor(e.browserEvent.target)) {
      return;
    }
    if (getActiveElement() !== e.browserEvent.target) {
      this.list.domFocus();
    }
  }
  onContextMenu(e) {
    if (isEditableElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
      return;
    }
    const focus = typeof e.index === "undefined" ? [] : [e.index];
    this.list.setFocus(focus, e.browserEvent);
  }
  onViewPointer(e) {
    if (!this.mouseSupport) {
      return;
    }
    if (isEditableElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
      return;
    }
    if (e.browserEvent.isHandledByList) {
      return;
    }
    e.browserEvent.isHandledByList = true;
    const focus = e.index;
    if (typeof focus === "undefined") {
      this.list.setFocus([], e.browserEvent);
      this.list.setSelection([], e.browserEvent);
      this.list.setAnchor(void 0);
      return;
    }
    if (this.isSelectionChangeEvent(e)) {
      return this.changeSelection(e);
    }
    this.list.setFocus([focus], e.browserEvent);
    this.list.setAnchor(focus);
    if (!isMouseRightClick(e.browserEvent)) {
      const focusGroupId = this.list.getElementGroupId(focus);
      if (focusGroupId !== NotSelectableGroupId) {
        this.list.setSelection([focus], e.browserEvent);
      }
    }
    this._onPointer.fire(e);
  }
  onDoubleClick(e) {
    if (isEditableElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
      return;
    }
    if (this.isSelectionChangeEvent(e)) {
      return;
    }
    if (e.browserEvent.isHandledByList) {
      return;
    }
    e.browserEvent.isHandledByList = true;
    const focus = this.list.getFocus();
    this.list.setSelection(focus, e.browserEvent);
  }
  changeSelection(e) {
    const focus = e.index;
    let anchor = this.list.getAnchor();
    if (this.isSelectionRangeChangeEvent(e)) {
      if (typeof anchor === "undefined") {
        const currentFocus = this.list.getFocus()[0];
        anchor = currentFocus ?? focus;
        this.list.setAnchor(anchor);
      }
      const min = Math.min(anchor, focus);
      const max = Math.max(anchor, focus);
      let rangeSelection = range(min, max + 1);
      const selectedElement = this.list.getSelection()[0];
      if (selectedElement !== void 0) {
        const referenceGroupId = this.list.getElementGroupId(selectedElement);
        if (referenceGroupId !== void 0) {
          rangeSelection = this.list.filterIndicesByGroup(rangeSelection, referenceGroupId);
        }
      }
      const selection = this.list.getSelection();
      const contiguousRange = getContiguousRangeContaining(disjunction(selection, [anchor]), anchor);
      if (contiguousRange.length === 0) {
        return;
      }
      const newSelection = disjunction(rangeSelection, relativeComplement(selection, contiguousRange));
      this.list.setSelection(newSelection, e.browserEvent);
      this.list.setFocus([focus], e.browserEvent);
    } else if (this.isSelectionSingleChangeEvent(e)) {
      const selection = this.list.getSelection();
      const newSelection = selection.filter((i2) => i2 !== focus);
      this.list.setFocus([focus]);
      this.list.setAnchor(focus);
      const focusGroupId = this.list.getElementGroupId(focus);
      if (focusGroupId === NotSelectableGroupId) {
        return;
      }
      if (selection.length === newSelection.length) {
        const itemsToBeSelected = focusGroupId !== void 0 ? this.list.filterIndicesByGroup([...newSelection, focus], focusGroupId) : [...newSelection, focus];
        this.list.setSelection(itemsToBeSelected, e.browserEvent);
      } else {
        this.list.setSelection(newSelection, e.browserEvent);
      }
    }
  }
  dispose() {
    this.disposables.dispose();
  }
};

var DefaultStyleController = class {
  constructor(styleElement, selectorSuffix) {
    this.styleElement = styleElement;
    this.selectorSuffix = selectorSuffix;
  }
  style(styles) {
    const suffix = this.selectorSuffix && `.${this.selectorSuffix}`;
    const content2 = [];
    if (styles.listBackground) {
      content2.push(`.monaco-list${suffix} .monaco-list-rows { background: ${styles.listBackground}; }`);
    }
    if (styles.listFocusBackground) {
      content2.push(`.monaco-list${suffix}:focus .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
      content2.push(`.monaco-list${suffix}:focus .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`);
    }
    if (styles.listFocusForeground) {
      content2.push(`.monaco-list${suffix}:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
    }
    if (styles.listActiveSelectionBackground) {
      content2.push(`.monaco-list${suffix}:focus .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
      content2.push(`.monaco-list${suffix}:focus .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`);
    }
    if (styles.listActiveSelectionForeground) {
      content2.push(`.monaco-list${suffix}:focus .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
    }
    if (styles.listActiveSelectionIconForeground) {
      content2.push(`.monaco-list${suffix}:focus .monaco-list-row.selected .codicon { color: ${styles.listActiveSelectionIconForeground}; }`);
    }
    if (styles.listFocusAndSelectionBackground) {
      content2.push(`
				.monaco-drag-image${suffix},
				.monaco-list${suffix}:focus .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
    }
    if (styles.listFocusAndSelectionForeground) {
      content2.push(`
				.monaco-drag-image${suffix},
				.monaco-list${suffix}:focus .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
    }
    if (styles.listInactiveFocusForeground) {
      content2.push(`.monaco-list${suffix} .monaco-list-row.focused { color:  ${styles.listInactiveFocusForeground}; }`);
      content2.push(`.monaco-list${suffix} .monaco-list-row.focused:hover { color:  ${styles.listInactiveFocusForeground}; }`);
    }
    if (styles.listInactiveSelectionIconForeground) {
      content2.push(`.monaco-list${suffix} .monaco-list-row.focused .codicon { color:  ${styles.listInactiveSelectionIconForeground}; }`);
    }
    if (styles.listInactiveFocusBackground) {
      content2.push(`.monaco-list${suffix} .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
      content2.push(`.monaco-list${suffix} .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`);
    }
    if (styles.listInactiveSelectionBackground) {
      content2.push(`.monaco-list${suffix} .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
      content2.push(`.monaco-list${suffix} .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`);
    }
    if (styles.listInactiveSelectionForeground) {
      content2.push(`.monaco-list${suffix} .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
    }
    if (styles.listHoverBackground) {
      content2.push(`.monaco-list${suffix}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { background-color: ${styles.listHoverBackground}; }`);
    }
    if (styles.listHoverForeground) {
      content2.push(`.monaco-list${suffix}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
    }
    const focusAndSelectionOutline = asCssValueWithDefault(styles.listFocusAndSelectionOutline, asCssValueWithDefault(styles.listSelectionOutline, styles.listFocusOutline ?? ""));
    if (focusAndSelectionOutline) {
      content2.push(`.monaco-list${suffix}:focus .monaco-list-row.focused.selected { outline: 1px solid ${focusAndSelectionOutline}; outline-offset: -1px;}`);
    }
    if (styles.listFocusOutline) {
      content2.push(`
				.monaco-drag-image${suffix},
				.monaco-list${suffix}:focus .monaco-list-row.focused,
				.context-menu-visible .monaco-list${suffix}.last-focused .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
    }
    const inactiveFocusAndSelectionOutline = asCssValueWithDefault(styles.listSelectionOutline, styles.listInactiveFocusOutline ?? "");
    if (inactiveFocusAndSelectionOutline) {
      content2.push(`.monaco-list${suffix} .monaco-list-row.focused.selected { outline: 1px dotted ${inactiveFocusAndSelectionOutline}; outline-offset: -1px; }`);
    }
    if (styles.listSelectionOutline) {
      content2.push(`.monaco-list${suffix} .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
    }
    if (styles.listInactiveFocusOutline) {
      content2.push(`.monaco-list${suffix} .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
    }
    if (styles.listHoverOutline) {
      content2.push(`.monaco-list${suffix} .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
    }
    if (styles.listDropOverBackground) {
      content2.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} .monaco-list-rows.drop-target,
				.monaco-list${suffix} .monaco-list-row.drop-target { background-color: ${styles.listDropOverBackground} !important; color: inherit !important; }
			`);
    }
    if (styles.listDropBetweenBackground) {
      content2.push(`
			.monaco-list${suffix} .monaco-list-rows.drop-target-before .monaco-list-row:first-child::before,
			.monaco-list${suffix} .monaco-list-row.drop-target-before::before {
				content: ""; position: absolute; top: 0px; left: 0px; width: 100%; height: 1px;
				background-color: ${styles.listDropBetweenBackground};
			}`);
      content2.push(`
			.monaco-list${suffix} .monaco-list-rows.drop-target-after .monaco-list-row:last-child::after,
			.monaco-list${suffix} .monaco-list-row.drop-target-after::after {
				content: ""; position: absolute; bottom: 0px; left: 0px; width: 100%; height: 1px;
				background-color: ${styles.listDropBetweenBackground};
			}`);
    }
    if (styles.tableColumnsBorder) {
      content2.push(`
				.monaco-table > .monaco-split-view2,
				.monaco-table > .monaco-split-view2 .monaco-sash.vertical::before,
				.monaco-enable-motion .monaco-table:hover > .monaco-split-view2,
				.monaco-enable-motion .monaco-table:hover > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: ${styles.tableColumnsBorder};
				}

				.monaco-enable-motion .monaco-table > .monaco-split-view2,
				.monaco-enable-motion .monaco-table > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: transparent;
				}
			`);
    }
    if (styles.tableOddRowsBackgroundColor) {
      content2.push(`
				.monaco-table .monaco-list-row[data-parity=odd]:not(.focused):not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(:focus) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(.focused) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr {
					background-color: ${styles.tableOddRowsBackgroundColor};
				}
			`);
    }
    this.styleElement.textContent = content2.join("\n");
  }
};

var unthemedListStyles = {
  listFocusBackground: "#7FB0D0",
  listActiveSelectionBackground: "#0E639C",
  listActiveSelectionForeground: "#FFFFFF",
  listActiveSelectionIconForeground: "#FFFFFF",
  listFocusAndSelectionOutline: "#90C2F9",
  listFocusAndSelectionBackground: "#094771",
  listFocusAndSelectionForeground: "#FFFFFF",
  listInactiveSelectionBackground: "#3F3F46",
  listInactiveSelectionIconForeground: "#FFFFFF",
  listHoverBackground: "#2A2D2E",
  listDropOverBackground: "#383B3D",
  listDropBetweenBackground: "#EEEEEE",
  treeIndentGuidesStroke: "#a9a9a9",
  treeInactiveIndentGuidesStroke: Color.fromHex("#a9a9a9").transparent(0.4).toString(),
  tableColumnsBorder: Color.fromHex("#cccccc").transparent(0.2).toString(),
  tableOddRowsBackgroundColor: Color.fromHex("#cccccc").transparent(0.04).toString(),
  listBackground: void 0,
  listFocusForeground: void 0,
  listInactiveSelectionForeground: void 0,
  listInactiveFocusForeground: void 0,
  listInactiveFocusBackground: void 0,
  listHoverForeground: void 0,
  listFocusOutline: void 0,
  listInactiveFocusOutline: void 0,
  listSelectionOutline: void 0,
  listHoverOutline: void 0,
  treeStickyScrollBackground: void 0,
  treeStickyScrollBorder: void 0,
  treeStickyScrollShadow: void 0
};

var DefaultOptions2 = {
  keyboardSupport: true,
  mouseSupport: true,
  multipleSelectionSupport: true,
  dnd: {
    getDragURI() {
      return null;
    },
    onDragStart() {
    },
    onDragOver() {
      return false;
    },
    drop() {
    },
    dispose() {
    }
  }
};

function getContiguousRangeContaining(range2, value2) {
  const index2 = range2.indexOf(value2);
  if (index2 === -1) {
    return [];
  }
  const result = [];
  let i2 = index2 - 1;
  while (i2 >= 0 && range2[i2] === value2 - (index2 - i2)) {
    result.push(range2[i2--]);
  }
  result.reverse();
  i2 = index2;
  while (i2 < range2.length && range2[i2] === value2 + (i2 - index2)) {
    result.push(range2[i2++]);
  }
  return result;
}

function disjunction(one, other) {
  const result = [];
  let i2 = 0, j = 0;
  while (i2 < one.length || j < other.length) {
    if (i2 >= one.length) {
      result.push(other[j++]);
    } else if (j >= other.length) {
      result.push(one[i2++]);
    } else if (one[i2] === other[j]) {
      result.push(one[i2]);
      i2++;
      j++;
      continue;
    } else if (one[i2] < other[j]) {
      result.push(one[i2++]);
    } else {
      result.push(other[j++]);
    }
  }
  return result;
}

function relativeComplement(one, other) {
  const result = [];
  let i2 = 0, j = 0;
  while (i2 < one.length || j < other.length) {
    if (i2 >= one.length) {
      result.push(other[j++]);
    } else if (j >= other.length) {
      result.push(one[i2++]);
    } else if (one[i2] === other[j]) {
      i2++;
      j++;
      continue;
    } else if (one[i2] < other[j]) {
      result.push(one[i2++]);
    } else {
      j++;
    }
  }
  return result;
}

var numericSort = (a, b) => a - b;

var PipelineRenderer = class {
  constructor(_templateId, renderers) {
    this._templateId = _templateId;
    this.renderers = renderers;
  }
  get templateId() {
    return this._templateId;
  }
  renderTemplate(container3) {
    return this.renderers.map((r2) => r2.renderTemplate(container3));
  }
  renderElement(element, index2, templateData, renderDetails) {
    let i2 = 0;
    for (const renderer of this.renderers) {
      renderer.renderElement(element, index2, templateData[i2++], renderDetails);
    }
  }
  disposeElement(element, index2, templateData, renderDetails) {
    let i2 = 0;
    for (const renderer of this.renderers) {
      renderer.disposeElement?.(element, index2, templateData[i2], renderDetails);
      i2 += 1;
    }
  }
  disposeTemplate(templateData) {
    let i2 = 0;
    for (const renderer of this.renderers) {
      renderer.disposeTemplate(templateData[i2++]);
    }
  }
};

var AccessibiltyRenderer = class {
  constructor(accessibilityProvider) {
    this.accessibilityProvider = accessibilityProvider;
    this.templateId = "a18n";
  }
  renderTemplate(container3) {
    return { container: container3, disposables: new DisposableStore() };
  }
  renderElement(element, index2, data) {
    const ariaLabel = this.accessibilityProvider.getAriaLabel(element);
    const observable = ariaLabel && typeof ariaLabel !== "string" ? ariaLabel : constObservable(ariaLabel);
    data.disposables.add(autorun((reader) => {
      this.setAriaLabel(reader.readObservable(observable), data.container);
    }));
    const ariaLevel = this.accessibilityProvider.getAriaLevel && this.accessibilityProvider.getAriaLevel(element);
    if (typeof ariaLevel === "number") {
      data.container.setAttribute("aria-level", `${ariaLevel}`);
    } else {
      data.container.removeAttribute("aria-level");
    }
  }
  setAriaLabel(ariaLabel, element) {
    if (ariaLabel) {
      element.setAttribute("aria-label", ariaLabel);
    } else {
      element.removeAttribute("aria-label");
    }
  }
  disposeElement(element, index2, templateData) {
    templateData.disposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

var ListViewDragAndDrop = class {
  constructor(list2, dnd) {
    this.list = list2;
    this.dnd = dnd;
  }
  getDragElements(element) {
    const selection = this.list.getSelectedElements();
    const elements = selection.indexOf(element) > -1 ? selection : [element];
    return elements;
  }
  getDragURI(element) {
    return this.dnd.getDragURI(element);
  }
  getDragLabel(elements, originalEvent) {
    if (this.dnd.getDragLabel) {
      return this.dnd.getDragLabel(elements, originalEvent);
    }
    return void 0;
  }
  onDragStart(data, originalEvent) {
    this.dnd.onDragStart?.(data, originalEvent);
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    return this.dnd.onDragOver(data, targetElement, targetIndex, targetSector, originalEvent);
  }
  onDragLeave(data, targetElement, targetIndex, originalEvent) {
    this.dnd.onDragLeave?.(data, targetElement, targetIndex, originalEvent);
  }
  onDragEnd(originalEvent) {
    this.dnd.onDragEnd?.(originalEvent);
  }
  drop(data, targetElement, targetIndex, targetSector, originalEvent) {
    this.dnd.drop(data, targetElement, targetIndex, targetSector, originalEvent);
  }
  dispose() {
    this.dnd.dispose();
  }
};

var List = class {
  constructor(user, container3, virtualDelegate, renderers, _options = DefaultOptions2) {
    this.user = user;
    this._options = _options;
    this.focus = new Trait("focused");
    this.anchor = new Trait("anchor");
    this.eventBufferer = new EventBufferer();
    this._ariaLabel = "";
    this.disposables = new DisposableStore();
    this._onDidDispose = new Emitter();
    this.onDidDispose = this._onDidDispose.event;
    const role = this._options.accessibilityProvider && this._options.accessibilityProvider.getWidgetRole ? this._options.accessibilityProvider?.getWidgetRole() : "list";
    this.selection = new SelectionTrait(role !== "listbox");
    const baseRenderers = [this.focus.renderer, this.selection.renderer];
    this.accessibilityProvider = _options.accessibilityProvider;
    if (this.accessibilityProvider) {
      baseRenderers.push(new AccessibiltyRenderer(this.accessibilityProvider));
      this.accessibilityProvider.onDidChangeActiveDescendant?.(this.onDidChangeActiveDescendant, this, this.disposables);
    }
    renderers = renderers.map((r2) => new PipelineRenderer(r2.templateId, [...baseRenderers, r2]));
    const viewOptions = {
      ..._options,
      dnd: _options.dnd && new ListViewDragAndDrop(this, _options.dnd)
    };
    this.view = this.createListView(container3, virtualDelegate, renderers, viewOptions);
    this.view.domNode.setAttribute("role", role);
    if (_options.styleController) {
      this.styleController = _options.styleController(this.view.domId);
    } else {
      const styleElement = createStyleSheet(this.view.domNode);
      this.styleController = new DefaultStyleController(styleElement, this.view.domId);
    }
    this.spliceable = new CombinedSpliceable([
      new TraitSpliceable(this.focus, this.view, _options.identityProvider),
      new TraitSpliceable(this.selection, this.view, _options.identityProvider),
      new TraitSpliceable(this.anchor, this.view, _options.identityProvider),
      this.view
    ]);
    this.disposables.add(this.focus);
    this.disposables.add(this.selection);
    this.disposables.add(this.anchor);
    this.disposables.add(this.view);
    this.disposables.add(this._onDidDispose);
    this.disposables.add(new DOMFocusController(this, this.view));
    if (typeof _options.keyboardSupport !== "boolean" || _options.keyboardSupport) {
      this.keyboardController = new KeyboardController(this, this.view, _options);
      this.disposables.add(this.keyboardController);
    }
    if (_options.keyboardNavigationLabelProvider) {
      const delegate = _options.keyboardNavigationDelegate || DefaultKeyboardNavigationDelegate;
      this.typeNavigationController = new TypeNavigationController(this, this.view, _options.keyboardNavigationLabelProvider, _options.keyboardNavigationEventFilter ?? (() => true), delegate);
      this.disposables.add(this.typeNavigationController);
    }
    this.mouseController = this.createMouseController(_options);
    this.disposables.add(this.mouseController);
    this.onDidChangeFocus(this._onFocusChange, this, this.disposables);
    this.onDidChangeSelection(this._onSelectionChange, this, this.disposables);
    this.view.onDidScroll(this.onDidChangeActiveDescendant, this, this.disposables);
    if (this.accessibilityProvider) {
      const ariaLabel = this.accessibilityProvider.getWidgetAriaLabel();
      const observable = ariaLabel && typeof ariaLabel !== "string" ? ariaLabel : constObservable(ariaLabel);
      this.disposables.add(autorun((reader) => {
        this.ariaLabel = reader.readObservable(observable);
      }));
    }
    if (this._options.multipleSelectionSupport !== false) {
      this.view.domNode.setAttribute("aria-multiselectable", "true");
    }
  }
  get onDidChangeFocus() {
    return Event2.map(this.eventBufferer.wrapEvent(this.focus.onChange), (e) => this.toListEvent(e), this.disposables);
  }
  get onDidChangeSelection() {
    return Event2.map(this.eventBufferer.wrapEvent(this.selection.onChange), (e) => this.toListEvent(e), this.disposables);
  }
  get domId() {
    return this.view.domId;
  }
  get onDidScroll() {
    return this.view.onDidScroll;
  }
  get onMouseClick() {
    return this.view.onMouseClick;
  }
  get onMouseDblClick() {
    return this.view.onMouseDblClick;
  }
  get onMouseMiddleClick() {
    return this.view.onMouseMiddleClick;
  }
  get onPointer() {
    return this.mouseController.onPointer;
  }
  get onMouseUp() {
    return this.view.onMouseUp;
  }
  get onMouseDown() {
    return this.view.onMouseDown;
  }
  get onMouseOver() {
    return this.view.onMouseOver;
  }
  get onMouseMove() {
    return this.view.onMouseMove;
  }
  get onMouseOut() {
    return this.view.onMouseOut;
  }
  get onTouchStart() {
    return this.view.onTouchStart;
  }
  get onTap() {
    return this.view.onTap;
  }
  get onContextMenu() {
    let didJustPressContextMenuKey = false;
    const fromKeyDown = Event2.chain(this.disposables.add(new DomEmitter(this.view.domNode, "keydown")).event, ($110) => $110.map((e) => new StandardKeyboardEvent(e)).filter((e) => didJustPressContextMenuKey = e.keyCode === 58 /* ContextMenu */ || e.shiftKey && e.keyCode === 68 /* F10 */).map((e) => EventHelper.stop(e, true)).filter(() => false));
    const fromKeyUp = Event2.chain(this.disposables.add(new DomEmitter(this.view.domNode, "keyup")).event, ($110) => $110.forEach(() => didJustPressContextMenuKey = false).map((e) => new StandardKeyboardEvent(e)).filter((e) => e.keyCode === 58 /* ContextMenu */ || e.shiftKey && e.keyCode === 68 /* F10 */).map((e) => EventHelper.stop(e, true)).map(({ browserEvent }) => {
      const focus = this.getFocus();
      const index2 = focus.length ? focus[0] : void 0;
      const element = typeof index2 !== "undefined" ? this.view.element(index2) : void 0;
      const anchor = typeof index2 !== "undefined" ? this.view.domElement(index2) : this.view.domNode;
      return { index: index2, element, anchor, browserEvent };
    }));
    const fromMouse = Event2.chain(
      this.view.onContextMenu,
      ($110) => $110.filter((_) => !didJustPressContextMenuKey).map(({ element, index: index2, browserEvent }) => ({ element, index: index2, anchor: new StandardMouseEvent(getWindow(this.view.domNode), browserEvent), browserEvent }))
    );
    return Event2.any(fromKeyDown, fromKeyUp, fromMouse);
  }
  get onKeyDown() {
    return this.disposables.add(new DomEmitter(this.view.domNode, "keydown")).event;
  }
  get onKeyUp() {
    return this.disposables.add(new DomEmitter(this.view.domNode, "keyup")).event;
  }
  get onKeyPress() {
    return this.disposables.add(new DomEmitter(this.view.domNode, "keypress")).event;
  }
  get onDidFocus() {
    return Event2.signal(this.disposables.add(new DomEmitter(this.view.domNode, "focus", true)).event);
  }
  get onDidBlur() {
    return Event2.signal(this.disposables.add(new DomEmitter(this.view.domNode, "blur", true)).event);
  }
  createListView(container3, virtualDelegate, renderers, viewOptions) {
    return new ListView(container3, virtualDelegate, renderers, viewOptions);
  }
  createMouseController(options3) {
    return new MouseController(this);
  }
  updateOptions(optionsUpdate = {}) {
    this._options = { ...this._options, ...optionsUpdate };
    this.typeNavigationController?.updateOptions(this._options);
    if (this._options.multipleSelectionController !== void 0) {
      if (this._options.multipleSelectionSupport) {
        this.view.domNode.setAttribute("aria-multiselectable", "true");
      } else {
        this.view.domNode.removeAttribute("aria-multiselectable");
      }
    }
    this.mouseController.updateOptions(optionsUpdate);
    this.keyboardController?.updateOptions(optionsUpdate);
    this.view.updateOptions(optionsUpdate);
  }
  get options() {
    return this._options;
  }
  splice(start, deleteCount, elements = []) {
    if (start < 0 || start > this.view.length) {
      throw new ListError(this.user, `Invalid start index: ${start}`);
    }
    if (deleteCount < 0) {
      throw new ListError(this.user, `Invalid delete count: ${deleteCount}`);
    }
    if (deleteCount === 0 && elements.length === 0) {
      return;
    }
    this.eventBufferer.bufferEvents(() => this.spliceable.splice(start, deleteCount, elements));
  }
  updateWidth(index2) {
    this.view.updateWidth(index2);
  }
  updateElementHeight(index2, size3) {
    this.view.updateElementHeight(index2, size3, null);
  }
  rerender() {
    this.view.rerender();
  }
  element(index2) {
    return this.view.element(index2);
  }
  indexOf(element) {
    return this.view.indexOf(element);
  }
  indexAt(position2) {
    return this.view.indexAt(position2);
  }
  get length() {
    return this.view.length;
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
    return this.view.getScrollTop();
  }
  set scrollTop(scrollTop) {
    this.view.setScrollTop(scrollTop);
  }
  get scrollLeft() {
    return this.view.getScrollLeft();
  }
  set scrollLeft(scrollLeft) {
    this.view.setScrollLeft(scrollLeft);
  }
  get scrollHeight() {
    return this.view.scrollHeight;
  }
  get renderHeight() {
    return this.view.renderHeight;
  }
  get firstVisibleIndex() {
    return this.view.firstVisibleIndex;
  }
  get firstMostlyVisibleIndex() {
    return this.view.firstMostlyVisibleIndex;
  }
  get lastVisibleIndex() {
    return this.view.lastVisibleIndex;
  }
  get ariaLabel() {
    return this._ariaLabel;
  }
  set ariaLabel(value2) {
    this._ariaLabel = value2;
    this.view.domNode.setAttribute("aria-label", value2);
  }
  domFocus() {
    this.view.domNode.focus({ preventScroll: true });
  }
  layout(height, width2) {
    this.view.layout(height, width2);
  }
  triggerTypeNavigation() {
    this.typeNavigationController?.trigger();
  }
  setSelection(indexes, browserEvent) {
    for (const index2 of indexes) {
      if (index2 < 0 || index2 >= this.length) {
        throw new ListError(this.user, `Invalid index ${index2}`);
      }
    }
    indexes = indexes.filter((i2) => this.getElementGroupId(i2) !== NotSelectableGroupId);
    this.selection.set(indexes, browserEvent);
  }
  getSelection() {
    return this.selection.get();
  }
  getSelectedElements() {
    return this.getSelection().map((i2) => this.view.element(i2));
  }
  setAnchor(index2) {
    if (typeof index2 === "undefined") {
      this.anchor.set([]);
      return;
    }
    if (index2 < 0 || index2 >= this.length) {
      throw new ListError(this.user, `Invalid index ${index2}`);
    }
    this.anchor.set([index2]);
  }
  getAnchor() {
    return this.anchor.get().at(0);
  }
  getAnchorElement() {
    const anchor = this.getAnchor();
    return typeof anchor === "undefined" ? void 0 : this.element(anchor);
  }
  /**
   * Gets the group ID for an element at the given index.
   * Returns undefined if no identity provider, no getGroupId method, or if the group ID is undefined.
   */
  getElementGroupId(index2) {
    const identityProvider3 = this.options.identityProvider;
    if (!identityProvider3?.getGroupId) {
      return void 0;
    }
    const element = this.element(index2);
    return identityProvider3.getGroupId(element);
  }
  /**
   * Filters the given indices to only include those with a matching group ID.
   * If no identity provider or getGroupId method exists, returns the original indices.
   * If referenceGroupId is undefined, returns an empty array (elements without group IDs are not selectable).
   */
  filterIndicesByGroup(indices, referenceGroupId) {
    const identityProvider3 = this.options.identityProvider;
    if (!identityProvider3?.getGroupId) {
      return indices;
    }
    if (referenceGroupId === NotSelectableGroupId) {
      return [];
    }
    return indices.filter((index2) => {
      const element = this.element(index2);
      const groupId = identityProvider3.getGroupId(element);
      return groupId === referenceGroupId;
    });
  }
  setFocus(indexes, browserEvent) {
    for (const index2 of indexes) {
      if (index2 < 0 || index2 >= this.length) {
        throw new ListError(this.user, `Invalid index ${index2}`);
      }
    }
    this.focus.set(indexes, browserEvent);
  }
  focusNext(n2 = 1, loop = false, browserEvent, filter2) {
    if (this.length === 0) {
      return;
    }
    const focus = this.focus.get();
    const index2 = this.findNextIndex(focus.length > 0 ? focus[0] + n2 : 0, loop, filter2);
    if (index2 > -1) {
      this.setFocus([index2], browserEvent);
    }
  }
  focusPrevious(n2 = 1, loop = false, browserEvent, filter2) {
    if (this.length === 0) {
      return;
    }
    const focus = this.focus.get();
    const index2 = this.findPreviousIndex(focus.length > 0 ? focus[0] - n2 : 0, loop, filter2);
    if (index2 > -1) {
      this.setFocus([index2], browserEvent);
    }
  }
  async focusNextPage(browserEvent, filter2) {
    let lastPageIndex = this.view.indexAt(this.view.getScrollTop() + this.view.renderHeight);
    lastPageIndex = lastPageIndex === 0 ? 0 : lastPageIndex - 1;
    const currentlyFocusedElementIndex = this.getFocus()[0];
    if (currentlyFocusedElementIndex !== lastPageIndex && (currentlyFocusedElementIndex === void 0 || lastPageIndex > currentlyFocusedElementIndex)) {
      const lastGoodPageIndex = this.findPreviousIndex(lastPageIndex, false, filter2);
      if (lastGoodPageIndex > -1 && currentlyFocusedElementIndex !== lastGoodPageIndex) {
        this.setFocus([lastGoodPageIndex], browserEvent);
      } else {
        this.setFocus([lastPageIndex], browserEvent);
      }
    } else {
      const previousScrollTop = this.view.getScrollTop();
      let nextpageScrollTop = previousScrollTop + this.view.renderHeight;
      if (lastPageIndex > currentlyFocusedElementIndex) {
        nextpageScrollTop -= this.view.elementHeight(lastPageIndex);
      }
      this.view.setScrollTop(nextpageScrollTop);
      if (this.view.getScrollTop() !== previousScrollTop) {
        this.setFocus([]);
        await timeout(0);
        await this.focusNextPage(browserEvent, filter2);
      }
    }
  }
  async focusPreviousPage(browserEvent, filter2, getPaddingTop = () => 0) {
    let firstPageIndex;
    const paddingTop = getPaddingTop();
    const scrollTop = this.view.getScrollTop() + paddingTop;
    if (scrollTop === 0) {
      firstPageIndex = this.view.indexAt(scrollTop);
    } else {
      firstPageIndex = this.view.indexAfter(scrollTop - 1);
    }
    const currentlyFocusedElementIndex = this.getFocus()[0];
    if (currentlyFocusedElementIndex !== firstPageIndex && (currentlyFocusedElementIndex === void 0 || currentlyFocusedElementIndex >= firstPageIndex)) {
      const firstGoodPageIndex = this.findNextIndex(firstPageIndex, false, filter2);
      if (firstGoodPageIndex > -1 && currentlyFocusedElementIndex !== firstGoodPageIndex) {
        this.setFocus([firstGoodPageIndex], browserEvent);
      } else {
        this.setFocus([firstPageIndex], browserEvent);
      }
    } else {
      const previousScrollTop = scrollTop;
      this.view.setScrollTop(scrollTop - this.view.renderHeight - paddingTop);
      if (this.view.getScrollTop() + getPaddingTop() !== previousScrollTop) {
        this.setFocus([]);
        await timeout(0);
        await this.focusPreviousPage(browserEvent, filter2, getPaddingTop);
      }
    }
  }
  focusLast(browserEvent, filter2) {
    if (this.length === 0) {
      return;
    }
    const index2 = this.findPreviousIndex(this.length - 1, false, filter2);
    if (index2 > -1) {
      this.setFocus([index2], browserEvent);
    }
  }
  focusFirst(browserEvent, filter2) {
    this.focusNth(0, browserEvent, filter2);
  }
  focusNth(n2, browserEvent, filter2) {
    if (this.length === 0) {
      return;
    }
    const index2 = this.findNextIndex(n2, false, filter2);
    if (index2 > -1) {
      this.setFocus([index2], browserEvent);
    }
  }
  findNextIndex(index2, loop = false, filter2) {
    for (let i2 = 0; i2 < this.length; i2++) {
      if (index2 >= this.length && !loop) {
        return -1;
      }
      index2 = index2 % this.length;
      if (!filter2 || filter2(this.element(index2))) {
        return index2;
      }
      index2++;
    }
    return -1;
  }
  findPreviousIndex(index2, loop = false, filter2) {
    for (let i2 = 0; i2 < this.length; i2++) {
      if (index2 < 0 && !loop) {
        return -1;
      }
      index2 = (this.length + index2 % this.length) % this.length;
      if (!filter2 || filter2(this.element(index2))) {
        return index2;
      }
      index2--;
    }
    return -1;
  }
  getFocus() {
    return this.focus.get();
  }
  getFocusedElements() {
    return this.getFocus().map((i2) => this.view.element(i2));
  }
  reveal(index2, relativeTop, paddingTop = 0) {
    if (index2 < 0 || index2 >= this.length) {
      throw new ListError(this.user, `Invalid index ${index2}`);
    }
    const scrollTop = this.view.getScrollTop();
    const elementTop = this.view.elementTop(index2);
    const elementHeight = this.view.elementHeight(index2);
    if (isNumber(relativeTop)) {
      const m = elementHeight - this.view.renderHeight + paddingTop;
      this.view.setScrollTop(m * clamp(relativeTop, 0, 1) + elementTop - paddingTop);
    } else {
      const viewItemBottom = elementTop + elementHeight;
      const scrollBottom = scrollTop + this.view.renderHeight;
      if (elementTop < scrollTop + paddingTop && viewItemBottom >= scrollBottom) {
      } else if (elementTop < scrollTop + paddingTop || viewItemBottom >= scrollBottom && elementHeight >= this.view.renderHeight) {
        this.view.setScrollTop(elementTop - paddingTop);
      } else if (viewItemBottom >= scrollBottom) {
        this.view.setScrollTop(viewItemBottom - this.view.renderHeight);
      }
    }
  }
  /**
   * Returns the relative position of an element rendered in the list.
   * Returns `null` if the element isn't *entirely* in the visible viewport.
   */
  getRelativeTop(index2, paddingTop = 0) {
    if (index2 < 0 || index2 >= this.length) {
      throw new ListError(this.user, `Invalid index ${index2}`);
    }
    const scrollTop = this.view.getScrollTop();
    const elementTop = this.view.elementTop(index2);
    const elementHeight = this.view.elementHeight(index2);
    if (elementTop < scrollTop + paddingTop || elementTop + elementHeight > scrollTop + this.view.renderHeight) {
      return null;
    }
    const m = elementHeight - this.view.renderHeight + paddingTop;
    return Math.abs((scrollTop + paddingTop - elementTop) / m);
  }
  isDOMFocused() {
    return isActiveElement(this.view.domNode);
  }
  getHTMLElement() {
    return this.view.domNode;
  }
  getScrollableElement() {
    return this.view.scrollableElementDomNode;
  }
  getElementID(index2) {
    return this.view.getElementDomId(index2);
  }
  getElementTop(index2) {
    return this.view.elementTop(index2);
  }
  getElementHeight(index2) {
    return this.view.elementHeight(index2);
  }
  style(styles) {
    this.styleController.style(styles);
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this.view.delegateScrollFromMouseWheelEvent(browserEvent);
  }
  toListEvent({ indexes, browserEvent }) {
    return { indexes, elements: indexes.map((i2) => this.view.element(i2)), browserEvent };
  }
  _onFocusChange() {
    const focus = this.focus.get();
    this.view.domNode.classList.toggle("element-focused", focus.length > 0);
    this.onDidChangeActiveDescendant();
  }
  onDidChangeActiveDescendant() {
    const focus = this.focus.get();
    if (focus.length > 0) {
      const index2 = focus[0];
      let id2;
      if (this.accessibilityProvider?.getActiveDescendantId) {
        id2 = this.accessibilityProvider.getActiveDescendantId(this.view.element(index2));
      }
      if (!id2 && this.view.domElement(index2)) {
        id2 = this.view.getElementDomId(index2);
      }
      if (id2) {
        this.view.domNode.setAttribute("aria-activedescendant", id2);
      } else {
        this.view.domNode.removeAttribute("aria-activedescendant");
      }
    } else {
      this.view.domNode.removeAttribute("aria-activedescendant");
    }
  }
  _onSelectionChange() {
    const selection = this.selection.get();
    this.view.domNode.classList.toggle("selection-none", selection.length === 0);
    this.view.domNode.classList.toggle("selection-single", selection.length === 1);
    this.view.domNode.classList.toggle("selection-multiple", selection.length > 1);
  }
  dispose() {
    this._onDidDispose.fire();
    this.disposables.dispose();
    this._onDidDispose.dispose();
  }
};

__decorateClass([
  memoize
], List.prototype, "onDidChangeFocus", 1);

__decorateClass([
  memoize
], List.prototype, "onDidChangeSelection", 1);

__decorateClass([
  memoize
], List.prototype, "onContextMenu", 1);

__decorateClass([
  memoize
], List.prototype, "onKeyDown", 1);

__decorateClass([
  memoize
], List.prototype, "onKeyUp", 1);

__decorateClass([
  memoize
], List.prototype, "onKeyPress", 1);

__decorateClass([
  memoize
], List.prototype, "onDidFocus", 1);

__decorateClass([
  memoize
], List.prototype, "onDidBlur", 1);
export { isListElementDescendantOfClass, isMonacoEditor, isMonacoCustomToggle, isActionItem, isStickyScrollElement, isStickyScrollContainer, isButton, isSelectionSingleChangeEvent, isSelectionRangeChangeEvent, isMouseRightClick, getContiguousRangeContaining, disjunction, relativeComplement, TraitRenderer, Trait, SelectionTrait, TraitSpliceable, KeyboardController, DefaultKeyboardNavigationDelegate, TypeNavigationController, DOMFocusController, DefaultMultipleSelectionController, MouseController, DefaultStyleController, unthemedListStyles, DefaultOptions2, numericSort, PipelineRenderer, AccessibiltyRenderer, ListViewDragAndDrop, List };
