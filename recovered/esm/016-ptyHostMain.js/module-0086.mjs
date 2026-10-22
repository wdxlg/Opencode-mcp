// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/common/terminalStrings.ts



// src/vs/platform/terminal/common/terminalStrings.ts
function formatMessageForTerminal(message, options = {}) {
  let result = "";
  if (!options.excludeLeadingNewLine) {
    result += "\r\n";
  }
  result += "\x1B[0m\x1B[7m * ";
  if (options.loudFormatting) {
    result += "\x1B[0;104m";
  } else {
    result += "\x1B[0m";
  }
  result += ` ${message} \x1B[0m
\r`;
  return result;
}
export { formatMessageForTerminal };
