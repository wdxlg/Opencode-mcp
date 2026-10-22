// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibilitySignals/browser/accessibilitySignal.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { AccessibilitySignalService, IAccessibilitySignalService } from "./module-0445.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { wrapInReloadableClass0 } from "./module-0833.mjs";
import { EditorTextPropertySignalsContribution } from "./module-3388.mjs";
import { AccessibilitySignalLineDebuggerContribution } from "./module-3386.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { ShowAccessibilityAnnouncementHelp, ShowSignalSoundHelp } from "./module-3387.mjs";


// src/vs/workbench/contrib/accessibilitySignals/browser/accessibilitySignal.contribution.ts
registerSingleton(IAccessibilitySignalService, AccessibilitySignalService, 1 /* Delayed */);

registerWorkbenchContribution2("EditorTextPropertySignalsContribution", wrapInReloadableClass0(() => EditorTextPropertySignalsContribution), WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2("AccessibilitySignalLineDebuggerContribution", AccessibilitySignalLineDebuggerContribution, WorkbenchPhase.AfterRestored);

registerAction2(ShowSignalSoundHelp);

registerAction2(ShowAccessibilityAnnouncementHelp);
export {};
