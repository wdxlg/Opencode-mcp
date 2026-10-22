// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/smartSelect/browser/smartSelect.ts
import { CancellationToken } from "./module-0025.mjs";
import { equals, isNonEmptyArray } from "./module-0007.mjs";
import { Selection } from "./module-0107.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { MenuId } from "./module-0092.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { WordSelectionRangeProvider } from "./module-0845.mjs";
import { BracketSelectionRangeProvider } from "./module-0748.mjs";
import { Range2 } from "./module-0106.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { Position } from "./module-0079.mjs";
import { assertType, isArrayOf } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { ITextModelService } from "./module-0081.mjs";


// src/vs/editor/contrib/smartSelect/browser/smartSelect.ts
var SelectionRanges = class _SelectionRanges {
  constructor(index2, ranges) {
    this.index = index2;
    this.ranges = ranges;
  }
  mov(fwd) {
    const index2 = this.index + (fwd ? 1 : -1);
    if (index2 < 0 || index2 >= this.ranges.length) {
      return this;
    }
    const res = new _SelectionRanges(index2, this.ranges);
    if (res.ranges[index2].equalsRange(this.ranges[this.index])) {
      return res.mov(fwd);
    }
    return res;
  }
};

var SmartSelectController = class {
  constructor(_editor, _languageFeaturesService) {
    this._editor = _editor;
    this._languageFeaturesService = _languageFeaturesService;
    this._ignoreSelection = false;
  }
  static {
    this.ID = "editor.contrib.smartSelectController";
  }
  static get(editor) {
    return editor.getContribution(SmartSelectController.ID);
  }
  dispose() {
    this._selectionListener?.dispose();
  }
  async run(forward) {
    if (!this._editor.hasModel()) {
      return;
    }
    const selections = this._editor.getSelections();
    const model = this._editor.getModel();
    if (!this._state) {
      await provideSelectionRanges(this._languageFeaturesService.selectionRangeProvider, model, selections.map((s) => s.getPosition()), this._editor.getOption(129 /* smartSelect */), CancellationToken.None).then((ranges) => {
        if (!isNonEmptyArray(ranges) || ranges.length !== selections.length) {
          return;
        }
        if (!this._editor.hasModel() || !equals(this._editor.getSelections(), selections, (a, b) => a.equalsSelection(b))) {
          return;
        }
        for (let i2 = 0; i2 < ranges.length; i2++) {
          ranges[i2] = ranges[i2].filter((range2) => {
            return range2.containsPosition(selections[i2].getStartPosition()) && range2.containsPosition(selections[i2].getEndPosition());
          });
          ranges[i2].unshift(selections[i2]);
        }
        this._state = ranges.map((ranges2) => new SelectionRanges(0, ranges2));
        this._selectionListener?.dispose();
        this._selectionListener = this._editor.onDidChangeCursorPosition(() => {
          if (!this._ignoreSelection) {
            this._selectionListener?.dispose();
            this._state = void 0;
          }
        });
      });
    }
    if (!this._state) {
      return;
    }
    this._state = this._state.map((state) => state.mov(forward));
    const newSelections = this._state.map((state) => Selection.fromPositions(state.ranges[state.index].getStartPosition(), state.ranges[state.index].getEndPosition()));
    this._ignoreSelection = true;
    try {
      this._editor.setSelections(newSelections);
    } finally {
      this._ignoreSelection = false;
    }
  }
};

SmartSelectController = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService)
], SmartSelectController);

var AbstractSmartSelect = class extends EditorAction {
  constructor(forward, opts) {
    super(opts);
    this._forward = forward;
  }
  async run(_accessor, editor) {
    const controller = SmartSelectController.get(editor);
    if (controller) {
      await controller.run(this._forward);
    }
  }
};

var GrowSelectionAction = class extends AbstractSmartSelect {
  constructor() {
    super(true, {
      id: "editor.action.smartSelect.expand",
      label: localize2(1585, "Expand Selection"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 17 /* RightArrow */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 1024 /* Shift */ | 17 /* RightArrow */,
          secondary: [256 /* WinCtrl */ | 1024 /* Shift */ | 17 /* RightArrow */]
        },
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "1_basic",
        title: localize(1583, null),
        order: 2
      }
    });
  }
};

CommandsRegistry.registerCommandAlias("editor.action.smartSelect.grow", "editor.action.smartSelect.expand");

var ShrinkSelectionAction = class extends AbstractSmartSelect {
  constructor() {
    super(false, {
      id: "editor.action.smartSelect.shrink",
      label: localize2(1586, "Shrink Selection"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 15 /* LeftArrow */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 1024 /* Shift */ | 15 /* LeftArrow */,
          secondary: [256 /* WinCtrl */ | 1024 /* Shift */ | 15 /* LeftArrow */]
        },
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "1_basic",
        title: localize(1584, null),
        order: 3
      }
    });
  }
};

registerEditorContribution(SmartSelectController.ID, SmartSelectController, 4 /* Lazy */);

registerEditorAction(GrowSelectionAction);

registerEditorAction(ShrinkSelectionAction);

async function provideSelectionRanges(registry4, model, positions, options3, token) {
  const providers2 = registry4.all(model).concat(new WordSelectionRangeProvider(options3.selectSubwords));
  if (providers2.length === 1) {
    providers2.unshift(new BracketSelectionRangeProvider());
  }
  const work = [];
  const allRawRanges = [];
  for (const provider of providers2) {
    work.push(Promise.resolve(provider.provideSelectionRanges(model, positions, token)).then((allProviderRanges) => {
      if (isNonEmptyArray(allProviderRanges) && allProviderRanges.length === positions.length) {
        for (let i2 = 0; i2 < positions.length; i2++) {
          if (!allRawRanges[i2]) {
            allRawRanges[i2] = [];
          }
          for (const oneProviderRanges of allProviderRanges[i2]) {
            if (Range2.isIRange(oneProviderRanges.range) && Range2.containsPosition(oneProviderRanges.range, positions[i2])) {
              allRawRanges[i2].push(Range2.lift(oneProviderRanges.range));
            }
          }
        }
      }
    }, onUnexpectedExternalError));
  }
  await Promise.all(work);
  return allRawRanges.map((oneRawRanges) => {
    if (oneRawRanges.length === 0) {
      return [];
    }
    oneRawRanges.sort((a, b) => {
      if (Position.isBefore(a.getStartPosition(), b.getStartPosition())) {
        return 1;
      } else if (Position.isBefore(b.getStartPosition(), a.getStartPosition())) {
        return -1;
      } else if (Position.isBefore(a.getEndPosition(), b.getEndPosition())) {
        return -1;
      } else if (Position.isBefore(b.getEndPosition(), a.getEndPosition())) {
        return 1;
      } else {
        return 0;
      }
    });
    const oneRanges = [];
    let last;
    for (const range2 of oneRawRanges) {
      if (!last || Range2.containsRange(range2, last) && !Range2.equalsRange(range2, last)) {
        oneRanges.push(range2);
        last = range2;
      }
    }
    if (!options3.selectLeadingAndTrailingWhitespace) {
      return oneRanges;
    }
    const oneRangesWithTrivia = [oneRanges[0]];
    for (let i2 = 1; i2 < oneRanges.length; i2++) {
      const prev = oneRanges[i2 - 1];
      const cur = oneRanges[i2];
      if (cur.startLineNumber !== prev.startLineNumber || cur.endLineNumber !== prev.endLineNumber) {
        const rangeNoWhitespace = new Range2(prev.startLineNumber, model.getLineFirstNonWhitespaceColumn(prev.startLineNumber), prev.endLineNumber, model.getLineLastNonWhitespaceColumn(prev.endLineNumber));
        if (rangeNoWhitespace.containsRange(prev) && !rangeNoWhitespace.equalsRange(prev) && cur.containsRange(rangeNoWhitespace) && !cur.equalsRange(rangeNoWhitespace)) {
          oneRangesWithTrivia.push(rangeNoWhitespace);
        }
        const rangeFull = new Range2(prev.startLineNumber, 1, prev.endLineNumber, model.getLineMaxColumn(prev.endLineNumber));
        if (rangeFull.containsRange(prev) && !rangeFull.equalsRange(rangeNoWhitespace) && cur.containsRange(rangeFull) && !cur.equalsRange(rangeFull)) {
          oneRangesWithTrivia.push(rangeFull);
        }
      }
      oneRangesWithTrivia.push(cur);
    }
    return oneRangesWithTrivia;
  });
}

CommandsRegistry.registerCommand("_executeSelectionRangeProvider", async function(accessor, ...args2) {
  const [resource, positions] = args2;
  assertType(URI.isUri(resource));
  assertType(isArrayOf(positions, (p) => Position.isIPosition(p)));
  const registry4 = accessor.get(ILanguageFeaturesService).selectionRangeProvider;
  const reference = await accessor.get(ITextModelService).createModelReference(resource);
  try {
    return provideSelectionRanges(registry4, reference.object.textEditorModel, positions.map(Position.lift), { selectLeadingAndTrailingWhitespace: true, selectSubwords: true }, CancellationToken.None);
  } finally {
    reference.dispose();
  }
});
export { provideSelectionRanges, SelectionRanges, SmartSelectController, AbstractSmartSelect, GrowSelectionAction, ShrinkSelectionAction };
