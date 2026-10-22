// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/driver/browser/driver.ts
import { getLogs } from "./module-1591.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { mainWindow } from "./module-0002.mjs";
import { coalesce } from "./module-0007.mjs";
import { getClientArea, getTopLeftOffset, isHTMLDivElement, isHTMLTextAreaElement } from "./module-0075.mjs";
import { language, locale } from "./module-0014.mjs";
import { localizedStrings_default } from "./module-1590.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/services/driver/browser/driver.ts
var BrowserWindowDriver = class {
  constructor(fileService, environmentService, lifecycleService, logService) {
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.lifecycleService = lifecycleService;
    this.logService = logService;
  }
  async getLogs() {
    return getLogs(this.fileService, this.environmentService);
  }
  async whenWorkbenchRestored() {
    this.logService.info("[driver] Waiting for restored lifecycle phase...");
    await this.lifecycleService.when(3 /* Restored */);
    this.logService.info("[driver] Restored lifecycle phase reached. Waiting for contributions...");
    await Registry.as(Extensions10.Workbench).whenRestored;
    this.logService.info("[driver] Workbench contributions created.");
  }
  async setValue(selector, text2) {
    const element = mainWindow.document.querySelector(selector);
    if (!element) {
      return Promise.reject(new Error(`Element not found: ${selector}`));
    }
    const inputElement = element;
    inputElement.value = text2;
    const event = new Event("input", { bubbles: true, cancelable: true });
    inputElement.dispatchEvent(event);
  }
  async isActiveElement(selector) {
    const element = mainWindow.document.querySelector(selector);
    if (element !== mainWindow.document.activeElement) {
      const chain = [];
      let el = mainWindow.document.activeElement;
      while (el) {
        const tagName = el.tagName;
        const id2 = el.id ? `#${el.id}` : "";
        const classes2 = coalesce(el.className.split(/\s+/g).map((c) => c.trim())).map((c) => `.${c}`).join("");
        chain.unshift(`${tagName}${id2}${classes2}`);
        el = el.parentElement;
      }
      throw new Error(`Active element not found. Current active element is '${chain.join(" > ")}'. Looking for ${selector}`);
    }
    return true;
  }
  async getElements(selector, recursive) {
    const query = mainWindow.document.querySelectorAll(selector);
    const result = [];
    for (let i2 = 0; i2 < query.length; i2++) {
      const element = query.item(i2);
      result.push(this.serializeElement(element, recursive));
    }
    return result;
  }
  serializeElement(element, recursive) {
    const attributes = /* @__PURE__ */ Object.create(null);
    for (let j = 0; j < element.attributes.length; j++) {
      const attr = element.attributes.item(j);
      if (attr) {
        attributes[attr.name] = attr.value;
      }
    }
    const children = [];
    if (recursive) {
      for (let i2 = 0; i2 < element.children.length; i2++) {
        const child = element.children.item(i2);
        if (child) {
          children.push(this.serializeElement(child, true));
        }
      }
    }
    const { left, top: top2 } = getTopLeftOffset(element);
    return {
      tagName: element.tagName,
      className: element.className,
      textContent: element.textContent || "",
      attributes,
      children,
      left,
      top: top2
    };
  }
  async getElementXY(selector, xoffset, yoffset) {
    const offset = typeof xoffset === "number" && typeof yoffset === "number" ? { x: xoffset, y: yoffset } : void 0;
    return this._getElementXY(selector, offset);
  }
  async typeInEditor(selector, text2) {
    const element = mainWindow.document.querySelector(selector);
    if (!element) {
      throw new Error(`Editor not found: ${selector}`);
    }
    if (isHTMLDivElement(element)) {
      const editContext = element.editContext;
      if (!editContext) {
        throw new Error(`Edit context not found: ${selector}`);
      }
      const selectionStart = editContext.selectionStart;
      const selectionEnd = editContext.selectionEnd;
      const event = new TextUpdateEvent("textupdate", {
        updateRangeStart: selectionStart,
        updateRangeEnd: selectionEnd,
        text: text2,
        selectionStart: selectionStart + text2.length,
        selectionEnd: selectionStart + text2.length,
        compositionStart: 0,
        compositionEnd: 0
      });
      editContext.dispatchEvent(event);
    } else if (isHTMLTextAreaElement(element)) {
      const start = element.selectionStart;
      const newStart = start + text2.length;
      const value2 = element.value;
      const newValue = value2.substr(0, start) + text2 + value2.substr(start);
      element.value = newValue;
      element.setSelectionRange(newStart, newStart);
      const event = new Event("input", { "bubbles": true, "cancelable": true });
      element.dispatchEvent(event);
    }
  }
  async getEditorSelection(selector) {
    const element = mainWindow.document.querySelector(selector);
    if (!element) {
      throw new Error(`Editor not found: ${selector}`);
    }
    if (isHTMLDivElement(element)) {
      const editContext = element.editContext;
      if (!editContext) {
        throw new Error(`Edit context not found: ${selector}`);
      }
      return { selectionStart: editContext.selectionStart, selectionEnd: editContext.selectionEnd };
    } else if (isHTMLTextAreaElement(element)) {
      return { selectionStart: element.selectionStart, selectionEnd: element.selectionEnd };
    } else {
      throw new Error(`Unknown type of element: ${selector}`);
    }
  }
  async getTerminalBuffer(selector) {
    const element = mainWindow.document.querySelector(selector);
    if (!element) {
      throw new Error(`Terminal not found: ${selector}`);
    }
    const xterm = element.xterm;
    if (!xterm) {
      throw new Error(`Xterm not found: ${selector}`);
    }
    const lines = [];
    for (let i2 = 0; i2 < xterm.buffer.active.length; i2++) {
      lines.push(xterm.buffer.active.getLine(i2).translateToString(true));
    }
    return lines;
  }
  async writeInTerminal(selector, text2) {
    const element = mainWindow.document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    const xterm = element.xterm;
    if (!xterm) {
      throw new Error(`Xterm not found: ${selector}`);
    }
    xterm.input(text2);
  }
  getLocaleInfo() {
    return Promise.resolve({
      language,
      locale
    });
  }
  getLocalizedStrings() {
    return Promise.resolve({
      open: localizedStrings_default.open,
      close: localizedStrings_default.close,
      find: localizedStrings_default.find
    });
  }
  async _getElementXY(selector, offset) {
    const element = mainWindow.document.querySelector(selector);
    if (!element) {
      return Promise.reject(new Error(`Element not found: ${selector}`));
    }
    const { left, top: top2 } = getTopLeftOffset(element);
    const { width: width2, height } = getClientArea(element);
    let x, y;
    if (offset) {
      x = left + offset.x;
      y = top2 + offset.y;
    } else {
      x = left + width2 / 2;
      y = top2 + height / 2;
    }
    x = Math.round(x);
    y = Math.round(y);
    return { x, y };
  }
};

BrowserWindowDriver = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, ILogService)
], BrowserWindowDriver);

function registerWindowDriver(instantiationService) {
  Object.assign(mainWindow, { driver: instantiationService.createInstance(BrowserWindowDriver) });
}
export { registerWindowDriver, BrowserWindowDriver };
