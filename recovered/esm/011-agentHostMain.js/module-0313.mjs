// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/node/libc.ts
import { isLinux } from "./module-0013.mjs";


// src/vs/base/node/libc.ts
import { familySync, MUSL } from "detect-libc";

var _cached;

var _cacheValid = false;

function detectLibcSync() {
  if (_cacheValid) {
    return _cached;
  }
  if (isLinux) {
    _cached = familySync() === MUSL ? "musl" : "glibc";
  } else {
    _cached = void 0;
  }
  _cacheValid = true;
  return _cached;
}
export { detectLibcSync, familySync, MUSL, _cached, _cacheValid };
