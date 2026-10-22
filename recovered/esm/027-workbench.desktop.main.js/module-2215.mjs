// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/feedbackSurvey/chatModelFeedbackSurveyConfig.ts
import { ID_PATTERN, MAX_ID_LENGTH, expandModelMatchCandidates, isObject4, normalizeSelector, parseExpPayloadEnvelope, readSelectorList, readText } from "./module-2214.mjs";


// src/vs/workbench/contrib/chat/common/feedbackSurvey/chatModelFeedbackSurveyConfig.ts
var CHAT_MODEL_FEEDBACK_SURVEY_CONFIG_VERSION = 1;

var CHAT_MODEL_FEEDBACK_SURVEY_NO_HARNESS = "none";

var MAX_STEPS = 8;

var MIN_OPTIONS = 2;

var MAX_OPTIONS = 8;

var MAX_TITLE_LENGTH2 = 200;

var MAX_LABEL_LENGTH = 120;

var MAX_PLACEHOLDER_LENGTH = 100;

var MAX_COMMENT_LENGTH = 1e3;

var MATCH_FIELDS = ["selectedModels", "resolvedModels", "modes", "harnesses", "sessionTypes"];

function parseChatModelFeedbackSurveyConfig(raw) {
  const parsed = parseExpPayloadEnvelope(raw, CHAT_MODEL_FEEDBACK_SURVEY_CONFIG_VERSION);
  if (typeof parsed === "string") {
    return { error: parsed };
  }
  const id2 = readText(parsed.id, MAX_ID_LENGTH, ID_PATTERN);
  if (!id2) {
    return { error: "missing or malformed survey id" };
  }
  const match2 = readMatch(parsed.match);
  if (typeof match2 === "string") {
    return { error: match2 };
  }
  const prompt = readPrompt(parsed.prompt);
  if (typeof prompt === "string") {
    return { error: prompt };
  }
  const steps = readSteps(parsed.steps);
  if (typeof steps === "string") {
    return { error: steps };
  }
  return { config: { version: CHAT_MODEL_FEEDBACK_SURVEY_CONFIG_VERSION, id: id2, match: match2, prompt, steps } };
}

function readMatch(raw) {
  if (raw !== void 0 && !isObject4(raw)) {
    return "match must be an object";
  }
  const source = isObject4(raw) ? raw : {};
  const match2 = {};
  for (const field of MATCH_FIELDS) {
    const selectors = readSelectorList(source[field], `match.${field}`);
    if (typeof selectors === "string") {
      return selectors;
    }
    match2[field] = selectors;
  }
  if (MATCH_FIELDS.every((field) => match2[field].length === 0)) {
    return "match must narrow at least one dimension";
  }
  return {
    selectedModels: match2.selectedModels,
    resolvedModels: match2.resolvedModels,
    modes: match2.modes,
    harnesses: match2.harnesses,
    sessionTypes: match2.sessionTypes
  };
}

function readPrompt(raw) {
  if (raw !== void 0 && !isObject4(raw)) {
    return "prompt must be an object";
  }
  const source = isObject4(raw) ? raw : {};
  const cooldownDays = readNonNegativeNumber(source.cooldownDays, 7);
  if (cooldownDays === void 0) {
    return "prompt.cooldownDays must be a non-negative number";
  }
  const maxPerSession = readPositiveInteger(source.maxPerSession, 1);
  if (maxPerSession === void 0) {
    return "prompt.maxPerSession must be a positive integer";
  }
  const chance = readChance(source.chance);
  if (typeof chance === "string") {
    return chance;
  }
  const triggers = readTriggers(source.triggers);
  if (typeof triggers === "string") {
    return triggers;
  }
  return { cooldownDays, maxPerSession, chance, triggers };
}

function readChance(raw) {
  if (raw !== void 0 && !isObject4(raw)) {
    return "prompt.chance must be an object";
  }
  const source = isObject4(raw) ? raw : {};
  const initial = readProbability(source.initial, 0);
  if (initial === void 0) {
    return "prompt.chance.initial must be a probability between 0 and 1";
  }
  const increment = readProbability(source.increment, 0);
  if (increment === void 0) {
    return "prompt.chance.increment must be a probability between 0 and 1";
  }
  const max = readProbability(source.max, 1);
  if (max === void 0) {
    return "prompt.chance.max must be a probability between 0 and 1";
  }
  if (max < initial) {
    return "prompt.chance.max must be greater than or equal to prompt.chance.initial";
  }
  return { initial, increment, max };
}

function readTriggers(raw) {
  if (raw !== void 0 && !isObject4(raw)) {
    return "prompt.triggers must be an object";
  }
  const source = isObject4(raw) ? raw : {};
  const modelSwitchedAway = readTrigger(source.modelSwitchedAway, "prompt.triggers.modelSwitchedAway");
  if (typeof modelSwitchedAway === "string") {
    return modelSwitchedAway;
  }
  return { modelSwitchedAway };
}

function readTrigger(raw, path) {
  if (raw === void 0) {
    return { enabled: false, bypassCooldown: false };
  }
  if (typeof raw === "boolean") {
    return { enabled: raw, bypassCooldown: false };
  }
  if (!isObject4(raw)) {
    return `${path} must be a boolean or an object`;
  }
  if (raw.enabled !== void 0 && typeof raw.enabled !== "boolean") {
    return `${path}.enabled must be a boolean`;
  }
  if (raw.bypassCooldown !== void 0 && typeof raw.bypassCooldown !== "boolean") {
    return `${path}.bypassCooldown must be a boolean`;
  }
  return { enabled: raw.enabled ?? true, bypassCooldown: raw.bypassCooldown ?? false };
}

function readSteps(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return "steps must be a non-empty array";
  }
  if (raw.length > MAX_STEPS) {
    return `steps exceeds ${MAX_STEPS} entries`;
  }
  const steps = [];
  const seenIds = /* @__PURE__ */ new Set();
  for (let i2 = 0; i2 < raw.length; i2++) {
    const step = readStep(raw[i2], i2);
    if (typeof step === "string") {
      return step;
    }
    if (seenIds.has(step.id)) {
      return `steps[${i2}].id "${step.id}" is duplicated`;
    }
    seenIds.add(step.id);
    steps.push(step);
  }
  const textStepIndexes = steps.map((step, index2) => step.kind === "text" /* Text */ ? index2 : -1).filter((index2) => index2 >= 0);
  if (textStepIndexes.length > 1) {
    return "steps may contain at most one text step";
  }
  if (textStepIndexes.length === 1 && textStepIndexes[0] !== steps.length - 1) {
    return "a text step must be the last step";
  }
  return steps;
}

function readStep(raw, index2) {
  if (!isObject4(raw)) {
    return `steps[${index2}] must be an object`;
  }
  const id2 = readText(raw.id, MAX_ID_LENGTH, ID_PATTERN);
  if (!id2) {
    return `steps[${index2}].id is missing or malformed`;
  }
  const title = readText(raw.title, MAX_TITLE_LENGTH2);
  if (!title) {
    return `steps[${index2}].title is missing or too long`;
  }
  if (raw.kind === "text" /* Text */) {
    const placeholder = raw.placeholder === void 0 ? void 0 : readText(raw.placeholder, MAX_PLACEHOLDER_LENGTH);
    if (raw.placeholder !== void 0 && !placeholder) {
      return `steps[${index2}].placeholder is empty or too long`;
    }
    const requestedMaxLength = readPositiveInteger(raw.maxLength, MAX_COMMENT_LENGTH);
    if (requestedMaxLength === void 0) {
      return `steps[${index2}].maxLength must be a positive integer`;
    }
    return {
      kind: "text" /* Text */,
      id: id2,
      title,
      placeholder,
      maxLength: Math.min(requestedMaxLength, MAX_COMMENT_LENGTH)
    };
  }
  if (raw.kind !== "choice" /* Choice */) {
    return `steps[${index2}].kind must be "${"choice" /* Choice */}" or "${"text" /* Text */}"`;
  }
  if (!Array.isArray(raw.options) || raw.options.length < MIN_OPTIONS || raw.options.length > MAX_OPTIONS) {
    return `steps[${index2}].options must have between ${MIN_OPTIONS} and ${MAX_OPTIONS} entries`;
  }
  const options3 = [];
  const seenOptionIds = /* @__PURE__ */ new Set();
  for (let i2 = 0; i2 < raw.options.length; i2++) {
    const option2 = raw.options[i2];
    if (!isObject4(option2)) {
      return `steps[${index2}].options[${i2}] must be an object`;
    }
    const optionId = readText(option2.id, MAX_ID_LENGTH, ID_PATTERN);
    if (!optionId) {
      return `steps[${index2}].options[${i2}].id is missing or malformed`;
    }
    if (seenOptionIds.has(optionId)) {
      return `steps[${index2}].options[${i2}].id "${optionId}" is duplicated`;
    }
    const label3 = readText(option2.label, MAX_LABEL_LENGTH);
    if (!label3) {
      return `steps[${index2}].options[${i2}].label is missing or too long`;
    }
    seenOptionIds.add(optionId);
    options3.push({ id: optionId, label: label3 });
  }
  return { kind: "choice" /* Choice */, id: id2, title, options: options3 };
}

function readPositiveInteger(raw, fallback2) {
  if (raw === void 0) {
    return fallback2;
  }
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw <= 0) {
    return void 0;
  }
  return raw;
}

function readNonNegativeNumber(raw, fallback2) {
  if (raw === void 0) {
    return fallback2;
  }
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) {
    return void 0;
  }
  return raw;
}

function readProbability(raw, fallback2) {
  if (raw === void 0) {
    return fallback2;
  }
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0 || raw > 1) {
    return void 0;
  }
  return raw;
}

function matchesChatModelFeedbackSurvey(config, context2) {
  const { match: match2 } = config;
  if (match2.selectedModels.length) {
    const candidates = expandModelMatchCandidates(context2.selectedModelId, context2.selectedModelAliases);
    if (!match2.selectedModels.some((selector) => candidates.has(selector))) {
      return false;
    }
  }
  if (match2.resolvedModels.length) {
    const candidates = expandModelMatchCandidates(context2.resolvedModelId);
    if (!match2.resolvedModels.some((selector) => candidates.has(selector))) {
      return false;
    }
  }
  if (match2.modes.length && !matchesScalar(match2.modes, context2.modeId)) {
    return false;
  }
  if (match2.harnesses.length && !matchesScalar(match2.harnesses, context2.harness ?? CHAT_MODEL_FEEDBACK_SURVEY_NO_HARNESS)) {
    return false;
  }
  if (match2.sessionTypes.length && !matchesScalar(match2.sessionTypes, context2.sessionType)) {
    return false;
  }
  return true;
}

function matchesScalar(selectors, value2) {
  const normalized = value2 === void 0 ? void 0 : normalizeSelector(value2);
  return !!normalized && selectors.includes(normalized);
}
export { parseChatModelFeedbackSurveyConfig, readMatch, readPrompt, readChance, readTriggers, readTrigger, readSteps, readStep, readPositiveInteger, readNonNegativeNumber, readProbability, matchesChatModelFeedbackSurvey, matchesScalar, CHAT_MODEL_FEEDBACK_SURVEY_CONFIG_VERSION, CHAT_MODEL_FEEDBACK_SURVEY_NO_HARNESS, MAX_STEPS, MIN_OPTIONS, MAX_OPTIONS, MAX_TITLE_LENGTH2, MAX_LABEL_LENGTH, MAX_PLACEHOLDER_LENGTH, MAX_COMMENT_LENGTH, MATCH_FIELDS };
