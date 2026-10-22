// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/electron-browser/issueReporterKeybindings.ts
import { Disposable } from "./module-0012.mjs";
import { IssueReporterEditorPane, IssueReporterOpenContext } from "./module-4100.mjs";
import { IssueReporterEditorInput } from "./module-4093.mjs";
import { Event2 } from "./module-0017.mjs";
import { EventType, addDisposableListener, onDidRegisterWindow } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";


// src/vs/workbench/contrib/issue/electron-browser/issueReporterKeybindings.ts
var ISSUE_REPORTER_CAPTURE_SCREENSHOT_COMMAND_ID = "workbench.action.issueReporter.captureScreenshot";

var ISSUE_REPORTER_TOGGLE_RECORDING_COMMAND_ID = "workbench.action.issueReporter.toggleRecording";

var IssueReporterOpenStateContribution = class extends Disposable {
  constructor(editorService, contextKeyService, commandService) {
    super();
    this.editorService = editorService;
    this.commandService = commandService;
    this.issueReporterOpen = false;
    const ctx = IssueReporterOpenContext.bindTo(contextKeyService);
    const update = () => {
      this.issueReporterOpen = this.editorService.editors.some((e4) => e4 instanceof IssueReporterEditorInput);
      ctx.set(this.issueReporterOpen);
    };
    this._register(this.editorService.onDidEditorsChange(update));
    update();
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => {
      disposables.add(addDisposableListener(
        window2,
        EventType.KEY_DOWN,
        (e4) => this.dispatchCapturePhase(e4),
        true
        /* capture */
      ));
    }, { window: mainWindow, disposables: this._store }));
  }
  static {
    this.ID = "workbench.contrib.issueReporterOpenState";
  }
  dispatchCapturePhase(e4) {
    if (!this.issueReporterOpen) {
      return;
    }
    const evt = new StandardKeyboardEvent(e4);
    const primaryMod = isMacintosh ? evt.metaKey : evt.ctrlKey;
    const otherMod = isMacintosh ? evt.ctrlKey : evt.metaKey;
    if (!primaryMod || !evt.shiftKey || evt.altKey || otherMod) {
      return;
    }
    let commandId;
    if (evt.keyCode === 49 /* KeyS */) {
      commandId = ISSUE_REPORTER_CAPTURE_SCREENSHOT_COMMAND_ID;
    } else if (evt.keyCode === 48 /* KeyR */) {
      commandId = ISSUE_REPORTER_TOGGLE_RECORDING_COMMAND_ID;
    }
    if (!commandId) {
      return;
    }
    e4.preventDefault();
    e4.stopPropagation();
    void this.commandService.executeCommand(commandId);
  }
};

IssueReporterOpenStateContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ICommandService)
], IssueReporterOpenStateContribution);

registerWorkbenchContribution2(IssueReporterOpenStateContribution.ID, IssueReporterOpenStateContribution, WorkbenchPhase.AfterRestored);

function withWizard(fn) {
  const pane = IssueReporterEditorPane.getAnyLiveInstance();
  const wizard = pane?.getWizard();
  if (pane && wizard) {
    fn(pane, wizard);
  }
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: ISSUE_REPORTER_CAPTURE_SCREENSHOT_COMMAND_ID,
  weight: 200 /* WorkbenchContrib */,
  when: IssueReporterOpenContext,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 49 /* KeyS */,
  handler: () => withWizard((_pane, wizard) => wizard.triggerCaptureScreenshot())
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: ISSUE_REPORTER_TOGGLE_RECORDING_COMMAND_ID,
  weight: 200 /* WorkbenchContrib */,
  when: IssueReporterOpenContext,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KeyR */,
  handler: () => withWizard((_pane, wizard) => wizard.triggerToggleRecording())
});
export { withWizard, ISSUE_REPORTER_CAPTURE_SCREENSHOT_COMMAND_ID, ISSUE_REPORTER_TOGGLE_RECORDING_COMMAND_ID, IssueReporterOpenStateContribution };
