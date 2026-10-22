// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/chatTodoListService.ts
import { createDecorator } from "./module-0077.mjs";
import { Memento } from "./module-1041.mjs";
import { chatSessionResourceToId } from "./module-0961.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/chat/common/tools/chatTodoListService.ts
var IChatTodoListService = createDecorator("chatTodoListService");

var ChatTodoListStorage = class {
  constructor(storageService) {
    this.memento = new Memento("chat-todo-list", storageService);
  }
  getSessionData(sessionResource) {
    const storage = this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    return storage[this.toKey(sessionResource)] || [];
  }
  setSessionData(sessionResource, todoList) {
    const storage = this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    storage[this.toKey(sessionResource)] = todoList;
    this.memento.saveMemento();
  }
  getTodoList(sessionResource) {
    return this.getSessionData(sessionResource);
  }
  setTodoList(sessionResource, todoList) {
    this.setSessionData(sessionResource, todoList);
  }
  migrateTodoList(oldSessionResource, newSessionResource) {
    const todos = this.getSessionData(oldSessionResource);
    if (todos.length > 0) {
      this.setSessionData(newSessionResource, todos);
      const storage = this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
      delete storage[this.toKey(oldSessionResource)];
      this.memento.saveMemento();
    }
  }
  toKey(sessionResource) {
    return chatSessionResourceToId(sessionResource);
  }
};

ChatTodoListStorage = __decorateClass([
  __decorateParam(0, IStorageService)
], ChatTodoListStorage);

var ChatTodoListService = class extends Disposable {
  constructor(storageService) {
    super();
    this._onDidUpdateTodos = this._register(new Emitter());
    this.onDidUpdateTodos = this._onDidUpdateTodos.event;
    this.todoListStorage = new ChatTodoListStorage(storageService);
  }
  getTodos(sessionResource) {
    return this.todoListStorage.getTodoList(sessionResource);
  }
  setTodos(sessionResource, todos) {
    this.todoListStorage.setTodoList(sessionResource, todos);
    this._onDidUpdateTodos.fire(sessionResource);
  }
  migrateTodos(oldSessionResource, newSessionResource) {
    this.todoListStorage.migrateTodoList(oldSessionResource, newSessionResource);
    this._onDidUpdateTodos.fire(newSessionResource);
  }
};

ChatTodoListService = __decorateClass([
  __decorateParam(0, IStorageService)
], ChatTodoListService);
export { IChatTodoListService, ChatTodoListStorage, ChatTodoListService };
