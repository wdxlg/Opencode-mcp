// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/ipc/electron-browser/services.ts
import { SyncDescriptor } from "./module-0134.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3825.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/ipc/electron-browser/services.ts
var RemoteServiceStub = class {
  constructor(channelName, options3, remote, instantiationService) {
    const channel = remote.getChannel(channelName);
    if (isRemoteServiceWithChannelClientOptions(options3)) {
      return instantiationService.createInstance(new SyncDescriptor(options3.channelClientCtor, [channel]));
    }
    return ProxyChannel.toService(channel, options3?.proxyOptions);
  }
};

function isRemoteServiceWithChannelClientOptions(obj) {
  const candidate = obj;
  return !!candidate?.channelClientCtor;
}

var MainProcessRemoteServiceStub = class extends RemoteServiceStub {
  constructor(channelName, options3, ipcService, instantiationService) {
    super(channelName, options3, ipcService, instantiationService);
  }
};

MainProcessRemoteServiceStub = __decorateClass([
  __decorateParam(2, IMainProcessService),
  __decorateParam(3, IInstantiationService)
], MainProcessRemoteServiceStub);

function registerMainProcessRemoteService(id2, channelName, options3) {
  registerSingleton(id2, new SyncDescriptor(MainProcessRemoteServiceStub, [channelName, options3], true));
}

var ISharedProcessService = createDecorator("sharedProcessService");

var SharedProcessRemoteServiceStub = class extends RemoteServiceStub {
  constructor(channelName, options3, ipcService, instantiationService) {
    super(channelName, options3, ipcService, instantiationService);
  }
};

SharedProcessRemoteServiceStub = __decorateClass([
  __decorateParam(2, ISharedProcessService),
  __decorateParam(3, IInstantiationService)
], SharedProcessRemoteServiceStub);

function registerSharedProcessRemoteService(id2, channelName, options3) {
  registerSingleton(id2, new SyncDescriptor(SharedProcessRemoteServiceStub, [channelName, options3], true));
}
export { isRemoteServiceWithChannelClientOptions, registerMainProcessRemoteService, registerSharedProcessRemoteService, RemoteServiceStub, MainProcessRemoteServiceStub, ISharedProcessService, SharedProcessRemoteServiceStub };
