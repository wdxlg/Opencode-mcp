// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/dialogs/dialogHandler.ts
import { AbstractDialogHandler } from "./module-0267.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize } from "./module-0001.mjs";
import { IMarkdownRendererService, openLinkFromMarkdown } from "./module-0541.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Dialog } from "./module-1579.mjs";
import { createWorkbenchDialogOptions } from "./module-1580.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IHostService } from "./module-1118.mjs";


// src/vs/workbench/browser/parts/dialogs/dialogHandler.ts
var BrowserDialogHandler = class extends AbstractDialogHandler {
  constructor(logService, layoutService, keybindingService, instantiationService, clipboardService, openerService, markdownRendererService, hostService) {
    super();
    this.logService = logService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.clipboardService = clipboardService;
    this.openerService = openerService;
    this.markdownRendererService = markdownRendererService;
    this.hostService = hostService;
  }
  static {
    this.ALLOWABLE_COMMANDS = /* @__PURE__ */ new Set([
      "copy",
      "cut",
      "editor.action.selectAll",
      "editor.action.clipboardCopyAction",
      "editor.action.clipboardCutAction",
      "editor.action.clipboardPasteAction"
    ]);
  }
  async prompt(prompt) {
    this.logService.trace("DialogService#prompt", prompt.message);
    const buttons = this.getPromptButtons(prompt);
    const { button, checkboxChecked } = await this.doShow(prompt.type, prompt.message, buttons, prompt.detail, prompt.cancelButton ? buttons.length - 1 : -1, prompt.checkbox, void 0, typeof prompt?.custom === "object" ? prompt.custom : void 0, prompt.token);
    return this.getPromptResult(prompt, button, checkboxChecked);
  }
  async confirm(confirmation) {
    this.logService.trace("DialogService#confirm", confirmation.message);
    const buttons = this.getConfirmationButtons(confirmation);
    const { button, checkboxChecked } = await this.doShow(confirmation.type ?? "question", confirmation.message, buttons, confirmation.detail, buttons.length - 1, confirmation.checkbox, void 0, typeof confirmation?.custom === "object" ? confirmation.custom : void 0, confirmation.token);
    return { confirmed: button === 0, checkboxChecked };
  }
  async input(input) {
    this.logService.trace("DialogService#input", input.message);
    const buttons = this.getInputButtons(input);
    const { button, checkboxChecked, values } = await this.doShow(input.type ?? "question", input.message, buttons, input.detail, buttons.length - 1, input?.checkbox, input.inputs, typeof input.custom === "object" ? input.custom : void 0, input.token);
    return { confirmed: button === 0, checkboxChecked, values };
  }
  async about(title, details, detailsToCopy) {
    const { button } = await this.doShow(
      severity_default.Info,
      title,
      [
        localize(6267, null),
        localize(6268, null)
      ],
      details,
      1
    );
    if (button === 0) {
      this.clipboardService.writeText(detailsToCopy);
    }
  }
  /** Default link handler for Markdown rendered within a dialog, see {@link openLinkFromMarkdown}. */
  defaultMarkdownActionHandler(link2, mdStr) {
    return openLinkFromMarkdown(
      this.openerService,
      link2,
      mdStr.isTrusted,
      true
      /* skip URL validation to prevent another dialog from showing which is unsupported */
    );
  }
  async doShow(type, message, buttons, detail2, cancelId, checkbox, inputs, customOptions, token) {
    const dialogDisposables = new DisposableStore();
    const detailElement = typeof detail2 === "object" ? dialogDisposables.add(this.markdownRendererService.render(detail2, {
      actionHandler: (link2, mdStr) => this.defaultMarkdownActionHandler(link2, mdStr)
    })).element : void 0;
    const renderBody = customOptions ? (parent) => {
      parent.classList.add(...customOptions.classes || []);
      customOptions.markdownDetails?.forEach((markdownDetail) => {
        const result2 = dialogDisposables.add(this.markdownRendererService.render(markdownDetail.markdown, {
          actionHandler: markdownDetail.actionHandler || ((link2, mdStr) => this.defaultMarkdownActionHandler(link2, mdStr))
        }));
        parent.appendChild(result2.element);
        result2.element.classList.add(...markdownDetail.classes || []);
      });
    } : void 0;
    const dialog = new Dialog(
      this.layoutService.activeContainer,
      message,
      buttons,
      createWorkbenchDialogOptions({
        detail: typeof detail2 === "string" ? detail2 : void 0,
        detailElement,
        cancelId,
        type: this.getDialogType(type),
        renderBody,
        icon: customOptions?.icon,
        alignment: customOptions?.alignment === "vertical" ? 1 /* Vertical */ : 0 /* Horizontal */,
        disableCloseAction: customOptions?.disableCloseAction,
        buttonOptions: customOptions?.buttonDetails?.map((detail3) => ({ sublabel: detail3 })),
        checkboxLabel: checkbox?.label,
        checkboxChecked: checkbox?.checked,
        inputs
      }, this.keybindingService, this.layoutService, this.hostService, BrowserDialogHandler.ALLOWABLE_COMMANDS)
    );
    dialogDisposables.add(dialog);
    if (token) {
      dialogDisposables.add(token.onCancellationRequested(() => dialogDisposables.dispose()));
    }
    const result = await dialog.show();
    dialogDisposables.dispose();
    return result;
  }
};

BrowserDialogHandler = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ILayoutService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IClipboardService),
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IMarkdownRendererService),
  __decorateParam(7, IHostService)
], BrowserDialogHandler);
export { BrowserDialogHandler };
