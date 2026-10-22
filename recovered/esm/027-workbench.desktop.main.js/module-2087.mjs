// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/speechToText/dictationDownloadActionViewItem.ts
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { addMicButtonContextMenuListener, getDictationContextMenuActions } from "./module-2081.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DictationDownloadRing, getDictationDownloadHoverContent } from "./module-2079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSpeechToTextService } from "./module-1348.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/chat/browser/speechToText/dictationDownloadActionViewItem.ts
var TOGGLE_DICTATION_COMMAND_ID = "workbench.action.chat.toggleSpeechToText";

var DictationDownloadActionViewItem = class extends MenuEntryActionViewItem {
  constructor(action, options3, _speechToTextService, _commandService, _configurationService, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService) {
    super(action, options3, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService);
    this._speechToTextService = _speechToTextService;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._ring = this._register(new MutableDisposable());
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("dictation-download-item");
    this._applyState();
    this._register(this._speechToTextService.onDidChangeDownloadingModel(() => this._applyState()));
    this._register(addMicButtonContextMenuListener(
      container3,
      () => getDictationContextMenuActions(this._commandService, this._configurationService, this._keybindingService, TOGGLE_DICTATION_COMMAND_ID),
      this._contextMenuService
    ));
  }
  updateClass() {
    super.updateClass();
    this._applyState();
  }
  _applyState() {
    if (!this.label) {
      return;
    }
    if (this._speechToTextService.isDownloadingModel) {
      this.label.classList.remove(...ThemeIcon.asClassNameArray(Codicon.loadingCompact));
      this.label.classList.add(...ThemeIcon.asClassNameArray(Codicon.micDownloadCompact));
      if (!this._ring.value && this.element) {
        this._ring.value = new DictationDownloadRing(this.element, this._speechToTextService);
      }
    } else {
      this.label.classList.remove(...ThemeIcon.asClassNameArray(Codicon.micDownloadCompact));
      this.label.classList.add(...ThemeIcon.asClassNameArray(Codicon.loadingCompact));
      this._ring.clear();
    }
  }
  getHoverContents() {
    return getDictationDownloadHoverContent(this._speechToTextService);
  }
};

DictationDownloadActionViewItem = __decorateClass([
  __decorateParam(2, IChatSpeechToTextService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, IAccessibilityService)
], DictationDownloadActionViewItem);
export { TOGGLE_DICTATION_COMMAND_ID, DictationDownloadActionViewItem };
