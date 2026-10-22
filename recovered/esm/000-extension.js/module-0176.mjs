// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/model-reasoning.mts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/model-reasoning.mts
init_define_OPENCODE_BUILD_INFO();

var REASONING_EFFORTS = ["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"];

var THINKING_MODES = ["enabled", "disabled"];

var DEFAULT_REASONING_EFFORTS = REASONING_EFFORTS.filter((effort) => effort !== "ultra");

function codexReasoningEfforts(efforts) {
  return efforts.filter((effort) => effort !== "ultra");
}

function codexReasoningFallback(preferred, efforts) {
  if (preferred !== "ultra" && (preferred === void 0 || efforts.includes(preferred))) return preferred;
  return efforts.includes("medium") ? "medium" : efforts[0];
}

function genericReasoningPickerValues(reasoningEfforts) {
  return ["inherit", "enabled", "disabled", ...new Set(reasoningEfforts)];
}

function resolveGenericReasoningOverride(value, allowedReasoningEfforts, fallbackEffort) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (normalized === "enabled") {
    return { thinking: "enabled", reasoningEffort: fallbackEffort ?? "medium" };
  }
  if (normalized === "disabled") {
    return { thinking: "disabled" };
  }
  if (allowedReasoningEfforts.includes(normalized)) {
    return { thinking: "enabled", reasoningEffort: normalized };
  }
  return void 0;
}

function resolveMergeReasoningOverride(value, profile) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (normalized === "disabled") {
    if (profile.codex) return void 0;
    return { thinking: "disabled" };
  }
  if (profile.codex && normalized === "ultra") return void 0;
  if (profile.reasoningEfforts.includes(normalized)) {
    return profile.codex ? { reasoningEffort: normalized } : { thinking: "enabled", reasoningEffort: normalized };
  }
  return void 0;
}
export { codexReasoningEfforts, codexReasoningFallback, genericReasoningPickerValues, resolveGenericReasoningOverride, resolveMergeReasoningOverride, REASONING_EFFORTS, THINKING_MODES, DEFAULT_REASONING_EFFORTS };
