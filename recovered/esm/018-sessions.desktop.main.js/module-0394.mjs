// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/indentationGuesser.ts



// src/vs/editor/common/model/indentationGuesser.ts
var SpacesDiffResult = class {
  constructor() {
    this.spacesDiff = 0;
    this.looksLikeAlignment = false;
  }
};

function spacesDiff(a, aLength, b, bLength, result) {
  result.spacesDiff = 0;
  result.looksLikeAlignment = false;
  let i2;
  for (i2 = 0; i2 < aLength && i2 < bLength; i2++) {
    const aCharCode = a.charCodeAt(i2);
    const bCharCode = b.charCodeAt(i2);
    if (aCharCode !== bCharCode) {
      break;
    }
  }
  let aSpacesCnt = 0, aTabsCount = 0;
  for (let j = i2; j < aLength; j++) {
    const aCharCode = a.charCodeAt(j);
    if (aCharCode === 32 /* Space */) {
      aSpacesCnt++;
    } else {
      aTabsCount++;
    }
  }
  let bSpacesCnt = 0, bTabsCount = 0;
  for (let j = i2; j < bLength; j++) {
    const bCharCode = b.charCodeAt(j);
    if (bCharCode === 32 /* Space */) {
      bSpacesCnt++;
    } else {
      bTabsCount++;
    }
  }
  if (aSpacesCnt > 0 && aTabsCount > 0) {
    return;
  }
  if (bSpacesCnt > 0 && bTabsCount > 0) {
    return;
  }
  const tabsDiff = Math.abs(aTabsCount - bTabsCount);
  const spacesDiff2 = Math.abs(aSpacesCnt - bSpacesCnt);
  if (tabsDiff === 0) {
    result.spacesDiff = spacesDiff2;
    if (spacesDiff2 > 0 && 0 <= bSpacesCnt - 1 && bSpacesCnt - 1 < a.length && bSpacesCnt < b.length) {
      if (b.charCodeAt(bSpacesCnt) !== 32 /* Space */ && a.charCodeAt(bSpacesCnt - 1) === 32 /* Space */) {
        if (a.charCodeAt(a.length - 1) === 44 /* Comma */) {
          result.looksLikeAlignment = true;
        }
      }
    }
    return;
  }
  if (spacesDiff2 % tabsDiff === 0) {
    result.spacesDiff = spacesDiff2 / tabsDiff;
    return;
  }
}

function guessIndentation(source, defaultTabSize, defaultInsertSpaces) {
  const linesCount = Math.min(source.getLineCount(), 1e4);
  let linesIndentedWithTabsCount = 0;
  let linesIndentedWithSpacesCount = 0;
  let previousLineText = "";
  let previousLineIndentation = 0;
  const ALLOWED_TAB_SIZE_GUESSES = [2, 4, 6, 8, 3, 5, 7];
  const MAX_ALLOWED_TAB_SIZE_GUESS = 8;
  const spacesDiffCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const tmp = new SpacesDiffResult();
  for (let lineNumber = 1; lineNumber <= linesCount; lineNumber++) {
    const currentLineLength = source.getLineLength(lineNumber);
    const currentLineText = source.getLineContent(lineNumber);
    const useCurrentLineText = currentLineLength <= 65536;
    let currentLineHasContent = false;
    let currentLineIndentation = 0;
    let currentLineSpacesCount = 0;
    let currentLineTabsCount = 0;
    for (let j = 0, lenJ = currentLineLength; j < lenJ; j++) {
      const charCode = useCurrentLineText ? currentLineText.charCodeAt(j) : source.getLineCharCode(lineNumber, j);
      if (charCode === 9 /* Tab */) {
        currentLineTabsCount++;
      } else if (charCode === 32 /* Space */) {
        currentLineSpacesCount++;
      } else {
        currentLineHasContent = true;
        currentLineIndentation = j;
        break;
      }
    }
    if (!currentLineHasContent) {
      continue;
    }
    if (currentLineTabsCount > 0) {
      linesIndentedWithTabsCount++;
    } else if (currentLineSpacesCount > 1) {
      linesIndentedWithSpacesCount++;
    }
    spacesDiff(previousLineText, previousLineIndentation, currentLineText, currentLineIndentation, tmp);
    if (tmp.looksLikeAlignment) {
      if (!(defaultInsertSpaces && defaultTabSize === tmp.spacesDiff)) {
        continue;
      }
    }
    const currentSpacesDiff = tmp.spacesDiff;
    if (currentSpacesDiff <= MAX_ALLOWED_TAB_SIZE_GUESS) {
      spacesDiffCount[currentSpacesDiff]++;
    }
    previousLineText = currentLineText;
    previousLineIndentation = currentLineIndentation;
  }
  let insertSpaces = defaultInsertSpaces;
  if (linesIndentedWithTabsCount !== linesIndentedWithSpacesCount) {
    insertSpaces = linesIndentedWithTabsCount < linesIndentedWithSpacesCount;
  }
  let tabSize = defaultTabSize;
  if (insertSpaces) {
    let tabSizeScore = 0;
    ALLOWED_TAB_SIZE_GUESSES.forEach((possibleTabSize) => {
      const possibleTabSizeScore = spacesDiffCount[possibleTabSize];
      if (possibleTabSizeScore > tabSizeScore) {
        tabSizeScore = possibleTabSizeScore;
        tabSize = possibleTabSize;
      }
    });
    if (tabSize === 4 && spacesDiffCount[4] > 0 && spacesDiffCount[2] > 0 && spacesDiffCount[2] >= spacesDiffCount[4] * 2 / 3) {
      tabSize = 2;
    }
  }
  return {
    insertSpaces,
    tabSize
  };
}
export { spacesDiff, guessIndentation, SpacesDiffResult };
