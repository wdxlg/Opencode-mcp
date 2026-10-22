// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceClient/voiceInputUtils.ts



// src/vs/workbench/contrib/chat/browser/voiceClient/voiceInputUtils.ts
function combineVoiceInput(existing, transcript) {
  if (!existing) {
    return transcript;
  }
  if (!transcript) {
    return existing;
  }
  return /\s$/.test(existing) ? `${existing}${transcript}` : `${existing} ${transcript}`;
}
export { combineVoiceInput };
