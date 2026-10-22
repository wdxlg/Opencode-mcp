// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatNotebook.ts
import { DisposableStore } from "./module-0012.mjs";
import { CellUri } from "./module-0909.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { InlineChatController } from "./module-2397.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInlineChatSessionService } from "./module-1899.mjs";
import { INotebookEditorService } from "./module-1386.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatNotebook.ts
var InlineChatNotebookContribution = class {
  #store = new DisposableStore();
  constructor(sessionService, notebookEditorService) {
    this.#store.add(sessionService.onWillStartSession((newSessionEditor) => {
      const candidate = CellUri.parse(newSessionEditor.getModel().uri);
      if (!candidate) {
        return;
      }
      for (const notebookEditor of notebookEditorService.listNotebookEditors()) {
        if (isEqual2(notebookEditor.textModel?.uri, candidate.notebook)) {
          let found = false;
          const editors = [];
          for (const [, codeEditor] of notebookEditor.codeEditors) {
            editors.push(codeEditor);
            found = codeEditor === newSessionEditor || found;
          }
          if (found) {
            for (const editor of editors) {
              if (editor !== newSessionEditor) {
                InlineChatController.get(editor)?.acceptSession();
              }
            }
            break;
          }
        }
      }
    }));
  }
  dispose() {
    this.#store.dispose();
  }
};

InlineChatNotebookContribution = __decorateClass([
  __decorateParam(0, IInlineChatSessionService),
  __decorateParam(1, INotebookEditorService)
], InlineChatNotebookContribution);
export { InlineChatNotebookContribution };
