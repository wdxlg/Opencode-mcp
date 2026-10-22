// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/editor/common/services/editorWebWorkerMain.js
// Original module marker: src/vs/editor/common/services/unicodeTextModelHighlighter.ts
import { Searcher } from "./module-0045.mjs";
import { AmbiguousCharacters, InvisibleCharacters, escapeRegExpCharacters, isBasicASCII, isHighSurrogate } from "./module-0020.mjs";
import { DEFAULT_WORD_REGEXP, getWordAtText } from "./module-0046.mjs";
import { assertNever } from "./module-0006.mjs";
import { Range } from "./module-0028.mjs";


// src/vs/editor/common/services/unicodeTextModelHighlighter.ts
var UnicodeTextModelHighlighter = class {
  static computeUnicodeHighlights(model, options, range) {
    const startLine = range ? range.startLineNumber : 1;
    const endLine = range ? range.endLineNumber : model.getLineCount();
    const codePointHighlighter = new CodePointHighlighter(options);
    const candidates = codePointHighlighter.getCandidateCodePoints();
    let regex;
    if (candidates === "allNonBasicAscii") {
      regex = new RegExp("[^\\t\\n\\r\\x20-\\x7E]", "g");
    } else {
      regex = new RegExp(`${buildRegExpCharClassExpr(Array.from(candidates))}`, "g");
    }
    const searcher = new Searcher(null, regex);
    const ranges = [];
    let hasMore = false;
    let m;
    let ambiguousCharacterCount = 0;
    let invisibleCharacterCount = 0;
    let nonBasicAsciiCharacterCount = 0;
    forLoop:
      for (let lineNumber = startLine, lineCount = endLine; lineNumber <= lineCount; lineNumber++) {
        const lineContent = model.getLineContent(lineNumber);
        const lineLength = lineContent.length;
        searcher.reset(0);
        do {
          m = searcher.next(lineContent);
          if (m) {
            let startIndex = m.index;
            let endIndex = m.index + m[0].length;
            if (startIndex > 0) {
              const charCodeBefore = lineContent.charCodeAt(startIndex - 1);
              if (isHighSurrogate(charCodeBefore)) {
                startIndex--;
              }
            }
            if (endIndex + 1 < lineLength) {
              const charCodeBefore = lineContent.charCodeAt(endIndex - 1);
              if (isHighSurrogate(charCodeBefore)) {
                endIndex++;
              }
            }
            const str = lineContent.substring(startIndex, endIndex);
            let word = getWordAtText(startIndex + 1, DEFAULT_WORD_REGEXP, lineContent, 0);
            if (word && word.endColumn <= startIndex + 1) {
              word = null;
            }
            const highlightReason = codePointHighlighter.shouldHighlightNonBasicASCII(str, word ? word.word : null);
            if (highlightReason !== 0 /* None */) {
              if (highlightReason === 3 /* Ambiguous */) {
                ambiguousCharacterCount++;
              } else if (highlightReason === 2 /* Invisible */) {
                invisibleCharacterCount++;
              } else if (highlightReason === 1 /* NonBasicASCII */) {
                nonBasicAsciiCharacterCount++;
              } else {
                assertNever(highlightReason);
              }
              const MAX_RESULT_LENGTH = 1e3;
              if (ranges.length >= MAX_RESULT_LENGTH) {
                hasMore = true;
                break forLoop;
              }
              ranges.push(new Range(lineNumber, startIndex + 1, lineNumber, endIndex + 1));
            }
          }
        } while (m);
      }
    return {
      ranges,
      hasMore,
      ambiguousCharacterCount,
      invisibleCharacterCount,
      nonBasicAsciiCharacterCount
    };
  }
  static computeUnicodeHighlightReason(char, options) {
    const codePointHighlighter = new CodePointHighlighter(options);
    const reason = codePointHighlighter.shouldHighlightNonBasicASCII(char, null);
    switch (reason) {
      case 0 /* None */:
        return null;
      case 2 /* Invisible */:
        return { kind: 1 /* Invisible */ };
      case 3 /* Ambiguous */: {
        const codePoint = char.codePointAt(0);
        const primaryConfusable = codePointHighlighter.ambiguousCharacters.getPrimaryConfusable(codePoint);
        const notAmbiguousInLocales = AmbiguousCharacters.getLocales().filter(
          (l) => !AmbiguousCharacters.getInstance(
            /* @__PURE__ */ new Set([...options.allowedLocales, l])
          ).isAmbiguous(codePoint)
        );
        return { kind: 0 /* Ambiguous */, confusableWith: String.fromCodePoint(primaryConfusable), notAmbiguousInLocales };
      }
      case 1 /* NonBasicASCII */:
        return { kind: 2 /* NonBasicAscii */ };
    }
  }
};

function buildRegExpCharClassExpr(codePoints, flags) {
  const src = `[${escapeRegExpCharacters(
    codePoints.map((i) => String.fromCodePoint(i)).join("")
  )}]`;
  return src;
}

var CodePointHighlighter = class {
  constructor(options) {
    this.options = options;
    this.allowedCodePoints = new Set(options.allowedCodePoints);
    this.ambiguousCharacters = AmbiguousCharacters.getInstance(new Set(options.allowedLocales));
  }
  getCandidateCodePoints() {
    if (this.options.nonBasicASCII) {
      return "allNonBasicAscii";
    }
    const set = /* @__PURE__ */ new Set();
    if (this.options.invisibleCharacters) {
      for (const cp of InvisibleCharacters.codePoints) {
        if (!isAllowedInvisibleCharacter(String.fromCodePoint(cp))) {
          set.add(cp);
        }
      }
    }
    if (this.options.ambiguousCharacters) {
      for (const cp of this.ambiguousCharacters.getConfusableCodePoints()) {
        set.add(cp);
      }
    }
    for (const cp of this.allowedCodePoints) {
      set.delete(cp);
    }
    return set;
  }
  shouldHighlightNonBasicASCII(character, wordContext) {
    const codePoint = character.codePointAt(0);
    if (this.allowedCodePoints.has(codePoint)) {
      return 0 /* None */;
    }
    if (this.options.nonBasicASCII) {
      return 1 /* NonBasicASCII */;
    }
    let hasBasicASCIICharacters = false;
    let hasNonConfusableNonBasicAsciiCharacter = false;
    if (wordContext) {
      for (const char of wordContext) {
        const codePoint2 = char.codePointAt(0);
        const isBasicASCII2 = isBasicASCII(char);
        hasBasicASCIICharacters = hasBasicASCIICharacters || isBasicASCII2;
        if (!isBasicASCII2 && !this.ambiguousCharacters.isAmbiguous(codePoint2) && !InvisibleCharacters.isInvisibleCharacter(codePoint2)) {
          hasNonConfusableNonBasicAsciiCharacter = true;
        }
      }
    }
    if (
      /* Don't allow mixing weird looking characters with ASCII */
      !hasBasicASCIICharacters && /* Is there an obviously weird looking character? */
      hasNonConfusableNonBasicAsciiCharacter
    ) {
      return 0 /* None */;
    }
    if (this.options.invisibleCharacters) {
      if (!isAllowedInvisibleCharacter(character) && InvisibleCharacters.isInvisibleCharacter(codePoint)) {
        return 2 /* Invisible */;
      }
    }
    if (this.options.ambiguousCharacters) {
      if (this.ambiguousCharacters.isAmbiguous(codePoint)) {
        return 3 /* Ambiguous */;
      }
    }
    return 0 /* None */;
  }
};

function isAllowedInvisibleCharacter(character) {
  return character === " " || character === "\n" || character === "	";
}
export { buildRegExpCharClassExpr, isAllowedInvisibleCharacter, UnicodeTextModelHighlighter, CodePointHighlighter };
