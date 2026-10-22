// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/activity/browser/activityService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IActivityService } from "./module-1449.mjs";
import { ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID } from "./module-1610.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/activity/browser/activityService.ts
var ViewContainerActivityByView = class extends Disposable {
  constructor(viewId, viewDescriptorService, activityService) {
    super();
    this.viewId = viewId;
    this.viewDescriptorService = viewDescriptorService;
    this.activityService = activityService;
    this.activity = void 0;
    this.activityDisposable = Disposable.None;
    this._register(Event2.filter(this.viewDescriptorService.onDidChangeContainer, (e) => e.views.some((view) => view.id === viewId))(() => this.update()));
    this._register(Event2.filter(this.viewDescriptorService.onDidChangeLocation, (e) => e.views.some((view) => view.id === viewId))(() => this.update()));
  }
  setActivity(activity) {
    this.activity = activity;
    this.update();
  }
  clearActivity() {
    this.activity = void 0;
    this.update();
  }
  update() {
    this.activityDisposable.dispose();
    const container3 = this.viewDescriptorService.getViewContainerByViewId(this.viewId);
    if (container3 && this.activity) {
      this.activityDisposable = this.activityService.showViewContainerActivity(container3.id, this.activity);
    }
  }
  dispose() {
    this.activityDisposable.dispose();
    super.dispose();
  }
};

ViewContainerActivityByView = __decorateClass([
  __decorateParam(1, IViewDescriptorService),
  __decorateParam(2, IActivityService)
], ViewContainerActivityByView);

var ActivityService = class extends Disposable {
  constructor(viewDescriptorService, instantiationService) {
    super();
    this.viewDescriptorService = viewDescriptorService;
    this.instantiationService = instantiationService;
    this.viewActivities = /* @__PURE__ */ new Map();
    this._onDidChangeActivity = this._register(new Emitter());
    this.onDidChangeActivity = this._onDidChangeActivity.event;
    this.viewContainerActivities = /* @__PURE__ */ new Map();
    this.globalActivities = /* @__PURE__ */ new Map();
  }
  showViewContainerActivity(viewContainerId, activity) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerById(viewContainerId);
    if (!viewContainer5) {
      return Disposable.None;
    }
    let activities = this.viewContainerActivities.get(viewContainerId);
    if (!activities) {
      activities = [];
      this.viewContainerActivities.set(viewContainerId, activities);
    }
    activities.push(activity);
    this._onDidChangeActivity.fire(viewContainer5);
    return toDisposable(() => {
      const idx = activities.indexOf(activity);
      if (idx !== -1) {
        activities.splice(idx, 1);
      }
      if (activities.length === 0) {
        this.viewContainerActivities.delete(viewContainerId);
      }
      this._onDidChangeActivity.fire(viewContainer5);
    });
  }
  getViewContainerActivities(viewContainerId) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerById(viewContainerId);
    if (viewContainer5) {
      return this.viewContainerActivities.get(viewContainerId) ?? [];
    }
    return [];
  }
  showViewActivity(viewId, activity) {
    let maybeItem = this.viewActivities.get(viewId);
    if (maybeItem) {
      maybeItem.id++;
    } else {
      maybeItem = {
        id: 1,
        activity: this.instantiationService.createInstance(ViewContainerActivityByView, viewId)
      };
      this.viewActivities.set(viewId, maybeItem);
    }
    const id2 = maybeItem.id;
    maybeItem.activity.setActivity(activity);
    const item = maybeItem;
    return toDisposable(() => {
      if (item.id === id2) {
        item.activity.dispose();
        this.viewActivities.delete(viewId);
      }
    });
  }
  showAccountsActivity(activity) {
    return this.showActivity(ACCOUNTS_ACTIVITY_ID, activity);
  }
  showGlobalActivity(activity) {
    return this.showActivity(GLOBAL_ACTIVITY_ID, activity);
  }
  getActivity(id2) {
    return this.globalActivities.get(id2) ?? [];
  }
  showActivity(id2, activity) {
    let activities = this.globalActivities.get(id2);
    if (!activities) {
      activities = [];
      this.globalActivities.set(id2, activities);
    }
    activities.push(activity);
    this._onDidChangeActivity.fire(id2);
    return toDisposable(() => {
      const idx = activities.indexOf(activity);
      if (idx !== -1) {
        activities.splice(idx, 1);
      }
      if (activities.length === 0) {
        this.globalActivities.delete(id2);
      }
      this._onDidChangeActivity.fire(id2);
    });
  }
};

ActivityService = __decorateClass([
  __decorateParam(0, IViewDescriptorService),
  __decorateParam(1, IInstantiationService)
], ActivityService);

registerSingleton(IActivityService, ActivityService, 1 /* Delayed */);
export { ViewContainerActivityByView, ActivityService };
