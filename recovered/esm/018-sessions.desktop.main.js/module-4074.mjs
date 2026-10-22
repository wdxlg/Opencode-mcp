// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor.ts
import { EditorPane } from "./module-1090.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { ExtensionIdentifierMap } from "./module-0688.mjs";
import { $, append, clearNode } from "./module-0075.mjs";
import { ExtensionIconWidget } from "./module-2255.mjs";
import { ActionBar } from "./module-0477.mjs";
import { dispose } from "./module-0012.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { LocalWebWorkerRunningLocation } from "./module-4019.mjs";
import { Schemas } from "./module-0033.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11, IExtensionFeaturesManagementService } from "./module-0879.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { errorIcon, warningIcon2 } from "./module-1851.mjs";
import { fromNow } from "./module-0120.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { editorBackground } from "./module-0229.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { Action2, IMenuService, MenuId } from "./module-0092.mjs";
import { getContextMenuActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IHoverService } from "./module-0520.mjs";
import { Categories } from "./module-0847.mjs";
import { IEditorService } from "./module-0935.mjs";
import { RuntimeExtensionsInput } from "./module-4073.mjs";


// src/vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor.ts
var AbstractRuntimeExtensionsEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, contextKeyService, _extensionsWorkbenchService, _extensionService, _notificationService, _contextMenuService, _instantiationService, storageService, _labelService, _environmentService, _clipboardService, _extensionFeaturesManagementService, _hoverService, _menuService) {
    super(AbstractRuntimeExtensionsEditor.ID, group2, telemetryService, themeService, storageService);
    this.contextKeyService = contextKeyService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._extensionService = _extensionService;
    this._notificationService = _notificationService;
    this._contextMenuService = _contextMenuService;
    this._instantiationService = _instantiationService;
    this._labelService = _labelService;
    this._environmentService = _environmentService;
    this._clipboardService = _clipboardService;
    this._extensionFeaturesManagementService = _extensionFeaturesManagementService;
    this._hoverService = _hoverService;
    this._menuService = _menuService;
    this._list = null;
    this._elements = null;
    this._updateSoon = this._register(new RunOnceScheduler(() => this._updateExtensions(), 200));
    this._register(this._extensionService.onDidChangeExtensionsStatus(() => this._updateSoon.schedule()));
    this._register(this._extensionFeaturesManagementService.onDidChangeAccessData(() => this._updateSoon.schedule()));
    this._updateExtensions();
  }
  static {
    this.ID = "workbench.editor.runtimeExtensions";
  }
  async _updateExtensions() {
    this._elements = await this._resolveExtensions();
    this._list?.splice(0, this._list.length, this._elements);
  }
  async _resolveExtensions() {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const extensionsDescriptions = this._extensionService.extensions.filter((extension) => {
      return Boolean(extension.main) || Boolean(extension.browser);
    });
    const marketplaceMap = new ExtensionIdentifierMap();
    const marketPlaceExtensions = await this._extensionsWorkbenchService.queryLocal();
    for (const extension of marketPlaceExtensions) {
      marketplaceMap.set(extension.identifier.id, extension);
    }
    const statusMap = this._extensionService.getExtensionsStatus();
    const segments = new ExtensionIdentifierMap();
    const profileInfo = this._getProfileInfo();
    if (profileInfo) {
      let currentStartTime = profileInfo.startTime;
      for (let i2 = 0, len = profileInfo.deltas.length; i2 < len; i2++) {
        const id2 = profileInfo.ids[i2];
        const delta2 = profileInfo.deltas[i2];
        let extensionSegments = segments.get(id2);
        if (!extensionSegments) {
          extensionSegments = [];
          segments.set(id2, extensionSegments);
        }
        extensionSegments.push(currentStartTime);
        currentStartTime = currentStartTime + delta2;
        extensionSegments.push(currentStartTime);
      }
    }
    let result = [];
    for (let i2 = 0, len = extensionsDescriptions.length; i2 < len; i2++) {
      const extensionDescription = extensionsDescriptions[i2];
      let extProfileInfo = null;
      if (profileInfo) {
        const extensionSegments = segments.get(extensionDescription.identifier) || [];
        let extensionTotalTime = 0;
        for (let j = 0, lenJ = extensionSegments.length / 2; j < lenJ; j++) {
          const startTime = extensionSegments[2 * j];
          const endTime = extensionSegments[2 * j + 1];
          extensionTotalTime += endTime - startTime;
        }
        extProfileInfo = {
          segments: extensionSegments,
          totalTime: extensionTotalTime
        };
      }
      result[i2] = {
        originalIndex: i2,
        description: extensionDescription,
        marketplaceInfo: marketplaceMap.get(extensionDescription.identifier),
        status: statusMap[extensionDescription.identifier.value],
        profileInfo: extProfileInfo || void 0,
        unresponsiveProfile: this._getUnresponsiveProfile(extensionDescription.identifier)
      };
    }
    result = result.filter((element) => element.status.activationStarted);
    const isUnresponsive = (extension) => extension.unresponsiveProfile === profileInfo;
    const profileTime = (extension) => extension.profileInfo?.totalTime ?? 0;
    const activationTime = (extension) => (extension.status.activationTimes?.codeLoadingTime ?? 0) + (extension.status.activationTimes?.activateCallTime ?? 0);
    result = result.sort((a, b) => {
      if (isUnresponsive(a) || isUnresponsive(b)) {
        return +isUnresponsive(b) - +isUnresponsive(a);
      } else if (profileTime(a) || profileTime(b)) {
        return profileTime(b) - profileTime(a);
      } else if (activationTime(a) || activationTime(b)) {
        return activationTime(b) - activationTime(a);
      }
      return a.originalIndex - b.originalIndex;
    });
    return result;
  }
  createEditor(parent) {
    parent.classList.add("runtime-extensions-editor");
    const TEMPLATE_ID = "runtimeExtensionElementTemplate";
    const delegate = new class {
      getHeight(element) {
        return 70;
      }
      getTemplateId(element) {
        return TEMPLATE_ID;
      }
    }();
    const renderer = {
      templateId: TEMPLATE_ID,
      renderTemplate: (root) => {
        const element = append(root, $(".extension"));
        const iconContainer = append(element, $(".icon-container"));
        const extensionIconWidget = this._instantiationService.createInstance(ExtensionIconWidget, iconContainer);
        const desc = append(element, $("div.desc"));
        const headerContainer = append(desc, $(".header-container"));
        const header2 = append(headerContainer, $(".header"));
        const name = append(header2, $("div.name"));
        const version2 = append(header2, $("span.version"));
        const msgContainer = append(desc, $("div.msg"));
        const actionbar = new ActionBar(desc);
        const listener = actionbar.onDidRun(({ error }) => error && this._notificationService.error(error));
        const timeContainer = append(element, $(".time"));
        const activationTime = append(timeContainer, $("div.activation-time"));
        const profileTime = append(timeContainer, $("div.profile-time"));
        const disposables = [extensionIconWidget, actionbar, listener];
        return {
          root,
          element,
          name,
          version: version2,
          actionbar,
          activationTime,
          profileTime,
          msgContainer,
          set extension(extension) {
            extensionIconWidget.extension = extension || null;
          },
          disposables,
          elementDisposables: []
        };
      },
      renderElement: (element, index2, data) => {
        data.elementDisposables = dispose(data.elementDisposables);
        data.extension = element.marketplaceInfo;
        data.root.classList.toggle("odd", index2 % 2 === 1);
        data.name.textContent = (element.marketplaceInfo?.displayName || element.description.identifier.value).substr(0, 50);
        data.version.textContent = element.description.version;
        const activationTimes = element.status.activationTimes;
        if (activationTimes) {
          const syncTime = activationTimes.codeLoadingTime + activationTimes.activateCallTime;
          data.activationTime.textContent = activationTimes.activationReason.startup ? `Startup Activation: ${syncTime}ms` : `Activation: ${syncTime}ms`;
        } else {
          data.activationTime.textContent = `Activating...`;
        }
        data.actionbar.clear();
        const slowExtensionAction = this._createSlowExtensionAction(element);
        if (slowExtensionAction) {
          data.actionbar.push(slowExtensionAction, { icon: false, label: true });
        }
        if (isNonEmptyArray(element.status.runtimeErrors)) {
          const reportExtensionIssueAction = this._createReportExtensionIssueAction(element);
          if (reportExtensionIssueAction) {
            data.actionbar.push(reportExtensionIssueAction, { icon: false, label: true });
          }
        }
        let title;
        if (activationTimes) {
          const activationId = activationTimes.activationReason.extensionId.value;
          const activationEvent = activationTimes.activationReason.activationEvent;
          if (activationEvent === "*") {
            title = localize(14987, null, activationId);
          } else if (/^workspaceContains:/.test(activationEvent)) {
            const fileNameOrGlob = activationEvent.substr("workspaceContains:".length);
            if (fileNameOrGlob.indexOf("*") >= 0 || fileNameOrGlob.indexOf("?") >= 0) {
              title = localize(14991, null, fileNameOrGlob, activationId);
            } else {
              title = localize(14990, null, fileNameOrGlob, activationId);
            }
          } else if (/^workspaceContainsTimeout:/.test(activationEvent)) {
            const glob = activationEvent.substr("workspaceContainsTimeout:".length);
            title = localize(14992, null, glob, activationId);
          } else if (activationEvent === "onStartupFinished") {
            title = localize(14988, null, activationId);
          } else if (/^onLanguage:/.test(activationEvent)) {
            const language2 = activationEvent.substr("onLanguage:".length);
            title = localize(14981, null, language2, activationId);
          } else {
            title = localize(14993, null, activationEvent, activationId);
          }
        } else {
          title = localize(14980, null);
        }
        data.elementDisposables.push(this._hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.activationTime, title));
        clearNode(data.msgContainer);
        if (this._getUnresponsiveProfile(element.description.identifier)) {
          const el = $("span", void 0, ...renderLabelWithIcons(` $(alert) Unresponsive`));
          const extensionHostFreezTitle = localize(14989, null);
          data.elementDisposables.push(this._hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), el, extensionHostFreezTitle));
          data.msgContainer.appendChild(el);
        }
        if (isNonEmptyArray(element.status.runtimeErrors)) {
          const el = $("span", void 0, ...renderLabelWithIcons(`$(bug) ${localize(14979, null, element.status.runtimeErrors.length)}`));
          data.msgContainer.appendChild(el);
        }
        if (element.status.messages && element.status.messages.length > 0) {
          const el = $("span", void 0, ...renderLabelWithIcons(`$(alert) ${element.status.messages[0].message}`));
          data.msgContainer.appendChild(el);
        }
        let extraLabel = null;
        if (element.status.runningLocation && element.status.runningLocation.equals(new LocalWebWorkerRunningLocation(0))) {
          extraLabel = `$(globe) web worker`;
        } else if (element.description.extensionLocation.scheme === Schemas.vscodeRemote) {
          const hostLabel = this._labelService.getHostLabel(Schemas.vscodeRemote, this._environmentService.remoteAuthority);
          if (hostLabel) {
            extraLabel = `$(remote) ${hostLabel}`;
          } else {
            extraLabel = `$(remote) ${element.description.extensionLocation.authority}`;
          }
        } else if (element.status.runningLocation && element.status.runningLocation.affinity > 0) {
          extraLabel = element.status.runningLocation instanceof LocalWebWorkerRunningLocation ? `$(globe) web worker ${element.status.runningLocation.affinity + 1}` : `$(server-process) local process ${element.status.runningLocation.affinity + 1}`;
        }
        if (extraLabel) {
          const el = $("span", void 0, ...renderLabelWithIcons(extraLabel));
          data.msgContainer.appendChild(el);
        }
        const features = Registry.as(Extensions11.ExtensionFeaturesRegistry).getExtensionFeatures();
        for (const feature of features) {
          const accessData = this._extensionFeaturesManagementService.getAccessData(element.description.identifier, feature.id);
          if (accessData) {
            const status2 = accessData?.current?.status;
            if (status2) {
              data.msgContainer.appendChild($("span", void 0, `${feature.label}: `));
              data.msgContainer.appendChild($("span", void 0, ...renderLabelWithIcons(`$(${status2.severity === Severity2.Error ? errorIcon.id : warningIcon2.id}) ${status2.message}`)));
            }
            if (accessData?.accessTimes.length > 0) {
              const element2 = $("span", void 0, `${localize(14982, null, feature.label, accessData.accessTimes.length)}${accessData.current ? localize(14985, null, accessData.current.accessTimes.length) : ""}`);
              if (accessData.current) {
                const title2 = localize(14983, null, fromNow(accessData.current.lastAccessed, true, true));
                data.elementDisposables.push(this._hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), element2, title2));
              }
              data.msgContainer.appendChild(element2);
            }
          }
        }
        if (element.profileInfo) {
          data.profileTime.textContent = `Profile: ${(element.profileInfo.totalTime / 1e3).toFixed(2)}ms`;
        } else {
          data.profileTime.textContent = "";
        }
      },
      disposeTemplate: (data) => {
        data.disposables = dispose(data.disposables);
        data.elementDisposables = dispose(data.elementDisposables);
      }
    };
    this._list = this._register(this._instantiationService.createInstance(
      WorkbenchList,
      "RuntimeExtensions",
      parent,
      delegate,
      [renderer],
      {
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        horizontalScrolling: false,
        overrideStyles: {
          listBackground: editorBackground
        },
        accessibilityProvider: new class {
          getWidgetAriaLabel() {
            return localize(14984, null);
          }
          getAriaLabel(element) {
            return element.description.name;
          }
        }()
      }
    ));
    this._list.splice(0, this._list.length, this._elements || void 0);
    this._register(this._list.onContextMenu((e4) => {
      if (!e4.element) {
        return;
      }
      const actions = [];
      actions.push(new Action(
        "runtimeExtensionsEditor.action.copyId",
        localize(14976, null, e4.element.description.identifier.value),
        void 0,
        true,
        () => {
          this._clipboardService.writeText(e4.element.description.identifier.value);
        }
      ));
      const reportExtensionIssueAction = this._createReportExtensionIssueAction(e4.element);
      if (reportExtensionIssueAction) {
        actions.push(reportExtensionIssueAction);
      }
      actions.push(new Separator());
      if (e4.element.marketplaceInfo) {
        actions.push(new Action("runtimeExtensionsEditor.action.disableWorkspace", localize(14978, null), void 0, true, () => this._extensionsWorkbenchService.setEnablement(e4.element.marketplaceInfo, 11 /* DisabledWorkspace */)));
        actions.push(new Action("runtimeExtensionsEditor.action.disable", localize(14977, null), void 0, true, () => this._extensionsWorkbenchService.setEnablement(e4.element.marketplaceInfo, 10 /* DisabledGlobally */)));
      }
      actions.push(new Separator());
      const menuActions = this._menuService.getMenuActions(MenuId.ExtensionEditorContextMenu, this.contextKeyService);
      actions.push(...getContextMenuActions(menuActions).secondary);
      this._contextMenuService.showContextMenu({
        getAnchor: () => e4.anchor,
        getActions: () => actions
      });
    }));
  }
  layout(dimension) {
    this._list?.layout(dimension.height);
  }
};

AbstractRuntimeExtensionsEditor = __decorateClass([
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
  __decorateParam(13, IExtensionFeaturesManagementService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, IMenuService)
], AbstractRuntimeExtensionsEditor);

var ShowRuntimeExtensionsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.showRuntimeExtensions",
      title: localize2(14986, "Show Running Extensions"),
      category: Categories.Developer,
      f1: true,
      menu: {
        id: MenuId.ViewContainerTitle,
        when: ContextKeyExpr.equals("viewContainer", "workbench.view.extensions"),
        group: "2_enablement",
        order: 3
      }
    });
  }
  async run(accessor) {
    await accessor.get(IEditorService).openEditor(RuntimeExtensionsInput.instance, { pinned: true });
  }
};
export { AbstractRuntimeExtensionsEditor, ShowRuntimeExtensionsAction };
