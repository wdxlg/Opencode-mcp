// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/workspace/browser/workspaceTrustEditor.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventHelper, EventType, addDisposableListener, addStandardDisposableListener, append, clearNode, isAncestorOfActiveElement } from "./module-0075.mjs";
import { WorkbenchTable } from "./module-0636.mjs";
import { ButtonBar } from "./module-0546.mjs";
import { defaultButtonStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { posix, win32 } from "./module-0026.mjs";
import { isVirtualResource, isVirtualWorkspace } from "./module-0936.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { ActionBar } from "./module-0477.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { InputBox } from "./module-0600.mjs";
import { hasDriveLetter, toSlashes } from "./module-0031.mjs";
import { normalizeDriveLetter } from "./module-0711.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { EditorPane } from "./module-1089.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { buttonBackground, buttonSecondaryBackground } from "./module-0233.mjs";
import { debugIconStartForeground } from "./module-1892.mjs";
import { editorErrorForeground } from "./module-0229.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { parseLinkedText } from "./module-1329.mjs";
import { Link } from "./module-0550.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { APPLICATION_SCOPES, IWorkbenchConfigurationService } from "./module-1198.mjs";
import { getExtensionDependencies } from "./module-0886.mjs";
import { IExtensionsWorkbenchService, LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID } from "./module-1022.mjs";
import { Action } from "./module-0082.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { debounce } from "./module-0250.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionManifestPropertiesService } from "./module-1048.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1046.mjs";
import { IProductService } from "./module-0873.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/workspace/browser/workspaceTrustEditor.ts
var shieldIcon = registerIcon("workspace-trust-banner", Codicon.shield, localize(22356, null));

var checkListIcon = registerIcon("workspace-trust-editor-check", Codicon.check, localize(22339, null));

var xListIcon = registerIcon("workspace-trust-editor-cross", Codicon.x, localize(22394, null));

var folderPickerIcon = registerIcon("workspace-trust-editor-folder-picker", Codicon.folder, localize(22344, null));

var editIcon3 = registerIcon("workspace-trust-editor-edit-folder", Codicon.edit, localize(22342, null));

var removeIcon2 = registerIcon("workspace-trust-editor-remove-folder", Codicon.close, localize(22353, null));

var WorkspaceTrustedUrisTable = class extends Disposable {
  constructor(container3, instantiationService, workspaceService, workspaceTrustManagementService, uriService, labelService, fileDialogService) {
    super();
    this.container = container3;
    this.instantiationService = instantiationService;
    this.workspaceService = workspaceService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.uriService = uriService;
    this.labelService = labelService;
    this.fileDialogService = fileDialogService;
    this._onDidAcceptEdit = this._register(new Emitter());
    this.onDidAcceptEdit = this._onDidAcceptEdit.event;
    this._onDidRejectEdit = this._register(new Emitter());
    this.onDidRejectEdit = this._onDidRejectEdit.event;
    this._onEdit = this._register(new Emitter());
    this.onEdit = this._onEdit.event;
    this._onDelete = this._register(new Emitter());
    this.onDelete = this._onDelete.event;
    this.descriptionElement = container3.appendChild($(".workspace-trusted-folders-description"));
    const tableElement = container3.appendChild($(".trusted-uris-table"));
    const addButtonBarElement = container3.appendChild($(".trusted-uris-button-bar"));
    this.table = this.instantiationService.createInstance(
      WorkbenchTable,
      "WorkspaceTrust",
      tableElement,
      new TrustedUriTableVirtualDelegate(),
      [
        {
          label: localize(22345, null),
          tooltip: "",
          weight: 1,
          templateId: TrustedUriHostColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(22351, null),
          tooltip: "",
          weight: 8,
          templateId: TrustedUriPathColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: "",
          tooltip: "",
          weight: 1,
          minimumWidth: 75,
          maximumWidth: 75,
          templateId: TrustedUriActionsColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        }
      ],
      [
        this.instantiationService.createInstance(TrustedUriHostColumnRenderer),
        this.instantiationService.createInstance(TrustedUriPathColumnRenderer, this),
        this.instantiationService.createInstance(TrustedUriActionsColumnRenderer, this, this.currentWorkspaceUri)
      ],
      {
        horizontalScrolling: false,
        alwaysConsumeMouseWheel: false,
        openOnSingleClick: false,
        multipleSelectionSupport: false,
        accessibilityProvider: {
          getAriaLabel: (item) => {
            const hostLabel = getHostLabel2(this.labelService, item);
            if (hostLabel === void 0 || hostLabel.length === 0) {
              return localize(22363, null, this.labelService.getUriLabel(item.uri));
            }
            return localize(22367, null, this.labelService.getUriLabel(item.uri), hostLabel);
          },
          getWidgetAriaLabel: () => localize(22364, null)
        },
        identityProvider: {
          getId(element) {
            return element.uri.toString();
          }
        }
      }
    );
    this._register(this.table.onDidOpen((item) => {
      if (item && item.element && !item.browserEvent?.defaultPrevented) {
        this.edit(item.element, true);
      }
    }));
    const buttonBar = this._register(new ButtonBar(addButtonBarElement));
    const addButton = this._register(buttonBar.addButton({ title: localize(22338, null), ...defaultButtonStyles }));
    addButton.label = localize(22338, null);
    this._register(addButton.onDidClick(async () => {
      const uri5 = await this.fileDialogService.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: this.currentWorkspaceUri,
        openLabel: localize(22380, null),
        title: localize(22355, null)
      });
      if (uri5) {
        this.workspaceTrustManagementService.setUrisTrust(uri5, true);
      }
    }));
    this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => {
      this.updateTable();
    }));
  }
  getIndexOfTrustedUriEntry(item) {
    const index2 = this.trustedUriEntries.indexOf(item);
    if (index2 === -1) {
      for (let i2 = 0; i2 < this.trustedUriEntries.length; i2++) {
        if (this.trustedUriEntries[i2].uri === item.uri) {
          return i2;
        }
      }
    }
    return index2;
  }
  selectTrustedUriEntry(item, focus = true) {
    const index2 = this.getIndexOfTrustedUriEntry(item);
    if (index2 !== -1) {
      if (focus) {
        this.table.domFocus();
        this.table.setFocus([index2]);
      }
      this.table.setSelection([index2]);
    }
  }
  get currentWorkspaceUri() {
    return this.workspaceService.getWorkspace().folders[0]?.uri || URI.file("/");
  }
  get trustedUriEntries() {
    const currentWorkspace = this.workspaceService.getWorkspace();
    const currentWorkspaceUris = currentWorkspace.folders.map((folder) => folder.uri);
    if (currentWorkspace.configuration) {
      currentWorkspaceUris.push(currentWorkspace.configuration);
    }
    const entries2 = this.workspaceTrustManagementService.getTrustedUris().map((uri5) => {
      let relatedToCurrentWorkspace = false;
      for (const workspaceUri of currentWorkspaceUris) {
        relatedToCurrentWorkspace = relatedToCurrentWorkspace || this.uriService.extUri.isEqualOrParent(workspaceUri, uri5);
      }
      return {
        uri: uri5,
        parentOfWorkspaceItem: relatedToCurrentWorkspace
      };
    });
    const sortedEntries = entries2.sort((a, b) => {
      if (a.uri.scheme !== b.uri.scheme) {
        if (a.uri.scheme === Schemas.file) {
          return -1;
        }
        if (b.uri.scheme === Schemas.file) {
          return 1;
        }
      }
      const aIsWorkspace = a.uri.path.endsWith(".code-workspace");
      const bIsWorkspace = b.uri.path.endsWith(".code-workspace");
      if (aIsWorkspace !== bIsWorkspace) {
        if (aIsWorkspace) {
          return 1;
        }
        if (bIsWorkspace) {
          return -1;
        }
      }
      return a.uri.fsPath.localeCompare(b.uri.fsPath);
    });
    return sortedEntries;
  }
  layout() {
    this.table.layout(this.trustedUriEntries.length * TrustedUriTableVirtualDelegate.ROW_HEIGHT + TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT, void 0);
  }
  updateTable() {
    const entries2 = this.trustedUriEntries;
    this.container.classList.toggle("empty", entries2.length === 0);
    this.descriptionElement.innerText = entries2.length ? localize(22365, null) : localize(22350, null);
    this.table.splice(0, Number.POSITIVE_INFINITY, this.trustedUriEntries);
    this.layout();
  }
  validateUri(path, item) {
    if (!item) {
      return null;
    }
    if (item.uri.scheme === "vscode-vfs") {
      const segments = path.split(posix.sep).filter((s) => s.length);
      if (segments.length === 0 && path.startsWith(posix.sep)) {
        return {
          type: 2 /* WARNING */,
          content: localize(22357, null, getHostLabel2(this.labelService, item))
        };
      }
      if (segments.length === 1) {
        return {
          type: 2 /* WARNING */,
          content: localize(22379, null, segments[0], getHostLabel2(this.labelService, item))
        };
      }
      if (segments.length > 2) {
        return {
          type: 3 /* ERROR */,
          content: localize(22346, null, path)
        };
      }
    }
    return null;
  }
  acceptEdit(item, uri5) {
    const trustedFolders = this.workspaceTrustManagementService.getTrustedUris();
    const index2 = trustedFolders.findIndex((u) => this.uriService.extUri.isEqual(u, item.uri));
    if (index2 >= trustedFolders.length || index2 === -1) {
      trustedFolders.push(uri5);
    } else {
      trustedFolders[index2] = uri5;
    }
    this.workspaceTrustManagementService.setTrustedUris(trustedFolders);
    this._onDidAcceptEdit.fire(item);
  }
  rejectEdit(item) {
    this._onDidRejectEdit.fire(item);
  }
  async delete(item) {
    const index2 = this.table.indexOf(item);
    if (index2 < this.table.length - 1) {
      this.table.setFocus([index2 + 1]);
    } else if (index2 > 0) {
      this.table.setFocus([index2 - 1]);
    } else {
      this.table.setFocus([]);
    }
    this.table.domFocus();
    await this.workspaceTrustManagementService.setUrisTrust([item.uri], false);
    this._onDelete.fire(item);
  }
  async edit(item, usePickerIfPossible) {
    const canUseOpenDialog = item.uri.scheme === Schemas.file || item.uri.scheme === this.currentWorkspaceUri.scheme && this.uriService.extUri.isEqualAuthority(this.currentWorkspaceUri.authority, item.uri.authority) && !isVirtualResource(item.uri);
    if (canUseOpenDialog && usePickerIfPossible) {
      const uri5 = await this.fileDialogService.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: item.uri,
        openLabel: localize(22380, null),
        title: localize(22355, null)
      });
      if (uri5) {
        this.acceptEdit(item, uri5[0]);
      } else {
        this.rejectEdit(item);
      }
    } else {
      this.selectTrustedUriEntry(item);
      this._onEdit.fire(item);
    }
  }
};

WorkspaceTrustedUrisTable = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IWorkspaceTrustManagementService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IFileDialogService)
], WorkspaceTrustedUrisTable);

var TrustedUriTableVirtualDelegate = class _TrustedUriTableVirtualDelegate {
  constructor() {
    this.headerRowHeight = _TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT;
  }
  static {
    this.HEADER_ROW_HEIGHT = 30;
  }
  static {
    this.ROW_HEIGHT = 24;
  }
  getHeight(item) {
    return _TrustedUriTableVirtualDelegate.ROW_HEIGHT;
  }
};

var TrustedUriActionsColumnRenderer = class {
  constructor(table, currentWorkspaceUri, uriService) {
    this.table = table;
    this.currentWorkspaceUri = currentWorkspaceUri;
    this.uriService = uriService;
    this.templateId = TrustedUriActionsColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "actions";
  }
  renderTemplate(container3) {
    const element = container3.appendChild($(".actions"));
    const actionBar3 = new ActionBar(element);
    return { actionBar: actionBar3 };
  }
  renderElement(item, index2, templateData) {
    templateData.actionBar.clear();
    const canUseOpenDialog = item.uri.scheme === Schemas.file || item.uri.scheme === this.currentWorkspaceUri.scheme && this.uriService.extUri.isEqualAuthority(this.currentWorkspaceUri.authority, item.uri.authority) && !isVirtualResource(item.uri);
    const actions = [];
    if (canUseOpenDialog) {
      actions.push(this.createPickerAction(item));
    }
    actions.push(this.createEditAction(item));
    actions.push(this.createDeleteAction(item));
    templateData.actionBar.push(actions, { icon: true });
  }
  createEditAction(item) {
    return {
      label: "",
      class: ThemeIcon.asClassName(editIcon3),
      enabled: true,
      id: "editTrustedUri",
      tooltip: localize(22343, null),
      run: () => {
        this.table.edit(item, false);
      }
    };
  }
  createPickerAction(item) {
    return {
      label: "",
      class: ThemeIcon.asClassName(folderPickerIcon),
      enabled: true,
      id: "pickerTrustedUri",
      tooltip: localize(22352, null),
      run: () => {
        this.table.edit(item, true);
      }
    };
  }
  createDeleteAction(item) {
    return {
      label: "",
      class: ThemeIcon.asClassName(removeIcon2),
      enabled: true,
      id: "deleteTrustedUri",
      tooltip: localize(22340, null),
      run: async () => {
        await this.table.delete(item);
      }
    };
  }
  disposeTemplate(templateData) {
    templateData.actionBar.dispose();
  }
};

TrustedUriActionsColumnRenderer = __decorateClass([
  __decorateParam(2, IUriIdentityService)
], TrustedUriActionsColumnRenderer);

var TrustedUriPathColumnRenderer = class {
  constructor(table, contextViewService) {
    this.table = table;
    this.contextViewService = contextViewService;
    this.templateId = TrustedUriPathColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "path";
  }
  renderTemplate(container3) {
    const element = container3.appendChild($(".path"));
    const pathLabel = element.appendChild($("div.path-label"));
    const pathInput = new InputBox(element, this.contextViewService, {
      validationOptions: {
        validation: (value2) => this.table.validateUri(value2, this.currentItem)
      },
      inputBoxStyles: defaultInputBoxStyles
    });
    const disposables = new DisposableStore();
    const renderDisposables = disposables.add(new DisposableStore());
    return {
      element,
      pathLabel,
      pathInput,
      disposables,
      renderDisposables
    };
  }
  renderElement(item, index2, templateData) {
    templateData.renderDisposables.clear();
    this.currentItem = item;
    templateData.renderDisposables.add(this.table.onEdit(async (e) => {
      if (item === e) {
        templateData.element.classList.add("input-mode");
        templateData.pathInput.focus();
        templateData.pathInput.select();
        templateData.element.parentElement.style.paddingLeft = "0px";
      }
    }));
    templateData.renderDisposables.add(addDisposableListener(templateData.pathInput.element, EventType.DBLCLICK, (e) => {
      EventHelper.stop(e);
    }));
    const hideInputBox = () => {
      templateData.element.classList.remove("input-mode");
      templateData.element.parentElement.style.paddingLeft = "5px";
    };
    const accept = () => {
      hideInputBox();
      const pathToUse = templateData.pathInput.value;
      const uri5 = hasDriveLetter(pathToUse) ? item.uri.with({ path: posix.sep + toSlashes(pathToUse) }) : item.uri.with({ path: pathToUse });
      templateData.pathLabel.innerText = this.formatPath(uri5);
      if (uri5) {
        this.table.acceptEdit(item, uri5);
      }
    };
    const reject = () => {
      hideInputBox();
      templateData.pathInput.value = stringValue2;
      this.table.rejectEdit(item);
    };
    templateData.renderDisposables.add(addStandardDisposableListener(templateData.pathInput.inputElement, EventType.KEY_DOWN, (e) => {
      let handled = false;
      if (e.equals(3 /* Enter */)) {
        accept();
        handled = true;
      } else if (e.equals(9 /* Escape */)) {
        reject();
        handled = true;
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    templateData.renderDisposables.add(addDisposableListener(templateData.pathInput.inputElement, EventType.BLUR, () => {
      reject();
    }));
    const stringValue2 = this.formatPath(item.uri);
    templateData.pathInput.value = stringValue2;
    templateData.pathLabel.innerText = stringValue2;
    templateData.element.classList.toggle("current-workspace-parent", item.parentOfWorkspaceItem);
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
    templateData.renderDisposables.dispose();
  }
  formatPath(uri5) {
    if (uri5.scheme === Schemas.file) {
      return normalizeDriveLetter(uri5.fsPath);
    }
    if (uri5.path.startsWith(posix.sep)) {
      const pathWithoutLeadingSeparator = uri5.path.substring(1);
      const isWindowsPath = hasDriveLetter(pathWithoutLeadingSeparator, true);
      if (isWindowsPath) {
        return normalizeDriveLetter(win32.normalize(pathWithoutLeadingSeparator), true);
      }
    }
    return uri5.path;
  }
};

TrustedUriPathColumnRenderer = __decorateClass([
  __decorateParam(1, IContextViewService)
], TrustedUriPathColumnRenderer);

function getHostLabel2(labelService, item) {
  return item.uri.authority ? labelService.getHostLabel(item.uri.scheme, item.uri.authority) : localize(22348, null);
}

var TrustedUriHostColumnRenderer = class {
  constructor(labelService) {
    this.labelService = labelService;
    this.templateId = TrustedUriHostColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "host";
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const renderDisposables = disposables.add(new DisposableStore());
    const element = container3.appendChild($(".host"));
    const hostContainer = element.appendChild($("div.host-label"));
    const buttonBarContainer = element.appendChild($("div.button-bar"));
    return {
      element,
      hostContainer,
      buttonBarContainer,
      disposables,
      renderDisposables
    };
  }
  renderElement(item, index2, templateData) {
    templateData.renderDisposables.clear();
    templateData.renderDisposables.add({ dispose: () => {
      clearNode(templateData.buttonBarContainer);
    } });
    templateData.hostContainer.innerText = getHostLabel2(this.labelService, item);
    templateData.element.classList.toggle("current-workspace-parent", item.parentOfWorkspaceItem);
    templateData.hostContainer.style.display = "";
    templateData.buttonBarContainer.style.display = "none";
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

TrustedUriHostColumnRenderer = __decorateClass([
  __decorateParam(0, ILabelService)
], TrustedUriHostColumnRenderer);

var WorkspaceTrustEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, workspaceService, extensionWorkbenchService, extensionManifestPropertiesService, instantiationService, workspaceTrustManagementService, configurationService, extensionEnablementService, productService, keybindingService) {
    super(WorkspaceTrustEditor.ID, group2, telemetryService, themeService, storageService);
    this.workspaceService = workspaceService;
    this.extensionWorkbenchService = extensionWorkbenchService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.instantiationService = instantiationService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.configurationService = configurationService;
    this.extensionEnablementService = extensionEnablementService;
    this.productService = productService;
    this.keybindingService = keybindingService;
    this.rendering = false;
    this.rerenderDisposables = this._register(new DisposableStore());
    this.layoutParticipants = [];
  }
  static {
    this.ID = "workbench.editor.workspaceTrust";
  }
  createEditor(parent) {
    this.rootElement = append(parent, $(".workspace-trust-editor", { tabindex: "0" }));
    this.createHeaderElement(this.rootElement);
    const scrollableContent = $(".workspace-trust-editor-body");
    this.bodyScrollBar = this._register(new DomScrollableElement(scrollableContent, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */
    }));
    append(this.rootElement, this.bodyScrollBar.getDomNode());
    this.createAffectedFeaturesElement(scrollableContent);
    this.createConfigurationElement(scrollableContent);
    this.rootElement.style.setProperty("--workspace-trust-selected-color", asCssVariable(buttonBackground));
    this.rootElement.style.setProperty("--workspace-trust-unselected-color", asCssVariable(buttonSecondaryBackground));
    this.rootElement.style.setProperty("--workspace-trust-check-color", asCssVariable(debugIconStartForeground));
    this.rootElement.style.setProperty("--workspace-trust-x-color", asCssVariable(editorErrorForeground));
    this._register(addDisposableListener(this.rootElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(16 /* UpArrow */) || event.equals(18 /* DownArrow */)) {
        const navOrder = [this.headerContainer, this.trustedContainer, this.untrustedContainer, this.configurationContainer];
        const currentIndex = navOrder.findIndex((element) => {
          return isAncestorOfActiveElement(element);
        });
        let newIndex = currentIndex;
        if (event.equals(18 /* DownArrow */)) {
          newIndex++;
        } else if (event.equals(16 /* UpArrow */)) {
          newIndex = Math.max(0, newIndex);
          newIndex--;
        }
        newIndex += navOrder.length;
        newIndex %= navOrder.length;
        navOrder[newIndex].focus();
      } else if (event.equals(9 /* Escape */)) {
        this.rootElement.focus();
      } else if (event.equals(2048 /* CtrlCmd */ | 3 /* Enter */)) {
        if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
          this.workspaceTrustManagementService.setWorkspaceTrust(!this.workspaceTrustManagementService.isWorkspaceTrusted());
        }
      }
    }));
  }
  focus() {
    super.focus();
    this.rootElement.focus();
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    if (token.isCancellationRequested) {
      return;
    }
    await this.workspaceTrustManagementService.workspaceTrustInitialized;
    this.registerListeners();
    await this.render();
  }
  registerListeners() {
    this._register(this.extensionWorkbenchService.onChange(() => this.render()));
    this._register(this.configurationService.onDidChangeRestrictedSettings(() => this.render()));
    this._register(this.workspaceTrustManagementService.onDidChangeTrust(() => this.render()));
    this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => this.render()));
  }
  getHeaderContainerClass(trusted) {
    if (trusted) {
      return "workspace-trust-header workspace-trust-trusted";
    }
    return "workspace-trust-header workspace-trust-untrusted";
  }
  getHeaderTitleText(trusted) {
    if (trusted) {
      if (this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
        return localize(22374, null);
      }
      switch (this.workspaceService.getWorkbenchState()) {
        case 1 /* EMPTY */:
          return localize(22370, null);
        case 2 /* FOLDER */:
          return localize(22369, null);
        case 3 /* WORKSPACE */:
          return localize(22371, null);
      }
    }
    return localize(22386, null);
  }
  getHeaderTitleIconClassNames(trusted) {
    return ThemeIcon.asClassNameArray(shieldIcon);
  }
  getFeaturesHeaderText(trusted) {
    let title = "";
    let subTitle = "";
    switch (this.workspaceService.getWorkbenchState()) {
      case 1 /* EMPTY */: {
        title = trusted ? localize(22375, null) : localize(22390, null);
        subTitle = trusted ? localize(22376, null) : localize(22389, null);
        break;
      }
      case 2 /* FOLDER */: {
        title = trusted ? localize(22362, null) : localize(22390, null);
        subTitle = trusted ? localize(22366, null) : localize(22385, null);
        break;
      }
      case 3 /* WORKSPACE */: {
        title = trusted ? localize(22377, null) : localize(22390, null);
        subTitle = trusted ? localize(22378, null) : localize(22392, null);
        break;
      }
    }
    return [title, subTitle];
  }
  async render() {
    if (this._store.isDisposed) {
      return;
    }
    if (this.rendering) {
      return;
    }
    this.rendering = true;
    this.rerenderDisposables.clear();
    const isWorkspaceTrusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
    this.rootElement.classList.toggle("trusted", isWorkspaceTrusted);
    this.rootElement.classList.toggle("untrusted", !isWorkspaceTrusted);
    this.headerTitleText.innerText = this.getHeaderTitleText(isWorkspaceTrusted);
    this.headerTitleIcon.className = "workspace-trust-title-icon";
    this.headerTitleIcon.classList.add(...this.getHeaderTitleIconClassNames(isWorkspaceTrusted));
    this.headerDescription.innerText = "";
    const headerDescriptionText = append(this.headerDescription, $("div"));
    headerDescriptionText.innerText = isWorkspaceTrusted ? localize(22360, null) : localize(22382, null, this.productService.nameShort);
    const headerDescriptionActions = append(this.headerDescription, $("div"));
    const headerDescriptionActionsText = localize(22393, null, `command:workbench.trust.configure`);
    for (const node of parseLinkedText(headerDescriptionActionsText).nodes) {
      if (typeof node === "string") {
        append(headerDescriptionActions, document.createTextNode(node));
      } else {
        this.rerenderDisposables.add(this.instantiationService.createInstance(Link, headerDescriptionActions, { ...node, tabIndex: -1 }, {}));
      }
    }
    this.headerContainer.className = this.getHeaderContainerClass(isWorkspaceTrusted);
    this.rootElement.setAttribute("aria-label", `${localize(22354, null)}:  ${this.headerContainer.innerText}`);
    const restrictedSettings = this.configurationService.restrictedSettings;
    const configurationRegistry30 = Registry.as(Extensions4.Configuration);
    const settingsRequiringTrustedWorkspaceCount = restrictedSettings.default.filter((key3) => {
      const property = configurationRegistry30.getConfigurationProperties()[key3];
      if (property.scope && (APPLICATION_SCOPES.includes(property.scope) || property.scope === 2 /* MACHINE */)) {
        return false;
      }
      if (property.deprecationMessage || property.markdownDeprecationMessage) {
        if (restrictedSettings.workspace?.includes(key3)) {
          return true;
        }
        if (restrictedSettings.workspaceFolder) {
          for (const workspaceFolderSettings of restrictedSettings.workspaceFolder.values()) {
            if (workspaceFolderSettings.includes(key3)) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    }).length;
    this.renderAffectedFeatures(settingsRequiringTrustedWorkspaceCount, this.getExtensionCount());
    this.workspaceTrustedUrisTable.updateTable();
    this.bodyScrollBar.getDomNode().style.height = `calc(100% - ${this.headerContainer.clientHeight}px)`;
    this.bodyScrollBar.scanDomNode();
    this.rendering = false;
  }
  getExtensionCount() {
    const set = /* @__PURE__ */ new Set();
    const inVirtualWorkspace = isVirtualWorkspace(this.workspaceService.getWorkspace());
    const localExtensions = this.extensionWorkbenchService.local.filter((ext) => ext.local).map((ext) => ext.local);
    for (const extension of localExtensions) {
      const enablementState = this.extensionEnablementService.getEnablementState(extension);
      if (enablementState !== 12 /* EnabledGlobally */ && enablementState !== 13 /* EnabledWorkspace */ && enablementState !== 0 /* DisabledByTrustRequirement */ && enablementState !== 8 /* DisabledByExtensionDependency */) {
        continue;
      }
      if (inVirtualWorkspace && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.manifest) === false) {
        continue;
      }
      if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.manifest) !== true) {
        set.add(extension.identifier.id);
        continue;
      }
      const dependencies = getExtensionDependencies(localExtensions, extension);
      if (dependencies.some((ext) => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === false)) {
        set.add(extension.identifier.id);
      }
    }
    return set.size;
  }
  createHeaderElement(parent) {
    this.headerContainer = append(parent, $(".workspace-trust-header", { tabIndex: "0" }));
    this.headerTitleContainer = append(this.headerContainer, $(".workspace-trust-title"));
    this.headerTitleIcon = append(this.headerTitleContainer, $(".workspace-trust-title-icon"));
    this.headerTitleText = append(this.headerTitleContainer, $(".workspace-trust-title-text"));
    this.headerDescription = append(this.headerContainer, $(".workspace-trust-description"));
  }
  createConfigurationElement(parent) {
    this.configurationContainer = append(parent, $(".workspace-trust-settings", { tabIndex: "0" }));
    const configurationTitle = append(this.configurationContainer, $(".workspace-trusted-folders-title"));
    configurationTitle.innerText = localize(22364, null);
    this.workspaceTrustedUrisTable = this._register(this.instantiationService.createInstance(WorkspaceTrustedUrisTable, this.configurationContainer));
  }
  createAffectedFeaturesElement(parent) {
    this.affectedFeaturesContainer = append(parent, $(".workspace-trust-features"));
    this.trustedContainer = append(this.affectedFeaturesContainer, $(".workspace-trust-limitations.trusted", { tabIndex: "0" }));
    this.untrustedContainer = append(this.affectedFeaturesContainer, $(".workspace-trust-limitations.untrusted", { tabIndex: "0" }));
  }
  async renderAffectedFeatures(numSettings, numExtensions) {
    clearNode(this.trustedContainer);
    clearNode(this.untrustedContainer);
    const [trustedTitle, trustedSubTitle] = this.getFeaturesHeaderText(true);
    this.renderLimitationsHeaderElement(this.trustedContainer, trustedTitle, trustedSubTitle);
    const trustedContainerItems = this.workspaceService.getWorkbenchState() === 1 /* EMPTY */ ? [
      localize(22373, null),
      localize(22359, null),
      localize(22361, null)
    ] : [
      localize(22373, null),
      localize(22359, null),
      localize(22372, null),
      localize(22361, null)
    ];
    this.renderLimitationsListElement(this.trustedContainer, trustedContainerItems, ThemeIcon.asClassNameArray(checkListIcon));
    const [untrustedTitle, untrustedSubTitle] = this.getFeaturesHeaderText(false);
    this.renderLimitationsHeaderElement(this.untrustedContainer, untrustedTitle, untrustedSubTitle);
    const untrustedContainerItems = this.workspaceService.getWorkbenchState() === 1 /* EMPTY */ ? [
      localize(22388, null),
      localize(22381, null),
      fixBadLocalizedLinks(localize(22383, null, numExtensions, `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`))
    ] : [
      localize(22388, null),
      localize(22381, null),
      fixBadLocalizedLinks(numSettings ? localize(22387, null, numSettings, "command:settings.filterUntrusted") : localize(22349, null)),
      fixBadLocalizedLinks(localize(22383, null, numExtensions, `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`))
    ];
    this.renderLimitationsListElement(this.untrustedContainer, untrustedContainerItems, ThemeIcon.asClassNameArray(xListIcon));
    if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
        this.addDontTrustButtonToElement(this.untrustedContainer);
      } else {
        this.addTrustedTextToElement(this.untrustedContainer);
      }
    } else {
      if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
        this.addTrustButtonToElement(this.trustedContainer);
      }
    }
  }
  createButtonRow(parent, buttonInfo, enabled) {
    const buttonRow = append(parent, $(".workspace-trust-buttons-row"));
    const buttonContainer = append(buttonRow, $(".workspace-trust-buttons"));
    const buttonBar = this.rerenderDisposables.add(new ButtonBar(buttonContainer));
    for (const { action, keybinding } of buttonInfo) {
      const button = buttonBar.addButtonWithDescription(defaultButtonStyles);
      button.label = action.label;
      button.enabled = enabled !== void 0 ? enabled : action.enabled;
      button.description = keybinding.getLabel();
      button.element.ariaLabel = action.label + ", " + localize(22347, null, keybinding.getAriaLabel());
      this.rerenderDisposables.add(button.onDidClick((e) => {
        if (e) {
          EventHelper.stop(e, true);
        }
        action.run();
      }));
    }
  }
  addTrustButtonToElement(parent) {
    const trustAction = this.rerenderDisposables.add(new Action("workspace.trust.button.action.grant", localize(22358, null), void 0, true, async () => {
      await this.workspaceTrustManagementService.setWorkspaceTrust(true);
    }));
    const trustActions = [{ action: trustAction, keybinding: this.keybindingService.resolveUserBinding(isMacintosh ? "Cmd+Enter" : "Ctrl+Enter")[0] }];
    this.createButtonRow(parent, trustActions);
  }
  addDontTrustButtonToElement(parent) {
    this.createButtonRow(parent, [{
      action: this.rerenderDisposables.add(new Action("workspace.trust.button.action.deny", localize(22341, null), void 0, true, async () => {
        await this.workspaceTrustManagementService.setWorkspaceTrust(false);
      })),
      keybinding: this.keybindingService.resolveUserBinding(isMacintosh ? "Cmd+Enter" : "Ctrl+Enter")[0]
    }]);
  }
  addTrustedTextToElement(parent) {
    if (this.workspaceService.getWorkbenchState() === 1 /* EMPTY */) {
      return;
    }
    const textElement = append(parent, $(".workspace-trust-untrusted-description"));
    if (!this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
      textElement.innerText = this.workspaceService.getWorkbenchState() === 3 /* WORKSPACE */ ? localize(22391, null) : localize(22384, null);
    } else {
      textElement.innerText = localize(22368, null);
    }
  }
  renderLimitationsHeaderElement(parent, headerText, subtitleText) {
    const limitationsHeaderContainer = append(parent, $(".workspace-trust-limitations-header"));
    const titleElement = append(limitationsHeaderContainer, $(".workspace-trust-limitations-title"));
    const textElement = append(titleElement, $(".workspace-trust-limitations-title-text"));
    const subtitleElement = append(limitationsHeaderContainer, $(".workspace-trust-limitations-subtitle"));
    textElement.innerText = headerText;
    subtitleElement.innerText = subtitleText;
  }
  renderLimitationsListElement(parent, limitations, iconClassNames) {
    const listContainer = append(parent, $(".workspace-trust-limitations-list-container"));
    const limitationsList = append(listContainer, $("ul"));
    for (const limitation of limitations) {
      const limitationListItem = append(limitationsList, $("li"));
      const icon2 = append(limitationListItem, $(".list-item-icon"));
      const text2 = append(limitationListItem, $(".list-item-text"));
      icon2.classList.add(...iconClassNames);
      const linkedText = parseLinkedText(limitation);
      for (const node of linkedText.nodes) {
        if (typeof node === "string") {
          append(text2, document.createTextNode(node));
        } else {
          this.rerenderDisposables.add(this.instantiationService.createInstance(Link, text2, { ...node, tabIndex: -1 }, {}));
        }
      }
    }
  }
  layout(dimension) {
    if (!this.isVisible()) {
      return;
    }
    this.workspaceTrustedUrisTable.layout();
    this.layoutParticipants.forEach((participant) => {
      participant.layout();
    });
    this.bodyScrollBar.scanDomNode();
  }
};

__decorateClass([
  debounce(100)
], WorkspaceTrustEditor.prototype, "render", 1);

WorkspaceTrustEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IExtensionsWorkbenchService),
  __decorateParam(6, IExtensionManifestPropertiesService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IWorkspaceTrustManagementService),
  __decorateParam(9, IWorkbenchConfigurationService),
  __decorateParam(10, IWorkbenchExtensionEnablementService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IKeybindingService)
], WorkspaceTrustEditor);

function fixBadLocalizedLinks(badString) {
  const regex = /(.*)\[(.+)\]\s*\((.+)\)(.*)/;
  return badString.replace(regex, "$1[$2]($3)$4");
}
export { getHostLabel2, fixBadLocalizedLinks, shieldIcon, checkListIcon, xListIcon, folderPickerIcon, editIcon3, removeIcon2, WorkspaceTrustedUrisTable, TrustedUriTableVirtualDelegate, TrustedUriActionsColumnRenderer, TrustedUriPathColumnRenderer, TrustedUriHostColumnRenderer, WorkspaceTrustEditor };
