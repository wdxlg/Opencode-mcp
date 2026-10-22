// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/extpath.ts
import { init_path, isAbsolute2, join4, normalize, posix, sep } from "./module-0008.mjs";
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { equalsIgnoreCase, init_strings, rtrim, startsWithIgnoreCase } from "./module-0027.mjs";
import { init_types, isNumber } from "./module-0016.mjs";
import { __esm } from "./module-0000.mjs";
import { init_charCode } from "./module-0023.mjs";


// src/vs/base/common/extpath.ts
function isPathSeparator2(code2) {
  return code2 === 47 /* Slash */ || code2 === 92 /* Backslash */;
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

function getRoot(path4, sep2 = posix.sep) {
  if (!path4) {
    return "";
  }
  const len = path4.length;
  const firstLetter = path4.charCodeAt(0);
  if (isPathSeparator2(firstLetter)) {
    if (isPathSeparator2(path4.charCodeAt(1))) {
      if (!isPathSeparator2(path4.charCodeAt(2))) {
        let pos2 = 3;
        const start = pos2;
        for (; pos2 < len; pos2++) {
          if (isPathSeparator2(path4.charCodeAt(pos2))) {
            break;
          }
        }
        if (start !== pos2 && !isPathSeparator2(path4.charCodeAt(pos2 + 1))) {
          pos2 += 1;
          for (; pos2 < len; pos2++) {
            if (isPathSeparator2(path4.charCodeAt(pos2))) {
              return path4.slice(0, pos2 + 1).replace(/[\\/]/g, sep2);
            }
          }
        }
      }
    }
    return sep2;
  } else if (isWindowsDriveLetter(firstLetter)) {
    if (path4.charCodeAt(1) === 58 /* Colon */) {
      if (isPathSeparator2(path4.charCodeAt(2))) {
        return path4.slice(0, 2) + sep2;
      } else {
        return path4.slice(0, 2);
      }
    }
  }
  let pos = path4.indexOf("://");
  if (pos !== -1) {
    pos += 3;
    for (; pos < len; pos++) {
      if (isPathSeparator2(path4.charCodeAt(pos))) {
        return path4.slice(0, pos + 1);
      }
    }
  }
  return "";
}

function isUNC(path4) {
  if (!isWindows2) {
    return false;
  }
  if (!path4 || path4.length < 5) {
    return false;
  }
  let code2 = path4.charCodeAt(0);
  if (code2 !== 92 /* Backslash */) {
    return false;
  }
  code2 = path4.charCodeAt(1);
  if (code2 !== 92 /* Backslash */) {
    return false;
  }
  let pos = 2;
  const start = pos;
  for (; pos < path4.length; pos++) {
    code2 = path4.charCodeAt(pos);
    if (code2 === 92 /* Backslash */) {
      break;
    }
  }
  if (start === pos) {
    return false;
  }
  code2 = path4.charCodeAt(pos + 1);
  if (isNaN(code2) || code2 === 92 /* Backslash */) {
    return false;
  }
  return true;
}

function isValidBasename(name, isWindowsOS = isWindows2) {
  const invalidFileChars = isWindowsOS ? WINDOWS_INVALID_FILE_CHARS : UNIX_INVALID_FILE_CHARS;
  if (!name || name.length === 0 || /^\s+$/.test(name)) {
    return false;
  }
  invalidFileChars.lastIndex = 0;
  if (invalidFileChars.test(name)) {
    return false;
  }
  if (isWindowsOS && WINDOWS_FORBIDDEN_NAMES.test(name)) {
    return false;
  }
  if (name === "." || name === "..") {
    return false;
  }
  if (isWindowsOS && name[name.length - 1] === ".") {
    return false;
  }
  if (isWindowsOS && name.length !== name.trim().length) {
    return false;
  }
  if (name.length > 255) {
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

function sanitizeFilePath(candidate, cwd3) {
  if (isWindows2 && candidate.endsWith(":")) {
    candidate += sep;
  }
  if (!isAbsolute2(candidate)) {
    candidate = join4(cwd3, candidate);
  }
  candidate = normalize(candidate);
  return removeTrailingPathSeparator(candidate);
}

function removeTrailingPathSeparator(candidate) {
  if (isWindows2) {
    candidate = rtrim(candidate, sep);
    if (candidate.endsWith(":")) {
      candidate += sep;
    }
  } else {
    candidate = rtrim(candidate, sep);
    if (!candidate) {
      candidate = sep;
    }
  }
  return candidate;
}

function isRootOrDriveLetter(path4) {
  const pathNormalized = normalize(path4);
  if (isWindows2) {
    if (path4.length > 3) {
      return false;
    }
    return hasDriveLetter(pathNormalized) && (path4.length === 2 || pathNormalized.charCodeAt(2) === 92 /* Backslash */);
  }
  return pathNormalized === posix.sep;
}

function hasDriveLetter(path4, isWindowsOS = isWindows2) {
  if (isWindowsOS) {
    return isWindowsDriveLetter(path4.charCodeAt(0)) && path4.charCodeAt(1) === 58 /* Colon */;
  }
  return false;
}

function parseLineAndColumnAware(rawPath) {
  const segments = rawPath.split(":");
  let path4;
  let line;
  let column;
  for (const segment of segments) {
    const segmentAsNumber = Number(segment);
    if (!isNumber(segmentAsNumber)) {
      path4 = path4 ? [path4, segment].join(":") : segment;
    } else if (line === void 0) {
      line = segmentAsNumber;
    } else if (column === void 0) {
      column = segmentAsNumber;
    }
  }
  if (!path4) {
    throw new Error("Format for `--goto` should be: `FILE:LINE(:COLUMN)`");
  }
  return {
    path: path4,
    line: line !== void 0 ? line : void 0,
    column: column !== void 0 ? column : line !== void 0 ? 1 : void 0
    // if we have a line, make sure column is also set
  };
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
    return join4(parent, randomFileName);
  }
  return randomFileName;
}

var WINDOWS_INVALID_FILE_CHARS, UNIX_INVALID_FILE_CHARS, WINDOWS_FORBIDDEN_NAMES, pathChars, windowsSafePathFirstChars;

var init_extpath = __esm({
  "src/vs/base/common/extpath.ts"() {
    init_charCode();
    init_path();
    init_platform();
    init_strings();
    init_types();
    WINDOWS_INVALID_FILE_CHARS = /[\\/:\*\?"<>\|]/g;
    UNIX_INVALID_FILE_CHARS = /[/]/g;
    WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])(\.(.*?))?$/i;
    pathChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    windowsSafePathFirstChars = "BDEFGHIJKMOQRSTUVWXYZbdefghijkmoqrstuvwxyz0123456789";
  }
});
export { isPathSeparator2, toSlashes, toPosixPath, getRoot, isUNC, isValidBasename, isEqual, isEqualOrParent, isWindowsDriveLetter, sanitizeFilePath, removeTrailingPathSeparator, isRootOrDriveLetter, hasDriveLetter, parseLineAndColumnAware, randomPath, WINDOWS_INVALID_FILE_CHARS, UNIX_INVALID_FILE_CHARS, WINDOWS_FORBIDDEN_NAMES, pathChars, windowsSafePathFirstChars, init_extpath };
