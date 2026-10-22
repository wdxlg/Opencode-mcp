// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/mobile/mobileAgentHostModePicker.ts
import { AgentHostModePicker } from "./module-3694.mjs";
import { createChatPhoneInputSessionContext } from "./module-3695.mjs";
import { ChatPetAchievementIds, didExplicitlySwitchChatPetModel } from "./module-2111.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IChatPhoneInputPresenter } from "./module-2108.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatPetService } from "./module-2112.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/mobile/mobileAgentHostModePicker.ts
var MobileAgentHostModePicker = class extends AgentHostModePicker {
  constructor(session, actionWidgetService, sessionsProvidersService, telemetryService, hoverService, _phonePresenter, _chatWidgetService, _chatPetService) {
    super(session, actionWidgetService, sessionsProvidersService, telemetryService, hoverService, _chatPetService);
    this._phonePresenter = _phonePresenter;
    this._chatWidgetService = _chatWidgetService;
    this._chatPetService = _chatPetService;
  }
  _showPicker(anchor = this._triggerElement, onHide) {
    if (!anchor) {
      return false;
    }
    if (this._isCurrentlyResolvingConfig()) {
      return false;
    }
    if (this._phonePresenter.enabled.get()) {
      this._phonePresenter.showCombinedModeAndModelSheet(anchor, {
        kind: "session",
        getSessionContext: () => createChatPhoneInputSessionContext(this._session.get()),
        selectModel: (modelIdentifier) => {
          const chatResource = this._session.get()?.activeChat.get().resource;
          const inputPart = chatResource ? this._chatWidgetService.getWidgetBySessionResource(chatResource)?.inputPart : void 0;
          const previousModelIdentifier = inputPart?.selectedLanguageModel.get()?.identifier;
          const selected = inputPart?.switchModelByIdentifier(modelIdentifier, true, true) ?? false;
          if (selected && didExplicitlySwitchChatPetModel(previousModelIdentifier, modelIdentifier)) {
            this._chatPetService.unlockAchievement(ChatPetAchievementIds.ModelSwitch);
          }
          return selected;
        }
      }).finally(() => {
        anchor.focus();
        onHide?.();
      });
      return true;
    }
    return super._showPicker(anchor, onHide);
  }
};

MobileAgentHostModePicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IChatPhoneInputPresenter),
  __decorateParam(6, IChatWidgetService),
  __decorateParam(7, IChatPetService)
], MobileAgentHostModePicker);
export { MobileAgentHostModePicker };
