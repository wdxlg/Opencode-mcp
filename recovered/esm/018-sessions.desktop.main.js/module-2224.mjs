// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatRestoreCheckpointActionViewItem.ts
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, reset } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatRestoreCheckpointActionViewItem.ts
var ChatRestoreCheckpointActionViewItem = class extends MenuEntryActionViewItem {
  constructor(action, options3, _needsConfirmation, _cancelLabel, _confirmTooltip, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService) {
    super(action, options3, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService);
    this._needsConfirmation = _needsConfirmation;
    this._cancelLabel = _cancelLabel;
    this._confirmTooltip = _confirmTooltip;
    this._confirming = false;
    this._confirmDisposables = this._register(new DisposableStore());
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("chat-restore-checkpoint-item");
    const cancelButton = this._cancelButton = append(container2, $("a.action-label.chat-restore-checkpoint-cancel"));
    cancelButton.setAttribute("role", "button");
    cancelButton.tabIndex = -1;
    reset(cancelButton, ...renderLabelWithIcons(`$(close-compact)`));
    cancelButton.title = this._cancelLabel;
    cancelButton.setAttribute("aria-label", this._cancelLabel);
    this._register(addDisposableListener(cancelButton, EventType.CLICK, (e4) => {
      EventHelper.stop(e4, true);
      this._setConfirming(false);
      this.label?.focus();
    }));
    this._register(addDisposableListener(container2, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (!event.equals(3 /* Enter */) && !event.equals(10 /* Space */)) {
        return;
      }
      if (this._confirming) {
        EventHelper.stop(e4, true);
        this._setConfirming(false);
        void super.onClick(new MouseEvent("click"));
        return;
      }
      if (this._needsConfirmation(this._context)) {
        EventHelper.stop(e4, true);
        this._setConfirming(true);
      }
    }));
    this._updateConfirmUI();
  }
  async onClick(event) {
    if (this._confirming) {
      this._setConfirming(false);
      return super.onClick(event);
    }
    if (this._needsConfirmation(this._context)) {
      event.preventDefault();
      event.stopPropagation();
      this._setConfirming(true);
      return;
    }
    return super.onClick(event);
  }
  _setConfirming(value2) {
    if (this._confirming === value2) {
      return;
    }
    this._confirming = value2;
    this._confirmDisposables.clear();
    if (value2 && this.element) {
      this._confirmDisposables.add(addDisposableListener(this.element, EventType.FOCUS_OUT, (e4) => {
        const next = e4.relatedTarget;
        if (!next || !this.element?.contains(next)) {
          this._setConfirming(false);
        }
      }));
      this._confirmDisposables.add(addDisposableListener(this.element, EventType.KEY_DOWN, (e4) => {
        const event = new StandardKeyboardEvent(e4);
        if (event.equals(9 /* Escape */)) {
          EventHelper.stop(e4, true);
          this._setConfirming(false);
          this.label?.focus();
        }
      }));
    }
    this._updateConfirmUI();
  }
  _updateConfirmUI() {
    this.element?.classList.toggle("confirming", this._confirming);
    this._cancelButton?.classList.toggle("hidden", !this._confirming);
    this.updateLabel();
    this.updateTooltip();
  }
  updateLabel() {
    if (this._confirming && this.label) {
      reset(this.label, ...renderLabelWithIcons(`${localize(12454, null)}`));
      return;
    }
    super.updateLabel();
  }
  getTooltip() {
    if (this._confirming) {
      return this._confirmTooltip;
    }
    return super.getTooltip();
  }
};

ChatRestoreCheckpointActionViewItem = __decorateClass([
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, IAccessibilityService)
], ChatRestoreCheckpointActionViewItem);
export { ChatRestoreCheckpointActionViewItem };
