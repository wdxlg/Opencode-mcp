// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/pluginListWidget.ts
import { $, DisposableResizeObserver, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { CUSTOMIZATION_GROUP_HEADER_HEIGHT, CUSTOMIZATION_GROUP_HEADER_HEIGHT_WITH_SEPARATOR, CustomizationGroupHeaderRenderer } from "./module-2654.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { pluginIcon } from "./module-2640.mjs";
import { Disposable, DisposableStore, MutableDisposable, isDisposable } from "./module-0012.mjs";
import { formatDisplayName } from "./module-2651.mjs";
import { truncateToFirstLine } from "./module-2650.mjs";
import { autorun } from "./module-0052.mjs";
import { isContributionEnabled } from "./module-1018.mjs";
import { localize } from "./module-0001.mjs";
import { Checkbox } from "./module-0549.mjs";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { basename2, dirname2, isEqual2 } from "./module-0034.mjs";
import { runOnChange } from "./module-0064.mjs";
import { Emitter } from "./module-0017.mjs";
import { Delayer } from "./module-0036.mjs";
import { URI } from "./module-0032.mjs";
import { InputBox } from "./module-0600.mjs";
import { Button, ButtonWithDropdown } from "./module-0546.mjs";
import { Codicon } from "./module-0085.mjs";
import { GalleryItemRenderer } from "./module-2655.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { isWeb } from "./module-0014.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { ICustomizationHarnessService, isPluginCustomizationItem } from "./module-1031.mjs";
import { getInstalledPluginContextMenuActions } from "./module-2658.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentPluginService } from "./module-1016.mjs";
import { IPluginMarketplaceService } from "./module-1028.mjs";
import { IPluginInstallService } from "./module-2570.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IAICustomizationItemsModel } from "./module-2643.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/pluginListWidget.ts
var $87 = $;

var PLUGIN_ITEM_HEIGHT = 36;

var PluginItemDelegate = class {
  getHeight(element) {
    if (element.type === "group-header") {
      return element.isFirst ? CUSTOMIZATION_GROUP_HEADER_HEIGHT : CUSTOMIZATION_GROUP_HEADER_HEIGHT_WITH_SEPARATOR;
    }
    if (element.type === "marketplace-item") {
      return 62;
    }
    return PLUGIN_ITEM_HEIGHT;
  }
  getTemplateId(element) {
    if (element.type === "group-header") {
      return "pluginGroupHeader";
    }
    if (element.type === "marketplace-item") {
      return PLUGIN_MARKETPLACE_ITEM_TEMPLATE_ID;
    }
    if (element.type === "remote-item") {
      return "pluginRemoteItem";
    }
    return "pluginInstalledItem";
  }
};

var PluginInstalledItemRenderer = class {
  constructor(_harnessService) {
    this._harnessService = _harnessService;
    this.templateId = "pluginInstalledItem";
  }
  renderTemplate(container3) {
    container3.classList.add("mcp-server-item");
    const syncCheckboxContainer = append(container3, $87(".item-sync-checkbox"));
    const typeIcon = append(container3, $87(".mcp-server-icon"));
    typeIcon.classList.add(...ThemeIcon.asClassNameArray(pluginIcon));
    const details = append(container3, $87(".mcp-server-details"));
    const name = append(details, $87(".mcp-server-name"));
    const description = append(details, $87(".mcp-server-description"));
    return { container: container3, syncCheckboxContainer, typeIcon, name, description, disposables: new DisposableStore() };
  }
  renderElement(element, _index, templateData) {
    templateData.disposables.clear();
    templateData.name.textContent = formatDisplayName(element.item.name);
    if (element.item.description) {
      templateData.description.textContent = truncateToFirstLine(element.item.description);
      templateData.description.style.display = "";
    } else {
      templateData.description.style.display = "none";
    }
    templateData.disposables.add(autorun((reader) => {
      const enabled = isContributionEnabled(element.item.plugin.enablement.read(reader));
      templateData.container.classList.toggle("disabled", !enabled);
    }));
    const syncProvider = this._harnessService.getActiveDescriptor().syncProvider;
    if (syncProvider) {
      templateData.syncCheckboxContainer.style.display = "";
      const pluginUri = element.item.plugin.uri;
      const disabled = syncProvider.isDisabled(pluginUri);
      const title = disabled ? localize(9768, null, element.item.name) : localize(9764, null, element.item.name);
      const checkbox = templateData.disposables.add(
        new Checkbox(title, !disabled, defaultCheckboxStyles)
      );
      templateData.syncCheckboxContainer.replaceChildren(checkbox.domNode);
      templateData.disposables.add(checkbox.onChange(() => {
        syncProvider.setDisabled(pluginUri, !checkbox.checked);
      }));
    } else {
      templateData.syncCheckboxContainer.style.display = "none";
      templateData.syncCheckboxContainer.replaceChildren();
    }
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

var PluginRemoteItemRenderer = class {
  constructor() {
    this.templateId = "pluginRemoteItem";
  }
  renderTemplate(container3) {
    container3.classList.add("mcp-server-item");
    const typeIcon = append(container3, $87(".mcp-server-icon"));
    typeIcon.classList.add(...ThemeIcon.asClassNameArray(pluginIcon));
    const details = append(container3, $87(".mcp-server-details"));
    const nameRow = append(details, $87(".mcp-server-name"));
    const name = append(nameRow, $87("span"));
    const badge = append(nameRow, $87(".inline-badge.item-badge"));
    const description = append(details, $87(".mcp-server-description"));
    const status2 = append(container3, $87(".mcp-server-status"));
    return { container: container3, typeIcon, name, badge, description, status: status2 };
  }
  renderElement(element, _index, templateData) {
    templateData.name.textContent = formatDisplayName(element.item.name);
    if (element.item.badge) {
      templateData.badge.textContent = element.item.badge;
      templateData.badge.style.display = "";
      templateData.badge.title = element.item.badgeTooltip ?? "";
    } else {
      templateData.badge.textContent = "";
      templateData.badge.style.display = "none";
      templateData.badge.title = "";
    }
    if (element.item.description) {
      templateData.description.textContent = truncateToFirstLine(element.item.description);
      templateData.description.style.display = "";
    } else {
      templateData.description.textContent = "";
      templateData.description.style.display = "none";
    }
    templateData.container.classList.toggle("disabled", element.item.enabled === false);
    templateData.status.className = "mcp-server-status";
    if (element.item.enabled === false) {
      templateData.status.textContent = localize(9794, null);
      templateData.status.classList.add("disabled");
      return;
    }
    switch (element.item.status) {
      case "loading":
        templateData.status.textContent = localize(9797, null);
        templateData.status.classList.add("running");
        break;
      case "loaded":
        templateData.status.textContent = localize(9796, null);
        templateData.status.classList.add("running");
        break;
      case "degraded":
        templateData.status.textContent = localize(9793, null);
        templateData.status.classList.add("disabled");
        break;
      case "error":
        templateData.status.textContent = localize(9795, null);
        templateData.status.classList.add("disabled");
        break;
      default:
        templateData.status.textContent = "";
        break;
    }
  }
  disposeTemplate(_templateData) {
  }
};

var PLUGIN_MARKETPLACE_ITEM_TEMPLATE_ID = "pluginMarketplaceItem";

var PluginMarketplaceItemProvider = class {
  constructor(pluginInstallService, agentPluginService) {
    this.pluginInstallService = pluginInstallService;
    this.agentPluginService = agentPluginService;
  }
  getLabel(element) {
    return element.item.name;
  }
  getPublisherDisplayName(element) {
    return element.item.marketplace;
  }
  getDescription(element) {
    return element.item.description;
  }
  getInstallState(element) {
    const installUri = this.pluginInstallService.getPluginInstallUri(this._toInstallable(element.item));
    const isInstalled = this.agentPluginService.plugins.get().some((p) => isEqual2(p.uri, installUri));
    return isInstalled ? 2 /* Installed */ : 0 /* Uninstalled */;
  }
  async install(element) {
    await this.pluginInstallService.installPlugin({ ...this._toInstallable(element.item), readmeUri: element.item.readmeUri });
  }
  onDidChangeInstallState(_element, listener) {
    return runOnChange(this.agentPluginService.plugins, () => listener());
  }
  _toInstallable(item) {
    return {
      name: item.name,
      description: item.description,
      version: "",
      sourceDescriptor: item.sourceDescriptor,
      source: item.source,
      marketplace: item.marketplace,
      marketplaceReference: item.marketplaceReference,
      marketplaceType: item.marketplaceType
    };
  }
};

function installedPluginToItem(plugin, labelService) {
  const name = plugin.label || basename2(plugin.uri);
  const description = plugin.fromMarketplace?.description ?? labelService.getUriLabel(dirname2(plugin.uri), { relative: true });
  const marketplace = plugin.fromMarketplace?.marketplace;
  return { kind: "installed" /* Installed */, name, description, marketplace, plugin };
}

function marketplacePluginToItem(plugin) {
  return {
    kind: "marketplace" /* Marketplace */,
    name: plugin.name,
    description: plugin.description,
    source: plugin.source,
    sourceDescriptor: plugin.sourceDescriptor,
    marketplace: plugin.marketplace,
    marketplaceReference: plugin.marketplaceReference,
    marketplaceType: plugin.marketplaceType,
    readmeUri: plugin.readmeUri
  };
}

var PluginListWidget = class extends Disposable {
  constructor(instantiationService, agentPluginService, pluginMarketplaceService, pluginInstallService, openerService, contextViewService, contextMenuService, hoverService, labelService, commandService, harnessService, itemsModel, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.agentPluginService = agentPluginService;
    this.pluginMarketplaceService = pluginMarketplaceService;
    this.pluginInstallService = pluginInstallService;
    this.openerService = openerService;
    this.contextViewService = contextViewService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.commandService = commandService;
    this.harnessService = harnessService;
    this.itemsModel = itemsModel;
    this.configurationService = configurationService;
    this._onDidSelectPlugin = this._register(new Emitter());
    this.onDidSelectPlugin = this._onDidSelectPlugin.event;
    this._onDidChangeItemCount = this._register(new Emitter());
    this.onDidChangeItemCount = this._onDidChangeItemCount.event;
    this.disabledLinkListener = this._register(new MutableDisposable());
    this.addDropdownActions = this._register(new DisposableStore());
    this.installedItems = [];
    this.remoteItems = [];
    this.displayEntries = [];
    this.marketplaceItems = [];
    this.searchQuery = "";
    this.browseMode = false;
    this.lastHeight = 0;
    this.lastWidth = 0;
    this.lastHeaderHeight = 0;
    this._layoutDeferred = false;
    this.collapsedGroups = /* @__PURE__ */ new Set();
    this.delayedFilter = new Delayer(200);
    this.delayedMarketplaceSearch = new Delayer(400);
    this.element = $87(".mcp-list-widget");
    this.create();
    this.updateAccessState();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.plugins.enabled" /* PluginsEnabled */)) {
        this.updateAccessState();
      }
    }));
    this._register({
      dispose: () => {
        this.marketplaceCts?.dispose();
      }
    });
  }
  create() {
    this.sectionTitleHeader = append(this.element, $87(".section-title-header"));
    const titleRow = append(this.sectionTitleHeader, $87(".section-title-row"));
    const sectionTitle = append(titleRow, $87("h2.section-title"));
    sectionTitle.textContent = localize(9784, null);
    const sectionTitleDescription = append(this.sectionTitleHeader, $87("p.section-title-description"));
    const sectionTitleDescriptionText = append(sectionTitleDescription, $87("span.section-title-description-text"));
    sectionTitleDescriptionText.textContent = localize(9785, null);
    sectionTitleDescription.appendChild(document.createTextNode(" "));
    this.sectionLink = append(sectionTitleDescription, $87("a.section-title-link"));
    this.sectionLink.textContent = localize(9771, null);
    this.sectionLink.href = "https://code.visualstudio.com/docs/agent-customization/agent-plugins?referrer=in-product";
    this._register(addDisposableListener(this.sectionLink, "click", (e) => {
      e.preventDefault();
      const href = this.sectionLink.href;
      if (href) {
        this.openerService.open(URI.parse(href));
      }
    }));
    const targetWindow = getWindow(this.element);
    const headerObserver = this._register(new DisposableResizeObserver(
      "PluginListWidget.sectionTitleHeader",
      () => {
        if (this.lastWidth <= 0 || this.lastHeight <= 0) {
          return;
        }
        const headerHeight = this.sectionTitleHeader.offsetHeight;
        if (headerHeight === this.lastHeaderHeight) {
          return;
        }
        this.layout(this.lastHeight, this.lastWidth);
      },
      targetWindow
    ));
    this._register(headerObserver.observe(this.sectionTitleHeader));
    this.searchAndButtonContainer = append(this.element, $87(".list-search-and-button-container"));
    const searchContainer = append(this.searchAndButtonContainer, $87(".list-search-container"));
    this.searchInput = this._register(new InputBox(searchContainer, this.contextViewService, {
      placeholder: localize(9799, null),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._register(this.searchInput.onDidChange(() => {
      this.searchQuery = this.searchInput.value;
      if (this.browseMode) {
        this.delayedMarketplaceSearch.trigger(() => this.queryMarketplace());
      } else {
        this.delayedFilter.trigger(() => this.filterPlugins());
      }
    }));
    this.buttonContainer = append(this.searchAndButtonContainer, $87(".list-button-group"));
    const backButtonContainer = append(this.buttonContainer, $87(".list-add-button-container"));
    const backToInstalledLabel = localize(9756, null);
    this.backButton = this._register(new Button(backButtonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: backToInstalledLabel, ariaLabel: backToInstalledLabel }));
    this.backButton.label = `$(${Codicon.arrowLeft.id}) ${localize(9779, null)}`;
    this.backButton.element.classList.add("list-add-button");
    backButtonContainer.style.display = "none";
    this._register(this.backButton.onDidClick(() => this.toggleBrowseMode(false)));
    const browseButtonContainer = append(this.buttonContainer, $87(".list-add-button-container"));
    const browseMarketplaceLabel = localize(9757, null);
    this.browseButton = this._register(new Button(browseButtonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: browseMarketplaceLabel, ariaLabel: browseMarketplaceLabel }));
    this.browseButton.element.classList.add("list-add-button");
    this._register(this.browseButton.onDidClick(() => this.runPrimaryButtonAction()));
    this.addButtonContainer = append(this.buttonContainer, $87(".list-add-button-container"));
    const addPluginLabel = localize(9754, null);
    this.addButtonSimple = this._register(new Button(this.addButtonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: addPluginLabel, ariaLabel: addPluginLabel }));
    this.addButtonSimple.element.classList.add("list-add-button");
    this._register(this.addButtonSimple.onDidClick(() => this.runPrimaryAddAction()));
    this.addButton = this._register(new ButtonWithDropdown(this.addButtonContainer, {
      ...defaultButtonStyles,
      secondary: true,
      supportIcons: true,
      contextMenuProvider: this.contextMenuService,
      addPrimaryActionToDropdown: false,
      actions: { getActions: () => this.getAddDropdownActions() },
      title: addPluginLabel,
      ariaLabel: addPluginLabel
    }));
    this.addButton.element.classList.add("list-add-button");
    this._register(this.addButton.onDidClick(() => this.runPrimaryAddAction()));
    const createPluginLabel = localize(9761, null);
    this.createPluginButton = this._register(new Button(this.buttonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: createPluginLabel, ariaLabel: createPluginLabel }));
    this.createPluginButton.element.classList.add("list-icon-button");
    this.createPluginButton.label = `$(${Codicon.newFile.id})`;
    this._register(this.createPluginButton.onDidClick(() => this.runCreatePluginAction()));
    this.emptyContainer = append(this.element, $87(".mcp-empty-state"));
    const emptyHeader = append(this.emptyContainer, $87(".empty-state-header"));
    this.emptyText = append(emptyHeader, $87(".empty-text"));
    this.emptySubtext = append(this.emptyContainer, $87(".empty-subtext"));
    this.disabledContainer = append(this.element, $87(".mcp-disabled-state"));
    const disabledHeader = append(this.disabledContainer, $87(".empty-state-header"));
    this.disabledIcon = append(disabledHeader, $87(".empty-icon"));
    const disabledText = append(disabledHeader, $87(".empty-text"));
    disabledText.textContent = localize(9789, null);
    this.disabledMessage = append(this.disabledContainer, $87(".empty-subtext"));
    this.listContainer = append(this.element, $87(".mcp-list-container"));
    const delegate = new PluginItemDelegate();
    const groupHeaderRenderer = new CustomizationGroupHeaderRenderer("pluginGroupHeader", this.hoverService);
    const installedRenderer = new PluginInstalledItemRenderer(this.harnessService);
    const remoteRenderer = new PluginRemoteItemRenderer();
    const marketplaceRenderer = new GalleryItemRenderer(PLUGIN_MARKETPLACE_ITEM_TEMPLATE_ID, new PluginMarketplaceItemProvider(this.pluginInstallService, this.agentPluginService));
    this.list = this._register(this.instantiationService.createInstance(
      WorkbenchList,
      "PluginManagementList",
      this.listContainer,
      delegate,
      [groupHeaderRenderer, installedRenderer, remoteRenderer, marketplaceRenderer],
      {
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel(element) {
            if (element.type === "group-header") {
              return localize(9780, null, element.label, element.count, element.collapsed ? localize(9760, null) : localize(9769, null));
            }
            const name = formatDisplayName(element.item.name);
            const description = element.item.description ? truncateToFirstLine(element.item.description) : void 0;
            const nameAndDesc = description ? localize(9783, null, name, description) : name;
            if (element.type === "plugin-item") {
              const enabled = isContributionEnabled(element.item.plugin.enablement.get());
              return enabled ? localize(9782, null, nameAndDesc) : localize(9781, null, nameAndDesc);
            }
            return nameAndDesc;
          },
          getWidgetAriaLabel() {
            return localize(9790, null);
          }
        },
        openOnSingleClick: true,
        identityProvider: {
          getId(element) {
            if (element.type === "group-header") {
              return element.id;
            }
            if (element.type === "marketplace-item") {
              return `marketplace-${element.item.marketplaceReference.canonicalId}/${element.item.source}`;
            }
            if (element.type === "remote-item") {
              return element.item.itemKey ?? `remote-${element.item.groupKey ?? "default"}-${element.item.uri.toString()}`;
            }
            return element.item.plugin.uri.toString();
          }
        }
      }
    ));
    this._register(this.list.onDidOpen((e) => {
      if (e.element) {
        if (e.element.type === "group-header") {
          this.toggleGroup(e.element);
        } else if (e.element.type === "plugin-item") {
          this._onDidSelectPlugin.fire(e.element.item);
        } else if (e.element.type === "remote-item") {
        } else if (e.element.type === "marketplace-item") {
          this._onDidSelectPlugin.fire(e.element.item);
        }
      }
    }));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e)));
    this._register(autorun((reader) => {
      const plugins = this.agentPluginService.plugins.read(reader);
      for (const plugin of plugins) {
        plugin.enablement.read(reader);
      }
      if (!this.browseMode) {
        void this.refresh();
      }
    }));
    this._register(this.pluginMarketplaceService.onDidChangeMarketplaces(() => {
      if (!this.browseMode) {
        void this.refresh();
      }
    }));
    this._register(autorun((reader) => {
      this.harnessService.activeHarness.read(reader);
      this.updateToolbarActions();
      if (!this.browseMode) {
        void this.refresh();
      }
    }));
    const itemProviderChangeDisposable = this._register(new MutableDisposable());
    this._register(autorun((reader) => {
      this.harnessService.activeHarness.read(reader);
      const itemProvider = this.harnessService.getActiveDescriptor().itemProvider;
      if (itemProvider) {
        itemProviderChangeDisposable.value = itemProvider.onDidChange(() => {
          if (!this.browseMode) {
            void this.refresh();
          }
        });
      } else {
        itemProviderChangeDisposable.clear();
      }
    }));
    this.updateToolbarActions();
    void this.refresh();
  }
  async refresh() {
    if (this.browseMode) {
      await this.queryMarketplace();
    } else {
      this.filterPlugins();
    }
  }
  updateAccessState() {
    const inspect = this.configurationService.inspect("chat.plugins.enabled" /* PluginsEnabled */);
    const value2 = inspect.value ?? inspect.defaultValue;
    const disabled = value2 === false;
    const policyLocked = inspect.policyValue === false;
    this.element.classList.toggle("access-disabled", disabled);
    if (disabled) {
      this.disabledIcon.className = "empty-icon";
      this.disabledIcon.classList.add(...ThemeIcon.asClassNameArray(policyLocked ? Codicon.shield : pluginIcon));
      clearNode(this.disabledMessage);
      this.disabledLinkListener.clear();
      if (policyLocked) {
        this.disabledMessage.textContent = localize(9786, null);
      } else {
        this.disabledMessage.appendChild(document.createTextNode(localize(9787, null)));
        const link2 = append(this.disabledMessage, $87("a.mcp-disabled-settings-link"));
        link2.textContent = localize(9788, null);
        link2.href = "#";
        link2.setAttribute("role", "button");
        this.disabledLinkListener.value = addDisposableListener(link2, "click", (e) => {
          e.preventDefault();
          this.commandService.executeCommand("workbench.action.openSettings", `@id:${"chat.plugins.enabled" /* PluginsEnabled */}`);
        });
      }
    }
  }
  get pluginActions() {
    return this.harnessService.getActiveDescriptor().pluginActions ?? [];
  }
  formatActionLabel(action, iconOnly = false) {
    if (!action.icon) {
      return action.label;
    }
    return iconOnly ? `$(${action.icon.id})` : `$(${action.icon.id}) ${action.label}`;
  }
  updateToolbarActions() {
    const browseMarketplaceAvailable = this.isBrowseMarketplaceAvailable();
    if (!browseMarketplaceAvailable && this.browseMode) {
      this.toggleBrowseMode(false);
    }
    this.browseButton.element.parentElement.style.display = this.browseMode ? "none" : "";
    this.browseButton.label = `$(${Codicon.library.id}) ${localize(9757, null)}`;
    this.browseButton.enabled = browseMarketplaceAvailable;
    const browseTitle = browseMarketplaceAvailable ? localize(9757, null) : localize(9758, null);
    this.browseButton.setTitle(browseTitle);
    this.browseButton.element.setAttribute("aria-label", browseTitle);
    this.updateAddButton();
    this.createPluginButton.enabled = true;
  }
  isBrowseMarketplaceAvailable() {
    return !isWeb;
  }
  updateAddButton() {
    const actions = this.buildAddActions();
    const [primary, ...dropdown] = actions;
    const hasDropdown = dropdown.length > 0;
    this.addButton.element.style.display = hasDropdown ? "" : "none";
    this.addButtonSimple.element.style.display = hasDropdown ? "none" : "";
    if (!primary) {
      this.addButton.element.style.display = "none";
      this.addButtonSimple.element.style.display = "none";
      return;
    }
    if (hasDropdown) {
      this.addButton.label = this.formatActionLabel(primary);
      this.addButton.enabled = primary.enabled !== false;
      const addPrimaryTitle = primary.tooltip ?? primary.label;
      this.addButton.primaryButton.setTitle(addPrimaryTitle);
      this.addButton.primaryButton.element.setAttribute("aria-label", addPrimaryTitle);
      const moreLabel = localize(9774, null);
      this.addButton.dropdownButton.setTitle(moreLabel);
      this.addButton.dropdownButton.element.setAttribute("aria-label", moreLabel);
    } else {
      this.addButtonSimple.label = this.formatActionLabel(primary);
      this.addButtonSimple.enabled = primary.enabled !== false;
      const addSimpleTitle = primary.tooltip ?? primary.label;
      this.addButtonSimple.setTitle(addSimpleTitle);
      this.addButtonSimple.element.setAttribute("aria-label", addSimpleTitle);
    }
  }
  buildAddActions() {
    return [
      ...this.pluginActions,
      {
        id: "plugin.installFromSource",
        label: localize(9770, null),
        tooltip: localize(9770, null),
        icon: Codicon.add,
        run: async () => {
          const installed = await this.commandService.executeCommand("workbench.action.chat.installPluginFromSource", { skipReveal: true });
          if (installed && this.browseMode) {
            this.exitBrowseMode();
          }
        }
      }
    ];
  }
  getAddDropdownActions() {
    this.addDropdownActions.clear();
    return this.buildAddActions().slice(1).map((action, index2) => this.addDropdownActions.add(new Action(`plugin_add_${index2}`, this.formatActionLabel(action), void 0, action.enabled !== false, () => this.runPluginAction(action))));
  }
  async runPrimaryButtonAction() {
    if (!this.isBrowseMarketplaceAvailable()) {
      return;
    }
    this.toggleBrowseMode(!this.browseMode);
  }
  async runPrimaryAddAction() {
    const [primary] = this.buildAddActions();
    if (primary) {
      await this.runPluginAction(primary);
    }
  }
  async runCreatePluginAction() {
    await this.commandService.executeCommand("workbench.action.chat.createPlugin");
  }
  async runPluginAction(action) {
    if (action.enabled !== false) {
      await action.run();
    }
  }
  showBrowseMarketplace() {
    if (!this.isBrowseMarketplaceAvailable()) {
      return;
    }
    if (!this.browseMode) {
      this.toggleBrowseMode(true);
    }
  }
  toggleBrowseMode(browse) {
    this.browseMode = browse;
    this.searchInput.value = "";
    this.searchQuery = "";
    this.browseButton.element.parentElement.style.display = browse ? "none" : "";
    this.backButton.element.parentElement.style.display = browse ? "" : "none";
    this.searchInput.setPlaceHolder(
      browse ? localize(9798, null) : localize(9799, null)
    );
    if (browse) {
      void this.queryMarketplace();
    } else {
      this.marketplaceCts?.dispose(true);
      this.marketplaceItems = [];
      void this.filterPlugins();
    }
    if (this.lastHeight > 0) {
      this.layout(this.lastHeight, this.lastWidth);
    }
  }
  async queryMarketplace() {
    this.marketplaceCts?.dispose(true);
    const cts = this.marketplaceCts = new CancellationTokenSource();
    this.emptyContainer.style.display = "flex";
    this.listContainer.style.display = "none";
    this.emptyText.textContent = localize(9772, null);
    this.emptySubtext.textContent = "";
    try {
      const plugins = await this.pluginMarketplaceService.fetchMarketplacePlugins(cts.token);
      if (cts.token.isCancellationRequested) {
        return;
      }
      const query = this.searchQuery.toLowerCase().trim();
      const filtered = query ? plugins.filter((p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)) : plugins;
      const installedUris = new Set(this.agentPluginService.plugins.get().map((p) => p.uri.toString()));
      this.marketplaceItems = filtered.filter((p) => {
        const expectedUri = this.pluginInstallService.getPluginInstallUri(p);
        return !installedUris.has(expectedUri.toString());
      }).map(marketplacePluginToItem);
      this.updateMarketplaceList();
    } catch {
      if (!cts.token.isCancellationRequested) {
        this.marketplaceItems = [];
        this.emptyContainer.style.display = "flex";
        this.listContainer.style.display = "none";
        this.emptyText.textContent = localize(9773, null);
        this.emptySubtext.textContent = localize(9800, null);
      }
    }
  }
  updateMarketplaceList() {
    if (this.marketplaceItems.length === 0) {
      this.emptyContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      if (this.searchQuery.trim()) {
        this.emptyText.textContent = localize(9775, null, this.searchQuery);
        this.emptySubtext.textContent = localize(9801, null);
      } else {
        this.emptyText.textContent = localize(9765, null);
        this.emptySubtext.textContent = "";
      }
    } else {
      this.emptyContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
    const entries2 = this.marketplaceItems.map((item) => ({ type: "marketplace-item", item }));
    this.list.splice(0, this.list.length, entries2);
  }
  async getRemotePluginItems(query) {
    if (!this.harnessService.getActiveDescriptor().itemProvider) {
      return [];
    }
    try {
      const provided = await this.itemsModel.getActiveItemSource().fetchProviderItems();
      return provided.filter(
        (item) => isPluginCustomizationItem(item) && (!query || item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query) || item.badge?.toLowerCase().includes(query))
      );
    } catch {
      return [];
    }
  }
  getRemoteGroupMetadata(groupKey) {
    return {
      group: groupKey ?? "remote-host",
      label: localize(9791, null),
      description: localize(9792, null)
    };
  }
  appendGroup(entries2, header2, items, isFirst) {
    if (items.length === 0) {
      return isFirst;
    }
    const collapsed2 = this.collapsedGroups.has(header2.group);
    entries2.push({
      type: "group-header",
      id: `plugin-group-${header2.group}`,
      group: header2.group,
      label: header2.label,
      icon: pluginIcon,
      count: items.length,
      isFirst,
      description: header2.description,
      collapsed: collapsed2
    });
    if (!collapsed2) {
      entries2.push(...items);
    }
    return false;
  }
  async filterPlugins() {
    const query = this.searchQuery.toLowerCase().trim();
    const allPlugins = this.agentPluginService.plugins.get();
    this.remoteItems = [...await this.getRemotePluginItems(query)];
    this.installedItems = allPlugins.map((p) => installedPluginToItem(p, this.labelService)).filter(
      (item) => !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
    );
    if (this.remoteItems.length === 0 && this.installedItems.length === 0) {
      this.emptyContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      if (this.searchQuery.trim()) {
        this.emptyText.textContent = localize(9776, null, this.searchQuery);
        this.emptySubtext.textContent = localize(9801, null);
      } else if (this.harnessService.getActiveDescriptor().itemProvider) {
        this.emptyText.textContent = localize(9778, null);
        this.emptySubtext.textContent = localize(9755, null);
      } else {
        this.emptyText.textContent = localize(9777, null);
        this.emptySubtext.textContent = localize(9759, null);
      }
    } else {
      this.emptyContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
    const enabledPlugins = this.installedItems.filter((item) => isContributionEnabled(item.plugin.enablement.get()));
    const disabledPlugins = this.installedItems.filter((item) => !isContributionEnabled(item.plugin.enablement.get()));
    const entries2 = [];
    let isFirst = true;
    const installedNames = new Set(this.installedItems.map((item) => item.name.toLowerCase()));
    const remoteGroups = /* @__PURE__ */ new Map();
    for (const item of this.remoteItems) {
      const key3 = item.groupKey ?? "remote-host";
      if (key3 === "remote-client") {
        continue;
      }
      if (item.name && installedNames.has(item.name.toLowerCase())) {
        continue;
      }
      let group2 = remoteGroups.get(key3);
      if (!group2) {
        group2 = [];
        remoteGroups.set(key3, group2);
      }
      group2.push({ type: "remote-item", item });
    }
    for (const [groupKey, items] of remoteGroups) {
      isFirst = this.appendGroup(entries2, this.getRemoteGroupMetadata(groupKey), items, isFirst);
    }
    if (enabledPlugins.length > 0) {
      isFirst = this.appendGroup(
        entries2,
        {
          group: "enabled",
          label: localize(9766, null),
          description: localize(9767, null)
        },
        enabledPlugins.map((item) => ({ type: "plugin-item", item })),
        isFirst
      );
    }
    if (disabledPlugins.length > 0) {
      this.appendGroup(
        entries2,
        {
          group: "disabled",
          label: localize(9762, null),
          description: localize(9763, null)
        },
        disabledPlugins.map((item) => ({ type: "plugin-item", item })),
        isFirst
      );
    }
    this.displayEntries = entries2;
    this.list.splice(0, this.list.length, this.displayEntries);
    this._onDidChangeItemCount.fire(this.itemCount);
  }
  /**
   * Gets the total item count from the underlying data array
   * (the same source used to build group headers).
   */
  get itemCount() {
    const installedNames = new Set(this.installedItems.map((item) => item.name.toLowerCase()));
    const uniqueRemote = this.remoteItems.filter((item) => {
      if (item.groupKey === "remote-client") {
        return false;
      }
      if (item.name && installedNames.has(item.name.toLowerCase())) {
        return false;
      }
      return true;
    });
    return uniqueRemote.length + this.installedItems.length;
  }
  /**
   * Re-fires the current item count. Call after subscribing to onDidChangeItemCount
   * to ensure the subscriber receives the latest count.
   */
  fireItemCount() {
    this._onDidChangeItemCount.fire(this.itemCount);
  }
  toggleGroup(entry) {
    if (this.collapsedGroups.has(entry.group)) {
      this.collapsedGroups.delete(entry.group);
    } else {
      this.collapsedGroups.add(entry.group);
    }
    void this.filterPlugins();
  }
  /**
   * Whether the widget is currently in marketplace browse mode.
   */
  isInBrowseMode() {
    return this.browseMode;
  }
  /**
   * Exits marketplace browse mode and returns to the installed plugins list.
   */
  exitBrowseMode() {
    if (this.browseMode) {
      this.toggleBrowseMode(false);
    }
  }
  layout(height, width2) {
    this.lastHeight = height;
    this.lastWidth = width2;
    this.element.style.height = `${height}px`;
    const searchBarHeight = this.searchAndButtonContainer.offsetHeight;
    if (searchBarHeight === 0 && !this._layoutDeferred) {
      this._layoutDeferred = true;
      getWindow(this.element).requestAnimationFrame(() => {
        try {
          this.layout(this.lastHeight, this.lastWidth);
        } finally {
          this._layoutDeferred = false;
        }
      });
      return;
    }
    const headerHeight = this.sectionTitleHeader.offsetHeight;
    this.lastHeaderHeight = headerHeight;
    const listHeight = Math.max(0, height - searchBarHeight - headerHeight);
    this.listContainer.style.height = `${listHeight}px`;
    this.list.layout(listHeight, width2);
  }
  focusSearch() {
    this.searchInput.focus();
  }
  revealLastItem() {
    if (this.list.length > 0) {
      this.list.reveal(this.list.length - 1);
    }
  }
  focus() {
    this.list.domFocus();
    if (this.list.length > 0) {
      this.list.setFocus([0]);
    }
  }
  onContextMenu(e) {
    if (!e.element || e.element.type === "group-header" || e.element.type === "marketplace-item") {
      return;
    }
    const entry = e.element;
    const disposables = new DisposableStore();
    const actions = [];
    if (entry.type === "plugin-item") {
      const groups = getInstalledPluginContextMenuActions(entry.item.plugin, this.instantiationService);
      for (const menuActions of groups) {
        for (const menuAction of menuActions) {
          actions.push(menuAction);
          if (isDisposable(menuAction)) {
            disposables.add(menuAction);
          }
        }
        actions.push(new Separator());
      }
      if (actions.length > 0 && actions[actions.length - 1] instanceof Separator) {
        actions.pop();
      }
    } else {
      const itemActions = entry.item.actions ?? [];
      for (const itemAction of itemActions) {
        actions.push(new Action(
          itemAction.id,
          itemAction.label,
          itemAction.icon ? ThemeIcon.asClassName(itemAction.icon) : void 0,
          itemAction.enabled !== false,
          () => itemAction.run()
        ));
      }
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      getActions: () => actions,
      onHide: () => disposables.dispose()
    });
  }
};

PluginListWidget = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IAgentPluginService),
  __decorateParam(2, IPluginMarketplaceService),
  __decorateParam(3, IPluginInstallService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IContextViewService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IHoverService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, ICommandService),
  __decorateParam(10, ICustomizationHarnessService),
  __decorateParam(11, IAICustomizationItemsModel),
  __decorateParam(12, IConfigurationService)
], PluginListWidget);
export { installedPluginToItem, marketplacePluginToItem, $87, PLUGIN_ITEM_HEIGHT, PluginItemDelegate, PluginInstalledItemRenderer, PluginRemoteItemRenderer, PLUGIN_MARKETPLACE_ITEM_TEMPLATE_ID, PluginMarketplaceItemProvider, PluginListWidget };
