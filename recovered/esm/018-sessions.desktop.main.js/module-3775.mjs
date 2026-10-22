// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chatDebug/browser/chatDebug.contribution.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1381.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/chatDebug/browser/chatDebug.contribution.ts
var COPILOT_CHAT_VIEW_CONTAINER_ID = "workbench.view.extension.copilot-chat";

var COPILOT_CHAT_VIEW_ID = "copilot-chat";

var SESSIONS_CHAT_DEBUG_CONTAINER_ID = "workbench.sessions.panel.chatDebugContainer";

var chatDebugViewIcon = registerIcon("sessions-chat-debug-view-icon", Codicon.debug, localize(4747, null));

var RegisterChatDebugViewContribution = class extends Disposable {
  static {
    this.ID = "sessions.registerChatDebugView";
  }
  constructor(productService) {
    super();
    if (productService.quality === "stable") {
      return;
    }
    const viewContainerRegistry3 = Registry.as(Extensions13.ViewContainersRegistry);
    const viewsRegistry6 = Registry.as(Extensions13.ViewsRegistry);
    if (!this.tryMoveView(viewContainerRegistry3, viewsRegistry6)) {
      const listener = viewsRegistry6.onViewsRegistered((e4) => {
        for (const { views } of e4) {
          if (views.some((v2) => v2.id === COPILOT_CHAT_VIEW_ID)) {
            if (this.tryMoveView(viewContainerRegistry3, viewsRegistry6)) {
              listener.dispose();
            }
            break;
          }
        }
      });
      this._register(listener);
    }
  }
  tryMoveView(viewContainerRegistry3, viewsRegistry6) {
    const viewContainer = viewContainerRegistry3.get(COPILOT_CHAT_VIEW_CONTAINER_ID);
    if (!viewContainer) {
      return false;
    }
    const view = viewsRegistry6.getView(COPILOT_CHAT_VIEW_ID);
    if (!view) {
      return false;
    }
    viewsRegistry6.deregisterViews([view], viewContainer);
    viewContainerRegistry3.deregisterViewContainer(viewContainer);
    const chatDebugViewContainer = viewContainerRegistry3.registerViewContainer({
      id: SESSIONS_CHAT_DEBUG_CONTAINER_ID,
      title: localize2(4746, "Chat Debug"),
      icon: chatDebugViewIcon,
      order: 3,
      ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [SESSIONS_CHAT_DEBUG_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
      storageId: SESSIONS_CHAT_DEBUG_CONTAINER_ID,
      hideIfEmpty: true,
      windowEnablement: 2 /* Sessions */
    }, 1 /* Panel */, { doNotRegisterOpenCommand: true });
    const sessionsView = {
      ...view,
      canMoveView: false,
      windowEnablement: 2 /* Sessions */
    };
    viewsRegistry6.registerViews([sessionsView], chatDebugViewContainer);
    return true;
  }
};

RegisterChatDebugViewContribution = __decorateClass([
  __decorateParam(0, IProductService)
], RegisterChatDebugViewContribution);

registerWorkbenchContribution2(RegisterChatDebugViewContribution.ID, RegisterChatDebugViewContribution, WorkbenchPhase.BlockRestore);
export { COPILOT_CHAT_VIEW_CONTAINER_ID, COPILOT_CHAT_VIEW_ID, SESSIONS_CHAT_DEBUG_CONTAINER_ID, chatDebugViewIcon, RegisterChatDebugViewContribution };
