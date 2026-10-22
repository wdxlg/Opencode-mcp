// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/diffEditorOptions.ts
import { observableValue } from "./module-0048.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { derivedConstOnceDefined } from "./module-0065.mjs";
import { diffEditorDefaultOptions } from "./module-0499.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { allowsTrueInlineDiffRendering } from "./module-0489.mjs";
import { boolean, clampedFloat, clampedInt, stringSet } from "./module-0105.mjs";


// src/vs/editor/browser/widget/diffEditor/diffEditorOptions.ts
var DiffEditorOptions = class {
  constructor(options3, _accessibilityService) {
    this._accessibilityService = _accessibilityService;
    this._diffEditorWidth = observableValue(this, 0);
    this._screenReaderMode = observableFromEvent(this, this._accessibilityService.onDidChangeScreenReaderOptimized, () => this._accessibilityService.isScreenReaderOptimized());
    this.couldShowInlineViewBecauseOfSize = derived(
      this,
      (reader) => this._options.read(reader).renderSideBySide && this._diffEditorWidth.read(reader) <= this._options.read(reader).renderSideBySideInlineBreakpoint
    );
    this.renderOverviewRuler = derived(this, (reader) => this._options.read(reader).renderOverviewRuler);
    this.renderSideBySide = derived(this, (reader) => {
      if (this.compactMode.read(reader)) {
        if (this.shouldRenderInlineViewInSmartMode.read(reader)) {
          return false;
        }
      }
      return this._options.read(reader).renderSideBySide && !(this._options.read(reader).useInlineViewWhenSpaceIsLimited && this.couldShowInlineViewBecauseOfSize.read(reader) && !this._screenReaderMode.read(reader));
    });
    this.readOnly = derived(this, (reader) => this._options.read(reader).readOnly);
    this.shouldRenderOldRevertArrows = derived(this, (reader) => {
      if (!this._options.read(reader).renderMarginRevertIcon) {
        return false;
      }
      if (!this.renderSideBySide.read(reader)) {
        return false;
      }
      if (this.readOnly.read(reader)) {
        return false;
      }
      if (this.shouldRenderGutterMenu.read(reader)) {
        return false;
      }
      return true;
    });
    this.shouldRenderGutterMenu = derived(this, (reader) => this._options.read(reader).renderGutterMenu);
    this.renderIndicators = derived(this, (reader) => this._options.read(reader).renderIndicators);
    this.enableSplitViewResizing = derived(this, (reader) => this._options.read(reader).enableSplitViewResizing);
    this.splitViewDefaultRatio = derived(this, (reader) => this._options.read(reader).splitViewDefaultRatio);
    this.ignoreTrimWhitespace = derived(this, (reader) => this._options.read(reader).ignoreTrimWhitespace);
    this.maxComputationTimeMs = derived(this, (reader) => this._options.read(reader).maxComputationTime);
    this.showMoves = derived(this, (reader) => this._options.read(reader).experimental.showMoves && this.renderSideBySide.read(reader));
    this.isInEmbeddedEditor = derived(this, (reader) => this._options.read(reader).isInEmbeddedEditor);
    this.diffWordWrap = derived(this, (reader) => this._options.read(reader).diffWordWrap);
    this.originalEditable = derived(this, (reader) => this._options.read(reader).originalEditable);
    this.diffCodeLens = derived(this, (reader) => this._options.read(reader).diffCodeLens);
    this.accessibilityVerbose = derived(this, (reader) => this._options.read(reader).accessibilityVerbose);
    this.diffAlgorithm = derived(this, (reader) => this._options.read(reader).diffAlgorithm);
    this.showEmptyDecorations = derived(this, (reader) => this._options.read(reader).experimental.showEmptyDecorations);
    this.onlyShowAccessibleDiffViewer = derived(this, (reader) => this._options.read(reader).onlyShowAccessibleDiffViewer);
    this.compactMode = derived(this, (reader) => this._options.read(reader).compactMode);
    this.trueInlineDiffRenderingEnabled = derived(
      this,
      (reader) => this._options.read(reader).experimental.useTrueInlineView
    );
    this.useTrueInlineDiffRendering = derived(
      this,
      (reader) => !this.renderSideBySide.read(reader) && this.trueInlineDiffRenderingEnabled.read(reader)
    );
    this.hideUnchangedRegions = derived(this, (reader) => this._options.read(reader).hideUnchangedRegions.enabled);
    this.hideUnchangedRegionsRevealLineCount = derived(this, (reader) => this._options.read(reader).hideUnchangedRegions.revealLineCount);
    this.hideUnchangedRegionsContextLineCount = derived(this, (reader) => this._options.read(reader).hideUnchangedRegions.contextLineCount);
    this.hideUnchangedRegionsMinimumLineCount = derived(this, (reader) => this._options.read(reader).hideUnchangedRegions.minimumLineCount);
    this._model = observableValue(this, void 0);
    this.shouldRenderInlineViewInSmartMode = this._model.map(this, (model) => derivedConstOnceDefined(this, (reader) => {
      const diffs = model?.diff.read(reader);
      return diffs ? isSimpleDiff(diffs, this.trueInlineDiffRenderingEnabled.read(reader)) : void 0;
    })).flatten().map(this, (v2) => !!v2);
    this.inlineViewHideOriginalLineNumbers = derived(this, (reader) => this._options.read(reader).hideOriginalLineNumbers || this.compactMode.read(reader));
    const optionsCopy = { ...options3, ...validateDiffEditorOptions(options3, diffEditorDefaultOptions) };
    this._options = observableValue(this, optionsCopy);
  }
  get editorOptions() {
    return this._options;
  }
  updateOptions(changedOptions) {
    const newDiffEditorOptions = validateDiffEditorOptions(changedOptions, this._options.get());
    const newOptions = { ...this._options.get(), ...changedOptions, ...newDiffEditorOptions };
    this._options.set(newOptions, void 0, { changedOptions });
  }
  setWidth(width2) {
    this._diffEditorWidth.set(width2, void 0);
  }
  setModel(model) {
    this._model.set(model, void 0);
  }
};

DiffEditorOptions = __decorateClass([
  __decorateParam(1, IAccessibilityService)
], DiffEditorOptions);

function isSimpleDiff(diff4, supportsTrueDiffRendering) {
  return diff4.mappings.every((m) => isInsertion(m.lineRangeMapping) || isDeletion(m.lineRangeMapping) || supportsTrueDiffRendering && allowsTrueInlineDiffRendering(m.lineRangeMapping));
}

function isInsertion(mapping2) {
  return mapping2.original.length === 0;
}

function isDeletion(mapping2) {
  return mapping2.modified.length === 0;
}

function validateDiffEditorOptions(options3, defaults) {
  return {
    enableSplitViewResizing: boolean(options3.enableSplitViewResizing, defaults.enableSplitViewResizing),
    splitViewDefaultRatio: clampedFloat(options3.splitViewDefaultRatio, 0.5, 0.1, 0.9),
    renderSideBySide: boolean(options3.renderSideBySide, defaults.renderSideBySide),
    renderMarginRevertIcon: boolean(options3.renderMarginRevertIcon, defaults.renderMarginRevertIcon),
    maxComputationTime: clampedInt(options3.maxComputationTime, defaults.maxComputationTime, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */),
    maxFileSize: clampedInt(options3.maxFileSize, defaults.maxFileSize, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */),
    ignoreTrimWhitespace: boolean(options3.ignoreTrimWhitespace, defaults.ignoreTrimWhitespace),
    renderIndicators: boolean(options3.renderIndicators, defaults.renderIndicators),
    originalEditable: boolean(options3.originalEditable, defaults.originalEditable),
    diffCodeLens: boolean(options3.diffCodeLens, defaults.diffCodeLens),
    renderOverviewRuler: boolean(options3.renderOverviewRuler, defaults.renderOverviewRuler),
    diffWordWrap: stringSet(options3.diffWordWrap, defaults.diffWordWrap, ["off", "on", "inherit"]),
    diffAlgorithm: stringSet(options3.diffAlgorithm, defaults.diffAlgorithm, ["legacy", "advanced", "advanced-external", "advanced-wasm"], { "smart": "legacy", "experimental": "advanced" }),
    accessibilityVerbose: boolean(options3.accessibilityVerbose, defaults.accessibilityVerbose),
    experimental: {
      showMoves: boolean(options3.experimental?.showMoves, defaults.experimental.showMoves),
      showEmptyDecorations: boolean(options3.experimental?.showEmptyDecorations, defaults.experimental.showEmptyDecorations),
      useTrueInlineView: boolean(options3.experimental?.useTrueInlineView, defaults.experimental.useTrueInlineView)
    },
    hideUnchangedRegions: {
      // eslint-disable-next-line local/code-no-any-casts, @typescript-eslint/no-explicit-any
      enabled: boolean(options3.hideUnchangedRegions?.enabled ?? options3.experimental?.collapseUnchangedRegions, defaults.hideUnchangedRegions.enabled),
      contextLineCount: clampedInt(options3.hideUnchangedRegions?.contextLineCount, defaults.hideUnchangedRegions.contextLineCount, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */),
      minimumLineCount: clampedInt(options3.hideUnchangedRegions?.minimumLineCount, defaults.hideUnchangedRegions.minimumLineCount, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */),
      revealLineCount: clampedInt(options3.hideUnchangedRegions?.revealLineCount, defaults.hideUnchangedRegions.revealLineCount, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */)
    },
    isInEmbeddedEditor: boolean(options3.isInEmbeddedEditor, defaults.isInEmbeddedEditor),
    onlyShowAccessibleDiffViewer: boolean(options3.onlyShowAccessibleDiffViewer, defaults.onlyShowAccessibleDiffViewer),
    renderSideBySideInlineBreakpoint: clampedInt(options3.renderSideBySideInlineBreakpoint, defaults.renderSideBySideInlineBreakpoint, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */),
    useInlineViewWhenSpaceIsLimited: boolean(options3.useInlineViewWhenSpaceIsLimited, defaults.useInlineViewWhenSpaceIsLimited),
    renderGutterMenu: boolean(options3.renderGutterMenu, defaults.renderGutterMenu),
    compactMode: boolean(options3.compactMode, defaults.compactMode),
    hideOriginalLineNumbers: boolean(options3.hideOriginalLineNumbers, defaults.hideOriginalLineNumbers)
  };
}
export { isSimpleDiff, isInsertion, isDeletion, validateDiffEditorOptions, DiffEditorOptions };
