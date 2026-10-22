// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/toolResultCompressor.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/common/tools/toolResultCompressor.ts
var IToolResultCompressor = createDecorator("IToolResultCompressor");

function isProtectedFromCompression(text2) {
  const trimmed = text2.trim();
  if (!trimmed) {
    return false;
  }
  const first2 = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  if (first2 === "{" && last === "}" || first2 === "[" && last === "]") {
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
    }
  }
  if (/^---\s*\n/.test(trimmed) || /^\[[A-Za-z_][A-Za-z0-9_.-]*\]\s*\n/.test(trimmed)) {
    return true;
  }
  return false;
}

var MIN_COMPRESSIBLE_LENGTH = 1024;

function formatCompressionBanner(filterIds, beforeChars, afterChars) {
  const ids = filterIds.length > 0 ? filterIds.join(", ") : "unknown";
  return `[Output compressed by ${ids} (${beforeChars} \u2192 ${afterChars} chars). To disable, set chat.tools.compressOutput.enabled to false.]`;
}
export { isProtectedFromCompression, formatCompressionBanner, IToolResultCompressor, MIN_COMPRESSIBLE_LENGTH };
