// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/mobile/mobileSessionTypePicker.ts
import { SessionTypePicker } from "./module-3569.mjs";
import { isPhoneLayout } from "./module-3445.mjs";
import { getSessionTypeAvailability, getSessionTypeUnavailableLabel } from "./module-2152.mjs";
import { showMobilePickerSheet } from "./module-3565.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatInputNotificationService } from "./module-1460.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/sessions/contrib/chat/browser/mobile/mobileSessionTypePicker.ts
var MobileSessionTypePicker = class extends SessionTypePicker {
  constructor(session, options3, actionWidgetService, sessionsManagementService, _sessionsProvidersService, storageService, telemetryService, chatSessionsService, chatEntitlementService, languageModelsService, configurationService, chatInputNotificationService, layoutService, contextKeyService) {
    super(session, options3, actionWidgetService, sessionsManagementService, _sessionsProvidersService, storageService, telemetryService, chatSessionsService, chatEntitlementService, languageModelsService, configurationService, chatInputNotificationService, contextKeyService);
    this._sessionsProvidersService = _sessionsProvidersService;
    this.layoutService = layoutService;
  }
  render(container2, options3) {
    super.render(container2, options3);
  }
  _showPicker(anchor = this._triggerElement) {
    if (!anchor) {
      return;
    }
    if (!isPhoneLayout(this.layoutService)) {
      super._showPicker(anchor);
      return;
    }
    if (this._folderSessionTypes.length <= 1 && this._pickServedByFolder(this._picked)) {
      return;
    }
    const groups = /* @__PURE__ */ new Map();
    for (const folderType of this._folderSessionTypes) {
      const groupTitle = this._sessionsProvidersService.getProvider(folderType.providerId)?.label ?? folderType.providerId;
      const existing = groups.get(groupTitle);
      if (existing) {
        existing.push(folderType);
      } else {
        groups.set(groupTitle, [folderType]);
      }
    }
    const showSectionHeaders = groups.size > 1;
    const sheetItems = [];
    for (const [groupTitle, types] of groups) {
      let isFirstInGroup = true;
      for (const { providerId, sessionType } of types) {
        const availability = getSessionTypeAvailability(this.chatSessionsService, this.chatEntitlementService, this.languageModelsService, sessionType.chatSessionType ?? sessionType.id);
        sheetItems.push({
          id: `${providerId}\0${sessionType.id}`,
          label: sessionType.label,
          icon: sessionType.icon,
          checked: providerId === this._picked?.providerId && sessionType.id === this._picked?.sessionTypeId,
          disabled: availability !== 0 /* Available */,
          description: getSessionTypeUnavailableLabel(availability),
          sectionTitle: showSectionHeaders && isFirstInGroup ? groupTitle : void 0
        });
        isFirstInGroup = false;
      }
    }
    const trigger = this._triggerElement;
    if (!trigger) {
      return;
    }
    trigger.setAttribute("aria-expanded", "true");
    showMobilePickerSheet(
      this.layoutService.mainContainer,
      localize(4417, null),
      sheetItems
    ).then((id2) => {
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
      if (id2 !== void 0) {
        const [providerId, sessionTypeId] = id2.split("\0");
        if (providerId && sessionTypeId) {
          this._handleSelectedSessionType({ providerId, sessionTypeId });
        }
      }
    });
  }
};

MobileSessionTypePicker = __decorateClass([
  __decorateParam(2, IActionWidgetService),
  __decorateParam(3, ISessionsManagementService),
  __decorateParam(4, ISessionsProvidersService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IChatSessionsService),
  __decorateParam(8, IChatEntitlementService),
  __decorateParam(9, ILanguageModelsService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IChatInputNotificationService),
  __decorateParam(12, IWorkbenchLayoutService),
  __decorateParam(13, IContextKeyService)
], MobileSessionTypePicker);
export { MobileSessionTypePicker };
