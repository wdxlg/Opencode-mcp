// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/tree/indexTreeModel.ts
import { Emitter, EventBufferer } from "./module-0017.mjs";
import { Delayer } from "./module-0036.mjs";
import { MicrotaskDelay } from "./module-0035.mjs";
import { Iterable } from "./module-0011.mjs";
import { TreeError } from "./module-0627.mjs";
import { LcsDiff } from "./module-0166.mjs";
import { splice, tail } from "./module-0007.mjs";


// src/vs/base/browser/ui/tree/indexTreeModel.ts
function isFilterResult(obj) {
  return !!obj && obj.visibility !== void 0;
}

function getVisibleState(visibility) {
  switch (visibility) {
    case true:
      return 1 /* Visible */;
    case false:
      return 0 /* Hidden */;
    default:
      return visibility;
  }
}

function isCollapsibleStateUpdate(update) {
  return "collapsible" in update;
}

var IndexTreeModel = class {
  constructor(user, rootElement, options3 = {}) {
    this.user = user;
    this.rootRef = [];
    this.eventBufferer = new EventBufferer();
    this._onDidSpliceModel = new Emitter();
    this.onDidSpliceModel = this._onDidSpliceModel.event;
    this._onDidSpliceRenderedNodes = new Emitter();
    this.onDidSpliceRenderedNodes = this._onDidSpliceRenderedNodes.event;
    this._onDidChangeCollapseState = new Emitter();
    this.onDidChangeCollapseState = this.eventBufferer.wrapEvent(this._onDidChangeCollapseState.event);
    this._onDidChangeRenderNodeCount = new Emitter();
    this.onDidChangeRenderNodeCount = this.eventBufferer.wrapEvent(this._onDidChangeRenderNodeCount.event);
    this.refilterDelayer = new Delayer(MicrotaskDelay);
    this.collapseByDefault = typeof options3.collapseByDefault === "undefined" ? false : options3.collapseByDefault;
    this.allowNonCollapsibleParents = options3.allowNonCollapsibleParents ?? false;
    this.filter = options3.filter;
    this.autoExpandSingleChildren = typeof options3.autoExpandSingleChildren === "undefined" ? false : options3.autoExpandSingleChildren;
    this.root = {
      parent: void 0,
      element: rootElement,
      children: [],
      depth: 0,
      visibleChildrenCount: 0,
      visibleChildIndex: -1,
      collapsible: false,
      collapsed: false,
      renderNodeCount: 0,
      visibility: 1 /* Visible */,
      visible: true,
      filterData: void 0
    };
  }
  splice(location2, deleteCount, toInsert = Iterable.empty(), options3 = {}) {
    if (location2.length === 0) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    if (options3.diffIdentityProvider) {
      this.spliceSmart(options3.diffIdentityProvider, location2, deleteCount, toInsert, options3);
    } else {
      this.spliceSimple(location2, deleteCount, toInsert, options3);
    }
  }
  spliceSmart(identity2, location2, deleteCount, toInsertIterable = Iterable.empty(), options3, recurseLevels = options3.diffDepth ?? 0) {
    const { parentNode } = this.getParentNodeWithListIndex(location2);
    if (!parentNode.lastDiffIds) {
      return this.spliceSimple(location2, deleteCount, toInsertIterable, options3);
    }
    const toInsert = [...toInsertIterable];
    const index2 = location2[location2.length - 1];
    const diff4 = new LcsDiff(
      { getElements: () => parentNode.lastDiffIds },
      {
        getElements: () => [
          ...parentNode.children.slice(0, index2),
          ...toInsert,
          ...parentNode.children.slice(index2 + deleteCount)
        ].map((e4) => identity2.getId(e4.element).toString())
      }
    ).ComputeDiff(false);
    if (diff4.quitEarly) {
      parentNode.lastDiffIds = void 0;
      return this.spliceSimple(location2, deleteCount, toInsert, options3);
    }
    const locationPrefix = location2.slice(0, -1);
    const recurseSplice = (fromOriginal, fromModified, count2) => {
      if (recurseLevels > 0) {
        for (let i2 = 0; i2 < count2; i2++) {
          fromOriginal--;
          fromModified--;
          this.spliceSmart(
            identity2,
            [...locationPrefix, fromOriginal, 0],
            Number.MAX_SAFE_INTEGER,
            toInsert[fromModified].children,
            options3,
            recurseLevels - 1
          );
        }
      }
    };
    let lastStartO = Math.min(parentNode.children.length, index2 + deleteCount);
    let lastStartM = toInsert.length;
    for (const change of diff4.changes.sort((a, b) => b.originalStart - a.originalStart)) {
      recurseSplice(lastStartO, lastStartM, lastStartO - (change.originalStart + change.originalLength));
      lastStartO = change.originalStart;
      lastStartM = change.modifiedStart - index2;
      this.spliceSimple(
        [...locationPrefix, lastStartO],
        change.originalLength,
        Iterable.slice(toInsert, lastStartM, lastStartM + change.modifiedLength),
        options3
      );
    }
    recurseSplice(lastStartO, lastStartM, lastStartO);
  }
  spliceSimple(location2, deleteCount, toInsert = Iterable.empty(), { onDidCreateNode, onDidDeleteNode, diffIdentityProvider }) {
    const { parentNode, listIndex, revealed, visible } = this.getParentNodeWithListIndex(location2);
    const treeListElementsToInsert = [];
    const nodesToInsertIterator = Iterable.map(toInsert, (el) => this.createTreeNode(el, parentNode, parentNode.visible ? 1 /* Visible */ : 0 /* Hidden */, revealed, treeListElementsToInsert, onDidCreateNode));
    const lastIndex = location2[location2.length - 1];
    let visibleChildStartIndex = 0;
    for (let i2 = lastIndex; i2 >= 0 && i2 < parentNode.children.length; i2--) {
      const child = parentNode.children[i2];
      if (child.visible) {
        visibleChildStartIndex = child.visibleChildIndex;
        break;
      }
    }
    const nodesToInsert = [];
    let insertedVisibleChildrenCount = 0;
    let renderNodeCount = 0;
    for (const child of nodesToInsertIterator) {
      nodesToInsert.push(child);
      renderNodeCount += child.renderNodeCount;
      if (child.visible) {
        child.visibleChildIndex = visibleChildStartIndex + insertedVisibleChildrenCount++;
      }
    }
    const deletedNodes = splice(parentNode.children, lastIndex, deleteCount, nodesToInsert);
    if (!diffIdentityProvider) {
      parentNode.lastDiffIds = void 0;
    } else if (parentNode.lastDiffIds) {
      splice(parentNode.lastDiffIds, lastIndex, deleteCount, nodesToInsert.map((n2) => diffIdentityProvider.getId(n2.element).toString()));
    } else {
      parentNode.lastDiffIds = parentNode.children.map((n2) => diffIdentityProvider.getId(n2.element).toString());
    }
    let deletedVisibleChildrenCount = 0;
    for (const child of deletedNodes) {
      if (child.visible) {
        deletedVisibleChildrenCount++;
      }
    }
    if (deletedVisibleChildrenCount !== 0) {
      for (let i2 = lastIndex + nodesToInsert.length; i2 < parentNode.children.length; i2++) {
        const child = parentNode.children[i2];
        if (child.visible) {
          child.visibleChildIndex -= deletedVisibleChildrenCount;
        }
      }
    }
    parentNode.visibleChildrenCount += insertedVisibleChildrenCount - deletedVisibleChildrenCount;
    if (deletedNodes.length > 0 && onDidDeleteNode) {
      const visit2 = (node2) => {
        onDidDeleteNode(node2);
        node2.children.forEach(visit2);
      };
      deletedNodes.forEach(visit2);
    }
    if (revealed && visible) {
      const visibleDeleteCount = deletedNodes.reduce((r2, node2) => r2 + (node2.visible ? node2.renderNodeCount : 0), 0);
      this._updateAncestorsRenderNodeCount(parentNode, renderNodeCount - visibleDeleteCount);
      this._onDidSpliceRenderedNodes.fire({ start: listIndex, deleteCount: visibleDeleteCount, elements: treeListElementsToInsert });
    }
    this._onDidSpliceModel.fire({ insertedNodes: nodesToInsert, deletedNodes });
    let node = parentNode;
    while (node) {
      if (node.visibility === 2 /* Recurse */) {
        this.refilterDelayer.trigger(() => this.refilter());
        break;
      }
      node = node.parent;
    }
  }
  rerender(location2) {
    if (location2.length === 0) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    const { node, listIndex, revealed } = this.getTreeNodeWithListIndex(location2);
    if (node.visible && revealed) {
      this._onDidSpliceRenderedNodes.fire({ start: listIndex, deleteCount: 1, elements: [node] });
    }
  }
  has(location2) {
    return this.hasTreeNode(location2);
  }
  getListIndex(location2) {
    const { listIndex, visible, revealed } = this.getTreeNodeWithListIndex(location2);
    return visible && revealed ? listIndex : -1;
  }
  getListRenderCount(location2) {
    return this.getTreeNode(location2).renderNodeCount;
  }
  isCollapsible(location2) {
    return this.getTreeNode(location2).collapsible;
  }
  setCollapsible(location2, collapsible) {
    const node = this.getTreeNode(location2);
    if (typeof collapsible === "undefined") {
      collapsible = !node.collapsible;
    }
    const update = { collapsible };
    return this.eventBufferer.bufferEvents(() => this._setCollapseState(location2, update));
  }
  isCollapsed(location2) {
    return this.getTreeNode(location2).collapsed;
  }
  setCollapsed(location2, collapsed2, recursive) {
    const node = this.getTreeNode(location2);
    if (typeof collapsed2 === "undefined") {
      collapsed2 = !node.collapsed;
    }
    const update = { collapsed: collapsed2, recursive: recursive || false };
    return this.eventBufferer.bufferEvents(() => this._setCollapseState(location2, update));
  }
  _setCollapseState(location2, update) {
    const { node, listIndex, revealed } = this.getTreeNodeWithListIndex(location2);
    const result = this._setListNodeCollapseState(node, listIndex, revealed, update);
    if (node !== this.root && this.autoExpandSingleChildren && result && !isCollapsibleStateUpdate(update) && node.collapsible && !node.collapsed && !update.recursive) {
      let onlyVisibleChildIndex = -1;
      for (let i2 = 0; i2 < node.children.length; i2++) {
        const child = node.children[i2];
        if (child.visible) {
          if (onlyVisibleChildIndex > -1) {
            onlyVisibleChildIndex = -1;
            break;
          } else {
            onlyVisibleChildIndex = i2;
          }
        }
      }
      if (onlyVisibleChildIndex > -1) {
        this._setCollapseState([...location2, onlyVisibleChildIndex], update);
      }
    }
    return result;
  }
  _setListNodeCollapseState(node, listIndex, revealed, update) {
    const result = this._setNodeCollapseState(node, update, false);
    if (!revealed || !node.visible || !result) {
      return result;
    }
    const previousRenderNodeCount = node.renderNodeCount;
    const toInsert = this.updateNodeAfterCollapseChange(node);
    const deleteCount = previousRenderNodeCount - (listIndex === -1 ? 0 : 1);
    this._onDidSpliceRenderedNodes.fire({ start: listIndex + 1, deleteCount, elements: toInsert.slice(1) });
    return result;
  }
  _setNodeCollapseState(node, update, deep) {
    let result;
    if (node === this.root) {
      result = false;
    } else {
      if (isCollapsibleStateUpdate(update)) {
        result = node.collapsible !== update.collapsible;
        node.collapsible = update.collapsible;
      } else if (!node.collapsible) {
        result = false;
      } else {
        result = node.collapsed !== update.collapsed;
        node.collapsed = update.collapsed;
      }
      if (result) {
        this._onDidChangeCollapseState.fire({ node, deep });
      }
    }
    if (!isCollapsibleStateUpdate(update) && update.recursive) {
      for (const child of node.children) {
        result = this._setNodeCollapseState(child, update, true) || result;
      }
    }
    return result;
  }
  expandTo(location2) {
    this.eventBufferer.bufferEvents(() => {
      let node = this.getTreeNode(location2);
      while (node.parent) {
        node = node.parent;
        location2 = location2.slice(0, location2.length - 1);
        if (node.collapsed) {
          this._setCollapseState(location2, { collapsed: false, recursive: false });
        }
      }
    });
  }
  refilter() {
    const previousRenderNodeCount = this.root.renderNodeCount;
    const toInsert = this.updateNodeAfterFilterChange(this.root);
    this._onDidSpliceRenderedNodes.fire({ start: 0, deleteCount: previousRenderNodeCount, elements: toInsert });
    this.refilterDelayer.cancel();
  }
  createTreeNode(treeElement, parent, parentVisibility, revealed, treeListElements, onDidCreateNode) {
    const node = {
      parent,
      element: treeElement.element,
      children: [],
      depth: parent.depth + 1,
      visibleChildrenCount: 0,
      visibleChildIndex: -1,
      collapsible: typeof treeElement.collapsible === "boolean" ? treeElement.collapsible : typeof treeElement.collapsed !== "undefined",
      collapsed: typeof treeElement.collapsed === "undefined" ? this.collapseByDefault : treeElement.collapsed,
      renderNodeCount: 1,
      visibility: 1 /* Visible */,
      visible: true,
      filterData: void 0
    };
    const visibility = this._filterNode(node, parentVisibility);
    node.visibility = visibility;
    if (revealed) {
      treeListElements.push(node);
    }
    const childElements = treeElement.children || Iterable.empty();
    const childRevealed = revealed && visibility !== 0 /* Hidden */ && !node.collapsed;
    let visibleChildrenCount = 0;
    let renderNodeCount = 1;
    for (const el of childElements) {
      const child = this.createTreeNode(el, node, visibility, childRevealed, treeListElements, onDidCreateNode);
      node.children.push(child);
      renderNodeCount += child.renderNodeCount;
      if (child.visible) {
        child.visibleChildIndex = visibleChildrenCount++;
      }
    }
    if (!this.allowNonCollapsibleParents) {
      node.collapsible = node.collapsible || node.children.length > 0;
    }
    node.visibleChildrenCount = visibleChildrenCount;
    node.visible = visibility === 2 /* Recurse */ ? visibleChildrenCount > 0 : visibility === 1 /* Visible */;
    if (!node.visible) {
      node.renderNodeCount = 0;
      if (revealed) {
        treeListElements.pop();
      }
    } else if (!node.collapsed) {
      node.renderNodeCount = renderNodeCount;
    }
    onDidCreateNode?.(node);
    return node;
  }
  updateNodeAfterCollapseChange(node) {
    const previousRenderNodeCount = node.renderNodeCount;
    const result = [];
    this._updateNodeAfterCollapseChange(node, result);
    this._updateAncestorsRenderNodeCount(node.parent, result.length - previousRenderNodeCount);
    return result;
  }
  _updateNodeAfterCollapseChange(node, result) {
    if (node.visible === false) {
      return 0;
    }
    result.push(node);
    node.renderNodeCount = 1;
    if (!node.collapsed) {
      for (const child of node.children) {
        node.renderNodeCount += this._updateNodeAfterCollapseChange(child, result);
      }
    }
    this._onDidChangeRenderNodeCount.fire(node);
    return node.renderNodeCount;
  }
  updateNodeAfterFilterChange(node) {
    const previousRenderNodeCount = node.renderNodeCount;
    const result = [];
    this._updateNodeAfterFilterChange(node, node.visible ? 1 /* Visible */ : 0 /* Hidden */, result);
    this._updateAncestorsRenderNodeCount(node.parent, result.length - previousRenderNodeCount);
    return result;
  }
  _updateNodeAfterFilterChange(node, parentVisibility, result, revealed = true) {
    let visibility;
    if (node !== this.root) {
      visibility = this._filterNode(node, parentVisibility);
      if (visibility === 0 /* Hidden */) {
        node.visible = false;
        node.renderNodeCount = 0;
        return false;
      }
      if (revealed) {
        result.push(node);
      }
    }
    const resultStartLength = result.length;
    node.renderNodeCount = node === this.root ? 0 : 1;
    let hasVisibleDescendants = false;
    if (!node.collapsed || visibility !== 0 /* Hidden */) {
      let visibleChildIndex = 0;
      for (const child of node.children) {
        hasVisibleDescendants = this._updateNodeAfterFilterChange(child, visibility, result, revealed && !node.collapsed) || hasVisibleDescendants;
        if (child.visible) {
          child.visibleChildIndex = visibleChildIndex++;
        }
      }
      node.visibleChildrenCount = visibleChildIndex;
    } else {
      node.visibleChildrenCount = 0;
    }
    if (node !== this.root) {
      node.visible = visibility === 2 /* Recurse */ ? hasVisibleDescendants : visibility === 1 /* Visible */;
      node.visibility = visibility;
    }
    if (!node.visible) {
      node.renderNodeCount = 0;
      if (revealed) {
        result.pop();
      }
    } else if (!node.collapsed) {
      node.renderNodeCount += result.length - resultStartLength;
    }
    this._onDidChangeRenderNodeCount.fire(node);
    return node.visible;
  }
  _updateAncestorsRenderNodeCount(node, diff4) {
    if (diff4 === 0) {
      return;
    }
    while (node) {
      node.renderNodeCount += diff4;
      this._onDidChangeRenderNodeCount.fire(node);
      node = node.parent;
    }
  }
  _filterNode(node, parentVisibility) {
    const result = this.filter ? this.filter.filter(node.element, parentVisibility) : 1 /* Visible */;
    if (typeof result === "boolean") {
      node.filterData = void 0;
      return result ? 1 /* Visible */ : 0 /* Hidden */;
    } else if (isFilterResult(result)) {
      node.filterData = result.data;
      return getVisibleState(result.visibility);
    } else {
      node.filterData = void 0;
      return getVisibleState(result);
    }
  }
  // cheap
  hasTreeNode(location2, node = this.root) {
    if (!location2 || location2.length === 0) {
      return true;
    }
    const [index2, ...rest] = location2;
    if (index2 < 0 || index2 > node.children.length) {
      return false;
    }
    return this.hasTreeNode(rest, node.children[index2]);
  }
  // cheap
  getTreeNode(location2, node = this.root) {
    if (!location2 || location2.length === 0) {
      return node;
    }
    const [index2, ...rest] = location2;
    if (index2 < 0 || index2 > node.children.length) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    return this.getTreeNode(rest, node.children[index2]);
  }
  // expensive
  getTreeNodeWithListIndex(location2) {
    if (location2.length === 0) {
      return { node: this.root, listIndex: -1, revealed: true, visible: false };
    }
    const { parentNode, listIndex, revealed, visible } = this.getParentNodeWithListIndex(location2);
    const index2 = location2[location2.length - 1];
    if (index2 < 0 || index2 > parentNode.children.length) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    const node = parentNode.children[index2];
    return { node, listIndex, revealed, visible: visible && node.visible };
  }
  getParentNodeWithListIndex(location2, node = this.root, listIndex = 0, revealed = true, visible = true) {
    const [index2, ...rest] = location2;
    if (index2 < 0 || index2 > node.children.length) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    for (let i2 = 0; i2 < index2; i2++) {
      listIndex += node.children[i2].renderNodeCount;
    }
    revealed = revealed && !node.collapsed;
    visible = visible && node.visible;
    if (rest.length === 0) {
      return { parentNode: node, listIndex, revealed, visible };
    }
    return this.getParentNodeWithListIndex(rest, node.children[index2], listIndex + 1, revealed, visible);
  }
  getNode(location2 = []) {
    return this.getTreeNode(location2);
  }
  // TODO@joao perf!
  getNodeLocation(node) {
    const location2 = [];
    let indexTreeNode = node;
    while (indexTreeNode.parent) {
      location2.push(indexTreeNode.parent.children.indexOf(indexTreeNode));
      indexTreeNode = indexTreeNode.parent;
    }
    return location2.reverse();
  }
  getParentNodeLocation(location2) {
    if (location2.length === 0) {
      return void 0;
    } else if (location2.length === 1) {
      return [];
    } else {
      return tail(location2)[0];
    }
  }
  getFirstElementChild(location2) {
    const node = this.getTreeNode(location2);
    if (node.children.length === 0) {
      return void 0;
    }
    return node.children[0].element;
  }
  getLastElementAncestor(location2 = []) {
    const node = this.getTreeNode(location2);
    if (node.children.length === 0) {
      return void 0;
    }
    return this._getLastElementAncestor(node);
  }
  _getLastElementAncestor(node) {
    if (node.children.length === 0) {
      return node.element;
    }
    return this._getLastElementAncestor(node.children[node.children.length - 1]);
  }
};
export { isFilterResult, getVisibleState, isCollapsibleStateUpdate, IndexTreeModel };
