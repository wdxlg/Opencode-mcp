// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSync.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4, parseScope } from "./module-0140.mjs";
import { distinct } from "./module-0007.mjs";
import { isObject, isString } from "./module-0010.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/userDataSync/common/userDataSync.ts
function getDisallowedIgnoredSettings() {
  const allSettings2 = Registry.as(Extensions4.Configuration).getConfigurationProperties();
  return Object.keys(allSettings2).filter((setting) => !!allSettings2[setting].disallowSyncIgnore);
}

function getDefaultIgnoredSettings(excludeExtensions = false) {
  const allSettings2 = Registry.as(Extensions4.Configuration).getConfigurationProperties();
  const ignoredSettings = getIgnoredSettings(allSettings2, excludeExtensions);
  const disallowedSettings = getDisallowedIgnoredSettings();
  return distinct([...ignoredSettings, ...disallowedSettings]);
}

function getIgnoredSettings(properties, excludeExtensions) {
  const ignoredSettings = /* @__PURE__ */ new Set();
  for (const key3 in properties) {
    if (excludeExtensions && !!properties[key3].source) {
      continue;
    }
    const scope = isString(properties[key3].scope) ? parseScope(properties[key3].scope) : properties[key3].scope;
    if (properties[key3].ignoreSync || scope === 2 /* MACHINE */ || scope === 7 /* MACHINE_OVERRIDABLE */) {
      ignoredSettings.add(key3);
    }
  }
  return [...ignoredSettings.values()];
}

var USER_DATA_SYNC_CONFIGURATION_SCOPE = "settingsSync";

var NON_EXISTING_RESOURCE_REF = "0";

function isAuthenticationProvider(thing) {
  return thing && isObject(thing) && isString(thing.id) && Array.isArray(thing.scopes);
}

var ALL_SYNC_RESOURCES = ["settings" /* Settings */, "keybindings" /* Keybindings */, "snippets" /* Snippets */, "prompts" /* Prompts */, "tasks" /* Tasks */, "extensions" /* Extensions */, "globalState" /* GlobalState */, "profiles" /* Profiles */, "mcp" /* Mcp */];

function getPathSegments(collection, ...paths) {
  return collection ? [collection, ...paths] : paths;
}

function getLastSyncResourceUri(collection, syncResource, environmentService, extUri2) {
  return extUri2.joinPath(environmentService.userDataSyncHome, ...getPathSegments(collection, syncResource, `lastSync${syncResource}.json`));
}

var IUserDataSyncStoreManagementService = createDecorator("IUserDataSyncStoreManagementService");

var IUserDataSyncStoreService = createDecorator("IUserDataSyncStoreService");

var IUserDataSyncLocalStoreService = createDecorator("IUserDataSyncLocalStoreService");

var HEADER_OPERATION_ID = "x-operation-id";

var HEADER_EXECUTION_ID = "X-Execution-Id";

function createSyncHeaders(executionId) {
  const headers = {};
  headers[HEADER_EXECUTION_ID] = executionId;
  return headers;
}

var UserDataSyncError = class extends Error {
  constructor(message, code, resource, operationId) {
    super(message);
    this.code = code;
    this.resource = resource;
    this.operationId = operationId;
    this.name = `${this.code} (UserDataSyncError) syncResource:${this.resource || "unknown"} operationId:${this.operationId || "unknown"}`;
  }
};

var UserDataSyncStoreError = class extends UserDataSyncError {
  constructor(message, url, code, serverCode, operationId) {
    super(message, code, void 0, operationId);
    this.url = url;
    this.serverCode = serverCode;
  }
};

((UserDataSyncError2) => {
  function toUserDataSyncError(error) {
    if (error instanceof UserDataSyncError2) {
      return error;
    }
    const match2 = /^(.+) \(UserDataSyncError\) syncResource:(.+) operationId:(.+)$/.exec(error.name);
    if (match2 && match2[1]) {
      const syncResource = match2[2] === "unknown" ? void 0 : match2[2];
      const operationId = match2[3] === "unknown" ? void 0 : match2[3];
      return new UserDataSyncError2(error.message, match2[1], syncResource, operationId);
    }
    return new UserDataSyncError2(error.message, "Unknown" /* Unknown */);
  }
  UserDataSyncError2.toUserDataSyncError = toUserDataSyncError;
})(UserDataSyncError || (UserDataSyncError = {}));

var SYNC_SERVICE_URL_TYPE = "sync.store.url.type";

function getEnablementKey(resource) {
  return `sync.enable.${resource}`;
}

var IUserDataSyncEnablementService = createDecorator("IUserDataSyncEnablementService");

var IUserDataSyncService = createDecorator("IUserDataSyncService");

var IUserDataSyncResourceProviderService = createDecorator("IUserDataSyncResourceProviderService");

var IUserDataAutoSyncService = createDecorator("IUserDataAutoSyncService");

var IUserDataSyncUtilService = createDecorator("IUserDataSyncUtilService");

var IUserDataSyncLogService = createDecorator("IUserDataSyncLogService");

var USER_DATA_SYNC_LOG_ID = "userDataSync";

var USER_DATA_SYNC_SCHEME = "vscode-userdata-sync";

var PREVIEW_DIR_NAME = "preview";
export { getDisallowedIgnoredSettings, getDefaultIgnoredSettings, getIgnoredSettings, isAuthenticationProvider, getPathSegments, getLastSyncResourceUri, createSyncHeaders, getEnablementKey, USER_DATA_SYNC_CONFIGURATION_SCOPE, NON_EXISTING_RESOURCE_REF, ALL_SYNC_RESOURCES, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, IUserDataSyncLocalStoreService, HEADER_OPERATION_ID, HEADER_EXECUTION_ID, UserDataSyncError, UserDataSyncStoreError, SYNC_SERVICE_URL_TYPE, IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncResourceProviderService, IUserDataAutoSyncService, IUserDataSyncUtilService, IUserDataSyncLogService, USER_DATA_SYNC_LOG_ID, USER_DATA_SYNC_SCHEME, PREVIEW_DIR_NAME };
