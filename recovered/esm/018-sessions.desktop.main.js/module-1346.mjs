// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/speechToText/dictationLanguage.ts
import { Language } from "./module-0014.mjs";


// src/vs/workbench/contrib/chat/browser/speechToText/dictationLanguage.ts
var NEMOTRON_LOCALES = /* @__PURE__ */ new Set([
  "ar-AR",
  "bg-BG",
  "cs-CZ",
  "da-DK",
  "de-DE",
  "en-GB",
  "en-US",
  "es-ES",
  "es-US",
  "et-EE",
  "fi-FI",
  "fr-CA",
  "fr-FR",
  "el-GR",
  "he-IL",
  "hi-IN",
  "hr-HR",
  "hu-HU",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "lt-LT",
  "lv-LV",
  "mt-MT",
  "nb-NO",
  "nl-NL",
  "nn-NO",
  "pl-PL",
  "pt-BR",
  "pt-PT",
  "ro-RO",
  "ru-RU",
  "sk-SK",
  "sl-SI",
  "sv-SE",
  "th-TH",
  "tr-TR",
  "uk-UA",
  "vi-VN",
  "zh-CN"
]);

var NEMOTRON_DEFAULT_LOCALE_BY_LANGUAGE = {
  ar: "ar-AR",
  bg: "bg-BG",
  cs: "cs-CZ",
  da: "da-DK",
  de: "de-DE",
  en: "en-US",
  es: "es-US",
  et: "et-EE",
  el: "el-GR",
  fi: "fi-FI",
  fr: "fr-FR",
  he: "he-IL",
  hi: "hi-IN",
  hr: "hr-HR",
  hu: "hu-HU",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  lt: "lt-LT",
  lv: "lv-LV",
  mt: "mt-MT",
  nb: "nb-NO",
  nl: "nl-NL",
  nn: "nn-NO",
  pl: "pl-PL",
  pt: "pt-PT",
  ro: "ro-RO",
  ru: "ru-RU",
  sk: "sk-SK",
  sl: "sl-SI",
  sv: "sv-SE",
  th: "th-TH",
  tr: "tr-TR",
  uk: "uk-UA",
  vi: "vi-VN",
  zh: "zh-CN"
};

function getConfiguredDisplayLanguage() {
  return Language.value();
}

function resolveDictationLanguage(configuredLanguage, browserLanguage, displayLanguage = getConfiguredDisplayLanguage()) {
  const configured = typeof configuredLanguage === "string" ? configuredLanguage.trim() : "";
  if (configured && configured.toLowerCase() !== "auto") {
    return resolveSupportedDictationLanguage(configured) ?? "auto";
  }
  return resolveSupportedDictationLanguage(displayLanguage) ?? resolveSupportedDictationLanguage(browserLanguage) ?? "auto";
}

function resolveSupportedDictationLanguage(candidate) {
  if (!candidate || typeof Intl.getCanonicalLocales !== "function") {
    return void 0;
  }
  try {
    const canonical = Intl.getCanonicalLocales(candidate)[0];
    if (NEMOTRON_LOCALES.has(canonical)) {
      return canonical;
    }
    return NEMOTRON_DEFAULT_LOCALE_BY_LANGUAGE[canonical.split("-")[0]];
  } catch {
    return void 0;
  }
}
export { getConfiguredDisplayLanguage, resolveDictationLanguage, resolveSupportedDictationLanguage, NEMOTRON_LOCALES, NEMOTRON_DEFAULT_LOCALE_BY_LANGUAGE };
