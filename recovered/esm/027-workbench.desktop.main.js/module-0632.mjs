// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/tree/objectTree.ts
import { AbstractTree } from "./module-0629.mjs";
import { Iterable } from "./module-0011.mjs";
import { ObjectTreeModel } from "./module-0630.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";
import { CompressibleObjectTreeModel } from "./module-0631.mjs";


// src/vs/base/browser/ui/tree/objectTree.ts
var ObjectTree = class extends AbstractTree {
  constructor(user, container3, delegate, renderers, options3 = {}) {
    super(user, container3, delegate, renderers, options3);
    this.user = user;
  }
  get onDidChangeCollapseState() {
    return this.model.onDidChangeCollapseState;
  }
  setChildren(element, children = Iterable.empty(), options3) {
    this.model.setChildren(element, children, options3);
  }
  rerender(element) {
    if (element === void 0) {
      this.view.rerender();
      return;
    }
    this.model.rerender(element);
  }
  updateElementHeight(element, height) {
    const elementIndex = this.model.getListIndex(element);
    if (elementIndex === -1) {
      return;
    }
    this.view.updateElementHeight(elementIndex, height);
  }
  getListRenderCount(element) {
    return this.model.getListRenderCount(element);
  }
  resort(element, recursive = true) {
    this.model.resort(element, recursive);
  }
  hasElement(element) {
    return this.model.has(element);
  }
  createModel(user, options3) {
    return new ObjectTreeModel(user, options3);
  }
};

var CompressibleRenderer = class {
  constructor(_compressedTreeNodeProvider, stickyScrollDelegate, renderer) {
    this._compressedTreeNodeProvider = _compressedTreeNodeProvider;
    this.stickyScrollDelegate = stickyScrollDelegate;
    this.renderer = renderer;
    this.templateId = renderer.templateId;
    if (renderer.onDidChangeTwistieState) {
      this.onDidChangeTwistieState = renderer.onDidChangeTwistieState;
    }
  }
  get compressedTreeNodeProvider() {
    return this._compressedTreeNodeProvider();
  }
  renderTemplate(container3) {
    const data = this.renderer.renderTemplate(container3);
    return { compressedTreeNode: void 0, data };
  }
  renderElement(node, index2, templateData, details) {
    let compressedTreeNode = this.stickyScrollDelegate.getCompressedNode(node);
    if (!compressedTreeNode) {
      compressedTreeNode = this.compressedTreeNodeProvider.getCompressedTreeNode(node.element);
    }
    if (compressedTreeNode.element.elements.length === 1) {
      templateData.compressedTreeNode = void 0;
      this.renderer.renderElement(node, index2, templateData.data, details);
    } else {
      templateData.compressedTreeNode = compressedTreeNode;
      this.renderer.renderCompressedElements(compressedTreeNode, index2, templateData.data, details);
    }
  }
  disposeElement(node, index2, templateData, details) {
    if (templateData.compressedTreeNode) {
      this.renderer.disposeCompressedElements?.(templateData.compressedTreeNode, index2, templateData.data, details);
    } else {
      this.renderer.disposeElement?.(node, index2, templateData.data, details);
    }
  }
  disposeTemplate(templateData) {
    this.renderer.disposeTemplate(templateData.data);
  }
  renderTwistie(element, twistieElement) {
    return this.renderer.renderTwistie?.(element, twistieElement) ?? false;
  }
};

__decorateClass([
  memoize
], CompressibleRenderer.prototype, "compressedTreeNodeProvider", 1);

var CompressibleStickyScrollDelegate = class {
  constructor(modelProvider) {
    this.modelProvider = modelProvider;
    this.compressedStickyNodes = /* @__PURE__ */ new Map();
  }
  getCompressedNode(node) {
    return this.compressedStickyNodes.get(node);
  }
  constrainStickyScrollNodes(stickyNodes, stickyScrollMaxItemCount, maxWidgetHeight) {
    this.compressedStickyNodes.clear();
    if (stickyNodes.length === 0) {
      return [];
    }
    for (let i2 = 0; i2 < stickyNodes.length; i2++) {
      const stickyNode = stickyNodes[i2];
      const stickyNodeBottom = stickyNode.position + stickyNode.height;
      const followingReachesMaxHeight = i2 + 1 < stickyNodes.length && stickyNodeBottom + stickyNodes[i2 + 1].height > maxWidgetHeight;
      if (followingReachesMaxHeight || i2 >= stickyScrollMaxItemCount - 1 && stickyScrollMaxItemCount < stickyNodes.length) {
        const uncompressedStickyNodes = stickyNodes.slice(0, i2);
        const overflowingStickyNodes = stickyNodes.slice(i2);
        const compressedStickyNode = this.compressStickyNodes(overflowingStickyNodes);
        return [...uncompressedStickyNodes, compressedStickyNode];
      }
    }
    return stickyNodes;
  }
  compressStickyNodes(stickyNodes) {
    if (stickyNodes.length === 0) {
      throw new Error("Can't compress empty sticky nodes");
    }
    const compressionModel = this.modelProvider();
    if (!compressionModel.isCompressionEnabled()) {
      return stickyNodes[0];
    }
    const elements = [];
    for (let i2 = 0; i2 < stickyNodes.length; i2++) {
      const stickyNode = stickyNodes[i2];
      const compressedNode2 = compressionModel.getCompressedTreeNode(stickyNode.node.element);
      if (compressedNode2.element) {
        if (i2 !== 0 && compressedNode2.element.incompressible) {
          break;
        }
        elements.push(...compressedNode2.element.elements);
      }
    }
    if (elements.length < 2) {
      return stickyNodes[0];
    }
    const lastStickyNode = stickyNodes[stickyNodes.length - 1];
    const compressedElement = { elements, incompressible: false };
    const compressedNode = { ...lastStickyNode.node, children: [], element: compressedElement };
    const stickyTreeNode = new Proxy(stickyNodes[0].node, {});
    const compressedStickyNode = {
      node: stickyTreeNode,
      startIndex: stickyNodes[0].startIndex,
      endIndex: lastStickyNode.endIndex,
      position: stickyNodes[0].position,
      height: stickyNodes[0].height,
      sourceNodeEnd: stickyNodes[0].sourceNodeEnd,
      sourceNodePartiallyVisible: stickyNodes.some((node) => node.sourceNodePartiallyVisible),
      hasExplicitHeight: stickyNodes[0].hasExplicitHeight
    };
    this.compressedStickyNodes.set(stickyTreeNode, compressedNode);
    return compressedStickyNode;
  }
};

function asObjectTreeOptions(compressedTreeNodeProvider, options3) {
  return options3 && {
    ...options3,
    keyboardNavigationLabelProvider: options3.keyboardNavigationLabelProvider && {
      getKeyboardNavigationLabel(e) {
        let compressedTreeNode;
        try {
          compressedTreeNode = compressedTreeNodeProvider().getCompressedTreeNode(e);
        } catch {
          return options3.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e);
        }
        if (compressedTreeNode.element.elements.length === 1) {
          return options3.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e);
        } else {
          return options3.keyboardNavigationLabelProvider.getCompressedNodeKeyboardNavigationLabel(compressedTreeNode.element.elements);
        }
      }
    }
  };
}

var CompressibleObjectTree = class extends ObjectTree {
  constructor(user, container3, delegate, renderers, options3 = {}) {
    const compressedTreeNodeProvider = () => this;
    const stickyScrollDelegate = new CompressibleStickyScrollDelegate(() => this.model);
    const compressibleRenderers = renderers.map((r2) => new CompressibleRenderer(compressedTreeNodeProvider, stickyScrollDelegate, r2));
    super(user, container3, delegate, compressibleRenderers, { ...asObjectTreeOptions(compressedTreeNodeProvider, options3), stickyScrollDelegate });
  }
  setChildren(element, children = Iterable.empty(), options3) {
    this.model.setChildren(element, children, options3);
  }
  createModel(user, options3) {
    return new CompressibleObjectTreeModel(user, options3);
  }
  updateOptions(optionsUpdate = {}) {
    super.updateOptions(optionsUpdate);
    if (typeof optionsUpdate.compressionEnabled !== "undefined") {
      this.model.setCompressionEnabled(optionsUpdate.compressionEnabled);
    }
  }
  getCompressedTreeNode(element = null) {
    return this.model.getCompressedTreeNode(element);
  }
};
export { asObjectTreeOptions, ObjectTree, CompressibleRenderer, CompressibleStickyScrollDelegate, CompressibleObjectTree };
