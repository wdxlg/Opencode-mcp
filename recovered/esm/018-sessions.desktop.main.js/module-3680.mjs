// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/common/automationStorageService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/sessions/contrib/automations/common/automationStorageService.ts
var AUTOMATION_STORAGE_KEY = "chat.automations.ledger";

function providerAutomationStorageKey(providerId) {
  return `chat.automations.provider.${encodeURIComponent(providerId)}.ledger`;
}

var IAutomationStorageService = createDecorator("automationStorageService");
export { providerAutomationStorageKey, AUTOMATION_STORAGE_KEY, IAutomationStorageService };
