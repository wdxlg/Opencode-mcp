// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDataChannels.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { autorun } from "./module-0052.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IDataChannelService, ILinkPresentationService, parseLinkPresentation } from "./module-0708.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/workbench/api/browser/mainThreadDataChannels.ts
var MainThreadDataChannels = class extends Disposable {
  constructor(extHostContext, _dataChannelService, _linkPresentationService) {
    super();
    this._dataChannelService = _dataChannelService;
    this._linkPresentationService = _linkPresentationService;
    this._linkPresentationWatchers = this._register(new DisposableMap());
    this._linkPresentationProviders = this._register(new DisposableMap());
    this._providedLinkPresentationWatchers = this._register(new DisposableMap());
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDataChannels);
    this._register(this._dataChannelService.onDidSendData((e4) => {
      this._proxy.$onDidReceiveData(e4.channelId, e4.data);
    }));
    const updateLinkPresentationRules = () => this._proxy.$acceptLinkPresentationRules(
      this._linkPresentationService.linkPresentationRules.map((rule) => ({
        id: rule.id,
        source: rule.uriPattern.source,
        flags: rule.uriPattern.flags,
        kind: rule.kind
      }))
    );
    updateLinkPresentationRules();
    this._register(this._linkPresentationService.onDidChangeLinkPresentationRules(updateLinkPresentationRules));
  }
  $createLinkPresentationWatcher(handle2, providerId, kind, resource) {
    const watcher = this._linkPresentationService.createLinkPresentationWatcher(providerId, URI.revive(resource));
    if (!watcher) {
      this._proxy.$acceptLinkPresentation(handle2, {
        kind,
        status: { kind: "error", label: localize(5677, null) },
        tooltip: localize(5676, null),
        ariaLabel: localize(5678, null)
      });
      return;
    }
    const store = new DisposableStore();
    store.add(autorun((reader) => {
      const presentation2 = watcher.presentation.read(reader);
      if (presentation2) {
        this._proxy.$acceptLinkPresentation(handle2, presentation2);
      }
    }));
    store.add(watcher);
    this._linkPresentationWatchers.set(handle2, store);
  }
  $disposeLinkPresentationWatcher(handle2) {
    this._linkPresentationWatchers.deleteAndDispose(handle2);
  }
  $registerLinkPresentationProvider(handle2, extensionId, providerId) {
    const provider = {
      createLinkPresentationWatcher: (resource) => this._createExtensionLinkPresentationWatcher(handle2, resource)
    };
    this._linkPresentationProviders.set(
      handle2,
      this._linkPresentationService.registerExtensionLinkPresentationProvider(extensionId, providerId, provider)
    );
  }
  $unregisterLinkPresentationProvider(handle2) {
    this._linkPresentationProviders.deleteAndDispose(handle2);
  }
  $acceptLinkPresentationProviderData(handle2, data) {
    this._providedLinkPresentationWatchers.get(handle2)?.acceptPresentation(data);
  }
  _createExtensionLinkPresentationWatcher(providerHandle, resource) {
    const handle2 = MainThreadDataChannels._providedLinkPresentationWatcherHandlePool++;
    const watcher = new MainThreadExtensionLinkPresentationWatcher(() => {
      this._providedLinkPresentationWatchers.deleteAndLeak(handle2);
      this._proxy.$disposeLinkPresentationWatcher(handle2);
    });
    this._providedLinkPresentationWatchers.set(handle2, watcher);
    void this._proxy.$createLinkPresentationWatcher(handle2, providerHandle, resource).then(
      (data) => watcher.initializePresentation(data),
      (error) => {
        onUnexpectedError(error);
        watcher.initializePresentation({
          kind: "resource",
          status: { kind: "error", label: localize(5677, null) },
          tooltip: localize(5679, null),
          ariaLabel: localize(5678, null)
        });
      }
    );
    return watcher;
  }
};

MainThreadDataChannels._providedLinkPresentationWatcherHandlePool = 0;

MainThreadDataChannels = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDataChannels),
  __decorateParam(1, IDataChannelService),
  __decorateParam(2, ILinkPresentationService)
], MainThreadDataChannels);

var MainThreadExtensionLinkPresentationWatcher = class extends Disposable {
  constructor(_onDispose) {
    super();
    this._onDispose = _onDispose;
    this._presentation = observableValue(this, void 0);
    this.presentation = this._presentation;
    this._isDisposed = false;
  }
  acceptPresentation(data) {
    if (!this._isDisposed) {
      this._presentation.set(parseLinkPresentation(data), void 0);
    }
  }
  initializePresentation(data) {
    if (!this._isDisposed && !this._presentation.get()) {
      this.acceptPresentation(data);
    }
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    super.dispose();
    this._onDispose();
  }
};
export { MainThreadDataChannels, MainThreadExtensionLinkPresentationWatcher };
