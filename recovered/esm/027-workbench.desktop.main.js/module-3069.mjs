// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testResultsView/testResultsViewContent.ts
import { CallStackFrame, CallStackWidget, CustomStackFrame } from "./module-3051.mjs";
import { observableValue } from "./module-0048.mjs";
import { testingDebugIcon, testingRunIcon, testingViewIcon } from "./module-3039.mjs";
import { MessageSubject, TaskSubject, TestOutputSubject, equalsSubject, getSubjectTestItem } from "./module-3050.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { ITestProfileService, capabilityContextKeys } from "./module-1429.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITestService } from "./module-1435.mjs";
import { localize } from "./module-0001.mjs";
import { Emitter, Event2, Relay } from "./module-0017.mjs";
import { Limiter } from "./module-0036.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { getTestingConfiguration } from "./module-3023.mjs";
import { $, Dimension, addDisposableListener, append, clearNode, h, reset } from "./module-0075.mjs";
import { DiffContentProvider, MarkdownTestMessagePeek, PlainTextMessagePeek, TerminalMessagePeek } from "./module-3067.mjs";
import { OutputPeekTree } from "./module-3068.mjs";
import { findAsync } from "./module-0007.mjs";
import { LiveTestResult } from "./module-1432.mjs";
import { FloatingClickMenu } from "./module-1844.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/testing/browser/testResultsView/testResultsViewContent.ts
var MessageStackFrame = class extends CustomStackFrame {
  constructor(message, followup, subject, instantiationService, contextKeyService, profileService) {
    super();
    this.message = message;
    this.followup = followup;
    this.subject = subject;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.profileService = profileService;
    this.height = observableValue("MessageStackFrame.height", 100);
    this.icon = testingViewIcon;
    this.label = subject instanceof MessageSubject ? subject.test.label : subject instanceof TestOutputSubject ? subject.test.item.label : subject.result.name;
  }
  render(container3) {
    this.message.style.visibility = "visible";
    container3.appendChild(this.message);
    return toDisposable(() => this.message.remove());
  }
  renderActions(container3) {
    const store = new DisposableStore();
    container3.appendChild(this.followup.domNode);
    store.add(toDisposable(() => this.followup.domNode.remove()));
    const test = getSubjectTestItem(this.subject);
    const capabilities = test && this.profileService.capabilitiesForTest(test);
    let contextKeyService;
    if (capabilities) {
      contextKeyService = this.contextKeyService.createOverlay(capabilityContextKeys(capabilities));
    } else {
      const profiles2 = this.profileService.getControllerProfiles(this.subject.controllerId);
      contextKeyService = this.contextKeyService.createOverlay([
        [TestingContextKeys.hasRunnableTests.key, profiles2.some((p) => p.group & 2 /* Run */)],
        [TestingContextKeys.hasDebuggableTests.key, profiles2.some((p) => p.group & 4 /* Debug */)]
      ]);
    }
    const instaService = store.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const toolbar = store.add(instaService.createInstance(MenuWorkbenchToolBar, container3, MenuId.TestCallStack, {
      menuOptions: { shouldForwardArgs: true },
      actionViewItemProvider: (action, options3) => createActionViewItem(this.instantiationService, action, options3)
    }));
    toolbar.context = this.subject;
    store.add(toolbar);
    return store;
  }
};

MessageStackFrame = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, ITestProfileService)
], MessageStackFrame);

function runInLast(accessor, bitset, subject) {
  if (subject instanceof TaskSubject) {
    return accessor.get(ICommandService).executeCommand(
      bitset === 4 /* Debug */ ? "testing.debugLastRun" /* DebugLastRun */ : "testing.reRunLastRun" /* ReRunLastRun */,
      subject.result.id
    );
  }
  const testService = accessor.get(ITestService);
  const plainTest = subject instanceof MessageSubject ? subject.test : subject.test.item;
  const currentTest = testService.collection.getNodeById(plainTest.extId);
  if (!currentTest) {
    return;
  }
  return testService.runTests({
    group: bitset,
    tests: [currentTest]
  });
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "testing.callStack.run",
      title: localize(21230, null),
      icon: testingRunIcon,
      menu: {
        id: MenuId.TestCallStack,
        when: TestingContextKeys.hasRunnableTests,
        group: "navigation"
      }
    });
  }
  run(accessor, subject) {
    runInLast(accessor, 2 /* Run */, subject);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "testing.callStack.debug",
      title: localize(21229, null),
      icon: testingDebugIcon,
      menu: {
        id: MenuId.TestCallStack,
        when: TestingContextKeys.hasDebuggableTests,
        group: "navigation"
      }
    });
  }
  run(accessor, subject) {
    runInLast(accessor, 4 /* Debug */, subject);
  }
});

var TestResultsViewContent = class extends Disposable {
  constructor(editor, options3, instantiationService, modelService, contextKeyService, uriIdentityService, configurationService) {
    super();
    this.editor = editor;
    this.options = options3;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.contextKeyService = contextKeyService;
    this.uriIdentityService = uriIdentityService;
    this.configurationService = configurationService;
    this.didReveal = this._register(new Emitter());
    this.currentSubjectStore = this._register(new DisposableStore());
    this.onCloseEmitter = this._register(new Relay());
    this.contentProvidersUpdateLimiter = this._register(new Limiter(1));
    this.isTreeLeft = false;
    this.onClose = this.onCloseEmitter.event;
  }
  get uiState() {
    return {
      splitViewWidths: Array.from(
        { length: this.splitView.length },
        (_, i2) => this.splitView.getViewSize(i2)
      )
    };
  }
  get onDidChangeContentHeight() {
    return this.callStackWidget.onDidChangeContentHeight;
  }
  get contentHeight() {
    return this.callStackWidget?.contentHeight || 0;
  }
  get diffViewIndex() {
    return this.isTreeLeft ? 1 : 0;
  }
  get historyViewIndex() {
    return this.isTreeLeft ? 0 : 1;
  }
  swapViews() {
    const leftSize = this.splitView.getViewSize(0);
    const rightSize = this.splitView.getViewSize(1);
    const leftView = this.splitView.removeView(1);
    const rightView = this.splitView.removeView(0);
    this.splitView.addView(leftView, rightSize);
    this.splitView.addView(rightView, leftSize);
  }
  fillBody(containerElement) {
    const initialSpitWidth = TestResultsViewContent.lastSplitWidth;
    this.splitView = new SplitView(containerElement, { orientation: 1 /* HORIZONTAL */ });
    const { historyVisible, showRevealLocationOnMessages } = this.options;
    const isInPeekView = this.editor !== void 0;
    const layout2 = getTestingConfiguration(this.configurationService, "testing.resultsView.layout" /* ResultsViewLayout */);
    this.isTreeLeft = layout2 === "treeLeft" /* TreeLeft */;
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("testing.resultsView.layout" /* ResultsViewLayout */)) {
        const newLayout = getTestingConfiguration(this.configurationService, "testing.resultsView.layout" /* ResultsViewLayout */);
        const newIsTreeLeft = newLayout === "treeLeft" /* TreeLeft */;
        if (newIsTreeLeft !== this.isTreeLeft) {
          this.isTreeLeft = newIsTreeLeft;
          this.swapViews();
        }
      }
    }));
    const messageContainer = this.messageContainer = $(".test-output-peek-message-container");
    this.stackContainer = append(containerElement, $(".test-output-call-stack-container"));
    this.callStackWidget = this._register(this.instantiationService.createInstance(CallStackWidget, this.stackContainer, this.editor));
    this.followupWidget = this._register(this.instantiationService.createInstance(FollowupActionWidget, this.editor));
    this.onCloseEmitter.input = this.followupWidget.onClose;
    this.contentProviders = [
      this._register(this.instantiationService.createInstance(DiffContentProvider, this.editor, messageContainer)),
      this._register(this.instantiationService.createInstance(MarkdownTestMessagePeek, messageContainer)),
      this._register(this.instantiationService.createInstance(TerminalMessagePeek, messageContainer, isInPeekView)),
      this._register(this.instantiationService.createInstance(PlainTextMessagePeek, this.editor, messageContainer))
    ];
    this.messageContextKeyService = this._register(this.contextKeyService.createScoped(containerElement));
    this.contextKeyTestMessage = TestingContextKeys.testMessageContext.bindTo(this.messageContextKeyService);
    this.contextKeyResultOutdated = TestingContextKeys.testResultOutdated.bindTo(this.messageContextKeyService);
    const treeContainer = append(containerElement, $(".test-output-peek-tree.testing-stdtree"));
    const tree = this._register(this.instantiationService.createInstance(
      OutputPeekTree,
      treeContainer,
      this.didReveal.event,
      { showRevealLocationOnMessages, locationForProgress: this.options.locationForProgress }
    ));
    this.onDidRequestReveal = tree.onDidRequestReview;
    const stackView = {
      onDidChange: Event2.None,
      element: this.stackContainer,
      minimumSize: 200,
      maximumSize: Number.MAX_VALUE,
      layout: (width2) => {
        TestResultsViewContent.lastSplitWidth = width2;
        if (this.dimension) {
          this.callStackWidget?.layout(this.dimension.height, width2);
          this.layoutContentWidgets(this.dimension, width2);
        }
      }
    };
    const treeView = {
      onDidChange: Event2.None,
      element: treeContainer,
      minimumSize: 100,
      maximumSize: Number.MAX_VALUE,
      layout: (width2) => {
        if (this.dimension) {
          tree.layout(this.dimension.height, width2);
        }
      }
    };
    this.splitView.addView(stackView, Sizing.Distribute);
    this.splitView.addView(treeView, Sizing.Distribute);
    if (this.isTreeLeft) {
      this.swapViews();
    }
    this.splitView.setViewVisible(this.historyViewIndex, historyVisible.value);
    this._register(historyVisible.onDidChange((visible) => {
      this.splitView.setViewVisible(this.historyViewIndex, visible);
    }));
    if (initialSpitWidth) {
      queueMicrotask(() => this.splitView.resizeView(this.diffViewIndex, initialSpitWidth));
    }
  }
  /**
   * Shows a message in-place without showing or changing the peek location.
   * This is mostly used if peeking a message without a location.
   */
  reveal(opts) {
    this.didReveal.fire(opts);
    if (this.current && equalsSubject(this.current, opts.subject)) {
      return Promise.resolve();
    }
    this.current = opts.subject;
    return this.contentProvidersUpdateLimiter.queue(async () => {
      this.currentSubjectStore.clear();
      const callFrames = this.getCallFrames(opts.subject) || [];
      const topFrame = await this.prepareTopFrame(opts.subject, callFrames);
      this.setCallStackFrames(topFrame, callFrames);
      this.followupWidget.show(opts.subject);
      this.populateFloatingClick(opts.subject);
    });
  }
  setCallStackFrames(messageFrame, stack) {
    this.callStackWidget.setFrames([messageFrame, ...stack.map((frame) => new CallStackFrame(
      frame.label,
      frame.uri,
      frame.position?.lineNumber,
      frame.position?.column
    ))]);
  }
  /**
   * Collapses all displayed stack frames.
   */
  collapseStack() {
    this.callStackWidget.collapseAll();
  }
  getCallFrames(subject) {
    if (!(subject instanceof MessageSubject)) {
      return void 0;
    }
    const frames = subject.stack;
    if (!frames?.length || !this.editor) {
      return frames;
    }
    const topFrame = frames[0];
    const peekLocation = subject.revealLocation;
    const isTopFrameSame = peekLocation && topFrame.position && topFrame.uri && topFrame.position.lineNumber === peekLocation.range.startLineNumber && topFrame.position.column === peekLocation.range.startColumn && this.uriIdentityService.extUri.isEqual(topFrame.uri, peekLocation.uri);
    return isTopFrameSame ? frames.slice(1) : frames;
  }
  async prepareTopFrame(subject, callFrames) {
    this.messageContainer.style.visibility = "hidden";
    this.stackContainer.appendChild(this.messageContainer);
    const topFrame = this.currentTopFrame = this.instantiationService.createInstance(MessageStackFrame, this.messageContainer, this.followupWidget, subject);
    const hasMultipleFrames = callFrames.length > 0;
    topFrame.showHeader.set(hasMultipleFrames, void 0);
    const provider = await findAsync(this.contentProviders, (p) => p.update(subject));
    if (provider) {
      const width2 = this.splitView.getViewSize(this.diffViewIndex);
      if (width2 !== -1 && this.dimension) {
        topFrame.height.set(provider.layout({ width: width2, height: this.dimension?.height }, hasMultipleFrames), void 0);
      }
      if (provider.onScrolled) {
        this.currentSubjectStore.add(this.callStackWidget.onDidScroll((evt) => {
          provider.onScrolled(evt);
        }));
      }
      if (provider.onDidContentSizeChange) {
        this.currentSubjectStore.add(provider.onDidContentSizeChange(() => {
          const width3 = this.splitView.getViewSize(this.diffViewIndex);
          if (this.dimension && !this.isDoingLayoutUpdate && width3 !== -1) {
            this.isDoingLayoutUpdate = true;
            topFrame.height.set(provider.layout({ width: width3, height: this.dimension.height }, hasMultipleFrames), void 0);
            this.isDoingLayoutUpdate = false;
          }
        }));
      }
    }
    return topFrame;
  }
  layoutContentWidgets(dimension, width2 = this.splitView.getViewSize(this.diffViewIndex)) {
    this.isDoingLayoutUpdate = true;
    for (const provider of this.contentProviders) {
      const frameHeight = provider.layout({ height: dimension.height, width: width2 }, !!this.currentTopFrame?.showHeader.get());
      if (frameHeight) {
        this.currentTopFrame?.height.set(frameHeight, void 0);
      }
    }
    this.isDoingLayoutUpdate = false;
  }
  populateFloatingClick(subject) {
    if (!(subject instanceof MessageSubject)) {
      return;
    }
    this.currentSubjectStore.add(toDisposable(() => {
      this.contextKeyResultOutdated.reset();
      this.contextKeyTestMessage.reset();
    }));
    this.contextKeyTestMessage.set(subject.contextValue || "");
    if (subject.result instanceof LiveTestResult) {
      this.contextKeyResultOutdated.set(subject.result.getStateById(subject.test.extId)?.retired ?? false);
      this.currentSubjectStore.add(subject.result.onChange((ev) => {
        if (ev.item.item.extId === subject.test.extId) {
          this.contextKeyResultOutdated.set(ev.item.retired ?? false);
        }
      }));
    } else {
      this.contextKeyResultOutdated.set(true);
    }
    const instaService = this.currentSubjectStore.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.messageContextKeyService])));
    this.currentSubjectStore.add(instaService.createInstance(FloatingClickMenu, {
      container: this.messageContainer,
      menuId: MenuId.TestMessageContent,
      getActionArg: () => subject.context
    }));
  }
  onLayoutBody(height, width2) {
    this.dimension = new Dimension(width2, height);
    this.splitView.layout(width2);
  }
  onWidth(width2) {
    this.splitView.layout(width2);
  }
};

TestResultsViewContent = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IUriIdentityService),
  __decorateParam(6, IConfigurationService)
], TestResultsViewContent);

var FOLLOWUP_ANIMATION_MIN_TIME = 500;

var FollowupActionWidget = class extends Disposable {
  constructor(editor, testService, quickInput) {
    super();
    this.editor = editor;
    this.testService = testService;
    this.quickInput = quickInput;
    this.el = h("div.testing-followup-action", []);
    this.visibleStore = this._register(new DisposableStore());
    this.onCloseEmitter = this._register(new Emitter());
    this.onClose = this.onCloseEmitter.event;
  }
  get domNode() {
    return this.el.root;
  }
  show(subject) {
    this.visibleStore.clear();
    if (subject instanceof MessageSubject) {
      this.showMessage(subject);
    }
  }
  async showMessage(subject) {
    const cts = this.visibleStore.add(new CancellationTokenSource());
    const start = Date.now();
    if (subject.result instanceof LiveTestResult && !subject.result.completedAt) {
      await new Promise((r2) => Event2.once(subject.result.onComplete)(r2));
    }
    const followups = await this.testService.provideTestFollowups({
      extId: subject.test.extId,
      messageIndex: subject.messageIndex,
      resultId: subject.result.id,
      taskIndex: subject.taskIndex
    }, cts.token);
    if (!followups.followups.length || cts.token.isCancellationRequested) {
      followups.dispose();
      return;
    }
    this.visibleStore.add(followups);
    clearNode(this.el.root);
    this.el.root.classList.toggle("animated", Date.now() - start > FOLLOWUP_ANIMATION_MIN_TIME);
    this.el.root.appendChild(this.makeFollowupLink(followups.followups[0]));
    if (followups.followups.length > 1) {
      this.el.root.appendChild(this.makeMoreLink(followups.followups));
    }
    this.visibleStore.add(toDisposable(() => {
      this.el.root.remove();
    }));
  }
  makeFollowupLink(first2) {
    const link2 = this.makeLink(() => this.actionFollowup(link2, first2));
    reset(link2, ...renderLabelWithIcons(first2.message));
    return link2;
  }
  makeMoreLink(followups) {
    const link2 = this.makeLink(
      () => this.quickInput.pick(followups.map((f, i2) => ({
        label: f.message,
        index: i2
      }))).then((picked) => {
        if (picked?.length) {
          followups[picked[0].index].execute();
        }
      })
    );
    link2.innerText = localize(21228, null, followups.length - 1);
    return link2;
  }
  makeLink(onClick4) {
    const link2 = document.createElement("a");
    link2.tabIndex = 0;
    this.visibleStore.add(addDisposableListener(link2, "click", onClick4));
    this.visibleStore.add(addDisposableListener(link2, "keydown", (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(10 /* Space */) || event.equals(3 /* Enter */)) {
        onClick4();
      }
    }));
    return link2;
  }
  actionFollowup(link2, fu) {
    if (link2.ariaDisabled !== "true") {
      link2.ariaDisabled = "true";
      fu.execute();
      if (this.editor) {
        this.onCloseEmitter.fire();
      }
    }
  }
};

FollowupActionWidget = __decorateClass([
  __decorateParam(1, ITestService),
  __decorateParam(2, IQuickInputService)
], FollowupActionWidget);
export { runInLast, MessageStackFrame, TestResultsViewContent, FOLLOWUP_ANIMATION_MIN_TIME, FollowupActionWidget };
