// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/openAgentHostStateFileAction.ts
import { IAgentHostConnectionsService } from "./module-0959.mjs";
import { IEditorService } from "./module-0934.mjs";
import { INotificationService } from "./module-0336.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { IChatWidgetService } from "./module-0981.mjs";


// src/vs/workbench/contrib/chat/browser/actions/openAgentHostStateFileAction.ts
async function openAgentHostStateFile(accessor, sessionResource, chatTarget) {
  const connectionsService = accessor.get(IAgentHostConnectionsService);
  const editorService = accessor.get(IEditorService);
  const notificationService = accessor.get(INotificationService);
  if (!sessionResource) {
    notificationService.info(localize(8873, null));
    return;
  }
  if (chatTarget && !chatTarget.backendResource) {
    notificationService.info(localize(8872, null));
    return;
  }
  const sessionResolution = connectionsService.resolveSessionResource(sessionResource);
  if (!sessionResolution) {
    notificationService.info(localize(8875, null));
    return;
  }
  try {
    const stateFile = await sessionResolution.connection.getSessionStateFile(sessionResolution.backendSession, chatTarget?.backendResource);
    if (!stateFile) {
      notificationService.info(localize(8874, null));
      return;
    }
    await editorService.openEditor({ resource: stateFile });
  } catch (error) {
    notificationService.error(localize(8871, null, error instanceof Error ? error.message : String(error)));
  }
}

var OpenAgentHostStateFileAction = class _OpenAgentHostStateFileAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openCopilotCliStateFile";
  }
  constructor() {
    super({
      id: _OpenAgentHostStateFileAction.ID,
      title: localize2(8870, "Open Agent Host State File"),
      f1: true,
      category: Categories.Developer,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        IsSessionsWindowContext.negate()
      )
    });
  }
  async run(accessor) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const sessionResource = chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource;
    await openAgentHostStateFile(accessor, sessionResource);
  }
};
export { openAgentHostStateFile, OpenAgentHostStateFileAction };
