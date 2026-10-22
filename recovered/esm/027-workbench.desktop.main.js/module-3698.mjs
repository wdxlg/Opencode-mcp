// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/telemetry/editSourceTrackingFeature.ts
import { Disposable } from "./module-0012.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { EDIT_TELEMETRY_DETAILS_SETTING_ID, EDIT_TELEMETRY_SHOW_DECORATIONS, EDIT_TELEMETRY_SHOW_STATUS_BAR } from "./module-3697.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived, derivedWithSetter } from "./module-0054.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { DataChannelForwardingTelemetryService } from "./module-0722.mjs";
import { AgentHostEditMarkerService } from "./module-3695.mjs";
import { EditSourceTrackingImpl } from "./module-3696.mjs";
import { autorun } from "./module-0052.mjs";
import { mapObservableArrayCached } from "./module-0059.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { DynamicCssRules } from "./module-0237.mjs";
import { CachedFunction } from "./module-0027.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/telemetry/editSourceTrackingFeature.ts
var EditTrackingFeature = class extends Disposable {
  constructor(_workspace, _annotatedDocuments, _configurationService, _instantiationService, _statusbarService, _editorService, _extensionService) {
    super();
    this._workspace = _workspace;
    this._annotatedDocuments = _annotatedDocuments;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._statusbarService = _statusbarService;
    this._editorService = _editorService;
    this._extensionService = _extensionService;
    this._showStateInMarkdownDoc = "editTelemetry.showDebugDetails";
    this._toggleDecorations = "editTelemetry.toggleDebugDecorations";
    this._editSourceTrackingShowDecorations = makeSettable(observableConfigValue(EDIT_TELEMETRY_SHOW_DECORATIONS, false, this._configurationService));
    this._editSourceTrackingShowStatusBar = observableConfigValue(EDIT_TELEMETRY_SHOW_STATUS_BAR, false, this._configurationService);
    const editSourceDetailsEnabled = observableConfigValue(EDIT_TELEMETRY_DETAILS_SETTING_ID, false, this._configurationService);
    const extensions = observableFromEvent(this._extensionService.onDidChangeExtensions, () => {
      return this._extensionService.extensions;
    });
    const extensionIds = derived((reader) => new Set(extensions.read(reader).map((e) => e.identifier.value.toLowerCase())));
    function getExtensionInfoObs(extensionId) {
      const extIdLowerCase = extensionId.toLowerCase();
      return derived((reader) => extensionIds.read(reader).has(extIdLowerCase));
    }
    const copilotInstalled = getExtensionInfoObs("GitHub.copilot");
    const copilotChatInstalled = getExtensionInfoObs("GitHub.copilot-chat");
    const shouldSendDetails = derived((reader) => editSourceDetailsEnabled.read(reader) || !!copilotInstalled.read(reader) || !!copilotChatInstalled.read(reader));
    const instantiationServiceWithInterceptedTelemetry = this._instantiationService.createChild(new ServiceCollection(
      [ITelemetryService, this._instantiationService.createInstance(DataChannelForwardingTelemetryService)]
    ));
    const markerService = this._register(instantiationServiceWithInterceptedTelemetry.createInstance(AgentHostEditMarkerService));
    const impl = this._register(instantiationServiceWithInterceptedTelemetry.createInstance(EditSourceTrackingImpl, shouldSendDetails, this._annotatedDocuments, markerService));
    this._register(autorun((reader) => {
      if (!this._editSourceTrackingShowDecorations.read(reader)) {
        return;
      }
      const visibleEditors = observableFromEvent(this, this._editorService.onDidVisibleEditorsChange, () => this._editorService.visibleTextEditorControls);
      mapObservableArrayCached(this, visibleEditors, (editor, store) => {
        if (editor instanceof CodeEditorWidget) {
          const obsEditor = observableCodeEditor(editor);
          const cssStyles = new DynamicCssRules(editor);
          const decorations = new CachedFunction((source) => {
            const r2 = store.add(cssStyles.createClassNameRef({
              backgroundColor: source.getColor()
            }));
            return r2.className;
          });
          store.add(obsEditor.setDecorations(derived((reader2) => {
            const uri5 = obsEditor.model.read(reader2)?.uri;
            if (!uri5) {
              return [];
            }
            const doc = this._workspace.getDocument(uri5);
            if (!doc) {
              return [];
            }
            const docsState = impl.docsState.read(reader2).get(doc);
            if (!docsState) {
              return [];
            }
            const ranges = docsState.longtermTracker.read(reader2)?.getTrackedRanges(reader2) ?? [];
            return ranges.map((r2) => ({
              range: doc.value.read(void 0).getTransformer().getRange(r2.range),
              options: {
                description: "editSourceTracking",
                inlineClassName: decorations.get(r2.source)
              }
            }));
          })));
        }
      }).recomputeInitiallyAndOnChange(reader.store);
    }));
    this._register(autorun((reader) => {
      if (!this._editSourceTrackingShowStatusBar.read(reader)) {
        return;
      }
      const statusBarItem = reader.store.add(this._statusbarService.addEntry(
        {
          name: "",
          text: "",
          command: this._showStateInMarkdownDoc,
          tooltip: "Edit Source Tracking",
          ariaLabel: ""
        },
        "editTelemetry",
        1 /* RIGHT */,
        100
      ));
      const sumChangedCharacters = derived((reader2) => {
        const docs = impl.docsState.read(reader2);
        let sum2 = 0;
        for (const state of docs.values()) {
          const t2 = state.longtermTracker.read(reader2);
          if (!t2) {
            continue;
          }
          const d = state.getTelemetryData(t2.getTrackedRanges(reader2));
          sum2 += d.totalModifiedCharactersInFinalState;
        }
        return sum2;
      });
      const tooltipMarkdownString = derived((reader2) => {
        const docs = impl.docsState.read(reader2);
        const docsDataInTooltip = [];
        const editSources = [];
        for (const [doc, state] of docs) {
          const tracker2 = state.longtermTracker.read(reader2);
          if (!tracker2) {
            continue;
          }
          const trackedRanges = tracker2.getTrackedRanges(reader2);
          const data = state.getTelemetryData(trackedRanges);
          if (data.totalModifiedCharactersInFinalState === 0) {
            continue;
          }
          editSources.push(...trackedRanges.map((r2) => r2.source));
          const filteredData = Object.fromEntries(
            Object.entries(data).filter(([_, value2]) => !(typeof value2 === "number") || value2 !== 0)
          );
          docsDataInTooltip.push([
            `### ${doc.uri.fsPath}`,
            "```json",
            JSON.stringify(filteredData, void 0, "	"),
            "```",
            "\n"
          ].join("\n"));
        }
        let tooltipContent;
        if (docsDataInTooltip.length === 0) {
          tooltipContent = "No modified documents";
        } else if (docsDataInTooltip.length <= 3) {
          tooltipContent = docsDataInTooltip.join("\n\n");
        } else {
          const lastThree = docsDataInTooltip.slice(-3);
          tooltipContent = "...\n\n" + lastThree.join("\n\n");
        }
        const agenda = this._createEditSourceAgenda(editSources);
        const tooltipWithCommand = new MarkdownString(tooltipContent + "\n\n[View Details](command:" + this._showStateInMarkdownDoc + ")");
        tooltipWithCommand.appendMarkdown("\n\n" + agenda + "\n\nToggle decorations: [Click here](command:" + this._toggleDecorations + ")");
        tooltipWithCommand.isTrusted = { enabledCommands: [this._toggleDecorations] };
        tooltipWithCommand.supportHtml = true;
        return tooltipWithCommand;
      });
      reader.store.add(autorun((reader2) => {
        statusBarItem.update({
          name: "editTelemetry",
          text: `$(edit) ${sumChangedCharacters.read(reader2)} chars inserted`,
          ariaLabel: `Edit Source Tracking: ${sumChangedCharacters.read(reader2)} modified characters`,
          tooltip: tooltipMarkdownString.read(reader2),
          command: this._showStateInMarkdownDoc
        });
      }));
      reader.store.add(CommandsRegistry.registerCommand(this._toggleDecorations, () => {
        this._editSourceTrackingShowDecorations.set(!this._editSourceTrackingShowDecorations.read(void 0), void 0);
      }));
    }));
  }
  _createEditSourceAgenda(editSources) {
    const editSourcesSeen = /* @__PURE__ */ new Set();
    const editSourceInfo = [];
    for (const editSource of editSources) {
      if (!editSourcesSeen.has(editSource.toString())) {
        editSourcesSeen.add(editSource.toString());
        editSourceInfo.push({ name: editSource.toString(), color: editSource.getColor() });
      }
    }
    const agendaItems = editSourceInfo.map(
      (info) => `<span style="background-color:${info.color};border-radius:3px;">${info.name}</span>`
    );
    return agendaItems.join(" ");
  }
};

EditTrackingFeature = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStatusbarService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IExtensionService)
], EditTrackingFeature);

function makeSettable(obs) {
  const overrideObs = observableValue("overrideObs", void 0);
  return derivedWithSetter(overrideObs, (reader) => {
    return overrideObs.read(reader) ?? obs.read(reader);
  }, (value2, tx) => {
    overrideObs.set(value2, tx);
  });
}
export { makeSettable, EditTrackingFeature };
