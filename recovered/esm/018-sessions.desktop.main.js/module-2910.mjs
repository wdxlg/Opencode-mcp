// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/observableValue.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/testing/common/observableValue.ts
var MutableObservableValue = class _MutableObservableValue extends Disposable {
  constructor(_value) {
    super();
    this._value = _value;
    this.changeEmitter = this._register(new Emitter());
    this.onDidChange = this.changeEmitter.event;
  }
  get value() {
    return this._value;
  }
  set value(v2) {
    if (v2 !== this._value) {
      this._value = v2;
      this.changeEmitter.fire(v2);
    }
  }
  static stored(stored, defaultValue) {
    const o = new _MutableObservableValue(stored.get(defaultValue));
    o._register(stored);
    o._register(o.onDidChange((value2) => stored.store(value2)));
    return o;
  }
};
export { MutableObservableValue };
