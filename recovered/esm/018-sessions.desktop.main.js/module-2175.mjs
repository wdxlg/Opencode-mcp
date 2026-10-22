// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/jsonc.ts



// src/vs/base/common/jsonc.ts
var regexp = /("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^\/\*]*(?:(?:\*|\/)[^\/\*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g;

function stripComments(content) {
  return content.replace(regexp, function(match2, _m1, _m2, m3, m4, m5) {
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
      return match2.substring(1);
    } else {
      return match2;
    }
  });
}

function parse12(content) {
  const commentsStripped = stripComments(content);
  try {
    return JSON.parse(commentsStripped);
  } catch (error) {
    const trailingCommasStriped = commentsStripped.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(trailingCommasStriped);
  }
}
export { stripComments, parse12, regexp };
