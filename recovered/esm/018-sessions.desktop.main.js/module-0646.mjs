// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoSymbol/browser/goToSymbol.ts
import { Schemas, matchesSomeScheme } from "./module-0033.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { coalesce } from "./module-0007.mjs";
import { ReferencesModel } from "./module-0637.mjs";
import { registerModelAndPositionCommand } from "./module-0097.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/editor/contrib/gotoSymbol/browser/goToSymbol.ts
function shouldIncludeLocationLink(sourceModel, loc) {
  if (loc.uri.scheme === sourceModel.uri.scheme) {
    return true;
  }
  if (matchesSomeScheme(loc.uri, Schemas.walkThroughSnippet, Schemas.vscodeChatCodeBlock, Schemas.vscodeChatCodeCompareBlock)) {
    return false;
  }
  return true;
}

async function getLocationLinks(model, position2, registry4, recursive, provide) {
  const provider = registry4.ordered(model, recursive);
  const promises = provider.map((provider2) => {
    return Promise.resolve(provide(provider2, model, position2)).then(void 0, (err) => {
      onUnexpectedExternalError(err);
      return void 0;
    });
  });
  const values = await Promise.all(promises);
  return coalesce(values.flat()).filter((loc) => shouldIncludeLocationLink(model, loc));
}

function getDefinitionsAtPosition(registry4, model, position2, recursive, token) {
  return getLocationLinks(model, position2, registry4, recursive, (provider, model2, position3) => {
    return provider.provideDefinition(model2, position3, token);
  });
}

function getDeclarationsAtPosition(registry4, model, position2, recursive, token) {
  return getLocationLinks(model, position2, registry4, recursive, (provider, model2, position3) => {
    return provider.provideDeclaration(model2, position3, token);
  });
}

function getImplementationsAtPosition(registry4, model, position2, recursive, token) {
  return getLocationLinks(model, position2, registry4, recursive, (provider, model2, position3) => {
    return provider.provideImplementation(model2, position3, token);
  });
}

function getTypeDefinitionsAtPosition(registry4, model, position2, recursive, token) {
  return getLocationLinks(model, position2, registry4, recursive, (provider, model2, position3) => {
    return provider.provideTypeDefinition(model2, position3, token);
  });
}

function getReferencesAtPosition(registry4, model, position2, compact2, recursive, token) {
  return getLocationLinks(model, position2, registry4, recursive, async (provider, model2, position3) => {
    const result = (await provider.provideReferences(model2, position3, { includeDeclaration: true }, token))?.filter((ref) => shouldIncludeLocationLink(model2, ref));
    if (!compact2 || !result || result.length !== 2) {
      return result;
    }
    const resultWithoutDeclaration = (await provider.provideReferences(model2, position3, { includeDeclaration: false }, token))?.filter((ref) => shouldIncludeLocationLink(model2, ref));
    if (resultWithoutDeclaration && resultWithoutDeclaration.length === 1) {
      return resultWithoutDeclaration;
    }
    return result;
  });
}

async function _sortedAndDeduped(callback) {
  const rawLinks = await callback();
  const model = new ReferencesModel(rawLinks, "");
  const modelLinks = model.references.map((ref) => ref.link);
  model.dispose();
  return modelLinks;
}

registerModelAndPositionCommand("_executeDefinitionProvider", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getDefinitionsAtPosition(languageFeaturesService.definitionProvider, model, position2, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});

registerModelAndPositionCommand("_executeDefinitionProvider_recursive", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getDefinitionsAtPosition(languageFeaturesService.definitionProvider, model, position2, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});

registerModelAndPositionCommand("_executeTypeDefinitionProvider", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getTypeDefinitionsAtPosition(languageFeaturesService.typeDefinitionProvider, model, position2, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});

registerModelAndPositionCommand("_executeTypeDefinitionProvider_recursive", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getTypeDefinitionsAtPosition(languageFeaturesService.typeDefinitionProvider, model, position2, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});

registerModelAndPositionCommand("_executeDeclarationProvider", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getDeclarationsAtPosition(languageFeaturesService.declarationProvider, model, position2, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});

registerModelAndPositionCommand("_executeDeclarationProvider_recursive", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getDeclarationsAtPosition(languageFeaturesService.declarationProvider, model, position2, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});

registerModelAndPositionCommand("_executeReferenceProvider", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getReferencesAtPosition(languageFeaturesService.referenceProvider, model, position2, false, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});

registerModelAndPositionCommand("_executeReferenceProvider_recursive", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getReferencesAtPosition(languageFeaturesService.referenceProvider, model, position2, false, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});

registerModelAndPositionCommand("_executeImplementationProvider", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getImplementationsAtPosition(languageFeaturesService.implementationProvider, model, position2, false, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});

registerModelAndPositionCommand("_executeImplementationProvider_recursive", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const promise = getImplementationsAtPosition(languageFeaturesService.implementationProvider, model, position2, true, CancellationToken.None);
  return _sortedAndDeduped(() => promise);
});
export { shouldIncludeLocationLink, getLocationLinks, getDefinitionsAtPosition, getDeclarationsAtPosition, getImplementationsAtPosition, getTypeDefinitionsAtPosition, getReferencesAtPosition, _sortedAndDeduped };
