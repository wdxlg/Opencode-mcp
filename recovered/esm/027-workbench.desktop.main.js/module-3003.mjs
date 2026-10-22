// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpServersView.ts
import { AbstractExtensionsListView } from "./module-2939.mjs";
import { ActionRunner, Separator } from "./module-0082.mjs";
import { Disposable, DisposableStore, MutableDisposable, combinedDisposable, dispose, isDisposable } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { WorkbenchPagedList } from "./module-0636.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { getLocationBasedViewColors } from "./module-1335.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { buildModalNavigationForPagedList } from "./module-2283.mjs";
import { DropDownAction, InstallAction2, InstallingLabelAction2, ManageMcpServerAction, McpServerStatusAction, getContextMenuActions3 } from "./module-2653.mjs";
import { DelayedPagedModel, IterativePagedModel, PagedModel } from "./module-2282.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { mcpServerIcon2 } from "./module-2997.mjs";
import { MarkdownString, createMarkdownCommandLink } from "./module-0462.mjs";
import { mcpGalleryServiceEnablementConfig, mcpGalleryServiceUrlConfig } from "./module-1196.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { SeverityIcon } from "./module-0699.mjs";
import { alert } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ContextKeyDefinedExpr, ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { Extensions13, IViewDescriptorService } from "./module-1093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IDialogService } from "./module-0267.mjs";
import { HasInstalledMcpServersContext, IMcpWorkbenchService, InstalledMcpServersViewId, McpServerContainers, McpServersGalleryStatusContext } from "./module-1206.mjs";
import { IMcpGalleryManifestService } from "./module-1195.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { ILogService } from "./module-0095.mjs";
import { McpServerHoverWidget, McpServerIconWidget, McpServerScopeBadgeWidget, PublisherWidget2, StarredWidget } from "./module-2998.mjs";
import { ActionBar } from "./module-0477.mjs";
import { INotificationService } from "./module-0336.mjs";
import { Registry } from "./module-0090.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { DefaultViewsContext, SearchMcpServersContext } from "./module-1022.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ProductQualityContext } from "./module-0635.mjs";
import { VIEW_CONTAINER } from "./module-2944.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpServersView.ts
var McpServersListView = class extends AbstractExtensionsListView {
  constructor(mpcViewOptions, options3, keybindingService, contextMenuService, instantiationService, themeService, hoverService, configurationService, contextKeyService, viewDescriptorService, openerService, dialogService, mcpWorkbenchService, mcpGalleryManifestService, layoutService, markdownRendererService, logService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.mpcViewOptions = mpcViewOptions;
    this.dialogService = dialogService;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.mcpGalleryManifestService = mcpGalleryManifestService;
    this.layoutService = layoutService;
    this.markdownRendererService = markdownRendererService;
    this.logService = logService;
    this.list = null;
    this.listContainer = null;
    this.welcomeContainer = null;
    this.contextMenuActionRunner = this._register(new ActionRunner());
    this.modalNavigationDisposable = this._register(new MutableDisposable());
  }
  renderBody(container3) {
    super.renderBody(container3);
    this.welcomeContainer = append(container3, $(".mcp-welcome-container.hide"));
    this.createWelcomeContent(this.welcomeContainer);
    const messageContainer = append(container3, $(".message-container"));
    const messageSeverityIcon = append(messageContainer, $(""));
    const messageBox = append(messageContainer, $(".message"));
    const mcpServersList = $(".mcp-servers-list");
    this.bodyTemplate = {
      mcpServersList,
      messageBox,
      messageContainer,
      messageSeverityIcon
    };
    this.listContainer = append(container3, mcpServersList);
    this.list = this._register(this.instantiationService.createInstance(
      WorkbenchPagedList,
      `${this.id}-MCP-Servers`,
      this.listContainer,
      {
        getHeight() {
          return 72;
        },
        getTemplateId: () => McpServerRenderer.templateId
      },
      [this.instantiationService.createInstance(McpServerRenderer, {
        hoverOptions: {
          position: () => {
            const viewLocation = this.viewDescriptorService.getViewLocationById(this.id);
            if (viewLocation === 0 /* Sidebar */) {
              return this.layoutService.getSideBarPosition() === 0 /* LEFT */ ? 1 /* RIGHT */ : 0 /* LEFT */;
            }
            if (viewLocation === 2 /* AuxiliaryBar */) {
              return this.layoutService.getSideBarPosition() === 0 /* LEFT */ ? 0 /* LEFT */ : 1 /* RIGHT */;
            }
            return 1 /* RIGHT */;
          }
        }
      })],
      {
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel(mcpServer) {
            return mcpServer?.label ?? "";
          },
          getWidgetAriaLabel() {
            return localize(17076, null);
          }
        },
        overrideStyles: getLocationBasedViewColors(this.viewDescriptorService.getViewLocationById(this.id)).listOverrideStyles,
        openOnSingleClick: true
      }
    ));
    this._register(Event2.debounce(Event2.filter(this.list.onDidOpen, (e) => e.element !== null), (_, event) => event, 75, true)((options3) => {
      this.mcpWorkbenchService.open(options3.element, {
        ...options3.editorOptions,
        modal: options3.sideBySide ? void 0 : buildModalNavigationForPagedList(
          options3.element,
          () => this.list?.model,
          (serverA, serverB) => serverA.id === serverB.id,
          (server, modal) => this.mcpWorkbenchService.open(server, { pinned: false, modal }),
          this.modalNavigationDisposable,
          this.logService
        )
      });
    }));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e), this));
    if (this.input) {
      this.renderInput();
    }
  }
  async onContextMenu(e) {
    if (e.element) {
      const disposables = new DisposableStore();
      const mcpServer = e.element ? this.mcpWorkbenchService.local.find((local) => local.id === e.element.id) || e.element : e.element;
      const groups = getContextMenuActions3(mcpServer, false, this.instantiationService);
      const actions = [];
      for (const menuActions of groups) {
        for (const menuAction of menuActions) {
          actions.push(menuAction);
          if (isDisposable(menuAction)) {
            disposables.add(menuAction);
          }
        }
        actions.push(new Separator());
      }
      actions.pop();
      this.contextMenuService.showContextMenu({
        getAnchor: () => e.anchor,
        getActions: () => actions,
        actionRunner: this.contextMenuActionRunner,
        onHide: () => disposables.dispose()
      });
    }
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.list?.layout(height, width2);
  }
  async show(query) {
    if (this.input) {
      this.input.disposables.dispose();
      this.input = void 0;
    }
    if (this.mpcViewOptions.showWelcome) {
      this.input = { model: new PagedModel([]), disposables: new DisposableStore(), showWelcomeContent: true };
    } else {
      this.input = await this.query(query.trim());
    }
    this.renderInput();
    if (this.input.onDidChangeModel) {
      this.input.disposables.add(this.input.onDidChangeModel((model) => {
        if (!this.input) {
          return;
        }
        this.input.model = model;
        this.renderInput();
      }));
    }
    return this.input.model;
  }
  renderInput() {
    if (!this.input) {
      return;
    }
    if (this.list) {
      this.list.model = new DelayedPagedModel(this.input.model);
    }
    this.showWelcomeContent(!!this.input.showWelcomeContent);
    if (!this.input.showWelcomeContent) {
      this.updateBody();
    }
  }
  showWelcomeContent(show3) {
    this.welcomeContainer?.classList.toggle("hide", !show3);
    this.listContainer?.classList.toggle("hide", show3);
  }
  createWelcomeContent(welcomeContainer) {
    const welcomeContent = append(welcomeContainer, $(".mcp-welcome-content"));
    const iconContainer = append(welcomeContent, $(".mcp-welcome-icon"));
    const iconElement = append(iconContainer, $("span"));
    iconElement.className = ThemeIcon.asClassName(mcpServerIcon2);
    const title = append(welcomeContent, $(".mcp-welcome-title"));
    title.textContent = localize(17085, null);
    const settingsCommandLink = createMarkdownCommandLink({ id: "workbench.action.openSettings", arguments: [`@id:${mcpGalleryServiceEnablementConfig}`], text: mcpGalleryServiceEnablementConfig, tooltip: localize(17084, null) }).toString();
    const description = append(welcomeContent, $(".mcp-welcome-description"));
    const markdownResult = this._register(this.markdownRendererService.render(
      new MarkdownString(
        localize(17082, null),
        { isTrusted: { enabledCommands: ["workbench.action.openSettings"] } }
      ).appendMarkdown("\n\n").appendMarkdown(localize(17080, null, settingsCommandLink))
    ));
    description.appendChild(markdownResult.element);
    const buttonContainer = append(welcomeContent, $(".mcp-welcome-button-container"));
    const button = this._register(new Button(buttonContainer, {
      title: localize(17083, null),
      ...defaultButtonStyles
    }));
    button.label = localize(17083, null);
    this._register(button.onDidClick(async () => {
      const { result } = await this.dialogService.prompt({
        type: "info",
        message: localize(17081, null),
        custom: {
          markdownDetails: [{
            markdown: new MarkdownString(localize(17080, null, settingsCommandLink), { isTrusted: true })
          }]
        },
        buttons: [
          { label: localize(17079, null), run: () => true },
          { label: localize(17078, null), run: () => false }
        ]
      });
      if (result) {
        await this.configurationService.updateValue(mcpGalleryServiceEnablementConfig, true);
      }
    }));
  }
  updateBody(message) {
    if (this.bodyTemplate) {
      const count2 = this.input?.model.length ?? 0;
      this.bodyTemplate.mcpServersList.classList.toggle("hidden", count2 === 0);
      this.bodyTemplate.messageContainer.classList.toggle("hidden", !message && count2 > 0);
      if (this.isBodyVisible()) {
        if (message) {
          this.bodyTemplate.messageSeverityIcon.className = SeverityIcon.className(message.severity);
          this.bodyTemplate.messageBox.textContent = message.text;
        } else if (count2 === 0) {
          this.bodyTemplate.messageSeverityIcon.className = "";
          this.bodyTemplate.messageBox.textContent = localize(17086, null);
        }
        if (this.bodyTemplate.messageBox.textContent) {
          alert(this.bodyTemplate.messageBox.textContent);
        }
      }
    }
  }
  async query(query) {
    const disposables = new DisposableStore();
    if (query) {
      const servers2 = await this.mcpWorkbenchService.queryGallery({ text: query.replace("@mcp", "") });
      const model = disposables.add(new IterativePagedModel(servers2));
      return { model, disposables };
    }
    const onDidChangeModel = disposables.add(new Emitter());
    let servers = await this.mcpWorkbenchService.queryLocal();
    disposables.add(Event2.debounce(this.mcpWorkbenchService.onChange, () => void 0)(() => {
      const mergedMcpServers = this.mergeChangedMcpServers(servers, [...this.mcpWorkbenchService.local]);
      if (mergedMcpServers) {
        servers = mergedMcpServers;
        onDidChangeModel.fire(new PagedModel(servers));
      }
    }));
    disposables.add(this.mcpWorkbenchService.onReset(() => onDidChangeModel.fire(new PagedModel([...this.mcpWorkbenchService.local]))));
    return { model: new PagedModel(servers), onDidChangeModel: onDidChangeModel.event, disposables };
  }
  mergeChangedMcpServers(mcpServers, newMcpServers) {
    const oldMcpServers = [...mcpServers];
    const findPreviousMcpServerIndex = (from) => {
      let index2 = -1;
      const previousMcpServerInNew = newMcpServers[from];
      if (previousMcpServerInNew) {
        index2 = oldMcpServers.findIndex((e) => e.id === previousMcpServerInNew.id);
        if (index2 === -1) {
          return findPreviousMcpServerIndex(from - 1);
        }
      }
      return index2;
    };
    let hasChanged = false;
    for (let index2 = 0; index2 < newMcpServers.length; index2++) {
      const newMcpServer = newMcpServers[index2];
      if (mcpServers.every((r2) => r2.id !== newMcpServer.id)) {
        hasChanged = true;
        mcpServers.splice(findPreviousMcpServerIndex(index2 - 1) + 1, 0, newMcpServer);
      }
    }
    for (let index2 = mcpServers.length - 1; index2 >= 0; index2--) {
      const oldMcpServer = mcpServers[index2];
      if (newMcpServers.every((r2) => r2.id !== oldMcpServer.id) && newMcpServers.some((r2) => r2.name === oldMcpServer.name)) {
        hasChanged = true;
        mcpServers.splice(index2, 1);
      }
    }
    if (!hasChanged) {
      if (mcpServers.length === newMcpServers.length) {
        for (let index2 = 0; index2 < newMcpServers.length; index2++) {
          if (mcpServers[index2]?.id !== newMcpServers[index2]?.id) {
            hasChanged = true;
            mcpServers = newMcpServers;
            break;
          }
        }
      }
    }
    return hasChanged ? mcpServers : void 0;
  }
};

McpServersListView = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IDialogService),
  __decorateParam(12, IMcpWorkbenchService),
  __decorateParam(13, IMcpGalleryManifestService),
  __decorateParam(14, IWorkbenchLayoutService),
  __decorateParam(15, IMarkdownRendererService),
  __decorateParam(16, ILogService)
], McpServersListView);

var McpServerRenderer = class {
  constructor(options3, instantiationService, mcpWorkbenchService, notificationService) {
    this.options = options3;
    this.instantiationService = instantiationService;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.notificationService = notificationService;
    this.templateId = McpServerRenderer.templateId;
  }
  static {
    this.templateId = "mcpServer";
  }
  renderTemplate(root) {
    const element = append(root, $(".mcp-server-item.extension-list-item"));
    const iconContainer = append(element, $(".icon-container"));
    const iconWidget = this.instantiationService.createInstance(McpServerIconWidget, iconContainer);
    const details = append(element, $(".details"));
    const headerContainer = append(details, $(".header-container"));
    const header2 = append(headerContainer, $(".header"));
    const name = append(header2, $("span.name"));
    const starred = append(header2, $("span.ratings"));
    const description = append(details, $(".description.ellipsis"));
    const footer = append(details, $(".footer"));
    const publisherWidget = this.instantiationService.createInstance(PublisherWidget2, append(footer, $(".publisher-container")), true);
    const actionbar = new ActionBar(footer, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof DropDownAction) {
          return action.createActionViewItem(options3);
        }
        return void 0;
      },
      focusOnlyEnabledItems: true
    });
    actionbar.setFocusable(false);
    const actionBarListener = actionbar.onDidRun(({ error }) => error && this.notificationService.error(error));
    const mcpServerStatusAction = this.instantiationService.createInstance(McpServerStatusAction);
    const actions = [
      this.instantiationService.createInstance(InstallAction2, true),
      this.instantiationService.createInstance(InstallingLabelAction2),
      this.instantiationService.createInstance(ManageMcpServerAction, false),
      mcpServerStatusAction
    ];
    const widgets2 = [
      iconWidget,
      publisherWidget,
      this.instantiationService.createInstance(StarredWidget, starred, true),
      this.instantiationService.createInstance(McpServerScopeBadgeWidget, iconContainer),
      this.instantiationService.createInstance(McpServerHoverWidget, { target: root, position: this.options.hoverOptions.position }, mcpServerStatusAction)
    ];
    const extensionContainers = this.instantiationService.createInstance(McpServerContainers, [...actions, ...widgets2]);
    actionbar.push(actions, { icon: true, label: true });
    const disposable = combinedDisposable(...actions, ...widgets2, actionbar, actionBarListener, extensionContainers);
    return {
      root,
      element,
      name,
      description,
      starred,
      disposables: [disposable],
      actionbar,
      mcpServerDisposables: [],
      set mcpServer(mcpServer) {
        extensionContainers.mcpServer = mcpServer;
      }
    };
  }
  renderPlaceholder(index2, data) {
    data.element.classList.add("loading");
    data.mcpServerDisposables = dispose(data.mcpServerDisposables);
    data.name.textContent = "";
    data.description.textContent = "";
    data.starred.style.display = "none";
    data.mcpServer = null;
  }
  renderElement(mcpServer, index2, data) {
    data.element.classList.remove("loading");
    data.mcpServerDisposables = dispose(data.mcpServerDisposables);
    data.root.setAttribute("data-mcp-server-id", mcpServer.id);
    data.name.textContent = mcpServer.label;
    data.description.textContent = mcpServer.description;
    data.starred.style.display = "";
    data.mcpServer = mcpServer;
    const updateEnablement = () => data.root.classList.toggle("disabled", !!mcpServer.runtimeStatus?.state && mcpServer.runtimeStatus.state !== 4 /* Enabled */);
    updateEnablement();
    data.mcpServerDisposables.push(this.mcpWorkbenchService.onChange((e) => {
      if (!e || e.id === mcpServer.id) {
        updateEnablement();
      }
    }));
  }
  disposeElement(mcpServer, index2, data) {
    data.mcpServerDisposables = dispose(data.mcpServerDisposables);
  }
  disposeTemplate(data) {
    data.mcpServerDisposables = dispose(data.mcpServerDisposables);
    data.disposables = dispose(data.disposables);
  }
};

McpServerRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IMcpWorkbenchService),
  __decorateParam(3, INotificationService)
], McpServerRenderer);

var DefaultBrowseMcpServersView = class extends McpServersListView {
  renderBody(container3) {
    super.renderBody(container3);
    this._register(this.mcpGalleryManifestService.onDidChangeMcpGalleryManifest(() => this.show()));
  }
  async show() {
    return super.show("@mcp");
  }
};

var McpServersViewsContribution = class extends Disposable {
  static {
    this.ID = "workbench.mcp.servers.views.contribution";
  }
  constructor() {
    super();
    Registry.as(Extensions13.ViewsRegistry).registerViews([
      {
        id: InstalledMcpServersViewId,
        name: localize2(17077, "MCP Servers - Installed"),
        ctorDescriptor: new SyncDescriptor(McpServersListView, [{}]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledMcpServersContext, ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
        weight: 40,
        order: 4,
        canToggleVisibility: true
      },
      {
        id: "workbench.views.mcp.default.marketplace",
        name: localize2(17075, "MCP Servers"),
        ctorDescriptor: new SyncDescriptor(DefaultBrowseMcpServersView, [{}]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledMcpServersContext.toNegated(), ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate(), McpServersGalleryStatusContext.isEqualTo("available" /* Available */), ContextKeyExpr.or(ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceUrlConfig}`), ProductQualityContext.notEqualsTo("stable"), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceEnablementConfig}`))),
        weight: 40,
        order: 4,
        canToggleVisibility: true
      },
      {
        id: "workbench.views.mcp.marketplace",
        name: localize2(17075, "MCP Servers"),
        ctorDescriptor: new SyncDescriptor(McpServersListView, [{}]),
        when: ContextKeyExpr.and(SearchMcpServersContext, ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate(), McpServersGalleryStatusContext.isEqualTo("available" /* Available */), ContextKeyExpr.or(ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceUrlConfig}`), ProductQualityContext.notEqualsTo("stable"), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceEnablementConfig}`)))
      },
      {
        id: "workbench.views.mcp.default.welcomeView",
        name: localize2(17075, "MCP Servers"),
        ctorDescriptor: new SyncDescriptor(DefaultBrowseMcpServersView, [{ showWelcome: true }]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledMcpServersContext.toNegated(), ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate(), McpServersGalleryStatusContext.isEqualTo("available" /* Available */), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceUrlConfig}`).negate(), ProductQualityContext.isEqualTo("stable"), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceEnablementConfig}`).negate()),
        weight: 40,
        order: 4,
        canToggleVisibility: true
      },
      {
        id: "workbench.views.mcp.welcomeView",
        name: localize2(17075, "MCP Servers"),
        ctorDescriptor: new SyncDescriptor(McpServersListView, [{ showWelcome: true }]),
        when: ContextKeyExpr.and(SearchMcpServersContext, ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate(), McpServersGalleryStatusContext.isEqualTo("available" /* Available */), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceUrlConfig}`).negate(), ProductQualityContext.isEqualTo("stable"), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceEnablementConfig}`).negate())
      }
    ], VIEW_CONTAINER);
  }
};
export { McpServersListView, McpServerRenderer, DefaultBrowseMcpServersView, McpServersViewsContribution };
