// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadMessageService.ts
import { toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { MainContext } from "./module-0921.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IExtensionService } from "./module-0887.mjs";


// src/vs/workbench/api/browser/mainThreadMessageService.ts
var MainThreadMessageService = class {
  constructor(extHostContext, _notificationService, _commandService, _dialogService, extensionService) {
    this._notificationService = _notificationService;
    this._commandService = _commandService;
    this._dialogService = _dialogService;
    this.extensionsListener = extensionService.onDidChangeExtensions((e) => {
      for (const extension of e.removed) {
        this._notificationService.removeFilter(extension.identifier.value);
      }
    });
  }
  dispose() {
    this.extensionsListener.dispose();
  }
  $showMessage(severity, message, options3, commands) {
    if (options3.modal) {
      return this._showModalMessage(severity, message, options3.detail, commands, options3.useCustom);
    } else {
      return this._showMessage(severity, message, commands, options3);
    }
  }
  _showMessage(severity, message, commands, options3) {
    return new Promise((resolve3) => {
      const primaryActions = commands.map((command4) => toAction({
        id: `_extension_message_handle_${command4.handle}`,
        label: command4.title,
        enabled: true,
        run: () => {
          resolve3(command4.handle);
          return Promise.resolve();
        }
      }));
      let source;
      let sourceIsUrgent = false;
      if (options3.source) {
        source = {
          label: options3.source.label,
          id: options3.source.identifier.value
        };
        sourceIsUrgent = MainThreadMessageService.URGENT_NOTIFICATION_SOURCES.includes(source.id);
      }
      if (!source) {
        source = localize(5726, null);
      }
      const secondaryActions = [];
      if (options3.source) {
        secondaryActions.push(toAction({
          id: options3.source.identifier.value,
          label: localize(5727, null),
          run: () => {
            return this._commandService.executeCommand("_extensions.manage", options3.source.identifier.value);
          }
        }));
      }
      const messageHandle = this._notificationService.notify({
        severity,
        message,
        actions: { primary: primaryActions, secondary: secondaryActions },
        source,
        priority: sourceIsUrgent ? 3 /* URGENT */ : 0 /* DEFAULT */,
        sticky: sourceIsUrgent
      });
      Event2.once(messageHandle.onDidClose)(() => {
        resolve3(void 0);
      });
    });
  }
  async _showModalMessage(severity, message, detail2, commands, useCustom) {
    const buttons = [];
    let cancelButton = void 0;
    for (const command4 of commands) {
      const button = {
        label: command4.title,
        run: () => command4.handle
      };
      if (command4.isCloseAffordance) {
        cancelButton = button;
      } else {
        buttons.push(button);
      }
    }
    if (!cancelButton) {
      if (buttons.length > 0) {
        cancelButton = {
          label: localize(5725, null),
          run: () => void 0
        };
      } else {
        cancelButton = {
          label: localize(5728, null),
          run: () => void 0
        };
      }
    }
    const { result } = await this._dialogService.prompt({
      type: severity,
      message,
      detail: detail2,
      buttons,
      cancelButton,
      custom: useCustom
    });
    return result;
  }
};

MainThreadMessageService.URGENT_NOTIFICATION_SOURCES = [
  "vscode.github-authentication",
  "vscode.microsoft-authentication"
];

MainThreadMessageService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadMessageService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IExtensionService)
], MainThreadMessageService);
export { MainThreadMessageService };
