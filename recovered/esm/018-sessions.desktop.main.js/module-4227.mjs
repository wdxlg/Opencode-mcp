// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/electron-browser/sessions.desktop.contribution.ts
import { registerAction2 } from "./module-0092.mjs";
import { OpenInVSCodeWidgetContribution, OpenSessionInVSCodeAction, OpenVSCodeWindowAction, ReturnToVSCodeEditorAction, ShouldShowReturnToVSCodeEditorAction } from "./module-4226.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/electron-browser/sessions.desktop.contribution.ts
(function registerActions2() {
  registerAction2(OpenSessionInVSCodeAction);
  registerAction2(OpenVSCodeWindowAction);
  registerAction2(ReturnToVSCodeEditorAction);
  registerAction2(ShouldShowReturnToVSCodeEditorAction);
})();

(function registerWorkbenchContributions() {
  registerWorkbenchContribution2(OpenInVSCodeWidgetContribution.ID, OpenInVSCodeWidgetContribution, WorkbenchPhase.BlockRestore);
})();
export {};
