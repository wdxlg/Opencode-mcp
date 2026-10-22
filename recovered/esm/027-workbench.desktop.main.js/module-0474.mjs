// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/selectBox/selectBoxNative.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { EventHelper, addDisposableListener, addStandardDisposableListener } from "./module-0075.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { equals } from "./module-0007.mjs";


// src/vs/base/browser/ui/selectBox/selectBoxNative.ts
var SelectBoxNative = class extends Disposable {
  constructor(options3, selected, styles, selectBoxOptions) {
    super();
    this.selected = 0;
    this.selectBoxOptions = selectBoxOptions || /* @__PURE__ */ Object.create(null);
    this.options = [];
    this.selectElement = document.createElement("select");
    this.selectElement.className = "monaco-select-box";
    if (typeof this.selectBoxOptions.ariaLabel === "string") {
      this.selectElement.setAttribute("aria-label", this.selectBoxOptions.ariaLabel);
    }
    if (typeof this.selectBoxOptions.ariaDescription === "string") {
      this.selectElement.setAttribute("aria-description", this.selectBoxOptions.ariaDescription);
    }
    this._onDidSelect = this._register(new Emitter());
    this.styles = styles;
    this.registerListeners();
    this.setOptions(options3, selected);
  }
  registerListeners() {
    this._register(Gesture.addTarget(this.selectElement));
    [EventType2.Tap].forEach((eventType) => {
      this._register(addDisposableListener(this.selectElement, eventType, (e) => {
        this.selectElement.focus();
      }));
    });
    this._register(addStandardDisposableListener(this.selectElement, "click", (e) => {
      EventHelper.stop(e, true);
    }));
    this._register(addStandardDisposableListener(this.selectElement, "change", (e) => {
      this.selectElement.title = e.target.value;
      this._onDidSelect.fire({
        index: e.target.selectedIndex,
        selected: e.target.value
      });
    }));
    this._register(addStandardDisposableListener(this.selectElement, "keydown", (e) => {
      let showSelect = false;
      if (isMacintosh) {
        if (e.keyCode === 18 /* DownArrow */ || e.keyCode === 16 /* UpArrow */ || e.keyCode === 10 /* Space */) {
          showSelect = true;
        }
      } else {
        if (e.keyCode === 18 /* DownArrow */ && e.altKey || e.keyCode === 10 /* Space */ || e.keyCode === 3 /* Enter */) {
          showSelect = true;
        }
      }
      if (showSelect) {
        e.stopPropagation();
      }
    }));
  }
  get onDidSelect() {
    return this._onDidSelect.event;
  }
  setOptions(options3, selected) {
    if (!this.options || !equals(this.options, options3)) {
      this.options = options3;
      this.selectElement.options.length = 0;
      this.options.forEach((option2, index2) => {
        this.selectElement.add(this.createOption(option2.text, index2, option2.isDisabled, option2.isSeparator));
      });
    }
    if (selected !== void 0) {
      this.select(selected);
    }
  }
  select(index2) {
    if (this.options.length === 0) {
      this.selected = 0;
    } else if (index2 >= 0 && index2 < this.options.length) {
      this.selected = index2;
    } else if (index2 > this.options.length - 1) {
      this.select(this.options.length - 1);
    } else if (this.selected < 0) {
      this.selected = 0;
    }
    this.selectElement.selectedIndex = this.selected;
    if (this.selected < this.options.length && typeof this.options[this.selected].text === "string") {
      this.selectElement.title = this.options[this.selected].text;
    } else {
      this.selectElement.title = "";
    }
  }
  setAriaLabel(label3) {
    this.selectBoxOptions.ariaLabel = label3;
    this.selectElement.setAttribute("aria-label", label3);
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
  setEnabled(enable) {
    this.selectElement.disabled = !enable;
  }
  setFocusable(focusable) {
    this.selectElement.tabIndex = focusable ? 0 : -1;
  }
  render(container3) {
    container3.classList.add("select-container");
    container3.appendChild(this.selectElement);
    this.setOptions(this.options, this.selected);
    this.applyStyles();
  }
  style(styles) {
    this.styles = styles;
    this.applyStyles();
  }
  applyStyles() {
    if (this.selectElement) {
      this.selectElement.style.backgroundColor = this.styles.selectBackground ?? "";
      this.selectElement.style.color = this.styles.selectForeground ?? "";
      this.selectElement.style.borderColor = this.styles.selectBorder ?? "";
    }
  }
  createOption(value2, index2, disabled, isSeparator) {
    const option2 = document.createElement("option");
    option2.value = value2;
    option2.text = value2;
    option2.disabled = !!disabled || !!isSeparator;
    if (isSeparator) {
      option2.setAttribute("role", "separator");
    }
    return option2;
  }
};
export { SelectBoxNative };
