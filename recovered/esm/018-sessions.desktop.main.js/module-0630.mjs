// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/tree/objectTreeModel.ts
import { IndexTreeModel } from "./module-0628.mjs";
import { Iterable } from "./module-0011.mjs";
import { TreeError } from "./module-0627.mjs";


// src/vs/base/browser/ui/tree/objectTreeModel.ts
var ObjectTreeModel = class {
  constructor(user, options3 = {}) {
    this.user = user;
    this.rootRef = null;
    this.nodes = /* @__PURE__ */ new Map();
    this.nodesByIdentity = /* @__PURE__ */ new Map();
    this.model = new IndexTreeModel(user, null, options3);
    this.onDidSpliceModel = this.model.onDidSpliceModel;
    this.onDidSpliceRenderedNodes = this.model.onDidSpliceRenderedNodes;
    this.onDidChangeCollapseState = this.model.onDidChangeCollapseState;
    this.onDidChangeRenderNodeCount = this.model.onDidChangeRenderNodeCount;
    if (options3.sorter) {
      this.sorter = {
        compare(a, b) {
          return options3.sorter.compare(a.element, b.element);
        }
      };
    }
    this.identityProvider = options3.identityProvider;
  }
  get size() {
    return this.nodes.size;
  }
  setChildren(element, children = Iterable.empty(), options3 = {}) {
    const location2 = this.getElementLocation(element);
    this._setChildren(location2, this.preserveCollapseState(children), options3);
  }
  _setChildren(location2, children = Iterable.empty(), options3) {
    const insertedElements = /* @__PURE__ */ new Set();
    const insertedElementIds = /* @__PURE__ */ new Set();
    const onDidCreateNode = (node) => {
      if (node.element === null) {
        return;
      }
      const tnode = node;
      insertedElements.add(tnode.element);
      this.nodes.set(tnode.element, tnode);
      if (this.identityProvider) {
        const id2 = this.identityProvider.getId(tnode.element).toString();
        insertedElementIds.add(id2);
        this.nodesByIdentity.set(id2, tnode);
      }
      options3.onDidCreateNode?.(tnode);
    };
    const onDidDeleteNode = (node) => {
      if (node.element === null) {
        return;
      }
      const tnode = node;
      if (!insertedElements.has(tnode.element)) {
        this.nodes.delete(tnode.element);
      }
      if (this.identityProvider) {
        const id2 = this.identityProvider.getId(tnode.element).toString();
        if (!insertedElementIds.has(id2)) {
          this.nodesByIdentity.delete(id2);
        }
      }
      options3.onDidDeleteNode?.(tnode);
    };
    this.model.splice(
      [...location2, 0],
      Number.MAX_VALUE,
      children,
      { ...options3, onDidCreateNode, onDidDeleteNode }
    );
  }
  preserveCollapseState(elements = Iterable.empty()) {
    if (this.sorter) {
      elements = [...elements].sort(this.sorter.compare.bind(this.sorter));
    }
    return Iterable.map(elements, (treeElement) => {
      let node = this.nodes.get(treeElement.element);
      if (!node && this.identityProvider) {
        const id2 = this.identityProvider.getId(treeElement.element).toString();
        node = this.nodesByIdentity.get(id2);
      }
      if (!node) {
        let collapsed3;
        if (typeof treeElement.collapsed === "undefined") {
          collapsed3 = void 0;
        } else if (treeElement.collapsed === 1 /* Collapsed */ || treeElement.collapsed === 3 /* PreserveOrCollapsed */) {
          collapsed3 = true;
        } else if (treeElement.collapsed === 0 /* Expanded */ || treeElement.collapsed === 2 /* PreserveOrExpanded */) {
          collapsed3 = false;
        } else {
          collapsed3 = Boolean(treeElement.collapsed);
        }
        return {
          ...treeElement,
          children: this.preserveCollapseState(treeElement.children),
          collapsed: collapsed3
        };
      }
      const collapsible = typeof treeElement.collapsible === "boolean" ? treeElement.collapsible : node.collapsible;
      let collapsed2;
      if (typeof treeElement.collapsed === "undefined" || treeElement.collapsed === 3 /* PreserveOrCollapsed */ || treeElement.collapsed === 2 /* PreserveOrExpanded */) {
        collapsed2 = node.collapsed;
      } else if (treeElement.collapsed === 1 /* Collapsed */) {
        collapsed2 = true;
      } else if (treeElement.collapsed === 0 /* Expanded */) {
        collapsed2 = false;
      } else {
        collapsed2 = Boolean(treeElement.collapsed);
      }
      return {
        ...treeElement,
        collapsible,
        collapsed: collapsed2,
        children: this.preserveCollapseState(treeElement.children)
      };
    });
  }
  rerender(element) {
    const location2 = this.getElementLocation(element);
    this.model.rerender(location2);
  }
  resort(element = null, recursive = true) {
    if (!this.sorter) {
      return;
    }
    const location2 = this.getElementLocation(element);
    const node = this.model.getNode(location2);
    this._setChildren(location2, this.resortChildren(node, recursive), {});
  }
  resortChildren(node, recursive, first2 = true) {
    let childrenNodes = [...node.children];
    if (recursive || first2) {
      childrenNodes = childrenNodes.sort(this.sorter.compare.bind(this.sorter));
    }
    return Iterable.map(childrenNodes, (node2) => ({
      element: node2.element,
      collapsible: node2.collapsible,
      collapsed: node2.collapsed,
      children: this.resortChildren(node2, recursive, false)
    }));
  }
  getFirstElementChild(ref = null) {
    const location2 = this.getElementLocation(ref);
    return this.model.getFirstElementChild(location2);
  }
  getLastElementAncestor(ref = null) {
    const location2 = this.getElementLocation(ref);
    return this.model.getLastElementAncestor(location2);
  }
  has(element) {
    return this.nodes.has(element);
  }
  getListIndex(element) {
    const location2 = this.getElementLocation(element);
    return this.model.getListIndex(location2);
  }
  getListRenderCount(element) {
    const location2 = this.getElementLocation(element);
    return this.model.getListRenderCount(location2);
  }
  isCollapsible(element) {
    const location2 = this.getElementLocation(element);
    return this.model.isCollapsible(location2);
  }
  setCollapsible(element, collapsible) {
    const location2 = this.getElementLocation(element);
    return this.model.setCollapsible(location2, collapsible);
  }
  isCollapsed(element) {
    const location2 = this.getElementLocation(element);
    return this.model.isCollapsed(location2);
  }
  setCollapsed(element, collapsed2, recursive) {
    const location2 = this.getElementLocation(element);
    return this.model.setCollapsed(location2, collapsed2, recursive);
  }
  expandTo(element) {
    const location2 = this.getElementLocation(element);
    this.model.expandTo(location2);
  }
  refilter() {
    this.model.refilter();
  }
  getNode(element = null) {
    if (element === null) {
      return this.model.getNode(this.model.rootRef);
    }
    const node = this.nodes.get(element);
    if (!node) {
      throw new TreeError(this.user, `Tree element not found: ${element}`);
    }
    return node;
  }
  getNodeLocation(node) {
    return node.element;
  }
  getParentNodeLocation(element) {
    if (element === null) {
      throw new TreeError(this.user, `Invalid getParentNodeLocation call`);
    }
    const node = this.nodes.get(element);
    if (!node) {
      throw new TreeError(this.user, `Tree element not found: ${element}`);
    }
    const location2 = this.model.getNodeLocation(node);
    const parentLocation = this.model.getParentNodeLocation(location2);
    const parent = this.model.getNode(parentLocation);
    return parent.element;
  }
  getElementLocation(element) {
    if (element === null) {
      return [];
    }
    const node = this.nodes.get(element);
    if (!node) {
      throw new TreeError(this.user, `Tree element not found: ${element}`);
    }
    return this.model.getNodeLocation(node);
  }
};
export { ObjectTreeModel };
