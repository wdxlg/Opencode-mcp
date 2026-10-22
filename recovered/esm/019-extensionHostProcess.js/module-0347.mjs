// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/node/ripgrepFileSearch.ts
import { rgDiskPath } from "./module-0349.mjs";
import { anchorGlob } from "./module-0348.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { normalizeNFD } from "./module-0034.mjs";
import { isAbsolute, join } from "./module-0019.mjs";
import { rtrim } from "./module-0023.mjs";
import { getRoot } from "./module-0024.mjs";


// src/vs/workbench/services/search/node/ripgrepFileSearch.ts
import * as cp5 from "child_process";


// src/vs/workbench/services/search/node/ripgrepFileSearch.ts
async function spawnRipgrepCmd(config, folderQuery, includePattern, excludePattern, numThreads) {
  const rgArgs = getRgArgs(config, folderQuery, includePattern, excludePattern, numThreads);
  const cwd2 = folderQuery.folder.fsPath;
  const resolvedRgDiskPath = await rgDiskPath();
  return {
    cmd: cp5.spawn(resolvedRgDiskPath, rgArgs.args, { cwd: cwd2 }),
    rgDiskPath: resolvedRgDiskPath,
    siblingClauses: rgArgs.siblingClauses,
    rgArgs,
    cwd: cwd2
  };
}

function getRgArgs(config, folderQuery, includePattern, excludePattern, numThreads) {
  const args2 = ["--files", "--hidden", "--case-sensitive", "--no-require-git"];
  if (config.ignoreGlobCase || folderQuery.ignoreGlobCase) {
    args2.push("--glob-case-insensitive");
    args2.push("--ignore-file-case-insensitive");
  }
  foldersToIncludeGlobs([folderQuery], includePattern, false).forEach((globArg) => {
    const inclusion = anchorGlob(globArg);
    args2.push("-g", inclusion);
    if (isMacintosh) {
      const normalized = normalizeNFD(inclusion);
      if (normalized !== inclusion) {
        args2.push("-g", normalized);
      }
    }
  });
  const rgGlobs = foldersToRgExcludeGlobs([folderQuery], excludePattern, void 0, false);
  rgGlobs.globArgs.forEach((globArg) => {
    const exclusion = `!${anchorGlob(globArg)}`;
    args2.push("-g", exclusion);
    if (isMacintosh) {
      const normalized = normalizeNFD(exclusion);
      if (normalized !== exclusion) {
        args2.push("-g", normalized);
      }
    }
  });
  if (folderQuery.disregardIgnoreFiles !== false) {
    args2.push("--no-ignore");
  } else if (folderQuery.disregardParentIgnoreFiles !== false) {
    args2.push("--no-ignore-parent");
  }
  if (!folderQuery.ignoreSymlinks) {
    args2.push("--follow");
  }
  if (config.exists) {
    args2.push("--quiet");
  }
  if (numThreads) {
    args2.push("--threads", `${numThreads}`);
  }
  args2.push("--no-config");
  if (folderQuery.disregardGlobalIgnoreFiles) {
    args2.push("--no-ignore-global");
  }
  return {
    args: args2,
    siblingClauses: rgGlobs.siblingClauses
  };
}

function foldersToRgExcludeGlobs(folderQueries, globalExclude, excludesToSkip, absoluteGlobs = true) {
  const globArgs = [];
  let siblingClauses = {};
  folderQueries.forEach((folderQuery) => {
    const totalExcludePattern = Object.assign({}, folderQuery.excludePattern || {}, globalExclude || {});
    const result = globExprsToRgGlobs(totalExcludePattern, absoluteGlobs ? folderQuery.folder.fsPath : void 0, excludesToSkip);
    globArgs.push(...result.globArgs);
    if (result.siblingClauses) {
      siblingClauses = Object.assign(siblingClauses, result.siblingClauses);
    }
  });
  return { globArgs, siblingClauses };
}

function foldersToIncludeGlobs(folderQueries, globalInclude, absoluteGlobs = true) {
  const globArgs = [];
  folderQueries.forEach((folderQuery) => {
    const totalIncludePattern = Object.assign({}, globalInclude || {}, folderQuery.includePattern || {});
    const result = globExprsToRgGlobs(totalIncludePattern, absoluteGlobs ? folderQuery.folder.fsPath : void 0);
    globArgs.push(...result.globArgs);
  });
  return globArgs;
}

function globExprsToRgGlobs(patterns, folder, excludesToSkip) {
  const globArgs = [];
  const siblingClauses = {};
  Object.keys(patterns).forEach((key) => {
    if (excludesToSkip && excludesToSkip.has(key)) {
      return;
    }
    if (!key) {
      return;
    }
    const value = patterns[key];
    key = trimTrailingSlash(folder ? getAbsoluteGlob(folder, key) : key);
    if (key.startsWith("\\\\")) {
      key = "\\\\" + key.substr(2).replace(/\\/g, "/");
    } else {
      key = key.replace(/\\/g, "/");
    }
    if (typeof value === "boolean" && value) {
      if (key.startsWith("\\\\")) {
        key += "**";
      }
      globArgs.push(fixDriveC(key));
    } else if (value && value.when) {
      siblingClauses[key] = value;
    }
  });
  return { globArgs, siblingClauses };
}

function getAbsoluteGlob(folder, key) {
  return isAbsolute(key) ? key : join(folder, key);
}

function trimTrailingSlash(str) {
  str = rtrim(str, "\\");
  return rtrim(str, "/");
}

function fixDriveC(path) {
  const root = getRoot(path);
  return root.toLowerCase() === "c:/" ? path.replace(/^c:[/\\]/i, "/") : path;
}
export { spawnRipgrepCmd, getRgArgs, foldersToRgExcludeGlobs, foldersToIncludeGlobs, globExprsToRgGlobs, getAbsoluteGlob, trimTrailingSlash, fixDriveC, cp5 };
