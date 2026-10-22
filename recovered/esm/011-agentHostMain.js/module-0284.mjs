// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/pendingEditContentStore.ts
import { URI } from "./module-0023.mjs";
import { VSBuffer, encodeHex } from "./module-0029.mjs";
import { InMemoryFileSystemProvider } from "./module-0283.mjs";


// src/vs/platform/agentHost/node/copilot/pendingEditContentStore.ts
var PENDING_EDIT_CONTENT_SCHEME = "pending-edit-content";

function buildPendingEditContentUri(sessionUri, toolCallId, filePath) {
  return URI.from({
    scheme: PENDING_EDIT_CONTENT_SCHEME,
    authority: encodeHex(VSBuffer.fromString(sessionUri)).toString(),
    path: `/${encodeURIComponent(toolCallId)}/${encodeHex(VSBuffer.fromString(filePath))}`
  });
}

function registerPendingEditContentProvider(fileService) {
  const provider = new InMemoryFileSystemProvider();
  const registration = fileService.registerProvider(PENDING_EDIT_CONTENT_SCHEME, provider);
  return {
    dispose() {
      registration.dispose();
      provider.dispose();
    }
  };
}
export { buildPendingEditContentUri, registerPendingEditContentProvider, PENDING_EDIT_CONTENT_SCHEME };
