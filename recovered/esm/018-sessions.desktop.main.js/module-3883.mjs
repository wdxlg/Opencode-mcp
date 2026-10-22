// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/actions/developerActions.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IsDevelopmentContext } from "./module-0635.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { URI } from "./module-0032.mjs";
import { IStatusbarService } from "./module-0895.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IProgressService } from "./module-0446.mjs";


// src/vs/workbench/electron-browser/actions/developerActions.ts
var ToggleDevToolsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleDevTools",
      title: localize2(22420, "Toggle Developer Tools"),
      category: Categories.Developer,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 50,
        when: IsDevelopmentContext,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KeyI */,
        mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 39 /* KeyI */ }
      },
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "5_tools",
        order: 1
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    return nativeHostService.toggleDevTools({ targetWindowId: getActiveWindow().vscodeWindowId });
  }
};

var ConfigureRuntimeArgumentsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.configureRuntimeArguments",
      title: localize2(22404, "Configure Runtime Arguments"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    await editorService.openEditor({
      resource: environmentService.argvResource,
      options: { pinned: true }
    });
  }
};

var ReloadWindowWithExtensionsDisabledAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.reloadWindowWithExtensionsDisabled",
      title: localize2(22405, "Reload with Extensions Disabled"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    return accessor.get(INativeHostService).reload({ disableExtensions: true });
  }
};

var OpenUserDataFolderAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.revealUserDataFolder",
      title: localize2(22406, "Reveal User Data Folder"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
    return nativeHostService.showItemInFolder(URI.file(environmentService.userDataPath).fsPath);
  }
};

var ShowGPUInfoAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.showGPUInfo",
      title: localize2(22408, "Show GPU Info"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    nativeHostService.openGPUInfoWindow();
  }
};

var ShowContentTracingAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.showContentTracing",
      title: localize2(22407, "Show Content Tracing"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    nativeHostService.openContentTracingWindow();
  }
};

var activeTracingEntry;

var tracingCategories = [
  "content",
  "renderer_host",
  "browser",
  "renderer",
  "blink",
  "blink.user_timing",
  "netlog",
  "net",
  "v8",
  "disabled-by-default-v8.cpu_profiler",
  "disabled-by-default-v8.compile",
  "disabled-by-default-v8.gc",
  "disabled-by-default-v8.gc_stats",
  "disabled-by-default-devtools.timeline",
  "disabled-by-default-network",
  "disabled-by-default-net"
];

async function startTracingSession(accessor, options3) {
  const nativeHostService = accessor.get(INativeHostService);
  const statusbarService = accessor.get(IStatusbarService);
  const categories = [...tracingCategories];
  if (options3.enableHeapProfiling) {
    categories.push("disabled-by-default-memory-infra");
  }
  await nativeHostService.startTracing(categories.join(","), { enableHeapProfiling: options3.enableHeapProfiling });
  activeTracingEntry?.dispose();
  activeTracingEntry = statusbarService.addEntry({
    name: localize(22412, null),
    text: "$(record) " + localize(22413, null),
    ariaLabel: localize(22411, null),
    tooltip: localize(22414, null),
    kind: "error",
    command: StopTracing.ID
  }, "status.tracing", 0 /* LEFT */, -Number.MAX_VALUE);
}

var StartTracing = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.startTracing",
      title: localize2(22410, "Start Tracing"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    await startTracingSession(accessor, { enableHeapProfiling: false });
  }
};

var StartHeapTracing = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.startHeapTracing",
      title: localize2(22409, "Start Heap Tracing"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    await startTracingSession(accessor, { enableHeapProfiling: true });
  }
};

var StopTracing = class _StopTracing extends Action2 {
  static {
    this.ID = "workbench.action.stopTracing";
  }
  constructor() {
    super({
      id: _StopTracing.ID,
      title: localize2(22415, "Stop Tracing"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
    const dialogService = accessor.get(IDialogService);
    const progressService = accessor.get(IProgressService);
    if (!activeTracingEntry && !environmentService.args.trace) {
      const { confirmed } = await dialogService.confirm({
        message: localize(22418, null),
        primaryButton: localize(22416, null)
      });
      if (confirmed) {
        return nativeHostService.relaunch({ addArgs: ["--trace"] });
      }
      return;
    }
    await progressService.withProgress({
      location: 20 /* Dialog */,
      title: localize(22419, null),
      cancellable: false,
      detail: localize(22417, null)
    }, () => nativeHostService.stopTracing());
    activeTracingEntry?.dispose();
    activeTracingEntry = void 0;
  }
};
export { startTracingSession, ToggleDevToolsAction, ConfigureRuntimeArgumentsAction, ReloadWindowWithExtensionsDisabledAction, OpenUserDataFolderAction, ShowGPUInfoAction, ShowContentTracingAction, activeTracingEntry, tracingCategories, StartTracing, StartHeapTracing, StopTracing };
