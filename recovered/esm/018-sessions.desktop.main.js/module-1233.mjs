// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/remote/common/remoteSocketFactoryService.ts
import { createDecorator } from "./module-0077.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/platform/remote/common/remoteSocketFactoryService.ts
var IRemoteSocketFactoryService = createDecorator("remoteSocketFactoryService");

var RemoteSocketFactoryService = class {
  constructor() {
    this.factories = {};
  }
  register(type, factory) {
    this.factories[type] ??= [];
    this.factories[type].push(factory);
    return toDisposable(() => {
      const idx = this.factories[type]?.indexOf(factory);
      if (typeof idx === "number" && idx >= 0) {
        this.factories[type]?.splice(idx, 1);
      }
    });
  }
  getSocketFactory(messagePassing) {
    const factories = this.factories[messagePassing.type] || [];
    return factories.find((factory) => factory.supports(messagePassing));
  }
  connect(connectTo, path, query, debugLabel) {
    const socketFactory = this.getSocketFactory(connectTo);
    if (!socketFactory) {
      throw new Error(`No socket factory found for ${connectTo}`);
    }
    return socketFactory.connect(connectTo, path, query, debugLabel);
  }
};
export { IRemoteSocketFactoryService, RemoteSocketFactoryService };
