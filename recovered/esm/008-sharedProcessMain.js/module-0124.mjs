// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionManagementUtil.ts
import { ExtractError, buffer } from "./module-0119.mjs";
import { toExtensionManagementError } from "./module-0116.mjs";
import { ExtensionManagementError } from "./module-0058.mjs";
import { localize } from "./module-0007.mjs";


// src/vs/platform/extensionManagement/node/extensionManagementUtil.ts
function fromExtractError(e) {
  let errorCode = "Extract" /* Extract */;
  if (e instanceof ExtractError) {
    if (e.type === "CorruptZip") {
      errorCode = "CorruptZip" /* CorruptZip */;
    } else if (e.type === "Incomplete") {
      errorCode = "IncompleteZip" /* IncompleteZip */;
    }
  }
  return toExtensionManagementError(e, errorCode);
}

async function getManifest(vsixPath) {
  let data;
  try {
    data = await buffer(vsixPath, "extension/package.json");
  } catch (e) {
    throw fromExtractError(e);
  }
  try {
    return JSON.parse(data.toString("utf8"));
  } catch (err) {
    throw new ExtensionManagementError(localize(2985, null), "Invalid" /* Invalid */);
  }
}
export { fromExtractError, getManifest };
