// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/base/common/observableInternal/debugName.ts



// src/vs/base/common/observableInternal/debugName.ts
var DebugNameData = class {
  constructor(owner, debugNameSource, referenceFn) {
    this.owner = owner;
    this.debugNameSource = debugNameSource;
    this.referenceFn = referenceFn;
  }
  getDebugName(target) {
    return getDebugName(target, this);
  }
};

var countPerName = /* @__PURE__ */ new Map();

var cachedDebugName = /* @__PURE__ */ new WeakMap();

function getDebugName(target, data) {
  const cached = cachedDebugName.get(target);
  if (cached) {
    return cached;
  }
  const dbgName = computeDebugName(target, data);
  if (dbgName) {
    let count = countPerName.get(dbgName) ?? 0;
    count++;
    countPerName.set(dbgName, count);
    const result = count === 1 ? dbgName : `${dbgName}#${count}`;
    cachedDebugName.set(target, result);
    return result;
  }
  return void 0;
}

function computeDebugName(self2, data) {
  const cached = cachedDebugName.get(self2);
  if (cached) {
    return cached;
  }
  const ownerStr = data.owner ? formatOwner(data.owner) + `.` : "";
  let result;
  const debugNameSource = data.debugNameSource;
  if (debugNameSource !== void 0) {
    if (typeof debugNameSource === "function") {
      result = debugNameSource();
      if (result !== void 0) {
        return ownerStr + result;
      }
    } else {
      return ownerStr + debugNameSource;
    }
  }
  const referenceFn = data.referenceFn;
  if (referenceFn !== void 0) {
    result = getFunctionName(referenceFn);
    if (result !== void 0) {
      return ownerStr + result;
    }
  }
  if (data.owner !== void 0) {
    const key = findKey(data.owner, self2);
    if (key !== void 0) {
      return ownerStr + key;
    }
  }
  return void 0;
}

function findKey(obj, value) {
  for (const key in obj) {
    if (obj[key] === value) {
      return key;
    }
  }
  return void 0;
}

var countPerClassName = /* @__PURE__ */ new Map();

var ownerId = /* @__PURE__ */ new WeakMap();

function formatOwner(owner) {
  const id2 = ownerId.get(owner);
  if (id2) {
    return id2;
  }
  const className = getClassName(owner) ?? "Object";
  let count = countPerClassName.get(className) ?? 0;
  count++;
  countPerClassName.set(className, count);
  const result = count === 1 ? className : `${className}#${count}`;
  ownerId.set(owner, result);
  return result;
}

function getClassName(obj) {
  const ctor = obj.constructor;
  if (ctor) {
    if (ctor.name === "Object") {
      return void 0;
    }
    return ctor.name;
  }
  return void 0;
}

function getFunctionName(fn) {
  const fnSrc = fn.toString();
  const regexp = /\/\*\*\s*@description\s*([^*]*)\*\//;
  const match = regexp.exec(fnSrc);
  const result = match ? match[1] : void 0;
  return result?.trim();
}
export { getDebugName, computeDebugName, findKey, formatOwner, getClassName, getFunctionName, DebugNameData, countPerName, cachedDebugName, countPerClassName, ownerId };
