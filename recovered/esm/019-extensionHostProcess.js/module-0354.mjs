// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/node/ripgrepSearchProvider.ts
import { RipgrepTextSearchEngine } from "./module-0350.mjs";
import { Schemas } from "./module-0026.mjs";
import { Progress } from "./module-0096.mjs";
import { CancellationTokenSource } from "./module-0018.mjs";


// src/vs/workbench/services/search/node/ripgrepSearchProvider.ts
var RipgrepSearchProvider = class {
  constructor(outputChannel, getNumThreads) {
    this.outputChannel = outputChannel;
    this.getNumThreads = getNumThreads;
    this.inProgress = /* @__PURE__ */ new Set();
    process.once("exit", () => this.dispose());
  }
  async provideTextSearchResults(query, options2, progress, token) {
    const numThreads = await this.getNumThreads();
    const engine = new RipgrepTextSearchEngine(this.outputChannel, numThreads);
    return Promise.all(options2.folderOptions.map((folderOption) => {
      const extendedOptions = {
        folderOptions: folderOption,
        numThreads,
        maxResults: options2.maxResults,
        previewOptions: options2.previewOptions,
        maxFileSize: options2.maxFileSize,
        surroundingContext: options2.surroundingContext
      };
      if (folderOption.folder.scheme === Schemas.vscodeUserData) {
        const translatedOptions = { ...extendedOptions, folder: folderOption.folder.with({ scheme: Schemas.file }) };
        const progressTranslator = new Progress((data) => progress.report({ ...data, uri: data.uri.with({ scheme: folderOption.folder.scheme }) }));
        return this.withToken(token, (token2) => engine.provideTextSearchResultsWithRgOptions(query, translatedOptions, progressTranslator, token2));
      } else {
        return this.withToken(token, (token2) => engine.provideTextSearchResultsWithRgOptions(query, extendedOptions, progress, token2));
      }
    })).then(((e) => {
      const complete = {
        // todo: get this to actually check
        limitHit: e.some((complete2) => !!complete2 && complete2.limitHit)
      };
      return complete;
    }));
  }
  async withToken(token, fn) {
    const merged = mergedTokenSource(token);
    this.inProgress.add(merged);
    const result = await fn(merged.token);
    this.inProgress.delete(merged);
    return result;
  }
  dispose() {
    this.inProgress.forEach((engine) => engine.cancel());
  }
};

function mergedTokenSource(token) {
  const tokenSource = new CancellationTokenSource();
  token.onCancellationRequested(() => tokenSource.cancel());
  return tokenSource;
}
export { mergedTokenSource, RipgrepSearchProvider };
