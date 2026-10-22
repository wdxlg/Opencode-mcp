// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/comparers.ts
import { Lazy } from "./module-0028.mjs";
import { safeIntl } from "./module-0120.mjs";
import { sep } from "./module-0026.mjs";


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

function compareFileNamesDefault(one, other) {
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  one = one || "";
  other = other || "";
  return compareAndDisambiguateByLength(collatorNumeric, one, other);
}

function compareFileNamesUpper(one, other) {
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  one = one || "";
  other = other || "";
  return compareCaseUpperFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}

function compareFileNamesLower(one, other) {
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  one = one || "";
  other = other || "";
  return compareCaseLowerFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}

function compareFileNamesUnicode(one, other) {
  one = one || "";
  other = other || "";
  if (one === other) {
    return 0;
  }
  return one < other ? -1 : 1;
}

function compareFileExtensions(one, other) {
  const [oneName, oneExtension] = extractNameAndExtension(one);
  const [otherName, otherExtension] = extractNameAndExtension(other);
  let result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneExtension, otherExtension);
  if (result === 0) {
    if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && oneExtension !== otherExtension) {
      return oneExtension < otherExtension ? -1 : 1;
    }
    result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneName, otherName);
    if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && oneName !== otherName) {
      return oneName < otherName ? -1 : 1;
    }
  }
  return result;
}

function compareFileExtensionsDefault(one, other) {
  one = one || "";
  other = other || "";
  const oneExtension = extractExtension(one);
  const otherExtension = extractExtension(other);
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
  return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}

function compareFileExtensionsUpper(one, other) {
  one = one || "";
  other = other || "";
  const oneExtension = extractExtension(one);
  const otherExtension = extractExtension(other);
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
  return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) || compareCaseUpperFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}

function compareFileExtensionsLower(one, other) {
  one = one || "";
  other = other || "";
  const oneExtension = extractExtension(one);
  const otherExtension = extractExtension(other);
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
  return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) || compareCaseLowerFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}

function compareFileExtensionsUnicode(one, other) {
  one = one || "";
  other = other || "";
  const oneExtension = extractExtension(one).toLowerCase();
  const otherExtension = extractExtension(other).toLowerCase();
  if (oneExtension !== otherExtension) {
    return oneExtension < otherExtension ? -1 : 1;
  }
  if (one !== other) {
    return one < other ? -1 : 1;
  }
  return 0;
}

var FileNameMatch = /^(.*?)(\.([^.]*))?$/;

function extractNameAndExtension(str, dotfilesAsNames = false) {
  const match2 = str ? FileNameMatch.exec(str) : [];
  let result = [match2 && match2[1] || "", match2 && match2[3] || ""];
  if (dotfilesAsNames && (!result[0] && result[1] || result[0] && result[0].charAt(0) === ".")) {
    result = [result[0] + "." + result[1], ""];
  }
  return result;
}

function extractExtension(str) {
  const match2 = str ? FileNameMatch.exec(str) : [];
  return match2 && match2[1] && match2[1].charAt(0) !== "." && match2[3] || "";
}

function compareAndDisambiguateByLength(collator, one, other) {
  const result = collator.compare(one, other);
  if (result !== 0) {
    return result;
  }
  if (one.length !== other.length) {
    return one.length < other.length ? -1 : 1;
  }
  return 0;
}

function startsWithLower(string) {
  const character = string.charAt(0);
  return character.toLocaleUpperCase() !== character ? true : false;
}

function startsWithUpper(string) {
  const character = string.charAt(0);
  return character.toLocaleLowerCase() !== character ? true : false;
}

function compareCaseLowerFirst(one, other) {
  if (startsWithLower(one) && startsWithUpper(other)) {
    return -1;
  }
  return startsWithUpper(one) && startsWithLower(other) ? 1 : 0;
}

function compareCaseUpperFirst(one, other) {
  if (startsWithUpper(one) && startsWithLower(other)) {
    return -1;
  }
  return startsWithLower(one) && startsWithUpper(other) ? 1 : 0;
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
  for (let i2 = 0; ; i2++) {
    endOne = lastOne === i2;
    endOther = lastOther === i2;
    if (endOne && endOther) {
      return compareFileNames(oneParts[i2], otherParts[i2], caseSensitive);
    } else if (endOne) {
      return -1;
    } else if (endOther) {
      return 1;
    }
    const result = comparePathComponents(oneParts[i2], otherParts[i2], caseSensitive);
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
export { compareFileNames, compareFileNamesDefault, compareFileNamesUpper, compareFileNamesLower, compareFileNamesUnicode, compareFileExtensions, compareFileExtensionsDefault, compareFileExtensionsUpper, compareFileExtensionsLower, compareFileExtensionsUnicode, extractNameAndExtension, extractExtension, compareAndDisambiguateByLength, startsWithLower, startsWithUpper, compareCaseLowerFirst, compareCaseUpperFirst, comparePathComponents, comparePaths, compareAnything, compareByPrefix, intlFileNameCollatorBaseNumeric, intlFileNameCollatorNumeric, intlFileNameCollatorNumericCaseInsensitive, FileNameMatch };
