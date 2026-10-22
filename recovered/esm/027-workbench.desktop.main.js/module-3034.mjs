// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testingContinuousRunService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { WellDefinedPrefixTree } from "./module-1187.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { StoredValue } from "./module-1426.mjs";
import { TestId } from "./module-1207.mjs";
import { observableValue } from "./module-0048.mjs";
import { equals } from "./module-0007.mjs";
import { autorunIterableDelta } from "./module-0052.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITestService } from "./module-1435.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITestProfileService } from "./module-1429.mjs";


// src/vs/workbench/contrib/testing/common/testingContinuousRunService.ts
var ITestingContinuousRunService = createDecorator("testingContinuousRunService");

var TestingContinuousRunService = class extends Disposable {
  constructor(testService, storageService, contextKeyService, testProfileService) {
    super();
    this.testService = testService;
    this.testProfileService = testProfileService;
    this.changeEmitter = this._register(new Emitter());
    this.running = new WellDefinedPrefixTree();
    this.onDidChange = this.changeEmitter.event;
    const isGloballyOn = TestingContextKeys.isContinuousModeOn.bindTo(contextKeyService);
    this._register(this.onDidChange(() => {
      isGloballyOn.set(!!this.running.root.value);
    }));
    this.lastRun = this._register(new StoredValue({
      key: "lastContinuousRunProfileIds",
      scope: 1 /* WORKSPACE */,
      target: 1 /* MACHINE */,
      serialization: {
        deserialize: (v2) => new Set(JSON.parse(v2)),
        serialize: (v2) => JSON.stringify([...v2])
      }
    }, storageService));
    this._register(toDisposable(() => {
      for (const cts of this.running.values()) {
        cts.handle.dispose();
      }
    }));
  }
  get lastRunProfileIds() {
    return this.lastRun.get(/* @__PURE__ */ new Set());
  }
  /** @inheritdoc */
  isSpecificallyEnabledFor(testId) {
    return this.running.size > 0 && this.running.hasKey(TestId.fromString(testId).path);
  }
  /** @inheritdoc */
  isEnabledForAParentOf(testId) {
    return !!this.running.root.value || this.running.size > 0 && this.running.hasKeyOrParent(TestId.fromString(testId).path);
  }
  /** @inheritdoc */
  isEnabledForProfile({ profileId, controllerId }) {
    for (const node of this.running.values()) {
      if (node.profiles.get().some((p) => p.profileId === profileId && p.controllerId === controllerId)) {
        return true;
      }
    }
    return false;
  }
  /** @inheritdoc */
  isEnabledForAChildOf(testId) {
    return !!this.running.root.value || this.running.size > 0 && this.running.hasKeyOrChildren(TestId.fromString(testId).path);
  }
  /** @inheritdoc */
  isEnabled() {
    return !!this.running.root.value || this.running.size > 0;
  }
  /** @inheritdoc */
  start(profiles2, testId) {
    const store = new DisposableStore();
    let actualProfiles;
    if (profiles2 instanceof Array) {
      actualProfiles = observableValue("crProfiles", profiles2);
    } else {
      const getRelevant = () => this.testProfileService.getGroupDefaultProfiles(profiles2).filter((p) => p.supportsContinuousRun && (!testId || TestId.root(testId) === p.controllerId));
      actualProfiles = observableValue("crProfiles", getRelevant());
      store.add(this.testProfileService.onDidChange(() => {
        if (ref.autoSetDefault) {
          const newRelevant = getRelevant();
          if (!equals(newRelevant, actualProfiles.get())) {
            actualProfiles.set(getRelevant(), void 0);
          }
        }
      }));
    }
    const path = testId ? TestId.fromString(testId).path : [];
    const ref = { profiles: actualProfiles, handle: store, path, autoSetDefault: typeof profiles2 === "number" };
    const existing = this.running.find(path);
    if (existing) {
      store.dispose();
      ref.autoSetDefault = existing.autoSetDefault = false;
      existing.profiles.set([.../* @__PURE__ */ new Set([...actualProfiles.get(), ...existing.profiles.get()])], void 0);
      this.changeEmitter.fire(testId);
      return;
    }
    this.running.insert(path, ref);
    const cancellationStores = new DisposableMap();
    store.add(toDisposable(() => {
      for (const cts of cancellationStores.values()) {
        cts.cancel();
      }
      cancellationStores.dispose();
    }));
    store.add(autorunIterableDelta((reader) => actualProfiles.read(reader), ({ addedValues, removedValues }) => {
      for (const profile of addedValues) {
        const cts = new CancellationTokenSource();
        this.testService.startContinuousRun({
          continuous: true,
          group: profile.group,
          targets: [{
            testIds: [testId ?? profile.controllerId],
            controllerId: profile.controllerId,
            profileId: profile.profileId
          }]
        }, cts.token);
        cancellationStores.set(profile, cts);
      }
      for (const profile of removedValues) {
        cancellationStores.get(profile)?.cancel();
        cancellationStores.deleteAndDispose(profile);
      }
      this.lastRun.store(new Set([...cancellationStores.keys()].map((p) => p.profileId)));
    }));
    this.changeEmitter.fire(testId);
  }
  /** Stops a continuous run for the profile across all test items that are running it. */
  stopProfile({ profileId, controllerId }) {
    const toDelete = [];
    for (const node of this.running.values()) {
      const profs = node.profiles.get();
      const filtered = profs.filter((p) => p.profileId !== profileId || p.controllerId !== controllerId);
      if (filtered.length === profs.length) {
        continue;
      } else if (filtered.length === 0) {
        toDelete.push(node);
      } else {
        node.profiles.set(filtered, void 0);
      }
    }
    for (let i2 = toDelete.length - 1; i2 >= 0; i2--) {
      toDelete[i2].handle.dispose();
      this.running.delete(toDelete[i2].path);
    }
    this.changeEmitter.fire(void 0);
  }
  /** @inheritdoc */
  stop(testId) {
    const cancellations = [...this.running.deleteRecursive(testId ? TestId.fromString(testId).path : [])];
    for (let i2 = cancellations.length - 1; i2 >= 0; i2--) {
      cancellations[i2].handle.dispose();
    }
    this.changeEmitter.fire(testId);
  }
};

TestingContinuousRunService = __decorateClass([
  __decorateParam(0, ITestService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ITestProfileService)
], TestingContinuousRunService);
export { ITestingContinuousRunService, TestingContinuousRunService };
