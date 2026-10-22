// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/explorerProjections/index.ts
import { Emitter } from "./module-0017.mjs";
import { InternalTestItem } from "./module-1208.mjs";
import { Iterable } from "./module-0011.mjs";
import { isCollapsedInSerializedTestTree } from "./module-3044.mjs";


// src/vs/workbench/contrib/testing/browser/explorerProjections/index.ts
var idCounter = 0;

var getId = () => String(idCounter++);

var TestItemTreeElement = class {
  constructor(test, parent = null) {
    this.test = test;
    this.parent = parent;
    this.changeEmitter = new Emitter();
    /**
     * Fired whenever the element or test properties change.
     */
    this.onChange = this.changeEmitter.event;
    /**
     * Tree children of this item.
     */
    this.children = /* @__PURE__ */ new Set();
    /**
     * Unique ID of the element in the tree.
     */
    this.treeId = getId();
    /**
     * Whether the node's test result is 'retired' -- from an outdated test run.
     */
    this.retired = false;
    /**
     * State to show on the item. This is generally the item's computed state
     * from its children.
     */
    this.state = 0 /* Unset */;
    this.depth = parent ? parent.depth + 1 : 0;
  }
  toJSON() {
    if (this.depth === 0) {
      return { controllerId: this.test.controllerId };
    }
    const context2 = {
      $mid: 16 /* TestItemContext */,
      tests: [InternalTestItem.serialize(this.test)]
    };
    for (let p = this.parent; p && p.depth > 0; p = p.parent) {
      context2.tests.unshift(InternalTestItem.serialize(p.test));
    }
    return context2;
  }
};

var TestTreeErrorMessage = class {
  constructor(message, parent) {
    this.message = message;
    this.parent = parent;
    this.treeId = getId();
    this.children = /* @__PURE__ */ new Set();
  }
  get description() {
    return typeof this.message === "string" ? this.message : this.message.value;
  }
};

var testIdentityProvider = {
  getId(element) {
    const expandComponent = element instanceof TestTreeErrorMessage ? "error" : element.test.expand === 0 /* NotExpandable */ ? !!element.children.size : element.test.expand;
    return element.treeId + "\0" + expandComponent;
  }
};

var getChildrenForParent = (serialized, rootsWithChildren, node) => {
  let it;
  if (node === null) {
    const rootsWithChildrenArr = [...rootsWithChildren];
    if (rootsWithChildrenArr.length === 1) {
      return getChildrenForParent(serialized, rootsWithChildrenArr, rootsWithChildrenArr[0]);
    }
    it = rootsWithChildrenArr;
  } else {
    it = node.children;
  }
  return Iterable.map(it, (element) => element instanceof TestTreeErrorMessage ? { element } : {
    element,
    collapsible: element.test.expand !== 0 /* NotExpandable */,
    collapsed: element.test.item.error ? 2 /* PreserveOrExpanded */ : isCollapsedInSerializedTestTree(serialized, element.test.item.extId) ?? element.depth > 0 ? 3 /* PreserveOrCollapsed */ : 2 /* PreserveOrExpanded */,
    children: getChildrenForParent(serialized, rootsWithChildren, element)
  });
};
export { idCounter, getId, TestItemTreeElement, TestTreeErrorMessage, testIdentityProvider, getChildrenForParent };
