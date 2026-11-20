// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/copilotConfigSlashCommands.ts
import { localize } from "./module-0001.mjs";


// src/vs/platform/agentHost/common/copilotConfigSlashCommands.ts
var AUTO_APPROVE_BYPASS = "autoApprove";

var AUTO_APPROVE_DEFAULT = "default";

var MODE_INTERACTIVE = "interactive";

var MODE_PLAN = "plan";

var MODE_AUTOPILOT = "autopilot";

function setBypassDetail() {
  return localize(2114, null);
}

function setDefaultDetail() {
  return localize(2110, null);
}

function autopilotOnDetail() {
  return localize(2107, null);
}

function exitAutopilotDetail() {
  return localize(2111, null);
}

function autopilotPromptDetail() {
  return localize(2108, null);
}

function planPromptDetail() {
  return localize(2112, null);
}

function autopilotArgumentHint() {
  return localize(2109, null);
}

function promptArgumentHint() {
  return localize(2113, null);
}

function getConfigSlashCommands() {
  return [
    {
      command: "plan",
      sortText: "z1_plan",
      options: [
        { detail: planPromptDetail(), config: { ["mode" /* Mode */]: MODE_PLAN }, argumentHint: promptArgumentHint() }
      ]
    },
    {
      command: "goal",
      sortText: "z1_goal",
      options: [
        { detail: planPromptDetail(), config: { ["mode" /* Mode */]: MODE_PLAN }, argumentHint: promptArgumentHint() }
      ]
    }
  ];
}

function resolveCopilotConfigSlashCommandOnSend(command4, rest) {
  const descriptor = getConfigSlashCommands().find((c) => c.command.toLowerCase() === command4.toLowerCase());
  if (!descriptor) {
    return void 0;
  }
  const trimmedRest = rest.trim();
  const namedOptions = descriptor.options.filter((o) => o.arg !== void 0);
  const baseOption = descriptor.options.find((o) => o.arg === void 0);
  if (namedOptions.length > 0 && trimmedRest.length > 0) {
    const match2 = /^(\S+)(?:\s+([\s\S]*))?$/.exec(trimmedRest);
    const firstToken = match2?.[1]?.toLowerCase();
    const matched = namedOptions.find((o) => o.arg?.toLowerCase() === firstToken);
    if (matched) {
      return { applyConfig: matched.config, strippedPrompt: (match2?.[2] ?? "").trim() };
    }
    if (!baseOption) {
      return void 0;
    }
  }
  const fallback2 = baseOption ?? descriptor.options[0];
  return { applyConfig: fallback2.config, strippedPrompt: trimmedRest };
}
export { setBypassDetail, setDefaultDetail, autopilotOnDetail, exitAutopilotDetail, autopilotPromptDetail, planPromptDetail, autopilotArgumentHint, promptArgumentHint, getConfigSlashCommands, resolveCopilotConfigSlashCommandOnSend, AUTO_APPROVE_BYPASS, AUTO_APPROVE_DEFAULT, MODE_INTERACTIVE, MODE_PLAN, MODE_AUTOPILOT };
