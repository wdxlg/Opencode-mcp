// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/processExplorer/electron-browser/processExplorer.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { NativeProcessExplorerEditor } from "./module-4122.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ProcessExplorerEditorInput } from "./module-2966.mjs";


// src/vs/workbench/contrib/processExplorer/electron-browser/processExplorer.contribution.ts
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(NativeProcessExplorerEditor, NativeProcessExplorerEditor.ID, localize(18420, null)),
  [new SyncDescriptor(ProcessExplorerEditorInput)]
);
export {};
