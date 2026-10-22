// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsViewlet.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13, IViewDescriptorService } from "./module-1093.mjs";
import { AutoCheckUpdatesConfigurationKey, AutoRestartConfigurationKey, CONTEXT_EXTENSIONS_GALLERY_STATUS, CONTEXT_HAS_GALLERY, CloseExtensionDetailsOnViewChangeKey, DefaultViewsContext, IExtensionsWorkbenchService, INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID, OUTDATED_EXTENSIONS_VIEW_ID, SearchAgentPluginsContext, SearchMcpServersContext, VIEWLET_ID2, WORKSPACE_RECOMMENDATIONS_VIEW_ID, extensionsSearchActionsMenu } from "./module-1022.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPane } from "./module-1335.mjs";
import { DEFAULT_ACCOUNT_SIGN_IN_COMMAND } from "./module-1824.mjs";
import { Event2 } from "./module-0017.mjs";
import { AbstractExtensionsListView, DefaultPopularExtensionsView, DefaultRecommendedExtensionsView, DeprecatedExtensionsView, DisabledExtensionsView, EnabledExtensionsView, ExtensionsListView, NONE_CATEGORY, OutdatedExtensionsView, RecentlyUpdatedExtensionsView, RecommendedExtensionsView, SearchMarketplaceExtensionsView, ServerInstalledExtensionsView, StaticQueryExtensionsView, UntrustedWorkspacePartiallySupportedExtensionsView, UntrustedWorkspaceUnsupportedExtensionsView, VirtualWorkspacePartiallySupportedExtensionsView, VirtualWorkspaceUnsupportedExtensionsView, WorkspaceRecommendedExtensionsView } from "./module-2939.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { installLocalInRemoteIcon } from "./module-1875.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { InstallLocalExtensionsInRemoteAction, InstallRemoteExtensionsInLocalAction } from "./module-1877.mjs";
import { VirtualWorkspaceContext, WorkbenchStateContext } from "./module-0949.mjs";
import { EXTENSION_CATEGORIES } from "./module-0688.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionManagementServerService, IWorkbenchExtensionEnablementService } from "./module-1046.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { Delayer, timeout } from "./module-0036.mjs";
import { $, Dimension, DragAndDropObserver, EventType, addDisposableListener, append, clearNode, hide, show, trackFocus } from "./module-0075.mjs";
import { SIDE_BAR_DRAG_AND_DROP_BACKGROUND } from "./module-0912.mjs";
import { SuggestEnabledInput } from "./module-1838.mjs";
import { Query3 } from "./module-2917.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { coalesce } from "./module-0007.mjs";
import { extractEditorsAndFilesDropData } from "./module-0273.mjs";
import { extname2 } from "./module-0034.mjs";
import { registerNavigableContainer } from "./module-1369.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { renderAsPlaintext, renderMarkdown } from "./module-0468.mjs";
import { SeverityIcon } from "./module-0699.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { alert } from "./module-0076.mjs";
import { ExtensionsInput } from "./module-2918.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { createErrorWithActions } from "./module-0094.mjs";
import { Action } from "./module-0082.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IExtensionGalleryManifestService } from "./module-0890.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILogService } from "./module-0095.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { severity_default } from "./module-0266.mjs";
import { IActivityService, NumberBadge, WarningBadge } from "./module-1449.mjs";
import { URI } from "./module-0032.mjs";
import { IExtensionManagementService } from "./module-0872.mjs";
import { IHostService } from "./module-1117.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsViewlet.ts
var ExtensionsSortByContext = new RawContextKey("extensionsSortByValue", "");

var SearchMarketplaceExtensionsContext = new RawContextKey("searchMarketplaceExtensions", false);

var SearchHasTextContext = new RawContextKey("extensionSearchHasText", false);

var InstalledExtensionsContext = new RawContextKey("installedExtensions", false);

var SearchInstalledExtensionsContext = new RawContextKey("searchInstalledExtensions", false);

var SearchRecentlyUpdatedExtensionsContext = new RawContextKey("searchRecentlyUpdatedExtensions", false);

var SearchExtensionUpdatesContext = new RawContextKey("searchExtensionUpdates", false);

var SearchOutdatedExtensionsContext = new RawContextKey("searchOutdatedExtensions", false);

var SearchEnabledExtensionsContext = new RawContextKey("searchEnabledExtensions", false);

var SearchDisabledExtensionsContext = new RawContextKey("searchDisabledExtensions", false);

var HasInstalledExtensionsContext = new RawContextKey("hasInstalledExtensions", true);

var BuiltInExtensionsContext = new RawContextKey("builtInExtensions", false);

var SearchBuiltInExtensionsContext = new RawContextKey("searchBuiltInExtensions", false);

var SearchUnsupportedWorkspaceExtensionsContext = new RawContextKey("searchUnsupportedWorkspaceExtensions", false);

var SearchDeprecatedExtensionsContext = new RawContextKey("searchDeprecatedExtensions", false);

var SearchRestartRequiredExtensionsContext = new RawContextKey("searchRestartRequiredExtensions", false);

var RecommendedExtensionsContext = new RawContextKey("recommendedExtensions", false);

var SortByUpdateDateContext = new RawContextKey("sortByUpdateDate", false);

var ExtensionsSearchValueContext = new RawContextKey("extensionsSearchValue", "");

var REMOTE_CATEGORY = localize2(15466, "Remote");

var ExtensionsViewletViewsContribution = class extends Disposable {
  constructor(extensionManagementServerService, labelService, contextKeyService) {
    super();
    this.extensionManagementServerService = extensionManagementServerService;
    this.labelService = labelService;
    this.contextKeyService = contextKeyService;
    this.container = Registry.as(Extensions13.ViewContainersRegistry).get(VIEWLET_ID2);
    this.registerViews();
  }
  registerViews() {
    const viewDescriptors = [];
    viewDescriptors.push(...this.createDefaultExtensionsViewDescriptors());
    viewDescriptors.push(...this.createSearchExtensionsViewDescriptors());
    viewDescriptors.push(...this.createRecommendedExtensionsViewDescriptors());
    viewDescriptors.push(...this.createBuiltinExtensionsViewDescriptors());
    viewDescriptors.push(...this.createUnsupportedWorkspaceExtensionsViewDescriptors());
    viewDescriptors.push(...this.createOtherLocalFilteredExtensionsViewDescriptors());
    viewDescriptors.push({
      id: "workbench.views.extensions.marketplaceAccess",
      name: localize2(15459, "Marketplace"),
      ctorDescriptor: new SyncDescriptor(class extends ViewPane {
        shouldShowWelcome() {
          return true;
        }
      }),
      when: ContextKeyExpr.and(
        ContextKeyExpr.or(
          ContextKeyExpr.has("searchMarketplaceExtensions"),
          ContextKeyExpr.and(DefaultViewsContext)
        ),
        ContextKeyExpr.or(CONTEXT_EXTENSIONS_GALLERY_STATUS.isEqualTo("requiresSignIn" /* RequiresSignIn */), CONTEXT_EXTENSIONS_GALLERY_STATUS.isEqualTo("accessDenied" /* AccessDenied */))
      ),
      order: -1
    });
    const viewRegistry = Registry.as(Extensions13.ViewsRegistry);
    viewRegistry.registerViews(viewDescriptors, this.container);
    viewRegistry.registerViewWelcomeContent("workbench.views.extensions.marketplaceAccess", {
      content: localize(15472, null, `command:${DEFAULT_ACCOUNT_SIGN_IN_COMMAND}`),
      when: CONTEXT_EXTENSIONS_GALLERY_STATUS.isEqualTo("requiresSignIn" /* RequiresSignIn */)
    });
    viewRegistry.registerViewWelcomeContent("workbench.views.extensions.marketplaceAccess", {
      content: localize(15432, null),
      when: CONTEXT_EXTENSIONS_GALLERY_STATUS.isEqualTo("accessDenied" /* AccessDenied */)
    });
  }
  createDefaultExtensionsViewDescriptors() {
    const viewDescriptors = [];
    const servers = [];
    if (this.extensionManagementServerService.localExtensionManagementServer) {
      servers.push(this.extensionManagementServerService.localExtensionManagementServer);
    }
    if (this.extensionManagementServerService.remoteExtensionManagementServer) {
      servers.push(this.extensionManagementServerService.remoteExtensionManagementServer);
    }
    if (this.extensionManagementServerService.webExtensionManagementServer) {
      servers.push(this.extensionManagementServerService.webExtensionManagementServer);
    }
    const getViewName = (viewTitle, server) => {
      return servers.length > 1 ? `${server.label} - ${viewTitle}` : viewTitle;
    };
    let installedWebExtensionsContextChangeEvent = Event2.None;
    if (this.extensionManagementServerService.webExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
      const interestingContextKeys = /* @__PURE__ */ new Set();
      interestingContextKeys.add("hasInstalledWebExtensions");
      installedWebExtensionsContextChangeEvent = Event2.filter(this.contextKeyService.onDidChangeContext, (e) => e.affectsSome(interestingContextKeys));
    }
    const serverLabelChangeEvent = Event2.any(this.labelService.onDidChangeFormatters, installedWebExtensionsContextChangeEvent);
    for (const server of servers) {
      const getInstalledViewName = () => getViewName(localize(15455, null), server);
      const onDidChangeTitle = Event2.map(serverLabelChangeEvent, () => getInstalledViewName());
      const id2 = servers.length > 1 ? `workbench.views.extensions.${server.id}.installed` : `workbench.views.extensions.installed`;
      viewDescriptors.push({
        id: id2,
        get name() {
          return {
            value: getInstalledViewName(),
            original: getViewName("Installed", server)
          };
        },
        weight: 100,
        order: 1,
        when: ContextKeyExpr.and(DefaultViewsContext),
        ctorDescriptor: new SyncDescriptor(ServerInstalledExtensionsView, [{ server, flexibleHeight: true, onDidChangeTitle }]),
        /* Installed extensions views shall not be allowed to hidden when there are more than one server */
        canToggleVisibility: servers.length === 1
      });
      if (server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManagementServerService.localExtensionManagementServer) {
        this._register(registerAction2(class InstallLocalExtensionsInRemoteAction2 extends Action2 {
          constructor() {
            super({
              id: "workbench.extensions.installLocalExtensions",
              get title() {
                return localize2(15470, "Install Local Extensions in '{0}'...", server.label);
              },
              category: REMOTE_CATEGORY,
              icon: installLocalInRemoteIcon,
              f1: true,
              menu: {
                id: MenuId.ViewTitle,
                when: ContextKeyExpr.equals("view", id2),
                group: "navigation"
              }
            });
          }
          run(accessor) {
            return accessor.get(IInstantiationService).createInstance(InstallLocalExtensionsInRemoteAction).run();
          }
        }));
      }
    }
    if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
      this._register(registerAction2(class InstallRemoteExtensionsInLocalAction2 extends Action2 {
        constructor() {
          super({
            id: "workbench.extensions.actions.installLocalExtensionsInRemote",
            title: localize2(15454, "Install Remote Extensions Locally..."),
            category: REMOTE_CATEGORY,
            f1: true
          });
        }
        run(accessor) {
          return accessor.get(IInstantiationService).createInstance(InstallRemoteExtensionsInLocalAction, "workbench.extensions.actions.installLocalExtensionsInRemote").run();
        }
      }));
    }
    viewDescriptors.push({
      id: "workbench.views.extensions.popular",
      name: localize2(15462, "Popular"),
      ctorDescriptor: new SyncDescriptor(DefaultPopularExtensionsView, [{ hideBadge: true }]),
      when: ContextKeyExpr.and(DefaultViewsContext, ContextKeyExpr.not("hasInstalledExtensions"), CONTEXT_HAS_GALLERY),
      weight: 60,
      order: 2,
      canToggleVisibility: false
    });
    viewDescriptors.push({
      id: "extensions.recommendedList",
      name: localize2(15464, "Recommended"),
      ctorDescriptor: new SyncDescriptor(DefaultRecommendedExtensionsView, [{ flexibleHeight: true }]),
      when: ContextKeyExpr.and(DefaultViewsContext, SortByUpdateDateContext.negate(), ContextKeyExpr.not("config.extensions.showRecommendationsOnlyOnDemand"), CONTEXT_HAS_GALLERY),
      weight: 40,
      order: 3,
      canToggleVisibility: true
    });
    if (servers.length === 1) {
      viewDescriptors.push({
        id: "workbench.views.extensions.enabled",
        name: localize2(15445, "Enabled"),
        ctorDescriptor: new SyncDescriptor(EnabledExtensionsView, [{}]),
        when: ContextKeyExpr.and(DefaultViewsContext, ContextKeyExpr.has("hasInstalledExtensions")),
        hideByDefault: true,
        weight: 40,
        order: 4,
        canToggleVisibility: true
      });
      viewDescriptors.push({
        id: "workbench.views.extensions.disabled",
        name: localize2(15442, "Disabled"),
        ctorDescriptor: new SyncDescriptor(DisabledExtensionsView, [{}]),
        when: ContextKeyExpr.and(DefaultViewsContext, ContextKeyExpr.has("hasInstalledExtensions")),
        hideByDefault: true,
        weight: 10,
        order: 5,
        canToggleVisibility: true
      });
    }
    return viewDescriptors;
  }
  createSearchExtensionsViewDescriptors() {
    const viewDescriptors = [];
    viewDescriptors.push({
      id: "workbench.views.extensions.marketplace",
      name: localize2(15459, "Marketplace"),
      ctorDescriptor: new SyncDescriptor(SearchMarketplaceExtensionsView, [{}]),
      when: ContextKeyExpr.and(ContextKeyExpr.has("searchMarketplaceExtensions"), CONTEXT_HAS_GALLERY)
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchInstalled",
      name: localize2(15456, "Installed"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.or(ContextKeyExpr.has("searchInstalledExtensions"), ContextKeyExpr.has("installedExtensions"))
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchRecentlyUpdated",
      name: localize2(15463, "Recently Updated"),
      ctorDescriptor: new SyncDescriptor(RecentlyUpdatedExtensionsView, [{}]),
      when: ContextKeyExpr.or(SearchExtensionUpdatesContext, ContextKeyExpr.has("searchRecentlyUpdatedExtensions")),
      order: 2
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchEnabled",
      name: localize2(15444, "Enabled"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.and(ContextKeyExpr.has("searchEnabledExtensions"))
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchDisabled",
      name: localize2(15441, "Disabled"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.and(ContextKeyExpr.has("searchDisabledExtensions"))
    });
    viewDescriptors.push({
      id: OUTDATED_EXTENSIONS_VIEW_ID,
      name: localize2(15434, "Available Updates"),
      ctorDescriptor: new SyncDescriptor(OutdatedExtensionsView, [{}]),
      when: ContextKeyExpr.or(SearchExtensionUpdatesContext, ContextKeyExpr.has("searchOutdatedExtensions")),
      order: 1
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchBuiltin",
      name: localize2(15435, "Builtin"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.and(ContextKeyExpr.has("searchBuiltInExtensions"))
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchWorkspaceUnsupported",
      name: localize2(15481, "Workspace Unsupported"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.and(ContextKeyExpr.has("searchWorkspaceUnsupportedExtensions"))
    });
    return viewDescriptors;
  }
  createRecommendedExtensionsViewDescriptors() {
    const viewDescriptors = [];
    viewDescriptors.push({
      id: WORKSPACE_RECOMMENDATIONS_VIEW_ID,
      name: localize2(15480, "Workspace Recommendations"),
      ctorDescriptor: new SyncDescriptor(WorkspaceRecommendedExtensionsView, [{}]),
      when: ContextKeyExpr.and(ContextKeyExpr.has("recommendedExtensions"), WorkbenchStateContext.notEqualsTo("empty")),
      order: 1
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.otherRecommendations",
      name: localize2(15461, "Other Recommendations"),
      ctorDescriptor: new SyncDescriptor(RecommendedExtensionsView, [{}]),
      when: ContextKeyExpr.has("recommendedExtensions"),
      order: 2
    });
    return viewDescriptors;
  }
  createBuiltinExtensionsViewDescriptors() {
    const viewDescriptors = [];
    const configuredCategories = ["themes", "programming languages"];
    const otherCategories = EXTENSION_CATEGORIES.filter((c) => !configuredCategories.includes(c.toLowerCase()));
    otherCategories.push(NONE_CATEGORY);
    const otherCategoriesQuery = `${otherCategories.map((c) => `category:"${c}"`).join(" ")} ${configuredCategories.map((c) => `category:"-${c}"`).join(" ")}`;
    viewDescriptors.push({
      id: "workbench.views.extensions.builtinFeatureExtensions",
      name: localize2(15436, "Features"),
      ctorDescriptor: new SyncDescriptor(StaticQueryExtensionsView, [{ query: `@builtin ${otherCategoriesQuery}` }]),
      when: ContextKeyExpr.has("builtInExtensions")
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.builtinThemeExtensions",
      name: localize2(15438, "Themes"),
      ctorDescriptor: new SyncDescriptor(StaticQueryExtensionsView, [{ query: `@builtin category:themes` }]),
      when: ContextKeyExpr.has("builtInExtensions")
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.builtinProgrammingLanguageExtensions",
      name: localize2(15437, "Programming Languages"),
      ctorDescriptor: new SyncDescriptor(StaticQueryExtensionsView, [{ query: `@builtin category:"programming languages"` }]),
      when: ContextKeyExpr.has("builtInExtensions")
    });
    return viewDescriptors;
  }
  createUnsupportedWorkspaceExtensionsViewDescriptors() {
    const viewDescriptors = [];
    viewDescriptors.push({
      id: "workbench.views.extensions.untrustedUnsupportedExtensions",
      name: localize2(15477, "Disabled in Restricted Mode"),
      ctorDescriptor: new SyncDescriptor(UntrustedWorkspaceUnsupportedExtensionsView, [{}]),
      when: ContextKeyExpr.and(SearchUnsupportedWorkspaceExtensionsContext)
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.untrustedPartiallySupportedExtensions",
      name: localize2(15476, "Limited in Restricted Mode"),
      ctorDescriptor: new SyncDescriptor(UntrustedWorkspacePartiallySupportedExtensionsView, [{}]),
      when: ContextKeyExpr.and(SearchUnsupportedWorkspaceExtensionsContext)
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.virtualUnsupportedExtensions",
      name: localize2(15479, "Disabled in Virtual Workspaces"),
      ctorDescriptor: new SyncDescriptor(VirtualWorkspaceUnsupportedExtensionsView, [{}]),
      when: ContextKeyExpr.and(VirtualWorkspaceContext, SearchUnsupportedWorkspaceExtensionsContext)
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.virtualPartiallySupportedExtensions",
      name: localize2(15478, "Limited in Virtual Workspaces"),
      ctorDescriptor: new SyncDescriptor(VirtualWorkspacePartiallySupportedExtensionsView, [{}]),
      when: ContextKeyExpr.and(VirtualWorkspaceContext, SearchUnsupportedWorkspaceExtensionsContext)
    });
    return viewDescriptors;
  }
  createOtherLocalFilteredExtensionsViewDescriptors() {
    const viewDescriptors = [];
    viewDescriptors.push({
      id: "workbench.views.extensions.deprecatedExtensions",
      name: localize2(15440, "Deprecated"),
      ctorDescriptor: new SyncDescriptor(DeprecatedExtensionsView, [{}]),
      when: ContextKeyExpr.and(SearchDeprecatedExtensionsContext)
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.restartRequired",
      name: localize2(15467, "Restart Required"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.and(SearchRestartRequiredExtensionsContext)
    });
    return viewDescriptors;
  }
};

ExtensionsViewletViewsContribution = __decorateClass([
  __decorateParam(0, IExtensionManagementServerService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IContextKeyService)
], ExtensionsViewletViewsContribution);

var ExtensionsViewPaneContainer = class extends ViewPaneContainer {
  constructor(layoutService, telemetryService, progressService, instantiationService, editorGroupService, extensionGalleryManifestService, extensionsWorkbenchService, extensionManagementServerService, notificationService, paneCompositeService, themeService, configurationService, storageService, contextService, contextKeyService, contextMenuService, extensionService, viewDescriptorService, preferencesService, commandService, logService, openerService) {
    super(VIEWLET_ID2, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
    this.progressService = progressService;
    this.editorGroupService = editorGroupService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.notificationService = notificationService;
    this.paneCompositeService = paneCompositeService;
    this.contextKeyService = contextKeyService;
    this.preferencesService = preferencesService;
    this.commandService = commandService;
    this.openerService = openerService;
    this.extensionGalleryManifest = null;
    this.notificationDisposables = this._register(new MutableDisposable());
    this.searchDelayer = this._register(new Delayer(500));
    this.extensionsSearchValueContextKey = ExtensionsSearchValueContext.bindTo(contextKeyService);
    this.defaultViewsContextKey = DefaultViewsContext.bindTo(contextKeyService);
    this.sortByContextKey = ExtensionsSortByContext.bindTo(contextKeyService);
    this.searchMarketplaceExtensionsContextKey = SearchMarketplaceExtensionsContext.bindTo(contextKeyService);
    this.searchMcpServersContextKey = SearchMcpServersContext.bindTo(contextKeyService);
    this.searchAgentPluginsContextKey = SearchAgentPluginsContext.bindTo(contextKeyService);
    this.searchHasTextContextKey = SearchHasTextContext.bindTo(contextKeyService);
    this.sortByUpdateDateContextKey = SortByUpdateDateContext.bindTo(contextKeyService);
    this.installedExtensionsContextKey = InstalledExtensionsContext.bindTo(contextKeyService);
    this.searchInstalledExtensionsContextKey = SearchInstalledExtensionsContext.bindTo(contextKeyService);
    this.searchRecentlyUpdatedExtensionsContextKey = SearchRecentlyUpdatedExtensionsContext.bindTo(contextKeyService);
    this.searchExtensionUpdatesContextKey = SearchExtensionUpdatesContext.bindTo(contextKeyService);
    this.searchWorkspaceUnsupportedExtensionsContextKey = SearchUnsupportedWorkspaceExtensionsContext.bindTo(contextKeyService);
    this.searchDeprecatedExtensionsContextKey = SearchDeprecatedExtensionsContext.bindTo(contextKeyService);
    this.searchRestartRequiredExtensionsContextKey = SearchRestartRequiredExtensionsContext.bindTo(contextKeyService);
    this.searchOutdatedExtensionsContextKey = SearchOutdatedExtensionsContext.bindTo(contextKeyService);
    this.searchEnabledExtensionsContextKey = SearchEnabledExtensionsContext.bindTo(contextKeyService);
    this.searchDisabledExtensionsContextKey = SearchDisabledExtensionsContext.bindTo(contextKeyService);
    this.hasInstalledExtensionsContextKey = HasInstalledExtensionsContext.bindTo(contextKeyService);
    this.builtInExtensionsContextKey = BuiltInExtensionsContext.bindTo(contextKeyService);
    this.searchBuiltInExtensionsContextKey = SearchBuiltInExtensionsContext.bindTo(contextKeyService);
    this.recommendedExtensionsContextKey = RecommendedExtensionsContext.bindTo(contextKeyService);
    this._register(this.paneCompositeService.onDidPaneCompositeOpen((e) => {
      if (e.viewContainerLocation === 0 /* Sidebar */) {
        this.onViewletOpen(e.composite);
      }
    }, this));
    this._register(extensionsWorkbenchService.onReset(() => this.refresh()));
    this.searchViewletState = this.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    extensionGalleryManifestService.getExtensionGalleryManifest().then((galleryManifest) => {
      this.extensionGalleryManifest = galleryManifest;
      this._register(extensionGalleryManifestService.onDidChangeExtensionGalleryManifest((galleryManifest2) => {
        this.extensionGalleryManifest = galleryManifest2;
        this.refresh();
      }));
    });
  }
  get searchValue() {
    return this.searchBox?.getValue();
  }
  create(parent) {
    parent.classList.add("extensions-viewlet");
    this.root = parent;
    const overlay = append(this.root, $(".overlay"));
    const overlayBackgroundColor = this.getColor(SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? "";
    overlay.style.backgroundColor = overlayBackgroundColor;
    hide(overlay);
    this.header = append(this.root, $(".header"));
    const placeholder = localize(15469, null);
    const searchValue = this.searchViewletState["query.value"] ? this.searchViewletState["query.value"] : "";
    const searchContainer = append(this.header, $(".extensions-search-container"));
    this.searchBox = this._register(this.instantiationService.createInstance(SuggestEnabledInput, `${VIEWLET_ID2}.searchbox`, searchContainer, {
      triggerCharacters: ["@"],
      sortKey: (item) => {
        if (item.indexOf(":") === -1) {
          return "a";
        } else if (/ext:/.test(item) || /id:/.test(item) || /tag:/.test(item)) {
          return "b";
        } else if (/sort:/.test(item)) {
          return "c";
        } else {
          return "d";
        }
      },
      provideResults: (query) => Query3.suggestions(query, this.extensionGalleryManifest)
    }, placeholder, "extensions:searchinput", { placeholderText: placeholder, value: searchValue }));
    this.notificationContainer = append(this.header, $(".notification-container.hidden", { "tabindex": "0" }));
    this.renderNotificaiton();
    this._register(this.extensionsWorkbenchService.onDidChangeExtensionsNotification(() => this.renderNotificaiton()));
    this.updateInstalledExtensionsContexts();
    if (this.searchBox.getValue()) {
      this.triggerSearch();
    }
    this._register(this.searchBox.onInputDidChange(() => {
      this.sortByContextKey.set(Query3.parse(this.searchBox?.getValue() ?? "").sortBy);
      this.triggerSearch();
    }, this));
    this._register(this.searchBox.onShouldFocusResults(() => this.focusListView(), this));
    const controlElement = append(searchContainer, $(".extensions-search-actions-container"));
    this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, controlElement, extensionsSearchActionsMenu, {
      toolbarOptions: {
        primaryGroup: () => true
      },
      actionViewItemProvider: (action, options3) => createActionViewItem(this.instantiationService, action, options3)
    }));
    this._register(new DragAndDropObserver(this.root, {
      onDragEnter: (e) => {
        if (this.isSupportedDragElement(e)) {
          show(overlay);
        }
      },
      onDragLeave: (e) => {
        if (this.isSupportedDragElement(e)) {
          hide(overlay);
        }
      },
      onDragOver: (e) => {
        if (this.isSupportedDragElement(e)) {
          e.dataTransfer.dropEffect = "copy";
        }
      },
      onDrop: async (e) => {
        if (this.isSupportedDragElement(e)) {
          hide(overlay);
          const vsixs = coalesce((await this.instantiationService.invokeFunction((accessor) => extractEditorsAndFilesDropData(accessor, e))).map((editor) => editor.resource && extname2(editor.resource) === ".vsix" ? editor.resource : void 0));
          if (vsixs.length > 0) {
            try {
              await this.commandService.executeCommand(INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID, vsixs);
            } catch (err) {
              this.notificationService.error(err);
            }
          }
        }
      }
    }));
    super.create(append(this.root, $(".extensions")));
    const focusTracker = this._register(trackFocus(this.root));
    const isSearchBoxFocused = () => this.searchBox?.inputWidget.hasWidgetFocus();
    this._register(registerNavigableContainer({
      name: "extensionsView",
      focusNotifiers: [focusTracker],
      focusNextWidget: () => {
        if (isSearchBoxFocused()) {
          this.focusListView();
        }
      },
      focusPreviousWidget: () => {
        if (!isSearchBoxFocused()) {
          this.searchBox?.focus();
        }
      }
    }));
  }
  focus() {
    super.focus();
    this.searchBox?.focus();
  }
  layout(dimension) {
    this._dimension = dimension;
    if (this.root) {
      this.root.classList.toggle("narrow", dimension.width <= 250);
      this.root.classList.toggle("mini", dimension.width <= 200);
    }
    this.searchBox?.layout(new Dimension(dimension.width - 34 - /*padding*/
    8 - 24 * 2, 20));
    const searchBoxHeight = 20 + 21;
    const headerHeight = this.header && !!this.notificationContainer?.childNodes.length ? this.notificationContainer.clientHeight + searchBoxHeight + 10 : searchBoxHeight;
    this.header.style.height = `${headerHeight}px`;
    super.layout(new Dimension(dimension.width, dimension.height - headerHeight));
  }
  getOptimalWidth() {
    return 400;
  }
  search(value2) {
    if (this.searchBox && this.searchBox.getValue() !== value2) {
      this.searchBox.setValue(value2);
    }
  }
  async refresh() {
    await this.updateInstalledExtensionsContexts();
    this.doSearch(true);
    if (this.configurationService.getValue(AutoCheckUpdatesConfigurationKey)) {
      this.extensionsWorkbenchService.checkForUpdates();
    }
  }
  renderNotificaiton() {
    if (!this.notificationContainer) {
      return;
    }
    clearNode(this.notificationContainer);
    this.notificationDisposables.value = new DisposableStore();
    const status2 = this.extensionsWorkbenchService.getExtensionsNotification();
    const query = status2?.query ?? status2?.extensions.map((extension) => `@id:${extension.identifier.id}`).join(" ");
    if (status2 && (query === this.searchBox?.getValue() || !this.searchMarketplaceExtensionsContextKey.get())) {
      const messagePlainText = isMarkdownString(status2.message) ? renderAsPlaintext(status2.message) : status2.message;
      this.notificationContainer.setAttribute("aria-label", messagePlainText);
      this.notificationContainer.classList.remove("hidden");
      const messageContainer = append(this.notificationContainer, $(".message-container"));
      append(messageContainer, $("span")).className = SeverityIcon.className(status2.severity);
      const messageText2 = append(messageContainer, $("span.message-text"));
      const messageElement = append(messageText2, $("span.message"));
      if (isMarkdownString(status2.message)) {
        const isTrusted = status2.message.isTrusted;
        const allowCommands = typeof isTrusted === "object" ? isTrusted.enabledCommands : !!isTrusted;
        this.notificationDisposables.value.add(renderMarkdown(status2.message, {
          actionHandler: (link2) => {
            this.openerService.open(link2, { allowCommands });
          }
        }, messageElement));
      } else {
        messageElement.textContent = status2.message;
      }
      if (status2.extensions.length) {
        const showAction = append(
          messageText2,
          $("span.message-text-action", {
            "tabindex": "0",
            "role": "button",
            "aria-label": `${messagePlainText}. ${localize(15439, null)}`
          }, localize(15471, null))
        );
        this.notificationDisposables.value.add(addDisposableListener(showAction, EventType.CLICK, () => this.search(query ?? "")));
        this.notificationDisposables.value.add(addDisposableListener(showAction, EventType.KEY_DOWN, (e) => {
          const standardKeyboardEvent = new StandardKeyboardEvent(e);
          if (standardKeyboardEvent.keyCode === 3 /* Enter */ || standardKeyboardEvent.keyCode === 10 /* Space */) {
            this.search(query ?? "");
          }
          standardKeyboardEvent.stopPropagation();
        }));
      }
      const actionsContainer = append(this.notificationContainer, $(".notification-actions"));
      if (status2.action) {
        const actionButton = append(
          actionsContainer,
          $("span.message-action-button", {
            "tabindex": "0",
            "role": "button",
            "aria-label": status2.action.label
          }, status2.action.label)
        );
        this.notificationDisposables.value.add(addDisposableListener(actionButton, EventType.CLICK, () => {
          Promise.resolve(status2.action.run()).catch((error) => this.notificationService.error(error));
        }));
        this.notificationDisposables.value.add(addDisposableListener(actionButton, EventType.KEY_DOWN, (e) => {
          const standardKeyboardEvent = new StandardKeyboardEvent(e);
          if (standardKeyboardEvent.keyCode === 3 /* Enter */ || standardKeyboardEvent.keyCode === 10 /* Space */) {
            Promise.resolve(status2.action.run()).catch((error) => this.notificationService.error(error));
          }
          standardKeyboardEvent.stopPropagation();
        }));
      }
      const dismiss = status2.dismiss;
      if (dismiss) {
        const dismissLabel = localize(15443, null);
        const dismissButton = append(
          actionsContainer,
          $("span.dismiss-action.codicon.codicon-close", {
            "tabindex": "0",
            "role": "button",
            "aria-label": dismissLabel,
            "title": dismissLabel
          })
        );
        this.notificationDisposables.value.add(addDisposableListener(dismissButton, EventType.CLICK, () => dismiss()));
        this.notificationDisposables.value.add(addDisposableListener(dismissButton, EventType.KEY_DOWN, (e) => {
          const standardKeyboardEvent = new StandardKeyboardEvent(e);
          if (standardKeyboardEvent.keyCode === 3 /* Enter */ || standardKeyboardEvent.keyCode === 10 /* Space */) {
            dismiss();
          }
          standardKeyboardEvent.stopPropagation();
        }));
      }
    } else {
      this.notificationContainer.removeAttribute("aria-label");
      this.notificationContainer.classList.add("hidden");
      if (this.searchBox && ExtensionsListView.isRestartRequiredQuery(this.searchBox.getValue())) {
        this.search("");
      }
    }
    if (this._dimension) {
      this.layout(this._dimension);
    }
  }
  async updateInstalledExtensionsContexts() {
    const result = await this.extensionsWorkbenchService.queryLocal();
    this.hasInstalledExtensionsContextKey.set(result.some((r2) => !r2.isBuiltin));
  }
  triggerSearch() {
    this.searchDelayer.trigger(() => this.doSearch(), this.searchBox && this.searchBox.getValue() ? 500 : 0).then(void 0, (err) => this.onError(err));
  }
  normalizedQuery() {
    return this.searchBox ? this.searchBox.getValue().trim().replace(/@category/g, "category").replace(/@tag:/g, "tag:").replace(/@ext:/g, "ext:").replace(/@featured/g, "featured").replace(/@popular/g, this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer ? "@web" : "@popular") : "";
  }
  saveState() {
    const value2 = this.searchBox ? this.searchBox.getValue() : "";
    if (ExtensionsListView.isLocalExtensionsQuery(value2)) {
      this.searchViewletState["query.value"] = value2;
    } else {
      this.searchViewletState["query.value"] = "";
    }
    super.saveState();
  }
  doSearch(refresh) {
    const value2 = this.normalizedQuery();
    this.contextKeyService.bufferChangeEvents(() => {
      const isRecommendedExtensionsQuery = ExtensionsListView.isRecommendedExtensionsQuery(value2);
      this.searchHasTextContextKey.set(value2.trim() !== "");
      this.extensionsSearchValueContextKey.set(value2);
      this.installedExtensionsContextKey.set(ExtensionsListView.isInstalledExtensionsQuery(value2));
      this.searchInstalledExtensionsContextKey.set(ExtensionsListView.isSearchInstalledExtensionsQuery(value2));
      this.searchRecentlyUpdatedExtensionsContextKey.set(ExtensionsListView.isSearchRecentlyUpdatedQuery(value2) && !ExtensionsListView.isSearchExtensionUpdatesQuery(value2));
      this.searchOutdatedExtensionsContextKey.set(ExtensionsListView.isOutdatedExtensionsQuery(value2) && !ExtensionsListView.isSearchExtensionUpdatesQuery(value2));
      this.searchExtensionUpdatesContextKey.set(ExtensionsListView.isSearchExtensionUpdatesQuery(value2));
      this.searchEnabledExtensionsContextKey.set(ExtensionsListView.isEnabledExtensionsQuery(value2));
      this.searchDisabledExtensionsContextKey.set(ExtensionsListView.isDisabledExtensionsQuery(value2));
      this.searchBuiltInExtensionsContextKey.set(ExtensionsListView.isSearchBuiltInExtensionsQuery(value2));
      this.searchWorkspaceUnsupportedExtensionsContextKey.set(ExtensionsListView.isSearchWorkspaceUnsupportedExtensionsQuery(value2));
      this.searchDeprecatedExtensionsContextKey.set(ExtensionsListView.isSearchDeprecatedExtensionsQuery(value2));
      this.searchRestartRequiredExtensionsContextKey.set(ExtensionsListView.isRestartRequiredQuery(value2));
      this.builtInExtensionsContextKey.set(ExtensionsListView.isBuiltInExtensionsQuery(value2));
      this.recommendedExtensionsContextKey.set(isRecommendedExtensionsQuery);
      this.searchMcpServersContextKey.set(!!value2 && /@mcp\s?.*/i.test(value2));
      this.searchAgentPluginsContextKey.set(!!value2 && /@agentPlugins\s?.*/i.test(value2));
      this.searchMarketplaceExtensionsContextKey.set(!!value2 && !ExtensionsListView.isLocalExtensionsQuery(value2) && !isRecommendedExtensionsQuery && !this.searchMcpServersContextKey.get() && !this.searchAgentPluginsContextKey.get());
      this.sortByUpdateDateContextKey.set(ExtensionsListView.isSortUpdateDateQuery(value2));
      this.defaultViewsContextKey.set(!value2 || ExtensionsListView.isSortInstalledExtensionsQuery(value2));
    });
    this.renderNotificaiton();
    return this.showExtensionsViews(this.panes);
  }
  onDidAddViewDescriptors(added) {
    const addedViews = super.onDidAddViewDescriptors(added);
    this.showExtensionsViews(addedViews);
    return addedViews;
  }
  async showExtensionsViews(views) {
    await this.progress(Promise.all(views.map(async (view) => {
      if (view instanceof AbstractExtensionsListView) {
        const model = await view.show(this.normalizedQuery());
        this.alertSearchResult(model.length, view.id);
      }
    })));
  }
  alertSearchResult(count2, viewId) {
    const view = this.viewContainerModel.visibleViewDescriptors.find((view2) => view2.id === viewId);
    switch (count2) {
      case 0:
        break;
      case 1:
        if (view) {
          alert(localize(15447, null, view.name.value));
        } else {
          alert(localize(15446, null));
        }
        break;
      default:
        if (view) {
          alert(localize(15449, null, count2, view.name.value));
        } else {
          alert(localize(15448, null, count2));
        }
        break;
    }
  }
  getFirstExpandedPane() {
    for (const pane of this.panes) {
      if (pane.isExpanded() && pane instanceof ExtensionsListView) {
        return pane;
      }
    }
    return void 0;
  }
  focusListView() {
    const pane = this.getFirstExpandedPane();
    if (pane && pane.count() > 0) {
      pane.focus();
    }
  }
  onViewletOpen(viewlet) {
    if (!viewlet || viewlet.getId() === VIEWLET_ID2) {
      return;
    }
    if (this.configurationService.getValue(CloseExtensionDetailsOnViewChangeKey)) {
      const promises = this.editorGroupService.groups.map((group2) => {
        const editors = group2.editors.filter((input) => input instanceof ExtensionsInput);
        return group2.closeEditors(editors);
      });
      Promise.all(promises);
    }
  }
  progress(promise) {
    return this.progressService.withProgress({ location: 5 /* Extensions */ }, () => promise);
  }
  onError(err) {
    if (isCancellationError(err)) {
      return;
    }
    const message = err && err.message || "";
    if (/ECONNREFUSED/.test(message)) {
      const error = createErrorWithActions(localize(15475, null), [
        new Action("open user settings", localize(15460, null), void 0, true, () => this.preferencesService.openUserSettings())
      ]);
      this.notificationService.error(error);
      return;
    }
    this.notificationService.error(err);
  }
  isSupportedDragElement(e) {
    if (e.dataTransfer) {
      const typesLowerCase = e.dataTransfer.types.map((t2) => t2.toLocaleLowerCase());
      return typesLowerCase.indexOf("files") !== -1;
    }
    return false;
  }
};

ExtensionsViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IProgressService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, IExtensionGalleryManifestService),
  __decorateParam(6, IExtensionsWorkbenchService),
  __decorateParam(7, IExtensionManagementServerService),
  __decorateParam(8, INotificationService),
  __decorateParam(9, IPaneCompositePartService),
  __decorateParam(10, IThemeService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IStorageService),
  __decorateParam(13, IWorkspaceContextService),
  __decorateParam(14, IContextKeyService),
  __decorateParam(15, IContextMenuService),
  __decorateParam(16, IExtensionService),
  __decorateParam(17, IViewDescriptorService),
  __decorateParam(18, IPreferencesService),
  __decorateParam(19, ICommandService),
  __decorateParam(20, ILogService),
  __decorateParam(21, IOpenerService)
], ExtensionsViewPaneContainer);

var StatusUpdater = class extends Disposable {
  constructor(activityService, extensionsWorkbenchService, extensionEnablementService, configurationService) {
    super();
    this.activityService = activityService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.configurationService = configurationService;
    this.badgeHandle = this._register(new MutableDisposable());
    this.onServiceChange();
    this._register(Event2.any(Event2.debounce(extensionsWorkbenchService.onChange, () => void 0, 100, void 0, void 0, void 0, this._store), extensionsWorkbenchService.onDidChangeExtensionsNotification)(this.onServiceChange, this));
  }
  onServiceChange() {
    this.badgeHandle.clear();
    let badge;
    const extensionsNotification = this.extensionsWorkbenchService.getExtensionsNotification();
    if (extensionsNotification && extensionsNotification.severity === severity_default.Warning) {
      badge = new WarningBadge(() => isMarkdownString(extensionsNotification.message) ? renderAsPlaintext(extensionsNotification.message) : extensionsNotification.message);
    }
    if (!badge) {
      const actionRequired = this.configurationService.getValue(AutoRestartConfigurationKey) === true ? [] : this.extensionsWorkbenchService.installed.filter((e) => e.runtimeState !== void 0);
      const outdated = this.extensionsWorkbenchService.outdated.reduce((r2, e) => r2 + (this.extensionEnablementService.isEnabled(e.local) && !actionRequired.includes(e) && !this.extensionsWorkbenchService.isAutoUpdateDelayed(e) ? 1 : 0), 0);
      const newBadgeNumber = outdated + actionRequired.length;
      if (newBadgeNumber > 0) {
        let msg = "";
        if (outdated) {
          msg += outdated === 1 ? localize(15453, null, outdated) : localize(15451, null, outdated);
        }
        if (outdated > 0 && actionRequired.length > 0) {
          msg += ", ";
        }
        if (actionRequired.length) {
          msg += actionRequired.length === 1 ? localize(15452, null, actionRequired.length) : localize(15450, null, actionRequired.length);
        }
        badge = new NumberBadge(newBadgeNumber, () => msg);
      }
    }
    if (badge) {
      this.badgeHandle.value = this.activityService.showViewContainerActivity(VIEWLET_ID2, { badge });
    }
  }
};

StatusUpdater = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IWorkbenchExtensionEnablementService),
  __decorateParam(3, IConfigurationService)
], StatusUpdater);

var MaliciousExtensionChecker = class {
  constructor(extensionsManagementService, extensionsWorkbenchService, hostService, logService, notificationService, commandService) {
    this.extensionsManagementService = extensionsManagementService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.hostService = hostService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.commandService = commandService;
    this.loopCheckForMaliciousExtensions();
  }
  loopCheckForMaliciousExtensions() {
    this.checkForMaliciousExtensions().then(() => timeout(1e3 * 60 * 5)).then(() => this.loopCheckForMaliciousExtensions());
  }
  async checkForMaliciousExtensions() {
    try {
      const maliciousExtensions = [];
      let shouldRestartExtensions = false;
      let shouldReloadWindow = false;
      for (const extension of this.extensionsWorkbenchService.installed) {
        if (extension.isMalicious && extension.local) {
          maliciousExtensions.push([extension.local, extension.maliciousInfoLink]);
          shouldRestartExtensions = shouldRestartExtensions || extension.runtimeState?.action === "restartExtensions" /* RestartExtensions */;
          shouldReloadWindow = shouldReloadWindow || extension.runtimeState?.action === "reloadWindow" /* ReloadWindow */;
        }
      }
      if (maliciousExtensions.length) {
        await this.extensionsManagementService.uninstallExtensions(maliciousExtensions.map((e) => ({ extension: e[0], options: { remove: true } })));
        for (const [extension, link2] of maliciousExtensions) {
          const buttons = [];
          if (shouldRestartExtensions || shouldReloadWindow) {
            buttons.push({
              label: shouldRestartExtensions ? localize(15468, null) : localize(15465, null),
              run: () => shouldRestartExtensions ? this.extensionsWorkbenchService.updateRunningExtensions() : this.hostService.reload()
            });
          }
          if (link2) {
            buttons.push({
              label: localize(15457, null),
              run: () => this.commandService.executeCommand("vscode.open", URI.parse(link2))
            });
          }
          this.notificationService.prompt(
            severity_default.Warning,
            localize(15458, null, extension.manifest.displayName || extension.identifier.id),
            buttons,
            {
              sticky: true,
              priority: 3 /* URGENT */
            }
          );
        }
      }
    } catch (err) {
      this.logService.error(err);
    }
  }
};

MaliciousExtensionChecker = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IHostService),
  __decorateParam(3, ILogService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, ICommandService)
], MaliciousExtensionChecker);

var ExtensionMarketplaceStatusUpdater = class extends Disposable {
  constructor(activityService, extensionGalleryManifestService) {
    super();
    this.activityService = activityService;
    this.extensionGalleryManifestService = extensionGalleryManifestService;
    this.badgeHandle = this._register(new MutableDisposable());
    this.accountBadgeDisposable = this._register(new MutableDisposable());
    this.updateBadge();
    this._register(this.extensionGalleryManifestService.onDidChangeExtensionGalleryManifestStatus(() => this.updateBadge()));
  }
  async updateBadge() {
    this.badgeHandle.clear();
    const status2 = this.extensionGalleryManifestService.extensionGalleryManifestStatus;
    let badge;
    switch (status2) {
      case "requiresSignIn" /* RequiresSignIn */:
        badge = new NumberBadge(1, () => localize(15474, null));
        break;
      case "accessDenied" /* AccessDenied */:
        badge = new WarningBadge(() => localize(15433, null));
        break;
    }
    if (badge) {
      this.badgeHandle.value = this.activityService.showViewContainerActivity(VIEWLET_ID2, { badge });
    }
    this.accountBadgeDisposable.clear();
    if (status2 === "requiresSignIn" /* RequiresSignIn */) {
      const badge2 = new NumberBadge(1, () => localize(15473, null));
      this.accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge: badge2 });
    }
  }
};

ExtensionMarketplaceStatusUpdater = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IExtensionGalleryManifestService)
], ExtensionMarketplaceStatusUpdater);
export { ExtensionsSortByContext, SearchMarketplaceExtensionsContext, SearchHasTextContext, InstalledExtensionsContext, SearchInstalledExtensionsContext, SearchRecentlyUpdatedExtensionsContext, SearchExtensionUpdatesContext, SearchOutdatedExtensionsContext, SearchEnabledExtensionsContext, SearchDisabledExtensionsContext, HasInstalledExtensionsContext, BuiltInExtensionsContext, SearchBuiltInExtensionsContext, SearchUnsupportedWorkspaceExtensionsContext, SearchDeprecatedExtensionsContext, SearchRestartRequiredExtensionsContext, RecommendedExtensionsContext, SortByUpdateDateContext, ExtensionsSearchValueContext, REMOTE_CATEGORY, ExtensionsViewletViewsContribution, ExtensionsViewPaneContainer, StatusUpdater, MaliciousExtensionChecker, ExtensionMarketplaceStatusUpdater };
