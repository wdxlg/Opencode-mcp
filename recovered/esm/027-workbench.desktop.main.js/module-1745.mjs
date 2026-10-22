// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncStoreService.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { HEADER_EXECUTION_ID, HEADER_OPERATION_ID, IUserDataSyncLogService, IUserDataSyncStoreManagementService, SYNC_SERVICE_URL_TYPE, UserDataSyncStoreError } from "./module-1696.mjs";
import { isWeb } from "./module-0014.mjs";
import { isObject, isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { getServiceMachineId } from "./module-0889.mjs";
import { joinPath, relativePath } from "./module-0034.mjs";
import { createCancelablePromise, timeout } from "./module-0036.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asJson, asText, asTextOrError, hasNoContent, isSuccess } from "./module-0946.mjs";
import { Mimes } from "./module-0136.mjs";
import { getErrorMessage, isCancellationError } from "./module-0004.mjs";
import { generateUuid } from "./module-0190.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/platform/userDataSync/common/userDataSyncStoreService.ts
var CONFIGURATION_SYNC_STORE_KEY = "configurationSync.store";

var SYNC_PREVIOUS_STORE = "sync.previous.store";

var DONOT_MAKE_REQUESTS_UNTIL_KEY = "sync.donot-make-requests-until";

var USER_SESSION_ID_KEY = "sync.user-session-id";

var MACHINE_SESSION_ID_KEY = "sync.machine-session-id";

var REQUEST_SESSION_LIMIT = 100;

var REQUEST_SESSION_INTERVAL = 1e3 * 60 * 5;

var AbstractUserDataSyncStoreManagementService = class extends Disposable {
  constructor(productService, configurationService, storageService) {
    super();
    this.productService = productService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this._onDidChangeUserDataSyncStore = this._register(new Emitter());
    this.onDidChangeUserDataSyncStore = this._onDidChangeUserDataSyncStore.event;
    this.updateUserDataSyncStore();
    const disposable = this._register(new DisposableStore());
    this._register(Event2.filter(storageService.onDidChangeValue(-1 /* APPLICATION */, SYNC_SERVICE_URL_TYPE, disposable), () => this.userDataSyncStoreType !== this.userDataSyncStore?.type, disposable)(() => this.updateUserDataSyncStore()));
  }
  get userDataSyncStore() {
    return this._userDataSyncStore;
  }
  get userDataSyncStoreType() {
    return this.storageService.get(SYNC_SERVICE_URL_TYPE, -1 /* APPLICATION */);
  }
  set userDataSyncStoreType(type) {
    this.storageService.store(SYNC_SERVICE_URL_TYPE, type, -1 /* APPLICATION */, isWeb ? 0 /* USER */ : 1 /* MACHINE */);
  }
  updateUserDataSyncStore() {
    this._userDataSyncStore = this.toUserDataSyncStore(this.productService[CONFIGURATION_SYNC_STORE_KEY]);
    this._onDidChangeUserDataSyncStore.fire();
  }
  toUserDataSyncStore(configurationSyncStore) {
    if (!configurationSyncStore) {
      return void 0;
    }
    configurationSyncStore = isWeb && configurationSyncStore.web ? { ...configurationSyncStore, ...configurationSyncStore.web } : configurationSyncStore;
    if (isString(configurationSyncStore.url) && isObject(configurationSyncStore.authenticationProviders) && Object.keys(configurationSyncStore.authenticationProviders).every((authenticationProviderId) => Array.isArray(configurationSyncStore.authenticationProviders[authenticationProviderId].scopes))) {
      const syncStore = configurationSyncStore;
      const canSwitch = !!syncStore.canSwitch;
      const defaultType = syncStore.url === syncStore.insidersUrl ? "insiders" : "stable";
      const type = (canSwitch ? this.userDataSyncStoreType : void 0) || defaultType;
      const url = type === "insiders" ? syncStore.insidersUrl : type === "stable" ? syncStore.stableUrl : syncStore.url;
      return {
        url: URI.parse(url),
        type,
        defaultType,
        defaultUrl: URI.parse(syncStore.url),
        stableUrl: URI.parse(syncStore.stableUrl),
        insidersUrl: URI.parse(syncStore.insidersUrl),
        canSwitch,
        authenticationProviders: Object.keys(syncStore.authenticationProviders).reduce((result, id2) => {
          result.push({ id: id2, scopes: syncStore.authenticationProviders[id2].scopes });
          return result;
        }, [])
      };
    }
    return void 0;
  }
};

AbstractUserDataSyncStoreManagementService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService)
], AbstractUserDataSyncStoreManagementService);

var UserDataSyncStoreManagementService = class extends AbstractUserDataSyncStoreManagementService {
  constructor(productService, configurationService, storageService) {
    super(productService, configurationService, storageService);
    const previousConfigurationSyncStore = this.storageService.get(SYNC_PREVIOUS_STORE, -1 /* APPLICATION */);
    if (previousConfigurationSyncStore) {
      this.previousConfigurationSyncStore = JSON.parse(previousConfigurationSyncStore);
    }
    const syncStore = this.productService[CONFIGURATION_SYNC_STORE_KEY];
    if (syncStore) {
      this.storageService.store(SYNC_PREVIOUS_STORE, JSON.stringify(syncStore), -1 /* APPLICATION */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(SYNC_PREVIOUS_STORE, -1 /* APPLICATION */);
    }
  }
  async switch(type) {
    if (type !== this.userDataSyncStoreType) {
      this.userDataSyncStoreType = type;
      this.updateUserDataSyncStore();
    }
  }
  async getPreviousUserDataSyncStore() {
    return this.toUserDataSyncStore(this.previousConfigurationSyncStore);
  }
};

UserDataSyncStoreManagementService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService)
], UserDataSyncStoreManagementService);

var UserDataSyncStoreClient = class extends Disposable {
  constructor(userDataSyncStoreUrl, productService, requestService, logService, environmentService, fileService, storageService) {
    super();
    this.requestService = requestService;
    this.logService = logService;
    this.storageService = storageService;
    this._onTokenFailed = this._register(new Emitter());
    this.onTokenFailed = this._onTokenFailed.event;
    this._onTokenSucceed = this._register(new Emitter());
    this.onTokenSucceed = this._onTokenSucceed.event;
    this._donotMakeRequestsUntil = void 0;
    this._onDidChangeDonotMakeRequestsUntil = this._register(new Emitter());
    this.onDidChangeDonotMakeRequestsUntil = this._onDidChangeDonotMakeRequestsUntil.event;
    this.resetDonotMakeRequestsUntilPromise = void 0;
    this.updateUserDataSyncStoreUrl(userDataSyncStoreUrl);
    this.commonHeadersPromise = getServiceMachineId(environmentService, fileService, storageService).then((uuid) => {
      const headers = {
        "X-Client-Name": `${productService.applicationName}${isWeb ? "-web" : ""}`,
        "X-Client-Version": productService.version
      };
      if (productService.commit) {
        headers["X-Client-Commit"] = productService.commit;
      }
      return headers;
    });
    this.session = new RequestsSession(REQUEST_SESSION_LIMIT, REQUEST_SESSION_INTERVAL, this.requestService, this.logService);
    this.initDonotMakeRequestsUntil();
    this._register(toDisposable(() => {
      if (this.resetDonotMakeRequestsUntilPromise) {
        this.resetDonotMakeRequestsUntilPromise.cancel();
        this.resetDonotMakeRequestsUntilPromise = void 0;
      }
    }));
  }
  get donotMakeRequestsUntil() {
    return this._donotMakeRequestsUntil;
  }
  setAuthToken(token, type) {
    this.authToken = { token, type };
  }
  updateUserDataSyncStoreUrl(userDataSyncStoreUrl) {
    this.userDataSyncStoreUrl = userDataSyncStoreUrl ? joinPath(userDataSyncStoreUrl, "v1") : void 0;
  }
  initDonotMakeRequestsUntil() {
    const donotMakeRequestsUntil = this.storageService.getNumber(DONOT_MAKE_REQUESTS_UNTIL_KEY, -1 /* APPLICATION */);
    if (donotMakeRequestsUntil && Date.now() < donotMakeRequestsUntil) {
      this.setDonotMakeRequestsUntil(new Date(donotMakeRequestsUntil));
    }
  }
  setDonotMakeRequestsUntil(donotMakeRequestsUntil) {
    if (this._donotMakeRequestsUntil?.getTime() !== donotMakeRequestsUntil?.getTime()) {
      this._donotMakeRequestsUntil = donotMakeRequestsUntil;
      if (this.resetDonotMakeRequestsUntilPromise) {
        this.resetDonotMakeRequestsUntilPromise.cancel();
        this.resetDonotMakeRequestsUntilPromise = void 0;
      }
      if (this._donotMakeRequestsUntil) {
        this.storageService.store(DONOT_MAKE_REQUESTS_UNTIL_KEY, this._donotMakeRequestsUntil.getTime(), -1 /* APPLICATION */, 1 /* MACHINE */);
        this.resetDonotMakeRequestsUntilPromise = createCancelablePromise((token) => timeout(this._donotMakeRequestsUntil.getTime() - Date.now(), token).then(() => this.setDonotMakeRequestsUntil(void 0)));
        this.resetDonotMakeRequestsUntilPromise.then(
          null,
          (e) => null
          /* ignore error */
        );
      } else {
        this.storageService.remove(DONOT_MAKE_REQUESTS_UNTIL_KEY, -1 /* APPLICATION */);
      }
      this._onDidChangeDonotMakeRequestsUntil.fire();
    }
  }
  // #region Collection
  async getAllCollections(headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.userDataSyncStoreUrl, "collection").toString();
    headers = { ...headers };
    headers["Content-Type"] = "application/json";
    const context2 = await this.request(url, { type: "GET", headers, callSite: "userDataSync.getAllCollections" }, [], CancellationToken.None);
    return (await asJson(context2))?.map(({ id: id2 }) => id2) || [];
  }
  async createCollection(headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.userDataSyncStoreUrl, "collection").toString();
    headers = { ...headers };
    headers["Content-Type"] = Mimes.text;
    const context2 = await this.request(url, { type: "POST", headers, callSite: "userDataSync.createCollection" }, [], CancellationToken.None);
    const collectionId = await asTextOrError(context2);
    if (!collectionId) {
      throw new UserDataSyncStoreError("Server did not return the collection id", url, "NoCollection" /* NoCollection */, context2.res.statusCode, context2.res.headers[HEADER_OPERATION_ID]);
    }
    return collectionId;
  }
  async deleteCollection(collection, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = collection ? joinPath(this.userDataSyncStoreUrl, "collection", collection).toString() : joinPath(this.userDataSyncStoreUrl, "collection").toString();
    headers = { ...headers };
    await this.request(url, { type: "DELETE", headers, callSite: "userDataSync.deleteCollection" }, [], CancellationToken.None);
  }
  // #endregion
  // #region Resource
  async getAllResourceRefs(resource, collection) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const uri5 = this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource);
    const headers = {};
    const context2 = await this.request(uri5.toString(), { type: "GET", headers, callSite: "userDataSync.getAllResourceRefs" }, [], CancellationToken.None);
    const result = await asJson(context2) || [];
    return result.map(({ url, created }) => ({
      ref: relativePath(uri5, uri5.with({ path: url })),
      created: created * 1e3
      /* Server returns in seconds */
    }));
  }
  async resolveResourceContent(resource, ref, collection, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource), ref).toString();
    headers = { ...headers };
    headers["Cache-Control"] = "no-cache";
    const context2 = await this.request(url, { type: "GET", headers, callSite: "userDataSync.resolveResourceContent" }, [], CancellationToken.None);
    const content2 = await asTextOrError(context2);
    return content2;
  }
  async deleteResource(resource, ref, collection) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = ref !== null ? joinPath(this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource), ref).toString() : this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource).toString();
    const headers = {};
    await this.request(url, { type: "DELETE", headers, callSite: "userDataSync.deleteResource" }, [], CancellationToken.None);
  }
  async deleteResources() {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.userDataSyncStoreUrl, "resource").toString();
    const headers = { "Content-Type": Mimes.text };
    await this.request(url, { type: "DELETE", headers, callSite: "userDataSync.deleteResources" }, [], CancellationToken.None);
  }
  async readResource(resource, oldValue, collection, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource), "latest").toString();
    headers = { ...headers };
    headers["Cache-Control"] = "no-cache";
    if (oldValue) {
      headers["If-None-Match"] = oldValue.ref;
    }
    const context2 = await this.request(url, { type: "GET", headers, callSite: "userDataSync.readResource" }, [304], CancellationToken.None);
    let userData = null;
    if (context2.res.statusCode === 304) {
      userData = oldValue;
    }
    if (userData === null) {
      const ref = context2.res.headers["etag"];
      if (!ref) {
        throw new UserDataSyncStoreError("Server did not return the ref", url, "NoRef" /* NoRef */, context2.res.statusCode, context2.res.headers[HEADER_OPERATION_ID]);
      }
      const content2 = await asTextOrError(context2);
      if (!content2 && context2.res.statusCode === 304) {
        throw new UserDataSyncStoreError("Empty response", url, "EmptyResponse" /* EmptyResponse */, context2.res.statusCode, context2.res.headers[HEADER_OPERATION_ID]);
      }
      userData = { ref, content: content2 };
    }
    return userData;
  }
  async writeResource(resource, data, ref, collection, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource).toString();
    headers = { ...headers };
    headers["Content-Type"] = Mimes.text;
    if (ref) {
      headers["If-Match"] = ref;
    }
    const context2 = await this.request(url, { type: "POST", data, headers, callSite: "userDataSync.writeResource" }, [], CancellationToken.None);
    const newRef = context2.res.headers["etag"];
    if (!newRef) {
      throw new UserDataSyncStoreError("Server did not return the ref", url, "NoRef" /* NoRef */, context2.res.statusCode, context2.res.headers[HEADER_OPERATION_ID]);
    }
    return newRef;
  }
  // #endregion
  async manifest(oldValue, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.userDataSyncStoreUrl, "manifest").toString();
    headers = { ...headers };
    headers["Content-Type"] = "application/json";
    if (oldValue) {
      headers["If-None-Match"] = oldValue.ref;
    }
    const context2 = await this.request(url, { type: "GET", headers, callSite: "userDataSync.manifest" }, [304], CancellationToken.None);
    let manifest = null;
    if (context2.res.statusCode === 304) {
      manifest = oldValue;
    }
    if (!manifest) {
      const ref = context2.res.headers["etag"];
      if (!ref) {
        throw new UserDataSyncStoreError("Server did not return the ref", url, "NoRef" /* NoRef */, context2.res.statusCode, context2.res.headers[HEADER_OPERATION_ID]);
      }
      const content2 = await asTextOrError(context2);
      if (!content2 && context2.res.statusCode === 304) {
        throw new UserDataSyncStoreError("Empty response", url, "EmptyResponse" /* EmptyResponse */, context2.res.statusCode, context2.res.headers[HEADER_OPERATION_ID]);
      }
      if (content2) {
        manifest = { ...JSON.parse(content2), ref };
      }
    }
    const currentSessionId = this.storageService.get(USER_SESSION_ID_KEY, -1 /* APPLICATION */);
    if (currentSessionId && manifest && currentSessionId !== manifest.session) {
      this.clearSession();
    }
    if (manifest === null && currentSessionId) {
      this.clearSession();
    }
    if (manifest) {
      this.storageService.store(USER_SESSION_ID_KEY, manifest.session, -1 /* APPLICATION */, 1 /* MACHINE */);
    }
    return manifest;
  }
  async clear() {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    await this.deleteCollection();
    await this.deleteResources();
    this.clearSession();
  }
  async getLatestData(headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.userDataSyncStoreUrl, "download", "latest").toString();
    headers = { ...headers };
    headers["Content-Type"] = "application/json";
    const context2 = await this.request(url, { type: "GET", headers, callSite: "userDataSync.getLatestData" }, [], CancellationToken.None);
    if (!isSuccess(context2)) {
      throw new UserDataSyncStoreError("Server returned " + context2.res.statusCode, url, "EmptyResponse" /* EmptyResponse */, context2.res.statusCode, context2.res.headers[HEADER_OPERATION_ID]);
    }
    const serverData = await asJson(context2);
    if (!serverData) {
      return null;
    }
    const result = {};
    if (serverData.resources) {
      result.resources = {};
      for (const resource in serverData.resources) {
        const [resourceData] = serverData.resources[resource];
        result.resources[resource] = {
          content: resourceData.content,
          ref: resourceData.ref
        };
      }
    }
    if (serverData.collections) {
      result.collections = {};
      for (const collection in serverData.collections) {
        const resources = {};
        result.collections[collection] = { resources };
        for (const resource in serverData.collections[collection].resources) {
          const [resourceData] = serverData.collections[collection].resources[resource];
          resources[resource] = {
            content: resourceData.content,
            ref: resourceData.ref
          };
        }
      }
    }
    return result;
  }
  async getActivityData() {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.userDataSyncStoreUrl, "download").toString();
    const headers = {};
    const context2 = await this.request(url, { type: "GET", headers, callSite: "userDataSync.getActivityData" }, [], CancellationToken.None);
    if (!isSuccess(context2)) {
      throw new UserDataSyncStoreError("Server returned " + context2.res.statusCode, url, "EmptyResponse" /* EmptyResponse */, context2.res.statusCode, context2.res.headers[HEADER_OPERATION_ID]);
    }
    if (hasNoContent(context2)) {
      throw new UserDataSyncStoreError("Empty response", url, "EmptyResponse" /* EmptyResponse */, context2.res.statusCode, context2.res.headers[HEADER_OPERATION_ID]);
    }
    return context2.stream;
  }
  getResourceUrl(userDataSyncStoreUrl, collection, resource) {
    return collection ? joinPath(userDataSyncStoreUrl, "collection", collection, "resource", resource) : joinPath(userDataSyncStoreUrl, "resource", resource);
  }
  clearSession() {
    this.storageService.remove(USER_SESSION_ID_KEY, -1 /* APPLICATION */);
    this.storageService.remove(MACHINE_SESSION_ID_KEY, -1 /* APPLICATION */);
  }
  async request(url, options3, successCodes, token) {
    if (!this.authToken) {
      throw new UserDataSyncStoreError("No Auth Token Available", url, "Unauthorized" /* Unauthorized */, void 0, void 0);
    }
    if (this._donotMakeRequestsUntil && Date.now() < this._donotMakeRequestsUntil.getTime()) {
      throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because of too many requests (429).`, url, "TooManyRequestsAndRetryAfter" /* TooManyRequestsAndRetryAfter */, void 0, void 0);
    }
    this.setDonotMakeRequestsUntil(void 0);
    const commonHeaders = await this.commonHeadersPromise;
    options3.headers = {
      ...options3.headers || {},
      ...commonHeaders,
      "X-Account-Type": this.authToken.type,
      "authorization": `Bearer ${this.authToken.token}`
    };
    this.addSessionHeaders(options3.headers);
    this.logService.trace("Sending request to server", { url, type: options3.type, headers: { ...options3.headers, ...{ authorization: void 0 } } });
    let context2;
    try {
      context2 = await this.session.request(url, options3, token);
    } catch (e) {
      if (!(e instanceof UserDataSyncStoreError)) {
        let code = "RequestFailed" /* RequestFailed */;
        const errorMessage = getErrorMessage(e).toLowerCase();
        if (errorMessage.includes("xhr timeout")) {
          code = "RequestTimeout" /* RequestTimeout */;
        } else if (errorMessage.includes("protocol") && errorMessage.includes("not supported")) {
          code = "RequestProtocolNotSupported" /* RequestProtocolNotSupported */;
        } else if (errorMessage.includes("request path contains unescaped characters")) {
          code = "RequestPathNotEscaped" /* RequestPathNotEscaped */;
        } else if (errorMessage.includes("headers must be an object")) {
          code = "RequestHeadersNotObject" /* RequestHeadersNotObject */;
        } else if (isCancellationError(e)) {
          code = "RequestCanceled" /* RequestCanceled */;
        }
        e = new UserDataSyncStoreError(`Connection refused for the request '${url}'.`, url, code, void 0, void 0);
      }
      this.logService.info("Request failed", url);
      throw e;
    }
    const operationId = context2.res.headers[HEADER_OPERATION_ID];
    const requestInfo = { url, status: context2.res.statusCode, "execution-id": options3.headers[HEADER_EXECUTION_ID], "operation-id": operationId };
    const isSuccess2 = isSuccess(context2) || context2.res.statusCode && successCodes.includes(context2.res.statusCode);
    let failureMessage = "";
    if (isSuccess2) {
      this.logService.trace("Request succeeded", requestInfo);
    } else {
      failureMessage = await asText(context2) || "";
      this.logService.info("Request failed", requestInfo, failureMessage);
    }
    if (context2.res.statusCode === 401 || context2.res.statusCode === 403) {
      this.authToken = void 0;
      if (context2.res.statusCode === 401) {
        this._onTokenFailed.fire("Unauthorized" /* Unauthorized */);
        throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because of Unauthorized (401).`, url, "Unauthorized" /* Unauthorized */, context2.res.statusCode, operationId);
      }
      if (context2.res.statusCode === 403) {
        this._onTokenFailed.fire("Forbidden" /* Forbidden */);
        throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because the access is forbidden (403).`, url, "Forbidden" /* Forbidden */, context2.res.statusCode, operationId);
      }
    }
    this._onTokenSucceed.fire();
    if (context2.res.statusCode === 404) {
      throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because the requested resource is not found (404).`, url, "NotFound" /* NotFound */, context2.res.statusCode, operationId);
    }
    if (context2.res.statusCode === 405) {
      throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because the requested endpoint is not found (405). ${failureMessage}`, url, "MethodNotFound" /* MethodNotFound */, context2.res.statusCode, operationId);
    }
    if (context2.res.statusCode === 409) {
      throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because of Conflict (409). There is new data for this resource. Make the request again with latest data.`, url, "Conflict" /* Conflict */, context2.res.statusCode, operationId);
    }
    if (context2.res.statusCode === 410) {
      throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because the requested resource is not longer available (410).`, url, "Gone" /* Gone */, context2.res.statusCode, operationId);
    }
    if (context2.res.statusCode === 412) {
      throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because of Precondition Failed (412). There is new data for this resource. Make the request again with latest data.`, url, "PreconditionFailed" /* PreconditionFailed */, context2.res.statusCode, operationId);
    }
    if (context2.res.statusCode === 413) {
      throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because of too large payload (413).`, url, "TooLarge" /* TooLarge */, context2.res.statusCode, operationId);
    }
    if (context2.res.statusCode === 426) {
      throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed with status Upgrade Required (426). Please upgrade the client and try again.`, url, "UpgradeRequired" /* UpgradeRequired */, context2.res.statusCode, operationId);
    }
    if (context2.res.statusCode === 429) {
      const retryAfter = context2.res.headers["retry-after"];
      if (retryAfter) {
        this.setDonotMakeRequestsUntil(new Date(Date.now() + parseInt(retryAfter) * 1e3));
        throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because of too many requests (429).`, url, "TooManyRequestsAndRetryAfter" /* TooManyRequestsAndRetryAfter */, context2.res.statusCode, operationId);
      } else {
        throw new UserDataSyncStoreError(`${options3.type} request '${url}' failed because of too many requests (429).`, url, "RemoteTooManyRequests" /* TooManyRequests */, context2.res.statusCode, operationId);
      }
    }
    if (!isSuccess2) {
      throw new UserDataSyncStoreError("Server returned " + context2.res.statusCode, url, "Unknown" /* Unknown */, context2.res.statusCode, operationId);
    }
    return context2;
  }
  addSessionHeaders(headers) {
    let machineSessionId = this.storageService.get(MACHINE_SESSION_ID_KEY, -1 /* APPLICATION */);
    if (machineSessionId === void 0) {
      machineSessionId = generateUuid();
      this.storageService.store(MACHINE_SESSION_ID_KEY, machineSessionId, -1 /* APPLICATION */, 1 /* MACHINE */);
    }
    headers["X-Machine-Session-Id"] = machineSessionId;
    const userSessionId = this.storageService.get(USER_SESSION_ID_KEY, -1 /* APPLICATION */);
    if (userSessionId !== void 0) {
      headers["X-User-Session-Id"] = userSessionId;
    }
  }
};

UserDataSyncStoreClient = __decorateClass([
  __decorateParam(1, IProductService),
  __decorateParam(2, IRequestService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IStorageService)
], UserDataSyncStoreClient);

var UserDataSyncStoreService = class extends UserDataSyncStoreClient {
  constructor(userDataSyncStoreManagementService, productService, requestService, logService, environmentService, fileService, storageService) {
    super(userDataSyncStoreManagementService.userDataSyncStore?.url, productService, requestService, logService, environmentService, fileService, storageService);
    this._register(userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => this.updateUserDataSyncStoreUrl(userDataSyncStoreManagementService.userDataSyncStore?.url)));
  }
};

UserDataSyncStoreService = __decorateClass([
  __decorateParam(0, IUserDataSyncStoreManagementService),
  __decorateParam(1, IProductService),
  __decorateParam(2, IRequestService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IStorageService)
], UserDataSyncStoreService);

var RequestsSession = class {
  constructor(limit, interval, requestService, logService) {
    this.limit = limit;
    this.interval = interval;
    this.requestService = requestService;
    this.logService = logService;
    this.requests = [];
    this.startTime = void 0;
  }
  request(url, options3, token) {
    if (this.isExpired()) {
      this.reset();
    }
    options3.url = url;
    if (this.requests.length >= this.limit) {
      this.logService.info("Too many requests", ...this.requests);
      throw new UserDataSyncStoreError(`Too many requests. Only ${this.limit} requests allowed in ${this.interval / (1e3 * 60)} minutes.`, url, "LocalTooManyRequests" /* LocalTooManyRequests */, void 0, void 0);
    }
    this.startTime = this.startTime || /* @__PURE__ */ new Date();
    this.requests.push(url);
    return this.requestService.request(options3, token);
  }
  isExpired() {
    return this.startTime !== void 0 && (/* @__PURE__ */ new Date()).getTime() - this.startTime.getTime() > this.interval;
  }
  reset() {
    this.requests = [];
    this.startTime = void 0;
  }
};
export { CONFIGURATION_SYNC_STORE_KEY, SYNC_PREVIOUS_STORE, DONOT_MAKE_REQUESTS_UNTIL_KEY, USER_SESSION_ID_KEY, MACHINE_SESSION_ID_KEY, REQUEST_SESSION_LIMIT, REQUEST_SESSION_INTERVAL, AbstractUserDataSyncStoreManagementService, UserDataSyncStoreManagementService, UserDataSyncStoreClient, UserDataSyncStoreService, RequestsSession };
