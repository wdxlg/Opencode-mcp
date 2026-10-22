// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/editor/browser/emptyFileEditor.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { EmptyFileEditor } from "./module-3768.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { EmptyFileEditorInput, EmptyFileEditorSerializer } from "./module-3767.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/editor/browser/emptyFileEditor.contribution.ts
var SinglePaneEmptyFileEditorContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessions.singlePaneEmptyFileEditor";
  }
  constructor(layoutService) {
    super();
    if (!layoutService.isSinglePaneLayoutEnabled) {
      return;
    }
    this._register(Registry.as(EditorExtensions.EditorPane).registerEditorPane(
      EditorPaneDescriptor.create(
        EmptyFileEditor,
        EmptyFileEditor.ID,
        localize(4775, null)
      ),
      [new SyncDescriptor(EmptyFileEditorInput)]
    ));
    this._register(Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
      EmptyFileEditorInput.ID,
      EmptyFileEditorSerializer
    ));
  }
};

SinglePaneEmptyFileEditorContribution = __decorateClass([
  __decorateParam(0, IAgentWorkbenchLayoutService)
], SinglePaneEmptyFileEditorContribution);

registerWorkbenchContribution2(SinglePaneEmptyFileEditorContribution.ID, SinglePaneEmptyFileEditorContribution, WorkbenchPhase.BlockStartup);
export { SinglePaneEmptyFileEditorContribution };
