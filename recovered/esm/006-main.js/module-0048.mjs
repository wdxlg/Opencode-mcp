// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/labels.ts
import { OS, init_platform, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { init_path, posix, win32 } from "./module-0008.mjs";
import { extUri, extUriIgnorePathCase, init_resources } from "./module-0032.mjs";
import { hasDriveLetter, init_extpath, toSlashes } from "./module-0028.mjs";
import { init_strings, rtrim, startsWithIgnoreCase } from "./module-0027.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/labels.ts
function getPathLabel(resource, formatting) {
  const { os: os6, tildify: tildifier, relative: relatifier } = formatting;
  if (relatifier) {
    const relativePath2 = getRelativePathLabel(resource, relatifier, os6);
    if (typeof relativePath2 === "string") {
      return relativePath2;
    }
  }
  let absolutePath = resource.fsPath;
  if (os6 === 1 /* Windows */ && !isWindows2) {
    absolutePath = absolutePath.replace(/\//g, "\\");
  } else if (os6 !== 1 /* Windows */ && isWindows2) {
    absolutePath = absolutePath.replace(/\\/g, "/");
  }
  if (os6 !== 1 /* Windows */ && tildifier?.userHome) {
    const userHome = tildifier.userHome.fsPath;
    let userHomeCandidate;
    if (resource.scheme !== tildifier.userHome.scheme && resource.path[0] === posix.sep && resource.path[1] !== posix.sep) {
      userHomeCandidate = tildifier.userHome.with({ path: resource.path }).fsPath;
    } else {
      userHomeCandidate = absolutePath;
    }
    absolutePath = tildify(userHomeCandidate, userHome, os6);
  }
  const pathLib = os6 === 1 /* Windows */ ? win32 : posix;
  return pathLib.normalize(normalizeDriveLetter(absolutePath, os6 === 1 /* Windows */));
}

function getRelativePathLabel(resource, relativePathProvider, os6) {
  const pathLib = os6 === 1 /* Windows */ ? win32 : posix;
  const extUriLib = os6 === 3 /* Linux */ ? extUri : extUriIgnorePathCase;
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

function normalizeDriveLetter(path4, isWindowsOS = isWindows2) {
  if (hasDriveLetter(path4, isWindowsOS)) {
    return path4.charAt(0).toUpperCase() + path4.slice(1);
  }
  return path4;
}

function tildify(path4, userHome, os6 = OS) {
  if (os6 === 1 /* Windows */ || !path4 || !userHome) {
    return path4;
  }
  let normalizedUserHome = normalizedUserHomeCached.original === userHome ? normalizedUserHomeCached.normalized : void 0;
  if (!normalizedUserHome) {
    normalizedUserHome = userHome;
    if (isWindows2) {
      normalizedUserHome = toSlashes(normalizedUserHome);
    }
    normalizedUserHome = `${rtrim(normalizedUserHome, posix.sep)}${posix.sep}`;
    normalizedUserHomeCached = { original: userHome, normalized: normalizedUserHome };
  }
  let normalizedPath = path4;
  if (isWindows2) {
    normalizedPath = toSlashes(normalizedPath);
  }
  if (os6 === 3 /* Linux */ ? normalizedPath.startsWith(normalizedUserHome) : startsWithIgnoreCase(normalizedPath, normalizedUserHome)) {
    return `~/${normalizedPath.substr(normalizedUserHome.length)}`;
  }
  return path4;
}

function mnemonicMenuLabel(label, forceDisableMnemonics) {
  if (isMacintosh || forceDisableMnemonics) {
    return label.replace(/\(&&\w\)|&&/g, "").replace(/&/g, isMacintosh ? "&" : "&&");
  }
  return label.replace(/&&|&/g, (m) => m === "&" ? "&&" : "&");
}

function mnemonicButtonLabel(label, forceDisableMnemonics) {
  const withoutMnemonic = label.replace(/\(&&\w\)|&&/g, "");
  if (forceDisableMnemonics) {
    return withoutMnemonic;
  }
  if (isMacintosh) {
    return { withMnemonic: withoutMnemonic, withoutMnemonic };
  }
  let withMnemonic;
  if (isWindows2) {
    withMnemonic = label.replace(/&&|&/g, (m) => m === "&" ? "&&" : "&");
  } else {
    withMnemonic = label.replace(/&&/g, "_");
  }
  return { withMnemonic, withoutMnemonic };
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

var normalizedUserHomeCached;

var init_labels = __esm({
  "src/vs/base/common/labels.ts"() {
    init_extpath();
    init_path();
    init_platform();
    init_resources();
    init_strings();
    normalizedUserHomeCached = /* @__PURE__ */ Object.create(null);
  }
});
export { getPathLabel, getRelativePathLabel, normalizeDriveLetter, tildify, mnemonicMenuLabel, mnemonicButtonLabel, splitRecentLabel, splitName, normalizedUserHomeCached, init_labels };
