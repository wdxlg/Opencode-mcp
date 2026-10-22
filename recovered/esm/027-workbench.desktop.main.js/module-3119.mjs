// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchActionsTextQuickAccess.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { category2 } from "./module-2836.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { TEXT_SEARCH_QUICK_ACCESS_PREFIX } from "./module-3118.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { getSelectionTextFromEditor } from "./module-2858.mjs";


// src/vs/workbench/contrib/search/browser/searchActionsTextQuickAccess.ts
registerAction2(class TextSearchQuickAccessAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.quickTextSearch" /* QuickTextSearchActionId */,
      title: localize2(19133, "Quick Search"),
      category: category2,
      f1: true
    });
  }
  async run(accessor, match2) {
    const quickInputService = accessor.get(IQuickInputService);
    const searchText = getSearchText(accessor) ?? "";
    quickInputService.quickAccess.show(TEXT_SEARCH_QUICK_ACCESS_PREFIX + searchText, { preserveValue: !!searchText });
  }
});

function getSearchText(accessor) {
  const editorService = accessor.get(IEditorService);
  const configurationService = accessor.get(IConfigurationService);
  const activeEditor = editorService.activeTextEditorControl;
  if (!activeEditor) {
    return null;
  }
  if (!activeEditor.hasTextFocus()) {
    return null;
  }
  const seedSearchStringFromSelection = configurationService.getValue("editor.find.seedSearchStringFromSelection");
  if (!seedSearchStringFromSelection) {
    return null;
  }
  return getSelectionTextFromEditor(false, activeEditor);
}
export { getSearchText };
