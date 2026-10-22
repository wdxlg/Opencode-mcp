// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/chatDashboardService.ts
import { createDecorator } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/browser/chatDashboardService.ts
var IChatDashboardService = createDecorator("chatDashboardService");

var NullChatDashboardService = class {
  createDashboardElement() {
    return void 0;
  }
};

registerSingleton(IChatDashboardService, NullChatDashboardService, 1 /* Delayed */);
export { IChatDashboardService, NullChatDashboardService };
