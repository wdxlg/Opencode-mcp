// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/platform/files/common/files.ts
import { init_path, sep } from "./module-0004.mjs";
import { init_strings, startsWithIgnoreCase } from "./module-0023.mjs";
import { __esm } from "./module-0000.mjs";
import { TernarySearchTree, init_ternarySearchTree } from "./module-0036.mjs";
import { init_types, isNumber } from "./module-0012.mjs";
import { init_uri } from "./module-0026.mjs";
import { init_nls, localize } from "./module-0001.mjs";
import { createDecorator, init_instantiation } from "./module-0037.mjs";
import { init_platform } from "./module-0002.mjs";
import { init_network } from "./module-0027.mjs";
import { Lazy, init_lazy } from "./module-0021.mjs";


// src/vs/platform/files/common/files.ts
function isParent(path3, candidate, ignoreCase) {
  if (!path3 || !candidate || path3 === candidate) {
    return false;
  }
  if (candidate.length > path3.length) {
    return false;
  }
  if (candidate.charAt(candidate.length - 1) !== sep) {
    candidate += sep;
  }
  if (ignoreCase) {
    return startsWithIgnoreCase(path3, candidate);
  }
  return path3.indexOf(candidate) === 0;
}

var IFileService, FileChangesEvent, ByteSize;

var init_files = __esm({
  "src/vs/platform/files/common/files.ts"() {
    init_ternarySearchTree();
    init_path();
    init_strings();
    init_types();
    init_uri();
    init_nls();
    init_instantiation();
    init_platform();
    init_network();
    init_lazy();
    IFileService = createDecorator("fileService");
    FileChangesEvent = class _FileChangesEvent {
      constructor(changes, ignorePathCasing) {
        this.ignorePathCasing = ignorePathCasing;
        this.correlationId = void 0;
        this.added = new Lazy(() => {
          const added = TernarySearchTree.forUris(() => this.ignorePathCasing);
          added.fill(this.rawAdded.map((resource) => [resource, true]));
          return added;
        });
        this.updated = new Lazy(() => {
          const updated = TernarySearchTree.forUris(() => this.ignorePathCasing);
          updated.fill(this.rawUpdated.map((resource) => [resource, true]));
          return updated;
        });
        this.deleted = new Lazy(() => {
          const deleted = TernarySearchTree.forUris(() => this.ignorePathCasing);
          deleted.fill(this.rawDeleted.map((resource) => [resource, true]));
          return deleted;
        });
        /**
         * @deprecated use the `contains` or `affects` method to efficiently find
         * out if the event relates to a given resource. these methods ensure:
         * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
         * - correctly handles `FileChangeType.DELETED` events
         */
        this.rawAdded = [];
        /**
        * @deprecated use the `contains` or `affects` method to efficiently find
        * out if the event relates to a given resource. these methods ensure:
        * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
        * - correctly handles `FileChangeType.DELETED` events
        */
        this.rawUpdated = [];
        /**
        * @deprecated use the `contains` or `affects` method to efficiently find
        * out if the event relates to a given resource. these methods ensure:
        * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
        * - correctly handles `FileChangeType.DELETED` events
        */
        this.rawDeleted = [];
        for (const change of changes) {
          switch (change.type) {
            case 1 /* ADDED */:
              this.rawAdded.push(change.resource);
              break;
            case 0 /* UPDATED */:
              this.rawUpdated.push(change.resource);
              break;
            case 2 /* DELETED */:
              this.rawDeleted.push(change.resource);
              break;
          }
          if (this.correlationId !== _FileChangesEvent.MIXED_CORRELATION) {
            if (typeof change.cId === "number") {
              if (this.correlationId === void 0) {
                this.correlationId = change.cId;
              } else if (this.correlationId !== change.cId) {
                this.correlationId = _FileChangesEvent.MIXED_CORRELATION;
              }
            } else {
              if (this.correlationId !== void 0) {
                this.correlationId = _FileChangesEvent.MIXED_CORRELATION;
              }
            }
          }
        }
      }
      static {
        this.MIXED_CORRELATION = null;
      }
      /**
       * Find out if the file change events match the provided resource.
       *
       * Note: when passing `FileChangeType.DELETED`, we consider a match
       * also when the parent of the resource got deleted.
       */
      contains(resource, ...types) {
        return this.doContains(resource, { includeChildren: false }, ...types);
      }
      /**
       * Find out if the file change events either match the provided
       * resource, or contain a child of this resource.
       */
      affects(resource, ...types) {
        return this.doContains(resource, { includeChildren: true }, ...types);
      }
      doContains(resource, options, ...types) {
        if (!resource) {
          return false;
        }
        const hasTypesFilter = types.length > 0;
        if (!hasTypesFilter || types.includes(1 /* ADDED */)) {
          if (this.added.value.get(resource)) {
            return true;
          }
          if (options.includeChildren && this.added.value.findSuperstr(resource)) {
            return true;
          }
        }
        if (!hasTypesFilter || types.includes(0 /* UPDATED */)) {
          if (this.updated.value.get(resource)) {
            return true;
          }
          if (options.includeChildren && this.updated.value.findSuperstr(resource)) {
            return true;
          }
        }
        if (!hasTypesFilter || types.includes(2 /* DELETED */)) {
          if (this.deleted.value.findSubstr(resource)) {
            return true;
          }
          if (options.includeChildren && this.deleted.value.findSuperstr(resource)) {
            return true;
          }
        }
        return false;
      }
      /**
       * Returns if this event contains added files.
       */
      gotAdded() {
        return this.rawAdded.length > 0;
      }
      /**
       * Returns if this event contains deleted files.
       */
      gotDeleted() {
        return this.rawDeleted.length > 0;
      }
      /**
       * Returns if this event contains updated files.
       */
      gotUpdated() {
        return this.rawUpdated.length > 0;
      }
      /**
       * Returns if this event contains changes that correlate to the
       * provided `correlationId`.
       *
       * File change event correlation is an advanced watch feature that
       * allows to  identify from which watch request the events originate
       * from. This correlation allows to route events specifically
       * only to the requestor and not emit them to all listeners.
       */
      correlates(correlationId) {
        return this.correlationId === correlationId;
      }
      /**
       * Figure out if the event contains changes that correlate to one
       * correlation identifier.
       *
       * File change event correlation is an advanced watch feature that
       * allows to  identify from which watch request the events originate
       * from. This correlation allows to route events specifically
       * only to the requestor and not emit them to all listeners.
       */
      hasCorrelation() {
        return typeof this.correlationId === "number";
      }
    };
    ByteSize = class _ByteSize {
      static {
        this.KB = 1024;
      }
      static {
        this.MB = _ByteSize.KB * _ByteSize.KB;
      }
      static {
        this.GB = _ByteSize.MB * _ByteSize.KB;
      }
      static {
        this.TB = _ByteSize.GB * _ByteSize.KB;
      }
      static formatSize(size) {
        if (!isNumber(size)) {
          size = 0;
        }
        if (size < _ByteSize.KB) {
          return localize(3012, null, size.toFixed(0));
        }
        if (size < _ByteSize.MB) {
          return localize(3014, null, (size / _ByteSize.KB).toFixed(2));
        }
        if (size < _ByteSize.GB) {
          return localize(3015, null, (size / _ByteSize.MB).toFixed(2));
        }
        if (size < _ByteSize.TB) {
          return localize(3013, null, (size / _ByteSize.GB).toFixed(2));
        }
        return localize(3016, null, (size / _ByteSize.TB).toFixed(2));
      }
    };
  }
});
export { isParent, IFileService, FileChangesEvent, ByteSize, init_files };
