// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/electron-browser/runtimeExtensionsEditor.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { AbstractRuntimeExtensionsEditor } from "./module-3962.mjs";
import { SlowExtensionAction } from "./module-3964.mjs";
import { ReportExtensionIssueAction } from "./module-3963.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IExtensionFeaturesManagementService } from "./module-0877.mjs";
import { IHoverService } from "./module-0520.mjs";
import { Action2, IMenuService, MenuId } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ActiveEditorContext } from "./module-0949.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { IFileService } from "./module-0269.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { Schemas } from "./module-0033.mjs";
import { joinPath } from "./module-0034.mjs";
import { Utils } from "./module-3886.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/workbench/contrib/extensions/electron-browser/runtimeExtensionsEditor.ts
var IExtensionHostProfileService = createDecorator("extensionHostProfileService");

var CONTEXT_PROFILE_SESSION_STATE = new RawContextKey("profileSessionState", "none");

var CONTEXT_EXTENSION_HOST_PROFILE_RECORDED = new RawContextKey("extensionHostProfileRecorded", false);

var ProfileSessionState = /* @__PURE__ */ ((ProfileSessionState2) => {
  ProfileSessionState2[ProfileSessionState2["None"] = 0] = "None";
  ProfileSessionState2[ProfileSessionState2["Starting"] = 1] = "Starting";
  ProfileSessionState2[ProfileSessionState2["Running"] = 2] = "Running";
  ProfileSessionState2[ProfileSessionState2["Stopping"] = 3] = "Stopping";
  return ProfileSessionState2;
})(ProfileSessionState || {});

var RuntimeExtensionsEditor = class extends AbstractRuntimeExtensionsEditor {
  constructor(group2, telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService, _extensionHostProfileService, extensionFeaturesManagementService, hoverService, menuService) {
    super(group2, telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService, extensionFeaturesManagementService, hoverService, menuService);
    this._extensionHostProfileService = _extensionHostProfileService;
    this._profileInfo = this._extensionHostProfileService.lastProfile;
    this._extensionsHostRecorded = CONTEXT_EXTENSION_HOST_PROFILE_RECORDED.bindTo(contextKeyService);
    this._profileSessionState = CONTEXT_PROFILE_SESSION_STATE.bindTo(contextKeyService);
    this._register(this._extensionHostProfileService.onDidChangeLastProfile(() => {
      this._profileInfo = this._extensionHostProfileService.lastProfile;
      this._extensionsHostRecorded.set(!!this._profileInfo);
      this._updateExtensions();
    }));
    this._register(this._extensionHostProfileService.onDidChangeState(() => {
      const state = this._extensionHostProfileService.state;
      this._profileSessionState.set(ProfileSessionState[state].toLowerCase());
    }));
  }
  _getProfileInfo() {
    return this._profileInfo;
  }
  _getUnresponsiveProfile(extensionId) {
    return this._extensionHostProfileService.getUnresponsiveProfile(extensionId);
  }
  _createSlowExtensionAction(element) {
    if (element.unresponsiveProfile) {
      return this._instantiationService.createInstance(SlowExtensionAction, element.description, element.unresponsiveProfile);
    }
    return null;
  }
  _createReportExtensionIssueAction(element) {
    if (element.marketplaceInfo) {
      return this._instantiationService.createInstance(ReportExtensionIssueAction, element.description);
    }
    return null;
  }
};

RuntimeExtensionsEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IExtensionsWorkbenchService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, ILabelService),
  __decorateParam(11, IWorkbenchEnvironmentService),
  __decorateParam(12, IClipboardService),
  __decorateParam(13, IExtensionHostProfileService),
  __decorateParam(14, IExtensionFeaturesManagementService),
  __decorateParam(15, IHoverService),
  __decorateParam(16, IMenuService)
], RuntimeExtensionsEditor);

var StartExtensionHostProfileAction = class _StartExtensionHostProfileAction extends Action2 {
  static {
    this.ID = "workbench.extensions.action.extensionHostProfile";
  }
  static {
    this.LABEL = localize(15645, null);
  }
  constructor() {
    super({
      id: _StartExtensionHostProfileAction.ID,
      title: { value: _StartExtensionHostProfileAction.LABEL, original: "Start Extension Host Profile" },
      precondition: CONTEXT_PROFILE_SESSION_STATE.isEqualTo("none"),
      icon: Codicon.circleFilled,
      menu: [{
        id: MenuId.EditorTitle,
        when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID), CONTEXT_PROFILE_SESSION_STATE.notEqualsTo("running")),
        group: "navigation"
      }, {
        id: MenuId.ExtensionEditorContextMenu,
        when: CONTEXT_PROFILE_SESSION_STATE.notEqualsTo("running"),
        group: "profiling"
      }]
    });
  }
  run(accessor) {
    const extensionHostProfileService = accessor.get(IExtensionHostProfileService);
    extensionHostProfileService.startProfiling();
    return Promise.resolve();
  }
};

var StopExtensionHostProfileAction = class _StopExtensionHostProfileAction extends Action2 {
  static {
    this.ID = "workbench.extensions.action.stopExtensionHostProfile";
  }
  static {
    this.LABEL = localize(15649, null);
  }
  constructor() {
    super({
      id: _StopExtensionHostProfileAction.ID,
      title: { value: _StopExtensionHostProfileAction.LABEL, original: "Stop Extension Host Profile" },
      icon: Codicon.debugStop,
      menu: [{
        id: MenuId.EditorTitle,
        when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID), CONTEXT_PROFILE_SESSION_STATE.isEqualTo("running")),
        group: "navigation"
      }, {
        id: MenuId.ExtensionEditorContextMenu,
        when: CONTEXT_PROFILE_SESSION_STATE.isEqualTo("running"),
        group: "profiling"
      }]
    });
  }
  run(accessor) {
    const extensionHostProfileService = accessor.get(IExtensionHostProfileService);
    extensionHostProfileService.stopProfiling();
    return Promise.resolve();
  }
};

var OpenExtensionHostProfileACtion = class _OpenExtensionHostProfileACtion extends Action2 {
  static {
    this.LABEL = localize(15646, null);
  }
  static {
    this.ID = "workbench.extensions.action.openExtensionHostProfile";
  }
  constructor() {
    super({
      id: _OpenExtensionHostProfileACtion.ID,
      title: { value: _OpenExtensionHostProfileACtion.LABEL, original: "Open Extension Host Profile" },
      precondition: CONTEXT_EXTENSION_HOST_PROFILE_RECORDED,
      icon: Codicon.graph,
      menu: [{
        id: MenuId.EditorTitle,
        when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID)),
        group: "navigation"
      }, {
        id: MenuId.ExtensionEditorContextMenu,
        when: CONTEXT_EXTENSION_HOST_PROFILE_RECORDED,
        group: "profiling"
      }]
    });
  }
  async run(accessor) {
    const extensionHostProfileService = accessor.get(IExtensionHostProfileService);
    const commandService = accessor.get(ICommandService);
    const editorService = accessor.get(IEditorService);
    if (!extensionHostProfileService.lastProfileSavedTo) {
      await commandService.executeCommand(SaveExtensionHostProfileAction.ID);
    }
    if (!extensionHostProfileService.lastProfileSavedTo) {
      return;
    }
    await editorService.openEditor({
      resource: extensionHostProfileService.lastProfileSavedTo,
      options: {
        revealIfOpened: true,
        override: "jsProfileVisualizer.cpuprofile.table"
      }
    }, SIDE_GROUP);
  }
};

var SaveExtensionHostProfileAction = class _SaveExtensionHostProfileAction extends Action2 {
  static {
    this.LABEL = localize(15647, null);
  }
  static {
    this.ID = "workbench.extensions.action.saveExtensionHostProfile";
  }
  constructor() {
    super({
      id: _SaveExtensionHostProfileAction.ID,
      title: { value: _SaveExtensionHostProfileAction.LABEL, original: "Save Extension Host Profile" },
      precondition: CONTEXT_EXTENSION_HOST_PROFILE_RECORDED,
      icon: Codicon.saveAll,
      menu: [{
        id: MenuId.EditorTitle,
        when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID)),
        group: "navigation"
      }, {
        id: MenuId.ExtensionEditorContextMenu,
        when: CONTEXT_EXTENSION_HOST_PROFILE_RECORDED,
        group: "profiling"
      }]
    });
  }
  run(accessor) {
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    const extensionHostProfileService = accessor.get(IExtensionHostProfileService);
    const fileService = accessor.get(IFileService);
    const fileDialogService = accessor.get(IFileDialogService);
    return this._asyncRun(environmentService, extensionHostProfileService, fileService, fileDialogService);
  }
  async _asyncRun(environmentService, extensionHostProfileService, fileService, fileDialogService) {
    const picked = await fileDialogService.showSaveDialog({
      title: localize(15648, null),
      availableFileSystems: [Schemas.file],
      defaultUri: joinPath(await fileDialogService.defaultFilePath(), `CPU-${(/* @__PURE__ */ new Date()).toISOString().replace(/[\-:]/g, "")}.cpuprofile`),
      filters: [{
        name: "CPU Profiles",
        extensions: ["cpuprofile", "txt"]
      }]
    });
    if (!picked) {
      return;
    }
    const profileInfo = extensionHostProfileService.lastProfile;
    let dataToWrite = profileInfo ? profileInfo.data : {};
    let savePath = picked.fsPath;
    if (environmentService.isBuilt) {
      dataToWrite = Utils.rewriteAbsolutePaths(dataToWrite, "piiRemoved");
      savePath = savePath + ".txt";
    }
    const saveURI = URI.file(savePath);
    extensionHostProfileService.lastProfileSavedTo = saveURI;
    return fileService.writeFile(saveURI, VSBuffer.fromString(JSON.stringify(profileInfo ? profileInfo.data : {}, null, "	")));
  }
};
export { IExtensionHostProfileService, CONTEXT_PROFILE_SESSION_STATE, CONTEXT_EXTENSION_HOST_PROFILE_RECORDED, ProfileSessionState, RuntimeExtensionsEditor, StartExtensionHostProfileAction, StopExtensionHostProfileAction, OpenExtensionHostProfileACtion, SaveExtensionHostProfileAction };
