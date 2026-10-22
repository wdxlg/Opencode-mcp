// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testingExplorerView.ts
import { ViewPane } from "./module-1335.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { RunOnceScheduler, disposableTimeout } from "./module-0036.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { isDefined } from "./module-0010.mjs";
import { ITestProfileService, canUseProfileWithTest } from "./module-1429.mjs";
import { TestItemTreeElement, TestTreeErrorMessage } from "./module-3045.mjs";
import { registerNavigableContainer } from "./module-1369.mjs";
import { $, addStandardDisposableListener, append, clearNode, h, reset } from "./module-0075.mjs";
import { TestingExplorerFilter } from "./module-3076.mjs";
import { Action, ActionRunner, Separator, toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { MenuEntryActionViewItem, createActionViewItem, getActionBarActions, getFlatContextMenuActions } from "./module-0516.mjs";
import { testingContinuousIsOn, testingCoverageAllIcon, testingDebugAllIcon, testingDebugIcon, testingHiddenIcon, testingRerunIcon, testingRunAllIcon, testingStatesToIcons, testingTurnContinuousRunOff, testingTurnContinuousRunOn } from "./module-3039.mjs";
import { DropdownWithPrimaryActionViewItem } from "./module-1932.mjs";
import { Iterable } from "./module-0011.mjs";
import { groupBy } from "./module-0003.mjs";
import { testProfileBitset, testResultStateToContextValues } from "./module-1208.mjs";
import { ActionBar } from "./module-0477.mjs";
import { UnmanagedProgress } from "./module-0446.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService, registerThemingParticipant } from "./module-0287.mjs";
import { ITestService, testCollectionIsEmpty } from "./module-1435.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITestingContinuousRunService } from "./module-3034.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { DebugLastRun, ReRunLastRun } from "./module-3046.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { spinningLoading } from "./module-0479.mjs";
import { collectTestStateCounts, getTestProgressText } from "./module-3030.mjs";
import { mapFindFirst } from "./module-0006.mjs";
import { cmpPriority, isFailedState, isStateWithResult, statesInOrder } from "./module-1430.mjs";
import { LiveTestResult } from "./module-1432.mjs";
import { IActivityService, IconBadge, NumberBadge } from "./module-1449.mjs";
import { ITestResultService } from "./module-1434.mjs";
import { StoredValue } from "./module-1426.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { TestingObjectTree } from "./module-3074.mjs";
import { DefaultKeyboardNavigationDelegate } from "./module-0460.mjs";
import { autorun } from "./module-0052.mjs";
import { getTestingConfiguration } from "./module-3023.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { TestId } from "./module-1207.mjs";
import { ListProjection } from "./module-3073.mjs";
import { TreeProjection } from "./module-3075.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ITestExplorerFilterState } from "./module-3026.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITestingPeekOpener } from "./module-3036.mjs";
import { fuzzyContains } from "./module-0030.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { compareFileNames } from "./module-1529.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { labelForTestInState } from "./module-1427.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { getTestItemContextOverlay } from "./module-3048.mjs";
import { foreground } from "./module-0227.mjs";
import { Color, RGBA } from "./module-0197.mjs";


// src/vs/workbench/contrib/testing/browser/testingExplorerView.ts
var TestingExplorerView = class extends ViewPane {
  constructor(options3, contextMenuService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, testService, hoverService, testProfileService, commandService, menuService, crService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.testService = testService;
    this.testProfileService = testProfileService;
    this.commandService = commandService;
    this.menuService = menuService;
    this.crService = crService;
    this.filterActionBar = this._register(new MutableDisposable());
    this.discoveryProgress = this._register(new MutableDisposable());
    this.filter = this._register(new MutableDisposable());
    this.filterFocusListener = this._register(new MutableDisposable());
    this.dimensions = { width: 0, height: 0 };
    this.lastFocusState = 0 /* Input */;
    const relayout = this._register(new RunOnceScheduler(() => this.layoutBody(), 1));
    this._register(this.onDidChangeViewWelcomeState(() => {
      if (!this.shouldShowWelcome()) {
        relayout.schedule();
      }
    }));
    this._register(Event2.any(crService.onDidChange, testProfileService.onDidChange)(() => {
      this.updateActions();
    }));
    this._register(testService.collection.onBusyProvidersChange((busy) => {
      this.updateDiscoveryProgress(busy);
    }));
    this._register(testProfileService.onDidChange(() => this.updateActions()));
  }
  get focusedTreeElements() {
    return this.viewModel.tree.getFocus().filter(isDefined);
  }
  shouldShowWelcome() {
    return this.viewModel?.welcomeExperience === 1 /* ForWorkspace */;
  }
  focus() {
    super.focus();
    if (this.lastFocusState === 1 /* Tree */) {
      this.viewModel.tree.domFocus();
    } else {
      this.filter.value?.focus();
    }
  }
  /**
   * Gets include/exclude items in the tree, based either on visible tests
   * or a use selection. If a profile is given, only tests in that profile
   * are collected. If a bitset is given, any test that can run in that
   * bitset is collected.
   */
  getTreeIncludeExclude(profileOrBitset, withinItems, filterToType = "visible") {
    const projection = this.viewModel.projection.value;
    if (!projection) {
      return { include: [], exclude: [] };
    }
    const include = /* @__PURE__ */ new Set();
    const exclude = [];
    const runnableWithProfileOrBitset = /* @__PURE__ */ new Map();
    const isRunnableWithProfileOrBitset = (item) => {
      let value2 = runnableWithProfileOrBitset.get(item);
      if (value2 === void 0) {
        value2 = typeof profileOrBitset === "number" ? !!this.testProfileService.getDefaultProfileForTest(profileOrBitset, item) : canUseProfileWithTest(profileOrBitset, item);
        runnableWithProfileOrBitset.set(item, value2);
      }
      return value2;
    };
    const attempt = (element, alreadyIncluded) => {
      if (!(element instanceof TestItemTreeElement) || !this.viewModel.tree.hasElement(element)) {
        return;
      }
      const inTree = this.viewModel.tree.getNode(element);
      if (!inTree.visible) {
        if (alreadyIncluded) {
          exclude.push(element.test);
        }
        return;
      }
      const visibleRunnableChildren = inTree.children.filter(
        (c) => c.visible && c.element instanceof TestItemTreeElement && isRunnableWithProfileOrBitset(c.element.test)
      ).length;
      if (
        // If it's not already included...
        !alreadyIncluded && isRunnableWithProfileOrBitset(element.test) && (visibleRunnableChildren === 0 || visibleRunnableChildren * 2 >= inTree.children.length) && visibleRunnableChildren !== 1
      ) {
        include.add(element.test);
        alreadyIncluded = true;
      }
      for (const child of element.children) {
        attempt(child, alreadyIncluded);
      }
    };
    if (filterToType === "selected") {
      const sel = this.viewModel.tree.getSelection().filter(isDefined);
      if (sel.length) {
        L:
          for (const node of sel) {
            if (node instanceof TestItemTreeElement) {
              for (let i2 = node; i2; i2 = i2.parent) {
                if (include.has(i2.test)) {
                  continue L;
                }
              }
              include.add(node.test);
              node.children.forEach((c) => attempt(c, true));
            }
          }
        return { include: [...include], exclude };
      }
    }
    for (const root of withinItems || this.testService.collection.rootItems) {
      const element = projection.getElementByTestId(root.item.extId);
      if (!element) {
        continue;
      }
      if (typeof profileOrBitset === "object" && !canUseProfileWithTest(profileOrBitset, root)) {
        continue;
      }
      include.add(element.test);
      element.children.forEach((c) => attempt(c, true));
    }
    return { include: [...include], exclude };
  }
  render() {
    super.render();
    this._register(registerNavigableContainer({
      name: "testingExplorerView",
      focusNotifiers: [this],
      focusNextWidget: () => {
        if (!this.viewModel.tree.isDOMFocused()) {
          this.viewModel.tree.domFocus();
        }
      },
      focusPreviousWidget: () => {
        if (this.viewModel.tree.isDOMFocused()) {
          this.filter.value?.focus();
        }
      }
    }));
  }
  /**
   * @override
   */
  renderBody(container3) {
    super.renderBody(container3);
    this.container = append(container3, $(".test-explorer"));
    this.treeHeader = append(this.container, $(".test-explorer-header"));
    this.filterActionBar.value = this.createFilterActionBar();
    const messagesContainer = append(this.treeHeader, $(".result-summary-container"));
    this._register(this.instantiationService.createInstance(ResultSummaryView, messagesContainer));
    const listContainer = append(this.container, $(".test-explorer-tree"));
    this.viewModel = this.instantiationService.createInstance(TestingExplorerViewModel, listContainer, this.onDidChangeBodyVisibility);
    this._register(this.viewModel.tree.onDidFocus(() => this.lastFocusState = 1 /* Tree */));
    this._register(this.viewModel.onChangeWelcomeVisibility(() => this._onDidChangeViewWelcomeState.fire()));
    this._register(this.viewModel);
    this._onDidChangeViewWelcomeState.fire();
  }
  /** @override  */
  createActionViewItem(action, options3) {
    switch (action.id) {
      case "workbench.actions.treeView.testExplorer.filter" /* FilterAction */:
        this.filter.value = this.instantiationService.createInstance(TestingExplorerFilter, action, options3);
        this.filterFocusListener.value = this.filter.value.onDidFocus(() => this.lastFocusState = 0 /* Input */);
        return this.filter.value;
      case "testing.runSelected" /* RunSelectedAction */:
        return this.getRunGroupDropdown(2 /* Run */, action, options3);
      case "testing.debugSelected" /* DebugSelectedAction */:
        return this.getRunGroupDropdown(4 /* Debug */, action, options3);
      case "testing.coverageSelected" /* CoverageSelectedAction */:
        return this.getRunGroupDropdown(8 /* Coverage */, action, options3);
      case "testing.startContinuousRun" /* StartContinousRun */:
      case "testing.stopContinuousRun" /* StopContinousRun */:
        return this.getContinuousRunDropdown(action, options3);
      default:
        return super.createActionViewItem(action, options3);
    }
  }
  /** @inheritdoc */
  getTestConfigGroupActions(group2) {
    const profileActions = [];
    let participatingGroups = 0;
    let participatingProfiles = 0;
    let hasConfigurable = false;
    const defaults = this.testProfileService.getGroupDefaultProfiles(group2);
    for (const { profiles: profiles2, controller } of this.testProfileService.all()) {
      let hasAdded = false;
      for (const profile of profiles2) {
        if (profile.group !== group2) {
          continue;
        }
        if (!hasAdded) {
          hasAdded = true;
          participatingGroups++;
          profileActions.push(toAction({ id: `${controller.id}.$root`, label: controller.label.get(), enabled: false, checked: false, run: () => {
          } }));
        }
        hasConfigurable = hasConfigurable || profile.hasConfigurationHandler;
        participatingProfiles++;
        profileActions.push(toAction({
          id: `${controller.id}.${profile.profileId}`,
          label: defaults.includes(profile) ? localize(21177, null, profile.label) : profile.label,
          run: () => {
            const { include, exclude } = this.getTreeIncludeExclude(profile);
            this.testService.runResolvedTests({
              exclude: exclude.map((e) => e.item.extId),
              group: profile.group,
              targets: [{
                profileId: profile.profileId,
                controllerId: profile.controllerId,
                testIds: include.map((i2) => i2.item.extId)
              }]
            });
          }
        }));
      }
    }
    const contextKeys = [];
    if (group2 === 2 /* Run */) {
      contextKeys.push(["testing.profile.context.group", "run"]);
    }
    if (group2 === 4 /* Debug */) {
      contextKeys.push(["testing.profile.context.group", "debug"]);
    }
    if (group2 === 8 /* Coverage */) {
      contextKeys.push(["testing.profile.context.group", "coverage"]);
    }
    const key3 = this.contextKeyService.createOverlay(contextKeys);
    const menu = this.menuService.getMenuActions(MenuId.TestProfilesContext, key3);
    const menuActions = getFlatContextMenuActions(menu);
    const postActions = [];
    if (participatingProfiles > 1) {
      postActions.push(toAction({
        id: "selectDefaultTestConfigurations",
        label: localize(21179, null),
        run: () => this.commandService.executeCommand("testing.selectDefaultTestProfiles" /* SelectDefaultTestProfiles */, group2)
      }));
    }
    if (hasConfigurable) {
      postActions.push(toAction({
        id: "configureTestProfiles",
        label: localize(21176, null),
        run: () => this.commandService.executeCommand("testing.configureProfile" /* ConfigureTestProfilesAction */, group2)
      }));
    }
    return {
      numberOfProfiles: participatingProfiles,
      actions: menuActions.length > 0 ? Separator.join(profileActions, menuActions, postActions) : Separator.join(profileActions, postActions)
    };
  }
  /**
   * @override
   */
  saveState() {
    this.filter.value?.saveState();
    super.saveState();
  }
  getRunGroupDropdown(group2, defaultAction, options3) {
    const dropdownActions = this.getTestConfigGroupActions(group2);
    if (dropdownActions.numberOfProfiles < 2) {
      return super.createActionViewItem(defaultAction, options3);
    }
    const primaryAction = this.instantiationService.createInstance(MenuItemAction, {
      id: defaultAction.id,
      title: defaultAction.label,
      icon: group2 === 2 /* Run */ ? testingRunAllIcon : group2 === 4 /* Debug */ ? testingDebugAllIcon : testingCoverageAllIcon
    }, void 0, void 0, void 0, void 0);
    return this.instantiationService.createInstance(
      DropdownWithPrimaryActionViewItem,
      primaryAction,
      this.getDropdownAction(),
      dropdownActions.actions,
      "",
      options3
    );
  }
  getDropdownAction() {
    return new Action("selectRunConfig", localize(21190, null), "codicon-chevron-down", true);
  }
  getContinuousRunDropdown(defaultAction, options3) {
    const allProfiles = [...Iterable.flatMap(this.testProfileService.all(), (cr) => {
      if (this.testService.collection.getNodeById(cr.controller.id)?.children.size) {
        return Iterable.filter(cr.profiles, (p) => p.supportsContinuousRun);
      }
      return Iterable.empty();
    })];
    if (allProfiles.length <= 1) {
      return super.createActionViewItem(defaultAction, options3);
    }
    const primaryAction = this.instantiationService.createInstance(MenuItemAction, {
      id: defaultAction.id,
      title: defaultAction.label,
      icon: defaultAction.id === "testing.startContinuousRun" /* StartContinousRun */ ? testingTurnContinuousRunOn : testingTurnContinuousRunOff
    }, void 0, void 0, void 0, void 0);
    const dropdownActions = [];
    const groups = groupBy(allProfiles, (p) => p.group);
    const crService = this.crService;
    for (const group2 of [2 /* Run */, 4 /* Debug */, 8 /* Coverage */]) {
      const profiles2 = groups[group2];
      if (!profiles2) {
        continue;
      }
      if (Object.keys(groups).length > 1) {
        dropdownActions.push({
          id: `${group2}.label`,
          label: testProfileBitset[group2],
          enabled: false,
          class: void 0,
          tooltip: testProfileBitset[group2],
          run: () => {
          }
        });
      }
      for (const profile of profiles2) {
        dropdownActions.push({
          id: `${group2}.${profile.profileId}`,
          label: profile.label,
          enabled: true,
          class: void 0,
          tooltip: profile.label,
          checked: crService.isEnabledForProfile(profile),
          run: () => crService.isEnabledForProfile(profile) ? crService.stopProfile(profile) : crService.start([profile])
        });
      }
    }
    return this.instantiationService.createInstance(
      DropdownWithPrimaryActionViewItem,
      primaryAction,
      this.getDropdownAction(),
      dropdownActions,
      "",
      options3
    );
  }
  createFilterActionBar() {
    const bar = new ActionBar(this.treeHeader, {
      actionViewItemProvider: (action, options3) => this.createActionViewItem(action, options3),
      triggerKeys: { keyDown: false, keys: [] }
    });
    bar.push(new Action("workbench.actions.treeView.testExplorer.filter" /* FilterAction */));
    bar.getContainer().classList.add("testing-filter-action-bar");
    return bar;
  }
  updateDiscoveryProgress(busy) {
    if (!busy && this.discoveryProgress) {
      this.discoveryProgress.clear();
    } else if (busy && !this.discoveryProgress.value) {
      this.discoveryProgress.value = this.instantiationService.createInstance(UnmanagedProgress, { location: this.getProgressLocation() });
    }
  }
  /**
   * @override
   */
  layoutBody(height = this.dimensions.height, width2 = this.dimensions.width) {
    super.layoutBody(height, width2);
    this.dimensions.height = height;
    this.dimensions.width = width2;
    this.container.style.height = `${height}px`;
    this.viewModel?.layout(height - this.treeHeader.clientHeight, width2);
    this.filter.value?.layout(width2);
  }
};

TestingExplorerView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ITestService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, ITestProfileService),
  __decorateParam(12, ICommandService),
  __decorateParam(13, IMenuService),
  __decorateParam(14, ITestingContinuousRunService)
], TestingExplorerView);

var SUMMARY_RENDER_INTERVAL = 200;

var ResultSummaryView = class extends Disposable {
  constructor(container3, resultService, activityService, crService, configurationService, instantiationService, hoverService) {
    super();
    this.container = container3;
    this.resultService = resultService;
    this.activityService = activityService;
    this.crService = crService;
    this.elementsWereAttached = false;
    this.badgeDisposable = this._register(new MutableDisposable());
    this.renderLoop = this._register(new RunOnceScheduler(() => this.render(), SUMMARY_RENDER_INTERVAL));
    this.elements = h("div.result-summary", [
      h("div@status"),
      h("div@count"),
      h("div@count"),
      h("span"),
      h("duration@duration"),
      h("a@rerun")
    ]);
    this.badgeType = configurationService.getValue("testing.countBadge" /* CountBadge */);
    this._register(resultService.onResultsChanged(this.render, this));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("testing.countBadge" /* CountBadge */)) {
        this.badgeType = configurationService.getValue("testing.countBadge" /* CountBadge */);
        this.render();
      }
    }));
    this.countHover = this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.elements.count, ""));
    const ab = this._register(new ActionBar(this.elements.rerun, {
      actionViewItemProvider: (action, options3) => createActionViewItem(instantiationService, action, options3)
    }));
    ab.push(instantiationService.createInstance(
      MenuItemAction,
      { ...new ReRunLastRun().desc, icon: testingRerunIcon },
      { ...new DebugLastRun().desc, icon: testingDebugIcon },
      {},
      void 0,
      void 0
    ), { icon: true, label: false });
    this.render();
  }
  render() {
    const { results } = this.resultService;
    const { count: count2, root, status: status2, duration, rerun } = this.elements;
    if (!results.length) {
      if (this.elementsWereAttached) {
        root.remove();
        this.elementsWereAttached = false;
      }
      this.container.innerText = localize(21178, null);
      this.badgeDisposable.clear();
      return;
    }
    const live = results.filter((r2) => !r2.completedAt);
    let counts;
    if (live.length) {
      status2.className = ThemeIcon.asClassName(spinningLoading);
      counts = collectTestStateCounts(true, live);
      this.renderLoop.schedule();
      const last = live[live.length - 1];
      duration.textContent = formatDuration5(Date.now() - last.startedAt);
      rerun.style.display = "none";
    } else {
      const last = results[0];
      const dominantState = mapFindFirst(statesInOrder, (s) => last.counts[s] > 0 ? s : void 0);
      status2.className = ThemeIcon.asClassName(testingStatesToIcons.get(dominantState ?? 0 /* Unset */));
      counts = collectTestStateCounts(false, [last]);
      duration.textContent = last instanceof LiveTestResult ? formatDuration5(last.completedAt - last.startedAt) : "";
      rerun.style.display = "block";
    }
    count2.textContent = `${counts.passed}/${counts.totalWillBeRun}`;
    this.countHover.update(getTestProgressText(counts));
    this.renderActivityBadge(counts, live.length > 0);
    if (!this.elementsWereAttached) {
      clearNode(this.container);
      this.container.appendChild(root);
      this.elementsWereAttached = true;
    }
  }
  renderActivityBadge(countSummary, isRunning) {
    if (isRunning) {
      if (this.badgeDisposable.value && this.lastBadge instanceof IconBadge && this.lastBadge.icon === spinningLoading) {
        return;
      }
      this.lastBadge = new IconBadge(spinningLoading, () => localize(21189, null));
    } else if (countSummary && this.badgeType !== "off" /* Off */ && countSummary[this.badgeType] !== 0) {
      if (this.badgeDisposable.value && this.lastBadge instanceof NumberBadge && this.lastBadge.number === countSummary[this.badgeType]) {
        return;
      }
      this.lastBadge = new NumberBadge(countSummary[this.badgeType], (num) => this.getLocalizedBadgeString(this.badgeType, num));
    } else if (this.crService.isEnabled()) {
      if (this.badgeDisposable.value && this.lastBadge instanceof IconBadge && this.lastBadge.icon === testingContinuousIsOn) {
        return;
      }
      this.lastBadge = new IconBadge(testingContinuousIsOn, () => localize(21183, null));
    } else {
      if (!this.lastBadge) {
        return;
      }
      this.lastBadge = void 0;
    }
    this.badgeDisposable.value = this.lastBadge && this.activityService.showViewActivity("workbench.view.testing" /* ExplorerViewId */, { badge: this.lastBadge });
  }
  getLocalizedBadgeString(countBadgeType, count2) {
    switch (countBadgeType) {
      case "passed" /* Passed */:
        return localize(21185, null, count2);
      case "skipped" /* Skipped */:
        return localize(21186, null, count2);
      default:
        return localize(21184, null, count2);
    }
  }
};

ResultSummaryView = __decorateClass([
  __decorateParam(1, ITestResultService),
  __decorateParam(2, IActivityService),
  __decorateParam(3, ITestingContinuousRunService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IHoverService)
], ResultSummaryView);

var TestingExplorerViewModel = class extends Disposable {
  constructor(listContainer, onDidChangeVisibility, configurationService, editorService, editorGroupsService, menuService, contextMenuService, testService, filterState, instantiationService, storageService, contextKeyService, testResults, peekOpener, testProfileService, crService, commandService) {
    super();
    this.menuService = menuService;
    this.contextMenuService = contextMenuService;
    this.testService = testService;
    this.filterState = filterState;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.contextKeyService = contextKeyService;
    this.testResults = testResults;
    this.peekOpener = peekOpener;
    this.testProfileService = testProfileService;
    this.crService = crService;
    this.projection = this._register(new MutableDisposable());
    this.revealTimeout = this._register(new MutableDisposable());
    this.welcomeVisibilityEmitter = this._register(new Emitter());
    this.actionRunner = this._register(new TestExplorerActionRunner(() => this.tree.getSelection().filter(isDefined)));
    /**
     * Whether there's a reveal request which has not yet been delivered. This
     * can happen if the user asks to reveal before the test tree is loaded.
     * We check to see if the reveal request is present on each tree update,
     * and do it then if so.
     */
    this.hasPendingReveal = false;
    /**
     * Fires when the visibility of the placeholder state changes.
     */
    this.onChangeWelcomeVisibility = this.welcomeVisibilityEmitter.event;
    /**
     * Gets whether the welcome should be visible.
     */
    this.welcomeExperience = 0 /* None */;
    this.hasPendingReveal = !!filterState.reveal.get();
    this.noTestForDocumentWidget = this._register(instantiationService.createInstance(NoTestsForDocumentWidget, listContainer));
    this.lastViewState = this._register(new StoredValue({
      key: "testing.treeState",
      scope: 1 /* WORKSPACE */,
      target: 1 /* MACHINE */
    }, this.storageService));
    this._viewMode = TestingContextKeys.viewMode.bindTo(contextKeyService);
    this._viewSorting = TestingContextKeys.viewSorting.bindTo(contextKeyService);
    this._viewMode.set(this.storageService.get("testing.viewMode", 1 /* WORKSPACE */, "true" /* Tree */));
    this._viewSorting.set(this.storageService.get("testing.viewSorting", 1 /* WORKSPACE */, "location" /* ByLocation */));
    this.reevaluateWelcomeState();
    this.filter = this.instantiationService.createInstance(TestsFilter, testService.collection);
    this.tree = instantiationService.createInstance(
      TestingObjectTree,
      "Test Explorer List",
      listContainer,
      new ListDelegate(),
      [
        instantiationService.createInstance(TestItemRenderer, this.actionRunner),
        instantiationService.createInstance(ErrorRenderer)
      ],
      {
        identityProvider: instantiationService.createInstance(IdentityProvider2),
        hideTwistiesOfChildlessElements: false,
        sorter: instantiationService.createInstance(TreeSorter, this),
        keyboardNavigationLabelProvider: instantiationService.createInstance(TreeKeyboardNavigationLabelProvider),
        accessibilityProvider: instantiationService.createInstance(ListAccessibilityProvider),
        filter: this.filter,
        findWidgetEnabled: false
      }
    );
    const collapseStateSaver = this._register(new RunOnceScheduler(() => {
      const state = this.tree.getOptimizedViewState(this.lastViewState.get({}));
      const projection = this.projection.value;
      if (projection) {
        projection.lastState = state;
      }
    }, 3e3));
    this._register(this.tree.onDidChangeCollapseState((evt) => {
      if (evt.node.element instanceof TestItemTreeElement) {
        if (!evt.node.collapsed) {
          this.projection.value?.expandElement(evt.node.element, evt.deep ? Infinity : 0);
        }
        collapseStateSaver.schedule();
      }
    }));
    this._register(this.crService.onDidChange((testId) => {
      if (testId) {
        const elem = this.projection.value?.getElementByTestId(testId);
        this.tree.resort(elem?.parent && this.tree.hasElement(elem.parent) ? elem.parent : null, false);
      }
    }));
    this._register(onDidChangeVisibility((visible) => {
      if (visible) {
        this.ensureProjection();
      }
    }));
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(Event2.any(
      filterState.text.onDidChange,
      filterState.fuzzy.onDidChange,
      testService.excluded.onTestExclusionsChanged
    )(() => {
      if (!filterState.text.value) {
        return this.tree.refilter();
      }
      const items = this.filter.lastIncludedTests = /* @__PURE__ */ new Set();
      this.tree.refilter();
      this.filter.lastIncludedTests = void 0;
      for (const test of items) {
        this.tree.expandTo(test);
      }
    }));
    this._register(this.tree.onDidOpen((e) => {
      if (!(e.element instanceof TestItemTreeElement)) {
        return;
      }
      filterState.didSelectTestInExplorer(e.element.test.item.extId);
      if (!e.element.children.size && e.element.test.item.uri) {
        if (!this.tryPeekError(e.element)) {
          commandService.executeCommand("vscode.revealTest", e.element.test.item.extId, {
            openToSide: e.sideBySide,
            preserveFocus: true
          });
        }
      }
    }));
    this._register(this.tree);
    this._register(this.onChangeWelcomeVisibility((e) => {
      this.noTestForDocumentWidget.setVisible(e === 2 /* ForDocument */);
    }));
    this._register(addStandardDisposableListener(this.tree.getHTMLElement(), "keydown", (evt) => {
      if (evt.equals(3 /* Enter */)) {
        this.handleExecuteKeypress(evt);
      } else if (DefaultKeyboardNavigationDelegate.mightProducePrintableCharacter(evt)) {
        filterState.text.value = evt.browserEvent.key;
        filterState.focusInput();
      }
    }));
    this._register(autorun((reader) => {
      this.revealById(filterState.reveal.read(reader), void 0, false);
    }));
    this._register(onDidChangeVisibility((visible) => {
      if (visible) {
        filterState.focusInput();
      }
    }));
    let followRunningTests = getTestingConfiguration(configurationService, "testing.followRunningTest" /* FollowRunningTest */);
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("testing.followRunningTest" /* FollowRunningTest */)) {
        followRunningTests = getTestingConfiguration(configurationService, "testing.followRunningTest" /* FollowRunningTest */);
      }
    }));
    let alwaysRevealTestAfterStateChange = getTestingConfiguration(configurationService, "testing.alwaysRevealTestOnStateChange" /* AlwaysRevealTestOnStateChange */);
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("testing.alwaysRevealTestOnStateChange" /* AlwaysRevealTestOnStateChange */)) {
        alwaysRevealTestAfterStateChange = getTestingConfiguration(configurationService, "testing.alwaysRevealTestOnStateChange" /* AlwaysRevealTestOnStateChange */);
      }
    }));
    this._register(testResults.onTestChanged((evt) => {
      if (!followRunningTests) {
        return;
      }
      if (evt.reason !== 1 /* OwnStateChange */) {
        return;
      }
      if (this.tree.selectionSize > 1) {
        return;
      }
      if (evt.item.ownComputedState !== 2 /* Running */ && !(evt.previousState === 1 /* Queued */ && isStateWithResult(evt.item.ownComputedState))) {
        return;
      }
      this.revealById(evt.item.item.extId, alwaysRevealTestAfterStateChange, false);
    }));
    this._register(testResults.onResultsChanged(() => {
      this.tree.resort(null);
    }));
    this._register(this.testProfileService.onDidChange(() => {
      this.tree.rerender();
    }));
    const allOpenEditorInputs = observableFromEvent(
      this,
      editorService.onDidEditorsChange,
      () => new Set(editorGroupsService.groups.flatMap((g) => g.editors).map((e) => e.resource).filter(isDefined))
    );
    const activeResource = observableFromEvent(this, editorService.onDidActiveEditorChange, () => {
      if (editorService.activeEditor instanceof DiffEditorInput) {
        return editorService.activeEditor.primary.resource;
      } else {
        return editorService.activeEditor?.resource;
      }
    });
    const filterText = observableFromEvent(this.filterState.text.onDidChange, () => this.filterState.text);
    this._register(autorun((reader) => {
      filterText.read(reader);
      if (this.filterState.isFilteringFor("@openedFiles" /* OpenedFiles */)) {
        this.filter.filterToDocumentUri([...allOpenEditorInputs.read(reader)]);
      } else {
        this.filter.filterToDocumentUri([activeResource.read(reader)].filter(isDefined));
      }
      if (this.filterState.isFilteringFor("@doc" /* CurrentDoc */) || this.filterState.isFilteringFor("@openedFiles" /* OpenedFiles */)) {
        this.tree.refilter();
      }
    }));
    this._register(this.storageService.onWillSaveState(({ reason }) => {
      if (reason === 1 /* SHUTDOWN */) {
        this.lastViewState.store(this.tree.getOptimizedViewState());
      }
    }));
  }
  get viewMode() {
    return this._viewMode.get() ?? "true" /* Tree */;
  }
  set viewMode(newMode) {
    if (newMode === this._viewMode.get()) {
      return;
    }
    this._viewMode.set(newMode);
    this.updatePreferredProjection();
    this.storageService.store("testing.viewMode", newMode, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  get viewSorting() {
    return this._viewSorting.get() ?? "status" /* ByStatus */;
  }
  set viewSorting(newSorting) {
    if (newSorting === this._viewSorting.get()) {
      return;
    }
    this._viewSorting.set(newSorting);
    this.tree.resort(null);
    this.storageService.store("testing.viewSorting", newSorting, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  /**
   * Re-layout the tree.
   */
  layout(height, width2) {
    this.tree.layout(height, width2);
  }
  /**
   * Tries to reveal by extension ID. Queues the request if the extension
   * ID is not currently available.
   */
  revealById(id2, expand = true, focus = true) {
    if (!id2) {
      this.hasPendingReveal = false;
      return;
    }
    const projection = this.ensureProjection();
    let expandToLevel = 0;
    const idPath = [...TestId.fromString(id2).idsFromRoot()];
    for (let i2 = idPath.length - 1; i2 >= expandToLevel; i2--) {
      const element = projection.getElementByTestId(idPath[i2].toString());
      if (!element || !this.tree.hasElement(element)) {
        continue;
      }
      if (i2 < idPath.length - 1) {
        if (expand) {
          this.tree.expand(element);
          expandToLevel = i2 + 1;
          i2 = idPath.length - 1;
          continue;
        }
      }
      let focusTarget = element;
      for (let n2 = element; n2 instanceof TestItemTreeElement; n2 = n2.parent) {
        if (n2.test && this.testService.excluded.contains(n2.test)) {
          this.filterState.toggleFilteringFor("@hidden" /* Hidden */, true);
          break;
        }
        if (!expand && (this.tree.hasElement(n2) && this.tree.isCollapsed(n2))) {
          focusTarget = n2;
        }
      }
      this.filterState.reveal.set(void 0, void 0);
      this.hasPendingReveal = false;
      if (focus) {
        this.tree.domFocus();
      }
      if (this.tree.getRelativeTop(focusTarget) === null) {
        this.tree.reveal(focusTarget, 0.5);
      }
      this.revealTimeout.value = disposableTimeout(() => {
        this.tree.setFocus([focusTarget]);
        this.tree.setSelection([focusTarget]);
      }, 1);
      return;
    }
    this.hasPendingReveal = true;
  }
  /**
   * Collapse all items in the tree.
   */
  async collapseAll() {
    this.tree.collapseAll();
  }
  /**
   * Tries to peek the first test error, if the item is in a failed state.
   */
  tryPeekError(item) {
    const lookup = item.test && this.testResults.getStateById(item.test.item.extId);
    return lookup && lookup[1].tasks.some((s) => isFailedState(s.state)) ? this.peekOpener.tryPeekFirstError(lookup[0], lookup[1], { preserveFocus: true }) : false;
  }
  onContextMenu(evt) {
    const element = evt.element;
    if (!(element instanceof TestItemTreeElement)) {
      return;
    }
    const { actions } = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.crService, this.testProfileService, element);
    this.contextMenuService.showContextMenu({
      getAnchor: () => evt.anchor,
      getActions: () => actions.secondary,
      getActionsContext: () => element,
      actionRunner: this.actionRunner
    });
  }
  handleExecuteKeypress(evt) {
    const focused = this.tree.getFocus();
    const selected = this.tree.getSelection();
    let targeted;
    if (focused.length === 1 && selected.includes(focused[0])) {
      evt.browserEvent?.preventDefault();
      targeted = selected;
    } else {
      targeted = focused;
    }
    const toRun = targeted.filter((e) => e instanceof TestItemTreeElement);
    if (toRun.length) {
      this.testService.runTests({
        group: 2 /* Run */,
        tests: toRun.map((t2) => t2.test)
      });
    }
  }
  reevaluateWelcomeState() {
    const shouldShowWelcome = this.testService.collection.busyProviders === 0 && testCollectionIsEmpty(this.testService.collection);
    const welcomeExperience = shouldShowWelcome ? this.filterState.isFilteringFor("@doc" /* CurrentDoc */) ? 2 /* ForDocument */ : 1 /* ForWorkspace */ : 0 /* None */;
    if (welcomeExperience !== this.welcomeExperience) {
      this.welcomeExperience = welcomeExperience;
      this.welcomeVisibilityEmitter.fire(welcomeExperience);
    }
  }
  ensureProjection() {
    return this.projection.value ?? this.updatePreferredProjection();
  }
  updatePreferredProjection() {
    this.projection.clear();
    const lastState = this.lastViewState.get({});
    if (this._viewMode.get() === "list" /* List */) {
      this.projection.value = this.instantiationService.createInstance(ListProjection, lastState);
    } else {
      this.projection.value = this.instantiationService.createInstance(TreeProjection, lastState);
    }
    const scheduler = this._register(new RunOnceScheduler(() => this.applyProjectionChanges(), 200));
    this.projection.value.onUpdate(() => {
      if (!scheduler.isScheduled()) {
        scheduler.schedule();
      }
    });
    this.applyProjectionChanges();
    return this.projection.value;
  }
  applyProjectionChanges() {
    this.reevaluateWelcomeState();
    this.projection.value?.applyTo(this.tree);
    this.tree.refilter();
    if (this.hasPendingReveal) {
      this.revealById(this.filterState.reveal.get());
    }
  }
  /**
   * Gets the selected tests from the tree.
   */
  getSelectedTests() {
    return this.tree.getSelection();
  }
};

TestingExplorerViewModel = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, ITestService),
  __decorateParam(8, ITestExplorerFilterState),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, ITestResultService),
  __decorateParam(13, ITestingPeekOpener),
  __decorateParam(14, ITestProfileService),
  __decorateParam(15, ITestingContinuousRunService),
  __decorateParam(16, ICommandService)
], TestingExplorerViewModel);

var hasNodeInOrParentOfUri = (collection, ident, testUri, fromNode) => {
  const queue = [fromNode ? [fromNode] : collection.rootIds];
  while (queue.length) {
    for (const id2 of queue.pop()) {
      const node = collection.getNodeById(id2);
      if (!node) {
        continue;
      }
      if (!node.item.uri || !ident.extUri.isEqualOrParent(testUri, node.item.uri)) {
        continue;
      }
      if (node.item.range || node.expand === 1 /* Expandable */) {
        return true;
      }
      queue.push(node.children);
    }
  }
  return false;
};

var TestsFilter = class {
  constructor(collection, state, testService, uriIdentityService) {
    this.collection = collection;
    this.state = state;
    this.testService = testService;
    this.uriIdentityService = uriIdentityService;
    this.documentUris = [];
  }
  /**
   * @inheritdoc
   */
  filter(element) {
    if (element instanceof TestTreeErrorMessage) {
      return 1 /* Visible */;
    }
    if (element.test && !this.state.isFilteringFor("@hidden" /* Hidden */) && this.testService.excluded.contains(element.test)) {
      return 0 /* Hidden */;
    }
    switch (Math.min(this.testFilterText(element), this.testLocation(element), this.testState(element), this.testTags(element))) {
      case 0 /* Exclude */:
        return 0 /* Hidden */;
      case 2 /* Include */:
        this.lastIncludedTests?.add(element);
        return 1 /* Visible */;
      default:
        return 2 /* Recurse */;
    }
  }
  filterToDocumentUri(uris) {
    this.documentUris = [...uris];
  }
  testTags(element) {
    if (!this.state.includeTags.size && !this.state.excludeTags.size) {
      return 2 /* Include */;
    }
    return (this.state.includeTags.size ? element.test.item.tags.some((t2) => this.state.includeTags.has(t2)) : true) && element.test.item.tags.every((t2) => !this.state.excludeTags.has(t2)) ? 2 /* Include */ : 1 /* Inherit */;
  }
  testState(element) {
    if (this.state.isFilteringFor("@failed" /* Failed */)) {
      return isFailedState(element.state) ? 2 /* Include */ : 1 /* Inherit */;
    }
    if (this.state.isFilteringFor("@executed" /* Executed */)) {
      return element.state !== 0 /* Unset */ ? 2 /* Include */ : 1 /* Inherit */;
    }
    return 2 /* Include */;
  }
  testLocation(element) {
    if (this.documentUris.length === 0) {
      return 2 /* Include */;
    }
    if (!this.state.isFilteringFor("@doc" /* CurrentDoc */) && !this.state.isFilteringFor("@openedFiles" /* OpenedFiles */) || !(element instanceof TestItemTreeElement)) {
      return 2 /* Include */;
    }
    if (this.documentUris.some((uri5) => hasNodeInOrParentOfUri(this.collection, this.uriIdentityService, uri5, element.test.item.extId))) {
      return 2 /* Include */;
    }
    return 1 /* Inherit */;
  }
  testFilterText(element) {
    if (this.state.globList.length === 0) {
      return 2 /* Include */;
    }
    const fuzzy = this.state.fuzzy.value;
    for (let e = element; e; e = e.parent) {
      let included = this.state.globList[0].include === false ? 2 /* Include */ : 1 /* Inherit */;
      const data = e.test.item.label.toLowerCase();
      for (const { include, text: text2 } of this.state.globList) {
        if (fuzzy ? fuzzyContains(data, text2) : data.includes(text2)) {
          included = include ? 2 /* Include */ : 0 /* Exclude */;
        }
      }
      if (included !== 1 /* Inherit */) {
        return included;
      }
    }
    return 1 /* Inherit */;
  }
};

TestsFilter = __decorateClass([
  __decorateParam(1, ITestExplorerFilterState),
  __decorateParam(2, ITestService),
  __decorateParam(3, IUriIdentityService)
], TestsFilter);

var TreeSorter = class {
  constructor(viewModel) {
    this.viewModel = viewModel;
  }
  compare(a, b) {
    if (a instanceof TestTreeErrorMessage || b instanceof TestTreeErrorMessage) {
      return (a instanceof TestTreeErrorMessage ? -1 : 0) + (b instanceof TestTreeErrorMessage ? 1 : 0);
    }
    const durationDelta = (b.duration || 0) - (a.duration || 0);
    if (this.viewModel.viewSorting === "duration" /* ByDuration */ && durationDelta !== 0) {
      return durationDelta;
    }
    const stateDelta = cmpPriority(a.state, b.state);
    if (this.viewModel.viewSorting === "status" /* ByStatus */ && stateDelta !== 0) {
      return stateDelta;
    }
    let inSameLocation = false;
    if (a instanceof TestItemTreeElement && b instanceof TestItemTreeElement && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
      inSameLocation = true;
      const delta2 = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
      if (delta2 !== 0) {
        return delta2;
      }
    }
    const sa = a.test.item.sortText;
    const sb = b.test.item.sortText;
    return inSameLocation && !sa && !sb ? 0 : compareFileNames(sa || a.test.item.label, sb || b.test.item.label);
  }
};

var NoTestsForDocumentWidget = class extends Disposable {
  constructor(container3, filterState) {
    super();
    const el = this.el = append(container3, $(".testing-no-test-placeholder"));
    const emptyParagraph = append(el, $("p"));
    emptyParagraph.innerText = localize(21188, null);
    const buttonLabel = localize(21187, null);
    const button = this._register(new Button(el, { title: buttonLabel, ...defaultButtonStyles }));
    button.label = buttonLabel;
    this._register(button.onDidClick(() => filterState.toggleFilteringFor("@doc" /* CurrentDoc */, false)));
  }
  setVisible(isVisible) {
    this.el.classList.toggle("visible", isVisible);
  }
};

NoTestsForDocumentWidget = __decorateClass([
  __decorateParam(1, ITestExplorerFilterState)
], NoTestsForDocumentWidget);

var TestExplorerActionRunner = class extends ActionRunner {
  constructor(getSelectedTests) {
    super();
    this.getSelectedTests = getSelectedTests;
  }
  async runAction(action, context2) {
    if (!(action instanceof MenuItemAction)) {
      return super.runAction(action, context2);
    }
    const selection = this.getSelectedTests();
    const contextIsSelected = selection.some((s) => s === context2);
    const actualContext = contextIsSelected ? selection : [context2];
    const actionable = actualContext.filter((t2) => t2 instanceof TestItemTreeElement);
    await action.run(...actionable);
  }
};

var getLabelForTestTreeElement = (element) => {
  let label3 = labelForTestInState(element.description || element.test.item.label, element.state);
  if (element instanceof TestItemTreeElement) {
    if (element.duration !== void 0) {
      label3 = localize(21181, null, label3, formatDuration5(element.duration));
    }
    if (element.retired) {
      label3 = localize(21182, null, label3);
    }
  }
  return label3;
};

var ListAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(21180, null);
  }
  getAriaLabel(element) {
    return element instanceof TestTreeErrorMessage ? element.description : getLabelForTestTreeElement(element);
  }
};

var TreeKeyboardNavigationLabelProvider = class {
  getKeyboardNavigationLabel(element) {
    return element instanceof TestTreeErrorMessage ? element.message : element.test.item.label;
  }
};

var ListDelegate = class {
  getHeight(element) {
    return element instanceof TestTreeErrorMessage ? 17 + 10 : 22;
  }
  getTemplateId(element) {
    if (element instanceof TestTreeErrorMessage) {
      return ErrorRenderer.ID;
    }
    return TestItemRenderer.ID;
  }
};

var IdentityProvider2 = class {
  getId(element) {
    return element.treeId;
  }
};

var ErrorRenderer = class {
  constructor(hoverService, markdownRendererService) {
    this.hoverService = hoverService;
    this.markdownRendererService = markdownRendererService;
  }
  static {
    this.ID = "error";
  }
  get templateId() {
    return ErrorRenderer.ID;
  }
  renderTemplate(container3) {
    const label3 = append(container3, $(".error"));
    return { label: label3, disposable: new DisposableStore() };
  }
  renderElement({ element }, _, data) {
    clearNode(data.label);
    if (typeof element.message === "string") {
      data.label.innerText = element.message;
    } else {
      const result = this.markdownRendererService.render(element.message, void 0, document.createElement("span"));
      data.label.appendChild(result.element);
    }
    data.disposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.label, element.description));
  }
  disposeTemplate(data) {
    data.disposable.dispose();
  }
};

ErrorRenderer = __decorateClass([
  __decorateParam(0, IHoverService),
  __decorateParam(1, IMarkdownRendererService)
], ErrorRenderer);

var TestItemRenderer = class extends Disposable {
  constructor(actionRunner, menuService, testService, profiles2, contextKeyService, instantiationService, crService, hoverService) {
    super();
    this.actionRunner = actionRunner;
    this.menuService = menuService;
    this.testService = testService;
    this.profiles = profiles2;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.crService = crService;
    this.hoverService = hoverService;
    /**
     * @inheritdoc
     */
    this.templateId = TestItemRenderer.ID;
  }
  static {
    this.ID = "testItem";
  }
  /**
   * @inheritdoc
   */
  renderTemplate(wrapper) {
    wrapper.classList.add("testing-stdtree-container");
    const icon2 = append(wrapper, $(".computed-state"));
    const label3 = append(wrapper, $(".label"));
    const disposable = new DisposableStore();
    append(wrapper, $(ThemeIcon.asCSSSelector(testingHiddenIcon)));
    const actionBar3 = disposable.add(new ActionBar(wrapper, {
      actionRunner: this.actionRunner,
      actionViewItemProvider: (action, options3) => action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options3.hoverDelegate }) : void 0
    }));
    disposable.add(this.profiles.onDidChange(() => {
      if (templateData.current) {
        this.fillActionBar(templateData.current, templateData);
      }
    }));
    disposable.add(this.crService.onDidChange((changed) => {
      const id2 = templateData.current?.test.item.extId;
      if (id2 && (!changed || changed === id2 || TestId.isChild(id2, changed))) {
        this.fillActionBar(templateData.current, templateData);
      }
    }));
    const templateData = { wrapper, label: label3, actionBar: actionBar3, icon: icon2, elementDisposable: new DisposableStore(), templateDisposable: disposable };
    return templateData;
  }
  /**
   * @inheritdoc
   */
  disposeTemplate(templateData) {
    templateData.templateDisposable.clear();
  }
  /**
   * @inheritdoc
   */
  disposeElement(_element, _, templateData) {
    templateData.elementDisposable.clear();
  }
  fillActionBar(element, data) {
    const { actions, contextOverlay } = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.crService, this.profiles, element);
    const crSelf = !!contextOverlay.getContextKeyValue(TestingContextKeys.isContinuousModeOn.key);
    const crChild = !crSelf && this.crService.isEnabledForAChildOf(element.test.item.extId);
    data.actionBar.domNode.classList.toggle("testing-is-continuous-run", crSelf || crChild);
    data.actionBar.clear();
    data.actionBar.context = element;
    data.actionBar.push(actions.primary, { icon: true, label: false });
  }
  /**
   * @inheritdoc
   */
  renderElement(node, _depth, data) {
    data.elementDisposable.clear();
    data.current = node.element;
    data.elementDisposable.add(node.element.onChange(() => this._renderElement(node, data)));
    this._renderElement(node, data);
  }
  _renderElement(node, data) {
    this.fillActionBar(node.element, data);
    const testHidden = this.testService.excluded.contains(node.element.test);
    data.wrapper.classList.toggle("test-is-hidden", testHidden);
    const icon2 = testingStatesToIcons.get(
      node.element.test.expand === 2 /* BusyExpanding */ || node.element.test.item.busy ? 2 /* Running */ : node.element.state
    );
    data.icon.className = "computed-state " + (icon2 ? ThemeIcon.asClassName(icon2) : "");
    if (node.element.retired) {
      data.icon.className += " retired";
    }
    data.elementDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.label, getLabelForTestTreeElement(node.element)));
    if (node.element.test.item.label.trim()) {
      reset(data.label, ...renderLabelWithIcons(node.element.test.item.label));
    } else {
      data.label.textContent = String.fromCharCode(160);
    }
    let description = node.element.description;
    if (node.element.duration !== void 0) {
      description = description ? `${description}: ${formatDuration5(node.element.duration)}` : formatDuration5(node.element.duration);
    }
    if (description) {
      append(data.label, $("span.test-label-description", {}, description));
    }
  }
};

TestItemRenderer = __decorateClass([
  __decorateParam(1, IMenuService),
  __decorateParam(2, ITestService),
  __decorateParam(3, ITestProfileService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ITestingContinuousRunService),
  __decorateParam(7, IHoverService)
], TestItemRenderer);

var formatDuration5 = (ms) => {
  if (ms < 10) {
    return `${ms.toFixed(1)}ms`;
  }
  if (ms < 1e3) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1e3).toFixed(1)}s`;
};

var getActionableElementActions = (contextKeyService, menuService, testService, crService, profiles2, element) => {
  const test = element instanceof TestItemTreeElement ? element.test : void 0;
  const contextKeys = getTestItemContextOverlay(test, test ? profiles2.capabilitiesForTest(test.item) : 0);
  contextKeys.push(["view", "workbench.view.testing" /* ExplorerViewId */]);
  if (test) {
    const ctrl = testService.getTestController(test.controllerId);
    const supportsCr = !!ctrl && profiles2.getControllerProfiles(ctrl.id).some((p) => p.supportsContinuousRun && canUseProfileWithTest(p, test));
    contextKeys.push([
      TestingContextKeys.canRefreshTests.key,
      ctrl && !!(ctrl.capabilities.get() & 2 /* Refresh */) && TestId.isRoot(test.item.extId)
    ], [
      TestingContextKeys.testItemIsHidden.key,
      testService.excluded.contains(test)
    ], [
      TestingContextKeys.isContinuousModeOn.key,
      supportsCr && crService.isSpecificallyEnabledFor(test.item.extId)
    ], [
      TestingContextKeys.isParentRunningContinuously.key,
      supportsCr && crService.isEnabledForAParentOf(test.item.extId)
    ], [
      TestingContextKeys.supportsContinuousRun.key,
      supportsCr
    ], [
      TestingContextKeys.testResultOutdated.key,
      element.retired
    ], [
      TestingContextKeys.testResultState.key,
      testResultStateToContextValues[element.state]
    ]);
  }
  const contextOverlay = contextKeyService.createOverlay(contextKeys);
  const menu = menuService.getMenuActions(MenuId.TestItem, contextOverlay, {
    shouldForwardArgs: true
  });
  const actions = getActionBarActions(menu, "inline");
  return { actions, contextOverlay };
};

registerThemingParticipant((theme, collector) => {
  if (theme.type === "dark") {
    const foregroundColor = theme.getColor(foreground);
    if (foregroundColor) {
      const fgWithOpacity = new Color(new RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.65));
      collector.addRule(`.test-explorer .test-explorer-messages { color: ${fgWithOpacity}; }`);
    }
  }
});
export { TestingExplorerView, SUMMARY_RENDER_INTERVAL, ResultSummaryView, TestingExplorerViewModel, hasNodeInOrParentOfUri, TestsFilter, TreeSorter, NoTestsForDocumentWidget, TestExplorerActionRunner, getLabelForTestTreeElement, ListAccessibilityProvider, TreeKeyboardNavigationLabelProvider, ListDelegate, IdentityProvider2, ErrorRenderer, TestItemRenderer, formatDuration5, getActionableElementActions };
