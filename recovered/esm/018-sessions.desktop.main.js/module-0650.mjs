// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlayHints/browser/inlayHintsHover.ts
import { HoverForeignElementAnchor } from "./module-0575.mjs";
import { MarkdownHover, MarkdownHoverParticipant } from "./module-0608.mjs";
import { InlayHintsController, RenderedInlayHintLabelPart } from "./module-0649.mjs";
import { ModelDecorationInjectedTextOptions } from "./module-0423.mjs";
import { AsyncIterableProducer } from "./module-0036.mjs";
import { MarkdownString, isEmptyMarkdownString } from "./module-0462.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { localize } from "./module-0001.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { asCommandLink } from "./module-0620.mjs";
import { getHoverProviderResultsAsAsyncIterable } from "./module-0607.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/editor/contrib/inlayHints/browser/inlayHintsHover.ts
var InlayHintsHoverAnchor = class extends HoverForeignElementAnchor {
  constructor(part, owner, initialMousePosX, initialMousePosY) {
    super(10, owner, part.item.anchor.range, initialMousePosX, initialMousePosY, true);
    this.part = part;
  }
};

var InlayHintsHover = class extends MarkdownHoverParticipant {
  constructor(editor, markdownRendererService, keybindingService, hoverService, configurationService, _resolverService, languageFeaturesService, commandService) {
    super(editor, markdownRendererService, configurationService, languageFeaturesService, keybindingService, hoverService, commandService);
    this._resolverService = _resolverService;
    this.hoverOrdinal = 6;
  }
  suggestHoverAnchor(mouseEvent) {
    const controller = InlayHintsController.get(this._editor);
    if (!controller) {
      return null;
    }
    if (mouseEvent.target.type !== 6 /* CONTENT_TEXT */) {
      return null;
    }
    const options3 = mouseEvent.target.detail.injectedText?.options;
    if (!(options3 instanceof ModelDecorationInjectedTextOptions && options3.attachedData instanceof RenderedInlayHintLabelPart)) {
      return null;
    }
    return new InlayHintsHoverAnchor(options3.attachedData, this, mouseEvent.event.posx, mouseEvent.event.posy);
  }
  computeSync() {
    return [];
  }
  computeAsync(anchor, _lineDecorations, source, token) {
    if (!(anchor instanceof InlayHintsHoverAnchor)) {
      return AsyncIterableProducer.EMPTY;
    }
    return new AsyncIterableProducer(async (executor) => {
      const { part } = anchor;
      await part.item.resolve(token);
      if (token.isCancellationRequested) {
        return;
      }
      let itemTooltip;
      if (typeof part.item.hint.tooltip === "string") {
        itemTooltip = new MarkdownString().appendText(part.item.hint.tooltip);
      } else if (part.item.hint.tooltip) {
        itemTooltip = part.item.hint.tooltip;
      }
      if (itemTooltip) {
        executor.emitOne(new MarkdownHover(this, anchor.range, [itemTooltip], false, 0));
      }
      if (isNonEmptyArray(part.item.hint.textEdits)) {
        executor.emitOne(new MarkdownHover(this, anchor.range, [new MarkdownString().appendText(localize(1342, null))], false, 10001));
      }
      let partTooltip;
      if (typeof part.part.tooltip === "string") {
        partTooltip = new MarkdownString().appendText(part.part.tooltip);
      } else if (part.part.tooltip) {
        partTooltip = part.part.tooltip;
      }
      if (partTooltip) {
        executor.emitOne(new MarkdownHover(this, anchor.range, [partTooltip], false, 1));
      }
      if (part.part.location || part.part.command) {
        let linkHint;
        const useMetaKey = this._editor.getOption(86 /* multiCursorModifier */) === "altKey";
        const kb = useMetaKey ? isMacintosh ? localize(1348, null) : localize(1347, null) : isMacintosh ? localize(1346, null) : localize(1345, null);
        if (part.part.location && part.part.command) {
          linkHint = new MarkdownString().appendText(localize(1344, null, kb));
        } else if (part.part.location) {
          linkHint = new MarkdownString().appendText(localize(1343, null, kb));
        } else if (part.part.command) {
          linkHint = new MarkdownString(`[${localize(1341, null)}](${asCommandLink(part.part.command)} "${part.part.command.title}") (${kb})`, { isTrusted: true });
        }
        if (linkHint) {
          executor.emitOne(new MarkdownHover(this, anchor.range, [linkHint], false, 1e4));
        }
      }
      const iterable = this._resolveInlayHintLabelPartHover(part, token);
      for await (const item of iterable) {
        executor.emitOne(item);
      }
    });
  }
  async *_resolveInlayHintLabelPartHover(part, token) {
    if (!part.part.location) {
      return;
    }
    const { uri: uri4, range: range2 } = part.part.location;
    const ref = await this._resolverService.createModelReference(uri4);
    try {
      const model = ref.object.textEditorModel;
      if (!this._languageFeaturesService.hoverProvider.has(model)) {
        return;
      }
      for await (const item of getHoverProviderResultsAsAsyncIterable(this._languageFeaturesService.hoverProvider, model, new Position(range2.startLineNumber, range2.startColumn), token)) {
        if (!isEmptyMarkdownString(item.hover.contents)) {
          yield new MarkdownHover(this, part.item.anchor.range, item.hover.contents, false, 2 + item.ordinal);
        }
      }
    } finally {
      ref.dispose();
    }
  }
};

InlayHintsHover = __decorateClass([
  __decorateParam(1, IMarkdownRendererService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ITextModelService),
  __decorateParam(6, ILanguageFeaturesService),
  __decorateParam(7, ICommandService)
], InlayHintsHover);
export { InlayHintsHoverAnchor, InlayHintsHover };
