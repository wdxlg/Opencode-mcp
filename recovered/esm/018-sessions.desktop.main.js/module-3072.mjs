// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/icons/iconSelectBox.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { InputBox } from "./module-0600.mjs";
import { localize } from "./module-0001.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { alert } from "./module-0076.mjs";


// src/vs/base/browser/ui/icons/iconSelectBox.ts
var IconSelectBox = class _IconSelectBox extends Disposable {
  constructor(options3) {
    super();
    this.options = options3;
    this.domId = `icon_select_box_id_${++_IconSelectBox.InstanceCount}`;
    this._onDidSelect = this._register(new Emitter());
    this.onDidSelect = this._onDidSelect.event;
    this.renderedIcons = [];
    this.focusedItemIndex = 0;
    this.numberOfElementsPerRow = 1;
    this.iconContainerWidth = 36;
    this.iconContainerHeight = 36;
    this.domNode = $(".icon-select-box");
    this._register(this.create());
  }
  static {
    this.InstanceCount = 0;
  }
  create() {
    const disposables = new DisposableStore();
    const iconSelectBoxContainer = append(this.domNode, $(".icon-select-box-container"));
    iconSelectBoxContainer.style.margin = "10px 15px";
    const iconSelectInputContainer = append(iconSelectBoxContainer, $(".icon-select-input-container"));
    iconSelectInputContainer.style.paddingBottom = "10px";
    this.inputBox = disposables.add(new InputBox(iconSelectInputContainer, void 0, {
      placeholder: localize(18, null),
      inputBoxStyles: this.options.inputBoxStyles
    }));
    const iconsContainer = this.iconsContainer = $(".icon-select-icons-container", { id: `${this.domId}_icons` });
    iconsContainer.role = "listbox";
    iconsContainer.tabIndex = 0;
    this.scrollableElement = disposables.add(new DomScrollableElement(iconsContainer, {
      useShadows: false,
      horizontal: 2 /* Hidden */
    }));
    append(iconSelectBoxContainer, this.scrollableElement.getDomNode());
    if (this.options.showIconInfo) {
      this.iconIdElement = this._register(new HighlightedLabel(append(append(iconSelectBoxContainer, $(".icon-select-id-container")), $(".icon-select-id-label"))));
    }
    const iconsDisposables = disposables.add(new MutableDisposable());
    iconsDisposables.value = this.renderIcons(this.options.icons, [], iconsContainer);
    this.scrollableElement.scanDomNode();
    disposables.add(this.inputBox.onDidChange((value2) => {
      const icons2 = [], matches2 = [];
      for (const icon2 of this.options.icons) {
        const match2 = this.matchesContiguous(value2, icon2.id);
        if (match2) {
          icons2.push(icon2);
          matches2.push(match2);
        }
      }
      if (icons2.length) {
        iconsDisposables.value = this.renderIcons(icons2, matches2, iconsContainer);
        this.scrollableElement?.scanDomNode();
      }
    }));
    this.inputBox.inputElement.role = "combobox";
    this.inputBox.inputElement.ariaHasPopup = "menu";
    this.inputBox.inputElement.ariaAutoComplete = "list";
    this.inputBox.inputElement.ariaExpanded = "true";
    this.inputBox.inputElement.setAttribute("aria-controls", iconsContainer.id);
    return disposables;
  }
  renderIcons(icons2, matches2, container2) {
    const disposables = new DisposableStore();
    clearNode(container2);
    const focusedIcon = this.renderedIcons[this.focusedItemIndex]?.icon;
    let focusedIconIndex = 0;
    const renderedIcons = [];
    if (icons2.length) {
      for (let index2 = 0; index2 < icons2.length; index2++) {
        const icon2 = icons2[index2];
        const iconContainer = append(container2, $(".icon-container", { id: `${this.domId}_icons_${index2}` }));
        iconContainer.style.width = `${this.iconContainerWidth}px`;
        iconContainer.style.height = `${this.iconContainerHeight}px`;
        iconContainer.title = icon2.id;
        iconContainer.role = "button";
        iconContainer.setAttribute("aria-setsize", `${icons2.length}`);
        iconContainer.setAttribute("aria-posinset", `${index2 + 1}`);
        append(iconContainer, $(ThemeIcon.asCSSSelector(icon2)));
        renderedIcons.push({ icon: icon2, element: iconContainer, highlightMatches: matches2[index2] });
        disposables.add(addDisposableListener(iconContainer, EventType.CLICK, (e4) => {
          e4.stopPropagation();
          this.setSelection(index2);
        }));
        if (icon2 === focusedIcon) {
          focusedIconIndex = index2;
        }
      }
    } else {
      const noResults = localize(17, null);
      append(container2, $(".icon-no-results", void 0, noResults));
      alert(noResults);
    }
    this.renderedIcons.splice(0, this.renderedIcons.length, ...renderedIcons);
    this.focusIcon(focusedIconIndex);
    return disposables;
  }
  focusIcon(index2) {
    const existing = this.renderedIcons[this.focusedItemIndex];
    if (existing) {
      existing.element.classList.remove("focused");
    }
    this.focusedItemIndex = index2;
    const renderedItem = this.renderedIcons[index2];
    if (renderedItem) {
      renderedItem.element.classList.add("focused");
    }
    if (this.inputBox) {
      if (renderedItem) {
        this.inputBox.inputElement.setAttribute("aria-activedescendant", renderedItem.element.id);
      } else {
        this.inputBox.inputElement.removeAttribute("aria-activedescendant");
      }
    }
    if (this.iconIdElement) {
      if (renderedItem) {
        this.iconIdElement.set(renderedItem.icon.id, renderedItem.highlightMatches);
      } else {
        this.iconIdElement.set("");
      }
    }
    this.reveal(index2);
  }
  reveal(index2) {
    if (!this.scrollableElement) {
      return;
    }
    if (index2 < 0 || index2 >= this.renderedIcons.length) {
      return;
    }
    const element = this.renderedIcons[index2].element;
    if (!element) {
      return;
    }
    const { height } = this.scrollableElement.getScrollDimensions();
    const { scrollTop } = this.scrollableElement.getScrollPosition();
    if (element.offsetTop + this.iconContainerHeight > scrollTop + height) {
      this.scrollableElement.setScrollPosition({ scrollTop: element.offsetTop + this.iconContainerHeight - height });
    } else if (element.offsetTop < scrollTop) {
      this.scrollableElement.setScrollPosition({ scrollTop: element.offsetTop });
    }
  }
  matchesContiguous(word, wordToMatchAgainst) {
    const matchIndex = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
    if (matchIndex !== -1) {
      return [{ start: matchIndex, end: matchIndex + word.length }];
    }
    return null;
  }
  layout(dimension) {
    this.domNode.style.width = `${dimension.width}px`;
    this.domNode.style.height = `${dimension.height}px`;
    const iconsContainerWidth = dimension.width - 30;
    this.numberOfElementsPerRow = Math.floor(iconsContainerWidth / this.iconContainerWidth);
    if (this.numberOfElementsPerRow === 0) {
      throw new Error("Insufficient width");
    }
    const extraSpace = iconsContainerWidth % this.iconContainerWidth;
    const iconElementMargin = Math.floor(extraSpace / this.numberOfElementsPerRow);
    for (const { element } of this.renderedIcons) {
      element.style.marginRight = `${iconElementMargin}px`;
    }
    const containerPadding = extraSpace % this.numberOfElementsPerRow;
    if (this.iconsContainer) {
      this.iconsContainer.style.paddingLeft = `${Math.floor(containerPadding / 2)}px`;
      this.iconsContainer.style.paddingRight = `${Math.ceil(containerPadding / 2)}px`;
    }
    if (this.scrollableElement) {
      this.scrollableElement.getDomNode().style.height = `${this.iconIdElement ? dimension.height - 80 : dimension.height - 40}px`;
      this.scrollableElement.scanDomNode();
    }
  }
  getFocus() {
    return [this.focusedItemIndex];
  }
  setSelection(index2) {
    if (index2 < 0 || index2 >= this.renderedIcons.length) {
      throw new Error(`Invalid index ${index2}`);
    }
    this.focusIcon(index2);
    this._onDidSelect.fire(this.renderedIcons[index2].icon);
  }
  clearInput() {
    if (this.inputBox) {
      this.inputBox.value = "";
    }
  }
  focus() {
    this.inputBox?.focus();
    this.focusIcon(0);
  }
  focusNext() {
    this.focusIcon((this.focusedItemIndex + 1) % this.renderedIcons.length);
  }
  focusPrevious() {
    this.focusIcon((this.focusedItemIndex - 1 + this.renderedIcons.length) % this.renderedIcons.length);
  }
  focusNextRow() {
    let nextRowIndex = this.focusedItemIndex + this.numberOfElementsPerRow;
    if (nextRowIndex >= this.renderedIcons.length) {
      nextRowIndex = (nextRowIndex + 1) % this.numberOfElementsPerRow;
      nextRowIndex = nextRowIndex >= this.renderedIcons.length ? 0 : nextRowIndex;
    }
    this.focusIcon(nextRowIndex);
  }
  focusPreviousRow() {
    let previousRowIndex = this.focusedItemIndex - this.numberOfElementsPerRow;
    if (previousRowIndex < 0) {
      const numberOfRows = Math.floor(this.renderedIcons.length / this.numberOfElementsPerRow);
      previousRowIndex = this.focusedItemIndex + this.numberOfElementsPerRow * numberOfRows - 1;
      previousRowIndex = previousRowIndex < 0 ? this.renderedIcons.length - 1 : previousRowIndex >= this.renderedIcons.length ? previousRowIndex - this.numberOfElementsPerRow : previousRowIndex;
    }
    this.focusIcon(previousRowIndex);
  }
  getFocusedIcon() {
    return this.renderedIcons[this.focusedItemIndex].icon;
  }
};
export { IconSelectBox };
