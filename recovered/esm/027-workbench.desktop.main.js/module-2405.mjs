// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugSessionPicker.ts
import { IQuickInputService } from "./module-0536.mjs";
import { IDebugService, REPL_VIEW_ID } from "./module-1057.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ICommandService } from "./module-0087.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { matchesFuzzy } from "./module-0453.mjs";


// src/vs/workbench/contrib/debug/browser/debugSessionPicker.ts
async function showDebugSessionMenu(accessor, selectAndStartID) {
  const quickInputService = accessor.get(IQuickInputService);
  const debugService = accessor.get(IDebugService);
  const viewsService = accessor.get(IViewsService);
  const commandService = accessor.get(ICommandService);
  const localDisposableStore = new DisposableStore();
  const quickPick = quickInputService.createQuickPick({ useSeparators: true });
  localDisposableStore.add(quickPick);
  quickPick.matchOnLabel = quickPick.matchOnDescription = quickPick.matchOnDetail = quickPick.sortByLabel = false;
  quickPick.placeholder = localize(14564, null);
  const pickItems = _getPicksAndActiveItem(quickPick.value, selectAndStartID, debugService, viewsService, commandService);
  quickPick.items = pickItems.picks;
  quickPick.activeItems = pickItems.activeItems;
  localDisposableStore.add(quickPick.onDidChangeValue(async () => {
    quickPick.items = _getPicksAndActiveItem(quickPick.value, selectAndStartID, debugService, viewsService, commandService).picks;
  }));
  localDisposableStore.add(quickPick.onDidAccept(() => {
    const selectedItem = quickPick.selectedItems[0];
    selectedItem.accept();
    quickPick.hide();
    localDisposableStore.dispose();
  }));
  quickPick.show();
}

function _getPicksAndActiveItem(filter2, selectAndStartID, debugService, viewsService, commandService) {
  const debugConsolePicks = [];
  const headerSessions = [];
  const currSession = debugService.getViewModel().focusedSession;
  const sessions = debugService.getModel().getSessions(false);
  const activeItems = [];
  sessions.forEach((session) => {
    if (session.compact && session.parentSession) {
      headerSessions.push(session.parentSession);
    }
  });
  sessions.forEach((session) => {
    const isHeader = headerSessions.includes(session);
    if (!session.parentSession) {
      debugConsolePicks.push({ type: "separator", label: isHeader ? session.name : void 0 });
    }
    if (!isHeader) {
      const pick = _createPick2(session, filter2, debugService, viewsService, commandService);
      if (pick) {
        debugConsolePicks.push(pick);
        if (session.getId() === currSession?.getId()) {
          activeItems.push(pick);
        }
      }
    }
  });
  if (debugConsolePicks.length) {
    debugConsolePicks.push({ type: "separator" });
  }
  const createDebugSessionLabel = localize(14566, null);
  debugConsolePicks.push({
    label: `$(plus) ${createDebugSessionLabel}`,
    ariaLabel: createDebugSessionLabel,
    accept: () => commandService.executeCommand(selectAndStartID)
  });
  return { picks: debugConsolePicks, activeItems };
}

function _getSessionInfo(session) {
  const label3 = !session.configuration.name.length ? session.name : session.configuration.name;
  const parentName = session.compact ? void 0 : session.parentSession?.configuration.name;
  let description = "";
  let ariaLabel = "";
  if (parentName) {
    ariaLabel = localize(14565, null, label3, parentName);
    description = parentName;
  }
  return { label: label3, description, ariaLabel };
}

function _createPick2(session, filter2, debugService, viewsService, commandService) {
  const pickInfo = _getSessionInfo(session);
  const highlights = matchesFuzzy(filter2, pickInfo.label, true);
  if (highlights) {
    return {
      label: pickInfo.label,
      description: pickInfo.description,
      ariaLabel: pickInfo.ariaLabel,
      highlights: { label: highlights },
      accept: () => {
        debugService.focusStackFrame(void 0, void 0, session, { explicit: true });
        if (!viewsService.isViewVisible(REPL_VIEW_ID)) {
          viewsService.openView(REPL_VIEW_ID, true);
        }
      }
    };
  }
  return void 0;
}
export { showDebugSessionMenu, _getPicksAndActiveItem, _getSessionInfo, _createPick2 };
