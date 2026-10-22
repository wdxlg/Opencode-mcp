// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/speechToText/dictationActionViewItem.ts
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { addMicButtonContextMenuListener, getDictationContextMenuActions } from "./module-2075.mjs";
import { setupDictationMicGlow } from "./module-2072.mjs";
import { getDictationDownloadHoverContent } from "./module-2073.mjs";
import { getDictationHoverContent } from "./module-2074.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IChatSpeechToTextService } from "./module-1347.mjs";


// src/vs/workbench/contrib/chat/browser/speechToText/dictationActionViewItem.ts
var DictationActionViewItem = class extends MenuEntryActionViewItem {
  constructor(action, options3, _isActive, _commandService, _configurationService, keybindingService, notificationService, contextKeyService, _dictationThemeService, contextMenuService, _dictationAccessibilityService, _speechToTextService) {
    super(action, options3, keybindingService, notificationService, contextKeyService, _dictationThemeService, contextMenuService, _dictationAccessibilityService);
    this._isActive = _isActive;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._dictationThemeService = _dictationThemeService;
    this._dictationAccessibilityService = _dictationAccessibilityService;
    this._speechToTextService = _speechToTextService;
  }
  render(container2) {
    super.render(container2);
    this._register(addMicButtonContextMenuListener(
      container2,
      () => getDictationContextMenuActions(this._commandService, this._configurationService, this._keybindingService, this._action.id),
      this._contextMenuService
    ));
    this._register(setupDictationMicGlow(container2, this._speechToTextService, this._dictationAccessibilityService, this._isActive, this._dictationThemeService));
  }
  getHoverContents() {
    if (this._isActive.get() && this._speechToTextService.isPreparingModel) {
      return getDictationDownloadHoverContent(this._speechToTextService);
    }
    return getDictationHoverContent(this.getTooltip() ?? "", this._configurationService);
  }
};

DictationActionViewItem = __decorateClass([
  __decorateParam(3, ICommandService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, IAccessibilityService),
  __decorateParam(11, IChatSpeechToTextService)
], DictationActionViewItem);
export { DictationActionViewItem };
