// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/labels.ts
import { isWindows } from "./module-0014.mjs";
import { hasDriveLetter } from "./module-0024.mjs";


// src/vs/base/common/labels.ts
function normalizeDriveLetter(path, isWindowsOS = isWindows) {
  if (hasDriveLetter(path, isWindowsOS)) {
    return path.charAt(0).toUpperCase() + path.slice(1);
  }
  return path;
}

function untildify(path, userHome) {
  return path.replace(/^~($|\/|\\)/, `${userHome}$1`);
}
export { normalizeDriveLetter, untildify };
