// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testingOutputPeek.ts
import { buildTestUri, parseTestUri } from "./module-3032.mjs";
import { Disposable } from "./module-0012.mjs";
import { MutableObservableValue, staticObservableValue } from "./module-3025.mjs";
import { StoredValue } from "./module-1426.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { MessageSubject, TaskSubject, TestOutputSubject, inspectSubjectHasStack, mapFindTestMessage } from "./module-3050.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { getTestingConfiguration } from "./module-3023.mjs";
import { Iterable } from "./module-0011.mjs";
import { resultItemParents } from "./module-1432.mjs";
import { isFailedState } from "./module-1430.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ITestResultService } from "./module-1434.mjs";
import { ITestService } from "./module-1435.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ICommandService } from "./module-0087.mjs";
import { INotificationService } from "./module-0336.mjs";
import { disposableObservableValue, observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { TestingContextKeys } from "./module-1428.mjs";
import { Event2 } from "./module-0017.mjs";
import { alert } from "./module-0076.mjs";
import { renderTestMessageAsText } from "./module-3049.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IPeekViewService, PeekViewWidget, peekViewTitleForeground, peekViewTitleInfoForeground } from "./module-0623.mjs";
import { testingMessagePeekBorder, testingPeekBorder, testingPeekHeaderBackground, testingPeekMessageHeaderBackground } from "./module-3038.mjs";
import { Color } from "./module-0197.mjs";
import { editorBackground } from "./module-0229.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { TestResultsViewContent } from "./module-3069.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { Action2, IMenuService, MenuId } from "./module-0092.mjs";
import { fillInActionBarActions } from "./module-0516.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { Range2 } from "./module-0106.mjs";
import { stripIcons } from "./module-0461.mjs";
import { Dimension } from "./module-0075.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ITestingPeekOpener } from "./module-3036.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ViewPane } from "./module-1335.mjs";
import { Lazy } from "./module-0028.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IHoverService } from "./module-0520.mjs";
import { EmbeddedDiffEditorWidget } from "./module-2947.mjs";
import { EditorAction2 } from "./module-0097.mjs";
import { Codicon } from "./module-0085.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { Categories } from "./module-0847.mjs";


// src/vs/workbench/contrib/testing/browser/testingOutputPeek.ts
function* allMessages([result]) {
  if (!result) {
    return;
  }
  for (const test of result.tests) {
    for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
      const messages = test.tasks[taskIndex].messages;
      for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
        if (messages[messageIndex].type === 0 /* Error */) {
          yield { result, test, taskIndex, messageIndex };
        }
      }
    }
  }
}

function messageItReferenceToUri({ result, test, taskIndex, messageIndex }) {
  return buildTestUri({
    type: 2 /* ResultMessage */,
    resultId: result.id,
    testExtId: test.item.extId,
    taskIndex,
    messageIndex
  });
}

var TestingPeekOpener = class extends Disposable {
  constructor(configuration2, editorService, codeEditorService, testResults, testService, storageService, viewsService, commandService, notificationService) {
    super();
    this.configuration = configuration2;
    this.editorService = editorService;
    this.codeEditorService = codeEditorService;
    this.testResults = testResults;
    this.testService = testService;
    this.viewsService = viewsService;
    this.commandService = commandService;
    this.notificationService = notificationService;
    this._register(testResults.onTestChanged(this.openPeekOnFailure, this));
    this.historyVisible = this._register(MutableObservableValue.stored(new StoredValue({
      key: "testHistoryVisibleInPeek",
      scope: 0 /* PROFILE */,
      target: 0 /* USER */
    }, storageService), false));
  }
  static {
    this.ID = "workbench.contrib.testing.peekOpener";
  }
  /** @inheritdoc */
  async open() {
    let uri5;
    const active = this.editorService.activeTextEditorControl;
    if (isCodeEditor(active) && active.getModel()?.uri) {
      const modelUri = active.getModel()?.uri;
      if (modelUri) {
        uri5 = await this.getFileCandidateMessage(modelUri, active.getPosition());
      }
    }
    if (!uri5) {
      uri5 = this.lastUri;
    }
    if (!uri5) {
      uri5 = this.getAnyCandidateMessage();
    }
    if (!uri5) {
      return false;
    }
    return this.showPeekFromUri(uri5);
  }
  /** @inheritdoc */
  tryPeekFirstError(result, test, options3) {
    const candidate = this.getFailedCandidateMessage(test);
    if (!candidate) {
      return false;
    }
    this.showPeekFromUri({
      type: 2 /* ResultMessage */,
      documentUri: candidate.location.uri,
      taskIndex: candidate.taskId,
      messageIndex: candidate.index,
      resultId: result.id,
      testExtId: test.item.extId
    }, void 0, { selection: candidate.location.range, selectionRevealType: 3 /* NearTopIfOutsideViewport */, ...options3 });
    return true;
  }
  /** @inheritdoc */
  peekUri(uri5, options3 = {}) {
    const parsed = parseTestUri(uri5);
    const result = parsed && this.testResults.getResult(parsed.resultId);
    if (!parsed || !result || !("testExtId" in parsed)) {
      return false;
    }
    if (!("messageIndex" in parsed)) {
      return false;
    }
    const message = result.getStateById(parsed.testExtId)?.tasks[parsed.taskIndex].messages[parsed.messageIndex];
    if (!message?.location) {
      return false;
    }
    this.showPeekFromUri({
      type: 2 /* ResultMessage */,
      documentUri: message.location.uri,
      taskIndex: parsed.taskIndex,
      messageIndex: parsed.messageIndex,
      resultId: result.id,
      testExtId: parsed.testExtId
    }, options3.inEditor, { selection: message.location.range, ...options3.options });
    return true;
  }
  /** @inheritdoc */
  closeAllPeeks() {
    for (const editor of this.codeEditorService.listCodeEditors()) {
      TestingOutputPeekController.get(editor)?.removePeek();
    }
  }
  openCurrentInEditor() {
    const current = this.getActiveControl();
    if (!current) {
      return;
    }
    const options3 = { pinned: false, revealIfOpened: true };
    if (current instanceof TaskSubject || current instanceof TestOutputSubject) {
      this.editorService.openEditor({ resource: current.outputUri, options: options3 });
      return;
    }
    if (current instanceof TestOutputSubject) {
      this.editorService.openEditor({ resource: current.outputUri, options: options3 });
      return;
    }
    const message = current.message;
    if (current.isDiffable) {
      this.editorService.openEditor({
        original: { resource: current.expectedUri },
        modified: { resource: current.actualUri },
        options: options3
      });
    } else if (typeof message.message === "string") {
      this.editorService.openEditor({ resource: current.messageUri, options: options3 });
    } else {
      this.commandService.executeCommand("markdown.showPreview", current.messageUri).catch((err) => {
        this.notificationService.error(localize(21197, null, err.message));
      });
    }
  }
  getActiveControl() {
    const editor = getPeekedEditorFromFocus(this.codeEditorService);
    const controller = editor && TestingOutputPeekController.get(editor);
    return controller?.subject.get() ?? this.viewsService.getActiveViewWithId("workbench.panel.testResults.view" /* ResultsViewId */)?.subject;
  }
  /** @inheritdoc */
  async showPeekFromUri(uri5, editor, options3) {
    if (isCodeEditor(editor)) {
      this.lastUri = uri5;
      TestingOutputPeekController.get(editor)?.show(buildTestUri(this.lastUri));
      return true;
    }
    const pane = await this.editorService.openEditor({
      resource: uri5.documentUri,
      options: { revealIfOpened: true, ...options3 }
    });
    const control = pane?.getControl();
    if (!isCodeEditor(control)) {
      return false;
    }
    this.lastUri = uri5;
    TestingOutputPeekController.get(control)?.show(buildTestUri(this.lastUri));
    return true;
  }
  /**
   * Opens the peek view on a test failure, based on user preferences.
   */
  openPeekOnFailure(evt) {
    if (evt.reason !== 1 /* OwnStateChange */) {
      return;
    }
    const candidate = this.getFailedCandidateMessage(evt.item);
    if (!candidate) {
      return;
    }
    if (evt.result.request.continuous && !getTestingConfiguration(this.configuration, "testing.automaticallyOpenPeekViewDuringAutoRun" /* AutoOpenPeekViewDuringContinuousRun */)) {
      return;
    }
    const editors = this.codeEditorService.listCodeEditors();
    const cfg = getTestingConfiguration(this.configuration, "testing.automaticallyOpenPeekView" /* AutoOpenPeekView */);
    switch (cfg) {
      case "failureInVisibleDocument" /* FailureVisible */: {
        const visibleEditors = this.editorService.visibleTextEditorControls;
        const editorUris = new Set(visibleEditors.filter(isCodeEditor).map((e) => e.getModel()?.uri.toString()));
        if (!Iterable.some(resultItemParents(evt.result, evt.item), (i2) => i2.item.uri && editorUris.has(i2.item.uri.toString()))) {
          return;
        }
        if (!editorUris.has(candidate.location.uri.toString())) {
          return;
        }
        break;
      }
      case "failureAnywhere" /* FailureAnywhere */:
        break;
      //continue
      default:
        return;
    }
    const controllers = editors.map(TestingOutputPeekController.get);
    if (controllers.some((c) => c?.subject.get())) {
      return;
    }
    this.tryPeekFirstError(evt.result, evt.item);
  }
  /**
   * Gets the message closest to the given position from a test in the file.
   */
  async getFileCandidateMessage(uri5, position2) {
    let best;
    let bestDistance = Infinity;
    const demandedUriStr = uri5.toString();
    for (const test of this.testService.collection.all) {
      const result = this.testResults.getStateById(test.item.extId);
      if (!result) {
        continue;
      }
      mapFindTestMessage(result[1], (_task, message, messageIndex, taskIndex) => {
        if (message.type !== 0 /* Error */ || !message.location || message.location.uri.toString() !== demandedUriStr) {
          return;
        }
        const distance = position2 ? Math.abs(position2.lineNumber - message.location.range.startLineNumber) : 0;
        if (!best || distance <= bestDistance) {
          bestDistance = distance;
          best = {
            type: 2 /* ResultMessage */,
            testExtId: result[1].item.extId,
            resultId: result[0].id,
            taskIndex,
            messageIndex,
            documentUri: uri5
          };
        }
      });
    }
    return best;
  }
  /**
   * Gets any possible still-relevant message from the results.
   */
  getAnyCandidateMessage() {
    const seen = /* @__PURE__ */ new Set();
    for (const result of this.testResults.results) {
      for (const test of result.tests) {
        if (seen.has(test.item.extId)) {
          continue;
        }
        seen.add(test.item.extId);
        const found = mapFindTestMessage(test, (task, message, messageIndex, taskIndex) => message.location && {
          type: 2 /* ResultMessage */,
          testExtId: test.item.extId,
          resultId: result.id,
          taskIndex,
          messageIndex,
          documentUri: message.location.uri
        });
        if (found) {
          return found;
        }
      }
    }
    return void 0;
  }
  /**
   * Gets the first failed message that can be displayed from the result.
   */
  getFailedCandidateMessage(test) {
    const fallbackLocation = test.item.uri && test.item.range ? { uri: test.item.uri, range: test.item.range } : void 0;
    let best;
    mapFindTestMessage(test, (task, message, messageIndex, taskId) => {
      const location2 = message.location || fallbackLocation;
      if (!isFailedState(task.state) || !location2) {
        return;
      }
      if (best && message.type !== 0 /* Error */) {
        return;
      }
      best = { taskId, index: messageIndex, message, location: location2 };
    });
    return best;
  }
};

TestingPeekOpener = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, ICodeEditorService),
  __decorateParam(3, ITestResultService),
  __decorateParam(4, ITestService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IViewsService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, INotificationService)
], TestingPeekOpener);

var TestingOutputPeekController = class extends Disposable {
  constructor(editor, codeEditorService, instantiationService, testResults, contextKeyService) {
    super();
    this.editor = editor;
    this.codeEditorService = codeEditorService;
    this.instantiationService = instantiationService;
    this.testResults = testResults;
    /**
     * Currently-shown peek view.
     */
    this.peek = this._register(disposableObservableValue("TestingOutputPeek", void 0));
    /**
     * Gets the currently display subject. Undefined if the peek is not open.
     */
    this.subject = derived((reader) => this.peek.read(reader)?.current.read(reader));
    this.visible = TestingContextKeys.isPeekVisible.bindTo(contextKeyService);
    this._register(editor.onDidChangeModel(() => this.peek.set(void 0, void 0)));
    this._register(testResults.onResultsChanged(this.closePeekOnCertainResultEvents, this));
    this._register(testResults.onTestChanged(this.closePeekOnTestChange, this));
  }
  /**
   * Gets the controller associated with the given code editor.
   */
  static get(editor) {
    return editor.getContribution("editor.contrib.testingOutputPeek" /* OutputPeekContributionId */);
  }
  /**
   * Shows a peek for the message in the editor.
   */
  async show(uri5) {
    const subject = this.retrieveTest(uri5);
    if (subject) {
      this.showSubject(subject);
    }
  }
  /**
   * Shows a peek for the existing inspect subject.
   */
  async showSubject(subject) {
    if (!this.peek.get()) {
      const peek = this.instantiationService.createInstance(TestResultsPeek, this.editor);
      this.peek.set(peek, void 0);
      Event2.once(peek.onDidClose)(() => {
        this.visible.set(false);
        this.peek.set(void 0, void 0);
      });
      this.visible.set(true);
      peek.create();
    }
    if (subject instanceof MessageSubject) {
      alert(renderTestMessageAsText(subject.message.message));
    }
    this.peek.get().setModel(subject);
  }
  async openAndShow(uri5) {
    const subject = this.retrieveTest(uri5);
    if (!subject) {
      return;
    }
    if (!subject.revealLocation || subject.revealLocation.uri.toString() === this.editor.getModel()?.uri.toString()) {
      return this.show(uri5);
    }
    const otherEditor = await this.codeEditorService.openCodeEditor({
      resource: subject.revealLocation.uri,
      options: { pinned: false, revealIfOpened: true }
    }, this.editor);
    if (otherEditor) {
      TestingOutputPeekController.get(otherEditor)?.removePeek();
      return TestingOutputPeekController.get(otherEditor)?.show(uri5);
    }
  }
  /**
   * Disposes the peek view, if any.
   */
  removePeek() {
    this.peek.set(void 0, void 0);
  }
  /**
   * Collapses all displayed stack frames.
   */
  collapseStack() {
    this.peek.get()?.collapseStack();
  }
  /**
   * Shows the next message in the peek, if possible.
   */
  next() {
    const subject = this.peek.get()?.current.get();
    if (!subject) {
      return;
    }
    let first2;
    let found = false;
    for (const m of allMessages(this.testResults.results)) {
      first2 ??= m;
      if (subject instanceof TaskSubject && m.result.id === subject.result.id) {
        found = true;
      }
      if (found) {
        this.openAndShow(messageItReferenceToUri(m));
        return;
      }
      if (subject instanceof TestOutputSubject && subject.test.item.extId === m.test.item.extId && subject.taskIndex === m.taskIndex && subject.result.id === m.result.id) {
        found = true;
      }
      if (subject instanceof MessageSubject && subject.test.extId === m.test.item.extId && subject.messageIndex === m.messageIndex && subject.taskIndex === m.taskIndex && subject.result.id === m.result.id) {
        found = true;
      }
    }
    if (first2) {
      this.openAndShow(messageItReferenceToUri(first2));
    }
  }
  /**
   * Shows the previous message in the peek, if possible.
   */
  previous() {
    const subject = this.subject.get();
    if (!subject) {
      return;
    }
    let previous;
    let previousLockedIn = false;
    let last;
    for (const m of allMessages(this.testResults.results)) {
      last = m;
      if (!previousLockedIn) {
        if (subject instanceof TaskSubject) {
          if (m.result.id === subject.result.id) {
            previousLockedIn = true;
          }
          continue;
        }
        if (subject instanceof TestOutputSubject) {
          if (m.test.item.extId === subject.test.item.extId && m.result.id === subject.result.id && m.taskIndex === subject.taskIndex) {
            previousLockedIn = true;
          }
          continue;
        }
        if (subject.test.extId === m.test.item.extId && subject.messageIndex === m.messageIndex && subject.taskIndex === m.taskIndex && subject.result.id === m.result.id) {
          previousLockedIn = true;
          continue;
        }
        previous = m;
      }
    }
    const target = previous || last;
    if (target) {
      this.openAndShow(messageItReferenceToUri(target));
    }
  }
  /**
   * Removes the peek view if it's being displayed on the given test ID.
   */
  removeIfPeekingForTest(testId) {
    const c = this.subject.get();
    if (c && c instanceof MessageSubject && c.test.extId === testId) {
      this.peek.set(void 0, void 0);
    }
  }
  /**
   * If the test we're currently showing has its state change to something
   * else, then clear the peek.
   */
  closePeekOnTestChange(evt) {
    if (evt.reason !== 1 /* OwnStateChange */ || evt.previousState === evt.item.ownComputedState) {
      return;
    }
    this.removeIfPeekingForTest(evt.item.item.extId);
  }
  closePeekOnCertainResultEvents(evt) {
    if ("started" in evt) {
      this.peek.set(void 0, void 0);
    }
    if ("removed" in evt && this.testResults.results.length === 0) {
      this.peek.set(void 0, void 0);
    }
  }
  retrieveTest(uri5) {
    const parts = parseTestUri(uri5);
    if (!parts) {
      return void 0;
    }
    const result = this.testResults.results.find((r2) => r2.id === parts.resultId);
    if (!result) {
      return;
    }
    if (parts.type === 0 /* TaskOutput */) {
      return new TaskSubject(result, parts.taskIndex);
    }
    if (parts.type === 1 /* TestOutput */) {
      const test2 = result.getStateById(parts.testExtId);
      if (!test2) {
        return;
      }
      return new TestOutputSubject(result, parts.taskIndex, test2);
    }
    const { testExtId, taskIndex, messageIndex } = parts;
    const test = result?.getStateById(testExtId);
    if (!test || !test.tasks[parts.taskIndex]) {
      return;
    }
    return new MessageSubject(result, test, taskIndex, messageIndex);
  }
};

TestingOutputPeekController = __decorateClass([
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITestResultService),
  __decorateParam(4, IContextKeyService)
], TestingOutputPeekController);

var TestResultsPeek = class extends PeekViewWidget {
  constructor(editor, themeService, peekViewService, testingPeek, contextKeyService, menuService, instantiationService, modelService, codeEditorService, uriIdentityService) {
    super(editor, { showFrame: true, frameWidth: 1, showArrow: true, isResizeable: true, isAccessible: true, className: "test-output-peek" }, instantiationService);
    this.themeService = themeService;
    this.testingPeek = testingPeek;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.modelService = modelService;
    this.codeEditorService = codeEditorService;
    this.uriIdentityService = uriIdentityService;
    this.current = observableValue("testPeekCurrent", void 0);
    this.resizeOnNextContentHeightUpdate = false;
    this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme, this));
    peekViewService.addExclusiveWidget(editor, this);
  }
  _getMaximumHeightInLines() {
    const defaultMaxHeight = super._getMaximumHeightInLines();
    const contentHeight = this.content?.contentHeight;
    if (!contentHeight) {
      return defaultMaxHeight;
    }
    if (this.testingPeek.historyVisible.value) {
      return defaultMaxHeight;
    }
    const lineHeight = this.editor.getOption(75 /* lineHeight */);
    const basePeekOverhead = 41;
    return Math.min(defaultMaxHeight || Infinity, (contentHeight + basePeekOverhead) / lineHeight + 1);
  }
  applyTheme() {
    const theme = this.themeService.getColorTheme();
    const current = this.current.get();
    const isError = current instanceof MessageSubject && current.message.type === 0 /* Error */;
    const borderColor = (isError ? theme.getColor(testingPeekBorder) : theme.getColor(testingMessagePeekBorder)) || Color.transparent;
    const headerBg = (isError ? theme.getColor(testingPeekHeaderBackground) : theme.getColor(testingPeekMessageHeaderBackground)) || Color.transparent;
    const editorBg = theme.getColor(editorBackground);
    this.style({
      arrowColor: borderColor,
      frameColor: borderColor,
      headerBackgroundColor: editorBg && headerBg ? headerBg.makeOpaque(editorBg) : headerBg,
      primaryHeadingColor: theme.getColor(peekViewTitleForeground),
      secondaryHeadingColor: theme.getColor(peekViewTitleInfoForeground)
    });
  }
  _fillContainer(container3) {
    if (!this.scopedContextKeyService) {
      this.scopedContextKeyService = this._disposables.add(this.contextKeyService.createScoped(container3));
      TestingContextKeys.isInPeek.bindTo(this.scopedContextKeyService).set(true);
      const instaService = this._disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
      this.content = this._disposables.add(instaService.createInstance(TestResultsViewContent, this.editor, { historyVisible: this.testingPeek.historyVisible, showRevealLocationOnMessages: false, locationForProgress: "workbench.panel.testResults.view" /* ResultsViewId */ }));
      this._disposables.add(this.content.onClose(() => {
        TestingOutputPeekController.get(this.editor)?.removePeek();
      }));
    }
    super._fillContainer(container3);
  }
  _fillHead(container3) {
    super._fillHead(container3);
    const menuContextKeyService = this._disposables.add(this.contextKeyService.createScoped(container3));
    this._disposables.add(bindContextKey(
      TestingContextKeys.peekHasStack,
      menuContextKeyService,
      (reader) => inspectSubjectHasStack(this.current.read(reader))
    ));
    const menu = this.menuService.createMenu(MenuId.TestPeekTitle, menuContextKeyService);
    const actionBar3 = this._actionbarWidget;
    this._disposables.add(menu.onDidChange(() => {
      actions.length = 0;
      fillInActionBarActions(menu.getActions(), actions);
      while (actionBar3.getAction(1)) {
        actionBar3.pull(0);
      }
      actionBar3.push(actions, { label: false, icon: true, index: 0 });
    }));
    const actions = [];
    fillInActionBarActions(menu.getActions(), actions);
    actionBar3.push(actions, { label: false, icon: true, index: 0 });
  }
  _fillBody(containerElement) {
    this.content.fillBody(containerElement);
    const contentHeightSettleTimer = this._disposables.add(new RunOnceScheduler(() => {
      this.resizeOnNextContentHeightUpdate = false;
    }, 500));
    this._disposables.add(this.content.onDidChangeContentHeight((height) => {
      if (!this.resizeOnNextContentHeightUpdate || !height) {
        return;
      }
      const displayed = this._getMaximumHeightInLines();
      if (displayed) {
        this._relayout(Math.min(displayed, this.getVisibleEditorLines() / 2), true);
        if (!contentHeightSettleTimer.isScheduled()) {
          contentHeightSettleTimer.schedule();
        }
      }
    }));
    this._disposables.add(this.content.onDidRequestReveal((sub) => {
      TestingOutputPeekController.get(this.editor)?.show(sub instanceof MessageSubject ? sub.messageUri : sub.outputUri);
    }));
  }
  /**
   * Updates the test to be shown.
   */
  setModel(subject) {
    if (subject instanceof TaskSubject || subject instanceof TestOutputSubject) {
      this.current.set(subject, void 0);
      return this.showInPlace(subject);
    }
    const previous = this.current;
    const revealLocation = subject.revealLocation?.range.getStartPosition();
    if (!revealLocation && !previous) {
      return Promise.resolve();
    }
    this.current.set(subject, void 0);
    if (!revealLocation) {
      return this.showInPlace(subject);
    }
    this.resizeOnNextContentHeightUpdate = true;
    this.show(revealLocation, 10);
    this.editor.revealRangeNearTopIfOutsideViewport(Range2.fromPositions(revealLocation), 0 /* Smooth */);
    return this.showInPlace(subject);
  }
  /**
   * Collapses all displayed stack frames.
   */
  collapseStack() {
    this.content.collapseStack();
  }
  getVisibleEditorLines() {
    return Math.round(this.editor.getDomNode().clientHeight / this.editor.getOption(75 /* lineHeight */));
  }
  /**
   * Shows a message in-place without showing or changing the peek location.
   * This is mostly used if peeking a message without a location.
   */
  async showInPlace(subject) {
    if (subject instanceof MessageSubject) {
      const message = subject.message;
      this.setTitle(firstLine2(renderTestMessageAsText(message.message)), stripIcons(subject.test.label));
    } else {
      this.setTitle(localize(21201, null));
    }
    this.applyTheme();
    await this.content.reveal({ subject, preserveFocus: false });
  }
  /** @override */
  _doLayoutBody(height, width2) {
    super._doLayoutBody(height, width2);
    this.content.onLayoutBody(height, width2);
  }
  /** @override */
  _onWidth(width2) {
    super._onWidth(width2);
    if (this.dimension) {
      this.dimension = new Dimension(width2, this.dimension.height);
    }
    this.content.onWidth(width2);
  }
};

TestResultsPeek = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IPeekViewService),
  __decorateParam(3, ITestingPeekOpener),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ITextModelService),
  __decorateParam(8, ICodeEditorService),
  __decorateParam(9, IUriIdentityService)
], TestResultsPeek);

var TestResultsView = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, resultService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.resultService = resultService;
    this.content = new Lazy(() => this._register(this.instantiationService.createInstance(TestResultsViewContent, void 0, {
      historyVisible: staticObservableValue(true),
      showRevealLocationOnMessages: true,
      locationForProgress: "workbench.view.testing" /* ExplorerViewId */
    })));
  }
  get subject() {
    return this.content.rawValue?.current;
  }
  showLatestRun(preserveFocus = false) {
    const result = this.resultService.results.find((r2) => r2.tasks.length);
    if (!result) {
      return;
    }
    this.content.rawValue?.reveal({ preserveFocus, subject: new TaskSubject(result, 0) });
  }
  renderBody(container3) {
    super.renderBody(container3);
    if (this.isBodyVisible()) {
      this.renderContent(container3);
    } else {
      this._register(Event2.once(Event2.filter(this.onDidChangeBodyVisibility, Boolean))(() => this.renderContent(container3)));
    }
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.content.rawValue?.onLayoutBody(height, width2);
  }
  renderContent(container3) {
    const content2 = this.content.value;
    content2.fillBody(container3);
    this._register(content2.onDidRequestReveal((subject) => content2.reveal({ preserveFocus: true, subject })));
    const [lastResult] = this.resultService.results;
    if (lastResult && lastResult.tasks.length) {
      content2.reveal({ preserveFocus: true, subject: new TaskSubject(lastResult, 0) });
    }
  }
};

TestResultsView = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, ITestResultService)
], TestResultsView);

var firstLine2 = (str) => {
  const index2 = str.indexOf("\n");
  return index2 === -1 ? str : str.slice(0, index2);
};

function getOuterEditorFromDiffEditor(codeEditorService) {
  const diffEditors = codeEditorService.listDiffEditors();
  for (const diffEditor of diffEditors) {
    if (diffEditor.hasTextFocus() && diffEditor instanceof EmbeddedDiffEditorWidget) {
      return diffEditor.getParentEditor();
    }
  }
  return null;
}

var CloseTestPeek = class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.closeTestPeek",
      title: localize2(21191, "Close"),
      icon: Codicon.close,
      precondition: ContextKeyExpr.or(TestingContextKeys.isInPeek, TestingContextKeys.isPeekVisible),
      keybinding: {
        weight: 100 /* EditorContrib */ - 101,
        primary: 9 /* Escape */,
        when: ContextKeyExpr.not("config.editor.stablePeek")
      }
    });
  }
  runEditorCommand(accessor, editor) {
    const parent = getPeekedEditorFromFocus(accessor.get(ICodeEditorService));
    TestingOutputPeekController.get(parent ?? editor)?.removePeek();
  }
};

var navWhen = ContextKeyExpr.and(
  EditorContextKeys.focus,
  TestingContextKeys.isPeekVisible
);

var getPeekedEditorFromFocus = (codeEditorService) => {
  const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
  return editor && getPeekedEditor(codeEditorService, editor);
};

var getPeekedEditor = (codeEditorService, editor) => {
  if (TestingOutputPeekController.get(editor)?.subject.get()) {
    return editor;
  }
  if (editor instanceof EmbeddedCodeEditorWidget) {
    return editor.getParentEditor();
  }
  const outer = getOuterEditorFromDiffEditor(codeEditorService);
  if (outer) {
    return outer;
  }
  return editor;
};

var GoToNextMessageAction = class _GoToNextMessageAction extends Action2 {
  static {
    this.ID = "testing.goToNextMessage";
  }
  constructor() {
    super({
      id: _GoToNextMessageAction.ID,
      f1: true,
      title: localize2(21193, "Go to Next Test Failure"),
      metadata: {
        description: localize2(21194, "Shows the next failure message in your file")
      },
      icon: Codicon.arrowDown,
      category: Categories.Test,
      keybinding: {
        primary: 512 /* Alt */ | 66 /* F8 */,
        weight: 100 /* EditorContrib */ + 1,
        when: navWhen
      },
      menu: [{
        id: MenuId.TestPeekTitle,
        group: "navigation",
        order: 2
      }, {
        id: MenuId.CommandPalette,
        when: navWhen
      }]
    });
  }
  run(accessor) {
    const editor = getPeekedEditorFromFocus(accessor.get(ICodeEditorService));
    if (editor) {
      TestingOutputPeekController.get(editor)?.next();
    }
  }
};

var GoToPreviousMessageAction = class _GoToPreviousMessageAction extends Action2 {
  static {
    this.ID = "testing.goToPreviousMessage";
  }
  constructor() {
    super({
      id: _GoToPreviousMessageAction.ID,
      f1: true,
      title: localize2(21195, "Go to Previous Test Failure"),
      metadata: {
        description: localize2(21196, "Shows the previous failure message in your file")
      },
      icon: Codicon.arrowUp,
      category: Categories.Test,
      keybinding: {
        primary: 1024 /* Shift */ | 512 /* Alt */ | 66 /* F8 */,
        weight: 100 /* EditorContrib */ + 1,
        when: navWhen
      },
      menu: [{
        id: MenuId.TestPeekTitle,
        group: "navigation",
        order: 1
      }, {
        id: MenuId.CommandPalette,
        when: navWhen
      }]
    });
  }
  run(accessor) {
    const editor = getPeekedEditorFromFocus(accessor.get(ICodeEditorService));
    if (editor) {
      TestingOutputPeekController.get(editor)?.previous();
    }
  }
};

var CollapsePeekStack = class _CollapsePeekStack extends Action2 {
  static {
    this.ID = "testing.collapsePeekStack";
  }
  constructor() {
    super({
      id: _CollapsePeekStack.ID,
      title: localize2(21192, "Collapse Stack Frames"),
      icon: Codicon.collapseAll,
      category: Categories.Test,
      menu: [{
        id: MenuId.TestPeekTitle,
        when: TestingContextKeys.peekHasStack,
        group: "navigation",
        order: 4
      }]
    });
  }
  run(accessor) {
    const editor = getPeekedEditorFromFocus(accessor.get(ICodeEditorService));
    if (editor) {
      TestingOutputPeekController.get(editor)?.collapseStack();
    }
  }
};

var OpenMessageInEditorAction = class _OpenMessageInEditorAction extends Action2 {
  static {
    this.ID = "testing.openMessageInEditor";
  }
  constructor() {
    super({
      id: _OpenMessageInEditorAction.ID,
      f1: false,
      title: localize2(21198, "Open in Editor"),
      icon: Codicon.goToFile,
      category: Categories.Test,
      menu: [{ id: MenuId.TestPeekTitle }]
    });
  }
  run(accessor) {
    accessor.get(ITestingPeekOpener).openCurrentInEditor();
  }
};

var ToggleTestingPeekHistory = class _ToggleTestingPeekHistory extends Action2 {
  static {
    this.ID = "testing.toggleTestingPeekHistory";
  }
  constructor() {
    super({
      id: _ToggleTestingPeekHistory.ID,
      f1: true,
      title: localize2(21199, "Toggle Test History in Peek"),
      metadata: {
        description: localize2(21200, "Shows or hides the history of test runs in the peek view")
      },
      icon: Codicon.history,
      category: Categories.Test,
      menu: [{
        id: MenuId.TestPeekTitle,
        group: "navigation",
        order: 3
      }],
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 512 /* Alt */ | 38 /* KeyH */,
        when: TestingContextKeys.isPeekVisible.isEqualTo(true)
      }
    });
  }
  run(accessor) {
    const opener = accessor.get(ITestingPeekOpener);
    opener.historyVisible.value = !opener.historyVisible.value;
  }
};
export { allMessages, messageItReferenceToUri, getOuterEditorFromDiffEditor, TestingPeekOpener, TestingOutputPeekController, TestResultsPeek, TestResultsView, firstLine2, CloseTestPeek, navWhen, getPeekedEditorFromFocus, getPeekedEditor, GoToNextMessageAction, GoToPreviousMessageAction, CollapsePeekStack, OpenMessageInEditorAction, ToggleTestingPeekHistory };
