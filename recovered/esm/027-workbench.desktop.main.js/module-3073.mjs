// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/explorerProjections/listProjection.ts
import { TestItemTreeElement, TestTreeErrorMessage, getChildrenForParent, testIdentityProvider } from "./module-3045.mjs";
import { flatTestItemDelimiter } from "./module-3072.mjs";
import { applyTestItemUpdate } from "./module-1208.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Iterable } from "./module-0011.mjs";
import { TestId } from "./module-1207.mjs";
import { isCollapsedInSerializedTestTree } from "./module-3044.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITestService } from "./module-1435.mjs";
import { ITestResultService } from "./module-1434.mjs";


// src/vs/workbench/contrib/testing/browser/explorerProjections/listProjection.ts
var ListTestItemElement = class extends TestItemTreeElement {
  constructor(test, parent, chain) {
    super({ ...test, item: { ...test.item } }, parent);
    this.chain = chain;
    this.descriptionParts = [];
    this.updateErrorVisibility();
  }
  get description() {
    return this.chain.map((c) => c.item.label).join(flatTestItemDelimiter);
  }
  update(patch2) {
    applyTestItemUpdate(this.test, patch2);
    this.updateErrorVisibility(patch2);
    this.fireChange();
  }
  fireChange() {
    this.changeEmitter.fire();
  }
  updateErrorVisibility(patch2) {
    if (this.errorChild && (!this.test.item.error || patch2?.item?.error)) {
      this.children.delete(this.errorChild);
      this.errorChild = void 0;
    }
    if (this.test.item.error && !this.errorChild) {
      this.errorChild = new TestTreeErrorMessage(this.test.item.error, this);
      this.children.add(this.errorChild);
    }
  }
};

var ListProjection = class extends Disposable {
  constructor(lastState, testService, results) {
    super();
    this.lastState = lastState;
    this.testService = testService;
    this.results = results;
    this.updateEmitter = this._register(new Emitter());
    this.items = /* @__PURE__ */ new Map();
    /**
     * @inheritdoc
     */
    this.onUpdate = this.updateEmitter.event;
    this._register(testService.onDidProcessDiff((diff4) => this.applyDiff(diff4)));
    this._register(results.onResultsChanged((evt) => {
      if (!("removed" in evt)) {
        return;
      }
      for (const inTree of this.items.values()) {
        const lookup = this.results.getStateById(inTree.test.item.extId)?.[1];
        inTree.duration = lookup?.ownDuration;
        inTree.state = lookup?.ownComputedState || 0 /* Unset */;
        inTree.fireChange();
      }
    }));
    this._register(results.onTestChanged((ev) => {
      if (ev.reason === 2 /* NewMessage */) {
        return;
      }
      let result = ev.item;
      if (result.ownComputedState === 0 /* Unset */ || ev.result !== results.results[0]) {
        const fallback2 = results.getStateById(result.item.extId);
        if (fallback2) {
          result = fallback2[1];
        }
      }
      const item = this.items.get(result.item.extId);
      if (!item) {
        return;
      }
      item.retired = !!result.retired;
      item.state = result.computedState;
      item.duration = result.ownDuration;
      item.fireChange();
    }));
    for (const test of testService.collection.all) {
      this.storeItem(test);
    }
  }
  /**
   * Gets root elements of the tree.
   */
  get rootsWithChildren() {
    const rootsIt = Iterable.map(this.testService.collection.rootItems, (r2) => this.items.get(r2.item.extId));
    return Iterable.filter(rootsIt, (r2) => !!r2?.children.size);
  }
  /**
   * @inheritdoc
   */
  getElementByTestId(testId) {
    return this.items.get(testId);
  }
  /**
   * @inheritdoc
   */
  applyDiff(diff4) {
    for (const op of diff4) {
      switch (op.op) {
        case 0 /* Add */: {
          this.storeItem(op.item);
          break;
        }
        case 1 /* Update */: {
          this.items.get(op.item.extId)?.update(op.item);
          break;
        }
        case 3 /* Remove */: {
          for (const [id2, item] of this.items) {
            if (id2 === op.itemId || TestId.isChild(op.itemId, id2)) {
              this.unstoreItem(item);
            }
          }
          break;
        }
      }
    }
    if (diff4.length !== 0) {
      this.updateEmitter.fire();
    }
  }
  /**
   * @inheritdoc
   */
  applyTo(tree) {
    tree.setChildren(null, getChildrenForParent(this.lastState, this.rootsWithChildren, null), {
      diffIdentityProvider: testIdentityProvider,
      diffDepth: Infinity
    });
  }
  /**
   * @inheritdoc
   */
  expandElement(element, depth) {
    if (!(element instanceof ListTestItemElement)) {
      return;
    }
    if (element.test.expand === 0 /* NotExpandable */) {
      return;
    }
    this.testService.collection.expand(element.test.item.extId, depth);
  }
  unstoreItem(treeElement) {
    this.items.delete(treeElement.test.item.extId);
    treeElement.parent?.children.delete(treeElement);
    const parentId = TestId.fromString(treeElement.test.item.extId).parentId;
    if (!parentId) {
      return;
    }
    for (const id2 of parentId.idsToRoot()) {
      const parentTest = this.testService.collection.getNodeById(id2.toString());
      if (parentTest) {
        if (parentTest.children.size === 0 && !this.items.has(id2.toString())) {
          this._storeItem(parentId, parentTest);
        }
        break;
      }
    }
  }
  _storeItem(testId, item) {
    const displayedParent = testId.isRoot ? null : this.items.get(item.controllerId);
    const chain = [...testId.idsFromRoot()].slice(1, -1).map((id2) => this.testService.collection.getNodeById(id2.toString()));
    const treeElement = new ListTestItemElement(item, displayedParent, chain);
    displayedParent?.children.add(treeElement);
    this.items.set(treeElement.test.item.extId, treeElement);
    if (treeElement.depth === 0 || isCollapsedInSerializedTestTree(this.lastState, treeElement.test.item.extId) === false) {
      this.expandElement(treeElement, Infinity);
    }
    const prevState = this.results.getStateById(treeElement.test.item.extId)?.[1];
    if (prevState) {
      treeElement.retired = !!prevState.retired;
      treeElement.state = prevState.computedState;
      treeElement.duration = prevState.ownDuration;
    }
  }
  storeItem(item) {
    const testId = TestId.fromString(item.item.extId);
    for (const parentId of testId.idsToRoot()) {
      if (!parentId.isRoot) {
        const prevParent = this.items.get(parentId.toString());
        if (prevParent) {
          this.unstoreItem(prevParent);
          break;
        }
      }
    }
    this._storeItem(testId, item);
  }
};

ListProjection = __decorateClass([
  __decorateParam(1, ITestService),
  __decorateParam(2, ITestResultService)
], ListProjection);
export { ListTestItemElement, ListProjection };
