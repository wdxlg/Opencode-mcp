// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatOutputItemRenderer.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ExtensionKeyedWebviewOriginStore, IWebviewService } from "./module-1043.mjs";
import { equalsIgnoreCase } from "./module-0030.mjs";
import { CancellationError } from "./module-0004.mjs";
import { Emitter } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { getWindow } from "./module-0075.mjs";
import { matchesMimeType } from "./module-0264.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { IExtensionService, isProposedApiEnabled } from "./module-0889.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IStorageService } from "./module-0512.mjs";
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";


// src/vs/workbench/contrib/chat/browser/chatOutputItemRenderer.ts
var IChatOutputRendererService = createDecorator("chatOutputRendererService");

var ChatOutputRendererService = class extends Disposable {
  constructor(_contextKeyService, _extensionService, _webviewService, _chatWidgetService, storageService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._extensionService = _extensionService;
    this._webviewService = _webviewService;
    this._chatWidgetService = _chatWidgetService;
    this._contributions = /* @__PURE__ */ new Map();
    this._renderers = /* @__PURE__ */ new Map();
    this._originStore = new ExtensionKeyedWebviewOriginStore("chatOutputRenderer.origins", storageService);
    this._register(chatOutputRenderContributionPoint.setHandler((extensions) => {
      this.updateContributions(extensions);
    }));
  }
  registerRenderer(viewType, renderer, options3) {
    this._renderers.set(viewType, { viewType, renderer, options: options3 });
    return {
      dispose: () => {
        this._renderers.delete(viewType);
      }
    };
  }
  hasCodeBlockRenderer(languageIdentifier) {
    return Array.from(this._contributions.values()).some((value2) => value2.codeBlockLanguageIdentifiers.some((identifier2) => equalsIgnoreCase(identifier2, languageIdentifier)));
  }
  async renderOutputPart(mime, data, parent, webviewOptions, token) {
    const rendererData = await this.getRendererForMime(mime, token);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    if (!rendererData) {
      throw new Error(`No renderer registered found for mime type: ${mime}`);
    }
    return this.doRenderOutputPart(rendererData, mime, data, {}, parent, webviewOptions, token);
  }
  async renderCodeBlock(languageIdentifier, data, parent, webviewOptions, token) {
    const rendererData = await this.getRendererForCodeBlock(languageIdentifier, token);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    if (!rendererData) {
      throw new Error(`No renderer registered found for code block language identifier: ${languageIdentifier}`);
    }
    return this.doRenderOutputPart(rendererData, "text/x-vscode-chat-code-block", data, { codeBlockContext: { languageIdentifier } }, parent, webviewOptions, token);
  }
  async doRenderOutputPart(rendererData, mime, data, context2, parent, webviewOptions, token) {
    const store = new DisposableStore();
    const webview = store.add(this._webviewService.createWebviewElement({
      title: webviewOptions.title ?? "",
      origin: this.getOrigin(rendererData),
      providedViewType: rendererData.viewType,
      options: {
        enableFindWidget: false,
        purpose: "chatOutputItem" /* ChatOutputItem */,
        tryRestoreScrollPosition: false
      },
      contentOptions: {},
      extension: rendererData.options.extension ? rendererData.options.extension : void 0
    }));
    webview.setContextKeyService(store.add(this._contextKeyService.createScoped(parent)));
    if (webviewOptions.chatSessionResource) {
      store.add(this.delegateScrollToChatWidget(webview, webviewOptions.chatSessionResource));
    }
    const onDidChangeHeight = store.add(new Emitter());
    store.add(autorun((reader) => {
      const height = reader.readObservable(webview.intrinsicContentSize);
      if (height) {
        onDidChangeHeight.fire(height.height);
        parent.style.height = `${height.height}px`;
      }
    }));
    if (webviewOptions.webviewState) {
      webview.state = webviewOptions.webviewState;
    }
    webview.mountTo(parent, getWindow(parent));
    await rendererData.renderer.renderOutputPart(mime, data, webview, context2, token);
    return {
      get webview() {
        return webview;
      },
      onDidChangeHeight: onDidChangeHeight.event,
      dispose: () => {
        store.dispose();
      },
      reinitialize: () => {
        webview.reinitializeAfterDismount();
      }
    };
  }
  delegateScrollToChatWidget(webview, chatSessionResource) {
    return webview.onDidWheel((e4) => {
      this._chatWidgetService.getWidgetBySessionResource(chatSessionResource)?.delegateScrollFromMouseWheelEvent({
        ...e4,
        preventDefault: () => {
        },
        stopPropagation: () => {
        }
      });
    });
  }
  getOrigin(rendererData) {
    return rendererData.options.extension ? this._originStore.getOrigin(rendererData.viewType, rendererData.options.extension.id) : void 0;
  }
  async getRendererForMime(mime, token) {
    return this.getRenderer((value2) => value2.mimes.some((m) => matchesMimeType(m, [mime])), token);
  }
  async getRendererForCodeBlock(languageIdentifier, token) {
    return this.getRenderer((value2) => value2.codeBlockLanguageIdentifiers.some((identifier2) => equalsIgnoreCase(identifier2, languageIdentifier)), token);
  }
  async getRenderer(matches2, token) {
    await raceCancellationError(this._extensionService.whenInstalledExtensionsRegistered(), token);
    for (const [id2, value2] of this._contributions) {
      if (matches2(value2)) {
        await raceCancellationError(this._extensionService.activateByEvent(`onChatOutputRenderer:${id2}`), token);
        const rendererData = this._renderers.get(id2);
        if (rendererData) {
          return rendererData;
        }
      }
    }
    return void 0;
  }
  updateContributions(extensions) {
    this._contributions.clear();
    for (const extension of extensions) {
      if (!isProposedApiEnabled(extension.description, "chatOutputRenderer")) {
        continue;
      }
      for (const contribution of extension.value) {
        if (this._contributions.has(contribution.viewType)) {
          extension.collector.error(`Chat output renderer with view type '${contribution.viewType}' already registered`);
          continue;
        }
        const mimeTypes = contribution.mimeTypes ?? [];
        const codeBlockLanguageIdentifiers = contribution.codeBlockLanguageIdentifiers ?? [];
        if (!mimeTypes.length && !codeBlockLanguageIdentifiers.length) {
          extension.collector.error(`Chat output renderer with view type '${contribution.viewType}' must specify at least one mime type or code block language identifier`);
          continue;
        }
        this._contributions.set(contribution.viewType, {
          mimes: mimeTypes,
          codeBlockLanguageIdentifiers
        });
      }
    }
  }
};

ChatOutputRendererService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IWebviewService),
  __decorateParam(3, IChatWidgetService),
  __decorateParam(4, IStorageService)
], ChatOutputRendererService);

var chatOutputRendererContributionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["viewType"],
  properties: {
    viewType: {
      type: "string",
      description: localize(10901, null)
    },
    mimeTypes: {
      type: "array",
      description: localize(10900, null),
      uniqueItems: true,
      items: {
        type: "string"
      }
    },
    codeBlockLanguageIdentifiers: {
      type: "array",
      description: localize(10899, null),
      uniqueItems: true,
      items: {
        type: "string"
      }
    }
  }
};

var chatOutputRenderContributionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "chatOutputRenderers",
  activationEventsGenerator: function* (contributions) {
    for (const contrib of contributions) {
      yield `onChatOutputRenderer:${contrib.viewType}`;
    }
  },
  jsonSchema: {
    description: localize(10902, null),
    type: "array",
    items: chatOutputRendererContributionSchema
  }
});
export { IChatOutputRendererService, ChatOutputRendererService, chatOutputRendererContributionSchema, chatOutputRenderContributionPoint };
