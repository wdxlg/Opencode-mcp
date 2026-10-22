// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/nullTestingService.ts
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { Iterable } from "./module-0011.mjs";
import { MutableObservableValue } from "./module-2910.mjs";
import { MainThreadTestCollection } from "./module-2909.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/testing/common/nullTestingService.ts
var NullTestExclusions = class extends Disposable {
  constructor() {
    super(...arguments);
    this.onTestExclusionsChanged = Event2.None;
  }
  get hasAny() {
    return false;
  }
  get all() {
    return Iterable.empty();
  }
  toggle() {
  }
  contains() {
    return false;
  }
  clear() {
  }
};

var NullTestService = class extends Disposable {
  constructor(uriIdentityService) {
    super();
    this.onDidCancelTestRun = Event2.None;
    this.onWillProcessDiff = Event2.None;
    this.onDidProcessDiff = Event2.None;
    this.excluded = this._register(new NullTestExclusions());
    this.showInlineOutput = this._register(new MutableObservableValue(false));
    this.collection = new MainThreadTestCollection(uriIdentityService, () => Promise.resolve());
  }
  registerExtHost() {
    return Disposable.None;
  }
  registerTestController() {
    return Disposable.None;
  }
  getTestController() {
    return void 0;
  }
  async refreshTests() {
  }
  cancelRefreshTests() {
  }
  async startContinuousRun() {
  }
  async runTests() {
    throw new Error("Tests are not supported in this window.");
  }
  async runResolvedTests() {
    throw new Error("Tests are not supported in this window.");
  }
  async provideTestFollowups() {
    return { followups: [], dispose() {
    } };
  }
  async syncTests() {
  }
  cancelTestRun() {
  }
  publishDiff() {
  }
  async getTestsRelatedToCode(_uri, _position) {
    return [];
  }
  async getCodeRelatedToTest() {
    return [];
  }
};

NullTestService = __decorateClass([
  __decorateParam(0, IUriIdentityService)
], NullTestService);

var NullTestProfileService = class extends Disposable {
  constructor() {
    super(...arguments);
    this.onDidChange = Event2.None;
  }
  addProfile() {
  }
  updateProfile() {
  }
  removeProfile() {
  }
  capabilitiesForTest() {
    return 0;
  }
  configure() {
  }
  all() {
    return Iterable.empty();
  }
  getGroupDefaultProfiles() {
    return [];
  }
  setGroupDefaultProfiles() {
  }
  getControllerProfiles() {
    return [];
  }
  getDefaultProfileForTest() {
    return void 0;
  }
};

var NullTestResultService = class extends Disposable {
  constructor() {
    super(...arguments);
    this.onResultsChanged = Event2.None;
    this.onTestChanged = Event2.None;
    this.results = [];
  }
  clear() {
  }
  createLiveResult() {
    throw new Error("Tests are not supported in this window.");
  }
  push(result) {
    return result;
  }
  getResult() {
    return void 0;
  }
  getStateById() {
    return void 0;
  }
};
export { NullTestExclusions, NullTestService, NullTestProfileService, NullTestResultService };
