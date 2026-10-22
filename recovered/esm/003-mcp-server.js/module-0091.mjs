// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/mcp-server.js
// Original module marker: src/apply-patch-directories.ts
import { __toESM } from "./module-0000.mjs";


// src/apply-patch-directories.ts
var import_promises = require("node:fs/promises");

var import_node_path = __toESM(require("node:path"), 1);

function inside(root, target) {
  const relative = import_node_path.default.relative(root, target);
  return relative === "" || relative !== ".." && !relative.startsWith(`..${import_node_path.default.sep}`) && !import_node_path.default.isAbsolute(relative);
}

var samePath = (a, b) => process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;

var codeOf = (error51) => error51.code;

async function resolvePatchDestination(requestedPath, roots, fail2) {
  const candidates = import_node_path.default.isAbsolute(requestedPath) ? [import_node_path.default.resolve(requestedPath)] : roots.map((root) => import_node_path.default.resolve(root, requestedPath));
  let fallback;
  for (const candidate of candidates) {
    const fileRoot = roots.find((root) => samePath(root, candidate));
    if (fileRoot && import_node_path.default.extname(fileRoot)) {
      const parent = import_node_path.default.dirname(fileRoot);
      if (samePath(await (0, import_promises.realpath)(parent), parent) && (await (0, import_promises.stat)(parent)).isDirectory()) {
        return { requestedPath, absolutePath: candidate, root: fileRoot, missingDirectories: [] };
      }
    }
    let ancestor = import_node_path.default.dirname(candidate);
    const missing = [];
    while (true) {
      let info;
      try {
        info = await (0, import_promises.lstat)(ancestor);
      } catch (error51) {
        if (codeOf(error51) !== "ENOENT") {
          if (codeOf(error51) === "ENOTDIR") throw fail2("NOT_A_DIRECTORY", `A parent component of ${requestedPath} is a file, not a directory.`);
          throw error51;
        }
        const parent = import_node_path.default.dirname(ancestor);
        if (parent === ancestor) break;
        missing.unshift(import_node_path.default.basename(ancestor));
        ancestor = parent;
        continue;
      }
      let realAncestor;
      try {
        realAncestor = await (0, import_promises.realpath)(ancestor);
      } catch (error51) {
        if (info.isSymbolicLink()) throw fail2("PATH_OUTSIDE_WORKSPACE", `Cannot safely resolve the parent symlink of ${requestedPath}.`);
        throw error51;
      }
      const root = roots.find((root2) => inside(root2, realAncestor));
      if (!root) break;
      if (!(await (0, import_promises.stat)(realAncestor)).isDirectory()) throw fail2("NOT_A_DIRECTORY", `A parent component of ${requestedPath} is not a directory.`);
      const absolutePath = import_node_path.default.join(realAncestor, ...missing, import_node_path.default.basename(candidate));
      if (!inside(root, absolutePath)) break;
      const missingDirectories = missing.map((_, index) => import_node_path.default.join(realAncestor, ...missing.slice(0, index + 1)));
      const resolved = { requestedPath, absolutePath, root, missingDirectories };
      if (!missing.length) return resolved;
      fallback ??= resolved;
      break;
    }
  }
  if (fallback) return fallback;
  throw fail2("PATH_OUTSIDE_WORKSPACE", `${requestedPath} is not inside a usable allowed workspace root. Missing parent directories inside an allowed root are supported.`);
}

function patchParentPaths(file2, root) {
  const parents = [];
  for (let current = import_node_path.default.dirname(file2); current !== root && inside(root, current); current = import_node_path.default.dirname(current)) parents.push(current);
  return parents;
}

async function assertPatchParent(file2, root, fail2) {
  const parent = import_node_path.default.dirname(file2);
  if (samePath(file2, root) && import_node_path.default.extname(root)) {
    if (!samePath(await (0, import_promises.realpath)(parent), parent) || !(await (0, import_promises.stat)(parent)).isDirectory()) {
      throw fail2("PATH_CHANGED", `Parent path changed after validation for ${file2}.`);
    }
    return;
  }
  if (!inside(root, parent) || !samePath(await (0, import_promises.realpath)(root), root) || !samePath(await (0, import_promises.realpath)(parent), parent)) {
    throw fail2("PATH_CHANGED", `Parent path changed after validation for ${file2}; re-read before retrying.`);
  }
  if (!(await (0, import_promises.stat)(parent)).isDirectory()) throw fail2("NOT_A_DIRECTORY", `Parent of ${file2} is not a directory.`);
}

var PatchDirectoryTransaction = class {
  constructor(fail2, signal) {
    this.fail = fail2;
    this.signal = signal;
  }
  fail;
  signal;
  created = [];
  /** Called only after the whole patch has passed preflight and acquired its locks. */
  async ensureParents(file2, root, checkPermission) {
    const parents = patchParentPaths(file2, root).reverse();
    for (const directory of parents) {
      if (this.signal?.aborted) throw new DOMException("Patch application was cancelled.", "AbortError");
      await assertPatchParent(directory, root, this.fail);
      let info;
      try {
        info = await (0, import_promises.lstat)(directory);
      } catch (error51) {
        if (codeOf(error51) !== "ENOENT") throw error51;
      }
      if (!info) {
        if (checkPermission && !await checkPermission(directory)) throw this.fail("PERMISSION_DENIED", `Creating directory ${directory} is not permitted by the current policy.`);
        await assertPatchParent(directory, root, this.fail);
        if (this.signal?.aborted) throw new DOMException("Patch application was cancelled.", "AbortError");
        try {
          await (0, import_promises.mkdir)(directory);
          const made = await (0, import_promises.lstat)(directory);
          this.created.push({ directory, root, ino: made.ino, dev: made.dev });
          info = made;
        } catch (error51) {
          if (codeOf(error51) !== "EEXIST") throw error51;
          info = await (0, import_promises.lstat)(directory);
        }
      }
      if (info.isSymbolicLink()) throw this.fail("PATH_CHANGED", `Parent ${directory} became a symlink; no file was installed through it.`);
      if (!info.isDirectory()) throw this.fail("NOT_A_DIRECTORY", `${directory} is not a directory.`);
    }
    await assertPatchParent(file2, root, this.fail);
  }
  /** Remove only our unchanged, empty directories, deepest first. Preserve all other data. */
  async rollback() {
    const failures = [];
    for (const entry of [...this.created].reverse()) {
      try {
        await assertPatchParent(entry.directory, entry.root, this.fail);
        const current = await (0, import_promises.lstat)(entry.directory);
        if (!current.isDirectory() || current.isSymbolicLink() || current.ino !== entry.ino || current.dev !== entry.dev) {
          throw this.fail("PATH_CHANGED", `${entry.directory} was replaced; left untouched.`);
        }
        await (0, import_promises.rmdir)(entry.directory);
      } catch (error51) {
        if (codeOf(error51) !== "ENOENT") failures.push(`${entry.directory}: ${error51.message}`);
      }
    }
    if (failures.length) throw this.fail("ROLLBACK_FAILED", `Created directories could not be safely removed: ${failures.join("; ")}`);
  }
};
export { inside, resolvePatchDestination, patchParentPaths, assertPatchParent, import_promises, import_node_path, samePath, codeOf, PatchDirectoryTransaction };
