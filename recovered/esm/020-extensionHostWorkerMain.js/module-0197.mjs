// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/hookTypes.ts
import { localize } from "./module-0015.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/hookTypes.ts
var HookType = /* @__PURE__ */ ((HookType2) => {
  HookType2["SessionStart"] = "SessionStart";
  HookType2["SessionEnd"] = "SessionEnd";
  HookType2["UserPromptSubmit"] = "UserPromptSubmit";
  HookType2["PreToolUse"] = "PreToolUse";
  HookType2["PostToolUse"] = "PostToolUse";
  HookType2["PreCompact"] = "PreCompact";
  HookType2["SubagentStart"] = "SubagentStart";
  HookType2["SubagentStop"] = "SubagentStop";
  HookType2["Stop"] = "Stop";
  HookType2["ErrorOccurred"] = "ErrorOccurred";
  return HookType2;
})(HookType || {});

var HOOKS_BY_TARGET = {
  // see https://code.visualstudio.com/docs/copilot/customization/hooks#_hook-lifecycle-events
  ["vscode" /* VSCode */]: {
    "SessionStart": "SessionStart" /* SessionStart */,
    "UserPromptSubmit": "UserPromptSubmit" /* UserPromptSubmit */,
    "PreToolUse": "PreToolUse" /* PreToolUse */,
    "PostToolUse": "PostToolUse" /* PostToolUse */,
    "PreCompact": "PreCompact" /* PreCompact */,
    "SubagentStart": "SubagentStart" /* SubagentStart */,
    "SubagentStop": "SubagentStop" /* SubagentStop */,
    "Stop": "Stop" /* Stop */
  },
  // see https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks#types-of-hooks
  ["github-copilot" /* GitHubCopilot */]: {
    "sessionStart": "SessionStart" /* SessionStart */,
    "sessionEnd": "SessionEnd" /* SessionEnd */,
    "userPromptSubmitted": "UserPromptSubmit" /* UserPromptSubmit */,
    "preToolUse": "PreToolUse" /* PreToolUse */,
    "postToolUse": "PostToolUse" /* PostToolUse */,
    "agentStop": "Stop" /* Stop */,
    "subagentStop": "SubagentStop" /* SubagentStop */,
    "errorOccurred": "ErrorOccurred" /* ErrorOccurred */
  },
  // see https://docs.anthropic.com/en/docs/claude-code/hooks
  ["claude" /* Claude */]: {
    "SessionStart": "SessionStart" /* SessionStart */,
    "UserPromptSubmit": "UserPromptSubmit" /* UserPromptSubmit */,
    "PreToolUse": "PreToolUse" /* PreToolUse */,
    "PostToolUse": "PostToolUse" /* PostToolUse */,
    "PreCompact": "PreCompact" /* PreCompact */,
    "SubagentStart": "SubagentStart" /* SubagentStart */,
    "SubagentStop": "SubagentStop" /* SubagentStop */,
    "Stop": "Stop" /* Stop */
  },
  // if no target, just list all known hook types.
  ["undefined" /* Undefined */]: Object.fromEntries(
    Object.values(HookType).map((h) => [h, h])
  )
};

var HOOK_METADATA = {
  ["SessionStart" /* SessionStart */]: {
    label: localize(13076, null),
    description: localize(13075, null)
  },
  ["UserPromptSubmit" /* UserPromptSubmit */]: {
    label: localize(13084, null),
    description: localize(13083, null)
  },
  ["PreToolUse" /* PreToolUse */]: {
    label: localize(13072, null),
    description: localize(13071, null)
  },
  ["PostToolUse" /* PostToolUse */]: {
    label: localize(13068, null),
    description: localize(13067, null)
  },
  ["PreCompact" /* PreCompact */]: {
    label: localize(13070, null),
    description: localize(13069, null)
  },
  ["SubagentStart" /* SubagentStart */]: {
    label: localize(13080, null),
    description: localize(13079, null)
  },
  ["SubagentStop" /* SubagentStop */]: {
    label: localize(13082, null),
    description: localize(13081, null)
  },
  ["Stop" /* Stop */]: {
    label: localize(13078, null),
    description: localize(13077, null)
  },
  ["SessionEnd" /* SessionEnd */]: {
    label: localize(13074, null),
    description: localize(13073, null)
  },
  ["ErrorOccurred" /* ErrorOccurred */]: {
    label: localize(13066, null),
    description: localize(13065, null)
  }
};
export { HookType, HOOKS_BY_TARGET, HOOK_METADATA };
