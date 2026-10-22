// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/explorerProjections/testingObjectTree.ts
import { WorkbenchObjectTree } from "./module-0636.mjs";
import { TestItemTreeElement } from "./module-3045.mjs";
import { TestId } from "./module-1207.mjs";


// src/vs/workbench/contrib/testing/browser/explorerProjections/testingObjectTree.ts
var TestingObjectTree = class extends WorkbenchObjectTree {
  /**
   * Gets a serialized view state for the tree, optimized for storage.
   *
   * @param updatePreviousState Optional previous state to mutate and update
   * instead of creating a new one.
   */
  getOptimizedViewState(updatePreviousState) {
    const root = updatePreviousState || {};
    const build = (node, parent) => {
      if (!(node.element instanceof TestItemTreeElement)) {
        return false;
      }
      const localId = TestId.localId(node.element.test.item.extId);
      const inTree = parent.children?.[localId] || {};
      inTree.collapsed = node.depth === 0 || !node.collapsed ? node.collapsed : void 0;
      let hasAnyNonDefaultValue = inTree.collapsed !== void 0;
      if (node.children.length) {
        for (const child of node.children) {
          hasAnyNonDefaultValue = build(child, inTree) || hasAnyNonDefaultValue;
        }
      }
      if (hasAnyNonDefaultValue) {
        parent.children ??= {};
        parent.children[localId] = inTree;
      } else if (parent.children?.hasOwnProperty(localId)) {
        delete parent.children[localId];
      }
      return hasAnyNonDefaultValue;
    };
    root.children ??= {};
    for (const node of this.getNode().children) {
      if (node.element instanceof TestItemTreeElement) {
        if (node.element.test.controllerId === node.element.test.item.extId) {
          build(node, root);
        } else {
          const ctrlNode = root.children[node.element.test.controllerId] ??= { children: {} };
          build(node, ctrlNode);
        }
      }
    }
    return root;
  }
};
export { TestingObjectTree };
