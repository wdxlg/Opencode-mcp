// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userData/browser/userDataInit.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { mark } from "./module-0506.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { isWeb } from "./module-0014.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/services/userData/browser/userDataInit.ts
var IUserDataInitializationService = createDecorator("IUserDataInitializationService");

var UserDataInitializationService = class {
  constructor(initializers = []) {
    this.initializers = initializers;
  }
  async whenInitializationFinished() {
    if (await this.requiresInitialization()) {
      await Promise.all(this.initializers.map((initializer) => initializer.whenInitializationFinished()));
    }
  }
  async requiresInitialization() {
    return (await Promise.all(this.initializers.map((initializer) => initializer.requiresInitialization()))).some((result) => result);
  }
  async initializeRequiredResources() {
    if (await this.requiresInitialization()) {
      await Promise.all(this.initializers.map((initializer) => initializer.initializeRequiredResources()));
    }
  }
  async initializeOtherResources(instantiationService) {
    if (await this.requiresInitialization()) {
      await Promise.all(this.initializers.map((initializer) => initializer.initializeOtherResources(instantiationService)));
    }
  }
  async initializeInstalledExtensions(instantiationService) {
    if (await this.requiresInitialization()) {
      await Promise.all(this.initializers.map((initializer) => initializer.initializeInstalledExtensions(instantiationService)));
    }
  }
};

var InitializeOtherResourcesContribution = class {
  constructor(userDataInitializeService, instantiationService, extensionService) {
    extensionService.whenInstalledExtensionsRegistered().then(() => this.initializeOtherResource(userDataInitializeService, instantiationService));
  }
  async initializeOtherResource(userDataInitializeService, instantiationService) {
    if (await userDataInitializeService.requiresInitialization()) {
      mark("code/willInitOtherUserData");
      await userDataInitializeService.initializeOtherResources(instantiationService);
      mark("code/didInitOtherUserData");
    }
  }
};

InitializeOtherResourcesContribution = __decorateClass([
  __decorateParam(0, IUserDataInitializationService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IExtensionService)
], InitializeOtherResourcesContribution);

if (isWeb) {
  const workbenchRegistry14 = Registry.as(Extensions10.Workbench);
  workbenchRegistry14.registerWorkbenchContribution(InitializeOtherResourcesContribution, 3 /* Restored */);
}
export { IUserDataInitializationService, UserDataInitializationService, InitializeOtherResourcesContribution };
