// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/semanticTokens/common/getSemanticTokens.ts
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { encodeSemanticTokensDto } from "./module-0840.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/semanticTokens/common/getSemanticTokens.ts
function isSemanticTokens(v2) {
  return v2 && !!v2.data;
}

function isSemanticTokensEdits(v2) {
  return v2 && Array.isArray(v2.edits);
}

var DocumentSemanticTokensResult = class {
  constructor(provider, tokens, error) {
    this.provider = provider;
    this.tokens = tokens;
    this.error = error;
  }
};

function hasDocumentSemanticTokensProvider(registry4, model) {
  return registry4.has(model);
}

function getDocumentSemanticTokensProviders(registry4, model) {
  const groups = registry4.orderedGroups(model);
  return groups.length > 0 ? groups[0] : [];
}

async function getDocumentSemanticTokens(registry4, model, lastProvider, lastResultId, token) {
  const providers2 = getDocumentSemanticTokensProviders(registry4, model);
  const results = await Promise.all(providers2.map(async (provider) => {
    let result;
    let error = null;
    try {
      result = await provider.provideDocumentSemanticTokens(model, provider === lastProvider ? lastResultId : null, token);
    } catch (err) {
      error = err;
      result = null;
    }
    if (!result || !isSemanticTokens(result) && !isSemanticTokensEdits(result)) {
      result = null;
    }
    return new DocumentSemanticTokensResult(provider, result, error);
  }));
  for (const result of results) {
    if (result.error) {
      throw result.error;
    }
    if (result.tokens) {
      return result;
    }
  }
  if (results.length > 0) {
    return results[0];
  }
  return null;
}

function _getDocumentSemanticTokensProviderHighestGroup(registry4, model) {
  const result = registry4.orderedGroups(model);
  return result.length > 0 ? result[0] : null;
}

var DocumentRangeSemanticTokensResult = class {
  constructor(provider, tokens) {
    this.provider = provider;
    this.tokens = tokens;
  }
};

function hasDocumentRangeSemanticTokensProvider(providers2, model) {
  return providers2.has(model);
}

function getDocumentRangeSemanticTokensProviders(providers2, model) {
  const groups = providers2.orderedGroups(model);
  return groups.length > 0 ? groups[0] : [];
}

async function getDocumentRangeSemanticTokens(registry4, model, range2, token) {
  const providers2 = getDocumentRangeSemanticTokensProviders(registry4, model);
  const results = await Promise.all(providers2.map(async (provider) => {
    let result;
    try {
      result = await provider.provideDocumentRangeSemanticTokens(model, range2, token);
    } catch (err) {
      onUnexpectedExternalError(err);
      result = null;
    }
    if (!result || !isSemanticTokens(result)) {
      result = null;
    }
    return new DocumentRangeSemanticTokensResult(provider, result);
  }));
  for (const result of results) {
    if (result.tokens) {
      return result;
    }
  }
  if (results.length > 0) {
    return results[0];
  }
  return null;
}

CommandsRegistry.registerCommand("_provideDocumentSemanticTokensLegend", async (accessor, ...args2) => {
  const [uri5] = args2;
  assertType(uri5 instanceof URI);
  const model = accessor.get(IModelService).getModel(uri5);
  if (!model) {
    return void 0;
  }
  const { documentSemanticTokensProvider } = accessor.get(ILanguageFeaturesService);
  const providers2 = _getDocumentSemanticTokensProviderHighestGroup(documentSemanticTokensProvider, model);
  if (!providers2) {
    return accessor.get(ICommandService).executeCommand("_provideDocumentRangeSemanticTokensLegend", uri5);
  }
  return providers2[0].getLegend();
});

CommandsRegistry.registerCommand("_provideDocumentSemanticTokens", async (accessor, ...args2) => {
  const [uri5] = args2;
  assertType(uri5 instanceof URI);
  const model = accessor.get(IModelService).getModel(uri5);
  if (!model) {
    return void 0;
  }
  const { documentSemanticTokensProvider } = accessor.get(ILanguageFeaturesService);
  if (!hasDocumentSemanticTokensProvider(documentSemanticTokensProvider, model)) {
    return accessor.get(ICommandService).executeCommand("_provideDocumentRangeSemanticTokens", uri5, model.getFullModelRange());
  }
  const r2 = await getDocumentSemanticTokens(documentSemanticTokensProvider, model, null, null, CancellationToken.None);
  if (!r2) {
    return void 0;
  }
  const { provider, tokens } = r2;
  if (!tokens || !isSemanticTokens(tokens)) {
    return void 0;
  }
  const buff = encodeSemanticTokensDto({
    id: 0,
    type: "full",
    data: tokens.data
  });
  if (tokens.resultId) {
    provider.releaseDocumentSemanticTokens(tokens.resultId);
  }
  return buff;
});

CommandsRegistry.registerCommand("_provideDocumentRangeSemanticTokensLegend", async (accessor, ...args2) => {
  const [uri5, range2] = args2;
  assertType(uri5 instanceof URI);
  const model = accessor.get(IModelService).getModel(uri5);
  if (!model) {
    return void 0;
  }
  const { documentRangeSemanticTokensProvider } = accessor.get(ILanguageFeaturesService);
  const providers2 = getDocumentRangeSemanticTokensProviders(documentRangeSemanticTokensProvider, model);
  if (providers2.length === 0) {
    return void 0;
  }
  if (providers2.length === 1) {
    return providers2[0].getLegend();
  }
  if (!range2 || !Range2.isIRange(range2)) {
    console.warn(`provideDocumentRangeSemanticTokensLegend might be out-of-sync with provideDocumentRangeSemanticTokens unless a range argument is passed in`);
    return providers2[0].getLegend();
  }
  const result = await getDocumentRangeSemanticTokens(documentRangeSemanticTokensProvider, model, Range2.lift(range2), CancellationToken.None);
  if (!result) {
    return void 0;
  }
  return result.provider.getLegend();
});

CommandsRegistry.registerCommand("_provideDocumentRangeSemanticTokens", async (accessor, ...args2) => {
  const [uri5, range2] = args2;
  assertType(uri5 instanceof URI);
  assertType(Range2.isIRange(range2));
  const model = accessor.get(IModelService).getModel(uri5);
  if (!model) {
    return void 0;
  }
  const { documentRangeSemanticTokensProvider } = accessor.get(ILanguageFeaturesService);
  const result = await getDocumentRangeSemanticTokens(documentRangeSemanticTokensProvider, model, Range2.lift(range2), CancellationToken.None);
  if (!result || !result.tokens) {
    return void 0;
  }
  return encodeSemanticTokensDto({
    id: 0,
    type: "full",
    data: result.tokens.data
  });
});
export { isSemanticTokens, isSemanticTokensEdits, hasDocumentSemanticTokensProvider, getDocumentSemanticTokensProviders, getDocumentSemanticTokens, _getDocumentSemanticTokensProviderHighestGroup, hasDocumentRangeSemanticTokensProvider, getDocumentRangeSemanticTokensProviders, getDocumentRangeSemanticTokens, DocumentSemanticTokensResult, DocumentRangeSemanticTokensResult };
