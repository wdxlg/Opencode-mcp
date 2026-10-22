// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/extensions/common/extensionValidator.ts
import { severity_default } from "./module-0072.mjs";
import { localize } from "./module-0013.mjs";
import { isEqualOrParent2, joinPath } from "./module-0026.mjs";
import { valid } from "./module-0062.mjs";


// src/vs/platform/extensions/common/extensionValidator.ts
var VERSION_REGEXP = /^(\^|>=)?((\d+)|x)\.((\d+)|x)\.((\d+)|x)(\-.*)?$/;

var NOT_BEFORE_REGEXP = /^-(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?$/;

function isValidVersionStr(version) {
  version = version.trim();
  return version === "*" || VERSION_REGEXP.test(version);
}

function parseVersion(version) {
  if (!isValidVersionStr(version)) {
    return null;
  }
  version = version.trim();
  if (version === "*") {
    return {
      hasCaret: false,
      hasGreaterEquals: false,
      majorBase: 0,
      majorMustEqual: false,
      minorBase: 0,
      minorMustEqual: false,
      patchBase: 0,
      patchMustEqual: false,
      preRelease: null
    };
  }
  const m = version.match(VERSION_REGEXP);
  if (!m) {
    return null;
  }
  return {
    hasCaret: m[1] === "^",
    hasGreaterEquals: m[1] === ">=",
    majorBase: m[2] === "x" ? 0 : parseInt(m[2], 10),
    majorMustEqual: m[2] === "x" ? false : true,
    minorBase: m[4] === "x" ? 0 : parseInt(m[4], 10),
    minorMustEqual: m[4] === "x" ? false : true,
    patchBase: m[6] === "x" ? 0 : parseInt(m[6], 10),
    patchMustEqual: m[6] === "x" ? false : true,
    preRelease: m[8] || null
  };
}

function normalizeVersion(version) {
  if (!version) {
    return null;
  }
  const majorBase = version.majorBase;
  const majorMustEqual = version.majorMustEqual;
  const minorBase = version.minorBase;
  let minorMustEqual = version.minorMustEqual;
  const patchBase = version.patchBase;
  let patchMustEqual = version.patchMustEqual;
  if (version.hasCaret) {
    if (majorBase === 0) {
      patchMustEqual = false;
    } else {
      minorMustEqual = false;
      patchMustEqual = false;
    }
  }
  let notBefore = 0;
  if (version.preRelease) {
    const match = NOT_BEFORE_REGEXP.exec(version.preRelease);
    if (match) {
      const [, year2, month2, day2, hours, minutes] = match;
      notBefore = Date.UTC(Number(year2), Number(month2) - 1, Number(day2), Number(hours) || 0, Number(minutes) || 0);
    }
  }
  return {
    majorBase,
    majorMustEqual,
    minorBase,
    minorMustEqual,
    patchBase,
    patchMustEqual,
    isMinimum: version.hasGreaterEquals,
    notBefore
  };
}

function isValidVersion(_inputVersion, _inputDate, _desiredVersion) {
  let version;
  if (typeof _inputVersion === "string") {
    version = normalizeVersion(parseVersion(_inputVersion));
  } else {
    version = _inputVersion;
  }
  let productTs;
  if (_inputDate instanceof Date) {
    productTs = _inputDate.getTime();
  } else if (typeof _inputDate === "string") {
    productTs = new Date(_inputDate).getTime();
  }
  let desiredVersion;
  if (typeof _desiredVersion === "string") {
    desiredVersion = normalizeVersion(parseVersion(_desiredVersion));
  } else {
    desiredVersion = _desiredVersion;
  }
  if (!version || !desiredVersion) {
    return false;
  }
  const majorBase = version.majorBase;
  const minorBase = version.minorBase;
  const patchBase = version.patchBase;
  let desiredMajorBase = desiredVersion.majorBase;
  let desiredMinorBase = desiredVersion.minorBase;
  let desiredPatchBase = desiredVersion.patchBase;
  const desiredNotBefore = desiredVersion.notBefore;
  let majorMustEqual = desiredVersion.majorMustEqual;
  let minorMustEqual = desiredVersion.minorMustEqual;
  let patchMustEqual = desiredVersion.patchMustEqual;
  if (desiredVersion.isMinimum) {
    if (majorBase > desiredMajorBase) {
      return true;
    }
    if (majorBase < desiredMajorBase) {
      return false;
    }
    if (minorBase > desiredMinorBase) {
      return true;
    }
    if (minorBase < desiredMinorBase) {
      return false;
    }
    if (productTs && productTs < desiredNotBefore) {
      return false;
    }
    return patchBase >= desiredPatchBase;
  }
  if (majorBase === 1 && desiredMajorBase === 0 && (!majorMustEqual || !minorMustEqual || !patchMustEqual)) {
    desiredMajorBase = 1;
    desiredMinorBase = 0;
    desiredPatchBase = 0;
    majorMustEqual = true;
    minorMustEqual = false;
    patchMustEqual = false;
  }
  if (majorBase < desiredMajorBase) {
    return false;
  }
  if (majorBase > desiredMajorBase) {
    return !majorMustEqual;
  }
  if (minorBase < desiredMinorBase) {
    return false;
  }
  if (minorBase > desiredMinorBase) {
    return !minorMustEqual;
  }
  if (patchBase < desiredPatchBase) {
    return false;
  }
  if (patchBase > desiredPatchBase) {
    return !patchMustEqual;
  }
  if (productTs && productTs < desiredNotBefore) {
    return false;
  }
  return true;
}

function validateExtensionManifest(productVersion, productDate, extensionLocation, extensionManifest, extensionIsBuiltin) {
  const validations = [];
  if (typeof extensionManifest.publisher !== "undefined" && typeof extensionManifest.publisher !== "string") {
    validations.push([severity_default.Error, localize(2998, null)]);
    return validations;
  }
  if (typeof extensionManifest.name !== "string") {
    validations.push([severity_default.Error, localize(2997, null, "name")]);
    return validations;
  }
  if (typeof extensionManifest.version !== "string") {
    validations.push([severity_default.Error, localize(2999, null, "version")]);
    return validations;
  }
  if (!extensionManifest.engines) {
    validations.push([severity_default.Error, localize(2990, null, "engines")]);
    return validations;
  }
  if (typeof extensionManifest.engines.vscode !== "string") {
    validations.push([severity_default.Error, localize(2991, null, "engines.vscode")]);
    return validations;
  }
  if (typeof extensionManifest.extensionDependencies !== "undefined") {
    if (!isStringArray(extensionManifest.extensionDependencies)) {
      validations.push([severity_default.Error, localize(2993, null, "extensionDependencies")]);
      return validations;
    }
  }
  if (typeof extensionManifest.extensionAffinity !== "undefined") {
    if (!isStringArray(extensionManifest.extensionAffinity)) {
      validations.push([severity_default.Error, localize(2992, null, "extensionAffinity")]);
      return validations;
    }
  }
  if (typeof extensionManifest.activationEvents !== "undefined") {
    if (!isStringArray(extensionManifest.activationEvents)) {
      validations.push([severity_default.Error, localize(2986, null, "activationEvents")]);
      return validations;
    }
    if (typeof extensionManifest.main === "undefined" && typeof extensionManifest.browser === "undefined") {
      validations.push([severity_default.Error, localize(2987, null, "activationEvents", "main", "browser")]);
      return validations;
    }
  }
  if (typeof extensionManifest.extensionKind !== "undefined") {
    if (typeof extensionManifest.main === "undefined") {
      validations.push([severity_default.Warning, localize(2994, null, "extensionKind")]);
    }
  }
  if (typeof extensionManifest.main !== "undefined") {
    if (typeof extensionManifest.main !== "string") {
      validations.push([severity_default.Error, localize(2995, null, "main")]);
      return validations;
    } else {
      const mainLocation = joinPath(extensionLocation, extensionManifest.main);
      if (!isEqualOrParent2(mainLocation, extensionLocation)) {
        validations.push([severity_default.Warning, localize(2996, null, mainLocation.path, extensionLocation.path)]);
      }
    }
  }
  if (typeof extensionManifest.browser !== "undefined") {
    if (typeof extensionManifest.browser !== "string") {
      validations.push([severity_default.Error, localize(2988, null, "browser")]);
      return validations;
    } else {
      const browserLocation = joinPath(extensionLocation, extensionManifest.browser);
      if (!isEqualOrParent2(browserLocation, extensionLocation)) {
        validations.push([severity_default.Warning, localize(2989, null, browserLocation.path, extensionLocation.path)]);
      }
    }
  }
  if (!valid(extensionManifest.version)) {
    validations.push([severity_default.Error, localize(3000, null)]);
    return validations;
  }
  const notices = [];
  const validExtensionVersion = isValidExtensionVersion(productVersion, productDate, extensionManifest, extensionIsBuiltin, notices);
  if (!validExtensionVersion) {
    for (const notice of notices) {
      validations.push([severity_default.Error, notice]);
    }
  }
  return validations;
}

function isValidExtensionVersion(productVersion, productDate, extensionManifest, extensionIsBuiltin, notices) {
  if (extensionIsBuiltin || typeof extensionManifest.main === "undefined" && typeof extensionManifest.browser === "undefined") {
    return true;
  }
  return isVersionValid(productVersion, productDate, extensionManifest.engines.vscode, notices);
}

function isEngineValid(engine, version, date) {
  return engine === "*" || isVersionValid(version, date, engine);
}

function isVersionValid(currentVersion, date, requestedVersion, notices = []) {
  const desiredVersion = normalizeVersion(parseVersion(requestedVersion));
  if (!desiredVersion) {
    notices.push(localize(3004, null, requestedVersion));
    return false;
  }
  if (desiredVersion.majorBase === 0) {
    if (!desiredVersion.majorMustEqual || !desiredVersion.minorMustEqual) {
      notices.push(localize(3002, null, requestedVersion));
      return false;
    }
  } else {
    if (!desiredVersion.majorMustEqual) {
      notices.push(localize(3003, null, requestedVersion));
      return false;
    }
  }
  if (!isValidVersion(currentVersion, date, desiredVersion)) {
    notices.push(localize(3001, null, currentVersion, requestedVersion));
    return false;
  }
  return true;
}

function isStringArray(arr) {
  if (!Array.isArray(arr)) {
    return false;
  }
  for (let i = 0, len = arr.length; i < len; i++) {
    if (typeof arr[i] !== "string") {
      return false;
    }
  }
  return true;
}
export { isValidVersionStr, parseVersion, normalizeVersion, isValidVersion, validateExtensionManifest, isValidExtensionVersion, isEngineValid, isVersionValid, isStringArray, VERSION_REGEXP, NOT_BEFORE_REGEXP };
