// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTodoListWidget.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, append, isAncestorOfActiveElement, trackFocus } from "./module-0075.mjs";
import { IconLabel } from "./module-0640.mjs";
import { localize } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { setChatInputStackSlot } from "./module-2033.mjs";
import { Button } from "./module-0546.mjs";
import { Codicon } from "./module-0085.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatTodoListService } from "./module-1480.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTodoListWidget.ts
var TodoListDelegate = class {
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return TodoListRenderer.TEMPLATE_ID;
  }
};

var TodoListRenderer = class _TodoListRenderer {
  constructor() {
    this.templateId = _TodoListRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "todoListRenderer";
  }
  renderTemplate(container2) {
    const templateDisposables = new DisposableStore();
    const todoElement = append(container2, $("li.todo-item"));
    todoElement.setAttribute("role", "listitem");
    const statusIcon = append(todoElement, $(".todo-status-icon.codicon"));
    statusIcon.setAttribute("aria-hidden", "true");
    const todoContent = append(todoElement, $(".todo-content"));
    const iconLabel = templateDisposables.add(new IconLabel(todoContent, { supportIcons: false }));
    return { templateDisposables, todoElement, statusIcon, iconLabel };
  }
  renderElement(todo, index2, templateData) {
    const { todoElement, statusIcon, iconLabel } = templateData;
    statusIcon.className = `todo-status-icon codicon ${this.getStatusIconClass(todo.status)}`;
    statusIcon.style.color = this.getStatusIconColor(todo.status);
    iconLabel.setLabel(todo.title);
    const statusText = this.getStatusText(todo.status);
    const ariaLabel = localize(12167, null, todo.title, statusText);
    todoElement.setAttribute("aria-label", ariaLabel);
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  getStatusText(status2) {
    switch (status2) {
      case "completed":
        return localize(12168, null);
      case "in-progress":
        return localize(12169, null);
      case "not-started":
      default:
        return localize(12170, null);
    }
  }
  getStatusIconClass(status2) {
    switch (status2) {
      case "completed":
        return "codicon-pass";
      case "in-progress":
        return "codicon-record";
      case "not-started":
      default:
        return "codicon-circle-outline";
    }
  }
  getStatusIconColor(status2) {
    switch (status2) {
      case "completed":
        return "var(--vscode-charts-green)";
      case "in-progress":
        return "var(--vscode-charts-blue)";
      case "not-started":
      default:
        return "var(--vscode-foreground)";
    }
  }
};

var ChatTodoListWidget = class extends Disposable {
  constructor(chatTodoListService, instantiationService, contextKeyService, telemetryService) {
    super();
    this.chatTodoListService = chatTodoListService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.telemetryService = telemetryService;
    this._visible = false;
    this._isExpanded = false;
    this._userManuallyExpanded = false;
    this._inChatTodoListContextKey = ChatContextKeys.inChatTodoList.bindTo(contextKeyService);
    this.domNode = this.createChatTodoWidget();
    const focusTracker = this._register(trackFocus(this.domNode));
    this._register(focusTracker.onDidFocus(() => this._inChatTodoListContextKey.set(true)));
    this._register(focusTracker.onDidBlur(() => this._inChatTodoListContextKey.set(false)));
    this._register(this.contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(/* @__PURE__ */ new Set([ChatContextKeys.requestInProgress.key]))) {
        this.updateClearButtonState();
      }
    }));
  }
  get height() {
    return this.domNode.style.display === "none" ? 0 : this.domNode.offsetHeight;
  }
  hideWidget() {
    this.setVisible(false);
  }
  /** Add the list to its slot in the chat input stack. */
  attachTo(slot) {
    this._slot = slot;
    slot.appendChild(this.domNode);
    setChatInputStackSlot(slot, this._visible ? 1 /* Docked */ : 0 /* Empty */);
  }
  /** Show or hide the list, and report the same to the stack. */
  setVisible(visible) {
    this._visible = visible;
    this.domNode.style.display = visible ? "block" : "none";
    setChatInputStackSlot(this._slot, visible ? 1 /* Docked */ : 0 /* Empty */);
  }
  createChatTodoWidget() {
    const container2 = $(".chat-todo-list-widget");
    container2.style.display = "none";
    const expandoContainer = $(".todo-list-expand");
    this.expandoButton = this._register(new Button(expandoContainer, {
      supportIcons: true
    }));
    this.expandoButton.element.setAttribute("aria-expanded", String(this._isExpanded));
    this.expandoButton.element.setAttribute("aria-controls", "todo-list-container");
    const titleSection = $(".todo-list-title-section");
    this.expandIcon = $(".expand-icon.codicon");
    this.expandIcon.classList.add(this._isExpanded ? "codicon-chevron-down" : "codicon-chevron-right");
    this.expandIcon.setAttribute("aria-hidden", "true");
    this.titleElement = $(".todo-list-title");
    this.titleElement.id = "todo-list-title";
    this.titleElement.textContent = localize(12171, null);
    this.clearButtonContainer = $(".todo-clear-button-container");
    this.createClearButton();
    titleSection.appendChild(this.expandIcon);
    titleSection.appendChild(this.titleElement);
    this.expandoButton.element.appendChild(titleSection);
    this.expandoButton.element.appendChild(this.clearButtonContainer);
    this.todoListContainer = $(".todo-list-container");
    this.todoListContainer.style.display = this._isExpanded ? "block" : "none";
    this.todoListContainer.id = "todo-list-container";
    this.todoListContainer.setAttribute("role", "list");
    this.todoListContainer.setAttribute("aria-labelledby", "todo-list-title");
    container2.appendChild(expandoContainer);
    container2.appendChild(this.todoListContainer);
    this._register(this.expandoButton.onDidClick(() => {
      this.toggleExpanded();
    }));
    return container2;
  }
  createClearButton() {
    this.clearButton = new Button(this.clearButtonContainer, {
      supportIcons: true,
      ariaLabel: localize(12162, null)
    });
    this.clearButton.element.tabIndex = 0;
    this.clearButton.icon = Codicon.clearAll;
    this._register(this.clearButton);
    this._register(this.clearButton.onDidClick(() => {
      const todoCount = this._currentSessionResource ? this.chatTodoListService.getTodos(this._currentSessionResource).length : 0;
      this.telemetryService.publicLog2(
        "chatTodoListWidget",
        {
          action: "clear",
          todoCount
        }
      );
      this.clearAllTodos();
    }));
  }
  render(sessionResource) {
    if (!sessionResource) {
      this.hideWidget();
      return;
    }
    if (!isEqual2(this._currentSessionResource, sessionResource)) {
      this._userManuallyExpanded = false;
      this._currentSessionResource = sessionResource;
      this.hideWidget();
    }
    this.updateTodoDisplay();
  }
  clear(sessionResource, force = false) {
    if (!sessionResource || this.domNode.style.display === "none") {
      return;
    }
    const currentTodos = this.chatTodoListService.getTodos(sessionResource);
    const shouldClear = force || currentTodos.length > 0 && !currentTodos.some((todo) => todo.status !== "completed");
    if (shouldClear) {
      this.clearAllTodos();
    }
  }
  hasTodos() {
    return this.domNode.classList.contains("has-todos") && !!this._todoList && this._todoList.length > 0;
  }
  hasFocus() {
    return isAncestorOfActiveElement(this.todoListContainer);
  }
  focus() {
    if (!this.hasTodos()) {
      return false;
    }
    if (!this._isExpanded) {
      this.toggleExpanded();
    }
    this._todoList?.domFocus();
    return this.hasFocus();
  }
  updateTodoDisplay() {
    if (!this._currentSessionResource) {
      return;
    }
    const todoList = this.chatTodoListService.getTodos(this._currentSessionResource);
    const shouldShow = todoList.length > 0;
    if (!shouldShow) {
      this.domNode.classList.remove("has-todos");
      this.hideWidget();
      return;
    }
    this.domNode.classList.add("has-todos");
    this.renderTodoList(todoList);
    this.setVisible(true);
  }
  renderTodoList(todoList) {
    this.updateTitleElement(this.titleElement, todoList);
    const allIncomplete = todoList.every((todo) => todo.status === "not-started");
    if (allIncomplete) {
      this._userManuallyExpanded = false;
    }
    if (!this._todoList) {
      this._todoList = this._register(this.instantiationService.createInstance(
        WorkbenchList,
        "ChatTodoListRenderer",
        this.todoListContainer,
        new TodoListDelegate(),
        [new TodoListRenderer()],
        {
          alwaysConsumeMouseWheel: false,
          accessibilityProvider: {
            getAriaLabel: (todo) => {
              const statusText = this.getStatusText(todo.status);
              return localize(12167, null, todo.title, statusText);
            },
            getWidgetAriaLabel: () => localize(12173, null)
          }
        }
      ));
    }
    const maxItemsShown = 6;
    const itemsShown = Math.min(todoList.length, maxItemsShown);
    const height = itemsShown * 22;
    this._todoList.layout(height);
    this._todoList.getHTMLElement().style.height = `${height}px`;
    this._todoList.splice(0, this._todoList.length, todoList);
    const hasInProgressTask = todoList.some((todo) => todo.status === "in-progress");
    const hasCompletedTask = todoList.some((todo) => todo.status === "completed");
    this.updateClearButtonState();
    if ((hasInProgressTask || hasCompletedTask) && this._isExpanded && !this._userManuallyExpanded) {
      this._isExpanded = false;
      this.expandoButton.element.setAttribute("aria-expanded", "false");
      this.todoListContainer.style.display = "none";
      this.expandIcon.classList.remove("codicon-chevron-down");
      this.expandIcon.classList.add("codicon-chevron-right");
      this.updateTitleElement(this.titleElement, todoList);
    }
  }
  toggleExpanded() {
    this._isExpanded = !this._isExpanded;
    this._userManuallyExpanded = true;
    this.expandIcon.classList.toggle("codicon-chevron-down", this._isExpanded);
    this.expandIcon.classList.toggle("codicon-chevron-right", !this._isExpanded);
    this.todoListContainer.style.display = this._isExpanded ? "block" : "none";
    const todoCount = this._currentSessionResource ? this.chatTodoListService.getTodos(this._currentSessionResource).length : 0;
    this.telemetryService.publicLog2(
      "chatTodoListWidget",
      {
        action: this._isExpanded ? "expand" : "collapse",
        todoCount
      }
    );
    if (this._currentSessionResource) {
      const todoList = this.chatTodoListService.getTodos(this._currentSessionResource);
      this.updateTitleElement(this.titleElement, todoList);
    }
  }
  clearAllTodos() {
    if (!this._currentSessionResource) {
      return;
    }
    this.chatTodoListService.setTodos(this._currentSessionResource, []);
    this.hideWidget();
  }
  updateClearButtonState() {
    if (!this._currentSessionResource) {
      return;
    }
    const todoList = this.chatTodoListService.getTodos(this._currentSessionResource);
    const hasInProgressTask = todoList.some((todo) => todo.status === "in-progress");
    const isRequestInProgress = ChatContextKeys.requestInProgress.getValue(this.contextKeyService) ?? false;
    const shouldDisable = isRequestInProgress && hasInProgressTask;
    this.clearButton.enabled = !shouldDisable;
    if (shouldDisable) {
      this.clearButton.setTitle(localize(12163, null));
    } else {
      this.clearButton.setTitle(localize(12162, null));
    }
  }
  updateTitleElement(titleElement, todoList) {
    titleElement.textContent = "";
    const completedCount = todoList.filter((todo) => todo.status === "completed").length;
    const totalCount = todoList.length;
    const inProgressTodos = todoList.filter((todo) => todo.status === "in-progress");
    const firstInProgressTodo = inProgressTodos.length > 0 ? inProgressTodos[0] : void 0;
    const notStartedTodos = todoList.filter((todo) => todo.status === "not-started");
    const firstNotStartedTodo = notStartedTodos.length > 0 ? notStartedTodos[0] : void 0;
    const currentTaskNumber = inProgressTodos.length > 0 ? completedCount + 1 : Math.max(1, completedCount);
    const expandButtonLabel = this._isExpanded ? localize(12164, null) : localize(12166, null);
    this.expandoButton.element.setAttribute("aria-label", expandButtonLabel);
    this.expandoButton.element.setAttribute("aria-expanded", this._isExpanded ? "true" : "false");
    if (this._isExpanded) {
      const titleText = $("span");
      titleText.textContent = totalCount > 0 ? localize(12172, null, currentTaskNumber, totalCount) : localize(12171, null);
      titleElement.appendChild(titleText);
    } else {
      const todoToShow = firstInProgressTodo || firstNotStartedTodo;
      if (todoToShow) {
        const icon2 = $(".codicon");
        if (todoToShow === firstInProgressTodo) {
          icon2.classList.add("codicon-record");
          icon2.style.color = "var(--vscode-charts-blue)";
        } else {
          icon2.classList.add("codicon-circle-outline");
          icon2.style.color = "var(--vscode-foreground)";
        }
        icon2.style.marginRight = "4px";
        icon2.style.verticalAlign = "middle";
        titleElement.appendChild(icon2);
        const todoText = $("span");
        todoText.textContent = localize(12165, null, todoToShow.title, currentTaskNumber, totalCount);
        todoText.style.verticalAlign = "middle";
        todoText.style.overflow = "hidden";
        todoText.style.textOverflow = "ellipsis";
        todoText.style.whiteSpace = "nowrap";
        todoText.style.minWidth = "0";
        titleElement.appendChild(todoText);
      } else if (completedCount > 0 && completedCount === totalCount) {
        const doneText = $("span");
        doneText.textContent = localize(12172, null, totalCount, totalCount);
        doneText.style.verticalAlign = "middle";
        titleElement.appendChild(doneText);
      }
    }
  }
  getStatusText(status2) {
    switch (status2) {
      case "completed":
        return localize(12168, null);
      case "in-progress":
        return localize(12169, null);
      case "not-started":
      default:
        return localize(12170, null);
    }
  }
};

ChatTodoListWidget = __decorateClass([
  __decorateParam(0, IChatTodoListService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ITelemetryService)
], ChatTodoListWidget);
export { TodoListDelegate, TodoListRenderer, ChatTodoListWidget };
