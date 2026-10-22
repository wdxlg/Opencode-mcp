// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/update/electron-main/win32UpdateType.ts
import { dirname3, init_path, join4 } from "./module-0008.mjs";
import { __esm } from "./module-0000.mjs";
import { init_update } from "./module-0201.mjs";


// src/vs/platform/update/electron-main/win32UpdateType.ts
import { existsSync as existsSync2 } from "fs";

function isInnoSetupInstall(executablePath = process.execPath, fileExists2 = existsSync2) {
  return fileExists2(join4(dirname3(executablePath), "unins000.exe"));
}

function getWin32UpdateType() {
  return isInnoSetupInstall() ? 0 /* Setup */ : 1 /* Archive */;
}

var init_win32UpdateType = __esm({
  "src/vs/platform/update/electron-main/win32UpdateType.ts"() {
    init_path();
    init_update();
  }
});
export { isInnoSetupInstall, getWin32UpdateType, existsSync2, init_win32UpdateType };
