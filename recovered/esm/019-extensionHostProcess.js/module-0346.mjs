// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/node/fileSearch.ts
import { spawnRipgrepCmd } from "./module-0347.mjs";
import { getBasenameTerms, getEmptyExpression, getPathTerms, parse3 } from "./module-0185.mjs";
import { prepareQuery } from "./module-0345.mjs";
import { isEqualOrParent } from "./module-0024.mjs";
import { basename, dirname, isAbsolute, join, relative, sep } from "./module-0019.mjs";
import { StopWatch } from "./module-0016.mjs";
import { toErrorMessage } from "./module-0060.mjs";
import { coalesce } from "./module-0006.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { normalizeNFC } from "./module-0034.mjs";
import { equals2, uppercaseFirstLetter } from "./module-0023.mjs";
import { hasSiblingFn, isFilePatternMatch } from "./module-0247.mjs";
import { Promises2 } from "./module-0033.mjs";
import { isNumber } from "./module-0009.mjs";


// src/vs/workbench/services/search/node/fileSearch.ts
import * as childProcess from "child_process";

import * as fs2 from "fs";

import { StringDecoder } from "string_decoder";


// src/vs/workbench/services/search/node/fileSearch.ts
var killCmds = /* @__PURE__ */ new Set();

process.on("exit", () => {
  killCmds.forEach((cmd) => cmd());
});

var FileWalker = class {
  constructor(config, spawnRipgrep = spawnRipgrepCmd) {
    this.spawnRipgrep = spawnRipgrep;
    this.normalizedFilePatternLowercase = null;
    this.maxFilesize = null;
    this.isCanceled = false;
    this.fileWalkSW = null;
    this.cmdSW = null;
    this.cmdResultCount = 0;
    this.killCmds = /* @__PURE__ */ new Set();
    this.config = config;
    this.filePattern = config.filePattern || "";
    const globOptions = config.ignoreGlobCase ? { ignoreCase: true } : void 0;
    this.includePattern = config.includePattern && parse3(config.includePattern, globOptions);
    this.maxResults = config.maxResults || null;
    this.exists = !!config.exists;
    this.walkedPaths = /* @__PURE__ */ Object.create(null);
    this.resultCount = 0;
    this.isLimitHit = false;
    this.directoriesWalked = 0;
    this.filesWalked = 0;
    this.errors = [];
    if (this.filePattern) {
      this.normalizedFilePatternLowercase = config.shouldGlobMatchFilePattern ? null : prepareQuery(this.filePattern).normalizedLowercase;
    }
    this.globalExcludePattern = config.excludePattern && parse3(config.excludePattern, globOptions);
    this.folderExcludePatterns = /* @__PURE__ */ new Map();
    config.folderQueries.forEach((folderQuery) => {
      const folderExcludeExpression = {};
      folderQuery.excludePattern?.forEach((excludePattern) => {
        Object.assign(folderExcludeExpression, excludePattern.pattern || {}, this.config.excludePattern || {});
      });
      if (!folderQuery.excludePattern?.length) {
        Object.assign(folderExcludeExpression, this.config.excludePattern || {});
      }
      const fqPath = folderQuery.folder.fsPath;
      config.folderQueries.map((rootFolderQuery) => rootFolderQuery.folder.fsPath).filter((rootFolder) => rootFolder !== fqPath).forEach((otherRootFolder) => {
        if (isEqualOrParent(otherRootFolder, fqPath, config.ignoreGlobCase)) {
          folderExcludeExpression[relative(fqPath, otherRootFolder)] = true;
        }
      });
      this.folderExcludePatterns.set(fqPath, new AbsoluteAndRelativeParsedExpression(folderExcludeExpression, fqPath, config.ignoreGlobCase));
    });
  }
  cancel() {
    this.isCanceled = true;
    this.killCmds.forEach((cmd) => cmd());
  }
  walk(folderQueries, extraFiles, numThreads, onResult, onMessage, done) {
    this.fileWalkSW = StopWatch.create(false);
    if (this.isCanceled) {
      return done(null, this.isLimitHit);
    }
    extraFiles.forEach((extraFilePath) => {
      const basename3 = basename(extraFilePath.fsPath);
      if (this.globalExcludePattern && this.globalExcludePattern(extraFilePath.fsPath, basename3)) {
        return;
      }
      this.matchFile(onResult, { relativePath: extraFilePath.fsPath, searchPath: void 0 });
    });
    this.cmdSW = StopWatch.create(false);
    this.parallel(folderQueries, (folderQuery, rootFolderDone) => {
      this.call(this.cmdTraversal, this, folderQuery, numThreads, onResult, onMessage, (err) => {
        if (err) {
          const errorMessage = toErrorMessage(err);
          console.error(errorMessage);
          this.errors.push(errorMessage);
          rootFolderDone(err, void 0);
        } else {
          rootFolderDone(null, void 0);
        }
      });
    }, (errors, _result) => {
      this.fileWalkSW.stop();
      const err = errors ? coalesce(errors)[0] : null;
      done(err, this.isLimitHit);
    });
  }
  parallel(list2, fn, callback) {
    const results = new Array(list2.length);
    const errors = new Array(list2.length);
    let didErrorOccur = false;
    let doneCount = 0;
    if (list2.length === 0) {
      return callback(null, []);
    }
    list2.forEach((item, index) => {
      fn(item, (error, result) => {
        if (error) {
          didErrorOccur = true;
          results[index] = null;
          errors[index] = error;
        } else {
          results[index] = result;
          errors[index] = null;
        }
        if (++doneCount === list2.length) {
          return callback(didErrorOccur ? errors : null, results);
        }
      });
    });
  }
  call(fun, that, ...args2) {
    try {
      fun.apply(that, args2);
    } catch (e) {
      args2[args2.length - 1](e);
    }
  }
  async cmdTraversal(folderQuery, numThreads, onResult, onMessage, cb) {
    const rootFolder = folderQuery.folder.fsPath;
    const isMac = isMacintosh;
    let leftover = "";
    const tree = this.initDirectoryTree();
    let ripgrep;
    try {
      ripgrep = await this.spawnRipgrep(this.config, folderQuery, this.config.includePattern, this.folderExcludePatterns.get(folderQuery.folder.fsPath).expression, numThreads);
    } catch (err) {
      cb(err instanceof Error ? err : new Error(String(err)));
      return;
    }
    const cmd = ripgrep.cmd;
    const killCmd = () => {
      if (cmd.pid !== void 0) {
        cmd.kill();
      }
    };
    this.killCmds.add(killCmd);
    killCmds.add(killCmd);
    let done = (err) => {
      this.killCmds.delete(killCmd);
      killCmds.delete(killCmd);
      done = () => {
      };
      cb(err);
    };
    if (this.isCanceled) {
      cmd.once("error", () => {
      });
      cmd.once("close", () => done());
      killCmd();
      return;
    }
    const noSiblingsClauses = !Object.keys(ripgrep.siblingClauses).length;
    const escapedArgs = ripgrep.rgArgs.args.map((arg) => arg.match(/^-/) ? arg : `'${arg}'`).join(" ");
    let rgCmd = `${ripgrep.rgDiskPath} ${escapedArgs}
 - cwd: ${ripgrep.cwd}`;
    if (ripgrep.rgArgs.siblingClauses) {
      rgCmd += `
 - Sibling clauses: ${JSON.stringify(ripgrep.rgArgs.siblingClauses)}`;
    }
    onMessage({ message: rgCmd });
    this.cmdResultCount = 0;
    this.collectStdout(cmd, "utf8", onMessage, (err, stdout, last) => {
      if (err) {
        done(err);
        return;
      }
      if (this.isLimitHit) {
        done();
        return;
      }
      const normalized = leftover + (isMac ? normalizeNFC(stdout || "") : stdout);
      const relativeFiles = normalized.split("\n");
      if (last) {
        const n = relativeFiles.length;
        relativeFiles[n - 1] = relativeFiles[n - 1].trim();
        if (!relativeFiles[n - 1]) {
          relativeFiles.pop();
        }
      } else {
        leftover = relativeFiles.pop() || "";
      }
      if (relativeFiles.length && relativeFiles[0].indexOf("\n") !== -1) {
        done(new Error("Splitting up files failed"));
        return;
      }
      this.cmdResultCount += relativeFiles.length;
      if (noSiblingsClauses) {
        for (const relativePath2 of relativeFiles) {
          this.matchFile(onResult, { base: rootFolder, relativePath: relativePath2, searchPath: this.getSearchPath(folderQuery, relativePath2) });
          if (this.isLimitHit) {
            killCmd();
            break;
          }
        }
        if (last || this.isLimitHit) {
          done();
        }
        return;
      }
      this.addDirectoryEntries(folderQuery, tree, rootFolder, relativeFiles, onResult);
      if (last) {
        this.matchDirectoryTree(tree, rootFolder, onResult);
        done();
      }
    });
  }
  /**
   * Public for testing.
   */
  spawnFindCmd(folderQuery) {
    const excludePattern = this.folderExcludePatterns.get(folderQuery.folder.fsPath);
    const basenames = excludePattern.getBasenameTerms();
    const pathTerms = excludePattern.getPathTerms();
    const args2 = ["-L", "."];
    if (basenames.length || pathTerms.length) {
      args2.push("-not", "(", "(");
      for (const basename3 of basenames) {
        args2.push("-name", basename3);
        args2.push("-o");
      }
      for (const path of pathTerms) {
        args2.push("-path", path);
        args2.push("-o");
      }
      args2.pop();
      args2.push(")", "-prune", ")");
    }
    args2.push("-type", "f");
    return childProcess.spawn("find", args2, { cwd: folderQuery.folder.fsPath });
  }
  /**
   * Public for testing.
   */
  readStdout(cmd, encoding, cb) {
    let all = "";
    this.collectStdout(cmd, encoding, () => {
    }, (err, stdout, last) => {
      if (err) {
        cb(err);
        return;
      }
      all += stdout;
      if (last) {
        cb(null, all);
      }
    });
  }
  collectStdout(cmd, encoding, onMessage, cb) {
    let onData = (err, stdout, last) => {
      if (err || last) {
        onData = () => {
        };
        this.cmdSW?.stop();
      }
      cb(err, stdout, last);
    };
    let gotData = false;
    if (cmd.stdout) {
      this.forwardData(cmd.stdout, encoding, onData);
      cmd.stdout.once("data", () => gotData = true);
    } else {
      onMessage({ message: "stdout is null" });
    }
    let stderr;
    if (cmd.stderr) {
      stderr = this.collectData(cmd.stderr);
    } else {
      onMessage({ message: "stderr is null" });
    }
    cmd.on("error", (err) => {
      onData(err);
    });
    cmd.on("close", (code) => {
      let stderrText;
      if (!gotData && (stderrText = this.decodeData(stderr, encoding)) && rgErrorMsgForDisplay(stderrText)) {
        onData(new Error(`command failed with error code ${code}: ${this.decodeData(stderr, encoding)}`));
      } else {
        if (this.exists && code === 0) {
          this.isLimitHit = true;
        }
        onData(null, "", true);
      }
    });
  }
  forwardData(stream, encoding, cb) {
    const decoder = new StringDecoder(encoding);
    stream.on("data", (data) => {
      cb(null, decoder.write(data));
    });
    return decoder;
  }
  collectData(stream) {
    const buffers = [];
    stream.on("data", (data) => {
      buffers.push(data);
    });
    return buffers;
  }
  decodeData(buffers, encoding) {
    const decoder = new StringDecoder(encoding);
    return buffers.map((buffer) => decoder.write(buffer)).join("");
  }
  initDirectoryTree() {
    const tree = {
      rootEntries: [],
      pathToEntries: /* @__PURE__ */ Object.create(null)
    };
    tree.pathToEntries["."] = tree.rootEntries;
    return tree;
  }
  addDirectoryEntries(folderQuery, { pathToEntries }, base, relativeFiles, onResult) {
    const filePatternMatch = this.filePattern && relativeFiles.find((f) => equals2(f, this.filePattern, this.config.ignoreGlobCase));
    if (filePatternMatch) {
      this.matchFile(onResult, {
        base,
        relativePath: filePatternMatch,
        searchPath: this.getSearchPath(folderQuery, filePatternMatch)
      });
    }
    const add = (relativePath2) => {
      const basename3 = basename(relativePath2);
      const dirname3 = dirname(relativePath2);
      let entries = pathToEntries[dirname3];
      if (!entries) {
        entries = pathToEntries[dirname3] = [];
        add(dirname3);
      }
      entries.push({
        base,
        relativePath: relativePath2,
        basename: basename3,
        searchPath: this.getSearchPath(folderQuery, relativePath2)
      });
    };
    relativeFiles.forEach(add);
  }
  matchDirectoryTree({ rootEntries, pathToEntries }, rootFolder, onResult) {
    const self2 = this;
    const excludePattern = this.folderExcludePatterns.get(rootFolder);
    const filePattern = this.filePattern;
    const ignoreGlobCase = this.config.ignoreGlobCase;
    function matchDirectory(entries) {
      self2.directoriesWalked++;
      const hasSibling = hasSiblingFn(() => entries.map((entry) => entry.basename));
      for (let i = 0, n = entries.length; i < n; i++) {
        const entry = entries[i];
        const { relativePath: relativePath2, basename: basename3 } = entry;
        if (excludePattern.test(relativePath2, basename3, !equals2(filePattern, basename3, ignoreGlobCase) ? hasSibling : void 0)) {
          continue;
        }
        const sub = pathToEntries[relativePath2];
        if (sub) {
          matchDirectory(sub);
        } else {
          self2.filesWalked++;
          if (equals2(relativePath2, filePattern, ignoreGlobCase)) {
            continue;
          }
          self2.matchFile(onResult, entry);
        }
        if (self2.isLimitHit) {
          break;
        }
      }
    }
    matchDirectory(rootEntries);
  }
  getStats() {
    return {
      cmdTime: this.cmdSW.elapsed(),
      fileWalkTime: this.fileWalkSW.elapsed(),
      directoriesWalked: this.directoriesWalked,
      filesWalked: this.filesWalked,
      cmdResultCount: this.cmdResultCount
    };
  }
  doWalk(folderQuery, relativeParentPath, files, onResult, done) {
    const rootFolder = folderQuery.folder;
    const hasSibling = hasSiblingFn(() => files);
    this.parallel(files, (file, clb) => {
      if (this.isCanceled || this.isLimitHit) {
        return clb(null);
      }
      const currentRelativePath = relativeParentPath ? [relativeParentPath, file].join(sep) : file;
      if (this.folderExcludePatterns.get(folderQuery.folder.fsPath).test(currentRelativePath, file, !equals2(this.config.filePattern, file, this.config.ignoreGlobCase) ? hasSibling : void 0)) {
        return clb(null);
      }
      const currentAbsolutePath = [rootFolder.fsPath, currentRelativePath].join(sep);
      fs2.lstat(currentAbsolutePath, (error, lstat2) => {
        if (error || this.isCanceled || this.isLimitHit) {
          return clb(null);
        }
        this.statLinkIfNeeded(currentAbsolutePath, lstat2, (error2, stat2) => {
          if (error2 || this.isCanceled || this.isLimitHit) {
            return clb(null);
          }
          if (stat2.isDirectory()) {
            this.directoriesWalked++;
            return this.realPathIfNeeded(currentAbsolutePath, lstat2, (error3, realpath4) => {
              if (error3 || this.isCanceled || this.isLimitHit) {
                return clb(null);
              }
              realpath4 = realpath4 || "";
              if (this.walkedPaths[realpath4]) {
                return clb(null);
              }
              this.walkedPaths[realpath4] = true;
              return Promises2.readdir(currentAbsolutePath).then((children) => {
                if (this.isCanceled || this.isLimitHit) {
                  return clb(null);
                }
                this.doWalk(folderQuery, currentRelativePath, children, onResult, (err) => clb(err || null));
              }, (error4) => {
                clb(null);
              });
            });
          } else {
            this.filesWalked++;
            if (equals2(currentRelativePath, this.filePattern, this.config.ignoreGlobCase)) {
              return clb(null, void 0);
            }
            if (this.maxFilesize && isNumber(stat2.size) && stat2.size > this.maxFilesize) {
              return clb(null, void 0);
            }
            this.matchFile(onResult, {
              base: rootFolder.fsPath,
              relativePath: currentRelativePath,
              searchPath: this.getSearchPath(folderQuery, currentRelativePath)
            });
          }
          return clb(null, void 0);
        });
      });
    }, (error) => {
      const filteredErrors = error ? coalesce(error) : error;
      return done(filteredErrors && filteredErrors.length > 0 ? filteredErrors[0] : void 0);
    });
  }
  matchFile(onResult, candidate) {
    if (this.isFileMatch(candidate) && (!this.includePattern || this.includePattern(candidate.relativePath, basename(candidate.relativePath)))) {
      this.resultCount++;
      if (this.exists || this.maxResults && this.resultCount > this.maxResults) {
        this.isLimitHit = true;
      }
      if (!this.isLimitHit) {
        onResult(candidate);
      }
    }
  }
  isFileMatch(candidate) {
    if (this.filePattern) {
      if (this.filePattern === "*") {
        return true;
      }
      if (this.normalizedFilePatternLowercase) {
        return isFilePatternMatch(candidate, this.normalizedFilePatternLowercase);
      } else if (this.filePattern) {
        return isFilePatternMatch(candidate, this.filePattern, false, this.config.ignoreGlobCase);
      }
    }
    return true;
  }
  statLinkIfNeeded(path, lstat2, clb) {
    if (lstat2.isSymbolicLink()) {
      return fs2.stat(path, clb);
    }
    return clb(null, lstat2);
  }
  realPathIfNeeded(path, lstat2, clb) {
    if (lstat2.isSymbolicLink()) {
      return fs2.realpath(path, (error, realpath4) => {
        if (error) {
          return clb(error);
        }
        return clb(null, realpath4);
      });
    }
    return clb(null, path);
  }
  /**
   * If we're searching for files in multiple workspace folders, then better prepend the
   * name of the workspace folder to the path of the file. This way we'll be able to
   * better filter files that are all on the top of a workspace folder and have all the
   * same name. A typical example are `package.json` or `README.md` files.
   */
  getSearchPath(folderQuery, relativePath2) {
    if (folderQuery.folderName) {
      return join(folderQuery.folderName, relativePath2);
    }
    return relativePath2;
  }
};

var Engine = class {
  constructor(config, numThreads) {
    this.folderQueries = config.folderQueries;
    this.extraFiles = config.extraFileResources || [];
    this.numThreads = numThreads;
    this.walker = new FileWalker(config);
  }
  search(onResult, onProgress, done) {
    this.walker.walk(this.folderQueries, this.extraFiles, this.numThreads, onResult, onProgress, (err, isLimitHit) => {
      done(err, {
        limitHit: isLimitHit,
        stats: this.walker.getStats(),
        messages: []
      });
    });
  }
  cancel() {
    this.walker.cancel();
  }
};

var AbsoluteAndRelativeParsedExpression = class {
  constructor(expression, root, ignoreCase) {
    this.expression = expression;
    this.root = root;
    this.ignoreCase = ignoreCase;
    this.init(expression);
  }
  /**
   * Split the IExpression into its absolute and relative components, and glob.parse them separately.
   */
  init(expr) {
    let absoluteGlobExpr;
    let relativeGlobExpr;
    Object.keys(expr).filter((key) => expr[key]).forEach((key) => {
      if (isAbsolute(key)) {
        absoluteGlobExpr = absoluteGlobExpr || getEmptyExpression();
        absoluteGlobExpr[key] = expr[key];
      } else {
        relativeGlobExpr = relativeGlobExpr || getEmptyExpression();
        relativeGlobExpr[key] = expr[key];
      }
    });
    const globOptions = { trimForExclusions: true, ignoreCase: this.ignoreCase };
    this.absoluteParsedExpr = absoluteGlobExpr && parse3(absoluteGlobExpr, globOptions);
    this.relativeParsedExpr = relativeGlobExpr && parse3(relativeGlobExpr, globOptions);
  }
  test(_path, basename3, hasSibling) {
    return this.relativeParsedExpr && this.relativeParsedExpr(_path, basename3, hasSibling) || this.absoluteParsedExpr && this.absoluteParsedExpr(join(this.root, _path), basename3, hasSibling);
  }
  getBasenameTerms() {
    const basenameTerms = [];
    if (this.absoluteParsedExpr) {
      basenameTerms.push(...getBasenameTerms(this.absoluteParsedExpr));
    }
    if (this.relativeParsedExpr) {
      basenameTerms.push(...getBasenameTerms(this.relativeParsedExpr));
    }
    return basenameTerms;
  }
  getPathTerms() {
    const pathTerms = [];
    if (this.absoluteParsedExpr) {
      pathTerms.push(...getPathTerms(this.absoluteParsedExpr));
    }
    if (this.relativeParsedExpr) {
      pathTerms.push(...getPathTerms(this.relativeParsedExpr));
    }
    return pathTerms;
  }
};

function rgErrorMsgForDisplay(msg) {
  const lines = msg.trim().split("\n");
  const firstLine = lines[0].trim();
  if (firstLine.startsWith("Error parsing regex")) {
    return firstLine;
  }
  if (firstLine.startsWith("regex parse error")) {
    return uppercaseFirstLetter(lines[lines.length - 1].trim());
  }
  if (firstLine.startsWith("error parsing glob") || firstLine.startsWith("unsupported encoding")) {
    return firstLine.charAt(0).toUpperCase() + firstLine.substr(1);
  }
  if (firstLine === `Literal '\\n' not allowed.`) {
    return `Literal '\\n' currently not supported`;
  }
  if (firstLine.startsWith("Literal ")) {
    return firstLine;
  }
  return void 0;
}
export { rgErrorMsgForDisplay, childProcess, fs2, StringDecoder, killCmds, FileWalker, Engine, AbsoluteAndRelativeParsedExpression };
