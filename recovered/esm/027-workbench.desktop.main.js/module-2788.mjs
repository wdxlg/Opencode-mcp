// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatStatus/chatStatusEntry.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, disposableWindowInterval } from "./module-0075.mjs";
import { ChatStatusDashboard } from "./module-2787.mjs";
import { mainWindow } from "./module-0002.mjs";
import { UpdateTitleBarEditorVisibleContext } from "./module-2777.mjs";
import { ChatEntitlementContextKeys, IChatEntitlementService, getQuotaReset, isProUser } from "./module-0953.mjs";
import { product_default } from "./module-0139.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { disposableLongTimeout, disposableTimeout } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { localize } from "./module-0001.mjs";
import { isNewUser } from "./module-2786.mjs";
import { isCompletionsEnabled } from "./module-0207.mjs";
import { IStatusbarService, ShowTooltipCommand } from "./module-0893.mjs";
import { CHAT_SETUP_ACTION_ID } from "./module-1476.mjs";
import { isWeb } from "./module-0014.mjs";
import { InEditorZenModeContext } from "./module-0949.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInlineCompletionsService } from "./module-0738.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/chat/browser/chatStatus/chatStatusEntry.ts
function isTrackedEntitlement(entitlement) {
  switch (entitlement) {
    case 5 /* Free */:
    case 10 /* EDU */:
    case 6 /* Pro */:
    case 7 /* ProPlus */:
    case 8 /* Business */:
    case 9 /* Enterprise */:
      return true;
    default:
      return false;
  }
}

function isQuotaBlocked(quotas) {
  const premiumChat = quotas.premiumChat;
  if (premiumChat === void 0) {
    return false;
  }
  return premiumChat.unlimited ? premiumChat.hasQuota === false : premiumChat.percentRemaining === 0;
}

function hasResolvedQuota(quotas) {
  return quotas.premiumChat !== void 0;
}

function computeQuotaResumeState(previous, entitlement, quotas) {
  if (!isTrackedEntitlement(entitlement)) {
    return "none";
  }
  const additionalSpend = quotas.additionalUsageEnabled === true;
  if (!additionalSpend && isQuotaBlocked(quotas)) {
    return "blocked";
  }
  if (previous !== "blocked") {
    return previous;
  }
  if (additionalSpend) {
    return "none";
  }
  return hasResolvedQuota(quotas) ? "resumed" : "blocked";
}

var ChatStatusBarEntry = class extends Disposable {
  constructor(chatEntitlementService, instantiationService, statusbarService, editorService, configurationService, completionsService, contextKeyService, storageService) {
    super();
    this.chatEntitlementService = chatEntitlementService;
    this.instantiationService = instantiationService;
    this.statusbarService = statusbarService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.completionsService = completionsService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    // re-check 5 min after a passed reset time
    this.entry = void 0;
    this.activeCodeEditorListener = this._register(new MutableDisposable());
    this.entryAnchor = $("span");
    this.quotaResetTimer = this._register(new MutableDisposable());
    this.quotaRefresh = this._register(new MutableDisposable());
    this.clearResumedScheduler = this._register(new MutableDisposable());
    this.quotaResumeState = this.readPersistedQuotaResumeState();
    this.dashboardTooltip = {
      element: (token) => {
        this.onDashboardOpened();
        const store = new DisposableStore();
        store.add(token.onCancellationRequested(() => {
          store.dispose();
        }));
        const elem = ChatStatusDashboard.instantiateInContents(this.instantiationService, store, void 0);
        store.add(disposableWindowInterval(mainWindow, () => {
          if (!elem.isConnected) {
            store.dispose();
          }
        }, 2e3));
        return elem;
      }
    };
    this.update();
    this.registerListeners();
    this.initializeQuotaResumeState();
  }
  static {
    this.ID = "workbench.contrib.chatStatusBarEntry";
  }
  static {
    this.TITLE_BAR_CONTEXT_KEYS = /* @__PURE__ */ new Set([...UpdateTitleBarEditorVisibleContext.keys(), ChatEntitlementContextKeys.hasByokModels.key]);
  }
  static {
    this.QUOTA_RESUME_STATE_KEY = "chat.quotaResumeState";
  }
  static {
    this.QUOTA_RESET_RETRY_DELAY = 5 * 60 * 1e3;
  }
  update() {
    const sentiment = this.chatEntitlementService.sentiment;
    if (!sentiment.hidden) {
      const props = this.getEntryProps();
      if (this.entry) {
        this.entry.update(props);
      } else {
        this.entry = this.statusbarService.addEntry(props, "chat.statusBarEntry", 1 /* RIGHT */, { location: { id: "status.editor.mode", priority: 100.1 }, alignment: 1 /* RIGHT */ });
      }
    } else {
      this.entry?.dispose();
      this.entry = void 0;
    }
  }
  registerListeners() {
    this._register(this.chatEntitlementService.onDidChangeQuotaExceeded(() => this.onQuotaChanged()));
    this._register(this.chatEntitlementService.onDidChangeQuotaRemaining(() => this.onQuotaChanged()));
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => this.update()));
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => this.onQuotaChanged()));
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(ChatStatusBarEntry.TITLE_BAR_CONTEXT_KEYS)) {
        this.update();
      }
    }));
    this._register(this.completionsService.onDidChangeIsSnoozing(() => this.update()));
    this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(product_default.defaultChatAgent?.completionsEnablementSetting) || e.affectsConfiguration("chat.titleBar.signIn.enabled" /* TitleBarSignInEnabled */)) {
        this.update();
      }
    }));
  }
  onDidActiveEditorChange() {
    this.update();
    this.activeCodeEditorListener.clear();
    const activeCodeEditor = getCodeEditor(this.editorService.activeTextEditorControl);
    if (activeCodeEditor) {
      this.activeCodeEditorListener.value = activeCodeEditor.onDidChangeModelLanguage(() => {
        this.update();
      });
    }
  }
  //#region --- Quota Resume Tracking
  onQuotaChanged() {
    this.evaluateQuotaResumeState();
    this.update();
  }
  evaluateQuotaResumeState() {
    const next = computeQuotaResumeState(this.quotaResumeState, this.chatEntitlementService.entitlement, this.chatEntitlementService.quotas);
    this.setQuotaResumeState(next);
    if (next === "blocked") {
      this.scheduleQuotaResetRefresh();
    } else {
      this.quotaResetTimer.clear();
    }
  }
  getQuotaResetTime() {
    const quotas = this.chatEntitlementService.quotas;
    return getQuotaReset(quotas.premiumChat, quotas)?.date.getTime();
  }
  scheduleQuotaResetRefresh() {
    const resetAt = this.getQuotaResetTime();
    if (resetAt === void 0) {
      this.quotaResetTimer.clear();
      return;
    }
    const delay = resetAt > Date.now() ? resetAt - Date.now() : ChatStatusBarEntry.QUOTA_RESET_RETRY_DELAY;
    this.quotaResetTimer.value = disposableLongTimeout(() => this.refreshQuotaAndEvaluate(), delay);
  }
  refreshQuotaAndEvaluate() {
    const cts = new CancellationTokenSource();
    this.quotaRefresh.value = toDisposable(() => cts.dispose(true));
    (async () => {
      try {
        await this.chatEntitlementService.update(cts.token);
      } catch {
      }
      if (cts.token.isCancellationRequested) {
        return;
      }
      this.evaluateQuotaResumeState();
      this.update();
    })();
  }
  initializeQuotaResumeState() {
    if (this.quotaResumeState === "blocked") {
      this.refreshQuotaAndEvaluate();
    } else {
      this.evaluateQuotaResumeState();
    }
  }
  readPersistedQuotaResumeState() {
    const stored = this.storageService.get(ChatStatusBarEntry.QUOTA_RESUME_STATE_KEY, 0 /* PROFILE */);
    return stored === "blocked" || stored === "resumed" ? stored : "none";
  }
  setQuotaResumeState(state) {
    if (this.quotaResumeState === state) {
      return;
    }
    this.quotaResumeState = state;
    if (state === "none") {
      this.storageService.remove(ChatStatusBarEntry.QUOTA_RESUME_STATE_KEY, 0 /* PROFILE */);
    } else {
      this.storageService.store(ChatStatusBarEntry.QUOTA_RESUME_STATE_KEY, state, 0 /* PROFILE */, 1 /* MACHINE */);
    }
  }
  onDashboardOpened() {
    if (this.quotaResumeState !== "resumed") {
      return;
    }
    this.clearResumedScheduler.value = disposableTimeout(() => {
      this.setQuotaResumeState("none");
      this.update();
    }, 0);
  }
  //#endregion
  getEntryProps() {
    let text2 = "$(copilot)";
    let ariaLabel = localize(11281, null);
    let kind;
    if (isNewUser(this.chatEntitlementService)) {
      const entitlement = this.chatEntitlementService.entitlement;
      if (this.chatEntitlementService.sentiment.later || // user skipped setup
      entitlement === 3 /* Available */ || // user is entitled
      isProUser(entitlement) || // user is already pro
      entitlement === 5 /* Free */) {
        return this.getSetupEntryProps();
      }
    } else {
      const quotas = this.chatEntitlementService.quotas;
      if (this.chatEntitlementService.sentiment.disabled || this.chatEntitlementService.sentiment.untrusted) {
        text2 = "$(copilot-unavailable)";
        ariaLabel = localize(11284, null);
      } else if (this.chatEntitlementService.entitlement === 1 /* Unknown */) {
        return this.getSetupEntryProps();
      } else if (isTrackedEntitlement(this.chatEntitlementService.entitlement) && isQuotaBlocked(quotas)) {
        const quotaWarning = localize(11278, null);
        text2 = `$(copilot-warning) ${quotaWarning}`;
        ariaLabel = quotaWarning;
        kind = "prominent";
      } else if (this.quotaResumeState === "resumed") {
        const resumedLabel = localize(11279, null);
        text2 = `$(copilot) ${resumedLabel}`;
        ariaLabel = resumedLabel;
        kind = "prominent";
      } else if (this.editorService.activeTextEditorLanguageId && !isCompletionsEnabled(this.configurationService, this.editorService.activeTextEditorLanguageId)) {
        text2 = "$(copilot-unavailable)";
        ariaLabel = localize(11282, null);
      } else if (this.completionsService.isSnoozing()) {
        text2 = "$(copilot-snooze)";
        ariaLabel = localize(11283, null);
      }
    }
    const baseResult = {
      name: localize(11280, null),
      text: text2,
      ariaLabel,
      command: ShowTooltipCommand,
      showInAllWindows: true,
      kind,
      content: this.entryAnchor,
      tooltip: this.dashboardTooltip
    };
    return baseResult;
  }
  getSetupEntryProps() {
    const showSignInLabel = !this.isSignInTitleBarAffordanceVisible();
    const signInLabel = localize(11285, null);
    return {
      name: localize(11280, null),
      text: showSignInLabel ? `$(copilot) ${signInLabel}` : "$(copilot)",
      ariaLabel: showSignInLabel ? signInLabel : localize(11281, null),
      command: CHAT_SETUP_ACTION_ID,
      showInAllWindows: true,
      kind: void 0,
      content: this.entryAnchor
    };
  }
  isSignInTitleBarAffordanceVisible() {
    if (isWeb) {
      return false;
    }
    if (this.chatEntitlementService.entitlement !== 1 /* Unknown */) {
      return false;
    }
    if (this.chatEntitlementService.sentiment.hidden || this.chatEntitlementService.sentiment.disabledInWorkspace) {
      return false;
    }
    if (this.contextKeyService.contextMatchesRules(UpdateTitleBarEditorVisibleContext)) {
      return false;
    }
    const inZenMode = Boolean(this.contextKeyService.getContextKeyValue(InEditorZenModeContext.key));
    if (inZenMode) {
      return false;
    }
    const signInTitleBarEnabled = this.configurationService.getValue("chat.titleBar.signIn.enabled" /* TitleBarSignInEnabled */) !== false;
    return signInTitleBarEnabled;
  }
  dispose() {
    super.dispose();
    this.entry?.dispose();
    this.entry = void 0;
  }
};

ChatStatusBarEntry = __decorateClass([
  __decorateParam(0, IChatEntitlementService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IStatusbarService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInlineCompletionsService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IStorageService)
], ChatStatusBarEntry);
export { isTrackedEntitlement, isQuotaBlocked, hasResolvedQuota, computeQuotaResumeState, ChatStatusBarEntry };
