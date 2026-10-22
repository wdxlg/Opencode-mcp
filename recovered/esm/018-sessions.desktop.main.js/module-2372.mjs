// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatController.ts
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";
import { Position } from "./module-0079.mjs";
import { URI } from "./module-0032.mjs";
import { ILanguageModelChatMetadata, ILanguageModelsService, isILanguageModelChatSelector } from "./module-0968.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT, CTX_INLINE_CHAT_TERMINATED, CTX_INLINE_CHAT_VISIBLE, INLINE_CHAT_ID } from "./module-1978.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Schemas } from "./module-0033.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { autorun } from "./module-0052.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { InlineChatAffordance } from "./module-1985.mjs";
import { Lazy } from "./module-0028.mjs";
import { assertType } from "./module-0010.mjs";
import { InlineChatZoneWidget } from "./module-2371.mjs";
import { isResponseVM } from "./module-0979.mjs";
import { MenuId } from "./module-0092.mjs";
import { ChatMode } from "./module-1469.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { derived } from "./module-0054.mjs";
import { localize } from "./module-0001.mjs";
import { IChatService, IChatToolInvocation } from "./module-0973.mjs";
import { CellUri } from "./module-0911.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { CancellationError, isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { alert } from "./module-0076.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { isNotebookContainingCellEditor } from "./module-1855.mjs";
import { Event2 } from "./module-0017.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { IDiagnosticVariableEntryFilterData } from "./module-0980.mjs";
import { waitForState } from "./module-0056.mjs";
import { IInlineChatSessionService, continueInPanelChat, rephraseInlineChat } from "./module-1876.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IMarkerDecorationsService } from "./module-0209.mjs";
import { ILogService } from "./module-0095.mjs";
import { IChatEditingService } from "./module-1082.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatController.ts
var InlineChatRunOptions = class {
  static isInlineChatRunOptions(options3) {
    if (typeof options3 !== "object" || options3 === null) {
      return false;
    }
    const { initialSelection, initialRange, message, autoSend, position: position2, attachments, modelSelector, resolveOnResponse, attachDiagnostics } = options3;
    if (typeof message !== "undefined" && typeof message !== "string" || typeof autoSend !== "undefined" && typeof autoSend !== "boolean" || typeof initialRange !== "undefined" && !Range2.isIRange(initialRange) || typeof initialSelection !== "undefined" && !Selection.isISelection(initialSelection) || typeof position2 !== "undefined" && !Position.isIPosition(position2) || typeof attachments !== "undefined" && (!Array.isArray(attachments) || !attachments.every((item) => item instanceof URI)) || typeof modelSelector !== "undefined" && !isILanguageModelChatSelector(modelSelector) || typeof resolveOnResponse !== "undefined" && typeof resolveOnResponse !== "boolean" || typeof attachDiagnostics !== "undefined" && typeof attachDiagnostics !== "boolean") {
      return false;
    }
    return true;
  }
};

function getEditorId(editor, model) {
  return `${editor.getId()},${model.id}`;
}

function getAgentHostAttachmentRange(model, selection) {
  if (!selection) {
    return void 0;
  }
  if (!selection.isEmpty()) {
    return selection;
  }
  return new Range2(selection.startLineNumber, 1, selection.startLineNumber, model.getLineMaxColumn(selection.startLineNumber));
}

var InlineChatUntitledSaveHandler = class {
  constructor(_isEligible, _editorService, _onSaved, _logService) {
    this._isEligible = _isEligible;
    this._editorService = _editorService;
    this._onSaved = _onSaved;
    this._logService = _logService;
  }
  async handle(resource, message) {
    if (!this._isEligible(resource)) {
      return false;
    }
    const editor = this._editorService.findEditors(resource).at(0);
    if (!editor) {
      return false;
    }
    const result = await this._editorService.save(editor, { reason: 1 /* EXPLICIT */ });
    if (!result.success) {
      return true;
    }
    const savedResource = EditorResourceAccessor.getCanonicalUri(result.editors[0]);
    if (!savedResource) {
      this._logService.warn(`[InlineChat] No saved resource returned for untitled resource ${resource.toString()}`);
      return true;
    }
    await this._onSaved(resource, savedResource, message);
    return true;
  }
};

var InlineChatController = class {
  static {
    this.ID = INLINE_CHAT_ID;
  }
  static get(editor) {
    return editor.getContribution(InlineChatController.ID) ?? void 0;
  }
  /**
   * Stores the user's explicitly chosen model (qualified name) from a previous inline chat request in the same session.
   * When set, this takes priority over the inlineChat.defaultModel setting.
   */
  static #userSelectedModel;
  #store = new DisposableStore();
  #pendingSessionCts = new MutableDisposable();
  #isActiveController = observableValue(this, false);
  #zone;
  #currentSession;
  #editor;
  #instaService;
  #notebookEditorService;
  #inlineChatSessionService;
  #codeEditorService;
  #configurationService;
  #editorService;
  #markerDecorationsService;
  #languageModelService;
  #logService;
  #chatEditingService;
  #chatService;
  #ctxInlineChatVisible;
  #untitledSaveHandler;
  get widget() {
    return this.#zone.value.widget;
  }
  get isActive() {
    return Boolean(this.#currentSession.get());
  }
  constructor(editor, instaService, notebookEditorService, inlineChatSessionService, codeEditorService, contextKeyService, configurationService, editorService, markerDecorationsService, languageModelService, logService, chatEditingService, chatService) {
    this.#editor = editor;
    this.#instaService = instaService;
    this.#notebookEditorService = notebookEditorService;
    this.#inlineChatSessionService = inlineChatSessionService;
    this.#codeEditorService = codeEditorService;
    this.#configurationService = configurationService;
    this.#editorService = editorService;
    this.#markerDecorationsService = markerDecorationsService;
    this.#languageModelService = languageModelService;
    this.#logService = logService;
    this.#chatEditingService = chatEditingService;
    this.#chatService = chatService;
    this.#untitledSaveHandler = new InlineChatUntitledSaveHandler(
      (resource) => this.#configurationService.getValue("chat.inlineChat.agentHost.enabled" /* InlineChatAgentHostEnabled */) === true && !this.#notebookEditorService.getNotebookForPossibleCell(this.#editor) && resource.scheme === Schemas.untitled,
      editorService,
      async (source, target, message) => {
        this.#inlineChatSessionService.getSessionByTextModel(source)?.dispose();
        await this.#replaySavedUntitledInput(target, message);
      },
      logService
    );
    const editorObs = observableCodeEditor(editor);
    let agentHostAttachmentId;
    let agentHostAttachmentChanges;
    this.#ctxInlineChatVisible = CTX_INLINE_CHAT_VISIBLE.bindTo(contextKeyService);
    this.#store.add(this.#pendingSessionCts);
    const ctxFileBelongsToChat = CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.bindTo(contextKeyService);
    const ctxTerminated = CTX_INLINE_CHAT_TERMINATED.bindTo(contextKeyService);
    const notebookAgentConfig = observableConfigValue("inlineChat.notebookAgent" /* NotebookAgent */, false, this.#configurationService);
    let initializedZone = false;
    this.#store.add(autorun((r2) => {
      const model = editorObs.model.read(r2);
      if (!model) {
        ctxFileBelongsToChat.set(false);
        return;
      }
      const sessions = this.#chatEditingService.editingSessionsObs.read(r2);
      let hasEdits = false;
      for (const session of sessions) {
        const entries2 = session.entries.read(r2);
        for (const entry of entries2) {
          if (isEqual2(entry.modifiedURI, model.uri)) {
            hasEdits = true;
            break;
          }
        }
        if (hasEdits) {
          break;
        }
      }
      ctxFileBelongsToChat.set(hasEdits);
    }));
    this.inputOverlayWidget = this.#store.add(this.#instaService.createInstance(InlineChatAffordance, this.#editor));
    this.#zone = new Lazy(() => {
      assertType(this.#editor.hasModel(), "[Illegal State] widget should only be created when the editor has a model");
      const location2 = {
        location: "editor" /* EditorInline */,
        resolveData: () => {
          assertType(this.#editor.hasModel());
          const wholeRange = this.#editor.getSelection();
          const document2 = this.#editor.getModel().uri;
          return {
            type: "editor" /* EditorInline */,
            id: getEditorId(this.#editor, this.#editor.getModel()),
            selection: this.#editor.getSelection(),
            document: document2,
            wholeRange
          };
        }
      };
      const notebookEditor = this.#notebookEditorService.getNotebookForPossibleCell(this.#editor);
      if (!!notebookEditor) {
        location2.location = "notebook" /* Notebook */;
        if (notebookAgentConfig.get()) {
          location2.resolveData = () => {
            assertType(this.#editor.hasModel());
            return {
              type: "notebook" /* Notebook */,
              sessionInputUri: this.#editor.getModel().uri
            };
          };
        }
      }
      const result = this.#instaService.createInstance(
        InlineChatZoneWidget,
        location2,
        {
          enableWorkingSet: "implicit",
          enableImplicitContext: false,
          renderInputOnTop: false,
          renderInputToolbarBelowInput: true,
          filter: (item) => {
            if (!isResponseVM(item)) {
              return false;
            }
            return !!item.model.isPendingConfirmation.get();
          },
          menus: {
            telemetrySource: "inlineChatWidget",
            executeToolbar: MenuId.ChatEditorInlineExecute,
            inputSideToolbar: MenuId.ChatEditorInlineInputSide
          },
          defaultMode: ChatMode.Ask,
          submitHandler: (query) => {
            const model = this.#editor.getModel();
            return model ? this.#untitledSaveHandler.handle(model.uri, query) : Promise.resolve(false);
          }
        },
        { editor: this.#editor, notebookEditor },
        () => Promise.resolve()
      );
      this.#store.add(result);
      agentHostAttachmentChanges = observableSignalFromEvent(this, result.widget.chatWidget.attachmentModel.onDidChange);
      result.domNode.classList.add("inline-chat-2");
      return result;
    });
    const sessionsSignal = observableSignalFromEvent(this, inlineChatSessionService.onDidChangeSessions);
    this.#currentSession = derived((r2) => {
      sessionsSignal.read(r2);
      const model = editorObs.model.read(r2);
      const session = model && inlineChatSessionService.getSessionByTextModel(model.uri);
      return session ?? void 0;
    });
    let lastSession = void 0;
    this.#store.add(autorun((r2) => {
      const session = this.#currentSession.read(r2);
      if (!session) {
        this.#cancelPendingSession();
        this.#isActiveController.set(false, void 0);
        if (lastSession && !lastSession.chatModel.hasRequests) {
          const state = lastSession.chatModel.inputModel.state.read(void 0);
          if (!state || !state.inputText && state.attachments.length === 0) {
            lastSession.dispose();
            lastSession = void 0;
          }
        }
        return;
      }
      lastSession = session;
      let foundOne = false;
      for (const editor2 of codeEditorService.listCodeEditors()) {
        const ctrl = InlineChatController.get(editor2);
        if (ctrl && ctrl.#isActiveController.read(void 0)) {
          foundOne = true;
          break;
        }
      }
      if (!foundOne && editorObs.isFocused.read(r2)) {
        this.#isActiveController.set(true, void 0);
      }
    }));
    const visibleSessionObs = observableValue(this, void 0);
    this.#store.add(autorun((r2) => {
      const model = editorObs.model.read(r2);
      const session = this.#currentSession.read(r2);
      const isActive2 = this.#isActiveController.read(r2);
      if (!session || !isActive2 || !model) {
        visibleSessionObs.set(void 0, void 0);
      } else {
        visibleSessionObs.set(session, void 0);
      }
    }));
    const defaultPlaceholderObs = visibleSessionObs.map((session, r2) => {
      return session?.initialSelection.isEmpty() ? localize(16156, null) : localize(16157, null);
    });
    this.#store.add(autorun((r2) => {
      const session = visibleSessionObs.read(r2);
      ctxTerminated.set(!!session?.terminationState.read(r2));
    }));
    this.#store.add(autorun((r2) => {
      const session = visibleSessionObs.read(r2);
      if (!session) {
        initializedZone = false;
        this.#zone.rawValue?.hide();
        this.#zone.rawValue?.widget.chatWidget.setModel(void 0);
        editor.focus();
        this.#ctxInlineChatVisible.reset();
      } else {
        this.#ctxInlineChatVisible.set(true);
        this.#zone.value.widget.chatWidget.setModel(session.chatModel);
        const lockToAgent = session.lockToAgent;
        if (lockToAgent) {
          this.#zone.value.widget.chatWidget.lockToCodingAgent(lockToAgent.name, lockToAgent.displayName, lockToAgent.type, lockToAgent.agentHostProviderId);
        } else {
          this.#zone.value.widget.chatWidget.unlockFromCodingAgent();
        }
        if (!initializedZone) {
          this.#zone.value.widget.chatWidget.setInputPlaceholder(defaultPlaceholderObs.read(r2));
          this.#zone.value.widget.chatWidget.input.renderAttachedContext();
          initializedZone = true;
        }
        if (!this.#zone.value.position) {
          this.#zone.value.show(session.initialPosition);
        }
        this.#zone.value.reveal(this.#zone.value.position);
        this.#zone.value.widget.focus();
      }
    }));
    this.#store.add(autorun((r2) => {
      const session = visibleSessionObs.read(r2);
      const model = editorObs.model.read(r2);
      if (!session?.lockToAgent || !model) {
        if (agentHostAttachmentId) {
          this.#zone.rawValue?.widget.chatWidget.attachmentModel.updateContext([agentHostAttachmentId], []);
          agentHostAttachmentId = void 0;
        }
        return;
      }
      const attachmentModel = this.#zone.value.widget.chatWidget.attachmentModel;
      agentHostAttachmentChanges?.read(r2);
      const selection = editorObs.cursorSelection.read(r2);
      const entry = attachmentModel.asFileVariableEntry(model.uri, getAgentHostAttachmentRange(model, selection));
      attachmentModel.updateContext(agentHostAttachmentId && agentHostAttachmentId !== entry.id ? [agentHostAttachmentId] : [], [entry]);
      agentHostAttachmentId = entry.id;
    }));
    this.#store.add(autorun((r2) => {
      const session = this.#currentSession.read(r2);
      if (!session || session.lockToAgent) {
        return;
      }
      const lastRequest2 = session.chatModel.lastRequestObs.read(r2);
      const response = lastRequest2?.response;
      const pending = response?.isPendingConfirmation.read(r2);
      if (pending) {
        this.#logService.info(`[InlineChat] auto-approving: ${pending.detail ?? "unknown"}`);
        for (const part of response.response.value) {
          if (part.kind === "toolInvocation") {
            IChatToolInvocation.confirmWith(part, { type: 1 /* ConfirmationNotNeeded */, reason: "inlineChat" });
          }
        }
      }
    }));
    this.#store.add(autorun((r2) => {
      const session = visibleSessionObs.read(r2);
      if (session) {
        const entries2 = session.editingSession.entries.read(r2);
        const sessionCellUri = CellUri.parse(session.uri);
        const otherEntries2 = entries2.filter((entry) => {
          if (isEqual2(entry.modifiedURI, session.uri)) {
            return false;
          }
          if (!!sessionCellUri && isEqual2(sessionCellUri.notebook, entry.modifiedURI)) {
            return false;
          }
          return true;
        });
        for (const entry of otherEntries2) {
          this.#editorService.openEditor({ resource: entry.modifiedURI }, SIDE_GROUP).catch(onUnexpectedError);
        }
      }
    }));
    const lastResponseObs = visibleSessionObs.map((session, r2) => {
      if (!session) {
        return;
      }
      const lastRequest2 = observableFromEvent(this, session.chatModel.onDidChange, () => session.chatModel.getRequests().at(-1)).read(r2);
      return lastRequest2?.response;
    });
    const lastResponseProgressObs = lastResponseObs.map((response, r2) => {
      if (!response) {
        return;
      }
      return observableFromEvent(this, response.onDidChange, () => response.response.value.findLast(
        (part) => part.kind === "progressMessage" || part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized"
      )).read(r2);
    });
    this.#store.add(autorun((r2) => {
      const session = visibleSessionObs.read(r2);
      const response = lastResponseObs.read(r2);
      const terminationState = session?.terminationState.read(r2);
      this.#zone.rawValue?.widget.updateInfo("");
      if (!response?.isInProgress.read(r2)) {
        this.#zone.rawValue?.status.set(response?.result?.details ?? "", void 0);
        if (response?.result?.errorDetails) {
          this.#zone.rawValue?.widget.updateInfo(`$(error) ${response.result.errorDetails.message}`);
          alert(response.result.errorDetails.message);
        } else if (terminationState) {
          this.#zone.rawValue?.showTerminationCard(terminationState, this.#instaService);
        }
        if (!terminationState) {
          this.#zone.rawValue?.hideTerminationCard();
        }
        this.#zone.rawValue?.widget.domNode.classList.toggle("request-in-progress", false);
        this.#zone.rawValue?.widget.chatWidget.setInputPlaceholder(defaultPlaceholderObs.read(r2));
      } else {
        this.#zone.rawValue?.widget.domNode.classList.toggle("request-in-progress", true);
        this.#zone.rawValue?.status.set("", void 0);
        r2.store.add(autorun((r3) => {
          let placeholder = response.request?.message.text;
          const lastProgress = lastResponseProgressObs.read(r3);
          if (lastProgress?.kind === "progressMessage") {
            placeholder = lastProgress.content;
          } else if (lastProgress?.kind === "toolInvocationSerialized") {
            placeholder = lastProgress.invocationMessage ?? lastProgress.pastTenseMessage;
          } else if (lastProgress?.kind === "toolInvocation") {
            const state = lastProgress.state.read(r3);
            if (state.type === IChatToolInvocation.StateKind.Executing) {
              placeholder = state.progress.read(r3).message;
            } else if (state.type === IChatToolInvocation.StateKind.Streaming) {
              placeholder = state.streamingMessage.read(r3);
            } else if (state.type === IChatToolInvocation.StateKind.Completed || state.type === IChatToolInvocation.StateKind.Cancelled) {
              placeholder = lastProgress.pastTenseMessage;
            } else {
              placeholder = lastProgress.invocationMessage;
            }
          }
          const value2 = typeof placeholder === "string" ? placeholder : placeholder ? renderAsPlaintext(placeholder, { useLinkFormatter: true }) : localize(16155, null);
          this.#zone.rawValue?.widget.chatWidget.setInputPlaceholder(value2);
        }));
      }
    }));
    this.#store.add(autorun((r2) => {
      const session = visibleSessionObs.read(r2);
      if (!session) {
        return;
      }
      const entry = session.editingSession.readEntry(session.uri, r2);
      if (entry?.state.read(r2) === 0 /* Modified */) {
        entry?.enableReviewModeUntilSettled();
      }
    }));
    this.#store.add(autorun((r2) => {
      const model = editorObs.model.read(r2);
      const pane = this.#editorService.visibleEditorPanes.find((candidate) => candidate.getControl() === this.#editor || isNotebookContainingCellEditor(candidate, this.#editor));
      if (!model || !pane) {
        return;
      }
      for (const session of this.#chatEditingService.editingSessionsObs.read(r2)) {
        if (session.isGlobalEditingSession) {
          continue;
        }
        const entry = session.readEntry(model.uri, r2);
        if (entry) {
          entry.getEditorIntegration(pane);
          return;
        }
      }
    }));
    this.#store.add(autorun((r2) => {
      const session = visibleSessionObs.read(r2);
      const entry = session?.editingSession.readEntry(session.uri, r2);
      if (entry?.diffInfo && this.#zone.rawValue?.position) {
        const { position: position2 } = this.#zone.rawValue;
        const diff4 = entry.diffInfo.read(r2);
        for (const change of diff4.changes) {
          if (change.modified.contains(position2.lineNumber)) {
            this.#zone.rawValue?.updatePositionAndHeight(new Position(change.modified.startLineNumber - 1, 1));
            break;
          }
        }
      }
    }));
  }
  async #replaySavedUntitledInput(resource, message) {
    const controller = await this.#waitForSavedEditorController(resource);
    if (!controller) {
      this.#logService.warn(`[InlineChat] No editor available after saving untitled resource ${resource.toString()}`);
      return;
    }
    void controller.run({ message, autoSend: true }).catch(onUnexpectedError);
  }
  #waitForSavedEditorController(resource) {
    const findController = () => {
      for (const editor of this.#codeEditorService.listCodeEditors()) {
        if (isEqual2(editor.getModel()?.uri, resource)) {
          return InlineChatController.get(editor);
        }
      }
      return void 0;
    };
    const controller = findController();
    if (controller) {
      return Promise.resolve(controller);
    }
    return new Promise((resolve3) => {
      const store = new DisposableStore();
      let didComplete = false;
      const complete = (controller3) => {
        if (didComplete) {
          return;
        }
        didComplete = true;
        store.dispose();
        resolve3(controller3);
      };
      store.add(Event2.any(this.#editorService.onDidActiveEditorChange, this.#editorService.onDidVisibleEditorsChange)(() => {
        const controller3 = findController();
        if (controller3) {
          complete(controller3);
        }
      }));
      store.add(disposableTimeout(() => complete(void 0), 5e3));
      const controller2 = findController();
      if (controller2) {
        complete(controller2);
      }
    });
  }
  dispose() {
    this.#cancelPendingSession();
    this.#store.dispose();
  }
  getWidgetPosition() {
    return this.#zone.rawValue?.position;
  }
  focus() {
    this.#zone.rawValue?.widget.focus();
  }
  async run(arg) {
    assertType(this.#editor.hasModel());
    this.#cancelPendingSession();
    const uri4 = this.#editor.getModel().uri;
    const existingSession = this.#inlineChatSessionService.getSessionByTextModel(uri4);
    if (existingSession) {
      await existingSession.editingSession.accept();
      existingSession.dispose();
    }
    this.#isActiveController.set(true, void 0);
    this.#ctxInlineChatVisible.set(true);
    const initialPosition = this.#editor.getSelection().getStartPosition().delta(-1);
    this.#zone.value.show(initialPosition);
    this.#zone.value.widget.focus();
    const sessionCts = new CancellationTokenSource();
    this.#pendingSessionCts.value = sessionCts;
    try {
      const session = await this.#inlineChatSessionService.createSession(this.#editor, !!this.#notebookEditorService.getNotebookForPossibleCell(this.#editor), sessionCts.token);
      if (sessionCts.token.isCancellationRequested) {
        session.dispose();
        throw new CancellationError();
      }
      if (this.#pendingSessionCts.value === sessionCts) {
        this.#pendingSessionCts.clear();
      }
      return this.#runZone(session, arg);
    } catch (error) {
      if (isCancellationError(error)) {
        if (this.#pendingSessionCts.value === sessionCts) {
          this.#cancelPendingSessionAndHide();
        }
        return false;
      }
      throw error;
    } finally {
      if (this.#pendingSessionCts.value === sessionCts) {
        this.#pendingSessionCts.clear();
      }
    }
  }
  #cancelPendingSession() {
    const sessionCts = this.#pendingSessionCts.value;
    if (sessionCts) {
      sessionCts.cancel();
      this.#pendingSessionCts.clear();
    }
  }
  #cancelPendingSessionAndHide() {
    this.#cancelPendingSession();
    this.#isActiveController.set(false, void 0);
    this.#zone.rawValue?.hide();
    this.#zone.rawValue?.widget.chatWidget.setModel(void 0);
    this.#editor.focus();
    this.#ctxInlineChatVisible.reset();
  }
  /**
   * Zone mode: use the full zone widget and chat widget for request submission.
   */
  async #runZone(session, arg) {
    assertType(this.#editor.hasModel());
    const uri4 = this.#editor.getModel().uri;
    const sessionStore = new DisposableStore();
    try {
      await this.#applyModelDefaults(session, sessionStore);
      if (arg) {
        arg.attachDiagnostics ??= true;
      }
      if (arg?.attachDiagnostics) {
        const entries2 = [];
        for (const [range2, marker] of this.#markerDecorationsService.getLiveMarkers(uri4)) {
          if (range2.intersectRanges(this.#editor.getSelection())) {
            const filter2 = IDiagnosticVariableEntryFilterData.fromMarker(marker);
            entries2.push(IDiagnosticVariableEntryFilterData.toEntry(filter2));
          }
        }
        if (entries2.length > 0) {
          this.#zone.value.widget.chatWidget.attachmentModel.addContext(...entries2);
          const msg = entries2.length > 1 ? localize(16154, null) : localize(16153, null);
          this.#zone.value.widget.chatWidget.input.setValue(msg, true);
          arg.message = msg;
          this.#zone.value.widget.chatWidget.inputEditor.setSelection(new Selection(1, 1, Number.MAX_SAFE_INTEGER, 1));
        }
      }
      if (arg && InlineChatRunOptions.isInlineChatRunOptions(arg)) {
        if (arg.initialRange) {
          this.#editor.revealRange(arg.initialRange);
        }
        if (arg.initialSelection) {
          this.#editor.setSelection(arg.initialSelection);
        }
        if (arg.attachments) {
          await Promise.all(arg.attachments.map(async (attachment) => {
            await this.#zone.value.widget.chatWidget.attachmentModel.addFile(attachment);
          }));
          delete arg.attachments;
        }
        if (arg.modelSelector) {
          const id2 = (await this.#languageModelService.selectLanguageModels(arg.modelSelector)).sort().at(0);
          if (!id2) {
            throw new Error(`No language models found matching selector: ${JSON.stringify(arg.modelSelector)}.`);
          }
          const model = this.#languageModelService.lookupLanguageModel(id2);
          if (!model) {
            throw new Error(`Language model not loaded: ${id2}.`);
          }
          this.#zone.value.widget.chatWidget.input.setCurrentLanguageModel({ metadata: model, identifier: id2 }, true);
        }
        if (arg.message) {
          this.#zone.value.widget.chatWidget.setInput(arg.message);
          if (arg.autoSend) {
            await this.#zone.value.widget.chatWidget.acceptInput();
          }
        }
      }
      if (!arg?.resolveOnResponse) {
        await Event2.toPromise(session.editingSession.onDidDispose);
        const rejected = session.editingSession.getEntry(uri4)?.state.get() === 2 /* Rejected */;
        return !rejected;
      } else {
        const modifiedObs = derived((r2) => {
          const entry = session.editingSession.readEntry(uri4, r2);
          return entry?.state.read(r2) === 0 /* Modified */ && !entry?.isCurrentlyBeingModifiedBy.read(r2);
        });
        await waitForState(modifiedObs, (state) => state === true);
        return true;
      }
    } finally {
      sessionStore.dispose();
    }
  }
  async acceptSession() {
    const session = this.#currentSession.get();
    if (!session) {
      return;
    }
    await session.editingSession.accept();
    session.dispose();
  }
  async rejectSession() {
    const session = this.#currentSession.get();
    if (!session) {
      this.#cancelPendingSessionAndHide();
      return;
    }
    await this.#chatService.cancelCurrentRequestForSession(session.chatModel.sessionResource, "inlineChatReject");
    await session.editingSession.reject();
    session.dispose();
  }
  async continueSessionInChat() {
    const session = this.#currentSession.get();
    if (!session) {
      return;
    }
    await this.#instaService.invokeFunction(continueInPanelChat, session);
  }
  async rephraseSession() {
    const session = this.#currentSession.get();
    if (!session) {
      return;
    }
    const requestText = this.#instaService.invokeFunction(rephraseInlineChat, session);
    if (requestText) {
      this.#zone.rawValue?.widget.chatWidget.setInput(requestText);
    }
    this.#zone.rawValue?.widget.focus();
  }
  async #selectVendorDefaultModel(session) {
    const model = this.#zone.value.widget.chatWidget.input.selectedLanguageModel.get();
    if (model && !model.metadata.isDefaultForLocation[session.chatModel.initialLocation]) {
      const ids = await this.#languageModelService.selectLanguageModels({ vendor: model.metadata.vendor });
      for (const identifier2 of ids) {
        const candidate = this.#languageModelService.lookupLanguageModel(identifier2);
        if (candidate?.isDefaultForLocation[session.chatModel.initialLocation]) {
          this.#zone.value.widget.chatWidget.input.setCurrentLanguageModel({ metadata: candidate, identifier: identifier2 });
          break;
        }
      }
    }
  }
  /**
   * Applies model defaults based on settings and tracks user model changes.
   * Prioritization: user session choice > inlineChat.defaultModel setting > vendor default
   */
  async #applyModelDefaults(session, sessionStore) {
    const userSelectedModel = InlineChatController.#userSelectedModel;
    const defaultModelSetting = this.#configurationService.getValue("inlineChat.defaultModel" /* DefaultModel */);
    let modelApplied = false;
    if (userSelectedModel) {
      modelApplied = this.#zone.value.widget.chatWidget.input.switchModelByQualifiedName([userSelectedModel]);
      if (!modelApplied) {
        InlineChatController.#userSelectedModel = void 0;
      }
    }
    if (!modelApplied && defaultModelSetting) {
      modelApplied = this.#zone.value.widget.chatWidget.input.switchModelByQualifiedName([defaultModelSetting]);
      if (!modelApplied) {
        this.#logService.warn(`inlineChat.defaultModel setting value '${defaultModelSetting}' did not match any available model. Falling back to vendor default.`);
      }
    }
    if (!modelApplied) {
      await this.#selectVendorDefaultModel(session);
    }
    let initialModelId;
    sessionStore.add(autorun((r2) => {
      const newModel = this.#zone.value.widget.chatWidget.input.selectedLanguageModel.read(r2);
      if (!newModel) {
        return;
      }
      if (!initialModelId) {
        initialModelId = newModel.identifier;
        return;
      }
      if (initialModelId !== newModel.identifier) {
        InlineChatController.#userSelectedModel = ILanguageModelChatMetadata.asQualifiedName(newModel.metadata);
        initialModelId = newModel.identifier;
      }
    }));
  }
};

InlineChatController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, INotebookEditorService),
  __decorateParam(3, IInlineChatSessionService),
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IMarkerDecorationsService),
  __decorateParam(9, ILanguageModelsService),
  __decorateParam(10, ILogService),
  __decorateParam(11, IChatEditingService),
  __decorateParam(12, IChatService)
], InlineChatController);
export { getEditorId, getAgentHostAttachmentRange, InlineChatRunOptions, InlineChatUntitledSaveHandler, InlineChatController };
