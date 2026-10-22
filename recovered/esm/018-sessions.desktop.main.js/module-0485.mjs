// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/inlineDiffDeletedCodeMargin.ts
import { Disposable } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { isIOS } from "./module-0014.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { addStandardDisposableListener, getDomNodePagePosition } from "./module-0075.mjs";
import { enableCopySelection } from "./module-0484.mjs";


// src/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/inlineDiffDeletedCodeMargin.ts
var InlineDiffDeletedCodeMargin = class extends Disposable {
  constructor(_getViewZoneId, _marginDomNode, _deletedCodeDomNode, _modifiedEditor, _diff, _editor, _renderLinesResult, _originalTextModel, _contextMenuService, _clipboardService) {
    super();
    this._getViewZoneId = _getViewZoneId;
    this._marginDomNode = _marginDomNode;
    this._deletedCodeDomNode = _deletedCodeDomNode;
    this._modifiedEditor = _modifiedEditor;
    this._diff = _diff;
    this._editor = _editor;
    this._renderLinesResult = _renderLinesResult;
    this._originalTextModel = _originalTextModel;
    this._contextMenuService = _contextMenuService;
    this._clipboardService = _clipboardService;
    this._visibility = false;
    this._marginDomNode.style.zIndex = "10";
    this._diffActions = document.createElement("div");
    this._diffActions.className = ThemeIcon.asClassName(Codicon.lightBulb) + " lightbulb-glyph";
    this._diffActions.style.position = "absolute";
    const lineHeight = this._modifiedEditor.getOption(75 /* lineHeight */);
    this._diffActions.style.right = "0px";
    this._diffActions.style.visibility = "hidden";
    this._diffActions.style.height = `${lineHeight}px`;
    this._diffActions.style.lineHeight = `${lineHeight}px`;
    this._marginDomNode.appendChild(this._diffActions);
    let currentLineNumberOffset = 0;
    const useShadowDOM = _modifiedEditor.getOption(144 /* useShadowDOM */) && !isIOS;
    const showContextMenu = (anchor, baseActions, onHide) => {
      this._contextMenuService.showContextMenu({
        domForShadowRoot: useShadowDOM ? _modifiedEditor.getDomNode() ?? void 0 : void 0,
        getAnchor: () => anchor,
        onHide,
        getActions: () => {
          const actions = baseActions ?? [];
          const isDeletion3 = _diff.modified.isEmpty;
          actions.push(new Action(
            "diff.clipboard.copyDeletedContent",
            isDeletion3 ? _diff.original.length > 1 ? localize(239, null) : localize(240, null) : _diff.original.length > 1 ? localize(236, null) : localize(237, null),
            void 0,
            true,
            async () => {
              const originalText = this._originalTextModel.getValueInRange(_diff.original.toExclusiveRange());
              await this._clipboardService.writeText(originalText);
            }
          ));
          if (_diff.original.length > 1) {
            actions.push(new Action(
              "diff.clipboard.copyDeletedLineContent",
              isDeletion3 ? localize(
                238,
                null,
                _diff.original.startLineNumber + currentLineNumberOffset
              ) : localize(
                235,
                null,
                _diff.original.startLineNumber + currentLineNumberOffset
              ),
              void 0,
              true,
              async () => {
                let lineContent = this._originalTextModel.getLineContent(_diff.original.startLineNumber + currentLineNumberOffset);
                if (lineContent === "") {
                  const eof = this._originalTextModel.getEndOfLineSequence();
                  lineContent = eof === 0 /* LF */ ? "\n" : "\r\n";
                }
                await this._clipboardService.writeText(lineContent);
              }
            ));
          }
          const readOnly = _modifiedEditor.getOption(104 /* readOnly */);
          if (!readOnly) {
            actions.push(
              new Action(
                "diff.inline.revertChange",
                localize(241, null),
                void 0,
                true,
                async () => {
                  this._editor.revert(this._diff);
                }
              )
            );
          }
          return actions;
        },
        autoSelectFirstItem: true
      });
    };
    this._register(addStandardDisposableListener(this._diffActions, "mousedown", (e4) => {
      if (!e4.leftButton) {
        return;
      }
      const { top: top2, height } = getDomNodePagePosition(this._diffActions);
      const pad = Math.floor(lineHeight / 3);
      e4.preventDefault();
      showContextMenu({ x: e4.posx, y: top2 + height + pad });
    }));
    this._register(_modifiedEditor.onMouseMove((e4) => {
      if ((e4.target.type === 8 /* CONTENT_VIEW_ZONE */ || e4.target.type === 5 /* GUTTER_VIEW_ZONE */) && e4.target.detail.viewZoneId === this._getViewZoneId()) {
        currentLineNumberOffset = this._updateLightBulbPosition(this._marginDomNode, e4.event.browserEvent.y, lineHeight);
        this.visibility = true;
      } else {
        this.visibility = false;
      }
    }));
    this._register(enableCopySelection({
      domNode: this._deletedCodeDomNode,
      diffEntry: _diff,
      originalModel: this._originalTextModel,
      renderLinesResult: this._renderLinesResult,
      clipboardService: _clipboardService
    }));
  }
  get visibility() {
    return this._visibility;
  }
  set visibility(_visibility) {
    if (this._visibility !== _visibility) {
      this._visibility = _visibility;
      this._diffActions.style.visibility = _visibility ? "visible" : "hidden";
    }
  }
  _updateLightBulbPosition(marginDomNode, y, lineHeight) {
    const { top: top2 } = getDomNodePagePosition(marginDomNode);
    const offset = y - top2;
    const lineNumberOffset = Math.floor(offset / lineHeight);
    const newTop = lineNumberOffset * lineHeight;
    this._diffActions.style.top = `${newTop}px`;
    if (this._renderLinesResult.viewLineCounts) {
      let acc = 0;
      for (let i2 = 0; i2 < this._renderLinesResult.viewLineCounts.length; i2++) {
        acc += this._renderLinesResult.viewLineCounts[i2];
        if (lineNumberOffset < acc) {
          return i2;
        }
      }
    }
    return lineNumberOffset;
  }
};
export { InlineDiffDeletedCodeMargin };
