// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/terminalStrings.ts



// src/vs/platform/terminal/common/terminalStrings.ts
function formatMessageForTerminal(message, options3 = {}) {
  let result = "";
  if (!options3.excludeLeadingNewLine) {
    result += "\r\n";
  }
  result += "\x1B[0m\x1B[7m * ";
  if (options3.loudFormatting) {
    result += "\x1B[0;104m";
  } else {
    result += "\x1B[0m";
  }
  result += ` ${message} \x1B[0m
\r`;
  return result;
}
export { formatMessageForTerminal };
