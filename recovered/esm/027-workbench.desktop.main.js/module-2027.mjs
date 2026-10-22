// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/fileActions.contribution.ts
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { COPY_FILE_LABEL, CompareNewUntitledTextFilesAction, CompareWithClipboardAction, DOWNLOAD_COMMAND_ID, DOWNLOAD_LABEL, FileCopiedContext, FocusFilesExplorer, GlobalCompareResourcesAction, MOVE_FILE_TO_TRASH_LABEL, NEW_FILE_COMMAND_ID2, NEW_FILE_LABEL, NEW_FOLDER_COMMAND_ID, NEW_FOLDER_LABEL, OpenActiveFileInEmptyWorkspace, PASTE_FILE_LABEL, ResetActiveEditorReadonlyInSession, SetActiveEditorReadonlyInSession, SetActiveEditorWriteableInSession, ShowActiveFileInExplorer, TRIGGER_RENAME_LABEL, ToggleActiveEditorReadonlyInSession, ToggleAutoSaveAction, UPLOAD_COMMAND_ID, UPLOAD_LABEL, copyFileHandler, cutFileHandler, deleteFileHandler, moveFileToTrashHandler, openFilePreserveFocusHandler, pasteFileHandler, renameHandler } from "./module-2022.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { newWindowCommand, openWindowCommand } from "./module-2026.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ExplorerFolderContext, ExplorerResourceAvailableEditorIdsContext, ExplorerResourceCut, ExplorerResourceMoveableToTrash, ExplorerResourceWritableContext, ExplorerRootContext, FilesExplorerFocusCondition, FoldersViewVisibleContext } from "./module-1542.mjs";
import { IExplorerService } from "./module-2020.mjs";
import { COMPARE_RESOURCE_COMMAND_ID, COMPARE_SELECTED_COMMAND_ID, COMPARE_WITH_SAVED_COMMAND_ID, COPY_PATH_COMMAND_ID, COPY_RELATIVE_PATH_COMMAND_ID, NEW_UNTITLED_FILE_COMMAND_ID, NEW_UNTITLED_FILE_LABEL, OPEN_TO_SIDE_COMMAND_ID, OPEN_WITH_EXPLORER_COMMAND_ID, OpenEditorsDirtyEditorContext, OpenEditorsGroupContext, OpenEditorsReadonlyEditorContext, OpenEditorsSelectedFileOrUntitledContext, REMOVE_ROOT_FOLDER_COMMAND_ID, REMOVE_ROOT_FOLDER_LABEL, REVEAL_IN_EXPLORER_COMMAND_ID, REVERT_FILE_COMMAND_ID, ResourceSelectedForCompareContext, SAVE_ALL_COMMAND_ID, SAVE_ALL_IN_GROUP_COMMAND_ID, SAVE_FILES_COMMAND_ID, SAVE_FILE_AS_COMMAND_ID, SAVE_FILE_AS_LABEL, SAVE_FILE_COMMAND_ID, SAVE_FILE_LABEL, SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID, SAVE_FILE_WITHOUT_FORMATTING_LABEL, SELECT_FOR_COMPARE_COMMAND_ID } from "./module-2017.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ActiveEditorAvailableEditorIdsContext, ActiveEditorCanRevertContext, ActiveEditorContext, ActiveEditorDirtyContext, DirtyWorkingCopiesContext, EnterMultiRootWorkspaceSupportContext, HasWebFileSystemAccess, IsSessionsWindowContext, MultipleEditorsSelectedInGroupContext, ResourceContextKey, SelectedEditorsInGroupFileOrUntitledResourceContextKey, SidebarFocusContext, TwoEditorsSelectedInGroupContext, WorkbenchStateContext, WorkspaceFolderCountContext } from "./module-0949.mjs";
import { Codicon } from "./module-0085.mjs";
import { CONFLICT_RESOLUTION_CONTEXT, acceptLocalChangesCommand, revertLocalChangesCommand } from "./module-2024.mjs";
import { Categories } from "./module-0847.mjs";
import { Schemas } from "./module-0033.mjs";
import { CLOSE_EDITORS_IN_GROUP_COMMAND_ID, CLOSE_EDITOR_COMMAND_ID, CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, CLOSE_SAVED_EDITORS_COMMAND_ID, REOPEN_WITH_COMMAND_ID } from "./module-1538.mjs";
import { AutoSaveAfterShortDelayContext } from "./module-0930.mjs";
import { WorkbenchListDoubleSelection } from "./module-0636.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { ADD_ROOT_FOLDER_COMMAND_ID, ADD_ROOT_FOLDER_LABEL } from "./module-1521.mjs";


// src/vs/workbench/contrib/files/browser/fileActions.contribution.ts
registerAction2(GlobalCompareResourcesAction);

registerAction2(FocusFilesExplorer);

registerAction2(ShowActiveFileInExplorer);

registerAction2(CompareWithClipboardAction);

registerAction2(CompareNewUntitledTextFilesAction);

registerAction2(ToggleAutoSaveAction);

registerAction2(OpenActiveFileInEmptyWorkspace);

registerAction2(SetActiveEditorReadonlyInSession);

registerAction2(SetActiveEditorWriteableInSession);

registerAction2(ToggleActiveEditorReadonlyInSession);

registerAction2(ResetActiveEditorReadonlyInSession);

CommandsRegistry.registerCommand("_files.windowOpen", openWindowCommand);

CommandsRegistry.registerCommand("_files.newWindow", newWindowCommand);

var explorerCommandsWeightBonus = 10;

var RENAME_ID = "renameFile";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: RENAME_ID,
  weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerRootContext.toNegated(), ExplorerResourceWritableContext),
  primary: 60 /* F2 */,
  mac: {
    primary: 3 /* Enter */
  },
  handler: renameHandler
});

var MOVE_FILE_TO_TRASH_ID = "moveFileToTrash";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: MOVE_FILE_TO_TRASH_ID,
  weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerResourceMoveableToTrash),
  primary: 20 /* Delete */,
  mac: {
    primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
    secondary: [20 /* Delete */]
  },
  handler: moveFileToTrashHandler
});

var DELETE_FILE_ID = "deleteFile";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: DELETE_FILE_ID,
  weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
  when: FilesExplorerFocusCondition,
  primary: 1024 /* Shift */ | 20 /* Delete */,
  mac: {
    primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 1 /* Backspace */
  },
  handler: deleteFileHandler
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: DELETE_FILE_ID,
  weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerResourceMoveableToTrash.toNegated()),
  primary: 20 /* Delete */,
  mac: {
    primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
  },
  handler: deleteFileHandler
});

var CUT_FILE_ID = "filesExplorer.cut";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: CUT_FILE_ID,
  weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerRootContext.toNegated(), ExplorerResourceWritableContext),
  primary: 2048 /* CtrlCmd */ | 54 /* KeyX */,
  handler: cutFileHandler
});

var COPY_FILE_ID = "filesExplorer.copy";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: COPY_FILE_ID,
  weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerRootContext.toNegated()),
  primary: 2048 /* CtrlCmd */ | 33 /* KeyC */,
  handler: copyFileHandler
});

var PASTE_FILE_ID = "filesExplorer.paste";

CommandsRegistry.registerCommand(PASTE_FILE_ID, pasteFileHandler);

KeybindingsRegistry.registerKeybindingRule({
  id: `^${PASTE_FILE_ID}`,
  // the `^` enables pasting files into the explorer by preventing default bubble up
  weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerResourceWritableContext),
  primary: 2048 /* CtrlCmd */ | 52 /* KeyV */
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "filesExplorer.cancelCut",
  weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerResourceCut),
  primary: 9 /* Escape */,
  handler: async (accessor) => {
    const explorerService = accessor.get(IExplorerService);
    await explorerService.setToCopy([], true);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "filesExplorer.openFilePreserveFocus",
  weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerFolderContext.toNegated()),
  primary: 10 /* Space */,
  handler: openFilePreserveFocusHandler
});

var copyPathCommand = {
  id: COPY_PATH_COMMAND_ID,
  title: localize(15818, null)
};

var copyRelativePathCommand = {
  id: COPY_RELATIVE_PATH_COMMAND_ID,
  title: localize(15820, null)
};

var revealInSideBarCommand = {
  id: REVEAL_IN_EXPLORER_COMMAND_ID,
  title: localize(15838, null)
};

appendEditorTitleContextMenuItem(SAVE_FILE_COMMAND_ID, SAVE_FILE_LABEL.value, ActiveEditorDirtyContext, "1_close_save", true, 10);

appendEditorTitleContextMenuItem(SAVE_FILE_AS_COMMAND_ID, SAVE_FILE_AS_LABEL.value, ActiveEditorDirtyContext, "1_close_save", false, 20);

appendEditorTitleContextMenuItem(COPY_PATH_COMMAND_ID, copyPathCommand.title, ResourceContextKey.IsFileSystemResource, "1_cutcopypaste", true);

appendEditorTitleContextMenuItem(COPY_RELATIVE_PATH_COMMAND_ID, copyRelativePathCommand.title, ResourceContextKey.IsFileSystemResource, "1_cutcopypaste", true);

appendEditorTitleContextMenuItem(revealInSideBarCommand.id, revealInSideBarCommand.title, ResourceContextKey.IsFileSystemResource, "2_files", false, 1);

function appendEditorTitleContextMenuItem(id2, title, when, group2, supportsMultiSelect, order) {
  const precondition2 = supportsMultiSelect !== true ? MultipleEditorsSelectedInGroupContext.negate() : void 0;
  MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
    command: { id: id2, title, precondition: precondition2 },
    when,
    group: group2,
    order
  });
}

appendSaveConflictEditorTitleAction("workbench.files.action.acceptLocalChanges", localize(15807, null), Codicon.check, -10, acceptLocalChangesCommand);

appendSaveConflictEditorTitleAction("workbench.files.action.revertLocalChanges", localize(15841, null), Codicon.discard, -9, revertLocalChangesCommand);

function appendSaveConflictEditorTitleAction(id2, title, icon2, order, command4) {
  CommandsRegistry.registerCommand(id2, command4);
  MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
    command: { id: id2, title, icon: icon2 },
    when: ContextKeyExpr.equals(CONFLICT_RESOLUTION_CONTEXT, true),
    group: "navigation",
    order
  });
}

function appendToCommandPalette({ id: id2, title, category: category11, metadata }, when) {
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: id2,
      title,
      category: category11,
      metadata
    },
    when
  });
}

appendToCommandPalette({
  id: COPY_PATH_COMMAND_ID,
  title: localize2(15819, "Copy Path of Active File"),
  category: Categories.File
}, IsSessionsWindowContext.negate());

appendToCommandPalette({
  id: COPY_RELATIVE_PATH_COMMAND_ID,
  title: localize2(15821, "Copy Relative Path of Active File"),
  category: Categories.File
}, IsSessionsWindowContext.negate());

appendToCommandPalette({
  id: SAVE_FILE_COMMAND_ID,
  title: SAVE_FILE_LABEL,
  category: Categories.File
});

appendToCommandPalette({
  id: SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID,
  title: SAVE_FILE_WITHOUT_FORMATTING_LABEL,
  category: Categories.File
});

appendToCommandPalette({
  id: SAVE_ALL_IN_GROUP_COMMAND_ID,
  title: localize2(15843, "Save All in Group"),
  category: Categories.File
}, IsSessionsWindowContext.negate());

appendToCommandPalette({
  id: SAVE_FILES_COMMAND_ID,
  title: localize2(15844, "Save All Files"),
  category: Categories.File
}, IsSessionsWindowContext.negate());

appendToCommandPalette({
  id: REVERT_FILE_COMMAND_ID,
  title: localize2(15839, "Revert File"),
  category: Categories.File
}, IsSessionsWindowContext.negate());

appendToCommandPalette({
  id: COMPARE_WITH_SAVED_COMMAND_ID,
  title: localize2(15812, "Compare Active File with Saved"),
  category: Categories.File,
  metadata: {
    description: localize2(15813, "Opens a new diff editor to compare the active file with the version on disk.")
  }
});

appendToCommandPalette({
  id: SAVE_FILE_AS_COMMAND_ID,
  title: SAVE_FILE_AS_LABEL,
  category: Categories.File
}, IsSessionsWindowContext.negate());

appendToCommandPalette({
  id: NEW_FILE_COMMAND_ID2,
  title: NEW_FILE_LABEL,
  category: Categories.File
}, ContextKeyExpr.and(WorkspaceFolderCountContext.notEqualsTo("0"), IsSessionsWindowContext.negate()));

appendToCommandPalette({
  id: NEW_FOLDER_COMMAND_ID,
  title: NEW_FOLDER_LABEL,
  category: Categories.File,
  metadata: { description: localize2(15834, "Create a new folder or directory") }
}, ContextKeyExpr.and(WorkspaceFolderCountContext.notEqualsTo("0"), IsSessionsWindowContext.negate()));

appendToCommandPalette({
  id: NEW_UNTITLED_FILE_COMMAND_ID,
  title: NEW_UNTITLED_FILE_LABEL,
  category: Categories.File
}, IsSessionsWindowContext.negate());

var isFileOrUntitledResourceContextKey = ContextKeyExpr.or(ResourceContextKey.IsFileSystemResource, ResourceContextKey.Scheme.isEqualTo(Schemas.untitled));

var openToSideCommand = {
  id: OPEN_TO_SIDE_COMMAND_ID,
  title: localize(15836, null)
};

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "navigation",
  order: 10,
  command: openToSideCommand,
  when: isFileOrUntitledResourceContextKey
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "1_open",
  order: 10,
  command: {
    id: REOPEN_WITH_COMMAND_ID,
    title: localize(15837, null)
  },
  when: ContextKeyExpr.and(
    // Editors with Available Choices to Open With
    ActiveEditorAvailableEditorIdsContext,
    // Not: editor groups
    OpenEditorsGroupContext.toNegated()
  )
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "1_cutcopypaste",
  order: 10,
  command: copyPathCommand,
  when: ResourceContextKey.IsFileSystemResource
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "1_cutcopypaste",
  order: 20,
  command: copyRelativePathCommand,
  when: ResourceContextKey.IsFileSystemResource
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "2_save",
  order: 10,
  command: {
    id: SAVE_FILE_COMMAND_ID,
    title: SAVE_FILE_LABEL,
    precondition: OpenEditorsDirtyEditorContext
  },
  when: ContextKeyExpr.or(
    // Untitled Editors
    ResourceContextKey.Scheme.isEqualTo(Schemas.untitled),
    // Or:
    ContextKeyExpr.and(
      // Not: editor groups
      OpenEditorsGroupContext.toNegated(),
      // Not: readonly editors
      OpenEditorsReadonlyEditorContext.toNegated(),
      // Not: auto save after short delay
      AutoSaveAfterShortDelayContext.toNegated()
    )
  )
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "2_save",
  order: 20,
  command: {
    id: REVERT_FILE_COMMAND_ID,
    title: localize(15840, null),
    precondition: OpenEditorsDirtyEditorContext
  },
  when: ContextKeyExpr.and(
    // Not: editor groups
    OpenEditorsGroupContext.toNegated(),
    // Not: readonly editors
    OpenEditorsReadonlyEditorContext.toNegated(),
    // Not: untitled editors (revert closes them)
    ResourceContextKey.Scheme.notEqualsTo(Schemas.untitled),
    // Not: auto save after short delay
    AutoSaveAfterShortDelayContext.toNegated()
  )
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "2_save",
  order: 30,
  command: {
    id: SAVE_ALL_IN_GROUP_COMMAND_ID,
    title: localize(15842, null),
    precondition: DirtyWorkingCopiesContext
  },
  // Editor Group
  when: OpenEditorsGroupContext
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "3_compare",
  order: 10,
  command: {
    id: COMPARE_WITH_SAVED_COMMAND_ID,
    title: localize(15816, null),
    precondition: OpenEditorsDirtyEditorContext
  },
  when: ContextKeyExpr.and(ResourceContextKey.IsFileSystemResource, AutoSaveAfterShortDelayContext.toNegated(), WorkbenchListDoubleSelection.toNegated())
});

var compareResourceCommand = {
  id: COMPARE_RESOURCE_COMMAND_ID,
  title: localize(15817, null)
};

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "3_compare",
  order: 20,
  command: compareResourceCommand,
  when: ContextKeyExpr.and(ResourceContextKey.HasResource, ResourceSelectedForCompareContext, isFileOrUntitledResourceContextKey, WorkbenchListDoubleSelection.toNegated())
});

var selectForCompareCommand = {
  id: SELECT_FOR_COMPARE_COMMAND_ID,
  title: localize(15815, null)
};

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "3_compare",
  order: 30,
  command: selectForCompareCommand,
  when: ContextKeyExpr.and(ResourceContextKey.HasResource, isFileOrUntitledResourceContextKey, WorkbenchListDoubleSelection.toNegated())
});

var compareSelectedCommand = {
  id: COMPARE_SELECTED_COMMAND_ID,
  title: localize(15814, null)
};

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "3_compare",
  order: 30,
  command: compareSelectedCommand,
  when: ContextKeyExpr.and(ResourceContextKey.HasResource, WorkbenchListDoubleSelection, OpenEditorsSelectedFileOrUntitledContext)
});

MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
  group: "1_compare",
  order: 30,
  command: compareSelectedCommand,
  when: ContextKeyExpr.and(ResourceContextKey.HasResource, TwoEditorsSelectedInGroupContext, SelectedEditorsInGroupFileOrUntitledResourceContextKey)
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "4_close",
  order: 10,
  command: {
    id: CLOSE_EDITOR_COMMAND_ID,
    title: localize(15808, null)
  },
  when: OpenEditorsGroupContext.toNegated()
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "4_close",
  order: 20,
  command: {
    id: CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
    title: localize(15810, null)
  },
  when: OpenEditorsGroupContext.toNegated()
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "4_close",
  order: 30,
  command: {
    id: CLOSE_SAVED_EDITORS_COMMAND_ID,
    title: localize(15811, null)
  }
});

MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
  group: "4_close",
  order: 40,
  command: {
    id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
    title: localize(15809, null)
  }
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "navigation",
  order: 4,
  command: {
    id: NEW_FILE_COMMAND_ID2,
    title: NEW_FILE_LABEL,
    precondition: ExplorerResourceWritableContext
  },
  when: ExplorerFolderContext
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "navigation",
  order: 6,
  command: {
    id: NEW_FOLDER_COMMAND_ID,
    title: NEW_FOLDER_LABEL,
    precondition: ExplorerResourceWritableContext
  },
  when: ExplorerFolderContext
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "navigation",
  order: 10,
  command: openToSideCommand,
  when: ContextKeyExpr.and(ExplorerFolderContext.toNegated(), ResourceContextKey.HasResource)
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "navigation",
  order: 20,
  command: {
    id: OPEN_WITH_EXPLORER_COMMAND_ID,
    title: localize(15824, null)
  },
  when: ContextKeyExpr.and(ExplorerFolderContext.toNegated(), ExplorerResourceAvailableEditorIdsContext)
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "3_compare",
  order: 20,
  command: compareResourceCommand,
  when: ContextKeyExpr.and(ExplorerFolderContext.toNegated(), ResourceContextKey.HasResource, ResourceSelectedForCompareContext, WorkbenchListDoubleSelection.toNegated())
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "3_compare",
  order: 30,
  command: selectForCompareCommand,
  when: ContextKeyExpr.and(ExplorerFolderContext.toNegated(), ResourceContextKey.HasResource, WorkbenchListDoubleSelection.toNegated())
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "3_compare",
  order: 30,
  command: compareSelectedCommand,
  when: ContextKeyExpr.and(ExplorerFolderContext.toNegated(), ResourceContextKey.HasResource, WorkbenchListDoubleSelection)
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "5_cutcopypaste",
  order: 8,
  command: {
    id: CUT_FILE_ID,
    title: localize(15822, null)
  },
  when: ContextKeyExpr.and(ExplorerRootContext.toNegated(), ExplorerResourceWritableContext)
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "5_cutcopypaste",
  order: 10,
  command: {
    id: COPY_FILE_ID,
    title: COPY_FILE_LABEL
  },
  when: ExplorerRootContext.toNegated()
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "5_cutcopypaste",
  order: 20,
  command: {
    id: PASTE_FILE_ID,
    title: PASTE_FILE_LABEL,
    precondition: ContextKeyExpr.and(ExplorerResourceWritableContext, FileCopiedContext)
  },
  when: ExplorerFolderContext
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "5b_importexport",
  order: 10,
  command: {
    id: DOWNLOAD_COMMAND_ID,
    title: DOWNLOAD_LABEL
  },
  when: ContextKeyExpr.or(
    // native: for any remote resource
    ContextKeyExpr.and(IsWebContext.toNegated(), ResourceContextKey.Scheme.notEqualsTo(Schemas.file)),
    // web: for any files
    ContextKeyExpr.and(IsWebContext, ExplorerFolderContext.toNegated(), ExplorerRootContext.toNegated()),
    // web: for any folders if file system API support is provided
    ContextKeyExpr.and(IsWebContext, HasWebFileSystemAccess)
  )
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "5b_importexport",
  order: 20,
  command: {
    id: UPLOAD_COMMAND_ID,
    title: UPLOAD_LABEL
  },
  when: ContextKeyExpr.and(
    // only in web
    IsWebContext,
    // only on folders
    ExplorerFolderContext,
    // only on writable folders
    ExplorerResourceWritableContext
  )
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "6_copypath",
  order: 10,
  command: copyPathCommand,
  when: ResourceContextKey.IsFileSystemResource
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "6_copypath",
  order: 20,
  command: copyRelativePathCommand,
  when: ResourceContextKey.IsFileSystemResource
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "2_workspace",
  order: 10,
  command: {
    id: ADD_ROOT_FOLDER_COMMAND_ID,
    title: ADD_ROOT_FOLDER_LABEL
  },
  when: ContextKeyExpr.and(ExplorerRootContext, ContextKeyExpr.or(EnterMultiRootWorkspaceSupportContext, WorkbenchStateContext.isEqualTo("workspace")))
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "2_workspace",
  order: 30,
  command: {
    id: REMOVE_ROOT_FOLDER_COMMAND_ID,
    title: REMOVE_ROOT_FOLDER_LABEL
  },
  when: ContextKeyExpr.and(ExplorerRootContext, ExplorerFolderContext, ContextKeyExpr.and(WorkspaceFolderCountContext.notEqualsTo("0"), ContextKeyExpr.or(EnterMultiRootWorkspaceSupportContext, WorkbenchStateContext.isEqualTo("workspace"))))
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "7_modification",
  order: 10,
  command: {
    id: RENAME_ID,
    title: TRIGGER_RENAME_LABEL,
    precondition: ExplorerResourceWritableContext
  },
  when: ExplorerRootContext.toNegated()
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "7_modification",
  order: 20,
  command: {
    id: MOVE_FILE_TO_TRASH_ID,
    title: MOVE_FILE_TO_TRASH_LABEL
  },
  alt: {
    id: DELETE_FILE_ID,
    title: localize(15823, null)
  },
  when: ContextKeyExpr.and(ExplorerRootContext.toNegated(), ExplorerResourceMoveableToTrash)
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "7_modification",
  order: 20,
  command: {
    id: DELETE_FILE_ID,
    title: localize(15823, null)
  },
  when: ContextKeyExpr.and(ExplorerRootContext.toNegated(), ExplorerResourceMoveableToTrash.toNegated())
});

for (const menuId of [MenuId.EmptyEditorGroupContext, MenuId.EditorTabsBarContext]) {
  MenuRegistry.appendMenuItem(menuId, { command: { id: NEW_UNTITLED_FILE_COMMAND_ID, title: localize(15833, null) }, group: "1_file", order: 10 });
  MenuRegistry.appendMenuItem(menuId, { command: { id: "workbench.action.quickOpen", title: localize(15835, null) }, group: "1_file", order: 20 });
}

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "1_new",
  command: {
    id: NEW_UNTITLED_FILE_COMMAND_ID,
    title: localize(15828, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "4_save",
  command: {
    id: SAVE_FILE_COMMAND_ID,
    title: localize(15830, null),
    precondition: ContextKeyExpr.or(ActiveEditorContext, ContextKeyExpr.and(FoldersViewVisibleContext, SidebarFocusContext))
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "4_save",
  command: {
    id: SAVE_FILE_AS_COMMAND_ID,
    title: localize(15832, null),
    precondition: ContextKeyExpr.or(ActiveEditorContext, ContextKeyExpr.and(FoldersViewVisibleContext, SidebarFocusContext))
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "4_save",
  command: {
    id: SAVE_ALL_COMMAND_ID,
    title: localize(15831, null),
    precondition: DirtyWorkingCopiesContext
  },
  order: 3
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "5_autosave",
  command: {
    id: ToggleAutoSaveAction.ID,
    title: localize(15825, null),
    toggled: ContextKeyExpr.notEquals("config.files.autoSave", "off")
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "6_close",
  command: {
    id: REVERT_FILE_COMMAND_ID,
    title: localize(15829, null),
    precondition: ContextKeyExpr.or(
      // Active editor can revert
      ContextKeyExpr.and(ActiveEditorCanRevertContext),
      // Explorer focused but not on untitled
      ContextKeyExpr.and(ResourceContextKey.Scheme.notEqualsTo(Schemas.untitled), FoldersViewVisibleContext, SidebarFocusContext)
    )
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "6_close",
  command: {
    id: CLOSE_EDITOR_COMMAND_ID,
    title: localize(15826, null),
    precondition: ContextKeyExpr.or(ActiveEditorContext, ContextKeyExpr.and(FoldersViewVisibleContext, SidebarFocusContext))
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
  group: "3_global_nav",
  command: {
    id: "workbench.action.quickOpen",
    title: localize(15827, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.ChatAttachmentsContext, {
  group: "navigation",
  order: 10,
  command: openToSideCommand,
  when: ContextKeyExpr.and(ResourceContextKey.IsFileSystemResource, ExplorerFolderContext.toNegated())
});

MenuRegistry.appendMenuItem(MenuId.ChatAttachmentsContext, {
  group: "navigation",
  order: 20,
  command: revealInSideBarCommand,
  when: ResourceContextKey.IsFileSystemResource
});

MenuRegistry.appendMenuItem(MenuId.ChatAttachmentsContext, {
  group: "1_cutcopypaste",
  order: 10,
  command: copyPathCommand,
  when: ResourceContextKey.IsFileSystemResource
});

MenuRegistry.appendMenuItem(MenuId.ChatAttachmentsContext, {
  group: "1_cutcopypaste",
  order: 20,
  command: copyRelativePathCommand,
  when: ResourceContextKey.IsFileSystemResource
});

for (const menuId of [MenuId.ChatInlineResourceAnchorContext, MenuId.ChatInputResourceAttachmentContext]) {
  MenuRegistry.appendMenuItem(menuId, {
    group: "navigation",
    order: 10,
    command: openToSideCommand,
    when: ContextKeyExpr.and(ResourceContextKey.HasResource, ExplorerFolderContext.toNegated())
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: "navigation",
    order: 20,
    command: revealInSideBarCommand,
    when: ResourceContextKey.IsFileSystemResource
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: "1_cutcopypaste",
    order: 10,
    command: copyPathCommand,
    when: ResourceContextKey.IsFileSystemResource
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: "1_cutcopypaste",
    order: 20,
    command: copyRelativePathCommand,
    when: ResourceContextKey.IsFileSystemResource
  });
}
export { appendEditorTitleContextMenuItem, appendSaveConflictEditorTitleAction, appendToCommandPalette, explorerCommandsWeightBonus, RENAME_ID, MOVE_FILE_TO_TRASH_ID, DELETE_FILE_ID, CUT_FILE_ID, COPY_FILE_ID, PASTE_FILE_ID, copyPathCommand, copyRelativePathCommand, revealInSideBarCommand, isFileOrUntitledResourceContextKey, openToSideCommand, compareResourceCommand, selectForCompareCommand, compareSelectedCommand };
