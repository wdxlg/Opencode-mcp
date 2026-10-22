// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/hoverColorPicker/hoverColorPicker.ts
import { ColorDecorationInjectedTextMarker } from "./module-0578.mjs";


// src/vs/editor/contrib/colorPicker/browser/hoverColorPicker/hoverColorPicker.ts
function isOnColorDecorator(mouseEvent) {
  const target = mouseEvent.target;
  return !!target && target.type === 6 /* CONTENT_TEXT */ && target.detail.injectedText?.options.attachedData === ColorDecorationInjectedTextMarker;
}
export { isOnColorDecorator };
