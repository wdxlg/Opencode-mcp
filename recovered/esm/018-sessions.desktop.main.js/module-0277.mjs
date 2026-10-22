// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/textArea/textAreaEditContextInput.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { TextAreaState, _debugComposition } from "./module-0276.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { isHighSurrogate } from "./module-0030.mjs";
import { CopyOptions, InMemoryClipboardMetadataManager, createClipboardCopyEvent, createClipboardPasteEvent } from "./module-0275.mjs";
import { addDisposableListener, getActiveElement, getShadowRoot, getWindow, restoreParentsScrollTop, saveParentsScrollTop } from "./module-0075.mjs";
import { inputLatency } from "./module-0222.mjs";
import { Selection } from "./module-0107.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ILogService } from "./module-0095.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { isFirefox2 } from "./module-0018.mjs";


// src/vs/editor/browser/controller/editContext/textArea/textAreaEditContextInput.ts
var TextAreaSyntethicEvents;

((TextAreaSyntethicEvents2) => {
  TextAreaSyntethicEvents2.Tap = "-monaco-textarea-synthetic-tap";
})(TextAreaSyntethicEvents || (TextAreaSyntethicEvents = {}));

var CompositionContext = class {
  constructor() {
    this._lastTypeTextLength = 0;
  }
  handleCompositionUpdate(text2) {
    text2 = text2 || "";
    const typeInput = {
      text: text2,
      replacePrevCharCnt: this._lastTypeTextLength,
      replaceNextCharCnt: 0,
      positionDelta: 0
    };
    this._lastTypeTextLength = text2.length;
    return typeInput;
  }
};

var TextAreaInput = class extends Disposable {
  constructor(_host, _textArea, _OS, _browser, _accessibilityService, _logService) {
    super();
    this._host = _host;
    this._textArea = _textArea;
    this._OS = _OS;
    this._browser = _browser;
    this._accessibilityService = _accessibilityService;
    this._logService = _logService;
    this._onFocus = this._register(new Emitter());
    this.onFocus = this._onFocus.event;
    this._onBlur = this._register(new Emitter());
    this.onBlur = this._onBlur.event;
    this._onKeyDown = this._register(new Emitter());
    this.onKeyDown = this._onKeyDown.event;
    this._onKeyUp = this._register(new Emitter());
    this.onKeyUp = this._onKeyUp.event;
    this._onCut = this._register(new Emitter());
    this.onCut = this._onCut.event;
    this._onPaste = this._register(new Emitter());
    this.onPaste = this._onPaste.event;
    this._onWillCopy = this._register(new Emitter());
    this.onWillCopy = this._onWillCopy.event;
    this._onWillCut = this._register(new Emitter());
    this.onWillCut = this._onWillCut.event;
    this._onWillPaste = this._register(new Emitter());
    this.onWillPaste = this._onWillPaste.event;
    this._onType = this._register(new Emitter());
    this.onType = this._onType.event;
    this._onCompositionStart = this._register(new Emitter());
    this.onCompositionStart = this._onCompositionStart.event;
    this._onCompositionUpdate = this._register(new Emitter());
    this.onCompositionUpdate = this._onCompositionUpdate.event;
    this._onCompositionEnd = this._register(new Emitter());
    this.onCompositionEnd = this._onCompositionEnd.event;
    this._onSelectionChangeRequest = this._register(new Emitter());
    this.onSelectionChangeRequest = this._onSelectionChangeRequest.event;
    this._asyncFocusGainWriteScreenReaderContent = this._register(new MutableDisposable());
    this._asyncTriggerCut = this._register(new RunOnceScheduler(() => this._onCut.fire(), 0));
    this._textAreaState = TextAreaState.EMPTY;
    this._selectionChangeListener = null;
    if (this._accessibilityService.isScreenReaderOptimized()) {
      this.writeNativeTextAreaContent("ctor");
    }
    this._register(Event2.runAndSubscribe(this._accessibilityService.onDidChangeScreenReaderOptimized, () => {
      if (this._accessibilityService.isScreenReaderOptimized() && !this._asyncFocusGainWriteScreenReaderContent.value) {
        this._asyncFocusGainWriteScreenReaderContent.value = new RunOnceScheduler(() => this.writeNativeTextAreaContent("asyncFocusGain"), 0);
      } else {
        this._asyncFocusGainWriteScreenReaderContent.clear();
      }
    }));
    this._hasFocus = false;
    this._currentComposition = null;
    let lastKeyDown = null;
    this._register(this._textArea.onKeyDown((_e) => {
      const e4 = new StandardKeyboardEvent(_e);
      if (e4.keyCode === 114 /* KEY_IN_COMPOSITION */ || this._currentComposition && e4.keyCode === 1 /* Backspace */) {
        e4.stopPropagation();
      }
      if (e4.equals(9 /* Escape */)) {
        e4.preventDefault();
      }
      lastKeyDown = e4;
      this._onKeyDown.fire(e4);
    }));
    this._register(this._textArea.onKeyUp((_e) => {
      const e4 = new StandardKeyboardEvent(_e);
      this._onKeyUp.fire(e4);
    }));
    this._register(this._textArea.onCompositionStart((e4) => {
      if (_debugComposition) {
        console.log(`[compositionstart]`, e4);
      }
      const currentComposition = new CompositionContext();
      if (this._currentComposition) {
        this._currentComposition = currentComposition;
        return;
      }
      this._currentComposition = currentComposition;
      if (this._OS === 2 /* Macintosh */ && lastKeyDown && lastKeyDown.equals(114 /* KEY_IN_COMPOSITION */) && this._textAreaState.selectionStart === this._textAreaState.selectionEnd && this._textAreaState.selectionStart > 0 && this._textAreaState.value.substr(this._textAreaState.selectionStart - 1, 1) === e4.data && (lastKeyDown.code === "ArrowRight" || lastKeyDown.code === "ArrowLeft")) {
        if (_debugComposition) {
          console.log(`[compositionstart] Handling long press case on macOS + arrow key`, e4);
        }
        currentComposition.handleCompositionUpdate("x");
        this._onCompositionStart.fire({ data: e4.data });
        return;
      }
      if (this._browser.isAndroid) {
        this._onCompositionStart.fire({ data: e4.data });
        return;
      }
      this._onCompositionStart.fire({ data: e4.data });
    }));
    this._register(this._textArea.onCompositionUpdate((e4) => {
      if (_debugComposition) {
        console.log(`[compositionupdate]`, e4);
      }
      const currentComposition = this._currentComposition;
      if (!currentComposition) {
        return;
      }
      if (this._browser.isAndroid) {
        const newState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
        const typeInput2 = TextAreaState.deduceAndroidCompositionInput(this._textAreaState, newState);
        this._textAreaState = newState;
        this._onType.fire(typeInput2);
        this._onCompositionUpdate.fire(e4);
        return;
      }
      const typeInput = currentComposition.handleCompositionUpdate(e4.data);
      this._textAreaState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
      this._onType.fire(typeInput);
      this._onCompositionUpdate.fire(e4);
    }));
    this._register(this._textArea.onCompositionEnd((e4) => {
      if (_debugComposition) {
        console.log(`[compositionend]`, e4);
      }
      const currentComposition = this._currentComposition;
      if (!currentComposition) {
        return;
      }
      this._currentComposition = null;
      if (this._browser.isAndroid) {
        const newState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
        const typeInput2 = TextAreaState.deduceAndroidCompositionInput(this._textAreaState, newState);
        this._textAreaState = newState;
        this._onType.fire(typeInput2);
        this._onCompositionEnd.fire();
        return;
      }
      const typeInput = currentComposition.handleCompositionUpdate(e4.data);
      this._textAreaState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
      this._onType.fire(typeInput);
      this._onCompositionEnd.fire();
    }));
    this._register(this._textArea.onInput((e4) => {
      if (_debugComposition) {
        console.log(`[input]`, e4);
      }
      this._textArea.setIgnoreSelectionChangeTime("received input event");
      if (this._currentComposition) {
        return;
      }
      const newState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
      const typeInput = TextAreaState.deduceInput(
        this._textAreaState,
        newState,
        /*couldBeEmojiInput*/
        this._OS === 2 /* Macintosh */
      );
      if (typeInput.replacePrevCharCnt === 0 && typeInput.text.length === 1) {
        if (isHighSurrogate(typeInput.text.charCodeAt(0)) || typeInput.text.charCodeAt(0) === 127) {
          return;
        }
      }
      this._textAreaState = newState;
      if (typeInput.text !== "" || typeInput.replacePrevCharCnt !== 0 || typeInput.replaceNextCharCnt !== 0 || typeInput.positionDelta !== 0) {
        if (e4.inputType === "insertFromPaste") {
          this._onPaste.fire({
            text: typeInput.text,
            metadata: InMemoryClipboardMetadataManager.INSTANCE.get(typeInput.text)
          });
        } else {
          this._onType.fire(typeInput);
        }
      }
    }));
    this._register(this._textArea.onCut((e4) => {
      this._logService.trace(`TextAreaInput#onCut`, e4);
      const cutEvent = createClipboardCopyEvent(
        e4,
        /* isCut */
        true,
        this._host.context,
        this._logService,
        this._browser.isFirefox
      );
      this._onWillCut.fire(cutEvent);
      if (cutEvent.isHandled) {
        return;
      }
      this._textArea.setIgnoreSelectionChangeTime("received cut event");
      cutEvent.ensureClipboardGetsEditorData();
      this._asyncTriggerCut.schedule();
    }));
    this._register(this._textArea.onCopy((e4) => {
      this._logService.trace(`TextAreaInput#onCopy`, e4);
      CopyOptions.electronBugWorkaroundCopyEventHasFired = true;
      const copyEvent = createClipboardCopyEvent(
        e4,
        /* isCut */
        false,
        this._host.context,
        this._logService,
        this._browser.isFirefox
      );
      this._onWillCopy.fire(copyEvent);
      if (copyEvent.isHandled) {
        return;
      }
      copyEvent.ensureClipboardGetsEditorData();
    }));
    this._register(this._textArea.onPaste((e4) => {
      this._logService.trace(`TextAreaInput#onPaste`, e4);
      const pasteEvent = createClipboardPasteEvent(e4);
      this._onWillPaste.fire(pasteEvent);
      if (pasteEvent.isHandled) {
        return;
      }
      this._textArea.setIgnoreSelectionChangeTime("received paste event");
      e4.preventDefault();
      this._logService.trace(`TextAreaInput#onPaste with id : `, pasteEvent.metadata?.id, " with text.length: ", pasteEvent.text.length);
      if (!pasteEvent.text) {
        return;
      }
      this._logService.trace(`TextAreaInput#onPaste (before onPaste)`);
      this._onPaste.fire({
        text: pasteEvent.text,
        metadata: pasteEvent.metadata
      });
    }));
    this._register(this._textArea.onFocus(() => {
      const hadFocus = this._hasFocus;
      this._setHasFocus(true);
      if (this._accessibilityService.isScreenReaderOptimized() && this._browser.isSafari && !hadFocus && this._hasFocus) {
        if (!this._asyncFocusGainWriteScreenReaderContent.value) {
          this._asyncFocusGainWriteScreenReaderContent.value = new RunOnceScheduler(() => this.writeNativeTextAreaContent("asyncFocusGain"), 0);
        }
        this._asyncFocusGainWriteScreenReaderContent.value.schedule();
      }
    }));
    this._register(this._textArea.onBlur(() => {
      if (this._currentComposition) {
        this._currentComposition = null;
        this.writeNativeTextAreaContent("blurWithoutCompositionEnd");
        this._onCompositionEnd.fire();
      }
      this._setHasFocus(false);
    }));
    this._register(this._textArea.onSyntheticTap(() => {
      if (this._browser.isAndroid && this._currentComposition) {
        this._currentComposition = null;
        this.writeNativeTextAreaContent("tapWithoutCompositionEnd");
        this._onCompositionEnd.fire();
      }
    }));
  }
  get textAreaState() {
    return this._textAreaState;
  }
  _initializeFromTest() {
    this._hasFocus = true;
    this._textAreaState = TextAreaState.readFromTextArea(this._textArea, null);
  }
  _installSelectionChangeListener() {
    let previousSelectionChangeEventTime = 0;
    return addDisposableListener(this._textArea.ownerDocument, "selectionchange", (e4) => {
      inputLatency.onSelectionChange();
      if (!this._hasFocus) {
        return;
      }
      if (this._currentComposition) {
        return;
      }
      if (!this._browser.isChrome) {
        return;
      }
      const now = Date.now();
      const delta1 = now - previousSelectionChangeEventTime;
      previousSelectionChangeEventTime = now;
      if (delta1 < 5) {
        return;
      }
      const delta2 = now - this._textArea.getIgnoreSelectionChangeTime();
      this._textArea.resetSelectionChangeTime();
      if (delta2 < 100) {
        return;
      }
      if (!this._textAreaState.selection) {
        return;
      }
      const newValue = this._textArea.getValue();
      if (this._textAreaState.value !== newValue) {
        return;
      }
      const newSelectionStart = this._textArea.getSelectionStart();
      const newSelectionEnd = this._textArea.getSelectionEnd();
      if (this._textAreaState.selectionStart === newSelectionStart && this._textAreaState.selectionEnd === newSelectionEnd) {
        return;
      }
      const _newSelectionStartPosition = this._textAreaState.deduceEditorPosition(newSelectionStart);
      const newSelectionStartPosition = this._host.deduceModelPosition(_newSelectionStartPosition[0], _newSelectionStartPosition[1], _newSelectionStartPosition[2]);
      const _newSelectionEndPosition = this._textAreaState.deduceEditorPosition(newSelectionEnd);
      const newSelectionEndPosition = this._host.deduceModelPosition(_newSelectionEndPosition[0], _newSelectionEndPosition[1], _newSelectionEndPosition[2]);
      const newSelection = new Selection(
        newSelectionStartPosition.lineNumber,
        newSelectionStartPosition.column,
        newSelectionEndPosition.lineNumber,
        newSelectionEndPosition.column
      );
      this._onSelectionChangeRequest.fire(newSelection);
    });
  }
  dispose() {
    super.dispose();
    if (this._selectionChangeListener) {
      this._selectionChangeListener.dispose();
      this._selectionChangeListener = null;
    }
  }
  focusTextArea() {
    this._setHasFocus(true);
    this.refreshFocusState();
  }
  isFocused() {
    return this._hasFocus;
  }
  refreshFocusState() {
    this._setHasFocus(this._textArea.hasFocus());
  }
  _setHasFocus(newHasFocus) {
    if (this._hasFocus === newHasFocus) {
      return;
    }
    this._hasFocus = newHasFocus;
    if (this._selectionChangeListener) {
      this._selectionChangeListener.dispose();
      this._selectionChangeListener = null;
    }
    if (this._hasFocus) {
      this._selectionChangeListener = this._installSelectionChangeListener();
    }
    if (this._hasFocus) {
      this.writeNativeTextAreaContent("focusgain");
    }
    if (this._hasFocus) {
      this._onFocus.fire();
    } else {
      this._onBlur.fire();
    }
  }
  _setAndWriteTextAreaState(reason, textAreaState) {
    if (!this._hasFocus) {
      textAreaState = textAreaState.collapseSelection();
    }
    if (!textAreaState.isWrittenToTextArea(this._textArea, this._hasFocus)) {
      this._logService.trace(`writeTextAreaState(reason: ${reason})`);
    }
    textAreaState.writeToTextArea(reason, this._textArea, this._hasFocus);
    this._textAreaState = textAreaState;
  }
  writeNativeTextAreaContent(reason) {
    if (!this._accessibilityService.isScreenReaderOptimized() && reason === "render" || this._currentComposition) {
      return;
    }
    this._setAndWriteTextAreaState(reason, this._host.getScreenReaderContent());
  }
};

TextAreaInput = __decorateClass([
  __decorateParam(4, IAccessibilityService),
  __decorateParam(5, ILogService)
], TextAreaInput);

var TextAreaWrapper = class extends Disposable {
  constructor(_actual) {
    super();
    this._actual = _actual;
    this._onSyntheticTap = this._register(new Emitter());
    this.onSyntheticTap = this._onSyntheticTap.event;
    this._ignoreSelectionChangeTime = 0;
    this.onKeyDown = this._register(new DomEmitter(this._actual, "keydown")).event;
    this.onKeyPress = this._register(new DomEmitter(this._actual, "keypress")).event;
    this.onKeyUp = this._register(new DomEmitter(this._actual, "keyup")).event;
    this.onCompositionStart = this._register(new DomEmitter(this._actual, "compositionstart")).event;
    this.onCompositionUpdate = this._register(new DomEmitter(this._actual, "compositionupdate")).event;
    this.onCompositionEnd = this._register(new DomEmitter(this._actual, "compositionend")).event;
    this.onBeforeInput = this._register(new DomEmitter(this._actual, "beforeinput")).event;
    this.onInput = this._register(new DomEmitter(this._actual, "input")).event;
    this.onCut = this._register(new DomEmitter(this._actual, "cut")).event;
    this.onCopy = this._register(new DomEmitter(this._actual, "copy")).event;
    this.onPaste = this._register(new DomEmitter(this._actual, "paste")).event;
    this.onFocus = this._register(new DomEmitter(this._actual, "focus")).event;
    this.onBlur = this._register(new DomEmitter(this._actual, "blur")).event;
    this._register(this.onKeyDown(() => inputLatency.onKeyDown()));
    this._register(this.onBeforeInput(() => inputLatency.onBeforeInput()));
    this._register(this.onInput(() => inputLatency.onInput()));
    this._register(this.onKeyUp(() => inputLatency.onKeyUp()));
    this._register(addDisposableListener(this._actual, TextAreaSyntethicEvents.Tap, () => this._onSyntheticTap.fire()));
  }
  //  = this._register(new DomEmitter(this._actual, 'blur')).event;
  get ownerDocument() {
    return this._actual.ownerDocument;
  }
  hasFocus() {
    const shadowRoot = getShadowRoot(this._actual);
    if (shadowRoot) {
      return shadowRoot.activeElement === this._actual;
    } else if (this._actual.isConnected) {
      return getActiveElement() === this._actual;
    } else {
      return false;
    }
  }
  setIgnoreSelectionChangeTime(reason) {
    this._ignoreSelectionChangeTime = Date.now();
  }
  getIgnoreSelectionChangeTime() {
    return this._ignoreSelectionChangeTime;
  }
  resetSelectionChangeTime() {
    this._ignoreSelectionChangeTime = 0;
  }
  getValue() {
    return this._actual.value;
  }
  setValue(reason, value2) {
    const textArea = this._actual;
    if (textArea.value === value2) {
      return;
    }
    this.setIgnoreSelectionChangeTime("setValue");
    textArea.value = value2;
  }
  getSelectionStart() {
    return this._actual.selectionDirection === "backward" ? this._actual.selectionEnd : this._actual.selectionStart;
  }
  getSelectionEnd() {
    return this._actual.selectionDirection === "backward" ? this._actual.selectionStart : this._actual.selectionEnd;
  }
  setSelectionRange(reason, selectionStart, selectionEnd) {
    const textArea = this._actual;
    let activeElement = null;
    const shadowRoot = getShadowRoot(textArea);
    if (shadowRoot) {
      activeElement = shadowRoot.activeElement;
    } else {
      activeElement = getActiveElement();
    }
    const activeWindow = getWindow(activeElement);
    const currentIsFocused = activeElement === textArea;
    const currentSelectionStart = textArea.selectionStart;
    const currentSelectionEnd = textArea.selectionEnd;
    if (currentIsFocused && currentSelectionStart === selectionStart && currentSelectionEnd === selectionEnd) {
      if (isFirefox2 && activeWindow.parent !== activeWindow) {
        textArea.focus();
      }
      return;
    }
    if (currentIsFocused) {
      this.setIgnoreSelectionChangeTime("setSelectionRange");
      textArea.setSelectionRange(selectionStart, selectionEnd);
      if (isFirefox2 && activeWindow.parent !== activeWindow) {
        textArea.focus();
      }
      return;
    }
    try {
      const scrollState = saveParentsScrollTop(textArea);
      this.setIgnoreSelectionChangeTime("setSelectionRange");
      textArea.focus();
      textArea.setSelectionRange(selectionStart, selectionEnd);
      restoreParentsScrollTop(textArea, scrollState);
    } catch (e4) {
    }
  }
};
export { TextAreaSyntethicEvents, CompositionContext, TextAreaInput, TextAreaWrapper };
