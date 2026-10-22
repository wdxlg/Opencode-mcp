// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/uuid.ts



// src/vs/base/common/uuid.ts
var _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value2) {
  return _UUIDPattern.test(value2);
}

var generateUuid = (function() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID.bind(crypto);
  }
  const _data = new Uint8Array(16);
  const _hex = [];
  for (let i2 = 0; i2 < 256; i2++) {
    _hex.push(i2.toString(16).padStart(2, "0"));
  }
  return function generateUuid2() {
    crypto.getRandomValues(_data);
    _data[6] = _data[6] & 15 | 64;
    _data[8] = _data[8] & 63 | 128;
    let i2 = 0;
    let result = "";
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += "-";
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += "-";
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += "-";
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += "-";
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    result += _hex[_data[i2++]];
    return result;
  };
})();

function prefixedUuid(namespace) {
  return `${namespace}-${generateUuid()}`;
}
export { isUUID, prefixedUuid, _UUIDPattern, generateUuid };
