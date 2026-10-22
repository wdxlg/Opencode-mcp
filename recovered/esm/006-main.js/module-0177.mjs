// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/glob.ts
import { endsWithIgnoreCase, equalsIgnoreCase, escapeRegExpCharacters, init_strings, ltrim } from "./module-0027.mjs";
import { init_extpath, isEqualOrParent } from "./module-0028.mjs";
import { init_platform, isLinux } from "./module-0006.mjs";
import { basename, extname, init_path, posix, sep } from "./module-0008.mjs";
import { init_async, isThenable } from "./module-0034.mjs";
import { equals, init_arrays } from "./module-0013.mjs";
import { __esm } from "./module-0000.mjs";
import { init_charCode } from "./module-0023.mjs";
import { LRUCache, init_map } from "./module-0014.mjs";


// src/vs/base/common/glob.ts
function starsToRegExp(starCount, isLastPattern) {
  switch (starCount) {
    case 0:
      return "";
    case 1:
      return `${NO_PATH_REGEX}*?`;
    // 1 star matches any number of characters except path separator (/ and \) - non greedy (?)
    default:
      return `(?:${PATH_REGEX}|${NO_PATH_REGEX}+${PATH_REGEX}${isLastPattern ? `|${PATH_REGEX}${NO_PATH_REGEX}+` : ""})*?`;
  }
}

function splitGlobAware(pattern, splitChar) {
  if (!pattern) {
    return [];
  }
  const segments = [];
  let inBraces = false;
  let inBrackets = false;
  let curVal = "";
  for (const char of pattern) {
    switch (char) {
      case splitChar:
        if (!inBraces && !inBrackets) {
          segments.push(curVal);
          curVal = "";
          continue;
        }
        break;
      case "{":
        inBraces = true;
        break;
      case "}":
        inBraces = false;
        break;
      case "[":
        inBrackets = true;
        break;
      case "]":
        inBrackets = false;
        break;
    }
    curVal += char;
  }
  if (curVal) {
    segments.push(curVal);
  }
  return segments;
}

function parseRegExp(pattern) {
  if (!pattern) {
    return "";
  }
  let regEx = "";
  const segments = splitGlobAware(pattern, GLOB_SPLIT);
  if (segments.every((segment) => segment === GLOBSTAR)) {
    regEx = ".*";
  } else {
    let previousSegmentWasGlobStar = false;
    segments.forEach((segment, index) => {
      if (segment === GLOBSTAR) {
        if (previousSegmentWasGlobStar) {
          return;
        }
        regEx += starsToRegExp(2, index === segments.length - 1);
      } else {
        let inBraces = false;
        let braceVal = "";
        let inBrackets = false;
        let bracketVal = "";
        for (const char of segment) {
          if (char !== "}" && inBraces) {
            braceVal += char;
            continue;
          }
          if (inBrackets && (char !== "]" || !bracketVal)) {
            let res;
            if (char === "-") {
              res = char;
            } else if ((char === "^" || char === "!") && !bracketVal) {
              res = "^";
            } else if (char === GLOB_SPLIT) {
              res = "";
            } else {
              res = escapeRegExpCharacters(char);
            }
            bracketVal += res;
            continue;
          }
          switch (char) {
            case "{":
              inBraces = true;
              continue;
            case "[":
              inBrackets = true;
              continue;
            case "}": {
              const choices = splitGlobAware(braceVal, ",");
              const braceRegExp = `(?:${choices.map((choice) => parseRegExp(choice)).join("|")})`;
              regEx += braceRegExp;
              inBraces = false;
              braceVal = "";
              break;
            }
            case "]": {
              regEx += "[" + bracketVal + "]";
              inBrackets = false;
              bracketVal = "";
              break;
            }
            case "?":
              regEx += NO_PATH_REGEX;
              continue;
            case "*":
              regEx += starsToRegExp(1);
              continue;
            default:
              regEx += escapeRegExpCharacters(char);
          }
        }
        if (index < segments.length - 1 && // more segments to come after this
        (segments[index + 1] !== GLOBSTAR || // next segment is not **, or...
        index + 2 < segments.length)) {
          regEx += PATH_REGEX;
        }
      }
      previousSegmentWasGlobStar = segment === GLOBSTAR;
    });
  }
  return regEx;
}

function parsePattern(arg1, options, cacheKey) {
  if (!arg1) {
    return NULL;
  }
  let pattern;
  if (typeof arg1 !== "string") {
    pattern = arg1.pattern;
  } else {
    pattern = arg1;
  }
  pattern = pattern.trim();
  const ignoreCase = options.ignoreCase ?? false;
  const internalOptions = {
    ...options,
    equals: ignoreCase ? equalsIgnoreCase : (a, b) => a === b,
    endsWith: ignoreCase ? endsWithIgnoreCase : (str, candidate) => str.endsWith(candidate),
    isEqualOrParent: (base, candidate) => isEqualOrParent(
      base,
      candidate,
      options.ignoreCase ?? !isLinux
      /* preserve old behaviour for when option is not adopted */
    )
  };
  const patternKey = `${cacheKey === void 0 ? `default:${ignoreCase ? pattern.toLowerCase() : pattern}` : `custom:${cacheKey}`}_${!!options.trimForExclusions}_${ignoreCase}`;
  let parsedPattern = CACHE.get(patternKey);
  if (parsedPattern) {
    return wrapRelativePattern(parsedPattern, arg1, internalOptions);
  }
  let match;
  if (T1.test(pattern)) {
    parsedPattern = trivia1(pattern.substring(4), pattern, internalOptions);
  } else if (match = T2.exec(trimForExclusions(pattern, internalOptions))) {
    parsedPattern = trivia2(match[1], pattern, internalOptions);
  } else if ((options.trimForExclusions ? T3_2 : T3).test(pattern)) {
    parsedPattern = trivia3(pattern, internalOptions);
  } else if (match = T4.exec(trimForExclusions(pattern, internalOptions))) {
    parsedPattern = trivia4and5(match[1].substring(1), pattern, true, internalOptions);
  } else if (match = T5.exec(trimForExclusions(pattern, internalOptions))) {
    parsedPattern = trivia4and5(match[1], pattern, false, internalOptions);
  } else {
    parsedPattern = toRegExp(pattern, internalOptions);
  }
  CACHE.set(patternKey, parsedPattern);
  return wrapRelativePattern(parsedPattern, arg1, internalOptions);
}

function wrapRelativePattern(parsedPattern, arg2, options) {
  if (typeof arg2 === "string") {
    return parsedPattern;
  }
  const wrappedPattern = function(path4, basename3) {
    if (!options.isEqualOrParent(path4, arg2.base)) {
      return null;
    }
    return parsedPattern(ltrim(path4.substring(arg2.base.length), sep), basename3);
  };
  wrappedPattern.allBasenames = parsedPattern.allBasenames;
  wrappedPattern.allPaths = parsedPattern.allPaths;
  wrappedPattern.basenames = parsedPattern.basenames;
  wrappedPattern.patterns = parsedPattern.patterns;
  return wrappedPattern;
}

function trimForExclusions(pattern, options) {
  return options.trimForExclusions && pattern.endsWith("/**") ? pattern.substring(0, pattern.length - 2) : pattern;
}

function trivia1(base, pattern, options) {
  return function(path4, basename3) {
    return typeof path4 === "string" && options.endsWith(path4, base) ? pattern : null;
  };
}

function trivia2(base, pattern, options) {
  const slashBase = `/${base}`;
  const backslashBase = `\\${base}`;
  const parsedPattern = function(path4, basename3) {
    if (typeof path4 !== "string") {
      return null;
    }
    if (basename3) {
      return options.equals(basename3, base) ? pattern : null;
    }
    return options.equals(path4, base) || options.endsWith(path4, slashBase) || options.endsWith(path4, backslashBase) ? pattern : null;
  };
  const basenames = [base];
  parsedPattern.basenames = basenames;
  parsedPattern.patterns = [pattern];
  parsedPattern.allBasenames = basenames;
  return parsedPattern;
}

function trivia3(pattern, options) {
  const parsedPatterns = aggregateBasenameMatches(pattern.slice(1, -1).split(",").map((pattern2) => parsePattern(pattern2, options)).filter((pattern2) => pattern2 !== NULL), pattern, options.ignoreCase);
  const patternsLength = parsedPatterns.length;
  if (!patternsLength) {
    return NULL;
  }
  if (patternsLength === 1) {
    return parsedPatterns[0];
  }
  const parsedPattern = function(path4, basename3) {
    for (let i = 0, n = parsedPatterns.length; i < n; i++) {
      if (parsedPatterns[i](path4, basename3)) {
        return pattern;
      }
    }
    return null;
  };
  const withBasenames = parsedPatterns.find((pattern2) => !!pattern2.allBasenames);
  if (withBasenames) {
    parsedPattern.allBasenames = withBasenames.allBasenames;
  }
  const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
  if (allPaths.length) {
    parsedPattern.allPaths = allPaths;
  }
  return parsedPattern;
}

function trivia4and5(targetPath, pattern, matchPathEnds, options) {
  const usingPosixSep = sep === posix.sep;
  const nativePath = usingPosixSep ? targetPath : targetPath.replace(ALL_FORWARD_SLASHES, sep);
  const nativePathEnd = sep + nativePath;
  const targetPathEnd = posix.sep + targetPath;
  let parsedPattern;
  if (matchPathEnds) {
    parsedPattern = function(path4, basename3) {
      return typeof path4 === "string" && (options.equals(path4, nativePath) || options.endsWith(path4, nativePathEnd) || !usingPosixSep && (options.equals(path4, targetPath) || options.endsWith(path4, targetPathEnd))) ? pattern : null;
    };
  } else {
    parsedPattern = function(path4, basename3) {
      return typeof path4 === "string" && (options.equals(path4, nativePath) || !usingPosixSep && options.equals(path4, targetPath)) ? pattern : null;
    };
  }
  parsedPattern.allPaths = [(matchPathEnds ? "*/" : "./") + targetPath];
  return parsedPattern;
}

function toRegExp(pattern, options) {
  try {
    const regExp = new RegExp(`^${parseRegExp(pattern)}$`, options.ignoreCase ? "i" : void 0);
    return function(path4) {
      regExp.lastIndex = 0;
      return typeof path4 === "string" && regExp.test(path4) ? pattern : null;
    };
  } catch {
    return NULL;
  }
}

function parse5(arg1, options = {}) {
  if (!arg1) {
    return FALSE;
  }
  if (typeof arg1 === "string" || isRelativePattern(arg1)) {
    const parsedPattern = parsePattern(arg1, options);
    if (parsedPattern === NULL) {
      return FALSE;
    }
    const resultPattern = function(path4, basename3) {
      return !!parsedPattern(path4, basename3);
    };
    if (parsedPattern.allBasenames) {
      resultPattern.allBasenames = parsedPattern.allBasenames;
    }
    if (parsedPattern.allPaths) {
      resultPattern.allPaths = parsedPattern.allPaths;
    }
    return resultPattern;
  }
  return parsedExpression(arg1, options);
}

function isRelativePattern(obj) {
  const rp = obj;
  if (!rp) {
    return false;
  }
  return typeof rp.base === "string" && typeof rp.pattern === "string";
}

function parsedExpression(expression, options) {
  const parsedPatterns = aggregateBasenameMatches(Object.getOwnPropertyNames(expression).map((pattern) => parseExpressionPattern(pattern, expression[pattern], options)).filter((pattern) => pattern !== NULL), void 0, options.ignoreCase);
  const patternsLength = parsedPatterns.length;
  if (!patternsLength) {
    return NULL;
  }
  if (!parsedPatterns.some((parsedPattern) => !!parsedPattern.requiresSiblings)) {
    if (patternsLength === 1) {
      return parsedPatterns[0];
    }
    const resultExpression2 = function(path4, basename3) {
      let resultPromises = void 0;
      for (let i = 0, n = parsedPatterns.length; i < n; i++) {
        const result = parsedPatterns[i](path4, basename3);
        if (typeof result === "string") {
          return result;
        }
        if (isThenable(result)) {
          if (!resultPromises) {
            resultPromises = [];
          }
          resultPromises.push(result);
        }
      }
      if (resultPromises) {
        return (async () => {
          for (const resultPromise of resultPromises) {
            const result = await resultPromise;
            if (typeof result === "string") {
              return result;
            }
          }
          return null;
        })();
      }
      return null;
    };
    const withBasenames2 = parsedPatterns.find((pattern) => !!pattern.allBasenames);
    if (withBasenames2) {
      resultExpression2.allBasenames = withBasenames2.allBasenames;
    }
    const allPaths2 = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
    if (allPaths2.length) {
      resultExpression2.allPaths = allPaths2;
    }
    return resultExpression2;
  }
  const resultExpression = function(path4, base, hasSibling) {
    let name = void 0;
    let resultPromises = void 0;
    for (let i = 0, n = parsedPatterns.length; i < n; i++) {
      const parsedPattern = parsedPatterns[i];
      if (parsedPattern.requiresSiblings && hasSibling) {
        if (!base) {
          base = basename(path4);
        }
        if (!name) {
          name = base.substring(0, base.length - extname(path4).length);
        }
      }
      const result = parsedPattern(path4, base, name, hasSibling);
      if (typeof result === "string") {
        return result;
      }
      if (isThenable(result)) {
        if (!resultPromises) {
          resultPromises = [];
        }
        resultPromises.push(result);
      }
    }
    if (resultPromises) {
      return (async () => {
        for (const resultPromise of resultPromises) {
          const result = await resultPromise;
          if (typeof result === "string") {
            return result;
          }
        }
        return null;
      })();
    }
    return null;
  };
  const withBasenames = parsedPatterns.find((pattern) => !!pattern.allBasenames);
  if (withBasenames) {
    resultExpression.allBasenames = withBasenames.allBasenames;
  }
  const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
  if (allPaths.length) {
    resultExpression.allPaths = allPaths;
  }
  return resultExpression;
}

function parseExpressionPattern(pattern, value, options) {
  if (value === false) {
    return NULL;
  }
  const parsedPattern = parsePattern(pattern, options, pattern);
  if (parsedPattern === NULL) {
    return NULL;
  }
  if (typeof value === "boolean") {
    return parsedPattern;
  }
  if (value) {
    const when = value.when;
    if (typeof when === "string") {
      const result = (path4, basename3, name, hasSibling) => {
        if (!hasSibling || !parsedPattern(path4, basename3)) {
          return null;
        }
        const clausePattern = when.replace("$(basename)", () => name);
        const matched = hasSibling(clausePattern);
        return isThenable(matched) ? matched.then((match) => match ? pattern : null) : matched ? pattern : null;
      };
      result.requiresSiblings = true;
      return result;
    }
  }
  return parsedPattern;
}

function aggregateBasenameMatches(parsedPatterns, result, ignoreCase) {
  const basenamePatterns = parsedPatterns.filter((parsedPattern) => !!parsedPattern.basenames);
  if (basenamePatterns.length < 2) {
    return parsedPatterns;
  }
  const basenames = basenamePatterns.reduce((all, current) => {
    const basenames2 = current.basenames;
    return basenames2 ? all.concat(basenames2) : all;
  }, []);
  let patterns;
  if (result) {
    patterns = [];
    for (let i = 0, n = basenames.length; i < n; i++) {
      patterns.push(result);
    }
  } else {
    patterns = basenamePatterns.reduce((all, current) => {
      const patterns2 = current.patterns;
      return patterns2 ? all.concat(patterns2) : all;
    }, []);
  }
  const aggregate = function(path4, basename3) {
    if (typeof path4 !== "string") {
      return null;
    }
    if (!basename3) {
      let i;
      for (i = path4.length; i > 0; i--) {
        const ch = path4.charCodeAt(i - 1);
        if (ch === 47 /* Slash */ || ch === 92 /* Backslash */) {
          break;
        }
      }
      basename3 = path4.substring(i);
    }
    const index = ignoreCase ? basenames.findIndex((candidate) => equalsIgnoreCase(candidate, basename3)) : basenames.indexOf(basename3);
    return index !== -1 ? patterns[index] : null;
  };
  aggregate.basenames = basenames;
  aggregate.patterns = patterns;
  aggregate.allBasenames = basenames;
  const aggregatedPatterns = parsedPatterns.filter((parsedPattern) => !parsedPattern.basenames);
  aggregatedPatterns.push(aggregate);
  return aggregatedPatterns;
}

function patternsEquals(patternsA, patternsB) {
  return equals(patternsA, patternsB, (a, b) => {
    if (typeof a === "string" && typeof b === "string") {
      return a === b;
    }
    if (typeof a !== "string" && typeof b !== "string") {
      return a.base === b.base && a.pattern === b.pattern;
    }
    return false;
  });
}

var GLOBSTAR, GLOB_SPLIT, PATH_REGEX, NO_PATH_REGEX, ALL_FORWARD_SLASHES, T1, T2, T3, T3_2, T4, T5, CACHE, FALSE, NULL;

var init_glob = __esm({
  "src/vs/base/common/glob.ts"() {
    init_arrays();
    init_async();
    init_charCode();
    init_extpath();
    init_map();
    init_path();
    init_platform();
    init_strings();
    GLOBSTAR = "**";
    GLOB_SPLIT = "/";
    PATH_REGEX = "[/\\\\]";
    NO_PATH_REGEX = "[^/\\\\]";
    ALL_FORWARD_SLASHES = /\//g;
    T1 = /^\*\*\/\*\.[\w\.-]+$/;
    T2 = /^\*\*\/([\w\.-]+)\/?$/;
    T3 = /^{\*\*\/\*?[\w\.-]+\/?(,\*\*\/\*?[\w\.-]+\/?)*}$/;
    T3_2 = /^{\*\*\/\*?[\w\.-]+(\/(\*\*)?)?(,\*\*\/\*?[\w\.-]+(\/(\*\*)?)?)*}$/;
    T4 = /^\*\*((\/[\w\.-]+)+)\/?$/;
    T5 = /^([\w\.-]+(\/[\w\.-]+)*)\/?$/;
    CACHE = new LRUCache(1e4);
    FALSE = function() {
      return false;
    };
    NULL = function() {
      return null;
    };
  }
});
export { starsToRegExp, splitGlobAware, parseRegExp, parsePattern, wrapRelativePattern, trimForExclusions, trivia1, trivia2, trivia3, trivia4and5, toRegExp, parse5, isRelativePattern, parsedExpression, parseExpressionPattern, aggregateBasenameMatches, patternsEquals, GLOBSTAR, GLOB_SPLIT, PATH_REGEX, NO_PATH_REGEX, ALL_FORWARD_SLASHES, T1, T2, T3, T3_2, T4, T5, CACHE, FALSE, NULL, init_glob };
