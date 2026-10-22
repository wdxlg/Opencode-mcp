// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/dictation/editorDictation.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { EditorAction2, registerEditorContribution } from "./module-0097.mjs";
import { HasSpeechProvider, ISpeechService, SpeechToTextInProgress } from "./module-1254.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { isWindows } from "./module-0014.mjs";
import { MenuId, registerAction2 } from "./module-0092.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { ActionBar } from "./module-0477.mjs";
import { toAction } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { EmptyTextEditorHintContributionId } from "./module-1349.mjs";
import { getActiveWindow, getWindow } from "./module-0075.mjs";
import { activeDictationEditor, isDictating, startDictation, stopDictation } from "./module-1348.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { Position } from "./module-0079.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSpeechToTextService } from "./module-1347.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/codeEditor/browser/dictation/editorDictation.ts
var EDITOR_DICTATION_IN_PROGRESS = new RawContextKey("editorDictation.inProgress", false);

var VOICE_CATEGORY = localize2(13659, "Voice");

var BuiltinDictationConfigured = ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.speechToTextConfigured);

var EditorDictationStartAction = class _EditorDictationStartAction extends EditorAction2 {
  static {
    this.ID = "workbench.action.editorDictation.start";
  }
  constructor() {
    super({
      id: _EditorDictationStartAction.ID,
      title: localize2(13655, "Start Dictation in Editor"),
      category: VOICE_CATEGORY,
      precondition: ContextKeyExpr.and(
        // Available either through the built-in on-device engine or the
        // speech extension's provider.
        ContextKeyExpr.or(HasSpeechProvider, BuiltinDictationConfigured),
        // Keep the toggle available for editor dictation, but not unrelated speech-to-text sessions.
        ContextKeyExpr.or(SpeechToTextInProgress.toNegated(), EDITOR_DICTATION_IN_PROGRESS),
        EditorContextKeys.readOnly.toNegated()
        // disable in read-only editors
      ),
      f1: true,
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 52 /* KeyV */,
        weight: 200 /* WorkbenchContrib */,
        secondary: isWindows ? [
          512 /* Alt */ | 91 /* Backquote */
        ] : void 0
      },
      menu: {
        id: MenuId.EditorContext,
        group: "1_modification",
        order: 6,
        // Only surface in the context menu when a dictation engine is
        // available and the editor is editable. No persistent toolbar
        // button is added; the entry point stays confined to the menu.
        when: ContextKeyExpr.and(
          ContextKeyExpr.or(HasSpeechProvider, BuiltinDictationConfigured),
          EditorContextKeys.readOnly.toNegated()
        )
      }
    });
  }
  runEditorCommand(accessor, editor) {
    const dictation = EditorDictation.get(editor);
    if (dictation?.isInProgress()) {
      dictation.stop();
      return;
    }
    const keybindingService = accessor.get(IKeybindingService);
    const holdMode = keybindingService.enableKeybindingHoldMode(this.desc.id);
    if (holdMode) {
      let shouldCallStop = false;
      const handle2 = setTimeout(() => {
        shouldCallStop = true;
      }, 500);
      holdMode.finally(() => {
        clearTimeout(handle2);
        if (shouldCallStop) {
          EditorDictation.get(editor)?.stop();
        }
      });
    }
    EditorDictation.get(editor)?.start();
  }
};

var EditorDictationStopAction = class _EditorDictationStopAction extends EditorAction2 {
  static {
    this.ID = "workbench.action.editorDictation.stop";
  }
  constructor() {
    super({
      id: _EditorDictationStopAction.ID,
      title: localize2(13656, "Stop Dictation in Editor"),
      category: VOICE_CATEGORY,
      precondition: EDITOR_DICTATION_IN_PROGRESS,
      f1: true
    });
  }
  runEditorCommand(_accessor, editor) {
    EditorDictation.get(editor)?.stop();
  }
};

var DictationWidget = class extends Disposable {
  constructor(editor, keybindingService) {
    super();
    this.editor = editor;
    this.suppressMouseDown = true;
    this.allowEditorOverflow = true;
    this.domNode = document.createElement("div");
    const actionBar3 = this._register(new ActionBar(this.domNode));
    const stopActionKeybinding = keybindingService.lookupKeybinding(EditorDictationStartAction.ID)?.getLabel();
    actionBar3.push(toAction({
      id: EditorDictationStopAction.ID,
      label: stopActionKeybinding ? localize(13657, null, stopActionKeybinding) : localize(13658, null),
      class: ThemeIcon.asClassName(Codicon.micFilled),
      run: () => EditorDictation.get(editor)?.stop()
    }), { icon: true, label: false, keybinding: stopActionKeybinding });
    this.domNode.classList.add("editor-dictation-widget");
    this.domNode.appendChild(actionBar3.domNode);
  }
  getId() {
    return "editorDictation";
  }
  getDomNode() {
    return this.domNode;
  }
  getPosition() {
    if (!this.editor.hasModel()) {
      return null;
    }
    const selection = this.editor.getSelection();
    return {
      position: selection.getPosition(),
      preference: [
        selection.getPosition().equals(selection.getStartPosition()) ? 1 /* ABOVE */ : 2 /* BELOW */,
        0 /* EXACT */
      ]
    };
  }
  beforeRender() {
    const position2 = this.editor.getPosition();
    const lineHeight = position2 ? this.editor.getLineHeightForPosition(position2) : this.editor.getOption(75 /* lineHeight */);
    const width2 = this.editor.getLayoutInfo().contentWidth * 0.7;
    this.domNode.style.setProperty("--vscode-editor-dictation-widget-height", `${lineHeight}px`);
    this.domNode.style.setProperty("--vscode-editor-dictation-widget-width", `${width2}px`);
    return null;
  }
  show() {
    this.editor.addContentWidget(this);
  }
  layout() {
    this.editor.layoutContentWidget(this);
  }
  active() {
    this.domNode.classList.add("recording");
  }
  hide() {
    this.domNode.classList.remove("recording");
    this.editor.removeContentWidget(this);
  }
};

var EditorDictation = class extends Disposable {
  constructor(editor, speechService, chatSpeechToTextService, logService, contextKeyService, keybindingService) {
    super();
    this.editor = editor;
    this.speechService = speechService;
    this.chatSpeechToTextService = chatSpeechToTextService;
    this.logService = logService;
    this.sessionDisposables = this._register(new MutableDisposable());
    this.widget = this._register(new DictationWidget(this.editor, keybindingService));
    this.editorDictationInProgress = EDITOR_DICTATION_IN_PROGRESS.bindTo(contextKeyService);
  }
  static {
    this.ID = "editorDictation";
  }
  static get(editor) {
    return editor.getContribution(EditorDictation.ID);
  }
  /** True while a dictation session is active in this editor. */
  isInProgress() {
    return !!this.editorDictationInProgress.get();
  }
  async start() {
    this.editor.getContribution(EmptyTextEditorHintContributionId)?.disposeHint();
    if (this.chatSpeechToTextService.isConfigured) {
      return this.startBuiltin();
    }
    return this.startWithProvider();
  }
  /**
   * Run editor dictation through the built-in on-device engine, reusing the
   * shared chat dictation renderer (live transcript, interim styling, and
   * "Listening…" placeholder). A floating stop widget is shown so the mic can
   * be stopped by mouse as well as by toggling the start keybinding.
   */
  async startBuiltin() {
    const disposables = new DisposableStore();
    this.sessionDisposables.value = disposables;
    this.widget.show();
    this.widget.active();
    disposables.add(toDisposable(() => this.widget.hide()));
    this.editorDictationInProgress.set(true);
    disposables.add(toDisposable(() => this.editorDictationInProgress.reset()));
    disposables.add(this.editor.onDidChangeCursorPosition(() => this.widget.layout()));
    const window2 = getWindow(this.editor.getDomNode()) ?? getActiveWindow();
    await startDictation(this.chatSpeechToTextService, this.editor, window2, this.logService, "editor");
    if (activeDictationEditor() !== this.editor) {
      this.sessionDisposables.clear();
      return;
    }
    disposables.add(this.chatSpeechToTextService.onDidChangeState((state) => {
      if (state === "idle" /* Idle */) {
        this.sessionDisposables.clear();
      }
    }));
  }
  async startWithProvider() {
    const disposables = new DisposableStore();
    this.sessionDisposables.value = disposables;
    this.widget.show();
    disposables.add(toDisposable(() => this.widget.hide()));
    this.editorDictationInProgress.set(true);
    disposables.add(toDisposable(() => this.editorDictationInProgress.reset()));
    const collection = this.editor.createDecorationsCollection();
    disposables.add(toDisposable(() => collection.clear()));
    disposables.add(this.editor.onDidChangeCursorPosition(() => this.widget.layout()));
    let previewStart = void 0;
    let lastReplaceTextLength = 0;
    const replaceText = (text2, isPreview) => {
      if (!previewStart) {
        previewStart = assertReturnsDefined(this.editor.getPosition());
      }
      const endPosition = new Position(previewStart.lineNumber, previewStart.column + text2.length);
      this.editor.executeEdits(EditorDictation.ID, [
        EditOperation.replace(Range2.fromPositions(previewStart, previewStart.with(void 0, previewStart.column + lastReplaceTextLength)), text2)
      ], [
        Selection.fromPositions(endPosition)
      ]);
      if (isPreview) {
        collection.set([
          {
            range: Range2.fromPositions(previewStart, previewStart.with(void 0, previewStart.column + text2.length)),
            options: {
              description: "editor-dictation-preview",
              inlineClassName: "ghost-text-decoration-preview"
            }
          }
        ]);
      } else {
        collection.clear();
      }
      lastReplaceTextLength = text2.length;
      if (!isPreview) {
        previewStart = void 0;
        lastReplaceTextLength = 0;
      }
      this.editor.revealPositionInCenterIfOutsideViewport(endPosition);
    };
    const cts = new CancellationTokenSource();
    disposables.add(toDisposable(() => cts.dispose(true)));
    const session = await this.speechService.createSpeechToTextSession(cts.token, "editor");
    disposables.add(session.onDidChange((e4) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      switch (e4.status) {
        case 1 /* Started */:
          this.widget.active();
          break;
        case 4 /* Stopped */:
          disposables.dispose();
          break;
        case 2 /* Recognizing */: {
          if (!e4.text) {
            return;
          }
          replaceText(e4.text, true);
          break;
        }
        case 3 /* Recognized */: {
          if (!e4.text) {
            return;
          }
          replaceText(`${e4.text} `, false);
          break;
        }
      }
    }));
  }
  stop() {
    if (isDictating() && activeDictationEditor() === this.editor) {
      stopDictation();
      return;
    }
    this.sessionDisposables.clear();
  }
};

EditorDictation = __decorateClass([
  __decorateParam(1, ISpeechService),
  __decorateParam(2, IChatSpeechToTextService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IKeybindingService)
], EditorDictation);

registerEditorContribution(EditorDictation.ID, EditorDictation, 4 /* Lazy */);

registerAction2(EditorDictationStartAction);

registerAction2(EditorDictationStopAction);
export { EDITOR_DICTATION_IN_PROGRESS, VOICE_CATEGORY, BuiltinDictationConfigured, EditorDictationStartAction, EditorDictationStopAction, DictationWidget, EditorDictation };
