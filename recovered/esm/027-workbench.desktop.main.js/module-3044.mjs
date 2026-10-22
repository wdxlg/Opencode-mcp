// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/explorerProjections/testingViewState.ts
import { TestId } from "./module-1207.mjs";


// src/vs/workbench/contrib/testing/browser/explorerProjections/testingViewState.ts
function isCollapsedInSerializedTestTree(serialized, id2) {
  if (!(id2 instanceof TestId)) {
    id2 = TestId.fromString(id2);
  }
  let node = serialized;
  for (const part of id2.path) {
    if (!node.children?.hasOwnProperty(part)) {
      return void 0;
    }
    node = node.children[part];
  }
  return node.collapsed;
}
export { isCollapsedInSerializedTestTree };
