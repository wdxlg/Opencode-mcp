// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/copilotChatSessions/browser/branchPicker.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { SessionIsolationPickerVisibleContext } from "./module-1770.mjs";
import { BranchPicker } from "./module-3704.mjs";
import { reportNewChatPickerClosed } from "./module-3541.mjs";
import { localize } from "./module-0001.mjs";
import { markOnboardingTarget } from "./module-3542.mjs";
import { autorun } from "./module-0052.mjs";
import { CopilotChatSessionsProvider } from "./module-3689.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/providers/copilotChatSessions/browser/branchPicker.ts
var BranchPicker2 = class extends Disposable {
  // Guards context key until DOM exists (#323361)
  constructor(_session, _configurationService, contextKeyService, sessionsProvidersService, telemetryService, instantiationService) {
    super();
    this._session = _session;
    this._configurationService = _configurationService;
    this.sessionsProvidersService = sessionsProvidersService;
    this.telemetryService = telemetryService;
    this._hasGitRepo = false;
    this._rendered = false;
    this._visibleKey = SessionIsolationPickerVisibleContext.bindTo(contextKeyService);
    this._register(toDisposable(() => this._visibleKey.reset()));
    this._isolationOptionEnabled = this._configurationService.getValue("github.copilot.chat.cli.isolationOption.enabled") !== false;
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("github.copilot.chat.cli.isolationOption.enabled")) {
        this._isolationOptionEnabled = this._configurationService.getValue("github.copilot.chat.cli.isolationOption.enabled") !== false;
        if (!this._isolationOptionEnabled) {
          this._setModeOnSession("worktree");
        }
        this._update();
      }
    }));
    this._picker = this._register(instantiationService.createInstance(BranchPicker, {
      user: "branchPicker",
      onSelectBranch: (branch) => {
        const session = this._getSession();
        const selectedBranch = session?.branch.get();
        reportNewChatPickerClosed(this.telemetryService, {
          id: "NewChatBranchPicker",
          name: "NewChatBranchPicker",
          optionIdBefore: selectedBranch,
          optionIdAfter: branch,
          optionLabelBefore: selectedBranch,
          optionLabelAfter: branch,
          isPII: true
        });
        session?.setBranch(branch);
      },
      isolation: {
        label: localize(5031, null),
        ariaLabel: localize(5032, null),
        onToggle: (checked) => this._applyIsolationToggle(checked),
        markTarget: (element) => markOnboardingTarget(element, "sessions.newSession.isolation")
      }
    }));
    this._register(autorun((reader) => {
      const session = this._session.read(reader);
      const provider = session ? this.sessionsProvidersService.getProvider(session.providerId) : void 0;
      const providerSession = provider instanceof CopilotChatSessionsProvider ? provider.getSession(session.sessionId) : void 0;
      if (providerSession) {
        const isLoading = session?.loading.read(reader);
        const gitRepo = providerSession.gitRepository;
        const repoState = gitRepo?.state?.read?.(reader);
        const hasHeadCommit = repoState ? !!repoState.HEAD?.commit : true;
        this._hasGitRepo = !isLoading && !!gitRepo && hasHeadCommit;
        providerSession.branches.read(reader);
        providerSession.branch.read(reader);
        providerSession.isolationMode.read(reader);
      } else {
        this._hasGitRepo = false;
      }
      this._update();
    }));
  }
  _getSession() {
    const session = this._session.get();
    if (!session) {
      return void 0;
    }
    const provider = this.sessionsProvidersService.getProvider(session.providerId);
    return provider instanceof CopilotChatSessionsProvider ? provider.getSession(session.sessionId) : void 0;
  }
  _getIsolationMode() {
    return this._getSession()?.isolationMode.get() ?? "worktree";
  }
  _setModeOnSession(mode) {
    this._getSession()?.setIsolationMode(mode);
  }
  _applyIsolationToggle(checked) {
    const before = this._getIsolationMode();
    const after2 = checked ? "worktree" : "workspace";
    reportNewChatPickerClosed(this.telemetryService, {
      id: "NewChatIsolationPicker",
      name: "NewChatIsolationPicker",
      optionIdBefore: before,
      optionIdAfter: after2,
      optionLabelBefore: void 0,
      optionLabelAfter: void 0,
      isPII: false
    });
    this._setModeOnSession(after2);
  }
  render(container2) {
    this._rendered = true;
    this._picker.render(container2);
    this._update();
  }
  showPicker() {
    this._picker.showPicker();
  }
  _update() {
    const session = this._getSession();
    const branches = session?.branches.get() ?? [];
    const selectedBranch = session?.branch.get();
    const isLoading = session?.loading.get() ?? false;
    const isWorkspace2 = session?.isolationMode.get() === "workspace";
    const isolationState = !this._isolationOptionEnabled ? "hidden" : this._hasGitRepo ? "enabled" : "disabled";
    this._picker.update({
      label: selectedBranch ?? localize(5030, null),
      branches: branches.map((branch) => ({ name: branch, selected: branch === selectedBranch })),
      status: isLoading ? "loading" : branches.length > 0 ? "ready" : "empty",
      canOpen: !isLoading && !isWorkspace2 && branches.length > 0,
      isolation: {
        checked: this._getIsolationMode() === "worktree",
        state: isolationState,
        disabledReason: !this._hasGitRepo ? localize(5033, null) : void 0
      }
    });
    this._visibleKey.set(this._rendered && this._hasGitRepo && this._isolationOptionEnabled);
  }
};

BranchPicker2 = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ISessionsProvidersService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IInstantiationService)
], BranchPicker2);
export { BranchPicker2 };
