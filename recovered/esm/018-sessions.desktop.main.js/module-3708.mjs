// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/copilotChatSessions/browser/copilotChatSessionsActions.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { IsNewChatSessionContext, SessionHasGitRepositoryContext, SessionProviderIdContext, SessionTypeContext } from "./module-1770.mjs";
import { CopilotCLISessionType } from "./module-3672.mjs";
import { COPILOT_PROVIDER_ID, CopilotChatSessionsProvider, CopilotCloudSessionType } from "./module-3689.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Menus } from "./module-3437.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ModePicker, ModePickerModel } from "./module-3706.mjs";
import { autorun } from "./module-0052.mjs";
import { ISessionContext } from "./module-3499.mjs";
import { BranchPicker2 } from "./module-3705.mjs";
import { SandboxPicker } from "./module-3707.mjs";
import { isWeb } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/providers/copilotChatSessions/browser/copilotChatSessionsActions.ts
var IsActiveSessionCopilotCLI = ContextKeyExpr.equals(SessionTypeContext.key, CopilotCLISessionType.id);

var IsActiveCopilotChatSessionProvider = ContextKeyExpr.equals(SessionProviderIdContext.key, COPILOT_PROVIDER_ID);

var IsActiveSessionCopilotChatCLI = ContextKeyExpr.and(IsActiveSessionCopilotCLI, IsActiveCopilotChatSessionProvider);

var IsActiveSessionCopilotChatCloud = ContextKeyExpr.and(ContextKeyExpr.equals(SessionTypeContext.key, CopilotCloudSessionType.id), IsActiveCopilotChatSessionProvider);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "sessions.defaultCopilot.branchPicker",
      title: localize2(5035, "Branch"),
      f1: false,
      menu: [{
        id: Menus.NewSessionRepositoryConfig,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(IsNewChatSessionContext, IsActiveSessionCopilotChatCLI, SessionHasGitRepositoryContext)
      }]
    });
  }
  async run() {
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "sessions.defaultCopilot.sandboxPicker",
      title: localize2(5038, "Sandbox"),
      f1: false,
      menu: [{
        id: Menus.NewSessionRepositoryConfig,
        group: "navigation",
        order: 3,
        when: ContextKeyExpr.and(IsNewChatSessionContext, IsActiveSessionCopilotChatCloud, ChatContextKeys.enabled)
      }]
    });
  }
  async run() {
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "sessions.defaultCopilot.modePicker",
      title: localize2(5036, "Mode"),
      f1: false,
      menu: [{
        id: Menus.NewSessionConfig,
        group: "navigation",
        order: 0,
        when: IsActiveSessionCopilotChatCLI
      }]
    });
  }
  async run() {
  }
});

var PickerActionViewItem2 = class extends BaseActionViewItem {
  constructor(picker, disposable) {
    super(void 0, { id: "", label: "", enabled: true, class: void 0, tooltip: "", run: () => {
    } });
    this.picker = picker;
    if (disposable) {
      this._register(disposable);
    }
  }
  render(container2) {
    this.picker.render(container2);
  }
  dispose() {
    this.picker.dispose();
    super.dispose();
  }
};

var CopilotPickerActionViewItemContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.copilotPickerActionViewItems";
  }
  constructor(actionViewItemService, sessionsService, sessionsProvidersService, instantiationService) {
    super();
    const modePickerModel = this._register(instantiationService.createInstance(ModePickerModel));
    this._register(autorun((reader) => {
      const session = sessionsService.activeSession.read(reader);
      if (session) {
        const provider = sessionsProvidersService.getProvider(session.providerId);
        if (provider instanceof CopilotChatSessionsProvider) {
          const selectedModeId = session.mode.read(reader)?.id;
          modePickerModel.setSession(session, selectedModeId);
          return;
        }
      }
      modePickerModel.setSession(void 0, void 0);
    }));
    this._register(actionViewItemService.register(
      Menus.NewSessionRepositoryConfig,
      "sessions.defaultCopilot.branchPicker",
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        const picker = scopedInstantiationService.createInstance(BranchPicker2, session);
        return new PickerActionViewItem2(picker);
      }
    ));
    this._register(actionViewItemService.register(
      Menus.NewSessionRepositoryConfig,
      "sessions.defaultCopilot.sandboxPicker",
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        const picker = scopedInstantiationService.createInstance(SandboxPicker, session);
        return new PickerActionViewItem2(picker);
      }
    ));
    this._register(actionViewItemService.register(
      Menus.NewSessionConfig,
      "sessions.defaultCopilot.modePicker",
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        const picker = scopedInstantiationService.createInstance(ModePicker, modePickerModel, session);
        const disposableStore = new DisposableStore();
        disposableStore.add(picker.onDidSelect((mode) => {
          const scopedSession = session.get();
          if (!scopedSession) {
            return;
          }
          const provider = sessionsProvidersService.getProvider(scopedSession.providerId);
          if (provider instanceof CopilotChatSessionsProvider) {
            provider.getSession(scopedSession.sessionId)?.setMode(mode);
          }
        }));
        return new PickerActionViewItem2(picker, disposableStore);
      }
    ));
  }
};

CopilotPickerActionViewItemContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, IInstantiationService)
], CopilotPickerActionViewItemContribution);

registerWorkbenchContribution2(CopilotPickerActionViewItemContribution.ID, CopilotPickerActionViewItemContribution, WorkbenchPhase.AfterRestored);
export { IsActiveSessionCopilotCLI, IsActiveCopilotChatSessionProvider, IsActiveSessionCopilotChatCLI, IsActiveSessionCopilotChatCloud, PickerActionViewItem2, CopilotPickerActionViewItemContribution };
