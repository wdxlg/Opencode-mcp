// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/extpath.ts
import { normalize, posix, sep } from "./module-0022.mjs";
import { isWindows } from "./module-0016.mjs";
import { startsWithIgnoreCase } from "./module-0029.mjs";


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

var WINDOWS_INVALID_FILE_CHARS = /[\\/:\*\?"<>\|]/g;

var UNIX_INVALID_FILE_CHARS = /[/]/g;

var WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])(\.(.*?))?$/i;

function isValidBasename(name2, isWindowsOS = isWindows) {
  const invalidFileChars = isWindowsOS ? WINDOWS_INVALID_FILE_CHARS : UNIX_INVALID_FILE_CHARS;
  if (!name2 || name2.length === 0 || /^\s+$/.test(name2)) {
    return false;
  }
  invalidFileChars.lastIndex = 0;
  if (invalidFileChars.test(name2)) {
    return false;
  }
  if (isWindowsOS && WINDOWS_FORBIDDEN_NAMES.test(name2)) {
    return false;
  }
  if (name2 === "." || name2 === "..") {
    return false;
  }
  if (isWindowsOS && name2[name2.length - 1] === ".") {
    return false;
  }
  if (isWindowsOS && name2.length !== name2.trim().length) {
    return false;
  }
  if (name2.length > 255) {
    return false;
  }
  return true;
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

function hasDriveLetter(path, isWindowsOS = isWindows) {
  if (isWindowsOS) {
    return isWindowsDriveLetter(path.charCodeAt(0)) && path.charCodeAt(1) === 58 /* Colon */;
  }
  return false;
}
export { isPathSeparator2, toSlashes, toPosixPath, getRoot, isValidBasename, isEqualOrParent, isWindowsDriveLetter, hasDriveLetter, WINDOWS_INVALID_FILE_CHARS, UNIX_INVALID_FILE_CHARS, WINDOWS_FORBIDDEN_NAMES };
