// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/utils.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { autorun, autorunHandleChanges, autorunOpts, autorunWithStore } from "./module-0052.mjs";
import { ElementSizeObserver } from "./module-0214.mjs";
import { observableValue } from "./module-0048.mjs";
import { transaction } from "./module-0045.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { findLast } from "./module-0006.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { TextLength } from "./module-0175.mjs";


// src/vs/editor/browser/widget/diffEditor/utils.ts
function joinCombine(arr1, arr2, keySelector, combine) {
  if (arr1.length === 0) {
    return arr2;
  }
  if (arr2.length === 0) {
    return arr1;
  }
  const result = [];
  let i2 = 0;
  let j = 0;
  while (i2 < arr1.length && j < arr2.length) {
    const val1 = arr1[i2];
    const val2 = arr2[j];
    const key1 = keySelector(val1);
    const key22 = keySelector(val2);
    if (key1 < key22) {
      result.push(val1);
      i2++;
    } else if (key1 > key22) {
      result.push(val2);
      j++;
    } else {
      result.push(combine(val1, val2));
      i2++;
      j++;
    }
  }
  while (i2 < arr1.length) {
    result.push(arr1[i2]);
    i2++;
  }
  while (j < arr2.length) {
    result.push(arr2[j]);
    j++;
  }
  return result;
}

function applyObservableDecorations(editor, decorations) {
  const d = new DisposableStore();
  const decorationsCollection = editor.createDecorationsCollection();
  d.add(autorunOpts({ debugName: () => `Apply decorations from ${decorations.debugName}` }, (reader) => {
    const d2 = decorations.read(reader);
    decorationsCollection.set(d2);
  }));
  d.add({
    dispose: () => {
      decorationsCollection.clear();
    }
  });
  return d;
}

function appendRemoveOnDispose(parent, child) {
  parent.appendChild(child);
  return toDisposable(() => {
    child.remove();
  });
}

function prependRemoveOnDispose(parent, child) {
  parent.prepend(child);
  return toDisposable(() => {
    child.remove();
  });
}

var ObservableElementSizeObserver = class extends Disposable {
  constructor(element, dimension) {
    super();
    this._automaticLayout = false;
    this.elementSizeObserver = this._register(new ElementSizeObserver(element, dimension));
    this._width = observableValue(this, this.elementSizeObserver.getWidth());
    this._height = observableValue(this, this.elementSizeObserver.getHeight());
    this._register(this.elementSizeObserver.onDidChange((e4) => transaction((tx) => {
      this._width.set(this.elementSizeObserver.getWidth(), tx);
      this._height.set(this.elementSizeObserver.getHeight(), tx);
    })));
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get automaticLayout() {
    return this._automaticLayout;
  }
  observe(dimension) {
    this.elementSizeObserver.observe(dimension);
  }
  setAutomaticLayout(automaticLayout) {
    this._automaticLayout = automaticLayout;
    if (automaticLayout) {
      this.elementSizeObserver.startObserving();
    } else {
      this.elementSizeObserver.stopObserving();
    }
  }
};

function animatedObservable(targetWindow, base, store) {
  let targetVal = base.get();
  let startVal = targetVal;
  let curVal = targetVal;
  const result = observableValue("animatedValue", targetVal);
  let animationStartMs = -1;
  const durationMs = 300;
  let animationFrame = void 0;
  store.add(autorunHandleChanges({
    changeTracker: {
      createChangeSummary: () => ({ animate: false }),
      handleChange: (ctx, s) => {
        if (ctx.didChange(base)) {
          s.animate = s.animate || ctx.change;
        }
        return true;
      }
    }
  }, (reader, s) => {
    if (animationFrame !== void 0) {
      targetWindow.cancelAnimationFrame(animationFrame);
      animationFrame = void 0;
    }
    startVal = curVal;
    targetVal = base.read(reader);
    if (startVal === targetVal) {
      animationStartMs = Date.now() - durationMs;
    } else {
      animationStartMs = Date.now() - (s.animate ? 0 : durationMs);
    }
    update();
  }));
  function update() {
    const passedMs = Date.now() - animationStartMs;
    curVal = Math.floor(easeOutExpo(passedMs, startVal, targetVal - startVal, durationMs));
    if (passedMs < durationMs) {
      animationFrame = targetWindow.requestAnimationFrame(update);
    } else {
      curVal = targetVal;
    }
    result.set(curVal, void 0);
  }
  return result;
}

function easeOutExpo(t2, b, c, d) {
  return t2 === d ? b + c : c * (-Math.pow(2, -10 * t2 / d) + 1) + b;
}

var ViewZoneOverlayWidget = class extends Disposable {
  constructor(editor, viewZone, htmlElement) {
    super();
    this._register(new ManagedOverlayWidget(editor, htmlElement));
    this._register(applyStyle(htmlElement, {
      height: viewZone.actualHeight,
      top: viewZone.actualTop
    }));
  }
};

var PlaceholderViewZone = class {
  constructor(_afterLineNumber, heightInPx) {
    this._afterLineNumber = _afterLineNumber;
    this.heightInPx = heightInPx;
    this.domNode = document.createElement("div");
    this._actualTop = observableValue(this, void 0);
    this._actualHeight = observableValue(this, void 0);
    this.actualTop = this._actualTop;
    this.actualHeight = this._actualHeight;
    this.showInHiddenAreas = true;
    this.onChange = this._afterLineNumber;
    this.onDomNodeTop = (top2) => {
      this._actualTop.set(top2, void 0);
    };
    this.onComputedHeight = (height) => {
      this._actualHeight.set(height, void 0);
    };
  }
  get afterLineNumber() {
    return this._afterLineNumber.get();
  }
};

var ManagedOverlayWidget = class _ManagedOverlayWidget {
  constructor(_editor, _domElement) {
    this._editor = _editor;
    this._domElement = _domElement;
    this._overlayWidgetId = `managedOverlayWidget-${_ManagedOverlayWidget._counter++}`;
    this._overlayWidget = {
      getId: () => this._overlayWidgetId,
      getDomNode: () => this._domElement,
      getPosition: () => null
    };
    this._editor.addOverlayWidget(this._overlayWidget);
  }
  static {
    this._counter = 0;
  }
  dispose() {
    this._editor.removeOverlayWidget(this._overlayWidget);
  }
};

function applyStyle(domNode, style) {
  return autorun((reader) => {
    for (let [key3, val] of Object.entries(style)) {
      if (val && typeof val === "object" && "read" in val) {
        val = val.read(reader);
      }
      if (typeof val === "number") {
        val = `${val}px`;
      }
      key3 = key3.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      domNode.style[key3] = val;
    }
  });
}

function applyViewZones(editor, viewZones, setIsUpdating, zoneIds) {
  const store = new DisposableStore();
  const lastViewZoneIds = [];
  store.add(autorunWithStore((reader, store2) => {
    const curViewZones = viewZones.read(reader);
    const viewZonIdsPerViewZone = /* @__PURE__ */ new Map();
    const viewZoneIdPerOnChangeObservable = /* @__PURE__ */ new Map();
    if (setIsUpdating) {
      setIsUpdating(true);
    }
    editor.changeViewZones((a) => {
      for (const id2 of lastViewZoneIds) {
        a.removeZone(id2);
        zoneIds?.delete(id2);
      }
      lastViewZoneIds.length = 0;
      for (const z of curViewZones) {
        const id2 = a.addZone(z);
        if (z.setZoneId) {
          z.setZoneId(id2);
        }
        lastViewZoneIds.push(id2);
        zoneIds?.add(id2);
        viewZonIdsPerViewZone.set(z, id2);
      }
    });
    if (setIsUpdating) {
      setIsUpdating(false);
    }
    store2.add(autorunHandleChanges({
      changeTracker: {
        createChangeSummary() {
          return { zoneIds: [] };
        },
        handleChange(context2, changeSummary) {
          const id2 = viewZoneIdPerOnChangeObservable.get(context2.changedObservable);
          if (id2 !== void 0) {
            changeSummary.zoneIds.push(id2);
          }
          return true;
        }
      }
    }, (reader2, changeSummary) => {
      for (const vz of curViewZones) {
        if (vz.onChange) {
          viewZoneIdPerOnChangeObservable.set(vz.onChange, viewZonIdsPerViewZone.get(vz));
          vz.onChange.read(reader2);
        }
      }
      if (setIsUpdating) {
        setIsUpdating(true);
      }
      editor.changeViewZones((a) => {
        for (const id2 of changeSummary.zoneIds) {
          a.layoutZone(id2);
        }
      });
      if (setIsUpdating) {
        setIsUpdating(false);
      }
    }));
  }));
  store.add({
    dispose() {
      if (setIsUpdating) {
        setIsUpdating(true);
      }
      editor.changeViewZones((a) => {
        for (const id2 of lastViewZoneIds) {
          a.removeZone(id2);
        }
      });
      zoneIds?.clear();
      if (setIsUpdating) {
        setIsUpdating(false);
      }
    }
  });
  return store;
}

var DisposableCancellationTokenSource = class extends CancellationTokenSource {
  dispose() {
    super.dispose(true);
  }
};

function translatePosition(posInOriginal, mappings) {
  const mapping2 = findLast(mappings, (m) => m.original.startLineNumber <= posInOriginal.lineNumber);
  if (!mapping2) {
    return Range2.fromPositions(posInOriginal);
  }
  if (mapping2.original.endLineNumberExclusive <= posInOriginal.lineNumber) {
    const newLineNumber = posInOriginal.lineNumber - mapping2.original.endLineNumberExclusive + mapping2.modified.endLineNumberExclusive;
    return Range2.fromPositions(new Position(newLineNumber, posInOriginal.column));
  }
  if (!mapping2.innerChanges) {
    return Range2.fromPositions(new Position(mapping2.modified.startLineNumber, 1));
  }
  const innerMapping = findLast(mapping2.innerChanges, (m) => m.originalRange.getStartPosition().isBeforeOrEqual(posInOriginal));
  if (!innerMapping) {
    const newLineNumber = posInOriginal.lineNumber - mapping2.original.startLineNumber + mapping2.modified.startLineNumber;
    return Range2.fromPositions(new Position(newLineNumber, posInOriginal.column));
  }
  if (innerMapping.originalRange.containsPosition(posInOriginal)) {
    return innerMapping.modifiedRange;
  } else {
    const l = lengthBetweenPositions(innerMapping.originalRange.getEndPosition(), posInOriginal);
    return Range2.fromPositions(l.addToPosition(innerMapping.modifiedRange.getEndPosition()));
  }
}

function lengthBetweenPositions(position1, position2) {
  if (position1.lineNumber === position2.lineNumber) {
    return new TextLength(0, position2.column - position1.column);
  } else {
    return new TextLength(position2.lineNumber - position1.lineNumber, position2.column - 1);
  }
}

function filterWithPrevious(arr, filter2) {
  let prev;
  return arr.filter((cur) => {
    const result = filter2(cur, prev);
    prev = cur;
    return result;
  });
}

var RefCounted = class {
  static create(value2, debugOwner = void 0) {
    return new BaseRefCounted(value2, value2, debugOwner);
  }
  static createWithDisposable(value2, disposable, debugOwner = void 0) {
    const store = new DisposableStore();
    store.add(disposable);
    store.add(value2);
    return new BaseRefCounted(value2, store, debugOwner);
  }
  static createOfNonDisposable(value2, disposable, debugOwner = void 0) {
    return new BaseRefCounted(value2, disposable, debugOwner);
  }
};

var BaseRefCounted = class extends RefCounted {
  constructor(object2, _disposable, _debugOwner) {
    super();
    this.object = object2;
    this._disposable = _disposable;
    this._debugOwner = _debugOwner;
    this._refCount = 1;
    this._isDisposed = false;
    this._owners = [];
    if (_debugOwner) {
      this._addOwner(_debugOwner);
    }
  }
  _addOwner(debugOwner) {
    if (debugOwner) {
      this._owners.push(debugOwner);
    }
  }
  createNewRef(debugOwner) {
    this._refCount++;
    if (debugOwner) {
      this._addOwner(debugOwner);
    }
    return new ClonedRefCounted(this, debugOwner);
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._decreaseRefCount(this._debugOwner);
  }
  _decreaseRefCount(debugOwner) {
    this._refCount--;
    if (this._refCount === 0) {
      this._disposable.dispose();
    }
    if (debugOwner) {
      const idx = this._owners.indexOf(debugOwner);
      if (idx !== -1) {
        this._owners.splice(idx, 1);
      }
    }
  }
};

var ClonedRefCounted = class extends RefCounted {
  constructor(_base, _debugOwner) {
    super();
    this._base = _base;
    this._debugOwner = _debugOwner;
    this._isDisposed = false;
  }
  get object() {
    return this._base.object;
  }
  createNewRef(debugOwner) {
    return this._base.createNewRef(debugOwner);
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._base._decreaseRefCount(this._debugOwner);
  }
};
export { joinCombine, applyObservableDecorations, appendRemoveOnDispose, prependRemoveOnDispose, animatedObservable, easeOutExpo, applyStyle, applyViewZones, translatePosition, lengthBetweenPositions, filterWithPrevious, ObservableElementSizeObserver, ViewZoneOverlayWidget, PlaceholderViewZone, ManagedOverlayWidget, DisposableCancellationTokenSource, RefCounted, BaseRefCounted, ClonedRefCounted };
