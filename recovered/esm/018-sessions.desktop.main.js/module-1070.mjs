// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDiagnostics.ts
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/api/browser/mainThreadDiagnostics.ts
var MainThreadDiagnostics = class {
  constructor(extHostContext, _markerService, _uriIdentService) {
    this._markerService = _markerService;
    this._uriIdentService = _uriIdentService;
    this._activeOwners = /* @__PURE__ */ new Set();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDiagnostics);
    this._markerListener = this._markerService.onMarkerChanged(this._forwardMarkers, this);
    this.extHostId = `extHost${MainThreadDiagnostics.ExtHostCounter++}`;
  }
  dispose() {
    this._markerListener.dispose();
    for (const owner of this._activeOwners) {
      const markersData = new ResourceMap();
      for (const marker of this._markerService.read({ owner })) {
        let data = markersData.get(marker.resource);
        if (data === void 0) {
          data = [];
          markersData.set(marker.resource, data);
        }
        if (marker.origin !== this.extHostId) {
          data.push(marker);
        }
      }
      for (const [resource, local] of markersData.entries()) {
        this._markerService.changeOne(owner, resource, local);
      }
    }
    this._activeOwners.clear();
  }
  _forwardMarkers(resources) {
    const data = [];
    for (const resource of resources) {
      const allMarkerData = this._markerService.read({ resource, ignoreResourceFilters: true });
      const markerData = allMarkerData.filter((marker) => marker.origin !== this.extHostId);
      data.push([resource, markerData]);
    }
    if (data.length > 0) {
      this._proxy.$acceptMarkersChange(data);
    }
  }
  $changeMany(owner, entries2) {
    for (const entry of entries2) {
      const [uri4, markers] = entry;
      if (markers) {
        for (const marker of markers) {
          if (marker.relatedInformation) {
            for (const relatedInformation of marker.relatedInformation) {
              relatedInformation.resource = URI.revive(relatedInformation.resource);
            }
          }
          if (marker.code && typeof marker.code !== "string") {
            marker.code.target = URI.revive(marker.code.target);
          }
          if (marker.origin === void 0) {
            marker.origin = this.extHostId;
          }
        }
      }
      this._markerService.changeOne(owner, this._uriIdentService.asCanonicalUri(URI.revive(uri4)), markers);
    }
    this._activeOwners.add(owner);
  }
  $clear(owner) {
    this._markerService.changeAll(owner, []);
    this._activeOwners.delete(owner);
  }
};

MainThreadDiagnostics.ExtHostCounter = 1;

MainThreadDiagnostics = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDiagnostics),
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IUriIdentityService)
], MainThreadDiagnostics);
export { MainThreadDiagnostics };
