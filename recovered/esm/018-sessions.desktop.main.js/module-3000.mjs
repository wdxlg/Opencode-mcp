// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/comments.contribution.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ViewAction } from "./module-1334.mjs";
import { COMMENTS_VIEW_ID } from "./module-1326.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { CONTEXT_KEY_HAS_COMMENTS, CONTEXT_KEY_SOME_COMMENTS_EXPANDED } from "./module-1375.mjs";
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from "./module-1369.mjs";
import { CommentService, ICommentService } from "./module-1321.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { revealCommentThread } from "./module-1373.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { IActivityService, NumberBadge } from "./module-1448.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { Extensions10 } from "./module-0872.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { CommentThreadAccessibleView, CommentsAccessibleView } from "./module-2998.mjs";
import { CommentsAccessibilityHelp } from "./module-2999.mjs";


// src/vs/workbench/contrib/comments/browser/comments.contribution.ts
registerAction2(class Collapse extends ViewAction {
  constructor() {
    super({
      viewId: COMMENTS_VIEW_ID,
      id: "comments.collapse",
      title: localize(13957, null),
      f1: false,
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.and(ContextKeyExpr.and(ContextKeyExpr.equals("view", COMMENTS_VIEW_ID), CONTEXT_KEY_HAS_COMMENTS), CONTEXT_KEY_SOME_COMMENTS_EXPANDED),
        order: 100
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});

registerAction2(class Expand extends ViewAction {
  constructor() {
    super({
      viewId: COMMENTS_VIEW_ID,
      id: "comments.expand",
      title: localize(13971, null),
      f1: false,
      icon: Codicon.expandAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.and(ContextKeyExpr.and(ContextKeyExpr.equals("view", COMMENTS_VIEW_ID), CONTEXT_KEY_HAS_COMMENTS), ContextKeyExpr.not(CONTEXT_KEY_SOME_COMMENTS_EXPANDED.key)),
        order: 100
      }
    });
  }
  runInView(_accessor, view) {
    view.expandAll();
  }
});

registerAction2(class Reply extends Action2 {
  constructor() {
    super({
      id: "comments.reply",
      title: localize(13973, null),
      icon: Codicon.reply,
      precondition: ContextKeyExpr.equals("canReply", true),
      menu: [
        {
          id: MenuId.CommentsViewThreadActions,
          order: 100
        },
        {
          id: MenuId.AccessibleView,
          when: ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "comments" /* Comments */))
        }
      ]
    });
  }
  run(accessor, marshalledCommentThread) {
    const commentService = accessor.get(ICommentService);
    const editorService = accessor.get(IEditorService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    revealCommentThread(commentService, editorService, uriIdentityService, marshalledCommentThread.thread, marshalledCommentThread.thread.comments[marshalledCommentThread.thread.comments.length - 1], true);
  }
});

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "comments",
  order: 20,
  title: localize(13967, null),
  type: "object",
  properties: {
    "comments.openPanel": {
      enum: ["neverOpen", "openOnSessionStart", "openOnSessionStartWithComments"],
      default: "openOnSessionStartWithComments",
      description: localize(13972, null),
      restricted: false,
      markdownDeprecationMessage: localize(13960, null)
    },
    "comments.openView": {
      enum: ["never", "file", "firstFile", "firstFileUnresolved"],
      enumDescriptions: [localize(13965, null), localize(13962, null), localize(13963, null), localize(13964, null)],
      default: "firstFile",
      description: localize(13961, null),
      restricted: false
    },
    "comments.useRelativeTime": {
      type: "boolean",
      default: true,
      description: localize(13975, null)
    },
    "comments.visible": {
      type: "boolean",
      default: true,
      description: localize(13966, null)
    },
    "comments.maxHeight": {
      type: "boolean",
      default: true,
      description: localize(13959, null)
    },
    "comments.collapseOnResolve": {
      type: "boolean",
      default: true,
      description: localize(13958, null)
    },
    "comments.thread.confirmOnCollapse": {
      type: "string",
      enum: ["whenHasUnsubmittedComments", "never"],
      enumDescriptions: [localize(13970, null), localize(13969, null)],
      default: "whenHasUnsubmittedComments",
      description: localize(13968, null)
    }
  }
});

registerSingleton(ICommentService, CommentService, 1 /* Delayed */);

var UnresolvedCommentsBadge = class extends Disposable {
  constructor(_commentService, activityService) {
    super();
    this._commentService = _commentService;
    this.activityService = activityService;
    this.activity = this._register(new MutableDisposable());
    this.totalUnresolved = 0;
    this._register(this._commentService.onDidSetAllCommentThreads(this.onAllCommentsChanged, this));
    this._register(this._commentService.onDidUpdateCommentThreads(this.onCommentsUpdated, this));
    this._register(this._commentService.onDidDeleteDataProvider(this.onCommentsUpdated, this));
  }
  onAllCommentsChanged(e4) {
    let unresolved = 0;
    for (const thread of e4.commentThreads) {
      if (thread.state === 0 /* Unresolved */) {
        unresolved++;
      }
    }
    this.updateBadge(unresolved);
  }
  onCommentsUpdated() {
    let unresolved = 0;
    for (const resource of this._commentService.commentsModel.resourceCommentThreads) {
      for (const thread of resource.commentThreads) {
        if (thread.threadState === 0 /* Unresolved */) {
          unresolved++;
        }
      }
    }
    this.updateBadge(unresolved);
  }
  updateBadge(unresolved) {
    if (unresolved === this.totalUnresolved) {
      return;
    }
    this.totalUnresolved = unresolved;
    const message = localize(13974, null, this.totalUnresolved);
    this.activity.value = this.activityService.showViewActivity(COMMENTS_VIEW_ID, { badge: new NumberBadge(this.totalUnresolved, () => message) });
  }
};

UnresolvedCommentsBadge = __decorateClass([
  __decorateParam(0, ICommentService),
  __decorateParam(1, IActivityService)
], UnresolvedCommentsBadge);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(UnresolvedCommentsBadge, 4 /* Eventually */);

AccessibleViewRegistry.register(new CommentsAccessibleView());

AccessibleViewRegistry.register(new CommentThreadAccessibleView());

AccessibleViewRegistry.register(new CommentsAccessibilityHelp());
export { UnresolvedCommentsBadge };
