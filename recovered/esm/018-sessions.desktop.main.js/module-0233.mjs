// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/inputColors.ts
import { darken, lighten, registerColor, transparent } from "./module-0226.mjs";
import { Color, RGBA } from "./module-0197.mjs";
import { localize } from "./module-0001.mjs";
import { contrastBorder, focusBorder, foreground, iconForeground } from "./module-0227.mjs";
import { listHoverBackground } from "./module-0232.mjs";
import { editorWidgetBackground } from "./module-0229.mjs";


// src/vs/platform/theme/common/colors/inputColors.ts
var inputBackground = registerColor(
  "input.background",
  { dark: "#3C3C3C", light: Color.white, hcDark: Color.black, hcLight: Color.white },
  localize(3448, null)
);

var inputForeground = registerColor(
  "input.foreground",
  foreground,
  localize(3450, null)
);

var inputBorder = registerColor(
  "input.border",
  { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3449, null)
);

var inputActiveOptionBorder = registerColor(
  "inputOption.activeBorder",
  { dark: "#007ACC", light: "#007ACC", hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3447, null)
);

var inputActiveOptionHoverBackground = registerColor(
  "inputOption.hoverBackground",
  { dark: "#5a5d5e80", light: "#b8b8b850", hcDark: null, hcLight: null },
  localize(3453, null)
);

var inputActiveOptionBackground = registerColor(
  "inputOption.activeBackground",
  { dark: transparent(focusBorder, 0.4), light: transparent(focusBorder, 0.2), hcDark: Color.transparent, hcLight: Color.transparent },
  localize(3451, null)
);

var inputActiveOptionForeground = registerColor(
  "inputOption.activeForeground",
  { dark: Color.white, light: Color.black, hcDark: foreground, hcLight: foreground },
  localize(3452, null)
);

var inputPlaceholderForeground = registerColor(
  "input.placeholderForeground",
  { light: transparent(foreground, 0.5), dark: transparent(foreground, 0.5), hcDark: transparent(foreground, 0.7), hcLight: transparent(foreground, 0.7) },
  localize(3454, null)
);

var inputValidationInfoBackground = registerColor(
  "inputValidation.infoBackground",
  { dark: "#063B49", light: "#D6ECF2", hcDark: Color.black, hcLight: Color.white },
  localize(3458, null)
);

var inputValidationInfoForeground = registerColor(
  "inputValidation.infoForeground",
  { dark: null, light: null, hcDark: null, hcLight: foreground },
  localize(3460, null)
);

var inputValidationInfoBorder = registerColor(
  "inputValidation.infoBorder",
  { dark: "#007acc", light: "#007acc", hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3459, null)
);

var inputValidationWarningBackground = registerColor(
  "inputValidation.warningBackground",
  { dark: "#352A05", light: "#F6F5D2", hcDark: Color.black, hcLight: Color.white },
  localize(3461, null)
);

var inputValidationWarningForeground = registerColor(
  "inputValidation.warningForeground",
  { dark: null, light: null, hcDark: null, hcLight: foreground },
  localize(3463, null)
);

var inputValidationWarningBorder = registerColor(
  "inputValidation.warningBorder",
  { dark: "#B89500", light: "#B89500", hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3462, null)
);

var inputValidationErrorBackground = registerColor(
  "inputValidation.errorBackground",
  { dark: "#5A1D1D", light: "#F2DEDE", hcDark: Color.black, hcLight: Color.white },
  localize(3455, null)
);

var inputValidationErrorForeground = registerColor(
  "inputValidation.errorForeground",
  { dark: null, light: null, hcDark: null, hcLight: foreground },
  localize(3457, null)
);

var inputValidationErrorBorder = registerColor(
  "inputValidation.errorBorder",
  { dark: "#BE1100", light: "#BE1100", hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3456, null)
);

var selectBackground = registerColor(
  "dropdown.background",
  { dark: "#3C3C3C", light: Color.white, hcDark: Color.black, hcLight: Color.white },
  localize(3443, null)
);

var selectListBackground = registerColor(
  "dropdown.listBackground",
  { dark: null, light: null, hcDark: Color.black, hcLight: Color.white },
  localize(3446, null)
);

var selectForeground = registerColor(
  "dropdown.foreground",
  { dark: "#F0F0F0", light: foreground, hcDark: Color.white, hcLight: foreground },
  localize(3445, null)
);

var selectBorder = registerColor(
  "dropdown.border",
  { dark: selectBackground, light: "#CECECE", hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3444, null)
);

var buttonForeground = registerColor(
  "button.foreground",
  Color.white,
  localize(3429, null)
);

var buttonSeparator = registerColor(
  "button.separator",
  transparent(buttonForeground, 0.4),
  localize(3435, null)
);

var buttonBackground = registerColor(
  "button.background",
  { dark: "#0E639C", light: "#007ACC", hcDark: Color.black, hcLight: "#0F4A85" },
  localize(3427, null)
);

var buttonHoverBackground = registerColor(
  "button.hoverBackground",
  { dark: lighten(buttonBackground, 0.2), light: darken(buttonBackground, 0.2), hcDark: buttonBackground, hcLight: buttonBackground },
  localize(3430, null)
);

var buttonBorder = registerColor(
  "button.border",
  contrastBorder,
  localize(3428, null)
);

var buttonSecondaryForeground = registerColor(
  "button.secondaryForeground",
  { dark: foreground, light: foreground, hcDark: Color.white, hcLight: foreground },
  localize(3433, null)
);

var buttonSecondaryBackground = registerColor(
  "button.secondaryBackground",
  { dark: listHoverBackground, light: listHoverBackground, hcDark: null, hcLight: Color.white },
  localize(3431, null)
);

var buttonSecondaryBorder = registerColor(
  "button.secondaryBorder",
  { dark: transparent(foreground, 0.15), light: transparent(foreground, 0.15), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3432, null)
);

var buttonSecondaryHoverBackground = registerColor(
  "button.secondaryHoverBackground",
  { dark: lighten(listHoverBackground, 0.2), light: lighten(listHoverBackground, 0.2), hcDark: null, hcLight: null },
  localize(3434, null)
);

var radioActiveForeground = registerColor(
  "radio.activeForeground",
  inputActiveOptionForeground,
  localize(3469, null)
);

var radioActiveBackground = registerColor(
  "radio.activeBackground",
  inputActiveOptionBackground,
  localize(3470, null)
);

var radioActiveBorder = registerColor(
  "radio.activeBorder",
  inputActiveOptionBorder,
  localize(3468, null)
);

var radioInactiveForeground = registerColor(
  "radio.inactiveForeground",
  null,
  localize(3474, null)
);

var radioInactiveBackground = registerColor(
  "radio.inactiveBackground",
  null,
  localize(3472, null)
);

var radioInactiveBorder = registerColor(
  "radio.inactiveBorder",
  { light: transparent(radioActiveForeground, 0.2), dark: transparent(radioActiveForeground, 0.2), hcDark: transparent(radioActiveForeground, 0.4), hcLight: transparent(radioActiveForeground, 0.2) },
  localize(3473, null)
);

var radioInactiveHoverBackground = registerColor(
  "radio.inactiveHoverBackground",
  inputActiveOptionHoverBackground,
  localize(3471, null)
);

var checkboxBackground = registerColor(
  "checkbox.background",
  selectBackground,
  localize(3436, null)
);

var checkboxSelectBackground = registerColor(
  "checkbox.selectBackground",
  editorWidgetBackground,
  localize(3441, null)
);

var checkboxForeground = registerColor(
  "checkbox.foreground",
  selectForeground,
  localize(3440, null)
);

var checkboxBorder = registerColor(
  "checkbox.border",
  selectBorder,
  localize(3437, null)
);

var checkboxSelectBorder = registerColor(
  "checkbox.selectBorder",
  iconForeground,
  localize(3442, null)
);

var checkboxDisabledBackground = registerColor(
  "checkbox.disabled.background",
  { op: 7 /* Mix */, color: checkboxBackground, with: checkboxForeground, ratio: 0.33 },
  localize(3438, null)
);

var checkboxDisabledForeground = registerColor(
  "checkbox.disabled.foreground",
  { op: 7 /* Mix */, color: checkboxForeground, with: checkboxBackground, ratio: 0.33 },
  localize(3439, null)
);

var keybindingLabelBackground = registerColor(
  "keybindingLabel.background",
  { dark: new Color(new RGBA(128, 128, 128, 0.17)), light: new Color(new RGBA(221, 221, 221, 0.4)), hcDark: Color.transparent, hcLight: Color.transparent },
  localize(3464, null)
);

var keybindingLabelForeground = registerColor(
  "keybindingLabel.foreground",
  { dark: Color.fromHex("#CCCCCC"), light: Color.fromHex("#555555"), hcDark: Color.white, hcLight: foreground },
  localize(3467, null)
);

var keybindingLabelBorder = registerColor(
  "keybindingLabel.border",
  { dark: new Color(new RGBA(51, 51, 51, 0.6)), light: new Color(new RGBA(204, 204, 204, 0.4)), hcDark: new Color(new RGBA(111, 195, 223)), hcLight: contrastBorder },
  localize(3465, null)
);

var keybindingLabelBottomBorder = registerColor(
  "keybindingLabel.bottomBorder",
  { dark: new Color(new RGBA(68, 68, 68, 0.6)), light: new Color(new RGBA(187, 187, 187, 0.4)), hcDark: new Color(new RGBA(111, 195, 223)), hcLight: foreground },
  localize(3466, null)
);
export { inputBackground, inputForeground, inputBorder, inputActiveOptionBorder, inputActiveOptionHoverBackground, inputActiveOptionBackground, inputActiveOptionForeground, inputPlaceholderForeground, inputValidationInfoBackground, inputValidationInfoForeground, inputValidationInfoBorder, inputValidationWarningBackground, inputValidationWarningForeground, inputValidationWarningBorder, inputValidationErrorBackground, inputValidationErrorForeground, inputValidationErrorBorder, selectBackground, selectListBackground, selectForeground, selectBorder, buttonForeground, buttonSeparator, buttonBackground, buttonHoverBackground, buttonBorder, buttonSecondaryForeground, buttonSecondaryBackground, buttonSecondaryBorder, buttonSecondaryHoverBackground, radioActiveForeground, radioActiveBackground, radioActiveBorder, radioInactiveForeground, radioInactiveBackground, radioInactiveBorder, radioInactiveHoverBackground, checkboxBackground, checkboxSelectBackground, checkboxForeground, checkboxBorder, checkboxSelectBorder, checkboxDisabledBackground, checkboxDisabledForeground, keybindingLabelBackground, keybindingLabelForeground, keybindingLabelBorder, keybindingLabelBottomBorder };
