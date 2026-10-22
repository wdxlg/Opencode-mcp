// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/hoverContribution.ts
import { registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { GlyphHoverController } from "./module-0809.mjs";
import { DecreaseHoverVerbosityLevel, GoToBottomHoverAction, GoToTopHoverAction, HideContentHoverAction, IncreaseHoverVerbosityLevel, PageDownHoverAction, PageUpHoverAction, ScrollDownHoverAction, ScrollLeftHoverAction, ScrollRightHoverAction, ScrollUpHoverAction, ShowDefinitionPreviewHoverAction, ShowOrFocusHoverAction } from "./module-0805.mjs";
import { HoverParticipantRegistry } from "./module-0575.mjs";
import { MarkdownHoverParticipant } from "./module-0608.mjs";
import { MarkerHoverParticipant } from "./module-0806.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { HIDE_LONG_LINE_WARNING_HOVER_ACTION_ID } from "./module-0579.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorHoverBorder } from "./module-0229.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { ExtHoverAccessibleView, HoverAccessibilityHelp, HoverAccessibleView } from "./module-0810.mjs";


// src/vs/editor/contrib/hover/browser/hoverContribution.ts
registerEditorContribution(ContentHoverController.ID, ContentHoverController, 2 /* BeforeFirstInteraction */);

registerEditorContribution(GlyphHoverController.ID, GlyphHoverController, 2 /* BeforeFirstInteraction */);

registerEditorAction(ShowOrFocusHoverAction);

registerEditorAction(ShowDefinitionPreviewHoverAction);

registerEditorAction(HideContentHoverAction);

registerEditorAction(ScrollUpHoverAction);

registerEditorAction(ScrollDownHoverAction);

registerEditorAction(ScrollLeftHoverAction);

registerEditorAction(ScrollRightHoverAction);

registerEditorAction(PageUpHoverAction);

registerEditorAction(PageDownHoverAction);

registerEditorAction(GoToTopHoverAction);

registerEditorAction(GoToBottomHoverAction);

registerEditorAction(IncreaseHoverVerbosityLevel);

registerEditorAction(DecreaseHoverVerbosityLevel);

HoverParticipantRegistry.register(MarkdownHoverParticipant);

HoverParticipantRegistry.register(MarkerHoverParticipant);

CommandsRegistry.registerCommand(HIDE_LONG_LINE_WARNING_HOVER_ACTION_ID, (accessor) => {
  accessor.get(IConfigurationService).updateValue("editor.hover.showLongLineWarning", false);
});

registerThemingParticipant((theme, collector) => {
  const hoverBorder = theme.getColor(editorHoverBorder);
  if (hoverBorder) {
    collector.addRule(`.monaco-editor .monaco-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
    collector.addRule(`.monaco-editor .monaco-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
    collector.addRule(`.monaco-editor .monaco-hover hr { border-bottom: 0px solid ${hoverBorder.transparent(0.5)}; }`);
  }
});

AccessibleViewRegistry.register(new HoverAccessibleView());

AccessibleViewRegistry.register(new HoverAccessibilityHelp());

AccessibleViewRegistry.register(new ExtHoverAccessibleView());
export {};
