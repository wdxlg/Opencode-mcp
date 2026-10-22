// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/markerHoverParticipant.ts
import { $, addDisposableListener, append, getDomNodePagePosition } from "./module-0075.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { Range2 } from "./module-0106.mjs";
import { RenderedHoverParts } from "./module-0575.mjs";
import { IMarkerData, MarkerSeverity2 } from "./module-0560.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { basename2 } from "./module-0034.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { MarkerController, NextMarkerAction } from "./module-0701.mjs";
import { localize } from "./module-0001.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { createCancelablePromise, disposableTimeout } from "./module-0036.mjs";
import { getCodeActions, quickFixCommandId } from "./module-0559.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Progress } from "./module-0446.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerDecorationsService } from "./module-0209.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/editor/contrib/hover/browser/markerHoverParticipant.ts
var $14 = $;

var MarkerHover = class {
  constructor(owner, range2, marker) {
    this.owner = owner;
    this.range = range2;
    this.marker = marker;
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === 1 /* Range */ && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
};

var markerCodeActionTrigger = {
  type: 1 /* Invoke */,
  filter: { include: CodeActionKind.QuickFix },
  triggerAction: "quick fix hover window" /* QuickFixHover */
};

var MarkerHoverParticipant = class {
  constructor(_editor, _markerDecorationsService, _openerService, _languageFeaturesService, _menuService, _contextKeyService) {
    this._editor = _editor;
    this._markerDecorationsService = _markerDecorationsService;
    this._openerService = _openerService;
    this._languageFeaturesService = _languageFeaturesService;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this.hoverOrdinal = 1;
    this.recentMarkerCodeActionsInfo = void 0;
  }
  computeSync(anchor, lineDecorations) {
    if (!this._editor.hasModel() || anchor.type !== 1 /* Range */ && !anchor.supportsMarkerHover) {
      return [];
    }
    const model = this._editor.getModel();
    const anchorRange = anchor.range;
    if (!model.isValidRange(anchor.range)) {
      return [];
    }
    const lineNumber = anchorRange.startLineNumber;
    const maxColumn = model.getLineMaxColumn(lineNumber);
    const result = [];
    for (const d of lineDecorations) {
      const startColumn = d.range.startLineNumber === lineNumber ? d.range.startColumn : 1;
      const endColumn = d.range.endLineNumber === lineNumber ? d.range.endColumn : maxColumn;
      const marker = this._markerDecorationsService.getMarker(model.uri, d);
      if (!marker) {
        continue;
      }
      const range2 = new Range2(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
      result.push(new MarkerHover(this, range2, marker));
    }
    return result;
  }
  renderHoverParts(context2, hoverParts) {
    if (!hoverParts.length) {
      return new RenderedHoverParts([]);
    }
    const renderedHoverParts = [];
    hoverParts.forEach((hoverPart) => {
      const renderedMarkerHover = this._renderMarkerHover(hoverPart);
      context2.fragment.appendChild(renderedMarkerHover.hoverElement);
      renderedHoverParts.push(renderedMarkerHover);
    });
    const markerHoverForStatusbar = hoverParts.length === 1 ? hoverParts[0] : hoverParts.sort((a, b) => MarkerSeverity2.compare(a.marker.severity, b.marker.severity))[0];
    const disposables = this._renderMarkerStatusbar(context2, markerHoverForStatusbar);
    return new RenderedHoverParts(renderedHoverParts, disposables);
  }
  getAccessibleContent(hoverPart) {
    const { marker } = hoverPart;
    const relatedInformation = isNonEmptyArray(marker.relatedInformation) ? marker.relatedInformation.map((related) => `${basename2(related.resource)}(${related.startLineNumber}, ${related.startColumn}): ${related.message}`).join("\n") : void 0;
    return [marker.message, relatedInformation].filter((value2) => !!value2).join("\n");
  }
  _renderMarkerHover(markerHover) {
    const disposables = new DisposableStore();
    const hoverElement = $14("div.hover-row");
    const markerElement = append(hoverElement, $14("div.marker.hover-contents"));
    const { source, message, code, relatedInformation } = markerHover.marker;
    this._editor.applyFontInfo(markerElement);
    const messageElement = append(markerElement, $14("span"));
    messageElement.style.whiteSpace = "pre-wrap";
    messageElement.innerText = message;
    if (source || code) {
      if (code && typeof code !== "string") {
        const sourceAndCodeElement = $14("span");
        if (source) {
          const sourceElement = append(sourceAndCodeElement, $14("span"));
          sourceElement.innerText = source;
        }
        const codeLink = append(sourceAndCodeElement, $14("a.code-link"));
        codeLink.setAttribute("href", code.target.toString(true));
        disposables.add(addDisposableListener(codeLink, "click", (e4) => {
          this._openerService.open(code.target);
          e4.preventDefault();
          e4.stopPropagation();
        }));
        const codeElement = append(codeLink, $14("span"));
        codeElement.innerText = code.value;
        const detailsElement = append(markerElement, sourceAndCodeElement);
        detailsElement.style.opacity = "0.6";
        detailsElement.style.paddingLeft = "6px";
      } else {
        const detailsElement = append(markerElement, $14("span"));
        detailsElement.style.opacity = "0.6";
        detailsElement.style.paddingLeft = "6px";
        detailsElement.innerText = source && code ? `${source}(${code})` : source ? source : `(${code})`;
      }
    }
    if (isNonEmptyArray(relatedInformation)) {
      for (const { message: message2, resource, startLineNumber, startColumn } of relatedInformation) {
        const relatedInfoContainer = append(markerElement, $14("div"));
        relatedInfoContainer.style.marginTop = "8px";
        const a = append(relatedInfoContainer, $14("a"));
        a.innerText = `${basename2(resource)}(${startLineNumber}, ${startColumn}): `;
        a.style.cursor = "pointer";
        disposables.add(addDisposableListener(a, "click", (e4) => {
          e4.stopPropagation();
          e4.preventDefault();
          if (this._openerService) {
            const editorOptions = { selection: { startLineNumber, startColumn } };
            this._openerService.open(resource, {
              fromUserGesture: true,
              editorOptions
            }).catch(onUnexpectedError);
          }
        }));
        const messageElement2 = append(relatedInfoContainer, $14("span"));
        messageElement2.innerText = message2;
        this._editor.applyFontInfo(messageElement2);
      }
    }
    const renderedHoverPart = {
      hoverPart: markerHover,
      hoverElement,
      dispose: () => disposables.dispose()
    };
    return renderedHoverPart;
  }
  _renderMarkerStatusbar(context2, markerHover) {
    const disposables = new DisposableStore();
    if (markerHover.marker.severity === 8 /* Error */ || markerHover.marker.severity === 4 /* Warning */ || markerHover.marker.severity === 2 /* Info */) {
      const markerController = MarkerController.get(this._editor);
      if (markerController) {
        context2.statusBar.addAction({
          label: localize(1320, null),
          commandId: NextMarkerAction.ID,
          run: () => {
            context2.hide();
            markerController.showAtMarker(markerHover.marker);
            this._editor.focus();
          }
        });
      }
    }
    const menuActions = [];
    for (const [, actions] of this._menuService.getMenuActions(MenuId.MarkerHoverStatusBar, this._contextKeyService)) {
      for (const action of actions) {
        if (action instanceof MenuItemAction && action.enabled) {
          menuActions.push(action);
        }
      }
    }
    const renderMenuActions = () => {
      for (const action of menuActions) {
        context2.statusBar.addAction({
          label: action.label,
          commandId: action.id,
          iconClass: action.class,
          run: () => {
            context2.hide();
            this._editor.setSelection(Range2.lift(markerHover.range));
            action.run();
          }
        });
      }
    };
    if (!this._editor.getOption(104 /* readOnly */)) {
      const quickfixPlaceholderElement = context2.statusBar.append($14("div"));
      if (this.recentMarkerCodeActionsInfo) {
        if (IMarkerData.makeKey(this.recentMarkerCodeActionsInfo.marker) === IMarkerData.makeKey(markerHover.marker)) {
          if (!this.recentMarkerCodeActionsInfo.hasCodeActions) {
            if (menuActions.length === 0) {
              quickfixPlaceholderElement.textContent = localize(1318, null);
            }
          }
        } else {
          this.recentMarkerCodeActionsInfo = void 0;
        }
      }
      const updatePlaceholderDisposable = this.recentMarkerCodeActionsInfo && !this.recentMarkerCodeActionsInfo.hasCodeActions ? Disposable.None : disposableTimeout(() => quickfixPlaceholderElement.textContent = localize(1317, null), 200, disposables);
      if (!quickfixPlaceholderElement.textContent) {
        quickfixPlaceholderElement.textContent = String.fromCharCode(160);
      }
      const codeActionsPromise = this.getCodeActions(markerHover.marker);
      disposables.add(toDisposable(() => codeActionsPromise.cancel()));
      codeActionsPromise.then((actions) => {
        updatePlaceholderDisposable.dispose();
        this.recentMarkerCodeActionsInfo = { marker: markerHover.marker, hasCodeActions: actions.validActions.length > 0 };
        if (!this.recentMarkerCodeActionsInfo.hasCodeActions) {
          actions.dispose();
          if (menuActions.length === 0) {
            quickfixPlaceholderElement.textContent = localize(1318, null);
          } else {
            quickfixPlaceholderElement.style.display = "none";
          }
          renderMenuActions();
          return;
        }
        quickfixPlaceholderElement.style.display = "none";
        let showing = false;
        disposables.add(toDisposable(() => {
          if (!showing) {
            actions.dispose();
          }
        }));
        context2.statusBar.addAction({
          label: localize(1319, null),
          commandId: quickFixCommandId,
          run: (target) => {
            showing = true;
            const controller = CodeActionController.get(this._editor);
            const elementPosition = getDomNodePagePosition(target);
            controller?.showCodeActions(markerCodeActionTrigger, actions, {
              x: elementPosition.left,
              y: elementPosition.top,
              width: elementPosition.width,
              height: elementPosition.height
            });
          }
        });
        const aiCodeAction = actions.validActions.find((action) => action.action.isAI);
        if (aiCodeAction) {
          context2.statusBar.addAction({
            label: aiCodeAction.action.title,
            commandId: aiCodeAction.action.command?.id ?? "",
            iconClass: ThemeIcon.asClassName(Codicon.sparkle),
            run: () => {
              const controller = CodeActionController.get(this._editor);
              controller?.applyCodeAction(aiCodeAction, false, false, "fromProblemsHover" /* FromProblemsHover */);
            }
          });
        } else {
          renderMenuActions();
        }
        context2.onContentsChanged();
      }, onUnexpectedError);
    } else {
      renderMenuActions();
    }
    return disposables;
  }
  getCodeActions(marker) {
    return createCancelablePromise((cancellationToken) => {
      return getCodeActions(
        this._languageFeaturesService.codeActionProvider,
        this._editor.getModel(),
        new Range2(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn),
        markerCodeActionTrigger,
        Progress.None,
        cancellationToken
      );
    });
  }
};

MarkerHoverParticipant = __decorateClass([
  __decorateParam(1, IMarkerDecorationsService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService)
], MarkerHoverParticipant);
export { $14, MarkerHover, markerCodeActionTrigger, MarkerHoverParticipant };
