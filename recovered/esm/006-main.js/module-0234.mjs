// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/url/electron-main/electronUrlListener.ts
import { __esm } from "./module-0000.mjs";
import { disposableTimeout, init_async } from "./module-0034.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { URI, init_uri } from "./module-0030.mjs";


// src/vs/platform/url/electron-main/electronUrlListener.ts
import { app as app10 } from "electron";

var ElectronURLListener;

var init_electronUrlListener = __esm({
  "src/vs/platform/url/electron-main/electronUrlListener.ts"() {
    init_async();
    init_event();
    init_lifecycle();
    init_platform();
    init_uri();
    ElectronURLListener = class extends Disposable {
      constructor(initialProtocolUrls, urlService, windowsMainService, environmentMainService, productService, logService) {
        super();
        this.urlService = urlService;
        this.logService = logService;
        this.uris = [];
        this.retryCount = 0;
        if (initialProtocolUrls) {
          logService.trace("ElectronURLListener initialUrisToHandle:", initialProtocolUrls.map((url) => url.originalUrl));
          this.uris = initialProtocolUrls;
        }
        if (isWindows2 && !environmentMainService.isPortable) {
          const windowsParameters = environmentMainService.isBuilt ? [] : [`"${environmentMainService.appRoot}"`];
          windowsParameters.push("--open-url", "--");
          app10.setAsDefaultProtocolClient(productService.urlProtocol, process.execPath, windowsParameters);
        }
        const onOpenElectronUrl = Event.map(
          Event.fromNodeEventEmitter(app10, "open-url", (event, url) => ({ event, url })),
          ({ event, url }) => {
            event.preventDefault();
            return url;
          }
        );
        this._register(onOpenElectronUrl((url) => {
          const uri = this.uriFromRawUrl(url);
          if (!uri) {
            return;
          }
          this.urlService.open(uri, { originalUrl: url });
        }));
        const isWindowReady = windowsMainService.getWindows().filter((window2) => window2.isReady).length > 0;
        if (isWindowReady) {
          logService.trace("ElectronURLListener: window is ready to handle URLs");
          this.flush();
        } else {
          logService.trace("ElectronURLListener: waiting for window to be ready to handle URLs...");
          this._register(Event.once(windowsMainService.onDidSignalReadyWindow)(() => this.flush()));
        }
      }
      uriFromRawUrl(url) {
        try {
          return URI.parse(url);
        } catch (e) {
          return void 0;
        }
      }
      async flush() {
        if (this.retryCount++ > 10) {
          this.logService.trace("ElectronURLListener#flush(): giving up after 10 retries");
          return;
        }
        this.logService.trace("ElectronURLListener#flush(): flushing URLs");
        const uris = [];
        for (const obj of this.uris) {
          const handled = await this.urlService.open(obj.uri, { originalUrl: obj.originalUrl });
          if (handled) {
            this.logService.trace("ElectronURLListener#flush(): URL was handled", obj.originalUrl);
          } else {
            this.logService.trace("ElectronURLListener#flush(): URL was not yet handled", obj.originalUrl);
            uris.push(obj);
          }
        }
        if (uris.length === 0) {
          return;
        }
        this.uris = uris;
        disposableTimeout(() => this.flush(), 500, this._store);
      }
    };
  }
});
export { app10, ElectronURLListener, init_electronUrlListener };
