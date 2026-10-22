// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditor.contribution.ts
import { registerAction2 } from "./module-0092.mjs";
import { CollapseAllAction2, ExpandAllAction2, GoToFileAction2, GoToNextChangeAction, GoToPreviousChangeAction, OpenMultiDiffEditorLayoutDebugAction } from "./module-2993.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IMultiDiffSourceResolverService, MultiDiffSourceResolverService } from "./module-1148.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { MultiDiffEditorInput, MultiDiffEditorResolverContribution, MultiDiffEditorSerializer } from "./module-1149.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { MultiDiffEditor } from "./module-2681.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { OpenScmGroupAction, ScmMultiDiffSourceResolverContribution } from "./module-1465.mjs";


// src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditor.contribution.ts
registerAction2(GoToFileAction2);

registerAction2(GoToNextChangeAction);

registerAction2(GoToPreviousChangeAction);

registerAction2(CollapseAllAction2);

registerAction2(ExpandAllAction2);

registerAction2(OpenMultiDiffEditorLayoutDebugAction);

registerSingleton(IMultiDiffSourceResolverService, MultiDiffSourceResolverService, 1 /* Delayed */);

registerWorkbenchContribution2(
  MultiDiffEditorResolverContribution.ID,
  MultiDiffEditorResolverContribution,
  WorkbenchPhase.BlockStartup
  /* only registering an editor resolver */
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(MultiDiffEditor, MultiDiffEditor.ID, localize(17377, null)),
  [new SyncDescriptor(MultiDiffEditorInput)]
);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(MultiDiffEditorInput.ID, MultiDiffEditorSerializer);

registerAction2(OpenScmGroupAction);

registerWorkbenchContribution2(
  ScmMultiDiffSourceResolverContribution.ID,
  ScmMultiDiffSourceResolverContribution,
  WorkbenchPhase.BlockStartup
  /* only registering an editor resolver  */
);
export {};
