// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputPickerActionItem.ts
import { withActionWidgetDropdownMotion } from "./module-2058.mjs";
import { ActionWidgetDropdownActionViewItem } from "./module-2059.mjs";
import { autorun } from "./module-0052.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputPickerActionItem.ts
function withChatInputPickerMotion(listOptions) {
  return {
    ...withActionWidgetDropdownMotion(listOptions),
    anchorPosition: 1 /* ABOVE */
  };
}

var ChatInputPickerActionViewItem = class extends ActionWidgetDropdownActionViewItem {
  constructor(action, actionWidgetOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService) {
    const listOptionsProvider = actionWidgetOptions.listOptions === void 0 ? actionWidgetOptions.listOptionsProvider : void 0;
    const optionsWithAnchor = {
      ...actionWidgetOptions,
      getAnchor: () => this.getAnchorElement(),
      listOptions: listOptionsProvider ? void 0 : withChatInputPickerMotion(actionWidgetOptions.listOptions),
      listOptionsProvider: listOptionsProvider ? { getListOptions: () => withChatInputPickerMotion(listOptionsProvider.getListOptions()) } : void 0
    };
    super(action, optionsWithAnchor, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.pickerOptions = pickerOptions;
    this._register(autorun((reader) => {
      const compact2 = this.pickerOptions.compact.read(reader);
      if (this.element) {
        this.element.classList.toggle("compact", compact2);
        this.renderLabel(this.element);
      }
    }));
  }
  /**
   * Returns the anchor element for the dropdown.
   * Falls back to the overflow anchor if this element is not in the DOM.
   */
  getAnchorElement() {
    if (this._externalAnchor?.isConnected) {
      return this._externalAnchor;
    }
    if (this.element && getActiveWindow().document.contains(this.element)) {
      return this.element;
    }
    return this.pickerOptions.getOverflowAnchor?.() ?? this.element;
  }
  show(anchor) {
    this._externalAnchor = anchor;
    super.show();
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("chat-input-picker-item");
    const compact2 = this.pickerOptions.compact.get();
    if (this.element) {
      this.element.classList.toggle("compact", compact2);
      this.renderLabel(this.element);
    }
  }
};

ChatInputPickerActionViewItem = __decorateClass([
  __decorateParam(3, IActionWidgetService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, ITelemetryService)
], ChatInputPickerActionViewItem);
export { withChatInputPickerMotion, ChatInputPickerActionViewItem };
