// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/browser/modernTabColorCustomizations.ts
import { registerThemingParticipant } from "./module-0287.mjs";
import { ColorThemeData } from "./module-1675.mjs";
import { MODERN_EDITOR_TAB_ACTIVE_ACTION_BACKGROUND, MODERN_EDITOR_TAB_ACTIVE_BACKGROUND, MODERN_EDITOR_TAB_ACTIVE_FOREGROUND, MODERN_EDITOR_TAB_ACTIVE_HOVER_ACTION_BACKGROUND, MODERN_EDITOR_TAB_ACTIVE_HOVER_BACKGROUND, MODERN_EDITOR_TAB_HOVER_ACTION_BACKGROUND, MODERN_EDITOR_TAB_HOVER_BACKGROUND, MODERN_EDITOR_TAB_HOVER_FOREGROUND, MODERN_EDITOR_TAB_INACTIVE_BACKGROUND, MODERN_TAB_ACTIVE_BACKGROUND, MODERN_TAB_ACTIVE_FOREGROUND, MODERN_TAB_HOVER_BACKGROUND, MODERN_TAB_HOVER_FOREGROUND, TAB_ACTIVE_BACKGROUND, TAB_ACTIVE_BORDER, TAB_ACTIVE_BORDER_TOP, TAB_ACTIVE_FOREGROUND, TAB_BORDER, TAB_HOVER_BACKGROUND, TAB_HOVER_BORDER, TAB_HOVER_FOREGROUND, TAB_INACTIVE_BACKGROUND, TAB_INACTIVE_FOREGROUND, TAB_LAST_PINNED_BORDER, TAB_UNFOCUSED_ACTIVE_BACKGROUND, TAB_UNFOCUSED_ACTIVE_BORDER, TAB_UNFOCUSED_ACTIVE_BORDER_TOP, TAB_UNFOCUSED_ACTIVE_FOREGROUND, TAB_UNFOCUSED_HOVER_BACKGROUND, TAB_UNFOCUSED_HOVER_BORDER, TAB_UNFOCUSED_HOVER_FOREGROUND, TAB_UNFOCUSED_INACTIVE_BACKGROUND, TAB_UNFOCUSED_INACTIVE_FOREGROUND } from "./module-0912.mjs";
import { editorBackground } from "./module-0229.mjs";


// src/vs/workbench/services/themes/browser/modernTabColorCustomizations.ts
function resolveLegacyTabColor(theme, legacyColorId, modernColorIds, ...relatedLegacyColorIds) {
  if (modernColorIds.some((id2) => theme.getColorCustomization(id2))) {
    return void 0;
  }
  if (!theme.getColorCustomization(legacyColorId) && !relatedLegacyColorIds.some((id2) => theme.getColorCustomization(id2))) {
    return void 0;
  }
  return theme.getColor(legacyColorId);
}

function addColorVariable(declarations, name, color2) {
  if (color2) {
    declarations.push(`${name}: ${color2};`);
  }
}

function flattenActionBackground(color2, editorBackgroundColor) {
  return editorBackgroundColor ? color2.makeOpaque(editorBackgroundColor) : color2;
}

registerThemingParticipant((theme, collector) => {
  if (!(theme instanceof ColorThemeData)) {
    return;
  }
  const declarations = [];
  const activeBackground = resolveLegacyTabColor(theme, TAB_ACTIVE_BACKGROUND, [MODERN_EDITOR_TAB_ACTIVE_BACKGROUND, MODERN_TAB_ACTIVE_BACKGROUND]);
  const unfocusedActiveBackground = resolveLegacyTabColor(theme, TAB_UNFOCUSED_ACTIVE_BACKGROUND, [MODERN_EDITOR_TAB_ACTIVE_BACKGROUND, MODERN_TAB_ACTIVE_BACKGROUND], TAB_ACTIVE_BACKGROUND);
  const inactiveBackground = resolveLegacyTabColor(theme, TAB_INACTIVE_BACKGROUND, [MODERN_EDITOR_TAB_INACTIVE_BACKGROUND]);
  const unfocusedInactiveBackground = resolveLegacyTabColor(theme, TAB_UNFOCUSED_INACTIVE_BACKGROUND, [MODERN_EDITOR_TAB_INACTIVE_BACKGROUND], TAB_INACTIVE_BACKGROUND);
  const hoverBackground = resolveLegacyTabColor(theme, TAB_HOVER_BACKGROUND, [MODERN_EDITOR_TAB_HOVER_BACKGROUND, MODERN_TAB_HOVER_BACKGROUND]);
  const unfocusedHoverBackground = resolveLegacyTabColor(theme, TAB_UNFOCUSED_HOVER_BACKGROUND, [MODERN_EDITOR_TAB_HOVER_BACKGROUND, MODERN_TAB_HOVER_BACKGROUND], TAB_HOVER_BACKGROUND);
  const activeHoverBackground = resolveLegacyTabColor(theme, TAB_HOVER_BACKGROUND, [MODERN_EDITOR_TAB_ACTIVE_HOVER_BACKGROUND, MODERN_EDITOR_TAB_HOVER_BACKGROUND, MODERN_TAB_HOVER_BACKGROUND]);
  const unfocusedActiveHoverBackground = resolveLegacyTabColor(theme, TAB_UNFOCUSED_HOVER_BACKGROUND, [MODERN_EDITOR_TAB_ACTIVE_HOVER_BACKGROUND, MODERN_EDITOR_TAB_HOVER_BACKGROUND, MODERN_TAB_HOVER_BACKGROUND], TAB_HOVER_BACKGROUND);
  const editorBackgroundColor = theme.getColor(editorBackground);
  const hasModernActiveActionBackground = !!theme.getColorCustomization(MODERN_EDITOR_TAB_ACTIVE_ACTION_BACKGROUND);
  const hasModernHoverActionBackground = !!theme.getColorCustomization(MODERN_EDITOR_TAB_HOVER_ACTION_BACKGROUND);
  const hasModernActiveHoverActionBackground = !!theme.getColorCustomization(MODERN_EDITOR_TAB_ACTIVE_HOVER_ACTION_BACKGROUND);
  addColorVariable(declarations, "--modern-ui-editor-tab-active-background", activeBackground);
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-active-background", unfocusedActiveBackground);
  addColorVariable(declarations, "--modern-ui-editor-tab-inactive-background", inactiveBackground);
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-inactive-background", unfocusedInactiveBackground);
  addColorVariable(declarations, "--modern-ui-editor-tab-hover-background", hoverBackground);
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-hover-background", unfocusedHoverBackground);
  addColorVariable(declarations, "--modern-ui-editor-tab-active-hover-background", activeHoverBackground);
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-active-hover-background", unfocusedActiveHoverBackground);
  addColorVariable(declarations, "--modern-ui-editor-tab-active-foreground", resolveLegacyTabColor(theme, TAB_ACTIVE_FOREGROUND, [MODERN_EDITOR_TAB_ACTIVE_FOREGROUND, MODERN_TAB_ACTIVE_FOREGROUND]));
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-active-foreground", resolveLegacyTabColor(theme, TAB_UNFOCUSED_ACTIVE_FOREGROUND, [MODERN_EDITOR_TAB_ACTIVE_FOREGROUND, MODERN_TAB_ACTIVE_FOREGROUND], TAB_ACTIVE_FOREGROUND));
  addColorVariable(declarations, "--modern-ui-editor-tab-inactive-foreground", resolveLegacyTabColor(theme, TAB_INACTIVE_FOREGROUND, [], TAB_ACTIVE_FOREGROUND));
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-inactive-foreground", resolveLegacyTabColor(theme, TAB_UNFOCUSED_INACTIVE_FOREGROUND, [], TAB_INACTIVE_FOREGROUND, TAB_ACTIVE_FOREGROUND));
  addColorVariable(declarations, "--modern-ui-editor-tab-hover-foreground", resolveLegacyTabColor(theme, TAB_HOVER_FOREGROUND, [MODERN_EDITOR_TAB_HOVER_FOREGROUND, MODERN_TAB_HOVER_FOREGROUND]));
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-hover-foreground", resolveLegacyTabColor(theme, TAB_UNFOCUSED_HOVER_FOREGROUND, [MODERN_EDITOR_TAB_HOVER_FOREGROUND, MODERN_TAB_HOVER_FOREGROUND], TAB_HOVER_FOREGROUND));
  addColorVariable(declarations, "--modern-ui-editor-tab-border", resolveLegacyTabColor(theme, TAB_BORDER, []));
  addColorVariable(declarations, "--modern-ui-editor-tab-last-pinned-border", resolveLegacyTabColor(theme, TAB_LAST_PINNED_BORDER, []));
  addColorVariable(declarations, "--modern-ui-editor-tab-active-border", resolveLegacyTabColor(theme, TAB_ACTIVE_BORDER, []));
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-active-border", resolveLegacyTabColor(theme, TAB_UNFOCUSED_ACTIVE_BORDER, [], TAB_ACTIVE_BORDER));
  addColorVariable(declarations, "--modern-ui-editor-tab-active-border-top", resolveLegacyTabColor(theme, TAB_ACTIVE_BORDER_TOP, []));
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-active-border-top", resolveLegacyTabColor(theme, TAB_UNFOCUSED_ACTIVE_BORDER_TOP, [], TAB_ACTIVE_BORDER_TOP));
  addColorVariable(declarations, "--modern-ui-editor-tab-hover-border", resolveLegacyTabColor(theme, TAB_HOVER_BORDER, []));
  addColorVariable(declarations, "--modern-ui-editor-tab-unfocused-hover-border", resolveLegacyTabColor(theme, TAB_UNFOCUSED_HOVER_BORDER, [], TAB_HOVER_BORDER));
  if (activeBackground && !hasModernActiveActionBackground) {
    addColorVariable(declarations, "--modern-ui-editor-tab-action-active-background", flattenActionBackground(activeBackground, editorBackgroundColor));
  }
  if (unfocusedActiveBackground && !hasModernActiveActionBackground) {
    addColorVariable(declarations, "--modern-ui-editor-tab-action-unfocused-active-background", flattenActionBackground(unfocusedActiveBackground, editorBackgroundColor));
  }
  if (hoverBackground && !hasModernHoverActionBackground) {
    addColorVariable(declarations, "--modern-ui-editor-tab-action-hover-background", flattenActionBackground(hoverBackground, editorBackgroundColor));
  }
  if (unfocusedHoverBackground && !hasModernHoverActionBackground) {
    addColorVariable(declarations, "--modern-ui-editor-tab-action-unfocused-hover-background", flattenActionBackground(unfocusedHoverBackground, editorBackgroundColor));
  }
  if (activeHoverBackground && !hasModernActiveHoverActionBackground) {
    addColorVariable(declarations, "--modern-ui-editor-tab-action-active-hover-background", flattenActionBackground(activeHoverBackground, editorBackgroundColor));
  }
  if (unfocusedActiveHoverBackground && !hasModernActiveHoverActionBackground) {
    addColorVariable(declarations, "--modern-ui-editor-tab-action-unfocused-active-hover-background", flattenActionBackground(unfocusedActiveHoverBackground, editorBackgroundColor));
  }
  if (declarations.length > 0) {
    collector.addRule(`.modern-ui-tabs.monaco-workbench.monaco-workbench { ${declarations.join("\n")} }`);
  }
});
export { resolveLegacyTabColor, addColorVariable, flattenActionBackground };
