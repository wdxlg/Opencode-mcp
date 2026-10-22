// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatMcpAppModel.ts
import { Disposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { observableValue } from "./module-0048.mjs";
import { Emitter } from "./module-0017.mjs";
import { IWebviewService, WebviewOriginStore } from "./module-1042.mjs";
import { McpToolCallUI } from "./module-2335.mjs";
import { localize } from "./module-0001.mjs";
import { getWindow } from "./module-0075.mjs";
import { autorun, autorunSelfDisposable } from "./module-0052.mjs";
import { softAssertNever } from "./module-0009.mjs";
import { hasKey, isDefined } from "./module-0010.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { McpApps } from "./module-2336.mjs";
import { generateUuid } from "./module-0190.mjs";
import { toAgentHostUri } from "./module-1000.mjs";
import { URI } from "./module-0032.mjs";
import { McpResourceURI } from "./module-1206.mjs";
import { isToolResultInputOutputDetails } from "./module-0990.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { basename2 } from "./module-0034.mjs";
import { hash } from "./module-0039.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IChatResponseResourceFileSystemProvider } from "./module-2030.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProductService } from "./module-0873.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatMcpAppModel.ts
var ORIGIN_STORE_KEY = "chatMcpApp.origins";

var ChatMcpAppModel = class extends Disposable {
  constructor(toolInvocation, renderData, _container, maxHeight, currentWidth, _instantiationService, _chatWidgetService, _webviewService, storageService, _chatResponseResourceFsProvider, _logService, _productService, _openerService) {
    super();
    this.toolInvocation = toolInvocation;
    this.renderData = renderData;
    this._container = _container;
    this._instantiationService = _instantiationService;
    this._chatWidgetService = _chatWidgetService;
    this._webviewService = _webviewService;
    this._chatResponseResourceFsProvider = _chatResponseResourceFsProvider;
    this._logService = _logService;
    this._productService = _productService;
    this._openerService = _openerService;
    /** Cancellation source for async operations */
    this._disposeCts = this._register(new CancellationTokenSource());
    /** Whether ui/initialize has been called and capabilities announced */
    this._announcedCapabilities = false;
    /** Latest CSP used for the frame */
    this._latestCsp = void 0;
    /** Observable for load state */
    this._loadState = observableValue(this, { status: "loading" });
    this.loadState = this._loadState;
    /** Event fired when height changes */
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    /** Accumulated download resource parts from ui/download-file calls */
    this._downloadParts = observableValue(this, []);
    this.downloadParts = this._downloadParts;
    this._originStore = new WebviewOriginStore(ORIGIN_STORE_KEY, storageService);
    this._webviewOrigin = this._computeWebviewOrigin();
    this._mcpToolCallUI = this._register(this._instantiationService.createInstance(McpToolCallUI, renderData));
    this._height = ChatMcpAppModel.heightCache.get(this.toolInvocation) ?? 300;
    this._webview = this._register(this._webviewService.createWebviewElement({
      origin: this._webviewOrigin,
      title: localize(12216, null),
      options: {
        purpose: "chatOutputItem" /* ChatOutputItem */,
        enableFindWidget: false,
        disableServiceWorker: true,
        retainContextWhenHidden: true
      },
      contentOptions: {
        allowMultipleAPIAcquire: true,
        allowScripts: true,
        allowForms: true
      },
      extension: void 0
    }));
    const targetWindow = getWindow(this._container);
    this._webview.mountTo(this._container, targetWindow);
    this.hostContext = this._mcpToolCallUI.hostContext.map((context2, reader) => ({
      ...context2,
      containerDimensions: {
        width: currentWidth.read(reader),
        maxHeight: maxHeight.read(reader)
      },
      toolCall: {
        toolCallId: this.toolInvocation.toolCallId,
        toolName: this.toolInvocation.toolId
      }
    }));
    this._register(autorun((reader) => {
      const context2 = this.hostContext.read(reader);
      if (this._announcedCapabilities) {
        this._sendNotification({
          method: "ui/notifications/host-context-changed",
          params: context2
        });
      }
    }));
    this._register(this._webview.onMessage(async ({ message }) => {
      await this._handleWebviewMessage(message);
    }));
    this._register(this._mcpToolCallUI.onNotification((n2) => {
      if (!this._announcedCapabilities) {
        return;
      }
      this._webview.postMessage({ jsonrpc: "2.0", method: n2.method, params: n2.params });
    }));
    this._loadContent();
  }
  static {
    this.heightCache = /* @__PURE__ */ new WeakMap();
  }
  static {
    /**
     * In-memory origin map for agent-host MCP servers. Agent-host server
     * ids embed the session id, so they're effectively single-use across
     * VS Code restarts — using {@link WebviewOriginStore} for them would
     * accumulate one persisted entry per agent-host session forever. The
     * in-memory map keeps origins stable for the lifetime of the app
     * (enough for webview state to persist across re-renders) without
     * touching application storage.
     */
    this._agentHostOrigins = /* @__PURE__ */ new Map();
  }
  /**
   * Gets the current height of the webview.
   */
  get height() {
    return this._height;
  }
  remount() {
    this._webview.reinitializeAfterDismount();
    this._announcedCapabilities = false;
  }
  /**
   * Retries loading the MCP App content.
   */
  retry() {
    this._loadState.set({ status: "loading" }, void 0);
    this._loadContent();
  }
  /**
   * Loads the MCP App content into the webview.
   */
  async _loadContent() {
    const token = this._disposeCts.token;
    try {
      const resourceContent = await this._mcpToolCallUI.loadResource(token);
      if (token.isCancellationRequested) {
        return;
      }
      const htmlWithCsp = this._injectPreamble(resourceContent);
      this._announcedCapabilities = false;
      this._latestCsp = resourceContent.csp;
      this._webview.setHtml(htmlWithCsp);
      this._loadState.set({ status: "loaded" }, void 0);
    } catch (error) {
      this._logService.error("[MCP App] Error loading app:", error);
      this._loadState.set({ status: "error", error }, void 0);
    }
  }
  /**
   * Injects a Content-Security-Policy meta tag into the HTML.
   */
  _injectPreamble({ html: html3, csp }) {
    const cleanDomains = (s) => (s?.join(" ") || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    const cspContent = `
			default-src 'none';
			script-src 'self' 'unsafe-inline' ${cleanDomains(csp?.resourceDomains)};
			style-src 'self' 'unsafe-inline' ${cleanDomains(csp?.resourceDomains)};
			connect-src 'self' ${cleanDomains(csp?.connectDomains)};
			img-src 'self' data: ${cleanDomains(csp?.resourceDomains)};
			font-src 'self' ${cleanDomains(csp?.resourceDomains)};
			media-src 'self' data: ${cleanDomains(csp?.resourceDomains)};
			frame-src ${cleanDomains(csp?.frameDomains) || `'none'`};
			object-src 'none';
			base-uri ${cleanDomains(csp?.baseUriDomains) || `'self'`};
		`;
    const cspTag = `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`;
    const postMessageRehoist = `
			<script>(() => {
				const api = acquireVsCodeApi();
				const setMessageSource = (obj, src) => new Proxy(obj, {
					get: (target, prop) => {
						if (prop === 'source')  {
							return src;
						}
						return target[prop];
					}
				});

				const wrappedFns = new WeakMap();

				let patchedPostMessage = (message, transfer) => api.postMessage(message, transfer);
				const wrap = target => new Proxy(target, {
					set: (obj, prop, value) => {
						if (prop === 'postMessage') {
							patchedPostMessage = (message, transfer) => value.call(target, message, transfer);
						} else {
							obj[prop] = value;
						}
						return true;
					},
					get: (obj, prop) => {
						if (prop === 'postMessage') {
							return patchedPostMessage;
						}
						return obj[prop];
					},
				});

				const originalAddEventListener = window.addEventListener.bind(window);
				window.addEventListener = (type, listener, options) => {
					if (type === 'message') {
						const originalListener = listener;
						const wrappedListener = (event) => {
							if (event.origin === document.location.origin && event.source !== window) { event = setMessageSource(event, window.parent); }
							originalListener(event);
						};
						wrappedFns.set(originalListener, wrappedListener);
						listener = wrappedListener;
					}

					return originalAddEventListener(type, listener, options);
				};

				const originalRemoveEventListener = window.removeEventListener.bind(window);
				window.removeEventListener = (type, listener, options) => {
					const wrappedListener = wrappedFns.get(listener) || listener;
					return originalRemoveEventListener(type, wrappedListener, options);
				};

				window.parent = wrap(window.parent);

				// Scroll boundary detection: bubble wheel events to parent when at scroll boundaries
				const shouldBubbleScroll = (event) => {
					// First check element-level scrolling (for elements with overflow: auto/scroll)
					for (let node = event.target; node; node = node.parentNode) {
						if (!(node instanceof Element)) {
							continue;
						}

						// Skip HTML and BODY - we check document-level scroll separately
						if (node === document.documentElement || node === document.body) {
							continue;
						}

						// Check if the element can actually scroll
						const overflow = window.getComputedStyle(node).overflowY;
						if (overflow === 'hidden' || overflow === 'visible') {
							continue;
						}

						// Scroll up: if there's content above (scrollTop > 0), don't bubble
						if (event.deltaY < 0 && node.scrollTop > 0) {
							return false;
						}

						// Scroll down: if there's content below, don't bubble
						if (event.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight) {
							// Account for rounding: scrollTop isn't rounded but scrollHeight/clientHeight are
							if (node.scrollHeight - node.scrollTop - node.clientHeight < 2) {
								continue;
							}
							return false;
						}
					}

					// Check document-level scrolling (works even with overflow: visible on html/body)
					const docEl = document.documentElement;
					const scrollTop = window.scrollY || docEl.scrollTop || document.body.scrollTop || 0;
					const scrollHeight = Math.max(docEl.scrollHeight, document.body.scrollHeight);
					const clientHeight = docEl.clientHeight;
					const scrollableDistance = scrollHeight - clientHeight;

					if (scrollableDistance > 2) {
						// Document is scrollable
						if (event.deltaY < 0 && scrollTop > 0) {
							return false;
						}
						if (event.deltaY > 0 && scrollTop < scrollableDistance - 2) {
							return false;
						}
					}

					return true;
				};

				window.addEventListener('wheel', (event) => {
					if (event.defaultPrevented || !shouldBubbleScroll(event)) {
						return;
					}
					api.postMessage({
						method: 'ui/notifications/sandbox-wheel',
						params: {
							deltaMode: event.deltaMode,
							deltaX: event.deltaX,
							deltaY: event.deltaY,
							deltaZ: event.deltaZ,
						}
					});
				}, { passive: true });
			})();</script>
		`;
    return this._prependToHead(html3, cspTag + postMessageRehoist);
  }
  _prependToHead(html3, content2) {
    const headMatch = html3.match(/<head[^>]*>/i);
    if (headMatch) {
      const insertIndex = headMatch.index + headMatch[0].length;
      return html3.slice(0, insertIndex) + "\n" + content2 + html3.slice(insertIndex);
    }
    const htmlMatch = html3.match(/<html[^>]*>/i);
    if (htmlMatch) {
      const insertIndex = htmlMatch.index + htmlMatch[0].length;
      return html3.slice(0, insertIndex) + "\n<head>" + content2 + "</head>" + html3.slice(insertIndex);
    }
    return `<!DOCTYPE html><html><head>${content2}</head><body>${html3}</body></html>`;
  }
  /**
   * Handles incoming JSON-RPC messages from the webview.
   */
  async _handleWebviewMessage(message) {
    const request2 = message;
    const token = this._disposeCts.token;
    try {
      let result = {};
      switch (request2.method) {
        case "ui/initialize":
          result = await this._handleInitialize(request2.params);
          break;
        case "tools/call":
          result = await this._handleToolsCall(request2.params, token);
          break;
        case "resources/read":
          result = await this._handleResourcesRead(request2.params, token);
          break;
        case "sampling/createMessage":
          result = await this._handleSamplingCreateMessage(request2.params, token);
          break;
        case "ping":
          break;
        case "ui/notifications/size-changed":
          this._handleSizeChanged(request2.params);
          break;
        case "ui/open-link":
          result = await this._handleOpenLink(request2.params);
          break;
        case "ui/download-file":
          result = await this._handleDownloadFile(request2.params);
          break;
        case "ui/request-display-mode":
          result = { mode: "inline" };
          break;
        case "ui/notifications/initialized":
          break;
        case "ui/message":
          result = await this._handleUiMessage(request2.params);
          break;
        case "ui/update-model-context":
          result = await this._handleUpdateModelContext(request2.params);
          break;
        case "notifications/message":
          await this._mcpToolCallUI.log(request2.params);
          break;
        case "ui/notifications/sandbox-wheel":
          this._handleSandboxWheel(request2.params);
          break;
        default: {
          softAssertNever(request2);
          const cast = request2;
          if (cast.id !== void 0) {
            await this._sendError(cast.id, -32601, `Method not found: ${cast.method}`);
          }
          return;
        }
      }
      if (hasKey(request2, { id: true })) {
        await this._sendResponse(request2.id, result);
      }
    } catch (error) {
      this._logService.error(`[MCP App] Error handling ${request2.method}:`, error);
      if (hasKey(request2, { id: true })) {
        const message2 = error instanceof Error ? error.message : String(error);
        await this._sendError(request2.id, -32e3, message2);
      }
    }
  }
  /**
   * Handles the ui/initialize request from the MCP App View.
   */
  async _handleInitialize(_params) {
    this._announcedCapabilities = true;
    let args2;
    try {
      args2 = JSON.parse(this.renderData.input);
    } catch {
      args2 = this.renderData.input;
    }
    const timeout2 = this._register(disposableTimeout(async () => {
      this._store.delete(timeout2);
      await this._sendNotification({
        method: "ui/notifications/tool-input",
        params: { arguments: args2 }
      });
      if (this.toolInvocation.kind === "toolInvocationSerialized") {
        this._sendToolResult(this.toolInvocation.resultDetails);
      } else if (this.toolInvocation.kind === "toolInvocation") {
        const invocation = this.toolInvocation;
        this._register(autorunSelfDisposable((reader) => {
          const state = invocation.state.read(reader);
          if (state.type === IChatToolInvocation.StateKind.Completed) {
            this._sendToolResult(state.resultDetails);
            reader.dispose();
          }
        }));
      }
    }));
    return {
      protocolVersion: McpApps.LATEST_PROTOCOL_VERSION,
      hostInfo: {
        name: this._productService.nameLong,
        version: this._productService.version
      },
      hostCapabilities: {
        openLinks: {},
        serverTools: { listChanged: true },
        serverResources: { listChanged: true },
        logging: {},
        sandbox: {
          csp: this._latestCsp,
          permissions: { clipboardWrite: {} }
        },
        updateModelContext: {
          audio: {},
          image: {},
          resourceLink: {},
          resource: {},
          structuredContent: {}
        },
        downloadFile: {}
      },
      hostContext: this.hostContext.get()
    };
  }
  /**
   * Sends the tool result notification when the result becomes available.
   */
  /**
   * Returns a stable identifier for the originating MCP server to use
   * as the webview origin key. Local servers use their definition id,
   * agent-host servers use the per-session `serverId`.
   */
  _serverOriginId() {
    return this.renderData.kind === "agentHost" ? this.renderData.serverId : this.renderData.serverDefinitionId;
  }
  /**
   * Picks a stable webview origin for this server. Local MCP servers
   * get a persisted origin via {@link WebviewOriginStore} since their
   * server-definition id is stable across VS Code restarts. Agent-host
   * servers fall back to the static in-memory {@link _agentHostOrigins}
   * map keyed by `serverId`, so origins are stable within the app
   * lifetime without leaking entries into application storage for
   * every session.
   */
  _computeWebviewOrigin() {
    if (this.renderData.kind !== "agentHost") {
      return this._originStore.getOrigin("mcpApp", this._serverOriginId());
    }
    const key3 = this._serverOriginId();
    let origin = ChatMcpAppModel._agentHostOrigins.get(key3);
    if (!origin) {
      origin = generateUuid();
      ChatMcpAppModel._agentHostOrigins.set(key3, origin);
    }
    return origin;
  }
  /**
   * Resolves a server-relative resource URI into a workbench URI.
   * - Local servers: wrap in {@link McpResourceURI.fromServer} so it
   *   resolves through the MCP filesystem provider.
   * - Agent-host servers: wrap with the originating connection authority
   *   so the URI resolves against the server that supplied it.
   */
  _resolveServerResourceUri(serverUri) {
    if (this.renderData.kind === "agentHost") {
      return toAgentHostUri(URI.parse(serverUri), this.renderData.connectionAuthority);
    }
    return McpResourceURI.fromServer({ id: this.renderData.serverDefinitionId, label: "" }, serverUri);
  }
  _sendToolResult(resultDetails) {
    if (isToolResultInputOutputDetails(resultDetails) && resultDetails.mcpOutput) {
      this._sendNotification({
        method: "ui/notifications/tool-result",
        params: resultDetails.mcpOutput
      });
    }
  }
  async _handleUiMessage(params) {
    const widget = this._chatWidgetService.getWidgetBySessionResource(this.renderData.sessionResource);
    if (!widget) {
      return { isError: true };
    }
    if (!isFalsyOrWhitespace(widget.getInput())) {
      return { isError: true };
    }
    widget.setInput(params.content.filter((c) => c.type === "text").map((c) => c.text).join("\n\n"));
    widget.attachmentModel.clearAndSetContext(...params.content.map((c, i2) => {
      const id2 = `mcpui-${i2}-${Date.now()}`;
      if (c.type === "image") {
        return { kind: "image", value: decodeBase64(c.data).buffer, id: id2, name: "Image" };
      } else if (c.type === "resource_link") {
        const uri5 = this._resolveServerResourceUri(c.uri);
        return { kind: "file", value: uri5, id: id2, name: basename2(uri5) };
      } else {
        return void 0;
      }
    }).filter(isDefined));
    widget.focusInput();
    return { isError: false };
  }
  async _handleUpdateModelContext(params) {
    const widget = this._chatWidgetService.getWidgetBySessionResource(this.renderData.sessionResource);
    if (!widget) {
      return {};
    }
    const idPrefix = `mcpui-context-${hash(this._serverOriginId())}-`;
    const toDelete = widget.attachmentModel.getAttachmentIDs();
    const idsToDelete = Array.from(toDelete).filter((id2) => id2.startsWith(idPrefix));
    const entries2 = [];
    let entryIndex = 0;
    if (params.content) {
      for (const block2 of params.content) {
        const id2 = `${idPrefix}${entryIndex++}`;
        if (block2.type === "image") {
          entries2.push({
            kind: "image",
            value: decodeBase64(block2.data).buffer,
            id: id2,
            name: "Image",
            mimeType: block2.mimeType
          });
        } else if (block2.type === "resource_link") {
          const uri5 = this._resolveServerResourceUri(block2.uri);
          entries2.push({
            kind: "file",
            value: uri5,
            id: id2,
            name: basename2(uri5)
          });
        } else if (block2.type === "text") {
          const preview = block2.text.replaceAll(/\s+/g, " ").trim();
          const truncateTo = 20;
          entries2.push({
            kind: "generic",
            value: block2.text,
            id: id2,
            tooltip: new MarkdownString().appendCodeblock("plaintext", block2.text),
            name: preview.length > truncateTo ? preview.slice(0, truncateTo) + "\u2026" : preview
          });
        }
      }
    }
    if (params.structuredContent && Object.keys(params.structuredContent).length > 0) {
      const id2 = `${idPrefix}structured`;
      const value2 = JSON.stringify(params.structuredContent, null, 2);
      entries2.push({
        kind: "generic",
        value: value2,
        tooltip: new MarkdownString().appendCodeblock("json", value2),
        id: id2,
        name: "UI Data"
      });
    }
    widget.attachmentModel.updateContext(idsToDelete, entries2);
    return {};
  }
  _handleSizeChanged(params) {
    if (params.height !== void 0 && params.height !== this._height) {
      this._height = params.height;
      ChatMcpAppModel.heightCache.set(this.toolInvocation, params.height);
      this._onDidChangeHeight.fire();
    }
  }
  _handleSandboxWheel(params) {
    let defaultPrevented = false;
    const evt = {
      wheelDeltaX: params.deltaX,
      wheelDeltaY: -params.deltaY,
      wheelDelta: Math.abs(params.deltaY),
      deltaX: params.deltaX,
      deltaY: -params.deltaY,
      deltaZ: params.deltaZ,
      deltaMode: params.deltaMode,
      preventDefault: () => {
        defaultPrevented = true;
      },
      stopPropagation: () => {
      },
      get defaultPrevented() {
        return defaultPrevented;
      }
    };
    const widget = this._chatWidgetService.getWidgetBySessionResource(this.renderData.sessionResource);
    widget?.delegateScrollFromMouseWheelEvent(evt);
  }
  async _handleDownloadFile(params) {
    const newParts = [];
    let hadError = false;
    for (const content2 of params.contents) {
      try {
        if (content2.type === "resource") {
          const resource = content2.resource;
          const parsed = URI.parse(resource.uri);
          const data = hasKey(resource, { text: true }) ? new TextEncoder().encode(resource.text) : { base64: resource.blob };
          const { resource: uri5 } = this._chatResponseResourceFsProvider.associate(data, { sessionResource: this.renderData.sessionResource, name: basename2(parsed) });
          newParts.push({ kind: "data", mimeType: resource.mimeType, uri: uri5 });
        } else if (content2.type === "resource_link") {
          const mcpUri = this._resolveServerResourceUri(content2.uri);
          newParts.push({ kind: "data", mimeType: content2.mimeType, uri: mcpUri });
        }
      } catch (error) {
        hadError = true;
        this._logService.warn("[MCP App] Failed to process ui/download-file content", error);
      }
    }
    if (newParts.length > 0) {
      const existing = this._downloadParts.get();
      this._downloadParts.set([...existing, ...newParts], void 0);
    }
    return hadError ? { isError: true } : {};
  }
  async _handleOpenLink(params) {
    let parsed;
    try {
      parsed = URI.parse(params.url, true);
    } catch {
      this._logService.warn(`[MCP App] Rejected ui/open-link with unparseable URL`);
      return { isError: true };
    }
    if (parsed.scheme !== "http" && parsed.scheme !== "https") {
      this._logService.warn(`[MCP App] Rejected ui/open-link with non-http(s) scheme: ${parsed.scheme}`);
      return { isError: true };
    }
    const ok2 = await this._openerService.open(parsed, { openExternal: true });
    return { isError: !ok2 };
  }
  /**
   * Handles tools/call requests from the MCP App.
   */
  async _handleToolsCall(params, token) {
    if (!params?.name) {
      throw new Error("Missing tool name in tools/call request");
    }
    return this._mcpToolCallUI.callTool(params.name, params.arguments || {}, token);
  }
  /**
   * Handles resources/read requests from the MCP App.
   */
  async _handleResourcesRead(params, token) {
    if (!params?.uri) {
      throw new Error("Missing uri in resources/read request");
    }
    return this._mcpToolCallUI.readResource(params.uri, token);
  }
  /**
   * Handles sampling/createMessage requests from the MCP App. Forwarded
   * to the host-side sampling implementation through the underlying
   * transport (typically an agent host that owns the MCP server).
   */
  async _handleSamplingCreateMessage(params, token) {
    if (!params) {
      throw new Error("Missing params in sampling/createMessage request");
    }
    return this._mcpToolCallUI.sampling(params, token);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _sendResponse(id2, result) {
    await this._webview.postMessage({
      jsonrpc: "2.0",
      id: id2,
      result
    });
  }
  async _sendError(id2, code, message) {
    await this._webview.postMessage({
      jsonrpc: "2.0",
      id: id2,
      error: { code, message }
    });
  }
  async _sendNotification(message) {
    await this._webview.postMessage({
      jsonrpc: "2.0",
      ...message
    });
  }
  dispose() {
    this._disposeCts.dispose(true);
    super.dispose();
  }
};

ChatMcpAppModel = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IChatWidgetService),
  __decorateParam(7, IWebviewService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IChatResponseResourceFileSystemProvider),
  __decorateParam(10, ILogService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IOpenerService)
], ChatMcpAppModel);
export { ORIGIN_STORE_KEY, ChatMcpAppModel };
