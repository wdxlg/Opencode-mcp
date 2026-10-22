// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/labels.ts
import { sep } from "./module-0018.mjs";


// src/vs/base/common/labels.ts
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
export { untildify, shorten, ellipsis, unc, urlSchemaRegexp, home };
