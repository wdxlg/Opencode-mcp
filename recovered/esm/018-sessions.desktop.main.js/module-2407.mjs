// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted.ts
import { Disposable } from "./module-0012.mjs";
import { HAS_OPENED_NOTEBOOK } from "./module-1844.mjs";
import { Memento } from "./module-1042.mjs";
import { NotebookSetting } from "./module-0911.mjs";
import { NotebookEditorInput } from "./module-0940.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted.ts
var hasOpenedNotebookKey = "hasOpenedNotebook";

var hasShownGettingStartedKey = "hasShownNotebookGettingStarted";

var NotebookGettingStarted = class extends Disposable {
  constructor(_editorService, _storageService, _contextKeyService, _commandService, _configurationService) {
    super();
    const hasOpenedNotebook = HAS_OPENED_NOTEBOOK.bindTo(_contextKeyService);
    const memento = new Memento("notebookGettingStarted2", _storageService);
    const storedValue = memento.getMemento(0 /* PROFILE */, 0 /* USER */);
    if (storedValue[hasOpenedNotebookKey]) {
      hasOpenedNotebook.set(true);
    }
    const needToShowGettingStarted = _configurationService.getValue(NotebookSetting.openGettingStarted) && !storedValue[hasShownGettingStartedKey];
    if (!storedValue[hasOpenedNotebookKey] || needToShowGettingStarted) {
      const onDidOpenNotebook = () => {
        hasOpenedNotebook.set(true);
        storedValue[hasOpenedNotebookKey] = true;
        if (needToShowGettingStarted) {
          _commandService.executeCommand("workbench.action.openWalkthrough", { category: "notebooks", step: "notebookProfile" }, true);
          storedValue[hasShownGettingStartedKey] = true;
        }
        memento.saveMemento();
      };
      if (_editorService.activeEditor?.typeId === NotebookEditorInput.ID) {
        onDidOpenNotebook();
        return;
      }
      const listener = this._register(_editorService.onDidActiveEditorChange(() => {
        if (_editorService.activeEditor?.typeId === NotebookEditorInput.ID) {
          listener.dispose();
          onDidOpenNotebook();
        }
      }));
    }
  }
};

NotebookGettingStarted = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IConfigurationService)
], NotebookGettingStarted);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(NotebookGettingStarted, 3 /* Restored */);

registerAction2(class NotebookClearNotebookLayoutAction extends Action2 {
  constructor() {
    super({
      id: "workbench.notebook.layout.gettingStarted",
      title: localize2(17462, "Reset notebook getting started"),
      f1: true,
      precondition: ContextKeyExpr.equals(`config.${NotebookSetting.openGettingStarted}`, true),
      category: Categories.Developer
    });
  }
  run(accessor) {
    const storageService = accessor.get(IStorageService);
    const memento = new Memento("notebookGettingStarted", storageService);
    const storedValue = memento.getMemento(0 /* PROFILE */, 0 /* USER */);
    storedValue[hasOpenedNotebookKey] = void 0;
    memento.saveMemento();
  }
});
export { hasOpenedNotebookKey, hasShownGettingStartedKey, NotebookGettingStarted };
