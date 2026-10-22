// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupGrowthSession.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { AgentSessionProviders } from "./module-0983.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { ILogService } from "./module-0095.mjs";
import { ICommandService } from "./module-0087.mjs";
import { CHAT_OPEN_ACTION_ID } from "./module-1475.mjs";
import { sessionOpenerRegistry } from "./module-2640.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";


// src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupGrowthSession.ts
var GrowthSessionController = class extends Disposable {
  constructor(storageService, chatWidgetService, lifecycleService, logService) {
    super();
    this.storageService = storageService;
    this.chatWidgetService = chatWidgetService;
    this.lifecycleService = lifecycleService;
    this.logService = logService;
    this._onDidChangeChatSessionItems = this._register(new Emitter());
    this.onDidChangeChatSessionItems = this._onDidChangeChatSessionItems.event;
    this._onDidDismiss = this._register(new Emitter());
    this.onDidDismiss = this._onDidDismiss.event;
    this._created = Date.now();
    this._dismissed = this.storageService.getBoolean(GrowthSessionController.STORAGE_KEY, -1 /* APPLICATION */, false);
    this.lifecycleService.when(3 /* Restored */).then(() => {
      if (this._store.isDisposed || this._dismissed) {
        return;
      }
      this._register(this.chatWidgetService.onDidAddWidget(() => {
        this.dismiss();
      }));
    });
  }
  static {
    this.STORAGE_KEY = "chat.growthSession.dismissed";
  }
  static {
    this.SESSION_URI = URI.from({ scheme: AgentSessionProviders.Growth, path: "/growth-welcome" });
  }
  get isDismissed() {
    return this._dismissed;
  }
  get items() {
    if (this._dismissed) {
      return [];
    }
    return [{
      resource: GrowthSessionController.SESSION_URI,
      label: localize(11159, null),
      description: localize(11158, null),
      status: 3 /* NeedsInput */,
      iconPath: Codicon.lightbulb,
      timing: {
        created: this._created,
        lastRequestStarted: void 0,
        lastRequestEnded: void 0
      }
    }];
  }
  async refresh() {
  }
  dismiss() {
    if (this._dismissed) {
      return;
    }
    this.logService.trace("[GrowthSession] Dismissing growth session");
    this._dismissed = true;
    this.storageService.store(GrowthSessionController.STORAGE_KEY, true, -1 /* APPLICATION */, 0 /* USER */);
    this._onDidChangeChatSessionItems.fire({
      removed: [GrowthSessionController.SESSION_URI]
    });
    this._onDidDismiss.fire();
  }
};

GrowthSessionController = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, ILogService)
], GrowthSessionController);

var GrowthSessionOpenerParticipant = class {
  async handleOpenSession(accessor, session, _openOptions) {
    if (session.providerType !== AgentSessionProviders.Growth) {
      return false;
    }
    const commandService = accessor.get(ICommandService);
    const opts = {
      query: "",
      isPartialQuery: true,
      previousRequests: [{
        request: localize(11160, null),
        // allow-any-unicode-next-line
        response: localize(11161, null)
      }]
    };
    await commandService.executeCommand(CHAT_OPEN_ACTION_ID, opts);
    return true;
  }
};

function registerGrowthSession(chatSessionsService, growthController) {
  const disposables = new DisposableStore();
  disposables.add(chatSessionsService.registerChatSessionItemController(AgentSessionProviders.Growth, growthController));
  disposables.add(sessionOpenerRegistry.registerParticipant(new GrowthSessionOpenerParticipant()));
  return disposables;
}

registerAction2(class ResetGrowthSessionAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.resetGrowthSession",
      title: localize2(11162, "Reset Growth Session Notification"),
      category: localize2(11157, "Developer"),
      f1: true
    });
  }
  run(accessor) {
    const storageService = accessor.get(IStorageService);
    storageService.remove(GrowthSessionController.STORAGE_KEY, -1 /* APPLICATION */);
  }
});
export { registerGrowthSession, GrowthSessionController, GrowthSessionOpenerParticipant };
