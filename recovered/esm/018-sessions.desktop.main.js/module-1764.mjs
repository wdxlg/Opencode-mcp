// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/common/agentHostSessionsProvider.ts
import { equals4 } from "./module-0098.mjs";


// src/vs/sessions/common/agentHostSessionsProvider.ts
var LOCAL_AGENT_HOST_PROVIDER_ID = "local-agent-host";

var REMOTE_AGENT_HOST_PROVIDER_PREFIX = "agenthost-";

var REMOTE_AGENT_HOST_PROVIDER_RE = /^agenthost-/;

var ANY_AGENT_HOST_PROVIDER_RE = /^(local-agent-host|agenthost-)/;

function isAgentHostProvider(provider) {
  return isAgentHostProviderId(provider.id);
}

function isAgentHostProviderId(providerId) {
  return providerId === LOCAL_AGENT_HOST_PROVIDER_ID || providerId.startsWith(REMOTE_AGENT_HOST_PROVIDER_PREFIX);
}

function resolvedConfigsEqual(a, b) {
  const aValueKeys = Object.keys(a.values);
  const bValueKeys = Object.keys(b.values);
  if (aValueKeys.length !== bValueKeys.length) {
    return false;
  }
  for (const key3 of aValueKeys) {
    if (!equals4(a.values[key3], b.values[key3])) {
      return false;
    }
  }
  const aPropKeys = Object.keys(a.schema.properties);
  const bPropKeys = Object.keys(b.schema.properties);
  if (aPropKeys.length !== bPropKeys.length) {
    return false;
  }
  for (const key3 of aPropKeys) {
    if (a.schema.properties[key3] !== b.schema.properties[key3]) {
      return false;
    }
  }
  return true;
}

var AUTO_APPROVE_ENUM = ["default", "autoApprove", "autopilot"];

function buildMutableConfigSchemaItem(key3, value2) {
  if (typeof value2 === "string") {
    return {
      type: "string",
      title: key3,
      sessionMutable: true,
      enum: key3 === "autoApprove" ? AUTO_APPROVE_ENUM : [value2]
    };
  }
  if (typeof value2 === "number") {
    return { type: "number", title: key3, sessionMutable: true };
  }
  if (typeof value2 === "boolean") {
    return { type: "boolean", title: key3, sessionMutable: true };
  }
  if (Array.isArray(value2)) {
    return { type: "array", title: key3, sessionMutable: true };
  }
  if (value2 && typeof value2 === "object") {
    return { type: "object", title: key3, sessionMutable: true };
  }
  return void 0;
}

function buildMutableConfigSchema(config) {
  const properties = {};
  for (const key3 of Object.keys(config)) {
    const property = buildMutableConfigSchemaItem(key3, config[key3]);
    if (property) {
      properties[key3] = property;
    }
  }
  return properties;
}
export { isAgentHostProvider, isAgentHostProviderId, resolvedConfigsEqual, buildMutableConfigSchemaItem, buildMutableConfigSchema, LOCAL_AGENT_HOST_PROVIDER_ID, REMOTE_AGENT_HOST_PROVIDER_PREFIX, REMOTE_AGENT_HOST_PROVIDER_RE, ANY_AGENT_HOST_PROVIDER_RE, AUTO_APPROVE_ENUM };
