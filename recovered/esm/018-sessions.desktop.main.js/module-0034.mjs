// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/resources.ts
import { URI, uriToFsPath } from "./module-0032.mjs";
import { compare, equalsIgnoreCase } from "./module-0030.mjs";
import { Schemas } from "./module-0033.mjs";
import { getRoot, isEqualOrParent, toPosixPath, toSlashes } from "./module-0031.mjs";
import { dirname, normalize, posix, relative, resolve, sep } from "./module-0026.mjs";
import { isLinux, isWindows } from "./module-0014.mjs";


// src/vs/base/common/resources.ts
function originalFSPath(uri4) {
  return uriToFsPath(uri4, true);
}

var ExtUri = class {
  constructor(_ignorePathCasing) {
    this._ignorePathCasing = _ignorePathCasing;
  }
  compare(uri1, uri22, ignoreFragment = false) {
    if (uri1 === uri22) {
      return 0;
    }
    return compare(this.getComparisonKey(uri1, ignoreFragment), this.getComparisonKey(uri22, ignoreFragment));
  }
  isEqual(uri1, uri22, ignoreFragment = false) {
    if (uri1 === uri22) {
      return true;
    }
    if (!uri1 || !uri22) {
      return false;
    }
    return this.getComparisonKey(uri1, ignoreFragment) === this.getComparisonKey(uri22, ignoreFragment);
  }
  getComparisonKey(uri4, ignoreFragment = false) {
    return uri4.with({
      path: this._ignorePathCasing(uri4) ? uri4.path.toLowerCase() : void 0,
      fragment: ignoreFragment ? null : void 0
    }).toString();
  }
  ignorePathCasing(uri4) {
    return this._ignorePathCasing(uri4);
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
    let dirname3;
    if (resource.scheme === Schemas.file) {
      dirname3 = URI.file(dirname(originalFSPath(resource))).path;
    } else {
      dirname3 = posix.dirname(resource.path);
      if (resource.authority && dirname3.length && dirname3.charCodeAt(0) !== 47 /* Slash */) {
        console.error(`dirname("${resource.toString})) resulted in a relative path`);
        dirname3 = "/";
      }
    }
    return resource.with({
      path: dirname3
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
      const relativePath2 = relative(originalFSPath(from), originalFSPath(to));
      return isWindows ? toSlashes(relativePath2) : relativePath2;
    }
    let fromPath = from.path || "/";
    const toPath = to.path || "/";
    if (this._ignorePathCasing(from)) {
      let i2 = 0;
      for (const len = Math.min(fromPath.length, toPath.length); i2 < len; i2++) {
        if (fromPath.charCodeAt(i2) !== toPath.charCodeAt(i2)) {
          if (fromPath.charAt(i2).toLowerCase() !== toPath.charAt(i2).toLowerCase()) {
            break;
          }
        }
      }
      fromPath = toPath.substr(0, i2) + fromPath.substr(i2);
    }
    return posix.relative(fromPath, toPath);
  }
  resolvePath(base, path) {
    if (base.scheme === Schemas.file) {
      const newURI = URI.file(resolve(originalFSPath(base), path));
      return base.with({
        authority: newURI.authority,
        path: newURI.path
      });
    }
    path = toPosixPath(path);
    return base.with({
      path: posix.resolve(base.path, path)
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

var extUri = new ExtUri(() => false);

var extUriBiasedIgnorePathCase = new ExtUri((uri4) => {
  return uri4.scheme === Schemas.file ? !isLinux : true;
});

var extUriIgnorePathCase = new ExtUri((_) => true);

var isEqual2 = extUri.isEqual.bind(extUri);

var isEqualOrParent2 = extUri.isEqualOrParent.bind(extUri);

var getComparisonKey = extUri.getComparisonKey.bind(extUri);

var basenameOrAuthority = extUri.basenameOrAuthority.bind(extUri);

var basename2 = extUri.basename.bind(extUri);

var extname2 = extUri.extname.bind(extUri);

var dirname2 = extUri.dirname.bind(extUri);

var joinPath = extUri.joinPath.bind(extUri);

var normalizePath = extUri.normalizePath.bind(extUri);

var relativePath = extUri.relativePath.bind(extUri);

var resolvePath = extUri.resolvePath.bind(extUri);

var isAbsolutePath = extUri.isAbsolutePath.bind(extUri);

var isEqualAuthority = extUri.isEqualAuthority.bind(extUri);

var hasTrailingPathSeparator = extUri.hasTrailingPathSeparator.bind(extUri);

var removeTrailingPathSeparator2 = extUri.removeTrailingPathSeparator.bind(extUri);

var addTrailingPathSeparator = extUri.addTrailingPathSeparator.bind(extUri);

function distinctParents(items, resourceAccessor) {
  const distinctParents2 = [];
  for (let i2 = 0; i2 < items.length; i2++) {
    const candidateResource = resourceAccessor(items[i2]);
    if (items.some((otherItem, index2) => {
      if (index2 === i2) {
        return false;
      }
      return isEqualOrParent2(candidateResource, resourceAccessor(otherItem));
    })) {
      continue;
    }
    distinctParents2.push(items[i2]);
  }
  return distinctParents2;
}

var DataUri;

((DataUri2) => {
  DataUri2.META_DATA_LABEL = "label";
  DataUri2.META_DATA_DESCRIPTION = "description";
  DataUri2.META_DATA_SIZE = "size";
  DataUri2.META_DATA_MIME = "mime";
  function parseMetaData(dataUri) {
    const metadata = /* @__PURE__ */ new Map();
    const meta = dataUri.path.substring(dataUri.path.indexOf(";") + 1, dataUri.path.lastIndexOf(";"));
    meta.split(";").forEach((property) => {
      const [key3, value2] = property.split(":");
      if (key3 && value2) {
        metadata.set(key3, value2);
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

function toLocalResource(resource, authority, localScheme) {
  if (authority) {
    let path = resource.path;
    if (path && path[0] !== posix.sep) {
      path = posix.sep + path;
    }
    return resource.with({ scheme: localScheme, authority, path });
  }
  return resource.with({ scheme: localScheme });
}
export { originalFSPath, distinctParents, toLocalResource, ExtUri, extUri, extUriBiasedIgnorePathCase, extUriIgnorePathCase, isEqual2, isEqualOrParent2, getComparisonKey, basenameOrAuthority, basename2, extname2, dirname2, joinPath, normalizePath, relativePath, resolvePath, isAbsolutePath, isEqualAuthority, hasTrailingPathSeparator, removeTrailingPathSeparator2, addTrailingPathSeparator, DataUri };
