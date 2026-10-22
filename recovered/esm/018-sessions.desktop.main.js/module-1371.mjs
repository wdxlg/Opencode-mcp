// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentThreadZoneWidget.ts
import { commentThreadStateBackgroundColorVar, commentThreadStateColorVar, getCommentThreadStateBorderColor } from "./module-1324.mjs";
import { peekViewBorder } from "./module-0623.mjs";
import { ZoneWidget } from "./module-0622.mjs";
import { Emitter } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { Range2 } from "./module-0106.mjs";
import { CommentThreadWidget } from "./module-1370.mjs";
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";
import { CommentGlyphWidget } from "./module-1337.mjs";
import { Color } from "./module-0197.mjs";
import { StableEditorScrollState } from "./module-0447.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ICommentService } from "./module-1321.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/comments/browser/commentThreadZoneWidget.ts
function getCommentThreadWidgetStateColor(thread, theme) {
  return getCommentThreadStateBorderColor(thread, theme) ?? theme.getColor(peekViewBorder);
}

function commentThreadHasDraft(commentThread) {
  const comments = commentThread.comments;
  if (!comments) {
    return false;
  }
  return comments.some((comment) => comment.state === 1 /* Draft */);
}

function parseMouseDownInfoFromEvent(e4) {
  const range2 = e4.target.range;
  if (!range2) {
    return null;
  }
  if (!e4.event.leftButton) {
    return null;
  }
  if (e4.target.type !== 4 /* GUTTER_LINE_DECORATIONS */) {
    return null;
  }
  const data = e4.target.detail;
  const gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth - data.glyphMarginLeft;
  if (gutterOffsetX > 20) {
    return null;
  }
  return { lineNumber: range2.startLineNumber };
}

function isMouseUpEventDragFromMouseDown(mouseDownInfo, e4) {
  if (!mouseDownInfo) {
    return null;
  }
  const { lineNumber } = mouseDownInfo;
  const range2 = e4.target.range;
  if (!range2) {
    return null;
  }
  return lineNumber;
}

var ReviewZoneWidget = class extends ZoneWidget {
  constructor(editor, _uniqueOwner, _commentThread, _pendingComment, _pendingEdits, instantiationService, themeService, commentService, contextKeyService, configurationService, dialogService) {
    super(editor, { keepEditorSelection: true, isAccessible: true, showArrow: !!_commentThread.range });
    this._uniqueOwner = _uniqueOwner;
    this._commentThread = _commentThread;
    this._pendingComment = _pendingComment;
    this._pendingEdits = _pendingEdits;
    this.themeService = themeService;
    this.commentService = commentService;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this._onDidClose = new Emitter();
    this._onDidCreateThread = new Emitter();
    this._onDidChangeExpandedState = new Emitter();
    this._globalToDispose = new DisposableStore();
    this._commentThreadDisposables = [];
    this._contextKeyService = this._globalToDispose.add(contextKeyService.createScoped(this.domNode));
    this._scopedInstantiationService = this._globalToDispose.add(instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, this._contextKeyService]
    )));
    const controller = this.commentService.getCommentController(this._uniqueOwner);
    if (controller) {
      this._commentOptions = controller.options;
    }
    this._initialCollapsibleState = _pendingComment ? 1 /* Expanded */ : _commentThread.initialCollapsibleState;
    _commentThread.initialCollapsibleState = this._initialCollapsibleState;
    this._commentThreadDisposables = [];
    this.create();
    this._globalToDispose.add(this.themeService.onDidColorThemeChange(this._applyTheme, this));
    this._globalToDispose.add(this.editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(59 /* fontInfo */)) {
        this._applyTheme();
      }
    }));
    this._applyTheme();
  }
  get uniqueOwner() {
    return this._uniqueOwner;
  }
  get commentThread() {
    return this._commentThread;
  }
  get expanded() {
    return this._isExpanded;
  }
  get onDidClose() {
    return this._onDidClose.event;
  }
  get onDidCreateThread() {
    return this._onDidCreateThread.event;
  }
  get onDidChangeExpandedState() {
    return this._onDidChangeExpandedState.event;
  }
  getPosition() {
    if (this.position) {
      return this.position;
    }
    if (this._commentGlyph) {
      return this._commentGlyph.getPosition().position ?? void 0;
    }
    return void 0;
  }
  revealRange() {
  }
  reveal(commentUniqueId, focus = 0 /* None */) {
    this.makeVisible(commentUniqueId, focus);
    const comment = this._commentThread.comments?.find((comment2) => comment2.uniqueIdInThread === commentUniqueId) ?? this._commentThread.comments?.[0];
    this.commentService.setActiveCommentAndThread(this.uniqueOwner, { thread: this._commentThread, comment });
  }
  _expandAndShowZoneWidget() {
    if (!this._isExpanded) {
      this.show(this.arrowPosition(this._commentThread.range), 2);
    }
  }
  _setFocus(commentUniqueId, focus) {
    if (focus === 1 /* Widget */) {
      this._commentThreadWidget.focus(commentUniqueId);
    } else if (focus === 2 /* Editor */) {
      this._commentThreadWidget.focusCommentEditor();
    }
  }
  _goToComment(commentUniqueId, focus) {
    const height = this.editor.getLayoutInfo().height;
    const coords = this._commentThreadWidget.getCommentCoords(commentUniqueId);
    if (coords) {
      let scrollTop = 1;
      if (this._commentThread.range) {
        const commentThreadCoords = coords.thread;
        const commentCoords = coords.comment;
        scrollTop = this.editor.getTopForLineNumber(this._commentThread.range.startLineNumber) - height / 2 + commentCoords.top - commentThreadCoords.top;
      }
      this.editor.setScrollTop(scrollTop);
      this._setFocus(commentUniqueId, focus);
    } else {
      this._goToThread(focus);
    }
  }
  _goToThread(focus) {
    const rangeToReveal = this._commentThread.range ? new Range2(this._commentThread.range.startLineNumber, this._commentThread.range.startColumn, this._commentThread.range.endLineNumber + 1, 1) : new Range2(1, 1, 1, 1);
    this.editor.revealRangeInCenter(rangeToReveal);
    this._setFocus(void 0, focus);
  }
  makeVisible(commentUniqueId, focus = 0 /* None */) {
    this._expandAndShowZoneWidget();
    if (commentUniqueId !== void 0) {
      this._goToComment(commentUniqueId, focus);
    } else {
      this._goToThread(focus);
    }
  }
  getPendingComments() {
    return {
      newComment: this._commentThreadWidget.getPendingComment(),
      edits: this._commentThreadWidget.getPendingEdits()
    };
  }
  setPendingComment(pending) {
    this._pendingComment = pending;
    this.expand();
    this._commentThreadWidget.setPendingComment(pending);
  }
  _fillContainer(container2) {
    this.setCssClass("review-widget");
    this._commentThreadWidget = this._scopedInstantiationService.createInstance(
      CommentThreadWidget,
      container2,
      this.editor,
      this._uniqueOwner,
      this.editor.getModel().uri,
      this._contextKeyService,
      this._scopedInstantiationService,
      this._commentThread,
      this._pendingComment,
      this._pendingEdits,
      { context: this.editor },
      this._commentOptions,
      {
        actionRunner: async () => {
          if (!this._commentThread.comments || !this._commentThread.comments.length) {
            const newPosition = this.getPosition();
            if (newPosition) {
              const originalRange = this._commentThread.range;
              if (!originalRange) {
                return;
              }
              let range2;
              if (newPosition.lineNumber !== originalRange.endLineNumber) {
                const distance = newPosition.lineNumber - originalRange.endLineNumber;
                range2 = new Range2(originalRange.startLineNumber + distance, originalRange.startColumn, originalRange.endLineNumber + distance, originalRange.endColumn);
              } else {
                range2 = new Range2(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.endColumn);
              }
              await this.commentService.updateCommentThreadTemplate(this.uniqueOwner, this._commentThread.commentThreadHandle, range2);
            }
          }
        },
        collapse: () => {
          return this.collapse(true);
        }
      }
    );
    this._disposables.add(this._commentThreadWidget);
  }
  arrowPosition(range2) {
    if (!range2) {
      return void 0;
    }
    return { lineNumber: range2.endLineNumber, column: range2.endLineNumber === range2.startLineNumber ? (range2.startColumn + range2.endColumn + 1) / 2 : 1 };
  }
  deleteCommentThread() {
    this.dispose();
    this.commentService.disposeCommentThread(this.uniqueOwner, this._commentThread.threadId);
  }
  doCollapse() {
    this._commentThread.collapsibleState = 0 /* Collapsed */;
  }
  async collapse(confirm = false) {
    if (!confirm || await this.confirmCollapse()) {
      this.doCollapse();
      return true;
    } else {
      return false;
    }
  }
  async confirmCollapse() {
    const confirmSetting = this.configurationService.getValue("comments.thread.confirmOnCollapse");
    if (confirmSetting === "whenHasUnsubmittedComments" && this._commentThreadWidget.hasUnsubmittedComments) {
      const result = await this.dialogService.confirm({
        message: localize(14055, null),
        primaryButton: localize(14056, null),
        type: severity_default.Warning,
        checkbox: { label: localize(14057, null), checked: false }
      });
      if (result.checkboxChecked) {
        await this.configurationService.updateValue("comments.thread.confirmOnCollapse", "never");
      }
      return result.confirmed;
    }
    return true;
  }
  expand(setActive) {
    this._commentThread.collapsibleState = 1 /* Expanded */;
    if (setActive) {
      this.commentService.setActiveCommentAndThread(this.uniqueOwner, { thread: this._commentThread });
    }
  }
  getGlyphPosition() {
    if (this._commentGlyph) {
      return this._commentGlyph.getPosition().position.lineNumber;
    }
    return 0;
  }
  async update(commentThread) {
    if (this._commentThread !== commentThread) {
      this._commentThreadDisposables.forEach((disposable) => disposable.dispose());
      this._commentThread = commentThread;
      this._commentThreadDisposables = [];
      this.bindCommentThreadListeners();
    }
    await this._commentThreadWidget.updateCommentThread(commentThread);
    const lineNumber = this._commentThread.range?.endLineNumber ?? 1;
    let shouldMoveWidget = false;
    if (this._commentGlyph) {
      const hasDraft = commentThreadHasDraft(commentThread);
      this._commentGlyph.setThreadState(commentThread.state, hasDraft);
      if (this._commentGlyph.getPosition().position.lineNumber !== lineNumber) {
        shouldMoveWidget = true;
        this._commentGlyph.setLineNumber(lineNumber);
      }
    }
    if (shouldMoveWidget && this._isExpanded || this._commentThread.collapsibleState === 1 /* Expanded */ && !this._isExpanded) {
      this.show(this.arrowPosition(this._commentThread.range), 2);
    } else if (this._commentThread.collapsibleState !== 1 /* Expanded */) {
      this.hide();
    }
  }
  _onWidth(widthInPixel) {
    this._commentThreadWidget.layout(widthInPixel);
  }
  _doLayout(heightInPixel, widthInPixel) {
    this._commentThreadWidget.layout(widthInPixel);
  }
  async display(range2, shouldReveal) {
    if (range2) {
      this._commentGlyph = new CommentGlyphWidget(this.editor, range2?.endLineNumber ?? -1);
      const hasDraft = commentThreadHasDraft(this._commentThread);
      this._commentGlyph.setThreadState(this._commentThread.state, hasDraft);
      this._globalToDispose.add(this._commentGlyph.onDidChangeLineNumber(async (e4) => {
        if (!this._commentThread.range) {
          return;
        }
        const shift2 = e4 - this._commentThread.range.endLineNumber;
        const newRange = new Range2(this._commentThread.range.startLineNumber + shift2, this._commentThread.range.startColumn, this._commentThread.range.endLineNumber + shift2, this._commentThread.range.endColumn);
        this._commentThread.range = newRange;
      }));
    }
    await this._commentThreadWidget.display(this.editor.getOption(75 /* lineHeight */), shouldReveal);
    this._disposables.add(this._commentThreadWidget.onDidResize((dimension) => {
      this._refresh(dimension);
    }));
    if (this._commentThread.collapsibleState === 1 /* Expanded */) {
      this.show(this.arrowPosition(range2), 2);
    }
    if (shouldReveal) {
      this.makeVisible();
    }
    this.bindCommentThreadListeners();
  }
  bindCommentThreadListeners() {
    this._commentThreadDisposables.push(this._commentThread.onDidChangeComments(async (_) => {
      await this.update(this._commentThread);
    }));
    this._commentThreadDisposables.push(this._commentThread.onDidChangeCollapsibleState((state) => {
      if (state === 1 /* Expanded */ && !this._isExpanded) {
        this.show(this.arrowPosition(this._commentThread.range), 2);
        this._commentThreadWidget.ensureFocusIntoNewEditingComment();
        return;
      }
      if (state === 0 /* Collapsed */ && this._isExpanded) {
        this.hide();
        return;
      }
    }));
    if (this._initialCollapsibleState === void 0) {
      const onDidChangeInitialCollapsibleState = this._commentThread.onDidChangeInitialCollapsibleState((state) => {
        this._initialCollapsibleState = state;
        this._commentThread.collapsibleState = this._initialCollapsibleState;
        onDidChangeInitialCollapsibleState.dispose();
      });
      this._commentThreadDisposables.push(onDidChangeInitialCollapsibleState);
    }
    this._commentThreadDisposables.push(this._commentThread.onDidChangeState(() => {
      const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || Color.transparent;
      this.style({
        frameColor: borderColor,
        arrowColor: borderColor
      });
      this.container?.style.setProperty(commentThreadStateColorVar, `${borderColor}`);
      this.container?.style.setProperty(commentThreadStateBackgroundColorVar, `${borderColor.transparent(0.1)}`);
    }));
  }
  async submitComment() {
    return this._commentThreadWidget.submitComment();
  }
  _refresh(dimensions) {
    if (this._isExpanded === void 0 && dimensions.height === 0 && dimensions.width === 0) {
      this.commentThread.collapsibleState = 0 /* Collapsed */;
      return;
    }
    if (this._isExpanded) {
      this._commentThreadWidget.layout();
      const headHeight = Math.ceil(this.editor.getOption(75 /* lineHeight */) * 1.2);
      const lineHeight = this.editor.getOption(75 /* lineHeight */);
      const arrowHeight = Math.round(lineHeight / 3);
      const frameThickness = Math.round(lineHeight / 9) * 2;
      const computedLinesNumber = Math.ceil((headHeight + dimensions.height + arrowHeight + frameThickness + 8) / lineHeight);
      if (this._viewZone?.heightInLines === computedLinesNumber) {
        return;
      }
      const currentPosition = this.getPosition();
      if (this._viewZone && currentPosition && currentPosition.lineNumber !== this._viewZone.afterLineNumber && this._viewZone.afterLineNumber !== 0) {
        this._viewZone.afterLineNumber = currentPosition.lineNumber;
      }
      const capture = StableEditorScrollState.capture(this.editor);
      this._relayout(computedLinesNumber);
      capture.restore(this.editor);
    }
  }
  _applyTheme() {
    const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || Color.transparent;
    this.style({
      arrowColor: borderColor,
      frameColor: borderColor
    });
    const fontInfo = this.editor.getOption(59 /* fontInfo */);
    this._commentThreadWidget.applyTheme(fontInfo);
  }
  show(rangeOrPos, heightInLines) {
    const glyphPosition = this._commentGlyph?.getPosition();
    let range2 = Range2.isIRange(rangeOrPos) ? rangeOrPos : rangeOrPos ? Range2.fromPositions(rangeOrPos) : void 0;
    if (glyphPosition?.position && range2 && glyphPosition.position.lineNumber !== range2.endLineNumber) {
      const distance = glyphPosition.position.lineNumber - range2.endLineNumber;
      range2 = new Range2(range2.startLineNumber + distance, range2.startColumn, range2.endLineNumber + distance, range2.endColumn);
    }
    const wasExpanded = this._isExpanded;
    this._isExpanded = true;
    super.show(range2 ?? new Range2(0, 0, 0, 0), heightInLines);
    this._commentThread.collapsibleState = 1 /* Expanded */;
    this._refresh(this._commentThreadWidget.getDimensions());
    if (!wasExpanded) {
      this._onDidChangeExpandedState.fire(true);
    }
  }
  async collapseAndFocusRange() {
    if (await this.collapse(true) && Range2.isIRange(this.commentThread.range) && isCodeEditor(this.editor)) {
      this.editor.setSelection(this.commentThread.range);
    }
  }
  hide() {
    if (this._isExpanded) {
      this._isExpanded = false;
      if (this.editor.hasWidgetFocus()) {
        this.editor.focus();
      }
      if (!this._commentThread.comments || !this._commentThread.comments.length) {
        this.deleteCommentThread();
      }
      this._onDidChangeExpandedState.fire(false);
    }
    super.hide();
  }
  dispose() {
    super.dispose();
    if (this._commentGlyph) {
      this._commentGlyph.dispose();
      this._commentGlyph = void 0;
    }
    this._globalToDispose.dispose();
    this._commentThreadDisposables.forEach((global) => global.dispose());
    this._onDidClose.fire(void 0);
    this._onDidClose.dispose();
    this._onDidCreateThread.dispose();
    this._onDidChangeExpandedState.dispose();
  }
};

ReviewZoneWidget = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, ICommentService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IDialogService)
], ReviewZoneWidget);
export { getCommentThreadWidgetStateColor, commentThreadHasDraft, parseMouseDownInfoFromEvent, isMouseUpEventDragFromMouseDown, ReviewZoneWidget };
