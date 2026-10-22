// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers.ts
import { posix, win32 } from "./module-0026.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers.ts
function convertLinkRangeToBuffer(lines, bufferWidth, range2, startLine) {
  const bufferRange = {
    start: {
      x: range2.startColumn,
      y: range2.startLineNumber + startLine
    },
    end: {
      x: range2.endColumn - 1,
      y: range2.endLineNumber + startLine
    }
  };
  let startOffset = 0;
  const startWrappedLineCount = Math.ceil(range2.startColumn / bufferWidth);
  for (let y = 0; y < Math.min(startWrappedLineCount); y++) {
    const lineLength = Math.min(bufferWidth, range2.startColumn - 1 - y * bufferWidth);
    let lineOffset = 0;
    const line = lines[y];
    if (!line) {
      break;
    }
    for (let x = 0; x < Math.min(bufferWidth, lineLength + lineOffset); x++) {
      const cell = line.getCell(x);
      if (!cell) {
        break;
      }
      const width2 = cell.getWidth();
      if (width2 === 2) {
        lineOffset++;
      }
      const char = cell.getChars();
      if (char.length > 1) {
        lineOffset -= char.length - 1;
      }
    }
    startOffset += lineOffset;
  }
  let endOffset = 0;
  const endWrappedLineCount = Math.ceil(range2.endColumn / bufferWidth);
  for (let y = Math.max(0, startWrappedLineCount - 1); y < endWrappedLineCount; y++) {
    const start = y === startWrappedLineCount - 1 ? (range2.startColumn - 1 + startOffset) % bufferWidth : 0;
    const lineLength = Math.min(bufferWidth, range2.endColumn + startOffset - y * bufferWidth);
    let lineOffset = 0;
    const line = lines[y];
    if (!line) {
      break;
    }
    for (let x = start; x < Math.min(bufferWidth, lineLength + lineOffset); x++) {
      const cell = line.getCell(x);
      if (!cell) {
        break;
      }
      const width2 = cell.getWidth();
      const chars = cell.getChars();
      if (width2 === 2) {
        lineOffset++;
      }
      if (x === bufferWidth - 1 && chars === "") {
        lineOffset++;
      }
      if (chars.length > 1) {
        lineOffset -= chars.length - 1;
      }
    }
    endOffset += lineOffset;
  }
  bufferRange.start.x += startOffset;
  bufferRange.end.x += startOffset + endOffset;
  while (bufferRange.start.x > bufferWidth) {
    bufferRange.start.x -= bufferWidth;
    bufferRange.start.y++;
  }
  while (bufferRange.end.x > bufferWidth) {
    bufferRange.end.x -= bufferWidth;
    bufferRange.end.y++;
  }
  return bufferRange;
}

function convertBufferRangeToViewport(bufferRange, viewportY) {
  return {
    start: {
      x: bufferRange.start.x - 1,
      y: bufferRange.start.y - viewportY - 1
    },
    end: {
      x: bufferRange.end.x - 1,
      y: bufferRange.end.y - viewportY - 1
    }
  };
}

function getXtermLineContent3(buffer, lineStart, lineEnd, cols) {
  const maxLineLength = Math.max(2048, cols * 2);
  lineEnd = Math.min(lineEnd, lineStart + maxLineLength);
  let content = "";
  for (let i2 = lineStart; i2 <= lineEnd; i2++) {
    const line = buffer.getLine(i2);
    if (line) {
      content += line.translateToString(true, 0, cols);
    }
  }
  return content;
}

function getXtermRangesByAttr(buffer, lineStart, lineEnd, cols) {
  let bufferRangeStart = void 0;
  let lastFgAttr = -1;
  let lastBgAttr = -1;
  const ranges = [];
  for (let y = lineStart; y <= lineEnd; y++) {
    const line = buffer.getLine(y);
    if (!line) {
      continue;
    }
    for (let x = 0; x < cols; x++) {
      const cell = line.getCell(x);
      if (!cell) {
        break;
      }
      const thisFgAttr = cell.isBold() | cell.isInverse() | cell.isStrikethrough() | cell.isUnderline();
      const thisBgAttr = cell.isDim() | cell.isItalic();
      if (lastFgAttr === -1 || lastBgAttr === -1) {
        bufferRangeStart = { x, y };
      } else {
        if (lastFgAttr !== thisFgAttr || lastBgAttr !== thisBgAttr) {
          const bufferRangeEnd = { x, y };
          ranges.push({
            start: bufferRangeStart,
            end: bufferRangeEnd
          });
          bufferRangeStart = { x, y };
        }
      }
      lastFgAttr = thisFgAttr;
      lastBgAttr = thisBgAttr;
    }
  }
  return ranges;
}

function updateLinkWithRelativeCwd(capabilities, y, text2, osPath, logService) {
  const cwd2 = capabilities.get(2 /* CommandDetection */)?.getCwdForLine(y);
  logService.trace("terminalLinkHelpers#updateLinkWithRelativeCwd cwd", cwd2);
  if (!cwd2) {
    return void 0;
  }
  const result = [];
  const sep2 = osPath.sep;
  if (!text2.includes(sep2)) {
    result.push(osPath.resolve(cwd2 + sep2 + text2));
  } else {
    let commonDirs = 0;
    let i2 = 0;
    const cwdPath = cwd2.split(sep2).reverse();
    const linkPath = text2.split(sep2);
    while (i2 < cwdPath.length) {
      result.push(osPath.resolve(cwd2 + sep2 + linkPath.slice(commonDirs).join(sep2)));
      if (cwdPath[i2] === linkPath[i2]) {
        commonDirs++;
      } else {
        break;
      }
      i2++;
    }
  }
  return result;
}

function osPathModule(os) {
  return os === 1 /* Windows */ ? win32 : posix;
}
export { convertLinkRangeToBuffer, convertBufferRangeToViewport, getXtermLineContent3, getXtermRangesByAttr, updateLinkWithRelativeCwd, osPathModule };
