// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testExplorerActions.ts
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr, ContextKeyGreaterExpr } from "./module-0089.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId } from "./module-0092.mjs";
import { ITestService, expandAndGetTestById, testsInFile, testsUnderUri } from "./module-1435.mjs";
import { TestItemTreeElement } from "./module-3045.mjs";
import { ViewAction } from "./module-1335.mjs";
import { testingCancelIcon, testingCancelRefreshTests, testingContinuousIsOn, testingCoverageAllIcon, testingCoverageIcon, testingDebugAllIcon, testingDebugIcon, testingRefreshTests, testingRunAllIcon, testingRunIcon, testingTurnContinuousRunOff, testingTurnContinuousRunOn, testingUpdateProfiles } from "./module-3039.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITestProfileService, canUseProfileWithTest } from "./module-1429.mjs";
import { ITestingContinuousRunService } from "./module-3034.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { testConfigurationGroupNames } from "./module-1427.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ITestResultService } from "./module-1434.mjs";
import { Codicon } from "./module-0085.mjs";
import { IViewsService } from "./module-1246.mjs";
import { FocusedViewContext } from "./module-0949.mjs";
import { Range2 } from "./module-0106.mjs";
import { TestId } from "./module-1207.mjs";
import { Position } from "./module-0079.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IEditorService } from "./module-0934.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { getTestingConfiguration } from "./module-3023.mjs";
import { MessageController } from "./module-0542.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Iterable } from "./module-0011.mjs";
import { isDefined } from "./module-0010.mjs";
import { isFailedState } from "./module-1430.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { ITestingPeekOpener } from "./module-3036.mjs";
import { distinct } from "./module-0007.mjs";
import { widgetClose } from "./module-0479.mjs";
import { ITestCoverageService } from "./module-3024.mjs";
import { SymbolNavigationAction } from "./module-0647.mjs";
import { ReferencesModel } from "./module-0637.mjs";
import { PeekContext } from "./module-0623.mjs";


// src/vs/workbench/contrib/testing/browser/testExplorerActions.ts
var category4 = Categories.Test;

var hasAnyTestProvider = ContextKeyGreaterExpr.create(TestingContextKeys.providerCount.key, 0);

var LABEL_RUN_TESTS = localize2(21089, "Run Tests");

var LABEL_DEBUG_TESTS = localize2(21070, "Debug Tests");

var LABEL_COVERAGE_TESTS = localize2(21067, "Run Tests with Coverage");

var HideTestAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.hideTest" /* HideTestAction */,
      title: localize2(21074, "Hide Test"),
      menu: {
        id: MenuId.TestItem,
        group: "builtin@2",
        when: TestingContextKeys.testItemIsHidden.isEqualTo(false)
      }
    });
  }
  run(accessor, ...elements) {
    const service = accessor.get(ITestService);
    for (const element of elements) {
      service.excluded.toggle(element.test, true);
    }
    return Promise.resolve();
  }
};

var UnhideTestAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.unhideTest" /* UnhideTestAction */,
      title: localize2(21137, "Unhide Test"),
      menu: {
        id: MenuId.TestItem,
        order: 21 /* HideTest */,
        when: TestingContextKeys.testItemIsHidden.isEqualTo(true)
      }
    });
  }
  run(accessor, ...elements) {
    const service = accessor.get(ITestService);
    for (const element of elements) {
      if (element instanceof TestItemTreeElement) {
        service.excluded.toggle(element.test, false);
      }
    }
    return Promise.resolve();
  }
};

var UnhideAllTestsAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.unhideAllTests" /* UnhideAllTestsAction */,
      title: localize2(21136, "Unhide All Tests")
    });
  }
  run(accessor) {
    const service = accessor.get(ITestService);
    service.excluded.clear();
    return Promise.resolve();
  }
};

var testItemInlineAndInContext = (order, when) => [
  {
    id: MenuId.TestItem,
    group: "inline",
    order,
    when
  },
  {
    id: MenuId.TestItem,
    group: "builtin@1",
    order,
    when
  }
];

var RunVisibleAction = class extends ViewAction {
  constructor(bitset, desc) {
    super({
      ...desc,
      viewId: "workbench.view.testing" /* ExplorerViewId */
    });
    this.bitset = bitset;
  }
  /**
   * @override
   */
  runInView(accessor, view, ...elements) {
    const { include, exclude } = view.getTreeIncludeExclude(this.bitset, elements.map((e) => e.test));
    return accessor.get(ITestService).runTests({
      tests: include,
      exclude,
      group: this.bitset
    });
  }
};

var DebugAction = class extends RunVisibleAction {
  constructor() {
    super(4 /* Debug */, {
      id: "testing.debug" /* DebugAction */,
      title: localize2(21068, "Debug Test"),
      icon: testingDebugIcon,
      menu: testItemInlineAndInContext(12 /* Debug */, TestingContextKeys.hasDebuggableTests.isEqualTo(true))
    });
  }
};

var CoverageAction = class extends RunVisibleAction {
  constructor() {
    super(8 /* Coverage */, {
      id: "testing.coverage" /* RunWithCoverageAction */,
      title: localize2(21086, "Run Test with Coverage"),
      icon: testingCoverageIcon,
      menu: testItemInlineAndInContext(13 /* Coverage */, TestingContextKeys.hasCoverableTests.isEqualTo(true))
    });
  }
};

var RunUsingProfileAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.runUsing" /* RunUsingProfileAction */,
      title: localize2(21119, "Execute Using Profile..."),
      icon: testingDebugIcon,
      menu: {
        id: MenuId.TestItem,
        order: 15 /* RunUsing */,
        group: "builtin@2",
        when: TestingContextKeys.hasNonDefaultProfile.isEqualTo(true)
      }
    });
  }
  async run(acessor, ...elements) {
    const commandService = acessor.get(ICommandService);
    const testService = acessor.get(ITestService);
    const profile = await commandService.executeCommand("vscode.pickTestProfile", {
      onlyForTest: elements[0].test
    });
    if (!profile) {
      return;
    }
    testService.runResolvedTests({
      group: profile.group,
      targets: [{
        profileId: profile.profileId,
        controllerId: profile.controllerId,
        testIds: elements.filter((t2) => canUseProfileWithTest(profile, t2.test)).map((t2) => t2.test.item.extId)
      }]
    });
  }
};

var RunAction = class extends RunVisibleAction {
  constructor() {
    super(2 /* Run */, {
      id: "testing.run" /* RunAction */,
      title: localize2(21085, "Run Test"),
      icon: testingRunIcon,
      menu: testItemInlineAndInContext(11 /* Run */, TestingContextKeys.hasRunnableTests.isEqualTo(true))
    });
  }
};

var SelectDefaultTestProfiles = class extends Action2 {
  constructor() {
    super({
      id: "testing.selectDefaultTestProfiles" /* SelectDefaultTestProfiles */,
      title: localize2(21122, "Select Default Profile"),
      icon: testingUpdateProfiles,
      category: category4
    });
  }
  async run(acessor, onlyGroup) {
    const commands = acessor.get(ICommandService);
    const testProfileService = acessor.get(ITestProfileService);
    const profiles2 = await commands.executeCommand("vscode.pickMultipleTestProfiles", {
      showConfigureButtons: false,
      selected: testProfileService.getGroupDefaultProfiles(onlyGroup),
      onlyGroup
    });
    if (profiles2?.length) {
      testProfileService.setGroupDefaultProfiles(onlyGroup, profiles2);
    }
  }
};

var ContinuousRunTestAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.toggleContinuousRunForTest" /* ToggleContinousRunForTest */,
      title: localize2(21131, "Turn on Continuous Run"),
      icon: testingTurnContinuousRunOn,
      precondition: ContextKeyExpr.or(
        TestingContextKeys.isContinuousModeOn.isEqualTo(true),
        TestingContextKeys.isParentRunningContinuously.isEqualTo(false)
      ),
      toggled: {
        condition: TestingContextKeys.isContinuousModeOn.isEqualTo(true),
        icon: testingContinuousIsOn,
        title: localize(21130, null)
      },
      menu: testItemInlineAndInContext(2147483647 /* ContinuousRunTest */, TestingContextKeys.supportsContinuousRun.isEqualTo(true))
    });
  }
  async run(accessor, ...elements) {
    const crService = accessor.get(ITestingContinuousRunService);
    for (const element of elements) {
      const id2 = element.test.item.extId;
      if (crService.isSpecificallyEnabledFor(id2)) {
        crService.stop(id2);
        continue;
      }
      crService.start(2 /* Run */, id2);
    }
  }
};

var ContinuousRunUsingProfileTestAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.continuousRunUsingForTest" /* ContinousRunUsingForTest */,
      title: localize2(21128, "Start Continous Run Using..."),
      icon: testingDebugIcon,
      menu: [
        {
          id: MenuId.TestItem,
          order: 14 /* RunContinuous */,
          group: "builtin@2",
          when: ContextKeyExpr.and(
            TestingContextKeys.supportsContinuousRun.isEqualTo(true),
            TestingContextKeys.isContinuousModeOn.isEqualTo(false)
          )
        }
      ]
    });
  }
  async run(accessor, ...elements) {
    const crService = accessor.get(ITestingContinuousRunService);
    const profileService = accessor.get(ITestProfileService);
    const notificationService = accessor.get(INotificationService);
    const quickInputService = accessor.get(IQuickInputService);
    for (const element of elements) {
      const selected = await selectContinuousRunProfiles(
        crService,
        notificationService,
        quickInputService,
        [{ profiles: profileService.getControllerProfiles(element.test.controllerId) }]
      );
      if (selected.length) {
        crService.start(selected, element.test.item.extId);
      }
    }
  }
};

var ConfigureTestProfilesAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.configureProfile" /* ConfigureTestProfilesAction */,
      title: localize2(21095, "Configure Test Profiles"),
      icon: testingUpdateProfiles,
      f1: true,
      category: category4,
      menu: {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasConfigurableProfile.isEqualTo(true)
      }
    });
  }
  async run(acessor, onlyGroup) {
    const commands = acessor.get(ICommandService);
    const testProfileService = acessor.get(ITestProfileService);
    const profile = await commands.executeCommand("vscode.pickTestProfile", {
      placeholder: localize(21066, null),
      showConfigureButtons: false,
      onlyConfigurable: true,
      onlyGroup
    });
    if (profile) {
      testProfileService.configure(profile.controllerId, profile.profileId);
    }
  }
};

var continuousMenus = (whenIsContinuousOn) => [
  {
    id: MenuId.ViewTitle,
    group: "navigation",
    order: 15 /* RunUsing */,
    when: ContextKeyExpr.and(
      ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */),
      TestingContextKeys.supportsContinuousRun.isEqualTo(true),
      TestingContextKeys.isContinuousModeOn.isEqualTo(whenIsContinuousOn)
    )
  },
  {
    id: MenuId.CommandPalette,
    when: TestingContextKeys.supportsContinuousRun.isEqualTo(true)
  }
];

var StopContinuousRunAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.stopContinuousRun" /* StopContinousRun */,
      title: localize2(21129, "Stop Continuous Run"),
      category: category4,
      icon: testingTurnContinuousRunOff,
      menu: continuousMenus(true)
    });
  }
  run(accessor) {
    accessor.get(ITestingContinuousRunService).stop();
  }
};

function selectContinuousRunProfiles(crs, notificationService, quickInputService, profilesToPickFrom) {
  const items = [];
  for (const { controller, profiles: profiles2 } of profilesToPickFrom) {
    for (const profile of profiles2) {
      if (profile.supportsContinuousRun) {
        items.push({
          label: profile.label || controller?.label.get() || "",
          description: controller?.label.get(),
          profile
        });
      }
    }
  }
  if (items.length === 0) {
    notificationService.info(localize(21108, null));
    return Promise.resolve([]);
  }
  if (items.length === 1) {
    return Promise.resolve([items[0].profile]);
  }
  const qpItems = [];
  const selectedItems = [];
  const lastRun = crs.lastRunProfileIds;
  items.sort((a, b) => a.profile.group - b.profile.group || a.profile.controllerId.localeCompare(b.profile.controllerId) || a.label.localeCompare(b.label));
  for (let i2 = 0; i2 < items.length; i2++) {
    const item = items[i2];
    if (i2 === 0 || items[i2 - 1].profile.group !== item.profile.group) {
      qpItems.push({ type: "separator", label: testConfigurationGroupNames[item.profile.group] });
    }
    qpItems.push(item);
    if (lastRun.has(item.profile.profileId)) {
      selectedItems.push(item);
    }
  }
  const disposables = new DisposableStore();
  const quickpick = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
  quickpick.title = localize(21121, null);
  quickpick.canSelectMany = true;
  quickpick.items = qpItems;
  quickpick.selectedItems = selectedItems;
  quickpick.show();
  return new Promise((resolve3) => {
    disposables.add(quickpick.onDidAccept(() => {
      resolve3(quickpick.selectedItems.map((i2) => i2.profile));
      disposables.dispose();
    }));
    disposables.add(quickpick.onDidHide(() => {
      resolve3([]);
      disposables.dispose();
    }));
  });
}

var StartContinuousRunAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.startContinuousRun" /* StartContinousRun */,
      title: localize2(21127, "Start Continuous Run"),
      category: category4,
      icon: testingTurnContinuousRunOn,
      menu: continuousMenus(false)
    });
  }
  async run(accessor) {
    const crs = accessor.get(ITestingContinuousRunService);
    const profileService = accessor.get(ITestProfileService);
    const lastRunProfiles = [...profileService.all()].flatMap((p) => p.profiles.filter((p2) => crs.lastRunProfileIds.has(p2.profileId)));
    if (lastRunProfiles.length) {
      return crs.start(lastRunProfiles);
    }
    const selected = await selectContinuousRunProfiles(crs, accessor.get(INotificationService), accessor.get(IQuickInputService), accessor.get(ITestProfileService).all());
    if (selected.length) {
      crs.start(selected);
    }
  }
};

var ExecuteSelectedAction = class extends ViewAction {
  constructor(options3, group2) {
    super({
      ...options3,
      menu: [{
        id: MenuId.ViewTitle,
        order: group2 === 2 /* Run */ ? 11 /* Run */ : group2 === 4 /* Debug */ ? 12 /* Debug */ : 13 /* Coverage */,
        group: "navigation",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */),
          TestingContextKeys.isRunning.isEqualTo(false),
          TestingContextKeys.capabilityToContextKey[group2].isEqualTo(true)
        )
      }],
      category: category4,
      viewId: "workbench.view.testing" /* ExplorerViewId */
    });
    this.group = group2;
  }
  /**
   * @override
   */
  runInView(accessor, view) {
    const { include, exclude } = view.getTreeIncludeExclude(this.group);
    return accessor.get(ITestService).runTests({ tests: include, exclude, group: this.group });
  }
};

var GetSelectedProfiles = class extends Action2 {
  constructor() {
    super({ id: "testing.getSelectedProfiles" /* GetSelectedProfiles */, title: localize2(21073, "Get Selected Profiles") });
  }
  /**
   * @override
   */
  run(accessor) {
    const profiles2 = accessor.get(ITestProfileService);
    return [
      ...profiles2.getGroupDefaultProfiles(2 /* Run */),
      ...profiles2.getGroupDefaultProfiles(4 /* Debug */),
      ...profiles2.getGroupDefaultProfiles(8 /* Coverage */)
    ].map((p) => ({
      controllerId: p.controllerId,
      label: p.label,
      kind: p.group & 8 /* Coverage */ ? 3 /* Coverage */ : p.group & 4 /* Debug */ ? 2 /* Debug */ : 1 /* Run */
    }));
  }
};

var GetExplorerSelection = class extends ViewAction {
  constructor() {
    super({ id: "_testing.getExplorerSelection" /* GetExplorerSelection */, title: localize2(21072, "Get Explorer Selection"), viewId: "workbench.view.testing" /* ExplorerViewId */ });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    const { include, exclude } = view.getTreeIncludeExclude(2 /* Run */, void 0, "selected");
    const mapper = (i2) => i2.item.extId;
    return { include: include.map(mapper), exclude: exclude.map(mapper) };
  }
};

var RunSelectedAction = class extends ExecuteSelectedAction {
  constructor() {
    super({
      id: "testing.runSelected" /* RunSelectedAction */,
      title: LABEL_RUN_TESTS,
      icon: testingRunAllIcon
    }, 2 /* Run */);
  }
};

var DebugSelectedAction = class extends ExecuteSelectedAction {
  constructor() {
    super({
      id: "testing.debugSelected" /* DebugSelectedAction */,
      title: LABEL_DEBUG_TESTS,
      icon: testingDebugAllIcon
    }, 4 /* Debug */);
  }
};

var CoverageSelectedAction = class extends ExecuteSelectedAction {
  constructor() {
    super({
      id: "testing.coverageSelected" /* CoverageSelectedAction */,
      title: LABEL_COVERAGE_TESTS,
      icon: testingCoverageAllIcon
    }, 8 /* Coverage */);
  }
};

var showDiscoveringWhile = (progress, task) => {
  return progress.withProgress(
    {
      location: 10 /* Window */,
      title: localize(21071, null)
    },
    () => task
  );
};

var RunOrDebugAllTestsAction = class extends Action2 {
  constructor(options3, group2, noTestsFoundError) {
    super({
      ...options3,
      category: category4,
      menu: [{
        id: MenuId.CommandPalette,
        when: TestingContextKeys.capabilityToContextKey[group2].isEqualTo(true)
      }]
    });
    this.group = group2;
    this.noTestsFoundError = noTestsFoundError;
  }
  async run(accessor) {
    const testService = accessor.get(ITestService);
    const notifications = accessor.get(INotificationService);
    const roots = [...testService.collection.rootItems].filter((r2) => r2.children.size || r2.expand === 1 /* Expandable */ || r2.expand === 2 /* BusyExpanding */);
    if (!roots.length) {
      notifications.info(this.noTestsFoundError);
      return;
    }
    await testService.runTests({ tests: roots, group: this.group });
  }
};

var RunAllAction = class extends RunOrDebugAllTestsAction {
  constructor() {
    super(
      {
        id: "testing.runAll" /* RunAllAction */,
        title: localize2(21087, "Run All Tests"),
        icon: testingRunAllIcon,
        keybinding: {
          weight: 200 /* WorkbenchContrib */,
          primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 31 /* KeyA */)
        }
      },
      2 /* Run */,
      localize(21079, null)
    );
  }
};

var DebugAllAction = class extends RunOrDebugAllTestsAction {
  constructor() {
    super(
      {
        id: "testing.debugAll" /* DebugAllAction */,
        title: localize2(21069, "Debug All Tests"),
        icon: testingDebugIcon,
        keybinding: {
          weight: 200 /* WorkbenchContrib */,
          primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 31 /* KeyA */)
        }
      },
      4 /* Debug */,
      localize(21076, null)
    );
  }
};

var CoverageAllAction = class extends RunOrDebugAllTestsAction {
  constructor() {
    super(
      {
        id: "testing.coverageAll" /* RunAllWithCoverageAction */,
        title: localize2(21088, "Run All Tests with Coverage"),
        icon: testingCoverageIcon,
        keybinding: {
          weight: 200 /* WorkbenchContrib */,
          primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KeyA */)
        }
      },
      8 /* Coverage */,
      localize(21075, null)
    );
  }
};

var CancelTestRunAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.cancelRun" /* CancelTestRunAction */,
      title: localize2(21090, "Cancel Test Run"),
      icon: testingCancelIcon,
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 54 /* KeyX */)
      },
      menu: [{
        id: MenuId.ViewTitle,
        order: 11 /* Run */,
        group: "navigation",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */),
          ContextKeyExpr.equals(TestingContextKeys.isRunning.serialize(), true)
        )
      }, {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.isRunning
      }]
    });
  }
  /**
   * @override
   */
  async run(accessor, resultId, taskId) {
    const resultService = accessor.get(ITestResultService);
    const testService = accessor.get(ITestService);
    if (resultId) {
      testService.cancelTestRun(resultId, taskId);
    } else {
      for (const run of resultService.results) {
        if (!run.completedAt) {
          testService.cancelTestRun(run.id);
        }
      }
    }
  }
};

var TestingViewAsListAction = class extends ViewAction {
  constructor() {
    super({
      id: "testing.viewAsList" /* TestingViewAsListAction */,
      viewId: "workbench.view.testing" /* ExplorerViewId */,
      title: localize2(21134, "View as List"),
      toggled: TestingContextKeys.viewMode.isEqualTo("list" /* List */),
      menu: {
        id: MenuId.ViewTitle,
        order: 18 /* DisplayMode */,
        group: "viewAs",
        when: ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewMode = "list" /* List */;
  }
};

var TestingViewAsTreeAction = class extends ViewAction {
  constructor() {
    super({
      id: "testing.viewAsTree" /* TestingViewAsTreeAction */,
      viewId: "workbench.view.testing" /* ExplorerViewId */,
      title: localize2(21135, "View as Tree"),
      toggled: TestingContextKeys.viewMode.isEqualTo("true" /* Tree */),
      menu: {
        id: MenuId.ViewTitle,
        order: 18 /* DisplayMode */,
        group: "viewAs",
        when: ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewMode = "true" /* Tree */;
  }
};

var TestingSortByStatusAction = class extends ViewAction {
  constructor() {
    super({
      id: "testing.sortByStatus" /* TestingSortByStatusAction */,
      viewId: "workbench.view.testing" /* ExplorerViewId */,
      title: localize2(21126, "Sort by Status"),
      toggled: TestingContextKeys.viewSorting.isEqualTo("status" /* ByStatus */),
      menu: {
        id: MenuId.ViewTitle,
        order: 19 /* Sort */,
        group: "sortBy",
        when: ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewSorting = "status" /* ByStatus */;
  }
};

var TestingSortByLocationAction = class extends ViewAction {
  constructor() {
    super({
      id: "testing.sortByLocation" /* TestingSortByLocationAction */,
      viewId: "workbench.view.testing" /* ExplorerViewId */,
      title: localize2(21125, "Sort by Location"),
      toggled: TestingContextKeys.viewSorting.isEqualTo("location" /* ByLocation */),
      menu: {
        id: MenuId.ViewTitle,
        order: 19 /* Sort */,
        group: "sortBy",
        when: ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewSorting = "location" /* ByLocation */;
  }
};

var TestingSortByDurationAction = class extends ViewAction {
  constructor() {
    super({
      id: "testing.sortByDuration" /* TestingSortByDurationAction */,
      viewId: "workbench.view.testing" /* ExplorerViewId */,
      title: localize2(21124, "Sort by Duration"),
      toggled: TestingContextKeys.viewSorting.isEqualTo("duration" /* ByDuration */),
      menu: {
        id: MenuId.ViewTitle,
        order: 19 /* Sort */,
        group: "sortBy",
        when: ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.viewSorting = "duration" /* ByDuration */;
  }
};

var ShowMostRecentOutputAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.showMostRecentOutput" /* ShowMostRecentOutputAction */,
      title: localize2(21123, "Show Output"),
      category: category4,
      icon: Codicon.terminal,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 45 /* KeyO */)
      },
      precondition: TestingContextKeys.hasAnyResults.isEqualTo(true),
      menu: [{
        id: MenuId.ViewTitle,
        order: 16 /* Collapse */,
        group: "navigation",
        when: ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */)
      }, {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }]
    });
  }
  async run(accessor) {
    const viewService = accessor.get(IViewsService);
    const testView = await viewService.openView("workbench.panel.testResults.view" /* ResultsViewId */, true);
    testView?.showLatestRun();
  }
};

var CollapseAllAction2 = class extends ViewAction {
  constructor() {
    super({
      id: "testing.collapseAll" /* CollapseAllAction */,
      viewId: "workbench.view.testing" /* ExplorerViewId */,
      title: localize2(21094, "Collapse All Tests"),
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        order: 16 /* Collapse */,
        group: "displayAction",
        when: ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */)
      }
    });
  }
  /**
   * @override
   */
  runInView(_accessor, view) {
    view.viewModel.collapseAll();
  }
};

var ClearTestResultsAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.clearTestResults" /* ClearTestResultsAction */,
      title: localize2(21093, "Clear All Results"),
      category: category4,
      icon: Codicon.clearAll,
      menu: [{
        id: MenuId.TestPeekTitle
      }, {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }, {
        id: MenuId.ViewTitle,
        order: 17 /* ClearResults */,
        group: "displayAction",
        when: ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */)
      }, {
        id: MenuId.ViewTitle,
        order: 17 /* ClearResults */,
        group: "navigation",
        when: ContextKeyExpr.equals("view", "workbench.panel.testResults.view" /* ResultsViewId */)
      }]
    });
  }
  /**
   * @override
   */
  run(accessor) {
    accessor.get(ITestResultService).clear();
  }
};

var GoToTest = class extends Action2 {
  constructor() {
    super({
      id: "testing.editFocusedTest" /* GoToTest */,
      title: localize2(21104, "Go to Test"),
      icon: Codicon.goToFile,
      menu: {
        id: MenuId.TestItem,
        group: "builtin@1",
        order: 20 /* GoToTest */,
        when: TestingContextKeys.testItemHasUri.isEqualTo(true)
      },
      keybinding: {
        weight: 100 /* EditorContrib */ - 10,
        when: FocusedViewContext.isEqualTo("workbench.view.testing" /* ExplorerViewId */),
        primary: 3 /* Enter */ | 512 /* Alt */
      }
    });
  }
  async run(accessor, element, preserveFocus) {
    if (!element) {
      const view = accessor.get(IViewsService).getActiveViewWithId("workbench.view.testing" /* ExplorerViewId */);
      element = view?.focusedTreeElements[0];
    }
    if (element && element instanceof TestItemTreeElement) {
      accessor.get(ICommandService).executeCommand("vscode.revealTest", element.test.item.extId, preserveFocus);
    }
  }
};

async function getTestsAtCursor(testService, uriIdentityService, uri5, position2, filter2) {
  let bestNodes = [];
  let bestRange;
  let bestNodesBefore = [];
  let bestRangeBefore;
  for await (const tests of testsInFile(testService, uriIdentityService, uri5)) {
    for (const test of tests) {
      if (!test.item.range || filter2?.(test) === false) {
        continue;
      }
      const irange = Range2.lift(test.item.range);
      if (irange.containsPosition(position2)) {
        if (bestRange && Range2.equalsRange(test.item.range, bestRange)) {
          if (!bestNodes.some((b) => TestId.isChild(b.item.extId, test.item.extId))) {
            bestNodes.push(test);
          }
        } else {
          bestRange = irange;
          bestNodes = [test];
        }
      } else if (Position.isBefore(irange.getStartPosition(), position2)) {
        if (!bestRangeBefore || bestRangeBefore.getStartPosition().isBefore(irange.getStartPosition())) {
          bestRangeBefore = irange;
          bestNodesBefore = [test];
        } else if (irange.equalsRange(bestRangeBefore) && !bestNodesBefore.some((b) => TestId.isChild(b.item.extId, test.item.extId))) {
          bestNodesBefore.push(test);
        }
      }
    }
  }
  return bestNodes.length ? bestNodes : bestNodesBefore;
}

var ExecuteTestAtCursor = class extends Action2 {
  constructor(options3, group2) {
    super({
      ...options3,
      menu: [{
        id: MenuId.CommandPalette,
        when: hasAnyTestProvider
      }, {
        id: MenuId.EditorContext,
        group: "testing",
        order: group2 === 2 /* Run */ ? 0 /* RunAtCursor */ : 1 /* DebugAtCursor */,
        when: ContextKeyExpr.and(TestingContextKeys.activeEditorHasTests, TestingContextKeys.capabilityToContextKey[group2])
      }]
    });
    this.group = group2;
  }
  /**
   * @override
   */
  async run(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    let editor = codeEditorService.getActiveCodeEditor();
    if (!activeEditorPane || !editor) {
      return;
    }
    if (editor instanceof EmbeddedCodeEditorWidget) {
      editor = editor.getParentEditor();
    }
    const position2 = editor?.getPosition();
    const model = editor?.getModel();
    if (!position2 || !model || !("uri" in model)) {
      return;
    }
    const testService = accessor.get(ITestService);
    const profileService = accessor.get(ITestProfileService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    const progressService = accessor.get(IProgressService);
    const configurationService = accessor.get(IConfigurationService);
    const saveBeforeTest = getTestingConfiguration(configurationService, "testing.saveBeforeTest" /* SaveBeforeTest */);
    if (saveBeforeTest) {
      await editorService.save({ editor: activeEditorPane.input, groupId: activeEditorPane.group.id });
      await testService.syncTests();
    }
    const testsToRun = await showDiscoveringWhile(
      progressService,
      getTestsAtCursor(
        testService,
        uriIdentityService,
        model.uri,
        position2,
        (test) => !!(profileService.capabilitiesForTest(test.item) & this.group)
      )
    );
    if (testsToRun.length) {
      await testService.runTests({ group: this.group, tests: testsToRun });
      return;
    }
    const relatedTests = await testService.getTestsRelatedToCode(model.uri, position2);
    if (relatedTests.length) {
      await testService.runTests({ group: this.group, tests: relatedTests });
      return;
    }
    if (editor) {
      MessageController.get(editor)?.showMessage(localize(21081, null), position2);
    }
  }
};

var RunAtCursor = class extends ExecuteTestAtCursor {
  constructor() {
    super({
      id: "testing.runAtCursor" /* RunAtCursor */,
      title: localize2(21117, "Run Test at Cursor"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 33 /* KeyC */)
      }
    }, 2 /* Run */);
  }
};

var DebugAtCursor = class extends ExecuteTestAtCursor {
  constructor() {
    super({
      id: "testing.debugAtCursor" /* DebugAtCursor */,
      title: localize2(21099, "Debug Test at Cursor"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 33 /* KeyC */)
      }
    }, 4 /* Debug */);
  }
};

var CoverageAtCursor = class extends ExecuteTestAtCursor {
  constructor() {
    super({
      id: "testing.coverageAtCursor" /* CoverageAtCursor */,
      title: localize2(21096, "Run Test at Cursor with Coverage"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KeyC */)
      }
    }, 8 /* Coverage */);
  }
};

var ExecuteTestsUnderUriAction = class extends Action2 {
  constructor(options3, group2) {
    super({
      ...options3,
      menu: [{
        id: MenuId.ExplorerContext,
        when: TestingContextKeys.capabilityToContextKey[group2].isEqualTo(true),
        group: "6.5_testing",
        order: (group2 === 2 /* Run */ ? 11 /* Run */ : 12 /* Debug */) + 0.1
      }]
    });
    this.group = group2;
  }
  async run(accessor, uri5) {
    const testService = accessor.get(ITestService);
    const notificationService = accessor.get(INotificationService);
    const tests = await Iterable.asyncToArray(testsUnderUri(
      testService,
      accessor.get(IUriIdentityService),
      uri5
    ));
    if (!tests.length) {
      notificationService.notify({ message: localize(21080, null), severity: Severity2.Info });
      return;
    }
    return testService.runTests({ tests, group: this.group });
  }
};

var RunTestsUnderUri = class extends ExecuteTestsUnderUriAction {
  constructor() {
    super({
      id: "testing.run.uri" /* RunByUri */,
      title: LABEL_RUN_TESTS,
      category: category4
    }, 2 /* Run */);
  }
};

var DebugTestsUnderUri = class extends ExecuteTestsUnderUriAction {
  constructor() {
    super({
      id: "testing.debug.uri" /* DebugByUri */,
      title: LABEL_DEBUG_TESTS,
      category: category4
    }, 4 /* Debug */);
  }
};

var CoverageTestsUnderUri = class extends ExecuteTestsUnderUriAction {
  constructor() {
    super({
      id: "testing.coverage.uri" /* CoverageByUri */,
      title: LABEL_COVERAGE_TESTS,
      category: category4
    }, 8 /* Coverage */);
  }
};

var ExecuteTestsInCurrentFile = class extends Action2 {
  constructor(options3, group2) {
    super({
      ...options3,
      menu: [{
        id: MenuId.CommandPalette,
        when: TestingContextKeys.capabilityToContextKey[group2].isEqualTo(true)
      }, {
        id: MenuId.EditorContext,
        group: "testing",
        order: group2 === 2 /* Run */ ? 2 /* RunInFile */ : 3 /* DebugInFile */,
        when: ContextKeyExpr.and(TestingContextKeys.activeEditorHasTests, TestingContextKeys.capabilityToContextKey[group2])
      }]
    });
    this.group = group2;
  }
  async _runByUris(accessor, files) {
    const uriIdentity = accessor.get(IUriIdentityService);
    const testService = accessor.get(ITestService);
    const discovered = [];
    for (const uri5 of files) {
      for await (const files2 of testsInFile(testService, uriIdentity, uri5, void 0, true)) {
        for (const file of files2) {
          discovered.push(file);
        }
      }
    }
    if (discovered.length) {
      const r2 = await testService.runTests({ tests: discovered, group: this.group });
      return { completedAt: r2.completedAt };
    }
    return { completedAt: void 0 };
  }
  /**
   * @override
   */
  run(accessor, files) {
    if (files?.length) {
      return this._runByUris(accessor, files);
    }
    const uriIdentity = accessor.get(IUriIdentityService);
    let editor = accessor.get(ICodeEditorService).getActiveCodeEditor();
    if (!editor) {
      return;
    }
    if (editor instanceof EmbeddedCodeEditorWidget) {
      editor = editor.getParentEditor();
    }
    const position2 = editor?.getPosition();
    const model = editor?.getModel();
    if (!position2 || !model || !("uri" in model)) {
      return;
    }
    const testService = accessor.get(ITestService);
    const queue = [testService.collection.rootIds];
    const discovered = [];
    while (queue.length) {
      for (const id2 of queue.pop()) {
        const node = testService.collection.getNodeById(id2);
        if (uriIdentity.extUri.isEqual(node.item.uri, model.uri)) {
          discovered.push(node);
        } else {
          queue.push(node.children);
        }
      }
    }
    if (discovered.length) {
      return testService.runTests({
        tests: discovered,
        group: this.group
      });
    }
    if (editor) {
      MessageController.get(editor)?.showMessage(localize(21082, null), position2);
    }
    return void 0;
  }
};

var RunCurrentFile = class extends ExecuteTestsInCurrentFile {
  constructor() {
    super({
      id: "testing.runCurrentFile" /* RunCurrentFile */,
      title: localize2(21118, "Run Tests in Current File"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 36 /* KeyF */)
      }
    }, 2 /* Run */);
  }
};

var DebugCurrentFile = class extends ExecuteTestsInCurrentFile {
  constructor() {
    super({
      id: "testing.debugCurrentFile" /* DebugCurrentFile */,
      title: localize2(21100, "Debug Tests in Current File"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 36 /* KeyF */)
      }
    }, 4 /* Debug */);
  }
};

var CoverageCurrentFile = class extends ExecuteTestsInCurrentFile {
  constructor() {
    super({
      id: "testing.coverageCurrentFile" /* CoverageCurrentFile */,
      title: localize2(21097, "Run Tests with Coverage in Current File"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KeyF */)
      }
    }, 8 /* Coverage */);
  }
};

var discoverAndRunTests = async (collection, progress, ids, runTests) => {
  const todo = Promise.all(ids.map((p) => expandAndGetTestById(collection, p)));
  const tests = (await showDiscoveringWhile(progress, todo)).filter(isDefined);
  return tests.length ? await runTests(tests) : void 0;
};

var RunOrDebugExtsByPath = class extends Action2 {
  /**
   * @override
   */
  async run(accessor, ...args2) {
    const testService = accessor.get(ITestService);
    await discoverAndRunTests(
      accessor.get(ITestService).collection,
      accessor.get(IProgressService),
      [...this.getTestExtIdsToRun(accessor, ...args2)],
      (tests) => this.runTest(testService, tests)
    );
  }
};

var RunOrDebugFailedTests = class extends RunOrDebugExtsByPath {
  constructor(options3) {
    super({
      ...options3,
      menu: {
        id: MenuId.CommandPalette,
        when: hasAnyTestProvider
      }
    });
  }
  /**
   * @inheritdoc
   */
  getTestExtIdsToRun(accessor) {
    const { results } = accessor.get(ITestResultService);
    const ids = /* @__PURE__ */ new Set();
    for (let i2 = results.length - 1; i2 >= 0; i2--) {
      const resultSet = results[i2];
      for (const test of resultSet.tests) {
        if (isFailedState(test.ownComputedState)) {
          ids.add(test.item.extId);
        } else {
          ids.delete(test.item.extId);
        }
      }
    }
    return ids;
  }
};

var RunOrDebugLastRun = class extends Action2 {
  constructor(options3) {
    super({
      ...options3,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          hasAnyTestProvider,
          TestingContextKeys.hasAnyResults.isEqualTo(true)
        )
      }
    });
  }
  getLastTestRunRequest(accessor, runId) {
    const resultService = accessor.get(ITestResultService);
    const lastResult = runId ? resultService.results.find((r2) => r2.id === runId) : resultService.results[0];
    return lastResult?.request;
  }
  /** @inheritdoc */
  async run(accessor, runId) {
    const resultService = accessor.get(ITestResultService);
    const lastResult = runId ? resultService.results.find((r2) => r2.id === runId) : resultService.results[0];
    if (!lastResult) {
      return;
    }
    const req = lastResult.request;
    const testService = accessor.get(ITestService);
    const profileService = accessor.get(ITestProfileService);
    const profileExists = (t2) => profileService.getControllerProfiles(t2.controllerId).some((p) => p.profileId === t2.profileId);
    await discoverAndRunTests(
      testService.collection,
      accessor.get(IProgressService),
      req.targets.flatMap((t2) => t2.testIds),
      (tests) => {
        if (this.getGroup() & req.group && req.targets.every(profileExists)) {
          return testService.runResolvedTests({
            targets: req.targets,
            group: req.group,
            exclude: req.exclude
          });
        } else {
          return testService.runTests({ tests, group: this.getGroup() });
        }
      }
    );
  }
};

var ReRunFailedTests = class extends RunOrDebugFailedTests {
  constructor() {
    super({
      id: "testing.reRunFailTests" /* ReRunFailedTests */,
      title: localize2(21115, "Rerun Failed Tests"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 35 /* KeyE */)
      }
    });
  }
  runTest(service, internalTests) {
    return service.runTests({
      group: 2 /* Run */,
      tests: internalTests
    });
  }
};

var DebugFailedTests = class extends RunOrDebugFailedTests {
  constructor() {
    super({
      id: "testing.debugFailTests" /* DebugFailedTests */,
      title: localize2(21102, "Debug Failed Tests"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 35 /* KeyE */)
      }
    });
  }
  runTest(service, internalTests) {
    return service.runTests({
      group: 4 /* Debug */,
      tests: internalTests
    });
  }
};

var ReRunLastRun = class extends RunOrDebugLastRun {
  constructor() {
    super({
      id: "testing.reRunLastRun" /* ReRunLastRun */,
      title: localize2(21116, "Rerun Last Run"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 42 /* KeyL */)
      }
    });
  }
  getGroup() {
    return 2 /* Run */;
  }
};

var DebugLastRun = class extends RunOrDebugLastRun {
  constructor() {
    super({
      id: "testing.debugLastRun" /* DebugLastRun */,
      title: localize2(21103, "Debug Last Run"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 42 /* KeyL */)
      }
    });
  }
  getGroup() {
    return 4 /* Debug */;
  }
};

var CoverageLastRun = class extends RunOrDebugLastRun {
  constructor() {
    super({
      id: "testing.coverageLastRun" /* CoverageLastRun */,
      title: localize2(21098, "Rerun Last Run with Coverage"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 42 /* KeyL */)
      }
    });
  }
  getGroup() {
    return 8 /* Coverage */;
  }
};

var RunOrDebugFailedFromLastRun = class extends Action2 {
  constructor(options3) {
    super({
      ...options3,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          hasAnyTestProvider,
          TestingContextKeys.hasAnyResults.isEqualTo(true)
        )
      }
    });
  }
  /** @inheritdoc */
  async run(accessor, runId) {
    const resultService = accessor.get(ITestResultService);
    const testService = accessor.get(ITestService);
    const progressService = accessor.get(IProgressService);
    const lastResult = runId ? resultService.results.find((r2) => r2.id === runId) : resultService.results[0];
    if (!lastResult) {
      return;
    }
    const failedTestIds = /* @__PURE__ */ new Set();
    for (const test of lastResult.tests) {
      if (isFailedState(test.ownComputedState)) {
        failedTestIds.add(test.item.extId);
      }
    }
    if (failedTestIds.size === 0) {
      return;
    }
    await discoverAndRunTests(
      testService.collection,
      progressService,
      Array.from(failedTestIds),
      (tests) => testService.runTests({ tests, group: this.getGroup() })
    );
  }
};

var ReRunFailedFromLastRun = class extends RunOrDebugFailedFromLastRun {
  constructor() {
    super({
      id: "testing.reRunFailedFromLastRun" /* ReRunFailedFromLastRun */,
      title: localize2(21114, "Rerun Failed Tests from Last Run"),
      category: category4
    });
  }
  getGroup() {
    return 2 /* Run */;
  }
};

var DebugFailedFromLastRun = class extends RunOrDebugFailedFromLastRun {
  constructor() {
    super({
      id: "testing.debugFailedFromLastRun" /* DebugFailedFromLastRun */,
      title: localize2(21101, "Debug Failed Tests from Last Run"),
      category: category4
    });
  }
  getGroup() {
    return 4 /* Debug */;
  }
};

var SearchForTestExtension = class extends Action2 {
  constructor() {
    super({
      id: "testing.searchForTestExtension" /* SearchForTestExtension */,
      title: localize2(21120, "Search for Test Extension")
    });
  }
  async run(accessor) {
    accessor.get(IExtensionsWorkbenchService).openSearch('@category:"testing"');
  }
};

var OpenOutputPeek = class extends Action2 {
  constructor() {
    super({
      id: "testing.openOutputPeek" /* OpenOutputPeek */,
      title: localize2(21110, "Peek Output"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 43 /* KeyM */)
      },
      menu: {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }
    });
  }
  async run(accessor) {
    accessor.get(ITestingPeekOpener).open();
  }
};

var ToggleInlineTestOutput = class extends Action2 {
  constructor() {
    super({
      id: "testing.toggleInlineTestOutput" /* ToggleInlineTestOutput */,
      title: localize2(21132, "Toggle Inline Test Output"),
      category: category4,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 39 /* KeyI */)
      },
      menu: {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }
    });
  }
  async run(accessor) {
    const testService = accessor.get(ITestService);
    testService.showInlineOutput.value = !testService.showInlineOutput.value;
  }
};

var refreshMenus = (whenIsRefreshing) => [
  {
    id: MenuId.TestItem,
    group: "inline",
    order: 10 /* Refresh */,
    when: ContextKeyExpr.and(
      TestingContextKeys.canRefreshTests.isEqualTo(true),
      TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)
    )
  },
  {
    id: MenuId.ViewTitle,
    group: "navigation",
    order: 10 /* Refresh */,
    when: ContextKeyExpr.and(
      ContextKeyExpr.equals("view", "workbench.view.testing" /* ExplorerViewId */),
      TestingContextKeys.canRefreshTests.isEqualTo(true),
      TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)
    )
  },
  {
    id: MenuId.CommandPalette,
    when: TestingContextKeys.canRefreshTests.isEqualTo(true)
  }
];

var RefreshTestsAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.refreshTests" /* RefreshTestsAction */,
      title: localize2(21113, "Refresh Tests"),
      category: category4,
      icon: testingRefreshTests,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 85 /* Semicolon */, 2048 /* CtrlCmd */ | 48 /* KeyR */),
        when: TestingContextKeys.canRefreshTests.isEqualTo(true)
      },
      menu: refreshMenus(false)
    });
  }
  async run(accessor, ...elements) {
    const testService = accessor.get(ITestService);
    const progressService = accessor.get(IProgressService);
    const controllerIds = distinct(elements.filter(isDefined).map((e) => e.test.controllerId));
    return progressService.withProgress({ location: "workbench.view.extension.test" /* ViewletId */ }, async () => {
      if (controllerIds.length) {
        await Promise.all(controllerIds.map((id2) => testService.refreshTests(id2)));
      } else {
        await testService.refreshTests();
      }
    });
  }
};

var CancelTestRefreshAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.cancelTestRefresh" /* CancelTestRefreshAction */,
      title: localize2(21091, "Cancel Test Refresh"),
      category: category4,
      icon: testingCancelRefreshTests,
      menu: refreshMenus(true)
    });
  }
  async run(accessor) {
    accessor.get(ITestService).cancelRefreshTests();
  }
};

var CleareCoverage = class extends Action2 {
  constructor() {
    super({
      id: "testing.coverage.close" /* CoverageClear */,
      title: localize2(21092, "Clear Coverage"),
      icon: widgetClose,
      category: category4,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 10 /* Refresh */,
        when: ContextKeyExpr.equals("view", "workbench.view.testCoverage" /* CoverageViewId */)
      }, {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.isTestCoverageOpen.isEqualTo(true)
      }]
    });
  }
  run(accessor) {
    accessor.get(ITestCoverageService).closeCoverage();
  }
};

var OpenCoverage = class extends Action2 {
  constructor() {
    super({
      id: "testing.openCoverage" /* OpenCoverage */,
      title: localize2(21109, "Open Coverage"),
      category: category4,
      menu: [{
        id: MenuId.CommandPalette,
        when: TestingContextKeys.hasAnyResults.isEqualTo(true)
      }]
    });
  }
  run(accessor) {
    const results = accessor.get(ITestResultService).results;
    const task = results.length && results[0].tasks.find((r2) => r2.coverage);
    if (!task) {
      const notificationService = accessor.get(INotificationService);
      notificationService.info(localize(21107, null));
      return;
    }
    accessor.get(ITestCoverageService).openCoverage(task, true);
  }
};

var TestNavigationAction = class extends SymbolNavigationAction {
  runEditorCommand(accessor, editor, ...args2) {
    this.testService = accessor.get(ITestService);
    this.uriIdentityService = accessor.get(IUriIdentityService);
    return super.runEditorCommand(accessor, editor, ...args2);
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(67 /* gotoLocation */).alternativeTestsCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(67 /* gotoLocation */).multipleTests || "peek";
  }
};

var GoToRelatedTestAction = class extends TestNavigationAction {
  async _getLocationModel(_languageFeaturesService, model, position2, token) {
    const tests = await this.testService.getTestsRelatedToCode(model.uri, position2, token);
    return new ReferencesModel(
      tests.map((t2) => t2.item.uri && { uri: t2.item.uri, range: t2.item.range || new Range2(1, 1, 1, 1) }).filter(isDefined),
      localize(21084, null)
    );
  }
  _getNoResultFoundMessage() {
    return localize(21078, null);
  }
};

var GoToRelatedTest = class extends GoToRelatedTestAction {
  constructor() {
    super({
      openToSide: false,
      openInPeek: false,
      muteMessage: false
    }, {
      id: "testing.goToRelatedTest" /* GoToRelatedTest */,
      title: localize2(21106, "Go to Related Test"),
      category: category4,
      precondition: ContextKeyExpr.and(
        // todo@connor4312: make this more explicit based on cursor position
        ContextKeyExpr.not(TestingContextKeys.activeEditorHasTests.key),
        TestingContextKeys.canGoToRelatedTest
      ),
      menu: [{
        id: MenuId.EditorContext,
        group: "testing",
        order: 4 /* GoToRelated */
      }]
    });
  }
};

var PeekRelatedTest = class extends GoToRelatedTestAction {
  constructor() {
    super({
      openToSide: false,
      openInPeek: true,
      muteMessage: false
    }, {
      id: "testing.peekRelatedTest" /* PeekRelatedTest */,
      title: localize2(21112, "Peek Related Test"),
      category: category4,
      precondition: ContextKeyExpr.and(
        TestingContextKeys.canGoToRelatedTest,
        // todo@connor4312: make this more explicit based on cursor position
        ContextKeyExpr.not(TestingContextKeys.activeEditorHasTests.key),
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      menu: [{
        id: MenuId.EditorContext,
        group: "testing",
        order: 5 /* PeekRelated */
      }]
    });
  }
};

var GoToRelatedCodeAction = class extends TestNavigationAction {
  async _getLocationModel(_languageFeaturesService, model, position2, token) {
    const testsAtCursor = await getTestsAtCursor(this.testService, this.uriIdentityService, model.uri, position2);
    const code = await Promise.all(testsAtCursor.map((t2) => this.testService.getCodeRelatedToTest(t2)));
    return new ReferencesModel(code.flat(), localize(21083, null));
  }
  _getNoResultFoundMessage() {
    return localize(21077, null);
  }
};

var GoToRelatedCode = class extends GoToRelatedCodeAction {
  constructor() {
    super({
      openToSide: false,
      openInPeek: false,
      muteMessage: false
    }, {
      id: "testing.goToRelatedCode" /* GoToRelatedCode */,
      title: localize2(21105, "Go to Related Code"),
      category: category4,
      precondition: ContextKeyExpr.and(
        TestingContextKeys.activeEditorHasTests,
        TestingContextKeys.canGoToRelatedCode
      ),
      menu: [{
        id: MenuId.EditorContext,
        group: "testing",
        order: 4 /* GoToRelated */
      }]
    });
  }
};

var PeekRelatedCode = class extends GoToRelatedCodeAction {
  constructor() {
    super({
      openToSide: false,
      openInPeek: true,
      muteMessage: false
    }, {
      id: "testing.peekRelatedCode" /* PeekRelatedCode */,
      title: localize2(21111, "Peek Related Code"),
      category: category4,
      precondition: ContextKeyExpr.and(
        TestingContextKeys.activeEditorHasTests,
        TestingContextKeys.canGoToRelatedCode,
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      menu: [{
        id: MenuId.EditorContext,
        group: "testing",
        order: 5 /* PeekRelated */
      }]
    });
  }
};

var ToggleResultsViewLayoutAction = class extends Action2 {
  constructor() {
    super({
      id: "testing.toggleResultsViewLayout" /* ToggleResultsViewLayoutAction */,
      title: localize2(21133, "Toggle Tree Position"),
      category: category4,
      icon: Codicon.arrowSwap,
      menu: {
        id: MenuId.ViewTitle,
        order: 18 /* DisplayMode */,
        group: "navigation",
        when: ContextKeyExpr.equals("view", "workbench.panel.testResults.view" /* ResultsViewId */)
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const currentLayout = getTestingConfiguration(configurationService, "testing.resultsView.layout" /* ResultsViewLayout */);
    const newLayout = currentLayout === "treeLeft" /* TreeLeft */ ? "treeRight" /* TreeRight */ : "treeLeft" /* TreeLeft */;
    await configurationService.updateValue("testing.resultsView.layout" /* ResultsViewLayout */, newLayout);
  }
};

var allTestActions = [
  CancelTestRefreshAction,
  CancelTestRunAction,
  CleareCoverage,
  ClearTestResultsAction,
  CollapseAllAction2,
  ConfigureTestProfilesAction,
  ContinuousRunTestAction,
  ContinuousRunUsingProfileTestAction,
  CoverageAction,
  CoverageAllAction,
  CoverageAtCursor,
  CoverageCurrentFile,
  CoverageLastRun,
  CoverageSelectedAction,
  CoverageTestsUnderUri,
  DebugAction,
  DebugAllAction,
  DebugAtCursor,
  DebugCurrentFile,
  DebugFailedTests,
  DebugLastRun,
  DebugSelectedAction,
  DebugTestsUnderUri,
  GetExplorerSelection,
  GetSelectedProfiles,
  GoToRelatedCode,
  GoToRelatedTest,
  GoToTest,
  HideTestAction,
  OpenCoverage,
  OpenOutputPeek,
  PeekRelatedCode,
  PeekRelatedTest,
  RefreshTestsAction,
  ReRunFailedTests,
  ReRunLastRun,
  RunAction,
  RunAllAction,
  RunAtCursor,
  RunCurrentFile,
  RunSelectedAction,
  RunTestsUnderUri,
  RunUsingProfileAction,
  SearchForTestExtension,
  SelectDefaultTestProfiles,
  ShowMostRecentOutputAction,
  StartContinuousRunAction,
  StopContinuousRunAction,
  TestingSortByDurationAction,
  TestingSortByLocationAction,
  TestingSortByStatusAction,
  TestingViewAsListAction,
  TestingViewAsTreeAction,
  ToggleInlineTestOutput,
  ToggleResultsViewLayoutAction,
  UnhideAllTestsAction,
  UnhideTestAction,
  ReRunFailedFromLastRun,
  DebugFailedFromLastRun
];
export { selectContinuousRunProfiles, getTestsAtCursor, category4, hasAnyTestProvider, LABEL_RUN_TESTS, LABEL_DEBUG_TESTS, LABEL_COVERAGE_TESTS, HideTestAction, UnhideTestAction, UnhideAllTestsAction, testItemInlineAndInContext, RunVisibleAction, DebugAction, CoverageAction, RunUsingProfileAction, RunAction, SelectDefaultTestProfiles, ContinuousRunTestAction, ContinuousRunUsingProfileTestAction, ConfigureTestProfilesAction, continuousMenus, StopContinuousRunAction, StartContinuousRunAction, ExecuteSelectedAction, GetSelectedProfiles, GetExplorerSelection, RunSelectedAction, DebugSelectedAction, CoverageSelectedAction, showDiscoveringWhile, RunOrDebugAllTestsAction, RunAllAction, DebugAllAction, CoverageAllAction, CancelTestRunAction, TestingViewAsListAction, TestingViewAsTreeAction, TestingSortByStatusAction, TestingSortByLocationAction, TestingSortByDurationAction, ShowMostRecentOutputAction, CollapseAllAction2, ClearTestResultsAction, GoToTest, ExecuteTestAtCursor, RunAtCursor, DebugAtCursor, CoverageAtCursor, ExecuteTestsUnderUriAction, RunTestsUnderUri, DebugTestsUnderUri, CoverageTestsUnderUri, ExecuteTestsInCurrentFile, RunCurrentFile, DebugCurrentFile, CoverageCurrentFile, discoverAndRunTests, RunOrDebugExtsByPath, RunOrDebugFailedTests, RunOrDebugLastRun, ReRunFailedTests, DebugFailedTests, ReRunLastRun, DebugLastRun, CoverageLastRun, RunOrDebugFailedFromLastRun, ReRunFailedFromLastRun, DebugFailedFromLastRun, SearchForTestExtension, OpenOutputPeek, ToggleInlineTestOutput, refreshMenus, RefreshTestsAction, CancelTestRefreshAction, CleareCoverage, OpenCoverage, TestNavigationAction, GoToRelatedTestAction, GoToRelatedTest, PeekRelatedTest, GoToRelatedCodeAction, GoToRelatedCode, PeekRelatedCode, ToggleResultsViewLayoutAction, allTestActions };
