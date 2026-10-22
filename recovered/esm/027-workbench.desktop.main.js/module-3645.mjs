// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localHistory/browser/localHistoryCommands.ts
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { LOCAL_HISTORY_ICON_RESTORE, LOCAL_HISTORY_MENU_CONTEXT_KEY, getLocalHistoryDateFormatter } from "./module-3644.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkingCopyHistoryService } from "./module-3642.mjs";
import { API_OPEN_DIFF_EDITOR_COMMAND_ID } from "./module-1538.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ActiveEditorContext, ResourceContextKey } from "./module-0949.mjs";
import { LocalHistoryFileSystemProvider } from "./module-3643.mjs";
import { basename2, basenameOrAuthority, dirname2 } from "./module-0034.mjs";
import { EditorResourceAccessor, SaveSourceRegistry } from "./module-0925.mjs";
import { IFileService } from "./module-0269.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { coalesce } from "./module-0007.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { Event2 } from "./module-0017.mjs";
import { IPathService } from "./module-0938.mjs";
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/localHistory/browser/localHistoryCommands.ts
var LOCAL_HISTORY_CATEGORY = localize2(16532, "Local History");

var CTX_LOCAL_HISTORY_ENABLED = ContextKeyExpr.has("config.workbench.localHistory.enabled");

var COMPARE_WITH_FILE_LABEL = localize2(16533, "Compare with File");

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.compareWithFile",
      title: COMPARE_WITH_FILE_LABEL,
      menu: {
        id: MenuId.TimelineItemContext,
        group: "1_compare",
        order: 1,
        when: LOCAL_HISTORY_MENU_CONTEXT_KEY
      }
    });
  }
  async run(accessor, item) {
    const commandService = accessor.get(ICommandService);
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
    if (entry) {
      return commandService.executeCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, ...toDiffEditorArguments(entry, entry.workingCopy.resource));
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.compareWithPrevious",
      title: localize2(16534, "Compare with Previous"),
      menu: {
        id: MenuId.TimelineItemContext,
        group: "1_compare",
        order: 2,
        when: LOCAL_HISTORY_MENU_CONTEXT_KEY
      }
    });
  }
  async run(accessor, item) {
    const commandService = accessor.get(ICommandService);
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const editorService = accessor.get(IEditorService);
    const { entry, previous } = await findLocalHistoryEntry(workingCopyHistoryService, item);
    if (entry) {
      if (!previous) {
        return openEntry(entry, editorService);
      }
      return commandService.executeCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, ...toDiffEditorArguments(previous, entry));
    }
  }
});

var itemSelectedForCompare = void 0;

var LocalHistoryItemSelectedForCompare = new RawContextKey("localHistoryItemSelectedForCompare", false, true);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.selectForCompare",
      title: localize2(16544, "Select for Compare"),
      menu: {
        id: MenuId.TimelineItemContext,
        group: "2_compare_with",
        order: 2,
        when: LOCAL_HISTORY_MENU_CONTEXT_KEY
      }
    });
  }
  async run(accessor, item) {
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const contextKeyService = accessor.get(IContextKeyService);
    const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
    if (entry) {
      itemSelectedForCompare = item;
      LocalHistoryItemSelectedForCompare.bindTo(contextKeyService).set(true);
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.compareWithSelected",
      title: localize2(16535, "Compare with Selected"),
      menu: {
        id: MenuId.TimelineItemContext,
        group: "2_compare_with",
        order: 1,
        when: ContextKeyExpr.and(LOCAL_HISTORY_MENU_CONTEXT_KEY, LocalHistoryItemSelectedForCompare)
      }
    });
  }
  async run(accessor, item) {
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const commandService = accessor.get(ICommandService);
    if (!itemSelectedForCompare) {
      return;
    }
    const selectedEntry = (await findLocalHistoryEntry(workingCopyHistoryService, itemSelectedForCompare)).entry;
    if (!selectedEntry) {
      return;
    }
    const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
    if (entry) {
      return commandService.executeCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, ...toDiffEditorArguments(selectedEntry, entry));
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.open",
      title: localize2(16539, "Show Contents"),
      menu: {
        id: MenuId.TimelineItemContext,
        group: "3_contents",
        order: 1,
        when: LOCAL_HISTORY_MENU_CONTEXT_KEY
      }
    });
  }
  async run(accessor, item) {
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const editorService = accessor.get(IEditorService);
    const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
    if (entry) {
      return openEntry(entry, editorService);
    }
  }
});

var RESTORE_CONTENTS_LABEL = localize2(16541, "Restore Contents");

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.restoreViaEditor",
      title: RESTORE_CONTENTS_LABEL,
      menu: {
        id: MenuId.EditorTitle,
        group: "navigation",
        order: -10,
        when: ResourceContextKey.Scheme.isEqualTo(LocalHistoryFileSystemProvider.SCHEMA)
      },
      icon: LOCAL_HISTORY_ICON_RESTORE
    });
  }
  async run(accessor, uri5) {
    const { associatedResource, location: location2 } = LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(uri5);
    return restore(accessor, { uri: associatedResource, handle: basenameOrAuthority(location2) });
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.restore",
      title: RESTORE_CONTENTS_LABEL,
      menu: {
        id: MenuId.TimelineItemContext,
        group: "3_contents",
        order: 2,
        when: LOCAL_HISTORY_MENU_CONTEXT_KEY
      }
    });
  }
  async run(accessor, item) {
    return restore(accessor, item);
  }
});

var restoreSaveSource = SaveSourceRegistry.registerSource("localHistoryRestore.source", localize(16548, null));

async function restore(accessor, item) {
  const fileService = accessor.get(IFileService);
  const dialogService = accessor.get(IDialogService);
  const workingCopyService = accessor.get(IWorkingCopyService);
  const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
  const editorService = accessor.get(IEditorService);
  const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
  if (entry) {
    const { confirmed } = await dialogService.confirm({
      type: "warning",
      message: localize(16527, null, basename2(entry.workingCopy.resource)),
      detail: localize(16526, null),
      primaryButton: localize(16551, null)
    });
    if (!confirmed) {
      return;
    }
    const workingCopies = workingCopyService.getAll(entry.workingCopy.resource);
    if (workingCopies) {
      for (const workingCopy of workingCopies) {
        if (workingCopy.isDirty()) {
          await workingCopy.revert({ soft: true });
        }
      }
    }
    try {
      await fileService.cloneFile(entry.location, entry.workingCopy.resource);
    } catch (error) {
      await dialogService.error(localize(16554, null, basename2(entry.workingCopy.resource)), toErrorMessage(error));
      return;
    }
    if (workingCopies) {
      for (const workingCopy of workingCopies) {
        await workingCopy.revert({ force: true });
      }
    }
    await editorService.openEditor({ resource: entry.workingCopy.resource });
    await workingCopyHistoryService.addEntry({
      resource: entry.workingCopy.resource,
      source: restoreSaveSource
    }, CancellationToken.None);
    await closeEntry(entry, editorService);
  }
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.restoreViaPicker",
      title: localize2(16542, "Find Entry to Restore"),
      f1: true,
      category: LOCAL_HISTORY_CATEGORY,
      precondition: CTX_LOCAL_HISTORY_ENABLED
    });
  }
  async run(accessor) {
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const quickInputService = accessor.get(IQuickInputService);
    const modelService = accessor.get(IModelService);
    const languageService = accessor.get(ILanguageService);
    const labelService = accessor.get(ILabelService);
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const commandService = accessor.get(ICommandService);
    const historyService = accessor.get(IHistoryService);
    const resourcePickerDisposables = new DisposableStore();
    const resourcePicker = resourcePickerDisposables.add(quickInputService.createQuickPick());
    let cts = new CancellationTokenSource();
    resourcePickerDisposables.add(resourcePicker.onDidHide(() => cts.dispose(true)));
    resourcePicker.busy = true;
    resourcePicker.show();
    const resources = new ResourceSet(await workingCopyHistoryService.getAll(cts.token));
    const recentEditorResources = new ResourceSet(coalesce(historyService.getHistory().map(({ resource: resource2 }) => resource2)));
    const resourcesSortedByRecency = [];
    for (const resource2 of recentEditorResources) {
      if (resources.has(resource2)) {
        resourcesSortedByRecency.push(resource2);
        resources.delete(resource2);
      }
    }
    resourcesSortedByRecency.push(...[...resources].sort((r1, r2) => r1.fsPath < r2.fsPath ? -1 : 1));
    resourcePicker.busy = false;
    resourcePicker.placeholder = localize(16553, null);
    resourcePicker.matchOnLabel = true;
    resourcePicker.matchOnDescription = true;
    resourcePicker.items = [...resourcesSortedByRecency].map((resource2) => ({
      resource: resource2,
      label: basenameOrAuthority(resource2),
      description: labelService.getUriLabel(dirname2(resource2), { relative: true }),
      iconClasses: getIconClasses(modelService, languageService, resource2)
    }));
    await Event2.toPromise(resourcePicker.onDidAccept);
    resourcePickerDisposables.dispose();
    const resource = resourcePicker.selectedItems.at(0)?.resource;
    if (!resource) {
      return;
    }
    const entryPickerDisposables = new DisposableStore();
    const entryPicker = entryPickerDisposables.add(quickInputService.createQuickPick());
    cts = new CancellationTokenSource();
    entryPickerDisposables.add(entryPicker.onDidHide(() => cts.dispose(true)));
    entryPicker.busy = true;
    entryPicker.show();
    const entries2 = await workingCopyHistoryService.getEntries(resource, cts.token);
    entryPicker.busy = false;
    entryPicker.canAcceptInBackground = true;
    entryPicker.placeholder = localize(16552, null);
    entryPicker.matchOnLabel = true;
    entryPicker.matchOnDescription = true;
    entryPicker.items = Array.from(entries2).reverse().map((entry) => ({
      entry,
      label: `$(circle-outline) ${SaveSourceRegistry.getSourceLabel(entry.source)}`,
      description: toLocalHistoryEntryDateLabel(entry.timestamp)
    }));
    entryPickerDisposables.add(entryPicker.onDidAccept(async (e) => {
      if (!e.inBackground) {
        entryPickerDisposables.dispose();
      }
      const selectedItem = entryPicker.selectedItems.at(0);
      if (!selectedItem) {
        return;
      }
      const resourceExists = await fileService.exists(selectedItem.entry.workingCopy.resource);
      if (resourceExists) {
        return commandService.executeCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, ...toDiffEditorArguments(selectedItem.entry, selectedItem.entry.workingCopy.resource, { preserveFocus: e.inBackground }));
      }
      return openEntry(selectedItem.entry, editorService, { preserveFocus: e.inBackground });
    }));
  }
});

MenuRegistry.appendMenuItem(MenuId.TimelineTitle, { command: { id: "workbench.action.localHistory.restoreViaPicker", title: localize2(16543, "Local History: Find Entry to Restore...") }, group: "submenu", order: 1, when: CTX_LOCAL_HISTORY_ENABLED });

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.rename",
      title: localize2(16540, "Rename"),
      menu: {
        id: MenuId.TimelineItemContext,
        group: "5_edit",
        order: 1,
        when: LOCAL_HISTORY_MENU_CONTEXT_KEY
      }
    });
  }
  async run(accessor, item) {
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const quickInputService = accessor.get(IQuickInputService);
    const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
    if (entry) {
      const disposables = new DisposableStore();
      const inputBox = disposables.add(quickInputService.createInputBox());
      inputBox.title = localize(16549, null);
      inputBox.ignoreFocusOut = true;
      inputBox.placeholder = localize(16550, null);
      inputBox.value = SaveSourceRegistry.getSourceLabel(entry.source);
      inputBox.show();
      disposables.add(inputBox.onDidAccept(() => {
        if (inputBox.value) {
          workingCopyHistoryService.updateEntry(entry, { source: inputBox.value }, CancellationToken.None);
        }
        disposables.dispose();
      }));
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.delete",
      title: localize2(16537, "Delete"),
      menu: {
        id: MenuId.TimelineItemContext,
        group: "5_edit",
        order: 2,
        when: LOCAL_HISTORY_MENU_CONTEXT_KEY
      }
    });
  }
  async run(accessor, item) {
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const editorService = accessor.get(IEditorService);
    const dialogService = accessor.get(IDialogService);
    const { entry } = await findLocalHistoryEntry(workingCopyHistoryService, item);
    if (entry) {
      const { confirmed } = await dialogService.confirm({
        type: "warning",
        message: localize(16525, null, entry.workingCopy.name, toLocalHistoryEntryDateLabel(entry.timestamp)),
        detail: localize(16524, null),
        primaryButton: localize(16531, null)
      });
      if (!confirmed) {
        return;
      }
      await workingCopyHistoryService.removeEntry(entry, CancellationToken.None);
      await closeEntry(entry, editorService);
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.deleteAll",
      title: localize2(16538, "Delete All"),
      f1: true,
      category: LOCAL_HISTORY_CATEGORY,
      precondition: CTX_LOCAL_HISTORY_ENABLED
    });
  }
  async run(accessor) {
    const dialogService = accessor.get(IDialogService);
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const { confirmed } = await dialogService.confirm({
      type: "warning",
      message: localize(16523, null),
      detail: localize(16522, null),
      primaryButton: localize(16530, null)
    });
    if (!confirmed) {
      return;
    }
    await workingCopyHistoryService.removeAll(CancellationToken.None);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.localHistory.create",
      title: localize2(16536, "Create Entry"),
      f1: true,
      category: LOCAL_HISTORY_CATEGORY,
      precondition: ContextKeyExpr.and(CTX_LOCAL_HISTORY_ENABLED, ActiveEditorContext)
    });
  }
  async run(accessor) {
    const workingCopyHistoryService = accessor.get(IWorkingCopyHistoryService);
    const quickInputService = accessor.get(IQuickInputService);
    const editorService = accessor.get(IEditorService);
    const labelService = accessor.get(ILabelService);
    const pathService = accessor.get(IPathService);
    const resource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    if (resource?.scheme !== pathService.defaultUriScheme && resource?.scheme !== Schemas.vscodeUserData) {
      return;
    }
    const disposables = new DisposableStore();
    const inputBox = disposables.add(quickInputService.createInputBox());
    inputBox.title = localize(16528, null);
    inputBox.ignoreFocusOut = true;
    inputBox.placeholder = localize(16529, null, labelService.getUriBasenameLabel(resource));
    inputBox.show();
    disposables.add(inputBox.onDidAccept(async () => {
      const entrySource = inputBox.value;
      disposables.dispose();
      if (entrySource) {
        await workingCopyHistoryService.addEntry({ resource, source: inputBox.value }, CancellationToken.None);
      }
    }));
  }
});

async function openEntry(entry, editorService, options3) {
  const resource = LocalHistoryFileSystemProvider.toLocalHistoryFileSystem({ location: entry.location, associatedResource: entry.workingCopy.resource });
  await editorService.openEditor({
    resource,
    label: localize(16547, null, entry.workingCopy.name, SaveSourceRegistry.getSourceLabel(entry.source), toLocalHistoryEntryDateLabel(entry.timestamp)),
    options: options3
  });
}

async function closeEntry(entry, editorService) {
  const resource = LocalHistoryFileSystemProvider.toLocalHistoryFileSystem({ location: entry.location, associatedResource: entry.workingCopy.resource });
  const editors = editorService.findEditors(resource, { supportSideBySide: 4 /* ANY */ });
  await editorService.closeEditors(editors, { preserveFocus: true });
}

function toDiffEditorArguments(arg1, arg2, options3) {
  const originalResource = LocalHistoryFileSystemProvider.toLocalHistoryFileSystem({ location: arg1.location, associatedResource: arg1.workingCopy.resource });
  let label3;
  let modifiedResource;
  if (URI.isUri(arg2)) {
    const resource = arg2;
    modifiedResource = resource;
    label3 = localize(16545, null, arg1.workingCopy.name, SaveSourceRegistry.getSourceLabel(arg1.source), toLocalHistoryEntryDateLabel(arg1.timestamp), arg1.workingCopy.name);
  } else {
    const modified = arg2;
    modifiedResource = LocalHistoryFileSystemProvider.toLocalHistoryFileSystem({ location: modified.location, associatedResource: modified.workingCopy.resource });
    label3 = localize(16546, null, arg1.workingCopy.name, SaveSourceRegistry.getSourceLabel(arg1.source), toLocalHistoryEntryDateLabel(arg1.timestamp), modified.workingCopy.name, SaveSourceRegistry.getSourceLabel(modified.source), toLocalHistoryEntryDateLabel(modified.timestamp));
  }
  return [
    originalResource,
    modifiedResource,
    label3,
    options3 ? [void 0, options3] : void 0
  ];
}

async function findLocalHistoryEntry(workingCopyHistoryService, descriptor) {
  let uri5 = descriptor.uri;
  if (uri5.scheme === LocalHistoryFileSystemProvider.SCHEMA) {
    uri5 = LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(uri5).associatedResource;
  }
  const entries2 = await workingCopyHistoryService.getEntries(uri5, CancellationToken.None);
  let currentEntry = void 0;
  let previousEntry = void 0;
  for (let i2 = 0; i2 < entries2.length; i2++) {
    const entry = entries2[i2];
    if (entry.id === descriptor.handle) {
      currentEntry = entry;
      previousEntry = entries2[i2 - 1];
      break;
    }
  }
  return {
    entry: currentEntry,
    previous: previousEntry
  };
}

var SEP = /\//g;

function toLocalHistoryEntryDateLabel(timestamp) {
  return `${getLocalHistoryDateFormatter().format(timestamp).replace(SEP, "-")}`;
}
export { restore, openEntry, closeEntry, toDiffEditorArguments, findLocalHistoryEntry, toLocalHistoryEntryDateLabel, LOCAL_HISTORY_CATEGORY, CTX_LOCAL_HISTORY_ENABLED, COMPARE_WITH_FILE_LABEL, itemSelectedForCompare, LocalHistoryItemSelectedForCompare, RESTORE_CONTENTS_LABEL, restoreSaveSource, SEP };
