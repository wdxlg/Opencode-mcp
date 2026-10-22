// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/notification/browser/terminal.notification.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { TerminalNotificationHandler } from "./module-3420.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ITerminalLogService } from "./module-1154.mjs";
import { registerTerminalContribution } from "./module-2354.mjs";


// src/vs/workbench/contrib/terminalContrib/notification/browser/terminal.notification.contribution.ts
var TerminalOscNotificationsContribution = class extends Disposable {
  constructor(_ctx, _configurationService, _notificationService, _logService) {
    super();
    this._ctx = _ctx;
    this._configurationService = _configurationService;
    this._notificationService = _notificationService;
    this._logService = _logService;
    this._handler = this._register(new TerminalNotificationHandler({
      isEnabled: () => this._configurationService.getValue("terminal.integrated.enableNotifications" /* EnableNotifications */) === true,
      isWindowFocused: () => getActiveWindow().document.hasFocus(),
      isTerminalVisible: () => this._ctx.instance.isVisible,
      focusTerminal: () => this._ctx.instance.focus(true),
      notify: (notification) => this._notificationService.notify(notification),
      updateEnableNotifications: (value2) => this._configurationService.updateValue("terminal.integrated.enableNotifications" /* EnableNotifications */, value2),
      logWarn: (message) => this._logService.warn(message),
      writeToProcess: (data) => {
        void this._ctx.instance.sendText(data, false);
      }
    }));
  }
  static {
    this.ID = "terminal.oscNotifications";
  }
  xtermReady(xterm) {
    this._register(xterm.raw.parser.registerOscHandler(99, (data) => this._handler.handleSequence(data)));
  }
};

TerminalOscNotificationsContribution = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, ITerminalLogService)
], TerminalOscNotificationsContribution);

registerTerminalContribution(TerminalOscNotificationsContribution.ID, TerminalOscNotificationsContribution);
export { TerminalOscNotificationsContribution };
