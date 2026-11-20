// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/localAgentSessionsController.ts
import { Disposable, DisposableResourceMap } from "./module-0012.mjs";
import { IChatSessionsService, localChatSessionType } from "./module-0960.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { chatModelToChatDetail } from "./module-2506.mjs";
import { coalesce } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService, convertLegacyChatSessionTiming } from "./module-0972.mjs";
import { Codicon } from "./module-0085.mjs";
import { getInProgressSessionDescription } from "./module-1465.mjs";
import { chatResponseStateToSessionStatus, getSessionStatusForModel } from "./module-1478.mjs";
import { Schemas } from "./module-0033.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { equals4 } from "./module-0098.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/localAgentSessionsController.ts
var LocalAgentsSessionsController = class extends Disposable {
  constructor(chatService, chatSessionsService) {
    super();
    this.chatService = chatService;
    this.chatSessionsService = chatSessionsService;
    this.chatSessionType = localChatSessionType;
    this._onDidChangeChatSessionItems = this._register(new Emitter());
    this.onDidChangeChatSessionItems = this._onDidChangeChatSessionItems.event;
    this._modelListeners = this._register(new DisposableResourceMap());
    this._isDisposed = false;
    this._items = new ResourceMap();
    this._register(this.chatSessionsService.registerChatSessionItemController(this.chatSessionType, this));
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.localAgentsSessionsController";
  }
  dispose() {
    this._isDisposed = true;
    super.dispose();
  }
  get items() {
    return Array.from(this._items.values());
  }
  async refresh(token) {
    const newItems = await this.provideChatSessionItems(token);
    const newResources = new ResourceSet(newItems.map((i2) => i2.resource));
    const addedOrUpdated = [];
    const removed = [];
    for (const item of newItems) {
      if (!this._items.has(item.resource)) {
        addedOrUpdated.push(item);
      }
    }
    for (const resource of this._items.keys()) {
      if (!newResources.has(resource)) {
        removed.push(resource);
      }
    }
    this._items.clear();
    for (const item of newItems) {
      this._items.set(item.resource, item);
    }
    if (addedOrUpdated.length > 0 || removed.length > 0) {
      this._onDidChangeChatSessionItems.fire({
        ...addedOrUpdated.length > 0 ? { addedOrUpdated } : void 0,
        ...removed.length > 0 ? { removed } : void 0
      });
    }
  }
  registerListeners() {
    const addModelListeners = async (model) => {
      if (getChatSessionType(model.sessionResource) !== this.chatSessionType) {
        return;
      }
      await this.refresh(CancellationToken.None);
      if (this._isDisposed) {
        return;
      }
      this.tryUpdateLiveSessionItem(model);
      const requestChangeListener = model.lastRequestObs.map((last) => last?.response && observableSignalFromEvent("chatSessions.modelRequestChangeListener", last.response.onDidChange));
      const modelChangeListener = observableSignalFromEvent("chatSessions.modelChangeListener", model.onDidChange);
      this._modelListeners.set(model.sessionResource, autorun((reader) => {
        requestChangeListener.read(reader)?.read(reader);
        modelChangeListener.read(reader);
        this.tryUpdateLiveSessionItem(model);
      }));
    };
    this._register(this.chatService.onDidCreateModel((model) => addModelListeners(model)));
    for (const model of this.chatService.chatModels.get()) {
      addModelListeners(model);
    }
    this._register(this.chatService.onDidDisposeSession((e) => {
      for (const sessionResource of e.sessionResources) {
        this._modelListeners.deleteAndDispose(sessionResource);
      }
      const removedSessionResources = e.sessionResources.filter((resource) => getChatSessionType(resource) === this.chatSessionType);
      if (removedSessionResources.length) {
        // OpenCode sessions-close-1740: 模型被释放（例如关闭编辑器标签页）≠ 会话被删除。
        // ChatService 在触发本事件前已把有内容的会话写入历史（willDisposeModel → storeSessions），
        // 因此这里重新读取历史：仍在历史中的会话原地保留（换成历史条目），只有真正删除/空会话才从列表移除。
        this.ocHandleDisposedSessions(removedSessionResources);
      }
    }));
  }
  async ocHandleDisposedSessions(resources) {
    // OpenCode sessions-close-1740
    let historyItems = [];
    try {
      historyItems = await this.getHistoryItems();
    } catch {
      historyItems = [];
    }
    if (this._isDisposed) {
      return;
    }
    const historyByResource = new ResourceMap();
    for (const item of historyItems) {
      historyByResource.set(item.resource, item);
    }
    const removed = [];
    const addedOrUpdated = [];
    for (const resource of resources) {
      const historyItem = this.chatService.getSession(resource) ? void 0 : historyByResource.get(resource);
      if (historyItem) {
        this._items.set(resource, historyItem);
        addedOrUpdated.push(historyItem);
      } else if (this._items.has(resource) || !this.chatService.getSession(resource)) {
        this._items.delete(resource);
        removed.push(resource);
      }
    }
    if (addedOrUpdated.length > 0 || removed.length > 0) {
      this._onDidChangeChatSessionItems.fire({
        ...addedOrUpdated.length > 0 ? { addedOrUpdated } : void 0,
        ...removed.length > 0 ? { removed } : void 0
      });
    }
  }
  async tryUpdateLiveSessionItem(model) {
    const updated = this.toChatSessionItem(await chatModelToChatDetail(model));
    if (!updated) {
      if (this._items.has(model.sessionResource)) {
        this._items.delete(model.sessionResource);
        this._onDidChangeChatSessionItems.fire({ removed: [model.sessionResource] });
      }
      return;
    }
    const existing = this._items.get(updated.resource);
    if (existing?.isEqual(updated)) {
      return;
    }
    this._items.set(updated.resource, updated);
    this._onDidChangeChatSessionItems.fire({ addedOrUpdated: [updated] });
  }
  async provideChatSessionItems(token) {
    const sessions = [];
    const sessionsByResource = new ResourceSet();
    for (const sessionDetail of await this.chatService.getLiveSessionItems()) {
      const editorSession = this.toChatSessionItem(sessionDetail);
      if (!editorSession) {
        continue;
      }
      sessionsByResource.add(sessionDetail.sessionResource);
      sessions.push(editorSession);
    }
    if (!token.isCancellationRequested) {
      const history = await this.getHistoryItems();
      sessions.push(...history.filter((historyItem) => !sessionsByResource.has(historyItem.resource)));
    }
    return sessions;
  }
  async getHistoryItems() {
    try {
      const historyItems = await this.chatService.getHistorySessionItems();
      return coalesce(historyItems.map((history) => this.toChatSessionItem(history)));
    } catch (error) {
      return [];
    }
  }
  toChatSessionItem(chat) {
    const model = this.chatService.getSession(chat.sessionResource);
    if (model) {
      if (!model.hasRequests) {
        return void 0;
      }
    } else if (chat.isActive) {
      return void 0;
    }
    return new LocalChatSessionItem(chat, model);
  }
};

LocalAgentsSessionsController = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IChatSessionsService)
], LocalAgentsSessionsController);

var LocalChatSessionItem = class {
  constructor(chatDetail, model) {
    this.iconPath = Codicon.chatSparkle;
    this.resource = chatDetail.sessionResource;
    this.label = chatDetail.title;
    this.description = model ? getInProgressSessionDescription(model) : void 0;
    this.status = (model && getSessionStatusForModel(model)) ?? chatResponseStateToSessionStatus(chatDetail.lastResponseState);
    this.timing = convertLegacyChatSessionTiming(chatDetail.timing);
    this.changes = chatDetail.stats ? {
      insertions: chatDetail.stats.added,
      deletions: chatDetail.stats.removed,
      files: chatDetail.stats.fileCount
    } : void 0;
    const workingDirectoryPath = chatDetail.workingDirectory?.scheme === Schemas.file ? chatDetail.workingDirectory.fsPath : void 0;
    this.metadata = workingDirectoryPath ? { workingDirectoryPath } : void 0;
  }
  isEqual(other) {
    return isEqual2(this.resource, other.resource) && this.label === other.label && this.description === other.description && this.status === other.status && this.timing.created === other.timing.created && this.timing.lastRequestStarted === other.timing.lastRequestStarted && this.timing.lastRequestEnded === other.timing.lastRequestEnded && equals4(this.changes, other.changes);
  }
};
export { LocalAgentsSessionsController, LocalChatSessionItem };
