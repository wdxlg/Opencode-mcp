// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/customizationHarnessService.ts
import { createDecorator } from "./module-0077.mjs";
import { AICustomizationManagementSection, BUILTIN_STORAGE } from "./module-0995.mjs";
import { Codicon } from "./module-0085.mjs";
import { SessionType } from "./module-0960.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { AGENT_MD_FILENAME } from "./module-0996.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { LocalChatSessionUri, getChatSessionType } from "./module-0961.mjs";
import { matchesSessionType } from "./module-0986.mjs";
import { getCanonicalPluginCommandId } from "./module-1016.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { CustomAgent } from "./module-1030.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/common/customizationHarnessService.ts
var ICustomizationHarnessService = createDecorator("customizationHarnessService");

function isPluginCustomizationItem(item) {
  return item.type === "plugin" || item.type === AICustomizationManagementSection.Plugins;
}

var EMPTY_DESCRIPTOR = {
  id: "",
  label: "",
  icon: Codicon.sparkle
};

function createVSCodeHarnessDescriptor() {
  return {
    id: SessionType.Local,
    label: localize(12946, null),
    icon: ThemeIcon.fromId(Codicon.vm.id),
    supportsTroubleshoot: true,
    hiddenSections: [AICustomizationManagementSection.Tools],
    sectionOverrides: /* @__PURE__ */ new Map([
      [AICustomizationManagementSection.Instructions, {
        rootFileShortcuts: [AGENT_MD_FILENAME]
      }]
    ])
  };
}

var CustomizationHarnessServiceBase = class {
  constructor(staticHarnesses, defaultHarness, promptsService) {
    this.promptsService = promptsService;
    this._onDidChangeSlashCommands = new Emitter();
    this.onDidChangeSlashCommands = this._onDidChangeSlashCommands.event;
    this._onDidChangeCustomAgents = new Emitter();
    this.onDidChangeCustomAgents = this._onDidChangeCustomAgents.event;
    this._providerListeners = [];
    this._isDisposed = false;
    this._externalHarnesses = [];
    this._staticHarnesses = staticHarnesses;
    this.promptsService = promptsService;
    this._activeSessionResource = observableValue(this, this.getSessionResourceForHarness(defaultHarness));
    this.activeSessionResource = this._activeSessionResource;
    this._activeHarness = derived(this, (reader) => getChatSessionType(this._activeSessionResource.read(reader)));
    this.activeHarness = this._activeHarness;
    this._availableHarnesses = observableValue(this, [...this._staticHarnesses]);
    this.availableHarnesses = this._availableHarnesses;
    this._rebindProviderListeners();
  }
  _getAllHarnesses() {
    const externalIds = new Set(this._externalHarnesses.map((h3) => h3.id));
    return [
      ...this._staticHarnesses.filter((h3) => !externalIds.has(h3.id)),
      ...this._externalHarnesses
    ];
  }
  _refreshAvailableHarnesses() {
    if (this._isDisposed) {
      return;
    }
    this._availableHarnesses.set(this._getAllHarnesses(), void 0);
    this._rebindProviderListeners();
  }
  _rebindProviderListeners() {
    for (const listener of this._providerListeners) {
      listener.dispose();
    }
    this._providerListeners.length = 0;
    for (const harness of this._getAllHarnesses()) {
      const provider = harness.itemProvider;
      if (!provider) {
        this._providerListeners.push(this.promptsService.onDidChangeSlashCommands(() => this._onDidChangeSlashCommands.fire({ sessionType: harness.id })));
        this._providerListeners.push(this.promptsService.onDidChangeCustomAgents(() => this._onDidChangeCustomAgents.fire({ sessionType: harness.id })));
      } else {
        this._providerListeners.push(provider.onDidChange(() => this._onDidChangeSlashCommands.fire({ sessionType: harness.id })));
        this._providerListeners.push(provider.onDidChange(() => this._onDidChangeCustomAgents.fire({ sessionType: harness.id })));
      }
    }
  }
  dispose() {
    this._isDisposed = true;
    for (const listener of this._providerListeners) {
      listener.dispose();
    }
    this._providerListeners.length = 0;
    this._onDidChangeSlashCommands.dispose();
    this._onDidChangeCustomAgents.dispose();
  }
  registerExternalHarness(descriptor) {
    this._externalHarnesses.push(descriptor);
    this._refreshAvailableHarnesses();
    return {
      dispose: () => {
        if (this._isDisposed) {
          return;
        }
        const idx = this._externalHarnesses.indexOf(descriptor);
        if (idx >= 0) {
          this._externalHarnesses.splice(idx, 1);
          this._refreshAvailableHarnesses();
        }
      }
    };
  }
  findHarnessById(id2) {
    return this._getAllHarnesses().find((h3) => h3.id === id2);
  }
  setActiveSession(sessionResource) {
    this._activeSessionResource.set(sessionResource, void 0);
  }
  getActiveDescriptor() {
    const activeId = this._activeHarness.get();
    const descriptor = this.findHarnessById(activeId);
    return descriptor ?? EMPTY_DESCRIPTOR;
  }
  async getSlashCommands(sessionResource, token) {
    const sessionType = getChatSessionType(sessionResource);
    const harness = this.findHarnessById(sessionType);
    if (!harness || !harness.itemProvider) {
      const commands = await this.promptsService.getPromptSlashCommands(token);
      return commands.filter((command4) => matchesSessionType(command4.sessionTypes, sessionType));
    }
    const items = await harness.itemProvider.provideChatSessionCustomizations(sessionResource, token);
    if (!items) {
      return [];
    }
    const result = [];
    for (const item of items) {
      if (item.enabled !== false && (item.type === "prompt" /* prompt */ || item.type === "skill" /* skill */)) {
        const storage = item.source;
        const narrowStorage = storage !== void 0 && storage !== BUILTIN_STORAGE ? storage : "local" /* local */;
        result.push({
          uri: item.uri,
          type: item.type,
          name: item.pluginUri ? getCanonicalPluginCommandId({ uri: item.pluginUri, label: item.pluginLabel }, item.name) : item.name,
          description: item.description,
          userInvocable: item.userInvocable ?? true,
          storage: narrowStorage,
          sessionTypes: [sessionType]
        });
      }
    }
    return result;
  }
  async getCustomAgents(sessionResource, token) {
    const sessionType = getChatSessionType(sessionResource);
    const harness = this.findHarnessById(sessionType);
    if (!harness || !harness.itemProvider) {
      const allAgents = await this.promptsService.getCustomAgents(token);
      return allAgents.filter((agent) => matchesSessionType(agent.sessionTypes, sessionType));
    }
    if (harness.itemProvider.provideCustomAgents) {
      return harness.itemProvider.provideCustomAgents(sessionResource, token);
    }
    const items = await harness.itemProvider.provideChatSessionCustomizations(sessionResource, token);
    if (!items || token.isCancellationRequested) {
      return [];
    }
    const getSource = (item) => {
      if (item.source === "extension" /* extension */ && item.extensionId) {
        return { storage: "extension" /* extension */, extensionId: new ExtensionIdentifier(item.extensionId) };
      } else if (item.source === "plugin" /* plugin */ && item.pluginUri) {
        return { storage: "plugin" /* plugin */, pluginUri: item.pluginUri };
      } else if (item.source === "user" /* user */) {
        return { storage: "user" /* user */ };
      }
      return { storage: "local" /* local */ };
    };
    const result = [];
    for (const item of items) {
      if (item.type === "agent" /* agent */) {
        const promptFile = await this.promptsService.parseNew(item.uri, token);
        const extra = {
          name: item.name,
          description: item.description,
          sessionTypes: [sessionType],
          hooks: void 0,
          source: getSource(item),
          type: "agent" /* agent */,
          enabled: item.enabled !== false
        };
        result.push(CustomAgent.fromParsedPromptFile(promptFile, extra));
      }
    }
    return result;
  }
  async resolvePromptSlashCommand(name, sessionResource, token) {
    const commands = await this.getSlashCommands(sessionResource, token);
    const command4 = commands.find((cmd) => cmd.name === name);
    if (command4) {
      const parsedPromptFile = await this.promptsService.parseNew(command4.uri, token);
      return {
        ...command4,
        userInvocable: parsedPromptFile.header?.userInvocable ?? command4.userInvocable,
        parsedPromptFile
      };
    }
    return void 0;
  }
  getSessionResourceForHarness(sessionType) {
    if (sessionType === SessionType.Local) {
      return LocalChatSessionUri.getNewSessionUri();
    }
    return URI.from({ scheme: sessionType, path: "/untitled-2" });
  }
};
export { isPluginCustomizationItem, createVSCodeHarnessDescriptor, ICustomizationHarnessService, EMPTY_DESCRIPTOR, CustomizationHarnessServiceBase };
