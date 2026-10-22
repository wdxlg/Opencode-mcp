// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/search/browser/search.contribution.ts
import { KeybindingsRegistry } from "./module-0091.mjs";
import { OpenEditorCommandId } from "./module-2808.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { SESSIONS_FILES_VIEW_ID } from "./module-2951.mjs";
import { ExplorerFolderContext } from "./module-1534.mjs";
import { IExplorerService } from "./module-1997.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ICommandService } from "./module-0087.mjs";
import { dirname2 } from "./module-0034.mjs";
import { resolveResourcesForSearchIncludes } from "./module-1311.mjs";


// src/vs/sessions/contrib/search/browser/search.contribution.ts
KeybindingsRegistry.registerKeybindingRule({
  id: OpenEditorCommandId,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KeyF */,
  weight: 200 /* WorkbenchContrib */
});

MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
  command: {
    id: OpenEditorCommandId,
    title: localize2(5270, "Search"),
    icon: Codicon.search
  },
  group: "1_files",
  order: 0,
  when: ContextKeyExpr.equals("view", SESSIONS_FILES_VIEW_ID)
});

MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
  command: {
    id: OpenEditorCommandId,
    title: localize(5269, null)
  },
  group: "4_auxbar",
  order: 1
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "sessions.files.action.findInFolder",
      title: localize2(5268, "Find in Folder..."),
      menu: {
        id: MenuId.ExplorerContext,
        group: "4_search",
        order: 10,
        when: ExplorerFolderContext
      }
    });
  }
  async run(accessor, resource) {
    const explorerService = accessor.get(IExplorerService);
    const fileService = accessor.get(IFileService);
    const contextService = accessor.get(IWorkspaceContextService);
    const commandService = accessor.get(ICommandService);
    const resources = resource ? [resource] : explorerService.getContext(true).map((item) => item.resource);
    const results = await fileService.resolveAll(resources.map((resource2) => ({ resource: resource2 })));
    const folders = [];
    for (const result of results) {
      if (result.success && result.stat) {
        folders.push(result.stat.isDirectory ? result.stat.resource : dirname2(result.stat.resource));
      }
    }
    const filesToInclude = resolveResourcesForSearchIncludes(folders, contextService);
    await commandService.executeCommand(OpenEditorCommandId, {
      filesToInclude: filesToInclude.join(", "),
      showIncludesExcludes: true,
      location: "reuse"
    });
  }
});
export {};
