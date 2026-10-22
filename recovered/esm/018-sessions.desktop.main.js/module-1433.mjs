// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testResultService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { TestingContextKeys } from "./module-1427.mjs";
import { generateUuid } from "./module-0190.mjs";
import { LiveTestResult } from "./module-1431.mjs";
import { findFirstIdxMonotonousOrArrLen } from "./module-0006.mjs";
import { ITestResultStorage, RETAIN_MAX_RESULTS } from "./module-1432.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITestProfileService } from "./module-1428.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/testing/common/testResultService.ts
var isRunningTests = (service) => service.results.length > 0 && service.results[0].completedAt === void 0;

var ITestResultService = createDecorator("testResultService");

var TestResultService = class extends Disposable {
  constructor(contextKeyService, storage, testProfiles, telemetryService) {
    super();
    this.storage = storage;
    this.testProfiles = testProfiles;
    this.telemetryService = telemetryService;
    this.changeResultEmitter = this._register(new Emitter());
    this._results = [];
    this._resultsDisposables = [];
    this.testChangeEmitter = this._register(new Emitter());
    this.insertOrderCounter = 0;
    /**
     * @inheritdoc
     */
    this.onResultsChanged = this.changeResultEmitter.event;
    /**
     * @inheritdoc
     */
    this.onTestChanged = this.testChangeEmitter.event;
    this.loadResults = createSingleCallFunction(() => this.storage.read().then((loaded) => {
      for (let i2 = loaded.length - 1; i2 >= 0; i2--) {
        this.push(loaded[i2]);
      }
    }));
    this.persistScheduler = this._register(new RunOnceScheduler(() => this.persistImmediately(), 500));
    this._register(toDisposable(() => dispose(this._resultsDisposables)));
    this.isRunning = TestingContextKeys.isRunning.bindTo(contextKeyService);
    this.hasAnyResults = TestingContextKeys.hasAnyResults.bindTo(contextKeyService);
  }
  /**
   * @inheritdoc
   */
  get results() {
    this.loadResults();
    return this._results;
  }
  /**
   * @inheritdoc
   */
  getStateById(extId) {
    for (const result of this.results) {
      const lookup = result.getStateById(extId);
      if (lookup && lookup.computedState !== 0 /* Unset */) {
        return [result, lookup];
      }
    }
    return void 0;
  }
  /**
   * @inheritdoc
   */
  createLiveResult(req) {
    if ("targets" in req) {
      const id2 = generateUuid();
      return this.push(new LiveTestResult(id2, true, req, this.insertOrderCounter++, this.telemetryService));
    }
    let profile;
    if (req.profile) {
      const profiles2 = this.testProfiles.getControllerProfiles(req.controllerId);
      profile = profiles2.find((c) => c.profileId === req.profile.id);
    }
    const resolved = {
      preserveFocus: req.preserveFocus,
      targets: [],
      exclude: req.exclude,
      continuous: req.continuous,
      group: profile?.group ?? 2 /* Run */
    };
    if (profile) {
      resolved.targets.push({
        profileId: profile.profileId,
        controllerId: req.controllerId,
        testIds: req.include
      });
    }
    return this.push(new LiveTestResult(req.id, req.persist, resolved, this.insertOrderCounter++, this.telemetryService));
  }
  /**
   * @inheritdoc
   */
  push(result) {
    if (result.completedAt === void 0) {
      this.results.unshift(result);
    } else {
      const index2 = findFirstIdxMonotonousOrArrLen(this.results, (r2) => r2.completedAt !== void 0 && r2.completedAt <= result.completedAt);
      this.results.splice(index2, 0, result);
      this.persistScheduler.schedule();
    }
    this.hasAnyResults.set(true);
    if (this.results.length > RETAIN_MAX_RESULTS) {
      this.results.pop();
      this._resultsDisposables.pop()?.dispose();
    }
    const ds = new DisposableStore();
    this._resultsDisposables.push(ds);
    if (result instanceof LiveTestResult) {
      ds.add(result);
      ds.add(result.onComplete(() => this.onComplete(result)));
      ds.add(result.onChange(this.testChangeEmitter.fire, this.testChangeEmitter));
      this.isRunning.set(true);
      this.changeResultEmitter.fire({ started: result });
    } else {
      this.changeResultEmitter.fire({ inserted: result });
      for (const item of result.tests) {
        for (const otherResult of this.results) {
          if (otherResult === result) {
            this.testChangeEmitter.fire({ item, result, reason: 0 /* ComputedStateChange */ });
            break;
          } else if (otherResult.getStateById(item.item.extId) !== void 0) {
            break;
          }
        }
      }
    }
    return result;
  }
  /**
   * @inheritdoc
   */
  getResult(id2) {
    return this.results.find((r2) => r2.id === id2);
  }
  /**
   * @inheritdoc
   */
  clear() {
    const keep = [];
    const removed = [];
    for (const result of this.results) {
      if (result.completedAt !== void 0) {
        removed.push(result);
      } else {
        keep.push(result);
      }
    }
    this._results = keep;
    this.persistScheduler.schedule();
    if (keep.length === 0) {
      this.hasAnyResults.set(false);
    }
    this.changeResultEmitter.fire({ removed });
  }
  onComplete(result) {
    this.resort();
    this.updateIsRunning();
    this.persistScheduler.schedule();
    this.changeResultEmitter.fire({ completed: result });
  }
  resort() {
    this.results.sort((a, b) => {
      if (!!a.completedAt !== !!b.completedAt) {
        return a.completedAt === void 0 ? -1 : 1;
      }
      const aComp = a instanceof LiveTestResult ? a.insertOrder : -1;
      const bComp = b instanceof LiveTestResult ? b.insertOrder : -1;
      return bComp - aComp;
    });
  }
  updateIsRunning() {
    this.isRunning.set(isRunningTests(this));
  }
  async persistImmediately() {
    await this.loadResults();
    this.storage.persist(this.results);
  }
};

TestResultService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ITestResultStorage),
  __decorateParam(2, ITestProfileService),
  __decorateParam(3, ITelemetryService)
], TestResultService);
export { isRunningTests, ITestResultService, TestResultService };
