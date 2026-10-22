// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTesting.ts
import { createDecorator2 } from "./module-0048.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0011.mjs";
import { Emitter, Event } from "./module-0017.mjs";
import { MainContext } from "./module-0054.mjs";
import { TestId } from "./module-0222.mjs";
import { ExtHostTestItemCollection, TestItemImpl, TestItemRootImpl, toItemFromContext } from "./module-0265.mjs";
import { Position3, Range3, TestCoverage, TestItem, TestMessage2, TestResults, TestRunProfileKind2, TestTag2, location } from "./module-0245.mjs";
import { isDefined } from "./module-0009.mjs";
import { checkProposedApiEnabled } from "./module-0173.mjs";
import { hash } from "./module-0061.mjs";
import { AbstractIncrementalTestCollection, TestsDiffOp, isStartControllerTests } from "./module-0223.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0018.mjs";
import { URI } from "./module-0025.mjs";
import { FileCoverage, TestRunProfileBase, TestRunRequest } from "./module-0244.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { ILogService } from "./module-0062.mjs";
import { IExtHostCommands } from "./module-0268.mjs";
import { IExtHostDocumentsAndEditors } from "./module-0301.mjs";
import { RunOnceScheduler } from "./module-0029.mjs";
import { generateUuid } from "./module-0040.mjs";
import { VSBuffer } from "./module-0031.mjs";
import { InvalidTestItemError } from "./module-0227.mjs";
import { createSingleCallFunction } from "./module-0004.mjs";


// src/vs/workbench/api/common/extHostTesting.ts
var followupCounter = 0;

var testResultInternalIDs = /* @__PURE__ */ new WeakMap();

var IExtHostTesting = createDecorator2("IExtHostTesting");

var ExtHostTesting = class extends Disposable {
  constructor(rpc, logService, commands, editors) {
    super();
    this.logService = logService;
    this.commands = commands;
    this.editors = editors;
    this.resultsChangedEmitter = this._register(new Emitter());
    this.controllers = /* @__PURE__ */ new Map();
    this.defaultProfilesChangedEmitter = this._register(new Emitter());
    this.followupProviders = /* @__PURE__ */ new Set();
    this.testFollowups = /* @__PURE__ */ new Map();
    this.onResultsChanged = this.resultsChangedEmitter.event;
    this.results = [];
    this.proxy = rpc.getProxy(MainContext.MainThreadTesting);
    this.observer = new TestObservers(this.proxy);
    this.runTracker = new TestRunCoordinator(this.proxy, logService);
    commands.registerArgumentProcessor({
      processArgument: (arg) => {
        switch (arg?.$mid) {
          case 16 /* TestItemContext */: {
            const cast = arg;
            const targetTest = cast.tests[cast.tests.length - 1].item.extId;
            const controller = this.controllers.get(TestId.root(targetTest));
            return controller?.collection.tree.get(targetTest)?.actual ?? toItemFromContext(arg);
          }
          case 18 /* TestMessageMenuArgs */: {
            const { test, message } = arg;
            const extId = test.item.extId;
            return {
              test: this.controllers.get(TestId.root(extId))?.collection.tree.get(extId)?.actual ?? toItemFromContext({ $mid: 16 /* TestItemContext */, tests: [test] }),
              message: TestMessage2.to(message)
            };
          }
          default:
            return arg;
        }
      }
    });
    commands.registerCommand(false, "testing.getExplorerSelection", async () => {
      const inner = await commands.executeCommand("_testing.getExplorerSelection" /* GetExplorerSelection */);
      const lookup = (i) => {
        const controller = this.controllers.get(TestId.root(i));
        if (!controller) {
          return void 0;
        }
        return TestId.isRoot(i) ? controller.controller : controller.collection.tree.get(i)?.actual;
      };
      return {
        include: inner?.include.map(lookup).filter(isDefined) || [],
        exclude: inner?.exclude.map(lookup).filter(isDefined) || []
      };
    });
  }
  //#region public API
  /**
   * Implements vscode.test.registerTestProvider
   */
  createTestController(extension, controllerId, label, refreshHandler) {
    if (this.controllers.has(controllerId)) {
      throw new Error(`Attempt to insert a duplicate controller with ID "${controllerId}"`);
    }
    const disposable = new DisposableStore();
    const collection = disposable.add(new ExtHostTestItemCollection(controllerId, label, this.editors));
    collection.root.label = label;
    const profiles = /* @__PURE__ */ new Map();
    const activeProfiles = /* @__PURE__ */ new Set();
    const proxy = this.proxy;
    const getCapability = () => {
      let cap = 0;
      if (refreshHandler) {
        cap |= 2 /* Refresh */;
      }
      const rcp = info.relatedCodeProvider;
      if (rcp) {
        if (rcp?.provideRelatedTests) {
          cap |= 8 /* TestRelatedToCode */;
        }
        if (rcp?.provideRelatedCode) {
          cap |= 4 /* CodeRelatedToTest */;
        }
      }
      return cap;
    };
    const controller = {
      items: collection.root.children,
      get label() {
        return label;
      },
      set label(value) {
        label = value;
        collection.root.label = value;
        proxy.$updateController(controllerId, { label });
      },
      get refreshHandler() {
        return refreshHandler;
      },
      set refreshHandler(value) {
        refreshHandler = value;
        proxy.$updateController(controllerId, { capabilities: getCapability() });
      },
      get id() {
        return controllerId;
      },
      get relatedCodeProvider() {
        return info.relatedCodeProvider;
      },
      set relatedCodeProvider(value) {
        checkProposedApiEnabled(extension, "testRelatedCode");
        info.relatedCodeProvider = value;
        proxy.$updateController(controllerId, { capabilities: getCapability() });
      },
      createRunProfile: (label2, group, runHandler, isDefault, tag2, supportsContinuousRun) => {
        let profileId = hash(label2);
        while (profiles.has(profileId)) {
          profileId++;
        }
        return new TestRunProfileImpl(this.proxy, profiles, activeProfiles, this.defaultProfilesChangedEmitter.event, controllerId, profileId, label2, group, runHandler, isDefault, tag2, supportsContinuousRun);
      },
      createTestItem(id2, label2, uri2) {
        return new TestItemImpl(controllerId, id2, label2, uri2);
      },
      createTestRun: (request, name, persist = true) => {
        return this.runTracker.createTestRun(extension, controllerId, collection, request, name, persist);
      },
      invalidateTestResults: (items) => {
        if (items === void 0) {
          this.proxy.$markTestRetired(void 0);
        } else {
          const itemsArr = items instanceof Array ? items : [items];
          this.proxy.$markTestRetired(itemsArr.map((i) => TestId.fromExtHostTestItem(i, controllerId).toString()));
        }
      },
      set resolveHandler(fn) {
        collection.resolveHandler = fn;
      },
      get resolveHandler() {
        return collection.resolveHandler;
      },
      dispose: () => {
        disposable.dispose();
      }
    };
    const info = { controller, collection, profiles, extension, activeProfiles };
    proxy.$registerTestController(controllerId, label, getCapability());
    disposable.add(toDisposable(() => proxy.$unregisterTestController(controllerId)));
    this.controllers.set(controllerId, info);
    disposable.add(toDisposable(() => this.controllers.delete(controllerId)));
    disposable.add(collection.onDidGenerateDiff((diff2) => proxy.$publishDiff(controllerId, diff2.map(TestsDiffOp.serialize))));
    return controller;
  }
  /**
   * Implements vscode.test.createTestObserver
   */
  createTestObserver() {
    return this.observer.checkout();
  }
  /**
   * Implements vscode.test.runTests
   */
  async runTests(req, token = CancellationToken.None) {
    const profile = tryGetProfileFromTestRunReq(req);
    if (!profile) {
      throw new Error("The request passed to `vscode.test.runTests` must include a profile");
    }
    const controller = this.controllers.get(profile.controllerId);
    if (!controller) {
      throw new Error("Controller not found");
    }
    await this.proxy.$runTests({
      preserveFocus: req.preserveFocus ?? true,
      group: TestRunProfileKind2.from(profile.kind),
      targets: [{
        testIds: req.include?.map((t) => TestId.fromExtHostTestItem(t, controller.collection.root.id).toString()) ?? [controller.collection.root.id],
        profileId: profile.profileId,
        controllerId: profile.controllerId
      }],
      exclude: req.exclude?.map((t) => t.id)
    }, token);
  }
  /**
   * Implements vscode.test.registerTestFollowupProvider
   */
  registerTestFollowupProvider(provider) {
    this.followupProviders.add(provider);
    return { dispose: () => {
      this.followupProviders.delete(provider);
    } };
  }
  //#endregion
  //#region RPC methods
  /**
   * @inheritdoc
   */
  async $getTestsRelatedToCode(uri2, _position, token) {
    const doc = this.editors.getDocument(URI.revive(uri2));
    if (!doc) {
      return [];
    }
    const position = Position3.to(_position);
    const related = [];
    await Promise.all([...this.controllers.values()].map(async (c) => {
      let tests;
      try {
        tests = await c.relatedCodeProvider?.provideRelatedTests?.(doc.document, position, token);
      } catch (e) {
        if (!token.isCancellationRequested) {
          this.logService.warn(`Error thrown while providing related tests for ${c.controller.label}`, e);
        }
      }
      if (tests) {
        for (const test of tests) {
          related.push(TestId.fromExtHostTestItem(test, c.controller.id).toString());
        }
        c.collection.flushDiff();
      }
    }));
    return related;
  }
  /**
   * @inheritdoc
   */
  async $getCodeRelatedToTest(testId, token) {
    const controller = this.controllers.get(TestId.root(testId));
    if (!controller) {
      return [];
    }
    const test = controller.collection.tree.get(testId);
    if (!test) {
      return [];
    }
    const locations = await controller.relatedCodeProvider?.provideRelatedCode?.(test.actual, token);
    return locations?.map(location.from) ?? [];
  }
  /**
   * @inheritdoc
   */
  $syncTests() {
    for (const { collection } of this.controllers.values()) {
      collection.flushDiff();
    }
    return Promise.resolve();
  }
  /**
   * @inheritdoc
   */
  async $getCoverageDetails(coverageId, testId, token) {
    const details = await this.runTracker.getCoverageDetails(coverageId, testId, token);
    return details?.map(TestCoverage.fromDetails);
  }
  /**
   * @inheritdoc
   */
  async $disposeRun(runId) {
    this.runTracker.disposeTestRun(runId);
  }
  /** @inheritdoc */
  $configureRunProfile(controllerId, profileId) {
    this.controllers.get(controllerId)?.profiles.get(profileId)?.configureHandler?.();
  }
  /** @inheritdoc */
  $setDefaultRunProfiles(profiles) {
    const evt = /* @__PURE__ */ new Map();
    for (const [controllerId, profileIds] of Object.entries(profiles)) {
      const ctrl = this.controllers.get(controllerId);
      if (!ctrl) {
        continue;
      }
      const changes = /* @__PURE__ */ new Map();
      const added = profileIds.filter((id2) => !ctrl.activeProfiles.has(id2));
      const removed = [...ctrl.activeProfiles].filter((id2) => !profileIds.includes(id2));
      for (const id2 of added) {
        changes.set(id2, true);
        ctrl.activeProfiles.add(id2);
      }
      for (const id2 of removed) {
        changes.set(id2, false);
        ctrl.activeProfiles.delete(id2);
      }
      if (changes.size) {
        evt.set(controllerId, changes);
      }
    }
    this.defaultProfilesChangedEmitter.fire(evt);
  }
  /** @inheritdoc */
  async $refreshTests(controllerId, token) {
    await this.controllers.get(controllerId)?.controller.refreshHandler?.(token);
  }
  /**
   * Updates test results shown to extensions.
   * @override
   */
  $publishTestResults(results) {
    this.results = Object.freeze(
      results.map((r2) => {
        const o = TestResults.to(r2);
        const taskWithCoverage = r2.tasks.findIndex((t) => t.hasCoverage);
        if (taskWithCoverage !== -1) {
          o.getDetailedCoverage = (uri2, token = CancellationToken.None) => this.proxy.$getCoverageDetails(r2.id, taskWithCoverage, uri2, token).then((r3) => r3.map(TestCoverage.to));
        }
        testResultInternalIDs.set(o, r2.id);
        return o;
      }).concat(this.results).sort((a, b) => b.completedAt - a.completedAt).slice(0, 32)
    );
    this.resultsChangedEmitter.fire();
  }
  /**
   * Expands the nodes in the test tree. If levels is less than zero, it will
   * be treated as infinite.
   */
  async $expandTest(testId, levels) {
    const collection = this.controllers.get(TestId.fromString(testId).controllerId)?.collection;
    if (collection) {
      await collection.expand(testId, levels < 0 ? Infinity : levels);
      collection.flushDiff();
    }
  }
  /**
   * Receives a test update from the main thread. Called (eventually) whenever
   * tests change.
   */
  $acceptDiff(diff2) {
    this.observer.applyDiff(diff2.map((d) => TestsDiffOp.deserialize({ asCanonicalUri: (u) => u }, d)));
  }
  /**
   * Runs tests with the given set of IDs. Allows for test from multiple
   * providers to be run.
   * @inheritdoc
   */
  async $runControllerTests(reqs, token) {
    return Promise.all(reqs.map((req) => this.runControllerTestRequest(req, false, token)));
  }
  /**
   * Starts continuous test runs with the given set of IDs. Allows for test from
   * multiple providers to be run.
   * @inheritdoc
   */
  async $startContinuousRun(reqs, token) {
    const cts = new CancellationTokenSource(token);
    const res = await Promise.all(reqs.map((req) => this.runControllerTestRequest(req, true, cts.token)));
    if (!token.isCancellationRequested && !res.some((r2) => r2.error)) {
      await new Promise((r2) => token.onCancellationRequested(r2));
    }
    cts.dispose(true);
    return res;
  }
  /** @inheritdoc */
  async $provideTestFollowups(req, token) {
    const results = this.results.find((r2) => testResultInternalIDs.get(r2) === req.resultId);
    const test = results && findTestInResultSnapshot(TestId.fromString(req.extId), results?.results);
    if (!test) {
      return [];
    }
    let followups = [];
    await Promise.all([...this.followupProviders].map(async (provider) => {
      try {
        const r2 = await provider.provideFollowup(results, test, req.taskIndex, req.messageIndex, token);
        if (r2) {
          followups = followups.concat(r2);
        }
      } catch (e) {
        this.logService.error(`Error thrown while providing followup for test message`, e);
      }
    }));
    if (token.isCancellationRequested) {
      return [];
    }
    return followups.map((command) => {
      const id2 = followupCounter++;
      this.testFollowups.set(id2, command);
      return { title: command.title, id: id2 };
    });
  }
  $disposeTestFollowups(id2) {
    for (const i of id2) {
      this.testFollowups.delete(i);
    }
  }
  $executeTestFollowup(id2) {
    const command = this.testFollowups.get(id2);
    if (!command) {
      return Promise.resolve();
    }
    return this.commands.executeCommand(command.command, ...command.arguments || []);
  }
  /**
   * Cancels an ongoing test run.
   */
  $cancelExtensionTestRun(runId, taskId) {
    if (runId === void 0) {
      this.runTracker.cancelAllRuns();
    } else {
      this.runTracker.cancelRunById(runId, taskId);
    }
  }
  //#endregion
  getMetadataForRun(run) {
    for (const tracker of this.runTracker.trackers) {
      const taskId = tracker.getTaskIdForRun(run);
      if (taskId) {
        return { taskId, runId: tracker.id };
      }
    }
    return void 0;
  }
  async runControllerTestRequest(req, isContinuous, token) {
    const lookup = this.controllers.get(req.controllerId);
    if (!lookup) {
      return {};
    }
    const { collection, profiles, extension } = lookup;
    const profile = profiles.get(req.profileId);
    if (!profile) {
      return {};
    }
    const includeTests = req.testIds.map((testId) => collection.tree.get(testId)).filter(isDefined);
    const excludeTests = req.excludeExtIds.map((id2) => lookup.collection.tree.get(id2)).filter(isDefined).filter((exclude) => includeTests.some(
      (include) => include.fullId.compare(exclude.fullId) === 2 /* IsChild */
    ));
    if (!includeTests.length) {
      return {};
    }
    const publicReq = new TestRunRequest(
      includeTests.some((i) => i.actual instanceof TestItemRootImpl) ? void 0 : includeTests.map((t) => t.actual),
      excludeTests.map((t) => t.actual),
      profile,
      isContinuous
    );
    const tracker = isStartControllerTests(req) && this.runTracker.prepareForMainThreadTestRun(
      extension,
      publicReq,
      TestRunDto.fromInternal(req, lookup.collection),
      profile,
      token
    );
    try {
      await profile.runHandler(publicReq, token);
      return {};
    } catch (e) {
      return { error: String(e) };
    } finally {
      if (tracker) {
        if (tracker.hasRunningTasks && !token.isCancellationRequested) {
          await Event.toPromise(tracker.onEnd);
        }
      }
    }
  }
};

ExtHostTesting = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IExtHostCommands),
  __decorateParam(3, IExtHostDocumentsAndEditors)
], ExtHostTesting);

var RUN_CANCEL_DEADLINE = 1e4;

var TestRunTracker = class extends Disposable {
  constructor(dto, proxy, logService, profile, extension, parentToken) {
    super();
    this.dto = dto;
    this.proxy = proxy;
    this.logService = logService;
    this.profile = profile;
    this.extension = extension;
    this.state = 0 /* Running */;
    this.running = 0;
    this.tasks = /* @__PURE__ */ new Map();
    this.sharedTestIds = /* @__PURE__ */ new Set();
    this.endEmitter = this._register(new Emitter());
    this.publishedCoverage = /* @__PURE__ */ new Map();
    /**
     * Fires when a test ends, and no more tests are left running.
     */
    this.onEnd = this.endEmitter.event;
    this.cts = this._register(new CancellationTokenSource(parentToken));
    const forciblyEnd = this._register(new RunOnceScheduler(() => this.forciblyEndTasks(), RUN_CANCEL_DEADLINE));
    this._register(this.cts.token.onCancellationRequested(() => forciblyEnd.schedule()));
    const didDisposeEmitter = new Emitter();
    this.onDidDispose = didDisposeEmitter.event;
    this._register(toDisposable(() => {
      didDisposeEmitter.fire();
      didDisposeEmitter.dispose();
    }));
  }
  /**
   * Gets whether there are any tests running.
   */
  get hasRunningTasks() {
    return this.running > 0;
  }
  /**
   * Gets the run ID.
   */
  get id() {
    return this.dto.id;
  }
  /** Gets the task ID from a test run object. */
  getTaskIdForRun(run) {
    for (const [taskId, { run: r2 }] of this.tasks) {
      if (r2 === run) {
        return taskId;
      }
    }
    return void 0;
  }
  /** Requests cancellation of the run. On the second call, forces cancellation. */
  cancel(taskId) {
    if (taskId) {
      this.tasks.get(taskId)?.cts.cancel();
    } else if (this.state === 0 /* Running */) {
      this.cts.cancel();
      this.state = 1 /* Cancelling */;
    } else if (this.state === 1 /* Cancelling */) {
      this.forciblyEndTasks();
    }
  }
  /** Gets details for a previously-emitted coverage object. */
  async getCoverageDetails(id2, testId, token) {
    const [, taskId] = TestId.fromString(id2).path;
    const coverage = this.publishedCoverage.get(id2);
    if (!coverage) {
      return [];
    }
    const { report, extIds } = coverage;
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error("unreachable: run task was not found");
    }
    let testItem;
    if (testId && report instanceof FileCoverage) {
      const index = extIds.indexOf(testId);
      if (index === -1) {
        return [];
      }
      testItem = report.includesTests[index];
    }
    const details = testItem ? this.profile?.loadDetailedCoverageForTest?.(task.run, report, testItem, token) : this.profile?.loadDetailedCoverage?.(task.run, report, token);
    return await details ?? [];
  }
  /** Creates the public test run interface to give to extensions. */
  createRun(name) {
    const runId = this.dto.id;
    const ctrlId = this.dto.controllerId;
    const taskId = generateUuid();
    const guardTestMutation = (fn) => (test, ...args2) => {
      if (ended) {
        this.logService.warn(`Setting the state of test "${test.id}" is a no-op after the run ends.`);
        return;
      }
      this.ensureTestIsKnown(test);
      fn(test, ...args2);
    };
    const appendMessages = (test, messages) => {
      const converted = messages instanceof Array ? messages.map(TestMessage2.from) : [TestMessage2.from(messages)];
      if (test.uri && test.range) {
        const defaultLocation = { range: Range3.from(test.range), uri: test.uri };
        for (const message of converted) {
          message.location = message.location || defaultLocation;
        }
      }
      this.proxy.$appendTestMessagesInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), converted);
    };
    let ended = false;
    const cts = this._register(new CancellationTokenSource(this.cts.token));
    const run = {
      isPersisted: this.dto.isPersisted,
      token: cts.token,
      name,
      onDidDispose: this.onDidDispose,
      addCoverage: (coverage) => {
        if (ended) {
          return;
        }
        const includesTests = coverage instanceof FileCoverage ? coverage.includesTests : [];
        if (includesTests.length) {
          for (const test of includesTests) {
            this.ensureTestIsKnown(test);
          }
        }
        const uriStr = coverage.uri.toString();
        const id2 = new TestId([runId, taskId, uriStr]).toString();
        this.publishedCoverage.set(id2, { report: coverage, extIds: includesTests.map((t) => TestId.fromExtHostTestItem(t, ctrlId).toString()) });
        this.proxy.$appendCoverage(runId, taskId, TestCoverage.fromFile(ctrlId, id2, coverage));
      },
      //#region state mutation
      enqueued: guardTestMutation((test) => {
        this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 1 /* Queued */);
      }),
      skipped: guardTestMutation((test) => {
        this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 5 /* Skipped */);
      }),
      started: guardTestMutation((test) => {
        this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 2 /* Running */);
      }),
      errored: guardTestMutation((test, messages, duration) => {
        appendMessages(test, messages);
        this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 6 /* Errored */, duration);
      }),
      failed: guardTestMutation((test, messages, duration) => {
        appendMessages(test, messages);
        this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 4 /* Failed */, duration);
      }),
      passed: guardTestMutation((test, duration) => {
        this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, this.dto.controllerId).toString(), 3 /* Passed */, duration);
      }),
      //#endregion
      appendOutput: (output, location2, test) => {
        if (ended) {
          return;
        }
        if (test) {
          this.ensureTestIsKnown(test);
        }
        this.proxy.$appendOutputToRun(
          runId,
          taskId,
          VSBuffer.fromString(output),
          location2 && location.from(location2),
          test && TestId.fromExtHostTestItem(test, ctrlId).toString()
        );
      },
      end: () => {
        if (ended) {
          return;
        }
        ended = true;
        this.proxy.$finishedTestRunTask(runId, taskId);
        if (!--this.running) {
          this.markEnded();
        }
      }
    };
    this.running++;
    this.tasks.set(taskId, { run, cts });
    this.proxy.$startedTestRunTask(runId, {
      id: taskId,
      ctrlId: this.dto.controllerId,
      name: name || this.extension.displayName || this.extension.identifier.value,
      running: true
    });
    return run;
  }
  forciblyEndTasks() {
    for (const { run } of this.tasks.values()) {
      run.end();
    }
  }
  markEnded() {
    if (this.state !== 2 /* Ended */) {
      this.state = 2 /* Ended */;
      this.endEmitter.fire();
    }
  }
  ensureTestIsKnown(test) {
    if (!(test instanceof TestItemImpl)) {
      throw new InvalidTestItemError(test.id);
    }
    if (this.sharedTestIds.has(TestId.fromExtHostTestItem(test, this.dto.controllerId).toString())) {
      return;
    }
    const chain = [];
    const root = this.dto.colllection.root;
    while (true) {
      const converted = TestItem.from(test);
      chain.unshift(converted);
      if (this.sharedTestIds.has(converted.extId)) {
        break;
      }
      this.sharedTestIds.add(converted.extId);
      if (test === root) {
        break;
      }
      test = test.parent || root;
    }
    this.proxy.$addTestsToRun(this.dto.controllerId, this.dto.id, chain);
  }
  dispose() {
    this.markEnded();
    super.dispose();
  }
};

var TestRunCoordinator = class {
  constructor(proxy, logService) {
    this.proxy = proxy;
    this.logService = logService;
    this.tracked = /* @__PURE__ */ new Map();
    this.trackedById = /* @__PURE__ */ new Map();
  }
  get trackers() {
    return this.tracked.values();
  }
  /**
   * Gets a coverage report for a given run and task ID.
   */
  getCoverageDetails(id2, testId, token) {
    const runId = TestId.root(id2);
    return this.trackedById.get(runId)?.getCoverageDetails(id2, testId, token) || [];
  }
  /**
   * Disposes the test run, called when the main thread is no longer interested
   * in associated data.
   */
  disposeTestRun(runId) {
    this.trackedById.get(runId)?.dispose();
    this.trackedById.delete(runId);
    for (const [req, { id: id2 }] of this.tracked) {
      if (id2 === runId) {
        this.tracked.delete(req);
      }
    }
  }
  /**
   * Registers a request as being invoked by the main thread, so
   * `$startedExtensionTestRun` is not invoked. The run must eventually
   * be cancelled manually.
   */
  prepareForMainThreadTestRun(extension, req, dto, profile, token) {
    return this.getTracker(req, dto, profile, extension, token);
  }
  /**
   * Cancels an existing test run via its cancellation token.
   */
  cancelRunById(runId, taskId) {
    this.trackedById.get(runId)?.cancel(taskId);
  }
  /**
   * Cancels an existing test run via its cancellation token.
   */
  cancelAllRuns() {
    for (const tracker of this.tracked.values()) {
      tracker.cancel();
    }
  }
  /**
   * Implements the public `createTestRun` API.
   */
  createTestRun(extension, controllerId, collection, request, name, persist) {
    const existing = this.tracked.get(request);
    if (existing) {
      return existing.createRun(name);
    }
    const dto = TestRunDto.fromPublic(controllerId, collection, request, persist);
    const profile = tryGetProfileFromTestRunReq(request);
    this.proxy.$startedExtensionTestRun({
      controllerId,
      continuous: !!request.continuous,
      profile: profile && { group: TestRunProfileKind2.from(profile.kind), id: profile.profileId },
      exclude: request.exclude?.map((t) => TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [],
      id: dto.id,
      include: request.include?.map((t) => TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [collection.root.id],
      preserveFocus: request.preserveFocus ?? true,
      persist
    });
    const tracker = this.getTracker(request, dto, request.profile, extension);
    Event.once(tracker.onEnd)(() => {
      this.proxy.$finishedExtensionTestRun(dto.id);
    });
    return tracker.createRun(name);
  }
  getTracker(req, dto, profile, extension, token) {
    const tracker = new TestRunTracker(dto, this.proxy, this.logService, profile, extension, token);
    this.tracked.set(req, tracker);
    this.trackedById.set(tracker.id, tracker);
    return tracker;
  }
};

var tryGetProfileFromTestRunReq = (request) => {
  if (!request.profile) {
    return void 0;
  }
  if (!(request.profile instanceof TestRunProfileImpl)) {
    throw new Error(`TestRunRequest.profile is not an instance created from TestController.createRunProfile`);
  }
  return request.profile;
};

var TestRunDto = class _TestRunDto {
  constructor(controllerId, id2, isPersisted, colllection) {
    this.controllerId = controllerId;
    this.id = id2;
    this.isPersisted = isPersisted;
    this.colllection = colllection;
  }
  static fromPublic(controllerId, collection, request, persist) {
    return new _TestRunDto(
      controllerId,
      generateUuid(),
      persist,
      collection
    );
  }
  static fromInternal(request, collection) {
    return new _TestRunDto(
      request.controllerId,
      request.runId,
      true,
      collection
    );
  }
};

var MirroredChangeCollector = class {
  constructor(emitter) {
    this.emitter = emitter;
    this.added = /* @__PURE__ */ new Set();
    this.updated = /* @__PURE__ */ new Set();
    this.removed = /* @__PURE__ */ new Set();
    this.alreadyRemoved = /* @__PURE__ */ new Set();
  }
  get isEmpty() {
    return this.added.size === 0 && this.removed.size === 0 && this.updated.size === 0;
  }
  /**
   * @inheritdoc
   */
  add(node) {
    this.added.add(node);
  }
  /**
   * @inheritdoc
   */
  update(node) {
    Object.assign(node.revived, TestItem.toPlain(node.item));
    if (!this.added.has(node)) {
      this.updated.add(node);
    }
  }
  /**
   * @inheritdoc
   */
  remove(node) {
    if (this.added.delete(node)) {
      return;
    }
    this.updated.delete(node);
    const parentId = TestId.parentId(node.item.extId);
    if (parentId && this.alreadyRemoved.has(parentId.toString())) {
      this.alreadyRemoved.add(node.item.extId);
      return;
    }
    this.removed.add(node);
  }
  /**
   * @inheritdoc
   */
  getChangeEvent() {
    const { added, updated, removed } = this;
    return {
      get added() {
        return [...added].map((n) => n.revived);
      },
      get updated() {
        return [...updated].map((n) => n.revived);
      },
      get removed() {
        return [...removed].map((n) => n.revived);
      }
    };
  }
  complete() {
    if (!this.isEmpty) {
      this.emitter.fire(this.getChangeEvent());
    }
  }
};

var MirroredTestCollection = class extends AbstractIncrementalTestCollection {
  constructor() {
    super(...arguments);
    this.changeEmitter = new Emitter();
    /**
     * Change emitter that fires with the same semantics as `TestObserver.onDidChangeTests`.
     */
    this.onDidChangeTests = this.changeEmitter.event;
  }
  /**
   * Gets a list of root test items.
   */
  get rootTests() {
    return this.roots;
  }
  /**
   *
   * If the test ID exists, returns its underlying ID.
   */
  getMirroredTestDataById(itemId) {
    return this.items.get(itemId);
  }
  /**
   * If the test item is a mirrored test item, returns its underlying ID.
   */
  getMirroredTestDataByReference(item) {
    return this.items.get(item.id);
  }
  /**
   * @override
   */
  createItem(item, parent) {
    return {
      ...item,
      // todo@connor4312: make this work well again with children
      revived: TestItem.toPlain(item.item),
      depth: parent ? parent.depth + 1 : 0,
      children: /* @__PURE__ */ new Set()
    };
  }
  /**
   * @override
   */
  createChangeCollector() {
    return new MirroredChangeCollector(this.changeEmitter);
  }
};

var TestObservers = class {
  constructor(proxy) {
    this.proxy = proxy;
  }
  checkout() {
    if (!this.current) {
      this.current = this.createObserverData();
    }
    const current = this.current;
    current.observers++;
    return {
      onDidChangeTest: current.tests.onDidChangeTests,
      get tests() {
        return [...current.tests.rootTests].map((t) => t.revived);
      },
      dispose: createSingleCallFunction(() => {
        if (--current.observers === 0) {
          this.proxy.$unsubscribeFromDiffs();
          this.current = void 0;
        }
      })
    };
  }
  /**
   * Gets the internal test data by its reference.
   */
  getMirroredTestDataByReference(ref) {
    return this.current?.tests.getMirroredTestDataByReference(ref);
  }
  /**
   * Applies test diffs to the current set of observed tests.
   */
  applyDiff(diff2) {
    this.current?.tests.apply(diff2);
  }
  createObserverData() {
    const tests = new MirroredTestCollection({ asCanonicalUri: (u) => u });
    this.proxy.$subscribeToDiffs();
    return { observers: 0, tests };
  }
};

var updateProfile = (impl, proxy, initial, update) => {
  if (initial) {
    Object.assign(initial, update);
  } else {
    proxy.$updateTestRunConfig(impl.controllerId, impl.profileId, update);
  }
};

var TestRunProfileImpl = class extends TestRunProfileBase {
  constructor(proxy, profiles, activeProfiles, onDidChangeActiveProfiles, controllerId, profileId, _label, kind, runHandler, _isDefault = false, _tag2 = void 0, _supportsContinuousRun = false) {
    super(controllerId, profileId, kind);
    this._label = _label;
    this.runHandler = runHandler;
    this._tag = _tag2;
    this._supportsContinuousRun = _supportsContinuousRun;
    this.#proxy = proxy;
    this.#profiles = profiles;
    this.#activeProfiles = activeProfiles;
    this.#onDidChangeDefaultProfiles = onDidChangeActiveProfiles;
    profiles.set(profileId, this);
    const groupBitset = TestRunProfileKind2.from(kind);
    if (_isDefault) {
      activeProfiles.add(profileId);
    }
    this.#initialPublish = {
      profileId,
      controllerId,
      tag: _tag2 ? TestTag2.namespace(this.controllerId, _tag2.id) : null,
      label: _label,
      group: groupBitset,
      isDefault: _isDefault,
      hasConfigurationHandler: false,
      supportsContinuousRun: _supportsContinuousRun
    };
    queueMicrotask(() => {
      if (this.#initialPublish) {
        this.#proxy.$publishTestRunProfile(this.#initialPublish);
        this.#initialPublish = void 0;
      }
    });
  }
  #proxy;
  #activeProfiles;
  #onDidChangeDefaultProfiles;
  #initialPublish;
  #profiles;
  get label() {
    return this._label;
  }
  set label(label) {
    if (label !== this._label) {
      this._label = label;
      updateProfile(this, this.#proxy, this.#initialPublish, { label });
    }
  }
  get supportsContinuousRun() {
    return this._supportsContinuousRun;
  }
  set supportsContinuousRun(supports) {
    if (supports !== this._supportsContinuousRun) {
      this._supportsContinuousRun = supports;
      updateProfile(this, this.#proxy, this.#initialPublish, { supportsContinuousRun: supports });
    }
  }
  get isDefault() {
    return this.#activeProfiles.has(this.profileId);
  }
  set isDefault(isDefault) {
    if (isDefault !== this.isDefault) {
      if (isDefault) {
        this.#activeProfiles.add(this.profileId);
      } else {
        this.#activeProfiles.delete(this.profileId);
      }
      updateProfile(this, this.#proxy, this.#initialPublish, { isDefault });
    }
  }
  get tag() {
    return this._tag;
  }
  set tag(tag2) {
    if (tag2?.id !== this._tag?.id) {
      this._tag = tag2;
      updateProfile(this, this.#proxy, this.#initialPublish, {
        tag: tag2 ? TestTag2.namespace(this.controllerId, tag2.id) : null
      });
    }
  }
  get configureHandler() {
    return this._configureHandler;
  }
  set configureHandler(handler) {
    if (handler !== this._configureHandler) {
      this._configureHandler = handler;
      updateProfile(this, this.#proxy, this.#initialPublish, { hasConfigurationHandler: !!handler });
    }
  }
  get onDidChangeDefault() {
    return Event.chain(
      this.#onDidChangeDefaultProfiles,
      ($) => $.map((ev) => ev.get(this.controllerId)?.get(this.profileId)).filter(isDefined)
    );
  }
  dispose() {
    if (this.#profiles?.delete(this.profileId)) {
      this.#profiles = void 0;
      this.#proxy.$removeTestProfile(this.controllerId, this.profileId);
    }
    this.#initialPublish = void 0;
  }
};

function findTestInResultSnapshot(extId, snapshot) {
  for (let i = 0; i < extId.path.length; i++) {
    const item = snapshot.find((s) => s.id === extId.path[i]);
    if (!item) {
      return void 0;
    }
    if (i === extId.path.length - 1) {
      return item;
    }
    snapshot = item.children;
  }
  return void 0;
}
export { findTestInResultSnapshot, followupCounter, testResultInternalIDs, IExtHostTesting, ExtHostTesting, RUN_CANCEL_DEADLINE, TestRunTracker, TestRunCoordinator, tryGetProfileFromTestRunReq, TestRunDto, MirroredChangeCollector, MirroredTestCollection, TestObservers, updateProfile, TestRunProfileImpl };
