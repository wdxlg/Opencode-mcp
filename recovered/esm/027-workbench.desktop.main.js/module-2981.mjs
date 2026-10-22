// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpSamplingService.ts
import { Disposable } from "./module-0012.mjs";
import { Sequencer } from "./module-0036.mjs";
import { McpSamplingLog } from "./module-2980.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { asArray } from "./module-0007.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { isDefined } from "./module-0010.mjs";
import { McpError } from "./module-1206.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Event2 } from "./module-0017.mjs";
import { mapFindFirst } from "./module-0006.mjs";
import { mcpServerSamplingSection } from "./module-1421.mjs";
import { IConfigurationService, getConfigValueInTarget } from "./module-0132.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/mcp/common/mcpSamplingService.ts
var McpSamplingService = class extends Disposable {
  constructor(_languageModelsService, _configurationService, _dialogService, _notificationService, _commandService, instaService) {
    super();
    this._languageModelsService = _languageModelsService;
    this._configurationService = _configurationService;
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._commandService = _commandService;
    this._sessionSets = {
      allowedDuringChat: /* @__PURE__ */ new Map(),
      allowedOutsideChat: /* @__PURE__ */ new Map()
    };
    this._modelSequencer = new Sequencer();
    this._logs = this._register(instaService.createInstance(McpSamplingLog));
  }
  async sample(opts, token = CancellationToken.None) {
    const messages = opts.params.messages.map((message) => {
      const content2 = asArray(message.content).map(
        (part) => part.type === "text" ? { type: "text", value: part.text } : part.type === "image" || part.type === "audio" ? { type: "image_url", value: { mimeType: part.mimeType, data: decodeBase64(part.data) } } : void 0
      ).filter(isDefined);
      if (!content2.length) {
        return void 0;
      }
      return {
        role: message.role === "assistant" ? 2 /* Assistant */ : 1 /* User */,
        content: content2
      };
    }).filter(isDefined);
    if (opts.params.systemPrompt) {
      messages.unshift({ role: 0 /* System */, content: [{ type: "text", value: opts.params.systemPrompt }] });
    }
    const model = await this._modelSequencer.queue(() => this._getMatchingModel(opts));
    const response = await this._languageModelsService.sendChatRequest(model, void 0, messages, {}, token);
    let responseText = "";
    const streaming = (async () => {
      for await (const part of response.stream) {
        if (Array.isArray(part)) {
          for (const p of part) {
            if (p.type === "text") {
              responseText += p.value;
            }
          }
        } else if (part.type === "text") {
          responseText += part.value;
        }
      }
    })();
    try {
      await Promise.all([response.result, streaming]);
      this._logs.add(opts.server, opts.params.messages, responseText, model);
      return {
        sample: {
          model,
          content: { type: "text", text: responseText },
          role: "assistant"
          // it came from the model!
        }
      };
    } catch (err) {
      throw McpError.unknown(err);
    }
  }
  hasLogs(server) {
    return this._logs.has(server);
  }
  getLogText(server) {
    return this._logs.getAsText(server);
  }
  async _getMatchingModel(opts) {
    const model = await this._getMatchingModelInner(opts.server, opts.isDuringToolCall, opts.params.modelPreferences);
    const globalAutoApprove = this._configurationService.getValue("chat.tools.global.autoApprove" /* GlobalAutoApprove */);
    if (model === 0 /* UnsureAllowedDuringChat */) {
      if (globalAutoApprove) {
        this._sessionSets.allowedDuringChat.set(opts.server.definition.id, true);
        return this._getMatchingModel(opts);
      }
      const retry2 = await this._showContextual(
        opts.isDuringToolCall,
        localize(17179, null, opts.server.definition.label),
        localize(17178, null, opts.server.definition.label),
        this.allowButtons(opts.server, "allowedDuringChat")
      );
      if (retry2) {
        return this._getMatchingModel(opts);
      }
      throw McpError.notAllowed();
    } else if (model === 1 /* UnsureAllowedOutsideChat */) {
      if (globalAutoApprove) {
        this._sessionSets.allowedOutsideChat.set(opts.server.definition.id, true);
        return this._getMatchingModel(opts);
      }
      const retry2 = await this._showContextual(
        opts.isDuringToolCall,
        localize(17181, null, opts.server.definition.label),
        localize(17180, null, opts.server.definition.label),
        this.allowButtons(opts.server, "allowedOutsideChat")
      );
      if (retry2) {
        return this._getMatchingModel(opts);
      }
      throw McpError.notAllowed();
    } else if (model === 2 /* NotAllowed */) {
      throw McpError.notAllowed();
    } else if (model === 3 /* NoMatchingModel */) {
      const newlyPickedModels = opts.isDuringToolCall ? await this._commandService.executeCommand("workbench.mcp.configureSamplingModels" /* ConfigureSamplingModels */, opts.server) : await this._notify(
        localize(17182, null, opts.server.definition.label),
        {
          [localize(17173, null)]: () => this._commandService.executeCommand("workbench.mcp.configureSamplingModels" /* ConfigureSamplingModels */, opts.server),
          [localize(17172, null)]: () => Promise.resolve(void 0)
        }
      );
      if (newlyPickedModels) {
        return this._getMatchingModel(opts);
      }
      throw McpError.notAllowed();
    }
    return model;
  }
  allowButtons(server, key3) {
    return {
      [localize(17175, null)]: async () => {
        this._sessionSets[key3].set(server.definition.id, true);
        return true;
      },
      [localize(17174, null)]: async () => {
        await this.updateConfig(server, (c) => c[key3] = true);
        return true;
      },
      [localize(17177, null)]: async () => {
        this._sessionSets[key3].set(server.definition.id, false);
        return false;
      },
      [localize(17176, null)]: async () => {
        await this.updateConfig(server, (c) => c[key3] = false);
        return false;
      }
    };
  }
  async _showContextual(isDuringToolCall, title, message, buttons) {
    if (isDuringToolCall) {
      const result = await this._dialogService.prompt({
        type: "question",
        title,
        message,
        buttons: Object.entries(buttons).map(([label3, run]) => ({ label: label3, run }))
      });
      return await result.result;
    } else {
      return await this._notify(message, buttons);
    }
  }
  async _notify(message, buttons) {
    return await new Promise((resolve3) => {
      const handle2 = this._notificationService.prompt(
        Severity2.Info,
        message,
        Object.entries(buttons).map(([label3, action]) => ({
          label: label3,
          run: () => resolve3(action())
        }))
      );
      Event2.once(handle2.onDidClose)(() => resolve3(void 0));
    });
  }
  /**
   * Gets the matching model for the MCP server in this context, or
   * a reason why no model could be selected.
   */
  async _getMatchingModelInner(server, isDuringToolCall, preferences) {
    const config = this.getConfig(server);
    if (isDuringToolCall && !config.allowedDuringChat && !this._sessionSets.allowedDuringChat.has(server.definition.id)) {
      return config.allowedDuringChat === void 0 ? 0 /* UnsureAllowedDuringChat */ : 2 /* NotAllowed */;
    } else if (!isDuringToolCall && !config.allowedOutsideChat && !this._sessionSets.allowedOutsideChat.has(server.definition.id)) {
      return config.allowedOutsideChat === void 0 ? 1 /* UnsureAllowedOutsideChat */ : 2 /* NotAllowed */;
    }
    const foundModelIds = config.allowedModels?.filter((m) => !!this._languageModelsService.lookupLanguageModel(m)) || this._getDefaultModels();
    if (!foundModelIds.length) {
      return 3 /* NoMatchingModel */;
    }
    if (preferences?.hints) {
      const found = mapFindFirst(preferences.hints, (hint) => foundModelIds.find((model) => model.toLowerCase().includes(hint.name.toLowerCase())));
      if (found) {
        return found;
      }
    }
    return foundModelIds[0];
  }
  _getDefaultModels() {
    const candidates = this._languageModelsService.getLanguageModelIds().map((m) => {
      const model = this._languageModelsService.lookupLanguageModel(m);
      return model && !model.multiplierNumeric && !model.targetChatSessionType ? { model, id: m } : void 0;
    }).filter(isDefined);
    const someDefault = candidates.findIndex((c) => Object.values(c.model.isDefaultForLocation).some(Boolean));
    if (someDefault !== -1) {
      [candidates[0], candidates[someDefault]] = [candidates[someDefault], candidates[0]];
    }
    return candidates.map((c) => c.id);
  }
  _configKey(server) {
    return `${server.collection.label}: ${server.definition.label}`;
  }
  getConfig(server) {
    return this._getConfig(server).value || {};
  }
  /**
   * _getConfig reads the sampling config reads the `{ server: data }` mapping
   * from the appropriate config. We read from the most specific possible
   * config up to the default configuration location that the MCP server itself
   * is defined in. We don't go further because then workspace-specific servers
   * would get in the user settings which is not meaningful and could lead
   * to confusion.
   *
   * todo@connor4312: generalize this for other esttings when we have them
   */
  _getConfig(server) {
    const def2 = server.readDefinitions().get();
    const mostSpecificConfig = 8 /* MEMORY */;
    const leastSpecificConfig = def2.collection?.configTarget || 2 /* USER */;
    const key3 = this._configKey(server);
    const resource = def2.collection?.presentation?.origin;
    const configValue = this._configurationService.inspect(mcpServerSamplingSection, { resource });
    for (let target = mostSpecificConfig; target >= leastSpecificConfig; target--) {
      const mapping2 = getConfigValueInTarget(configValue, target);
      const config = mapping2?.[key3];
      if (config) {
        return { value: config, key: key3, mapping: mapping2, target, resource };
      }
    }
    return { value: void 0, mapping: getConfigValueInTarget(configValue, leastSpecificConfig), key: key3, target: leastSpecificConfig, resource };
  }
  async updateConfig(server, mutate) {
    const { value: value2, mapping: mapping2, key: key3, target, resource } = this._getConfig(server);
    const newConfig = { ...value2 };
    mutate(newConfig);
    await this._configurationService.updateValue(
      mcpServerSamplingSection,
      { ...mapping2, [key3]: newConfig },
      { resource },
      target
    );
    return newConfig;
  }
};

McpSamplingService = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IInstantiationService)
], McpSamplingService);
export { McpSamplingService };
