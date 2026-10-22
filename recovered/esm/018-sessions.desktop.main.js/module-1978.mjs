// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/common/inlineChat.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1844.mjs";
import { MenuId } from "./module-0092.mjs";
import { registerColor, transparent } from "./module-0226.mjs";
import { diffInserted, diffRemoved, editorWidgetBackground, editorWidgetBorder, editorWidgetForeground, widgetShadow } from "./module-0229.mjs";
import { focusBorder } from "./module-0227.mjs";
import { inputBackground, inputPlaceholderForeground } from "./module-0233.mjs";


// src/vs/workbench/contrib/inlineChat/common/inlineChat.ts
Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "editor",
  properties: {
    ["inlineChat.notebookAgent" /* NotebookAgent */]: {
      markdownDescription: localize(16203, null),
      default: false,
      type: "boolean",
      tags: ["experimental"],
      experiment: {
        mode: "startup"
      }
    },
    ["inlineChat.affordance" /* Affordance */]: {
      description: localize(16171, null),
      default: "off",
      type: "string",
      enum: ["off", "editor"],
      enumDescriptions: [
        localize(16173, null),
        localize(16172, null)
      ],
      experiment: {
        mode: "auto"
      },
      tags: ["experimental"],
      agentsWindow: { default: "editor" }
    },
    ["inlineChat.fixDiagnostics" /* FixDiagnostics */]: {
      description: localize(16178, null),
      default: true,
      type: "boolean",
      experiment: {
        mode: "auto"
      },
      tags: ["experimental"]
    },
    ["inlineChat.askInChat" /* AskInChat */]: {
      description: localize(16174, null),
      default: true,
      type: "boolean"
    }
  }
});

var INLINE_CHAT_ID = "editor.contrib.inlineChatController";

var CTX_INLINE_CHAT_POSSIBLE = new RawContextKey("inlineChatPossible", false, localize(16193, null));

var CTX_INLINE_CHAT_HAS_AGENT = new RawContextKey("inlineChatHasEditsAgent", false, localize(16190, null));

var CTX_INLINE_CHAT_HAS_NOTEBOOK_INLINE = new RawContextKey("inlineChatHasNotebookInline", false, localize(16192, null));

var CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT = new RawContextKey("inlineChatHasNotebookAgent", false, localize(16191, null));

var CTX_INLINE_CHAT_VISIBLE = new RawContextKey("inlineChatVisible", false, localize(16202, null));

var CTX_INLINE_CHAT_FOCUSED = new RawContextKey("inlineChatFocused", false, localize(16189, null));

var CTX_INLINE_CHAT_EDITING = new RawContextKey("inlineChatEditing", true, localize(16186, null));

var CTX_INLINE_CHAT_RESPONSE_FOCUSED = new RawContextKey("inlineChatResponseFocused", false, localize(16200, null));

var CTX_INLINE_CHAT_EMPTY = new RawContextKey("inlineChatEmpty", false, localize(16187, null));

var CTX_INLINE_CHAT_OUTER_CURSOR_POSITION = new RawContextKey("inlineChatOuterCursorPosition", "", localize(16198, null));

var CTX_INLINE_CHAT_REQUEST_IN_PROGRESS = new RawContextKey("inlineChatRequestInProgress", false, localize(16199, null));

var CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT = new RawContextKey("inlineChatFileBelongsToChat", false, localize(16188, null));

var CTX_INLINE_CHAT_TERMINATED = new RawContextKey("inlineChatTerminated", false, localize(16201, null));

var CTX_INLINE_CHAT_AFFORDANCE_VISIBLE = new RawContextKey("inlineChatAffordanceVisible", false, localize(16183, null));

var CTX_INLINE_CHAT_V2_ENABLED = ContextKeyExpr.or(
  CTX_INLINE_CHAT_HAS_AGENT,
  ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT)
);

var CTX_FIX_DIAGNOSTICS_ENABLED = ContextKeyExpr.equals("config.inlineChat.fixDiagnostics", true);

var CTX_ASK_IN_CHAT_ENABLED = ContextKeyExpr.equals("config.inlineChat.askInChat", true);

var ACTION_START = "inlineChat.start";

var ACTION_ASK_IN_CHAT = "inlineChat.askInChat";

var MENU_INLINE_CHAT_WIDGET_SECONDARY = MenuId.for("inlineChatWidget.secondary");

var MENU_INLINE_CHAT_SIDE = MenuId.for("inlineChatWidget.side");

var inlineChatForeground = registerColor("inlineChat.foreground", editorWidgetForeground, localize(16181, null));

var inlineChatBackground = registerColor("inlineChat.background", editorWidgetBackground, localize(16179, null));

var inlineChatBorder = registerColor("inlineChat.border", editorWidgetBorder, localize(16180, null));

var inlineChatShadow = registerColor("inlineChat.shadow", widgetShadow, localize(16182, null));

var inlineChatInputBorder = registerColor("inlineChatInput.border", editorWidgetBorder, localize(16195, null));

var inlineChatInputFocusBorder = registerColor("inlineChatInput.focusBorder", focusBorder, localize(16196, null));

var inlineChatInputPlaceholderForeground = registerColor("inlineChatInput.placeholderForeground", inputPlaceholderForeground, localize(16197, null));

var inlineChatInputBackground = registerColor("inlineChatInput.background", inputBackground, localize(16194, null));

var inlineChatDiffInserted = registerColor("inlineChatDiff.inserted", transparent(diffInserted, 0.5), localize(16184, null));

var overviewRulerInlineChatDiffInserted = registerColor("editorOverviewRuler.inlineChatInserted", { dark: transparent(diffInserted, 0.6), light: transparent(diffInserted, 0.8), hcDark: transparent(diffInserted, 0.6), hcLight: transparent(diffInserted, 0.8) }, localize(16176, null));

var minimapInlineChatDiffInserted = registerColor("editorMinimap.inlineChatInserted", { dark: transparent(diffInserted, 0.6), light: transparent(diffInserted, 0.8), hcDark: transparent(diffInserted, 0.6), hcLight: transparent(diffInserted, 0.8) }, localize(16175, null));

var inlineChatDiffRemoved = registerColor("inlineChatDiff.removed", transparent(diffRemoved, 0.5), localize(16185, null));

var overviewRulerInlineChatDiffRemoved = registerColor("editorOverviewRuler.inlineChatRemoved", { dark: transparent(diffRemoved, 0.6), light: transparent(diffRemoved, 0.8), hcDark: transparent(diffRemoved, 0.6), hcLight: transparent(diffRemoved, 0.8) }, localize(16177, null));
export { INLINE_CHAT_ID, CTX_INLINE_CHAT_POSSIBLE, CTX_INLINE_CHAT_HAS_AGENT, CTX_INLINE_CHAT_HAS_NOTEBOOK_INLINE, CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT, CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_EDITING, CTX_INLINE_CHAT_RESPONSE_FOCUSED, CTX_INLINE_CHAT_EMPTY, CTX_INLINE_CHAT_OUTER_CURSOR_POSITION, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT, CTX_INLINE_CHAT_TERMINATED, CTX_INLINE_CHAT_AFFORDANCE_VISIBLE, CTX_INLINE_CHAT_V2_ENABLED, CTX_FIX_DIAGNOSTICS_ENABLED, CTX_ASK_IN_CHAT_ENABLED, ACTION_START, ACTION_ASK_IN_CHAT, MENU_INLINE_CHAT_WIDGET_SECONDARY, MENU_INLINE_CHAT_SIDE, inlineChatForeground, inlineChatBackground, inlineChatBorder, inlineChatShadow, inlineChatInputBorder, inlineChatInputFocusBorder, inlineChatInputPlaceholderForeground, inlineChatInputBackground, inlineChatDiffInserted, overviewRulerInlineChatDiffInserted, minimapInlineChatDiffInserted, inlineChatDiffRemoved, overviewRulerInlineChatDiffRemoved };
