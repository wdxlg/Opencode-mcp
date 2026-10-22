// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/logging/debugGetDependencyGraph.ts
import { formatValue } from "./module-0068.mjs";
import { AutorunObserver } from "./module-0051.mjs";
import { Derived } from "./module-0053.mjs";
import { ObservableValue } from "./module-0048.mjs";
import { FromEventObservable } from "./module-0057.mjs";


// src/vs/base/common/observableInternal/logging/debugGetDependencyGraph.ts
function debugGetObservableGraph(obs, options3) {
  const debugNamePostProcessor = options3?.debugNamePostProcessor ?? ((str) => str);
  const info = Info.from(obs, debugNamePostProcessor);
  if (!info) {
    return "";
  }
  const alreadyListed = /* @__PURE__ */ new Set();
  if (options3.type === "observers") {
    return formatObservableInfoWithObservers(info, 0, alreadyListed, options3).trim();
  } else {
    return formatObservableInfoWithDependencies(info, 0, alreadyListed, options3).trim();
  }
}

function formatObservableInfoWithDependencies(info, indentLevel, alreadyListed, options3) {
  const indent = "		".repeat(indentLevel);
  const lines = [];
  const isAlreadyListed = alreadyListed.has(info.sourceObj);
  if (isAlreadyListed) {
    lines.push(`${indent}* ${info.type} ${info.name} (already listed)`);
    return lines.join("\n");
  }
  alreadyListed.add(info.sourceObj);
  lines.push(`${indent}* ${info.type} ${info.name}:`);
  lines.push(`${indent}  value: ${formatValue(info.value, 50)}`);
  lines.push(`${indent}  state: ${info.state}`);
  if (info.dependencies.length > 0) {
    lines.push(`${indent}  dependencies:`);
    for (const dep of info.dependencies) {
      const info2 = Info.from(dep, options3.debugNamePostProcessor ?? ((name) => name)) ?? Info.unknown(dep);
      lines.push(formatObservableInfoWithDependencies(info2, indentLevel + 1, alreadyListed, options3));
    }
  }
  return lines.join("\n");
}

function formatObservableInfoWithObservers(info, indentLevel, alreadyListed, options3) {
  const indent = "		".repeat(indentLevel);
  const lines = [];
  const isAlreadyListed = alreadyListed.has(info.sourceObj);
  if (isAlreadyListed) {
    lines.push(`${indent}* ${info.type} ${info.name} (already listed)`);
    return lines.join("\n");
  }
  alreadyListed.add(info.sourceObj);
  lines.push(`${indent}* ${info.type} ${info.name}:`);
  lines.push(`${indent}  value: ${formatValue(info.value, 50)}`);
  lines.push(`${indent}  state: ${info.state}`);
  if (info.observers.length > 0) {
    lines.push(`${indent}  observers:`);
    for (const observer of info.observers) {
      const info2 = Info.from(observer, options3.debugNamePostProcessor ?? ((name) => name)) ?? Info.unknown(observer);
      lines.push(formatObservableInfoWithObservers(info2, indentLevel + 1, alreadyListed, options3));
    }
  }
  return lines.join("\n");
}

var Info = class _Info {
  constructor(sourceObj, name, type, value2, state, dependencies, observers) {
    this.sourceObj = sourceObj;
    this.name = name;
    this.type = type;
    this.value = value2;
    this.state = state;
    this.dependencies = dependencies;
    this.observers = observers;
  }
  static from(obs, debugNamePostProcessor) {
    if (obs instanceof AutorunObserver) {
      const state = obs.debugGetState();
      return new _Info(
        obs,
        debugNamePostProcessor(obs.debugName),
        "autorun",
        void 0,
        state.stateStr,
        Array.from(state.dependencies),
        []
      );
    } else if (obs instanceof Derived) {
      const state = obs.debugGetState();
      return new _Info(
        obs,
        debugNamePostProcessor(obs.debugName),
        "derived",
        state.value,
        state.stateStr,
        Array.from(state.dependencies),
        Array.from(obs.debugGetObservers())
      );
    } else if (obs instanceof ObservableValue) {
      const state = obs.debugGetState();
      return new _Info(
        obs,
        debugNamePostProcessor(obs.debugName),
        "observableValue",
        state.value,
        "upToDate",
        [],
        Array.from(obs.debugGetObservers())
      );
    } else if (obs instanceof FromEventObservable) {
      const state = obs.debugGetState();
      return new _Info(
        obs,
        debugNamePostProcessor(obs.debugName),
        "fromEvent",
        state.value,
        state.hasValue ? "upToDate" : "initial",
        [],
        Array.from(obs.debugGetObservers())
      );
    }
    return void 0;
  }
  static unknown(obs) {
    return new _Info(
      obs,
      "(unknown)",
      "unknown",
      void 0,
      "unknown",
      [],
      []
    );
  }
};
export { debugGetObservableGraph, formatObservableInfoWithDependencies, formatObservableInfoWithObservers, Info };
