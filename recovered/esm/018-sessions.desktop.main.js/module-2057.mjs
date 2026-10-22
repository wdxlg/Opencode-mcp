// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/widget/chatColors.ts
import { darken, lighten, registerColor, transparent } from "./module-0226.mjs";
import { COMMAND_CENTER_BACKGROUND } from "./module-0868.mjs";
import { localize } from "./module-0001.mjs";
import { Color, RGBA } from "./module-0197.mjs";
import { contrastBorder, focusBorder, foreground } from "./module-0227.mjs";
import { editorBackground, editorFindMatchHighlight, editorSelectionBackground, editorWidgetBackground } from "./module-0229.mjs";
import { badgeBackground, badgeForeground } from "./module-0228.mjs";
import { buttonBackground } from "./module-0233.mjs";


// src/vs/workbench/contrib/chat/common/widget/chatColors.ts
var agentStatusIndicatorBackground = registerColor(
  "agentStatusIndicator.background",
  COMMAND_CENTER_BACKGROUND,
  localize(13483, null)
);

var chatRequestBorder = registerColor(
  "chat.requestBorder",
  { dark: new Color(new RGBA(255, 255, 255, 0.1)), light: new Color(new RGBA(0, 0, 0, 0.1)), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(13496, null)
);

var chatRequestBackground = registerColor(
  "chat.requestBackground",
  { dark: transparent(editorBackground, 0.62), light: transparent(editorBackground, 0.62), hcDark: editorWidgetBackground, hcLight: null },
  localize(13495, null)
);

var chatSlashCommandBackground = registerColor(
  "chat.slashCommandBackground",
  { dark: "#26477866", light: "#adceff7a", hcDark: Color.white, hcLight: badgeBackground },
  localize(13500, null)
);

var chatSlashCommandForeground = registerColor(
  "chat.slashCommandForeground",
  { dark: "#85b6ff", light: "#26569e", hcDark: Color.black, hcLight: badgeForeground },
  localize(13501, null)
);

var chatAvatarBackground = registerColor(
  "chat.avatarBackground",
  { dark: "#1f1f1f", light: "#f2f2f2", hcDark: Color.black, hcLight: Color.white },
  localize(13484, null)
);

var chatAvatarForeground = registerColor(
  "chat.avatarForeground",
  foreground,
  localize(13485, null)
);

var chatEditedFileForeground = registerColor(
  "chat.editedFileForeground",
  {
    light: "#895503",
    dark: "#E2C08D",
    hcDark: "#E2C08D",
    hcLight: "#895503"
  },
  localize(13487, null)
);

var chatRequestCodeBorder = registerColor("chat.requestCodeBorder", { dark: "#004972B8", light: "#0e639c40", hcDark: null, hcLight: null }, localize(13499, null), true);

var chatRequestBubbleBackground = registerColor("chat.requestBubbleBackground", { light: transparent(editorSelectionBackground, 0.3), dark: transparent(editorSelectionBackground, 0.3), hcDark: null, hcLight: null }, localize(13497, null), true);

var chatRequestBubbleHoverBackground = registerColor("chat.requestBubbleHoverBackground", { dark: transparent(editorSelectionBackground, 0.6), light: transparent(editorSelectionBackground, 0.6), hcDark: null, hcLight: null }, localize(13498, null), true);

var chatCheckpointSeparator = registerColor(
  "chat.checkpointSeparator",
  { dark: "#585858", light: "#a9a9a9", hcDark: "#a9a9a9", hcLight: "#a5a5a5" },
  localize(13506, null)
);

var chatLinesAddedForeground = registerColor(
  "chat.linesAddedForeground",
  { dark: "#54B054", light: "#107C10", hcDark: "#54B054", hcLight: "#107C10" },
  localize(13493, null),
  true
);

var chatLinesRemovedForeground = registerColor(
  "chat.linesRemovedForeground",
  { dark: "#FC6A6A", light: "#BC2F32", hcDark: "#F48771", hcLight: "#B5200D" },
  localize(13494, null),
  true
);

var chatFindMatchHighlightBackground = registerColor(
  "chat.findMatchHighlightBackground",
  { dark: editorFindMatchHighlight, light: editorFindMatchHighlight, hcDark: "#EA5C0055", hcLight: "#EA5C0055" },
  localize(13489, null),
  true
);

var chatFindMatchBackground = registerColor(
  "chat.findMatchBackground",
  { dark: transparent(chatFindMatchHighlightBackground, 2), light: transparent(chatFindMatchHighlightBackground, 2), hcDark: "#EA5C00AA", hcLight: "#EA5C00AA" },
  localize(13488, null),
  true
);

var chatThinkingShimmer = registerColor(
  "chat.thinkingShimmer",
  { dark: "#ffffff", light: "#000000", hcDark: "#ffffff", hcLight: "#000000" },
  localize(13502, null),
  true
);

var chatInputWorkingBorderColor1 = registerColor(
  "chat.inputWorkingBorderColor1",
  { dark: buttonBackground, light: buttonBackground, hcDark: "#FFFFFF", hcLight: "#000000" },
  localize(13490, null),
  true
);

var chatInputWorkingBorderColor2 = registerColor(
  "chat.inputWorkingBorderColor2",
  { dark: darken(buttonBackground, 0.5), light: darken(buttonBackground, 0.3), hcDark: "#A0A0A0", hcLight: "#555555" },
  localize(13491, null),
  true
);

var chatInputWorkingBorderColor3 = registerColor(
  "chat.inputWorkingBorderColor3",
  { dark: lighten(buttonBackground, 0.5), light: lighten(buttonBackground, 0.3), hcDark: "#000000", hcLight: "#000000" },
  localize(13492, null),
  true
);

var chatVoiceGlowBaseColor = registerColor(
  "chat.voiceGlowBaseColor",
  focusBorder,
  localize(13503, null),
  true
);

var chatVoiceListeningGlow = registerColor(
  "chat.voiceListeningGlow",
  { dark: null, light: null, hcDark: null, hcLight: null },
  localize(13504, null, "chat.voiceGlowBaseColor"),
  true
);

var chatVoiceSpeakingGlow = registerColor(
  "chat.voiceSpeakingGlow",
  { dark: null, light: null, hcDark: null, hcLight: null },
  localize(13505, null, "chat.voiceGlowBaseColor"),
  true
);

var chatDictationActiveMicGlow = registerColor(
  "chat.dictationActiveMicGlow",
  chatVoiceGlowBaseColor,
  localize(13486, null)
);
export { agentStatusIndicatorBackground, chatRequestBorder, chatRequestBackground, chatSlashCommandBackground, chatSlashCommandForeground, chatAvatarBackground, chatAvatarForeground, chatEditedFileForeground, chatRequestCodeBorder, chatRequestBubbleBackground, chatRequestBubbleHoverBackground, chatCheckpointSeparator, chatLinesAddedForeground, chatLinesRemovedForeground, chatFindMatchHighlightBackground, chatFindMatchBackground, chatThinkingShimmer, chatInputWorkingBorderColor1, chatInputWorkingBorderColor2, chatInputWorkingBorderColor3, chatVoiceGlowBaseColor, chatVoiceListeningGlow, chatVoiceSpeakingGlow, chatDictationActiveMicGlow };
