// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/fileActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { OS, isWindows } from "./module-0014.mjs";
import { basename2, basenameOrAuthority, distinctParents, isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { ResourceFileEdit } from "./module-0537.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { IDialogService, getFileNamesMessage } from "./module-0267.mjs";
import { basename, extname, isAbsolute } from "./module-0026.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Action2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { ActiveEditorCanToggleReadonlyContext, ActiveEditorContext, EmptyWorkspaceSupportContext, IsSessionsWindowContext } from "./module-0950.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { URI } from "./module-0032.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { Action } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { NEW_UNTITLED_FILE_COMMAND_ID, REVEAL_IN_EXPLORER_COMMAND_ID, SAVE_ALL_IN_GROUP_COMMAND_ID } from "./module-1994.mjs";
import { CLOSE_EDITORS_AND_GROUP_COMMAND_ID } from "./module-1530.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { VIEWLET_ID4, VIEW_ID2 } from "./module-1534.mjs";
import { IHostService } from "./module-1118.mjs";
import { IFileService } from "./module-0269.mjs";
import { coalesce } from "./module-0007.mjs";
import { rtrim, trim } from "./module-0030.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Schemas } from "./module-0033.mjs";
import { dispose } from "./module-0012.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { IExplorerService } from "./module-1997.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IPathService } from "./module-0939.mjs";
import { timeout } from "./module-0036.mjs";
import { NewExplorerItem } from "./module-1996.mjs";
import { IWorkingCopyFileService } from "./module-1076.mjs";
import { BrowserFileUpload, FileDownload } from "./module-1998.mjs";
import { triggerUpload } from "./module-0075.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { getPathForFile } from "./module-0273.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { getErrorMessage } from "./module-0004.mjs";


// src/vs/workbench/contrib/files/browser/fileActions.ts
var NEW_FILE_COMMAND_ID2 = "explorer.newFile";

var NEW_FILE_LABEL = localize2(15774, "New File...");

var NEW_FOLDER_COMMAND_ID = "explorer.newFolder";

var NEW_FOLDER_LABEL = localize2(15775, "New Folder...");

var TRIGGER_RENAME_LABEL = localize(15784, null);

var MOVE_FILE_TO_TRASH_LABEL = localize(15743, null);

var COPY_FILE_LABEL = localize(15737, null);

var PASTE_FILE_LABEL = localize(15780, null);

var FileCopiedContext = new RawContextKey("fileCopied", false);

var DOWNLOAD_COMMAND_ID = "explorer.download";

var DOWNLOAD_LABEL = localize(15758, null);

var UPLOAD_COMMAND_ID = "explorer.upload";

var UPLOAD_LABEL = localize(15806, null);

var CONFIRM_DELETE_SETTING_KEY = "explorer.confirmDelete";

var MAX_UNDO_FILE_SIZE = 5e6;

async function refreshIfSeparator(value2, explorerService) {
  if (value2 && (value2.indexOf("/") >= 0 || value2.indexOf("\\") >= 0)) {
    await explorerService.refresh();
  }
}

async function deleteFiles(explorerService, workingCopyFileService, dialogService, configurationService, filesConfigurationService, elements, useTrash, skipConfirm = false, ignoreIfNotExists = false) {
  let primaryButton;
  if (useTrash) {
    primaryButton = isWindows ? localize(15746, null) : localize(15747, null);
  } else {
    primaryButton = localize(15745, null);
  }
  const distinctElements = distinctParents(elements, (e4) => e4.resource);
  const dirtyWorkingCopies = /* @__PURE__ */ new Set();
  for (const distinctElement of distinctElements) {
    for (const dirtyWorkingCopy of workingCopyFileService.getDirty(distinctElement.resource)) {
      dirtyWorkingCopies.add(dirtyWorkingCopy);
    }
  }
  if (dirtyWorkingCopies.size) {
    let message;
    if (distinctElements.length > 1) {
      message = localize(15753, null);
    } else if (distinctElements[0].isDirectory) {
      if (dirtyWorkingCopies.size === 1) {
        message = localize(15755, null, distinctElements[0].name);
      } else {
        message = localize(15754, null, distinctElements[0].name, dirtyWorkingCopies.size);
      }
    } else {
      message = localize(15752, null, distinctElements[0].name);
    }
    const response = await dialogService.confirm({
      type: "warning",
      message,
      detail: localize(15756, null),
      primaryButton
    });
    if (!response.confirmed) {
      return;
    } else {
      skipConfirm = true;
    }
  }
  if (!skipConfirm) {
    const readonlyResources = distinctElements.filter((e4) => filesConfigurationService.isReadonly(e4.resource));
    if (readonlyResources.length) {
      let message;
      if (readonlyResources.length > 1) {
        message = localize(15781, null);
      } else if (readonlyResources[0].isDirectory) {
        message = localize(15783, null, distinctElements[0].name);
      } else {
        message = localize(15782, null, distinctElements[0].name);
      }
      const response = await dialogService.confirm({
        type: "warning",
        message,
        detail: localize(15735, null),
        primaryButton: localize(15734, null)
      });
      if (!response.confirmed) {
        return;
      }
    }
  }
  let confirmation;
  const deleteDetail = distinctElements.some((e4) => e4.isDirectory) ? localize(15769, null) : distinctElements.length > 1 ? localize(15790, null) : localize(15789, null);
  if (skipConfirm || configurationService.getValue(CONFIRM_DELETE_SETTING_KEY) === false) {
    confirmation = { confirmed: true };
  } else if (useTrash) {
    let { message, detail: detail2 } = getMoveToTrashMessage(distinctElements);
    detail2 += detail2 ? "\n" : "";
    if (isWindows) {
      detail2 += distinctElements.length > 1 ? localize(15803, null) : localize(15802, null);
    } else {
      detail2 += distinctElements.length > 1 ? localize(15805, null) : localize(15804, null);
    }
    confirmation = await dialogService.confirm({
      message,
      detail: detail2,
      primaryButton,
      checkbox: {
        label: localize(15757, null)
      }
    });
  } else {
    let { message, detail: detail2 } = getDeleteMessage(distinctElements);
    detail2 += detail2 ? "\n" : "";
    detail2 += deleteDetail;
    confirmation = await dialogService.confirm({
      type: "warning",
      message,
      detail: detail2,
      primaryButton
    });
  }
  if (confirmation.confirmed && confirmation.checkboxChecked === true) {
    await configurationService.updateValue(CONFIRM_DELETE_SETTING_KEY, false);
  }
  if (!confirmation.confirmed) {
    return;
  }
  try {
    const resourceFileEdits = distinctElements.map((e4) => new ResourceFileEdit(e4.resource, void 0, { recursive: true, folder: e4.isDirectory, ignoreIfNotExists, skipTrashBin: !useTrash, maxSize: MAX_UNDO_FILE_SIZE }));
    const options3 = {
      undoLabel: distinctElements.length > 1 ? localize(15744, null, distinctElements.length) : localize(15748, null, distinctElements[0].name),
      progressLabel: distinctElements.length > 1 ? localize(15750, null, distinctElements.length) : localize(15751, null, distinctElements[0].name)
    };
    await explorerService.applyBulkEdit(resourceFileEdits, options3);
  } catch (error) {
    let errorMessage;
    let detailMessage;
    let primaryButton2;
    if (useTrash) {
      errorMessage = isWindows ? localize(15713, null) : localize(15801, null);
      detailMessage = deleteDetail;
      primaryButton2 = localize(15749, null);
    } else {
      errorMessage = toErrorMessage(error, false);
      primaryButton2 = localize(15792, null);
    }
    const res = await dialogService.confirm({
      type: "warning",
      message: errorMessage,
      detail: detailMessage,
      primaryButton: primaryButton2
    });
    if (res.confirmed) {
      if (useTrash) {
        useTrash = false;
      }
      skipConfirm = true;
      ignoreIfNotExists = true;
      return deleteFiles(explorerService, workingCopyFileService, dialogService, configurationService, filesConfigurationService, elements, useTrash, skipConfirm, ignoreIfNotExists);
    }
  }
}

function getMoveToTrashMessage(distinctElements) {
  if (containsBothDirectoryAndFile(distinctElements)) {
    return {
      message: localize(15727, null, distinctElements.length),
      detail: getFileNamesMessage(distinctElements.map((e4) => e4.resource))
    };
  }
  if (distinctElements.length > 1) {
    if (distinctElements[0].isDirectory) {
      return {
        message: localize(15730, null, distinctElements.length),
        detail: getFileNamesMessage(distinctElements.map((e4) => e4.resource))
      };
    }
    return {
      message: localize(15729, null, distinctElements.length),
      detail: getFileNamesMessage(distinctElements.map((e4) => e4.resource))
    };
  }
  if (distinctElements[0].isDirectory && !distinctElements[0].isSymbolicLink) {
    return { message: localize(15728, null, distinctElements[0].name), detail: "" };
  }
  return { message: localize(15726, null, distinctElements[0].name), detail: "" };
}

function getDeleteMessage(distinctElements) {
  if (containsBothDirectoryAndFile(distinctElements)) {
    return {
      message: localize(15722, null, distinctElements.length),
      detail: getFileNamesMessage(distinctElements.map((e4) => e4.resource))
    };
  }
  if (distinctElements.length > 1) {
    if (distinctElements[0].isDirectory) {
      return {
        message: localize(15725, null, distinctElements.length),
        detail: getFileNamesMessage(distinctElements.map((e4) => e4.resource))
      };
    }
    return {
      message: localize(15724, null, distinctElements.length),
      detail: getFileNamesMessage(distinctElements.map((e4) => e4.resource))
    };
  }
  if (distinctElements[0].isDirectory) {
    return { message: localize(15723, null, distinctElements[0].name), detail: "" };
  }
  return { message: localize(15721, null, distinctElements[0].name), detail: "" };
}

function containsBothDirectoryAndFile(distinctElements) {
  const directory = distinctElements.find((element) => element.isDirectory);
  const file = distinctElements.find((element) => !element.isDirectory);
  return !!directory && !!file;
}

async function findValidPasteFileTarget(explorerService, fileService, dialogService, targetFolder, fileToPaste, incrementalNaming) {
  let name = typeof fileToPaste.resource === "string" ? fileToPaste.resource : basenameOrAuthority(fileToPaste.resource);
  let candidate = joinPath(targetFolder.resource, name);
  if (incrementalNaming === "disabled") {
    const canOverwrite = await askForOverwrite(fileService, dialogService, candidate);
    if (!canOverwrite) {
      return;
    }
  }
  while (!fileToPaste.allowOverwrite) {
    if (!explorerService.findClosest(candidate)) {
      break;
    }
    if (incrementalNaming !== "disabled") {
      name = incrementFileName(name, !!fileToPaste.isDirectory, incrementalNaming);
    }
    candidate = joinPath(targetFolder.resource, name);
  }
  return candidate;
}

function incrementFileName(name, isFolder, incrementalNaming) {
  if (incrementalNaming === "simple") {
    let namePrefix = name;
    let extSuffix = "";
    if (!isFolder) {
      extSuffix = extname(name);
      namePrefix = basename(name, extSuffix);
    }
    const suffixRegex = /^(.+ copy)( \d+)?$/;
    if (suffixRegex.test(namePrefix)) {
      return namePrefix.replace(suffixRegex, (match2, g1, g2) => {
        const number = g2 ? parseInt(g2) : 1;
        return number === 0 ? `${g1}` : number < 1073741824 /* MAX_SAFE_SMALL_INTEGER */ ? `${g1} ${number + 1}` : `${g1}${g2} copy`;
      }) + extSuffix;
    }
    return `${namePrefix} copy${extSuffix}`;
  }
  const separators = "[\\.\\-_]";
  const maxNumber = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
  const suffixFileRegex = RegExp("(.*" + separators + ")(\\d+)(\\..*)$");
  if (!isFolder && name.match(suffixFileRegex)) {
    return name.replace(suffixFileRegex, (match2, g1, g2, g3) => {
      const number = parseInt(g2);
      return number < maxNumber ? g1 + String(number + 1).padStart(g2.length, "0") + g3 : `${g1}${g2}.1${g3}`;
    });
  }
  const prefixFileRegex = RegExp("(\\d+)(" + separators + ".*)(\\..*)$");
  if (!isFolder && name.match(prefixFileRegex)) {
    return name.replace(prefixFileRegex, (match2, g1, g2, g3) => {
      const number = parseInt(g1);
      return number < maxNumber ? String(number + 1).padStart(g1.length, "0") + g2 + g3 : `${g1}${g2}.1${g3}`;
    });
  }
  const prefixFileNoNameRegex = RegExp("(\\d+)(\\..*)$");
  if (!isFolder && name.match(prefixFileNoNameRegex)) {
    return name.replace(prefixFileNoNameRegex, (match2, g1, g2) => {
      const number = parseInt(g1);
      return number < maxNumber ? String(number + 1).padStart(g1.length, "0") + g2 : `${g1}.1${g2}`;
    });
  }
  const lastIndexOfDot = name.lastIndexOf(".");
  if (!isFolder && lastIndexOfDot >= 0) {
    return `${name.substr(0, lastIndexOfDot)}.1${name.substr(lastIndexOfDot)}`;
  }
  const noNameNoExtensionRegex = RegExp("(\\d+)$");
  if (!isFolder && lastIndexOfDot === -1 && name.match(noNameNoExtensionRegex)) {
    return name.replace(noNameNoExtensionRegex, (match2, g1) => {
      const number = parseInt(g1);
      return number < maxNumber ? String(number + 1).padStart(g1.length, "0") : `${g1}.1`;
    });
  }
  const noExtensionRegex = RegExp("(.*)(\\d*)$");
  if (!isFolder && lastIndexOfDot === -1 && name.match(noExtensionRegex)) {
    return name.replace(noExtensionRegex, (match2, g1, g2) => {
      let number = parseInt(g2);
      if (isNaN(number)) {
        number = 0;
      }
      return number < maxNumber ? g1 + String(number + 1).padStart(g2.length, "0") : `${g1}${g2}.1`;
    });
  }
  if (isFolder && name.match(/(\d+)$/)) {
    return name.replace(/(\d+)$/, (match2, ...groups) => {
      const number = parseInt(groups[0]);
      return number < maxNumber ? String(number + 1).padStart(groups[0].length, "0") : `${groups[0]}.1`;
    });
  }
  if (isFolder && name.match(/^(\d+)/)) {
    return name.replace(/^(\d+)(.*)$/, (match2, ...groups) => {
      const number = parseInt(groups[0]);
      return number < maxNumber ? String(number + 1).padStart(groups[0].length, "0") + groups[1] : `${groups[0]}${groups[1]}.1`;
    });
  }
  return `${name}.1`;
}

async function askForOverwrite(fileService, dialogService, targetResource) {
  const exists = await fileService.exists(targetResource);
  if (!exists) {
    return true;
  }
  const { confirmed } = await dialogService.confirm({
    type: Severity2.Warning,
    message: localize(15732, null, basename(targetResource.path)),
    primaryButton: localize(15787, null)
  });
  return confirmed;
}

var GlobalCompareResourcesAction = class _GlobalCompareResourcesAction extends Action2 {
  static {
    this.ID = "workbench.files.action.compareFileWith";
  }
  static {
    this.LABEL = localize2(15767, "Compare Active File With...");
  }
  constructor() {
    super({
      id: _GlobalCompareResourcesAction.ID,
      title: _GlobalCompareResourcesAction.LABEL,
      f1: true,
      category: Categories.File,
      precondition: ContextKeyExpr.and(ActiveEditorContext, IsSessionsWindowContext.negate()),
      metadata: {
        description: localize2(15716, "Opens a picker to select a file to diff with the active editor.")
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const textModelService = accessor.get(ITextModelService);
    const quickInputService = accessor.get(IQuickInputService);
    const activeInput = editorService.activeEditor;
    const activeResource = EditorResourceAccessor.getOriginalUri(activeInput);
    if (activeResource && textModelService.canHandleResource(activeResource)) {
      const picks = await quickInputService.quickAccess.pick("", { itemActivation: 2 /* SECOND */ });
      if (picks?.length === 1) {
        const resource = picks[0].resource;
        if (URI.isUri(resource) && textModelService.canHandleResource(resource)) {
          editorService.openEditor({
            original: { resource: activeResource },
            modified: { resource },
            options: { pinned: true }
          });
        }
      }
    }
  }
};

var ToggleAutoSaveAction = class _ToggleAutoSaveAction extends Action2 {
  static {
    this.ID = "workbench.action.toggleAutoSave";
  }
  constructor() {
    super({
      id: _ToggleAutoSaveAction.ID,
      title: localize2(15799, "Toggle Auto Save"),
      f1: true,
      category: Categories.File,
      precondition: IsSessionsWindowContext.negate(),
      metadata: { description: localize2(15800, "Toggle the ability to save files automatically after typing") }
    });
  }
  run(accessor) {
    const filesConfigurationService = accessor.get(IFilesConfigurationService);
    return filesConfigurationService.toggleAutoSave();
  }
};

var BaseSaveAllAction = class extends Action {
  constructor(id2, label3, commandService, notificationService, workingCopyService) {
    super(id2, label3);
    this.commandService = commandService;
    this.notificationService = notificationService;
    this.workingCopyService = workingCopyService;
    this.lastDirtyState = this.workingCopyService.hasDirty;
    this.enabled = this.lastDirtyState;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.workingCopyService.onDidChangeDirty((workingCopy) => this.updateEnablement(workingCopy)));
  }
  updateEnablement(workingCopy) {
    const hasDirty = workingCopy.isDirty() || this.workingCopyService.hasDirty;
    if (this.lastDirtyState !== hasDirty) {
      this.enabled = hasDirty;
      this.lastDirtyState = this.enabled;
    }
  }
  async run(context2) {
    try {
      await this.doRun(context2);
    } catch (error) {
      this.notificationService.error(toErrorMessage(error, false));
    }
  }
};

BaseSaveAllAction = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IWorkingCopyService)
], BaseSaveAllAction);

var SaveAllInGroupAction = class extends BaseSaveAllAction {
  static {
    this.ID = "workbench.files.action.saveAllInGroup";
  }
  static {
    this.LABEL = localize(15793, null);
  }
  get class() {
    return "explorer-action " + ThemeIcon.asClassName(Codicon.saveAll);
  }
  doRun(context2) {
    return this.commandService.executeCommand(SAVE_ALL_IN_GROUP_COMMAND_ID, {}, context2);
  }
};

var CloseGroupAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3, ThemeIcon.asClassName(Codicon.closeAll));
    this.commandService = commandService;
  }
  static {
    this.ID = "workbench.files.action.closeGroup";
  }
  static {
    this.LABEL = localize(15715, null);
  }
  run(context2) {
    return this.commandService.executeCommand(CLOSE_EDITORS_AND_GROUP_COMMAND_ID, {}, context2);
  }
};

CloseGroupAction = __decorateClass([
  __decorateParam(2, ICommandService)
], CloseGroupAction);

var FocusFilesExplorer = class _FocusFilesExplorer extends Action2 {
  static {
    this.ID = "workbench.files.action.focusFilesExplorer";
  }
  static {
    this.LABEL = localize2(15765, "Focus on Files Explorer");
  }
  constructor() {
    super({
      id: _FocusFilesExplorer.ID,
      title: _FocusFilesExplorer.LABEL,
      f1: true,
      category: Categories.File,
      precondition: IsSessionsWindowContext.negate(),
      metadata: {
        description: localize2(15766, "Moves focus to the file explorer view container.")
      }
    });
  }
  async run(accessor) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    await paneCompositeService.openPaneComposite(VIEWLET_ID4, 0 /* Sidebar */, true);
  }
};

var ShowActiveFileInExplorer = class _ShowActiveFileInExplorer extends Action2 {
  static {
    this.ID = "workbench.files.action.showActiveFileInExplorer";
  }
  static {
    this.LABEL = localize2(15796, "Reveal Active File in Explorer View");
  }
  constructor() {
    super({
      id: _ShowActiveFileInExplorer.ID,
      title: _ShowActiveFileInExplorer.LABEL,
      f1: true,
      category: Categories.File,
      precondition: IsSessionsWindowContext.negate(),
      metadata: {
        description: localize2(15797, "Reveals and selects the active file within the explorer view.")
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const editorService = accessor.get(IEditorService);
    const resource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    if (resource) {
      commandService.executeCommand(REVEAL_IN_EXPLORER_COMMAND_ID, resource);
    }
  }
};

var OpenActiveFileInEmptyWorkspace = class _OpenActiveFileInEmptyWorkspace extends Action2 {
  static {
    this.ID = "workbench.action.files.showOpenedFileInNewWindow";
  }
  static {
    this.LABEL = localize2(15776, "Open Active Editor in New Empty Workspace");
  }
  constructor() {
    super({
      id: _OpenActiveFileInEmptyWorkspace.ID,
      title: _OpenActiveFileInEmptyWorkspace.LABEL,
      f1: true,
      category: Categories.File,
      precondition: ContextKeyExpr.and(EmptyWorkspaceSupportContext, IsSessionsWindowContext.negate()),
      metadata: {
        description: localize2(15777, "Opens the active editor in a new window with no folders open.")
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const hostService = accessor.get(IHostService);
    const dialogService = accessor.get(IDialogService);
    const fileService = accessor.get(IFileService);
    const fileResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    if (fileResource && fileService.hasProvider(fileResource)) {
      hostService.openWindow([{ fileUri: fileResource }], { forceNewWindow: true });
    } else {
      dialogService.error(localize(15778, null));
    }
  }
};

function validateFileName(pathService, item, name, os) {
  name = getWellFormedFileName(name);
  if (!name || name.length === 0 || /^\s+$/.test(name)) {
    return {
      content: localize(15759, null),
      severity: Severity2.Error
    };
  }
  if (name[0] === "/" || name[0] === "\\") {
    return {
      content: localize(15763, null),
      severity: Severity2.Error
    };
  }
  const names = coalesce(name.split(/[\\/]/));
  const parent = item.parent;
  if (name !== item.name) {
    const child = parent?.getChild(name);
    if (child && child !== item) {
      return {
        content: localize(15762, null, name),
        severity: Severity2.Error
      };
    }
  }
  if (names.some((folderName) => !pathService.hasValidBasename(item.resource, os, folderName))) {
    const escapedName = name.replace(/\*/g, "\\*");
    return {
      content: localize(15768, null, trimLongName(escapedName)),
      severity: Severity2.Error
    };
  }
  if (names.some((name2) => /^\s|\s$/.test(name2))) {
    return {
      content: localize(15764, null),
      severity: Severity2.Warning
    };
  }
  return null;
}

function trimLongName(name) {
  if (name?.length > 255) {
    return `${name.substr(0, 255)}...`;
  }
  return name;
}

function getWellFormedFileName(filename) {
  if (!filename) {
    return filename;
  }
  filename = trim(filename, "	");
  filename = rtrim(filename, "/");
  filename = rtrim(filename, "\\");
  return filename;
}

var CompareNewUntitledTextFilesAction = class _CompareNewUntitledTextFilesAction extends Action2 {
  static {
    this.ID = "workbench.files.action.compareNewUntitledTextFiles";
  }
  static {
    this.LABEL = localize2(15717, "Compare New Untitled Text Files");
  }
  constructor() {
    super({
      id: _CompareNewUntitledTextFilesAction.ID,
      title: _CompareNewUntitledTextFilesAction.LABEL,
      f1: true,
      category: Categories.File,
      precondition: IsSessionsWindowContext.negate(),
      metadata: {
        description: localize2(15718, "Opens a new diff editor with two untitled files.")
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({
      original: { resource: void 0 },
      modified: { resource: void 0 },
      options: { pinned: true }
    });
  }
};

var CompareWithClipboardAction = class _CompareWithClipboardAction extends Action2 {
  static {
    this.ID = "workbench.files.action.compareWithClipboard";
  }
  static {
    this.LABEL = localize2(15719, "Compare Active File with Clipboard");
  }
  static {
    this.SCHEME_COUNTER = 0;
  }
  constructor() {
    super({
      id: _CompareWithClipboardAction.ID,
      title: _CompareWithClipboardAction.LABEL,
      f1: true,
      category: Categories.File,
      precondition: IsSessionsWindowContext.negate(),
      keybinding: { primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 33 /* KeyC */), weight: 200 /* WorkbenchContrib */ },
      metadata: {
        description: localize2(15720, "Opens a new diff editor to compare the active file with the contents of the clipboard.")
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const instantiationService = accessor.get(IInstantiationService);
    const textModelService = accessor.get(ITextModelService);
    const fileService = accessor.get(IFileService);
    const resource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    const scheme = `clipboardCompare${_CompareWithClipboardAction.SCHEME_COUNTER++}`;
    if (resource && (fileService.hasProvider(resource) || resource.scheme === Schemas.untitled)) {
      if (!this.registrationDisposal) {
        const provider = instantiationService.createInstance(ClipboardContentProvider);
        this.registrationDisposal = textModelService.registerTextModelContentProvider(scheme, provider);
      }
      const name = basename2(resource);
      const editorLabel = localize(15714, null, name);
      await editorService.openEditor({
        original: { resource: resource.with({ scheme }) },
        modified: { resource },
        label: editorLabel,
        options: { pinned: true }
      }).finally(() => {
        dispose(this.registrationDisposal);
        this.registrationDisposal = void 0;
      });
    }
  }
  dispose() {
    dispose(this.registrationDisposal);
    this.registrationDisposal = void 0;
  }
};

var ClipboardContentProvider = class {
  constructor(clipboardService, languageService, modelService) {
    this.clipboardService = clipboardService;
    this.languageService = languageService;
    this.modelService = modelService;
  }
  async provideTextContent(resource) {
    const text2 = await this.clipboardService.readText();
    const model = this.modelService.createModel(text2, this.languageService.createByFilepathOrFirstLine(resource), resource);
    return model;
  }
};

ClipboardContentProvider = __decorateClass([
  __decorateParam(0, IClipboardService),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IModelService)
], ClipboardContentProvider);

function onErrorWithRetry(notificationService, error, retry2) {
  notificationService.prompt(
    Severity2.Error,
    toErrorMessage(error, false),
    [{
      label: localize(15791, null),
      run: () => retry2()
    }]
  );
}

async function openExplorerAndCreate(accessor, isFolder) {
  const explorerService = accessor.get(IExplorerService);
  const fileService = accessor.get(IFileService);
  const configService = accessor.get(IConfigurationService);
  const filesConfigService = accessor.get(IFilesConfigurationService);
  const editorService = accessor.get(IEditorService);
  const viewsService = accessor.get(IViewsService);
  const notificationService = accessor.get(INotificationService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const commandService = accessor.get(ICommandService);
  const pathService = accessor.get(IPathService);
  const explorerViewId = explorerService.getViewId() ?? VIEW_ID2;
  const wasHidden = !viewsService.isViewVisible(explorerViewId);
  const view = await viewsService.openView(explorerViewId, true);
  if (wasHidden) {
    await timeout(500);
  }
  if (!view) {
    if (isFolder) {
      throw new Error("Open a folder or workspace first.");
    }
    return commandService.executeCommand(NEW_UNTITLED_FILE_COMMAND_ID);
  }
  const stats = explorerService.getContext(false);
  const stat = stats.length > 0 ? stats[0] : void 0;
  let folder;
  if (stat) {
    folder = stat.isDirectory ? stat : stat.parent || explorerService.roots[0];
  } else {
    folder = explorerService.roots[0];
  }
  if (folder.isReadonly) {
    throw new Error("Parent folder is readonly.");
  }
  const newStat = new NewExplorerItem(fileService, configService, filesConfigService, folder, isFolder);
  folder.addChild(newStat);
  const onSuccess = async (value2) => {
    try {
      const resourceToCreate = joinPath(folder.resource, value2);
      if (value2.endsWith("/")) {
        isFolder = true;
      }
      await explorerService.applyBulkEdit([new ResourceFileEdit(void 0, resourceToCreate, { folder: isFolder })], {
        undoLabel: localize(15741, null, value2),
        progressLabel: localize(15742, null, value2),
        confirmBeforeUndo: true
      });
      await refreshIfSeparator(value2, explorerService);
      if (isFolder) {
        await explorerService.select(resourceToCreate, true);
      } else {
        await editorService.openEditor({ resource: resourceToCreate, options: { pinned: true } });
      }
    } catch (error) {
      onErrorWithRetry(notificationService, error, () => onSuccess(value2));
    }
  };
  const os = (await remoteAgentService.getEnvironment())?.os ?? OS;
  await explorerService.setEditable(newStat, {
    validationMessage: (value2) => validateFileName(pathService, newStat, value2, os),
    onFinish: async (value2, success) => {
      folder.removeChild(newStat);
      await explorerService.setEditable(newStat, null);
      if (success) {
        onSuccess(value2);
      }
    }
  });
}

CommandsRegistry.registerCommand({
  id: NEW_FILE_COMMAND_ID2,
  handler: async (accessor) => {
    await openExplorerAndCreate(accessor, false);
  }
});

CommandsRegistry.registerCommand({
  id: NEW_FOLDER_COMMAND_ID,
  handler: async (accessor) => {
    await openExplorerAndCreate(accessor, true);
  }
});

var renameHandler = async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const notificationService = accessor.get(INotificationService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const pathService = accessor.get(IPathService);
  const configurationService = accessor.get(IConfigurationService);
  const stats = explorerService.getContext(false);
  const stat = stats.length > 0 ? stats[0] : void 0;
  if (!stat) {
    return;
  }
  const os = (await remoteAgentService.getEnvironment())?.os ?? OS;
  await explorerService.setEditable(stat, {
    validationMessage: (value2) => validateFileName(pathService, stat, value2, os),
    onFinish: async (value2, success) => {
      if (success) {
        const parentResource = stat.parent.resource;
        const targetResource = joinPath(parentResource, value2);
        if (stat.resource.toString() !== targetResource.toString()) {
          try {
            await explorerService.applyBulkEdit([new ResourceFileEdit(stat.resource, targetResource)], {
              confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === "verbose" /* Verbose */,
              undoLabel: localize(15785, null, stat.name, value2),
              progressLabel: localize(15786, null, stat.name, value2)
            });
            await refreshIfSeparator(value2, explorerService);
          } catch (e4) {
            notificationService.error(e4);
          }
        }
      }
      await explorerService.setEditable(stat, null);
    }
  });
};

var moveFileToTrashHandler = async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true).filter((s) => !s.isRoot);
  if (stats.length) {
    await deleteFiles(accessor.get(IExplorerService), accessor.get(IWorkingCopyFileService), accessor.get(IDialogService), accessor.get(IConfigurationService), accessor.get(IFilesConfigurationService), stats, true);
  }
};

var deleteFileHandler = async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true).filter((s) => !s.isRoot);
  if (stats.length) {
    await deleteFiles(accessor.get(IExplorerService), accessor.get(IWorkingCopyFileService), accessor.get(IDialogService), accessor.get(IConfigurationService), accessor.get(IFilesConfigurationService), stats, false);
  }
};

var pasteShouldMove = false;

var copyFileHandler = async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true);
  if (stats.length > 0) {
    await explorerService.setToCopy(stats, false);
    pasteShouldMove = false;
  }
};

var cutFileHandler = async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true);
  if (stats.length > 0) {
    await explorerService.setToCopy(stats, true);
    pasteShouldMove = true;
  }
};

var downloadFileHandler = async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const notificationService = accessor.get(INotificationService);
  const instantiationService = accessor.get(IInstantiationService);
  const context2 = explorerService.getContext(true);
  const explorerItems = context2.length ? context2 : explorerService.roots;
  const downloadHandler = instantiationService.createInstance(FileDownload);
  try {
    await downloadHandler.download(explorerItems);
  } catch (error) {
    notificationService.error(error);
    throw error;
  }
};

CommandsRegistry.registerCommand({
  id: DOWNLOAD_COMMAND_ID,
  handler: downloadFileHandler
});

var uploadFileHandler = async (accessor) => {
  const explorerService = accessor.get(IExplorerService);
  const notificationService = accessor.get(INotificationService);
  const instantiationService = accessor.get(IInstantiationService);
  const context2 = explorerService.getContext(false);
  const element = context2.length ? context2[0] : explorerService.roots[0];
  try {
    const files = await triggerUpload();
    if (files) {
      const browserUpload = instantiationService.createInstance(BrowserFileUpload);
      await browserUpload.upload(element, files);
    }
  } catch (error) {
    notificationService.error(error);
    throw error;
  }
};

CommandsRegistry.registerCommand({
  id: UPLOAD_COMMAND_ID,
  handler: uploadFileHandler
});

var pasteFileHandler = async (accessor, fileList) => {
  const clipboardService = accessor.get(IClipboardService);
  const explorerService = accessor.get(IExplorerService);
  const fileService = accessor.get(IFileService);
  const notificationService = accessor.get(INotificationService);
  const editorService = accessor.get(IEditorService);
  const configurationService = accessor.get(IConfigurationService);
  const uriIdentityService = accessor.get(IUriIdentityService);
  const dialogService = accessor.get(IDialogService);
  const hostService = accessor.get(IHostService);
  const context2 = explorerService.getContext(false);
  const hasNativeFilesToPaste = fileList && fileList.length > 0;
  const confirmPasteNative = hasNativeFilesToPaste && configurationService.getValue("explorer.confirmPasteNative");
  const toPaste = await getFilesToPaste(fileList, clipboardService, hostService);
  if (confirmPasteNative && toPaste.files.length >= 1) {
    const message = toPaste.files.length > 1 ? localize(15731, null, toPaste.files.length) : localize(15733, null, basename(toPaste.type === "paths" ? toPaste.files[0].fsPath : toPaste.files[0].name));
    const detail2 = toPaste.files.length > 1 ? getFileNamesMessage(toPaste.files.map((item) => {
      if (URI.isUri(item)) {
        return item.fsPath;
      }
      if (toPaste.type === "paths") {
        const path = getPathForFile(item);
        if (path) {
          return path;
        }
      }
      return item.name;
    })) : void 0;
    const confirmation = await dialogService.confirm({
      message,
      detail: detail2,
      checkbox: {
        label: localize(15757, null)
      },
      primaryButton: localize(15779, null)
    });
    if (!confirmation.confirmed) {
      return;
    }
    if (confirmation.checkboxChecked === true) {
      await configurationService.updateValue("explorer.confirmPasteNative", false);
    }
  }
  const element = context2.length ? context2[0] : explorerService.roots[0];
  const incrementalNaming = configurationService.getValue().explorer.incrementalNaming;
  const editableItem = explorerService.getEditable();
  if (editableItem) {
    return;
  }
  try {
    let targets = [];
    if (toPaste.type === "paths") {
      const sourceTargetPairs = coalesce(await Promise.all(toPaste.files.map(async (fileToPaste) => {
        if (element.resource.toString() !== fileToPaste.toString() && isEqualOrParent2(element.resource, fileToPaste)) {
          throw new Error(localize(15761, null));
        }
        const fileToPasteStat = await fileService.stat(fileToPaste);
        let target;
        if (uriIdentityService.extUri.isEqual(element.resource, fileToPaste)) {
          target = element.parent;
        } else {
          target = element.isDirectory ? element : element.parent;
        }
        const targetFile = await findValidPasteFileTarget(
          explorerService,
          fileService,
          dialogService,
          target,
          { resource: fileToPaste, isDirectory: fileToPasteStat.isDirectory, allowOverwrite: pasteShouldMove || incrementalNaming === "disabled" },
          incrementalNaming
        );
        if (!targetFile) {
          return void 0;
        }
        return { source: fileToPaste, target: targetFile };
      })));
      if (sourceTargetPairs.length >= 1) {
        if (pasteShouldMove) {
          const resourceFileEdits = sourceTargetPairs.map((pair) => new ResourceFileEdit(pair.source, pair.target, { overwrite: incrementalNaming === "disabled" }));
          const options3 = {
            confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === "verbose" /* Verbose */,
            progressLabel: sourceTargetPairs.length > 1 ? localize(15772, null, sourceTargetPairs.length) : localize(15773, null, basenameOrAuthority(sourceTargetPairs[0].target)),
            undoLabel: sourceTargetPairs.length > 1 ? localize(15770, null, sourceTargetPairs.length) : localize(15771, null, basenameOrAuthority(sourceTargetPairs[0].target))
          };
          await explorerService.applyBulkEdit(resourceFileEdits, options3);
        } else {
          const resourceFileEdits = sourceTargetPairs.map((pair) => new ResourceFileEdit(pair.source, pair.target, { copy: true, overwrite: incrementalNaming === "disabled" }));
          await applyCopyResourceEdit(sourceTargetPairs.map((pair) => pair.target), resourceFileEdits);
        }
      }
      targets = sourceTargetPairs.map((pair) => pair.target);
    } else {
      const targetAndEdits = coalesce(await Promise.all(toPaste.files.map(async (file) => {
        const target = element.isDirectory ? element : element.parent;
        const targetFile = await findValidPasteFileTarget(
          explorerService,
          fileService,
          dialogService,
          target,
          { resource: file.name, isDirectory: false, allowOverwrite: pasteShouldMove || incrementalNaming === "disabled" },
          incrementalNaming
        );
        if (!targetFile) {
          return;
        }
        return {
          target: targetFile,
          edit: new ResourceFileEdit(void 0, targetFile, {
            overwrite: incrementalNaming === "disabled",
            contents: (async () => VSBuffer.wrap(new Uint8Array(await file.arrayBuffer())))()
          })
        };
      })));
      await applyCopyResourceEdit(targetAndEdits.map((pair) => pair.target), targetAndEdits.map((pair) => pair.edit));
      targets = targetAndEdits.map((pair) => pair.target);
    }
    if (targets.length) {
      const firstTarget = targets[0];
      await explorerService.select(firstTarget);
      if (targets.length === 1) {
        const item = explorerService.findClosest(firstTarget);
        if (item && !item.isDirectory) {
          await editorService.openEditor({ resource: item.resource, options: { pinned: true, preserveFocus: true } });
        }
      }
    }
  } catch (e4) {
    notificationService.error(toErrorMessage(new Error(localize(15760, null, getErrorMessage(e4))), false));
  } finally {
    if (pasteShouldMove) {
      await explorerService.setToCopy([], false);
      pasteShouldMove = false;
    }
  }
  async function applyCopyResourceEdit(targets, resourceFileEdits) {
    const undoLevel = configurationService.getValue().explorer.confirmUndo;
    const options3 = {
      confirmBeforeUndo: undoLevel === "default" /* Default */ || undoLevel === "verbose" /* Verbose */,
      progressLabel: targets.length > 1 ? localize(15739, null, targets.length) : localize(15740, null, basenameOrAuthority(targets[0])),
      undoLabel: targets.length > 1 ? localize(15736, null, targets.length) : localize(15738, null, basenameOrAuthority(targets[0]))
    };
    await explorerService.applyBulkEdit(resourceFileEdits, options3);
  }
};

async function getFilesToPaste(fileList, clipboardService, hostService) {
  if (fileList && fileList.length > 0) {
    const resources = [...fileList].map((file) => getPathForFile(file)).filter((filePath) => !!filePath && isAbsolute(filePath)).map((filePath) => URI.file(filePath));
    if (resources.length) {
      return { type: "paths", files: resources };
    }
    return { type: "data", files: [...fileList].filter((file) => !getPathForFile(file)) };
  } else {
    return { type: "paths", files: distinctParents(await clipboardService.readResources(), (resource) => resource) };
  }
}

var openFilePreserveFocusHandler = async (accessor) => {
  const editorService = accessor.get(IEditorService);
  const explorerService = accessor.get(IExplorerService);
  const stats = explorerService.getContext(true);
  await editorService.openEditors(stats.filter((s) => !s.isDirectory).map((s) => ({
    resource: s.resource,
    options: { preserveFocus: true }
  })));
};

var BaseSetActiveEditorReadonlyInSession = class extends Action2 {
  constructor(id2, title, newReadonlyState) {
    super({
      id: id2,
      title,
      f1: true,
      category: Categories.File,
      precondition: ContextKeyExpr.and(ActiveEditorCanToggleReadonlyContext, IsSessionsWindowContext.negate())
    });
    this.newReadonlyState = newReadonlyState;
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const filesConfigurationService = accessor.get(IFilesConfigurationService);
    const fileResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    if (!fileResource) {
      return;
    }
    await filesConfigurationService.updateReadonly(fileResource, this.newReadonlyState);
  }
};

var SetActiveEditorReadonlyInSession = class _SetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
  static {
    this.ID = "workbench.action.files.setActiveEditorReadonlyInSession";
  }
  static {
    this.LABEL = localize2(15794, "Set Active Editor Read-only in Session");
  }
  constructor() {
    super(
      _SetActiveEditorReadonlyInSession.ID,
      _SetActiveEditorReadonlyInSession.LABEL,
      true
    );
  }
};

var SetActiveEditorWriteableInSession = class _SetActiveEditorWriteableInSession extends BaseSetActiveEditorReadonlyInSession {
  static {
    this.ID = "workbench.action.files.setActiveEditorWriteableInSession";
  }
  static {
    this.LABEL = localize2(15795, "Set Active Editor Writeable in Session");
  }
  constructor() {
    super(
      _SetActiveEditorWriteableInSession.ID,
      _SetActiveEditorWriteableInSession.LABEL,
      false
    );
  }
};

var ToggleActiveEditorReadonlyInSession = class _ToggleActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
  static {
    this.ID = "workbench.action.files.toggleActiveEditorReadonlyInSession";
  }
  static {
    this.LABEL = localize2(15798, "Toggle Active Editor Read-only in Session");
  }
  constructor() {
    super(
      _ToggleActiveEditorReadonlyInSession.ID,
      _ToggleActiveEditorReadonlyInSession.LABEL,
      "toggle"
    );
  }
};

var ResetActiveEditorReadonlyInSession = class _ResetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
  static {
    this.ID = "workbench.action.files.resetActiveEditorReadonlyInSession";
  }
  static {
    this.LABEL = localize2(15788, "Reset Active Editor Read-only in Session");
  }
  constructor() {
    super(
      _ResetActiveEditorReadonlyInSession.ID,
      _ResetActiveEditorReadonlyInSession.LABEL,
      "reset"
    );
  }
};
export { refreshIfSeparator, deleteFiles, getMoveToTrashMessage, getDeleteMessage, containsBothDirectoryAndFile, findValidPasteFileTarget, incrementFileName, askForOverwrite, validateFileName, trimLongName, getWellFormedFileName, onErrorWithRetry, openExplorerAndCreate, getFilesToPaste, NEW_FILE_COMMAND_ID2, NEW_FILE_LABEL, NEW_FOLDER_COMMAND_ID, NEW_FOLDER_LABEL, TRIGGER_RENAME_LABEL, MOVE_FILE_TO_TRASH_LABEL, COPY_FILE_LABEL, PASTE_FILE_LABEL, FileCopiedContext, DOWNLOAD_COMMAND_ID, DOWNLOAD_LABEL, UPLOAD_COMMAND_ID, UPLOAD_LABEL, CONFIRM_DELETE_SETTING_KEY, MAX_UNDO_FILE_SIZE, GlobalCompareResourcesAction, ToggleAutoSaveAction, BaseSaveAllAction, SaveAllInGroupAction, CloseGroupAction, FocusFilesExplorer, ShowActiveFileInExplorer, OpenActiveFileInEmptyWorkspace, CompareNewUntitledTextFilesAction, CompareWithClipboardAction, ClipboardContentProvider, renameHandler, moveFileToTrashHandler, deleteFileHandler, pasteShouldMove, copyFileHandler, cutFileHandler, downloadFileHandler, uploadFileHandler, pasteFileHandler, openFilePreserveFocusHandler, BaseSetActiveEditorReadonlyInSession, SetActiveEditorReadonlyInSession, SetActiveEditorWriteableInSession, ToggleActiveEditorReadonlyInSession, ResetActiveEditorReadonlyInSession };
