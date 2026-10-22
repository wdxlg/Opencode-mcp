// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/runScriptCustomTaskWidget.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { InputBox } from "./module-0600.mjs";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { Checkbox } from "./module-0549.mjs";
import { Radio } from "./module-2555.mjs";
import { Button } from "./module-0546.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";


// src/vs/sessions/contrib/chat/browser/runScriptCustomTaskWidget.ts
var WORKTREE_CREATED_RUN_ON = "worktreeCreated";

var RunScriptCustomTaskWidget = class extends Disposable {
  constructor(state) {
    super();
    this._onDidSubmit = this._register(new Emitter());
    this.onDidSubmit = this._onDidSubmit.event;
    this._onDidCancel = this._register(new Emitter());
    this.onDidCancel = this._onDidCancel.event;
    this._labelLocked = !!state.labelDisabledReason;
    this._commandLocked = !!state.commandDisabledReason;
    this._targetLocked = !!state.targetDisabledReason && state.target !== void 0;
    this._isExistingTask = state.mode === "configure";
    this._isAddExistingTask = state.mode === "add-existing";
    this._selectedTarget = state.target ?? (state.targetDisabledReason ? "user" : "workspace");
    this._initialLabel = state.label ?? "";
    this._initialCommand = state.command ?? "";
    this._initialRunOn = state.runOn === WORKTREE_CREATED_RUN_ON;
    this._initialTarget = this._selectedTarget;
    this.domNode = $(".run-script-action-widget");
    const labelSection = append(this.domNode, $(".run-script-action-section"));
    append(labelSection, $("label.run-script-action-label", void 0, localize(4572, null)));
    const labelInputContainer = append(labelSection, $(".run-script-action-input"));
    this._labelInput = this._register(new InputBox(labelInputContainer, void 0, {
      placeholder: localize(4571, null),
      tooltip: state.labelDisabledReason,
      ariaLabel: localize(4570, null),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._labelInput.value = state.label ?? "";
    if (state.labelDisabledReason) {
      this._labelInput.disable();
    }
    const commandSection = append(this.domNode, $(".run-script-action-section"));
    append(commandSection, $("label.run-script-action-label", void 0, localize(4562, null)));
    const commandInputContainer = append(commandSection, $(".run-script-action-input"));
    this._commandInput = this._register(new InputBox(commandInputContainer, void 0, {
      placeholder: localize(4569, null),
      tooltip: state.commandDisabledReason,
      ariaLabel: localize(4568, null),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._commandInput.value = state.command ?? "";
    if (state.commandDisabledReason) {
      this._commandInput.disable();
    }
    const runOnSection = append(this.domNode, $(".run-script-action-section"));
    append(runOnSection, $("div.run-script-action-label", void 0, localize(4575, null)));
    const runOnRow = append(runOnSection, $(".run-script-action-option-row"));
    this._runOnCheckbox = this._register(new Checkbox(localize(4573, null), state.runOn === WORKTREE_CREATED_RUN_ON, defaultCheckboxStyles));
    runOnRow.appendChild(this._runOnCheckbox.domNode);
    const runOnText = append(runOnRow, $("span.run-script-action-option-text", void 0, localize(4574, null)));
    this._register(addDisposableListener(runOnText, EventType.CLICK, () => this._runOnCheckbox.checked = !this._runOnCheckbox.checked));
    const storageSection = append(this.domNode, $(".run-script-action-section"));
    append(storageSection, $("div.run-script-action-label", void 0, localize(4577, null)));
    const storageDisabledReason = state.targetDisabledReason;
    if (storageDisabledReason) {
      append(storageSection, $("div.run-script-action-hint", void 0, storageDisabledReason));
    }
    const workspaceTargetDisabled = !!storageDisabledReason;
    this._storageOptions = this._register(new Radio({
      items: [
        {
          text: localize(4580, null),
          tooltip: storageDisabledReason ?? localize(4581, null),
          isActive: this._selectedTarget === "workspace",
          disabled: workspaceTargetDisabled
        },
        {
          text: localize(4578, null),
          tooltip: this._targetLocked ? storageDisabledReason : localize(4579, null),
          isActive: this._selectedTarget === "user",
          disabled: this._targetLocked
        }
      ]
    }));
    this._storageOptions.domNode.setAttribute("aria-label", localize(4576, null));
    this._storageOptions.domNode.classList.toggle("run-script-action-radio-disabled", this._targetLocked);
    this._storageOptions.setEnabled(!this._targetLocked);
    storageSection.appendChild(this._storageOptions.domNode);
    const buttonRow = append(this.domNode, $(".run-script-action-buttons"));
    this._cancelButton = this._register(new Button(buttonRow, { ...defaultButtonStyles, secondary: true }));
    this._cancelButton.label = localize(4561, null);
    this._submitButton = this._register(new Button(buttonRow, defaultButtonStyles));
    this._submitButton.label = this._getSubmitLabel();
    this._register(this._labelInput.onDidChange(() => this._updateButtonState()));
    this._register(this._commandInput.onDidChange(() => this._updateButtonState()));
    this._register(this._storageOptions.onDidSelect((index2) => {
      this._selectedTarget = index2 === 0 ? "workspace" : "user";
      this._updateButtonState();
    }));
    this._register(this._runOnCheckbox.onChange(() => this._updateButtonState()));
    this._register(this._submitButton.onDidClick(() => this._submit()));
    this._register(this._cancelButton.onDidClick(() => this._onDidCancel.fire()));
    this._register(addDisposableListener(this._labelInput.inputElement, EventType.KEY_DOWN, (event) => {
      const keyboardEvent = new StandardKeyboardEvent(event);
      if (keyboardEvent.equals(3 /* Enter */)) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        this._submit();
      }
    }));
    this._register(addDisposableListener(this._commandInput.inputElement, EventType.KEY_DOWN, (event) => {
      const keyboardEvent = new StandardKeyboardEvent(event);
      if (keyboardEvent.equals(3 /* Enter */)) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        this._submit();
      }
    }));
    this._register(addDisposableListener(this.domNode, EventType.KEY_DOWN, (event) => {
      const keyboardEvent = new StandardKeyboardEvent(event);
      if (keyboardEvent.equals(9 /* Escape */)) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        this._onDidCancel.fire();
      }
    }));
    this._updateButtonState();
  }
  focus() {
    if (!this._labelLocked) {
      this._labelInput.focus();
      return;
    }
    if (this._commandLocked) {
      this._runOnCheckbox.focus();
      return;
    }
    this._commandInput.focus();
  }
  _submit() {
    const label3 = this._labelInput.value.trim();
    const command4 = this._commandInput.value.trim();
    if (!command4) {
      return;
    }
    this._onDidSubmit.fire({
      label: label3.length > 0 ? label3 : void 0,
      command: command4,
      target: this._selectedTarget,
      runOn: this._runOnCheckbox.checked ? WORKTREE_CREATED_RUN_ON : void 0
    });
  }
  _updateButtonState() {
    this._submitButton.enabled = this._commandInput.value.trim().length > 0;
    this._submitButton.label = this._getSubmitLabel();
  }
  _getSubmitLabel() {
    if (this._isAddExistingTask) {
      return localize(4564, null);
    }
    if (!this._isExistingTask) {
      return localize(4563, null);
    }
    const targetChanged = this._selectedTarget !== this._initialTarget;
    const labelChanged = this._labelInput.value !== this._initialLabel;
    const commandChanged = this._commandInput.value !== this._initialCommand;
    const runOnChanged = this._runOnCheckbox.checked !== this._initialRunOn;
    const otherChanged = labelChanged || commandChanged || runOnChanged;
    if (targetChanged && otherChanged) {
      return localize(4565, null);
    }
    if (targetChanged) {
      return localize(4566, null);
    }
    return localize(4567, null);
  }
};
export { WORKTREE_CREATED_RUN_ON, RunScriptCustomTaskWidget };
