// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/dialogs/common/dialogs.ts
import { createDecorator } from "./module-0077.mjs";
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";
import { basename2 } from "./module-0034.mjs";


// src/vs/platform/dialogs/common/dialogs.ts
var IDialogService = createDecorator("dialogService");

var AbstractDialogHandler = class {
  getConfirmationButtons(dialog) {
    return this.getButtons(dialog, 1 /* Confirmation */);
  }
  getPromptButtons(dialog) {
    return this.getButtons(dialog, 2 /* Prompt */);
  }
  getInputButtons(dialog) {
    return this.getButtons(dialog, 3 /* Input */);
  }
  getButtons(dialog, kind) {
    const buttons = [];
    switch (kind) {
      case 1 /* Confirmation */: {
        const confirmationDialog = dialog;
        if (confirmationDialog.primaryButton) {
          buttons.push(confirmationDialog.primaryButton);
        } else {
          buttons.push(localize(2825, null));
        }
        if (confirmationDialog.cancelButton) {
          buttons.push(confirmationDialog.cancelButton);
        } else {
          buttons.push(localize(2821, null));
        }
        break;
      }
      case 2 /* Prompt */: {
        const promptDialog = dialog;
        if (Array.isArray(promptDialog.buttons) && promptDialog.buttons.length > 0) {
          buttons.push(...promptDialog.buttons.map((button) => button.label));
        }
        if (promptDialog.cancelButton) {
          if (promptDialog.cancelButton === true) {
            buttons.push(localize(2821, null));
          } else if (typeof promptDialog.cancelButton === "string") {
            buttons.push(promptDialog.cancelButton);
          } else {
            if (promptDialog.cancelButton.label) {
              buttons.push(promptDialog.cancelButton.label);
            } else {
              buttons.push(localize(2821, null));
            }
          }
        }
        if (buttons.length === 0) {
          buttons.push(localize(2824, null));
        }
        break;
      }
      case 3 /* Input */: {
        const inputDialog = dialog;
        if (inputDialog.primaryButton) {
          buttons.push(inputDialog.primaryButton);
        } else {
          buttons.push(localize(2824, null));
        }
        if (inputDialog.cancelButton) {
          buttons.push(inputDialog.cancelButton);
        } else {
          buttons.push(localize(2821, null));
        }
        break;
      }
    }
    return buttons;
  }
  getDialogType(type) {
    if (typeof type === "string") {
      return type;
    }
    if (typeof type === "number") {
      return type === severity_default.Info ? "info" : type === severity_default.Error ? "error" : type === severity_default.Warning ? "warning" : "none";
    }
    return void 0;
  }
  getPromptResult(prompt, buttonIndex, checkboxChecked) {
    const promptButtons = [...prompt.buttons ?? []];
    if (prompt.cancelButton && typeof prompt.cancelButton !== "string" && typeof prompt.cancelButton !== "boolean") {
      promptButtons.push(prompt.cancelButton);
    }
    let result = promptButtons[buttonIndex]?.run({ checkboxChecked });
    if (!(result instanceof Promise)) {
      result = Promise.resolve(result);
    }
    return { result, checkboxChecked };
  }
};

var IFileDialogService = createDecorator("fileDialogService");

var MAX_CONFIRM_FILES = 10;

function getFileNamesMessage(fileNamesOrResources) {
  const message = [];
  message.push(...fileNamesOrResources.slice(0, MAX_CONFIRM_FILES).map((fileNameOrResource) => typeof fileNameOrResource === "string" ? fileNameOrResource : basename2(fileNameOrResource)));
  if (fileNamesOrResources.length > MAX_CONFIRM_FILES) {
    if (fileNamesOrResources.length - MAX_CONFIRM_FILES === 1) {
      message.push(localize(2822, null));
    } else {
      message.push(localize(2823, null, fileNamesOrResources.length - MAX_CONFIRM_FILES));
    }
  }
  message.push("");
  return message.join("\n");
}
export { getFileNamesMessage, IDialogService, AbstractDialogHandler, IFileDialogService, MAX_CONFIRM_FILES };
