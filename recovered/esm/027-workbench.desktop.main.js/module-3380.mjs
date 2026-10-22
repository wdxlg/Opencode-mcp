// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/clipboard/browser/terminalClipboard.ts
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { isString } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/clipboard/browser/terminalClipboard.ts
async function shouldPasteTerminalText(accessor, text2, bracketedPasteMode) {
  const configurationService = accessor.get(IConfigurationService);
  const dialogService = accessor.get(IDialogService);
  const textForLines = text2.split(/\r?\n/);
  if (textForLines.length === 1) {
    return true;
  }
  function parseConfigValue(value2) {
    if (isString(value2)) {
      if (value2 === "auto" || value2 === "always" || value2 === "never") {
        return value2;
      }
    }
    if (typeof value2 === "boolean") {
      return value2 ? "auto" : "never";
    }
    return "auto";
  }
  const configValue = parseConfigValue(configurationService.getValue("terminal.integrated.enableMultiLinePasteWarning" /* EnableMultiLinePasteWarning */));
  if (configValue === "never") {
    return true;
  }
  if (configValue === "auto") {
    if (bracketedPasteMode) {
      return true;
    }
    if (textForLines.length === 2 && textForLines[1].trim().length === 0) {
      return { modifiedText: textForLines[0] };
    }
  }
  const displayItemsCount = 3;
  const maxPreviewLineLength = 30;
  let detail2 = localize(20705, null);
  for (let i2 = 0; i2 < Math.min(textForLines.length, displayItemsCount); i2++) {
    const line = textForLines[i2];
    const cleanedLine = line.length > maxPreviewLineLength ? `${line.slice(0, maxPreviewLineLength)}\u2026` : line;
    detail2 += `
${cleanedLine}`;
  }
  if (textForLines.length > displayItemsCount) {
    detail2 += `
\u2026`;
  }
  const { result, checkboxChecked } = await dialogService.prompt({
    message: localize(20701, null, textForLines.length),
    detail: detail2,
    type: "warning",
    buttons: [
      {
        label: localize(20703, null),
        run: () => ({ confirmed: true, singleLine: false })
      },
      {
        label: localize(20704, null),
        run: () => ({ confirmed: true, singleLine: true })
      }
    ],
    cancelButton: true,
    checkbox: {
      label: localize(20702, null)
    }
  });
  if (!result) {
    return false;
  }
  if (result.confirmed && checkboxChecked) {
    await configurationService.updateValue("terminal.integrated.enableMultiLinePasteWarning" /* EnableMultiLinePasteWarning */, "never");
  }
  if (result.singleLine) {
    return { modifiedText: text2.replace(/\r?\n/g, "") };
  }
  return result.confirmed;
}
export { shouldPasteTerminalText };
