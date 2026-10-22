// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/wordPartOperations/browser/wordPartOperations.ts
import { DeleteWordCommand, MoveWordCommand } from "./module-0861.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { WordPartOperations } from "./module-0123.mjs";
import { Range2 } from "./module-0106.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { registerEditorCommand } from "./module-0097.mjs";


// src/vs/editor/contrib/wordPartOperations/browser/wordPartOperations.ts
var DeleteWordPartLeft = class extends DeleteWordCommand {
  constructor() {
    super({
      whitespaceHeuristics: true,
      wordNavigationType: 0 /* WordStart */,
      id: "deleteWordPartLeft",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 1 /* Backspace */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
  _delete(ctx, wordNavigationType) {
    const r2 = WordPartOperations.deleteWordPartLeft(ctx);
    if (r2) {
      return r2;
    }
    return new Range2(1, 1, 1, 1);
  }
};

var DeleteWordPartRight = class extends DeleteWordCommand {
  constructor() {
    super({
      whitespaceHeuristics: true,
      wordNavigationType: 2 /* WordEnd */,
      id: "deleteWordPartRight",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 20 /* Delete */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
  _delete(ctx, wordNavigationType) {
    const r2 = WordPartOperations.deleteWordPartRight(ctx);
    if (r2) {
      return r2;
    }
    const lineCount = ctx.model.getLineCount();
    const maxColumn = ctx.model.getLineMaxColumn(lineCount);
    return new Range2(lineCount, maxColumn, lineCount, maxColumn);
  }
};

var WordPartLeftCommand = class extends MoveWordCommand {
  _move(wordSeparators2, model, position2, wordNavigationType, hasMulticursor) {
    return WordPartOperations.moveWordPartLeft(wordSeparators2, model, position2, hasMulticursor);
  }
};

var CursorWordPartLeft = class extends WordPartLeftCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 0 /* WordStart */,
      id: "cursorWordPartLeft",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 15 /* LeftArrow */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

CommandsRegistry.registerCommandAlias("cursorWordPartStartLeft", "cursorWordPartLeft");

var CursorWordPartLeftSelect = class extends WordPartLeftCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 0 /* WordStart */,
      id: "cursorWordPartLeftSelect",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 1024 /* Shift */ | 15 /* LeftArrow */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

CommandsRegistry.registerCommandAlias("cursorWordPartStartLeftSelect", "cursorWordPartLeftSelect");

var WordPartRightCommand = class extends MoveWordCommand {
  _move(wordSeparators2, model, position2, wordNavigationType, hasMulticursor) {
    return WordPartOperations.moveWordPartRight(wordSeparators2, model, position2);
  }
};

var CursorWordPartRight = class extends WordPartRightCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 2 /* WordEnd */,
      id: "cursorWordPartRight",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 17 /* RightArrow */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

var CursorWordPartRightSelect = class extends WordPartRightCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 2 /* WordEnd */,
      id: "cursorWordPartRightSelect",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 1024 /* Shift */ | 17 /* RightArrow */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

registerEditorCommand(new DeleteWordPartLeft());

registerEditorCommand(new DeleteWordPartRight());

registerEditorCommand(new CursorWordPartLeft());

registerEditorCommand(new CursorWordPartLeftSelect());

registerEditorCommand(new CursorWordPartRight());

registerEditorCommand(new CursorWordPartRightSelect());
export { DeleteWordPartLeft, DeleteWordPartRight, WordPartLeftCommand, CursorWordPartLeft, CursorWordPartLeftSelect, WordPartRightCommand, CursorWordPartRight, CursorWordPartRightSelect };
