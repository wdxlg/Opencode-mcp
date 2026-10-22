// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/extensionRecommendations/common/extensionRecommendations.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/extensionRecommendations/common/extensionRecommendations.ts
function RecommendationSourceToString(source) {
  switch (source) {
    case 1 /* FILE */:
      return "file";
    case 2 /* WORKSPACE */:
      return "workspace";
    case 3 /* EXE */:
      return "exe";
  }
}

var IExtensionRecommendationNotificationService = createDecorator("IExtensionRecommendationNotificationService");
export { RecommendationSourceToString, IExtensionRecommendationNotificationService };
