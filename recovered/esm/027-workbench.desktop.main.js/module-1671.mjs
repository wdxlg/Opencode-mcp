// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/commands/common/commandService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { notCancellablePromise, raceCancellablePromises, timeout } from "./module-0036.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/commands/common/commandService.ts
var CommandService = class extends Disposable {
  constructor(_instantiationService, _extensionService, _logService) {
    super();
    this._instantiationService = _instantiationService;
    this._extensionService = _extensionService;
    this._logService = _logService;
    this._extensionHostIsReady = false;
    this._onWillExecuteCommand = this._register(new Emitter());
    this.onWillExecuteCommand = this._onWillExecuteCommand.event;
    this._onDidExecuteCommand = this._register(new Emitter());
    this.onDidExecuteCommand = this._onDidExecuteCommand.event;
    this._extensionService.whenInstalledExtensionsRegistered().then((value2) => this._extensionHostIsReady = value2);
    this._starActivation = null;
  }
  _activateStar() {
    if (!this._starActivation) {
      this._starActivation = raceCancellablePromises([
        this._extensionService.activateByEvent(`*`),
        timeout(3e4)
      ]);
    }
    return notCancellablePromise(this._starActivation);
  }
  async executeCommand(id2, ...args2) {
    this._logService.trace("CommandService#executeCommand", id2);
    const activationEvent = `onCommand:${id2}`;
    const commandIsRegistered = !!CommandsRegistry.getCommand(id2);
    if (commandIsRegistered) {
      if (this._extensionService.activationEventIsDone(activationEvent)) {
        return this._tryExecuteCommand(id2, args2);
      }
      if (!this._extensionHostIsReady) {
        this._extensionService.activateByEvent(activationEvent);
        return this._tryExecuteCommand(id2, args2);
      }
      await this._extensionService.activateByEvent(activationEvent);
      return this._tryExecuteCommand(id2, args2);
    }
    await Promise.all([
      this._extensionService.activateByEvent(activationEvent),
      raceCancellablePromises([
        // race * activation against command registration
        this._activateStar(),
        Event2.toPromise(Event2.filter(CommandsRegistry.onDidRegisterCommand, (e) => e === id2))
      ])
    ]);
    return this._tryExecuteCommand(id2, args2);
  }
  _tryExecuteCommand(id2, args2) {
    const command4 = CommandsRegistry.getCommand(id2);
    if (!command4) {
      return Promise.reject(new Error(`command '${id2}' not found`));
    }
    try {
      this._onWillExecuteCommand.fire({ commandId: id2, args: args2 });
      const result = this._instantiationService.invokeFunction(command4.handler, ...args2);
      this._onDidExecuteCommand.fire({ commandId: id2, args: args2 });
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  dispose() {
    super.dispose();
    this._starActivation?.cancel();
  }
};

CommandService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, ILogService)
], CommandService);

registerSingleton(ICommandService, CommandService, 1 /* Delayed */);
export { CommandService };
