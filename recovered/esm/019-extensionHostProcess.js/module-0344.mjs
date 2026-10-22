// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/comparers.ts
import { Lazy } from "./module-0021.mjs";
import { safeIntl } from "./module-0277.mjs";
import { sep } from "./module-0019.mjs";


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

function compareAnything(one, other, lookFor) {
  const elementAName = one.toLowerCase();
  const elementBName = other.toLowerCase();
  const prefixCompare = compareByPrefix(one, other, lookFor);
  if (prefixCompare) {
    return prefixCompare;
  }
  const elementASuffixMatch = elementAName.endsWith(lookFor);
  const elementBSuffixMatch = elementBName.endsWith(lookFor);
  if (elementASuffixMatch !== elementBSuffixMatch) {
    return elementASuffixMatch ? -1 : 1;
  }
  const r2 = compareFileNames(elementAName, elementBName);
  if (r2 !== 0) {
    return r2;
  }
  return elementAName.localeCompare(elementBName);
}

function compareByPrefix(one, other, lookFor) {
  const elementAName = one.toLowerCase();
  const elementBName = other.toLowerCase();
  const elementAPrefixMatch = elementAName.startsWith(lookFor);
  const elementBPrefixMatch = elementBName.startsWith(lookFor);
  if (elementAPrefixMatch !== elementBPrefixMatch) {
    return elementAPrefixMatch ? -1 : 1;
  } else if (elementAPrefixMatch && elementBPrefixMatch) {
    if (elementAName.length < elementBName.length) {
      return -1;
    }
    if (elementAName.length > elementBName.length) {
      return 1;
    }
  }
  return 0;
}
export { compareFileNames, comparePathComponents, comparePaths, compareAnything, compareByPrefix, intlFileNameCollatorBaseNumeric, intlFileNameCollatorNumeric, intlFileNameCollatorNumericCaseInsensitive };
