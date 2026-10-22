// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/buffers/bufferRegistry.ts
import { OffBuffer } from "./module-2291.mjs";
import { WordBuffer } from "./module-2290.mjs";
import { ParagraphBuffer } from "./module-2292.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/buffers/bufferRegistry.ts
var BUFFER_MODES = {
  off: (_domNode) => new OffBuffer(),
  word: (_domNode) => new WordBuffer(),
  paragraph: (_domNode) => new ParagraphBuffer()
};
export { BUFFER_MODES };
