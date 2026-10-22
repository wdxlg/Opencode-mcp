// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/inputbox/inputBox.ts
import { $, DisposableResizeObserver, append, getTotalHeight, getTotalWidth, getWindow, isActiveElement } from "./module-0075.mjs";
import { Widget } from "./module-0252.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ScrollableElement } from "./module-0259.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { ActionBar } from "./module-0477.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { equals4 } from "./module-0098.mjs";
import { asCssValueWithDefault } from "./module-0449.mjs";
import { renderFormattedText, renderText } from "./module-0597.mjs";
import { localize } from "./module-0001.mjs";
import { alert, status } from "./module-0076.mjs";
import { HistoryNavigator } from "./module-0599.mjs";


// src/vs/base/browser/ui/inputbox/inputBox.ts
var $6 = $;

var unthemedInboxStyles = {
  inputBackground: "#3C3C3C",
  inputForeground: "#CCCCCC",
  inputValidationInfoBorder: "#55AAFF",
  inputValidationInfoBackground: "#063B49",
  inputValidationWarningBorder: "#B89500",
  inputValidationWarningBackground: "#352A05",
  inputValidationErrorBorder: "#BE1100",
  inputValidationErrorBackground: "#5A1D1D",
  inputBorder: void 0,
  inputValidationErrorForeground: void 0,
  inputValidationInfoForeground: void 0,
  inputValidationWarningForeground: void 0
};

var InputBox = class extends Widget {
  constructor(container3, contextViewProvider, options3) {
    super();
    this.state = "idle";
    this.maxHeight = Number.POSITIVE_INFINITY;
    this.hover = this._register(new MutableDisposable());
    this.messageResizeObserver = this._register(new MutableDisposable());
    this._onDidChange = this._register(new Emitter());
    this._onDidHeightChange = this._register(new Emitter());
    this.contextViewProvider = contextViewProvider;
    this.options = options3;
    this.message = null;
    this.placeholder = this.options.placeholder || "";
    this.tooltip = this.options.tooltip ?? (this.placeholder || "");
    this.ariaLabel = this.options.ariaLabel || "";
    if (this.options.validationOptions) {
      this.validation = this.options.validationOptions.validation;
    }
    this.element = append(container3, $6(".monaco-inputbox.idle"));
    const tagName = this.options.flexibleHeight ? "textarea" : "input";
    const wrapper = append(this.element, $6(".ibwrapper"));
    this.input = append(wrapper, $6(tagName + ".input.empty"));
    this.input.setAttribute("autocorrect", "off");
    this.input.setAttribute("autocapitalize", "off");
    this.input.setAttribute("spellcheck", "false");
    this.onfocus(this.input, () => this.element.classList.add("synthetic-focus"));
    this.onblur(this.input, () => this.element.classList.remove("synthetic-focus"));
    if (this.options.flexibleHeight) {
      this.maxHeight = typeof this.options.flexibleMaxHeight === "number" ? this.options.flexibleMaxHeight : Number.POSITIVE_INFINITY;
      this.mirror = append(wrapper, $6("div.mirror"));
      this.mirror.innerText = "\xA0";
      this.scrollableElement = new ScrollableElement(this.element, { vertical: 1 /* Auto */ });
      if (this.options.flexibleWidth) {
        this.input.setAttribute("wrap", "off");
        this.mirror.style.whiteSpace = "pre";
        this.mirror.style.wordWrap = "initial";
      }
      append(container3, this.scrollableElement.getDomNode());
      this._register(this.scrollableElement);
      this._register(this.scrollableElement.onScroll((e) => this.input.scrollTop = e.scrollTop));
      const onSelectionChange = this._register(new DomEmitter(container3.ownerDocument, "selectionchange"));
      const onAnchoredSelectionChange = Event2.filter(onSelectionChange.event, () => {
        const selection = container3.ownerDocument.getSelection();
        return selection?.anchorNode === wrapper;
      });
      this._register(onAnchoredSelectionChange(this.updateScrollDimensions, this));
      this._register(this.onDidHeightChange(this.updateScrollDimensions, this));
    } else {
      this.input.type = this.options.type || "text";
      this.input.setAttribute("wrap", "off");
    }
    if (this.ariaLabel) {
      this.input.setAttribute("aria-label", this.ariaLabel);
    }
    if (this.placeholder && !this.options.showPlaceholderOnFocus) {
      this.setPlaceHolder(this.placeholder);
    }
    if (this.tooltip) {
      this.setTooltip(this.tooltip);
    }
    this.oninput(this.input, () => this.onValueChange());
    this.onblur(this.input, () => this.onBlur());
    this.onfocus(this.input, () => this.onFocus());
    this._register(this.ignoreGesture(this.input));
    setTimeout(() => this.updateMirror(), 0);
    if (this.options.actions) {
      this.actionbar = this._register(new ActionBar(this.element, {
        actionViewItemProvider: this.options.actionViewItemProvider
      }));
      this.actionbar.push(this.options.actions, { icon: true, label: false });
    }
    this.applyStyles();
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get onDidHeightChange() {
    return this._onDidHeightChange.event;
  }
  setActions(actions, actionViewItemProvider) {
    if (this.actionbar) {
      this.actionbar.clear();
      if (actions) {
        this.actionbar.push(actions, { icon: true, label: false });
      }
    } else if (actions) {
      this.actionbar = this._register(new ActionBar(this.element, {
        actionViewItemProvider: actionViewItemProvider ?? this.options.actionViewItemProvider
      }));
      this.actionbar.push(actions, { icon: true, label: false });
    }
  }
  get actionsWidth() {
    return this.actionbar?.getContainer().offsetWidth ?? 0;
  }
  onBlur() {
    this._hideMessage();
    if (this.options.showPlaceholderOnFocus) {
      this.input.setAttribute("placeholder", "");
    }
  }
  onFocus() {
    this._showMessage();
    if (this.options.showPlaceholderOnFocus) {
      this.input.setAttribute("placeholder", this.placeholder || "");
    }
  }
  setPlaceHolder(placeHolder) {
    this.placeholder = placeHolder;
    this.input.setAttribute("placeholder", placeHolder);
  }
  setTooltip(tooltip) {
    this.tooltip = tooltip;
    if (!this.hover.value) {
      this.hover.value = this._register(getBaseLayerHoverDelegate().setupDelayedHoverAtMouse(this.input, () => ({
        content: this.tooltip,
        appearance: {
          compact: true
        }
      })));
    }
  }
  setAriaLabel(label3) {
    this.ariaLabel = label3;
    if (label3) {
      this.input.setAttribute("aria-label", this.ariaLabel);
    } else {
      this.input.removeAttribute("aria-label");
    }
  }
  getAriaLabel() {
    return this.ariaLabel;
  }
  get mirrorElement() {
    return this.mirror;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(newValue) {
    if (this.input.value !== newValue) {
      this.input.value = newValue;
      this.onValueChange();
    }
  }
  get step() {
    return this.input.step;
  }
  set step(newValue) {
    this.input.step = newValue;
  }
  get height() {
    return typeof this.cachedHeight === "number" ? this.cachedHeight : getTotalHeight(this.element);
  }
  focus() {
    this.input.focus();
  }
  blur() {
    this.input.blur();
  }
  hasFocus() {
    return isActiveElement(this.input);
  }
  select(range2 = null) {
    this.input.select();
    if (range2) {
      this.input.setSelectionRange(range2.start, range2.end);
      if (range2.end === this.input.value.length) {
        this.input.scrollLeft = this.input.scrollWidth;
      }
    }
  }
  isSelectionAtEnd() {
    return this.input.selectionEnd === this.input.value.length && this.input.selectionStart === this.input.selectionEnd;
  }
  getSelection() {
    const selectionStart = this.input.selectionStart;
    if (selectionStart === null) {
      return null;
    }
    const selectionEnd = this.input.selectionEnd ?? selectionStart;
    return {
      start: selectionStart,
      end: selectionEnd
    };
  }
  enable() {
    this.input.removeAttribute("disabled");
  }
  disable() {
    this.blur();
    this.input.disabled = true;
    this._hideMessage();
  }
  setEnabled(enabled) {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }
  get width() {
    return getTotalWidth(this.input);
  }
  set width(width2) {
    if (this.options.flexibleHeight && this.options.flexibleWidth) {
      let horizontalPadding = 0;
      if (this.mirror) {
        const paddingLeft = parseFloat(this.mirror.style.paddingLeft || "") || 0;
        const paddingRight = parseFloat(this.mirror.style.paddingRight || "") || 0;
        horizontalPadding = paddingLeft + paddingRight;
      }
      this.input.style.width = width2 - horizontalPadding + "px";
    } else {
      this.input.style.width = width2 + "px";
    }
    if (this.mirror) {
      this.mirror.style.width = width2 + "px";
    }
  }
  set paddingRight(paddingRight) {
    this.input.style.width = `calc(100% - ${paddingRight}px)`;
    if (this.mirror) {
      this.mirror.style.paddingRight = paddingRight + "px";
    }
  }
  updateScrollDimensions() {
    if (typeof this.cachedContentHeight !== "number" || typeof this.cachedHeight !== "number" || !this.scrollableElement) {
      return;
    }
    const scrollHeight = this.cachedContentHeight;
    const height = this.cachedHeight;
    const scrollTop = this.input.scrollTop;
    this.scrollableElement.setScrollDimensions({ scrollHeight, height });
    this.scrollableElement.setScrollPosition({ scrollTop });
  }
  showMessage(message, force) {
    if (this.state === "open" && equals4(this.message, message)) {
      return;
    }
    this.message = message;
    this.element.classList.remove("idle");
    this.element.classList.remove("info");
    this.element.classList.remove("warning");
    this.element.classList.remove("error");
    this.element.classList.add(this.classForType(message.type));
    const styles = this.stylesForType(this.message.type);
    this.element.style.border = `1px solid ${asCssValueWithDefault(styles.border, "transparent")}`;
    if (this.message.content && (this.hasFocus() || force)) {
      this._showMessage();
    }
  }
  hideMessage() {
    this.message = null;
    this.element.classList.remove("info");
    this.element.classList.remove("warning");
    this.element.classList.remove("error");
    this.element.classList.add("idle");
    this._hideMessage();
    this.applyStyles();
  }
  isInputValid() {
    return !!this.validation && !this.validation(this.value);
  }
  validate() {
    let errorMsg = null;
    if (this.validation) {
      errorMsg = this.validation(this.value);
      if (errorMsg) {
        this.inputElement.setAttribute("aria-invalid", "true");
        this.showMessage(errorMsg);
      } else if (this.inputElement.hasAttribute("aria-invalid")) {
        this.inputElement.removeAttribute("aria-invalid");
        this.hideMessage();
      }
    }
    return errorMsg?.type;
  }
  stylesForType(type) {
    const styles = this.options.inputBoxStyles;
    switch (type) {
      case 1 /* INFO */:
        return { border: styles.inputValidationInfoBorder, background: styles.inputValidationInfoBackground, foreground: styles.inputValidationInfoForeground };
      case 2 /* WARNING */:
        return { border: styles.inputValidationWarningBorder, background: styles.inputValidationWarningBackground, foreground: styles.inputValidationWarningForeground };
      default:
        return { border: styles.inputValidationErrorBorder, background: styles.inputValidationErrorBackground, foreground: styles.inputValidationErrorForeground };
    }
  }
  classForType(type) {
    switch (type) {
      case 1 /* INFO */:
        return "info";
      case 2 /* WARNING */:
        return "warning";
      default:
        return "error";
    }
  }
  _showMessage() {
    if (!this.contextViewProvider || !this.message) {
      return;
    }
    let div;
    const layout2 = () => div.style.width = getTotalWidth(this.element) + "px";
    this.contextViewProvider.showContextView({
      getAnchor: () => this.element,
      anchorAlignment: 1 /* RIGHT */,
      render: (container3) => {
        if (!this.message) {
          return null;
        }
        div = append(container3, $6(".monaco-inputbox-container"));
        layout2();
        const spanElement = $6("span.monaco-inputbox-message");
        if (this.message.formatContent) {
          renderFormattedText(this.message.content, void 0, spanElement);
        } else {
          renderText(this.message.content, void 0, spanElement);
        }
        spanElement.classList.add(this.classForType(this.message.type));
        const styles = this.stylesForType(this.message.type);
        spanElement.style.backgroundColor = styles.background ?? "";
        spanElement.style.color = styles.foreground ?? "";
        spanElement.style.border = styles.border ? `1px solid ${styles.border}` : "";
        append(div, spanElement);
        return null;
      },
      onHide: () => {
        this.state = "closed";
        this.messageResizeObserver.clear();
      },
      layout: layout2
    });
    this.observeElementResize();
    let alertText;
    if (this.message.type === 3 /* ERROR */) {
      alertText = localize(19, null, this.message.content);
    } else if (this.message.type === 2 /* WARNING */) {
      alertText = localize(21, null, this.message.content);
    } else {
      alertText = localize(20, null, this.message.content);
    }
    alert(alertText);
    this.state = "open";
  }
  _hideMessage() {
    if (!this.contextViewProvider) {
      return;
    }
    if (this.state === "open") {
      this.contextViewProvider.hideContextView();
    }
    this.messageResizeObserver.clear();
    this.state = "idle";
  }
  /**
   * Keeps the validation message sized and anchored to the input while the
   * message is showing and the input itself is resized, e.g. because the
   * containing view was resized.
   */
  observeElementResize() {
    const observer = new DisposableResizeObserver("InputBox.validationMessage", () => {
      if (this.element.isConnected && getTotalWidth(this.element) > 0) {
        this.layoutMessage();
      }
    }, getWindow(this.element));
    observer.observe(this.element);
    this.messageResizeObserver.value = observer;
  }
  layoutMessage() {
    if (this.state === "open" && this.contextViewProvider) {
      this.contextViewProvider.layout();
    }
  }
  onValueChange() {
    this._onDidChange.fire(this.value);
    this.validate();
    this.updateMirror();
    this.input.classList.toggle("empty", !this.value);
    if (this.state === "open" && this.contextViewProvider) {
      this.contextViewProvider.layout();
    }
    if (this.options.hideHoverOnValueChange) {
      getBaseLayerHoverDelegate().hideHover();
    }
  }
  updateMirror() {
    if (!this.mirror) {
      return;
    }
    const value2 = this.value;
    const lastCharCode = value2.charCodeAt(value2.length - 1);
    const suffix = lastCharCode === 10 ? " " : "";
    const mirrorTextContent = (value2 + suffix).replace(/\u000c/g, "");
    if (mirrorTextContent) {
      this.mirror.textContent = value2 + suffix;
    } else {
      this.mirror.innerText = "\xA0";
    }
    this.layout();
  }
  applyStyles() {
    const styles = this.options.inputBoxStyles;
    const background = styles.inputBackground ?? "";
    const foreground2 = styles.inputForeground ?? "";
    const border = styles.inputBorder ?? "";
    this.element.style.backgroundColor = background;
    this.element.style.color = foreground2;
    this.input.style.backgroundColor = "inherit";
    this.input.style.color = foreground2;
    this.element.style.border = `1px solid ${asCssValueWithDefault(border, "transparent")}`;
  }
  layout() {
    if (!this.mirror) {
      this.layoutMessage();
      return;
    }
    const previousHeight = this.cachedContentHeight;
    this.cachedContentHeight = getTotalHeight(this.mirror);
    if (previousHeight !== this.cachedContentHeight) {
      this.cachedHeight = Math.min(this.cachedContentHeight, this.maxHeight);
      this.input.style.height = this.cachedHeight + "px";
      this._onDidHeightChange.fire(this.cachedContentHeight);
    }
    this.layoutMessage();
  }
  insertAtCursor(text2) {
    const inputElement = this.inputElement;
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;
    const content2 = inputElement.value;
    if (start !== null && end !== null) {
      this.value = content2.substr(0, start) + text2 + content2.substr(end);
      inputElement.setSelectionRange(start + 1, start + 1);
      this.layout();
    }
  }
  dispose() {
    this._hideMessage();
    this.message = null;
    this.actionbar?.dispose();
    super.dispose();
  }
};

var HistoryInputBox = class extends InputBox {
  constructor(container3, contextViewProvider, options3) {
    const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS = localize(24, null, `\u21C5`);
    const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS = localize(23, null, `\u21C5`);
    super(container3, contextViewProvider, options3);
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = this._register(new Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this.history = this._register(new HistoryNavigator(options3.history, 100));
    const addSuffix = () => {
      if (options3.showHistoryHint && options3.showHistoryHint() && !this.placeholder.endsWith(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS) && !this.placeholder.endsWith(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS) && this.history.getHistory().length) {
        const suffix = this.placeholder.endsWith(")") ? NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS : NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS;
        const suffixedPlaceholder = this.placeholder + suffix;
        if (options3.showPlaceholderOnFocus && !isActiveElement(this.input)) {
          this.placeholder = suffixedPlaceholder;
        } else {
          this.setPlaceHolder(suffixedPlaceholder);
        }
      }
    };
    this.observer = new MutationObserver((mutationList, observer) => {
      mutationList.forEach((mutation) => {
        if (!mutation.target.textContent) {
          addSuffix();
        }
      });
    });
    this.observer.observe(this.input, { attributeFilter: ["class"] });
    this.onfocus(this.input, () => addSuffix());
    this.onblur(this.input, () => {
      const resetPlaceholder = (historyHint) => {
        if (!this.placeholder.endsWith(historyHint)) {
          return false;
        } else {
          const revertedPlaceholder = this.placeholder.slice(0, this.placeholder.length - historyHint.length);
          if (options3.showPlaceholderOnFocus) {
            this.placeholder = revertedPlaceholder;
          } else {
            this.setPlaceHolder(revertedPlaceholder);
          }
          return true;
        }
      };
      if (!resetPlaceholder(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS)) {
        resetPlaceholder(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS);
      }
    });
  }
  dispose() {
    super.dispose();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = void 0;
    }
  }
  addToHistory(always) {
    if (this.value && (always || this.value !== this.getCurrentValue())) {
      this.history.add(this.value);
    }
  }
  prependHistory(restoredHistory) {
    const newHistory = this.getHistory();
    this.clearHistory();
    restoredHistory.forEach((item) => {
      this.history.add(item);
    });
    newHistory.forEach((item) => {
      this.history.add(item);
    });
  }
  getHistory() {
    return this.history.getHistory();
  }
  isAtFirstInHistory() {
    return this.history.isFirst();
  }
  isAtLastInHistory() {
    return this.history.isLast();
  }
  isNowhereInHistory() {
    return this.history.isNowhere();
  }
  showNextValue() {
    if (!this.history.has(this.value)) {
      this.addToHistory();
    }
    let next = this.getNextValue();
    if (next) {
      next = next === this.value ? this.getNextValue() : next;
    }
    this.value = next ?? "";
    status(this.value ? this.value : localize(22, null));
  }
  showPreviousValue() {
    if (!this.history.has(this.value)) {
      this.addToHistory();
    }
    let previous = this.getPreviousValue();
    if (previous) {
      previous = previous === this.value ? this.getPreviousValue() : previous;
    }
    if (previous) {
      this.value = previous;
      status(this.value);
    }
  }
  clearHistory() {
    this.history.clear();
  }
  setPlaceHolder(placeHolder) {
    super.setPlaceHolder(placeHolder);
    this.setTooltip(placeHolder);
  }
  onBlur() {
    super.onBlur();
    this._onDidBlur.fire();
  }
  onFocus() {
    super.onFocus();
    this._onDidFocus.fire();
  }
  getCurrentValue() {
    let currentValue = this.history.current();
    if (!currentValue) {
      currentValue = this.history.last();
      this.history.next();
    }
    return currentValue;
  }
  getPreviousValue() {
    return this.history.previous() || this.history.first();
  }
  getNextValue() {
    return this.history.next();
  }
};
export { $6, unthemedInboxStyles, InputBox, HistoryInputBox };
