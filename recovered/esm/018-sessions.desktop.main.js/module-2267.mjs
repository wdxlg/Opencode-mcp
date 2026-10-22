// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/buffers/paragraphBuffer.ts



// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/buffers/paragraphBuffer.ts
var MAX_BUFFERED_CHARS = 4e3;

function lastBlockBoundary(text2) {
  let lastValid = -1;
  let inFence = false;
  for (let i2 = 0; i2 < text2.length; i2++) {
    if ((i2 === 0 || text2[i2 - 1] === "\n") && (text2[i2] === "`" && text2[i2 + 1] === "`" && text2[i2 + 2] === "`" || text2[i2] === "~" && text2[i2 + 1] === "~" && text2[i2 + 2] === "~")) {
      inFence = !inFence;
      i2 += 2;
      continue;
    }
    if (!inFence && text2[i2] === "\n" && text2[i2 + 1] === "\n") {
      lastValid = i2;
    }
  }
  return lastValid;
}

var ParagraphBuffer = class {
  constructor() {
    this.handlesFlush = false;
  }
  getRenderable(fullMarkdown, _lastRendered) {
    const lastBlock = lastBlockBoundary(fullMarkdown);
    let renderable = lastBlock === -1 ? fullMarkdown : fullMarkdown.slice(0, lastBlock + 2);
    if (fullMarkdown.length - renderable.length > MAX_BUFFERED_CHARS) {
      renderable = fullMarkdown;
    }
    return renderable;
  }
};
export { lastBlockBoundary, MAX_BUFFERED_CHARS, ParagraphBuffer };
