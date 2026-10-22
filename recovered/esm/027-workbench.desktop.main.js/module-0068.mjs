// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/logging/consoleObservableLogger.ts
import { addLogger } from "./module-0044.mjs";
import { Derived } from "./module-0053.mjs";
import { getClassName } from "./module-0041.mjs";


// src/vs/base/common/observableInternal/logging/consoleObservableLogger.ts
var consoleObservableLogger;

function logObservableToConsole(obs) {
  if (!consoleObservableLogger) {
    consoleObservableLogger = new ConsoleObservableLogger();
    addLogger(consoleObservableLogger);
  }
  consoleObservableLogger.addFilteredObj(obs);
}

var ConsoleObservableLogger = class {
  constructor() {
    this.indentation = 0;
    this.changedObservablesSets = /* @__PURE__ */ new WeakMap();
  }
  addFilteredObj(obj) {
    if (!this._filteredObjects) {
      this._filteredObjects = /* @__PURE__ */ new Set();
    }
    this._filteredObjects.add(obj);
  }
  _isIncluded(obj) {
    return this._filteredObjects?.has(obj) ?? true;
  }
  textToConsoleArgs(text2) {
    return consoleTextToArgs([
      normalText(repeat("|  ", this.indentation)),
      text2
    ]);
  }
  formatInfo(info) {
    if (!info.hadValue) {
      return [
        normalText(` `),
        styled(formatValue(info.newValue, 60), {
          color: "green"
        }),
        normalText(` (initial)`)
      ];
    }
    return info.didChange ? [
      normalText(` `),
      styled(formatValue(info.oldValue, 70), {
        color: "red",
        strikeThrough: true
      }),
      normalText(` `),
      styled(formatValue(info.newValue, 60), {
        color: "green"
      })
    ] : [normalText(` (unchanged)`)];
  }
  handleObservableCreated(observable) {
    if (observable instanceof Derived) {
      const derived2 = observable;
      this.changedObservablesSets.set(derived2, /* @__PURE__ */ new Set());
      const debugTrackUpdating = false;
      if (debugTrackUpdating) {
        const updating = [];
        derived2.__debugUpdating = updating;
        const existingBeginUpdate = derived2.beginUpdate;
        derived2.beginUpdate = (obs) => {
          updating.push(obs);
          return existingBeginUpdate.apply(derived2, [obs]);
        };
        const existingEndUpdate = derived2.endUpdate;
        derived2.endUpdate = (obs) => {
          const idx = updating.indexOf(obs);
          if (idx === -1) {
            console.error("endUpdate called without beginUpdate", derived2.debugName, obs.debugName);
          }
          updating.splice(idx, 1);
          return existingEndUpdate.apply(derived2, [obs]);
        };
      }
    }
  }
  handleOnListenerCountChanged(observable, newCount) {
  }
  handleObservableUpdated(observable, info) {
    if (!this._isIncluded(observable)) {
      return;
    }
    if (observable instanceof Derived) {
      this._handleDerivedRecomputed(observable, info);
      return;
    }
    console.log(...this.textToConsoleArgs([
      formatKind("observable value changed"),
      styled(observable.debugName, { color: "BlueViolet" }),
      ...this.formatInfo(info)
    ]));
  }
  formatChanges(changes) {
    if (changes.size === 0) {
      return void 0;
    }
    return styled(
      " (changed deps: " + [...changes].map((o) => o.debugName).join(", ") + ")",
      { color: "gray" }
    );
  }
  handleDerivedDependencyChanged(derived2, observable, change) {
    if (!this._isIncluded(derived2)) {
      return;
    }
    this.changedObservablesSets.get(derived2)?.add(observable);
  }
  _handleDerivedRecomputed(derived2, info) {
    if (!this._isIncluded(derived2)) {
      return;
    }
    const changedObservables = this.changedObservablesSets.get(derived2);
    if (!changedObservables) {
      return;
    }
    console.log(...this.textToConsoleArgs([
      formatKind("derived recomputed"),
      styled(derived2.debugName, { color: "BlueViolet" }),
      ...this.formatInfo(info),
      this.formatChanges(changedObservables),
      { data: [{ fn: derived2._debugNameData.referenceFn ?? derived2._computeFn }] }
    ]));
    changedObservables.clear();
  }
  handleDerivedCleared(derived2) {
    if (!this._isIncluded(derived2)) {
      return;
    }
    console.log(...this.textToConsoleArgs([
      formatKind("derived cleared"),
      styled(derived2.debugName, { color: "BlueViolet" })
    ]));
  }
  handleFromEventObservableTriggered(observable, info) {
    if (!this._isIncluded(observable)) {
      return;
    }
    console.log(...this.textToConsoleArgs([
      formatKind("observable from event triggered"),
      styled(observable.debugName, { color: "BlueViolet" }),
      ...this.formatInfo(info),
      { data: [{ fn: observable._getValue }] }
    ]));
  }
  handleAutorunCreated(autorun2) {
    if (!this._isIncluded(autorun2)) {
      return;
    }
    this.changedObservablesSets.set(autorun2, /* @__PURE__ */ new Set());
  }
  handleAutorunDisposed(autorun2) {
  }
  handleAutorunDependencyChanged(autorun2, observable, change) {
    if (!this._isIncluded(autorun2)) {
      return;
    }
    this.changedObservablesSets.get(autorun2).add(observable);
  }
  handleAutorunStarted(autorun2) {
    const changedObservables = this.changedObservablesSets.get(autorun2);
    if (!changedObservables) {
      return;
    }
    if (this._isIncluded(autorun2)) {
      console.log(...this.textToConsoleArgs([
        formatKind("autorun"),
        styled(autorun2.debugName, { color: "BlueViolet" }),
        this.formatChanges(changedObservables),
        { data: [{ fn: autorun2._debugNameData.referenceFn ?? autorun2._runFn }] }
      ]));
    }
    changedObservables.clear();
    this.indentation++;
  }
  handleAutorunFinished(autorun2) {
    this.indentation--;
  }
  handleBeginTransaction(transaction2) {
    let transactionName = transaction2.getDebugName();
    if (transactionName === void 0) {
      transactionName = "";
    }
    if (this._isIncluded(transaction2)) {
      console.log(...this.textToConsoleArgs([
        formatKind("transaction"),
        styled(transactionName, { color: "BlueViolet" }),
        { data: [{ fn: transaction2._fn }] }
      ]));
    }
    this.indentation++;
  }
  handleEndTransaction() {
    this.indentation--;
  }
};

function consoleTextToArgs(text2) {
  const styles = new Array();
  const data = [];
  let firstArg = "";
  function process3(t2) {
    if ("length" in t2) {
      for (const item of t2) {
        if (item) {
          process3(item);
        }
      }
    } else if ("text" in t2) {
      firstArg += `%c${t2.text}`;
      styles.push(t2.style);
      if (t2.data) {
        data.push(...t2.data);
      }
    } else if ("data" in t2) {
      data.push(...t2.data);
    }
  }
  process3(text2);
  const result = [firstArg, ...styles];
  result.push(...data);
  return result;
}

function normalText(text2) {
  return styled(text2, { color: "black" });
}

function formatKind(kind) {
  return styled(padStr(`${kind}: `, 10), { color: "black", bold: true });
}

function styled(text2, options3 = {
  color: "black"
}) {
  function objToCss(styleObj) {
    return Object.entries(styleObj).reduce(
      (styleString, [propName, propValue]) => {
        return `${styleString}${propName}:${propValue};`;
      },
      ""
    );
  }
  const style = {
    color: options3.color
  };
  if (options3.strikeThrough) {
    style["text-decoration"] = "line-through";
  }
  if (options3.bold) {
    style["font-weight"] = "bold";
  }
  return {
    text: text2,
    style: objToCss(style)
  };
}

function formatValue(value2, availableLen) {
  switch (typeof value2) {
    case "number":
      return "" + value2;
    case "string":
      if (value2.length + 2 <= availableLen) {
        return `"${value2}"`;
      }
      return `"${value2.substr(0, availableLen - 7)}"+...`;
    case "boolean":
      return value2 ? "true" : "false";
    case "undefined":
      return "undefined";
    case "object":
      if (value2 === null) {
        return "null";
      }
      if (Array.isArray(value2)) {
        return formatArray(value2, availableLen);
      }
      return formatObject(value2, availableLen);
    case "symbol":
      return value2.toString();
    case "function":
      return `[[Function${value2.name ? " " + value2.name : ""}]]`;
    default:
      return "" + value2;
  }
}

function formatArray(value2, availableLen) {
  let result = "[ ";
  let first2 = true;
  for (const val of value2) {
    if (!first2) {
      result += ", ";
    }
    if (result.length - 5 > availableLen) {
      result += "...";
      break;
    }
    first2 = false;
    result += `${formatValue(val, availableLen - result.length)}`;
  }
  result += " ]";
  return result;
}

function formatObject(value2, availableLen) {
  if (typeof value2.toString === "function" && value2.toString !== Object.prototype.toString) {
    const val = value2.toString();
    if (val.length <= availableLen) {
      return val;
    }
    return val.substring(0, availableLen - 3) + "...";
  }
  const className2 = getClassName(value2);
  let result = className2 ? className2 + "(" : "{ ";
  let first2 = true;
  for (const [key3, val] of Object.entries(value2)) {
    if (!first2) {
      result += ", ";
    }
    if (result.length - 5 > availableLen) {
      result += "...";
      break;
    }
    first2 = false;
    result += `${key3}: ${formatValue(val, availableLen - result.length)}`;
  }
  result += className2 ? ")" : " }";
  return result;
}

function repeat(str, count2) {
  let result = "";
  for (let i2 = 1; i2 <= count2; i2++) {
    result += str;
  }
  return result;
}

function padStr(str, length) {
  while (str.length < length) {
    str += " ";
  }
  return str;
}
export { logObservableToConsole, consoleTextToArgs, normalText, formatKind, styled, formatValue, formatArray, formatObject, repeat, padStr, consoleObservableLogger, ConsoleObservableLogger };
