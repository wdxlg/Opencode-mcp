// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/virtualizedItemManager.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";
import { mapObservableArrayCached } from "./module-0059.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/virtualizedItemManager.ts
var VirtualizedItemBinding = class extends Disposable {
  constructor(item) {
    super();
    this.item = item;
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
  }
  dispose() {
    if (this._store.isDisposed) {
      return;
    }
    this._onDidDispose.fire();
    super.dispose();
  }
};

var VirtualizedItemTemplate = class extends Disposable {
  constructor() {
    super(...arguments);
    this._currentBinding = observableValue(this, void 0);
    this.currentBinding = this._currentBinding;
    this._bindingStore = this._register(new DisposableStore());
  }
  bind(item, context2) {
    if (this._currentBinding.get()) {
      throw new BugIndicatingError("Cannot rebind a virtualized template before disposing its current binding");
    }
    const binding = this.createBinding(item, context2);
    this._bindingStore.clear();
    this._bindingStore.add(Event2.once(binding.onDidDispose)(() => {
      if (this._currentBinding.get() !== binding) {
        throw new BugIndicatingError("Disposed binding does not own its virtualized template");
      }
      this._currentBinding.set(void 0, void 0);
    }));
    this._currentBinding.set(binding, void 0);
    return binding;
  }
  dispose() {
    this._currentBinding.get()?.dispose();
    super.dispose();
  }
};

var VirtualizedItemManager = class extends Disposable {
  constructor(items, _context, _delegate2) {
    super();
    this._context = _context;
    this._delegate = _delegate2;
    this._pools = /* @__PURE__ */ new Map();
    this.virtualizedItems = mapObservableArrayCached(
      this,
      items,
      (item, store) => store.add(new ManagedVirtualizedItem(item, this, _delegate2)),
      (item) => _delegate2.getId(item)
    ).recomputeInitiallyAndOnChange(this._store);
    this._register(toDisposable(() => {
      for (const pool of this._pools.values()) {
        pool.dispose();
      }
      this._pools.clear();
    }));
  }
  acquire(item) {
    const templateId = this._delegate.getTemplateId(item);
    let pool = this._pools.get(templateId);
    if (!pool) {
      pool = new VirtualizedTemplatePool(() => this._delegate.createTemplate(templateId, this._context));
      this._pools.set(templateId, pool);
    }
    return pool.acquire();
  }
};

var ManagedVirtualizedItem = class extends Disposable {
  constructor(item, _manager, _delegate2) {
    super();
    this.item = item;
    this._manager = _manager;
    this._delegate = _delegate2;
    this._templateReference = observableValue(this, void 0);
    this._isHidden = observableValue(this, false);
    this._didRenderFail = false;
    this.template = derived(this, (reader) => this._templateReference.read(reader)?.object);
    this.binding = derived(this, (reader) => this.template.read(reader)?.currentBinding.read(reader));
    const unboundSize = _delegate2.getUnboundSize(item);
    this.size = derived(this, (reader) => this.binding.read(reader)?.size.read(reader) ?? unboundSize.read(reader));
    this.maxScroll = derived(this, (reader) => this.binding.read(reader)?.maxScroll.read(reader) ?? { maxScroll: 0 });
    this._register(autorun((reader) => {
      const binding = this.binding.read(reader);
      if (!binding || !this._isHidden.read(reader) || binding.shouldKeepAlive.read(reader)) {
        return;
      }
      this._clearBinding();
    }));
  }
  render(renderedRange, scrollOffset, width2, renderedViewport, context2) {
    this._lastRender = { renderedRange, scrollOffset, width: width2, renderedViewport, context: context2 };
    this._isHidden.set(false, void 0);
    if (this._didRenderFail) {
      return;
    }
    try {
      this._render(renderedRange, scrollOffset, width2, renderedViewport, context2);
    } catch (error) {
      this._didRenderFail = true;
      onUnexpectedError(error);
    }
  }
  _render(renderedRange, scrollOffset, width2, renderedViewport, context2) {
    let binding = this.binding.get();
    if (!binding) {
      const templateReference = this._manager.acquire(this.item);
      const template2 = templateReference.object;
      if (template2.currentBinding.get()) {
        templateReference.dispose();
        throw new BugIndicatingError("Virtualized template pool returned a bound template");
      }
      let newBinding;
      try {
        newBinding = template2.bind(this.item, {
          initialSize: this.size.get(),
          runWithScrollAnchor: (getItemOffset, update) => {
            if (!context2) {
              throw new BugIndicatingError("Cannot preserve a virtualized item scroll anchor without a render context");
            }
            context2.runWithScrollAnchor(getItemOffset, update);
          }
        });
        if (newBinding.item !== this.item || template2.currentBinding.get() !== newBinding) {
          throw new BugIndicatingError("Virtualized template returned a binding for a different item");
        }
        const validatedBinding = newBinding;
        transaction((tx) => {
          this._delegate.onDidBind?.(validatedBinding, tx);
          this._templateReference.set(templateReference, tx);
        });
      } catch (error) {
        (template2.currentBinding.get() ?? newBinding)?.dispose();
        templateReference.dispose();
        throw error;
      }
      binding = newBinding;
    }
    binding.render(renderedRange, scrollOffset, width2, renderedViewport);
  }
  hide() {
    this._isHidden.set(true, void 0);
    this.binding.get()?.hide();
  }
  rebind() {
    if (!this.binding.get() || !this._lastRender) {
      return;
    }
    const lastRender = this._lastRender;
    this._clearBinding();
    this._didRenderFail = false;
    this.render(lastRender.renderedRange, lastRender.scrollOffset, lastRender.width, lastRender.renderedViewport, lastRender.context);
  }
  _clearBinding() {
    const templateReference = this._templateReference.get();
    const binding = templateReference?.object.currentBinding.get();
    if (!templateReference || !binding) {
      return;
    }
    transaction((tx) => {
      this._delegate.onWillUnbind?.(binding, tx);
    });
    binding.hide();
    binding.dispose();
    if (templateReference.object.currentBinding.get()) {
      throw new BugIndicatingError("Virtualized binding did not release its template when disposed");
    }
    transaction((tx) => {
      this._templateReference.set(void 0, tx);
    });
    templateReference.dispose();
  }
  dispose() {
    this._clearBinding();
    super.dispose();
  }
};

var VirtualizedTemplatePool = class {
  constructor(_create) {
    this._create = _create;
    this._unused = /* @__PURE__ */ new Set();
    this._used = /* @__PURE__ */ new Set();
  }
  acquire() {
    const template2 = this._unused.values().next().value ?? this._create();
    this._unused.delete(template2);
    if (template2.currentBinding.get()) {
      throw new BugIndicatingError("Cannot acquire a bound virtualized template");
    }
    this._used.add(template2);
    let disposed = false;
    return {
      object: template2,
      dispose: () => {
        if (disposed) {
          return;
        }
        disposed = true;
        if (template2.currentBinding.get()) {
          throw new BugIndicatingError("Cannot pool a virtualized template with a current binding");
        }
        this._used.delete(template2);
        if (this._unused.size >= 5) {
          template2.dispose();
        } else {
          this._unused.add(template2);
        }
      }
    };
  }
  dispose() {
    for (const template2 of this._used) {
      template2.dispose();
    }
    for (const template2 of this._unused) {
      template2.dispose();
    }
    this._used.clear();
    this._unused.clear();
  }
};
export { VirtualizedItemBinding, VirtualizedItemTemplate, VirtualizedItemManager, ManagedVirtualizedItem, VirtualizedTemplatePool };
