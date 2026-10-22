// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/getHover.ts
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { AsyncIterableProducer } from "./module-0036.mjs";
import { registerModelAndPositionCommand } from "./module-0097.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/editor/contrib/hover/browser/getHover.ts
var HoverProviderResult = class {
  constructor(provider, hover, ordinal) {
    this.provider = provider;
    this.hover = hover;
    this.ordinal = ordinal;
  }
};

async function executeProvider(provider, ordinal, model, position2, token) {
  const result = await Promise.resolve(provider.provideHover(model, position2, token)).catch(onUnexpectedExternalError);
  if (!result || !isValid(result)) {
    return void 0;
  }
  return new HoverProviderResult(provider, result, ordinal);
}

function getHoverProviderResultsAsAsyncIterable(registry4, model, position2, token, recursive = false) {
  const providers2 = registry4.ordered(model, recursive);
  const promises = providers2.map((provider, index2) => executeProvider(provider, index2, model, position2, token));
  return AsyncIterableProducer.fromPromisesResolveOrder(promises).coalesce();
}

async function getHoversPromise(registry4, model, position2, token, recursive = false) {
  const out = [];
  for await (const item of getHoverProviderResultsAsAsyncIterable(registry4, model, position2, token, recursive)) {
    out.push(item.hover);
  }
  return out;
}

registerModelAndPositionCommand("_executeHoverProvider", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  return getHoversPromise(languageFeaturesService.hoverProvider, model, position2, CancellationToken.None);
});

registerModelAndPositionCommand("_executeHoverProvider_recursive", (accessor, model, position2) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  return getHoversPromise(languageFeaturesService.hoverProvider, model, position2, CancellationToken.None, true);
});

function isValid(result) {
  const hasRange = typeof result.range !== "undefined";
  const hasHtmlContent = typeof result.contents !== "undefined" && result.contents && result.contents.length > 0;
  return hasRange && hasHtmlContent;
}
export { executeProvider, getHoverProviderResultsAsAsyncIterable, getHoversPromise, isValid, HoverProviderResult };
