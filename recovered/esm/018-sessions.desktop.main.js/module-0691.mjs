// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/documentSymbols/browser/outlineModel.ts
import { commonPrefixLength2 } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { binarySearch, coalesceInPlace, equals } from "./module-0007.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { Iterable } from "./module-0011.mjs";
import { Position } from "./module-0079.mjs";
import { createDecorator } from "./module-0077.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { LRUCache } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { IModelService } from "./module-0080.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/editor/contrib/documentSymbols/browser/outlineModel.ts
var TreeElement2 = class _TreeElement {
  remove() {
    this.parent?.children.delete(this.id);
  }
  static findId(candidate, container2) {
    let candidateId;
    if (typeof candidate === "string") {
      candidateId = `${container2.id}/${candidate}`;
    } else {
      candidateId = `${container2.id}/${candidate.name}`;
      if (container2.children.get(candidateId) !== void 0) {
        candidateId = `${container2.id}/${candidate.name}_${candidate.range.startLineNumber}_${candidate.range.startColumn}`;
      }
    }
    let id2 = candidateId;
    for (let i2 = 0; container2.children.get(id2) !== void 0; i2++) {
      id2 = `${candidateId}_${i2}`;
    }
    return id2;
  }
  static getElementById(id2, element) {
    if (!id2) {
      return void 0;
    }
    const len = commonPrefixLength2(id2, element.id);
    if (len === id2.length) {
      return element;
    }
    if (len < element.id.length) {
      return void 0;
    }
    for (const [, child] of element.children) {
      const candidate = _TreeElement.getElementById(id2, child);
      if (candidate) {
        return candidate;
      }
    }
    return void 0;
  }
  static size(element) {
    let res = 1;
    for (const [, child] of element.children) {
      res += _TreeElement.size(child);
    }
    return res;
  }
  static empty(element) {
    return element.children.size === 0;
  }
};

var OutlineElement = class extends TreeElement2 {
  constructor(id2, parent, symbol) {
    super();
    this.id = id2;
    this.parent = parent;
    this.symbol = symbol;
    this.children = /* @__PURE__ */ new Map();
  }
};

var OutlineGroup = class extends TreeElement2 {
  constructor(id2, parent, label3, order) {
    super();
    this.id = id2;
    this.parent = parent;
    this.label = label3;
    this.order = order;
    this.children = /* @__PURE__ */ new Map();
  }
  getItemEnclosingPosition(position2) {
    return position2 ? this._getItemEnclosingPosition(position2, this.children) : void 0;
  }
  _getItemEnclosingPosition(position2, children) {
    for (const [, item] of children) {
      if (!item.symbol.range || !Range2.containsPosition(item.symbol.range, position2)) {
        continue;
      }
      return this._getItemEnclosingPosition(position2, item.children) || item;
    }
    return void 0;
  }
  updateMarker(marker) {
    for (const [, child] of this.children) {
      this._updateMarker(marker, child);
    }
  }
  _updateMarker(markers, item) {
    item.marker = void 0;
    const idx = binarySearch(markers, item.symbol.range, Range2.compareRangesUsingStarts);
    let start;
    if (idx < 0) {
      start = ~idx;
      if (start > 0 && Range2.areIntersecting(markers[start - 1], item.symbol.range)) {
        start -= 1;
      }
    } else {
      start = idx;
    }
    const myMarkers = [];
    let myTopSev;
    for (; start < markers.length && Range2.areIntersecting(item.symbol.range, markers[start]); start++) {
      const marker = markers[start];
      myMarkers.push(marker);
      markers[start] = void 0;
      if (!myTopSev || marker.severity > myTopSev) {
        myTopSev = marker.severity;
      }
    }
    for (const [, child] of item.children) {
      this._updateMarker(myMarkers, child);
    }
    if (myTopSev) {
      item.marker = {
        count: myMarkers.length,
        topSev: myTopSev
      };
    }
    coalesceInPlace(markers);
  }
};

var OutlineModel = class _OutlineModel extends TreeElement2 {
  constructor(uri4) {
    super();
    this.uri = uri4;
    this.id = "root";
    this.parent = void 0;
    this._groups = /* @__PURE__ */ new Map();
    this.children = /* @__PURE__ */ new Map();
    this.id = "root";
    this.parent = void 0;
  }
  static create(registry4, textModel, token) {
    const cts = new CancellationTokenSource(token);
    const result = new _OutlineModel(textModel.uri);
    const provider = registry4.ordered(textModel);
    const promises = provider.map((provider2, index2) => {
      const id2 = TreeElement2.findId(`provider_${index2}`, result);
      const group2 = new OutlineGroup(id2, result, provider2.displayName ?? "Unknown Outline Provider", index2);
      return Promise.resolve(provider2.provideDocumentSymbols(textModel, cts.token)).then((result2) => {
        for (const info of result2 || []) {
          _OutlineModel._makeOutlineElement(info, group2);
        }
        return group2;
      }, (err) => {
        onUnexpectedExternalError(err);
        return group2;
      }).then((group3) => {
        if (!TreeElement2.empty(group3)) {
          result._groups.set(id2, group3);
        } else {
          group3.remove();
        }
      });
    });
    const listener = registry4.onDidChange(() => {
      const newProvider = registry4.ordered(textModel);
      if (!equals(newProvider, provider)) {
        cts.cancel();
      }
    });
    return Promise.all(promises).then(() => {
      if (cts.token.isCancellationRequested && !token.isCancellationRequested) {
        return _OutlineModel.create(registry4, textModel, token);
      } else {
        return result._compact();
      }
    }).finally(() => {
      cts.dispose();
      listener.dispose();
      cts.dispose();
    });
  }
  static _makeOutlineElement(info, container2) {
    const id2 = TreeElement2.findId(info, container2);
    const res = new OutlineElement(id2, container2, info);
    if (info.children) {
      for (const childInfo of info.children) {
        _OutlineModel._makeOutlineElement(childInfo, res);
      }
    }
    container2.children.set(res.id, res);
  }
  static get(element) {
    while (element) {
      if (element instanceof _OutlineModel) {
        return element;
      }
      element = element.parent;
    }
    return void 0;
  }
  _compact() {
    let count2 = 0;
    for (const [key3, group2] of this._groups) {
      if (group2.children.size === 0) {
        this._groups.delete(key3);
      } else {
        count2 += 1;
      }
    }
    if (count2 !== 1) {
      this.children = this._groups;
    } else {
      const group2 = Iterable.first(this._groups.values());
      for (const [, child] of group2.children) {
        child.parent = this;
        this.children.set(child.id, child);
      }
    }
    return this;
  }
  merge(other) {
    if (this.uri.toString() !== other.uri.toString()) {
      return false;
    }
    if (this._groups.size !== other._groups.size) {
      return false;
    }
    this._groups = other._groups;
    this.children = other.children;
    return true;
  }
  getItemEnclosingPosition(position2, context2) {
    let preferredGroup;
    if (context2) {
      let candidate = context2.parent;
      while (candidate && !preferredGroup) {
        if (candidate instanceof OutlineGroup) {
          preferredGroup = candidate;
        }
        candidate = candidate.parent;
      }
    }
    let result = void 0;
    for (const [, group2] of this._groups) {
      result = group2.getItemEnclosingPosition(position2);
      if (result && (!preferredGroup || preferredGroup === group2)) {
        break;
      }
    }
    return result;
  }
  getItemById(id2) {
    return TreeElement2.getElementById(id2, this);
  }
  updateMarker(marker) {
    marker.sort(Range2.compareRangesUsingStarts);
    for (const [, group2] of this._groups) {
      group2.updateMarker(marker.slice(0));
    }
  }
  getTopLevelSymbols() {
    const roots = [];
    for (const child of this.children.values()) {
      if (child instanceof OutlineElement) {
        roots.push(child.symbol);
      } else {
        roots.push(...Iterable.map(child.children.values(), (child2) => child2.symbol));
      }
    }
    return roots.sort((a, b) => Range2.compareRangesUsingStarts(a.range, b.range));
  }
  asListOfDocumentSymbols() {
    const roots = this.getTopLevelSymbols();
    const bucket = [];
    _OutlineModel._flattenDocumentSymbols(bucket, roots, "");
    return bucket.sort(
      (a, b) => Position.compare(Range2.getStartPosition(a.range), Range2.getStartPosition(b.range)) || Position.compare(Range2.getEndPosition(b.range), Range2.getEndPosition(a.range))
    );
  }
  static _flattenDocumentSymbols(bucket, entries2, overrideContainerLabel) {
    for (const entry of entries2) {
      bucket.push({
        kind: entry.kind,
        tags: entry.tags,
        name: entry.name,
        detail: entry.detail,
        containerName: entry.containerName || overrideContainerLabel,
        range: entry.range,
        selectionRange: entry.selectionRange,
        children: void 0
        // we flatten it...
      });
      if (entry.children) {
        _OutlineModel._flattenDocumentSymbols(bucket, entry.children, entry.name);
      }
    }
  }
};

var IOutlineModelService = createDecorator("IOutlineModelService");

var OutlineModelService = class {
  constructor(_languageFeaturesService, debounces, modelService) {
    this._languageFeaturesService = _languageFeaturesService;
    this._disposables = new DisposableStore();
    this._cache = new LRUCache(15, 0.7);
    this._debounceInformation = debounces.for(_languageFeaturesService.documentSymbolProvider, "DocumentSymbols", { min: 350 });
    this._disposables.add(modelService.onModelRemoved((textModel) => {
      this._cache.delete(textModel.id);
    }));
  }
  dispose() {
    this._disposables.dispose();
  }
  async getOrCreate(textModel, token) {
    const registry4 = this._languageFeaturesService.documentSymbolProvider;
    const provider = registry4.ordered(textModel);
    let data = this._cache.get(textModel.id);
    if (!data || data.versionId !== textModel.getVersionId() || !equals(data.provider, provider)) {
      const source = new CancellationTokenSource();
      data = {
        versionId: textModel.getVersionId(),
        provider,
        promiseCnt: 0,
        source,
        promise: OutlineModel.create(registry4, textModel, source.token),
        model: void 0
      };
      this._cache.set(textModel.id, data);
      const now = Date.now();
      data.promise.then((outlineModel) => {
        data.model = outlineModel;
        this._debounceInformation.update(textModel, Date.now() - now);
      }).catch((_err) => {
        this._cache.delete(textModel.id);
      });
    }
    if (data.model) {
      return data.model;
    }
    data.promiseCnt += 1;
    const listener = token.onCancellationRequested(() => {
      if (--data.promiseCnt === 0) {
        data.source.cancel();
        this._cache.delete(textModel.id);
      }
    });
    try {
      return await data.promise;
    } finally {
      listener.dispose();
    }
  }
  getDebounceValue(textModel) {
    return this._debounceInformation.get(textModel);
  }
  getCachedModels() {
    return Iterable.filter(Iterable.map(this._cache.values(), (entry) => entry.model), (model) => model !== void 0);
  }
};

OutlineModelService = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, ILanguageFeatureDebounceService),
  __decorateParam(2, IModelService)
], OutlineModelService);

registerSingleton(IOutlineModelService, OutlineModelService, 1 /* Delayed */);
export { TreeElement2, OutlineElement, OutlineGroup, OutlineModel, IOutlineModelService, OutlineModelService };
