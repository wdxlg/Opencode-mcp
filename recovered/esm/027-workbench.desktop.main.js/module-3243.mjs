// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webviewPanel/browser/webviewPanel.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { WebviewEditor } from "./module-1119.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { WebviewInput } from "./module-1116.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { WebviewEditorInputSerializer } from "./module-3242.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IWebviewWorkbenchService, WebviewEditorService } from "./module-1120.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { HideWebViewEditorFindCommand, ReloadWebviewAction, ShowWebViewEditorFindWidgetAction, WebViewEditorFindNextCommand, WebViewEditorFindPreviousCommand } from "./module-3241.mjs";


// src/vs/workbench/contrib/webviewPanel/browser/webviewPanel.contribution.ts
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    WebviewEditor,
    WebviewEditor.ID,
    localize(21866, null)
  ),
  [new SyncDescriptor(WebviewInput)]
);

var WebviewPanelContribution = class extends Disposable {
  constructor(editorService, editorGroupService) {
    super();
    this.editorGroupService = editorGroupService;
    this._register(editorService.onWillOpenEditor((e) => {
      const group2 = editorGroupService.getGroup(e.groupId);
      if (group2) {
        this.onEditorOpening(e.editor, group2);
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.webviewPanel";
  }
  onEditorOpening(editor, group2) {
    if (!(editor instanceof WebviewInput) || editor.typeId !== WebviewInput.typeId) {
      return;
    }
    if (group2.contains(editor)) {
      return;
    }
    let previousGroup;
    const groups = this.editorGroupService.groups;
    for (const group3 of groups) {
      if (group3.contains(editor)) {
        previousGroup = group3;
        break;
      }
    }
    if (!previousGroup) {
      return;
    }
    previousGroup.closeEditor(editor);
  }
};

WebviewPanelContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService)
], WebviewPanelContribution);

registerWorkbenchContribution2(WebviewPanelContribution.ID, WebviewPanelContribution, WorkbenchPhase.BlockStartup);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  WebviewEditorInputSerializer.ID,
  WebviewEditorInputSerializer
);

registerSingleton(IWebviewWorkbenchService, WebviewEditorService, 1 /* Delayed */);

registerAction2(ShowWebViewEditorFindWidgetAction);

registerAction2(HideWebViewEditorFindCommand);

registerAction2(WebViewEditorFindNextCommand);

registerAction2(WebViewEditorFindPreviousCommand);

registerAction2(ReloadWebviewAction);
export { WebviewPanelContribution };
