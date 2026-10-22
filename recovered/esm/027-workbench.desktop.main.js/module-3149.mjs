// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/common/quickDiffService.ts
import { isEqualOrParent2 } from "./module-0034.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { score2 } from "./module-0858.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/scm/common/quickDiffService.ts
function createProviderComparer(uri5) {
  return (a, b) => {
    if (a.rootUri && !b.rootUri) {
      return -1;
    } else if (!a.rootUri && b.rootUri) {
      return 1;
    } else if (!a.rootUri && !b.rootUri) {
      return 0;
    }
    const aIsParent = isEqualOrParent2(uri5, a.rootUri);
    const bIsParent = isEqualOrParent2(uri5, b.rootUri);
    if (aIsParent && bIsParent) {
      return providerComparer(a, b);
    } else if (aIsParent) {
      return -1;
    } else if (bIsParent) {
      return 1;
    } else {
      return 0;
    }
  };
}

function providerComparer(a, b) {
  if (a.kind === "primary") {
    return -1;
  } else if (b.kind === "primary") {
    return 1;
  } else if (a.kind === "secondary") {
    return -1;
  } else if (b.kind === "secondary") {
    return 1;
  }
  return 0;
}

var QuickDiffService = class extends Disposable {
  constructor(storageService, uriIdentityService) {
    super();
    this.storageService = storageService;
    this.uriIdentityService = uriIdentityService;
    this.quickDiffProviders = /* @__PURE__ */ new Set();
    this._onDidChangeQuickDiffProviders = this._register(new Emitter());
    this.onDidChangeQuickDiffProviders = this._onDidChangeQuickDiffProviders.event;
    this.hiddenQuickDiffProviders = /* @__PURE__ */ new Set();
    this.loadState();
  }
  static {
    this.STORAGE_KEY = "workbench.scm.quickDiffProviders.hidden";
  }
  get providers() {
    return Array.from(this.quickDiffProviders).sort(providerComparer);
  }
  addQuickDiffProvider(quickDiff) {
    this.quickDiffProviders.add(quickDiff);
    this._onDidChangeQuickDiffProviders.fire();
    return {
      dispose: () => {
        this.quickDiffProviders.delete(quickDiff);
        this._onDidChangeQuickDiffProviders.fire();
      }
    };
  }
  async getQuickDiffs(uri5, language2 = "", isSynchronized = false) {
    const providers2 = Array.from(this.quickDiffProviders).filter((provider) => !provider.rootUri || this.uriIdentityService.extUri.isEqualOrParent(uri5, provider.rootUri)).sort(createProviderComparer(uri5));
    const quickDiffOriginalResources = await Promise.allSettled(providers2.map(async (provider) => {
      const scoreValue = provider.selector ? score2(provider.selector, uri5, language2, isSynchronized, void 0, void 0) : 10;
      const originalResource = scoreValue > 0 ? await provider.getOriginalResource(uri5) ?? void 0 : void 0;
      return { provider, originalResource };
    }));
    const quickDiffs = [];
    for (const quickDiffOriginalResource of quickDiffOriginalResources) {
      if (quickDiffOriginalResource.status === "rejected") {
        continue;
      }
      const { provider, originalResource } = quickDiffOriginalResource.value;
      if (!originalResource) {
        continue;
      }
      quickDiffs.push({
        id: provider.id,
        label: provider.label,
        kind: provider.kind,
        originalResource
      });
    }
    return quickDiffs;
  }
  toggleQuickDiffProviderVisibility(id2) {
    if (this.isQuickDiffProviderVisible(id2)) {
      this.hiddenQuickDiffProviders.add(id2);
    } else {
      this.hiddenQuickDiffProviders.delete(id2);
    }
    this.saveState();
    this._onDidChangeQuickDiffProviders.fire();
  }
  isQuickDiffProviderVisible(id2) {
    return !this.hiddenQuickDiffProviders.has(id2);
  }
  loadState() {
    const raw = this.storageService.get(QuickDiffService.STORAGE_KEY, 0 /* PROFILE */);
    if (raw) {
      try {
        this.hiddenQuickDiffProviders = new Set(JSON.parse(raw));
      } catch {
      }
    }
  }
  saveState() {
    if (this.hiddenQuickDiffProviders.size === 0) {
      this.storageService.remove(QuickDiffService.STORAGE_KEY, 0 /* PROFILE */);
    } else {
      this.storageService.store(QuickDiffService.STORAGE_KEY, JSON.stringify(Array.from(this.hiddenQuickDiffProviders)), 0 /* PROFILE */, 0 /* USER */);
    }
  }
};

QuickDiffService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IUriIdentityService)
], QuickDiffService);

async function getOriginalResource(quickDiffService, uri5, language2, isSynchronized) {
  const quickDiffs = await quickDiffService.getQuickDiffs(uri5, language2, isSynchronized);
  const primaryQuickDiffs = quickDiffs.find((quickDiff) => quickDiff.kind === "primary");
  return primaryQuickDiffs ? primaryQuickDiffs.originalResource : null;
}
export { createProviderComparer, providerComparer, getOriginalResource, QuickDiffService };
