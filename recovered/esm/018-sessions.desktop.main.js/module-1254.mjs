// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/speech/common/speechService.ts
import { createDecorator } from "./module-0077.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { language } from "./module-0014.mjs";


// src/vs/workbench/contrib/speech/common/speechService.ts
var ISpeechService = createDecorator("speechService");

var HasSpeechProvider = new RawContextKey("hasSpeechProvider", false, { type: "boolean", description: localize(19380, null) });

var SpeechToTextInProgress = new RawContextKey("speechToTextInProgress", false, { type: "boolean", description: localize(19407, null) });

var TextToSpeechInProgress = new RawContextKey("textToSpeechInProgress", false, { type: "boolean", description: localize(19408, null) });

var SPEECH_LANGUAGE_CONFIG = "accessibility.voice.speechLanguage" /* SpeechLanguage */;

var SPEECH_LANGUAGES = {
  ["da-DK"]: {
    name: localize(19381, null)
  },
  ["de-DE"]: {
    name: localize(19382, null)
  },
  ["en-AU"]: {
    name: localize(19383, null)
  },
  ["en-CA"]: {
    name: localize(19384, null)
  },
  ["en-GB"]: {
    name: localize(19385, null)
  },
  ["en-IE"]: {
    name: localize(19386, null)
  },
  ["en-IN"]: {
    name: localize(19387, null)
  },
  ["en-NZ"]: {
    name: localize(19388, null)
  },
  ["en-US"]: {
    name: localize(19389, null)
  },
  ["es-ES"]: {
    name: localize(19390, null)
  },
  ["es-MX"]: {
    name: localize(19391, null)
  },
  ["fr-CA"]: {
    name: localize(19392, null)
  },
  ["fr-FR"]: {
    name: localize(19393, null)
  },
  ["hi-IN"]: {
    name: localize(19394, null)
  },
  ["it-IT"]: {
    name: localize(19395, null)
  },
  ["ja-JP"]: {
    name: localize(19396, null)
  },
  ["ko-KR"]: {
    name: localize(19397, null)
  },
  ["nl-NL"]: {
    name: localize(19398, null)
  },
  ["pt-PT"]: {
    name: localize(19400, null)
  },
  ["pt-BR"]: {
    name: localize(19399, null)
  },
  ["ru-RU"]: {
    name: localize(19401, null)
  },
  ["sv-SE"]: {
    name: localize(19402, null)
  },
  ["tr-TR"]: {
    // allow-any-unicode-next-line
    name: localize(19403, null)
  },
  ["zh-CN"]: {
    name: localize(19404, null)
  },
  ["zh-HK"]: {
    name: localize(19405, null)
  },
  ["zh-TW"]: {
    name: localize(19406, null)
  }
};

function speechLanguageConfigToLanguage(config, lang = language) {
  if (typeof config === "string") {
    if (config === "auto") {
      if (lang !== "en") {
        const langParts = lang.split("-");
        return speechLanguageConfigToLanguage(`${langParts[0]}-${(langParts[1] ?? langParts[0]).toUpperCase()}`);
      }
    } else {
      if (SPEECH_LANGUAGES[config]) {
        return config;
      }
    }
  }
  return "en-US";
}
export { speechLanguageConfigToLanguage, ISpeechService, HasSpeechProvider, SpeechToTextInProgress, TextToSpeechInProgress, SPEECH_LANGUAGE_CONFIG, SPEECH_LANGUAGES };
