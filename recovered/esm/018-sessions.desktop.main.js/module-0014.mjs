// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/platform.ts
import { getNLSLanguage } from "./module-0001.mjs";


// src/vs/base/common/platform.ts
var LANGUAGE_DEFAULT = "en";

var _isWindows = false;

var _isMacintosh = false;

var _isLinux = false;

var _isLinuxSnap = false;

var _isNative = false;

var _isWeb = false;

var _isElectron = false;

var _isIOS = false;

var _isCI = false;

var _isMobile = false;

var _locale = void 0;

var _language = LANGUAGE_DEFAULT;

var _platformLocale = LANGUAGE_DEFAULT;

var _translationsConfigFile = void 0;

var _userAgent = void 0;

var $globalThis = globalThis;

var nodeProcess = void 0;

if (typeof $globalThis.vscode !== "undefined" && typeof $globalThis.vscode.process !== "undefined") {
  nodeProcess = $globalThis.vscode.process;
} else if (typeof process !== "undefined" && typeof process?.versions?.node === "string") {
  nodeProcess = process;
}

var isElectronProcess = typeof nodeProcess?.versions?.electron === "string";

var isElectronRenderer = isElectronProcess && nodeProcess?.type === "renderer";

if (typeof nodeProcess === "object") {
  _isWindows = nodeProcess.platform === "win32";
  _isMacintosh = nodeProcess.platform === "darwin";
  _isLinux = nodeProcess.platform === "linux";
  _isLinuxSnap = _isLinux && !!nodeProcess.env["SNAP"] && !!nodeProcess.env["SNAP_REVISION"];
  _isElectron = isElectronProcess;
  _isCI = !!nodeProcess.env["CI"] || !!nodeProcess.env["BUILD_ARTIFACTSTAGINGDIRECTORY"] || !!nodeProcess.env["GITHUB_WORKSPACE"];
  _locale = LANGUAGE_DEFAULT;
  _language = LANGUAGE_DEFAULT;
  const rawNlsConfig = nodeProcess.env["VSCODE_NLS_CONFIG"];
  if (rawNlsConfig) {
    try {
      const nlsConfig = JSON.parse(rawNlsConfig);
      _locale = nlsConfig.userLocale;
      _platformLocale = nlsConfig.osLocale;
      _language = nlsConfig.resolvedLanguage || LANGUAGE_DEFAULT;
      _translationsConfigFile = nlsConfig.languagePack?.translationsConfigFile;
    } catch (e4) {
    }
  }
  _isNative = true;
} else if (typeof navigator === "object" && !isElectronRenderer) {
  _userAgent = navigator.userAgent;
  _isWindows = _userAgent.indexOf("Windows") >= 0;
  _isMacintosh = _userAgent.indexOf("Macintosh") >= 0;
  _isIOS = (_userAgent.indexOf("Macintosh") >= 0 || _userAgent.indexOf("iPad") >= 0 || _userAgent.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
  _isLinux = _userAgent.indexOf("Linux") >= 0;
  _isMobile = _userAgent?.indexOf("Mobi") >= 0;
  _isWeb = true;
  _language = getNLSLanguage() || LANGUAGE_DEFAULT;
  _locale = navigator.language.toLowerCase();
  _platformLocale = _locale;
} else {
  console.error("Unable to resolve platform.");
}

function PlatformToString(platform3) {
  switch (platform3) {
    case 0 /* Web */:
      return "Web";
    case 1 /* Mac */:
      return "Mac";
    case 2 /* Linux */:
      return "Linux";
    case 3 /* Windows */:
      return "Windows";
  }
}

var _platform = 0 /* Web */;

if (_isMacintosh) {
  _platform = 1 /* Mac */;
} else if (_isWindows) {
  _platform = 3 /* Windows */;
} else if (_isLinux) {
  _platform = 2 /* Linux */;
}

var isWindows = _isWindows;

var isMacintosh = _isMacintosh;

var isLinux = _isLinux;

var isLinuxSnap = _isLinuxSnap;

var isNative = _isNative;

var isElectron = _isElectron;

var isWeb = _isWeb;

var isWebWorker = _isWeb && typeof $globalThis.importScripts === "function";

var webWorkerOrigin = isWebWorker ? $globalThis.origin : void 0;

var isIOS = _isIOS;

var isMobile = _isMobile;

var isCI = _isCI;

var platform = _platform;

var userAgent = _userAgent;

var language = _language;

var Language;

((Language2) => {
  function value2() {
    return language;
  }
  Language2.value = value2;
  function isDefaultVariant() {
    if (language.length === 2) {
      return language === "en";
    } else if (language.length >= 3) {
      return language[0] === "e" && language[1] === "n" && language[2] === "-";
    } else {
      return false;
    }
  }
  Language2.isDefaultVariant = isDefaultVariant;
  function isDefault() {
    return language === "en";
  }
  Language2.isDefault = isDefault;
})(Language || (Language = {}));

var locale = _locale;

var platformLocale = _platformLocale;

var translationsConfigFile = _translationsConfigFile;

var setTimeout0IsFaster = typeof $globalThis.postMessage === "function" && !$globalThis.importScripts;

var setTimeout0 = (() => {
  if (setTimeout0IsFaster) {
    const pending = [];
    $globalThis.addEventListener("message", (e4) => {
      if (e4.data && e4.data.vscodeScheduleAsyncWork) {
        for (let i2 = 0, len = pending.length; i2 < len; i2++) {
          const candidate = pending[i2];
          if (candidate.id === e4.data.vscodeScheduleAsyncWork) {
            pending.splice(i2, 1);
            candidate.callback();
            return;
          }
        }
      }
    });
    let lastId = 0;
    return (callback) => {
      const myId = ++lastId;
      pending.push({
        id: myId,
        callback
      });
      $globalThis.postMessage({ vscodeScheduleAsyncWork: myId }, "*");
    };
  }
  return (callback) => setTimeout(callback);
})();

var OS = _isMacintosh || _isIOS ? 2 /* Macintosh */ : _isWindows ? 1 /* Windows */ : 3 /* Linux */;

var _isLittleEndian = true;

var _isLittleEndianComputed = false;

function isLittleEndian() {
  if (!_isLittleEndianComputed) {
    _isLittleEndianComputed = true;
    const test = new Uint8Array(2);
    test[0] = 1;
    test[1] = 2;
    const view = new Uint16Array(test.buffer);
    _isLittleEndian = view[0] === (2 << 8) + 1;
  }
  return _isLittleEndian;
}

var isChrome = !!(userAgent && userAgent.indexOf("Chrome") >= 0);

var isFirefox = !!(userAgent && userAgent.indexOf("Firefox") >= 0);

var isSafari = !!(!isChrome && (userAgent && userAgent.indexOf("Safari") >= 0));

var isEdge = !!(userAgent && userAgent.indexOf("Edg/") >= 0);

var isAndroid = !!(userAgent && userAgent.indexOf("Android") >= 0);

var hasElectronUserAgent = !!(userAgent && userAgent.indexOf("Electron") >= 0);

function isTahoeOrNewer(osVersion) {
  return parseFloat(osVersion) >= 25;
}
export { PlatformToString, isLittleEndian, isTahoeOrNewer, LANGUAGE_DEFAULT, _isWindows, _isMacintosh, _isLinux, _isLinuxSnap, _isNative, _isWeb, _isElectron, _isIOS, _isCI, _isMobile, _locale, _language, _platformLocale, _translationsConfigFile, _userAgent, $globalThis, nodeProcess, isElectronProcess, isElectronRenderer, _platform, isWindows, isMacintosh, isLinux, isLinuxSnap, isNative, isElectron, isWeb, isWebWorker, webWorkerOrigin, isIOS, isMobile, isCI, platform, userAgent, language, Language, locale, platformLocale, translationsConfigFile, setTimeout0IsFaster, setTimeout0, OS, _isLittleEndian, _isLittleEndianComputed, isChrome, isFirefox, isSafari, isEdge, isAndroid, hasElectronUserAgent };
