// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/electron-browser/fileActions.contribution.ts
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ResourceContextKey } from "./module-0949.mjs";
import { Schemas } from "./module-0033.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IExplorerService, getMultiSelectedResources } from "./module-2020.mjs";
import { IListService } from "./module-0636.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { revealResourcesInOS } from "./module-3950.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { KeyChord } from "./module-0019.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { appendEditorTitleContextMenuItem, appendToCommandPalette } from "./module-2027.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";


// src/vs/workbench/contrib/files/electron-browser/fileActions.contribution.ts
var REVEAL_IN_OS_COMMAND_ID = "revealFileInOS";

var REVEAL_IN_OS_LABEL2 = isWindows ? localize2(16063, "Reveal in File Explorer") : isMacintosh ? localize2(16062, "Reveal in Finder") : localize2(16061, "Open Containing Folder");

var REVEAL_IN_OS_WHEN_CONTEXT = ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.file), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeUserData));

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: REVEAL_IN_OS_COMMAND_ID,
  weight: 200 /* WorkbenchContrib */,
  when: EditorContextKeys.focus.toNegated(),
  primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 48 /* KeyR */,
  win: {
    primary: 1024 /* Shift */ | 512 /* Alt */ | 48 /* KeyR */
  },
  handler: (accessor, resource) => {
    const resources = getMultiSelectedResources(resource, accessor.get(IListService), accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IExplorerService));
    revealResourcesInOS(resources, accessor.get(INativeHostService), accessor.get(IWorkspaceContextService));
  }
});

var REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID = "workbench.action.files.revealActiveFileInWindows";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */,
  when: void 0,
  primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 48 /* KeyR */),
  id: REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID,
  handler: (accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeInput = editorService.activeEditor;
    const resource = EditorResourceAccessor.getOriginalUri(activeInput, { filterByScheme: [Schemas.file], supportSideBySide: 1 /* PRIMARY */ });
    const resources = resource ? [resource] : [];
    revealResourcesInOS(resources, accessor.get(INativeHostService), accessor.get(IWorkspaceContextService));
  }
});

appendEditorTitleContextMenuItem(REVEAL_IN_OS_COMMAND_ID, REVEAL_IN_OS_LABEL2.value, REVEAL_IN_OS_WHEN_CONTEXT, "2_files", false, 0);

var revealInOsCommand = {
  id: REVEAL_IN_OS_COMMAND_ID,
  title: REVEAL_IN_OS_LABEL2.value
};

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "navigation",
  order: 20,
  command: revealInOsCommand,
  when: REVEAL_IN_OS_WHEN_CONTEXT
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContextShare, {
  title: localize(16060, null),
  submenu: MenuId.MenubarShare,
  group: "share",
  order: 3
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "navigation",
  order: 20,
  command: revealInOsCommand,
  when: REVEAL_IN_OS_WHEN_CONTEXT
});

var category10 = localize2(16059, "File");

appendToCommandPalette({
  id: REVEAL_IN_OS_COMMAND_ID,
  title: REVEAL_IN_OS_LABEL2,
  category: category10
}, REVEAL_IN_OS_WHEN_CONTEXT);

MenuRegistry.appendMenuItem(MenuId.ChatAttachmentsContext, {
  group: "navigation",
  order: 20,
  command: revealInOsCommand,
  when: REVEAL_IN_OS_WHEN_CONTEXT
});

MenuRegistry.appendMenuItem(MenuId.ChatInlineResourceAnchorContext, {
  group: "navigation",
  order: 20,
  command: revealInOsCommand,
  when: REVEAL_IN_OS_WHEN_CONTEXT
});
export { REVEAL_IN_OS_COMMAND_ID, REVEAL_IN_OS_LABEL2, REVEAL_IN_OS_WHEN_CONTEXT, REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID, revealInOsCommand, category10 };
