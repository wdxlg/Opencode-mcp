// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/config/fontInfoFromSettings.ts
import { BareFontInfo } from "./module-0101.mjs";
import { EditorOptions } from "./module-0105.mjs";


// src/vs/editor/common/config/fontInfoFromSettings.ts
function createBareFontInfoFromValidatedSettings(options3, pixelRatio, ignoreEditorZoom) {
  const fontFamily = options3.get(58 /* fontFamily */);
  const fontWeight = options3.get(62 /* fontWeight */);
  const fontSize = options3.get(61 /* fontSize */);
  const fontFeatureSettings = options3.get(60 /* fontLigatures */);
  const fontVariationSettings = options3.get(63 /* fontVariations */);
  const lineHeight = options3.get(75 /* lineHeight */);
  const letterSpacing = options3.get(72 /* letterSpacing */);
  return BareFontInfo._create(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom);
}

function createBareFontInfoFromRawSettings(opts, pixelRatio, ignoreEditorZoom = false) {
  const fontFamily = EditorOptions.fontFamily.validate(opts.fontFamily);
  const fontWeight = EditorOptions.fontWeight.validate(opts.fontWeight);
  const fontSize = EditorOptions.fontSize.validate(opts.fontSize);
  const fontFeatureSettings = EditorOptions.fontLigatures2.validate(opts.fontLigatures);
  const fontVariationSettings = EditorOptions.fontVariations.validate(opts.fontVariations);
  const lineHeight = EditorOptions.lineHeight.validate(opts.lineHeight);
  const letterSpacing = EditorOptions.letterSpacing.validate(opts.letterSpacing);
  return BareFontInfo._create(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom);
}
export { createBareFontInfoFromValidatedSettings, createBareFontInfoFromRawSettings };
