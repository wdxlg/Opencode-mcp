// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatModelConfigurationLogic.ts



// src/vs/workbench/contrib/chat/browser/widget/input/chatModelConfigurationLogic.ts
function extractSchemaDefaults(schema10) {
  const defaults = {};
  if (schema10?.properties) {
    for (const [key3, propSchema] of Object.entries(schema10.properties)) {
      if (propSchema.default !== void 0) {
        defaults[key3] = propSchema.default;
      }
    }
  }
  return defaults;
}

function filterConfigurationToSchema(values, schema10) {
  const properties = schema10?.properties;
  if (!properties) {
    return {};
  }
  const result = {};
  for (const [key3, value2] of Object.entries(values)) {
    const propSchema = Object.hasOwn(properties, key3) ? properties[key3] : void 0;
    if (!propSchema) {
      continue;
    }
    if (satisfiesPropertySchema(value2, propSchema)) {
      result[key3] = value2;
    }
  }
  return result;
}

function satisfiesPropertySchema(value2, schema10) {
  if (schema10.anyOf || schema10.oneOf || schema10.allOf || schema10.not || schema10.$ref) {
    return false;
  }
  if (schema10.const !== void 0 && value2 !== schema10.const) {
    return false;
  }
  if (Array.isArray(schema10.enum) && !schema10.enum.includes(value2)) {
    return false;
  }
  if (schema10.type !== void 0) {
    const types = Array.isArray(schema10.type) ? schema10.type : [schema10.type];
    if (!types.some((type) => matchesJSONSchemaType(value2, type))) {
      return false;
    }
  }
  if (typeof value2 === "number") {
    const exclusiveMinimum = typeof schema10.exclusiveMinimum === "number" ? schema10.exclusiveMinimum : void 0;
    const exclusiveMaximum = typeof schema10.exclusiveMaximum === "number" ? schema10.exclusiveMaximum : void 0;
    if (schema10.minimum !== void 0 && value2 < schema10.minimum || schema10.maximum !== void 0 && value2 > schema10.maximum || exclusiveMinimum !== void 0 && value2 <= exclusiveMinimum || exclusiveMaximum !== void 0 && value2 >= exclusiveMaximum) {
      return false;
    }
  }
  if (typeof value2 === "string") {
    if (schema10.minLength !== void 0 && value2.length < schema10.minLength || schema10.maxLength !== void 0 && value2.length > schema10.maxLength) {
      return false;
    }
    if (schema10.pattern !== void 0) {
      try {
        if (!new RegExp(schema10.pattern).test(value2)) {
          return false;
        }
      } catch {
        return false;
      }
    }
  }
  return true;
}

function matchesJSONSchemaType(value2, type) {
  switch (type) {
    case "string":
      return typeof value2 === "string";
    case "number":
      return typeof value2 === "number" && Number.isFinite(value2);
    case "integer":
      return typeof value2 === "number" && Number.isInteger(value2);
    case "boolean":
      return typeof value2 === "boolean";
    case "null":
      return value2 === null;
    case "array":
      return Array.isArray(value2);
    case "object":
      return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
    default:
      return false;
  }
}

function resolveModelConfiguration(storedEntry, schemaDefaults, globalConfig) {
  if (storedEntry) {
    return { ...schemaDefaults, ...storedEntry };
  }
  return globalConfig ? { ...schemaDefaults, ...globalConfig } : { ...schemaDefaults };
}

function computeStoredConfiguration(current, values, schemaDefaults) {
  const merged = { ...current, ...values };
  const stripped = {};
  for (const [key3, value2] of Object.entries(merged)) {
    if (schemaDefaults[key3] !== value2) {
      stripped[key3] = value2;
    }
  }
  return stripped;
}
export { extractSchemaDefaults, filterConfigurationToSchema, satisfiesPropertySchema, matchesJSONSchemaType, resolveModelConfiguration, computeStoredConfiguration };
