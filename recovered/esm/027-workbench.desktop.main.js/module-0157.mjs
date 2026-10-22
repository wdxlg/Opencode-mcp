// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/coreCommands.ts
import { Command, EditorCommand, RedoCommand, SelectAllCommand, UndoCommand, registerEditorCommand } from "./module-0097.mjs";
import { isBoolean, isNumber, isObject, isString, isUndefined } from "./module-0010.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { getActiveElement, isEditableElement } from "./module-0075.mjs";
import { CursorMove, CursorMoveCommands } from "./module-0124.mjs";
import { CursorState } from "./module-0113.mjs";
import { Position } from "./module-0079.mjs";
import { ColumnSelection } from "./module-0114.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { localize } from "./module-0001.mjs";
import { status } from "./module-0076.mjs";
import { Range2 } from "./module-0106.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { EnterOperation } from "./module-0151.mjs";
import { TypeOperations } from "./module-0152.mjs";
import { DeleteOperations } from "./module-0119.mjs";


// src/vs/editor/browser/coreCommands.ts
var CORE_WEIGHT = 0 /* EditorCore */;

var CoreEditorCommand = class extends EditorCommand {
  runEditorCommand(accessor, editor, args2) {
    const viewModel = editor._getViewModel();
    if (!viewModel) {
      return;
    }
    this.runCoreEditorCommand(viewModel, args2 || {});
  }
};

var EditorScroll_;

((EditorScroll_2) => {
  const isEditorScrollArgs = function(arg) {
    if (!isObject(arg)) {
      return false;
    }
    const scrollArg = arg;
    if (!isString(scrollArg.to)) {
      return false;
    }
    if (!isUndefined(scrollArg.by) && !isString(scrollArg.by)) {
      return false;
    }
    if (!isUndefined(scrollArg.value) && !isNumber(scrollArg.value)) {
      return false;
    }
    if (!isUndefined(scrollArg.revealCursor) && !isBoolean(scrollArg.revealCursor)) {
      return false;
    }
    return true;
  };
  EditorScroll_2.metadata = {
    description: "Scroll editor in the given direction",
    args: [
      {
        name: "Editor scroll argument object",
        description: `Property-value pairs that can be passed through this argument:
					* 'to': A mandatory direction value.
						\`\`\`
						'up', 'down'
						\`\`\`
					* 'by': Unit to move. Default is computed based on 'to' value.
						\`\`\`
						'line', 'wrappedLine', 'page', 'halfPage', 'editor'
						\`\`\`
					* 'value': Number of units to move. Default is '1'.
					* 'revealCursor': If 'true' reveals the cursor if it is outside view port.
				`,
        constraint: isEditorScrollArgs,
        schema: {
          "type": "object",
          "required": ["to"],
          "properties": {
            "to": {
              "type": "string",
              "enum": ["up", "down"]
            },
            "by": {
              "type": "string",
              "enum": ["line", "wrappedLine", "page", "halfPage", "editor"]
            },
            "value": {
              "type": "number",
              "default": 1
            },
            "revealCursor": {
              "type": "boolean"
            }
          }
        }
      }
    ]
  };
  EditorScroll_2.RawDirection = {
    Up: "up",
    Right: "right",
    Down: "down",
    Left: "left"
  };
  EditorScroll_2.RawUnit = {
    Line: "line",
    WrappedLine: "wrappedLine",
    Page: "page",
    HalfPage: "halfPage",
    Editor: "editor",
    Column: "column"
  };
  function parse14(args2) {
    let direction;
    switch (args2.to) {
      case EditorScroll_2.RawDirection.Up:
        direction = 1 /* Up */;
        break;
      case EditorScroll_2.RawDirection.Right:
        direction = 2 /* Right */;
        break;
      case EditorScroll_2.RawDirection.Down:
        direction = 3 /* Down */;
        break;
      case EditorScroll_2.RawDirection.Left:
        direction = 4 /* Left */;
        break;
      default:
        return null;
    }
    let unit;
    switch (args2.by) {
      case EditorScroll_2.RawUnit.Line:
        unit = 1 /* Line */;
        break;
      case EditorScroll_2.RawUnit.WrappedLine:
        unit = 2 /* WrappedLine */;
        break;
      case EditorScroll_2.RawUnit.Page:
        unit = 3 /* Page */;
        break;
      case EditorScroll_2.RawUnit.HalfPage:
        unit = 4 /* HalfPage */;
        break;
      case EditorScroll_2.RawUnit.Editor:
        unit = 5 /* Editor */;
        break;
      case EditorScroll_2.RawUnit.Column:
        unit = 6 /* Column */;
        break;
      default:
        unit = 2 /* WrappedLine */;
    }
    const value2 = Math.floor(args2.value || 1);
    const revealCursor = !!args2.revealCursor;
    return {
      direction,
      unit,
      value: value2,
      revealCursor,
      select: !!args2.select
    };
  }
  EditorScroll_2.parse = parse14;
  let Direction4;
  ((Direction5) => {
    Direction5[Direction5["Up"] = 1] = "Up";
    Direction5[Direction5["Right"] = 2] = "Right";
    Direction5[Direction5["Down"] = 3] = "Down";
    Direction5[Direction5["Left"] = 4] = "Left";
  })(Direction4 = EditorScroll_2.Direction || (EditorScroll_2.Direction = {}));
  let Unit;
  ((Unit2) => {
    Unit2[Unit2["Line"] = 1] = "Line";
    Unit2[Unit2["WrappedLine"] = 2] = "WrappedLine";
    Unit2[Unit2["Page"] = 3] = "Page";
    Unit2[Unit2["HalfPage"] = 4] = "HalfPage";
    Unit2[Unit2["Editor"] = 5] = "Editor";
    Unit2[Unit2["Column"] = 6] = "Column";
  })(Unit = EditorScroll_2.Unit || (EditorScroll_2.Unit = {}));
})(EditorScroll_ || (EditorScroll_ = {}));

var RevealLine_;

((RevealLine_2) => {
  const isRevealLineArgs = function(arg) {
    if (!isObject(arg)) {
      return false;
    }
    const reveaLineArg = arg;
    if (!isNumber(reveaLineArg.lineNumber) && !isString(reveaLineArg.lineNumber)) {
      return false;
    }
    if (!isUndefined(reveaLineArg.at) && !isString(reveaLineArg.at)) {
      return false;
    }
    return true;
  };
  RevealLine_2.metadata = {
    description: "Reveal the given line at the given logical position",
    args: [
      {
        name: "Reveal line argument object",
        description: `Property-value pairs that can be passed through this argument:
					* 'lineNumber': A mandatory line number value.
					* 'at': Logical position at which line has to be revealed.
						\`\`\`
						'top', 'center', 'bottom'
						\`\`\`
				`,
        constraint: isRevealLineArgs,
        schema: {
          "type": "object",
          "required": ["lineNumber"],
          "properties": {
            "lineNumber": {
              "type": ["number", "string"]
            },
            "at": {
              "type": "string",
              "enum": ["top", "center", "bottom"]
            }
          }
        }
      }
    ]
  };
  RevealLine_2.RawAtArgument = {
    Top: "top",
    Center: "center",
    Bottom: "bottom"
  };
})(RevealLine_ || (RevealLine_ = {}));

var EditorOrNativeTextInputCommand = class {
  constructor(target) {
    target.addImplementation(1e4, "code-editor", (accessor, args2) => {
      const focusedEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
      if (focusedEditor && focusedEditor.hasTextFocus()) {
        return this._runEditorCommand(accessor, focusedEditor, args2);
      }
      return false;
    });
    target.addImplementation(1e3, "generic-dom-input-textarea", (accessor, args2) => {
      const activeElement = getActiveElement();
      if (activeElement && isEditableElement(activeElement)) {
        this.runDOMCommand(activeElement);
        return true;
      }
      return false;
    });
    target.addImplementation(0, "generic-dom", (accessor, args2) => {
      const activeEditor = accessor.get(ICodeEditorService).getActiveCodeEditor();
      if (activeEditor) {
        activeEditor.focus();
        return this._runEditorCommand(accessor, activeEditor, args2);
      }
      return false;
    });
  }
  _runEditorCommand(accessor, editor, args2) {
    const result = this.runEditorCommand(accessor, editor, args2);
    if (result) {
      return result;
    }
    return true;
  }
};

var CoreNavigationCommands;

((CoreNavigationCommands2) => {
  class BaseMoveToCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      if (!args2.position) {
        return;
      }
      viewModel.model.pushStackElement();
      const cursorStateChanged = viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        [
          CursorMoveCommands.moveTo(viewModel, viewModel.getPrimaryCursorState(), this._inSelectionMode, args2.position, args2.viewPosition)
        ]
      );
      if (cursorStateChanged && args2.revealType !== 2 /* None */) {
        viewModel.revealAllCursors(args2.source, true, true);
      }
    }
  }
  CoreNavigationCommands2.MoveTo = registerEditorCommand(new BaseMoveToCommand({
    id: "_moveTo",
    inSelectionMode: false,
    precondition: void 0
  }));
  CoreNavigationCommands2.MoveToSelect = registerEditorCommand(new BaseMoveToCommand({
    id: "_moveToSelect",
    inSelectionMode: true,
    precondition: void 0
  }));
  class ColumnSelectCommand extends CoreEditorCommand {
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      const result = this._getColumnSelectResult(viewModel, viewModel.getPrimaryCursorState(), viewModel.getCursorColumnSelectData(), args2);
      if (result === null) {
        return;
      }
      viewModel.setCursorStates(args2.source, 3 /* Explicit */, result.viewStates.map((viewState) => CursorState.fromViewState(viewState)));
      viewModel.setCursorColumnSelectData({
        isReal: true,
        fromViewLineNumber: result.fromLineNumber,
        fromViewVisualColumn: result.fromVisualColumn,
        toViewLineNumber: result.toLineNumber,
        toViewVisualColumn: result.toVisualColumn
      });
      if (result.reversed) {
        viewModel.revealTopMostCursor(args2.source);
      } else {
        viewModel.revealBottomMostCursor(args2.source);
      }
    }
  }
  CoreNavigationCommands2.ColumnSelect = registerEditorCommand(new class extends ColumnSelectCommand {
    constructor() {
      super({
        id: "columnSelect",
        precondition: void 0
      });
    }
    _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args2) {
      if (typeof args2.position === "undefined" || typeof args2.viewPosition === "undefined" || typeof args2.mouseColumn === "undefined") {
        return null;
      }
      const validatedPosition = viewModel.model.validatePosition(args2.position);
      const validatedViewPosition = viewModel.coordinatesConverter.validateViewPosition(new Position(args2.viewPosition.lineNumber, args2.viewPosition.column), validatedPosition);
      const fromViewLineNumber = args2.doColumnSelect ? prevColumnSelectData.fromViewLineNumber : validatedViewPosition.lineNumber;
      const fromViewVisualColumn = args2.doColumnSelect ? prevColumnSelectData.fromViewVisualColumn : args2.mouseColumn - 1;
      return ColumnSelection.columnSelect(viewModel.cursorConfig, viewModel, fromViewLineNumber, fromViewVisualColumn, validatedViewPosition.lineNumber, args2.mouseColumn - 1);
    }
  }());
  CoreNavigationCommands2.CursorColumnSelectLeft = registerEditorCommand(new class extends ColumnSelectCommand {
    constructor() {
      super({
        id: "cursorColumnSelectLeft",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 15 /* LeftArrow */,
          linux: { primary: 0 }
        }
      });
    }
    _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args2) {
      return ColumnSelection.columnSelectLeft(viewModel.cursorConfig, viewModel, prevColumnSelectData);
    }
  }());
  CoreNavigationCommands2.CursorColumnSelectRight = registerEditorCommand(new class extends ColumnSelectCommand {
    constructor() {
      super({
        id: "cursorColumnSelectRight",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 17 /* RightArrow */,
          linux: { primary: 0 }
        }
      });
    }
    _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args2) {
      return ColumnSelection.columnSelectRight(viewModel.cursorConfig, viewModel, prevColumnSelectData);
    }
  }());
  class ColumnSelectUpCommand extends ColumnSelectCommand {
    constructor(opts) {
      super(opts);
      this._isPaged = opts.isPaged;
    }
    _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args2) {
      return ColumnSelection.columnSelectUp(viewModel.cursorConfig, viewModel, prevColumnSelectData, this._isPaged);
    }
  }
  CoreNavigationCommands2.CursorColumnSelectUp = registerEditorCommand(new ColumnSelectUpCommand({
    isPaged: false,
    id: "cursorColumnSelectUp",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 16 /* UpArrow */,
      linux: { primary: 0 }
    }
  }));
  CoreNavigationCommands2.CursorColumnSelectPageUp = registerEditorCommand(new ColumnSelectUpCommand({
    isPaged: true,
    id: "cursorColumnSelectPageUp",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 11 /* PageUp */,
      linux: { primary: 0 }
    }
  }));
  class ColumnSelectDownCommand extends ColumnSelectCommand {
    constructor(opts) {
      super(opts);
      this._isPaged = opts.isPaged;
    }
    _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args2) {
      return ColumnSelection.columnSelectDown(viewModel.cursorConfig, viewModel, prevColumnSelectData, this._isPaged);
    }
  }
  CoreNavigationCommands2.CursorColumnSelectDown = registerEditorCommand(new ColumnSelectDownCommand({
    isPaged: false,
    id: "cursorColumnSelectDown",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 18 /* DownArrow */,
      linux: { primary: 0 }
    }
  }));
  CoreNavigationCommands2.CursorColumnSelectPageDown = registerEditorCommand(new ColumnSelectDownCommand({
    isPaged: true,
    id: "cursorColumnSelectPageDown",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 12 /* PageDown */,
      linux: { primary: 0 }
    }
  }));
  class CursorMoveImpl extends CoreEditorCommand {
    constructor() {
      super({
        id: "cursorMove",
        precondition: void 0,
        metadata: CursorMove.metadata
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      const parsed = CursorMove.parse(args2);
      if (!parsed) {
        return;
      }
      this._runCursorMove(viewModel, args2.source, parsed);
    }
    _runCursorMove(viewModel, source, args2) {
      const effectiveSource = args2.noHistory ? "api" /* PROGRAMMATIC */ : source;
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        effectiveSource,
        3 /* Explicit */,
        CursorMoveImpl._move(viewModel, viewModel.getCursorStates(), args2)
      );
      viewModel.revealAllCursors(effectiveSource, true);
    }
    static _move(viewModel, cursors, args2) {
      const inSelectionMode = args2.select;
      const value2 = args2.value;
      switch (args2.direction) {
        case CursorMove.Direction.Left:
        case CursorMove.Direction.Right:
        case CursorMove.Direction.Up:
        case CursorMove.Direction.Down:
        case CursorMove.Direction.PrevBlankLine:
        case CursorMove.Direction.NextBlankLine:
        case CursorMove.Direction.WrappedLineStart:
        case CursorMove.Direction.WrappedLineFirstNonWhitespaceCharacter:
        case CursorMove.Direction.WrappedLineColumnCenter:
        case CursorMove.Direction.WrappedLineEnd:
        case CursorMove.Direction.WrappedLineLastNonWhitespaceCharacter:
          return CursorMoveCommands.simpleMove(viewModel, cursors, args2.direction, inSelectionMode, value2, args2.unit);
        case CursorMove.Direction.ViewPortTop:
        case CursorMove.Direction.ViewPortBottom:
        case CursorMove.Direction.ViewPortCenter:
        case CursorMove.Direction.ViewPortIfOutside:
          return CursorMoveCommands.viewportMove(viewModel, cursors, args2.direction, inSelectionMode, value2);
        default:
          return null;
      }
    }
  }
  CoreNavigationCommands2.CursorMoveImpl = CursorMoveImpl;
  CoreNavigationCommands2.CursorMove = registerEditorCommand(new CursorMoveImpl());
  let Constants3;
  ((Constants4) => {
    Constants4[Constants4["PAGE_SIZE_MARKER"] = -1] = "PAGE_SIZE_MARKER";
  })(Constants3 || (Constants3 = {}));
  class CursorMoveBasedCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._staticArgs = opts.args;
    }
    runCoreEditorCommand(viewModel, dynamicArgs) {
      let args2 = this._staticArgs;
      if (this._staticArgs.value === -1 /* PAGE_SIZE_MARKER */) {
        args2 = {
          direction: this._staticArgs.direction,
          unit: this._staticArgs.unit,
          select: this._staticArgs.select,
          value: dynamicArgs.pageSize || viewModel.cursorConfig.pageSize
        };
      }
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        dynamicArgs.source,
        3 /* Explicit */,
        CursorMoveCommands.simpleMove(viewModel, viewModel.getCursorStates(), args2.direction, args2.select, args2.value, args2.unit)
      );
      viewModel.revealAllCursors(dynamicArgs.source, true);
    }
  }
  CoreNavigationCommands2.CursorLeft = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Left,
      unit: CursorMove.Unit.None,
      select: false,
      value: 1
    },
    id: "cursorLeft",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 15 /* LeftArrow */,
      mac: { primary: 15 /* LeftArrow */, secondary: [256 /* WinCtrl */ | 32 /* KeyB */] }
    }
  }));
  CoreNavigationCommands2.CursorLeftSelect = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Left,
      unit: CursorMove.Unit.None,
      select: true,
      value: 1
    },
    id: "cursorLeftSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 1024 /* Shift */ | 15 /* LeftArrow */
    }
  }));
  CoreNavigationCommands2.CursorRight = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Right,
      unit: CursorMove.Unit.None,
      select: false,
      value: 1
    },
    id: "cursorRight",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 17 /* RightArrow */,
      mac: { primary: 17 /* RightArrow */, secondary: [256 /* WinCtrl */ | 36 /* KeyF */] }
    }
  }));
  CoreNavigationCommands2.CursorRightSelect = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Right,
      unit: CursorMove.Unit.None,
      select: true,
      value: 1
    },
    id: "cursorRightSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 1024 /* Shift */ | 17 /* RightArrow */
    }
  }));
  CoreNavigationCommands2.CursorUp = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Up,
      unit: CursorMove.Unit.WrappedLine,
      select: false,
      value: 1
    },
    id: "cursorUp",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 16 /* UpArrow */,
      mac: { primary: 16 /* UpArrow */, secondary: [256 /* WinCtrl */ | 46 /* KeyP */] }
    }
  }));
  CoreNavigationCommands2.CursorUpSelect = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Up,
      unit: CursorMove.Unit.WrappedLine,
      select: true,
      value: 1
    },
    id: "cursorUpSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 1024 /* Shift */ | 16 /* UpArrow */,
      secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */],
      mac: { primary: 1024 /* Shift */ | 16 /* UpArrow */ },
      linux: { primary: 1024 /* Shift */ | 16 /* UpArrow */ }
    }
  }));
  CoreNavigationCommands2.CursorPageUp = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Up,
      unit: CursorMove.Unit.WrappedLine,
      select: false,
      value: -1 /* PAGE_SIZE_MARKER */
    },
    id: "cursorPageUp",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 11 /* PageUp */
    }
  }));
  CoreNavigationCommands2.CursorPageUpSelect = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Up,
      unit: CursorMove.Unit.WrappedLine,
      select: true,
      value: -1 /* PAGE_SIZE_MARKER */
    },
    id: "cursorPageUpSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 1024 /* Shift */ | 11 /* PageUp */
    }
  }));
  CoreNavigationCommands2.CursorDown = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Down,
      unit: CursorMove.Unit.WrappedLine,
      select: false,
      value: 1
    },
    id: "cursorDown",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 18 /* DownArrow */,
      mac: { primary: 18 /* DownArrow */, secondary: [256 /* WinCtrl */ | 44 /* KeyN */] }
    }
  }));
  CoreNavigationCommands2.CursorDownSelect = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Down,
      unit: CursorMove.Unit.WrappedLine,
      select: true,
      value: 1
    },
    id: "cursorDownSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 1024 /* Shift */ | 18 /* DownArrow */,
      secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */],
      mac: { primary: 1024 /* Shift */ | 18 /* DownArrow */ },
      linux: { primary: 1024 /* Shift */ | 18 /* DownArrow */ }
    }
  }));
  CoreNavigationCommands2.CursorPageDown = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Down,
      unit: CursorMove.Unit.WrappedLine,
      select: false,
      value: -1 /* PAGE_SIZE_MARKER */
    },
    id: "cursorPageDown",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 12 /* PageDown */
    }
  }));
  CoreNavigationCommands2.CursorPageDownSelect = registerEditorCommand(new CursorMoveBasedCommand({
    args: {
      direction: CursorMove.Direction.Down,
      unit: CursorMove.Unit.WrappedLine,
      select: true,
      value: -1 /* PAGE_SIZE_MARKER */
    },
    id: "cursorPageDownSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 1024 /* Shift */ | 12 /* PageDown */
    }
  }));
  CoreNavigationCommands2.CreateCursor = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "createCursor",
        precondition: void 0
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      if (!args2.position) {
        return;
      }
      let newState;
      if (args2.wholeLine) {
        newState = CursorMoveCommands.line(viewModel, viewModel.getPrimaryCursorState(), false, args2.position, args2.viewPosition);
      } else {
        newState = CursorMoveCommands.moveTo(viewModel, viewModel.getPrimaryCursorState(), false, args2.position, args2.viewPosition);
      }
      const states = viewModel.getCursorStates();
      if (states.length > 1) {
        const newModelPosition = newState.modelState ? newState.modelState.position : null;
        const newViewPosition = newState.viewState ? newState.viewState.position : null;
        for (let i2 = 0, len = states.length; i2 < len; i2++) {
          const state = states[i2];
          if (newModelPosition && !state.modelState.selection.containsPosition(newModelPosition)) {
            continue;
          }
          if (newViewPosition && !state.viewState.selection.containsPosition(newViewPosition)) {
            continue;
          }
          states.splice(i2, 1);
          viewModel.model.pushStackElement();
          viewModel.setCursorStates(
            args2.source,
            3 /* Explicit */,
            states
          );
          return;
        }
      }
      states.push(newState);
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        states
      );
    }
  }());
  CoreNavigationCommands2.LastCursorMoveToSelect = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "_lastCursorMoveToSelect",
        precondition: void 0
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      if (!args2.position) {
        return;
      }
      const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
      const states = viewModel.getCursorStates();
      const newStates = states.slice(0);
      newStates[lastAddedCursorIndex] = CursorMoveCommands.moveTo(viewModel, states[lastAddedCursorIndex], true, args2.position, args2.viewPosition);
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        newStates
      );
    }
  }());
  class HomeCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        CursorMoveCommands.moveToBeginningOfLine(viewModel, viewModel.getCursorStates(), this._inSelectionMode)
      );
      viewModel.revealAllCursors(args2.source, true);
    }
  }
  CoreNavigationCommands2.CursorHome = registerEditorCommand(new HomeCommand({
    inSelectionMode: false,
    id: "cursorHome",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 14 /* Home */,
      mac: { primary: 14 /* Home */, secondary: [2048 /* CtrlCmd */ | 15 /* LeftArrow */] }
    }
  }));
  CoreNavigationCommands2.CursorHomeSelect = registerEditorCommand(new HomeCommand({
    inSelectionMode: true,
    id: "cursorHomeSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 1024 /* Shift */ | 14 /* Home */,
      mac: { primary: 1024 /* Shift */ | 14 /* Home */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */] }
    }
  }));
  class LineStartCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        this._exec(viewModel.getCursorStates())
      );
      viewModel.revealAllCursors(args2.source, true);
    }
    _exec(cursors) {
      const result = [];
      for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
        const cursor = cursors[i2];
        const lineNumber = cursor.modelState.position.lineNumber;
        result[i2] = CursorState.fromModelState(cursor.modelState.move(this._inSelectionMode, lineNumber, 1, 0));
      }
      return result;
    }
  }
  CoreNavigationCommands2.CursorLineStart = registerEditorCommand(new LineStartCommand({
    inSelectionMode: false,
    id: "cursorLineStart",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 0,
      mac: { primary: 256 /* WinCtrl */ | 31 /* KeyA */ }
    }
  }));
  CoreNavigationCommands2.CursorLineStartSelect = registerEditorCommand(new LineStartCommand({
    inSelectionMode: true,
    id: "cursorLineStartSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 0,
      mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 31 /* KeyA */ }
    }
  }));
  class EndCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        CursorMoveCommands.moveToEndOfLine(viewModel, viewModel.getCursorStates(), this._inSelectionMode, args2.sticky || false)
      );
      viewModel.revealAllCursors(args2.source, true);
    }
  }
  CoreNavigationCommands2.CursorEnd = registerEditorCommand(new EndCommand({
    inSelectionMode: false,
    id: "cursorEnd",
    precondition: void 0,
    kbOpts: {
      args: { sticky: false },
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 13 /* End */,
      mac: { primary: 13 /* End */, secondary: [2048 /* CtrlCmd */ | 17 /* RightArrow */] }
    },
    metadata: {
      description: `Go to End`,
      args: [{
        name: "args",
        schema: {
          type: "object",
          properties: {
            "sticky": {
              description: localize(182, null),
              type: "boolean",
              default: false
            }
          }
        }
      }]
    }
  }));
  CoreNavigationCommands2.CursorEndSelect = registerEditorCommand(new EndCommand({
    inSelectionMode: true,
    id: "cursorEndSelect",
    precondition: void 0,
    kbOpts: {
      args: { sticky: false },
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 1024 /* Shift */ | 13 /* End */,
      mac: { primary: 1024 /* Shift */ | 13 /* End */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */] }
    },
    metadata: {
      description: `Select to End`,
      args: [{
        name: "args",
        schema: {
          type: "object",
          properties: {
            "sticky": {
              description: localize(182, null),
              type: "boolean",
              default: false
            }
          }
        }
      }]
    }
  }));
  class LineEndCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        this._exec(viewModel, viewModel.getCursorStates())
      );
      viewModel.revealAllCursors(args2.source, true);
    }
    _exec(viewModel, cursors) {
      const result = [];
      for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
        const cursor = cursors[i2];
        const lineNumber = cursor.modelState.position.lineNumber;
        const maxColumn = viewModel.model.getLineMaxColumn(lineNumber);
        result[i2] = CursorState.fromModelState(cursor.modelState.move(this._inSelectionMode, lineNumber, maxColumn, 0));
      }
      return result;
    }
  }
  CoreNavigationCommands2.CursorLineEnd = registerEditorCommand(new LineEndCommand({
    inSelectionMode: false,
    id: "cursorLineEnd",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 0,
      mac: { primary: 256 /* WinCtrl */ | 35 /* KeyE */ }
    }
  }));
  CoreNavigationCommands2.CursorLineEndSelect = registerEditorCommand(new LineEndCommand({
    inSelectionMode: true,
    id: "cursorLineEndSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 0,
      mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 35 /* KeyE */ }
    }
  }));
  class TopCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        CursorMoveCommands.moveToBeginningOfBuffer(viewModel, viewModel.getCursorStates(), this._inSelectionMode)
      );
      viewModel.revealAllCursors(args2.source, true);
    }
  }
  CoreNavigationCommands2.CursorTop = registerEditorCommand(new TopCommand({
    inSelectionMode: false,
    id: "cursorTop",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 2048 /* CtrlCmd */ | 14 /* Home */,
      mac: { primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */ }
    }
  }));
  CoreNavigationCommands2.CursorTopSelect = registerEditorCommand(new TopCommand({
    inSelectionMode: true,
    id: "cursorTopSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 14 /* Home */,
      mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */ }
    }
  }));
  class BottomCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        CursorMoveCommands.moveToEndOfBuffer(viewModel, viewModel.getCursorStates(), this._inSelectionMode)
      );
      viewModel.revealAllCursors(args2.source, true);
    }
  }
  CoreNavigationCommands2.CursorBottom = registerEditorCommand(new BottomCommand({
    inSelectionMode: false,
    id: "cursorBottom",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 2048 /* CtrlCmd */ | 13 /* End */,
      mac: { primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */ }
    }
  }));
  CoreNavigationCommands2.CursorBottomSelect = registerEditorCommand(new BottomCommand({
    inSelectionMode: true,
    id: "cursorBottomSelect",
    precondition: void 0,
    kbOpts: {
      weight: CORE_WEIGHT,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 13 /* End */,
      mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */ }
    }
  }));
  class EditorScrollImpl extends CoreEditorCommand {
    constructor() {
      super({
        id: "editorScroll",
        precondition: void 0,
        metadata: EditorScroll_.metadata
      });
    }
    determineScrollMethod(args2) {
      const horizontalUnits = [6 /* Column */];
      const verticalUnits = [
        1 /* Line */,
        2 /* WrappedLine */,
        3 /* Page */,
        4 /* HalfPage */,
        5 /* Editor */
      ];
      const horizontalDirections = [4 /* Left */, 2 /* Right */];
      const verticalDirections = [1 /* Up */, 3 /* Down */];
      if (horizontalUnits.includes(args2.unit) && horizontalDirections.includes(args2.direction)) {
        return this._runHorizontalEditorScroll.bind(this);
      }
      if (verticalUnits.includes(args2.unit) && verticalDirections.includes(args2.direction)) {
        return this._runVerticalEditorScroll.bind(this);
      }
      return null;
    }
    runCoreEditorCommand(viewModel, args2) {
      const parsed = EditorScroll_.parse(args2);
      if (!parsed) {
        return;
      }
      const runEditorScroll = this.determineScrollMethod(parsed);
      if (!runEditorScroll) {
        return;
      }
      runEditorScroll(viewModel, args2.source, parsed);
    }
    _runVerticalEditorScroll(viewModel, source, args2) {
      const desiredScrollTop = this._computeDesiredScrollTop(viewModel, args2);
      if (args2.revealCursor) {
        const desiredVisibleViewRange = viewModel.getCompletelyVisibleViewRangeAtScrollTop(desiredScrollTop);
        const paddedRange = viewModel.getViewRangeWithCursorPadding(desiredVisibleViewRange);
        viewModel.setCursorStates(
          source,
          3 /* Explicit */,
          [
            CursorMoveCommands.findPositionInViewportIfOutside(viewModel, viewModel.getPrimaryCursorState(), paddedRange, args2.select)
          ]
        );
      }
      viewModel.viewLayout.setScrollPosition({ scrollTop: desiredScrollTop }, 0 /* Smooth */);
    }
    _computeDesiredScrollTop(viewModel, args2) {
      if (args2.unit === 1 /* Line */) {
        const futureViewport = viewModel.viewLayout.getFutureViewport();
        const visibleViewRange = viewModel.getCompletelyVisibleViewRangeAtScrollTop(futureViewport.top);
        const visibleModelRange = viewModel.coordinatesConverter.convertViewRangeToModelRange(visibleViewRange);
        let desiredTopModelLineNumber;
        if (args2.direction === 1 /* Up */) {
          desiredTopModelLineNumber = Math.max(1, visibleModelRange.startLineNumber - args2.value);
        } else {
          desiredTopModelLineNumber = Math.min(viewModel.model.getLineCount(), visibleModelRange.startLineNumber + args2.value);
        }
        const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(new Position(desiredTopModelLineNumber, 1));
        return viewModel.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber);
      }
      if (args2.unit === 5 /* Editor */) {
        let desiredTopModelLineNumber = 0;
        if (args2.direction === 3 /* Down */) {
          desiredTopModelLineNumber = viewModel.model.getLineCount() - viewModel.cursorConfig.pageSize;
        }
        return viewModel.viewLayout.getVerticalOffsetForLineNumber(desiredTopModelLineNumber);
      }
      let noOfLines;
      if (args2.unit === 3 /* Page */) {
        noOfLines = viewModel.cursorConfig.pageSize * args2.value;
      } else if (args2.unit === 4 /* HalfPage */) {
        noOfLines = Math.round(viewModel.cursorConfig.pageSize / 2) * args2.value;
      } else {
        noOfLines = args2.value;
      }
      const deltaLines = (args2.direction === 1 /* Up */ ? -1 : 1) * noOfLines;
      return viewModel.viewLayout.getCurrentScrollTop() + deltaLines * viewModel.cursorConfig.lineHeight;
    }
    _runHorizontalEditorScroll(viewModel, source, args2) {
      const desiredScrollLeft = this._computeDesiredScrollLeft(viewModel, args2);
      viewModel.viewLayout.setScrollPosition({ scrollLeft: desiredScrollLeft }, 0 /* Smooth */);
    }
    _computeDesiredScrollLeft(viewModel, args2) {
      const deltaColumns = (args2.direction === 4 /* Left */ ? -1 : 1) * args2.value;
      return viewModel.viewLayout.getCurrentScrollLeft() + deltaColumns * viewModel.cursorConfig.typicalHalfwidthCharacterWidth;
    }
  }
  CoreNavigationCommands2.EditorScrollImpl = EditorScrollImpl;
  CoreNavigationCommands2.EditorScroll = registerEditorCommand(new EditorScrollImpl());
  CoreNavigationCommands2.ScrollLineUp = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "scrollLineUp",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
          mac: { primary: 256 /* WinCtrl */ | 11 /* PageUp */ }
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      CoreNavigationCommands2.EditorScroll.runCoreEditorCommand(viewModel, {
        to: EditorScroll_.RawDirection.Up,
        by: EditorScroll_.RawUnit.WrappedLine,
        value: 1,
        revealCursor: false,
        select: false,
        source: args2.source
      });
    }
  }());
  CoreNavigationCommands2.ScrollPageUp = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "scrollPageUp",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 2048 /* CtrlCmd */ | 11 /* PageUp */,
          win: { primary: 512 /* Alt */ | 11 /* PageUp */ },
          linux: { primary: 512 /* Alt */ | 11 /* PageUp */ }
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      CoreNavigationCommands2.EditorScroll.runCoreEditorCommand(viewModel, {
        to: EditorScroll_.RawDirection.Up,
        by: EditorScroll_.RawUnit.Page,
        value: 1,
        revealCursor: false,
        select: false,
        source: args2.source
      });
    }
  }());
  CoreNavigationCommands2.ScrollEditorTop = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "scrollEditorTop",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      CoreNavigationCommands2.EditorScroll.runCoreEditorCommand(viewModel, {
        to: EditorScroll_.RawDirection.Up,
        by: EditorScroll_.RawUnit.Editor,
        value: 1,
        revealCursor: false,
        select: false,
        source: args2.source
      });
    }
  }());
  CoreNavigationCommands2.ScrollLineDown = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "scrollLineDown",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
          mac: { primary: 256 /* WinCtrl */ | 12 /* PageDown */ }
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      CoreNavigationCommands2.EditorScroll.runCoreEditorCommand(viewModel, {
        to: EditorScroll_.RawDirection.Down,
        by: EditorScroll_.RawUnit.WrappedLine,
        value: 1,
        revealCursor: false,
        select: false,
        source: args2.source
      });
    }
  }());
  CoreNavigationCommands2.ScrollPageDown = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "scrollPageDown",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 2048 /* CtrlCmd */ | 12 /* PageDown */,
          win: { primary: 512 /* Alt */ | 12 /* PageDown */ },
          linux: { primary: 512 /* Alt */ | 12 /* PageDown */ }
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      CoreNavigationCommands2.EditorScroll.runCoreEditorCommand(viewModel, {
        to: EditorScroll_.RawDirection.Down,
        by: EditorScroll_.RawUnit.Page,
        value: 1,
        revealCursor: false,
        select: false,
        source: args2.source
      });
    }
  }());
  CoreNavigationCommands2.ScrollEditorBottom = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "scrollEditorBottom",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      CoreNavigationCommands2.EditorScroll.runCoreEditorCommand(viewModel, {
        to: EditorScroll_.RawDirection.Down,
        by: EditorScroll_.RawUnit.Editor,
        value: 1,
        revealCursor: false,
        select: false,
        source: args2.source
      });
    }
  }());
  CoreNavigationCommands2.ScrollLeft = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "scrollLeft",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      CoreNavigationCommands2.EditorScroll.runCoreEditorCommand(viewModel, {
        to: EditorScroll_.RawDirection.Left,
        by: EditorScroll_.RawUnit.Column,
        value: 2,
        revealCursor: false,
        select: false,
        source: args2.source
      });
    }
  }());
  CoreNavigationCommands2.ScrollRight = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "scrollRight",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      CoreNavigationCommands2.EditorScroll.runCoreEditorCommand(viewModel, {
        to: EditorScroll_.RawDirection.Right,
        by: EditorScroll_.RawUnit.Column,
        value: 2,
        revealCursor: false,
        select: false,
        source: args2.source
      });
    }
  }());
  class WordCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      if (!args2.position) {
        return;
      }
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        [
          CursorMoveCommands.word(viewModel, viewModel.getPrimaryCursorState(), this._inSelectionMode, args2.position)
        ]
      );
      if (args2.revealType !== 2 /* None */) {
        viewModel.revealAllCursors(args2.source, true, true);
      }
    }
  }
  CoreNavigationCommands2.WordSelect = registerEditorCommand(new WordCommand({
    inSelectionMode: false,
    id: "_wordSelect",
    precondition: void 0
  }));
  CoreNavigationCommands2.WordSelectDrag = registerEditorCommand(new WordCommand({
    inSelectionMode: true,
    id: "_wordSelectDrag",
    precondition: void 0
  }));
  CoreNavigationCommands2.LastCursorWordSelect = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "lastCursorWordSelect",
        precondition: void 0
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      if (!args2.position) {
        return;
      }
      const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
      const states = viewModel.getCursorStates();
      const newStates = states.slice(0);
      const lastAddedState = states[lastAddedCursorIndex];
      newStates[lastAddedCursorIndex] = CursorMoveCommands.word(viewModel, lastAddedState, lastAddedState.modelState.hasSelection(), args2.position);
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        newStates
      );
    }
  }());
  class LineCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      if (!args2.position) {
        return;
      }
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        [
          CursorMoveCommands.line(viewModel, viewModel.getPrimaryCursorState(), this._inSelectionMode, args2.position, args2.viewPosition)
        ]
      );
      if (args2.revealType !== 2 /* None */) {
        viewModel.revealAllCursors(args2.source, false, true);
      }
    }
  }
  CoreNavigationCommands2.LineSelect = registerEditorCommand(new LineCommand({
    inSelectionMode: false,
    id: "_lineSelect",
    precondition: void 0
  }));
  CoreNavigationCommands2.LineSelectDrag = registerEditorCommand(new LineCommand({
    inSelectionMode: true,
    id: "_lineSelectDrag",
    precondition: void 0
  }));
  class LastCursorLineCommand extends CoreEditorCommand {
    constructor(opts) {
      super(opts);
      this._inSelectionMode = opts.inSelectionMode;
    }
    runCoreEditorCommand(viewModel, args2) {
      if (!args2.position) {
        return;
      }
      const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
      const states = viewModel.getCursorStates();
      const newStates = states.slice(0);
      newStates[lastAddedCursorIndex] = CursorMoveCommands.line(viewModel, states[lastAddedCursorIndex], this._inSelectionMode, args2.position, args2.viewPosition);
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        newStates
      );
    }
  }
  CoreNavigationCommands2.LastCursorLineSelect = registerEditorCommand(new LastCursorLineCommand({
    inSelectionMode: false,
    id: "lastCursorLineSelect",
    precondition: void 0
  }));
  CoreNavigationCommands2.LastCursorLineSelectDrag = registerEditorCommand(new LastCursorLineCommand({
    inSelectionMode: true,
    id: "lastCursorLineSelectDrag",
    precondition: void 0
  }));
  CoreNavigationCommands2.CancelSelection = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "cancelSelection",
        precondition: EditorContextKeys.hasNonEmptySelection,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 9 /* Escape */,
          secondary: [1024 /* Shift */ | 9 /* Escape */]
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        [
          CursorMoveCommands.cancelSelection(viewModel, viewModel.getPrimaryCursorState())
        ]
      );
      viewModel.revealAllCursors(args2.source, true);
    }
  }());
  CoreNavigationCommands2.RemoveSecondaryCursors = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "removeSecondaryCursors",
        precondition: EditorContextKeys.hasMultipleSelections,
        kbOpts: {
          weight: CORE_WEIGHT + 1,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 9 /* Escape */,
          secondary: [1024 /* Shift */ | 9 /* Escape */]
        }
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        [
          viewModel.getPrimaryCursorState()
        ]
      );
      viewModel.revealAllCursors(args2.source, true);
      status(localize(181, null));
    }
  }());
  CoreNavigationCommands2.RevealLine = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "revealLine",
        precondition: void 0,
        metadata: RevealLine_.metadata
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      const revealLineArg = args2;
      const lineNumberArg = revealLineArg.lineNumber || 0;
      let lineNumber = typeof lineNumberArg === "number" ? lineNumberArg + 1 : parseInt(lineNumberArg) + 1;
      if (lineNumber < 1) {
        lineNumber = 1;
      }
      const lineCount = viewModel.model.getLineCount();
      if (lineNumber > lineCount) {
        lineNumber = lineCount;
      }
      const range2 = new Range2(
        lineNumber,
        1,
        lineNumber,
        viewModel.model.getLineMaxColumn(lineNumber)
      );
      let revealAt = 0 /* Simple */;
      if (revealLineArg.at) {
        switch (revealLineArg.at) {
          case RevealLine_.RawAtArgument.Top:
            revealAt = 3 /* Top */;
            break;
          case RevealLine_.RawAtArgument.Center:
            revealAt = 1 /* Center */;
            break;
          case RevealLine_.RawAtArgument.Bottom:
            revealAt = 4 /* Bottom */;
            break;
          default:
            break;
        }
      }
      const viewRange = viewModel.coordinatesConverter.convertModelRangeToViewRange(range2);
      viewModel.revealRange(args2.source, false, viewRange, revealAt, 0 /* Smooth */);
    }
  }());
  CoreNavigationCommands2.SelectAll = new class extends EditorOrNativeTextInputCommand {
    constructor() {
      super(SelectAllCommand);
    }
    runDOMCommand(activeElement) {
      if (isFirefox2) {
        activeElement.focus();
        activeElement.select();
      }
      activeElement.ownerDocument.execCommand("selectAll");
    }
    runEditorCommand(accessor, editor, args2) {
      const viewModel = editor._getViewModel();
      if (!viewModel) {
        return;
      }
      this.runCoreEditorCommand(viewModel, args2);
    }
    runCoreEditorCommand(viewModel, args2) {
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        "keyboard",
        3 /* Explicit */,
        [
          CursorMoveCommands.selectAll(viewModel, viewModel.getPrimaryCursorState())
        ]
      );
    }
  }();
  CoreNavigationCommands2.SetSelection = registerEditorCommand(new class extends CoreEditorCommand {
    constructor() {
      super({
        id: "setSelection",
        precondition: void 0
      });
    }
    runCoreEditorCommand(viewModel, args2) {
      if (!args2.selection) {
        return;
      }
      viewModel.model.pushStackElement();
      viewModel.setCursorStates(
        args2.source,
        3 /* Explicit */,
        [
          CursorState.fromModelSelection(args2.selection)
        ]
      );
    }
  }());
})(CoreNavigationCommands || (CoreNavigationCommands = {}));

var columnSelectionCondition = ContextKeyExpr.and(
  EditorContextKeys.textInputFocus,
  EditorContextKeys.columnSelection
);

function registerColumnSelection(id2, keybinding) {
  KeybindingsRegistry.registerKeybindingRule({
    id: id2,
    primary: keybinding,
    when: columnSelectionCondition,
    weight: CORE_WEIGHT + 1
  });
}

registerColumnSelection(CoreNavigationCommands.CursorColumnSelectLeft.id, 1024 /* Shift */ | 15 /* LeftArrow */);

registerColumnSelection(CoreNavigationCommands.CursorColumnSelectRight.id, 1024 /* Shift */ | 17 /* RightArrow */);

registerColumnSelection(CoreNavigationCommands.CursorColumnSelectUp.id, 1024 /* Shift */ | 16 /* UpArrow */);

registerColumnSelection(CoreNavigationCommands.CursorColumnSelectPageUp.id, 1024 /* Shift */ | 11 /* PageUp */);

registerColumnSelection(CoreNavigationCommands.CursorColumnSelectDown.id, 1024 /* Shift */ | 18 /* DownArrow */);

registerColumnSelection(CoreNavigationCommands.CursorColumnSelectPageDown.id, 1024 /* Shift */ | 12 /* PageDown */);

function registerCommand2(command4) {
  command4.register();
  return command4;
}

var CoreEditingCommands;

((CoreEditingCommands2) => {
  class CoreEditingCommand extends EditorCommand {
    runEditorCommand(accessor, editor, args2) {
      const viewModel = editor._getViewModel();
      if (!viewModel) {
        return;
      }
      this.runCoreEditingCommand(editor, viewModel, args2 || {});
    }
  }
  CoreEditingCommands2.CoreEditingCommand = CoreEditingCommand;
  CoreEditingCommands2.LineBreakInsert = registerEditorCommand(new class extends CoreEditingCommand {
    constructor() {
      super({
        id: "lineBreakInsert",
        precondition: EditorContextKeys.writable,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 0,
          mac: { primary: 256 /* WinCtrl */ | 45 /* KeyO */ }
        }
      });
    }
    runCoreEditingCommand(editor, viewModel, args2) {
      editor.pushUndoStop();
      editor.executeCommands(this.id, EnterOperation.lineBreakInsert(viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map((s) => s.modelState.selection)));
    }
  }());
  CoreEditingCommands2.Outdent = registerEditorCommand(new class extends CoreEditingCommand {
    constructor() {
      super({
        id: "outdent",
        precondition: EditorContextKeys.writable,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: ContextKeyExpr.and(
            EditorContextKeys.editorTextFocus,
            EditorContextKeys.tabDoesNotMoveFocus
          ),
          primary: 1024 /* Shift */ | 2 /* Tab */
        }
      });
    }
    runCoreEditingCommand(editor, viewModel, args2) {
      editor.pushUndoStop();
      editor.executeCommands(this.id, TypeOperations.outdent(viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map((s) => s.modelState.selection)));
      editor.pushUndoStop();
    }
  }());
  CoreEditingCommands2.Tab = registerEditorCommand(new class extends CoreEditingCommand {
    constructor() {
      super({
        id: "tab",
        precondition: EditorContextKeys.writable,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: ContextKeyExpr.and(
            EditorContextKeys.editorTextFocus,
            EditorContextKeys.tabDoesNotMoveFocus
          ),
          primary: 2 /* Tab */
        }
      });
    }
    runCoreEditingCommand(editor, viewModel, args2) {
      editor.pushUndoStop();
      editor.executeCommands(this.id, TypeOperations.tab(viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map((s) => s.modelState.selection)));
      editor.pushUndoStop();
    }
  }());
  CoreEditingCommands2.DeleteLeft = registerEditorCommand(new class extends CoreEditingCommand {
    constructor() {
      super({
        id: "deleteLeft",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 1 /* Backspace */,
          secondary: [1024 /* Shift */ | 1 /* Backspace */],
          mac: { primary: 1 /* Backspace */, secondary: [1024 /* Shift */ | 1 /* Backspace */, 256 /* WinCtrl */ | 38 /* KeyH */, 256 /* WinCtrl */ | 1 /* Backspace */] }
        }
      });
    }
    runCoreEditingCommand(editor, viewModel, args2) {
      const [shouldPushStackElementBefore, commands] = DeleteOperations.deleteLeft(viewModel.getPrevEditOperationType(), viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map((s) => s.modelState.selection), viewModel.getCursorAutoClosedCharacters());
      if (shouldPushStackElementBefore) {
        editor.pushUndoStop();
      }
      editor.executeCommands(this.id, commands);
      viewModel.setPrevEditOperationType(2 /* DeletingLeft */);
    }
  }());
  CoreEditingCommands2.DeleteRight = registerEditorCommand(new class extends CoreEditingCommand {
    constructor() {
      super({
        id: "deleteRight",
        precondition: void 0,
        kbOpts: {
          weight: CORE_WEIGHT,
          kbExpr: EditorContextKeys.textInputFocus,
          primary: 20 /* Delete */,
          mac: { primary: 20 /* Delete */, secondary: [256 /* WinCtrl */ | 34 /* KeyD */, 256 /* WinCtrl */ | 20 /* Delete */] }
        }
      });
    }
    runCoreEditingCommand(editor, viewModel, args2) {
      const [shouldPushStackElementBefore, commands] = DeleteOperations.deleteRight(viewModel.getPrevEditOperationType(), viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map((s) => s.modelState.selection));
      if (shouldPushStackElementBefore) {
        editor.pushUndoStop();
      }
      editor.executeCommands(this.id, commands);
      viewModel.setPrevEditOperationType(3 /* DeletingRight */);
    }
  }());
  CoreEditingCommands2.Undo = new class extends EditorOrNativeTextInputCommand {
    constructor() {
      super(UndoCommand);
    }
    runDOMCommand(activeElement) {
      activeElement.ownerDocument.execCommand("undo");
    }
    runEditorCommand(accessor, editor, args2) {
      if (!editor.hasModel() || editor.getOption(104 /* readOnly */) === true) {
        return;
      }
      return editor.getModel().undo();
    }
  }();
  CoreEditingCommands2.Redo = new class extends EditorOrNativeTextInputCommand {
    constructor() {
      super(RedoCommand);
    }
    runDOMCommand(activeElement) {
      activeElement.ownerDocument.execCommand("redo");
    }
    runEditorCommand(accessor, editor, args2) {
      if (!editor.hasModel() || editor.getOption(104 /* readOnly */) === true) {
        return;
      }
      return editor.getModel().redo();
    }
  }();
})(CoreEditingCommands || (CoreEditingCommands = {}));

var EditorHandlerCommand = class extends Command {
  constructor(id2, handlerId, metadata) {
    super({
      id: id2,
      precondition: void 0,
      metadata
    });
    this._handlerId = handlerId;
  }
  runCommand(accessor, args2) {
    const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (!editor) {
      return;
    }
    editor.trigger("keyboard", this._handlerId, args2);
  }
};

function registerOverwritableCommand(handlerId, metadata) {
  registerCommand2(new EditorHandlerCommand("default:" + handlerId, handlerId));
  registerCommand2(new EditorHandlerCommand(handlerId, handlerId, metadata));
}

registerOverwritableCommand("type" /* Type */, {
  description: `Type`,
  args: [{
    name: "args",
    schema: {
      "type": "object",
      "required": ["text"],
      "properties": {
        "text": {
          "type": "string"
        }
      }
    }
  }]
});

registerOverwritableCommand("replacePreviousChar" /* ReplacePreviousChar */);

registerOverwritableCommand("compositionType" /* CompositionType */);

registerOverwritableCommand("compositionStart" /* CompositionStart */);

registerOverwritableCommand("compositionEnd" /* CompositionEnd */);

registerOverwritableCommand("paste" /* Paste */);

registerOverwritableCommand("cut" /* Cut */);
export { registerColumnSelection, registerCommand2, registerOverwritableCommand, CORE_WEIGHT, CoreEditorCommand, EditorScroll_, RevealLine_, EditorOrNativeTextInputCommand, CoreNavigationCommands, columnSelectionCondition, CoreEditingCommands, EditorHandlerCommand };
