// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/browser/taskProblemMonitor.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";


// src/vs/workbench/contrib/tasks/browser/taskProblemMonitor.ts
var TaskProblemMonitor = class extends Disposable {
  constructor() {
    super();
    this.terminalMarkerMap = /* @__PURE__ */ new Map();
    this.terminalDisposables = new DisposableMap();
  }
  addTerminal(terminal2, problemMatcher) {
    this.terminalMarkerMap.set(terminal2.instanceId, {
      resources: /* @__PURE__ */ new Map(),
      markers: /* @__PURE__ */ new Map()
    });
    const store = new DisposableStore();
    this.terminalDisposables.set(terminal2.instanceId, store);
    store.add(terminal2.onDisposed(() => {
      this.terminalMarkerMap.delete(terminal2.instanceId);
      this.terminalDisposables.deleteAndDispose(terminal2.instanceId);
    }));
    store.add(problemMatcher.onDidFindErrors((markers) => {
      const markerData = this.terminalMarkerMap.get(terminal2.instanceId);
      if (markerData) {
        markerData.markers.clear();
        markerData.resources.clear();
        for (const marker of markers) {
          if (marker.severity === 8 /* Error */) {
            markerData.resources.set(marker.resource.toString(), marker.resource);
            const markersForOwner = markerData.markers.get(marker.owner);
            let markerMap = markersForOwner;
            if (!markerMap) {
              markerMap = /* @__PURE__ */ new Map();
              markerData.markers.set(marker.owner, markerMap);
            }
            markerMap.set(marker.resource.toString(), marker);
            this.terminalMarkerMap.set(terminal2.instanceId, markerData);
          }
        }
      }
    }));
    store.add(problemMatcher.onDidRequestInvalidateLastMarker(() => {
      const markerData = this.terminalMarkerMap.get(terminal2.instanceId);
      markerData?.markers.clear();
      markerData?.resources.clear();
      this.terminalMarkerMap.set(terminal2.instanceId, {
        resources: /* @__PURE__ */ new Map(),
        markers: /* @__PURE__ */ new Map()
      });
    }));
  }
  /**
   * Gets the task problems for a specific terminal instance
   * @param instanceId The terminal instance ID
   * @returns Map of problem matchers to their resources and marker data, or undefined if no problems found
   */
  getTaskProblems(instanceId) {
    const markerData = this.terminalMarkerMap.get(instanceId);
    if (!markerData) {
      return void 0;
    } else if (markerData.markers.size === 0) {
      return /* @__PURE__ */ new Map();
    }
    const result = /* @__PURE__ */ new Map();
    for (const [owner, markersMap] of markerData.markers) {
      const resources = [];
      const markers = [];
      for (const [resource, marker] of markersMap) {
        resources.push(markerData.resources.get(resource));
        markers.push(marker);
      }
      result.set(owner, { resources, markers });
    }
    return result;
  }
};
export { TaskProblemMonitor };
