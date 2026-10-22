// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/extensionRecommendations/common/extensionRecommendationNotificationService.ts



// src/vs/sessions/services/extensionRecommendations/common/extensionRecommendationNotificationService.ts
var NullExtensionRecommendationNotificationService = class {
  constructor() {
    this.ignoredRecommendations = [];
  }
  hasToIgnoreRecommendationNotifications() {
    return true;
  }
  async promptImportantExtensionsInstallNotification() {
    return "ignored" /* Ignored */;
  }
  async promptWorkspaceRecommendations() {
  }
};
export { NullExtensionRecommendationNotificationService };
