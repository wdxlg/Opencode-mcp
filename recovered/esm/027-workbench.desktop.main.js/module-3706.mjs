// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/aiContributionFeature.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { autorun } from "./module-0052.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { createDocWithJustReason } from "./module-3684.mjs";
import { DocumentEditSourceTracker } from "./module-3692.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/aiContributionFeature.ts
var AiContributionFeature = class extends Disposable {
  constructor(annotatedDocuments) {
    super();
    this._trackers = new ResourceMap();
    this._documentsByUri = new ResourceMap();
    this._register(autorun((reader) => {
      const docs = annotatedDocuments.documents.read(reader);
      const activeUris = new ResourceMap();
      for (const doc of docs) {
        const uri5 = doc.document.uri;
        activeUris.set(uri5, true);
        this._documentsByUri.set(uri5, doc);
        if (!this._trackers.has(uri5)) {
          this._trackers.set(uri5, this._createTrackerEntry(doc));
        }
      }
      for (const [uri5, entry] of this._trackers) {
        if (!activeUris.has(uri5)) {
          entry.trackerStore.dispose();
          this._trackers.delete(uri5);
          this._documentsByUri.delete(uri5);
        }
      }
    }));
    this._register(CommandsRegistry.registerCommand("_aiEdits.hasAiContributions", (_accessor, resources, level) => {
      return this._hasAiContributions(resources, level);
    }));
    this._register(CommandsRegistry.registerCommand("_aiEdits.clearAiContributions", (_accessor, resources) => {
      this._clearAiContributions(resources);
    }));
    this._register(CommandsRegistry.registerCommand("_aiEdits.clearAllAiContributions", () => {
      this._clearAiContributions();
    }));
  }
  dispose() {
    for (const [, entry] of this._trackers) {
      entry.trackerStore.dispose();
    }
    super.dispose();
  }
  _createTrackerEntry(doc) {
    const trackerStore = new DisposableStore();
    const docWithJustReason = createDocWithJustReason(doc.documentWithAnnotations, trackerStore);
    const tracker2 = trackerStore.add(new DocumentEditSourceTracker(docWithJustReason, void 0));
    return { trackerStore, tracker: tracker2 };
  }
  _hasAiContributions(resources, level) {
    for (const resource of resources) {
      const entry = this._trackers.get(URI.revive(resource));
      if (entry) {
        for (const edit3 of entry.tracker.getTrackedRanges()) {
          if (edit3.source.category === "ai" && (level === "all" || edit3.source.feature === "chat")) {
            return true;
          }
        }
      }
    }
    return false;
  }
  _clearAiContributions(resources) {
    const uris = resources ? resources.map((r2) => URI.revive(r2)) : [...this._trackers.keys()];
    for (const uri5 of uris) {
      const entry = this._trackers.get(uri5);
      if (entry) {
        entry.trackerStore.dispose();
        const doc = this._documentsByUri.get(uri5);
        if (doc) {
          this._trackers.set(uri5, this._createTrackerEntry(doc));
        } else {
          this._trackers.delete(uri5);
          this._documentsByUri.delete(uri5);
        }
      }
    }
  }
};
export { AiContributionFeature };
