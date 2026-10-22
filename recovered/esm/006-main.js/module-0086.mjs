// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/common/browserPermissions.ts
import { __esm } from "./module-0000.mjs";
import { Codicon, init_codicons } from "./module-0085.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_nls, localize } from "./module-0005.mjs";


// src/vs/platform/browserView/common/browserPermissions.ts
function isAlwaysAllowedPermission(permission) {
  return ALWAYS_ALLOWED_PERMISSIONS.has(permission);
}

function electronPermissionToCategories(permission, mediaKinds) {
  if (permission === "media") {
    return resolveMediaCategories(mediaKinds);
  }
  return PERMISSION_TO_CATEGORIES.get(permission) ?? [];
}

function resolveMediaCategories(mediaKinds) {
  const categories = /* @__PURE__ */ new Set();
  for (const kind of mediaKinds ?? []) {
    categories.add(kind === "video" ? "camera" /* Camera */ : "microphone" /* Microphone */);
  }
  if (categories.size === 0) {
    return ["camera" /* Camera */, "microphone" /* Microphone */];
  }
  return [...categories];
}

function toOriginKey(url) {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === "null") {
    return "";
  }
  try {
    const parsed = new URL(trimmed);
    if (!parsed.host) {
      return `${parsed.protocol}//${parsed.pathname}`;
    }
    return parsed.origin;
  } catch {
    return trimmed;
  }
}

var PERMISSION_CATEGORY_DESCRIPTORS, ALWAYS_ALLOWED_PERMISSIONS, ALL_PERMISSION_CATEGORIES, DEFAULT_PERMISSION_STATES, PERMISSION_TO_CATEGORIES, VALID_CATEGORIES, BrowserPermissionStore;

var init_browserPermissions = __esm({
  "src/vs/platform/browserView/common/browserPermissions.ts"() {
    init_codicons();
    init_event();
    init_lifecycle();
    init_nls();
    PERMISSION_CATEGORY_DESCRIPTORS = {
      ["location" /* Location */]: {
        category: "location" /* Location */,
        label: localize(2742, null),
        description: localize(2741, null),
        icon: Codicon.location,
        permissions: ["geolocation", "geolocation-approximate"],
        defaultState: "ask"
      },
      ["camera" /* Camera */]: {
        category: "camera" /* Camera */,
        label: localize(2736, null),
        description: localize(2735, null),
        icon: Codicon.deviceCamera,
        // `media` is shared with Microphone; disambiguated via mediaType/mediaTypes.
        permissions: ["media"],
        defaultState: "ask"
      },
      ["microphone" /* Microphone */]: {
        category: "microphone" /* Microphone */,
        label: localize(2744, null),
        description: localize(2743, null),
        icon: Codicon.mic,
        permissions: ["media"],
        defaultState: "ask"
      },
      ["sensors" /* Sensors */]: {
        category: "sensors" /* Sensors */,
        label: localize(2748, null),
        description: localize(2747, null),
        icon: Codicon.pulse,
        permissions: ["sensors"],
        defaultState: "allow"
      },
      ["clipboard" /* Clipboard */]: {
        category: "clipboard" /* Clipboard */,
        label: localize(2738, null),
        description: localize(2737, null),
        icon: Codicon.clippy,
        permissions: ["clipboard-read"],
        defaultState: "ask"
      },
      ["notifications" /* Notifications */]: {
        category: "notifications" /* Notifications */,
        label: localize(2746, null),
        description: localize(2745, null),
        icon: Codicon.bell,
        permissions: ["notifications"],
        defaultState: "ask"
      },
      ["devices" /* Devices */]: {
        category: "devices" /* Devices */,
        label: localize(2740, null),
        description: localize(2739, null),
        icon: Codicon.plug,
        // Each device kind has its own native chooser; this decision only gates
        // whether that chooser is allowed to surface. Bluetooth has no Electron
        // permission string (it is gated in the chooser handler directly).
        permissions: ["usb", "serial", "hid"],
        defaultState: "allow"
      }
      /**
       * Permissions not listed here are either always allowed (see
       * {@link ALWAYS_ALLOWED_PERMISSIONS}) or, by default, always denied:
       *
       * No-op in Electron due to missing backend support
       *   - Smart Cards (`smart-card`)
       *   - NFC (`nfc`)
       *   - Protected Content (`mediaKeySystem`)
       *   - Augmented / Virtual Reality, Hand Tracking (`ar`, `vr`, `hand-tracking`)
       *   - Payment Handlers (`payment-handler`)
       *   - Background Sync (`background-sync`, `periodic-background-sync`, `background-fetch`)
       *   - Printing (`web-printing`)
       *   - App Installation (`web-app-installation`)
       *   - Storage Access (`storage-access`, `top-level-storage-access`)
       *
       * Not currently implemented (in approximate order of 'might want')
       *   - Local Network Access (`local-network-access`, `local-network`, `loopback-network`)
       *   - Screen Capture, Captured Surface Control (`display-capture`, `captured-surface-control`)
       *   - File Writing (`fileSystem`)
       *   - Open External (`openExternal`)
       *   - MIDI (`midi`, `midiSysex`)
       *   - Persistent Storage (`persistent-storage`)
       *   - Device Activity (`idle-detection`)
       *   - Audio Output (`speaker-selection`)
       *   - Wake Lock (`screen-wake-lock`, `system-wake-lock`)
       *   - Window Management (`window-management`)
       *   - Fonts (`local-fonts`)
       *   - Automatic Fullscreen (`automatic-fullscreen`)
       */
    };
    ALWAYS_ALLOWED_PERMISSIONS = /* @__PURE__ */ new Set([
      "pointerLock",
      "keyboardLock",
      "fullscreen",
      "clipboard-sanitized-write"
    ]);
    ALL_PERMISSION_CATEGORIES = Object.keys(PERMISSION_CATEGORY_DESCRIPTORS);
    DEFAULT_PERMISSION_STATES = Object.freeze(
      Object.fromEntries(ALL_PERMISSION_CATEGORIES.map((category) => [category, PERMISSION_CATEGORY_DESCRIPTORS[category].defaultState]))
    );
    PERMISSION_TO_CATEGORIES = (() => {
      const map = /* @__PURE__ */ new Map();
      for (const category of ALL_PERMISSION_CATEGORIES) {
        for (const permission of PERMISSION_CATEGORY_DESCRIPTORS[category].permissions) {
          if (permission === "media") {
            continue;
          }
          const existing = map.get(permission);
          if (existing) {
            existing.push(category);
          } else {
            map.set(permission, [category]);
          }
        }
      }
      return map;
    })();
    VALID_CATEGORIES = new Set(ALL_PERMISSION_CATEGORIES);
    BrowserPermissionStore = class extends Disposable {
      constructor() {
        super(...arguments);
        this._data = /* @__PURE__ */ new Map();
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
      }
      /**
       * The default state assumed for a category when an origin has recorded no decision.
       */
      defaultStateFor(category) {
        return PERMISSION_CATEGORY_DESCRIPTORS[category].defaultState;
      }
      /** Get the recorded decision for a (origin, category) pair. */
      getDecision(origin, category) {
        return this._data.get(toOriginKey(origin))?.get(category);
      }
      /**
       * Resolve the effective boolean decision for a (origin, category) pair,
       * applying {@link defaultStateFor} when the recorded state is 'ask'.
       */
      isAllowed(origin, category) {
        return (this.getDecision(origin, category) ?? this.defaultStateFor(category)) === "allow";
      }
      /** Set (or clear, via `null`) the decision for a (origin, category) pair. */
      set(origin, category, decision) {
        const key = toOriginKey(origin);
        if (!key) {
          return;
        }
        if (decision === null) {
          const categories = this._data.get(key);
          if (!categories?.delete(category)) {
            return;
          }
          if (categories.size === 0) {
            this._data.delete(key);
          }
        } else {
          let categories = this._data.get(key);
          if (categories?.get(category) === decision) {
            return;
          }
          if (!categories) {
            categories = /* @__PURE__ */ new Map();
            this._data.set(key, categories);
          }
          categories.set(category, decision);
        }
        this._onDidChange.fire();
      }
      /** Set (or clear) the decision for several categories of one origin at once. */
      setMany(origin, grants) {
        for (const { category, state } of grants) {
          this.set(origin, category, state);
        }
      }
      /** Remove all recorded state for an origin. */
      clearOrigin(origin) {
        const key = toOriginKey(origin);
        if (this._data.delete(key)) {
          this._onDidChange.fire();
        }
      }
      /** Remove all recorded state for every origin. */
      clear() {
        if (this._data.size === 0) {
          return;
        }
        this._data.clear();
        this._onDidChange.fire();
      }
      /**
       * Return the full category->state map for one origin, including categories
       * with no recorded decision. Ideal for rendering a
       * per-site settings page.
       */
      getOrigin(origin) {
        const result = { ...DEFAULT_PERMISSION_STATES };
        const recorded = this._data.get(toOriginKey(origin));
        if (recorded) {
          for (const [category, state] of recorded) {
            result[category] = state;
          }
        }
        return result;
      }
      /** All origins that have at least one recorded decision. */
      origins() {
        return [...this._data.keys()];
      }
      /** Flat list of every recorded grant. */
      list() {
        const grants = [];
        for (const [origin, categories] of this._data) {
          for (const [category, state] of categories) {
            grants.push({ origin, category, state });
          }
        }
        return grants;
      }
      serialize() {
        const origins = {};
        for (const [origin, categories] of this._data) {
          const entry = {};
          for (const [category, state] of categories) {
            entry[category] = state;
          }
          origins[origin] = entry;
        }
        return { origins };
      }
      hydrate(snapshot) {
        this._data.clear();
        if (snapshot?.origins && typeof snapshot.origins === "object") {
          for (const [origin, categories] of Object.entries(snapshot.origins)) {
            if (!categories || typeof categories !== "object") {
              continue;
            }
            const key = toOriginKey(origin);
            if (!key) {
              continue;
            }
            let target;
            for (const [category, state] of Object.entries(categories)) {
              if (!VALID_CATEGORIES.has(category) || state !== "allow" && state !== "deny") {
                continue;
              }
              if (!target) {
                target = /* @__PURE__ */ new Map();
                this._data.set(key, target);
              }
              target.set(category, state);
            }
          }
        }
        this._onDidChange.fire();
      }
    };
  }
});
export { isAlwaysAllowedPermission, electronPermissionToCategories, resolveMediaCategories, toOriginKey, PERMISSION_CATEGORY_DESCRIPTORS, ALWAYS_ALLOWED_PERMISSIONS, ALL_PERMISSION_CATEGORIES, DEFAULT_PERMISSION_STATES, PERMISSION_TO_CATEGORIES, VALID_CATEGORIES, BrowserPermissionStore, init_browserPermissions };
