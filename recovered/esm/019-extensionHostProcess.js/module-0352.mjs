// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/node/textSearchAdapter.ts
import { NativeTextSearchManager } from "./module-0351.mjs";
import { RipgrepTextSearchEngine } from "./module-0350.mjs";
import { pfs_exports } from "./module-0033.mjs";
import { resultIsMatch } from "./module-0247.mjs";


// src/vs/workbench/services/search/node/textSearchAdapter.ts
var TextSearchEngineAdapter = class {
  constructor(query, numThreads) {
    this.query = query;
    this.numThreads = numThreads;
  }
  search(token, onResult, onMessage) {
    if ((!this.query.folderQueries || !this.query.folderQueries.length) && (!this.query.extraFileResources || !this.query.extraFileResources.length)) {
      return Promise.resolve({
        type: "success",
        limitHit: false,
        stats: {
          type: "searchProcess"
        },
        messages: []
      });
    }
    const pretendOutputChannel = {
      appendLine(msg) {
        onMessage({ message: msg });
      }
    };
    const textSearchManager = new NativeTextSearchManager(this.query, new RipgrepTextSearchEngine(pretendOutputChannel, this.numThreads), pfs_exports);
    return new Promise((resolve2, reject) => {
      return textSearchManager.search(
        (matches) => {
          onResult(matches.map(fileMatchToSerialized));
        },
        token
      ).then(
        (c) => resolve2({ limitHit: c.limitHit ?? false, type: "success", stats: c.stats, messages: [] }),
        reject
      );
    });
  }
};

function fileMatchToSerialized(match2) {
  return {
    path: match2.resource && match2.resource.fsPath,
    results: match2.results,
    numMatches: (match2.results || []).reduce((sum, r2) => {
      if (resultIsMatch(r2)) {
        const m = r2;
        return sum + m.rangeLocations.length;
      } else {
        return sum + 1;
      }
    }, 0)
  };
}
export { fileMatchToSerialized, TextSearchEngineAdapter };
