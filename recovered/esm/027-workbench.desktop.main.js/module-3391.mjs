// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatAccessibleView.ts
import { MENU_TERMINAL_CHAT_WIDGET_STATUS, TerminalChatContextKeys } from "./module-1153.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { IMenuService, MenuItemAction } from "./module-0092.mjs";
import { TerminalChatController } from "./module-3390.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatAccessibleView.ts
var TerminalInlineChatAccessibleView = class {
  constructor() {
    this.priority = 105;
    this.name = "terminalInlineChat";
    this.type = "view" /* View */;
    this.when = TerminalChatContextKeys.focused;
  }
  getProvider(accessor) {
    const terminalService = accessor.get(ITerminalService);
    const menuService = accessor.get(IMenuService);
    const actions = [];
    const contextKeyService = TerminalChatController.activeChatController?.scopedContextKeyService;
    if (contextKeyService) {
      const menuActions = menuService.getMenuActions(MENU_TERMINAL_CHAT_WIDGET_STATUS, contextKeyService);
      for (const action of menuActions) {
        for (const a of action[1]) {
          if (a instanceof MenuItemAction) {
            actions.push(a);
          }
        }
      }
    }
    const controller = terminalService.activeInstance?.getContribution(TerminalChatController.ID) ?? void 0;
    if (!controller?.lastResponseContent) {
      return;
    }
    const responseContent = controller.lastResponseContent;
    return new AccessibleContentProvider(
      "terminal-chat" /* TerminalChat */,
      { type: "view" /* View */ },
      () => {
        return responseContent;
      },
      () => {
        controller.focus();
      },
      "accessibility.verbosity.inlineChat" /* InlineChat */,
      void 0,
      actions
    );
  }
};
export { TerminalInlineChatAccessibleView };
