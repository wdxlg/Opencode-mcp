// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/parts/dialogs/dialogHandler.ts
import { AbstractDialogHandler } from "./module-0267.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/workbench/electron-browser/parts/dialogs/dialogHandler.ts
var NativeDialogHandler = class extends AbstractDialogHandler {
  constructor(logService, nativeHostService, clipboardService) {
    super();
    this.logService = logService;
    this.nativeHostService = nativeHostService;
    this.clipboardService = clipboardService;
  }
  /**
   * Native Electron message boxes have no Markdown rendering capability, so
   * a Markdown `detail` is degraded to its plain-text equivalent rather than
   * shown with raw Markdown/link syntax.
   */
  toNativeDetail(detail2) {
    return typeof detail2 === "object" ? renderAsPlaintext(detail2) : detail2;
  }
  async prompt(prompt) {
    this.logService.trace("DialogService#prompt", prompt.message);
    const buttons = this.getPromptButtons(prompt);
    const { response, checkboxChecked } = await this.nativeHostService.showMessageBox({
      type: this.getDialogType(prompt.type),
      title: prompt.title,
      message: prompt.message,
      detail: this.toNativeDetail(prompt.detail),
      buttons,
      cancelId: prompt.cancelButton ? buttons.length - 1 : -1,
      checkboxLabel: prompt.checkbox?.label,
      checkboxChecked: prompt.checkbox?.checked,
      targetWindowId: getActiveWindow().vscodeWindowId
    });
    return this.getPromptResult(prompt, response, checkboxChecked);
  }
  async confirm(confirmation) {
    this.logService.trace("DialogService#confirm", confirmation.message);
    const buttons = this.getConfirmationButtons(confirmation);
    const { response, checkboxChecked } = await this.nativeHostService.showMessageBox({
      type: this.getDialogType(confirmation.type) ?? "question",
      title: confirmation.title,
      message: confirmation.message,
      detail: this.toNativeDetail(confirmation.detail),
      buttons,
      cancelId: buttons.length - 1,
      checkboxLabel: confirmation.checkbox?.label,
      checkboxChecked: confirmation.checkbox?.checked,
      targetWindowId: getActiveWindow().vscodeWindowId
    });
    return { confirmed: response === 0, checkboxChecked };
  }
  input() {
    throw new Error("Unsupported");
  }
  async about(title, details, detailsToCopy) {
    const { response } = await this.nativeHostService.showMessageBox({
      type: "info",
      message: title,
      detail: `
${details}`,
      buttons: [
        localize(22527, null),
        localize(22528, null)
      ],
      targetWindowId: getActiveWindow().vscodeWindowId
    });
    if (response === 0) {
      this.clipboardService.writeText(detailsToCopy);
    }
  }
};

NativeDialogHandler = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, INativeHostService),
  __decorateParam(2, IClipboardService)
], NativeDialogHandler);
export { NativeDialogHandler };
