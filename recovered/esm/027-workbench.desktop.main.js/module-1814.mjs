// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/contextkey/browser/contextKeyService.ts
import { cloneAndChange, distinct2, equals4 } from "./module-0098.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { Iterable } from "./module-0011.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Event2, PauseableEmitter } from "./module-0017.mjs";
import { InputFocusedContext } from "./module-0635.mjs";
import { EventType, addDisposableListener, getActiveWindow, isEditableElement, onDidRegisterWindow, trackFocus } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { URI } from "./module-0032.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/contextkey/browser/contextKeyService.ts
var KEYBINDING_CONTEXT_ATTR = "data-keybinding-context";

var Context3 = class {
  constructor(id2, parent) {
    this._id = id2;
    this._parent = parent;
    this._value = /* @__PURE__ */ Object.create(null);
    this._value["_contextId"] = id2;
  }
  get value() {
    return { ...this._value };
  }
  setValue(key3, value2) {
    if (!equals4(this._value[key3], value2)) {
      this._value[key3] = value2;
      return true;
    }
    return false;
  }
  removeValue(key3) {
    if (key3 in this._value) {
      delete this._value[key3];
      return true;
    }
    return false;
  }
  getValue(key3) {
    const ret = this._value[key3];
    if (typeof ret === "undefined" && this._parent) {
      return this._parent.getValue(key3);
    }
    return ret;
  }
  updateParent(parent) {
    this._parent = parent;
  }
  collectAllValues() {
    let result = this._parent ? this._parent.collectAllValues() : /* @__PURE__ */ Object.create(null);
    result = { ...result, ...this._value };
    delete result["_contextId"];
    return result;
  }
};

var NullContext = class _NullContext extends Context3 {
  static {
    this.INSTANCE = new _NullContext();
  }
  constructor() {
    super(-1, null);
  }
  setValue(key3, value2) {
    return false;
  }
  removeValue(key3) {
    return false;
  }
  getValue(key3) {
    return void 0;
  }
  collectAllValues() {
    return /* @__PURE__ */ Object.create(null);
  }
};

var ConfigAwareContextValuesContainer = class _ConfigAwareContextValuesContainer extends Context3 {
  constructor(id2, _configurationService, emitter) {
    super(id2, null);
    this._configurationService = _configurationService;
    this._values = TernarySearchTree.forConfigKeys();
    this._listener = this._configurationService.onDidChangeConfiguration((event) => {
      if (event.source === 7 /* DEFAULT */) {
        const allKeys = Array.from(this._values, ([k]) => k);
        this._values.clear();
        emitter.fire(new ArrayContextKeyChangeEvent(allKeys));
      } else {
        const changedKeys = [];
        for (const configKey of event.affectedKeys) {
          const contextKey = `config.${configKey}`;
          const cachedItems = this._values.findSuperstr(contextKey);
          if (cachedItems !== void 0) {
            changedKeys.push(...Iterable.map(cachedItems, ([key3]) => key3));
            this._values.deleteSuperstr(contextKey);
          }
          if (this._values.has(contextKey)) {
            changedKeys.push(contextKey);
            this._values.delete(contextKey);
          }
        }
        emitter.fire(new ArrayContextKeyChangeEvent(changedKeys));
      }
    });
  }
  static {
    this._keyPrefix = "config.";
  }
  dispose() {
    this._listener.dispose();
  }
  getValue(key3) {
    if (key3.indexOf(_ConfigAwareContextValuesContainer._keyPrefix) !== 0) {
      return super.getValue(key3);
    }
    if (this._values.has(key3)) {
      return this._values.get(key3);
    }
    const configKey = key3.substr(_ConfigAwareContextValuesContainer._keyPrefix.length);
    const configValue = this._configurationService.getValue(configKey);
    let value2 = void 0;
    switch (typeof configValue) {
      case "number":
      case "boolean":
      case "string":
        value2 = configValue;
        break;
      default:
        if (Array.isArray(configValue)) {
          value2 = JSON.stringify(configValue);
        } else {
          value2 = configValue;
        }
    }
    this._values.set(key3, value2);
    return value2;
  }
  setValue(key3, value2) {
    return super.setValue(key3, value2);
  }
  removeValue(key3) {
    return super.removeValue(key3);
  }
  collectAllValues() {
    const result = /* @__PURE__ */ Object.create(null);
    this._values.forEach((value2, index2) => result[index2] = value2);
    return { ...result, ...super.collectAllValues() };
  }
};

var ContextKey = class {
  constructor(service, key3, defaultValue) {
    this._service = service;
    this._key = key3;
    this._defaultValue = defaultValue;
    this.reset();
  }
  set(value2) {
    this._service.setContext(this._key, value2);
  }
  reset() {
    if (typeof this._defaultValue === "undefined") {
      this._service.removeContext(this._key);
    } else {
      this._service.setContext(this._key, this._defaultValue);
    }
  }
  get() {
    return this._service.getContextKeyValue(this._key);
  }
};

var SimpleContextKeyChangeEvent = class {
  constructor(key3) {
    this.key = key3;
  }
  affectsSome(keys) {
    return keys.has(this.key);
  }
  allKeysContainedIn(keys) {
    return this.affectsSome(keys);
  }
};

var ArrayContextKeyChangeEvent = class {
  constructor(keys) {
    this.keys = keys;
  }
  affectsSome(keys) {
    for (const key3 of this.keys) {
      if (keys.has(key3)) {
        return true;
      }
    }
    return false;
  }
  allKeysContainedIn(keys) {
    return this.keys.every((key3) => keys.has(key3));
  }
};

var CompositeContextKeyChangeEvent = class {
  constructor(events) {
    this.events = events;
  }
  affectsSome(keys) {
    for (const e of this.events) {
      if (e.affectsSome(keys)) {
        return true;
      }
    }
    return false;
  }
  allKeysContainedIn(keys) {
    return this.events.every((evt) => evt.allKeysContainedIn(keys));
  }
};

function allEventKeysInContext(event, context2) {
  return event.allKeysContainedIn(new Set(Object.keys(context2)));
}

var AbstractContextKeyService = class extends Disposable {
  constructor(myContextId) {
    super();
    this._onDidChangeContext = this._register(new PauseableEmitter({ merge: (input) => new CompositeContextKeyChangeEvent(input) }));
    this._isDisposed = false;
    this._myContextId = myContextId;
  }
  get onDidChangeContext() {
    return this._onDidChangeContext.event;
  }
  get contextId() {
    return this._myContextId;
  }
  createKey(key3, defaultValue) {
    if (this._isDisposed) {
      throw new Error(`AbstractContextKeyService has been disposed`);
    }
    return new ContextKey(this, key3, defaultValue);
  }
  bufferChangeEvents(callback) {
    this._onDidChangeContext.pause();
    try {
      callback();
    } finally {
      this._onDidChangeContext.resume();
    }
  }
  createScoped(domNode) {
    if (this._isDisposed) {
      throw new Error(`AbstractContextKeyService has been disposed`);
    }
    return new ScopedContextKeyService(this, domNode);
  }
  createOverlay(overlay = Iterable.empty()) {
    if (this._isDisposed) {
      throw new Error(`AbstractContextKeyService has been disposed`);
    }
    return new OverlayContextKeyService(this, overlay);
  }
  contextMatchesRules(rules) {
    if (this._isDisposed) {
      throw new Error(`AbstractContextKeyService has been disposed`);
    }
    const context2 = this.getContextValuesContainer(this._myContextId);
    const result = rules ? rules.evaluate(context2) : true;
    return result;
  }
  getContextKeyValue(key3) {
    if (this._isDisposed) {
      return void 0;
    }
    return this.getContextValuesContainer(this._myContextId).getValue(key3);
  }
  setContext(key3, value2) {
    if (this._isDisposed) {
      return;
    }
    const myContext = this.getContextValuesContainer(this._myContextId);
    if (!myContext) {
      return;
    }
    if (myContext.setValue(key3, value2)) {
      this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key3));
    }
  }
  removeContext(key3) {
    if (this._isDisposed) {
      return;
    }
    if (this.getContextValuesContainer(this._myContextId).removeValue(key3)) {
      this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key3));
    }
  }
  getContext(target) {
    if (this._isDisposed) {
      return NullContext.INSTANCE;
    }
    return this.getContextValuesContainer(findContextAttr(target));
  }
  dispose() {
    super.dispose();
    this._isDisposed = true;
  }
};

var ContextKeyService = class extends AbstractContextKeyService {
  constructor(configurationService) {
    super(0);
    this._contexts = /* @__PURE__ */ new Map();
    this._lastContextId = 0;
    this.inputFocusedContext = InputFocusedContext.bindTo(this);
    const myContext = this._register(new ConfigAwareContextValuesContainer(this._myContextId, configurationService, this._onDidChangeContext));
    this._contexts.set(this._myContextId, myContext);
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => {
      const onFocusDisposables = disposables.add(new MutableDisposable());
      disposables.add(addDisposableListener(window2, EventType.FOCUS_IN, () => {
        onFocusDisposables.value = new DisposableStore();
        this.updateInputContextKeys(window2.document, onFocusDisposables.value);
      }, true));
    }, { window: mainWindow, disposables: this._store }));
  }
  updateInputContextKeys(ownerDocument, disposables) {
    function activeElementIsInput() {
      return !!ownerDocument.activeElement && isEditableElement(ownerDocument.activeElement);
    }
    const isInputFocused = activeElementIsInput();
    this.inputFocusedContext.set(isInputFocused);
    if (isInputFocused) {
      const tracker2 = disposables.add(trackFocus(ownerDocument.activeElement));
      Event2.once(tracker2.onDidBlur)(() => {
        if (getActiveWindow().document === ownerDocument) {
          this.inputFocusedContext.set(activeElementIsInput());
        }
        tracker2.dispose();
      }, void 0, disposables);
    }
  }
  getContextValuesContainer(contextId) {
    if (this._isDisposed) {
      return NullContext.INSTANCE;
    }
    return this._contexts.get(contextId) || NullContext.INSTANCE;
  }
  createChildContext(parentContextId = this._myContextId) {
    if (this._isDisposed) {
      throw new Error(`ContextKeyService has been disposed`);
    }
    const id2 = ++this._lastContextId;
    this._contexts.set(id2, new Context3(id2, this.getContextValuesContainer(parentContextId)));
    return id2;
  }
  disposeContext(contextId) {
    if (!this._isDisposed) {
      this._contexts.delete(contextId);
    }
  }
  updateParent(_parentContextKeyService) {
    throw new Error("Cannot update parent of root ContextKeyService");
  }
};

ContextKeyService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], ContextKeyService);

var ScopedContextKeyService = class extends AbstractContextKeyService {
  constructor(parent, domNode) {
    super(parent.createChildContext());
    this._parentChangeListener = this._register(new MutableDisposable());
    this._parent = parent;
    this._updateParentChangeListener();
    this._domNode = domNode;
    if (this._domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
      let extraInfo = "";
      if (this._domNode.classList) {
        extraInfo = Array.from(this._domNode.classList.values()).join(", ");
      }
      console.error(`Element already has context attribute${extraInfo ? ": " + extraInfo : ""}`);
    }
    this._domNode.setAttribute(KEYBINDING_CONTEXT_ATTR, String(this._myContextId));
  }
  _updateParentChangeListener() {
    this._parentChangeListener.value = this._parent.onDidChangeContext((e) => {
      const thisContainer = this._parent.getContextValuesContainer(this._myContextId);
      const thisContextValues = thisContainer.value;
      if (!allEventKeysInContext(e, thisContextValues)) {
        this._onDidChangeContext.fire(e);
      }
    });
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._parentChangeListener.clear();
    this._parent.disposeContext(this._myContextId);
    this._domNode.removeAttribute(KEYBINDING_CONTEXT_ATTR);
    super.dispose();
  }
  getContextValuesContainer(contextId) {
    if (this._isDisposed) {
      return NullContext.INSTANCE;
    }
    return this._parent.getContextValuesContainer(contextId);
  }
  createChildContext(parentContextId = this._myContextId) {
    if (this._isDisposed) {
      throw new Error(`ScopedContextKeyService has been disposed`);
    }
    return this._parent.createChildContext(parentContextId);
  }
  disposeContext(contextId) {
    this._parent.disposeContext(contextId);
  }
  updateParent(parentContextKeyService) {
    if (this._parent === parentContextKeyService) {
      return;
    }
    const thisContainer = this._parent.getContextValuesContainer(this._myContextId);
    const oldAllValues = thisContainer.collectAllValues();
    this._parent = parentContextKeyService;
    this._updateParentChangeListener();
    const newParentContainer = this._parent.getContextValuesContainer(this._parent.contextId);
    thisContainer.updateParent(newParentContainer);
    const newAllValues = thisContainer.collectAllValues();
    const allValuesDiff = {
      ...distinct2(oldAllValues, newAllValues),
      ...distinct2(newAllValues, oldAllValues)
    };
    const changedKeys = Object.keys(allValuesDiff);
    this._onDidChangeContext.fire(new ArrayContextKeyChangeEvent(changedKeys));
  }
};

var OverlayContext = class {
  constructor(parent, overlay) {
    this.parent = parent;
    this.overlay = overlay;
  }
  getValue(key3) {
    return this.overlay.has(key3) ? this.overlay.get(key3) : this.parent.getValue(key3);
  }
};

var OverlayContextKeyService = class _OverlayContextKeyService {
  constructor(parent, overlay) {
    this.parent = parent;
    this.overlay = new Map(overlay);
  }
  get contextId() {
    return this.parent.contextId;
  }
  get onDidChangeContext() {
    return this.parent.onDidChangeContext;
  }
  bufferChangeEvents(callback) {
    this.parent.bufferChangeEvents(callback);
  }
  createKey() {
    throw new Error("Not supported.");
  }
  getContext(target) {
    return new OverlayContext(this.parent.getContext(target), this.overlay);
  }
  getContextValuesContainer(contextId) {
    const parentContext = this.parent.getContextValuesContainer(contextId);
    return new OverlayContext(parentContext, this.overlay);
  }
  contextMatchesRules(rules) {
    const context2 = this.getContextValuesContainer(this.contextId);
    const result = rules ? rules.evaluate(context2) : true;
    return result;
  }
  getContextKeyValue(key3) {
    return this.overlay.has(key3) ? this.overlay.get(key3) : this.parent.getContextKeyValue(key3);
  }
  createScoped() {
    throw new Error("Not supported.");
  }
  createOverlay(overlay = Iterable.empty()) {
    return new _OverlayContextKeyService(this, overlay);
  }
  updateParent() {
    throw new Error("Not supported.");
  }
};

function findContextAttr(domNode) {
  while (domNode) {
    if (domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
      const attr = domNode.getAttribute(KEYBINDING_CONTEXT_ATTR);
      if (attr) {
        return parseInt(attr, 10);
      }
      return NaN;
    }
    domNode = domNode.parentElement;
  }
  return 0;
}

function setContext(accessor, contextKey, contextValue) {
  const contextKeyService = accessor.get(IContextKeyService);
  contextKeyService.createKey(String(contextKey), stringifyURIs(contextValue));
}

function stringifyURIs(contextValue) {
  return cloneAndChange(contextValue, (obj) => {
    if (typeof obj === "object" && obj.$mid === 1 /* Uri */) {
      return URI.revive(obj).toString();
    }
    if (obj instanceof URI) {
      return obj.toString();
    }
    return void 0;
  });
}

CommandsRegistry.registerCommand("_setContext", setContext);

CommandsRegistry.registerCommand({
  id: "getContextKeyInfo",
  handler() {
    return [...RawContextKey.all()].sort((a, b) => a.key.localeCompare(b.key));
  },
  metadata: {
    description: localize(2795, null),
    args: []
  }
});

CommandsRegistry.registerCommand("_generateContextKeyInfo", function() {
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const info of RawContextKey.all()) {
    if (!seen.has(info.key)) {
      seen.add(info.key);
      result.push(info);
    }
  }
  result.sort((a, b) => a.key.localeCompare(b.key));
  console.log(JSON.stringify(result, void 0, 2));
});
export { allEventKeysInContext, findContextAttr, setContext, stringifyURIs, KEYBINDING_CONTEXT_ATTR, Context3, NullContext, ConfigAwareContextValuesContainer, ContextKey, SimpleContextKeyChangeEvent, ArrayContextKeyChangeEvent, CompositeContextKeyChangeEvent, AbstractContextKeyService, ContextKeyService, ScopedContextKeyService, OverlayContext, OverlayContextKeyService };
