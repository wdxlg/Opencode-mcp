// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/decorations/browser/decorationsService.ts
import { hash } from "./module-0039.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { createCSSRule, createStyleSheet, removeCSSRulesContainingSelector } from "./module-0224.mjs";
import { asCssVariable, asCssVariableWithDefault } from "./module-0226.mjs";
import { getIconRegistry } from "./module-0479.mjs";
import { stringValue } from "./module-0449.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { asArray, distinct } from "./module-0007.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { localize } from "./module-0001.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { DebounceEmitter, Emitter } from "./module-0017.mjs";
import { LinkedList } from "./module-0013.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isThenable } from "./module-0036.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IThemeService } from "./module-0287.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IDecorationsService } from "./module-1067.mjs";


// src/vs/workbench/services/decorations/browser/decorationsService.ts
var DecorationRule = class _DecorationRule {
  constructor(themeService, data, key3) {
    this.themeService = themeService;
    this._refCounter = 0;
    this.data = data;
    const suffix = hash(key3).toString(36);
    this.itemColorClassName = `${_DecorationRule._classNamesPrefix}-itemColor-${suffix}`;
    this.itemBadgeClassName = `${_DecorationRule._classNamesPrefix}-itemBadge-${suffix}`;
    this.bubbleBadgeClassName = `${_DecorationRule._classNamesPrefix}-bubbleBadge-${suffix}`;
    this.iconBadgeClassName = `${_DecorationRule._classNamesPrefix}-iconBadge-${suffix}`;
  }
  static keyOf(data) {
    if (Array.isArray(data)) {
      return data.map(_DecorationRule.keyOf).join(",");
    } else {
      const { color: color2, letter } = data;
      if (ThemeIcon.isThemeIcon(letter)) {
        return `${color2}+${letter.id}`;
      } else {
        return `${color2}/${letter}`;
      }
    }
  }
  static {
    this._classNamesPrefix = "monaco-decoration";
  }
  acquire() {
    this._refCounter += 1;
  }
  release() {
    return --this._refCounter === 0;
  }
  appendCSSRules(element) {
    if (!Array.isArray(this.data)) {
      this._appendForOne(this.data, element);
    } else {
      this._appendForMany(this.data, element);
    }
  }
  _appendForOne(data, element) {
    const { color: color2, letter } = data;
    createCSSRule(`.${this.itemColorClassName}`, `color: ${getColor(color2)};`, element);
    if (ThemeIcon.isThemeIcon(letter)) {
      this._createIconCSSRule(letter, getColor(color2), element);
    } else if (letter) {
      createCSSRule(`.${this.itemBadgeClassName}::after`, `content: "${letter}"; color: ${getColor(color2)};`, element);
    }
  }
  _appendForMany(data, element) {
    const color2 = data.reduceRight((fallback2, decoration3) => decoration3.color ? asCssVariableWithDefault(decoration3.color, fallback2) : fallback2, "inherit");
    createCSSRule(`.${this.itemColorClassName}`, `color: ${color2};`, element);
    const letters = [];
    let icon2;
    for (const d of data) {
      if (ThemeIcon.isThemeIcon(d.letter)) {
        icon2 = d.letter;
        break;
      } else if (d.letter) {
        letters.push(d.letter);
      }
    }
    if (icon2) {
      this._createIconCSSRule(icon2, color2, element);
    } else {
      if (letters.length) {
        createCSSRule(`.${this.itemBadgeClassName}::after`, `content: "${letters.join(", ")}"; color: ${color2};`, element);
      }
      createCSSRule(
        `.${this.bubbleBadgeClassName}::after`,
        `content: "\uEA71"; color: ${color2}; font-family: codicon; font-size: 14px; margin-right: 14px; opacity: 0.4;`,
        element
      );
    }
  }
  _createIconCSSRule(icon2, color2, element) {
    const modifier = ThemeIcon.getModifier(icon2);
    if (modifier) {
      icon2 = ThemeIcon.modify(icon2, void 0);
    }
    const iconContribution = getIconRegistry().getIcon(icon2.id);
    if (!iconContribution) {
      return;
    }
    const definition = this.themeService.getProductIconTheme().getIcon(iconContribution);
    if (!definition) {
      return;
    }
    createCSSRule(
      `.${this.iconBadgeClassName}::after`,
      `content: '${definition.fontCharacter}';
			color: ${icon2.color ? getColor(icon2.color.id) : color2};
			font-family: ${stringValue(definition.font?.id ?? "codicon")};
			font-size: 16px;
			margin-right: 14px;
			font-weight: normal;
			${modifier === "spin" ? "animation: codicon-spin 1.5s steps(30) infinite; font-style: normal !important; transform-origin: center center;" : ""};
			`,
      element
    );
  }
  removeCSSRules(element) {
    removeCSSRulesContainingSelector(this.itemColorClassName, element);
    removeCSSRulesContainingSelector(this.itemBadgeClassName, element);
    removeCSSRulesContainingSelector(this.bubbleBadgeClassName, element);
    removeCSSRulesContainingSelector(this.iconBadgeClassName, element);
  }
};

var DecorationStyles = class {
  constructor(_themeService) {
    this._themeService = _themeService;
    this._dispoables = new DisposableStore();
    this._styleElement = createStyleSheet(void 0, void 0, this._dispoables);
    this._decorationRules = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._dispoables.dispose();
  }
  asDecoration(data, onlyChildren) {
    data.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    const key3 = DecorationRule.keyOf(data);
    let rule = this._decorationRules.get(key3);
    if (!rule) {
      rule = new DecorationRule(this._themeService, data, key3);
      this._decorationRules.set(key3, rule);
      rule.appendCSSRules(this._styleElement);
    }
    rule.acquire();
    const labelClassName = rule.itemColorClassName;
    let badgeClassName = rule.itemBadgeClassName;
    const iconClassName = rule.iconBadgeClassName;
    let tooltip = distinct(data.filter((d) => !isFalsyOrWhitespace(d.tooltip)).map((d) => d.tooltip)).join(" \u2022 ");
    const strikethrough = data.some((d) => d.strikethrough);
    if (onlyChildren) {
      badgeClassName = rule.bubbleBadgeClassName;
      tooltip = localize(22864, null);
    }
    return {
      labelClassName,
      badgeClassName,
      iconClassName,
      strikethrough,
      tooltip,
      dispose: () => {
        if (rule?.release()) {
          this._decorationRules.delete(key3);
          rule.removeCSSRules(this._styleElement);
          rule = void 0;
        }
      }
    };
  }
};

var FileDecorationChangeEvent = class {
  // events ignore all path casings
  constructor(all) {
    this._data = TernarySearchTree.forUris((_uri) => true);
    this._data.fill(true, asArray(all));
  }
  affectsResource(uri5) {
    return this._data.hasElementOrSubtree(uri5);
  }
};

var DecorationDataRequest = class {
  constructor(source, thenable) {
    this.source = source;
    this.thenable = thenable;
  }
};

function getColor(color2) {
  return color2 ? asCssVariable(color2) : "inherit";
}

var DecorationsService = class {
  constructor(uriIdentityService, themeService) {
    this._store = new DisposableStore();
    this._onDidChangeDecorationsDelayed = this._store.add(new DebounceEmitter({ merge: (all) => all.flat() }));
    this._onDidChangeDecorations = this._store.add(new Emitter());
    this.onDidChangeDecorations = this._onDidChangeDecorations.event;
    this._provider = new LinkedList();
    this._decorationStyles = this._store.add(new DecorationStyles(themeService));
    this._data = TernarySearchTree.forUris((key3) => uriIdentityService.extUri.ignorePathCasing(key3));
    this._store.add(this._onDidChangeDecorationsDelayed.event((event) => {
      this._onDidChangeDecorations.fire(new FileDecorationChangeEvent(event));
    }));
  }
  dispose() {
    this._store.dispose();
    this._data.clear();
  }
  registerDecorationsProvider(provider) {
    const rm = this._provider.unshift(provider);
    this._onDidChangeDecorations.fire({
      // everything might have changed
      affectsResource() {
        return true;
      }
    });
    const removeAll = () => {
      const uris = [];
      for (const [uri5, map] of this._data) {
        if (map.delete(provider)) {
          uris.push(uri5);
        }
      }
      if (uris.length > 0) {
        this._onDidChangeDecorationsDelayed.fire(uris);
      }
    };
    const listener = provider.onDidChange((uris) => {
      if (!uris) {
        removeAll();
      } else {
        for (const uri5 of uris) {
          const map = this._ensureEntry(uri5);
          this._fetchData(map, uri5, provider);
        }
      }
    });
    return toDisposable(() => {
      rm();
      listener.dispose();
      removeAll();
    });
  }
  _ensureEntry(uri5) {
    let map = this._data.get(uri5);
    if (!map) {
      map = /* @__PURE__ */ new Map();
      this._data.set(uri5, map);
    }
    return map;
  }
  getDecoration(uri5, includeChildren) {
    const all = [];
    let containsChildren = false;
    const map = this._ensureEntry(uri5);
    for (const provider of this._provider) {
      let data = map.get(provider);
      if (data === void 0) {
        data = this._fetchData(map, uri5, provider);
      }
      if (data && !(data instanceof DecorationDataRequest)) {
        all.push(data);
      }
    }
    if (includeChildren) {
      const iter = this._data.findSuperstr(uri5);
      if (iter) {
        for (const tuple of iter) {
          for (const data of tuple[1].values()) {
            if (data && !(data instanceof DecorationDataRequest)) {
              if (data.bubble) {
                all.push(data);
                containsChildren = true;
              }
            }
          }
        }
      }
    }
    return all.length === 0 ? void 0 : this._decorationStyles.asDecoration(all, containsChildren);
  }
  _fetchData(map, uri5, provider) {
    const pendingRequest = map.get(provider);
    if (pendingRequest instanceof DecorationDataRequest) {
      pendingRequest.source.cancel();
      map.delete(provider);
    }
    const cts = new CancellationTokenSource();
    const dataOrThenable = provider.provideDecorations(uri5, cts.token);
    if (!isThenable(dataOrThenable)) {
      cts.dispose();
      return this._keepItem(map, provider, uri5, dataOrThenable);
    } else {
      const request2 = new DecorationDataRequest(cts, Promise.resolve(dataOrThenable).then((data) => {
        if (map.get(provider) === request2) {
          this._keepItem(map, provider, uri5, data);
        }
      }).catch((err) => {
        if (!isCancellationError(err) && map.get(provider) === request2) {
          map.delete(provider);
        }
      }).finally(() => {
        cts.dispose();
      }));
      map.set(provider, request2);
      return null;
    }
  }
  _keepItem(map, provider, uri5, data) {
    const deco = data ? data : null;
    const old = map.get(provider);
    map.set(provider, deco);
    if (deco || old) {
      this._onDidChangeDecorationsDelayed.fire(uri5);
    }
    return deco;
  }
};

DecorationsService = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, IThemeService)
], DecorationsService);

registerSingleton(IDecorationsService, DecorationsService, 1 /* Delayed */);
export { getColor, DecorationRule, DecorationStyles, FileDecorationChangeEvent, DecorationDataRequest, DecorationsService };
