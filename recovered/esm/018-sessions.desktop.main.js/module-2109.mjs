// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatCard.ts
import { Button } from "./module-0546.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatCard.ts
var CHAT_CARD_LARGE_CLASS = "chat-card-large";

var CHAT_CARD_HEADER_CLASS = "chat-card-header";

var CHAT_CARD_TITLE_CLASS = "chat-card-title";

var CHAT_CARD_HEADER_ACTIONS_CLASS = "chat-card-header-actions";

var chatCardButtonStyles = {
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

function createChatCardIconButton(store, container2, hoverService, options3) {
  const button = store.add(new Button(container2, { ...chatCardButtonStyles, secondary: true, supportIcons: true }));
  button.element.classList.add("chat-card-icon-button");
  if (options3.variant) {
    button.element.classList.add(`chat-card-icon-button-${options3.variant}`);
  }
  if (options3.icon) {
    button.label = `$(${options3.icon.id})`;
  }
  button.element.setAttribute("aria-label", options3.ariaLabel);
  if (options3.hoverContent !== void 0) {
    store.add(hoverService.setupDelayedHover(button.element, { content: options3.hoverContent }));
  }
  return button;
}
export { createChatCardIconButton, CHAT_CARD_LARGE_CLASS, CHAT_CARD_HEADER_CLASS, CHAT_CARD_TITLE_CLASS, CHAT_CARD_HEADER_ACTIONS_CLASS, chatCardButtonStyles };
