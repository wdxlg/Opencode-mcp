// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputStack.ts
import { isHTMLElement } from "./module-0075.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputStack.ts
var chatInputSurfaceStackClass = "chat-input-surface-stack";

var chatInputSurfaceStackSlotClass = "chat-input-surface-stack-slot";

var chatInputStackClass = "chat-input-stack";

var chatInputStackSlotClass = "chat-input-stack-slot";

var dockedClass = "chat-input-stack-docked";

var standaloneClass = "chat-input-stack-standalone";

var continuesClass = "chat-input-stack-continues";

var inputFocusedClass = "chat-input-stack-input-focused";

var inputWorkingClass = "chat-input-stack-input-working";

function setChatInputStackSlot(slot, state) {
  if (!slot) {
    return;
  }
  slot.classList.toggle(dockedClass, state === 1 /* Docked */);
  slot.classList.toggle(standaloneClass, state === 2 /* Standalone */);
  refreshChatInputStack(slot.parentElement);
}

function setChatInputStackInputFocused(input, focused) {
  setChatInputStackInputState(input, inputFocusedClass, focused);
}

function setChatInputStackInputWorking(input, working) {
  setChatInputStackInputState(input, inputWorkingClass, working);
}

function refreshChatInputStack(stack) {
  if (stack?.classList.contains(chatInputStackClass)) {
    updateChatInputStack(stack);
  }
}

function updateChatInputStack(stack) {
  let docked = stack.classList.contains(continuesClass);
  for (const slot of stack.children) {
    if (!isHTMLElement(slot)) {
      continue;
    }
    slot.classList.toggle(continuesClass, docked);
    if (slot.classList.contains(dockedClass)) {
      docked = true;
    } else if (slot.classList.contains(standaloneClass)) {
      docked = false;
    }
    if (slot.classList.contains(chatInputStackClass)) {
      updateChatInputStack(slot);
    }
  }
}

function setChatInputStackInputState(input, stateClass, enabled) {
  input.closest(`.${chatInputStackClass}`)?.classList.toggle(stateClass, enabled);
}
export { setChatInputStackSlot, setChatInputStackInputFocused, setChatInputStackInputWorking, refreshChatInputStack, updateChatInputStack, setChatInputStackInputState, chatInputSurfaceStackClass, chatInputSurfaceStackSlotClass, chatInputStackClass, chatInputStackSlotClass, dockedClass, standaloneClass, continuesClass, inputFocusedClass, inputWorkingClass };
