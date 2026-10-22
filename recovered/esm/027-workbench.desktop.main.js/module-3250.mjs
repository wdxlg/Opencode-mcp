// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/customEditor/browser/customEditor.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ICustomEditorService } from "./module-1114.mjs";
import { CustomEditorService } from "./module-3249.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { WebviewEditor } from "./module-1119.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { CustomEditorInput } from "./module-1126.mjs";
import { CustomEditorDiffInput, CustomEditorSideBySideDiffInput } from "./module-1302.mjs";
import { ComplexCustomWorkingCopyEditorHandler, CustomEditorDiffInputSerializer, CustomEditorInputSerializer, CustomEditorSideBySideDiffInputSerializer } from "./module-3245.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/customEditor/browser/customEditor.contribution.ts
registerSingleton(ICustomEditorService, CustomEditorService, 1 /* Delayed */);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    WebviewEditor,
    WebviewEditor.ID,
    "Webview Editor"
  ),
  [
    new SyncDescriptor(CustomEditorInput),
    new SyncDescriptor(CustomEditorDiffInput),
    new SyncDescriptor(CustomEditorSideBySideDiffInput)
  ]
);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(CustomEditorInputSerializer.ID, CustomEditorInputSerializer);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(CustomEditorDiffInputSerializer.ID, CustomEditorDiffInputSerializer);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(CustomEditorSideBySideDiffInputSerializer.ID, CustomEditorSideBySideDiffInputSerializer);

registerWorkbenchContribution2(ComplexCustomWorkingCopyEditorHandler.ID, ComplexCustomWorkingCopyEditorHandler, WorkbenchPhase.BlockStartup);
export {};
