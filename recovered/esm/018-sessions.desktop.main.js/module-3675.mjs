// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/cloudSandboxAgentHost.ts
import { RemoteAgentHostsEnabledSettingId } from "./module-1736.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/cloudSandboxAgentHost.ts
var CloudSandboxEnabledSettingId = "chat.agentHost.cloudSandbox.enabled";

function isCloudSandboxEnabled(configurationService) {
  return configurationService.getValue(CloudSandboxEnabledSettingId) === true && configurationService.getValue(RemoteAgentHostsEnabledSettingId) === true;
}

var CLOUD_SANDBOX_ADDRESS_PREFIX = "cloudsandbox:";

var CLOUD_SANDBOX_SESSION_SCHEME = "ahp-session";

var CLOUD_SANDBOX_AGENT_PROVIDER = "copilot";

var CLOUD_SANDBOX_SEALED_TOKEN_PREFIX = "copilot-sealed.v1.";

function isCloudSandboxSealedToken(token) {
  return typeof token === "string" && token.startsWith(CLOUD_SANDBOX_SEALED_TOKEN_PREFIX);
}

function cloudSandboxEnvironmentId(address) {
  return address.startsWith(CLOUD_SANDBOX_ADDRESS_PREFIX) ? address.slice(CLOUD_SANDBOX_ADDRESS_PREFIX.length) : void 0;
}

var CLOUD_SANDBOX_AGENT_SLUG = "copilot-developer-cli";

var CLOUD_SANDBOX_ON_DEMAND_ENVIRONMENT_ID = "github-sandbox";

function cloudSandboxAddress(environmentId) {
  return `${CLOUD_SANDBOX_ADDRESS_PREFIX}${environmentId}`;
}

function buildWpsUrl(token) {
  const base = token.wps_endpoint.replace(/^ws:\/\//i, "wss://").replace(/^http:\/\//i, "wss://").replace(/^https:\/\//i, "wss://");
  const withScheme = /^wss:\/\//i.test(base) ? base : `wss://${base}`;
  const separator2 = withScheme.includes("?") ? "&" : "?";
  return `${withScheme}${separator2}access_token=${encodeURIComponent(token.access_token)}&clientId=${encodeURIComponent(token.client_id)}`;
}

var ICloudSandboxApiService = createDecorator("cloudSandboxApiService");

var CloudSandboxAuthenticationRequiredError = class extends Error {
  constructor() {
    super("Connecting to a cloud sandbox requires a signed-in GitHub account.");
    this.name = "CloudSandboxAuthenticationRequiredError";
  }
};

var CloudSandboxRequestError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "CloudSandboxRequestError";
  }
};

function isRetryableCloudSandboxError(error) {
  if (!(error instanceof CloudSandboxRequestError) || error.statusCode === void 0) {
    return true;
  }
  const status2 = error.statusCode;
  return status2 === 408 || status2 === 429 || status2 < 400 || status2 >= 500;
}

var ICloudSandboxAgentHostService = createDecorator("cloudSandboxAgentHostService");
export { isCloudSandboxEnabled, isCloudSandboxSealedToken, cloudSandboxEnvironmentId, cloudSandboxAddress, buildWpsUrl, isRetryableCloudSandboxError, CloudSandboxEnabledSettingId, CLOUD_SANDBOX_ADDRESS_PREFIX, CLOUD_SANDBOX_SESSION_SCHEME, CLOUD_SANDBOX_AGENT_PROVIDER, CLOUD_SANDBOX_SEALED_TOKEN_PREFIX, CLOUD_SANDBOX_AGENT_SLUG, CLOUD_SANDBOX_ON_DEMAND_ENVIRONMENT_ID, ICloudSandboxApiService, CloudSandboxAuthenticationRequiredError, CloudSandboxRequestError, ICloudSandboxAgentHostService };
