// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/apiActions.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { INotebookService } from "./module-0927.mjs";
import { isRelativePattern } from "./module-0857.mjs";
import { isDocumentExcludePattern } from "./module-0911.mjs";
import { INotebookKernelService } from "./module-1387.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/apiActions.ts
CommandsRegistry.registerCommand("_resolveNotebookContentProvider", (accessor) => {
  const notebookService = accessor.get(INotebookService);
  const contentProviders = notebookService.getContributedNotebookTypes();
  return contentProviders.map((provider) => {
    const filenamePatterns = provider.selectors.map((selector) => {
      if (typeof selector === "string") {
        return selector;
      }
      if (isRelativePattern(selector)) {
        return selector;
      }
      if (isDocumentExcludePattern(selector)) {
        return {
          include: selector.include,
          exclude: selector.exclude
        };
      }
      return null;
    }).filter((pattern) => pattern !== null);
    return {
      viewType: provider.id,
      displayName: provider.displayName,
      filenamePattern: filenamePatterns,
      options: {
        transientCellMetadata: provider.options.transientCellMetadata,
        transientDocumentMetadata: provider.options.transientDocumentMetadata,
        transientOutputs: provider.options.transientOutputs
      }
    };
  });
});

CommandsRegistry.registerCommand("_resolveNotebookKernels", async (accessor, args2) => {
  const notebookKernelService = accessor.get(INotebookKernelService);
  const uri4 = URI.revive(args2.uri);
  const kernels = notebookKernelService.getMatchingKernel({ uri: uri4, notebookType: args2.viewType });
  return kernels.all.map((provider) => ({
    id: provider.id,
    label: provider.label,
    description: provider.description,
    detail: provider.detail,
    isPreferred: false,
    // todo@jrieken,@rebornix
    preloads: provider.preloadUris
  }));
});
export {};
