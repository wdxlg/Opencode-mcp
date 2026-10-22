// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { BannerController } from "./module-0853.mjs";
import { safeIntl } from "./module-0120.mjs";
import { language } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { inUntrustedWorkspace, unicodeHighlightConfigKeys } from "./module-0105.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { isModelDecorationInComment, isModelDecorationInString, isModelDecorationVisible } from "./module-0242.mjs";
import { UnicodeTextModelHighlighter } from "./module-0172.mjs";
import { InvisibleCharacters, isBasicASCII } from "./module-0030.mjs";
import { MarkdownString, createCommandUri } from "./module-0462.mjs";
import { MarkdownHover, renderMarkdownHovers } from "./module-0608.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { EditorAction, registerEditorContribution } from "./module-0097.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { HoverParticipantRegistry } from "./module-0575.mjs";


// src/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.ts
var warningIcon = registerIcon("extensions-warning-message", Codicon.warning, localize(1743, null));

var UnicodeHighlighter = class extends Disposable {
  constructor(_editor, _editorWorkerService, _workspaceTrustService, instantiationService) {
    super();
    this._editor = _editor;
    this._editorWorkerService = _editorWorkerService;
    this._workspaceTrustService = _workspaceTrustService;
    this._highlighter = null;
    this._bannerClosed = false;
    this._updateState = (state) => {
      if (state && state.hasMore) {
        if (this._bannerClosed) {
          return;
        }
        const max = Math.max(state.ambiguousCharacterCount, state.nonBasicAsciiCharacterCount, state.invisibleCharacterCount);
        let data;
        if (state.nonBasicAsciiCharacterCount >= max) {
          data = {
            message: localize(1742, null),
            command: new DisableHighlightingOfNonBasicAsciiCharactersAction()
          };
        } else if (state.ambiguousCharacterCount >= max) {
          data = {
            message: localize(1740, null),
            command: new DisableHighlightingOfAmbiguousCharactersAction()
          };
        } else if (state.invisibleCharacterCount >= max) {
          data = {
            message: localize(1741, null),
            command: new DisableHighlightingOfInvisibleCharactersAction()
          };
        } else {
          throw new Error("Unreachable");
        }
        this._bannerController.show({
          id: "unicodeHighlightBanner",
          message: data.message,
          icon: warningIcon,
          actions: [
            {
              label: data.command.shortLabel,
              href: `command:${data.command.desc.id}`
            }
          ],
          onClose: () => {
            this._bannerClosed = true;
          }
        });
      } else {
        this._bannerController.hide();
      }
    };
    this._bannerController = this._register(instantiationService.createInstance(BannerController, _editor));
    this._register(this._editor.onDidChangeModel(() => {
      this._bannerClosed = false;
      this._updateHighlighter();
    }));
    this._options = _editor.getOption(142 /* unicodeHighlighting */);
    this._register(_workspaceTrustService.onDidChangeTrust((e) => {
      this._updateHighlighter();
    }));
    this._register(_editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(142 /* unicodeHighlighting */)) {
        this._options = _editor.getOption(142 /* unicodeHighlighting */);
        this._updateHighlighter();
      }
    }));
    this._updateHighlighter();
  }
  static {
    this.ID = "editor.contrib.unicodeHighlighter";
  }
  dispose() {
    if (this._highlighter) {
      this._highlighter.dispose();
      this._highlighter = null;
    }
    super.dispose();
  }
  _updateHighlighter() {
    this._updateState(null);
    if (this._highlighter) {
      this._highlighter.dispose();
      this._highlighter = null;
    }
    if (!this._editor.hasModel()) {
      return;
    }
    const options3 = resolveOptions2(this._workspaceTrustService.isWorkspaceTrusted(), this._options);
    if ([
      options3.nonBasicASCII,
      options3.ambiguousCharacters,
      options3.invisibleCharacters
    ].every((option2) => option2 === false)) {
      return;
    }
    const highlightOptions = {
      nonBasicASCII: options3.nonBasicASCII,
      ambiguousCharacters: options3.ambiguousCharacters,
      invisibleCharacters: options3.invisibleCharacters,
      includeComments: options3.includeComments,
      includeStrings: options3.includeStrings,
      allowedCodePoints: Object.keys(options3.allowedCharacters).map((c) => c.codePointAt(0)),
      allowedLocales: Object.keys(options3.allowedLocales).map((locale2) => {
        if (locale2 === "_os") {
          const osLocale = safeIntl.NumberFormat().value.resolvedOptions().locale;
          return osLocale;
        } else if (locale2 === "_vscode") {
          return language;
        }
        return locale2;
      })
    };
    if (this._editorWorkerService.canComputeUnicodeHighlights(this._editor.getModel().uri)) {
      this._highlighter = new DocumentUnicodeHighlighter(this._editor, highlightOptions, this._updateState, this._editorWorkerService);
    } else {
      this._highlighter = new ViewportUnicodeHighlighter(this._editor, highlightOptions, this._updateState);
    }
  }
  getDecorationInfo(decoration3) {
    if (this._highlighter) {
      return this._highlighter.getDecorationInfo(decoration3);
    }
    return null;
  }
};

UnicodeHighlighter = __decorateClass([
  __decorateParam(1, IEditorWorkerService),
  __decorateParam(2, IWorkspaceTrustManagementService),
  __decorateParam(3, IInstantiationService)
], UnicodeHighlighter);

function resolveOptions2(trusted, options3) {
  return {
    nonBasicASCII: options3.nonBasicASCII === inUntrustedWorkspace ? !trusted : options3.nonBasicASCII,
    ambiguousCharacters: options3.ambiguousCharacters,
    invisibleCharacters: options3.invisibleCharacters,
    includeComments: options3.includeComments === inUntrustedWorkspace ? !trusted : options3.includeComments,
    includeStrings: options3.includeStrings === inUntrustedWorkspace ? !trusted : options3.includeStrings,
    allowedCharacters: options3.allowedCharacters,
    allowedLocales: options3.allowedLocales
  };
}

var DocumentUnicodeHighlighter = class extends Disposable {
  constructor(_editor, _options, _updateState, _editorWorkerService) {
    super();
    this._editor = _editor;
    this._options = _options;
    this._updateState = _updateState;
    this._editorWorkerService = _editorWorkerService;
    this._model = this._editor.getModel();
    this._decorations = this._editor.createDecorationsCollection();
    this._updateSoon = this._register(new RunOnceScheduler(() => this._update(), 250));
    this._register(this._editor.onDidChangeModelContent(() => {
      this._updateSoon.schedule();
    }));
    this._updateSoon.schedule();
  }
  dispose() {
    this._decorations.clear();
    super.dispose();
  }
  _update() {
    if (this._model.isDisposed()) {
      return;
    }
    if (!this._model.mightContainNonBasicASCII()) {
      this._decorations.clear();
      return;
    }
    const modelVersionId = this._model.getVersionId();
    this._editorWorkerService.computedUnicodeHighlights(this._model.uri, this._options).then((info) => {
      if (this._model.isDisposed()) {
        return;
      }
      if (this._model.getVersionId() !== modelVersionId) {
        return;
      }
      this._updateState(info);
      const decorations = [];
      if (!info.hasMore) {
        for (const range2 of info.ranges) {
          decorations.push({
            range: range2,
            options: Decorations.instance.getDecorationFromOptions(this._options)
          });
        }
      }
      this._decorations.set(decorations);
    });
  }
  getDecorationInfo(decoration3) {
    if (!this._decorations.has(decoration3)) {
      return null;
    }
    const model = this._editor.getModel();
    if (!isModelDecorationVisible(model, decoration3)) {
      return null;
    }
    const text2 = model.getValueInRange(decoration3.range);
    return {
      reason: computeReason(text2, this._options),
      inComment: isModelDecorationInComment(model, decoration3),
      inString: isModelDecorationInString(model, decoration3)
    };
  }
};

DocumentUnicodeHighlighter = __decorateClass([
  __decorateParam(3, IEditorWorkerService)
], DocumentUnicodeHighlighter);

var ViewportUnicodeHighlighter = class extends Disposable {
  constructor(_editor, _options, _updateState) {
    super();
    this._editor = _editor;
    this._options = _options;
    this._updateState = _updateState;
    this._model = this._editor.getModel();
    this._decorations = this._editor.createDecorationsCollection();
    this._updateSoon = this._register(new RunOnceScheduler(() => this._update(), 250));
    this._register(this._editor.onDidLayoutChange(() => {
      this._updateSoon.schedule();
    }));
    this._register(this._editor.onDidScrollChange(() => {
      this._updateSoon.schedule();
    }));
    this._register(this._editor.onDidChangeHiddenAreas(() => {
      this._updateSoon.schedule();
    }));
    this._register(this._editor.onDidChangeModelContent(() => {
      this._updateSoon.schedule();
    }));
    this._updateSoon.schedule();
  }
  dispose() {
    this._decorations.clear();
    super.dispose();
  }
  _update() {
    if (this._model.isDisposed()) {
      return;
    }
    if (!this._model.mightContainNonBasicASCII()) {
      this._decorations.clear();
      return;
    }
    const ranges = this._editor.getVisibleRanges();
    const decorations = [];
    const totalResult = {
      ranges: [],
      ambiguousCharacterCount: 0,
      invisibleCharacterCount: 0,
      nonBasicAsciiCharacterCount: 0,
      hasMore: false
    };
    for (const range2 of ranges) {
      const result = UnicodeTextModelHighlighter.computeUnicodeHighlights(this._model, this._options, range2);
      for (const r2 of result.ranges) {
        totalResult.ranges.push(r2);
      }
      totalResult.ambiguousCharacterCount += totalResult.ambiguousCharacterCount;
      totalResult.invisibleCharacterCount += totalResult.invisibleCharacterCount;
      totalResult.nonBasicAsciiCharacterCount += totalResult.nonBasicAsciiCharacterCount;
      totalResult.hasMore = totalResult.hasMore || result.hasMore;
    }
    if (!totalResult.hasMore) {
      for (const range2 of totalResult.ranges) {
        decorations.push({ range: range2, options: Decorations.instance.getDecorationFromOptions(this._options) });
      }
    }
    this._updateState(totalResult);
    this._decorations.set(decorations);
  }
  getDecorationInfo(decoration3) {
    if (!this._decorations.has(decoration3)) {
      return null;
    }
    const model = this._editor.getModel();
    const text2 = model.getValueInRange(decoration3.range);
    if (!isModelDecorationVisible(model, decoration3)) {
      return null;
    }
    return {
      reason: computeReason(text2, this._options),
      inComment: isModelDecorationInComment(model, decoration3),
      inString: isModelDecorationInString(model, decoration3)
    };
  }
};

var configureUnicodeHighlightOptionsStr = localize(1732, null);

var UnicodeHighlighterHoverParticipant = class {
  constructor(_editor, _markdownRendererService) {
    this._editor = _editor;
    this._markdownRendererService = _markdownRendererService;
    this.hoverOrdinal = 5;
  }
  computeSync(anchor, lineDecorations) {
    if (!this._editor.hasModel() || anchor.type !== 1 /* Range */) {
      return [];
    }
    const model = this._editor.getModel();
    const unicodeHighlighter = this._editor.getContribution(UnicodeHighlighter.ID);
    if (!unicodeHighlighter) {
      return [];
    }
    const result = [];
    const existedReason = /* @__PURE__ */ new Set();
    let index2 = 300;
    for (const d of lineDecorations) {
      const highlightInfo = unicodeHighlighter.getDecorationInfo(d);
      if (!highlightInfo) {
        continue;
      }
      const char = model.getValueInRange(d.range);
      const codePoint = char.codePointAt(0);
      const codePointStr = formatCodePointMarkdown(codePoint);
      let reason;
      switch (highlightInfo.reason.kind) {
        case 0 /* Ambiguous */: {
          if (isBasicASCII(highlightInfo.reason.confusableWith)) {
            reason = localize(
              1729,
              null,
              codePointStr,
              formatCodePointMarkdown(highlightInfo.reason.confusableWith.codePointAt(0))
            );
          } else {
            reason = localize(
              1728,
              null,
              codePointStr,
              formatCodePointMarkdown(highlightInfo.reason.confusableWith.codePointAt(0))
            );
          }
          break;
        }
        case 1 /* Invisible */:
          reason = localize(
            1730,
            null,
            codePointStr
          );
          break;
        case 2 /* NonBasicAscii */:
          reason = localize(
            1731,
            null,
            codePointStr
          );
          break;
      }
      if (existedReason.has(reason)) {
        continue;
      }
      existedReason.add(reason);
      const adjustSettingsArgs = {
        codePoint,
        reason: highlightInfo.reason,
        inComment: highlightInfo.inComment,
        inString: highlightInfo.inString
      };
      const adjustSettings = localize(1726, null);
      const uri5 = createCommandUri(ShowExcludeOptions.ID, adjustSettingsArgs);
      const markdown = new MarkdownString("", true).appendMarkdown(reason).appendText(" ").appendLink(uri5, adjustSettings, configureUnicodeHighlightOptionsStr);
      result.push(new MarkdownHover(this, d.range, [markdown], false, index2++));
    }
    return result;
  }
  renderHoverParts(context2, hoverParts) {
    return renderMarkdownHovers(context2, hoverParts, this._editor, this._markdownRendererService);
  }
  getAccessibleContent(hoverPart) {
    return hoverPart.contents.map((c) => c.value).join("\n");
  }
};

UnicodeHighlighterHoverParticipant = __decorateClass([
  __decorateParam(1, IMarkdownRendererService)
], UnicodeHighlighterHoverParticipant);

function codePointToHex(codePoint) {
  return `U+${codePoint.toString(16).padStart(4, "0")}`;
}

function formatCodePointMarkdown(codePoint) {
  let value2 = `\`${codePointToHex(codePoint)}\``;
  if (!InvisibleCharacters.isInvisibleCharacter(codePoint)) {
    value2 += ` "${`${renderCodePointAsInlineCode(codePoint)}`}"`;
  }
  return value2;
}

function renderCodePointAsInlineCode(codePoint) {
  if (codePoint === 96 /* BackTick */) {
    return "`` ` ``";
  }
  return "`" + String.fromCodePoint(codePoint) + "`";
}

function computeReason(char, options3) {
  return UnicodeTextModelHighlighter.computeUnicodeHighlightReason(char, options3);
}

var Decorations = class _Decorations {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  static {
    this.instance = new _Decorations();
  }
  getDecorationFromOptions(options3) {
    return this.getDecoration(!options3.includeComments, !options3.includeStrings);
  }
  getDecoration(hideInComments, hideInStrings) {
    const key3 = `${hideInComments}${hideInStrings}`;
    let options3 = this.map.get(key3);
    if (!options3) {
      options3 = ModelDecorationOptions.createDynamic({
        description: "unicode-highlight",
        stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
        className: "unicode-highlight",
        showIfCollapsed: true,
        overviewRuler: null,
        minimap: null,
        hideInCommentTokens: hideInComments,
        hideInStringTokens: hideInStrings
      });
      this.map.set(key3, options3);
    }
    return options3;
  }
};

var DisableHighlightingInCommentsAction = class extends EditorAction {
  constructor() {
    super({
      id: DisableHighlightingOfAmbiguousCharactersAction.ID,
      label: localize2(1720, "Disable highlighting of characters in comments"),
      precondition: void 0
    });
    this.shortLabel = localize(1733, null);
  }
  static {
    this.ID = "editor.action.unicodeHighlight.disableHighlightingInComments";
  }
  async run(accessor, editor) {
    const configurationService = accessor.get(IConfigurationService);
    if (configurationService) {
      this.runAction(configurationService);
    }
  }
  async runAction(configurationService) {
    await configurationService.updateValue(unicodeHighlightConfigKeys.includeComments, false, 2 /* USER */);
  }
};

var DisableHighlightingInStringsAction = class extends EditorAction {
  constructor() {
    super({
      id: DisableHighlightingOfAmbiguousCharactersAction.ID,
      label: localize2(1721, "Disable highlighting of characters in strings"),
      precondition: void 0
    });
    this.shortLabel = localize(1734, null);
  }
  static {
    this.ID = "editor.action.unicodeHighlight.disableHighlightingInStrings";
  }
  async run(accessor, editor) {
    const configurationService = accessor.get(IConfigurationService);
    if (configurationService) {
      this.runAction(configurationService);
    }
  }
  async runAction(configurationService) {
    await configurationService.updateValue(unicodeHighlightConfigKeys.includeStrings, false, 2 /* USER */);
  }
};

var DisableHighlightingOfAmbiguousCharactersAction = class _DisableHighlightingOfAmbiguousCharactersAction extends Action2 {
  constructor() {
    super({
      id: _DisableHighlightingOfAmbiguousCharactersAction.ID,
      title: localize2(1722, "Disable highlighting of ambiguous characters"),
      precondition: void 0,
      f1: false
    });
    this.shortLabel = localize(1735, null);
  }
  static {
    this.ID = "editor.action.unicodeHighlight.disableHighlightingOfAmbiguousCharacters";
  }
  async run(accessor, editor) {
    const configurationService = accessor.get(IConfigurationService);
    if (configurationService) {
      this.runAction(configurationService);
    }
  }
  async runAction(configurationService) {
    await configurationService.updateValue(unicodeHighlightConfigKeys.ambiguousCharacters, false, 2 /* USER */);
  }
};

var DisableHighlightingOfInvisibleCharactersAction = class _DisableHighlightingOfInvisibleCharactersAction extends Action2 {
  constructor() {
    super({
      id: _DisableHighlightingOfInvisibleCharactersAction.ID,
      title: localize2(1723, "Disable highlighting of invisible characters"),
      precondition: void 0,
      f1: false
    });
    this.shortLabel = localize(1736, null);
  }
  static {
    this.ID = "editor.action.unicodeHighlight.disableHighlightingOfInvisibleCharacters";
  }
  async run(accessor, editor) {
    const configurationService = accessor.get(IConfigurationService);
    if (configurationService) {
      this.runAction(configurationService);
    }
  }
  async runAction(configurationService) {
    await configurationService.updateValue(unicodeHighlightConfigKeys.invisibleCharacters, false, 2 /* USER */);
  }
};

var DisableHighlightingOfNonBasicAsciiCharactersAction = class _DisableHighlightingOfNonBasicAsciiCharactersAction extends Action2 {
  constructor() {
    super({
      id: _DisableHighlightingOfNonBasicAsciiCharactersAction.ID,
      title: localize2(1724, "Disable highlighting of non basic ASCII characters"),
      precondition: void 0,
      f1: false
    });
    this.shortLabel = localize(1737, null);
  }
  static {
    this.ID = "editor.action.unicodeHighlight.disableHighlightingOfNonBasicAsciiCharacters";
  }
  async run(accessor, editor) {
    const configurationService = accessor.get(IConfigurationService);
    if (configurationService) {
      this.runAction(configurationService);
    }
  }
  async runAction(configurationService) {
    await configurationService.updateValue(unicodeHighlightConfigKeys.nonBasicASCII, false, 2 /* USER */);
  }
};

var ShowExcludeOptions = class _ShowExcludeOptions extends Action2 {
  static {
    this.ID = "editor.action.unicodeHighlight.showExcludeOptions";
  }
  constructor() {
    super({
      id: _ShowExcludeOptions.ID,
      title: localize2(1725, "Show Exclude Options"),
      precondition: void 0,
      f1: false
    });
  }
  async run(accessor, args2) {
    const { codePoint, reason, inString, inComment } = args2;
    const char = String.fromCodePoint(codePoint);
    const quickPickService = accessor.get(IQuickInputService);
    const configurationService = accessor.get(IConfigurationService);
    function getExcludeCharFromBeingHighlightedLabel(codePoint2) {
      if (InvisibleCharacters.isInvisibleCharacter(codePoint2)) {
        return localize(1739, null, codePointToHex(codePoint2));
      }
      return localize(1738, null, `${codePointToHex(codePoint2)} "${char}"`);
    }
    const options3 = [];
    if (reason.kind === 0 /* Ambiguous */) {
      for (const locale2 of reason.notAmbiguousInLocales) {
        options3.push({
          label: localize(1727, null, locale2),
          run: async () => {
            excludeLocaleFromBeingHighlighted(configurationService, [locale2]);
          }
        });
      }
    }
    options3.push(
      {
        label: getExcludeCharFromBeingHighlightedLabel(codePoint),
        run: () => excludeCharFromBeingHighlighted(configurationService, [codePoint])
      }
    );
    if (inComment) {
      const action = new DisableHighlightingInCommentsAction();
      options3.push({ label: action.label, run: async () => action.runAction(configurationService) });
    } else if (inString) {
      const action = new DisableHighlightingInStringsAction();
      options3.push({ label: action.label, run: async () => action.runAction(configurationService) });
    }
    function getTitle(options4) {
      return typeof options4.desc.title === "string" ? options4.desc.title : options4.desc.title.value;
    }
    if (reason.kind === 0 /* Ambiguous */) {
      const action = new DisableHighlightingOfAmbiguousCharactersAction();
      options3.push({ label: getTitle(action), run: async () => action.runAction(configurationService) });
    } else if (reason.kind === 1 /* Invisible */) {
      const action = new DisableHighlightingOfInvisibleCharactersAction();
      options3.push({ label: getTitle(action), run: async () => action.runAction(configurationService) });
    } else if (reason.kind === 2 /* NonBasicAscii */) {
      const action = new DisableHighlightingOfNonBasicAsciiCharactersAction();
      options3.push({ label: getTitle(action), run: async () => action.runAction(configurationService) });
    } else {
      expectNever(reason);
    }
    const result = await quickPickService.pick(
      options3,
      { title: configureUnicodeHighlightOptionsStr }
    );
    if (result) {
      await result.run();
    }
  }
};

async function excludeCharFromBeingHighlighted(configurationService, charCodes) {
  const existingValue = configurationService.getValue(unicodeHighlightConfigKeys.allowedCharacters);
  let value2;
  if (typeof existingValue === "object" && existingValue) {
    value2 = existingValue;
  } else {
    value2 = {};
  }
  for (const charCode of charCodes) {
    value2[String.fromCodePoint(charCode)] = true;
  }
  await configurationService.updateValue(unicodeHighlightConfigKeys.allowedCharacters, value2, 2 /* USER */);
}

async function excludeLocaleFromBeingHighlighted(configurationService, locales) {
  const existingValue = configurationService.inspect(unicodeHighlightConfigKeys.allowedLocales).user?.value;
  let value2;
  if (typeof existingValue === "object" && existingValue) {
    value2 = Object.assign({}, existingValue);
  } else {
    value2 = {};
  }
  for (const locale2 of locales) {
    value2[locale2] = true;
  }
  await configurationService.updateValue(unicodeHighlightConfigKeys.allowedLocales, value2, 2 /* USER */);
}

function expectNever(value2) {
  throw new Error(`Unexpected value: ${value2}`);
}

registerAction2(DisableHighlightingOfAmbiguousCharactersAction);

registerAction2(DisableHighlightingOfInvisibleCharactersAction);

registerAction2(DisableHighlightingOfNonBasicAsciiCharactersAction);

registerAction2(ShowExcludeOptions);

registerEditorContribution(UnicodeHighlighter.ID, UnicodeHighlighter, 1 /* AfterFirstRender */);

HoverParticipantRegistry.register(UnicodeHighlighterHoverParticipant);
export { resolveOptions2, codePointToHex, formatCodePointMarkdown, renderCodePointAsInlineCode, computeReason, excludeCharFromBeingHighlighted, excludeLocaleFromBeingHighlighted, expectNever, warningIcon, UnicodeHighlighter, DocumentUnicodeHighlighter, ViewportUnicodeHighlighter, configureUnicodeHighlightOptionsStr, UnicodeHighlighterHoverParticipant, Decorations, DisableHighlightingInCommentsAction, DisableHighlightingInStringsAction, DisableHighlightingOfAmbiguousCharactersAction, DisableHighlightingOfInvisibleCharactersAction, DisableHighlightingOfNonBasicAsciiCharactersAction, ShowExcludeOptions };
