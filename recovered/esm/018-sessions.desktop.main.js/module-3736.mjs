// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changesSummaryWidget.ts
import { Disposable } from "./module-0012.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { $ } from "./module-0075.mjs";
import { AnimatedCounterWidget } from "./module-2236.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/changes/browser/changesSummaryWidget.ts
var ChangesSummaryWidget = class extends Disposable {
  constructor(changesViewService, _instantiationService) {
    super();
    this._instantiationService = _instantiationService;
    const summaryRawObs = derivedObservableWithCache(this, (reader, lastValue) => {
      const isLoading = changesViewService.activeSessionLoadingObs.read(reader);
      if (isLoading) {
        return lastValue;
      }
      const entries2 = changesViewService.activeSessionChangesObs.read(reader);
      if (entries2.length === 0) {
        return void 0;
      }
      let additions = 0, deletions = 0;
      for (const entry of entries2) {
        additions += entry.insertions;
        deletions += entry.deletions;
      }
      return {
        additions,
        deletions,
        files: entries2.length
      };
    });
    this._summaryObs = derivedOpts({
      equalsFn: structuralEquals
    }, (reader) => summaryRawObs.read(reader));
  }
  get summary() {
    return this._summaryObs;
  }
  render(container2) {
    const element = $("div.changes-summary-widget");
    container2.appendChild(element);
    this._register(this._instantiationService.createInstance(AnimatedCounterWidget, element, {
      prefix: "+",
      direction: "topToBottom",
      cssClassName: "changes-summary-lines-added",
      count: derived(this, (reader) => {
        return this._summaryObs.read(reader)?.additions;
      })
    }));
    this._register(this._instantiationService.createInstance(AnimatedCounterWidget, element, {
      prefix: "-",
      direction: "bottomToTop",
      cssClassName: "changes-summary-lines-removed",
      count: derived(this, (reader) => {
        return this._summaryObs.read(reader)?.deletions;
      })
    }));
  }
};

ChangesSummaryWidget = __decorateClass([
  __decorateParam(0, IChangesViewService),
  __decorateParam(1, IInstantiationService)
], ChangesSummaryWidget);
export { ChangesSummaryWidget };
