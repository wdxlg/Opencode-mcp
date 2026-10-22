// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/remote.ts
import { $, append, disposableWindowInterval } from "./module-0075.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { documentationIcon, getStartedIcon, remoteExplorerViewIcon, reportIssuesIcon, reviewIssuesIcon } from "./module-1535.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getVirtualWorkspaceLocation } from "./module-0937.mjs";
import { Schemas } from "./module-0033.mjs";
import { ViewPane } from "./module-1334.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Extensions13, IViewDescriptorService } from "./module-1094.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IRemoteExplorerService } from "./module-1413.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWalkthroughsService } from "./module-3282.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { FilterViewPaneContainer } from "./module-1670.mjs";
import { VIEWLET_ID5 } from "./module-1538.mjs";
import { SwitchRemoteViewItem } from "./module-3275.mjs";
import { Registry } from "./module-0090.mjs";
import { IExtensionService, isProposedApiEnabled } from "./module-0889.mjs";
import { isStringArray } from "./module-0010.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { ITimerService } from "./module-1183.mjs";
import { mainWindow } from "./module-0002.mjs";
import { getRemoteName } from "./module-0687.mjs";
import { ReloadWindowAction } from "./module-1512.mjs";
import { severity_default } from "./module-0266.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/remote/browser/remote.ts
var HelpTreeVirtualDelegate = class {
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return "HelpItemTemplate";
  }
};

var HelpTreeRenderer = class {
  constructor() {
    this.templateId = "HelpItemTemplate";
  }
  renderTemplate(container2) {
    container2.classList.add("remote-help-tree-node-item");
    const icon2 = append(container2, $(".remote-help-tree-node-item-icon"));
    const parent = container2;
    return { parent, icon: icon2 };
  }
  renderElement(element, index2, templateData) {
    const container2 = templateData.parent;
    append(container2, templateData.icon);
    templateData.icon.classList.add(...element.element.iconClasses);
    const labelContainer = append(container2, $(".help-item-label"));
    labelContainer.innerText = element.element.label;
  }
  disposeTemplate(templateData) {
  }
};

var HelpDataSource = class {
  hasChildren(element) {
    return element instanceof HelpModel;
  }
  getChildren(element) {
    if (element instanceof HelpModel && element.items) {
      return element.items;
    }
    return [];
  }
};

var HelpModel = class extends Disposable {
  constructor(viewModel, openerService, quickInputService, commandService, remoteExplorerService, environmentService, workspaceContextService, walkthroughsService) {
    super();
    this.viewModel = viewModel;
    this.openerService = openerService;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.remoteExplorerService = remoteExplorerService;
    this.environmentService = environmentService;
    this.workspaceContextService = workspaceContextService;
    this.walkthroughsService = walkthroughsService;
    this.updateItems();
    this._register(viewModel.onDidChangeHelpInformation(() => this.updateItems()));
  }
  createHelpItemValue(info, infoKey) {
    return new HelpItemValue(
      this.commandService,
      this.walkthroughsService,
      info.extensionDescription,
      typeof info.remoteName === "string" ? [info.remoteName] : info.remoteName,
      info.virtualWorkspace,
      info[infoKey]
    );
  }
  updateItems() {
    const helpItems = [];
    const getStarted = this.viewModel.helpInformation.filter((info) => info.getStarted);
    if (getStarted.length) {
      const helpItemValues = getStarted.map((info) => this.createHelpItemValue(info, "getStarted"));
      const getStartedHelpItem = this.items?.find((item) => item.icon === getStartedIcon) ?? new GetStartedHelpItem(
        getStartedIcon,
        localize(18474, null),
        helpItemValues,
        this.quickInputService,
        this.environmentService,
        this.openerService,
        this.remoteExplorerService,
        this.workspaceContextService,
        this.commandService
      );
      getStartedHelpItem.values = helpItemValues;
      helpItems.push(getStartedHelpItem);
    }
    const documentation = this.viewModel.helpInformation.filter((info) => info.documentation);
    if (documentation.length) {
      const helpItemValues = documentation.map((info) => this.createHelpItemValue(info, "documentation"));
      const documentationHelpItem = this.items?.find((item) => item.icon === documentationIcon) ?? new HelpItem(
        documentationIcon,
        localize(18473, null),
        helpItemValues,
        this.quickInputService,
        this.environmentService,
        this.openerService,
        this.remoteExplorerService,
        this.workspaceContextService
      );
      documentationHelpItem.values = helpItemValues;
      helpItems.push(documentationHelpItem);
    }
    const issues = this.viewModel.helpInformation.filter((info) => info.issues);
    if (issues.length) {
      const helpItemValues = issues.map((info) => this.createHelpItemValue(info, "issues"));
      const reviewIssuesHelpItem = this.items?.find((item) => item.icon === reviewIssuesIcon) ?? new HelpItem(
        reviewIssuesIcon,
        localize(18475, null),
        helpItemValues,
        this.quickInputService,
        this.environmentService,
        this.openerService,
        this.remoteExplorerService,
        this.workspaceContextService
      );
      reviewIssuesHelpItem.values = helpItemValues;
      helpItems.push(reviewIssuesHelpItem);
    }
    if (helpItems.length) {
      const helpItemValues = this.viewModel.helpInformation.map((info) => this.createHelpItemValue(info, "reportIssue"));
      const issueReporterItem = this.items?.find((item) => item.icon === reportIssuesIcon) ?? new IssueReporterItem(
        reportIssuesIcon,
        localize(18476, null),
        helpItemValues,
        this.quickInputService,
        this.environmentService,
        this.commandService,
        this.openerService,
        this.remoteExplorerService,
        this.workspaceContextService
      );
      issueReporterItem.values = helpItemValues;
      helpItems.push(issueReporterItem);
    }
    if (helpItems.length) {
      this.items = helpItems;
    }
  }
};

var HelpItemValue = class {
  constructor(commandService, walkthroughService, extensionDescription, remoteAuthority, virtualWorkspace, urlOrCommandOrId) {
    this.commandService = commandService;
    this.walkthroughService = walkthroughService;
    this.extensionDescription = extensionDescription;
    this.remoteAuthority = remoteAuthority;
    this.virtualWorkspace = virtualWorkspace;
    this.urlOrCommandOrId = urlOrCommandOrId;
  }
  get description() {
    return this.getUrl().then(() => this._description);
  }
  get url() {
    return this.getUrl();
  }
  async getUrl() {
    if (this._url === void 0) {
      if (typeof this.urlOrCommandOrId === "string") {
        const url = URI.parse(this.urlOrCommandOrId);
        if (url.authority) {
          this._url = this.urlOrCommandOrId;
        } else {
          const urlCommand = this.commandService.executeCommand(this.urlOrCommandOrId).then((result) => {
            this._url = result;
            return this._url;
          });
          const emptyString = new Promise((resolve3) => setTimeout(() => resolve3(""), 500));
          this._url = await Promise.race([urlCommand, emptyString]);
        }
      } else if (this.urlOrCommandOrId?.id) {
        try {
          const walkthroughId = `${this.extensionDescription.id}#${this.urlOrCommandOrId.id}`;
          const walkthrough = await this.walkthroughService.getWalkthrough(walkthroughId);
          this._description = walkthrough.title;
          this._url = walkthroughId;
        } catch {
        }
      }
    }
    if (this._url === void 0) {
      this._url = "";
    }
    return this._url;
  }
};

var HelpItemBase = class {
  constructor(icon2, label3, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService) {
    this.icon = icon2;
    this.label = label3;
    this.values = values;
    this.quickInputService = quickInputService;
    this.environmentService = environmentService;
    this.remoteExplorerService = remoteExplorerService;
    this.workspaceContextService = workspaceContextService;
    this.iconClasses = [];
    this.iconClasses.push(...ThemeIcon.asClassNameArray(icon2));
    this.iconClasses.push("remote-help-tree-node-item-icon");
  }
  async getActions() {
    return (await Promise.all(this.values.map(async (value2) => {
      return {
        label: value2.extensionDescription.displayName || value2.extensionDescription.identifier.value,
        description: await value2.description ?? await value2.url,
        url: await value2.url,
        extensionDescription: value2.extensionDescription
      };
    }))).filter((item) => item.description);
  }
  async handleClick() {
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (remoteAuthority) {
      for (let i2 = 0; i2 < this.remoteExplorerService.targetType.length; i2++) {
        if (remoteAuthority.startsWith(this.remoteExplorerService.targetType[i2])) {
          for (const value2 of this.values) {
            if (value2.remoteAuthority) {
              for (const authority of value2.remoteAuthority) {
                if (remoteAuthority.startsWith(authority)) {
                  await this.takeAction(value2.extensionDescription, await value2.url);
                  return;
                }
              }
            }
          }
        }
      }
    } else {
      const virtualWorkspace = getVirtualWorkspaceLocation(this.workspaceContextService.getWorkspace())?.scheme;
      if (virtualWorkspace) {
        for (let i2 = 0; i2 < this.remoteExplorerService.targetType.length; i2++) {
          for (const value2 of this.values) {
            if (value2.virtualWorkspace && value2.remoteAuthority) {
              for (const authority of value2.remoteAuthority) {
                if (this.remoteExplorerService.targetType[i2].startsWith(authority) && virtualWorkspace.startsWith(value2.virtualWorkspace)) {
                  await this.takeAction(value2.extensionDescription, await value2.url);
                  return;
                }
              }
            }
          }
        }
      }
    }
    if (this.values.length > 1) {
      const actions = await this.getActions();
      if (actions.length) {
        const action = await this.quickInputService.pick(actions, { placeHolder: localize(18462, null) });
        if (action) {
          await this.takeAction(action.extensionDescription, action.url);
        }
      }
    } else {
      await this.takeAction(this.values[0].extensionDescription, await this.values[0].url);
    }
  }
};

var GetStartedHelpItem = class extends HelpItemBase {
  constructor(icon2, label3, values, quickInputService, environmentService, openerService, remoteExplorerService, workspaceContextService, commandService) {
    super(icon2, label3, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
    this.openerService = openerService;
    this.commandService = commandService;
  }
  async takeAction(extensionDescription, urlOrWalkthroughId) {
    if ([Schemas.http, Schemas.https].includes(URI.parse(urlOrWalkthroughId).scheme)) {
      this.openerService.open(urlOrWalkthroughId, { allowCommands: true });
      return;
    }
    this.commandService.executeCommand("workbench.action.openWalkthrough", urlOrWalkthroughId);
  }
};

var HelpItem = class extends HelpItemBase {
  constructor(icon2, label3, values, quickInputService, environmentService, openerService, remoteExplorerService, workspaceContextService) {
    super(icon2, label3, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
    this.openerService = openerService;
  }
  async takeAction(extensionDescription, url) {
    await this.openerService.open(URI.parse(url), { allowCommands: true });
  }
};

var IssueReporterItem = class extends HelpItemBase {
  constructor(icon2, label3, values, quickInputService, environmentService, commandService, openerService, remoteExplorerService, workspaceContextService) {
    super(icon2, label3, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
    this.commandService = commandService;
    this.openerService = openerService;
  }
  async getActions() {
    return Promise.all(this.values.map(async (value2) => {
      return {
        label: value2.extensionDescription.displayName || value2.extensionDescription.identifier.value,
        description: "",
        url: await value2.url,
        extensionDescription: value2.extensionDescription
      };
    }));
  }
  async takeAction(extensionDescription, url) {
    if (!url) {
      await this.commandService.executeCommand("workbench.action.openIssueReporter", [extensionDescription.identifier.value]);
    } else {
      await this.openerService.open(URI.parse(url));
    }
  }
};

var HelpPanel = class extends ViewPane {
  constructor(viewModel, options3, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, remoteExplorerService, environmentService, themeService, hoverService, workspaceContextService, walkthroughsService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.viewModel = viewModel;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.remoteExplorerService = remoteExplorerService;
    this.environmentService = environmentService;
    this.workspaceContextService = workspaceContextService;
    this.walkthroughsService = walkthroughsService;
  }
  static {
    this.ID = "~remote.helpPanel";
  }
  static {
    this.TITLE = localize2(18472, "Help and feedback");
  }
  renderBody(container2) {
    super.renderBody(container2);
    container2.classList.add("remote-help");
    const treeContainer = document.createElement("div");
    treeContainer.classList.add("remote-help-content");
    container2.appendChild(treeContainer);
    this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "RemoteHelp",
      treeContainer,
      new HelpTreeVirtualDelegate(),
      [new HelpTreeRenderer()],
      new HelpDataSource(),
      {
        accessibilityProvider: {
          getAriaLabel: (item) => {
            return item.label;
          },
          getWidgetAriaLabel: () => localize(18477, null)
        }
      }
    );
    const model = this._register(new HelpModel(this.viewModel, this.openerService, this.quickInputService, this.commandService, this.remoteExplorerService, this.environmentService, this.workspaceContextService, this.walkthroughsService));
    this.tree.setInput(model);
    this._register(Event2.debounce(this.tree.onDidOpen, (last, event) => event, 75, true)((e4) => {
      e4.element?.handleClick();
    }));
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.tree.layout(height, width2);
  }
};

HelpPanel = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IViewDescriptorService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IQuickInputService),
  __decorateParam(10, ICommandService),
  __decorateParam(11, IRemoteExplorerService),
  __decorateParam(12, IWorkbenchEnvironmentService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, IWorkspaceContextService),
  __decorateParam(16, IWalkthroughsService)
], HelpPanel);

var HelpPanelDescriptor = class {
  constructor(viewModel) {
    this.id = HelpPanel.ID;
    this.name = HelpPanel.TITLE;
    this.canToggleVisibility = true;
    this.hideByDefault = false;
    this.group = "help@50";
    this.order = -10;
    this.ctorDescriptor = new SyncDescriptor(HelpPanel, [viewModel]);
  }
};

var RemoteViewPaneContainer = class extends FilterViewPaneContainer {
  constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, themeService, contextMenuService, extensionService, remoteExplorerService, viewDescriptorService, logService) {
    super(VIEWLET_ID5, remoteExplorerService.onDidChangeTargetType, configurationService, layoutService, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, viewDescriptorService, logService);
    this.remoteExplorerService = remoteExplorerService;
    this.helpPanelDescriptor = new HelpPanelDescriptor(this);
    this.helpInformation = [];
    this._onDidChangeHelpInformation = this._register(new Emitter());
    this.onDidChangeHelpInformation = this._onDidChangeHelpInformation.event;
    this.hasRegisteredHelpView = false;
    this.addConstantViewDescriptors([this.helpPanelDescriptor]);
    this._register(this.remoteSwitcher = this.instantiationService.createInstance(SwitchRemoteViewItem));
    this._register(this.remoteExplorerService.onDidChangeHelpInformation((extensions) => {
      this._setHelpInformation(extensions);
    }));
    this._setHelpInformation(this.remoteExplorerService.helpInformation);
    const viewsRegistry6 = Registry.as(Extensions13.ViewsRegistry);
    this.remoteSwitcher.createOptionItems(viewsRegistry6.getViews(this.viewContainer));
    this._register(viewsRegistry6.onViewsRegistered((e4) => {
      const remoteViews = [];
      for (const view of e4) {
        if (view.viewContainer.id === VIEWLET_ID5) {
          remoteViews.push(...view.views);
        }
      }
      if (remoteViews.length > 0) {
        this.remoteSwitcher.createOptionItems(remoteViews);
      }
    }));
    this._register(viewsRegistry6.onViewsDeregistered((e4) => {
      if (e4.viewContainer.id === VIEWLET_ID5) {
        this.remoteSwitcher.removeOptionItems(e4.views);
      }
    }));
  }
  _setHelpInformation(extensions) {
    const helpInformation = [];
    for (const extension of extensions) {
      this._handleRemoteInfoExtensionPoint(extension, helpInformation);
    }
    this.helpInformation = helpInformation;
    this._onDidChangeHelpInformation.fire();
    const viewsRegistry6 = Registry.as(Extensions13.ViewsRegistry);
    if (this.helpInformation.length && !this.hasRegisteredHelpView) {
      const view = viewsRegistry6.getView(this.helpPanelDescriptor.id);
      if (!view) {
        viewsRegistry6.registerViews([this.helpPanelDescriptor], this.viewContainer);
      }
      this.hasRegisteredHelpView = true;
    } else if (this.hasRegisteredHelpView) {
      viewsRegistry6.deregisterViews([this.helpPanelDescriptor], this.viewContainer);
      this.hasRegisteredHelpView = false;
    }
  }
  _handleRemoteInfoExtensionPoint(extension, helpInformation) {
    if (!isProposedApiEnabled(extension.description, "contribRemoteHelp")) {
      return;
    }
    if (!extension.value.documentation && !extension.value.getStarted && !extension.value.issues) {
      return;
    }
    helpInformation.push({
      extensionDescription: extension.description,
      getStarted: extension.value.getStarted,
      documentation: extension.value.documentation,
      reportIssue: extension.value.reportIssue,
      issues: extension.value.issues,
      remoteName: extension.value.remoteName,
      virtualWorkspace: extension.value.virtualWorkspace
    });
  }
  getFilterOn(viewDescriptor3) {
    return isStringArray(viewDescriptor3.remoteAuthority) ? viewDescriptor3.remoteAuthority[0] : viewDescriptor3.remoteAuthority;
  }
  setFilter(viewDescriptor3) {
    this.remoteExplorerService.targetType = isStringArray(viewDescriptor3.remoteAuthority) ? viewDescriptor3.remoteAuthority : [viewDescriptor3.remoteAuthority];
  }
  getTitle() {
    const title = localize(18470, null);
    return title;
  }
};

RemoteViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IExtensionService),
  __decorateParam(9, IRemoteExplorerService),
  __decorateParam(10, IViewDescriptorService),
  __decorateParam(11, ILogService)
], RemoteViewPaneContainer);

Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer(
  {
    id: VIEWLET_ID5,
    title: localize2(18471, "Remote Explorer"),
    ctorDescriptor: new SyncDescriptor(RemoteViewPaneContainer),
    hideIfEmpty: true,
    viewOrderDelegate: {
      getOrder: (group2) => {
        if (!group2) {
          return;
        }
        let matches2 = /^targets@(\d+)$/.exec(group2);
        if (matches2) {
          return -1e3;
        }
        matches2 = /^details(@(\d+))?$/.exec(group2);
        if (matches2) {
          return -500 + Number(matches2[2]);
        }
        matches2 = /^help(@(\d+))?$/.exec(group2);
        if (matches2) {
          return -10;
        }
        return;
      }
    },
    icon: remoteExplorerViewIcon,
    order: 4
  },
  0 /* Sidebar */
);

var RemoteMarkers = class {
  constructor(remoteAgentService, timerService) {
    remoteAgentService.getEnvironment().then((remoteEnv) => {
      if (remoteEnv) {
        timerService.setPerformanceMarks("server", remoteEnv.marks);
      }
    });
  }
};

RemoteMarkers = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, ITimerService)
], RemoteMarkers);

var VisibleProgress = class {
  get lastReport() {
    return this._lastReport;
  }
  constructor(progressService, location2, initialReport, buttons, onDidCancel) {
    this.location = location2;
    this._isDisposed = false;
    this._lastReport = initialReport;
    this._currentProgressPromiseResolve = null;
    this._currentProgress = null;
    this._currentTimer = null;
    const promise = new Promise((resolve3) => this._currentProgressPromiseResolve = resolve3);
    progressService.withProgress(
      { location: location2, buttons },
      (progress) => {
        if (!this._isDisposed) {
          this._currentProgress = progress;
        }
        return promise;
      },
      (choice) => onDidCancel(choice, this._lastReport)
    );
    if (this._lastReport) {
      this.report();
    }
  }
  dispose() {
    this._isDisposed = true;
    if (this._currentProgressPromiseResolve) {
      this._currentProgressPromiseResolve();
      this._currentProgressPromiseResolve = null;
    }
    this._currentProgress = null;
    if (this._currentTimer) {
      this._currentTimer.dispose();
      this._currentTimer = null;
    }
  }
  report(message) {
    if (message) {
      this._lastReport = message;
    }
    if (this._lastReport && this._currentProgress) {
      this._currentProgress.report({ message: this._lastReport });
    }
  }
  startTimer(completionTime) {
    this.stopTimer();
    this._currentTimer = new ReconnectionTimer(this, completionTime);
  }
  stopTimer() {
    if (this._currentTimer) {
      this._currentTimer.dispose();
      this._currentTimer = null;
    }
  }
};

var ReconnectionTimer = class {
  constructor(parent, completionTime) {
    this._parent = parent;
    this._completionTime = completionTime;
    this._renderInterval = disposableWindowInterval(mainWindow, () => this._render(), 1e3);
    this._render();
  }
  dispose() {
    this._renderInterval.dispose();
  }
  _render() {
    const remainingTimeMs = this._completionTime - Date.now();
    if (remainingTimeMs < 0) {
      return;
    }
    const remainingTime = Math.ceil(remainingTimeMs / 1e3);
    if (remainingTime === 1) {
      this._parent.report(localize(18466, null, remainingTime));
    } else {
      this._parent.report(localize(18465, null, remainingTime));
    }
  }
};

var DISCONNECT_PROMPT_TIME = 40 * 1e3;

var RemoteAgentConnectionStatusListener = class extends Disposable {
  constructor(remoteAgentService, progressService, dialogService, commandService, quickInputService, logService, environmentService, telemetryService) {
    super();
    this._reloadWindowShown = false;
    const connection = remoteAgentService.getConnection();
    if (connection) {
      let showProgress = function(location2, buttons, initialReport = null) {
        if (visibleProgress) {
          visibleProgress.dispose();
          visibleProgress = null;
        }
        if (!location2) {
          location2 = quickInputVisible ? 15 /* Notification */ : 20 /* Dialog */;
        }
        return new VisibleProgress(
          progressService,
          location2,
          initialReport,
          buttons.map((button) => button.label),
          (choice, lastReport) => {
            if (typeof choice !== "undefined" && buttons[choice]) {
              buttons[choice].callback();
            } else {
              if (location2 === 20 /* Dialog */) {
                visibleProgress = showProgress(15 /* Notification */, buttons, lastReport);
              } else {
                hideProgress();
              }
            }
          }
        );
      }, hideProgress = function() {
        if (visibleProgress) {
          visibleProgress.dispose();
          visibleProgress = null;
        }
      };
      let quickInputVisible = false;
      this._register(quickInputService.onShow(() => quickInputVisible = true));
      this._register(quickInputService.onHide(() => quickInputVisible = false));
      let visibleProgress = null;
      let reconnectWaitEvent = null;
      const disposableListener = this._register(new MutableDisposable());
      let reconnectionToken = "";
      let lastIncomingDataTime = 0;
      let reconnectionAttempts = 0;
      const reconnectButton = {
        label: localize(18467, null),
        callback: () => {
          reconnectWaitEvent?.skipWait();
        }
      };
      const reloadButton = {
        label: localize(18468, null),
        callback: () => {
          telemetryService.publicLog2("remoteReconnectionReload", {
            remoteName: getRemoteName(environmentService.remoteAuthority),
            reconnectionToken,
            millisSinceLastIncomingData: Date.now() - lastIncomingDataTime,
            attempt: reconnectionAttempts
          });
          commandService.executeCommand(ReloadWindowAction.ID);
        }
      };
      this._register(connection.onDidStateChange((e4) => {
        visibleProgress?.stopTimer();
        disposableListener.clear();
        switch (e4.type) {
          case 0 /* ConnectionLost */:
            reconnectionToken = e4.reconnectionToken;
            lastIncomingDataTime = Date.now() - e4.millisSinceLastIncomingData;
            reconnectionAttempts = 0;
            telemetryService.publicLog2("remoteConnectionLost", {
              remoteName: getRemoteName(environmentService.remoteAuthority),
              reconnectionToken: e4.reconnectionToken
            });
            if (visibleProgress || e4.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
              if (!visibleProgress) {
                visibleProgress = showProgress(null, [reconnectButton, reloadButton]);
              }
              visibleProgress.report(localize(18461, null));
            }
            break;
          case 1 /* ReconnectionWait */:
            if (visibleProgress) {
              reconnectWaitEvent = e4;
              visibleProgress = showProgress(null, [reconnectButton, reloadButton]);
              visibleProgress.startTimer(Date.now() + 1e3 * e4.durationSeconds);
            }
            break;
          case 2 /* ReconnectionRunning */:
            reconnectionToken = e4.reconnectionToken;
            lastIncomingDataTime = Date.now() - e4.millisSinceLastIncomingData;
            reconnectionAttempts = e4.attempt;
            telemetryService.publicLog2("remoteReconnectionRunning", {
              remoteName: getRemoteName(environmentService.remoteAuthority),
              reconnectionToken: e4.reconnectionToken,
              millisSinceLastIncomingData: e4.millisSinceLastIncomingData,
              attempt: e4.attempt
            });
            if (visibleProgress || e4.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
              visibleProgress = showProgress(null, [reloadButton]);
              visibleProgress.report(localize(18464, null));
              disposableListener.value = quickInputService.onShow(() => {
                if (visibleProgress && visibleProgress.location === 20 /* Dialog */) {
                  visibleProgress = showProgress(15 /* Notification */, [reloadButton], visibleProgress.lastReport);
                }
              });
            }
            break;
          case 3 /* ReconnectionPermanentFailure */:
            reconnectionToken = e4.reconnectionToken;
            lastIncomingDataTime = Date.now() - e4.millisSinceLastIncomingData;
            reconnectionAttempts = e4.attempt;
            telemetryService.publicLog2("remoteReconnectionPermanentFailure", {
              remoteName: getRemoteName(environmentService.remoteAuthority),
              reconnectionToken: e4.reconnectionToken,
              millisSinceLastIncomingData: e4.millisSinceLastIncomingData,
              attempt: e4.attempt,
              handled: e4.handled
            });
            hideProgress();
            if (e4.handled) {
              logService.info(`Error handled: Not showing a notification for the error.`);
            } else if (!this._reloadWindowShown) {
              this._reloadWindowShown = true;
              dialogService.confirm({
                type: severity_default.Error,
                message: localize(18463, null),
                primaryButton: localize(18469, null)
              }).then((result) => {
                if (result.confirmed) {
                  commandService.executeCommand(ReloadWindowAction.ID);
                }
              });
            }
            break;
          case 4 /* ConnectionGain */:
            reconnectionToken = e4.reconnectionToken;
            lastIncomingDataTime = Date.now() - e4.millisSinceLastIncomingData;
            reconnectionAttempts = e4.attempt;
            telemetryService.publicLog2("remoteConnectionGain", {
              remoteName: getRemoteName(environmentService.remoteAuthority),
              reconnectionToken: e4.reconnectionToken,
              millisSinceLastIncomingData: e4.millisSinceLastIncomingData,
              attempt: e4.attempt
            });
            hideProgress();
            break;
        }
      }));
    }
  }
};

RemoteAgentConnectionStatusListener = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IProgressService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, ITelemetryService)
], RemoteAgentConnectionStatusListener);
export { HelpTreeVirtualDelegate, HelpTreeRenderer, HelpDataSource, HelpModel, HelpItemValue, HelpItemBase, GetStartedHelpItem, HelpItem, IssueReporterItem, HelpPanel, HelpPanelDescriptor, RemoteViewPaneContainer, RemoteMarkers, VisibleProgress, ReconnectionTimer, DISCONNECT_PROMPT_TIME, RemoteAgentConnectionStatusListener };
