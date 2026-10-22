// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsAccessibleView.ts
import { Disposable } from "./module-0012.mjs";
import { CONTEXT_KEY_COMMENT_FOCUSED } from "./module-1376.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IMenuService } from "./module-0092.mjs";
import { COMMENTS_VIEW_ID, CommentsMenus } from "./module-1327.mjs";
import { CommentContextKeys } from "./module-1319.mjs";
import { ICommentService } from "./module-1322.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { URI } from "./module-0032.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { moveToNextCommentInThread, revealCommentThread } from "./module-1374.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/comments/browser/commentsAccessibleView.ts
var CommentsAccessibleView = class extends Disposable {
  constructor() {
    super();
    this.priority = 90;
    this.name = "comment";
    this.when = CONTEXT_KEY_COMMENT_FOCUSED;
    this.type = "view" /* View */;
  }
  getProvider(accessor) {
    const contextKeyService = accessor.get(IContextKeyService);
    const viewsService = accessor.get(IViewsService);
    const menuService = accessor.get(IMenuService);
    const commentsView = viewsService.getActiveViewWithId(COMMENTS_VIEW_ID);
    const focusedCommentNode = commentsView?.focusedCommentNode;
    if (!commentsView || !focusedCommentNode) {
      return;
    }
    const menus = this._register(new CommentsMenus(menuService));
    menus.setContextKeyService(contextKeyService);
    return new CommentsAccessibleContentProvider(commentsView, focusedCommentNode, menus);
  }
};

var CommentThreadAccessibleView = class extends Disposable {
  constructor() {
    super();
    this.priority = 85;
    this.name = "commentThread";
    this.when = CommentContextKeys.commentFocused;
    this.type = "view" /* View */;
  }
  getProvider(accessor) {
    const commentService = accessor.get(ICommentService);
    const editorService = accessor.get(IEditorService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    const threads = commentService.commentsModel.hasCommentThreads();
    if (!threads) {
      return;
    }
    return new CommentsThreadWidgetAccessibleContentProvider(commentService, editorService, uriIdentityService);
  }
};

var CommentsAccessibleContentProvider = class extends Disposable {
  constructor(_commentsView, _focusedCommentNode, _menus) {
    super();
    this._commentsView = _commentsView;
    this._focusedCommentNode = _focusedCommentNode;
    this._menus = _menus;
    this.id = "comments" /* Comments */;
    this.verbositySettingKey = "accessibility.verbosity.comments" /* Comments */;
    this.options = { type: "view" /* View */ };
    this.actions = [...this._menus.getResourceContextActions(this._focusedCommentNode)].filter((i2) => i2.enabled).map((action) => {
      return {
        ...action,
        run: () => {
          this._commentsView.focus();
          action.run({
            thread: this._focusedCommentNode.thread,
            $mid: 7 /* CommentThread */,
            commentControlHandle: this._focusedCommentNode.controllerHandle,
            commentThreadHandle: this._focusedCommentNode.threadHandle
          });
        }
      };
    });
  }
  provideContent() {
    const commentNode = this._commentsView.focusedCommentNode;
    const content2 = this._commentsView.focusedCommentInfo?.toString();
    if (!commentNode || !content2) {
      throw new Error("Comment tree is focused but no comment is selected");
    }
    return content2;
  }
  onClose() {
    this._commentsView.focus();
  }
  provideNextContent() {
    this._commentsView.focusNextNode();
    return this.provideContent();
  }
  providePreviousContent() {
    this._commentsView.focusPreviousNode();
    return this.provideContent();
  }
};

var CommentsThreadWidgetAccessibleContentProvider = class extends Disposable {
  constructor(_commentService, _editorService, _uriIdentityService) {
    super();
    this._commentService = _commentService;
    this._editorService = _editorService;
    this._uriIdentityService = _uriIdentityService;
    this.id = "commentThread" /* CommentThread */;
    this.verbositySettingKey = "accessibility.verbosity.comments" /* Comments */;
    this.options = { type: "view" /* View */ };
  }
  get activeCommentInfo() {
    if (!this._activeCommentInfo && this._commentService.lastActiveCommentcontroller) {
      this._activeCommentInfo = this._commentService.lastActiveCommentcontroller.activeComment;
    }
    return this._activeCommentInfo;
  }
  provideContent() {
    if (!this.activeCommentInfo) {
      throw new Error("No current comment thread");
    }
    const comment = this.activeCommentInfo.comment?.body;
    const commentLabel = typeof comment === "string" ? comment : comment?.value ?? "";
    const resource = this.activeCommentInfo.thread.resource;
    const range2 = this.activeCommentInfo.thread.range;
    let contentLabel = "";
    if (resource && range2) {
      const editor = this._editorService.findEditors(URI.parse(resource)) || [];
      const codeEditor = this._editorService.activeEditorPane?.getControl();
      if (editor?.length && isCodeEditor(codeEditor)) {
        const content2 = codeEditor.getModel()?.getValueInRange(range2);
        if (content2) {
          contentLabel = "\nCorresponding code: \n" + content2;
        }
      }
    }
    return commentLabel + contentLabel;
  }
  onClose() {
    const lastComment = this._activeCommentInfo;
    this._activeCommentInfo = void 0;
    if (lastComment) {
      revealCommentThread(this._commentService, this._editorService, this._uriIdentityService, lastComment.thread, lastComment.comment);
    }
  }
  provideNextContent() {
    const newCommentInfo = moveToNextCommentInThread(this._activeCommentInfo, "next");
    if (newCommentInfo) {
      this._activeCommentInfo = newCommentInfo;
      return this.provideContent();
    }
    return void 0;
  }
  providePreviousContent() {
    const newCommentInfo = moveToNextCommentInThread(this._activeCommentInfo, "previous");
    if (newCommentInfo) {
      this._activeCommentInfo = newCommentInfo;
      return this.provideContent();
    }
    return void 0;
  }
};

CommentsThreadWidgetAccessibleContentProvider = __decorateClass([
  __decorateParam(0, ICommentService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IUriIdentityService)
], CommentsThreadWidgetAccessibleContentProvider);
export { CommentsAccessibleView, CommentThreadAccessibleView, CommentsAccessibleContentProvider, CommentsThreadWidgetAccessibleContentProvider };
