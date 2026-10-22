// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/codelens/browser/codelens.ts
import { DisposableStore, isDisposable } from "./module-0012.mjs";
import { illegalArgument, onUnexpectedExternalError } from "./module-0004.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IModelService } from "./module-0080.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/editor/contrib/codelens/browser/codelens.ts
var CodeLensModel = class _CodeLensModel {
  constructor() {
    this.lenses = [];
  }
  static {
    this.Empty = new _CodeLensModel();
  }
  dispose() {
    this._store?.dispose();
  }
  get isDisposed() {
    return this._store?.isDisposed ?? false;
  }
  add(list2, provider) {
    if (isDisposable(list2)) {
      this._store ??= new DisposableStore();
      this._store.add(list2);
    }
    for (const symbol of list2.lenses) {
      this.lenses.push({ symbol, provider });
    }
  }
};

async function getCodeLensModel(registry4, model, token) {
  const provider = registry4.ordered(model);
  const providerRanks = /* @__PURE__ */ new Map();
  const result = new CodeLensModel();
  const promises = provider.map(async (provider2, i2) => {
    providerRanks.set(provider2, i2);
    try {
      const list2 = await Promise.resolve(provider2.provideCodeLenses(model, token));
      if (list2) {
        result.add(list2, provider2);
      }
    } catch (err) {
      onUnexpectedExternalError(err);
    }
  });
  await Promise.all(promises);
  if (token.isCancellationRequested) {
    result.dispose();
    return CodeLensModel.Empty;
  }
  result.lenses = result.lenses.sort((a, b) => {
    if (a.symbol.range.startLineNumber < b.symbol.range.startLineNumber) {
      return -1;
    } else if (a.symbol.range.startLineNumber > b.symbol.range.startLineNumber) {
      return 1;
    } else if (providerRanks.get(a.provider) < providerRanks.get(b.provider)) {
      return -1;
    } else if (providerRanks.get(a.provider) > providerRanks.get(b.provider)) {
      return 1;
    } else if (a.symbol.range.startColumn < b.symbol.range.startColumn) {
      return -1;
    } else if (a.symbol.range.startColumn > b.symbol.range.startColumn) {
      return 1;
    } else {
      return 0;
    }
  });
  return result;
}

CommandsRegistry.registerCommand("_executeCodeLensProvider", function(accessor, ...args2) {
  let [uri5, itemResolveCount] = args2;
  assertType(URI.isUri(uri5));
  assertType(typeof itemResolveCount === "number" || !itemResolveCount);
  const { codeLensProvider } = accessor.get(ILanguageFeaturesService);
  const model = accessor.get(IModelService).getModel(uri5);
  if (!model) {
    throw illegalArgument();
  }
  const result = [];
  const disposables = new DisposableStore();
  return getCodeLensModel(codeLensProvider, model, CancellationToken.None).then((value2) => {
    disposables.add(value2);
    const resolve3 = [];
    for (const item of value2.lenses) {
      if (itemResolveCount === void 0 || itemResolveCount === null || Boolean(item.symbol.command)) {
        result.push(item.symbol);
      } else if (itemResolveCount-- > 0 && item.provider.resolveCodeLens) {
        resolve3.push(Promise.resolve(item.provider.resolveCodeLens(model, item.symbol, CancellationToken.None)).then((symbol) => result.push(symbol || item.symbol)));
      }
    }
    return Promise.all(resolve3);
  }).then(() => {
    return result;
  }).finally(() => {
    setTimeout(() => disposables.dispose(), 100);
  });
});
export { getCodeLensModel, CodeLensModel };
