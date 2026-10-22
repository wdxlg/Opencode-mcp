// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newSessionPromptOptions.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { $, append, clearNode, setVisibility } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { setChatInputStackSlot } from "./module-2033.mjs";
import { Button } from "./module-0546.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderIcon } from "./module-0467.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/sessions/contrib/chat/browser/newSessionPromptOptions.ts
var promptOptionButtonStyles = {
  buttonBackground: void 0,
  buttonHoverBackground: void 0,
  buttonForeground: void 0,
  buttonSeparator: void 0,
  buttonSecondaryBackground: void 0,
  buttonSecondaryHoverBackground: void 0,
  buttonSecondaryForeground: void 0,
  buttonSecondaryBorder: void 0,
  buttonBorder: void 0
};

var NewSessionPromptOptionsWidget = class extends Disposable {
  constructor(_container, _options, _hoverService) {
    super();
    this._container = _container;
    this._options = _options;
    this._hoverService = _hoverService;
    this._renderDisposables = this._register(new MutableDisposable());
    this._buttons = [];
    this._inputValue = "";
    this._selecting = false;
    const title = localize(4495, null);
    this.element = append(this._container, $(".new-session-prompt-options"));
    this.element.role = "group";
    this.element.ariaLabel = title;
    const header2 = append(this.element, $(".new-session-prompt-options-header"));
    append(header2, $("h2.new-session-prompt-options-title")).textContent = title;
    const actionBar3 = this._register(new ActionBar(header2));
    actionBar3.getContainer().classList.add("new-session-prompt-options-actions");
    const closeAction = this._register(new Action(
      "newSessionPromptOptions.close",
      localize(4493, null),
      ThemeIcon.asClassName(Codicon.close),
      true,
      () => this._options.onDidClose()
    ));
    actionBar3.push(closeAction, { icon: true, label: false });
    this._optionsContainer = append(this.element, $(".new-session-prompt-options-list"));
    this._setVisible(false);
  }
  /**
   * Show or hide the options, and report to the stack. Standalone, so a tip
   * above joins the options rather than the input.
   */
  _setVisible(visible) {
    setVisibility(visible, this.element);
    setChatInputStackSlot(this.element, visible ? 2 /* Standalone */ : 0 /* Empty */);
  }
  setState(state) {
    this._renderDisposables.clear();
    this._buttons = [];
    this._selectedOptionId = void 0;
    this._selecting = false;
    clearNode(this._optionsContainer);
    if (!state) {
      this.element.removeAttribute("aria-busy");
      this._setVisible(false);
      return;
    }
    this._setVisible(true);
    if (state.kind === "loading") {
      this.element.setAttribute("aria-busy", "true");
      this._renderLoading();
      return;
    }
    this.element.setAttribute("aria-busy", "false");
    this._renderOptions(state.options);
  }
  setInputValue(value2) {
    this._inputValue = value2;
    if (value2.length === 0) {
      this._selectedOptionId = void 0;
    }
    this._updateButtons();
  }
  shouldClearInputForRefresh() {
    const selectedOption = this._buttons.find((candidate) => candidate.option.id === this._selectedOptionId)?.option;
    return this._selecting || this._inputValue.length === 0 || matchesGeneratedPrompt(selectedOption, this._inputValue);
  }
  _renderLoading() {
    const store = new DisposableStore();
    this._renderDisposables.value = store;
    for (let index2 = 0; index2 < 3; index2++) {
      const skeleton = append(this._optionsContainer, $(".new-session-prompt-option.new-session-prompt-option-skeleton"));
      skeleton.ariaHidden = "true";
      append(skeleton, $(".new-session-prompt-option-skeleton-icon"));
      append(skeleton, $(".new-session-prompt-option-skeleton-line.title"));
      append(skeleton, $(".new-session-prompt-option-skeleton-line.description"));
    }
  }
  _renderOptions(options3) {
    const store = new DisposableStore();
    this._renderDisposables.value = store;
    const buttons = [];
    for (const option2 of options3) {
      const fullTitle = getFullTitle(option2);
      const ariaLabel = localize(4494, null, fullTitle, option2.description);
      const button = store.add(new Button(this._optionsContainer, {
        ...promptOptionButtonStyles,
        ariaLabel
      }));
      const hoverContent2 = new MarkdownString().appendMarkdown("**").appendText(fullTitle).appendMarkdown("**\n\n").appendText(option2.description);
      store.add(this._hoverService.setupDelayedHover(button.element, {
        content: hoverContent2,
        style: 1 /* Pointer */,
        position: { hoverPosition: 2 /* BELOW */ }
      }));
      button.element.classList.add("new-session-prompt-option");
      button.checked = false;
      button.element.classList.toggle("has-title-detail", !!option2.titleDetail);
      if (option2.icon) {
        const icon2 = append(button.element, renderIcon(option2.icon));
        icon2.classList.add("new-session-prompt-option-icon");
        icon2.ariaHidden = "true";
        if (option2.icon.color) {
          icon2.style.color = asCssVariable(option2.icon.color.id);
        }
      } else {
        button.element.classList.add("no-icon");
      }
      const title = append(button.element, $(".new-session-prompt-option-title"));
      append(title, $(".new-session-prompt-option-title-label")).textContent = option2.title;
      if (option2.titleDetail) {
        append(title, $(".new-session-prompt-option-title-detail")).textContent = option2.titleDetail;
        const actionIcon = append(title, renderIcon(Codicon.arrowRight));
        actionIcon.classList.add("new-session-prompt-option-action-icon");
        actionIcon.ariaHidden = "true";
      }
      append(button.element, $(".new-session-prompt-option-description")).textContent = option2.description;
      store.add(button.onDidClick(() => {
        void this._select(option2);
      }));
      buttons.push({ option: option2, button });
    }
    this._buttons = buttons;
    this._updateButtons();
  }
  async _select(option2) {
    const selectedOption = this._buttons.find((candidate) => candidate.option.id === this._selectedOptionId)?.option;
    const canSelect = !this._selecting && (this._inputValue.length === 0 || matchesGeneratedPrompt(selectedOption, this._inputValue));
    if (!canSelect || selectedOption?.id === option2.id && matchesGeneratedPrompt(option2, this._inputValue)) {
      return;
    }
    const previousSelectedOptionId = this._selectedOptionId;
    const expectedInput = this._inputValue;
    const animate2 = previousSelectedOptionId === void 0;
    this._selectedOptionId = option2.id;
    this._selecting = true;
    this._updateButtons();
    try {
      if (!await this._options.selectOption(option2, expectedInput, animate2)) {
        this._selectedOptionId = previousSelectedOptionId;
      } else {
        this._options.onDidSelectOption(option2);
      }
    } finally {
      this._selecting = false;
      this._updateButtons();
    }
  }
  _updateButtons() {
    const selectedOption = this._buttons.find((candidate) => candidate.option.id === this._selectedOptionId)?.option;
    const enabled = !this._selecting && (this._inputValue.length === 0 || matchesGeneratedPrompt(selectedOption, this._inputValue));
    for (const { option: option2, button } of this._buttons) {
      button.checked = option2.id === this._selectedOptionId;
      button.element.classList.toggle("option-disabled", !enabled);
      button.element.setAttribute("aria-disabled", String(!enabled));
      button.element.tabIndex = 0;
    }
  }
};

NewSessionPromptOptionsWidget = __decorateClass([
  __decorateParam(2, IHoverService)
], NewSessionPromptOptionsWidget);

function matchesGeneratedPrompt(option2, value2) {
  if (!option2) {
    return false;
  }
  if (value2 === option2.prompt) {
    return true;
  }
  return !!option2.placeholder && option2.prompt.includes(option2.placeholder) && value2 === option2.prompt.replace(option2.placeholder, "");
}

function getFullTitle(option2) {
  return option2.titleDetail ? `${option2.title} ${option2.titleDetail}` : option2.title;
}
export { matchesGeneratedPrompt, getFullTitle, promptOptionButtonStyles, NewSessionPromptOptionsWidget };
