// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlayHints/browser/inlayHintsController.ts
import { LRUCache } from "./module-0008.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { DynamicCssRules } from "./module-0237.mjs";
import { ModifierKeyEmitter, isHTMLElement } from "./module-0075.mjs";
import { RunOnceScheduler, disposableTimeout } from "./module-0036.mjs";
import { InlayHintAnchor, InlayHintsFragments } from "./module-0620.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { ClickLinkGesture } from "./module-0619.mjs";
import { Range2 } from "./module-0106.mjs";
import { goToDefinitionWithLocation, showGoToContextMenu } from "./module-0648.mjs";
import { Command2 } from "./module-0164.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { EditOperation } from "./module-0162.mjs";
import { ModelDecorationInjectedTextOptions } from "./module-0423.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { EDITOR_FONT_DEFAULTS } from "./module-0101.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { editorActiveLinkForeground, editorInlayHintBackground, editorInlayHintForeground, editorInlayHintParameterBackground, editorInlayHintParameterForeground, editorInlayHintTypeBackground, editorInlayHintTypeForeground } from "./module-0229.mjs";
import { StableEditorScrollState } from "./module-0447.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { ITextModelService } from "./module-0081.mjs";


// src/vs/editor/contrib/inlayHints/browser/inlayHintsController.ts
var InlayHintsCache = class _InlayHintsCache {
  constructor() {
    this._entries = new LRUCache(50);
  }
  get(model) {
    const key3 = _InlayHintsCache._key(model);
    return this._entries.get(key3);
  }
  set(model, value2) {
    const key3 = _InlayHintsCache._key(model);
    this._entries.set(key3, value2);
  }
  static _key(model) {
    return `${model.uri.toString()}/${model.getVersionId()}`;
  }
};

var IInlayHintsCache = createDecorator("IInlayHintsCache");

registerSingleton(IInlayHintsCache, InlayHintsCache, 1 /* Delayed */);

var RenderedInlayHintLabelPart = class {
  constructor(item, index2) {
    this.item = item;
    this.index = index2;
  }
  get part() {
    const label3 = this.item.hint.label;
    if (typeof label3 === "string") {
      return { label: label3 };
    } else {
      return label3[this.index];
    }
  }
};

var ActiveInlayHintInfo = class {
  constructor(part, hasTriggerModifier2) {
    this.part = part;
    this.hasTriggerModifier = hasTriggerModifier2;
  }
};

var CancellationStore = class {
  constructor() {
    this._store = new MutableDisposable();
    this._tokenSource = new CancellationTokenSource();
  }
  dispose() {
    this._store.dispose();
    this._tokenSource.dispose(true);
  }
  reset() {
    this._tokenSource.dispose(true);
    this._tokenSource = new CancellationTokenSource();
    this._store.value = new DisposableStore();
    return {
      store: this._store.value,
      token: this._tokenSource.token
    };
  }
};

var InlayHintsController = class {
  constructor(_editor, _languageFeaturesService, _featureDebounce, _inlayHintsCache, _commandService, _notificationService, _instaService) {
    this._editor = _editor;
    this._languageFeaturesService = _languageFeaturesService;
    this._inlayHintsCache = _inlayHintsCache;
    this._commandService = _commandService;
    this._notificationService = _notificationService;
    this._instaService = _instaService;
    this._disposables = new DisposableStore();
    this._sessionDisposables = new DisposableStore();
    this._decorationsMetadata = /* @__PURE__ */ new Map();
    this._activeRenderMode = 0 /* Normal */;
    this._ruleFactory = this._disposables.add(new DynamicCssRules(this._editor));
    this._debounceInfo = _featureDebounce.for(_languageFeaturesService.inlayHintsProvider, "InlayHint", { min: 25 });
    this._disposables.add(_languageFeaturesService.inlayHintsProvider.onDidChange(() => this._update()));
    this._disposables.add(_editor.onDidChangeModel(() => this._update()));
    this._disposables.add(_editor.onDidChangeModelLanguage(() => this._update()));
    this._disposables.add(_editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(159 /* inlayHints */)) {
        this._update();
      }
    }));
    this._update();
  }
  static {
    this.ID = "editor.contrib.InlayHints";
  }
  static {
    this._MAX_DECORATORS = 1500;
  }
  static {
    this._whitespaceData = {};
  }
  static get(editor) {
    return editor.getContribution(InlayHintsController.ID) ?? void 0;
  }
  dispose() {
    this._sessionDisposables.dispose();
    this._removeAllDecorations();
    this._disposables.dispose();
  }
  _update() {
    this._sessionDisposables.clear();
    this._removeAllDecorations();
    const options3 = this._editor.getOption(159 /* inlayHints */);
    if (options3.enabled === "off") {
      return;
    }
    const model = this._editor.getModel();
    if (!model || !this._languageFeaturesService.inlayHintsProvider.has(model)) {
      return;
    }
    if (options3.enabled === "on") {
      this._activeRenderMode = 0 /* Normal */;
    } else {
      let defaultMode;
      let altMode;
      if (options3.enabled === "onUnlessPressed") {
        defaultMode = 0 /* Normal */;
        altMode = 1 /* Invisible */;
      } else {
        defaultMode = 1 /* Invisible */;
        altMode = 0 /* Normal */;
      }
      this._activeRenderMode = defaultMode;
      this._sessionDisposables.add(ModifierKeyEmitter.getInstance().event((e) => {
        if (!this._editor.hasModel()) {
          return;
        }
        const newRenderMode = e.altKey && e.ctrlKey && !(e.shiftKey || e.metaKey) ? altMode : defaultMode;
        if (newRenderMode !== this._activeRenderMode) {
          this._activeRenderMode = newRenderMode;
          const model2 = this._editor.getModel();
          const copies = this._copyInlayHintsWithCurrentAnchor(model2);
          this._updateHintsDecorators([model2.getFullModelRange()], copies);
          scheduler.schedule(0);
        }
      }));
    }
    const cached = this._inlayHintsCache.get(model);
    if (cached) {
      this._updateHintsDecorators([model.getFullModelRange()], cached);
    }
    this._sessionDisposables.add(toDisposable(() => {
      if (!model.isDisposed()) {
        this._cacheHintsForFastRestore(model);
      }
    }));
    let cts;
    const watchedProviders = /* @__PURE__ */ new Set();
    this._sessionDisposables.add(model.onWillDispose(() => cts?.cancel()));
    const cancellationStore = this._sessionDisposables.add(new CancellationStore());
    const scheduler = new RunOnceScheduler(async () => {
      const t1 = Date.now();
      const { store, token } = cancellationStore.reset();
      try {
        const inlayHints = await InlayHintsFragments.create(this._languageFeaturesService.inlayHintsProvider, model, this._getHintsRanges(), token);
        scheduler.delay = this._debounceInfo.update(model, Date.now() - t1);
        if (token.isCancellationRequested) {
          inlayHints.dispose();
          return;
        }
        for (const provider of inlayHints.provider) {
          if (typeof provider.onDidChangeInlayHints === "function" && !watchedProviders.has(provider)) {
            watchedProviders.add(provider);
            store.add(provider.onDidChangeInlayHints(() => {
              if (!scheduler.isScheduled()) {
                scheduler.schedule();
              }
            }));
          }
        }
        store.add(inlayHints);
        store.add(toDisposable(() => watchedProviders.clear()));
        this._updateHintsDecorators(inlayHints.ranges, inlayHints.items);
        this._cacheHintsForFastRestore(model);
      } catch (err) {
        onUnexpectedError(err);
      }
    }, this._debounceInfo.get(model));
    this._sessionDisposables.add(scheduler);
    scheduler.schedule(0);
    this._sessionDisposables.add(this._editor.onDidScrollChange((e) => {
      if (e.scrollTopChanged || !scheduler.isScheduled()) {
        scheduler.schedule();
      }
    }));
    const cursor = this._sessionDisposables.add(new MutableDisposable());
    this._sessionDisposables.add(this._editor.onDidChangeModelContent((e) => {
      cts?.cancel();
      const delay = Math.max(scheduler.delay, 800);
      this._cursorInfo = { position: this._editor.getPosition(), notEarlierThan: Date.now() + delay };
      cursor.value = disposableTimeout(() => scheduler.schedule(0), delay);
      scheduler.schedule();
    }));
    this._sessionDisposables.add(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(159 /* inlayHints */)) {
        scheduler.schedule();
      }
    }));
    this._sessionDisposables.add(this._installDblClickGesture(() => scheduler.schedule(0)));
    this._sessionDisposables.add(this._installLinkGesture());
    this._sessionDisposables.add(this._installContextMenu());
  }
  _installLinkGesture() {
    const store = new DisposableStore();
    const gesture = store.add(new ClickLinkGesture(this._editor));
    const sessionStore = new DisposableStore();
    store.add(sessionStore);
    store.add(gesture.onMouseMoveOrRelevantKeyDown((e) => {
      const [mouseEvent] = e;
      const labelPart = this._getInlayHintLabelPart(mouseEvent);
      const model = this._editor.getModel();
      if (!labelPart || !model) {
        sessionStore.clear();
        return;
      }
      const cts = new CancellationTokenSource();
      sessionStore.add(toDisposable(() => cts.dispose(true)));
      labelPart.item.resolve(cts.token);
      this._activeInlayHintPart = labelPart.part.command || labelPart.part.location ? new ActiveInlayHintInfo(labelPart, mouseEvent.hasTriggerModifier) : void 0;
      const lineNumber = model.validatePosition(labelPart.item.hint.position).lineNumber;
      const range2 = new Range2(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber));
      const lineHints = this._getInlineHintsForRange(range2);
      this._updateHintsDecorators([range2], lineHints);
      sessionStore.add(toDisposable(() => {
        this._activeInlayHintPart = void 0;
        this._updateHintsDecorators([range2], lineHints);
      }));
    }));
    store.add(gesture.onCancel(() => sessionStore.clear()));
    store.add(gesture.onExecute(async (e) => {
      const label3 = this._getInlayHintLabelPart(e);
      if (label3) {
        const part = label3.part;
        if (part.location) {
          this._instaService.invokeFunction(goToDefinitionWithLocation, e, this._editor, part.location);
        } else if (Command2.is(part.command)) {
          await this._invokeCommand(part.command, label3.item);
        }
      }
    }));
    return store;
  }
  _getInlineHintsForRange(range2) {
    const lineHints = /* @__PURE__ */ new Set();
    for (const data of this._decorationsMetadata.values()) {
      if (range2.containsRange(data.item.anchor.range)) {
        lineHints.add(data.item);
      }
    }
    return Array.from(lineHints);
  }
  _installDblClickGesture(updateInlayHints) {
    return this._editor.onMouseUp(async (e) => {
      if (e.event.detail !== 2) {
        return;
      }
      const part = this._getInlayHintLabelPart(e);
      if (!part) {
        return;
      }
      e.event.preventDefault();
      await part.item.resolve(CancellationToken.None);
      if (isNonEmptyArray(part.item.hint.textEdits)) {
        const edits = part.item.hint.textEdits.map((edit3) => EditOperation.replace(Range2.lift(edit3.range), edit3.text));
        this._editor.executeEdits("inlayHint.default", edits);
        updateInlayHints();
      }
    });
  }
  _installContextMenu() {
    return this._editor.onContextMenu(async (e) => {
      if (!isHTMLElement(e.event.target)) {
        return;
      }
      const part = this._getInlayHintLabelPart(e);
      if (part) {
        await this._instaService.invokeFunction(showGoToContextMenu, this._editor, e.event.target, part);
      }
    });
  }
  _getInlayHintLabelPart(e) {
    if (e.target.type !== 6 /* CONTENT_TEXT */) {
      return void 0;
    }
    const options3 = e.target.detail.injectedText?.options;
    if (options3 instanceof ModelDecorationInjectedTextOptions && options3?.attachedData instanceof RenderedInlayHintLabelPart) {
      return options3.attachedData;
    }
    return void 0;
  }
  async _invokeCommand(command4, item) {
    try {
      await this._commandService.executeCommand(command4.id, ...command4.arguments ?? []);
    } catch (err) {
      this._notificationService.notify({
        severity: Severity2.Error,
        source: item.provider.displayName,
        message: err
      });
    }
  }
  _cacheHintsForFastRestore(model) {
    const hints = this._copyInlayHintsWithCurrentAnchor(model);
    this._inlayHintsCache.set(model, hints);
  }
  // return inlay hints but with an anchor that reflects "updates"
  // that happened after receiving them, e.g adding new lines before a hint
  _copyInlayHintsWithCurrentAnchor(model) {
    const items = /* @__PURE__ */ new Map();
    for (const [id2, obj] of this._decorationsMetadata) {
      if (items.has(obj.item)) {
        continue;
      }
      const range2 = model.getDecorationRange(id2);
      if (range2) {
        const anchor = new InlayHintAnchor(range2, obj.item.anchor.direction);
        const copy = obj.item.with({ anchor });
        items.set(obj.item, copy);
      }
    }
    return Array.from(items.values());
  }
  _getHintsRanges() {
    const extra = 30;
    const model = this._editor.getModel();
    const visibleRanges = this._editor.getVisibleRangesPlusViewportAboveBelow();
    const result = [];
    for (const range2 of visibleRanges.sort(Range2.compareRangesUsingStarts)) {
      const extendedRange = model.validateRange(new Range2(range2.startLineNumber - extra, range2.startColumn, range2.endLineNumber + extra, range2.endColumn));
      if (result.length === 0 || !Range2.areIntersectingOrTouching(result[result.length - 1], extendedRange)) {
        result.push(extendedRange);
      } else {
        result[result.length - 1] = Range2.plusRange(result[result.length - 1], extendedRange);
      }
    }
    return result;
  }
  _updateHintsDecorators(ranges, items) {
    const itemFixedLengths = /* @__PURE__ */ new Map();
    if (this._cursorInfo && this._cursorInfo.notEarlierThan > Date.now() && ranges.some((range2) => range2.containsPosition(this._cursorInfo.position))) {
      const { position: position2 } = this._cursorInfo;
      this._cursorInfo = void 0;
      const lengths = /* @__PURE__ */ new Map();
      for (const deco of this._editor.getLineDecorations(position2.lineNumber) ?? []) {
        const data = this._decorationsMetadata.get(deco.id);
        if (deco.range.startColumn > position2.column) {
          continue;
        }
        const opts = data?.decoration.options[data.item.anchor.direction];
        if (opts && opts.attachedData !== InlayHintsController._whitespaceData) {
          const len = lengths.get(data.item) ?? 0;
          lengths.set(data.item, len + opts.content.length);
        }
      }
      const newItemsWithFixedLength = items.filter((item) => item.anchor.range.startLineNumber === position2.lineNumber && item.anchor.range.endColumn <= position2.column);
      const fixedLengths = Array.from(lengths.values());
      let lastItem;
      while (true) {
        const targetItem = newItemsWithFixedLength.shift();
        const fixedLength = fixedLengths.shift();
        if (!fixedLength && !targetItem) {
          break;
        }
        if (targetItem) {
          itemFixedLengths.set(targetItem, fixedLength ?? 0);
          lastItem = targetItem;
        } else if (lastItem && fixedLength) {
          let len = itemFixedLengths.get(lastItem);
          len += fixedLength;
          len += fixedLengths.reduce((p, c) => p + c, 0);
          fixedLengths.length = 0;
          break;
        }
      }
    }
    const { fontSize, fontFamily, padding, isUniform } = this._getLayoutInfo();
    const editorFontSize = this._editor.getOption(61 /* fontSize */);
    const newDecorationsData = [];
    const addInjectedText = (item, ref, content2, cursorStops, attachedData, widthInEm) => {
      const opts = {
        content: content2,
        inlineClassNameAffectsLetterSpacing: true,
        inlineClassName: ref.className,
        cursorStops,
        attachedData,
        widthInEm
      };
      newDecorationsData.push({
        item,
        classNameRef: ref,
        decoration: {
          range: item.anchor.range,
          options: {
            // className: "rangeHighlight", // DEBUG highlight to see to what range a hint is attached
            description: "InlayHint",
            showIfCollapsed: item.anchor.range.isEmpty(),
            // "original" range is empty
            collapseOnReplaceEdit: !item.anchor.range.isEmpty(),
            stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
            [item.anchor.direction]: this._activeRenderMode === 0 /* Normal */ ? opts : void 0
          }
        }
      });
    };
    const addInjectedWhitespace = (item, isLast) => {
      const widthInPixels = fontSize / 3 | 0;
      const widthInEm = widthInPixels / editorFontSize;
      const marginRule = this._ruleFactory.createClassNameRef({
        width: `${widthInPixels}px`,
        display: "inline-block"
      });
      addInjectedText(item, marginRule, "", isLast ? 1 /* Right */ : 3 /* None */, InlayHintsController._whitespaceData, widthInEm);
    };
    const maxLength = this._editor.getOption(159 /* inlayHints */).maximumLength;
    const fontFamilyVar = "--code-editorInlayHintsFontFamily";
    this._editor.getContainerDomNode().style.setProperty(fontFamilyVar, fontFamily);
    let currentLineInfo = { line: 0, totalLen: 0 };
    for (let i2 = 0; i2 < items.length; i2++) {
      const item = items[i2];
      if (currentLineInfo.line !== item.anchor.range.startLineNumber) {
        currentLineInfo = { line: item.anchor.range.startLineNumber, totalLen: 0 };
      }
      if (maxLength && currentLineInfo.totalLen > maxLength) {
        continue;
      }
      if (item.hint.paddingLeft) {
        addInjectedWhitespace(item, false);
      }
      const parts = typeof item.hint.label === "string" ? [{ label: item.hint.label }] : item.hint.label;
      const itemFixedLength = itemFixedLengths.get(item);
      let itemActualLength = 0;
      for (let i3 = 0; i3 < parts.length; i3++) {
        const part = parts[i3];
        const isFirst = i3 === 0;
        const isLast = i3 === parts.length - 1;
        const cssProperties = {
          fontSize: `${fontSize}px`,
          fontFamily: `var(${fontFamilyVar}), ${EDITOR_FONT_DEFAULTS.fontFamily}`,
          verticalAlign: isUniform ? "baseline" : "middle",
          unicodeBidi: "isolate"
        };
        if (isNonEmptyArray(item.hint.textEdits)) {
          cssProperties.cursor = "default";
        }
        this._fillInColors(cssProperties, item.hint);
        if ((part.command || part.location) && this._activeInlayHintPart?.part.item === item && this._activeInlayHintPart.part.index === i3) {
          cssProperties.textDecoration = "underline";
          if (this._activeInlayHintPart.hasTriggerModifier) {
            cssProperties.color = themeColorFromId2(editorActiveLinkForeground);
            cssProperties.cursor = "pointer";
          }
        }
        let textlabel = part.label;
        currentLineInfo.totalLen += textlabel.length;
        let tooLong = false;
        const over = maxLength !== 0 ? currentLineInfo.totalLen - maxLength : 0;
        if (over > 0) {
          textlabel = textlabel.slice(0, -over) + "\u2026";
          tooLong = true;
        }
        itemActualLength += textlabel.length;
        if (itemFixedLength !== void 0) {
          const overFixedLength = itemActualLength - itemFixedLength;
          if (overFixedLength >= 0) {
            itemActualLength -= overFixedLength;
            textlabel = textlabel.slice(0, -(1 + overFixedLength)) + "\u2026";
            tooLong = true;
          }
        }
        if (padding) {
          if (isFirst && (isLast || tooLong)) {
            cssProperties.padding = `1px ${Math.max(1, fontSize / 4) | 0}px`;
            cssProperties.borderRadius = `${fontSize / 4 | 0}px`;
          } else if (isFirst) {
            cssProperties.padding = `1px 0 1px ${Math.max(1, fontSize / 4) | 0}px`;
            cssProperties.borderRadius = `${fontSize / 4 | 0}px 0 0 ${fontSize / 4 | 0}px`;
          } else if (isLast || tooLong) {
            cssProperties.padding = `1px ${Math.max(1, fontSize / 4) | 0}px 1px 0`;
            cssProperties.borderRadius = `0 ${fontSize / 4 | 0}px ${fontSize / 4 | 0}px 0`;
          } else {
            cssProperties.padding = `1px 0 1px 0`;
          }
        }
        addInjectedText(
          item,
          this._ruleFactory.createClassNameRef(cssProperties),
          fixSpace(textlabel),
          isLast && !item.hint.paddingRight ? 1 /* Right */ : 3 /* None */,
          new RenderedInlayHintLabelPart(item, i3)
        );
        if (tooLong) {
          break;
        }
      }
      if (itemFixedLength !== void 0 && itemActualLength < itemFixedLength) {
        const pad = itemFixedLength - itemActualLength;
        addInjectedText(
          item,
          this._ruleFactory.createClassNameRef({}),
          "\u200A".repeat(pad),
          3 /* None */
        );
      }
      if (item.hint.paddingRight) {
        addInjectedWhitespace(item, true);
      }
      if (newDecorationsData.length > InlayHintsController._MAX_DECORATORS) {
        break;
      }
    }
    const decorationIdsToReplace = [];
    for (const [id2, metadata] of this._decorationsMetadata) {
      const range2 = this._editor.getModel()?.getDecorationRange(id2);
      if (range2 && ranges.some((r2) => r2.containsRange(range2))) {
        decorationIdsToReplace.push(id2);
        metadata.classNameRef.dispose();
        this._decorationsMetadata.delete(id2);
      }
    }
    const scrollState = StableEditorScrollState.capture(this._editor);
    this._editor.changeDecorations((accessor) => {
      const newDecorationIds = accessor.deltaDecorations(decorationIdsToReplace, newDecorationsData.map((d) => d.decoration));
      for (let i2 = 0; i2 < newDecorationIds.length; i2++) {
        const data = newDecorationsData[i2];
        this._decorationsMetadata.set(newDecorationIds[i2], data);
      }
    });
    scrollState.restore(this._editor);
  }
  _fillInColors(props, hint) {
    if (hint.kind === 2 /* Parameter */) {
      props.backgroundColor = themeColorFromId2(editorInlayHintParameterBackground);
      props.color = themeColorFromId2(editorInlayHintParameterForeground);
    } else if (hint.kind === 1 /* Type */) {
      props.backgroundColor = themeColorFromId2(editorInlayHintTypeBackground);
      props.color = themeColorFromId2(editorInlayHintTypeForeground);
    } else {
      props.backgroundColor = themeColorFromId2(editorInlayHintBackground);
      props.color = themeColorFromId2(editorInlayHintForeground);
    }
  }
  _getLayoutInfo() {
    const options3 = this._editor.getOption(159 /* inlayHints */);
    const padding = options3.padding;
    const editorFontSize = this._editor.getOption(61 /* fontSize */);
    const editorFontFamily = this._editor.getOption(58 /* fontFamily */);
    let fontSize = options3.fontSize;
    if (!fontSize || fontSize < 5 || fontSize > editorFontSize) {
      fontSize = editorFontSize;
    }
    const fontFamily = options3.fontFamily || editorFontFamily;
    const isUniform = !padding && fontFamily === editorFontFamily && fontSize === editorFontSize;
    return { fontSize, fontFamily, padding, isUniform };
  }
  _removeAllDecorations() {
    this._editor.removeDecorations(Array.from(this._decorationsMetadata.keys()));
    for (const obj of this._decorationsMetadata.values()) {
      obj.classNameRef.dispose();
    }
    this._decorationsMetadata.clear();
  }
  // --- accessibility
  getInlayHintsForLine(line) {
    if (!this._editor.hasModel()) {
      return [];
    }
    const set = /* @__PURE__ */ new Set();
    const result = [];
    for (const deco of this._editor.getLineDecorations(line)) {
      const data = this._decorationsMetadata.get(deco.id);
      if (data && !set.has(data.item.hint)) {
        set.add(data.item.hint);
        result.push(data.item);
      }
    }
    return result;
  }
};

InlayHintsController = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, ILanguageFeatureDebounceService),
  __decorateParam(3, IInlayHintsCache),
  __decorateParam(4, ICommandService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IInstantiationService)
], InlayHintsController);

function fixSpace(str) {
  const noBreakWhitespace2 = "\xA0";
  return str.replace(/[ \t]/g, noBreakWhitespace2);
}

CommandsRegistry.registerCommand("_executeInlayHintProvider", async (accessor, ...args2) => {
  const [uri5, range2] = args2;
  assertType(URI.isUri(uri5));
  assertType(Range2.isIRange(range2));
  const { inlayHintsProvider } = accessor.get(ILanguageFeaturesService);
  const ref = await accessor.get(ITextModelService).createModelReference(uri5);
  try {
    const model = await InlayHintsFragments.create(inlayHintsProvider, ref.object.textEditorModel, [Range2.lift(range2)], CancellationToken.None);
    const result = model.items.map((i2) => i2.hint);
    setTimeout(() => model.dispose(), 0);
    return result;
  } finally {
    ref.dispose();
  }
});
export { fixSpace, InlayHintsCache, IInlayHintsCache, RenderedInlayHintLabelPart, ActiveInlayHintInfo, CancellationStore, InlayHintsController };
