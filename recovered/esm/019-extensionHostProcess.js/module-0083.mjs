// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/codicons.ts
import { register2 } from "./module-0081.mjs";
import { codiconsLibrary } from "./module-0082.mjs";


// src/vs/base/common/codicons.ts
var codiconsDerived = {
  dialogError: register2("dialog-error", "error"),
  dialogWarning: register2("dialog-warning", "warning"),
  dialogInfo: register2("dialog-info", "info"),
  dialogClose: register2("dialog-close", "close"),
  treeItemExpanded: register2("tree-item-expanded", "chevron-down"),
  // collapsed is done with rotation
  treeFilterOnTypeOn: register2("tree-filter-on-type-on", "list-filter"),
  treeFilterOnTypeOff: register2("tree-filter-on-type-off", "list-selection"),
  treeFilterClear: register2("tree-filter-clear", "close"),
  treeItemLoading: register2("tree-item-loading", "loading"),
  menuSelection: register2("menu-selection", "check"),
  menuSubmenu: register2("menu-submenu", "chevron-right"),
  menuBarMore: register2("menubar-more", "more"),
  scrollbarButtonLeft: register2("scrollbar-button-left", "triangle-left"),
  scrollbarButtonRight: register2("scrollbar-button-right", "triangle-right"),
  scrollbarButtonUp: register2("scrollbar-button-up", "triangle-up"),
  scrollbarButtonDown: register2("scrollbar-button-down", "triangle-down"),
  toolBarMore: register2("toolbar-more", "more"),
  quickInputBack: register2("quick-input-back", "arrow-left"),
  dropDownButton: register2("drop-down-button", 60084),
  symbolCustomColor: register2("symbol-customcolor", 60252),
  exportIcon: register2("export", 60332),
  workspaceUnspecified: register2("workspace-unspecified", 60355),
  newLine: register2("newline", 60394),
  thumbsDownFilled: register2("thumbsdown-filled", 60435),
  thumbsUpFilled: register2("thumbsup-filled", 60436),
  gitFetch: register2("git-fetch", 60445),
  lightbulbSparkleAutofix: register2("lightbulb-sparkle-autofix", 60447),
  debugBreakpointPending: register2("debug-breakpoint-pending", 60377),
  chatImport: register2("chat-import", 60550),
  chatExport: register2("chat-export", 60551)
};

var Codicon = {
  ...codiconsLibrary,
  ...codiconsDerived
};
export { codiconsDerived, Codicon };
