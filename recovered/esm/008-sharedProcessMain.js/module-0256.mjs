// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionRecommendations/common/extensionRecommendationsIpc.ts



// src/vs/platform/extensionRecommendations/common/extensionRecommendationsIpc.ts
var ExtensionRecommendationNotificationServiceChannelClient = class {
  constructor(channel) {
    this.channel = channel;
  }
  get ignoredRecommendations() {
    throw new Error("not supported");
  }
  promptImportantExtensionsInstallNotification(extensionRecommendations) {
    return this.channel.call("promptImportantExtensionsInstallNotification", [extensionRecommendations]);
  }
  promptWorkspaceRecommendations(recommendations) {
    throw new Error("not supported");
  }
  hasToIgnoreRecommendationNotifications() {
    throw new Error("not supported");
  }
};
export { ExtensionRecommendationNotificationServiceChannelClient };
