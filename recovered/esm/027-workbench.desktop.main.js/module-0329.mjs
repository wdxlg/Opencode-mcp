// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/gpuUtils.ts
import { BugIndicatingError } from "./module-0004.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/editor/browser/gpu/gpuUtils.ts
var quadVertices = new Float32Array([
  1,
  0,
  1,
  1,
  0,
  1,
  0,
  0,
  0,
  1,
  1,
  0
]);

function ensureNonNullable(value2) {
  if (!value2) {
    throw new Error(`Value "${value2}" cannot be null`);
  }
  return value2;
}

function observeDevicePixelDimensions(element, parentWindow, callback) {
  let observer = new parentWindow.ResizeObserver((entries2) => {
    const entry = entries2.find((entry2) => entry2.target === element);
    if (!entry) {
      return;
    }
    if (!("devicePixelContentBoxSize" in entry)) {
      observer?.disconnect();
      observer = void 0;
      return;
    }
    const width2 = entry.devicePixelContentBoxSize[0].inlineSize;
    const height = entry.devicePixelContentBoxSize[0].blockSize;
    if (width2 > 0 && height > 0) {
      callback(width2, height);
    }
  });
  try {
    observer.observe(element, { box: ["device-pixel-content-box"] });
  } catch {
    observer.disconnect();
    observer = void 0;
    throw new BugIndicatingError("Could not observe device pixel dimensions");
  }
  return toDisposable(() => observer?.disconnect());
}
export { ensureNonNullable, observeDevicePixelDimensions, quadVertices };
