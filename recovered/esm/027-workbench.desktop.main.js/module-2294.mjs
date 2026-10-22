// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/animations/blockAnimations.ts



// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/animations/blockAnimations.ts
var ANIMATION_DURATION_MS = 600;

var STAGGER_DELAY_MS = 150;

var BlockAnimation = class {
  constructor(_style) {
    this._style = _style;
  }
  animate(children, fromIndex, currentCount, elapsed) {
    const className2 = `chat-smooth-animate-${this._style}`;
    for (let i2 = fromIndex; i2 < currentCount; i2++) {
      const child = children[i2];
      if (!child.classList) {
        continue;
      }
      const staggerOffset = (i2 - fromIndex) * STAGGER_DELAY_MS;
      const childDelay = -elapsed + staggerOffset;
      child.classList.add(className2);
      child.style.setProperty("--chat-smooth-duration", `${ANIMATION_DURATION_MS}ms`);
      child.style.setProperty("--chat-smooth-delay", `${childDelay}ms`);
      child.addEventListener("animationend", (e) => {
        if (e.target !== child) {
          return;
        }
        child.classList.remove(className2);
        child.style.removeProperty("--chat-smooth-duration");
        child.style.removeProperty("--chat-smooth-delay");
      }, { once: true });
    }
  }
};
export { ANIMATION_DURATION_MS, STAGGER_DELAY_MS, BlockAnimation };
