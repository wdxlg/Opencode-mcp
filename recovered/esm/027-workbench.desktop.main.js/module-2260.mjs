// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/chatPills.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, reset } from "./module-0075.mjs";
import { ToolBar } from "./module-0503.mjs";
import { localize } from "./module-0001.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { asCssVariable, asCssVariableWithDefault } from "./module-0226.mjs";
import { buttonSecondaryBackground } from "./module-0233.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { isMacintosh } from "./module-0014.mjs";


// src/vs/workbench/browser/chatPills.ts
function getChatPillEntries(sections) {
  return sections.flatMap((section) => section.entries);
}

var ChatPillsWidget = class extends Disposable {
  constructor(model, options3, contextMenuService) {
    super();
    this._onDidChangePills = this._register(new Emitter());
    this.onDidChangePills = this._onDidChangePills.event;
    this._pillByAction = /* @__PURE__ */ new Map();
    this._pills = [];
    this._pillViewItems = [];
    this.element = $(".chat-pills.hidden");
    this._toolbar = this._register(new ToolBar(this.element, contextMenuService, {
      ariaLabel: options3?.ariaLabel ?? localize(6192, null),
      actionRunner: options3?.actionRunner,
      allowContextMenu: options3?.allowContextMenu,
      actionViewItemProvider: (action, viewItemOptions) => {
        const viewItem = this._pillByAction.get(action)?.createActionViewItem?.(viewItemOptions) ?? new ChatPillActionViewItem(void 0, action, viewItemOptions);
        if (viewItem instanceof ChatPillActionViewItemBase) {
          this._pillViewItems.push(viewItem);
        }
        return viewItem;
      }
    }));
    this.isVisible = derived(this, (reader) => model.pills.read(reader).length > 0);
    this._register(autorun((reader) => {
      const pills = model.pills.read(reader);
      this._pillByAction = new Map(pills.map((pill) => [pill.action, pill]));
      this._toolbar.context = model.context?.read(reader);
      const pillsChanged = pills.length !== this._pills.length || pills.some((pill, index2) => pill !== this._pills[index2]);
      if (pillsChanged) {
        this._pills = pills;
        this._pillViewItems = [];
        this._toolbar.setActions(pills.map((pill) => pill.action));
      }
      this.element.classList.toggle("hidden", pills.length === 0);
      if (pillsChanged) {
        this._onDidChangePills.fire();
      }
    }));
  }
  /** Returns the rendered button for each pill. */
  getPillElements() {
    return this._pillViewItems.flatMap((viewItem) => viewItem.buttonElement ? [viewItem.buttonElement] : []);
  }
  /**
   * The pill whose rendered item contains `target`, if any. Toolbar items are
   * rendered in pill order, so their position identifies them without each
   * pill having to tag its own DOM.
   */
  getPill(target) {
    const item = target?.closest(".action-item");
    if (!item?.parentElement) {
      return void 0;
    }
    return this._pills[[...item.parentElement.children].indexOf(item)];
  }
};

ChatPillsWidget = __decorateClass([
  __decorateParam(2, IContextMenuService)
], ChatPillsWidget);

var chatPillBackground = asCssVariableWithDefault("chat.list.background", asCssVariable(buttonSecondaryBackground));

var ChatPillActionViewItemBase = class extends BaseActionViewItem {
  /** The rendered button owned by this pill. */
  get buttonElement() {
    return this.button?.element;
  }
  /**
   * Per-pill modifier classes added alongside the shared `chat-pill-item` and
   * `chat-pill-button`. A single class each, since these are applied with
   * `classList.add`, which rejects space-separated values.
   */
  get itemModifierClass() {
    return void 0;
  }
  get buttonModifierClass() {
    return void 0;
  }
  get buttonOptions() {
    return {};
  }
  render(container3) {
    this.element = container3;
    container3.classList.add("chat-pill-item");
    if (this.itemModifierClass) {
      container3.classList.add(this.itemModifierClass);
    }
    const button = this.button = this._register(new Button(container3, {
      secondary: true,
      small: true,
      ...this.buttonOptions,
      ...defaultButtonStyles,
      buttonSecondaryBackground: chatPillBackground,
      buttonSecondaryHoverBackground: chatPillBackground
    }));
    button.element.classList.add("monaco-text-button", "chat-pill-button");
    if (this.buttonModifierClass) {
      button.element.classList.add(this.buttonModifierClass);
    }
    this._register(addDisposableListener(button.element.ownerDocument.body, EventType.MOUSE_DOWN, (event) => {
      if (event.button === 0 && (!isMacintosh || !event.ctrlKey) && this.hasOpenDropdown() && button.element.contains(event.target)) {
        event.stopPropagation();
      }
    }));
    this._register(button.onDidClick(() => {
      if (this._action.enabled) {
        this.onDidClickButton();
      }
    }));
    this.renderContent(button);
    this.updateEnabled();
    this.updateTooltip();
  }
  hasOpenDropdown() {
    return false;
  }
  onDidClickButton() {
    this.actionRunner.run(this._action, this._context);
  }
  focus() {
    if (this.button) {
      this.button.element.tabIndex = 0;
      this.button.focus();
    }
  }
  blur() {
    if (this.button) {
      this.button.element.tabIndex = -1;
      this.button.element.blur();
    }
  }
  setFocusable(focusable) {
    if (this.button) {
      this.button.element.tabIndex = focusable ? 0 : -1;
    }
  }
  isFocused() {
    return !!this.button?.hasFocus();
  }
  updateEnabled() {
    if (this.button) {
      this.button.enabled = this._action.enabled;
    }
  }
  updateAriaLabel() {
    const ariaLabel = this.getAriaLabel();
    if (ariaLabel) {
      this.button?.element.setAttribute("aria-label", ariaLabel);
    } else {
      this.button?.element.removeAttribute("aria-label");
    }
  }
  getAriaLabel() {
    return this.getTooltip();
  }
  getTooltip() {
    return this._action.tooltip || this._action.label || void 0;
  }
};

var ChatPillActionViewItem = class extends ChatPillActionViewItemBase {
  constructor(context2, action, options3) {
    super(context2, action, options3);
  }
  renderContent() {
    this.updateLabel();
  }
  updateClass() {
    this.updateLabel();
  }
  updateLabel() {
    if (this.button) {
      reset(this.button.element, ...this.getLabelContent());
    }
  }
  getLabelContent() {
    const content2 = [];
    const iconElement = this.getIconElement();
    if (iconElement) {
      content2.push(iconElement);
    }
    const labelText = this.getLabelText();
    if (labelText) {
      content2.push($("span.chat-pill-label", void 0, labelText));
    }
    content2.push(...this.getAdditionalLabelContent());
    return content2;
  }
  getIconElement() {
    const iconClasses = this._action.class?.split(" ").filter((cssClass) => !!cssClass);
    if (!iconClasses?.length) {
      return void 0;
    }
    return $(`span.chat-pill-icon${iconClasses.map((cssClass) => `.${cssClass}`).join("")}`, { "aria-hidden": "true" });
  }
  getLabelText() {
    return this._action.label;
  }
  getAdditionalLabelContent() {
    return [];
  }
};
export { getChatPillEntries, ChatPillsWidget, chatPillBackground, ChatPillActionViewItemBase, ChatPillActionViewItem };
