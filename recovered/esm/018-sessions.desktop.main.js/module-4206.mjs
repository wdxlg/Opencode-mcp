// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localHistory/electron-browser/localHistoryCommands.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { LOCAL_HISTORY_MENU_CONTEXT_KEY } from "./module-3373.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { Schemas } from "./module-0033.mjs";
import { IWorkingCopyHistoryService } from "./module-3371.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { findLocalHistoryEntry } from "./module-3374.mjs";


// src/vs/workbench/contrib/localHistory/electron-browser/localHistoryCommands.ts
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.revealInOS",
      title: isWindows ? localize2(16558, "Reveal in File Explorer") : isMacintosh ? localize2(16557, "Reveal in Finder") : localize2(16556, "Open Containing Folder"),
      menu: {
        id: MenuId.TimelineItemContext,
        group: "4_reveal",
        order: 1,
        when: ContextKeyExpr.and(LOCAL_HISTORY_MENU_CONTEXT_KEY, ResourceContextKey.Scheme.isEqualTo(Schemas.file))
      }
    });
  }
  async run(accessor, item) {
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const nativeHostService = accessor.get(INativeHostService);
    const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
    if (entry) {
      await nativeHostService.showItemInFolder(entry.location.with({ scheme: Schemas.file }).fsPath);
    }
  }
});
export {};
