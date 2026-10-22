// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/common/contributions.ts
import { Disposable, DisposableStore, isDisposable } from "./module-0012.mjs";
import { DeferredPromise, runWhenGlobalIdle } from "./module-0036.mjs";
import { getOrSet } from "./module-0008.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { ILogService } from "./module-0095.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IEditorPaneService } from "./module-0871.mjs";
import { mark } from "./module-0506.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/workbench/common/contributions.ts
var Extensions10;

((Extensions21) => {
  Extensions21.Workbench = "workbench.contributions.kind";
})(Extensions10 || (Extensions10 = {}));

var WorkbenchPhase = ((WorkbenchPhase2) => {
  WorkbenchPhase2[WorkbenchPhase2["BlockStartup"] = 1 /* Starting */] = "BlockStartup";
  WorkbenchPhase2[WorkbenchPhase2["BlockRestore"] = 2 /* Ready */] = "BlockRestore";
  WorkbenchPhase2[WorkbenchPhase2["AfterRestored"] = 3 /* Restored */] = "AfterRestored";
  WorkbenchPhase2[WorkbenchPhase2["Eventually"] = 4 /* Eventually */] = "Eventually";
  return WorkbenchPhase2;
})(WorkbenchPhase || {});

function isOnEditorWorkbenchContributionInstantiation(obj) {
  const candidate = obj;
  return !!candidate && typeof candidate.editorTypeId === "string";
}

function toWorkbenchPhase(phase) {
  switch (phase) {
    case 3 /* Restored */:
      return WorkbenchPhase.AfterRestored;
    case 4 /* Eventually */:
      return WorkbenchPhase.Eventually;
  }
}

function toLifecyclePhase(instantiation) {
  switch (instantiation) {
    case WorkbenchPhase.BlockStartup:
      return 1 /* Starting */;
    case WorkbenchPhase.BlockRestore:
      return 2 /* Ready */;
    case WorkbenchPhase.AfterRestored:
      return 3 /* Restored */;
    case WorkbenchPhase.Eventually:
      return 4 /* Eventually */;
  }
}

var WorkbenchContributionsRegistry = class _WorkbenchContributionsRegistry extends Disposable {
  constructor() {
    super(...arguments);
    this.contributionsByPhase = /* @__PURE__ */ new Map();
    this.contributionsByEditor = /* @__PURE__ */ new Map();
    this.contributionsById = /* @__PURE__ */ new Map();
    this.instancesById = /* @__PURE__ */ new Map();
    this.instanceDisposables = this._register(new DisposableStore());
    this.timingsByPhase = /* @__PURE__ */ new Map();
    this.pendingRestoredContributions = new DeferredPromise();
    this.whenRestored = this.pendingRestoredContributions.p;
  }
  static {
    this.INSTANCE = new _WorkbenchContributionsRegistry();
  }
  static {
    this.BLOCK_BEFORE_RESTORE_WARN_THRESHOLD = 20;
  }
  static {
    this.BLOCK_AFTER_RESTORE_WARN_THRESHOLD = 100;
  }
  get timings() {
    return this.timingsByPhase;
  }
  registerWorkbenchContribution2(id2, ctor, instantiation) {
    const contribution = { id: id2, ctor };
    if (this.instantiationService && this.lifecycleService && this.logService && this.environmentService && this.editorPaneService && (typeof instantiation === "number" && this.lifecycleService.phase >= instantiation || typeof id2 === "string" && isOnEditorWorkbenchContributionInstantiation(instantiation) && this.editorPaneService.didInstantiateEditorPane(instantiation.editorTypeId))) {
      this.safeCreateContribution(this.instantiationService, this.logService, this.environmentService, contribution, typeof instantiation === "number" ? toLifecyclePhase(instantiation) : this.lifecycleService.phase);
    } else {
      if (typeof instantiation === "number") {
        getOrSet(this.contributionsByPhase, toLifecyclePhase(instantiation), []).push(contribution);
      }
      if (typeof id2 === "string") {
        if (!this.contributionsById.has(id2)) {
          this.contributionsById.set(id2, contribution);
        } else {
          console.error(`IWorkbenchContributionsRegistry#registerWorkbenchContribution(): Can't register multiple contributions with same id '${id2}'`);
        }
        if (isOnEditorWorkbenchContributionInstantiation(instantiation)) {
          getOrSet(this.contributionsByEditor, instantiation.editorTypeId, []).push(contribution);
        }
      }
    }
  }
  registerWorkbenchContribution(ctor, phase) {
    this.registerWorkbenchContribution2(void 0, ctor, toWorkbenchPhase(phase));
  }
  getWorkbenchContribution(id2) {
    if (this.instancesById.has(id2)) {
      return this.instancesById.get(id2);
    }
    const instantiationService = this.instantiationService;
    const lifecycleService = this.lifecycleService;
    const logService = this.logService;
    const environmentService = this.environmentService;
    if (!instantiationService || !lifecycleService || !logService || !environmentService) {
      throw new Error(`IWorkbenchContributionsRegistry#getContribution('${id2}'): cannot be called before registry started`);
    }
    const contribution = this.contributionsById.get(id2);
    if (!contribution) {
      throw new Error(`IWorkbenchContributionsRegistry#getContribution('${id2}'): contribution with that identifier is unknown.`);
    }
    if (lifecycleService.phase < 3 /* Restored */) {
      logService.warn(`IWorkbenchContributionsRegistry#getContribution('${id2}'): contribution instantiated before LifecyclePhase.Restored!`);
    }
    this.safeCreateContribution(instantiationService, logService, environmentService, contribution, lifecycleService.phase);
    const instance2 = this.instancesById.get(id2);
    if (!instance2) {
      throw new Error(`IWorkbenchContributionsRegistry#getContribution('${id2}'): failed to create contribution.`);
    }
    return instance2;
  }
  start(accessor) {
    const instantiationService = this.instantiationService = accessor.get(IInstantiationService);
    const lifecycleService = this.lifecycleService = accessor.get(ILifecycleService);
    const logService = this.logService = accessor.get(ILogService);
    const environmentService = this.environmentService = accessor.get(IEnvironmentService);
    const editorPaneService = this.editorPaneService = accessor.get(IEditorPaneService);
    this._register(lifecycleService.onDidShutdown(() => {
      this.instanceDisposables.clear();
    }));
    for (const phase of [1 /* Starting */, 2 /* Ready */, 3 /* Restored */, 4 /* Eventually */]) {
      this.instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase);
    }
    for (const editorTypeId of this.contributionsByEditor.keys()) {
      if (editorPaneService.didInstantiateEditorPane(editorTypeId)) {
        this.onEditor(editorTypeId, instantiationService, lifecycleService, logService, environmentService);
      }
    }
    this._register(editorPaneService.onWillInstantiateEditorPane((e4) => this.onEditor(e4.typeId, instantiationService, lifecycleService, logService, environmentService)));
  }
  onEditor(editorTypeId, instantiationService, lifecycleService, logService, environmentService) {
    const contributions = this.contributionsByEditor.get(editorTypeId);
    if (contributions) {
      this.contributionsByEditor.delete(editorTypeId);
      for (const contribution of contributions) {
        this.safeCreateContribution(instantiationService, logService, environmentService, contribution, lifecycleService.phase);
      }
    }
  }
  instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase) {
    if (lifecycleService.phase >= phase) {
      this.doInstantiateByPhase(instantiationService, logService, environmentService, phase);
    } else {
      lifecycleService.when(phase).then(() => this.doInstantiateByPhase(instantiationService, logService, environmentService, phase));
    }
  }
  async doInstantiateByPhase(instantiationService, logService, environmentService, phase) {
    const contributions = this.contributionsByPhase.get(phase);
    if (contributions) {
      this.contributionsByPhase.delete(phase);
      switch (phase) {
        case 1 /* Starting */:
        case 2 /* Ready */: {
          mark(`code/willCreateWorkbenchContributions/${phase}`);
          for (const contribution of contributions) {
            this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
          }
          mark(`code/didCreateWorkbenchContributions/${phase}`);
          break;
        }
        case 3 /* Restored */:
        case 4 /* Eventually */: {
          if (phase === 4 /* Eventually */) {
            await this.pendingRestoredContributions.p;
          }
          this.doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase);
          break;
        }
      }
    }
  }
  doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase) {
    mark(`code/willCreateWorkbenchContributions/${phase}`);
    let i2 = 0;
    const forcedTimeout = phase === 4 /* Eventually */ ? 3e3 : 500;
    const instantiateSome = (idle) => {
      while (i2 < contributions.length) {
        const contribution = contributions[i2++];
        this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
        if (idle.timeRemaining() < 1) {
          runWhenGlobalIdle(instantiateSome, forcedTimeout);
          break;
        }
      }
      if (i2 === contributions.length) {
        mark(`code/didCreateWorkbenchContributions/${phase}`);
        if (phase === 3 /* Restored */) {
          this.pendingRestoredContributions.complete();
        }
      }
    };
    runWhenGlobalIdle(instantiateSome, forcedTimeout);
  }
  safeCreateContribution(instantiationService, logService, environmentService, contribution, phase) {
    if (typeof contribution.id === "string" && this.instancesById.has(contribution.id)) {
      return;
    }
    const now = Date.now();
    try {
      if (typeof contribution.id === "string") {
        mark(`code/willCreateWorkbenchContribution/${phase}/${contribution.id}`);
      }
      const instance2 = instantiationService.createInstance(contribution.ctor);
      if (typeof contribution.id === "string") {
        this.instancesById.set(contribution.id, instance2);
        this.contributionsById.delete(contribution.id);
      }
      if (isDisposable(instance2)) {
        this.instanceDisposables.add(instance2);
      }
    } catch (error) {
      logService.error(`Unable to create workbench contribution '${contribution.id ?? contribution.ctor.name}'.`, error);
    } finally {
      if (typeof contribution.id === "string") {
        mark(`code/didCreateWorkbenchContribution/${phase}/${contribution.id}`);
      }
    }
    if (typeof contribution.id === "string" || !environmentService.isBuilt) {
      const time = Date.now() - now;
      if (time > (phase < 3 /* Restored */ ? _WorkbenchContributionsRegistry.BLOCK_BEFORE_RESTORE_WARN_THRESHOLD : _WorkbenchContributionsRegistry.BLOCK_AFTER_RESTORE_WARN_THRESHOLD)) {
        logService.warn(`Creation of workbench contribution '${contribution.id ?? contribution.ctor.name}' took ${time}ms.`);
      }
      if (typeof contribution.id === "string") {
        let timingsForPhase = this.timingsByPhase.get(phase);
        if (!timingsForPhase) {
          timingsForPhase = [];
          this.timingsByPhase.set(phase, timingsForPhase);
        }
        timingsForPhase.push([contribution.id, time]);
      }
    }
  }
};

var registerWorkbenchContribution2 = WorkbenchContributionsRegistry.INSTANCE.registerWorkbenchContribution2.bind(WorkbenchContributionsRegistry.INSTANCE);

var getWorkbenchContribution = WorkbenchContributionsRegistry.INSTANCE.getWorkbenchContribution.bind(WorkbenchContributionsRegistry.INSTANCE);

Registry.add(Extensions10.Workbench, WorkbenchContributionsRegistry.INSTANCE);
export { isOnEditorWorkbenchContributionInstantiation, toWorkbenchPhase, toLifecyclePhase, Extensions10, WorkbenchPhase, WorkbenchContributionsRegistry, registerWorkbenchContribution2, getWorkbenchContribution };
