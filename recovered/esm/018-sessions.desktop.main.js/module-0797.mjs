// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/controller/commands.ts
import { EditorAction } from "./module-0097.mjs";
import { hideInlineCompletionId, inlineSuggestCommitAlternativeActionId, inlineSuggestCommitId, jumpToNextInlineEditId, showNextInlineSuggestionActionId, showPreviousInlineSuggestionActionId, toggleShowCollapsedId } from "./module-0580.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { InlineCompletionContextKeys } from "./module-0697.mjs";
import { InlineCompletionsController } from "./module-0796.mjs";
import { vBoolean, vObj, vOptionalProp, vString, vUnchecked, vUndefined, vUnion, vWithJsonSchemaRef } from "./module-0695.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { asyncTransaction, transaction } from "./module-0045.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { Action2, MenuId } from "./module-0092.mjs";
import { Context } from "./module-0696.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { splitLines } from "./module-0030.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/controller/commands.ts
var ShowNextInlineSuggestionAction = class _ShowNextInlineSuggestionAction extends EditorAction {
  static {
    this.ID = showNextInlineSuggestionActionId;
  }
  constructor() {
    super({
      id: _ShowNextInlineSuggestionAction.ID,
      label: localize2(1360, "Show Next Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100,
        primary: 512 /* Alt */ | 94 /* BracketRight */
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    controller?.model.get()?.next();
  }
};

var ShowPreviousInlineSuggestionAction = class _ShowPreviousInlineSuggestionAction extends EditorAction {
  static {
    this.ID = showPreviousInlineSuggestionActionId;
  }
  constructor() {
    super({
      id: _ShowPreviousInlineSuggestionAction.ID,
      label: localize2(1361, "Show Previous Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100,
        primary: 512 /* Alt */ | 92 /* BracketLeft */
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    controller?.model.get()?.previous();
  }
};

var providerIdSchemaUri = "vscode://schemas/inlineCompletionProviderIdArgs";

function inlineCompletionProviderGetMatcher(provider) {
  const result = [];
  if (provider.providerId) {
    result.push(provider.providerId.toStringWithoutVersion());
    result.push(provider.providerId.extensionId + ":*");
  }
  return result;
}

var argsValidator = vUnion(vObj({
  showNoResultNotification: vOptionalProp(vBoolean()),
  providerId: vOptionalProp(vWithJsonSchemaRef(providerIdSchemaUri, vString())),
  explicit: vOptionalProp(vBoolean()),
  changeHintData: vOptionalProp(vUnchecked())
}), vUndefined());

var TriggerInlineSuggestionAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.inlineSuggest.trigger",
      label: localize2(1363, "Trigger Inline Suggestion"),
      precondition: EditorContextKeys.writable,
      metadata: {
        description: localize(1365, null),
        args: [{
          name: "args",
          description: localize(1364, null),
          isOptional: true,
          schema: argsValidator.getJSONSchema()
        }]
      }
    });
  }
  async run(accessor, editor, args2) {
    const notificationService = accessor.get(INotificationService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const controller = InlineCompletionsController.get(editor);
    const validatedArgs = argsValidator.validateOrThrow(args2);
    const provider = validatedArgs?.providerId ? languageFeaturesService.inlineCompletionsProvider.all(editor.getModel()).find((p) => inlineCompletionProviderGetMatcher(p).some((m) => m === validatedArgs.providerId)) : void 0;
    await asyncTransaction(async (tx) => {
      await controller?.model.get()?.trigger(tx, {
        provider,
        explicit: validatedArgs?.explicit ?? true,
        changeHint: validatedArgs?.changeHintData ? { data: validatedArgs.changeHintData } : void 0
      });
      controller?.playAccessibilitySignal(tx);
    });
    if (validatedArgs?.showNoResultNotification) {
      if (!controller?.model.get()?.state.get()) {
        notificationService.notify({
          severity: Severity2.Info,
          message: localize(1367, null)
        });
      }
    }
  }
};

var AcceptNextWordOfInlineCompletion = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.inlineSuggest.acceptNextWord",
      label: localize2(1355, "Accept Next Word Of Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100 /* EditorContrib */ + 1,
        primary: 2048 /* CtrlCmd */ | 17 /* RightArrow */,
        kbExpr: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.cursorBeforeGhostText, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate())
      },
      menuOpts: [{
        menuId: MenuId.InlineSuggestionToolbar,
        title: localize(1351, null),
        group: "primary",
        order: 2
      }]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    await controller?.model.get()?.acceptNextWord();
  }
};

var AcceptNextLineOfInlineCompletion = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.inlineSuggest.acceptNextLine",
      label: localize2(1354, "Accept Next Line Of Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100 /* EditorContrib */ + 1
      },
      menuOpts: [{
        menuId: MenuId.InlineSuggestionToolbar,
        title: localize(1350, null),
        group: "secondary",
        order: 2
      }]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    await controller?.model.get()?.acceptNextLine();
  }
};

var AcceptInlineCompletion = class extends EditorAction {
  constructor() {
    super({
      id: inlineSuggestCommitId,
      label: localize2(1352, "Accept Inline Suggestion"),
      precondition: ContextKeyExpr.or(InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.inlineEditVisible),
      menuOpts: [{
        menuId: MenuId.InlineSuggestionToolbar,
        title: localize(1349, null),
        group: "primary",
        order: 2
      }, {
        menuId: MenuId.InlineEditsActions,
        title: localize(1349, null),
        group: "primary",
        order: 2
      }],
      kbOpts: [
        {
          primary: 2 /* Tab */,
          weight: 200,
          kbExpr: ContextKeyExpr.or(
            ContextKeyExpr.and(
              InlineCompletionContextKeys.inlineSuggestionVisible,
              EditorContextKeys.tabMovesFocus.toNegated(),
              Context.Visible.toNegated(),
              EditorContextKeys.hoverFocused.toNegated(),
              InlineCompletionContextKeys.hasSelection.toNegated(),
              InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize
            ),
            ContextKeyExpr.and(
              InlineCompletionContextKeys.inlineEditVisible,
              EditorContextKeys.tabMovesFocus.toNegated(),
              Context.Visible.toNegated(),
              EditorContextKeys.hoverFocused.toNegated(),
              InlineCompletionContextKeys.tabShouldAcceptInlineEdit
            )
          )
        }
      ]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.getInFocusedEditorOrParent(accessor);
    if (controller) {
      controller.model.get()?.accept(controller.editor);
      controller.editor.focus();
    }
  }
};

KeybindingsRegistry.registerKeybindingRule({
  id: inlineSuggestCommitId,
  weight: 202,
  // greater than jump
  primary: 2 /* Tab */,
  when: ContextKeyExpr.and(InlineCompletionContextKeys.inInlineEditsPreviewEditor)
});

var AcceptInlineCompletionAlternativeAction = class extends EditorAction {
  constructor() {
    super({
      id: inlineSuggestCommitAlternativeActionId,
      label: localize2(1353, "Accept Inline Suggestion Alternative Action"),
      precondition: ContextKeyExpr.and(InlineCompletionContextKeys.inlineSuggestionAlternativeActionVisible, InlineCompletionContextKeys.inlineEditVisible),
      menuOpts: [],
      kbOpts: [
        {
          primary: 1024 /* Shift */ | 2 /* Tab */,
          weight: 203
        }
      ]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.getInFocusedEditorOrParent(accessor);
    if (controller) {
      controller.model.get()?.accept(controller.editor, true);
      controller.editor.focus();
    }
  }
};

KeybindingsRegistry.registerKeybindingRule({
  id: inlineSuggestCommitAlternativeActionId,
  weight: 203,
  primary: 1024 /* Shift */ | 2 /* Tab */,
  when: ContextKeyExpr.and(InlineCompletionContextKeys.inInlineEditsPreviewEditor)
});

var JumpToNextInlineEdit = class extends EditorAction {
  constructor() {
    super({
      id: jumpToNextInlineEditId,
      label: localize2(1359, "Jump to next inline edit"),
      precondition: InlineCompletionContextKeys.inlineEditVisible,
      menuOpts: [{
        menuId: MenuId.InlineEditsActions,
        title: localize(1366, null),
        group: "primary",
        order: 1,
        when: InlineCompletionContextKeys.cursorAtInlineEdit.toNegated()
      }],
      kbOpts: {
        primary: 2 /* Tab */,
        weight: 201,
        kbExpr: ContextKeyExpr.and(
          InlineCompletionContextKeys.inlineEditVisible,
          EditorContextKeys.tabMovesFocus.toNegated(),
          Context.Visible.toNegated(),
          EditorContextKeys.hoverFocused.toNegated(),
          InlineCompletionContextKeys.tabShouldJumpToInlineEdit
        )
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    if (controller) {
      controller.jump();
    }
  }
};

var HideInlineCompletion = class _HideInlineCompletion extends EditorAction {
  static {
    this.ID = hideInlineCompletionId;
  }
  constructor() {
    super({
      id: _HideInlineCompletion.ID,
      label: localize2(1358, "Hide Inline Suggestion"),
      precondition: ContextKeyExpr.or(InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.inlineEditVisible),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        weight: 100 /* EditorContrib */ + 90,
        // same as hiding the suggest widget
        primary: 9 /* Escape */
      },
      menuOpts: [{
        menuId: MenuId.InlineEditsActions,
        title: localize(1368, null),
        group: "primary",
        order: 3
      }]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.getInFocusedEditorOrParent(accessor);
    transaction((tx) => {
      controller?.model.get()?.stop("explicitCancel", tx);
    });
    controller?.editor.focus();
  }
};

var ToggleInlineCompletionShowCollapsed = class _ToggleInlineCompletionShowCollapsed extends EditorAction {
  static {
    this.ID = toggleShowCollapsedId;
  }
  constructor() {
    super({
      id: _ToggleInlineCompletionShowCollapsed.ID,
      label: localize2(1362, "Toggle Inline Suggestions Show Collapsed"),
      precondition: ContextKeyExpr.true()
    });
  }
  async run(accessor, editor) {
    const configurationService = accessor.get(IConfigurationService);
    const showCollapsed = configurationService.getValue("editor.inlineSuggest.edits.showCollapsed");
    configurationService.updateValue("editor.inlineSuggest.edits.showCollapsed", !showCollapsed);
  }
};

KeybindingsRegistry.registerKeybindingRule({
  id: HideInlineCompletion.ID,
  weight: -1,
  // very weak
  primary: 9 /* Escape */,
  secondary: [1024 /* Shift */ | 9 /* Escape */],
  when: ContextKeyExpr.and(InlineCompletionContextKeys.inInlineEditsPreviewEditor)
});

var ToggleAlwaysShowInlineSuggestionToolbar = class _ToggleAlwaysShowInlineSuggestionToolbar extends Action2 {
  static {
    this.ID = "editor.action.inlineSuggest.toggleAlwaysShowToolbar";
  }
  constructor() {
    super({
      id: _ToggleAlwaysShowInlineSuggestionToolbar.ID,
      title: localize(1356, null),
      f1: false,
      precondition: void 0,
      menu: [{
        id: MenuId.InlineSuggestionToolbar,
        group: "secondary",
        order: 10
      }],
      toggled: ContextKeyExpr.equals("config.editor.inlineSuggest.showToolbar", "always")
    });
  }
  async run(accessor) {
    const configService = accessor.get(IConfigurationService);
    const currentValue = configService.getValue("editor.inlineSuggest.showToolbar");
    const newValue = currentValue === "always" ? "onHover" : "always";
    configService.updateValue("editor.inlineSuggest.showToolbar", newValue);
  }
};

var DevExtractReproSample = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.inlineSuggest.dev.extractRepro",
      label: localize(1357, null),
      alias: "Developer: Inline Suggest Extract Repro",
      precondition: ContextKeyExpr.or(InlineCompletionContextKeys.inlineEditVisible, InlineCompletionContextKeys.inlineSuggestionVisible)
    });
  }
  async run(accessor, editor) {
    const clipboardService = accessor.get(IClipboardService);
    const controller = InlineCompletionsController.get(editor);
    const m = controller?.model.get();
    if (!m) {
      return;
    }
    const repro = m.extractReproSample();
    const inlineCompletionLines = splitLines(JSON.stringify({ inlineCompletion: repro.inlineCompletion }, null, 4));
    const json = inlineCompletionLines.map((l) => "// " + l).join("\n");
    const reproStr = `${repro.documentValue}

// <json>
${json}
// </json>
`;
    await clipboardService.writeText(reproStr);
    return { reproCase: reproStr };
  }
};
export { inlineCompletionProviderGetMatcher, ShowNextInlineSuggestionAction, ShowPreviousInlineSuggestionAction, providerIdSchemaUri, argsValidator, TriggerInlineSuggestionAction, AcceptNextWordOfInlineCompletion, AcceptNextLineOfInlineCompletion, AcceptInlineCompletion, AcceptInlineCompletionAlternativeAction, JumpToNextInlineEdit, HideInlineCompletion, ToggleInlineCompletionShowCollapsed, ToggleAlwaysShowInlineSuggestionToolbar, DevExtractReproSample };
