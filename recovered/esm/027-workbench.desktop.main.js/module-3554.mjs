// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/browser/startupPage.ts
import { Disposable } from "./module-0012.mjs";
import { GettingStartedInput, gettingStartedInputTypeId } from "./module-3494.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { AuxiliaryBarMaximizedContext } from "./module-0949.mjs";
import { getTelemetryLevel } from "./module-0885.mjs";
import { IWorkspaceContextService, UNKNOWN_EMPTY_WINDOW_WORKSPACE } from "./module-0509.mjs";
import { coalesce } from "./module-0007.mjs";
import { joinPath } from "./module-0034.mjs";
import { getActiveElement } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { isWeb } from "./module-0014.mjs";
import { ONBOARDING_STORAGE_KEY } from "./module-3553.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IProductService } from "./module-0873.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IOnboardingService } from "./module-3552.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/browser/startupPage.ts
var restoreWalkthroughsConfigurationKey = "workbench.welcomePage.restorableWalkthroughs";

var configurationKey = "workbench.startupEditor";

var oldConfigurationKey = "workbench.welcome.enabled";

var telemetryOptOutStorageKey = "workbench.telemetryOptOutShown";

var BRIDGE_STARTUP_PIN_PAGE_SETTING2 = "opencode.bridge.startupPinPage";

var StartupPageEditorResolverContribution = class extends Disposable {
  constructor(instantiationService, editorResolverService) {
    super();
    this.instantiationService = instantiationService;
    this._register(editorResolverService.registerEditor(
      `${GettingStartedInput.RESOURCE.scheme}:/**`,
      {
        id: GettingStartedInput.ID,
        label: localize(21999, null),
        priority: "builtin" /* builtin */
      },
      {
        singlePerResource: true,
        canSupportResource: (uri5) => uri5.scheme === GettingStartedInput.RESOURCE.scheme
      },
      {
        createEditorInput: ({ options: options3 }) => {
          return {
            editor: this.instantiationService.createInstance(GettingStartedInput, options3),
            options: {
              ...options3,
              pinned: false
            }
          };
        }
      }
    ));
  }
  static {
    this.ID = "workbench.contrib.startupPageEditorResolver";
  }
};

StartupPageEditorResolverContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IEditorResolverService)
], StartupPageEditorResolverContribution);

var StartupPageRunnerContribution = class extends Disposable {
  constructor(configurationService, editorService, fileService, contextService, lifecycleService, layoutService, productService, commandService, environmentService, storageService, notificationService, contextKeyService, onboardingService, chatEntitlementService) {
    super();
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.fileService = fileService;
    this.contextService = contextService;
    this.lifecycleService = lifecycleService;
    this.layoutService = layoutService;
    this.productService = productService;
    this.commandService = commandService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.notificationService = notificationService;
    this.contextKeyService = contextKeyService;
    this.onboardingService = onboardingService;
    this.chatEntitlementService = chatEntitlementService;
    this.tryShowOnboarding();
    this.run().then(void 0, onUnexpectedError);
    this._register(this.editorService.onDidCloseEditor((e) => {
      if (e.editor instanceof GettingStartedInput) {
        e.editor.selectedCategory = void 0;
        e.editor.selectedStep = void 0;
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.startupPageRunner";
  }
  async run() {
    await this.lifecycleService.when(3 /* Restored */);
    if (AuxiliaryBarMaximizedContext.getValue(this.contextKeyService)) {
      return;
    }
    if (this.productService.enableTelemetry && this.productService.showTelemetryOptOut && getTelemetryLevel(this.configurationService) !== 0 /* NONE */ && !this.environmentService.skipWelcome && !this.storageService.get(telemetryOptOutStorageKey, 0 /* PROFILE */)) {
      this.storageService.store(telemetryOptOutStorageKey, true, 0 /* PROFILE */, 0 /* USER */);
    }
    const pinBridgeStartup = this.configurationService.getValue(BRIDGE_STARTUP_PIN_PAGE_SETTING2) !== false;
    if (pinBridgeStartup && !this.environmentService.skipWelcome) {
      const welcomeEditors = this.editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */).filter((e) => e.editor instanceof GettingStartedInput);
      if (welcomeEditors.length > 0) {
        await this.editorService.closeEditors(welcomeEditors);
      }
      await this.commandService.executeCommand("aiCustomization.openManagementEditor", "bridge", void 0, { toFront: true });
      return;
    }
    if (this.tryOpenWalkthroughForFolder()) {
      return;
    }
    const enabled = isStartupPageEnabled(this.configurationService, this.contextService, this.environmentService);
    if (enabled && this.lifecycleService.startupKind !== 3 /* ReloadedWindow */) {
      if (!this.editorService.activeEditor || this.layoutService.openedDefaultEditors) {
        const startupEditorSetting = this.configurationService.inspect(configurationKey);
        if (startupEditorSetting.value === "readme") {
          await this.openReadme();
        } else if (startupEditorSetting.value === "welcomePage" || startupEditorSetting.value === "welcomePageInEmptyWorkbench") {
          await this.openGettingStarted(true);
        } else if (startupEditorSetting.value === "terminal") {
          this.commandService.executeCommand("workbench.action.createTerminalEditor" /* CreateTerminalEditor */);
        }
      }
    }
  }
  tryOpenWalkthroughForFolder() {
    // Do not restore the retired walkthrough editor or alter stored user data.
    return false;
  }
  async openReadme() {
    const readmes = coalesce(
      await Promise.all(this.contextService.getWorkspace().folders.map(
        async (folder) => {
          const folderUri = folder.uri;
          const folderStat = await this.fileService.resolve(folderUri).catch(onUnexpectedError);
          const files = folderStat?.children ? folderStat.children.map((child) => child.name).sort() : [];
          const file = files.find((file2) => file2.toLowerCase() === "readme.md") || files.find((file2) => file2.toLowerCase().startsWith("readme"));
          if (file) {
            return joinPath(folderUri, file);
          } else {
            return void 0;
          }
        }
      ))
    );
    if (!this.editorService.activeEditor) {
      if (readmes.length) {
        const isMarkDown = (readme) => readme.path.toLowerCase().endsWith(".md");
        await Promise.all([
          this.commandService.executeCommand("markdown.showPreview", null, readmes.filter(isMarkDown), { locked: true }).catch((error) => {
            this.notificationService.error(localize(21998, null, error.message));
          }),
          this.editorService.openEditors(readmes.filter((readme) => !isMarkDown(readme)).map((readme) => ({ resource: readme, options: { preserveFocus: this.shouldPreserveFocus() } })))
        ]);
      } else {
        await this.openGettingStarted();
      }
    }
  }
  async openGettingStarted(showTelemetryNotice) {
    // Existing startup preferences now resolve to the current Bridge, not legacy onboarding.
    const bridgeInputId = "workbench.input.aiCustomizationManagement";
    if (this.editorService.activeEditor?.typeId === bridgeInputId || this.editorService.editors.some((editor) => editor.typeId === bridgeInputId)) {
      return;
    }
    await this.commandService.executeCommand("aiCustomization.openManagementEditor", "bridge", void 0, { toFront: true });
  }
  shouldPreserveFocus() {
    const activeElement = getActiveElement();
    if (!activeElement || activeElement === mainWindow.document.body || this.layoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */)) {
      return false;
    }
    return true;
  }
  tryShowOnboarding() {
    // The retired product/account onboarding is not part of this build.
    return;
  }
};

StartupPageRunnerContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, ILifecycleService),
  __decorateParam(5, IWorkbenchLayoutService),
  __decorateParam(6, IProductService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IWorkbenchEnvironmentService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, IOnboardingService),
  __decorateParam(13, IChatEntitlementService)
], StartupPageRunnerContribution);

function isStartupPageEnabled(configurationService, contextService, environmentService) {
  if (environmentService.skipWelcome) {
    return false;
  }
  const startupEditor = configurationService.inspect(configurationKey);
  if (!startupEditor.userValue && !startupEditor.workspaceValue) {
    const welcomeEnabled = configurationService.inspect(oldConfigurationKey);
    if (welcomeEnabled.value !== void 0 && welcomeEnabled.value !== null) {
      return welcomeEnabled.value;
    }
  }
  return startupEditor.value === "welcomePage" || startupEditor.value === "readme" || contextService.getWorkbenchState() === 1 /* EMPTY */ && startupEditor.value === "welcomePageInEmptyWorkbench" || startupEditor.value === "terminal";
}
export { isStartupPageEnabled, restoreWalkthroughsConfigurationKey, configurationKey, oldConfigurationKey, telemetryOptOutStorageKey, BRIDGE_STARTUP_PIN_PAGE_SETTING2, StartupPageEditorResolverContribution, StartupPageRunnerContribution };
