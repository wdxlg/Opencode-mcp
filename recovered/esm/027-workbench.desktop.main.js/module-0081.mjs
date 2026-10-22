// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/resolverService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/editor/common/services/resolverService.ts
var ITextModelService = createDecorator("textModelService");

function isResolvedTextEditorModel(model) {
  const candidate = model;
  return !!candidate.textEditorModel;
}
export { isResolvedTextEditorModel, ITextModelService };
