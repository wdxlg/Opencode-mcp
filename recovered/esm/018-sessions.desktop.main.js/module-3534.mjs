// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionsTasksService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { dirname2, isEqual2, joinPath } from "./module-0034.mjs";
import { transaction } from "./module-0045.mjs";
import { parse12 } from "./module-2175.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IJSONEditingService } from "./module-1584.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { ISessionTaskRunnerRegistry } from "./module-3533.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/chat/browser/sessionsTasksService.ts
var ISessionsTasksService = createDecorator("sessionsTasksService");

var SessionsTasksService = class extends Disposable {
  constructor(_fileService, _jsonEditingService, _preferencesService, _taskRunnerRegistry, _storageService) {
    super();
    this._fileService = _fileService;
    this._jsonEditingService = _jsonEditingService;
    this._preferencesService = _preferencesService;
    this._taskRunnerRegistry = _taskRunnerRegistry;
    this._storageService = _storageService;
    this._onDidRunTask = this._register(new Emitter());
    this.onDidRunTask = this._onDidRunTask.event;
    this._sessionTasks = observableValue(this, []);
    this._fileWatcher = this._register(new MutableDisposable());
    this._pinnedTaskObservables = /* @__PURE__ */ new Map();
    this._browserUrlObservables = /* @__PURE__ */ new Map();
    this._pinnedBrowserObservables = /* @__PURE__ */ new Map();
    this._pinnedTaskLabels = this._loadPinnedTaskLabels();
    this._browserUrls = this._loadBrowserUrls();
    this._pinnedBrowsers = this._loadPinnedBrowsers();
  }
  static {
    this._PINNED_TASK_LABELS_KEY = "agentSessions.pinnedTaskLabels";
  }
  static {
    this._BROWSER_URLS_KEY = "agentSessions.browserUrls";
  }
  static {
    this._PINNED_BROWSERS_KEY = "agentSessions.pinnedBrowsers";
  }
  getSessionTasks(session) {
    const folder = this._getSessionFolder(session);
    this._ensureFileWatch(folder);
    if (!isEqual2(this._lastRefreshedFolder, folder)) {
      this._lastRefreshedFolder = folder;
      this._refreshSessionTasks(folder);
    }
    return this._sessionTasks;
  }
  async getSessionTasksOnce(session) {
    return this._readTasksFromBothTargets(session, (t2) => !!t2.inAgents);
  }
  async getAllTasks(session) {
    return this._readTasksFromBothTargets(session, () => true);
  }
  async getNonSessionTasks(session) {
    return this._readTasksFromBothTargets(session, (t2) => !t2.inAgents);
  }
  /**
   * Reads tasks from both workspace and user `tasks.json` for a session,
   * filtering each entry through `predicate` (in addition to the supported-type
   * check) and tagging it with its storage target.
   */
  async _readTasksFromBothTargets(session, predicate) {
    const result = [];
    const targets = ["workspace", "user"];
    for (const target of targets) {
      const uri4 = this._getTasksJsonUri(session, target);
      if (!uri4) {
        continue;
      }
      const json = await this._readTasksJson(uri4);
      for (const task of json.tasks ?? []) {
        if (predicate(task) && this._isSupportedTask(task)) {
          result.push({ task, target });
        }
      }
    }
    return result;
  }
  async addTaskToSessions(task, session, target, options3) {
    const tasksJsonUri = this._getTasksJsonUri(session, target);
    if (!tasksJsonUri) {
      return;
    }
    const tasksJson = await this._readTasksJson(tasksJsonUri);
    const tasks2 = tasksJson.tasks ?? [];
    const index2 = tasks2.findIndex((t2) => t2.label === task.label);
    if (index2 === -1) {
      return;
    }
    const edits = [
      { path: ["tasks", index2, "inAgents"], value: true }
    ];
    if (options3) {
      edits.push({
        path: ["tasks", index2, "runOptions"],
        value: options3.runOn && options3.runOn !== "default" ? { runOn: options3.runOn } : void 0
      });
    }
    await this._jsonEditingService.write(tasksJsonUri, edits, true);
  }
  async createAndAddTask(label3, command4, session, target, options3) {
    const tasksJsonUri = this._getTasksJsonUri(session, target);
    if (!tasksJsonUri) {
      return void 0;
    }
    const tasksJson = await this._readTasksJson(tasksJsonUri);
    const tasks2 = tasksJson.tasks ?? [];
    const resolvedLabel = label3?.trim() || command4;
    const newTask = {
      label: resolvedLabel,
      type: "shell",
      command: command4,
      inAgents: true,
      ...options3?.runOn && options3.runOn !== "default" ? { runOptions: { runOn: options3.runOn } } : {}
    };
    await this._jsonEditingService.write(tasksJsonUri, [
      { path: ["version"], value: tasksJson.version ?? "2.0.0" },
      { path: ["tasks"], value: [...tasks2, newTask] }
    ], true);
    return newTask;
  }
  async updateTask(originalTaskLabel, updatedTask, session, currentTarget, newTarget) {
    const currentTasksJsonUri = this._getTasksJsonUri(session, currentTarget);
    const newTasksJsonUri = this._getTasksJsonUri(session, newTarget);
    if (!currentTasksJsonUri || !newTasksJsonUri) {
      return;
    }
    const currentTasksJson = await this._readTasksJson(currentTasksJsonUri);
    const currentTasks = currentTasksJson.tasks ?? [];
    const currentIndex = currentTasks.findIndex((task) => task.label === originalTaskLabel);
    if (currentIndex === -1) {
      return;
    }
    if (currentTasksJsonUri.toString() === newTasksJsonUri.toString()) {
      const updatedTasks = currentTasks.map((task, i2) => i2 === currentIndex ? updatedTask : task);
      await this._jsonEditingService.write(currentTasksJsonUri, [
        { path: ["tasks"], value: updatedTasks }
      ], true);
    } else {
      const newTasksJson = await this._readTasksJson(newTasksJsonUri);
      const newTasks = newTasksJson.tasks ?? [];
      await this._jsonEditingService.write(currentTasksJsonUri, [
        { path: ["tasks"], value: currentTasks.filter((_, taskIndex) => taskIndex !== currentIndex) }
      ], true);
      await this._jsonEditingService.write(newTasksJsonUri, [
        { path: ["version"], value: newTasksJson.version ?? "2.0.0" },
        { path: ["tasks"], value: [...newTasks, updatedTask] }
      ], true);
    }
    const repoUri = this._getSessionRepo(session)?.root;
    if (repoUri) {
      const key3 = repoUri.toString();
      if (this._pinnedTaskLabels.get(key3) === originalTaskLabel) {
        this._setPinnedTaskLabelForKey(key3, updatedTask.label);
      }
    }
  }
  async removeTask(taskLabel, session, target) {
    const tasksJsonUri = this._getTasksJsonUri(session, target);
    if (!tasksJsonUri) {
      return;
    }
    const tasksJson = await this._readTasksJson(tasksJsonUri);
    const tasks2 = tasksJson.tasks ?? [];
    const index2 = tasks2.findIndex((t2) => t2.label === taskLabel);
    if (index2 === -1) {
      return;
    }
    await this._jsonEditingService.write(tasksJsonUri, [
      { path: ["tasks"], value: tasks2.filter((_, taskIndex) => taskIndex !== index2) }
    ], true);
    const repoUri = this._getSessionRepo(session)?.root;
    if (repoUri) {
      const key3 = repoUri.toString();
      if (this._pinnedTaskLabels.get(key3) === taskLabel) {
        this._setPinnedTaskLabelForKey(key3, void 0);
      }
    }
  }
  async runTask(task, session) {
    const runner = this._taskRunnerRegistry.getRunner(session);
    if (!runner) {
      return void 0;
    }
    const handle2 = await runner.runTask(task, session);
    this._onDidRunTask.fire({ task, session });
    return handle2;
  }
  getPinnedTaskLabel(repository) {
    if (!repository) {
      return observableValue("pinnedTaskLabel", void 0);
    }
    const key3 = repository.toString();
    let obs = this._pinnedTaskObservables.get(key3);
    if (!obs) {
      obs = observableValue("pinnedTaskLabel", this._pinnedTaskLabels.get(key3));
      this._pinnedTaskObservables.set(key3, obs);
    }
    return obs;
  }
  setPinnedTaskLabel(repository, taskLabel) {
    if (!repository) {
      return;
    }
    const key3 = repository.toString();
    this._setPinnedTaskLabelForKey(key3, taskLabel);
    if (taskLabel !== void 0) {
      this._setPinnedBrowserForKey(key3, false);
    }
  }
  getBrowserUrl(repository) {
    if (!repository) {
      return observableValue("browserUrl", void 0);
    }
    const key3 = repository.toString();
    let obs = this._browserUrlObservables.get(key3);
    if (!obs) {
      obs = observableValue("browserUrl", this._browserUrls.get(key3));
      this._browserUrlObservables.set(key3, obs);
    }
    return obs;
  }
  setBrowserUrl(repository, url) {
    if (!repository) {
      return;
    }
    const key3 = repository.toString();
    const trimmed = url?.trim();
    if (!trimmed) {
      this._browserUrls.delete(key3);
    } else {
      this._browserUrls.set(key3, trimmed);
    }
    this._saveBrowserUrls();
    const obs = this._browserUrlObservables.get(key3);
    if (obs) {
      transaction((tx) => obs.set(trimmed || void 0, tx));
    }
  }
  getPinnedBrowser(repository) {
    if (!repository) {
      return observableValue("pinnedBrowser", false);
    }
    const key3 = repository.toString();
    let obs = this._pinnedBrowserObservables.get(key3);
    if (!obs) {
      obs = observableValue("pinnedBrowser", this._pinnedBrowsers.has(key3));
      this._pinnedBrowserObservables.set(key3, obs);
    }
    return obs;
  }
  setPinnedBrowser(repository, pinned) {
    if (!repository) {
      return;
    }
    const key3 = repository.toString();
    this._setPinnedBrowserForKey(key3, pinned);
    if (pinned) {
      this._setPinnedTaskLabelForKey(key3, void 0);
    }
  }
  // --- private helpers ---
  _getSessionRepo(session) {
    return session.workspace.get()?.folders[0];
  }
  _getSessionFolder(session) {
    const repo = this._getSessionRepo(session);
    return repo?.workingDirectory ?? repo?.root;
  }
  _getTasksJsonUri(session, target) {
    if (target === "workspace") {
      return this._getWorkspaceTasksJsonUri(this._getSessionFolder(session));
    }
    return this._getUserTasksJsonUri();
  }
  _getWorkspaceTasksJsonUri(folder) {
    return folder?.path ? joinPath(folder, ".vscode", "tasks.json") : void 0;
  }
  _getUserTasksJsonUri() {
    const userSettingsResource = this._preferencesService.userSettingsResource;
    if (!userSettingsResource.path) {
      return void 0;
    }
    const userSettingsFolder = dirname2(userSettingsResource);
    return userSettingsFolder.path ? joinPath(userSettingsFolder, "tasks.json") : void 0;
  }
  async _readTasksJson(uri4) {
    try {
      const content = await this._fileService.readFile(uri4);
      return parse12(content.value.toString());
    } catch {
      return {};
    }
  }
  _isSupportedTask(task) {
    return !!task.label;
  }
  _ensureFileWatch(folder) {
    const tasksUri = this._getWorkspaceTasksJsonUri(folder);
    if (!tasksUri) {
      this._watchedResource = void 0;
      this._fileWatcher.clear();
      return;
    }
    if (this._watchedResource && this._watchedResource.toString() === tasksUri.toString()) {
      return;
    }
    this._watchedResource = tasksUri;
    const disposables = new DisposableStore();
    disposables.add(this._fileService.watch(tasksUri));
    const userUri = this._getUserTasksJsonUri();
    if (userUri) {
      disposables.add(this._fileService.watch(userUri));
    }
    disposables.add(this._fileService.onDidFilesChange((e4) => {
      if (e4.affects(tasksUri) || userUri && e4.affects(userUri)) {
        this._refreshSessionTasks(folder);
      }
    }));
    this._fileWatcher.value = disposables;
  }
  async _refreshSessionTasks(folder) {
    if (!folder) {
      transaction((tx) => this._sessionTasks.set([], tx));
      return;
    }
    const tasksUri = this._getWorkspaceTasksJsonUri(folder);
    const tasksJson = tasksUri ? await this._readTasksJson(tasksUri) : {};
    const sessionTasks = (tasksJson.tasks ?? []).filter((t2) => t2.inAgents && this._isSupportedTask(t2)).map((t2) => ({ task: t2, target: "workspace" }));
    const userUri = this._getUserTasksJsonUri();
    const userJson = userUri ? await this._readTasksJson(userUri) : {};
    const userSessionTasks = (userJson.tasks ?? []).filter((t2) => t2.inAgents && this._isSupportedTask(t2)).map((t2) => ({ task: t2, target: "user" }));
    transaction((tx) => this._sessionTasks.set([...sessionTasks, ...userSessionTasks], tx));
  }
  _loadPinnedTaskLabels() {
    const raw = this._storageService.get(SessionsTasksService._PINNED_TASK_LABELS_KEY, -1 /* APPLICATION */);
    if (raw) {
      try {
        return new Map(Object.entries(JSON.parse(raw)));
      } catch {
      }
    }
    return /* @__PURE__ */ new Map();
  }
  _savePinnedTaskLabels() {
    this._storageService.store(
      SessionsTasksService._PINNED_TASK_LABELS_KEY,
      JSON.stringify(Object.fromEntries(this._pinnedTaskLabels)),
      -1 /* APPLICATION */,
      0 /* USER */
    );
  }
  _setPinnedTaskLabelForKey(key3, taskLabel) {
    if (taskLabel === void 0) {
      this._pinnedTaskLabels.delete(key3);
    } else {
      this._pinnedTaskLabels.set(key3, taskLabel);
    }
    this._savePinnedTaskLabels();
    const obs = this._pinnedTaskObservables.get(key3);
    if (obs) {
      transaction((tx) => obs.set(taskLabel, tx));
    }
  }
  _loadBrowserUrls() {
    const raw = this._storageService.get(SessionsTasksService._BROWSER_URLS_KEY, -1 /* APPLICATION */);
    if (raw) {
      try {
        return new Map(Object.entries(JSON.parse(raw)));
      } catch {
      }
    }
    return /* @__PURE__ */ new Map();
  }
  _saveBrowserUrls() {
    this._storageService.store(
      SessionsTasksService._BROWSER_URLS_KEY,
      JSON.stringify(Object.fromEntries(this._browserUrls)),
      -1 /* APPLICATION */,
      0 /* USER */
    );
  }
  _loadPinnedBrowsers() {
    const raw = this._storageService.get(SessionsTasksService._PINNED_BROWSERS_KEY, -1 /* APPLICATION */);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr);
        }
      } catch {
      }
    }
    return /* @__PURE__ */ new Set();
  }
  _savePinnedBrowsers() {
    this._storageService.store(
      SessionsTasksService._PINNED_BROWSERS_KEY,
      JSON.stringify([...this._pinnedBrowsers]),
      -1 /* APPLICATION */,
      0 /* USER */
    );
  }
  _setPinnedBrowserForKey(key3, pinned) {
    if (pinned) {
      this._pinnedBrowsers.add(key3);
    } else {
      this._pinnedBrowsers.delete(key3);
    }
    this._savePinnedBrowsers();
    const obs = this._pinnedBrowserObservables.get(key3);
    if (obs) {
      transaction((tx) => obs.set(pinned, tx));
    }
  }
};

SessionsTasksService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IJSONEditingService),
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, ISessionTaskRunnerRegistry),
  __decorateParam(4, IStorageService)
], SessionsTasksService);
export { ISessionsTasksService, SessionsTasksService };
