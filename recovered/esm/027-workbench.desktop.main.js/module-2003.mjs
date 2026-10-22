// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/outline/browser/outline.ts
import { RawContextKey } from "./module-0089.mjs";


// src/vs/workbench/contrib/outline/browser/outline.ts
var IOutlinePane;

((IOutlinePane3) => {
  IOutlinePane3.Id = "outline";
})(IOutlinePane || (IOutlinePane = {}));

var ctxFollowsCursor = new RawContextKey("outlineFollowsCursor", false);

var ctxFilterOnType = new RawContextKey("outlineFiltersOnType", false);

var ctxSortMode = new RawContextKey("outlineSortMode", 0 /* ByPosition */);

var ctxAllCollapsed = new RawContextKey("outlineAllCollapsed", false);

var ctxFocused = new RawContextKey("outlineFocused", true);
export { IOutlinePane, ctxFollowsCursor, ctxFilterOnType, ctxSortMode, ctxAllCollapsed, ctxFocused };
