// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testingProgressMessages.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/testing/common/testingProgressMessages.ts
var collectTestStateCounts = (isRunning, results) => {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let running = 0;
  let queued = 0;
  for (const result of results) {
    const count2 = result.counts;
    failed += count2[6 /* Errored */] + count2[4 /* Failed */];
    passed += count2[3 /* Passed */];
    skipped += count2[5 /* Skipped */];
    running += count2[2 /* Running */];
    queued += count2[1 /* Queued */];
  }
  return {
    isRunning,
    passed,
    failed,
    runSoFar: passed + failed,
    totalWillBeRun: passed + failed + queued + running,
    skipped
  };
};

var getTestProgressText = ({ isRunning, passed, runSoFar, totalWillBeRun, skipped, failed }) => {
  let percent2 = passed / runSoFar * 100;
  if (failed > 0) {
    percent2 = Math.min(percent2, 99.9);
  } else if (runSoFar === 0) {
    percent2 = 0;
  }
  if (isRunning) {
    if (runSoFar === 0) {
      return localize(21361, null);
    } else if (skipped === 0) {
      return localize(21360, null, passed, totalWillBeRun, percent2.toPrecision(3));
    } else {
      return localize(21363, null, passed, totalWillBeRun, percent2.toPrecision(3), skipped);
    }
  } else {
    if (skipped === 0) {
      return localize(21359, null, passed, runSoFar, percent2.toPrecision(3));
    } else {
      return localize(21362, null, passed, runSoFar, percent2.toPrecision(3), skipped);
    }
  }
};
export { collectTestStateCounts, getTestProgressText };
