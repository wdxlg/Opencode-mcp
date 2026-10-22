// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/common/smartSnippetInserter.ts
import { Position } from "./module-0079.mjs";
import { Range2 } from "./module-0106.mjs";
import { createScanner } from "./module-0883.mjs";


// src/vs/workbench/contrib/preferences/common/smartSnippetInserter.ts
var SmartSnippetInserter = class {
  static hasOpenBrace(scanner) {
    while (scanner.scan() !== 17 /* EOF */) {
      const kind = scanner.getToken();
      if (kind === 1 /* OpenBraceToken */) {
        return true;
      }
    }
    return false;
  }
  static offsetToPosition(model, offset) {
    let offsetBeforeLine = 0;
    const eolLength = model.getEOL().length;
    const lineCount = model.getLineCount();
    for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
      const lineTotalLength = model.getLineLength(lineNumber) + eolLength;
      const offsetAfterLine = offsetBeforeLine + lineTotalLength;
      if (offsetAfterLine > offset) {
        return new Position(
          lineNumber,
          offset - offsetBeforeLine + 1
        );
      }
      offsetBeforeLine = offsetAfterLine;
    }
    return new Position(
      lineCount,
      model.getLineMaxColumn(lineCount)
    );
  }
  static insertSnippet(model, _position) {
    const desiredPosition = model.getValueLengthInRange(new Range2(1, 1, _position.lineNumber, _position.column));
    let State7;
    ((State8) => {
      State8[State8["INVALID"] = 0] = "INVALID";
      State8[State8["AFTER_OBJECT"] = 1] = "AFTER_OBJECT";
      State8[State8["BEFORE_OBJECT"] = 2] = "BEFORE_OBJECT";
    })(State7 || (State7 = {}));
    let currentState = 0 /* INVALID */;
    let lastValidPos = -1;
    let lastValidState = 0 /* INVALID */;
    const scanner = createScanner(model.getValue());
    let arrayLevel = 0;
    let objLevel = 0;
    const checkRangeStatus = (pos, state) => {
      if (state !== 0 /* INVALID */ && arrayLevel === 1 && objLevel === 0) {
        currentState = state;
        lastValidPos = pos;
        lastValidState = state;
      } else {
        if (currentState !== 0 /* INVALID */) {
          currentState = 0 /* INVALID */;
          lastValidPos = scanner.getTokenOffset();
        }
      }
    };
    while (scanner.scan() !== 17 /* EOF */) {
      const currentPos = scanner.getPosition();
      const kind = scanner.getToken();
      let goodKind = false;
      switch (kind) {
        case 3 /* OpenBracketToken */:
          goodKind = true;
          arrayLevel++;
          checkRangeStatus(currentPos, 2 /* BEFORE_OBJECT */);
          break;
        case 4 /* CloseBracketToken */:
          goodKind = true;
          arrayLevel--;
          checkRangeStatus(currentPos, 0 /* INVALID */);
          break;
        case 5 /* CommaToken */:
          goodKind = true;
          checkRangeStatus(currentPos, 2 /* BEFORE_OBJECT */);
          break;
        case 1 /* OpenBraceToken */:
          goodKind = true;
          objLevel++;
          checkRangeStatus(currentPos, 0 /* INVALID */);
          break;
        case 2 /* CloseBraceToken */:
          goodKind = true;
          objLevel--;
          checkRangeStatus(currentPos, 1 /* AFTER_OBJECT */);
          break;
        case 15 /* Trivia */:
        case 14 /* LineBreakTrivia */:
          goodKind = true;
      }
      if (currentPos >= desiredPosition && (currentState !== 0 /* INVALID */ || lastValidPos !== -1)) {
        let acceptPosition;
        let acceptState;
        if (currentState !== 0 /* INVALID */) {
          acceptPosition = goodKind ? currentPos : scanner.getTokenOffset();
          acceptState = currentState;
        } else {
          acceptPosition = lastValidPos;
          acceptState = lastValidState;
        }
        if (acceptState === 1 /* AFTER_OBJECT */) {
          return {
            position: this.offsetToPosition(model, acceptPosition),
            prepend: ",",
            append: ""
          };
        } else {
          scanner.setPosition(acceptPosition);
          return {
            position: this.offsetToPosition(model, acceptPosition),
            prepend: "",
            append: this.hasOpenBrace(scanner) ? "," : ""
          };
        }
      }
    }
    const modelLineCount = model.getLineCount();
    return {
      position: new Position(modelLineCount, model.getLineMaxColumn(modelLineCount)),
      prepend: "\n[",
      append: "]"
    };
  }
};
export { SmartSnippetInserter };
