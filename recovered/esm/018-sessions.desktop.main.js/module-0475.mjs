// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/selectBox/selectBox.ts
import { unthemedListStyles } from "./module-0460.mjs";
import { Widget } from "./module-0252.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { SelectBoxNative } from "./module-0474.mjs";
import { SelectBoxList } from "./module-0473.mjs";


// src/vs/base/browser/ui/selectBox/selectBox.ts
var SeparatorSelectOption = Object.freeze({
  text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
  isDisabled: true,
  isSeparator: true
});

var unthemedSelectBoxStyles = {
  ...unthemedListStyles,
  selectBackground: "#3C3C3C",
  selectForeground: "#F0F0F0",
  selectBorder: "#3C3C3C",
  decoratorRightForeground: void 0,
  selectListBackground: void 0,
  selectListBorder: void 0,
  focusBorder: void 0
};

var SelectBox = class extends Widget {
  constructor(options3, selected, contextViewProvider, styles, selectBoxOptions) {
    super();
    if (isMacintosh && !selectBoxOptions?.useCustomDrawn) {
      this.selectBoxDelegate = new SelectBoxNative(options3, selected, styles, selectBoxOptions);
    } else {
      this.selectBoxDelegate = new SelectBoxList(options3, selected, contextViewProvider, styles, selectBoxOptions);
    }
    this._register(this.selectBoxDelegate);
  }
  // Public SelectBox Methods - routed through delegate interface
  get onDidSelect() {
    return this.selectBoxDelegate.onDidSelect;
  }
  setOptions(options3, selected) {
    this.selectBoxDelegate.setOptions(options3, selected);
  }
  select(index2) {
    this.selectBoxDelegate.select(index2);
  }
  setAriaLabel(label3) {
    this.selectBoxDelegate.setAriaLabel(label3);
  }
  focus() {
    this.selectBoxDelegate.focus();
  }
  blur() {
    this.selectBoxDelegate.blur();
  }
  setFocusable(focusable) {
    this.selectBoxDelegate.setFocusable(focusable);
  }
  setEnabled(enabled) {
    this.selectBoxDelegate.setEnabled(enabled);
  }
  render(container2) {
    this.selectBoxDelegate.render(container2);
  }
};
export { SeparatorSelectOption, unthemedSelectBoxStyles, SelectBox };
