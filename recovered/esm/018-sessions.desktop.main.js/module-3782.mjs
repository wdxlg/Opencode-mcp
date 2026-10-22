// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/automationDialog.ts
import { $, DisposableResizeObserver, EventType, addDisposableListener, addStandardDisposableListener, append, clearNode, getWindow, isEditableElement } from "./module-0075.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { isMobilePickerSheetTarget } from "./module-3565.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { BranchPicker } from "./module-3704.mjs";
import { autorun } from "./module-0052.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { AutomationIsolationModel, normalizeAutomationBranchNames } from "./module-3781.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IGitService } from "./module-1485.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ILogService } from "./module-0095.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { InputBox } from "./module-0600.mjs";
import { defaultCheckboxStyles, defaultInputBoxStyles, defaultSelectBoxStyles } from "./module-0513.mjs";
import { hasNativeContextMenu } from "./module-0515.mjs";
import { SelectBox } from "./module-0475.mjs";
import { DAYS_OF_WEEK } from "./module-2639.mjs";
import { derived } from "./module-0054.mjs";
import { MobileSessionTypePicker } from "./module-3570.mjs";
import { constObservable } from "./module-0061.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ChatInputPart } from "./module-2179.mjs";
import { isModeConsideredBuiltIn } from "./module-2169.mjs";
import { isChatPermissionLevel } from "./module-0965.mjs";
import { Checkbox } from "./module-0549.mjs";
import { WorkspacePicker } from "./module-3564.mjs";
import { Codicon } from "./module-0085.mjs";
import { renderIcon } from "./module-0467.mjs";
import { SESSION_WORKSPACE_GROUP_LOCAL } from "./module-1767.mjs";
import { shouldUseMobileWorkspacePickerSheet, showMobileWorkspacePickerSheet } from "./module-3566.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ICodeEditorService } from "./module-0078.mjs";


// src/vs/sessions/contrib/automations/browser/automationDialog.ts
var $125 = $;

var INTERVALS = [
  { value: "manual", label: localize(4188, null) },
  { value: "hourly", label: localize(4187, null) },
  { value: "daily", label: localize(4186, null) },
  { value: "weekly", label: localize(4189, null) }
];

function isAutomationDialogPopupTarget(relatedTarget) {
  return isMobilePickerSheetTarget(relatedTarget) || !!relatedTarget.closest(
    ".context-view, .quick-input-widget, .monaco-menu-container, .monaco-hover, .monaco-hover-content"
  );
}

function isAutomationDialogEditCommand(commandId, target) {
  return (commandId === "undo" || commandId === "redo") && isEditableElement(target);
}

async function canSelectAutomationWorkspace(folderUri, preferredProviderId, sessionsManagementService, workspaceTrustRequestService) {
  const resolved = sessionsManagementService.resolveWorkspace(folderUri, preferredProviderId);
  if (!resolved) {
    return false;
  }
  if (!resolved.workspace.requiresWorkspaceTrust) {
    return true;
  }
  return !!await workspaceTrustRequestService.requestResourcesTrust({
    uri: folderUri,
    message: localize(4182, null)
  });
}

function registerAutomationDialogKeyboardNavigation(targetWindow, getFocusableElements, isPopupTarget) {
  const store = new DisposableStore();
  let suppressPopupEscapeKeyUp = false;
  const visibleFocusableElements = () => getFocusableElements().filter((element) => {
    if (!element.isConnected || element.tabIndex < 0 || element.hasAttribute("disabled")) {
      return false;
    }
    for (let current = element; current; current = current.parentElement) {
      if (current.hidden || current.getAttribute("aria-hidden") === "true") {
        return false;
      }
      const style = targetWindow.getComputedStyle(current);
      if (style.display === "none" || style.visibility === "hidden") {
        return false;
      }
    }
    return true;
  });
  store.add(addDisposableListener(targetWindow, EventType.KEY_DOWN, (event) => {
    const target = event.target;
    if (target instanceof targetWindow.HTMLElement && isPopupTarget(target)) {
      suppressPopupEscapeKeyUp = event.key === "Escape";
      return;
    }
    suppressPopupEscapeKeyUp = false;
    if (event.key !== "Tab") {
      return;
    }
    const focusableElements = visibleFocusableElements();
    if (focusableElements.length === 0) {
      return;
    }
    const activeElement = targetWindow.document.activeElement;
    let focusedIndex = focusableElements.findIndex((element) => element === activeElement);
    if (focusedIndex < 0) {
      focusedIndex = focusableElements.findIndex((element) => !!activeElement && element.contains(activeElement));
    }
    if (focusedIndex < 0) {
      focusedIndex = event.shiftKey ? 0 : -1;
    }
    const nextIndex = event.shiftKey ? (focusedIndex - 1 + focusableElements.length) % focusableElements.length : (focusedIndex + 1) % focusableElements.length;
    event.preventDefault();
    event.stopImmediatePropagation();
    focusableElements[nextIndex].focus();
  }, true));
  store.add(addDisposableListener(targetWindow, EventType.KEY_UP, (event) => {
    if (event.key === "Escape" && suppressPopupEscapeKeyUp) {
      suppressPopupEscapeKeyUp = false;
      event.stopImmediatePropagation();
      return;
    }
    suppressPopupEscapeKeyUp = false;
  }, true));
  return {
    focusFirst: () => visibleFocusableElements()[0]?.focus(),
    dispose: () => store.dispose()
  };
}

var AutomationSessionDraftSynchronizer = class extends Disposable {
  constructor(sessionsManagementService, canSelectWorkspace, onError) {
    super();
    this.sessionsManagementService = sessionsManagementService;
    this.canSelectWorkspace = canSelectWorkspace;
    this.onError = onError;
    this.generation = 0;
    this.syncScheduled = false;
    this.syncPromise = Promise.resolve();
    this.disposed = false;
  }
  update(target) {
    this.requestedTarget = target;
    this.generation++;
    this.scheduleSync();
  }
  async waitForSync() {
    let pendingSync;
    do {
      pendingSync = this.syncPromise;
      await pendingSync;
    } while (pendingSync !== this.syncPromise);
  }
  scheduleSync() {
    if (this.syncScheduled) {
      return;
    }
    this.syncScheduled = true;
    this.syncPromise = Promise.resolve().then(() => {
      this.syncScheduled = false;
      if (!this.disposed) {
        return this.sync(this.generation);
      }
      return void 0;
    });
  }
  async sync(generation) {
    const target = this.requestedTarget;
    if (!target) {
      this.discardSession();
      return;
    }
    if (this.matchesAppliedTarget(target)) {
      return;
    }
    try {
      if (target.kind === "workspace" && !await this.canSelectWorkspace(target.folderUri, target.providerId)) {
        if (generation === this.generation) {
          this.discardSession();
        }
        return;
      }
      if (this.disposed || generation !== this.generation) {
        return;
      }
      this.session = target.kind === "quickChat" ? this.sessionsManagementService.createAutomationQuickChat({
        providerId: target.providerId,
        sessionTypeId: target.sessionTypeId
      }) : this.sessionsManagementService.createAutomationSession(target.folderUri, {
        providerId: target.providerId,
        sessionTypeId: target.sessionTypeId
      });
      this.appliedTarget = target;
    } catch (error) {
      if (!this.disposed && generation === this.generation) {
        this.discardSession();
        this.onError(error);
      }
    }
  }
  matchesAppliedTarget(target) {
    if (!this.session || !this.appliedTarget || this.sessionsManagementService.automationSession.get()?.sessionId !== this.session.sessionId || this.appliedTarget.kind !== target.kind || this.appliedTarget.providerId !== target.providerId || this.appliedTarget.sessionTypeId !== target.sessionTypeId) {
      return false;
    }
    return target.kind === "quickChat" || this.appliedTarget.kind === "workspace" && isEqual2(this.appliedTarget.folderUri, target.folderUri);
  }
  discardSession() {
    if (this.session) {
      this.sessionsManagementService.discardAutomationSession(this.session);
    }
    this.session = void 0;
    this.appliedTarget = void 0;
  }
  dispose() {
    this.disposed = true;
    this.generation++;
    this.discardSession();
    super.dispose();
  }
};

function resolveAutomationModelIdentifier(languageModelsService, identifier2, logicalSessionType, modelTarget) {
  if (!logicalSessionType || !modelTarget) {
    return identifier2;
  }
  const sourceModel = languageModelsService.lookupLanguageModel(identifier2);
  if (sourceModel?.targetChatSessionType !== logicalSessionType) {
    return identifier2;
  }
  return languageModelsService.getLanguageModelIds().find((candidateIdentifier) => {
    const candidate = languageModelsService.lookupLanguageModel(candidateIdentifier);
    return candidate?.targetChatSessionType === modelTarget && candidate.id === sourceModel.id;
  }) ?? identifier2;
}

var AUTOMATIONS_HARNESS_CHIP_ACTION_ID = "workbench.action.chat.renderAutomationsHarnessChip";

var AUTOMATIONS_WORKSPACE_PICKER_ACTION_ID = "workbench.action.chat.renderAutomationsWorkspacePicker";

var AUTOMATIONS_ISOLATION_GROUP_ACTION_ID = "workbench.action.chat.renderAutomationsIsolationGroup";

function setAutomationControlVisible(container2, visible) {
  container2.style.display = visible ? "" : "none";
  if (visible) {
    container2.removeAttribute("aria-hidden");
  } else {
    container2.setAttribute("aria-hidden", "true");
  }
}

var AutomationIsolationGroupActionViewItem = class extends BaseActionViewItem {
  constructor(action, state, isolationModel, workspaceFolder, onDidChangeTarget, revalidate, options3, visible, gitService, sessionsManagementService, pickerLogService, instantiationService) {
    super(void 0, action, options3);
    this.state = state;
    this.isolationModel = isolationModel;
    this.workspaceFolder = workspaceFolder;
    this.onDidChangeTarget = onDidChangeTarget;
    this.revalidate = revalidate;
    this.visible = visible;
    this.gitService = gitService;
    this.sessionsManagementService = sessionsManagementService;
    this.pickerLogService = pickerLogService;
    this.renderDisposables = this._register(new DisposableStore());
    this.branchRepoDisposable = this._register(new MutableDisposable());
    this.branchRequest = this._register(new MutableDisposable());
    this.branchRequestId = 0;
    this.branchLoadState = "noFolder";
    this.branches = [];
    this.worktreeCapabilityResolved = false;
    this.branchPicker = this._register(instantiationService.createInstance(BranchPicker, {
      user: "automationBranchPicker",
      slotClassName: "automation-form-branch-picker-slot",
      triggerClassName: "automation-form-branch-slot",
      labelClassName: "automation-form-branch-name",
      descriptionClassName: "automation-form-branch-description",
      keepDisabledFocusable: true,
      renderDisabledAsStatic: true,
      ariaLive: "polite",
      onSelectBranch: (branch) => {
        this.isolationModel.selectBranch(branch);
        this.renderBranchControl();
      },
      onRetry: () => {
        void this.reloadRepository(this.isolationModel.folderUri);
      },
      isolation: {
        label: localize(4168, null),
        ariaLabel: localize(4167, null),
        onToggle: (checked) => {
          this.isolationModel.selectIsolationMode(checked ? "worktree" : "workspace");
          this.renderBranchControl();
        }
      }
    }));
  }
  render(container2) {
    this.renderDisposables.clear();
    this.branchRepoDisposable.clear();
    this.cancelBranchRequest();
    clearNode(container2);
    container2.style.marginLeft = "auto";
    const visible = this.visible;
    if (visible) {
      this.renderDisposables.add(autorun((reader) => {
        setAutomationControlVisible(container2, visible.read(reader));
      }));
    }
    const isolationGroup = append(container2, $125("span.automation-form-isolation-group"));
    this.branchPicker.render(isolationGroup);
    this.refreshTargetCapability();
    this.renderBranchControl();
    this.renderDisposables.add(autorun((reader) => {
      const folderUri = this.workspaceFolder.read(reader);
      this.refreshTargetAndRender();
      void this.reloadRepository(folderUri);
    }));
    this.renderDisposables.add(this.onDidChangeTarget(() => {
      this.refreshTargetAndRender();
    }));
    this.renderDisposables.add(this.sessionsManagementService.onDidChangeSessionTypes(() => this.refreshTargetAndRender()));
    this.renderDisposables.add({
      dispose: () => {
        this.cancelBranchRequest();
      }
    });
  }
  showPicker(anchor) {
    this.branchPicker.showPicker(anchor);
  }
  refreshTargetCapability() {
    const folderUri = this.isolationModel.folderUri;
    const sessionTypeId = this.state.sessionTypeId;
    if (!folderUri || !sessionTypeId) {
      this.worktreeCapabilityResolved = false;
      this.isolationModel.setSupportsWorktreeConfiguration(false);
      return;
    }
    const sessionType = this.sessionsManagementService.getSessionTypesForFolder(folderUri).find(
      (candidate) => candidate.sessionType.id === sessionTypeId && (this.state.providerId === void 0 || candidate.providerId === this.state.providerId)
    )?.sessionType;
    if (!sessionType) {
      this.worktreeCapabilityResolved = false;
      this.isolationModel.setSupportsWorktreeConfiguration(false);
      return;
    }
    this.worktreeCapabilityResolved = true;
    const supportsWorktreeConfiguration = sessionType.supportsWorktreeConfiguration === true;
    this.isolationModel.setSupportsWorktreeConfiguration(supportsWorktreeConfiguration);
    if (!supportsWorktreeConfiguration && this.isolationModel.isolationMode === "worktree") {
      this.isolationModel.selectIsolationMode("workspace");
    }
  }
  refreshTargetAndRender() {
    this.refreshTargetCapability();
    this.renderBranchControl();
  }
  renderBranchControl() {
    const presentation2 = this.getBranchPresentation();
    const canOpen = this.canOpenBranchPicker();
    const selectedBranch = this.isolationModel.selectedBranch ?? this.isolationModel.headBranch;
    const branches = this.branches.map((branch) => ({
      name: branch,
      selected: branch === selectedBranch
    }));
    if (selectedBranch && !this.branches.includes(selectedBranch)) {
      branches.unshift({
        name: selectedBranch,
        selected: true,
        unavailable: true
      });
    }
    const worktreeUnavailableReason = this.getWorktreeUnavailableReason();
    const isolationState = worktreeUnavailableReason === void 0 ? "enabled" : "disabled";
    this.branchPicker.update({
      label: presentation2.label,
      branches,
      status: this.branchLoadState === "loadingRepository" || this.branchLoadState === "loadingBranches" ? "loading" : this.branchLoadState === "error" ? "error" : this.branchLoadState === "ready" ? "ready" : "empty",
      canOpen,
      disabledReason: presentation2.reason,
      missing: presentation2.missing,
      showChevron: this.isolationModel.branchPickerAvailable || this.branchLoadState === "error",
      isolation: {
        checked: this.isolationModel.isolationMode === "worktree",
        state: isolationState,
        disabledReason: worktreeUnavailableReason
      }
    });
    this.revalidate();
  }
  getBranchPresentation() {
    const displayBranch = this.isolationModel.displayBranch;
    if (!this.isolationModel.folderUri) {
      return {
        label: localize(4159, null),
        reason: localize(4155, null),
        missing: true
      };
    }
    if (!this.worktreeCapabilityResolved) {
      return {
        label: displayBranch ?? localize(4159, null),
        reason: localize(4145, null),
        missing: !displayBranch
      };
    }
    if (!this.isolationModel.supportsWorktreeConfiguration) {
      return {
        label: displayBranch ?? localize(4159, null),
        reason: localize(4160, null),
        missing: !displayBranch
      };
    }
    if (this.branchLoadState === "error") {
      return {
        label: displayBranch ?? localize(4149, null),
        reason: localize(4150, null),
        missing: !displayBranch
      };
    }
    if (this.isolationModel.isolationMode !== "worktree") {
      return {
        label: displayBranch ?? this.detachedCommit ?? localize(4159, null),
        reason: localize(4148, null),
        missing: !displayBranch && !this.detachedCommit
      };
    }
    switch (this.branchLoadState) {
      case "loadingRepository":
      case "loadingBranches":
        return {
          label: displayBranch ?? localize(4151, null),
          reason: localize(4152, null),
          missing: !displayBranch
        };
      case "noRepository":
        return {
          label: displayBranch ?? localize(4156, null),
          reason: localize(4157, null),
          missing: !displayBranch
        };
      case "empty":
        return {
          label: displayBranch ?? localize(4153, null),
          reason: localize(4154, null),
          missing: !displayBranch
        };
      case "ready":
        return {
          label: displayBranch ?? localize(4158, null),
          reason: localize(4146, null),
          missing: !displayBranch
        };
      case "noFolder":
        return {
          label: localize(4159, null),
          reason: localize(4155, null),
          missing: true
        };
    }
  }
  canOpenBranchPicker() {
    if (this.branchLoadState === "error") {
      return !!this.isolationModel.folderUri && this.worktreeCapabilityResolved && this.isolationModel.supportsWorktreeConfiguration;
    }
    return this.isolationModel.branchPickerAvailable && this.branchLoadState !== "noFolder" && this.branchLoadState !== "noRepository" && this.branchLoadState !== "loadingRepository" && this.branchLoadState !== "loadingBranches";
  }
  getWorktreeUnavailableReason() {
    if (!this.isolationModel.folderUri) {
      return localize(4169, null);
    }
    if (!this.worktreeCapabilityResolved) {
      return localize(4145, null);
    }
    if (!this.isolationModel.supportsWorktreeConfiguration) {
      return localize(4170, null);
    }
    if (this.isolationModel.selectedBranch) {
      return void 0;
    }
    switch (this.branchLoadState) {
      case "loadingRepository":
      case "loadingBranches":
        return localize(4152, null);
      case "noRepository":
        return localize(4157, null);
      case "error":
        return localize(4150, null);
      case "empty":
        return localize(4154, null);
      case "ready":
        return this.branches.length > 0 ? void 0 : localize(4154, null);
      case "noFolder":
        return localize(4169, null);
    }
  }
  cancelBranchRequest() {
    this.branchRequest.value?.cancel();
    this.branchRequest.clear();
  }
  async reloadRepository(folder) {
    const requestId = ++this.branchRequestId;
    this.cancelBranchRequest();
    this.branchRepoDisposable.clear();
    this.repository = void 0;
    this.branches = [];
    this.detachedCommit = void 0;
    if (!folder) {
      this.branchLoadState = "noFolder";
      this.isolationModel.setHeadBranch(void 0);
      this.renderBranchControl();
      return;
    }
    this.branchLoadState = "loadingRepository";
    this.renderBranchControl();
    const cts = new CancellationTokenSource();
    this.branchRequest.value = cts;
    let repo;
    try {
      repo = await this.gitService.openRepository(folder);
    } catch (error) {
      if (requestId !== this.branchRequestId || cts.token.isCancellationRequested) {
        return;
      }
      this.pickerLogService.error("[AutomationDialog] Failed to open Git repository for branch selection.", error);
      this.branchLoadState = "error";
      this.renderBranchControl();
      return;
    }
    if (requestId !== this.branchRequestId || cts.token.isCancellationRequested) {
      return;
    }
    if (!repo) {
      this.branchLoadState = "noRepository";
      this.renderBranchControl();
      return;
    }
    this.repository = repo;
    const watcher = new DisposableStore();
    watcher.add(autorun((reader) => {
      const head = repo.state.read(reader).HEAD;
      if (head?.commit && head.name) {
        this.detachedCommit = void 0;
        this.isolationModel.setHeadBranch(head.name);
      } else if (head?.commit) {
        this.detachedCommit = localize(4147, null, head.commit.slice(0, 7));
        this.isolationModel.setHeadBranch(void 0);
      } else {
        this.detachedCommit = void 0;
        this.isolationModel.setHeadBranch(void 0);
      }
      this.renderBranchControl();
    }));
    this.branchRepoDisposable.value = watcher;
    this.branchLoadState = "loadingBranches";
    this.renderBranchControl();
    try {
      const refs = await repo.getRefs({ pattern: "refs/heads" }, cts.token);
      if (requestId !== this.branchRequestId || cts.token.isCancellationRequested || this.repository !== repo) {
        return;
      }
      this.branches = normalizeAutomationBranchNames(refs.map((ref) => ref.name));
      this.branchLoadState = this.branches.length > 0 ? "ready" : "empty";
    } catch (error) {
      if (requestId !== this.branchRequestId || cts.token.isCancellationRequested) {
        return;
      }
      this.pickerLogService.error("[AutomationDialog] Failed to load local branches.", error);
      this.branchLoadState = "error";
    }
    this.renderBranchControl();
  }
};

AutomationIsolationGroupActionViewItem = __decorateClass([
  __decorateParam(8, IGitService),
  __decorateParam(9, ISessionsManagementService),
  __decorateParam(10, ILogService),
  __decorateParam(11, IInstantiationService)
], AutomationIsolationGroupActionViewItem);

var AutomationPickerActionViewItem = class extends BaseActionViewItem {
  constructor(action, renderPicker, visible, options3) {
    super(void 0, action, options3);
    this.renderPicker = renderPicker;
    this.visible = visible;
    this.visibilityWatch = this._register(new MutableDisposable());
  }
  render(container2) {
    super.render(container2);
    clearNode(container2);
    this.renderPicker(container2);
    const visible = this.visible;
    this.visibilityWatch.value = visible ? autorun((reader) => {
      setAutomationControlVisible(container2, visible.read(reader));
    }) : void 0;
  }
};

registerAction2(class OpenAutomationsHarnessChipAction extends Action2 {
  constructor() {
    super({
      id: AUTOMATIONS_HARNESS_CHIP_ACTION_ID,
      title: localize2(4165, "Automations Harness Chip"),
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: -1,
        when: ChatContextKeys.inAutomationsDialog
      }]
    });
  }
  async run() {
  }
});

registerAction2(class OpenAutomationsWorkspacePickerAction extends Action2 {
  constructor() {
    super({
      id: AUTOMATIONS_WORKSPACE_PICKER_ACTION_ID,
      title: localize2(4183, "Automations Workspace Picker"),
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 0,
        when: ChatContextKeys.inAutomationsDialog
      }]
    });
  }
  async run() {
  }
});

registerAction2(class OpenAutomationsIsolationGroupAction extends Action2 {
  constructor() {
    super({
      id: AUTOMATIONS_ISOLATION_GROUP_ACTION_ID,
      title: localize2(4171, "Automations Isolation Group"),
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 2,
        when: ChatContextKeys.inAutomationsDialog
      }]
    });
  }
  async run() {
  }
});

function renderForm(form, state, disposables, validation, revalidate, instantiationService, contextKeyService, contextViewService, configurationService, languageModelsService, layoutService, logService, productService, sessionsManagementService, workspaceTrustRequestService, initialPrompt, initialMode, initialPermissionLevel, initialModelId) {
  const nameRow = append(form, $125(".automation-form-row"));
  append(nameRow, $125("span.automation-form-label", void 0, localize(4172, null)));
  const nameInputContainer = append(nameRow, $125(".automation-form-input-host"));
  const nameInput = disposables.add(new InputBox(nameInputContainer, contextViewService, {
    inputBoxStyles: defaultInputBoxStyles,
    placeholder: localize(4173, null),
    ariaLabel: localize(4172, null)
  }));
  nameInput.value = state.name;
  disposables.add(nameInput.onDidChange((value2) => {
    state.name = value2;
    revalidate();
  }));
  const scheduleRow = append(form, $125(".automation-form-row.automation-form-schedule-row"));
  const useCustomDrawn = !hasNativeContextMenu(configurationService);
  const intervalGroup = append(scheduleRow, $125(".automation-form-schedule-group"));
  append(intervalGroup, $125("span.automation-form-label", void 0, localize(4166, null)));
  const intervalOptions = INTERVALS.map((item) => ({ text: item.label }));
  const intervalIndex = Math.max(0, INTERVALS.findIndex((item) => item.value === state.interval));
  const intervalSelect = disposables.add(new SelectBox(
    intervalOptions,
    intervalIndex,
    contextViewService,
    defaultSelectBoxStyles,
    { ariaLabel: localize(4166, null), useCustomDrawn }
  ));
  const intervalSelectContainer = append(intervalGroup, $125(".automation-form-schedule-select-container"));
  intervalSelect.render(intervalSelectContainer);
  const timeGroup = append(scheduleRow, $125(".automation-form-schedule-group.automation-form-time-group"));
  append(timeGroup, $125("span.automation-form-label", void 0, localize(4181, null)));
  const timeOptions = buildTimeOptions();
  const initialTimeIndex = nearestTimeOptionIndex(state.hour, state.minute);
  state.hour = timeOptions[initialTimeIndex].hour;
  state.minute = timeOptions[initialTimeIndex].minute;
  const timeSelect = disposables.add(new SelectBox(
    timeOptions.map((opt) => ({ text: opt.label })),
    initialTimeIndex,
    contextViewService,
    defaultSelectBoxStyles,
    { ariaLabel: localize(4181, null), useCustomDrawn }
  ));
  const timeSelectContainer = append(timeGroup, $125(".automation-form-schedule-select-container.automation-form-time-select-container"));
  timeSelect.render(timeSelectContainer);
  disposables.add(timeSelect.onDidSelect((e4) => {
    const opt = timeOptions[e4.index];
    state.hour = opt.hour;
    state.minute = opt.minute;
  }));
  const dayGroup = append(scheduleRow, $125(".automation-form-schedule-group.automation-form-day-group"));
  append(dayGroup, $125("span.automation-form-label", void 0, localize(4162, null)));
  const dayOptions = DAYS_OF_WEEK.map((d) => ({ text: d }));
  const daySelect = disposables.add(new SelectBox(
    dayOptions,
    Math.min(Math.max(state.day, 0), DAYS_OF_WEEK.length - 1),
    contextViewService,
    defaultSelectBoxStyles,
    { ariaLabel: localize(4162, null), useCustomDrawn }
  ));
  const daySelectContainer = append(dayGroup, $125(".automation-form-schedule-select-container"));
  daySelect.render(daySelectContainer);
  disposables.add(daySelect.onDidSelect((e4) => {
    state.day = e4.index;
  }));
  const applyIntervalVisibility = () => {
    const showTime = state.interval === "daily" || state.interval === "weekly";
    const showDay = state.interval === "weekly";
    timeGroup.style.display = showTime ? "" : "none";
    dayGroup.style.display = showDay ? "" : "none";
  };
  applyIntervalVisibility();
  disposables.add(intervalSelect.onDidSelect((e4) => {
    state.interval = INTERVALS[e4.index].value;
    applyIntervalVisibility();
  }));
  const isolationModel = new AutomationIsolationModel(state);
  const workspaceControlsVisible = derived((reader) => !isolationModel.isQuickChatObs.read(reader));
  const sessionTypePicker = disposables.add(instantiationService.createInstance(MobileSessionTypePicker, constObservable(void 0), { persistSelection: false, telemetrySource: "AutomationSessionTypePicker", showChevron: false }));
  sessionTypePicker.setQuickChatSource(isolationModel.isQuickChatObs);
  sessionTypePicker.setFolderSource(isolationModel.folderUriObs, {
    initialPick: state.sessionTypeId ? { providerId: state.providerId, sessionTypeId: state.sessionTypeId } : void 0,
    preserveUnavailableInitialPick: true
  });
  const onDidChangeSessionType = disposables.add(new Emitter());
  const onDidChangeSessionTarget = disposables.add(new Emitter());
  const sessionTypeDelegate = {
    getActiveSessionProvider: () => sessionTypePicker.modelTargetChatSessionType.get(),
    onDidChangeActiveSessionProvider: onDidChangeSessionType.event
  };
  const syncStateFromPicker = () => {
    const pick = sessionTypePicker.selectedPick;
    state.providerId = pick?.providerId;
    state.sessionTypeId = pick?.sessionTypeId;
    onDidChangeSessionTarget.fire();
  };
  disposables.add(autorun((reader) => {
    const modelTarget = sessionTypePicker.modelTargetChatSessionType.read(reader);
    if (modelTarget) {
      onDidChangeSessionType.fire(modelTarget);
    }
  }));
  syncStateFromPicker();
  const workspacePicker = disposables.add(instantiationService.createInstance(MobileAutomationsWorkspacePicker, {
    restoreFromSessions: false,
    canSelectWorkspace: (folderUri, preferredProviderId) => canSelectAutomationWorkspace(folderUri, preferredProviderId, sessionsManagementService, workspaceTrustRequestService)
  }));
  workspacePicker.setTargetModel(isolationModel);
  workspacePicker.setLayoutService(layoutService);
  const automationSessionDraftSynchronizer = disposables.add(new AutomationSessionDraftSynchronizer(
    sessionsManagementService,
    (folderUri, preferredProviderId) => canSelectAutomationWorkspace(folderUri, preferredProviderId, sessionsManagementService, workspaceTrustRequestService),
    (error) => logService.error("[AutomationDialog] Failed to synchronize the automation session draft.", error)
  ));
  const updateAutomationSessionTarget = () => {
    const folderUri = isolationModel.folderUriObs.get();
    const pick = sessionTypePicker.selectedPick;
    const isQuickChat2 = isolationModel.isQuickChatObs.get();
    if (!pick || isQuickChat2 && !pick.providerId || !isQuickChat2 && !folderUri) {
      automationSessionDraftSynchronizer.update(void 0);
      return;
    }
    if (isQuickChat2) {
      const providerId = pick.providerId;
      if (providerId) {
        automationSessionDraftSynchronizer.update({ kind: "quickChat", providerId, sessionTypeId: pick.sessionTypeId });
      }
    } else if (folderUri) {
      automationSessionDraftSynchronizer.update({ kind: "workspace", folderUri, providerId: pick.providerId, sessionTypeId: pick.sessionTypeId });
    }
  };
  disposables.add(sessionTypePicker.onDidChangeSelectedPick(() => {
    syncStateFromPicker();
    updateAutomationSessionTarget();
    revalidate();
  }));
  disposables.add(sessionsManagementService.onDidChangeSessionTypes(() => updateAutomationSessionTarget()));
  if (state.folderUri) {
    workspacePicker.setSelectedWorkspace(state.folderUri, { fireEvent: false, persist: false });
  }
  disposables.add(workspacePicker.onDidSelectWorkspace((uri4) => {
    if (isolationModel.setWorkspace(uri4)) {
      updateAutomationSessionTarget();
      revalidate();
    }
  }));
  if (!state.isQuickChat && !state.folderUri && workspacePicker.selectedFolderUri) {
    isolationModel.setWorkspace(workspacePicker.selectedFolderUri);
  }
  disposables.add(autorun((reader) => {
    isolationModel.isQuickChatObs.read(reader);
    updateAutomationSessionTarget();
    revalidate();
  }));
  const promptRow = append(form, $125(".automation-form-row"));
  append(promptRow, $125("span.automation-form-label", void 0, localize(4177, null)));
  const promptHost = append(promptRow, $125(".automation-form-prompt-host.interactive-session"));
  const chatInputStyles = {
    overlayBackground: "var(--vscode-input-background)",
    listForeground: "var(--vscode-foreground)",
    listBackground: "var(--vscode-input-background)"
  };
  let automationIsolationAction;
  const overflowIsolationItem = disposables.add(new MutableDisposable());
  const chatInputOptions = {
    renderFollowups: false,
    renderInputToolbarBelowInput: false,
    renderWorkingSet: false,
    enableImplicitContext: false,
    supportsChangingModes: true,
    hideCustomChatModes: true,
    suppressModePreferredModel: true,
    suppressModelPersistence: true,
    menus: {
      executeToolbar: MenuId.AutomationsDialogInput,
      telemetrySource: "automations.dialog"
    },
    widgetViewKindTag: "automations-dialog",
    // A scheduling form, not a chat about to be sent: keep promos out.
    isTransientChat: true,
    inputEditorMinLines: 3,
    // The dialog renders the composer flush with its form column (the
    // `.interactive-input-part` margin is zeroed in CSS), so there is no
    // outer horizontal gutter. Without this, ChatInputPart would still
    // reserve the default 24px margin and lay the editor out too narrow,
    // leaving its scrollbar floating ~24px in from the right wall.
    inputPartHorizontalPadding: 0,
    sessionTypePickerDelegate: sessionTypeDelegate,
    secondaryToolbarOverflowActionHandler: (actionId, anchor) => {
      if (actionId === AUTOMATIONS_HARNESS_CHIP_ACTION_ID) {
        sessionTypePicker.showPicker(anchor);
        return true;
      }
      if (actionId === AUTOMATIONS_WORKSPACE_PICKER_ACTION_ID) {
        workspacePicker.showPicker(false, anchor);
        return true;
      }
      if (actionId === AUTOMATIONS_ISOLATION_GROUP_ACTION_ID && automationIsolationAction) {
        const item = instantiationService.createInstance(
          AutomationIsolationGroupActionViewItem,
          automationIsolationAction,
          state,
          isolationModel,
          isolationModel.folderUriObs,
          onDidChangeSessionTarget.event,
          revalidate,
          void 0,
          workspaceControlsVisible
        );
        overflowIsolationItem.value = item;
        item.render($(".automation-overflow-isolation-picker"));
        item.showPicker(anchor);
        return true;
      }
      return false;
    },
    secondaryToolbarActionViewItemProvider: (action, itemOptions) => {
      if (action.id === AUTOMATIONS_HARNESS_CHIP_ACTION_ID) {
        return new AutomationPickerActionViewItem(action, (container2) => sessionTypePicker.render(container2), void 0, itemOptions);
      }
      if (action.id === AUTOMATIONS_WORKSPACE_PICKER_ACTION_ID) {
        return new AutomationPickerActionViewItem(action, (container2) => {
          container2.classList.add("chat-input-picker-item");
          workspacePicker.render(container2);
        }, void 0, itemOptions);
      }
      if (action.id === AUTOMATIONS_ISOLATION_GROUP_ACTION_ID) {
        automationIsolationAction = action;
        const item = instantiationService.createInstance(
          AutomationIsolationGroupActionViewItem,
          action,
          state,
          isolationModel,
          isolationModel.folderUriObs,
          onDidChangeSessionTarget.event,
          revalidate,
          itemOptions,
          workspaceControlsVisible
        );
        return item;
      }
      return void 0;
    }
  };
  const stubWidget = {
    onDidChangeViewModel: Event2.None,
    viewModel: void 0,
    contribs: [],
    location: "panel" /* Chat */,
    viewContext: {},
    lockToCodingAgent: () => {
    },
    unlockFromCodingAgent: () => {
    }
  };
  const scopedContextKeyService = disposables.add(contextKeyService.createScoped(promptHost));
  ChatContextKeys.location.bindTo(scopedContextKeyService).set("panel" /* Chat */);
  ChatContextKeys.inChatSession.bindTo(scopedContextKeyService).set(true);
  ChatContextKeys.inAutomationsDialog.bindTo(scopedContextKeyService).set(true);
  const scopedInstantiationService = disposables.add(
    instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService]))
  );
  const chatInput = disposables.add(
    scopedInstantiationService.createInstance(ChatInputPart, "panel" /* Chat */, chatInputOptions, chatInputStyles, false)
  );
  chatInput.render(promptHost, initialPrompt, stubWidget);
  chatInput.inputEditor.updateOptions({ placeholder: localize(4178, null) });
  if (initialMode) {
    const getUnfilteredInitialMode = () => {
      const modes = chatInput.currentChatModesObs.get();
      return modes.findModeById(initialMode) ?? modes.findModeByName(initialMode);
    };
    const isHiddenCustomInitialMode = () => {
      const mode = getUnfilteredInitialMode();
      return !!mode && chatInputOptions.hideCustomChatModes && !isModeConsideredBuiltIn(mode, productService);
    };
    if (isHiddenCustomInitialMode()) {
      logService.trace(`[AutomationDialog] Skipping hidden custom initial mode "${initialMode}". Falling back to the default mode.`);
    } else {
      chatInput.setChatMode(
        initialMode,
        /* storeSelection */
        false
      );
    }
    if (chatInput.currentModeObs.get().id !== initialMode && !isHiddenCustomInitialMode()) {
      const baseline = chatInput.currentModeObs.get().id;
      const retry2 = disposables.add(new MutableDisposable());
      const tryApply = () => {
        if (chatInput.currentModeObs.get().id !== baseline) {
          retry2.clear();
          return;
        }
        if (isHiddenCustomInitialMode()) {
          logService.trace(`[AutomationDialog] Skipping hidden custom initial mode "${initialMode}" after modes updated. Falling back to the default mode.`);
          retry2.clear();
          return;
        }
        const modes = chatInput.currentChatModesObs.get();
        if (modes.findModeById(initialMode) || modes.findModeByName(initialMode)) {
          chatInput.setChatMode(
            initialMode,
            /* storeSelection */
            false
          );
          if (chatInput.currentModeObs.get().id === initialMode) {
            retry2.clear();
          }
        }
      };
      retry2.value = autorun((reader) => {
        const modes = chatInput.currentChatModesObs.read(reader);
        reader.store.add(modes.onDidChange(tryApply));
        tryApply();
      });
    }
  }
  if (initialPermissionLevel && isChatPermissionLevel(initialPermissionLevel)) {
    chatInput.setPermissionLevel(initialPermissionLevel);
  }
  chatInput.resetLanguageModelToDefault();
  const resolveInitialModelId = () => initialModelId ? resolveAutomationModelIdentifier(
    languageModelsService,
    initialModelId,
    state.sessionTypeId,
    sessionTypePicker.modelTargetChatSessionType.get()
  ) : void 0;
  const resolvedInitialModelId = resolveInitialModelId();
  if (resolvedInitialModelId && !chatInput.switchModelByIdentifier(
    resolvedInitialModelId,
    /* storeSelection */
    false
  )) {
    const baseline = chatInput.selectedLanguageModel.get()?.identifier;
    const retry2 = disposables.add(new MutableDisposable());
    retry2.value = Event2.any(
      languageModelsService.onDidChangeLanguageModels,
      Event2.fromObservableLight(sessionTypePicker.modelTargetChatSessionType)
    )(() => {
      if (chatInput.selectedLanguageModel.get()?.identifier !== baseline) {
        retry2.clear();
        return;
      }
      const modelIdentifier = resolveInitialModelId();
      if (modelIdentifier && chatInput.switchModelByIdentifier(
        modelIdentifier,
        /* storeSelection */
        false
      )) {
        retry2.clear();
      }
    });
  }
  disposables.add(chatInput.inputEditor.onDidChangeModelContent(() => {
    revalidate();
  }));
  chatInput.layout(580);
  queueMicrotask(() => {
    if (!disposables.isDisposed) {
      chatInput.layout(580);
    }
  });
  const resizeObserver = disposables.add(new DisposableResizeObserver("automationDialog.promptHost", (entries2) => {
    for (const entry of entries2) {
      const width2 = entry.contentRect.width;
      if (width2 > 0) {
        chatInput.layout(width2);
      }
    }
  }, getWindow(promptHost)));
  disposables.add(resizeObserver.observe(promptHost));
  const enabledRow = append(form, $125(".automation-form-row.automation-form-checkbox-row"));
  const enabledLabelText = localize(4163, null);
  const enabledCheckbox = disposables.add(new Checkbox(enabledLabelText, state.enabled, defaultCheckboxStyles));
  append(enabledRow, enabledCheckbox.domNode);
  const enabledLabel = append(enabledRow, $125("span.automation-form-checkbox-label", void 0, enabledLabelText));
  const setEnabled = (value2) => {
    if (enabledCheckbox.checked !== value2) {
      enabledCheckbox.checked = value2;
    }
    state.enabled = value2;
  };
  disposables.add(enabledCheckbox.onChange(() => {
    state.enabled = enabledCheckbox.checked;
  }));
  disposables.add(addStandardDisposableListener(enabledLabel, "click", () => {
    setEnabled(!enabledCheckbox.checked);
  }));
  return {
    getPrompt: () => chatInput.inputEditor.getValue(),
    getMode: () => chatInput.currentModeObs.get().id,
    getPermissionLevel: () => chatInput.currentPermissionLevelObs.get(),
    getModelId: () => chatInput.selectedLanguageModel.get()?.identifier,
    getBranch: () => isolationModel.persistedBranch,
    waitForAutomationSessionSync: () => {
      updateAutomationSessionTarget();
      return automationSessionDraftSynchronizer.waitForSync();
    },
    getFocusableElements: () => {
      return Array.from(form.querySelectorAll("input, select, textarea, button, a[href], [tabindex]"));
    }
  };
}

function buildTimeOptions() {
  const options3 = [];
  for (let hour2 = 0; hour2 < 24; hour2++) {
    for (let minute2 = 0; minute2 < 60; minute2 += 15) {
      const period = hour2 < 12 ? "AM" : "PM";
      const hour12 = hour2 === 0 ? 12 : hour2 > 12 ? hour2 - 12 : hour2;
      const minuteText = minute2.toString().padStart(2, "0");
      options3.push({
        hour: hour2,
        minute: minute2,
        label: `${hour12}:${minuteText} ${period}`
      });
    }
  }
  return options3;
}

function nearestTimeOptionIndex(hour2, minute2) {
  const safeHour = Math.max(0, Math.min(23, hour2 | 0));
  const safeMinute = Math.max(0, Math.min(59, minute2 | 0));
  const slot = Math.round(safeMinute / 15) % 4;
  const carriedHour = safeMinute >= 53 && slot === 0 ? (safeHour + 1) % 24 : safeHour;
  return carriedHour * 4 + slot;
}

function updateSaveButtonState(saveButton, state, validation, form, getPrompt, getBranch) {
  validation.nameError = state.name.trim() === "" ? localize(4174, null) : void 0;
  validation.promptError = getPrompt().trim() === "" ? localize(4179, null) : void 0;
  validation.folderError = !state.folderUri && !state.isQuickChat ? localize(4164, null) : void 0;
  validation.sessionTypeError = !state.sessionTypeId || state.isQuickChat && !state.providerId ? localize(4180, null) : void 0;
  validation.branchError = !state.isQuickChat && state.isolationMode === "worktree" && !getBranch() ? localize(4161, null) : void 0;
  const valid2 = !validation.nameError && !validation.promptError && !validation.folderError && !validation.sessionTypeError && !validation.branchError;
  if (saveButton) {
    saveButton.enabled = valid2;
  }
  form.classList.toggle("automation-form-invalid", !valid2);
}

var AutomationsWorkspacePicker = class extends WorkspacePicker {
  constructor() {
    super(...arguments);
    this.targetModelWatch = this._register(new MutableDisposable());
  }
  setTargetModel(model) {
    this.targetModel = model;
    this.targetModelWatch.value = autorun((reader) => {
      model.isQuickChatObs.read(reader);
      this._updateTriggerLabel();
    });
  }
  _showTabs() {
    return false;
  }
  _shouldPersistSelection() {
    return false;
  }
  _buildItems() {
    const items = super._buildItems();
    const noWorkspace = {
      kind: "action" /* Action */,
      label: localize(4175, null),
      description: localize(4176, null),
      group: { title: "", icon: Codicon.commentDiscussion },
      item: {
        checked: this.targetModel?.isQuickChat || void 0,
        run: () => this.targetModel?.setQuickChat(true)
      }
    };
    return items.length > 0 ? [noWorkspace, { kind: "separator" /* Separator */, label: "" }, ...items] : [noWorkspace];
  }
  async _dispatchPickerItem(item) {
    const applied = await super._dispatchPickerItem(item);
    const selectedFolder = this.selectedFolderUri;
    if (applied && selectedFolder && (item.folderUri || item.browseActionIndex !== void 0)) {
      this.targetModel?.setQuickChat(false, selectedFolder);
    }
    return applied;
  }
  _isSelectedFolder(folderUri) {
    return !this.targetModel?.isQuickChat && super._isSelectedFolder(folderUri);
  }
  _renderTriggerLabel(trigger) {
    clearNode(trigger);
    const workspace = this.selectedResolved?.workspace;
    const noWorkspace = this.targetModel?.isQuickChat === true;
    const label3 = noWorkspace ? localize(4175, null) : workspace?.label ?? localize(4190, null);
    const icon2 = noWorkspace ? Codicon.commentDiscussion : workspace?.icon ?? Codicon.project;
    trigger.setAttribute("aria-label", workspace || noWorkspace ? localize(4185, null, label3) : localize(4184, null));
    const renderedIcon = append(trigger, renderIcon(icon2));
    renderedIcon.setAttribute("aria-hidden", "true");
    append(trigger, $125("span.sessions-chat-dropdown-label", void 0, label3));
    const chevron = append(trigger, renderIcon(Codicon.chevronDownCompact));
    chevron.classList.add("sessions-chat-dropdown-chevron");
    chevron.setAttribute("aria-hidden", "true");
  }
  _getAllBrowseActions() {
    return super._getAllBrowseActions().filter((a) => a.group === SESSION_WORKSPACE_GROUP_LOCAL);
  }
};

var MobileAutomationsWorkspacePicker = class extends AutomationsWorkspacePicker {
  setLayoutService(layoutService) {
    this.layoutService = layoutService;
  }
  showPicker(force = false, anchor) {
    const triggerElement = anchor ?? this._triggerElement;
    if (!triggerElement || !this.layoutService || !shouldUseMobileWorkspacePickerSheet(this.layoutService)) {
      super.showPicker(force, anchor);
      return;
    }
    void showMobileWorkspacePickerSheet(
      this.layoutService,
      triggerElement,
      this._buildItems(),
      (item) => {
        void this._dispatchPickerItem(item);
      },
      this._getAllBrowseActions()
    );
  }
};

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.chat.automationsDialog.insertNewline",
  weight: 100 /* EditorContrib */ + 100,
  when: ContextKeyExpr.and(
    EditorContextKeys.textInputFocus,
    ChatContextKeys.inAutomationsDialog
  ),
  primary: 3 /* Enter */,
  handler: (accessor) => {
    const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    editor?.trigger("keyboard", "type", { text: "\n" });
  }
});
export { isAutomationDialogPopupTarget, isAutomationDialogEditCommand, canSelectAutomationWorkspace, registerAutomationDialogKeyboardNavigation, resolveAutomationModelIdentifier, setAutomationControlVisible, renderForm, buildTimeOptions, nearestTimeOptionIndex, updateSaveButtonState, $125, INTERVALS, AutomationSessionDraftSynchronizer, AUTOMATIONS_HARNESS_CHIP_ACTION_ID, AUTOMATIONS_WORKSPACE_PICKER_ACTION_ID, AUTOMATIONS_ISOLATION_GROUP_ACTION_ID, AutomationIsolationGroupActionViewItem, AutomationPickerActionViewItem, AutomationsWorkspacePicker, MobileAutomationsWorkspacePicker };
