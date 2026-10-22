// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/pixelSpinner/pixelSpinner.ts
import { h } from "./module-0075.mjs";
import { pauseCSSAnimationsWhenHidden } from "./module-1986.mjs";


// src/vs/base/browser/ui/pixelSpinner/pixelSpinner.ts
function createPixelSpinner(parent, options3) {
  const variant = options3?.variant ?? "grid";
  const rootClass = variant === "ring" ? "span.monaco-pixel-spinner.monaco-pixel-spinner-ring" : "span.monaco-pixel-spinner";
  const root = h(rootClass).root;
  if (options3?.ariaLabel) {
    root.setAttribute("role", "status");
    root.setAttribute("aria-label", options3.ariaLabel);
  } else {
    root.setAttribute("aria-hidden", "true");
  }
  for (let i2 = 0; i2 < 6; i2++) {
    root.appendChild(h("span.monaco-pixel-spinner-dot").root);
  }
  parent?.appendChild(root);
  const animationTracking = trackSpinner(root);
  return {
    element: root,
    dispose: () => animationTracking.dispose()
  };
}

var PAUSED_CLASS = "monaco-pixel-spinner-paused";

var SPINNER_ANIMATION_NAMES = /* @__PURE__ */ new Set([
  "monaco-pixel-spinner-dot-cycle",
  "monaco-pixel-spinner-dot-cycle-long",
  "monaco-pixel-spinner-dot-cycle-short",
  "monaco-pixel-spinner-ring-pulse"
]);

function trackSpinner(root) {
  return pauseCSSAnimationsWhenHidden(root, {
    pausedClass: PAUSED_CLASS,
    subtree: true,
    animationNames: SPINNER_ANIMATION_NAMES
  });
}
export { createPixelSpinner, trackSpinner, PAUSED_CLASS, SPINNER_ANIMATION_NAMES };
