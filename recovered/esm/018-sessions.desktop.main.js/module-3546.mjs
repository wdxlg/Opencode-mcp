// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newSessionFolderQuickPickAction.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsRecentWorkspacesService } from "./module-3545.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileDialogService } from "./module-0267.mjs";


// src/vs/sessions/contrib/chat/browser/newSessionFolderQuickPickAction.ts
function buildFolderQuickPickItems(recentWorkspacesService, labelService) {
  const recents = recentWorkspacesService.getRecentWorkspaces();
  const items = [];
  if (recents.length > 0) {
    items.push({ type: "separator", label: localize(4492, null) });
    for (const { workspace, providerId } of recents) {
      const folderUri = workspace.folders[0]?.root;
      if (!folderUri) {
        continue;
      }
      items.push({
        folderUri,
        providerId,
        label: `$(${workspace.icon.id}) ${workspace.label}`,
        description: labelService.getUriLabel(folderUri, { relative: false })
      });
    }
    items.push({ type: "separator", label: "" });
  }
  items.push({
    label: `$(${Codicon.folderOpened.id}) ${localize(4489, null)}`,
    browse: true
  });
  return items;
}

var NewSessionPickFolderQuickPickAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.sessions.newSession.pickFolderQuickPick",
      title: localize2(4490, "New Session in Folder..."),
      category: CHAT_CATEGORY,
      f1: true,
      keybinding: {
        // Wins over the desktop Open File/Folder actions' Cmd+O when both match.
        weight: 250 /* SessionsContrib */,
        when: IsSessionsWindowContext,
        primary: 2048 /* CtrlCmd */ | 45 /* KeyO */
      }
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const sessionsService = accessor.get(ISessionsService);
    const recentWorkspacesService = accessor.get(ISessionsRecentWorkspacesService);
    const labelService = accessor.get(ILabelService);
    const fileDialogService = accessor.get(IFileDialogService);
    const items = buildFolderQuickPickItems(recentWorkspacesService, labelService);
    const picked = await quickInputService.pick(items, {
      placeHolder: localize(4491, null),
      matchOnDescription: true
    });
    if (!picked) {
      return;
    }
    let folderUri = picked.folderUri;
    let providerId = picked.providerId;
    if (picked.browse) {
      const result = await fileDialogService.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false
      });
      folderUri = result?.[0];
      providerId = void 0;
    }
    if (!folderUri) {
      return;
    }
    await sessionsService.openNewSession({ folderUri, providerId });
  }
};

registerAction2(NewSessionPickFolderQuickPickAction);
export { buildFolderQuickPickItems, NewSessionPickFolderQuickPickAction };
