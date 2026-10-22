// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/meteredConnection/electron-browser/meteredConnectionService.ts
import { AbstractMeteredConnectionService, IMeteredConnectionService, getIsBrowserConnectionMetered } from "./module-1022.mjs";
import { METERED_CONNECTION_CHANNEL } from "./module-3926.mjs";
import { toDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IMainProcessService } from "./module-3825.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/platform/meteredConnection/electron-browser/meteredConnectionService.ts
var NativeMeteredConnectionService = class extends AbstractMeteredConnectionService {
  constructor(connectionMeteredDetector, configurationService, mainProcessService) {
    super(configurationService, connectionMeteredDetector());
    this.connectionMeteredDetector = connectionMeteredDetector;
    this._channel = mainProcessService.getChannel(METERED_CONNECTION_CHANNEL);
    void this._channel.call("SetIsBrowserConnectionMetered" /* SetIsBrowserConnectionMetered */, this.isBrowserConnectionMetered);
    const connection = navigator.connection;
    if (connection) {
      const onChange = () => this.setIsBrowserConnectionMetered(this.connectionMeteredDetector());
      connection.addEventListener("change", onChange);
      this._register(toDisposable(() => connection.removeEventListener("change", onChange)));
    }
  }
  /**
   * Notify the main process about changes to the navigator connection state.
   */
  onChangeBrowserConnection() {
    super.onChangeBrowserConnection();
    this._channel.call("SetIsBrowserConnectionMetered" /* SetIsBrowserConnectionMetered */, this.isBrowserConnectionMetered);
  }
};

NativeMeteredConnectionService = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IMainProcessService)
], NativeMeteredConnectionService);

registerSingleton(IMeteredConnectionService, new SyncDescriptor(NativeMeteredConnectionService, [getIsBrowserConnectionMetered], false));
export { NativeMeteredConnectionService };
