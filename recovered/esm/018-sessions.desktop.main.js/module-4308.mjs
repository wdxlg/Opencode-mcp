// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostPromptCacheNotification.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { readSessionPromptCacheState } from "./module-1008.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatInputNotificationService } from "./module-1460.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostPromptCacheNotification.ts
var PROMPT_CACHE_EXPIRATION_NOTIFICATION_EXPERIMENT = "copilotchat.promptCacheExpirationNotification";

var PROMPT_CACHE_EXPIRATION_DISABLED_STORAGE_KEY = "chat.promptCacheExpirationNotification.disabled";

var DISABLE_PROMPT_CACHE_EXPIRATION_NOTIFICATION_COMMAND = "workbench.action.chat.disablePromptCacheExpirationNotification";

var PROMPT_CACHE_EXPIRATION_LEARN_MORE_URL = "https://code.visualstudio.com/docs/agents/agent-troubleshooting/cache-explorer#_why-prompt-caching-matters";

var AgentHostPromptCacheNotification = class extends Disposable {
  constructor(_notificationService, assignmentService, _storageService, _logService) {
    super();
    this._notificationService = _notificationService;
    this._storageService = _storageService;
    this._logService = _logService;
    this._trackedSessions = this._register(new DisposableMap());
    this._cacheExpirations = new ResourceMap();
    this._dismissedExpirations = new ResourceMap();
    this._experimentEnabled = false;
    this._register(CommandsRegistry.registerCommand(DISABLE_PROMPT_CACHE_EXPIRATION_NOTIFICATION_COMMAND, () => {
      this._storageService.store(PROMPT_CACHE_EXPIRATION_DISABLED_STORAGE_KEY, true, 0 /* PROFILE */, 0 /* USER */);
      for (const sessionResource of this._cacheExpirations.keys()) {
        this._notificationService.deleteNotification(this._notificationId(sessionResource));
      }
    }));
    this._register(this._notificationService.onDidDismiss((id2) => {
      for (const [sessionResource, cacheExpiresAt] of this._cacheExpirations) {
        if (id2 === this._notificationId(sessionResource)) {
          this._dismissedExpirations.set(sessionResource, cacheExpiresAt);
          break;
        }
      }
    }));
    void assignmentService.getTreatment(PROMPT_CACHE_EXPIRATION_NOTIFICATION_EXPERIMENT).then((enabled) => {
      this._experimentEnabled = enabled === true;
      for (const sessionResource of this._cacheExpirations.keys()) {
        this._updateNotification(sessionResource);
      }
    }).catch((error) => this._logService.warn(`[AgentHostPromptCacheNotification] Failed to resolve experiment: ${error}`));
  }
  trackSession(sessionResource, subscription) {
    const key3 = sessionResource.toString();
    const store = new DisposableStore();
    this._trackedSessions.set(key3, store);
    const expirationScheduler = store.add(new RunOnceScheduler(() => this._updateNotification(sessionResource), 0));
    const update = (state) => {
      expirationScheduler.cancel();
      const promptCache = state && !(state instanceof Error) ? readSessionPromptCacheState(state._meta) : void 0;
      if (promptCache) {
        if (this._cacheExpirations.get(sessionResource) !== promptCache.cacheExpiresAt) {
          this._dismissedExpirations.delete(sessionResource);
        }
        this._cacheExpirations.set(sessionResource, promptCache.cacheExpiresAt);
        const expirationTime = Date.parse(promptCache.cacheExpiresAt);
        if (Number.isFinite(expirationTime)) {
          const remainingTime = expirationTime - Date.now();
          if (remainingTime > 0) {
            expirationScheduler.schedule(remainingTime);
          }
        }
      } else {
        this._cacheExpirations.delete(sessionResource);
        this._dismissedExpirations.delete(sessionResource);
      }
      this._updateNotification(sessionResource);
    };
    store.add(subscription.onDidChange(update));
    update(subscription.value);
    store.add(toDisposable(() => {
      this._cacheExpirations.delete(sessionResource);
      this._dismissedExpirations.delete(sessionResource);
      this._notificationService.deleteNotification(this._notificationId(sessionResource));
    }));
    return toDisposable(() => this._trackedSessions.deleteAndDispose(key3));
  }
  _updateNotification(sessionResource) {
    const cacheExpiresAt = this._cacheExpirations.get(sessionResource);
    const expirationTime = cacheExpiresAt ? Date.parse(cacheExpiresAt) : Number.NaN;
    const disabled = this._storageService.getBoolean(PROMPT_CACHE_EXPIRATION_DISABLED_STORAGE_KEY, 0 /* PROFILE */, false);
    if (!this._experimentEnabled || disabled || !Number.isFinite(expirationTime) || Date.now() < expirationTime) {
      this._notificationService.deleteNotification(this._notificationId(sessionResource));
      return;
    }
    if (this._dismissedExpirations.get(sessionResource) === cacheExpiresAt) {
      return;
    }
    this._notificationService.setNotification({
      id: this._notificationId(sessionResource),
      telemetryId: "copilot.promptCacheExpired",
      severity: 0 /* Info */,
      message: localize(8982, null),
      description: new MarkdownString(localize(8979, null, PROMPT_CACHE_EXPIRATION_LEARN_MORE_URL)),
      actions: [
        {
          kind: "command" /* Command */,
          label: localize(8981, null),
          commandId: "workbench.action.chat.newChat"
        }
      ],
      dismissible: true,
      autoDismissOnMessage: true,
      mute: {
        commandId: DISABLE_PROMPT_CACHE_EXPIRATION_NOTIFICATION_COMMAND,
        tooltip: localize(8980, null)
      },
      sessionResources: [sessionResource]
    });
  }
  _notificationId(sessionResource) {
    return `copilot.promptCacheExpired.${sessionResource.toString()}`;
  }
};

AgentHostPromptCacheNotification = __decorateClass([
  __decorateParam(0, IChatInputNotificationService),
  __decorateParam(1, IWorkbenchAssignmentService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ILogService)
], AgentHostPromptCacheNotification);
export { PROMPT_CACHE_EXPIRATION_NOTIFICATION_EXPERIMENT, PROMPT_CACHE_EXPIRATION_DISABLED_STORAGE_KEY, DISABLE_PROMPT_CACHE_EXPIRATION_NOTIFICATION_COMMAND, PROMPT_CACHE_EXPIRATION_LEARN_MORE_URL, AgentHostPromptCacheNotification };
