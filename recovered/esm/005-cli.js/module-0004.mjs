// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/path.ts
import { __esm } from "./module-0000.mjs";
import { cwd, env, init_process, platform } from "./module-0003.mjs";


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

function isPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}

function isPosixPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH;
}

function isWindowsDeviceRoot(code) {
  return code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z || code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z;
}

function normalizeString(path3, allowAboveRoot, separator, isPathSeparator3) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;
  for (let i = 0; i <= path3.length; ++i) {
    if (i < path3.length) {
      code = path3.charCodeAt(i);
    } else if (isPathSeparator3(code)) {
      break;
    } else {
      code = CHAR_FORWARD_SLASH;
    }
    if (isPathSeparator3(code)) {
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
          res += `${separator}${path3.slice(lastSlash + 1, i)}`;
        } else {
          res = path3.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === CHAR_DOT && dots !== -1) {
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

var CHAR_UPPERCASE_A, CHAR_LOWERCASE_A, CHAR_UPPERCASE_Z, CHAR_LOWERCASE_Z, CHAR_DOT, CHAR_FORWARD_SLASH, CHAR_BACKWARD_SLASH, CHAR_COLON, CHAR_QUESTION_MARK, ErrorInvalidArgType, platformIsWin32, win32, posixCwd, posix, normalize, isAbsolute, join3, resolve, relative2, dirname3, basename, extname, format, parse, toNamespacedPath, sep, delimiter;

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
        const type = name.indexOf(".") !== -1 ? "property" : "argument";
        let msg = `The "${name}" ${type} ${determiner} of type ${expected}`;
        msg += `. Received type ${typeof actual}`;
        super(msg);
        this.code = "ERR_INVALID_ARG_TYPE";
      }
    };
    platformIsWin32 = platform === "win32";
    win32 = {
      // path.resolve([from ...], to)
      resolve(...pathSegments) {
        let resolvedDevice = "";
        let resolvedTail = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1; i--) {
          let path3;
          if (i >= 0) {
            path3 = pathSegments[i];
            validateString(path3, `paths[${i}]`);
            if (path3.length === 0) {
              continue;
            }
          } else if (resolvedDevice.length === 0) {
            path3 = cwd();
          } else {
            path3 = env[`=${resolvedDevice}`] || cwd();
            if (path3 === void 0 || path3.slice(0, 2).toLowerCase() !== resolvedDevice.toLowerCase() && path3.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
              path3 = `${resolvedDevice}\\`;
            }
          }
          const len = path3.length;
          let rootEnd = 0;
          let device = "";
          let isAbsolute3 = false;
          const code = path3.charCodeAt(0);
          if (len === 1) {
            if (isPathSeparator(code)) {
              rootEnd = 1;
              isAbsolute3 = true;
            }
          } else if (isPathSeparator(code)) {
            isAbsolute3 = true;
            if (isPathSeparator(path3.charCodeAt(1))) {
              let j = 2;
              let last = j;
              while (j < len && !isPathSeparator(path3.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                const firstPart = path3.slice(last, j);
                last = j;
                while (j < len && isPathSeparator(path3.charCodeAt(j))) {
                  j++;
                }
                if (j < len && j !== last) {
                  last = j;
                  while (j < len && !isPathSeparator(path3.charCodeAt(j))) {
                    j++;
                  }
                  if (j === len || j !== last) {
                    device = `\\\\${firstPart}\\${path3.slice(last, j)}`;
                    rootEnd = j;
                  }
                }
              }
            } else {
              rootEnd = 1;
            }
          } else if (isWindowsDeviceRoot(code) && path3.charCodeAt(1) === CHAR_COLON) {
            device = path3.slice(0, 2);
            rootEnd = 2;
            if (len > 2 && isPathSeparator(path3.charCodeAt(2))) {
              isAbsolute3 = true;
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
            resolvedTail = `${path3.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute3;
            if (isAbsolute3 && resolvedDevice.length > 0) {
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
      normalize(path3) {
        validateString(path3, "path");
        const len = path3.length;
        if (len === 0) {
          return ".";
        }
        let rootEnd = 0;
        let device;
        let isAbsolute3 = false;
        const code = path3.charCodeAt(0);
        if (len === 1) {
          return isPosixPathSeparator(code) ? "\\" : path3;
        }
        if (isPathSeparator(code)) {
          isAbsolute3 = true;
          if (isPathSeparator(path3.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path3.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              const firstPart = path3.slice(last, j);
              last = j;
              while (j < len && isPathSeparator(path3.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path3.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  return `\\\\${firstPart}\\${path3.slice(last)}\\`;
                }
                if (j !== last) {
                  device = `\\\\${firstPart}\\${path3.slice(last, j)}`;
                  rootEnd = j;
                }
              }
            }
          } else {
            rootEnd = 1;
          }
        } else if (isWindowsDeviceRoot(code) && path3.charCodeAt(1) === CHAR_COLON) {
          device = path3.slice(0, 2);
          rootEnd = 2;
          if (len > 2 && isPathSeparator(path3.charCodeAt(2))) {
            isAbsolute3 = true;
            rootEnd = 3;
          }
        }
        let tail = rootEnd < len ? normalizeString(path3.slice(rootEnd), !isAbsolute3, "\\", isPathSeparator) : "";
        if (tail.length === 0 && !isAbsolute3) {
          tail = ".";
        }
        if (tail.length > 0 && isPathSeparator(path3.charCodeAt(len - 1))) {
          tail += "\\";
        }
        if (!isAbsolute3 && device === void 0 && path3.includes(":")) {
          if (tail.length >= 2 && isWindowsDeviceRoot(tail.charCodeAt(0)) && tail.charCodeAt(1) === CHAR_COLON) {
            return `.\\${tail}`;
          }
          let index = path3.indexOf(":");
          do {
            if (index === len - 1 || isPathSeparator(path3.charCodeAt(index + 1))) {
              return `.\\${tail}`;
            }
          } while ((index = path3.indexOf(":", index + 1)) !== -1);
        }
        if (device === void 0) {
          return isAbsolute3 ? `\\${tail}` : tail;
        }
        return isAbsolute3 ? `${device}\\${tail}` : `${device}${tail}`;
      },
      isAbsolute(path3) {
        validateString(path3, "path");
        const len = path3.length;
        if (len === 0) {
          return false;
        }
        const code = path3.charCodeAt(0);
        return isPathSeparator(code) || // Possible device root
        len > 2 && isWindowsDeviceRoot(code) && path3.charCodeAt(1) === CHAR_COLON && isPathSeparator(path3.charCodeAt(2));
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
      toNamespacedPath(path3) {
        if (typeof path3 !== "string" || path3.length === 0) {
          return path3;
        }
        const resolvedPath = win32.resolve(path3);
        if (resolvedPath.length <= 2) {
          return path3;
        }
        if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
          if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
            const code = resolvedPath.charCodeAt(2);
            if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
              return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
            }
          }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0)) && resolvedPath.charCodeAt(1) === CHAR_COLON && resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
          return `\\\\?\\${resolvedPath}`;
        }
        return resolvedPath;
      },
      dirname(path3) {
        validateString(path3, "path");
        const len = path3.length;
        if (len === 0) {
          return ".";
        }
        let rootEnd = -1;
        let offset = 0;
        const code = path3.charCodeAt(0);
        if (len === 1) {
          return isPathSeparator(code) ? path3 : ".";
        }
        if (isPathSeparator(code)) {
          rootEnd = offset = 1;
          if (isPathSeparator(path3.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path3.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && isPathSeparator(path3.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path3.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  return path3;
                }
                if (j !== last) {
                  rootEnd = offset = j + 1;
                }
              }
            }
          }
        } else if (isWindowsDeviceRoot(code) && path3.charCodeAt(1) === CHAR_COLON) {
          rootEnd = len > 2 && isPathSeparator(path3.charCodeAt(2)) ? 3 : 2;
          offset = rootEnd;
        }
        let end = -1;
        let matchedSlash = true;
        for (let i = len - 1; i >= offset; --i) {
          if (isPathSeparator(path3.charCodeAt(i))) {
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
        return path3.slice(0, end);
      },
      basename(path3, suffix) {
        if (suffix !== void 0) {
          validateString(suffix, "suffix");
        }
        validateString(path3, "path");
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (path3.length >= 2 && isWindowsDeviceRoot(path3.charCodeAt(0)) && path3.charCodeAt(1) === CHAR_COLON) {
          start = 2;
        }
        if (suffix !== void 0 && suffix.length > 0 && suffix.length <= path3.length) {
          if (suffix === path3) {
            return "";
          }
          let extIdx = suffix.length - 1;
          let firstNonSlashEnd = -1;
          for (i = path3.length - 1; i >= start; --i) {
            const code = path3.charCodeAt(i);
            if (isPathSeparator(code)) {
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
                if (code === suffix.charCodeAt(extIdx)) {
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
            end = path3.length;
          }
          return path3.slice(start, end);
        }
        for (i = path3.length - 1; i >= start; --i) {
          if (isPathSeparator(path3.charCodeAt(i))) {
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
        return path3.slice(start, end);
      },
      extname(path3) {
        validateString(path3, "path");
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        if (path3.length >= 2 && path3.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path3.charCodeAt(0))) {
          start = startPart = 2;
        }
        for (let i = path3.length - 1; i >= start; --i) {
          const code = path3.charCodeAt(i);
          if (isPathSeparator(code)) {
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
          if (code === CHAR_DOT) {
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
        return path3.slice(startDot, end);
      },
      format: _format2.bind(null, "\\"),
      parse(path3) {
        validateString(path3, "path");
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path3.length === 0) {
          return ret;
        }
        const len = path3.length;
        let rootEnd = 0;
        let code = path3.charCodeAt(0);
        if (len === 1) {
          if (isPathSeparator(code)) {
            ret.root = ret.dir = path3;
            return ret;
          }
          ret.base = ret.name = path3;
          return ret;
        }
        if (isPathSeparator(code)) {
          rootEnd = 1;
          if (isPathSeparator(path3.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path3.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && isPathSeparator(path3.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path3.charCodeAt(j))) {
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
        } else if (isWindowsDeviceRoot(code) && path3.charCodeAt(1) === CHAR_COLON) {
          if (len <= 2) {
            ret.root = ret.dir = path3;
            return ret;
          }
          rootEnd = 2;
          if (isPathSeparator(path3.charCodeAt(2))) {
            if (len === 3) {
              ret.root = ret.dir = path3;
              return ret;
            }
            rootEnd = 3;
          }
        }
        if (rootEnd > 0) {
          ret.root = path3.slice(0, rootEnd);
        }
        let startDot = -1;
        let startPart = rootEnd;
        let end = -1;
        let matchedSlash = true;
        let i = path3.length - 1;
        let preDotState = 0;
        for (; i >= rootEnd; --i) {
          code = path3.charCodeAt(i);
          if (isPathSeparator(code)) {
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
          if (code === CHAR_DOT) {
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
            ret.base = ret.name = path3.slice(startPart, end);
          } else {
            ret.name = path3.slice(startPart, startDot);
            ret.base = path3.slice(startPart, end);
            ret.ext = path3.slice(startDot, end);
          }
        }
        if (startPart > 0 && startPart !== rootEnd) {
          ret.dir = path3.slice(0, startPart - 1);
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
        const regexp = /\\/g;
        return () => {
          const cwd2 = cwd().replace(regexp, "/");
          return cwd2.slice(cwd2.indexOf("/"));
        };
      }
      return () => cwd();
    })();
    posix = {
      // path.resolve([from ...], to)
      resolve(...pathSegments) {
        let resolvedPath = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= 0 && !resolvedAbsolute; i--) {
          const path3 = pathSegments[i];
          validateString(path3, `paths[${i}]`);
          if (path3.length === 0) {
            continue;
          }
          resolvedPath = `${path3}/${resolvedPath}`;
          resolvedAbsolute = path3.charCodeAt(0) === CHAR_FORWARD_SLASH;
        }
        if (!resolvedAbsolute) {
          const cwd2 = posixCwd();
          resolvedPath = `${cwd2}/${resolvedPath}`;
          resolvedAbsolute = cwd2.charCodeAt(0) === CHAR_FORWARD_SLASH;
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
      normalize(path3) {
        validateString(path3, "path");
        if (path3.length === 0) {
          return ".";
        }
        const isAbsolute3 = path3.charCodeAt(0) === CHAR_FORWARD_SLASH;
        const trailingSeparator = path3.charCodeAt(path3.length - 1) === CHAR_FORWARD_SLASH;
        path3 = normalizeString(path3, !isAbsolute3, "/", isPosixPathSeparator);
        if (path3.length === 0) {
          if (isAbsolute3) {
            return "/";
          }
          return trailingSeparator ? "./" : ".";
        }
        if (trailingSeparator) {
          path3 += "/";
        }
        return isAbsolute3 ? `/${path3}` : path3;
      },
      isAbsolute(path3) {
        validateString(path3, "path");
        return path3.length > 0 && path3.charCodeAt(0) === CHAR_FORWARD_SLASH;
      },
      join(...paths) {
        if (paths.length === 0) {
          return ".";
        }
        const path3 = [];
        for (let i = 0; i < paths.length; ++i) {
          const arg = paths[i];
          validateString(arg, "path");
          if (arg.length > 0) {
            path3.push(arg);
          }
        }
        if (path3.length === 0) {
          return ".";
        }
        return posix.normalize(path3.join("/"));
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
      toNamespacedPath(path3) {
        return path3;
      },
      dirname(path3) {
        validateString(path3, "path");
        if (path3.length === 0) {
          return ".";
        }
        const hasRoot = path3.charCodeAt(0) === CHAR_FORWARD_SLASH;
        let end = -1;
        let matchedSlash = true;
        for (let i = path3.length - 1; i >= 1; --i) {
          if (path3.charCodeAt(i) === CHAR_FORWARD_SLASH) {
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
        return path3.slice(0, end);
      },
      basename(path3, suffix) {
        if (suffix !== void 0) {
          validateString(suffix, "suffix");
        }
        validateString(path3, "path");
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (suffix !== void 0 && suffix.length > 0 && suffix.length <= path3.length) {
          if (suffix === path3) {
            return "";
          }
          let extIdx = suffix.length - 1;
          let firstNonSlashEnd = -1;
          for (i = path3.length - 1; i >= 0; --i) {
            const code = path3.charCodeAt(i);
            if (code === CHAR_FORWARD_SLASH) {
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
                if (code === suffix.charCodeAt(extIdx)) {
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
            end = path3.length;
          }
          return path3.slice(start, end);
        }
        for (i = path3.length - 1; i >= 0; --i) {
          if (path3.charCodeAt(i) === CHAR_FORWARD_SLASH) {
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
        return path3.slice(start, end);
      },
      extname(path3) {
        validateString(path3, "path");
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        for (let i = path3.length - 1; i >= 0; --i) {
          const char = path3[i];
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
        return path3.slice(startDot, end);
      },
      format: _format2.bind(null, "/"),
      parse(path3) {
        validateString(path3, "path");
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path3.length === 0) {
          return ret;
        }
        const isAbsolute3 = path3.charCodeAt(0) === CHAR_FORWARD_SLASH;
        let start;
        if (isAbsolute3) {
          ret.root = "/";
          start = 1;
        } else {
          start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path3.length - 1;
        let preDotState = 0;
        for (; i >= start; --i) {
          const code = path3.charCodeAt(i);
          if (code === CHAR_FORWARD_SLASH) {
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
          if (code === CHAR_DOT) {
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
          const start2 = startPart === 0 && isAbsolute3 ? 1 : startPart;
          if (startDot === -1 || // We saw a non-dot character immediately before the dot
          preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
          preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            ret.base = ret.name = path3.slice(start2, end);
          } else {
            ret.name = path3.slice(start2, startDot);
            ret.base = path3.slice(start2, end);
            ret.ext = path3.slice(startDot, end);
          }
        }
        if (startPart > 0) {
          ret.dir = path3.slice(0, startPart - 1);
        } else if (isAbsolute3) {
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
    isAbsolute = platformIsWin32 ? win32.isAbsolute : posix.isAbsolute;
    join3 = platformIsWin32 ? win32.join : posix.join;
    resolve = platformIsWin32 ? win32.resolve : posix.resolve;
    relative2 = platformIsWin32 ? win32.relative : posix.relative;
    dirname3 = platformIsWin32 ? win32.dirname : posix.dirname;
    basename = platformIsWin32 ? win32.basename : posix.basename;
    extname = platformIsWin32 ? win32.extname : posix.extname;
    format = platformIsWin32 ? win32.format : posix.format;
    parse = platformIsWin32 ? win32.parse : posix.parse;
    toNamespacedPath = platformIsWin32 ? win32.toNamespacedPath : posix.toNamespacedPath;
    sep = platformIsWin32 ? win32.sep : posix.sep;
    delimiter = platformIsWin32 ? win32.delimiter : posix.delimiter;
  }
});
export { validateObject, validateString, isPathSeparator, isPosixPathSeparator, isWindowsDeviceRoot, normalizeString, formatExt, _format2, CHAR_UPPERCASE_A, CHAR_LOWERCASE_A, CHAR_UPPERCASE_Z, CHAR_LOWERCASE_Z, CHAR_DOT, CHAR_FORWARD_SLASH, CHAR_BACKWARD_SLASH, CHAR_COLON, CHAR_QUESTION_MARK, ErrorInvalidArgType, platformIsWin32, win32, posixCwd, posix, normalize, isAbsolute, join3, resolve, relative2, dirname3, basename, extname, format, parse, toNamespacedPath, sep, delimiter, init_path };
