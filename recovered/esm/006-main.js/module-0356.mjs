// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/webContentExtractor/electron-main/webPageLoader.ts
import { __esm } from "./module-0000.mjs";
import { Queue, TimeoutTimer, init_async, raceTimeout } from "./module-0034.mjs";
import { CancellationTokenSource, init_cancellation } from "./module-0022.mjs";
import { createSingleCallFunction, init_functional } from "./module-0011.mjs";
import { Disposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { Schemas, init_network } from "./module-0031.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { convertAXTreeToMarkdown, init_cdpAccessibilityDomain } from "./module-0355.mjs";


// src/vs/platform/webContentExtractor/electron-main/webPageLoader.ts
var WebPageLoader;

var init_webPageLoader = __esm({
  "src/vs/platform/webContentExtractor/electron-main/webPageLoader.ts"() {
    init_async();
    init_cancellation();
    init_functional();
    init_lifecycle();
    init_network();
    init_uri();
    init_uuid();
    init_nls();
    init_cdpAccessibilityDomain();
    WebPageLoader = class _WebPageLoader extends Disposable {
      constructor(browserWindowFactory, _logger, _uri, _options, _isTrustedDomain, _agentNetworkFilterService) {
        super();
        this._logger = _logger;
        this._uri = _uri;
        this._options = _options;
        this._isTrustedDomain = _isTrustedDomain;
        this._agentNetworkFilterService = _agentNetworkFilterService;
        this._requests = /* @__PURE__ */ new Set();
        this._queue = this._register(new Queue());
        this._timeout = this._register(new TimeoutTimer());
        this._idleDebounceTimer = this._register(new TimeoutTimer());
        this._onResult = (_result) => {
        };
        this._didFinishLoad = false;
        this._receivedMarkdown = false;
        this._window = browserWindowFactory({
          width: 800,
          height: 600,
          show: false,
          webPreferences: {
            partition: generateUuid(),
            // do not share any state with the default renderer session
            javascript: true,
            offscreen: true,
            sandbox: true,
            webgl: false
          }
        });
        this._register(toDisposable(() => this._window.destroy()));
        this._window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
        this._debugger = this._window.webContents.debugger;
        this._debugger.attach("1.1");
        this._debugger.on("message", this.onDebugMessage.bind(this));
        this._window.webContents.once("did-start-loading", this.onStartLoading.bind(this)).once("did-finish-load", this.onFinishLoad.bind(this)).once("did-fail-load", this.onFailLoad.bind(this)).on("will-frame-navigate", this.onFrameNavigate.bind(this)).on("will-navigate", this.onRedirect.bind(this)).on("will-redirect", this.onRedirect.bind(this)).on("select-client-certificate", (event) => event.preventDefault());
        this._window.webContents.session.webRequest.onBeforeRequest(
          this.onBeforeRequest.bind(this)
        );
        this._window.webContents.session.webRequest.onBeforeSendHeaders(
          this.onBeforeSendHeaders.bind(this)
        );
        this._window.webContents.session.webRequest.onHeadersReceived(
          this.onHeadersReceived.bind(this)
        );
        this._window.webContents.session.on("will-download", this.onDownload.bind(this));
      }
      static {
        this.TIMEOUT = 3e4;
      }
      static {
        // 30 seconds
        this.POST_LOAD_TIMEOUT = 5e3;
      }
      static {
        // 5 seconds - increased for dynamic content
        this.FRAME_TIMEOUT = 500;
      }
      static {
        // 0.5 seconds
        this.EXTRACT_CONTENT_TIMEOUT = 2e3;
      }
      static {
        // 2 seconds
        this.IDLE_DEBOUNCE_TIME = 500;
      }
      static {
        // 0.5 seconds - wait after last network request
        this.MIN_CONTENT_LENGTH = 100;
      }
      trace(message) {
        this._logger.trace(`[WebPageLoader] [${this._uri}] ${message}`);
      }
      /**
       * Loads the web page and extracts its content.
       */
      async load() {
        return await new Promise((resolve3) => {
          this._onResult = createSingleCallFunction((result) => {
            switch (result.status) {
              case "ok":
                this.trace(`Loaded web page content, status: ${result.status}, title: '${result.title}', length: ${result.result.length}`);
                break;
              case "redirect":
                this.trace(`Loaded web page content, status: ${result.status}, toURI: ${result.toURI}`);
                break;
              case "error":
                this.trace(`Loaded web page content, status: ${result.status}, code: ${result.statusCode}, error: '${result.error}', title: '${result.title}', length: ${result.result?.length ?? 0}`);
                break;
            }
            const content = result.status !== "redirect" ? result.result : void 0;
            if (content !== void 0) {
              this.trace(content.length < 200 ? `Extracted content: '${content}'` : `Extracted content preview: '${content.substring(0, 200)}...'`);
            }
            resolve3(result);
            this.dispose();
          });
          this.trace(`Loading web page content`);
          void this._window.loadURL(this._uri.toString(true));
          this.setTimeout(_WebPageLoader.TIMEOUT);
        });
      }
      /**
       * Sets a timeout to trigger content extraction regardless of current loading state.
       */
      setTimeout(time) {
        if (this._store.isDisposed) {
          return;
        }
        this.trace(`Setting page load timeout to ${time} ms`);
        this._timeout.cancelAndSet(() => {
          this.trace(`Page load timeout reached`);
          void this._queue.queue(() => this.extractContent());
        }, time);
      }
      getUriPolicyError(url) {
        let uri;
        try {
          uri = URI.parse(url, true);
        } catch {
          return localize(3696, null);
        }
        if (uri.scheme === Schemas.http || uri.scheme === Schemas.https || uri.scheme === "ws" || uri.scheme === "wss") {
          return this._agentNetworkFilterService.isUriAllowed(uri) ? void 0 : this._agentNetworkFilterService.formatError(uri);
        }
        if (uri.scheme === "about" && uri.path === "blank" || uri.scheme === Schemas.data || uri.scheme === "blob") {
          return void 0;
        }
        return localize(3697, null, uri.scheme);
      }
      onBeforeRequest(details, callback) {
        const error = this.getUriPolicyError(details.url);
        if (error) {
          this.trace(`Blocking request to ${details.url}: ${error}`);
        }
        callback({ cancel: !!error });
      }
      /**
       * Updates HTTP headers for each web request.
       */
      onBeforeSendHeaders(details, callback) {
        const headers = { ...details.requestHeaders };
        headers["DNT"] = "1";
        headers["Sec-GPC"] = "1";
        if (details.resourceType === "mainFrame") {
          headers["Accept"] = "text/markdown, text/html;q=0.9, application/xhtml+xml;q=0.9, application/xml;q=0.8, */*;q=0.7";
        }
        callback({ requestHeaders: headers });
      }
      /**
       * Checks response headers for download-triggering Content-Disposition.
       * For text-based content types, replaces it with 'inline' so the content
       * is rendered and can be extracted. For binary content, cancels the response.
       */
      onHeadersReceived(details, callback) {
        const headers = details.responseHeaders;
        if (headers) {
          let hasAttachment = false;
          let attachmentHeaderName;
          let contentType;
          for (const name of Object.keys(headers)) {
            const lowerName = name.toLowerCase();
            if (lowerName === "content-disposition" && headers[name]?.some((v) => v.toLowerCase().includes("attachment"))) {
              hasAttachment = true;
              attachmentHeaderName = name;
            }
            if (lowerName === "content-type") {
              contentType = headers[name]?.[0]?.toLowerCase();
            }
          }
          if (details.resourceType === "mainFrame") {
            this._receivedMarkdown = contentType?.split(";")[0].trim() === "text/markdown";
            if (this._receivedMarkdown) {
              this.trace("Received text/markdown response, will extract document text content directly");
            }
          }
          if (hasAttachment && attachmentHeaderName) {
            if (this.isTextMimeType(contentType)) {
              this.trace(`Replacing Content-Disposition: attachment with inline for ${details.url} (content-type: ${contentType})`);
              headers[attachmentHeaderName] = ["inline"];
              callback({ responseHeaders: headers, cancel: false });
            } else {
              this.trace(`Blocked binary download (Content-Disposition: attachment, content-type: ${contentType}) for ${details.url}`);
              callback({ cancel: true });
            }
            return;
          }
        }
        callback({ cancel: false });
      }
      static {
        /**
         * Returns whether the given MIME type represents text-based content
         * that can be meaningfully rendered and extracted.
         */
        this.TEXT_MIME_TYPE_RE = /^(?:text\/|application\/(?:json|xml|xhtml\+xml|rss\+xml|atom\+xml|svg\+xml|javascript|ecmascript|x-yaml|yaml|toml|.*\+(?:xml|json))$)/;
      }
      isTextMimeType(contentType) {
        const mimeType = contentType?.split(";")[0].trim();
        return !!mimeType && _WebPageLoader.TEXT_MIME_TYPE_RE.test(mimeType);
      }
      /**
       * Handles the 'will-download' event, blocking any downloads.
       */
      onDownload(_event, item) {
        const filename = item.getFilename();
        this.trace(`Blocked download: ${filename}`);
        item.cancel();
        void this._queue.queue(() => this.extractContent({ status: "error", error: `Download not allowed: ${filename}` }));
      }
      /**
       * Handles the 'did-start-loading' event, enabling network tracking.
       */
      onStartLoading() {
        if (this._store.isDisposed) {
          return;
        }
        this.trace(`Received 'did-start-loading' event`);
        void this._debugger.sendCommand("Network.enable").catch(() => {
        });
      }
      /**
       * Handles the 'did-finish-load' event, checking for idle state
       * and updating timeout to allow for post-load activities.
       */
      onFinishLoad() {
        if (this._store.isDisposed) {
          return;
        }
        this.trace(`Received 'did-finish-load' event`);
        this._didFinishLoad = true;
        this.scheduleIdleCheck();
        this.setTimeout(_WebPageLoader.POST_LOAD_TIMEOUT);
      }
      /**
       * Handles the 'did-fail-load' event, reporting load failures.
       */
      onFailLoad(_event, statusCode, error) {
        if (this._store.isDisposed) {
          return;
        }
        this.trace(`Received 'did-fail-load' event, code: ${statusCode}, error: '${error}'`);
        if (statusCode === -3) {
          this.trace(`Ignoring ERR_ABORTED (-3) as it may be caused by CSP or other measures`);
          void this._queue.queue(() => this.extractContent());
        } else if (statusCode === -27) {
          this.trace(`Ignoring ERR_BLOCKED_BY_CLIENT (-27) as it may be caused by ad-blockers or similar extensions`);
          void this._queue.queue(() => this.extractContent());
        } else {
          void this._queue.queue(() => this.extractContent({ status: "error", statusCode, error }));
        }
      }
      /**
       * Handles the 'will-navigate' and 'will-redirect' events, managing redirects.
       */
      onRedirect(event, url) {
        if (this._store.isDisposed) {
          return;
        }
        this.trace(`Received 'will-navigate' or 'will-redirect' event, url: ${url}`);
        const policyError = this.getUriPolicyError(url);
        if (policyError) {
          this.trace(`Blocking navigation to ${url}: ${policyError}`);
          event.preventDefault();
          this._onResult({ status: "error", error: policyError });
          return;
        }
        const toURI = URI.parse(url);
        if (!this._options?.followRedirects) {
          if (this.normalizeAuthority(toURI.authority) === this.normalizeAuthority(this._uri.authority)) {
            return;
          }
          if (this._isTrustedDomain(toURI)) {
            return;
          }
          if (this._didFinishLoad) {
            this.trace(`Blocking post-load navigation to ${url} (likely ad/tracker script)`);
            event.preventDefault();
            return;
          }
          event.preventDefault();
          this._onResult({ status: "redirect", toURI });
        }
      }
      onFrameNavigate(details) {
        const policyError = this.getUriPolicyError(details.url);
        if (policyError) {
          this.trace(`Blocking frame navigation to ${details.url}: ${policyError}`);
          details.preventDefault();
        }
      }
      /**
       * Normalizes an authority by removing the 'www.' prefix if present.
       */
      normalizeAuthority(authority) {
        return authority.toLowerCase().replace(/^www\./, "");
      }
      /**
       * Handles debugger messages related to network requests, tracking their lifecycle.
       * @note DO NOT add logging to this function, microsoft.com will freeze when too many logs are generated
       */
      onDebugMessage(_event, method, params) {
        if (this._store.isDisposed) {
          return;
        }
        const { requestId, type: type3, response } = params;
        switch (method) {
          case "Network.requestWillBeSent":
            if (requestId !== void 0) {
              this._requests.add(requestId);
              this._idleDebounceTimer.cancel();
            }
            break;
          case "Network.loadingFinished":
          case "Network.loadingFailed":
            if (requestId !== void 0) {
              this._requests.delete(requestId);
              if (this._requests.size === 0 && this._didFinishLoad) {
                this.scheduleIdleCheck();
              }
            }
            break;
          case "Network.responseReceived":
            if (type3 === "Document") {
              const statusCode = response?.status ?? 0;
              if (statusCode >= 400) {
                const error = response?.statusText || `HTTP error ${statusCode}`;
                void this._queue.queue(() => this.extractContent({ status: "error", statusCode, error }));
              }
            }
            break;
        }
      }
      /**
       * Schedules an idle check after a debounce period to allow for bursts of network activity.
       * If idle is detected, proceeds to extract content.
       */
      scheduleIdleCheck() {
        if (this._store.isDisposed) {
          return;
        }
        this._idleDebounceTimer.cancelAndSet(async () => {
          if (this._store.isDisposed) {
            return;
          }
          await this.nextFrame();
          if (this._requests.size === 0) {
            this._queue.queue(() => this.extractContent());
          } else {
            this.trace(`New network requests detected, deferring content extraction`);
          }
        }, _WebPageLoader.IDLE_DEBOUNCE_TIME);
      }
      /**
       * Waits for a rendering frame to ensure the page had a chance to update.
       */
      async nextFrame() {
        if (this._store.isDisposed) {
          return;
        }
        await raceTimeout(
          new Promise((resolve3) => {
            try {
              this.trace(`Waiting for a frame to be rendered`);
              this._window.webContents.beginFrameSubscription(false, () => {
                try {
                  this.trace(`A frame has been rendered`);
                  this._window.webContents.endFrameSubscription();
                } catch {
                }
                resolve3();
              });
            } catch {
              resolve3();
            }
          }),
          _WebPageLoader.FRAME_TIMEOUT
        );
      }
      /**
       * Extracts the content of the loaded web page using the Accessibility domain and reports the result.
       */
      async extractContent(errorResult) {
        if (this._store.isDisposed) {
          return;
        }
        try {
          const title = this._window.webContents.getTitle();
          let result = "";
          const cts = new CancellationTokenSource();
          try {
            await raceTimeout((async () => {
              if (this._receivedMarkdown) {
                this.trace("Extracting markdown text content from document");
                result = await this._window.webContents.executeJavaScript('document.body?.textContent ?? document.documentElement?.textContent ?? ""') ?? "";
                return;
              }
              if (!cts.token.isCancellationRequested) {
                result = await this.extractAccessibilityTreeContent(cts.token) ?? "";
              }
              if (!cts.token.isCancellationRequested && result.length < _WebPageLoader.MIN_CONTENT_LENGTH) {
                this.trace(`Accessibility tree extraction yielded insufficient content, trying main DOM element extraction`);
                const domContent = await this.extractMainDomElementContent() ?? "";
                result = domContent.length > result.length ? domContent : result;
              }
            })(), _WebPageLoader.EXTRACT_CONTENT_TIMEOUT);
          } finally {
            cts.cancel();
            cts.dispose();
          }
          if (result.length === 0) {
            this._onResult({ status: "error", error: "Failed to extract meaningful content from the web page" });
          } else if (errorResult !== void 0) {
            this._onResult({ ...errorResult, result, title });
          } else {
            this._onResult({ status: "ok", result, title });
          }
        } catch (e) {
          if (errorResult !== void 0) {
            this._onResult(errorResult);
          } else {
            this._onResult({
              status: "error",
              error: e instanceof Error ? e.message : String(e)
            });
          }
        }
      }
      /**
       * Extracts content from the Accessibility tree of the loaded web page.
       * @param token Cancellation token to abort the operation.
       * @return The extracted content, or undefined if extraction fails or is cancelled.
       */
      async extractAccessibilityTreeContent(token) {
        this.trace(`Extracting content using Accessibility domain`);
        try {
          await this._debugger.sendCommand("Page.enable");
          if (token.isCancellationRequested) {
            return void 0;
          }
          const { frameTree } = await this._debugger.sendCommand("Page.getFrameTree");
          if (token.isCancellationRequested) {
            return void 0;
          }
          const frameNodes = [];
          const pendingFrameNodes = [frameTree];
          for (let i = 0; i < pendingFrameNodes.length; i++) {
            const frameNode = pendingFrameNodes[i];
            if (frameNode.frame.url && this.getUriPolicyError(frameNode.frame.url)) {
              this.trace(`Skipping blocked frame content from ${frameNode.frame.url}`);
              continue;
            }
            frameNodes.push(frameNode);
            pendingFrameNodes.push(...frameNode.childFrames ?? []);
          }
          const allNodes = [];
          for (const { frame } of frameNodes) {
            try {
              const { nodes } = await this._debugger.sendCommand("Accessibility.getFullAXTree", { frameId: frame.id });
              allNodes.push(...nodes);
              if (token.isCancellationRequested) {
                return void 0;
              }
            } catch {
            }
          }
          return convertAXTreeToMarkdown(this._uri, allNodes);
        } catch (error) {
          this.trace(`Accessibility tree extraction failed: ${error instanceof Error ? error.message : String(error)}`);
          return void 0;
        }
      }
      /**
       * Fallback method for extracting web page content when Accessibility tree extraction yields insufficient content.
       * Attempts to extract meaningful text content from the main DOM elements of the loaded web page.
       * @returns The extracted text content, or undefined if extraction fails.
       */
      async extractMainDomElementContent() {
        try {
          this.trace(`Extracting content from main DOM element`);
          return await this._window.webContents.executeJavaScript(`
				(() => {
					const selectors = ['main','article','[role="main"]','.main-content','#main-content','.article-body','.post-content','.entry-content','.content','body'];
					for (const selector of selectors) {
						const content = document.querySelector(selector)?.textContent?.replace(/[ \\t]+/g, ' ').replace(/\\s{2,}/gm, '\\n').trim();
						if (content && content.length > ${_WebPageLoader.MIN_CONTENT_LENGTH}) {
							return content;
						}
					}
					return undefined;
				})();
			`);
        } catch (error) {
          this.trace(`DOM extraction failed: ${error instanceof Error ? error.message : String(error)}`);
          return void 0;
        }
      }
    };
  }
});
export { WebPageLoader, init_webPageLoader };
