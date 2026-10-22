// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/keyboardLayout/common/keyboardLayout.ts
import { createDecorator } from "./module-0077.mjs";
import { ScanCodeUtils } from "./module-0019.mjs";


// src/vs/platform/keyboardLayout/common/keyboardLayout.ts
var IKeyboardLayoutService = createDecorator("keyboardLayoutService");

function getKeyboardLayoutId(layout2) {
  if (layout2.name) {
    return layout2.name;
  }
  if (layout2.id) {
    return layout2.id;
  }
  return layout2.layout;
}

function windowsKeyMappingEquals(a, b) {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.vkey === b.vkey && a.value === b.value && a.withShift === b.withShift && a.withAltGr === b.withAltGr && a.withShiftAltGr === b.withShiftAltGr;
}

function windowsKeyboardMappingEquals(a, b) {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  for (let scanCode = 0; scanCode < 193 /* MAX_VALUE */; scanCode++) {
    const strScanCode = ScanCodeUtils.toString(scanCode);
    const aEntry = a[strScanCode];
    const bEntry = b[strScanCode];
    if (!windowsKeyMappingEquals(aEntry, bEntry)) {
      return false;
    }
  }
  return true;
}

function macLinuxKeyMappingEquals(a, b) {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.value === b.value && a.withShift === b.withShift && a.withAltGr === b.withAltGr && a.withShiftAltGr === b.withShiftAltGr;
}

function macLinuxKeyboardMappingEquals(a, b) {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  for (let scanCode = 0; scanCode < 193 /* MAX_VALUE */; scanCode++) {
    const strScanCode = ScanCodeUtils.toString(scanCode);
    const aEntry = a[strScanCode];
    const bEntry = b[strScanCode];
    if (!macLinuxKeyMappingEquals(aEntry, bEntry)) {
      return false;
    }
  }
  return true;
}
export { getKeyboardLayoutId, windowsKeyMappingEquals, windowsKeyboardMappingEquals, macLinuxKeyMappingEquals, macLinuxKeyboardMappingEquals, IKeyboardLayoutService };
