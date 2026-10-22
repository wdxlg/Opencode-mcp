// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/helpers/documentWithAnnotatedEdits.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { runOnChange } from "./module-0064.mjs";
import { AnnotatedStringEdit } from "./module-0193.mjs";
import { CachedFunction } from "./module-0027.mjs";
import { iterateObservableChanges, mapObservableDelta } from "./module-3683.mjs";
import { AsyncReader, AsyncReaderEndOfStream } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/helpers/documentWithAnnotatedEdits.ts
var DocumentWithSourceAnnotatedEdits = class extends Disposable {
  constructor(_originalDoc) {
    super();
    this._originalDoc = _originalDoc;
    const v2 = this.value = observableValue(this, _originalDoc.value.get());
    this._register(runOnChange(this._originalDoc.value, (val, _prevVal, edits) => {
      const eComposed = AnnotatedStringEdit.compose(edits.map((e) => {
        const editSourceData = new EditSourceData(e.reason);
        return e.mapData(() => editSourceData);
      }));
      v2.set(val, void 0, { edit: eComposed });
    }));
  }
  waitForQueue() {
    return Promise.resolve();
  }
};

var EditSourceData = class {
  constructor(editSource) {
    this.editSource = editSource;
    this.key = this.editSource.toKey(1);
    this.source = EditSourceBase.create(this.editSource);
  }
  join(data) {
    if (this.editSource !== data.editSource) {
      return void 0;
    }
    return this;
  }
  toEditSourceData() {
    return new EditKeySourceData(this.key, this.source, this.editSource);
  }
};

var EditKeySourceData = class {
  constructor(key3, source, representative) {
    this.key = key3;
    this.source = source;
    this.representative = representative;
  }
  join(data) {
    if (this.key !== data.key) {
      return void 0;
    }
    if (this.source !== data.source) {
      return void 0;
    }
    return this;
  }
};

var EditSourceBase = class {
  static {
    this._cache = new CachedFunction({ getCacheKey: (v2) => v2.toString() }, (arg) => arg);
  }
  static create(reason) {
    const data = reason.metadata;
    switch (data.source) {
      case "reloadFromDisk":
        return this._cache.get(new ExternalEditSource());
      case "inlineCompletionPartialAccept":
      case "inlineCompletionAccept": {
        const type = "type" in data ? data.type : void 0;
        if ("$nes" in data && data.$nes) {
          return this._cache.get(new InlineSuggestEditSource("nes", data.$extensionId ?? "", data.$providerId ?? "", type));
        }
        return this._cache.get(new InlineSuggestEditSource("completion", data.$extensionId ?? "", data.$providerId ?? "", type));
      }
      case "snippet":
        return this._cache.get(new IdeEditSource("suggest"));
      case "unknown":
        if (!data.name) {
          return this._cache.get(new UnknownEditSource());
        }
        switch (data.name) {
          case "formatEditsCommand":
            return this._cache.get(new IdeEditSource("format"));
        }
        return this._cache.get(new UnknownEditSource());
      case "Chat.applyEdits":
        return "$origin" in data && data.$origin === "agentHost" ? this._cache.get(new AgentHostEditSource()) : this._cache.get(new ChatEditSource("sidebar"));
      case "inlineChat.applyEdits":
        return this._cache.get(new ChatEditSource("inline"));
      case "cursor":
        return this._cache.get(new UserEditSource());
      default:
        return this._cache.get(new UnknownEditSource());
    }
  }
};

var InlineSuggestEditSource = class extends EditSourceBase {
  constructor(kind, extensionId, providerId, type) {
    super();
    this.kind = kind;
    this.extensionId = extensionId;
    this.providerId = providerId;
    this.type = type;
    this.category = "ai";
    this.feature = "inlineSuggest";
  }
  toString() {
    return `${this.category}/${this.feature}/${this.kind}/${this.extensionId}/${this.providerId}/${this.type}`;
  }
  getColor() {
    return "#00ff0033";
  }
};

var ChatEditSource = class extends EditSourceBase {
  constructor(kind) {
    super();
    this.kind = kind;
    this.category = "ai";
    this.feature = "chat";
  }
  toString() {
    return `${this.category}/${this.feature}/${this.kind}`;
  }
  getColor() {
    return "#00ff0066";
  }
};

var AgentHostEditSource = class extends EditSourceBase {
  constructor() {
    super(...arguments);
    this.category = "agentHost";
    this.feature = "chat";
  }
  toString() {
    return `${this.category}/${this.feature}`;
  }
  getColor() {
    return "#00ff0066";
  }
};

var IdeEditSource = class extends EditSourceBase {
  constructor(feature) {
    super();
    this.feature = feature;
    this.category = "ide";
  }
  toString() {
    return `${this.category}/${this.feature}`;
  }
  getColor() {
    return this.feature === "format" ? "#0000ff33" : "#80808033";
  }
};

var UserEditSource = class extends EditSourceBase {
  constructor() {
    super();
    this.category = "user";
  }
  toString() {
    return this.category;
  }
  getColor() {
    return "#d3d3d333";
  }
};

var ExternalEditSource = class extends EditSourceBase {
  constructor() {
    super();
    this.category = "external";
  }
  toString() {
    return this.category;
  }
  getColor() {
    return "#009ab254";
  }
};

var UnknownEditSource = class extends EditSourceBase {
  constructor() {
    super();
    this.category = "unknown";
  }
  toString() {
    return this.category;
  }
  getColor() {
    return "#ff000033";
  }
};

var CombineStreamedChanges = class extends Disposable {
  constructor(_originalDoc, _instantiationService) {
    super();
    this._originalDoc = _originalDoc;
    this._instantiationService = _instantiationService;
    this._runStore = this._register(new DisposableStore());
    this._runQueue = Promise.resolve();
    this._diffService = this._instantiationService.createInstance(DiffService);
    this.value = this._value = observableValue(this, _originalDoc.value.get());
    this._restart();
  }
  async _restart() {
    this._runStore.clear();
    const iterator = iterateObservableChanges(this._originalDoc.value, this._runStore)[Symbol.asyncIterator]();
    const p = this._runQueue;
    this._runQueue = this._runQueue.then(() => this._run(iterator));
    await p;
  }
  async _run(iterator) {
    const reader = new AsyncReader(iterator);
    while (true) {
      let peeked = await reader.peek();
      if (peeked === AsyncReaderEndOfStream) {
        return;
      } else if (isChatEdit(peeked)) {
        const first2 = peeked;
        let last = first2;
        let chatEdit = AnnotatedStringEdit.empty;
        do {
          reader.readBufferedOrThrow();
          last = peeked;
          chatEdit = chatEdit.compose(AnnotatedStringEdit.compose(peeked.change.map((c) => c.edit)));
          const peekedOrUndefined = await reader.peekTimeout(1e3);
          if (!peekedOrUndefined) {
            break;
          }
          peeked = peekedOrUndefined;
        } while (peeked !== AsyncReaderEndOfStream && isChatEdit(peeked));
        if (!chatEdit.isEmpty()) {
          const data = chatEdit.replacements[0].data;
          const diffEdit = await this._diffService.computeDiff(first2.prevValue.value, last.value.value);
          const edit3 = diffEdit.mapData((_e) => data);
          this._value.set(last.value, void 0, { edit: edit3 });
        }
      } else {
        reader.readBufferedOrThrow();
        const e = AnnotatedStringEdit.compose(peeked.change.map((c) => c.edit));
        this._value.set(peeked.value, void 0, { edit: e });
      }
    }
  }
  async waitForQueue() {
    await this._originalDoc.waitForQueue();
    await this._restart();
  }
};

CombineStreamedChanges = __decorateClass([
  __decorateParam(1, IInstantiationService)
], CombineStreamedChanges);

var DiffService = class {
  constructor(_editorWorkerService) {
    this._editorWorkerService = _editorWorkerService;
  }
  async computeDiff(original, modified) {
    const diffEdit = await this._editorWorkerService.computeStringEditFromDiff(original, modified, { maxComputationTimeMs: 500 }, "advanced");
    return diffEdit;
  }
};

DiffService = __decorateClass([
  __decorateParam(0, IEditorWorkerService)
], DiffService);

function isChatEdit(next) {
  return next.change.every((c) => c.edit.replacements.every((e) => {
    if (e.data.source.category === "ai" && e.data.source.feature === "chat") {
      return true;
    }
    return false;
  }));
}

var MinimizeEditsProcessor = class extends Disposable {
  constructor(_originalDoc) {
    super();
    this._originalDoc = _originalDoc;
    const v2 = this.value = observableValue(this, _originalDoc.value.get());
    let prevValue = this._originalDoc.value.get().value;
    this._register(runOnChange(this._originalDoc.value, (val, _prevVal, edits) => {
      const eComposed = AnnotatedStringEdit.compose(edits.map((e2) => e2.edit));
      const e = eComposed.removeCommonSuffixAndPrefix(prevValue);
      prevValue = val.value;
      v2.set(val, void 0, { edit: e });
    }));
  }
  async waitForQueue() {
    await this._originalDoc.waitForQueue();
  }
};

function createDocWithJustReason(docWithAnnotatedEdits, store) {
  const docWithJustReason = {
    value: mapObservableDelta(docWithAnnotatedEdits.value, (edit3) => ({ edit: edit3.edit.mapData((d) => d.data.toEditSourceData()) }), store),
    waitForQueue: () => docWithAnnotatedEdits.waitForQueue()
  };
  return docWithJustReason;
}
export { isChatEdit, createDocWithJustReason, DocumentWithSourceAnnotatedEdits, EditSourceData, EditKeySourceData, EditSourceBase, InlineSuggestEditSource, ChatEditSource, AgentHostEditSource, IdeEditSource, UserEditSource, ExternalEditSource, UnknownEditSource, CombineStreamedChanges, DiffService, MinimizeEditsProcessor };
