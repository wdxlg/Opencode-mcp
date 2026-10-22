// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalEditorService.ts
import { Disposable, dispose, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { TerminalEditorInput } from "./module-1177.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { getInstanceFromResource } from "./module-2158.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ITerminalInstanceService } from "./module-1149.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalEditorService.ts
var TerminalEditorService = class extends Disposable {
  constructor(_editorService, _editorGroupsService, _terminalInstanceService, _instantiationService, lifecycleService, contextKeyService) {
    super();
    this._editorService = _editorService;
    this._editorGroupsService = _editorGroupsService;
    this._terminalInstanceService = _terminalInstanceService;
    this._instantiationService = _instantiationService;
    this.instances = [];
    this._activeInstanceIndex = -1;
    this._isShuttingDown = false;
    this._editorInputs = /* @__PURE__ */ new Map();
    this._instanceDisposables = /* @__PURE__ */ new Map();
    this._onDidDisposeInstance = this._register(new Emitter());
    this.onDidDisposeInstance = this._onDidDisposeInstance.event;
    this._onDidFocusInstance = this._register(new Emitter());
    this.onDidFocusInstance = this._onDidFocusInstance.event;
    this._onDidChangeInstanceCapability = this._register(new Emitter());
    this.onDidChangeInstanceCapability = this._onDidChangeInstanceCapability.event;
    this._onDidChangeActiveInstance = this._register(new Emitter());
    this.onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;
    this._onDidChangeInstances = this._register(new Emitter());
    this.onDidChangeInstances = this._onDidChangeInstances.event;
    this._terminalEditorActive = TerminalContextKeys.terminalEditorActive.bindTo(contextKeyService);
    this._register(toDisposable(() => {
      for (const d of this._instanceDisposables.values()) {
        dispose(d);
      }
    }));
    this._register(lifecycleService.onWillShutdown(() => this._isShuttingDown = true));
    this._register(this._editorService.onDidActiveEditorChange(() => {
      const activeEditor = this._editorService.activeEditor;
      const instance2 = activeEditor instanceof TerminalEditorInput ? activeEditor?.terminalInstance : void 0;
      const terminalEditorActive = !!instance2 && activeEditor instanceof TerminalEditorInput;
      this._terminalEditorActive.set(terminalEditorActive);
      if (terminalEditorActive) {
        activeEditor?.setGroup(this._editorService.activeEditorPane?.group);
        this.setActiveInstance(instance2);
      } else {
        for (const instance3 of this.instances) {
          instance3.resetFocusContextKey();
        }
      }
    }));
    this._register(this._editorService.onDidVisibleEditorsChange(() => {
      const knownIds = this.instances.map((i2) => i2.instanceId);
      const terminalEditors = this._getActiveTerminalEditors();
      const unknownEditor = terminalEditors.find((input) => {
        const inputId = input instanceof TerminalEditorInput ? input.terminalInstance?.instanceId : void 0;
        if (inputId === void 0) {
          return false;
        }
        return !knownIds.includes(inputId);
      });
      if (unknownEditor instanceof TerminalEditorInput && unknownEditor.terminalInstance) {
        this._editorInputs.set(unknownEditor.terminalInstance.resource.path, unknownEditor);
        this.instances.push(unknownEditor.terminalInstance);
      }
    }));
    this._register(this._editorService.onDidCloseEditor((e) => {
      const instance2 = e.editor instanceof TerminalEditorInput ? e.editor.terminalInstance : void 0;
      if (instance2) {
        const instanceIndex = this.instances.findIndex((e2) => e2 === instance2);
        if (instanceIndex !== -1) {
          const wasActiveInstance = this.instances[instanceIndex] === this.activeInstance;
          this._removeInstance(instance2);
          if (wasActiveInstance) {
            this.setActiveInstance(void 0);
          }
        }
      }
    }));
  }
  _getActiveTerminalEditors() {
    return this._editorService.visibleEditors.filter((e) => e instanceof TerminalEditorInput && e.terminalInstance?.instanceId);
  }
  get activeInstance() {
    if (this.instances.length === 0 || this._activeInstanceIndex === -1) {
      return void 0;
    }
    return this.instances[this._activeInstanceIndex];
  }
  setActiveInstance(instance2) {
    this._activeInstanceIndex = instance2 ? this.instances.findIndex((e) => e === instance2) : -1;
    this._onDidChangeActiveInstance.fire(this.activeInstance);
  }
  async focusInstance(instance2) {
    if (!this.instances.includes(instance2)) {
      return;
    }
    this.setActiveInstance(instance2);
    await this._revealEditor(instance2);
    await instance2.focusWhenReady(true);
  }
  async focusActiveInstance() {
    return this.activeInstance?.focusWhenReady(true);
  }
  async openEditor(instance2, editorOptions2) {
    const resource = this.resolveResource(instance2);
    if (resource) {
      await this._activeOpenEditorRequest?.promise;
      this._activeOpenEditorRequest = {
        instanceId: instance2.instanceId,
        promise: this._editorService.openEditor({
          resource,
          description: instance2.description || instance2.shellLaunchConfig.type,
          options: {
            pinned: true,
            forceReload: true,
            preserveFocus: editorOptions2?.preserveFocus,
            auxiliary: editorOptions2?.auxiliary
          }
        }, editorOptions2?.viewColumn ?? ACTIVE_GROUP)
      };
      await this._activeOpenEditorRequest?.promise;
      this._activeOpenEditorRequest = void 0;
    }
  }
  resolveResource(instance2) {
    const resource = instance2.resource;
    const inputKey = resource.path;
    const cachedEditor = this._editorInputs.get(inputKey);
    if (cachedEditor) {
      return cachedEditor.resource;
    }
    instance2.target = 2 /* Editor */;
    const input = this._instantiationService.createInstance(TerminalEditorInput, resource, instance2);
    this._registerInstance(inputKey, input, instance2);
    return input.resource;
  }
  getInputFromResource(resource) {
    const input = this._editorInputs.get(resource.path);
    if (!input) {
      throw new Error(`Could not get input from resource: ${resource.path}`);
    }
    return input;
  }
  _registerInstance(inputKey, input, instance2) {
    this._editorInputs.set(inputKey, input);
    this._instanceDisposables.set(inputKey, [
      instance2.onDidFocus(this._onDidFocusInstance.fire, this._onDidFocusInstance),
      instance2.onDisposed(this._onDidDisposeInstance.fire, this._onDidDisposeInstance),
      instance2.capabilities.onDidChangeCapabilities(() => this._onDidChangeInstanceCapability.fire(instance2))
    ]);
    this.instances.push(instance2);
    this._onDidChangeInstances.fire();
  }
  _removeInstance(instance2) {
    const inputKey = instance2.resource.path;
    this._editorInputs.delete(inputKey);
    const instanceIndex = this.instances.findIndex((e) => e === instance2);
    if (instanceIndex !== -1) {
      this.instances.splice(instanceIndex, 1);
    }
    const disposables = this._instanceDisposables.get(inputKey);
    this._instanceDisposables.delete(inputKey);
    if (disposables) {
      dispose(disposables);
    }
    this._onDidChangeInstances.fire();
  }
  getInstanceFromResource(resource) {
    return getInstanceFromResource(this.instances, resource);
  }
  async splitInstance(instanceToSplit, shellLaunchConfig = {}) {
    if (instanceToSplit.target === 2 /* Editor */) {
      const group2 = this._editorInputs.get(instanceToSplit.resource.path)?.group;
      if (group2) {
        this._editorGroupsService.activateGroup(group2);
      }
    }
    const instance2 = this._terminalInstanceService.createInstance(shellLaunchConfig, 2 /* Editor */);
    const resource = this.resolveResource(instance2);
    if (resource) {
      await this._editorService.openEditor({
        resource: URI.revive(resource),
        description: instance2.description,
        options: {
          pinned: true,
          forceReload: true
        }
      }, SIDE_GROUP);
    }
    return instance2;
  }
  reviveInput(deserializedInput) {
    const newDeserializedInput = { ...deserializedInput, findRevivedId: true };
    const instance2 = this._terminalInstanceService.createInstance({ attachPersistentProcess: newDeserializedInput }, 2 /* Editor */);
    const input = this._instantiationService.createInstance(TerminalEditorInput, instance2.resource, instance2);
    this._registerInstance(instance2.resource.path, input, instance2);
    return input;
  }
  detachInstance(instance2) {
    const inputKey = instance2.resource.path;
    const editorInput = this._editorInputs.get(inputKey);
    editorInput?.detachInstance();
    this._removeInstance(instance2);
    if (!this._isShuttingDown) {
      editorInput?.dispose();
    }
  }
  async revealActiveEditor(preserveFocus) {
    const instance2 = this.activeInstance;
    if (!instance2) {
      return;
    }
    await this._revealEditor(instance2, preserveFocus);
  }
  async _revealEditor(instance2, preserveFocus) {
    if (this._activeOpenEditorRequest?.instanceId === instance2.instanceId) {
      await this._activeOpenEditorRequest.promise;
      return;
    }
    const editorInput = this._editorInputs.get(instance2.resource.path);
    if (!editorInput) {
      return;
    }
    await this._editorService.openEditor(
      editorInput,
      {
        pinned: true,
        forceReload: true,
        preserveFocus,
        activation: 3 /* PRESERVE */
      }
    );
  }
};

TerminalEditorService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, ITerminalInstanceService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILifecycleService),
  __decorateParam(5, IContextKeyService)
], TerminalEditorService);
export { TerminalEditorService };
