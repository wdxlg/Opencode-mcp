// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAutoModeResolutionContentPart.ts
import { ChatThinkingStyleContentPart } from "./module-2255.mjs";
import { autoModeRoutingTitle } from "./module-2254.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAutoModeResolutionContentPart.ts
var ChatAutoModeResolutionContentPart = class extends ChatThinkingStyleContentPart {
  constructor(content2, context2, hoverService, configurationService) {
    super(autoModeRoutingTitle(content2), context2, void 0, hoverService, configurationService);
    this.content = content2;
    this.isRouting = !content2.resolved;
    this.setThinkingActive(this.isRouting);
    this.setExpandable(false);
    if (this.isRouting) {
      this.setShimmerTitle(autoModeRoutingTitle(content2));
    }
  }
  shouldPrepareContentAnimation() {
    return false;
  }
  initContent() {
    return this.createThinkingBody();
  }
  hasSameContent(other, _followingContent, element) {
    if (other.kind !== "autoModeResolution") {
      return false;
    }
    if (this.isRouting && element.isComplete) {
      return false;
    }
    return other.resolved?.id === this.content.resolved?.id;
  }
};

ChatAutoModeResolutionContentPart = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IConfigurationService)
], ChatAutoModeResolutionContentPart);
export { ChatAutoModeResolutionContentPart };
