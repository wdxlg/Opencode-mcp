// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testResult.ts
import { Emitter, Event2 } from "./module-0017.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { TestId } from "./module-1207.mjs";
import { makeEmptyCounts, maxPriority, statesInOrder, terminalStatePriorities } from "./module-1430.mjs";
import { TestResultItem, getMarkId } from "./module-1208.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { language } from "./module-0014.mjs";
import { Lazy } from "./module-0028.mjs";
import { removeAnsiEscapeCodes } from "./module-0030.mjs";
import { observableValue } from "./module-0048.mjs";
import { refreshComputedState } from "./module-1431.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/testing/common/testResult.ts
var emptyRawOutput = {
  buffers: [],
  length: 0,
  onDidWriteData: Event2.None,
  endPromise: Promise.resolve(),
  getRange: () => VSBuffer.alloc(0),
  getRangeIter: () => []
};

var TaskRawOutput = class {
  constructor() {
    this.writeDataEmitter = new Emitter();
    this.endDeferred = new DeferredPromise();
    this.offset = 0;
    /** @inheritdoc */
    this.onDidWriteData = this.writeDataEmitter.event;
    /** @inheritdoc */
    this.endPromise = this.endDeferred.p;
    /** @inheritdoc */
    this.buffers = [];
  }
  /** @inheritdoc */
  get length() {
    return this.offset;
  }
  /** @inheritdoc */
  getRange(start, length) {
    const buf = VSBuffer.alloc(length);
    let bufLastWrite = 0;
    for (const chunk of this.getRangeIter(start, length)) {
      buf.buffer.set(chunk.buffer, bufLastWrite);
      bufLastWrite += chunk.byteLength;
    }
    return bufLastWrite < length ? buf.slice(0, bufLastWrite) : buf;
  }
  /** @inheritdoc */
  *getRangeIter(start, length) {
    let soFar = 0;
    let internalLastRead = 0;
    for (const b of this.buffers) {
      if (internalLastRead + b.byteLength <= start) {
        internalLastRead += b.byteLength;
        continue;
      }
      const bstart = Math.max(0, start - internalLastRead);
      const bend = Math.min(b.byteLength, bstart + length - soFar);
      yield b.slice(bstart, bend);
      soFar += bend - bstart;
      internalLastRead += b.byteLength;
      if (soFar === length) {
        break;
      }
    }
  }
  /**
   * Appends data to the output, returning the byte range where the data can be found.
   */
  append(data, marker) {
    const offset = this.offset;
    let length = data.byteLength;
    if (marker === void 0) {
      this.push(data);
      return { offset, length };
    }
    let TrimBytes;
    ((TrimBytes2) => {
      TrimBytes2[TrimBytes2["CR"] = 13] = "CR";
      TrimBytes2[TrimBytes2["LF"] = 10] = "LF";
    })(TrimBytes || (TrimBytes = {}));
    const start = VSBuffer.fromString(getMarkCode(marker, true));
    const end = VSBuffer.fromString(getMarkCode(marker, false));
    length += start.byteLength + end.byteLength;
    this.push(start);
    let trimLen = data.byteLength;
    for (; trimLen > 0; trimLen--) {
      const last = data.buffer[trimLen - 1];
      if (last !== 13 /* CR */ && last !== 10 /* LF */) {
        break;
      }
    }
    this.push(data.slice(0, trimLen));
    this.push(end);
    this.push(data.slice(trimLen));
    return { offset, length };
  }
  push(data) {
    if (data.byteLength === 0) {
      return;
    }
    this.buffers.push(data);
    this.writeDataEmitter.fire(data);
    this.offset += data.byteLength;
  }
  /** Signals the output has ended. */
  end() {
    this.endDeferred.complete();
  }
};

var resultItemParents = function* (results, item) {
  for (const id2 of TestId.fromString(item.item.extId).idsToRoot()) {
    yield results.getStateById(id2.toString());
  }
};

var maxCountPriority = (counts) => {
  for (const state of statesInOrder) {
    if (counts[state] > 0) {
      return state;
    }
  }
  return 0 /* Unset */;
};

var getMarkCode = (marker, start) => `\x1B]633;SetMark;Id=${getMarkId(marker, start)};Hidden\x07`;

var itemToNode = (controllerId, item, parent) => ({
  controllerId,
  expand: 0 /* NotExpandable */,
  item: { ...item },
  children: [],
  tasks: [],
  ownComputedState: 0 /* Unset */,
  computedState: 0 /* Unset */
});

var LiveTestResult = class extends Disposable {
  constructor(id2, persist, request2, insertOrder, telemetry) {
    super();
    this.id = id2;
    this.persist = persist;
    this.request = request2;
    this.insertOrder = insertOrder;
    this.telemetry = telemetry;
    this.completeEmitter = this._register(new Emitter());
    this.newTaskEmitter = this._register(new Emitter());
    this.endTaskEmitter = this._register(new Emitter());
    this.changeEmitter = this._register(new Emitter());
    /** todo@connor4312: convert to a WellDefinedPrefixTree */
    this.testById = /* @__PURE__ */ new Map();
    this.testMarkerCounter = 0;
    this.startedAt = Date.now();
    this.onChange = this.changeEmitter.event;
    this.onComplete = this.completeEmitter.event;
    this.onNewTask = this.newTaskEmitter.event;
    this.onEndTask = this.endTaskEmitter.event;
    this.tasks = [];
    this.name = localize(21364, null, (/* @__PURE__ */ new Date()).toLocaleString(language));
    /**
     * @inheritdoc
     */
    this.counts = makeEmptyCounts();
    this.computedStateAccessor = {
      getOwnState: (i2) => i2.ownComputedState,
      getCurrentComputedState: (i2) => i2.computedState,
      setComputedState: (i2, s) => i2.computedState = s,
      getChildren: (i2) => i2.children,
      getParents: (i2) => {
        const { testById: testByExtId } = this;
        return (function* () {
          const parentId = TestId.fromString(i2.item.extId).parentId;
          if (parentId) {
            for (const id2 of parentId.idsToRoot()) {
              yield testByExtId.get(id2.toString());
            }
          }
        })();
      }
    };
    this.doSerialize = new Lazy(() => ({
      id: this.id,
      completedAt: this.completedAt,
      tasks: this.tasks.map((t2) => ({ id: t2.id, name: t2.name, ctrlId: t2.ctrlId, hasCoverage: !!t2.coverage.get() })),
      name: this.name,
      request: this.request,
      items: [...this.testById.values()].map(TestResultItem.serializeWithoutMessages)
    }));
    this.doSerializeWithMessages = new Lazy(() => ({
      id: this.id,
      completedAt: this.completedAt,
      tasks: this.tasks.map((t2) => ({ id: t2.id, name: t2.name, ctrlId: t2.ctrlId, hasCoverage: !!t2.coverage.get() })),
      name: this.name,
      request: this.request,
      items: [...this.testById.values()].map(TestResultItem.serialize)
    }));
  }
  /**
   * @inheritdoc
   */
  get completedAt() {
    return this._completedAt;
  }
  /**
   * @inheritdoc
   */
  get tests() {
    return this.testById.values();
  }
  /** Gets an included test item by ID. */
  getTestById(id2) {
    return this.testById.get(id2)?.item;
  }
  /**
   * @inheritdoc
   */
  getStateById(extTestId) {
    return this.testById.get(extTestId);
  }
  /**
   * Appends output that occurred during the test run.
   */
  appendOutput(output, taskId, location2, testId) {
    const rawPreview = output.byteLength > 100 ? output.slice(0, 100).toString() + "\u2026" : output.toString();
    const preview = removeAnsiEscapeCodes(rawPreview);
    let marker;
    if (testId || location2) {
      marker = this.testMarkerCounter++;
    }
    const index2 = this.mustGetTaskIndex(taskId);
    const task = this.tasks[index2];
    const { offset, length } = task.output.append(output, marker);
    const message = {
      location: location2,
      message: preview,
      offset,
      length,
      marker,
      type: 1 /* Output */
    };
    const test = testId && this.testById.get(testId);
    if (test) {
      test.tasks[index2].messages.push(message);
      this.changeEmitter.fire({ item: test, result: this, reason: 2 /* NewMessage */, message });
    } else {
      task.otherMessages.push(message);
    }
  }
  /**
   * Adds a new run task to the results.
   */
  addTask(task) {
    this.tasks.push({ ...task, coverage: observableValue(this, void 0), otherMessages: [], output: new TaskRawOutput() });
    for (const test of this.tests) {
      test.tasks.push({ duration: void 0, messages: [], state: 0 /* Unset */ });
    }
    this.newTaskEmitter.fire(this.tasks.length - 1);
  }
  /**
   * Add the chain of tests to the run. The first test in the chain should
   * be either a test root, or a previously-known test.
   */
  addTestChainToRun(controllerId, chain) {
    let parent = this.testById.get(chain[0].extId);
    if (!parent) {
      parent = this.addTestToRun(controllerId, chain[0], null);
    }
    for (let i2 = 1; i2 < chain.length; i2++) {
      parent = this.addTestToRun(controllerId, chain[i2], parent.item.extId);
    }
    return void 0;
  }
  /**
   * Updates the state of the test by its internal ID.
   */
  updateState(testId, taskId, state, duration) {
    const entry = this.testById.get(testId);
    if (!entry) {
      return;
    }
    const index2 = this.mustGetTaskIndex(taskId);
    const oldTerminalStatePrio = terminalStatePriorities[entry.tasks[index2].state];
    const newTerminalStatePrio = terminalStatePriorities[state];
    if (oldTerminalStatePrio !== void 0 && (newTerminalStatePrio === void 0 || newTerminalStatePrio < oldTerminalStatePrio)) {
      return;
    }
    this.fireUpdateAndRefresh(entry, index2, state, duration);
  }
  /**
   * Appends a message for the test in the run.
   */
  appendMessage(testId, taskId, message) {
    const entry = this.testById.get(testId);
    if (!entry) {
      return;
    }
    entry.tasks[this.mustGetTaskIndex(taskId)].messages.push(message);
    this.changeEmitter.fire({ item: entry, result: this, reason: 2 /* NewMessage */, message });
  }
  /**
   * Marks the task in the test run complete.
   */
  markTaskComplete(taskId) {
    const index2 = this.mustGetTaskIndex(taskId);
    const task = this.tasks[index2];
    task.running = false;
    task.output.end();
    this.setAllToState(
      5 /* Skipped */,
      taskId,
      (t2) => t2.state === 1 /* Queued */ || t2.state === 2 /* Running */
    );
    this.endTaskEmitter.fire(index2);
  }
  /**
   * Notifies the service that all tests are complete.
   */
  markComplete() {
    if (this._completedAt !== void 0) {
      throw new Error("cannot complete a test result multiple times");
    }
    for (const task of this.tasks) {
      if (task.running) {
        this.markTaskComplete(task.id);
      }
    }
    this._completedAt = Date.now();
    this.completeEmitter.fire();
    this.telemetry.publicLog2("test.outcomes", {
      failures: this.counts[6 /* Errored */] + this.counts[4 /* Failed */],
      passes: this.counts[3 /* Passed */],
      controller: this.request.targets.map((t2) => t2.controllerId).join(",")
    });
  }
  /**
   * Marks the test and all of its children in the run as retired.
   */
  markRetired(testIds) {
    for (const [id2, test] of this.testById) {
      if (!test.retired && (!testIds || testIds.hasKeyOrParent(TestId.fromString(id2).path))) {
        test.retired = true;
        this.changeEmitter.fire({ reason: 0 /* ComputedStateChange */, item: test, result: this });
      }
    }
  }
  /**
   * @inheritdoc
   */
  toJSON() {
    return this.completedAt && this.persist ? this.doSerialize.value : void 0;
  }
  toJSONWithMessages() {
    return this.completedAt && this.persist ? this.doSerializeWithMessages.value : void 0;
  }
  /**
   * Updates all tests in the collection to the given state.
   */
  setAllToState(state, taskId, when) {
    const index2 = this.mustGetTaskIndex(taskId);
    for (const test of this.testById.values()) {
      if (when(test.tasks[index2], test)) {
        this.fireUpdateAndRefresh(test, index2, state);
      }
    }
  }
  fireUpdateAndRefresh(entry, taskIndex, newState, newOwnDuration) {
    const previousOwnComputed = entry.ownComputedState;
    const previousOwnDuration = entry.ownDuration;
    const changeEvent = {
      item: entry,
      result: this,
      reason: 1 /* OwnStateChange */,
      previousState: previousOwnComputed,
      previousOwnDuration
    };
    entry.tasks[taskIndex].state = newState;
    if (newOwnDuration !== void 0) {
      entry.tasks[taskIndex].duration = newOwnDuration;
      entry.ownDuration = Math.max(entry.ownDuration || 0, newOwnDuration);
    }
    const newOwnComputed = maxPriority(...entry.tasks.map((t2) => t2.state));
    if (newOwnComputed === previousOwnComputed) {
      if (newOwnDuration !== previousOwnDuration) {
        this.changeEmitter.fire(changeEvent);
      }
      return;
    }
    entry.ownComputedState = newOwnComputed;
    this.counts[previousOwnComputed]--;
    this.counts[newOwnComputed]++;
    refreshComputedState(this.computedStateAccessor, entry).forEach(
      (t2) => this.changeEmitter.fire(t2 === entry ? changeEvent : {
        item: t2,
        result: this,
        reason: 0 /* ComputedStateChange */
      })
    );
  }
  addTestToRun(controllerId, item, parent) {
    const node = itemToNode(controllerId, item, parent);
    this.testById.set(item.extId, node);
    this.counts[0 /* Unset */]++;
    if (parent) {
      this.testById.get(parent)?.children.push(node);
    }
    if (this.tasks.length) {
      for (let i2 = 0; i2 < this.tasks.length; i2++) {
        node.tasks.push({ duration: void 0, messages: [], state: 0 /* Unset */ });
      }
    }
    return node;
  }
  mustGetTaskIndex(taskId) {
    const index2 = this.tasks.findIndex((t2) => t2.id === taskId);
    if (index2 === -1) {
      throw new Error(`Unknown task ${taskId} in updateState`);
    }
    return index2;
  }
};

LiveTestResult = __decorateClass([
  __decorateParam(4, ITelemetryService)
], LiveTestResult);

var HydratedTestResult = class {
  constructor(identity2, serialized, persist = true) {
    this.serialized = serialized;
    this.persist = persist;
    /**
     * @inheritdoc
     */
    this.counts = makeEmptyCounts();
    this.testById = /* @__PURE__ */ new Map();
    this.id = serialized.id;
    this.completedAt = serialized.completedAt;
    this.tasks = serialized.tasks.map((task, i2) => ({
      id: task.id,
      name: task.name || localize(21365, null),
      ctrlId: task.ctrlId,
      running: false,
      coverage: observableValue(this, void 0),
      output: emptyRawOutput,
      otherMessages: []
    }));
    this.name = serialized.name;
    this.request = serialized.request;
    for (const item of serialized.items) {
      const de = TestResultItem.deserialize(identity2, item);
      this.counts[de.ownComputedState]++;
      this.testById.set(item.item.extId, de);
    }
  }
  /**
   * @inheritdoc
   */
  get tests() {
    return this.testById.values();
  }
  /**
   * @inheritdoc
   */
  getStateById(extTestId) {
    return this.testById.get(extTestId);
  }
  /**
   * @inheritdoc
   */
  toJSON() {
    return this.persist ? this.serialized : void 0;
  }
  /**
   * @inheritdoc
   */
  toJSONWithMessages() {
    return this.toJSON();
  }
};
export { emptyRawOutput, TaskRawOutput, resultItemParents, maxCountPriority, getMarkCode, itemToNode, LiveTestResult, HydratedTestResult };
