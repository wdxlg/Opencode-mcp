// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadOutputService.ts
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { Extensions15, IOutputService, OUTPUT_VIEW_ID } from "./module-1245.mjs";
import { Event2 } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { Registry } from "./module-0090.mjs";
import { isNumber } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStatusbarService } from "./module-0895.mjs";


// src/vs/workbench/api/browser/mainThreadOutputService.ts
var MainThreadOutputService = class extends Disposable {
  constructor(extHostContext, outputService, viewsService, configurationService, statusbarService) {
    super();
    this._outputStatusItem = this._register(new MutableDisposable());
    this._outputService = outputService;
    this._viewsService = viewsService;
    this._configurationService = configurationService;
    this._statusbarService = statusbarService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostOutputService);
    const setVisibleChannel = () => {
      const visibleChannel = this._viewsService.isViewVisible(OUTPUT_VIEW_ID) ? this._outputService.getActiveChannel() : void 0;
      this._proxy.$setVisibleChannel(visibleChannel ? visibleChannel.id : null);
      this._outputStatusItem.value = void 0;
    };
    this._register(Event2.any(this._outputService.onActiveOutputChannel, Event2.filter(this._viewsService.onDidChangeViewVisibility, ({ id: id2 }) => id2 === OUTPUT_VIEW_ID))(() => setVisibleChannel()));
    setVisibleChannel();
  }
  async $register(label3, file, languageId, extensionId) {
    const idCounter = (MainThreadOutputService._extensionIdPool.get(extensionId) || 0) + 1;
    MainThreadOutputService._extensionIdPool.set(extensionId, idCounter);
    const id2 = `extension-output-${extensionId}-#${idCounter}-${label3}`;
    const resource = URI.revive(file);
    Registry.as(Extensions15.OutputChannels).registerChannel({ id: id2, label: label3, source: { resource }, log: false, languageId, extensionId });
    this._register(toDisposable(() => this.$dispose(id2)));
    return id2;
  }
  async $update(channelId, mode, till) {
    const channel = this._getChannel(channelId);
    if (channel) {
      if (mode === 1 /* Append */) {
        channel.update(mode);
      } else if (isNumber(till)) {
        channel.update(mode, till);
      }
    }
  }
  async $reveal(channelId, preserveFocus) {
    const channel = this._getChannel(channelId);
    if (!channel) {
      return;
    }
    const viewsToShowQuietly = this._configurationService.getValue("workbench.view.showQuietly") ?? {};
    if (!this._viewsService.isViewVisible(OUTPUT_VIEW_ID) && viewsToShowQuietly[OUTPUT_VIEW_ID]) {
      this._showChannelQuietly(channel);
      return;
    }
    this._outputService.showChannel(channel.id, preserveFocus);
  }
  // Show status bar indicator
  _showChannelQuietly(channel) {
    const statusProperties = {
      name: localize(5730, null),
      text: "$(output)",
      ariaLabel: localize(5731, null, channel.label),
      command: `workbench.action.output.show.${channel.id}`,
      tooltip: localize(5732, null, channel.label),
      kind: "prominent"
    };
    if (!this._outputStatusItem.value) {
      this._outputStatusItem.value = this._statusbarService.addEntry(
        statusProperties,
        "status.view.showQuietly",
        1 /* RIGHT */,
        { location: { id: "status.notifications", priority: Number.NEGATIVE_INFINITY }, alignment: 0 /* LEFT */ }
      );
    } else {
      this._outputStatusItem.value.update(statusProperties);
    }
  }
  async $close(channelId) {
    if (this._viewsService.isViewVisible(OUTPUT_VIEW_ID)) {
      const activeChannel = this._outputService.getActiveChannel();
      if (activeChannel && channelId === activeChannel.id) {
        this._viewsService.closeView(OUTPUT_VIEW_ID);
      }
    }
  }
  async $dispose(channelId) {
    const channel = this._getChannel(channelId);
    channel?.dispose();
  }
  _getChannel(channelId) {
    return this._outputService.getChannel(channelId);
  }
};

MainThreadOutputService._extensionIdPool = /* @__PURE__ */ new Map();

MainThreadOutputService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadOutputService),
  __decorateParam(1, IOutputService),
  __decorateParam(2, IViewsService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IStatusbarService)
], MainThreadOutputService);
export { MainThreadOutputService };
