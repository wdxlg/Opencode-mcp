// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionNls.ts
import { init_types, isObject, isString } from "./module-0016.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/extensionManagement/common/extensionNls.ts
function localizeManifest(logger, extensionManifest, translations, fallbackTranslations) {
  try {
    replaceNLStrings(logger, extensionManifest, translations, fallbackTranslations);
  } catch (error) {
    logger.error(error?.message ?? error);
  }
  return extensionManifest;
}

function replaceNLStrings(logger, extensionManifest, messages, originalMessages) {
  const processEntry = (obj, key, command) => {
    const value = obj[key];
    if (isString(value)) {
      const str = value;
      const length = str.length;
      if (length > 1 && str[0] === "%" && str[length - 1] === "%") {
        const messageKey = str.substr(1, length - 2);
        let translated = messages[messageKey];
        if (translated === void 0 && originalMessages) {
          translated = originalMessages[messageKey];
        }
        const message = typeof translated === "string" ? translated : translated?.message;
        const original = originalMessages?.[messageKey];
        const originalMessage = typeof original === "string" ? original : original?.message;
        if (!message) {
          if (!originalMessage) {
            logger.warn(`[${extensionManifest.name}]: ${localize(2969, null, messageKey)}`);
          }
          return;
        }
        if (
          // if we are translating the title or category of a command
          command && (key === "title" || key === "category") && // and the original value is not the same as the translated value
          originalMessage && originalMessage !== message
        ) {
          const localizedString = {
            value: message,
            original: originalMessage
          };
          obj[key] = localizedString;
        } else {
          obj[key] = message;
        }
      }
    } else if (isObject(value)) {
      for (const k in value) {
        if (value.hasOwnProperty(k)) {
          k === "commands" ? processEntry(value, k, true) : processEntry(value, k, command);
        }
      }
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        processEntry(value, i, command);
      }
    }
  };
  for (const key in extensionManifest) {
    if (extensionManifest.hasOwnProperty(key)) {
      processEntry(extensionManifest, key);
    }
  }
}

var init_extensionNls = __esm({
  "src/vs/platform/extensionManagement/common/extensionNls.ts"() {
    init_types();
    init_nls();
  }
});
export { localizeManifest, replaceNLStrings, init_extensionNls };
