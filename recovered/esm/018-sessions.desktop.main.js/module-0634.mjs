// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/tree/dataTree.ts
import { AbstractTree } from "./module-0629.mjs";
import { TreeError } from "./module-0627.mjs";
import { Iterable } from "./module-0011.mjs";
import { ObjectTreeModel } from "./module-0630.mjs";


// src/vs/base/browser/ui/tree/dataTree.ts
var DataTree = class extends AbstractTree {
  constructor(user, container2, delegate, renderers, dataSource, options3 = {}) {
    super(user, container2, delegate, renderers, options3);
    this.user = user;
    this.dataSource = dataSource;
    this.nodesByIdentity = /* @__PURE__ */ new Map();
    this.identityProvider = options3.identityProvider;
  }
  // Model
  getInput() {
    return this.input;
  }
  setInput(input, viewState) {
    if (viewState && !this.identityProvider) {
      throw new TreeError(this.user, "Can't restore tree view state without an identity provider");
    }
    this.input = input;
    if (!input) {
      this.nodesByIdentity.clear();
      this.model.setChildren(null, Iterable.empty());
      return;
    }
    if (!viewState) {
      this._refresh(input);
      return;
    }
    const focus = [];
    const selection = [];
    const isCollapsed = (element) => {
      const id2 = this.identityProvider.getId(element).toString();
      return !viewState.expanded[id2];
    };
    const onDidCreateNode = (node) => {
      const id2 = this.identityProvider.getId(node.element).toString();
      if (viewState.focus.has(id2)) {
        focus.push(node.element);
      }
      if (viewState.selection.has(id2)) {
        selection.push(node.element);
      }
    };
    this._refresh(input, isCollapsed, onDidCreateNode);
    this.setFocus(focus);
    this.setSelection(selection);
    if (viewState && typeof viewState.scrollTop === "number") {
      this.scrollTop = viewState.scrollTop;
    }
  }
  updateChildren(element = this.input) {
    if (typeof this.input === "undefined") {
      throw new TreeError(this.user, "Tree input not set");
    }
    let isCollapsed;
    if (this.identityProvider) {
      isCollapsed = (element2) => {
        const id2 = this.identityProvider.getId(element2).toString();
        const node = this.nodesByIdentity.get(id2);
        if (!node) {
          return void 0;
        }
        return node.collapsed;
      };
    }
    this._refresh(element, isCollapsed);
  }
  resort(element = this.input, recursive = true) {
    this.model.resort(element === this.input ? null : element, recursive);
  }
  // View
  refresh(element) {
    if (element === void 0) {
      this.view.rerender();
      return;
    }
    this.model.rerender(element);
  }
  // Implementation
  _refresh(element, isCollapsed, onDidCreateNode) {
    let onDidDeleteNode;
    if (this.identityProvider) {
      const insertedElements = /* @__PURE__ */ new Set();
      const outerOnDidCreateNode = onDidCreateNode;
      onDidCreateNode = (node) => {
        const id2 = this.identityProvider.getId(node.element).toString();
        insertedElements.add(id2);
        this.nodesByIdentity.set(id2, node);
        outerOnDidCreateNode?.(node);
      };
      onDidDeleteNode = (node) => {
        const id2 = this.identityProvider.getId(node.element).toString();
        if (!insertedElements.has(id2)) {
          this.nodesByIdentity.delete(id2);
        }
      };
    }
    this.model.setChildren(element === this.input ? null : element, this.iterate(element, isCollapsed).elements, { onDidCreateNode, onDidDeleteNode });
  }
  iterate(element, isCollapsed) {
    const children = [...this.dataSource.getChildren(element)];
    const elements = Iterable.map(children, (element2) => {
      const { elements: children2, size: size3 } = this.iterate(element2, isCollapsed);
      const collapsible = this.dataSource.hasChildren ? this.dataSource.hasChildren(element2) : void 0;
      const collapsed2 = size3 === 0 ? void 0 : isCollapsed && isCollapsed(element2);
      return { element: element2, children: children2, collapsible, collapsed: collapsed2 };
    });
    return { elements, size: children.length };
  }
  createModel(user, options3) {
    return new ObjectTreeModel(user, options3);
  }
};
export { DataTree };
