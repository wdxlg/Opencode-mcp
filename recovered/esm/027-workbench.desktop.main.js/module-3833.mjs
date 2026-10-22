// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/keyboardLayout/common/keyboardConfig.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { OS } from "./module-0014.mjs";


// src/vs/platform/keyboardLayout/common/keyboardConfig.ts
function readKeyboardConfig(configurationService) {
  const keyboard = configurationService.getValue("keyboard");
  const dispatch = keyboard?.dispatch === "keyCode" ? 1 /* KeyCode */ : 0 /* Code */;
  const mapAltGrToCtrlAlt = Boolean(keyboard?.mapAltGrToCtrlAlt);
  return { dispatch, mapAltGrToCtrlAlt };
}

var configurationRegistry27 = Registry.as(Extensions4.Configuration);

var keyboardConfiguration = {
  "id": "keyboard",
  "order": 15,
  "type": "object",
  "title": localize(3066, null),
  "properties": {
    "keyboard.dispatch": {
      scope: 1 /* APPLICATION */,
      type: "string",
      enum: ["code", "keyCode"],
      default: "code",
      markdownDescription: localize(3065, null),
      included: OS === 2 /* Macintosh */ || OS === 3 /* Linux */
    },
    "keyboard.mapAltGrToCtrlAlt": {
      scope: 1 /* APPLICATION */,
      type: "boolean",
      default: false,
      markdownDescription: localize(3067, null),
      included: OS === 1 /* Windows */
    }
  }
};

configurationRegistry27.registerConfiguration(keyboardConfiguration);
export { readKeyboardConfig, configurationRegistry27, keyboardConfiguration };
