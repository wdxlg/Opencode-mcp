// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/copilotConfigSlashCommands.ts
import { localize } from "./module-0012.mjs";
import { matchesFuzzy2 } from "./module-0109.mjs";


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
      command: "yolo",
      sortText: "z1_yolo",
      options: [
        { arg: "on", detail: setBypassDetail(), config: { ["autoApprove" /* AutoApprove */]: AUTO_APPROVE_BYPASS } },
        { arg: "off", detail: setDefaultDetail(), config: { ["autoApprove" /* AutoApprove */]: AUTO_APPROVE_DEFAULT } }
      ]
    },
    {
      command: "allow-all",
      sortText: "z1_allow-all",
      options: [
        { arg: "on", detail: setBypassDetail(), config: { ["autoApprove" /* AutoApprove */]: AUTO_APPROVE_BYPASS } },
        { arg: "off", detail: setDefaultDetail(), config: { ["autoApprove" /* AutoApprove */]: AUTO_APPROVE_DEFAULT } }
      ]
    },
    {
      command: "autopilot",
      sortText: "z1_autopilot",
      options: [
        { arg: "on", detail: autopilotOnDetail(), config: { ["mode" /* Mode */]: MODE_AUTOPILOT } },
        { arg: "off", detail: exitAutopilotDetail(), config: { ["mode" /* Mode */]: MODE_INTERACTIVE } },
        { detail: autopilotPromptDetail(), config: { ["mode" /* Mode */]: MODE_AUTOPILOT }, argumentHint: autopilotArgumentHint() }
      ]
    },
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

function isCopilotConfigSlashCommand(command) {
  return getConfigSlashCommands().some((c) => c.command.toLowerCase() === command.toLowerCase());
}

function shouldOfferOption(option, state) {
  if (option.argumentHint !== void 0 || !state) {
    return true;
  }
  const autoApproveTarget = option.config["autoApprove" /* AutoApprove */];
  if (autoApproveTarget !== void 0) {
    const isBypass = state.autoApprove === AUTO_APPROVE_BYPASS;
    return autoApproveTarget === AUTO_APPROVE_BYPASS ? !isBypass : isBypass;
  }
  const modeTarget = option.config["mode" /* Mode */];
  if (modeTarget === MODE_AUTOPILOT) {
    return state.mode !== MODE_AUTOPILOT;
  }
  if (modeTarget === MODE_INTERACTIVE) {
    return state.mode === MODE_AUTOPILOT;
  }
  return true;
}

function getCopilotConfigSlashCommandItems(typed, state) {
  const typedLower = typed.trim().toLowerCase();
  const items = [];
  for (const command of getConfigSlashCommands()) {
    if (typedLower && !command.command.toLowerCase().startsWith(typedLower) && (typedLower.length === 1 || matchesFuzzy2(typedLower, command.command) === null)) {
      continue;
    }
    for (const option of command.options) {
      if (!shouldOfferOption(option, state)) {
        continue;
      }
      const keep = option.argumentHint !== void 0;
      const insertText = keep ? `/${command.command} ` : "";
      const label = keep ? `/${command.command}` : option.arg ? `/${command.command} ${option.arg}` : `/${command.command}`;
      items.push({
        insertText,
        label,
        command: command.command,
        description: option.detail,
        ...option.argumentHint !== void 0 ? { argumentHint: option.argumentHint } : {},
        applyConfig: option.config,
        sortText: option.arg ? `${command.sortText}_${option.arg}` : command.sortText
      });
    }
  }
  return items;
}

function resolveCopilotConfigSlashCommandOnSend(command, rest) {
  const descriptor = getConfigSlashCommands().find((c) => c.command.toLowerCase() === command.toLowerCase());
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
  const fallback = baseOption ?? descriptor.options[0];
  return { applyConfig: fallback.config, strippedPrompt: trimmedRest };
}
export { setBypassDetail, setDefaultDetail, autopilotOnDetail, exitAutopilotDetail, autopilotPromptDetail, planPromptDetail, autopilotArgumentHint, promptArgumentHint, getConfigSlashCommands, isCopilotConfigSlashCommand, shouldOfferOption, getCopilotConfigSlashCommandItems, resolveCopilotConfigSlashCommandOnSend, AUTO_APPROVE_BYPASS, AUTO_APPROVE_DEFAULT, MODE_INTERACTIVE, MODE_PLAN, MODE_AUTOPILOT };
