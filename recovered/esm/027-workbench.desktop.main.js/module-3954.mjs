// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/electron-browser/selectionClipboard.ts
import { Disposable } from "./module-0012.mjs";
import { isLinux } from "./module-0014.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { Event2 } from "./module-0017.mjs";
import { addDisposableListener, onDidRegisterWindow } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { SelectionClipboardContributionID } from "./module-1361.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/codeEditor/electron-browser/selectionClipboard.ts
var SelectionClipboard = class extends Disposable {
  static {
    this.SELECTION_LENGTH_LIMIT = 65536;
  }
  constructor(editor, clipboardService) {
    super();
    if (isLinux) {
      let isEnabled = editor.getOption(121 /* selectionClipboard */);
      this._register(editor.onDidChangeConfiguration((e) => {
        if (e.hasChanged(121 /* selectionClipboard */)) {
          isEnabled = editor.getOption(121 /* selectionClipboard */);
        }
      }));
      const setSelectionToClipboard = this._register(new RunOnceScheduler(() => {
        if (!editor.hasModel()) {
          return;
        }
        const model = editor.getModel();
        let selections = editor.getSelections();
        selections = selections.slice(0);
        selections.sort(Range2.compareRangesUsingStarts);
        let resultLength = 0;
        for (const sel of selections) {
          if (sel.isEmpty()) {
            return;
          }
          resultLength += model.getValueLengthInRange(sel);
        }
        if (resultLength > SelectionClipboard.SELECTION_LENGTH_LIMIT) {
          return;
        }
        const result = [];
        for (const sel of selections) {
          result.push(model.getValueInRange(sel, 0 /* TextDefined */));
        }
        const textToCopy = result.join(model.getEOL());
        clipboardService.writeText(textToCopy, "selection");
      }, 100));
      this._register(editor.onDidChangeCursorSelection((e) => {
        if (!isEnabled) {
          return;
        }
        if (e.source === "restoreState") {
          return;
        }
        setSelectionToClipboard.schedule();
      }));
    }
  }
};

SelectionClipboard = __decorateClass([
  __decorateParam(1, IClipboardService)
], SelectionClipboard);

var LinuxSelectionClipboardPastePreventer = class extends Disposable {
  static {
    this.ID = "workbench.contrib.linuxSelectionClipboardPastePreventer";
  }
  constructor(configurationService) {
    super();
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => {
      disposables.add(addDisposableListener(window2.document, "mouseup", (e) => {
        if (e.button === 1) {
          const config = configurationService.getValue("editor");
          if (!config.selectionClipboard) {
            e.preventDefault();
          }
        }
      }));
    }, { window: mainWindow, disposables: this._store }));
  }
};

LinuxSelectionClipboardPastePreventer = __decorateClass([
  __decorateParam(0, IConfigurationService)
], LinuxSelectionClipboardPastePreventer);

var PasteSelectionClipboardAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.selectionClipboardPaste",
      label: localize2(13927, "Paste Selection Clipboard"),
      precondition: EditorContextKeys.writable
    });
  }
  async run(accessor, editor, args2) {
    const clipboardService = accessor.get(IClipboardService);
    const text2 = await clipboardService.readText("selection");
    editor.trigger("keyboard", "paste" /* Paste */, {
      text: text2,
      pasteOnNewLine: false,
      multicursorText: null
    });
  }
};

registerEditorContribution(SelectionClipboardContributionID, SelectionClipboard, 0 /* Eager */);

if (isLinux) {
  registerWorkbenchContribution2(LinuxSelectionClipboardPastePreventer.ID, LinuxSelectionClipboardPastePreventer, WorkbenchPhase.BlockRestore);
  registerEditorAction(PasteSelectionClipboardAction);
}
export { SelectionClipboard, LinuxSelectionClipboardPastePreventer, PasteSelectionClipboardAction };
