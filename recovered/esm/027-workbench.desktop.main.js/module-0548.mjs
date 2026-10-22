// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/hover/hover.ts



// src/vs/base/browser/ui/hover/hover.ts
function isManagedHoverTooltipMarkdownString(obj) {
  const candidate = obj;
  return typeof candidate === "object" && "markdown" in candidate && "markdownNotSupportedFallback" in candidate;
}

function isManagedHoverTooltipHTMLElement(obj) {
  const candidate = obj;
  return typeof candidate === "object" && "element" in candidate;
}
export { isManagedHoverTooltipMarkdownString, isManagedHoverTooltipHTMLElement };
