// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/loadedScriptsPicker.ts
import { IQuickInputService } from "./module-0536.mjs";
import { IDebugService } from "./module-1058.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILabelService } from "./module-0641.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { dirname2 } from "./module-0034.mjs";
import { matchesFuzzy } from "./module-0453.mjs";
import { getIconClasses } from "./module-0755.mjs";


// src/vs/workbench/contrib/debug/common/loadedScriptsPicker.ts
async function showLoadedScriptMenu(accessor) {
  const quickInputService = accessor.get(IQuickInputService);
  const debugService = accessor.get(IDebugService);
  const editorService = accessor.get(IEditorService);
  const sessions = debugService.getModel().getSessions(false);
  const modelService = accessor.get(IModelService);
  const languageService = accessor.get(ILanguageService);
  const labelService = accessor.get(ILabelService);
  const localDisposableStore = new DisposableStore();
  const quickPick = quickInputService.createQuickPick({ useSeparators: true });
  localDisposableStore.add(quickPick);
  quickPick.matchOnLabel = quickPick.matchOnDescription = quickPick.matchOnDetail = quickPick.sortByLabel = false;
  quickPick.placeholder = localize(14865, null);
  quickPick.items = await _getPicks(quickPick.value, sessions, editorService, modelService, languageService, labelService);
  localDisposableStore.add(quickPick.onDidChangeValue(async () => {
    quickPick.items = await _getPicks(quickPick.value, sessions, editorService, modelService, languageService, labelService);
  }));
  localDisposableStore.add(quickPick.onDidAccept(() => {
    const selectedItem = quickPick.selectedItems[0];
    selectedItem.accept();
    quickPick.hide();
  }));
  localDisposableStore.add(quickPick.onDidHide(() => localDisposableStore.dispose()));
  quickPick.show();
}

async function _getPicksFromSession(session, filter2, editorService, modelService, languageService, labelService) {
  const items = [];
  items.push({ type: "separator", label: session.name });
  const sources = await session.getLoadedSources();
  sources.forEach((element) => {
    const pick = _createPick(element, filter2, editorService, modelService, languageService, labelService);
    if (pick) {
      items.push(pick);
    }
  });
  return items;
}

async function _getPicks(filter2, sessions, editorService, modelService, languageService, labelService) {
  const loadedScriptPicks = [];
  const picks = await Promise.all(
    sessions.map((session) => _getPicksFromSession(session, filter2, editorService, modelService, languageService, labelService))
  );
  for (const row of picks) {
    for (const elem of row) {
      loadedScriptPicks.push(elem);
    }
  }
  return loadedScriptPicks;
}

function _createPick(source, filter2, editorService, modelService, languageService, labelService) {
  const label3 = labelService.getUriBasenameLabel(source.uri);
  const desc = labelService.getUriLabel(dirname2(source.uri));
  const labelHighlights = matchesFuzzy(filter2, label3, true);
  const descHighlights = matchesFuzzy(filter2, desc, true);
  if (labelHighlights || descHighlights) {
    return {
      label: label3,
      description: desc === "." ? void 0 : desc,
      highlights: { label: labelHighlights ?? void 0, description: descHighlights ?? void 0 },
      iconClasses: getIconClasses(modelService, languageService, source.uri),
      accept: () => {
        if (source.available) {
          source.openInEditor(editorService, { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 });
        }
      }
    };
  }
  return void 0;
}
export { showLoadedScriptMenu, _getPicksFromSession, _getPicks, _createPick };
