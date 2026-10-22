// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationWelcomePage.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { PromptLaunchersAICustomizationWelcomePage } from "./module-2650.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationWelcomePage.ts
var $94 = $;

var AICustomizationWelcomePage = class extends Disposable {
  constructor(parent, welcomePageFeatures, callbacks, commandService, workspaceService, hoverService, harnessLabel) {
    super();
    this.container = append(parent, $94(".welcome-page-host"));
    this.container.style.height = "100%";
    this.container.style.overflow = "hidden";
    this.implementation = this._register(new PromptLaunchersAICustomizationWelcomePage(this.container, welcomePageFeatures, callbacks, commandService, workspaceService, hoverService, harnessLabel));
  }
  rebuildCards(visibleSectionIds) {
    this.implementation.rebuildCards(visibleSectionIds);
  }
  setHarnessLabel(label3) {
    this.implementation.setHarnessLabel(label3);
  }
  setPromptMigrationInfo(info) {
    this.implementation.setPromptMigrationInfo(info);
  }
  focus() {
    this.implementation.focus();
  }
  reset() {
    this.implementation.reset?.();
  }
};
export { $94, AICustomizationWelcomePage };
