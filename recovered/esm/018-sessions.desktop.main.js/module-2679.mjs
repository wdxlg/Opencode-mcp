// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/transcriptContextAttachmentWidget.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { isChatTranscriptContextVariableEntry } from "./module-0980.mjs";
import { TranscriptContextAttachmentWidget } from "./module-2027.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatAttachmentWidgetRegistry } from "./module-2028.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/transcriptContextAttachmentWidget.contribution.ts
var TranscriptContextAttachmentWidgetContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.transcriptContextAttachmentWidgetFactory";
  }
  constructor(registry4, instantiationService) {
    super();
    const labels = this._register(instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
    this._register(registry4.registerFactory(
      "transcriptContext",
      (attachment, options3, container2) => {
        if (!isChatTranscriptContextVariableEntry(attachment)) {
          throw new Error("Expected a transcriptContext attachment");
        }
        return instantiationService.createInstance(TranscriptContextAttachmentWidget, attachment, void 0, options3, container2, labels);
      }
    ));
  }
};

TranscriptContextAttachmentWidgetContribution = __decorateClass([
  __decorateParam(0, IChatAttachmentWidgetRegistry),
  __decorateParam(1, IInstantiationService)
], TranscriptContextAttachmentWidgetContribution);
export { TranscriptContextAttachmentWidgetContribution };
