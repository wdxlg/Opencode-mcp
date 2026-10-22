// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/dialogs/electron-browser/dialog.ts
import { localize } from "./module-0001.mjs";
import { fromNow } from "./module-0120.mjs";
import { process2 } from "./module-3821.mjs";
import { isLinuxSnap } from "./module-0014.mjs";


// src/vs/platform/dialogs/electron-browser/dialog.ts
function createNativeAboutDialogDetails(productService, osProps) {
  let version2 = productService.opencodeVersion ?? productService.version;
  if (productService.target) {
    version2 = `${version2} (${productService.target} setup)`;
  } else if (productService.darwinUniversalAssetId) {
    version2 = `${version2} (Universal)`;
  }
  const getDetails = (useAgo) => {
    return localize(
      2826,
      null,
      version2,
      productService.commit || "Unknown",
      productService.date ? `${productService.date}${useAgo ? " (" + fromNow(new Date(productService.date), true) + ")" : ""}` : "Unknown",
      process2.versions["electron"],
      process2.versions["microsoft-build"],
      process2.versions["chrome"],
      process2.versions["node"],
      process2.versions["v8"],
      productService.copilotVersions?.runtime || "Unknown",
      productService.copilotVersions?.sdk || "Unknown",
      `${osProps.type} ${osProps.arch} ${osProps.release}${isLinuxSnap ? " snap" : ""}`
    );
  };
  const details = getDetails(true);
  const detailsToCopy = getDetails(false);
  return {
    title: productService.nameLong,
    details,
    detailsToCopy
  };
}
export { createNativeAboutDialogDetails };
