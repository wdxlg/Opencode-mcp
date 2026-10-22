// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/animations/animationRegistry.ts
import { BlockAnimation } from "./module-2269.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/animations/animationRegistry.ts
var ANIMATION_STYLES = {
  none: () => ({ animate() {
  } }),
  fade: () => new BlockAnimation("fade"),
  rise: () => new BlockAnimation("rise"),
  blur: () => new BlockAnimation("blur"),
  scale: () => new BlockAnimation("scale"),
  slide: () => new BlockAnimation("slide"),
  reveal: () => new BlockAnimation("reveal")
};
export { ANIMATION_STYLES };
