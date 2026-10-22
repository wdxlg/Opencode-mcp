// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookOutputRenderer.ts
import { joinPath } from "./module-0034.mjs";
import { parse4 } from "./module-0857.mjs";
import { Iterable } from "./module-0011.mjs";


// src/vs/workbench/contrib/notebook/common/notebookOutputRenderer.ts
var DependencyList = class {
  constructor(value2) {
    this.value = new Set(value2);
    this.defined = this.value.size > 0;
  }
  /** Gets whether any of the 'available' dependencies match the ones in this list */
  matches(available) {
    return available.some((v2) => this.value.has(v2));
  }
};

var NotebookOutputRendererInfo = class {
  constructor(descriptor) {
    this.id = descriptor.id;
    this.extensionId = descriptor.extension.identifier;
    this.extensionLocation = descriptor.extension.extensionLocation;
    this.isBuiltin = descriptor.extension.isBuiltin;
    if (typeof descriptor.entrypoint === "string") {
      this.entrypoint = {
        extends: void 0,
        path: joinPath(this.extensionLocation, descriptor.entrypoint)
      };
    } else {
      this.entrypoint = {
        extends: descriptor.entrypoint.extends,
        path: joinPath(this.extensionLocation, descriptor.entrypoint.path)
      };
    }
    this.displayName = descriptor.displayName;
    this.mimeTypes = descriptor.mimeTypes;
    this.mimeTypeGlobs = this.mimeTypes.map((pattern) => parse4(pattern, { ignoreCase: true }));
    this.hardDependencies = new DependencyList(descriptor.dependencies ?? Iterable.empty());
    this.optionalDependencies = new DependencyList(descriptor.optionalDependencies ?? Iterable.empty());
    this.messaging = descriptor.requiresMessaging ?? "never" /* Never */;
  }
  matchesWithoutKernel(mimeType) {
    if (!this.matchesMimeTypeOnly(mimeType)) {
      return 3 /* Never */;
    }
    if (this.hardDependencies.defined) {
      return 0 /* WithHardKernelDependency */;
    }
    if (this.optionalDependencies.defined) {
      return 1 /* WithOptionalKernelDependency */;
    }
    return 2 /* Pure */;
  }
  matches(mimeType, kernelProvides) {
    if (!this.matchesMimeTypeOnly(mimeType)) {
      return 3 /* Never */;
    }
    if (this.hardDependencies.defined) {
      return this.hardDependencies.matches(kernelProvides) ? 0 /* WithHardKernelDependency */ : 3 /* Never */;
    }
    return this.optionalDependencies.matches(kernelProvides) ? 1 /* WithOptionalKernelDependency */ : 2 /* Pure */;
  }
  matchesMimeTypeOnly(mimeType) {
    if (this.entrypoint.extends) {
      return false;
    }
    return this.mimeTypeGlobs.some((pattern) => pattern(mimeType)) || this.mimeTypes.some((pattern) => pattern === mimeType);
  }
};

var NotebookStaticPreloadInfo = class {
  constructor(descriptor) {
    this.type = descriptor.type;
    this.entrypoint = joinPath(descriptor.extension.extensionLocation, descriptor.entrypoint);
    this.extensionLocation = descriptor.extension.extensionLocation;
    this.localResourceRoots = descriptor.localResourceRoots.map((root) => joinPath(descriptor.extension.extensionLocation, root));
  }
};
export { DependencyList, NotebookOutputRendererInfo, NotebookStaticPreloadInfo };
