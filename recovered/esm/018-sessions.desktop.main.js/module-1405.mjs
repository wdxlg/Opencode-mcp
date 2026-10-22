// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/configurationResolver/common/configurationResolverExpression.ts
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { Iterable } from "./module-0011.mjs";


// src/vs/workbench/services/configurationResolver/common/configurationResolverExpression.ts
var ConfigurationResolverExpression = class _ConfigurationResolverExpression {
  constructor(object2) {
    this.locations = /* @__PURE__ */ new Map();
    /**
     * Callbacks when a new replacement is made, so that nested resolutions from
     * `expr.unresolved()` can be fulfilled in the same iteration.
     */
    this.newReplacementNotifiers = /* @__PURE__ */ new Set();
    if (typeof object2 === "string") {
      this.stringRoot = true;
      this.root = { value: object2 };
    } else {
      this.stringRoot = false;
      this.root = structuredClone(object2);
    }
  }
  static {
    this.VARIABLE_LHS = "${";
  }
  /**
   * Creates a new {@link ConfigurationResolverExpression} from an object.
   * Note that platform-specific keys (i.e. `windows`, `osx`, `linux`) are
   * applied during parsing.
   */
  static parse(object2) {
    if (object2 instanceof _ConfigurationResolverExpression) {
      return object2;
    }
    const expr = new _ConfigurationResolverExpression(object2);
    expr.applyPlatformSpecificKeys();
    expr.parseObject(expr.root);
    return expr;
  }
  applyPlatformSpecificKeys() {
    const config = this.root;
    const key3 = isWindows ? "windows" : isMacintosh ? "osx" : isLinux ? "linux" : void 0;
    if (key3 && config && typeof config === "object" && config.hasOwnProperty(key3)) {
      Object.keys(config[key3]).forEach((k) => config[k] = config[key3][k]);
    }
    delete config.windows;
    delete config.osx;
    delete config.linux;
  }
  parseVariable(str, start) {
    if (str[start] !== "$" || str[start + 1] !== "{") {
      return void 0;
    }
    let end = start + 2;
    let braceCount = 1;
    while (end < str.length) {
      if (str[end] === "{") {
        braceCount++;
      } else if (str[end] === "}") {
        braceCount--;
        if (braceCount === 0) {
          break;
        }
      }
      end++;
    }
    if (braceCount !== 0) {
      return void 0;
    }
    const id2 = str.slice(start, end + 1);
    const inner = str.substring(start + 2, end);
    const colonIdx = inner.indexOf(":");
    if (colonIdx === -1) {
      return { replacement: { id: id2, name: inner, inner }, end };
    }
    return {
      replacement: {
        id: id2,
        inner,
        name: inner.slice(0, colonIdx),
        arg: inner.slice(colonIdx + 1)
      },
      end
    };
  }
  parseObject(obj) {
    if (typeof obj !== "object" || obj === null) {
      return;
    }
    if (Array.isArray(obj)) {
      for (let i2 = 0; i2 < obj.length; i2++) {
        const value2 = obj[i2];
        if (typeof value2 === "string") {
          this.parseString(obj, i2, value2);
        } else {
          this.parseObject(value2);
        }
      }
      return;
    }
    for (const [key3, value2] of Object.entries(obj)) {
      this.parseString(obj, key3, key3, true);
      if (typeof value2 === "string") {
        this.parseString(obj, key3, value2);
      } else {
        this.parseObject(value2);
      }
    }
  }
  parseString(object2, propertyName, value2, replaceKeyName, replacementPath) {
    let pos = 0;
    while (pos < value2.length) {
      const match2 = value2.indexOf("${", pos);
      if (match2 === -1) {
        break;
      }
      const parsed = this.parseVariable(value2, match2);
      if (parsed) {
        pos = parsed.end + 1;
        if (replacementPath?.includes(parsed.replacement.id)) {
          continue;
        }
        const locations = this.locations.get(parsed.replacement.id) || { locations: [], replacement: parsed.replacement };
        const newLocation = { object: object2, propertyName, replaceKeyName };
        locations.locations.push(newLocation);
        this.locations.set(parsed.replacement.id, locations);
        if (locations.resolved) {
          this._resolveAtLocation(parsed.replacement, newLocation, locations.resolved, replacementPath);
        } else {
          this.newReplacementNotifiers.forEach((n2) => n2(parsed.replacement));
        }
      } else {
        pos = match2 + 2;
      }
    }
  }
  *unresolved() {
    const newReplacements = /* @__PURE__ */ new Map();
    const notifier = (replacement) => {
      newReplacements.set(replacement.id, replacement);
    };
    for (const location2 of this.locations.values()) {
      if (location2.resolved === void 0) {
        newReplacements.set(location2.replacement.id, location2.replacement);
      }
    }
    this.newReplacementNotifiers.add(notifier);
    while (true) {
      const next = Iterable.first(newReplacements);
      if (!next) {
        break;
      }
      const [key3, value2] = next;
      yield value2;
      newReplacements.delete(key3);
    }
    this.newReplacementNotifiers.delete(notifier);
  }
  resolved() {
    return Iterable.map(Iterable.filter(this.locations.values(), (l) => !!l.resolved), (l) => [l.replacement, l.resolved]);
  }
  resolve(replacement, data) {
    if (typeof data !== "object") {
      data = { value: String(data) };
    }
    const location2 = this.locations.get(replacement.id);
    if (!location2) {
      return;
    }
    location2.resolved = data;
    if (data.value !== void 0) {
      for (const l of location2.locations || Iterable.empty()) {
        this._resolveAtLocation(replacement, l, data);
      }
    }
  }
  _resolveAtLocation(replacement, { replaceKeyName, propertyName, object: object2 }, data, path = []) {
    if (data.value === void 0) {
      return;
    }
    path.push(replacement.id);
    if (replaceKeyName && typeof propertyName === "string") {
      const value2 = object2[propertyName];
      const newKey = propertyName.replaceAll(replacement.id, data.value);
      delete object2[propertyName];
      object2[newKey] = value2;
      this._renameKeyInLocations(object2, propertyName, newKey);
      this.parseString(object2, newKey, data.value, true, path);
    } else {
      object2[propertyName] = object2[propertyName].replaceAll(replacement.id, data.value);
      this.parseString(object2, propertyName, data.value, false, path);
    }
    path.pop();
  }
  _renameKeyInLocations(obj, oldKey, newKey) {
    for (const location2 of this.locations.values()) {
      for (const loc of location2.locations) {
        if (loc.object === obj && loc.propertyName === oldKey) {
          loc.propertyName = newKey;
        }
      }
    }
  }
  toObject() {
    if (this.stringRoot) {
      return this.root.value;
    }
    return this.root;
  }
};
export { ConfigurationResolverExpression };
