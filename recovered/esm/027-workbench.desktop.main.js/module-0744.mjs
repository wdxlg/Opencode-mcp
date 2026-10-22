// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestMemory.ts
import { LRUCache } from "./module-0008.mjs";
import { CompletionItemKinds } from "./module-0164.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { createDecorator } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/editor/contrib/suggest/browser/suggestMemory.ts
var Memory = class {
  constructor(name) {
    this.name = name;
  }
  select(model, pos, items) {
    if (items.length === 0) {
      return 0;
    }
    const topScore = items[0].score[0];
    for (let i2 = 0; i2 < items.length; i2++) {
      const { score: score3, completion: suggestion } = items[i2];
      if (score3[0] !== topScore) {
        break;
      }
      if (suggestion.preselect) {
        return i2;
      }
    }
    return 0;
  }
};

var NoMemory = class extends Memory {
  constructor() {
    super("first");
  }
  memorize(model, pos, item) {
  }
  toJSON() {
    return void 0;
  }
  fromJSON() {
  }
};

var LRUMemory = class extends Memory {
  constructor() {
    super("recentlyUsed");
    this._cache = new LRUCache(300, 0.66);
    this._seq = 0;
  }
  memorize(model, pos, item) {
    const key3 = `${model.getLanguageId()}/${item.textLabel}`;
    this._cache.set(key3, {
      touch: this._seq++,
      type: item.completion.kind,
      insertText: item.completion.insertText
    });
  }
  select(model, pos, items) {
    if (items.length === 0) {
      return 0;
    }
    const lineSuffix = model.getLineContent(pos.lineNumber).substr(pos.column - 10, pos.column - 1);
    if (/\s$/.test(lineSuffix)) {
      return super.select(model, pos, items);
    }
    const topScore = items[0].score[0];
    let indexPreselect = -1;
    let indexRecency = -1;
    let seq = -1;
    for (let i2 = 0; i2 < items.length; i2++) {
      if (items[i2].score[0] !== topScore) {
        break;
      }
      const key3 = `${model.getLanguageId()}/${items[i2].textLabel}`;
      const item = this._cache.peek(key3);
      if (item && item.touch > seq && item.type === items[i2].completion.kind && item.insertText === items[i2].completion.insertText) {
        seq = item.touch;
        indexRecency = i2;
      }
      if (items[i2].completion.preselect && indexPreselect === -1) {
        return indexPreselect = i2;
      }
    }
    if (indexRecency !== -1) {
      return indexRecency;
    } else if (indexPreselect !== -1) {
      return indexPreselect;
    } else {
      return 0;
    }
  }
  toJSON() {
    return this._cache.toJSON();
  }
  fromJSON(data) {
    this._cache.clear();
    const seq = 0;
    for (const [key3, value2] of data) {
      value2.touch = seq;
      value2.type = typeof value2.type === "number" ? value2.type : CompletionItemKinds.fromString(value2.type);
      this._cache.set(key3, value2);
    }
    this._seq = this._cache.size;
  }
};

var PrefixMemory = class extends Memory {
  constructor() {
    super("recentlyUsedByPrefix");
    this._trie = TernarySearchTree.forStrings();
    this._seq = 0;
  }
  memorize(model, pos, item) {
    const { word } = model.getWordUntilPosition(pos);
    const key3 = `${model.getLanguageId()}/${word}`;
    this._trie.set(key3, {
      type: item.completion.kind,
      insertText: item.completion.insertText,
      touch: this._seq++
    });
  }
  select(model, pos, items) {
    const { word } = model.getWordUntilPosition(pos);
    if (!word) {
      return super.select(model, pos, items);
    }
    const key3 = `${model.getLanguageId()}/${word}`;
    let item = this._trie.get(key3);
    if (!item) {
      item = this._trie.findSubstr(key3);
    }
    if (item) {
      for (let i2 = 0; i2 < items.length; i2++) {
        const { kind, insertText } = items[i2].completion;
        if (kind === item.type && insertText === item.insertText) {
          return i2;
        }
      }
    }
    return super.select(model, pos, items);
  }
  toJSON() {
    const entries2 = [];
    this._trie.forEach((value2, key3) => entries2.push([key3, value2]));
    entries2.sort((a, b) => -(a[1].touch - b[1].touch)).forEach((value2, i2) => value2[1].touch = i2);
    return entries2.slice(0, 200);
  }
  fromJSON(data) {
    this._trie.clear();
    if (data.length > 0) {
      this._seq = data[0][1].touch + 1;
      for (const [key3, value2] of data) {
        value2.type = typeof value2.type === "number" ? value2.type : CompletionItemKinds.fromString(value2.type);
        this._trie.set(key3, value2);
      }
    }
  }
};

var SuggestMemoryService = class {
  constructor(_storageService, _configService) {
    this._storageService = _storageService;
    this._configService = _configService;
    this._disposables = new DisposableStore();
    this._persistSoon = new RunOnceScheduler(() => this._saveState(), 500);
    this._disposables.add(_storageService.onWillSaveState((e) => {
      if (e.reason === 1 /* SHUTDOWN */) {
        this._saveState();
      }
    }));
  }
  static {
    this._strategyCtors = /* @__PURE__ */ new Map([
      ["recentlyUsedByPrefix", PrefixMemory],
      ["recentlyUsed", LRUMemory],
      ["first", NoMemory]
    ]);
  }
  static {
    this._storagePrefix = "suggest/memories";
  }
  dispose() {
    this._disposables.dispose();
    this._persistSoon.dispose();
  }
  memorize(model, pos, item) {
    this._withStrategy(model, pos).memorize(model, pos, item);
    this._persistSoon.schedule();
  }
  select(model, pos, items) {
    return this._withStrategy(model, pos).select(model, pos, items);
  }
  _withStrategy(model, pos) {
    const mode = this._configService.getValue("editor.suggestSelection", {
      overrideIdentifier: model.getLanguageIdAtPosition(pos.lineNumber, pos.column),
      resource: model.uri
    });
    if (this._strategy?.name !== mode) {
      this._saveState();
      const ctor = SuggestMemoryService._strategyCtors.get(mode) || NoMemory;
      this._strategy = new ctor();
      try {
        const share = this._configService.getValue("editor.suggest.shareSuggestSelections");
        const scope = share ? 0 /* PROFILE */ : 1 /* WORKSPACE */;
        const raw = this._storageService.get(`${SuggestMemoryService._storagePrefix}/${mode}`, scope);
        if (raw) {
          this._strategy.fromJSON(JSON.parse(raw));
        }
      } catch (e) {
      }
    }
    return this._strategy;
  }
  _saveState() {
    if (this._strategy) {
      const share = this._configService.getValue("editor.suggest.shareSuggestSelections");
      const scope = share ? 0 /* PROFILE */ : 1 /* WORKSPACE */;
      const raw = JSON.stringify(this._strategy);
      this._storageService.store(`${SuggestMemoryService._storagePrefix}/${this._strategy.name}`, raw, scope, 1 /* MACHINE */);
    }
  }
};

SuggestMemoryService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IConfigurationService)
], SuggestMemoryService);

var ISuggestMemoryService = createDecorator("ISuggestMemories");

registerSingleton(ISuggestMemoryService, SuggestMemoryService, 1 /* Delayed */);
export { Memory, NoMemory, LRUMemory, PrefixMemory, SuggestMemoryService, ISuggestMemoryService };
