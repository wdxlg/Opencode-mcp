// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatSessionServiceImpl.ts
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { Schemas } from "./module-0033.mjs";
import { CancellationError, isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { InlineChatEditReviewSession } from "./module-2950.mjs";
import { observableValue } from "./module-0048.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IInlineChatSessionResolver } from "./module-2952.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatEditingService } from "./module-1081.mjs";
import { CTX_INLINE_CHAT_HAS_AGENT, CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT, CTX_INLINE_CHAT_POSSIBLE } from "./module-2001.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { isCodeEditor, isCompositeEditor, isDiffEditor } from "./module-0223.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0990.mjs";
import { localize } from "./module-0001.mjs";
import { IInlineChatSessionService } from "./module-1899.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatSessionServiceImpl.ts
var InlineChatError = class _InlineChatError extends Error {
  static {
    this.code = "InlineChatError";
  }
  constructor(message) {
    super(message);
    this.name = _InlineChatError.code;
  }
};

var InlineChatSessionServiceImpl = class {
  constructor(chatService, chatAgentService, inlineChatSessionResolver, instantiationService, chatEditingService) {
    this.#store = new DisposableStore();
    this.#sessions = new ResourceMap();
    this.#onWillStartSession = this.#store.add(new Emitter());
    this.onWillStartSession = this.#onWillStartSession.event;
    this.#onDidChangeSessions = this.#store.add(new Emitter());
    this.onDidChangeSessions = this.#onDidChangeSessions.event;
    this.#chatService = chatService;
    this.#inlineChatSessionResolver = inlineChatSessionResolver;
    this.#instantiationService = instantiationService;
    this.#chatEditingService = chatEditingService;
    const agentObs = observableFromEvent(this, chatAgentService.onDidChangeAgents, () => chatAgentService.getDefaultAgent("editor" /* EditorInline */));
    this.#store.add(autorun((r2) => {
      const agent = agentObs.read(r2);
      if (!agent) {
        dispose(this.#sessions.values());
        this.#sessions.clear();
      }
    }));
  }
  #store;
  #sessions;
  #onWillStartSession;
  #onDidChangeSessions;
  #chatService;
  #inlineChatSessionResolver;
  #instantiationService;
  #chatEditingService;
  dispose() {
    this.#store.dispose();
  }
  async createSession(editor, isNotebook, token) {
    const model = editor.getModel();
    const uri5 = model.uri;
    if (this.#sessions.has(uri5)) {
      throw new Error("Session already exists");
    }
    this.#onWillStartSession.fire(editor);
    const isAgentHostEligible = uri5.scheme === Schemas.file && !isNotebook;
    const resolution = isAgentHostEligible ? await this.#inlineChatSessionResolver.resolve(token, model.getLanguageId(), uri5) : void 0;
    if (token.isCancellationRequested || isAgentHostEligible && !resolution) {
      resolution?.modelRef.dispose();
      throw new CancellationError();
    }
    if (this.#sessions.has(uri5)) {
      resolution?.modelRef.dispose();
      throw new Error("Session already exists");
    }
    const chatModelRef = resolution?.modelRef ?? this.#chatService.startNewLocalSession("editor" /* EditorInline */, {
      canUseTools: false
      /* SEE https://github.com/microsoft/vscode/issues/279946 */
    });
    const chatModel = chatModelRef.object;
    const lockToAgent = resolution?.lockToAgent;
    let reviewSession;
    let editingSession;
    if (lockToAgent) {
      reviewSession = this.#instantiationService.createInstance(InlineChatEditReviewSession, chatModel.sessionResource, uri5);
      editingSession = reviewSession;
    } else {
      chatModel.startEditingSession(false);
      editingSession = chatModel.editingSession;
    }
    const terminationState = observableValue(this, void 0);
    const store = new DisposableStore();
    store.add(toDisposable(() => {
      void this.#chatService.cancelCurrentRequestForSession(chatModel.sessionResource, "inlineChatSession");
      void editingSession.reject();
      this.#sessions.delete(uri5);
      this.#onDidChangeSessions.fire(this);
    }));
    store.add(chatModelRef);
    if (reviewSession) {
      store.add(this.#chatEditingService.registerEditReviewSession(reviewSession));
      store.add(reviewSession);
      this.#installEditReviewObserver(chatModel, reviewSession, store);
    }
    store.add(autorun((r2) => {
      const entries2 = editingSession.entries.read(r2);
      if (!entries2?.length) {
        return;
      }
      const state = entries2.find((entry) => isEqual2(entry.modifiedURI, uri5))?.state.read(r2);
      if (state === 1 /* Accepted */ || state === 2 /* Rejected */) {
        const response = chatModel.getRequests().at(-1)?.response;
        if (response) {
          this.#chatService.notifyUserAction({
            sessionResource: response.session.sessionResource,
            requestId: response.requestId,
            agentId: response.agent?.id,
            command: response.slashCommand?.name,
            result: response.result,
            action: {
              kind: "inlineChat",
              action: state === 1 /* Accepted */ ? "accepted" : "discarded"
            }
          });
        }
      }
      const allSettled = entries2.every((entry) => {
        const state2 = entry.state.read(r2);
        return (state2 === 1 /* Accepted */ || state2 === 2 /* Rejected */) && !entry.isCurrentlyBeingModifiedBy.read(r2);
      });
      if (allSettled && !chatModel.requestInProgress.read(void 0)) {
        store.dispose();
      }
    }));
    const result = {
      uri: uri5,
      initialPosition: editor.getSelection().getStartPosition().delta(-1),
      /* one line above selection start */
      initialSelection: editor.getSelection(),
      chatModel,
      editingSession,
      lockToAgent,
      terminationState,
      setTerminationState: (state) => {
        terminationState.set(state, void 0);
        this.#onDidChangeSessions.fire(this);
      },
      dispose: store.dispose.bind(store)
    };
    this.#sessions.set(uri5, result);
    this.#onDidChangeSessions.fire(this);
    return result;
  }
  #installEditReviewObserver(chatModel, reviewSession, store) {
    let turnQueue = Promise.resolve();
    let isDisposed = false;
    store.add(toDisposable(() => isDisposed = true));
    store.add(chatModel.onDidChange(async (e) => {
      if (e.kind !== "addRequest" || !e.request.response) {
        return;
      }
      const response = e.request.response;
      const previousTurn = turnQueue;
      let completeTurn;
      turnQueue = new Promise((resolve3) => completeTurn = resolve3);
      await previousTurn;
      if (isDisposed) {
        completeTurn?.();
        return;
      }
      let beganTurn = false;
      try {
        await reviewSession.beginTurn(response);
        beganTurn = true;
        if (isDisposed) {
          return;
        }
        if (!response.isComplete) {
          const responseStore = new DisposableStore();
          try {
            await new Promise((resolve3) => {
              responseStore.add(response.onDidChange(() => {
                if (response.isComplete) {
                  resolve3();
                }
              }));
              responseStore.add(reviewSession.onDidDispose(resolve3));
              if (response.isComplete) {
                resolve3();
              }
            });
          } finally {
            responseStore.dispose();
          }
        }
      } catch (error) {
        if (!isDisposed) {
          void this.#chatService.cancelCurrentRequestForSession(chatModel.sessionResource, "inlineChatBeginTurnFailed");
        }
        if (!isCancellationError(error)) {
          onUnexpectedError(error);
        }
      } finally {
        if (beganTurn && !isDisposed) {
          try {
            await reviewSession.endTurn(response);
          } catch (error) {
            onUnexpectedError(error);
          }
        }
        completeTurn?.();
      }
    }));
  }
  getSessionByTextModel(uri5) {
    let result = this.#sessions.get(uri5);
    if (!result) {
      for (const [_, candidate] of this.#sessions) {
        const entry = candidate.editingSession.getEntry(uri5);
        if (entry) {
          result = candidate;
          break;
        }
      }
    }
    return result;
  }
  getSessionBySessionUri(sessionResource) {
    for (const session of this.#sessions.values()) {
      if (isEqual2(session.chatModel.sessionResource, sessionResource)) {
        return session;
      }
    }
    return void 0;
  }
};

InlineChatSessionServiceImpl = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IInlineChatSessionResolver),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IChatEditingService)
], InlineChatSessionServiceImpl);

var InlineChatEnabler = class {
  static {
    this.Id = "inlineChat.enabler";
  }
  #ctxHasProvider;
  #ctxHasNotebookProvider;
  #ctxPossible;
  #store = new DisposableStore();
  constructor(contextKeyService, chatAgentService, editorService, configService) {
    this.#ctxHasProvider = CTX_INLINE_CHAT_HAS_AGENT.bindTo(contextKeyService);
    this.#ctxHasNotebookProvider = CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT.bindTo(contextKeyService);
    this.#ctxPossible = CTX_INLINE_CHAT_POSSIBLE.bindTo(contextKeyService);
    const agentObs = observableFromEvent(this, chatAgentService.onDidChangeAgents, () => chatAgentService.getDefaultAgent("editor" /* EditorInline */));
    const notebookAgentObs = observableFromEvent(this, chatAgentService.onDidChangeAgents, () => chatAgentService.getDefaultAgent("notebook" /* Notebook */));
    const notebookAgentConfigObs = observableConfigValue("inlineChat.notebookAgent" /* NotebookAgent */, false, configService);
    this.#store.add(autorun((r2) => {
      const agent = agentObs.read(r2);
      if (!agent) {
        this.#ctxHasProvider.reset();
      } else {
        this.#ctxHasProvider.set(true);
      }
    }));
    this.#store.add(autorun((r2) => {
      this.#ctxHasNotebookProvider.set(notebookAgentConfigObs.read(r2) && !!notebookAgentObs.read(r2));
    }));
    const updateEditor = () => {
      const ctrl = editorService.activeEditorPane?.getControl();
      const isCodeEditorLike = isCodeEditor(ctrl) || isDiffEditor(ctrl) || isCompositeEditor(ctrl);
      this.#ctxPossible.set(isCodeEditorLike);
    };
    this.#store.add(editorService.onDidActiveEditorChange(updateEditor));
    updateEditor();
  }
  dispose() {
    this.#ctxPossible.reset();
    this.#ctxHasProvider.reset();
    this.#store.dispose();
  }
};

InlineChatEnabler = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IConfigurationService)
], InlineChatEnabler);

var InlineChatEscapeToolContribution = class extends Disposable {
  static {
    this.Id = "inlineChat.escapeTool";
  }
  static #data = {
    id: "inline_chat_exit",
    source: ToolDataSource.Internal,
    canBeReferencedInPrompt: false,
    alwaysDisplayInputOutput: false,
    displayName: localize(16161, null),
    modelDescription: "Show a short textual response when not being able to make code changes and when not having been asked for code changes. Can also be used to move the request to the richer panel chat which supports edits across files, creating and deleting files, multi-turn conversations between the user and the assistant, and access to more IDE tools, like retrieve problems, interact with source control, run terminal commands etc.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        response: {
          type: "string",
          description: localize(16162, null),
          maxLength: 200
        }
      }
    }
  };
  constructor(lmTools, inlineChatSessionService, logService) {
    super();
    this._store.add(lmTools.registerTool(InlineChatEscapeToolContribution.#data, {
      invoke: async (invocation, _tokenCountFn, _progress, _token) => {
        const sessionResource = invocation.context?.sessionResource;
        if (!sessionResource) {
          logService.warn("InlineChatEscapeToolContribution: no sessionId in tool invocation context");
          return { content: [{ kind: "text", value: "Cancel" }] };
        }
        const session = inlineChatSessionService.getSessionBySessionUri(sessionResource);
        if (!session) {
          logService.warn(`InlineChatEscapeToolContribution: no session found for id ${sessionResource}`);
          return { content: [{ kind: "text", value: "Cancel" }] };
        }
        const lastRequest2 = session.chatModel.getRequests().at(-1);
        if (!lastRequest2) {
          logService.warn(`InlineChatEscapeToolContribution: no request found for id ${sessionResource}`);
          return { content: [{ kind: "text", value: "Cancel" }], toolResultMessage: localize(16164, null) };
        }
        const response = typeof invocation.parameters?.response === "string" && invocation.parameters.response.trim().length > 0 ? invocation.parameters.response.trim() : localize(16163, null);
        session.setTerminationState(response);
        return { content: [{ kind: "text", value: "Success" }] };
      }
    }));
  }
};

InlineChatEscapeToolContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInlineChatSessionService),
  __decorateParam(2, ILogService)
], InlineChatEscapeToolContribution);
export { InlineChatError, InlineChatSessionServiceImpl, InlineChatEnabler, InlineChatEscapeToolContribution };
