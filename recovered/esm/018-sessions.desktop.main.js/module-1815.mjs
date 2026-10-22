// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/common/settingsEditorColorRegistry.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { Color, RGBA } from "./module-0197.mjs";
import { PANEL_BORDER } from "./module-0868.mjs";
import { checkboxBackground, checkboxBorder, checkboxForeground, inputBackground, inputBorder, inputForeground, selectBackground, selectBorder, selectForeground } from "./module-0233.mjs";
import { editorWidgetBorder } from "./module-0229.mjs";
import { listHoverBackground } from "./module-0232.mjs";
import { focusBorder } from "./module-0227.mjs";


// src/vs/workbench/contrib/preferences/common/settingsEditorColorRegistry.ts
var settingsHeaderForeground = registerColor("settings.headerForeground", { light: "#444444", dark: "#e7e7e7", hcDark: "#ffffff", hcLight: "#292929" }, localize(18385, null));

var settingsHeaderHoverForeground = registerColor("settings.settingsHeaderHoverForeground", transparent(settingsHeaderForeground, 0.7), localize(18400, null));

var modifiedItemIndicator = registerColor("settings.modifiedItemIndicator", {
  light: new Color(new RGBA(102, 175, 224)),
  dark: new Color(new RGBA(12, 125, 157)),
  hcDark: new Color(new RGBA(0, 73, 122)),
  hcLight: new Color(new RGBA(102, 175, 224))
}, localize(18386, null));

var settingsHeaderBorder = registerColor("settings.headerBorder", PANEL_BORDER, localize(18399, null));

var settingsSashBorder = registerColor("settings.sashBorder", PANEL_BORDER, localize(18401, null));

var settingsSelectBackground = registerColor(`settings.dropdownBackground`, selectBackground, localize(18395, null));

var settingsSelectForeground = registerColor("settings.dropdownForeground", selectForeground, localize(18397, null));

var settingsSelectBorder = registerColor("settings.dropdownBorder", selectBorder, localize(18396, null));

var settingsSelectListBorder = registerColor("settings.dropdownListBorder", editorWidgetBorder, localize(18398, null));

var settingsCheckboxBackground = registerColor("settings.checkboxBackground", checkboxBackground, localize(18392, null));

var settingsCheckboxForeground = registerColor("settings.checkboxForeground", checkboxForeground, localize(18394, null));

var settingsCheckboxBorder = registerColor("settings.checkboxBorder", checkboxBorder, localize(18393, null));

var settingsTextInputBackground = registerColor("settings.textInputBackground", inputBackground, localize(18402, null));

var settingsTextInputForeground = registerColor("settings.textInputForeground", inputForeground, localize(18404, null));

var settingsTextInputBorder = registerColor("settings.textInputBorder", inputBorder, localize(18403, null));

var settingsNumberInputBackground = registerColor("settings.numberInputBackground", inputBackground, localize(18387, null));

var settingsNumberInputForeground = registerColor("settings.numberInputForeground", inputForeground, localize(18389, null));

var settingsNumberInputBorder = registerColor("settings.numberInputBorder", inputBorder, localize(18388, null));

var focusedRowBackground = registerColor("settings.focusedRowBackground", {
  dark: transparent(listHoverBackground, 0.6),
  light: transparent(listHoverBackground, 0.6),
  hcDark: null,
  hcLight: null
}, localize(18384, null));

var rowHoverBackground = registerColor("settings.rowHoverBackground", {
  dark: transparent(listHoverBackground, 0.3),
  light: transparent(listHoverBackground, 0.3),
  hcDark: null,
  hcLight: null
}, localize(18391, null));

var focusedRowBorder = registerColor("settings.focusedRowBorder", focusBorder, localize(18390, null));
export { settingsHeaderForeground, settingsHeaderHoverForeground, modifiedItemIndicator, settingsHeaderBorder, settingsSashBorder, settingsSelectBackground, settingsSelectForeground, settingsSelectBorder, settingsSelectListBorder, settingsCheckboxBackground, settingsCheckboxForeground, settingsCheckboxBorder, settingsTextInputBackground, settingsTextInputForeground, settingsTextInputBorder, settingsNumberInputBackground, settingsNumberInputForeground, settingsNumberInputBorder, focusedRowBackground, rowHoverBackground, focusedRowBorder };
