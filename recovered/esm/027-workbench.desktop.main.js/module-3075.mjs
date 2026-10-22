// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/explorerProjections/treeProjection.ts
import { TestItemTreeElement, TestTreeErrorMessage, getChildrenForParent, testIdentityProvider } from "./module-3045.mjs";
import { Iterable } from "./module-0011.mjs";
import { applyTestItemUpdate } from "./module-1208.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { refreshComputedState } from "./module-1431.mjs";
import { TestId } from "./module-1207.mjs";
import { isCollapsedInSerializedTestTree } from "./module-3044.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITestService } from "./module-1435.mjs";
import { ITestResultService } from "./module-1434.mjs";


// src/vs/workbench/contrib/testing/browser/explorerProjections/treeProjection.ts
var computedStateAccessor = {
  getOwnState: (i2) => i2 instanceof TestItemTreeElement ? i2.ownState : 0 /* Unset */,
  getCurrentComputedState: (i2) => i2.state,
  setComputedState: (i2, s) => i2.state = s,
  getCurrentComputedDuration: (i2) => i2.duration,
  getOwnDuration: (i2) => i2 instanceof TestItemTreeElement ? i2.ownDuration : void 0,
  setComputedDuration: (i2, d) => i2.duration = d,
  getChildren: (i2) => Iterable.filter(
    i2.children.values(),
    (t2) => t2 instanceof TreeTestItemElement
  ),
  *getParents(i2) {
    for (let parent = i2.parent; parent; parent = parent.parent) {
      yield parent;
    }
  }
};

var TreeTestItemElement = class extends TestItemTreeElement {
  constructor(test, parent, addedOrRemoved) {
    super({ ...test, item: { ...test.item } }, parent);
    this.addedOrRemoved = addedOrRemoved;
    /**
     * Own, non-computed state.
     * @internal
     */
    this.ownState = 0 /* Unset */;
    this.updateErrorVisibility();
  }
  get description() {
    return this.test.item.description;
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
      this.addedOrRemoved(this);
      this.children.delete(this.errorChild);
      this.errorChild = void 0;
    }
    if (this.test.item.error && !this.errorChild) {
      this.errorChild = new TestTreeErrorMessage(this.test.item.error, this);
      this.children.add(this.errorChild);
      this.addedOrRemoved(this);
    }
  }
};

var TreeProjection = class extends Disposable {
  constructor(lastState, testService, results) {
    super();
    this.lastState = lastState;
    this.testService = testService;
    this.results = results;
    this.updateEmitter = this._register(new Emitter());
    this.changedParents = /* @__PURE__ */ new Set();
    this.resortedParents = /* @__PURE__ */ new Set();
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
      for (const inTree of [...this.items.values()].sort((a, b) => b.depth - a.depth)) {
        const lookup = this.results.getStateById(inTree.test.item.extId)?.[1];
        inTree.ownDuration = lookup?.ownDuration;
        refreshComputedState(computedStateAccessor, inTree, lookup?.ownComputedState ?? 0 /* Unset */).forEach((i2) => i2.fireChange());
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
      const refreshDuration = ev.reason === 1 /* OwnStateChange */ && ev.previousOwnDuration !== result.ownDuration;
      const explicitComputed = item.children.size ? void 0 : result.computedState;
      item.retired = !!result.retired;
      item.ownState = result.ownComputedState;
      item.ownDuration = result.ownDuration;
      item.fireChange();
      refreshComputedState(computedStateAccessor, item, explicitComputed, refreshDuration).forEach((i2) => i2.fireChange());
    }));
    for (const test of testService.collection.all) {
      this.storeItem(this.createItem(test));
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
          const item = this.createItem(op.item);
          this.storeItem(item);
          break;
        }
        case 1 /* Update */: {
          const patch2 = op.item;
          const existing = this.items.get(patch2.extId);
          if (!existing) {
            break;
          }
          const needsParentUpdate = existing.test.expand === 0 /* NotExpandable */ && patch2.expand;
          existing.update(patch2);
          if (needsParentUpdate) {
            this.changedParents.add(existing.parent);
          } else {
            this.resortedParents.add(existing.parent);
          }
          break;
        }
        case 3 /* Remove */: {
          const toRemove = this.items.get(op.itemId);
          if (!toRemove) {
            break;
          }
          const parent = toRemove.parent;
          const affectsRootElement = toRemove.depth === 1 && (parent?.children.size === 1 || !Iterable.some(this.rootsWithChildren, (_, i2) => i2 === 1));
          this.changedParents.add(affectsRootElement ? null : parent);
          const queue = [[toRemove]];
          while (queue.length) {
            for (const item of queue.pop()) {
              if (item instanceof TreeTestItemElement) {
                queue.push(this.unstoreItem(item));
              }
            }
          }
          if (parent instanceof TreeTestItemElement) {
            refreshComputedState(computedStateAccessor, parent, void 0, !!parent.duration).forEach((i2) => i2.fireChange());
          }
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
    for (const parent of this.changedParents) {
      if (!parent || tree.hasElement(parent)) {
        tree.setChildren(parent, getChildrenForParent(this.lastState, this.rootsWithChildren, parent), { diffIdentityProvider: testIdentityProvider });
      }
    }
    for (const parent of this.resortedParents) {
      if (!parent || tree.hasElement(parent)) {
        tree.resort(parent, false);
      }
    }
    this.changedParents.clear();
    this.resortedParents.clear();
  }
  /**
   * @inheritdoc
   */
  expandElement(element, depth) {
    if (!(element instanceof TreeTestItemElement)) {
      return;
    }
    if (element.test.expand === 0 /* NotExpandable */) {
      return;
    }
    this.testService.collection.expand(element.test.item.extId, depth);
  }
  createItem(item) {
    const parentId = TestId.parentId(item.item.extId);
    const parent = parentId ? this.items.get(parentId) : null;
    return new TreeTestItemElement(item, parent, (n2) => this.changedParents.add(n2));
  }
  unstoreItem(treeElement) {
    const parent = treeElement.parent;
    parent?.children.delete(treeElement);
    this.items.delete(treeElement.test.item.extId);
    return treeElement.children;
  }
  storeItem(treeElement) {
    treeElement.parent?.children.add(treeElement);
    this.items.set(treeElement.test.item.extId, treeElement);
    const affectsParent = treeElement.parent?.children.size === 1;
    const affectedParent = affectsParent ? treeElement.parent.parent : treeElement.parent;
    this.changedParents.add(affectedParent);
    if (affectedParent?.depth === 0) {
      this.changedParents.add(null);
    }
    if (treeElement.depth === 0 || isCollapsedInSerializedTestTree(this.lastState, treeElement.test.item.extId) === false) {
      this.expandElement(treeElement, 0);
    }
    const prevState = this.results.getStateById(treeElement.test.item.extId)?.[1];
    if (prevState) {
      treeElement.retired = !!prevState.retired;
      treeElement.ownState = prevState.computedState;
      treeElement.ownDuration = prevState.ownDuration;
      refreshComputedState(computedStateAccessor, treeElement, void 0, !!treeElement.ownDuration).forEach((i2) => i2.fireChange());
    }
  }
};

TreeProjection = __decorateClass([
  __decorateParam(1, ITestService),
  __decorateParam(2, ITestResultService)
], TreeProjection);
export { computedStateAccessor, TreeTestItemElement, TreeProjection };
