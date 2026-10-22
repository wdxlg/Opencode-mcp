// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/sessionBarStyles.ts
import { activeSessionViewBackground, activeSessionViewForeground, agentsPanelBackground, inactiveSessionViewBackground, inactiveSessionViewForeground } from "./module-1496.mjs";
import { MODERN_EDITOR_TAB_ACTIVE_BACKGROUND, MODERN_EDITOR_TAB_ACTIVE_HOVER_BACKGROUND, MODERN_EDITOR_TAB_HOVER_BACKGROUND, PANEL_ACTIVE_TITLE_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_INACTIVE_TITLE_FOREGROUND, TAB_ACTIVE_BACKGROUND, TAB_HOVER_BACKGROUND, TAB_UNFOCUSED_ACTIVE_BACKGROUND, TAB_UNFOCUSED_HOVER_BACKGROUND } from "./module-0868.mjs";
import { ColorThemeData } from "./module-1618.mjs";


// src/vs/sessions/browser/parts/sessionBarStyles.ts
function applySessionBarThemeColors(container2, theme) {
  const bg = theme.getColor(agentsPanelBackground);
  const activeFg = theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND);
  const inactiveFg = theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND);
  const activeBorder = theme.getColor(PANEL_ACTIVE_TITLE_BORDER);
  container2.style.setProperty("--chat-bar-background", bg?.toString() ?? "");
  container2.style.setProperty("--chat-tab-active-foreground", activeFg?.toString() ?? "");
  container2.style.setProperty("--chat-tab-inactive-foreground", inactiveFg?.toString() ?? "");
  container2.style.setProperty("--chat-tab-active-border", activeBorder?.toString() ?? "");
}

function applySessionViewThemeColors(container2, theme, active) {
  const background = theme.getColor(active ? activeSessionViewBackground : inactiveSessionViewBackground);
  const foreground2 = theme.getColor(active ? activeSessionViewForeground : inactiveSessionViewForeground);
  const activeTabBackground = theme.getColor(MODERN_EDITOR_TAB_ACTIVE_BACKGROUND);
  const hoverTabBackground = theme.getColor(MODERN_EDITOR_TAB_HOVER_BACKGROUND);
  const activeHoverTabBackground = theme.getColor(MODERN_EDITOR_TAB_ACTIVE_HOVER_BACKGROUND);
  const unfocusedActiveTabBackground = getLegacyTabBackgroundCustomization(theme, TAB_UNFOCUSED_ACTIVE_BACKGROUND, TAB_ACTIVE_BACKGROUND) ?? activeTabBackground;
  const legacyUnfocusedHoverTabBackground = getLegacyTabBackgroundCustomization(theme, TAB_UNFOCUSED_HOVER_BACKGROUND, TAB_HOVER_BACKGROUND);
  const unfocusedHoverTabBackground = legacyUnfocusedHoverTabBackground ?? hoverTabBackground;
  const unfocusedActiveHoverTabBackground = legacyUnfocusedHoverTabBackground ?? activeHoverTabBackground;
  container2.style.setProperty("--session-view-background", background?.toString() ?? "");
  container2.style.setProperty("--session-view-foreground", foreground2?.toString() ?? "");
  container2.style.setProperty("--part-background", background?.toString() ?? "");
  container2.style.setProperty("--part-foreground", foreground2?.toString() ?? "");
  container2.style.setProperty("--modern-ui-editor-tab-action-active-background", activeTabBackground && background ? activeTabBackground.makeOpaque(background).toString() : "");
  container2.style.setProperty("--modern-ui-editor-tab-action-hover-background", hoverTabBackground && background ? hoverTabBackground.makeOpaque(background).toString() : "");
  container2.style.setProperty("--modern-ui-editor-tab-action-active-hover-background", activeHoverTabBackground && background ? activeHoverTabBackground.makeOpaque(background).toString() : "");
  container2.style.setProperty("--modern-ui-editor-tab-action-unfocused-active-background", unfocusedActiveTabBackground && background ? unfocusedActiveTabBackground.makeOpaque(background).toString() : "");
  container2.style.setProperty("--modern-ui-editor-tab-action-unfocused-hover-background", unfocusedHoverTabBackground && background ? unfocusedHoverTabBackground.makeOpaque(background).toString() : "");
  container2.style.setProperty("--modern-ui-editor-tab-action-unfocused-active-hover-background", unfocusedActiveHoverTabBackground && background ? unfocusedActiveHoverTabBackground.makeOpaque(background).toString() : "");
}

function getLegacyTabBackgroundCustomization(theme, colorId, relatedColorId) {
  if (theme instanceof ColorThemeData && !theme.getColorCustomization(colorId) && !theme.getColorCustomization(relatedColorId)) {
    return void 0;
  }
  return theme.getColor(colorId);
}
export { applySessionBarThemeColors, applySessionViewThemeColors, getLegacyTabBackgroundCustomization };
