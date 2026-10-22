// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testing.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ITestService } from "./module-1435.mjs";
import { TestService } from "./module-3029.mjs";
import { ITestResultStorage, TestResultStorage } from "./module-1433.mjs";
import { ITestProfileService, TestProfileService, canUseProfileWithTest } from "./module-1429.mjs";
import { ITestCoverageService, TestCoverageService } from "./module-3024.mjs";
import { ITestingContinuousRunService, TestingContinuousRunService } from "./module-3034.mjs";
import { ITestResultService, TestResultService } from "./module-1434.mjs";
import { ITestExplorerFilterState, TestExplorerFilterState } from "./module-3026.mjs";
import { ITestingPeekOpener } from "./module-3036.mjs";
import { CloseTestPeek, CollapsePeekStack, GoToNextMessageAction, GoToPreviousMessageAction, OpenMessageInEditorAction, TestResultsView, TestingOutputPeekController, TestingPeekOpener, ToggleTestingPeekHistory } from "./module-3070.mjs";
import { ITestingDecorationsService } from "./module-3035.mjs";
import { TestingDecorationService, TestingDecorations } from "./module-3071.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { TestingViewPaneContainer } from "./module-3079.mjs";
import { testingResultsIcon, testingViewIcon } from "./module-3039.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { TestingExplorerView } from "./module-3077.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { TestCoverageView } from "./module-3043.mjs";
import { allTestActions, discoverAndRunTests } from "./module-3046.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { TestingContentProvider } from "./module-3033.mjs";
import { TestingProgressTrigger } from "./module-3078.mjs";
import { TestingChatAgentToolContribution } from "./module-3031.mjs";
import { registerEditorContribution } from "./module-0097.mjs";
import { CodeCoverageDecorations } from "./module-3041.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IViewsService } from "./module-1246.mjs";
import { TestId } from "./module-1207.mjs";
import { IFileService } from "./module-0269.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { REVEAL_IN_EXPLORER_COMMAND_ID } from "./module-2017.mjs";
import { IProgressService } from "./module-0446.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { testingConfiguration } from "./module-3023.mjs";


// src/vs/workbench/contrib/testing/browser/testing.contribution.ts
registerSingleton(ITestService, TestService, 1 /* Delayed */);

registerSingleton(ITestResultStorage, TestResultStorage, 1 /* Delayed */);

registerSingleton(ITestProfileService, TestProfileService, 1 /* Delayed */);

registerSingleton(ITestCoverageService, TestCoverageService, 1 /* Delayed */);

registerSingleton(ITestingContinuousRunService, TestingContinuousRunService, 1 /* Delayed */);

registerSingleton(ITestResultService, TestResultService, 1 /* Delayed */);

registerSingleton(ITestExplorerFilterState, TestExplorerFilterState, 1 /* Delayed */);

registerSingleton(ITestingPeekOpener, TestingPeekOpener, 1 /* Delayed */);

registerSingleton(ITestingDecorationsService, TestingDecorationService, 1 /* Delayed */);

var viewContainer = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: "workbench.view.extension.test" /* ViewletId */,
  title: localize2(21141, "Testing"),
  ctorDescriptor: new SyncDescriptor(TestingViewPaneContainer),
  icon: testingViewIcon,
  alwaysUseContainerInfo: true,
  order: 6,
  openCommandActionDescriptor: {
    id: "workbench.view.extension.test" /* ViewletId */,
    mnemonicTitle: localize(21138, null),
    // todo: coordinate with joh whether this is available
    // keybindings: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_SEMICOLON },
    order: 4
  },
  hideIfEmpty: true
}, 0 /* Sidebar */);

var testResultsViewContainer = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: "workbench.panel.testResults" /* ResultsPanelId */,
  title: localize2(21144, "Test Results"),
  icon: testingResultsIcon,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, ["workbench.panel.testResults" /* ResultsPanelId */, { mergeViewWithContainerWhenSingleView: true }]),
  hideIfEmpty: true,
  order: 3
}, 1 /* Panel */, { doNotRegisterOpenCommand: true });

var viewsRegistry3 = Registry.as(Extensions13.ViewsRegistry);

viewsRegistry3.registerViews([{
  id: "workbench.panel.testResults.view" /* ResultsViewId */,
  name: localize2(21144, "Test Results"),
  containerIcon: testingResultsIcon,
  canToggleVisibility: false,
  canMoveView: true,
  when: TestingContextKeys.hasAnyResults.isEqualTo(true),
  ctorDescriptor: new SyncDescriptor(TestResultsView)
}], testResultsViewContainer);

viewsRegistry3.registerViewWelcomeContent("workbench.view.testing" /* ExplorerViewId */, {
  content: localize(21139, null)
});

viewsRegistry3.registerViewWelcomeContent("workbench.view.testing" /* ExplorerViewId */, {
  content: "[" + localize(21140, null) + `](command:${"testing.searchForTestExtension" /* SearchForTestExtension */})`,
  order: 10
});

viewsRegistry3.registerViews([{
  id: "workbench.view.testing" /* ExplorerViewId */,
  name: localize2(21143, "Test Explorer"),
  ctorDescriptor: new SyncDescriptor(TestingExplorerView),
  canToggleVisibility: true,
  canMoveView: true,
  weight: 80,
  order: -999,
  containerIcon: testingViewIcon,
  when: ContextKeyExpr.greater(TestingContextKeys.providerCount.key, 0)
}, {
  id: "workbench.view.testCoverage" /* CoverageViewId */,
  name: localize2(21142, "Test Coverage"),
  ctorDescriptor: new SyncDescriptor(TestCoverageView),
  canToggleVisibility: true,
  canMoveView: true,
  weight: 80,
  order: -998,
  containerIcon: testingViewIcon,
  when: TestingContextKeys.isTestCoverageOpen
}], viewContainer);

allTestActions.forEach(registerAction2);

registerAction2(OpenMessageInEditorAction);

registerAction2(GoToPreviousMessageAction);

registerAction2(GoToNextMessageAction);

registerAction2(CloseTestPeek);

registerAction2(ToggleTestingPeekHistory);

registerAction2(CollapsePeekStack);

registerWorkbenchContribution2(TestingContentProvider.ID, TestingContentProvider, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(TestingPeekOpener.ID, TestingPeekOpener, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(TestingProgressTrigger.ID, TestingProgressTrigger, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(TestingChatAgentToolContribution.ID, TestingChatAgentToolContribution, WorkbenchPhase.Eventually);

registerEditorContribution("editor.contrib.testingOutputPeek" /* OutputPeekContributionId */, TestingOutputPeekController, 1 /* AfterFirstRender */);

registerEditorContribution("editor.contrib.testingDecorations" /* DecorationsContributionId */, TestingDecorations, 1 /* AfterFirstRender */);

registerEditorContribution("editor.contrib.coverageDecorations" /* CoverageDecorationsContributionId */, CodeCoverageDecorations, 3 /* Eventually */);

CommandsRegistry.registerCommand({
  id: "_revealTestInExplorer",
  handler: async (accessor, testId, focus) => {
    accessor.get(ITestExplorerFilterState).reveal.set(typeof testId === "string" ? testId : testId.extId, void 0);
    accessor.get(IViewsService).openView("workbench.view.testing" /* ExplorerViewId */, focus);
  }
});

CommandsRegistry.registerCommand({
  id: "testing.startContinuousRunFromExtension" /* StartContinousRunFromExtension */,
  handler: async (accessor, profileRef, tests) => {
    const profiles2 = accessor.get(ITestProfileService);
    const collection = accessor.get(ITestService).collection;
    const profile = profiles2.getControllerProfiles(profileRef.controllerId).find((p) => p.profileId === profileRef.profileId);
    if (!profile?.supportsContinuousRun) {
      return;
    }
    const crService = accessor.get(ITestingContinuousRunService);
    for (const test of tests) {
      const found = collection.getNodeById(test.extId);
      if (found && canUseProfileWithTest(profile, found)) {
        crService.start([profile], found.item.extId);
      }
    }
  }
});

CommandsRegistry.registerCommand({
  id: "testing.stopContinuousRunFromExtension" /* StopContinousRunFromExtension */,
  handler: async (accessor, tests) => {
    const crService = accessor.get(ITestingContinuousRunService);
    for (const test of tests) {
      crService.stop(test.extId);
    }
  }
});

CommandsRegistry.registerCommand({
  id: "vscode.peekTestError",
  handler: async (accessor, extId) => {
    const lookup = accessor.get(ITestResultService).getStateById(extId);
    if (!lookup) {
      return false;
    }
    const [result, ownState] = lookup;
    const opener = accessor.get(ITestingPeekOpener);
    if (opener.tryPeekFirstError(result, ownState)) {
      return true;
    }
    for (const test of result.tests) {
      if (TestId.compare(ownState.item.extId, test.item.extId) === 2 /* IsChild */ && opener.tryPeekFirstError(result, test)) {
        return true;
      }
    }
    return false;
  }
});

CommandsRegistry.registerCommand({
  id: "vscode.revealTest",
  handler: async (accessor, extId, opts) => {
    const test = accessor.get(ITestService).collection.getNodeById(extId);
    if (!test) {
      return;
    }
    const commandService = accessor.get(ICommandService);
    const fileService = accessor.get(IFileService);
    const openerService = accessor.get(IOpenerService);
    const { range: range2, uri: uri5 } = test.item;
    if (!uri5) {
      return;
    }
    const position2 = accessor.get(ITestingDecorationsService).getDecoratedTestPosition(uri5, extId) || range2?.getStartPosition();
    accessor.get(ITestExplorerFilterState).reveal.set(extId, void 0);
    accessor.get(ITestingPeekOpener).closeAllPeeks();
    let isFile2 = true;
    try {
      if (!(await fileService.stat(uri5)).isFile) {
        isFile2 = false;
      }
    } catch {
    }
    if (!isFile2) {
      await commandService.executeCommand(REVEAL_IN_EXPLORER_COMMAND_ID, uri5);
      return;
    }
    await openerService.open(
      position2 ? uri5.with({ fragment: `L${position2.lineNumber}:${position2.column}` }) : uri5,
      {
        openToSide: opts?.openToSide,
        editorOptions: {
          preserveFocus: opts?.preserveFocus
        }
      }
    );
  }
});

CommandsRegistry.registerCommand({
  id: "vscode.runTestsById",
  handler: async (accessor, group2, ...testIds) => {
    const testService = accessor.get(ITestService);
    await discoverAndRunTests(
      accessor.get(ITestService).collection,
      accessor.get(IProgressService),
      testIds,
      (tests) => testService.runTests({ group: group2, tests })
    );
  }
});

CommandsRegistry.registerCommand({
  id: "vscode.testing.getControllersWithTests",
  handler: async (accessor) => {
    const testService = accessor.get(ITestService);
    return [...testService.collection.rootItems].filter((r2) => r2.children.size > 0).map((r2) => r2.controllerId);
  }
});

CommandsRegistry.registerCommand({
  id: "vscode.testing.getTestsInFile",
  handler: async (accessor, uri5) => {
    const testService = accessor.get(ITestService);
    return [...testService.collection.getNodeByUrl(uri5)].map((t2) => TestId.split(t2.item.extId));
  }
});

Registry.as(Extensions4.Configuration).registerConfiguration(testingConfiguration);
export { viewContainer, testResultsViewContainer, viewsRegistry3 };
