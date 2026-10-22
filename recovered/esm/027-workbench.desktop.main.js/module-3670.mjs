// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/accessibility.contribution.ts
import { DynamicSpeechAccessibilityConfiguration, registerAccessibilityConfiguration } from "./module-1370.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { AccessibleViewService } from "./module-3667.mjs";
import { AccessibleViewInformationService, IAccessibleViewInformationService } from "./module-1540.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { EditorAccessibilityHelpContribution } from "./module-3503.mjs";
import { UnfocusedViewDimmingContribution } from "./module-3661.mjs";
import { AccesibleViewContributions, AccesibleViewHelpContribution } from "./module-3668.mjs";
import { AccessibilityStatus } from "./module-3662.mjs";
import { ExtensionAccessibilityHelpDialogContribution } from "./module-3669.mjs";
import { SaveAccessibilitySignalContribution } from "./module-3663.mjs";
import { SpeechAccessibilitySignalContribution } from "./module-3665.mjs";
import { DiffEditorActiveAnnouncementContribution } from "./module-3664.mjs";


// src/vs/workbench/contrib/accessibility/browser/accessibility.contribution.ts
registerAccessibilityConfiguration();

registerSingleton(IAccessibleViewService, AccessibleViewService, 1 /* Delayed */);

registerSingleton(IAccessibleViewInformationService, AccessibleViewInformationService, 1 /* Delayed */);

var workbenchRegistry8 = Registry.as(Extensions10.Workbench);

workbenchRegistry8.registerWorkbenchContribution(EditorAccessibilityHelpContribution, 4 /* Eventually */);

workbenchRegistry8.registerWorkbenchContribution(UnfocusedViewDimmingContribution, 3 /* Restored */);

workbenchRegistry8.registerWorkbenchContribution(AccesibleViewHelpContribution, 4 /* Eventually */);

workbenchRegistry8.registerWorkbenchContribution(AccesibleViewContributions, 4 /* Eventually */);

registerWorkbenchContribution2(AccessibilityStatus.ID, AccessibilityStatus, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ExtensionAccessibilityHelpDialogContribution.ID, ExtensionAccessibilityHelpDialogContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(SaveAccessibilitySignalContribution.ID, SaveAccessibilitySignalContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(SpeechAccessibilitySignalContribution.ID, SpeechAccessibilitySignalContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(DiffEditorActiveAnnouncementContribution.ID, DiffEditorActiveAnnouncementContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(DynamicSpeechAccessibilityConfiguration.ID, DynamicSpeechAccessibilityConfiguration, WorkbenchPhase.AfterRestored);
export { workbenchRegistry8 };
