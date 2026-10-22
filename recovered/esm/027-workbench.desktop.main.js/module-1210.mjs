// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testItemCollection.ts



// src/vs/workbench/contrib/testing/common/testItemCollection.ts
var strictEqualComparator = (a, b) => a === b;

var diffableProps = {
  range: (a, b) => {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.equalsRange(b);
  },
  busy: strictEqualComparator,
  label: strictEqualComparator,
  description: strictEqualComparator,
  error: strictEqualComparator,
  sortText: strictEqualComparator,
  tags: (a, b) => {
    if (a.length !== b.length) {
      return false;
    }
    if (a.some((t1) => !b.includes(t1))) {
      return false;
    }
    return true;
  }
};

var diffableEntries = Object.entries(diffableProps);

var InvalidTestItemError = class extends Error {
  constructor(id2) {
    super(`TestItem with ID "${id2}" is invalid. Make sure to create it from the createTestItem method.`);
  }
};
export { strictEqualComparator, diffableProps, diffableEntries, InvalidTestItemError };
