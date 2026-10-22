// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/copilotChatSessions/browser/mobilePermissionPicker.ts
import { DEFAULT_PERMISSION_LEVELS2, PermissionPicker } from "./module-3690.mjs";
import { isPhoneLayout } from "./module-3445.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { showMobilePickerSheet } from "./module-3565.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";


// src/vs/sessions/contrib/providers/copilotChatSessions/browser/mobilePermissionPicker.ts
var LEARN_MORE_ID = "learn-more";

var MobilePermissionPicker = class extends PermissionPicker {
  constructor(_delegate2, actionWidgetService, configurationService, dialogService, openerService, storageService, telemetryService, hoverService, _layoutService) {
    super(_delegate2, actionWidgetService, configurationService, dialogService, openerService, storageService, telemetryService, hoverService);
    this._layoutService = _layoutService;
  }
  showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible || this._isResolving()) {
      return;
    }
    if (!isPhoneLayout(this._layoutService)) {
      super.showPicker();
      return;
    }
    const policyRestricted = this.configurationService.inspect("chat.tools.global.autoApprove" /* GlobalAutoApprove */).policyValue === false;
    const levels = this._delegate.availableLevels ?? DEFAULT_PERMISSION_LEVELS2;
    const items = levels.map((level) => {
      const meta = this._getPermissionLevelMeta(level);
      return {
        id: level,
        label: meta.label,
        description: meta.detail,
        icon: meta.icon,
        checked: this._currentLevel === level,
        // Default is never policy-restricted; elevated levels are
        // disabled when enterprise policy turns off auto-approval.
        ...level !== "default" /* Default */ && policyRestricted ? { disabled: true } : {}
      };
    });
    items.push({
      id: LEARN_MORE_ID,
      label: localize(5060, null),
      icon: Codicon.linkExternal,
      sectionTitle: ""
    });
    const trigger = this._triggerElement;
    trigger.setAttribute("aria-expanded", "true");
    showMobilePickerSheet(
      this._layoutService.mainContainer,
      localize(5059, null),
      items
    ).then(async (id2) => {
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
      if (!id2) {
        return;
      }
      if (id2 === LEARN_MORE_ID) {
        await this.openerService.open(URI.parse("https://aka.ms/vscode/docs/permissions"));
        return;
      }
      await this._selectLevel(id2);
    });
  }
};

MobilePermissionPicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IHoverService),
  __decorateParam(8, IWorkbenchLayoutService)
], MobilePermissionPicker);
export { LEARN_MORE_ID, MobilePermissionPicker };
