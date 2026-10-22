// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceClient/voiceModeActionViewItem.ts
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { addMicButtonContextMenuListener, getVoiceModeContextMenuActions } from "./module-2075.mjs";
import { getVoiceModeHoverContent } from "./module-2074.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/chat/browser/voiceClient/voiceModeActionViewItem.ts
var VOICE_START_COMMAND = "agentsVoice.startVoiceInChat";

var VoiceModeActionViewItem = class extends MenuEntryActionViewItem {
  constructor(action, options3, _commandService, _configurationService, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService) {
    super(action, options3, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService);
    this._commandService = _commandService;
    this._configurationService = _configurationService;
  }
  render(container2) {
    super.render(container2);
    this._register(addMicButtonContextMenuListener(
      container2,
      () => getVoiceModeContextMenuActions(this._commandService, this._configurationService, this._keybindingService, VOICE_START_COMMAND),
      this._contextMenuService
    ));
  }
  getHoverContents() {
    return getVoiceModeHoverContent(this.getTooltip() ?? "");
  }
};

VoiceModeActionViewItem = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IAccessibilityService)
], VoiceModeActionViewItem);
export { VOICE_START_COMMAND, VoiceModeActionViewItem };
