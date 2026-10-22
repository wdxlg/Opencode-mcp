// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/promptTsxTypes.ts



// src/vs/workbench/contrib/chat/common/tools/promptTsxTypes.ts
function stringifyPromptElementJSON(element) {
  const strs = [];
  stringifyPromptNodeJSON(element.node, strs);
  return strs.join("");
}

function stringifyPromptNodeJSON(node, strs) {
  if (node.type === 2 /* Text */) {
    if (node.lineBreakBefore) {
      strs.push("\n");
    }
    if (typeof node.text === "string") {
      strs.push(node.text);
    }
  } else if (node.ctor === 3 /* ImageChatMessage */) {
    strs.push("<image>");
  } else if (node.ctor === 1 /* BaseChatMessage */ || node.ctor === 2 /* Other */) {
    for (const child of node.children) {
      stringifyPromptNodeJSON(child, strs);
    }
  }
}
export { stringifyPromptElementJSON, stringifyPromptNodeJSON };
