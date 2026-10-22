// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/service/customizationMigrationService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/service/customizationMigrationService.ts
var ICustomizationMigrationService = createDecorator("customizationMigrationService");

function getCustomizationMigrationTargetType(customization) {
  return customization.type === "prompt" /* prompt */ ? "skill" /* skill */ : customization.type;
}

function isPromptFileMigrationCandidate(customization) {
  return customization.type === "prompt" /* prompt */ && (customization.storage === "local" /* local */ || customization.storage === "user" /* user */);
}

function isUserDataMigrationCandidate(customization) {
  return customization.source === "user-data" /* UserData */ && (customization.type === "agent" /* agent */ || customization.type === "instructions" /* instructions */);
}
export { getCustomizationMigrationTargetType, isPromptFileMigrationCandidate, isUserDataMigrationCandidate, ICustomizationMigrationService };
