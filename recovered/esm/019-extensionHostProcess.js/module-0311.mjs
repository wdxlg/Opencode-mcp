// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/configurationResolver/common/configurationResolverExpression.ts
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { Iterable } from "./module-0010.mjs";


// src/vs/workbench/services/configurationResolver/common/configurationResolverExpression.ts
var ConfigurationResolverExpression = class _ConfigurationResolverExpression {
  constructor(object) {
    this.locations = /* @__PURE__ */ new Map();
    /**
     * Callbacks when a new replacement is made, so that nested resolutions from
     * `expr.unresolved()` can be fulfilled in the same iteration.
     */
    this.newReplacementNotifiers = /* @__PURE__ */ new Set();
    if (typeof object === "string") {
      this.stringRoot = true;
      this.root = { value: object };
    } else {
      this.stringRoot = false;
      this.root = structuredClone(object);
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
  static parse(object) {
    if (object instanceof _ConfigurationResolverExpression) {
      return object;
    }
    const expr = new _ConfigurationResolverExpression(object);
    expr.applyPlatformSpecificKeys();
    expr.parseObject(expr.root);
    return expr;
  }
  applyPlatformSpecificKeys() {
    const config = this.root;
    const key = isWindows ? "windows" : isMacintosh ? "osx" : isLinux ? "linux" : void 0;
    if (key && config && typeof config === "object" && config.hasOwnProperty(key)) {
      Object.keys(config[key]).forEach((k) => config[k] = config[key][k]);
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
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];
        if (typeof value === "string") {
          this.parseString(obj, i, value);
        } else {
          this.parseObject(value);
        }
      }
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      this.parseString(obj, key, key, true);
      if (typeof value === "string") {
        this.parseString(obj, key, value);
      } else {
        this.parseObject(value);
      }
    }
  }
  parseString(object, propertyName, value, replaceKeyName, replacementPath) {
    let pos = 0;
    while (pos < value.length) {
      const match2 = value.indexOf("${", pos);
      if (match2 === -1) {
        break;
      }
      const parsed = this.parseVariable(value, match2);
      if (parsed) {
        pos = parsed.end + 1;
        if (replacementPath?.includes(parsed.replacement.id)) {
          continue;
        }
        const locations = this.locations.get(parsed.replacement.id) || { locations: [], replacement: parsed.replacement };
        const newLocation = { object, propertyName, replaceKeyName };
        locations.locations.push(newLocation);
        this.locations.set(parsed.replacement.id, locations);
        if (locations.resolved) {
          this._resolveAtLocation(parsed.replacement, newLocation, locations.resolved, replacementPath);
        } else {
          this.newReplacementNotifiers.forEach((n) => n(parsed.replacement));
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
      const [key, value] = next;
      yield value;
      newReplacements.delete(key);
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
  _resolveAtLocation(replacement, { replaceKeyName, propertyName, object }, data, path = []) {
    if (data.value === void 0) {
      return;
    }
    path.push(replacement.id);
    if (replaceKeyName && typeof propertyName === "string") {
      const value = object[propertyName];
      const newKey = propertyName.replaceAll(replacement.id, data.value);
      delete object[propertyName];
      object[newKey] = value;
      this._renameKeyInLocations(object, propertyName, newKey);
      this.parseString(object, newKey, data.value, true, path);
    } else {
      object[propertyName] = object[propertyName].replaceAll(replacement.id, data.value);
      this.parseString(object, propertyName, data.value, false, path);
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
