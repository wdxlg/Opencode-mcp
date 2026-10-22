// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/selectBox/selectBoxCustom.ts
import { $, EventHelper, EventType, addDisposableListener, addStandardDisposableListener, append, getDomNodePagePosition, getTotalWidth, getWindow, isAncestor } from "./module-0075.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { equals } from "./module-0007.mjs";
import { asCssValueWithDefault } from "./module-0449.mjs";
import { List } from "./module-0460.mjs";
import { localize } from "./module-0001.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { KeyCodeUtils } from "./module-0019.mjs";


// src/vs/base/browser/ui/selectBox/selectBoxCustom.ts
var $3 = $;

var SELECT_OPTION_ENTRY_TEMPLATE_ID = "selectOption.entry.template";

var SELECT_OPTION_HEIGHT = 22;

var SelectListRenderer = class {
  constructor() {
    this.elements = /* @__PURE__ */ new Map();
  }
  get templateId() {
    return SELECT_OPTION_ENTRY_TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const data = /* @__PURE__ */ Object.create(null);
    data.root = container3;
    data.text = append(container3, $3(".option-text"));
    data.detail = append(container3, $3(".option-detail"));
    data.decoratorRight = append(container3, $3(".option-decorator-right"));
    return data;
  }
  renderElement(element, index2, templateData) {
    const data = templateData;
    if (data.element) {
      this.elements.delete(data.element);
    }
    data.element = element;
    this.elements.set(element, data.root);
    const text2 = element.text;
    const detail2 = element.detail;
    const decoratorRight = element.decoratorRight;
    const isDisabled = element.isDisabled;
    data.text.textContent = text2;
    data.detail.textContent = !!detail2 ? detail2 : "";
    data.decoratorRight.textContent = !!decoratorRight ? decoratorRight : "";
    if (isDisabled) {
      data.root.classList.add("option-disabled");
    } else {
      data.root.classList.remove("option-disabled");
    }
    if (element.isSeparator) {
      data.root.classList.add("option-separator");
      data.root.classList.add("option-disabled");
    } else {
      data.root.classList.remove("option-separator");
    }
  }
  disposeTemplate(templateData) {
    if (templateData.element) {
      this.elements.delete(templateData.element);
    }
  }
  getElement(element) {
    return this.elements.get(element);
  }
};

var SelectBoxList = class _SelectBoxList extends Disposable {
  // for dev purposes only
  constructor(options3, selected, contextViewProvider, styles, selectBoxOptions) {
    super();
    this.options = [];
    this.listOptionIndexes = [];
    this._currentSelection = 0;
    this._hasDetails = false;
    this._selectionDetailsDisposables = this._register(new DisposableStore());
    this._optionDescriptionHover = this._register(new MutableDisposable());
    this._skipLayout = false;
    this._sticky = false;
    this._isVisible = false;
    this.styles = styles;
    this.selectBoxOptions = selectBoxOptions || /* @__PURE__ */ Object.create(null);
    if (typeof this.selectBoxOptions.minBottomMargin !== "number") {
      this.selectBoxOptions.minBottomMargin = _SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN;
    } else if (this.selectBoxOptions.minBottomMargin < 0) {
      this.selectBoxOptions.minBottomMargin = 0;
    }
    this.selectElement = document.createElement("select");
    this.selectElement.className = "monaco-select-box";
    if (typeof this.selectBoxOptions.ariaLabel === "string") {
      this.selectElement.setAttribute("aria-label", this.selectBoxOptions.ariaLabel);
    }
    if (typeof this.selectBoxOptions.ariaDescription === "string") {
      this.selectElement.setAttribute("aria-description", this.selectBoxOptions.ariaDescription);
    }
    this._onDidSelect = new Emitter();
    this._register(this._onDidSelect);
    this.registerListeners();
    this.constructSelectDropDown(contextViewProvider);
    this.selected = selected || 0;
    if (options3) {
      this.setOptions(options3, selected);
    }
    this.initStyleSheet();
  }
  static {
    this.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN = 32;
  }
  static {
    this.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN = 2;
  }
  static {
    this.DEFAULT_MINIMUM_VISIBLE_OPTIONS = 3;
  }
  setTitle(title) {
    if (!this._hover && title) {
      this._hover = this._register(getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this.selectElement, title));
    } else if (this._hover) {
      this._hover.update(title);
    }
  }
  // IDelegate - List renderer
  getHeight(_element) {
    return SELECT_OPTION_HEIGHT;
  }
  getTemplateId() {
    return SELECT_OPTION_ENTRY_TEMPLATE_ID;
  }
  constructSelectDropDown(contextViewProvider) {
    this.contextViewProvider = contextViewProvider;
    this.selectDropDownContainer = $(".monaco-select-box-dropdown-container");
    this.selectionDetailsPane = append(this.selectDropDownContainer, $3(".select-box-details-pane"));
    const widthControlOuterDiv = append(this.selectDropDownContainer, $3(".select-box-dropdown-container-width-control"));
    const widthControlInnerDiv = append(widthControlOuterDiv, $3(".width-control-div"));
    this.widthControlElement = document.createElement("span");
    this.widthControlElement.className = "option-text-width-control";
    append(widthControlInnerDiv, this.widthControlElement);
    this._dropDownPosition = 0 /* BELOW */;
    this.styleElement = createStyleSheet(this.selectDropDownContainer);
    this.selectDropDownContainer.setAttribute("draggable", "true");
    this._register(addDisposableListener(this.selectDropDownContainer, EventType.DRAG_START, (e) => {
      EventHelper.stop(e, true);
    }));
  }
  registerListeners() {
    this._register(addStandardDisposableListener(this.selectElement, "change", (e) => {
      this.selected = e.target.selectedIndex;
      this._onDidSelect.fire({
        index: e.target.selectedIndex,
        selected: e.target.value
      });
      if (!!this.options[this.selected] && !!this.options[this.selected].text) {
        this.setTitle(this.options[this.selected].text);
      }
    }));
    this._register(addDisposableListener(this.selectElement, EventType.CLICK, (e) => {
      EventHelper.stop(e);
      if (this._isVisible) {
        this.cancelSelectDropDown(true);
      } else {
        this.showSelectDropDown();
      }
    }));
    this._register(addDisposableListener(this.selectElement, EventType.MOUSE_DOWN, (e) => {
      EventHelper.stop(e);
    }));
    let listIsVisibleOnTouchStart;
    this._register(addDisposableListener(this.selectElement, "touchstart", (e) => {
      listIsVisibleOnTouchStart = this._isVisible;
    }));
    this._register(addDisposableListener(this.selectElement, "touchend", (e) => {
      EventHelper.stop(e);
      if (listIsVisibleOnTouchStart) {
        this.cancelSelectDropDown(true);
      } else {
        this.showSelectDropDown();
      }
    }));
    this._register(addDisposableListener(this.selectElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      let showDropDown = false;
      if (isMacintosh) {
        if (event.keyCode === 18 /* DownArrow */ || event.keyCode === 16 /* UpArrow */ || event.keyCode === 10 /* Space */ || event.keyCode === 3 /* Enter */) {
          showDropDown = true;
        }
      } else {
        if (event.keyCode === 18 /* DownArrow */ && event.altKey || event.keyCode === 16 /* UpArrow */ && event.altKey || event.keyCode === 10 /* Space */ || event.keyCode === 3 /* Enter */) {
          showDropDown = true;
        }
      }
      if (showDropDown) {
        this.showSelectDropDown();
        EventHelper.stop(e, true);
      }
    }));
  }
  get onDidSelect() {
    return this._onDidSelect.event;
  }
  setOptions(options3, selected) {
    if (!equals(this.options, options3)) {
      this.options = options3;
      this.selectElement.options.length = 0;
      this._hasDetails = false;
      this._cachedMaxDetailsHeight = void 0;
      this.options.forEach((option2, index2) => {
        this.selectElement.add(this.createOption(option2.text, index2, option2.isDisabled));
        if (typeof option2.description === "string" && !this.selectBoxOptions.showOptionDescriptionHovers) {
          this._hasDetails = true;
        }
      });
    }
    if (selected !== void 0) {
      this.select(selected);
      this._currentSelection = this.selected;
    }
  }
  setEnabled(enable) {
    this.selectElement.disabled = !enable;
  }
  setOptionsList() {
    this.listOptionIndexes = [];
    for (let index2 = 0; index2 < this.options.length; index2++) {
      if (!this.selectBoxOptions.hideDisabledOptions || !this.options[index2].isDisabled) {
        this.listOptionIndexes.push(index2);
      }
    }
    this.selectList?.splice(0, this.selectList.length, this.listOptionIndexes.map((index2) => this.options[index2]));
  }
  getListIndex(optionIndex) {
    return this.listOptionIndexes.indexOf(optionIndex);
  }
  getOptionIndex(listIndex) {
    return this.listOptionIndexes[listIndex];
  }
  focusOption(optionIndex) {
    const listIndex = this.getListIndex(optionIndex);
    if (listIndex >= 0) {
      this.selectList.reveal(listIndex);
      this.selectList.setFocus([listIndex]);
    }
  }
  select(index2) {
    if (index2 >= 0 && index2 < this.options.length) {
      this.selected = index2;
    } else if (index2 > this.options.length - 1) {
      this.select(this.options.length - 1);
    } else if (this.selected < 0) {
      this.selected = 0;
    }
    this.selectElement.selectedIndex = this.selected;
    if (!!this.options[this.selected] && !!this.options[this.selected].text) {
      this.setTitle(this.options[this.selected].text);
    }
  }
  setAriaLabel(label3) {
    this.selectBoxOptions.ariaLabel = label3;
    this.selectElement.setAttribute("aria-label", this.selectBoxOptions.ariaLabel);
  }
  focus() {
    if (this.selectElement) {
      this.selectElement.tabIndex = 0;
      this.selectElement.focus();
    }
  }
  blur() {
    if (this.selectElement) {
      this.selectElement.tabIndex = -1;
      this.selectElement.blur();
    }
  }
  setFocusable(focusable) {
    this.selectElement.tabIndex = focusable ? 0 : -1;
  }
  render(container3) {
    this.container = container3;
    container3.classList.add("select-container");
    container3.appendChild(this.selectElement);
    this.styleSelectElement();
  }
  initStyleSheet() {
    const content2 = [];
    if (this.styles.listFocusBackground) {
      content2.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { background-color: ${this.styles.listFocusBackground} !important; }`);
    }
    if (this.styles.listFocusForeground) {
      content2.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { color: ${this.styles.listFocusForeground} !important; }`);
    }
    if (this.styles.decoratorRightForeground) {
      content2.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.focused) .option-decorator-right { color: ${this.styles.decoratorRightForeground}; }`);
    }
    if (this.styles.selectBackground && this.styles.selectBorder && this.styles.selectBorder !== this.styles.selectBackground) {
      content2.push(`.monaco-select-box-dropdown-container { border: 1px solid ${this.styles.selectBorder} } `);
      content2.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectBorder} } `);
      content2.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectBorder} } `);
    } else if (this.styles.selectListBorder) {
      content2.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectListBorder} } `);
      content2.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectListBorder} } `);
    }
    if (this.styles.listHoverForeground) {
      content2.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { color: ${this.styles.listHoverForeground} !important; }`);
    }
    if (this.styles.listHoverBackground) {
      content2.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { background-color: ${this.styles.listHoverBackground} !important; }`);
    }
    if (this.styles.listFocusOutline) {
      content2.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { outline: 1px solid ${this.styles.listFocusOutline} !important; outline-offset: -1px !important; }`);
    }
    if (this.styles.listHoverOutline) {
      content2.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { outline: 1px solid ${this.styles.listHoverOutline} !important; outline-offset: -1px !important; }`);
    }
    content2.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled.focused { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
    content2.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled:hover { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
    this.styleElement.textContent = content2.join("\n");
  }
  styleSelectElement() {
    const background = this.styles.selectBackground ?? "";
    const foreground2 = this.styles.selectForeground ?? "";
    const border = this.styles.selectBorder ?? "";
    this.selectElement.style.backgroundColor = background;
    this.selectElement.style.color = foreground2;
    this.selectElement.style.borderColor = border;
  }
  styleList() {
    const background = this.styles.selectBackground ?? "";
    const listBackground = asCssValueWithDefault(this.styles.selectListBackground, background);
    this.selectDropDownContainer.style.backgroundColor = listBackground;
    this.selectDropDownListContainer.style.backgroundColor = listBackground;
    this.selectionDetailsPane.style.backgroundColor = listBackground;
    this.selectList.style(this.styles);
  }
  createOption(value2, index2, disabled) {
    const option2 = document.createElement("option");
    option2.value = value2;
    option2.text = value2;
    option2.disabled = !!disabled;
    return option2;
  }
  // ContextView dropdown methods
  showSelectDropDown() {
    this.selectionDetailsPane.textContent = "";
    if (!this.contextViewProvider || this._isVisible) {
      return;
    }
    this.createSelectList(this.selectDropDownContainer);
    this.setOptionsList();
    this._currentSelection = this.selected;
    this.contextViewProvider.showContextView({
      getAnchor: () => this.selectElement,
      render: (container3) => this.renderSelectDropDown(container3, true),
      layout: () => {
        this.layoutSelectDropDown();
      },
      onHide: () => {
        this.selectDropDownContainer.classList.remove("visible");
      },
      anchorPosition: this._dropDownPosition
    }, this.selectBoxOptions.optionsAsChildren ? this.container : void 0);
    this._isVisible = true;
    this.hideSelectDropDown(false);
    this.contextViewProvider.showContextView({
      getAnchor: () => this.selectElement,
      render: (container3) => this.renderSelectDropDown(container3),
      layout: () => this.layoutSelectDropDown(),
      onHide: () => {
        this.selectDropDownContainer.classList.remove("visible");
      },
      anchorPosition: this._dropDownPosition
    }, this.selectBoxOptions.optionsAsChildren ? this.container : void 0);
    this._isVisible = true;
    this.selectElement.setAttribute("aria-expanded", "true");
    const focusedListIndex = this.selectList.getFocus()[0];
    if (focusedListIndex !== void 0) {
      this.showOptionDescriptionHover(focusedListIndex);
    }
  }
  hideSelectDropDown(focusSelect) {
    if (!this.contextViewProvider || !this._isVisible) {
      return;
    }
    this._isVisible = false;
    this._optionDescriptionHover.clear();
    this.selectElement.setAttribute("aria-expanded", "false");
    if (focusSelect) {
      this.selectElement.focus();
    }
    this.contextViewProvider.hideContextView();
  }
  cancelSelectDropDown(focusSelect) {
    this.select(this._currentSelection);
    this.hideSelectDropDown(focusSelect);
  }
  renderSelectDropDown(container3, preLayoutPosition) {
    container3.appendChild(this.selectDropDownContainer);
    const computedFontSize = getWindow(this.selectElement).getComputedStyle(this.selectElement).fontSize;
    if (computedFontSize) {
      this.selectDropDownContainer.style.fontSize = computedFontSize;
    }
    this.layoutSelectDropDown(preLayoutPosition);
    return {
      dispose: () => {
        this.selectDropDownContainer.remove();
      }
    };
  }
  // Iterate over detailed descriptions, find max height
  measureMaxDetailsHeight() {
    let maxDetailsPaneHeight = 0;
    this.options.forEach((_option, index2) => {
      this.updateDetail(index2);
      if (this.selectionDetailsPane.offsetHeight > maxDetailsPaneHeight) {
        maxDetailsPaneHeight = this.selectionDetailsPane.offsetHeight;
      }
    });
    return maxDetailsPaneHeight;
  }
  layoutSelectDropDown(preLayoutPosition) {
    if (this._skipLayout) {
      return false;
    }
    if (this.selectList) {
      this.selectDropDownContainer.classList.add("visible");
      const window2 = getWindow(this.selectElement);
      const selectPosition = getDomNodePagePosition(this.selectElement);
      const maxSelectDropDownHeightBelow = window2.innerHeight - selectPosition.top - selectPosition.height - (this.selectBoxOptions.minBottomMargin || 0);
      const maxSelectDropDownHeightAbove = selectPosition.top - _SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN;
      const selectWidth = this.selectElement.offsetWidth;
      const selectMinWidth = this.setWidthControlElement(this.widthControlElement);
      const selectOptimalWidth = `${Math.max(selectMinWidth, Math.round(selectWidth))}px`;
      this.selectDropDownContainer.style.width = selectOptimalWidth;
      this.selectList.getHTMLElement().style.height = "";
      this.selectList.layout();
      let listHeight = this.selectList.contentHeight;
      if (this._hasDetails && this._cachedMaxDetailsHeight === void 0) {
        this._cachedMaxDetailsHeight = this.measureMaxDetailsHeight();
      }
      const maxDetailsPaneHeight = this._hasDetails ? this._cachedMaxDetailsHeight : 0;
      const minRequiredDropDownHeight = listHeight + maxDetailsPaneHeight;
      const maxVisibleOptionsBelow = Math.floor((maxSelectDropDownHeightBelow - maxDetailsPaneHeight) / SELECT_OPTION_HEIGHT);
      const maxVisibleOptionsAbove = Math.floor((maxSelectDropDownHeightAbove - maxDetailsPaneHeight) / SELECT_OPTION_HEIGHT);
      if (preLayoutPosition) {
        if (selectPosition.top + selectPosition.height > window2.innerHeight - 22 || selectPosition.top < _SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN || maxVisibleOptionsBelow < 1 && maxVisibleOptionsAbove < 1) {
          return false;
        }
        if (maxVisibleOptionsBelow < _SelectBoxList.DEFAULT_MINIMUM_VISIBLE_OPTIONS && maxVisibleOptionsAbove > maxVisibleOptionsBelow && this.selectList.length > maxVisibleOptionsBelow) {
          this._dropDownPosition = 1 /* ABOVE */;
          this.selectDropDownListContainer.remove();
          this.selectionDetailsPane.remove();
          this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
          this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
          this.selectionDetailsPane.classList.remove("border-top");
          this.selectionDetailsPane.classList.add("border-bottom");
        } else {
          this._dropDownPosition = 0 /* BELOW */;
          this.selectDropDownListContainer.remove();
          this.selectionDetailsPane.remove();
          this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
          this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
          this.selectionDetailsPane.classList.remove("border-bottom");
          this.selectionDetailsPane.classList.add("border-top");
        }
        return true;
      }
      if (selectPosition.top + selectPosition.height > window2.innerHeight - 22 || selectPosition.top < _SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN || this._dropDownPosition === 0 /* BELOW */ && maxVisibleOptionsBelow < 1 || this._dropDownPosition === 1 /* ABOVE */ && maxVisibleOptionsAbove < 1) {
        this.hideSelectDropDown(true);
        return false;
      }
      if (this._dropDownPosition === 0 /* BELOW */) {
        if (this._isVisible && maxVisibleOptionsBelow + maxVisibleOptionsAbove < 1) {
          this.hideSelectDropDown(true);
          return false;
        }
        if (minRequiredDropDownHeight > maxSelectDropDownHeightBelow) {
          listHeight = maxVisibleOptionsBelow * SELECT_OPTION_HEIGHT;
        }
      } else {
        if (minRequiredDropDownHeight > maxSelectDropDownHeightAbove) {
          listHeight = maxVisibleOptionsAbove * SELECT_OPTION_HEIGHT;
        }
      }
      this.selectList.layout(listHeight);
      this.selectList.domFocus();
      if (this.selectList.length > 0) {
        let selectedListIndex = this.getListIndex(this.selected);
        if (selectedListIndex < 0) {
          selectedListIndex = 0;
          this.selected = this.getOptionIndex(selectedListIndex);
          this.select(this.selected);
        }
        this.selectList.reveal(selectedListIndex);
        this.selectList.setFocus([selectedListIndex]);
      }
      if (this._hasDetails) {
        this.selectList.getHTMLElement().style.height = `${listHeight}px`;
        this.selectDropDownContainer.style.height = "";
      } else {
        this.selectDropDownContainer.style.height = `${listHeight}px`;
      }
      if (this._hasDetails) {
        this.updateDetail(this.selected);
      } else {
        this.selectionDetailsPane.style.display = "none";
      }
      this.selectDropDownContainer.style.width = selectOptimalWidth;
      this.selectDropDownListContainer.setAttribute("tabindex", "0");
      return true;
    } else {
      return false;
    }
  }
  setWidthControlElement(container3) {
    let elementWidth = 0;
    if (container3) {
      let longest = 0;
      let longestLength = 0;
      this.options.forEach((option2, index2) => {
        const detailLength = !!option2.detail ? option2.detail.length : 0;
        const rightDecoratorLength = !!option2.decoratorRight ? option2.decoratorRight.length : 0;
        const len = option2.text.length + detailLength + rightDecoratorLength;
        if (len > longestLength) {
          longest = index2;
          longestLength = len;
        }
      });
      container3.textContent = this.options[longest].text + (!!this.options[longest].decoratorRight ? `${this.options[longest].decoratorRight} ` : "");
      elementWidth = getTotalWidth(container3);
    }
    return elementWidth;
  }
  createSelectList(parent) {
    if (this.selectList) {
      return;
    }
    this.selectDropDownListContainer = append(parent, $3(".select-box-dropdown-list-container"));
    this.listRenderer = new SelectListRenderer();
    this.selectList = this._register(new List("SelectBoxCustom", this.selectDropDownListContainer, this, [this.listRenderer], {
      useShadows: false,
      verticalScrollMode: 3 /* Visible */,
      keyboardSupport: false,
      mouseSupport: false,
      accessibilityProvider: {
        getAriaLabel: (element) => {
          if (element.isSeparator) {
            return localize(30, null);
          }
          let label3 = element.text;
          if (element.detail) {
            label3 += `. ${element.detail}`;
          }
          if (element.decoratorRight) {
            label3 += `. ${element.decoratorRight}`;
          }
          if (element.description) {
            label3 += `. ${element.description}`;
          }
          return label3;
        },
        getWidgetAriaLabel: () => localize(29, null),
        getRole: () => isMacintosh ? "" : "option",
        getWidgetRole: () => "listbox"
      }
    }));
    if (this.selectBoxOptions.ariaLabel) {
      this.selectList.ariaLabel = this.selectBoxOptions.ariaLabel;
    }
    const onKeyDown = this._register(new DomEmitter(this.selectDropDownListContainer, "keydown"));
    const onSelectDropDownKeyDown = Event2.chain(
      onKeyDown.event,
      ($110) => $110.filter(() => this.selectList.length > 0).map((e) => new StandardKeyboardEvent(e))
    );
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode === 3 /* Enter */))(this.onEnter, this));
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode === 2 /* Tab */))(this.onEnter, this));
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode === 9 /* Escape */))(this.onEscape, this));
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode === 16 /* UpArrow */))(this.onUpArrow, this));
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode === 18 /* DownArrow */))(this.onDownArrow, this));
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode === 12 /* PageDown */))(this.onPageDown, this));
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode === 11 /* PageUp */))(this.onPageUp, this));
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode === 14 /* Home */))(this.onHome, this));
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode === 13 /* End */))(this.onEnd, this));
    this._register(Event2.chain(onSelectDropDownKeyDown, ($110) => $110.filter((e) => e.keyCode >= 21 /* Digit0 */ && e.keyCode <= 56 /* KeyZ */ || e.keyCode >= 85 /* Semicolon */ && e.keyCode <= 113 /* NumpadDivide */))(this.onCharacter, this));
    this._register(addDisposableListener(this.selectList.getHTMLElement(), EventType.POINTER_UP, (e) => this.onPointerUp(e)));
    this._register(this.selectList.onMouseOver((e) => typeof e.index !== "undefined" && !e.element?.isDisabled && this.selectList.setFocus([e.index])));
    this._register(this.selectList.onDidChangeFocus((e) => this.onListFocus(e)));
    this._register(addDisposableListener(this.selectDropDownContainer, EventType.FOCUS_OUT, (e) => {
      if (!this._isVisible || isAncestor(e.relatedTarget, this.selectDropDownContainer)) {
        return;
      }
      this.onListBlur();
    }));
    this.selectList.getHTMLElement().setAttribute("aria-label", this.selectBoxOptions.ariaLabel || "");
    this.selectList.getHTMLElement().setAttribute("aria-expanded", "true");
    this.styleList();
  }
  // List methods
  // List mouse controller - active exit, select option, fire onDidSelect if change, return focus to parent select
  // Also takes in touchend events
  onPointerUp(e) {
    if (!this.selectList.length) {
      return;
    }
    EventHelper.stop(e);
    const target = e.target;
    if (!target) {
      return;
    }
    if (target.classList.contains("slider")) {
      return;
    }
    const listRowElement = target.closest(".monaco-list-row");
    if (!listRowElement) {
      return;
    }
    const index2 = this.getOptionIndex(Number(listRowElement.getAttribute("data-index")));
    const disabled = listRowElement.classList.contains("option-disabled");
    if (index2 >= 0 && index2 < this.options.length && !disabled) {
      this.selected = index2;
      this.select(this.selected);
      this.focusOption(this.selected);
      if (this.selected !== this._currentSelection) {
        this._currentSelection = this.selected;
        this._onDidSelect.fire({
          index: this.selectElement.selectedIndex,
          selected: this.options[this.selected].text
        });
        if (!!this.options[this.selected] && !!this.options[this.selected].text) {
          this.setTitle(this.options[this.selected].text);
        }
      }
      this.hideSelectDropDown(true);
    }
  }
  // List Exit - passive - implicit no selection change, hide drop-down
  onListBlur() {
    if (this._sticky) {
      return;
    }
    this.cancelSelectDropDown(false);
  }
  renderDescriptionMarkdown(text2, actionHandler) {
    const cleanRenderedMarkdown2 = (element) => {
      for (let i2 = 0; i2 < element.childNodes.length; i2++) {
        const child = element.childNodes.item(i2);
        const tagName = child.tagName && child.tagName.toLowerCase();
        if (tagName === "img") {
          child.remove();
        } else {
          cleanRenderedMarkdown2(child);
        }
      }
    };
    const rendered = renderMarkdown({ value: text2, supportThemeIcons: true }, { actionHandler });
    rendered.element.classList.add("select-box-description-markdown");
    cleanRenderedMarkdown2(rendered.element);
    return rendered;
  }
  // List Focus Change - passive - update details pane with newly focused element's data
  onListFocus(e) {
    if (!this._isVisible) {
      return;
    }
    const listIndex = e.indexes[0];
    const optionIndex = this.getOptionIndex(listIndex);
    if (this._hasDetails) {
      this.updateDetail(optionIndex);
    }
    this.showOptionDescriptionHover(listIndex);
  }
  showOptionDescriptionHover(listIndex) {
    if (!this.selectBoxOptions.showOptionDescriptionHovers) {
      return;
    }
    const option2 = this.options[this.getOptionIndex(listIndex)];
    const description = option2?.description;
    const target = option2 ? this.listRenderer.getElement(option2) : void 0;
    this._optionDescriptionHover.value = description && target ? getBaseLayerHoverDelegate().showDelayedHover({
      content: description,
      target,
      position: { hoverPosition: 1 /* RIGHT */ }
    }, { groupId: "select-box-option-description" }) : void 0;
  }
  updateDetail(selectedIndex) {
    this._selectionDetailsDisposables.clear();
    this.selectionDetailsPane.textContent = "";
    const option2 = this.options[selectedIndex];
    const description = option2?.description ?? "";
    const descriptionIsMarkdown = option2?.descriptionIsMarkdown ?? false;
    if (description) {
      if (descriptionIsMarkdown) {
        const actionHandler = option2.descriptionMarkdownActionHandler;
        const result = this._selectionDetailsDisposables.add(this.renderDescriptionMarkdown(description, actionHandler));
        this.selectionDetailsPane.appendChild(result.element);
      } else {
        this.selectionDetailsPane.textContent = description;
      }
      this.selectionDetailsPane.style.display = "block";
    } else {
      this.selectionDetailsPane.style.display = "none";
    }
    this._skipLayout = true;
    this.contextViewProvider.layout();
    this._skipLayout = false;
  }
  // List keyboard controller
  // List exit - active - hide ContextView dropdown, reset selection, return focus to parent select
  onEscape(e) {
    EventHelper.stop(e);
    this.cancelSelectDropDown(true);
  }
  // List exit - active - hide ContextView dropdown, return focus to parent select, fire onDidSelect if change
  onEnter(e) {
    EventHelper.stop(e);
    if (this.options[this.selected]?.isDisabled) {
      this.hideSelectDropDown(true);
      return;
    }
    if (this.selected !== this._currentSelection) {
      this._currentSelection = this.selected;
      this._onDidSelect.fire({
        index: this.selectElement.selectedIndex,
        selected: this.options[this.selected].text
      });
      if (!!this.options[this.selected] && !!this.options[this.selected].text) {
        this.setTitle(this.options[this.selected].text);
      }
    }
    this.hideSelectDropDown(true);
  }
  // List navigation - have to handle disabled options (jump over)
  onDownArrow(e) {
    if (this.selected < this.options.length - 1) {
      EventHelper.stop(e, true);
      let next = this.selected + 1;
      while (next < this.options.length && this.options[next].isDisabled) {
        next++;
      }
      if (next >= this.options.length) {
        return;
      }
      this.selected = next;
      this.select(this.selected);
      this.focusOption(this.selected);
    }
  }
  onUpArrow(e) {
    if (this.selected > 0) {
      EventHelper.stop(e, true);
      let prev = this.selected - 1;
      while (prev >= 0 && this.options[prev].isDisabled) {
        prev--;
      }
      if (prev < 0) {
        return;
      }
      this.selected = prev;
      this.select(this.selected);
      this.focusOption(this.selected);
    }
  }
  onPageUp(e) {
    EventHelper.stop(e);
    this.selectList.focusPreviousPage();
    setTimeout(() => {
      let candidate = this.selectList.getFocus()[0];
      while (candidate > 0 && this.options[this.getOptionIndex(candidate)].isDisabled) {
        candidate--;
      }
      const optionIndex = this.getOptionIndex(candidate);
      if (this.options[optionIndex].isDisabled) {
        return;
      }
      this.selected = optionIndex;
      this.selectList.reveal(candidate);
      this.selectList.setFocus([candidate]);
      this.select(this.selected);
    }, 1);
  }
  onPageDown(e) {
    EventHelper.stop(e);
    this.selectList.focusNextPage();
    setTimeout(() => {
      let candidate = this.selectList.getFocus()[0];
      while (candidate < this.selectList.length - 1 && this.options[this.getOptionIndex(candidate)].isDisabled) {
        candidate++;
      }
      const optionIndex = this.getOptionIndex(candidate);
      if (this.options[optionIndex].isDisabled) {
        return;
      }
      this.selected = optionIndex;
      this.selectList.reveal(candidate);
      this.selectList.setFocus([candidate]);
      this.select(this.selected);
    }, 1);
  }
  onHome(e) {
    EventHelper.stop(e);
    if (this.options.length < 2) {
      return;
    }
    let candidate = 0;
    while (candidate < this.options.length - 1 && this.options[candidate].isDisabled) {
      candidate++;
    }
    if (this.options[candidate].isDisabled) {
      return;
    }
    this.selected = candidate;
    this.focusOption(this.selected);
    this.select(this.selected);
  }
  onEnd(e) {
    EventHelper.stop(e);
    if (this.options.length < 2) {
      return;
    }
    let candidate = this.options.length - 1;
    while (candidate > 0 && this.options[candidate].isDisabled) {
      candidate--;
    }
    if (this.options[candidate].isDisabled) {
      return;
    }
    this.selected = candidate;
    this.focusOption(this.selected);
    this.select(this.selected);
  }
  // Mimic option first character navigation of native select
  onCharacter(e) {
    const ch = KeyCodeUtils.toString(e.keyCode);
    let optionIndex = -1;
    for (let i2 = 0; i2 < this.options.length - 1; i2++) {
      optionIndex = (i2 + this.selected + 1) % this.options.length;
      if (this.options[optionIndex].text.charAt(0).toUpperCase() === ch && !this.options[optionIndex].isDisabled) {
        this.select(optionIndex);
        this.focusOption(optionIndex);
        EventHelper.stop(e);
        break;
      }
    }
  }
  dispose() {
    this.hideSelectDropDown(false);
    super.dispose();
  }
};
export { $3, SELECT_OPTION_ENTRY_TEMPLATE_ID, SELECT_OPTION_HEIGHT, SelectListRenderer, SelectBoxList };
