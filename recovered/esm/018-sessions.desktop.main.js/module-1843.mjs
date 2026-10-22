// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/performance/browser/performance.contribution.ts
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { PerfviewContrib, PerfviewInput } from "./module-1842.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { InstantiationService, Trace } from "./module-1839.mjs";
import { EventProfiling } from "./module-0017.mjs";
import { InputLatencyContrib } from "./module-1840.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { env } from "./module-0015.mjs";
import { GCBasedDisposableTracker, setDisposableTracker } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/contrib/performance/browser/performance.contribution.ts
registerWorkbenchContribution2(
  PerfviewContrib.ID,
  PerfviewContrib,
  { lazy: true }
);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  PerfviewInput.Id,
  class {
    canSerialize() {
      return true;
    }
    serialize() {
      return "";
    }
    deserialize(instantiationService) {
      return instantiationService.createInstance(PerfviewInput);
    }
  }
);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "perfview.show",
      title: localize2(18048, "Startup Performance"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const editorService = accessor.get(IEditorService);
    const contrib = PerfviewContrib.get();
    return editorService.openEditor(contrib.getEditorInput(), { pinned: true });
  }
});

registerAction2(class PrintServiceCycles extends Action2 {
  constructor() {
    super({
      id: "perf.insta.printAsyncCycles",
      title: localize2(18044, "Print Service Cycles"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const instaService = accessor.get(IInstantiationService);
    if (instaService instanceof InstantiationService) {
      const cycle = instaService._globalGraph?.findCycleSlow();
      if (cycle) {
        console.warn(`CYCLE`, cycle);
      } else {
        console.warn(`YEAH, no more cycles`);
      }
    }
  }
});

registerAction2(class PrintServiceTraces extends Action2 {
  constructor() {
    super({
      id: "perf.insta.printTraces",
      title: localize2(18046, "Print Service Traces"),
      category: Categories.Developer,
      f1: true
    });
  }
  run() {
    if (Trace.all.size === 0) {
      console.log("Enable via `instantiationService.ts#_enableAllTracing`");
      return;
    }
    for (const item of Trace.all) {
      console.log(item);
    }
  }
});

registerAction2(class PrintEventProfiling extends Action2 {
  constructor() {
    super({
      id: "perf.event.profiling",
      title: localize2(18045, "Print Emitter Profiles"),
      category: Categories.Developer,
      f1: true
    });
  }
  run() {
    if (EventProfiling.all.size === 0) {
      console.log("USE `EmitterOptions._profName` to enable profiling");
      return;
    }
    for (const item of EventProfiling.all) {
      console.log(`${item.name}: ${item.invocationCount} invocations COST ${item.elapsedOverall}ms, ${item.listenerCount} listeners, avg cost is ${item.durations.reduce((a, b) => a + b, 0) / item.durations.length}ms`);
    }
  }
});

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(
  InputLatencyContrib,
  4 /* Eventually */
);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "performance",
  order: 101,
  title: localize(18047, null),
  type: "object",
  properties: {
    "telemetry.performance.inputLatencySamplingProbability": {
      type: "number",
      default: 0,
      minimum: 0,
      maximum: 1,
      tags: ["experimental"],
      markdownDescription: localize(18049, null),
      experiment: {
        mode: "auto"
      }
    }
  }
});

var DisposableTracking = class {
  static {
    this.Id = "perf.disposableTracking";
  }
  constructor(envService) {
    if (!envService.isBuilt && !envService.extensionTestsLocationURI && !env["VSCODE_DEV_DISABLE_DISPOSABLE_TRACKING"]) {
      setDisposableTracker(new GCBasedDisposableTracker());
    }
  }
};

DisposableTracking = __decorateClass([
  __decorateParam(0, IEnvironmentService)
], DisposableTracking);

registerWorkbenchContribution2(DisposableTracking.Id, DisposableTracking, WorkbenchPhase.Eventually);
export { DisposableTracking };
