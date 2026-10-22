// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionRecommendations/common/extensionRecommendationsIpc.ts



// src/vs/platform/extensionRecommendations/common/extensionRecommendationsIpc.ts
var ExtensionRecommendationNotificationServiceChannel = class {
  constructor(service) {
    this.service = service;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listen(_, event) {
    throw new Error(`Event not found: ${event}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call(_, command4, args2) {
    switch (command4) {
      case "promptImportantExtensionsInstallNotification":
        return this.service.promptImportantExtensionsInstallNotification(args2[0]);
    }
    throw new Error(`Call not found: ${command4}`);
  }
};
export { ExtensionRecommendationNotificationServiceChannel };
