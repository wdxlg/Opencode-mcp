// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/chatWidgetUtils.ts
import { DisposableStore } from "./module-0012.mjs";
import { raceTimeout } from "./module-0036.mjs";


// src/vs/sessions/contrib/chat/browser/chatWidgetUtils.ts
var CHAT_WIDGET_LOAD_TIMEOUT_MS = 1e4;

async function whenChatWidgetForSession(chatWidgetService, sessionResource, timeoutMs = CHAT_WIDGET_LOAD_TIMEOUT_MS) {
  const existing = chatWidgetService.getWidgetBySessionResource(sessionResource);
  if (existing) {
    return existing;
  }
  const store = new DisposableStore();
  try {
    const loaded = new Promise((resolve3) => {
      const check = () => {
        const widget = chatWidgetService.getWidgetBySessionResource(sessionResource);
        if (widget) {
          resolve3(widget);
        }
      };
      const observe = (candidate) => store.add(candidate.onDidChangeViewModel(check));
      chatWidgetService.getAllWidgets().forEach(observe);
      store.add(chatWidgetService.onDidAddWidget((added) => {
        observe(added);
        check();
      }));
      check();
    });
    return await raceTimeout(loaded, timeoutMs);
  } finally {
    store.dispose();
  }
}
export { whenChatWidgetForSession, CHAT_WIDGET_LOAD_TIMEOUT_MS };
