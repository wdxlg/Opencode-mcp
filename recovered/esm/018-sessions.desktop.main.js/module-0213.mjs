// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/config/domFontInfo.ts
import { FastDomNode } from "./module-0212.mjs";


// src/vs/editor/browser/config/domFontInfo.ts
function applyFontInfo(domNode, fontInfo) {
  if (domNode instanceof FastDomNode) {
    domNode.setFontFamily(fontInfo.getMassagedFontFamily());
    domNode.setFontWeight(fontInfo.fontWeight);
    domNode.setFontSize(fontInfo.fontSize);
    domNode.setFontFeatureSettings(fontInfo.fontFeatureSettings);
    domNode.setFontVariationSettings(fontInfo.fontVariationSettings);
    domNode.setLineHeight(fontInfo.lineHeight);
    domNode.setLetterSpacing(fontInfo.letterSpacing);
  } else {
    domNode.style.fontFamily = fontInfo.getMassagedFontFamily();
    domNode.style.fontWeight = fontInfo.fontWeight;
    domNode.style.fontSize = fontInfo.fontSize + "px";
    domNode.style.fontFeatureSettings = fontInfo.fontFeatureSettings;
    domNode.style.fontVariationSettings = fontInfo.fontVariationSettings;
    domNode.style.lineHeight = fontInfo.lineHeight + "px";
    domNode.style.letterSpacing = fontInfo.letterSpacing + "px";
  }
}
export { applyFontInfo };
