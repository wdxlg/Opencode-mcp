// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/chatDropdownPill.ts
import { ChatPillActionViewItem, getChatPillEntries } from "./module-2235.mjs";
import { autorun } from "./module-0052.mjs";
import { $ } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { Codicon } from "./module-0085.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { derived } from "./module-0054.mjs";
import { ChatResourcePillActionViewItem } from "./module-2238.mjs";


// src/vs/workbench/browser/chatDropdownPill.ts
function getInlineEntry(entries2, options3) {
  if (entries2.length !== 1) {
    return void 0;
  }
  const entry = entries2[0];
  switch (options3.singleEntry ?? "inline" /* Inline */) {
    case "inline" /* Inline */:
      return entry;
    case "inlineResource" /* InlineResource */:
      return entry.resource ? entry : void 0;
    case "summary" /* Summary */:
      return void 0;
  }
}

var ChatDropdownPillActionViewItem = class extends ChatPillActionViewItem {
  constructor(action, options3, _sections, _pillOptions, _actionWidgetService, _languageService, _modelService) {
    super(void 0, action, options3);
    this._sections = _sections;
    this._pillOptions = _pillOptions;
    this._actionWidgetService = _actionWidgetService;
    this._languageService = _languageService;
    this._modelService = _modelService;
    this._dropdownVisible = false;
  }
  get itemModifierClass() {
    return "chat-dropdown-pill";
  }
  get buttonModifierClass() {
    return "chat-dropdown-pill-button";
  }
  renderContent() {
    this._register(autorun((reader) => {
      this._sections.read(reader);
      this.updateLabel();
      this.updateTooltip();
      this.updateAriaLabel();
      this._updatePopupState();
    }));
  }
  /**
   * A summarized pill opens a listbox, so it has to advertise the popup and
   * whether it is open. A single-entry pill activates directly and must not.
   */
  _updatePopupState() {
    const element = this.button?.element;
    if (!element) {
      return;
    }
    if (this.isSummarized) {
      element.setAttribute("aria-haspopup", "listbox");
      element.setAttribute("aria-expanded", String(this._dropdownVisible));
    } else {
      element.removeAttribute("aria-haspopup");
      element.removeAttribute("aria-expanded");
    }
  }
  /** Whether the pill stands for its entries rather than showing a single one. */
  get isSummarized() {
    const entries2 = this.entries;
    return entries2.length > 0 && !getInlineEntry(entries2, this._pillOptions);
  }
  get entries() {
    return getChatPillEntries(this._sections.get());
  }
  getIconElement() {
    const icon2 = this.isSummarized ? this._pillOptions.icon : this.entries.at(0)?.icon;
    return icon2 ? this.createIconElement(icon2) : void 0;
  }
  /** Renders a themed glyph, keeping a state color the button would otherwise flatten. */
  createIconElement(icon2) {
    const iconElement = $(`span.chat-pill-icon${ThemeIcon.asCSSSelector(icon2)}`, { "aria-hidden": "true" });
    if (icon2.color) {
      iconElement.style.setProperty("color", asCssVariable(icon2.color.id), "important");
    }
    return iconElement;
  }
  getLabelText() {
    return this.isSummarized ? this._pillOptions.summaryLabel(this.entries.length) : this.entries.at(0)?.label ?? "";
  }
  getAdditionalLabelContent() {
    return this.isSummarized ? [$(`span.chat-pill-chevron${ThemeIcon.asCSSSelector(Codicon.chevronDownCompact)}`, { "aria-hidden": "true" })] : [];
  }
  getTooltip() {
    if (this.isSummarized) {
      return this._pillOptions.summaryAriaLabel(this.entries.length);
    }
    const entry = this.entries.at(0);
    return entry?.tooltip ?? entry?.label ?? this._pillOptions.title;
  }
  getAriaLabel() {
    return this.isSummarized ? this._pillOptions.summaryAriaLabel(this.entries.length) : this.entries.at(0)?.ariaLabel ?? super.getAriaLabel();
  }
  onDidClickButton() {
    if (!this.isSummarized) {
      this.openEntry(this.entries.at(0));
      return;
    }
    this.showDropdown();
  }
  hasOpenDropdown() {
    return this._dropdownVisible;
  }
  openEntry(entry) {
    try {
      entry?.open();
    } catch (error) {
      onUnexpectedError(error);
    }
  }
  showDropdown() {
    const sections = this._sections.get().filter((section) => section.entries.length > 0);
    const trigger = this.button?.element;
    if (!trigger || this._actionWidgetService.isVisible || sections.length === 0) {
      return;
    }
    const items = [];
    for (const section of sections) {
      if (items.length > 0) {
        items.push({ kind: "separator" /* Separator */, label: "" });
      }
      items.push({ kind: "header" /* Header */, label: section.title, group: { title: section.title } });
      for (const entry of section.entries) {
        items.push({
          kind: "action" /* Action */,
          label: entry.label,
          group: { title: "", ...entry.icon ? { icon: entry.icon } : {} },
          ...entry.resource ? { iconClasses: getIconClasses(this._modelService, this._languageService, entry.resource, 0 /* FILE */) } : {},
          ...entry.toolbarActions?.length ? { toolbarActions: [...entry.toolbarActions] } : {},
          ariaDescription: entry.ariaDescription,
          hover: entry.hover,
          item: entry
        });
      }
    }
    const delegate = {
      onSelect: (entry) => {
        this._actionWidgetService.hide();
        this.openEntry(entry);
      },
      onHide: () => {
        this._dropdownVisible = false;
        this._updatePopupState();
        trigger.focus();
      }
    };
    this._dropdownVisible = true;
    this._updatePopupState();
    this._actionWidgetService.show(
      this._pillOptions.widgetId,
      false,
      items,
      delegate,
      trigger,
      void 0,
      [],
      {
        getAriaLabel: (item) => item.label ?? "",
        getWidgetAriaLabel: () => this._pillOptions.title
      },
      { minWidth: 240, maxWidth: 460, widgetClassName: "show-file-icons" }
    );
  }
};

ChatDropdownPillActionViewItem = __decorateClass([
  __decorateParam(4, IActionWidgetService),
  __decorateParam(5, ILanguageService),
  __decorateParam(6, IModelService)
], ChatDropdownPillActionViewItem);

function createChatSectionPill(action, sections, options3, resourceLabels, instantiationService) {
  const singleResourceEntry = derived((reader) => {
    const entry = getInlineEntry(getChatPillEntries(sections.read(reader)), options3);
    return entry?.resource ? entry : void 0;
  });
  const isResource = derived((reader) => !!singleResourceEntry.read(reader));
  return derived((reader) => isResource.read(reader) ? { action, createActionViewItem: (viewItemOptions) => new ChatResourcePillActionViewItem(action, viewItemOptions, singleResourceEntry, resourceLabels) } : { action, createActionViewItem: (viewItemOptions) => instantiationService.createInstance(ChatDropdownPillActionViewItem, action, viewItemOptions, sections, options3) });
}
export { getInlineEntry, createChatSectionPill, ChatDropdownPillActionViewItem };
