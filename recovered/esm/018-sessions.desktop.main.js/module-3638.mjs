// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/worktreeCreatedTaskDispatcher.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { autorun, registerAutorunSelfDisposable } from "./module-0052.mjs";
import { isAgentHostProviderId } from "./module-1764.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsTasksService } from "./module-3534.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/chat/browser/worktreeCreatedTaskDispatcher.ts
var LOG_PREFIX8 = "[WorktreeCreatedTaskDispatcher]";

var AGENT_HOST_RUN_WORKTREE_CREATED_TASKS_SETTING = "chat.agentHost.runWorktreeCreatedTasks";

var WorktreeCreatedTaskDispatcher = class extends Disposable {
  constructor(_sessionsManagementService, _sessionsTasksService, _configurationService, _logService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsTasksService = _sessionsTasksService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    // Track per-session disposables (one per in-flight session subscription) so
    // we tear them down when the session is removed.
    this._sessionDisposables = this._register(new DisposableMap());
    this._register(this._sessionsManagementService.onDidStartSession((session) => this._trackSession(session)));
    this._register(this._sessionsManagementService.onDidChangeSessions((e4) => this._onDidRemoveSessions(e4.removed)));
  }
  static {
    this.ID = "workbench.contrib.sessions.worktreeCreatedTaskDispatcher";
  }
  _onDidRemoveSessions(removed) {
    for (const session of removed) {
      this._sessionDisposables.deleteAndDispose(session.sessionId);
    }
  }
  _trackSession(session) {
    if (session.capabilities.get().runsWorktreeCreatedTasks) {
      return;
    }
    if (this._sessionDisposables.get(session.sessionId)) {
      return;
    }
    const store = new DisposableStore();
    this._sessionDisposables.set(session.sessionId, store);
    const taskHandles = store.add(new DisposableStore());
    registerAutorunSelfDisposable(store, (reader) => {
      if (session.loading.read(reader)) {
        return;
      }
      if (session.status.read(reader) === 0 /* Untitled */) {
        return;
      }
      if (!session.workspace.read(reader)?.folders.some((folder) => !!folder.gitRepository?.workTreeUri)) {
        return;
      }
      reader.dispose();
      this._dispatchWorktreeCreatedTasks(session, taskHandles);
    });
    store.add(autorun((reader) => {
      if (session.isArchived.read(reader)) {
        taskHandles.clear();
      }
    }));
  }
  async _dispatchWorktreeCreatedTasks(session, taskHandles) {
    if (isAgentHostProviderId(session.providerId) && !this._configurationService.getValue(AGENT_HOST_RUN_WORKTREE_CREATED_TASKS_SETTING)) {
      this._logService.trace(`${LOG_PREFIX8} Skipping worktreeCreated tasks for agent host session '${session.sessionId}' \u2014 '${AGENT_HOST_RUN_WORKTREE_CREATED_TASKS_SETTING}' is disabled.`);
      return;
    }
    let tasks2;
    try {
      tasks2 = await this._sessionsTasksService.getSessionTasksOnce(session);
    } catch (err) {
      this._logService.warn(`${LOG_PREFIX8} Failed to read tasks for session '${session.sessionId}': ${err}`);
      return;
    }
    for (const { task } of tasks2) {
      if (task.runOptions?.runOn !== "worktreeCreated") {
        continue;
      }
      this._logService.trace(`${LOG_PREFIX8} Running worktreeCreated task '${task.label}' for session '${session.sessionId}'`);
      try {
        const handle2 = await this._sessionsTasksService.runTask(task, session);
        if (handle2) {
          if (session.isArchived.get()) {
            handle2.dispose();
          } else {
            taskHandles.add(handle2);
          }
        }
      } catch (err) {
        this._logService.warn(`${LOG_PREFIX8} Failed to run task '${task.label}' for session '${session.sessionId}': ${err}`);
      }
    }
  }
};

WorktreeCreatedTaskDispatcher = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, ISessionsTasksService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ILogService)
], WorktreeCreatedTaskDispatcher);
export { LOG_PREFIX8, AGENT_HOST_RUN_WORKTREE_CREATED_TASKS_SETTING, WorktreeCreatedTaskDispatcher };
