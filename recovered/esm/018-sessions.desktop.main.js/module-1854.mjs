// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsActions.ts
import { Action, Separator, SubmenuAction } from "./module-0082.mjs";
import { getErrorMessage, isCancellationError } from "./module-0004.mjs";
import { isIOS, isWeb, language } from "./module-0014.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { URI } from "./module-0032.mjs";
import { MarkdownString, createCommandUri, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { showWindowLogActionId } from "./module-1501.mjs";
import { AutoUpdateConfigurationKey, IExtensionsWorkbenchService, INSTALL_ACTIONS_GROUP, SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID, THEME_ACTIONS_GROUP, TOGGLE_IGNORE_EXTENSION_ACTION_ID, UPDATE_ACTIONS_GROUP } from "./module-1023.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IDialogService } from "./module-0267.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ILogService } from "./module-0095.mjs";
import { IExtensionManagementServerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "./module-1047.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAllowedExtensionsService, IExtensionGalleryService, VerifyExtensionSignatureConfigKey, shouldRequireRepositorySignatureFor } from "./module-0874.mjs";
import { IExtensionManifestPropertiesService } from "./module-1049.mjs";
import { IWorkbenchIssueService } from "./module-1852.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ActionWithDropdownActionViewItem } from "./module-0502.mjs";
import { Delayer, Promises, Throttler } from "./module-0036.mjs";
import { isString } from "./module-0010.mjs";
import { alert } from "./module-0076.mjs";
import { IExtensionService, toExtension, toExtensionDescription } from "./module-0889.mjs";
import { IWorkbenchThemeService } from "./module-0917.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IExtensionGalleryManifestService } from "./module-0892.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { areSameExtensions, getExtensionId } from "./module-0888.mjs";
import { ExtensionIdentifier, getWorkspaceSupportTypeMessage, isApplicationScopedExtension, isLanguagePackExtension } from "./module-0688.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { getWorkbenchMenuMotionContextMenuOptions } from "./module-1853.mjs";
import { disposeIfDisposable } from "./module-0012.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService } from "./module-1645.mjs";
import { IAuthenticationUsageService } from "./module-1415.mjs";
import { getLocale } from "./module-0924.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { errorIcon, infoIcon, manageExtensionIcon, syncEnabledIcon, syncIgnoredIcon, trustIcon, warningIcon2 } from "./module-1851.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { fromNow } from "./module-0120.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { IHostService } from "./module-1118.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { ILocaleService } from "./module-1665.mjs";
import { findNodeAtLocation, parse5, parseTree } from "./module-0885.mjs";
import { ExtensionsConfigurationInitialContent } from "./module-1850.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IJSONEditingService } from "./module-1584.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { EXTENSIONS_CONFIG } from "./module-1646.mjs";
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from "./module-1513.mjs";
import { IUserDataSyncEnablementService } from "./module-1639.mjs";
import { isVirtualWorkspace } from "./module-0937.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11, IExtensionFeaturesManagementService } from "./module-0879.mjs";
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IProgressService } from "./module-0446.mjs";
import { registerColor } from "./module-0226.mjs";
import { buttonBackground, buttonForeground, buttonHoverBackground, buttonSecondaryBackground, buttonSecondaryBorder, buttonSecondaryForeground, buttonSecondaryHoverBackground, buttonSeparator } from "./module-0233.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorErrorForeground, editorInfoForeground, editorWarningForeground } from "./module-0229.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsActions.ts
var PromptExtensionInstallFailureAction = class extends Action {
  constructor(extension, options3, version2, installOperation, error, productService, openerService, notificationService, dialogService, commandService, logService, extensionManagementServerService, instantiationService, galleryService, extensionManifestPropertiesService, workbenchIssueService) {
    super("extension.promptExtensionInstallFailure");
    this.extension = extension;
    this.options = options3;
    this.version = version2;
    this.installOperation = installOperation;
    this.error = error;
    this.productService = productService;
    this.openerService = openerService;
    this.notificationService = notificationService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.logService = logService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.instantiationService = instantiationService;
    this.galleryService = galleryService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.workbenchIssueService = workbenchIssueService;
  }
  async run() {
    if (isCancellationError(this.error)) {
      return;
    }
    this.logService.error(this.error);
    if (this.error.name === "Unsupported" /* Unsupported */) {
      const productName = isWeb ? localize(15381, null, this.productService.nameLong) : this.productService.nameLong;
      const message2 = localize(15228, null, this.extension.displayName || this.extension.identifier.id, productName);
      const { confirmed } = await this.dialogService.confirm({
        type: Severity2.Info,
        message: message2,
        primaryButton: localize(15329, null),
        cancelButton: localize(15230, null)
      });
      if (confirmed) {
        this.openerService.open(isWeb ? URI.parse("https://aka.ms/vscode-web-extensions-guide") : URI.parse("https://aka.ms/vscode-remote"));
      }
      return;
    }
    if ("ReleaseVersionNotFound" /* ReleaseVersionNotFound */ === this.error.name) {
      await this.dialogService.prompt({
        type: "error",
        message: getErrorMessage(this.error),
        buttons: [{
          label: localize(15308, null),
          run: () => {
            const installAction = this.instantiationService.createInstance(InstallAction, { installPreReleaseVersion: true });
            installAction.extension = this.extension;
            return installAction.run();
          }
        }],
        cancelButton: localize(15226, null)
      });
      return;
    }
    if (["Incompatible" /* Incompatible */, "IncompatibleApi" /* IncompatibleApi */, "IncompatibleTargetPlatform" /* IncompatibleTargetPlatform */, "Malicious" /* Malicious */, "Deprecated" /* Deprecated */].includes(this.error.name)) {
      await this.dialogService.info(getErrorMessage(this.error));
      return;
    }
    if ("PackageNotSigned" /* PackageNotSigned */ === this.error.name) {
      await this.dialogService.prompt({
        type: "error",
        message: localize(15332, null, this.extension.displayName),
        detail: getErrorMessage(this.error),
        buttons: [{
          label: localize(15294, null),
          run: () => {
            const installAction = this.instantiationService.createInstance(InstallAction, { ...this.options, donotVerifySignature: true });
            installAction.extension = this.extension;
            return installAction.run();
          }
        }],
        cancelButton: true
      });
      return;
    }
    if ("SignatureVerificationFailed" /* SignatureVerificationFailed */ === this.error.name) {
      await this.dialogService.prompt({
        type: "error",
        message: localize(15380, null, this.extension.displayName, this.productService.nameLong),
        detail: getErrorMessage(this.error),
        buttons: [{
          label: localize(15321, null),
          run: () => this.openerService.open("https://code.visualstudio.com/docs/editor/extension-marketplace#_the-extension-signature-cannot-be-verified-by-vs-code")
        }, {
          label: localize(15297, null),
          run: () => {
            const installAction = this.instantiationService.createInstance(InstallAction, { ...this.options, donotVerifySignature: true });
            installAction.extension = this.extension;
            return installAction.run();
          }
        }],
        cancelButton: true
      });
      return;
    }
    if ("SignatureVerificationInternal" /* SignatureVerificationInternal */ === this.error.name) {
      await this.dialogService.prompt({
        type: "error",
        message: localize(15380, null, this.extension.displayName, this.productService.nameLong),
        detail: getErrorMessage(this.error),
        buttons: [{
          label: localize(15321, null),
          run: () => this.openerService.open("https://code.visualstudio.com/docs/editor/extension-marketplace#_the-extension-signature-cannot-be-verified-by-vs-code")
        }, {
          label: localize(15338, null),
          run: () => this.workbenchIssueService.openReporter({
            issueTitle: localize(15340, null, this.extension.displayName),
            issueBody: localize(15339, null)
          })
        }, {
          label: localize(15297, null),
          run: () => {
            const installAction = this.instantiationService.createInstance(InstallAction, { ...this.options, donotVerifySignature: true });
            installAction.extension = this.extension;
            return installAction.run();
          }
        }],
        cancelButton: true
      });
      return;
    }
    const operationMessage = this.installOperation === 3 /* Update */ ? localize(15372, null, this.extension.displayName || this.extension.identifier.id) : localize(15305, null, this.extension.displayName || this.extension.identifier.id);
    let additionalMessage;
    const promptChoices = [];
    const downloadUrl = await this.getDownloadUrl();
    if (downloadUrl) {
      additionalMessage = localize(15229, null, createCommandUri(showWindowLogActionId).toString());
      promptChoices.push({
        label: localize(15257, null),
        run: () => this.openerService.open(downloadUrl).then(() => {
          this.notificationService.prompt(
            Severity2.Info,
            localize(15312, null, this.extension.identifier.id),
            [{
              label: localize(15320, null),
              run: () => this.commandService.executeCommand(SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID)
            }]
          );
        })
      });
    }
    const message = `${operationMessage}${additionalMessage ? ` ${additionalMessage}` : ""}`;
    this.notificationService.prompt(Severity2.Error, message, promptChoices);
  }
  async getDownloadUrl() {
    if (isIOS) {
      return void 0;
    }
    if (!this.extension.gallery) {
      return void 0;
    }
    if (!this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer) {
      return void 0;
    }
    let targetPlatform = this.extension.gallery.properties.targetPlatform;
    if (targetPlatform !== "universal" /* UNIVERSAL */ && targetPlatform !== "undefined" /* UNDEFINED */ && this.extensionManagementServerService.remoteExtensionManagementServer) {
      try {
        const manifest = await this.galleryService.getManifest(this.extension.gallery, CancellationToken.None);
        if (manifest && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(manifest)) {
          targetPlatform = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform();
        }
      } catch (error) {
        this.logService.error(error);
        return void 0;
      }
    }
    if (targetPlatform === "unknown" /* UNKNOWN */) {
      return void 0;
    }
    const [extension] = await this.galleryService.getExtensions([{
      ...this.extension.identifier,
      version: this.version
    }], {
      targetPlatform
    }, CancellationToken.None);
    if (!extension) {
      return void 0;
    }
    return URI.parse(extension.assets.download.uri);
  }
};

PromptExtensionInstallFailureAction = __decorateClass([
  __decorateParam(5, IProductService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, ICommandService),
  __decorateParam(10, ILogService),
  __decorateParam(11, IExtensionManagementServerService),
  __decorateParam(12, IInstantiationService),
  __decorateParam(13, IExtensionGalleryService),
  __decorateParam(14, IExtensionManifestPropertiesService),
  __decorateParam(15, IWorkbenchIssueService)
], PromptExtensionInstallFailureAction);

var ExtensionAction = class _ExtensionAction extends Action {
  constructor() {
    super(...arguments);
    this._onDidChange = this._register(new Emitter());
    this._extension = null;
    this._hidden = false;
    this.hideOnDisabled = true;
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  static {
    this.EXTENSION_ACTION_CLASS = "extension-action";
  }
  static {
    this.TEXT_ACTION_CLASS = `${_ExtensionAction.EXTENSION_ACTION_CLASS} text`;
  }
  static {
    this.LABEL_ACTION_CLASS = `${_ExtensionAction.EXTENSION_ACTION_CLASS} label`;
  }
  static {
    this.ICON_ACTION_CLASS = `${_ExtensionAction.EXTENSION_ACTION_CLASS} icon`;
  }
  get extension() {
    return this._extension;
  }
  set extension(extension) {
    this._extension = extension;
    this.update();
  }
  get hidden() {
    return this._hidden;
  }
  set hidden(hidden) {
    if (this._hidden !== hidden) {
      this._hidden = hidden;
      this._onDidChange.fire({ hidden });
    }
  }
  _setEnabled(value2) {
    super._setEnabled(value2);
    if (this.hideOnDisabled) {
      this.hidden = !value2;
    }
  }
};

var ButtonWithDropDownExtensionAction = class extends ExtensionAction {
  constructor(id2, clazz, actionsGroups) {
    clazz = `${clazz} action-dropdown`;
    super(id2, void 0, clazz);
    this.actionsGroups = actionsGroups;
    this.menuActionClassNames = [];
    this._menuActions = [];
    this.menuActionClassNames = clazz.split(" ");
    this.hideOnDisabled = false;
    this.extensionActions = actionsGroups.flat();
    this.update();
    this._register(Event2.any(...this.extensionActions.map((a) => a.onDidChange))(() => this.update(true)));
    this.extensionActions.forEach((a) => this._register(a));
  }
  get menuActions() {
    return [...this._menuActions];
  }
  get extension() {
    return super.extension;
  }
  set extension(extension) {
    this.extensionActions.forEach((a) => a.extension = extension);
    super.extension = extension;
  }
  update(donotUpdateActions) {
    if (!donotUpdateActions) {
      this.extensionActions.forEach((a) => a.update());
    }
    const actionsGroups = this.actionsGroups.map((actionsGroup) => actionsGroup.filter((a) => !a.hidden));
    let actions = [];
    for (const visibleActions of actionsGroups) {
      if (visibleActions.length) {
        actions = [...actions, ...visibleActions, new Separator()];
      }
    }
    actions = actions.length ? actions.slice(0, actions.length - 1) : actions;
    this.primaryAction = actions[0];
    this._menuActions = actions.length > 1 ? actions : [];
    this._onDidChange.fire({ menuActions: this._menuActions });
    if (this.primaryAction) {
      this.hidden = false;
      this.enabled = this.primaryAction.enabled;
      this.label = this.getLabel(this.primaryAction);
      this.tooltip = this.primaryAction.tooltip;
    } else {
      this.hidden = true;
      this.enabled = false;
    }
  }
  async run() {
    if (this.enabled) {
      await this.primaryAction?.run();
    }
  }
  getLabel(action) {
    return action.label;
  }
};

var ButtonWithDropdownExtensionActionViewItem = class extends ActionWithDropdownActionViewItem {
  constructor(action, options3, contextMenuProvider) {
    super(null, action, options3, contextMenuProvider);
    this._register(action.onDidChange((e4) => {
      if (e4.hidden !== void 0 || e4.menuActions !== void 0) {
        this.updateClass();
      }
    }));
  }
  render(container2) {
    super.render(container2);
    this.updateClass();
  }
  updateClass() {
    super.updateClass();
    if (this.element && this.dropdownMenuActionViewItem?.element) {
      this.element.classList.toggle("hide", this._action.hidden);
      const isMenuEmpty = this._action.menuActions.length === 0;
      this.element.classList.toggle("empty", isMenuEmpty);
      this.dropdownMenuActionViewItem.element.classList.toggle("hide", isMenuEmpty);
    }
  }
};

var InstallAction = class extends ExtensionAction {
  constructor(options3, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, dialogService, preferencesService, telemetryService, contextService, allowedExtensionsService, extensionGalleryManifestService, configurationService) {
    super("extensions.install", localize(15292, null), InstallAction.CLASS, false);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.instantiationService = instantiationService;
    this.runtimeExtensionService = runtimeExtensionService;
    this.workbenchThemeService = workbenchThemeService;
    this.labelService = labelService;
    this.dialogService = dialogService;
    this.preferencesService = preferencesService;
    this.telemetryService = telemetryService;
    this.contextService = contextService;
    this.allowedExtensionsService = allowedExtensionsService;
    this.extensionGalleryManifestService = extensionGalleryManifestService;
    this.configurationService = configurationService;
    this._manifest = null;
    this.updateThrottler = this._register(new Throttler());
    this.hideOnDisabled = false;
    this.options = { isMachineScoped: false, ...options3 };
    this.update();
    this._register(allowedExtensionsService.onDidChangeAllowedExtensionsConfigValue(() => this.update()));
    this._register(this.labelService.onDidChangeFormatters(() => this.updateLabel(), this));
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent install`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  set manifest(manifest) {
    this._manifest = manifest;
    this.updateLabel();
  }
  update() {
    this.updateThrottler.queue(() => this.computeAndUpdateEnablement());
  }
  async computeAndUpdateEnablement() {
    this.enabled = false;
    this.class = InstallAction.HIDE;
    this.hidden = true;
    if (!this.extension) {
      return;
    }
    if (this.extension.isBuiltin) {
      return;
    }
    if (this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
      return;
    }
    if (this.extension.state !== 3 /* Uninstalled */) {
      return;
    }
    if (this.options.installPreReleaseVersion && (!this.extension.hasPreReleaseVersion || this.allowedExtensionsService.isAllowed({ id: this.extension.identifier.id, publisherDisplayName: this.extension.publisherDisplayName, prerelease: true }) !== true)) {
      return;
    }
    if (!this.options.installPreReleaseVersion && !this.extension.hasReleaseVersion) {
      return;
    }
    this.hidden = false;
    this.class = InstallAction.CLASS;
    if (await this.extensionsWorkbenchService.canInstall(this.extension) === true) {
      this.enabled = true;
      this.updateLabel();
    }
  }
  async run() {
    if (!this.extension) {
      return;
    }
    const verifySignature = this.configurationService.getValue(VerifyExtensionSignatureConfigKey) === true;
    if (!verifySignature) {
      this.options.donotVerifySignature = true;
    }
    if (verifySignature && this.extension.gallery && !this.extension.gallery.isSigned && shouldRequireRepositorySignatureFor(this.extension.private, await this.extensionGalleryManifestService.getExtensionGalleryManifest())) {
      const { result } = await this.dialogService.prompt({
        type: Severity2.Warning,
        message: localize(15332, null, this.extension.displayName),
        detail: localize(15333, null),
        buttons: [
          {
            label: localize(15294, null),
            run: () => {
              this.options.donotVerifySignature = true;
              return true;
            }
          }
        ],
        cancelButton: {
          run: () => false
        }
      });
      if (!result) {
        return;
      }
    }
    if (this.extension.deprecationInfo) {
      let detail2 = localize(15237, null);
      let DeprecationChoice;
      ((DeprecationChoice2) => {
        DeprecationChoice2[DeprecationChoice2["InstallAnyway"] = 0] = "InstallAnyway";
        DeprecationChoice2[DeprecationChoice2["ShowAlternateExtension"] = 1] = "ShowAlternateExtension";
        DeprecationChoice2[DeprecationChoice2["ConfigureSettings"] = 2] = "ConfigureSettings";
        DeprecationChoice2[DeprecationChoice2["Cancel"] = 3] = "Cancel";
      })(DeprecationChoice || (DeprecationChoice = {}));
      const buttons = [
        {
          label: localize(15294, null),
          run: () => 0 /* InstallAnyway */
        }
      ];
      if (this.extension.deprecationInfo.extension) {
        detail2 = localize(15239, null, this.extension.deprecationInfo.extension.displayName);
        const alternateExtension = this.extension.deprecationInfo.extension;
        buttons.push({
          label: localize(15354, null, this.extension.deprecationInfo.extension.displayName),
          run: async () => {
            const [extension2] = await this.extensionsWorkbenchService.getExtensions([{ id: alternateExtension.id, preRelease: alternateExtension.preRelease }], CancellationToken.None);
            await this.extensionsWorkbenchService.open(extension2);
            return 1 /* ShowAlternateExtension */;
          }
        });
      } else if (this.extension.deprecationInfo.settings) {
        detail2 = localize(15241, null);
        const settings = this.extension.deprecationInfo.settings;
        buttons.push({
          label: localize(15231, null),
          run: async () => {
            await this.preferencesService.openSettings({ query: settings.map((setting) => `@id:${setting}`).join(" ") });
            return 2 /* ConfigureSettings */;
          }
        });
      } else if (this.extension.deprecationInfo.additionalInfo) {
        detail2 = new MarkdownString(`${detail2} ${this.extension.deprecationInfo.additionalInfo}`);
      }
      const { result } = await this.dialogService.prompt({
        type: Severity2.Warning,
        message: localize(15296, null, this.extension.displayName),
        detail: isString(detail2) ? detail2 : void 0,
        custom: isString(detail2) ? void 0 : {
          markdownDetails: [{
            markdown: detail2
          }]
        },
        buttons,
        cancelButton: {
          run: () => 3 /* Cancel */
        }
      });
      if (result !== 0 /* InstallAnyway */) {
        return;
      }
    }
    this.extensionsWorkbenchService.open(this.extension, { showPreReleaseVersion: this.options.installPreReleaseVersion });
    alert(localize(15316, null, this.extension.displayName));
    this.telemetryService.publicLog("extensions:action:install", { ...this.extension.telemetryData, actionId: this.id });
    const extension = await this.install(this.extension);
    if (extension?.local) {
      alert(localize(15315, null, this.extension.displayName));
      const runningExtension = await this.getRunningExtension(extension.local);
      if (runningExtension && !(runningExtension.activationEvents && runningExtension.activationEvents.some((activationEent) => activationEent.startsWith("onLanguage")))) {
        const action = await this.getThemeAction(extension);
        if (action) {
          action.extension = extension;
          try {
            return action.run({ showCurrentTheme: true, ignoreFocusLost: true });
          } finally {
            action.dispose();
          }
        }
      }
    }
  }
  async getThemeAction(extension) {
    const colorThemes = await this.workbenchThemeService.getColorThemes();
    if (colorThemes.some((theme) => isThemeFromExtension(theme, extension))) {
      return this.instantiationService.createInstance(SetColorThemeAction);
    }
    const fileIconThemes = await this.workbenchThemeService.getFileIconThemes();
    if (fileIconThemes.some((theme) => isThemeFromExtension(theme, extension))) {
      return this.instantiationService.createInstance(SetFileIconThemeAction);
    }
    const productIconThemes = await this.workbenchThemeService.getProductIconThemes();
    if (productIconThemes.some((theme) => isThemeFromExtension(theme, extension))) {
      return this.instantiationService.createInstance(SetProductIconThemeAction);
    }
    return void 0;
  }
  async install(extension) {
    try {
      return await this.extensionsWorkbenchService.install(extension, this.options);
    } catch (error) {
      await this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, this.options, extension.latestVersion, 2 /* Install */, error).run();
      return void 0;
    }
  }
  async getRunningExtension(extension) {
    const runningExtension = await this.runtimeExtensionService.getExtension(extension.identifier.id);
    if (runningExtension) {
      return runningExtension;
    }
    if (this.runtimeExtensionService.canAddExtension(toExtensionDescription(extension))) {
      return new Promise((c, e4) => {
        const disposable = this.runtimeExtensionService.onDidChangeExtensions(async () => {
          const runningExtension2 = await this.runtimeExtensionService.getExtension(extension.identifier.id);
          if (runningExtension2) {
            disposable.dispose();
            c(runningExtension2);
          }
        });
      });
    }
    return null;
  }
  updateLabel() {
    this.label = this.getLabel();
  }
  getLabel(primary) {
    if (this.extension?.isWorkspaceScoped && this.extension.resourceExtension && this.contextService.isInsideWorkspace(this.extension.resourceExtension.location)) {
      return localize(15313, null);
    }
    if (this.options.installPreReleaseVersion && this.extension?.hasPreReleaseVersion) {
      return primary ? localize(15306, null) : localize(15307, null);
    }
    if (this.extension?.hasPreReleaseVersion) {
      return primary ? localize(15292, null) : localize(15310, null);
    }
    return localize(15292, null);
  }
};

InstallAction = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IWorkbenchThemeService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, IPreferencesService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IWorkspaceContextService),
  __decorateParam(10, IAllowedExtensionsService),
  __decorateParam(11, IExtensionGalleryManifestService),
  __decorateParam(12, IConfigurationService)
], InstallAction);

var InstallDropdownAction = class extends ButtonWithDropDownExtensionAction {
  set manifest(manifest) {
    this.extensionActions.forEach((a) => a.manifest = manifest);
    this.update();
  }
  constructor(instantiationService, extensionManagementService) {
    super(`extensions.installActions`, InstallAction.CLASS, [
      [
        instantiationService.createInstance(InstallAction, { installPreReleaseVersion: extensionManagementService.preferPreReleases }),
        instantiationService.createInstance(InstallAction, { installPreReleaseVersion: !extensionManagementService.preferPreReleases })
      ]
    ]);
  }
  getLabel(action) {
    return action.getLabel(true);
  }
};

InstallDropdownAction = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkbenchExtensionManagementService)
], InstallDropdownAction);

var InstallingLabelAction = class _InstallingLabelAction extends ExtensionAction {
  static {
    this.LABEL = localize(15317, null);
  }
  static {
    this.CLASS = `${ExtensionAction.LABEL_ACTION_CLASS} install installing`;
  }
  constructor() {
    super("extension.installing", _InstallingLabelAction.LABEL, _InstallingLabelAction.CLASS, false);
  }
  update() {
    this.class = `${_InstallingLabelAction.CLASS}${this.extension && this.extension.state === 0 /* Installing */ ? "" : " hide"}`;
  }
};

var InstallInOtherServerAction = class extends ExtensionAction {
  constructor(id2, server, canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
    super(id2, InstallInOtherServerAction.INSTALL_LABEL, InstallInOtherServerAction.Class, false);
    this.server = server;
    this.canInstallAnyWhere = canInstallAnyWhere;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.updateWhenCounterExtensionChanges = true;
    this.update();
  }
  static {
    this.INSTALL_LABEL = localize(15292, null);
  }
  static {
    this.INSTALLING_LABEL = localize(15317, null);
  }
  static {
    this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} prominent install-other-server`;
  }
  static {
    this.InstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} install-other-server installing`;
  }
  update() {
    this.enabled = false;
    this.class = InstallInOtherServerAction.Class;
    if (this.canInstall()) {
      const extensionInOtherServer = this.extensionsWorkbenchService.installed.filter((e4) => areSameExtensions(e4.identifier, this.extension.identifier) && e4.server === this.server)[0];
      if (extensionInOtherServer) {
        if (extensionInOtherServer.state === 0 /* Installing */ && !extensionInOtherServer.local) {
          this.enabled = true;
          this.label = InstallInOtherServerAction.INSTALLING_LABEL;
          this.class = InstallInOtherServerAction.InstallingClass;
        }
      } else {
        this.enabled = true;
        this.label = this.getInstallLabel();
      }
    }
  }
  canInstall() {
    if (!this.extension || !this.server || !this.extension.local || this.extension.state !== 1 /* Installed */ || this.extension.type !== 1 /* User */ || this.extension.enablementState === 2 /* DisabledByEnvironment */ || this.extension.enablementState === 0 /* DisabledByTrustRequirement */ || this.extension.enablementState === 5 /* DisabledByVirtualWorkspace */) {
      return false;
    }
    if (isLanguagePackExtension(this.extension.local.manifest)) {
      return true;
    }
    if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
      return true;
    }
    if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
      return true;
    }
    if (this.server === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWeb(this.extension.local.manifest)) {
      return true;
    }
    if (this.canInstallAnyWhere) {
      if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnUI(this.extension.local.manifest)) {
        return true;
      }
      if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWorkspace(this.extension.local.manifest)) {
        return true;
      }
    }
    return false;
  }
  async run() {
    if (!this.extension?.local) {
      return;
    }
    if (!this.extension?.server) {
      return;
    }
    if (!this.server) {
      return;
    }
    this.extensionsWorkbenchService.open(this.extension);
    alert(localize(15316, null, this.extension.displayName));
    return this.extensionsWorkbenchService.installInServer(this.extension, this.server);
  }
};

InstallInOtherServerAction = __decorateClass([
  __decorateParam(3, IExtensionsWorkbenchService),
  __decorateParam(4, IExtensionManagementServerService),
  __decorateParam(5, IExtensionManifestPropertiesService)
], InstallInOtherServerAction);

var RemoteInstallAction = class extends InstallInOtherServerAction {
  constructor(canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
    super(`extensions.remoteinstall`, extensionManagementServerService.remoteExtensionManagementServer, canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
  }
  getInstallLabel() {
    return this.extensionManagementServerService.remoteExtensionManagementServer ? localize(15299, null, this.extensionManagementServerService.remoteExtensionManagementServer.label) : InstallInOtherServerAction.INSTALL_LABEL;
  }
};

RemoteInstallAction = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IExtensionManagementServerService),
  __decorateParam(3, IExtensionManifestPropertiesService)
], RemoteInstallAction);

var LocalInstallAction = class extends InstallInOtherServerAction {
  constructor(extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
    super(`extensions.localinstall`, extensionManagementServerService.localExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
  }
  getInstallLabel() {
    return localize(15304, null);
  }
};

LocalInstallAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IExtensionManagementServerService),
  __decorateParam(2, IExtensionManifestPropertiesService)
], LocalInstallAction);

var WebInstallAction = class extends InstallInOtherServerAction {
  constructor(extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
    super(`extensions.webInstall`, extensionManagementServerService.webExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
  }
  getInstallLabel() {
    return localize(15295, null);
  }
};

WebInstallAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IExtensionManagementServerService),
  __decorateParam(2, IExtensionManifestPropertiesService)
], WebInstallAction);

var UninstallAction = class extends ExtensionAction {
  constructor(extensionsWorkbenchService, userDataProfilesService, dialogService) {
    super("extensions.uninstall", UninstallAction.UninstallLabel, UninstallAction.UninstallClass, false);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.userDataProfilesService = userDataProfilesService;
    this.dialogService = dialogService;
    this.update();
  }
  static {
    this.UninstallLabel = localize(15365, null);
  }
  static {
    this.UninstallingLabel = localize(15370, null);
  }
  static {
    this.UninstallClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall`;
  }
  static {
    this.UnInstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall uninstalling`;
  }
  update() {
    if (!this.extension) {
      this.enabled = false;
      return;
    }
    const state = this.extension.state;
    if (state === 2 /* Uninstalling */) {
      this.label = UninstallAction.UninstallingLabel;
      this.class = UninstallAction.UnInstallingClass;
      this.enabled = false;
      return;
    }
    this.label = this.extension.local?.isApplicationScoped && this.userDataProfilesService.profiles.length > 1 ? localize(15366, null) : UninstallAction.UninstallLabel;
    this.class = UninstallAction.UninstallClass;
    this.tooltip = UninstallAction.UninstallLabel;
    if (state !== 1 /* Installed */) {
      this.enabled = false;
      return;
    }
    this.enabled = true;
  }
  async run() {
    if (!this.extension) {
      return;
    }
    alert(localize(15369, null, this.extension.displayName));
    try {
      await this.extensionsWorkbenchService.uninstall(this.extension);
      alert(localize(15368, null, this.extension.displayName));
    } catch (error) {
      if (!isCancellationError(error)) {
        this.dialogService.error(getErrorMessage(error));
      }
    }
  }
};

UninstallAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IDialogService)
], UninstallAction);

var UpdateAction = class extends ExtensionAction {
  constructor(verbose, extensionsWorkbenchService, dialogService, openerService, instantiationService) {
    super(`extensions.update`, localize(15371, null), UpdateAction.DisabledClass, false);
    this.verbose = verbose;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.dialogService = dialogService;
    this.openerService = openerService;
    this.instantiationService = instantiationService;
    this.updateThrottler = this._register(new Throttler());
    this.update();
  }
  static {
    this.EnabledClass = `${this.LABEL_ACTION_CLASS} update`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} disabled`;
  }
  update() {
    this.updateThrottler.queue(() => this.computeAndUpdateEnablement());
    if (this.extension) {
      this.label = this.verbose ? localize(15374, null, this.extension.latestVersion) : localize(15371, null);
    }
  }
  async computeAndUpdateEnablement() {
    this.enabled = false;
    this.class = UpdateAction.DisabledClass;
    if (!this.extension) {
      return;
    }
    if (this.extension.deprecationInfo) {
      return;
    }
    const canInstall = await this.extensionsWorkbenchService.canInstall(this.extension);
    const isInstalled = this.extension.state === 1 /* Installed */;
    this.enabled = canInstall === true && isInstalled && this.extension.outdated;
    this.class = this.enabled ? UpdateAction.EnabledClass : UpdateAction.DisabledClass;
  }
  async run() {
    if (!this.extension) {
      return;
    }
    const consent = await this.extensionsWorkbenchService.shouldRequireConsentToUpdate(this.extension);
    if (consent) {
      const { result } = await this.dialogService.prompt({
        type: "warning",
        title: localize(15378, null, this.extension.displayName),
        message: localize(15377, null, consent),
        buttons: [{
          label: localize(15371, null),
          run: () => "update"
        }, {
          label: localize(15344, null),
          run: () => "review"
        }, {
          label: localize(15226, null),
          run: () => "cancel"
        }]
      });
      if (result === "cancel") {
        return;
      }
      if (result === "review") {
        if (this.extension.hasChangelog()) {
          return this.extensionsWorkbenchService.open(this.extension, { tab: "changelog" /* Changelog */ });
        }
        if (this.extension.repository) {
          return this.openerService.open(this.extension.repository);
        }
        return this.extensionsWorkbenchService.open(this.extension);
      }
    }
    const installOptions = {};
    if (this.extension.local?.source === "vsix" && this.extension.local.pinned) {
      installOptions.pinned = false;
    }
    if (this.extension.local?.preRelease) {
      installOptions.installPreReleaseVersion = true;
    }
    try {
      alert(localize(15379, null, this.extension.displayName, this.extension.latestVersion));
      await this.extensionsWorkbenchService.install(this.extension, installOptions);
      alert(localize(15376, null, this.extension.displayName, this.extension.latestVersion));
    } catch (err) {
      this.instantiationService.createInstance(PromptExtensionInstallFailureAction, this.extension, installOptions, this.extension.latestVersion, 3 /* Update */, err).run();
    }
  }
};

UpdateAction = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IInstantiationService)
], UpdateAction);

var ToggleAutoUpdateForExtensionAction = class extends ExtensionAction {
  constructor(extensionsWorkbenchService, extensionEnablementService, allowedExtensionsService, configurationService) {
    super(ToggleAutoUpdateForExtensionAction.ID, ToggleAutoUpdateForExtensionAction.LABEL.value, ToggleAutoUpdateForExtensionAction.DisabledClass);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.allowedExtensionsService = allowedExtensionsService;
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(AutoUpdateConfigurationKey)) {
        this.update();
      }
    }));
    this._register(allowedExtensionsService.onDidChangeAllowedExtensionsConfigValue((e4) => this.update()));
    this.update();
  }
  static {
    this.ID = "workbench.extensions.action.toggleAutoUpdateForExtension";
  }
  static {
    this.LABEL = localize2(15263, "Auto Update");
  }
  static {
    this.EnabledClass = `${ExtensionAction.EXTENSION_ACTION_CLASS} auto-update`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} hide`;
  }
  update() {
    this.enabled = false;
    this.class = ToggleAutoUpdateForExtensionAction.DisabledClass;
    if (!this.extension) {
      return;
    }
    if (this.extension.isBuiltin) {
      return;
    }
    if (this.extension.deprecationInfo?.disallowInstall) {
      return;
    }
    const extension = this.extension.local ?? this.extension.gallery;
    if (extension && this.allowedExtensionsService.isAllowed(extension) !== true) {
      return;
    }
    if (this.extensionsWorkbenchService.getAutoUpdateValue() === "on" && !this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState)) {
      return;
    }
    this.enabled = true;
    this.class = ToggleAutoUpdateForExtensionAction.EnabledClass;
    this.checked = this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension);
  }
  async run() {
    if (!this.extension) {
      return;
    }
    const enableAutoUpdate = !this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension);
    await this.extensionsWorkbenchService.updateAutoUpdateEnablementFor(this.extension, enableAutoUpdate);
    if (enableAutoUpdate) {
      alert(localize(15262, null, this.extension.displayName));
    } else {
      alert(localize(15247, null, this.extension.displayName));
    }
  }
};

ToggleAutoUpdateForExtensionAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IWorkbenchExtensionEnablementService),
  __decorateParam(2, IAllowedExtensionsService),
  __decorateParam(3, IConfigurationService)
], ToggleAutoUpdateForExtensionAction);

var ToggleAutoUpdatesForPublisherAction = class extends ExtensionAction {
  constructor(extensionsWorkbenchService) {
    super(ToggleAutoUpdatesForPublisherAction.ID, ToggleAutoUpdatesForPublisherAction.LABEL);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
  }
  static {
    this.ID = "workbench.extensions.action.toggleAutoUpdatesForPublisher";
  }
  static {
    this.LABEL = localize(15360, null);
  }
  update() {
  }
  async run() {
    if (!this.extension) {
      return;
    }
    alert(localize(15291, null, this.extension.publisherDisplayName));
    const enableAutoUpdate = !this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension.publisher);
    await this.extensionsWorkbenchService.updateAutoUpdateEnablementFor(this.extension.publisher, enableAutoUpdate);
    if (enableAutoUpdate) {
      alert(localize(15262, null, this.extension.displayName));
    } else {
      alert(localize(15247, null, this.extension.displayName));
    }
  }
};

ToggleAutoUpdatesForPublisherAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService)
], ToggleAutoUpdatesForPublisherAction);

var MigrateDeprecatedExtensionAction = class extends ExtensionAction {
  constructor(small, extensionsWorkbenchService) {
    super("extensionsAction.migrateDeprecatedExtension", localize(15327, null), MigrateDeprecatedExtensionAction.DisabledClass, false);
    this.small = small;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.update();
  }
  static {
    this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} migrate`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} disabled`;
  }
  update() {
    this.enabled = false;
    this.class = MigrateDeprecatedExtensionAction.DisabledClass;
    if (!this.extension?.local) {
      return;
    }
    if (this.extension.state !== 1 /* Installed */) {
      return;
    }
    if (!this.extension.deprecationInfo?.extension) {
      return;
    }
    const id2 = this.extension.deprecationInfo.extension.id;
    if (this.extensionsWorkbenchService.local.some((e4) => areSameExtensions(e4.identifier, { id: id2 }))) {
      return;
    }
    this.enabled = true;
    this.class = MigrateDeprecatedExtensionAction.EnabledClass;
    this.tooltip = localize(15326, null, this.extension.deprecationInfo.extension.displayName);
    this.label = this.small ? localize(15325, null) : this.tooltip;
  }
  async run() {
    if (!this.extension?.deprecationInfo?.extension) {
      return;
    }
    const local = this.extension.local;
    await this.extensionsWorkbenchService.uninstall(this.extension);
    const [extension] = await this.extensionsWorkbenchService.getExtensions([{ id: this.extension.deprecationInfo.extension.id, preRelease: this.extension.deprecationInfo?.extension?.preRelease }], CancellationToken.None);
    await this.extensionsWorkbenchService.install(extension, { isMachineScoped: local?.isMachineScoped });
  }
};

MigrateDeprecatedExtensionAction = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService)
], MigrateDeprecatedExtensionAction);

var DropDownExtensionAction = class extends ExtensionAction {
  constructor(id2, label3, cssClass, enabled, instantiationService) {
    super(id2, label3, cssClass, enabled);
    this.instantiationService = instantiationService;
    this._actionViewItem = null;
  }
  createActionViewItem(options3) {
    this._actionViewItem = this.instantiationService.createInstance(DropDownExtensionActionViewItem, this, options3);
    return this._actionViewItem;
  }
  run(actionGroups) {
    this._actionViewItem?.showMenu(actionGroups);
    return Promise.resolve();
  }
};

DropDownExtensionAction = __decorateClass([
  __decorateParam(4, IInstantiationService)
], DropDownExtensionAction);

var DropDownExtensionActionViewItem = class extends ActionViewItem {
  constructor(action, options3, contextMenuService) {
    super(null, action, { ...options3, icon: true, label: true });
    this.contextMenuService = contextMenuService;
  }
  showMenu(menuActionGroups) {
    if (this.element) {
      const actions = this.getActions(menuActionGroups);
      this.contextMenuService.showContextMenu({
        ...getWorkbenchMenuMotionContextMenuOptions(this.element),
        getActions: () => actions,
        actionRunner: this.actionRunner,
        onHide: () => disposeIfDisposable(actions)
      });
    }
  }
  getActions(menuActionGroups) {
    let actions = [];
    for (const menuActions of menuActionGroups) {
      actions = [...actions, ...menuActions, new Separator()];
    }
    return actions.length ? actions.slice(0, actions.length - 1) : actions;
  }
};

DropDownExtensionActionViewItem = __decorateClass([
  __decorateParam(2, IContextMenuService)
], DropDownExtensionActionViewItem);

async function getContextMenuActionsGroups(extension, contextKeyService, instantiationService) {
  return instantiationService.invokeFunction(async (accessor) => {
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
    const menuService = accessor.get(IMenuService);
    const extensionRecommendationsService = accessor.get(IExtensionRecommendationsService);
    const extensionIgnoredRecommendationsService = accessor.get(IExtensionIgnoredRecommendationsService);
    const workbenchThemeService = accessor.get(IWorkbenchThemeService);
    const authenticationUsageService = accessor.get(IAuthenticationUsageService);
    const allowedExtensionsService = accessor.get(IAllowedExtensionsService);
    const cksOverlay = [];
    if (extension) {
      cksOverlay.push(["extension", extension.identifier.id]);
      cksOverlay.push(["isBuiltinExtension", extension.isBuiltin]);
      cksOverlay.push(["isDefaultApplicationScopedExtension", extension.local && isApplicationScopedExtension(extension.local.manifest)]);
      cksOverlay.push(["isApplicationScopedExtension", extension.local && extension.local.isApplicationScoped]);
      cksOverlay.push(["isWorkspaceScopedExtension", extension.isWorkspaceScoped]);
      cksOverlay.push(["isGalleryExtension", !!extension.identifier.uuid]);
      if (extension.local) {
        cksOverlay.push(["extensionSource", extension.local.source]);
      }
      cksOverlay.push(["extensionHasConfiguration", extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.configuration]);
      cksOverlay.push(["extensionHasKeybindings", extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.keybindings]);
      cksOverlay.push(["extensionHasCommands", extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes?.commands]);
      cksOverlay.push(["isExtensionRecommended", !!extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]]);
      cksOverlay.push(["isExtensionWorkspaceRecommended", extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]?.reasonId === 0 /* Workspace */]);
      cksOverlay.push(["isUserIgnoredRecommendation", extensionIgnoredRecommendationsService.globalIgnoredRecommendations.some((e4) => e4 === extension.identifier.id.toLowerCase())]);
      cksOverlay.push(["isExtensionPinned", extension.pinned]);
      cksOverlay.push(["isExtensionEnabled", extensionEnablementService.isEnabledEnablementState(extension.enablementState)]);
      switch (extension.state) {
        case 0 /* Installing */:
          cksOverlay.push(["extensionStatus", "installing"]);
          break;
        case 1 /* Installed */:
          cksOverlay.push(["extensionStatus", "installed"]);
          break;
        case 2 /* Uninstalling */:
          cksOverlay.push(["extensionStatus", "uninstalling"]);
          break;
        case 3 /* Uninstalled */:
          cksOverlay.push(["extensionStatus", "uninstalled"]);
          break;
      }
      cksOverlay.push(["installedExtensionIsPreReleaseVersion", !!extension.local?.isPreReleaseVersion]);
      cksOverlay.push(["installedExtensionIsOptedToPreRelease", !!extension.local?.preRelease]);
      cksOverlay.push(["galleryExtensionIsPreReleaseVersion", !!extension.gallery?.properties.isPreReleaseVersion]);
      cksOverlay.push(["galleryExtensionHasPreReleaseVersion", extension.gallery?.hasPreReleaseVersion]);
      cksOverlay.push(["extensionHasPreReleaseVersion", extension.hasPreReleaseVersion]);
      cksOverlay.push(["extensionHasReleaseVersion", extension.hasReleaseVersion]);
      cksOverlay.push(["extensionDisallowInstall", extension.isMalicious || extension.deprecationInfo?.disallowInstall]);
      cksOverlay.push(["isExtensionAllowed", allowedExtensionsService.isAllowed({ id: extension.identifier.id, publisherDisplayName: extension.publisherDisplayName }) === true]);
      cksOverlay.push(["isPreReleaseExtensionAllowed", allowedExtensionsService.isAllowed({ id: extension.identifier.id, publisherDisplayName: extension.publisherDisplayName, prerelease: true }) === true]);
      cksOverlay.push(["extensionIsUnsigned", extension.gallery && !extension.gallery.isSigned]);
      cksOverlay.push(["extensionIsPrivate", extension.gallery?.private]);
      const [colorThemes, fileIconThemes, productIconThemes, extensionUsesAuth] = await Promise.all([workbenchThemeService.getColorThemes(), workbenchThemeService.getFileIconThemes(), workbenchThemeService.getProductIconThemes(), authenticationUsageService.extensionUsesAuth(extension.identifier.id.toLowerCase())]);
      cksOverlay.push(["extensionHasColorThemes", colorThemes.some((theme) => isThemeFromExtension(theme, extension))]);
      cksOverlay.push(["extensionHasFileIconThemes", fileIconThemes.some((theme) => isThemeFromExtension(theme, extension))]);
      cksOverlay.push(["extensionHasProductIconThemes", productIconThemes.some((theme) => isThemeFromExtension(theme, extension))]);
      cksOverlay.push(["extensionHasAccountPreferences", extensionUsesAuth]);
      cksOverlay.push(["canSetLanguage", extensionsWorkbenchService.canSetLanguage(extension)]);
      cksOverlay.push(["isActiveLanguagePackExtension", extension.gallery && language === getLocale(extension.gallery)]);
    }
    const actionsGroups = menuService.getMenuActions(MenuId.ExtensionContext, contextKeyService.createOverlay(cksOverlay), { shouldForwardArgs: true });
    return actionsGroups;
  });
}

function toActions(actionsGroups, instantiationService) {
  const result = [];
  for (const [, actions] of actionsGroups) {
    result.push(actions.map((action) => {
      if (action instanceof SubmenuAction) {
        return action;
      }
      return instantiationService.createInstance(MenuItemExtensionAction, action);
    }));
  }
  return result;
}

async function getContextMenuActions2(extension, contextKeyService, instantiationService) {
  const actionsGroups = await getContextMenuActionsGroups(extension, contextKeyService, instantiationService);
  return toActions(actionsGroups, instantiationService);
}

var ManageExtensionAction2 = class extends DropDownExtensionAction {
  constructor(instantiationService, extensionService, contextKeyService, productService) {
    super(ManageExtensionAction2.ID, "", "", true, instantiationService);
    this.extensionService = extensionService;
    this.contextKeyService = contextKeyService;
    this.productService = productService;
    this.tooltip = localize(15323, null);
    this.update();
  }
  static {
    this.ID = "extensions.manage";
  }
  static {
    this.Class = `${ExtensionAction.ICON_ACTION_CLASS} manage ` + ThemeIcon.asClassName(manageExtensionIcon);
  }
  static {
    this.HideManageExtensionClass = `${this.Class} hide`;
  }
  async getActionGroups() {
    const groups = [];
    const contextMenuActionsGroups = await getContextMenuActionsGroups(this.extension, this.contextKeyService, this.instantiationService);
    const themeActions = [], installActions = [], updateActions = [], otherActionGroups = [];
    for (const [group2, actions] of contextMenuActionsGroups) {
      if (group2 === INSTALL_ACTIONS_GROUP) {
        installActions.push(...toActions([[group2, actions]], this.instantiationService)[0]);
      } else if (group2 === UPDATE_ACTIONS_GROUP) {
        updateActions.push(...toActions([[group2, actions]], this.instantiationService)[0]);
      } else if (group2 === THEME_ACTIONS_GROUP) {
        themeActions.push(...toActions([[group2, actions]], this.instantiationService)[0]);
      } else {
        otherActionGroups.push(...toActions([[group2, actions]], this.instantiationService));
      }
    }
    if (themeActions.length) {
      groups.push(themeActions);
    }
    const isChatExtension = this.extension && ExtensionIdentifier.equals(this.extension.identifier.id, this.productService.defaultChatAgent?.chatExtensionId);
    if (isChatExtension) {
      groups.push([
        this.instantiationService.createInstance(EnableAIFeaturesGloballyAction),
        this.instantiationService.createInstance(EnableAIFeaturesInWorkspaceAction)
      ]);
      groups.push([
        this.instantiationService.createInstance(DisableAIFeaturesGloballyAction),
        this.instantiationService.createInstance(DisableAIFeaturesInWorkspaceAction)
      ]);
    } else {
      groups.push([
        this.instantiationService.createInstance(EnableGloballyAction),
        this.instantiationService.createInstance(EnableForWorkspaceAction)
      ]);
      groups.push([
        this.instantiationService.createInstance(DisableGloballyAction),
        this.instantiationService.createInstance(DisableForWorkspaceAction)
      ]);
    }
    if (updateActions.length) {
      groups.push(updateActions);
    }
    groups.push([
      ...installActions.length ? installActions : [],
      this.instantiationService.createInstance(InstallAnotherVersionAction, this.extension, false),
      this.instantiationService.createInstance(UninstallAction)
    ]);
    otherActionGroups.forEach((actions) => groups.push(actions));
    groups.forEach((group2) => group2.forEach((extensionAction) => {
      if (extensionAction instanceof ExtensionAction) {
        extensionAction.extension = this.extension;
      }
    }));
    return groups;
  }
  async run() {
    await this.extensionService.whenInstalledExtensionsRegistered();
    return super.run(await this.getActionGroups());
  }
  update() {
    this.class = ManageExtensionAction2.HideManageExtensionClass;
    this.enabled = false;
    if (this.extension) {
      const state = this.extension.state;
      this.enabled = state === 1 /* Installed */;
      this.class = this.enabled || state === 2 /* Uninstalling */ ? ManageExtensionAction2.Class : ManageExtensionAction2.HideManageExtensionClass;
    }
  }
};

ManageExtensionAction2 = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IProductService)
], ManageExtensionAction2);

var MenuItemExtensionAction = class extends ExtensionAction {
  constructor(action, extensionsWorkbenchService) {
    super(action.id, action.label);
    this.action = action;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
  }
  get enabled() {
    return this.action.enabled;
  }
  set enabled(value2) {
    this.action.enabled = value2;
  }
  update() {
    if (!this.extension) {
      return;
    }
    if (this.action.id === TOGGLE_IGNORE_EXTENSION_ACTION_ID) {
      this.checked = !this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
    } else if (this.action.id === ToggleAutoUpdateForExtensionAction.ID) {
      this.checked = this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension);
    } else if (this.action.id === ToggleAutoUpdatesForPublisherAction.ID) {
      this.checked = this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension.publisher);
    } else {
      this.checked = this.action.checked;
    }
  }
  async run() {
    if (this.extension) {
      const id2 = this.extension.local ? getExtensionId(this.extension.local.manifest.publisher, this.extension.local.manifest.name) : this.extension.gallery ? getExtensionId(this.extension.gallery.publisher, this.extension.gallery.name) : this.extension.identifier.id;
      const extensionArg = {
        id: this.extension.identifier.id,
        version: this.extension.version,
        location: this.extension.local?.location,
        galleryLink: this.extension.url
      };
      await this.action.run(id2, extensionArg);
    }
  }
};

MenuItemExtensionAction = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService)
], MenuItemExtensionAction);

var TogglePreReleaseExtensionAction = class extends ExtensionAction {
  constructor(extensionsWorkbenchService, allowedExtensionsService) {
    super(TogglePreReleaseExtensionAction.ID, TogglePreReleaseExtensionAction.LABEL, TogglePreReleaseExtensionAction.DisabledClass);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.allowedExtensionsService = allowedExtensionsService;
    this._register(allowedExtensionsService.onDidChangeAllowedExtensionsConfigValue(() => this.update()));
    this.update();
  }
  static {
    this.ID = "workbench.extensions.action.togglePreRlease";
  }
  static {
    this.LABEL = localize(15363, null);
  }
  static {
    this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} prominent pre-release`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} hide`;
  }
  update() {
    this.enabled = false;
    this.class = TogglePreReleaseExtensionAction.DisabledClass;
    if (!this.extension) {
      return;
    }
    if (this.extension.isBuiltin) {
      return;
    }
    if (this.extension.state !== 1 /* Installed */) {
      return;
    }
    if (!this.extension.hasPreReleaseVersion) {
      return;
    }
    if (!this.extension.gallery) {
      return;
    }
    if (this.extension.preRelease) {
      if (!this.extension.isPreReleaseVersion) {
        return;
      }
      if (this.allowedExtensionsService.isAllowed({ id: this.extension.identifier.id, publisherDisplayName: this.extension.publisherDisplayName }) !== true) {
        return;
      }
    }
    if (!this.extension.preRelease) {
      if (!this.extension.gallery.hasPreReleaseVersion) {
        return;
      }
      if (this.allowedExtensionsService.isAllowed(this.extension.gallery) !== true) {
        return;
      }
    }
    this.enabled = true;
    this.class = TogglePreReleaseExtensionAction.EnabledClass;
    if (this.extension.preRelease) {
      this.label = localize(15361, null);
      this.tooltip = localize(15362, null);
    } else {
      this.label = localize(15356, null);
      this.tooltip = localize(15357, null);
    }
  }
  async run() {
    if (!this.extension) {
      return;
    }
    this.extensionsWorkbenchService.open(this.extension, { showPreReleaseVersion: !this.extension.preRelease });
    await this.extensionsWorkbenchService.togglePreRelease(this.extension);
  }
};

TogglePreReleaseExtensionAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IAllowedExtensionsService)
], TogglePreReleaseExtensionAction);

var InstallAnotherVersionAction = class extends ExtensionAction {
  constructor(extension, whenInstalled, extensionsWorkbenchService, extensionManagementService, extensionGalleryService, quickInputService, instantiationService, dialogService, allowedExtensionsService) {
    super(InstallAnotherVersionAction.ID, InstallAnotherVersionAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
    this.whenInstalled = whenInstalled;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionManagementService = extensionManagementService;
    this.extensionGalleryService = extensionGalleryService;
    this.quickInputService = quickInputService;
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    this.allowedExtensionsService = allowedExtensionsService;
    this._register(allowedExtensionsService.onDidChangeAllowedExtensionsConfigValue(() => this.update()));
    this.extension = extension;
    this.update();
  }
  static {
    this.ID = "workbench.extensions.action.install.anotherVersion";
  }
  static {
    this.LABEL = localize(15293, null);
  }
  update() {
    this.enabled = !!this.extension && !this.extension.isBuiltin && !!this.extension.identifier.uuid && !this.extension.deprecationInfo && this.allowedExtensionsService.isAllowed({ id: this.extension.identifier.id, publisherDisplayName: this.extension.publisherDisplayName }) === true;
    if (this.enabled && this.whenInstalled) {
      this.enabled = !!this.extension?.local && !!this.extension.server && this.extension.state === 1 /* Installed */;
    }
  }
  async run() {
    if (!this.enabled) {
      return;
    }
    if (!this.extension) {
      return;
    }
    const targetPlatform = this.extension.server ? await this.extension.server.extensionManagementService.getTargetPlatform() : await this.extensionManagementService.getTargetPlatform();
    const allVersions = await this.extensionGalleryService.getAllCompatibleVersions(this.extension.identifier, this.extension.local?.preRelease ?? this.extension.gallery?.properties.isPreReleaseVersion ?? false, targetPlatform);
    if (!allVersions.length) {
      await this.dialogService.info(localize(15331, null));
      return;
    }
    const picks = allVersions.map((v2, i2) => {
      return {
        id: v2.version,
        label: v2.version,
        description: `${fromNow(new Date(Date.parse(v2.date)), true)}${v2.isPreReleaseVersion ? ` (${localize(15336, null)})` : ""}${v2.version === this.extension?.local?.manifest.version ? ` (${localize(15234, null)})` : ""}`,
        ariaLabel: `${v2.isPreReleaseVersion ? "Pre-Release version" : "Release version"} ${v2.version}`,
        isPreReleaseVersion: v2.isPreReleaseVersion
      };
    });
    const pick = await this.quickInputService.pick(
      picks,
      {
        placeHolder: localize(15352, null),
        matchOnDetail: true
      }
    );
    if (pick) {
      if (this.extension.local?.manifest.version === pick.id) {
        return;
      }
      const options3 = { installPreReleaseVersion: pick.isPreReleaseVersion, version: pick.id };
      try {
        await this.extensionsWorkbenchService.install(this.extension, options3);
      } catch (error) {
        this.instantiationService.createInstance(PromptExtensionInstallFailureAction, this.extension, options3, pick.id, 2 /* Install */, error).run();
      }
    }
    return null;
  }
};

InstallAnotherVersionAction = __decorateClass([
  __decorateParam(2, IExtensionsWorkbenchService),
  __decorateParam(3, IWorkbenchExtensionManagementService),
  __decorateParam(4, IExtensionGalleryService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, IAllowedExtensionsService)
], InstallAnotherVersionAction);

var EnableForWorkspaceAction = class extends ExtensionAction {
  constructor(extensionsWorkbenchService, extensionEnablementService, productService) {
    super(EnableForWorkspaceAction.ID, EnableForWorkspaceAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.productService = productService;
    this.tooltip = localize(15270, null);
    this.update();
  }
  static {
    this.ID = "extensions.enableForWorkspace";
  }
  static {
    this.LABEL = localize(15269, null);
  }
  update() {
    this.enabled = false;
    if (this.extension && this.extension.local && !this.extension.isWorkspaceScoped) {
      if (ExtensionIdentifier.equals(this.extension.identifier.id, this.productService.defaultChatAgent?.chatExtensionId)) {
        return;
      }
      this.enabled = this.extension.state === 1 /* Installed */ && !this.extensionEnablementService.isEnabled(this.extension.local) && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
    }
  }
  async run() {
    if (!this.extension) {
      return;
    }
    return this.extensionsWorkbenchService.setEnablement(this.extension, 13 /* EnabledWorkspace */);
  }
};

EnableForWorkspaceAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IWorkbenchExtensionEnablementService),
  __decorateParam(2, IProductService)
], EnableForWorkspaceAction);

var EnableGloballyAction = class extends ExtensionAction {
  constructor(extensionsWorkbenchService, extensionEnablementService, productService) {
    super(EnableGloballyAction.ID, EnableGloballyAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.productService = productService;
    this.tooltip = localize(15272, null);
    this.update();
  }
  static {
    this.ID = "extensions.enableGlobally";
  }
  static {
    this.LABEL = localize(15271, null);
  }
  update() {
    this.enabled = false;
    if (this.extension && this.extension.local && !this.extension.isWorkspaceScoped) {
      if (ExtensionIdentifier.equals(this.extension.identifier.id, this.productService.defaultChatAgent?.chatExtensionId)) {
        return;
      }
      this.enabled = this.extension.state === 1 /* Installed */ && this.extensionEnablementService.isDisabledGlobally(this.extension.local) && this.extensionEnablementService.canChangeEnablement(this.extension.local);
    }
  }
  async run() {
    if (!this.extension) {
      return;
    }
    return this.extensionsWorkbenchService.setEnablement(this.extension, 12 /* EnabledGlobally */);
  }
};

EnableGloballyAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IWorkbenchExtensionEnablementService),
  __decorateParam(2, IProductService)
], EnableGloballyAction);

var DisableForWorkspaceAction = class extends ExtensionAction {
  constructor(workspaceContextService, extensionsWorkbenchService, extensionEnablementService, extensionService, productService) {
    super(DisableForWorkspaceAction.ID, DisableForWorkspaceAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
    this.workspaceContextService = workspaceContextService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.extensionService = extensionService;
    this.productService = productService;
    this.tooltip = localize(15253, null);
    this.update();
    this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
  }
  static {
    this.ID = "extensions.disableForWorkspace";
  }
  static {
    this.LABEL = localize(15252, null);
  }
  update() {
    this.enabled = false;
    if (this.extension && this.extension.local && !this.extension.isWorkspaceScoped && this.extensionService.extensions.some((e4) => areSameExtensions({ id: e4.identifier.value, uuid: e4.uuid }, this.extension.identifier) && this.workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */)) {
      if (ExtensionIdentifier.equals(this.extension.identifier.id, this.productService.defaultChatAgent?.chatExtensionId)) {
        return;
      }
      this.enabled = this.extension.state === 1 /* Installed */ && (this.extension.enablementState === 12 /* EnabledGlobally */ || this.extension.enablementState === 13 /* EnabledWorkspace */) && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
    }
  }
  async run() {
    if (!this.extension) {
      return;
    }
    return this.extensionsWorkbenchService.setEnablement(this.extension, 11 /* DisabledWorkspace */);
  }
};

DisableForWorkspaceAction = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IWorkbenchExtensionEnablementService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IProductService)
], DisableForWorkspaceAction);

var DisableGloballyAction = class extends ExtensionAction {
  constructor(extensionsWorkbenchService, extensionEnablementService, extensionService, productService) {
    super(DisableGloballyAction.ID, DisableGloballyAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.extensionService = extensionService;
    this.productService = productService;
    this.tooltip = localize(15255, null);
    this.update();
    this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
  }
  static {
    this.ID = "extensions.disableGlobally";
  }
  static {
    this.LABEL = localize(15254, null);
  }
  update() {
    this.enabled = false;
    if (this.extension && this.extension.local && !this.extension.isWorkspaceScoped && this.extensionService.extensions.some((e4) => areSameExtensions({ id: e4.identifier.value, uuid: e4.uuid }, this.extension.identifier))) {
      if (ExtensionIdentifier.equals(this.extension.identifier.id, this.productService.defaultChatAgent?.chatExtensionId)) {
        return;
      }
      this.enabled = this.extension.state === 1 /* Installed */ && (this.extension.enablementState === 12 /* EnabledGlobally */ || this.extension.enablementState === 13 /* EnabledWorkspace */) && this.extensionEnablementService.canChangeEnablement(this.extension.local);
    }
  }
  async run() {
    if (!this.extension) {
      return;
    }
    return this.extensionsWorkbenchService.setEnablement(this.extension, 10 /* DisabledGlobally */);
  }
};

DisableGloballyAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IWorkbenchExtensionEnablementService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IProductService)
], DisableGloballyAction);

var EnableAIFeaturesGloballyAction = class extends ExtensionAction {
  constructor(productService, configurationService) {
    super(EnableAIFeaturesGloballyAction.ID, EnableAIFeaturesGloballyAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
    this.productService = productService;
    this.configurationService = configurationService;
    this.tooltip = localize(15259, null);
    this.update();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(ChatAIDisabledSettingId)) {
        this.update();
      }
    }));
  }
  static {
    this.ID = "extensions.enableAIGlobally";
  }
  static {
    this.LABEL = localize(15258, null);
  }
  update() {
    this.enabled = false;
    if (!this.extension?.local) {
      return;
    }
    if (!ExtensionIdentifier.equals(this.extension.identifier.id, this.productService.defaultChatAgent?.chatExtensionId)) {
      return;
    }
    if (this.extension.enablementState === 11 /* DisabledWorkspace */) {
      return;
    }
    if (this.extension.enablementState === 13 /* EnabledWorkspace */) {
      return;
    }
    const inspect = this.configurationService.inspect(ChatAIDisabledSettingId);
    if (inspect?.workspaceValue === true) {
      return;
    }
    this.enabled = inspect.value === true;
  }
  async run() {
    await this.configurationService.updateValue(ChatAIDisabledSettingId, false);
  }
};

EnableAIFeaturesGloballyAction = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService)
], EnableAIFeaturesGloballyAction);

var EnableAIFeaturesInWorkspaceAction = class extends ExtensionAction {
  constructor(productService, extensionsWorkbenchService, configurationService, extensionEnablementService) {
    super(EnableAIFeaturesInWorkspaceAction.ID, EnableAIFeaturesInWorkspaceAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
    this.productService = productService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.configurationService = configurationService;
    this.extensionEnablementService = extensionEnablementService;
    this.tooltip = localize(15261, null);
    this.update();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(ChatAIDisabledSettingId)) {
        this.update();
      }
    }));
  }
  static {
    this.ID = "extensions.enableAIInWorkspace";
  }
  static {
    this.LABEL = localize(15260, null);
  }
  update() {
    this.enabled = false;
    if (!this.extension?.local) {
      return;
    }
    if (!ExtensionIdentifier.equals(this.extension.identifier.id, this.productService.defaultChatAgent?.chatExtensionId)) {
      return;
    }
    if (!this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local)) {
      return;
    }
    const inspect = this.configurationService.inspect(ChatAIDisabledSettingId);
    if (inspect.value === false) {
      return;
    }
    if (inspect?.workspaceValue === true) {
      this.enabled = true;
      return;
    }
    if (this.extension.enablementState === 13 /* EnabledWorkspace */) {
      return;
    }
    this.enabled = true;
    return;
  }
  async run() {
    if (!this.extension) {
      return;
    }
    await this.extensionsWorkbenchService.setEnablement(this.extension, 13 /* EnabledWorkspace */);
    if (this.configurationService.getValue(ChatAIDisabledSettingId) === true) {
      await this.configurationService.updateValue(ChatAIDisabledSettingId, false, 5 /* WORKSPACE */);
    }
  }
};

EnableAIFeaturesInWorkspaceAction = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkbenchExtensionEnablementService)
], EnableAIFeaturesInWorkspaceAction);

var DisableAIFeaturesGloballyAction = class extends ExtensionAction {
  constructor(productService, configurationService) {
    super(DisableAIFeaturesGloballyAction.ID, DisableAIFeaturesGloballyAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
    this.productService = productService;
    this.configurationService = configurationService;
    this.tooltip = localize(15244, null);
    this.update();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(ChatAIDisabledSettingId)) {
        this.update();
      }
    }));
  }
  static {
    this.ID = "extensions.disableAIGlobally";
  }
  static {
    this.LABEL = localize(15243, null);
  }
  update() {
    this.enabled = false;
    if (this.extension && ExtensionIdentifier.equals(this.extension.identifier.id, this.productService.defaultChatAgent?.chatExtensionId)) {
      this.enabled = this.extension.state === 1 /* Installed */ && this.configurationService.getValue(ChatAIDisabledSettingId) !== true && this.extension.enablementState !== 11 /* DisabledWorkspace */;
    }
  }
  async run() {
    await this.configurationService.updateValue(ChatAIDisabledSettingId, true);
  }
};

DisableAIFeaturesGloballyAction = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService)
], DisableAIFeaturesGloballyAction);

var DisableAIFeaturesInWorkspaceAction = class extends ExtensionAction {
  constructor(productService, extensionsWorkbenchService, extensionEnablementService, extensionService) {
    super(DisableAIFeaturesInWorkspaceAction.ID, DisableAIFeaturesInWorkspaceAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
    this.productService = productService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.extensionService = extensionService;
    this.tooltip = localize(15246, null);
    this.update();
    this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
  }
  static {
    this.ID = "extensions.disableAIInWorkspace";
  }
  static {
    this.LABEL = localize(15245, null);
  }
  update() {
    this.enabled = false;
    if (this.extension && this.extension.local && ExtensionIdentifier.equals(this.extension.identifier.id, this.productService.defaultChatAgent?.chatExtensionId)) {
      this.enabled = this.extension.state === 1 /* Installed */ && (this.extension.enablementState === 12 /* EnabledGlobally */ || this.extension.enablementState === 13 /* EnabledWorkspace */) && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
    }
  }
  async run() {
    if (!this.extension) {
      return;
    }
    await this.extensionsWorkbenchService.setEnablement(this.extension, 11 /* DisabledWorkspace */);
    await this.extensionsWorkbenchService.updateRunningExtensions(localize(15343, null));
  }
};

DisableAIFeaturesInWorkspaceAction = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IWorkbenchExtensionEnablementService),
  __decorateParam(3, IExtensionService)
], DisableAIFeaturesInWorkspaceAction);

var EnableDropDownAction = class extends ButtonWithDropDownExtensionAction {
  constructor(instantiationService) {
    super("extensions.enable", ExtensionAction.LABEL_ACTION_CLASS, [
      [
        instantiationService.createInstance(EnableGloballyAction),
        instantiationService.createInstance(EnableForWorkspaceAction)
      ],
      [
        instantiationService.createInstance(EnableAIFeaturesGloballyAction),
        instantiationService.createInstance(EnableAIFeaturesInWorkspaceAction)
      ]
    ]);
  }
};

EnableDropDownAction = __decorateClass([
  __decorateParam(0, IInstantiationService)
], EnableDropDownAction);

var DisableDropDownAction = class extends ButtonWithDropDownExtensionAction {
  constructor(instantiationService) {
    super("extensions.disable", ExtensionAction.LABEL_ACTION_CLASS, [
      [
        instantiationService.createInstance(DisableGloballyAction),
        instantiationService.createInstance(DisableForWorkspaceAction)
      ],
      [
        instantiationService.createInstance(DisableAIFeaturesGloballyAction),
        instantiationService.createInstance(DisableAIFeaturesInWorkspaceAction)
      ]
    ]);
  }
};

DisableDropDownAction = __decorateClass([
  __decorateParam(0, IInstantiationService)
], DisableDropDownAction);

var ExtensionRuntimeStateAction = class extends ExtensionAction {
  constructor(hostService, extensionsWorkbenchService, updateService, extensionService, productService, telemetryService) {
    super("extensions.runtimeState", "", ExtensionRuntimeStateAction.DisabledClass, false);
    this.hostService = hostService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.updateService = updateService;
    this.extensionService = extensionService;
    this.productService = productService;
    this.telemetryService = telemetryService;
    this.updateWhenCounterExtensionChanges = true;
    this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
    this.update();
  }
  static {
    this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} prominent reload`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} disabled`;
  }
  update() {
    this.enabled = false;
    this.tooltip = "";
    this.class = ExtensionRuntimeStateAction.DisabledClass;
    if (!this.extension) {
      return;
    }
    const state = this.extension.state;
    if (state === 0 /* Installing */ || state === 2 /* Uninstalling */) {
      return;
    }
    if (this.extension.local && this.extension.local.manifest && this.extension.local.manifest.contributes && this.extension.local.manifest.contributes.localizations && this.extension.local.manifest.contributes.localizations.length > 0) {
      return;
    }
    const runtimeState = this.extension.runtimeState;
    if (!runtimeState) {
      return;
    }
    this.enabled = true;
    this.class = ExtensionRuntimeStateAction.EnabledClass;
    this.tooltip = runtimeState.reason;
    this.label = runtimeState.action === "reloadWindow" /* ReloadWindow */ ? localize(15337, null) : runtimeState.action === "restartExtensions" /* RestartExtensions */ ? localize(15341, null) : runtimeState.action === "quitAndInstall" /* QuitAndInstall */ ? localize(15342, null) : runtimeState.action === "applyUpdate" /* ApplyUpdate */ || runtimeState.action === "downloadUpdate" /* DownloadUpdate */ ? localize(15373, null, this.productService.nameShort) : "";
  }
  async run() {
    const runtimeState = this.extension?.runtimeState;
    if (!runtimeState?.action) {
      return;
    }
    this.telemetryService.publicLog2("extensions:runtimestate:action", {
      action: runtimeState.action
    });
    if (runtimeState?.action === "reloadWindow" /* ReloadWindow */) {
      return this.hostService.reload();
    } else if (runtimeState?.action === "restartExtensions" /* RestartExtensions */) {
      return this.extensionsWorkbenchService.updateRunningExtensions();
    } else if (runtimeState?.action === "downloadUpdate" /* DownloadUpdate */) {
      return this.updateService.downloadUpdate(true);
    } else if (runtimeState?.action === "applyUpdate" /* ApplyUpdate */) {
      return this.updateService.applyUpdate();
    } else if (runtimeState?.action === "quitAndInstall" /* QuitAndInstall */) {
      return this.updateService.quitAndInstall();
    }
  }
};

ExtensionRuntimeStateAction = __decorateClass([
  __decorateParam(0, IHostService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IUpdateService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IProductService),
  __decorateParam(5, ITelemetryService)
], ExtensionRuntimeStateAction);

function isThemeFromExtension(theme, extension) {
  return !!(extension && theme.extensionData && ExtensionIdentifier.equals(theme.extensionData.extensionId, extension.identifier.id));
}

function getQuickPickEntries(themes, currentTheme, extension, showCurrentTheme) {
  const picks = [];
  for (const theme of themes) {
    if (isThemeFromExtension(theme, extension) && !(showCurrentTheme && theme === currentTheme)) {
      picks.push({ label: theme.label, id: theme.id });
    }
  }
  if (showCurrentTheme) {
    picks.push({ type: "separator", label: localize(15234, null) });
    picks.push({ label: currentTheme.label, id: currentTheme.id });
  }
  return picks;
}

var SetColorThemeAction = class extends ExtensionAction {
  constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
    super(SetColorThemeAction.ID, SetColorThemeAction.TITLE.value, SetColorThemeAction.DisabledClass, false);
    this.workbenchThemeService = workbenchThemeService;
    this.quickInputService = quickInputService;
    this.extensionEnablementService = extensionEnablementService;
    this._register(Event2.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidColorThemeChange)(() => this.update(), this));
    this.update();
  }
  static {
    this.ID = "workbench.extensions.action.setColorTheme";
  }
  static {
    this.TITLE = localize2(15383, "Set Color Theme");
  }
  static {
    this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} disabled`;
  }
  update() {
    this.workbenchThemeService.getColorThemes().then((colorThemes) => {
      this.enabled = this.computeEnablement(colorThemes);
      this.class = this.enabled ? SetColorThemeAction.EnabledClass : SetColorThemeAction.DisabledClass;
    });
  }
  computeEnablement(colorThemes) {
    return !!this.extension && this.extension.state === 1 /* Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && colorThemes.some((th) => isThemeFromExtension(th, this.extension));
  }
  async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
    const colorThemes = await this.workbenchThemeService.getColorThemes();
    if (!this.computeEnablement(colorThemes)) {
      return;
    }
    const currentTheme = this.workbenchThemeService.getColorTheme();
    const delayer5 = new Delayer(100);
    const picks = getQuickPickEntries(colorThemes, currentTheme, this.extension, showCurrentTheme);
    const pickedTheme = await this.quickInputService.pick(
      picks,
      {
        placeHolder: localize(15347, null),
        onDidFocus: (item) => delayer5.trigger(() => this.workbenchThemeService.setColorTheme(item.id, void 0)),
        ignoreFocusLost
      }
    );
    return this.workbenchThemeService.setColorTheme(pickedTheme ? pickedTheme.id : currentTheme.id, "auto");
  }
};

SetColorThemeAction = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IWorkbenchThemeService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IWorkbenchExtensionEnablementService)
], SetColorThemeAction);

var SetFileIconThemeAction = class extends ExtensionAction {
  constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
    super(SetFileIconThemeAction.ID, SetFileIconThemeAction.TITLE.value, SetFileIconThemeAction.DisabledClass, false);
    this.workbenchThemeService = workbenchThemeService;
    this.quickInputService = quickInputService;
    this.extensionEnablementService = extensionEnablementService;
    this._register(Event2.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidFileIconThemeChange)(() => this.update(), this));
    this.update();
  }
  static {
    this.ID = "workbench.extensions.action.setFileIconTheme";
  }
  static {
    this.TITLE = localize2(15385, "Set File Icon Theme");
  }
  static {
    this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} disabled`;
  }
  update() {
    this.workbenchThemeService.getFileIconThemes().then((fileIconThemes) => {
      this.enabled = this.computeEnablement(fileIconThemes);
      this.class = this.enabled ? SetFileIconThemeAction.EnabledClass : SetFileIconThemeAction.DisabledClass;
    });
  }
  computeEnablement(colorThemfileIconThemess) {
    return !!this.extension && this.extension.state === 1 /* Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && colorThemfileIconThemess.some((th) => isThemeFromExtension(th, this.extension));
  }
  async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
    const fileIconThemes = await this.workbenchThemeService.getFileIconThemes();
    if (!this.computeEnablement(fileIconThemes)) {
      return;
    }
    const currentTheme = this.workbenchThemeService.getFileIconTheme();
    const delayer5 = new Delayer(100);
    const picks = getQuickPickEntries(fileIconThemes, currentTheme, this.extension, showCurrentTheme);
    const pickedTheme = await this.quickInputService.pick(
      picks,
      {
        placeHolder: localize(15349, null),
        onDidFocus: (item) => delayer5.trigger(() => this.workbenchThemeService.setFileIconTheme(item.id, void 0)),
        ignoreFocusLost
      }
    );
    return this.workbenchThemeService.setFileIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, "auto");
  }
};

SetFileIconThemeAction = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IWorkbenchThemeService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IWorkbenchExtensionEnablementService)
], SetFileIconThemeAction);

var SetProductIconThemeAction = class extends ExtensionAction {
  constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
    super(SetProductIconThemeAction.ID, SetProductIconThemeAction.TITLE.value, SetProductIconThemeAction.DisabledClass, false);
    this.workbenchThemeService = workbenchThemeService;
    this.quickInputService = quickInputService;
    this.extensionEnablementService = extensionEnablementService;
    this._register(Event2.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidProductIconThemeChange)(() => this.update(), this));
    this.update();
  }
  static {
    this.ID = "workbench.extensions.action.setProductIconTheme";
  }
  static {
    this.TITLE = localize2(15386, "Set Product Icon Theme");
  }
  static {
    this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} disabled`;
  }
  update() {
    this.workbenchThemeService.getProductIconThemes().then((productIconThemes) => {
      this.enabled = this.computeEnablement(productIconThemes);
      this.class = this.enabled ? SetProductIconThemeAction.EnabledClass : SetProductIconThemeAction.DisabledClass;
    });
  }
  computeEnablement(productIconThemes) {
    return !!this.extension && this.extension.state === 1 /* Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && productIconThemes.some((th) => isThemeFromExtension(th, this.extension));
  }
  async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
    const productIconThemes = await this.workbenchThemeService.getProductIconThemes();
    if (!this.computeEnablement(productIconThemes)) {
      return;
    }
    const currentTheme = this.workbenchThemeService.getProductIconTheme();
    const delayer5 = new Delayer(100);
    const picks = getQuickPickEntries(productIconThemes, currentTheme, this.extension, showCurrentTheme);
    const pickedTheme = await this.quickInputService.pick(
      picks,
      {
        placeHolder: localize(15350, null),
        onDidFocus: (item) => delayer5.trigger(() => this.workbenchThemeService.setProductIconTheme(item.id, void 0)),
        ignoreFocusLost
      }
    );
    return this.workbenchThemeService.setProductIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, "auto");
  }
};

SetProductIconThemeAction = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IWorkbenchThemeService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IWorkbenchExtensionEnablementService)
], SetProductIconThemeAction);

var SetLanguageAction = class extends ExtensionAction {
  constructor(extensionsWorkbenchService) {
    super(SetLanguageAction.ID, SetLanguageAction.TITLE.value, SetLanguageAction.DisabledClass, false);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.update();
  }
  static {
    this.ID = "workbench.extensions.action.setDisplayLanguage";
  }
  static {
    this.TITLE = localize2(15384, "Set Display Language");
  }
  static {
    this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} language`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} disabled`;
  }
  update() {
    this.enabled = false;
    this.class = SetLanguageAction.DisabledClass;
    if (!this.extension) {
      return;
    }
    if (!this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
      return;
    }
    if (this.extension.gallery && language === getLocale(this.extension.gallery)) {
      return;
    }
    this.enabled = true;
    this.class = SetLanguageAction.EnabledClass;
  }
  async run() {
    return this.extension && this.extensionsWorkbenchService.setLanguage(this.extension);
  }
};

SetLanguageAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService)
], SetLanguageAction);

var ClearLanguageAction = class extends ExtensionAction {
  constructor(extensionsWorkbenchService, localeService) {
    super(ClearLanguageAction.ID, ClearLanguageAction.TITLE.value, ClearLanguageAction.DisabledClass, false);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.localeService = localeService;
    this.update();
  }
  static {
    this.ID = "workbench.extensions.action.clearLanguage";
  }
  static {
    this.TITLE = localize2(15382, "Clear Display Language");
  }
  static {
    this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} language`;
  }
  static {
    this.DisabledClass = `${this.EnabledClass} disabled`;
  }
  update() {
    this.enabled = false;
    this.class = ClearLanguageAction.DisabledClass;
    if (!this.extension) {
      return;
    }
    if (!this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
      return;
    }
    if (this.extension.gallery && language !== getLocale(this.extension.gallery)) {
      return;
    }
    this.enabled = true;
    this.class = ClearLanguageAction.EnabledClass;
  }
  async run() {
    return this.extension && this.localeService.clearLocalePreference();
  }
};

ClearLanguageAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, ILocaleService)
], ClearLanguageAction);

var ShowRecommendedExtensionAction = class extends Action {
  constructor(extensionId, extensionWorkbenchService) {
    super(ShowRecommendedExtensionAction.ID, ShowRecommendedExtensionAction.LABEL, void 0, false);
    this.extensionWorkbenchService = extensionWorkbenchService;
    this.extensionId = extensionId;
  }
  static {
    this.ID = "workbench.extensions.action.showRecommendedExtension";
  }
  static {
    this.LABEL = localize(15355, null);
  }
  async run() {
    await this.extensionWorkbenchService.openSearch(`@id:${this.extensionId}`);
    const [extension] = await this.extensionWorkbenchService.getExtensions([{ id: this.extensionId }], { source: "install-recommendation" }, CancellationToken.None);
    if (extension) {
      return this.extensionWorkbenchService.open(extension);
    }
    return null;
  }
};

ShowRecommendedExtensionAction = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService)
], ShowRecommendedExtensionAction);

var InstallRecommendedExtensionAction = class extends Action {
  constructor(extensionId, instantiationService, extensionWorkbenchService) {
    super(InstallRecommendedExtensionAction.ID, InstallRecommendedExtensionAction.LABEL, void 0, false);
    this.instantiationService = instantiationService;
    this.extensionWorkbenchService = extensionWorkbenchService;
    this.extensionId = extensionId;
  }
  static {
    this.ID = "workbench.extensions.action.installRecommendedExtension";
  }
  static {
    this.LABEL = localize(15319, null);
  }
  async run() {
    await this.extensionWorkbenchService.openSearch(`@id:${this.extensionId}`);
    const [extension] = await this.extensionWorkbenchService.getExtensions([{ id: this.extensionId }], { source: "install-recommendation" }, CancellationToken.None);
    if (extension) {
      await this.extensionWorkbenchService.open(extension);
      try {
        await this.extensionWorkbenchService.install(extension);
      } catch (err) {
        this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, void 0, extension.latestVersion, 2 /* Install */, err).run();
      }
    }
  }
};

InstallRecommendedExtensionAction = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IExtensionsWorkbenchService)
], InstallRecommendedExtensionAction);

var IgnoreExtensionRecommendationAction = class extends Action {
  constructor(extension, extensionRecommendationsManagementService) {
    super(IgnoreExtensionRecommendationAction.ID, "Ignore Recommendation");
    this.extension = extension;
    this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
    this.class = IgnoreExtensionRecommendationAction.Class;
    this.tooltip = localize(15290, null);
    this.enabled = true;
  }
  static {
    this.ID = "extensions.ignore";
  }
  static {
    this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} ignore`;
  }
  run() {
    this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, true);
    return Promise.resolve();
  }
};

IgnoreExtensionRecommendationAction = __decorateClass([
  __decorateParam(1, IExtensionIgnoredRecommendationsService)
], IgnoreExtensionRecommendationAction);

var UndoIgnoreExtensionRecommendationAction = class extends Action {
  constructor(extension, extensionRecommendationsManagementService) {
    super(UndoIgnoreExtensionRecommendationAction.ID, "Undo");
    this.extension = extension;
    this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
    this.class = UndoIgnoreExtensionRecommendationAction.Class;
    this.tooltip = localize(15364, null);
    this.enabled = true;
  }
  static {
    this.ID = "extensions.ignore";
  }
  static {
    this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} undo-ignore`;
  }
  run() {
    this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, false);
    return Promise.resolve();
  }
};

UndoIgnoreExtensionRecommendationAction = __decorateClass([
  __decorateParam(1, IExtensionIgnoredRecommendationsService)
], UndoIgnoreExtensionRecommendationAction);

var AbstractConfigureRecommendedExtensionsAction = class extends Action {
  constructor(id2, label3, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService) {
    super(id2, label3);
    this.contextService = contextService;
    this.fileService = fileService;
    this.textFileService = textFileService;
    this.editorService = editorService;
    this.jsonEditingService = jsonEditingService;
    this.textModelResolverService = textModelResolverService;
  }
  openExtensionsFile(extensionsFileResource) {
    return this.getOrCreateExtensionsFile(extensionsFileResource).then(
      ({ created, content }) => this.getSelectionPosition(content, extensionsFileResource, ["recommendations"]).then((selection) => this.editorService.openEditor({
        resource: extensionsFileResource,
        options: {
          pinned: created,
          selection
        }
      })),
      (error) => Promise.reject(new Error(localize(15335, null, error)))
    );
  }
  openWorkspaceConfigurationFile(workspaceConfigurationFile) {
    return this.getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile).then((content) => this.getSelectionPosition(content.value.toString(), content.resource, ["extensions", "recommendations"])).then((selection) => this.editorService.openEditor({
      resource: workspaceConfigurationFile,
      options: {
        selection,
        forceReload: true
        // because content has changed
      }
    }));
  }
  getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile) {
    return Promise.resolve(this.fileService.readFile(workspaceConfigurationFile)).then((content) => {
      const workspaceRecommendations = parse5(content.value.toString())["extensions"];
      if (!workspaceRecommendations || !workspaceRecommendations.recommendations) {
        return this.jsonEditingService.write(workspaceConfigurationFile, [{ path: ["extensions"], value: { recommendations: [] } }], true).then(() => this.fileService.readFile(workspaceConfigurationFile));
      }
      return content;
    });
  }
  getSelectionPosition(content, resource, path) {
    const tree = parseTree(content);
    const node = findNodeAtLocation(tree, path);
    if (node && node.parent && node.parent.children) {
      const recommendationsValueNode = node.parent.children[1];
      const lastExtensionNode = recommendationsValueNode.children && recommendationsValueNode.children.length ? recommendationsValueNode.children[recommendationsValueNode.children.length - 1] : null;
      const offset = lastExtensionNode ? lastExtensionNode.offset + lastExtensionNode.length : recommendationsValueNode.offset + 1;
      return Promise.resolve(this.textModelResolverService.createModelReference(resource)).then((reference) => {
        const position2 = reference.object.textEditorModel.getPositionAt(offset);
        reference.dispose();
        return {
          startLineNumber: position2.lineNumber,
          startColumn: position2.column,
          endLineNumber: position2.lineNumber,
          endColumn: position2.column
        };
      });
    }
    return Promise.resolve(void 0);
  }
  getOrCreateExtensionsFile(extensionsFileResource) {
    return Promise.resolve(this.fileService.readFile(extensionsFileResource)).then((content) => {
      return { created: false, extensionsFileResource, content: content.value.toString() };
    }, (err) => {
      return this.textFileService.write(extensionsFileResource, ExtensionsConfigurationInitialContent).then(() => {
        return { created: true, extensionsFileResource, content: ExtensionsConfigurationInitialContent };
      });
    });
  }
};

AbstractConfigureRecommendedExtensionsAction = __decorateClass([
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ITextFileService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IJSONEditingService),
  __decorateParam(7, ITextModelService)
], AbstractConfigureRecommendedExtensionsAction);

var ConfigureWorkspaceRecommendedExtensionsAction = class extends AbstractConfigureRecommendedExtensionsAction {
  static {
    this.ID = "workbench.extensions.action.configureWorkspaceRecommendedExtensions";
  }
  static {
    this.LABEL = localize(15233, null);
  }
  constructor(id2, label3, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService) {
    super(id2, label3, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.update(), this));
    this.update();
  }
  update() {
    this.enabled = this.contextService.getWorkbenchState() !== 1 /* EMPTY */;
  }
  run() {
    switch (this.contextService.getWorkbenchState()) {
      case 2 /* FOLDER */:
        return this.openExtensionsFile(this.contextService.getWorkspace().folders[0].toResource(EXTENSIONS_CONFIG));
      case 3 /* WORKSPACE */:
        return this.openWorkspaceConfigurationFile(this.contextService.getWorkspace().configuration);
    }
    return Promise.resolve();
  }
};

ConfigureWorkspaceRecommendedExtensionsAction = __decorateClass([
  __decorateParam(2, IFileService),
  __decorateParam(3, ITextFileService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IJSONEditingService),
  __decorateParam(7, ITextModelService)
], ConfigureWorkspaceRecommendedExtensionsAction);

var ConfigureWorkspaceFolderRecommendedExtensionsAction = class extends AbstractConfigureRecommendedExtensionsAction {
  constructor(id2, label3, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService, commandService) {
    super(id2, label3, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
    this.commandService = commandService;
  }
  static {
    this.ID = "workbench.extensions.action.configureWorkspaceFolderRecommendedExtensions";
  }
  static {
    this.LABEL = localize(15232, null);
  }
  run() {
    const folderCount = this.contextService.getWorkspace().folders.length;
    const pickFolderPromise = folderCount === 1 ? Promise.resolve(this.contextService.getWorkspace().folders[0]) : this.commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
    return Promise.resolve(pickFolderPromise).then((workspaceFolder) => {
      if (workspaceFolder) {
        return this.openExtensionsFile(workspaceFolder.toResource(EXTENSIONS_CONFIG));
      }
      return null;
    });
  }
};

ConfigureWorkspaceFolderRecommendedExtensionsAction = __decorateClass([
  __decorateParam(2, IFileService),
  __decorateParam(3, ITextFileService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IJSONEditingService),
  __decorateParam(7, ITextModelService),
  __decorateParam(8, ICommandService)
], ConfigureWorkspaceFolderRecommendedExtensionsAction);

var ExtensionStatusLabelAction = class extends Action {
  constructor(extensionService, extensionManagementServerService, extensionEnablementService) {
    super("extensions.action.statusLabel", "", ExtensionStatusLabelAction.DISABLED_CLASS, false);
    this.extensionService = extensionService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.extensionEnablementService = extensionEnablementService;
    this.initialStatus = null;
    this.status = null;
    this.version = null;
    this.enablementState = null;
    this._extension = null;
  }
  static {
    this.ENABLED_CLASS = `${ExtensionAction.TEXT_ACTION_CLASS} extension-status-label`;
  }
  static {
    this.DISABLED_CLASS = `${this.ENABLED_CLASS} hide`;
  }
  get extension() {
    return this._extension;
  }
  set extension(extension) {
    if (!(this._extension && extension && areSameExtensions(this._extension.identifier, extension.identifier))) {
      this.initialStatus = null;
      this.status = null;
      this.enablementState = null;
    }
    this._extension = extension;
    this.update();
  }
  update() {
    const label3 = this.computeLabel();
    this.label = label3 || "";
    this.class = label3 ? ExtensionStatusLabelAction.ENABLED_CLASS : ExtensionStatusLabelAction.DISABLED_CLASS;
  }
  computeLabel() {
    if (!this.extension) {
      return null;
    }
    const currentStatus = this.status;
    const currentVersion = this.version;
    const currentEnablementState = this.enablementState;
    this.status = this.extension.state;
    this.version = this.extension.version;
    if (this.initialStatus === null) {
      this.initialStatus = this.status;
    }
    this.enablementState = this.extension.enablementState;
    const canAddExtension = () => {
      const runningExtension = this.extensionService.extensions.filter((e4) => areSameExtensions({ id: e4.identifier.value, uuid: e4.uuid }, this.extension.identifier))[0];
      if (this.extension.local) {
        if (runningExtension && this.extension.version === runningExtension.version) {
          return true;
        }
        return this.extensionService.canAddExtension(toExtensionDescription(this.extension.local));
      }
      return false;
    };
    const canRemoveExtension = () => {
      if (this.extension.local) {
        if (this.extensionService.extensions.every((e4) => !(areSameExtensions({ id: e4.identifier.value, uuid: e4.uuid }, this.extension.identifier) && this.extension.server === this.extensionManagementServerService.getExtensionManagementServer(toExtension(e4))))) {
          return true;
        }
        return this.extensionService.canRemoveExtension(toExtensionDescription(this.extension.local));
      }
      return false;
    };
    if (currentStatus !== null) {
      if (currentStatus === 0 /* Installing */ && this.status === 1 /* Installed */) {
        if (this.initialStatus === 3 /* Uninstalled */ && canAddExtension()) {
          return localize(15314, null);
        }
        if (this.initialStatus === 1 /* Installed */ && this.version !== currentVersion && canAddExtension()) {
          return localize(15375, null);
        }
        return null;
      }
      if (currentStatus === 2 /* Uninstalling */ && this.status === 3 /* Uninstalled */) {
        this.initialStatus = this.status;
        return canRemoveExtension() ? localize(15367, null) : null;
      }
    }
    if (currentEnablementState !== null) {
      const currentlyEnabled = this.extensionEnablementService.isEnabledEnablementState(currentEnablementState);
      const enabled = this.extensionEnablementService.isEnabledEnablementState(this.enablementState);
      if (!currentlyEnabled && enabled) {
        return canAddExtension() ? localize(15264, null) : null;
      }
      if (currentlyEnabled && !enabled) {
        return canRemoveExtension() ? localize(15248, null) : null;
      }
    }
    return null;
  }
  run() {
    return Promise.resolve();
  }
};

ExtensionStatusLabelAction = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IExtensionManagementServerService),
  __decorateParam(2, IWorkbenchExtensionEnablementService)
], ExtensionStatusLabelAction);

var ToggleSyncExtensionAction = class extends DropDownExtensionAction {
  constructor(configurationService, extensionsWorkbenchService, userDataSyncEnablementService, instantiationService) {
    super("extensions.sync", "", ToggleSyncExtensionAction.SYNC_CLASS, false, instantiationService);
    this.configurationService = configurationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this._register(Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("settingsSync.ignoredExtensions"))(() => this.update()));
    this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.update()));
    this.update();
  }
  static {
    this.IGNORED_SYNC_CLASS = `${ExtensionAction.ICON_ACTION_CLASS} extension-sync ${ThemeIcon.asClassName(syncIgnoredIcon)}`;
  }
  static {
    this.SYNC_CLASS = `${this.ICON_ACTION_CLASS} extension-sync ${ThemeIcon.asClassName(syncEnabledIcon)}`;
  }
  update() {
    this.enabled = !!this.extension && this.userDataSyncEnablementService.isEnabled() && this.extension.state === 1 /* Installed */;
    if (this.extension) {
      const isIgnored = this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
      this.class = isIgnored ? ToggleSyncExtensionAction.IGNORED_SYNC_CLASS : ToggleSyncExtensionAction.SYNC_CLASS;
      this.tooltip = isIgnored ? localize(15289, null) : localize(15359, null);
    }
  }
  async run() {
    return super.run([
      [
        new Action(
          "extensions.syncignore",
          this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension) ? localize(15358, null) : localize(15256, null),
          void 0,
          true,
          () => this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(this.extension)
        )
      ]
    ]);
  }
};

ToggleSyncExtensionAction = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IUserDataSyncEnablementService),
  __decorateParam(3, IInstantiationService)
], ToggleSyncExtensionAction);

var ExtensionStatusAction = class extends ExtensionAction {
  constructor(extensionManagementServerService, labelService, commandService, workspaceTrustEnablementService, workspaceTrustService, extensionsWorkbenchService, extensionService, extensionManifestPropertiesService, contextService, productService, allowedExtensionsService, workbenchExtensionEnablementService, extensionFeaturesManagementService, extensionGalleryManifestService, configurationService) {
    super("extensions.status", "", `${ExtensionStatusAction.CLASS} hide`, false);
    this.extensionManagementServerService = extensionManagementServerService;
    this.labelService = labelService;
    this.commandService = commandService;
    this.workspaceTrustEnablementService = workspaceTrustEnablementService;
    this.workspaceTrustService = workspaceTrustService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionService = extensionService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.contextService = contextService;
    this.productService = productService;
    this.allowedExtensionsService = allowedExtensionsService;
    this.workbenchExtensionEnablementService = workbenchExtensionEnablementService;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this.extensionGalleryManifestService = extensionGalleryManifestService;
    this.configurationService = configurationService;
    this.updateWhenCounterExtensionChanges = true;
    this._status = [];
    this._onDidChangeStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangeStatus.event;
    this.updateThrottler = this._register(new Throttler());
    this._register(this.labelService.onDidChangeFormatters(() => this.update(), this));
    this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
    this._register(this.extensionFeaturesManagementService.onDidChangeAccessData(() => this.update()));
    this._register(allowedExtensionsService.onDidChangeAllowedExtensionsConfigValue(() => this.update()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(AutoUpdateConfigurationKey)) {
        this.update();
      }
    }));
    this.update();
  }
  static {
    this.CLASS = `${ExtensionAction.ICON_ACTION_CLASS} extension-status`;
  }
  get status() {
    return this._status;
  }
  update() {
    this.recomputeStatus();
  }
  /**
   * Recomputes the status and returns a promise that resolves when the
   * computation is done. Use this when callers need to await time-sensitive
   * status content (e.g. the delayed auto-update message) before reading it.
   */
  recomputeStatus() {
    return this.updateThrottler.queue(() => this.computeAndUpdateStatus());
  }
  async computeAndUpdateStatus() {
    this.updateStatus(void 0, true);
    this.enabled = false;
    if (!this.extension) {
      return;
    }
    if (this.extension.isMalicious) {
      this.updateStatus({ icon: warningIcon2, message: new MarkdownString(localize(15322, null)) }, true);
      return;
    }
    if (this.extension.state === 3 /* Uninstalled */ && this.extension.gallery && !this.extension.gallery.isSigned && shouldRequireRepositorySignatureFor(this.extension.private, await this.extensionGalleryManifestService.getExtensionGalleryManifest())) {
      this.updateStatus({ icon: warningIcon2, message: new MarkdownString(localize(15334, null)) }, true);
      return;
    }
    if (this.extension.deprecationInfo) {
      if (this.extension.deprecationInfo.extension) {
        const link2 = `[${this.extension.deprecationInfo.extension.displayName}](${createCommandUri("extension.open", this.extension.deprecationInfo.extension.id)})`;
        this.updateStatus({ icon: warningIcon2, message: new MarkdownString(localize(15240, null, link2)) }, true);
      } else if (this.extension.deprecationInfo.settings) {
        const link2 = `[${localize(15353, null)}](${createCommandUri("workbench.action.openSettings", this.extension.deprecationInfo.settings.map((setting) => `@id:${setting}`).join(" "))}})`;
        this.updateStatus({ icon: warningIcon2, message: new MarkdownString(localize(15242, null, link2)) }, true);
      } else {
        const message = new MarkdownString(localize(15238, null));
        if (this.extension.deprecationInfo.additionalInfo) {
          message.appendMarkdown(` ${this.extension.deprecationInfo.additionalInfo}`);
        }
        this.updateStatus({ icon: warningIcon2, message }, true);
      }
      return;
    }
    if (this.extension.missingFromGallery) {
      this.updateStatus({ icon: warningIcon2, message: new MarkdownString(localize(15328, null)) }, true);
      return;
    }
    if (this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
      return;
    }
    if (this.extension.outdated) {
      let hasConsentWarning = false;
      const message = await this.extensionsWorkbenchService.shouldRequireConsentToUpdate(this.extension);
      if (message) {
        hasConsentWarning = true;
        const markdown = new MarkdownString();
        markdown.appendMarkdown(`${message} `);
        markdown.appendMarkdown(
          localize(
            15224,
            null,
            this.extension.hasChangelog() ? createCommandUri("extension.open", this.extension.identifier.id, "changelog" /* Changelog */).toString() : this.extension.repository ? this.extension.repository : createCommandUri("extension.open", this.extension.identifier.id).toString()
          )
        );
        this.updateStatus({ icon: warningIcon2, message: markdown }, true);
      }
      if (this.extensionsWorkbenchService.isAutoUpdateDelayed(this.extension)) {
        const delay = fromNow(Date.now() - this.extensionsWorkbenchService.getAutoUpdateDelay(), false, true);
        const updateAt = fromNow(Date.now() + this.extensionsWorkbenchService.getAutoUpdateDelayRemaining(this.extension), false, true);
        this.updateStatus({ icon: infoIcon, message: new MarkdownString(localize(15225, null, delay, updateAt)) }, !hasConsentWarning);
      }
    }
    if (this.extension.gallery && this.extension.state === 3 /* Uninstalled */) {
      const result = await this.extensionsWorkbenchService.canInstall(this.extension);
      if (result !== true) {
        this.updateStatus({ icon: warningIcon2, message: result }, true);
        return;
      }
    }
    if (!this.extension.local || !this.extension.server || this.extension.state !== 1 /* Installed */) {
      return;
    }
    if (this.extension.enablementState === 7 /* DisabledByAllowlist */) {
      const result = this.allowedExtensionsService.isAllowed(this.extension.local);
      if (result !== true) {
        this.updateStatus({ icon: warningIcon2, message: new MarkdownString(localize(15249, null, result.value)) }, true);
        return;
      }
    }
    if (this.extension.enablementState === 2 /* DisabledByEnvironment */) {
      this.updateStatus({ message: new MarkdownString(localize(15251, null)) }, true);
      return;
    }
    if (this.extension.enablementState === 3 /* EnabledByEnvironment */) {
      this.updateStatus({ message: new MarkdownString(localize(15265, null)) }, true);
      return;
    }
    if (this.extension.enablementState === 5 /* DisabledByVirtualWorkspace */) {
      const details = getWorkspaceSupportTypeMessage(this.extension.local.manifest.capabilities?.virtualWorkspaces);
      this.updateStatus({ icon: infoIcon, message: new MarkdownString(details ? escapeMarkdownSyntaxTokens(details) : localize(15250, null)) }, true);
      return;
    }
    if (isVirtualWorkspace(this.contextService.getWorkspace())) {
      const virtualSupportType = this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(this.extension.local.manifest);
      const details = getWorkspaceSupportTypeMessage(this.extension.local.manifest.capabilities?.virtualWorkspaces);
      if (virtualSupportType === "limited" || details) {
        this.updateStatus({ icon: warningIcon2, message: new MarkdownString(details ? escapeMarkdownSyntaxTokens(details) : localize(15278, null)) }, true);
        return;
      }
    }
    if (this.extension.enablementState === 9 /* DisabledByUnification */) {
      this.updateStatus({ icon: infoIcon, message: new MarkdownString(localize(15275, null, "`chat.extensionUnification.enabled`")) }, true);
      return;
    }
    if (!this.workspaceTrustService.isWorkspaceTrusted() && // Extension is disabled by untrusted workspace
    (this.extension.enablementState === 0 /* DisabledByTrustRequirement */ || // All disabled dependencies of the extension are disabled by untrusted workspace
    this.extension.enablementState === 8 /* DisabledByExtensionDependency */ && this.workbenchExtensionEnablementService.getDependenciesEnablementStates(this.extension.local).every(([, enablementState]) => this.workbenchExtensionEnablementService.isEnabledEnablementState(enablementState) || enablementState === 0 /* DisabledByTrustRequirement */))) {
      this.enabled = true;
      const untrustedDetails = getWorkspaceSupportTypeMessage(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
      this.updateStatus({ icon: trustIcon, message: new MarkdownString(untrustedDetails ? escapeMarkdownSyntaxTokens(untrustedDetails) : localize(15274, null)) }, true);
      return;
    }
    if (this.workspaceTrustEnablementService.isWorkspaceTrustEnabled() && !this.workspaceTrustService.isWorkspaceTrusted()) {
      const untrustedSupportType = this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(this.extension.local.manifest);
      const untrustedDetails = getWorkspaceSupportTypeMessage(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
      if (untrustedSupportType === "limited" || untrustedDetails) {
        this.enabled = true;
        this.updateStatus({ icon: trustIcon, message: new MarkdownString(untrustedDetails ? escapeMarkdownSyntaxTokens(untrustedDetails) : localize(15277, null)) }, true);
        return;
      }
    }
    if (this.extension.enablementState === 1 /* DisabledByExtensionKind */) {
      if (!this.extensionsWorkbenchService.installed.some((e4) => areSameExtensions(e4.identifier, this.extension.identifier) && e4.server !== this.extension.server)) {
        let message;
        if (this.extensionManagementServerService.localExtensionManagementServer === this.extension.server) {
          if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
              message = new MarkdownString(`${localize(15300, null, this.extensionManagementServerService.remoteExtensionManagementServer.label)} [${localize(15321, null)}](https://code.visualstudio.com/api/advanced-topics/remote-extensions#architecture-and-extension-kinds)`);
            }
          }
        } else if (this.extensionManagementServerService.remoteExtensionManagementServer === this.extension.server) {
          if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
            if (this.extensionManagementServerService.localExtensionManagementServer) {
              message = new MarkdownString(`${localize(15298, null, this.extensionManagementServerService.remoteExtensionManagementServer.label)} [${localize(15321, null)}](https://code.visualstudio.com/api/advanced-topics/remote-extensions#architecture-and-extension-kinds)`);
            } else if (isWeb) {
              message = new MarkdownString(`${localize(15235, null, this.productService.nameLong)} [${localize(15321, null)}](https://code.visualstudio.com/api/advanced-topics/remote-extensions#architecture-and-extension-kinds)`);
            }
          }
        } else if (this.extensionManagementServerService.webExtensionManagementServer === this.extension.server) {
          message = new MarkdownString(`${localize(15227, null, this.productService.nameLong)} [${localize(15321, null)}](https://code.visualstudio.com/api/advanced-topics/remote-extensions#architecture-and-extension-kinds)`);
        }
        if (message) {
          this.updateStatus({ icon: warningIcon2, message }, true);
        }
        return;
      }
    }
    const extensionId = new ExtensionIdentifier(this.extension.identifier.id);
    const features = Registry.as(Extensions11.ExtensionFeaturesRegistry).getExtensionFeatures();
    for (const feature of features) {
      const status2 = this.extensionFeaturesManagementService.getAccessData(extensionId, feature.id)?.current?.status;
      const manageAccessLink = `[${localize(15324, null)}](${createCommandUri("extension.open", this.extension.identifier.id, "features" /* Features */, false, feature.id)})`;
      if (status2?.severity === Severity2.Error) {
        this.updateStatus({ icon: errorIcon, message: new MarkdownString().appendText(status2.message).appendMarkdown(` ${manageAccessLink}`) }, true);
        return;
      }
      if (status2?.severity === Severity2.Warning) {
        this.updateStatus({ icon: warningIcon2, message: new MarkdownString().appendText(status2.message).appendMarkdown(` ${manageAccessLink}`) }, true);
        return;
      }
    }
    if (this.extensionManagementServerService.remoteExtensionManagementServer) {
      if (isLanguagePackExtension(this.extension.local.manifest)) {
        if (!this.extensionsWorkbenchService.installed.some((e4) => areSameExtensions(e4.identifier, this.extension.identifier) && e4.server !== this.extension.server)) {
          const message = this.extension.server === this.extensionManagementServerService.localExtensionManagementServer ? new MarkdownString(localize(15301, null, this.extensionManagementServerService.remoteExtensionManagementServer.label)) : new MarkdownString(localize(15302, null));
          this.updateStatus({ icon: infoIcon, message }, true);
        }
        return;
      }
      const runningExtension = this.extensionService.extensions.filter((e4) => areSameExtensions({ id: e4.identifier.value, uuid: e4.uuid }, this.extension.identifier))[0];
      const runningExtensionServer = runningExtension ? this.extensionManagementServerService.getExtensionManagementServer(toExtension(runningExtension)) : null;
      if (this.extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
        if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
          this.updateStatus({ icon: infoIcon, message: new MarkdownString(`${localize(15268, null)} [${localize(15321, null)}](https://code.visualstudio.com/api/advanced-topics/remote-extensions#architecture-and-extension-kinds)`) }, true);
        }
        return;
      }
      if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
        if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
          this.updateStatus({ icon: infoIcon, message: new MarkdownString(`${localize(15267, null)} [${localize(15321, null)}](https://code.visualstudio.com/api/advanced-topics/remote-extensions#architecture-and-extension-kinds)`) }, true);
        }
        return;
      }
      if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.webExtensionManagementServer) {
        if (this.extensionManifestPropertiesService.canExecuteOnWeb(this.extension.local.manifest)) {
          this.updateStatus({ icon: infoIcon, message: new MarkdownString(`${localize(15266, null)} [${localize(15321, null)}](https://code.visualstudio.com/api/advanced-topics/remote-extensions#architecture-and-extension-kinds)`) }, true);
        }
        return;
      }
    }
    if (this.extension.enablementState === 8 /* DisabledByExtensionDependency */) {
      this.updateStatus({
        icon: warningIcon2,
        message: new MarkdownString(localize(15273, null)).appendMarkdown(`&nbsp;[${localize(15236, null)}](${createCommandUri("extension.open", this.extension.identifier.id, "dependencies" /* Dependencies */)})`)
      }, true);
      return;
    }
    if (!this.extension.local.isValid) {
      const errors = this.extension.local.validations.filter(([severity]) => severity === Severity2.Error).map(([, message]) => message);
      this.updateStatus({ icon: warningIcon2, message: new MarkdownString(errors.join(" ").trim()) }, true);
      return;
    }
    const isEnabled = this.workbenchExtensionEnablementService.isEnabled(this.extension.local);
    const isRunning = this.extensionService.extensions.some((e4) => areSameExtensions({ id: e4.identifier.value, uuid: e4.uuid }, this.extension.identifier));
    if (!this.extension.isWorkspaceScoped && isEnabled && isRunning) {
      if (this.extension.enablementState === 13 /* EnabledWorkspace */) {
        this.updateStatus({ message: new MarkdownString(localize(15388, null)) }, true);
        return;
      }
      if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
        if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
          this.updateStatus({ message: new MarkdownString(localize(15276, null, this.extension.server.label)) }, true);
          return;
        }
      }
      if (this.extension.enablementState === 12 /* EnabledGlobally */) {
        return;
      }
    }
    if (!isEnabled && !isRunning) {
      if (this.extension.enablementState === 10 /* DisabledGlobally */) {
        this.updateStatus({ message: new MarkdownString(localize(15288, null)) }, true);
        return;
      }
      if (this.extension.enablementState === 11 /* DisabledWorkspace */) {
        this.updateStatus({ message: new MarkdownString(localize(15387, null)) }, true);
        return;
      }
    }
  }
  updateStatus(status2, updateClass) {
    if (status2) {
      if (this._status.some((s) => s.message.value === status2.message.value && s.icon?.id === status2.icon?.id)) {
        return;
      }
    } else {
      if (this._status.length === 0) {
        return;
      }
      this._status = [];
    }
    if (status2) {
      this._status.push(status2);
      this._status.sort(
        (a, b) => b.icon === trustIcon ? -1 : a.icon === trustIcon ? 1 : b.icon === errorIcon ? -1 : a.icon === errorIcon ? 1 : b.icon === warningIcon2 ? -1 : a.icon === warningIcon2 ? 1 : b.icon === infoIcon ? -1 : a.icon === infoIcon ? 1 : 0
      );
    }
    if (updateClass) {
      if (status2?.icon === errorIcon) {
        this.class = `${ExtensionStatusAction.CLASS} extension-status-error ${ThemeIcon.asClassName(errorIcon)}`;
      } else if (status2?.icon === warningIcon2) {
        this.class = `${ExtensionStatusAction.CLASS} extension-status-warning ${ThemeIcon.asClassName(warningIcon2)}`;
      } else if (status2?.icon === infoIcon) {
        this.class = `${ExtensionStatusAction.CLASS} extension-status-info ${ThemeIcon.asClassName(infoIcon)}`;
      } else if (status2?.icon === trustIcon) {
        this.class = `${ExtensionStatusAction.CLASS} ${ThemeIcon.asClassName(trustIcon)}`;
      } else {
        this.class = `${ExtensionStatusAction.CLASS} hide`;
      }
    }
    this._onDidChangeStatus.fire();
  }
  async run() {
    if (this._status[0]?.icon === trustIcon) {
      return this.commandService.executeCommand("workbench.trust.manage");
    }
  }
};

ExtensionStatusAction = __decorateClass([
  __decorateParam(0, IExtensionManagementServerService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IWorkspaceTrustEnablementService),
  __decorateParam(4, IWorkspaceTrustManagementService),
  __decorateParam(5, IExtensionsWorkbenchService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, IExtensionManifestPropertiesService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IAllowedExtensionsService),
  __decorateParam(11, IWorkbenchExtensionEnablementService),
  __decorateParam(12, IExtensionFeaturesManagementService),
  __decorateParam(13, IExtensionGalleryManifestService),
  __decorateParam(14, IConfigurationService)
], ExtensionStatusAction);

var InstallSpecificVersionOfExtensionAction = class extends Action {
  constructor(id2 = InstallSpecificVersionOfExtensionAction.ID, label3 = InstallSpecificVersionOfExtensionAction.LABEL, extensionsWorkbenchService, quickInputService, instantiationService, extensionEnablementService) {
    super(id2, label3);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.quickInputService = quickInputService;
    this.instantiationService = instantiationService;
    this.extensionEnablementService = extensionEnablementService;
  }
  static {
    this.ID = "workbench.extensions.action.install.specificVersion";
  }
  static {
    this.LABEL = localize(15309, null);
  }
  get enabled() {
    return this.extensionsWorkbenchService.local.some((l) => this.isEnabled(l));
  }
  async run() {
    const extensionPick = await this.quickInputService.pick(this.getExtensionEntries(), { placeHolder: localize(15351, null), matchOnDetail: true });
    if (extensionPick && extensionPick.extension) {
      const action = this.instantiationService.createInstance(InstallAnotherVersionAction, extensionPick.extension, true);
      try {
        await action.run();
      } finally {
        action.dispose();
      }
      await this.extensionsWorkbenchService.openSearch(extensionPick.extension.identifier.id);
    }
  }
  isEnabled(extension) {
    const action = this.instantiationService.createInstance(InstallAnotherVersionAction, extension, true);
    try {
      return action.enabled && !!extension.local && this.extensionEnablementService.isEnabled(extension.local);
    } finally {
      action.dispose();
    }
  }
  async getExtensionEntries() {
    const installed = await this.extensionsWorkbenchService.queryLocal();
    const entries2 = [];
    for (const extension of installed) {
      if (this.isEnabled(extension)) {
        entries2.push({
          id: extension.identifier.id,
          label: extension.displayName || extension.identifier.id,
          description: extension.identifier.id,
          extension
        });
      }
    }
    return entries2.sort((e1, e22) => e1.extension.displayName.localeCompare(e22.extension.displayName));
  }
};

InstallSpecificVersionOfExtensionAction = __decorateClass([
  __decorateParam(2, IExtensionsWorkbenchService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IWorkbenchExtensionEnablementService)
], InstallSpecificVersionOfExtensionAction);

var AbstractInstallExtensionsInServerAction = class extends Action {
  constructor(id2, extensionsWorkbenchService, quickInputService, notificationService, progressService) {
    super(id2);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.quickInputService = quickInputService;
    this.notificationService = notificationService;
    this.progressService = progressService;
    this.extensions = void 0;
    this.update();
    this.extensionsWorkbenchService.queryLocal().then(() => this.updateExtensions());
    this._register(this.extensionsWorkbenchService.onChange(() => {
      if (this.extensions) {
        this.updateExtensions();
      }
    }));
  }
  updateExtensions() {
    this.extensions = this.extensionsWorkbenchService.local;
    this.update();
  }
  update() {
    this.enabled = !!this.extensions && this.getExtensionsToInstall(this.extensions).length > 0;
    this.tooltip = this.label;
  }
  async run() {
    return this.selectAndInstallExtensions();
  }
  async queryExtensionsToInstall() {
    const local = await this.extensionsWorkbenchService.queryLocal();
    return this.getExtensionsToInstall(local);
  }
  async selectAndInstallExtensions() {
    const quickPick = this.quickInputService.createQuickPick();
    quickPick.busy = true;
    const disposable = quickPick.onDidAccept(() => {
      disposable.dispose();
      quickPick.hide();
      quickPick.dispose();
      this.onDidAccept(quickPick.selectedItems);
    });
    quickPick.show();
    const localExtensionsToInstall = await this.queryExtensionsToInstall();
    quickPick.busy = false;
    if (localExtensionsToInstall.length) {
      quickPick.title = this.getQuickPickTitle();
      quickPick.placeholder = localize(15348, null);
      quickPick.canSelectMany = true;
      localExtensionsToInstall.sort((e1, e22) => e1.displayName.localeCompare(e22.displayName));
      quickPick.items = localExtensionsToInstall.map((extension) => ({ extension, label: extension.displayName, description: extension.version }));
    } else {
      quickPick.hide();
      quickPick.dispose();
      this.notificationService.notify({
        severity: Severity2.Info,
        message: localize(15330, null)
      });
    }
  }
  async onDidAccept(selectedItems) {
    if (selectedItems.length) {
      const localExtensionsToInstall = selectedItems.filter((r2) => !!r2.extension).map((r2) => r2.extension);
      if (localExtensionsToInstall.length) {
        await this.progressService.withProgress(
          {
            location: 15 /* Notification */,
            title: localize(15318, null)
          },
          () => this.installExtensions(localExtensionsToInstall)
        );
        this.notificationService.info(localize(15287, null));
      }
    }
  }
};

AbstractInstallExtensionsInServerAction = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IProgressService)
], AbstractInstallExtensionsInServerAction);

var InstallLocalExtensionsInRemoteAction = class extends AbstractInstallExtensionsInServerAction {
  constructor(extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService, instantiationService, fileService, logService) {
    super("workbench.extensions.actions.installLocalExtensionsInRemote", extensionsWorkbenchService, quickInputService, notificationService, progressService);
    this.extensionManagementServerService = extensionManagementServerService;
    this.extensionGalleryService = extensionGalleryService;
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.logService = logService;
  }
  get label() {
    if (this.extensionManagementServerService && this.extensionManagementServerService.remoteExtensionManagementServer) {
      return localize(15345, null, this.extensionManagementServerService.remoteExtensionManagementServer.label);
    }
    return "";
  }
  getQuickPickTitle() {
    return localize(15303, null, this.extensionManagementServerService.remoteExtensionManagementServer.label);
  }
  getExtensionsToInstall(local) {
    return local.filter((extension) => {
      const action = this.instantiationService.createInstance(RemoteInstallAction, true);
      action.extension = extension;
      return action.enabled;
    });
  }
  async installExtensions(localExtensionsToInstall) {
    const galleryExtensions = [];
    const vsixs = [];
    const targetPlatform = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform();
    await Promises.settled(localExtensionsToInstall.map(async (extension) => {
      if (this.extensionGalleryService.isEnabled()) {
        const gallery = (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, CancellationToken.None))[0];
        if (gallery) {
          galleryExtensions.push(gallery);
          return;
        }
      }
      const vsix = await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.zip(extension.local);
      vsixs.push(vsix);
    }));
    await Promises.settled(galleryExtensions.map((gallery) => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
    try {
      await Promises.settled(vsixs.map((vsix) => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.install(vsix)));
    } finally {
      try {
        await Promise.allSettled(vsixs.map((vsix) => this.fileService.del(vsix)));
      } catch (error) {
        this.logService.error(error);
      }
    }
  }
};

InstallLocalExtensionsInRemoteAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, IProgressService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IExtensionManagementServerService),
  __decorateParam(5, IExtensionGalleryService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IFileService),
  __decorateParam(8, ILogService)
], InstallLocalExtensionsInRemoteAction);

var InstallRemoteExtensionsInLocalAction = class extends AbstractInstallExtensionsInServerAction {
  constructor(id2, extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService, fileService, logService) {
    super(id2, extensionsWorkbenchService, quickInputService, notificationService, progressService);
    this.extensionManagementServerService = extensionManagementServerService;
    this.extensionGalleryService = extensionGalleryService;
    this.fileService = fileService;
    this.logService = logService;
  }
  get label() {
    return localize(15346, null);
  }
  getQuickPickTitle() {
    return localize(15311, null);
  }
  getExtensionsToInstall(local) {
    return local.filter((extension) => extension.type === 1 /* User */ && extension.server !== this.extensionManagementServerService.localExtensionManagementServer && !this.extensionsWorkbenchService.installed.some((e4) => e4.server === this.extensionManagementServerService.localExtensionManagementServer && areSameExtensions(e4.identifier, extension.identifier)));
  }
  async installExtensions(extensions) {
    const galleryExtensions = [];
    const vsixs = [];
    const targetPlatform = await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getTargetPlatform();
    await Promises.settled(extensions.map(async (extension) => {
      if (this.extensionGalleryService.isEnabled()) {
        const gallery = (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, CancellationToken.None))[0];
        if (gallery) {
          galleryExtensions.push(gallery);
          return;
        }
      }
      const vsix = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.zip(extension.local);
      vsixs.push(vsix);
    }));
    await Promises.settled(galleryExtensions.map((gallery) => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
    try {
      await Promises.settled(vsixs.map((vsix) => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.install(vsix)));
    } finally {
      try {
        await Promise.allSettled(vsixs.map((vsix) => this.fileService.del(vsix)));
      } catch (error) {
        this.logService.error(error);
      }
    }
  }
};

InstallRemoteExtensionsInLocalAction = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IProgressService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IExtensionManagementServerService),
  __decorateParam(6, IExtensionGalleryService),
  __decorateParam(7, IFileService),
  __decorateParam(8, ILogService)
], InstallRemoteExtensionsInLocalAction);

CommandsRegistry.registerCommand("workbench.extensions.action.showExtensionsForLanguage", function(accessor, fileExtension) {
  const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
  return extensionsWorkbenchService.openSearch(`ext:${fileExtension.replace(/^\./, "")}`);
});

var showExtensionsWithIdsCommandId = "workbench.extensions.action.showExtensionsWithIds";

CommandsRegistry.registerCommand(showExtensionsWithIdsCommandId, function(accessor, extensionIds) {
  const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
  return extensionsWorkbenchService.openSearch(extensionIds.map((id2) => `@id:${id2}`).join(" "));
});

registerColor("extensionButton.background", {
  dark: buttonSecondaryBackground,
  light: buttonSecondaryBackground,
  hcDark: null,
  hcLight: null
}, localize(15279, null));

registerColor("extensionButton.foreground", {
  dark: buttonSecondaryForeground,
  light: buttonSecondaryForeground,
  hcDark: null,
  hcLight: null
}, localize(15281, null));

registerColor("extensionButton.hoverBackground", {
  dark: buttonSecondaryHoverBackground,
  light: buttonSecondaryHoverBackground,
  hcDark: null,
  hcLight: null
}, localize(15282, null));

registerColor("extensionButton.border", {
  dark: buttonSecondaryBorder,
  light: buttonSecondaryBorder,
  hcDark: buttonSecondaryBorder,
  hcLight: buttonSecondaryBorder
}, localize(15280, null));

registerColor("extensionButton.separator", buttonSeparator, localize(15286, null));

var extensionButtonProminentBackground = registerColor("extensionButton.prominentBackground", {
  dark: buttonBackground,
  light: buttonBackground,
  hcDark: null,
  hcLight: null
}, localize(15283, null));

registerColor("extensionButton.prominentForeground", {
  dark: buttonForeground,
  light: buttonForeground,
  hcDark: null,
  hcLight: null
}, localize(15284, null));

registerColor("extensionButton.prominentHoverBackground", {
  dark: buttonHoverBackground,
  light: buttonHoverBackground,
  hcDark: null,
  hcLight: null
}, localize(15285, null));

registerThemingParticipant((theme, collector) => {
  const errorColor = theme.getColor(editorErrorForeground);
  if (errorColor) {
    collector.addRule(`.extension-editor .header .actions-status-container > .status ${ThemeIcon.asCSSSelector(errorIcon)} { color: ${errorColor}; }`);
    collector.addRule(`.extension-editor .body .subcontent .runtime-status ${ThemeIcon.asCSSSelector(errorIcon)} { color: ${errorColor}; }`);
    collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(errorIcon)} { color: ${errorColor}; }`);
  }
  const warningColor = theme.getColor(editorWarningForeground);
  if (warningColor) {
    collector.addRule(`.extension-editor .header .actions-status-container > .status ${ThemeIcon.asCSSSelector(warningIcon2)} { color: ${warningColor}; }`);
    collector.addRule(`.extension-editor .body .subcontent .runtime-status ${ThemeIcon.asCSSSelector(warningIcon2)} { color: ${warningColor}; }`);
    collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(warningIcon2)} { color: ${warningColor}; }`);
  }
  const infoColor = theme.getColor(editorInfoForeground);
  if (infoColor) {
    collector.addRule(`.extension-editor .header .actions-status-container > .status ${ThemeIcon.asCSSSelector(infoIcon)} { color: ${infoColor}; }`);
    collector.addRule(`.extension-editor .body .subcontent .runtime-status ${ThemeIcon.asCSSSelector(infoIcon)} { color: ${infoColor}; }`);
    collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(infoIcon)} { color: ${infoColor}; }`);
  }
});
export { getContextMenuActionsGroups, toActions, getContextMenuActions2, isThemeFromExtension, getQuickPickEntries, PromptExtensionInstallFailureAction, ExtensionAction, ButtonWithDropDownExtensionAction, ButtonWithDropdownExtensionActionViewItem, InstallAction, InstallDropdownAction, InstallingLabelAction, InstallInOtherServerAction, RemoteInstallAction, LocalInstallAction, WebInstallAction, UninstallAction, UpdateAction, ToggleAutoUpdateForExtensionAction, ToggleAutoUpdatesForPublisherAction, MigrateDeprecatedExtensionAction, DropDownExtensionAction, DropDownExtensionActionViewItem, ManageExtensionAction2, MenuItemExtensionAction, TogglePreReleaseExtensionAction, InstallAnotherVersionAction, EnableForWorkspaceAction, EnableGloballyAction, DisableForWorkspaceAction, DisableGloballyAction, EnableAIFeaturesGloballyAction, EnableAIFeaturesInWorkspaceAction, DisableAIFeaturesGloballyAction, DisableAIFeaturesInWorkspaceAction, EnableDropDownAction, DisableDropDownAction, ExtensionRuntimeStateAction, SetColorThemeAction, SetFileIconThemeAction, SetProductIconThemeAction, SetLanguageAction, ClearLanguageAction, ShowRecommendedExtensionAction, InstallRecommendedExtensionAction, IgnoreExtensionRecommendationAction, UndoIgnoreExtensionRecommendationAction, AbstractConfigureRecommendedExtensionsAction, ConfigureWorkspaceRecommendedExtensionsAction, ConfigureWorkspaceFolderRecommendedExtensionsAction, ExtensionStatusLabelAction, ToggleSyncExtensionAction, ExtensionStatusAction, InstallSpecificVersionOfExtensionAction, AbstractInstallExtensionsInServerAction, InstallLocalExtensionsInRemoteAction, InstallRemoteExtensionsInLocalAction, showExtensionsWithIdsCommandId, extensionButtonProminentBackground };
