// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionNls.ts
import { isObject, isString } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";


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
  const processEntry = (obj, key3, command4) => {
    const value2 = obj[key3];
    if (isString(value2)) {
      const str = value2;
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
          command4 && (key3 === "title" || key3 === "category") && // and the original value is not the same as the translated value
          originalMessage && originalMessage !== message
        ) {
          const localizedString = {
            value: message,
            original: originalMessage
          };
          obj[key3] = localizedString;
        } else {
          obj[key3] = message;
        }
      }
    } else if (isObject(value2)) {
      for (const k in value2) {
        if (value2.hasOwnProperty(k)) {
          k === "commands" ? processEntry(value2, k, true) : processEntry(value2, k, command4);
        }
      }
    } else if (Array.isArray(value2)) {
      for (let i2 = 0; i2 < value2.length; i2++) {
        processEntry(value2, i2, command4);
      }
    }
  };
  for (const key3 in extensionManifest) {
    if (extensionManifest.hasOwnProperty(key3)) {
      processEntry(extensionManifest, key3);
    }
  }
}
export { localizeManifest, replaceNLStrings };
