// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/hintsWidget/hoverParticipant.ts
import { InlineCompletionsController } from "./module-0796.mjs";
import { HoverForeignElementAnchor, RenderedHoverParts } from "./module-0575.mjs";
import { Range2 } from "./module-0106.mjs";
import { GhostTextView } from "./module-0763.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { InlineSuggestionHintsContentWidget } from "./module-0581.mjs";
import { constObservable } from "./module-0061.mjs";
import { localize } from "./module-0001.mjs";
import { $, append, reset } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/hintsWidget/hoverParticipant.ts
var InlineCompletionsHover = class {
  constructor(owner, range2, controller) {
    this.owner = owner;
    this.range = range2;
    this.controller = controller;
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === 1 /* Range */ && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
};

var InlineCompletionsHoverParticipant = class {
  constructor(_editor, accessibilityService, _instantiationService, _telemetryService, _markdownRendererService) {
    this._editor = _editor;
    this.accessibilityService = accessibilityService;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
    this._markdownRendererService = _markdownRendererService;
    this.hoverOrdinal = 4;
    this.hideCopyButton = true;
  }
  suggestHoverAnchor(mouseEvent) {
    const controller = InlineCompletionsController.get(this._editor);
    if (!controller) {
      return null;
    }
    const target = mouseEvent.target;
    if (target.type === 8 /* CONTENT_VIEW_ZONE */) {
      const viewZoneData = target.detail;
      if (controller.shouldShowHoverAtViewZone(viewZoneData.viewZoneId)) {
        return new HoverForeignElementAnchor(1e3, this, Range2.fromPositions(this._editor.getModel().validatePosition(viewZoneData.positionBefore || viewZoneData.position)), mouseEvent.event.posx, mouseEvent.event.posy, false);
      }
    }
    if (target.type === 7 /* CONTENT_EMPTY */) {
      if (controller.shouldShowHoverAt(target.range)) {
        return new HoverForeignElementAnchor(1e3, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
      }
    }
    if (target.type === 6 /* CONTENT_TEXT */) {
      const mightBeForeignElement = target.detail.mightBeForeignElement;
      if (mightBeForeignElement && controller.shouldShowHoverAt(target.range)) {
        return new HoverForeignElementAnchor(1e3, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
      }
    }
    if (target.type === 9 /* CONTENT_WIDGET */ && target.element) {
      const ctx = GhostTextView.getWarningWidgetContext(target.element);
      if (ctx && controller.shouldShowHoverAt(ctx.range)) {
        return new HoverForeignElementAnchor(1e3, this, ctx.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
      }
    }
    return null;
  }
  computeSync(anchor, lineDecorations) {
    if (this._editor.getOption(71 /* inlineSuggest */).showToolbar !== "onHover") {
      return [];
    }
    const controller = InlineCompletionsController.get(this._editor);
    if (controller && controller.shouldShowHoverAt(anchor.range)) {
      return [new InlineCompletionsHover(this, anchor.range, controller)];
    }
    return [];
  }
  renderHoverParts(context2, hoverParts) {
    const disposables = new DisposableStore();
    const part = hoverParts[0];
    this._telemetryService.publicLog2("inlineCompletionHover.shown");
    if (this.accessibilityService.isScreenReaderOptimized() && !this._editor.getOption(12 /* screenReaderAnnounceInlineSuggestion */)) {
      disposables.add(this.renderScreenReaderText(context2, part));
    }
    const model = part.controller.model.get();
    const widgetNode = document.createElement("div");
    context2.fragment.appendChild(widgetNode);
    disposables.add(autorunWithStore((reader, store) => {
      const w = store.add(this._instantiationService.createInstance(
        InlineSuggestionHintsContentWidget.hot.read(reader),
        this._editor,
        false,
        constObservable(null),
        model.selectedInlineCompletionIndex,
        model.inlineCompletionsCount,
        model.activeCommands,
        model.warning,
        () => {
          context2.onContentsChanged();
        }
      ));
      widgetNode.replaceChildren(w.getDomNode());
    }));
    model.triggerExplicitly();
    const renderedHoverPart = {
      hoverPart: part,
      hoverElement: widgetNode,
      dispose() {
        disposables.dispose();
      }
    };
    return new RenderedHoverParts([renderedHoverPart]);
  }
  getAccessibleContent(hoverPart) {
    return localize(1388, null);
  }
  renderScreenReaderText(context2, part) {
    const disposables = new DisposableStore();
    const $110 = $;
    const markdownHoverElement = $110("div.hover-row.markdown-hover");
    const hoverContentsElement = append(markdownHoverElement, $110("div.hover-contents", { ["aria-live"]: "assertive" }));
    const render = (code) => {
      const inlineSuggestionAvailable = localize(1389, null);
      const renderedContents = disposables.add(this._markdownRendererService.render(new MarkdownString().appendText(inlineSuggestionAvailable).appendCodeblock("text", code), {
        context: this._editor,
        asyncRenderCallback: () => {
          hoverContentsElement.className = "hover-contents code-hover-contents";
          context2.onContentsChanged();
        }
      }));
      hoverContentsElement.replaceChildren(renderedContents.element);
    };
    disposables.add(autorun((reader) => {
      const ghostText = part.controller.model.read(reader)?.primaryGhostText.read(reader);
      if (ghostText) {
        const lineText = this._editor.getModel().getLineContent(ghostText.lineNumber);
        render(ghostText.renderForScreenReader(lineText));
      } else {
        reset(hoverContentsElement);
      }
    }));
    context2.fragment.appendChild(markdownHoverElement);
    return disposables;
  }
};

InlineCompletionsHoverParticipant = __decorateClass([
  __decorateParam(1, IAccessibilityService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IMarkdownRendererService)
], InlineCompletionsHoverParticipant);
export { InlineCompletionsHover, InlineCompletionsHoverParticipant };
