// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/dialogs/electron-main/dialogMainUtils.ts
import { deepClone, init_objects } from "./module-0121.mjs";
import { init_labels, mnemonicButtonLabel } from "./module-0048.mjs";
import { init_platform, isLinux, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/dialogs/electron-main/dialogMainUtils.ts
import { release as release2 } from "os";

function massageMessageBoxOptions(options, productService) {
  const massagedOptions = deepClone(options);
  let buttons = (massagedOptions.buttons ?? []).map((button) => mnemonicButtonLabel(button).withMnemonic);
  let buttonIndeces = (options.buttons || []).map((button, index) => index);
  let defaultId = 0;
  let cancelId = massagedOptions.cancelId ?? buttons.length - 1;
  const useLegacyMacOSButtonOrder = isMacintosh && Number.parseInt(release2(), 10) < 24;
  if (buttons.length > 1) {
    const cancelButton = typeof cancelId === "number" ? buttons[cancelId] : void 0;
    if (isLinux || useLegacyMacOSButtonOrder) {
      if (typeof cancelButton === "string" && buttons.length > 1 && cancelId !== 1) {
        buttons.splice(cancelId, 1);
        buttons.splice(1, 0, cancelButton);
        const cancelButtonIndex = buttonIndeces[cancelId];
        buttonIndeces.splice(cancelId, 1);
        buttonIndeces.splice(1, 0, cancelButtonIndex);
        cancelId = 1;
      }
      if (isLinux && buttons.length > 1) {
        buttons = buttons.reverse();
        buttonIndeces = buttonIndeces.reverse();
        defaultId = buttons.length - 1;
        if (typeof cancelButton === "string") {
          cancelId = defaultId - 1;
        }
      }
    } else if (isWindows2) {
      if (typeof cancelButton === "string" && buttons.length > 1 && cancelId !== buttons.length - 1) {
        buttons.splice(cancelId, 1);
        buttons.push(cancelButton);
        const buttonIndex = buttonIndeces[cancelId];
        buttonIndeces.splice(cancelId, 1);
        buttonIndeces.push(buttonIndex);
        cancelId = buttons.length - 1;
      }
    }
  }
  massagedOptions.buttons = buttons;
  massagedOptions.defaultId = defaultId;
  massagedOptions.cancelId = cancelId;
  massagedOptions.noLink = true;
  massagedOptions.title = massagedOptions.title || productService.nameLong;
  return {
    options: massagedOptions,
    buttonIndeces
  };
}

var init_dialogMainUtils = __esm({
  "src/vs/platform/dialogs/electron-main/dialogMainUtils.ts"() {
    init_labels();
    init_objects();
    init_platform();
  }
});
export { massageMessageBoxOptions, release2, init_dialogMainUtils };
