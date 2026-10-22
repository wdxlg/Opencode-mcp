// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/openPanelChatAndGetWidget.ts
import { ChatViewId } from "./module-0981.mjs";
import { Event2 } from "./module-0017.mjs";
import { raceTimeout } from "./module-0036.mjs";


// src/vs/workbench/contrib/mcp/browser/openPanelChatAndGetWidget.ts
async function openPanelChatAndGetWidget(viewsService, chatService) {
  await viewsService.openView(ChatViewId, true);
  const widgets2 = chatService.getWidgetsByLocations("panel" /* Chat */);
  if (widgets2.length) {
    return widgets2[0];
  }
  const eventPromise = Event2.toPromise(Event2.filter(chatService.onDidAddWidget, (e) => e.location === "panel" /* Chat */));
  return await raceTimeout(
    eventPromise,
    1e4,
    // should be enough time for chat to initialize...
    () => eventPromise.cancel()
  );
}
export { openPanelChatAndGetWidget };
