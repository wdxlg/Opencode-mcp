// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testingDecorations.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { RunOnceScheduler, Throttler, timeout } from "./module-0036.mjs";
import { EditorLineNumberContextMenu, GutterActionsRegistry } from "./module-2448.mjs";
import { Iterable } from "./module-0011.mjs";
import { getTestingConfiguration } from "./module-3023.mjs";
import { ITestingDecorationsService, TestDecorations } from "./module-3035.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITestService, getContextForTestItem, simplifyTestsToExecute, testsInFile } from "./module-1435.mjs";
import { ITestResultService } from "./module-1434.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { $, EventType, addDisposableListener, getWindow, h } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { buildTestUri, parseTestUri } from "./module-3032.mjs";
import { mapFindFirst } from "./module-0006.mjs";
import { Position } from "./module-0079.mjs";
import { LiveTestResult } from "./module-1432.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { labelForTestInState } from "./module-1427.mjs";
import { isFailedState, maxPriority } from "./module-1430.mjs";
import { testingDebugAllIcon, testingDebugIcon, testingRunAllIcon, testingRunIcon, testingStatesToIcons } from "./module-3039.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { overviewRulerError, overviewRulerInfo } from "./module-0288.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { equals } from "./module-0007.mjs";
import { Action, Separator, SubmenuAction } from "./module-0082.mjs";
import { getTestItemContextOverlay } from "./module-3048.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITestProfileService } from "./module-1429.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { TestId } from "./module-1207.mjs";
import { stripIcons } from "./module-0461.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { generateUuid } from "./module-0190.mjs";
import { clamp } from "./module-0040.mjs";
import { renderTestMessageAsText } from "./module-3049.mjs";
import { ITestingPeekOpener } from "./module-3036.mjs";
import { count, truncateMiddle } from "./module-0030.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { TestingOutputPeekController } from "./module-3070.mjs";
import { autorun } from "./module-0052.mjs";
import { MessageSubject } from "./module-3050.mjs";


// src/vs/workbench/contrib/testing/browser/testingDecorations.ts
var MAX_INLINE_MESSAGE_LENGTH = 128;

var MAX_TESTS_IN_SUBMENU = 30;

var GLYPH_MARGIN_LANE = 2 /* Center */;

function isOriginalInDiffEditor(codeEditorService, codeEditor) {
  const diffEditors = codeEditorService.listDiffEditors();
  for (const diffEditor of diffEditors) {
    if (diffEditor.getOriginalEditor() === codeEditor) {
      return true;
    }
  }
  return false;
}

var CachedDecorations = class {
  constructor() {
    this.runByIdKey = /* @__PURE__ */ new Map();
  }
  get size() {
    return this.runByIdKey.size;
  }
  /** Gets a test run decoration that contains exactly the given test IDs */
  getForExactTests(testIds) {
    const key3 = testIds.sort().join("\0\0");
    return this.runByIdKey.get(key3);
  }
  /** Adds a new test run decroation */
  addTest(d) {
    const key3 = d.testIds.sort().join("\0\0");
    this.runByIdKey.set(key3, d);
  }
  /** Finds an extension by VS Code event ID */
  getById(decorationId) {
    for (const d of this.runByIdKey.values()) {
      if (d.id === decorationId) {
        return d;
      }
    }
    return void 0;
  }
  /** Iterate over all decorations */
  *[Symbol.iterator]() {
    for (const d of this.runByIdKey.values()) {
      yield d;
    }
  }
};

var TestingDecorationService = class extends Disposable {
  constructor(codeEditorService, configurationService, testService, results, instantiationService, modelService) {
    super();
    this.configurationService = configurationService;
    this.testService = testService;
    this.results = results;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.generation = 0;
    this.changeEmitter = this._register(new Emitter());
    this.decorationCache = new ResourceMap();
    /**
     * List of messages that should be hidden because an editor changed their
     * underlying ranges. I think this is good enough, because:
     *  - Message decorations are never shown across reloads; this does not
     *    need to persist
     *  - Message instances are stable for any completed test results for
     *    the duration of the session.
     */
    this.invalidatedMessages = /* @__PURE__ */ new WeakSet();
    /** @inheritdoc */
    this.onDidChange = this.changeEmitter.event;
    this._register(codeEditorService.registerDecorationType("test-message-decoration", TestMessageDecoration.decorationId, {}, void 0));
    this._register(modelService.onModelRemoved((e) => this.decorationCache.delete(e.uri)));
    const debounceInvalidate = this._register(new RunOnceScheduler(() => this.invalidate(), 100));
    this._register(this.testService.onWillProcessDiff((diff4) => {
      for (const entry of diff4) {
        if (entry.op !== 2 /* DocumentSynced */) {
          continue;
        }
        const rec = this.decorationCache.get(entry.uri);
        if (rec) {
          rec.rangeUpdateVersionId = entry.docv;
        }
      }
      if (!debounceInvalidate.isScheduled()) {
        debounceInvalidate.schedule();
      }
    }));
    this._register(Event2.any(
      this.results.onResultsChanged,
      this.results.onTestChanged,
      this.testService.excluded.onTestExclusionsChanged,
      Event2.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("testing.gutterEnabled" /* GutterEnabled */))
    )(() => {
      if (!debounceInvalidate.isScheduled()) {
        debounceInvalidate.schedule();
      }
    }));
    this._register(GutterActionsRegistry.registerGutterActionsGenerator((context2, result) => {
      const model = context2.editor.getModel();
      const testingDecorations = TestingDecorations.get(context2.editor);
      if (!model || !testingDecorations?.currentUri) {
        return;
      }
      const currentDecorations = this.syncDecorations(testingDecorations.currentUri);
      if (!currentDecorations.size) {
        return;
      }
      const modelDecorations = model.getLinesDecorations(context2.lineNumber, context2.lineNumber);
      for (const { id: id2 } of modelDecorations) {
        const decoration3 = currentDecorations.getById(id2);
        if (decoration3) {
          const { object: actions } = decoration3.getContextMenuActions();
          for (const action of actions) {
            result.push(action, "1_testing");
          }
        }
      }
    }));
  }
  /** @inheritdoc */
  invalidateResultMessage(message) {
    this.invalidatedMessages.add(message);
    this.invalidate();
  }
  /** @inheritdoc */
  syncDecorations(resource) {
    const model = this.modelService.getModel(resource);
    if (!model) {
      return new CachedDecorations();
    }
    const cached = this.decorationCache.get(resource);
    if (cached && cached.generation === this.generation && (cached.rangeUpdateVersionId === void 0 || cached.rangeUpdateVersionId !== model.getVersionId())) {
      return cached.value;
    }
    return this.applyDecorations(model);
  }
  /** @inheritdoc */
  getDecoratedTestPosition(resource, testId) {
    const model = this.modelService.getModel(resource);
    if (!model) {
      return void 0;
    }
    const decoration3 = Iterable.find(this.syncDecorations(resource), (v2) => v2 instanceof RunTestDecoration && v2.isForTest(testId));
    if (!decoration3) {
      return void 0;
    }
    return model.getDecorationRange(decoration3.id)?.getStartPosition();
  }
  invalidate() {
    this.generation++;
    this.changeEmitter.fire();
  }
  /**
   * Sets whether alternate actions are shown for the model.
   */
  updateDecorationsAlternateAction(resource, isAlt) {
    const model = this.modelService.getModel(resource);
    const cached = this.decorationCache.get(resource);
    if (!model || !cached || cached.isAlt === isAlt) {
      return;
    }
    cached.isAlt = isAlt;
    model.changeDecorations((accessor) => {
      for (const decoration3 of cached.value) {
        if (decoration3 instanceof RunTestDecoration && decoration3.editorDecoration.alternate) {
          accessor.changeDecorationOptions(
            decoration3.id,
            isAlt ? decoration3.editorDecoration.alternate : decoration3.editorDecoration.options
          );
        }
      }
    });
  }
  /**
   * Applies the current set of test decorations to the given text model.
   */
  applyDecorations(model) {
    const gutterEnabled = getTestingConfiguration(this.configurationService, "testing.gutterEnabled" /* GutterEnabled */);
    const cached = this.decorationCache.get(model.uri);
    const testRangesUpdated = cached?.rangeUpdateVersionId === model.getVersionId();
    const lastDecorations = cached?.value ?? new CachedDecorations();
    const newDecorations = model.changeDecorations((accessor) => {
      const newDecorations2 = new CachedDecorations();
      const runDecorations = new TestDecorations();
      for (const test of this.testService.collection.getNodeByUrl(model.uri)) {
        if (!test.item.range) {
          continue;
        }
        const stateLookup = this.results.getStateById(test.item.extId);
        const line = test.item.range.startLineNumber;
        runDecorations.push({ line, id: "", test, resultItem: stateLookup?.[1] });
      }
      for (const [line, tests] of runDecorations.lines()) {
        const multi = tests.length > 1;
        let existing = lastDecorations.getForExactTests(tests.map((t2) => t2.test.item.extId));
        if (existing && testRangesUpdated && model.getDecorationRange(existing.id)?.startLineNumber !== line) {
          existing = void 0;
        }
        if (existing) {
          if (existing.replaceOptions(tests, gutterEnabled)) {
            accessor.changeDecorationOptions(existing.id, existing.editorDecoration.options);
          }
          newDecorations2.addTest(existing);
        } else {
          newDecorations2.addTest(multi ? this.instantiationService.createInstance(MultiRunTestDecoration, tests, gutterEnabled, model) : this.instantiationService.createInstance(RunSingleTestDecoration, tests[0].test, tests[0].resultItem, model, gutterEnabled));
        }
      }
      const saveFromRemoval = /* @__PURE__ */ new Set();
      for (const decoration3 of newDecorations2) {
        if (decoration3.id === "") {
          decoration3.id = accessor.addDecoration(decoration3.editorDecoration.range, decoration3.editorDecoration.options);
        } else {
          saveFromRemoval.add(decoration3.id);
        }
      }
      for (const decoration3 of lastDecorations) {
        if (!saveFromRemoval.has(decoration3.id)) {
          accessor.removeDecoration(decoration3.id);
        }
      }
      this.decorationCache.set(model.uri, {
        generation: this.generation,
        rangeUpdateVersionId: cached?.rangeUpdateVersionId,
        value: newDecorations2
      });
      return newDecorations2;
    });
    return newDecorations || lastDecorations;
  }
};

TestingDecorationService = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ITestService),
  __decorateParam(3, ITestResultService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IModelService)
], TestingDecorationService);

var TestingDecorations = class extends Disposable {
  constructor(editor, codeEditorService, testService, decorations, uriIdentityService, results, configurationService, instantiationService) {
    super();
    this.editor = editor;
    this.codeEditorService = codeEditorService;
    this.testService = testService;
    this.decorations = decorations;
    this.uriIdentityService = uriIdentityService;
    this.results = results;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.expectedWidget = this._register(new MutableDisposable());
    this.actualWidget = this._register(new MutableDisposable());
    this.errorContentWidgets = this._register(new DisposableMap());
    this.loggedMessageDecorations = /* @__PURE__ */ new Map();
    this._register(codeEditorService.registerDecorationType("test-message-decoration", TestMessageDecoration.decorationId, {}, void 0, editor));
    this.attachModel(editor.getModel()?.uri);
    this._register(decorations.onDidChange(() => {
      if (this._currentUri) {
        decorations.syncDecorations(this._currentUri);
      }
    }));
    const msgThrottler = this._register(new Throttler());
    this._register(this.results.onTestChanged((ev) => {
      if (ev.reason !== 2 /* NewMessage */) {
        return;
      }
      msgThrottler.queue(() => {
        this.applyResults();
        return timeout(100);
      });
    }));
    this._register(Event2.any(
      this.results.onResultsChanged,
      editor.onDidChangeModel,
      this.testService.showInlineOutput.onDidChange
    )(() => this.applyResults()));
    const win = getWindow(editor.getDomNode());
    this._register(addDisposableListener(win, "keydown", (e) => {
      if (new StandardKeyboardEvent(e).keyCode === 6 /* Alt */ && this._currentUri) {
        decorations.updateDecorationsAlternateAction(this._currentUri, true);
      }
    }));
    this._register(addDisposableListener(win, "keyup", (e) => {
      if (new StandardKeyboardEvent(e).keyCode === 6 /* Alt */ && this._currentUri) {
        decorations.updateDecorationsAlternateAction(this._currentUri, false);
      }
    }));
    this._register(addDisposableListener(win, "blur", () => {
      if (this._currentUri) {
        decorations.updateDecorationsAlternateAction(this._currentUri, false);
      }
    }));
    this._register(this.editor.onKeyUp((e) => {
      if (e.keyCode === 6 /* Alt */ && this._currentUri) {
        decorations.updateDecorationsAlternateAction(this._currentUri, false);
      }
    }));
    this._register(this.editor.onDidChangeModel((e) => this.attachModel(e.newModelUrl || void 0)));
    this._register(this.editor.onMouseDown((e) => {
      if (e.target.position && this.currentUri) {
        const modelDecorations = editor.getModel()?.getLineDecorations(e.target.position.lineNumber) ?? [];
        if (!modelDecorations.length) {
          return;
        }
        const cache2 = decorations.syncDecorations(this.currentUri);
        for (const { id: id2 } of modelDecorations) {
          if (cache2.getById(id2)?.click(e)) {
            e.event.stopPropagation();
            return;
          }
        }
      }
    }));
    this._register(Event2.accumulate(this.editor.onDidChangeModelContent, 0, void 0, this._store)((evts) => {
      const model = editor.getModel();
      if (!this._currentUri || !model) {
        return;
      }
      let changed = false;
      for (const [message, deco] of this.loggedMessageDecorations) {
        const invalidate = evts.some((e) => e.changes.some(
          (c) => c.range.startLineNumber <= deco.line && c.range.endLineNumber >= deco.line || deco.resultItem?.item.range && deco.resultItem.item.range.startLineNumber <= c.range.startLineNumber && deco.resultItem.item.range.endLineNumber >= c.range.endLineNumber
        ));
        if (invalidate) {
          changed = true;
          TestingDecorations.invalidatedTests.add(deco.resultItem || message);
        }
      }
      if (changed) {
        this.applyResults();
      }
    }));
    const updateFontFamilyVar = () => {
      this.editor.getContainerDomNode().style.setProperty("--testMessageDecorationFontFamily", editor.getOption(58 /* fontFamily */));
      this.editor.getContainerDomNode().style.setProperty("--testMessageDecorationFontSize", `${editor.getOption(61 /* fontSize */)}px`);
    };
    this._register(this.editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(58 /* fontFamily */)) {
        updateFontFamilyVar();
      }
    }));
    updateFontFamilyVar();
  }
  static {
    /**
     * Results invalidated by editor changes.
     */
    this.invalidatedTests = /* @__PURE__ */ new WeakSet();
  }
  /**
   * Gets the decorations associated with the given code editor.
   */
  static get(editor) {
    return editor.getContribution("editor.contrib.testingDecorations" /* DecorationsContributionId */);
  }
  get currentUri() {
    return this._currentUri;
  }
  attachModel(uri5) {
    switch (uri5 && parseTestUri(uri5)?.type) {
      case 4 /* ResultExpectedOutput */:
        this.expectedWidget.value = new ExpectedLensContentWidget(this.editor);
        this.actualWidget.clear();
        break;
      case 3 /* ResultActualOutput */:
        this.expectedWidget.clear();
        this.actualWidget.value = new ActualLensContentWidget(this.editor);
        break;
      default:
        this.expectedWidget.clear();
        this.actualWidget.clear();
    }
    if (isOriginalInDiffEditor(this.codeEditorService, this.editor)) {
      uri5 = void 0;
    }
    this._currentUri = uri5;
    if (!uri5) {
      return;
    }
    this.decorations.syncDecorations(uri5);
    (async () => {
      for await (const _tests of testsInFile(this.testService, this.uriIdentityService, uri5, false)) {
        if (this._currentUri !== uri5) {
          break;
        }
      }
    })();
  }
  applyResults() {
    const model = this.editor.getModel();
    if (!model) {
      return this.clearResults();
    }
    const uriStr = model.uri.toString();
    const seenLines = /* @__PURE__ */ new Set();
    this.applyResultsContentWidgets(uriStr, seenLines);
    this.applyResultsLoggedMessages(uriStr, seenLines);
  }
  clearResults() {
    this.errorContentWidgets.clearAndDisposeAll();
  }
  isMessageInvalidated(message) {
    return TestingDecorations.invalidatedTests.has(message);
  }
  applyResultsContentWidgets(uriStr, seenLines) {
    const seen = /* @__PURE__ */ new Set();
    if (getTestingConfiguration(this.configurationService, "testing.showAllMessages" /* ShowAllMessages */)) {
      this.results.results.forEach((lastResult) => this.applyContentWidgetsFromResult(lastResult, uriStr, seen, seenLines));
    } else if (this.results.results.length) {
      this.applyContentWidgetsFromResult(this.results.results[0], uriStr, seen, seenLines);
    }
    for (const message of this.errorContentWidgets.keys()) {
      if (!seen.has(message)) {
        this.errorContentWidgets.deleteAndDispose(message);
      }
    }
  }
  applyContentWidgetsFromResult(lastResult, uriStr, seen, seenLines) {
    for (const test of lastResult.tests) {
      if (TestingDecorations.invalidatedTests.has(test)) {
        continue;
      }
      for (let taskId = 0; taskId < test.tasks.length; taskId++) {
        const state = test.tasks[taskId];
        for (let i2 = 0; i2 < state.messages.length; i2++) {
          const m = state.messages[i2];
          if (m.type !== 0 /* Error */ || this.isMessageInvalidated(m)) {
            continue;
          }
          const line = m.location?.uri.toString() === uriStr ? m.location.range.startLineNumber : m.stackTrace && mapFindFirst(m.stackTrace, (f) => f.position && f.uri?.toString() === uriStr ? f.position.lineNumber : void 0);
          if (line === void 0 || seenLines.has(line)) {
            continue;
          }
          const model = this.editor.getModel();
          if (model && (line < 1 || line > model.getLineCount())) {
            continue;
          }
          seenLines.add(line);
          let deco = this.errorContentWidgets.get(m);
          if (!deco) {
            const lineLength = model?.getLineLength(line) ?? 100;
            deco = this.instantiationService.createInstance(
              TestErrorContentWidget,
              this.editor,
              new Position(line, lineLength + 1),
              m,
              test,
              buildTestUri({
                type: 3 /* ResultActualOutput */,
                messageIndex: i2,
                taskIndex: taskId,
                resultId: lastResult.id,
                testExtId: test.item.extId
              })
            );
            this.errorContentWidgets.set(m, deco);
          }
          seen.add(m);
        }
      }
    }
  }
  applyResultsLoggedMessages(uriStr, messageLines) {
    this.editor.changeDecorations((accessor) => {
      const seen = /* @__PURE__ */ new Set();
      if (getTestingConfiguration(this.configurationService, "testing.showAllMessages" /* ShowAllMessages */)) {
        this.results.results.forEach((r2) => this.applyLoggedMessageFromResult(r2, uriStr, seen, messageLines, accessor));
      } else if (this.results.results.length) {
        this.applyLoggedMessageFromResult(this.results.results[0], uriStr, seen, messageLines, accessor);
      }
      for (const [message, { id: id2 }] of this.loggedMessageDecorations) {
        if (!seen.has(message)) {
          accessor.removeDecoration(id2);
        }
      }
    });
  }
  applyLoggedMessageFromResult(lastResult, uriStr, seen, messageLines, accessor) {
    if (!this.testService.showInlineOutput.value || !(lastResult instanceof LiveTestResult)) {
      return;
    }
    const tryAdd = (resultItem, m, uri5) => {
      if (this.isMessageInvalidated(m) || m.location?.uri.toString() !== uriStr) {
        return;
      }
      seen.add(m);
      const line = m.location.range.startLineNumber;
      if (messageLines.has(line) || this.loggedMessageDecorations.has(m)) {
        return;
      }
      const deco = this.instantiationService.createInstance(TestMessageDecoration, m, uri5, this.editor.getModel());
      messageLines.add(line);
      const id2 = accessor.addDecoration(
        deco.editorDecoration.range,
        deco.editorDecoration.options
      );
      this.loggedMessageDecorations.set(m, { id: id2, line, resultItem });
    };
    for (const test of lastResult.tests) {
      if (TestingDecorations.invalidatedTests.has(test)) {
        continue;
      }
      for (let taskId = 0; taskId < test.tasks.length; taskId++) {
        const state = test.tasks[taskId];
        for (let i2 = state.messages.length - 1; i2 >= 0; i2--) {
          const m = state.messages[i2];
          if (m.type === 1 /* Output */) {
            tryAdd(test, m, buildTestUri({
              type: 3 /* ResultActualOutput */,
              messageIndex: i2,
              taskIndex: taskId,
              resultId: lastResult.id,
              testExtId: test.item.extId
            }));
          }
        }
      }
    }
    for (const task of lastResult.tasks) {
      for (const m of task.otherMessages) {
        tryAdd(void 0, m);
      }
    }
  }
};

TestingDecorations = __decorateClass([
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, ITestService),
  __decorateParam(3, ITestingDecorationsService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, ITestResultService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IInstantiationService)
], TestingDecorations);

var collapseRange = (originalRange) => ({
  startLineNumber: originalRange.startLineNumber,
  endLineNumber: originalRange.startLineNumber,
  startColumn: originalRange.startColumn,
  endColumn: originalRange.startColumn
});

var createRunTestDecoration = (tests, states, visible, defaultGutterAction) => {
  const range2 = tests[0]?.item.range;
  if (!range2) {
    throw new Error("Test decorations can only be created for tests with a range");
  }
  if (!visible) {
    return {
      range: collapseRange(range2),
      options: { isWholeLine: true, description: "run-test-decoration" }
    };
  }
  let computedState = 0 /* Unset */;
  const hoverMessageParts = [];
  let testIdWithMessages;
  let retired = false;
  for (let i2 = 0; i2 < tests.length; i2++) {
    const test = tests[i2];
    const resultItem = states[i2];
    const state = resultItem?.computedState ?? 0 /* Unset */;
    if (hoverMessageParts.length < 10) {
      hoverMessageParts.push(labelForTestInState(test.item.label, state));
    }
    computedState = maxPriority(computedState, state);
    retired = retired || !!resultItem?.retired;
    if (!testIdWithMessages && resultItem?.tasks.some((t2) => t2.messages.length)) {
      testIdWithMessages = test.item.extId;
    }
  }
  const hasMultipleTests = tests.length > 1 || tests[0].children.size > 0;
  const primaryIcon = computedState === 0 /* Unset */ ? hasMultipleTests ? testingRunAllIcon : testingRunIcon : testingStatesToIcons.get(computedState);
  const alternateIcon = defaultGutterAction === "debug" /* Debug */ ? hasMultipleTests ? testingRunAllIcon : testingRunIcon : hasMultipleTests ? testingDebugAllIcon : testingDebugIcon;
  let hoverMessage;
  let glyphMarginClassName = "testing-run-glyph";
  if (retired) {
    glyphMarginClassName += " retired";
  }
  const defaultOptions4 = {
    description: "run-test-decoration",
    showIfCollapsed: true,
    get hoverMessage() {
      if (!hoverMessage) {
        const building = hoverMessage = new MarkdownString("", true).appendText(hoverMessageParts.join(", ") + ".");
        if (testIdWithMessages) {
          const args2 = encodeURIComponent(JSON.stringify([testIdWithMessages]));
          building.appendMarkdown(` [${localize(21153, null)}](command:vscode.peekTestError?${args2})`);
        }
      }
      return hoverMessage;
    },
    glyphMargin: { position: GLYPH_MARGIN_LANE },
    glyphMarginClassName: `${ThemeIcon.asClassName(primaryIcon)} ${glyphMarginClassName}`,
    stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
    zIndex: 1e4,
    overviewRuler: isFailedState(computedState) ? { color: themeColorFromId2(overviewRulerError), position: 2 /* Center */ } : void 0
  };
  const alternateOptions = {
    ...defaultOptions4,
    glyphMarginClassName: `${ThemeIcon.asClassName(alternateIcon)} ${glyphMarginClassName}`
  };
  return {
    range: collapseRange(range2),
    options: defaultOptions4,
    alternate: alternateOptions
  };
};

var TitleLensContentWidget = class {
  constructor(editor) {
    this.editor = editor;
    /** @inheritdoc */
    this.allowEditorOverflow = false;
    /** @inheritdoc */
    this.suppressMouseDown = true;
    this._domNode = $("span");
    queueMicrotask(() => {
      this.applyStyling();
      this.editor.addContentWidget(this);
    });
  }
  applyStyling() {
    let fontSize = this.editor.getOption(25 /* codeLensFontSize */);
    let height;
    if (!fontSize || fontSize < 5) {
      fontSize = this.editor.getOption(61 /* fontSize */) * 0.9 | 0;
      height = this.editor.getOption(75 /* lineHeight */);
    } else {
      height = fontSize * Math.max(1.3, this.editor.getOption(75 /* lineHeight */) / this.editor.getOption(61 /* fontSize */)) | 0;
    }
    const editorFontInfo = this.editor.getOption(59 /* fontInfo */);
    const node = this._domNode;
    node.classList.add("testing-diff-lens-widget");
    node.textContent = this.getText();
    node.style.lineHeight = `${height}px`;
    node.style.fontSize = `${fontSize}px`;
    node.style.fontFamily = `var(--${"testingDiffLensFontFamily" /* FontFamily */})`;
    node.style.fontFeatureSettings = `var(--${"testingDiffLensFontFeatures" /* FontFeatures */})`;
    const containerStyle = this.editor.getContainerDomNode().style;
    containerStyle.setProperty("testingDiffLensFontFamily" /* FontFamily */, this.editor.getOption(24 /* codeLensFontFamily */) ?? "inherit");
    containerStyle.setProperty("testingDiffLensFontFeatures" /* FontFeatures */, editorFontInfo.fontFeatureSettings);
    this.editor.changeViewZones((accessor) => {
      if (this.viewZoneId) {
        accessor.removeZone(this.viewZoneId);
      }
      this.viewZoneId = accessor.addZone({
        afterLineNumber: 0,
        afterColumn: 1073741824 /* MAX_SAFE_SMALL_INTEGER */,
        domNode: document.createElement("div"),
        heightInPx: 20
      });
    });
  }
  /** @inheritdoc */
  getDomNode() {
    return this._domNode;
  }
  /** @inheritdoc */
  dispose() {
    this.editor.changeViewZones((accessor) => {
      if (this.viewZoneId) {
        accessor.removeZone(this.viewZoneId);
      }
    });
    this.editor.removeContentWidget(this);
  }
  /** @inheritdoc */
  getPosition() {
    return {
      position: { column: 0, lineNumber: 0 },
      preference: [1 /* ABOVE */]
    };
  }
};

var ExpectedLensContentWidget = class extends TitleLensContentWidget {
  getId() {
    return "expectedTestingLens";
  }
  getText() {
    return localize(21151, null);
  }
};

var ActualLensContentWidget = class extends TitleLensContentWidget {
  getId() {
    return "actualTestingLens";
  }
  getText() {
    return localize(21147, null);
  }
};

var RunTestDecoration = class {
  constructor(tests, visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfileService, contextKeyService, menuService) {
    this.tests = tests;
    this.visible = visible;
    this.model = model;
    this.codeEditorService = codeEditorService;
    this.testService = testService;
    this.contextMenuService = contextMenuService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.testProfileService = testProfileService;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    /** @inheritdoc */
    this.id = "";
    this.displayedStates = tests.map((t2) => t2.resultItem?.computedState);
    this.editorDecoration = createRunTestDecoration(
      tests.map((t2) => t2.test),
      tests.map((t2) => t2.resultItem),
      visible,
      getTestingConfiguration(this.configurationService, "testing.defaultGutterClickAction" /* DefaultGutterClickAction */)
    );
    this.editorDecoration.options.glyphMarginHoverMessage = new MarkdownString().appendText(this.getGutterLabel());
  }
  get line() {
    return this.editorDecoration.range.startLineNumber;
  }
  get testIds() {
    return this.tests.map((t2) => t2.test.item.extId);
  }
  /** @inheritdoc */
  click(e) {
    if (e.target.type !== 2 /* GUTTER_GLYPH_MARGIN */ || e.target.detail.glyphMarginLane !== GLYPH_MARGIN_LANE || e.event.rightButton || isMacintosh && e.event.leftButton && e.event.ctrlKey) {
      return false;
    }
    const alternateAction = e.event.altKey;
    switch (getTestingConfiguration(this.configurationService, "testing.defaultGutterClickAction" /* DefaultGutterClickAction */)) {
      case "contextMenu" /* ContextMenu */:
        this.showContextMenu(e);
        break;
      case "debug" /* Debug */:
        this.runWith(alternateAction ? 2 /* Run */ : 4 /* Debug */);
        break;
      case "runWithCoverage" /* Coverage */:
        this.runWith(alternateAction ? 4 /* Debug */ : 8 /* Coverage */);
        break;
      case "run" /* Run */:
      default:
        this.runWith(alternateAction ? 4 /* Debug */ : 2 /* Run */);
        break;
    }
    return true;
  }
  /**
   * Updates the decoration to match the new set of tests.
   * @returns true if options were changed, false otherwise
   */
  replaceOptions(newTests, visible) {
    const displayedStates = newTests.map((t2) => t2.resultItem?.computedState);
    if (visible === this.visible && equals(this.displayedStates, displayedStates)) {
      return false;
    }
    this.tests = newTests;
    this.displayedStates = displayedStates;
    this.visible = visible;
    const { options: options3, alternate } = createRunTestDecoration(
      newTests.map((t2) => t2.test),
      newTests.map((t2) => t2.resultItem),
      visible,
      getTestingConfiguration(this.configurationService, "testing.defaultGutterClickAction" /* DefaultGutterClickAction */)
    );
    this.editorDecoration.options = options3;
    this.editorDecoration.alternate = alternate;
    this.editorDecoration.options.glyphMarginHoverMessage = new MarkdownString().appendText(this.getGutterLabel());
    return true;
  }
  /**
   * Gets whether this decoration serves as the run button for the given test ID.
   */
  isForTest(testId) {
    return this.tests.some((t2) => t2.test.item.extId === testId);
  }
  runWith(profile) {
    return this.testService.runTests({
      tests: simplifyTestsToExecute(this.testService.collection, this.tests.map(({ test }) => test)),
      group: profile
    });
  }
  showContextMenu(e) {
    const editor = this.codeEditorService.listCodeEditors().find((e2) => e2.getModel() === this.model);
    editor?.getContribution(EditorLineNumberContextMenu.ID)?.show(e);
  }
  getGutterLabel() {
    switch (getTestingConfiguration(this.configurationService, "testing.defaultGutterClickAction" /* DefaultGutterClickAction */)) {
      case "contextMenu" /* ContextMenu */:
        return localize(21160, null);
      case "debug" /* Debug */:
        return localize(21162, null);
      case "runWithCoverage" /* Coverage */:
        return localize(21161, null);
      case "run" /* Run */:
      default:
        return localize(21163, null);
    }
  }
  /**
   * Gets context menu actions relevant for a singel test.
   */
  getTestContextMenuActions(test, resultItem) {
    const testActions = [];
    const capabilities = this.testProfileService.capabilitiesForTest(test.item);
    [
      { bitset: 2 /* Run */, label: localize(21157, null) },
      { bitset: 4 /* Debug */, label: localize(21150, null) },
      { bitset: 8 /* Coverage */, label: localize(21148, null) }
    ].forEach(({ bitset, label: label3 }) => {
      if (capabilities & bitset) {
        testActions.push(new Action(
          `testing.gutter.${bitset}`,
          label3,
          void 0,
          void 0,
          () => this.testService.runTests({ group: bitset, tests: [test] })
        ));
      }
    });
    if (capabilities & 16 /* HasNonDefaultProfile */) {
      testActions.push(new Action("testing.runUsing", localize(21164, null), void 0, void 0, async () => {
        const profile = await this.commandService.executeCommand("vscode.pickTestProfile", { onlyForTest: test });
        if (!profile) {
          return;
        }
        this.testService.runResolvedTests({
          group: profile.group,
          targets: [{
            profileId: profile.profileId,
            controllerId: profile.controllerId,
            testIds: [test.item.extId]
          }]
        });
      }));
    }
    if (resultItem && isFailedState(resultItem.computedState)) {
      testActions.push(new Action(
        "testing.gutter.peekFailure",
        localize(21152, null),
        void 0,
        void 0,
        () => this.commandService.executeCommand("vscode.peekTestError", test.item.extId)
      ));
    }
    if (resultItem?.computedState === 2 /* Running */) {
      testActions.push(new Action(
        "testing.gutter.cancel",
        localize(21159, null),
        void 0,
        void 0,
        () => this.commandService.executeCommand("testing.cancelRun" /* CancelTestRunAction */)
      ));
    }
    testActions.push(new Action(
      "testing.gutter.reveal",
      localize(21154, null),
      void 0,
      void 0,
      () => this.commandService.executeCommand("_revealTestInExplorer", test.item.extId)
    ));
    const contributed = this.getContributedTestActions(test, capabilities);
    return { object: Separator.join(testActions, contributed), dispose() {
      testActions.forEach((a) => a.dispose());
    } };
  }
  getContributedTestActions(test, capabilities) {
    const contextOverlay = this.contextKeyService.createOverlay(getTestItemContextOverlay(test, capabilities));
    const arg = getContextForTestItem(this.testService.collection, test.item.extId);
    const menu = this.menuService.getMenuActions(MenuId.TestItemGutter, contextOverlay, { shouldForwardArgs: true, arg });
    return getFlatContextMenuActions(menu);
  }
};

RunTestDecoration = __decorateClass([
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, ITestService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ITestProfileService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IMenuService)
], RunTestDecoration);

var MultiRunTestDecoration = class extends RunTestDecoration {
  constructor(tests, visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfileService, contextKeyService, menuService, quickInputService) {
    super(tests, visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfileService, contextKeyService, menuService);
    this.quickInputService = quickInputService;
  }
  getContextMenuActions() {
    const disposable = new DisposableStore();
    const allActions = [];
    [
      { bitset: 2 /* Run */, label: localize(21155, null) },
      { bitset: 8 /* Coverage */, label: localize(21156, null) },
      { bitset: 4 /* Debug */, label: localize(21149, null) }
    ].forEach(({ bitset, label: label3 }, i2) => {
      const canRun = this.tests.some(({ test }) => this.testProfileService.capabilitiesForTest(test.item) & bitset);
      if (canRun) {
        allActions.push(new Action(`testing.gutter.run${i2}`, label3, void 0, void 0, () => this.runWith(bitset)));
      }
    });
    disposable.add(toDisposable(() => allActions.forEach((a) => a.dispose())));
    const testItems = this.tests.map((testItem) => ({
      currentLabel: testItem.test.item.label,
      testItem,
      parent: TestId.fromString(testItem.test.item.extId).parentId
    }));
    const getLabelConflicts = (tests) => {
      const labelCount = /* @__PURE__ */ new Map();
      for (const test of tests) {
        labelCount.set(test.currentLabel, (labelCount.get(test.currentLabel) || 0) + 1);
      }
      return tests.filter((e) => labelCount.get(e.currentLabel) > 1);
    };
    let conflicts, hasParent = true;
    while ((conflicts = getLabelConflicts(testItems)).length && hasParent) {
      for (const conflict of conflicts) {
        if (conflict.parent) {
          const parent = this.testService.collection.getNodeById(conflict.parent.toString());
          conflict.currentLabel = parent?.item.label + " > " + conflict.currentLabel;
          conflict.parent = conflict.parent.parentId;
        } else {
          hasParent = false;
        }
      }
    }
    testItems.sort((a, b) => {
      const ai = a.testItem.test.item;
      const bi = b.testItem.test.item;
      return (ai.sortText || ai.label).localeCompare(bi.sortText || bi.label);
    });
    let testSubmenus = testItems.map(({ currentLabel, testItem }) => {
      const actions = this.getTestContextMenuActions(testItem.test, testItem.resultItem);
      disposable.add(actions);
      let label3 = stripIcons(currentLabel);
      const lf = label3.indexOf("\n");
      if (lf !== -1) {
        label3 = label3.slice(0, lf);
      }
      return new SubmenuAction(testItem.test.item.extId, label3, actions.object);
    });
    const overflow = testSubmenus.length - MAX_TESTS_IN_SUBMENU;
    if (overflow > 0) {
      testSubmenus = testSubmenus.slice(0, MAX_TESTS_IN_SUBMENU);
      testSubmenus.push(new Action(
        "testing.gutter.overflow",
        localize(21165, null, overflow),
        void 0,
        void 0,
        () => this.pickAndRun(testItems)
      ));
    }
    return { object: Separator.join(allActions, testSubmenus), dispose: () => disposable.dispose() };
  }
  async pickAndRun(testItems) {
    const doPick = (items, title) => new Promise((resolve3) => {
      const disposables = new DisposableStore();
      const pick = disposables.add(this.quickInputService.createQuickPick());
      pick.placeholder = title;
      pick.items = items;
      disposables.add(pick.onDidHide(() => {
        resolve3(void 0);
        disposables.dispose();
      }));
      disposables.add(pick.onDidAccept(() => {
        resolve3(pick.selectedItems[0]);
        disposables.dispose();
      }));
      pick.show();
    });
    const item = await doPick(
      testItems.map(({ currentLabel, testItem }) => ({ label: currentLabel, test: testItem.test, result: testItem.resultItem })),
      localize(21158, null)
    );
    if (!item) {
      return;
    }
    const actions = this.getTestContextMenuActions(item.test, item.result);
    try {
      (await doPick(actions.object, item.label))?.run();
    } finally {
      actions.dispose();
    }
  }
};

MultiRunTestDecoration = __decorateClass([
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, ITestService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ITestProfileService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IMenuService),
  __decorateParam(11, IQuickInputService)
], MultiRunTestDecoration);

var RunSingleTestDecoration = class extends RunTestDecoration {
  constructor(test, resultItem, model, visible, codeEditorService, testService, commandService, contextMenuService, configurationService, testProfiles, contextKeyService, menuService) {
    super([{ test, resultItem }], visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfiles, contextKeyService, menuService);
  }
  getContextMenuActions() {
    return this.getTestContextMenuActions(this.tests[0].test, this.tests[0].resultItem);
  }
};

RunSingleTestDecoration = __decorateClass([
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, ITestService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, ITestProfileService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IMenuService)
], RunSingleTestDecoration);

var lineBreakRe = /\r?\n\s*/g;

var TestMessageDecoration = class {
  constructor(testMessage, messageUri, textModel, peekOpener, editorService) {
    this.testMessage = testMessage;
    this.messageUri = messageUri;
    this.peekOpener = peekOpener;
    this.id = "";
    this.contentIdClass = `test-message-inline-content-id${generateUuid()}`;
    const location2 = testMessage.location;
    this.line = clamp(location2.range.startLineNumber, 0, textModel.getLineCount());
    const severity = testMessage.type;
    const message = testMessage.message;
    const options3 = editorService.resolveDecorationOptions(TestMessageDecoration.decorationId, true);
    const hoverText = renderTestMessageAsText(message);
    options3.hoverMessage = new MarkdownString().appendText(hoverText);
    options3.zIndex = 10;
    options3.className = `testing-inline-message-severity-${severity}`;
    options3.isWholeLine = true;
    options3.stickiness = 1 /* NeverGrowsWhenTypingAtEdges */;
    options3.collapseOnReplaceEdit = true;
    let inlineText2 = renderTestMessageAsText(message).replace(lineBreakRe, " ");
    if (inlineText2.length > MAX_INLINE_MESSAGE_LENGTH) {
      inlineText2 = inlineText2.slice(0, MAX_INLINE_MESSAGE_LENGTH - 1) + "\u2026";
    }
    options3.after = {
      content: inlineText2,
      inlineClassName: `test-message-inline-content test-message-inline-content-s${severity} ${this.contentIdClass} ${messageUri ? "test-message-inline-content-clickable" : ""}`
    };
    options3.showIfCollapsed = true;
    const rulerColor = severity === 0 /* Error */ ? overviewRulerError : overviewRulerInfo;
    if (rulerColor) {
      options3.overviewRuler = { color: themeColorFromId2(rulerColor), position: 4 /* Right */ };
    }
    const lineLength = textModel.getLineLength(this.line);
    const column = lineLength ? lineLength + 1 : location2.range.endColumn;
    this.editorDecoration = {
      options: options3,
      range: {
        startLineNumber: this.line,
        startColumn: column,
        endColumn: column,
        endLineNumber: this.line
      }
    };
  }
  static {
    this.inlineClassName = "test-message-inline-content";
  }
  static {
    this.decorationId = `testmessage-${generateUuid()}`;
  }
  click(e) {
    if (e.event.rightButton) {
      return false;
    }
    if (!this.messageUri) {
      return false;
    }
    if (e.target.element?.className.includes(this.contentIdClass)) {
      this.peekOpener.peekUri(this.messageUri);
    }
    return false;
  }
  getContextMenuActions() {
    return { object: [], dispose: () => {
    } };
  }
};

TestMessageDecoration = __decorateClass([
  __decorateParam(3, ITestingPeekOpener),
  __decorateParam(4, ICodeEditorService)
], TestMessageDecoration);

var ERROR_CONTENT_WIDGET_HEIGHT = 20;

var TestErrorContentWidget = class extends Disposable {
  constructor(editor, position2, message, resultItem, uri5, peekOpener) {
    super();
    this.editor = editor;
    this.position = position2;
    this.message = message;
    this.resultItem = resultItem;
    this.peekOpener = peekOpener;
    this.id = generateUuid();
    /** @inheritdoc */
    this.allowEditorOverflow = false;
    this.node = h("div.test-error-content-widget", [
      h("div.inner@inner", [
        h("div.arrow@arrow"),
        h(`span${ThemeIcon.asCSSSelector(testingStatesToIcons.get(4 /* Failed */))}`),
        h("span.content@name")
      ])
    ]);
    const setMarginTop = () => {
      const lineHeight = editor.getLineHeightForPosition(position2);
      this.node.root.style.marginTop = (lineHeight - ERROR_CONTENT_WIDGET_HEIGHT) / 2 + "px";
    };
    setMarginTop();
    this._register(editor.onDidChangeLineHeight((e) => {
      if (e.affects(position2)) {
        setMarginTop();
      }
    }));
    this._register(editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(75 /* lineHeight */)) {
        setMarginTop();
      }
    }));
    let text2;
    if (message.expected !== void 0 && message.actual !== void 0) {
      text2 = `${truncateMiddle(message.actual.replace(/\s+/g, " "), 30)} != ${truncateMiddle(message.expected.replace(/\s+/g, " "), 30)}`;
    } else {
      const msg = renderAsPlaintext(message.message);
      const lf = msg.indexOf("\n");
      text2 = lf === -1 ? msg : msg.slice(0, lf);
    }
    this._register(addDisposableListener(this.node.root, EventType.CLICK, (e) => {
      this.peekOpener.peekUri(uri5);
      e.preventDefault();
    }));
    const ctrl = TestingOutputPeekController.get(editor);
    if (ctrl) {
      this._register(autorun((reader) => {
        const subject = ctrl.subject.read(reader);
        const isCurrent = subject instanceof MessageSubject && subject.message === message;
        this.node.root.classList.toggle("is-current", isCurrent);
      }));
    }
    this.node.name.innerText = text2 || "Test Failed";
    const svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg2.setAttribute("width", "15");
    svg2.setAttribute("height", "10");
    svg2.setAttribute("preserveAspectRatio", "none");
    svg2.setAttribute("viewBox", "0 0 15 10");
    const leftArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    leftArrow.setAttribute("d", "M15 0 L10 0 L0 5 L10 10 L15 10 Z");
    svg2.append(leftArrow);
    this.node.arrow.appendChild(svg2);
    this._register(editor.onDidChangeModelContent((e) => {
      for (const c of e.changes) {
        if (c.range.startLineNumber > this.line) {
          continue;
        }
        if (c.range.startLineNumber <= this.line && c.range.endLineNumber >= this.line || resultItem.item.range && resultItem.item.range.startLineNumber <= c.range.startLineNumber && resultItem.item.range.endLineNumber >= c.range.endLineNumber) {
          TestingDecorations.invalidatedTests.add(this.resultItem);
          this.dispose();
        }
        const adjust = count(c.text, "\n") - (c.range.endLineNumber - c.range.startLineNumber);
        if (adjust !== 0) {
          this.position = this.position.delta(adjust);
          this.editor.layoutContentWidget(this);
        }
      }
    }));
    editor.addContentWidget(this);
    this._register(toDisposable(() => editor.removeContentWidget(this)));
  }
  get line() {
    return this.position.lineNumber;
  }
  getId() {
    return this.id;
  }
  getDomNode() {
    return this.node.root;
  }
  getPosition() {
    return {
      position: this.position,
      preference: [0 /* EXACT */]
    };
  }
  afterRender(_position, coordinate) {
    if (coordinate) {
      const { verticalScrollbarWidth } = this.editor.getLayoutInfo();
      const scrollWidth = this.editor.getScrollWidth();
      this.node.inner.style.maxWidth = `${scrollWidth - verticalScrollbarWidth - coordinate.left - 20}px`;
    }
  }
};

TestErrorContentWidget = __decorateClass([
  __decorateParam(5, ITestingPeekOpener)
], TestErrorContentWidget);
export { isOriginalInDiffEditor, MAX_INLINE_MESSAGE_LENGTH, MAX_TESTS_IN_SUBMENU, GLYPH_MARGIN_LANE, CachedDecorations, TestingDecorationService, TestingDecorations, collapseRange, createRunTestDecoration, TitleLensContentWidget, ExpectedLensContentWidget, ActualLensContentWidget, RunTestDecoration, MultiRunTestDecoration, RunSingleTestDecoration, lineBreakRe, TestMessageDecoration, ERROR_CONTENT_WIDGET_HEIGHT, TestErrorContentWidget };
