// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/linkedText.ts
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";


// src/vs/base/common/linkedText.ts
var LinkedText = class {
  constructor(nodes) {
    this.nodes = nodes;
  }
  toString() {
    return this.nodes.map((node) => typeof node === "string" ? node : node.label).join("");
  }
};

__decorateClass([
  memoize
], LinkedText.prototype, "toString", 1);

var LINK_REGEX = /\[([^\]]+)\]\(((?:https?:\/\/|command:|file:)[^\)\s]+)(?: (["'])(.+?)(\3))?\)/gi;

function parseLinkedText(text2) {
  const result = [];
  let index2 = 0;
  let match2;
  while (match2 = LINK_REGEX.exec(text2)) {
    if (match2.index - index2 > 0) {
      result.push(text2.substring(index2, match2.index));
    }
    const [, label3, href, , title] = match2;
    if (title) {
      result.push({ label: label3, href, title });
    } else {
      result.push({ label: label3, href });
    }
    index2 = match2.index + match2[0].length;
  }
  if (index2 < text2.length) {
    result.push(text2.substring(index2));
  }
  return new LinkedText(result);
}
export { parseLinkedText, LinkedText, LINK_REGEX };
