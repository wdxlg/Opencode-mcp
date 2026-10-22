// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/symbolsQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1520.mjs";
import { localize } from "./module-0001.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { getSelectionSearchString } from "./module-0677.mjs";
import { pieceToQuery, prepareQuery, scoreFuzzy2 } from "./module-1522.mjs";
import { getWorkspaceSymbols } from "./module-1216.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { Codicon } from "./module-0085.mjs";
import { Schemas } from "./module-0033.mjs";
import { Range2 } from "./module-0106.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IChatWidgetService } from "./module-0982.mjs";


// src/vs/workbench/contrib/search/browser/symbolsQuickAccess.ts
var SymbolsQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(labelService, openerService, editorService, configurationService, codeEditorService, chatWidgetService) {
    super(SymbolsQuickAccessProvider.PREFIX, {
      canAcceptInBackground: true,
      noResultsPick: {
        label: localize(19256, null)
      }
    });
    this.labelService = labelService;
    this.openerService = openerService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
    this.chatWidgetService = chatWidgetService;
    this.delayer = this._register(new ThrottledDelayer(SymbolsQuickAccessProvider.TYPING_SEARCH_DELAY));
  }
  static {
    this.PREFIX = "#";
  }
  static {
    this.TYPING_SEARCH_DELAY = 200;
  }
  static {
    // this delay accommodates for the user typing a word and then stops typing to start searching
    this.TREAT_AS_GLOBAL_SYMBOL_TYPES = /* @__PURE__ */ new Set([
      4 /* Class */,
      9 /* Enum */,
      0 /* File */,
      10 /* Interface */,
      2 /* Namespace */,
      3 /* Package */,
      1 /* Module */
    ]);
  }
  get defaultFilterValue() {
    const editor = this.codeEditorService.getFocusedCodeEditor();
    if (editor) {
      return getSelectionSearchString(editor) ?? void 0;
    }
    return void 0;
  }
  get configuration() {
    const editorConfig = this.configurationService.getValue().workbench?.editor;
    return {
      openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
      openSideBySideDirection: editorConfig?.openSideBySideDirection
    };
  }
  _getPicks(filter2, disposables, token) {
    return this.getSymbolPicks(filter2, void 0, token);
  }
  async getSymbolPicks(filter2, options3, token) {
    return this.delayer.trigger(async () => {
      if (token.isCancellationRequested) {
        return [];
      }
      return this.doGetSymbolPicks(prepareQuery(filter2), options3, token);
    }, options3?.delay);
  }
  async doGetSymbolPicks(query, options3, token) {
    let symbolQuery;
    let containerQuery;
    if (query.values && query.values.length > 1) {
      symbolQuery = pieceToQuery(query.values[0]);
      containerQuery = pieceToQuery(query.values.slice(1));
    } else {
      symbolQuery = query;
    }
    const workspaceSymbols = await getWorkspaceSymbols(symbolQuery.original, token);
    if (token.isCancellationRequested) {
      return [];
    }
    const symbolPicks = [];
    const openSideBySideDirection = this.configuration.openSideBySideDirection;
    for (const { symbol, provider } of workspaceSymbols) {
      if (options3?.skipLocal && !SymbolsQuickAccessProvider.TREAT_AS_GLOBAL_SYMBOL_TYPES.has(symbol.kind) && !!symbol.containerName) {
        continue;
      }
      const symbolLabel = symbol.name;
      let symbolScore = void 0;
      let symbolMatches = void 0;
      let skipContainerQuery = false;
      if (symbolQuery.original.length > 0) {
        if (symbolQuery !== query) {
          [symbolScore, symbolMatches] = scoreFuzzy2(symbolLabel, {
            ...query,
            values: void 0
            /* disable multi-query support */
          }, 0, 0);
          if (typeof symbolScore === "number") {
            skipContainerQuery = true;
          }
        }
        if (typeof symbolScore !== "number") {
          [symbolScore, symbolMatches] = scoreFuzzy2(symbolLabel, symbolQuery, 0, 0);
          if (typeof symbolScore !== "number") {
            continue;
          }
        }
      }
      const symbolUri = symbol.location.uri;
      let containerLabel = void 0;
      if (symbolUri) {
        const containerPath = this.labelService.getUriLabel(symbolUri, { relative: true });
        if (symbol.containerName) {
          containerLabel = `${symbol.containerName} \u2022 ${containerPath}`;
        } else {
          containerLabel = containerPath;
        }
      }
      let containerScore = void 0;
      let containerMatches = void 0;
      if (!skipContainerQuery && containerQuery && containerQuery.original.length > 0) {
        if (containerLabel) {
          [containerScore, containerMatches] = scoreFuzzy2(containerLabel, containerQuery);
        }
        if (typeof containerScore !== "number") {
          continue;
        }
        if (typeof symbolScore === "number") {
          symbolScore += containerScore;
        }
      }
      const deprecated = symbol.tags ? symbol.tags.indexOf(1 /* Deprecated */) >= 0 : false;
      symbolPicks.push({
        symbol,
        resource: symbolUri,
        score: symbolScore,
        iconClass: ThemeIcon.asClassName(SymbolKinds.toIcon(symbol.kind)),
        label: symbolLabel,
        ariaLabel: symbolLabel,
        highlights: deprecated ? void 0 : {
          label: symbolMatches,
          description: containerMatches
        },
        description: containerLabel,
        strikethrough: deprecated,
        buttons: [
          {
            iconClass: openSideBySideDirection === "right" ? ThemeIcon.asClassName(Codicon.splitHorizontal) : ThemeIcon.asClassName(Codicon.splitVertical),
            tooltip: openSideBySideDirection === "right" ? localize(19258, null) : localize(19257, null)
          }
        ],
        trigger: (buttonIndex, keyMods) => {
          this.openSymbol(provider, symbol, token, { keyMods, forceOpenSideBySide: true });
          return 1 /* CLOSE_PICKER */;
        },
        accept: async (keyMods, event) => this.openSymbol(provider, symbol, token, { keyMods, preserveFocus: event.inBackground, forcePinned: event.inBackground }),
        attach: (keyMods, event) => {
          if (keyMods.shift) {
            const widget = this.chatWidgetService.lastFocusedWidget;
            if (widget) {
              const entry = {
                kind: "symbol",
                id: JSON.stringify({ uri: symbolUri.toString(), range: symbol.location.range }),
                name: symbol.name,
                value: symbol.location,
                symbolKind: symbol.kind
              };
              widget.attachmentModel.addContext(entry);
            }
            return;
          }
          this.openSymbol(provider, symbol, token, { keyMods, preserveFocus: event.inBackground, forcePinned: event.inBackground });
        }
      });
    }
    if (!options3?.skipSorting) {
      symbolPicks.sort((symbolA, symbolB) => this.compareSymbols(symbolA, symbolB));
    }
    return symbolPicks;
  }
  async openSymbol(provider, symbol, token, options3) {
    let symbolToOpen = symbol;
    if (typeof provider.resolveWorkspaceSymbol === "function") {
      symbolToOpen = await provider.resolveWorkspaceSymbol(symbol, token) || symbol;
      if (token.isCancellationRequested) {
        return;
      }
    }
    if (symbolToOpen.location.uri.scheme === Schemas.http || symbolToOpen.location.uri.scheme === Schemas.https) {
      await this.openerService.open(symbolToOpen.location.uri, { fromUserGesture: true, allowContributedOpeners: true });
    } else {
      await this.editorService.openEditor({
        resource: symbolToOpen.location.uri,
        options: {
          preserveFocus: options3?.preserveFocus,
          pinned: options3.keyMods.ctrlCmd || options3.forcePinned || this.configuration.openEditorPinned,
          selection: symbolToOpen.location.range ? Range2.collapseToStart(symbolToOpen.location.range) : void 0
        }
      }, options3.keyMods.alt || this.configuration.openEditorPinned && options3.keyMods.ctrlCmd || options3?.forceOpenSideBySide ? SIDE_GROUP : ACTIVE_GROUP);
    }
  }
  compareSymbols(symbolA, symbolB) {
    if (typeof symbolA.score === "number" && typeof symbolB.score === "number") {
      if (symbolA.score > symbolB.score) {
        return -1;
      }
      if (symbolA.score < symbolB.score) {
        return 1;
      }
    }
    if (symbolA.symbol && symbolB.symbol) {
      const symbolAName = symbolA.symbol.name.toLowerCase();
      const symbolBName = symbolB.symbol.name.toLowerCase();
      const res = symbolAName.localeCompare(symbolBName);
      if (res !== 0) {
        return res;
      }
    }
    if (symbolA.symbol && symbolB.symbol) {
      const symbolAKind = SymbolKinds.toIcon(symbolA.symbol.kind).id;
      const symbolBKind = SymbolKinds.toIcon(symbolB.symbol.kind).id;
      return symbolAKind.localeCompare(symbolBKind);
    }
    return 0;
  }
};

SymbolsQuickAccessProvider = __decorateClass([
  __decorateParam(0, ILabelService),
  __decorateParam(1, IOpenerService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, IChatWidgetService)
], SymbolsQuickAccessProvider);
export { SymbolsQuickAccessProvider };
