// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugEditorContribution.ts
import { registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { format2, noBreakWhitespace } from "./module-0030.mjs";
import { DEFAULT_WORD_REGEXP } from "./module-0103.mjs";
import { DisposableStore, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { DebugHoverWidget } from "./module-2385.mjs";
import { CONTEXT_EXCEPTION_WIDGET_VISIBLE, IDebugService } from "./module-1058.mjs";
import { addDisposableListener, isKeyboardEvent } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { Event2 } from "./module-0017.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { Range2 } from "./module-0106.mjs";
import { clamp } from "./module-0040.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { Position } from "./module-0079.mjs";
import { ExceptionWidget } from "./module-2386.mjs";
import { visit } from "./module-0885.mjs";
import { basename } from "./module-0026.mjs";
import { setProperty } from "./module-1377.mjs";
import { EditOperation } from "./module-0162.mjs";
import { CoreEditingCommands } from "./module-0157.mjs";
import { InsertLineAfterAction } from "./module-0707.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { Expression } from "./module-1065.mjs";
import { illegalArgument, onUnexpectedExternalError } from "./module-0004.mjs";
import { assertType, isDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHostService } from "./module-1118.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { IEditorService } from "./module-0935.mjs";
import { URI } from "./module-0032.mjs";
import { IModelService } from "./module-0080.mjs";


// src/vs/workbench/contrib/debug/browser/debugEditorContribution.ts
var MAX_NUM_INLINE_VALUES = 100;

var MAX_INLINE_DECORATOR_LENGTH = 150;

var MAX_TOKENIZATION_LINE_LEN = 500;

var DEAFULT_INLINE_DEBOUNCE_DELAY = 200;

var debugInlineForeground = registerColor("editor.inlineValuesForeground", {
  dark: "#ffffff80",
  light: "#00000080",
  hcDark: "#ffffff80",
  hcLight: "#00000080"
}, localize(14466, null));

var debugInlineBackground = registerColor("editor.inlineValuesBackground", "#ffc80033", localize(14465, null));

var InlineSegment = class {
  constructor(column, text2) {
    this.column = column;
    this.text = text2;
  }
};

function formatHoverContent(contentText) {
  if (contentText.includes(",") && contentText.includes("=")) {
    const customSplit = (text2) => {
      const splits = [];
      let equalsFound = 0;
      let start = 0;
      for (let i2 = 0; i2 < text2.length; i2++) {
        if (text2[i2] === "=") {
          if (equalsFound === 0) {
            equalsFound++;
            continue;
          }
          const commaIndex = text2.lastIndexOf(",", i2);
          if (commaIndex !== -1 && commaIndex >= start) {
            splits.push(commaIndex);
            start = commaIndex + 1;
          }
          equalsFound++;
        }
      }
      const result = [];
      let s = 0;
      for (const index2 of splits) {
        result.push(text2.substring(s, index2).trim());
        s = index2 + 1;
      }
      if (s < text2.length) {
        result.push(text2.substring(s).trim());
      }
      return result;
    };
    const pairs2 = customSplit(contentText);
    const formattedPairs = pairs2.map((pair) => {
      const equalsIndex = pair.indexOf("=");
      if (equalsIndex !== -1) {
        const indent = " ".repeat(equalsIndex + 2);
        const [firstLine, ...restLines] = pair.split(/\r?\n/);
        return [firstLine, ...restLines.map((line) => indent + line)].join("\n");
      }
      return pair;
    });
    return new MarkdownString().appendCodeblock("", formattedPairs.join(",\n"));
  }
  return new MarkdownString().appendCodeblock("", contentText);
}

function createInlineValueDecoration(lineNumber, contentText, classNamePrefix, column = 1073741824 /* MAX_SAFE_SMALL_INTEGER */, viewportMaxCol = MAX_INLINE_DECORATOR_LENGTH) {
  const rawText = contentText;
  if (contentText.length > viewportMaxCol) {
    contentText = contentText.substring(0, viewportMaxCol) + "...";
  }
  return [
    {
      range: {
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn: column,
        endColumn: column
      },
      options: {
        description: `${classNamePrefix}-inline-value-decoration-spacer`,
        after: {
          content: noBreakWhitespace,
          cursorStops: 3 /* None */
        },
        showIfCollapsed: true
      }
    },
    {
      range: {
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn: column,
        endColumn: column
      },
      options: {
        description: `${classNamePrefix}-inline-value-decoration`,
        after: {
          content: replaceWsWithNoBreakWs(contentText),
          inlineClassName: `${classNamePrefix}-inline-value`,
          inlineClassNameAffectsLetterSpacing: true,
          cursorStops: 3 /* None */
        },
        showIfCollapsed: true,
        hoverMessage: formatHoverContent(rawText)
      }
    }
  ];
}

function replaceWsWithNoBreakWs(str) {
  return str.replace(/[ \t\n]/g, noBreakWhitespace);
}

function createInlineValueDecorationsInsideRange(expressions, ranges, model, wordToLineNumbersMap) {
  const nameValueMap = /* @__PURE__ */ new Map();
  for (const expr of expressions) {
    nameValueMap.set(expr.name, expr.value);
    if (nameValueMap.size >= MAX_NUM_INLINE_VALUES) {
      break;
    }
  }
  const lineToNamesMap = /* @__PURE__ */ new Map();
  nameValueMap.forEach((_value, name) => {
    const lineNumbers = wordToLineNumbersMap.get(name);
    if (lineNumbers) {
      for (const lineNumber of lineNumbers) {
        if (ranges.some((r2) => lineNumber >= r2.startLineNumber && lineNumber <= r2.endLineNumber)) {
          if (!lineToNamesMap.has(lineNumber)) {
            lineToNamesMap.set(lineNumber, []);
          }
          if (lineToNamesMap.get(lineNumber).indexOf(name) === -1) {
            lineToNamesMap.get(lineNumber).push(name);
          }
        }
      }
    }
  });
  return [...lineToNamesMap].map(([line, names]) => ({
    line,
    variables: names.sort((first2, second) => {
      const content = model.getLineContent(line);
      return content.indexOf(first2) - content.indexOf(second);
    }).map((name) => ({ name, value: nameValueMap.get(name) }))
  }));
}

function getWordToLineNumbersMap(model, lineNumber, result) {
  const lineLength = model.getLineLength(lineNumber);
  if (lineLength > MAX_TOKENIZATION_LINE_LEN) {
    return;
  }
  const lineContent = model.getLineContent(lineNumber);
  model.tokenization.forceTokenization(lineNumber);
  const lineTokens = model.tokenization.getLineTokens(lineNumber);
  for (let tokenIndex = 0, tokenCount = lineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
    const tokenType = lineTokens.getStandardTokenType(tokenIndex);
    if (tokenType === 0 /* Other */) {
      DEFAULT_WORD_REGEXP.lastIndex = 0;
      const tokenStartOffset = lineTokens.getStartOffset(tokenIndex);
      const tokenEndOffset = lineTokens.getEndOffset(tokenIndex);
      const tokenStr = lineContent.substring(tokenStartOffset, tokenEndOffset);
      const wordMatch = DEFAULT_WORD_REGEXP.exec(tokenStr);
      if (wordMatch) {
        const word = wordMatch[0];
        if (!result.has(word)) {
          result.set(word, []);
        }
        result.get(word).push(lineNumber);
      }
    }
  }
}

var DebugEditorContribution = class {
  constructor(editor, debugService, instantiationService, commandService, configurationService, hostService, uriIdentityService, contextKeyService, languageFeaturesService, featureDebounceService, editorService) {
    this.editor = editor;
    this.debugService = debugService;
    this.instantiationService = instantiationService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.hostService = hostService;
    this.uriIdentityService = uriIdentityService;
    this.languageFeaturesService = languageFeaturesService;
    this.editorService = editorService;
    this.mouseDown = false;
    this.gutterIsHovered = false;
    this.altListener = new MutableDisposable();
    this.altPressed = false;
    this.displayedStore = new DisposableStore();
    this.allowScrollToExceptionWidget = true;
    this.shouldScrollToExceptionWidget = () => this.allowScrollToExceptionWidget;
    // Holds a Disposable that prevents the default editor hover behavior while it exists.
    this.defaultHoverLockout = new MutableDisposable();
    this.oldDecorations = this.editor.createDecorationsCollection();
    this.debounceInfo = featureDebounceService.for(languageFeaturesService.inlineValuesProvider, "InlineValues", { min: DEAFULT_INLINE_DEBOUNCE_DELAY });
    this.hoverWidget = this.instantiationService.createInstance(DebugHoverWidget, this.editor);
    this.toDispose = [this.defaultHoverLockout, this.altListener, this.displayedStore];
    this.registerListeners();
    this.exceptionWidgetVisible = CONTEXT_EXCEPTION_WIDGET_VISIBLE.bindTo(contextKeyService);
    this.toggleExceptionWidget();
  }
  registerListeners() {
    this.toDispose.push(this.debugService.getViewModel().onDidFocusStackFrame((e4) => this.onFocusStackFrame(e4.stackFrame)));
    this.toDispose.push(this.editor.onMouseDown((e4) => this.onEditorMouseDown(e4)));
    this.toDispose.push(this.editor.onMouseUp(() => this.mouseDown = false));
    this.toDispose.push(this.editor.onMouseMove((e4) => this.onEditorMouseMove(e4)));
    this.toDispose.push(this.editor.onMouseLeave((e4) => {
      const hoverDomNode = this.hoverWidget.getDomNode();
      if (!hoverDomNode) {
        return;
      }
      const rect = hoverDomNode.getBoundingClientRect();
      if (e4.event.posx < rect.left || e4.event.posx > rect.right || e4.event.posy < rect.top || e4.event.posy > rect.bottom) {
        this.hideHoverWidget();
      }
    }));
    this.toDispose.push(this.editor.onKeyDown((e4) => this.onKeyDown(e4)));
    this.toDispose.push(this.editor.onDidChangeModelContent(() => {
      this._wordToLineNumbersMap = void 0;
      this.updateInlineValuesScheduler.schedule();
    }));
    this.toDispose.push(this.debugService.getViewModel().onWillUpdateViews(() => this.updateInlineValuesScheduler.schedule()));
    this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(() => this.updateInlineValuesScheduler.schedule()));
    this.toDispose.push(this.editor.onDidChangeModel(async () => {
      this.addDocumentListeners();
      this.toggleExceptionWidget();
      this.hideHoverWidget();
      this._wordToLineNumbersMap = void 0;
      const stackFrame = this.debugService.getViewModel().focusedStackFrame;
      await this.updateInlineValueDecorations(stackFrame);
    }));
    this.toDispose.push(this.editor.onDidScrollChange(() => {
      this.hideHoverWidget();
      const model = this.editor.getModel();
      if (model && this.languageFeaturesService.inlineValuesProvider.has(model)) {
        this.updateInlineValuesScheduler.schedule();
      }
    }));
    this.toDispose.push(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("editor.hover")) {
        this.updateHoverConfiguration();
      }
    }));
    this.toDispose.push(this.debugService.onDidChangeState((state) => {
      if (state !== 2 /* Stopped */) {
        this.toggleExceptionWidget();
      }
    }));
    this.updateHoverConfiguration();
  }
  updateHoverConfiguration() {
    const model = this.editor.getModel();
    if (model) {
      this.editorHoverOptions = this.configurationService.getValue("editor.hover", {
        resource: model.uri,
        overrideIdentifier: model.getLanguageId()
      });
    }
  }
  addDocumentListeners() {
    const stackFrame = this.debugService.getViewModel().focusedStackFrame;
    const model = this.editor.getModel();
    if (model) {
      this.applyDocumentListeners(model, stackFrame);
    }
  }
  applyDocumentListeners(model, stackFrame) {
    if (!stackFrame || !this.uriIdentityService.extUri.isEqual(model.uri, stackFrame.source.uri)) {
      this.altListener.clear();
      return;
    }
    const ownerDocument = this.editor.getContainerDomNode().ownerDocument;
    this.altListener.value = addDisposableListener(ownerDocument, "keydown", (keydownEvent) => {
      const standardKeyboardEvent = new StandardKeyboardEvent(keydownEvent);
      if (standardKeyboardEvent.keyCode === 6 /* Alt */) {
        this.altPressed = true;
        const debugHoverWasVisible = this.hoverWidget.isVisible();
        this.hoverWidget.hide();
        this.defaultHoverLockout.clear();
        if (debugHoverWasVisible && this.hoverPosition) {
          this.showEditorHover(this.hoverPosition.position, false);
        }
        const onKeyUp = new DomEmitter(ownerDocument, "keyup");
        const listener = Event2.any(this.hostService.onDidChangeFocus, onKeyUp.event)((keyupEvent) => {
          let standardKeyboardEvent2 = void 0;
          if (isKeyboardEvent(keyupEvent)) {
            standardKeyboardEvent2 = new StandardKeyboardEvent(keyupEvent);
          }
          if (!standardKeyboardEvent2 || standardKeyboardEvent2.keyCode === 6 /* Alt */) {
            this.altPressed = false;
            this.preventDefaultEditorHover();
            listener.dispose();
            onKeyUp.dispose();
          }
        });
      }
    });
  }
  async showHover(position2, focus, mouseEvent) {
    this.preventDefaultEditorHover();
    const sf = this.debugService.getViewModel().focusedStackFrame;
    const model = this.editor.getModel();
    if (sf && model && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri)) {
      const result = await this.hoverWidget.showAt(position2, focus, mouseEvent);
      if (result === 1 /* NOT_AVAILABLE */) {
        this.showEditorHover(position2, focus);
      }
    } else {
      this.showEditorHover(position2, focus);
    }
  }
  preventDefaultEditorHover() {
    if (this.defaultHoverLockout.value || this.editorHoverOptions?.enabled === "off") {
      return;
    }
    const hoverController = this.editor.getContribution(ContentHoverController.ID);
    hoverController?.hideContentHover();
    this.editor.updateOptions({ hover: { enabled: "off" } });
    this.defaultHoverLockout.value = {
      dispose: () => {
        this.editor.updateOptions({
          hover: { enabled: this.editorHoverOptions?.enabled ?? "on" }
        });
      }
    };
  }
  showEditorHover(position2, focus) {
    const hoverController = this.editor.getContribution(ContentHoverController.ID);
    const range2 = new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column);
    this.defaultHoverLockout.clear();
    hoverController?.showContentHover(range2, 1 /* Immediate */, 0 /* Mouse */, focus);
  }
  async onFocusStackFrame(sf) {
    const model = this.editor.getModel();
    if (model) {
      this.applyDocumentListeners(model, sf);
      if (sf && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri)) {
        await this.toggleExceptionWidget();
      } else {
        this.hideHoverWidget();
      }
    }
    await this.updateInlineValueDecorations(sf);
  }
  get hoverDelay() {
    const baseDelay = this.editorHoverOptions?.delay || 0;
    const delayFactor = clamp(2 - (baseDelay - 300) / 600, 1, 2);
    return baseDelay * delayFactor;
  }
  get showHoverScheduler() {
    const scheduler = new RunOnceScheduler(() => {
      if (this.hoverPosition && !this.altPressed) {
        this.showHover(this.hoverPosition.position, false, this.hoverPosition.event);
      }
    }, this.hoverDelay);
    this.toDispose.push(scheduler);
    return scheduler;
  }
  hideHoverWidget() {
    if (this.hoverWidget.willBeVisible()) {
      this.hoverWidget.hide();
    }
    this.showHoverScheduler.cancel();
    this.defaultHoverLockout.clear();
  }
  // hover business
  onEditorMouseDown(mouseEvent) {
    this.mouseDown = true;
    if (mouseEvent.target.type === 9 /* CONTENT_WIDGET */ && mouseEvent.target.detail === DebugHoverWidget.ID) {
      return;
    }
    this.hideHoverWidget();
  }
  onEditorMouseMove(mouseEvent) {
    if (this.debugService.state !== 2 /* Stopped */) {
      return;
    }
    const target = mouseEvent.target;
    const stopKey = isMacintosh ? "metaKey" : "ctrlKey";
    if (!this.altPressed) {
      if (target.type === 2 /* GUTTER_GLYPH_MARGIN */) {
        this.defaultHoverLockout.clear();
        this.gutterIsHovered = true;
      } else if (this.gutterIsHovered) {
        this.gutterIsHovered = false;
        this.updateHoverConfiguration();
      }
    }
    if (target.type === 9 /* CONTENT_WIDGET */ && target.detail === DebugHoverWidget.ID || this.hoverWidget.isInSafeTriangle(mouseEvent.event.posx, mouseEvent.event.posy)) {
      const sticky = this.editorHoverOptions?.sticky ?? true;
      if (sticky || this.hoverWidget.isShowingComplexValue || mouseEvent.event[stopKey]) {
        return;
      }
    }
    if (target.type === 6 /* CONTENT_TEXT */) {
      if (target.position && !Position.equals(target.position, this.hoverPosition?.position || null) && !this.hoverWidget.isInSafeTriangle(mouseEvent.event.posx, mouseEvent.event.posy)) {
        this.hoverPosition = { position: target.position, event: mouseEvent.event };
        this.preventDefaultEditorHover();
        this.showHoverScheduler.schedule(this.hoverDelay);
      }
    } else if (!this.mouseDown) {
      this.hideHoverWidget();
    }
  }
  onKeyDown(e4) {
    const stopKey = isMacintosh ? 57 /* Meta */ : 5 /* Ctrl */;
    if (e4.keyCode !== stopKey && e4.keyCode !== 6 /* Alt */) {
      this.hideHoverWidget();
    }
  }
  // end hover business
  // exception widget
  async toggleExceptionWidget() {
    const model = this.editor.getModel();
    const focusedSf = this.debugService.getViewModel().focusedStackFrame;
    const callStack = focusedSf ? focusedSf.thread.getCallStack() : null;
    if (!model || !focusedSf || !callStack || callStack.length === 0) {
      this.closeExceptionWidget();
      return;
    }
    const exceptionSf = callStack.find((sf) => !!(sf && sf.source && sf.source.available && sf.source.presentationHint !== "deemphasize"));
    if (!exceptionSf || exceptionSf !== focusedSf) {
      this.closeExceptionWidget();
      return;
    }
    const sameUri = this.uriIdentityService.extUri.isEqual(exceptionSf.source.uri, model.uri);
    if (this.exceptionWidget && !sameUri) {
      this.closeExceptionWidget();
    } else if (sameUri) {
      const activeControl = this.editorService.activeTextEditorControl;
      const isActiveEditor = activeControl === this.editor;
      const exceptionInfo = await focusedSf.thread.exceptionInfo;
      if (exceptionInfo) {
        if (isActiveEditor) {
          this.showExceptionWidget(exceptionInfo, this.debugService.getViewModel().focusedSession, exceptionSf.range.startLineNumber, exceptionSf.range.startColumn);
        } else {
          this.showExceptionWidgetWithoutScroll(exceptionInfo, this.debugService.getViewModel().focusedSession, exceptionSf.range.startLineNumber, exceptionSf.range.startColumn);
        }
      }
    }
  }
  showExceptionWidget(exceptionInfo, debugSession, lineNumber, column) {
    if (this.exceptionWidget) {
      this.exceptionWidget.dispose();
    }
    this.exceptionWidget = this.instantiationService.createInstance(ExceptionWidget, this.editor, exceptionInfo, debugSession, this.shouldScrollToExceptionWidget);
    this.exceptionWidget.show({ lineNumber, column }, 0);
    this.exceptionWidget.focus();
    this.editor.revealRangeInCenter({
      startLineNumber: lineNumber,
      startColumn: column,
      endLineNumber: lineNumber,
      endColumn: column
    });
    this.exceptionWidgetVisible.set(true);
  }
  showExceptionWidgetWithoutScroll(exceptionInfo, debugSession, lineNumber, column) {
    if (this.exceptionWidget) {
      this.exceptionWidget.dispose();
    }
    this.allowScrollToExceptionWidget = false;
    const currentScrollTop = this.editor.getScrollTop();
    const visibleRanges = this.editor.getVisibleRanges();
    if (visibleRanges.length === 0) {
      this.exceptionWidget = this.instantiationService.createInstance(ExceptionWidget, this.editor, exceptionInfo, debugSession, this.shouldScrollToExceptionWidget);
      this.exceptionWidget.show({ lineNumber, column }, 0);
      this.exceptionWidgetVisible.set(true);
      this.allowScrollToExceptionWidget = true;
      return;
    }
    const firstVisibleLine = visibleRanges[0].startLineNumber;
    this.exceptionWidget = this.instantiationService.createInstance(ExceptionWidget, this.editor, exceptionInfo, debugSession, this.shouldScrollToExceptionWidget);
    this.exceptionWidget.show({ lineNumber, column }, 0);
    this.exceptionWidgetVisible.set(true);
    if (lineNumber < firstVisibleLine) {
      const scrollAdjustment = this.exceptionWidget.getWhitespaceHeight();
      this.editor.setScrollTop(currentScrollTop + scrollAdjustment, 1 /* Immediate */);
    }
    this.allowScrollToExceptionWidget = true;
  }
  closeExceptionWidget() {
    if (this.exceptionWidget) {
      const shouldFocusEditor = this.exceptionWidget.hasFocus();
      this.exceptionWidget.dispose();
      this.exceptionWidget = void 0;
      this.exceptionWidgetVisible.set(false);
      if (shouldFocusEditor) {
        this.editor.focus();
      }
    }
  }
  async addLaunchConfiguration() {
    const model = this.editor.getModel();
    if (!model) {
      return;
    }
    let configurationsArrayPosition;
    let lastProperty;
    const getConfigurationPosition = () => {
      let depthInArray = 0;
      visit(model.getValue(), {
        onObjectProperty: (property) => {
          lastProperty = property;
        },
        onArrayBegin: (offset) => {
          if (lastProperty === "configurations" && depthInArray === 0) {
            configurationsArrayPosition = model.getPositionAt(offset + 1);
          }
          depthInArray++;
        },
        onArrayEnd: () => {
          depthInArray--;
        }
      });
    };
    getConfigurationPosition();
    if (!configurationsArrayPosition) {
      const { tabSize, insertSpaces } = model.getOptions();
      const eol = model.getEOL();
      const edit3 = basename(model.uri.fsPath) === "launch.json" ? setProperty(model.getValue(), ["configurations"], [], { tabSize, insertSpaces, eol })[0] : setProperty(model.getValue(), ["launch"], { "configurations": [] }, { tabSize, insertSpaces, eol })[0];
      const startPosition = model.getPositionAt(edit3.offset);
      const lineNumber = startPosition.lineNumber;
      const range2 = new Range2(lineNumber, startPosition.column, lineNumber, model.getLineMaxColumn(lineNumber));
      model.pushEditOperations(null, [EditOperation.replace(range2, edit3.content)], () => null);
      getConfigurationPosition();
    }
    if (!configurationsArrayPosition) {
      return;
    }
    this.editor.focus();
    const insertLine = (position2) => {
      if (model.getLineLastNonWhitespaceColumn(position2.lineNumber) > position2.column) {
        this.editor.setPosition(position2);
        this.instantiationService.invokeFunction((accessor) => {
          CoreEditingCommands.LineBreakInsert.runEditorCommand(accessor, this.editor, null);
        });
      }
      this.editor.setPosition(position2);
      return this.commandService.executeCommand(InsertLineAfterAction.ID);
    };
    await insertLine(configurationsArrayPosition);
    await this.commandService.executeCommand("editor.action.triggerSuggest");
  }
  get removeInlineValuesScheduler() {
    return new RunOnceScheduler(
      () => {
        this.displayedStore.clear();
        this.oldDecorations.clear();
      },
      100
    );
  }
  get updateInlineValuesScheduler() {
    const model = this.editor.getModel();
    return new RunOnceScheduler(
      async () => await this.updateInlineValueDecorations(this.debugService.getViewModel().focusedStackFrame),
      model ? this.debounceInfo.get(model) : DEAFULT_INLINE_DEBOUNCE_DELAY
    );
  }
  async updateInlineValueDecorations(stackFrame) {
    const var_value_format = "{0} = {1}";
    const separator2 = ", ";
    const model = this.editor.getModel();
    const inlineValuesSetting = this.configurationService.getValue("debug").inlineValues;
    const inlineValuesTurnedOn = inlineValuesSetting === true || inlineValuesSetting === "on" || inlineValuesSetting === "auto" && model && this.languageFeaturesService.inlineValuesProvider.has(model);
    if (!inlineValuesTurnedOn || !model || !stackFrame || model.uri.toString() !== stackFrame.source.uri.toString()) {
      if (!this.removeInlineValuesScheduler.isScheduled()) {
        this.removeInlineValuesScheduler.schedule();
      }
      return;
    }
    this.removeInlineValuesScheduler.cancel();
    this.displayedStore.clear();
    const viewRanges = this.editor.getVisibleRangesPlusViewportAboveBelow();
    let allDecorations;
    const cts = new CancellationTokenSource();
    this.displayedStore.add(toDisposable(() => cts.dispose(true)));
    if (this.languageFeaturesService.inlineValuesProvider.has(model)) {
      const findVariable = async (_key, caseSensitiveLookup) => {
        const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
        const key3 = caseSensitiveLookup ? _key : _key.toLowerCase();
        for (const scope of scopes) {
          const variables = await scope.getChildren();
          const found = variables.find((v2) => caseSensitiveLookup ? v2.name === key3 : v2.name.toLowerCase() === key3);
          if (found) {
            return found.value;
          }
        }
        return void 0;
      };
      const ctx = {
        frameId: stackFrame.frameId,
        stoppedLocation: new Range2(stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1, stackFrame.range.endLineNumber, stackFrame.range.endColumn + 1)
      };
      const providers2 = this.languageFeaturesService.inlineValuesProvider.ordered(model).reverse();
      allDecorations = [];
      const lineDecorations = /* @__PURE__ */ new Map();
      const promises = providers2.flatMap((provider) => viewRanges.map((range2) => Promise.resolve(provider.provideInlineValues(model, range2, ctx, cts.token)).then(async (result) => {
        if (result) {
          for (const iv of result) {
            let text2 = void 0;
            switch (iv.type) {
              case "text":
                text2 = iv.text;
                break;
              case "variable": {
                let va = iv.variableName;
                if (!va) {
                  const lineContent = model.getLineContent(iv.range.startLineNumber);
                  va = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                }
                const value2 = await findVariable(va, iv.caseSensitiveLookup);
                if (value2) {
                  text2 = format2(var_value_format, va, value2);
                }
                break;
              }
              case "expression": {
                let expr = iv.expression;
                if (!expr) {
                  const lineContent = model.getLineContent(iv.range.startLineNumber);
                  expr = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                }
                if (expr) {
                  const expression = new Expression(expr);
                  await expression.evaluate(stackFrame.thread.session, stackFrame, "watch", true);
                  if (expression.available) {
                    text2 = format2(var_value_format, expr, expression.value);
                  }
                }
                break;
              }
            }
            if (text2) {
              const line = iv.range.startLineNumber;
              let lineSegments = lineDecorations.get(line);
              if (!lineSegments) {
                lineSegments = [];
                lineDecorations.set(line, lineSegments);
              }
              if (!lineSegments.some((iv2) => iv2.text === text2)) {
                lineSegments.push(new InlineSegment(iv.range.startColumn, text2));
              }
            }
          }
        }
      }, (err) => {
        onUnexpectedExternalError(err);
      })));
      const startTime = Date.now();
      await Promise.all(promises);
      this.updateInlineValuesScheduler.delay = this.debounceInfo.update(model, Date.now() - startTime);
      lineDecorations.forEach((segments, line) => {
        if (segments.length > 0) {
          segments = segments.sort((a, b) => a.column - b.column);
          const text2 = segments.map((s) => s.text).join(separator2);
          const editorWidth = this.editor.getLayoutInfo().width;
          const fontInfo = this.editor.getOption(59 /* fontInfo */);
          const viewportMaxCol = Math.floor((editorWidth - 50) / fontInfo.typicalHalfwidthCharacterWidth);
          allDecorations.push(...createInlineValueDecoration(line, text2, "debug", void 0, viewportMaxCol));
        }
      });
    } else {
      const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
      const scopesWithVariables = await Promise.all(scopes.map(async (scope) => ({ scope, variables: await scope.getChildren() })));
      const valuesPerLine = /* @__PURE__ */ new Map();
      for (const { scope, variables } of scopesWithVariables) {
        let scopeRange = new Range2(0, 0, stackFrame.range.startLineNumber, stackFrame.range.startColumn);
        if (scope.range) {
          scopeRange = scopeRange.setStartPosition(scope.range.startLineNumber, scope.range.startColumn);
        }
        const ownRanges = viewRanges.map((r2) => r2.intersectRanges(scopeRange)).filter(isDefined);
        this._wordToLineNumbersMap ??= new WordsToLineNumbersCache(model);
        for (const range2 of ownRanges) {
          this._wordToLineNumbersMap.ensureRangePopulated(range2);
        }
        const mapped = createInlineValueDecorationsInsideRange(variables, ownRanges, model, this._wordToLineNumbersMap.value);
        for (const { line, variables: variables2 } of mapped) {
          let values = valuesPerLine.get(line);
          if (!values) {
            values = /* @__PURE__ */ new Map();
            valuesPerLine.set(line, values);
          }
          for (const { name, value: value2 } of variables2) {
            if (!values.has(name)) {
              values.set(name, value2);
            }
          }
        }
      }
      allDecorations = [...valuesPerLine.entries()].flatMap(([line, values]) => {
        const text2 = [...values].map(([n2, v2]) => `${n2} = ${v2}`).join(", ");
        const editorWidth = this.editor.getLayoutInfo().width;
        const fontInfo = this.editor.getOption(59 /* fontInfo */);
        const viewportMaxCol = Math.floor((editorWidth - 50) / fontInfo.typicalHalfwidthCharacterWidth);
        return createInlineValueDecoration(line, text2, "debug", void 0, viewportMaxCol);
      });
    }
    if (cts.token.isCancellationRequested) {
      return;
    }
    let preservePosition;
    if (this.editor.getOption(149 /* wordWrap */) !== "off") {
      const position2 = this.editor.getPosition();
      if (position2 && this.editor.getVisibleRanges().some((r2) => r2.containsPosition(position2))) {
        preservePosition = { position: position2, top: this.editor.getTopForPosition(position2.lineNumber, position2.column) };
      }
    }
    this.oldDecorations.set(allDecorations);
    if (preservePosition) {
      const top2 = this.editor.getTopForPosition(preservePosition.position.lineNumber, preservePosition.position.column);
      this.editor.setScrollTop(this.editor.getScrollTop() - (preservePosition.top - top2), 1 /* Immediate */);
    }
  }
  dispose() {
    this.hoverWidget?.dispose();
    this.configurationWidget?.dispose();
    this.exceptionWidget?.dispose();
    this.toDispose = dispose(this.toDispose);
  }
};

__decorateClass([
  memoize
], DebugEditorContribution.prototype, "showHoverScheduler", 1);

__decorateClass([
  memoize
], DebugEditorContribution.prototype, "removeInlineValuesScheduler", 1);

__decorateClass([
  memoize
], DebugEditorContribution.prototype, "updateInlineValuesScheduler", 1);

DebugEditorContribution = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IHostService),
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, ILanguageFeaturesService),
  __decorateParam(9, ILanguageFeatureDebounceService),
  __decorateParam(10, IEditorService)
], DebugEditorContribution);

var WordsToLineNumbersCache = class {
  constructor(model) {
    this.model = model;
    this.value = /* @__PURE__ */ new Map();
    this.intervals = new Uint8Array(Math.ceil(model.getLineCount() / 8));
  }
  /** Ensures that variables names in the given range have been identified. */
  ensureRangePopulated(range2) {
    for (let lineNumber = range2.startLineNumber; lineNumber <= range2.endLineNumber; lineNumber++) {
      const bin = lineNumber >> 3;
      const bit = 1 << (lineNumber & 7);
      if (!(this.intervals[bin] & bit)) {
        getWordToLineNumbersMap(this.model, lineNumber, this.value);
        this.intervals[bin] |= bit;
      }
    }
  }
};

CommandsRegistry.registerCommand(
  "_executeInlineValueProvider",
  async (accessor, uri4, iRange, context2) => {
    assertType(URI.isUri(uri4));
    assertType(Range2.isIRange(iRange));
    if (!context2 || typeof context2.frameId !== "number" || !Range2.isIRange(context2.stoppedLocation)) {
      throw illegalArgument("context");
    }
    const model = accessor.get(IModelService).getModel(uri4);
    if (!model) {
      throw illegalArgument("uri");
    }
    const range2 = Range2.lift(iRange);
    const { inlineValuesProvider } = accessor.get(ILanguageFeaturesService);
    const providers2 = inlineValuesProvider.ordered(model);
    const providerResults = await Promise.all(providers2.map((provider) => provider.provideInlineValues(model, range2, context2, CancellationToken.None)));
    return providerResults.flat().filter(isDefined);
  }
);
export { formatHoverContent, createInlineValueDecoration, replaceWsWithNoBreakWs, createInlineValueDecorationsInsideRange, getWordToLineNumbersMap, MAX_NUM_INLINE_VALUES, MAX_INLINE_DECORATOR_LENGTH, MAX_TOKENIZATION_LINE_LEN, DEAFULT_INLINE_DEBOUNCE_DELAY, debugInlineForeground, debugInlineBackground, InlineSegment, DebugEditorContribution, WordsToLineNumbersCache };
