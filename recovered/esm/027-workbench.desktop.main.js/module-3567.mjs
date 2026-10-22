// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughActions.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { WALK_THROUGH_FOCUS, WalkThroughPart } from "./module-3566.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughActions.ts
var WalkThroughArrowUp = {
  id: "workbench.action.interactivePlayground.arrowUp",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
  primary: 16 /* UpArrow */,
  handler: (accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane instanceof WalkThroughPart) {
      activeEditorPane.arrowUp();
    }
  }
};

var WalkThroughArrowDown = {
  id: "workbench.action.interactivePlayground.arrowDown",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
  primary: 18 /* DownArrow */,
  handler: (accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane instanceof WalkThroughPart) {
      activeEditorPane.arrowDown();
    }
  }
};

var WalkThroughPageUp = {
  id: "workbench.action.interactivePlayground.pageUp",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
  primary: 11 /* PageUp */,
  handler: (accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane instanceof WalkThroughPart) {
      activeEditorPane.pageUp();
    }
  }
};

var WalkThroughPageDown = {
  id: "workbench.action.interactivePlayground.pageDown",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
  primary: 12 /* PageDown */,
  handler: (accessor) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane instanceof WalkThroughPart) {
      activeEditorPane.pageDown();
    }
  }
};
export { WalkThroughArrowUp, WalkThroughArrowDown, WalkThroughPageUp, WalkThroughPageDown };
