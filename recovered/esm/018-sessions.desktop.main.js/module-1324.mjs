// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentColors.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { contrastBorder, disabledForeground } from "./module-0227.mjs";
import { localize } from "./module-0001.mjs";
import { listFocusOutline } from "./module-0232.mjs";
import { peekViewTitleBackground } from "./module-0623.mjs";


// src/vs/workbench/contrib/comments/browser/commentColors.ts
var resolvedCommentViewIcon = registerColor("commentsView.resolvedIcon", { dark: disabledForeground, light: disabledForeground, hcDark: contrastBorder, hcLight: contrastBorder }, localize(13938, null));

var unresolvedCommentViewIcon = registerColor("commentsView.unresolvedIcon", { dark: listFocusOutline, light: listFocusOutline, hcDark: contrastBorder, hcLight: contrastBorder }, localize(13940, null));

registerColor("editorCommentsWidget.replyInputBackground", peekViewTitleBackground, localize(13934, null));

var resolvedCommentBorder = registerColor("editorCommentsWidget.resolvedBorder", { dark: resolvedCommentViewIcon, light: resolvedCommentViewIcon, hcDark: contrastBorder, hcLight: contrastBorder }, localize(13937, null));

var unresolvedCommentBorder = registerColor("editorCommentsWidget.unresolvedBorder", { dark: unresolvedCommentViewIcon, light: unresolvedCommentViewIcon, hcDark: contrastBorder, hcLight: contrastBorder }, localize(13939, null));

var commentThreadRangeBackground = registerColor("editorCommentsWidget.rangeBackground", transparent(unresolvedCommentBorder, 0.1), localize(13936, null));

var commentThreadRangeActiveBackground = registerColor("editorCommentsWidget.rangeActiveBackground", transparent(unresolvedCommentBorder, 0.1), localize(13935, null));

var commentThreadStateBorderColors = /* @__PURE__ */ new Map([
  [0 /* Unresolved */, unresolvedCommentBorder],
  [1 /* Resolved */, resolvedCommentBorder]
]);

var commentThreadStateIconColors = /* @__PURE__ */ new Map([
  [0 /* Unresolved */, unresolvedCommentViewIcon],
  [1 /* Resolved */, resolvedCommentViewIcon]
]);

var commentThreadStateColorVar = "--comment-thread-state-color";

var commentViewThreadStateColorVar = "--comment-view-thread-state-color";

var commentThreadStateBackgroundColorVar = "--comment-thread-state-background-color";

function getCommentThreadStateColor(state, theme, map) {
  const colorId = state !== void 0 ? map.get(state) : void 0;
  return colorId !== void 0 ? theme.getColor(colorId) : void 0;
}

function getCommentThreadStateBorderColor(state, theme) {
  return getCommentThreadStateColor(state, theme, commentThreadStateBorderColors);
}

function getCommentThreadStateIconColor(state, theme) {
  return getCommentThreadStateColor(state, theme, commentThreadStateIconColors);
}
export { getCommentThreadStateColor, getCommentThreadStateBorderColor, getCommentThreadStateIconColor, resolvedCommentViewIcon, unresolvedCommentViewIcon, resolvedCommentBorder, unresolvedCommentBorder, commentThreadRangeBackground, commentThreadRangeActiveBackground, commentThreadStateBorderColors, commentThreadStateIconColors, commentThreadStateColorVar, commentViewThreadStateColorVar, commentThreadStateBackgroundColorVar };
