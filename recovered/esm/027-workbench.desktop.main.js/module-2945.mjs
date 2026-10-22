// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentPluginsView.ts
import { dirname2 } from "./module-0034.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPluginInstallService } from "./module-2570.mjs";
import { IPluginMarketplaceService, hasSourceChanged } from "./module-1028.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { manageExtensionIcon } from "./module-1875.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { getWorkbenchMenuMotionContextMenuOptions } from "./module-1612.mjs";
import { Disposable, DisposableStore, MutableDisposable, disposeIfDisposable, isDisposable } from "./module-0012.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { $, append } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { autorun } from "./module-0052.mjs";
import { isContributionEnabled } from "./module-1018.mjs";
import { InstallPluginAction, OpenPluginReadmeAction, getInstalledPluginContextMenuActions } from "./module-2658.mjs";
import { AbstractExtensionsListView } from "./module-2939.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { WorkbenchPagedList } from "./module-0636.mjs";
import { getLocationBasedViewColors } from "./module-1335.mjs";
import { Event2 } from "./module-0017.mjs";
import { AgentPluginEditorInput } from "./module-2749.mjs";
import { PagedModel } from "./module-2282.mjs";
import { derived } from "./module-0054.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { Extensions13, IViewDescriptorService } from "./module-1093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IAgentPluginService } from "./module-1016.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IEditorService } from "./module-0934.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { DefaultViewsContext, IExtensionsWorkbenchService, SearchAgentPluginsContext, extensionsFilterSubMenu } from "./module-1022.mjs";
import { HasInstalledAgentPluginsContext, InstalledAgentPluginsViewId, RefreshAgentPluginMarketplacesCommandId } from "./module-0981.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IProgressService } from "./module-0446.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { Registry } from "./module-0090.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { VIEW_CONTAINER } from "./module-2944.mjs";


// src/vs/workbench/contrib/chat/browser/agentPluginsView.ts
function installedPluginToItem2(plugin, labelService, outdated) {
  const name = plugin.label;
  const description = plugin.fromMarketplace?.description ?? labelService.getUriLabel(dirname2(plugin.uri), { relative: true });
  const marketplace = plugin.fromMarketplace?.marketplace;
  return { kind: "installed" /* Installed */, name, description, marketplace, plugin, outdated };
}

function marketplacePluginToItem2(plugin) {
  return {
    kind: "marketplace" /* Marketplace */,
    name: plugin.name,
    description: plugin.description,
    version: plugin.version,
    source: plugin.source,
    sourceDescriptor: plugin.sourceDescriptor,
    marketplace: plugin.marketplace,
    marketplaceReference: plugin.marketplaceReference,
    marketplaceType: plugin.marketplaceType,
    readmeUri: plugin.readmeUri
  };
}

var UpdatePluginAction = class extends Action {
  constructor(plugin, liveMarketplacePlugin, pluginInstallService, pluginMarketplaceService) {
    super(UpdatePluginAction.ID, localize(8925, null), "extension-action label prominent install");
    this.plugin = plugin;
    this.liveMarketplacePlugin = liveMarketplacePlugin;
    this.pluginInstallService = pluginInstallService;
    this.pluginMarketplaceService = pluginMarketplaceService;
  }
  static {
    this.ID = "agentPlugin.update";
  }
  async run() {
    if (await this.pluginInstallService.updatePlugin(this.liveMarketplacePlugin)) {
      this.pluginMarketplaceService.addInstalledPlugin(this.plugin.uri, this.liveMarketplacePlugin);
    }
  }
};

UpdatePluginAction = __decorateClass([
  __decorateParam(2, IPluginInstallService),
  __decorateParam(3, IPluginMarketplaceService)
], UpdatePluginAction);

var ManagePluginAction = class extends Action {
  constructor(getActionGroups, instantiationService) {
    super(ManagePluginAction.ID, "", ManagePluginAction.CLASS, true);
    this.getActionGroups = getActionGroups;
    this.instantiationService = instantiationService;
    this._actionViewItem = null;
    this.tooltip = localize(8923, null);
  }
  static {
    this.ID = "agentPlugin.manage";
  }
  static {
    this.CLASS = `extension-action icon manage ${ThemeIcon.asClassName(manageExtensionIcon)}`;
  }
  createActionViewItem(options3) {
    this._actionViewItem = this.instantiationService.createInstance(DropDownActionViewItem, this, options3);
    return this._actionViewItem;
  }
  async run() {
    this._actionViewItem?.showMenu(this.getActionGroups());
  }
};

ManagePluginAction = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ManagePluginAction);

var DropDownActionViewItem = class extends ActionViewItem {
  constructor(action, options3, contextMenuService) {
    super(null, action, { ...options3, icon: true, label: false });
    this.contextMenuService = contextMenuService;
  }
  showMenu(actionGroups) {
    if (!this.element) {
      return;
    }
    const actions = actionGroups.flatMap((group2) => [...group2, new Separator()]);
    if (actions.length > 0) {
      actions.pop();
    }
    this.contextMenuService.showContextMenu({
      ...getWorkbenchMenuMotionContextMenuOptions(this.element),
      getActions: () => actions,
      onHide: () => disposeIfDisposable(actions)
    });
  }
};

DropDownActionViewItem = __decorateClass([
  __decorateParam(2, IContextMenuService)
], DropDownActionViewItem);

var AgentPluginRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.templateId = AgentPluginRenderer.templateId;
  }
  static {
    this.templateId = "agentPlugin";
  }
  renderTemplate(root) {
    const element = append(root, $(".agent-plugin-item.extension-list-item"));
    const details = append(element, $(".details"));
    const headerContainer = append(details, $(".header-container"));
    const header2 = append(headerContainer, $(".header"));
    const name = append(header2, $("span.name"));
    const description = append(details, $(".description.ellipsis"));
    const footer = append(details, $(".footer"));
    const detailContainer = append(footer, $(".publisher-container"));
    const detail2 = append(detailContainer, $("span.publisher-name"));
    const actionbar = new ActionBar(footer, {
      focusOnlyEnabledItems: true,
      actionViewItemProvider: (action, options3) => {
        if (action instanceof ManagePluginAction) {
          return action.createActionViewItem(options3);
        }
        return void 0;
      }
    });
    actionbar.setFocusable(false);
    return { root, name, description, detail: detail2, actionbar, disposables: [actionbar], elementDisposables: [] };
  }
  renderPlaceholder(_index, data) {
    data.name.textContent = "";
    data.description.textContent = "";
    data.detail.textContent = "";
    data.actionbar.clear();
    this.disposeElement(void 0, 0, data);
  }
  renderElement(element, _index, data) {
    this.disposeElement(void 0, 0, data);
    data.name.textContent = element.name;
    data.description.textContent = element.description;
    data.elementDisposables.push(autorun((reader) => {
      data.root.classList.toggle("disabled", element.kind === "installed" /* Installed */ && !isContributionEnabled(element.plugin.enablement.read(reader)));
    }));
    const updateActions = (reader) => {
      data.actionbar.clear();
      if (element.kind === "marketplace" /* Marketplace */) {
        data.detail.textContent = element.marketplace;
        const installAction = this.instantiationService.createInstance(InstallPluginAction, element);
        reader.store.add(installAction);
        data.actionbar.push([installAction], { icon: true, label: true });
      } else {
        data.detail.textContent = element.marketplace ?? "";
        const actions = [];
        const livePlugin = element.outdated?.read(reader);
        if (livePlugin) {
          const updateAction = this.instantiationService.createInstance(UpdatePluginAction, element.plugin, livePlugin);
          reader.store.add(updateAction);
          actions.push(updateAction);
        }
        const manageAction = this.instantiationService.createInstance(
          ManagePluginAction,
          () => getInstalledPluginContextMenuActions(element.plugin, this.instantiationService)
        );
        reader.store.add(manageAction);
        actions.push(manageAction);
        data.actionbar.push(actions, { icon: true, label: true });
      }
    };
    data.elementDisposables.push(autorun(updateActions));
  }
  disposeElement(_element, _index, data) {
    for (const d of data.elementDisposables) {
      d.dispose();
    }
    data.elementDisposables = [];
  }
  disposeTemplate(data) {
    for (const d of data.disposables) {
      d.dispose();
    }
    this.disposeElement(void 0, 0, data);
  }
};

AgentPluginRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], AgentPluginRenderer);

var AgentPluginsListView = class extends AbstractExtensionsListView {
  constructor(listOptions, options3, keybindingService, contextMenuService, instantiationService, themeService, hoverService, configurationService, contextKeyService, viewDescriptorService, openerService, agentPluginService, pluginMarketplaceService, pluginInstallService, labelService, editorService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.listOptions = listOptions;
    this.agentPluginService = agentPluginService;
    this.pluginMarketplaceService = pluginMarketplaceService;
    this.pluginInstallService = pluginInstallService;
    this.labelService = labelService;
    this.editorService = editorService;
    this.actionStore = this._register(new DisposableStore());
    this.queryCts = new MutableDisposable();
    this.list = null;
    this.listContainer = null;
    this.currentQuery = "@agentPlugins";
    this.refreshOnPluginsChangedScheduler = this._register(new RunOnceScheduler(() => {
      if (this.list) {
        void this.show(this.currentQuery);
      }
    }, 0));
    this._register(autorun((reader) => {
      const plugins = this.agentPluginService.plugins.read(reader);
      for (const plugin of plugins) {
        plugin.enablement.read(reader);
      }
      if (this.list && this.isBodyVisible()) {
        this.refreshOnPluginsChangedScheduler.schedule();
      }
    }));
    this._register(this.pluginMarketplaceService.onDidChangeMarketplaces(() => {
      if (this.list && this.isBodyVisible()) {
        this.refreshOnPluginsChangedScheduler.schedule();
      }
    }));
  }
  renderBody(container3) {
    super.renderBody(container3);
    const messageContainer = append(container3, $(".message-container"));
    const messageBox = append(messageContainer, $(".message"));
    const pluginsList = $(".agent-plugins-list");
    this.bodyTemplate = { pluginsList, messageBox, messageContainer };
    this.listContainer = append(container3, pluginsList);
    this.list = this._register(this.instantiationService.createInstance(
      WorkbenchPagedList,
      `${this.id}-Agent-Plugins`,
      this.listContainer,
      {
        getHeight() {
          return 72;
        },
        getTemplateId: () => AgentPluginRenderer.templateId
      },
      [this.instantiationService.createInstance(AgentPluginRenderer)],
      {
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel(item) {
            return item?.name ?? "";
          },
          getWidgetAriaLabel() {
            return localize(8914, null);
          }
        },
        overrideStyles: getLocationBasedViewColors(this.viewDescriptorService.getViewLocationById(this.id)).listOverrideStyles
      }
    ));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e), this));
    this._register(Event2.debounce(Event2.filter(this.list.onDidOpen, (e) => e.element !== null), (_, event) => event, 75, true)((options3) => {
      this.editorService.openEditor(
        this.instantiationService.createInstance(AgentPluginEditorInput, options3.element),
        options3.editorOptions
      );
    }));
  }
  onContextMenu(e) {
    if (!e.element) {
      return;
    }
    const actions = this.getContextMenuActions(e.element);
    if (actions.length === 0) {
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      getActions: () => actions
    });
  }
  getContextMenuActions(item) {
    let actions;
    if (item.kind === "installed" /* Installed */) {
      const groups = getInstalledPluginContextMenuActions(item.plugin, this.instantiationService);
      actions = groups.flatMap((group2) => [...group2, new Separator()]);
      if (actions.length > 0) {
        actions.pop();
      }
    } else {
      actions = [];
      if (item.readmeUri) {
        actions.push(this.instantiationService.createInstance(OpenPluginReadmeAction, item.readmeUri));
      }
      actions.push(this.instantiationService.createInstance(InstallPluginAction, item));
    }
    this.actionStore.clear();
    for (const action of actions) {
      if (isDisposable(action)) {
        this.actionStore.add(action);
      }
    }
    return actions;
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.list?.layout(height, width2);
  }
  async show(query) {
    this.currentQuery = query;
    const stripped = query.replace(/@agentPlugins/i, "").trim();
    const isRecommended = /^@recommended$/i.test(stripped);
    const isInstalled = /(?:^|\s)@installed(?:\s|$)/i.test(stripped);
    const text2 = isRecommended ? "" : stripped.replace(/(?:^|\s)@installed(?:\s|$)/gi, " ").trim().toLowerCase();
    let installed = this.queryInstalled();
    if (text2) {
      installed = installed.filter(
        (p) => p.name.toLowerCase().includes(text2) || p.description.toLowerCase().includes(text2) || (p.marketplace ?? "").toLowerCase().includes(text2)
      );
    }
    if (isRecommended) {
      const recommended = this.pluginMarketplaceService.recommendedPlugins.get();
      installed = installed.filter((p) => {
        const marketplace = p.plugin.fromMarketplace;
        if (!marketplace) {
          return false;
        }
        const key3 = `${marketplace.name}@${marketplace.marketplace}`;
        return recommended.has(key3);
      });
    }
    let items = installed;
    if (!this.listOptions.installedOnly && !isInstalled) {
      const marketplacePlugins = await this.queryMarketplacePlugins();
      let filteredMp = marketplacePlugins;
      if (isRecommended) {
        const recommended = this.pluginMarketplaceService.recommendedPlugins.get();
        filteredMp = filteredMp.filter((p) => {
          const key3 = `${p.name}@${p.marketplace}`;
          return recommended.has(key3);
        });
      } else {
        const lowerText = text2.toLowerCase();
        filteredMp = filteredMp.filter((p) => p.name.toLowerCase().includes(lowerText) || p.description.toLowerCase().includes(lowerText) || p.marketplace.toLowerCase().includes(lowerText));
      }
      const marketplace = filteredMp.map(marketplacePluginToItem2);
      const installedPaths = new Set(installed.map((i2) => i2.plugin.uri.toString()));
      const filteredMarketplace = marketplace.filter((m) => {
        const expectedUri = this.pluginInstallService.getPluginInstallUri({
          name: m.name,
          description: m.description,
          version: m.version ?? "",
          source: m.source,
          sourceDescriptor: m.sourceDescriptor,
          marketplace: m.marketplace,
          marketplaceReference: m.marketplaceReference,
          marketplaceType: m.marketplaceType
        });
        return !installedPaths.has(expectedUri.toString());
      });
      items = [...installed, ...filteredMarketplace];
    }
    const model = new PagedModel(items);
    if (this.list) {
      this.list.model = model;
    }
    this.updateBody(model.length);
    return model;
  }
  /**
   * Builds the installed plugin list using only cached marketplace data
   * (no IO). The cached data is populated by {@link fetchMarketplacePlugins}
   * and exposed via the {@link IPluginMarketplaceService.lastFetchedPlugins}
   * observable, which the view's autorun subscribes to for reactivity.
   */
  queryInstalled() {
    const marketplaceObs = derived((reader) => {
      const cachedMarketplace = this.pluginMarketplaceService.lastFetchedPlugins.read(reader);
      const marketplaceByKey = /* @__PURE__ */ new Map();
      for (const mp of cachedMarketplace) {
        marketplaceByKey.set(`${mp.marketplaceReference.canonicalId}::${mp.name}`, mp);
      }
      const installedByUri = /* @__PURE__ */ new Map();
      for (const entry of this.pluginMarketplaceService.installedPlugins.read(reader)) {
        installedByUri.set(entry.pluginUri.toString(), entry.plugin);
      }
      return { marketplaceByKey, installedByUri };
    });
    const plugins = this.agentPluginService.plugins.get();
    return plugins.map((p) => {
      const isOutdated = derived((reader) => {
        const { marketplaceByKey, installedByUri } = marketplaceObs.read(reader);
        const storedPlugin = installedByUri.get(p.uri.toString()) ?? p.fromMarketplace;
        if (storedPlugin) {
          const key3 = `${storedPlugin.marketplaceReference.canonicalId}::${storedPlugin.name}`;
          const live = marketplaceByKey.get(key3);
          if (live && hasSourceChanged(storedPlugin.sourceDescriptor, live.sourceDescriptor)) {
            return live;
          }
        }
        return void 0;
      });
      return installedPluginToItem2(p, this.labelService, isOutdated);
    });
  }
  async queryMarketplacePlugins() {
    this.queryCts.value?.cancel();
    const cts = new CancellationTokenSource();
    this.queryCts.value = cts;
    try {
      return await this.pluginMarketplaceService.fetchMarketplacePlugins(cts.token);
    } catch {
      return [];
    }
  }
  updateBody(count2) {
    if (this.bodyTemplate) {
      this.bodyTemplate.pluginsList.classList.toggle("hidden", count2 === 0);
      this.bodyTemplate.messageContainer.classList.toggle("hidden", count2 > 0);
      if (count2 === 0 && this.isBodyVisible()) {
        this.bodyTemplate.messageBox.textContent = localize(8924, null);
      }
    }
  }
};

AgentPluginsListView = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IAgentPluginService),
  __decorateParam(12, IPluginMarketplaceService),
  __decorateParam(13, IPluginInstallService),
  __decorateParam(14, ILabelService),
  __decorateParam(15, IEditorService)
], AgentPluginsListView);

var AgentPluginsBrowseCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.agentPlugins.browse",
      title: localize2(8915, "Agent Plugins"),
      tooltip: localize2(8916, "Browse Agent Plugins"),
      icon: Codicon.search,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
      menu: [{
        id: extensionsFilterSubMenu,
        group: "1_predefined",
        order: 2,
        when: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
      }, {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", InstalledAgentPluginsViewId), ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
        group: "navigation"
      }]
    });
  }
  async run(accessor) {
    accessor.get(IExtensionsWorkbenchService).openSearch("@agentPlugins ");
  }
};

var RefreshPluginMarketplacesCommand = class extends Action2 {
  constructor() {
    super({
      id: RefreshAgentPluginMarketplacesCommandId,
      title: localize2(8920, "Refresh Plugin Marketplaces"),
      category: localize2(8922, "Chat"),
      icon: Codicon.refresh,
      precondition: ChatContextKeys.enabled,
      f1: true
    });
  }
  async run(accessor) {
    const marketplaceService = accessor.get(IPluginMarketplaceService);
    const notificationService = accessor.get(INotificationService);
    const progressService = accessor.get(IProgressService);
    const cts = new CancellationTokenSource();
    const failedLabels = [];
    try {
      await progressService.withProgress(
        {
          location: 15 /* Notification */,
          title: localize(8919, null),
          cancellable: true
        },
        () => marketplaceService.fetchMarketplacePlugins(cts.token, void 0, {
          refresh: true,
          onMarketplaceError: (reference) => failedLabels.push(reference.displayLabel)
        }),
        () => cts.dispose(true)
      );
      if (cts.token.isCancellationRequested) {
        return;
      }
      if (failedLabels.length > 0) {
        notificationService.warn(localize(8918, null, failedLabels.length, failedLabels.join(", ")));
      } else {
        notificationService.info(localize(8917, null));
      }
    } catch (error) {
      notificationService.error(localize(8921, null, getErrorMessage(error)));
      throw error;
    } finally {
      cts.dispose();
    }
  }
};

var AgentPluginsViewsContribution = class extends Disposable {
  static {
    this.ID = "workbench.chat.agentPlugins.views.contribution";
  }
  constructor(contextKeyService, agentPluginService) {
    super();
    const hasInstalledKey = HasInstalledAgentPluginsContext.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      hasInstalledKey.set(agentPluginService.plugins.read(reader).length > 0);
    }));
    registerAction2(AgentPluginsBrowseCommand);
    registerAction2(RefreshPluginMarketplacesCommand);
    Registry.as(Extensions13.ViewsRegistry).registerViews([
      {
        id: InstalledAgentPluginsViewId,
        name: localize2(8913, "Agent Plugins - Installed"),
        ctorDescriptor: new SyncDescriptor(AgentPluginsListView, [{ installedOnly: true }]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledAgentPluginsContext, ChatContextKeys.Setup.hidden.negate()),
        weight: 30,
        order: 5,
        canToggleVisibility: true
      },
      {
        id: "workbench.views.agentPlugins.default.marketplace",
        name: localize2(8912, "Agent Plugins"),
        ctorDescriptor: new SyncDescriptor(AgentPluginsListView, [{}]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledAgentPluginsContext.toNegated(), ChatContextKeys.Setup.hidden.negate()),
        weight: 30,
        order: 5,
        canToggleVisibility: true,
        hideByDefault: true
      },
      {
        id: "workbench.views.agentPlugins.marketplace",
        name: localize2(8912, "Agent Plugins"),
        ctorDescriptor: new SyncDescriptor(AgentPluginsListView, [{}]),
        when: ContextKeyExpr.and(SearchAgentPluginsContext, ChatContextKeys.Setup.hidden.negate())
      }
    ], VIEW_CONTAINER);
  }
};

AgentPluginsViewsContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IAgentPluginService)
], AgentPluginsViewsContribution);
export { installedPluginToItem2, marketplacePluginToItem2, UpdatePluginAction, ManagePluginAction, DropDownActionViewItem, AgentPluginRenderer, AgentPluginsListView, AgentPluginsBrowseCommand, RefreshPluginMarketplacesCommand, AgentPluginsViewsContribution };
