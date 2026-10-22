// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/browser/issueTroubleshoot.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileImportExportService, IUserDataProfileManagementService, IUserDataProfileService } from "./module-0997.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IExtensionBisectService } from "./module-1698.mjs";
import { IExtensionManagementService } from "./module-0872.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1046.mjs";
import { IWorkbenchIssueService } from "./module-1876.mjs";
import { IProductService } from "./module-0873.mjs";
import { IHostService } from "./module-1117.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { RemoteNameContext } from "./module-0949.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/issue/browser/issueTroubleshoot.ts
var ITroubleshootIssueService = createDecorator("ITroubleshootIssueService");

var TroubleShootState = class _TroubleShootState {
  constructor(stage, profile) {
    this.stage = stage;
    this.profile = profile;
  }
  static fromJSON(raw) {
    if (!raw) {
      return void 0;
    }
    try {
      const data = JSON.parse(raw);
      if ((data.stage === 1 /* EXTENSIONS */ || data.stage === 2 /* WORKBENCH */) && typeof data.profile === "string") {
        return new _TroubleShootState(data.stage, data.profile);
      }
    } catch {
    }
    return void 0;
  }
};

var TroubleshootIssueService = class extends Disposable {
  constructor(userDataProfileService, userDataProfilesService, userDataProfileManagementService, userDataProfileImportExportService, dialogService, extensionBisectService, notificationService, extensionManagementService, extensionEnablementService, issueService, productService, hostService, storageService, openerService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileManagementService = userDataProfileManagementService;
    this.userDataProfileImportExportService = userDataProfileImportExportService;
    this.dialogService = dialogService;
    this.extensionBisectService = extensionBisectService;
    this.notificationService = notificationService;
    this.extensionManagementService = extensionManagementService;
    this.extensionEnablementService = extensionEnablementService;
    this.issueService = issueService;
    this.productService = productService;
    this.hostService = hostService;
    this.storageService = storageService;
    this.openerService = openerService;
  }
  static {
    this.storageKey = "issueTroubleshootState";
  }
  isActive() {
    return this.state !== void 0;
  }
  async start() {
    if (this.isActive()) {
      throw new Error("invalid state");
    }
    const res = await this.dialogService.confirm({
      message: localize(16434, null),
      detail: localize(16420, null, this.productService.nameLong),
      primaryButton: localize(16427, null),
      custom: true
    });
    if (!res.confirmed) {
      return;
    }
    const originalProfile = this.userDataProfileService.currentProfile;
    await this.userDataProfileImportExportService.createTroubleshootProfile();
    this.state = new TroubleShootState(1 /* EXTENSIONS */, originalProfile.id);
    await this.resume();
  }
  async resume() {
    if (!this.isActive()) {
      return;
    }
    if (this.state?.stage === 1 /* EXTENSIONS */ && !this.extensionBisectService.isActive) {
      await this.reproduceIssueWithExtensionsDisabled();
    }
    if (this.state?.stage === 2 /* WORKBENCH */) {
      await this.reproduceIssueWithEmptyProfile();
    }
    await this.stop();
  }
  async stop() {
    if (!this.isActive()) {
      return;
    }
    if (this.notificationHandle) {
      this.notificationHandle.close();
      this.notificationHandle = void 0;
    }
    if (this.extensionBisectService.isActive) {
      await this.extensionBisectService.reset();
    }
    const profile = this.userDataProfilesService.profiles.find((p) => p.id === this.state?.profile) ?? this.userDataProfilesService.defaultProfile;
    this.state = void 0;
    await this.userDataProfileManagementService.switchProfile(profile);
  }
  async reproduceIssueWithExtensionsDisabled() {
    if (!(await this.extensionManagementService.getInstalled(1 /* User */)).length) {
      this.state = new TroubleShootState(2 /* WORKBENCH */, this.state.profile);
      return;
    }
    const result = await this.askToReproduceIssue(localize(16428, null));
    if (result === "good") {
      const profile = this.userDataProfilesService.profiles.find((p) => p.id === this.state.profile) ?? this.userDataProfilesService.defaultProfile;
      await this.reproduceIssueWithExtensionsBisect(profile);
    }
    if (result === "bad") {
      this.state = new TroubleShootState(2 /* WORKBENCH */, this.state.profile);
    }
    if (result === "stop") {
      await this.stop();
    }
  }
  async reproduceIssueWithEmptyProfile() {
    await this.userDataProfileManagementService.createAndEnterTransientProfile();
    this.updateState(this.state);
    const result = await this.askToReproduceIssue(localize(16422, null));
    if (result === "stop") {
      await this.stop();
    }
    if (result === "good") {
      await this.askToReportIssue(localize(16426, null));
    }
    if (result === "bad") {
      await this.askToReportIssue(localize(16425, null, this.productService.nameLong));
    }
  }
  async reproduceIssueWithExtensionsBisect(profile) {
    await this.userDataProfileManagementService.switchProfile(profile);
    const extensions = (await this.extensionManagementService.getInstalled(1 /* User */)).filter((ext) => this.extensionEnablementService.isEnabled(ext));
    await this.extensionBisectService.start(extensions);
    await this.hostService.reload();
  }
  askToReproduceIssue(message) {
    return new Promise((c, e) => {
      const goodPrompt = {
        label: localize(16424, null),
        run: () => c("good")
      };
      const badPrompt = {
        label: localize(16432, null),
        run: () => c("bad")
      };
      const stop = {
        label: localize(16431, null),
        run: () => c("stop")
      };
      this.notificationHandle = this.notificationService.prompt(
        Severity2.Info,
        message,
        [goodPrompt, badPrompt, stop],
        { sticky: true, priority: 3 /* URGENT */ }
      );
    });
  }
  async askToReportIssue(message) {
    let isCheckedInInsiders = false;
    if (this.productService.quality === "stable") {
      const res = await this.askToReproduceIssueWithInsiders();
      if (res === "good") {
        await this.dialogService.prompt({
          type: Severity2.Info,
          message: localize(16434, null),
          detail: localize(16436, null, this.productService.nameLong),
          custom: true
        });
        return;
      }
      if (res === "stop") {
        await this.stop();
        return;
      }
      if (res === "bad") {
        isCheckedInInsiders = true;
      }
    }
    await this.issueService.openReporter({
      issueBody: `> ${message} ${isCheckedInInsiders ? `It is confirmed that the issue exists in ${this.productService.nameLong} Insiders` : ""}`
    });
  }
  async askToReproduceIssueWithInsiders() {
    const confirmRes = await this.dialogService.confirm({
      type: "info",
      message: localize(16434, null),
      primaryButton: localize(16421, null, this.productService.nameLong),
      cancelButton: localize(16429, null),
      detail: localize(16417, null, this.productService.nameLong),
      custom: {
        disableCloseAction: true
      }
    });
    if (!confirmRes.confirmed) {
      return void 0;
    }
    const opened = await this.openerService.open(URI.parse("https://aka.ms/vscode-insiders"));
    if (!opened) {
      return void 0;
    }
    const res = await this.dialogService.prompt({
      type: "info",
      message: localize(16434, null),
      buttons: [{
        label: localize(16423, null),
        run: () => "good"
      }, {
        label: localize(16419, null),
        run: () => "bad"
      }],
      cancelButton: {
        label: localize(16430, null),
        run: () => "stop"
      },
      detail: localize(16418, null, this.productService.nameLong),
      custom: {
        disableCloseAction: true
      }
    });
    return res.result;
  }
  get state() {
    if (this._state === void 0) {
      const raw = this.storageService.get(TroubleshootIssueService.storageKey, 0 /* PROFILE */);
      this._state = TroubleShootState.fromJSON(raw);
    }
    return this._state || void 0;
  }
  set state(state) {
    this._state = state ?? null;
    this.updateState(state);
  }
  updateState(state) {
    if (state) {
      this.storageService.store(TroubleshootIssueService.storageKey, JSON.stringify(state), 0 /* PROFILE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(TroubleshootIssueService.storageKey, 0 /* PROFILE */);
    }
  }
};

TroubleshootIssueService = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IUserDataProfileManagementService),
  __decorateParam(3, IUserDataProfileImportExportService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IExtensionBisectService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IExtensionManagementService),
  __decorateParam(8, IWorkbenchExtensionEnablementService),
  __decorateParam(9, IWorkbenchIssueService),
  __decorateParam(10, IProductService),
  __decorateParam(11, IHostService),
  __decorateParam(12, IStorageService),
  __decorateParam(13, IOpenerService)
], TroubleshootIssueService);

var IssueTroubleshootUi = class extends Disposable {
  constructor(contextKeyService, troubleshootIssueService, storageService) {
    super();
    this.contextKeyService = contextKeyService;
    this.troubleshootIssueService = troubleshootIssueService;
    this.updateContext();
    if (troubleshootIssueService.isActive()) {
      troubleshootIssueService.resume();
    }
    this._register(storageService.onDidChangeValue(0 /* PROFILE */, TroubleshootIssueService.storageKey, this._store)(() => {
      this.updateContext();
    }));
  }
  static {
    this.ctxIsTroubleshootActive = new RawContextKey("isIssueTroubleshootActive", false);
  }
  updateContext() {
    IssueTroubleshootUi.ctxIsTroubleshootActive.bindTo(this.contextKeyService).set(this.troubleshootIssueService.isActive());
  }
};

IssueTroubleshootUi = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ITroubleshootIssueService),
  __decorateParam(2, IStorageService)
], IssueTroubleshootUi);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(IssueTroubleshootUi, 3 /* Restored */);

registerAction2(class TroubleshootIssueAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.troubleshootIssue.start",
      title: localize2(16435, "Troubleshoot Issue..."),
      category: Categories.Help,
      f1: true,
      precondition: ContextKeyExpr.and(IssueTroubleshootUi.ctxIsTroubleshootActive.negate(), RemoteNameContext.isEqualTo(""), IsWebContext.negate())
    });
  }
  run(accessor) {
    return accessor.get(ITroubleshootIssueService).start();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.troubleshootIssue.stop",
      title: localize2(16433, "Stop Troubleshoot Issue"),
      category: Categories.Help,
      f1: true,
      precondition: IssueTroubleshootUi.ctxIsTroubleshootActive
    });
  }
  async run(accessor) {
    return accessor.get(ITroubleshootIssueService).stop();
  }
});

registerSingleton(ITroubleshootIssueService, TroubleshootIssueService, 1 /* Delayed */);
export { ITroubleshootIssueService, TroubleShootState, TroubleshootIssueService, IssueTroubleshootUi };
