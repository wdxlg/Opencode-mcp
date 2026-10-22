// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/sessionsSignInDialog.ts
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { RETURN_TO_VSCODE_EDITOR_COMMAND_ID } from "./module-1800.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Dialog } from "./module-1579.mjs";
import { createWorkbenchDialogOptions } from "./module-1580.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IHostService } from "./module-1118.mjs";
import { Button } from "./module-0546.mjs";


// src/vs/sessions/browser/sessionsSignInDialog.ts
function createSessionsSignInDialogOptions(commandService, showReturnToVSCodeEditor, allowContinueWithoutSignIn = false, onContinueWithoutSignIn = () => {
}) {
  return {
    forceSignInDialog: true,
    dialogIcon: Codicon.agent,
    dialogTitle: localize(3861, null),
    disableCloseButton: !allowContinueWithoutSignIn,
    dialogExtraClasses: ["sessions-welcome-dialog"],
    allowContinueWithoutSignIn,
    renderDialogFooter: showReturnToVSCodeEditor ? (footer) => createDialogAction(
      footer,
      localize(3860, null),
      () => {
        void commandService.executeCommand(RETURN_TO_VSCODE_EDITOR_COMMAND_ID).catch(onUnexpectedError);
      }
    ) : void 0,
    onDidDismissDialog: allowContinueWithoutSignIn ? onContinueWithoutSignIn : void 0
  };
}

var SessionsSigningInDialog = class extends Disposable {
  constructor(onCancel, keybindingService, layoutService, hostService) {
    super();
    this.onCancel = onCancel;
    this.isDisposed = false;
    this.didCancel = false;
    this.dialog = this._register(new Dialog(
      layoutService.activeContainer,
      localize(3862, null),
      [],
      createWorkbenchDialogOptions({
        type: "none",
        extraClasses: ["chat-setup-dialog", "sessions-welcome-dialog"],
        modalBlockExtraClasses: ["sessions-signing-in-dialog-modal-block"],
        detail: localize(3863, null),
        icon: Codicon.agent,
        alignment: 1 /* Vertical */,
        cancelId: 0,
        disableCloseAction: true,
        disableCloseButton: true,
        disableDefaultAction: true,
        isExternalFocusAllowed: (target) => !!target.closest(".quick-input-widget")
      }, keybindingService, layoutService, hostService, void 0, (commandId) => commandId.startsWith("quickInput."))
    ));
    const activeContainer = layoutService.activeContainer;
    activeContainer.classList.add("sessions-signing-in-dialog-visible");
    this._register(toDisposable(() => activeContainer.classList.remove("sessions-signing-in-dialog-visible")));
    void this.show();
  }
  async show() {
    await this.dialog.show();
    if (!this.isDisposed) {
      this.cancel();
    }
  }
  cancel() {
    if (this.didCancel) {
      return;
    }
    this.didCancel = true;
    this.onCancel();
  }
  dispose() {
    this.isDisposed = true;
    super.dispose();
  }
};

SessionsSigningInDialog = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IWorkbenchLayoutService),
  __decorateParam(3, IHostService)
], SessionsSigningInDialog);

function createDialogAction(container2, label3, run) {
  const disposables = new DisposableStore();
  const action = disposables.add(new Button(container2, {}));
  action.element.classList.add("sessions-sign-in-dialog-action");
  action.label = label3;
  disposables.add(action.onDidClick(run));
  return disposables;
}
export { createSessionsSignInDialogOptions, createDialogAction, SessionsSigningInDialog };
