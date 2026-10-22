// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexUserInputMapper.ts
import { withChatInputRequestPurpose } from "./module-0182.mjs";


// src/vs/platform/agentHost/node/codex/codexUserInputMapper.ts
function buildUserInputRequest(requestId, questions) {
  return withChatInputRequestPurpose({
    id: requestId,
    questions: questions.map((q) => {
      if (q.options && q.options.length > 0) {
        return {
          kind: "single-select" /* SingleSelect */,
          id: q.id,
          title: q.header,
          message: q.question,
          required: true,
          options: q.options.map((o) => ({ id: o.label, label: o.label, description: o.description || void 0 })),
          allowFreeformInput: q.isOther
        };
      }
      return {
        kind: "text" /* Text */,
        id: q.id,
        title: q.header,
        message: q.question,
        required: true
      };
    })
  }, "askUser" /* AskUser */);
}

function userInputResponseFromAnswers(questions, response, answers) {
  const out = {};
  for (const q of questions) {
    out[q.id] = { answers: answerStrings(answers?.[q.id], response) };
  }
  return { answers: out };
}

function emptyUserInputResponse(questions) {
  const out = {};
  for (const q of questions) {
    out[q.id] = { answers: [] };
  }
  return { answers: out };
}

function answerStrings(answer, response) {
  if (response !== "accept" /* Accept */ || !answer || answer.state === "skipped" /* Skipped */) {
    return [];
  }
  const { value } = answer;
  switch (value.kind) {
    case "text" /* Text */:
      return [value.value];
    case "number" /* Number */:
    case "boolean" /* Boolean */:
      return [String(value.value)];
    case "selected" /* Selected */:
      return [value.value, ...value.freeformValues ?? []];
    case "selected-many" /* SelectedMany */:
      return [...value.value, ...value.freeformValues ?? []];
  }
}
export { buildUserInputRequest, userInputResponseFromAnswers, emptyUserInputResponse, answerStrings };
