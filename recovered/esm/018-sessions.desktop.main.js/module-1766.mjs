// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/common/sessionsManagement.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/sessions/services/sessions/common/sessionsManagement.ts
var WorkspaceNotTrustedError = class extends Error {
  constructor() {
    super("Workspace not trusted");
    this.name = "WorkspaceNotTrustedError";
  }
};

var ISessionsManagementService = createDecorator("sessionsManagementService");

function inheritableSessionTarget(sessionsManagementService, session, folderUri) {
  if (!session || !folderUri) {
    return {};
  }
  const target = { providerId: session.providerId, sessionTypeId: session.sessionType };
  return sessionsManagementService.isNewSessionTargetAvailable(folderUri, target) ? target : {};
}
export { inheritableSessionTarget, WorkspaceNotTrustedError, ISessionsManagementService };
