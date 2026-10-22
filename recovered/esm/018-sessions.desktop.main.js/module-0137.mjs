// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/jsonSchema.ts



// src/vs/base/common/jsonSchema.ts
function getCompressedContent(schema10) {
  let hasDups = false;
  const equalsByString = /* @__PURE__ */ new Map();
  const nodeToEquals = /* @__PURE__ */ new Map();
  const visitSchemas = (next) => {
    if (schema10 === next) {
      return true;
    }
    const val = JSON.stringify(next);
    if (val.length < 30) {
      return true;
    }
    const eq2 = equalsByString.get(val);
    if (!eq2) {
      const newEq = { schemas: [next] };
      equalsByString.set(val, newEq);
      nodeToEquals.set(next, newEq);
      return true;
    }
    eq2.schemas.push(next);
    nodeToEquals.set(next, eq2);
    hasDups = true;
    return false;
  };
  traverseNodes(schema10, visitSchemas);
  equalsByString.clear();
  if (!hasDups) {
    return JSON.stringify(schema10);
  }
  let defNodeName = "$defs";
  while (schema10.hasOwnProperty(defNodeName)) {
    defNodeName += "_";
  }
  const definitions3 = [];
  function stringify5(root) {
    return JSON.stringify(root, (_key, value2) => {
      if (value2 !== root) {
        const eq2 = nodeToEquals.get(value2);
        if (eq2 && eq2.schemas.length > 1) {
          if (!eq2.id) {
            eq2.id = `_${definitions3.length}`;
            definitions3.push(eq2.schemas[0]);
          }
          return { $ref: `#/${defNodeName}/${eq2.id}` };
        }
      }
      return value2;
    });
  }
  const str = stringify5(schema10);
  const defStrings = [];
  for (let i2 = 0; i2 < definitions3.length; i2++) {
    defStrings.push(`"_${i2}":${stringify5(definitions3[i2])}`);
  }
  if (defStrings.length) {
    return `${str.substring(0, str.length - 1)},"${defNodeName}":{${defStrings.join(",")}}}`;
  }
  return str;
}

function isObject2(thing) {
  return typeof thing === "object" && thing !== null;
}

function traverseNodes(root, visit2) {
  if (!root || typeof root !== "object") {
    return;
  }
  const collectEntries = (...entries2) => {
    for (const entry of entries2) {
      if (isObject2(entry)) {
        toWalk.push(entry);
      }
    }
  };
  const collectMapEntries = (...maps) => {
    for (const map of maps) {
      if (isObject2(map)) {
        for (const key3 in map) {
          const entry = map[key3];
          if (isObject2(entry)) {
            toWalk.push(entry);
          }
        }
      }
    }
  };
  const collectArrayEntries = (...arrays3) => {
    for (const array3 of arrays3) {
      if (Array.isArray(array3)) {
        for (const entry of array3) {
          if (isObject2(entry)) {
            toWalk.push(entry);
          }
        }
      }
    }
  };
  const collectEntryOrArrayEntries = (items) => {
    if (Array.isArray(items)) {
      for (const entry of items) {
        if (isObject2(entry)) {
          toWalk.push(entry);
        }
      }
    } else if (isObject2(items)) {
      toWalk.push(items);
    }
  };
  const toWalk = [root];
  let next = toWalk.pop();
  while (next) {
    const visitChildern = visit2(next);
    if (visitChildern) {
      collectEntries(next.additionalItems, next.additionalProperties, next.not, next.contains, next.propertyNames, next.if, next.then, next.else, next.unevaluatedItems, next.unevaluatedProperties);
      collectMapEntries(next.definitions, next.$defs, next.properties, next.patternProperties, next.dependencies, next.dependentSchemas);
      collectArrayEntries(next.anyOf, next.allOf, next.oneOf, next.prefixItems);
      collectEntryOrArrayEntries(next.items);
    }
    next = toWalk.pop();
  }
}
export { getCompressedContent, isObject2, traverseNodes };
