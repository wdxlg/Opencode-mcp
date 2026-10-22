// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markersFileDecorations.ts
import { localize } from "./module-0001.mjs";
import { listErrorForeground, listWarningForeground } from "./module-0232.mjs";
import { dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IDecorationsService } from "./module-1067.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/markers/browser/markersFileDecorations.ts
var MarkersDecorationsProvider = class {
  constructor(_markerService) {
    this._markerService = _markerService;
    this.label = localize(16700, null);
    this.onDidChange = _markerService.onMarkerChanged;
  }
  provideDecorations(resource) {
    const markers = this._markerService.read({
      resource,
      severities: 8 /* Error */ | 4 /* Warning */
    });
    let first2;
    for (const marker of markers) {
      if (!first2 || marker.severity > first2.severity) {
        first2 = marker;
      }
    }
    if (!first2) {
      return void 0;
    }
    return {
      weight: 100 * first2.severity,
      bubble: true,
      tooltip: markers.length === 1 ? localize(16702, null) : localize(16703, null, markers.length),
      letter: markers.length < 10 ? markers.length.toString() : "9+",
      color: first2.severity === 8 /* Error */ ? listErrorForeground : listWarningForeground
    };
  }
};

var MarkersFileDecorations = class {
  constructor(_markerService, _decorationsService, _configurationService) {
    this._markerService = _markerService;
    this._decorationsService = _decorationsService;
    this._configurationService = _configurationService;
    this._disposables = [
      this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("problems.visibility")) {
          this._updateEnablement();
        }
      })
    ];
    this._updateEnablement();
  }
  dispose() {
    dispose(this._provider);
    dispose(this._disposables);
  }
  _updateEnablement() {
    const problem = this._configurationService.getValue("problems.visibility");
    if (problem === void 0) {
      return;
    }
    const value2 = this._configurationService.getValue("problems");
    const shouldEnable = problem && value2.decorations.enabled;
    if (shouldEnable === this._enabled) {
      if (!problem || !value2.decorations.enabled) {
        this._provider?.dispose();
        this._provider = void 0;
      }
      return;
    }
    this._enabled = shouldEnable;
    if (this._enabled) {
      const provider = new MarkersDecorationsProvider(this._markerService);
      this._provider = this._decorationsService.registerDecorationsProvider(provider);
    } else if (this._provider) {
      this._provider.dispose();
    }
  }
};

MarkersFileDecorations = __decorateClass([
  __decorateParam(0, IMarkerService),
  __decorateParam(1, IDecorationsService),
  __decorateParam(2, IConfigurationService)
], MarkersFileDecorations);

Registry.as(Extensions4.Configuration).registerConfiguration({
  "id": "problems",
  "order": 101,
  "type": "object",
  "properties": {
    "problems.decorations.enabled": {
      "markdownDescription": localize(16701, null, "`#problems.visibility#`"),
      "type": "boolean",
      "default": true
    }
  }
});

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(MarkersFileDecorations, 3 /* Restored */);
export { MarkersDecorationsProvider, MarkersFileDecorations };
