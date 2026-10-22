// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/telemetry/chatModelCountTelemetry.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/chat/browser/telemetry/chatModelCountTelemetry.ts
var ChatModelCountTelemetry = class extends Disposable {
  constructor(chatService, chatWidgetService, telemetryService) {
    super();
    this.chatService = chatService;
    this.chatWidgetService = chatWidgetService;
    this.telemetryService = telemetryService;
    this.logStartupTelemetry();
    this._register(this.chatService.onDidCreateModel((model) => this.onDidCreateModel(model.initialLocation)));
  }
  static {
    this.ID = "workbench.contrib.chatModelCountTelemetry";
  }
  logStartupTelemetry() {
    this.telemetryService.publicLog2("chat.modelsAtStartup", this.getSnapshot());
  }
  onDidCreateModel(newModelLocation) {
    const snapshot = this.getSnapshot();
    if (snapshot.totalModels <= 1) {
      return;
    }
    this.telemetryService.publicLog2("chat.modelCreatedStats", {
      ...snapshot,
      newModelLocation
    });
  }
  getSnapshot() {
    const snapshot = this.chatService.getChatModelReferenceDebugInfo();
    let modelsOpenInWidgets = 0;
    let backgroundModels = 0;
    let backgroundModels_modifiedEditsKeepAlive = 0;
    let backgroundModels_requestInProgressKeepAlive = 0;
    let backgroundModels_otherHolders = 0;
    for (const model of snapshot.models) {
      if (this.chatWidgetService.getWidgetBySessionResource(model.sessionResource)) {
        modelsOpenInWidgets++;
      } else {
        backgroundModels++;
        let hasOther = false;
        for (const { holder } of model.holders) {
          if (holder === "ChatModel#modifiedEditsKeepAlive") {
            backgroundModels_modifiedEditsKeepAlive++;
          } else if (holder === "ChatModel#requestInProgressKeepAlive") {
            backgroundModels_requestInProgressKeepAlive++;
          } else {
            hasOther = true;
          }
        }
        if (hasOther) {
          backgroundModels_otherHolders++;
        }
      }
    }
    return {
      totalModels: snapshot.totalModels,
      modelsOpenInWidgets,
      backgroundModels,
      backgroundModels_modifiedEditsKeepAlive,
      backgroundModels_requestInProgressKeepAlive,
      backgroundModels_otherHolders
    };
  }
};

ChatModelCountTelemetry = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, ITelemetryService)
], ChatModelCountTelemetry);

registerWorkbenchContribution2(ChatModelCountTelemetry.ID, ChatModelCountTelemetry, WorkbenchPhase.AfterRestored);
export { ChatModelCountTelemetry };
