// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/marker/markerProvider.ts
import { CellUri } from "./module-0909.mjs";
import { IMarkerNavigationService, MarkerList } from "./module-0698.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Disposable } from "./module-0012.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { editorErrorForeground, editorWarningForeground } from "./module-0229.mjs";
import { throttle } from "./module-0250.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { registerNotebookContribution } from "./module-1893.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/marker/markerProvider.ts
var MarkerListProvider = class {
  constructor(_markerService, markerNavigation, _configService) {
    this._markerService = _markerService;
    this._configService = _configService;
    this._dispoables = markerNavigation.registerProvider(this);
  }
  static {
    this.ID = "workbench.contrib.markerListProvider";
  }
  dispose() {
    this._dispoables.dispose();
  }
  getMarkerList(resource) {
    if (!resource) {
      return void 0;
    }
    const data = CellUri.parse(resource);
    if (!data) {
      return void 0;
    }
    return new MarkerList((uri5) => {
      const otherData = CellUri.parse(uri5);
      return otherData?.notebook.toString() === data.notebook.toString();
    }, this._markerService, this._configService);
  }
};

MarkerListProvider = __decorateClass([
  __decorateParam(0, IMarkerService),
  __decorateParam(1, IMarkerNavigationService),
  __decorateParam(2, IConfigurationService)
], MarkerListProvider);

var NotebookMarkerDecorationContribution = class extends Disposable {
  constructor(_notebookEditor, _markerService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._markerService = _markerService;
    this._markersOverviewRulerDecorations = [];
    this._update();
    this._register(this._notebookEditor.onDidChangeModel(() => this._update()));
    this._register(this._markerService.onMarkerChanged((e) => {
      if (e.some((uri5) => this._notebookEditor.getCellsInRange().some((cell) => isEqual2(cell.uri, uri5)))) {
        this._update();
      }
    }));
  }
  static {
    this.id = "workbench.notebook.markerDecoration";
  }
  _update() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const cellDecorations = [];
    this._notebookEditor.getCellsInRange().forEach((cell) => {
      const marker = this._markerService.read({ resource: cell.uri, severities: 8 /* Error */ | 4 /* Warning */ });
      marker.forEach((m) => {
        const color2 = m.severity === 8 /* Error */ ? editorErrorForeground : editorWarningForeground;
        const range2 = { startLineNumber: m.startLineNumber, startColumn: m.startColumn, endLineNumber: m.endLineNumber, endColumn: m.endColumn };
        cellDecorations.push({
          handle: cell.handle,
          options: {
            overviewRuler: {
              color: color2,
              modelRanges: [range2],
              includeOutput: false,
              position: 4 /* Right */
            }
          }
        });
      });
    });
    this._markersOverviewRulerDecorations = this._notebookEditor.deltaCellDecorations(this._markersOverviewRulerDecorations, cellDecorations);
  }
};

__decorateClass([
  throttle(100)
], NotebookMarkerDecorationContribution.prototype, "_update", 1);

NotebookMarkerDecorationContribution = __decorateClass([
  __decorateParam(1, IMarkerService)
], NotebookMarkerDecorationContribution);

registerWorkbenchContribution2(MarkerListProvider.ID, MarkerListProvider, WorkbenchPhase.BlockRestore);

registerNotebookContribution(NotebookMarkerDecorationContribution.id, NotebookMarkerDecorationContribution);
export { MarkerListProvider, NotebookMarkerDecorationContribution };
