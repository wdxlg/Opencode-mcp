// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/conflictActions.ts
import { Disposable } from "./module-0012.mjs";
import { hash } from "./module-0039.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { $, h, isInShadowDOM, reset } from "./module-0075.mjs";
import { EDITOR_FONT_DEFAULTS } from "./module-0101.mjs";
import { derived } from "./module-0054.mjs";
import { localize } from "./module-0001.mjs";
import { transaction } from "./module-0045.mjs";
import { ModifiedBaseRangeState } from "./module-1140.mjs";
import { FixedZoneWidget } from "./module-2980.mjs";
import { autorun } from "./module-0052.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/conflictActions.ts
var ConflictActionsFactory = class extends Disposable {
  constructor(_editor) {
    super();
    this._editor = _editor;
    this._register(this._editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(59 /* fontInfo */) || e4.hasChanged(25 /* codeLensFontSize */) || e4.hasChanged(24 /* codeLensFontFamily */)) {
        this._updateLensStyle();
      }
    }));
    this._styleClassName = "_conflictActionsFactory_" + hash(this._editor.getId()).toString(16);
    this._styleElement = createStyleSheet(
      isInShadowDOM(this._editor.getContainerDomNode()) ? this._editor.getContainerDomNode() : void 0,
      void 0,
      this._store
    );
    this._updateLensStyle();
  }
  _updateLensStyle() {
    const { codeLensHeight, fontSize } = this._getLayoutInfo();
    const fontFamily = this._editor.getOption(24 /* codeLensFontFamily */);
    const editorFontInfo = this._editor.getOption(59 /* fontInfo */);
    const fontFamilyVar = `--codelens-font-family${this._styleClassName}`;
    const fontFeaturesVar = `--codelens-font-features${this._styleClassName}`;
    let newStyle = `
		.${this._styleClassName} { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; padding-right: ${Math.round(fontSize * 0.5)}px; font-feature-settings: var(${fontFeaturesVar}) }
		.monaco-workbench .${this._styleClassName} span.codicon { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; }
		`;
    if (fontFamily) {
      newStyle += `${this._styleClassName} { font-family: var(${fontFamilyVar}), ${EDITOR_FONT_DEFAULTS.fontFamily}}`;
    }
    this._styleElement.textContent = newStyle;
    this._editor.getContainerDomNode().style?.setProperty(fontFamilyVar, fontFamily ?? "inherit");
    this._editor.getContainerDomNode().style?.setProperty(fontFeaturesVar, editorFontInfo.fontFeatureSettings);
  }
  _getLayoutInfo() {
    const lineHeightFactor = Math.max(1.3, this._editor.getOption(75 /* lineHeight */) / this._editor.getOption(61 /* fontSize */));
    let fontSize = this._editor.getOption(25 /* codeLensFontSize */);
    if (!fontSize || fontSize < 5) {
      fontSize = this._editor.getOption(61 /* fontSize */) * 0.9 | 0;
    }
    return {
      fontSize,
      codeLensHeight: fontSize * lineHeightFactor | 0
    };
  }
  createWidget(viewZoneChangeAccessor, lineNumber, items, viewZoneIdsToCleanUp) {
    const layoutInfo = this._getLayoutInfo();
    return new ActionsContentWidget(
      this._editor,
      viewZoneChangeAccessor,
      lineNumber,
      layoutInfo.codeLensHeight + 2,
      this._styleClassName,
      items,
      viewZoneIdsToCleanUp
    );
  }
};

var ActionsSource = class {
  constructor(viewModel, modifiedBaseRange) {
    this.viewModel = viewModel;
    this.modifiedBaseRange = modifiedBaseRange;
    this.itemsInput1 = this.getItemsInput(1);
    this.itemsInput2 = this.getItemsInput(2);
    this.resultItems = derived(this, (reader) => {
      const viewModel = this.viewModel;
      const modifiedBaseRange = this.modifiedBaseRange;
      const state = viewModel.model.getState(modifiedBaseRange).read(reader);
      const model = viewModel.model;
      const result = [];
      if (state.kind === 4 /* unrecognized */) {
        result.push({
          text: localize(17314, null),
          tooltip: localize(17315, null)
        });
      } else if (state.kind === 0 /* base */) {
        result.push({
          text: localize(17317, null),
          tooltip: localize(
            17318,
            null
          )
        });
      } else {
        const labels = [];
        if (state.includesInput1) {
          labels.push(model.input1.title);
        }
        if (state.includesInput2) {
          labels.push(model.input2.title);
        }
        if (state.kind === 3 /* both */ && state.firstInput === 2) {
          labels.reverse();
        }
        result.push({
          text: `${labels.join(" + ")}`
        });
      }
      const stateToggles = [];
      if (state.includesInput1) {
        stateToggles.push(
          command(
            localize(17319, null, model.input1.title),
            async () => {
              transaction((tx) => {
                model.setState(
                  modifiedBaseRange,
                  state.withInputValue(1, false),
                  true,
                  tx
                );
                model.telemetry.reportRemoveInvoked(1, state.includesInput(2));
              });
            },
            localize(17320, null, model.input1.title)
          )
        );
      }
      if (state.includesInput2) {
        stateToggles.push(
          command(
            localize(17319, null, model.input2.title),
            async () => {
              transaction((tx) => {
                model.setState(
                  modifiedBaseRange,
                  state.withInputValue(2, false),
                  true,
                  tx
                );
                model.telemetry.reportRemoveInvoked(2, state.includesInput(1));
              });
            },
            localize(17320, null, model.input2.title)
          )
        );
      }
      if (state.kind === 3 /* both */ && state.firstInput === 2) {
        stateToggles.reverse();
      }
      result.push(...stateToggles);
      if (state.kind === 4 /* unrecognized */) {
        result.push(
          command(
            localize(17321, null),
            async () => {
              transaction((tx) => {
                model.setState(
                  modifiedBaseRange,
                  ModifiedBaseRangeState.base,
                  true,
                  tx
                );
                model.telemetry.reportResetToBaseInvoked();
              });
            },
            localize(17322, null)
          )
        );
      }
      return result;
    });
    this.isEmpty = derived(this, (reader) => {
      return this.itemsInput1.read(reader).length + this.itemsInput2.read(reader).length + this.resultItems.read(reader).length === 0;
    });
    this.inputIsEmpty = derived(this, (reader) => {
      return this.itemsInput1.read(reader).length + this.itemsInput2.read(reader).length === 0;
    });
  }
  getItemsInput(inputNumber) {
    return derived((reader) => {
      const viewModel = this.viewModel;
      const modifiedBaseRange = this.modifiedBaseRange;
      if (!viewModel.model.hasBaseRange(modifiedBaseRange)) {
        return [];
      }
      const state = viewModel.model.getState(modifiedBaseRange).read(reader);
      const handled = viewModel.model.isHandled(modifiedBaseRange).read(reader);
      const model = viewModel.model;
      const result = [];
      const inputData = inputNumber === 1 ? viewModel.model.input1 : viewModel.model.input2;
      const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
      if (!modifiedBaseRange.isConflicting && handled && !showNonConflictingChanges) {
        return [];
      }
      const otherInputNumber = inputNumber === 1 ? 2 : 1;
      if (state.kind !== 4 /* unrecognized */ && !state.isInputIncluded(inputNumber)) {
        if (!state.isInputIncluded(otherInputNumber) || !this.viewModel.shouldUseAppendInsteadOfAccept.read(reader)) {
          result.push(
            command(localize(17305, null, inputData.title), async () => {
              transaction((tx) => {
                model.setState(
                  modifiedBaseRange,
                  state.withInputValue(inputNumber, true, false),
                  inputNumber,
                  tx
                );
                model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
              });
            }, localize(17309, null, inputData.title))
          );
          if (modifiedBaseRange.canBeCombined) {
            const commandName = modifiedBaseRange.isOrderRelevant ? localize(17307, null, inputData.title) : localize(17306, null);
            result.push(
              command(commandName, async () => {
                transaction((tx) => {
                  model.setState(
                    modifiedBaseRange,
                    ModifiedBaseRangeState.base.withInputValue(inputNumber, true).withInputValue(otherInputNumber, true, true),
                    true,
                    tx
                  );
                  model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                });
              }, localize(17308, null))
            );
          }
        } else {
          result.push(
            command(localize(17310, null, inputData.title), async () => {
              transaction((tx) => {
                model.setState(
                  modifiedBaseRange,
                  state.withInputValue(inputNumber, true, false),
                  inputNumber,
                  tx
                );
                model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
              });
            }, localize(17311, null, inputData.title))
          );
          if (modifiedBaseRange.canBeCombined) {
            result.push(
              command(localize(17312, null, inputData.title), async () => {
                transaction((tx) => {
                  model.setState(
                    modifiedBaseRange,
                    state.withInputValue(inputNumber, true, true),
                    inputNumber,
                    tx
                  );
                  model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                });
              }, localize(17308, null))
            );
          }
        }
        if (!model.isInputHandled(modifiedBaseRange, inputNumber).read(reader)) {
          result.push(
            command(
              localize(17313, null),
              async () => {
                transaction((tx) => {
                  model.setInputHandled(modifiedBaseRange, inputNumber, true, tx);
                });
              },
              localize(17316, null)
            )
          );
        }
      }
      return result;
    });
  }
};

function command(title, action, tooltip) {
  return {
    text: title,
    action,
    tooltip
  };
}

var ActionsContentWidget = class extends FixedZoneWidget {
  constructor(editor, viewZoneAccessor, afterLineNumber, height, className2, items, viewZoneIdsToCleanUp) {
    super(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp);
    this._domNode = h("div.merge-editor-conflict-actions").root;
    this.widgetDomNode.appendChild(this._domNode);
    this._domNode.classList.add(className2);
    this._register(autorun((reader) => {
      const i2 = items.read(reader);
      this.setState(i2);
    }));
  }
  setState(items) {
    const children = [];
    let isFirst = true;
    for (const item of items) {
      if (isFirst) {
        isFirst = false;
      } else {
        children.push($("span", void 0, "\xA0|\xA0"));
      }
      const title = renderLabelWithIcons(item.text);
      if (item.action) {
        children.push($("a", { title: item.tooltip, role: "button", onclick: () => item.action() }, ...title));
      } else {
        children.push($("span", { title: item.tooltip }, ...title));
      }
    }
    reset(this._domNode, ...children);
  }
};
export { command, ConflictActionsFactory, ActionsSource, ActionsContentWidget };
