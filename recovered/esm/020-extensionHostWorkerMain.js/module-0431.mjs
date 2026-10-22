// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/comparers.ts
import { Lazy } from "./module-0001.mjs";
import { safeIntl } from "./module-0271.mjs";
import { sep } from "./module-0022.mjs";


// src/vs/base/common/comparers.ts
var intlFileNameCollatorBaseNumeric = new Lazy(() => {
  const collator = safeIntl.Collator(void 0, { numeric: true, sensitivity: "base" }).value;
  return {
    collator,
    collatorIsNumeric: collator.resolvedOptions().numeric
  };
});

var intlFileNameCollatorNumeric = new Lazy(() => {
  const collator = safeIntl.Collator(void 0, { numeric: true }).value;
  return {
    collator
  };
});

var intlFileNameCollatorNumericCaseInsensitive = new Lazy(() => {
  const collator = safeIntl.Collator(void 0, { numeric: true, sensitivity: "accent" }).value;
  return {
    collator
  };
});

function compareFileNames(one, other, caseSensitive = false) {
  const a = one || "";
  const b = other || "";
  const result = intlFileNameCollatorBaseNumeric.value.collator.compare(a, b);
  if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && a !== b) {
    return a < b ? -1 : 1;
  }
  return result;
}

function comparePathComponents(one, other, caseSensitive = false) {
  if (!caseSensitive) {
    one = one && one.toLowerCase();
    other = other && other.toLowerCase();
  }
  if (one === other) {
    return 0;
  }
  return one < other ? -1 : 1;
}

function comparePaths(one, other, caseSensitive = false) {
  const oneParts = one.split(sep);
  const otherParts = other.split(sep);
  const lastOne = oneParts.length - 1;
  const lastOther = otherParts.length - 1;
  let endOne, endOther;
  for (let i = 0; ; i++) {
    endOne = lastOne === i;
    endOther = lastOther === i;
    if (endOne && endOther) {
      return compareFileNames(oneParts[i], otherParts[i], caseSensitive);
    } else if (endOne) {
      return -1;
    } else if (endOther) {
      return 1;
    }
    const result = comparePathComponents(oneParts[i], otherParts[i], caseSensitive);
    if (result !== 0) {
      return result;
    }
  }
}
export { compareFileNames, comparePathComponents, comparePaths, intlFileNameCollatorBaseNumeric, intlFileNameCollatorNumeric, intlFileNameCollatorNumericCaseInsensitive };
