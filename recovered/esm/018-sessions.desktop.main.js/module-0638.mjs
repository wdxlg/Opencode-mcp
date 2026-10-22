// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/countBadge/countBadge.ts
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { format2 } from "./module-0030.mjs";


// src/vs/base/browser/ui/countBadge/countBadge.ts
var CountBadge = class extends Disposable {
  constructor(container2, options3, styles) {
    super();
    this.options = options3;
    this.styles = styles;
    this.count = 0;
    this.hover = this._register(new MutableDisposable());
    this.element = append(container2, $(".monaco-count-badge"));
    this._register(toDisposable(() => container2.removeChild(this.element)));
    this.countFormat = this.options.countFormat || "{0}";
    this.titleFormat = this.options.titleFormat || "";
    this.setCount(this.options.count || 0);
    this.updateHover();
  }
  setCount(count2) {
    this.count = count2;
    this.render();
  }
  setCountFormat(countFormat) {
    this.countFormat = countFormat;
    this.render();
  }
  setTitleFormat(titleFormat) {
    this.titleFormat = titleFormat;
    this.updateHover();
    this.render();
  }
  updateHover() {
    if (this.titleFormat !== "" && !this.hover.value) {
      this.hover.value = getBaseLayerHoverDelegate().setupDelayedHoverAtMouse(this.element, () => ({ content: format2(this.titleFormat, this.count), appearance: { compact: true } }));
    } else if (this.titleFormat === "" && this.hover.value) {
      this.hover.value = void 0;
    }
  }
  render() {
    this.element.textContent = format2(this.countFormat, this.count);
    this.element.style.backgroundColor = this.styles.badgeBackground ?? "";
    this.element.style.color = this.styles.badgeForeground ?? "";
    if (this.styles.badgeBorder) {
      this.element.style.border = `1px solid ${this.styles.badgeBorder}`;
    }
  }
};
export { CountBadge };
