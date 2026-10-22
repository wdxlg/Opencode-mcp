// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/editor/chatEditor.ts
import { AbstractEditorWithViewState } from "./module-1091.mjs";
import { ChatEditorInput } from "./module-1112.mjs";
import { $, Dimension, append } from "./module-0075.mjs";
import { clearChatEditor } from "./module-2538.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ChatWidget } from "./module-2369.mjs";
import { editorBackground, editorForeground } from "./module-0229.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "./module-0868.mjs";
import { inputBackground } from "./module-0233.mjs";
import { renderIcon } from "./module-0467.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { IChatSessionsService, localChatSessionType } from "./module-0961.mjs";
import { localize } from "./module-0001.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { setModelPreservingInputTypedWhileLoading } from "./module-0982.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IChatService } from "./module-0973.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/editor/chatEditor.ts
var ChatEditor = class extends AbstractEditorWithViewState {
  constructor(group2, telemetryService, themeService, instantiationService, storageService, chatSessionsService, contextKeyService, chatService, textResourceConfigurationService, editorService, editorGroupService) {
    super(ChatEditorInput.EditorID, group2, ChatEditor.VIEW_STATE_KEY, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
    this.chatSessionsService = chatSessionsService;
    this.contextKeyService = contextKeyService;
    this.chatService = chatService;
    this.dimension = new Dimension(0, 0);
  }
  static {
    this.VIEW_STATE_KEY = "chatEditorViewState";
  }
  get widget() {
    return this._widget;
  }
  get scopedContextKeyService() {
    return this._scopedContextKeyService;
  }
  async clear(resolvedSessionType) {
    if (this.input) {
      return this.instantiationService.invokeFunction(clearChatEditor, this.input, resolvedSessionType);
    }
  }
  createEditor(parent) {
    this._editorContainer = parent;
    parent.classList.add("chat-editor-relative");
    this._scopedContextKeyService = this._register(this.contextKeyService.createScoped(parent));
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    ChatContextKeys.inChatEditor.bindTo(this._scopedContextKeyService).set(true);
    this._widget = this._register(
      scopedInstantiationService.createInstance(
        ChatWidget,
        "panel" /* Chat */,
        void 0,
        {
          autoScroll: (mode) => mode !== "ask" /* Ask */,
          readOnlyBannerAtTop: true,
          renderFollowups: true,
          supportsFileReferences: true,
          clear: (resolvedSessionType) => this.clear(resolvedSessionType),
          enableFind: true,
          rendererOptions: {
            renderTextEditsAsSummary: (uri4) => {
              return true;
            },
            referencesExpandedWhenEmptyResponse: false,
            progressMessageAtBottomOfResponse: (mode) => mode !== "ask" /* Ask */
          },
          enableImplicitContext: true,
          enableWorkingSet: "explicit",
          supportsChangingModes: true
        },
        {
          listForeground: editorForeground,
          listBackground: editorBackground,
          overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
          inputEditorBackground: inputBackground,
          resultEditorBackground: editorBackground
        }
      )
    );
    this._register(this.widget.onDidSubmitAgent(() => {
      this.group.pinEditor(this.input);
    }));
    this._register(this.widget.onDidChangeViewModel((e4) => {
      if (e4.currentSessionResource && this.input instanceof ChatEditorInput) {
        const newModel = this.chatService.getSession(e4.currentSessionResource);
        if (newModel) {
          this.input.updateModel(newModel);
        }
      }
    }));
    this.widget.render(parent);
    this.widget.setVisible(true);
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    this.widget?.setVisible(visible);
    if (visible && this.widget) {
      this.widget.layout(this.dimension.height, this.dimension.width);
    }
  }
  focus() {
    super.focus();
    this.widget?.focusInput();
  }
  clearInput() {
    super.clearInput();
    this.widget.setModel(void 0);
    if (this._editorContainer) {
      delete this._editorContainer.dataset.boundChatResource;
    }
  }
  showLoadingInChatWidget(message) {
    if (!this._editorContainer) {
      return;
    }
    if (this._loadingContainer) {
      const existingText = this._loadingContainer.querySelector(".chat-loading-content span");
      if (existingText) {
        existingText.textContent = message;
        return;
      }
      this.hideLoadingInChatWidget();
    }
    this._editorContainer.setAttribute("aria-busy", "true");
    this._loadingContainer = append(this._editorContainer, $(".chat-loading-overlay"));
    this._loadingContainer.setAttribute("role", "status");
    this._loadingContainer.setAttribute("aria-live", "polite");
    this._loadingContainer.tabIndex = -1;
    const loadingContent = append(this._loadingContainer, $(".chat-loading-content"));
    const spinner = renderIcon(ThemeIcon.modify(Codicon.loading, "spin"));
    spinner.setAttribute("aria-hidden", "true");
    loadingContent.appendChild(spinner);
    const text2 = append(loadingContent, $("span"));
    text2.textContent = message;
  }
  hideLoadingInChatWidget() {
    if (this._loadingContainer) {
      this._loadingContainer.remove();
      this._loadingContainer = void 0;
    }
    if (this._editorContainer) {
      this._editorContainer.removeAttribute("aria-busy");
    }
  }
  async setInput(input, options3, context2, token) {
    const inputBeforeLoad = this.widget?.getInput() ?? "";
    let isContributedChatSession = false;
    const chatSessionType = input.getSessionType();
    if (chatSessionType !== localChatSessionType) {
      const loadingMessage = localize(12678, null);
      this.showLoadingInChatWidget(loadingMessage);
    }
    await super.setInput(input, options3, context2, token);
    if (token.isCancellationRequested) {
      this.hideLoadingInChatWidget();
      return;
    }
    if (!this.widget) {
      throw new Error("ChatEditor lifecycle issue: no editor widget");
    }
    if (chatSessionType !== localChatSessionType) {
      try {
        await raceCancellationError(this.chatSessionsService.canResolveChatSession(chatSessionType), token);
        const contributions = this.chatSessionsService.getAllChatSessionContributions();
        const contribution = contributions.find((c) => c.type === chatSessionType);
        if (contribution) {
          this.widget.lockToCodingAgent(contribution.name, contribution.displayName, contribution.type, contribution.agentHostProviderId);
          isContributedChatSession = true;
        } else {
          this.widget.unlockFromCodingAgent();
        }
      } catch (error) {
        this.hideLoadingInChatWidget();
        throw error;
      }
    } else {
      this.widget.unlockFromCodingAgent();
    }
    try {
      const editorModel = await raceCancellationError(input.resolve(), token);
      if (!editorModel) {
        throw new Error(`Failed to get model for chat editor. resource: ${input.sessionResource}`);
      }
      if (chatSessionType !== localChatSessionType) {
        this.hideLoadingInChatWidget();
      }
      if (options3?.modelInputState) {
        editorModel.model.inputModel.setState(options3.modelInputState);
      }
      setModelPreservingInputTypedWhileLoading(this.widget, inputBeforeLoad, () => this.updateModel(editorModel.model));
      const viewState = this.loadEditorViewState(input, context2);
      if (viewState) {
        this._widget.restoreViewState(viewState);
      }
      if (isContributedChatSession && options3?.title?.preferred && input.sessionResource) {
        this.chatService.setChatSessionTitle(input.sessionResource, options3.title.preferred);
      }
    } catch (error) {
      this.hideLoadingInChatWidget();
      throw error;
    }
  }
  updateModel(model) {
    this.widget.setModel(model);
    if (this._editorContainer) {
      this._editorContainer.dataset.boundChatResource = model.sessionResource.toString();
    }
  }
  computeEditorViewState(resource) {
    if (!this._widget || !isEqual2(this._widget.viewModel?.sessionResource, resource)) {
      return void 0;
    }
    return this._widget.getViewState();
  }
  tracksEditorViewState(input) {
    return input instanceof ChatEditorInput;
  }
  toEditorViewStateResource(input) {
    return input.sessionResource;
  }
  layout(dimension, position2) {
    this.dimension = dimension;
    if (this.widget) {
      this.widget.layout(dimension.height, dimension.width);
    }
  }
};

ChatEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IChatSessionsService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IChatService),
  __decorateParam(8, ITextResourceConfigurationService),
  __decorateParam(9, IEditorService),
  __decorateParam(10, IEditorGroupsService)
], ChatEditor);
export { ChatEditor };
