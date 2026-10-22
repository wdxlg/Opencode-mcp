// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/replAccessibleView.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { getReplView } from "./module-3019.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/debug/browser/replAccessibleView.ts
var ReplAccessibleView = class {
  constructor() {
    this.priority = 70;
    this.name = "debugConsole";
    this.when = ContextKeyExpr.equals("focusedView", "workbench.panel.repl.view");
    this.type = "view" /* View */;
  }
  getProvider(accessor) {
    const viewsService = accessor.get(IViewsService);
    const accessibleViewService = accessor.get(IAccessibleViewService);
    const replView = getReplView(viewsService);
    if (!replView) {
      return void 0;
    }
    const focusedElement = replView.getFocusedElement();
    return new ReplOutputAccessibleViewProvider(replView, focusedElement, accessibleViewService);
  }
};

var ReplOutputAccessibleViewProvider = class extends Disposable {
  constructor(_replView, _focusedElement, _accessibleViewService) {
    super();
    this._replView = _replView;
    this._focusedElement = _focusedElement;
    this._accessibleViewService = _accessibleViewService;
    this.id = "repl" /* Repl */;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._onDidResolveChildren = this._register(new Emitter());
    this.onDidResolveChildren = this._onDidResolveChildren.event;
    this.verbositySettingKey = "accessibility.verbosity.debug" /* Debug */;
    this.options = {
      type: "view" /* View */
    };
    this._elementPositionMap = /* @__PURE__ */ new Map();
    this._treeHadFocus = false;
    this._treeHadFocus = !!_focusedElement;
  }
  provideContent() {
    const debugSession = this._replView.getDebugSession();
    if (!debugSession) {
      return "No debug session available.";
    }
    const elements = debugSession.getReplElements();
    if (!elements.length) {
      return "No output in the debug console.";
    }
    if (!this._content) {
      this._updateContent(elements);
    }
    return this._content ?? elements.map((e) => e.toString(true)).join("\n");
  }
  onClose() {
    this._content = void 0;
    this._elementPositionMap.clear();
    if (this._treeHadFocus) {
      return this._replView.focusTree();
    }
    this._replView.getReplInput().focus();
  }
  onOpen() {
    this._register(this.onDidResolveChildren(() => {
      this._onDidChangeContent.fire();
      queueMicrotask(() => {
        if (this._focusedElement) {
          const position2 = this._elementPositionMap.get(this._focusedElement.getId());
          if (position2) {
            this._accessibleViewService.setPosition(position2, true);
          }
        }
      });
    }));
  }
  async _updateContent(elements) {
    const dataSource = this._replView.getReplDataSource();
    if (!dataSource) {
      return;
    }
    let line = 1;
    const content2 = [];
    for (const e of elements) {
      content2.push(e.toString().replace(/\n/g, ""));
      this._elementPositionMap.set(e.getId(), new Position(line, 1));
      line++;
      if (dataSource.hasChildren(e)) {
        const childContent = [];
        const children = await dataSource.getChildren(e);
        for (const child of children) {
          const id2 = child.getId();
          if (!this._elementPositionMap.has(id2)) {
            this._elementPositionMap.set(id2, new Position(line, 1));
          }
          childContent.push("  " + child.toString());
          line++;
        }
        content2.push(childContent.join("\n"));
      }
    }
    this._content = content2.join("\n");
    this._onDidResolveChildren.fire();
  }
};

ReplOutputAccessibleViewProvider = __decorateClass([
  __decorateParam(2, IAccessibleViewService)
], ReplOutputAccessibleViewProvider);
export { ReplAccessibleView, ReplOutputAccessibleViewProvider };
