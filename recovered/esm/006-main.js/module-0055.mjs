// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/uuid.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/uuid.ts
function isUUID(value) {
  return _UUIDPattern.test(value);
}

var _UUIDPattern, generateUuid;

var init_uuid = __esm({
  "src/vs/base/common/uuid.ts"() {
    _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    generateUuid = (function() {
      if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID.bind(crypto);
      }
      const _data = new Uint8Array(16);
      const _hex = [];
      for (let i = 0; i < 256; i++) {
        _hex.push(i.toString(16).padStart(2, "0"));
      }
      return function generateUuid2() {
        crypto.getRandomValues(_data);
        _data[6] = _data[6] & 15 | 64;
        _data[8] = _data[8] & 63 | 128;
        let i = 0;
        let result = "";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        return result;
      };
    })();
  }
});
export { isUUID, _UUIDPattern, generateUuid, init_uuid };
