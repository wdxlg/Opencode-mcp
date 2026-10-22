// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/jsonc.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/jsonc.ts
function stripComments(content) {
  return content.replace(regexp, function(match, _m1, _m2, m3, m4, m5) {
    if (m3) {
      return "";
    } else if (m4) {
      const length = m4.length;
      if (m4[length - 1] === "\n") {
        return m4[length - 2] === "\r" ? "\r\n" : "\n";
      } else {
        return "";
      }
    } else if (m5) {
      return match.substring(1);
    } else {
      return match;
    }
  });
}

function parse(content) {
  const commentsStripped = stripComments(content);
  try {
    return JSON.parse(commentsStripped);
  } catch (error) {
    const trailingCommasStriped = commentsStripped.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(trailingCommasStriped);
  }
}

var regexp;

var init_jsonc = __esm({
  "src/vs/base/common/jsonc.ts"() {
    regexp = /("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^\/\*]*(?:(?:\*|\/)[^\/\*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g;
  }
});
export { stripComments, parse, regexp, init_jsonc };
