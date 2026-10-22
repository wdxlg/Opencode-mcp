// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentThreadBody.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, Dimension, EventType, addDisposableListener, append, getClientArea, getDomNodePagePosition } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { localize } from "./module-0001.mjs";
import { CommentNode2 } from "./module-1365.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommentService } from "./module-1322.mjs";


// src/vs/workbench/contrib/comments/browser/commentThreadBody.ts
var CommentThreadBody = class extends Disposable {
  constructor(_parentEditor, owner, parentResourceUri, container3, _markdownRendererOptions, _commentThread, _pendingEdits, _scopedInstatiationService, _parentCommentThreadWidget, commentService) {
    super();
    this._parentEditor = _parentEditor;
    this.owner = owner;
    this.parentResourceUri = parentResourceUri;
    this.container = container3;
    this._markdownRendererOptions = _markdownRendererOptions;
    this._commentThread = _commentThread;
    this._pendingEdits = _pendingEdits;
    this._scopedInstatiationService = _scopedInstatiationService;
    this._parentCommentThreadWidget = _parentCommentThreadWidget;
    this.commentService = commentService;
    this._commentElements = [];
    this._resizeObserver = null;
    this._focusedComment = void 0;
    this._onDidResize = this._register(new Emitter());
    this.onDidResize = this._onDidResize.event;
    this._commentDisposable = new DisposableMap();
    this._containerClientArea = void 0;
    this._register(addDisposableListener(container3, EventType.FOCUS_IN, (e) => {
      this.commentService.setActiveEditingCommentThread(this._commentThread);
    }));
  }
  get length() {
    return this._commentThread.comments ? this._commentThread.comments.length : 0;
  }
  get activeComment() {
    return this._commentElements.filter((node) => node.isEditing)[0];
  }
  focus(commentUniqueId) {
    if (commentUniqueId !== void 0) {
      const comment = this._commentElements.find((commentNode) => commentNode.comment.uniqueIdInThread === commentUniqueId);
      if (comment) {
        comment.focus();
        return;
      }
    }
    this._commentsElement.focus();
  }
  hasCommentsInEditMode() {
    return this._commentElements.some((commentNode) => commentNode.isEditing);
  }
  ensureFocusIntoNewEditingComment() {
    if (this._commentElements.length === 1 && this._commentElements[0].isEditing) {
      this._commentElements[0].setFocus(true);
    }
  }
  async display() {
    this._commentsElement = append(this.container, $("div.comments-container"));
    this._commentsElement.setAttribute("role", "presentation");
    this._commentsElement.tabIndex = 0;
    this._updateAriaLabel();
    this._register(addDisposableListener(this._commentsElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if ((event.equals(16 /* UpArrow */) || event.equals(18 /* DownArrow */)) && (!this._focusedComment || !this._commentElements[this._focusedComment].isEditing)) {
        const moveFocusWithinBounds = (change) => {
          if (this._focusedComment === void 0 && change >= 0) {
            return 0;
          }
          if (this._focusedComment === void 0 && change < 0) {
            return this._commentElements.length - 1;
          }
          const newIndex = this._focusedComment + change;
          return Math.min(Math.max(0, newIndex), this._commentElements.length - 1);
        };
        this._setFocusedComment(event.equals(16 /* UpArrow */) ? moveFocusWithinBounds(-1) : moveFocusWithinBounds(1));
      }
    }));
    this._commentDisposable.clearAndDisposeAll();
    this._commentElements = [];
    if (this._commentThread.comments) {
      for (const comment of this._commentThread.comments) {
        const newCommentNode = this.createNewCommentNode(comment);
        this._commentElements.push(newCommentNode);
        this._commentsElement.appendChild(newCommentNode.domNode);
        if (comment.mode === 0 /* Editing */) {
          await newCommentNode.switchToEditMode();
        }
      }
    }
    this._resizeObserver = new MutationObserver(this._refresh.bind(this));
    this._resizeObserver.observe(this.container, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }
  _refresh() {
    const dimensions = getClientArea(this.container);
    if (dimensions.height === 0 && dimensions.width === 0 || Dimension.equals(this._containerClientArea, dimensions)) {
      return;
    }
    this._containerClientArea = dimensions;
    this._onDidResize.fire(dimensions);
  }
  getDimensions() {
    return getClientArea(this.container);
  }
  layout(widthInPixel) {
    this._commentElements.forEach((element) => {
      element.layout(widthInPixel);
    });
  }
  getPendingEdits() {
    const pendingEdits = {};
    this._commentElements.forEach((element) => {
      if (element.isEditing) {
        const pendingEdit = element.getPendingEdit();
        if (pendingEdit) {
          pendingEdits[element.comment.uniqueIdInThread] = pendingEdit;
        }
      }
    });
    return pendingEdits;
  }
  getCommentCoords(commentUniqueId) {
    const matchedNode = this._commentElements.filter((commentNode) => commentNode.comment.uniqueIdInThread === commentUniqueId);
    if (matchedNode && matchedNode.length) {
      const commentThreadCoords = getDomNodePagePosition(this._commentElements[0].domNode);
      const commentCoords = getDomNodePagePosition(matchedNode[0].domNode);
      return {
        thread: commentThreadCoords,
        comment: commentCoords
      };
    }
    return;
  }
  async updateCommentThread(commentThread, preserveFocus) {
    const oldCommentsLen = this._commentElements.length;
    const newCommentsLen = commentThread.comments ? commentThread.comments.length : 0;
    const commentElementsToDel = [];
    const commentElementsToDelIndex = [];
    for (let i2 = 0; i2 < oldCommentsLen; i2++) {
      const comment = this._commentElements[i2].comment;
      const newComment = commentThread.comments ? commentThread.comments.filter((c) => c.uniqueIdInThread === comment.uniqueIdInThread) : [];
      if (newComment.length) {
        this._commentElements[i2].update(newComment[0]);
      } else {
        commentElementsToDelIndex.push(i2);
        commentElementsToDel.push(this._commentElements[i2]);
      }
    }
    for (let i2 = commentElementsToDel.length - 1; i2 >= 0; i2--) {
      const commentToDelete = commentElementsToDel[i2];
      this._commentDisposable.deleteAndDispose(commentToDelete);
      this._commentElements.splice(commentElementsToDelIndex[i2], 1);
      commentToDelete.domNode.remove();
    }
    let lastCommentElement = null;
    const newCommentNodeList = [];
    const newCommentsInEditMode = [];
    const startEditing = [];
    for (let i2 = newCommentsLen - 1; i2 >= 0; i2--) {
      const currentComment = commentThread.comments[i2];
      const oldCommentNode = this._commentElements.filter((commentNode) => commentNode.comment.uniqueIdInThread === currentComment.uniqueIdInThread);
      if (oldCommentNode.length) {
        lastCommentElement = oldCommentNode[0].domNode;
        newCommentNodeList.unshift(oldCommentNode[0]);
      } else {
        const newElement = this.createNewCommentNode(currentComment);
        newCommentNodeList.unshift(newElement);
        if (lastCommentElement) {
          this._commentsElement.insertBefore(newElement.domNode, lastCommentElement);
          lastCommentElement = newElement.domNode;
        } else {
          this._commentsElement.appendChild(newElement.domNode);
          lastCommentElement = newElement.domNode;
        }
        if (currentComment.mode === 0 /* Editing */) {
          startEditing.push(newElement.switchToEditMode());
          newCommentsInEditMode.push(newElement);
        }
      }
    }
    this._commentThread = commentThread;
    this._commentElements = newCommentNodeList;
    await Promise.all(startEditing);
    if (newCommentsInEditMode.length) {
      const lastIndex = this._commentElements.indexOf(newCommentsInEditMode[newCommentsInEditMode.length - 1]);
      this._focusedComment = lastIndex;
    }
    this._updateAriaLabel();
    if (!preserveFocus) {
      this._setFocusedComment(this._focusedComment);
    }
  }
  _updateAriaLabel() {
    if (this._commentThread.isDocumentCommentThread()) {
      if (this._commentThread.range) {
        this._commentsElement.ariaLabel = localize(
          14048,
          null,
          this._commentThread.comments?.length,
          this._commentThread.range.startLineNumber,
          this._commentThread.range.endLineNumber,
          this._commentThread.label
        );
      } else {
        this._commentsElement.ariaLabel = localize(
          14047,
          null,
          this._commentThread.comments?.length,
          this._commentThread.label
        );
      }
    } else {
      this._commentsElement.ariaLabel = localize(
        14046,
        null,
        this._commentThread.comments?.length,
        this._commentThread.label
      );
    }
  }
  _setFocusedComment(value2) {
    if (this._focusedComment !== void 0) {
      this._commentElements[this._focusedComment]?.setFocus(false);
    }
    if (this._commentElements.length === 0 || value2 === void 0) {
      this._focusedComment = void 0;
    } else {
      this._focusedComment = Math.min(value2, this._commentElements.length - 1);
      this._commentElements[this._focusedComment].setFocus(true);
    }
  }
  createNewCommentNode(comment) {
    const newCommentNode = this._scopedInstatiationService.createInstance(
      CommentNode2,
      this._parentEditor,
      this._commentThread,
      comment,
      this._pendingEdits ? this._pendingEdits[comment.uniqueIdInThread] : void 0,
      this.owner,
      this.parentResourceUri,
      this._parentCommentThreadWidget,
      this._markdownRendererOptions
    );
    const disposables = new DisposableStore();
    disposables.add(newCommentNode.onDidClick(
      (clickedNode) => this._setFocusedComment(this._commentElements.findIndex((commentNode) => commentNode.comment.uniqueIdInThread === clickedNode.comment.uniqueIdInThread))
    ));
    disposables.add(newCommentNode);
    this._commentDisposable.set(newCommentNode, disposables);
    return newCommentNode;
  }
  dispose() {
    super.dispose();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    this._commentDisposable.dispose();
  }
};

CommentThreadBody = __decorateClass([
  __decorateParam(9, ICommentService)
], CommentThreadBody);
export { CommentThreadBody };
