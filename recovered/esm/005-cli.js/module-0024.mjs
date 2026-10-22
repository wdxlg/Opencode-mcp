// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/extpath.ts
import { init_path, join3, normalize, posix, sep } from "./module-0004.mjs";
import { init_platform, isWindows2 } from "./module-0002.mjs";
import { equalsIgnoreCase, init_strings, startsWithIgnoreCase } from "./module-0023.mjs";
import { __esm } from "./module-0000.mjs";
import { init_charCode } from "./module-0019.mjs";
import { init_types } from "./module-0012.mjs";


// src/vs/base/common/extpath.ts
function isPathSeparator2(code) {
  return code === 47 /* Slash */ || code === 92 /* Backslash */;
}

function toSlashes(osPath) {
  return osPath.replace(/[\\/]/g, posix.sep);
}

function toPosixPath(osPath) {
  if (osPath.indexOf("/") === -1) {
    osPath = toSlashes(osPath);
  }
  if (/^[a-zA-Z]:(\/|$)/.test(osPath)) {
    osPath = "/" + osPath;
  }
  return osPath;
}

function getRoot(path3, sep2 = posix.sep) {
  if (!path3) {
    return "";
  }
  const len = path3.length;
  const firstLetter = path3.charCodeAt(0);
  if (isPathSeparator2(firstLetter)) {
    if (isPathSeparator2(path3.charCodeAt(1))) {
      if (!isPathSeparator2(path3.charCodeAt(2))) {
        let pos2 = 3;
        const start = pos2;
        for (; pos2 < len; pos2++) {
          if (isPathSeparator2(path3.charCodeAt(pos2))) {
            break;
          }
        }
        if (start !== pos2 && !isPathSeparator2(path3.charCodeAt(pos2 + 1))) {
          pos2 += 1;
          for (; pos2 < len; pos2++) {
            if (isPathSeparator2(path3.charCodeAt(pos2))) {
              return path3.slice(0, pos2 + 1).replace(/[\\/]/g, sep2);
            }
          }
        }
      }
    }
    return sep2;
  } else if (isWindowsDriveLetter(firstLetter)) {
    if (path3.charCodeAt(1) === 58 /* Colon */) {
      if (isPathSeparator2(path3.charCodeAt(2))) {
        return path3.slice(0, 2) + sep2;
      } else {
        return path3.slice(0, 2);
      }
    }
  }
  let pos = path3.indexOf("://");
  if (pos !== -1) {
    pos += 3;
    for (; pos < len; pos++) {
      if (isPathSeparator2(path3.charCodeAt(pos))) {
        return path3.slice(0, pos + 1);
      }
    }
  }
  return "";
}

function isUNC(path3) {
  if (!isWindows2) {
    return false;
  }
  if (!path3 || path3.length < 5) {
    return false;
  }
  let code = path3.charCodeAt(0);
  if (code !== 92 /* Backslash */) {
    return false;
  }
  code = path3.charCodeAt(1);
  if (code !== 92 /* Backslash */) {
    return false;
  }
  let pos = 2;
  const start = pos;
  for (; pos < path3.length; pos++) {
    code = path3.charCodeAt(pos);
    if (code === 92 /* Backslash */) {
      break;
    }
  }
  if (start === pos) {
    return false;
  }
  code = path3.charCodeAt(pos + 1);
  if (isNaN(code) || code === 92 /* Backslash */) {
    return false;
  }
  return true;
}

function isEqual(pathA, pathB, ignoreCase) {
  const identityEquals = pathA === pathB;
  if (!ignoreCase || identityEquals) {
    return identityEquals;
  }
  if (!pathA || !pathB) {
    return false;
  }
  return equalsIgnoreCase(pathA, pathB);
}

function isEqualOrParent(base, parentCandidate, ignoreCase, forcePosixSemantics = false) {
  const separator = forcePosixSemantics ? posix.sep : sep;
  if (base === parentCandidate) {
    return true;
  }
  if (!base || !parentCandidate) {
    return false;
  }
  if (base.indexOf("..") >= 0 || parentCandidate.indexOf("..") >= 0) {
    base = forcePosixSemantics ? posix.normalize(base) : normalize(base);
    parentCandidate = forcePosixSemantics ? posix.normalize(parentCandidate) : normalize(parentCandidate);
  }
  if (parentCandidate.length > base.length) {
    return false;
  }
  if (ignoreCase) {
    const beginsWith = startsWithIgnoreCase(base, parentCandidate);
    if (!beginsWith) {
      return false;
    }
    if (parentCandidate.length === base.length) {
      return true;
    }
    let sepOffset = parentCandidate.length;
    if (parentCandidate.charAt(parentCandidate.length - 1) === separator) {
      sepOffset--;
    }
    return base.charAt(sepOffset) === separator;
  }
  if (parentCandidate.charAt(parentCandidate.length - 1) !== separator) {
    parentCandidate += separator;
  }
  return base.indexOf(parentCandidate) === 0;
}

function isWindowsDriveLetter(char0) {
  return char0 >= 65 /* A */ && char0 <= 90 /* Z */ || char0 >= 97 /* a */ && char0 <= 122 /* z */;
}

function isRootOrDriveLetter(path3) {
  const pathNormalized = normalize(path3);
  if (isWindows2) {
    if (path3.length > 3) {
      return false;
    }
    return hasDriveLetter(pathNormalized) && (path3.length === 2 || pathNormalized.charCodeAt(2) === 92 /* Backslash */);
  }
  return pathNormalized === posix.sep;
}

function hasDriveLetter(path3, isWindowsOS = isWindows2) {
  if (isWindowsOS) {
    return isWindowsDriveLetter(path3.charCodeAt(0)) && path3.charCodeAt(1) === 58 /* Colon */;
  }
  return false;
}

function randomPath(parent, prefix, randomLength = 8) {
  let suffix = "";
  for (let i = 0; i < randomLength; i++) {
    let pathCharsTouse;
    if (i === 0 && isWindows2 && !prefix && (randomLength === 3 || randomLength === 4)) {
      pathCharsTouse = windowsSafePathFirstChars;
    } else {
      pathCharsTouse = pathChars;
    }
    suffix += pathCharsTouse.charAt(Math.floor(Math.random() * pathCharsTouse.length));
  }
  let randomFileName;
  if (prefix) {
    randomFileName = `${prefix}-${suffix}`;
  } else {
    randomFileName = suffix;
  }
  if (parent) {
    return join3(parent, randomFileName);
  }
  return randomFileName;
}

var pathChars, windowsSafePathFirstChars;

var init_extpath = __esm({
  "src/vs/base/common/extpath.ts"() {
    init_charCode();
    init_path();
    init_platform();
    init_strings();
    init_types();
    pathChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    windowsSafePathFirstChars = "BDEFGHIJKMOQRSTUVWXYZbdefghijkmoqrstuvwxyz0123456789";
  }
});
export { isPathSeparator2, toSlashes, toPosixPath, getRoot, isUNC, isEqual, isEqualOrParent, isWindowsDriveLetter, isRootOrDriveLetter, hasDriveLetter, randomPath, pathChars, windowsSafePathFirstChars, init_extpath };
