// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatContentCodePools.ts
import { Disposable } from "./module-0012.mjs";
import { KeyedResourcePool, ResourcePool } from "./module-2126.mjs";
import { CodeBlockPart, CodeCompareBlockPart } from "./module-2253.mjs";
import { MenuId } from "./module-0092.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatContentCodePools.ts
var EditorPool = class extends Disposable {
  constructor(options3, delegate, overflowWidgetsDomNode, isSimpleWidget = false, instantiationService) {
    super();
    this.isSimpleWidget = isSimpleWidget;
    this._pool = this._register(new KeyedResourcePool(() => {
      return instantiationService.createInstance(CodeBlockPart, options3, MenuId.ChatCodeBlock, delegate, overflowWidgetsDomNode, this.isSimpleWidget);
    }, { maxIdleSize: 2 }));
  }
  inUse() {
    return this._pool.inUse;
  }
  get(key3) {
    const codeBlock = this._pool.get(key3);
    let stale = false;
    return {
      object: codeBlock,
      isStale: () => stale,
      dispose: createSingleCallFunction(() => {
        codeBlock.reset();
        stale = true;
        this._pool.release(codeBlock, key3);
      })
    };
  }
  clear() {
    this._pool.clear();
  }
};

EditorPool = __decorateClass([
  __decorateParam(4, IInstantiationService)
], EditorPool);

var DiffEditorPool = class extends Disposable {
  constructor(options3, delegate, overflowWidgetsDomNode, isSimpleWidget = false, instantiationService) {
    super();
    this.isSimpleWidget = isSimpleWidget;
    this._pool = this._register(new ResourcePool(() => {
      return instantiationService.createInstance(CodeCompareBlockPart, options3, MenuId.ChatCompareBlock, delegate, overflowWidgetsDomNode, this.isSimpleWidget);
    }));
  }
  inUse() {
    return this._pool.inUse;
  }
  get() {
    const codeBlock = this._pool.get();
    let stale = false;
    return {
      object: codeBlock,
      isStale: () => stale,
      dispose: createSingleCallFunction(() => {
        codeBlock.reset();
        stale = true;
        this._pool.release(codeBlock);
      })
    };
  }
  clear() {
    this._pool.clear();
  }
};

DiffEditorPool = __decorateClass([
  __decorateParam(4, IInstantiationService)
], DiffEditorPool);
export { EditorPool, DiffEditorPool };
