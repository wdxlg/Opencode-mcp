// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/sessions/common/theme.ts
import { darken, lighten, registerColor, transparent } from "./module-0226.mjs";
import { editorBackground, editorWidgetBackground, editorWidgetBorder, toolbarHoverBackground } from "./module-0229.mjs";
import { ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, SIDE_BAR_BACKGROUND, SIDE_BAR_FOREGROUND } from "./module-0912.mjs";
import { localize } from "./module-0001.mjs";
import { contrastBorder, focusBorder, foreground } from "./module-0227.mjs";
import { buttonBackground, buttonSecondaryBorder, inputBackground, inputBorder, inputForeground, inputPlaceholderForeground } from "./module-0233.mjs";
import { Color } from "./module-0197.mjs";


// src/vs/sessions/common/theme.ts
var agentsBackground = registerColor(
  "agents.background",
  { dark: editorBackground, light: SIDE_BAR_BACKGROUND, hcDark: editorBackground, hcLight: editorBackground },
  localize(3964, null)
);

var agentsPanelBackground = registerColor(
  "agentsPanel.background",
  { dark: SIDE_BAR_BACKGROUND, light: editorBackground, hcDark: SIDE_BAR_BACKGROUND, hcLight: SIDE_BAR_BACKGROUND },
  localize(3979, null)
);

var agentsPanelForeground = registerColor(
  "agentsPanel.foreground",
  SIDE_BAR_FOREGROUND,
  localize(3981, null)
);

var agentsPanelBorder = registerColor(
  "agentsPanel.border",
  { dark: transparent(foreground, 0.15), light: transparent(foreground, 0.15), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3980, null)
);

var agentsCardBorder = registerColor(
  "agentsCard.border",
  agentsPanelBorder,
  localize(3968, null)
);

var agentsBottomPanelBorder = registerColor(
  "agentsBottomPanel.border",
  agentsPanelBorder,
  localize(3967, null)
);

var agentsGradientTintColor = registerColor(
  "agentsGradient.tintColor",
  buttonBackground,
  localize(3974, null)
);

var agentFeedbackEditorWidgetBackground = registerColor(
  "agentFeedbackEditorWidget.background",
  { dark: lighten(editorWidgetBackground, 0.08), light: darken(editorWidgetBackground, 0.04), hcDark: Color.black, hcLight: Color.white },
  localize(3961, null)
);

var agentFeedbackEditorWidgetBorder = registerColor(
  "agentFeedbackEditorWidget.border",
  { dark: transparent(foreground, 0.35), light: transparent(foreground, 0.35), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3962, null)
);

var agentFeedbackInputWidgetBorder = registerColor(
  "agentFeedbackInputWidget.border",
  { dark: editorWidgetBorder, light: editorWidgetBorder, hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3963, null)
);

var agentsUpdateButtonDownloadingBackground = registerColor(
  "agentsUpdateButton.downloadingBackground",
  transparent(buttonBackground, 0.4),
  localize(3985, null)
);

var agentsUpdateButtonDownloadedBackground = registerColor(
  "agentsUpdateButton.downloadedBackground",
  transparent(buttonBackground, 0.7),
  localize(3984, null)
);

var agentsChatInputBackground = registerColor(
  "agentsChatInput.background",
  inputBackground,
  localize(3969, null)
);

var agentsChatInputForeground = registerColor(
  "agentsChatInput.foreground",
  inputForeground,
  localize(3972, null)
);

var agentsChatInputBorder = registerColor(
  "agentsChatInput.border",
  inputBorder,
  localize(3970, null)
);

var agentsChatInputFocusBorder = registerColor(
  "agentsChatInput.focusBorder",
  focusBorder,
  localize(3971, null)
);

var agentsChatInputPlaceholderForeground = registerColor(
  "agentsChatInput.placeholderForeground",
  inputPlaceholderForeground,
  localize(3973, null)
);

var agentsNewSessionButtonBackground = registerColor(
  "agentsNewSessionButton.background",
  "#00000000",
  localize(3975, null)
);

var agentsNewSessionButtonForeground = registerColor(
  "agentsNewSessionButton.foreground",
  SIDE_BAR_FOREGROUND,
  localize(3977, null)
);

var agentsNewSessionButtonBorder = registerColor(
  "agentsNewSessionButton.border",
  buttonSecondaryBorder,
  localize(3976, null)
);

var agentsNewSessionButtonHoverBackground = registerColor(
  "agentsNewSessionButton.hoverBackground",
  toolbarHoverBackground,
  localize(3978, null)
);

var agentsBadgeBackground = registerColor(
  "agentsBadge.background",
  ACTIVITY_BAR_BADGE_BACKGROUND,
  localize(3965, null)
);

var agentsBadgeForeground = registerColor(
  "agentsBadge.foreground",
  ACTIVITY_BAR_BADGE_FOREGROUND,
  localize(3966, null)
);

var agentsUnreadBadgeBackground = registerColor(
  "agentsUnreadBadge.background",
  ACTIVITY_BAR_BADGE_BACKGROUND,
  localize(3982, null)
);

var agentsUnreadBadgeForeground = registerColor(
  "agentsUnreadBadge.foreground",
  ACTIVITY_BAR_BADGE_FOREGROUND,
  localize(3983, null)
);

var activeSessionViewBackground = registerColor(
  "activeSessionView.background",
  agentsPanelBackground,
  localize(3959, null)
);

var inactiveSessionViewBackground = registerColor(
  "inactiveSessionView.background",
  agentsBackground,
  localize(3986, null)
);

var activeSessionViewForeground = registerColor(
  "activeSessionView.foreground",
  agentsPanelForeground,
  localize(3960, null)
);

var inactiveSessionViewForeground = registerColor(
  "inactiveSessionView.foreground",
  agentsPanelForeground,
  localize(3987, null)
);
export { agentsBackground, agentsPanelBackground, agentsPanelForeground, agentsPanelBorder, agentsCardBorder, agentsBottomPanelBorder, agentsGradientTintColor, agentFeedbackEditorWidgetBackground, agentFeedbackEditorWidgetBorder, agentFeedbackInputWidgetBorder, agentsUpdateButtonDownloadingBackground, agentsUpdateButtonDownloadedBackground, agentsChatInputBackground, agentsChatInputForeground, agentsChatInputBorder, agentsChatInputFocusBorder, agentsChatInputPlaceholderForeground, agentsNewSessionButtonBackground, agentsNewSessionButtonForeground, agentsNewSessionButtonBorder, agentsNewSessionButtonHoverBackground, agentsBadgeBackground, agentsBadgeForeground, agentsUnreadBadgeBackground, agentsUnreadBadgeForeground, activeSessionViewBackground, inactiveSessionViewBackground, activeSessionViewForeground, inactiveSessionViewForeground };
