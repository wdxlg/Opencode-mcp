// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/extpath.ts
import { join, normalize, posix, sep } from "./module-0026.mjs";
import { isWindows } from "./module-0014.mjs";
import { equalsIgnoreCase, rtrim, startsWithIgnoreCase } from "./module-0030.mjs";
import { isNumber } from "./module-0010.mjs";


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

function getRoot(path, sep2 = posix.sep) {
  if (!path) {
    return "";
  }
  const len = path.length;
  const firstLetter = path.charCodeAt(0);
  if (isPathSeparator2(firstLetter)) {
    if (isPathSeparator2(path.charCodeAt(1))) {
      if (!isPathSeparator2(path.charCodeAt(2))) {
        let pos2 = 3;
        const start = pos2;
        for (; pos2 < len; pos2++) {
          if (isPathSeparator2(path.charCodeAt(pos2))) {
            break;
          }
        }
        if (start !== pos2 && !isPathSeparator2(path.charCodeAt(pos2 + 1))) {
          pos2 += 1;
          for (; pos2 < len; pos2++) {
            if (isPathSeparator2(path.charCodeAt(pos2))) {
              return path.slice(0, pos2 + 1).replace(/[\\/]/g, sep2);
            }
          }
        }
      }
    }
    return sep2;
  } else if (isWindowsDriveLetter(firstLetter)) {
    if (path.charCodeAt(1) === 58 /* Colon */) {
      if (isPathSeparator2(path.charCodeAt(2))) {
        return path.slice(0, 2) + sep2;
      } else {
        return path.slice(0, 2);
      }
    }
  }
  let pos = path.indexOf("://");
  if (pos !== -1) {
    pos += 3;
    for (; pos < len; pos++) {
      if (isPathSeparator2(path.charCodeAt(pos))) {
        return path.slice(0, pos + 1);
      }
    }
  }
  return "";
}

function isUNC(path) {
  if (!isWindows) {
    return false;
  }
  if (!path || path.length < 5) {
    return false;
  }
  let code = path.charCodeAt(0);
  if (code !== 92 /* Backslash */) {
    return false;
  }
  code = path.charCodeAt(1);
  if (code !== 92 /* Backslash */) {
    return false;
  }
  let pos = 2;
  const start = pos;
  for (; pos < path.length; pos++) {
    code = path.charCodeAt(pos);
    if (code === 92 /* Backslash */) {
      break;
    }
  }
  if (start === pos) {
    return false;
  }
  code = path.charCodeAt(pos + 1);
  if (isNaN(code) || code === 92 /* Backslash */) {
    return false;
  }
  return true;
}

var WINDOWS_INVALID_FILE_CHARS = /[\\/:\*\?"<>\|]/g;

var UNIX_INVALID_FILE_CHARS = /[/]/g;

var WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])(\.(.*?))?$/i;

function isValidBasename(name, isWindowsOS = isWindows) {
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
  const separator2 = forcePosixSemantics ? posix.sep : sep;
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
    if (parentCandidate.charAt(parentCandidate.length - 1) === separator2) {
      sepOffset--;
    }
    return base.charAt(sepOffset) === separator2;
  }
  if (parentCandidate.charAt(parentCandidate.length - 1) !== separator2) {
    parentCandidate += separator2;
  }
  return base.indexOf(parentCandidate) === 0;
}

function isWindowsDriveLetter(char0) {
  return char0 >= 65 /* A */ && char0 <= 90 /* Z */ || char0 >= 97 /* a */ && char0 <= 122 /* z */;
}

function removeTrailingPathSeparator(candidate) {
  if (isWindows) {
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

function hasDriveLetter(path, isWindowsOS = isWindows) {
  if (isWindowsOS) {
    return isWindowsDriveLetter(path.charCodeAt(0)) && path.charCodeAt(1) === 58 /* Colon */;
  }
  return false;
}

function getDriveLetter(path, isWindowsOS = isWindows) {
  return hasDriveLetter(path, isWindowsOS) ? path[0] : void 0;
}

function indexOfPath(path, candidate, ignoreCase) {
  if (candidate.length > path.length) {
    return -1;
  }
  if (path === candidate) {
    return 0;
  }
  if (ignoreCase) {
    path = path.toLowerCase();
    candidate = candidate.toLowerCase();
  }
  return path.indexOf(candidate);
}

function parseLineAndColumnAware(rawPath) {
  const segments = rawPath.split(":");
  let path;
  let line;
  let column;
  for (const segment of segments) {
    const segmentAsNumber = Number(segment);
    if (!isNumber(segmentAsNumber)) {
      path = path ? [path, segment].join(":") : segment;
    } else if (line === void 0) {
      line = segmentAsNumber;
    } else if (column === void 0) {
      column = segmentAsNumber;
    }
  }
  if (!path) {
    throw new Error("Format for `--goto` should be: `FILE:LINE(:COLUMN)`");
  }
  return {
    path,
    line: line !== void 0 ? line : void 0,
    column: column !== void 0 ? column : line !== void 0 ? 1 : void 0
    // if we have a line, make sure column is also set
  };
}

var pathChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

var windowsSafePathFirstChars = "BDEFGHIJKMOQRSTUVWXYZbdefghijkmoqrstuvwxyz0123456789";

function randomPath(parent, prefix, randomLength = 8) {
  let suffix = "";
  for (let i2 = 0; i2 < randomLength; i2++) {
    let pathCharsTouse;
    if (i2 === 0 && isWindows && !prefix && (randomLength === 3 || randomLength === 4)) {
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
    return join(parent, randomFileName);
  }
  return randomFileName;
}
export { isPathSeparator2, toSlashes, toPosixPath, getRoot, isUNC, isValidBasename, isEqual, isEqualOrParent, isWindowsDriveLetter, removeTrailingPathSeparator, hasDriveLetter, getDriveLetter, indexOfPath, parseLineAndColumnAware, randomPath, WINDOWS_INVALID_FILE_CHARS, UNIX_INVALID_FILE_CHARS, WINDOWS_FORBIDDEN_NAMES, pathChars, windowsSafePathFirstChars };
