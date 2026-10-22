// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpTaskManager.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { CancellationError } from "./module-0004.mjs";
import { McpError } from "./module-1206.mjs";
import { MCP } from "./module-1205.mjs";


// src/vs/workbench/contrib/mcp/common/mcpTaskManager.ts
var McpTaskManager = class extends Disposable {
  constructor() {
    super(...arguments);
    this._serverTasks = this._register(new DisposableMap());
    this._clientTasks = this._register(new DisposableMap());
    this._onDidUpdateTask = this._register(new Emitter());
    this.onDidUpdateTask = this._onDidUpdateTask.event;
  }
  /**
   * Attach a new handler to this task manager.
   * Updates all client tasks to use the new handler.
   */
  setHandler(handler) {
    for (const task of this._clientTasks.values()) {
      task.setHandler(handler);
    }
  }
  /**
   * Get a client task by ID for status notification handling.
   */
  getClientTask(taskId) {
    return this._clientTasks.get(taskId);
  }
  /**
   * Track a new client task.
   */
  adoptClientTask(task) {
    this._clientTasks.set(task.id, task);
  }
  /**
   * Untracks a client task.
   */
  abandonClientTask(taskId) {
    this._clientTasks.deleteAndDispose(taskId);
  }
  /**
   * Create a new task and execute it asynchronously.
   * Returns the task immediately while execution continues in the background.
   */
  createTask(ttl, executor) {
    const taskId = generateUuid();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const createdAtTime = Date.now();
    const task = {
      taskId,
      status: "working",
      createdAt,
      ttl,
      lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      pollInterval: 1e3
      // Suggest 1 second polling interval
    };
    const store = new DisposableStore();
    const cts = new CancellationTokenSource();
    store.add(toDisposable(() => cts.dispose(true)));
    const executionPromise = this._executeTask(taskId, executor, cts.token);
    if (ttl) {
      store.add(disposableTimeout(() => this._serverTasks.deleteAndDispose(taskId), ttl));
    } else {
      executionPromise.finally(() => {
        const timeout2 = this._register(disposableTimeout(() => {
          this._serverTasks.deleteAndDispose(taskId);
          this._store.delete(timeout2);
        }, 6e4));
      });
    }
    this._serverTasks.set(taskId, {
      task,
      cts,
      dispose: () => store.dispose(),
      createdAtTime,
      executionPromise
    });
    return { task };
  }
  /**
   * Execute a task asynchronously and update its state.
   */
  async _executeTask(taskId, executor, token) {
    try {
      const result = await executor(token);
      this._updateTaskStatus(taskId, "completed", void 0, result);
    } catch (error) {
      if (error instanceof CancellationError) {
        this._updateTaskStatus(taskId, "cancelled", "Task was cancelled by the client");
      } else if (error instanceof McpError) {
        this._updateTaskStatus(taskId, "failed", error.message, void 0, {
          code: error.code,
          message: error.message,
          data: error.data
        });
      } else if (error instanceof Error) {
        this._updateTaskStatus(taskId, "failed", error.message, void 0, {
          code: MCP.INTERNAL_ERROR,
          message: error.message
        });
      } else {
        this._updateTaskStatus(taskId, "failed", "Unknown error", void 0, {
          code: MCP.INTERNAL_ERROR,
          message: "Unknown error"
        });
      }
    }
  }
  /**
   * Update task status and optionally store result or error.
   */
  _updateTaskStatus(taskId, status2, statusMessage, result, error) {
    const entry = this._serverTasks.get(taskId);
    if (!entry) {
      return;
    }
    entry.task.status = status2;
    entry.task.lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (statusMessage !== void 0) {
      entry.task.statusMessage = statusMessage;
    }
    if (result !== void 0) {
      entry.result = result;
    }
    if (error !== void 0) {
      entry.error = error;
    }
    this._onDidUpdateTask.fire({ ...entry.task });
  }
  /**
   * Get the current state of a task.
   * Returns an error if the task doesn't exist or has expired.
   */
  getTask(taskId) {
    const entry = this._serverTasks.get(taskId);
    if (!entry) {
      throw new McpError(MCP.INVALID_PARAMS, `Task not found: ${taskId}`);
    }
    return { ...entry.task };
  }
  /**
   * Get the result of a completed task.
   * Blocks until the task completes if it's still in progress.
   */
  async getTaskResult(taskId) {
    const entry = this._serverTasks.get(taskId);
    if (!entry) {
      throw new McpError(MCP.INVALID_PARAMS, `Task not found: ${taskId}`);
    }
    if (entry.task.status === "working" || entry.task.status === "input_required") {
      await entry.executionPromise;
    }
    const updatedEntry = this._serverTasks.get(taskId);
    if (!updatedEntry) {
      throw new McpError(MCP.INVALID_PARAMS, `Task not found: ${taskId}`);
    }
    if (updatedEntry.error) {
      throw new McpError(updatedEntry.error.code, updatedEntry.error.message, updatedEntry.error.data);
    }
    if (!updatedEntry.result) {
      throw new McpError(MCP.INTERNAL_ERROR, "Task completed but no result available");
    }
    return updatedEntry.result;
  }
  /**
   * Cancel a task.
   */
  cancelTask(taskId) {
    const entry = this._serverTasks.get(taskId);
    if (!entry) {
      throw new McpError(MCP.INVALID_PARAMS, `Task not found: ${taskId}`);
    }
    if (entry.task.status === "completed" || entry.task.status === "failed" || entry.task.status === "cancelled") {
      throw new McpError(MCP.INVALID_PARAMS, `Cannot cancel task in ${entry.task.status} status`);
    }
    entry.task.status = "cancelled";
    entry.task.statusMessage = "Task was cancelled by the client";
    entry.cts.cancel();
    return { ...entry.task };
  }
  /**
   * List all tasks.
   */
  listTasks() {
    const tasks2 = [];
    for (const entry of this._serverTasks.values()) {
      tasks2.push({ ...entry.task });
    }
    return { tasks: tasks2 };
  }
};
export { McpTaskManager };
