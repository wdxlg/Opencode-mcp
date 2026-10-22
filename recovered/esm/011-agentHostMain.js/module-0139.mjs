// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/sessionDataService.ts
import { createDecorator } from "./module-0044.mjs";
import { extUriBiasedIgnorePathCase, normalizePath } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/common/sessionDataService.ts
var ISessionDataService = createDecorator("sessionDataService");

var SESSION_DB_FILENAME = "session.db";

var SESSION_ATTACHMENTS_DIRNAME = "attachments";

function isSessionAttachmentPath(sessionDataService, session, filePath) {
  const attachmentsDir = normalizePath(URI.joinPath(sessionDataService.getSessionDataDir(session), SESSION_ATTACHMENTS_DIRNAME));
  const fileUri = normalizePath(URI.file(filePath));
  return extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, attachmentsDir);
}
export { isSessionAttachmentPath, ISessionDataService, SESSION_DB_FILENAME, SESSION_ATTACHMENTS_DIRNAME };
