// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testCoverage.ts
import { ResourceMap } from "./module-0008.mjs";
import { observableSignal } from "./module-0058.mjs";
import { WellDefinedPrefixTree } from "./module-1187.mjs";
import { deepClone } from "./module-0098.mjs";
import { URI } from "./module-0032.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/workbench/contrib/testing/common/testCoverage.ts
var incId = 0;

var TestCoverage2 = class {
  constructor(result, fromTaskId, uriIdentityService, accessor) {
    this.result = result;
    this.fromTaskId = fromTaskId;
    this.uriIdentityService = uriIdentityService;
    this.accessor = accessor;
    this.fileCoverage = new ResourceMap();
    this.didAddCoverage = observableSignal(this);
    this.tree = new WellDefinedPrefixTree();
    this.associatedData = /* @__PURE__ */ new Map();
  }
  /** Gets all test IDs that were included in this test run. */
  *allPerTestIDs() {
    const seen = /* @__PURE__ */ new Set();
    for (const root of this.tree.nodes) {
      if (root.value && root.value.perTestData) {
        for (const id2 of root.value.perTestData) {
          if (!seen.has(id2)) {
            seen.add(id2);
            yield id2;
          }
        }
      }
    }
  }
  append(coverage, tx) {
    const previous = this.getComputedForUri(coverage.uri);
    const result = this.result;
    const applyDelta = (kind, node) => {
      if (!node[kind]) {
        if (coverage[kind]) {
          node[kind] = { ...coverage[kind] };
        }
      } else {
        node[kind].covered += (coverage[kind]?.covered || 0) - (previous?.[kind]?.covered || 0);
        node[kind].total += (coverage[kind]?.total || 0) - (previous?.[kind]?.total || 0);
      }
    };
    const canonical = [...this.treePathForUri(
      coverage.uri,
      /* canonical = */
      true
    )];
    const chain = [];
    this.tree.mutatePath(this.treePathForUri(
      coverage.uri,
      /* canonical = */
      false
    ), (node) => {
      chain.push(node);
      if (chain.length === canonical.length) {
        if (node.value) {
          const v2 = node.value;
          v2.id = coverage.id;
          v2.statement = coverage.statement;
          v2.branch = coverage.branch;
          v2.declaration = coverage.declaration;
        } else {
          const v2 = node.value = new FileCoverage2(coverage, result, this.accessor);
          this.fileCoverage.set(coverage.uri, v2);
        }
      } else {
        if (!node.value) {
          const intermediate = deepClone(coverage);
          intermediate.id = String(incId++);
          intermediate.uri = this.treePathToUri(canonical.slice(0, chain.length));
          node.value = new ComputedFileCoverage(intermediate, result);
        } else {
          applyDelta("statement", node.value);
          applyDelta("branch", node.value);
          applyDelta("declaration", node.value);
          node.value.didChange.trigger(tx);
        }
      }
      if (coverage.testIds) {
        node.value.perTestData ??= /* @__PURE__ */ new Set();
        for (const id2 of coverage.testIds) {
          node.value.perTestData.add(id2);
        }
      }
    });
    if (chain) {
      this.didAddCoverage.trigger(tx, chain);
    }
  }
  /**
   * Builds a new tree filtered to per-test coverage data for the given ID.
   */
  filterTreeForTest(testId) {
    const tree = new WellDefinedPrefixTree();
    for (const node of this.tree.values()) {
      if (node instanceof FileCoverage2) {
        if (!node.perTestData?.has(testId.toString())) {
          continue;
        }
        const canonical = [...this.treePathForUri(
          node.uri,
          /* canonical = */
          true
        )];
        const chain = [];
        tree.mutatePath(this.treePathForUri(
          node.uri,
          /* canonical = */
          false
        ), (n2) => {
          chain.push(n2);
          n2.value ??= new BypassedFileCoverage(this.treePathToUri(canonical.slice(0, chain.length)), node.fromResult);
        });
      }
    }
    return tree;
  }
  /**
   * Gets coverage information for all files.
   */
  getAllFiles() {
    return this.fileCoverage;
  }
  /**
   * Gets coverage information for a specific file.
   */
  getUri(uri5) {
    return this.fileCoverage.get(uri5);
  }
  /**
   * Gets computed information for a file, including DFS-computed information
   * from child tests.
   */
  getComputedForUri(uri5) {
    return this.tree.find(this.treePathForUri(
      uri5,
      /* canonical = */
      false
    ));
  }
  *treePathForUri(uri5, canconicalPath) {
    yield uri5.scheme;
    yield uri5.authority;
    const path = !canconicalPath && this.uriIdentityService.extUri.ignorePathCasing(uri5) ? uri5.path.toLowerCase() : uri5.path;
    yield* path.split("/");
  }
  treePathToUri(path) {
    return URI.from({ scheme: path[0], authority: path[1], path: path.slice(2).join("/") });
  }
};

var getTotalCoveragePercent = (statement, branch, function_) => {
  let numerator = statement.covered;
  let denominator = statement.total;
  if (branch) {
    numerator += branch.covered;
    denominator += branch.total;
  }
  if (function_) {
    numerator += function_.covered;
    denominator += function_.total;
  }
  return denominator === 0 ? 1 : numerator / denominator;
};

var AbstractFileCoverage = class {
  constructor(coverage, fromResult) {
    this.fromResult = fromResult;
    this.didChange = observableSignal(this);
    this.id = coverage.id;
    this.uri = coverage.uri;
    this.statement = coverage.statement;
    this.branch = coverage.branch;
    this.declaration = coverage.declaration;
  }
  /**
   * Gets the total coverage percent based on information provided.
   * This is based on the Clover total coverage formula
   */
  get tpc() {
    return getTotalCoveragePercent(this.statement, this.branch, this.declaration);
  }
};

var ComputedFileCoverage = class extends AbstractFileCoverage {
};

var BypassedFileCoverage = class extends ComputedFileCoverage {
  constructor(uri5, result) {
    super({ id: String(incId++), uri: uri5, statement: { covered: 0, total: 0 } }, result);
  }
};

var FileCoverage2 = class extends AbstractFileCoverage {
  constructor(coverage, fromResult, accessor) {
    super(coverage, fromResult);
    this.accessor = accessor;
  }
  /** Gets whether details are synchronously available */
  get hasSynchronousDetails() {
    return this._details instanceof Array || this.resolved;
  }
  /**
   * Gets per-line coverage details.
   */
  async detailsForTest(_testId, token = CancellationToken.None) {
    this._detailsForTest ??= /* @__PURE__ */ new Map();
    const testId = _testId.toString();
    const prev = this._detailsForTest.get(testId);
    if (prev) {
      return prev;
    }
    const promise = (async () => {
      try {
        return await this.accessor.getCoverageDetails(this.id, testId, token);
      } catch (e) {
        this._detailsForTest?.delete(testId);
        throw e;
      }
    })();
    this._detailsForTest.set(testId, promise);
    return promise;
  }
  /**
   * Gets per-line coverage details.
   */
  async details(token = CancellationToken.None) {
    this._details ??= this.accessor.getCoverageDetails(this.id, void 0, token);
    try {
      const d = await this._details;
      this.resolved = true;
      return d;
    } catch (e) {
      this._details = void 0;
      throw e;
    }
  }
};
export { incId, TestCoverage2, getTotalCoveragePercent, AbstractFileCoverage, ComputedFileCoverage, BypassedFileCoverage, FileCoverage2 };
