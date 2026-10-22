// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/browser/cssExtensionPoint.ts
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { isProposedApiEnabled } from "./module-0889.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { createLinkElement } from "./module-0075.mjs";
import { FileAccess } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0916.mjs";
import { IWorkbenchThemeService } from "./module-0917.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/services/themes/browser/cssExtensionPoint.ts
var CSS_CACHE_STORAGE_KEY = "workbench.contrib.css.cache";

var cssExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "css",
  jsonSchema: {
    description: localize(23407, null),
    type: "array",
    items: {
      type: "object",
      properties: {
        path: {
          description: localize(23408, null),
          type: "string"
        }
      },
      required: ["path"]
    },
    defaultSnippets: [{ body: [{ path: "${1:styles.css}" }] }]
  }
});

var CSSFileWatcher = class {
  constructor(fileService, environmentService, onUpdate) {
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.onUpdate = onUpdate;
    this.watchedLocations = /* @__PURE__ */ new Map();
  }
  watch(uri4) {
    const key3 = uri4.toString();
    if (this.watchedLocations.has(key3)) {
      return;
    }
    if (!this.environmentService.isExtensionDevelopment) {
      return;
    }
    const disposables = new DisposableStore();
    disposables.add(this.fileService.watch(uri4));
    disposables.add(this.fileService.onDidFilesChange((e4) => {
      if (e4.contains(uri4, 0 /* UPDATED */)) {
        this.onUpdate(uri4);
      }
    }));
    this.watchedLocations.set(key3, { uri: uri4, disposables });
  }
  unwatch(uri4) {
    const key3 = uri4.toString();
    const entry = this.watchedLocations.get(key3);
    if (entry) {
      entry.disposables.dispose();
      this.watchedLocations.delete(key3);
    }
  }
  dispose() {
    for (const entry of this.watchedLocations.values()) {
      entry.disposables.dispose();
    }
    this.watchedLocations.clear();
  }
};

var CSSExtensionPoint = class {
  constructor(fileService, environmentService, themeService, storageService) {
    this.themeService = themeService;
    this.storageService = storageService;
    this.disposables = new DisposableStore();
    this.stylesheetsByExtension = /* @__PURE__ */ new Map();
    this.pendingExtensions = /* @__PURE__ */ new Map();
    this.watcher = this.disposables.add(new CSSFileWatcher(fileService, environmentService, (uri4) => this.reloadStylesheet(uri4)));
    this.disposables.add(toDisposable(() => {
      for (const entries2 of this.stylesheetsByExtension.values()) {
        for (const entry of entries2) {
          entry.disposables.dispose();
        }
      }
      this.stylesheetsByExtension.clear();
    }));
    this.applyCachedCSS();
    this.disposables.add(this.themeService.onDidColorThemeChange(() => this.onThemeChange()));
    this.disposables.add(this.themeService.onDidFileIconThemeChange(() => this.onThemeChange()));
    this.disposables.add(this.themeService.onDidProductIconThemeChange(() => this.onThemeChange()));
    cssExtensionPoint.setHandler((extensions, delta2) => {
      for (const extension of delta2.removed) {
        const extensionId = extension.description.identifier.value;
        this.pendingExtensions.delete(extensionId);
        this.removeStylesheets(extensionId);
        this.clearCacheForExtension(extensionId);
      }
      for (const extension of delta2.added) {
        if (!isProposedApiEnabled(extension.description, "css")) {
          extension.collector.error(`The '${cssExtensionPoint.name}' contribution point is proposed API.`);
          continue;
        }
        const extensionValue = extension.value;
        const collector = extension.collector;
        if (!extensionValue || !Array.isArray(extensionValue)) {
          collector.error(localize(23409, null));
          continue;
        }
        const extensionId = extension.description.identifier.value;
        this.pendingExtensions.set(extensionId, extension);
        if (this.isExtensionThemeActive(extensionId)) {
          this.activateExtensionCSS(extension);
        } else if (this.stylesheetsByExtension.has(extensionId)) {
          this.removeStylesheets(extensionId);
          this.clearCacheForExtension(extensionId);
        }
      }
    });
  }
  isExtensionThemeActive(extensionId) {
    const colorTheme = this.themeService.getColorTheme();
    const fileIconTheme = this.themeService.getFileIconTheme();
    const productIconTheme = this.themeService.getProductIconTheme();
    return !!(colorTheme.extensionData && ExtensionIdentifier.equals(colorTheme.extensionData.extensionId, extensionId)) || !!(fileIconTheme.extensionData && ExtensionIdentifier.equals(fileIconTheme.extensionData.extensionId, extensionId)) || !!(productIconTheme.extensionData && ExtensionIdentifier.equals(productIconTheme.extensionData.extensionId, extensionId));
  }
  onThemeChange() {
    for (const [extensionId, extension] of this.pendingExtensions) {
      if (!this.stylesheetsByExtension.has(extensionId) && this.isExtensionThemeActive(extensionId)) {
        this.activateExtensionCSS(extension);
      }
    }
    for (const extensionId of this.stylesheetsByExtension.keys()) {
      if (!this.isExtensionThemeActive(extensionId)) {
        this.removeStylesheets(extensionId);
        this.clearCacheForExtension(extensionId);
      }
    }
  }
  activateExtensionCSS(extension) {
    const extensionId = extension.description.identifier.value;
    if (this.stylesheetsByExtension.has(extensionId)) {
      return;
    }
    const extensionLocation = extension.description.extensionLocation;
    const extensionValue = extension.value;
    const collector = extension.collector;
    const entries2 = [];
    const cssLocations = [];
    for (const cssContribution of extensionValue) {
      if (!cssContribution.path || typeof cssContribution.path !== "string") {
        collector.error(localize(23410, null));
        continue;
      }
      const cssLocation = joinPath(extensionLocation, cssContribution.path);
      if (!isEqualOrParent2(cssLocation, extensionLocation)) {
        collector.warn(localize(23411, null, cssLocation.path, extensionLocation.path));
        continue;
      }
      const entryDisposables = new DisposableStore();
      const element = this.createCSSLinkElement(cssLocation, extensionId, entryDisposables);
      entries2.push({ uri: cssLocation, element, disposables: entryDisposables });
      cssLocations.push(cssLocation.toString());
      this.watcher.watch(cssLocation);
    }
    if (entries2.length > 0) {
      this.stylesheetsByExtension.set(extensionId, entries2);
      this.cacheExtensionCSS(extensionId, cssLocations);
    }
  }
  removeStylesheets(extensionId) {
    const entries2 = this.stylesheetsByExtension.get(extensionId);
    if (entries2) {
      for (const entry of entries2) {
        this.watcher.unwatch(entry.uri);
        entry.disposables.dispose();
      }
      this.stylesheetsByExtension.delete(extensionId);
    }
  }
  applyCachedCSS() {
    const cached = this.getCachedCSS();
    if (!cached) {
      return;
    }
    if (!this.isExtensionThemeActive(cached.extensionId)) {
      this.clearCacheForExtension(cached.extensionId);
      return;
    }
    const entries2 = [];
    for (const cssLocationString of cached.cssLocations) {
      const cssLocation = URI.parse(cssLocationString);
      const entryDisposables = new DisposableStore();
      const element = this.createCSSLinkElement(cssLocation, cached.extensionId, entryDisposables);
      entries2.push({ uri: cssLocation, element, disposables: entryDisposables });
      this.watcher.watch(cssLocation);
    }
    if (entries2.length > 0) {
      this.stylesheetsByExtension.set(cached.extensionId, entries2);
    }
  }
  getCachedCSS() {
    const raw = this.storageService.get(CSS_CACHE_STORAGE_KEY, 0 /* PROFILE */);
    if (!raw) {
      return void 0;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return void 0;
    }
  }
  cacheExtensionCSS(extensionId, cssLocations) {
    const entry = { extensionId, cssLocations };
    this.storageService.store(CSS_CACHE_STORAGE_KEY, JSON.stringify(entry), 0 /* PROFILE */, 1 /* MACHINE */);
  }
  clearCacheForExtension(extensionId) {
    const cached = this.getCachedCSS();
    if (cached && ExtensionIdentifier.equals(cached.extensionId, extensionId)) {
      this.storageService.remove(CSS_CACHE_STORAGE_KEY, 0 /* PROFILE */);
    }
  }
  createCSSLinkElement(uri4, extensionId, disposables) {
    const element = createLinkElement();
    element.rel = "stylesheet";
    element.type = "text/css";
    element.className = `extension-contributed-css ${extensionId}`;
    element.href = FileAccess.uriToBrowserUri(uri4).toString(true);
    disposables.add(toDisposable(() => element.remove()));
    return element;
  }
  reloadStylesheet(uri4) {
    const uriString = uri4.toString();
    for (const entries2 of this.stylesheetsByExtension.values()) {
      for (const entry of entries2) {
        if (entry.uri.toString() === uriString) {
          const browserUri = FileAccess.uriToBrowserUri(uri4);
          entry.element.href = browserUri.with({ query: `v=${Date.now()}` }).toString(true);
        }
      }
    }
  }
  dispose() {
    this.disposables.dispose();
  }
};

CSSExtensionPoint = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService),
  __decorateParam(2, IWorkbenchThemeService),
  __decorateParam(3, IStorageService)
], CSSExtensionPoint);
export { CSS_CACHE_STORAGE_KEY, cssExtensionPoint, CSSFileWatcher, CSSExtensionPoint };
