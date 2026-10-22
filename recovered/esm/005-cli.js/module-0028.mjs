// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/resources.ts
import { URI, init_uri, uriToFsPath } from "./module-0026.mjs";
import { __esm } from "./module-0000.mjs";
import { init_charCode } from "./module-0019.mjs";
import { getRoot, init_extpath, isEqualOrParent, toPosixPath, toSlashes } from "./module-0024.mjs";
import { Schemas, init_network } from "./module-0027.mjs";
import { dirname3, init_path, normalize, posix, relative2, resolve, sep } from "./module-0004.mjs";
import { init_platform, isLinux, isWindows2 } from "./module-0002.mjs";
import { compare, equalsIgnoreCase, init_strings } from "./module-0023.mjs";


// src/vs/base/common/resources.ts
function originalFSPath(uri) {
  return uriToFsPath(uri, true);
}

var ExtUri, extUri, extUriBiasedIgnorePathCase, extUriIgnorePathCase, isEqual2, isEqualOrParent2, getComparisonKey, basenameOrAuthority, basename2, extname2, dirname4, joinPath, normalizePath, relativePath, resolvePath, isAbsolutePath, isEqualAuthority, hasTrailingPathSeparator, removeTrailingPathSeparator, addTrailingPathSeparator, DataUri;

var init_resources = __esm({
  "src/vs/base/common/resources.ts"() {
    init_charCode();
    init_extpath();
    init_network();
    init_path();
    init_platform();
    init_strings();
    init_uri();
    ExtUri = class {
      constructor(_ignorePathCasing) {
        this._ignorePathCasing = _ignorePathCasing;
      }
      compare(uri1, uri2, ignoreFragment = false) {
        if (uri1 === uri2) {
          return 0;
        }
        return compare(this.getComparisonKey(uri1, ignoreFragment), this.getComparisonKey(uri2, ignoreFragment));
      }
      isEqual(uri1, uri2, ignoreFragment = false) {
        if (uri1 === uri2) {
          return true;
        }
        if (!uri1 || !uri2) {
          return false;
        }
        return this.getComparisonKey(uri1, ignoreFragment) === this.getComparisonKey(uri2, ignoreFragment);
      }
      getComparisonKey(uri, ignoreFragment = false) {
        return uri.with({
          path: this._ignorePathCasing(uri) ? uri.path.toLowerCase() : void 0,
          fragment: ignoreFragment ? null : void 0
        }).toString();
      }
      ignorePathCasing(uri) {
        return this._ignorePathCasing(uri);
      }
      isEqualOrParent(base, parentCandidate, ignoreFragment = false) {
        if (base.scheme === parentCandidate.scheme) {
          if (base.scheme === Schemas.file) {
            return isEqualOrParent(originalFSPath(base), originalFSPath(parentCandidate), this._ignorePathCasing(base)) && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
          }
          if (isEqualAuthority(base.authority, parentCandidate.authority)) {
            return isEqualOrParent(base.path, parentCandidate.path, this._ignorePathCasing(base), true) && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
          }
        }
        return false;
      }
      // --- path math
      joinPath(resource, ...pathFragment) {
        return URI.joinPath(resource, ...pathFragment);
      }
      basenameOrAuthority(resource) {
        return basename2(resource) || resource.authority;
      }
      basename(resource, suffix) {
        return posix.basename(resource.path, suffix);
      }
      extname(resource) {
        return posix.extname(resource.path);
      }
      dirname(resource) {
        if (resource.path.length === 0) {
          return resource;
        }
        let dirname6;
        if (resource.scheme === Schemas.file) {
          dirname6 = URI.file(dirname3(originalFSPath(resource))).path;
        } else {
          dirname6 = posix.dirname(resource.path);
          if (resource.authority && dirname6.length && dirname6.charCodeAt(0) !== 47 /* Slash */) {
            console.error(`dirname("${resource.toString})) resulted in a relative path`);
            dirname6 = "/";
          }
        }
        return resource.with({
          path: dirname6
        });
      }
      normalizePath(resource) {
        if (!resource.path.length) {
          return resource;
        }
        let normalizedPath;
        if (resource.scheme === Schemas.file) {
          normalizedPath = URI.file(normalize(originalFSPath(resource))).path;
        } else {
          normalizedPath = posix.normalize(resource.path);
        }
        return resource.with({
          path: normalizedPath
        });
      }
      relativePath(from, to) {
        if (from.scheme !== to.scheme || !isEqualAuthority(from.authority, to.authority)) {
          return void 0;
        }
        if (from.scheme === Schemas.file) {
          const relativePath2 = relative2(originalFSPath(from), originalFSPath(to));
          return isWindows2 ? toSlashes(relativePath2) : relativePath2;
        }
        let fromPath = from.path || "/";
        const toPath = to.path || "/";
        if (this._ignorePathCasing(from)) {
          let i = 0;
          for (const len = Math.min(fromPath.length, toPath.length); i < len; i++) {
            if (fromPath.charCodeAt(i) !== toPath.charCodeAt(i)) {
              if (fromPath.charAt(i).toLowerCase() !== toPath.charAt(i).toLowerCase()) {
                break;
              }
            }
          }
          fromPath = toPath.substr(0, i) + fromPath.substr(i);
        }
        return posix.relative(fromPath, toPath);
      }
      resolvePath(base, path3) {
        if (base.scheme === Schemas.file) {
          const newURI = URI.file(resolve(originalFSPath(base), path3));
          return base.with({
            authority: newURI.authority,
            path: newURI.path
          });
        }
        path3 = toPosixPath(path3);
        return base.with({
          path: posix.resolve(base.path, path3)
        });
      }
      // --- misc
      isAbsolutePath(resource) {
        return !!resource.path && resource.path[0] === "/";
      }
      isEqualAuthority(a1, a2) {
        return a1 === a2 || a1 !== void 0 && a2 !== void 0 && equalsIgnoreCase(a1, a2);
      }
      hasTrailingPathSeparator(resource, sep2 = sep) {
        if (resource.scheme === Schemas.file) {
          const fsp = originalFSPath(resource);
          return fsp.length > getRoot(fsp).length && fsp[fsp.length - 1] === sep2;
        } else {
          const p = resource.path;
          return p.length > 1 && p.charCodeAt(p.length - 1) === 47 /* Slash */ && !/^[a-zA-Z]:(\/$|\\$)/.test(resource.fsPath);
        }
      }
      removeTrailingPathSeparator(resource, sep2 = sep) {
        if (hasTrailingPathSeparator(resource, sep2)) {
          return resource.with({ path: resource.path.substr(0, resource.path.length - 1) });
        }
        return resource;
      }
      addTrailingPathSeparator(resource, sep2 = sep) {
        let isRootSep = false;
        if (resource.scheme === Schemas.file) {
          const fsp = originalFSPath(resource);
          isRootSep = fsp !== void 0 && fsp.length === getRoot(fsp).length && fsp[fsp.length - 1] === sep2;
        } else {
          sep2 = "/";
          const p = resource.path;
          isRootSep = p.length === 1 && p.charCodeAt(p.length - 1) === 47 /* Slash */;
        }
        if (!isRootSep && !hasTrailingPathSeparator(resource, sep2)) {
          return resource.with({ path: resource.path + "/" });
        }
        return resource;
      }
    };
    extUri = new ExtUri(() => false);
    extUriBiasedIgnorePathCase = new ExtUri((uri) => {
      return uri.scheme === Schemas.file ? !isLinux : true;
    });
    extUriIgnorePathCase = new ExtUri((_) => true);
    isEqual2 = extUri.isEqual.bind(extUri);
    isEqualOrParent2 = extUri.isEqualOrParent.bind(extUri);
    getComparisonKey = extUri.getComparisonKey.bind(extUri);
    basenameOrAuthority = extUri.basenameOrAuthority.bind(extUri);
    basename2 = extUri.basename.bind(extUri);
    extname2 = extUri.extname.bind(extUri);
    dirname4 = extUri.dirname.bind(extUri);
    joinPath = extUri.joinPath.bind(extUri);
    normalizePath = extUri.normalizePath.bind(extUri);
    relativePath = extUri.relativePath.bind(extUri);
    resolvePath = extUri.resolvePath.bind(extUri);
    isAbsolutePath = extUri.isAbsolutePath.bind(extUri);
    isEqualAuthority = extUri.isEqualAuthority.bind(extUri);
    hasTrailingPathSeparator = extUri.hasTrailingPathSeparator.bind(extUri);
    removeTrailingPathSeparator = extUri.removeTrailingPathSeparator.bind(extUri);
    addTrailingPathSeparator = extUri.addTrailingPathSeparator.bind(extUri);
    ((DataUri2) => {
      DataUri2.META_DATA_LABEL = "label";
      DataUri2.META_DATA_DESCRIPTION = "description";
      DataUri2.META_DATA_SIZE = "size";
      DataUri2.META_DATA_MIME = "mime";
      function parseMetaData(dataUri) {
        const metadata = /* @__PURE__ */ new Map();
        const meta = dataUri.path.substring(dataUri.path.indexOf(";") + 1, dataUri.path.lastIndexOf(";"));
        meta.split(";").forEach((property) => {
          const [key, value] = property.split(":");
          if (key && value) {
            metadata.set(key, value);
          }
        });
        const mime = dataUri.path.substring(0, dataUri.path.indexOf(";"));
        if (mime) {
          metadata.set(DataUri2.META_DATA_MIME, mime);
        }
        return metadata;
      }
      DataUri2.parseMetaData = parseMetaData;
    })(DataUri || (DataUri = {}));
  }
});
export { originalFSPath, ExtUri, extUri, extUriBiasedIgnorePathCase, extUriIgnorePathCase, isEqual2, isEqualOrParent2, getComparisonKey, basenameOrAuthority, basename2, extname2, dirname4, joinPath, normalizePath, relativePath, resolvePath, isAbsolutePath, isEqualAuthority, hasTrailingPathSeparator, removeTrailingPathSeparator, addTrailingPathSeparator, DataUri, init_resources };
