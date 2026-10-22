// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider.ts
import { Color, RGBA } from "./module-0197.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { Disposable } from "./module-0012.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider.ts
var DefaultDocumentColorProvider = class {
  constructor(_editorWorkerService) {
    this._editorWorkerService = _editorWorkerService;
  }
  async provideDocumentColors(model, _token) {
    return this._editorWorkerService.computeDefaultDocumentColors(model.uri);
  }
  provideColorPresentations(_model, colorInfo, _token) {
    const range2 = colorInfo.range;
    const colorFromInfo = colorInfo.color;
    const color2 = new Color(new RGBA(Math.round(255 * colorFromInfo.red), Math.round(255 * colorFromInfo.green), Math.round(255 * colorFromInfo.blue), colorFromInfo.alpha));
    const rgb = Color.Format.CSS.formatRGB(color2);
    const hsl = Color.Format.CSS.formatHSL(color2);
    const hex = Color.Format.CSS.formatHexA(color2, true);
    const colorPresentations = [];
    colorPresentations.push({ label: rgb, textEdit: { range: range2, text: rgb } });
    colorPresentations.push({ label: hsl, textEdit: { range: range2, text: hsl } });
    colorPresentations.push({ label: hex, textEdit: { range: range2, text: hex } });
    return colorPresentations;
  }
};

DefaultDocumentColorProvider = __decorateClass([
  __decorateParam(0, IEditorWorkerService)
], DefaultDocumentColorProvider);

var DefaultDocumentColorProviderFeature = class extends Disposable {
  constructor(_languageFeaturesService, editorWorkerService) {
    super();
    this._register(_languageFeaturesService.colorProvider.register("*", new DefaultDocumentColorProvider(editorWorkerService)));
  }
};

DefaultDocumentColorProviderFeature = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IEditorWorkerService)
], DefaultDocumentColorProviderFeature);
export { DefaultDocumentColorProvider, DefaultDocumentColorProviderFeature };
