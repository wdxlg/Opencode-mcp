// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/pullRequestIconCache.ts
import { createDecorator } from "./module-0077.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/github/browser/pullRequestIconCache.ts
var IPullRequestIconCache = createDecorator("pullRequestIconCache");

var MAX_CACHED_ICONS = 50;

var STORAGE_KEY4 = "sessions.github.pullRequestIconCache";

var PullRequestIconCache = class {
  constructor(_storageService) {
    this._storageService = _storageService;
    /**
     * Cached icons keyed by PR link. A `Map` preserves insertion order, which we
     * treat as recency: the most recently updated entry is last, so eviction
     * removes the first (oldest) key.
     */
    this._icons = /* @__PURE__ */ new Map();
    this._load();
  }
  get(prLink) {
    return this._icons.get(prLink);
  }
  set(prLink, icon2) {
    const existing = this._icons.get(prLink);
    if (existing && ThemeIcon.isEqual(existing, icon2)) {
      return;
    }
    this._icons.delete(prLink);
    this._icons.set(prLink, icon2);
    while (this._icons.size > MAX_CACHED_ICONS) {
      const oldest = this._icons.keys().next().value;
      if (oldest === void 0) {
        break;
      }
      this._icons.delete(oldest);
    }
    this._save();
  }
  _load() {
    const raw = this._storageService.get(STORAGE_KEY4, -1 /* APPLICATION */);
    if (!raw) {
      return;
    }
    let entries2;
    try {
      entries2 = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(entries2)) {
      return;
    }
    for (const entry of entries2) {
      if (entry && typeof entry.link === "string" && ThemeIcon.isThemeIcon(entry.icon)) {
        this._icons.set(entry.link, entry.icon);
      }
    }
  }
  _save() {
    const entries2 = [];
    for (const [link2, icon2] of this._icons) {
      entries2.push({ link: link2, icon: icon2 });
    }
    this._storageService.store(STORAGE_KEY4, JSON.stringify(entries2), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
};

PullRequestIconCache = __decorateClass([
  __decorateParam(0, IStorageService)
], PullRequestIconCache);
export { IPullRequestIconCache, MAX_CACHED_ICONS, STORAGE_KEY4, PullRequestIconCache };
