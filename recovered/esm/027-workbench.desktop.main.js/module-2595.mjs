// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugTypes.ts
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { BreadcrumbsItem } from "./module-1573.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugTypes.ts
var $67 = $;

var CHAT_DEBUG_FILTER_ACTIVE = new RawContextKey("chatDebugFilterActive", false);

var CHAT_DEBUG_KIND_TOOL_CALL = new RawContextKey("chatDebug.kindToolCall", true);

var CHAT_DEBUG_KIND_MODEL_TURN = new RawContextKey("chatDebug.kindModelTurn", true);

var CHAT_DEBUG_KIND_PROMPT_DISCOVERY = new RawContextKey("chatDebug.kindPromptDiscovery", true);

var CHAT_DEBUG_KIND_SUBAGENT = new RawContextKey("chatDebug.kindSubagent", true);

var CHAT_DEBUG_CMD_TOGGLE_TOOL_CALL = "chatDebug.filter.toggleToolCall";

var CHAT_DEBUG_CMD_TOGGLE_MODEL_TURN = "chatDebug.filter.toggleModelTurn";

var CHAT_DEBUG_CMD_TOGGLE_PROMPT_DISCOVERY = "chatDebug.filter.togglePromptDiscovery";

var CHAT_DEBUG_CMD_TOGGLE_SUBAGENT = "chatDebug.filter.toggleSubagent";

var TextBreadcrumbItem = class _TextBreadcrumbItem extends BreadcrumbsItem {
  constructor(_text, _isLink = false) {
    super();
    this._text = _text;
    this._isLink = _isLink;
  }
  equals(other) {
    return other instanceof _TextBreadcrumbItem && other._text === this._text;
  }
  dispose() {
  }
  render(container3) {
    container3.classList.add("chat-debug-breadcrumb-item");
    if (this._isLink) {
      container3.classList.add("chat-debug-breadcrumb-item-link");
    }
    append(container3, $67("span.chat-debug-breadcrumb-item-label", void 0, this._text));
  }
};

function setupBreadcrumbKeyboardNavigation(container3, widget) {
  return addDisposableListener(container3, EventType.KEY_DOWN, (e) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        widget.focusPrev();
        break;
      case "ArrowRight":
        e.preventDefault();
        widget.focusNext();
        break;
      case "Home":
        e.preventDefault();
        widget.setFocused(widget.getItems()[0]);
        break;
      case "End": {
        e.preventDefault();
        const items = widget.getItems();
        widget.setFocused(items[items.length - 1]);
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        const focused = widget.getFocused();
        if (focused) {
          widget.setSelection(focused);
        }
        break;
      }
    }
  });
}
export { setupBreadcrumbKeyboardNavigation, $67, CHAT_DEBUG_FILTER_ACTIVE, CHAT_DEBUG_KIND_TOOL_CALL, CHAT_DEBUG_KIND_MODEL_TURN, CHAT_DEBUG_KIND_PROMPT_DISCOVERY, CHAT_DEBUG_KIND_SUBAGENT, CHAT_DEBUG_CMD_TOGGLE_TOOL_CALL, CHAT_DEBUG_CMD_TOGGLE_MODEL_TURN, CHAT_DEBUG_CMD_TOGGLE_PROMPT_DISCOVERY, CHAT_DEBUG_CMD_TOGGLE_SUBAGENT, TextBreadcrumbItem };
