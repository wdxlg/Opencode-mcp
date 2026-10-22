// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/path.ts
import { __esm } from "./module-0000.mjs";
import { cwd2, env, init_process, platform2 } from "./module-0007.mjs";


// src/vs/base/common/path.ts
function validateObject(pathObject, name) {
  if (pathObject === null || typeof pathObject !== "object") {
    throw new ErrorInvalidArgType(name, "Object", pathObject);
  }
}

function validateString(value, name) {
  if (typeof value !== "string") {
    throw new ErrorInvalidArgType(name, "string", value);
  }
}

function isPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH || code2 === CHAR_BACKWARD_SLASH;
}

function isPosixPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH;
}

function isWindowsDeviceRoot(code2) {
  return code2 >= CHAR_UPPERCASE_A && code2 <= CHAR_UPPERCASE_Z || code2 >= CHAR_LOWERCASE_A && code2 <= CHAR_LOWERCASE_Z;
}

function normalizeString(path4, allowAboveRoot, separator, isPathSeparator3) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code2 = 0;
  for (let i = 0; i <= path4.length; ++i) {
    if (i < path4.length) {
      code2 = path4.charCodeAt(i);
    } else if (isPathSeparator3(code2)) {
      break;
    } else {
      code2 = CHAR_FORWARD_SLASH;
    }
    if (isPathSeparator3(code2)) {
      if (lastSlash === i - 1 || dots === 1) {
      } else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? `${separator}..` : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `${separator}${path4.slice(lastSlash + 1, i)}`;
        } else {
          res = path4.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code2 === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function formatExt(ext) {
  return ext ? `${ext[0] === "." ? "" : "."}${ext}` : "";
}

function _format2(sep2, pathObject) {
  validateObject(pathObject, "pathObject");
  const dir = pathObject.dir || pathObject.root;
  const base = pathObject.base || `${pathObject.name || ""}${formatExt(pathObject.ext)}`;
  if (!dir) {
    return base;
  }
  return dir === pathObject.root ? `${dir}${base}` : `${dir}${sep2}${base}`;
}

var CHAR_UPPERCASE_A, CHAR_LOWERCASE_A, CHAR_UPPERCASE_Z, CHAR_LOWERCASE_Z, CHAR_DOT, CHAR_FORWARD_SLASH, CHAR_BACKWARD_SLASH, CHAR_COLON, CHAR_QUESTION_MARK, ErrorInvalidArgType, platformIsWin32, win32, posixCwd, posix, normalize, isAbsolute2, join4, resolve2, relative2, dirname3, basename, extname, format, parse2, toNamespacedPath, sep, delimiter;

var init_path = __esm({
  "src/vs/base/common/path.ts"() {
    init_process();
    CHAR_UPPERCASE_A = 65;
    CHAR_LOWERCASE_A = 97;
    CHAR_UPPERCASE_Z = 90;
    CHAR_LOWERCASE_Z = 122;
    CHAR_DOT = 46;
    CHAR_FORWARD_SLASH = 47;
    CHAR_BACKWARD_SLASH = 92;
    CHAR_COLON = 58;
    CHAR_QUESTION_MARK = 63;
    ErrorInvalidArgType = class extends Error {
      constructor(name, expected, actual) {
        let determiner;
        if (typeof expected === "string" && expected.indexOf("not ") === 0) {
          determiner = "must not be";
          expected = expected.replace(/^not /, "");
        } else {
          determiner = "must be";
        }
        const type3 = name.indexOf(".") !== -1 ? "property" : "argument";
        let msg = `The "${name}" ${type3} ${determiner} of type ${expected}`;
        msg += `. Received type ${typeof actual}`;
        super(msg);
        this.code = "ERR_INVALID_ARG_TYPE";
      }
    };
    platformIsWin32 = platform2 === "win32";
    win32 = {
      // path.resolve([from ...], to)
      resolve(...pathSegments) {
        let resolvedDevice = "";
        let resolvedTail = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1; i--) {
          let path4;
          if (i >= 0) {
            path4 = pathSegments[i];
            validateString(path4, `paths[${i}]`);
            if (path4.length === 0) {
              continue;
            }
          } else if (resolvedDevice.length === 0) {
            path4 = cwd2();
          } else {
            path4 = env[`=${resolvedDevice}`] || cwd2();
            if (path4 === void 0 || path4.slice(0, 2).toLowerCase() !== resolvedDevice.toLowerCase() && path4.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
              path4 = `${resolvedDevice}\\`;
            }
          }
          const len = path4.length;
          let rootEnd = 0;
          let device = "";
          let isAbsolute5 = false;
          const code2 = path4.charCodeAt(0);
          if (len === 1) {
            if (isPathSeparator(code2)) {
              rootEnd = 1;
              isAbsolute5 = true;
            }
          } else if (isPathSeparator(code2)) {
            isAbsolute5 = true;
            if (isPathSeparator(path4.charCodeAt(1))) {
              let j = 2;
              let last = j;
              while (j < len && !isPathSeparator(path4.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                const firstPart = path4.slice(last, j);
                last = j;
                while (j < len && isPathSeparator(path4.charCodeAt(j))) {
                  j++;
                }
                if (j < len && j !== last) {
                  last = j;
                  while (j < len && !isPathSeparator(path4.charCodeAt(j))) {
                    j++;
                  }
                  if (j === len || j !== last) {
                    device = `\\\\${firstPart}\\${path4.slice(last, j)}`;
                    rootEnd = j;
                  }
                }
              }
            } else {
              rootEnd = 1;
            }
          } else if (isWindowsDeviceRoot(code2) && path4.charCodeAt(1) === CHAR_COLON) {
            device = path4.slice(0, 2);
            rootEnd = 2;
            if (len > 2 && isPathSeparator(path4.charCodeAt(2))) {
              isAbsolute5 = true;
              rootEnd = 3;
            }
          }
          if (device.length > 0) {
            if (resolvedDevice.length > 0) {
              if (device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                continue;
              }
            } else {
              resolvedDevice = device;
            }
          }
          if (resolvedAbsolute) {
            if (resolvedDevice.length > 0) {
              break;
            }
          } else {
            resolvedTail = `${path4.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute5;
            if (isAbsolute5 && resolvedDevice.length > 0) {
              break;
            }
          }
        }
        resolvedTail = normalizeString(
          resolvedTail,
          !resolvedAbsolute,
          "\\",
          isPathSeparator
        );
        return resolvedAbsolute ? `${resolvedDevice}\\${resolvedTail}` : `${resolvedDevice}${resolvedTail}` || ".";
      },
      normalize(path4) {
        validateString(path4, "path");
        const len = path4.length;
        if (len === 0) {
          return ".";
        }
        let rootEnd = 0;
        let device;
        let isAbsolute5 = false;
        const code2 = path4.charCodeAt(0);
        if (len === 1) {
          return isPosixPathSeparator(code2) ? "\\" : path4;
        }
        if (isPathSeparator(code2)) {
          isAbsolute5 = true;
          if (isPathSeparator(path4.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path4.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              const firstPart = path4.slice(last, j);
              last = j;
              while (j < len && isPathSeparator(path4.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path4.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  return `\\\\${firstPart}\\${path4.slice(last)}\\`;
                }
                if (j !== last) {
                  device = `\\\\${firstPart}\\${path4.slice(last, j)}`;
                  rootEnd = j;
                }
              }
            }
          } else {
            rootEnd = 1;
          }
        } else if (isWindowsDeviceRoot(code2) && path4.charCodeAt(1) === CHAR_COLON) {
          device = path4.slice(0, 2);
          rootEnd = 2;
          if (len > 2 && isPathSeparator(path4.charCodeAt(2))) {
            isAbsolute5 = true;
            rootEnd = 3;
          }
        }
        let tail = rootEnd < len ? normalizeString(path4.slice(rootEnd), !isAbsolute5, "\\", isPathSeparator) : "";
        if (tail.length === 0 && !isAbsolute5) {
          tail = ".";
        }
        if (tail.length > 0 && isPathSeparator(path4.charCodeAt(len - 1))) {
          tail += "\\";
        }
        if (!isAbsolute5 && device === void 0 && path4.includes(":")) {
          if (tail.length >= 2 && isWindowsDeviceRoot(tail.charCodeAt(0)) && tail.charCodeAt(1) === CHAR_COLON) {
            return `.\\${tail}`;
          }
          let index = path4.indexOf(":");
          do {
            if (index === len - 1 || isPathSeparator(path4.charCodeAt(index + 1))) {
              return `.\\${tail}`;
            }
          } while ((index = path4.indexOf(":", index + 1)) !== -1);
        }
        if (device === void 0) {
          return isAbsolute5 ? `\\${tail}` : tail;
        }
        return isAbsolute5 ? `${device}\\${tail}` : `${device}${tail}`;
      },
      isAbsolute(path4) {
        validateString(path4, "path");
        const len = path4.length;
        if (len === 0) {
          return false;
        }
        const code2 = path4.charCodeAt(0);
        return isPathSeparator(code2) || // Possible device root
        len > 2 && isWindowsDeviceRoot(code2) && path4.charCodeAt(1) === CHAR_COLON && isPathSeparator(path4.charCodeAt(2));
      },
      join(...paths) {
        if (paths.length === 0) {
          return ".";
        }
        let joined;
        let firstPart;
        for (let i = 0; i < paths.length; ++i) {
          const arg = paths[i];
          validateString(arg, "path");
          if (arg.length > 0) {
            if (joined === void 0) {
              joined = firstPart = arg;
            } else {
              joined += `\\${arg}`;
            }
          }
        }
        if (joined === void 0) {
          return ".";
        }
        let needsReplace = true;
        let slashCount = 0;
        if (typeof firstPart === "string" && isPathSeparator(firstPart.charCodeAt(0))) {
          ++slashCount;
          const firstLen = firstPart.length;
          if (firstLen > 1 && isPathSeparator(firstPart.charCodeAt(1))) {
            ++slashCount;
            if (firstLen > 2) {
              if (isPathSeparator(firstPart.charCodeAt(2))) {
                ++slashCount;
              } else {
                needsReplace = false;
              }
            }
          }
        }
        if (needsReplace) {
          while (slashCount < joined.length && isPathSeparator(joined.charCodeAt(slashCount))) {
            slashCount++;
          }
          if (slashCount >= 2) {
            joined = `\\${joined.slice(slashCount)}`;
          }
        }
        return win32.normalize(joined);
      },
      // It will solve the relative path from `from` to `to`, for instance:
      //  from = 'C:\\orandea\\test\\aaa'
      //  to = 'C:\\orandea\\impl\\bbb'
      // The output of the function should be: '..\\..\\impl\\bbb'
      relative(from, to) {
        validateString(from, "from");
        validateString(to, "to");
        if (from === to) {
          return "";
        }
        const fromOrig = win32.resolve(from);
        const toOrig = win32.resolve(to);
        if (fromOrig === toOrig) {
          return "";
        }
        from = fromOrig.toLowerCase();
        to = toOrig.toLowerCase();
        if (from === to) {
          return "";
        }
        if (fromOrig.length !== from.length || toOrig.length !== to.length) {
          const fromSplit = fromOrig.split("\\");
          const toSplit = toOrig.split("\\");
          if (fromSplit[fromSplit.length - 1] === "") {
            fromSplit.pop();
          }
          if (toSplit[toSplit.length - 1] === "") {
            toSplit.pop();
          }
          const fromLen2 = fromSplit.length;
          const toLen2 = toSplit.length;
          const length2 = fromLen2 < toLen2 ? fromLen2 : toLen2;
          let i2;
          for (i2 = 0; i2 < length2; i2++) {
            if (fromSplit[i2].toLowerCase() !== toSplit[i2].toLowerCase()) {
              break;
            }
          }
          if (i2 === 0) {
            return toOrig;
          } else if (i2 === length2) {
            if (toLen2 > length2) {
              return toSplit.slice(i2).join("\\");
            }
            if (fromLen2 > length2) {
              return "..\\".repeat(fromLen2 - 1 - i2) + "..";
            }
            return "";
          }
          return "..\\".repeat(fromLen2 - i2) + toSplit.slice(i2).join("\\");
        }
        let fromStart = 0;
        while (fromStart < from.length && from.charCodeAt(fromStart) === CHAR_BACKWARD_SLASH) {
          fromStart++;
        }
        let fromEnd = from.length;
        while (fromEnd - 1 > fromStart && from.charCodeAt(fromEnd - 1) === CHAR_BACKWARD_SLASH) {
          fromEnd--;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 0;
        while (toStart < to.length && to.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
          toStart++;
        }
        let toEnd = to.length;
        while (toEnd - 1 > toStart && to.charCodeAt(toEnd - 1) === CHAR_BACKWARD_SLASH) {
          toEnd--;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i < length; i++) {
          const fromCode = from.charCodeAt(fromStart + i);
          if (fromCode !== to.charCodeAt(toStart + i)) {
            break;
          } else if (fromCode === CHAR_BACKWARD_SLASH) {
            lastCommonSep = i;
          }
        }
        if (i !== length) {
          if (lastCommonSep === -1) {
            return toOrig;
          }
        } else {
          if (toLen > length) {
            if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
              return toOrig.slice(toStart + i + 1);
            }
            if (i === 2) {
              return toOrig.slice(toStart + i);
            }
          }
          if (fromLen > length) {
            if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
              lastCommonSep = i;
            } else if (i === 2) {
              lastCommonSep = 3;
            }
          }
          if (lastCommonSep === -1) {
            lastCommonSep = 0;
          }
        }
        let out = "";
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
          if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
            out += out.length === 0 ? ".." : "\\..";
          }
        }
        toStart += lastCommonSep;
        if (out.length > 0) {
          return `${out}${toOrig.slice(toStart, toEnd)}`;
        }
        if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
          ++toStart;
        }
        return toOrig.slice(toStart, toEnd);
      },
      toNamespacedPath(path4) {
        if (typeof path4 !== "string" || path4.length === 0) {
          return path4;
        }
        const resolvedPath = win32.resolve(path4);
        if (resolvedPath.length <= 2) {
          return path4;
        }
        if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
          if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
            const code2 = resolvedPath.charCodeAt(2);
            if (code2 !== CHAR_QUESTION_MARK && code2 !== CHAR_DOT) {
              return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
            }
          }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0)) && resolvedPath.charCodeAt(1) === CHAR_COLON && resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
          return `\\\\?\\${resolvedPath}`;
        }
        return resolvedPath;
      },
      dirname(path4) {
        validateString(path4, "path");
        const len = path4.length;
        if (len === 0) {
          return ".";
        }
        let rootEnd = -1;
        let offset = 0;
        const code2 = path4.charCodeAt(0);
        if (len === 1) {
          return isPathSeparator(code2) ? path4 : ".";
        }
        if (isPathSeparator(code2)) {
          rootEnd = offset = 1;
          if (isPathSeparator(path4.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path4.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && isPathSeparator(path4.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path4.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  return path4;
                }
                if (j !== last) {
                  rootEnd = offset = j + 1;
                }
              }
            }
          }
        } else if (isWindowsDeviceRoot(code2) && path4.charCodeAt(1) === CHAR_COLON) {
          rootEnd = len > 2 && isPathSeparator(path4.charCodeAt(2)) ? 3 : 2;
          offset = rootEnd;
        }
        let end = -1;
        let matchedSlash = true;
        for (let i = len - 1; i >= offset; --i) {
          if (isPathSeparator(path4.charCodeAt(i))) {
            if (!matchedSlash) {
              end = i;
              break;
            }
          } else {
            matchedSlash = false;
          }
        }
        if (end === -1) {
          if (rootEnd === -1) {
            return ".";
          }
          end = rootEnd;
        }
        return path4.slice(0, end);
      },
      basename(path4, suffix) {
        if (suffix !== void 0) {
          validateString(suffix, "suffix");
        }
        validateString(path4, "path");
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (path4.length >= 2 && isWindowsDeviceRoot(path4.charCodeAt(0)) && path4.charCodeAt(1) === CHAR_COLON) {
          start = 2;
        }
        if (suffix !== void 0 && suffix.length > 0 && suffix.length <= path4.length) {
          if (suffix === path4) {
            return "";
          }
          let extIdx = suffix.length - 1;
          let firstNonSlashEnd = -1;
          for (i = path4.length - 1; i >= start; --i) {
            const code2 = path4.charCodeAt(i);
            if (isPathSeparator(code2)) {
              if (!matchedSlash) {
                start = i + 1;
                break;
              }
            } else {
              if (firstNonSlashEnd === -1) {
                matchedSlash = false;
                firstNonSlashEnd = i + 1;
              }
              if (extIdx >= 0) {
                if (code2 === suffix.charCodeAt(extIdx)) {
                  if (--extIdx === -1) {
                    end = i;
                  }
                } else {
                  extIdx = -1;
                  end = firstNonSlashEnd;
                }
              }
            }
          }
          if (start === end) {
            end = firstNonSlashEnd;
          } else if (end === -1) {
            end = path4.length;
          }
          return path4.slice(start, end);
        }
        for (i = path4.length - 1; i >= start; --i) {
          if (isPathSeparator(path4.charCodeAt(i))) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
        }
        if (end === -1) {
          return "";
        }
        return path4.slice(start, end);
      },
      extname(path4) {
        validateString(path4, "path");
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        if (path4.length >= 2 && path4.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path4.charCodeAt(0))) {
          start = startPart = 2;
        }
        for (let i = path4.length - 1; i >= start; --i) {
          const code2 = path4.charCodeAt(i);
          if (isPathSeparator(code2)) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code2 === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
        preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          return "";
        }
        return path4.slice(startDot, end);
      },
      format: _format2.bind(null, "\\"),
      parse(path4) {
        validateString(path4, "path");
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path4.length === 0) {
          return ret;
        }
        const len = path4.length;
        let rootEnd = 0;
        let code2 = path4.charCodeAt(0);
        if (len === 1) {
          if (isPathSeparator(code2)) {
            ret.root = ret.dir = path4;
            return ret;
          }
          ret.base = ret.name = path4;
          return ret;
        }
        if (isPathSeparator(code2)) {
          rootEnd = 1;
          if (isPathSeparator(path4.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path4.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && isPathSeparator(path4.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path4.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  rootEnd = j;
                } else if (j !== last) {
                  rootEnd = j + 1;
                }
              }
            }
          }
        } else if (isWindowsDeviceRoot(code2) && path4.charCodeAt(1) === CHAR_COLON) {
          if (len <= 2) {
            ret.root = ret.dir = path4;
            return ret;
          }
          rootEnd = 2;
          if (isPathSeparator(path4.charCodeAt(2))) {
            if (len === 3) {
              ret.root = ret.dir = path4;
              return ret;
            }
            rootEnd = 3;
          }
        }
        if (rootEnd > 0) {
          ret.root = path4.slice(0, rootEnd);
        }
        let startDot = -1;
        let startPart = rootEnd;
        let end = -1;
        let matchedSlash = true;
        let i = path4.length - 1;
        let preDotState = 0;
        for (; i >= rootEnd; --i) {
          code2 = path4.charCodeAt(i);
          if (isPathSeparator(code2)) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code2 === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (end !== -1) {
          if (startDot === -1 || // We saw a non-dot character immediately before the dot
          preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
          preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            ret.base = ret.name = path4.slice(startPart, end);
          } else {
            ret.name = path4.slice(startPart, startDot);
            ret.base = path4.slice(startPart, end);
            ret.ext = path4.slice(startDot, end);
          }
        }
        if (startPart > 0 && startPart !== rootEnd) {
          ret.dir = path4.slice(0, startPart - 1);
        } else {
          ret.dir = ret.root;
        }
        return ret;
      },
      sep: "\\",
      delimiter: ";",
      win32: null,
      posix: null
    };
    posixCwd = (() => {
      if (platformIsWin32) {
        const regexp2 = /\\/g;
        return () => {
          const cwd3 = cwd2().replace(regexp2, "/");
          return cwd3.slice(cwd3.indexOf("/"));
        };
      }
      return () => cwd2();
    })();
    posix = {
      // path.resolve([from ...], to)
      resolve(...pathSegments) {
        let resolvedPath = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= 0 && !resolvedAbsolute; i--) {
          const path4 = pathSegments[i];
          validateString(path4, `paths[${i}]`);
          if (path4.length === 0) {
            continue;
          }
          resolvedPath = `${path4}/${resolvedPath}`;
          resolvedAbsolute = path4.charCodeAt(0) === CHAR_FORWARD_SLASH;
        }
        if (!resolvedAbsolute) {
          const cwd3 = posixCwd();
          resolvedPath = `${cwd3}/${resolvedPath}`;
          resolvedAbsolute = cwd3.charCodeAt(0) === CHAR_FORWARD_SLASH;
        }
        resolvedPath = normalizeString(
          resolvedPath,
          !resolvedAbsolute,
          "/",
          isPosixPathSeparator
        );
        if (resolvedAbsolute) {
          return `/${resolvedPath}`;
        }
        return resolvedPath.length > 0 ? resolvedPath : ".";
      },
      normalize(path4) {
        validateString(path4, "path");
        if (path4.length === 0) {
          return ".";
        }
        const isAbsolute5 = path4.charCodeAt(0) === CHAR_FORWARD_SLASH;
        const trailingSeparator = path4.charCodeAt(path4.length - 1) === CHAR_FORWARD_SLASH;
        path4 = normalizeString(path4, !isAbsolute5, "/", isPosixPathSeparator);
        if (path4.length === 0) {
          if (isAbsolute5) {
            return "/";
          }
          return trailingSeparator ? "./" : ".";
        }
        if (trailingSeparator) {
          path4 += "/";
        }
        return isAbsolute5 ? `/${path4}` : path4;
      },
      isAbsolute(path4) {
        validateString(path4, "path");
        return path4.length > 0 && path4.charCodeAt(0) === CHAR_FORWARD_SLASH;
      },
      join(...paths) {
        if (paths.length === 0) {
          return ".";
        }
        const path4 = [];
        for (let i = 0; i < paths.length; ++i) {
          const arg = paths[i];
          validateString(arg, "path");
          if (arg.length > 0) {
            path4.push(arg);
          }
        }
        if (path4.length === 0) {
          return ".";
        }
        return posix.normalize(path4.join("/"));
      },
      relative(from, to) {
        validateString(from, "from");
        validateString(to, "to");
        if (from === to) {
          return "";
        }
        from = posix.resolve(from);
        to = posix.resolve(to);
        if (from === to) {
          return "";
        }
        const fromStart = 1;
        const fromEnd = from.length;
        const fromLen = fromEnd - fromStart;
        const toStart = 1;
        const toLen = to.length - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i < length; i++) {
          const fromCode = from.charCodeAt(fromStart + i);
          if (fromCode !== to.charCodeAt(toStart + i)) {
            break;
          } else if (fromCode === CHAR_FORWARD_SLASH) {
            lastCommonSep = i;
          }
        }
        if (i === length) {
          if (toLen > length) {
            if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
              return to.slice(toStart + i + 1);
            }
            if (i === 0) {
              return to.slice(toStart + i);
            }
          } else if (fromLen > length) {
            if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
              lastCommonSep = i;
            } else if (i === 0) {
              lastCommonSep = 0;
            }
          }
        }
        let out = "";
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
          if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            out += out.length === 0 ? ".." : "/..";
          }
        }
        return `${out}${to.slice(toStart + lastCommonSep)}`;
      },
      toNamespacedPath(path4) {
        return path4;
      },
      dirname(path4) {
        validateString(path4, "path");
        if (path4.length === 0) {
          return ".";
        }
        const hasRoot = path4.charCodeAt(0) === CHAR_FORWARD_SLASH;
        let end = -1;
        let matchedSlash = true;
        for (let i = path4.length - 1; i >= 1; --i) {
          if (path4.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              end = i;
              break;
            }
          } else {
            matchedSlash = false;
          }
        }
        if (end === -1) {
          return hasRoot ? "/" : ".";
        }
        if (hasRoot && end === 1) {
          return "//";
        }
        return path4.slice(0, end);
      },
      basename(path4, suffix) {
        if (suffix !== void 0) {
          validateString(suffix, "suffix");
        }
        validateString(path4, "path");
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (suffix !== void 0 && suffix.length > 0 && suffix.length <= path4.length) {
          if (suffix === path4) {
            return "";
          }
          let extIdx = suffix.length - 1;
          let firstNonSlashEnd = -1;
          for (i = path4.length - 1; i >= 0; --i) {
            const code2 = path4.charCodeAt(i);
            if (code2 === CHAR_FORWARD_SLASH) {
              if (!matchedSlash) {
                start = i + 1;
                break;
              }
            } else {
              if (firstNonSlashEnd === -1) {
                matchedSlash = false;
                firstNonSlashEnd = i + 1;
              }
              if (extIdx >= 0) {
                if (code2 === suffix.charCodeAt(extIdx)) {
                  if (--extIdx === -1) {
                    end = i;
                  }
                } else {
                  extIdx = -1;
                  end = firstNonSlashEnd;
                }
              }
            }
          }
          if (start === end) {
            end = firstNonSlashEnd;
          } else if (end === -1) {
            end = path4.length;
          }
          return path4.slice(start, end);
        }
        for (i = path4.length - 1; i >= 0; --i) {
          if (path4.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
        }
        if (end === -1) {
          return "";
        }
        return path4.slice(start, end);
      },
      extname(path4) {
        validateString(path4, "path");
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        for (let i = path4.length - 1; i >= 0; --i) {
          const char = path4[i];
          if (char === "/") {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (char === ".") {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
        preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          return "";
        }
        return path4.slice(startDot, end);
      },
      format: _format2.bind(null, "/"),
      parse(path4) {
        validateString(path4, "path");
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path4.length === 0) {
          return ret;
        }
        const isAbsolute5 = path4.charCodeAt(0) === CHAR_FORWARD_SLASH;
        let start;
        if (isAbsolute5) {
          ret.root = "/";
          start = 1;
        } else {
          start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path4.length - 1;
        let preDotState = 0;
        for (; i >= start; --i) {
          const code2 = path4.charCodeAt(i);
          if (code2 === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code2 === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (end !== -1) {
          const start2 = startPart === 0 && isAbsolute5 ? 1 : startPart;
          if (startDot === -1 || // We saw a non-dot character immediately before the dot
          preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
          preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            ret.base = ret.name = path4.slice(start2, end);
          } else {
            ret.name = path4.slice(start2, startDot);
            ret.base = path4.slice(start2, end);
            ret.ext = path4.slice(startDot, end);
          }
        }
        if (startPart > 0) {
          ret.dir = path4.slice(0, startPart - 1);
        } else if (isAbsolute5) {
          ret.dir = "/";
        }
        return ret;
      },
      sep: "/",
      delimiter: ":",
      win32: null,
      posix: null
    };
    posix.win32 = win32.win32 = win32;
    posix.posix = win32.posix = posix;
    normalize = platformIsWin32 ? win32.normalize : posix.normalize;
    isAbsolute2 = platformIsWin32 ? win32.isAbsolute : posix.isAbsolute;
    join4 = platformIsWin32 ? win32.join : posix.join;
    resolve2 = platformIsWin32 ? win32.resolve : posix.resolve;
    relative2 = platformIsWin32 ? win32.relative : posix.relative;
    dirname3 = platformIsWin32 ? win32.dirname : posix.dirname;
    basename = platformIsWin32 ? win32.basename : posix.basename;
    extname = platformIsWin32 ? win32.extname : posix.extname;
    format = platformIsWin32 ? win32.format : posix.format;
    parse2 = platformIsWin32 ? win32.parse : posix.parse;
    toNamespacedPath = platformIsWin32 ? win32.toNamespacedPath : posix.toNamespacedPath;
    sep = platformIsWin32 ? win32.sep : posix.sep;
    delimiter = platformIsWin32 ? win32.delimiter : posix.delimiter;
  }
});
export { validateObject, validateString, isPathSeparator, isPosixPathSeparator, isWindowsDeviceRoot, normalizeString, formatExt, _format2, CHAR_UPPERCASE_A, CHAR_LOWERCASE_A, CHAR_UPPERCASE_Z, CHAR_LOWERCASE_Z, CHAR_DOT, CHAR_FORWARD_SLASH, CHAR_BACKWARD_SLASH, CHAR_COLON, CHAR_QUESTION_MARK, ErrorInvalidArgType, platformIsWin32, win32, posixCwd, posix, normalize, isAbsolute2, join4, resolve2, relative2, dirname3, basename, extname, format, parse2, toNamespacedPath, sep, delimiter, init_path };
