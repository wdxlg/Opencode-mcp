// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/automationDialogService.ts
import { $, append, getWindow } from "./module-0075.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { Dialog } from "./module-1579.mjs";
import { createWorkbenchDialogOptions } from "./module-1580.mjs";
import { isAutomationDialogEditCommand, isAutomationDialogPopupTarget, registerAutomationDialogKeyboardNavigation, renderForm, updateSaveButtonState } from "./module-3782.mjs";
import { defaultDialogStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProductService } from "./module-0875.mjs";
import { IHostService } from "./module-1118.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IWorkspaceTrustRequestService } from "./module-0854.mjs";


// src/vs/sessions/contrib/automations/browser/automationDialogService.ts
var $126 = $;

var automationDialogAllowableCommands = /* @__PURE__ */ new Set([
  "workbench.action.quit",
  "workbench.action.reloadWindow",
  "copy",
  "cut",
  "paste",
  "editor.action.selectAll",
  "editor.action.clipboardCopyAction",
  "editor.action.clipboardCutAction",
  "editor.action.clipboardPasteAction",
  "hideCodeActionWidget",
  "clearFilterCodeActionWidget",
  "selectPrevCodeAction",
  "selectNextCodeAction",
  "acceptSelectedCodeAction",
  "previewSelectedCodeAction",
  "toggleSectionCodeAction",
  "collapseSectionCodeAction",
  "expandSectionCodeAction",
  "quickInput.next",
  "quickInput.previous",
  "quickInput.accept",
  "quickInput.hide"
]);

var AutomationDialogService = class {
  constructor(instantiationService, contextKeyService, contextViewService, configurationService, languageModelsService, keybindingService, layoutService, logService, productService, hostService, sessionsManagementService, workspaceTrustRequestService) {
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.contextViewService = contextViewService;
    this.configurationService = configurationService;
    this.languageModelsService = languageModelsService;
    this.keybindingService = keybindingService;
    this.layoutService = layoutService;
    this.logService = logService;
    this.productService = productService;
    this.hostService = hostService;
    this.sessionsManagementService = sessionsManagementService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
  }
  async showAutomationDialog(options3) {
    const disposables = new DisposableStore();
    const existing = options3.existing;
    const initial = existing ?? options3.initialValues;
    const isEdit = !!existing;
    const initialTarget = initial?.target;
    const initialWorkspaceTarget = initialTarget?.kind === "workspace" ? initialTarget : void 0;
    const state = {
      name: initial?.name ?? "",
      interval: initial?.schedule.interval ?? "daily",
      hour: initial?.schedule.scheduleHour ?? 9,
      minute: initial?.schedule.scheduleMinute ?? 0,
      day: initial?.schedule.scheduleDay ?? 1,
      isQuickChat: initialTarget?.kind === "quickChat",
      folderUri: initialWorkspaceTarget?.folderUri,
      providerId: initialTarget?.providerId,
      sessionTypeId: initialTarget?.sessionTypeId,
      isolationMode: initialWorkspaceTarget?.isolation.kind === "default" ? void 0 : initialWorkspaceTarget?.isolation.kind === "worktree" ? "worktree" : "workspace",
      branch: initialWorkspaceTarget?.isolation.kind === "worktree" ? initialWorkspaceTarget.isolation.branch : void 0,
      enabled: initial?.enabled ?? true
    };
    const validation = { nameError: void 0, promptError: void 0, folderError: void 0, sessionTypeError: void 0, branchError: void 0 };
    let saveButton;
    let cancelButton;
    let revalidate = () => {
    };
    let getPrompt = () => initial?.prompt ?? "";
    let getMode = () => initial?.mode;
    let getPermissionLevel = () => initial?.permissionLevel;
    let getModelId = () => initial?.modelId;
    let getBranch = () => initialWorkspaceTarget?.isolation.kind === "worktree" ? initialWorkspaceTarget.isolation.branch : void 0;
    let waitForAutomationSessionSync = async () => {
    };
    let getFocusableElements = () => [];
    let focusFirst = () => {
    };
    const title = isEdit ? localize(4196, null) : localize(4194, null);
    const buttonLabels = [
      isEdit ? localize(4197, null) : localize(4192, null),
      localize(4191, null)
    ];
    const activeContainer = this.layoutService.activeContainer;
    const dialog = disposables.add(new Dialog(
      activeContainer,
      title,
      buttonLabels,
      createWorkbenchDialogOptions(
        {
          type: "none",
          extraClasses: ["automation-dialog"],
          cancelId: 1,
          isExternalFocusAllowed: isAutomationDialogPopupTarget,
          // textLinkForeground stamps inline styles onto chat input picker chips.
          dialogStyles: { ...defaultDialogStyles, textLinkForeground: void 0 },
          buttonOptions: [
            {
              styleButton: (button) => {
                saveButton = button;
                revalidate();
              }
            },
            {
              styleButton: (button) => {
                cancelButton = button;
              }
            }
          ],
          renderBody: (container2) => {
            container2.classList.add("automation-dialog-body");
            const titlebar = append(container2, $126(".automation-titlebar"));
            titlebar.setAttribute("aria-hidden", "true");
            titlebar.textContent = title;
            const description = append(container2, $126(".automation-description"));
            description.textContent = isEdit ? localize(4195, null) : localize(4193, null);
            const formPane = append(container2, $126(".automation-form-pane"));
            const form = append(formPane, $126(".automation-form"));
            const handle2 = renderForm(form, state, disposables, validation, () => revalidate(), this.instantiationService, this.contextKeyService, this.contextViewService, this.configurationService, this.languageModelsService, this.layoutService, this.logService, this.productService, this.sessionsManagementService, this.workspaceTrustRequestService, initial?.prompt ?? "", initial?.mode, initial?.permissionLevel, initial?.modelId);
            getPrompt = handle2.getPrompt;
            getMode = handle2.getMode;
            getPermissionLevel = handle2.getPermissionLevel;
            getModelId = handle2.getModelId;
            getBranch = handle2.getBranch;
            waitForAutomationSessionSync = handle2.waitForAutomationSessionSync;
            getFocusableElements = handle2.getFocusableElements;
            const keyboardNavigation = disposables.add(registerAutomationDialogKeyboardNavigation(
              getWindow(container2),
              () => [
                ...getFocusableElements(),
                ...saveButton ? [saveButton.element] : [],
                ...cancelButton ? [cancelButton.element] : []
              ],
              isAutomationDialogPopupTarget
            ));
            focusFirst = keyboardNavigation.focusFirst;
            revalidate = () => updateSaveButtonState(saveButton, state, validation, form, getPrompt, getBranch);
            revalidate();
          }
        },
        this.keybindingService,
        this.layoutService,
        this.hostService,
        automationDialogAllowableCommands,
        (commandId, event) => isAutomationDialogEditCommand(commandId, event.target)
      )
    ));
    activeContainer.classList.add("automation-dialog-open");
    disposables.add(toDisposable(() => activeContainer.classList.remove("automation-dialog-open")));
    try {
      const resultPromise = dialog.show();
      focusFirst();
      const result = await resultPromise;
      if (result.button !== 0) {
        return void 0;
      }
      revalidate();
      if (validation.nameError || validation.promptError || validation.folderError || validation.sessionTypeError || validation.branchError) {
        return void 0;
      }
      if (!state.isQuickChat && !state.folderUri || !state.sessionTypeId || state.isQuickChat && !state.providerId) {
        return void 0;
      }
      await waitForAutomationSessionSync();
      const schedule = {
        interval: state.interval,
        scheduleHour: state.hour,
        scheduleMinute: state.minute,
        scheduleDay: state.day
      };
      const prompt = getPrompt();
      const mode = getMode();
      const permissionLevel = getPermissionLevel();
      const modelId = getModelId();
      const branch = getBranch();
      const target = createAutomationTarget(state, branch);
      if (!target) {
        return void 0;
      }
      if (existing) {
        const patch2 = {
          name: state.name,
          prompt,
          schedule,
          target,
          modelId: modelId ?? null,
          mode: mode ?? null,
          permissionLevel: permissionLevel ?? null,
          enabled: state.enabled
        };
        return { kind: "update", id: existing.id, value: patch2 };
      }
      const create2 = {
        name: state.name,
        prompt,
        schedule,
        target,
        modelId,
        mode,
        permissionLevel,
        enabled: state.enabled
      };
      return { kind: "create", value: create2 };
    } finally {
      disposables.dispose();
    }
  }
};

AutomationDialogService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageModelsService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IProductService),
  __decorateParam(9, IHostService),
  __decorateParam(10, ISessionsManagementService),
  __decorateParam(11, IWorkspaceTrustRequestService)
], AutomationDialogService);

function createAutomationTarget(state, branch) {
  if (state.isQuickChat) {
    return state.providerId && state.sessionTypeId ? { kind: "quickChat", providerId: state.providerId, sessionTypeId: state.sessionTypeId } : void 0;
  }
  if (!state.folderUri) {
    return void 0;
  }
  const isolation = state.isolationMode === "worktree" ? branch ? { kind: "worktree", branch } : void 0 : state.isolationMode === "workspace" ? { kind: "folder" } : { kind: "default" };
  return isolation ? {
    kind: "workspace",
    folderUri: state.folderUri,
    providerId: state.providerId,
    sessionTypeId: state.sessionTypeId,
    isolation
  } : void 0;
}
export { createAutomationTarget, $126, automationDialogAllowableCommands, AutomationDialogService };
