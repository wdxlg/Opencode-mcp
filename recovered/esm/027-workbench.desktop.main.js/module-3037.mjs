// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/codeCoverageDisplayUtils.ts
import { clamp } from "./module-0040.mjs";
import { asCssVariableName } from "./module-0226.mjs";
import { chartsGreen, chartsRed, chartsYellow } from "./module-0231.mjs";
import { getTotalCoveragePercent } from "./module-1425.mjs";
import { assertNever } from "./module-0009.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/testing/browser/codeCoverageDisplayUtils.ts
var percent = (cc) => clamp(cc.total === 0 ? 1 : cc.covered / cc.total, 0, 1);

var colorThresholds = [
  { color: `var(${asCssVariableName(chartsRed)})`, key: "red" },
  { color: `var(${asCssVariableName(chartsYellow)})`, key: "yellow" },
  { color: `var(${asCssVariableName(chartsGreen)})`, key: "green" }
];

var getCoverageColor = (pct2, thresholds) => {
  let best = colorThresholds[0].color;
  let distance = pct2;
  for (const { key: key3, color: color2 } of colorThresholds) {
    const t2 = thresholds[key3] / 100;
    if (t2 && pct2 >= t2 && pct2 - t2 < distance) {
      best = color2;
      distance = pct2 - t2;
    }
  }
  return best;
};

var epsilon = 1e-7;

var displayPercent = (value2, precision = 2) => {
  const display = (value2 * 100).toFixed(precision);
  if (value2 < 1 - epsilon && display === "100") {
    return `${100 - 10 ** -precision}%`;
  }
  return `${display}%`;
};

var calculateDisplayedStat = (coverage, method) => {
  switch (method) {
    case "statement" /* Statement */:
      return percent(coverage.statement);
    case "minimum" /* Minimum */: {
      let value2 = percent(coverage.statement);
      if (coverage.branch) {
        value2 = Math.min(value2, percent(coverage.branch));
      }
      if (coverage.declaration) {
        value2 = Math.min(value2, percent(coverage.declaration));
      }
      return value2;
    }
    case "totalCoverage" /* TotalCoverage */:
      return getTotalCoveragePercent(coverage.statement, coverage.branch, coverage.declaration);
    default:
      assertNever(method);
  }
};

function getLabelForItem(result, testId, commonPrefixLen) {
  const parts = [];
  for (const id2 of testId.idsFromRoot()) {
    const item = result.getTestById(id2.toString());
    if (!item) {
      break;
    }
    parts.push(item.label);
  }
  const relevant = parts.slice(commonPrefixLen);
  if (relevant.length <= 1) {
    return { label: relevant[0] ?? "" };
  }
  return {
    label: relevant[relevant.length - 1],
    description: relevant.slice(0, -1).join(" \u203A ")
  };
}

var labels;

((labels2) => {
  labels2.showingFilterFor = (label3) => localize(21016, null, label3);
  labels2.clickToChangeFiltering = localize(21014, null);
  labels2.percentCoverage = (percent2, precision) => localize(21017, null, displayPercent(percent2, precision));
  labels2.allTests = localize(21015, null);
  labels2.pickShowCoverage = localize(21018, null);
})(labels || (labels = {}));
export { getLabelForItem, percent, colorThresholds, getCoverageColor, epsilon, displayPercent, calculateDisplayedStat, labels };
