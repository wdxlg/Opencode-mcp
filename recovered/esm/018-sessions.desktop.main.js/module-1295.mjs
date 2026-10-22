// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadUriOpeners.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { ContributedExternalUriOpenersStore } from "./module-1292.mjs";
import { Schemas } from "./module-0033.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { defaultExternalUriOpenerId } from "./module-1291.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExternalUriOpenerService } from "./module-1294.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/api/browser/mainThreadUriOpeners.ts
var MainThreadUriOpeners = class extends Disposable {
  constructor(context2, storageService, externalUriOpenerService, extensionService, openerService, notificationService) {
    super();
    this.extensionService = extensionService;
    this.openerService = openerService;
    this.notificationService = notificationService;
    this._registeredOpeners = /* @__PURE__ */ new Map();
    this.proxy = context2.getProxy(ExtHostContext.ExtHostUriOpeners);
    this._register(externalUriOpenerService.registerExternalOpenerProvider(this));
    this._contributedExternalUriOpenersStore = this._register(new ContributedExternalUriOpenersStore(storageService, extensionService));
  }
  async *getOpeners(targetUri) {
    if (targetUri.scheme !== Schemas.http && targetUri.scheme !== Schemas.https) {
      return;
    }
    await this.extensionService.activateByEvent(`onOpenExternalUri:${targetUri.scheme}`);
    for (const [id2, openerMetadata] of this._registeredOpeners) {
      if (openerMetadata.schemes.has(targetUri.scheme)) {
        yield this.createOpener(id2, openerMetadata);
      }
    }
  }
  createOpener(id2, metadata) {
    return {
      id: id2,
      label: metadata.label,
      canOpen: (uri4, token) => {
        return this.proxy.$canOpenUri(id2, uri4, token);
      },
      openExternalUri: async (uri4, ctx, token) => {
        try {
          await this.proxy.$openUri(id2, { resolvedUri: uri4, sourceUri: ctx.sourceUri }, token);
        } catch (e4) {
          if (!isCancellationError(e4)) {
            const openDefaultAction = new Action("default", localize(5739, null), void 0, void 0, async () => {
              await this.openerService.open(uri4, {
                allowTunneling: false,
                allowContributedOpeners: defaultExternalUriOpenerId
              });
            });
            openDefaultAction.tooltip = uri4.toString();
            this.notificationService.notify({
              severity: Severity2.Error,
              message: localize(5738, null, id2, e4.toString()),
              actions: {
                primary: [
                  openDefaultAction
                ]
              }
            });
          }
        }
        return true;
      }
    };
  }
  async $registerUriOpener(id2, schemes, extensionId, label3) {
    if (this._registeredOpeners.has(id2)) {
      throw new Error(`Opener with id '${id2}' already registered`);
    }
    this._registeredOpeners.set(id2, {
      schemes: new Set(schemes),
      label: label3,
      extensionId
    });
    this._contributedExternalUriOpenersStore.didRegisterOpener(id2, extensionId.value);
  }
  async $unregisterUriOpener(id2) {
    this._registeredOpeners.delete(id2);
    this._contributedExternalUriOpenersStore.delete(id2);
  }
  dispose() {
    super.dispose();
    this._registeredOpeners.clear();
  }
};

MainThreadUriOpeners = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadUriOpeners),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IExternalUriOpenerService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, INotificationService)
], MainThreadUriOpeners);
export { MainThreadUriOpeners };
