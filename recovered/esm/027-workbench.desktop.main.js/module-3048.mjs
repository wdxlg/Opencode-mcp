// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay.ts
import { TestId } from "./module-1207.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { capabilityContextKeys } from "./module-1429.mjs";


// src/vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay.ts
var getTestItemContextOverlay = (test, capabilities) => {
  if (!test) {
    return [];
  }
  const testId = TestId.fromString(test.item.extId);
  return [
    [TestingContextKeys.testItemExtId.key, testId.localId],
    [TestingContextKeys.controllerId.key, test.controllerId],
    [TestingContextKeys.testItemHasUri.key, !!test.item.uri],
    ...capabilityContextKeys(capabilities)
  ];
};
export { getTestItemContextOverlay };
