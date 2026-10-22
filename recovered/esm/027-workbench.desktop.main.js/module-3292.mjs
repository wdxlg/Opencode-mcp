// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalInstanceService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { promiseWithResolvers } from "./module-0036.mjs";
import { TerminalInstance } from "./module-3291.mjs";
import { hasKey } from "./module-0010.mjs";
import { Registry } from "./module-0090.mjs";
import { TerminalExtensions } from "./module-1154.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITerminalInstanceService } from "./module-1149.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalInstanceService.ts
var TerminalInstanceService = class extends Disposable {
  constructor(_instantiationService, _contextKeyService, environmentService) {
    super();
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._backendRegistration = /* @__PURE__ */ new Map();
    this._onDidCreateInstance = this._register(new Emitter());
    this._onDidRegisterBackend = this._register(new Emitter());
    this._terminalShellTypeContextKey = TerminalContextKeys.shellType.bindTo(this._contextKeyService);
    for (const remoteAuthority of [void 0, environmentService.remoteAuthority]) {
      const { promise, resolve: resolve3 } = promiseWithResolvers();
      this._backendRegistration.set(remoteAuthority, { promise, resolve: resolve3 });
    }
  }
  get onDidCreateInstance() {
    return this._onDidCreateInstance.event;
  }
  get onDidRegisterBackend() {
    return this._onDidRegisterBackend.event;
  }
  createInstance(config, target) {
    const shellLaunchConfig = this.convertProfileToShellLaunchConfig(config);
    const instance2 = this._instantiationService.createInstance(TerminalInstance, this._terminalShellTypeContextKey, shellLaunchConfig);
    instance2.target = target;
    this._onDidCreateInstance.fire(instance2);
    return instance2;
  }
  convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd2) {
    if (shellLaunchConfigOrProfile && hasKey(shellLaunchConfigOrProfile, { profileName: true })) {
      const profile = shellLaunchConfigOrProfile;
      if (!profile.path) {
        return shellLaunchConfigOrProfile;
      }
      return {
        executable: profile.path,
        args: profile.args,
        env: profile.env,
        icon: profile.icon,
        color: profile.color,
        name: profile.overrideName ? profile.profileName : void 0,
        cwd: cwd2
      };
    }
    if (shellLaunchConfigOrProfile) {
      if (cwd2) {
        shellLaunchConfigOrProfile.cwd = cwd2;
      }
      return shellLaunchConfigOrProfile;
    }
    return {};
  }
  async getBackend(remoteAuthority) {
    let backend = Registry.as(TerminalExtensions.Backend).getTerminalBackend(remoteAuthority);
    if (!backend) {
      await this._backendRegistration.get(remoteAuthority)?.promise;
      backend = Registry.as(TerminalExtensions.Backend).getTerminalBackend(remoteAuthority);
    }
    return backend;
  }
  getRegisteredBackends() {
    return Registry.as(TerminalExtensions.Backend).backends.values();
  }
  didRegisterBackend(backend) {
    this._backendRegistration.get(backend.remoteAuthority)?.resolve();
    this._onDidRegisterBackend.fire(backend);
  }
};

TerminalInstanceService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IWorkbenchEnvironmentService)
], TerminalInstanceService);

registerSingleton(ITerminalInstanceService, TerminalInstanceService, 1 /* Delayed */);
export { TerminalInstanceService };
