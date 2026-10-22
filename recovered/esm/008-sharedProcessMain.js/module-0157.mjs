// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSync.ts
import { Registry } from "./module-0051.mjs";
import { Extensions2, allSettings, getAllConfigurationProperties, parseScope } from "./module-0054.mjs";
import { distinct } from "./module-0004.mjs";
import { isObject, isString } from "./module-0006.mjs";
import { localize } from "./module-0007.mjs";
import { EXTENSION_IDENTIFIER_PATTERN } from "./module-0058.mjs";
import { Extensions } from "./module-0052.mjs";
import { createDecorator } from "./module-0042.mjs";


// src/vs/platform/userDataSync/common/userDataSync.ts
function getDisallowedIgnoredSettings() {
  const allSettings2 = Registry.as(Extensions2.Configuration).getConfigurationProperties();
  return Object.keys(allSettings2).filter((setting) => !!allSettings2[setting].disallowSyncIgnore);
}

function getDefaultIgnoredSettings(excludeExtensions = false) {
  const allSettings2 = Registry.as(Extensions2.Configuration).getConfigurationProperties();
  const ignoredSettings = getIgnoredSettings(allSettings2, excludeExtensions);
  const disallowedSettings = getDisallowedIgnoredSettings();
  return distinct([...ignoredSettings, ...disallowedSettings]);
}

function getIgnoredSettingsForExtension(manifest) {
  if (!manifest.contributes?.configuration) {
    return [];
  }
  const configurations = Array.isArray(manifest.contributes.configuration) ? manifest.contributes.configuration : [manifest.contributes.configuration];
  if (!configurations.length) {
    return [];
  }
  const properties = getAllConfigurationProperties(configurations);
  return getIgnoredSettings(properties, false);
}

function getIgnoredSettings(properties, excludeExtensions) {
  const ignoredSettings = /* @__PURE__ */ new Set();
  for (const key in properties) {
    if (excludeExtensions && !!properties[key].source) {
      continue;
    }
    const scope = isString(properties[key].scope) ? parseScope(properties[key].scope) : properties[key].scope;
    if (properties[key].ignoreSync || scope === 2 /* MACHINE */ || scope === 7 /* MACHINE_OVERRIDABLE */) {
      ignoredSettings.add(key);
    }
  }
  return [...ignoredSettings.values()];
}

var USER_DATA_SYNC_CONFIGURATION_SCOPE = "settingsSync";

var CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM = "settingsSync.keybindingsPerPlatform";

function registerConfiguration() {
  const ignoredSettingsSchemaId = "vscode://schemas/ignoredSettings";
  const configurationRegistry3 = Registry.as(Extensions2.Configuration);
  configurationRegistry3.registerConfiguration({
    id: "settingsSync",
    order: 30,
    title: localize(3689, null),
    type: "object",
    properties: {
      [CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM]: {
        type: "boolean",
        description: localize(3692, null),
        default: true,
        scope: 1 /* APPLICATION */,
        tags: ["sync", "usesOnlineServices"]
      },
      "settingsSync.ignoredExtensions": {
        "type": "array",
        markdownDescription: localize(3690, null),
        items: [{
          type: "string",
          pattern: EXTENSION_IDENTIFIER_PATTERN,
          errorMessage: localize(3688, null)
        }],
        "default": [],
        "scope": 1 /* APPLICATION */,
        uniqueItems: true,
        disallowSyncIgnore: true,
        tags: ["sync", "usesOnlineServices"]
      },
      "settingsSync.ignoredSettings": {
        "type": "array",
        description: localize(3691, null),
        "default": [],
        "scope": 1 /* APPLICATION */,
        $ref: ignoredSettingsSchemaId,
        additionalProperties: true,
        uniqueItems: true,
        disallowSyncIgnore: true,
        tags: ["sync", "usesOnlineServices"]
      }
    }
  });
  const jsonRegistry = Registry.as(Extensions.JSONContribution);
  const registerIgnoredSettingsSchema = () => {
    const disallowedIgnoredSettings = getDisallowedIgnoredSettings();
    const defaultIgnoredSettings = getDefaultIgnoredSettings();
    const settings = Object.keys(allSettings.properties).filter((setting) => !defaultIgnoredSettings.includes(setting));
    const ignoredSettings = defaultIgnoredSettings.filter((setting) => !disallowedIgnoredSettings.includes(setting));
    const ignoredSettingsSchema = {
      items: {
        type: "string",
        enum: [...settings, ...ignoredSettings.map((setting) => `-${setting}`)]
      }
    };
    jsonRegistry.registerSchema(ignoredSettingsSchemaId, ignoredSettingsSchema);
  };
  return configurationRegistry3.onDidUpdateConfiguration(() => registerIgnoredSettingsSchema());
}

var NON_EXISTING_RESOURCE_REF = "0";

var ALL_SYNC_RESOURCES = ["settings" /* Settings */, "keybindings" /* Keybindings */, "snippets" /* Snippets */, "prompts" /* Prompts */, "tasks" /* Tasks */, "extensions" /* Extensions */, "globalState" /* GlobalState */, "profiles" /* Profiles */, "mcp" /* Mcp */];

function getPathSegments(collection, ...paths) {
  return collection ? [collection, ...paths] : paths;
}

function getLastSyncResourceUri(collection, syncResource, environmentService, extUri2) {
  return extUri2.joinPath(environmentService.userDataSyncHome, ...getPathSegments(collection, syncResource, `lastSync${syncResource}.json`));
}

function isUserDataManifest(thing) {
  return thing && isString(thing.session) && isString(thing.ref) && (isObject(thing.latest) || thing.latest === void 0) && (isObject(thing.collections) || thing.collections === void 0);
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

var UserDataAutoSyncError = class extends UserDataSyncError {
  constructor(message, code) {
    super(message, code);
  }
};

((UserDataSyncError2) => {
  function toUserDataSyncError(error) {
    if (error instanceof UserDataSyncError2) {
      return error;
    }
    const match = /^(.+) \(UserDataSyncError\) syncResource:(.+) operationId:(.+)$/.exec(error.name);
    if (match && match[1]) {
      const syncResource = match[2] === "unknown" ? void 0 : match[2];
      const operationId = match[3] === "unknown" ? void 0 : match[3];
      return new UserDataSyncError2(error.message, match[1], syncResource, operationId);
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
export { getDisallowedIgnoredSettings, getDefaultIgnoredSettings, getIgnoredSettingsForExtension, getIgnoredSettings, registerConfiguration, getPathSegments, getLastSyncResourceUri, isUserDataManifest, createSyncHeaders, getEnablementKey, USER_DATA_SYNC_CONFIGURATION_SCOPE, CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM, NON_EXISTING_RESOURCE_REF, ALL_SYNC_RESOURCES, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, IUserDataSyncLocalStoreService, HEADER_OPERATION_ID, HEADER_EXECUTION_ID, UserDataSyncError, UserDataSyncStoreError, UserDataAutoSyncError, SYNC_SERVICE_URL_TYPE, IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncResourceProviderService, IUserDataAutoSyncService, IUserDataSyncUtilService, IUserDataSyncLogService, USER_DATA_SYNC_LOG_ID, USER_DATA_SYNC_SCHEME, PREVIEW_DIR_NAME };
