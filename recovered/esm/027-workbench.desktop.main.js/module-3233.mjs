// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsEditorContribution.ts
import { registerEditorContribution } from "./module-0097.mjs";
import { CommentController, ID } from "./module-1374.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { CommentsInputContentProvider } from "./module-3232.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { CommentContextKeys } from "./module-1319.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { accessibilityHelpIsShown, accessibleViewCurrentProviderId } from "./module-1370.mjs";
import { ICommentService } from "./module-1322.mjs";
import { Range2 } from "./module-0106.mjs";
import { INotificationService } from "./module-0336.mjs";
import { SimpleCommentEditor, ctxCommentEditorFocused } from "./module-1362.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IEditorService } from "./module-0934.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";


// src/vs/workbench/contrib/comments/browser/commentsEditorContribution.ts
registerEditorContribution(ID, CommentController, 1 /* AfterFirstRender */);

registerWorkbenchContribution2(CommentsInputContentProvider.ID, CommentsInputContentProvider, WorkbenchPhase.BlockRestore);

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "editor.action.nextCommentThreadAction" /* NextThread */,
  handler: async (accessor, args2) => {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return Promise.resolve();
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return Promise.resolve();
    }
    controller.nextCommentThread(true);
  },
  weight: 100 /* EditorContrib */,
  primary: 512 /* Alt */ | 67 /* F9 */
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "editor.action.previousCommentThreadAction" /* PreviousThread */,
  handler: async (accessor, args2) => {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return Promise.resolve();
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return Promise.resolve();
    }
    controller.previousCommentThread(true);
  },
  weight: 100 /* EditorContrib */,
  primary: 1024 /* Shift */ | 512 /* Alt */ | 67 /* F9 */
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "editor.action.nextCommentedRangeAction" /* NextCommentedRange */,
      title: {
        value: localize(14002, null),
        original: "Go to Next Commented Range"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }],
      keybinding: {
        primary: 512 /* Alt */ | 68 /* F10 */,
        weight: 100 /* EditorContrib */,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }
    });
  }
  run(accessor, ...args2) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    controller.nextCommentThread(false);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "editor.action.previousCommentedRangeAction" /* PreviousCommentedRange */,
      title: {
        value: localize(14004, null),
        original: "Go to Previous Commented Range"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }],
      keybinding: {
        primary: 1024 /* Shift */ | 512 /* Alt */ | 68 /* F10 */,
        weight: 100 /* EditorContrib */,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }
    });
  }
  run(accessor, ...args2) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    controller.previousCommentThread(false);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "editor.action.nextCommentingRange" /* NextRange */,
      title: {
        value: localize(14003, null),
        original: "Go to Next Commenting Range"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }],
      keybinding: {
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 18 /* DownArrow */),
        weight: 100 /* EditorContrib */,
        when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(EditorContextKeys.focus, CommentContextKeys.commentFocused, ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewCurrentProviderId.isEqualTo("comments" /* Comments */))))
      }
    });
  }
  run(accessor, args2) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    controller.nextCommentingRange();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "editor.action.previousCommentingRange" /* PreviousRange */,
      title: {
        value: localize(14005, null),
        original: "Go to Previous Commenting Range"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }],
      keybinding: {
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 16 /* UpArrow */),
        weight: 100 /* EditorContrib */,
        when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(EditorContextKeys.focus, CommentContextKeys.commentFocused, ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewCurrentProviderId.isEqualTo("comments" /* Comments */))))
      }
    });
  }
  async run(accessor, ...args2) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    controller.previousCommentingRange();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleCommenting" /* ToggleCommenting */,
      title: {
        value: localize(14006, null),
        original: "Toggle Editor Commenting"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.WorkspaceHasCommenting
      }]
    });
  }
  run(accessor, ...args2) {
    const commentService = accessor.get(ICommentService);
    const enable = commentService.isCommentingEnabled;
    commentService.enableCommenting(!enable);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.addComment" /* Add */,
      title: {
        value: localize(13996, null),
        original: "Add Comment on Current Selection"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeCursorHasCommentingRange
      }],
      keybinding: {
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KeyC */),
        weight: 100 /* EditorContrib */,
        when: CommentContextKeys.activeCursorHasCommentingRange
      }
    });
  }
  async run(accessor, args2) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    const position2 = args2?.range ? new Range2(args2.range.startLineNumber, args2.range.startLineNumber, args2.range.endLineNumber, args2.range.endColumn) : args2?.fileComment ? void 0 : activeEditor.getSelection();
    await controller.addOrToggleCommentAtLine(position2, void 0);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.focusCommentOnCurrentLine" /* FocusCommentOnCurrentLine */,
      title: {
        value: localize(14001, null),
        original: "Focus Comment on Current Line"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      f1: true,
      precondition: CommentContextKeys.activeCursorHasComment
    });
  }
  async run(accessor, ...args2) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    const position2 = activeEditor.getSelection();
    const notificationService = accessor.get(INotificationService);
    let error = false;
    try {
      const commentAtLine = controller.getCommentsAtLine(position2);
      if (commentAtLine.length === 0) {
        error = true;
      } else {
        await controller.revealCommentThread(commentAtLine[0].commentThread.threadId, void 0, false, 1 /* Widget */);
      }
    } catch (e) {
      error = true;
    }
    if (error) {
      notificationService.error(localize(14000, null));
    }
  }
});

function changeAllCollapseState(commentService, newState) {
  for (const resource of commentService.commentsModel.resourceCommentThreads) {
    for (const thread of resource.commentThreads) {
      thread.thread.collapsibleState = newState(thread.thread);
    }
  }
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.collapseAllComments" /* CollapseAll */,
      title: {
        value: localize(13997, null),
        original: "Collapse All Comments"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.WorkspaceHasCommenting
      }]
    });
  }
  run(accessor, ...args2) {
    const commentService = accessor.get(ICommentService);
    changeAllCollapseState(commentService, () => 0 /* Collapsed */);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.expandAllComments" /* ExpandAll */,
      title: {
        value: localize(13998, null),
        original: "Expand All Comments"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.WorkspaceHasCommenting
      }]
    });
  }
  run(accessor, ...args2) {
    const commentService = accessor.get(ICommentService);
    changeAllCollapseState(commentService, () => 1 /* Expanded */);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.expandUnresolvedComments" /* ExpandUnresolved */,
      title: {
        value: localize(13999, null),
        original: "Expand Unresolved Comments"
      },
      category: {
        value: localize(14007, null),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.WorkspaceHasCommenting
      }]
    });
  }
  run(accessor, ...args2) {
    const commentService = accessor.get(ICommentService);
    changeAllCollapseState(commentService, (commentThread) => {
      return commentThread.state === 0 /* Unresolved */ ? 1 /* Expanded */ : 0 /* Collapsed */;
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "editor.action.submitComment" /* Submit */,
  weight: 100 /* EditorContrib */,
  primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
  when: ctxCommentEditorFocused,
  handler: (accessor, args2) => {
    const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (activeCodeEditor instanceof SimpleCommentEditor) {
      activeCodeEditor.getParentThread().submitComment();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.hideComment" /* Hide */,
  weight: 100 /* EditorContrib */,
  primary: 9 /* Escape */,
  secondary: [1024 /* Shift */ | 9 /* Escape */],
  when: ContextKeyExpr.or(ctxCommentEditorFocused, CommentContextKeys.commentFocused),
  handler: async (accessor, args2) => {
    const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    const keybindingService = accessor.get(IKeybindingService);
    const notificationService = accessor.get(INotificationService);
    const commentService = accessor.get(ICommentService);
    await keybindingService.enableKeybindingHoldMode("workbench.action.hideComment" /* Hide */);
    if (activeCodeEditor instanceof SimpleCommentEditor) {
      activeCodeEditor.getParentThread().collapse();
    } else if (activeCodeEditor) {
      const controller = CommentController.get(activeCodeEditor);
      if (!controller) {
        return;
      }
      let error = false;
      try {
        const activeComment = commentService.lastActiveCommentcontroller?.activeComment;
        if (!activeComment) {
          error = true;
        } else {
          controller.collapseAndFocusRange(activeComment.thread.threadId);
        }
      } catch (e) {
        error = true;
      }
      if (error) {
        notificationService.error(localize(14000, null));
      }
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.hideComment" /* Hide */,
  weight: 100 /* EditorContrib */,
  primary: 2048 /* CtrlCmd */ | 9 /* Escape */,
  win: { primary: 512 /* Alt */ | 1 /* Backspace */ },
  when: ContextKeyExpr.and(EditorContextKeys.focus, CommentContextKeys.commentWidgetVisible),
  handler: async (accessor, args2) => {
    const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    const keybindingService = accessor.get(IKeybindingService);
    await keybindingService.enableKeybindingHoldMode("workbench.action.hideComment" /* Hide */);
    if (activeCodeEditor) {
      const controller = CommentController.get(activeCodeEditor);
      if (controller) {
        await controller.collapseVisibleComments();
      }
    }
  }
});

function getActiveEditor(accessor) {
  let activeTextEditorControl = accessor.get(IEditorService).activeTextEditorControl;
  if (isDiffEditor(activeTextEditorControl)) {
    if (activeTextEditorControl.getOriginalEditor().hasTextFocus()) {
      activeTextEditorControl = activeTextEditorControl.getOriginalEditor();
    } else {
      activeTextEditorControl = activeTextEditorControl.getModifiedEditor();
    }
  }
  if (!isCodeEditor(activeTextEditorControl) || !activeTextEditorControl.hasModel()) {
    return null;
  }
  return activeTextEditorControl;
}
export { changeAllCollapseState, getActiveEditor };
