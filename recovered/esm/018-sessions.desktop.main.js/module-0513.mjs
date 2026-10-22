// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/browser/defaultStyles.ts
import { asCssVariable, asCssVariableWithDefault } from "./module-0226.mjs";
import { buttonBackground, buttonBorder, buttonForeground, buttonHoverBackground, buttonSecondaryBackground, buttonSecondaryBorder, buttonSecondaryForeground, buttonSecondaryHoverBackground, buttonSeparator, checkboxBackground, checkboxBorder, checkboxDisabledBackground, checkboxDisabledForeground, checkboxForeground, inputActiveOptionBackground, inputActiveOptionBorder, inputActiveOptionForeground, inputBackground, inputBorder, inputForeground, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, inputValidationInfoBackground, inputValidationInfoBorder, inputValidationInfoForeground, inputValidationWarningBackground, inputValidationWarningBorder, inputValidationWarningForeground, keybindingLabelBackground, keybindingLabelBorder, keybindingLabelBottomBorder, keybindingLabelForeground, radioActiveBackground, radioActiveBorder, radioActiveForeground, radioInactiveBackground, radioInactiveBorder, radioInactiveForeground, radioInactiveHoverBackground, selectBackground, selectBorder, selectForeground, selectListBackground } from "./module-0233.mjs";
import { breadcrumbsActiveSelectionForeground, breadcrumbsBackground, breadcrumbsFocusForeground, breadcrumbsForeground, editorWidgetBackground, editorWidgetBorder, editorWidgetForeground, problemsErrorIconForeground, problemsInfoIconForeground, problemsWarningIconForeground, widgetBorder, widgetShadow } from "./module-0229.mjs";
import { badgeBackground, badgeForeground, progressBarBackground, scrollbarShadow, scrollbarSliderActiveBackground, scrollbarSliderBackground, scrollbarSliderHoverBackground } from "./module-0228.mjs";
import { activeContrastBorder, contrastBorder, focusBorder, textLinkForeground } from "./module-0227.mjs";
import { listActiveSelectionBackground, listActiveSelectionForeground, listActiveSelectionIconForeground, listDropBetweenBackground, listDropOverBackground, listFilterWidgetBackground, listFilterWidgetNoMatchesOutline, listFilterWidgetOutline, listFilterWidgetShadow, listFocusAndSelectionOutline, listFocusBackground, listFocusForeground, listFocusOutline, listHoverBackground, listHoverForeground, listInactiveFocusBackground, listInactiveFocusOutline, listInactiveSelectionBackground, listInactiveSelectionForeground, listInactiveSelectionIconForeground, tableColumnsBorder, tableOddRowsBackgroundColor, treeInactiveIndentGuidesStroke, treeIndentGuidesStroke } from "./module-0232.mjs";
import { pickerGroupForeground, quickInputListFocusBackground, quickInputListFocusForeground, quickInputListFocusIconForeground } from "./module-0235.mjs";
import { Color } from "./module-0197.mjs";
import { menuBackground, menuBorder, menuForeground, menuSelectionBorder, menuSeparatorBackground } from "./module-0234.mjs";


// src/vs/platform/theme/browser/defaultStyles.ts
function overrideStyles(override, styles) {
  const result = { ...styles };
  for (const key3 in override) {
    const val = override[key3];
    result[key3] = val !== void 0 ? asCssVariable(val) : void 0;
  }
  return result;
}

var defaultKeybindingLabelStyles = {
  keybindingLabelBackground: asCssVariable(keybindingLabelBackground),
  keybindingLabelForeground: asCssVariable(keybindingLabelForeground),
  keybindingLabelBorder: asCssVariable(keybindingLabelBorder),
  keybindingLabelBottomBorder: asCssVariable(keybindingLabelBottomBorder),
  keybindingLabelShadow: asCssVariable(widgetShadow)
};

var defaultButtonStyles = {
  buttonForeground: asCssVariable(buttonForeground),
  buttonSeparator: asCssVariable(buttonSeparator),
  buttonBackground: asCssVariable(buttonBackground),
  buttonHoverBackground: asCssVariable(buttonHoverBackground),
  buttonSecondaryForeground: asCssVariable(buttonSecondaryForeground),
  buttonSecondaryBackground: asCssVariable(buttonSecondaryBackground),
  buttonSecondaryHoverBackground: asCssVariable(buttonSecondaryHoverBackground),
  buttonSecondaryBorder: asCssVariable(buttonSecondaryBorder),
  buttonBorder: asCssVariable(buttonBorder)
};

var defaultProgressBarStyles = {
  progressBarBackground: asCssVariable(progressBarBackground)
};

var defaultToggleStyles = {
  inputActiveOptionBorder: asCssVariable(inputActiveOptionBorder),
  inputActiveOptionForeground: asCssVariable(inputActiveOptionForeground),
  inputActiveOptionBackground: asCssVariable(inputActiveOptionBackground)
};

var defaultRadioStyles = {
  activeForeground: asCssVariable(radioActiveForeground),
  activeBackground: asCssVariable(radioActiveBackground),
  activeBorder: asCssVariable(radioActiveBorder),
  inactiveForeground: asCssVariable(radioInactiveForeground),
  inactiveBackground: asCssVariable(radioInactiveBackground),
  inactiveBorder: asCssVariable(radioInactiveBorder),
  inactiveHoverBackground: asCssVariable(radioInactiveHoverBackground)
};

var defaultCheckboxStyles = {
  checkboxBackground: asCssVariable(checkboxBackground),
  checkboxBorder: asCssVariable(checkboxBorder),
  checkboxForeground: asCssVariable(checkboxForeground),
  checkboxDisabledBackground: asCssVariable(checkboxDisabledBackground),
  checkboxDisabledForeground: asCssVariable(checkboxDisabledForeground)
};

var defaultDialogStyles = {
  dialogBackground: asCssVariable(editorWidgetBackground),
  dialogForeground: asCssVariable(editorWidgetForeground),
  dialogShadow: asCssVariable(widgetShadow),
  dialogBorder: asCssVariable(widgetBorder),
  errorIconForeground: asCssVariable(problemsErrorIconForeground),
  warningIconForeground: asCssVariable(problemsWarningIconForeground),
  infoIconForeground: asCssVariable(problemsInfoIconForeground),
  textLinkForeground: asCssVariable(textLinkForeground)
};

var defaultInputBoxStyles = {
  inputBackground: asCssVariable(inputBackground),
  inputForeground: asCssVariable(inputForeground),
  inputBorder: asCssVariable(inputBorder),
  inputValidationInfoBorder: asCssVariable(inputValidationInfoBorder),
  inputValidationInfoBackground: asCssVariable(inputValidationInfoBackground),
  inputValidationInfoForeground: asCssVariable(inputValidationInfoForeground),
  inputValidationWarningBorder: asCssVariable(inputValidationWarningBorder),
  inputValidationWarningBackground: asCssVariable(inputValidationWarningBackground),
  inputValidationWarningForeground: asCssVariable(inputValidationWarningForeground),
  inputValidationErrorBorder: asCssVariable(inputValidationErrorBorder),
  inputValidationErrorBackground: asCssVariable(inputValidationErrorBackground),
  inputValidationErrorForeground: asCssVariable(inputValidationErrorForeground)
};

function getInputBoxStyle(override) {
  return overrideStyles(override, defaultInputBoxStyles);
}

var defaultFindWidgetStyles = {
  listFilterWidgetBackground: asCssVariable(listFilterWidgetBackground),
  listFilterWidgetOutline: asCssVariable(listFilterWidgetOutline),
  listFilterWidgetNoMatchesOutline: asCssVariable(listFilterWidgetNoMatchesOutline),
  listFilterWidgetShadow: asCssVariable(listFilterWidgetShadow),
  inputBoxStyles: defaultInputBoxStyles,
  toggleStyles: defaultToggleStyles
};

var defaultCountBadgeStyles = {
  badgeBackground: asCssVariable(badgeBackground),
  badgeForeground: asCssVariable(badgeForeground),
  badgeBorder: asCssVariable(contrastBorder)
};

var defaultBreadcrumbsWidgetStyles = {
  breadcrumbsBackground: asCssVariable(breadcrumbsBackground),
  breadcrumbsForeground: asCssVariable(breadcrumbsForeground),
  breadcrumbsHoverForeground: asCssVariable(breadcrumbsFocusForeground),
  breadcrumbsFocusForeground: asCssVariable(breadcrumbsFocusForeground),
  breadcrumbsFocusAndSelectionForeground: asCssVariable(breadcrumbsActiveSelectionForeground)
};

var defaultListStyles = {
  listBackground: void 0,
  listInactiveFocusForeground: void 0,
  listFocusBackground: asCssVariable(listFocusBackground),
  listFocusForeground: asCssVariable(listFocusForeground),
  listFocusOutline: asCssVariable(listFocusOutline),
  listActiveSelectionBackground: asCssVariable(listActiveSelectionBackground),
  listActiveSelectionForeground: asCssVariable(listActiveSelectionForeground),
  listActiveSelectionIconForeground: asCssVariable(listActiveSelectionIconForeground),
  listFocusAndSelectionOutline: asCssVariable(listFocusAndSelectionOutline),
  listFocusAndSelectionBackground: asCssVariable(listActiveSelectionBackground),
  listFocusAndSelectionForeground: asCssVariable(listActiveSelectionForeground),
  listInactiveSelectionBackground: asCssVariable(listInactiveSelectionBackground),
  listInactiveSelectionIconForeground: asCssVariable(listInactiveSelectionIconForeground),
  listInactiveSelectionForeground: asCssVariable(listInactiveSelectionForeground),
  listInactiveFocusBackground: asCssVariable(listInactiveFocusBackground),
  listInactiveFocusOutline: asCssVariable(listInactiveFocusOutline),
  listHoverBackground: asCssVariable(listHoverBackground),
  listHoverForeground: asCssVariable(listHoverForeground),
  listDropOverBackground: asCssVariable(listDropOverBackground),
  listDropBetweenBackground: asCssVariable(listDropBetweenBackground),
  listSelectionOutline: asCssVariable(activeContrastBorder),
  listHoverOutline: asCssVariable(activeContrastBorder),
  treeIndentGuidesStroke: asCssVariable(treeIndentGuidesStroke),
  treeInactiveIndentGuidesStroke: asCssVariable(treeInactiveIndentGuidesStroke),
  treeStickyScrollBackground: void 0,
  treeStickyScrollBorder: void 0,
  treeStickyScrollShadow: asCssVariable(scrollbarShadow),
  tableColumnsBorder: asCssVariable(tableColumnsBorder),
  tableOddRowsBackgroundColor: asCssVariable(tableOddRowsBackgroundColor)
};

function getListStyles(override) {
  return overrideStyles(override, defaultListStyles);
}

var defaultSelectBoxStyles = {
  selectBackground: asCssVariable(selectBackground),
  selectListBackground: asCssVariable(selectListBackground),
  selectForeground: asCssVariable(selectForeground),
  decoratorRightForeground: asCssVariable(pickerGroupForeground),
  selectBorder: asCssVariable(selectBorder),
  focusBorder: asCssVariable(focusBorder),
  listFocusBackground: asCssVariable(quickInputListFocusBackground),
  listInactiveSelectionIconForeground: asCssVariable(quickInputListFocusIconForeground),
  listFocusForeground: asCssVariable(quickInputListFocusForeground),
  listFocusOutline: asCssVariableWithDefault(activeContrastBorder, Color.transparent.toString()),
  listHoverBackground: asCssVariable(listHoverBackground),
  listHoverForeground: asCssVariable(listHoverForeground),
  listHoverOutline: asCssVariable(activeContrastBorder),
  selectListBorder: asCssVariable(editorWidgetBorder),
  listBackground: void 0,
  listActiveSelectionBackground: void 0,
  listActiveSelectionForeground: void 0,
  listActiveSelectionIconForeground: void 0,
  listFocusAndSelectionBackground: void 0,
  listDropOverBackground: void 0,
  listDropBetweenBackground: void 0,
  listInactiveSelectionBackground: void 0,
  listInactiveSelectionForeground: void 0,
  listInactiveFocusBackground: void 0,
  listInactiveFocusOutline: void 0,
  listSelectionOutline: void 0,
  listFocusAndSelectionForeground: void 0,
  listFocusAndSelectionOutline: void 0,
  listInactiveFocusForeground: void 0,
  tableColumnsBorder: void 0,
  tableOddRowsBackgroundColor: void 0,
  treeIndentGuidesStroke: void 0,
  treeInactiveIndentGuidesStroke: void 0,
  treeStickyScrollBackground: void 0,
  treeStickyScrollBorder: void 0,
  treeStickyScrollShadow: void 0
};

function getSelectBoxStyles(override) {
  return overrideStyles(override, defaultSelectBoxStyles);
}

var defaultMenuStyles = {
  shadowColor: asCssVariable(widgetShadow),
  borderColor: asCssVariableWithDefault(menuBorder, editorWidgetBorder),
  foregroundColor: asCssVariable(menuForeground),
  backgroundColor: asCssVariable(menuBackground),
  selectionForegroundColor: asCssVariable(listHoverForeground),
  selectionBackgroundColor: asCssVariable(listHoverBackground),
  selectionBorderColor: asCssVariable(menuSelectionBorder),
  separatorColor: asCssVariable(menuSeparatorBackground),
  scrollbarShadow: asCssVariable(scrollbarShadow),
  scrollbarSliderBackground: asCssVariable(scrollbarSliderBackground),
  scrollbarSliderHoverBackground: asCssVariable(scrollbarSliderHoverBackground),
  scrollbarSliderActiveBackground: asCssVariable(scrollbarSliderActiveBackground)
};
export { overrideStyles, getInputBoxStyle, getListStyles, getSelectBoxStyles, defaultKeybindingLabelStyles, defaultButtonStyles, defaultProgressBarStyles, defaultToggleStyles, defaultRadioStyles, defaultCheckboxStyles, defaultDialogStyles, defaultInputBoxStyles, defaultFindWidgetStyles, defaultCountBadgeStyles, defaultBreadcrumbsWidgetStyles, defaultListStyles, defaultSelectBoxStyles, defaultMenuStyles };
