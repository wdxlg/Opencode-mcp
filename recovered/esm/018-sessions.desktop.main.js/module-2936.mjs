// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess.ts
import { AbstractEditorNavigationQuickAccessProvider } from "./module-2512.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { CursorColumns } from "./module-0110.mjs";


// src/vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess.ts
var AbstractGotoLineQuickAccessProvider = class _AbstractGotoLineQuickAccessProvider extends AbstractEditorNavigationQuickAccessProvider {
  static {
    this.GO_TO_LINE_PREFIX = ":";
  }
  static {
    this.GO_TO_OFFSET_PREFIX = "::";
  }
  static {
    this.ZERO_BASED_OFFSET_STORAGE_KEY = "gotoLine.useZeroBasedOffset";
  }
  constructor() {
    super({ canAcceptInBackground: true });
  }
  get useZeroBasedOffset() {
    return this.storageService.getBoolean(
      _AbstractGotoLineQuickAccessProvider.ZERO_BASED_OFFSET_STORAGE_KEY,
      -1 /* APPLICATION */,
      false
    );
  }
  set useZeroBasedOffset(value2) {
    this.storageService.store(
      _AbstractGotoLineQuickAccessProvider.ZERO_BASED_OFFSET_STORAGE_KEY,
      value2,
      -1 /* APPLICATION */,
      0 /* USER */
    );
  }
  provideWithoutTextEditor(picker) {
    const label3 = localize(1527, null);
    picker.items = [{ label: label3 }];
    picker.ariaLabel = label3;
    return Disposable.None;
  }
  provideWithTextEditor(context2, picker, token) {
    const editor = context2.editor;
    const disposables = new DisposableStore();
    picker.ariaLabel = localize(1521, null);
    disposables.add(picker.onDidAccept((event) => {
      const [item] = picker.selectedItems;
      if (item) {
        if (!item.lineNumber) {
          return;
        }
        this.gotoLocation(context2, { range: this.toRange(item.lineNumber, item.column), keyMods: picker.keyMods, preserveFocus: event.inBackground });
        if (!event.inBackground) {
          picker.hide();
        }
      }
    }));
    const offsetButton = {
      iconClass: ThemeIcon.asClassName(Codicon.indexZero),
      tooltip: localize(1530, null),
      location: 3 /* Input */,
      toggle: { checked: this.useZeroBasedOffset }
    };
    const updatePickerAndEditor = () => {
      const inputText = picker.value.trim().substring(_AbstractGotoLineQuickAccessProvider.GO_TO_LINE_PREFIX.length);
      const { inOffsetMode, lineNumber, column, label: label3 } = this.parsePosition(editor, inputText);
      picker.buttons = inOffsetMode ? [offsetButton] : [];
      picker.items = [{
        lineNumber,
        column,
        label: label3,
        ariaLabel: lineNumber ? localize(1524, null, lineNumber, column || 1) : label3
      }];
      if (!lineNumber) {
        this.clearDecorations(editor);
        return;
      }
      const range2 = this.toRange(lineNumber, column);
      editor.revealRangeInCenter(range2, 0 /* Smooth */);
      this.addDecorations(editor, range2);
    };
    disposables.add(picker.onDidTriggerButton((button) => {
      if (button === offsetButton) {
        this.useZeroBasedOffset = button.toggle?.checked ?? !this.useZeroBasedOffset;
        updatePickerAndEditor();
      }
    }));
    updatePickerAndEditor();
    disposables.add(picker.onDidChangeValue(() => updatePickerAndEditor()));
    const codeEditor = getCodeEditor(editor);
    if (codeEditor) {
      const options3 = codeEditor.getOptions();
      const lineNumbers = options3.get(76 /* lineNumbers */);
      if (lineNumbers.renderType === 2 /* Relative */) {
        codeEditor.updateOptions({ lineNumbers: "on" });
        disposables.add(toDisposable(() => codeEditor.updateOptions({ lineNumbers: "relative" })));
      }
    }
    return disposables;
  }
  toRange(lineNumber = 1, column = 1) {
    return {
      startLineNumber: lineNumber,
      startColumn: column,
      endLineNumber: lineNumber,
      endColumn: column
    };
  }
  parsePosition(editor, value2) {
    const model = this.getModel(editor);
    if (!model) {
      return {
        label: localize(1527, null)
      };
    }
    if (value2.startsWith(":")) {
      let offset = parseInt(value2.substring(1), 10);
      const maxOffset = model.getValueLength();
      if (isNaN(offset)) {
        return {
          inOffsetMode: true,
          label: this.useZeroBasedOffset ? localize(1529, null, maxOffset - 1) : localize(1528, null, maxOffset)
        };
      } else {
        const reverse = offset < 0;
        if (!this.useZeroBasedOffset) {
          offset -= Math.sign(offset);
        }
        if (reverse) {
          offset += maxOffset;
        }
        const pos = model.getPositionAt(offset);
        const visibleColumn = CursorColumns.visibleColumnFromColumn(
          model.getLineContent(pos.lineNumber),
          pos.column,
          model.getOptions().tabSize
        ) + 1;
        return {
          ...pos,
          inOffsetMode: true,
          label: localize(1523, null, pos.lineNumber, visibleColumn)
        };
      }
    } else {
      const parts = value2.split(/,|:|#/);
      const maxLine = model.getLineCount();
      let lineNumber = parseInt(parts[0]?.trim(), 10);
      if (parts.length < 1 || isNaN(lineNumber)) {
        return {
          label: localize(1526, null, maxLine)
        };
      }
      lineNumber = lineNumber >= 0 ? lineNumber : maxLine + 1 + lineNumber;
      lineNumber = Math.min(Math.max(1, lineNumber), maxLine);
      const tabSize = model.getOptions().tabSize;
      const lineContent = model.getLineContent(lineNumber);
      const maxColumn = CursorColumns.visibleColumnFromColumn(lineContent, model.getLineMaxColumn(lineNumber), tabSize) + 1;
      let column = parseInt(parts[1]?.trim(), 10);
      if (parts.length < 2 || isNaN(column)) {
        return {
          lineNumber,
          column: 1,
          label: parts.length < 2 ? localize(1525, null, lineNumber) : localize(1522, null, lineNumber, maxColumn)
        };
      }
      column = column >= 0 ? column : maxColumn + column;
      column = Math.min(Math.max(1, column), maxColumn);
      const realColumn = CursorColumns.columnFromVisibleColumn(lineContent, column - 1, tabSize);
      return {
        lineNumber,
        column: realColumn,
        label: localize(1523, null, lineNumber, column)
      };
    }
  }
};
export { AbstractGotoLineQuickAccessProvider };
