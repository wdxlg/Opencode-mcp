// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/common/commentContextKeys.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/comments/common/commentContextKeys.ts
var CommentContextKeys;

((CommentContextKeys2) => {
  CommentContextKeys2.activeCursorHasCommentingRange = new RawContextKey("activeCursorHasCommentingRange", false, {
    description: localize(14076, null),
    type: "boolean"
  });
  CommentContextKeys2.activeCursorHasComment = new RawContextKey("activeCursorHasComment", false, {
    description: localize(14074, null),
    type: "boolean"
  });
  CommentContextKeys2.activeEditorHasCommentingRange = new RawContextKey("activeEditorHasCommentingRange", false, {
    description: localize(14073, null),
    type: "boolean"
  });
  CommentContextKeys2.WorkspaceHasCommenting = new RawContextKey("workspaceHasCommenting", false, {
    description: localize(14075, null),
    type: "boolean"
  });
  CommentContextKeys2.commentThreadIsEmpty = new RawContextKey("commentThreadIsEmpty", false, { type: "boolean", description: localize(14071, null) });
  CommentContextKeys2.commentIsEmpty = new RawContextKey("commentIsEmpty", false, { type: "boolean", description: localize(14069, null) });
  CommentContextKeys2.commentContext = new RawContextKey("comment", void 0, { type: "string", description: localize(14065, null) });
  CommentContextKeys2.commentThreadContext = new RawContextKey("commentThread", void 0, { type: "string", description: localize(14070, null) });
  CommentContextKeys2.commentControllerContext = new RawContextKey("commentController", void 0, { type: "string", description: localize(14066, null) });
  CommentContextKeys2.commentFocused = new RawContextKey("commentFocused", false, { type: "boolean", description: localize(14067, null) });
  CommentContextKeys2.commentWidgetVisible = new RawContextKey("commentWidgetVisible", false, { type: "boolean", description: localize(14072, null) });
  CommentContextKeys2.commentingEnabled = new RawContextKey("commentingEnabled", true, {
    description: localize(14068, null),
    type: "boolean"
  });
})(CommentContextKeys || (CommentContextKeys = {}));
export { CommentContextKeys };
