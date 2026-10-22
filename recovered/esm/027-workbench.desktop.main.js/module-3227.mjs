// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/mergeEditor.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { MergeEditor, MergeEditorOpenHandlerContribution, MergeEditorResolverContribution } from "./module-3222.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { MergeEditorInput } from "./module-1144.mjs";
import { MergeEditorSerializer } from "./module-3225.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { AcceptAllCombination, AcceptAllInput1, AcceptAllInput2, AcceptMerge, CompareInput1WithBaseCommand, CompareInput2WithBaseCommand, GoToNextUnhandledConflict, GoToPreviousUnhandledConflict, OpenBaseFile, OpenMergeEditor, OpenResultResource, ResetCloseWithConflictsChoice, ResetToBaseAndAutoMergeCommand, SetColumnLayout, SetMixedLayout, ShowHideBase, ShowHideCenterBase, ShowHideTopBase, ShowNonConflictingChanges, ToggleActiveConflictInput1, ToggleActiveConflictInput2, ToggleBetweenInputs } from "./module-3223.mjs";
import { MergeEditorCopyContentsToJSON, MergeEditorLoadContentsFromFolder, MergeEditorSaveContentsToFolder } from "./module-3224.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { MergeEditorAccessibilityHelpProvider } from "./module-3226.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/mergeEditor.contribution.ts
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    MergeEditor,
    MergeEditor.ID,
    localize(17249, null)
  ),
  [
    new SyncDescriptor(MergeEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  MergeEditorInput.ID,
  MergeEditorSerializer
);

Registry.as(Extensions4.Configuration).registerConfiguration({
  properties: {
    "mergeEditor.diffAlgorithm": {
      type: "string",
      enum: ["legacy", "advanced", "advanced-external", "advanced-wasm"],
      default: "advanced",
      markdownEnumDescriptions: [
        localize(17248, null),
        localize(17245, null),
        localize(17246, null),
        localize(17247, null)
      ]
    },
    "mergeEditor.showDeletionMarkers": {
      type: "boolean",
      default: true,
      description: "Controls if deletions in base or one of the inputs should be indicated by a vertical bar."
    }
  }
});

registerAction2(OpenResultResource);

registerAction2(SetMixedLayout);

registerAction2(SetColumnLayout);

registerAction2(OpenMergeEditor);

registerAction2(OpenBaseFile);

registerAction2(ShowNonConflictingChanges);

registerAction2(ShowHideBase);

registerAction2(ShowHideTopBase);

registerAction2(ShowHideCenterBase);

registerAction2(GoToNextUnhandledConflict);

registerAction2(GoToPreviousUnhandledConflict);

registerAction2(ToggleActiveConflictInput1);

registerAction2(ToggleActiveConflictInput2);

registerAction2(CompareInput1WithBaseCommand);

registerAction2(CompareInput2WithBaseCommand);

registerAction2(AcceptAllInput1);

registerAction2(AcceptAllInput2);

registerAction2(ResetToBaseAndAutoMergeCommand);

registerAction2(AcceptMerge);

registerAction2(ResetCloseWithConflictsChoice);

registerAction2(AcceptAllCombination);

registerAction2(ToggleBetweenInputs);

registerAction2(MergeEditorCopyContentsToJSON);

registerAction2(MergeEditorSaveContentsToFolder);

registerAction2(MergeEditorLoadContentsFromFolder);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(MergeEditorOpenHandlerContribution, 3 /* Restored */);

registerWorkbenchContribution2(
  MergeEditorResolverContribution.ID,
  MergeEditorResolverContribution,
  WorkbenchPhase.BlockStartup
  /* only registers an editor resolver */
);

AccessibleViewRegistry.register(new MergeEditorAccessibilityHelpProvider());
export {};
