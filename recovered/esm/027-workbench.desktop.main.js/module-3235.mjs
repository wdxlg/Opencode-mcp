// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsAccessibility.ts
import { localize } from "./module-0001.mjs";
import { ToggleTabFocusModeAction } from "./module-0852.mjs";
import { Disposable } from "./module-0012.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ctxCommentEditorFocused } from "./module-1362.mjs";
import { CommentContextKeys } from "./module-1319.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/comments/browser/commentsAccessibility.ts
var CommentAccessibilityHelpNLS;

((CommentAccessibilityHelpNLS2) => {
  CommentAccessibilityHelpNLS2.intro = localize(13979, null);
  CommentAccessibilityHelpNLS2.tabFocus = localize(13980, null, `<keybinding:${ToggleTabFocusModeAction.ID}>`);
  CommentAccessibilityHelpNLS2.commentCommands = localize(13977, null);
  CommentAccessibilityHelpNLS2.escape = localize(13978, null, `<keybinding:${"workbench.action.hideComment" /* Hide */}>`);
  CommentAccessibilityHelpNLS2.nextRange = localize(13981, null, `<keybinding:${"editor.action.nextCommentingRange" /* NextRange */}>`);
  CommentAccessibilityHelpNLS2.previousRange = localize(13984, null, `<keybinding:${"editor.action.previousCommentingRange" /* PreviousRange */}>`);
  CommentAccessibilityHelpNLS2.nextCommentThread = localize(13983, null, `<keybinding:${"editor.action.nextCommentThreadAction" /* NextThread */}>`);
  CommentAccessibilityHelpNLS2.previousCommentThread = localize(13986, null, `<keybinding:${"editor.action.previousCommentThreadAction" /* PreviousThread */}>`);
  CommentAccessibilityHelpNLS2.nextCommentedRange = localize(13982, null, `<keybinding:${"editor.action.nextCommentedRangeAction" /* NextCommentedRange */}>`);
  CommentAccessibilityHelpNLS2.previousCommentedRange = localize(13985, null, `<keybinding:${"editor.action.previousCommentedRangeAction" /* PreviousCommentedRange */}>`);
  CommentAccessibilityHelpNLS2.addComment = localize(13976, null, `<keybinding:${"workbench.action.addComment" /* Add */}>`);
  CommentAccessibilityHelpNLS2.submitComment = localize(13987, null, `<keybinding:${"editor.action.submitComment" /* Submit */}>`);
})(CommentAccessibilityHelpNLS || (CommentAccessibilityHelpNLS = {}));

var CommentsAccessibilityHelpProvider = class extends Disposable {
  constructor() {
    super(...arguments);
    this.id = "comments" /* Comments */;
    this.verbositySettingKey = "accessibility.verbosity.comments" /* Comments */;
    this.options = { type: "help" /* Help */ };
  }
  provideContent() {
    return [CommentAccessibilityHelpNLS.tabFocus, CommentAccessibilityHelpNLS.commentCommands, CommentAccessibilityHelpNLS.escape, CommentAccessibilityHelpNLS.addComment, CommentAccessibilityHelpNLS.submitComment, CommentAccessibilityHelpNLS.nextRange, CommentAccessibilityHelpNLS.previousRange].join("\n");
  }
  onClose() {
    this._element?.focus();
  }
};

var CommentsAccessibilityHelp = class {
  constructor() {
    this.priority = 110;
    this.name = "comments";
    this.type = "help" /* Help */;
    this.when = ContextKeyExpr.or(ctxCommentEditorFocused, CommentContextKeys.commentFocused);
  }
  getProvider(accessor) {
    return accessor.get(IInstantiationService).createInstance(CommentsAccessibilityHelpProvider);
  }
};
export { CommentAccessibilityHelpNLS, CommentsAccessibilityHelpProvider, CommentsAccessibilityHelp };
