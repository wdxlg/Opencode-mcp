// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testingContextKeys.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/testing/common/testingContextKeys.ts
var TestingContextKeys;

((TestingContextKeys2) => {
  TestingContextKeys2.providerCount = new RawContextKey("testing.providerCount", 0);
  TestingContextKeys2.canRefreshTests = new RawContextKey("testing.canRefresh", false, { type: "boolean", description: localize(21331, null) });
  TestingContextKeys2.isRefreshingTests = new RawContextKey("testing.isRefreshing", false, { type: "boolean", description: localize(21347, null) });
  TestingContextKeys2.isContinuousModeOn = new RawContextKey("testing.isContinuousModeOn", false, { type: "boolean", description: localize(21344, null) });
  TestingContextKeys2.hasDebuggableTests = new RawContextKey("testing.hasDebuggableTests", false, { type: "boolean", description: localize(21338, null) });
  TestingContextKeys2.hasRunnableTests = new RawContextKey("testing.hasRunnableTests", false, { type: "boolean", description: localize(21342, null) });
  TestingContextKeys2.hasCoverableTests = new RawContextKey("testing.hasCoverableTests", false, { type: "boolean", description: localize(21336, null) });
  TestingContextKeys2.hasNonDefaultProfile = new RawContextKey("testing.hasNonDefaultProfile", false, { type: "boolean", description: localize(21340, null) });
  TestingContextKeys2.hasConfigurableProfile = new RawContextKey("testing.hasConfigurableProfile", false, { type: "boolean", description: localize(21335, null) });
  TestingContextKeys2.supportsContinuousRun = new RawContextKey("testing.supportsContinuousRun", false, { type: "boolean", description: localize(21352, null) });
  TestingContextKeys2.isParentRunningContinuously = new RawContextKey("testing.isParentRunningContinuously", false, { type: "boolean", description: localize(21346, null) });
  TestingContextKeys2.activeEditorHasTests = new RawContextKey("testing.activeEditorHasTests", false, { type: "boolean", description: localize(21328, null) });
  TestingContextKeys2.cursorInsideTestRange = new RawContextKey("testing.cursorInsideTestRange", false, { type: "boolean", description: localize(21334, null) });
  TestingContextKeys2.isTestCoverageOpen = new RawContextKey("testing.isTestCoverageOpen", false, { type: "boolean", description: localize(21348, null) });
  TestingContextKeys2.hasCoverageInFile = new RawContextKey("testing.hasCoverageInFile", false, { type: "boolean", description: localize(21337, null) });
  TestingContextKeys2.hasPerTestCoverage = new RawContextKey("testing.hasPerTestCoverage", false, { type: "boolean", description: localize(21341, null) });
  TestingContextKeys2.hasInlineCoverageDetails = new RawContextKey("testing.hasInlineCoverageDetails", false, { type: "boolean", description: localize(21339, null) });
  TestingContextKeys2.isCoverageFilteredToTest = new RawContextKey("testing.isCoverageFilteredToTest", false, { type: "boolean", description: localize(21345, null) });
  TestingContextKeys2.coverageToolbarEnabled = new RawContextKey("testing.coverageToolbarEnabled", true, { type: "boolean", description: localize(21333, null) });
  TestingContextKeys2.inlineCoverageEnabled = new RawContextKey("testing.inlineCoverageEnabled", false, { type: "boolean", description: localize(21343, null) });
  TestingContextKeys2.canGoToRelatedCode = new RawContextKey("testing.canGoToRelatedCode", false, { type: "boolean", description: localize(21329, null) });
  TestingContextKeys2.canGoToRelatedTest = new RawContextKey("testing.canGoToRelatedTest", false, { type: "boolean", description: localize(21330, null) });
  TestingContextKeys2.peekHasStack = new RawContextKey("testing.peekHasStack", false, { type: "boolean", description: localize(21349, null) });
  TestingContextKeys2.capabilityToContextKey = {
    [2 /* Run */]: TestingContextKeys2.hasRunnableTests,
    [8 /* Coverage */]: TestingContextKeys2.hasCoverableTests,
    [4 /* Debug */]: TestingContextKeys2.hasDebuggableTests,
    [16 /* HasNonDefaultProfile */]: TestingContextKeys2.hasNonDefaultProfile,
    [32 /* HasConfigurable */]: TestingContextKeys2.hasConfigurableProfile,
    [64 /* SupportsContinuousRun */]: TestingContextKeys2.supportsContinuousRun
  };
  TestingContextKeys2.hasAnyResults = new RawContextKey("testing.hasAnyResults", false);
  TestingContextKeys2.viewMode = new RawContextKey("testing.explorerViewMode", "list" /* List */);
  TestingContextKeys2.viewSorting = new RawContextKey("testing.explorerViewSorting", "location" /* ByLocation */);
  TestingContextKeys2.isRunning = new RawContextKey("testing.isRunning", false);
  TestingContextKeys2.isInPeek = new RawContextKey("testing.isInPeek", false);
  TestingContextKeys2.isPeekVisible = new RawContextKey("testing.isPeekVisible", false);
  TestingContextKeys2.peekItemType = new RawContextKey("peekItemType", void 0, {
    type: "string",
    description: localize(21350, null)
  });
  TestingContextKeys2.controllerId = new RawContextKey("controllerId", void 0, {
    type: "string",
    description: localize(21332, null)
  });
  TestingContextKeys2.testItemExtId = new RawContextKey("testId", void 0, {
    type: "string",
    description: localize(21353, null)
  });
  TestingContextKeys2.testItemHasUri = new RawContextKey("testing.testItemHasUri", false, {
    type: "boolean",
    description: localize(21354, null)
  });
  TestingContextKeys2.testItemIsHidden = new RawContextKey("testing.testItemIsHidden", false, {
    type: "boolean",
    description: localize(21355, null)
  });
  TestingContextKeys2.testMessageContext = new RawContextKey("testMessage", void 0, {
    type: "string",
    description: localize(21356, null)
  });
  TestingContextKeys2.testResultOutdated = new RawContextKey("testResultOutdated", void 0, {
    type: "boolean",
    description: localize(21357, null)
  });
  TestingContextKeys2.testResultState = new RawContextKey("testResultState", void 0, {
    type: "string",
    description: localize(21358, null)
  });
  TestingContextKeys2.testProfileContextGroup = new RawContextKey("testing.profile.context.group", void 0, {
    type: "string",
    description: localize(21351, null)
  });
})(TestingContextKeys || (TestingContextKeys = {}));
export { TestingContextKeys };
