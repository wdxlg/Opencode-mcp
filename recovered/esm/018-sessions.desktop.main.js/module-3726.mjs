// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionDetailsAction.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { generateUuid } from "./module-0190.mjs";
import { IEditorService } from "./module-0935.mjs";
import { getUntitledSessionTitle } from "./module-1767.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionDetailsAction.ts
var ShowSessionDetailsAction = class _ShowSessionDetailsAction extends Action2 {
  static {
    this.ID = "sessions.showSessionDetails";
  }
  constructor() {
    super({
      id: _ShowSessionDetailsAction.ID,
      title: localize2(5329, "Show Session Details"),
      category: Categories.Developer,
      f1: true,
      precondition: ContextKeyExpr.and(IsSessionsWindowContext, ChatContextKeys.enabled)
    });
  }
  async run(accessor) {
    const contents = formatSessionDetails(accessor.get(ISessionsManagementService).getSessions());
    const resource = URI.from({
      scheme: Schemas.untitled,
      path: localize(5328, null),
      query: generateUuid()
    });
    await accessor.get(IEditorService).openEditor({
      resource,
      contents,
      languageId: "plaintext",
      options: { pinned: true }
    });
  }
};

registerAction2(ShowSessionDetailsAction);

function formatSessionDetails(allSessions) {
  const sessions = allSessions.filter((session) => !session.isArchived.get() && !(session.isAutomation?.get() ?? false));
  const lines = ["Session Details", ""];
  if (sessions.length === 0) {
    lines.push("No non-archived user sessions.");
    return `${lines.join("\n")}
`;
  }
  for (const [index2, session] of sessions.entries()) {
    const title = session.title.get() || getUntitledSessionTitle(session.isQuickChat?.get() ?? false);
    const workingDirectories = session.workspace.get()?.folders.map((folder) => formatWorkingDirectory(folder.workingDirectory)) ?? [];
    lines.push(`Session: ${title.replace(/\r\n?|\n/g, " ")}`);
    if (workingDirectories.length === 0) {
      lines.push("Working directory: (none)");
    } else {
      for (const workingDirectory of workingDirectories) {
        lines.push(`Working directory: ${workingDirectory}`);
      }
    }
    lines.push(`Resource: ${session.resource.toString(true)}`);
    if (index2 < sessions.length - 1) {
      lines.push("");
    }
  }
  return `${lines.join("\n")}
`;
}

function formatWorkingDirectory(resource) {
  return resource.scheme === Schemas.file ? resource.fsPath : resource.toString(true);
}
export { formatSessionDetails, formatWorkingDirectory, ShowSessionDetailsAction };
