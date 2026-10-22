// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTesting.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { Event2 } from "./module-0017.mjs";
import { LiveTestResult } from "./module-1432.mjs";
import { WellDefinedPrefixTree } from "./module-1187.mjs";
import { TestId } from "./module-1207.mjs";
import { CoverageDetails, IFileCoverage, ITestItem, ITestMessage, TestsDiffOp } from "./module-1208.mjs";
import { transaction } from "./module-0045.mjs";
import { TestCoverage2 } from "./module-1425.mjs";
import { URI } from "./module-0032.mjs";
import { Range2 } from "./module-0106.mjs";
import { observableValue } from "./module-0048.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ITestService } from "./module-1435.mjs";
import { ITestProfileService } from "./module-1429.mjs";
import { ITestResultService } from "./module-1434.mjs";


// src/vs/workbench/api/browser/mainThreadTesting.ts
var MainThreadTesting = class extends Disposable {
  constructor(extHostContext, uriIdentityService, testService, testProfiles, resultService) {
    super();
    this.uriIdentityService = uriIdentityService;
    this.testService = testService;
    this.testProfiles = testProfiles;
    this.resultService = resultService;
    this.diffListener = this._register(new MutableDisposable());
    this.testProviderRegistrations = /* @__PURE__ */ new Map();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostTesting);
    this._register(this.testService.registerExtHost({
      provideTestFollowups: (req, token) => this.proxy.$provideTestFollowups(req, token),
      executeTestFollowup: (id2) => this.proxy.$executeTestFollowup(id2),
      disposeTestFollowups: (ids) => this.proxy.$disposeTestFollowups(ids),
      getTestsRelatedToCode: (uri5, position2, token) => this.proxy.$getTestsRelatedToCode(uri5, position2, token)
    }));
    this._register(this.testService.onDidCancelTestRun(({ runId, taskId }) => {
      this.proxy.$cancelExtensionTestRun(runId, taskId);
    }));
    this._register(Event2.debounce(testProfiles.onDidChange, (_last, e) => e)(() => {
      const obj = {};
      for (const group2 of [2 /* Run */, 4 /* Debug */, 8 /* Coverage */]) {
        for (const profile of this.testProfiles.getGroupDefaultProfiles(group2)) {
          obj[profile.controllerId] ??= [];
          obj[profile.controllerId].push(profile.profileId);
        }
      }
      this.proxy.$setDefaultRunProfiles(obj);
    }));
    this._register(resultService.onResultsChanged((evt) => {
      if ("completed" in evt) {
        const serialized = evt.completed.toJSONWithMessages();
        if (serialized) {
          this.proxy.$publishTestResults([serialized]);
        }
      } else if ("removed" in evt) {
        evt.removed.forEach((r2) => {
          if (r2 instanceof LiveTestResult) {
            this.proxy.$disposeRun(r2.id);
          }
        });
      }
    }));
  }
  /**
   * @inheritdoc
   */
  $markTestRetired(testIds) {
    let tree;
    if (testIds) {
      tree = new WellDefinedPrefixTree();
      for (const id2 of testIds) {
        tree.insert(TestId.fromString(id2).path, void 0);
      }
    }
    for (const result of this.resultService.results) {
      if (result instanceof LiveTestResult) {
        result.markRetired(tree);
      }
    }
  }
  /**
   * @inheritdoc
   */
  $publishTestRunProfile(profile) {
    const controller = this.testProviderRegistrations.get(profile.controllerId);
    if (controller) {
      this.testProfiles.addProfile(controller.instance, profile);
    }
  }
  /**
   * @inheritdoc
   */
  $updateTestRunConfig(controllerId, profileId, update) {
    this.testProfiles.updateProfile(controllerId, profileId, update);
  }
  /**
   * @inheritdoc
   */
  $removeTestProfile(controllerId, profileId) {
    this.testProfiles.removeProfile(controllerId, profileId);
  }
  /**
   * @inheritdoc
   */
  $addTestsToRun(controllerId, runId, tests) {
    this.withLiveRun(runId, (r2) => r2.addTestChainToRun(
      controllerId,
      tests.map((t2) => ITestItem.deserialize(this.uriIdentityService, t2))
    ));
  }
  /**
   * @inheritdoc
   */
  $appendCoverage(runId, taskId, coverage) {
    this.withLiveRun(runId, (run) => {
      const task = run.tasks.find((t2) => t2.id === taskId);
      if (!task) {
        return;
      }
      const deserialized = IFileCoverage.deserialize(this.uriIdentityService, coverage);
      transaction((tx) => {
        let value2 = task.coverage.read(void 0);
        if (!value2) {
          value2 = new TestCoverage2(run, taskId, this.uriIdentityService, {
            getCoverageDetails: (id2, testId, token) => this.proxy.$getCoverageDetails(id2, testId, token).then((r2) => r2.map(CoverageDetails.deserialize))
          });
          value2.append(deserialized, tx);
          task.coverage.set(value2, tx);
        } else {
          value2.append(deserialized, tx);
        }
      });
    });
  }
  /**
   * @inheritdoc
   */
  $startedExtensionTestRun(req) {
    this.resultService.createLiveResult(req);
  }
  /**
   * @inheritdoc
   */
  $startedTestRunTask(runId, task) {
    this.withLiveRun(runId, (r2) => r2.addTask(task));
  }
  /**
   * @inheritdoc
   */
  $finishedTestRunTask(runId, taskId) {
    this.withLiveRun(runId, (r2) => r2.markTaskComplete(taskId));
  }
  /**
   * @inheritdoc
   */
  $finishedExtensionTestRun(runId) {
    this.withLiveRun(runId, (r2) => r2.markComplete());
  }
  /**
   * @inheritdoc
   */
  $updateTestStateInRun(runId, taskId, testId, state, duration) {
    this.withLiveRun(runId, (r2) => r2.updateState(testId, taskId, state, duration));
  }
  /**
   * @inheritdoc
   */
  $appendOutputToRun(runId, taskId, output, locationDto, testId) {
    const location2 = locationDto && {
      uri: URI.revive(locationDto.uri),
      range: Range2.lift(locationDto.range)
    };
    this.withLiveRun(runId, (r2) => r2.appendOutput(output, taskId, location2, testId));
  }
  /**
   * @inheritdoc
   */
  $appendTestMessagesInRun(runId, taskId, testId, messages) {
    const r2 = this.resultService.getResult(runId);
    if (r2 && r2 instanceof LiveTestResult) {
      for (const message of messages) {
        r2.appendMessage(testId, taskId, ITestMessage.deserialize(this.uriIdentityService, message));
      }
    }
  }
  /**
   * @inheritdoc
   */
  $registerTestController(controllerId, _label, _capabilities) {
    const disposable = new DisposableStore();
    const label3 = observableValue(`${controllerId}.label`, _label);
    const capabilities = observableValue(`${controllerId}.cap`, _capabilities);
    const controller = {
      id: controllerId,
      label: label3,
      capabilities,
      syncTests: () => this.proxy.$syncTests(),
      refreshTests: (token) => this.proxy.$refreshTests(controllerId, token),
      configureRunProfile: (id2) => this.proxy.$configureRunProfile(controllerId, id2),
      runTests: (reqs, token) => this.proxy.$runControllerTests(reqs, token),
      startContinuousRun: (reqs, token) => this.proxy.$startContinuousRun(reqs, token),
      expandTest: (testId, levels) => this.proxy.$expandTest(testId, isFinite(levels) ? levels : -1),
      getRelatedCode: (testId, token) => this.proxy.$getCodeRelatedToTest(testId, token).then(
        (locations) => locations.map((l) => ({
          uri: URI.revive(l.uri),
          range: Range2.lift(l.range)
        }))
      )
    };
    disposable.add(toDisposable(() => this.testProfiles.removeProfile(controllerId)));
    disposable.add(this.testService.registerTestController(controllerId, controller));
    this.testProviderRegistrations.set(controllerId, {
      instance: controller,
      label: label3,
      capabilities,
      disposable
    });
  }
  /**
   * @inheritdoc
   */
  $updateController(controllerId, patch2) {
    const controller = this.testProviderRegistrations.get(controllerId);
    if (!controller) {
      return;
    }
    transaction((tx) => {
      if (patch2.label !== void 0) {
        controller.label.set(patch2.label, tx);
      }
      if (patch2.capabilities !== void 0) {
        controller.capabilities.set(patch2.capabilities, tx);
      }
    });
  }
  /**
   * @inheritdoc
   */
  $unregisterTestController(controllerId) {
    this.testProviderRegistrations.get(controllerId)?.disposable.dispose();
    this.testProviderRegistrations.delete(controllerId);
  }
  /**
   * @inheritdoc
   */
  $subscribeToDiffs() {
    this.proxy.$acceptDiff(this.testService.collection.getReviverDiff().map(TestsDiffOp.serialize));
    this.diffListener.value = this.testService.onDidProcessDiff(this.proxy.$acceptDiff, this.proxy);
  }
  /**
   * @inheritdoc
   */
  $unsubscribeFromDiffs() {
    this.diffListener.clear();
  }
  /**
   * @inheritdoc
   */
  $publishDiff(controllerId, diff4) {
    this.testService.publishDiff(
      controllerId,
      diff4.map((d) => TestsDiffOp.deserialize(this.uriIdentityService, d))
    );
  }
  /**
   * @inheritdoc
   */
  async $runTests(req, token) {
    const result = await this.testService.runResolvedTests(req, token);
    return result.id;
  }
  /**
   * @inheritdoc
   */
  async $getCoverageDetails(resultId, taskIndex, uri5, token) {
    const details = await this.resultService.getResult(resultId)?.tasks[taskIndex]?.coverage.get()?.getUri(URI.from(uri5))?.details(token);
    return details || [];
  }
  dispose() {
    super.dispose();
    for (const subscription of this.testProviderRegistrations.values()) {
      subscription.disposable.dispose();
    }
    this.testProviderRegistrations.clear();
  }
  withLiveRun(runId, fn) {
    const r2 = this.resultService.getResult(runId);
    return r2 && r2 instanceof LiveTestResult ? fn(r2) : void 0;
  }
};

MainThreadTesting = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTesting),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, ITestService),
  __decorateParam(3, ITestProfileService),
  __decorateParam(4, ITestResultService)
], MainThreadTesting);
export { MainThreadTesting };
