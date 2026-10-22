// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/keybindingLabels.ts
import { localize } from "./module-0001.mjs";


// src/vs/base/common/keybindingLabels.ts
var ModifierLabelProvider = class {
  constructor(mac, windows, linux = windows) {
    this.modifierLabels = [null];
    this.modifierLabels[2 /* Macintosh */] = mac;
    this.modifierLabels[1 /* Windows */] = windows;
    this.modifierLabels[3 /* Linux */] = linux;
  }
  toLabel(OS2, chords, keyLabelProvider) {
    if (chords.length === 0) {
      return null;
    }
    const result = [];
    for (let i2 = 0, len = chords.length; i2 < len; i2++) {
      const chord = chords[i2];
      const keyLabel = keyLabelProvider(chord);
      if (keyLabel === null) {
        return null;
      }
      result[i2] = _simpleAsString(chord, keyLabel, this.modifierLabels[OS2]);
    }
    return result.join(" ");
  }
};

var UILabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: "\u2303",
    shiftKey: "\u21E7",
    altKey: "\u2325",
    metaKey: "\u2318",
    separator: ""
  },
  {
    ctrlKey: localize(129, null),
    shiftKey: localize(132, null),
    altKey: localize(126, null),
    metaKey: localize(136, null),
    separator: "+"
  },
  {
    ctrlKey: localize(129, null),
    shiftKey: localize(132, null),
    altKey: localize(126, null),
    metaKey: localize(134, null),
    separator: "+"
  }
);

var AriaLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: localize(130, null),
    shiftKey: localize(133, null),
    altKey: localize(131, null),
    metaKey: localize(128, null),
    separator: "+"
  },
  {
    ctrlKey: localize(130, null),
    shiftKey: localize(133, null),
    altKey: localize(127, null),
    metaKey: localize(137, null),
    separator: "+"
  },
  {
    ctrlKey: localize(130, null),
    shiftKey: localize(133, null),
    altKey: localize(127, null),
    metaKey: localize(135, null),
    separator: "+"
  }
);

var ElectronAcceleratorLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: "Ctrl",
    shiftKey: "Shift",
    altKey: "Alt",
    metaKey: "Cmd",
    separator: "+"
  },
  {
    ctrlKey: "Ctrl",
    shiftKey: "Shift",
    altKey: "Alt",
    metaKey: "Super",
    separator: "+"
  }
);

var UserSettingsLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "cmd",
    separator: "+"
  },
  {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "win",
    separator: "+"
  },
  {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "meta",
    separator: "+"
  }
);

function _simpleAsString(modifiers, key3, labels2) {
  if (key3 === null) {
    return "";
  }
  const result = [];
  if (modifiers.ctrlKey) {
    result.push(labels2.ctrlKey);
  }
  if (modifiers.shiftKey) {
    result.push(labels2.shiftKey);
  }
  if (modifiers.altKey) {
    result.push(labels2.altKey);
  }
  if (modifiers.metaKey) {
    result.push(labels2.metaKey);
  }
  if (key3 !== "") {
    result.push(key3);
  }
  return result.join(labels2.separator);
}
export { _simpleAsString, ModifierLabelProvider, UILabelProvider, AriaLabelProvider, ElectronAcceleratorLabelProvider, UserSettingsLabelProvider };
