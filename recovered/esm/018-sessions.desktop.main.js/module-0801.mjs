// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.ts
import { registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { InlineCompletionsController } from "./module-0796.mjs";
import { wrapInHotClass1 } from "./module-0694.mjs";
import { AcceptInlineCompletion, AcceptInlineCompletionAlternativeAction, AcceptNextLineOfInlineCompletion, AcceptNextWordOfInlineCompletion, DevExtractReproSample, HideInlineCompletion, JumpToNextInlineEdit, ShowNextInlineSuggestionAction, ShowPreviousInlineSuggestionAction, ToggleAlwaysShowInlineSuggestionToolbar, ToggleInlineCompletionShowCollapsed, TriggerInlineSuggestionAction } from "./module-0797.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { CancelSnoozeInlineCompletion, SnoozeInlineCompletion } from "./module-0738.mjs";
import { HoverParticipantRegistry } from "./module-0575.mjs";
import { InlineCompletionsHoverParticipant } from "./module-0798.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { InlineCompletionsAccessibleView } from "./module-0800.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.ts
registerEditorContribution(InlineCompletionsController.ID, wrapInHotClass1(InlineCompletionsController.hot), 3 /* Eventually */);

registerEditorAction(TriggerInlineSuggestionAction);

registerEditorAction(ShowNextInlineSuggestionAction);

registerEditorAction(ShowPreviousInlineSuggestionAction);

registerEditorAction(AcceptNextWordOfInlineCompletion);

registerEditorAction(AcceptNextLineOfInlineCompletion);

registerEditorAction(AcceptInlineCompletion);

registerEditorAction(AcceptInlineCompletionAlternativeAction);

registerEditorAction(ToggleInlineCompletionShowCollapsed);

registerEditorAction(HideInlineCompletion);

registerEditorAction(JumpToNextInlineEdit);

registerAction2(ToggleAlwaysShowInlineSuggestionToolbar);

registerEditorAction(DevExtractReproSample);

registerAction2(SnoozeInlineCompletion);

registerAction2(CancelSnoozeInlineCompletion);

HoverParticipantRegistry.register(InlineCompletionsHoverParticipant);

AccessibleViewRegistry.register(new InlineCompletionsAccessibleView());
export {};
