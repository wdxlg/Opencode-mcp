// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/lifecycle/common/lifecycle.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/services/lifecycle/common/lifecycle.ts
var ILifecycleService = createDecorator("lifecycleService");

function StartupKindToString(startupKind) {
  switch (startupKind) {
    case 1 /* NewWindow */:
      return "NewWindow";
    case 3 /* ReloadedWindow */:
      return "ReloadedWindow";
    case 4 /* ReopenedWindow */:
      return "ReopenedWindow";
  }
}

function LifecyclePhaseToString(phase) {
  switch (phase) {
    case 1 /* Starting */:
      return "Starting";
    case 2 /* Ready */:
      return "Ready";
    case 3 /* Restored */:
      return "Restored";
    case 4 /* Eventually */:
      return "Eventually";
  }
}
export { StartupKindToString, LifecyclePhaseToString, ILifecycleService };
