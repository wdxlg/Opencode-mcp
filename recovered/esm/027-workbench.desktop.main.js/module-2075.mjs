// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/voiceClient/voicePendingNarration.ts



// src/vs/workbench/contrib/chat/common/voiceClient/voicePendingNarration.ts
function formatQuestionPrompt(question, allowSkip) {
  const parts = [];
  const title = question.title.trim();
  if (title) {
    parts.push(title);
  }
  if (question.options.length > 0) {
    const choices = question.options.map((option2, index2) => `${index2 + 1}, ${option2.label}`).join(". ");
    parts.push(`Options: ${choices}.`);
    if (question.allow_freeform) {
      parts.push("You can also give your own answer.");
    }
  }
  if (allowSkip) {
    parts.push("Or say skip.");
  }
  return parts.join(" ");
}
export { formatQuestionPrompt };
