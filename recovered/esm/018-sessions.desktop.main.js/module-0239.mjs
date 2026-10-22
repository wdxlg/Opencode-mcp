// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/view/viewPart.ts
import { ViewEventHandler } from "./module-0238.mjs";


// src/vs/editor/browser/view/viewPart.ts
var ViewPart = class extends ViewEventHandler {
  constructor(context2) {
    super();
    this._context = context2;
    this._context.addEventHandler(this);
  }
  dispose() {
    this._context.removeEventHandler(this);
    super.dispose();
  }
  onBeforeRender(viewportData) {
  }
};

var PartFingerprints = class {
  static write(target, partId) {
    target.setAttribute("data-mprt", String(partId));
  }
  static read(target) {
    const r2 = target.getAttribute("data-mprt");
    if (r2 === null) {
      return 0 /* None */;
    }
    return parseInt(r2, 10);
  }
  static collect(child, stopAt) {
    const result = [];
    let resultLen = 0;
    while (child && child !== child.ownerDocument.body) {
      if (child === stopAt) {
        break;
      }
      if (child.nodeType === child.ELEMENT_NODE) {
        result[resultLen++] = this.read(child);
      }
      child = child.parentElement;
    }
    const r2 = new Uint8Array(resultLen);
    for (let i2 = 0; i2 < resultLen; i2++) {
      r2[i2] = result[resultLen - i2 - 1];
    }
    return r2;
  }
};
export { ViewPart, PartFingerprints };
