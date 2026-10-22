// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputOnboardingHosts.ts
import { DisposableStore } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputOnboardingHosts.ts
function registerChatInputOnboardingHosts(host, containers, focusRoot, focusInput, voiceModeOnboardingService, dictationOnboardingService) {
  const claimNotice = (options3) => host.occupy(1 /* Onboarding */, options3);
  const store = new DisposableStore();
  store.add(voiceModeOnboardingService.registerHost({
    container: containers.voice,
    focusRoot,
    focus: focusInput,
    claimNotice
  }));
  store.add(dictationOnboardingService.registerHost({
    container: containers.dictation,
    focusRoot,
    focus: focusInput,
    claimNotice
  }));
  return store;
}
export { registerChatInputOnboardingHosts };
