// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/expNotification/chatExpNotificationConfig.ts
import { ID_PATTERN, MAX_ID_LENGTH, expandModelMatchCandidates, isObject3, modelSelectorAliases, normalizeSelector, parseExpPayloadEnvelope, readSelectorList, readText } from "./module-2189.mjs";
import { stableStringify } from "./module-0098.mjs";


// src/vs/workbench/contrib/chat/browser/expNotification/chatExpNotificationConfig.ts
var CHAT_EXP_NOTIFICATION_VERSION = 1;

var MAX_NOTIFICATIONS = 8;

var MAX_ACTIONS2 = 3;

var MAX_CONFIG_KEYS = 8;

var MATCH_KEYS = ["sessionTypes", "selectedModels", "excludeSelectedModels"];

var MAX_TITLE_LENGTH4 = 120;

var MAX_DESCRIPTION_LENGTH = 500;

var MAX_LABEL_LENGTH2 = 40;

var SEVERITIES = /* @__PURE__ */ new Map([
  ["info", 0 /* Info */],
  ["warning", 1 /* Warning */],
  ["error", 2 /* Error */]
]);

function parseChatExpNotifications(raw) {
  const parsed = parseExpPayloadEnvelope(raw, CHAT_EXP_NOTIFICATION_VERSION);
  if (typeof parsed === "string") {
    return { error: parsed };
  }
  if (!Array.isArray(parsed.notifications)) {
    return { error: "notifications must be an array" };
  }
  if (parsed.notifications.length > MAX_NOTIFICATIONS) {
    return { error: `notifications exceeds ${MAX_NOTIFICATIONS} entries` };
  }
  const notifications = [];
  const seen = /* @__PURE__ */ new Set();
  for (let i2 = 0; i2 < parsed.notifications.length; i2++) {
    const notification = readNotification(parsed.notifications[i2], `notifications[${i2}]`);
    if (typeof notification === "string") {
      return { error: notification };
    }
    if (seen.has(notification.id)) {
      return { error: `notifications[${i2}].id "${notification.id}" is duplicated` };
    }
    seen.add(notification.id);
    notifications.push(notification);
  }
  return { notifications };
}

function readNotification(raw, path) {
  if (!isObject3(raw)) {
    return `${path} must be an object`;
  }
  const id2 = readText(raw.id, MAX_ID_LENGTH, ID_PATTERN);
  if (!id2) {
    return `${path}.id is missing or malformed`;
  }
  const message = readText(raw.title, MAX_TITLE_LENGTH4);
  if (!message) {
    return `${path}.title is missing or too long`;
  }
  const description = raw.description === void 0 ? void 0 : readText(raw.description, MAX_DESCRIPTION_LENGTH);
  if (raw.description !== void 0 && !description) {
    return `${path}.description is empty or too long`;
  }
  const severity = raw.severity === void 0 ? 0 /* Info */ : SEVERITIES.get(raw.severity);
  if (severity === void 0) {
    return `${path}.severity must be "info", "warning" or "error"`;
  }
  const match2 = readMatch2(raw.match, `${path}.match`);
  if (typeof match2 === "string") {
    return match2;
  }
  const actions = readActions(raw.actions, `${path}.actions`);
  if (typeof actions === "string") {
    return actions;
  }
  const dismissible = readBoolean(raw.dismissible, true);
  const autoDismissOnMessage = readBoolean(raw.autoDismissOnMessage, false);
  if (dismissible === void 0 || autoDismissOnMessage === void 0) {
    return `${path}.dismissible and ${path}.autoDismissOnMessage must be booleans`;
  }
  if (!dismissible && !autoDismissOnMessage && !actions.length) {
    return `${path} must be dismissible, auto-dismiss on message, or offer an action`;
  }
  return {
    id: id2,
    telemetryId: id2,
    severity,
    message,
    description,
    match: match2,
    actions,
    dismissible,
    autoDismissOnMessage,
    signature: stableStringify(raw)
  };
}

function readBoolean(raw, fallback2) {
  return raw === void 0 ? fallback2 : typeof raw === "boolean" ? raw : void 0;
}

function readMatch2(raw, path) {
  if (raw !== void 0 && !isObject3(raw)) {
    return `${path} must be an object`;
  }
  const source = isObject3(raw) ? raw : {};
  const unknown2 = Object.keys(source).find((key3) => !MATCH_KEYS.includes(key3));
  if (unknown2) {
    return `${path} has unknown key ${JSON.stringify(unknown2)}`;
  }
  const sessionTypes = readSelectorList(source.sessionTypes, `${path}.sessionTypes`);
  if (typeof sessionTypes === "string") {
    return sessionTypes;
  }
  const selectedModels = readSelectorList(source.selectedModels, `${path}.selectedModels`);
  if (typeof selectedModels === "string") {
    return selectedModels;
  }
  const excludeSelectedModels = readSelectorList(source.excludeSelectedModels, `${path}.excludeSelectedModels`);
  if (typeof excludeSelectedModels === "string") {
    return excludeSelectedModels;
  }
  if (!sessionTypes.length && !selectedModels.length && !excludeSelectedModels.length) {
    return `${path} must narrow at least one dimension`;
  }
  return { sessionTypes, selectedModels, excludeSelectedModels };
}

function readActions(raw, path) {
  if (raw === void 0) {
    return [];
  }
  if (!Array.isArray(raw)) {
    return `${path} must be an array`;
  }
  if (raw.length > MAX_ACTIONS2) {
    return `${path} exceeds ${MAX_ACTIONS2} entries`;
  }
  const actions = [];
  const seen = /* @__PURE__ */ new Set();
  for (let i2 = 0; i2 < raw.length; i2++) {
    const action = readAction(raw[i2], `${path}[${i2}]`);
    if (typeof action === "string") {
      return action;
    }
    if (seen.has(action.telemetryActionId)) {
      return `${path}[${i2}].id "${action.telemetryActionId}" is duplicated`;
    }
    seen.add(action.telemetryActionId);
    actions.push(action);
  }
  return actions;
}

function readAction(raw, path) {
  if (!isObject3(raw)) {
    return `${path} must be an object`;
  }
  const telemetryActionId = readText(raw.id, MAX_ID_LENGTH, ID_PATTERN);
  if (!telemetryActionId) {
    return `${path}.id is missing or malformed`;
  }
  const label3 = readText(raw.label, MAX_LABEL_LENGTH2);
  if (!label3) {
    return `${path}.label is missing or too long`;
  }
  const base = { label: label3, telemetryActionId };
  switch (raw.kind) {
    case "openModelPicker" /* OpenModelPicker */:
      return { ...base, kind: "openModelPicker" /* OpenModelPicker */ };
    case "command" /* Command */: {
      if (typeof raw.commandId !== "string" || !raw.commandId.trim()) {
        return `${path}.commandId is missing`;
      }
      if (raw.args !== void 0 && !Array.isArray(raw.args)) {
        return `${path}.args must be an array`;
      }
      return { ...base, kind: "command" /* Command */, commandId: raw.commandId.trim(), commandArgs: raw.args ?? [] };
    }
    case "switchToModel" /* SwitchToModel */: {
      if (typeof raw.model !== "string" || !raw.model.trim()) {
        return `${path}.model is missing`;
      }
      if (raw.config !== void 0 && (!isObject3(raw.config) || Object.keys(raw.config).length > MAX_CONFIG_KEYS)) {
        return `${path}.config must be an object of at most ${MAX_CONFIG_KEYS} keys`;
      }
      const target = normalizeSelector(raw.model);
      return {
        ...base,
        kind: "switchToModel" /* SwitchToModel */,
        matchesModel: (model) => expandModelMatchCandidates(model.identifier, modelSelectorAliases(model.metadata)).has(target),
        config: raw.config,
        requireUniqueModel: true
      };
    }
  }
  return `${path}.kind must be "${"command" /* Command */}", "${"openModelPicker" /* OpenModelPicker */}" or "${"switchToModel" /* SwitchToModel */}"`;
}

function matchesChatExpNotification(match2, context2) {
  const { sessionTypes, selectedModels, excludeSelectedModels } = match2;
  const sessionCandidates = [context2.sessionType, context2.harness].map((value2) => value2 && normalizeSelector(value2));
  const modelCandidates = expandModelMatchCandidates(context2.selectedModelId, context2.selectedModelAliases);
  return (!sessionTypes.length || sessionTypes.some((selector) => sessionCandidates.includes(selector))) && (!selectedModels.length || selectedModels.some((selector) => modelCandidates.has(selector))) && !excludeSelectedModels.some((selector) => modelCandidates.has(selector));
}
export { parseChatExpNotifications, readNotification, readBoolean, readMatch2, readActions, readAction, matchesChatExpNotification, CHAT_EXP_NOTIFICATION_VERSION, MAX_NOTIFICATIONS, MAX_ACTIONS2, MAX_CONFIG_KEYS, MATCH_KEYS, MAX_TITLE_LENGTH4, MAX_DESCRIPTION_LENGTH, MAX_LABEL_LENGTH2, SEVERITIES };
