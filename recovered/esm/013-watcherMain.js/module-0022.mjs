// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/files/node/watcher/watcherMain.js
// Original module marker: src/vs/base/common/extpath.ts
import { join, normalize, posix, sep } from "./module-0018.mjs";
import { equalsIgnoreCase, startsWithIgnoreCase } from "./module-0021.mjs";
import { isWindows } from "./module-0013.mjs";


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

function isRootOrDriveLetter(path) {
  const pathNormalized = normalize(path);
  if (isWindows) {
    if (path.length > 3) {
      return false;
    }
    return hasDriveLetter(pathNormalized) && (path.length === 2 || pathNormalized.charCodeAt(2) === 92 /* Backslash */);
  }
  return pathNormalized === posix.sep;
}

function hasDriveLetter(path, isWindowsOS = isWindows) {
  if (isWindowsOS) {
    return isWindowsDriveLetter(path.charCodeAt(0)) && path.charCodeAt(1) === 58 /* Colon */;
  }
  return false;
}

var pathChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

var windowsSafePathFirstChars = "BDEFGHIJKMOQRSTUVWXYZbdefghijkmoqrstuvwxyz0123456789";

function randomPath(parent, prefix, randomLength = 8) {
  let suffix = "";
  for (let i = 0; i < randomLength; i++) {
    let pathCharsTouse;
    if (i === 0 && isWindows && !prefix && (randomLength === 3 || randomLength === 4)) {
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
export { isPathSeparator2, toSlashes, toPosixPath, getRoot, isEqual, isEqualOrParent, isWindowsDriveLetter, isRootOrDriveLetter, hasDriveLetter, randomPath, pathChars, windowsSafePathFirstChars };
