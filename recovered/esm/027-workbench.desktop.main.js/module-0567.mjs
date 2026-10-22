// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/codeAction/browser/codeActionCommands.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { SUPPORTED_CODE_ACTIONS } from "./module-0564.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { EditorAction, EditorAction2, EditorCommand } from "./module-0097.mjs";
import { autoFixCommandId, codeActionCommandId, fixAllCommandId, organizeImportsCommandId, quickFixCommandId, refactorCommandId, sourceActionCommandId } from "./module-0559.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Codicon } from "./module-0085.mjs";
import { MenuId } from "./module-0092.mjs";
import { CodeActionCommandArgs, CodeActionKind } from "./module-0558.mjs";
import { HierarchicalKind } from "./module-0535.mjs";


// src/vs/editor/contrib/codeAction/browser/codeActionCommands.ts
function contextKeyForSupportedActions(kind) {
  return ContextKeyExpr.regex(
    SUPPORTED_CODE_ACTIONS.keys()[0],
    new RegExp("(\\s|^)" + escapeRegExpCharacters(kind.value) + "\\b")
  );
}

var argsSchema = {
  type: "object",
  defaultSnippets: [{ body: { kind: "" } }],
  properties: {
    "kind": {
      type: "string",
      description: localize(1008, null)
    },
    "apply": {
      type: "string",
      description: localize(1004, null),
      default: "ifSingle" /* IfSingle */,
      enum: ["first" /* First */, "ifSingle" /* IfSingle */, "never" /* Never */],
      enumDescriptions: [
        localize(1005, null),
        localize(1006, null),
        localize(1007, null)
      ]
    },
    "preferred": {
      type: "boolean",
      default: false,
      description: localize(1009, null)
    }
  }
};

function triggerCodeActionsForEditorSelection(editor, notAvailableMessage, filter2, autoApply, triggerAction = "other (default)" /* Default */) {
  if (editor.hasModel()) {
    const controller = CodeActionController.get(editor);
    controller?.manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter2, autoApply);
  }
}

var QuickFixAction = class extends EditorAction2 {
  constructor() {
    super({
      id: quickFixCommandId,
      title: localize2(1030, "Quick Fix..."),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
      icon: Codicon.lightBulb,
      f1: true,
      keybinding: {
        when: EditorContextKeys.textInputFocus,
        primary: 2048 /* CtrlCmd */ | 89 /* Period */,
        weight: 100 /* EditorContrib */
      },
      menu: {
        id: MenuId.InlineChatEditorAffordance,
        group: "1_quickfix",
        order: 0,
        when: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider)
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return triggerCodeActionsForEditorSelection(editor, localize(1017, null), void 0, void 0, "quick fix action" /* QuickFix */);
  }
};

var CodeActionCommand = class extends EditorCommand {
  constructor() {
    super({
      id: codeActionCommandId,
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
      metadata: {
        description: "Trigger a code action",
        args: [{ name: "args", schema: argsSchema }]
      }
    });
  }
  runEditorCommand(_accessor, editor, userArgs) {
    const args2 = CodeActionCommandArgs.fromUser(userArgs, {
      kind: HierarchicalKind.Empty,
      apply: "ifSingle" /* IfSingle */
    });
    return triggerCodeActionsForEditorSelection(
      editor,
      typeof userArgs?.kind === "string" ? args2.preferred ? localize(1015, null, userArgs.kind) : localize(1013, null, userArgs.kind) : args2.preferred ? localize(1014, null) : localize(1012, null),
      {
        include: args2.kind,
        includeSourceActions: true,
        onlyIncludePreferredActions: args2.preferred
      },
      args2.apply
    );
  }
};

var RefactorAction = class extends EditorAction {
  constructor() {
    super({
      id: refactorCommandId,
      label: localize2(1031, "Refactor..."),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KeyR */,
        mac: {
          primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 48 /* KeyR */
        },
        weight: 100 /* EditorContrib */
      },
      contextMenuOpts: {
        group: "1_modification",
        order: 2,
        when: ContextKeyExpr.and(
          EditorContextKeys.writable,
          contextKeyForSupportedActions(CodeActionKind.Refactor)
        )
      },
      metadata: {
        description: "Refactor...",
        args: [{ name: "args", schema: argsSchema }]
      }
    });
  }
  run(_accessor, editor, userArgs) {
    const args2 = CodeActionCommandArgs.fromUser(userArgs, {
      kind: CodeActionKind.Refactor,
      apply: "never" /* Never */
    });
    return triggerCodeActionsForEditorSelection(
      editor,
      typeof userArgs?.kind === "string" ? args2.preferred ? localize(1021, null, userArgs.kind) : localize(1019, null, userArgs.kind) : args2.preferred ? localize(1020, null) : localize(1018, null),
      {
        include: CodeActionKind.Refactor.contains(args2.kind) ? args2.kind : HierarchicalKind.None,
        onlyIncludePreferredActions: args2.preferred
      },
      args2.apply,
      "refactor" /* Refactor */
    );
  }
};

var SourceAction = class extends EditorAction {
  constructor() {
    super({
      id: sourceActionCommandId,
      label: localize2(1032, "Source Action..."),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
      contextMenuOpts: {
        group: "1_modification",
        order: 2.1,
        when: ContextKeyExpr.and(
          EditorContextKeys.writable,
          contextKeyForSupportedActions(CodeActionKind.Source)
        )
      },
      metadata: {
        description: "Source Action...",
        args: [{ name: "args", schema: argsSchema }]
      }
    });
  }
  run(_accessor, editor, userArgs) {
    const args2 = CodeActionCommandArgs.fromUser(userArgs, {
      kind: CodeActionKind.Source,
      apply: "never" /* Never */
    });
    return triggerCodeActionsForEditorSelection(
      editor,
      typeof userArgs?.kind === "string" ? args2.preferred ? localize(1025, null, userArgs.kind) : localize(1023, null, userArgs.kind) : args2.preferred ? localize(1024, null) : localize(1022, null),
      {
        include: CodeActionKind.Source.contains(args2.kind) ? args2.kind : HierarchicalKind.None,
        includeSourceActions: true,
        onlyIncludePreferredActions: args2.preferred
      },
      args2.apply,
      "source action" /* SourceAction */
    );
  }
};

var OrganizeImportsAction = class extends EditorAction {
  constructor() {
    super({
      id: organizeImportsCommandId,
      label: localize2(1029, "Organize Imports"),
      precondition: ContextKeyExpr.and(
        EditorContextKeys.writable,
        contextKeyForSupportedActions(CodeActionKind.SourceOrganizeImports)
      ),
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 45 /* KeyO */,
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1028, "Organize imports in the current file. Also called 'Optimize Imports' by some tools")
      }
    });
  }
  run(_accessor, editor) {
    return triggerCodeActionsForEditorSelection(
      editor,
      localize(1016, null),
      { include: CodeActionKind.SourceOrganizeImports, includeSourceActions: true },
      "ifSingle" /* IfSingle */,
      "organize imports" /* OrganizeImports */
    );
  }
};

var FixAllAction = class extends EditorAction {
  constructor() {
    super({
      id: fixAllCommandId,
      label: localize2(1026, "Fix All"),
      precondition: ContextKeyExpr.and(
        EditorContextKeys.writable,
        contextKeyForSupportedActions(CodeActionKind.SourceFixAll)
      )
    });
  }
  run(_accessor, editor) {
    return triggerCodeActionsForEditorSelection(
      editor,
      localize(1027, null),
      { include: CodeActionKind.SourceFixAll, includeSourceActions: true },
      "ifSingle" /* IfSingle */,
      "fix all" /* FixAll */
    );
  }
};

var AutoFixAction = class extends EditorAction {
  constructor() {
    super({
      id: autoFixCommandId,
      label: localize2(1010, "Auto Fix..."),
      precondition: ContextKeyExpr.and(
        EditorContextKeys.writable,
        contextKeyForSupportedActions(CodeActionKind.QuickFix)
      ),
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 512 /* Alt */ | 1024 /* Shift */ | 89 /* Period */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 89 /* Period */
        },
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(_accessor, editor) {
    return triggerCodeActionsForEditorSelection(
      editor,
      localize(1011, null),
      {
        include: CodeActionKind.QuickFix,
        onlyIncludePreferredActions: true
      },
      "ifSingle" /* IfSingle */,
      "auto fix" /* AutoFix */
    );
  }
};
export { contextKeyForSupportedActions, triggerCodeActionsForEditorSelection, argsSchema, QuickFixAction, CodeActionCommand, RefactorAction, SourceAction, OrganizeImportsAction, FixAllAction, AutoFixAction };
