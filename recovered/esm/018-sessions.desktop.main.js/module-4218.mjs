// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/common/keymapInfo.ts
import { isLinux, isWindows } from "./module-0014.mjs";
import { getKeyboardLayoutId } from "./module-1608.mjs";


// src/vs/workbench/services/keybinding/common/keymapInfo.ts
function deserializeMapping(serializedMapping) {
  const mapping2 = serializedMapping;
  const ret = {};
  for (const key3 in mapping2) {
    const result = mapping2[key3];
    if (result.length) {
      const value2 = result[0];
      const withShift = result[1];
      const withAltGr = result[2];
      const withShiftAltGr = result[3];
      const mask = Number(result[4]);
      const vkey = result.length === 6 ? result[5] : void 0;
      ret[key3] = {
        "value": value2,
        "vkey": vkey,
        "withShift": withShift,
        "withAltGr": withAltGr,
        "withShiftAltGr": withShiftAltGr,
        "valueIsDeadKey": (mask & 1) > 0,
        "withShiftIsDeadKey": (mask & 2) > 0,
        "withAltGrIsDeadKey": (mask & 4) > 0,
        "withShiftAltGrIsDeadKey": (mask & 8) > 0
      };
    } else {
      ret[key3] = {
        "value": "",
        "valueIsDeadKey": false,
        "withShift": "",
        "withShiftIsDeadKey": false,
        "withAltGr": "",
        "withAltGrIsDeadKey": false,
        "withShiftAltGr": "",
        "withShiftAltGrIsDeadKey": false
      };
    }
  }
  return ret;
}

var KeymapInfo = class _KeymapInfo {
  constructor(layout2, secondaryLayouts, keyboardMapping, isUserKeyboardLayout) {
    this.layout = layout2;
    this.secondaryLayouts = secondaryLayouts;
    this.mapping = deserializeMapping(keyboardMapping);
    this.isUserKeyboardLayout = !!isUserKeyboardLayout;
    this.layout.isUserKeyboardLayout = !!isUserKeyboardLayout;
  }
  static createKeyboardLayoutFromDebugInfo(layout2, value2, isUserKeyboardLayout) {
    const keyboardLayoutInfo = new _KeymapInfo(layout2, [], {}, true);
    keyboardLayoutInfo.mapping = value2;
    return keyboardLayoutInfo;
  }
  update(other) {
    this.layout = other.layout;
    this.secondaryLayouts = other.secondaryLayouts;
    this.mapping = other.mapping;
    this.isUserKeyboardLayout = other.isUserKeyboardLayout;
    this.layout.isUserKeyboardLayout = other.isUserKeyboardLayout;
  }
  getScore(other) {
    let score3 = 0;
    for (const key3 in other) {
      if (isWindows && (key3 === "Backslash" || key3 === "KeyQ")) {
        continue;
      }
      if (isLinux && (key3 === "Backspace" || key3 === "Escape")) {
        continue;
      }
      const currentMapping = this.mapping[key3];
      if (currentMapping === void 0) {
        score3 -= 1;
      }
      const otherMapping = other[key3];
      if (currentMapping && otherMapping && currentMapping.value !== otherMapping.value) {
        score3 -= 1;
      }
    }
    return score3;
  }
  equal(other) {
    if (this.isUserKeyboardLayout !== other.isUserKeyboardLayout) {
      return false;
    }
    if (getKeyboardLayoutId(this.layout) !== getKeyboardLayoutId(other.layout)) {
      return false;
    }
    return this.fuzzyEqual(other.mapping);
  }
  fuzzyEqual(other) {
    for (const key3 in other) {
      if (isWindows && (key3 === "Backslash" || key3 === "KeyQ")) {
        continue;
      }
      if (this.mapping[key3] === void 0) {
        return false;
      }
      const currentMapping = this.mapping[key3];
      const otherMapping = other[key3];
      if (currentMapping.value !== otherMapping.value) {
        return false;
      }
    }
    return true;
  }
};
export { deserializeMapping, KeymapInfo };
