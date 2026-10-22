// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/electron-main/browserSessionPermissions.ts
import { init_nls, localize } from "./module-0005.mjs";
import { __esm } from "./module-0000.mjs";
import { DeferredPromise, init_async } from "./module-0034.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { init_storage2 } from "./module-0079.mjs";
import { BrowserPermissionStore, electronPermissionToCategories, init_browserPermissions, isAlwaysAllowedPermission, toOriginKey } from "./module-0086.mjs";
import { init_browserView } from "./module-0069.mjs";


// src/vs/platform/browserView/electron-main/browserSessionPermissions.ts
import { webContents as electronWebContents } from "electron";

function parseSnapshot2(raw) {
  if (!raw) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return void 0;
    }
    return parsed;
  } catch {
    return void 0;
  }
}

function mediaKindsFromDetails(details) {
  if (!details) {
    return void 0;
  }
  const kinds = /* @__PURE__ */ new Set();
  if ("mediaTypes" in details && details.mediaTypes) {
    for (const kind of details.mediaTypes) {
      kinds.add(kind);
    }
  }
  if ("mediaType" in details && (details.mediaType === "video" || details.mediaType === "audio")) {
    kinds.add(details.mediaType);
  }
  return kinds.size ? [...kinds] : void 0;
}

function vendorProductHex(vendorId, productId) {
  const hex = (value) => (value ?? 0).toString(16).padStart(4, "0");
  return `${hex(vendorId)}:${hex(productId)}`;
}

function usbCandidate(device) {
  const ids = vendorProductHex(device.vendorId, device.productId);
  return {
    deviceId: device.deviceId,
    label: device.productName || device.manufacturerName || localize(2753, null, ids),
    detail: device.serialNumber ? `${ids} \xB7 ${device.serialNumber}` : ids
  };
}

function serialCandidate(port) {
  const ids = port.vendorId && port.productId ? `${port.vendorId}:${port.productId}` : void 0;
  return {
    deviceId: port.portId,
    label: `${port.portName} (${port.displayName})`,
    detail: ids
  };
}

function hidCandidate(device) {
  const ids = vendorProductHex(device.vendorId, device.productId);
  return {
    deviceId: device.deviceId,
    label: device.name || localize(2752, null, ids),
    detail: device.serialNumber ? `${ids} \xB7 ${device.serialNumber}` : ids
  };
}

function bluetoothCandidate(device) {
  return {
    deviceId: device.deviceId,
    label: device.deviceName || device.deviceId,
    detail: device.deviceId
  };
}

var PROMPT_TIMEOUT_MS, BrowserSessionPermissions;

var init_browserSessionPermissions = __esm({
  "src/vs/platform/browserView/electron-main/browserSessionPermissions.ts"() {
    init_async();
    init_event();
    init_lifecycle();
    init_uuid();
    init_nls();
    init_storage2();
    init_browserPermissions();
    init_browserView();
    PROMPT_TIMEOUT_MS = 3e4;
    BrowserSessionPermissions = class extends Disposable {
      constructor(session4) {
        super();
        this._permissionStore = this._register(new BrowserPermissionStore());
        /** Fires on any change to the store (set, clear, hydrate). */
        this.onDidChange = this._permissionStore.onDidChange;
        this._persistable = false;
        /** While set, store changes are coalesced into a single deferred flush. */
        this._batching = false;
        this._batchDirty = false;
        this._onDidRequestPermission = this._register(new Emitter());
        this.onDidRequestPermission = this._onDidRequestPermission.event;
        this._onDidRequestDevice = this._register(new Emitter());
        this.onDidRequestDevice = this._onDidRequestDevice.event;
        this._pending = /* @__PURE__ */ new Set();
        this._pendingDevices = /* @__PURE__ */ new Map();
        this.storageKeys = session4.storageScope === "ephemeral" /* Ephemeral */ ? {} : { permissions: `browser.permissions.${session4.id}` };
        this._register(this._permissionStore.onDidChange(() => {
          this._resolvePending();
          if (this._batching) {
            this._batchDirty = true;
            return;
          }
          if (this._persistable) {
            this._flushNow();
          }
        }));
        this._register(toDisposable(() => {
          for (const pending of this._pending) {
            pending.deferred.complete();
          }
          this._pending.clear();
          for (const device of [...this._pendingDevices.values()]) {
            device.settle(null);
          }
        }));
      }
      /**
       * Install the permission request / check / device handlers on the session.
       * Backed entirely by {@link BrowserPermissionStore}; unrecorded categories
       * are brokered to the owning browser view via {@link onDidRequestPermission}.
       */
      configure(electronSession) {
        electronSession.setPermissionRequestHandler((webContents4, permission, callback, details) => {
          this._resolveRequest(webContents4, permission, details).then(callback, () => callback(false));
        });
        electronSession.setPermissionCheckHandler((_webContents, permission, requestingOrigin, details) => {
          if (isAlwaysAllowedPermission(permission)) {
            return true;
          }
          const origin = toOriginKey(details.requestingUrl || requestingOrigin);
          const categories = electronPermissionToCategories(permission, mediaKindsFromDetails(details));
          if (categories.length === 0) {
            return false;
          }
          return categories.every((category) => this._permissionStore.isAllowed(origin, category));
        });
        electronSession.on("select-usb-device", (event, details, callback) => {
          event.preventDefault();
          const target = this._frameTarget(details.frame);
          if (!target || !this._deviceAllowed(target.origin)) {
            callback();
            return;
          }
          this._beginDeviceRequest({
            webContents: target.webContents,
            origin: target.origin,
            deviceType: "usb",
            devices: details.deviceList.map(usbCandidate),
            invoke: (deviceId) => deviceId === null ? callback() : callback(deviceId)
          });
        });
        electronSession.on("usb-device-added", (_event, device, webContents4) => {
          this._addDevice(webContents4, "usb", usbCandidate(device));
        });
        electronSession.on("usb-device-removed", (_event, device, webContents4) => {
          this._removeDevice(webContents4, "usb", device.deviceId);
        });
        electronSession.on("select-serial-port", (event, portList, webContents4, callback) => {
          event.preventDefault();
          const origin = toOriginKey(webContents4.getURL());
          if (!this._deviceAllowed(origin)) {
            callback("");
            return;
          }
          this._beginDeviceRequest({
            webContents: webContents4,
            origin,
            deviceType: "serial",
            devices: portList.map(serialCandidate),
            invoke: (deviceId) => callback(deviceId ?? "")
          });
        });
        electronSession.on("serial-port-added", (_event, port, webContents4) => {
          this._addDevice(webContents4, "serial", serialCandidate(port));
        });
        electronSession.on("serial-port-removed", (_event, port, webContents4) => {
          this._removeDevice(webContents4, "serial", port.portId);
        });
        electronSession.on("select-hid-device", (event, details, callback) => {
          event.preventDefault();
          const target = this._frameTarget(details.frame);
          if (!target || !this._deviceAllowed(target.origin)) {
            callback(null);
            return;
          }
          this._beginDeviceRequest({
            webContents: target.webContents,
            origin: target.origin,
            deviceType: "hid",
            devices: details.deviceList.map(hidCandidate),
            invoke: (deviceId) => callback(deviceId ?? null)
          });
        });
        electronSession.on("hid-device-added", (_event, details) => {
          const target = this._frameTarget(details.frame);
          if (target) {
            this._addDevice(target.webContents, "hid", hidCandidate(details.device));
          }
        });
        electronSession.on("hid-device-removed", (_event, details) => {
          const target = this._frameTarget(details.frame);
          if (target) {
            this._removeDevice(target.webContents, "hid", details.device.deviceId);
          }
        });
      }
      connectStorage(storage) {
        if (this._storage || !this.storageKeys.permissions) {
          return;
        }
        this._storage = storage;
        this._load();
        this._persistable = true;
      }
      serialize() {
        return this._permissionStore.serialize();
      }
      set(origin, grants) {
        const key = toOriginKey(origin);
        for (const grant of grants) {
          if (grant.state === null) {
            this._resolvePendingForCategory(key, grant.category);
          }
        }
        this._batching = true;
        this._batchDirty = false;
        try {
          this._permissionStore.setMany(origin, grants);
        } finally {
          this._batching = false;
        }
        if (this._batchDirty && this._persistable) {
          this._flushNow();
        }
      }
      _resolvePendingForCategory(origin, category) {
        if (!origin || this._pending.size === 0) {
          return;
        }
        for (const pending of [...this._pending]) {
          if (pending.origin === origin && pending.category === category) {
            pending.deferred.complete();
          }
        }
      }
      clear() {
        this._permissionStore.clear();
      }
      // -- Device choosers -------------------------------------------------
      beginBluetoothRequest(webContents4, devices, callback) {
        const origin = toOriginKey(webContents4.getURL());
        if (!this._deviceAllowed(origin)) {
          callback("");
          return;
        }
        const candidates = devices.map(bluetoothCandidate);
        const existing = this._findActiveDevice(webContents4, "bluetooth");
        if (existing) {
          existing.devices = candidates;
          existing.invoke = (deviceId) => callback(deviceId ?? "");
          this._emitDeviceRequest(existing);
          return;
        }
        this._beginDeviceRequest({
          webContents: webContents4,
          origin,
          deviceType: "bluetooth",
          devices: candidates,
          invoke: (deviceId) => callback(deviceId ?? "")
        });
      }
      resolveDevice(requestId, deviceId) {
        this._pendingDevices.get(requestId)?.settle(deviceId);
      }
      /** Begin a device chooser: register it, emit it, and cancel if unclaimed. */
      _beginDeviceRequest(params) {
        const requestId = generateUuid();
        const settle = (deviceId) => {
          if (pending.settled) {
            return;
          }
          pending.settled = true;
          params.webContents.off("destroyed", cancel);
          this._pendingDevices.delete(requestId);
          pending.invoke(deviceId);
        };
        const cancel = () => settle(null);
        const pending = {
          requestId,
          webContents: params.webContents,
          origin: params.origin,
          deviceType: params.deviceType,
          devices: params.devices,
          settled: false,
          invoke: params.invoke,
          settle
        };
        params.webContents.on("destroyed", cancel);
        this._pendingDevices.set(requestId, pending);
        if (!this._emitDeviceRequest(pending)) {
          cancel();
        }
      }
      _emitDeviceRequest(pending) {
        let claimed = false;
        this._onDidRequestDevice.fire({
          webContents: pending.webContents,
          origin: pending.origin,
          requestId: pending.requestId,
          deviceType: pending.deviceType,
          devices: pending.devices,
          claim: () => {
            claimed = true;
          }
        });
        return claimed;
      }
      _addDevice(webContents4, deviceType, candidate) {
        const pending = this._findActiveDevice(webContents4, deviceType);
        if (!pending || pending.devices.some((device) => device.deviceId === candidate.deviceId)) {
          return;
        }
        pending.devices = [...pending.devices, candidate];
        this._emitDeviceRequest(pending);
      }
      _removeDevice(webContents4, deviceType, deviceId) {
        const pending = this._findActiveDevice(webContents4, deviceType);
        if (!pending) {
          return;
        }
        const next = pending.devices.filter((device) => device.deviceId !== deviceId);
        if (next.length === pending.devices.length) {
          return;
        }
        pending.devices = next;
        this._emitDeviceRequest(pending);
      }
      _findActiveDevice(webContents4, deviceType) {
        for (const pending of this._pendingDevices.values()) {
          if (!pending.settled && pending.webContents === webContents4 && pending.deviceType === deviceType) {
            return pending;
          }
        }
        return void 0;
      }
      /** Resolve the owning web contents and origin for a requesting frame. */
      _frameTarget(frame) {
        if (!frame) {
          return void 0;
        }
        const webContents4 = electronWebContents.fromFrame(frame);
        if (!webContents4) {
          return void 0;
        }
        return { webContents: webContents4, origin: toOriginKey(frame.url || webContents4.getURL()) };
      }
      _deviceAllowed(origin) {
        return !!origin && this._permissionStore.isAllowed(origin, "devices" /* Devices */);
      }
      async _resolveRequest(webContents4, permission, details) {
        if (isAlwaysAllowedPermission(permission)) {
          return true;
        }
        const origin = toOriginKey(details?.requestingUrl ?? webContents4?.getURL());
        const categories = electronPermissionToCategories(permission, mediaKindsFromDetails(details));
        if (categories.length === 0 || !origin) {
          return false;
        }
        if (categories.every((category) => this._permissionStore.isAllowed(origin, category))) {
          return true;
        }
        if (categories.some((category) => this._permissionStore.getDecision(origin, category) === "deny")) {
          return false;
        }
        for (const category of categories) {
          if (!this._permissionStore.getDecision(origin, category)) {
            await this._prompt(webContents4, origin, category);
          }
        }
        return categories.every((category) => this._permissionStore.isAllowed(origin, category));
      }
      _prompt(webContents4, origin, category) {
        if (!webContents4) {
          return Promise.resolve();
        }
        let claimed = false;
        this._onDidRequestPermission.fire({
          webContents: webContents4,
          request: { origin, category },
          claim: () => {
            claimed = true;
          }
        });
        if (!claimed) {
          return Promise.resolve();
        }
        const pending = { origin, category, deferred: new DeferredPromise() };
        this._pending.add(pending);
        const timer = setTimeout(() => pending.deferred.complete(), PROMPT_TIMEOUT_MS);
        return pending.deferred.p.finally(() => {
          clearTimeout(timer);
          this._pending.delete(pending);
        });
      }
      /** Resolve any pending request whose (origin, category) now has a decision. */
      _resolvePending() {
        if (this._pending.size === 0) {
          return;
        }
        for (const pending of [...this._pending]) {
          if (this._permissionStore.getDecision(pending.origin, pending.category)) {
            pending.deferred.complete();
          }
        }
      }
      _load() {
        const storage = this._storage;
        const key = this.storageKeys.permissions;
        if (!storage || !key) {
          return;
        }
        const snapshot = parseSnapshot2(storage.get(key, -1 /* APPLICATION */));
        this._persistable = false;
        try {
          this._permissionStore.hydrate(snapshot);
        } finally {
          this._persistable = true;
        }
      }
      _flushNow() {
        const storage = this._storage;
        const key = this.storageKeys.permissions;
        if (!storage || !key) {
          return;
        }
        const snapshot = this._permissionStore.serialize();
        if (Object.keys(snapshot.origins).length === 0) {
          storage.remove(key, -1 /* APPLICATION */);
        } else {
          storage.store(key, JSON.stringify(snapshot), -1 /* APPLICATION */, 1 /* MACHINE */);
        }
      }
    };
  }
});
export { parseSnapshot2, mediaKindsFromDetails, vendorProductHex, usbCandidate, serialCandidate, hidCandidate, bluetoothCandidate, electronWebContents, PROMPT_TIMEOUT_MS, BrowserSessionPermissions, init_browserSessionPermissions };
