// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/tree/compressedObjectTreeModel.ts
import { Iterable } from "./module-0011.mjs";
import { ObjectTreeModel } from "./module-0630.mjs";
import { TreeError, WeakMapper } from "./module-0627.mjs";
import { equals } from "./module-0007.mjs";
import { getVisibleState, isFilterResult } from "./module-0628.mjs";
import { Event2 } from "./module-0017.mjs";


// src/vs/base/browser/ui/tree/compressedObjectTreeModel.ts
function noCompress(element) {
  const elements = [element.element];
  const incompressible = element.incompressible || false;
  return {
    element: { elements, incompressible },
    children: Iterable.map(Iterable.from(element.children), noCompress),
    collapsible: element.collapsible,
    collapsed: element.collapsed
  };
}

function compress(element) {
  const elements = [element.element];
  const incompressible = element.incompressible || false;
  let childrenIterator;
  let children;
  while (true) {
    [children, childrenIterator] = Iterable.consume(Iterable.from(element.children), 2);
    if (children.length !== 1) {
      break;
    }
    if (children[0].incompressible) {
      break;
    }
    element = children[0];
    elements.push(element.element);
  }
  return {
    element: { elements, incompressible },
    children: Iterable.map(Iterable.concat(children, childrenIterator), compress),
    collapsible: element.collapsible,
    collapsed: element.collapsed
  };
}

function _decompress(element, index2 = 0) {
  let children;
  if (index2 < element.element.elements.length - 1) {
    children = [_decompress(element, index2 + 1)];
  } else {
    children = Iterable.map(Iterable.from(element.children), (el) => _decompress(el, 0));
  }
  if (index2 === 0 && element.element.incompressible) {
    return {
      element: element.element.elements[index2],
      children,
      incompressible: true,
      collapsible: element.collapsible,
      collapsed: element.collapsed
    };
  }
  return {
    element: element.element.elements[index2],
    children,
    collapsible: element.collapsible,
    collapsed: element.collapsed
  };
}

function decompress(element) {
  return _decompress(element, 0);
}

function splice2(treeElement, element, children) {
  if (treeElement.element === element) {
    return { ...treeElement, children };
  }
  return { ...treeElement, children: Iterable.map(Iterable.from(treeElement.children), (e) => splice2(e, element, children)) };
}

var wrapIdentityProvider = (base) => ({
  getId(node) {
    return node.elements.map((e) => base.getId(e).toString()).join("\0");
  },
  getGroupId: base.getGroupId ? (node) => {
    return base.getGroupId(node.elements[node.elements.length - 1]);
  } : void 0
});

var CompressedObjectTreeModel = class {
  constructor(user, options3 = {}) {
    this.user = user;
    this.rootRef = null;
    this.nodes = /* @__PURE__ */ new Map();
    this.model = new ObjectTreeModel(user, options3);
    this.enabled = typeof options3.compressionEnabled === "undefined" ? true : options3.compressionEnabled;
    this.identityProvider = options3.identityProvider;
  }
  get onDidSpliceRenderedNodes() {
    return this.model.onDidSpliceRenderedNodes;
  }
  get onDidSpliceModel() {
    return this.model.onDidSpliceModel;
  }
  get onDidChangeCollapseState() {
    return this.model.onDidChangeCollapseState;
  }
  get onDidChangeRenderNodeCount() {
    return this.model.onDidChangeRenderNodeCount;
  }
  get size() {
    return this.nodes.size;
  }
  setChildren(element, children = Iterable.empty(), options3) {
    const diffIdentityProvider = options3.diffIdentityProvider && wrapIdentityProvider(options3.diffIdentityProvider);
    if (element === null) {
      const compressedChildren = Iterable.map(children, this.enabled ? compress : noCompress);
      this._setChildren(null, compressedChildren, { diffIdentityProvider, diffDepth: Infinity });
      return;
    }
    const compressedNode = this.nodes.get(element);
    if (!compressedNode) {
      throw new TreeError(this.user, "Unknown compressed tree node");
    }
    const node = this.model.getNode(compressedNode);
    const compressedParentNode = this.model.getParentNodeLocation(compressedNode);
    const parent = this.model.getNode(compressedParentNode);
    const decompressedElement = decompress(node);
    const splicedElement = splice2(decompressedElement, element, children);
    const recompressedElement = (this.enabled ? compress : noCompress)(splicedElement);
    const elementComparator = options3.diffIdentityProvider ? ((a, b) => options3.diffIdentityProvider.getId(a) === options3.diffIdentityProvider.getId(b)) : void 0;
    if (equals(recompressedElement.element.elements, node.element.elements, elementComparator)) {
      this._setChildren(compressedNode, recompressedElement.children || Iterable.empty(), { diffIdentityProvider, diffDepth: 1 });
      return;
    }
    const parentChildren = parent.children.map((child) => child === node ? recompressedElement : child);
    this._setChildren(parent.element, parentChildren, {
      diffIdentityProvider,
      diffDepth: node.depth - parent.depth
    });
  }
  isCompressionEnabled() {
    return this.enabled;
  }
  setCompressionEnabled(enabled) {
    if (enabled === this.enabled) {
      return;
    }
    this.enabled = enabled;
    const root = this.model.getNode();
    const rootChildren = root.children;
    const decompressedRootChildren = Iterable.map(rootChildren, decompress);
    const recompressedRootChildren = Iterable.map(decompressedRootChildren, enabled ? compress : noCompress);
    this._setChildren(null, recompressedRootChildren, {
      diffIdentityProvider: this.identityProvider,
      diffDepth: Infinity
    });
  }
  _setChildren(node, children, options3) {
    const insertedElements = /* @__PURE__ */ new Set();
    const onDidCreateNode = (node2) => {
      for (const element of node2.element.elements) {
        insertedElements.add(element);
        this.nodes.set(element, node2.element);
      }
    };
    const onDidDeleteNode = (node2) => {
      for (const element of node2.element.elements) {
        if (!insertedElements.has(element)) {
          this.nodes.delete(element);
        }
      }
    };
    this.model.setChildren(node, children, { ...options3, onDidCreateNode, onDidDeleteNode });
  }
  has(element) {
    return this.nodes.has(element);
  }
  getListIndex(location2) {
    const node = this.getCompressedNode(location2);
    return this.model.getListIndex(node);
  }
  getListRenderCount(location2) {
    const node = this.getCompressedNode(location2);
    return this.model.getListRenderCount(node);
  }
  getNode(location2) {
    if (typeof location2 === "undefined") {
      return this.model.getNode();
    }
    const node = this.getCompressedNode(location2);
    return this.model.getNode(node);
  }
  // TODO: review this
  getNodeLocation(node) {
    const compressedNode = this.model.getNodeLocation(node);
    if (compressedNode === null) {
      return null;
    }
    return compressedNode.elements[compressedNode.elements.length - 1];
  }
  // TODO: review this
  getParentNodeLocation(location2) {
    const compressedNode = this.getCompressedNode(location2);
    const parentNode = this.model.getParentNodeLocation(compressedNode);
    if (parentNode === null) {
      return null;
    }
    return parentNode.elements[parentNode.elements.length - 1];
  }
  getFirstElementChild(location2) {
    const compressedNode = this.getCompressedNode(location2);
    return this.model.getFirstElementChild(compressedNode);
  }
  getLastElementAncestor(location2) {
    const compressedNode = typeof location2 === "undefined" ? void 0 : this.getCompressedNode(location2);
    return this.model.getLastElementAncestor(compressedNode);
  }
  isCollapsible(location2) {
    const compressedNode = this.getCompressedNode(location2);
    return this.model.isCollapsible(compressedNode);
  }
  setCollapsible(location2, collapsible) {
    const compressedNode = this.getCompressedNode(location2);
    return this.model.setCollapsible(compressedNode, collapsible);
  }
  isCollapsed(location2) {
    const compressedNode = this.getCompressedNode(location2);
    return this.model.isCollapsed(compressedNode);
  }
  setCollapsed(location2, collapsed2, recursive) {
    const compressedNode = this.getCompressedNode(location2);
    return this.model.setCollapsed(compressedNode, collapsed2, recursive);
  }
  expandTo(location2) {
    const compressedNode = this.getCompressedNode(location2);
    this.model.expandTo(compressedNode);
  }
  rerender(location2) {
    const compressedNode = this.getCompressedNode(location2);
    this.model.rerender(compressedNode);
  }
  refilter() {
    this.model.refilter();
  }
  resort(location2 = null, recursive = true) {
    const compressedNode = this.getCompressedNode(location2);
    this.model.resort(compressedNode, recursive);
  }
  getCompressedNode(element) {
    if (element === null) {
      return null;
    }
    const node = this.nodes.get(element);
    if (!node) {
      throw new TreeError(this.user, `Tree element not found: ${element}`);
    }
    return node;
  }
};

var DefaultElementMapper = (elements) => elements[elements.length - 1];

var CompressedTreeNodeWrapper = class _CompressedTreeNodeWrapper {
  constructor(unwrapper, node) {
    this.unwrapper = unwrapper;
    this.node = node;
  }
  get element() {
    return this.node.element === null ? null : this.unwrapper(this.node.element);
  }
  get children() {
    return this.node.children.map((node) => new _CompressedTreeNodeWrapper(this.unwrapper, node));
  }
  get depth() {
    return this.node.depth;
  }
  get visibleChildrenCount() {
    return this.node.visibleChildrenCount;
  }
  get visibleChildIndex() {
    return this.node.visibleChildIndex;
  }
  get collapsible() {
    return this.node.collapsible;
  }
  get collapsed() {
    return this.node.collapsed;
  }
  get visible() {
    return this.node.visible;
  }
  get filterData() {
    return this.node.filterData;
  }
};

function mapOptions(compressedNodeUnwrapper, options3) {
  return {
    ...options3,
    identityProvider: options3.identityProvider && {
      getId(node) {
        return options3.identityProvider.getId(compressedNodeUnwrapper(node));
      },
      getGroupId: options3.identityProvider.getGroupId ? (node) => {
        return options3.identityProvider.getGroupId(compressedNodeUnwrapper(node));
      } : void 0
    },
    sorter: options3.sorter && {
      compare(node, otherNode) {
        return options3.sorter.compare(node.elements[0], otherNode.elements[0]);
      }
    },
    filter: options3.filter && {
      filter(node, parentVisibility) {
        const elements = node.elements;
        for (let i2 = 0; i2 < elements.length - 1; i2++) {
          const result = options3.filter.filter(elements[i2], parentVisibility);
          parentVisibility = getVisibleState(isFilterResult(result) ? result.visibility : result);
        }
        return options3.filter.filter(elements[elements.length - 1], parentVisibility);
      }
    }
  };
}

var CompressibleObjectTreeModel = class {
  constructor(user, options3 = {}) {
    this.rootRef = null;
    this.elementMapper = options3.elementMapper || DefaultElementMapper;
    const compressedNodeUnwrapper = (node) => this.elementMapper(node.elements);
    this.nodeMapper = new WeakMapper((node) => new CompressedTreeNodeWrapper(compressedNodeUnwrapper, node));
    this.model = new CompressedObjectTreeModel(user, mapOptions(compressedNodeUnwrapper, options3));
  }
  get onDidSpliceModel() {
    return Event2.map(this.model.onDidSpliceModel, ({ insertedNodes, deletedNodes }) => ({
      insertedNodes: insertedNodes.map((node) => this.nodeMapper.map(node)),
      deletedNodes: deletedNodes.map((node) => this.nodeMapper.map(node))
    }));
  }
  get onDidSpliceRenderedNodes() {
    return Event2.map(this.model.onDidSpliceRenderedNodes, ({ start, deleteCount, elements }) => ({
      start,
      deleteCount,
      elements: elements.map((node) => this.nodeMapper.map(node))
    }));
  }
  get onDidChangeCollapseState() {
    return Event2.map(this.model.onDidChangeCollapseState, ({ node, deep }) => ({
      node: this.nodeMapper.map(node),
      deep
    }));
  }
  get onDidChangeRenderNodeCount() {
    return Event2.map(this.model.onDidChangeRenderNodeCount, (node) => this.nodeMapper.map(node));
  }
  setChildren(element, children = Iterable.empty(), options3 = {}) {
    this.model.setChildren(element, children, options3);
  }
  isCompressionEnabled() {
    return this.model.isCompressionEnabled();
  }
  setCompressionEnabled(enabled) {
    this.model.setCompressionEnabled(enabled);
  }
  has(location2) {
    return this.model.has(location2);
  }
  getListIndex(location2) {
    return this.model.getListIndex(location2);
  }
  getListRenderCount(location2) {
    return this.model.getListRenderCount(location2);
  }
  getNode(location2) {
    return this.nodeMapper.map(this.model.getNode(location2));
  }
  getNodeLocation(node) {
    return node.element;
  }
  getParentNodeLocation(location2) {
    return this.model.getParentNodeLocation(location2);
  }
  getFirstElementChild(location2) {
    const result = this.model.getFirstElementChild(location2);
    if (result === null || typeof result === "undefined") {
      return result;
    }
    return this.elementMapper(result.elements);
  }
  getLastElementAncestor(location2) {
    const result = this.model.getLastElementAncestor(location2);
    if (result === null || typeof result === "undefined") {
      return result;
    }
    return this.elementMapper(result.elements);
  }
  isCollapsible(location2) {
    return this.model.isCollapsible(location2);
  }
  setCollapsible(location2, collapsed2) {
    return this.model.setCollapsible(location2, collapsed2);
  }
  isCollapsed(location2) {
    return this.model.isCollapsed(location2);
  }
  setCollapsed(location2, collapsed2, recursive) {
    return this.model.setCollapsed(location2, collapsed2, recursive);
  }
  expandTo(location2) {
    return this.model.expandTo(location2);
  }
  rerender(location2) {
    return this.model.rerender(location2);
  }
  refilter() {
    return this.model.refilter();
  }
  resort(element = null, recursive = true) {
    return this.model.resort(element, recursive);
  }
  getCompressedTreeNode(location2 = null) {
    return this.model.getNode(location2);
  }
};
export { noCompress, compress, _decompress, decompress, splice2, mapOptions, wrapIdentityProvider, CompressedObjectTreeModel, DefaultElementMapper, CompressedTreeNodeWrapper, CompressibleObjectTreeModel };
