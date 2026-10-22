// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.ts
import { AbstractEditorNavigationQuickAccessProvider } from "./module-2538.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { pieceToQuery, prepareQuery, scoreFuzzy2 } from "./module-1530.mjs";
import { findLast } from "./module-0006.mjs";
import { Range2 } from "./module-0106.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { format2, trim } from "./module-0030.mjs";
import { SymbolKinds, getAriaLabelForSymbol } from "./module-0164.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IOutlineModelService } from "./module-0691.mjs";


// src/vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.ts
var AbstractGotoSymbolQuickAccessProvider = class extends AbstractEditorNavigationQuickAccessProvider {
  constructor(_languageFeaturesService, _outlineModelService, options3 = /* @__PURE__ */ Object.create(null)) {
    super(options3);
    this._languageFeaturesService = _languageFeaturesService;
    this._outlineModelService = _outlineModelService;
    this.options = options3;
    this.options.canAcceptInBackground = true;
  }
  static {
    this.PREFIX = "@";
  }
  static {
    this.SCOPE_PREFIX = ":";
  }
  static {
    this.PREFIX_BY_CATEGORY = `${this.PREFIX}${this.SCOPE_PREFIX}`;
  }
  provideWithoutTextEditor(picker) {
    this.provideLabelPick(picker, localize(1534, null));
    return Disposable.None;
  }
  provideWithTextEditor(context2, picker, token, runOptions2) {
    const editor = context2.editor;
    const model = this.getModel(editor);
    if (!model) {
      return Disposable.None;
    }
    if (this._languageFeaturesService.documentSymbolProvider.has(model)) {
      return this.doProvideWithEditorSymbols(context2, model, picker, token, runOptions2);
    }
    return this.doProvideWithoutEditorSymbols(context2, model, picker, token);
  }
  doProvideWithoutEditorSymbols(context2, model, picker, token) {
    const disposables = new DisposableStore();
    this.provideLabelPick(picker, localize(1535, null));
    (async () => {
      const result = await this.waitForLanguageSymbolRegistry(model, disposables);
      if (!result || token.isCancellationRequested) {
        return;
      }
      disposables.add(this.doProvideWithEditorSymbols(context2, model, picker, token));
    })();
    return disposables;
  }
  provideLabelPick(picker, label3) {
    picker.items = [{ label: label3, index: 0, kind: 14 /* String */ }];
    picker.ariaLabel = label3;
  }
  async waitForLanguageSymbolRegistry(model, disposables) {
    if (this._languageFeaturesService.documentSymbolProvider.has(model)) {
      return true;
    }
    const symbolProviderRegistryPromise = new DeferredPromise();
    const symbolProviderListener = disposables.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(() => {
      if (this._languageFeaturesService.documentSymbolProvider.has(model)) {
        symbolProviderListener.dispose();
        symbolProviderRegistryPromise.complete(true);
      }
    }));
    disposables.add(toDisposable(() => symbolProviderRegistryPromise.complete(false)));
    return symbolProviderRegistryPromise.p;
  }
  doProvideWithEditorSymbols(context2, model, picker, token, runOptions2) {
    const editor = context2.editor;
    const disposables = new DisposableStore();
    disposables.add(picker.onDidAccept((event) => {
      const [item] = picker.selectedItems;
      if (item && item.range) {
        if (picker.keyMods.shift && item.attach) {
          item.attach(picker.keyMods, event);
          return;
        }
        this.gotoLocation(context2, { range: item.range.selection, keyMods: picker.keyMods, preserveFocus: event.inBackground });
        runOptions2?.handleAccept?.(item, event.inBackground);
        if (!event.inBackground) {
          picker.hide();
        }
      }
    }));
    disposables.add(picker.onDidTriggerItemButton(({ item }) => {
      if (item && item.range) {
        this.gotoLocation(context2, { range: item.range.selection, keyMods: picker.keyMods, forceSideBySide: true });
        picker.hide();
      }
    }));
    const symbolsPromise = this.getDocumentSymbols(model, token);
    const picksCts = disposables.add(new MutableDisposable());
    const updatePickerItems = async (positionToEnclose) => {
      picksCts?.value?.cancel();
      picker.busy = false;
      picksCts.value = new CancellationTokenSource();
      picker.busy = true;
      try {
        const query = prepareQuery(picker.value.substr(AbstractGotoSymbolQuickAccessProvider.PREFIX.length).trim());
        const items = await this.doGetSymbolPicks(symbolsPromise, query, void 0, picksCts.value.token, model);
        if (token.isCancellationRequested) {
          return;
        }
        if (items.length > 0) {
          picker.items = items;
          if (positionToEnclose && query.original.length === 0) {
            const candidate = findLast(items, (item) => Boolean(item.type !== "separator" && item.range && Range2.containsPosition(item.range.decoration, positionToEnclose)));
            if (candidate) {
              picker.activeItems = [candidate];
            }
          }
        } else {
          if (query.original.length > 0) {
            this.provideLabelPick(picker, localize(1549, null));
          } else {
            this.provideLabelPick(picker, localize(1550, null));
          }
        }
      } finally {
        if (!token.isCancellationRequested) {
          picker.busy = false;
        }
      }
    };
    disposables.add(picker.onDidChangeValue(() => updatePickerItems(void 0)));
    updatePickerItems(editor.getSelection()?.getPosition());
    disposables.add(picker.onDidChangeActive(() => {
      const [item] = picker.activeItems;
      if (item && item.range) {
        editor.revealRangeInCenter(item.range.selection, 0 /* Smooth */);
        this.addDecorations(editor, item.range.decoration);
      }
    }));
    return disposables;
  }
  async doGetSymbolPicks(symbolsPromise, query, options3, token, model) {
    const symbols = await symbolsPromise;
    if (token.isCancellationRequested) {
      return [];
    }
    const filterBySymbolKind = query.original.indexOf(AbstractGotoSymbolQuickAccessProvider.SCOPE_PREFIX) === 0;
    const filterPos = filterBySymbolKind ? 1 : 0;
    let symbolQuery;
    let containerQuery;
    if (query.values && query.values.length > 1) {
      symbolQuery = pieceToQuery(query.values[0]);
      containerQuery = pieceToQuery(query.values.slice(1));
    } else {
      symbolQuery = query;
    }
    let buttons;
    const openSideBySideDirection = this.options?.openSideBySideDirection?.();
    if (openSideBySideDirection) {
      buttons = [{
        iconClass: openSideBySideDirection === "right" ? ThemeIcon.asClassName(Codicon.splitHorizontal) : ThemeIcon.asClassName(Codicon.splitVertical),
        tooltip: openSideBySideDirection === "right" ? localize(1554, null) : localize(1553, null)
      }];
    }
    const filteredSymbolPicks = [];
    for (let index2 = 0; index2 < symbols.length; index2++) {
      const symbol = symbols[index2];
      const symbolLabel = trim(symbol.name);
      const symbolLabelWithIcon = `$(${SymbolKinds.toIcon(symbol.kind).id}) ${symbolLabel}`;
      const symbolLabelIconOffset = symbolLabelWithIcon.length - symbolLabel.length;
      let containerLabel = symbol.containerName;
      if (options3?.extraContainerLabel) {
        if (containerLabel) {
          containerLabel = `${options3.extraContainerLabel} \u2022 ${containerLabel}`;
        } else {
          containerLabel = options3.extraContainerLabel;
        }
      }
      let symbolScore = void 0;
      let symbolMatches = void 0;
      let containerScore = void 0;
      let containerMatches = void 0;
      if (query.original.length > filterPos) {
        let skipContainerQuery = false;
        if (symbolQuery !== query) {
          [symbolScore, symbolMatches] = scoreFuzzy2(symbolLabelWithIcon, {
            ...query,
            values: void 0
            /* disable multi-query support */
          }, filterPos, symbolLabelIconOffset);
          if (typeof symbolScore === "number") {
            skipContainerQuery = true;
          }
        }
        if (typeof symbolScore !== "number") {
          [symbolScore, symbolMatches] = scoreFuzzy2(symbolLabelWithIcon, symbolQuery, filterPos, symbolLabelIconOffset);
          if (typeof symbolScore !== "number") {
            continue;
          }
        }
        if (!skipContainerQuery && containerQuery) {
          if (containerLabel && containerQuery.original.length > 0) {
            [containerScore, containerMatches] = scoreFuzzy2(containerLabel, containerQuery);
          }
          if (typeof containerScore !== "number") {
            continue;
          }
          if (typeof symbolScore === "number") {
            symbolScore += containerScore;
          }
        }
      }
      const deprecated = symbol.tags && symbol.tags.indexOf(1 /* Deprecated */) >= 0;
      filteredSymbolPicks.push({
        index: index2,
        kind: symbol.kind,
        score: symbolScore,
        label: symbolLabelWithIcon,
        ariaLabel: getAriaLabelForSymbol(symbol.name, symbol.kind),
        description: containerLabel,
        highlights: deprecated ? void 0 : {
          label: symbolMatches,
          description: containerMatches
        },
        range: {
          selection: Range2.collapseToStart(symbol.selectionRange),
          decoration: symbol.range
        },
        uri: model.uri,
        symbolName: symbolLabel,
        strikethrough: deprecated,
        buttons
      });
    }
    const sortedFilteredSymbolPicks = filteredSymbolPicks.sort(
      (symbolA, symbolB) => filterBySymbolKind ? this.compareByKindAndScore(symbolA, symbolB) : this.compareByScore(symbolA, symbolB)
    );
    let symbolPicks = [];
    if (filterBySymbolKind) {
      let updateLastSeparatorLabel = function() {
        if (lastSeparator && typeof lastSymbolKind === "number" && lastSymbolKindCounter > 0) {
          lastSeparator.label = format2(NLS_SYMBOL_KIND_CACHE[lastSymbolKind] || FALLBACK_NLS_SYMBOL_KIND, lastSymbolKindCounter);
        }
      };
      let lastSymbolKind = void 0;
      let lastSeparator = void 0;
      let lastSymbolKindCounter = 0;
      for (const symbolPick of sortedFilteredSymbolPicks) {
        if (lastSymbolKind !== symbolPick.kind) {
          updateLastSeparatorLabel();
          lastSymbolKind = symbolPick.kind;
          lastSymbolKindCounter = 1;
          lastSeparator = { type: "separator" };
          symbolPicks.push(lastSeparator);
        } else {
          lastSymbolKindCounter++;
        }
        symbolPicks.push(symbolPick);
      }
      updateLastSeparatorLabel();
    } else if (sortedFilteredSymbolPicks.length > 0) {
      symbolPicks = [
        { label: localize(1560, null, filteredSymbolPicks.length), type: "separator" },
        ...sortedFilteredSymbolPicks
      ];
    }
    return symbolPicks;
  }
  compareByScore(symbolA, symbolB) {
    if (typeof symbolA.score !== "number" && typeof symbolB.score === "number") {
      return 1;
    } else if (typeof symbolA.score === "number" && typeof symbolB.score !== "number") {
      return -1;
    }
    if (typeof symbolA.score === "number" && typeof symbolB.score === "number") {
      if (symbolA.score > symbolB.score) {
        return -1;
      } else if (symbolA.score < symbolB.score) {
        return 1;
      }
    }
    if (symbolA.index < symbolB.index) {
      return -1;
    } else if (symbolA.index > symbolB.index) {
      return 1;
    }
    return 0;
  }
  compareByKindAndScore(symbolA, symbolB) {
    const kindA = NLS_SYMBOL_KIND_CACHE[symbolA.kind] || FALLBACK_NLS_SYMBOL_KIND;
    const kindB = NLS_SYMBOL_KIND_CACHE[symbolB.kind] || FALLBACK_NLS_SYMBOL_KIND;
    const result = kindA.localeCompare(kindB);
    if (result === 0) {
      return this.compareByScore(symbolA, symbolB);
    }
    return result;
  }
  async getDocumentSymbols(document2, token) {
    const model = await this._outlineModelService.getOrCreate(document2, token);
    return token.isCancellationRequested ? [] : model.asListOfDocumentSymbols();
  }
};

AbstractGotoSymbolQuickAccessProvider = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IOutlineModelService)
], AbstractGotoSymbolQuickAccessProvider);

var FALLBACK_NLS_SYMBOL_KIND = localize(1557, null);

var NLS_SYMBOL_KIND_CACHE = {
  [5 /* Method */]: localize(1546, null),
  [11 /* Function */]: localize(1543, null),
  [8 /* Constructor */]: localize(1531, null),
  [12 /* Variable */]: localize(1562, null),
  [4 /* Class */]: localize(1536, null),
  [22 /* Struct */]: localize(1559, null),
  [23 /* Event */]: localize(1540, null),
  [24 /* Operator */]: localize(1555, null),
  [10 /* Interface */]: localize(1544, null),
  [2 /* Namespace */]: localize(1548, null),
  [3 /* Package */]: localize(1556, null),
  [25 /* TypeParameter */]: localize(1561, null),
  [1 /* Module */]: localize(1547, null),
  [6 /* Property */]: localize(1557, null),
  [9 /* Enum */]: localize(1538, null),
  [21 /* EnumMember */]: localize(1539, null),
  [14 /* String */]: localize(1558, null),
  [0 /* File */]: localize(1542, null),
  [17 /* Array */]: localize(1532, null),
  [15 /* Number */]: localize(1551, null),
  [16 /* Boolean */]: localize(1533, null),
  [18 /* Object */]: localize(1552, null),
  [19 /* Key */]: localize(1545, null),
  [7 /* Field */]: localize(1541, null),
  [13 /* Constant */]: localize(1537, null)
};
export { AbstractGotoSymbolQuickAccessProvider, FALLBACK_NLS_SYMBOL_KIND, NLS_SYMBOL_KIND_CACHE };
