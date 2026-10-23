// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/workspace/browser/workspace.contribution.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { MANAGE_TRUST_COMMAND_ID, WorkspaceTrustContext } from "./module-3379.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { IWorkspaceContextService, isEmptyWorkspaceIdentifier, isSingleFolderWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0509.mjs";
import { Severity2 } from "./module-0336.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IProductService } from "./module-0875.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { isVirtualWorkspace } from "./module-0937.mjs";
import { WORKSPACE_TRUST_BANNER, WORKSPACE_TRUST_EMPTY_WINDOW, WORKSPACE_TRUST_ENABLED, WORKSPACE_TRUST_STARTUP_PROMPT, WORKSPACE_TRUST_UNTRUSTED_FILES } from "./module-1048.mjs";
import { URI } from "./module-0032.mjs";
import { WorkspaceTrustEditor, shieldIcon } from "./module-3377.mjs";
import { isWeb } from "./module-0014.mjs";
import { LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID } from "./module-1023.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStatusbarService } from "./module-0895.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IBannerService } from "./module-1564.mjs";
import { IHostService } from "./module-1118.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IFileService } from "./module-0269.mjs";
import { WorkspaceTrustEditorInput } from "./module-3378.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { WORKSPACE_TRUST_SETTING_TAG } from "./module-1807.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { securityConfigurationNodeBase } from "./module-1113.mjs";
import { dirname, resolve } from "./module-0026.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/workspace/browser/workspace.contribution.ts
var BANNER_RESTRICTED_MODE = "workbench.banner.restrictedMode";

var STARTUP_PROMPT_SHOWN_KEY = "workspace.trust.startupPrompt.shown";

var BANNER_RESTRICTED_MODE_DISMISSED_KEY = "workbench.banner.restrictedMode.dismissed";

function getSessionsWindowTrustNote(environmentService, productService, isWorkspace2) {
  if (!environmentService.isSessionsWindow) {
    return void 0;
  }
  if (isWorkspace2) {
    return localize(22306, null, productService.nameLong);
  }
  return localize(22305, null, productService.nameLong);
}

var WorkspaceTrustContextKeys = class extends Disposable {
  constructor(contextKeyService, workspaceTrustEnablementService, workspaceTrustManagementService) {
    super();
    this._ctxWorkspaceTrustEnabled = WorkspaceTrustContext.IsEnabled.bindTo(contextKeyService);
    this._ctxWorkspaceTrustEnabled.set(workspaceTrustEnablementService.isWorkspaceTrustEnabled());
    this._ctxWorkspaceTrustState = WorkspaceTrustContext.IsTrusted.bindTo(contextKeyService);
    this._ctxWorkspaceTrustState.set(workspaceTrustManagementService.isWorkspaceTrusted());
    this._register(workspaceTrustManagementService.onDidChangeTrust((trusted) => this._ctxWorkspaceTrustState.set(trusted)));
  }
};

WorkspaceTrustContextKeys = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IWorkspaceTrustEnablementService),
  __decorateParam(2, IWorkspaceTrustManagementService)
], WorkspaceTrustContextKeys);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(WorkspaceTrustContextKeys, 3 /* Restored */);

var WorkspaceTrustRequestHandler = class extends Disposable {
  constructor(dialogService, commandService, labelService, workspaceContextService, workspaceTrustManagementService, workspaceTrustRequestService, environmentService, productService) {
    super();
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.labelService = labelService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.environmentService = environmentService;
    this.productService = productService;
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.workspaceTrustRequestHandler";
  }
  get useWorkspaceLanguage() {
    return !isSingleFolderWorkspaceIdentifier(toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()));
  }
  registerListeners() {
    this._register(this.workspaceTrustRequestService.onDidInitiateOpenFilesTrustRequest(async () => {
      await this.workspaceTrustManagementService.workspaceResolved;
      const markdownDetails2 = [
        this.workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */ ? localize(22292, null) : localize(22289, null),
        localize(22288, null)
      ];
      await this.dialogService.prompt({
        type: Severity2.Info,
        message: this.workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */ ? localize(22293, null) : localize(22290, null),
        buttons: [
          {
            label: localize(22287, null),
            run: ({ checkboxChecked }) => this.workspaceTrustRequestService.completeOpenFilesTrustRequest(1 /* Open */, !!checkboxChecked)
          },
          {
            label: localize(22285, null),
            run: ({ checkboxChecked }) => this.workspaceTrustRequestService.completeOpenFilesTrustRequest(2 /* OpenInNewWindow */, !!checkboxChecked)
          }
        ],
        cancelButton: {
          run: () => this.workspaceTrustRequestService.completeOpenFilesTrustRequest(3 /* Cancel */)
        },
        checkbox: {
          label: localize(22291, null),
          checked: false
        },
        custom: {
          icon: Codicon.shield,
          markdownDetails: markdownDetails2.map((md) => {
            return { markdown: new MarkdownString(md) };
          })
        }
      });
    }));
    this._register(this.workspaceTrustRequestService.onDidInitiateResourcesTrustRequest(async (options3) => {
      await this.workspaceTrustManagementService.workspaceResolved;
      const markdownDetails2 = [
        options3?.message ?? localize(22294, null),
        localize(22295, null),
        `\`${this.labelService.getUriLabel(options3.uri)}\``
      ];
      const sessionsTrustNote = getSessionsWindowTrustNote(this.environmentService, this.productService, false);
      if (sessionsTrustNote) {
        markdownDetails2.push(sessionsTrustNote);
      }
      await this.dialogService.prompt({
        type: Severity2.Info,
        message: localize(22296, null),
        buttons: [
          {
            label: localize(22317, null),
            run: () => this.workspaceTrustRequestService.completeResourcesTrustRequest(options3.uri, 1 /* Open */)
          }
        ],
        cancelButton: {
          run: () => this.workspaceTrustRequestService.completeResourcesTrustRequest(options3.uri, 3 /* Cancel */)
        },
        custom: {
          icon: Codicon.shield,
          markdownDetails: markdownDetails2.map((md) => {
            return { markdown: new MarkdownString(md) };
          })
        }
      });
    }));
    this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequest(async (requestOptions) => {
      await this.workspaceTrustManagementService.workspaceResolved;
      const message = this.useWorkspaceLanguage ? localize(22336, null) : localize(22278, null);
      const defaultDetails = localize(22282, null);
      const details = requestOptions?.message ?? defaultDetails;
      const buttons = requestOptions?.buttons ?? [
        { label: this.useWorkspaceLanguage ? localize(22280, null) : localize(22279, null), type: "ContinueWithTrust" },
        { label: localize(22284, null), type: "Manage" }
      ];
      if (!buttons.some((b) => b.type === "Cancel")) {
        buttons.push({ label: localize(22271, null), type: "Cancel" });
      }
      const markdownDetails2 = [
        { markdown: new MarkdownString(details) },
        { markdown: new MarkdownString(localize(22281, null)) }
      ];
      const sessionsTrustNote = getSessionsWindowTrustNote(this.environmentService, this.productService, this.useWorkspaceLanguage);
      if (sessionsTrustNote) {
        markdownDetails2.push({ markdown: new MarkdownString(sessionsTrustNote) });
      }
      const { result } = await this.dialogService.prompt({
        type: Severity2.Info,
        message,
        custom: {
          icon: Codicon.shield,
          markdownDetails: markdownDetails2
        },
        buttons: buttons.filter((b) => b.type !== "Cancel").map((button) => {
          return {
            label: button.label,
            run: () => button.type
          };
        }),
        cancelButton: (() => {
          const cancelButton = buttons.find((b) => b.type === "Cancel");
          if (!cancelButton) {
            return void 0;
          }
          return {
            label: cancelButton.label,
            run: () => cancelButton.type
          };
        })()
      });
      switch (result) {
        case "ContinueWithTrust":
          await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(true);
          break;
        case "ContinueWithoutTrust":
          await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(void 0);
          break;
        case "Manage":
          this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();
          await this.commandService.executeCommand(MANAGE_TRUST_COMMAND_ID);
          break;
        case "Cancel":
          this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();
          break;
      }
    }));
  }
};

WorkspaceTrustRequestHandler = __decorateClass([
  __decorateParam(0, IDialogService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IWorkspaceTrustManagementService),
  __decorateParam(5, IWorkspaceTrustRequestService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, IProductService)
], WorkspaceTrustRequestHandler);

var WorkspaceTrustUXHandler = class extends Disposable {
  constructor(dialogService, workspaceContextService, workspaceTrustEnablementService, workspaceTrustManagementService, configurationService, statusbarService, storageService, workspaceTrustRequestService, bannerService, labelService, hostService, productService, remoteAgentService, environmentService, fileService) {
    super();
    this.dialogService = dialogService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceTrustEnablementService = workspaceTrustEnablementService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.configurationService = configurationService;
    this.statusbarService = statusbarService;
    this.storageService = storageService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.bannerService = bannerService;
    this.labelService = labelService;
    this.hostService = hostService;
    this.productService = productService;
    this.remoteAgentService = remoteAgentService;
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.entryId = `status.workspaceTrust`;
    this.statusbarEntryAccessor = this._register(new MutableDisposable());
    (async () => {
      await this.workspaceTrustManagementService.workspaceTrustInitialized;
      if (this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
        this.registerListeners();
        this.updateStatusbarEntry(this.workspaceTrustManagementService.isWorkspaceTrusted());
        if (this.hostService.hasFocus) {
          this.showModalOnStart();
        } else {
          const focusDisposable = this.hostService.onDidChangeFocus((focused) => {
            if (focused) {
              focusDisposable.dispose();
              this.showModalOnStart();
            }
          });
        }
      }
    })();
  }
  registerListeners() {
    this._register(this.workspaceContextService.onWillChangeWorkspaceFolders((e4) => {
      if (e4.fromCache) {
        return;
      }
      if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
        return;
      }
      const addWorkspaceFolder = async (e5) => {
        const trusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
        if (trusted && (e5.changes.added.length || e5.changes.changed.length)) {
          const addedFoldersTrustInfo = await Promise.all(e5.changes.added.map((folder) => this.workspaceTrustManagementService.getUriTrustInfo(folder.uri)));
          if (!addedFoldersTrustInfo.map((info) => info.trusted).every((trusted2) => trusted2)) {
            let detail2 = localize(22269, null);
            const sessionsTrustNote = getSessionsWindowTrustNote(this.environmentService, this.productService, false);
            if (sessionsTrustNote) {
              detail2 += "\n\n" + sessionsTrustNote;
            }
            const { confirmed } = await this.dialogService.confirm({
              type: Severity2.Info,
              message: localize(22270, null),
              detail: detail2,
              cancelButton: localize(22286, null),
              custom: { icon: Codicon.shield }
            });
            await this.workspaceTrustManagementService.setUrisTrust(addedFoldersTrustInfo.map((i2) => i2.uri), confirmed);
          }
        }
      };
      return e4.join(addWorkspaceFolder(e4));
    }));
    this._register(this.workspaceTrustManagementService.onDidChangeTrust((trusted) => {
      this.updateWorkbenchIndicators(trusted);
    }));
    this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequestOnStartup(async () => {
      let titleString;
      let learnMoreString;
      let trustOption;
      let dontTrustOption;
      const isAiGeneratedWorkspace = await this.isAiGeneratedWorkspace();
      if (isAiGeneratedWorkspace && this.productService.aiGeneratedWorkspaceTrust) {
        titleString = this.productService.aiGeneratedWorkspaceTrust.title;
        learnMoreString = this.productService.aiGeneratedWorkspaceTrust.startupTrustRequestLearnMore;
        trustOption = this.productService.aiGeneratedWorkspaceTrust.trustOption;
        dontTrustOption = this.productService.aiGeneratedWorkspaceTrust.dontTrustOption;
      } else {
        console.warn("AI generated workspace trust dialog contents not available.");
      }
      const title = titleString ?? (this.useWorkspaceLanguage ? localize(22336, null) : localize(22278, null));
      let checkboxText;
      const workspaceIdentifier = toWorkspaceIdentifier(this.workspaceContextService.getWorkspace());
      const isSingleFolderWorkspace = isSingleFolderWorkspaceIdentifier(workspaceIdentifier);
      const isEmptyWindow = isEmptyWorkspaceIdentifier(workspaceIdentifier);
      if (!isAiGeneratedWorkspace && this.workspaceTrustManagementService.canSetParentFolderTrust()) {
        const name = basename2(dirname2(workspaceIdentifier.uri));
        checkboxText = localize(22272, null, name);
      }
      const markdownStrings = [
        !isSingleFolderWorkspace ? localize(22335, null, this.productService.nameShort) : localize(22277, null, this.productService.nameShort),
        learnMoreString ?? localize(22307, null),
        !isEmptyWindow ? `\`${this.labelService.getWorkspaceLabel(workspaceIdentifier, { verbose: 2 /* LONG */ })}\`` : ""
      ];
      const sessionsTrustNote = getSessionsWindowTrustNote(this.environmentService, this.productService, !isSingleFolderWorkspace);
      if (sessionsTrustNote) {
        markdownStrings.push(sessionsTrustNote);
      }
      this.doShowModal(
        title,
        { label: trustOption ?? localize(22316, null), sublabel: isSingleFolderWorkspace ? localize(22315, null) : localize(22318, null) },
        { label: dontTrustOption ?? localize(22275, null), sublabel: isSingleFolderWorkspace ? localize(22274, null) : localize(22276, null) },
        markdownStrings,
        checkboxText
      );
    }));
  }
  updateWorkbenchIndicators(trusted) {
    const bannerItem = this.getBannerItem(!trusted);
    this.updateStatusbarEntry(trusted);
    if (bannerItem) {
      if (!trusted) {
        this.bannerService.show(bannerItem);
      } else {
        this.bannerService.hide(BANNER_RESTRICTED_MODE);
      }
    }
  }
  //#region Dialog
  async doShowModal(question, trustedOption, untrustedOption, markdownStrings, trustParentString) {
    await this.dialogService.prompt({
      type: Severity2.Info,
      message: question,
      checkbox: trustParentString ? {
        label: trustParentString
      } : void 0,
      buttons: [
        {
          label: trustedOption.label,
          run: async ({ checkboxChecked }) => {
            if (checkboxChecked) {
              await this.workspaceTrustManagementService.setParentFolderTrust(true);
            } else {
              await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(true);
            }
          }
        },
        {
          label: untrustedOption.label,
          run: () => {
            this.updateWorkbenchIndicators(false);
            this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();
          }
        }
      ],
      custom: {
        buttonDetails: [
          trustedOption.sublabel,
          untrustedOption.sublabel
        ],
        disableCloseAction: true,
        icon: Codicon.shield,
        markdownDetails: markdownStrings.map((md) => {
          return { markdown: new MarkdownString(md) };
        })
      }
    });
    this.storageService.store(STARTUP_PROMPT_SHOWN_KEY, true, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  async showModalOnStart() {
    if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      this.updateWorkbenchIndicators(true);
      return;
    }
    if (!this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
      return;
    }
    if (isVirtualWorkspace(this.workspaceContextService.getWorkspace())) {
      this.updateWorkbenchIndicators(false);
      return;
    }
    if (this.workspaceContextService.getWorkbenchState() === 1 /* EMPTY */) {
      this.updateWorkbenchIndicators(false);
      return;
    }
    if (this.startupPromptSetting === "never") {
      this.updateWorkbenchIndicators(false);
      return;
    }
    if (this.startupPromptSetting === "once" && this.storageService.getBoolean(STARTUP_PROMPT_SHOWN_KEY, 1 /* WORKSPACE */, false)) {
      this.updateWorkbenchIndicators(false);
      return;
    }
    this.workspaceTrustRequestService.requestWorkspaceTrustOnStartup();
  }
  get startupPromptSetting() {
    return this.configurationService.getValue(WORKSPACE_TRUST_STARTUP_PROMPT);
  }
  get useWorkspaceLanguage() {
    return !isSingleFolderWorkspaceIdentifier(toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()));
  }
  async isAiGeneratedWorkspace() {
    const aiGeneratedWorkspaces = URI.joinPath(this.environmentService.workspaceStorageHome, "aiGeneratedWorkspaces.json");
    return await this.fileService.exists(aiGeneratedWorkspaces).then(async (result) => {
      if (result) {
        try {
          const content = await this.fileService.readFile(aiGeneratedWorkspaces);
          const workspaces = JSON.parse(content.value.toString());
          if (workspaces.indexOf(this.workspaceContextService.getWorkspace().folders[0].uri.toString()) > -1) {
            return true;
          }
        } catch (e4) {
        }
      }
      return false;
    });
  }
  //#endregion
  //#region Banner
  getBannerItem(restrictedMode) {
    const dismissedRestricted = this.storageService.getBoolean(BANNER_RESTRICTED_MODE_DISMISSED_KEY, 1 /* WORKSPACE */, false);
    if (this.bannerSetting === "never") {
      return void 0;
    }
    if (this.bannerSetting === "untilDismissed" && dismissedRestricted) {
      return void 0;
    }
    const actions = [
      {
        label: localize(22301, null),
        href: "command:" + MANAGE_TRUST_COMMAND_ID
      },
      {
        label: localize(22300, null),
        href: "https://aka.ms/vscode-workspace-trust"
      }
    ];
    return {
      id: BANNER_RESTRICTED_MODE,
      icon: shieldIcon,
      ariaLabel: this.getBannerItemAriaLabels(),
      message: this.getBannerItemMessages(),
      actions,
      onClose: () => {
        if (restrictedMode) {
          this.storageService.store(BANNER_RESTRICTED_MODE_DISMISSED_KEY, true, 1 /* WORKSPACE */, 1 /* MACHINE */);
        }
      }
    };
  }
  getBannerItemAriaLabels() {
    switch (this.workspaceContextService.getWorkbenchState()) {
      case 1 /* EMPTY */:
        return localize(22298, null);
      case 2 /* FOLDER */:
        return localize(22297, null);
      case 3 /* WORKSPACE */:
        return localize(22299, null);
    }
  }
  getBannerItemMessages() {
    switch (this.workspaceContextService.getWorkbenchState()) {
      case 1 /* EMPTY */:
        return localize(22303, null);
      case 2 /* FOLDER */:
        return localize(22302, null);
      case 3 /* WORKSPACE */:
        return localize(22304, null);
    }
  }
  get bannerSetting() {
    const result = this.configurationService.getValue(WORKSPACE_TRUST_BANNER);
    if (result !== "always" && isWeb && !this.remoteAgentService.getConnection()?.remoteAuthority) {
      return "never";
    }
    return result;
  }
  //#endregion
  //#region Statusbar
  getRestrictedModeStatusbarEntry() {
    let ariaLabel = "";
    let toolTip;
    switch (this.workspaceContextService.getWorkbenchState()) {
      case 1 /* EMPTY */: {
        ariaLabel = localize(22309, null);
        toolTip = {
          value: localize(
            22312,
            null,
            `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`,
            `command:${MANAGE_TRUST_COMMAND_ID}`
          ),
          isTrusted: true,
          supportThemeIcons: true
        };
        break;
      }
      case 2 /* FOLDER */: {
        ariaLabel = localize(22308, null);
        toolTip = {
          value: localize(
            22311,
            null,
            `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`,
            `command:${MANAGE_TRUST_COMMAND_ID}`
          ),
          isTrusted: true,
          supportThemeIcons: true
        };
        break;
      }
      case 3 /* WORKSPACE */: {
        ariaLabel = localize(22310, null);
        toolTip = {
          value: localize(
            22313,
            null,
            `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`,
            `command:${MANAGE_TRUST_COMMAND_ID}`
          ),
          isTrusted: true,
          supportThemeIcons: true
        };
        break;
      }
    }
    return {
      name: localize(22314, null),
      text: `$(shield) ${localize(22319, null)}`,
      ariaLabel,
      tooltip: toolTip,
      command: MANAGE_TRUST_COMMAND_ID,
      kind: "prominent"
    };
  }
  updateStatusbarEntry(trusted) {
    if (trusted && this.statusbarEntryAccessor.value) {
      this.statusbarEntryAccessor.clear();
      return;
    }
    if (!trusted && !this.statusbarEntryAccessor.value) {
      const entry = this.getRestrictedModeStatusbarEntry();
      this.statusbarEntryAccessor.value = this.statusbarService.addEntry(entry, this.entryId, 0 /* LEFT */, { location: { id: "status.host", priority: Number.POSITIVE_INFINITY }, alignment: 1 /* RIGHT */ });
    }
  }
  //#endregion
};

WorkspaceTrustUXHandler = __decorateClass([
  __decorateParam(0, IDialogService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IWorkspaceTrustEnablementService),
  __decorateParam(3, IWorkspaceTrustManagementService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IStatusbarService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IWorkspaceTrustRequestService),
  __decorateParam(8, IBannerService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IHostService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IRemoteAgentService),
  __decorateParam(13, IWorkbenchEnvironmentService),
  __decorateParam(14, IFileService)
], WorkspaceTrustUXHandler);

registerWorkbenchContribution2(WorkspaceTrustRequestHandler.ID, WorkspaceTrustRequestHandler, WorkbenchPhase.BlockRestore);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(WorkspaceTrustUXHandler, 3 /* Restored */);

var WorkspaceTrustEditorInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(input) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(WorkspaceTrustEditorInput);
  }
};

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(WorkspaceTrustEditorInput.ID, WorkspaceTrustEditorInputSerializer);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    WorkspaceTrustEditor,
    WorkspaceTrustEditor.ID,
    localize(22337, null)
  ),
  [
    new SyncDescriptor(WorkspaceTrustEditorInput)
  ]
);

var CONFIGURE_TRUST_COMMAND_ID = "workbench.trust.configure";

var WORKSPACES_CATEGORY = localize2(22334, "Workspaces");

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: CONFIGURE_TRUST_COMMAND_ID,
      title: localize2(22273, "Configure Workspace Trust Settings"),
      precondition: ContextKeyExpr.and(WorkspaceTrustContext.IsEnabled, ContextKeyExpr.equals(`config.${WORKSPACE_TRUST_ENABLED}`, true)),
      category: WORKSPACES_CATEGORY,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IPreferencesService).openUserSettings({ jsonEditor: false, query: `@tag:${WORKSPACE_TRUST_SETTING_TAG}` });
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: MANAGE_TRUST_COMMAND_ID,
      title: localize2(22283, "Manage Workspace Trust"),
      precondition: ContextKeyExpr.and(WorkspaceTrustContext.IsEnabled, ContextKeyExpr.equals(`config.${WORKSPACE_TRUST_ENABLED}`, true)),
      category: WORKSPACES_CATEGORY,
      f1: true
    });
  }
  run(accessor) {
    const editorService = accessor.get(IEditorService);
    const instantiationService = accessor.get(IInstantiationService);
    const input = instantiationService.createInstance(WorkspaceTrustEditorInput);
    editorService.openEditor(input, { pinned: true });
    return;
  }
});

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...securityConfigurationNodeBase,
  properties: {
    [WORKSPACE_TRUST_ENABLED]: {
      type: "boolean",
      default: false,
      description: localize(22324, null),
      tags: [WORKSPACE_TRUST_SETTING_TAG],
      scope: 1 /* APPLICATION */
    },
    [WORKSPACE_TRUST_STARTUP_PROMPT]: {
      type: "string",
      default: "never",
      description: localize(22327, null),
      tags: [WORKSPACE_TRUST_SETTING_TAG],
      scope: 1 /* APPLICATION */,
      enum: ["always", "once", "never"],
      enumDescriptions: [
        localize(22326, null),
        localize(22329, null),
        localize(22328, null)
      ]
    },
    [WORKSPACE_TRUST_BANNER]: {
      type: "string",
      default: "untilDismissed",
      description: localize(22321, null),
      tags: [WORKSPACE_TRUST_SETTING_TAG],
      scope: 1 /* APPLICATION */,
      enum: ["always", "untilDismissed", "never"],
      enumDescriptions: [
        localize(22320, null),
        localize(22323, null),
        localize(22322, null)
      ]
    },
    [WORKSPACE_TRUST_UNTRUSTED_FILES]: {
      type: "string",
      default: "prompt",
      markdownDescription: localize(22330, null, WORKSPACE_TRUST_EMPTY_WINDOW),
      tags: [WORKSPACE_TRUST_SETTING_TAG],
      scope: 1 /* APPLICATION */,
      enum: ["prompt", "open", "newWindow"],
      enumDescriptions: [
        localize(22333, null),
        localize(22332, null),
        localize(22331, null)
      ]
    },
    [WORKSPACE_TRUST_EMPTY_WINDOW]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(22325, null, WORKSPACE_TRUST_UNTRUSTED_FILES),
      tags: [WORKSPACE_TRUST_SETTING_TAG],
      scope: 1 /* APPLICATION */
    }
  }
});

var WorkspaceTrustTelemetryContribution = class extends Disposable {
  constructor(environmentService, telemetryService, workspaceContextService, workspaceTrustEnablementService, workspaceTrustManagementService) {
    super();
    this.environmentService = environmentService;
    this.telemetryService = telemetryService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceTrustEnablementService = workspaceTrustEnablementService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.workspaceTrustManagementService.workspaceTrustInitialized.then(() => {
      this.logInitialWorkspaceTrustInfo();
      this.logWorkspaceTrust(this.workspaceTrustManagementService.isWorkspaceTrusted());
      this._register(this.workspaceTrustManagementService.onDidChangeTrust((isTrusted) => this.logWorkspaceTrust(isTrusted)));
    });
  }
  logInitialWorkspaceTrustInfo() {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      const disabledByCliFlag = this.environmentService.disableWorkspaceTrust;
      this.telemetryService.publicLog2("workspaceTrustDisabled", {
        reason: disabledByCliFlag ? "cli" : "setting"
      });
      return;
    }
    this.telemetryService.publicLog2("workspaceTrustFolderCounts", {
      trustedFoldersCount: this.workspaceTrustManagementService.getTrustedUris().length
    });
  }
  async logWorkspaceTrust(isTrusted) {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      return;
    }
    this.telemetryService.publicLog2("workspaceTrustStateChanged", {
      workspaceId: this.workspaceContextService.getWorkspace().id,
      isTrusted
    });
    if (isTrusted) {
      const getDepth = (folder) => {
        let resolvedPath = resolve(folder);
        let depth = 0;
        while (dirname(resolvedPath) !== resolvedPath && depth < 100) {
          resolvedPath = dirname(resolvedPath);
          depth++;
        }
        return depth;
      };
      for (const folder of this.workspaceContextService.getWorkspace().folders) {
        const { trusted, uri: uri4 } = await this.workspaceTrustManagementService.getUriTrustInfo(folder.uri);
        if (!trusted) {
          continue;
        }
        const workspaceFolderDepth = getDepth(folder.uri.fsPath);
        const trustedFolderDepth = getDepth(uri4.fsPath);
        const delta2 = workspaceFolderDepth - trustedFolderDepth;
        this.telemetryService.publicLog2("workspaceFolderDepthBelowTrustedFolder", { workspaceFolderDepth, trustedFolderDepth, delta: delta2 });
      }
    }
  }
};

WorkspaceTrustTelemetryContribution = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IWorkspaceTrustEnablementService),
  __decorateParam(4, IWorkspaceTrustManagementService)
], WorkspaceTrustTelemetryContribution);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(WorkspaceTrustTelemetryContribution, 3 /* Restored */);
export { getSessionsWindowTrustNote, BANNER_RESTRICTED_MODE, STARTUP_PROMPT_SHOWN_KEY, BANNER_RESTRICTED_MODE_DISMISSED_KEY, WorkspaceTrustContextKeys, WorkspaceTrustRequestHandler, WorkspaceTrustUXHandler, WorkspaceTrustEditorInputSerializer, CONFIGURE_TRUST_COMMAND_ID, WORKSPACES_CATEGORY, WorkspaceTrustTelemetryContribution };
