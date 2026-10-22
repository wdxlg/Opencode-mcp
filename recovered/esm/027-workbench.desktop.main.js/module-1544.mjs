// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/tunnelView.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { copyAddressIcon, forwardPortIcon, forwardedPortWithProcessIcon, forwardedPortWithoutProcessIcon, labelPortIcon, openBrowserIcon, openPreviewIcon, portsViewIcon, privatePortIcon, stopForwardIcon } from "./module-1543.mjs";
import { Event2 } from "./module-0017.mjs";
import { forwardedPortsViewEnabled, makeAddress, mapHasAddressLocalhostOrAllInterfaces, parseAddress } from "./module-1413.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteExplorerService, TUNNEL_VIEW_ID } from "./module-1414.mjs";
import { ITunnelService, isAllInterfaces, isLocalhost, isRemoteTunnel } from "./module-1409.mjs";
import { IMenuService, MenuId, MenuRegistry } from "./module-0092.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { $, EventType, addDisposableListener, addStandardDisposableListener, append, clearNode } from "./module-0075.mjs";
import { DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { IconLabel } from "./module-0640.mjs";
import { ActionBar } from "./module-0477.mjs";
import { createActionViewItem, getFlatActionBarActions } from "./module-0516.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { InputBox } from "./module-0600.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Codicon } from "./module-0085.mjs";
import { ViewPane } from "./module-1335.mjs";
import { WorkbenchTable } from "./module-0636.mjs";
import { ActionRunner } from "./module-0082.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IExternalUriOpenerService } from "./module-1295.mjs";
import { URI } from "./module-0032.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { registerColor } from "./module-0226.mjs";
import { STATUS_BAR_REMOTE_ITEM_BACKGROUND } from "./module-0912.mjs";


// src/vs/workbench/contrib/remote/browser/tunnelView.ts
var openPreviewEnabledContext = new RawContextKey("openPreviewEnabled", false);

var TunnelTreeVirtualDelegate = class {
  constructor(remoteExplorerService) {
    this.remoteExplorerService = remoteExplorerService;
    this.headerRowHeight = 22;
  }
  getHeight(row) {
    return row.tunnelType === "Add" /* Add */ && !this.remoteExplorerService.getEditableData(void 0) ? 30 : 22;
  }
};

var TunnelViewModel = class {
  constructor(remoteExplorerService, tunnelService) {
    this.remoteExplorerService = remoteExplorerService;
    this.tunnelService = tunnelService;
    this._candidates = /* @__PURE__ */ new Map();
    this.input = {
      label: localize(18579, null),
      icon: void 0,
      tunnelType: "Add" /* Add */,
      hasRunningProcess: false,
      remoteHost: "",
      remotePort: 0,
      processDescription: "",
      tooltipPostfix: "",
      iconTooltip: "",
      portTooltip: "",
      processTooltip: "",
      originTooltip: "",
      privacyTooltip: "",
      source: { source: 0 /* User */, description: "" },
      protocol: "http" /* Http */,
      privacy: {
        id: "private" /* Private */,
        themeIcon: privatePortIcon.id,
        label: localize(18603, null)
      },
      strip: () => void 0
    };
    this.model = remoteExplorerService.tunnelModel;
    this.onForwardedPortsChanged = Event2.any(this.model.onForwardPort, this.model.onClosePort, this.model.onPortName, this.model.onCandidatesChanged);
  }
  get all() {
    const result = [];
    this._candidates = /* @__PURE__ */ new Map();
    this.model.candidates.forEach((candidate) => {
      this._candidates.set(makeAddress(candidate.host, candidate.port), candidate);
    });
    if (this.model.forwarded.size > 0 || this.remoteExplorerService.getEditableData(void 0)) {
      result.push(...this.forwarded);
    }
    if (this.model.detected.size > 0) {
      result.push(...this.detected);
    }
    result.push(this.input);
    return result;
  }
  addProcessInfoFromCandidate(tunnelItem) {
    const key3 = makeAddress(tunnelItem.remoteHost, tunnelItem.remotePort);
    if (this._candidates.has(key3)) {
      tunnelItem.processDescription = this._candidates.get(key3).detail;
    }
  }
  get forwarded() {
    const forwarded = Array.from(this.model.forwarded.values()).map((tunnel) => {
      const tunnelItem = TunnelItem.createFromTunnel(this.remoteExplorerService, this.tunnelService, tunnel);
      this.addProcessInfoFromCandidate(tunnelItem);
      return tunnelItem;
    }).sort((a, b) => {
      if (a.remotePort === b.remotePort) {
        return a.remoteHost < b.remoteHost ? -1 : 1;
      } else {
        return a.remotePort < b.remotePort ? -1 : 1;
      }
    });
    return forwarded;
  }
  get detected() {
    return Array.from(this.model.detected.values()).map((tunnel) => {
      const tunnelItem = TunnelItem.createFromTunnel(this.remoteExplorerService, this.tunnelService, tunnel, "Detected" /* Detected */, false);
      this.addProcessInfoFromCandidate(tunnelItem);
      return tunnelItem;
    });
  }
  isEmpty() {
    return this.detected.length === 0 && (this.forwarded.length === 0 || this.forwarded.length === 1 && this.forwarded[0].tunnelType === "Add" /* Add */ && !this.remoteExplorerService.getEditableData(void 0));
  }
};

TunnelViewModel = __decorateClass([
  __decorateParam(0, IRemoteExplorerService),
  __decorateParam(1, ITunnelService)
], TunnelViewModel);

function emptyCell(item) {
  return { label: "", tunnel: item, editId: 0 /* None */, tooltip: "" };
}

var IconColumn = class {
  constructor() {
    this.label = "";
    this.tooltip = "";
    this.weight = 1;
    this.minimumWidth = 40;
    this.maximumWidth = 40;
    this.templateId = "actionbar";
  }
  project(row) {
    if (row.tunnelType === "Add" /* Add */) {
      return emptyCell(row);
    }
    const icon2 = row.processDescription ? forwardedPortWithProcessIcon : forwardedPortWithoutProcessIcon;
    let tooltip = "";
    if (row instanceof TunnelItem) {
      tooltip = `${row.iconTooltip} ${row.tooltipPostfix}`;
    }
    return {
      label: "",
      icon: icon2,
      tunnel: row,
      editId: 0 /* None */,
      tooltip
    };
  }
};

var PortColumn = class {
  constructor() {
    this.label = localize(18595, null);
    this.tooltip = localize(18596, null);
    this.weight = 1;
    this.templateId = "actionbar";
  }
  project(row) {
    const isAdd = row.tunnelType === "Add" /* Add */;
    const label3 = row.label;
    let tooltip = "";
    if (row instanceof TunnelItem && !isAdd) {
      tooltip = `${row.portTooltip} ${row.tooltipPostfix}`;
    } else {
      tooltip = label3;
    }
    return {
      label: label3,
      tunnel: row,
      menuId: MenuId.TunnelPortInline,
      editId: row.tunnelType === "Add" /* Add */ ? 1 /* New */ : 2 /* Label */,
      tooltip
    };
  }
};

var LocalAddressColumn = class _LocalAddressColumn {
  constructor() {
    this.label = localize(18588, null);
    this.tooltip = localize(18589, null);
    this.weight = 1;
    this.templateId = "actionbar";
  }
  project(row) {
    if (row.tunnelType === "Add" /* Add */) {
      return emptyCell(row);
    }
    const label3 = row.localAddress ?? "";
    let tooltip = label3;
    if (row instanceof TunnelItem) {
      tooltip = row.tooltipPostfix;
    }
    return {
      label: label3,
      menuId: MenuId.TunnelLocalAddressInline,
      tunnel: row,
      editId: 3 /* LocalPort */,
      tooltip,
      markdownTooltip: label3 ? _LocalAddressColumn.getHoverText(label3) : void 0
    };
  }
  static getHoverText(localAddress) {
    return function(configurationService) {
      const editorConf = configurationService.getValue("editor");
      let clickLabel = "";
      if (editorConf.multiCursorModifier === "ctrlCmd") {
        if (isMacintosh) {
          clickLabel = localize(18549, null);
        } else {
          clickLabel = localize(18548, null);
        }
      } else {
        if (isMacintosh) {
          clickLabel = localize(18550, null);
        } else {
          clickLabel = localize(18551, null);
        }
      }
      const markdown = new MarkdownString("", true);
      const uri5 = localAddress.startsWith("http") ? localAddress : `http://${localAddress}`;
      return markdown.appendLink(uri5, "Follow link").appendMarkdown(` (${clickLabel})`);
    };
  }
};

var RunningProcessColumn = class {
  constructor() {
    this.label = localize(18599, null);
    this.tooltip = localize(18600, null);
    this.weight = 2;
    this.templateId = "actionbar";
  }
  project(row) {
    if (row.tunnelType === "Add" /* Add */) {
      return emptyCell(row);
    }
    const label3 = row.processDescription ?? "";
    return { label: label3, tunnel: row, editId: 0 /* None */, tooltip: row instanceof TunnelItem ? row.processTooltip : "" };
  }
};

var OriginColumn = class {
  constructor() {
    this.label = localize(18593, null);
    this.tooltip = localize(18594, null);
    this.weight = 1;
    this.templateId = "actionbar";
  }
  project(row) {
    if (row.tunnelType === "Add" /* Add */) {
      return emptyCell(row);
    }
    const label3 = row.source.description;
    const tooltip = `${row instanceof TunnelItem ? row.originTooltip : ""}. ${row instanceof TunnelItem ? row.tooltipPostfix : ""}`;
    return { label: label3, menuId: MenuId.TunnelOriginInline, tunnel: row, editId: 0 /* None */, tooltip };
  }
};

var PrivacyColumn = class {
  constructor() {
    this.label = localize(18597, null);
    this.tooltip = localize(18598, null);
    this.weight = 1;
    this.templateId = "actionbar";
  }
  project(row) {
    if (row.tunnelType === "Add" /* Add */) {
      return emptyCell(row);
    }
    const label3 = row.privacy?.label;
    let tooltip = "";
    if (row instanceof TunnelItem) {
      tooltip = `${row.privacy.label} ${row.tooltipPostfix}`;
    }
    return { label: label3, tunnel: row, icon: { id: row.privacy.themeIcon }, editId: 0 /* None */, tooltip };
  }
};

var ActionBarRenderer = class {
  constructor(instantiationService, contextKeyService, menuService, contextViewService, remoteExplorerService, commandService, configurationService) {
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.contextViewService = contextViewService;
    this.remoteExplorerService = remoteExplorerService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.templateId = "actionbar";
    this._hoverDelegate = getDefaultHoverDelegate("mouse");
  }
  set actionRunner(actionRunner) {
    this._actionRunner = actionRunner;
  }
  renderTemplate(container3) {
    const cell = append(container3, $(".ports-view-actionbar-cell"));
    const icon2 = append(cell, $(".ports-view-actionbar-cell-icon"));
    const templateDisposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    templateDisposables.add(elementDisposables);
    const label3 = templateDisposables.add(new IconLabel(
      cell,
      {
        supportHighlights: true,
        hoverDelegate: this._hoverDelegate
      }
    ));
    const actionsContainer = append(cell, $(".actions"));
    const actionBar3 = templateDisposables.add(new ActionBar(actionsContainer, {
      actionViewItemProvider: createActionViewItem.bind(void 0, this.instantiationService),
      hoverDelegate: this._hoverDelegate
    }));
    return { label: label3, icon: icon2, actionBar: actionBar3, container: cell, templateDisposables, elementDisposables };
  }
  renderElement(element, index2, templateData) {
    templateData.actionBar.clear();
    templateData.icon.className = "ports-view-actionbar-cell-icon";
    templateData.icon.style.display = "none";
    templateData.label.setLabel("");
    templateData.label.element.style.display = "none";
    templateData.container.style.height = "22px";
    if (templateData.button) {
      templateData.button.element.style.display = "none";
    }
    templateData.container.style.paddingLeft = "0px";
    templateData.elementDisposables.clear();
    let editableData;
    if (element.editId === 1 /* New */ && (editableData = this.remoteExplorerService.getEditableData(void 0))) {
      this.renderInputBox(templateData, editableData);
    } else {
      editableData = this.remoteExplorerService.getEditableData(element.tunnel, element.editId);
      if (editableData) {
        this.renderInputBox(templateData, editableData);
      } else if (element.tunnel.tunnelType === "Add" /* Add */ && element.menuId === MenuId.TunnelPortInline) {
        this.renderButton(element, templateData);
      } else {
        this.renderActionBarItem(element, templateData);
      }
    }
  }
  renderButton(element, templateData) {
    templateData.container.style.paddingLeft = "7px";
    templateData.container.style.height = "28px";
    templateData.button = templateData.elementDisposables.add(new Button(templateData.container, defaultButtonStyles));
    templateData.button.label = element.label;
    templateData.button.element.title = element.tooltip;
    templateData.elementDisposables.add(templateData.button.onDidClick(() => {
      this.commandService.executeCommand(ForwardPortAction.INLINE_ID);
    }));
  }
  tunnelContext(tunnel) {
    let context2;
    if (tunnel instanceof TunnelItem) {
      context2 = tunnel.strip();
    }
    if (!context2) {
      context2 = {
        tunnelType: tunnel.tunnelType,
        remoteHost: tunnel.remoteHost,
        remotePort: tunnel.remotePort,
        localAddress: tunnel.localAddress,
        protocol: tunnel.protocol,
        localUri: tunnel.localUri,
        localPort: tunnel.localPort,
        name: tunnel.name,
        closeable: tunnel.closeable,
        source: tunnel.source,
        privacy: tunnel.privacy,
        processDescription: tunnel.processDescription,
        label: tunnel.label
      };
    }
    return context2;
  }
  renderActionBarItem(element, templateData) {
    templateData.label.element.style.display = "flex";
    templateData.label.setLabel(
      element.label,
      void 0,
      {
        title: element.markdownTooltip ? { markdown: element.markdownTooltip(this.configurationService), markdownNotSupportedFallback: element.tooltip } : element.tooltip,
        extraClasses: element.menuId === MenuId.TunnelLocalAddressInline ? ["ports-view-actionbar-cell-localaddress"] : void 0
      }
    );
    templateData.actionBar.context = this.tunnelContext(element.tunnel);
    templateData.container.style.paddingLeft = "10px";
    const context2 = [
      ["view", TUNNEL_VIEW_ID],
      [TunnelTypeContextKey.key, element.tunnel.tunnelType],
      [TunnelCloseableContextKey.key, element.tunnel.closeable],
      [TunnelPrivacyContextKey.key, element.tunnel.privacy.id],
      [TunnelProtocolContextKey.key, element.tunnel.protocol]
    ];
    const contextKeyService = this.contextKeyService.createOverlay(context2);
    if (element.menuId) {
      const menu = templateData.elementDisposables.add(this.menuService.createMenu(element.menuId, contextKeyService));
      let actions = getFlatActionBarActions(menu.getActions({ shouldForwardArgs: true }));
      if (actions) {
        const labelActions = actions.filter((action) => action.id.toLowerCase().indexOf("label") >= 0);
        if (labelActions.length > 1) {
          labelActions.sort((a, b) => a.label.length - b.label.length);
          labelActions.pop();
          actions = actions.filter((action) => labelActions.indexOf(action) < 0);
        }
        templateData.actionBar.push(actions, { icon: true, label: false });
        if (this._actionRunner) {
          templateData.actionBar.actionRunner = this._actionRunner;
        }
      }
    }
    if (element.icon) {
      templateData.icon.className = `ports-view-actionbar-cell-icon ${ThemeIcon.asClassName(element.icon)}`;
      templateData.icon.title = element.tooltip;
      templateData.icon.style.display = "inline";
    }
  }
  renderInputBox(templateData, editableData) {
    if (this.inputDone) {
      this.inputDone(false, false);
      this.inputDone = void 0;
    }
    const { container: container3 } = templateData;
    container3.style.paddingLeft = "5px";
    const value2 = editableData.startingValue || "";
    const inputBox = new InputBox(container3, this.contextViewService, {
      ariaLabel: localize(18581, null),
      validationOptions: {
        validation: (value3) => {
          const message = editableData.validationMessage(value3);
          if (!message) {
            return null;
          }
          return {
            content: message.content,
            formatContent: true,
            type: message.severity === Severity2.Error ? 3 /* ERROR */ : 1 /* INFO */
          };
        }
      },
      placeholder: editableData.placeholder || "",
      inputBoxStyles: defaultInputBoxStyles
    });
    inputBox.value = value2;
    inputBox.focus();
    inputBox.select({ start: 0, end: editableData.startingValue ? editableData.startingValue.length : 0 });
    const done = createSingleCallFunction(async (success, finishEditing) => {
      dispose(toDispose);
      if (this.inputDone) {
        this.inputDone = void 0;
      }
      inputBox.element.style.display = "none";
      const inputValue = inputBox.value;
      if (finishEditing) {
        return editableData.onFinish(inputValue, success);
      }
    });
    this.inputDone = done;
    const toDispose = [
      inputBox,
      addStandardDisposableListener(inputBox.inputElement, EventType.KEY_DOWN, async (e) => {
        if (e.equals(3 /* Enter */)) {
          e.stopPropagation();
          if (inputBox.validate() !== 3 /* ERROR */) {
            return done(true, true);
          } else {
            return done(false, true);
          }
        } else if (e.equals(9 /* Escape */)) {
          e.preventDefault();
          e.stopPropagation();
          return done(false, true);
        }
      }),
      addDisposableListener(inputBox.inputElement, EventType.BLUR, () => {
        return done(inputBox.validate() !== 3 /* ERROR */, true);
      })
    ];
    templateData.elementDisposables.add(toDisposable(() => {
      done(false, false);
    }));
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

ActionBarRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IRemoteExplorerService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IConfigurationService)
], ActionBarRenderer);

var TunnelItem = class _TunnelItem {
  constructor(tunnelType, remoteHost, remotePort, source, hasRunningProcess, protocol, localUri, localAddress, localPort, closeable, name, runningProcess, pid, _privacy, remoteExplorerService, tunnelService) {
    this.tunnelType = tunnelType;
    this.remoteHost = remoteHost;
    this.remotePort = remotePort;
    this.source = source;
    this.hasRunningProcess = hasRunningProcess;
    this.protocol = protocol;
    this.localUri = localUri;
    this.localAddress = localAddress;
    this.localPort = localPort;
    this.closeable = closeable;
    this.name = name;
    this.runningProcess = runningProcess;
    this.pid = pid;
    this._privacy = _privacy;
    this.remoteExplorerService = remoteExplorerService;
    this.tunnelService = tunnelService;
  }
  static createFromTunnel(remoteExplorerService, tunnelService, tunnel, type = "Forwarded" /* Forwarded */, closeable) {
    return new _TunnelItem(
      type,
      tunnel.remoteHost,
      tunnel.remotePort,
      tunnel.source,
      !!tunnel.hasRunningProcess,
      tunnel.protocol,
      tunnel.localUri,
      tunnel.localAddress,
      tunnel.localPort,
      closeable === void 0 ? tunnel.closeable : closeable,
      tunnel.name,
      tunnel.runningProcess,
      tunnel.pid,
      tunnel.privacy,
      remoteExplorerService,
      tunnelService
    );
  }
  /**
   * Removes all non-serializable properties from the tunnel
   * @returns A new TunnelItem without any services
   */
  strip() {
    return new _TunnelItem(
      this.tunnelType,
      this.remoteHost,
      this.remotePort,
      this.source,
      this.hasRunningProcess,
      this.protocol,
      this.localUri,
      this.localAddress,
      this.localPort,
      this.closeable,
      this.name,
      this.runningProcess,
      this.pid,
      this._privacy
    );
  }
  get label() {
    if (this.tunnelType === "Add" /* Add */ && this.name) {
      return this.name;
    }
    const portNumberLabel = isLocalhost(this.remoteHost) || isAllInterfaces(this.remoteHost) ? `${this.remotePort}` : `${this.remoteHost}:${this.remotePort}`;
    if (this.name) {
      return `${this.name} (${portNumberLabel})`;
    } else {
      return portNumberLabel;
    }
  }
  set processDescription(description) {
    this.runningProcess = description;
  }
  get processDescription() {
    let description = "";
    if (this.runningProcess) {
      if (this.pid && this.remoteExplorerService?.namedProcesses.has(this.pid)) {
        description = this.remoteExplorerService.namedProcesses.get(this.pid);
      } else {
        description = this.runningProcess.replace(/\0/g, " ").trim();
      }
      if (this.pid) {
        description += ` (${this.pid})`;
      }
    } else if (this.hasRunningProcess) {
      description = localize(18606, null);
    }
    return description;
  }
  get tooltipPostfix() {
    let information;
    if (this.localAddress) {
      information = localize(18577, null, this.remoteHost, this.remotePort, this.localAddress);
    } else {
      information = localize(18576, null, this.remoteHost, this.remotePort);
    }
    return information;
  }
  get iconTooltip() {
    const isAdd = this.tunnelType === "Add" /* Add */;
    if (!isAdd) {
      return `${this.processDescription ? localize(18592, null) : localize(18591, null)}`;
    } else {
      return this.label;
    }
  }
  get portTooltip() {
    const isAdd = this.tunnelType === "Add" /* Add */;
    if (!isAdd) {
      return `${this.name ? localize(18578, null, this.name) : ""}`;
    } else {
      return "";
    }
  }
  get processTooltip() {
    return this.processDescription ?? "";
  }
  get originTooltip() {
    return this.source.description;
  }
  get privacy() {
    if (this.tunnelService?.privacyOptions) {
      return this.tunnelService?.privacyOptions.find((element) => element.id === this._privacy) ?? {
        id: "",
        themeIcon: Codicon.question.id,
        label: localize(18604, null)
      };
    } else {
      return {
        id: "private" /* Private */,
        themeIcon: privatePortIcon.id,
        label: localize(18603, null)
      };
    }
  }
};

var TunnelTypeContextKey = new RawContextKey("tunnelType", "Add" /* Add */, true);

var TunnelCloseableContextKey = new RawContextKey("tunnelCloseable", false, true);

var TunnelPrivacyContextKey = new RawContextKey("tunnelPrivacy", void 0, true);

var TunnelPrivacyEnabledContextKey = new RawContextKey("tunnelPrivacyEnabled", false, true);

var TunnelProtocolContextKey = new RawContextKey("tunnelProtocol", "http" /* Http */, true);

var TunnelViewFocusContextKey = new RawContextKey("tunnelViewFocus", false, localize(18590, null));

var TunnelViewSelectionKeyName = "tunnelViewSelection";

var TunnelViewSelectionContextKey = new RawContextKey(TunnelViewSelectionKeyName, void 0, true);

var TunnelViewMultiSelectionKeyName = "tunnelViewMultiSelection";

var TunnelViewMultiSelectionContextKey = new RawContextKey(TunnelViewMultiSelectionKeyName, void 0, true);

var PortChangableContextKey = new RawContextKey("portChangable", false, true);

var ProtocolChangeableContextKey = new RawContextKey("protocolChangable", true, true);

var TunnelPanel = class extends ViewPane {
  constructor(viewModel, options3, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, menuService, themeService, remoteExplorerService, hoverService, tunnelService, contextViewService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.viewModel = viewModel;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.menuService = menuService;
    this.remoteExplorerService = remoteExplorerService;
    this.tunnelService = tunnelService;
    this.contextViewService = contextViewService;
    this.tableDisposables = this._register(new DisposableStore());
    this.isEditing = false;
    // TODO: Should this be removed?
    //@ts-expect-error
    this.titleActions = [];
    this.lastFocus = [];
    this.height = 0;
    this.width = 0;
    this.tunnelTypeContext = TunnelTypeContextKey.bindTo(contextKeyService);
    this.tunnelCloseableContext = TunnelCloseableContextKey.bindTo(contextKeyService);
    this.tunnelPrivacyContext = TunnelPrivacyContextKey.bindTo(contextKeyService);
    this.tunnelPrivacyEnabledContext = TunnelPrivacyEnabledContextKey.bindTo(contextKeyService);
    this.tunnelPrivacyEnabledContext.set(tunnelService.canChangePrivacy);
    this.protocolChangableContextKey = ProtocolChangeableContextKey.bindTo(contextKeyService);
    this.protocolChangableContextKey.set(tunnelService.canChangeProtocol);
    this.tunnelProtocolContext = TunnelProtocolContextKey.bindTo(contextKeyService);
    this.tunnelViewFocusContext = TunnelViewFocusContextKey.bindTo(contextKeyService);
    this.tunnelViewSelectionContext = TunnelViewSelectionContextKey.bindTo(contextKeyService);
    this.tunnelViewMultiSelectionContext = TunnelViewMultiSelectionContextKey.bindTo(contextKeyService);
    this.portChangableContextKey = PortChangableContextKey.bindTo(contextKeyService);
    const overlayContextKeyService = this.contextKeyService.createOverlay([["view", TunnelPanel.ID]]);
    const titleMenu = this._register(this.menuService.createMenu(MenuId.TunnelTitle, overlayContextKeyService));
    const updateActions = () => {
      this.titleActions = getFlatActionBarActions(titleMenu.getActions());
      this.updateActions();
    };
    this._register(titleMenu.onDidChange(updateActions));
    updateActions();
    this._register(toDisposable(() => {
      this.titleActions = [];
    }));
    this.registerPrivacyActions();
    this._register(Event2.once(this.tunnelService.onAddedTunnelProvider)(() => {
      let updated = false;
      if (this.tunnelPrivacyEnabledContext.get() === false) {
        this.tunnelPrivacyEnabledContext.set(tunnelService.canChangePrivacy);
        updated = true;
      }
      if (this.protocolChangableContextKey.get() === true) {
        this.protocolChangableContextKey.set(tunnelService.canChangeProtocol);
        updated = true;
      }
      if (updated) {
        updateActions();
        this.registerPrivacyActions();
        this.createTable();
        this.table?.layout(this.height, this.width);
      }
    }));
  }
  static {
    this.ID = TUNNEL_VIEW_ID;
  }
  static {
    this.TITLE = localize2(18553, "Ports");
  }
  registerPrivacyActions() {
    for (const privacyOption of this.tunnelService.privacyOptions) {
      const optionId = `remote.tunnel.privacy${privacyOption.id}`;
      CommandsRegistry.registerCommand(optionId, ChangeTunnelPrivacyAction.handler(privacyOption.id));
      MenuRegistry.appendMenuItem(MenuId.TunnelPrivacy, {
        order: 0,
        command: {
          id: optionId,
          title: privacyOption.label,
          toggled: TunnelPrivacyContextKey.isEqualTo(privacyOption.id)
        }
      });
    }
  }
  get portCount() {
    return this.remoteExplorerService.tunnelModel.forwarded.size + this.remoteExplorerService.tunnelModel.detected.size;
  }
  createTable() {
    if (!this.panelContainer) {
      return;
    }
    this.tableDisposables.clear();
    clearNode(this.panelContainer);
    const widgetContainer = append(this.panelContainer, $(".customview-tree"));
    widgetContainer.classList.add("ports-view");
    widgetContainer.classList.add("file-icon-themable-tree", "show-file-icons");
    const actionBarRenderer = new ActionBarRenderer(
      this.instantiationService,
      this.contextKeyService,
      this.menuService,
      this.contextViewService,
      this.remoteExplorerService,
      this.commandService,
      this.configurationService
    );
    const columns = [new IconColumn(), new PortColumn(), new LocalAddressColumn(), new RunningProcessColumn()];
    if (this.tunnelService.canChangePrivacy) {
      columns.push(new PrivacyColumn());
    }
    columns.push(new OriginColumn());
    this.table = this.instantiationService.createInstance(
      WorkbenchTable,
      "RemoteTunnels",
      widgetContainer,
      new TunnelTreeVirtualDelegate(this.remoteExplorerService),
      columns,
      [actionBarRenderer],
      {
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: (item) => {
            return item.label;
          }
        },
        multipleSelectionSupport: true,
        accessibilityProvider: {
          getAriaLabel: (item) => {
            if (item instanceof TunnelItem) {
              return `${item.tooltipPostfix} ${item.portTooltip} ${item.iconTooltip} ${item.processTooltip} ${item.originTooltip} ${this.tunnelService.canChangePrivacy ? item.privacy.label : ""}`;
            } else {
              return item.label;
            }
          },
          getWidgetAriaLabel: () => localize(18605, null)
        },
        openOnSingleClick: true
      }
    );
    const actionRunner = this.tableDisposables.add(new ActionRunner());
    actionBarRenderer.actionRunner = actionRunner;
    this.tableDisposables.add(this.table);
    this.tableDisposables.add(this.table.onContextMenu((e) => this.onContextMenu(e, actionRunner)));
    this.tableDisposables.add(this.table.onMouseDblClick((e) => this.onMouseDblClick(e)));
    this.tableDisposables.add(this.table.onDidChangeFocus((e) => this.onFocusChanged(e)));
    this.tableDisposables.add(this.table.onDidChangeSelection((e) => this.onSelectionChanged(e)));
    this.tableDisposables.add(this.table.onDidFocus(() => this.tunnelViewFocusContext.set(true)));
    this.tableDisposables.add(this.table.onDidBlur(() => this.tunnelViewFocusContext.set(false)));
    const rerender = () => this.table?.splice(0, Number.POSITIVE_INFINITY, this.viewModel.all);
    rerender();
    let lastPortCount = this.portCount;
    this.tableDisposables.add(Event2.debounce(this.viewModel.onForwardedPortsChanged, (_last, e) => e, 50)(() => {
      const newPortCount = this.portCount;
      if ((lastPortCount === 0 || newPortCount === 0) && lastPortCount !== newPortCount) {
        this._onDidChangeViewWelcomeState.fire();
      }
      lastPortCount = newPortCount;
      rerender();
    }));
    this.tableDisposables.add(this.table.onMouseClick((e) => {
      if (this.hasOpenLinkModifier(e.browserEvent) && this.table) {
        const selection = this.table.getSelectedElements();
        if (selection.length === 0 || selection.length === 1 && selection[0] === e.element) {
          this.commandService.executeCommand(OpenPortInBrowserAction.ID, e.element);
        }
      }
    }));
    this.tableDisposables.add(this.table.onDidOpen((e) => {
      if (!e.element || e.element.tunnelType !== "Forwarded" /* Forwarded */) {
        return;
      }
      if (e.browserEvent?.type === "dblclick") {
        this.commandService.executeCommand(LabelTunnelAction.ID);
      }
    }));
    this.tableDisposables.add(this.remoteExplorerService.onDidChangeEditable((e) => {
      this.isEditing = !!this.remoteExplorerService.getEditableData(e?.tunnel, e?.editId);
      this._onDidChangeViewWelcomeState.fire();
      if (!this.isEditing) {
        widgetContainer.classList.remove("highlight");
      }
      rerender();
      if (this.isEditing) {
        widgetContainer.classList.add("highlight");
        if (!e) {
          this.table?.reveal(this.table.indexOf(this.viewModel.input));
        }
      } else {
        if (e && e.tunnel.tunnelType !== "Add" /* Add */) {
          this.table?.setFocus(this.lastFocus);
        }
        this.focus();
      }
    }));
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.panelContainer = append(container3, $(".tree-explorer-viewlet-tree-view"));
    this.createTable();
  }
  shouldShowWelcome() {
    return this.viewModel.isEmpty() && !this.isEditing;
  }
  focus() {
    super.focus();
    this.table?.domFocus();
  }
  onFocusChanged(event) {
    if (event.indexes.length > 0 && event.elements.length > 0) {
      this.lastFocus = [...event.indexes];
    }
    const elements = event.elements;
    const item = elements && elements.length ? elements[0] : void 0;
    if (item) {
      this.tunnelViewSelectionContext.set(makeAddress(item.remoteHost, item.remotePort));
      this.tunnelTypeContext.set(item.tunnelType);
      this.tunnelCloseableContext.set(!!item.closeable);
      this.tunnelPrivacyContext.set(item.privacy.id);
      this.tunnelProtocolContext.set(item.protocol === "https" /* Https */ ? "https" /* Https */ : "http" /* Http */);
      this.portChangableContextKey.set(!!item.localPort);
    } else {
      this.tunnelTypeContext.reset();
      this.tunnelViewSelectionContext.reset();
      this.tunnelCloseableContext.reset();
      this.tunnelPrivacyContext.reset();
      this.tunnelProtocolContext.reset();
      this.portChangableContextKey.reset();
    }
  }
  hasOpenLinkModifier(e) {
    const editorConf = this.configurationService.getValue("editor");
    let modifierKey = false;
    if (editorConf.multiCursorModifier === "ctrlCmd") {
      modifierKey = e.altKey;
    } else {
      if (isMacintosh) {
        modifierKey = e.metaKey;
      } else {
        modifierKey = e.ctrlKey;
      }
    }
    return modifierKey;
  }
  onSelectionChanged(event) {
    const elements = event.elements;
    if (elements.length > 1) {
      this.tunnelViewMultiSelectionContext.set(elements.map((element) => makeAddress(element.remoteHost, element.remotePort)));
    } else {
      this.tunnelViewMultiSelectionContext.set(void 0);
    }
  }
  onContextMenu(event, actionRunner) {
    if (event.element !== void 0 && !(event.element instanceof TunnelItem)) {
      return;
    }
    event.browserEvent.preventDefault();
    event.browserEvent.stopPropagation();
    const node = event.element;
    if (node) {
      this.table?.setFocus([this.table.indexOf(node)]);
      this.tunnelTypeContext.set(node.tunnelType);
      this.tunnelCloseableContext.set(!!node.closeable);
      this.tunnelPrivacyContext.set(node.privacy.id);
      this.tunnelProtocolContext.set(node.protocol);
      this.portChangableContextKey.set(!!node.localPort);
    } else {
      this.tunnelTypeContext.set("Add" /* Add */);
      this.tunnelCloseableContext.set(false);
      this.tunnelPrivacyContext.set(void 0);
      this.tunnelProtocolContext.set(void 0);
      this.portChangableContextKey.set(false);
    }
    this.contextMenuService.showContextMenu({
      menuId: MenuId.TunnelContext,
      menuActionOptions: { shouldForwardArgs: true },
      contextKeyService: this.table?.contextKeyService,
      getAnchor: () => event.anchor,
      getActionViewItem: (action) => {
        const keybinding = this.keybindingService.lookupKeybinding(action.id);
        if (keybinding) {
          return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
        }
        return void 0;
      },
      onHide: (wasCancelled) => {
        if (wasCancelled) {
          this.table?.domFocus();
        }
      },
      getActionsContext: () => node?.strip(),
      actionRunner
    });
  }
  onMouseDblClick(e) {
    if (!e.element) {
      this.commandService.executeCommand(ForwardPortAction.INLINE_ID);
    }
  }
  layoutBody(height, width2) {
    this.height = height;
    this.width = width2;
    super.layoutBody(height, width2);
    this.table?.layout(height, width2);
  }
};

TunnelPanel = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IViewDescriptorService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IQuickInputService),
  __decorateParam(10, ICommandService),
  __decorateParam(11, IMenuService),
  __decorateParam(12, IThemeService),
  __decorateParam(13, IRemoteExplorerService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, ITunnelService),
  __decorateParam(16, IContextViewService)
], TunnelPanel);

var TunnelPanelDescriptor = class {
  constructor(viewModel, environmentService) {
    this.id = TunnelPanel.ID;
    this.name = TunnelPanel.TITLE;
    this.canToggleVisibility = true;
    this.hideByDefault = false;
    // group is not actually used for views that are not extension contributed. Use order instead.
    this.group = "details@0";
    // -500 comes from the remote explorer viewOrderDelegate
    this.order = -500;
    this.canMoveView = true;
    this.containerIcon = portsViewIcon;
    this.ctorDescriptor = new SyncDescriptor(TunnelPanel, [viewModel]);
    this.remoteAuthority = environmentService.remoteAuthority ? environmentService.remoteAuthority.split("+")[0] : void 0;
  }
};

function isITunnelItem(item) {
  return item && item.tunnelType && item.remoteHost && item.source;
}

var LabelTunnelAction;

((LabelTunnelAction2) => {
  LabelTunnelAction2.ID = "remote.tunnel.label";
  LabelTunnelAction2.LABEL = localize(18567, null);
  LabelTunnelAction2.COMMAND_ID_KEYWORD = "label";
  function handler() {
    return async (accessor, arg) => {
      const remoteExplorerService = accessor.get(IRemoteExplorerService);
      let tunnelContext;
      if (isITunnelItem(arg)) {
        tunnelContext = arg;
      } else {
        const context2 = accessor.get(IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
        const tunnel = context2 ? remoteExplorerService.tunnelModel.forwarded.get(context2) : void 0;
        if (tunnel) {
          const tunnelService = accessor.get(ITunnelService);
          tunnelContext = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, tunnel);
        }
      }
      if (tunnelContext) {
        const tunnelItem = tunnelContext;
        return new Promise((resolve3) => {
          const startingValue = tunnelItem.name ? tunnelItem.name : `${tunnelItem.remotePort}`;
          remoteExplorerService.setEditable(tunnelItem, 2 /* Label */, {
            onFinish: async (value2, success) => {
              value2 = value2.trim();
              remoteExplorerService.setEditable(tunnelItem, 2 /* Label */, null);
              const changed = success && value2 !== startingValue;
              if (changed) {
                await remoteExplorerService.tunnelModel.name(tunnelItem.remoteHost, tunnelItem.remotePort, value2);
              }
              resolve3(changed ? { port: tunnelItem.remotePort, label: value2 } : void 0);
            },
            validationMessage: () => null,
            placeholder: localize(18582, null),
            startingValue
          });
        });
      }
      return void 0;
    };
  }
  LabelTunnelAction2.handler = handler;
})(LabelTunnelAction || (LabelTunnelAction = {}));

var invalidPortString = localize(18584, null);

var maxPortNumber = 65536;

var invalidPortNumberString = localize(18583, null, maxPortNumber);

var requiresSudoString = localize(18587, null);

var alreadyForwarded = localize(18586, null);

var ForwardPortAction;

((ForwardPortAction2) => {
  ForwardPortAction2.INLINE_ID = "remote.tunnel.forwardInline";
  ForwardPortAction2.COMMANDPALETTE_ID = "remote.tunnel.forwardCommandPalette";
  ForwardPortAction2.LABEL = localize2(18562, "Forward a Port");
  ForwardPortAction2.TREEITEM_LABEL = localize(18565, null);
  const forwardPrompt = localize(18566, null);
  function validateInput(remoteExplorerService, tunnelService, value2, canElevate) {
    const parsed = parseAddress(value2);
    if (!parsed) {
      return { content: invalidPortString, severity: Severity2.Error };
    } else if (parsed.port >= maxPortNumber) {
      return { content: invalidPortNumberString, severity: Severity2.Error };
    } else if (canElevate && tunnelService.isPortPrivileged(parsed.port)) {
      return { content: requiresSudoString, severity: Severity2.Info };
    } else if (mapHasAddressLocalhostOrAllInterfaces(remoteExplorerService.tunnelModel.forwarded, parsed.host, parsed.port)) {
      return { content: alreadyForwarded, severity: Severity2.Error };
    }
    return null;
  }
  function error(notificationService, tunnelOrError, host, port) {
    if (!tunnelOrError) {
      notificationService.warn(localize(18563, null, host, port));
    } else if (typeof tunnelOrError === "string") {
      notificationService.warn(localize(18564, null, host, port, tunnelOrError));
    }
  }
  function inlineHandler() {
    return async (accessor, arg) => {
      const remoteExplorerService = accessor.get(IRemoteExplorerService);
      const notificationService = accessor.get(INotificationService);
      const tunnelService = accessor.get(ITunnelService);
      remoteExplorerService.setEditable(void 0, 1 /* New */, {
        onFinish: async (value2, success) => {
          remoteExplorerService.setEditable(void 0, 1 /* New */, null);
          let parsed;
          if (success && (parsed = parseAddress(value2))) {
            remoteExplorerService.forward({
              remote: { host: parsed.host, port: parsed.port },
              elevateIfNeeded: true
            }).then((tunnelOrError) => error(notificationService, tunnelOrError, parsed.host, parsed.port));
          }
        },
        validationMessage: (value2) => validateInput(remoteExplorerService, tunnelService, value2, tunnelService.canElevate),
        placeholder: forwardPrompt
      });
    };
  }
  ForwardPortAction2.inlineHandler = inlineHandler;
  function commandPaletteHandler() {
    return async (accessor, arg) => {
      const remoteExplorerService = accessor.get(IRemoteExplorerService);
      const notificationService = accessor.get(INotificationService);
      const viewsService = accessor.get(IViewsService);
      const quickInputService = accessor.get(IQuickInputService);
      const tunnelService = accessor.get(ITunnelService);
      await viewsService.openView(TunnelPanel.ID, true);
      const value2 = await quickInputService.input({
        prompt: forwardPrompt,
        validateInput: (value3) => Promise.resolve(validateInput(remoteExplorerService, tunnelService, value3, tunnelService.canElevate))
      });
      let parsed;
      if (value2 && (parsed = parseAddress(value2))) {
        remoteExplorerService.forward({
          remote: { host: parsed.host, port: parsed.port },
          elevateIfNeeded: true
        }).then((tunnel) => error(notificationService, tunnel, parsed.host, parsed.port));
      }
    };
  }
  ForwardPortAction2.commandPaletteHandler = commandPaletteHandler;
})(ForwardPortAction || (ForwardPortAction = {}));

function makeTunnelPicks(tunnels, remoteExplorerService, tunnelService) {
  const picks = tunnels.map((forwarded) => {
    const item = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, forwarded);
    return {
      label: item.label,
      description: item.processDescription,
      tunnel: item
    };
  });
  if (picks.length === 0) {
    picks.push({
      label: localize(18557, null, ForwardPortAction.LABEL.value)
    });
  }
  return picks;
}

var ClosePortAction;

((ClosePortAction2) => {
  ClosePortAction2.INLINE_ID = "remote.tunnel.closeInline";
  ClosePortAction2.COMMANDPALETTE_ID = "remote.tunnel.closeCommandPalette";
  ClosePortAction2.LABEL = localize2(18556, "Stop Forwarding Port");
  function inlineHandler() {
    return async (accessor, arg) => {
      const contextKeyService = accessor.get(IContextKeyService);
      const remoteExplorerService = accessor.get(IRemoteExplorerService);
      let ports = [];
      const multiSelectContext = contextKeyService.getContextKeyValue(TunnelViewMultiSelectionKeyName);
      if (multiSelectContext) {
        multiSelectContext.forEach((context2) => {
          const tunnel = remoteExplorerService.tunnelModel.forwarded.get(context2);
          if (tunnel) {
            ports?.push(tunnel);
          }
        });
      } else if (isITunnelItem(arg)) {
        ports = [arg];
      } else {
        const context2 = contextKeyService.getContextKeyValue(TunnelViewSelectionKeyName);
        const tunnel = context2 ? remoteExplorerService.tunnelModel.forwarded.get(context2) : void 0;
        if (tunnel) {
          ports = [tunnel];
        }
      }
      if (!ports || ports.length === 0) {
        return;
      }
      return Promise.all(ports.map((port) => remoteExplorerService.close({ host: port.remoteHost, port: port.remotePort }, "User" /* User */)));
    };
  }
  ClosePortAction2.inlineHandler = inlineHandler;
  function commandPaletteHandler() {
    return async (accessor) => {
      const quickInputService = accessor.get(IQuickInputService);
      const remoteExplorerService = accessor.get(IRemoteExplorerService);
      const tunnelService = accessor.get(ITunnelService);
      const commandService = accessor.get(ICommandService);
      const picks = makeTunnelPicks(Array.from(remoteExplorerService.tunnelModel.forwarded.values()).filter((tunnel) => tunnel.closeable), remoteExplorerService, tunnelService);
      const result = await quickInputService.pick(picks, { placeHolder: localize(18558, null) });
      if (result && result.tunnel) {
        await remoteExplorerService.close({ host: result.tunnel.remoteHost, port: result.tunnel.remotePort }, "User" /* User */);
      } else if (result) {
        await commandService.executeCommand(ForwardPortAction.COMMANDPALETTE_ID);
      }
    };
  }
  ClosePortAction2.commandPaletteHandler = commandPaletteHandler;
})(ClosePortAction || (ClosePortAction = {}));

var OpenPortInBrowserAction;

((OpenPortInBrowserAction2) => {
  OpenPortInBrowserAction2.ID = "remote.tunnel.open";
  OpenPortInBrowserAction2.LABEL = localize(18568, null);
  function handler() {
    return async (accessor, arg) => {
      let key3;
      if (isITunnelItem(arg)) {
        key3 = makeAddress(arg.remoteHost, arg.remotePort);
      } else if (isRemoteTunnel(arg)) {
        key3 = makeAddress(arg.tunnelRemoteHost, arg.tunnelRemotePort);
      }
      if (key3) {
        const model = accessor.get(IRemoteExplorerService).tunnelModel;
        const openerService = accessor.get(IOpenerService);
        return run(model, openerService, key3);
      }
    };
  }
  OpenPortInBrowserAction2.handler = handler;
  function run(model, openerService, key3) {
    const tunnel = model.forwarded.get(key3) || model.detected.get(key3);
    if (tunnel) {
      return openerService.open(tunnel.localUri, { allowContributedOpeners: false });
    }
    return Promise.resolve();
  }
  OpenPortInBrowserAction2.run = run;
})(OpenPortInBrowserAction || (OpenPortInBrowserAction = {}));

var OpenPortInPreviewAction;

((OpenPortInPreviewAction2) => {
  OpenPortInPreviewAction2.ID = "remote.tunnel.openPreview";
  OpenPortInPreviewAction2.LABEL = localize(18573, null);
  function handler() {
    return async (accessor, arg) => {
      let key3;
      if (isITunnelItem(arg)) {
        key3 = makeAddress(arg.remoteHost, arg.remotePort);
      } else if (isRemoteTunnel(arg)) {
        key3 = makeAddress(arg.tunnelRemoteHost, arg.tunnelRemotePort);
      }
      if (key3) {
        const model = accessor.get(IRemoteExplorerService).tunnelModel;
        const openerService = accessor.get(IOpenerService);
        const externalOpenerService = accessor.get(IExternalUriOpenerService);
        return run(model, openerService, externalOpenerService, key3);
      }
    };
  }
  OpenPortInPreviewAction2.handler = handler;
  async function run(model, openerService, externalOpenerService, key3) {
    const tunnel = model.forwarded.get(key3) || model.detected.get(key3);
    if (tunnel) {
      const remoteHost = tunnel.remoteHost.includes(":") ? `[${tunnel.remoteHost}]` : tunnel.remoteHost;
      const sourceUri = URI.parse(`http://${remoteHost}:${tunnel.remotePort}`);
      const opener = await externalOpenerService.getOpener(tunnel.localUri, { sourceUri }, CancellationToken.None);
      if (opener) {
        return opener.openExternalUri(tunnel.localUri, { sourceUri }, CancellationToken.None);
      }
      return openerService.open(tunnel.localUri);
    }
    return Promise.resolve();
  }
  OpenPortInPreviewAction2.run = run;
})(OpenPortInPreviewAction || (OpenPortInPreviewAction = {}));

var OpenPortInBrowserCommandPaletteAction;

((OpenPortInBrowserCommandPaletteAction2) => {
  OpenPortInBrowserCommandPaletteAction2.ID = "remote.tunnel.openCommandPalette";
  OpenPortInBrowserCommandPaletteAction2.LABEL = localize(18569, null);
  function handler() {
    return async (accessor, arg) => {
      const remoteExplorerService = accessor.get(IRemoteExplorerService);
      const tunnelService = accessor.get(ITunnelService);
      const model = remoteExplorerService.tunnelModel;
      const quickPickService = accessor.get(IQuickInputService);
      const openerService = accessor.get(IOpenerService);
      const commandService = accessor.get(ICommandService);
      const options3 = [...model.forwarded, ...model.detected].map((value2) => {
        const tunnelItem = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, value2[1]);
        return {
          label: tunnelItem.label,
          description: tunnelItem.processDescription,
          tunnel: tunnelItem
        };
      });
      if (options3.length === 0) {
        options3.push({
          label: localize(18570, null)
        });
      } else {
        options3.push({
          label: localize(18572, null)
        });
      }
      const picked = await quickPickService.pick(options3, { placeHolder: localize(18571, null) });
      if (picked && picked.tunnel) {
        return OpenPortInBrowserAction.run(model, openerService, makeAddress(picked.tunnel.remoteHost, picked.tunnel.remotePort));
      } else if (picked) {
        return commandService.executeCommand(`${TUNNEL_VIEW_ID}.focus`);
      }
    };
  }
  OpenPortInBrowserCommandPaletteAction2.handler = handler;
})(OpenPortInBrowserCommandPaletteAction || (OpenPortInBrowserCommandPaletteAction = {}));

var CopyAddressAction;

((CopyAddressAction2) => {
  CopyAddressAction2.INLINE_ID = "remote.tunnel.copyAddressInline";
  CopyAddressAction2.COMMANDPALETTE_ID = "remote.tunnel.copyAddressCommandPalette";
  CopyAddressAction2.INLINE_LABEL = localize(18560, null);
  CopyAddressAction2.COMMANDPALETTE_LABEL = localize(18559, null);
  async function copyAddress(remoteExplorerService, clipboardService, tunnelItem) {
    const address = remoteExplorerService.tunnelModel.address(tunnelItem.remoteHost, tunnelItem.remotePort);
    if (address) {
      await clipboardService.writeText(address.toString());
    }
  }
  function inlineHandler() {
    return async (accessor, arg) => {
      const remoteExplorerService = accessor.get(IRemoteExplorerService);
      let tunnelItem;
      if (isITunnelItem(arg)) {
        tunnelItem = arg;
      } else {
        const context2 = accessor.get(IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
        tunnelItem = context2 ? remoteExplorerService.tunnelModel.forwarded.get(context2) : void 0;
      }
      if (tunnelItem) {
        return copyAddress(remoteExplorerService, accessor.get(IClipboardService), tunnelItem);
      }
    };
  }
  CopyAddressAction2.inlineHandler = inlineHandler;
  function commandPaletteHandler() {
    return async (accessor, arg) => {
      const quickInputService = accessor.get(IQuickInputService);
      const remoteExplorerService = accessor.get(IRemoteExplorerService);
      const tunnelService = accessor.get(ITunnelService);
      const commandService = accessor.get(ICommandService);
      const clipboardService = accessor.get(IClipboardService);
      const tunnels = Array.from(remoteExplorerService.tunnelModel.forwarded.values()).concat(Array.from(remoteExplorerService.tunnelModel.detected.values()));
      const result = await quickInputService.pick(makeTunnelPicks(tunnels, remoteExplorerService, tunnelService), { placeHolder: localize(18561, null) });
      if (result && result.tunnel) {
        await copyAddress(remoteExplorerService, clipboardService, result.tunnel);
      } else if (result) {
        await commandService.executeCommand(ForwardPortAction.COMMANDPALETTE_ID);
      }
    };
  }
  CopyAddressAction2.commandPaletteHandler = commandPaletteHandler;
})(CopyAddressAction || (CopyAddressAction = {}));

var ChangeLocalPortAction;

((ChangeLocalPortAction2) => {
  ChangeLocalPortAction2.ID = "remote.tunnel.changeLocalPort";
  ChangeLocalPortAction2.LABEL = localize(18554, null);
  function validateInput(tunnelService, value2, canElevate) {
    if (!value2.match(/^[0-9]+$/)) {
      return { content: localize(18585, null), severity: Severity2.Error };
    } else if (Number(value2) >= maxPortNumber) {
      return { content: invalidPortNumberString, severity: Severity2.Error };
    } else if (canElevate && tunnelService.isPortPrivileged(Number(value2))) {
      return { content: requiresSudoString, severity: Severity2.Info };
    }
    return null;
  }
  function handler() {
    return async (accessor, arg) => {
      const remoteExplorerService = accessor.get(IRemoteExplorerService);
      const notificationService = accessor.get(INotificationService);
      const tunnelService = accessor.get(ITunnelService);
      let tunnelContext;
      if (isITunnelItem(arg)) {
        tunnelContext = arg;
      } else {
        const context2 = accessor.get(IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
        const tunnel = context2 ? remoteExplorerService.tunnelModel.forwarded.get(context2) : void 0;
        if (tunnel) {
          const tunnelService2 = accessor.get(ITunnelService);
          tunnelContext = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService2, tunnel);
        }
      }
      if (tunnelContext) {
        const tunnelItem = tunnelContext;
        remoteExplorerService.setEditable(tunnelItem, 3 /* LocalPort */, {
          onFinish: async (value2, success) => {
            remoteExplorerService.setEditable(tunnelItem, 3 /* LocalPort */, null);
            if (success) {
              await remoteExplorerService.close({ host: tunnelItem.remoteHost, port: tunnelItem.remotePort }, "Other" /* Other */);
              const numberValue = Number(value2);
              const newForward = await remoteExplorerService.forward({
                remote: { host: tunnelItem.remoteHost, port: tunnelItem.remotePort },
                local: numberValue,
                name: tunnelItem.name,
                elevateIfNeeded: true,
                source: tunnelItem.source
              });
              if (newForward && typeof newForward !== "string" && newForward.tunnelLocalPort !== numberValue) {
                notificationService.warn(localize(18555, null, value2, newForward.tunnelLocalPort ?? newForward.localAddress));
              }
            }
          },
          validationMessage: (value2) => validateInput(tunnelService, value2, tunnelService.canElevate),
          placeholder: localize(18580, null)
        });
      }
    };
  }
  ChangeLocalPortAction2.handler = handler;
})(ChangeLocalPortAction || (ChangeLocalPortAction = {}));

var ChangeTunnelPrivacyAction;

((ChangeTunnelPrivacyAction2) => {
  function handler(privacyId) {
    return async (accessor, arg) => {
      if (isITunnelItem(arg)) {
        const remoteExplorerService = accessor.get(IRemoteExplorerService);
        await remoteExplorerService.close({ host: arg.remoteHost, port: arg.remotePort }, "Other" /* Other */);
        return remoteExplorerService.forward({
          remote: { host: arg.remoteHost, port: arg.remotePort },
          local: arg.localPort,
          name: arg.name,
          elevateIfNeeded: true,
          privacy: privacyId,
          source: arg.source
        });
      }
      return void 0;
    };
  }
  ChangeTunnelPrivacyAction2.handler = handler;
})(ChangeTunnelPrivacyAction || (ChangeTunnelPrivacyAction = {}));

var SetTunnelProtocolAction;

((SetTunnelProtocolAction2) => {
  SetTunnelProtocolAction2.ID_HTTP = "remote.tunnel.setProtocolHttp";
  SetTunnelProtocolAction2.ID_HTTPS = "remote.tunnel.setProtocolHttps";
  SetTunnelProtocolAction2.LABEL_HTTP = localize(18574, null);
  SetTunnelProtocolAction2.LABEL_HTTPS = localize(18575, null);
  async function handler(arg, protocol, remoteExplorerService, environmentService) {
    if (isITunnelItem(arg)) {
      const attributes = {
        protocol
      };
      const target = environmentService.remoteAuthority ? 4 /* USER_REMOTE */ : 3 /* USER_LOCAL */;
      return remoteExplorerService.tunnelModel.configPortsAttributes.addAttributes(arg.remotePort, attributes, target);
    }
  }
  function handlerHttp() {
    return async (accessor, arg) => {
      return handler(arg, "http" /* Http */, accessor.get(IRemoteExplorerService), accessor.get(IWorkbenchEnvironmentService));
    };
  }
  SetTunnelProtocolAction2.handlerHttp = handlerHttp;
  function handlerHttps() {
    return async (accessor, arg) => {
      return handler(arg, "https" /* Https */, accessor.get(IRemoteExplorerService), accessor.get(IWorkbenchEnvironmentService));
    };
  }
  SetTunnelProtocolAction2.handlerHttps = handlerHttps;
})(SetTunnelProtocolAction || (SetTunnelProtocolAction = {}));

var tunnelViewCommandsWeightBonus = 10;

var isForwardedExpr = TunnelTypeContextKey.isEqualTo("Forwarded" /* Forwarded */);

var isForwardedOrDetectedExpr = ContextKeyExpr.or(isForwardedExpr, TunnelTypeContextKey.isEqualTo("Detected" /* Detected */));

var isNotMultiSelectionExpr = TunnelViewMultiSelectionContextKey.isEqualTo(void 0);

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: LabelTunnelAction.ID,
  weight: 200 /* WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
  when: ContextKeyExpr.and(TunnelViewFocusContextKey, isForwardedExpr, isNotMultiSelectionExpr),
  primary: 60 /* F2 */,
  mac: {
    primary: 3 /* Enter */
  },
  handler: LabelTunnelAction.handler()
});

CommandsRegistry.registerCommand(ForwardPortAction.INLINE_ID, ForwardPortAction.inlineHandler());

CommandsRegistry.registerCommand(ForwardPortAction.COMMANDPALETTE_ID, ForwardPortAction.commandPaletteHandler());

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: ClosePortAction.INLINE_ID,
  weight: 200 /* WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
  when: ContextKeyExpr.and(TunnelCloseableContextKey, TunnelViewFocusContextKey),
  primary: 20 /* Delete */,
  mac: {
    primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
    secondary: [20 /* Delete */]
  },
  handler: ClosePortAction.inlineHandler()
});

CommandsRegistry.registerCommand(ClosePortAction.COMMANDPALETTE_ID, ClosePortAction.commandPaletteHandler());

CommandsRegistry.registerCommand(OpenPortInBrowserAction.ID, OpenPortInBrowserAction.handler());

CommandsRegistry.registerCommand(OpenPortInPreviewAction.ID, OpenPortInPreviewAction.handler());

CommandsRegistry.registerCommand(OpenPortInBrowserCommandPaletteAction.ID, OpenPortInBrowserCommandPaletteAction.handler());

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: CopyAddressAction.INLINE_ID,
  weight: 200 /* WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
  when: ContextKeyExpr.and(TunnelViewFocusContextKey, isForwardedOrDetectedExpr, isNotMultiSelectionExpr),
  primary: 2048 /* CtrlCmd */ | 33 /* KeyC */,
  handler: CopyAddressAction.inlineHandler()
});

CommandsRegistry.registerCommand(CopyAddressAction.COMMANDPALETTE_ID, CopyAddressAction.commandPaletteHandler());

CommandsRegistry.registerCommand(ChangeLocalPortAction.ID, ChangeLocalPortAction.handler());

CommandsRegistry.registerCommand(SetTunnelProtocolAction.ID_HTTP, SetTunnelProtocolAction.handlerHttp());

CommandsRegistry.registerCommand(SetTunnelProtocolAction.ID_HTTPS, SetTunnelProtocolAction.handlerHttps());

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: ClosePortAction.COMMANDPALETTE_ID,
    title: ClosePortAction.LABEL
  },
  when: forwardedPortsViewEnabled
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: ForwardPortAction.COMMANDPALETTE_ID,
    title: ForwardPortAction.LABEL
  },
  when: forwardedPortsViewEnabled
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: CopyAddressAction.COMMANDPALETTE_ID,
    title: CopyAddressAction.COMMANDPALETTE_LABEL
  },
  when: forwardedPortsViewEnabled
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: OpenPortInBrowserCommandPaletteAction.ID,
    title: OpenPortInBrowserCommandPaletteAction.LABEL
  },
  when: forwardedPortsViewEnabled
});

MenuRegistry.appendMenuItem(MenuId.TunnelContext, {
  group: "._open",
  order: 0,
  command: {
    id: OpenPortInBrowserAction.ID,
    title: OpenPortInBrowserAction.LABEL
  },
  when: ContextKeyExpr.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
});

MenuRegistry.appendMenuItem(MenuId.TunnelContext, {
  group: "._open",
  order: 1,
  command: {
    id: OpenPortInPreviewAction.ID,
    title: OpenPortInPreviewAction.LABEL
  },
  when: ContextKeyExpr.and(
    isForwardedOrDetectedExpr,
    isNotMultiSelectionExpr
  )
});

MenuRegistry.appendMenuItem(MenuId.TunnelContext, {
  group: "0_manage",
  order: 1,
  command: {
    id: LabelTunnelAction.ID,
    title: LabelTunnelAction.LABEL,
    icon: labelPortIcon
  },
  when: ContextKeyExpr.and(isForwardedExpr, isNotMultiSelectionExpr)
});

MenuRegistry.appendMenuItem(MenuId.TunnelContext, {
  group: "2_localaddress",
  order: 0,
  command: {
    id: CopyAddressAction.INLINE_ID,
    title: CopyAddressAction.INLINE_LABEL
  },
  when: ContextKeyExpr.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
});

MenuRegistry.appendMenuItem(MenuId.TunnelContext, {
  group: "2_localaddress",
  order: 1,
  command: {
    id: ChangeLocalPortAction.ID,
    title: ChangeLocalPortAction.LABEL
  },
  when: ContextKeyExpr.and(isForwardedExpr, PortChangableContextKey, isNotMultiSelectionExpr)
});

MenuRegistry.appendMenuItem(MenuId.TunnelContext, {
  group: "2_localaddress",
  order: 2,
  submenu: MenuId.TunnelPrivacy,
  title: localize(18601, null),
  when: ContextKeyExpr.and(isForwardedExpr, TunnelPrivacyEnabledContextKey)
});

MenuRegistry.appendMenuItem(MenuId.TunnelContext, {
  group: "2_localaddress",
  order: 3,
  submenu: MenuId.TunnelProtocol,
  title: localize(18602, null),
  when: ContextKeyExpr.and(isForwardedExpr, isNotMultiSelectionExpr, ProtocolChangeableContextKey)
});

MenuRegistry.appendMenuItem(MenuId.TunnelContext, {
  group: "3_forward",
  order: 0,
  command: {
    id: ClosePortAction.INLINE_ID,
    title: ClosePortAction.LABEL
  },
  when: TunnelCloseableContextKey
});

MenuRegistry.appendMenuItem(MenuId.TunnelContext, {
  group: "3_forward",
  order: 1,
  command: {
    id: ForwardPortAction.INLINE_ID,
    title: ForwardPortAction.LABEL
  }
});

MenuRegistry.appendMenuItem(MenuId.TunnelProtocol, {
  order: 0,
  command: {
    id: SetTunnelProtocolAction.ID_HTTP,
    title: SetTunnelProtocolAction.LABEL_HTTP,
    toggled: TunnelProtocolContextKey.isEqualTo("http" /* Http */)
  }
});

MenuRegistry.appendMenuItem(MenuId.TunnelProtocol, {
  order: 1,
  command: {
    id: SetTunnelProtocolAction.ID_HTTPS,
    title: SetTunnelProtocolAction.LABEL_HTTPS,
    toggled: TunnelProtocolContextKey.isEqualTo("https" /* Https */)
  }
});

MenuRegistry.appendMenuItem(MenuId.TunnelPortInline, {
  group: "0_manage",
  order: 0,
  command: {
    id: ForwardPortAction.INLINE_ID,
    title: ForwardPortAction.TREEITEM_LABEL,
    icon: forwardPortIcon
  },
  when: TunnelTypeContextKey.isEqualTo("Candidate" /* Candidate */)
});

MenuRegistry.appendMenuItem(MenuId.TunnelPortInline, {
  group: "0_manage",
  order: 4,
  command: {
    id: LabelTunnelAction.ID,
    title: LabelTunnelAction.LABEL,
    icon: labelPortIcon
  },
  when: isForwardedExpr
});

MenuRegistry.appendMenuItem(MenuId.TunnelPortInline, {
  group: "0_manage",
  order: 5,
  command: {
    id: ClosePortAction.INLINE_ID,
    title: ClosePortAction.LABEL,
    icon: stopForwardIcon
  },
  when: TunnelCloseableContextKey
});

MenuRegistry.appendMenuItem(MenuId.TunnelLocalAddressInline, {
  order: -1,
  command: {
    id: CopyAddressAction.INLINE_ID,
    title: CopyAddressAction.INLINE_LABEL,
    icon: copyAddressIcon
  },
  when: isForwardedOrDetectedExpr
});

MenuRegistry.appendMenuItem(MenuId.TunnelLocalAddressInline, {
  order: 0,
  command: {
    id: OpenPortInBrowserAction.ID,
    title: OpenPortInBrowserAction.LABEL,
    icon: openBrowserIcon
  },
  when: isForwardedOrDetectedExpr
});

MenuRegistry.appendMenuItem(MenuId.TunnelLocalAddressInline, {
  order: 1,
  command: {
    id: OpenPortInPreviewAction.ID,
    title: OpenPortInPreviewAction.LABEL,
    icon: openPreviewIcon
  },
  when: isForwardedOrDetectedExpr
});

registerColor("ports.iconRunningProcessForeground", STATUS_BAR_REMOTE_ITEM_BACKGROUND, localize(18552, null));
export { emptyCell, isITunnelItem, makeTunnelPicks, openPreviewEnabledContext, TunnelTreeVirtualDelegate, TunnelViewModel, IconColumn, PortColumn, LocalAddressColumn, RunningProcessColumn, OriginColumn, PrivacyColumn, ActionBarRenderer, TunnelItem, TunnelTypeContextKey, TunnelCloseableContextKey, TunnelPrivacyContextKey, TunnelPrivacyEnabledContextKey, TunnelProtocolContextKey, TunnelViewFocusContextKey, TunnelViewSelectionKeyName, TunnelViewSelectionContextKey, TunnelViewMultiSelectionKeyName, TunnelViewMultiSelectionContextKey, PortChangableContextKey, ProtocolChangeableContextKey, TunnelPanel, TunnelPanelDescriptor, LabelTunnelAction, invalidPortString, maxPortNumber, invalidPortNumberString, requiresSudoString, alreadyForwarded, ForwardPortAction, ClosePortAction, OpenPortInBrowserAction, OpenPortInPreviewAction, OpenPortInBrowserCommandPaletteAction, CopyAddressAction, ChangeLocalPortAction, ChangeTunnelPrivacyAction, SetTunnelProtocolAction, tunnelViewCommandsWeightBonus, isForwardedExpr, isForwardedOrDetectedExpr, isNotMultiSelectionExpr };
