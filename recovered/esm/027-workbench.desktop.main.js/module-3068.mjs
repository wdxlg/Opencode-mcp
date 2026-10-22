// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testResultsView/testResultsTree.ts
import { Emitter, Event2 } from "./module-0017.mjs";
import { testingCancelIcon, testingCoverageReport, testingDebugIcon, testingRerunIcon, testingRunIcon, testingStatesToIcons } from "./module-3039.mjs";
import { LiveTestResult, maxCountPriority } from "./module-1432.mjs";
import { localize } from "./module-0001.mjs";
import { widgetClose } from "./module-0479.mjs";
import { TestId } from "./module-1207.mjs";
import { InternalTestItem, testResultStateToContextValues } from "./module-1208.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { MessageSubject, TaskSubject, TestOutputSubject, getMessageArgs, mapFindTestMessage } from "./module-3050.mjs";
import { buildTestUri } from "./module-3032.mjs";
import { renderTestMessageAsText } from "./module-3049.mjs";
import { count } from "./module-0030.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { WorkbenchCompressibleObjectTree } from "./module-0636.mjs";
import { cmpPriority, isFailedState } from "./module-1430.mjs";
import { Iterable } from "./module-0011.mjs";
import { isDefined } from "./module-0010.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { Action, ActionRunner, Separator } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ITestResultService } from "./module-1434.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITestExplorerFilterState } from "./module-3026.mjs";
import { ITestCoverageService } from "./module-3024.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { $, append, reset } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { MenuEntryActionViewItem, fillInActionBarActions } from "./module-0516.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { Codicon } from "./module-0085.mjs";
import { getTestItemContextOverlay } from "./module-3048.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITestProfileService } from "./module-1429.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/testing/browser/testResultsView/testResultsTree.ts
function getTaskContext(resultId, task) {
  return { testRunName: task.name, controllerId: task.ctrlId, resultId, taskId: task.id };
}

var TestResultElement = class {
  constructor(value2) {
    this.value = value2;
    this.changeEmitter = new Emitter();
    this.onDidChange = this.changeEmitter.event;
    this.type = "result";
    this.id = value2.id;
    this.context = value2.id;
    this.label = value2.name;
  }
  get icon() {
    return testingStatesToIcons.get(
      this.value.completedAt === void 0 ? 2 /* Running */ : maxCountPriority(this.value.counts)
    );
  }
};

var openCoverageLabel = localize(21214, null);

var closeCoverageLabel = localize(21208, null);

var CoverageElement = class {
  constructor(results, task, coverageService) {
    this.task = task;
    this.coverageService = coverageService;
    this.type = "coverage";
    this.id = `coverage-${results.id}/${task.id}`;
    this.onDidChange = Event2.fromObservableLight(coverageService.selected);
  }
  get label() {
    return this.isOpen ? closeCoverageLabel : openCoverageLabel;
  }
  get icon() {
    return this.isOpen ? widgetClose : testingCoverageReport;
  }
  get isOpen() {
    return this.coverageService.selected.get()?.fromTaskId === this.task.id;
  }
};

var OlderResultsElement = class {
  constructor(n2) {
    this.n = n2;
    this.type = "older";
    this.onDidChange = Event2.None;
    this.label = n2 === 1 ? localize(21213, null) : localize(21212, null, n2);
    this.id = `older-${this.n}`;
  }
};

var TestCaseElement = class {
  constructor(results, test, taskIndex) {
    this.results = results;
    this.test = test;
    this.taskIndex = taskIndex;
    this.type = "test";
    this.id = `${results.id}/${test.item.extId}`;
    const parentId = TestId.fromString(test.item.extId).parentId;
    if (parentId) {
      this.description = "";
      for (const part of parentId.idsToRoot()) {
        if (part.isRoot) {
          break;
        }
        const test2 = results.getStateById(part.toString());
        if (!test2) {
          break;
        }
        if (this.description.length) {
          this.description += " \u2039 ";
        }
        this.description += test2.item.label;
      }
    }
    this.context = new ActionSpreadArgs([
      {
        $mid: 16 /* TestItemContext */,
        tests: [InternalTestItem.serialize(test)]
      },
      getTaskContext(results.id, results.tasks[this.taskIndex])
    ]);
  }
  get onDidChange() {
    if (!(this.results instanceof LiveTestResult)) {
      return Event2.None;
    }
    return Event2.filter(this.results.onChange, (e) => e.item.item.extId === this.test.item.extId && e.reason !== 2 /* NewMessage */);
  }
  get state() {
    return this.test.tasks[this.taskIndex].state;
  }
  get label() {
    return this.test.item.label;
  }
  get labelWithIcons() {
    return renderLabelWithIcons(this.label);
  }
  get icon() {
    return testingStatesToIcons.get(this.state);
  }
  get outputSubject() {
    return new TestOutputSubject(this.results, this.taskIndex, this.test);
  }
};

var TaskElement = class {
  constructor(results, task, index2) {
    this.results = results;
    this.task = task;
    this.index = index2;
    this.changeEmitter = new Emitter();
    this.onDidChange = this.changeEmitter.event;
    this.type = "task";
    this.itemsCache = new CreationCache();
    this.id = `${results.id}/${index2}`;
    this.task = results.tasks[index2];
    this.context = getTaskContext(results.id, this.task);
    this.label = this.task.name;
  }
  get icon() {
    return this.results.tasks[this.index].running ? testingStatesToIcons.get(2 /* Running */) : void 0;
  }
};

var TestMessageElement = class {
  constructor(result, test, taskIndex, messageIndex) {
    this.result = result;
    this.test = test;
    this.taskIndex = taskIndex;
    this.messageIndex = messageIndex;
    this.type = "message";
    const m = this.message = test.tasks[taskIndex].messages[messageIndex];
    this.location = m.location;
    this.contextValue = m.type === 0 /* Error */ ? m.contextValue : void 0;
    this.uri = buildTestUri({
      type: 2 /* ResultMessage */,
      messageIndex,
      resultId: result.id,
      taskIndex,
      testExtId: test.item.extId
    });
    this.id = this.uri.toString();
    const asPlaintext = renderTestMessageAsText(m.message);
    const lines = count(asPlaintext.trimEnd(), "\n");
    this.label = firstLine(asPlaintext);
    if (lines > 0) {
      this.description = lines > 1 ? localize(21211, null, lines) : localize(21210, null);
    }
  }
  get onDidChange() {
    if (!(this.result instanceof LiveTestResult)) {
      return Event2.None;
    }
    return Event2.filter(this.result.onChange, (e) => e.item.item.extId === this.test.item.extId && e.reason !== 2 /* NewMessage */);
  }
  get context() {
    return new ActionSpreadArgs([
      getMessageArgs(this.test, this.message),
      getTaskContext(this.result.id, this.result.tasks[this.taskIndex])
    ]);
  }
  get outputSubject() {
    return new TestOutputSubject(this.result, this.taskIndex, this.test);
  }
};

var OutputPeekTree = class extends Disposable {
  constructor(container3, onDidReveal, options3, contextMenuService, results, instantiationService, explorerFilter, coverageService, progressService, telemetryService) {
    super();
    this.onDidReveal = onDidReveal;
    this.contextMenuService = contextMenuService;
    this.disposed = false;
    this.requestReveal = this._register(new Emitter());
    this.contextMenuActionRunner = this._register(new SpreadableActionRunner());
    this.onDidRequestReview = this.requestReveal.event;
    this.treeActions = instantiationService.createInstance(TreeActionsProvider, options3.showRevealLocationOnMessages, this.requestReveal);
    const diffIdentityProvider = {
      getId(e) {
        return e.id;
      }
    };
    this.tree = this._register(instantiationService.createInstance(
      WorkbenchCompressibleObjectTree,
      "Test Output Peek",
      container3,
      {
        getHeight: () => 22,
        getTemplateId: () => TestRunElementRenderer.ID
      },
      [instantiationService.createInstance(TestRunElementRenderer, this.treeActions)],
      {
        compressionEnabled: true,
        hideTwistiesOfChildlessElements: true,
        identityProvider: diffIdentityProvider,
        alwaysConsumeMouseWheel: false,
        sorter: {
          compare(a, b) {
            if (a instanceof TestCaseElement && b instanceof TestCaseElement) {
              return cmpPriority(a.state, b.state);
            }
            return 0;
          }
        },
        accessibilityProvider: {
          getAriaLabel(element) {
            return element.ariaLabel || element.label;
          },
          getWidgetAriaLabel() {
            return localize(21227, null);
          }
        }
      }
    ));
    const cc = new CreationCache();
    const getTaskChildren = (taskElem) => {
      const { results: results2, index: index2, itemsCache, task } = taskElem;
      const tests = Iterable.filter(results2.tests, (test) => test.tasks[index2].state >= 2 /* Running */ || test.tasks[index2].messages.length > 0);
      let result = Iterable.map(tests, (test) => ({
        element: itemsCache.getOrCreate(test, () => new TestCaseElement(results2, test, index2)),
        incompressible: true,
        children: getTestChildren(results2, test, index2)
      }));
      if (task.coverage.get()) {
        result = Iterable.concat(
          Iterable.single({
            element: new CoverageElement(results2, task, coverageService),
            collapsible: true,
            incompressible: true
          }),
          result
        );
      }
      return result;
    };
    const getTestChildren = (result, test, taskIndex) => {
      return test.tasks[taskIndex].messages.map(
        (m, messageIndex) => m.type === 0 /* Error */ ? { element: cc.getOrCreate(m, () => new TestMessageElement(result, test, taskIndex, messageIndex)), incompressible: false } : void 0
      ).filter(isDefined);
    };
    const getResultChildren = (result) => {
      return result.tasks.map((task, taskIndex) => {
        const taskElem = cc.getOrCreate(task, () => new TaskElement(result, task, taskIndex));
        return {
          element: taskElem,
          incompressible: false,
          collapsible: true,
          children: getTaskChildren(taskElem)
        };
      });
    };
    const getRootChildren = () => {
      let children = [];
      const older = [];
      for (const result of results.results) {
        if (!children.length && result.tasks.length) {
          children = getResultChildren(result);
        } else if (children) {
          const element = cc.getOrCreate(result, () => new TestResultElement(result));
          older.push({
            element,
            incompressible: true,
            collapsible: true,
            collapsed: this.tree.hasElement(element) ? this.tree.isCollapsed(element) : true,
            children: getResultChildren(result)
          });
        }
      }
      if (!children.length) {
        return older;
      }
      if (older.length) {
        children.push({
          element: new OlderResultsElement(older.length),
          incompressible: true,
          collapsible: true,
          collapsed: true,
          children: older
        });
      }
      return children;
    };
    const taskChildrenToUpdate = /* @__PURE__ */ new Set();
    const taskChildrenUpdate = this._register(new RunOnceScheduler(() => {
      for (const taskNode of taskChildrenToUpdate) {
        if (this.tree.hasElement(taskNode)) {
          this.tree.setChildren(taskNode, getTaskChildren(taskNode), { diffIdentityProvider });
        }
      }
      taskChildrenToUpdate.clear();
    }, 300));
    const queueTaskChildrenUpdate = (taskNode) => {
      taskChildrenToUpdate.add(taskNode);
      if (!taskChildrenUpdate.isScheduled()) {
        taskChildrenUpdate.schedule();
      }
    };
    const attachToResults = (result) => {
      const disposable = new DisposableStore();
      disposable.add(result.onNewTask((i2) => {
        this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
        if (result.tasks.length === 1) {
          this.requestReveal.fire(new TaskSubject(result, 0));
        }
        const task = result.tasks[i2];
        disposable.add(autorun((reader) => {
          task.coverage.read(reader);
          queueTaskChildrenUpdate(cc.get(task));
        }));
      }));
      disposable.add(result.onEndTask((index2) => {
        cc.get(result.tasks[index2])?.changeEmitter.fire();
      }));
      disposable.add(result.onChange((e) => {
        for (const [index2, task] of result.tasks.entries()) {
          const taskNode = cc.get(task);
          if (!this.tree.hasElement(taskNode)) {
            continue;
          }
          const itemNode = taskNode.itemsCache.get(e.item);
          if (itemNode && this.tree.hasElement(itemNode)) {
            if (e.reason === 2 /* NewMessage */ && e.message.type === 0 /* Error */) {
              this.tree.setChildren(itemNode, getTestChildren(result, e.item, index2), { diffIdentityProvider });
            }
            return;
          }
          queueTaskChildrenUpdate(taskNode);
        }
      }));
      disposable.add(result.onComplete(() => {
        cc.get(result)?.changeEmitter.fire();
        disposable.dispose();
      }));
    };
    this._register(results.onResultsChanged((e) => {
      if (this.disposed) {
        return;
      }
      if ("completed" in e) {
        cc.get(e.completed)?.changeEmitter.fire();
      } else if ("started" in e) {
        attachToResults(e.started);
      } else {
        this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
      }
    }));
    const revealItem = (element, preserveFocus) => {
      this.tree.setFocus([element]);
      this.tree.setSelection([element]);
      if (!preserveFocus) {
        this.tree.domFocus();
      }
    };
    this._register(onDidReveal(async ({ subject, preserveFocus = false }) => {
      if (subject instanceof TaskSubject) {
        const resultItem = this.tree.getNode(null).children.find((c) => {
          if (c.element instanceof TaskElement) {
            return c.element.results.id === subject.result.id && c.element.index === subject.taskIndex;
          }
          if (c.element instanceof TestResultElement) {
            return c.element.id === subject.result.id;
          }
          return false;
        });
        if (resultItem) {
          revealItem(resultItem.element, preserveFocus);
        }
        return;
      }
      const revealElement = subject instanceof TestOutputSubject ? cc.get(subject.task)?.itemsCache.get(subject.test) : cc.get(subject.message);
      if (!revealElement || !this.tree.hasElement(revealElement)) {
        return;
      }
      const parents = [];
      for (let parent = this.tree.getParentElement(revealElement); parent; parent = this.tree.getParentElement(parent)) {
        parents.unshift(parent);
      }
      for (const parent of parents) {
        this.tree.expand(parent);
      }
      if (this.tree.getRelativeTop(revealElement) === null) {
        this.tree.reveal(revealElement, 0.5);
      }
      revealItem(revealElement, preserveFocus);
    }));
    this._register(this.tree.onDidOpen(async (e) => {
      if (e.element instanceof TestMessageElement) {
        this.requestReveal.fire(new MessageSubject(e.element.result, e.element.test, e.element.taskIndex, e.element.messageIndex));
      } else if (e.element instanceof TestCaseElement) {
        const t2 = e.element;
        const message = mapFindTestMessage(e.element.test, (_t, _m, mesasgeIndex, taskIndex) => new MessageSubject(t2.results, t2.test, taskIndex, mesasgeIndex));
        this.requestReveal.fire(message || new TestOutputSubject(t2.results, 0, t2.test));
      } else if (e.element instanceof CoverageElement) {
        const task = e.element.task;
        if (e.element.isOpen) {
          return coverageService.closeCoverage();
        }
        progressService.withProgress(
          { location: options3.locationForProgress },
          () => coverageService.openCoverage(task, true)
        );
      }
    }));
    this._register(this.tree.onDidChangeSelection((evt) => {
      for (const element of evt.elements) {
        if (element && "test" in element) {
          explorerFilter.reveal.set(element.test.item.extId, void 0);
          break;
        }
      }
    }));
    this._register(explorerFilter.onDidSelectTestInExplorer((testId) => {
      if (this.tree.getSelection().some((e) => e && "test" in e && e.test.item.extId === testId)) {
        return;
      }
      for (const node of this.tree.getNode(null).children) {
        if (node.element instanceof TaskElement) {
          for (const testNode of node.children) {
            if (testNode.element instanceof TestCaseElement && testNode.element.test.item.extId === testId) {
              this.tree.setSelection([testNode.element]);
              if (this.tree.getRelativeTop(testNode.element) === null) {
                this.tree.reveal(testNode.element, 0.5);
              }
              break;
            }
          }
        }
      }
    }));
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.tree.onDidChangeCollapseState((e) => {
      if (e.node.element instanceof OlderResultsElement && !e.node.collapsed) {
        telemetryService.publicLog2("testing.expandOlderResults");
      }
    }));
    this.tree.setChildren(null, getRootChildren());
    for (const result of results.results) {
      if (!result.completedAt && result instanceof LiveTestResult) {
        attachToResults(result);
      }
    }
  }
  layout(height, width2) {
    this.tree.layout(height, width2);
  }
  onContextMenu(evt) {
    if (!evt.element) {
      return;
    }
    const element = this.getRenderedElement(evt.element);
    const actions = this.treeActions.provideActionBar(element);
    this.contextMenuService.showContextMenu({
      getAnchor: () => evt.anchor,
      getActions: () => actions.secondary.length ? [...actions.primary, new Separator(), ...actions.secondary] : actions.primary,
      getActionsContext: () => element.context,
      actionRunner: this.contextMenuActionRunner
    });
  }
  getRenderedElement(element) {
    if (!(element instanceof TaskElement) && !(element instanceof TestMessageElement)) {
      return element;
    }
    try {
      const compressed = this.tree.getCompressedTreeNode(element);
      const chain = compressed.element?.elements;
      if (chain && chain.length >= 2 && chain[chain.length - 1] === element) {
        const parent = chain[chain.length - 2];
        if (parent) {
          return parent;
        }
      }
    } catch {
    }
    return element;
  }
  dispose() {
    super.dispose();
    this.disposed = true;
  }
};

OutputPeekTree = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, ITestResultService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ITestExplorerFilterState),
  __decorateParam(7, ITestCoverageService),
  __decorateParam(8, IProgressService),
  __decorateParam(9, ITelemetryService)
], OutputPeekTree);

var TestRunElementRenderer = class {
  constructor(treeActions, instantiationService) {
    this.treeActions = treeActions;
    this.instantiationService = instantiationService;
    this.templateId = TestRunElementRenderer.ID;
  }
  static {
    this.ID = "testRunElementRenderer";
  }
  /** @inheritdoc */
  renderCompressedElements(node, _index, templateData) {
    const chain = node.element.elements;
    const lastElement = chain[chain.length - 1];
    if ((lastElement instanceof TaskElement || lastElement instanceof TestMessageElement) && chain.length >= 2) {
      this.doRender(chain[chain.length - 2], templateData, lastElement);
    } else {
      this.doRender(lastElement, templateData);
    }
  }
  /** @inheritdoc */
  renderTemplate(container3) {
    const templateDisposable = new DisposableStore();
    container3.classList.add("testing-stdtree-container");
    const icon2 = append(container3, $(".state"));
    const label3 = append(container3, $(".label"));
    const actionBar3 = new ActionBar(container3, {
      actionRunner: templateDisposable.add(new SpreadableActionRunner()),
      actionViewItemProvider: (action, options3) => action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options3.hoverDelegate }) : void 0
    });
    const elementDisposable = new DisposableStore();
    templateDisposable.add(elementDisposable);
    templateDisposable.add(actionBar3);
    return {
      icon: icon2,
      label: label3,
      actionBar: actionBar3,
      elementDisposable,
      templateDisposable
    };
  }
  /** @inheritdoc */
  renderElement(element, _index, templateData) {
    this.doRender(element.element, templateData);
  }
  /** @inheritdoc */
  disposeTemplate(templateData) {
    templateData.templateDisposable.dispose();
  }
  /** Called to render a new element */
  doRender(element, templateData, subjectElement) {
    templateData.elementDisposable.clear();
    templateData.elementDisposable.add(
      element.onDidChange(() => this.doRender(element, templateData, subjectElement))
    );
    this.doRenderInner(element, templateData, subjectElement);
  }
  /** Called, and may be re-called, to render or re-render an element */
  doRenderInner(element, templateData, subjectElement) {
    let { label: label3, labelWithIcons, description } = element;
    if (subjectElement instanceof TestMessageElement) {
      description = subjectElement.label;
      if (element.description) {
        description = `${description} @ ${element.description}`;
      }
    }
    const descriptionElement = description ? $("span.test-label-description", {}, description) : "";
    if (labelWithIcons) {
      reset(templateData.label, ...labelWithIcons, descriptionElement);
    } else {
      reset(templateData.label, label3, descriptionElement);
    }
    const icon2 = element.icon;
    templateData.icon.className = `computed-state ${icon2 ? ThemeIcon.asClassName(icon2) : ""}`;
    const actions = this.treeActions.provideActionBar(element);
    templateData.actionBar.clear();
    templateData.actionBar.context = element.context;
    templateData.actionBar.push(actions.primary, { icon: true, label: false });
  }
};

TestRunElementRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService)
], TestRunElementRenderer);

var TreeActionsProvider = class {
  constructor(showRevealLocationOnMessages, requestReveal, contextKeyService, menuService, commandService, testProfileService, editorService) {
    this.showRevealLocationOnMessages = showRevealLocationOnMessages;
    this.requestReveal = requestReveal;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.commandService = commandService;
    this.testProfileService = testProfileService;
    this.editorService = editorService;
  }
  provideActionBar(element) {
    const test = element instanceof TestCaseElement ? element.test : void 0;
    const capabilities = test ? this.testProfileService.capabilitiesForTest(test.item) : 0;
    const contextKeys = [
      ["peek", "editor.contrib.testingOutputPeek" /* OutputPeekContributionId */],
      [TestingContextKeys.peekItemType.key, element.type]
    ];
    let id2 = MenuId.TestPeekElement;
    const primary = [];
    const secondary = [];
    if (element instanceof TaskElement) {
      primary.push(new Action(
        "testing.outputPeek.showResultOutput",
        localize(21226, null),
        ThemeIcon.asClassName(Codicon.terminal),
        void 0,
        () => this.requestReveal.fire(new TaskSubject(element.results, element.index))
      ));
      if (element.task.running) {
        primary.push(new Action(
          "testing.outputPeek.cancel",
          localize(21216, null),
          ThemeIcon.asClassName(testingCancelIcon),
          void 0,
          () => this.commandService.executeCommand("testing.cancelRun" /* CancelTestRunAction */, element.results.id, element.task.id)
        ));
      } else {
        primary.push(new Action(
          "testing.outputPeek.rerun",
          localize(21223, null),
          ThemeIcon.asClassName(testingRerunIcon),
          void 0,
          () => this.commandService.executeCommand("testing.reRunLastRun" /* ReRunLastRun */, element.results.id)
        ));
        const hasFailedTests = Iterable.some(element.results.tests, (test2) => isFailedState(test2.ownComputedState));
        if (hasFailedTests) {
          primary.push(new Action(
            "testing.outputPeek.rerunFailed",
            localize(21222, null),
            ThemeIcon.asClassName(testingRerunIcon),
            void 0,
            () => this.commandService.executeCommand("testing.reRunFailedFromLastRun" /* ReRunFailedFromLastRun */, element.results.id)
          ));
        }
        primary.push(new Action(
          "testing.outputPeek.debug",
          localize(21218, null),
          ThemeIcon.asClassName(testingDebugIcon),
          void 0,
          () => this.commandService.executeCommand("testing.debugLastRun" /* DebugLastRun */, element.results.id)
        ));
        if (hasFailedTests) {
          primary.push(new Action(
            "testing.outputPeek.debugFailed",
            localize(21217, null),
            ThemeIcon.asClassName(testingDebugIcon),
            void 0,
            () => this.commandService.executeCommand("testing.debugFailedFromLastRun" /* DebugFailedFromLastRun */, element.results.id)
          ));
        }
      }
    }
    if (element instanceof TestResultElement) {
      if (element.value.tasks.length === 1) {
        primary.push(new Action(
          "testing.outputPeek.showResultOutput",
          localize(21226, null),
          ThemeIcon.asClassName(Codicon.terminal),
          void 0,
          () => this.requestReveal.fire(new TaskSubject(element.value, 0))
        ));
      }
      primary.push(new Action(
        "testing.outputPeek.reRunLastRun",
        localize(21224, null),
        ThemeIcon.asClassName(testingRunIcon),
        void 0,
        () => this.commandService.executeCommand("testing.reRunLastRun", element.value.id)
      ));
      const hasFailedTests = Iterable.some(element.value.tests, (test2) => isFailedState(test2.ownComputedState));
      if (hasFailedTests) {
        primary.push(new Action(
          "testing.outputPeek.rerunFailedResult",
          localize(21222, null),
          ThemeIcon.asClassName(testingRerunIcon),
          void 0,
          () => this.commandService.executeCommand("testing.reRunFailedFromLastRun" /* ReRunFailedFromLastRun */, element.value.id)
        ));
      }
      if (capabilities & 4 /* Debug */) {
        primary.push(new Action(
          "testing.outputPeek.debugLastRun",
          localize(21219, null),
          ThemeIcon.asClassName(testingDebugIcon),
          void 0,
          () => this.commandService.executeCommand("testing.debugLastRun", element.value.id)
        ));
        if (hasFailedTests) {
          primary.push(new Action(
            "testing.outputPeek.debugFailedResult",
            localize(21217, null),
            ThemeIcon.asClassName(testingDebugIcon),
            void 0,
            () => this.commandService.executeCommand("testing.debugFailedFromLastRun" /* DebugFailedFromLastRun */, element.value.id)
          ));
        }
      }
    }
    if (element instanceof TestCaseElement || element instanceof TestMessageElement) {
      contextKeys.push(
        [TestingContextKeys.testResultOutdated.key, element.test.retired],
        [TestingContextKeys.testResultState.key, testResultStateToContextValues[element.test.ownComputedState]],
        ...getTestItemContextOverlay(element.test, capabilities)
      );
      const { extId, uri: uri5 } = element.test.item;
      if (uri5) {
        primary.push(new Action(
          "testing.outputPeek.goToTest",
          localize(21221, null),
          ThemeIcon.asClassName(Codicon.goToFile),
          void 0,
          () => this.commandService.executeCommand("vscode.revealTest", extId)
        ));
      }
      if (element.test.tasks[element.taskIndex].messages.some((m) => m.type === 1 /* Output */)) {
        primary.push(new Action(
          "testing.outputPeek.showResultOutput",
          localize(21226, null),
          ThemeIcon.asClassName(Codicon.terminal),
          void 0,
          () => this.requestReveal.fire(element.outputSubject)
        ));
      }
      secondary.push(new Action(
        "testing.outputPeek.revealInExplorer",
        localize(21225, null),
        ThemeIcon.asClassName(Codicon.listTree),
        void 0,
        () => this.commandService.executeCommand("_revealTestInExplorer", extId)
      ));
      if (capabilities & 2 /* Run */) {
        primary.push(new Action(
          "testing.outputPeek.runTest",
          localize(21215, null),
          ThemeIcon.asClassName(testingRunIcon),
          void 0,
          () => this.commandService.executeCommand("vscode.runTestsById", 2 /* Run */, extId)
        ));
      }
      if (capabilities & 4 /* Debug */) {
        primary.push(new Action(
          "testing.outputPeek.debugTest",
          localize(21209, null),
          ThemeIcon.asClassName(testingDebugIcon),
          void 0,
          () => this.commandService.executeCommand("vscode.runTestsById", 4 /* Debug */, extId)
        ));
      }
    }
    if (element instanceof TestMessageElement) {
      id2 = MenuId.TestMessageContext;
      contextKeys.push([TestingContextKeys.testMessageContext.key, element.contextValue]);
      if (this.showRevealLocationOnMessages && element.location) {
        primary.push(new Action(
          "testing.outputPeek.goToError",
          localize(21220, null),
          ThemeIcon.asClassName(Codicon.debugStackframe),
          void 0,
          () => this.editorService.openEditor({
            resource: element.location.uri,
            options: {
              selection: element.location.range,
              preserveFocus: true
            }
          })
        ));
      }
    }
    const contextOverlay = this.contextKeyService.createOverlay(contextKeys);
    const result = { primary, secondary };
    const menu = this.menuService.getMenuActions(id2, contextOverlay, { shouldForwardArgs: true });
    fillInActionBarActions(menu, result, "inline");
    return result;
  }
};

TreeActionsProvider = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IMenuService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, ITestProfileService),
  __decorateParam(6, IEditorService)
], TreeActionsProvider);

var CreationCache = class {
  constructor() {
    this.v = /* @__PURE__ */ new WeakMap();
  }
  get(key3) {
    return this.v.get(key3);
  }
  getOrCreate(ref, factory) {
    const existing = this.v.get(ref);
    if (existing) {
      return existing;
    }
    const fresh = factory();
    this.v.set(ref, fresh);
    return fresh;
  }
};

var firstLine = (str) => {
  const index2 = str.indexOf("\n");
  return index2 === -1 ? str : str.slice(0, index2);
};

var ActionSpreadArgs = class {
  constructor(value2) {
    this.value = value2;
  }
};

var SpreadableActionRunner = class extends ActionRunner {
  async runAction(action, context2) {
    if (context2 instanceof ActionSpreadArgs) {
      await action.run(...context2.value);
    } else {
      await action.run(context2);
    }
  }
};
export { getTaskContext, TestResultElement, openCoverageLabel, closeCoverageLabel, CoverageElement, OlderResultsElement, TestCaseElement, TaskElement, TestMessageElement, OutputPeekTree, TestRunElementRenderer, TreeActionsProvider, CreationCache, firstLine, ActionSpreadArgs, SpreadableActionRunner };
