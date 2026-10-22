// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/@modelcontextprotocol/server/dist/chunk-Br0eD_fh.mjs
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// node_modules/@modelcontextprotocol/server/dist/chunk-Br0eD_fh.mjs
init_define_OPENCODE_BUILD_INFO();

var __create3 = Object.create;

var __defProp3 = Object.defineProperty;

var __getOwnPropDesc3 = Object.getOwnPropertyDescriptor;

var __getOwnPropNames3 = Object.getOwnPropertyNames;

var __getProtoOf3 = Object.getPrototypeOf;

var __hasOwnProp3 = Object.prototype.hasOwnProperty;

var __commonJSMin2 = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

var __exportAll2 = (all, symbols) => {
  let target = {};
  for (var name in all) {
    __defProp3(target, name, {
      get: all[name],
      enumerable: true
    });
  }
  if (symbols) {
    __defProp3(target, Symbol.toStringTag, { value: "Module" });
  }
  return target;
};

var __copyProps3 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (var keys = __getOwnPropNames3(from), i = 0, n = keys.length, key; i < n; i++) {
      key = keys[i];
      if (!__hasOwnProp3.call(to, key) && key !== except) {
        __defProp3(to, key, {
          get: ((k) => from[k]).bind(null, key),
          enumerable: !(desc = __getOwnPropDesc3(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

var __toESM3 = (mod, isNodeMode, target) => (target = mod != null ? __create3(__getProtoOf3(mod)) : {}, __copyProps3(isNodeMode || !mod || !mod.__esModule ? __defProp3(target, "default", {
  value: mod,
  enumerable: true
}) : target, mod));
export { __create3, __defProp3, __getOwnPropDesc3, __getOwnPropNames3, __getProtoOf3, __hasOwnProp3, __commonJSMin2, __exportAll2, __copyProps3, __toESM3 };
