// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/outputHelpers.ts



// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/outputHelpers.ts
var MAX_OUTPUT_LENGTH = 2e4;

var PREVIEW_CHARS = 500;

function truncateLargeOutput(output, filePath) {
  const totalLength = output.length;
  const previewEnd = Math.min(PREVIEW_CHARS, totalLength);
  const preview = output.slice(0, previewEnd);
  const sizeKB = Math.ceil(totalLength / 1024);
  let header2;
  if (filePath) {
    header2 = `[Output too large (${sizeKB}KB). Full output saved to: ${filePath}]
[Use readFile or grep to examine the full output.]

`;
  } else {
    header2 = `[Output too large (${sizeKB}KB). Showing preview and tail.]

`;
  }
  const separator2 = "\n\n[... middle of output truncated ...]\n\n";
  const availableForTail = MAX_OUTPUT_LENGTH - header2.length - preview.length - separator2.length;
  if (availableForTail <= 0) {
    return (header2 + preview).slice(0, MAX_OUTPUT_LENGTH);
  }
  const tail2 = output.slice(-availableForTail);
  return header2 + preview + separator2 + tail2;
}

function getRawOutput(instance2, startMarker, options3) {
  if (!instance2.xterm || !instance2.xterm.raw) {
    return "";
  }
  const buffer = instance2.xterm.raw.buffer.active;
  let startLine = Math.max(startMarker?.line ?? 0, 0);
  while (startLine > 0 && buffer.getLine(startLine)?.isWrapped) {
    startLine--;
  }
  const endLine = buffer.length;
  const lines = [];
  let currentLine = "";
  for (let y = startLine; y < endLine; y++) {
    const line = buffer.getLine(y);
    if (!line) {
      continue;
    }
    const isWrapped = !!buffer.getLine(y + 1)?.isWrapped;
    currentLine += line.translateToString(!isWrapped);
    if (!isWrapped) {
      lines.push(currentLine);
      currentLine = "";
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  const output = lines.join("\n");
  if (options3?.lastNLines !== void 0) {
    const nonEmpty = output.split("\n").filter((line) => line.trim().length > 0);
    return nonEmpty.slice(-options3.lastNLines).join("\n");
  }
  return output;
}

function getOutput(instance2, startMarker, options3) {
  return getRawOutput(instance2, startMarker, options3);
}
export { truncateLargeOutput, getRawOutput, getOutput, MAX_OUTPUT_LENGTH, PREVIEW_CHARS };
