// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/webContentExtractor/electron-main/webContentExtractorService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Limiter, init_async } from "./module-0034.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IAgentNetworkFilterService, init_networkFilterService } from "./module-0351.mjs";
import { init_trustedDomains, isURLDomainTrusted } from "./module-0353.mjs";
import { WebContentCache, init_webContentCache } from "./module-0354.mjs";
import { WebPageLoader, init_webPageLoader } from "./module-0356.mjs";


// src/vs/platform/webContentExtractor/electron-main/webContentExtractorService.ts
import { BrowserWindow as BrowserWindow8 } from "electron";

var NativeWebContentExtractorService;

var init_webContentExtractorService = __esm({
  "src/vs/platform/webContentExtractor/electron-main/webContentExtractorService.ts"() {
    init_async();
    init_lifecycle();
    init_log();
    init_networkFilterService();
    init_trustedDomains();
    init_webContentCache();
    init_webPageLoader();
    NativeWebContentExtractorService = class extends Disposable {
      constructor(_logger, _agentNetworkFilterService) {
        super();
        this._logger = _logger;
        this._agentNetworkFilterService = _agentNetworkFilterService;
        // Only allow 3 windows to be opened at a time
        // to avoid overwhelming the system with too many processes.
        this._limiter = new Limiter(3);
        this._webContentsCache = new WebContentCache();
        this._register(this._agentNetworkFilterService.onDidChange(() => this._webContentsCache.clear()));
      }
      extract(uris, options) {
        if (uris.length === 0) {
          this._logger.info("No URIs provided for extraction");
          return Promise.resolve([]);
        }
        this._logger.info(`Extracting content from ${uris.length} URIs`);
        return Promise.all(uris.map((uri) => this._limiter.queue(() => this.doExtract(uri, options))));
      }
      async doExtract(uri, options) {
        const cached = this._webContentsCache.tryGet(uri, options);
        if (cached !== void 0) {
          this._logger.info(`Found cached content for ${uri.toString()}`);
          return cached;
        }
        const loader = new WebPageLoader(
          (options2) => new BrowserWindow8(options2),
          this._logger,
          uri,
          options,
          (uri2) => isURLDomainTrusted(uri2, options?.trustedDomains || []),
          this._agentNetworkFilterService
        );
        try {
          const result = await loader.load();
          this._webContentsCache.add(uri, options, result);
          return result;
        } finally {
          loader.dispose();
        }
      }
    };
    NativeWebContentExtractorService = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IAgentNetworkFilterService)
    ], NativeWebContentExtractorService);
  }
});
export { BrowserWindow8, NativeWebContentExtractorService, init_webContentExtractorService };
