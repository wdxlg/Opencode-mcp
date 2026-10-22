// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testProfileService.ts
import { createDecorator } from "./module-0077.mjs";
import { TestId } from "./module-1207.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { StoredValue } from "./module-1426.mjs";
import { deepClone } from "./module-0098.mjs";
import { Iterable } from "./module-0011.mjs";
import { testRunProfileBitsetList } from "./module-1208.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/testing/common/testProfileService.ts
var ITestProfileService = createDecorator("testProfileService");

var canUseProfileWithTest = (profile, test) => profile.controllerId === test.controllerId && (TestId.isRoot(test.item.extId) || !profile.tag || test.item.tags.includes(profile.tag));

var sorter2 = (a, b) => {
  if (a.isDefault !== b.isDefault) {
    return a.isDefault ? -1 : 1;
  }
  return a.label.localeCompare(b.label);
};

var capabilityContextKeys = (capabilities) => [
  [TestingContextKeys.hasRunnableTests.key, (capabilities & 2 /* Run */) !== 0],
  [TestingContextKeys.hasDebuggableTests.key, (capabilities & 4 /* Debug */) !== 0],
  [TestingContextKeys.hasCoverableTests.key, (capabilities & 8 /* Coverage */) !== 0]
];

var TestProfileService = class extends Disposable {
  constructor(contextKeyService, storageService) {
    super();
    this.changeEmitter = this._register(new Emitter());
    this.controllerProfiles = /* @__PURE__ */ new Map();
    /** @inheritdoc */
    this.onDidChange = this.changeEmitter.event;
    storageService.remove("testingPreferredProfiles", 1 /* WORKSPACE */);
    this.userDefaults = this._register(new StoredValue({
      key: "testingPreferredProfiles2",
      scope: 1 /* WORKSPACE */,
      target: 1 /* MACHINE */
    }, storageService));
    this.capabilitiesContexts = {
      [2 /* Run */]: TestingContextKeys.hasRunnableTests.bindTo(contextKeyService),
      [4 /* Debug */]: TestingContextKeys.hasDebuggableTests.bindTo(contextKeyService),
      [8 /* Coverage */]: TestingContextKeys.hasCoverableTests.bindTo(contextKeyService),
      [16 /* HasNonDefaultProfile */]: TestingContextKeys.hasNonDefaultProfile.bindTo(contextKeyService),
      [32 /* HasConfigurable */]: TestingContextKeys.hasConfigurableProfile.bindTo(contextKeyService),
      [64 /* SupportsContinuousRun */]: TestingContextKeys.supportsContinuousRun.bindTo(contextKeyService)
    };
    this.refreshContextKeys();
  }
  /** @inheritdoc */
  addProfile(controller, profile) {
    const previousExplicitDefaultValue = this.userDefaults.get()?.[controller.id]?.[profile.profileId];
    const extended = {
      ...profile,
      isDefault: previousExplicitDefaultValue ?? profile.isDefault,
      wasInitiallyDefault: profile.isDefault
    };
    let record = this.controllerProfiles.get(profile.controllerId);
    if (record) {
      record.profiles.push(extended);
      record.profiles.sort(sorter2);
    } else {
      record = {
        profiles: [extended],
        controller
      };
      this.controllerProfiles.set(profile.controllerId, record);
    }
    this.refreshContextKeys();
    this.changeEmitter.fire();
  }
  /** @inheritdoc */
  updateProfile(controllerId, profileId, update) {
    const ctrl = this.controllerProfiles.get(controllerId);
    if (!ctrl) {
      return;
    }
    const profile = ctrl.profiles.find((c) => c.controllerId === controllerId && c.profileId === profileId);
    if (!profile) {
      return;
    }
    Object.assign(profile, update);
    ctrl.profiles.sort(sorter2);
    if (update.isDefault !== void 0) {
      const map = deepClone(this.userDefaults.get({}));
      setIsDefault(map, profile, update.isDefault);
      this.userDefaults.store(map);
    }
    this.changeEmitter.fire();
  }
  /** @inheritdoc */
  configure(controllerId, profileId) {
    this.controllerProfiles.get(controllerId)?.controller.configureRunProfile(profileId);
  }
  /** @inheritdoc */
  removeProfile(controllerId, profileId) {
    const ctrl = this.controllerProfiles.get(controllerId);
    if (!ctrl) {
      return;
    }
    if (!profileId) {
      this.controllerProfiles.delete(controllerId);
      this.changeEmitter.fire();
      return;
    }
    const index2 = ctrl.profiles.findIndex((c) => c.profileId === profileId);
    if (index2 === -1) {
      return;
    }
    ctrl.profiles.splice(index2, 1);
    this.refreshContextKeys();
    this.changeEmitter.fire();
  }
  /** @inheritdoc */
  capabilitiesForTest(test) {
    const ctrl = this.controllerProfiles.get(TestId.root(test.extId));
    if (!ctrl) {
      return 0;
    }
    let capabilities = 0;
    for (const profile of ctrl.profiles) {
      if (!profile.tag || test.tags.includes(profile.tag)) {
        capabilities |= capabilities & profile.group ? 16 /* HasNonDefaultProfile */ : profile.group;
      }
    }
    return capabilities;
  }
  /** @inheritdoc */
  all() {
    return this.controllerProfiles.values();
  }
  /** @inheritdoc */
  getControllerProfiles(profileId) {
    return this.controllerProfiles.get(profileId)?.profiles ?? [];
  }
  /** @inheritdoc */
  getGroupDefaultProfiles(group2, controllerId) {
    const allProfiles = controllerId ? this.controllerProfiles.get(controllerId)?.profiles || [] : [...Iterable.flatMap(this.controllerProfiles.values(), (c) => c.profiles)];
    const defaults = allProfiles.filter((c) => c.group === group2 && c.isDefault);
    if (defaults.length === 0) {
      const first2 = allProfiles.find((p) => p.group === group2);
      if (first2) {
        defaults.push(first2);
      }
    }
    return defaults;
  }
  /** @inheritdoc */
  setGroupDefaultProfiles(group2, profiles2) {
    const next = {};
    for (const ctrl of this.controllerProfiles.values()) {
      next[ctrl.controller.id] = {};
      for (const profile of ctrl.profiles) {
        if (profile.group !== group2) {
          continue;
        }
        setIsDefault(next, profile, profiles2.some((p) => p.profileId === profile.profileId));
      }
      for (const profile of ctrl.profiles) {
        if (profile.group === group2) {
          continue;
        }
        const matching = ctrl.profiles.find((p) => p.group === group2 && p.label === profile.label);
        if (matching) {
          setIsDefault(next, profile, matching.isDefault);
        }
      }
      ctrl.profiles.sort(sorter2);
    }
    this.userDefaults.store(next);
    this.changeEmitter.fire();
  }
  getDefaultProfileForTest(group2, test) {
    return this.getControllerProfiles(test.controllerId).find((p) => (p.group & group2) !== 0 && canUseProfileWithTest(p, test));
  }
  refreshContextKeys() {
    let allCapabilities = 0;
    for (const { profiles: profiles2 } of this.controllerProfiles.values()) {
      for (const profile of profiles2) {
        allCapabilities |= allCapabilities & profile.group ? 16 /* HasNonDefaultProfile */ : profile.group;
        allCapabilities |= profile.supportsContinuousRun ? 64 /* SupportsContinuousRun */ : 0;
      }
    }
    for (const group2 of testRunProfileBitsetList) {
      this.capabilitiesContexts[group2].set((allCapabilities & group2) !== 0);
    }
  }
};

TestProfileService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IStorageService)
], TestProfileService);

var setIsDefault = (map, profile, isDefault) => {
  profile.isDefault = isDefault;
  map[profile.controllerId] ??= {};
  if (profile.isDefault !== profile.wasInitiallyDefault) {
    map[profile.controllerId][profile.profileId] = profile.isDefault;
  } else {
    delete map[profile.controllerId][profile.profileId];
  }
};
export { ITestProfileService, canUseProfileWithTest, sorter2, capabilityContextKeys, TestProfileService, setIsDefault };
