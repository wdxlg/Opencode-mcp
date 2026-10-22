// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputPlaceholderDecoration.ts
import { inputPlaceholderForeground } from "./module-0233.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputPlaceholderDecoration.ts
function getRangeForPlaceholder(editorRange) {
  return {
    startLineNumber: editorRange.startLineNumber,
    endLineNumber: editorRange.endLineNumber,
    startColumn: editorRange.endColumn + 1,
    endColumn: 1e3
  };
}

function getInputPlaceholderColor(themeService) {
  const theme = themeService.getColorTheme();
  const transparentForeground = theme.getColor(inputPlaceholderForeground);
  return transparentForeground?.toString();
}
export { getRangeForPlaceholder, getInputPlaceholderColor };
