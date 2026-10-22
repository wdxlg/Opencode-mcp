// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsController.ts
import { Emitter } from "./module-0017.mjs";
import { ModelDecorationOptions, TextModel } from "./module-0423.mjs";
import { Range2 } from "./module-0106.mjs";
import { CommentGlyphWidget } from "./module-1337.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { URI } from "./module-0032.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { CommentContextKeys } from "./module-1318.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { CommentThreadRangeDecorator } from "./module-1372.mjs";
import { COMMENTEDITOR_DECORATION_KEY } from "./module-1362.mjs";
import { EditorType } from "./module-0153.mjs";
import { Delayer, createCancelablePromise } from "./module-0036.mjs";
import { coalesce } from "./module-0007.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { findFirstIdxMonotonousOrArrLen } from "./module-0006.mjs";
import { status } from "./module-0076.mjs";
import { localize } from "./module-0001.mjs";
import { threadHasMeaningfulComments } from "./module-1320.mjs";
import { COMMENTS_SECTION } from "./module-1317.mjs";
import { COMMENTS_VIEW_ID } from "./module-1326.mjs";
import { ReviewZoneWidget, isMouseUpEventDragFromMouseDown, parseMouseDownInfoFromEvent } from "./module-1371.mjs";
import { Action } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommentService } from "./module-1321.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/comments/browser/commentsController.ts
var ID = "editor.contrib.review";

var CommentingRangeDecoration = class {
  constructor(_editor, _ownerId, _extensionId, _label, _range, options3, commentingRangesInfo, isHover = false) {
    this._editor = _editor;
    this._ownerId = _ownerId;
    this._extensionId = _extensionId;
    this._label = _label;
    this._range = _range;
    this.options = options3;
    this.commentingRangesInfo = commentingRangesInfo;
    this.isHover = isHover;
    this._startLineNumber = _range.startLineNumber;
    this._endLineNumber = _range.endLineNumber;
  }
  get id() {
    return this._decorationId;
  }
  set id(id2) {
    this._decorationId = id2;
  }
  get range() {
    return {
      startLineNumber: this._startLineNumber,
      startColumn: 1,
      endLineNumber: this._endLineNumber,
      endColumn: 1
    };
  }
  getCommentAction() {
    return {
      extensionId: this._extensionId,
      label: this._label,
      ownerId: this._ownerId,
      commentingRangesInfo: this.commentingRangesInfo
    };
  }
  getOriginalRange() {
    return this._range;
  }
  getActiveRange() {
    return this.id ? this._editor.getModel().getDecorationRange(this.id) : void 0;
  }
};

var CommentingRangeDecorator = class _CommentingRangeDecorator {
  constructor() {
    this.commentingRangeDecorations = [];
    this.decorationIds = [];
    this._lastHover = -1;
    this._onDidChangeDecorationsCount = new Emitter();
    this.onDidChangeDecorationsCount = this._onDidChangeDecorationsCount.event;
    const decorationOptions = {
      description: _CommentingRangeDecorator.description,
      isWholeLine: true,
      linesDecorationsClassName: "comment-range-glyph comment-diff-added"
    };
    this.decorationOptions = ModelDecorationOptions.createDynamic(decorationOptions);
    const hoverDecorationOptions = {
      description: _CommentingRangeDecorator.description,
      isWholeLine: true,
      linesDecorationsClassName: `comment-range-glyph line-hover`
    };
    this.hoverDecorationOptions = ModelDecorationOptions.createDynamic(hoverDecorationOptions);
    const multilineDecorationOptions = {
      description: _CommentingRangeDecorator.description,
      isWholeLine: true,
      linesDecorationsClassName: `comment-range-glyph multiline-add`
    };
    this.multilineDecorationOptions = ModelDecorationOptions.createDynamic(multilineDecorationOptions);
  }
  static {
    this.description = "commenting-range-decorator";
  }
  updateHover(hoverLine) {
    if (this._editor && this._infos && hoverLine !== this._lastHover) {
      this._doUpdate(this._editor, this._infos, hoverLine);
    }
    this._lastHover = hoverLine ?? -1;
  }
  updateSelection(cursorLine, range2 = new Range2(0, 0, 0, 0)) {
    this._lastSelection = range2.isEmpty() ? void 0 : range2;
    this._lastSelectionCursor = range2.isEmpty() ? void 0 : cursorLine;
    if (this._editor && this._infos) {
      this._doUpdate(this._editor, this._infos, cursorLine, range2);
    }
  }
  update(editor, commentInfos, cursorLine, range2) {
    if (editor) {
      this._editor = editor;
      this._infos = commentInfos;
      this._doUpdate(editor, commentInfos, cursorLine, range2);
    }
  }
  _lineHasThread(editor, lineRange) {
    return editor.getDecorationsInRange(lineRange)?.find((decoration3) => decoration3.options.description === CommentGlyphWidget.description);
  }
  _doUpdate(editor, commentInfos, emphasisLine = -1, selectionRange = this._lastSelection) {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    emphasisLine = this._lastSelectionCursor ?? emphasisLine;
    const commentingRangeDecorations = [];
    for (const info of commentInfos) {
      info.commentingRanges.ranges.forEach((range2) => {
        const rangeObject = new Range2(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn);
        let intersectingSelectionRange = selectionRange ? rangeObject.intersectRanges(selectionRange) : void 0;
        if (selectionRange && emphasisLine >= 0 && intersectingSelectionRange && !(intersectingSelectionRange.startLineNumber === intersectingSelectionRange.endLineNumber && emphasisLine === intersectingSelectionRange.startLineNumber)) {
          let intersectingEmphasisRange;
          if (emphasisLine <= intersectingSelectionRange.startLineNumber) {
            intersectingEmphasisRange = intersectingSelectionRange.collapseToStart();
            intersectingSelectionRange = new Range2(intersectingSelectionRange.startLineNumber + 1, 1, intersectingSelectionRange.endLineNumber, 1);
          } else {
            intersectingEmphasisRange = new Range2(intersectingSelectionRange.endLineNumber, 1, intersectingSelectionRange.endLineNumber, 1);
            intersectingSelectionRange = new Range2(intersectingSelectionRange.startLineNumber, 1, intersectingSelectionRange.endLineNumber - 1, 1);
          }
          commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, intersectingSelectionRange, this.multilineDecorationOptions, info.commentingRanges, true));
          if (!this._lineHasThread(editor, intersectingEmphasisRange)) {
            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, intersectingEmphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
          }
          const beforeRangeEndLine = Math.min(intersectingEmphasisRange.startLineNumber, intersectingSelectionRange.startLineNumber) - 1;
          const hasBeforeRange = rangeObject.startLineNumber <= beforeRangeEndLine;
          const afterRangeStartLine = Math.max(intersectingEmphasisRange.endLineNumber, intersectingSelectionRange.endLineNumber) + 1;
          const hasAfterRange = rangeObject.endLineNumber >= afterRangeStartLine;
          if (hasBeforeRange) {
            const beforeRange = new Range2(range2.startLineNumber, 1, beforeRangeEndLine, 1);
            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
          }
          if (hasAfterRange) {
            const afterRange = new Range2(afterRangeStartLine, 1, range2.endLineNumber, 1);
            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
          }
        } else if (rangeObject.startLineNumber <= emphasisLine && emphasisLine <= rangeObject.endLineNumber) {
          if (rangeObject.startLineNumber < emphasisLine) {
            const beforeRange = new Range2(range2.startLineNumber, 1, emphasisLine - 1, 1);
            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
          }
          const emphasisRange = new Range2(emphasisLine, 1, emphasisLine, 1);
          if (!this._lineHasThread(editor, emphasisRange)) {
            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, emphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
          }
          if (emphasisLine < rangeObject.endLineNumber) {
            const afterRange = new Range2(emphasisLine + 1, 1, range2.endLineNumber, 1);
            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
          }
        } else {
          commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, range2, this.decorationOptions, info.commentingRanges));
        }
      });
    }
    editor.changeDecorations((accessor) => {
      this.decorationIds = accessor.deltaDecorations(this.decorationIds, commentingRangeDecorations);
      commentingRangeDecorations.forEach((decoration3, index2) => decoration3.id = this.decorationIds[index2]);
    });
    const rangesDifference = this.commentingRangeDecorations.length - commentingRangeDecorations.length;
    this.commentingRangeDecorations = commentingRangeDecorations;
    if (rangesDifference) {
      this._onDidChangeDecorationsCount.fire(this.commentingRangeDecorations.length);
    }
  }
  areRangesIntersectingOrTouchingByLine(a, b) {
    if (a.endLineNumber < b.startLineNumber - 1) {
      return false;
    }
    if (b.endLineNumber + 1 < a.startLineNumber) {
      return false;
    }
    return true;
  }
  getMatchedCommentAction(commentRange) {
    if (commentRange === void 0) {
      const foundInfos = this._infos?.filter((info) => info.commentingRanges.fileComments);
      if (foundInfos) {
        return foundInfos.map((foundInfo) => {
          return {
            action: {
              ownerId: foundInfo.uniqueOwner,
              extensionId: foundInfo.extensionId,
              label: foundInfo.label,
              commentingRangesInfo: foundInfo.commentingRanges
            }
          };
        });
      }
      return [];
    }
    const foundHoverActions = /* @__PURE__ */ new Map();
    for (const decoration3 of this.commentingRangeDecorations) {
      const range2 = decoration3.getActiveRange();
      if (range2 && this.areRangesIntersectingOrTouchingByLine(range2, commentRange)) {
        const action = decoration3.getCommentAction();
        const alreadyFoundInfo = foundHoverActions.get(action.ownerId);
        if (alreadyFoundInfo?.action.commentingRangesInfo === action.commentingRangesInfo) {
          const newRange = new Range2(
            range2.startLineNumber < alreadyFoundInfo.range.startLineNumber ? range2.startLineNumber : alreadyFoundInfo.range.startLineNumber,
            range2.startColumn < alreadyFoundInfo.range.startColumn ? range2.startColumn : alreadyFoundInfo.range.startColumn,
            range2.endLineNumber > alreadyFoundInfo.range.endLineNumber ? range2.endLineNumber : alreadyFoundInfo.range.endLineNumber,
            range2.endColumn > alreadyFoundInfo.range.endColumn ? range2.endColumn : alreadyFoundInfo.range.endColumn
          );
          foundHoverActions.set(action.ownerId, { range: newRange, action });
        } else {
          foundHoverActions.set(action.ownerId, { range: range2, action });
        }
      }
    }
    const seenOwners = /* @__PURE__ */ new Set();
    return Array.from(foundHoverActions.values()).filter((action) => {
      if (seenOwners.has(action.action.ownerId)) {
        return false;
      } else {
        seenOwners.add(action.action.ownerId);
        return true;
      }
    });
  }
  getNearestCommentingRange(findPosition, reverse) {
    let findPositionContainedWithin;
    let decorations;
    if (reverse) {
      decorations = [];
      for (let i2 = this.commentingRangeDecorations.length - 1; i2 >= 0; i2--) {
        decorations.push(this.commentingRangeDecorations[i2]);
      }
    } else {
      decorations = this.commentingRangeDecorations;
    }
    for (const decoration3 of decorations) {
      const range2 = decoration3.getActiveRange();
      if (!range2) {
        continue;
      }
      if (findPositionContainedWithin && this.areRangesIntersectingOrTouchingByLine(range2, findPositionContainedWithin)) {
        findPositionContainedWithin = Range2.plusRange(findPositionContainedWithin, range2);
        continue;
      }
      if (range2.startLineNumber <= findPosition.lineNumber && findPosition.lineNumber <= range2.endLineNumber) {
        findPositionContainedWithin = new Range2(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn);
        continue;
      }
      if (!reverse && range2.endLineNumber < findPosition.lineNumber) {
        continue;
      }
      if (reverse && range2.startLineNumber > findPosition.lineNumber) {
        continue;
      }
      return range2;
    }
    return decorations.length > 0 ? decorations[0].getActiveRange() ?? void 0 : void 0;
  }
  dispose() {
    this._onDidChangeDecorationsCount.dispose();
    this.commentingRangeDecorations = [];
  }
};

function moveToNextCommentInThread(commentInfo, type) {
  if (!commentInfo?.comment || !commentInfo?.thread?.comments) {
    return;
  }
  const currentIndex = commentInfo.thread.comments?.indexOf(commentInfo.comment);
  if (currentIndex === void 0 || currentIndex < 0) {
    return;
  }
  if (type === "previous" && currentIndex === 0) {
    return;
  }
  if (type === "next" && currentIndex === commentInfo.thread.comments.length - 1) {
    return;
  }
  const comment = commentInfo.thread.comments?.[type === "previous" ? currentIndex - 1 : currentIndex + 1];
  if (!comment) {
    return;
  }
  return {
    ...commentInfo,
    comment
  };
}

function revealCommentThread(commentService, editorService, uriIdentityService, commentThread, comment, focusReply, pinned, preserveFocus, sideBySide) {
  if (!commentThread.resource) {
    return;
  }
  if (!commentService.isCommentingEnabled) {
    commentService.enableCommenting(true);
  }
  const range2 = commentThread.range;
  const focus = focusReply ? 2 /* Editor */ : preserveFocus ? 0 /* None */ : 1 /* Widget */;
  const activeEditor = editorService.activeTextEditorControl;
  const currentActiveResources = isDiffEditor(activeEditor) ? [activeEditor.getOriginalEditor(), activeEditor.getModifiedEditor()] : activeEditor ? [activeEditor] : [];
  const threadToReveal = commentThread.threadId;
  const commentToReveal = comment?.uniqueIdInThread;
  const resource = URI.parse(commentThread.resource);
  for (const editor of currentActiveResources) {
    const model = editor.getModel();
    if (model instanceof TextModel && uriIdentityService.extUri.isEqual(resource, model.uri)) {
      if (threadToReveal && isCodeEditor(editor)) {
        const controller = CommentController.get(editor);
        controller?.revealCommentThread(threadToReveal, commentToReveal, true, focus);
      }
      return;
    }
  }
  editorService.openEditor({
    resource,
    options: {
      pinned,
      preserveFocus,
      selection: range2 ?? new Range2(1, 1, 1, 1)
    }
  }, sideBySide ? SIDE_GROUP : ACTIVE_GROUP).then((editor) => {
    if (editor) {
      const control = editor.getControl();
      if (threadToReveal && isCodeEditor(control)) {
        const controller = CommentController.get(control);
        controller?.revealCommentThread(threadToReveal, commentToReveal, true, focus);
      }
    }
  });
}

var CommentController = class extends Disposable {
  constructor(editor, commentService, instantiationService, codeEditorService, contextMenuService, quickInputService, viewsService, configurationService, contextKeyService, editorService, keybindingService, accessibilityService, notificationService, uriIdentityService) {
    super();
    this.commentService = commentService;
    this.instantiationService = instantiationService;
    this.codeEditorService = codeEditorService;
    this.contextMenuService = contextMenuService;
    this.quickInputService = quickInputService;
    this.viewsService = viewsService;
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.keybindingService = keybindingService;
    this.accessibilityService = accessibilityService;
    this.notificationService = notificationService;
    this.uriIdentityService = uriIdentityService;
    this.localToDispose = this._register(new DisposableStore());
    this.mouseDownInfo = null;
    this._commentingRangeSpaceReserved = false;
    this._commentingRangeAmountReserved = 0;
    this._emptyThreadsToAddQueue = [];
    // uniqueOwner -> threadId -> uniqueIdInThread -> pending comment
    this._inProcessContinueOnComments = /* @__PURE__ */ new Map();
    this._editorDisposables = [];
    this._hasRespondedToEditorChange = false;
    this._commentInfos = [];
    this._commentWidgets = [];
    this._pendingNewCommentCache = {};
    this._pendingEditsCache = {};
    this._computePromise = null;
    this._activeCursorHasCommentingRange = CommentContextKeys.activeCursorHasCommentingRange.bindTo(contextKeyService);
    this._activeCursorHasComment = CommentContextKeys.activeCursorHasComment.bindTo(contextKeyService);
    this._activeEditorHasCommentingRange = CommentContextKeys.activeEditorHasCommentingRange.bindTo(contextKeyService);
    this._commentWidgetVisible = CommentContextKeys.commentWidgetVisible.bindTo(contextKeyService);
    if (editor instanceof EmbeddedCodeEditorWidget) {
      return;
    }
    this.editor = editor;
    this._commentingRangeDecorator = this._register(new CommentingRangeDecorator());
    this._register(this._commentingRangeDecorator.onDidChangeDecorationsCount((count2) => {
      if (count2 === 0) {
        this.clearEditorListeners();
      } else if (this._editorDisposables.length === 0) {
        this.registerEditorListeners();
      }
    }));
    this._register(this._commentThreadRangeDecorator = new CommentThreadRangeDecorator(this.commentService));
    this._register(this.commentService.onDidDeleteDataProvider((ownerId2) => {
      if (ownerId2) {
        delete this._pendingNewCommentCache[ownerId2];
        delete this._pendingEditsCache[ownerId2];
      } else {
        this._pendingNewCommentCache = {};
        this._pendingEditsCache = {};
      }
      this.beginCompute();
    }));
    this._register(this.commentService.onDidSetDataProvider((_) => this.beginComputeAndHandleEditorChange()));
    this._register(this.commentService.onDidUpdateCommentingRanges((_) => this.beginComputeAndHandleEditorChange()));
    this._register(this.commentService.onDidSetResourceCommentInfos(async (e4) => {
      const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
      if (editorURI && editorURI.toString() === e4.resource.toString()) {
        await this.setComments(e4.commentInfos.filter((commentInfo) => commentInfo !== null));
      }
    }));
    this._register(this.commentService.onDidChangeCommentingEnabled((e4) => {
      if (e4) {
        this.registerEditorListeners();
        this.beginCompute();
      } else {
        this.tryUpdateReservedSpace();
        this.clearEditorListeners();
        this._commentingRangeDecorator.update(this.editor, []);
        this._commentThreadRangeDecorator.update(this.editor, []);
        dispose(this._commentWidgets);
        this._commentWidgets = [];
      }
    }));
    this._register(this.editor.onWillChangeModel((e4) => this.onWillChangeModel(e4)));
    this._register(this.editor.onDidChangeModel((_) => this.onModelChanged()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("diffEditor.renderSideBySide")) {
        this.beginCompute();
      }
    }));
    this.onModelChanged();
    this._register(this.codeEditorService.registerDecorationType("comment-controller", COMMENTEDITOR_DECORATION_KEY, {}));
    this._register(
      this.commentService.registerContinueOnCommentProvider({
        provideContinueOnComments: () => {
          const pendingComments = [];
          if (this._commentWidgets) {
            for (const zone of this._commentWidgets) {
              const zonePendingComments = zone.getPendingComments();
              const pendingNewComment = zonePendingComments.newComment;
              if (!pendingNewComment) {
                continue;
              }
              let lastCommentBody;
              if (zone.commentThread.comments && zone.commentThread.comments.length) {
                const lastComment = zone.commentThread.comments[zone.commentThread.comments.length - 1];
                if (typeof lastComment.body === "string") {
                  lastCommentBody = lastComment.body;
                } else {
                  lastCommentBody = lastComment.body.value;
                }
              }
              if (pendingNewComment.body !== lastCommentBody) {
                pendingComments.push({
                  uniqueOwner: zone.uniqueOwner,
                  uri: zone.editor.getModel().uri,
                  range: zone.commentThread.range,
                  comment: pendingNewComment,
                  isReply: zone.commentThread.comments !== void 0 && zone.commentThread.comments.length > 0
                });
              }
            }
          }
          return pendingComments;
        }
      })
    );
  }
  registerEditorListeners() {
    this._editorDisposables = [];
    if (!this.editor) {
      return;
    }
    this._editorDisposables.push(this.editor.onMouseMove((e4) => this.onEditorMouseMove(e4)));
    this._editorDisposables.push(this.editor.onMouseLeave(() => this.onEditorMouseLeave()));
    this._editorDisposables.push(this.editor.onDidChangeCursorPosition((e4) => this.onEditorChangeCursorPosition(e4.position)));
    this._editorDisposables.push(this.editor.onDidFocusEditorWidget(() => this.onEditorChangeCursorPosition(this.editor?.getPosition() ?? null)));
    this._editorDisposables.push(this.editor.onDidChangeCursorSelection((e4) => this.onEditorChangeCursorSelection(e4)));
    this._editorDisposables.push(this.editor.onDidBlurEditorWidget(() => this.onEditorChangeCursorSelection()));
  }
  clearEditorListeners() {
    dispose(this._editorDisposables);
    this._editorDisposables = [];
  }
  onEditorMouseLeave() {
    this._commentingRangeDecorator.updateHover();
  }
  onEditorMouseMove(e4) {
    const position2 = e4.target.position?.lineNumber;
    if (e4.event.leftButton.valueOf() && position2 && this.mouseDownInfo) {
      this._commentingRangeDecorator.updateSelection(position2, new Range2(this.mouseDownInfo.lineNumber, 1, position2, 1));
    } else {
      this._commentingRangeDecorator.updateHover(position2);
    }
  }
  onEditorChangeCursorSelection(e4) {
    const position2 = this.editor?.getPosition()?.lineNumber;
    if (position2) {
      this._commentingRangeDecorator.updateSelection(position2, e4?.selection);
    }
  }
  onEditorChangeCursorPosition(e4) {
    if (!e4) {
      return;
    }
    const range2 = Range2.fromPositions(e4, { column: -1, lineNumber: e4.lineNumber });
    const decorations = this.editor?.getDecorationsInRange(range2);
    let hasCommentingRange = false;
    if (decorations) {
      for (const decoration3 of decorations) {
        if (decoration3.options.description === CommentGlyphWidget.description) {
          hasCommentingRange = false;
          break;
        } else if (decoration3.options.description === CommentingRangeDecorator.description) {
          hasCommentingRange = true;
        }
      }
    }
    this._activeCursorHasCommentingRange.set(hasCommentingRange);
    this._activeCursorHasComment.set(this.getCommentsAtLine(range2).length > 0);
  }
  isEditorInlineOriginal(testEditor) {
    if (this.configurationService.getValue("diffEditor.renderSideBySide")) {
      return false;
    }
    const foundEditor = this.editorService.visibleTextEditorControls.find((editor) => {
      if (editor.getEditorType() === EditorType.IDiffEditor) {
        const diffEditor = editor;
        return diffEditor.getOriginalEditor() === testEditor;
      }
      return false;
    });
    return !!foundEditor;
  }
  beginCompute() {
    this._computePromise = createCancelablePromise((token) => {
      const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
      if (editorURI) {
        return this.commentService.getDocumentComments(editorURI);
      }
      return Promise.resolve([]);
    });
    this._computeAndSetPromise = this._computePromise.then(async (commentInfos) => {
      await this.setComments(coalesce(commentInfos));
      this._computePromise = null;
    }, (error) => console.log(error));
    this._computePromise.then(() => this._computeAndSetPromise = void 0);
    return this._computeAndSetPromise;
  }
  beginComputeCommentingRanges() {
    if (this._computeCommentingRangeScheduler) {
      this._computeCommentingRangeScheduler.trigger(() => {
        const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
        if (editorURI) {
          return this.commentService.getDocumentComments(editorURI);
        }
        return Promise.resolve([]);
      }).then((commentInfos) => {
        if (this.commentService.isCommentingEnabled) {
          const meaningfulCommentInfos = coalesce(commentInfos);
          this._commentingRangeDecorator.update(this.editor, meaningfulCommentInfos, this.editor?.getPosition()?.lineNumber, this.editor?.getSelection() ?? void 0);
        }
      }, (err) => {
        onUnexpectedError(err);
        return null;
      });
    }
  }
  static get(editor) {
    return editor.getContribution(ID);
  }
  revealCommentThread(threadId, commentUniqueId, fetchOnceIfNotExist, focus) {
    const commentThreadWidget = this._commentWidgets.filter((widget) => widget.commentThread.threadId === threadId);
    if (commentThreadWidget.length === 1) {
      commentThreadWidget[0].reveal(commentUniqueId, focus);
    } else if (fetchOnceIfNotExist) {
      if (this._computeAndSetPromise) {
        this._computeAndSetPromise.then((_) => {
          this.revealCommentThread(threadId, commentUniqueId, false, focus);
        });
      } else {
        this.beginCompute().then((_) => {
          this.revealCommentThread(threadId, commentUniqueId, false, focus);
        });
      }
    }
  }
  collapseAll() {
    for (const widget of this._commentWidgets) {
      widget.collapse(true);
    }
  }
  async collapseVisibleComments() {
    if (!this.editor) {
      return;
    }
    const visibleRanges = this.editor.getVisibleRanges();
    for (const widget of this._commentWidgets) {
      if (widget.expanded && widget.commentThread.range) {
        const isVisible = visibleRanges.some(
          (visibleRange) => Range2.areIntersectingOrTouching(visibleRange, widget.commentThread.range)
        );
        if (isVisible) {
          await widget.collapse(true);
        }
      }
    }
  }
  _updateCommentWidgetVisibleContext() {
    const hasExpanded = this._commentWidgets.some((widget) => widget.expanded);
    this._commentWidgetVisible.set(hasExpanded);
  }
  expandAll() {
    for (const widget of this._commentWidgets) {
      widget.expand();
    }
  }
  expandUnresolved() {
    for (const widget of this._commentWidgets) {
      if (widget.commentThread.state === 0 /* Unresolved */) {
        widget.expand();
      }
    }
  }
  nextCommentThread(focusThread) {
    this._findNearestCommentThread(focusThread);
  }
  _findNearestCommentThread(focusThread, reverse) {
    if (!this._commentWidgets.length || !this.editor?.hasModel()) {
      return;
    }
    const after2 = reverse ? this.editor.getSelection().getStartPosition() : this.editor.getSelection().getEndPosition();
    const sortedWidgets = this._commentWidgets.sort((a, b) => {
      if (reverse) {
        const temp = a;
        a = b;
        b = temp;
      }
      if (a.commentThread.range === void 0) {
        return -1;
      }
      if (b.commentThread.range === void 0) {
        return 1;
      }
      if (a.commentThread.range.startLineNumber < b.commentThread.range.startLineNumber) {
        return -1;
      }
      if (a.commentThread.range.startLineNumber > b.commentThread.range.startLineNumber) {
        return 1;
      }
      if (a.commentThread.range.startColumn < b.commentThread.range.startColumn) {
        return -1;
      }
      if (a.commentThread.range.startColumn > b.commentThread.range.startColumn) {
        return 1;
      }
      return 0;
    });
    const idx = findFirstIdxMonotonousOrArrLen(sortedWidgets, (widget) => {
      const lineValueOne = reverse ? after2.lineNumber : widget.commentThread.range?.startLineNumber ?? 0;
      const lineValueTwo = reverse ? widget.commentThread.range?.startLineNumber ?? 0 : after2.lineNumber;
      const columnValueOne = reverse ? after2.column : widget.commentThread.range?.startColumn ?? 0;
      const columnValueTwo = reverse ? widget.commentThread.range?.startColumn ?? 0 : after2.column;
      if (lineValueOne > lineValueTwo) {
        return true;
      }
      if (lineValueOne < lineValueTwo) {
        return false;
      }
      if (columnValueOne > columnValueTwo) {
        return true;
      }
      return false;
    });
    const nextWidget = sortedWidgets[idx];
    if (nextWidget !== void 0) {
      this.editor.setSelection(nextWidget.commentThread.range ?? new Range2(1, 1, 1, 1));
      nextWidget.reveal(void 0, focusThread ? 1 /* Widget */ : 0 /* None */);
    }
  }
  previousCommentThread(focusThread) {
    this._findNearestCommentThread(focusThread, true);
  }
  _findNearestCommentingRange(reverse) {
    if (!this.editor?.hasModel()) {
      return;
    }
    const after2 = this.editor.getSelection().getEndPosition();
    const range2 = this._commentingRangeDecorator.getNearestCommentingRange(after2, reverse);
    if (range2) {
      const position2 = reverse ? range2.getEndPosition() : range2.getStartPosition();
      this.editor.setPosition(position2);
      this.editor.revealLineInCenterIfOutsideViewport(position2.lineNumber);
    }
    if (this.accessibilityService.isScreenReaderOptimized()) {
      const commentRangeStart = range2?.getStartPosition().lineNumber;
      const commentRangeEnd = range2?.getEndPosition().lineNumber;
      if (commentRangeStart && commentRangeEnd) {
        const oneLine = commentRangeStart === commentRangeEnd;
        oneLine ? status(localize(13988, null, commentRangeStart)) : status(localize(13989, null, commentRangeStart, commentRangeEnd));
      }
    }
  }
  nextCommentingRange() {
    this._findNearestCommentingRange();
  }
  previousCommentingRange() {
    this._findNearestCommentingRange(true);
  }
  dispose() {
    super.dispose();
    dispose(this._editorDisposables);
    dispose(this._commentWidgets);
    this.editor = null;
  }
  onWillChangeModel(e4) {
    if (e4.newModelUrl) {
      this.tryUpdateReservedSpace(e4.newModelUrl);
    }
  }
  async handleCommentAdded(editorId, uniqueOwner, thread) {
    const matchedZones = this._commentWidgets.filter((zoneWidget) => zoneWidget.uniqueOwner === uniqueOwner && zoneWidget.commentThread.threadId === thread.threadId);
    if (matchedZones.length) {
      return;
    }
    const matchedNewCommentThreadZones = this._commentWidgets.filter((zoneWidget) => zoneWidget.uniqueOwner === uniqueOwner && zoneWidget.commentThread.commentThreadHandle === -1 && Range2.equalsRange(zoneWidget.commentThread.range, thread.range));
    if (matchedNewCommentThreadZones.length) {
      matchedNewCommentThreadZones[0].update(thread);
      return;
    }
    const continueOnCommentIndex = this._inProcessContinueOnComments.get(uniqueOwner)?.findIndex((pending) => {
      if (pending.range === void 0) {
        return thread.range === void 0;
      } else {
        return Range2.lift(pending.range).equalsRange(thread.range);
      }
    });
    let continueOnCommentText;
    if (continueOnCommentIndex !== void 0 && continueOnCommentIndex >= 0) {
      continueOnCommentText = this._inProcessContinueOnComments.get(uniqueOwner)?.splice(continueOnCommentIndex, 1)[0].comment.body;
    }
    const pendingCommentText = (this._pendingNewCommentCache[uniqueOwner] && this._pendingNewCommentCache[uniqueOwner][thread.threadId]) ?? continueOnCommentText;
    const pendingEdits = this._pendingEditsCache[uniqueOwner] && this._pendingEditsCache[uniqueOwner][thread.threadId];
    const shouldReveal = thread.canReply && thread.isTemplate && (!thread.comments || thread.comments.length === 0) && (!thread.editorId || thread.editorId === editorId);
    await this.displayCommentThread(uniqueOwner, thread, shouldReveal, pendingCommentText, pendingEdits);
    this._commentInfos.filter((info) => info.uniqueOwner === uniqueOwner)[0].threads.push(thread);
    this.tryUpdateReservedSpace();
  }
  onModelChanged() {
    this.localToDispose.clear();
    this.tryUpdateReservedSpace();
    this.removeCommentWidgetsAndStoreCache();
    if (!this.editor) {
      return;
    }
    this._hasRespondedToEditorChange = false;
    this.localToDispose.add(this.editor.onMouseDown((e4) => this.onEditorMouseDown(e4)));
    this.localToDispose.add(this.editor.onMouseUp((e4) => this.onEditorMouseUp(e4)));
    if (this._editorDisposables.length) {
      this.clearEditorListeners();
      this.registerEditorListeners();
    }
    this._computeCommentingRangeScheduler = new Delayer(200);
    this.localToDispose.add({
      dispose: () => {
        this._computeCommentingRangeScheduler?.cancel();
        this._computeCommentingRangeScheduler = null;
      }
    });
    this.localToDispose.add(this.editor.onDidChangeModelContent(async () => {
      this.beginComputeCommentingRanges();
    }));
    this.localToDispose.add(this.commentService.onDidUpdateCommentThreads(async (e4) => {
      const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
      if (!editorURI || !this.commentService.isCommentingEnabled) {
        return;
      }
      if (this._computePromise) {
        await this._computePromise;
      }
      const commentInfo = this._commentInfos.filter((info) => info.uniqueOwner === e4.uniqueOwner);
      if (!commentInfo || !commentInfo.length) {
        return;
      }
      const added = e4.added.filter((thread) => thread.resource && this.uriIdentityService.extUri.isEqual(URI.parse(thread.resource), editorURI));
      const removed = e4.removed.filter((thread) => thread.resource && this.uriIdentityService.extUri.isEqual(URI.parse(thread.resource), editorURI));
      const changed = e4.changed.filter((thread) => thread.resource && this.uriIdentityService.extUri.isEqual(URI.parse(thread.resource), editorURI));
      const pending = e4.pending.filter((pending2) => this.uriIdentityService.extUri.isEqual(pending2.uri, editorURI));
      removed.forEach((thread) => {
        const matchedZones = this._commentWidgets.filter((zoneWidget) => zoneWidget.uniqueOwner === e4.uniqueOwner && zoneWidget.commentThread.threadId === thread.threadId && zoneWidget.commentThread.threadId !== "");
        if (matchedZones.length) {
          const matchedZone = matchedZones[0];
          const index2 = this._commentWidgets.indexOf(matchedZone);
          this._commentWidgets.splice(index2, 1);
          matchedZone.dispose();
        }
        const infosThreads = this._commentInfos.filter((info) => info.uniqueOwner === e4.uniqueOwner)[0].threads;
        for (let i2 = 0; i2 < infosThreads.length; i2++) {
          if (infosThreads[i2] === thread) {
            infosThreads.splice(i2, 1);
            i2--;
          }
        }
      });
      for (const thread of changed) {
        const matchedZones = this._commentWidgets.filter((zoneWidget) => zoneWidget.uniqueOwner === e4.uniqueOwner && zoneWidget.commentThread.threadId === thread.threadId);
        if (matchedZones.length) {
          const matchedZone = matchedZones[0];
          matchedZone.update(thread);
          this.openCommentsView(thread);
        }
      }
      const editorId = this.editor?.getId();
      for (const thread of added) {
        await this.handleCommentAdded(editorId, e4.uniqueOwner, thread);
      }
      for (const thread of pending) {
        await this.resumePendingComment(editorURI, thread);
      }
      this._commentThreadRangeDecorator.update(this.editor, commentInfo);
    }));
    this.beginComputeAndHandleEditorChange();
  }
  async resumePendingComment(editorURI, thread) {
    const matchedZones = this._commentWidgets.filter((zoneWidget) => zoneWidget.uniqueOwner === thread.uniqueOwner && Range2.lift(zoneWidget.commentThread.range)?.equalsRange(thread.range));
    if (thread.isReply && matchedZones.length) {
      this.commentService.removeContinueOnComment({ uniqueOwner: thread.uniqueOwner, uri: editorURI, range: thread.range, isReply: true });
      matchedZones[0].setPendingComment(thread.comment);
    } else if (matchedZones.length) {
      this.commentService.removeContinueOnComment({ uniqueOwner: thread.uniqueOwner, uri: editorURI, range: thread.range, isReply: false });
      const existingPendingComment = matchedZones[0].getPendingComments().newComment;
      let pendingComment;
      if (!existingPendingComment || thread.comment.body.includes(existingPendingComment.body)) {
        pendingComment = thread.comment;
      } else if (existingPendingComment.body.includes(thread.comment.body)) {
        pendingComment = existingPendingComment;
      } else {
        pendingComment = { body: `${existingPendingComment}
${thread.comment.body}`, cursor: thread.comment.cursor };
      }
      matchedZones[0].setPendingComment(pendingComment);
    } else if (!thread.isReply) {
      const threadStillAvailable = this.commentService.removeContinueOnComment({ uniqueOwner: thread.uniqueOwner, uri: editorURI, range: thread.range, isReply: false });
      if (!threadStillAvailable) {
        return;
      }
      if (!this._inProcessContinueOnComments.has(thread.uniqueOwner)) {
        this._inProcessContinueOnComments.set(thread.uniqueOwner, []);
      }
      this._inProcessContinueOnComments.get(thread.uniqueOwner)?.push(thread);
      await this.commentService.createCommentThreadTemplate(thread.uniqueOwner, thread.uri, thread.range ? Range2.lift(thread.range) : void 0);
    }
  }
  beginComputeAndHandleEditorChange() {
    this.beginCompute().then(() => {
      if (!this._hasRespondedToEditorChange) {
        if (this._commentInfos.some((commentInfo) => commentInfo.commentingRanges.ranges.length > 0 || commentInfo.commentingRanges.fileComments)) {
          this._hasRespondedToEditorChange = true;
          const verbose = this.configurationService.getValue("accessibility.verbosity.comments" /* Comments */);
          if (verbose) {
            const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getAriaLabel();
            if (keybinding) {
              status(localize(13993, null, keybinding));
            } else {
              status(localize(13994, null));
            }
          } else {
            status(localize(13992, null));
          }
        }
      }
    });
  }
  async openCommentsView(thread) {
    if (thread.comments && thread.comments.length > 0 && threadHasMeaningfulComments(thread)) {
      const openViewState = this.configurationService.getValue(COMMENTS_SECTION).openView;
      if (openViewState === "file") {
        return this.viewsService.openView(COMMENTS_VIEW_ID);
      } else if (openViewState === "firstFile" || openViewState === "firstFileUnresolved" && thread.state === 0 /* Unresolved */) {
        const hasShownView = this.viewsService.getViewWithId(COMMENTS_VIEW_ID)?.hasRendered;
        if (!hasShownView) {
          return this.viewsService.openView(COMMENTS_VIEW_ID);
        }
      }
    }
    return void 0;
  }
  async displayCommentThread(uniqueOwner, thread, shouldReveal, pendingComment, pendingEdits) {
    const editor = this.editor?.getModel();
    if (!editor) {
      return;
    }
    if (!this.editor || this.isEditorInlineOriginal(this.editor)) {
      return;
    }
    let continueOnCommentReply;
    if (thread.range && !pendingComment) {
      continueOnCommentReply = this.commentService.removeContinueOnComment({ uniqueOwner, uri: editor.uri, range: thread.range, isReply: true });
    }
    const zoneWidget = this.instantiationService.createInstance(ReviewZoneWidget, this.editor, uniqueOwner, thread, pendingComment ?? continueOnCommentReply?.comment, pendingEdits);
    await zoneWidget.display(thread.range, shouldReveal);
    this._commentWidgets.push(zoneWidget);
    this.localToDispose.add(zoneWidget.onDidChangeExpandedState(() => this._updateCommentWidgetVisibleContext()));
    this.localToDispose.add(zoneWidget.onDidClose(() => this._updateCommentWidgetVisibleContext()));
    this.openCommentsView(thread);
  }
  onEditorMouseDown(e4) {
    this.mouseDownInfo = (e4.target.element?.className.indexOf("comment-range-glyph") ?? -1) >= 0 ? parseMouseDownInfoFromEvent(e4) : null;
  }
  onEditorMouseUp(e4) {
    const matchedLineNumber = isMouseUpEventDragFromMouseDown(this.mouseDownInfo, e4);
    this.mouseDownInfo = null;
    if (!this.editor || matchedLineNumber === null || !e4.target.element) {
      return;
    }
    const mouseUpIsOnDecorator = e4.target.element.className.indexOf("comment-range-glyph") >= 0;
    const lineNumber = e4.target.position.lineNumber;
    let range2;
    let selection;
    if (matchedLineNumber !== lineNumber) {
      if (matchedLineNumber > lineNumber) {
        selection = new Range2(matchedLineNumber, this.editor.getModel().getLineLength(matchedLineNumber) + 1, lineNumber, 1);
      } else {
        selection = new Range2(matchedLineNumber, 1, lineNumber, this.editor.getModel().getLineLength(lineNumber) + 1);
      }
    } else if (mouseUpIsOnDecorator) {
      selection = this.editor.getSelection();
    }
    if (selection && selection.startLineNumber <= lineNumber && lineNumber <= selection.endLineNumber) {
      range2 = selection;
      this.editor.setSelection(new Range2(selection.endLineNumber, 1, selection.endLineNumber, 1));
    } else if (mouseUpIsOnDecorator) {
      range2 = new Range2(lineNumber, 1, lineNumber, 1);
    }
    if (range2) {
      this.addOrToggleCommentAtLine(range2, e4);
    }
  }
  getCommentsAtLine(commentRange) {
    return this._commentWidgets.filter((widget) => widget.getGlyphPosition() === (commentRange ? commentRange.endLineNumber : 0));
  }
  async addOrToggleCommentAtLine(commentRange, e4) {
    if (!this._addInProgress) {
      this._addInProgress = true;
      const existingCommentsAtLine = this.getCommentsAtLine(commentRange);
      if (existingCommentsAtLine.length) {
        const allExpanded = existingCommentsAtLine.every((widget) => widget.expanded);
        existingCommentsAtLine.forEach(allExpanded ? (widget) => widget.collapse(true) : (widget) => widget.expand(true));
        this.processNextThreadToAdd();
        return;
      } else {
        this.addCommentAtLine(commentRange, e4);
      }
    } else {
      this._emptyThreadsToAddQueue.push([commentRange, e4]);
    }
  }
  processNextThreadToAdd() {
    this._addInProgress = false;
    const info = this._emptyThreadsToAddQueue.shift();
    if (info) {
      this.addOrToggleCommentAtLine(info[0], info[1]);
    }
  }
  clipUserRangeToCommentRange(userRange, commentRange) {
    if (userRange.startLineNumber < commentRange.startLineNumber) {
      userRange = new Range2(commentRange.startLineNumber, commentRange.startColumn, userRange.endLineNumber, userRange.endColumn);
    }
    if (userRange.endLineNumber > commentRange.endLineNumber) {
      userRange = new Range2(userRange.startLineNumber, userRange.startColumn, commentRange.endLineNumber, commentRange.endColumn);
    }
    return userRange;
  }
  addCommentAtLine(range2, e4) {
    const newCommentInfos = this._commentingRangeDecorator.getMatchedCommentAction(range2);
    if (!newCommentInfos.length || !this.editor?.hasModel()) {
      this._addInProgress = false;
      if (!newCommentInfos.length) {
        if (range2) {
          this.notificationService.error(localize(13990, null));
        } else {
          this.notificationService.error(localize(13991, null));
        }
      }
      return Promise.resolve();
    }
    if (newCommentInfos.length > 1) {
      if (e4 && range2) {
        this.contextMenuService.showContextMenu({
          getAnchor: () => e4.event,
          getActions: () => this.getContextMenuActions(newCommentInfos, range2),
          getActionsContext: () => newCommentInfos.length ? newCommentInfos[0] : void 0,
          onHide: () => {
            this._addInProgress = false;
          }
        });
        return Promise.resolve();
      } else {
        const picks = this.getCommentProvidersQuickPicks(newCommentInfos);
        return this.quickInputService.pick(picks, { placeHolder: localize(13995, null), matchOnDescription: true }).then((pick) => {
          if (!pick) {
            return;
          }
          const commentInfos = newCommentInfos.filter((info) => info.action.ownerId === pick.id);
          if (commentInfos.length) {
            const { ownerId: ownerId2 } = commentInfos[0].action;
            const clippedRange = range2 && commentInfos[0].range ? this.clipUserRangeToCommentRange(range2, commentInfos[0].range) : range2;
            this.addCommentAtLine2(clippedRange, ownerId2);
          }
        }).then(() => {
          this._addInProgress = false;
        });
      }
    } else {
      const { ownerId: ownerId2 } = newCommentInfos[0].action;
      const clippedRange = range2 && newCommentInfos[0].range ? this.clipUserRangeToCommentRange(range2, newCommentInfos[0].range) : range2;
      this.addCommentAtLine2(clippedRange, ownerId2);
    }
    return Promise.resolve();
  }
  getCommentProvidersQuickPicks(commentInfos) {
    const picks = commentInfos.map((commentInfo) => {
      const { ownerId: ownerId2, extensionId, label: label3 } = commentInfo.action;
      return {
        label: label3 ?? extensionId ?? ownerId2,
        id: ownerId2
      };
    });
    return picks;
  }
  getContextMenuActions(commentInfos, commentRange) {
    const actions = [];
    commentInfos.forEach((commentInfo) => {
      const { ownerId: ownerId2, extensionId, label: label3 } = commentInfo.action;
      actions.push(new Action(
        "addCommentThread",
        `${label3 || extensionId}`,
        void 0,
        true,
        () => {
          const clippedRange = commentInfo.range ? this.clipUserRangeToCommentRange(commentRange, commentInfo.range) : commentRange;
          this.addCommentAtLine2(clippedRange, ownerId2);
          return Promise.resolve();
        }
      ));
    });
    return actions;
  }
  addCommentAtLine2(range2, ownerId2) {
    if (!this.editor) {
      return;
    }
    this.commentService.createCommentThreadTemplate(ownerId2, this.editor.getModel().uri, range2, this.editor.getId());
    this.processNextThreadToAdd();
    return;
  }
  getExistingCommentEditorOptions(editor) {
    const lineDecorationsWidth = editor.getOption(74 /* lineDecorationsWidth */);
    let extraEditorClassName = [];
    const configuredExtraClassName = editor.getRawOptions().extraEditorClassName;
    if (configuredExtraClassName) {
      extraEditorClassName = configuredExtraClassName.split(" ");
    }
    return { lineDecorationsWidth, extraEditorClassName };
  }
  getWithoutCommentsEditorOptions(editor, extraEditorClassName, startingLineDecorationsWidth) {
    let lineDecorationsWidth = startingLineDecorationsWidth;
    const inlineCommentPos = extraEditorClassName.findIndex((name) => name === "inline-comment");
    if (inlineCommentPos >= 0) {
      extraEditorClassName.splice(inlineCommentPos, 1);
    }
    const options3 = editor.getOptions();
    if (options3.get(52 /* folding */) && options3.get(126 /* showFoldingControls */) !== "never") {
      lineDecorationsWidth += 11;
    }
    lineDecorationsWidth -= 24;
    return { extraEditorClassName, lineDecorationsWidth };
  }
  getWithCommentsLineDecorationWidth(editor, startingLineDecorationsWidth) {
    let lineDecorationsWidth = startingLineDecorationsWidth;
    const options3 = editor.getOptions();
    if (options3.get(52 /* folding */) && options3.get(126 /* showFoldingControls */) !== "never") {
      lineDecorationsWidth -= 11;
    }
    lineDecorationsWidth += 24;
    this._commentingRangeAmountReserved = lineDecorationsWidth;
    return this._commentingRangeAmountReserved;
  }
  getWithCommentsEditorOptions(editor, extraEditorClassName, startingLineDecorationsWidth) {
    extraEditorClassName.push("inline-comment");
    return { lineDecorationsWidth: this.getWithCommentsLineDecorationWidth(editor, startingLineDecorationsWidth), extraEditorClassName };
  }
  updateEditorLayoutOptions(editor, extraEditorClassName, lineDecorationsWidth) {
    editor.updateOptions({
      extraEditorClassName: extraEditorClassName.join(" "),
      lineDecorationsWidth
    });
  }
  ensureCommentingRangeReservedAmount(editor) {
    const existing = this.getExistingCommentEditorOptions(editor);
    if (existing.lineDecorationsWidth !== this._commentingRangeAmountReserved) {
      editor.updateOptions({
        lineDecorationsWidth: this.getWithCommentsLineDecorationWidth(editor, existing.lineDecorationsWidth)
      });
    }
  }
  tryUpdateReservedSpace(uri4) {
    if (!this.editor) {
      return;
    }
    const hasCommentsOrRangesInInfo = this._commentInfos.some((info) => {
      const hasRanges = Boolean(info.commentingRanges && (Array.isArray(info.commentingRanges) ? info.commentingRanges : info.commentingRanges.ranges).length);
      return hasRanges || info.threads.length > 0;
    });
    uri4 = uri4 ?? this.editor.getModel()?.uri;
    const resourceHasCommentingRanges = uri4 ? this.commentService.resourceHasCommentingRanges(uri4) : false;
    const hasCommentsOrRanges = hasCommentsOrRangesInInfo || resourceHasCommentingRanges;
    if (hasCommentsOrRanges && this.commentService.isCommentingEnabled) {
      if (!this._commentingRangeSpaceReserved) {
        this._commentingRangeSpaceReserved = true;
        const { lineDecorationsWidth, extraEditorClassName } = this.getExistingCommentEditorOptions(this.editor);
        const newOptions = this.getWithCommentsEditorOptions(this.editor, extraEditorClassName, lineDecorationsWidth);
        this.updateEditorLayoutOptions(this.editor, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
      } else {
        this.ensureCommentingRangeReservedAmount(this.editor);
      }
    } else if ((!hasCommentsOrRanges || !this.commentService.isCommentingEnabled) && this._commentingRangeSpaceReserved) {
      this._commentingRangeSpaceReserved = false;
      const { lineDecorationsWidth, extraEditorClassName } = this.getExistingCommentEditorOptions(this.editor);
      const newOptions = this.getWithoutCommentsEditorOptions(this.editor, extraEditorClassName, lineDecorationsWidth);
      this.updateEditorLayoutOptions(this.editor, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
    }
  }
  async setComments(commentInfos) {
    if (!this.editor || !this.commentService.isCommentingEnabled) {
      return;
    }
    this._commentInfos = commentInfos;
    this.tryUpdateReservedSpace();
    this.removeCommentWidgetsAndStoreCache();
    let hasCommentingRanges = false;
    for (const info of this._commentInfos) {
      if (!hasCommentingRanges && (info.commentingRanges.ranges.length > 0 || info.commentingRanges.fileComments)) {
        hasCommentingRanges = true;
      }
      const providerCacheStore = this._pendingNewCommentCache[info.uniqueOwner];
      const providerEditsCacheStore = this._pendingEditsCache[info.uniqueOwner];
      info.threads = info.threads.filter((thread) => !thread.isDisposed);
      for (const thread of info.threads) {
        let pendingComment = void 0;
        if (providerCacheStore) {
          pendingComment = providerCacheStore[thread.threadId];
        }
        let pendingEdits = void 0;
        if (providerEditsCacheStore) {
          pendingEdits = providerEditsCacheStore[thread.threadId];
        }
        await this.displayCommentThread(info.uniqueOwner, thread, false, pendingComment, pendingEdits);
      }
      for (const thread of info.pendingCommentThreads ?? []) {
        this.resumePendingComment(this.editor.getModel().uri, thread);
      }
    }
    this._commentingRangeDecorator.update(this.editor, this._commentInfos);
    this._commentThreadRangeDecorator.update(this.editor, this._commentInfos);
    if (hasCommentingRanges) {
      this._activeEditorHasCommentingRange.set(true);
    } else {
      this._activeEditorHasCommentingRange.set(false);
    }
  }
  collapseAndFocusRange(threadId) {
    this._commentWidgets?.find((widget) => widget.commentThread.threadId === threadId)?.collapseAndFocusRange();
  }
  removeCommentWidgetsAndStoreCache() {
    if (this._commentWidgets) {
      this._commentWidgets.forEach((zone) => {
        const pendingComments = zone.getPendingComments();
        const pendingNewComment = pendingComments.newComment;
        const providerNewCommentCacheStore = this._pendingNewCommentCache[zone.uniqueOwner];
        let lastCommentBody;
        if (zone.commentThread.comments && zone.commentThread.comments.length) {
          const lastComment = zone.commentThread.comments[zone.commentThread.comments.length - 1];
          if (typeof lastComment.body === "string") {
            lastCommentBody = lastComment.body;
          } else {
            lastCommentBody = lastComment.body.value;
          }
        }
        if (pendingNewComment && pendingNewComment.body !== lastCommentBody) {
          if (!providerNewCommentCacheStore) {
            this._pendingNewCommentCache[zone.uniqueOwner] = {};
          }
          this._pendingNewCommentCache[zone.uniqueOwner][zone.commentThread.threadId] = pendingNewComment;
        } else {
          if (providerNewCommentCacheStore) {
            delete providerNewCommentCacheStore[zone.commentThread.threadId];
          }
        }
        const pendingEdits = pendingComments.edits;
        const providerEditsCacheStore = this._pendingEditsCache[zone.uniqueOwner];
        if (Object.keys(pendingEdits).length > 0) {
          if (!providerEditsCacheStore) {
            this._pendingEditsCache[zone.uniqueOwner] = {};
          }
          this._pendingEditsCache[zone.uniqueOwner][zone.commentThread.threadId] = pendingEdits;
        } else if (providerEditsCacheStore) {
          delete providerEditsCacheStore[zone.commentThread.threadId];
        }
        zone.dispose();
      });
    }
    this._commentWidgets = [];
  }
};

CommentController = __decorateClass([
  __decorateParam(1, ICommentService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, IViewsService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IEditorService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IAccessibilityService),
  __decorateParam(12, INotificationService),
  __decorateParam(13, IUriIdentityService)
], CommentController);
export { moveToNextCommentInThread, revealCommentThread, ID, CommentingRangeDecoration, CommentingRangeDecorator, CommentController };
