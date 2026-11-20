// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensions.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { AutoRestartConfigurationKey, AutoUpdateConfigurationKey, CONTEXT_EXTENSIONS_GALLERY_STATUS, CONTEXT_HAS_GALLERY, DefaultViewsContext, EXTENSIONS_CATEGORY, HasOutdatedExtensionsContext, IExtensionsWorkbenchService, INSTALL_ACTIONS_GROUP, INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID, LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID, OUTDATED_EXTENSIONS_VIEW_ID, SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID, THEME_ACTIONS_GROUP, TOGGLE_IGNORE_EXTENSION_ACTION_ID, UPDATE_ACTIONS_GROUP, VIEWLET_ID2, WORKSPACE_RECOMMENDATIONS_VIEW_ID, extensionsFilterSubMenu, extensionsSearchActionsMenu } from "./module-1022.mjs";
import { ExtensionsWorkbenchService } from "./module-2941.mjs";
import { IExtensionRecommendationNotificationService } from "./module-2916.mjs";
import { ExtensionRecommendationNotificationService } from "./module-2923.mjs";
import { IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService } from "./module-1702.mjs";
import { ExtensionRecommendationsService } from "./module-2933.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { InstallExtensionQuickAccessProvider, ManageExtensionsQuickAccessProvider } from "./module-2938.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { ExtensionEditor } from "./module-2921.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ExtensionsInput } from "./module-2918.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { BuiltInExtensionsContext, ExtensionMarketplaceStatusUpdater, ExtensionsSearchValueContext, ExtensionsSortByContext, ExtensionsViewPaneContainer, ExtensionsViewletViewsContribution, MaliciousExtensionChecker, RecommendedExtensionsContext, SearchHasTextContext, SearchMarketplaceExtensionsContext, StatusUpdater } from "./module-2940.mjs";
import { clearSearchResultsIcon, configureRecommendedIcon, extensionsViewIcon, filterIcon, installWorkspaceRecommendedIcon, refreshIcon } from "./module-1875.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { EXTENSIONS_SUPPORT_AGENTS_WINDOW } from "./module-1048.mjs";
import { WORKSPACE_TRUST_EXTENSION_SUPPORT } from "./module-1047.mjs";
import { EXTENSION_INSTALL_SOURCE_CONTEXT, ExtensionRequestsTimeoutConfigKey, ExtensionsLocalizedLabel, IExtensionGalleryService, IExtensionManagementService, PreferencesLocalizedLabel, VerifyExtensionSignatureConfigKey } from "./module-0872.mjs";
import { isNative, isWeb } from "./module-0014.mjs";
import { product_default } from "./module-0139.mjs";
import { ExtensionGalleryServiceUrlConfigKey, IExtensionGalleryManifestService, getExtensionGalleryManifestResourceUri } from "./module-0890.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { ExtensionsConfigurationSchema, ExtensionsConfigurationSchemaId } from "./module-1874.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { areSameExtensions, getIdAndVersion } from "./module-0886.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { URI } from "./module-0032.mjs";
import { IExtensionManagementServerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "./module-1046.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { IEditorService } from "./module-0934.mjs";
import { CopyAction, CutAction, PasteAction } from "./module-0556.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore, isDisposable } from "./module-0012.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { IsSessionsWindowContext, ResourceContextKey, WorkbenchStateContext } from "./module-0949.mjs";
import { IViewsService } from "./module-1246.mjs";
import { CONTEXT_KEYBINDINGS_EDITOR } from "./module-1831.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { mnemonicButtonLabel } from "./module-0711.mjs";
import { IHostService } from "./module-1117.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Categories } from "./module-0847.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { Event2 } from "./module-0017.mjs";
import { EXTENSION_CATEGORIES } from "./module-0688.mjs";
import { Query3 } from "./module-2917.mjs";
import { ClearLanguageAction, ConfigureWorkspaceFolderRecommendedExtensionsAction, ConfigureWorkspaceRecommendedExtensionsAction, InstallAction, InstallAnotherVersionAction, InstallSpecificVersionOfExtensionAction, SetColorThemeAction, SetFileIconThemeAction, SetProductIconThemeAction, ToggleAutoUpdateForExtensionAction, ToggleAutoUpdatesForPublisherAction, TogglePreReleaseExtensionAction } from "./module-1877.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { CONTEXT_SYNC_ENABLEMENT } from "./module-1744.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceExtensionsConfigService } from "./module-1703.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { IPluginInstallService } from "./module-2570.mjs";
import { ExtensionStorageService } from "./module-1265.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { SearchExtensionsTool, SearchExtensionsToolData } from "./module-2919.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { KeymapExtensions } from "./module-2472.mjs";
import { ExtensionActivationProgress } from "./module-2934.mjs";
import { ExtensionDependencyChecker } from "./module-2937.mjs";
import { ExtensionEnablementWorkspaceTrustTransitionParticipant } from "./module-2922.mjs";
import { ExtensionsCompletionItemsProvider } from "./module-2935.mjs";
import { ExtensionEnablementContextKeysContribution } from "./module-2936.mjs";
import { UnsupportedExtensionsMigrationContrib } from "./module-2943.mjs";
import { DEFAULT_ACCOUNT_SIGN_IN_COMMAND } from "./module-1824.mjs";
import { Extensions14 } from "./module-1112.mjs";


// src/vs/workbench/contrib/extensions/browser/extensions.contribution.ts
registerSingleton(
  IExtensionsWorkbenchService,
  ExtensionsWorkbenchService,
  0 /* Eager */
  /* Auto updates extensions */
);

registerSingleton(IExtensionRecommendationNotificationService, ExtensionRecommendationNotificationService, 1 /* Delayed */);

registerSingleton(
  IExtensionRecommendationsService,
  ExtensionRecommendationsService,
  0 /* Eager */
  /* Prompts recommendations in the background */
);

Registry.as(Extensions18.Quickaccess).registerQuickAccessProvider({
  ctor: ManageExtensionsQuickAccessProvider,
  prefix: ManageExtensionsQuickAccessProvider.PREFIX,
  placeholder: localize(15162, null),
  helpEntries: [{ description: localize(15161, null) }]
});

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    ExtensionEditor,
    ExtensionEditor.ID,
    localize(15090, null)
  ),
  [
    new SyncDescriptor(ExtensionsInput)
  ]
);

var VIEW_CONTAINER = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer(
  {
    id: VIEWLET_ID2,
    title: localize2(15098, "Extensions"),
    openCommandActionDescriptor: {
      id: VIEWLET_ID2,
      mnemonicTitle: localize(15164, null),
      keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 54 /* KeyX */ },
      order: 4
    },
    ctorDescriptor: new SyncDescriptor(ExtensionsViewPaneContainer),
    icon: extensionsViewIcon,
    order: 4,
    rejectAddedViews: true,
    alwaysUseContainerInfo: true
  },
  0 /* Sidebar */
);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "extensions",
  order: 30,
  title: localize(15117, null),
  type: "object",
  properties: {
    "extensions.autoUpdate": {
      type: "string",
      enum: ["on", "off"],
      enumDescriptions: [
        localize(15103, null),
        localize(15102, null)
      ],
      description: localize(15101, null),
      default: "on",
      scope: 1 /* APPLICATION */,
      tags: ["usesOnlineServices"],
      policy: {
        name: "ExtensionsAutoUpdate",
        category: "Extensions" /* Extensions */,
        minimumVersion: "1.125",
        localization: {
          description: {
            key: "extensions.autoUpdate",
            value: localize(15101, null)
          },
          enumDescriptions: [
            {
              key: "extensions.autoUpdate.on",
              value: localize(15103, null)
            },
            {
              key: "extensions.autoUpdate.off",
              value: localize(15102, null)
            }
          ]
        }
      }
    },
    "extensions.autoUpdateDelay": {
      type: "number",
      default: 12,
      minimum: 0,
      markdownDescription: localize(15104, null),
      scope: 1 /* APPLICATION */,
      policy: {
        name: "ExtensionsAutoUpdateDelay",
        category: "Extensions" /* Extensions */,
        minimumVersion: "1.125",
        localization: {
          description: {
            key: "extensions.autoUpdateDelay",
            value: localize(15104, null)
          }
        }
      }
    },
    "extensions.autoCheckUpdates": {
      type: "boolean",
      description: localize(15115, null),
      default: true,
      scope: 1 /* APPLICATION */,
      tags: ["usesOnlineServices"]
    },
    "extensions.ignoreRecommendations": {
      type: "boolean",
      description: localize(15119, null),
      default: false,
      agentsWindow: { default: true, readOnly: true }
    },
    "extensions.showRecommendationsOnlyOnDemand": {
      type: "boolean",
      deprecationMessage: localize(15122, null),
      default: false,
      tags: ["usesOnlineServices"]
    },
    "extensions.closeExtensionDetailsOnViewChange": {
      type: "boolean",
      description: localize(15116, null),
      default: false
    },
    "extensions.confirmedUriHandlerExtensionIds": {
      type: "array",
      items: {
        type: "string"
      },
      description: localize(15133, null),
      default: [],
      scope: 1 /* APPLICATION */
    },
    "extensions.webWorker": {
      type: ["boolean", "string"],
      enum: [true, false, "auto"],
      enumDescriptions: [
        localize(15127, null),
        localize(15126, null),
        localize(15125, null)
      ],
      description: localize(15124, null),
      default: "auto"
    },
    "extensions.supportVirtualWorkspaces": {
      type: "object",
      markdownDescription: localize(15113, null),
      patternProperties: {
        "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          type: "boolean",
          default: false
        }
      },
      additionalProperties: false,
      default: {},
      defaultSnippets: [{
        "body": {
          "pub.name": false
        }
      }]
    },
    [EXTENSIONS_SUPPORT_AGENTS_WINDOW]: {
      type: "object",
      scope: 1 /* APPLICATION */,
      markdownDescription: localize(15106, null),
      patternProperties: {
        "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          type: "boolean",
          default: false
        }
      },
      additionalProperties: false,
      default: {},
      defaultSnippets: [{
        "body": {
          "pub.name": true
        }
      }]
    },
    "extensions.experimental.affinity": {
      type: "object",
      markdownDescription: localize(15099, null),
      patternProperties: {
        "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          type: "integer",
          default: 1
        }
      },
      additionalProperties: false,
      default: {},
      defaultSnippets: [{
        "body": {
          "pub.name": 1
        }
      }]
    },
    [WORKSPACE_TRUST_EXTENSION_SUPPORT]: {
      type: "object",
      scope: 1 /* APPLICATION */,
      markdownDescription: localize(15107, null),
      patternProperties: {
        "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          type: "object",
          properties: {
            "supported": {
              type: ["boolean", "string"],
              enum: [true, false, "limited"],
              enumDescriptions: [
                localize(15111, null),
                localize(15108, null),
                localize(15109, null)
              ],
              description: localize(15110, null)
            },
            "version": {
              type: "string",
              description: localize(15112, null)
            }
          }
        }
      }
    },
    "extensions.experimental.deferredStartupFinishedActivation": {
      type: "boolean",
      description: localize(15118, null),
      default: false
    },
    "extensions.experimental.issueQuickAccess": {
      type: "boolean",
      description: localize(15120, null),
      default: true
    },
    "extensions.allowOpenInModalEditor": {
      type: "boolean",
      description: localize(15100, null),
      default: false,
      // TODO@bpasero figure out the default for stable and retire this setting
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    [VerifyExtensionSignatureConfigKey]: {
      type: "boolean",
      description: localize(15114, null),
      default: false,
      scope: 1 /* APPLICATION */,
      included: isNative
    },
    [AutoRestartConfigurationKey]: {
      type: "boolean",
      description: localize(15072, null),
      default: false,
      included: product_default.quality !== "stable"
    },
    [ExtensionGalleryServiceUrlConfigKey]: {
      type: "string",
      description: localize(15105, null),
      default: "",
      scope: 1 /* APPLICATION */,
      tags: ["usesOnlineServices"],
      included: false,
      policy: {
        name: "ExtensionGalleryServiceUrl",
        category: "Extensions" /* Extensions */,
        minimumVersion: "1.99",
        localization: {
          description: {
            key: "extensions.gallery.serviceUrl",
            value: localize(15105, null)
          }
        }
      }
    },
    "extensions.supportNodeGlobalNavigator": {
      type: "boolean",
      description: localize(15123, null),
      default: false
    },
    [ExtensionRequestsTimeoutConfigKey]: {
      type: "number",
      description: localize(15121, null),
      default: 6e4,
      scope: 1 /* APPLICATION */,
      tags: ["advanced", "usesOnlineServices"]
    }
  }
});

var jsonRegistry2 = Registry.as(Extensions3.JSONContribution);

jsonRegistry2.registerSchema(ExtensionsConfigurationSchemaId, ExtensionsConfigurationSchema);

CommandsRegistry.registerCommand("_extensions.manage", (accessor, extensionId, tab, preserveFocus, feature) => {
  const extensionService = accessor.get(IExtensionsWorkbenchService);
  const extension = extensionService.local.find((e) => areSameExtensions(e.identifier, { id: extensionId }));
  if (extension) {
    extensionService.open(extension, { tab, preserveFocus, feature });
  } else {
    throw new Error(localize(15167, null, extensionId));
  }
});

CommandsRegistry.registerCommand("extension.open", async (accessor, extensionId, tab, preserveFocus, feature, sideByside) => {
  const extensionService = accessor.get(IExtensionsWorkbenchService);
  const commandService = accessor.get(ICommandService);
  const [extension] = await extensionService.getExtensions([{ id: extensionId }], CancellationToken.None);
  if (extension) {
    return extensionService.open(extension, { tab, preserveFocus, feature, sideByside });
  }
  return commandService.executeCommand("_extensions.manage", extensionId, tab, preserveFocus, feature);
});

CommandsRegistry.registerCommand({
  id: "workbench.extensions.installExtension",
  metadata: {
    description: localize(15213, null),
    args: [
      {
        name: "extensionIdOrVSIXUri",
        description: localize(15212, null),
        constraint: (value2) => typeof value2 === "string" || value2 instanceof URI
      },
      {
        name: "options",
        description: "(optional) Options for installing the extension. Object with the following properties: `installOnlyNewlyAddedFromExtensionPackVSIX`: When enabled, VS Code installs only newly added extensions from the extension pack VSIX. This option is considered only when installing VSIX. ",
        isOptional: true,
        schema: {
          "type": "object",
          "properties": {
            "installOnlyNewlyAddedFromExtensionPackVSIX": {
              "type": "boolean",
              "description": localize(15216, null),
              default: false
            },
            "installPreReleaseVersion": {
              "type": "boolean",
              "description": localize(15217, null),
              default: false
            },
            "donotSync": {
              "type": "boolean",
              "description": localize(15214, null),
              default: false
            },
            "justification": {
              "type": ["string", "object"],
              "description": localize(15218, null)
            },
            "enable": {
              "type": "boolean",
              "description": localize(15215, null),
              default: false
            }
          }
        }
      }
    ]
  },
  handler: async (accessor, arg, options3) => {
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const extensionManagementService = accessor.get(IWorkbenchExtensionManagementService);
    const extensionGalleryService = accessor.get(IExtensionGalleryService);
    try {
      if (typeof arg === "string") {
        const [id2, version2] = getIdAndVersion(arg);
        const extension = extensionsWorkbenchService.local.find((e) => areSameExtensions(e.identifier, { id: id2, uuid: version2 }));
        if (extension?.enablementState === 1 /* DisabledByExtensionKind */) {
          const [gallery] = await extensionGalleryService.getExtensions([{ id: id2, preRelease: options3?.installPreReleaseVersion }], CancellationToken.None);
          if (!gallery) {
            throw new Error(localize(15167, null, arg));
          }
          await extensionManagementService.installFromGallery(gallery, {
            isMachineScoped: options3?.donotSync ? true : void 0,
            /* do not allow syncing extensions automatically while installing through the command */
            installPreReleaseVersion: options3?.installPreReleaseVersion,
            installGivenVersion: !!version2,
            context: { [EXTENSION_INSTALL_SOURCE_CONTEXT]: "command" /* COMMAND */ }
          });
        } else {
          await extensionsWorkbenchService.install(id2, {
            version: version2,
            installPreReleaseVersion: options3?.installPreReleaseVersion,
            context: { [EXTENSION_INSTALL_SOURCE_CONTEXT]: "command" /* COMMAND */ },
            justification: options3?.justification,
            enable: options3?.enable,
            isMachineScoped: options3?.donotSync ? true : void 0
            /* do not allow syncing extensions automatically while installing through the command */
          }, 15 /* Notification */);
        }
      } else {
        const vsix = URI.revive(arg);
        await extensionsWorkbenchService.install(vsix, { installGivenVersion: true });
      }
    } catch (e) {
      onUnexpectedError(e);
      throw e;
    }
  }
});

CommandsRegistry.registerCommand({
  id: "workbench.extensions.uninstallExtension",
  metadata: {
    description: localize(15222, null),
    args: [
      {
        name: localize(15221, null),
        schema: {
          "type": "string"
        }
      }
    ]
  },
  handler: async (accessor, id2) => {
    if (!id2) {
      throw new Error(localize(15134, null));
    }
    const extensionManagementService = accessor.get(IExtensionManagementService);
    const installed = await extensionManagementService.getInstalled();
    const [extensionToUninstall] = installed.filter((e) => areSameExtensions(e.identifier, { id: id2 }));
    if (!extensionToUninstall) {
      throw new Error(localize(15168, null, id2));
    }
    if (extensionToUninstall.isBuiltin) {
      throw new Error(localize(15073, null, id2));
    }
    try {
      await extensionManagementService.uninstall(extensionToUninstall);
    } catch (e) {
      onUnexpectedError(e);
      throw e;
    }
  }
});

CommandsRegistry.registerCommand({
  id: "workbench.extensions.search",
  metadata: {
    description: localize(15220, null),
    args: [
      {
        name: localize(15219, null),
        schema: { "type": "string" }
      }
    ]
  },
  handler: async (accessor, query = "") => {
    return accessor.get(IExtensionsWorkbenchService).openSearch(query);
  }
});

function overrideActionForActiveExtensionEditorWebview(command4, f) {
  command4?.addImplementation(105, "extensions-editor", (accessor) => {
    const editorService = accessor.get(IEditorService);
    const editor = editorService.activeEditorPane;
    if (editor instanceof ExtensionEditor) {
      if (editor.activeWebview?.isFocused) {
        f(editor.activeWebview);
        return true;
      }
    }
    return false;
  });
}

overrideActionForActiveExtensionEditorWebview(CopyAction, (webview) => webview.copy());

overrideActionForActiveExtensionEditorWebview(CutAction, (webview) => webview.cut());

overrideActionForActiveExtensionEditorWebview(PasteAction, (webview) => webview.paste());

var CONTEXT_HAS_LOCAL_SERVER = new RawContextKey("hasLocalServer", false);

var CONTEXT_HAS_REMOTE_SERVER = new RawContextKey("hasRemoteServer", false);

var CONTEXT_HAS_WEB_SERVER = new RawContextKey("hasWebServer", false);

var CONTEXT_GALLERY_SORT_CAPABILITIES = new RawContextKey("gallerySortCapabilities", "");

var CONTEXT_GALLERY_FILTER_CAPABILITIES = new RawContextKey("galleryFilterCapabilities", "");

var CONTEXT_GALLERY_ALL_PUBLIC_REPOSITORY_SIGNED = new RawContextKey("galleryAllPublicRepositorySigned", false);

var CONTEXT_GALLERY_ALL_PRIVATE_REPOSITORY_SIGNED = new RawContextKey("galleryAllPrivateRepositorySigned", false);

var CONTEXT_GALLERY_HAS_EXTENSION_LINK = new RawContextKey("galleryHasExtensionLink", false);

async function runAction(action) {
  try {
    return await action.run();
  } finally {
    if (isDisposable(action)) {
      action.dispose();
    }
  }
}

var ExtensionsContributions = class extends Disposable {
  constructor(extensionManagementService, extensionManagementServerService, extensionGalleryManifestService, contextKeyService, viewsService, extensionsWorkbenchService, extensionEnablementService, instantiationService, dialogService, commandService, productService, pluginInstallService) {
    super();
    this.extensionManagementService = extensionManagementService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.extensionGalleryManifestService = extensionGalleryManifestService;
    this.contextKeyService = contextKeyService;
    this.viewsService = viewsService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.productService = productService;
    this.pluginInstallService = pluginInstallService;
    const hasLocalServerContext = CONTEXT_HAS_LOCAL_SERVER.bindTo(contextKeyService);
    if (this.extensionManagementServerService.localExtensionManagementServer) {
      hasLocalServerContext.set(true);
    }
    const hasRemoteServerContext = CONTEXT_HAS_REMOTE_SERVER.bindTo(contextKeyService);
    if (this.extensionManagementServerService.remoteExtensionManagementServer) {
      hasRemoteServerContext.set(true);
    }
    const hasWebServerContext = CONTEXT_HAS_WEB_SERVER.bindTo(contextKeyService);
    if (this.extensionManagementServerService.webExtensionManagementServer) {
      hasWebServerContext.set(true);
    }
    this.updateExtensionGalleryStatusContexts();
    this._register(extensionGalleryManifestService.onDidChangeExtensionGalleryManifestStatus(() => this.updateExtensionGalleryStatusContexts()));
    extensionGalleryManifestService.getExtensionGalleryManifest().then((extensionGalleryManifest) => {
      this.updateGalleryCapabilitiesContexts(extensionGalleryManifest);
      this._register(extensionGalleryManifestService.onDidChangeExtensionGalleryManifest((extensionGalleryManifest2) => this.updateGalleryCapabilitiesContexts(extensionGalleryManifest2)));
    });
    this.registerGlobalActions();
    this.registerContextMenuActions();
    this.registerQuickAccessProvider();
  }
  async updateExtensionGalleryStatusContexts() {
    CONTEXT_HAS_GALLERY.bindTo(this.contextKeyService).set(this.extensionGalleryManifestService.extensionGalleryManifestStatus === "available" /* Available */);
    CONTEXT_EXTENSIONS_GALLERY_STATUS.bindTo(this.contextKeyService).set(this.extensionGalleryManifestService.extensionGalleryManifestStatus);
  }
  async updateGalleryCapabilitiesContexts(extensionGalleryManifest) {
    CONTEXT_GALLERY_SORT_CAPABILITIES.bindTo(this.contextKeyService).set(`_${extensionGalleryManifest?.capabilities.extensionQuery.sorting?.map((s) => s.name)?.join("_")}_UpdateDate_`);
    CONTEXT_GALLERY_FILTER_CAPABILITIES.bindTo(this.contextKeyService).set(`_${extensionGalleryManifest?.capabilities.extensionQuery.filtering?.map((s) => s.name)?.join("_")}_`);
    CONTEXT_GALLERY_ALL_PUBLIC_REPOSITORY_SIGNED.bindTo(this.contextKeyService).set(!!extensionGalleryManifest?.capabilities?.signing?.allPublicRepositorySigned);
    CONTEXT_GALLERY_ALL_PRIVATE_REPOSITORY_SIGNED.bindTo(this.contextKeyService).set(!!extensionGalleryManifest?.capabilities?.signing?.allPrivateRepositorySigned);
    CONTEXT_GALLERY_HAS_EXTENSION_LINK.bindTo(this.contextKeyService).set(!!(extensionGalleryManifest && getExtensionGalleryManifestResourceUri(extensionGalleryManifest, "ExtensionDetailsViewUriTemplate" /* ExtensionDetailsViewUri */)));
  }
  registerQuickAccessProvider() {
    if (this.extensionManagementServerService.localExtensionManagementServer || this.extensionManagementServerService.remoteExtensionManagementServer || this.extensionManagementServerService.webExtensionManagementServer) {
      Registry.as(Extensions18.Quickaccess).registerQuickAccessProvider({
        ctor: InstallExtensionQuickAccessProvider,
        prefix: InstallExtensionQuickAccessProvider.PREFIX,
        placeholder: localize(15144, null),
        helpEntries: [{ description: localize(15143, null) }]
      });
    }
  }
  // Global actions
  registerGlobalActions() {
    this._register(MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
      command: {
        id: VIEWLET_ID2,
        title: localize(15163, null)
      },
      group: "2_configuration",
      order: 3,
      when: IsSessionsWindowContext.negate()
    }));
    this._register(MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
      command: {
        id: VIEWLET_ID2,
        title: localize(15178, null)
      },
      group: "2_configuration",
      order: 3
    }));
    this.registerExtensionAction({
      id: "workbench.extensions.action.focusExtensionsView",
      title: localize2(15132, "Focus on Extensions View"),
      category: ExtensionsLocalizedLabel,
      f1: true,
      run: async (accessor) => {
        await accessor.get(IExtensionsWorkbenchService).openSearch("");
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installExtensions",
      title: localize2(15145, "Install Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(CONTEXT_HAS_GALLERY, ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER))
      },
      run: async (accessor) => {
        accessor.get(IViewsService).openViewContainer(VIEWLET_ID2, true);
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showRecommendedKeymapExtensions",
      title: localize2(15183, "Keymaps"),
      category: PreferencesLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: CONTEXT_HAS_GALLERY
      }, {
        id: MenuId.EditorTitle,
        when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_HAS_GALLERY),
        group: "2_keyboard_discover_actions"
      }],
      menuTitles: {
        [MenuId.EditorTitle.id]: localize(15135, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@recommended:keymaps ")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showLanguageExtensions",
      title: localize2(15180, "Language Extensions"),
      category: PreferencesLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: CONTEXT_HAS_GALLERY
      },
      run: () => this.extensionsWorkbenchService.openSearch("@recommended:languages ")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.checkForUpdates",
      title: localize2(15075, "Check for Extension Updates"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(CONTEXT_HAS_GALLERY, ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER))
      }, {
        id: MenuId.ViewContainerTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("viewContainer", VIEWLET_ID2), CONTEXT_HAS_GALLERY),
        group: "1_updates",
        order: 1
      }],
      run: async () => {
        const [, pluginResult] = await Promise.all([
          this.extensionsWorkbenchService.checkForUpdates(),
          this.pluginInstallService.updateAllPlugins({ silent: true }, CancellationToken.None)
        ]);
        const outdated = this.extensionsWorkbenchService.outdated;
        if (outdated.length) {
          return this.extensionsWorkbenchService.openSearch("@outdated ");
        } else if (pluginResult.updatedNames.length === 0 && pluginResult.failedNames.length === 0) {
          return this.dialogService.info(localize(15169, null));
        }
      }
    });
    const enableAutoUpdateWhenCondition = ContextKeyExpr.equals(`config.${AutoUpdateConfigurationKey}`, "off");
    this.registerExtensionAction({
      id: "workbench.extensions.action.enableAutoUpdate",
      title: localize2(15087, "Enable Auto Update for Extensions"),
      category: ExtensionsLocalizedLabel,
      precondition: enableAutoUpdateWhenCondition,
      menu: [{
        id: MenuId.ViewContainerTitle,
        order: 5,
        group: "1_updates",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("viewContainer", VIEWLET_ID2), enableAutoUpdateWhenCondition)
      }, {
        id: MenuId.CommandPalette
      }],
      run: (accessor) => accessor.get(IExtensionsWorkbenchService).updateAutoUpdateForAllExtensions(true)
    });
    const disableAutoUpdateWhenCondition = ContextKeyExpr.notEquals(`config.${AutoUpdateConfigurationKey}`, "off");
    this.registerExtensionAction({
      id: "workbench.extensions.action.disableAutoUpdate",
      title: localize2(15079, "Disable Auto Update for Extensions"),
      precondition: disableAutoUpdateWhenCondition,
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.ViewContainerTitle,
        order: 5,
        group: "1_updates",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("viewContainer", VIEWLET_ID2), disableAutoUpdateWhenCondition)
      }, {
        id: MenuId.CommandPalette
      }],
      run: (accessor) => accessor.get(IExtensionsWorkbenchService).updateAutoUpdateForAllExtensions(false)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.updateAllExtensions",
      title: localize2(15194, "Update All Extensions"),
      category: ExtensionsLocalizedLabel,
      precondition: HasOutdatedExtensionsContext,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.and(CONTEXT_HAS_GALLERY, ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER))
        },
        {
          id: MenuId.ViewContainerTitle,
          when: ContextKeyExpr.equals("viewContainer", VIEWLET_ID2),
          group: "1_updates",
          order: 2
        },
        {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", OUTDATED_EXTENSIONS_VIEW_ID),
          group: "navigation",
          order: 1
        }
      ],
      icon: installWorkspaceRecommendedIcon,
      run: async () => {
        await this.extensionsWorkbenchService.updateAll();
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.enableAll",
      title: localize2(15085, "Enable All Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER)
      }, {
        id: MenuId.ViewContainerTitle,
        when: ContextKeyExpr.equals("viewContainer", VIEWLET_ID2),
        group: "2_enablement",
        order: 1
      }],
      run: async () => {
        const extensionsToEnable = this.extensionsWorkbenchService.local.filter((e) => !!e.local && this.extensionEnablementService.canChangeEnablement(e.local) && !this.extensionEnablementService.isEnabled(e.local));
        if (extensionsToEnable.length) {
          await this.extensionsWorkbenchService.setEnablement(extensionsToEnable, 12 /* EnabledGlobally */);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.enableAllWorkspace",
      title: localize2(15086, "Enable All Extensions for this Workspace"),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(WorkbenchStateContext.notEqualsTo("empty"), ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER))
      },
      run: async () => {
        const extensionsToEnable = this.extensionsWorkbenchService.local.filter((e) => !!e.local && this.extensionEnablementService.canChangeEnablement(e.local) && !this.extensionEnablementService.isEnabled(e.local));
        if (extensionsToEnable.length) {
          await this.extensionsWorkbenchService.setEnablement(extensionsToEnable, 13 /* EnabledWorkspace */);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.disableAll",
      title: localize2(15077, "Disable All Installed Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER)
      }, {
        id: MenuId.ViewContainerTitle,
        when: ContextKeyExpr.equals("viewContainer", VIEWLET_ID2),
        group: "2_enablement",
        order: 2
      }],
      run: async () => {
        const extensionsToDisable = this.extensionsWorkbenchService.local.filter((e) => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(e.local) && this.extensionEnablementService.canChangeEnablement(e.local));
        if (extensionsToDisable.length) {
          await this.extensionsWorkbenchService.setEnablement(extensionsToDisable, 10 /* DisabledGlobally */);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.disableAllWorkspace",
      title: localize2(15078, "Disable All Installed Extensions for this Workspace"),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(WorkbenchStateContext.notEqualsTo("empty"), ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER))
      },
      run: async () => {
        const extensionsToDisable = this.extensionsWorkbenchService.local.filter((e) => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(e.local) && this.extensionEnablementService.canChangeEnablement(e.local));
        if (extensionsToDisable.length) {
          await this.extensionsWorkbenchService.setEnablement(extensionsToDisable, 11 /* DisabledWorkspace */);
        }
      }
    });
    this.registerExtensionAction({
      id: SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID,
      title: localize2(15149, "Install from VSIX..."),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER)
      }, {
        id: MenuId.ViewContainerTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("viewContainer", VIEWLET_ID2), ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER)),
        group: "3_install",
        order: 1
      }],
      run: async (accessor) => {
        const fileDialogService = accessor.get(IFileDialogService);
        const commandService = accessor.get(ICommandService);
        const vsixPaths = await fileDialogService.showOpenDialog({
          title: localize(15148, null),
          filters: [{ name: "VSIX Extensions", extensions: ["vsix"] }],
          canSelectFiles: true,
          canSelectMany: true,
          openLabel: mnemonicButtonLabel(localize(15139, null))
        });
        if (vsixPaths) {
          await commandService.executeCommand(INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID, vsixPaths);
        }
      }
    });
    this.registerExtensionAction({
      id: INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
      title: localize(15151, null),
      menu: [{
        id: MenuId.ExplorerContext,
        group: "extensions",
        when: ContextKeyExpr.and(ResourceContextKey.Extension.isEqualTo(".vsix"), ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER))
      }],
      run: async (accessor, resources) => {
        const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const hostService = accessor.get(IHostService);
        const notificationService = accessor.get(INotificationService);
        const vsixs = Array.isArray(resources) ? resources : [resources];
        const result = await Promise.allSettled(vsixs.map(async (vsix) => await extensionsWorkbenchService.install(vsix, { installGivenVersion: true })));
        let error, requireReload = false, requireRestart = false;
        for (const r2 of result) {
          if (r2.status === "rejected") {
            error = new Error(r2.reason);
            break;
          }
          requireReload = requireReload || r2.value.runtimeState?.action === "reloadWindow" /* ReloadWindow */;
          requireRestart = requireRestart || r2.value.runtimeState?.action === "restartExtensions" /* RestartExtensions */;
        }
        if (error) {
          throw error;
        }
        if (requireReload) {
          notificationService.prompt(
            Severity2.Info,
            vsixs.length > 1 ? localize(15158, null) : localize(15155, null),
            [{
              label: localize(15152, null),
              run: () => hostService.reload()
            }]
          );
        } else if (requireRestart) {
          notificationService.prompt(
            Severity2.Info,
            vsixs.length > 1 ? localize(15159, null) : localize(15156, null),
            [{
              label: localize(15153, null),
              run: () => extensionsWorkbenchService.updateRunningExtensions()
            }]
          );
        } else {
          notificationService.prompt(
            Severity2.Info,
            vsixs.length > 1 ? localize(15157, null) : localize(15154, null),
            []
          );
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installExtensionFromLocation",
      title: localize2(15142, "Install Extension from Location..."),
      category: Categories.Developer,
      menu: [{
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(CONTEXT_HAS_WEB_SERVER, CONTEXT_HAS_LOCAL_SERVER)
      }],
      run: async (accessor) => {
        const extensionManagementService = accessor.get(IWorkbenchExtensionManagementService);
        if (isWeb) {
          return new Promise((c, e) => {
            const quickInputService = accessor.get(IQuickInputService);
            const disposables = new DisposableStore();
            const quickPick = disposables.add(quickInputService.createQuickPick());
            quickPick.title = localize(15146, null);
            quickPick.customButton = true;
            quickPick.customLabel = localize(15137, null);
            quickPick.placeholder = localize(15147, null);
            quickPick.ignoreFocusOut = true;
            disposables.add(Event2.any(quickPick.onDidAccept, quickPick.onDidCustom)(async () => {
              quickPick.hide();
              if (quickPick.value) {
                try {
                  await extensionManagementService.installFromLocation(URI.parse(quickPick.value));
                } catch (error) {
                  e(error);
                  return;
                }
              }
              c();
            }));
            disposables.add(quickPick.onDidHide(() => disposables.dispose()));
            quickPick.show();
          });
        } else {
          const fileDialogService = accessor.get(IFileDialogService);
          const extensionLocation = await fileDialogService.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            title: localize(15146, null)
          });
          if (extensionLocation?.[0]) {
            await extensionManagementService.installFromLocation(extensionLocation[0]);
          }
        }
      }
    });
    MenuRegistry.appendMenuItem(extensionsSearchActionsMenu, {
      submenu: extensionsFilterSubMenu,
      title: localize(15131, null),
      group: "navigation",
      order: 2,
      icon: filterIcon
    });
    const showFeaturedExtensionsId = "extensions.filter.featured";
    const featuresExtensionsWhenContext = ContextKeyExpr.and(CONTEXT_HAS_GALLERY, ContextKeyExpr.regex(CONTEXT_GALLERY_FILTER_CAPABILITIES.key, new RegExp(`_${"Featured" /* Featured */}_`)));
    this.registerExtensionAction({
      id: showFeaturedExtensionsId,
      title: localize2(15179, "Show Featured Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: featuresExtensionsWhenContext
      }, {
        id: extensionsFilterSubMenu,
        when: featuresExtensionsWhenContext,
        group: "1_predefined",
        order: 1
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15129, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@featured ")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showPopularExtensions",
      title: localize2(15181, "Show Popular Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: CONTEXT_HAS_GALLERY
      }, {
        id: extensionsFilterSubMenu,
        when: CONTEXT_HAS_GALLERY,
        group: "1_predefined",
        order: 2
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15165, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@popular ")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showRecommendedExtensions",
      title: localize2(15182, "Show Recommended Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: CONTEXT_HAS_GALLERY
      }, {
        id: extensionsFilterSubMenu,
        when: CONTEXT_HAS_GALLERY,
        group: "1_predefined",
        order: 2
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15166, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@recommended ")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.recentlyPublishedExtensions",
      title: localize2(15171, "Show Recently Published Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: CONTEXT_HAS_GALLERY
      }, {
        id: extensionsFilterSubMenu,
        when: CONTEXT_HAS_GALLERY,
        group: "1_predefined",
        order: 2
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15170, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@recentlyPublished ")
    });
    const extensionsCategoryFilterSubMenu = new MenuId("extensionsCategoryFilterSubMenu");
    MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
      submenu: extensionsCategoryFilterSubMenu,
      title: localize(15130, null),
      when: ContextKeyExpr.and(CONTEXT_HAS_GALLERY, ContextKeyExpr.regex(CONTEXT_GALLERY_FILTER_CAPABILITIES.key, new RegExp(`_${"Category" /* Category */}_`))),
      group: "2_categories",
      order: 1
    });
    EXTENSION_CATEGORIES.forEach((category11, index2) => {
      this.registerExtensionAction({
        id: `extensions.actions.searchByCategory.${category11}`,
        title: category11,
        menu: [{
          id: extensionsCategoryFilterSubMenu,
          when: CONTEXT_HAS_GALLERY,
          order: index2
        }],
        run: () => this.extensionsWorkbenchService.openSearch(`@category:"${category11.toLowerCase()}"`)
      });
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installedExtensions",
      title: localize2(15141, "Show Installed Extensions"),
      category: ExtensionsLocalizedLabel,
      f1: true,
      menu: [{
        id: extensionsFilterSubMenu,
        group: "3_installed",
        order: 1
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15140, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@installed ")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.listBuiltInExtensions",
      title: localize2(15175, "Show Built-in Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER)
      }, {
        id: extensionsFilterSubMenu,
        group: "3_installed",
        order: 3
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15074, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@builtin ")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.extensionUpdates",
      title: localize2(15128, "Show Extension Updates"),
      category: ExtensionsLocalizedLabel,
      precondition: CONTEXT_HAS_GALLERY,
      f1: true,
      menu: [{
        id: extensionsFilterSubMenu,
        group: "3_installed",
        when: CONTEXT_HAS_GALLERY,
        order: 2
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15091, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@updates")
    });
    this.registerExtensionAction({
      id: LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID,
      title: localize2(15184, "Show Extensions Unsupported By Workspace"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER)
      }, {
        id: extensionsFilterSubMenu,
        group: "3_installed",
        order: 6,
        when: ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER)
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15223, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@workspaceUnsupported")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showEnabledExtensions",
      title: localize2(15177, "Show Enabled Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER)
      }, {
        id: extensionsFilterSubMenu,
        group: "3_installed",
        order: 4
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15088, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@enabled ")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showDisabledExtensions",
      title: localize2(15176, "Show Disabled Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER)
      }, {
        id: extensionsFilterSubMenu,
        group: "3_installed",
        order: 5
      }],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(15080, null)
      },
      run: () => this.extensionsWorkbenchService.openSearch("@disabled ")
    });
    const extensionsSortSubMenu = new MenuId("extensionsSortSubMenu");
    MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
      submenu: extensionsSortSubMenu,
      title: localize(15191, null),
      when: ContextKeyExpr.and(ContextKeyExpr.or(CONTEXT_HAS_GALLERY, DefaultViewsContext)),
      group: "4_sort",
      order: 1
    });
    [
      { id: "installs", title: localize(15186, null), precondition: BuiltInExtensionsContext.negate(), sortCapability: "InstallCount" /* InstallCount */ },
      { id: "rating", title: localize(15189, null), precondition: BuiltInExtensionsContext.negate(), sortCapability: "WeightedRating" /* WeightedRating */ },
      { id: "name", title: localize(15187, null), precondition: BuiltInExtensionsContext.negate(), sortCapability: "Title" /* Title */ },
      { id: "publishedDate", title: localize(15188, null), precondition: BuiltInExtensionsContext.negate(), sortCapability: "PublishedDate" /* PublishedDate */ },
      { id: "updateDate", title: localize(15190, null), precondition: ContextKeyExpr.and(SearchMarketplaceExtensionsContext.negate(), RecommendedExtensionsContext.negate(), BuiltInExtensionsContext.negate()), sortCapability: "UpdateDate" }
    ].map(({ id: id2, title, precondition: precondition2, sortCapability }, index2) => {
      const sortCapabilityContext = ContextKeyExpr.regex(CONTEXT_GALLERY_SORT_CAPABILITIES.key, new RegExp(`_${sortCapability}_`));
      this.registerExtensionAction({
        id: `extensions.sort.${id2}`,
        title,
        precondition: ContextKeyExpr.and(precondition2, ContextKeyExpr.regex(ExtensionsSearchValueContext.key, /^@contribute:/).negate(), sortCapabilityContext),
        menu: [{
          id: extensionsSortSubMenu,
          when: ContextKeyExpr.and(ContextKeyExpr.or(CONTEXT_HAS_GALLERY, DefaultViewsContext), sortCapabilityContext),
          order: index2
        }],
        toggled: ExtensionsSortByContext.isEqualTo(id2),
        run: async () => {
          const extensionsViewPaneContainer = (await this.viewsService.openViewContainer(VIEWLET_ID2, true))?.getViewPaneContainer();
          const currentQuery = Query3.parse(extensionsViewPaneContainer?.searchValue ?? "");
          extensionsViewPaneContainer?.search(new Query3(currentQuery.value, id2).toString());
          extensionsViewPaneContainer?.focus();
        }
      });
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.clearExtensionsSearchResults",
      title: localize2(15076, "Clear Extensions Search Results"),
      category: ExtensionsLocalizedLabel,
      icon: clearSearchResultsIcon,
      f1: true,
      precondition: SearchHasTextContext,
      menu: {
        id: extensionsSearchActionsMenu,
        group: "navigation",
        order: 1
      },
      run: async (accessor) => {
        const viewPaneContainer = accessor.get(IViewsService).getActiveViewPaneContainerWithId(VIEWLET_ID2);
        if (viewPaneContainer) {
          const extensionsViewPaneContainer = viewPaneContainer;
          extensionsViewPaneContainer.search("");
          extensionsViewPaneContainer.focus();
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.refreshExtension",
      title: localize2(15172, "Refresh"),
      category: ExtensionsLocalizedLabel,
      icon: refreshIcon,
      f1: true,
      menu: {
        id: MenuId.ViewContainerTitle,
        when: ContextKeyExpr.equals("viewContainer", VIEWLET_ID2),
        group: "navigation",
        order: 2
      },
      run: async (accessor) => {
        const viewPaneContainer = accessor.get(IViewsService).getActiveViewPaneContainerWithId(VIEWLET_ID2);
        if (viewPaneContainer) {
          await viewPaneContainer.refresh();
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installWorkspaceRecommendedExtensions",
      title: localize(15160, null),
      icon: installWorkspaceRecommendedIcon,
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.equals("view", WORKSPACE_RECOMMENDATIONS_VIEW_ID),
        group: "navigation",
        order: 1
      },
      run: async (accessor) => {
        const view = accessor.get(IViewsService).getActiveViewWithId(WORKSPACE_RECOMMENDATIONS_VIEW_ID);
        return view.installWorkspaceRecommendations();
      }
    });
    this.registerExtensionAction({
      id: ConfigureWorkspaceFolderRecommendedExtensionsAction.ID,
      title: ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL,
      icon: configureRecommendedIcon,
      menu: [{
        id: MenuId.CommandPalette,
        when: WorkbenchStateContext.notEqualsTo("empty")
      }, {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.equals("view", WORKSPACE_RECOMMENDATIONS_VIEW_ID),
        group: "navigation",
        order: 2
      }],
      run: () => runAction(this.instantiationService.createInstance(ConfigureWorkspaceFolderRecommendedExtensionsAction, ConfigureWorkspaceFolderRecommendedExtensionsAction.ID, ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL))
    });
    this.registerExtensionAction({
      id: InstallSpecificVersionOfExtensionAction.ID,
      title: { value: InstallSpecificVersionOfExtensionAction.LABEL, original: "Install Specific Version of Extension..." },
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(CONTEXT_HAS_GALLERY, ContextKeyExpr.or(CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER))
      },
      run: () => runAction(this.instantiationService.createInstance(InstallSpecificVersionOfExtensionAction, InstallSpecificVersionOfExtensionAction.ID, InstallSpecificVersionOfExtensionAction.LABEL))
    });
  }
  // Extension Context Menu
  registerContextMenuActions() {
    this.registerExtensionAction({
      id: SetColorThemeAction.ID,
      title: SetColorThemeAction.TITLE,
      menu: {
        id: MenuId.ExtensionContext,
        group: THEME_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(ContextKeyExpr.not("inExtensionEditor"), ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.has("extensionHasColorThemes"))
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const instantiationService = accessor.get(IInstantiationService);
        const extension = extensionWorkbenchService.local.find((e) => areSameExtensions(e.identifier, { id: extensionId }));
        if (extension) {
          const action = instantiationService.createInstance(SetColorThemeAction);
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: SetFileIconThemeAction.ID,
      title: SetFileIconThemeAction.TITLE,
      menu: {
        id: MenuId.ExtensionContext,
        group: THEME_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(ContextKeyExpr.not("inExtensionEditor"), ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.has("extensionHasFileIconThemes"))
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const instantiationService = accessor.get(IInstantiationService);
        const extension = extensionWorkbenchService.local.find((e) => areSameExtensions(e.identifier, { id: extensionId }));
        if (extension) {
          const action = instantiationService.createInstance(SetFileIconThemeAction);
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: SetProductIconThemeAction.ID,
      title: SetProductIconThemeAction.TITLE,
      menu: {
        id: MenuId.ExtensionContext,
        group: THEME_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(ContextKeyExpr.not("inExtensionEditor"), ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.has("extensionHasProductIconThemes"))
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const instantiationService = accessor.get(IInstantiationService);
        const extension = extensionWorkbenchService.local.find((e) => areSameExtensions(e.identifier, { id: extensionId }));
        if (extension) {
          const action = instantiationService.createInstance(SetProductIconThemeAction);
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showPreReleaseVersion",
      title: localize2(15173, "Show Pre-Release Version"),
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(ContextKeyExpr.has("inExtensionEditor"), ContextKeyExpr.has("galleryExtensionHasPreReleaseVersion"), ContextKeyExpr.has("isPreReleaseExtensionAllowed"), ContextKeyExpr.not("showPreReleaseVersion"), ContextKeyExpr.not("isBuiltinExtension"))
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const extension = (await extensionWorkbenchService.getExtensions([{ id: extensionId }], CancellationToken.None))[0];
        extensionWorkbenchService.open(extension, { showPreReleaseVersion: true });
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showReleasedVersion",
      title: localize2(15174, "Show Release Version"),
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 1,
        when: ContextKeyExpr.and(ContextKeyExpr.has("inExtensionEditor"), ContextKeyExpr.has("galleryExtensionHasPreReleaseVersion"), ContextKeyExpr.has("extensionHasReleaseVersion"), ContextKeyExpr.has("showPreReleaseVersion"), ContextKeyExpr.not("isBuiltinExtension"))
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const extension = (await extensionWorkbenchService.getExtensions([{ id: extensionId }], CancellationToken.None))[0];
        extensionWorkbenchService.open(extension, { showPreReleaseVersion: false });
      }
    });
    this.registerExtensionAction({
      id: ToggleAutoUpdateForExtensionAction.ID,
      title: ToggleAutoUpdateForExtensionAction.LABEL,
      category: ExtensionsLocalizedLabel,
      precondition: ContextKeyExpr.and(ContextKeyExpr.or(ContextKeyExpr.notEquals(`config.${AutoUpdateConfigurationKey}`, "on"), ContextKeyExpr.equals("isExtensionEnabled", true)), ContextKeyExpr.not("extensionDisallowInstall"), ContextKeyExpr.has("isExtensionAllowed")),
      menu: {
        id: MenuId.ExtensionContext,
        group: UPDATE_ACTIONS_GROUP,
        order: 1,
        when: ContextKeyExpr.and(
          ContextKeyExpr.not("inExtensionEditor"),
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.not("isBuiltinExtension")
        )
      },
      run: async (accessor, id2) => {
        const instantiationService = accessor.get(IInstantiationService);
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const extension = extensionWorkbenchService.local.find((e) => areSameExtensions(e.identifier, { id: id2 }));
        if (extension) {
          const action = instantiationService.createInstance(ToggleAutoUpdateForExtensionAction);
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: ToggleAutoUpdatesForPublisherAction.ID,
      title: { value: ToggleAutoUpdatesForPublisherAction.LABEL, original: "Auto Update (Publisher)" },
      category: ExtensionsLocalizedLabel,
      precondition: ContextKeyExpr.equals(`config.${AutoUpdateConfigurationKey}`, "off"),
      menu: {
        id: MenuId.ExtensionContext,
        group: UPDATE_ACTIONS_GROUP,
        order: 2,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.not("isBuiltinExtension"))
      },
      run: async (accessor, id2) => {
        const instantiationService = accessor.get(IInstantiationService);
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const extension = extensionWorkbenchService.local.find((e) => areSameExtensions(e.identifier, { id: id2 }));
        if (extension) {
          const action = instantiationService.createInstance(ToggleAutoUpdatesForPublisherAction);
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.switchToPreRlease",
      title: localize(15089, null),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 2,
        when: ContextKeyExpr.and(CONTEXT_HAS_GALLERY, ContextKeyExpr.has("galleryExtensionHasPreReleaseVersion"), ContextKeyExpr.has("isPreReleaseExtensionAllowed"), ContextKeyExpr.not("installedExtensionIsOptedToPreRelease"), ContextKeyExpr.not("inExtensionEditor"), ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.not("isBuiltinExtension"))
      },
      run: async (accessor, id2) => {
        const instantiationService = accessor.get(IInstantiationService);
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const extension = extensionWorkbenchService.local.find((e) => areSameExtensions(e.identifier, { id: id2 }));
        if (extension) {
          const action = instantiationService.createInstance(TogglePreReleaseExtensionAction);
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.switchToRelease",
      title: localize(15081, null),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 2,
        when: ContextKeyExpr.and(CONTEXT_HAS_GALLERY, ContextKeyExpr.has("galleryExtensionHasPreReleaseVersion"), ContextKeyExpr.has("isExtensionAllowed"), ContextKeyExpr.has("installedExtensionIsOptedToPreRelease"), ContextKeyExpr.not("inExtensionEditor"), ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.not("isBuiltinExtension"))
      },
      run: async (accessor, id2) => {
        const instantiationService = accessor.get(IInstantiationService);
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const extension = extensionWorkbenchService.local.find((e) => areSameExtensions(e.identifier, { id: id2 }));
        if (extension) {
          const action = instantiationService.createInstance(TogglePreReleaseExtensionAction);
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: ClearLanguageAction.ID,
      title: ClearLanguageAction.TITLE,
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(ContextKeyExpr.not("inExtensionEditor"), ContextKeyExpr.has("canSetLanguage"), ContextKeyExpr.has("isActiveLanguagePackExtension"))
      },
      run: async (accessor, extensionId) => {
        const instantiationService = accessor.get(IInstantiationService);
        const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const extension = (await extensionsWorkbenchService.getExtensions([{ id: extensionId }], CancellationToken.None))[0];
        const action = instantiationService.createInstance(ClearLanguageAction);
        action.extension = extension;
        return runAction(action);
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installUnsigned",
      title: localize(15136, null),
      menu: {
        id: MenuId.ExtensionContext,
        group: "0_install",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("extensionStatus", "uninstalled"),
          ContextKeyExpr.has("isGalleryExtension"),
          ContextKeyExpr.not("extensionDisallowInstall"),
          ContextKeyExpr.has("extensionIsUnsigned"),
          ContextKeyExpr.or(ContextKeyExpr.and(CONTEXT_GALLERY_ALL_PUBLIC_REPOSITORY_SIGNED, ContextKeyExpr.not("extensionIsPrivate")), ContextKeyExpr.and(CONTEXT_GALLERY_ALL_PRIVATE_REPOSITORY_SIGNED, ContextKeyExpr.has("extensionIsPrivate")))
        ),
        order: 1
      },
      run: async (accessor, extensionId) => {
        const instantiationService = accessor.get(IInstantiationService);
        const extension = this.extensionsWorkbenchService.local.filter((e) => areSameExtensions(e.identifier, { id: extensionId }))[0] || (await this.extensionsWorkbenchService.getExtensions([{ id: extensionId }], CancellationToken.None))[0];
        if (extension) {
          const action = instantiationService.createInstance(InstallAction, { installPreReleaseVersion: this.extensionManagementService.preferPreReleases });
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installAndDonotSync",
      title: localize(15138, null),
      menu: {
        id: MenuId.ExtensionContext,
        group: "0_install",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("extensionStatus", "uninstalled"), ContextKeyExpr.has("isGalleryExtension"), ContextKeyExpr.has("isExtensionAllowed"), ContextKeyExpr.not("extensionDisallowInstall"), CONTEXT_SYNC_ENABLEMENT),
        order: 1
      },
      run: async (accessor, extensionId) => {
        const instantiationService = accessor.get(IInstantiationService);
        const extension = this.extensionsWorkbenchService.local.filter((e) => areSameExtensions(e.identifier, { id: extensionId }))[0] || (await this.extensionsWorkbenchService.getExtensions([{ id: extensionId }], CancellationToken.None))[0];
        if (extension) {
          const action = instantiationService.createInstance(InstallAction, {
            installPreReleaseVersion: this.extensionManagementService.preferPreReleases,
            isMachineScoped: true
          });
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installPrereleaseAndDonotSync",
      title: localize(15150, null),
      menu: {
        id: MenuId.ExtensionContext,
        group: "0_install",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("extensionStatus", "uninstalled"), ContextKeyExpr.has("isGalleryExtension"), ContextKeyExpr.has("extensionHasPreReleaseVersion"), ContextKeyExpr.has("isPreReleaseExtensionAllowed"), ContextKeyExpr.not("extensionDisallowInstall"), CONTEXT_SYNC_ENABLEMENT),
        order: 2
      },
      run: async (accessor, extensionId) => {
        const instantiationService = accessor.get(IInstantiationService);
        const extension = this.extensionsWorkbenchService.local.filter((e) => areSameExtensions(e.identifier, { id: extensionId }))[0] || (await this.extensionsWorkbenchService.getExtensions([{ id: extensionId }], CancellationToken.None))[0];
        if (extension) {
          const action = instantiationService.createInstance(InstallAction, {
            isMachineScoped: true,
            preRelease: true
          });
          action.extension = extension;
          return runAction(action);
        }
      }
    });
    this.registerExtensionAction({
      id: InstallAnotherVersionAction.ID,
      title: InstallAnotherVersionAction.LABEL,
      menu: {
        id: MenuId.ExtensionContext,
        group: "0_install",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("extensionStatus", "uninstalled"), ContextKeyExpr.has("isGalleryExtension"), ContextKeyExpr.has("isExtensionAllowed"), ContextKeyExpr.not("extensionDisallowInstall")),
        order: 3
      },
      run: async (accessor, extensionId) => {
        const instantiationService = accessor.get(IInstantiationService);
        const extension = this.extensionsWorkbenchService.local.filter((e) => areSameExtensions(e.identifier, { id: extensionId }))[0] || (await this.extensionsWorkbenchService.getExtensions([{ id: extensionId }], CancellationToken.None))[0];
        if (extension) {
          return runAction(instantiationService.createInstance(InstallAnotherVersionAction, extension, false));
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.copyExtension",
      title: localize2(15203, "Copy"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "1_copy"
      },
      run: async (accessor, extensionId) => {
        const clipboardService = accessor.get(IClipboardService);
        const extension = this.extensionsWorkbenchService.local.filter((e) => areSameExtensions(e.identifier, { id: extensionId }))[0] || (await this.extensionsWorkbenchService.getExtensions([{ id: extensionId }], CancellationToken.None))[0];
        if (extension) {
          const name = localize(15094, null, extension.displayName);
          const id2 = localize(15093, null, extensionId);
          const description = localize(15092, null, extension.description);
          const verision = localize(15096, null, extension.version);
          const publisher = localize(15095, null, extension.publisherDisplayName);
          const link2 = extension.url ? localize(15097, null, `${extension.url}`) : null;
          const clipboardStr = `${name}
${id2}
${description}
${verision}
${publisher}${link2 ? "\n" + link2 : ""}`;
          await clipboardService.writeText(clipboardStr);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.copyExtensionId",
      title: localize2(15204, "Copy Extension ID"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "1_copy"
      },
      run: async (accessor, id2) => accessor.get(IClipboardService).writeText(id2)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.copyLink",
      title: localize2(15205, "Copy Link"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "1_copy",
        when: ContextKeyExpr.and(ContextKeyExpr.has("isGalleryExtension"), CONTEXT_GALLERY_HAS_EXTENSION_LINK)
      },
      run: async (accessor, _, extension) => {
        const clipboardService = accessor.get(IClipboardService);
        if (extension.galleryLink) {
          await clipboardService.writeText(extension.galleryLink);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.configure",
      title: localize2(15201, "Settings"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "2_configure",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.has("extensionHasConfiguration")),
        order: 1
      },
      run: async (accessor, id2) => accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: `@ext:${id2}` })
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.download",
      title: localize(15084, null),
      menu: {
        id: MenuId.ExtensionContext,
        when: ContextKeyExpr.and(ContextKeyExpr.not("extensionDisallowInstall"), ContextKeyExpr.has("isGalleryExtension")),
        order: this.productService.quality === "stable" ? 0 : 1
      },
      run: async (accessor, extensionId) => {
        accessor.get(IExtensionsWorkbenchService).downloadVSIX(extensionId, "release");
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.downloadPreRelease",
      title: localize(15082, null),
      menu: {
        id: MenuId.ExtensionContext,
        when: ContextKeyExpr.and(ContextKeyExpr.not("extensionDisallowInstall"), ContextKeyExpr.has("isGalleryExtension"), ContextKeyExpr.has("extensionHasPreReleaseVersion")),
        order: this.productService.quality === "stable" ? 1 : 0
      },
      run: async (accessor, extensionId) => {
        accessor.get(IExtensionsWorkbenchService).downloadVSIX(extensionId, "prerelease");
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.downloadSpecificVersion",
      title: localize(15083, null),
      menu: {
        id: MenuId.ExtensionContext,
        when: ContextKeyExpr.and(ContextKeyExpr.not("extensionDisallowInstall"), ContextKeyExpr.has("isGalleryExtension")),
        order: 2
      },
      run: async (accessor, extensionId) => {
        accessor.get(IExtensionsWorkbenchService).downloadVSIX(extensionId, "any");
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.manageAccountPreferences",
      title: localize2(15200, "Account Preferences"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "2_configure",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.has("extensionHasAccountPreferences")),
        order: 2
      },
      run: (accessor, id2) => accessor.get(ICommandService).executeCommand("_manageAccountPreferencesForExtension", id2)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.configureKeybindings",
      title: localize2(15202, "Keyboard Shortcuts"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "2_configure",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.has("extensionHasKeybindings")),
        order: 2
      },
      run: async (accessor, id2) => accessor.get(IPreferencesService).openGlobalKeybindingSettings(false, { query: `@ext:${id2}` })
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.toggleApplyToAllProfiles",
      title: localize2(15209, "Apply Extension to all Profiles"),
      toggled: ContextKeyExpr.has("isApplicationScopedExtension"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "2_configure",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("extensionStatus", "installed"), ContextKeyExpr.has("isDefaultApplicationScopedExtension").negate(), ContextKeyExpr.has("isBuiltinExtension").negate(), ContextKeyExpr.equals("isWorkspaceScopedExtension", false)),
        order: 3
      },
      run: async (accessor, _, extensionArg) => {
        const uriIdentityService = accessor.get(IUriIdentityService);
        const extension = extensionArg.location ? this.extensionsWorkbenchService.installed.find((e) => uriIdentityService.extUri.isEqual(e.local?.location, extensionArg.location)) : void 0;
        if (extension) {
          return this.extensionsWorkbenchService.toggleApplyExtensionToAllProfiles(extension);
        }
      }
    });
    this.registerExtensionAction({
      id: TOGGLE_IGNORE_EXTENSION_ACTION_ID,
      title: localize2(15210, "Sync This Extension"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "2_configure",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("extensionStatus", "installed"), CONTEXT_SYNC_ENABLEMENT, ContextKeyExpr.equals("isWorkspaceScopedExtension", false)),
        order: 4
      },
      run: async (accessor, id2) => {
        const extension = this.extensionsWorkbenchService.local.find((e) => areSameExtensions({ id: id2 }, e.identifier));
        if (extension) {
          return this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(extension);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.ignoreRecommendation",
      title: localize2(15206, "Ignore Recommendation"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "3_recommendations",
        when: ContextKeyExpr.has("isExtensionRecommended"),
        order: 1
      },
      run: async (accessor, id2) => accessor.get(IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id2, true)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.undoIgnoredRecommendation",
      title: localize2(15211, "Undo Ignored Recommendation"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "3_recommendations",
        when: ContextKeyExpr.has("isUserIgnoredRecommendation"),
        order: 1
      },
      run: async (accessor, id2) => accessor.get(IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id2, false)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addExtensionToWorkspaceRecommendations",
      title: localize2(15195, "Add to Workspace Recommendations"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "3_recommendations",
        when: ContextKeyExpr.and(WorkbenchStateContext.notEqualsTo("empty"), ContextKeyExpr.has("isBuiltinExtension").negate(), ContextKeyExpr.has("isExtensionWorkspaceRecommended").negate(), ContextKeyExpr.has("isUserIgnoredRecommendation").negate(), ContextKeyExpr.notEquals("extensionSource", "resource")),
        order: 2
      },
      run: (accessor, id2) => accessor.get(IWorkspaceExtensionsConfigService).toggleRecommendation(id2)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.removeExtensionFromWorkspaceRecommendations",
      title: localize2(15208, "Remove from Workspace Recommendations"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "3_recommendations",
        when: ContextKeyExpr.and(WorkbenchStateContext.notEqualsTo("empty"), ContextKeyExpr.has("isBuiltinExtension").negate(), ContextKeyExpr.has("isExtensionWorkspaceRecommended")),
        order: 2
      },
      run: (accessor, id2) => accessor.get(IWorkspaceExtensionsConfigService).toggleRecommendation(id2)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addToWorkspaceRecommendations",
      title: localize2(15199, "Add Extension to Workspace Recommendations"),
      category: EXTENSIONS_CATEGORY,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(WorkbenchStateContext.isEqualTo("workspace"), ContextKeyExpr.equals("resourceScheme", Schemas.extension))
      },
      async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const workspaceExtensionsConfigService = accessor.get(IWorkspaceExtensionsConfigService);
        if (!(editorService.activeEditor instanceof ExtensionsInput)) {
          return;
        }
        const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
        const recommendations = await workspaceExtensionsConfigService.getRecommendations();
        if (recommendations.includes(extensionId)) {
          return;
        }
        await workspaceExtensionsConfigService.toggleRecommendation(extensionId);
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addToWorkspaceFolderRecommendations",
      title: localize2(15197, "Add Extension to Workspace Folder Recommendations"),
      category: EXTENSIONS_CATEGORY,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(WorkbenchStateContext.isEqualTo("folder"), ContextKeyExpr.equals("resourceScheme", Schemas.extension))
      },
      run: () => this.commandService.executeCommand("workbench.extensions.action.addToWorkspaceRecommendations")
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addToWorkspaceIgnoredRecommendations",
      title: localize2(15198, "Add Extension to Workspace Ignored Recommendations"),
      category: EXTENSIONS_CATEGORY,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(WorkbenchStateContext.isEqualTo("workspace"), ContextKeyExpr.equals("resourceScheme", Schemas.extension))
      },
      async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const workspaceExtensionsConfigService = accessor.get(IWorkspaceExtensionsConfigService);
        if (!(editorService.activeEditor instanceof ExtensionsInput)) {
          return;
        }
        const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
        const unwantedRecommendations = await workspaceExtensionsConfigService.getUnwantedRecommendations();
        if (unwantedRecommendations.includes(extensionId)) {
          return;
        }
        await workspaceExtensionsConfigService.toggleUnwantedRecommendation(extensionId);
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addToWorkspaceFolderIgnoredRecommendations",
      title: localize2(15196, "Add Extension to Workspace Folder Ignored Recommendations"),
      category: EXTENSIONS_CATEGORY,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(WorkbenchStateContext.isEqualTo("folder"), ContextKeyExpr.equals("resourceScheme", Schemas.extension))
      },
      run: () => this.commandService.executeCommand("workbench.extensions.action.addToWorkspaceIgnoredRecommendations")
    });
    this.registerExtensionAction({
      id: ConfigureWorkspaceRecommendedExtensionsAction.ID,
      title: { value: ConfigureWorkspaceRecommendedExtensionsAction.LABEL, original: "Configure Recommended Extensions (Workspace)" },
      category: EXTENSIONS_CATEGORY,
      menu: {
        id: MenuId.CommandPalette,
        when: WorkbenchStateContext.isEqualTo("workspace")
      },
      run: () => runAction(this.instantiationService.createInstance(ConfigureWorkspaceRecommendedExtensionsAction, ConfigureWorkspaceRecommendedExtensionsAction.ID, ConfigureWorkspaceRecommendedExtensionsAction.LABEL))
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.manageTrustedPublishers",
      title: localize2(15207, "Manage Trusted Extension Publishers"),
      category: EXTENSIONS_CATEGORY,
      f1: true,
      run: async (accessor) => {
        const quickInputService = accessor.get(IQuickInputService);
        const extensionManagementService = accessor.get(IWorkbenchExtensionManagementService);
        const trustedPublishers = extensionManagementService.getTrustedPublishers();
        const trustedPublisherItems = trustedPublishers.map((publisher) => ({
          id: publisher.publisher,
          label: publisher.publisherDisplayName,
          description: publisher.publisher,
          picked: true
        })).sort((a, b) => a.label.localeCompare(b.label));
        const result = await quickInputService.pick(trustedPublisherItems, {
          canPickMany: true,
          title: localize(15192, null),
          placeHolder: localize(15193, null)
        });
        if (result) {
          const untrustedPublishers = [];
          for (const { publisher } of trustedPublishers) {
            if (!result.some((r2) => r2.id === publisher)) {
              untrustedPublishers.push(publisher);
            }
          }
          trustedPublishers.filter((publisher) => !result.some((r2) => r2.id === publisher.publisher));
          extensionManagementService.untrustPublishers(...untrustedPublishers);
        }
      }
    });
  }
  registerExtensionAction(extensionActionOptions) {
    const menus = extensionActionOptions.menu ? Array.isArray(extensionActionOptions.menu) ? extensionActionOptions.menu : [extensionActionOptions.menu] : [];
    let menusWithOutTitles = [];
    const menusWithTitles = [];
    if (extensionActionOptions.menuTitles) {
      for (let index2 = 0; index2 < menus.length; index2++) {
        const menu = menus[index2];
        const menuTitle = extensionActionOptions.menuTitles[menu.id.id];
        if (menuTitle) {
          menusWithTitles.push({ id: menu.id, item: { ...menu, command: { id: extensionActionOptions.id, title: menuTitle } } });
        } else {
          menusWithOutTitles.push(menu);
        }
      }
    } else {
      menusWithOutTitles = menus;
    }
    const disposables = new DisposableStore();
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          ...extensionActionOptions,
          menu: menusWithOutTitles
        });
      }
      run(accessor, ...args2) {
        return extensionActionOptions.run(accessor, ...args2);
      }
    }));
    if (menusWithTitles.length) {
      disposables.add(MenuRegistry.appendMenuItems(menusWithTitles));
    }
    return disposables;
  }
};

ExtensionsContributions = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IExtensionManagementServerService),
  __decorateParam(2, IExtensionGalleryManifestService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IViewsService),
  __decorateParam(5, IExtensionsWorkbenchService),
  __decorateParam(6, IWorkbenchExtensionEnablementService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, ICommandService),
  __decorateParam(10, IProductService),
  __decorateParam(11, IPluginInstallService)
], ExtensionsContributions);

var ExtensionStorageCleaner = class {
  constructor(extensionManagementService, storageService) {
    ExtensionStorageService.removeOutdatedExtensionVersions(extensionManagementService, storageService);
  }
};

ExtensionStorageCleaner = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IStorageService)
], ExtensionStorageCleaner);

var TrustedPublishersInitializer = class {
  constructor(extensionManagementService, userDataProfilesService, productService, storageService) {
    const trustedPublishersInitStatusKey = "trusted-publishers-init-migration";
    if (!storageService.get(trustedPublishersInitStatusKey, -1 /* APPLICATION */)) {
      for (const profile of userDataProfilesService.profiles) {
        extensionManagementService.getInstalled(1 /* User */, profile.extensionsResource).then(async (extensions) => {
          const trustedPublishers = /* @__PURE__ */ new Map();
          for (const extension of extensions) {
            if (!extension.publisherDisplayName) {
              continue;
            }
            const publisher = extension.manifest.publisher.toLowerCase();
            if (productService.trustedExtensionPublishers?.includes(publisher) || extension.publisherDisplayName && productService.trustedExtensionPublishers?.includes(extension.publisherDisplayName.toLowerCase())) {
              continue;
            }
            trustedPublishers.set(publisher, { publisher, publisherDisplayName: extension.publisherDisplayName });
          }
          if (trustedPublishers.size) {
            extensionManagementService.trustPublishers(...trustedPublishers.values());
          }
          storageService.store(trustedPublishersInitStatusKey, "true", -1 /* APPLICATION */, 1 /* MACHINE */);
        });
      }
    }
  }
};

TrustedPublishersInitializer = __decorateClass([
  __decorateParam(0, IWorkbenchExtensionManagementService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IStorageService)
], TrustedPublishersInitializer);

var ExtensionToolsContribution = class extends Disposable {
  static {
    this.ID = "extensions.chat.toolsContribution";
  }
  constructor(toolsService, instantiationService) {
    super();
    const searchExtensionsTool = instantiationService.createInstance(SearchExtensionsTool);
    this._register(toolsService.registerTool(SearchExtensionsToolData, searchExtensionsTool));
    this._register(toolsService.vscodeToolSet.addTool(SearchExtensionsToolData));
  }
};

ExtensionToolsContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInstantiationService)
], ExtensionToolsContribution);

var workbenchRegistry = Registry.as(Extensions10.Workbench);

workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 3 /* Restored */);

workbenchRegistry.registerWorkbenchContribution(StatusUpdater, 4 /* Eventually */);

workbenchRegistry.registerWorkbenchContribution(MaliciousExtensionChecker, 4 /* Eventually */);

workbenchRegistry.registerWorkbenchContribution(KeymapExtensions, 3 /* Restored */);

workbenchRegistry.registerWorkbenchContribution(ExtensionsViewletViewsContribution, 3 /* Restored */);

workbenchRegistry.registerWorkbenchContribution(ExtensionActivationProgress, 4 /* Eventually */);

workbenchRegistry.registerWorkbenchContribution(ExtensionDependencyChecker, 4 /* Eventually */);

workbenchRegistry.registerWorkbenchContribution(ExtensionEnablementWorkspaceTrustTransitionParticipant, 3 /* Restored */);

workbenchRegistry.registerWorkbenchContribution(ExtensionsCompletionItemsProvider, 3 /* Restored */);

workbenchRegistry.registerWorkbenchContribution(ExtensionEnablementContextKeysContribution, 3 /* Restored */);

workbenchRegistry.registerWorkbenchContribution(UnsupportedExtensionsMigrationContrib, 4 /* Eventually */);

workbenchRegistry.registerWorkbenchContribution(TrustedPublishersInitializer, 4 /* Eventually */);

workbenchRegistry.registerWorkbenchContribution(ExtensionMarketplaceStatusUpdater, 4 /* Eventually */);

if (isWeb) {
  workbenchRegistry.registerWorkbenchContribution(ExtensionStorageCleaner, 4 /* Eventually */);
}

registerWorkbenchContribution2(ExtensionToolsContribution.ID, ExtensionToolsContribution, WorkbenchPhase.AfterRestored);

registerAction2(class ExtensionsGallerySignInAction extends Action2 {
  constructor() {
    super({
      id: "workbench.extensions.actions.gallery.signIn",
      title: localize2(15185, "Sign in to access Extensions Marketplace"),
      menu: {
        id: MenuId.AccountsContext,
        when: CONTEXT_EXTENSIONS_GALLERY_STATUS.isEqualTo("requiresSignIn" /* RequiresSignIn */)
      }
    });
  }
  run(accessor) {
    return accessor.get(ICommandService).executeCommand(DEFAULT_ACCOUNT_SIGN_IN_COMMAND);
  }
});

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: AutoUpdateConfigurationKey,
  /**
   * Migrates the `extensions.autoUpdate` setting to its new `'on' | 'off'` values.
   *
   * The setting previously supported several values that are now retired:
   * - `true` (All Extensions) and `'onlyEnabledExtensions'` (Only Enabled Extensions)
   *   are folded into the new `'on'` value, along with the insiders-only `'delayed'` value.
   * - `false` (None) and the internal `'onlySelectedExtensions'` value map to `'off'`.
   *   In `'off'` mode, extensions explicitly opted in per-extension are still auto-updated,
   *   which preserves the `'onlySelectedExtensions'` behavior.
   *
   * Returning `[]` is a no-op, used when the value is already in the new format
   * (`'on'`/`'off'`) or unset.
   */
  migrateFn: (value2, accessor) => {
    if (value2 === void 0 || value2 === "on" || value2 === "off") {
      return [];
    }
    if (value2 === false || value2 === "onlySelectedExtensions") {
      return { value: "off" };
    }
    return { value: "on" };
  }
}]);

// OpenCode market-ext-step01: 侧边栏不再有自带的「扩展」按钮，所有编辑器扩展都在「市场」窗口里管理。
// 这里给扩展宿主（市场窗口）提供已安装扩展的完整状态与管理操作，并把打开扩展视图的入口转到市场。
var OC_EXT_STATE_NAMES = { 0: "installing", 1: "installed", 2: "uninstalling", 3: "uninstalled" };
function ocExtFind(service, id2) {
  const want = String(id2 ?? "").toLowerCase();
  return service.local.find((e) => e.identifier.id.toLowerCase() === want);
}
function ocExtSerialize(e, service, enablement) {
  let canToggle = false, canToggleWorkspace = false, autoUpdate = false, hasConfig = false, hasKeys = false, iconPath = "";
  try { canToggle = !!e.local && enablement.canChangeEnablement(e.local); } catch {}
  try { canToggleWorkspace = !!e.local && enablement.canChangeWorkspaceEnablement(e.local); } catch {}
  try { autoUpdate = !!service.isAutoUpdateEnabledFor(e); } catch {}
  const manifest = e.local?.manifest;
  if (manifest) {
    hasConfig = !!manifest.contributes?.configuration;
    hasKeys = Array.isArray(manifest.contributes?.keybindings) && manifest.contributes.keybindings.length > 0;
    if (typeof manifest.icon === "string" && e.local.location?.scheme === "file") iconPath = URI.joinPath(e.local.location, manifest.icon).fsPath;
  }
  const icon = typeof e.iconUrl === "string" && /^https:\/\//.test(e.iconUrl) ? e.iconUrl : "";
  const runtime = e.runtimeState ? { action: String(e.runtimeState.action ?? ""), reason: String(e.runtimeState.reason ?? "") } : null;
  return {
    id: e.identifier.id, name: String(e.displayName || e.name || e.identifier.id), publisher: String(e.publisherDisplayName || e.publisher || ""),
    description: String(e.description ?? ""), version: String(e.version ?? ""), latestVersion: String(e.latestVersion ?? ""),
    icon, iconPath, builtin: !!e.isBuiltin, state: OC_EXT_STATE_NAMES[e.state] ?? String(e.state), enablement: e.enablementState,
    enabled: (() => { try { return enablement.isEnabledEnablementState(e.enablementState); } catch { return true; } })(),
    disabledGlobally: e.enablementState === 10, disabledWorkspace: e.enablementState === 11,
    canToggle, canToggleWorkspace, outdated: !!e.outdated, runtime, categories: Array.isArray(e.categories) ? e.categories.slice(0, 6) : [],
    installCount: Number(e.installCount) || 0, rating: Number(e.rating) || 0, preRelease: !!e.isPreReleaseVersion, hasPreRelease: !!e.hasPreReleaseVersion,
    pinned: !!e.pinned, autoUpdate, gallery: !!e.gallery, malicious: !!e.isMalicious, deprecated: !!e.deprecationInfo, workspaceScoped: !!e.isWorkspaceScoped,
    hasConfig, hasKeys, url: String(e.url ?? ""), repository: String(e.repository ?? "")
  };
}
CommandsRegistry.registerCommand("_opencode.extensions.state", async (accessor, opts) => {
  const service = accessor.get(IExtensionsWorkbenchService);
  const enablement = accessor.get(IWorkbenchExtensionEnablementService);
  if (opts?.refresh) { try { await service.queryLocal(); } catch {} }
  const local = service.local.filter((e) => e.state !== 3).map((e) => ocExtSerialize(e, service, enablement));
  let recommendations = [];
  try {
    const recs = accessor.get(IExtensionRecommendationsService).getAllRecommendationsWithReason() || {};
    recommendations = Object.keys(recs).map((id2) => ({ id: id2, reason: String(recs[id2]?.reasonText ?? "") }));
  } catch {}
  let autoUpdateAll = "on";
  try { autoUpdateAll = String(service.getAutoUpdateValue()); } catch {}
  const needsRestart = local.some((x) => x.runtime && x.runtime.action === "restartExtensions");
  const needsReload = local.some((x) => x.runtime && x.runtime.action === "reloadWindow");
  return { local, recommendations, autoUpdateAll, needsRestart, needsReload };
});
CommandsRegistry.registerCommand("_opencode.extensions.run", async (accessor, action, id2, arg) => {
  const service = accessor.get(IExtensionsWorkbenchService);
  const commands = accessor.get(ICommandService);
  const instantiationService = accessor.get(IInstantiationService);
  const ext = id2 ? ocExtFind(service, id2) : void 0;
  const need = () => { if (!ext) throw new Error("没有找到扩展 " + id2); return ext; };
  switch (action) {
    case "enable": await service.setEnablement(need(), 12); return true;
    case "disable": await service.setEnablement(need(), 10); return true;
    case "enableWorkspace": await service.setEnablement(need(), 13); return true;
    case "disableWorkspace": await service.setEnablement(need(), 11); return true;
    case "uninstall": await service.uninstall(need()); return true;
    case "update": await service.install(need(), { installPreReleaseVersion: !!need().local?.isPreReleaseVersion }); return true;
    case "preRelease": await service.install(need(), { installPreReleaseVersion: !!arg }); return true;
    case "otherVersion": return runAction(instantiationService.createInstance(InstallAnotherVersionAction, need(), true));
    case "autoUpdate": await service.updateAutoUpdateEnablementFor(need(), !!arg); return true;
    case "autoUpdateAll": await service.updateAutoUpdateForAllExtensions(!!arg); return true;
    case "details": await service.open(need() ?? String(id2)); return true;
    case "settings": return commands.executeCommand("workbench.extensions.action.configure", need().identifier.id);
    case "keybindings": return commands.executeCommand("workbench.extensions.action.configureKeybindings", need().identifier.id);
    case "copyId": await accessor.get(IClipboardService).writeText(need().identifier.id); return true;
    case "checkUpdates": await service.checkForUpdates("opencode-market"); return true;
    case "updateAll": await service.updateAll(); return true;
    case "restart": await service.updateRunningExtensions(); return true;
    case "reload": return commands.executeCommand("workbench.action.reloadWindow");
    case "installVsix": return commands.executeCommand(SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID);
    case "enableAll": return commands.executeCommand("workbench.extensions.action.enableAll");
    case "disableAll": return commands.executeCommand("workbench.extensions.action.disableAll");
    case "runningExtensions": return commands.executeCommand("workbench.action.showRuntimeExtensions");
  }
  throw new Error("未知操作 " + action);
});
// 打开「扩展」视图（快捷键 Ctrl+Shift+X、菜单、管理按钮等）时关掉它，改为打开市场的扩展页。
var OcExtensionsViewRedirect = class extends Disposable {
  static {
    this.ID = "workbench.contrib.opencodeExtensionsViewRedirect";
  }
  constructor(viewsService, commandService) {
    super();
    const born = Date.now();
    let last;
    const redirect = () => {
      viewsService.closeViewContainer(VIEWLET_ID2);
      if (last && last !== VIEWLET_ID2) viewsService.openViewContainer(last, false);
      if (Date.now() - born > 4e3) commandService.executeCommand("opencode.openMarket", "ext", { view: "installed" }).then(void 0, onUnexpectedError);
    };
    this._register(viewsService.onDidChangeViewContainerVisibility((e) => {
      if (!e?.visible || e.location !== 0) return;
      if (e.id !== VIEWLET_ID2) { last = e.id; return; }
      setTimeout(redirect, 0);
    }));
    if (viewsService.isViewContainerVisible?.(VIEWLET_ID2)) setTimeout(redirect, 0);
  }
};
OcExtensionsViewRedirect = __decorateClass([
  __decorateParam(0, IViewsService),
  __decorateParam(1, ICommandService)
], OcExtensionsViewRedirect);
registerWorkbenchContribution2(OcExtensionsViewRedirect.ID, OcExtensionsViewRedirect, WorkbenchPhase.AfterRestored);

export { overrideActionForActiveExtensionEditorWebview, runAction, VIEW_CONTAINER, jsonRegistry2, CONTEXT_HAS_LOCAL_SERVER, CONTEXT_HAS_REMOTE_SERVER, CONTEXT_HAS_WEB_SERVER, CONTEXT_GALLERY_SORT_CAPABILITIES, CONTEXT_GALLERY_FILTER_CAPABILITIES, CONTEXT_GALLERY_ALL_PUBLIC_REPOSITORY_SIGNED, CONTEXT_GALLERY_ALL_PRIVATE_REPOSITORY_SIGNED, CONTEXT_GALLERY_HAS_EXTENSION_LINK, ExtensionsContributions, ExtensionStorageCleaner, TrustedPublishersInitializer, ExtensionToolsContribution, workbenchRegistry };
