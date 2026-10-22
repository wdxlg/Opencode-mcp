// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostConfigurationSync.ts
import { Registry } from "./module-0142.mjs";
import { Extensions2 } from "./module-0145.mjs";


// src/vs/platform/agentHost/common/agentHostConfigurationSync.ts
function getRegistry() {
  return Registry.as(Extensions2.Configuration);
}

function getPropertySchema(settingId) {
  const registry = getRegistry();
  return registry.getConfigurationProperties()[settingId] ?? registry.getExcludedConfigurationProperties()[settingId];
}

function matchesSchemaType(value, type) {
  if (type === void 0) {
    return true;
  }
  if (Array.isArray(type)) {
    return type.some((candidate) => matchesSchemaType(value, candidate));
  }
  switch (type) {
    case "boolean":
      return typeof value === "boolean";
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "integer":
      return typeof value === "number" && Number.isInteger(value);
    case "array":
      return Array.isArray(value);
    case "object":
      return typeof value === "object" && value !== null && !Array.isArray(value);
    case "null":
      return value === null;
    default:
      return true;
  }
}

function getGlobalConfigurationValue(configurationService, settingId) {
  const inspected = configurationService.inspect(settingId);
  const property = getPropertySchema(settingId);
  for (const value of [inspected.policyValue, inspected.userValue, inspected.applicationValue]) {
    if (value !== void 0 && matchesSchemaType(value, property?.type)) {
      return value;
    }
  }
  return inspected.defaultValue ?? property?.default;
}

function inspectValue(configurationService, settingId) {
  const inspected = configurationService.inspect(settingId);
  const property = getPropertySchema(settingId);
  const values = [
    ["policyValue", inspected.policyValue],
    ["userValue", inspected.userValue],
    ["applicationValue", inspected.applicationValue]
  ];
  for (const [source, value] of values) {
    if (value !== void 0 && matchesSchemaType(value, property?.type)) {
      return [value, source];
    }
  }
  return void 0;
}
export { getRegistry, getPropertySchema, matchesSchemaType, getGlobalConfigurationValue, inspectValue };
