// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/dialogs/browser/simpleFileDialog.ts
import { localize } from "./module-0001.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { Schemas } from "./module-0033.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { addTrailingPathSeparator, basename2, dirname2, extUriIgnorePathCase, extname2, hasTrailingPathSeparator, isEqual2, joinPath, relativePath, removeTrailingPathSeparator2, toLocalResource } from "./module-0034.mjs";
import { deepClone } from "./module-0098.mjs";
import { URI } from "./module-0032.mjs";
import { equalsIgnoreCase, format2, startsWithIgnoreCase } from "./module-0030.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { getActiveDocument } from "./module-0075.mjs";
import { isValidBasename } from "./module-0031.mjs";
import { IFileService, toFileSystemProviderErrorCode } from "./module-0269.mjs";
import { createCancelablePromise } from "./module-0036.mjs";
import { normalizeDriveLetter } from "./module-0711.mjs";
import { isWindows } from "./module-0014.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IPathService } from "./module-0938.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/services/dialogs/browser/simpleFileDialog.ts
var OpenLocalFileCommand;

((OpenLocalFileCommand2) => {
  OpenLocalFileCommand2.ID = "workbench.action.files.openLocalFile";
  OpenLocalFileCommand2.LABEL = localize(22880, null);
  function handler() {
    return (accessor) => {
      const dialogService = accessor.get(IFileDialogService);
      return dialogService.pickFileAndOpen({ forceNewWindow: false, availableFileSystems: [Schemas.file] });
    };
  }
  OpenLocalFileCommand2.handler = handler;
})(OpenLocalFileCommand || (OpenLocalFileCommand = {}));

var SaveLocalFileCommand;

((SaveLocalFileCommand2) => {
  SaveLocalFileCommand2.ID = "workbench.action.files.saveLocalFile";
  SaveLocalFileCommand2.LABEL = localize(22902, null);
  function handler() {
    return (accessor) => {
      const editorService = accessor.get(IEditorService);
      const activeEditorPane = editorService.activeEditorPane;
      if (activeEditorPane) {
        return editorService.save({ groupId: activeEditorPane.group.id, editor: activeEditorPane.input }, { saveAs: true, availableFileSystems: [Schemas.file], reason: 1 /* EXPLICIT */ });
      }
      return Promise.resolve(void 0);
    };
  }
  SaveLocalFileCommand2.handler = handler;
})(SaveLocalFileCommand || (SaveLocalFileCommand = {}));

var OpenLocalFolderCommand;

((OpenLocalFolderCommand2) => {
  OpenLocalFolderCommand2.ID = "workbench.action.files.openLocalFolder";
  OpenLocalFolderCommand2.LABEL = localize(22882, null);
  function handler() {
    return (accessor) => {
      const dialogService = accessor.get(IFileDialogService);
      return dialogService.pickFolderAndOpen({ forceNewWindow: false, availableFileSystems: [Schemas.file] });
    };
  }
  OpenLocalFolderCommand2.handler = handler;
})(OpenLocalFolderCommand || (OpenLocalFolderCommand = {}));

var OpenLocalFileFolderCommand;

((OpenLocalFileFolderCommand2) => {
  OpenLocalFileFolderCommand2.ID = "workbench.action.files.openLocalFileFolder";
  OpenLocalFileFolderCommand2.LABEL = localize(22881, null);
  function handler() {
    return (accessor) => {
      const dialogService = accessor.get(IFileDialogService);
      return dialogService.pickFileFolderAndOpen({ forceNewWindow: false, availableFileSystems: [Schemas.file] });
    };
  }
  OpenLocalFileFolderCommand2.handler = handler;
})(OpenLocalFileFolderCommand || (OpenLocalFileFolderCommand = {}));

var RemoteFileDialogContext = new RawContextKey("remoteFileDialogVisible", false);

var SimpleFileDialog = class extends Disposable {
  constructor(fileService, quickInputService, labelService, workspaceContextService, notificationService, fileDialogService, modelService, languageService, environmentService, remoteAgentService, pathService, keybindingService, contextKeyService, accessibilityService, storageService) {
    super();
    this.fileService = fileService;
    this.quickInputService = quickInputService;
    this.labelService = labelService;
    this.workspaceContextService = workspaceContextService;
    this.notificationService = notificationService;
    this.fileDialogService = fileDialogService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.environmentService = environmentService;
    this.remoteAgentService = remoteAgentService;
    this.pathService = pathService;
    this.keybindingService = keybindingService;
    this.accessibilityService = accessibilityService;
    this.storageService = storageService;
    this.hidden = false;
    this.allowFileSelection = true;
    this.allowFolderSelection = false;
    this.requiresTrailing = false;
    this.userEnteredPathSegment = "";
    this.autoCompletePathSegment = "";
    this.isWindows = false;
    this.separator = "/";
    this.onBusyChangeEmitter = this._register(new Emitter());
    this._showDotFiles = true;
    this.remoteAuthority = this.environmentService.remoteAuthority;
    this.contextKey = RemoteFileDialogContext.bindTo(contextKeyService);
    this.scheme = this.pathService.defaultUriScheme;
    this.getShowDotFiles();
    const disposableStore = this._register(new DisposableStore());
    disposableStore.add(this.storageService.onDidChangeValue(1 /* WORKSPACE */, "remoteFileDialog.showDotFiles", disposableStore)(async (_) => {
      this.getShowDotFiles();
      this.setButtons();
      const startingValue = this.filePickBox.value;
      const folderValue = this.pathFromUri(this.currentFolder, true);
      this.filePickBox.value = folderValue;
      await this.tryUpdateItems(folderValue, this.currentFolder, true);
      this.filePickBox.value = startingValue;
    }));
  }
  setShowDotFiles(showDotFiles) {
    this.storageService.store("remoteFileDialog.showDotFiles", showDotFiles, 1 /* WORKSPACE */, 0 /* USER */);
  }
  getShowDotFiles() {
    this._showDotFiles = this.storageService.getBoolean("remoteFileDialog.showDotFiles", 1 /* WORKSPACE */, true);
  }
  set busy(busy) {
    if (this.filePickBox.busy !== busy) {
      this.filePickBox.busy = busy;
      this.onBusyChangeEmitter.fire(busy);
    }
  }
  get busy() {
    return this.filePickBox.busy;
  }
  async showOpenDialog(options3 = {}) {
    this.scheme = this.getScheme(options3.availableFileSystems, options3.defaultUri);
    this.scopedAuthority = this.getScopedAuthority(options3.defaultUri);
    this.userHome = await this.getUserHome();
    this.trueHome = await this.getUserHome(true);
    const newOptions = this.getOptions(options3);
    if (!newOptions) {
      return Promise.resolve(void 0);
    }
    this.options = newOptions;
    const result = await this.pickResource();
    if (Array.isArray(result)) {
      return result;
    }
    return result ? [result] : void 0;
  }
  async showSaveDialog(options3) {
    this.scheme = this.getScheme(options3.availableFileSystems, options3.defaultUri);
    this.scopedAuthority = this.getScopedAuthority(options3.defaultUri);
    this.userHome = await this.getUserHome();
    this.trueHome = await this.getUserHome(true);
    this.requiresTrailing = true;
    const newOptions = this.getOptions(options3, true);
    if (!newOptions) {
      return Promise.resolve(void 0);
    }
    this.options = newOptions;
    this.options.canSelectFolders = true;
    this.options.canSelectFiles = true;
    return new Promise((resolve3) => {
      this.pickResource(true).then((result) => {
        resolve3(Array.isArray(result) ? result[0] : result);
      });
    });
  }
  getOptions(options3, isSave = false) {
    let defaultUri = void 0;
    let filename = void 0;
    if (options3.defaultUri) {
      defaultUri = this.scheme === options3.defaultUri.scheme ? options3.defaultUri : void 0;
      filename = isSave ? basename2(options3.defaultUri) : void 0;
    }
    if (!defaultUri) {
      defaultUri = this.userHome;
      if (filename) {
        defaultUri = joinPath(defaultUri, filename);
      }
    }
    if (this.scheme !== Schemas.file && !this.fileService.hasProvider(defaultUri)) {
      this.notificationService.info(localize(22889, null, defaultUri.toString()));
      return void 0;
    }
    const newOptions = deepClone(options3);
    newOptions.defaultUri = defaultUri;
    return newOptions;
  }
  remoteUriFrom(path, hintUri) {
    if (!path.startsWith("\\\\")) {
      path = path.replace(/\\/g, "/");
    }
    if (this.scopedAuthority) {
      return URI.from({ scheme: this.scheme, authority: this.scopedAuthority, path, query: hintUri?.query, fragment: hintUri?.fragment });
    }
    const uri5 = this.scheme === Schemas.file ? URI.file(path) : URI.from({ scheme: this.scheme, path, query: hintUri?.query, fragment: hintUri?.fragment });
    const authority = uri5.scheme === Schemas.file ? void 0 : this.remoteAuthority ?? hintUri?.authority;
    return toLocalResource(
      uri5,
      authority,
      // If there is a remote authority, then we should use the system's default URI as the local scheme.
      // If there is *no* remote authority, then we should use the default scheme for this dialog as that is already local.
      authority ? this.pathService.defaultUriScheme : uri5.scheme
    );
  }
  getScheme(available, defaultUri) {
    if (available && available.length > 0) {
      if (defaultUri && available.indexOf(defaultUri.scheme) >= 0) {
        return defaultUri.scheme;
      }
      return available[0];
    } else if (defaultUri) {
      return defaultUri.scheme;
    }
    return Schemas.file;
  }
  /**
   * Returns the per-URI authority from {@link defaultUri} if the dialog
   * should be scoped to a specific authority (e.g. `agenthost://host/...`).
   *
   * Returns `undefined` when the authority matches the global
   * {@link remoteAuthority} (standard SSH remotes), since that path is
   * already handled by the existing logic.
   */
  getScopedAuthority(defaultUri) {
    if (defaultUri && defaultUri.scheme === this.scheme && defaultUri.authority && defaultUri.authority !== this.remoteAuthority) {
      return defaultUri.authority;
    }
    return void 0;
  }
  async getRemoteAgentEnvironment() {
    if (this.remoteAgentEnvironment === void 0) {
      this.remoteAgentEnvironment = await this.remoteAgentService.getEnvironment();
    }
    return this.remoteAgentEnvironment;
  }
  getUserHome(trueHome = false) {
    if (this.scopedAuthority) {
      return Promise.resolve(URI.from({ scheme: this.scheme, authority: this.scopedAuthority, path: "/" }));
    }
    return trueHome ? this.pathService.userHome({ preferLocal: this.scheme === Schemas.file }) : this.fileDialogService.preferredHome(this.scheme);
  }
  normalizeUri(uri5) {
    uri5 = addTrailingPathSeparator(uri5, this.separator);
    uri5 = removeTrailingPathSeparator2(uri5);
    return uri5;
  }
  async pickResource(isSave = false) {
    this.allowFolderSelection = !!this.options.canSelectFolders;
    this.allowFileSelection = !!this.options.canSelectFiles;
    this.separator = this.scopedAuthority ? "/" : this.labelService.getSeparator(this.scheme, this.remoteAuthority);
    this.hidden = false;
    this.isWindows = this.scopedAuthority ? false : await this.checkIsWindowsOS();
    let homedir = this.options.defaultUri ? this.options.defaultUri : this.workspaceContextService.getWorkspace().folders[0].uri;
    let stat;
    const ext = extname2(homedir);
    if (this.options.defaultUri) {
      try {
        stat = await this.fileService.stat(this.options.defaultUri);
      } catch (e) {
      }
      if (!stat || !stat.isDirectory) {
        homedir = dirname2(this.options.defaultUri);
        this.trailing = basename2(this.options.defaultUri);
      }
    }
    return new Promise((resolve3) => {
      this.filePickBox = this._register(this.quickInputService.createQuickPick());
      this.busy = true;
      this.filePickBox.matchOnLabel = false;
      this.filePickBox.sortByLabel = false;
      this.filePickBox.ignoreFocusOut = true;
      this.filePickBox.placeholder = localize(22890, null);
      this.filePickBox.ok = true;
      this.filePickBox.okLabel = typeof this.options.openLabel === "string" ? this.options.openLabel : this.options.openLabel?.withoutMnemonic;
      if (this.scheme !== Schemas.file && this.options && this.options.availableFileSystems && this.options.availableFileSystems.length > 1 && this.options.availableFileSystems.indexOf(Schemas.file) > -1) {
        this.filePickBox.customButton = true;
        this.filePickBox.customLabel = localize(22888, null);
        this.filePickBox.customButtonSecondary = true;
        let action;
        if (isSave) {
          action = SaveLocalFileCommand;
        } else {
          action = this.allowFileSelection ? this.allowFolderSelection ? OpenLocalFileFolderCommand : OpenLocalFileCommand : OpenLocalFolderCommand;
        }
        const keybinding = this.keybindingService.lookupKeybinding(action.ID);
        if (keybinding) {
          const label3 = keybinding.getLabel();
          if (label3) {
            this.filePickBox.customHover = format2("{0} ({1})", action.LABEL, label3);
          }
        }
      }
      this.setButtons();
      this._register(this.filePickBox.onDidTriggerButton((e) => {
        this.setShowDotFiles(!this._showDotFiles);
      }));
      let isResolving = 0;
      let isAcceptHandled = false;
      this.currentFolder = dirname2(homedir);
      this.userEnteredPathSegment = "";
      this.autoCompletePathSegment = "";
      this.filePickBox.title = this.options.title;
      this.filePickBox.value = this.pathFromUri(this.currentFolder, true);
      this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
      const doResolve = (uriOrUris) => {
        if (uriOrUris) {
          if (Array.isArray(uriOrUris)) {
            uriOrUris = uriOrUris.map((uri5) => this.normalizeUri(uri5));
          } else {
            uriOrUris = this.normalizeUri(uriOrUris);
          }
        }
        resolve3(uriOrUris);
        this.contextKey.set(false);
        this.dispose();
      };
      this._register(this.filePickBox.onDidCustom(() => {
        if (isAcceptHandled || this.busy) {
          return;
        }
        isAcceptHandled = true;
        isResolving++;
        if (this.options.availableFileSystems && this.options.availableFileSystems.length > 1) {
          this.options.availableFileSystems = this.options.availableFileSystems.slice(1);
        }
        this.filePickBox.hide();
        if (isSave) {
          return this.fileDialogService.showSaveDialog(this.options).then((result) => {
            doResolve(result);
          });
        } else {
          return this.fileDialogService.showOpenDialog(this.options).then((result) => {
            doResolve(result);
          });
        }
      }));
      const busyDisposable = this._register(new MutableDisposable());
      const handleAccept = () => {
        if (this.busy) {
          busyDisposable.value = this.onBusyChangeEmitter.event((busy) => {
            if (!busy) {
              handleAccept();
            }
          });
          return;
        } else if (isAcceptHandled) {
          return;
        }
        isAcceptHandled = true;
        isResolving++;
        this.onDidAccept().then((resolveValue) => {
          if (resolveValue) {
            this.filePickBox.hide();
            doResolve(resolveValue);
          } else if (this.hidden) {
            doResolve(void 0);
          } else {
            isResolving--;
            isAcceptHandled = false;
          }
        });
      };
      this._register(this.filePickBox.onDidAccept((_) => {
        handleAccept();
      }));
      this._register(this.filePickBox.onDidChangeActive((i2) => {
        isAcceptHandled = false;
        if (i2.length === 1 && this.isSelectionChangeFromUser()) {
          this.filePickBox.validationMessage = void 0;
          const userPath = this.constructFullUserPath();
          if (!equalsIgnoreCase(this.filePickBox.value.substring(0, userPath.length), userPath)) {
            this.filePickBox.valueSelection = [0, this.filePickBox.value.length];
            this.insertText(userPath, userPath);
          }
          this.setAutoComplete(userPath, this.userEnteredPathSegment, i2[0], true);
        }
      }));
      this._register(this.filePickBox.onDidChangeValue(async (value2) => {
        return this.handleValueChange(value2);
      }));
      this._register(this.filePickBox.onDidHide(() => {
        this.hidden = true;
        if (isResolving === 0) {
          doResolve(void 0);
        }
      }));
      this.filePickBox.show();
      this.contextKey.set(true);
      this.updateItems(homedir, true, this.trailing).then(() => {
        if (this.trailing) {
          this.filePickBox.valueSelection = [this.filePickBox.value.length - this.trailing.length, this.filePickBox.value.length - ext.length];
        } else {
          this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
        }
        this.busy = false;
      });
    });
  }
  async handleValueChange(value2) {
    try {
      if (this.isValueChangeFromUser()) {
        if (!equalsIgnoreCase(value2, this.constructFullUserPath()) && (!this.isBadSubpath(value2) || this.canTildaEscapeHatch(value2))) {
          this.filePickBox.validationMessage = void 0;
          const filePickBoxUri = this.filePickBoxValue();
          let updated = 3 /* NotUpdated */;
          if (!hasTrailingPathSeparator(filePickBoxUri, this.separator) && extUriIgnorePathCase.isEqual(this.currentFolder, dirname2(filePickBoxUri))) {
            this.setActiveItems(value2);
            return;
          } else if (!extUriIgnorePathCase.isEqual(this.currentFolder, filePickBoxUri)) {
            updated = await this.tryUpdateItems(value2, filePickBoxUri);
          }
          if (updated === 3 /* NotUpdated */ || updated === 1 /* UpdatedWithTrailing */) {
            this.setActiveItems(value2);
          }
        } else {
          this.filePickBox.activeItems = [];
          this.userEnteredPathSegment = "";
        }
      }
    } catch {
    }
  }
  setButtons() {
    this.filePickBox.buttons = [{
      iconClass: this._showDotFiles ? ThemeIcon.asClassName(Codicon.eye) : ThemeIcon.asClassName(Codicon.eyeClosed),
      tooltip: this._showDotFiles ? localize(22886, null) : localize(22891, null),
      alwaysVisible: true
    }];
  }
  isBadSubpath(value2) {
    return this.badPath && value2.length > this.badPath.length && equalsIgnoreCase(value2.substring(0, this.badPath.length), this.badPath);
  }
  isValueChangeFromUser() {
    if (equalsIgnoreCase(this.filePickBox.value, this.pathAppend(this.currentFolder, this.userEnteredPathSegment + this.autoCompletePathSegment))) {
      return false;
    }
    return true;
  }
  isSelectionChangeFromUser() {
    if (this.activeItem === (this.filePickBox.activeItems ? this.filePickBox.activeItems[0] : void 0)) {
      return false;
    }
    return true;
  }
  constructFullUserPath() {
    const currentFolderPath = this.pathFromUri(this.currentFolder);
    if (equalsIgnoreCase(this.filePickBox.value.substr(0, this.userEnteredPathSegment.length), this.userEnteredPathSegment)) {
      if (equalsIgnoreCase(this.filePickBox.value.substr(0, currentFolderPath.length), currentFolderPath)) {
        return currentFolderPath;
      } else {
        return this.userEnteredPathSegment;
      }
    } else {
      return this.pathAppend(this.currentFolder, this.userEnteredPathSegment);
    }
  }
  filePickBoxValue() {
    const directUri = this.remoteUriFrom(this.filePickBox.value.trimRight(), this.currentFolder);
    const currentPath = this.pathFromUri(this.currentFolder);
    if (equalsIgnoreCase(this.filePickBox.value, currentPath)) {
      return this.currentFolder;
    }
    const currentDisplayUri = this.remoteUriFrom(currentPath, this.currentFolder);
    const relativePath2 = relativePath(currentDisplayUri, directUri);
    const isSameRoot = this.filePickBox.value.length > 1 && currentPath.length > 1 ? equalsIgnoreCase(this.filePickBox.value.substr(0, 2), currentPath.substr(0, 2)) : false;
    if (relativePath2 && isSameRoot) {
      let path = joinPath(this.currentFolder, relativePath2);
      const directBasename = basename2(directUri);
      if (directBasename === "." || directBasename === "..") {
        path = this.remoteUriFrom(this.pathAppend(path, directBasename), this.currentFolder);
      }
      return hasTrailingPathSeparator(directUri) ? addTrailingPathSeparator(path) : path;
    } else {
      return directUri;
    }
  }
  async onDidAccept() {
    this.busy = true;
    if (!this.updatingPromise && this.filePickBox.activeItems.length === 1) {
      const item = this.filePickBox.selectedItems[0];
      if (item.isFolder) {
        if (this.trailing) {
          await this.updateItems(item.uri, true, this.trailing);
        } else {
          const newPath = this.pathFromUri(item.uri);
          if (startsWithIgnoreCase(newPath, this.filePickBox.value) && equalsIgnoreCase(item.label, basename2(item.uri))) {
            this.filePickBox.valueSelection = [this.pathFromUri(this.currentFolder).length, this.filePickBox.value.length];
            this.insertText(newPath, this.basenameWithTrailingSlash(item.uri));
          } else if (item.label === ".." && startsWithIgnoreCase(this.filePickBox.value, newPath)) {
            this.filePickBox.valueSelection = [newPath.length, this.filePickBox.value.length];
            this.insertText(newPath, "");
          } else {
            await this.updateItems(item.uri, true);
          }
        }
        this.filePickBox.busy = false;
        return;
      }
    } else if (!this.updatingPromise) {
      if (await this.tryUpdateItems(this.filePickBox.value, this.filePickBoxValue()) !== 3 /* NotUpdated */) {
        this.filePickBox.busy = false;
        return;
      }
    }
    let resolveValue;
    if (this.filePickBox.activeItems.length === 0) {
      resolveValue = this.filePickBoxValue();
    } else if (this.filePickBox.activeItems.length === 1) {
      resolveValue = this.filePickBox.selectedItems[0].uri;
    }
    if (resolveValue) {
      resolveValue = this.addPostfix(resolveValue);
    }
    if (await this.validate(resolveValue)) {
      this.busy = false;
      return resolveValue;
    }
    this.busy = false;
    return void 0;
  }
  root(value2) {
    let lastDir = value2;
    let dir = dirname2(value2);
    while (!isEqual2(lastDir, dir)) {
      lastDir = dir;
      dir = dirname2(dir);
    }
    return dir;
  }
  canTildaEscapeHatch(value2) {
    return !!(value2.endsWith("~") && this.isBadSubpath(value2));
  }
  tildaReplace(value2) {
    const home2 = this.trueHome;
    if (value2.length > 0 && value2[0] === "~") {
      return joinPath(home2, value2.substring(1));
    } else if (this.canTildaEscapeHatch(value2)) {
      return home2;
    }
    return this.remoteUriFrom(value2);
  }
  tryAddTrailingSeparatorToDirectory(uri5, stat) {
    if (stat.isDirectory) {
      if (!this.endsWithSlash(uri5.path)) {
        return addTrailingPathSeparator(uri5);
      }
    }
    return uri5;
  }
  async tryUpdateItems(value2, valueUri, reset2 = false) {
    if (value2.length > 0 && (value2[0] === "~" || this.canTildaEscapeHatch(value2))) {
      const newDir = this.tildaReplace(value2);
      return await this.updateItems(newDir, true) ? 1 /* UpdatedWithTrailing */ : 0 /* Updated */;
    } else if (value2 === "\\") {
      valueUri = this.root(this.currentFolder);
      value2 = this.pathFromUri(valueUri);
      return await this.updateItems(valueUri, true) ? 1 /* UpdatedWithTrailing */ : 0 /* Updated */;
    } else {
      const newFolderIsOldFolder = extUriIgnorePathCase.isEqual(this.currentFolder, valueUri);
      const newFolderIsSubFolder = extUriIgnorePathCase.isEqual(this.currentFolder, dirname2(valueUri));
      const newFolderIsParent = extUriIgnorePathCase.isEqualOrParent(this.currentFolder, dirname2(valueUri));
      const newFolderIsUnrelated = !newFolderIsParent && !newFolderIsSubFolder;
      if (!newFolderIsOldFolder && (this.endsWithSlash(value2) || newFolderIsParent || newFolderIsUnrelated) || reset2) {
        let stat;
        try {
          stat = await this.fileService.stat(valueUri);
        } catch (e) {
        }
        if (stat?.isDirectory && basename2(valueUri) !== "." && this.endsWithSlash(value2)) {
          valueUri = this.tryAddTrailingSeparatorToDirectory(valueUri, stat);
          return await this.updateItems(valueUri) ? 1 /* UpdatedWithTrailing */ : 0 /* Updated */;
        } else if (this.endsWithSlash(value2)) {
          this.filePickBox.validationMessage = localize(22883, null);
          this.badPath = value2;
          return 4 /* InvalidPath */;
        } else {
          let inputUriDirname = dirname2(valueUri);
          const currentFolderWithoutSep = removeTrailingPathSeparator2(addTrailingPathSeparator(this.currentFolder));
          const inputUriDirnameWithoutSep = removeTrailingPathSeparator2(addTrailingPathSeparator(inputUriDirname));
          if (!extUriIgnorePathCase.isEqual(currentFolderWithoutSep, inputUriDirnameWithoutSep) && (!/^[a-zA-Z]:$/.test(this.filePickBox.value) || !equalsIgnoreCase(this.pathFromUri(this.currentFolder).substring(0, this.filePickBox.value.length), this.filePickBox.value))) {
            let statWithoutTrailing;
            try {
              statWithoutTrailing = await this.fileService.stat(inputUriDirname);
            } catch (e) {
            }
            if (statWithoutTrailing?.isDirectory) {
              this.badPath = void 0;
              inputUriDirname = this.tryAddTrailingSeparatorToDirectory(inputUriDirname, statWithoutTrailing);
              return await this.updateItems(inputUriDirname, false, basename2(valueUri)) ? 1 /* UpdatedWithTrailing */ : 0 /* Updated */;
            }
          }
        }
      }
    }
    this.badPath = void 0;
    return 3 /* NotUpdated */;
  }
  tryUpdateTrailing(value2) {
    const ext = extname2(value2);
    if (this.trailing && ext) {
      this.trailing = basename2(value2);
    }
  }
  setActiveItems(value2) {
    value2 = this.pathFromUri(this.tildaReplace(value2));
    const asUri = this.remoteUriFrom(value2);
    const inputBasename = basename2(asUri);
    const userPath = this.constructFullUserPath();
    const pathsEqual = equalsIgnoreCase(userPath, value2.substring(0, userPath.length)) || equalsIgnoreCase(value2, userPath.substring(0, value2.length));
    if (pathsEqual) {
      let hasMatch = false;
      for (let i2 = 0; i2 < this.filePickBox.items.length; i2++) {
        const item = this.filePickBox.items[i2];
        if (this.setAutoComplete(value2, inputBasename, item)) {
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) {
        const userBasename = inputBasename.length >= 2 ? userPath.substring(userPath.length - inputBasename.length + 2) : "";
        this.userEnteredPathSegment = userBasename === inputBasename ? inputBasename : "";
        this.autoCompletePathSegment = "";
        this.filePickBox.activeItems = [];
        this.tryUpdateTrailing(asUri);
      }
    } else {
      this.userEnteredPathSegment = inputBasename;
      this.autoCompletePathSegment = "";
      this.filePickBox.activeItems = [];
      this.tryUpdateTrailing(asUri);
    }
  }
  setAutoComplete(startingValue, startingBasename, quickPickItem, force = false) {
    if (this.busy) {
      this.userEnteredPathSegment = startingBasename;
      this.autoCompletePathSegment = "";
      return false;
    }
    const itemBasename = quickPickItem.label;
    if (itemBasename === "..") {
      this.userEnteredPathSegment = "";
      this.autoCompletePathSegment = "";
      this.activeItem = quickPickItem;
      if (force) {
        getActiveDocument().execCommand("insertText", false, "");
      }
      return false;
    } else if (!force && itemBasename.length >= startingBasename.length && equalsIgnoreCase(itemBasename.substr(0, startingBasename.length), startingBasename)) {
      this.userEnteredPathSegment = startingBasename;
      this.activeItem = quickPickItem;
      this.autoCompletePathSegment = "";
      if (quickPickItem.isFolder || !this.trailing) {
        this.filePickBox.activeItems = [quickPickItem];
      } else {
        this.filePickBox.activeItems = [];
      }
      return true;
    } else if (force && !equalsIgnoreCase(this.basenameWithTrailingSlash(quickPickItem.uri), this.userEnteredPathSegment + this.autoCompletePathSegment)) {
      this.userEnteredPathSegment = "";
      if (!this.accessibilityService.isScreenReaderOptimized()) {
        this.autoCompletePathSegment = this.trimTrailingSlash(itemBasename);
      }
      this.activeItem = quickPickItem;
      if (!this.accessibilityService.isScreenReaderOptimized()) {
        this.filePickBox.valueSelection = [this.pathFromUri(this.currentFolder, true).length, this.filePickBox.value.length];
        this.insertText(this.pathAppend(this.currentFolder, this.autoCompletePathSegment), this.autoCompletePathSegment);
        this.filePickBox.valueSelection = [this.filePickBox.value.length - this.autoCompletePathSegment.length, this.filePickBox.value.length];
      }
      return true;
    } else {
      this.userEnteredPathSegment = startingBasename;
      this.autoCompletePathSegment = "";
      return false;
    }
  }
  insertText(wholeValue, insertText) {
    if (this.filePickBox.inputHasFocus()) {
      getActiveDocument().execCommand("insertText", false, insertText);
      if (this.filePickBox.value !== wholeValue) {
        this.filePickBox.value = wholeValue;
        this.handleValueChange(wholeValue);
      }
    } else {
      this.filePickBox.value = wholeValue;
      this.handleValueChange(wholeValue);
    }
  }
  addPostfix(uri5) {
    let result = uri5;
    if (this.requiresTrailing && this.options.filters && this.options.filters.length > 0 && !hasTrailingPathSeparator(uri5)) {
      let hasExt = false;
      const currentExt = extname2(uri5).substr(1);
      for (let i2 = 0; i2 < this.options.filters.length; i2++) {
        for (let j = 0; j < this.options.filters[i2].extensions.length; j++) {
          if (this.options.filters[i2].extensions[j] === "*" || this.options.filters[i2].extensions[j] === currentExt) {
            hasExt = true;
            break;
          }
        }
        if (hasExt) {
          break;
        }
      }
      if (!hasExt) {
        result = joinPath(dirname2(uri5), basename2(uri5) + "." + this.options.filters[0].extensions[0]);
      }
    }
    return result;
  }
  trimTrailingSlash(path) {
    return path.length > 1 && this.endsWithSlash(path) ? path.substr(0, path.length - 1) : path;
  }
  yesNoPrompt(uri5, message) {
    const disposableStore = new DisposableStore();
    const prompt = disposableStore.add(this.quickInputService.createQuickPick());
    prompt.title = message;
    prompt.ignoreFocusOut = true;
    prompt.ok = true;
    prompt.customButton = true;
    prompt.customLabel = localize(22884, null);
    prompt.customButtonSecondary = true;
    prompt.value = this.pathFromUri(uri5);
    let isResolving = false;
    return new Promise((resolve3) => {
      disposableStore.add(prompt.onDidAccept(() => {
        isResolving = true;
        prompt.hide();
        resolve3(true);
      }));
      disposableStore.add(prompt.onDidHide(() => {
        if (!isResolving) {
          resolve3(false);
          this.filePickBox.show();
          const currentItems = this.filePickBox.items;
          this.filePickBox.items = currentItems;
        }
        this.hidden = false;
        disposableStore.dispose();
      }));
      disposableStore.add(prompt.onDidChangeValue(() => {
        prompt.hide();
      }));
      disposableStore.add(prompt.onDidCustom(() => {
        prompt.hide();
      }));
      prompt.show();
    });
  }
  async validate(uri5) {
    if (uri5 === void 0) {
      this.filePickBox.validationMessage = localize(22887, null);
      return Promise.resolve(false);
    }
    let stat;
    let statDirname;
    try {
      statDirname = await this.fileService.stat(dirname2(uri5));
      stat = await this.fileService.stat(uri5);
    } catch (e) {
    }
    if (this.requiresTrailing) {
      if (stat?.isDirectory) {
        this.filePickBox.validationMessage = localize(22897, null);
        return false;
      } else if (stat) {
        const message = localize(22895, null, basename2(uri5));
        return this.yesNoPrompt(uri5, message);
      } else if (!isValidBasename(basename2(uri5), this.isWindows)) {
        this.filePickBox.validationMessage = localize(22892, null);
        return false;
      } else if (!statDirname) {
        const message = localize(22893, null, basename2(dirname2(uri5)));
        return this.yesNoPrompt(uri5, message);
      } else if (!statDirname.isDirectory) {
        this.filePickBox.validationMessage = localize(22899, null);
        return false;
      } else if (statDirname.readonly) {
        this.filePickBox.validationMessage = localize(22900, null);
        return false;
      }
    } else {
      if (!stat) {
        if (this.allowFolderSelection && !this.allowFileSelection && await this.canCreateFolder(uri5, statDirname)) {
          const message = localize(22894, null, basename2(uri5));
          const shouldCreate = await this.yesNoPrompt(uri5, message);
          if (!shouldCreate) {
            return false;
          }
          try {
            await this.fileService.createFolder(uri5);
            return true;
          } catch (e) {
            this.filePickBox.validationMessage = localize(22885, null, e.message);
            return false;
          }
        }
        this.filePickBox.validationMessage = localize(22899, null);
        return false;
      } else if (uri5.path === "/" && this.isWindows) {
        this.filePickBox.validationMessage = localize(22901, null);
        return false;
      } else if (stat.isDirectory && !this.allowFolderSelection) {
        this.filePickBox.validationMessage = localize(22896, null);
        return false;
      } else if (!stat.isDirectory && !this.allowFileSelection) {
        this.filePickBox.validationMessage = localize(22898, null);
        return false;
      }
    }
    return true;
  }
  async canCreateFolder(uri5, parentStat) {
    const immediateParent = dirname2(uri5);
    let candidate = uri5;
    while (true) {
      const name = basename2(candidate);
      if (!name || !isValidBasename(name, this.isWindows)) {
        return false;
      }
      const parent = dirname2(candidate);
      if (isEqual2(parent, candidate)) {
        return false;
      }
      try {
        const stat = parentStat && isEqual2(parent, immediateParent) ? parentStat : await this.fileService.stat(parent);
        return stat.isDirectory && !stat.readonly;
      } catch (e) {
        if (toFileSystemProviderErrorCode(e instanceof Error ? e : void 0) !== "EntryNotFound" /* FileNotFound */) {
          return false;
        }
        candidate = parent;
      }
    }
  }
  // Returns true if there is a file at the end of the URI.
  async updateItems(newFolder, force = false, trailing) {
    this.busy = true;
    this.autoCompletePathSegment = "";
    const wasDotDot = trailing === "..";
    trailing = wasDotDot ? void 0 : trailing;
    const isSave = !!trailing;
    let result = false;
    const updatingPromise = createCancelablePromise(async (token) => {
      let folderStat;
      try {
        folderStat = await this.fileService.resolve(newFolder);
        if (!folderStat.isDirectory) {
          trailing = basename2(newFolder);
          newFolder = dirname2(newFolder);
          folderStat = void 0;
          result = true;
        }
      } catch (e) {
      }
      const newValue = trailing ? this.pathAppend(newFolder, trailing) : this.pathFromUri(newFolder, true);
      const currentFolder = this.endsWithSlash(newFolder.path) ? newFolder : addTrailingPathSeparator(newFolder, this.separator);
      const userEnteredPathSegment = trailing ? trailing : "";
      return this.createItems(folderStat, currentFolder, token).then((items) => {
        if (token.isCancellationRequested) {
          this.busy = false;
          return false;
        }
        this.currentFolder = currentFolder;
        this.userEnteredPathSegment = userEnteredPathSegment;
        this.filePickBox.itemActivation = 0 /* NONE */;
        this.filePickBox.items = items;
        if (!equalsIgnoreCase(this.filePickBox.value, newValue) && (force || wasDotDot)) {
          this.filePickBox.valueSelection = [0, this.filePickBox.value.length];
          this.insertText(newValue, newValue);
        }
        if (force && trailing && isSave) {
          this.filePickBox.valueSelection = [this.filePickBox.value.length - trailing.length, this.filePickBox.value.length - trailing.length];
        } else if (!trailing) {
          this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
        }
        this.busy = false;
        this.updatingPromise = void 0;
        return result;
      });
    });
    if (this.updatingPromise !== void 0) {
      this.updatingPromise.cancel();
    }
    this.updatingPromise = updatingPromise;
    return updatingPromise;
  }
  pathFromUri(uri5, endWithSeparator = false) {
    let result;
    if (this.scopedAuthority) {
      result = uri5.path.replace(/\n/g, "");
    } else {
      result = normalizeDriveLetter(uri5.fsPath, this.isWindows).replace(/\n/g, "");
    }
    if (this.separator === "/") {
      result = result.replace(/\\/g, this.separator);
    } else {
      result = result.replace(/\//g, this.separator);
    }
    if (endWithSeparator && !this.endsWithSlash(result)) {
      result = result + this.separator;
    }
    return result;
  }
  pathAppend(uri5, additional) {
    if (additional === ".." || additional === ".") {
      const basePath = this.pathFromUri(uri5, true);
      return basePath + additional;
    } else {
      return this.pathFromUri(joinPath(uri5, additional));
    }
  }
  async checkIsWindowsOS() {
    let isWindowsOS = isWindows;
    const env2 = await this.getRemoteAgentEnvironment();
    if (env2) {
      isWindowsOS = env2.os === 1 /* Windows */;
    }
    return isWindowsOS;
  }
  endsWithSlash(s) {
    return /[\/\\]$/.test(s);
  }
  basenameWithTrailingSlash(fullPath) {
    const child = this.pathFromUri(fullPath, true);
    const parent = this.pathFromUri(dirname2(fullPath), true);
    return child.substring(parent.length);
  }
  async createBackItem(currFolder) {
    const compareScheme = this.scopedAuthority ? this.scheme : Schemas.file;
    const compareAuthority = this.scopedAuthority ?? "";
    const fileRepresentationCurr = currFolder.with({ scheme: compareScheme, authority: compareAuthority });
    const fileRepresentationParent = dirname2(fileRepresentationCurr);
    if (!isEqual2(fileRepresentationCurr, fileRepresentationParent)) {
      const parentFolder = dirname2(currFolder);
      if (await this.fileService.exists(parentFolder)) {
        return { label: "..", uri: addTrailingPathSeparator(parentFolder, this.separator), isFolder: true };
      }
    }
    return void 0;
  }
  async createItems(folder, currentFolder, token) {
    const result = [];
    const backDir = await this.createBackItem(currentFolder);
    try {
      if (!folder) {
        folder = await this.fileService.resolve(currentFolder);
      }
      const filteredChildren = this._showDotFiles ? folder.children : folder.children?.filter((child) => !child.name.startsWith("."));
      const items = filteredChildren ? await Promise.all(filteredChildren.map((child) => this.createItem(child, currentFolder, token))) : [];
      for (const item of items) {
        if (item) {
          result.push(item);
        }
      }
    } catch (e) {
      console.log(e);
    }
    if (token.isCancellationRequested) {
      return [];
    }
    const sorted = result.sort((i1, i2) => {
      if (i1.isFolder !== i2.isFolder) {
        return i1.isFolder ? -1 : 1;
      }
      const trimmed1 = this.endsWithSlash(i1.label) ? i1.label.substr(0, i1.label.length - 1) : i1.label;
      const trimmed2 = this.endsWithSlash(i2.label) ? i2.label.substr(0, i2.label.length - 1) : i2.label;
      return trimmed1.localeCompare(trimmed2);
    });
    if (backDir) {
      sorted.unshift(backDir);
    }
    return sorted;
  }
  filterFile(file) {
    if (this.options.filters) {
      for (let i2 = 0; i2 < this.options.filters.length; i2++) {
        for (let j = 0; j < this.options.filters[i2].extensions.length; j++) {
          const testExt = this.options.filters[i2].extensions[j];
          if (testExt === "*" || file.path.endsWith("." + testExt)) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  }
  async createItem(stat, parent, token) {
    if (token.isCancellationRequested) {
      return void 0;
    }
    let fullPath = joinPath(parent, stat.name);
    if (stat.isDirectory) {
      const filename = basename2(fullPath);
      fullPath = addTrailingPathSeparator(fullPath, this.separator);
      return { label: filename, uri: fullPath, isFolder: true, iconClasses: getIconClasses(this.modelService, this.languageService, fullPath || void 0, 1 /* FOLDER */) };
    } else if (!stat.isDirectory && this.allowFileSelection && this.filterFile(fullPath)) {
      return { label: stat.name, uri: fullPath, isFolder: false, iconClasses: getIconClasses(this.modelService, this.languageService, fullPath || void 0) };
    }
    return void 0;
  }
};

SimpleFileDialog = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IFileDialogService),
  __decorateParam(6, IModelService),
  __decorateParam(7, ILanguageService),
  __decorateParam(8, IWorkbenchEnvironmentService),
  __decorateParam(9, IRemoteAgentService),
  __decorateParam(10, IPathService),
  __decorateParam(11, IKeybindingService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, IAccessibilityService),
  __decorateParam(14, IStorageService)
], SimpleFileDialog);
export { OpenLocalFileCommand, SaveLocalFileCommand, OpenLocalFolderCommand, OpenLocalFileFolderCommand, RemoteFileDialogContext, SimpleFileDialog };
