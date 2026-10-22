// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursorTypeOperations.ts
import { ShiftCommand } from "./module-0148.mjs";
import { AutoClosingOpenCharTypeOperation, AutoClosingOvertypeOperation, AutoClosingOvertypeWithInterceptorsOperation, AutoIndentOperation, CompositionEndOvertypeOperation, CompositionOperation, EnterOperation, InterceptorElectricCharOperation, PasteOperation, SimpleCharacterTypeOperation, SurroundSelectionOperation, TabOperation, TypeWithoutInterceptorsOperation, shiftIndent, shouldSurroundChar, unshiftIndent } from "./module-0151.mjs";
import { EditOperationResult, isQuote } from "./module-0113.mjs";
import { CompositionSurroundSelectionCommand } from "./module-0149.mjs";


// src/vs/editor/common/cursor/cursorTypeOperations.ts
var TypeOperations = class {
  static indent(config, model, selections) {
    if (model === null || selections === null) {
      return [];
    }
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      commands[i2] = new ShiftCommand(selections[i2], {
        isUnshift: false,
        tabSize: config.tabSize,
        indentSize: config.indentSize,
        insertSpaces: config.insertSpaces,
        useTabStops: config.useTabStops,
        autoIndent: config.autoIndent
      }, config.languageConfigurationService);
    }
    return commands;
  }
  static outdent(config, model, selections) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      commands[i2] = new ShiftCommand(selections[i2], {
        isUnshift: true,
        tabSize: config.tabSize,
        indentSize: config.indentSize,
        insertSpaces: config.insertSpaces,
        useTabStops: config.useTabStops,
        autoIndent: config.autoIndent
      }, config.languageConfigurationService);
    }
    return commands;
  }
  static shiftIndent(config, indentation, count2) {
    return shiftIndent(config, indentation, count2);
  }
  static unshiftIndent(config, indentation, count2) {
    return unshiftIndent(config, indentation, count2);
  }
  static paste(config, model, selections, text2, pasteOnNewLine, multicursorText) {
    return PasteOperation.getEdits(config, model, selections, text2, pasteOnNewLine, multicursorText);
  }
  static tab(config, model, selections) {
    return TabOperation.getCommands(config, model, selections);
  }
  static compositionType(prevEditOperationType, config, model, selections, text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
    return CompositionOperation.getEdits(prevEditOperationType, config, model, selections, text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
  }
  /**
   * This is very similar with typing, but the character is already in the text buffer!
   */
  static compositionEndWithInterceptors(prevEditOperationType, config, model, compositions, selections, autoClosedCharacters) {
    if (!compositions) {
      return null;
    }
    let insertedText = null;
    for (const composition of compositions) {
      if (insertedText === null) {
        insertedText = composition.insertedText;
      } else if (insertedText !== composition.insertedText) {
        return null;
      }
    }
    if (!insertedText || insertedText.length !== 1) {
      return CompositionEndOvertypeOperation.getEdits(config, compositions);
    }
    const ch = insertedText;
    let hasDeletion = false;
    for (const composition of compositions) {
      if (composition.deletedText.length !== 0) {
        hasDeletion = true;
        break;
      }
    }
    if (hasDeletion) {
      if (!shouldSurroundChar(config, ch) || !config.surroundingPairs.hasOwnProperty(ch)) {
        return null;
      }
      const isTypingAQuoteCharacter = isQuote(ch);
      for (const composition of compositions) {
        if (composition.deletedSelectionStart !== 0 || composition.deletedSelectionEnd !== composition.deletedText.length) {
          return null;
        }
        if (/^[ \t]+$/.test(composition.deletedText)) {
          return null;
        }
        if (isTypingAQuoteCharacter && isQuote(composition.deletedText)) {
          return null;
        }
      }
      const positions = [];
      for (const selection of selections) {
        if (!selection.isEmpty()) {
          return null;
        }
        positions.push(selection.getPosition());
      }
      if (positions.length !== compositions.length) {
        return null;
      }
      const commands = [];
      for (let i2 = 0, len = positions.length; i2 < len; i2++) {
        commands.push(new CompositionSurroundSelectionCommand(positions[i2], compositions[i2].deletedText, config.surroundingPairs[ch]));
      }
      return new EditOperationResult(4 /* TypingOther */, commands, {
        shouldPushStackElementBefore: true,
        shouldPushStackElementAfter: false
      });
    }
    const autoClosingOvertypeEdits = AutoClosingOvertypeWithInterceptorsOperation.getEdits(config, model, selections, autoClosedCharacters, ch);
    if (autoClosingOvertypeEdits !== void 0) {
      return autoClosingOvertypeEdits;
    }
    const autoClosingOpenCharEdits = AutoClosingOpenCharTypeOperation.getEdits(config, model, selections, ch, true, false);
    if (autoClosingOpenCharEdits !== void 0) {
      return autoClosingOpenCharEdits;
    }
    return CompositionEndOvertypeOperation.getEdits(config, compositions);
  }
  static typeWithInterceptors(isDoingComposition, prevEditOperationType, config, model, selections, autoClosedCharacters, ch) {
    const enterEdits = EnterOperation.getEdits(config, model, selections, ch, isDoingComposition);
    if (enterEdits !== void 0) {
      return enterEdits;
    }
    const autoIndentEdits = AutoIndentOperation.getEdits(config, model, selections, ch, isDoingComposition);
    if (autoIndentEdits !== void 0) {
      return autoIndentEdits;
    }
    const autoClosingOverTypeEdits = AutoClosingOvertypeOperation.getEdits(prevEditOperationType, config, model, selections, autoClosedCharacters, ch);
    if (autoClosingOverTypeEdits !== void 0) {
      return autoClosingOverTypeEdits;
    }
    const autoClosingOpenCharEdits = AutoClosingOpenCharTypeOperation.getEdits(config, model, selections, ch, false, isDoingComposition);
    if (autoClosingOpenCharEdits !== void 0) {
      return autoClosingOpenCharEdits;
    }
    const surroundSelectionEdits = SurroundSelectionOperation.getEdits(config, model, selections, ch, isDoingComposition);
    if (surroundSelectionEdits !== void 0) {
      return surroundSelectionEdits;
    }
    const interceptorElectricCharOperation = InterceptorElectricCharOperation.getEdits(prevEditOperationType, config, model, selections, ch, isDoingComposition);
    if (interceptorElectricCharOperation !== void 0) {
      return interceptorElectricCharOperation;
    }
    return SimpleCharacterTypeOperation.getEdits(config, prevEditOperationType, selections, ch, isDoingComposition);
  }
  static typeWithoutInterceptors(prevEditOperationType, config, model, selections, str) {
    return TypeWithoutInterceptorsOperation.getEdits(prevEditOperationType, selections, str);
  }
};

var CompositionOutcome = class {
  constructor(deletedText, deletedSelectionStart, deletedSelectionEnd, insertedText, insertedSelectionStart, insertedSelectionEnd, insertedTextRange) {
    this.deletedText = deletedText;
    this.deletedSelectionStart = deletedSelectionStart;
    this.deletedSelectionEnd = deletedSelectionEnd;
    this.insertedText = insertedText;
    this.insertedSelectionStart = insertedSelectionStart;
    this.insertedSelectionEnd = insertedSelectionEnd;
    this.insertedTextRange = insertedTextRange;
  }
};
export { TypeOperations, CompositionOutcome };
