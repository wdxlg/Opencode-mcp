// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/accounts/browser/managedSettings.ts
import { MANAGED_SETTINGS_UPDATE_REQUIRED_ERROR_CODE } from "./module-0741.mjs";
import { isString } from "./module-0010.mjs";
import { normalizeManagedSettings } from "./module-0955.mjs";


// src/vs/workbench/services/accounts/browser/managedSettings.ts
var MANAGED_SETTINGS_CLIENT_ID = "vscode";

function appendManagedSettingsClientIdentity(url, product2) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  parsed.searchParams.set("client_id", MANAGED_SETTINGS_CLIENT_ID);
  parsed.searchParams.set("client_version", product2.version);
  const runtimeVersion = product2.copilotVersions?.runtime;
  if (runtimeVersion) {
    parsed.searchParams.set("copilot_runtime_version", runtimeVersion);
  } else {
    parsed.searchParams.delete("copilot_runtime_version");
  }
  return parsed.toString();
}

function isManagedSettingsCompatibilityErrorResponse(response) {
  return typeof response === "object" && response !== null;
}

function parseManagedSettingsCompatibilityError(response) {
  if (!isManagedSettingsCompatibilityErrorResponse(response) || response.error_code !== MANAGED_SETTINGS_UPDATE_REQUIRED_ERROR_CODE) {
    return void 0;
  }
  const clientVersion = isString(response.client_version) ? response.client_version : void 0;
  const minimumClientVersion = isString(response.minimum_client_version) ? response.minimum_client_version : void 0;
  return {
    errorCode: MANAGED_SETTINGS_UPDATE_REQUIRED_ERROR_CODE,
    ...clientVersion ? { clientVersion } : {},
    ...minimumClientVersion ? { minimumClientVersion } : {}
  };
}

function adaptManagedSettings(response, onWarn) {
  return { managedSettings: normalizeManagedSettings(response, onWarn) };
}
export { appendManagedSettingsClientIdentity, isManagedSettingsCompatibilityErrorResponse, parseManagedSettingsCompatibilityError, adaptManagedSettings, MANAGED_SETTINGS_CLIENT_ID };
