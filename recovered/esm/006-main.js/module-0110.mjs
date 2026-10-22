// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/native/electron-main/auth.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { CancellationToken, init_cancellation } from "./module-0022.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { hash, init_hash } from "./module-0067.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { BrowserSession, init_browserSession } from "./module-0089.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IEncryptionMainService, init_encryptionService } from "./module-0090.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { init_storage2 } from "./module-0079.mjs";
import { IApplicationStorageMainService, init_storageMainService } from "./module-0109.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";


// src/vs/platform/native/electron-main/auth.ts
import { app } from "electron";

var IProxyAuthService, ProxyAuthService;

var init_auth = __esm({
  "src/vs/platform/native/electron-main/auth.ts"() {
    init_cancellation();
    init_event();
    init_hash();
    init_lifecycle();
    init_uri();
    init_uuid();
    init_browserSession();
    init_configuration();
    init_encryptionService();
    init_environmentMainService();
    init_instantiation();
    init_log();
    init_storage2();
    init_storageMainService();
    init_windows();
    IProxyAuthService = createDecorator("proxyAuthService");
    ProxyAuthService = class extends Disposable {
      constructor(logService, windowsMainService, encryptionMainService, applicationStorageMainService, configurationService, environmentMainService) {
        super();
        this.logService = logService;
        this.windowsMainService = windowsMainService;
        this.encryptionMainService = encryptionMainService;
        this.applicationStorageMainService = applicationStorageMainService;
        this.configurationService = configurationService;
        this.environmentMainService = environmentMainService;
        this.PROXY_CREDENTIALS_SERVICE_KEY = "proxy-credentials://";
        this.pendingProxyResolves = /* @__PURE__ */ new Map();
        this.currentDialog = void 0;
        this.cancelledAuthInfoHashes = /* @__PURE__ */ new Set();
        this.sessionCredentials = /* @__PURE__ */ new Map();
        this.registerListeners();
      }
      registerListeners() {
        const onLogin = Event.fromNodeEventEmitter(app, "login", (event, webContents4, req, authInfo, callback) => ({ event, webContents: webContents4, authInfo: { ...authInfo, attempt: req.firstAuthAttempt ? 1 : 2 }, callback }));
        this._register(onLogin(this.onLogin, this));
      }
      async lookupAuthorization(authInfo) {
        return this.onLogin({ authInfo });
      }
      async onLogin({ event, webContents: webContents4, authInfo, callback }) {
        if (!authInfo.isProxy) {
          return;
        }
        if (webContents4 && BrowserSession.isBrowserViewWebContents(webContents4)) {
          return;
        }
        event?.preventDefault();
        const authInfoHash = String(hash({ scheme: authInfo.scheme, host: authInfo.host, port: authInfo.port }));
        let credentials = void 0;
        let pendingProxyResolve = this.pendingProxyResolves.get(authInfoHash);
        if (!pendingProxyResolve) {
          this.logService.trace("auth#onLogin (proxy) - no pending proxy handling found, starting new");
          pendingProxyResolve = this.resolveProxyCredentials(authInfo, authInfoHash);
          this.pendingProxyResolves.set(authInfoHash, pendingProxyResolve);
          try {
            credentials = await pendingProxyResolve;
          } finally {
            this.pendingProxyResolves.delete(authInfoHash);
          }
        } else {
          this.logService.trace("auth#onLogin (proxy) - pending proxy handling found");
          credentials = await pendingProxyResolve;
        }
        callback?.(credentials?.username, credentials?.password);
        return credentials;
      }
      async resolveProxyCredentials(authInfo, authInfoHash) {
        this.logService.trace("auth#resolveProxyCredentials (proxy) - enter");
        try {
          const credentials = await this.doResolveProxyCredentials(authInfo, authInfoHash);
          if (credentials) {
            this.logService.trace("auth#resolveProxyCredentials (proxy) - got credentials");
            return credentials;
          } else {
            this.logService.trace("auth#resolveProxyCredentials (proxy) - did not get credentials");
          }
        } finally {
          this.logService.trace("auth#resolveProxyCredentials (proxy) - exit");
        }
        return void 0;
      }
      async doResolveProxyCredentials(authInfo, authInfoHash) {
        this.logService.trace("auth#doResolveProxyCredentials - enter", authInfo);
        if (this.environmentMainService.extensionTestsLocationURI) {
          try {
            const decodedRealm = Buffer.from(authInfo.realm, "base64").toString("utf-8");
            if (decodedRealm.startsWith("{")) {
              return JSON.parse(decodedRealm);
            }
          } catch {
          }
          return void 0;
        }
        const newHttpProxy = (this.configurationService.getValue("http.proxy") || "").trim() || (process.env["https_proxy"] || process.env["HTTPS_PROXY"] || process.env["http_proxy"] || process.env["HTTP_PROXY"] || "").trim() || void 0;
        if (newHttpProxy?.indexOf("@") !== -1) {
          const uri = URI.parse(newHttpProxy);
          const i = uri.authority.indexOf("@");
          if (i !== -1) {
            if (authInfo.attempt > 1) {
              this.logService.trace("auth#doResolveProxyCredentials (proxy) - exit - ignoring previously used config/envvar credentials");
              return void 0;
            }
            this.logService.trace("auth#doResolveProxyCredentials (proxy) - exit - found config/envvar credentials to use");
            const credentials = uri.authority.substring(0, i);
            const j = credentials.indexOf(":");
            if (j !== -1) {
              return {
                username: credentials.substring(0, j),
                password: credentials.substring(j + 1)
              };
            } else {
              return {
                username: credentials,
                password: ""
              };
            }
          }
        }
        const sessionCredentials = authInfo.attempt === 1 && this.sessionCredentials.get(authInfoHash);
        if (sessionCredentials) {
          this.logService.trace("auth#doResolveProxyCredentials (proxy) - exit - found session credentials to use");
          const { username, password } = sessionCredentials;
          return { username, password };
        }
        let storedUsername;
        let storedPassword;
        try {
          const encryptedValue = this.applicationStorageMainService.get(this.PROXY_CREDENTIALS_SERVICE_KEY + authInfoHash, -1 /* APPLICATION */);
          if (encryptedValue) {
            const credentials = JSON.parse(await this.encryptionMainService.decrypt(encryptedValue));
            storedUsername = credentials.username;
            storedPassword = credentials.password;
          }
        } catch (error) {
          this.logService.error(error);
        }
        if (authInfo.attempt === 1 && typeof storedUsername === "string" && typeof storedPassword === "string") {
          this.logService.trace("auth#doResolveProxyCredentials (proxy) - exit - found stored credentials to use");
          this.sessionCredentials.set(authInfoHash, { username: storedUsername, password: storedPassword });
          return { username: storedUsername, password: storedPassword };
        }
        const previousDialog = this.currentDialog;
        const currentDialog = this.currentDialog = (async () => {
          await previousDialog;
          const credentials = await this.showProxyCredentialsDialog(authInfo, authInfoHash, storedUsername, storedPassword);
          if (this.currentDialog === currentDialog) {
            this.currentDialog = void 0;
          }
          return credentials;
        })();
        return currentDialog;
      }
      async showProxyCredentialsDialog(authInfo, authInfoHash, storedUsername, storedPassword) {
        if (this.cancelledAuthInfoHashes.has(authInfoHash)) {
          this.logService.trace("auth#doResolveProxyCredentials (proxy) - exit - login dialog was cancelled before, not showing again");
          return void 0;
        }
        const window2 = this.windowsMainService.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
        if (!window2) {
          this.logService.trace("auth#doResolveProxyCredentials (proxy) - exit - no opened window found to show dialog in");
          return void 0;
        }
        this.logService.trace(`auth#doResolveProxyCredentials (proxy) - asking window ${window2.id} to handle proxy login`);
        const sessionCredentials = this.sessionCredentials.get(authInfoHash);
        const payload = {
          authInfo,
          username: sessionCredentials?.username ?? storedUsername,
          // prefer to show already used username (if any) over stored
          password: sessionCredentials?.password ?? storedPassword,
          // prefer to show already used password (if any) over stored
          replyChannel: `vscode:proxyAuthResponse:${generateUuid()}`
        };
        window2.sendWhenReady("vscode:openProxyAuthenticationDialog", CancellationToken.None, payload);
        const loginDialogCredentials = await new Promise((resolve3) => {
          const proxyAuthResponseHandler = async (event, channel, reply) => {
            if (channel === payload.replyChannel) {
              this.logService.trace(`auth#doResolveProxyCredentials - exit - received credentials from window ${window2.id}`);
              window2.win?.webContents.off("ipc-message", proxyAuthResponseHandler);
              if (reply) {
                const credentials = { username: reply.username, password: reply.password };
                try {
                  if (reply.remember) {
                    const encryptedSerializedCredentials = await this.encryptionMainService.encrypt(JSON.stringify(credentials));
                    this.applicationStorageMainService.store(
                      this.PROXY_CREDENTIALS_SERVICE_KEY + authInfoHash,
                      encryptedSerializedCredentials,
                      -1 /* APPLICATION */,
                      // Always store in machine scope because we do not want these values to be synced
                      1 /* MACHINE */
                    );
                  } else {
                    this.applicationStorageMainService.remove(this.PROXY_CREDENTIALS_SERVICE_KEY + authInfoHash, -1 /* APPLICATION */);
                  }
                } catch (error) {
                  this.logService.error(error);
                }
                resolve3({ username: credentials.username, password: credentials.password });
              } else {
                this.cancelledAuthInfoHashes.add(authInfoHash);
                resolve3(void 0);
              }
            }
          };
          window2.win?.webContents.on("ipc-message", proxyAuthResponseHandler);
        });
        this.sessionCredentials.set(authInfoHash, loginDialogCredentials);
        return loginDialogCredentials;
      }
    };
    ProxyAuthService = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IWindowsMainService),
      __decorateParam(2, IEncryptionMainService),
      __decorateParam(3, IApplicationStorageMainService),
      __decorateParam(4, IConfigurationService),
      __decorateParam(5, IEnvironmentMainService)
    ], ProxyAuthService);
  }
});
export { app, IProxyAuthService, ProxyAuthService, init_auth };
