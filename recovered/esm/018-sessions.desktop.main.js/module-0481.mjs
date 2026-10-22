// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/registrations.contribution.ts
import { registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/editor/browser/widget/diffEditor/registrations.contribution.ts
var diffMoveBorder = registerColor(
  "diffEditor.move.border",
  "#8b8b8b9c",
  localize(259, null)
);

var diffMoveBorderActive = registerColor(
  "diffEditor.moveActive.border",
  "#FFA500",
  localize(260, null)
);

var diffEditorUnchangedRegionShadow = registerColor(
  "diffEditor.unchangedRegionShadow",
  { dark: "#000000", light: "#737373BF", hcDark: "#000000", hcLight: "#737373BF" },
  localize(261, null)
);

var diffInsertIcon = registerIcon("diff-insert", Codicon.add, localize(262, null));

var diffRemoveIcon = registerIcon("diff-remove", Codicon.remove, localize(263, null));

var diffLineAddDecorationBackgroundWithIndicator = ModelDecorationOptions.register({
  className: "line-insert",
  description: "line-insert",
  isWholeLine: true,
  linesDecorationsClassName: "insert-sign " + ThemeIcon.asClassName(diffInsertIcon),
  marginClassName: "gutter-insert"
});

var diffLineDeleteDecorationBackgroundWithIndicator = ModelDecorationOptions.register({
  className: "line-delete",
  description: "line-delete",
  isWholeLine: true,
  linesDecorationsClassName: "delete-sign " + ThemeIcon.asClassName(diffRemoveIcon),
  marginClassName: "gutter-delete"
});

var diffLineAddDecorationBackground = ModelDecorationOptions.register({
  className: "line-insert",
  description: "line-insert",
  isWholeLine: true,
  marginClassName: "gutter-insert"
});

var diffLineDeleteDecorationBackground = ModelDecorationOptions.register({
  className: "line-delete",
  description: "line-delete",
  isWholeLine: true,
  marginClassName: "gutter-delete"
});

var diffAddDecoration = ModelDecorationOptions.register({
  className: "char-insert",
  description: "char-insert",
  shouldFillLineOnLineBreak: true
});

var diffWholeLineAddDecoration = ModelDecorationOptions.register({
  className: "char-insert",
  description: "char-insert",
  isWholeLine: true
});

var diffAddDecorationEmpty = ModelDecorationOptions.register({
  className: "char-insert diff-range-empty",
  description: "char-insert diff-range-empty"
});

var diffDeleteDecoration = ModelDecorationOptions.register({
  className: "char-delete",
  description: "char-delete",
  shouldFillLineOnLineBreak: true
});

var diffWholeLineDeleteDecoration = ModelDecorationOptions.register({
  className: "char-delete",
  description: "char-delete",
  isWholeLine: true
});

var diffDeleteDecorationEmpty = ModelDecorationOptions.register({
  className: "char-delete diff-range-empty",
  description: "char-delete diff-range-empty"
});
export { diffMoveBorder, diffMoveBorderActive, diffEditorUnchangedRegionShadow, diffInsertIcon, diffRemoveIcon, diffLineAddDecorationBackgroundWithIndicator, diffLineDeleteDecorationBackgroundWithIndicator, diffLineAddDecorationBackground, diffLineDeleteDecorationBackground, diffAddDecoration, diffWholeLineAddDecoration, diffAddDecorationEmpty, diffDeleteDecoration, diffWholeLineDeleteDecoration, diffDeleteDecorationEmpty };
