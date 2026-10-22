// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/telemetry.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/telemetry.ts
var MergeEditorTelemetry = class {
  constructor(telemetryService) {
    this.telemetryService = telemetryService;
  }
  reportMergeEditorOpened(args2) {
    this.telemetryService.publicLog2("mergeEditor.opened", {
      conflictCount: args2.conflictCount,
      combinableConflictCount: args2.combinableConflictCount,
      baseVisible: args2.baseVisible,
      isColumnView: args2.isColumnView,
      baseTop: args2.baseTop
    });
  }
  reportLayoutChange(args2) {
    this.telemetryService.publicLog2("mergeEditor.layoutChanged", {
      baseVisible: args2.baseVisible,
      isColumnView: args2.isColumnView,
      baseTop: args2.baseTop
    });
  }
  reportMergeEditorClosed(args2) {
    this.telemetryService.publicLog2("mergeEditor.closed", {
      conflictCount: args2.conflictCount,
      combinableConflictCount: args2.combinableConflictCount,
      durationOpenedSecs: args2.durationOpenedSecs,
      remainingConflictCount: args2.remainingConflictCount,
      accepted: args2.accepted,
      conflictsResolvedWithBase: args2.conflictsResolvedWithBase,
      conflictsResolvedWithInput1: args2.conflictsResolvedWithInput1,
      conflictsResolvedWithInput2: args2.conflictsResolvedWithInput2,
      conflictsResolvedWithSmartCombination: args2.conflictsResolvedWithSmartCombination,
      manuallySolvedConflictCountThatEqualNone: args2.manuallySolvedConflictCountThatEqualNone,
      manuallySolvedConflictCountThatEqualSmartCombine: args2.manuallySolvedConflictCountThatEqualSmartCombine,
      manuallySolvedConflictCountThatEqualInput1: args2.manuallySolvedConflictCountThatEqualInput1,
      manuallySolvedConflictCountThatEqualInput2: args2.manuallySolvedConflictCountThatEqualInput2,
      manuallySolvedConflictCountThatEqualNoneAndStartedWithBase: args2.manuallySolvedConflictCountThatEqualNoneAndStartedWithBase,
      manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1: args2.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1,
      manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2: args2.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2,
      manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart: args2.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart,
      manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart: args2.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart
    });
  }
  reportAcceptInvoked(inputNumber, otherAccepted) {
    this.telemetryService.publicLog2("mergeEditor.action.accept", {
      otherAccepted,
      isInput1: inputNumber === 1
    });
  }
  reportSmartCombinationInvoked(otherAccepted) {
    this.telemetryService.publicLog2("mergeEditor.action.smartCombination", {
      otherAccepted
    });
  }
  reportRemoveInvoked(inputNumber, otherAccepted) {
    this.telemetryService.publicLog2("mergeEditor.action.remove", {
      otherAccepted,
      isInput1: inputNumber === 1
    });
  }
  reportResetToBaseInvoked() {
    this.telemetryService.publicLog2("mergeEditor.action.resetToBase", {});
  }
  reportNavigationToNextConflict() {
    this.telemetryService.publicLog2("mergeEditor.action.goToNextConflict", {});
  }
  reportNavigationToPreviousConflict() {
    this.telemetryService.publicLog2("mergeEditor.action.goToPreviousConflict", {});
  }
  reportConflictCounterClicked() {
    this.telemetryService.publicLog2("mergeEditor.action.conflictCounterClicked", {});
  }
};

MergeEditorTelemetry = __decorateClass([
  __decorateParam(0, ITelemetryService)
], MergeEditorTelemetry);
export { MergeEditorTelemetry };
