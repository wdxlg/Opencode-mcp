// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeInteractiveTools.ts
import { getClaudeToolDisplayName } from "./module-0330.mjs";
import { localize } from "./module-0012.mjs";


// src/vs/platform/agentHost/node/claude/claudeInteractiveTools.ts
function buildExitPlanModeConfirmationState(input, toolUseID) {
  const plan = typeof input.plan === "string" ? input.plan : "";
  return {
    status: "pending-confirmation" /* PendingConfirmation */,
    toolCallId: toolUseID,
    toolName: "ExitPlanMode",
    displayName: getClaudeToolDisplayName("ExitPlanMode"),
    invocationMessage: { markdown: plan },
    toolInput: JSON.stringify(input),
    confirmationTitle: localize(2308, null),
    options: [
      { id: "approve", label: localize(2306, null), kind: "approve" /* Approve */ },
      { id: "deny", label: localize(2307, null), kind: "deny" /* Deny */ }
    ]
  };
}

function parseAskUserQuestionInput(input) {
  const askInput = input;
  if (!askInput.questions?.length) {
    return void 0;
  }
  return { questions: askInput.questions };
}

function askUserQuestionId(header, idx) {
  return header || `q-${idx}`;
}

function buildAskUserSessionInputQuestions(askInput) {
  return askInput.questions.map((q, idx) => {
    const opts = q.options.map((opt) => ({
      id: opt.label,
      label: opt.label,
      ...opt.description !== void 0 ? { description: opt.description } : {}
    }));
    const id2 = askUserQuestionId(q.header, idx);
    return q.multiSelect ? {
      id: id2,
      kind: "multi-select" /* MultiSelect */,
      title: q.header,
      message: q.question,
      options: opts,
      allowFreeformInput: q.allowFreeformInput ?? false
    } : {
      id: id2,
      kind: "single-select" /* SingleSelect */,
      title: q.header,
      message: q.question,
      options: opts,
      allowFreeformInput: q.allowFreeformInput ?? false
    };
  });
}

function flattenAskUserAnswers(askInput, answers) {
  const result = {};
  for (let idx = 0; idx < askInput.questions.length; idx++) {
    const q = askInput.questions[idx];
    const a = answers[askUserQuestionId(q.header, idx)];
    if (!a || a.state === "skipped" /* Skipped */) {
      continue;
    }
    const parts = [];
    const value = a.value;
    if (value.kind === "selected" /* Selected */) {
      if (value.value) {
        parts.push(value.value);
      }
      if (value.freeformValues) {
        parts.push(...value.freeformValues);
      }
    } else if (value.kind === "selected-many" /* SelectedMany */) {
      parts.push(...value.value);
      if (value.freeformValues) {
        parts.push(...value.freeformValues);
      }
    } else if (value.kind === "text" /* Text */) {
      parts.push(value.value);
    }
    if (parts.length > 0) {
      result[q.question] = parts.join(", ");
    }
  }
  return result;
}
export { buildExitPlanModeConfirmationState, parseAskUserQuestionInput, askUserQuestionId, buildAskUserSessionInputQuestions, flattenAskUserAnswers };
