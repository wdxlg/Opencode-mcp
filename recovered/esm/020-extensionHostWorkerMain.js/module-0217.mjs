// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/testing/common/testTypes.ts
import { localize } from "./module-0015.mjs";
import { Range } from "./module-0084.mjs";
import { URI } from "./module-0023.mjs";
import { Position } from "./module-0083.mjs";
import { TestId } from "./module-0216.mjs";


// src/vs/workbench/contrib/testing/common/testTypes.ts
var testProfileBitset = {
  [2 /* Run */]: localize(21370, null),
  [4 /* Debug */]: localize(21369, null),
  [8 /* Coverage */]: localize(21368, null)
};

var isStartControllerTests = (t) => "runId" in t;

var IRichLocation;

((IRichLocation2) => {
  IRichLocation2.serialize = (location2) => ({
    range: location2.range.toJSON(),
    uri: location2.uri.toJSON()
  });
  IRichLocation2.deserialize = (uriIdentity, location2) => ({
    range: Range.lift(location2.range),
    uri: uriIdentity.asCanonicalUri(URI.revive(location2.uri))
  });
})(IRichLocation || (IRichLocation = {}));

var ITestMessageStackFrame;

((ITestMessageStackFrame2) => {
  ITestMessageStackFrame2.serialize = (stack) => ({
    label: stack.label,
    uri: stack.uri?.toJSON(),
    position: stack.position?.toJSON()
  });
  ITestMessageStackFrame2.deserialize = (uriIdentity, stack) => ({
    label: stack.label,
    uri: stack.uri ? uriIdentity.asCanonicalUri(URI.revive(stack.uri)) : void 0,
    position: stack.position ? Position.lift(stack.position) : void 0
  });
})(ITestMessageStackFrame || (ITestMessageStackFrame = {}));

var ITestErrorMessage;

((ITestErrorMessage4) => {
  ITestErrorMessage4.serialize = (message) => ({
    message: message.message,
    type: 0 /* Error */,
    expected: message.expected,
    actual: message.actual,
    contextValue: message.contextValue,
    location: message.location && IRichLocation.serialize(message.location),
    stackTrace: message.stackTrace?.map(ITestMessageStackFrame.serialize)
  });
  ITestErrorMessage4.deserialize = (uriIdentity, message) => ({
    message: message.message,
    type: 0 /* Error */,
    expected: message.expected,
    actual: message.actual,
    contextValue: message.contextValue,
    location: message.location && IRichLocation.deserialize(uriIdentity, message.location),
    stackTrace: message.stackTrace && message.stackTrace.map((s) => ITestMessageStackFrame.deserialize(uriIdentity, s))
  });
})(ITestErrorMessage || (ITestErrorMessage = {}));

var ITestOutputMessage;

((ITestOutputMessage2) => {
  ITestOutputMessage2.serialize = (message) => ({
    message: message.message,
    type: 1 /* Output */,
    offset: message.offset,
    length: message.length,
    location: message.location && IRichLocation.serialize(message.location)
  });
  ITestOutputMessage2.deserialize = (uriIdentity, message) => ({
    message: message.message,
    type: 1 /* Output */,
    offset: message.offset,
    length: message.length,
    location: message.location && IRichLocation.deserialize(uriIdentity, message.location)
  });
})(ITestOutputMessage || (ITestOutputMessage = {}));

var ITestMessage;

((ITestMessage2) => {
  ITestMessage2.serialize = (message) => message.type === 0 /* Error */ ? ITestErrorMessage.serialize(message) : ITestOutputMessage.serialize(message);
  ITestMessage2.deserialize = (uriIdentity, message) => message.type === 0 /* Error */ ? ITestErrorMessage.deserialize(uriIdentity, message) : ITestOutputMessage.deserialize(uriIdentity, message);
  ITestMessage2.isDiffable = (message) => message.type === 0 /* Error */ && message.actual !== void 0 && message.expected !== void 0;
})(ITestMessage || (ITestMessage = {}));

var ITestTaskState;

((ITestTaskState2) => {
  ITestTaskState2.serializeWithoutMessages = (state) => ({
    state: state.state,
    duration: state.duration,
    messages: []
  });
  ITestTaskState2.serialize = (state) => ({
    state: state.state,
    duration: state.duration,
    messages: state.messages.map(ITestMessage.serialize)
  });
  ITestTaskState2.deserialize = (uriIdentity, state) => ({
    state: state.state,
    duration: state.duration,
    messages: state.messages.map((m) => ITestMessage.deserialize(uriIdentity, m))
  });
})(ITestTaskState || (ITestTaskState = {}));

var testTagDelimiter = "\0";

var namespaceTestTag = (ctrlId, tagId) => ctrlId + testTagDelimiter + tagId;

var denamespaceTestTag = (namespaced) => {
  const index = namespaced.indexOf(testTagDelimiter);
  return { ctrlId: namespaced.slice(0, index), tagId: namespaced.slice(index + 1) };
};

var ITestItem;

((ITestItem6) => {
  ITestItem6.serialize = (item) => ({
    extId: item.extId,
    label: item.label,
    tags: item.tags,
    busy: item.busy,
    children: void 0,
    uri: item.uri?.toJSON(),
    range: item.range?.toJSON() || null,
    description: item.description,
    error: item.error,
    sortText: item.sortText
  });
  ITestItem6.deserialize = (uriIdentity, serialized) => ({
    extId: serialized.extId,
    label: serialized.label,
    tags: serialized.tags,
    busy: serialized.busy,
    children: void 0,
    uri: serialized.uri ? uriIdentity.asCanonicalUri(URI.revive(serialized.uri)) : void 0,
    range: serialized.range ? Range.lift(serialized.range) : null,
    description: serialized.description,
    error: serialized.error,
    sortText: serialized.sortText
  });
})(ITestItem || (ITestItem = {}));

var InternalTestItem;

((InternalTestItem3) => {
  InternalTestItem3.serialize = (item) => ({
    expand: item.expand,
    item: ITestItem.serialize(item.item)
  });
  InternalTestItem3.deserialize = (uriIdentity, serialized) => ({
    // the `controllerId` is derived from the test.item.extId. It's redundant
    // in the non-serialized InternalTestItem too, but there just because it's
    // checked against in many hot paths.
    controllerId: TestId.root(serialized.item.extId),
    expand: serialized.expand,
    item: ITestItem.deserialize(uriIdentity, serialized.item)
  });
})(InternalTestItem || (InternalTestItem = {}));

var ITestItemUpdate;

((ITestItemUpdate2) => {
  ITestItemUpdate2.serialize = (u) => {
    let item;
    if (u.item) {
      item = {};
      if (u.item.label !== void 0) {
        item.label = u.item.label;
      }
      if (u.item.tags !== void 0) {
        item.tags = u.item.tags;
      }
      if (u.item.busy !== void 0) {
        item.busy = u.item.busy;
      }
      if (u.item.uri !== void 0) {
        item.uri = u.item.uri?.toJSON();
      }
      if (u.item.range !== void 0) {
        item.range = u.item.range?.toJSON();
      }
      if (u.item.description !== void 0) {
        item.description = u.item.description;
      }
      if (u.item.error !== void 0) {
        item.error = u.item.error;
      }
      if (u.item.sortText !== void 0) {
        item.sortText = u.item.sortText;
      }
    }
    return { extId: u.extId, expand: u.expand, item };
  };
  ITestItemUpdate2.deserialize = (u) => {
    let item;
    if (u.item) {
      item = {};
      if (u.item.label !== void 0) {
        item.label = u.item.label;
      }
      if (u.item.tags !== void 0) {
        item.tags = u.item.tags;
      }
      if (u.item.busy !== void 0) {
        item.busy = u.item.busy;
      }
      if (u.item.range !== void 0) {
        item.range = u.item.range ? Range.lift(u.item.range) : null;
      }
      if (u.item.description !== void 0) {
        item.description = u.item.description;
      }
      if (u.item.error !== void 0) {
        item.error = u.item.error;
      }
      if (u.item.sortText !== void 0) {
        item.sortText = u.item.sortText;
      }
    }
    return { extId: u.extId, expand: u.expand, item };
  };
})(ITestItemUpdate || (ITestItemUpdate = {}));

var applyTestItemUpdate = (internal, patch2) => {
  if (patch2.expand !== void 0) {
    internal.expand = patch2.expand;
  }
  if (patch2.item !== void 0) {
    internal.item = internal.item ? Object.assign(internal.item, patch2.item) : patch2.item;
  }
};

var TestResultItem;

((TestResultItem3) => {
  TestResultItem3.serializeWithoutMessages = (original) => ({
    ...InternalTestItem.serialize(original),
    ownComputedState: original.ownComputedState,
    computedState: original.computedState,
    tasks: original.tasks.map(ITestTaskState.serializeWithoutMessages)
  });
  TestResultItem3.serialize = (original) => ({
    ...InternalTestItem.serialize(original),
    ownComputedState: original.ownComputedState,
    computedState: original.computedState,
    tasks: original.tasks.map(ITestTaskState.serialize)
  });
  TestResultItem3.deserialize = (uriIdentity, serialized) => ({
    ...InternalTestItem.deserialize(uriIdentity, serialized),
    ownComputedState: serialized.ownComputedState,
    computedState: serialized.computedState,
    tasks: serialized.tasks.map((m) => ITestTaskState.deserialize(uriIdentity, m)),
    retired: true
  });
})(TestResultItem || (TestResultItem = {}));

var ICoverageCount;

((ICoverageCount3) => {
  ICoverageCount3.empty = () => ({ covered: 0, total: 0 });
  ICoverageCount3.sum = (target, src) => {
    target.covered += src.covered;
    target.total += src.total;
  };
})(ICoverageCount || (ICoverageCount = {}));

var IFileCoverage;

((IFileCoverage3) => {
  IFileCoverage3.serialize = (original) => ({
    id: original.id,
    statement: original.statement,
    branch: original.branch,
    declaration: original.declaration,
    testIds: original.testIds,
    uri: original.uri.toJSON()
  });
  IFileCoverage3.deserialize = (uriIdentity, serialized) => ({
    id: serialized.id,
    statement: serialized.statement,
    branch: serialized.branch,
    declaration: serialized.declaration,
    testIds: serialized.testIds,
    uri: uriIdentity.asCanonicalUri(URI.revive(serialized.uri))
  });
  IFileCoverage3.empty = (id2, uri2) => ({
    id: id2,
    uri: uri2,
    statement: ICoverageCount.empty()
  });
})(IFileCoverage || (IFileCoverage = {}));

function serializeThingWithLocation(serialized) {
  return {
    ...serialized,
    location: serialized.location?.toJSON()
  };
}

function deserializeThingWithLocation(serialized) {
  serialized.location = serialized.location ? Position.isIPosition(serialized.location) ? Position.lift(serialized.location) : Range.lift(serialized.location) : void 0;
  return serialized;
}

var CoverageDetails;

((CoverageDetails4) => {
  CoverageDetails4.serialize = (original) => original.type === 0 /* Declaration */ ? IDeclarationCoverage.serialize(original) : IStatementCoverage.serialize(original);
  CoverageDetails4.deserialize = (serialized) => serialized.type === 0 /* Declaration */ ? IDeclarationCoverage.deserialize(serialized) : IStatementCoverage.deserialize(serialized);
})(CoverageDetails || (CoverageDetails = {}));

var IBranchCoverage;

((IBranchCoverage2) => {
  IBranchCoverage2.serialize = serializeThingWithLocation;
  IBranchCoverage2.deserialize = deserializeThingWithLocation;
})(IBranchCoverage || (IBranchCoverage = {}));

var IDeclarationCoverage;

((IDeclarationCoverage2) => {
  IDeclarationCoverage2.serialize = serializeThingWithLocation;
  IDeclarationCoverage2.deserialize = deserializeThingWithLocation;
})(IDeclarationCoverage || (IDeclarationCoverage = {}));

var IStatementCoverage;

((IStatementCoverage2) => {
  IStatementCoverage2.serialize = (original) => ({
    ...serializeThingWithLocation(original),
    branches: original.branches?.map(IBranchCoverage.serialize)
  });
  IStatementCoverage2.deserialize = (serialized) => ({
    ...deserializeThingWithLocation(serialized),
    branches: serialized.branches?.map(IBranchCoverage.deserialize)
  });
})(IStatementCoverage || (IStatementCoverage = {}));

var TestsDiffOp;

((TestsDiffOp3) => {
  TestsDiffOp3.deserialize = (uriIdentity, u) => {
    if (u.op === 0 /* Add */) {
      return { op: u.op, item: InternalTestItem.deserialize(uriIdentity, u.item) };
    } else if (u.op === 1 /* Update */) {
      return { op: u.op, item: ITestItemUpdate.deserialize(u.item) };
    } else if (u.op === 2 /* DocumentSynced */) {
      return { op: u.op, uri: uriIdentity.asCanonicalUri(URI.revive(u.uri)), docv: u.docv };
    } else {
      return u;
    }
  };
  TestsDiffOp3.serialize = (u) => {
    if (u.op === 0 /* Add */) {
      return { op: u.op, item: InternalTestItem.serialize(u.item) };
    } else if (u.op === 1 /* Update */) {
      return { op: u.op, item: ITestItemUpdate.serialize(u.item) };
    } else {
      return u;
    }
  };
})(TestsDiffOp || (TestsDiffOp = {}));

var AbstractIncrementalTestCollection = class {
  constructor(uriIdentity) {
    this.uriIdentity = uriIdentity;
    this._tags = /* @__PURE__ */ new Map();
    /**
     * Map of item IDs to test item objects.
     */
    this.items = /* @__PURE__ */ new Map();
    /**
     * ID of test root items.
     */
    this.roots = /* @__PURE__ */ new Set();
    /**
     * Number of 'busy' controllers.
     */
    this.busyControllerCount = 0;
    /**
     * Number of pending roots.
     */
    this.pendingRootCount = 0;
    /**
     * Known test tags.
     */
    this.tags = this._tags;
  }
  /**
   * Applies the diff to the collection.
   */
  apply(diff2) {
    const changes = this.createChangeCollector();
    for (const op of diff2) {
      switch (op.op) {
        case 0 /* Add */:
          this.add(InternalTestItem.deserialize(this.uriIdentity, op.item), changes);
          break;
        case 1 /* Update */:
          this.update(ITestItemUpdate.deserialize(op.item), changes);
          break;
        case 3 /* Remove */:
          this.remove(op.itemId, changes);
          break;
        case 5 /* Retire */:
          this.retireTest(op.itemId);
          break;
        case 4 /* IncrementPendingExtHosts */:
          this.updatePendingRoots(op.amount);
          break;
        case 6 /* AddTag */:
          this._tags.set(op.tag.id, op.tag);
          break;
        case 7 /* RemoveTag */:
          this._tags.delete(op.id);
          break;
      }
    }
    changes.complete?.();
  }
  add(item, changes) {
    const parentId = TestId.parentId(item.item.extId)?.toString();
    let created;
    if (!parentId) {
      created = this.createItem(item);
      this.roots.add(created);
      this.items.set(item.item.extId, created);
    } else if (this.items.has(parentId)) {
      const parent = this.items.get(parentId);
      parent.children.add(item.item.extId);
      created = this.createItem(item, parent);
      this.items.set(item.item.extId, created);
    } else {
      console.error(`Test with unknown parent ID: ${JSON.stringify(item)}`);
      return;
    }
    changes.add?.(created);
    if (item.expand === 2 /* BusyExpanding */) {
      this.busyControllerCount++;
    }
    return created;
  }
  update(patch2, changes) {
    const existing = this.items.get(patch2.extId);
    if (!existing) {
      return;
    }
    if (patch2.expand !== void 0) {
      if (existing.expand === 2 /* BusyExpanding */) {
        this.busyControllerCount--;
      }
      if (patch2.expand === 2 /* BusyExpanding */) {
        this.busyControllerCount++;
      }
    }
    applyTestItemUpdate(existing, patch2);
    changes.update?.(existing);
    return existing;
  }
  remove(itemId, changes) {
    const toRemove = this.items.get(itemId);
    if (!toRemove) {
      return;
    }
    const parentId = TestId.parentId(toRemove.item.extId)?.toString();
    if (parentId) {
      const parent = this.items.get(parentId);
      parent.children.delete(toRemove.item.extId);
    } else {
      this.roots.delete(toRemove);
    }
    const queue = [[itemId]];
    while (queue.length) {
      for (const itemId2 of queue.pop()) {
        const existing = this.items.get(itemId2);
        if (existing) {
          queue.push(existing.children);
          this.items.delete(itemId2);
          changes.remove?.(existing, existing !== toRemove);
          if (existing.expand === 2 /* BusyExpanding */) {
            this.busyControllerCount--;
          }
        }
      }
    }
  }
  /**
   * Called when the extension signals a test result should be retired.
   */
  retireTest(testId) {
  }
  /**
   * Updates the number of test root sources who are yet to report. When
   * the total pending test roots reaches 0, the roots for all controllers
   * will exist in the collection.
   */
  updatePendingRoots(delta3) {
    this.pendingRootCount += delta3;
  }
  /**
   * Called before a diff is applied to create a new change collector.
   */
  createChangeCollector() {
    return {};
  }
};
export { serializeThingWithLocation, deserializeThingWithLocation, testProfileBitset, isStartControllerTests, IRichLocation, ITestMessageStackFrame, ITestErrorMessage, ITestOutputMessage, ITestMessage, ITestTaskState, testTagDelimiter, namespaceTestTag, denamespaceTestTag, ITestItem, InternalTestItem, ITestItemUpdate, applyTestItemUpdate, TestResultItem, ICoverageCount, IFileCoverage, CoverageDetails, IBranchCoverage, IDeclarationCoverage, IStatementCoverage, TestsDiffOp, AbstractIncrementalTestCollection };
