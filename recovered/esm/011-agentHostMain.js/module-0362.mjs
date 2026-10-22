// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeElicitation.ts
import { vArray, vNumber, vObj, vOptionalProp, vString, vUnknown } from "./module-0332.mjs";
import { isObject, isString } from "./module-0008.mjs";
import { withChatInputRequestPurpose } from "./module-0182.mjs";


// src/vs/platform/agentHost/node/claude/claudeElicitation.ts
var vTitledOption = vObj({ const: vString(), title: vOptionalProp(vString()) });

var vElicitationField = vObj({
  type: vOptionalProp(vString()),
  title: vOptionalProp(vString()),
  description: vOptionalProp(vString()),
  format: vOptionalProp(vString()),
  default: vOptionalProp(vUnknown()),
  minimum: vOptionalProp(vNumber()),
  maximum: vOptionalProp(vNumber()),
  minLength: vOptionalProp(vNumber()),
  maxLength: vOptionalProp(vNumber()),
  minItems: vOptionalProp(vNumber()),
  maxItems: vOptionalProp(vNumber()),
  enum: vOptionalProp(vArray(vString())),
  enumNames: vOptionalProp(vArray(vString())),
  oneOf: vOptionalProp(vArray(vTitledOption)),
  items: vOptionalProp(vObj({
    enum: vOptionalProp(vArray(vString())),
    anyOf: vOptionalProp(vArray(vTitledOption))
  }))
});

function parseElicitationSchema(schema) {
  if (!isObject(schema)) {
    return void 0;
  }
  const properties = schema.properties;
  if (!isObject(properties)) {
    return void 0;
  }
  const rawRequired = schema.required;
  const required = new Set(Array.isArray(rawRequired) ? rawRequired.filter(isString) : []);
  const fields = [];
  for (const [name, field] of Object.entries(properties)) {
    const { content, error } = vElicitationField.validate(field);
    if (!error) {
      fields.push([name, content]);
    }
  }
  return { fields, required };
}

function buildElicitationRequest(requestId, request) {
  if (request.mode === "url") {
    const result = { id: requestId, message: request.message };
    if (request.url) {
      result.url = request.url;
    }
    return withChatInputRequestPurpose(result, "elicitation" /* Elicitation */);
  }
  const schema = parseElicitationSchema(request.requestedSchema);
  if (!schema || schema.fields.length === 0) {
    return withChatInputRequestPurpose({ id: requestId, message: request.message }, "elicitation" /* Elicitation */);
  }
  const questions = schema.fields.map(([name, field]) => elicitationFieldToQuestion2(name, field, schema.required.has(name)));
  return withChatInputRequestPurpose({ id: requestId, message: request.message, questions }, "elicitation" /* Elicitation */);
}

function elicitationResultFromAnswers(request, response, answers) {
  if (response === "decline" /* Decline */) {
    return { action: "decline" };
  }
  if (response !== "accept" /* Accept */) {
    return { action: "cancel" };
  }
  const schema = request.mode === "url" ? void 0 : parseElicitationSchema(request.requestedSchema);
  if (!schema) {
    return { action: "accept" };
  }
  const entries = [];
  for (const [name, field] of schema.fields) {
    const answer = answers && Object.hasOwn(answers, name) ? answers[name] : void 0;
    const value = elicitationAnswerToValue(field, answer);
    if (value !== void 0) {
      entries.push([name, value]);
    }
  }
  return { action: "accept", content: Object.fromEntries(entries) };
}

function cancelledElicitationResult() {
  return { action: "cancel" };
}

function elicitationFieldToQuestion2(id2, field, required) {
  const base = { id: id2, title: field.title ?? id2, message: field.description ?? field.title ?? id2, required };
  switch (field.type) {
    case "boolean":
      return { ...base, kind: "boolean" /* Boolean */, defaultValue: typeof field.default === "boolean" ? field.default : void 0 };
    case "number":
    case "integer":
      return {
        ...base,
        kind: field.type === "integer" ? "integer" /* Integer */ : "number" /* Number */,
        min: field.minimum,
        max: field.maximum,
        defaultValue: typeof field.default === "number" ? field.default : void 0
      };
    case "array":
      return {
        ...base,
        kind: "multi-select" /* MultiSelect */,
        // MCP enum arrays are strict — only the declared options are valid —
        // but the workbench defaults an omitted `allowFreeformInput` to true.
        allowFreeformInput: false,
        options: field.items?.anyOf ? field.items.anyOf.map((o) => ({ id: o.const, label: o.title || o.const })) : (field.items?.enum ?? []).map((v) => ({ id: v, label: v })),
        min: field.minItems,
        max: field.maxItems
      };
    case "string":
    default:
      if (field.oneOf) {
        return {
          ...base,
          kind: "single-select" /* SingleSelect */,
          allowFreeformInput: false,
          options: field.oneOf.map((o) => ({ id: o.const, label: o.title || o.const }))
        };
      }
      if (field.enum) {
        const names = field.enumNames;
        return {
          ...base,
          kind: "single-select" /* SingleSelect */,
          allowFreeformInput: false,
          options: field.enum.map((v, i) => ({ id: v, label: names?.[i] || v }))
        };
      }
      return {
        ...base,
        kind: "text" /* Text */,
        format: field.format,
        min: field.minLength,
        max: field.maxLength,
        defaultValue: typeof field.default === "string" ? field.default : void 0
      };
  }
}

function elicitationAnswerToValue(field, answer) {
  if (!answer || answer.state === "skipped" /* Skipped */) {
    return void 0;
  }
  const { value } = answer;
  switch (field.type) {
    case "boolean":
      if (value.kind === "boolean" /* Boolean */) {
        return value.value;
      }
      if (value.kind === "text" /* Text */) {
        if (value.value === "true") {
          return true;
        }
        if (value.value === "false") {
          return false;
        }
      }
      return void 0;
    case "number":
    case "integer": {
      const n = value.kind === "number" /* Number */ ? value.value : value.kind === "text" /* Text */ && value.value.trim() !== "" ? Number(value.value) : void 0;
      if (n === void 0 || !Number.isFinite(n)) {
        return void 0;
      }
      return field.type === "integer" ? Math.trunc(n) : n;
    }
    case "array":
      if (value.kind === "selected-many" /* SelectedMany */) {
        return [...value.value, ...value.freeformValues ?? []];
      }
      if (value.kind === "selected" /* Selected */) {
        return value.value ? [value.value, ...value.freeformValues ?? []] : [...value.freeformValues ?? []];
      }
      if (value.kind === "text" /* Text */) {
        return value.value ? [value.value] : [];
      }
      return void 0;
    case "string":
    default:
      if (value.kind === "text" /* Text */) {
        return value.value;
      }
      if (value.kind === "selected" /* Selected */) {
        return value.value;
      }
      return void 0;
  }
}
export { parseElicitationSchema, buildElicitationRequest, elicitationResultFromAnswers, cancelledElicitationResult, elicitationFieldToQuestion2, elicitationAnswerToValue, vTitledOption, vElicitationField };
