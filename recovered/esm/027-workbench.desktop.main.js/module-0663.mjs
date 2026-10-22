// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/comment/browser/comment.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { Range2 } from "./module-0106.mjs";
import { LineCommentCommand } from "./module-0662.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { MenuId } from "./module-0092.mjs";
import { KeyChord } from "./module-0019.mjs";
import { BlockCommentCommand } from "./module-0661.mjs";


// src/vs/editor/contrib/comment/browser/comment.ts
var CommentLineAction = class extends EditorAction {
  constructor(type, opts) {
    super(opts);
    this._type = type;
  }
  run(accessor, editor) {
    const languageConfigurationService = accessor.get(ILanguageConfigurationService);
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const commands = [];
    const modelOptions = model.getOptions();
    const commentsOptions = editor.getOption(29 /* comments */);
    const selections = editor.getSelections().map((selection, index2) => ({ selection, index: index2, ignoreFirstLine: false }));
    selections.sort((a, b) => Range2.compareRangesUsingStarts(a.selection, b.selection));
    let prev = selections[0];
    for (let i2 = 1; i2 < selections.length; i2++) {
      const curr = selections[i2];
      if (prev.selection.endLineNumber === curr.selection.startLineNumber) {
        if (prev.index < curr.index) {
          curr.ignoreFirstLine = true;
        } else {
          prev.ignoreFirstLine = true;
          prev = curr;
        }
      }
    }
    for (const selection of selections) {
      commands.push(new LineCommentCommand(
        languageConfigurationService,
        selection.selection,
        modelOptions.indentSize,
        this._type,
        commentsOptions.insertSpace,
        commentsOptions.ignoreEmptyLines,
        selection.ignoreFirstLine
      ));
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

var ToggleCommentLineAction = class extends CommentLineAction {
  constructor() {
    super(0 /* Toggle */, {
      id: "editor.action.commentLine",
      label: localize2(1069, "Toggle Line Comment"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 90 /* Slash */,
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarEditMenu,
        group: "5_insert",
        title: localize(1073, null),
        order: 1
      },
      canTriggerInlineEdits: true
    });
  }
};

var AddLineCommentAction = class extends CommentLineAction {
  constructor() {
    super(1 /* ForceAdd */, {
      id: "editor.action.addCommentLine",
      label: localize2(1070, "Add Line Comment"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 33 /* KeyC */),
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
};

var RemoveLineCommentAction = class extends CommentLineAction {
  constructor() {
    super(2 /* ForceRemove */, {
      id: "editor.action.removeCommentLine",
      label: localize2(1071, "Remove Line Comment"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 51 /* KeyU */),
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
};

var BlockCommentAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.blockComment",
      label: localize2(1068, "Toggle Block Comment"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 31 /* KeyA */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KeyA */ },
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarEditMenu,
        group: "5_insert",
        title: localize(1072, null),
        order: 2
      },
      canTriggerInlineEdits: true
    });
  }
  run(accessor, editor) {
    const languageConfigurationService = accessor.get(ILanguageConfigurationService);
    if (!editor.hasModel()) {
      return;
    }
    const commentsOptions = editor.getOption(29 /* comments */);
    const commands = [];
    const selections = editor.getSelections();
    for (const selection of selections) {
      commands.push(new BlockCommentCommand(selection, commentsOptions.insertSpace, languageConfigurationService));
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

registerEditorAction(ToggleCommentLineAction);

registerEditorAction(AddLineCommentAction);

registerEditorAction(RemoveLineCommentAction);

registerEditorAction(BlockCommentAction);
export { CommentLineAction, ToggleCommentLineAction, AddLineCommentAction, RemoveLineCommentAction, BlockCommentAction };
