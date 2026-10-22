// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/documentSymbols/browser/documentSymbols.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { IOutlineModelService } from "./module-0691.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/editor/contrib/documentSymbols/browser/documentSymbols.ts
CommandsRegistry.registerCommand("_executeDocumentSymbolProvider", async function(accessor, ...args2) {
  const [resource] = args2;
  assertType(URI.isUri(resource));
  const outlineService = accessor.get(IOutlineModelService);
  const modelService = accessor.get(ITextModelService);
  const reference = await modelService.createModelReference(resource);
  try {
    return (await outlineService.getOrCreate(reference.object.textEditorModel, CancellationToken.None)).getTopLevelSymbols();
  } finally {
    reference.dispose();
  }
});
export {};
