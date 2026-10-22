// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/labels.ts
import { OS, isMacintosh, isWindows } from "./module-0014.mjs";
import { posix, sep, win32 } from "./module-0026.mjs";
import { extUri, extUriIgnorePathCase } from "./module-0034.mjs";
import { hasDriveLetter, toSlashes } from "./module-0031.mjs";
import { rtrim, startsWithIgnoreCase } from "./module-0030.mjs";


// src/vs/base/common/labels.ts
function getPathLabel(resource, formatting) {
  const { os, tildify: tildifier, relative: relatifier } = formatting;
  if (relatifier) {
    const relativePath2 = getRelativePathLabel(resource, relatifier, os);
    if (typeof relativePath2 === "string") {
      return relativePath2;
    }
  }
  let absolutePath2 = resource.fsPath;
  if (os === 1 /* Windows */ && !isWindows) {
    absolutePath2 = absolutePath2.replace(/\//g, "\\");
  } else if (os !== 1 /* Windows */ && isWindows) {
    absolutePath2 = absolutePath2.replace(/\\/g, "/");
  }
  if (os !== 1 /* Windows */ && tildifier?.userHome) {
    const userHome = tildifier.userHome.fsPath;
    let userHomeCandidate;
    if (resource.scheme !== tildifier.userHome.scheme && resource.path[0] === posix.sep && resource.path[1] !== posix.sep) {
      userHomeCandidate = tildifier.userHome.with({ path: resource.path }).fsPath;
    } else {
      userHomeCandidate = absolutePath2;
    }
    absolutePath2 = tildify(userHomeCandidate, userHome, os);
  }
  const pathLib = os === 1 /* Windows */ ? win32 : posix;
  return pathLib.normalize(normalizeDriveLetter(absolutePath2, os === 1 /* Windows */));
}

function getRelativePathLabel(resource, relativePathProvider, os) {
  const pathLib = os === 1 /* Windows */ ? win32 : posix;
  const extUriLib = os === 3 /* Linux */ ? extUri : extUriIgnorePathCase;
  const workspace = relativePathProvider.getWorkspace();
  const firstFolder = workspace.folders.at(0);
  if (!firstFolder) {
    return void 0;
  }
  if (resource.scheme !== firstFolder.uri.scheme && resource.path[0] === posix.sep && resource.path[1] !== posix.sep) {
    resource = firstFolder.uri.with({ path: resource.path });
  }
  const folder = relativePathProvider.getWorkspaceFolder(resource);
  if (!folder) {
    return void 0;
  }
  let relativePathLabel = void 0;
  if (extUriLib.isEqual(folder.uri, resource)) {
    relativePathLabel = "";
  } else {
    relativePathLabel = extUriLib.relativePath(folder.uri, resource) ?? "";
  }
  if (relativePathLabel) {
    relativePathLabel = pathLib.normalize(relativePathLabel);
  }
  if (workspace.folders.length > 1 && !relativePathProvider.noPrefix) {
    const rootName = folder.name ? folder.name : extUriLib.basenameOrAuthority(folder.uri);
    relativePathLabel = relativePathLabel ? `${rootName} \u2022 ${relativePathLabel}` : rootName;
  }
  return relativePathLabel;
}

function normalizeDriveLetter(path, isWindowsOS = isWindows) {
  if (hasDriveLetter(path, isWindowsOS)) {
    return path.charAt(0).toUpperCase() + path.slice(1);
  }
  return path;
}

var normalizedUserHomeCached = /* @__PURE__ */ Object.create(null);

function tildify(path, userHome, os = OS) {
  if (os === 1 /* Windows */ || !path || !userHome) {
    return path;
  }
  let normalizedUserHome = normalizedUserHomeCached.original === userHome ? normalizedUserHomeCached.normalized : void 0;
  if (!normalizedUserHome) {
    normalizedUserHome = userHome;
    if (isWindows) {
      normalizedUserHome = toSlashes(normalizedUserHome);
    }
    normalizedUserHome = `${rtrim(normalizedUserHome, posix.sep)}${posix.sep}`;
    normalizedUserHomeCached = { original: userHome, normalized: normalizedUserHome };
  }
  let normalizedPath = path;
  if (isWindows) {
    normalizedPath = toSlashes(normalizedPath);
  }
  if (os === 3 /* Linux */ ? normalizedPath.startsWith(normalizedUserHome) : startsWithIgnoreCase(normalizedPath, normalizedUserHome)) {
    return `~/${normalizedPath.substr(normalizedUserHome.length)}`;
  }
  return path;
}

function untildify(path, userHome) {
  return path.replace(/^~($|\/|\\)/, `${userHome}$1`);
}

var ellipsis = "\u2026";

var unc = "\\\\";

var urlSchemaRegexp = /^[^:/\\?#]+?:\/\//;

var home = "~";

function shorten(paths, defaultPathSeparator = sep) {
  const shortenedPaths = new Array(paths.length);
  let match2 = false;
  for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
    let pathSeparator = defaultPathSeparator;
    const originalPath = paths[pathIndex];
    if (originalPath === "") {
      shortenedPaths[pathIndex] = `.${pathSeparator}`;
      continue;
    }
    if (!originalPath) {
      shortenedPaths[pathIndex] = originalPath;
      continue;
    }
    match2 = true;
    let prefix = "";
    let trimmedPath = originalPath;
    if (urlSchemaRegexp.test(trimmedPath)) {
      prefix = trimmedPath.substr(0, trimmedPath.indexOf("//") + 2);
      trimmedPath = trimmedPath.substr(trimmedPath.indexOf("//") + 2);
      pathSeparator = "/";
    } else if (trimmedPath.indexOf(unc) === 0) {
      prefix = trimmedPath.substr(0, trimmedPath.indexOf(unc) + unc.length);
      trimmedPath = trimmedPath.substr(trimmedPath.indexOf(unc) + unc.length);
    } else if (trimmedPath.indexOf(pathSeparator) === 0) {
      prefix = trimmedPath.substr(0, trimmedPath.indexOf(pathSeparator) + pathSeparator.length);
      trimmedPath = trimmedPath.substr(trimmedPath.indexOf(pathSeparator) + pathSeparator.length);
    } else if (trimmedPath.indexOf(home) === 0) {
      prefix = trimmedPath.substr(0, trimmedPath.indexOf(home) + home.length);
      trimmedPath = trimmedPath.substr(trimmedPath.indexOf(home) + home.length);
    }
    const segments = trimmedPath.split(pathSeparator);
    for (let subpathLength = 1; match2 && subpathLength <= segments.length; subpathLength++) {
      for (let start = segments.length - subpathLength; match2 && start >= 0; start--) {
        match2 = false;
        let subpath = segments.slice(start, start + subpathLength).join(pathSeparator);
        for (let otherPathIndex = 0; !match2 && otherPathIndex < paths.length; otherPathIndex++) {
          if (otherPathIndex !== pathIndex && paths[otherPathIndex] && paths[otherPathIndex].indexOf(subpath) > -1) {
            const isSubpathEnding = start + subpathLength === segments.length;
            const subpathWithSep = start > 0 && paths[otherPathIndex].indexOf(pathSeparator) > -1 ? pathSeparator + subpath : subpath;
            const isOtherPathEnding = paths[otherPathIndex].endsWith(subpathWithSep);
            match2 = !isSubpathEnding || isOtherPathEnding;
          }
        }
        if (!match2) {
          let result = "";
          if (segments[0].endsWith(":") || prefix !== "") {
            if (start === 1) {
              start = 0;
              subpathLength++;
              subpath = segments[0] + pathSeparator + subpath;
            }
            if (start > 0) {
              result = segments[0] + pathSeparator;
            }
            result = prefix + result;
          }
          if (start > 0) {
            result = result + ellipsis + pathSeparator;
          }
          result = result + subpath;
          if (start + subpathLength < segments.length) {
            if (start + subpathLength === segments.length - 1 && segments[segments.length - 1] === "") {
              result = result + pathSeparator;
            } else {
              result = result + pathSeparator + ellipsis;
            }
          }
          shortenedPaths[pathIndex] = result;
        }
      }
    }
    if (match2) {
      shortenedPaths[pathIndex] = originalPath;
    }
  }
  return shortenedPaths;
}

function template(template2, values = /* @__PURE__ */ Object.create(null)) {
  const segments = [];
  let inVariable = false;
  let curVal = "";
  for (const char of template2) {
    if (char === "$" || inVariable && char === "{") {
      if (curVal) {
        segments.push({ value: curVal, type: 0 /* TEXT */ });
      }
      curVal = "";
      inVariable = true;
    } else if (char === "}" && inVariable) {
      const resolved = values[curVal];
      if (typeof resolved === "string") {
        if (resolved.length) {
          segments.push({ value: resolved, type: 1 /* VARIABLE */ });
        }
      } else if (resolved) {
        const prevSegment = segments[segments.length - 1];
        if (!prevSegment || prevSegment.type !== 2 /* SEPARATOR */) {
          segments.push({ value: resolved.label, type: 2 /* SEPARATOR */ });
        }
      }
      curVal = "";
      inVariable = false;
    } else {
      curVal += char;
    }
  }
  if (curVal && !inVariable) {
    segments.push({ value: curVal, type: 0 /* TEXT */ });
  }
  return segments.filter((segment, index2) => {
    if (segment.type === 2 /* SEPARATOR */) {
      const left = segments[index2 - 1];
      const right = segments[index2 + 1];
      return [left, right].every((segment2) => segment2 && (segment2.type === 1 /* VARIABLE */ || segment2.type === 0 /* TEXT */) && segment2.value.length > 0);
    }
    return true;
  }).map((segment) => segment.value).join("");
}

function mnemonicMenuLabel(label3, forceDisableMnemonics) {
  if (isMacintosh || forceDisableMnemonics) {
    return label3.replace(/\(&&\w\)|&&/g, "").replace(/&/g, isMacintosh ? "&" : "&&");
  }
  return label3.replace(/&&|&/g, (m) => m === "&" ? "&&" : "&");
}

function mnemonicButtonLabel(label3, forceDisableMnemonics) {
  const withoutMnemonic = label3.replace(/\(&&\w\)|&&/g, "");
  if (forceDisableMnemonics) {
    return withoutMnemonic;
  }
  if (isMacintosh) {
    return { withMnemonic: withoutMnemonic, withoutMnemonic };
  }
  let withMnemonic;
  if (isWindows) {
    withMnemonic = label3.replace(/&&|&/g, (m) => m === "&" ? "&&" : "&");
  } else {
    withMnemonic = label3.replace(/&&/g, "_");
  }
  return { withMnemonic, withoutMnemonic };
}

function unmnemonicLabel(label3) {
  return label3.replace(/&/g, "&&");
}

function splitRecentLabel(recentLabel) {
  if (recentLabel.endsWith("]")) {
    const lastIndexOfSquareBracket = recentLabel.lastIndexOf(" [", recentLabel.length - 2);
    if (lastIndexOfSquareBracket !== -1) {
      const split = splitName(recentLabel.substring(0, lastIndexOfSquareBracket));
      const remoteNameWithSpace = recentLabel.substring(lastIndexOfSquareBracket);
      return { name: split.name + remoteNameWithSpace, parentPath: split.parentPath };
    }
  }
  return splitName(recentLabel);
}

function splitName(fullPath) {
  const p = fullPath.indexOf("/") !== -1 ? posix : win32;
  const name = p.basename(fullPath);
  const parentPath = p.dirname(fullPath);
  if (name.length) {
    return { name, parentPath };
  }
  return { name: parentPath, parentPath: "" };
}
export { getPathLabel, getRelativePathLabel, normalizeDriveLetter, tildify, untildify, shorten, template, mnemonicMenuLabel, mnemonicButtonLabel, unmnemonicLabel, splitRecentLabel, splitName, normalizedUserHomeCached, ellipsis, unc, urlSchemaRegexp, home };
