// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/editors/inputCodeEditorView.ts
import { CodeEditorView, TitleMenu, createSelectionsAutorun } from "./module-3212.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { handledConflictMinimapOverViewRulerColor, unhandledConflictMinimapOverViewRulerColor } from "./module-3210.mjs";
import { EditorGutter2 } from "./module-3211.mjs";
import { MenuId } from "./module-0092.mjs";
import { autorun, autorunOpts } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { EventType, addDisposableListener, h, reset } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { applyObservableDecorations2, setFields } from "./module-1138.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { transaction } from "./module-0045.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { isDefined } from "./module-0010.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Toggle } from "./module-0549.mjs";
import { Codicon } from "./module-0085.mjs";
import { defaultToggleStyles } from "./module-0513.mjs";
import { noBreakWhitespace } from "./module-0030.mjs";
import { clamp } from "./module-0040.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/editors/inputCodeEditorView.ts
var InputCodeEditorView = class extends CodeEditorView {
  constructor(inputNumber, viewModel, instantiationService, contextMenuService, configurationService) {
    super(instantiationService, viewModel, configurationService);
    this.inputNumber = inputNumber;
    this.otherInputNumber = this.inputNumber === 1 ? 2 : 1;
    this.modifiedBaseRangeGutterItemInfos = derivedOpts({ debugName: `input${this.inputNumber}.modifiedBaseRangeGutterItemInfos` }, (reader) => {
      const viewModel2 = this.viewModel.read(reader);
      if (!viewModel2) {
        return [];
      }
      const model = viewModel2.model;
      const inputNumber2 = this.inputNumber;
      const showNonConflictingChanges = viewModel2.showNonConflictingChanges.read(reader);
      return model.modifiedBaseRanges.read(reader).filter((r2) => r2.getInputDiffs(this.inputNumber).length > 0 && (showNonConflictingChanges || r2.isConflicting || !model.isHandled(r2).read(reader))).map((baseRange, idx) => new ModifiedBaseRangeGutterItemModel(idx.toString(), baseRange, inputNumber2, viewModel2));
    });
    this.decorations = derivedOpts({ debugName: `input${this.inputNumber}.decorations` }, (reader) => {
      const viewModel2 = this.viewModel.read(reader);
      if (!viewModel2) {
        return [];
      }
      const model = viewModel2.model;
      const textModel = (this.inputNumber === 1 ? model.input1 : model.input2).textModel;
      const activeModifiedBaseRange = viewModel2.activeModifiedBaseRange.read(reader);
      const result = new Array();
      const showNonConflictingChanges = viewModel2.showNonConflictingChanges.read(reader);
      const showDeletionMarkers = this.showDeletionMarkers.read(reader);
      const diffWithThis = viewModel2.baseCodeEditorView.read(reader) !== void 0 && viewModel2.baseShowDiffAgainst.read(reader) === this.inputNumber;
      const useSimplifiedDecorations = !diffWithThis && this.useSimplifiedDecorations.read(reader);
      for (const modifiedBaseRange of model.modifiedBaseRanges.read(reader)) {
        const range2 = modifiedBaseRange.getInputRange(this.inputNumber);
        if (!range2) {
          continue;
        }
        const blockClassNames = ["merge-editor-block"];
        let blockPadding = [0, 0, 0, 0];
        const isHandled = model.isInputHandled(modifiedBaseRange, this.inputNumber).read(reader);
        if (isHandled) {
          blockClassNames.push("handled");
        }
        if (modifiedBaseRange === activeModifiedBaseRange) {
          blockClassNames.push("focused");
          blockPadding = [0, 2, 0, 2];
        }
        if (modifiedBaseRange.isConflicting) {
          blockClassNames.push("conflicting");
        }
        const inputClassName = this.inputNumber === 1 ? "input i1" : "input i2";
        blockClassNames.push(inputClassName);
        if (!modifiedBaseRange.isConflicting && !showNonConflictingChanges && isHandled) {
          continue;
        }
        if (useSimplifiedDecorations && !isHandled) {
          blockClassNames.push("use-simplified-decorations");
        }
        result.push({
          range: range2.toInclusiveRangeOrEmpty(),
          options: {
            showIfCollapsed: true,
            blockClassName: blockClassNames.join(" "),
            blockPadding,
            blockIsAfterEnd: range2.startLineNumber > textModel.getLineCount(),
            description: "Merge Editor",
            minimap: {
              position: 2 /* Gutter */,
              color: { id: isHandled ? handledConflictMinimapOverViewRulerColor : unhandledConflictMinimapOverViewRulerColor }
            },
            overviewRuler: modifiedBaseRange.isConflicting ? {
              position: 2 /* Center */,
              color: { id: isHandled ? handledConflictMinimapOverViewRulerColor : unhandledConflictMinimapOverViewRulerColor }
            } : void 0
          }
        });
        if (!useSimplifiedDecorations && (modifiedBaseRange.isConflicting || !model.isHandled(modifiedBaseRange).read(reader))) {
          const inputDiffs = modifiedBaseRange.getInputDiffs(this.inputNumber);
          for (const diff4 of inputDiffs) {
            const range3 = diff4.outputRange.toInclusiveRange();
            if (range3) {
              result.push({
                range: range3,
                options: {
                  className: `merge-editor-diff ${inputClassName}`,
                  description: "Merge Editor",
                  isWholeLine: true
                }
              });
            }
            if (diff4.rangeMappings) {
              for (const d of diff4.rangeMappings) {
                if (showDeletionMarkers || !d.outputRange.isEmpty()) {
                  result.push({
                    range: d.outputRange,
                    options: {
                      className: d.outputRange.isEmpty() ? `merge-editor-diff-empty-word ${inputClassName}` : `merge-editor-diff-word ${inputClassName}`,
                      description: "Merge Editor",
                      showIfCollapsed: true
                    }
                  });
                }
              }
            }
          }
        }
      }
      return result;
    });
    this.htmlElements.root.classList.add(`input`);
    this._register(
      new EditorGutter2(this.editor, this.htmlElements.gutterDiv, {
        getIntersectingGutterItems: (range2, reader) => {
          if (this.checkboxesVisible.read(reader)) {
            return this.modifiedBaseRangeGutterItemInfos.read(reader);
          } else {
            return [];
          }
        },
        createView: (item, target) => new MergeConflictGutterItemView(item, target, contextMenuService)
      })
    );
    this._register(
      createSelectionsAutorun(
        this,
        (baseRange, viewModel2) => viewModel2.model.translateBaseRangeToInput(this.inputNumber, baseRange)
      )
    );
    this._register(
      instantiationService.createInstance(
        TitleMenu,
        inputNumber === 1 ? MenuId.MergeInput1Toolbar : MenuId.MergeInput2Toolbar,
        this.htmlElements.toolbar
      )
    );
    this._register(autorunOpts({ debugName: `input${this.inputNumber}: update labels & text model` }, (reader) => {
      const vm = this.viewModel.read(reader);
      if (!vm) {
        return;
      }
      this.editor.setModel(this.inputNumber === 1 ? vm.model.input1.textModel : vm.model.input2.textModel);
      const title = this.inputNumber === 1 ? vm.model.input1.title || localize(17330, null) : vm.model.input2.title || localize(17331, null);
      const description = this.inputNumber === 1 ? vm.model.input1.description : vm.model.input2.description;
      const detail2 = this.inputNumber === 1 ? vm.model.input1.detail : vm.model.input2.detail;
      reset(this.htmlElements.title, ...renderLabelWithIcons(title));
      reset(this.htmlElements.description, ...description ? renderLabelWithIcons(description) : []);
      reset(this.htmlElements.detail, ...detail2 ? renderLabelWithIcons(detail2) : []);
    }));
    this._register(applyObservableDecorations2(this.editor, this.decorations));
  }
};

InputCodeEditorView = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService)
], InputCodeEditorView);

var ModifiedBaseRangeGutterItemModel = class {
  constructor(id2, baseRange, inputNumber, viewModel) {
    this.id = id2;
    this.baseRange = baseRange;
    this.inputNumber = inputNumber;
    this.viewModel = viewModel;
    this.model = this.viewModel.model;
    this.range = this.baseRange.getInputRange(this.inputNumber);
    this.enabled = this.model.isUpToDate;
    this.toggleState = derived(this, (reader) => {
      const input = this.model.getState(this.baseRange).read(reader).getInput(this.inputNumber);
      return input === 2 /* second */ && !this.baseRange.isOrderRelevant ? 1 /* first */ : input;
    });
    this.state = derived(this, (reader) => {
      const active = this.viewModel.activeModifiedBaseRange.read(reader);
      if (!this.model.hasBaseRange(this.baseRange)) {
        return { handled: false, focused: false };
      }
      return {
        handled: this.model.isHandled(this.baseRange).read(reader),
        focused: this.baseRange === active
      };
    });
  }
  setState(value2, tx) {
    this.viewModel.setState(
      this.baseRange,
      this.model.getState(this.baseRange).get().withInputValue(this.inputNumber, value2),
      tx,
      this.inputNumber
    );
  }
  toggleBothSides() {
    transaction((tx) => {
      const state = this.model.getState(this.baseRange).get();
      this.model.setState(
        this.baseRange,
        state.toggle(this.inputNumber).toggle(this.inputNumber === 1 ? 2 : 1),
        true,
        tx
      );
    });
  }
  getContextMenuActions() {
    const state = this.model.getState(this.baseRange).get();
    const handled = this.model.isHandled(this.baseRange).get();
    const update = (newState) => {
      transaction((tx) => {
        return this.viewModel.setState(this.baseRange, newState, tx, this.inputNumber);
      });
    };
    function action(id2, label3, targetState, checked) {
      const action2 = new Action(id2, label3, void 0, true, () => {
        update(targetState);
      });
      action2.checked = checked;
      return action2;
    }
    const both = state.includesInput1 && state.includesInput2;
    return [
      this.baseRange.input1Diffs.length > 0 ? action(
        "mergeEditor.acceptInput1",
        localize(17332, null, this.model.input1.title),
        state.toggle(1),
        state.includesInput1
      ) : void 0,
      this.baseRange.input2Diffs.length > 0 ? action(
        "mergeEditor.acceptInput2",
        localize(17332, null, this.model.input2.title),
        state.toggle(2),
        state.includesInput2
      ) : void 0,
      this.baseRange.isConflicting ? setFields(
        action(
          "mergeEditor.acceptBoth",
          localize(
            17333,
            null
          ),
          state.withInputValue(1, !both).withInputValue(2, !both),
          both
        ),
        { enabled: this.baseRange.canBeCombined }
      ) : void 0,
      new Separator(),
      this.baseRange.isConflicting ? setFields(
        action(
          "mergeEditor.swap",
          localize(17335, null),
          state.swap(),
          false
        ),
        { enabled: !state.kind && (!both || this.baseRange.isOrderRelevant) }
      ) : void 0,
      setFields(
        new Action(
          "mergeEditor.markAsHandled",
          localize(17334, null),
          void 0,
          true,
          () => {
            transaction((tx) => {
              this.model.setHandled(this.baseRange, !handled, tx);
            });
          }
        ),
        { checked: handled }
      )
    ].filter(isDefined);
  }
};

var MergeConflictGutterItemView = class extends Disposable {
  constructor(item, target, contextMenuService) {
    super();
    this.isMultiLine = observableValue(this, false);
    this.item = observableValue(this, item);
    const checkBox = new Toggle({
      isChecked: false,
      title: "",
      icon: Codicon.check,
      ...defaultToggleStyles
    });
    checkBox.domNode.classList.add("accept-conflict-group");
    this._register(
      addDisposableListener(checkBox.domNode, EventType.MOUSE_DOWN, (e) => {
        const item2 = this.item.get();
        if (!item2) {
          return;
        }
        if (e.button === /* Right */
        2) {
          e.stopPropagation();
          e.preventDefault();
          contextMenuService.showContextMenu({
            getAnchor: () => checkBox.domNode,
            getActions: () => item2.getContextMenuActions()
          });
        } else if (e.button === /* Middle */
        1) {
          e.stopPropagation();
          e.preventDefault();
          item2.toggleBothSides();
        }
      })
    );
    this._register(
      autorun((reader) => {
        const item2 = this.item.read(reader);
        const value2 = item2.toggleState.read(reader);
        const iconMap = {
          [0 /* excluded */]: { icon: void 0, checked: false, title: localize(17327, null) },
          [3 /* unrecognized */]: { icon: Codicon.circleFilled, checked: false, title: localize(17326, null) },
          [1 /* first */]: { icon: Codicon.check, checked: true, title: localize(17328, null) },
          [2 /* second */]: { icon: Codicon.checkAll, checked: true, title: localize(17329, null) }
        };
        const state = iconMap[value2];
        checkBox.setIcon(state.icon);
        checkBox.checked = state.checked;
        checkBox.setTitle(state.title);
        if (!item2.enabled.read(reader)) {
          checkBox.disable();
        } else {
          checkBox.enable();
        }
      })
    );
    this._register(autorun((reader) => {
      const state = this.item.read(reader).state.read(reader);
      const classNames2 = [
        "merge-accept-gutter-marker",
        state.handled && "handled",
        state.focused && "focused",
        this.isMultiLine.read(reader) ? "multi-line" : "single-line"
      ];
      target.className = classNames2.filter((c) => typeof c === "string").join(" ");
    }));
    this._register(checkBox.onChange(() => {
      transaction((tx) => {
        this.item.get().setState(checkBox.checked, tx);
      });
    }));
    target.appendChild(h("div.background", [noBreakWhitespace]).root);
    target.appendChild(
      this.checkboxDiv = h("div.checkbox", [h("div.checkbox-background", [checkBox.domNode])]).root
    );
  }
  layout(top2, height, viewTop, viewHeight) {
    const checkboxHeight = this.checkboxDiv.clientHeight;
    const middleHeight = height / 2 - checkboxHeight / 2;
    const margin = checkboxHeight;
    let effectiveCheckboxTop = top2 + middleHeight;
    const preferredViewPortRange = [
      margin,
      viewTop + viewHeight - margin - checkboxHeight
    ];
    const preferredParentRange = [
      top2 + margin,
      top2 + height - checkboxHeight - margin
    ];
    if (preferredParentRange[0] < preferredParentRange[1]) {
      effectiveCheckboxTop = clamp(effectiveCheckboxTop, preferredViewPortRange[0], preferredViewPortRange[1]);
      effectiveCheckboxTop = clamp(effectiveCheckboxTop, preferredParentRange[0], preferredParentRange[1]);
    }
    this.checkboxDiv.style.top = `${effectiveCheckboxTop - top2}px`;
    transaction((tx) => {
      this.isMultiLine.set(height > 30, tx);
    });
  }
  update(baseRange) {
    transaction((tx) => {
      this.item.set(baseRange, tx);
    });
  }
};
export { InputCodeEditorView, ModifiedBaseRangeGutterItemModel, MergeConflictGutterItemView };
