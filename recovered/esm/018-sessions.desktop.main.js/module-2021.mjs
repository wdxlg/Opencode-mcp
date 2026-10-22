// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/fileCommands.ts
import { IHostService } from "./module-1118.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { isWorkspaceToOpen } from "./module-0515.mjs";
import { Schemas } from "./module-0033.mjs";
import { basename2, isEqual2, joinPath } from "./module-0034.mjs";
import { IWorkspaceContextService, UNTITLED_WORKSPACE_NAME } from "./module-0509.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { ExplorerCompressedFirstFocusContext, ExplorerCompressedFocusContext, ExplorerCompressedLastFocusContext, ExplorerFocusCondition, ExplorerFolderContext, FilesExplorerFocusCondition, TextFileContentProvider, VIEWLET_ID4, VIEW_ID2 } from "./module-1534.mjs";
import { COMPARE_RESOURCE_COMMAND_ID, COMPARE_SELECTED_COMMAND_ID, COMPARE_WITH_SAVED_COMMAND_ID, COPY_PATH_COMMAND_ID, COPY_RELATIVE_PATH_COMMAND_ID, FIRST_COMPRESSED_FOLDER, LAST_COMPRESSED_FOLDER, NEW_FILE_COMMAND_ID, NEW_UNTITLED_FILE_COMMAND_ID, NEW_UNTITLED_FILE_LABEL, NEXT_COMPRESSED_FOLDER, OPEN_TO_SIDE_COMMAND_ID, OPEN_WITH_EXPLORER_COMMAND_ID, PREVIOUS_COMPRESSED_FOLDER, REMOVE_ROOT_FOLDER_COMMAND_ID, REVEAL_IN_EXPLORER_COMMAND_ID, REVERT_FILE_COMMAND_ID, ResourceSelectedForCompareContext, SAVE_ALL_COMMAND_ID, SAVE_ALL_IN_GROUP_COMMAND_ID, SAVE_FILES_COMMAND_ID, SAVE_FILE_AS_COMMAND_ID, SAVE_FILE_COMMAND_ID, SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID, SELECT_FOR_COMPARE_COMMAND_ID } from "./module-1994.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { IFileService } from "./module-0269.mjs";
import { IExplorerService, getMultiSelectedResources, getOpenEditorsViewMultiSelection, getResourceForCommand } from "./module-1997.mjs";
import { IListService } from "./module-0636.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { localize } from "./module-0001.mjs";
import { EditorResourceAccessor, isEditorCommandsContext } from "./module-0926.mjs";
import { dispose } from "./module-0012.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { isWeb, isWindows } from "./module-0014.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IViewsService } from "./module-1246.mjs";
import { OpenEditorsView } from "./module-2020.mjs";
import { SideBySideEditorInput } from "./module-1096.mjs";
import { resolveCommandsContext } from "./module-1529.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { toAction } from "./module-0082.mjs";
import { hash } from "./module-0039.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { RemoveRootFolderAction } from "./module-1514.mjs";
import { IWorkspaceEditingService } from "./module-1313.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { IFileDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/files/browser/fileCommands.ts
var openWindowCommand = (accessor, toOpen, options3) => {
  if (Array.isArray(toOpen)) {
    const hostService = accessor.get(IHostService);
    const environmentService = accessor.get(IEnvironmentService);
    toOpen = toOpen.map((openable) => {
      if (isWorkspaceToOpen(openable) && openable.workspaceUri.scheme === Schemas.untitled) {
        return {
          workspaceUri: joinPath(environmentService.untitledWorkspacesHome, openable.workspaceUri.path, UNTITLED_WORKSPACE_NAME)
        };
      }
      return openable;
    });
    hostService.openWindow(toOpen, options3);
  }
};

var newWindowCommand = (accessor, options3) => {
  const hostService = accessor.get(IHostService);
  hostService.openWindow(options3);
};

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */,
  when: ExplorerFocusCondition,
  primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
  mac: {
    primary: 256 /* WinCtrl */ | 3 /* Enter */
  },
  id: OPEN_TO_SIDE_COMMAND_ID,
  handler: async (accessor, resource) => {
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const explorerService = accessor.get(IExplorerService);
    const resources = getMultiSelectedResources(resource, accessor.get(IListService), editorService, accessor.get(IEditorGroupsService), explorerService);
    if (resources.length) {
      const untitledResources = resources.filter((resource2) => resource2.scheme === Schemas.untitled);
      const fileResources = resources.filter((resource2) => resource2.scheme !== Schemas.untitled);
      const items = await Promise.all(fileResources.map(async (resource2) => {
        const item = explorerService.findClosest(resource2);
        if (item) {
          return item;
        }
        return await fileService.stat(resource2);
      }));
      const files = items.filter((i2) => !i2.isDirectory);
      const editors = files.map((f) => ({
        resource: f.resource,
        options: { pinned: true }
      })).concat(...untitledResources.map((untitledResource) => ({ resource: untitledResource, options: { pinned: true } })));
      await editorService.openEditors(editors, SIDE_GROUP);
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */ + 10,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerFolderContext.toNegated()),
  primary: 3 /* Enter */,
  mac: {
    primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */
  },
  id: "explorer.openAndPassFocus",
  handler: async (accessor, _resource) => {
    const editorService = accessor.get(IEditorService);
    const explorerService = accessor.get(IExplorerService);
    const resources = explorerService.getContext(true);
    if (resources.length) {
      await editorService.openEditors(resources.map((r2) => ({ resource: r2.resource, options: { preserveFocus: false, pinned: true } })));
    }
  }
});

var COMPARE_WITH_SAVED_SCHEMA = "showModifications";

var providerDisposables = [];

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: COMPARE_WITH_SAVED_COMMAND_ID,
  when: void 0,
  weight: 200 /* WorkbenchContrib */,
  primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 34 /* KeyD */),
  handler: async (accessor, resource) => {
    const instantiationService = accessor.get(IInstantiationService);
    const textModelService = accessor.get(ITextModelService);
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const listService = accessor.get(IListService);
    let registerEditorListener = false;
    if (providerDisposables.length === 0) {
      registerEditorListener = true;
      const provider = instantiationService.createInstance(TextFileContentProvider);
      providerDisposables.push(provider);
      providerDisposables.push(textModelService.registerTextModelContentProvider(COMPARE_WITH_SAVED_SCHEMA, provider));
    }
    const uri4 = getResourceForCommand(resource, editorService, listService);
    if (uri4 && fileService.hasProvider(uri4)) {
      const name = basename2(uri4);
      const editorLabel = localize(15847, null, name, name);
      try {
        await TextFileContentProvider.open(uri4, COMPARE_WITH_SAVED_SCHEMA, editorLabel, editorService, { pinned: true });
        if (registerEditorListener) {
          providerDisposables.push(editorService.onDidVisibleEditorsChange(() => {
            if (!editorService.editors.some((editor) => !!EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 2 /* SECONDARY */, filterByScheme: COMPARE_WITH_SAVED_SCHEMA }))) {
              providerDisposables = dispose(providerDisposables);
            }
          }));
        }
      } catch {
        providerDisposables = dispose(providerDisposables);
      }
    }
  }
});

var globalResourceToCompare;

var resourceSelectedForCompareContext;

CommandsRegistry.registerCommand({
  id: SELECT_FOR_COMPARE_COMMAND_ID,
  handler: (accessor, resource) => {
    globalResourceToCompare = getResourceForCommand(resource, accessor.get(IEditorService), accessor.get(IListService));
    if (!resourceSelectedForCompareContext) {
      resourceSelectedForCompareContext = ResourceSelectedForCompareContext.bindTo(accessor.get(IContextKeyService));
    }
    resourceSelectedForCompareContext.set(true);
  }
});

CommandsRegistry.registerCommand({
  id: COMPARE_SELECTED_COMMAND_ID,
  handler: async (accessor, resource) => {
    const editorService = accessor.get(IEditorService);
    const resources = getMultiSelectedResources(resource, accessor.get(IListService), editorService, accessor.get(IEditorGroupsService), accessor.get(IExplorerService));
    if (resources.length === 2) {
      return editorService.openEditor({
        original: { resource: resources[0] },
        modified: { resource: resources[1] },
        options: { pinned: true }
      });
    }
    return true;
  }
});

CommandsRegistry.registerCommand({
  id: COMPARE_RESOURCE_COMMAND_ID,
  handler: (accessor, resource) => {
    const editorService = accessor.get(IEditorService);
    const rightResource = getResourceForCommand(resource, editorService, accessor.get(IListService));
    if (globalResourceToCompare && rightResource) {
      editorService.openEditor({
        original: { resource: globalResourceToCompare },
        modified: { resource: rightResource },
        options: { pinned: true }
      });
    }
  }
});

async function resourcesToClipboard(resources, relative2, clipboardService, labelService, configurationService) {
  if (resources.length) {
    const lineDelimiter2 = isWindows ? "\r\n" : "\n";
    let separator2 = void 0;
    const copyRelativeOrFullPathSeparatorSection = relative2 ? "explorer.copyRelativePathSeparator" : "explorer.copyPathSeparator";
    const copyRelativeOrFullPathSeparator = configurationService.getValue(copyRelativeOrFullPathSeparatorSection);
    if (copyRelativeOrFullPathSeparator === "/" || copyRelativeOrFullPathSeparator === "\\") {
      separator2 = copyRelativeOrFullPathSeparator;
    }
    const text2 = resources.map((resource) => labelService.getUriLabel(resource, { relative: relative2, noPrefix: true, separator: separator2 })).join(lineDelimiter2);
    await clipboardService.writeText(text2);
  }
}

var copyPathCommandHandler = async (accessor, resource) => {
  const resources = getMultiSelectedResources(resource, accessor.get(IListService), accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IExplorerService));
  await resourcesToClipboard(resources, false, accessor.get(IClipboardService), accessor.get(ILabelService), accessor.get(IConfigurationService));
};

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */,
  when: EditorContextKeys.focus.toNegated(),
  primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KeyC */,
  win: {
    primary: 1024 /* Shift */ | 512 /* Alt */ | 33 /* KeyC */
  },
  id: COPY_PATH_COMMAND_ID,
  handler: copyPathCommandHandler
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */,
  when: EditorContextKeys.focus,
  primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KeyC */),
  win: {
    primary: 1024 /* Shift */ | 512 /* Alt */ | 33 /* KeyC */
  },
  id: COPY_PATH_COMMAND_ID,
  handler: copyPathCommandHandler
});

var copyRelativePathCommandHandler = async (accessor, resource) => {
  const resources = getMultiSelectedResources(resource, accessor.get(IListService), accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IExplorerService));
  await resourcesToClipboard(resources, true, accessor.get(IClipboardService), accessor.get(ILabelService), accessor.get(IConfigurationService));
};

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */,
  when: EditorContextKeys.focus.toNegated(),
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 33 /* KeyC */,
  win: {
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KeyC */)
  },
  id: COPY_RELATIVE_PATH_COMMAND_ID,
  handler: copyRelativePathCommandHandler
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */,
  when: EditorContextKeys.focus,
  primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 33 /* KeyC */),
  win: {
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KeyC */)
  },
  id: COPY_RELATIVE_PATH_COMMAND_ID,
  handler: copyRelativePathCommandHandler
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */,
  when: void 0,
  primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 46 /* KeyP */),
  id: "workbench.action.files.copyPathOfActiveFile",
  handler: async (accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeInput = editorService.activeEditor;
    const resource = EditorResourceAccessor.getOriginalUri(activeInput, { supportSideBySide: 1 /* PRIMARY */ });
    const resources = resource ? [resource] : [];
    await resourcesToClipboard(resources, false, accessor.get(IClipboardService), accessor.get(ILabelService), accessor.get(IConfigurationService));
  }
});

CommandsRegistry.registerCommand({
  id: REVEAL_IN_EXPLORER_COMMAND_ID,
  handler: async (accessor, resource) => {
    const viewService = accessor.get(IViewsService);
    const contextService = accessor.get(IWorkspaceContextService);
    const explorerService = accessor.get(IExplorerService);
    const editorService = accessor.get(IEditorService);
    const listService = accessor.get(IListService);
    const uri4 = getResourceForCommand(resource, editorService, listService);
    if (uri4 && contextService.isInsideWorkspace(uri4)) {
      const explorerView = await viewService.openView(VIEW_ID2, false);
      if (explorerView) {
        const oldAutoReveal = explorerView.autoReveal;
        explorerView.autoReveal = false;
        explorerView.setExpanded(true);
        await explorerService.select(uri4, "force");
        explorerView.focus();
        explorerView.autoReveal = oldAutoReveal;
      }
    } else {
      const openEditorsView = viewService.getViewWithId(OpenEditorsView.ID);
      if (openEditorsView) {
        openEditorsView.setExpanded(true);
        openEditorsView.focus();
      }
    }
  }
});

CommandsRegistry.registerCommand({
  id: OPEN_WITH_EXPLORER_COMMAND_ID,
  handler: async (accessor, resource) => {
    const editorService = accessor.get(IEditorService);
    const listService = accessor.get(IListService);
    const uri4 = getResourceForCommand(resource, editorService, listService);
    if (uri4) {
      return editorService.openEditor({ resource: uri4, options: { override: 0 /* PICK */, source: 1 /* USER */ } });
    }
    return void 0;
  }
});

function expandSideBySideEditor({ groupId, editor }, options3) {
  if (editor instanceof SideBySideEditorInput && !options3?.saveAs && !(editor.primary.hasCapability(4 /* Untitled */) || editor.secondary.hasCapability(4 /* Untitled */)) && editor.secondary.isModified()) {
    return [{ groupId, editor: editor.primary }, { groupId, editor: editor.secondary }];
  }
  return [{ groupId, editor }];
}

function getEditorsFromCommandArgs(accessor, commandArgs, options3) {
  if (!commandArgs?.some((arg) => isEditorCommandsContext(arg))) {
    return void 0;
  }
  const resolvedContext = resolveCommandsContext(commandArgs, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
  const editors = [];
  for (const { group: group2, editors: groupEditors } of resolvedContext.groupedEditors) {
    for (const editor of groupEditors) {
      editors.push(...expandSideBySideEditor({ groupId: group2.id, editor }, options3));
    }
  }
  return editors;
}

async function saveSelectedEditors(accessor, options3, commandArgs) {
  const editorGroupService = accessor.get(IEditorGroupsService);
  const codeEditorService = accessor.get(ICodeEditorService);
  const textFileService = accessor.get(ITextFileService);
  let editors = getEditorsFromCommandArgs(accessor, commandArgs, options3);
  if (!editors) {
    editors = getOpenEditorsViewMultiSelection(accessor);
  }
  if (!editors) {
    const activeGroup = editorGroupService.activeGroup;
    if (activeGroup.activeEditor) {
      editors = expandSideBySideEditor({ groupId: activeGroup.id, editor: activeGroup.activeEditor }, options3);
    }
  }
  if (!editors || editors.length === 0) {
    return;
  }
  await doSaveEditors(accessor, editors, options3);
  const focusedCodeEditor = codeEditorService.getFocusedCodeEditor();
  if (focusedCodeEditor instanceof EmbeddedCodeEditorWidget && !focusedCodeEditor.isSimpleWidget) {
    const resource = focusedCodeEditor.getModel()?.uri;
    if (resource && !editors.some(({ editor }) => isEqual2(EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 1 /* PRIMARY */ }), resource))) {
      const model = textFileService.files.get(resource);
      if (!model?.isReadonly()) {
        await textFileService.save(resource, options3);
      }
    }
  }
}

function saveDirtyEditorsOfGroups(accessor, groups, options3) {
  const dirtyEditors = [];
  for (const group2 of groups) {
    for (const editor of group2.getEditors(0 /* MOST_RECENTLY_ACTIVE */)) {
      if (editor.isDirty()) {
        dirtyEditors.push({ groupId: group2.id, editor });
      }
    }
  }
  return doSaveEditors(accessor, dirtyEditors, options3);
}

async function doSaveEditors(accessor, editors, options3) {
  const editorService = accessor.get(IEditorService);
  const notificationService = accessor.get(INotificationService);
  const instantiationService = accessor.get(IInstantiationService);
  try {
    await editorService.save(editors, options3);
  } catch (error) {
    if (!isCancellationError(error)) {
      const actions = [toAction({ id: "workbench.action.files.saveEditors", label: localize(15849, null), run: () => instantiationService.invokeFunction((accessor2) => doSaveEditors(accessor2, editors, options3)) })];
      const editorsToRevert = editors.filter(
        ({ editor }) => !editor.hasCapability(4 /* Untitled */)
        /* all except untitled to prevent unexpected data-loss */
      );
      if (editorsToRevert.length > 0) {
        actions.push(toAction({ id: "workbench.action.files.revertEditors", label: editorsToRevert.length > 1 ? localize(15851, null) : localize(15850, null), run: () => editorService.revert(editorsToRevert) }));
      }
      notificationService.notify({
        id: editors.map(({ editor }) => hash(editor.resource?.toString())).join(),
        // ensure unique notification ID per set of editor
        severity: Severity2.Error,
        message: localize(15846, null, editors.map(({ editor }) => editor.getName()).join(", "), toErrorMessage(error, false)),
        actions: { primary: actions }
      });
    }
  }
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  when: void 0,
  weight: 200 /* WorkbenchContrib */,
  primary: 2048 /* CtrlCmd */ | 49 /* KeyS */,
  id: SAVE_FILE_COMMAND_ID,
  handler: (accessor, ...args2) => {
    return saveSelectedEditors(accessor, {
      reason: 1 /* EXPLICIT */,
      force: true
      /* force save even when non-dirty */
    }, args2);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  when: void 0,
  weight: 200 /* WorkbenchContrib */,
  primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 49 /* KeyS */),
  win: { primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 49 /* KeyS */) },
  id: SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID,
  handler: (accessor) => {
    return saveSelectedEditors(accessor, { reason: 1 /* EXPLICIT */, force: true, skipSaveParticipants: true });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: SAVE_FILE_AS_COMMAND_ID,
  weight: 200 /* WorkbenchContrib */,
  when: void 0,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 49 /* KeyS */,
  handler: (accessor, ...args2) => {
    return saveSelectedEditors(accessor, { reason: 1 /* EXPLICIT */, saveAs: true }, args2);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  when: void 0,
  weight: 200 /* WorkbenchContrib */,
  primary: void 0,
  mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 49 /* KeyS */ },
  win: { primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 49 /* KeyS */) },
  id: SAVE_ALL_COMMAND_ID,
  handler: (accessor) => {
    return saveDirtyEditorsOfGroups(accessor, accessor.get(IEditorGroupsService).getGroups(1 /* MOST_RECENTLY_ACTIVE */), { reason: 1 /* EXPLICIT */ });
  }
});

CommandsRegistry.registerCommand({
  id: SAVE_ALL_IN_GROUP_COMMAND_ID,
  handler: (accessor, _, editorContext) => {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const resolvedContext = resolveCommandsContext([editorContext], accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
    let groups = void 0;
    if (!resolvedContext.groupedEditors.length) {
      groups = editorGroupsService.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
    } else {
      groups = resolvedContext.groupedEditors.map(({ group: group2 }) => group2);
    }
    return saveDirtyEditorsOfGroups(accessor, groups, { reason: 1 /* EXPLICIT */ });
  }
});

CommandsRegistry.registerCommand({
  id: SAVE_FILES_COMMAND_ID,
  handler: async (accessor) => {
    const editorService = accessor.get(IEditorService);
    const res = await editorService.saveAll({ includeUntitled: false, reason: 1 /* EXPLICIT */ });
    return res.success;
  }
});

CommandsRegistry.registerCommand({
  id: REVERT_FILE_COMMAND_ID,
  handler: async (accessor) => {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    let editors = getOpenEditorsViewMultiSelection(accessor);
    if (!editors) {
      const activeGroup = editorGroupService.activeGroup;
      if (activeGroup.activeEditor) {
        editors = [{ groupId: activeGroup.id, editor: activeGroup.activeEditor }];
      }
    }
    if (!editors || editors.length === 0) {
      return;
    }
    try {
      await editorService.revert(editors.filter(
        ({ editor }) => !editor.hasCapability(4 /* Untitled */)
        /* all except untitled */
      ), { force: true });
    } catch (error) {
      const notificationService = accessor.get(INotificationService);
      notificationService.error(localize(15845, null, editors.map(({ editor }) => editor.getName()).join(", "), toErrorMessage(error, false)));
    }
  }
});

CommandsRegistry.registerCommand({
  id: REMOVE_ROOT_FOLDER_COMMAND_ID,
  handler: (accessor, resource) => {
    const contextService = accessor.get(IWorkspaceContextService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    const workspace = contextService.getWorkspace();
    const resources = getMultiSelectedResources(resource, accessor.get(IListService), accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IExplorerService)).filter(
      (resource2) => workspace.folders.some((folder) => uriIdentityService.extUri.isEqual(folder.uri, resource2))
      // Need to verify resources are workspaces since multi selection can trigger this command on some non workspace resources
    );
    if (resources.length === 0) {
      const commandService = accessor.get(ICommandService);
      return commandService.executeCommand(RemoveRootFolderAction.ID);
    }
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    return workspaceEditingService.removeFolders(resources);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */ + 10,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerCompressedFocusContext, ExplorerCompressedFirstFocusContext.negate()),
  primary: 15 /* LeftArrow */,
  id: PREVIOUS_COMPRESSED_FOLDER,
  handler: (accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const viewlet = paneCompositeService.getActivePaneComposite(0 /* Sidebar */);
    if (viewlet?.getId() !== VIEWLET_ID4) {
      return;
    }
    const explorer = viewlet.getViewPaneContainer();
    const view = explorer.getExplorerView();
    view.previousCompressedStat();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */ + 10,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerCompressedFocusContext, ExplorerCompressedLastFocusContext.negate()),
  primary: 17 /* RightArrow */,
  id: NEXT_COMPRESSED_FOLDER,
  handler: (accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const viewlet = paneCompositeService.getActivePaneComposite(0 /* Sidebar */);
    if (viewlet?.getId() !== VIEWLET_ID4) {
      return;
    }
    const explorer = viewlet.getViewPaneContainer();
    const view = explorer.getExplorerView();
    view.nextCompressedStat();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */ + 10,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerCompressedFocusContext, ExplorerCompressedFirstFocusContext.negate()),
  primary: 14 /* Home */,
  id: FIRST_COMPRESSED_FOLDER,
  handler: (accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const viewlet = paneCompositeService.getActivePaneComposite(0 /* Sidebar */);
    if (viewlet?.getId() !== VIEWLET_ID4) {
      return;
    }
    const explorer = viewlet.getViewPaneContainer();
    const view = explorer.getExplorerView();
    view.firstCompressedStat();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */ + 10,
  when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerCompressedFocusContext, ExplorerCompressedLastFocusContext.negate()),
  primary: 13 /* End */,
  id: LAST_COMPRESSED_FOLDER,
  handler: (accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const viewlet = paneCompositeService.getActivePaneComposite(0 /* Sidebar */);
    if (viewlet?.getId() !== VIEWLET_ID4) {
      return;
    }
    const explorer = viewlet.getViewPaneContainer();
    const view = explorer.getExplorerView();
    view.lastCompressedStat();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200 /* WorkbenchContrib */,
  when: null,
  primary: isWeb ? isWindows ? KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 44 /* KeyN */) : 2048 /* CtrlCmd */ | 512 /* Alt */ | 44 /* KeyN */ : 2048 /* CtrlCmd */ | 44 /* KeyN */,
  secondary: isWeb ? [2048 /* CtrlCmd */ | 44 /* KeyN */] : void 0,
  id: NEW_UNTITLED_FILE_COMMAND_ID,
  metadata: {
    description: NEW_UNTITLED_FILE_LABEL,
    args: [
      {
        isOptional: true,
        name: "New Untitled Text File arguments",
        description: "The editor view type or language ID if known",
        schema: {
          "type": "object",
          "properties": {
            "viewType": {
              "type": "string"
            },
            "languageId": {
              "type": "string"
            }
          }
        }
      }
    ]
  },
  handler: async (accessor, args2) => {
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({
      resource: void 0,
      options: {
        override: args2?.viewType,
        pinned: true
      },
      languageId: args2?.languageId
    });
  }
});

CommandsRegistry.registerCommand({
  id: NEW_FILE_COMMAND_ID,
  handler: async (accessor, args2) => {
    const editorService = accessor.get(IEditorService);
    const dialogService = accessor.get(IFileDialogService);
    const fileService = accessor.get(IFileService);
    const createFileLocalized = localize(15848, null);
    const defaultFileUri = joinPath(await dialogService.defaultFilePath(), args2?.fileName ?? "Untitled.txt");
    const saveUri = await dialogService.showSaveDialog({ saveLabel: createFileLocalized, title: createFileLocalized, defaultUri: defaultFileUri });
    if (!saveUri) {
      return;
    }
    await fileService.createFile(saveUri, void 0, { overwrite: true });
    await editorService.openEditor({
      resource: saveUri,
      options: {
        override: args2?.viewType,
        pinned: true
      },
      languageId: args2?.languageId
    });
  }
});
export { resourcesToClipboard, expandSideBySideEditor, getEditorsFromCommandArgs, saveSelectedEditors, saveDirtyEditorsOfGroups, doSaveEditors, openWindowCommand, newWindowCommand, COMPARE_WITH_SAVED_SCHEMA, providerDisposables, globalResourceToCompare, resourceSelectedForCompareContext, copyPathCommandHandler, copyRelativePathCommandHandler };
