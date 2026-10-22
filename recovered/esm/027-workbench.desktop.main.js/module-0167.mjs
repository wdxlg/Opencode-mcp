// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languages/linkComputer.ts
import { CharacterClassifier } from "./module-0121.mjs";


// src/vs/editor/common/languages/linkComputer.ts
var Uint8Matrix = class {
  constructor(rows, cols, defaultValue) {
    const data = new Uint8Array(rows * cols);
    for (let i2 = 0, len = rows * cols; i2 < len; i2++) {
      data[i2] = defaultValue;
    }
    this._data = data;
    this.rows = rows;
    this.cols = cols;
  }
  get(row, col) {
    return this._data[row * this.cols + col];
  }
  set(row, col, value2) {
    this._data[row * this.cols + col] = value2;
  }
};

var StateMachine = class {
  constructor(edges) {
    let maxCharCode = 0;
    let maxState = 0 /* Invalid */;
    for (let i2 = 0, len = edges.length; i2 < len; i2++) {
      const [from, chCode, to] = edges[i2];
      if (chCode > maxCharCode) {
        maxCharCode = chCode;
      }
      if (from > maxState) {
        maxState = from;
      }
      if (to > maxState) {
        maxState = to;
      }
    }
    maxCharCode++;
    maxState++;
    const states = new Uint8Matrix(maxState, maxCharCode, 0 /* Invalid */);
    for (let i2 = 0, len = edges.length; i2 < len; i2++) {
      const [from, chCode, to] = edges[i2];
      states.set(from, chCode, to);
    }
    this._states = states;
    this._maxCharCode = maxCharCode;
  }
  nextState(currentState, chCode) {
    if (chCode < 0 || chCode >= this._maxCharCode) {
      return 0 /* Invalid */;
    }
    return this._states.get(currentState, chCode);
  }
};

var _stateMachine = null;

function getStateMachine() {
  if (_stateMachine === null) {
    _stateMachine = new StateMachine([
      [1 /* Start */, 104 /* h */, 2 /* H */],
      [1 /* Start */, 72 /* H */, 2 /* H */],
      [1 /* Start */, 102 /* f */, 6 /* F */],
      [1 /* Start */, 70 /* F */, 6 /* F */],
      [2 /* H */, 116 /* t */, 3 /* HT */],
      [2 /* H */, 84 /* T */, 3 /* HT */],
      [3 /* HT */, 116 /* t */, 4 /* HTT */],
      [3 /* HT */, 84 /* T */, 4 /* HTT */],
      [4 /* HTT */, 112 /* p */, 5 /* HTTP */],
      [4 /* HTT */, 80 /* P */, 5 /* HTTP */],
      [5 /* HTTP */, 115 /* s */, 9 /* BeforeColon */],
      [5 /* HTTP */, 83 /* S */, 9 /* BeforeColon */],
      [5 /* HTTP */, 58 /* Colon */, 10 /* AfterColon */],
      [6 /* F */, 105 /* i */, 7 /* FI */],
      [6 /* F */, 73 /* I */, 7 /* FI */],
      [7 /* FI */, 108 /* l */, 8 /* FIL */],
      [7 /* FI */, 76 /* L */, 8 /* FIL */],
      [8 /* FIL */, 101 /* e */, 9 /* BeforeColon */],
      [8 /* FIL */, 69 /* E */, 9 /* BeforeColon */],
      [9 /* BeforeColon */, 58 /* Colon */, 10 /* AfterColon */],
      [10 /* AfterColon */, 47 /* Slash */, 11 /* AlmostThere */],
      [11 /* AlmostThere */, 47 /* Slash */, 12 /* End */]
    ]);
  }
  return _stateMachine;
}

var _classifier = null;

function getClassifier() {
  if (_classifier === null) {
    _classifier = new CharacterClassifier(0 /* None */);
    const FORCE_TERMINATION_CHARACTERS = ` 	<>'"\u3001\u3002\uFF61\uFF64\uFF0C\uFF0E\uFF1A\uFF1B\u2018\u3008\u300C\u300E\u3014\uFF08\uFF3B\uFF5B\uFF62\uFF63\uFF5D\uFF3D\uFF09\u3015\u300F\u300D\u3009\u2019\uFF40\uFF5E\u2026|`;
    for (let i2 = 0; i2 < FORCE_TERMINATION_CHARACTERS.length; i2++) {
      _classifier.set(FORCE_TERMINATION_CHARACTERS.charCodeAt(i2), 1 /* ForceTermination */);
    }
    const CANNOT_END_WITH_CHARACTERS = ".,;:";
    for (let i2 = 0; i2 < CANNOT_END_WITH_CHARACTERS.length; i2++) {
      _classifier.set(CANNOT_END_WITH_CHARACTERS.charCodeAt(i2), 2 /* CannotEndIn */);
    }
  }
  return _classifier;
}

var LinkComputer = class _LinkComputer {
  static _createLink(classifier, line, lineNumber, linkBeginIndex, linkEndIndex) {
    let lastIncludedCharIndex = linkEndIndex - 1;
    do {
      const chCode = line.charCodeAt(lastIncludedCharIndex);
      const chClass = classifier.get(chCode);
      if (chClass !== 2 /* CannotEndIn */) {
        break;
      }
      lastIncludedCharIndex--;
    } while (lastIncludedCharIndex > linkBeginIndex);
    if (linkBeginIndex > 0) {
      const charCodeBeforeLink = line.charCodeAt(linkBeginIndex - 1);
      const lastCharCodeInLink = line.charCodeAt(lastIncludedCharIndex);
      if (charCodeBeforeLink === 40 /* OpenParen */ && lastCharCodeInLink === 41 /* CloseParen */ || charCodeBeforeLink === 91 /* OpenSquareBracket */ && lastCharCodeInLink === 93 /* CloseSquareBracket */ || charCodeBeforeLink === 123 /* OpenCurlyBrace */ && lastCharCodeInLink === 125 /* CloseCurlyBrace */) {
        lastIncludedCharIndex--;
      }
    }
    return {
      range: {
        startLineNumber: lineNumber,
        startColumn: linkBeginIndex + 1,
        endLineNumber: lineNumber,
        endColumn: lastIncludedCharIndex + 2
      },
      url: line.substring(linkBeginIndex, lastIncludedCharIndex + 1)
    };
  }
  static computeLinks(model, stateMachine = getStateMachine()) {
    const classifier = getClassifier();
    const result = [];
    for (let i2 = 1, lineCount = model.getLineCount(); i2 <= lineCount; i2++) {
      const line = model.getLineContent(i2);
      const len = line.length;
      let j = 0;
      let linkBeginIndex = 0;
      let linkBeginChCode = 0;
      let state = 1 /* Start */;
      let hasOpenParens = false;
      let hasOpenSquareBracket = false;
      let inSquareBrackets = false;
      let hasOpenCurlyBracket = false;
      while (j < len) {
        let resetStateMachine = false;
        const chCode = line.charCodeAt(j);
        if (state === 13 /* Accept */) {
          let chClass;
          switch (chCode) {
            case 40 /* OpenParen */:
              hasOpenParens = true;
              chClass = 0 /* None */;
              break;
            case 41 /* CloseParen */:
              chClass = hasOpenParens ? 0 /* None */ : 1 /* ForceTermination */;
              break;
            case 91 /* OpenSquareBracket */:
              inSquareBrackets = true;
              hasOpenSquareBracket = true;
              chClass = 0 /* None */;
              break;
            case 93 /* CloseSquareBracket */:
              inSquareBrackets = false;
              chClass = hasOpenSquareBracket ? 0 /* None */ : 1 /* ForceTermination */;
              break;
            case 123 /* OpenCurlyBrace */:
              hasOpenCurlyBracket = true;
              chClass = 0 /* None */;
              break;
            case 125 /* CloseCurlyBrace */:
              chClass = hasOpenCurlyBracket ? 0 /* None */ : 1 /* ForceTermination */;
              break;
            // The following three rules make it that ' or " or ` are allowed inside links
            // only if the link is wrapped by some other quote character
            case 39 /* SingleQuote */:
            case 34 /* DoubleQuote */:
            case 96 /* BackTick */:
              if (linkBeginChCode === chCode) {
                chClass = 1 /* ForceTermination */;
              } else if (linkBeginChCode === 39 /* SingleQuote */ || linkBeginChCode === 34 /* DoubleQuote */ || linkBeginChCode === 96 /* BackTick */) {
                chClass = 0 /* None */;
              } else {
                chClass = 1 /* ForceTermination */;
              }
              break;
            case 42 /* Asterisk */:
              chClass = linkBeginChCode === 42 /* Asterisk */ ? 1 /* ForceTermination */ : 0 /* None */;
              break;
            case 32 /* Space */:
              chClass = inSquareBrackets ? 0 /* None */ : 1 /* ForceTermination */;
              break;
            default:
              chClass = classifier.get(chCode);
          }
          if (chClass === 1 /* ForceTermination */) {
            result.push(_LinkComputer._createLink(classifier, line, i2, linkBeginIndex, j));
            resetStateMachine = true;
          }
        } else if (state === 12 /* End */) {
          let chClass;
          if (chCode === 91 /* OpenSquareBracket */) {
            hasOpenSquareBracket = true;
            chClass = 0 /* None */;
          } else {
            chClass = classifier.get(chCode);
          }
          if (chClass === 1 /* ForceTermination */) {
            resetStateMachine = true;
          } else {
            state = 13 /* Accept */;
          }
        } else {
          state = stateMachine.nextState(state, chCode);
          if (state === 0 /* Invalid */) {
            resetStateMachine = true;
          }
        }
        if (resetStateMachine) {
          state = 1 /* Start */;
          hasOpenParens = false;
          hasOpenSquareBracket = false;
          hasOpenCurlyBracket = false;
          linkBeginIndex = j + 1;
          linkBeginChCode = chCode;
        }
        j++;
      }
      if (state === 13 /* Accept */) {
        result.push(_LinkComputer._createLink(classifier, line, i2, linkBeginIndex, len));
      }
    }
    return result;
  }
};

function computeLinks(model) {
  if (!model || typeof model.getLineCount !== "function" || typeof model.getLineContent !== "function") {
    return [];
  }
  return LinkComputer.computeLinks(model);
}
export { getStateMachine, getClassifier, computeLinks, Uint8Matrix, StateMachine, _stateMachine, _classifier, LinkComputer };
