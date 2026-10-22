// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/persistSessionMetadata.ts
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/node/shared/persistSessionMetadata.ts
var SESSION_CUSTOM_TITLE_KEY = "customTitle";

var SESSION_CUSTOM_TITLE_SOURCE_KEY = "customTitleSource";

var SESSION_ARTIFACTS_KEY = "sessionArtifacts";

var AGENT_HOST_TITLE_SOURCE_USER = "user";

var AGENT_HOST_TITLE_SOURCE_AGENT = "agent";

var AGENT_HOST_TITLE_SOURCE_AUTO = "auto";

function customChatTitleMetadataKey(chat) {
  return `customChatTitle:${chat}`;
}

function customChatTitleSourceMetadataKey(chat) {
  return `customChatTitleSource:${chat}`;
}

function persistSessionMetadata(sessionDataService, logService, session, key, value) {
  const onError = (err) => {
    logService.warn(`[AgentHost] Failed to persist session metadata '${key}'`, err);
  };
  try {
    const ref = sessionDataService.openDatabase(URI.parse(session));
    ref.object.setMetadata(key, value).catch(onError).finally(() => {
      ref.dispose();
    });
  } catch (err) {
    onError(err);
  }
}

async function persistSessionMetadataValues(sessionDataService, session, values) {
  const ref = sessionDataService.openDatabase(URI.parse(session));
  try {
    await ref.object.setMetadataValues(values);
  } finally {
    ref.dispose();
  }
}
export { customChatTitleMetadataKey, customChatTitleSourceMetadataKey, persistSessionMetadata, persistSessionMetadataValues, SESSION_CUSTOM_TITLE_KEY, SESSION_CUSTOM_TITLE_SOURCE_KEY, SESSION_ARTIFACTS_KEY, AGENT_HOST_TITLE_SOURCE_USER, AGENT_HOST_TITLE_SOURCE_AGENT, AGENT_HOST_TITLE_SOURCE_AUTO };
