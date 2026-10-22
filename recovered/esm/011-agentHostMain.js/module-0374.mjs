// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexElicitationMapper.ts
import { withChatInputRequestPurpose } from "./module-0182.mjs";
import { hasKey } from "./module-0008.mjs";


// src/vs/platform/agentHost/node/codex/codexElicitationMapper.ts
function buildElicitationRequest2(requestId, params) {
  if (params.mode === "url") {
    const request = { id: requestId, message: params.message };
    if (params.url) {
      request.url = params.url;
    }
    return withChatInputRequestPurpose(request, "elicitation" /* Elicitation */);
  }
  if (params.mode !== "form") {
    return withChatInputRequestPurpose({ id: requestId, message: params.message }, "elicitation" /* Elicitation */);
  }
  const required = new Set(params.requestedSchema.required ?? []);
  const questions = [];
  for (const [name, field] of Object.entries(params.requestedSchema.properties)) {
    if (field) {
      questions.push(elicitationFieldToQuestion3(name, field, required.has(name)));
    }
  }
  return withChatInputRequestPurpose(
    questions.length > 0 ? { id: requestId, message: params.message, questions } : { id: requestId, message: params.message },
    "elicitation" /* Elicitation */
  );
}

function elicitationResponseFromAnswers(params, response, answers) {
  if (response === "decline" /* Decline */) {
    return { action: "decline", content: null, _meta: null };
  }
  if (response !== "accept" /* Accept */) {
    return { action: "cancel", content: null, _meta: null };
  }
  if (params.mode !== "form") {
    return { action: "accept", content: null, _meta: null };
  }
  const content = {};
  for (const [name, field] of Object.entries(params.requestedSchema.properties)) {
    if (!field) {
      continue;
    }
    const value = elicitationAnswerToValue2(answers?.[name]);
    if (value !== void 0) {
      content[name] = value;
    }
  }
  return { action: "accept", content, _meta: null };
}

function declinedElicitationResponse() {
  return { action: "decline", content: null, _meta: null };
}

function cancelledElicitationResponse() {
  return { action: "cancel", content: null, _meta: null };
}

function elicitationFieldToQuestion3(id2, field, required) {
  const base = { id: id2, title: field.title, message: field.description ?? field.title ?? id2, required };
  switch (field.type) {
    case "boolean":
      return { ...base, kind: "boolean" /* Boolean */, defaultValue: field.default };
    case "number":
    case "integer":
      return {
        ...base,
        kind: field.type === "integer" ? "integer" /* Integer */ : "number" /* Number */,
        min: field.minimum,
        max: field.maximum,
        defaultValue: field.default
      };
    case "array":
      return {
        ...base,
        kind: "multi-select" /* MultiSelect */,
        options: hasKey(field.items, { anyOf: true }) ? field.items.anyOf.map((o) => ({ id: o.const, label: o.title || o.const })) : field.items.enum.map((v) => ({ id: v, label: v })),
        min: bigintToNumber(field.minItems),
        max: bigintToNumber(field.maxItems)
      };
    case "string":
      if (hasKey(field, { oneOf: true })) {
        return {
          ...base,
          kind: "single-select" /* SingleSelect */,
          options: field.oneOf.map((o) => ({ id: o.const, label: o.title || o.const }))
        };
      }
      if (hasKey(field, { enum: true })) {
        const names = field.enumNames;
        return {
          ...base,
          kind: "single-select" /* SingleSelect */,
          options: field.enum.map((v, i) => ({ id: v, label: names?.[i] || v }))
        };
      }
      return {
        ...base,
        kind: "text" /* Text */,
        format: field.format,
        min: field.minLength,
        max: field.maxLength,
        defaultValue: field.default
      };
  }
}

function elicitationAnswerToValue2(answer) {
  if (!answer || answer.state === "skipped" /* Skipped */) {
    return void 0;
  }
  const { value } = answer;
  switch (value.kind) {
    case "text" /* Text */:
      return value.value;
    case "number" /* Number */:
      return value.value;
    case "boolean" /* Boolean */:
      return value.value;
    case "selected" /* Selected */:
      return value.value;
    case "selected-many" /* SelectedMany */:
      return value.value;
  }
}

function bigintToNumber(value) {
  return value === null || value === void 0 ? void 0 : Number(value);
}
export { buildElicitationRequest2, elicitationResponseFromAnswers, declinedElicitationResponse, cancelledElicitationResponse, elicitationFieldToQuestion3, elicitationAnswerToValue2, bigintToNumber };
