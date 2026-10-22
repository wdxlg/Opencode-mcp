// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markersChatContext.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { IChatContextPickService, picksWithPromiseFn } from "./module-1453.mjs";
import { groupBy2 } from "./module-0007.mjs";
import { extUri } from "./module-0034.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { IDiagnosticVariableEntryFilterData } from "./module-0979.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IEditorService } from "./module-0934.mjs";
import { Disposable } from "./module-0012.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/markers/browser/markersChatContext.ts
var MarkerChatContextPick = class {
  constructor(_markerService, _labelService, _editorService) {
    this._markerService = _markerService;
    this._labelService = _labelService;
    this._editorService = _editorService;
    this.type = "pickerPick";
    this.label = localize(16696, null);
    this.icon = Codicon.error;
    this.ordinal = -100;
  }
  isEnabled(widget) {
    return !!widget.attachmentCapabilities.supportsProblemAttachments;
  }
  asPicker() {
    return {
      placeholder: localize(16697, null),
      picks: picksWithPromiseFn(async (query, token) => {
        return this.getPicksForQuery(query);
      })
    };
  }
  /**
   * @internal For testing purposes only
   */
  getPicksForQuery(query) {
    const markers = this._markerService.read({ severities: 8 /* Error */ | 4 /* Warning */ | 2 /* Info */ });
    const grouped = groupBy2(markers, (a, b) => extUri.compare(a.resource, b.resource));
    const activeEditorUri = EditorResourceAccessor.getCanonicalUri(this._editorService.activeEditor);
    const sortedGroups = grouped.sort((groupA, groupB) => {
      const resourceA = groupA[0].resource;
      const resourceB = groupB[0].resource;
      if (activeEditorUri) {
        const isAActiveFile = extUri.isEqual(resourceA, activeEditorUri);
        const isBActiveFile = extUri.isEqual(resourceB, activeEditorUri);
        if (isAActiveFile && !isBActiveFile) {
          return -1;
        }
        if (!isAActiveFile && isBActiveFile) {
          return 1;
        }
      }
      return extUri.compare(resourceA, resourceB);
    });
    const severities = /* @__PURE__ */ new Set();
    const items = [];
    let pickCount = 0;
    for (const group2 of sortedGroups) {
      const resource = group2[0].resource;
      const isActiveFile = activeEditorUri && extUri.isEqual(resource, activeEditorUri);
      const fileLabel = this._labelService.getUriLabel(resource, { relative: true });
      const separatorLabel = isActiveFile ? `${fileLabel} (current file)` : fileLabel;
      items.push({ type: "separator", label: separatorLabel });
      for (const marker of group2) {
        pickCount++;
        severities.add(marker.severity);
        items.push({
          label: marker.message,
          description: localize(16699, null, "" + marker.startLineNumber, "" + marker.startColumn),
          asAttachment() {
            return IDiagnosticVariableEntryFilterData.toEntry(IDiagnosticVariableEntryFilterData.fromMarker(marker));
          }
        });
      }
    }
    items.unshift({
      label: localize(16698, null),
      asAttachment() {
        return IDiagnosticVariableEntryFilterData.toEntry({
          filterSeverity: 2 /* Info */
        });
      }
    });
    return items;
  }
};

MarkerChatContextPick = __decorateClass([
  __decorateParam(0, IMarkerService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IEditorService)
], MarkerChatContextPick);

var MarkerChatContextContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chat.markerChatContextContribution";
  }
  constructor(contextPickService, instantiationService) {
    super();
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(MarkerChatContextPick)));
  }
};

MarkerChatContextContribution = __decorateClass([
  __decorateParam(0, IChatContextPickService),
  __decorateParam(1, IInstantiationService)
], MarkerChatContextContribution);
export { MarkerChatContextPick, MarkerChatContextContribution };
