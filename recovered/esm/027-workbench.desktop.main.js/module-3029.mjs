// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testServiceImpl.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Emitter } from "./module-0017.mjs";
import { MainThreadTestCollection } from "./module-3027.mjs";
import { MutableObservableValue } from "./module-3025.mjs";
import { StoredValue } from "./module-1426.mjs";
import { TestExclusions } from "./module-3028.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { Iterable } from "./module-0011.mjs";
import { TestId } from "./module-1207.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { ITestProfileService, canUseProfileWithTest } from "./module-1429.mjs";
import { groupBy2 } from "./module-0007.mjs";
import { localize } from "./module-0001.mjs";
import { isDefined } from "./module-0010.mjs";
import { getTestingConfiguration } from "./module-3023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEditorService } from "./module-0934.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITestResultService } from "./module-1434.mjs";
import { IWorkspaceTrustRequestService } from "./module-0854.mjs";


// src/vs/workbench/contrib/testing/common/testServiceImpl.ts
var TestService = class extends Disposable {
  constructor(contextKeyService, instantiationService, uriIdentityService, storage, editorService, testProfiles, notificationService, configurationService, testResults, workspaceTrustRequestService) {
    super();
    this.editorService = editorService;
    this.testProfiles = testProfiles;
    this.notificationService = notificationService;
    this.configurationService = configurationService;
    this.testResults = testResults;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.testControllers = observableValue("testControllers", /* @__PURE__ */ new Map());
    this.testExtHosts = /* @__PURE__ */ new Set();
    this.cancelExtensionTestRunEmitter = this._register(new Emitter());
    this.willProcessDiffEmitter = this._register(new Emitter());
    this.didProcessDiffEmitter = this._register(new Emitter());
    this.testRefreshCancellations = /* @__PURE__ */ new Set();
    /**
     * Cancellation for runs requested by the user being managed by the UI.
     * Test runs initiated by extensions are not included here.
     */
    this.uiRunningTests = /* @__PURE__ */ new Map();
    /**
     * @inheritdoc
     */
    this.onWillProcessDiff = this.willProcessDiffEmitter.event;
    /**
     * @inheritdoc
     */
    this.onDidProcessDiff = this.didProcessDiffEmitter.event;
    /**
     * @inheritdoc
     */
    this.onDidCancelTestRun = this.cancelExtensionTestRunEmitter.event;
    this.collection = new MainThreadTestCollection(uriIdentityService, this.expandTest.bind(this));
    this.showInlineOutput = this._register(MutableObservableValue.stored(new StoredValue({
      key: "inlineTestOutputVisible",
      scope: 1 /* WORKSPACE */,
      target: 0 /* USER */
    }, storage), true));
    this.excluded = instantiationService.createInstance(TestExclusions);
    this.isRefreshingTests = TestingContextKeys.isRefreshingTests.bindTo(contextKeyService);
    this.activeEditorHasTests = TestingContextKeys.activeEditorHasTests.bindTo(contextKeyService);
    this._register(bindContextKey(
      TestingContextKeys.providerCount,
      contextKeyService,
      (reader) => this.testControllers.read(reader).size
    ));
    const bindCapability = (key3, capability) => this._register(bindContextKey(
      key3,
      contextKeyService,
      (reader) => Iterable.some(
        this.testControllers.read(reader).values(),
        (ctrl) => !!(ctrl.capabilities.read(reader) & capability)
      )
    ));
    bindCapability(TestingContextKeys.canRefreshTests, 2 /* Refresh */);
    bindCapability(TestingContextKeys.canGoToRelatedCode, 4 /* CodeRelatedToTest */);
    bindCapability(TestingContextKeys.canGoToRelatedTest, 8 /* TestRelatedToCode */);
    this._register(editorService.onDidActiveEditorChange(() => this.updateEditorContextKeys()));
  }
  /**
   * @inheritdoc
   */
  async expandTest(id2, levels) {
    await this.testControllers.get().get(TestId.fromString(id2).controllerId)?.expandTest(id2, levels);
  }
  /**
   * @inheritdoc
   */
  cancelTestRun(runId, taskId) {
    this.cancelExtensionTestRunEmitter.fire({ runId, taskId });
    if (runId === void 0) {
      for (const runCts of this.uiRunningTests.values()) {
        runCts.cancel();
      }
    } else if (!taskId) {
      this.uiRunningTests.get(runId)?.cancel();
    }
  }
  /**
   * @inheritdoc
   */
  async runTests(req, token = CancellationToken.None) {
    const byProfile = [];
    for (const test of req.tests) {
      const existing = byProfile.find((p) => canUseProfileWithTest(p.profile, test));
      if (existing) {
        existing.tests.push(test);
        continue;
      }
      const bestProfile = this.testProfiles.getDefaultProfileForTest(req.group, test);
      if (!bestProfile) {
        continue;
      }
      byProfile.push({ profile: bestProfile, tests: [test] });
    }
    const resolved = {
      targets: byProfile.map(({ profile, tests }) => ({
        profileId: profile.profileId,
        controllerId: tests[0].controllerId,
        testIds: tests.map((t2) => t2.item.extId)
      })),
      group: req.group,
      exclude: req.exclude?.map((t2) => t2.item.extId),
      continuous: req.continuous,
      preserveFocus: req.preserveFocus
    };
    if (resolved.targets.length === 0) {
      for (const byController of groupBy2(req.tests, (a, b) => a.controllerId === b.controllerId ? 0 : 1)) {
        const profiles2 = this.testProfiles.getControllerProfiles(byController[0].controllerId);
        const withControllers = byController.map((test) => ({
          profile: profiles2.find((p) => p.group === req.group && canUseProfileWithTest(p, test)),
          test
        }));
        for (const byProfile2 of groupBy2(withControllers, (a, b) => a.profile === b.profile ? 0 : 1)) {
          const profile = byProfile2[0].profile;
          if (profile) {
            resolved.targets.push({
              testIds: byProfile2.map((t2) => t2.test.item.extId),
              profileId: profile.profileId,
              controllerId: profile.controllerId
            });
          }
        }
      }
    }
    return this.runResolvedTests(resolved, token);
  }
  /** @inheritdoc */
  async startContinuousRun(req, token) {
    if (!req.exclude) {
      req.exclude = [...this.excluded.all];
    }
    const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({
      message: localize(21367, null)
    });
    if (!trust) {
      return;
    }
    const byController = groupBy2(req.targets, (a, b) => a.controllerId.localeCompare(b.controllerId));
    const requests = byController.map(
      (group2) => this.getTestController(group2[0].controllerId)?.startContinuousRun(
        group2.map((controlReq) => ({
          excludeExtIds: req.exclude.filter((t2) => !controlReq.testIds.includes(t2)),
          profileId: controlReq.profileId,
          controllerId: controlReq.controllerId,
          testIds: controlReq.testIds
        })),
        token
      ).then((result) => {
        const errs = result.map((r2) => r2.error).filter(isDefined);
        if (errs.length) {
          this.notificationService.error(localize(21366, null, errs.join(" ")));
        }
      })
    );
    await Promise.all(requests);
  }
  /**
   * @inheritdoc
   */
  async runResolvedTests(req, token = CancellationToken.None) {
    if (!req.exclude) {
      req.exclude = [...this.excluded.all];
    }
    const result = this.testResults.createLiveResult(req);
    const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({
      message: localize(21367, null)
    });
    if (!trust) {
      result.markComplete();
      return result;
    }
    try {
      const cancelSource = new CancellationTokenSource(token);
      this.uiRunningTests.set(result.id, cancelSource);
      const byController = groupBy2(req.targets, (a, b) => a.controllerId.localeCompare(b.controllerId));
      const requests = byController.map(
        (group2) => this.getTestController(group2[0].controllerId)?.runTests(
          group2.map((controlReq) => ({
            runId: result.id,
            excludeExtIds: req.exclude.filter((t2) => !controlReq.testIds.includes(t2)),
            profileId: controlReq.profileId,
            controllerId: controlReq.controllerId,
            testIds: controlReq.testIds
          })),
          cancelSource.token
        ).then((result2) => {
          const errs = result2.map((r2) => r2.error).filter(isDefined);
          if (errs.length) {
            this.notificationService.error(localize(21366, null, errs.join(" ")));
          }
        })
      );
      await this.saveAllBeforeTest(req);
      await Promise.all(requests);
      return result;
    } finally {
      this.uiRunningTests.delete(result.id);
      result.markComplete();
    }
  }
  /**
   * @inheritdoc
   */
  async provideTestFollowups(req, token) {
    const reqs = await Promise.all([...this.testExtHosts].map(async (ctrl) => ({ ctrl, followups: await ctrl.provideTestFollowups(req, token) })));
    const followups = {
      followups: reqs.flatMap(({ ctrl, followups: followups2 }) => followups2.map((f) => ({
        message: f.title,
        execute: () => ctrl.executeTestFollowup(f.id)
      }))),
      dispose: () => {
        for (const { ctrl, followups: followups2 } of reqs) {
          ctrl.disposeTestFollowups(followups2.map((f) => f.id));
        }
      }
    };
    if (token.isCancellationRequested) {
      followups.dispose();
    }
    return followups;
  }
  /**
   * @inheritdoc
   */
  publishDiff(_controllerId, diff4) {
    this.willProcessDiffEmitter.fire(diff4);
    this.collection.apply(diff4);
    this.updateEditorContextKeys();
    this.didProcessDiffEmitter.fire(diff4);
  }
  /**
   * @inheritdoc
   */
  getTestController(id2) {
    return this.testControllers.get().get(id2);
  }
  /**
   * @inheritdoc
   */
  async syncTests() {
    const cts = new CancellationTokenSource();
    try {
      await Promise.all([...this.testControllers.get().values()].map((c) => c.syncTests(cts.token)));
    } finally {
      cts.dispose(true);
    }
  }
  /**
   * @inheritdoc
   */
  async refreshTests(controllerId) {
    const cts = new CancellationTokenSource();
    this.testRefreshCancellations.add(cts);
    this.isRefreshingTests.set(true);
    try {
      if (controllerId) {
        await this.getTestController(controllerId)?.refreshTests(cts.token);
      } else {
        await Promise.all([...this.testControllers.get().values()].map((c) => c.refreshTests(cts.token)));
      }
    } finally {
      this.testRefreshCancellations.delete(cts);
      this.isRefreshingTests.set(this.testRefreshCancellations.size > 0);
      cts.dispose(true);
    }
  }
  /**
   * @inheritdoc
   */
  cancelRefreshTests() {
    for (const cts of this.testRefreshCancellations) {
      cts.cancel();
    }
    this.testRefreshCancellations.clear();
    this.isRefreshingTests.set(false);
  }
  /**
   * @inheritdoc
   */
  registerExtHost(controller) {
    this.testExtHosts.add(controller);
    return toDisposable(() => this.testExtHosts.delete(controller));
  }
  /**
   * @inheritdoc
   */
  async getTestsRelatedToCode(uri5, position2, token = CancellationToken.None) {
    const testIds = await Promise.all([...this.testExtHosts.values()].map((v2) => v2.getTestsRelatedToCode(uri5, position2, token)));
    return testIds.flatMap((ids) => ids.map((id2) => this.collection.getNodeById(id2))).filter(isDefined);
  }
  /**
   * @inheritdoc
   */
  registerTestController(id2, controller) {
    this.testControllers.set(new Map(this.testControllers.get()).set(id2, controller), void 0);
    return toDisposable(() => {
      const diff4 = [];
      for (const root of this.collection.rootItems) {
        if (root.controllerId === id2) {
          diff4.push({ op: 3 /* Remove */, itemId: root.item.extId });
        }
      }
      this.publishDiff(id2, diff4);
      const next = new Map(this.testControllers.get());
      next.delete(id2);
      this.testControllers.set(next, void 0);
    });
  }
  /**
   * @inheritdoc
   */
  async getCodeRelatedToTest(test, token = CancellationToken.None) {
    return await this.testControllers.get().get(test.controllerId)?.getRelatedCode(test.item.extId, token) || [];
  }
  updateEditorContextKeys() {
    const uri5 = this.editorService.activeEditor?.resource;
    if (uri5) {
      this.activeEditorHasTests.set(!Iterable.isEmpty(this.collection.getNodeByUrl(uri5)));
    } else {
      this.activeEditorHasTests.set(false);
    }
  }
  async saveAllBeforeTest(req, configurationService = this.configurationService, editorService = this.editorService) {
    if (req.preserveFocus === true) {
      return;
    }
    const saveBeforeTest = getTestingConfiguration(this.configurationService, "testing.saveBeforeTest" /* SaveBeforeTest */);
    if (saveBeforeTest) {
      await editorService.saveAll();
    }
    return;
  }
};

TestService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, ITestProfileService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ITestResultService),
  __decorateParam(9, IWorkspaceTrustRequestService)
], TestService);
export { TestService };
